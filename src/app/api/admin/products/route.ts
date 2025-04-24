import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Bicycle from "@/models/Bicycle"

// GET all products
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const products = await Bicycle.find().sort({ createdAt: -1 })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST create a new product
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, brand, category, price, description, image, stock } = body

    // Validate required fields
    if (!name || !brand || !category || !price || !image) {
      return NextResponse.json({ error: "Name, brand, category, price, and image are required" }, { status: 400 })
    }

    await dbConnect()

    const product = await Bicycle.create({
      name,
      brand,
      category,
      price,
      description,
      image,
      stock: stock || 0,
    })

    return NextResponse.json(
      {
        message: "Product created successfully",
        product,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

