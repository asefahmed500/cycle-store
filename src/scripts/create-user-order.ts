import dbConnect from "@/config/db"
import Order from "@/models/Order"
import mongoose from "mongoose"

async function createTestOrder(userId: string) {
  try {
    await dbConnect()
    console.log("Connected to database")

    // Validate the user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid user ID format")
      return
    }

    const userObjectId = new mongoose.Types.ObjectId(userId)

    // Create a test order
    const order = await Order.create({
      userId: userObjectId,
      stripeSessionId: `test_session_${Date.now()}`,
      total: 149.99,
      status: "completed",
      items: [
        {
          name: "Test Bicycle",
          price: 149.99,
          quantity: 1,
        },
      ],
      createdAt: new Date(),
    })

    console.log("Test order created:", order)

    // Verify the order exists
    const verifyOrder = await Order.findById(order._id)
    console.log("Order verification:", !!verifyOrder)

    // Get all orders for user
    const userOrders = await Order.find({ userId: userObjectId })
    console.log("Total orders for user:", userOrders.length)
    console.log("All user orders:", userOrders)
  } catch (error) {
    console.error("Error creating test order:", error)
  } finally {
    await mongoose.disconnect()
  }
}

// Get user ID from command line argument
const userId = process.argv[2]
if (!userId) {
  console.error("Please provide a user ID as a command line argument")
  process.exit(1)
}

// Run the function
createTestOrder(userId)

