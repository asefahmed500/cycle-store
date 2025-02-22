import type React from "react"
import { AppSidebar } from "@/components/dashboard/AppSidebar"
import { SessionProvider } from "next-auth/react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import type { Session } from "next-auth"
import SessionProviderWrapper from "../../components/SessionProviderWrapper"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }


  return (
    <SessionProviderWrapper >
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </SessionProviderWrapper>
  )
}

