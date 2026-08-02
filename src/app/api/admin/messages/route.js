import connectDB from "@/lib/db";
import Contact    from "@/models/Contact";
import { ok, serverError } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get("page")   || "1");
    const limit  = parseInt(searchParams.get("limit")  || "20");
    const filter = searchParams.get("filter") || "all"; // all | unread | replied

    const query = {};
    if (filter === "unread")  query.isRead    = false;
    if (filter === "replied") query.isReplied = true;

    const total    = await Contact.countDocuments(query);
    const messages = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const [unreadCount, repliedCount] = await Promise.all([
      Contact.countDocuments({ isRead: false }),
      Contact.countDocuments({ isReplied: true }),
    ]);

    return ok({
      messages,
      stats:      { total: await Contact.countDocuments(), unread: unreadCount, replied: repliedCount },
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (e) { return serverError(e); }
}
