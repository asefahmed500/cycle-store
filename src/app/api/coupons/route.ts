import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import dbConnect from "@/config/db"
import Coupon from "@/models/Coupon"
import { authOptions } from "@/config/auth"

interface CouponData {
  _id: string
  code: string
  discountPercentage: number
  validFrom: Date
  validUntil: Date
  isActive: boolean
}

interface CouponRequestBody {
  code: string
  discountPercentage: number
  validFrom?: Date
  validUntil?: Date
  isActive?: boolean
}

export async function GET(request: Request): Promise<NextResponse<CouponData[] | { error: string }>> {
  try {
    await dbConnect()
    const coupons = await Coupon.find({})
    return NextResponse.json(coupons)
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ error: "An error occurred while fetching coupons" }, { status: 500 })
  }
}

export async function POST(request: Request): Promise<NextResponse<CouponData | { error: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const couponData: CouponRequestBody = await request.json()
    const coupon = await Coupon.create(couponData)
    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ error: "An error occurred while creating the coupon" }, { status: 500 })
  }
}

