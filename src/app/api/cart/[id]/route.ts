import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import User from "@/models/User"
import mongoose from "mongoose"
import type { Session } from "next-auth"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid bicycle ID format" }, { status: 400 })
    }

    await dbConnect()
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.cart = user.cart.filter((item: any) => item.bicycle.toString() !== params.id)
    await user.save()

    const updatedUser = await User.findById(session.user.id).populate("cart.bicycle")
    const transformedCart = updatedUser.cart.map((item: any) => ({
      productId: item.bicycle._id.toString(),
      name: item.bicycle.name,
      price: item.bicycle.price,
      quantity: item.quantity,
      image: item.bicycle.image,
    }))

    return NextResponse.json({
      message: "Item removed from cart",
      cart: transformedCart,
    })
  } catch (error) {
    console.error("Error removing item from cart:", error)
    return NextResponse.json({ error: "An error occurred while removing the item from cart" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid bicycle ID format" }, { status: 400 })
    }

    const { quantity } = await request.json()
    if (typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    await dbConnect()
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const itemIndex = user.cart.findIndex((item: any) => item.bicycle.toString() === params.id)
    if (itemIndex > -1) {
      user.cart[itemIndex].quantity = quantity
    }
    await user.save()

    const updatedUser = await User.findById(session.user.id).populate("cart.bicycle")
    const transformedCart = updatedUser.cart.map((item: any) => ({
      productId: item.bicycle._id.toString(),
      name: item.bicycle.name,
      price: item.bicycle.price,
      quantity: item.quantity,
      image: item.bicycle.image,
    }))

    return NextResponse.json({
      message: "Cart item updated",
      cart: transformedCart,
    })
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json({ error: "An error occurred while updating the cart item" }, { status: 500 })
  }
}

