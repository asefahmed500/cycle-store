"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/components/CartProvider"
import { useSession } from "next-auth/react"
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart } from "lucide-react"
import Image from "next/image"

interface Bicycle {
  _id: string
  name: string
  brand: string
  price: number
  category: string
  description?: string
  image: string
  stock?: number
}

export default function BicycleDetailPage() {
  const [bicycle, setBicycle] = useState<Bicycle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)

  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { addToCart } = useCart()
  const { data: session } = useSession()

  const { id } = params

  useEffect(() => {
    const fetchBicycle = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/bicycles/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch bicycle")
        }

        const data = await response.json()
        setBicycle(data.bicycle)
      } catch (error) {
        console.error("Error fetching bicycle:", error)
        toast({
          title: "Error",
          description: "Failed to load bicycle details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchBicycle()
    }
  }, [id, toast])

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
      setIsAddingToCart(true)

      await addToCart({
        productId: bicycle?._id as string,
        quantity,
      })

      toast({
        title: "Success",
        description: `${bicycle?.name} added to cart`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
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
      setIsAddingToWishlist(true)
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bicycleId: bicycle?._id }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${bicycle?.name} added to wishlist`,
        })
      } else {
        throw new Error("Failed to add to wishlist")
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to add to wishlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="space-y-4">
              <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!bicycle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Bicycle Not Found</h1>
          <p className="mb-6">The bicycle you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/bicycles")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bicycles
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative aspect-square">
          <Image
            src={bicycle.image || "/placeholder.svg"}
            alt={bicycle.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{bicycle.name}</h1>
            <p className="text-xl font-semibold text-primary mt-2">${bicycle.price.toFixed(2)}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p>
              <span className="font-medium">Brand:</span> {bicycle.brand}
            </p>
            <p>
              <span className="font-medium">Category:</span> {bicycle.category}
            </p>
            {bicycle.stock !== undefined && (
              <p>
                <span className="font-medium">Availability:</span>{" "}
                {bicycle.stock > 0 ? `In Stock (${bicycle.stock})` : "Out of Stock"}
              </p>
            )}
          </div>

          {bicycle.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{bicycle.description}</p>
            </div>
          )}

          <Card className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={bicycle.stock !== undefined && quantity >= bicycle.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isAddingToCart || (bicycle.stock !== undefined && bicycle.stock === 0)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>
              <Button variant="outline" onClick={handleAddToWishlist} disabled={isAddingToWishlist}>
                <Heart className="mr-2 h-4 w-4" />
                {isAddingToWishlist ? "Adding..." : "Add to Wishlist"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

