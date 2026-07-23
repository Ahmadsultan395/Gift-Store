import connectDB from "@/lib/db";
import Supplier from "@/models/Supplier";
import { ok, created, fail, notFound, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    await connectDB();
    const suppliers = await Supplier.find().sort({ name: 1 });
    return ok(suppliers);
  } catch (e) { return serverError(e); }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.phone) return fail("Name and phone are required");
    await connectDB();
    const supplier = await Supplier.create(body);
    return created(supplier);
  } catch (e) { return serverError(e); }
}
