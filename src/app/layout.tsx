import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Toaster } from "@/components/ui/toaster"
import CartProvider from "@/components/CartProvider"

import SessionProviderWrapper from './../components/SessionProviderWrapper';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bicycle Store",
  description: "Your one-stop shop for premium bicycles",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <CartProvider>
              <Navbar />
              <main className="container mx-auto px-4 py-8">{children}</main>
              <Footer />
              <Toaster />
            </CartProvider>
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}

