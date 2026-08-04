import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
  {
    // Logged-in customer reference
    customer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Customer",
      required: true,
      unique:   true,  // one testimonial per customer
    },

    // Cached from customer at submit time (for display without populate)
    name: { type: String, required: true, trim: true },

    rating:  { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, trim: true },

    photo: { type: String, default: "" }, // base64 or URL

    // Approval workflow
    status: {
      type:    String,
      enum:    ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

TestimonialSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Testimonial ||
  mongoose.model("Testimonial", TestimonialSchema);
