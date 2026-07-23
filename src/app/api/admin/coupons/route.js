import connectDB from "@/lib/db";
import { Coupon } from "@/models/index";
import { ok, created, fail, notFound, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt:-1 });
    return ok(coupons);
  } catch(e){ return serverError(e); }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { code, type, value, expiryDate, usageLimit, minPurchase, maxDiscount } = body;
    if (!code||!type||!value||!expiryDate) return fail("Code, type, value and expiry are required");
    const exists = await Coupon.findOne({ code:code.toUpperCase() });
    if (exists) return fail("Coupon code already exists");
    const coupon = await Coupon.create({ code:code.toUpperCase(), type, value:Number(value), expiryDate, usageLimit:Number(usageLimit)||1, minPurchase:Number(minPurchase)||0, maxDiscount:maxDiscount?Number(maxDiscount):undefined });
    return created(coupon);
  } catch(e){ return serverError(e); }
}
