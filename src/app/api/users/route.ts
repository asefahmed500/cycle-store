import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import User from "@/models/User"

interface UserData {
  _id: string
  name: string
  email: string
  role: string
}

export async function GET(request: Request): Promise<NextResponse<UserData[] | { error: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const users = await User.find().select("-password")
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "An error occurred while fetching users" }, { status: 500 })
  }
}

