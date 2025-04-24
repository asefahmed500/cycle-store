"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Order {
  _id: string
  totalAmount: number
  status: string
  createdAt: string
  items: Array<{
    product: { name: string }
    quantity: number
    price: number
  }>
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "_id",
    header: "Order ID",
    cell: ({ row }) => {
      return <div className="font-medium">#{row.original._id.slice(-8)}</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return <div>{format(new Date(row.original.createdAt), "PPP")}</div>
    },
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items
      return (
        <div>
          {items.map((item, index) => (
            <div key={index} className="text-sm">
              {item.quantity}x {item.product.name}
            </div>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => {
      return <div>${row.original.totalAmount.toFixed(2)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
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

      return <Badge className={getStatusColor(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    },
  },
]

