"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BicycleCard from "@/components/BicycleCard"
import { Skeleton } from "@/components/ui/skeleton"

interface Bicycle {
  _id: string
  name: string
  brand: string
  price: number
  category: string
  image: string
  description: string
}

// Sample bicycle data with valid MongoDB ObjectIDs
const sampleBicycles: Bicycle[] = [
  {
    _id: "65f1c5c33cd7f87654321001", // Valid MongoDB ObjectID format
    name: "Mountain Explorer Pro",
    brand: "TrailBlazer",
    price: 899.99,
    category: "Mountain",
    image:
      "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Professional grade mountain bike for serious adventurers",
  },
  {
    _id: "65f1c5c33cd7f87654321002", // Valid MongoDB ObjectID format
    name: "City Cruiser Deluxe",
    brand: "UrbanRider",
    price: 599.99,
    category: "City",
    image:
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Comfortable and stylish bike for city commuting",
  },
  {
    _id: "65f1c5c33cd7f87654321003", // Valid MongoDB ObjectID format
    name: "Road Master Elite",
    brand: "SpeedKing",
    price: 1299.99,
    category: "Road",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "High-performance road bike for racing enthusiasts",
  },
  {
    _id: "65f1c5c33cd7f87654321004", // Valid MongoDB ObjectID format
    name: "Electric City Rider",
    brand: "EcoMove",
    price: 1599.99,
    category: "Electric",
    image:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Eco-friendly electric bike for effortless commuting",
  },
  {
    _id: "65f1c5c33cd7f87654321005", // Valid MongoDB ObjectID format
    name: "Kids Adventure",
    brand: "JuniorRider",
    price: 299.99,
    category: "Kids",
    image:
      "https://images.unsplash.com/photo-1595432541891-a461100d3054?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Safe and fun bicycle for young riders",
  },
  {
    _id: "65f1c5c33cd7f87654321006", // Valid MongoDB ObjectID format
    name: "BMX Freestyle",
    brand: "ExtremeSports",
    price: 449.99,
    category: "BMX",
    image:
      "https://images.unsplash.com/photo-1583447778626-3c755c3d1e64?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Sturdy BMX bike for tricks and stunts",
  },
]

export default function BicyclesPage() {
  const [bicycles, setBicycles] = useState<Bicycle[]>(sampleBicycles)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState("all")
  const [category, setCategory] = useState("all")

  const filteredBicycles = bicycles.filter((bicycle) => {
    const matchesSearch =
      bicycle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bicycle.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "0-500" && bicycle.price <= 500) ||
      (priceRange === "501-1000" && bicycle.price > 500 && bicycle.price <= 1000) ||
      (priceRange === "1001+" && bicycle.price > 1000)
    const matchesCategory = category === "all" || bicycle.category === category

    return matchesSearch && matchesPrice && matchesCategory
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Bicycles</h1>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <Input
          type="text"
          placeholder="Search by name or brand"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/3"
        />
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-500">$0 - $500</SelectItem>
            <SelectItem value="501-1000">$501 - $1000</SelectItem>
            <SelectItem value="1001+">$1001+</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Mountain">Mountain</SelectItem>
            <SelectItem value="Road">Road</SelectItem>
            <SelectItem value="City">City</SelectItem>
            <SelectItem value="Electric">Electric</SelectItem>
            <SelectItem value="Kids">Kids</SelectItem>
            <SelectItem value="BMX">BMX</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-[400px] w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBicycles.map((bicycle) => (
            <BicycleCard key={bicycle._id} bicycle={bicycle} />
          ))}
        </div>
      )}
    </div>
  )
}

