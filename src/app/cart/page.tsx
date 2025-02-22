"use client"

import { useCart } from "@/components/CartProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart()
  const [quantities, setQuantities] = useState<{ [key: string]: number }>(
    cart.reduce((acc, item) => ({ ...acc, [item.productId]: item.quantity }), {}),
  )
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setQuantities((prev) => ({ ...prev, [id]: newQuantity }))
    updateQuantity(id, newQuantity)
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCheckout = () => {
    if (!session) {
      toast({
        title: "Error",
        description: "Please log in to proceed to checkout",
        variant: "destructive",
      })
      router.push("/login")
    } else {
      router.push("/checkout")
    }
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="mb-8">Looks like you haven't added any items to your cart yet.</p>
        <Button asChild>
          <Link href="/bicycles">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      <div className="space-y-4">
        {cart.map((item: CartItem) => (
          <div key={item.productId} className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-4">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                width={80}
                height={80}
                className="rounded-md"
              />
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p>${item.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="1"
                value={quantities[item.productId]}
                onChange={(e) => handleQuantityChange(item.productId, Number(e.target.value))}
                className="w-20"
              />
              <Button variant="destructive" onClick={() => removeFromCart(item.productId)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
        <Button onClick={handleCheckout} className="mt-4">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  )
}

