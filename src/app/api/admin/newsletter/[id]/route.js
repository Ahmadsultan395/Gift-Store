import connectDB from "@/lib/db";
import Newsletter from "@/models/Newsletter";
import { ok, notFound, serverError } from "@/lib/apiResponse";

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    const sub = await Newsletter.findByIdAndDelete(params.id);
    if (!sub) return notFound("Subscriber not found");
    return ok(null, "Subscriber removed");
  } catch (e) { return serverError(e); }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { isActive } = await request.json();
    const sub = await Newsletter.findByIdAndUpdate(params.id, { isActive }, { new: true });
    if (!sub) return notFound("Subscriber not found");
    return ok(sub, `Subscriber ${isActive ? "activated" : "deactivated"}`);
  } catch (e) { return serverError(e); }
}
