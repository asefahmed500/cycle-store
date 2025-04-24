import { NextResponse } from "next/server"
import dbConnect from "@/config/db"
import Banner from "@/models/Banner"

// GET active banners for the frontend
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get("position")
    const limit = Number.parseInt(searchParams.get("limit") || "5")

    await dbConnect()

    // Simplified query to just check for active banners and position
    const query: any = {
      isActive: true,
    }

    // Filter by position if provided
    if (position) {
      query.position = position
    }

    // Get banners sorted by priority (higher first) and then by creation date
    const banners = await Banner.find(query).sort({ priority: -1, createdAt: -1 }).limit(limit)

    // Log the results for debugging
    console.log(`Found ${banners.length} banners for position: ${position || "all"}`)

    if (banners.length > 0) {
      console.log("First banner details:", {
        id: banners[0]._id,
        title: banners[0].title,
        position: banners[0].position,
        isActive: banners[0].isActive,
      })
    }

    return NextResponse.json({ banners })
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
  }
}

