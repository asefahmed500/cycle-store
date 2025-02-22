"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

export type Coupon = {
  _id: string
  code: string
  discountPercentage: number
  validFrom: string
  validUntil: string
  isActive: boolean
}

export const columns = ({
  onEdit,
  onDelete,
  onToggleActive,
}: {
  onEdit: (coupon: Coupon) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
}): ColumnDef<Coupon>[] => [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "discountPercentage",
    header: "Discount",
    cell: ({ row }) => `${row.getValue("discountPercentage")}%`,
  },
  {
    accessorKey: "validFrom",
    header: "Valid From",
    cell: ({ row }) => new Date(row.getValue("validFrom")).toLocaleDateString(),
  },
  {
    accessorKey: "validUntil",
    header: "Valid Until",
    cell: ({ row }) => new Date(row.getValue("validUntil")).toLocaleDateString(),
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (
      <Switch
        checked={row.getValue("isActive")}
        onCheckedChange={(checked) => onToggleActive(row.original._id, checked)}
      />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const coupon = row.original

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
            <DropdownMenuItem onClick={() => onEdit(coupon)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(coupon._id)}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

