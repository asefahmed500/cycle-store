import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Order from "@/models/Order"
import type mongoose from "mongoose"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get basic stats
    const totalOrders = await Order.countDocuments()
    const recentOrdersLean = await Order.find().sort({ createdAt: -1 }).limit(5).lean()

    // Type assertion for lean results
    const recentOrders = recentOrdersLean as unknown as Array<{
      _id: mongoose.Types.ObjectId
      userId: mongoose.Types.ObjectId
      items: Array<{ name: string; quantity: number; price: number }>
      total: number
      status: string
      createdAt: Date
      stripeSessionId: string
    }>

    return NextResponse.json({
      totalOrders,
      recentOrders: recentOrders.map((order) => ({
        _id: order._id.toString(),
        userId: order.userId.toString(),
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        itemCount: order.items?.length || 0,
      })),
    })
  } catch (error) {
    console.error("Debug route error:", error)
    return NextResponse.json({ error: "Debug route failed" }, { status: 500 })
  }
}

