import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import dbConnect from "@/config/db"
import Order from "@/models/Order"
import { parseISO, isValid } from "date-fns"

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

    // Get total sales and orders
    const orders = await Order.find(dateQuery).lean()

    // Calculate total sales
    const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0)

    // Calculate total orders
    const totalOrders = orders.length

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    // Get unique customers who placed orders in the period
    const uniqueCustomerIds = [...new Set(orders.map((order) => order.userId.toString()))]
    const totalCustomers = uniqueCustomerIds.length

    // Aggregate sales by date
    const salesByDate = await Order.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          amount: 1,
          orders: 1,
          _id: 0,
        },
      },
    ])

    // Get top selling products
    const topProducts = []

    // Create a map to aggregate product sales
    const productMap = new Map()

    // Process each order to extract product data
    orders.forEach((order) => {
      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const productName = item.name
          const quantity = item.quantity || 0
          const price = item.price || 0
          const revenue = quantity * price

          if (productMap.has(productName)) {
            const product = productMap.get(productName)
            product.quantity += quantity
            product.revenue += revenue
          } else {
            productMap.set(productName, {
              name: productName,
              quantity,
              revenue,
            })
          }
        })
      }
    })

    // Convert map to array and sort by revenue
    for (const product of productMap.values()) {
      topProducts.push(product)
    }

    topProducts.sort((a, b) => b.revenue - a.revenue)

    // Get sales by category
    const categoryMap = new Map()

    // Process each order to extract category data
    orders.forEach((order) => {
      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          // Extract category from item name or use "Uncategorized"
          // This is a simplification - in a real app, you'd have category data in your items
          const categoryMatch = item.name.match(/$$(.*?)$$/)
          const category = categoryMatch ? categoryMatch[1] : "Uncategorized"

          const quantity = item.quantity || 0
          const price = item.price || 0
          const revenue = quantity * price

          if (categoryMap.has(category)) {
            categoryMap.set(category, categoryMap.get(category) + revenue)
          } else {
            categoryMap.set(category, revenue)
          }
        })
      }
    })

    // Convert map to array and calculate percentages
    const salesByCategory = []
    for (const [category, amount] of categoryMap.entries()) {
      salesByCategory.push({
        category,
        amount,
        percentage: totalSales > 0 ? amount / totalSales : 0,
      })
    }

    // Sort by amount
    salesByCategory.sort((a, b) => b.amount - a.amount)

    return NextResponse.json({
      totalSales,
      totalOrders,
      averageOrderValue,
      totalCustomers,
      salesByDate,
      topProducts: topProducts.slice(0, 10), // Top 10 products
      salesByCategory,
    })
  } catch (error) {
    console.error("Error fetching sales data:", error)
    return NextResponse.json({ error: "Failed to fetch sales data" }, { status: 500 })
  }
}

