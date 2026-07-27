import connectDB from "@/lib/db";
import { Settings } from "@/models/index";
import { ok, serverError } from "@/lib/apiResponse";
import { deleteImage } from "@/lib/cloudinaryDelete";

export async function GET() {
  try {
    await connectDB();

    let settings = await Settings.findOne();

    if (!settings) settings = await Settings.create({});

    return ok(settings);
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    // old logo delete if new logo uploaded
    if (
      settings.logo?.publicId &&
      body.logo?.publicId &&
      settings.logo.publicId !== body.logo.publicId
    ) {
      await deleteImage(settings.logo.publicId);
    }

    Object.assign(settings, body);

    await settings.save();

    return ok(settings, "Settings saved");
  } catch (e) {
    console.error(e);
    return serverError(e);
  }
}
