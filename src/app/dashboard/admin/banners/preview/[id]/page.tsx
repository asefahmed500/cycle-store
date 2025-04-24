"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { BannerPreview } from "@/components/dashboard/BannerPreview"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface Banner {
  _id: string
  title: string
  subtitle?: string
  imageUrl: string
  linkUrl?: string
  position: string
  isActive: boolean
  startDate: string
  endDate?: string
  backgroundColor?: string
  textColor?: string
  buttonText?: string
  buttonColor?: string
  priority: number
  createdAt: string
  updatedAt: string
}

export default function BannerPreviewPage({ params }: { params: { id: string } }) {
  const [banner, setBanner] = useState<Banner | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { id } = params

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "PPP")
    } catch (error) {
      console.error("Invalid date format:", dateString)
      return "Invalid date"
    }
  }

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/admin/banners/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch banner")
        }

        const data = await response.json()
        setBanner(data.banner)
      } catch (error) {
        console.error("Error fetching banner:", error)
        toast({
          title: "Error",
          description: "Failed to load banner data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBanner()
  }, [id, toast])

  const getPositionLabel = (position: string) => {
    switch (position) {
      case "home_hero":
        return "Home Hero"
      case "home_middle":
        return "Home Middle"
      case "home_bottom":
        return "Home Bottom"
      case "category_top":
        return "Category Top"
      case "sidebar":
        return "Sidebar"
      default:
        return position
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!banner) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Banner Not Found</h2>
        <p className="mb-4">The banner you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/dashboard/admin/banners")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Banners
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Banners
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Banner Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <BannerPreview banner={banner} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banner Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Title</h3>
                <p>{banner.title}</p>
              </div>

              {banner.subtitle && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Subtitle</h3>
                  <p>{banner.subtitle}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Position</h3>
                <Badge variant="outline">{getPositionLabel(banner.position)}</Badge>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge variant={banner.isActive ? "default" : "secondary"}>
                  {banner.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Date Range</h3>
                <p>From: {formatDate(banner.startDate)}</p>
                {banner.endDate && <p>To: {formatDate(banner.endDate)}</p>}
              </div>

              {banner.linkUrl && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Link URL</h3>
                  <p className="break-all">{banner.linkUrl}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Priority</h3>
                <p>{banner.priority}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Created</h3>
                <p>{format(new Date(banner.createdAt), "PPP")}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
                <p>{format(new Date(banner.updatedAt), "PPP")}</p>
              </div>

              <div className="pt-4 flex gap-2">
                <Button onClick={() => router.push(`/dashboard/admin/banners/edit/${banner._id}`)}>Edit Banner</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

