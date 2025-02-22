import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"

export default function Banner() {
  const bannerItems = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
      alt: "Summer Sale - Up to 30% Off on Road Bikes",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
      alt: "New Arrivals - Latest Mountain Bikes Now in Stock",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
      alt: "Clearance Sale - Last Chance on Previous Season Models",
    },
  ]

  return (
    <Carousel className="w-full max-w-5xl mx-auto">
      <CarouselContent>
        {bannerItems.map((item) => (
          <CarouselItem key={item.id}>
            <div className="relative h-[300px] w-full">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.alt}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h2 className="text-white text-3xl font-bold text-center px-4">{item.alt}</h2>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

