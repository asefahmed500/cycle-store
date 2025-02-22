import mongoose from "mongoose"
import User from "../models/User"

const MONGODB_URI = process.env.MONGODB_URI
const userEmail = process.argv[2] // Get email from command line argument

if (!userEmail) {
  console.error("Please provide a user email as an argument")
  process.exit(1)
}

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

async function makeAdmin() {
  try {
    const user = await User.findOneAndUpdate({ email: userEmail }, { $set: { role: "admin" } }, { new: true })

    if (user) {
      console.log(`User ${user.email} has been updated to admin role`)
    } else {
      console.log(`User with email ${userEmail} not found`)
    }
  } catch (error) {
    console.error("Error updating user:", error)
  } finally {
    mongoose.disconnect()
  }
}

makeAdmin()

