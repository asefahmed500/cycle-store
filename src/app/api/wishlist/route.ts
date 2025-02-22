import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import User from "@/models/User"
import mongoose from "mongoose" // Add this import

interface WishlistItem {
  bicycleId: string
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await dbConnect()
  const user = await User.findById(session.user.id).populate("wishlist")
  return NextResponse.json({ wishlist: user.wishlist || [] })
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bicycleId }: WishlistItem = await request.json()

    // Validate if bicycleId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(bicycleId)) {
      return NextResponse.json({ error: "Invalid bicycle ID format" }, { status: 400 })
    }

    await dbConnect()
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if the bicycle is already in the wishlist
    if (!user.wishlist.includes(bicycleId)) {
      user.wishlist.push(new mongoose.Types.ObjectId(bicycleId))
      await user.save()
    }

    return NextResponse.json({ message: "Item added to wishlist" })
  } catch (error) {
    console.error("Wishlist error:", error)
    return NextResponse.json({ error: "An error occurred while updating the wishlist" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bicycleId }: WishlistItem = await request.json()

    // Validate if bicycleId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(bicycleId)) {
      return NextResponse.json({ error: "Invalid bicycle ID format" }, { status: 400 })
    }

    await dbConnect()
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.wishlist = user.wishlist.filter((id: mongoose.Types.ObjectId) => id.toString() !== bicycleId)
    await user.save()

    return NextResponse.json({ message: "Item removed from wishlist" })
  } catch (error) {
    console.error("Wishlist error:", error)
    return NextResponse.json({ error: "An error occurred while updating the wishlist" }, { status: 500 })
  }
}

