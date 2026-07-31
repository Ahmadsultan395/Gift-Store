import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import { StockHistory } from "@/models/index";
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

    const amountPaid = sale.amountPaid || 0;
    const alreadyRefunded = sale.refundedAmount || 0;
    const maxRefundable = amountPaid - alreadyRefunded;

    if (sale.paymentStatus === "refunded" || maxRefundable <= 0) {
      return fail(
        `This sale has already been fully refunded. ` +
          `Total paid: PKR ${amountPaid.toFixed(2)}, ` +
          `Already refunded: PKR ${alreadyRefunded.toFixed(2)}`,
      );
    }

    if (amountPaid <= 0) {
      return fail(
        "No payment was made for this sale, so it cannot be refunded.",
      );
    }

    const refundAmount = Number(amount);

    if (!refundAmount || refundAmount <= 0) {
      return fail("Please enter a valid refund amount");
    }

    if (refundAmount > maxRefundable) {
      return fail(
        `The refund amount of PKR ${refundAmount.toFixed(2)} exceeds the maximum refundable amount of PKR ${maxRefundable.toFixed(2)} ` +
          `(Paid: PKR ${amountPaid.toFixed(2)}, Already refunded: PKR ${alreadyRefunded.toFixed(2)}).`,
      );
    }

    const userId = request.headers.get("x-user-id");

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

    const newTotalRefunded = alreadyRefunded + refundAmount;
    const isFullyRefunded = newTotalRefunded >= amountPaid;

    sale.refundedAmount = newTotalRefunded;
    sale.refundReason = reason;
    sale.refundedAt = new Date();

    // ── Sale's own status is the single source of truth ──
    if (isFullyRefunded) {
      sale.paymentStatus = "refunded";
    }

    await sale.save();

    const stillRefundable = amountPaid - newTotalRefunded;

    return ok(
      {
        invoiceNumber: sale.invoiceNumber,
        refundAmount,
        totalRefunded: newTotalRefunded,
        stillRefundable: Math.max(0, stillRefundable),
        isFullyRefunded,
        paymentStatus: sale.paymentStatus,
        stockRestored: restoreStock,
      },
      isFullyRefunded
        ? `Refund of PKR ${refundAmount.toFixed(2)} processed successfully. The sale has been fully refunded.${restoreStock ? " Stock has also been restored." : ""}`
        : `Refund of PKR ${refundAmount.toFixed(2)} processed successfully. PKR ${stillRefundable.toFixed(2)} is still available for refund.`,
    );
  } catch (e) {
    console.error("Refund error:", e);
    return serverError(e);
  }
}
