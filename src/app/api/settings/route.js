import connectDB from "@/lib/db";
import { Settings } from "@/models/index";
import { ok, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne()
      .select("storeName phone email address socialLinks cms shippingCharges currency");
    return ok(settings || {});
  } catch (e) { return serverError(e); }
}
