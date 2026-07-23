import connectDB from "@/lib/db";
import { Notification } from "@/models/index";
import { ok, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    await connectDB();
    const count = await Notification.countDocuments({ isRead: false });
    return ok({ count });
  } catch (e) { return serverError(e); }
}
