import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Banner from "@/models/Banner"

// GET all banners
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const banners = await Banner.find().sort({ priority: -1, createdAt: -1 })

    return NextResponse.json({ banners })
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
  }
}

// POST create a new banner
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      subtitle,
      imageUrl,
      linkUrl,
      position,
      isActive,
      startDate,
      endDate,
      backgroundColor,
      textColor,
      buttonText,
      buttonColor,
      priority,
    } = body

    // Validate required fields
    if (!title || !imageUrl || !position) {
      return NextResponse.json({ error: "Title, image URL, and position are required" }, { status: 400 })
    }

    await dbConnect()

    const banner = await Banner.create({
      title,
      subtitle,
      imageUrl,
      linkUrl,
      position,
      isActive,
      startDate,
      endDate,
      backgroundColor,
      textColor,
      buttonText,
      buttonColor,
      priority: priority || 0,
    })

    return NextResponse.json(
      {
        message: "Banner created successfully",
        banner,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 })
  }
}

