"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Item } from "@/types"
import Link from "next/link"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

L.Icon.Default.mergeOptions({ iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png", iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png", shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png" })

export default function MapView({ items }: { items: Item[] }) {
  const withLocation = items.filter(i => i.latitude && i.longitude)
  const center: [number, number] = withLocation.length > 0 ? [withLocation[0].latitude!, withLocation[0].longitude!] : [40.7128, -74.006]

  if (withLocation.length === 0) {
    return <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">No items with location data.</div>
  }

  return (
    <MapContainer center={center} zoom={10} className="h-[500px] w-full rounded-lg z-0">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
      {withLocation.map(item => (
        <Marker key={item.id} position={[item.latitude!, item.longitude!]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{item.title}</p>
              <p className="text-gray-500">{item.condition} &middot; {item.credits} credits</p>
              <Link href={`/item/${item.id}`} className="text-green-700 underline text-xs">View item</Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}