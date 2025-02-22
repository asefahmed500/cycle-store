import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import dbConnect from "@/config/db"
import Order from "@/models/Order"
import Bicycle from "@/models/Bicycle"
import User from "@/models/User"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get("stripe-signature")

  let event: Stripe.Event

  try {
    if (!sig || !endpointSecret) {
      throw new Error("Missing Stripe webhook secret")
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  try {
    await dbConnect()

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      // Find and update the order
      const order = await Order.findOne({ stripeSessionId: session.id })
      if (!order) {
        throw new Error("Order not found")
      }

      // Update order status
      order.status = "processing"
      order.paymentInfo = {
        stripePaymentId: session.payment_intent,
        status: "paid",
        paidAt: new Date(),
      }
      await order.save()

      // Update product stock
      for (const item of order.items) {
        await Bicycle.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
      }

      // Clear user's cart
      await User.findByIdAndUpdate(session.metadata?.userId, { $set: { cart: [] } })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

