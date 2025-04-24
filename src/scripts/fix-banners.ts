import dbConnect from "@/config/db"
import Banner from "@/models/Banner"
import mongoose from "mongoose"

async function fixBanners() {
  try {
    await dbConnect()
    console.log("Connected to database")

    // Find all banners
    const allBanners = await Banner.find()
    console.log(`Found ${allBanners.length} banners in total`)

    // Log details of each banner
    allBanners.forEach((banner, index) => {
      console.log(`Banner ${index + 1}:`, {
        id: banner._id,
        title: banner.title,
        position: banner.position,
        isActive: banner.isActive,
        startDate: banner.startDate,
        endDate: banner.endDate,
      })
    })

    // Update all banners to be active and have valid dates
    const updateResult = await Banner.updateMany(
      {},
      {
        $set: {
          isActive: true,
          startDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
          endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from now
        },
      },
    )

    console.log(`Updated ${updateResult.modifiedCount} banners to be active with valid dates`)

    // Create a new banner for each position if none exist
    const positions = ["home_hero", "home_middle", "home_bottom"]

    for (const position of positions) {
      const existingBanner = await Banner.findOne({ position })

      if (!existingBanner) {
        const newBanner = await Banner.create({
          title: `${position.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Banner`,
          subtitle: "This is a default banner created by the fix script",
          imageUrl: `https://source.unsplash.com/random/1200x600?bicycle,${position}`,
          linkUrl: "/bicycles",
          position: position,
          isActive: true,
          startDate: new Date(),
          backgroundColor: "#0f172a",
          textColor: "#ffffff",
          buttonText: "Shop Now",
          buttonColor: "#3b82f6",
          priority: 10,
        })

        console.log(`Created new banner for position ${position}:`, newBanner._id)
      }
    }

    // Verify the banners exist
    const count = await Banner.countDocuments({ isActive: true })
    console.log(`Total active banners in database: ${count}`)
  } catch (error) {
    console.error("Error fixing banners:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from database")
  }
}

// Run the function
fixBanners()

