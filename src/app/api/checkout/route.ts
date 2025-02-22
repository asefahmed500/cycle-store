import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import dbConnect from "@/config/db";
import Order from "@/models/Order";
import Bicycle from "@/models/Bicycle";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

// Sample products data (same as in cart route)
const sampleBicycles = [
  {
    _id: "65f1c5c33cd7f87654321001",
    name: "Mountain Explorer Pro",
    price: 899.99,
    image:
      "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    _id: "65f1c5c33cd7f87654321002",
    name: "City Cruiser Deluxe",
    price: 599.99,
    image:
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    _id: "65f1c5c33cd7f87654321003",
    name: "Road Master Elite",
    price: 1299.99,
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    _id: "65f1c5c33cd7f87654321004",
    name: "Electric City Rider",
    price: 1599.99,
    image:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    _id: "65f1c5c33cd7f87654321005",
    name: "Kids Adventure",
    price: 299.99,
    image:
      "https://images.unsplash.com/photo-1595432541891-a461100d3054?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    _id: "65f1c5c33cd7f87654321006",
    name: "BMX Freestyle",
    price: 449.99,
    image:
      "https://images.unsplash.com/photo-1583447778626-3c755c3d1e64?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
];

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingDetails {
  name: string;
  address: string;
  city: string;
  zipCode: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const {
      cart,
      shippingDetails,
    }: { cart: CartItem[]; shippingDetails: ShippingDetails } =
      await request.json();

    // Validate cart
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Invalid cart data" }, { status: 400 });
    }

    // Validate shipping details
    if (
      !shippingDetails ||
      !shippingDetails.name ||
      !shippingDetails.address ||
      !shippingDetails.city ||
      !shippingDetails.zipCode
    ) {
      return NextResponse.json(
        { error: "Invalid shipping details" },
        { status: 400 }
      );
    }

    // Validate products and check stock
    await Promise.all(
      cart.map(async (item) => {
        // Check if it's a sample product
        const isSampleProduct = item.productId.match(
          /^65f1c5c33cd7f8765432100[1-6]$/
        );

        if (isSampleProduct) {
          const sampleProduct = sampleBicycles.find(
            (p) => p._id === item.productId
          );
          if (!sampleProduct) {
            throw new Error(`Sample product ${item.name} not found`);
          }
          // No stock check for sample products
          return true;
        } else {
          // Real product from database
          const product = await Bicycle.findById(item.productId);
          if (!product) {
            throw new Error(`Product ${item.name} not found`);
          }
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.name}`);
          }
          return true;
        }
      })
    );

    // Create line items for Stripe
    const lineItems = cart.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: session.user.email!,
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB"],
      },
      success_url: `${process.env.NEXT_PUBLIC_API_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/checkout`,
      metadata: {
        userId: session.user.id,
        shippingName: shippingDetails.name,
        shippingAddress: shippingDetails.address,
        shippingCity: shippingDetails.city,
        shippingZipCode: shippingDetails.zipCode,
      },
    });

    // Create order in database
    const order = await Order.create({
      user: session.user.id,
      items: cart.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      })),
      totalAmount: cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      status: "pending",
      shippingAddress: `${shippingDetails.name}, ${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.zipCode}`,
      stripeSessionId: stripeSession.id,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      sessionId: stripeSession.id,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while processing the order",
      },
      { status: 500 }
    );
  }
}
