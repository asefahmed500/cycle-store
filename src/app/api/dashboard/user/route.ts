import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Order from "@/models/Order"
import User from "@/models/User"
import mongoose from "mongoose"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page")) || 1
    const limit = 10
    const skip = (page - 1) * limit

    // Get user details
    const user = await User.findById(session.user.id).select("-password")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch orders with populated product details
    const orders = await Order.find({ user: session.user.id })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate("items.product", "name price image") // Populate product details

    // Transform orders to include all necessary information
    const transformedOrders = orders.map((order) => ({
      id: order._id,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item: any) => ({
        name: item.product?.name || "Product Not Found",
        price: item.price,
        quantity: item.quantity,
        image: item.product?.image,
      })),
    }))

    // Calculate total spent on delivered orders
    const totalSpent = await Order.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(session.user.id),
          status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ])

    // Get total number of orders
    const totalOrders = await Order.countDocuments({ user: session.user.id })

    // Get latest order date
    const lastOrder = await Order.findOne({ user: session.user.id }).sort("-createdAt").select("createdAt")

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
      },
      recentOrders: transformedOrders,
      totalSpent: totalSpent[0]?.total || 0,
      totalOrders,
      lastOrderDate: lastOrder?.createdAt,
    })
  } catch (error) {
    console.error("Error fetching user dashboard data:", error)
    return NextResponse.json({ error: "An error occurred while fetching dashboard data" }, { status: 500 })
  }
}

