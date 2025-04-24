"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/dashboard/DataTable"
import { columns } from "@/app/dashboard/columns"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ShoppingBag, CreditCard, Calendar } from "lucide-react"

interface OrderItem {
  product: {
    name: string
  }
  quantity: number
  price: number
}

interface Order {
  _id: string
  totalAmount: number
  status: string
  createdAt: string
  items: OrderItem[]
}

interface DashboardData {
  user: {
    name: string
    email: string
  }
  recentOrders: Order[]
  totalSpent: number
  totalOrders: number
  lastOrderDate: string | null
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)

  // Update the fetchDashboardData function to better handle API responses
  const fetchDashboardData = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true)
        console.log("Fetching dashboard data for page:", page)

        const response = await fetch(`/api/dashboard/user?page=${page}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Server responded with ${response.status}`)
        }

        const data = await response.json()
        console.log("Received dashboard data:", data)

        // Validate the data structure
        if (!data.recentOrders) {
          console.error("Missing recentOrders in response:", data)
          throw new Error("Invalid dashboard data format")
        }

        setDashboardData(data)
      } catch (error) {
        console.error("Dashboard error:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchDashboardData(currentPage)
    }
  }, [status, currentPage, fetchDashboardData, session])

  if (status === "loading" || isLoading) {
    return <DashboardSkeleton />
  }

  if (!session) {
    return null
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No dashboard data available</p>
      </div>
    )
  }

  // Add a refresh button in the Recent Orders section
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {session.user?.name}</h2>
        <p className="text-muted-foreground">Here's an overview of your account</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Order</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.lastOrderDate
                ? new Date(dashboardData.lastOrderDate).toLocaleDateString()
                : "No orders yet"}
            </div>
            <p className="text-xs text-muted-foreground">Most recent purchase</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Recent Orders</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {currentPage}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={isLoading || (dashboardData.recentOrders?.length || 0) < 10}
            >
              Next
            </Button>
          </div>
        </div>

        {dashboardData.recentOrders?.length > 0 ? (
          <DataTable columns={columns} data={dashboardData.recentOrders} />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 gap-2">
              <p className="text-muted-foreground">{isLoading ? "Loading orders..." : "No orders found"}</p>
              <Button variant="outline" size="sm" onClick={() => fetchDashboardData(currentPage)} disabled={isLoading}>
                {isLoading ? "Loading..." : "Refresh Data"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  )
}

