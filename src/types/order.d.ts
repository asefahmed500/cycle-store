import type { Types } from "mongoose"

export interface OrderItem {
  name: string
  quantity: number
  price: number
}

export interface ShippingAddress {
  name?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface Order {
  _id: Types.ObjectId
  userId: Types.ObjectId
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "completed" | "cancelled"
  stripeSessionId: string
  shippingAddress?: ShippingAddress
  createdAt: Date
  updatedAt: Date
}

export interface TransformedOrder {
  _id: string
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

export interface DashboardData {
  user: {
    name: string | null | undefined
    email: string | null | undefined
  }
  recentOrders: TransformedOrder[]
  totalSpent: number
  totalOrders: number
  lastOrderDate: string | null
}

