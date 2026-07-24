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
    if (!customer) return unauthorized("Login karein");

    const body = await request.json();
    const { name, phone, email, currentPassword, newPassword } = body;

    // ── Change Password ─────────────────────────────────────────
    if (newPassword) {
      if (!currentPassword) return fail("Current password enter karein");
      if (newPassword.length < 6)
        return fail("New password kam az kam 6 characters ka hona chahiye");

      const customerWithPass = await Customer.findById(customer._id).select(
        "+password",
      );
      if (!customerWithPass.password)
        return fail(
          "Aapka account password se register nahi hua — Google ya OTP se aya hai",
        );

      const isMatch = await comparePassword(
        currentPassword,
        customerWithPass.password,
      );
      if (!isMatch) return fail("Current password ghalat hai");

      customerWithPass.password = await hashPassword(newPassword);
      await customerWithPass.save();
      return ok(null, "Password change ho gaya!");
    }

    // ── Update Profile Info ─────────────────────────────────────
    if (!name?.trim()) return fail("Naam zaroori hai");
    if (!phone?.trim()) return fail("Phone zaroori hai");

    // Check if phone already used by someone else
    if (phone !== customer.phone) {
      const phoneExists = await Customer.findOne({
        phone,
        _id: { $ne: customer._id },
      });
      if (phoneExists)
        return fail(
          "Yeh phone number already kisi aur account pe registered hai",
        );
    }

    // Check email uniqueness
    if (email && email !== customer.email) {
      const emailExists = await Customer.findOne({
        email: email.toLowerCase(),
        _id: { $ne: customer._id },
      });
      if (emailExists) return fail("Yeh email already use ho rahi hai");
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
      "Profile update ho gaya!",
    );
  } catch (e) {
    return serverError(e);
  }
}
