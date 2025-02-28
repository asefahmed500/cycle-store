import { Schema, model, models } from "mongoose"

const cartItemSchema = new Schema({
  bicycle: {
    type: Schema.Types.Mixed, // Changed from ObjectId to Mixed to handle both ObjectId and string
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
      unique: true,
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

// Remove duplicate indexes
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ googleId: 1 }, { sparse: true })

const User = models.User || model("User", userSchema)
export default User

