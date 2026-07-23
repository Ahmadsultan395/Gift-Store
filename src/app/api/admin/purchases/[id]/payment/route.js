import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import Supplier from "@/models/Supplier";
import { ok, notFound, fail, serverError } from "@/lib/apiResponse";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { amountPaid } = await request.json();
    if (amountPaid === undefined) return fail("amountPaid is required");

    const purchase = await Purchase.findById(params.id);
    if (!purchase) return notFound("Purchase not found");

    const prev        = purchase.amountPaid || 0;
    const newPaid     = Number(amountPaid);
    const difference  = newPaid - prev; // how much more was paid

    purchase.amountPaid    = newPaid;
    purchase.paymentStatus = newPaid >= purchase.grandTotal ? "paid" : newPaid > 0 ? "partial" : "unpaid";
    await purchase.save();

    // Update supplier outstanding balance
    if (difference !== 0) {
      await Supplier.findByIdAndUpdate(purchase.supplier, {
        $inc: { outstandingBalance: -difference }, // paying more reduces outstanding
      });
    }

    return ok(purchase, `Payment updated. Status: ${purchase.paymentStatus}`);
  } catch (e) { return serverError(e); }
}
