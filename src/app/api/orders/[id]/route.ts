import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Order from "@/models/Order"

interface UpdateOrderStatusBody {
  status: string
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status }: UpdateOrderStatusBody = await request.json()
    await dbConnect()
    const order = await Order.findByIdAndUpdate(params.id, { status }, { new: true })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Order status updated successfully" })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "An error occurred while updating the order status" }, { status: 500 })
  }
}

