"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/CartProvider"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Bicycle {
  _id: string
  name: string
  brand: string
  price: number
  category: string
  description: string
  specifications: string[]
  images: string[] // Array of image URLs
  stock: number
  features: string[]
}

// Sample bicycle data with multiple images
const sampleBicycle: Bicycle = {
  _id: "1",
  name: "Mountain Explorer Pro",
  brand: "TrailBlazer",
  price: 899.99,
  category: "Mountain",
  description:
    "Professional grade mountain bike designed for serious adventurers. Features advanced suspension system and durable frame construction.",
  specifications: [
    "Frame: Aluminum Alloy",
    "Gears: 21-Speed Shimano",
    "Brakes: Hydraulic Disc",
    'Tires: 27.5" All-Terrain',
    "Weight: 13.5 kg",
  ],
  images: [
    "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  ],
  stock: 5,
  features: [
    "Advanced Suspension System",
    "Lightweight Frame",
    "All-Terrain Capability",
    "Professional Grade Components",
  ],
}

export default function BicycleDetailsPage() {
  const { id } = useParams()
  const [bicycle, setBicycle] = useState<Bicycle | null>(null)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const fetchBicycleData = async () => {
      try {
        const response = await fetch(`/api/bicycles/${id}`)
        if (response.ok) {
          const data = await response.json()
          setBicycle(data)
        } else {
          // Fallback to sample data for demonstration
          setBicycle(sampleBicycle)
        }
      } catch (error) {
        console.error("Error fetching bicycle:", error)
        // Fallback to sample data for demonstration
        setBicycle(sampleBicycle)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchBicycleData()
    }
  }, [id])

  const handleQuantityChange = (increment: boolean) => {
    if (increment && bicycle && quantity < bicycle.stock) {
      setQuantity((q) => q + 1)
    } else if (!increment && quantity > 1) {
      setQuantity((q) => q - 1)
    }
  }

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

    if (!bicycle) return

    try {
      const cartItem = {
        productId: bicycle._id,
        name: bicycle.name,
        price: bicycle.price,
        quantity: quantity,
        image: bicycle.images[0],
      }

      await addToCart(cartItem)
      toast({
        title: "Success",
        description: "Added to cart successfully",
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
        body: JSON.stringify({ bicycleId: id }),
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Added to wishlist",
        })
      } else {
        throw new Error("Failed to add to wishlist")
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to add to wishlist",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <BicycleDetailsSkeleton />
  }

  if (!bicycle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-xl">Bicycle not found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square">
            <Image
              src={bicycle.images[selectedImage] || "/placeholder.svg"}
              alt={`${bicycle.name} - View ${selectedImage + 1}`}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {bicycle.images.map((image, index) => (
                  <CarouselItem key={index} className="basis-1/4 cursor-pointer">
                    <div className="p-1">
                      <Card>
                        <CardContent className="p-0">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${bicycle.name} thumbnail ${index + 1}`}
                            width={100}
                            height={100}
                            className={`rounded-lg object-cover aspect-square ${
                              selectedImage === index ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setSelectedImage(index)}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{bicycle.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge>{bicycle.category}</Badge>
              <Badge variant="outline">{bicycle.brand}</Badge>
            </div>
            <p className="text-3xl font-bold text-primary">${bicycle.price.toFixed(2)}</p>
          </div>

          <Separator />

          <Tabs defaultValue="description" className="w-full">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p className="text-muted-foreground">{bicycle.description}</p>
            </TabsContent>
            <TabsContent value="specifications" className="mt-4">
              <ul className="list-disc list-inside space-y-2">
                {bicycle.specifications.map((spec, index) => (
                  <li key={index} className="text-muted-foreground">
                    {spec}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="features" className="mt-4">
              <ul className="list-disc list-inside space-y-2">
                {bicycle.features.map((feature, index) => (
                  <li key={index} className="text-muted-foreground">
                    {feature}
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">Quantity:</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(false)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(true)}
                  disabled={bicycle.stock <= quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{bicycle.stock} units available</p>
            </div>

            <div className="flex gap-4">
              <Button className="flex-1" onClick={handleAddToCart} disabled={bicycle.stock === 0}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button variant="outline" onClick={handleAddToWishlist}>
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BicycleDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-8 w-1/3" />
          </div>
          <Skeleton className="h-[200px] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

