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

export type Banner = {
  _id: string
  title: string
  imageUrl: string
  link: string
  isActive: boolean
}

export const columns = ({
  onEdit,
  onDelete,
  onToggleActive,
}: {
  onEdit: (banner: Banner) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
}): ColumnDef<Banner>[] => [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "imageUrl",
    header: "Image URL",
    cell: ({ row }) => (
      <img
        src={row.getValue("imageUrl") || "/placeholder.svg"}
        alt={row.getValue("title")}
        className="w-16 h-16 object-cover"
      />
    ),
  },
  {
    accessorKey: "link",
    header: "Link",
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
      const banner = row.original

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
            <DropdownMenuItem onClick={() => onEdit(banner)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(banner._id)}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

