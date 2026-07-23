import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    companyName: String,
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true },
    address: String,
    city: String,
    outstandingBalance: { type: Number, default: 0 },
    totalPurchaseAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.Supplier || mongoose.model("Supplier", SupplierSchema);
