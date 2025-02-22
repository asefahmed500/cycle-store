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

export async function GET(request: Request) {
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

    // For development/demo purposes, handle both sample and database items
    const transformedCart = await Promise.all(
      user.cart.map(async (item: any) => {
        // Check if it's a sample product
        const isSampleProduct = item.bicycle.toString().match(/^65f1c5c33cd7f8765432100[1-6]$/)
        let bicycleData

        if (isSampleProduct) {
          bicycleData = sampleBicycles.find((b) => b._id === item.bicycle.toString())
        } else {
          bicycleData = await Bicycle.findById(item.bicycle)
        }

        if (!bicycleData) {
          return null
        }

        return {
          productId: item.bicycle.toString(),
          name: bicycleData.name,
          price: bicycleData.price,
          quantity: item.quantity,
          image: bicycleData.image,
        }
      }),
    )

    // Filter out any null values (items that weren't found)
    const validCart = transformedCart.filter((item) => item !== null)

    return NextResponse.json({ cart: validCart })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "An error occurred while fetching the cart" }, { status: 500 })
  }
}

// Update the sample bicycles array with more products
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
]

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    // For development/demo purposes, allow sample product IDs
    const isSampleProduct = productId.match(/^65f1c5c33cd7f8765432100[1-6]$/)

    if (!isSampleProduct && !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    await dbConnect()
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find the product (either sample or from database)
    let product
    if (isSampleProduct) {
      product = sampleBicycles.find((b) => b._id === productId)
    } else {
      product = await Bicycle.findById(productId)
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update or add to cart
    const existingItemIndex = user.cart.findIndex((item: any) => item.bicycle.toString() === productId)

    if (existingItemIndex > -1) {
      user.cart[existingItemIndex].quantity += quantity
    } else {
      user.cart.push({
        bicycle: productId,
        quantity: quantity,
      })
    }

    await user.save()

    // Transform cart for response
    const transformedCart = user.cart.map((item: any) => {
      const productData = isSampleProduct ? sampleBicycles.find((b) => b._id === item.bicycle.toString()) : product

      return {
        productId: item.bicycle.toString(),
        name: productData.name,
        price: productData.price,
        quantity: item.quantity,
        image: productData.image,
      }
    })

    return NextResponse.json({
      message: "Item added to cart",
      cart: transformedCart,
    })
  } catch (error) {
    console.error("Cart error:", error)
    return NextResponse.json({ error: "An error occurred while updating the cart" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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

