"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { toast } from "react-hot-toast"

interface SalesData {
  totalRevenue: number
  monthlySales: {
    _id: string
    total: number
  }[]
  topSellingProducts: {
    name: string
    totalQuantity: number
    totalRevenue: number
  }[]
}

export default function SalesReports() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch("/api/dashboard/admin/sales")
        if (response.ok) {
          const data: SalesData = await response.json()
          setSalesData(data)
        } else {
          throw new Error("Failed to fetch sales data")
        }
      } catch (error) {
        console.error("Error fetching sales data:", error)
        toast.error("Failed to fetch sales data")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard")
      } else {
        fetchSalesData()
      }
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>
  }

  if (!salesData) {
    return <div>No sales data available</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Sales Reports</h2>

      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${salesData.totalRevenue.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData.monthlySales}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {salesData.topSellingProducts.map((product, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{product.name}</span>
                <span>Quantity: {product.totalQuantity}</span>
                <span>Revenue: ${product.totalRevenue.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

