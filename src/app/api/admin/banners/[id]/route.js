import connectDB from "@/lib/db";
import { Banner } from "@/models/index";
import { ok, notFound, serverError } from "@/lib/apiResponse";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body   = await request.json();
    const banner = await Banner.findByIdAndUpdate(params.id, body, { new: true });
    if (!banner) return notFound("Banner not found");
    return ok(banner, "Banner updated");
  } catch (e) { return serverError(e); }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    await Banner.findByIdAndDelete(params.id);
    return ok(null, "Banner deleted");
  } catch (e) { return serverError(e); }
}
