"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import BicycleCard from "@/components/BicycleCard"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Filter, ChevronLeft, ChevronRight } from "lucide-react"

interface Bicycle {
  _id: string
  name: string
  brand: string
  price: number
  category: string
  image: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

interface Filters {
  categories: string[]
  brands: string[]
}

export default function BicyclesPage() {
  const [bicycles, setBicycles] = useState<Bicycle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 12, pages: 0 })
  const [filters, setFilters] = useState<Filters>({ categories: [], brands: [] })
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [sortOption, setSortOption] = useState<string>("createdAt:desc")

  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get filter values from URL params
    const page = searchParams.get("page") || "1"
    const category = searchParams.get("category") || ""
    const brand = searchParams.get("brand") || ""
    const minPrice = searchParams.get("minPrice") || "0"
    const maxPrice = searchParams.get("maxPrice") || "5000"
    const sort = searchParams.get("sort") || "createdAt"
    const order = searchParams.get("order") || "desc"

    setSelectedCategory(category)
    setSelectedBrand(brand)
    setPriceRange([Number.parseInt(minPrice), Number.parseInt(maxPrice)])
    setSortOption(`${sort}:${order}`)

    fetchBicycles(page, category, brand, minPrice, maxPrice, sort, order)
  }, [searchParams])

  const fetchBicycles = async (
    page: string,
    category: string,
    brand: string,
    minPrice: string,
    maxPrice: string,
    sort: string,
    order: string,
  ) => {
    try {
      setIsLoading(true)

      // Build query string
      const params = new URLSearchParams()
      params.append("page", page)
      params.append("limit", "12")
      if (category) params.append("category", category)
      if (brand) params.append("brand", brand)
      params.append("minPrice", minPrice)
      params.append("maxPrice", maxPrice)
      params.append("sort", sort)
      params.append("order", order)

      const response = await fetch(`/api/bicycles?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch bicycles")
      }

      const data = await response.json()
      setBicycles(data.bicycles)
      setPagination(data.pagination)
      setFilters(data.filters)
    } catch (error) {
      console.error("Error fetching bicycles:", error)
      toast({
        title: "Error",
        description: "Failed to load bicycles",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    const [sort, order] = sortOption.split(":")

    // Build query string
    const params = new URLSearchParams()
    params.append("page", "1") // Reset to page 1 when filters change
    if (selectedCategory) params.append("category", selectedCategory)
    if (selectedBrand) params.append("brand", selectedBrand)
    params.append("minPrice", priceRange[0].toString())
    params.append("maxPrice", priceRange[1].toString())
    params.append("sort", sort)
    params.append("order", order)

    // Update URL with new filters
    router.push(`/bicycles?${params.toString()}`)
  }

  const resetFilters = () => {
    setSelectedCategory("")
    setSelectedBrand("")
    setPriceRange([0, 5000])
    setSortOption("createdAt:desc")
    router.push("/bicycles")
  }

  const handlePageChange = (newPage: number) => {
    const [sort, order] = sortOption.split(":")

    // Build query string preserving current filters
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())

    // Update URL with new page
    router.push(`/bicycles?${params.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bicycles</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg p-4 border">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Filter className="mr-2 h-5 w-5" /> Filters
            </h2>

            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {filters.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand Filter */}
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {filters.brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div>
                <Label>Price Range</Label>
                <div className="pt-6 pb-2">
                  <Slider
                    value={priceRange}
                    min={0}
                    max={5000}
                    step={50}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <Label htmlFor="sort">Sort By</Label>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger id="sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt:desc">Newest First</SelectItem>
                    <SelectItem value="createdAt:asc">Oldest First</SelectItem>
                    <SelectItem value="price:asc">Price: Low to High</SelectItem>
                    <SelectItem value="price:desc">Price: High to Low</SelectItem>
                    <SelectItem value="name:asc">Name: A to Z</SelectItem>
                    <SelectItem value="name:desc">Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={applyFilters}>Apply Filters</Button>
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bicycles Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : bicycles.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border">
              <h3 className="text-xl font-semibold mb-2">No bicycles found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bicycles.map((bicycle) => (
                  <BicycleCard key={bicycle._id} bicycle={bicycle} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

