import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import { hashPassword, signToken, buildAuthCookie } from "@/lib/auth";
import { created, fail, serverError } from "@/lib/apiResponse";

const CUST_COOKIE = "pansar_customer";

export async function POST(request) {
  try {
    const { name, phone, email, password } = await request.json();
    if (!name || !phone || !password) return fail("Name, phone and password are required");

    await connectDB();
    const existing = await Customer.findOne({ $or: [{ phone }, ...(email ? [{ email }] : [])] });
    if (existing) return fail("Account with this phone or email already exists");

    const hashed  = await hashPassword(password);
    const customer = await Customer.create({ name, phone, email, password: hashed, isRegistered: true });

    const token    = signToken({ id: customer._id.toString(), type: "customer" });
    const response = created({ customer: { id: customer._id, name: customer.name, phone: customer.phone, email: customer.email } }, "Account created");
    response.headers.set("Set-Cookie", `${CUST_COOKIE}=${token}; Path=/; HttpOnly; Max-Age=${60*60*24*7}; SameSite=Lax`);
    return response;
  } catch (e) { return serverError(e); }
}
