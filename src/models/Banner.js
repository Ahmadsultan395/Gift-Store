import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    badgeText: {
      type: String,
      default: "",
    },

    title: {
      type: String,
      required: true,
    },

    subtitle: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      url: String,
      publicId: String,
    },

    // Optional — plays in the hero slider once loaded; the image above
    // is used as the poster/fallback until the video is ready.
    // Naming (url/publicId) matches the `image` field exactly.
    video: {
      url: String,
      publicId: String,
    },

    type: {
      type: String,
      enum: ["hero", "poster", "flash_sale", "offer", "festival"],
      default: "hero",
    },

    link: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Banner || mongoose.model("Banner", BannerSchema);
