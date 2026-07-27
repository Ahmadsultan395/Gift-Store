import connectDB from "@/lib/db";
import { Banner } from "@/models/index";
import { ok, notFound, serverError } from "@/lib/apiResponse";
import { deleteModelImage, updateImage } from "@/lib/cloudinaryDelete";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();

    const oldBanner = await updateImage(Banner, params.id, body.image);
    if (!oldBanner) return notFound("Banner not found");

    const banner = await Banner.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    if (!banner) return notFound("Banner not found");
    return ok(banner, "Banner updated");
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    const banner = await deleteModelImage(Banner, params.id);
    if (!banner) return notFound("Banner not found");

    await Banner.findByIdAndDelete(params.id);
    return ok(null, "Banner deleted");
  } catch (e) {
    return serverError(e);
  }
}
