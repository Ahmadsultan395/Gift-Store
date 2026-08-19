import mongoose from "mongoose";

/* ---------------- Brand ---------------- */
const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      url: String,
      publicId: String,
    },
    description: String,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

/* ---------------- Expense ---------------- */
const ExpenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["rent", "electricity", "internet", "salary", "other"],
      default: "other",
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

/* ---------------- Coupon ---------------- */
const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

/* ---------------- Banner ---------------- */
const BannerSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    image: {
      url: { type: String, required: true },
      publicId: String,
    },
    // Optional — plays in the hero slider once loaded; the image above
    // is used as the poster/fallback until the video is ready.
    video: {
      url: String,
      publicId: String,
    },
    link: String,
    type: {
      type: String,
      enum: ["hero", "poster", "flash_sale", "offer", "festival"],
      default: "hero",
    },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    startsAt: Date,
    endsAt: Date,
  },
  { timestamps: true },
);
/* ---------------- Settings (singleton) ---------------- */
const SettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Pansar Store" },
    logo: { url: String, publicId: String },
    address: String,
    phone: String,
    email: String,
    socialLinks: {
      facebook: String,
      instagram: String,
      whatsapp: String,
      youtube: String,
    },
    shippingCharges: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },
    currency: { type: String, default: "PKR" },
    themeColors: {
      primary: { type: String, default: "#0F4C39" },
      secondary: { type: String, default: "#0f172a" },
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: String,
    },
    cms: {
      aboutPage: String,
      contactPage: String,
      privacyPolicy: String,
      termsConditions: String,
      returnPolicy: String,
      announcement: String,
    },
    faqs: [
      {
        question: { type: String, trim: true },
        answer: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true },
);

/* ---------------- Notification ---------------- */
const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "new_order",
        "low_stock",
        "out_of_stock",
        "expired_product",
        "new_customer",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: String,
    link: String,
    isRead: { type: Boolean, default: false },
    relatedId: mongoose.Schema.Types.ObjectId, // e.g. order id, product id
  },
  { timestamps: true },
);

/* ---------------- Review ---------------- */
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
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);
ReviewSchema.index({ product: 1, customer: 1 }, { unique: true });

/* ---------------- Wishlist ---------------- */
const WishlistSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true },
);

/* ---------------- Cart ---------------- */
const CartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, default: 1 },
  },
  { _id: false },
);

const CartSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    sessionId: String, // for guest carts
    items: [CartItemSchema],
    couponCode: String,
  },
  { timestamps: true },
);

/* ---------------- StockHistory ---------------- */
const StockHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["purchase", "sale", "adjustment", "damaged", "returned", "order"],
      required: true,
    },
    quantityChange: { type: Number, required: true }, // positive = increase, negative = decrease
    stockAfter: { type: Number, required: true },
    reference: String, // invoice number / order number
    note: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Brand =
  mongoose.models.Brand || mongoose.model("Brand", BrandSchema);
export const Expense =
  mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
export const Coupon =
  mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
export const Banner =
  mongoose.models.Banner || mongoose.model("Banner", BannerSchema);
export const Settings =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
export const Review =
  mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export const Wishlist =
  mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);
export const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);
export const StockHistory =
  mongoose.models.StockHistory ||
  mongoose.model("StockHistory", StockHistorySchema);
