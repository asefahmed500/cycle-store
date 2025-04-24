

import FeaturedProducts from "@/components/FeaturedProducts"
import Banner from "@/components/Banner"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <section className="mb-12">
        <Banner position="home_hero" />
      </section>

      {/* Featured Products */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Bicycles</h2>
          <Button asChild variant="outline">
            <Link href="/bicycles">View All</Link>
          </Button>
        </div>
        <FeaturedProducts />
      </section>

     

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CategoryCard
            title="Mountain Bikes"
            description="Perfect for off-road adventures"
            href="/bicycles?category=Mountain%20Bike"
          />
          <CategoryCard
            title="Road Bikes"
            description="Built for speed and efficiency"
            href="/bicycles?category=Road%20Bike"
          />
          <CategoryCard
            title="City Bikes"
            description="Comfortable rides for urban environments"
            href="/bicycles?category=City%20Bike"
          />
        </div>
      </section>

    
    </main>
  )
}

function CategoryCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href}>
      <div className="bg-card hover:bg-accent transition-colors duration-200 rounded-lg p-6 text-center h-full flex flex-col justify-center items-center border">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}

