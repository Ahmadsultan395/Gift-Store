import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import { ok, unauthorized, serverError } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get customer cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("pansar_customer")?.value;

    // No cookie = not logged in
    if (!token) {
      return unauthorized();
    }

    // Verify token
    let payload;

    try {
      payload = verifyToken(token);
    } catch (error) {
      console.error("Invalid customer token:", error);
      return unauthorized();
    }

    // Check customer token
    if (!payload || payload.type !== "customer") {
      return unauthorized();
    }

    // Connect database
    await connectDB();

    // Find customer
    const customer = await Customer.findById(payload.id)
      .select("-password")
      .lean();

    if (!customer) {
      return unauthorized();
    }

    return ok({ customer });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return serverError(error);
  }
}
