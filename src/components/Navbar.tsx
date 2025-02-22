"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, LayoutDashboard, Bike } from "lucide-react"
import { useTheme } from "next-themes"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useCart } from "./CartProvider"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"

export default function Navbar() {
  const { setTheme, theme } = useTheme()
  const { cart } = useCart()
  const { data: session } = useSession()

  return (
    <nav className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Bike className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold ml-2">Bicycle Store</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/bicycles">Bicycles</Link>
          <Link href="/about">About</Link>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </Button>
          {session?.user && (
            <Button variant="ghost" size="icon" asChild>
              <Link href={session.user.role === "admin" ? "/dashboard/admin" : "/dashboard"}>
                <LayoutDashboard className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {cart.length}
                </span>
              )}
            </Link>
          </Button>
          {session?.user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href={session.user.role === "admin" ? "/dashboard/admin" : "/dashboard"}>
                  {session.user.role === "admin" ? "Admin Dashboard" : "User Dashboard"}
                </Link>
              </Button>
              <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                <User className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">
                <User className="h-5 w-5 mr-2" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}

