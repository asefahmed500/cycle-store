import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OrderConfirmationPage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
      <p className="mb-8">Your order has been successfully placed and is being processed.</p>
      <Button asChild>
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  )
}

