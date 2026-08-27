import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,
  },
  { _id: false },
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, trim: true },
    barcode: { type: String, unique: true, sparse: true, trim: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },

    description: String,
    shortDescription: String,

    images: [ImageSchema],

    // Pricing
    purchasePrice: { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true, default: 0 },
    oldPrice: { type: Number, default: 0 }, // for showing strike-through discount
    discountPrice: { type: Number, default: 0 }, // final discounted price
    discountPercent: { type: Number, default: 0 },

    // Inventory
    stock: { type: Number, required: true, default: 0 },
    unit: {
      type: String,
      enum: ["kg", "g", "litre", "ml", "pcs", "dozen", "bag", "box"],
      default: "pcs",
    },
    weight: String, // e.g. "1kg", "500g"
    lowStockThreshold: { type: Number, default: 5 },

    expiryDate: Date,

    tags: [{ type: String, trim: true }],

    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    flashSaleEndsAt: Date,

    // Aggregated / cached fields (updated by app logic, not user input)
    totalSold: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    seo: {
      metaTitle: String,
      metaDescription: String,
    },
  },
  { timestamps: true },
);

ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ stock: 1 });

// ── Naye indexes — home page facet aggregation ke liye ──────────
ProductSchema.index({ status: 1, isFlashSale: 1, createdAt: -1 });
ProductSchema.index({ status: 1, isFeatured: 1, createdAt: -1 });
ProductSchema.index({ status: 1, isNewArrival: 1, createdAt: -1 });
ProductSchema.index({ status: 1, totalSold: -1 });

// Virtual: availability label
ProductSchema.virtual("availability").get(function () {
  if (this.stock <= 0) return "out_of_stock";
  if (this.stock <= this.lowStockThreshold) return "low_stock";
  return "in_stock";
});

ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
