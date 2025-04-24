import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Order from "@/models/Order"

// GET all orders with pagination and filtering
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    // Filter by status if provided
    if (status && status !== "all") {
      query.status = status
    }

    // Search functionality
    if (search) {
      // Search by order ID, stripe session ID, or customer name
      query.$or = [
        { _id: { $regex: search, $options: "i" } },
        { stripeSessionId: { $regex: search, $options: "i" } },
        { "shippingAddress.name": { $regex: search, $options: "i" } },
      ]
    }

    // Get total count for pagination
    const total = await Order.countDocuments(query)

    // Get orders with pagination and sorting
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    // Transform orders for the response
    const transformedOrders = orders.map((order) => ({
      _id: order._id.toString(),
      userId: order.userId.toString(),
      items: order.items,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      stripeSessionId: order.stripeSessionId,
      shippingAddress: order.shippingAddress,
    }))

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

