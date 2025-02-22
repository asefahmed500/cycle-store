import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Order from "@/models/Order"

interface SalesData {
  totalRevenue: number
  monthlySales: {
    _id: string
    total: number
  }[]
  topSellingProducts: {
    name: string
    totalQuantity: number
    totalRevenue: number
  }[]
}

export async function GET(request: Request): Promise<NextResponse<SalesData | { error: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get total revenue
    const totalRevenue = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    // Get monthly sales for the last 12 months
    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          name: "$productDetails.name",
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ])

    return NextResponse.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlySales,
      topSellingProducts,
    })
  } catch (error) {
    console.error("Error fetching sales data:", error)
    return NextResponse.json({ error: "An error occurred while fetching sales data" }, { status: 500 })
  }
}

