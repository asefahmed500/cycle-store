"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DataTable } from "@/components/dashboard/DataTable"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface Banner {
  _id: string
  title: string
  imageUrl: string
  link: string
  isActive: boolean
}

export default function BannerManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>([])
  const [newBanner, setNewBanner] = useState({ title: "", imageUrl: "", link: "" })

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchBanners()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  const fetchBanners = async () => {
    const response = await fetch("/api/banners")
    if (response.ok) {
      const data = await response.json()
      setBanners(data)
    } else {
      toast.error("Failed to fetch banners")
    }
  }

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBanner),
    })
    if (response.ok) {
      toast.success("Banner created successfully")
      fetchBanners()
      setNewBanner({ title: "", imageUrl: "", link: "" })
    } else {
      toast.error("Failed to create banner")
    }
  }

  const handleEditBanner = async (
    bannerId: string,
    updatedBanner: { title: string; imageUrl: string; link: string },
  ) => {
    try {
      const response = await fetch(`/api/banners/${bannerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBanner),
      })
      if (response.ok) {
        toast.success("Banner updated successfully")
        fetchBanners()
      } else {
        throw new Error("Failed to update banner")
      }
    } catch (error) {
      console.error("Error updating banner:", error)
      toast.error("Failed to update banner")
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Banner Management</h2>
      <form onSubmit={handleCreateBanner} className="space-y-2">
        <Input
          placeholder="Banner Title"
          value={newBanner.title}
          onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
        />
        <Input
          placeholder="Image URL"
          value={newBanner.imageUrl}
          onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
        />
        <Input
          placeholder="Link"
          value={newBanner.link}
          onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
        />
        <Button type="submit">Create Banner</Button>
      </form>
      <DataTable columns={columns({ onEdit: handleEditBanner })} data={banners} />
    </div>
  )
}

