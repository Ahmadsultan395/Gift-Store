import connectDB from "@/lib/db";
import { Settings } from "@/models/index";
import { ok, serverError } from "@/lib/apiResponse";
export const dynamic = "force-dynamic";

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
    if (!settings) settings = new Settings();
    Object.assign(settings, body);
    await settings.save();
    return ok(settings, "Settings saved");
  } catch (e) {
    return serverError(e);
  }
}
