import { NextResponse } from "next/server"
import { compare } from "bcryptjs"
import dbConnect from "@/config/db"
import User from "@/models/User"

interface LoginRequestBody {
  email: string
  password: string
}

export async function POST(request: Request) {
  try {
    await dbConnect()

    const { email, password }: LoginRequestBody = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !user.password) {
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    const isPasswordValid = await compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON()

    return NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "An error occurred during login",
      },
      { status: 500 },
    )
  }
}

