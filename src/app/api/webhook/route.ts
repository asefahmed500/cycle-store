import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import dbConnect from "@/config/db"
import Order from "@/models/Order"
import User from "@/models/User"
import mongoose from "mongoose"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// If you're testing locally, you might not have the webhook secret
// In that case, we'll create orders directly in the checkout endpoint
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  const body = await request.text()
  const sig = headers().get("stripe-signature")

  let event: Stripe.Event

  try {
    // Verify the webhook signature if we have a secret
    if (sig && endpointSecret) {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } else {
      // For local testing without webhook signature
      event = JSON.parse(body) as Stripe.Event
    }

    console.log("Received webhook event:", event.type)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      console.log("Processing completed checkout session:", session.id)

      await dbConnect()

      // Get the user from the metadata
      const userId = session.metadata?.userId
      if (!userId) {
        console.log("No user ID in session metadata")
        throw new Error("No user ID in session metadata")
      }

      console.log("User ID from metadata:", userId)

      // Ensure we're creating the order with the correct user ID
      try {
        // Convert string ID to ObjectId with proper error handling
        let userObjectId
        try {
          userObjectId = new mongoose.Types.ObjectId(userId)
          console.log("Valid ObjectId created:", userObjectId)
        } catch (idError) {
          console.error("Failed to create ObjectId:", idError)
          throw new Error("Invalid user ID format")
        }

        // Get the line items from the session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
        console.log("Line items:", lineItems.data)

        // Create the order with proper error handling
        try {
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

          console.log("Order created successfully with ID:", order._id)
          console.log("Order details:", JSON.stringify(order, null, 2))

          // Clear the user's cart
          await User.findByIdAndUpdate(userObjectId, { $set: { cart: [] } })
          console.log("User cart cleared")

          // Verify the order was created correctly
          const verifyOrder = await Order.findById(order._id)
          if (!verifyOrder) {
            console.error("Order verification failed - order not found after creation")
            throw new Error("Order verification failed")
          }
          console.log("Order verified with user ID:", verifyOrder.userId)

          return NextResponse.json({
            message: "Order created successfully",
            orderId: order._id,
          })
        } catch (orderError) {
          console.error("Error creating order:", orderError)
          throw orderError
        }
      } catch (error) {
        console.error("Error creating order:", error)
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
      }
    }

    return NextResponse.json({ message: "Event processed" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook handler failed" },
      { status: 400 },
    )
  }
}

