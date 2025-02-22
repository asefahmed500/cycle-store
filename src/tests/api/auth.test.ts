import { createMocks } from "node-mocks-http"
import { POST } from "@/app/api/auth/signup/route"
import User from "@/models/User"
import { describe, it, beforeEach, expect } from "vitest" // Added imports

jest.mock("@/config/db", () => jest.fn())
jest.mock("@/models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}))

describe("Auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("POST /api/auth/signup", () => {
    it("should create a new user", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        },
      })
      ;(User.findOne as jest.Mock).mockResolvedValue(null)
      ;(User.create as jest.Mock).mockResolvedValue({
        _id: "1",
        name: "Test User",
        email: "test@example.com",
      })

      await POST(req, res) // Pass res object

      expect(res._getStatusCode()).toBe(201)
      expect(JSON.parse(res._getData())).toEqual({
        message: "User created successfully",
        user: {
          id: "1",
          name: "Test User",
          email: "test@example.com",
        },
      })
    })

    it("should return an error if user already exists", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          name: "Existing User",
          email: "existing@example.com",
          password: "password123",
        },
      })
      ;(User.findOne as jest.Mock).mockResolvedValue({
        _id: "2",
        name: "Existing User",
        email: "existing@example.com",
      })

      await POST(req, res) // Pass res object

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        error: "User already exists",
      })
    })
  })
})

