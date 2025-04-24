import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import Stripe from "stripe"
import { headers } from "next/headers"
import dbConnect from "@/config/db"
import Order from "@/models/Order"
import User from "@/models/User"
import mongoose from "mongoose"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    // Log the request for debugging
    console.log("Checkout request received")

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("Unauthorized: No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body:", body)

    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log("Invalid items array:", items)
      return NextResponse.json({ error: "Invalid request: items array is required" }, { status: 400 })
    }

    // Validate each item
    for (const item of items) {
      if (!item.name || !item.price || !item.quantity) {
        console.log("Invalid item:", item)
        return NextResponse.json(
          { error: "Invalid item data: each item must have name, price, and quantity" },
          { status: 400 },
        )
      }
    }

    // Get the host from headers
    const headersList = headers()
    const host = headersList.get("host") || process.env.VERCEL_URL || "localhost:3000"
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https"
    const baseUrl = `${protocol}://${host}`

    console.log("Base URL:", baseUrl)

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    console.log("Line items:", lineItems)

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: {
        userId: session.user.id,
      },
    })

    console.log("Stripe session created:", stripeSession.id)

    // For local development without webhooks, create the order directly
    if (process.env.NODE_ENV === "development" && !process.env.STRIPE_WEBHOOK_SECRET) {
      try {
        await dbConnect()

        // Convert string ID to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(session.user.id)

        // Create the order
        const order = await Order.create({
          userId: userObjectId,
          stripeSessionId: stripeSession.id,
          total: stripeSession.amount_total ? stripeSession.amount_total / 100 : 0,
          status: "processing",
          items: items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        })

        console.log("Order created directly (local development):", order._id)

        // Clear the user's cart
        await User.findByIdAndUpdate(userObjectId, { $set: { cart: [] } })
      } catch (error) {
        console.error("Error creating order directly:", error)
        // Don't return an error, just log it - we still want to return the Stripe session
      }
    }

    return NextResponse.json({
      sessionId: stripeSession.id,
      url: stripeSession.url,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "An error occurred during checkout" }, { status: 500 })
  }
}

