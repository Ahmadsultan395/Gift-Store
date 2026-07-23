import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import { comparePassword, signToken } from "@/lib/auth";
import { ok, fail, serverError } from "@/lib/apiResponse";

const CUST_COOKIE = "pansar_customer";

export async function POST(request) {
  try {
    const { phone, password } = await request.json();
    if (!phone || !password) return fail("Phone and password are required");

    await connectDB();
    const customer = await Customer.findOne({ phone }).select("+password");
    if (!customer || !customer.isRegistered) return fail("Invalid credentials");

    const match = await comparePassword(password, customer.password);
    if (!match) return fail("Invalid credentials");

    const token    = signToken({ id: customer._id.toString(), type: "customer" });
    const response = ok({ customer: { id: customer._id, name: customer.name, phone: customer.phone, email: customer.email } }, "Login successful");
    response.headers.set("Set-Cookie", `${CUST_COOKIE}=${token}; Path=/; HttpOnly; Max-Age=${60*60*24*7}; SameSite=Lax`);
    return response;
  } catch (e) { return serverError(e); }
}
