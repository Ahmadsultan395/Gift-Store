import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { ok, serverError } from "@/lib/apiResponse";

const GENDER_VALUES = ["men", "women", "kids"];

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const gender = searchParams.get("gender") || "";
    const brand = searchParams.get("brand") || "";
    const sort = searchParams.get("sort") || "createdAt";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const featured = searchParams.get("featured") || "";
    const newArr = searchParams.get("newArrival") || "";
    const flash = searchParams.get("flashSale") || "";

    const query = { status: "active" };
    if (search)
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];

    // A specific category (its real _id) always wins — it's already a
    // precise pick. "gender" is a separate, broader filter (Men/Women/Kids)
    // that pulls in every category tagged with that gender, plus "Unisex".
    if (category) {
      query.category = category;
    } else if (gender && GENDER_VALUES.includes(gender.toLowerCase())) {
      const genderLabel =
        gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
      const matchedCategories = await Category.find({
        gender: { $in: [genderLabel, "Unisex"] },
        status: "active",
      }).select("_id");
      query.category = { $in: matchedCategories.map((c) => c._id) };
    }

    if (brand) query.brand = brand;
    if (featured) query.isFeatured = true;
    if (newArr) query.isNewArrival = true;
    if (flash) query.isFlashSale = true;
    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
    }

    const sortMap = {
      createdAt: { createdAt: -1 },
      price_asc: { sellingPrice: 1 },
      price_desc: { sellingPrice: -1 },
      popular: { totalSold: -1 },
    };
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("brand", "name")
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return ok({
      products,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    return serverError(e);
  }
}
