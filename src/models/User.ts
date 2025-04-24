import { Schema, model, models } from "mongoose"

const cartItemSchema = new Schema({
  bicycle: {
    type: Schema.Types.Mixed,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
})

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Use this instead of explicit index
    },
    password: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true, // Use this instead of explicit index
    },
    cart: [cartItemSchema],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bicycle",
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Remove the duplicate index declarations
// userSchema.index({ email: 1 })
// userSchema.index({ googleId: 1 })

const User = models.User || model("User", userSchema)
export default User

