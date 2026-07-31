import connectDB from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { ok, serverError } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// GET — all testimonials (visible + hidden) for admin panel, with
// search, status filter, and pagination
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "12", 10)),
    );
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";

    const query = {};

    if (status === "visible") query.isVisible = true;
    if (status === "hidden") query.isVisible = false;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [testimonials, total, visibleCount, hiddenCount] =
      await Promise.all([
        Testimonial.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Testimonial.countDocuments(query),
        Testimonial.countDocuments({ isVisible: true }),
        Testimonial.countDocuments({ isVisible: false }),
      ]);

    return ok({
      testimonials,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      visibleCount,
      hiddenCount,
    });
  } catch (e) {
    return serverError(e);
  }
}
