"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DataTable } from "@/components/dashboard/DataTable"
import { columns } from "./columns"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface Order {
  _id: string
  user: {
    name: string
    email: string
  }
  totalAmount: number
  status: string
  createdAt: string
  items: Array<{
    product: {
      name: string
    }
    quantity: number
    price: number
  }>
}

export default function OrderManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders")
        if (response.ok) {
          const data: Order[] = await response.json()
          setOrders(data)
        } else {
          toast.error("Failed to fetch orders")
        }
      } catch (error) {
        toast.error("Error fetching orders")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard")
      } else {
        fetchOrders()
      }
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  const handleViewDetails = (order: Order) => {
    // Implement view details functionality
    console.log("View order details:", order)
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setOrders(orders.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order)))
        toast.success("Order status updated successfully")
      } else {
        throw new Error("Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    }
  }

  if (status === "loading" || isLoading) {
    return <OrderManagementSkeleton />
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
      <DataTable
        columns={columns({ onViewDetails: handleViewDetails, onUpdateStatus: handleUpdateStatus })}
        data={orders}
      />
    </div>
  )
}

function OrderManagementSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/4" />
      <Skeleton className="h-64" />
    </div>
  )
}

