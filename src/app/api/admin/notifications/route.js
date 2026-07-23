import connectDB from "@/lib/db";
import { Notification } from "@/models/index";
import { ok, serverError } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    return ok(notifications);
  } catch (e) { return serverError(e); }
}

// Mark all as read
export async function PUT() {
  try {
    await connectDB();
    await Notification.updateMany({ isRead: false }, { isRead: true });
    return ok(null, "All notifications marked as read");
  } catch (e) { return serverError(e); }
}
