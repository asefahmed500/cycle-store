"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge"
import { Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  _id: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
  shippingAddress?: {
    name?: string
  }
}

interface OrdersTableProps {
  orders: Order[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isAdmin?: boolean
}

export function OrdersTable({ orders, currentPage, totalPages, onPageChange, isAdmin = false }: OrdersTableProps) {
  const router = useRouter()

  const viewOrder = (orderId: string) => {
    if (isAdmin) {
      router.push(`/dashboard/admin/orders/${orderId}`)
    } else {
      router.push(`/dashboard/orders/${orderId}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              {isAdmin && <TableHead>Customer</TableHead>}
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">#{order._id.slice(-8)}</TableCell>
                <TableCell>{format(new Date(order.createdAt), "PPP")}</TableCell>
                {isAdmin && <TableCell>{order.shippingAddress?.name || "N/A"}</TableCell>}
                <TableCell>{order.items.length} items</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => viewOrder(order._id)}>
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

