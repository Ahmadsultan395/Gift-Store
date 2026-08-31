import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import { ok, notFound, serverError } from "@/lib/apiResponse";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

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
    const ratingData = await Review.aggregate([
      {
        $match: {
          product: product._id,
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    product.avgRating = ratingData[0]
      ? Number(ratingData[0].avgRating.toFixed(1))
      : 0;

    product.reviewCount = ratingData[0]?.reviewCount || 0;

    const related = await Product.find({
      category: product.category?._id,
      _id: { $ne: product._id },
      status: "active",
    })
      .limit(8)
      .select("name slug images sellingPrice oldPrice discountPercent stock")
      .lean();

    const relatedIds = related.map((p) => p._id);

    const relatedRatings = await Review.aggregate([
      {
        $match: {
          product: { $in: relatedIds },
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const ratingMap = {};

    relatedRatings.forEach((r) => {
      ratingMap[r._id.toString()] = {
        avgRating: Number(r.avgRating.toFixed(1)),
        reviewCount: r.reviewCount,
      };
    });

    related.forEach((p) => {
      const rating = ratingMap[p._id.toString()];

      p.avgRating = rating?.avgRating || 0;
      p.reviewCount = rating?.reviewCount || 0;
    });

    return ok({ product, related });
  } catch (e) {
    return serverError(e);
  }
}
