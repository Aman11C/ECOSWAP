"use client"

import { Navbar } from "@/components/Navbar"
import { Toaster } from "react-hot-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Toaster position="bottom-right" toastOptions={{
        style: { borderRadius: "0.75rem", background: "#1c1917", color: "#fafaf9", fontSize: "0.875rem" },
      }} />
    </>
  )
}
