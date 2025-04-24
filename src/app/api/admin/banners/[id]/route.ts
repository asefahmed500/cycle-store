import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Banner from "@/models/Banner"
import mongoose from "mongoose"

// GET a single banner by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid banner ID" }, { status: 400 })
    }

    await dbConnect()
    const banner = await Banner.findById(id)

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({ banner })
  } catch (error) {
    console.error("Error fetching banner:", error)
    return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 })
  }
}

// PUT update a banner
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid banner ID" }, { status: 400 })
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

    const banner = await Banner.findByIdAndUpdate(
      id,
      {
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
      },
      { new: true, runValidators: true },
    )

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Banner updated successfully",
      banner,
    })
  } catch (error) {
    console.error("Error updating banner:", error)
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 })
  }
}

// PATCH update specific banner fields
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid banner ID" }, { status: 400 })
    }

    const body = await request.json()

    await dbConnect()

    const banner = await Banner.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true })

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Banner updated successfully",
      banner,
    })
  } catch (error) {
    console.error("Error updating banner:", error)
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 })
  }
}

// DELETE a banner
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid banner ID" }, { status: 400 })
    }

    await dbConnect()

    const banner = await Banner.findByIdAndDelete(id)

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Banner deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting banner:", error)
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 })
  }
}

