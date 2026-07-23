import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { ok, notFound, serverError } from "@/lib/apiResponse";

export async function GET(_, { params }) {
  try {
    await connectDB();

    const product = await Product.findOne({
      $or: [{ slug: params.id }, { _id: params.id }],
      status: "active",
    })
      .populate("category", "name slug")
      .populate("brand", "name")
      .lean();

    if (!product) return notFound("Product not found");

    const related = await Product.find({
      category: product.category?._id,
      _id: { $ne: product._id },
      status: "active",
    })
      .limit(8)
      .select("name slug images sellingPrice oldPrice discountPercent stock")
      .lean();

    return ok({ product, related });
  } catch (e) {
    return serverError(e);
  }
}
