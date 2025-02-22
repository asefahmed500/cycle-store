import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import Stripe from "stripe"
import dbConnect from "@/config/db"
import Order from "@/models/Order"
import { authOptions } from "@/config/auth"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const { cart, formData } = await request.json()

    const lineItems = cart.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // Stripe expects amounts in cents
      },
      quantity: item.quantity,
    }))

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_API_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/cart`,
      customer_email: session.user.email,
    })

    // Create order in database
    const order = await Order.create({
      user: session.user.id,
      items: cart.map((item: any) => ({
        product: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      status: "pending",
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
    })

    return NextResponse.json({ sessionId: stripeSession.id, orderId: order._id })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "An error occurred while processing the payment" }, { status: 500 })
  }
}

