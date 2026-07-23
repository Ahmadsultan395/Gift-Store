import connectDB from "@/lib/db";
import { Banner } from "@/models/index";
import { ok, created, fail, notFound, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find().sort({ sortOrder: 1, createdAt: -1 });
    return ok(banners);
  } catch (e) { return serverError(e); }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, image, type, link, sortOrder, subtitle } = body;
    if (!image?.url) return fail("Banner image is required");
    const banner = await Banner.create({ title, subtitle, image, type: type || "hero", link, sortOrder: sortOrder || 0 });
    return created(banner);
  } catch (e) { return serverError(e); }
}
