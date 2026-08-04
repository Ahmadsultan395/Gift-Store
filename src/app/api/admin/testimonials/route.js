import connectDB   from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { ok, serverError } from "@/lib/apiResponse";

export const dynamic    = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get("page")  || "1",  10));
    const limit  = Math.min(50, parseInt(searchParams.get("limit") || "12", 10));
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all"; // all | pending | approved | rejected

    const query = {};
    if (status !== "all") query.status = status;

    if (search) {
      query.$or = [
        { name:    { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const [testimonials, total, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Testimonial.find(query)
        .populate("customer", "name phone email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Testimonial.countDocuments(query),
      Testimonial.countDocuments({ status: "pending"  }),
      Testimonial.countDocuments({ status: "approved" }),
      Testimonial.countDocuments({ status: "rejected" }),
    ]);

    return ok({
      testimonials,
      page, limit, total,
      totalPages:    Math.max(1, Math.ceil(total / limit)),
      pendingCount,
      approvedCount,
      rejectedCount,
    });
  } catch (e) { return serverError(e); }
}
