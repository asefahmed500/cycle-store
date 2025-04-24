import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Order from "@/models/Order"
import { parseISO, format, isValid } from "date-fns"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Parse query parameters for date range
    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")

    // Validate and parse dates
    let fromDate: Date | null = null
    let toDate: Date | null = null

    if (fromParam) {
      const parsedFrom = parseISO(fromParam)
      if (isValid(parsedFrom)) {
        fromDate = parsedFrom
      }
    }

    if (toParam) {
      const parsedTo = parseISO(toParam)
      if (isValid(parsedTo)) {
        toDate = parsedTo
      }
    }

    // Default to last 30 days if no valid dates provided
    if (!fromDate || !toDate) {
      toDate = new Date()
      fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - 30)
    }

    // Set time to start and end of day
    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    // Build query for date range
    const dateQuery = {
      createdAt: {
        $gte: fromDate,
        $lte: toDate,
      },
    }

    // Get orders for the specified date range
    const orders = await Order.find(dateQuery).sort({ createdAt: 1 }).lean()

    // Generate CSV content
    let csvContent = "Order ID,Date,Customer ID,Status,Items,Total\n"

    orders.forEach((order) => {
      const orderId = order._id.toString()
      const date = format(new Date(order.createdAt), "yyyy-MM-dd")
      const customerId = order.userId.toString()
      const status = order.status
      const itemCount = Array.isArray(order.items) ? order.items.length : 0
      const total = order.total.toFixed(2)

      csvContent += `${orderId},${date},${customerId},${status},${itemCount},${total}\n`
    })

    // Create detailed items report
    let itemsCSVContent = "Order ID,Date,Product Name,Quantity,Price,Subtotal\n"

    orders.forEach((order) => {
      const orderId = order._id.toString()
      const date = format(new Date(order.createdAt), "yyyy-MM-dd")

      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const productName = item.name.replace(/,/g, ";") // Escape commas
          const quantity = item.quantity || 0
          const price = item.price || 0
          const subtotal = (quantity * price).toFixed(2)

          itemsCSVContent += `${orderId},${date},${productName},${quantity},${price},${subtotal}\n`
        })
      }
    })

    // Combine both reports with a separator
    const fullCSVContent = csvContent + "\n\nDETAILED ITEMS REPORT\n\n" + itemsCSVContent

    // Return CSV as a downloadable file
    return new NextResponse(fullCSVContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="sales-report-${format(fromDate, "yyyy-MM-dd")}-to-${format(toDate, "yyyy-MM-dd")}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting sales data:", error)
    return NextResponse.json({ error: "Failed to export sales data" }, { status: 500 })
  }
}

