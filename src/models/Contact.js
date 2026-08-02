import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, trim: true, lowercase: true },
    phone:   { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true, trim: true },

    // Admin reply
    isRead:    { type: Boolean, default: false },
    isReplied: { type: Boolean, default: false },
    reply:     { type: String, trim: true },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

ContactSchema.index({ isRead: 1, createdAt: -1 });

export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
