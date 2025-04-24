import { Schema, model, models, type Document, type Model } from "mongoose"

// Define interfaces for TypeScript
interface OrderItem {
  name: string
  quantity: number
  price: number
  image?: string
}

interface OrderDocument extends Document {
  userId: Schema.Types.ObjectId
  items: OrderItem[]
  total: number
  status: string
  stripeSessionId: string
  createdAt: Date
  updatedAt: Date
  shippingAddress?: {
    name?: string
    address?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

// Define the schema
const orderItemSchema = new Schema<OrderItem>({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  image: String,
})

const orderSchema = new Schema<OrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
    },
    shippingAddress: {
      name: String,
      address: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
  },
  {
    timestamps: true,
  },
)

// Create and export the model with proper typing
const Order: Model<OrderDocument> = models.Order || model<OrderDocument>("Order", orderSchema)
export default Order

