"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import BicycleCard from "@/components/BicycleCard"
import { Button } from "@/components/ui/button"

interface Bicycle {
  id: string
  name: string
  brand: string
  price: number
  category: string
  image: string
}

export default function WishlistPage() {
  const { data: session } = useSession()
  const [wishlist, setWishlist] = useState<Bicycle[]>([])

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
        setWishlist(wishlist.filter((item) => item.id !== bicycleId))
        toast.success("Item removed from wishlist")
      } else {
        toast.error("Failed to remove item from wishlist")
      }
    } catch (error) {
      toast.error("An error occurred while removing the item from wishlist")
    }
  }

  if (!session) {
    return <div>Please log in to view your wishlist.</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
      {wishlist.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((bicycle) => (
            <div key={bicycle.id} className="relative">
              <BicycleCard bicycle={bicycle} />
              <Button
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => removeFromWishlist(bicycle.id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

