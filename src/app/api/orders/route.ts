import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Order from "@/models/Order"
import mongoose from "mongoose"

export async function GET(request: Request) {
  try {
    // Get and validate session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching orders for user:", session.user.id)

    // Connect to database
    await dbConnect()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    try {
      // Convert string ID to ObjectId with validation
      const userId = new mongoose.Types.ObjectId(session.user.id)

      // Get orders for the user, sorted by most recent first
      const ordersQuery = Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit)

      // Execute the query and convert to plain objects
      const orders = await ordersQuery.lean()

      console.log(`Found ${orders.length} orders for user ${session.user.id}`)

      // Get total count for pagination
      const total = await Order.countDocuments({ userId })

      // Transform orders for the response
      const transformedOrders = orders.map((order) => ({
        _id: order._id.toString(),
        items: Array.isArray(order.items)
          ? order.items.map((item) => ({
              name: item.name || "Unknown Product",
              quantity: item.quantity || 1,
              price: item.price || 0,
            }))
          : [],
        total: order.total || 0,
        status: order.status || "pending",
        createdAt: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
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
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          error: "Database operation failed",
          details: dbError instanceof Error ? dbError.message : "Unknown database error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      {
        error: "An error occurred while fetching orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

