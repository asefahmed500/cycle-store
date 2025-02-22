import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Product from "@/models/Product"

interface ProductData {
  _id: string
  name: string
  price: number
  category: string
  brand: string
  stock: number
  description: string
  image: string
}

interface ProductRequestBody {
  name: string
  price: number
  category: string
  brand: string
  stock: number
  description: string
  image: string
}

export async function GET(
  request: Request,
): Promise<NextResponse<{ products: ProductData[]; totalPages: number; currentPage: number } | { error: string }>> {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 10
    const skip = (page - 1) * limit

    const products = await Product.find().skip(skip).limit(limit)
    const total = await Product.countDocuments()

    return NextResponse.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "An error occurred while fetching products" }, { status: 500 })
  }
}

export async function POST(request: Request): Promise<NextResponse<ProductData | { error: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const productData: ProductRequestBody = await request.json()

    // Validate required fields
    const requiredFields = ["name", "description", "price", "category", "brand", "stock", "image"]
    for (const field of requiredFields) {
      if (!productData[field as keyof ProductRequestBody]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const product = await Product.create(productData)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "An error occurred while creating the product" }, { status: 500 })
  }
}

