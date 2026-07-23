import connectDB from "@/lib/db";
import { Coupon } from "@/models/index";
import { ok, fail, serverError } from "@/lib/apiResponse";

export async function POST(request) {
  try {
    await connectDB();
    const { code, total } = await request.json();
    if (!code) return fail("Coupon code is required");

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: "active" });
    if (!coupon)                         return fail("Invalid coupon code");
    if (coupon.expiryDate < new Date())  return fail("This coupon has expired");
    if (coupon.usedCount >= coupon.usageLimit) return fail("Coupon usage limit reached");
    if (total < coupon.minPurchase)      return fail(`Minimum purchase of PKR ${coupon.minPurchase} required`);

    const discount = coupon.type === "percentage"
      ? Math.min((total * coupon.value) / 100, coupon.maxDiscount || Infinity)
      : coupon.value;

    return ok({ discount, coupon: { code: coupon.code, type: coupon.type, value: coupon.value } }, `Coupon applied! You save PKR ${discount}`);
  } catch (e) { return serverError(e); }
}
