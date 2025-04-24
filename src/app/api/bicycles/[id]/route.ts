import { NextResponse } from "next/server"
import dbConnect from "@/config/db"
import Bicycle from "@/models/Bicycle"
import mongoose from "mongoose"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid bicycle ID" }, { status: 400 })
    }

    await dbConnect()
    const bicycle = await Bicycle.findById(id)

    if (!bicycle) {
      return NextResponse.json({ error: "Bicycle not found" }, { status: 404 })
    }

    return NextResponse.json({ bicycle })
  } catch (error) {
    console.error("Error fetching bicycle:", error)
    return NextResponse.json({ error: "Failed to fetch bicycle" }, { status: 500 })
  }
}

