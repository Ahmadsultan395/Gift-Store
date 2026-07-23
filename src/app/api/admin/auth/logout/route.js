import { ok, serverError } from "@/lib/apiResponse";
import { buildLogoutCookie } from "@/lib/auth";

export async function POST() {
  try {
    const response = ok(null, "Logged out successfully");
    response.headers.set("Set-Cookie", buildLogoutCookie());
    return response;
  } catch (error) {
    return serverError(error);
  }
}
