import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Order from "@/models/Order"
import mongoose, { type Document } from "mongoose"

// Define interfaces for type safety
interface OrderItem {
  name: string
  quantity: number
  price: number
  image?: string
}

interface OrderDocument extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  items: OrderItem[]
  total: number
  status: string
  stripeSessionId: string
  createdAt: Date
  updatedAt: Date
  shippingAddress?: {
    name?: string
    address?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

interface TransformedOrder {
  _id: string
  totalAmount: number
  status: string
  createdAt: string
  items: Array<{
    product: {
      name: string
    }
    quantity: number
    price: number
  }>
}

interface DashboardData {
  user: {
    name: string | null | undefined
    email: string | null | undefined
  }
  recentOrders: TransformedOrder[]
  totalSpent: number
  totalOrders: number
  lastOrderDate: string | null
}

export async function GET(request: Request) {
  try {
    // 1. Get and validate session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Connect to database
    await dbConnect()

    // 3. Validate and parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"))
    const limit = 10
    const skip = (page - 1) * limit

    try {
      // 4. Convert string ID to ObjectId with validation
      const userId = new mongoose.Types.ObjectId(session.user.id)

      // Add more detailed logging to help diagnose the issue
      console.log("Starting dashboard data fetch for user:", session.user.id)

      // 5. Get orders with proper typing
      const ordersQuery = Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit)

      // Execute the query and convert to plain objects
      const orders = await ordersQuery.lean()

      console.log("Found orders:", orders.length)

      // 6. Calculate total stats
      const totalOrders = await Order.countDocuments({ userId })
      const totalSpentAgg = await Order.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ])

      const totalSpent = totalSpentAgg.length > 0 ? totalSpentAgg[0].total : 0

      // 7. Get last order date
      const lastOrder = await Order.findOne({ userId }).sort({ createdAt: -1 }).lean()

      // 8. Transform orders with type safety
      const transformedOrders = orders.map((order) => {
        return {
          _id: order._id.toString(),
          totalAmount: order.total || 0,
          status: order.status || "pending",
          createdAt: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
          items: Array.isArray(order.items)
            ? order.items.map((item) => ({
                product: {
                  name: item.name || "Unknown Product",
                },
                quantity: item.quantity || 1,
                price: item.price || 0,
              }))
            : [],
        }
      })

      console.log("Transformed orders:", JSON.stringify(transformedOrders, null, 2))

      // 9. Construct the response with proper typing
      const dashboardData = {
        user: {
          name: session.user.name,
          email: session.user.email,
        },
        recentOrders: transformedOrders,
        totalSpent,
        totalOrders,
        lastOrderDate: lastOrder?.createdAt ? lastOrder.createdAt.toISOString() : null,
      }

      return NextResponse.json(dashboardData)
    } catch (dbError) {
      console.error("Database error:", dbError)
      const errorMessage = dbError instanceof Error ? dbError.message : "Unknown error"
      return NextResponse.json({ error: "Database operation failed", details: errorMessage }, { status: 500 })
    }
  } catch (error) {
    console.error("Dashboard error:", error)  

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    if (error instanceof mongoose.Error) {
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

