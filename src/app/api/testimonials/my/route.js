import { cookies }  from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB     from "@/lib/db";
import Testimonial   from "@/models/Testimonial";
import Customer      from "@/models/Customer";
import { ok, unauthorized, fail, serverError } from "@/lib/apiResponse";

async function getCustomer() {
  const token   = cookies().get("pansar_customer")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.type !== "customer") return null;
  await connectDB();
  return Customer.findById(payload.id).select("name phone email");
}

// GET — check if logged-in customer already has a testimonial
export async function GET() {
  try {
    const customer = await getCustomer();
    if (!customer) return unauthorized("Please login first");

    const existing = await Testimonial.findOne({ customer: customer._id });
    return ok(existing || null);
  } catch (e) { return serverError(e); }
}

// POST — submit new testimonial (one per customer)
export async function POST(request) {
  try {
    const customer = await getCustomer();
    if (!customer) return unauthorized("Please login to submit a testimonial");

    const { rating, message, photo } = await request.json();
    if (!rating)          return fail("Rating is required");
    if (!message?.trim()) return fail("Message is required");
    if (rating < 1 || rating > 5) return fail("Rating must be between 1 and 5");

    // Check duplicate
    const existing = await Testimonial.findOne({ customer: customer._id });
    if (existing) {
      return fail("You have already submitted a testimonial. Use edit to update it.");
    }

    const testimonial = await Testimonial.create({
      customer: customer._id,
      name:     customer.name,   // auto from account
      rating:   Number(rating),
      message:  message.trim(),
      photo:    photo || "",
      status:   "pending",       // always starts pending
    });

    return ok(testimonial, "Thank you! Your testimonial has been submitted for review and will appear after admin approval.");
  } catch (e) {
    if (e.code === 11000) {
      return fail("You have already submitted a testimonial. Use edit to update it.");
    }
    return serverError(e);
  }
}

// PUT — update existing testimonial (resets to pending)
export async function PUT(request) {
  try {
    const customer = await getCustomer();
    if (!customer) return unauthorized("Please login first");

    const { rating, message, photo } = await request.json();
    if (!rating)          return fail("Rating is required");
    if (!message?.trim()) return fail("Message is required");
    if (rating < 1 || rating > 5) return fail("Rating must be between 1 and 5");

    const existing = await Testimonial.findOne({ customer: customer._id });
    if (!existing) return fail("No testimonial found to update. Please submit first.");

    existing.rating  = Number(rating);
    existing.message = message.trim();
    existing.photo   = photo || existing.photo || "";
    existing.status  = "pending";  // reset to pending after edit
    existing.name    = customer.name; // refresh name in case it changed
    await existing.save();

    return ok(existing, "Your testimonial has been updated and submitted for review.");
  } catch (e) { return serverError(e); }
}
