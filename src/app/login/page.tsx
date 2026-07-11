"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Leaf, Mail, Lock, LogIn } from "lucide-react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    router.push("/explore")
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-100/40 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-brand-200/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-green-600 flex items-center justify-center mb-4 shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to continue swapping</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="you@example.com" className="pl-10 rounded-xl" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required placeholder="••••••••" className="pl-10 rounded-xl" />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-xl h-11" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</span>
              ) : (
                <span className="flex items-center gap-2"><LogIn className="w-4 h-4" /> Sign In</span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            No account?{" "}
            <Link href="/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
