import connectDB from "@/lib/db";
import Brand from "@/models/Brand";
import { ok, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find({ status: "active" })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    return ok(brands);
  } catch (e) {
    return serverError(e);
  }
}
