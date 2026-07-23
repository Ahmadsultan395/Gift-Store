import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import { ok, notFound, fail, serverError } from "@/lib/apiResponse";

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { amount, method = "cash", note } = await request.json();

    const sale = await Sale.findById(params.id);
    if (!sale) return notFound("Sale not found");
    if (sale.isRefunded)
      return fail("Payments cannot be added to a refunded sale.");

    // ── Check if already fully paid ─────────────────────────────
    if (sale.paymentStatus === "paid") {
      return fail(
        `This sale has already been fully paid (PKR ${sale.grandTotal.toFixed(2)}). No outstanding balance remains.`,
      );
    }

    const addAmount = Number(amount);
    if (!addAmount || addAmount <= 0) return fail("Valid amount enter karein");

    // ── Calculate remaining balance ─────────────────────────────
    const alreadyPaid = sale.amountPaid || 0;
    const remaining = sale.grandTotal - alreadyPaid;

    if (remaining <= 0) {
      return fail(
        "No outstanding balance. This sale has already been paid in full.",
      );
    }

    // ── Cap: cannot pay more than remaining balance ─────────────
    if (addAmount > remaining) {
      return fail(
        `The payment amount exceeds the remaining balance. You can pay a maximum of PKR ${remaining.toFixed(2)}.`,
      );
    }

    // ── Initialize paymentHistory if missing (old docs) ─────────
    if (!Array.isArray(sale.paymentHistory)) {
      sale.paymentHistory = [];
    }

    const finalPaid = alreadyPaid + addAmount;

    sale.paymentHistory.push({
      amount: addAmount,
      method,
      note: note || "",
      paidAt: new Date(),
    });

    sale.amountPaid = finalPaid;
    sale.balanceDue = Math.max(0, sale.grandTotal - finalPaid);
    sale.paymentStatus = finalPaid >= sale.grandTotal ? "paid" : "partial";

    await sale.save();

    return ok(
      {
        invoiceNumber: sale.invoiceNumber,
        grandTotal: sale.grandTotal,
        amountPaid: sale.amountPaid,
        balanceDue: sale.balanceDue,
        paymentStatus: sale.paymentStatus,
        paymentHistory: sale.paymentHistory,
      },
      `Payment of PKR ${addAmount.toFixed(2)} recorded successfully. ${
        sale.balanceDue > 0
          ? `Remaining balance: PKR ${sale.balanceDue.toFixed(2)}.`
          : "The sale has been paid in full."
      }`,
    );
  } catch (e) {
    console.error("Payment error:", e);
    return serverError(e);
  }
}
