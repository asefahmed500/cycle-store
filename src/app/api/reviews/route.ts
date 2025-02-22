import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/config/db"
import Review from "@/models/Review"
import { authOptions } from "@/config/auth"

export async function GET(request: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const bicycleId = searchParams.get("bicycleId")

    if (!bicycleId) {
      return NextResponse.json({ error: "Bicycle ID is required" }, { status: 400 })
    }

    const reviews = await Review.find({ bicycle: bicycleId }).populate("user", "name")
    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "An error occurred while fetching reviews" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const reviewData = await request.json()
    reviewData.user = session.user.id

    const review = await Review.create(reviewData)
    await review.populate("user", "name")
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "An error occurred while creating the review" }, { status: 500 })
  }
}

