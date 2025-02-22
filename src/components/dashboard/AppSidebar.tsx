"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ShoppingCart, Users, Package, FileText, LogOut, User } from "lucide-react"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"

const adminLinks = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "User Management", icon: Users },
  { href: "/dashboard/admin/products", label: "Product Management", icon: Package },
  { href: "/dashboard/admin/orders", label: "Order Management", icon: ShoppingCart },
  { href: "/dashboard/admin/sales", label: "Sales Reports", icon: FileText },
  { href: "/dashboard/admin/banners", label: "Banner Management", icon: FileText },
  { href: "/dashboard/admin/coupons", label: "Coupon Management", icon: FileText },
]

const userLinks = [
  { href: "/dashboard", label: "My Orders", icon: ShoppingCart },
  { href: "/dashboard/profile", label: "Edit Profile", icon: User },
  { href: "/dashboard/wishlist", label: "My Wishlist", icon: Package },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const links = session?.user?.role === "admin" ? adminLinks : userLinks

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex items-center justify-center h-20 shadow-md">
        <h1 className="text-3xl font-bold text-white">Bicycle Store</h1>
      </div>
      <ul className="flex flex-col py-4">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>
              <span
                className={cn(
                  "flex items-center px-6 py-4 text-gray-100 hover:bg-gray-700 hover:text-white",
                  pathname === link.href && "bg-gray-700 text-white",
                )}
              >
                <link.icon className="h-5 w-5 mr-3" />
                {link.label}
              </span>
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center px-6 py-4 text-gray-100 hover:bg-gray-700 hover:text-white w-full"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </li>
      </ul>
    </div>
  )
}

