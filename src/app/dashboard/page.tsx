"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/dashboard/DataTable"
import { columns } from "./columns"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface Order {
  _id: string
  totalAmount: number
  status: string
  createdAt: string
  items: Array<{ product: { name: string }; quantity: number; price: number }>
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

  const fetchDashboardData = useCallback(
    async (page = 1) => {
      try {
        const response = await fetch(`/api/dashboard/user?page=${page}`)
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch dashboard data",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Error fetching dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData(currentPage)
    }
  }, [status, currentPage, fetchDashboardData])

  if (status === "loading" || isLoading) {
    return <DashboardSkeleton />
  }

  if (!dashboardData) {
    return <div>No data available</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">User Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Order Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.lastOrderDate ? new Date(dashboardData.lastOrderDate).toLocaleDateString() : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
        <DataTable columns={columns} data={dashboardData.recentOrders} />
      </div>
      {dashboardData && (
        <div className="mt-4">
          <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Previous
          </Button>
          <span className="mx-4">Page {currentPage}</span>
          <Button onClick={() => setCurrentPage((prev) => prev + 1)} disabled={dashboardData.recentOrders.length < 10}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/4" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

