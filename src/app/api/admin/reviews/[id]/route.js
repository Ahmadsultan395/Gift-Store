import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { ok, notFound, fail, serverError } from "@/lib/apiResponse";

// Recalculate product avg rating from approved reviews
async function updateProductRating(productId) {
  const approved = await Review.find({
    product: productId,
    status: "approved",
  });
  const count = approved.length;
  const avg =
    count > 0 ? approved.reduce((s, r) => s + r.rating, 0) / count : 0;

  await Product.findByIdAndUpdate(productId, {
    avgRating: Math.round(avg * 10) / 10,
    reviewCount: count,
  });
}

// PUT — approve or reject
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { status, adminNote } = await request.json();

    if (!["approved", "rejected"].includes(status)) {
      return fail("Status must be either 'approved' or 'rejected");
    }

    const review = await Review.findByIdAndUpdate(
      params.id,
      { status, adminNote: adminNote || "" },
      { new: true },
    )
      .populate("product", "name")
      .populate("customer", "name");

    if (!review) return notFound("Review not found");

    // Recalculate product rating
    await updateProductRating(review.product._id);

    return ok(review, `Review ${status} successfully`);
  } catch (e) {
    return serverError(e);
  }
}

// DELETE — remove review permanently
export async function DELETE(_, { params }) {
  try {
    await connectDB();
    const review = await Review.findByIdAndDelete(params.id);
    if (!review) return notFound("Review not found");

    // Recalculate rating after delete
    await updateProductRating(review.product);

    return ok(null, "Review deleted successfully");
  } catch (e) {
    return serverError(e);
  }
}
