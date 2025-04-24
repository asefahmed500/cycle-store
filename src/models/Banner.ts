import { Schema, model, models } from "mongoose"

const bannerSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    linkUrl: {
      type: String,
    },
    position: {
      type: String,
      enum: ["home_hero", "home_middle", "home_bottom", "category_top", "sidebar"],
      default: "home_hero",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    backgroundColor: {
      type: String,
      default: "#ffffff",
    },
    textColor: {
      type: String,
      default: "#000000",
    },
    buttonText: {
      type: String,
    },
    buttonColor: {
      type: String,
      default: "#0f172a",
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

const Banner = models.Banner || model("Banner", bannerSchema)
export default Banner

