"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { DatePickerWithRange } from "@/components/dashboard/DateRangePicker"
import { SalesChart } from "@/components/dashboard/SalesChart"
import { TopSellingProducts } from "@/components/dashboard/TopSellingProducts"
import { SalesByCategoryChart } from "@/components/dashboard/SalesByCategoryChart"
import { Download, RefreshCw, TrendingUp, CreditCard, ShoppingBag, Users } from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import type { DateRange } from "react-day-picker"

interface SalesData {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  totalCustomers: number
  salesByDate: {
    date: string
    amount: number
    orders: number
  }[]
  topProducts: {
    name: string
    quantity: number
    revenue: number
  }[]
  salesByCategory: {
    category: string
    amount: number
    percentage: number
  }[]
}

export default function SalesReportPage() {
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [timeframe, setTimeframe] = useState("30days")
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (timeframe === "custom" && dateRange?.from && dateRange?.to) {
      fetchSalesData(dateRange.from, dateRange.to)
    } else {
      updateDateRangeFromTimeframe(timeframe)
    }
  }, [timeframe])

  useEffect(() => {
    if (timeframe === "custom" && dateRange?.from && dateRange?.to) {
      fetchSalesData(dateRange.from, dateRange.to)
    }
  }, [dateRange])

  const updateDateRangeFromTimeframe = (selectedTimeframe: string) => {
    const today = new Date()
    let from: Date
    let to: Date = today

    switch (selectedTimeframe) {
      case "7days":
        from = subDays(today, 7)
        break
      case "30days":
        from = subDays(today, 30)
        break
      case "month":
        from = startOfMonth(today)
        to = endOfMonth(today)
        break
      case "year":
        from = startOfYear(today)
        to = endOfYear(today)
        break
      default:
        from = subDays(today, 30)
    }

    setDateRange({ from, to })
    fetchSalesData(from, to)
  }

  const fetchSalesData = async (from: Date, to: Date) => {
    try {
      setIsLoading(true)

      const fromStr = format(from, "yyyy-MM-dd")
      const toStr = format(to, "yyyy-MM-dd")

      const response = await fetch(`/api/admin/sales?from=${fromStr}&to=${toStr}`)

      if (!response.ok) {
        throw new Error("Failed to fetch sales data")
      }

      const data = await response.json()
      setSalesData(data)
    } catch (error) {
      console.error("Error fetching sales data:", error)
      toast({
        title: "Error",
        description: "Failed to load sales data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      setIsExporting(true)

      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("Date range is required for export")
      }

      const fromStr = format(dateRange.from, "yyyy-MM-dd")
      const toStr = format(dateRange.to, "yyyy-MM-dd")

      const response = await fetch(`/api/admin/sales/export?from=${fromStr}&to=${toStr}`)

      if (!response.ok) {
        throw new Error("Failed to export sales data")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `sales-report-${fromStr}-to-${toStr}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Sales data exported successfully",
      })
    } catch (error) {
      console.error("Error exporting sales data:", error)
      toast({
        title: "Error",
        description: "Failed to export sales data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const refreshData = () => {
    if (dateRange?.from && dateRange?.to) {
      fetchSalesData(dateRange.from, dateRange.to)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Sales Reports</h2>
          <p className="text-muted-foreground">View and analyze your store's sales performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleExportData} disabled={isExporting || isLoading}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="year">This year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {timeframe === "custom" && (
          <div className="flex-1">
            <DatePickerWithRange dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-7 bg-muted rounded w-20 mb-1"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : salesData ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${salesData.totalSales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {dateRange?.from && dateRange?.to
                    ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
                    : ""}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesData.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Avg. ${salesData.averageOrderValue.toFixed(2)} per order
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesData.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  {salesData.totalOrders > 0
                    ? `${(salesData.totalOrders / salesData.totalCustomers).toFixed(2)} orders per customer`
                    : "No orders"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {salesData.totalCustomers > 0
                    ? `${((salesData.totalOrders / salesData.totalCustomers) * 100).toFixed(1)}%`
                    : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">Orders to customers ratio</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Sales performance over the selected time period</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <SalesChart data={salesData.salesByDate} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>Products with the highest sales volume and revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopSellingProducts products={salesData.topProducts} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="categories" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Revenue distribution across product categories</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <SalesByCategoryChart data={salesData.salesByCategory} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">No sales data available for the selected period</p>
        </div>
      )}
    </div>
  )
}

