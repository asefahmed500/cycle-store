"use client"

import { useState, useEffect } from "react"
import BicycleCard from "@/components/BicycleCard"
import { Skeleton } from "@/components/ui/skeleton"

interface Bicycle {
  _id: string
  name: string
  brand: string
  price: number
  category: string
  image: string
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Bicycle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/bicycles?featured=true&limit=4")

        if (!response.ok) {
          throw new Error("Failed to fetch featured products")
        }

        const data = await response.json()
        setProducts(data.bicycles)
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return <p className="text-center py-12 text-muted-foreground">No featured products available</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <BicycleCard key={product._id} bicycle={product} />
      ))}
    </div>
  )
}

