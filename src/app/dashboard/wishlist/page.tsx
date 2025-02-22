"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import BicycleCard from "@/components/BicycleCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Bicycle {
  _id: string
  name: string
  brand: string
  price: number
  category: string
  image: string
}

export default function WishlistPage() {
  const { data: session } = useSession()
  const [wishlist, setWishlist] = useState<Bicycle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchWishlist()
    }
  }, [session])

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist")
      if (response.ok) {
        const data = await response.json()
        setWishlist(data.wishlist)
      } else {
        toast.error("Failed to fetch wishlist")
      }
    } catch (error) {
      toast.error("An error occurred while fetching the wishlist")
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (bicycleId: string) => {
    try {
      const response = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bicycleId }),
      })
      if (response.ok) {
        setWishlist(wishlist.filter((item) => item._id !== bicycleId))
        toast.success("Item removed from wishlist")
      } else {
        toast.error("Failed to remove item from wishlist")
      }
    } catch (error) {
      toast.error("An error occurred while removing the item from wishlist")
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Please log in to view your wishlist</h1>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-[400px]" />
          ))}
        </div>
      </div>
    )
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
        <p className="mb-8">Start adding some bicycles to your wishlist!</p>
        <Button asChild>
          <a href="/bicycles">Browse Bicycles</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((bicycle) => (
          <div key={bicycle._id} className="relative">
            <BicycleCard bicycle={bicycle} />
            <Button
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={() => removeFromWishlist(bicycle._id)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

