import { createMocks } from "node-mocks-http"
import { GET, POST } from "../route"
import Product from "@/models/Product"
import { describe, beforeEach, it, expect } from "vitest" // Added imports

jest.mock("@/config/db", () => jest.fn())
jest.mock("@/models/Product", () => ({
  find: jest.fn(),
  create: jest.fn(),
}))

describe("Products API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("GET /api/products", () => {
    it("should return all products", async () => {
      const { req, res } = createMocks({
        method: "GET",
      })
      ;(Product.find as jest.Mock).mockResolvedValue([{ _id: "1", name: "Test Product", price: 100 }])

      await GET(req, res) // Added res parameter

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual([{ _id: "1", name: "Test Product", price: 100 }])
    })
    it("should handle errors", async () => {
      const { req, res } = createMocks({
        method: "GET",
      })
      ;(Product.find as jest.Mock).mockRejectedValue(new Error("Failed to fetch products"))

      await GET(req, res) // Added res parameter

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({ error: "Failed to fetch products" })
    })
  })

  describe("POST /api/products", () => {
    it("should create a new product", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          name: "New Product",
          price: 200,
        },
      })
      ;(Product.create as jest.Mock).mockResolvedValue({
        _id: "2",
        name: "New Product",
        price: 200,
      })

      await POST(req, res) // Added res parameter

      expect(res._getStatusCode()).toBe(201)
      expect(JSON.parse(res._getData())).toEqual({
        _id: "2",
        name: "New Product",
        price: 200,
      })
    })
    it("should handle errors", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          name: "New Product",
          price: 200,
        },
      })
      ;(Product.create as jest.Mock).mockRejectedValue(new Error("Failed to create product"))

      await POST(req, res) // Added res parameter

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({ error: "Failed to create product" })
    })
    it("should handle missing fields", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          price: 200,
        },
      })

      await POST(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({ error: "Missing required fields" })
    })
  })
})

