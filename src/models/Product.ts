import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
    },
    category: {
      type: String,
      required: [true, "Please provide a product category"],
    },
    brand: {
      type: String,
      required: [true, "Please provide a product brand"],
    },
    stock: {
      type: Number,
      required: [true, "Please provide the stock quantity"],
      min: 0,
    },
    image: {
      type: String,
      required: [true, "Please provide an image URL"],
    },
  },
  { timestamps: true },
)

export default mongoose.models.Product || mongoose.model("Product", ProductSchema)

