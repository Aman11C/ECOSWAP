"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { supabase, getCurrentUser } from "@/lib/supabase"
import { User, Message } from "@/types"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Send, MessageCircle, ArrowLeft } from "lucide-react"
import { FormEvent } from "react"

function ChatContent() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<{ user: User; lastMsg: Message }[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then(async u => {
      if (!u) return
      setUser(u)
      const { data: msgs } = await supabase.from("messages").select("*").or(`sender_id.eq.${u.id},receiver_id.eq.${u.id}`).order("created_at")
      if (msgs) {
        const pairMap = new Map<string, { user: User; lastMsg: Message }>()
        for (const msg of msgs) {
          const otherId = msg.sender_id === u.id ? msg.receiver_id : msg.sender_id
          if (!pairMap.has(otherId)) {
            const { data: otherUser } = await supabase.from("users").select("*").eq("id", otherId).single()
            if (otherUser) pairMap.set(otherId, { user: otherUser, lastMsg: msg })
          }
        }
        setConversations(Array.from(pairMap.values()))
      }
      setLoading(false)
    })
  }, [])

  const openChat = async (other: User) => {
    setSelectedUser(other)
    if (!user) return
    const { data } = await supabase.from("messages").select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${other.id}),and(sender_id.eq.${other.id},receiver_id.eq.${user.id})`)
      .order("created_at")
    if (data) setMessages(data)
  }

  useEffect(() => {
    if (!user || !selectedUser) return
    const sub = supabase.channel("chat-live").on("postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const msg = payload.new as Message
        if (
          (msg.sender_id === user.id && msg.receiver_id === selectedUser.id) ||
          (msg.sender_id === selectedUser.id && msg.receiver_id === user.id)
        ) {
          setMessages(prev => [...prev, msg])
        }
      }
    ).subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [user, selectedUser])

  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !user || !selectedUser) return
    await supabase.from("messages").insert({
      sender_id: user.id, receiver_id: selectedUser.id, exchange_id: null, message: text,
    })
    setMessages(prev => [...prev, { id: Date.now().toString(), sender_id: user.id, receiver_id: selectedUser.id, exchange_id: null, message: text, created_at: new Date().toISOString() }])
    setText("")
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-100 rounded-full w-40" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
          </div>
          <div className="md:col-span-2 h-[500px] bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/20 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
          <MessageCircle className="w-6 h-6 text-brand-600" /> Messages
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-400">
                <MessageCircle className="w-10 h-10 mb-2" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map(c => (
                <motion.div key={c.user.id} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedUser?.id === c.user.id
                        ? "ring-2 ring-brand-500 shadow-sm"
                        : "border border-gray-100 shadow-sm"
                    }`}
                    onClick={() => openChat(c.user)}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <Avatar src={c.user.profile_image} fallback={c.user.name} className="w-10 h-10 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{c.user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{c.lastMsg.message}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          <div className="md:col-span-2">
            {selectedUser ? (
              <div className="flex flex-col h-[600px] border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
                  <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelectedUser(null)}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Avatar src={selectedUser.profile_image} fallback={selectedUser.name} className="w-8 h-8" />
                  <span className="font-semibold text-sm text-gray-900">{selectedUser.name}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={el => el?.scrollTo(0, el.scrollHeight)}>
                  <AnimatePresence initial={false}>
                    {messages.map(msg => {
                      const mine = msg.sender_id === user?.id
                      return (
                        <motion.div key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            mine
                              ? "bg-brand-600 text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-900 rounded-bl-sm"
                          }`}>
                            {msg.message}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>

                <form onSubmit={send} className="flex gap-2 p-4 border-t border-gray-100 bg-white">
                  <Input value={text} onChange={e => setText(e.target.value)}
                    placeholder="Type a message..."
                    className="rounded-xl border-gray-200 focus-visible:ring-brand-500/20" />
                  <Button type="submit" size="sm" className="rounded-xl shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-gray-400 border border-gray-200 rounded-2xl bg-white">
                <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
                <p className="font-medium text-gray-500">Select a conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  )
}
