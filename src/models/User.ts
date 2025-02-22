import mongoose, { type Document } from "mongoose"

export interface IUser extends Document {
  name?: string
  email: string
  password?: string
  role: "user" | "admin"
  googleId?: string
  cart: Array<{
    bicycle: mongoose.Types.ObjectId
    quantity: number
  }>
  wishlist: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password by default in queries
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    googleId: {
      type: String,
      sparse: true,
    },
    cart: [
      {
        bicycle: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Bicycle",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity cannot be less than 1"],
        },
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bicycle",
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Remove password when converting to JSON
UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password
    return ret
  },
})

// Remove duplicate indexes and create proper ones
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ googleId: 1 }, { sparse: true, unique: true })

// Only create the model if it doesn't exist
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User

