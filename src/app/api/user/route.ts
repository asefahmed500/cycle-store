import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import User from "@/models/User"
import { hash, compare } from "bcryptjs"

interface UpdateProfileRequestBody {
  name: string
  email: string
  currentPassword?: string
  newPassword?: string
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const user = await User.findById(session.user.id).select("-password")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "An error occurred while fetching user data" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, currentPassword, newPassword }: UpdateProfileRequestBody = await request.json()

    await dbConnect()
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (session.user.id !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized to edit this profile" }, { status: 403 })
    }

    user.name = name
    user.email = email

    if (currentPassword && newPassword) {
      const isPasswordValid = await compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }
      user.password = await hash(newPassword, 10)
    }

    await user.save()

    const updatedUser = user.toObject()
    delete updatedUser.password

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user data:", error)
    return NextResponse.json({ error: "An error occurred while updating user data" }, { status: 500 })
  }
}

