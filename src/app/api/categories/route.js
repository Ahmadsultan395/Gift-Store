import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { ok, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ status: "active" }).sort({ sortOrder: 1, name: 1 }).lean();
    return ok(categories);
  } catch (e) { return serverError(e); }
}
