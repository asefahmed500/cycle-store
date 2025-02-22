import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Redirect admin users to admin dashboard
  if (token.role === "admin" && request.nextUrl.pathname === "/dashboard/user") {
    return NextResponse.redirect(new URL("/dashboard/admin", request.url))
  }

  // Redirect non-admin users to user dashboard
  if (token.role !== "admin" && request.nextUrl.pathname.startsWith("/dashboard/admin")) {
    return NextResponse.redirect(new URL("/dashboard/user", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

