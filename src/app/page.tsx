"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Leaf, RefreshCw, MapPin, MessageCircle, Star, ChevronRight,
  Package, Users, ArrowLeftRight, Sparkles, Shield, TreePine
} from "lucide-react"
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"
import { supabase } from "@/lib/supabase"

function AnimatedCounter({ value, label, icon: Icon, color }: {
  value: number; label: string; icon: any; color: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const motionVal = useMotionValue(0)
  const springVal = useSpring(motionVal, { damping: 30, stiffness: 100 })
  const rounded = useTransform(springVal, (v) => Math.round(v))

  useEffect(() => {
    if (inView) motionVal.set(value)
  }, [inView, value, motionVal])

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }} className="text-center">
      <div className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center mx-auto mb-2 shadow-sm">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <p className="text-3xl md:text-4xl font-bold text-gray-900 tabular-nums">
        <motion.span>{rounded}</motion.span>
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </motion.div>
  )
}

function FloatingLeaf({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{
      opacity: [0, 0.6, 0], y: [-20, -60, -100], x: [0, 15, -10]
    }} transition={{ duration: 6, delay, repeat: Infinity, ease: "easeOut" }}
      className={`absolute text-green-300/40 ${className}`}>
      <Leaf className="w-6 h-6" />
    </motion.div>
  )
}

export default function LandingPage() {
  const [stats, setStats] = useState({ items: 0, exchanges: 0, users: 0 })

  useEffect(() => {
    Promise.all([
      supabase.from("items").select("*", { count: "estimated", head: true }),
      supabase.from("exchanges").select("*", { count: "estimated", head: true }).eq("status", "completed"),
      supabase.from("users").select("*", { count: "estimated", head: true }),
    ]).then(([i, e, u]) => {
      setStats({ items: i.count ?? 0, exchanges: e.count ?? 0, users: u.count ?? 0 })
    })
  }, [])

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-brand-50 via-white to-brand-100/40">
        <FloatingLeaf className="top-20 left-[15%]" delay={0} />
        <FloatingLeaf className="top-40 right-[20%]" delay={1.5} />
        <FloatingLeaf className="bottom-32 left-[40%]" delay={3} />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-brand-200/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-200/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32 w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-brand-100 rounded-full px-4 py-1.5 text-sm text-brand-800 mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Sustainable Exchange Platform
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Swap What You Don&apos;t Need.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-green-600 to-emerald-600">
                Find What You Do.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Give your unused items a second life. Exchange books, electronics, clothes, and more
              with your community — no money needed.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register">
                <Button size="lg" className="rounded-full px-8 shadow-lg shadow-brand-200/50">
                  Get Started <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" size="lg" className="rounded-full px-8 border-2">
                  Browse Items
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8">
          <AnimatedCounter icon={Package} value={stats.items} label="Items Listed" color="text-brand-600" />
          <AnimatedCounter icon={ArrowLeftRight} value={stats.exchanges} label="Items Swapped" color="text-green-600" />
          <AnimatedCounter icon={Users} value={stats.users} label="Community Members" color="text-emerald-600" />
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Three simple steps to start swapping sustainably.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: RefreshCw, step: "01", title: "List Items", desc: "Upload items you no longer use — books, gadgets, clothes, and more." },
              { icon: MapPin, step: "02", title: "Find & Request", desc: "Browse items near you and send a swap request with one click." },
              { icon: MessageCircle, step: "03", title: "Swap & Save", desc: "Chat with the owner, arrange the exchange, and earn credits." },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative group text-center p-8 rounded-2xl border border-gray-100 bg-white hover:border-brand-200 hover:shadow-lg transition-all duration-300">
                <span className="text-5xl font-bold text-brand-100/60 absolute top-4 right-6 select-none">
                  {step.step}
                </span>
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5 group-hover:bg-brand-100 transition-colors">
                  <step.icon className="w-8 h-8 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Why EcoSwap?</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Built for the planet and its people.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: TreePine, title: "Reduce Waste", desc: "Keep items out of landfills. Every exchange reduces your carbon footprint and helps build a circular economy." },
              { icon: Shield, title: "Community Driven", desc: "Verified profiles and user reviews create a trusted marketplace where neighbors help neighbors." },
              { icon: Sparkles, title: "Free & Fair", desc: "No money changes hands. Our credit-based system ensures fair, balanced exchanges for everyone." },
            ].map((ben, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                  <ben.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{ben.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{ben.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative bg-gradient-to-br from-brand-700 via-green-800 to-emerald-900 text-white text-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}>
            <Leaf className="w-12 h-12 mx-auto mb-6 text-green-300" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Swapping?</h2>
            <p className="text-lg text-green-200 mb-10 max-w-lg mx-auto">
              Join your community in building a sustainable future — one exchange at a time.
            </p>
            <Link href="/register">
              <Button size="lg" className="rounded-full px-10 bg-white text-brand-800 hover:bg-green-50 shadow-xl">
                Create Free Account <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
