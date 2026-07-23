import { getCurrentUser } from "@/lib/session";
import { ok, unauthorized, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized("Not logged in");
    return ok({ user });
  } catch (error) {
    return serverError(error);
  }
}
