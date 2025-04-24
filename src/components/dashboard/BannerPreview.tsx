"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

interface BannerProps {
  banner: {
    title: string
    subtitle?: string
    imageUrl: string
    linkUrl?: string
    backgroundColor?: string
    textColor?: string
    buttonText?: string
    buttonColor?: string
    position?: string
  }
}

export function BannerPreview({ banner }: BannerProps) {
  // Return null if banner is not provided
  if (!banner) {
    return null
  }

  const {
    title,
    subtitle,
    imageUrl,
    linkUrl,
    backgroundColor = "#ffffff",
    textColor = "#000000",
    buttonText = "Shop Now",
    buttonColor = "#0f172a",
    position = "home_hero",
  } = banner

  // Different layouts based on position
  const isSidebar = position === "sidebar"
  const isHero = position === "home_hero"

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${isSidebar ? "h-[400px] w-full" : "w-full aspect-[21/9]"}`}
      style={{ backgroundColor }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl || "/placeholder.svg?height=400&width=800"}
          alt={title}
          fill
          className={`object-cover ${isSidebar ? "object-center" : "object-center"}`}
        />
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black opacity-30" style={{ opacity: 0.3 }}></div>
      </div>

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col ${
          isSidebar ? "h-full justify-end p-4" : isHero ? "h-full justify-center p-8" : "h-full justify-center p-6"
        }`}
      >
        <div className={`max-w-lg ${isSidebar ? "text-center w-full" : ""}`} style={{ color: textColor }}>
          <h2 className={`font-bold ${isSidebar ? "text-xl mb-2" : isHero ? "text-4xl mb-4" : "text-2xl mb-3"}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`${isSidebar ? "text-sm mb-3" : isHero ? "text-lg mb-6" : "text-base mb-4"}`}>{subtitle}</p>
          )}
          {buttonText && (
            <Button
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

