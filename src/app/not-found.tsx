import { Button } from "@/components/ui/button"
import { SearchX, Home } from "lucide-react"
import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50/20 to-white px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-50 flex items-center justify-center">
          <SearchX className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button className="rounded-xl shadow-sm">
            <Home className="w-4 h-4 mr-1.5" /> Go home
          </Button>
        </Link>
      </div>
    </div>
  )
}
