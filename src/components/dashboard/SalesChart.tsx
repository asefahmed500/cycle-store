"use client"
import { Card } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface SalesChartProps {
  data: {
    date: string
    amount: number
    orders: number
  }[]
}

export function SalesChart({ data }: SalesChartProps) {
  // Format the data for the chart
  const chartData = data.map((item) => ({
    date: format(parseISO(item.date), "MMM dd"),
    revenue: item.amount,
    orders: item.orders,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          padding={{ left: 10, right: 10 }}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
          tick={{ fontSize: 12 }}
        />
        <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <Card className="p-3 border shadow-sm">
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">
                    Revenue: <span className="font-medium">${payload[0].value?.toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Orders: <span className="font-medium">{payload[1].value}</span>
                  </p>
                </Card>
              )
            }
            return null
          }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="orders"
          stroke="#f97316"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

