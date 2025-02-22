import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { RateLimiter } from "limiter"

const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: "hour",
  fireImmediately: true,
})

export async function middleware(request: NextRequest) {
  const remaining = await limiter.removeTokens(1)

  if (remaining < 0) {
    return new NextResponse(null, {
      status: 429,
      statusText: "Too Many Requests",
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}

