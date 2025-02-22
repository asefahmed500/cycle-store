"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

// Define the cart item interface for the API
export interface CartItemAPI {
  productId: string
  quantity: number
}

// Define the cart item interface for the UI
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
      if (response.ok) {
        const data = await response.json()
        setCart(data.cart)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch cart")
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch cart",
        variant: "destructive",
      })
    }
  }

  const addToCart = async (item: CartItemAPI) => {
    try {
      console.log("Adding item to cart:", item) // Debug log

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })

      const data = await response.json()

      if (response.ok) {
        setCart(data.cart)
        toast({
          title: "Success",
          description: "Item added to cart",
        })
      } else {
        throw new Error(data.error || "Failed to add item to cart")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item to cart",
        variant: "destructive",
      })
      throw error // Re-throw to handle in component
    }
  }

  const removeFromCart = async (id: string) => {
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const data = await response.json()
        setCart(data.cart)
        toast({
          title: "Success",
          description: "Item removed from cart",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to remove item from cart")
      }
    } catch (error) {
      console.error("Error removing from cart:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove item from cart",
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

      if (response.ok) {
        const data = await response.json()
        setCart(data.cart)
        toast({
          title: "Success",
          description: "Cart updated",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to update cart")
      }
    } catch (error) {
      console.error("Error updating cart:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update cart",
        variant: "destructive",
      })
    }
  }

  const clearCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
      })

      if (response.ok) {
        setCart([])
        toast({
          title: "Success",
          description: "Cart cleared",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to clear cart")
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear cart",
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

