import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import User from "@/models/User"
import Bicycle from "@/models/Bicycle"
import mongoose from "mongoose"

interface CartItemRequest {
  productId: string
  quantity: number
}

// Define interfaces for cart items
interface CartItemDB {
  bicycle: mongoose.Types.ObjectId | string
  quantity: number
  _id?: mongoose.Types.ObjectId
}


// Update the GET function to remove sample product handling
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Ensure cart exists and is an array
    if (!user.cart || !Array.isArray(user.cart)) {
      return NextResponse.json({ cart: [] })
    }

    // Transform cart items - only use database products
    const transformedCart = await Promise.all(
      user.cart
        .filter((item: CartItemDB) => item && item.bicycle)
        .map(async (item: CartItemDB) => {
          try {
            // Get the bicycle ID string
            const bicycleId = item.bicycle.toString()

            if (!bicycleId || !mongoose.Types.ObjectId.isValid(bicycleId)) {
              return null
            }

            // Find the product in the database
            const bicycleData = await Bicycle.findById(bicycleId)

            if (!bicycleData) {
              return null
            }

            return {
              productId: bicycleId,
              name: bicycleData.name,
              price: bicycleData.price,
              quantity: item.quantity || 1,
              image: bicycleData.image,
            }
          } catch (error) {
            console.error("Error processing cart item:", error)
            return null
          }
        }),
    )

    // Filter out null values and clean up the cart if needed
    const validCart = transformedCart.filter((item): item is NonNullable<typeof item> => item !== null)

    // If there were invalid items, update the user's cart to remove them
    if (validCart.length !== user.cart.length) {
      try {
        user.cart = validCart.map((item) => ({
          bicycle: item.productId,
          quantity: item.quantity,
        }))
        await user.save()
      } catch (error) {
        console.error("Error cleaning up cart:", error)
      }
    }

    return NextResponse.json({ cart: validCart })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "An error occurred while fetching the cart" }, { status: 500 })
  }
}

// Fix the POST function to handle product IDs
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received cart POST request with body:", body)

    const { productId, quantity = 1 }: CartItemRequest = body

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    await dbConnect()
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find the product from database
    const product = await Bicycle.findById(productId)

    if (!product) {
      console.log(`Product not found with ID: ${productId}`)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    console.log(`Found product: ${product.name} with ID: ${product._id}`)

    // Update or add to cart
    const existingItemIndex = user.cart.findIndex(
      (item: any) => item.bicycle && item.bicycle.toString() === product._id.toString(),
    )

    if (existingItemIndex > -1) {
      user.cart[existingItemIndex].quantity += quantity
      console.log(`Updated quantity for existing item to: ${user.cart[existingItemIndex].quantity}`)
    } else {
      user.cart.push({
        bicycle: product._id,
        quantity: quantity,
      })
      console.log(`Added new item to cart with quantity: ${quantity}`)
    }

    await user.save()
    console.log("User cart saved successfully")

    // Get the updated cart to return in the response
    const updatedUser = await User.findById(session.user.id)

    // Helper function to find a product in the database

    // Transform cart items
    const transformedCart = await Promise.all(
      updatedUser.cart.map(async (item: CartItemDB) => {
        const bicycleId = item.bicycle.toString()
        const bicycleData = await Bicycle.findById(bicycleId)

        if (!bicycleData) {
          console.log(`Warning: Product with ID ${bicycleId} not found when transforming cart`)
          return null
        }

        return {
          productId: bicycleId,
          name: bicycleData.name,
          price: bicycleData.price,
          quantity: item.quantity,
          image: bicycleData.image,
        }
      }),
    )

    // Filter out null values
    const validCart = transformedCart.filter((item): item is NonNullable<typeof item> => item !== null)

    return NextResponse.json({
      message: "Item added to cart",
      cart: validCart,
    })
  } catch (error) {
    console.error("Cart error:", error)
    return NextResponse.json({ error: "An error occurred while updating the cart" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.cart = []
    await user.save()
    return NextResponse.json({ message: "Cart cleared" })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ error: "An error occurred while clearing the cart" }, { status: 500 })
  }
}

