import mongoose from "mongoose";

const PurchaseItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true }, // price per unit at time of purchase
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const PurchaseSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: [PurchaseItemSchema],

    subTotal: { type: Number, required: true, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },

    amountPaid: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["paid", "partial", "unpaid"],
      default: "unpaid",
    },

    purchaseDate: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: String,
  },
  { timestamps: true }
);

PurchaseSchema.index({ supplier: 1, purchaseDate: -1 });

export const PurchaseItem = PurchaseItemSchema; // exported for reference/reuse
export default mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);
