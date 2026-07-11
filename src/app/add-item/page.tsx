"use client"

import { useState, useRef, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { supabase, getCurrentUser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyzeItemImage } from "@/lib/ai"
import { Upload, Sparkles, ImageIcon } from "lucide-react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

const categories = ["Books", "Electronics", "Clothes", "Furniture", "Sports", "Others"]
const conditions = ["New", "Like New", "Good", "Fair", "Poor"]

export default function AddItemPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", description: "", category: "", condition: "", credits: "", location: "" })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleAiAnalyze = async () => {
    if (!imageFile) { toast.error("Upload an image first"); return }
    setAiLoading(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(imageFile)
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1]
        const ai = await analyzeItemImage(base64)
        setForm({ ...form, title: ai.title, description: ai.description, category: ai.category, condition: ai.condition, credits: String(ai.suggestedCredits) })
        toast.success("AI analyzed your item!")
        setAiLoading(false)
      }
    } catch { toast.error("AI analysis failed. Fill manually."); setAiLoading(false) }
  }

  const uploadImage = async (userId: string): Promise<string | null> => {
    if (!imageFile) return null
    const ext = imageFile.name.split(".").pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from("items").upload(path, imageFile)
    if (error) { toast.error("Upload failed"); return null }
    const { data: { publicUrl } } = supabase.storage.from("items").getPublicUrl(path)
    return publicUrl
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.category || !form.condition || !form.credits) { toast.error("Fill required fields"); return }
    setLoading(true)
    const user = await getCurrentUser()
    if (!user) { toast.error("Please login"); router.push("/login"); return }
    const imageUrl = await uploadImage(user.id)
    const { error } = await supabase.from("items").insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      image_url: imageUrl,
      category: form.category,
      condition: form.condition,
      credits: parseInt(form.credits),
      location: form.location || null,
      status: "available",
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success("Item listed!")
    router.push("/explore")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/30 to-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900">List an Item</h1>
          <p className="text-sm text-gray-500 mt-1">Share what you no longer need with the community</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mt-6 border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-50">
              <CardTitle className="text-lg text-gray-900">Item Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700">Photo</label>
                  <div onClick={() => fileRef.current?.click()}
                    className="mt-1.5 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all">
                    {preview ? (
                      <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-sm" />
                    ) : (
                      <div>
                        <div className="w-12 h-12 mx-auto rounded-full bg-brand-100 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-brand-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-600 mt-3">Click to upload an image</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </div>

                <Button type="button" variant="secondary" onClick={handleAiAnalyze} disabled={aiLoading}
                  className="w-full rounded-xl h-11 border-2">
                  {aiLoading ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" /> Analyzing...</span>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2 text-brand-500" /> AI Auto-Fill from Image</>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
                    <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                      className="mt-1" placeholder="e.g. MacBook Pro 2020" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                      placeholder="Describe the item's condition, what's included, etc."
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all">
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Condition <span className="text-red-500">*</span></label>
                    <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} required
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all">
                      <option value="">Select...</option>
                      {conditions.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Credits <span className="text-red-500">*</span></label>
                    <Input type="number" value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} required min={1}
                      className="mt-1" placeholder="10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                      className="mt-1" placeholder="City, Area" />
                  </div>
                </div>

                <Button type="submit" className="w-full rounded-xl h-12 shadow-lg shadow-brand-200/50" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Listing...</span>
                  ) : "List Item"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
