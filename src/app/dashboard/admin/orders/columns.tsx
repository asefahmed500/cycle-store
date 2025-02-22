"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export type Order = {
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

export const columns = ({
  onViewDetails,
  onUpdateStatus,
}: {
  onViewDetails: (order: Order) => void
  onUpdateStatus: (orderId: string, status: string) => void
}): ColumnDef<Order>[] => [
  {
    accessorKey: "_id",
    header: "Order ID",
  },
  {
    accessorKey: "user.name",
    header: "Customer",
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("totalAmount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === "delivered"
              ? "success"
              : status === "shipped"
                ? "info"
                : status === "processing"
                  ? "warning"
                  : status === "cancelled"
                    ? "destructive"
                    : "default"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return <div>{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetails(order)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

