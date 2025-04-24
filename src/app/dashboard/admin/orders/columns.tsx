"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { format } from "date-fns"

export interface AdminOrder {
  _id: string
  createdAt: string
  customerName: string
  itemCount: number
  total: number
  status: string
}

export const columns: ColumnDef<AdminOrder>[] = [
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
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => {
      return <div>{row.original.customerName || "N/A"}</div>
    },
  },
  {
    accessorKey: "itemCount",
    header: "Items",
    cell: ({ row }) => {
      return <div>{row.original.itemCount} items</div>
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      return <div>${row.original.total.toFixed(2)}</div>
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
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => (window.location.href = `/dashboard/admin/orders/${row.original._id}`)}
        >
          <Eye className="h-4 w-4 mr-1" /> View
        </Button>
      )
    },
  },
]

