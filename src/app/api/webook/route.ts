import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import dbConnect from "@/config/db"
import Order from "@/models/Order"
import User from "@/models/User"
import mongoose from "mongoose"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  const body = await request.text()
  const sig = headers().get("stripe-signature")

  if (!sig || !endpointSecret) {
    return NextResponse.json({ error: "Missing signature or endpoint secret" }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(body, sig, endpointSecret)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      await dbConnect()

      // Get the user from the metadata
      const userId = session.metadata?.userId
      if (!userId) {
        throw new Error("No user ID in session metadata")
      }

      // Convert string ID to ObjectId
      const userObjectId = new mongoose.Types.ObjectId(userId)

      // Get the line items from the session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

      console.log("Creating order for user:", userId)
      console.log("Line items:", lineItems.data)

      // Create the order
      const order = await Order.create({
        userId: userObjectId,
        stripeSessionId: session.id,
        total: session.amount_total ? session.amount_total / 100 : 0,
        status: "processing",
        items: lineItems.data.map((item) => ({
          name: item.description || "Product",
          price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
          quantity: item.quantity || 1,
        })),
        shippingAddress: session.shipping_details
          ? {
              name: session.shipping_details.name,
              address: session.shipping_details.address?.line1,
              city: session.shipping_details.address?.city,
              state: session.shipping_details.address?.state,
              postalCode: session.shipping_details.address?.postal_code,
              country: session.shipping_details.address?.country,
            }
          : undefined,
      })

      console.log("Order created:", order._id)

      // Clear the user's cart after successful order
      await User.findByIdAndUpdate(userObjectId, { $set: { cart: [] } })

      return NextResponse.json({ message: "Order created successfully" })
    }

    return NextResponse.json({ message: "Event processed" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}

