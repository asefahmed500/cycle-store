import mongoose from "mongoose"

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Please provide a coupon code"],
      unique: true,
    },
    discountPercentage: {
      type: Number,
      required: [true, "Please provide a discount percentage"],
      min: 0,
      max: 100,
    },
    validFrom: Date,
    validUntil: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema)

