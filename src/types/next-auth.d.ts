import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: "user" | "admin"
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: "user" | "admin"
    password?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: "user" | "admin"
  }
}

