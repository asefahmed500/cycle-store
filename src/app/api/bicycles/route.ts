import { NextResponse } from "next/server"
import dbConnect from "@/config/db"
import Bicycle from "@/models/Bicycle"

// GET all bicycles for public display
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const brand = searchParams.get("brand")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sort = searchParams.get("sort") || "createdAt"
    const order = searchParams.get("order") || "desc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    await dbConnect()

    // Build query
    const query: any = {}

    if (category) {
      query.category = category
    }

    if (brand) {
      query.brand = brand
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number.parseFloat(minPrice)
      if (maxPrice) query.price.$lte = Number.parseFloat(maxPrice)
    }

    // Get total count for pagination
    const total = await Bicycle.countDocuments(query)

    // Get bicycles with pagination and sorting
    const bicycles = await Bicycle.find(query)
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)

    // Get unique categories and brands for filters
    const categories = await Bicycle.distinct("category")
    const brands = await Bicycle.distinct("brand")

    return NextResponse.json({
      bicycles,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      filters: {
        categories,
        brands,
      },
    })
  } catch (error) {
    console.error("Error fetching bicycles:", error)
    return NextResponse.json({ error: "Failed to fetch bicycles" }, { status: 500 })
  }
}

