"use client"

import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const categories = ["All", "Books", "Electronics", "Clothes", "Furniture", "Sports", "Others"]
const conditions = ["All", "New", "Like New", "Good", "Fair", "Poor"]

export function SearchBar({ onSearch, onCategory, onCondition }: {
  onSearch: (q: string) => void
  onCategory: (c: string) => void
  onCondition: (c: string) => void
}) {
  const [showFilters, setShowFilters] = useState(false)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [condition, setCondition] = useState("All")

  const handleSearch = (val: string) => { setQuery(val); onSearch(val) }
  const handleCategory = (val: string) => { setCategory(val); onCategory(val === "All" ? "" : val) }
  const handleCondition = (val: string) => { setCondition(val); onCondition(val === "All" ? "" : val) }

  const activeFilters = [category, condition].filter((f) => f !== "All")

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-400" />
          <input
            className="w-full rounded-xl border border-earth-200 bg-white py-2.5 pl-10 pr-4 text-sm text-earth-900 placeholder-earth-400 shadow-sm transition-all focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="Search items..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {query && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition-all ${
            showFilters || activeFilters.length > 0
              ? "border-brand-300 bg-brand-50 text-brand-700"
              : "border-earth-200 bg-white text-earth-600 hover:bg-earth-50"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilters.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-earth-200 bg-white p-4 shadow-sm space-y-4"
          >
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-earth-500">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCategory(c)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      category === c
                        ? "bg-brand-600 text-white shadow-sm"
                        : "border border-earth-200 bg-white text-earth-600 hover:border-brand-300 hover:text-brand-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-earth-500">Condition</p>
              <div className="flex flex-wrap gap-1.5">
                {conditions.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCondition(c)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      condition === c
                        ? "bg-brand-600 text-white shadow-sm"
                        : "border border-earth-200 bg-white text-earth-600 hover:border-brand-300 hover:text-brand-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
