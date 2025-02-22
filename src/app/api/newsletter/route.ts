import { NextResponse } from "next/server"
import dbConnect from "@/config/db"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    await dbConnect()
    const { email } = await request.json()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      existingUser.newsletterSubscribed = true
      await existingUser.save()
    } else {
      await User.create({ email, newsletterSubscribed: true })
    }

    return NextResponse.json({ message: "Successfully subscribed to newsletter" })
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return NextResponse.json({ error: "An error occurred while subscribing to the newsletter" }, { status: 500 })
  }
}

