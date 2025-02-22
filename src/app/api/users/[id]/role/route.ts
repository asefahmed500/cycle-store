import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import User from "@/models/User"

interface UpdateRoleRequestBody {
  role: "user" | "admin"
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse<{ _id: string; name: string; email: string; role: string } | { error: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role } = (await request.json()) as UpdateRoleRequestBody
    if (!role || (role !== "user" && role !== "admin")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    await dbConnect()
    const user = await User.findByIdAndUpdate(params.id, { role }, { new: true }).select("-password")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "An error occurred while updating the user role" }, { status: 500 })
  }
}

