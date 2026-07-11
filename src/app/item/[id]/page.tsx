"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase, getCurrentUser } from "@/lib/supabase"
import { Item, User } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, CreditCard, Calendar, ArrowLeft, MessageCircle, Check, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"

const conditionColors: Record<string, string> = {
  "New": "bg-green-100 text-green-800", "Like New": "bg-emerald-100 text-emerald-800",
  "Good": "bg-blue-100 text-blue-800", "Fair": "bg-yellow-100 text-yellow-800", "Poor": "bg-red-100 text-red-800",
}

export default function ItemDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [item, setItem] = useState<Item | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)

  useEffect(() => {
    Promise.all([
      supabase.from("items").select("*, user:users(*)").eq("id", id).single(),
      getCurrentUser(),
    ]).then(([itemRes, user]) => {
      setItem(itemRes.data)
      setCurrentUser(user)
      if (user && itemRes.data) {
        supabase.from("exchanges").select("id").eq("item_id", itemRes.data.id).eq("sender_id", user.id).maybeSingle().then(({ data }) => {
          setHasRequested(!!data)
        })
      }
      if (itemRes.data) {
        supabase.from("reviews").select("*, reviewer:users!reviews_reviewer_id_fkey(*)").eq("user_id", itemRes.data.user_id).then(({ data }) => {
          if (data) setReviews(data)
        })
      }
      setLoading(false)
    })
  }, [id])

  const requestExchange = async () => {
    if (!currentUser || !item) return
    if (currentUser.credits < item.credits) { toast.error("Not enough credits!"); return }
    setRequesting(true)
    const { error } = await supabase.from("exchanges").insert({
      item_id: item.id, sender_id: currentUser.id, receiver_id: item.user_id, status: "pending",
    })
    if (error) { toast.error(error.message); setRequesting(false); return }
    toast.success("Exchange request sent!")
    setHasRequested(true)
    setRequesting(false)
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-gray-100 rounded-full w-24" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 rounded-full w-20" />
            <div className="h-8 bg-gray-100 rounded-full w-3/4" />
            <div className="h-20 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )

  if (!item) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <p className="text-lg text-gray-500">Item not found.</p>
      <Button variant="outline" className="mt-4" onClick={() => router.push("/explore")}>Browse Items</Button>
    </div>
  )

  const isOwner = currentUser?.id === item.user_id
  const images = [item.image_url, item.image_url, item.image_url].filter(Boolean) as string[]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.button onClick={() => router.back()} whileHover={{ x: -3 }}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </motion.button>

      <div className="grid md:grid-cols-2 gap-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group">
            {images.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.img key={imgIndex} src={images[imgIndex]} alt={item.title}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="w-full h-full object-cover" />
                </AnimatePresence>
                {images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                      className="w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setImgIndex(i => (i + 1) % images.length)}
                      className="w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? "bg-white w-4" : "bg-white/60"}`} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">No image</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={conditionColors[item.condition]}>{item.condition}</Badge>
            <Badge className="bg-brand-50 text-brand-700 border border-brand-200">{item.category}</Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{item.title}</h1>
          <p className="text-gray-600 mt-3 leading-relaxed">{item.description}</p>

          <div className="flex items-center gap-6 mt-5 flex-wrap">
            <span className="flex items-center gap-2 text-xl font-bold text-green-700">
              <CreditCard className="w-5 h-5" /> {item.credits} credits
            </span>
            {item.location && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4" /> {item.location}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Calendar className="w-4 h-4" /> {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>

          <Card className="mt-6 border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar src={item.user?.profile_image} fallback={item.user?.name || "U"} className="w-12 h-12" />
                <div>
                  <p className="font-semibold text-gray-900">{item.user?.name}</p>
                  <p className="text-sm text-gray-500">Community Member</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {currentUser && !isOwner && (
            <div className="mt-6 space-y-3">
              {hasRequested ? (
                <Button className="w-full rounded-xl h-12" variant="secondary" disabled>
                  <Check className="w-4 h-4 mr-2" /> Request Sent
                </Button>
              ) : (
                <Button className="w-full rounded-xl h-12 shadow-lg shadow-brand-200/50" onClick={requestExchange} disabled={requesting}>
                  {requesting ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</span>
                  ) : "Request Exchange"}
                </Button>
              )}
              <Button variant="outline" className="w-full rounded-xl h-11" onClick={() => router.push(`/chat?user=${item.user_id}`)}>
                <MessageCircle className="w-4 h-4 mr-2" /> Message Owner
              </Button>
            </div>
          )}

          {reviews.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> Reviews ({reviews.length})
              </h3>
              <div className="space-y-3">
                {reviews.map((r) => (
                  <Card key={r.id} className="border border-gray-100">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar src={r.reviewer?.profile_image} fallback={r.reviewer?.name || "U"} className="w-8 h-8" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{r.reviewer?.name}</p>
                            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />)}</div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
