import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { ok, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    await connectDB();

    // Gender ke category ids sirf EK dafa resolve karo (facet ke bahar)
    const [menCats, womenCats, kidsCats] = await Promise.all([
      Category.find({
        gender: { $in: ["Men", "Unisex"] },
        status: "active",
      }).select("_id"),
      Category.find({
        gender: { $in: ["Women", "Unisex"] },
        status: "active",
      }).select("_id"),
      Category.find({
        gender: { $in: ["Kids", "Unisex"] },
        status: "active",
      }).select("_id"),
    ]);

    const menCatIds = menCats.map((c) => c._id);
    const womenCatIds = womenCats.map((c) => c._id);
    const kidsCatIds = kidsCats.map((c) => c._id);

    const [result] = await Product.aggregate([
      { $match: { status: "active" } },
      {
        $facet: {
          flashSale: [
            { $match: { isFlashSale: true } },
            { $sort: { createdAt: -1 } },
            { $limit: 8 },
          ],
          featured: [
            { $match: { isFeatured: true } },
            { $sort: { createdAt: -1 } },
            { $limit: 8 },
          ],
          newArrivals: [
            { $match: { isNewArrival: true } },
            { $sort: { createdAt: -1 } },
            { $limit: 8 },
          ],
          bestSellers: [{ $sort: { totalSold: -1 } }, { $limit: 8 }],
          men: [
            { $match: { category: { $in: menCatIds } } },
            { $sort: { createdAt: -1 } },
            { $limit: 8 },
          ],
          women: [
            { $match: { category: { $in: womenCatIds } } },
            { $sort: { createdAt: -1 } },
            { $limit: 8 },
          ],
          kids: [
            { $match: { category: { $in: kidsCatIds } } },
            { $sort: { createdAt: -1 } },
            { $limit: 8 },
          ],
        },
      },
    ]);

    // aggregate() khud populate nahi karta — manually populate karo
    const buckets = [
      "flashSale",
      "featured",
      "newArrivals",
      "bestSellers",
      "men",
      "women",
      "kids",
    ];
    for (const key of buckets) {
      result[key] = await Product.populate(result[key], [
        { path: "category", select: "name slug" },
        { path: "brand", select: "name" },
      ]);
    }

    return ok(result);
  } catch (e) {
    return serverError(e);
  }
}
