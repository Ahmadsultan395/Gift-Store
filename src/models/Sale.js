import mongoose from "mongoose";

const SaleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    quantity: { type: Number, required: true }, // supports decimals: 0.25 kg
    unit: { type: String, default: "pcs" }, // kg, g, litre, pcs etc
    price: { type: Number, required: true }, // price per unit
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false },
);

// Each payment installment
const PaymentEntrySchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["cash", "card", "bank_transfer"],
      default: "cash",
    },
    note: String,
    paidAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

// Refund record
const RefundSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    reason: String,
    refundedAt: { type: Date, default: Date.now },
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    stockRestored: { type: Boolean, default: false },
  },
  { _id: false },
);

const SaleSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    items: [SaleItemSchema],

    subTotal: { type: Number, required: true, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },

    // Payment tracking
    amountPaid: { type: Number, default: 0 },
    changeReturned: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 }, // grandTotal - amountPaid
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "cod"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "partial", "unpaid"],
      default: "paid",
    },

    // Full payment history (each installment)
    paymentHistory: [PaymentEntrySchema],

    // Refund
    isRefunded: { type: Boolean, default: false },
    refundedAmount: { type: Number, default: 0 },
    refund: RefundSchema,

    source: { type: String, enum: ["pos", "website"], default: "pos" },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    saleDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

SaleSchema.index({ saleDate: -1 });
SaleSchema.index({ customer: 1 });
SaleSchema.index({ paymentStatus: 1 });
SaleSchema.index({ isRefunded: 1 });

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
