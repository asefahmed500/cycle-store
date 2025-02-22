import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Order from "@/models/Order"

interface OrderData {
  _id: string
  user: {
    name: string
    email: string
  }
  items: Array<{
    product: {
      name: string
    }
    quantity: number
    price: number
  }>
  totalAmount: number
  status: string
  shippingAddress: string
  createdAt: string
}

export async function GET(request: Request): Promise<NextResponse<OrderData[] | { error: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const orders = await Order.find().sort("-createdAt").populate("user", "name email")
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "An error occurred while fetching orders" }, { status: 500 })
  }
}

