import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import { ok, created, fail, serverError } from "@/lib/apiResponse";
import slugify from "slugify";

const GENDER_VALUES = ["men", "women", "kids", "unisex"];

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const gender = searchParams.get("gender") || "";
    const brand = searchParams.get("brand") || "";
    const status = searchParams.get("status") || "";
    const stock = searchParams.get("stock") || ""; // "low" | "out"

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ];
    }

    // A specific category always wins; "gender" is a separate, broader
    // filter that pulls in every category tagged with that gender.
    if (category) {
      query.category = category;
    } else if (gender && GENDER_VALUES.includes(gender.toLowerCase())) {
      const genderLabel =
        gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
      const matchedCategories = await Category.find({
        gender: genderLabel,
      }).select("_id");
      query.category = { $in: matchedCategories.map((c) => c._id) };
    }

    if (brand) query.brand = brand;
    if (status) query.status = status;
    if (stock === "out") query.stock = { $lte: 0 };
    if (stock === "low")
      query.$expr = {
        $and: [
          { $gt: ["$stock", 0] },
          { $lte: ["$stock", "$lowStockThreshold"] },
        ],
      };

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("brand", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return ok({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      name,
      category,
      brand,
      sku,
      barcode,
      description,
      shortDescription,
      purchasePrice,
      sellingPrice,
      oldPrice,
      discountPrice,
      stock,
      unit,
      weight,
      expiryDate,
      status,
      isFeatured,
      isNewArrival,
      isFlashSale,
      tags,
      images,
      lowStockThreshold,
      seo,
    } = body;

    if (!name) return fail("Product name is required");
    if (!category) return fail("Category is required");
    if (!sku) return fail("SKU is required");
    if (sellingPrice === undefined) return fail("Selling price is required");

    // Auto-generate unique slug
    let slug = slugify(name, { lower: true, strict: true });
    const existing = await Product.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    // Check SKU uniqueness
    const skuExists = await Product.findOne({ sku });
    if (skuExists) return fail("SKU already exists. Use a unique SKU.");

    // Compute discount percent
    let discountPercent = 0;
    if (oldPrice && oldPrice > sellingPrice) {
      discountPercent = Math.round(
        ((oldPrice - sellingPrice) / oldPrice) * 100,
      );
    }

    const product = await Product.create({
      name,
      slug,
      sku,
      barcode,
      category,
      brand: brand || undefined,
      description,
      shortDescription,
      purchasePrice: purchasePrice || 0,
      sellingPrice,
      oldPrice: oldPrice || 0,
      discountPrice: discountPrice || 0,
      discountPercent,
      stock: stock || 0,
      unit: unit || "pcs",
      weight,
      expiryDate: expiryDate || undefined,
      status: status || "active",
      isFeatured: isFeatured || false,
      isNewArrival: isNewArrival || false,
      isFlashSale: isFlashSale || false,
      tags: tags || [],
      images: images || [],
      lowStockThreshold: lowStockThreshold || 5,
      seo: seo || {},
    });

    await product.populate(["category", "brand"]);
    return created(product, "Product created successfully");
  } catch (e) {
    return serverError(e);
  }
}
