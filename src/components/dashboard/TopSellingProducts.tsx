"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Product {
  name: string
  quantity: number
  revenue: number
}

interface TopSellingProductsProps {
  products: Product[]
}

export function TopSellingProducts({ products }: TopSellingProductsProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Units Sold</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Avg. Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No product data available for the selected period
              </TableCell>
            </TableRow>
          ) : (
            products.map((product, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {product.name}
                  {index < 3 && (
                    <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                      Top {index + 1}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">{product.quantity}</TableCell>
                <TableCell className="text-right">${product.revenue.toFixed(2)}</TableCell>
                <TableCell className="text-right">${(product.revenue / product.quantity).toFixed(2)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

