"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase, getCurrentUser } from "@/lib/supabase"
import { User, Item, Exchange, Review } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Root as Tabs, List as TabsList, Trigger as TabsTrigger, Content as TabsContent } from "@radix-ui/react-tabs"
import { ItemCard } from "@/components/ItemCard"
import { Package, Repeat, Star, Leaf, CreditCard, LogOut, MessageCircle, ThumbsUp, Plus, Send, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import toast from "react-hot-toast"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [myItems, setMyItems] = useState<Item[]>([])
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewExchange, setReviewExchange] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    getCurrentUser().then(async u => {
      if (!u) { router.push("/login"); return }
      setUser(u)
      const [itemsRes, sentRes, receivedRes, reviewsRes] = await Promise.all([
        supabase.from("items").select("*").eq("user_id", u.id).order("created_at", { ascending: false }),
        supabase.from("exchanges").select("*, item:items(*), receiver:users(*)").eq("sender_id", u.id).order("created_at", { ascending: false }),
        supabase.from("exchanges").select("*, item:items(*), sender:users(*)").eq("receiver_id", u.id).order("created_at", { ascending: false }),
        supabase.from("reviews").select("*, reviewer:users(*)").eq("user_id", u.id).order("created_at", { ascending: false }),
      ])
      setMyItems(itemsRes.data || [])
      setExchanges([...(sentRes.data || []), ...(receivedRes.data || [])])
      setReviews(reviewsRes.data || [])
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleSubmitReview = async () => {
    if (!reviewExchange || !user) return
    setSubmittingReview(true)
    const exchange = exchanges.find(e => e.id === reviewExchange)
    const targetUserId = exchange?.sender_id === user.id ? exchange?.receiver_id : exchange?.sender_id
    const { error } = await supabase.from("reviews").insert({
      reviewer_id: user.id,
      user_id: targetUserId,
      exchange_id: reviewExchange,
      rating: reviewRating,
      comment: reviewComment || null,
    })
    setSubmittingReview(false)
    if (error) { toast.error(error.message); return }
    toast.success("Review submitted!")
    setReviewExchange(null)
    setReviewComment("")
    setReviewRating(5)
    const { data } = await supabase.from("reviews").select("*, reviewer:users(*)").eq("user_id", user.id).order("created_at", { ascending: false })
    if (data) setReviews(data)
  }

  const handleExchangeAction = async (exchangeId: string, status: string) => {
    const { error } = await supabase.from("exchanges").update({ status }).eq("id", exchangeId)
    if (error) { toast.error(error.message); return }
    const exchange = exchanges.find(e => e.id === exchangeId)
    if (status === "completed" && exchange) {
      const item = exchange.item
      if (item) {
        await supabase.from("items").update({ status: "exchanged" }).eq("id", item.id)
        await supabase.rpc("add_credits", { user_id: item.user_id, amount: item.credits })
      }
    }
    toast.success(`Exchange ${status}!`)
    setExchanges(exchanges.map(e => e.id === exchangeId ? { ...e, status } : e))
  }

  const completedCount = exchanges.filter(e => e.status === "completed").length

  const stats = [
    { icon: Package, label: "My Items", value: myItems.length, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Repeat, label: "Exchanges", value: completedCount, color: "text-green-600", bg: "bg-green-50" },
    { icon: Star, label: "Reviews", value: reviews.length, color: "text-yellow-600", bg: "bg-yellow-50" },
    { icon: Leaf, label: "Items Reused", value: completedCount, color: "text-emerald-600", bg: "bg-emerald-50" },
  ]

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="animate-pulse space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full" />
          <div className="space-y-2">
            <div className="h-5 bg-gray-100 rounded-full w-40" />
            <div className="h-4 bg-gray-100 rounded-full w-56" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/20 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar src={user.profile_image} fallback={user.name} className="w-16 h-16 text-lg ring-2 ring-brand-200" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-700">{user.credits} credits</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/add-item"><Button size="sm" className="rounded-xl shadow-sm">
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button></Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5 text-center">
                <div className={`w-10 h-10 mx-auto rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs defaultValue="items" className="w-full">
          <TabsList className="flex gap-1 bg-gray-100/80 p-1 rounded-xl mb-6">
            {["items", "exchanges", "reviews"].map(tab => (
              <TabsTrigger key={tab} value={tab}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500 transition-all">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="items">
            {myItems.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-gray-400">
                <Package className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium text-gray-600">No items listed yet</p>
                <Link href="/add-item"><Button className="mt-4 rounded-xl" size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Add Your First Item
                </Button></Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {myItems.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <ItemCard item={item} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="exchanges">
            {exchanges.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-gray-400">
                <Repeat className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium text-gray-600">No exchanges yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exchanges.map(ex => {
                  const other = ex.sender_id === user.id ? ex.receiver : ex.sender
                  return (
                    <Card key={ex.id} className="border border-gray-100 shadow-sm">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar src={other?.profile_image} fallback={other?.name || "U"} className="w-10 h-10 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{ex.item?.title || "Item"}</p>
                            <p className="text-xs text-gray-500 truncate">with {other?.name}</p>
                            <span className={`inline-block text-xs font-medium mt-0.5 ${
                              ex.status === "completed" ? "text-green-600" :
                              ex.status === "pending" ? "text-yellow-600" : "text-red-600"
                            }`}>
                              {ex.status}
                            </span>
                          </div>
                        </div>
                        {ex.status === "pending" && ex.receiver_id === user.id && (
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" onClick={() => handleExchangeAction(ex.id, "completed")} className="rounded-lg">
                              <ThumbsUp className="w-3 h-3 mr-1" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleExchangeAction(ex.id, "rejected")} className="rounded-lg">
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        {ex.status === "completed" && (
                          <div className="flex gap-2 shrink-0">
                            <Link href={`/chat?exchange=${ex.id}`}>
                              <Button size="sm" variant="outline" className="rounded-lg">
                                <MessageCircle className="w-3 h-3 mr-1" /> Chat
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline" onClick={() => setReviewExchange(ex.id)} className="rounded-lg">
                              <Star className="w-3 h-3 mr-1" /> Review
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-gray-400">
                <Star className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium text-gray-600">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <Card key={r.id} className="border border-gray-100 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar src={r.reviewer?.profile_image} fallback={r.reviewer?.name || "U"} className="w-8 h-8" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{r.reviewer?.name}</span>
                            <div className="flex">{[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                            ))}</div>
                          </div>
                          {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <AnimatePresence>
          {reviewExchange && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
              onClick={() => setReviewExchange(null)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Leave a Review</h3>
                <div className="flex gap-1 mb-4 justify-center">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewRating(n)}
                      className={`text-3xl transition-all ${n <= reviewRating ? "text-yellow-400 scale-110" : "text-gray-200 hover:text-yellow-300"}`}>
                      ★
                    </button>
                  ))}
                </div>
                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your experience (optional)"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-4 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all" />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setReviewExchange(null)}>Cancel</Button>
                  <Button size="sm" onClick={handleSubmitReview} disabled={submittingReview} className="rounded-lg">
                    <Send className="w-3 h-3 mr-1" />
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
