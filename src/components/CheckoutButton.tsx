"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "./CartProvider"
import { loadStripe } from "@stripe/stripe-js"

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export default function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { cart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const handleCheckout = async () => {
    try {
      setIsLoading(true)

      if (!cart || cart.length === 0) {
        toast({
          title: "Cart is empty",
          description: "Please add items to your cart before checking out.",
          variant: "destructive",
        })
        return
      }

      // Format cart items for the API
      const items = cart.map((item: CartItem) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }))

      console.log("Sending items to checkout:", items)

      // Create checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create checkout session")
      }

      const { url } = await response.json()

      if (!url) {
        throw new Error("No checkout URL received")
      }

      // Redirect to Stripe Checkout
      router.push(url)
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "An error occurred during checkout",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} className="w-full" disabled={isLoading || !cart || cart.length === 0}>
      {isLoading ? "Processing..." : "Checkout"}
    </Button>
  )
}

