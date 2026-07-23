import connectDB from "@/lib/db";
import { Banner } from "@/models/index";
import { ok, created, fail, notFound, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    await connectDB();

    const banners = await Banner.find().sort({ sortOrder: 1, createdAt: -1 });

    return ok(banners);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body.title || !body.image) {
      return fail("Title and image are required");
    }

    const banner = await Banner.create(body);

    return created(banner);
  } catch (e) {
    return serverError(e);
  }
}
