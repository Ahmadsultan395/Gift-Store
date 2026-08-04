import connectDB   from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { ok, serverError } from "@/lib/apiResponse";

export const dynamic      = "force-dynamic";
export const revalidate   = 0;
export const fetchCache   = "force-no-store";

// GET — only APPROVED testimonials for public website
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page  = Math.max(1, parseInt(searchParams.get("page")  || "1",  10));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "6",  10));

    const query = { status: "approved" };   // ← only approved
    const total = await Testimonial.countDocuments(query);

    const testimonials = await Testimonial.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return ok({
      testimonials,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (e) { return serverError(e); }
}
