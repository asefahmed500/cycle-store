import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/config/db"
import Banner from "@/models/Banner"
import { authOptions } from "@/config/auth"

interface BannerData {
  _id: string
  title: string
  imageUrl: string
  link: string
  isActive: boolean
  startDate?: Date
  endDate?: Date
}

interface BannerRequestBody {
  title: string
  imageUrl: string
  link: string
  isActive?: boolean
  startDate?: Date
  endDate?: Date
}

export async function GET(request: Request): Promise<NextResponse<BannerData[] | { error: string }>> {
  try {
    await dbConnect()
    const banners = await Banner.find({})
    return NextResponse.json(banners)
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ error: "An error occurred while fetching banners" }, { status: 500 })
  }
}

export async function POST(request: Request): Promise<NextResponse<BannerData | { error: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const bannerData: BannerRequestBody = await request.json()
    const banner = await Banner.create(bannerData)
    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json({ error: "An error occurred while creating the banner" }, { status: 500 })
  }
}

