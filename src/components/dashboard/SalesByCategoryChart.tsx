"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card } from "@/components/ui/card"

interface SalesByCategoryChartProps {
  data: {
    category: string
    amount: number
    percentage: number
  }[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

export function SalesByCategoryChart({ data }: SalesByCategoryChartProps) {
  // Format the data for the chart
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Card className="p-3 border shadow-sm">
                  <p className="font-medium">{payload[0].name}</p>
                  <p className="text-sm text-muted-foreground">
                    Revenue: <span className="font-medium">${payload[0].value?.toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Percentage: <span className="font-medium">{(payload[0].payload.percentage * 100).toFixed(1)}%</span>
                  </p>
                </Card>
              )
            }
            return null
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

