import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Customer from "@/models/Customer";

import {
  ok,
  fail,
  unauthorized,
  notFound,
  serverError,
} from "@/lib/apiResponse";

const MAX_IMAGES = 5;

function validateImages(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .filter(
      (img) =>
        img && typeof img.url === "string" && typeof img.publicId === "string",
    )
    .slice(0, MAX_IMAGES);
}

async function getCustomer() {
  const token = cookies().get("pansar_customer")?.value;

  const payload = token ? verifyToken(token) : null;

  if (!payload || payload.type !== "customer") {
    return null;
  }

  await connectDB();

  return Customer.findById(payload.id);
}

export async function PUT(request, { params }) {
  try {
    const customer = await getCustomer();

    if (!customer) {
      return unauthorized("Please login");
    }

    await connectDB();

    const review = await Review.findById(params.reviewId);

    if (!review) {
      return notFound("Review not found");
    }

    if (review.customer.toString() !== customer._id.toString()) {
      return unauthorized("You can only edit your own review");
    }

    const { rating, title, comment, images } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return fail("Rating 1-5 required");
    }

    if (!comment?.trim()) {
      return fail("Please write a comment");
    }

    review.rating = Number(rating);

    review.title = title?.trim() || "";

    review.comment = comment.trim();

    if (Array.isArray(images)) {
      review.images = validateImages(images);
    }

    review.status = "pending";

    review.adminNote = "";

    await review.save();

    return ok(review, "Review updated! It will appear after admin approval.");
  } catch (e) {
    return serverError(e);
  }
}
