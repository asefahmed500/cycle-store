"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function OrderConfirmation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (sessionId) {
      // Check if order exists or create it if needed
      const checkOrder = async () => {
        try {
          setIsLoading(true)

          // Try to fetch the order by session ID
          const response = await fetch(`/api/orders/session/${sessionId}`)

          if (response.ok) {
            const data = await response.json()
            setOrderDetails({
              orderNumber: data.order._id,
              date: new Date(data.order.createdAt).toLocaleDateString(),
              total: data.order.total,
              status: data.order.status,
            })
          } else {
            // If order doesn't exist, use fallback details
            setOrderDetails({
              orderNumber: Math.random().toString(36).substr(2, 9).toUpperCase(),
              date: new Date().toLocaleDateString(),
            })
          }
        } catch (error) {
          console.error("Error checking order:", error)
          toast({
            title: "Error",
            description: "Could not retrieve order details",
            variant: "destructive",
          })

          // Use fallback details
          setOrderDetails({
            orderNumber: Math.random().toString(36).substr(2, 9).toUpperCase(),
            date: new Date().toLocaleDateString(),
          })
        } finally {
          setIsLoading(false)
        }
      }

      checkOrder()
    }
  }, [sessionId, toast])

  if (!sessionId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Order Session</h1>
        <p className="mb-8">No order information found.</p>
        <Button onClick={() => router.push("/")}>Return to Home</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Thank you for your purchase. We&apos;ll send you an email with your order details.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : orderDetails ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Order Number:</span>
              <span>{orderDetails.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{orderDetails.date}</span>
            </div>
            {orderDetails.total && (
              <div className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span>${orderDetails.total.toFixed(2)}</span>
              </div>
            )}
            {orderDetails.status && (
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="capitalize">{orderDetails.status}</span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <Button onClick={() => router.push("/")} className="w-full">
          Continue Shopping
        </Button>
        <Button variant="outline" onClick={() => router.push("/dashboard?tab=orders")} className="w-full">
          View Order History
        </Button>
      </div>
    </div>
  )
}

