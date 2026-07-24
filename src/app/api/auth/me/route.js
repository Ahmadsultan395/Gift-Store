import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import { ok, unauthorized, serverError } from "@/lib/apiResponse";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = cookies().get("pansar_customer")?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload || payload.type !== "customer") return unauthorized();

    await connectDB();
    const customer = await Customer.findById(payload.id).select("-password");
    if (!customer) return unauthorized();
    return ok({ customer });
  } catch (e) {
    return serverError(e);
  }
}
