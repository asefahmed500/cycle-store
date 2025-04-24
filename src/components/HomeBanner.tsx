"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface Banner {
  _id: string
  title: string
  subtitle?: string
  imageUrl: string
  linkUrl?: string
  backgroundColor?: string
  textColor?: string
  buttonText?: string
  buttonColor?: string
}

interface HomeBannerProps {
  position?: string
  className?: string
}

export default function HomeBanner({ position = "home_hero", className = "" }: HomeBannerProps) {
  const [banner, setBanner] = useState<Banner | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setIsLoading(true)
        console.log(`Fetching banner for position: ${position}`)
        const response = await fetch(`/api/banners?position=${position}&limit=1`)

        if (!response.ok) {
          throw new Error(`Failed to fetch banner: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`Banner API response for ${position}:`, data)

        if (data.banners && data.banners.length > 0) {
          console.log(`Setting banner for position ${position}:`, data.banners[0])
          setBanner(data.banners[0])
        } else {
          console.log(`No banners found for position: ${position}`)
          setBanner(null)
        }
      } catch (error) {
        console.error(`Error fetching banner for position ${position}:`, error)
        setBanner(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBanner()
  }, [position])

  const handleClick = () => {
    if (banner?.linkUrl) {
      router.push(banner.linkUrl)
    }
  }

  if (isLoading) {
    return (
      <div className={`w-full ${position === "home_hero" ? "aspect-[21/9]" : "aspect-[3/1]"} ${className}`}>
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    )
  }

  // If no banner is found, show a default placeholder banner
  if (!banner) {
    return (
      <div
        className={`w-full ${position === "home_hero" ? "aspect-[21/9]" : "aspect-[3/1]"} ${className} bg-muted rounded-lg flex items-center justify-center`}
      >
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold mb-2">Create a Banner</h2>
          <p className="text-muted-foreground mb-4">Add a banner in the admin panel for this position: {position}</p>
          <Button variant="outline" onClick={() => router.push("/dashboard/admin/banners/new")}>
            Add Banner
          </Button>
        </div>
      </div>
    )
  }

  const {
    title,
    subtitle,
    imageUrl,
    backgroundColor = "#ffffff",
    textColor = "#000000",
    buttonText = "Shop Now",
    buttonColor = "#0f172a",
  } = banner

  const isHero = position === "home_hero"

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${
        isHero ? "w-full aspect-[21/9]" : "w-full aspect-[3/1]"
      } ${className}`}
      style={{ backgroundColor }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl || "/placeholder.svg?height=600&width=1200"}
          alt={title}
          fill
          className="object-cover object-center"
          priority={isHero}
        />
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-center p-6 md:p-8 lg:p-12">
        <div className="max-w-lg" style={{ color: textColor }}>
          <h2
            className={`font-bold ${isHero ? "text-2xl md:text-3xl lg:text-4xl mb-2 md:mb-4" : "text-xl md:text-2xl mb-2"}`}
          >
            {title}
          </h2>
          {subtitle && (
            <p className={`${isHero ? "text-base md:text-lg mb-4 md:mb-6" : "text-sm md:text-base mb-3"}`}>
              {subtitle}
            </p>
          )}
          {buttonText && (
            <Button
              onClick={handleClick}
              className="mt-2"
              style={{
                backgroundColor: buttonColor,
                color: "#ffffff",
                borderColor: buttonColor,
              }}
            >
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

