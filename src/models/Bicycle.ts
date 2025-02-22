import mongoose from "mongoose"

const BicycleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for the bicycle"],
    },
    brand: {
      type: String,
      required: [true, "Please provide a brand"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    specifications: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, "Please provide stock quantity"],
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const Bicycle = mongoose.models.Bicycle || mongoose.model("Bicycle", BicycleSchema)

export default Bicycle

