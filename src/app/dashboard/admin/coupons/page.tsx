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

interface Coupon {
  _id: string
  code: string
  discountPercentage: number
  validFrom: string
  validUntil: string
  isActive: boolean
}

export default function CouponManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [newCoupon, setNewCoupon] = useState({ code: "", discountPercentage: 0 })

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchCoupons()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  const fetchCoupons = async () => {
    const response = await fetch("/api/coupons")
    if (response.ok) {
      const data = await response.json()
      setCoupons(data)
    } else {
      toast.error("Failed to fetch coupons")
    }
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCoupon),
    })
    if (response.ok) {
      toast.success("Coupon created successfully")
      fetchCoupons()
      setNewCoupon({ code: "", discountPercentage: 0 })
    } else {
      toast.error("Failed to create coupon")
    }
  }

  const handleEditCoupon = async (couponId: string, updatedCoupon: { code: string; discountPercentage: number }) => {
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCoupon),
      })
      if (response.ok) {
        toast.success("Coupon updated successfully")
        fetchCoupons()
      } else {
        throw new Error("Failed to update coupon")
      }
    } catch (error) {
      console.error("Error updating coupon:", error)
      toast.error("Failed to update coupon")
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Coupon deleted successfully")
        fetchCoupons()
      } else {
        throw new Error("Failed to delete coupon")
      }
    } catch (error) {
      console.error("Error deleting coupon:", error)
      toast.error("Failed to delete coupon")
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Coupon Management</h2>
      <form onSubmit={handleCreateCoupon} className="space-y-2">
        <Input
          placeholder="Coupon Code"
          value={newCoupon.code}
          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Discount Percentage"
          value={newCoupon.discountPercentage}
          onChange={(e) => setNewCoupon({ ...newCoupon, discountPercentage: Number(e.target.value) })}
        />
        <Button type="submit">Create Coupon</Button>
      </form>
      <DataTable columns={columns({ onEdit: handleEditCoupon, onDelete: handleDeleteCoupon })} data={coupons} />
    </div>
  )
}

