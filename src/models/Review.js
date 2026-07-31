import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    rating:  { type: Number, min: 1, max: 5, required: true },
    title:   { type: String, trim: true },
    comment: { type: String, trim: true },
    status:  {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: String, // rejection reason
  },
  { timestamps: true }
);

// One review per customer per product
ReviewSchema.index({ product: 1, customer: 1 }, { unique: true });
ReviewSchema.index({ product: 1, status: 1 });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
