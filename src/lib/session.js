import { cookies } from "next/headers";
import { verifyToken, JWT_COOKIE_NAME } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

/**
 * Reads the JWT cookie (server-side) and returns the logged-in user document,
 * or null if not authenticated. Use inside Server Components / API routes.
 */
export async function getCurrentUser() {
  const token = cookies().get(JWT_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  await connectDB();
  const user = await User.findById(payload.id).select("-password");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !["admin", "manager", "staff"].includes(user.role)) {
    return null;
  }
  return user;
}
