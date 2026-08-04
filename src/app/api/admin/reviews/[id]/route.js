import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { deleteImage } from "@/lib/cloudinaryDelete";
import { ok, fail, serverError } from "@/lib/apiResponse";

// UPDATE STATUS (Approve / Reject)
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const { status, adminNote } = await request.json();

    if (!["pending", "approved", "rejected"].includes(status)) {
      return fail("Invalid status");
    }

    const review = await Review.findById(id);

    if (!review) {
      return fail("Review not found", 404);
    }

    review.status = status;
    review.adminNote = adminNote || "";

    await review.save();

    return ok(review, `Review ${status}`);
  } catch (error) {
    console.error("Update review error:", error);

    return serverError(error);
  }
}

// DELETE
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const review = await Review.findById(id);

    if (!review) {
      return fail("Review not found", 404);
    }

    // Delete Cloudinary images
    if (review.images?.length) {
      for (const img of review.images) {
        if (img?.publicId) {
          await deleteImage(img.publicId);
        }
      }
    }

    await Review.findByIdAndDelete(id);

    return ok(null, "Review deleted successfully");
  } catch (error) {
    console.error("Delete review error:", error);

    return serverError(error);
  }
}
