import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "staff", "manager"],
      default: "staff",
    },
    permissions: [{ type: String }], // e.g. ["products.write", "pos.use", "reports.view"]
    avatar: {
      url: String,
      publicId: String,
    },
    phone: String,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
