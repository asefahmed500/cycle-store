import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { hash, compare } from "bcryptjs"
import dbConnect from "@/config/db"
import User from "@/models/User"
import { authOptions } from "@/config/auth"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const { name, email, currentPassword, newPassword, confirmPassword } = await request.json()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.name = name
    user.email = email

    if (currentPassword && newPassword) {
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "New passwords do not match" }, { status: 400 })
      }

      const isPasswordValid = await compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      user.password = await hash(newPassword, 10)
    }

    await user.save()

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "An error occurred while updating the profile" }, { status: 500 })
  }
}

