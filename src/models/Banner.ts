import mongoose from "mongoose"

const BannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title for the banner"],
    },
    imageUrl: {
      type: String,
      required: [true, "Please provide an image URL for the banner"],
    },
    link: String,
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Banner || mongoose.model("Banner", BannerSchema)

