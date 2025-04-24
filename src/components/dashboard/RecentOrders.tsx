"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  _id: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "completed" | "cancelled"
  createdAt: string
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 5, pages: 0 })
  const { toast } = useToast()

  const fetchOrders = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true)
        setError(null)

        console.log(`Fetching orders for page ${page}...`)
        const response = await fetch(`/api/orders?page=${page}&limit=5`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Error response:", errorData)
          throw new Error(errorData.error || `Server responded with ${response.status}`)
        }

        const data = await response.json()
        console.log("Orders data received:", data)

        if (!data.orders || !Array.isArray(data.orders)) {
          console.error("Invalid orders data:", data)
          throw new Error("Invalid data format received from server")
        }

        setOrders(data.orders)
        if (data.pagination) {
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        setError(error instanceof Error ? error.message : "Failed to load orders")
        toast({
          title: "Error loading orders",
          description: error instanceof Error ? error.message : "Failed to load orders",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    fetchOrders(currentPage)
  }, [fetchOrders, currentPage])

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "processing":
        return "bg-blue-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return
    setCurrentPage(newPage)
  }

  if (isLoading && orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your order history</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error && orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your order history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-500">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchOrders(currentPage)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your order history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <p>No orders found.</p>
            <Button variant="outline" size="sm" onClick={() => fetchOrders(currentPage)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your order history</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchOrders(currentPage)} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">Order #{order._id.slice(-8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.createdAt ? format(new Date(order.createdAt), "PPP") : "Unknown date"}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div className="space-y-1">
                {Array.isArray(order.items) &&
                  order.items.map((item, index) => (
                    <div key={index} className="text-sm flex justify-between">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
              </div>
              <div className="mt-2 pt-2 border-t flex justify-between font-medium">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages || isLoading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

