import dbConnect from "@/config/db"
import Banner from "@/models/Banner"
import mongoose from "mongoose"

async function createTestBanner() {
  try {
    await dbConnect()
    console.log("Connected to database")

    // Create a test banner for the home hero position
    const heroResult = await Banner.create({
      title: "Summer Sale",
      subtitle: "Get up to 50% off on selected bicycles",
      imageUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1200&h=600&fit=crop",
      linkUrl: "/bicycles?sale=true",
      position: "home_hero",
      isActive: true,
      startDate: new Date(),
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
      buttonText: "Shop Now",
      buttonColor: "#3b82f6",
      priority: 10,
    })

    console.log("Created home hero banner:", heroResult._id)

    // Create a test banner for the home middle position
    const middleResult = await Banner.create({
      title: "New Mountain Bikes",
      subtitle: "Explore our latest collection of mountain bikes",
      imageUrl: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?q=80&w=1200&h=400&fit=crop",
      linkUrl: "/bicycles?category=Mountain%20Bike",
      position: "home_middle",
      isActive: true,
      startDate: new Date(),
      backgroundColor: "#166534",
      textColor: "#ffffff",
      buttonText: "Explore",
      buttonColor: "#22c55e",
      priority: 5,
    })

    console.log("Created home middle banner:", middleResult._id)

    // Create a test banner for the home bottom position
    const bottomResult = await Banner.create({
      title: "Join Our Community",
      subtitle: "Sign up for our newsletter to get exclusive offers and updates",
      imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&h=400&fit=crop",
      linkUrl: "/signup",
      position: "home_bottom",
      isActive: true,
      startDate: new Date(),
      backgroundColor: "#7c2d12",
      textColor: "#ffffff",
      buttonText: "Sign Up",
      buttonColor: "#f97316",
      priority: 3,
    })

    console.log("Created home bottom banner:", bottomResult._id)

    // Verify the banners exist
    const count = await Banner.countDocuments()
    console.log(`Total banners in database: ${count}`)
  } catch (error) {
    console.error("Error creating test banners:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from database")
  }
}

// Run the function
createTestBanner()

