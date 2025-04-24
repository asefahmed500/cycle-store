"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Eye, Plus, Search, Trash2, Edit, RefreshCw } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"

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
  priority: number
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (error) {
      console.error("Invalid date format:", dateString)
      return "Invalid date"
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/banners")
      if (!response.ok) {
        throw new Error("Failed to fetch banners")
      }
      const data = await response.json()
      setBanners(data.banners)
    } catch (error) {
      console.error("Error fetching banners:", error)
      toast({
        title: "Error",
        description: "Failed to load banners",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update banner status")
      }

      // Update local state
      setBanners((prev) => prev.map((banner) => (banner._id === id ? { ...banner, isActive: !currentStatus } : banner)))

      toast({
        title: "Success",
        description: `Banner ${!currentStatus ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      console.error("Error updating banner status:", error)
      toast({
        title: "Error",
        description: "Failed to update banner status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete banner")
      }

      toast({
        title: "Success",
        description: "Banner deleted successfully",
      })

      // Remove the deleted banner from the state
      setBanners((prev) => prev.filter((banner) => banner._id !== id))
    } catch (error) {
      console.error("Error deleting banner:", error)
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      })
    }
  }

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

  const filteredBanners = banners.filter(
    (banner) =>
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (banner.subtitle && banner.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      getPositionLabel(banner.position).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Banner Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchBanners}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={() => router.push("/dashboard/admin/banners/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add New Banner
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading banners...</div>
          ) : filteredBanners.length === 0 ? (
            <div className="text-center py-4">No banners found</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBanners.map((banner) => (
                    <TableRow key={banner._id}>
                      <TableCell>
                        <div className="relative h-12 w-20">
                          <Image
                            src={banner.imageUrl || "/placeholder.svg?height=48&width=80"}
                            alt={banner.title}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {banner.title}
                        {banner.subtitle && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{banner.subtitle}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getPositionLabel(banner.position)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={banner.isActive}
                          onCheckedChange={() => handleToggleActive(banner._id, banner.isActive)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p>From: {formatDate(banner.startDate)}</p>
                          {banner.endDate && <p>To: {formatDate(banner.endDate)}</p>}
                        </div>
                      </TableCell>
                      <TableCell>{banner.priority}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/dashboard/admin/banners/preview/${banner._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/dashboard/admin/banners/edit/${banner._id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDelete(banner._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

