import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    image: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },

    items: [OrderItemSchema],

    shippingInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      notes: String,
    },

    subTotal: { type: Number, required: true, default: 0 },
    deliveryCharges: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: String,
    grandTotal: { type: Number, required: true, default: 0 },

    paymentMethod: {
      type: String,
      enum: ["cod", "bank_transfer"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "failed", "refunded"],
      default: "pending",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],

    // ── Single source of truth: true = stock is currently deducted ──
    // Toggled on every forward/back crossing, so it works no matter
    // how many times the order bounces between states.
    stockDeducted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
