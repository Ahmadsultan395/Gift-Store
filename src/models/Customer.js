import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    address: String,
    city: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, select: false }, // optional, only if registered
    isRegistered: { type: Boolean, default: false },
    addresses: [AddressSchema],
    totalOrders: { type: Number, default: 0 },
    totalSpending: { type: Number, default: 0 },
    pendingPayments: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
