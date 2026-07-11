"use client"

import { useState, useEffect, useRef, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import { Message, User } from "@/types"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Send } from "lucide-react"

export function ChatBox({ exchangeId, currentUser, otherUser }: { exchangeId: string; currentUser: User; otherUser: User }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from("messages").select("*").eq("exchange_id", exchangeId).order("created_at").then(({ data }) => {
      if (data) setMessages(data)
    })
    const sub = supabase.channel(`messages:${exchangeId}`).on("postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `exchange_id=eq.${exchangeId}` },
      (payload) => { setMessages(prev => [...prev, payload.new as Message]) }
    ).subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [exchangeId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    await supabase.from("messages").insert({
      sender_id: currentUser.id,
      receiver_id: otherUser.id,
      exchange_id: exchangeId,
      message: text,
    })
    setText("")
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-lg">
      <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
        <Avatar src={otherUser.profile_image} fallback={otherUser.name} className="w-8 h-8" />
        <span className="font-medium text-sm">{otherUser.name}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender_id === currentUser.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${msg.sender_id === currentUser.id ? "bg-green-600 text-white" : "bg-gray-100 text-gray-900"}`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 p-3 border-t">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        <Button type="submit" size="sm"><Send className="w-4 h-4" /></Button>
      </form>
    </div>
  )
}
