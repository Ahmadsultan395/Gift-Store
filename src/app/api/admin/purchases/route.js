import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import Product from "@/models/Product";
import Supplier from "@/models/Supplier";
import { StockHistory } from "@/models/index";
import { ok, created, fail, serverError } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page     = parseInt(searchParams.get("page")  || "1");
    const limit    = parseInt(searchParams.get("limit") || "20");
    const supplier = searchParams.get("supplier") || "";
    const from     = searchParams.get("from")     || "";
    const to       = searchParams.get("to")       || "";

    const query = {};
    if (supplier) query.supplier = supplier;
    if (from || to) {
      query.purchaseDate = {};
      if (from) query.purchaseDate.$gte = new Date(from);
      if (to)   query.purchaseDate.$lte = new Date(to + "T23:59:59");
    }

    const total = await Purchase.countDocuments(query);
    const purchases = await Purchase.find(query)
      .populate("supplier", "name phone")
      .populate("items.product", "name sku")
      .populate("createdBy", "name")
      .sort({ purchaseDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Summary stats
    const [stats] = await Purchase.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount:   { $sum: "$grandTotal" },
          totalPurchases:{ $sum: 1 },
          totalItems: {
            $sum: { $reduce: { input: "$items", initialValue: 0, in: { $add: ["$$value", "$$this.quantity"] } } }
          },
        },
      },
    ]);

    return ok({
      purchases,
      stats: stats || { totalAmount: 0, totalPurchases: 0, totalItems: 0 },
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (e) { return serverError(e); }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { supplier, invoiceNumber, items, tax = 0, discount = 0, amountPaid = 0, purchaseDate, notes } = body;

    if (!supplier)       return fail("Supplier is required");
    if (!invoiceNumber)  return fail("Invoice number is required");
    if (!items?.length)  return fail("At least one product is required");

    // Check invoice uniqueness
    const exists = await Purchase.findOne({ invoiceNumber });
    if (exists) return fail("Invoice number already exists");

    // Validate products + compute totals
    let subTotal = 0;
    const enrichedItems = [];

    for (const item of items) {
      if (!item.product || !item.quantity || !item.purchasePrice) {
        return fail("Each item needs product, quantity, and purchase price");
      }
      const product = await Product.findById(item.product);
      if (!product) return fail(`Product not found: ${item.product}`);

      const itemTax      = item.tax      || 0;
      const itemDiscount = item.discount || 0;
      const total = (item.quantity * item.purchasePrice) + itemTax - itemDiscount;

      subTotal += total;
      enrichedItems.push({ ...item, total });
    }

    const grandTotal = subTotal + tax - discount;
    const paymentStatus =
      amountPaid >= grandTotal ? "paid" :
      amountPaid > 0           ? "partial" :
                                 "unpaid";

    // Create purchase record
    const userId = request.headers.get("x-user-id");
    const purchase = await Purchase.create({
      invoiceNumber,
      supplier,
      items:         enrichedItems,
      subTotal,
      tax,
      discount,
      grandTotal,
      amountPaid,
      paymentStatus,
      purchaseDate:  purchaseDate || new Date(),
      createdBy:     userId || undefined,
      notes,
    });

    // ── Auto-increase stock for each item ────────────────────────────
    for (const item of enrichedItems) {
      const product = await Product.findById(item.product);
      const newStock = product.stock + item.quantity;
      product.stock = newStock;
      await product.save();

      await StockHistory.create({
        product:        product._id,
        type:           "purchase",
        quantityChange: item.quantity,
        stockAfter:     newStock,
        reference:      invoiceNumber,
        note:           "Stock added via purchase bill",
        createdBy:      userId || undefined,
      });
    }

    // Update supplier outstanding balance
    const outstanding = grandTotal - amountPaid;
    if (outstanding > 0) {
      await Supplier.findByIdAndUpdate(supplier, {
        $inc: {
          outstandingBalance:   outstanding,
          totalPurchaseAmount:  grandTotal,
        },
      });
    } else {
      await Supplier.findByIdAndUpdate(supplier, {
        $inc: { totalPurchaseAmount: grandTotal },
      });
    }

    await purchase.populate([
      { path: "supplier", select: "name phone" },
      { path: "items.product", select: "name sku" },
    ]);

    return created(purchase, "Purchase bill created. Stock updated.");
  } catch (e) { return serverError(e); }
}
