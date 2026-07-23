import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import { ok, notFound, serverError } from "@/lib/apiResponse";

export async function GET(_, { params }) {
  try {
    await connectDB();
    const purchase = await Purchase.findById(params.id)
      .populate("supplier", "name phone email address city")
      .populate("items.product", "name sku unit")
      .populate("createdBy", "name");

    if (!purchase) return notFound("Purchase not found");
    return ok(purchase);
  } catch (e) { return serverError(e); }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    const purchase = await Purchase.findByIdAndDelete(params.id);
    if (!purchase) return notFound("Purchase not found");
    // Note: Stock reversal on delete is intentionally left to manual adjustment
    // to avoid accidental data corruption
    return ok(null, "Purchase deleted");
  } catch (e) { return serverError(e); }
}
