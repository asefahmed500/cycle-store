"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

export interface CartItemAPI {
  productId: string
  quantity: number
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItemAPI) => Promise<void>
  removeFromCart: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    if (session) {
      fetchCart()
    }
  }, [session])

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart")
      if (!response.ok) {
        throw new Error("Failed to fetch cart")
      }
      const data = await response.json()
      setCart(data.cart)
    } catch (error) {
      console.error("Error fetching cart:", error)
      toast({
        title: "Error",
        description: "Failed to fetch cart items",
        variant: "destructive",
      })
    }
  }

  // Update the addToCart function with better error handling and logging
  const addToCart = async (item: CartItemAPI) => {
    try {
      if (!item.productId) {
        throw new Error("Invalid product ID")
      }

      console.log("Sending to API:", item)

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response from API:", errorData)
        throw new Error(errorData.error || "Failed to add item to cart")
      }

      const data = await response.json()
      console.log("Success response from API:", data)
      setCart(data.cart)
    } catch (error) {
      console.error("Error adding to cart:", error)
      throw error // Re-throw to handle in component
    }
  }

  const removeFromCart = async (id: string) => {
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove item from cart")
      }

      const data = await response.json()
      setCart(data.cart)
      toast({
        title: "Success",
        description: "Item removed from cart",
      })
    } catch (error) {
      console.error("Error removing from cart:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      })
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })

      if (!response.ok) {
        throw new Error("Failed to update cart")
      }

      const data = await response.json()
      setCart(data.cart)
      toast({
        title: "Success",
        description: "Cart updated",
      })
    } catch (error) {
      console.error("Error updating cart:", error)
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      })
    }
  }

  const clearCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to clear cart")
      }

      setCart([])
      toast({
        title: "Success",
        description: "Cart cleared",
      })
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      })
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

