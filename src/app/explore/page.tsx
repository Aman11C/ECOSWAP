"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Item } from "@/types"
import { ItemCard } from "@/components/ItemCard"
import { SearchBar } from "@/components/SearchBar"
import { Button } from "@/components/ui/button"
import { Map, Grid3X3, Package, SlidersHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false })

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-8 w-20 bg-gray-100 rounded-full" />
          <div className="h-4 w-16 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const [items, setItems] = useState<Item[]>([])
  const [filtered, setFiltered] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    supabase.from("items").select("*, user:users(*)").eq("status", "available").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) { setItems(data); setFiltered(data) }
      setLoading(false)
    })
  }, [])

  const handleSearch = (q: string) => {
    setFiltered(items.filter(i => i.title.toLowerCase().includes(q.toLowerCase()) || i.description.toLowerCase().includes(q.toLowerCase())))
  }
  const handleCategory = (c: string) => {
    setFiltered(items.filter(i => !c || i.category === c))
  }
  const handleCondition = (c: string) => {
    setFiltered(items.filter(i => !c || i.condition === c))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Explore Items</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? "Loading..." : `${filtered.length} item${filtered.length !== 1 ? "s" : ""} available`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowMap(!showMap)}
            className="rounded-full border-2">
            {showMap ? <><Grid3X3 className="w-4 h-4 mr-1.5" /> Grid</> : <><Map className="w-4 h-4 mr-1.5" /> Map</>}
          </Button>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} onCategory={handleCategory} onCondition={handleCondition} />

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium text-gray-600">No items found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </motion.div>
        ) : showMap ? (
          <MapView items={filtered} />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((item, i) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3 }}>
                  <ItemCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
