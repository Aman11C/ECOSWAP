"use client"

import Link from "next/link"
import { Item } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { MapPin, CreditCard } from "lucide-react"

const conditionColors: Record<string, string> = {
  "New": "bg-green-100 text-green-800",
  "Like New": "bg-emerald-100 text-emerald-800",
  "Good": "bg-blue-100 text-blue-800",
  "Fair": "bg-yellow-100 text-yellow-800",
  "Poor": "bg-red-100 text-red-800",
}

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/item/${item.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow group">
        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
          )}
          <Badge className={`absolute top-2 right-2 ${conditionColors[item.condition] || "bg-gray-100"}`}>
            {item.condition}
          </Badge>
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm truncate">{item.title}</h3>
          <p className="text-xs text-gray-500 mt-1 truncate">{item.description}</p>
          <div className="flex items-center justify-between mt-2">
            <Badge className="bg-green-100 text-green-800 text-xs">{item.category}</Badge>
            <span className="flex items-center gap-1 text-sm font-medium text-green-700">
              <CreditCard className="w-3 h-3" /> {item.credits}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <div className="flex items-center gap-1.5">
               <Avatar src={item.user?.profile_image} fallback={item.user?.name || "U"} className="w-5 h-5 text-[8px]" />
              <span className="text-xs text-gray-600">{item.user?.name || "Unknown"}</span>
            </div>
            {item.location && (
              <span className="flex items-center gap-0.5 text-xs text-gray-400"><MapPin className="w-3 h-3" />{item.location}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
