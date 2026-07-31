import connectDB from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { ok, serverError } from "@/lib/apiResponse";

// PATCH — toggle show/hide
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { isVisible: body.isVisible },
      { new: true },
    );

    return ok({ testimonial });
  } catch (e) {
    return serverError(e);
  }
}

// DELETE — remove a testimonial entirely
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    await Testimonial.findByIdAndDelete(id);
    return ok({ deleted: true });
  } catch (e) {
    return serverError(e);
  }
}
