import connectDB from "@/lib/db";
import { Notification } from "@/models";
import { ok, serverError } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find().sort({ createdAt: -1 }).skip(skip).limit(limit),

      Notification.countDocuments(),
    ]);

    return ok({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    return serverError(e);
  }
}
