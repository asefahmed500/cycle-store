import { CarouselNext, CarouselPrevious, CarouselItem, CarouselContent, Carousel } from "@/components/ui/carousel"
import { Suspense } from "react"
import BicycleCard from "@/components/BicycleCard"
import Banner from "@/components/Banner"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Sample featured bicycles
const featuredBicycles = [
  {
    _id: "1",
    name: "Mountain Explorer Pro",
    brand: "TrailBlazer",
    price: 899.99,
    category: "Mountain",
    image:
      "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    _id: "2",
    name: "City Cruiser Deluxe",
    brand: "UrbanRider",
    price: 599.99,
    category: "City",
    image:
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    _id: "3",
    name: "Road Master Elite",
    brand: "SpeedKing",
    price: 1299.99,
    category: "Road",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
]

export default function Home() {
  return (
    <div className="space-y-12">
      <Banner />

      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Featured Bicycles</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBicycles.map((bicycle) => (
              <BicycleCard key={bicycle._id} bicycle={bicycle} />
            ))}
          </div>
        </Suspense>
        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/bicycles">View All Bicycles</Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Hot Products</h2>
        <Carousel>
          <CarouselContent>
            {featuredBicycles.map((bicycle) => (
              <CarouselItem key={bicycle._id} className="md:basis-1/2 lg:basis-1/3">
                <BicycleCard bicycle={bicycle} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Promotional Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-48 rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
              alt="Summer Sale"
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h3 className="text-white text-2xl font-bold">Summer Sale - Up to 30% Off</h3>
            </div>
          </div>
          <div className="relative h-48 rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
              alt="New Arrivals"
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h3 className="text-white text-2xl font-bold">New Arrivals - Shop Now</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-secondary rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
            <p>We offer only the best bicycles from top brands.</p>
          </div>
          <div className="p-6 bg-secondary rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Expert Advice</h3>
            <p>Our team is here to help you find the perfect bike.</p>
          </div>
          <div className="p-6 bg-secondary rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Excellent Service</h3>
            <p>We provide top-notch customer service and support.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

