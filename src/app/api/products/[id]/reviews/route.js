import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import { ok, fail, unauthorized, serverError } from "@/lib/apiResponse";

async function getCustomer() {
  const token   = cookies().get("pansar_customer")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.type !== "customer") return null;
  await connectDB();
  return Customer.findById(payload.id);
}

// GET — paginated approved reviews
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get("page")  || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Find product by slug OR _id
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(params.id);
    const product = await Product.findOne(
      isObjectId
        ? { $or: [{ _id: params.id }, { slug: params.id }] }
        : { slug: params.id }
    ).select("_id avgRating reviewCount");

    if (!product) return fail("Product not found", 404);

    const query = { product: product._id, status: "approved" };
    const total = await Review.countDocuments(query);

    const reviews = await Review.find(query)
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Breakdown (always from all approved, not just current page)
    const allApproved = await Review.find(query).select("rating");
    const breakdown   = { 5:0, 4:0, 3:0, 2:0, 1:0 };
    allApproved.forEach(r => { breakdown[r.rating] = (breakdown[r.rating]||0) + 1; });

    return ok({
      reviews,
      total,
      avgRating:  product.avgRating  || 0,
      reviewCount:product.reviewCount || 0,
      breakdown,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) { return serverError(e); }
}

// POST — submit review
export async function POST(request, { params }) {
  try {
    const customer = await getCustomer();
    if (!customer) return unauthorized("Please login to write a review");

    await connectDB();

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(params.id);
    const product = await Product.findOne(
      isObjectId
        ? { $or: [{ _id: params.id }, { slug: params.id }] }
        : { slug: params.id }
    );
    if (!product) return fail("Product not found", 404);

    const { rating, title, comment } = await request.json();
    if (!rating || rating < 1 || rating > 5) return fail("Rating 1-5 required");
    if (!comment?.trim()) return fail("Please write a comment");

    const existing = await Review.findOne({ product: product._id, customer: customer._id });
    if (existing) return fail("You have already reviewed this product");

    const review = await Review.create({
      product:  product._id,
      customer: customer._id,
      rating:   Number(rating),
      title:    title?.trim() || "",
      comment:  comment.trim(),
      status:   "pending",
    });

    return ok(review, "Review submitted! It will appear after admin approval.");
  } catch (e) {
    if (e.code === 11000) return fail("You have already reviewed this product");
    return serverError(e);
  }
}
