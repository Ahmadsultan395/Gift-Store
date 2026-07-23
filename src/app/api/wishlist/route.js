import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Wishlist } from "@/models/index";
import Product from "@/models/Product";
import { ok, fail, serverError } from "@/lib/apiResponse";

async function getCustomerId() {
  const token   = cookies().get("pansar_customer")?.value;
  const payload = token ? verifyToken(token) : null;
  return payload?.type === "customer" ? payload.id : null;
}

// GET wishlist
export async function GET() {
  try {
    const customerId = await getCustomerId();
    if (!customerId) return fail("Login required", 401);
    await connectDB();
    const wishlist = await Wishlist.findOne({ customer: customerId }).populate("products","name slug images sellingPrice oldPrice discountPercent stock");
    return ok(wishlist?.products || []);
  } catch(e){ return serverError(e); }
}

// POST toggle product in wishlist
export async function POST(request) {
  try {
    const customerId = await getCustomerId();
    if (!customerId) return fail("Login required", 401);
    await connectDB();
    const { productId } = await request.json();
    if (!productId) return fail("productId required");

    let wishlist = await Wishlist.findOne({ customer: customerId });
    if (!wishlist) wishlist = await Wishlist.create({ customer: customerId, products: [] });

    const exists = wishlist.products.includes(productId);
    if (exists) {
      wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    } else {
      wishlist.products.push(productId);
    }
    await wishlist.save();
    return ok({ added: !exists, count: wishlist.products.length }, exists ? "Removed from wishlist" : "Added to wishlist");
  } catch(e){ return serverError(e); }
}
