import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    photo: { type: String, default: "" }, // optional, data URI
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true },
);

TestimonialSchema.index({ isVisible: 1, createdAt: -1 });

export default mongoose.models.Testimonial ||
  mongoose.model("Testimonial", TestimonialSchema);
