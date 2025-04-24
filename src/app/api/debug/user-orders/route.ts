import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import dbConnect from "@/config/db";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get the user ID
    const userId = session.user.id;
    console.log("Debugging orders for user:", userId);

    try {
      // Convert to ObjectId
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Get all orders for the user
      const ordersLean = await Order.find({ userId: userObjectId }).lean();

      // Type assertion for lean results
      const orders = ordersLean as unknown as Array<{
        _id: mongoose.Types.ObjectId;
        userId: mongoose.Types.ObjectId;
        items: Array<{ name: string; quantity: number; price: number }>;
        total: number;
        status: string;
        createdAt: Date;
        stripeSessionId: string;
      }>;

      // Get total count
      const totalOrders = await Order.countDocuments({ userId: userObjectId });

      return NextResponse.json({
        userId,
        totalOrders,
        orders: orders.map((order) => ({
          _id: order._id.toString(),
          stripeSessionId: order.stripeSessionId,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
          itemCount: order.items?.length || 0,
          items: order.items?.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        })),
      });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch orders",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Debug route error:", error);
    return NextResponse.json({ error: "Debug route failed" }, { status: 500 });
  }
}
