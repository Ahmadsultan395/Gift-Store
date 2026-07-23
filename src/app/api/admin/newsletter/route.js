import connectDB from "@/lib/db";
import Newsletter from "@/models/Newsletter";
import { ok, serverError } from "@/lib/apiResponse";

// GET all subscribers
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get("page")  || "1");
    const limit  = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";

    const query = {};
    if (search) query.email = { $regex: search, $options: "i" };

    const total       = await Newsletter.countDocuments(query);
    const subscribers = await Newsletter.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Stats
    const activeCount   = await Newsletter.countDocuments({ isActive: true });
    const todayCount    = await Newsletter.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });
    const thisMonthCount = await Newsletter.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    return ok({
      subscribers,
      stats: { total, active: activeCount, today: todayCount, thisMonth: thisMonthCount },
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (e) { return serverError(e); }
}
