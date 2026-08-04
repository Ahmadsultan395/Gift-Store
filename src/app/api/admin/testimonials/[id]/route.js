import connectDB   from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { ok, notFound, fail, serverError } from "@/lib/apiResponse";

// PATCH — approve or reject
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { status, adminNote } = await request.json();

    if (!["approved", "rejected"].includes(status)) {
      return fail("Status must be 'approved' or 'rejected'");
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      params.id,
      { status, adminNote: adminNote || "" },
      { new: true }
    ).populate("customer", "name");

    if (!testimonial) return notFound("Testimonial not found");

    return ok(testimonial, `Testimonial ${status}`);
  } catch (e) { return serverError(e); }
}

// DELETE
export async function DELETE(_, { params }) {
  try {
    await connectDB();
    await Testimonial.findByIdAndDelete(params.id);
    return ok(null, "Testimonial deleted");
  } catch (e) { return serverError(e); }
}
