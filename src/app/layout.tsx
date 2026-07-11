import { GeistSans, GeistMono } from "geist/font"
import { Providers } from "@/components/Providers"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="min-h-screen bg-earth-50 antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
