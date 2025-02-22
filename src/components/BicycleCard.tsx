"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useCart } from "./CartProvider"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, Heart, ShoppingCart } from "lucide-react"

interface Bicycle {
  _id: string
  name: string
  brand: string
  price: number
  category: string
  image: string
}

interface BicycleCardProps {
  bicycle: Bicycle
}

export default function BicycleCard({ bicycle }: BicycleCardProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()

  const handleAddToCart = async () => {
    if (!session) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      // Log the product ID for debugging
      console.log("Adding to cart:", bicycle._id)

      await addToCart({
        productId: bicycle._id,
        quantity: 1,
      })

      toast({
        title: "Success",
        description: "Item added to cart successfully",
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      })
    }
  }

  const handleAddToWishlist = async () => {
    if (!session) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to wishlist",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bicycleId: bicycle._id }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Added to wishlist",
        })
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to add to wishlist")
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add to wishlist",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-1">{bicycle.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="relative aspect-square mb-4">
          <Image
            src={bicycle.image || "/placeholder.svg"}
            alt={bicycle.name}
            fill
            className="object-cover rounded-md hover:opacity-90 transition-opacity"
          />
        </div>
        <p className="text-lg font-semibold">${bicycle.price.toFixed(2)}</p>
        <p className="text-muted-foreground">{bicycle.brand}</p>
        <p className="text-muted-foreground">{bicycle.category}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button variant="outline" className="w-full" onClick={() => router.push(`/bicycles/${bicycle._id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </Button>
        <div className="flex gap-2 w-full">
          <Button onClick={handleAddToCart} className="flex-1">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          <Button variant="outline" onClick={handleAddToWishlist}>
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

