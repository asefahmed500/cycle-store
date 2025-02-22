import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/config/db"
import User from "@/models/User"
import Bicycle from "@/models/Bicycle"
import Order from "@/models/Order"
import { authOptions } from "@/config/auth"

interface DashboardData {
  totalUsers: number
  totalBicycles: number
  totalOrders: number
  totalRevenue: number
  recentOrders: {
    id: string
    totalAmount: number
    status: string
    createdAt: string
    user: {
      name: string
      email: string
    }
  }[]
}

export async function GET(request: Request): Promise<NextResponse<DashboardData | { error: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const totalUsers = await User.countDocuments()
    const totalBicycles = await Bicycle.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalRevenue = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    const recentOrders = await Order.find().sort("-createdAt").limit(5).populate("user", "name email")

    return NextResponse.json({
      totalUsers,
      totalBicycles,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders: recentOrders.map((order) => ({
        id: order._id.toString(),
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        user: {
          name: order.user.name,
          email: order.user.email,
        },
      })),
    })
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
    return NextResponse.json({ error: "An error occurred while fetching dashboard data" }, { status: 500 })
  }
}

