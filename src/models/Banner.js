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

    description: {
      type: String,
      default: "",
    },

    image: {
      url: String,
      public_id: String,
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
