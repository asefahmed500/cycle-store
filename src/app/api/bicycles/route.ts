import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/config/db"
import Bicycle from "@/models/Bicycle"
import { authOptions } from "@/config/auth"

export async function GET(request: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 10
    const featured = searchParams.get("featured") === "true"
    const skip = (page - 1) * limit

    const query = featured ? { featured: true } : {}

    const bicycles = await Bicycle.find(query).skip(skip).limit(limit)
    const total = await Bicycle.countDocuments(query)

    return NextResponse.json({
      bicycles,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBicycles: total,
    })
  } catch (error) {
    console.error("Error fetching bicycles:", error)
    return NextResponse.json({ error: "An error occurred while fetching bicycles" }, { status: 500 })
  }
}

interface BicycleRequestBody {
  name: string
  brand: string
  price: number
  category: string
  description: string
  specifications: string[]
  images: string[]
  stock: number
  featured: boolean
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const bicycleData: BicycleRequestBody = await request.json()
    const bicycle = await Bicycle.create(bicycleData)
    return NextResponse.json(bicycle, { status: 201 })
  } catch (error) {
    console.error("Error creating bicycle:", error)
    return NextResponse.json({ error: "An error occurred while creating the bicycle" }, { status: 500 })
  }
}

