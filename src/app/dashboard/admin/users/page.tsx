"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DataTable } from "@/components/dashboard/DataTable"
import { columns } from "./columns"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface User {
  _id: string
  name: string
  email: string
  role: "user" | "admin"
}

export default function UserManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data: User[] = await response.json()
          setUsers(data)
        } else {
          toast.error("Failed to fetch users")
        }
      } catch (error) {
        toast.error("Error fetching users")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard")
      } else {
        fetchUsers()
      }
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router])

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setUsers(users.map((user) => (user._id === userId ? { ...user, role: newRole } : user)))
        toast.success("User role updated successfully")
      } else {
        toast.error("Failed to update user role")
      }
    } catch (error) {
      toast.error("Error updating user role")
    }
  }

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
      <DataTable columns={columns(handleRoleChange)} data={users} />
    </div>
  )
}

