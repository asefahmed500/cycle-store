import { NextResponse } from "next/server"
import dbConnect from "@/config/db"
import User from "@/models/User"
import { hash } from "bcryptjs"
import { z } from "zod"

// Define validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()

    // Validate request body
    const validationResult = signupSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }))
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 })
    }

    const { name, email, password } = validationResult.data

    // Check for existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    }).lean()

    if (existingUser) {
      return NextResponse.json(
        {
          error: "This email is already registered",
        },
        { status: 400 },
      )
    }

    // Hash password with higher cost factor
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await User.create({
      name: name?.trim() || email.split("@")[0],
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
    })

    // Return success without password
    const userWithoutPassword = user.toJSON()
    delete userWithoutPassword.password

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)

    if ((error as any).code === 11000) {
      return NextResponse.json(
        {
          error: "This email is already registered",
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "An error occurred during signup",
      },
      { status: 500 },
    )
  }
}

