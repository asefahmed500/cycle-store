import type { NextAuthOptions, User as NextAuthUser } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import User from "@/models/User"
import dbConnect from "./db"

interface ExtendedUser extends NextAuthUser {
  role?: "user" | "admin"
}

interface ExtendedJWT extends JWT {
  role?: "user" | "admin"
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required")
          }

          await dbConnect()

          // Find user and explicitly select password field
          const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+password").lean().exec() as { _id: string; password: string; email: string; name: string; role: "user" | "admin" } | null;

          if (!user) {
            console.log("User not found or no password:", credentials.email)
            throw new Error("Invalid email or password")
          }

          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email)
            throw new Error("Invalid email or password")
          }

          // Return user without password
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role as "user" | "admin",
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw error
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as ExtendedUser).role
      }

      // Handle Google Sign In
      if (account?.provider === "google") {
        try {
          await dbConnect()
          const existingUser = await User.findOne({ email: token.email })

          if (existingUser) {
            token.id = existingUser._id.toString()
            token.role = existingUser.role
          } else {
            const newUser = await User.create({
              name: token.name,
              email: token.email,
              googleId: token.sub,
              role: "user",
            })
            token.id = newUser._id.toString()
            token.role = "user"
          }
        } catch (error) {
          console.error("Google auth error:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token as ExtendedJWT).role
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

