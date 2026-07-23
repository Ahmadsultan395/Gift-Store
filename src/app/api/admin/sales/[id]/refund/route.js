import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import { StockHistory, Expense } from "@/models/index";
import { ok, notFound, fail, serverError } from "@/lib/apiResponse";

export async function POST(request, { params }) {
  try {
    await connectDB();
    const {
      amount,
      reason = "Customer return",
      restoreStock = true,
    } = await request.json();

    const sale = await Sale.findById(params.id).populate("items.product");
    if (!sale) return notFound("Sale not found");

    // ── Initialize refundedAmount if old document ───────────────
    if (typeof sale.refundedAmount !== "number") {
      sale.refundedAmount = 0;
    }

    const amountPaid = sale.amountPaid || 0;
    const alreadyRefunded = sale.refundedAmount || 0;
    const maxRefundable = amountPaid - alreadyRefunded;

    // ── Block: fully refunded already ──────────────────────────
    if (sale.isRefunded || maxRefundable <= 0) {
      return fail(
        `This sale has already been fully refunded. ` +
          `Total paid: PKR ${amountPaid.toFixed(2)}, ` +
          `Already refunded: PKR ${alreadyRefunded.toFixed(2)}`,
      );
    }

    // ── Block: nothing was paid ─────────────────────────────────
    if (amountPaid <= 0) {
      return fail(
        "No payment was made for this sale, so it cannot be refunded.",
      );
    }

    const refundAmount = Number(amount);

    // ── Validate amount ─────────────────────────────────────────
    if (!refundAmount || refundAmount <= 0) {
      return fail("Valid refund amount enter karein");
    }

    if (refundAmount > maxRefundable) {
      return fail(
        `The refund amount of PKR ${refundAmount.toFixed(2)} exceeds the maximum refundable amount of PKR ${maxRefundable.toFixed(2)} ` +
          `(Paid: PKR ${amountPaid.toFixed(2)}, Already refunded: PKR ${alreadyRefunded.toFixed(2)}).`,
      );
    }

    const userId = request.headers.get("x-user-id");

    // ── Restore stock ───────────────────────────────────────────
    if (restoreStock) {
      for (const item of sale.items) {
        const productId = item.product?._id || item.product;
        const product = await Product.findById(productId);
        if (!product) continue;

        const newStock =
          Math.round((product.stock + item.quantity) * 10000) / 10000;
        product.stock = newStock;
        product.totalSold = Math.max(
          0,
          (product.totalSold || 0) - item.quantity,
        );
        await product.save();

        await StockHistory.create({
          product: product._id,
          type: "returned",
          quantityChange: item.quantity,
          stockAfter: newStock,
          reference: sale.invoiceNumber,
          note: `Refund: ${reason}`,
          createdBy: userId || undefined,
        });
      }
    }

    // ── Record expense for THIS refund only ─────────────────────
    await Expense.create({
      title: `Refund — ${sale.invoiceNumber}`,
      category: "other",
      amount: refundAmount,
      date: new Date(),
      notes: `Reason: ${reason}. Invoice: ${sale.invoiceNumber}. Customer ko wapas kiya.`,
      createdBy: userId || undefined,
    });

    // ── Update sale ─────────────────────────────────────────────
    const newTotalRefunded = alreadyRefunded + refundAmount;
    const isFullyRefunded = newTotalRefunded >= amountPaid;

    sale.refundedAmount = newTotalRefunded;
    sale.isRefunded = isFullyRefunded;
    sale.refund = {
      amount: newTotalRefunded,
      reason,
      refundedAt: new Date(),
      refundedBy: userId || undefined,
      stockRestored: restoreStock,
    };

    await sale.save();

    const stillRefundable = amountPaid - newTotalRefunded;

    return ok(
      {
        invoiceNumber: sale.invoiceNumber,
        refundAmount,
        totalRefunded: newTotalRefunded,
        stillRefundable: Math.max(0, stillRefundable),
        isFullyRefunded,
        stockRestored: restoreStock,
      },
      isFullyRefunded
        ? `Refund of PKR ${refundAmount.toFixed(2)} processed successfully. The sale has been fully refunded.${restoreStock ? " Stock has also been restored." : ""}`
        : // Success (partial refund)
          `Refund of PKR ${refundAmount.toFixed(2)} processed successfully. PKR ${stillRefundable.toFixed(2)} is still available for refund.`,
    );
  } catch (e) {
    console.error("Refund error:", e);
    return serverError(e);
  }
}
