import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import { StockHistory, Notification } from "@/models/index";
import { ok, created, fail, serverError } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const query = {};

    if (status) {
      query.paymentStatus = status;
    }

    if (search.trim()) {
      const customers = await Customer.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      query.$or = [
        {
          invoiceNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          customer: {
            $in: customers.map((c) => c._id),
          },
        },
      ];
    }

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .populate("customer", "name phone")
      .populate("cashier", "name")
      .sort({ saleDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return ok({
      sales,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      customer,
      items,
      tax = 0,
      discount = 0,
      amountPaid = 0,
      paymentMethod = "cash",
      note,
    } = body;

    if (!items?.length) return fail("Cart is empty");

    const invoiceNumber = `POS-${Date.now()}`;
    let subTotal = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return fail(`Product not found: ${item.product}`);

      // Support decimal quantities (e.g. 0.25 kg, 0.5 litre)
      const qty = parseFloat(item.quantity);
      if (isNaN(qty) || qty <= 0)
        return fail(`Invalid quantity for "${product.name}"`);

      // Check stock (supports decimal comparison)
      if (product.stock < qty) {
        return fail(
          `Insufficient stock for "${product.name}". Available: ${product.stock} ${product.unit}`,
        );
      }

      const itemTotal = item.price * qty - (item.discount || 0);
      subTotal += itemTotal;

      enrichedItems.push({
        product: product._id,
        name: product.name,
        quantity: qty,
        unit: product.unit || "pcs",
        price: item.price,
        discount: item.discount || 0,
        total: itemTotal,
      });
    }

    const grandTotal = subTotal + Number(tax) - Number(discount);
    const paid = Number(amountPaid);
    const changeReturned = Math.max(0, paid - grandTotal);
    const balanceDue = Math.max(0, grandTotal - paid);
    const paymentStatus =
      paid >= grandTotal ? "paid" : paid > 0 ? "partial" : "unpaid";
    const userId = request.headers.get("x-user-id");

    // Build payment history
    const paymentHistory =
      paid > 0
        ? [
            {
              amount: Math.min(paid, grandTotal),
              method: paymentMethod,
              note: note || "Initial payment",
              paidAt: new Date(),
            },
          ]
        : [];

    const sale = await Sale.create({
      invoiceNumber,
      customer: customer || undefined,
      items: enrichedItems,
      subTotal,
      tax: Number(tax),
      discount: Number(discount),
      grandTotal,
      amountPaid: Math.min(paid, grandTotal),
      changeReturned,
      balanceDue,
      paymentMethod,
      paymentStatus,
      paymentHistory,
      source: "pos",
      cashier: userId || undefined,
      saleDate: new Date(),
    });

    // ── Auto-decrease stock (supports decimal) ──────────────────
    for (const item of enrichedItems) {
      const product = await Product.findById(item.product);
      // Round to 4 decimal places to avoid floating point issues
      const newStock =
        Math.round((product.stock - item.quantity) * 10000) / 10000;
      product.stock = newStock;
      product.totalSold = (product.totalSold || 0) + item.quantity;
      await product.save();

      await StockHistory.create({
        product: product._id,
        type: "sale",
        quantityChange: -item.quantity,
        stockAfter: newStock,
        reference: invoiceNumber,
        note: `POS Sale — ${item.quantity} ${item.unit}`,
        createdBy: userId || undefined,
      });

      // Auto notifications
      if (newStock <= 0) {
        await Notification.create({
          type: "out_of_stock",
          title: "Out of Stock",
          message: `${product.name} is now out of stock.`,
          relatedId: product._id,
        });
      } else if (newStock <= product.lowStockThreshold) {
        await Notification.create({
          type: "low_stock",
          title: "Low Stock Alert",
          message: `${product.name} has only ${newStock} ${product.unit} left.`,
          relatedId: product._id,
        });
      }
    }

    // Update customer spending
    if (customer) {
      await Customer.findByIdAndUpdate(customer, {
        $inc: { totalOrders: 1, totalSpending: grandTotal },
      });
    }

    await sale.populate([{ path: "customer", select: "name phone" }]);

    return created(
      {
        sale,
        invoiceNumber,
        grandTotal,
        changeReturned,
        balanceDue,
        paymentStatus,
      },
      paymentStatus === "paid"
        ? "Sale completed!"
        : `Sale saved. Balance due: PKR ${balanceDue}`,
    );
  } catch (e) {
    return serverError(e);
  }
}
