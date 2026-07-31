import mongoose from "mongoose";

const SaleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    quantity: { type: Number, required: true },
    unit: { type: String, default: "pcs" },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false },
);

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
    balanceDue: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "cod"],
      default: "cash",
    },
    // ── Single source of truth for status — including refund ──
    paymentStatus: {
      type: String,
      enum: ["paid", "partial", "unpaid", "refunded"],
      default: "paid",
    },

    paymentHistory: [PaymentEntrySchema],

    // ── Refund info — flat fields, no separate boolean/object ──
    refundedAmount: { type: Number, default: 0 },
    refundReason: String,
    refundedAt: Date,

    source: { type: String, enum: ["pos", "website"], default: "pos" },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    saleDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

SaleSchema.index({ saleDate: -1 });
SaleSchema.index({ customer: 1 });
SaleSchema.index({ paymentStatus: 1 });

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
