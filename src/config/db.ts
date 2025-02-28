import mongoose from "mongoose"

// Add database name to the connection string
const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

// Ensure we're using the bicycle-store database
const DATABASE_NAME = "bicycle-store"
const MONGODB_URI_WITH_DB = MONGODB_URI.includes("?")
  ? MONGODB_URI.replace("?", `/${DATABASE_NAME}?`)
  : `${MONGODB_URI}/${DATABASE_NAME}`

// Define the cached connection interface
interface CachedConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Initialize the cached connection
let cached: CachedConnection = global.mongoose

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: DATABASE_NAME, // Explicitly set database name
    }

    console.log("Connecting to MongoDB...")

    cached.promise = mongoose
      .connect(MONGODB_URI_WITH_DB, opts)
      .then((mongoose) => {
        console.log(`MongoDB connected successfully to database: ${DATABASE_NAME}`)
        return mongoose
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error)
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect

