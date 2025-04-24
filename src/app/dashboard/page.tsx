import { Suspense } from "react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"
import { redirect } from "next/navigation"
import UserDashboard from "@/components/dashboard/UserDashboard"
import RecentOrders from "@/components/dashboard/RecentOrders"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardPage({ searchParams }: { searchParams: { tab?: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Set default tab or use the one from URL
  const defaultTab = searchParams.tab || "overview"

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <UserDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="orders">
          <Suspense fallback={<OrdersSkeleton />}>
            <RecentOrders />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/4" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  )
}

