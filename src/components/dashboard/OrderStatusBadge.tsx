import { Badge } from "@/components/ui/badge"

interface OrderStatusBadgeProps {
  status: string
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
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

  return (
    <Badge className={`${getStatusColor(status)} ${className || ""}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

