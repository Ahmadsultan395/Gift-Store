import connectDB from "@/lib/db";
import Supplier from "@/models/Supplier";
import { ok, notFound, serverError } from "@/lib/apiResponse";

export async function GET(_, { params }) {
  try {
    await connectDB();
    const s = await Supplier.findById(params.id);
    if (!s) return notFound("Supplier not found");
    return ok(s);
  } catch (e) { return serverError(e); }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    await connectDB();
    const s = await Supplier.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!s) return notFound("Supplier not found");
    return ok(s, "Supplier updated");
  } catch (e) { return serverError(e); }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    const s = await Supplier.findByIdAndDelete(params.id);
    if (!s) return notFound("Supplier not found");
    return ok(null, "Supplier deleted");
  } catch (e) { return serverError(e); }
}
