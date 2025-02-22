"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DataTable } from "@/components/dashboard/DataTable"
import { columns } from "./columns"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"

interface Product {
  _id: string
  name: string
  price: number
  category: string
  brand: string
  stock: number
}

export default function ProductManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/products?page=${currentPage}&limit=10`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products)
          setTotalPages(data.totalPages)
        } else {
          toast.error("Failed to fetch products")
        }
      } catch (error) {
        toast.error("Error fetching products")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard")
      } else {
        fetchProducts()
      }
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, session, router, currentPage])

  const handleEdit = (product: Product) => {
    router.push(`/dashboard/admin/products/edit/${product._id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProducts(products.filter((product) => product._id !== id))
        toast.success("Product deleted successfully")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error(error instanceof Error ? error.message : "Error deleting product")
    }
  }

  if (status === "loading" || isLoading) {
    return <ProductManagementSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Product Management</h2>
        <Button onClick={() => router.push("/dashboard/admin/products/new")}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>
      <DataTable columns={columns({ onEdit: handleEdit, onDelete: handleDelete })} data={products} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  )
}

function ProductManagementSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/4" />
      <Skeleton className="h-64" />
    </div>
  )
}

