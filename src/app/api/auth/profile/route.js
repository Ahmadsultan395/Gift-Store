import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import { hashPassword, comparePassword } from "@/lib/auth";
import { ok, fail, unauthorized, serverError } from "@/lib/apiResponse";
export const dynamic = "force-dynamic";

async function getCustomer() {
  const token = cookies().get("pansar_customer")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.type !== "customer") return null;
  await connectDB();
  return Customer.findById(payload.id);
}

// GET — current profile
export async function GET() {
  try {
    const customer = await getCustomer();
    if (!customer) return unauthorized("Login karein");
    return ok({
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
    });
  } catch (e) {
    return serverError(e);
  }
}

// PUT — update profile info OR change password
export async function PUT(request) {
  try {
    const customer = await getCustomer();
    if (!customer) return unauthorized("Please login");

    const body = await request.json();
    const { name, phone, email, currentPassword, newPassword } = body;

    // ── Change Password ─────────────────────────────────────────
    if (newPassword) {
      if (!currentPassword) return fail("Please enter your current password");
      if (newPassword.length < 6)
        return fail("New password must be at least 6 characters long");

      const customerWithPass = await Customer.findById(customer._id).select(
        "+password",
      );
      if (!customerWithPass.password)
        return fail(
          "Your account was not registered with a password — it was created using Google or OTP",
        );

      const isMatch = await comparePassword(
        currentPassword,
        customerWithPass.password,
      );
      if (!isMatch) return fail("Current password is incorrect");

      customerWithPass.password = await hashPassword(newPassword);
      await customerWithPass.save();
      return ok(null, "Password changed successfully!");
    }

    // ── Update Profile Info ─────────────────────────────────────
    if (!name?.trim()) return fail("Name is required");
    if (!phone?.trim()) return fail("Phone is required");

    // Check if phone already used by someone else
    if (phone !== customer.phone) {
      const phoneExists = await Customer.findOne({
        phone,
        _id: { $ne: customer._id },
      });
      if (phoneExists)
        return fail(
          "This phone number is already registered with another account",
        );
    }

    // Check email uniqueness
    if (email && email !== customer.email) {
      const emailExists = await Customer.findOne({
        email: email.toLowerCase(),
        _id: { $ne: customer._id },
      });
      if (emailExists) return fail("This email is already in use");
    }

    customer.name = name.trim();
    customer.phone = phone.trim();
    customer.email = email?.trim().toLowerCase() || customer.email;
    await customer.save();

    return ok(
      {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
      },
      "Profile updated successfully!",
    );
  } catch (e) {
    return serverError(e);
  }
}
