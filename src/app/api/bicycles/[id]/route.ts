import { NextResponse } from "next/server"
import dbConnect from "@/config/db"
import Bicycle from "@/models/Bicycle"
import mongoose from "mongoose"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid bicycle ID format" }, { status: 400 })
    }

    const bicycle = await Bicycle.findById(params.id)

    if (!bicycle) {
      return NextResponse.json({ error: "Bicycle not found" }, { status: 404 })
    }

    return NextResponse.json(bicycle)
  } catch (error) {
    console.error("Error fetching bicycle:", error)
    return NextResponse.json({ error: "An error occurred while fetching the bicycle" }, { status: 500 })
  }
}

