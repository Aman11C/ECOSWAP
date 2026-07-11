"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User } from "@/types"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Leaf, Menu, X, Compass, PlusCircle, LayoutDashboard, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from("users").select("*").eq("id", data.user.id).single().then(({ data }) => setUser(data))
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single()
        setUser(data)
      } else setUser(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  const linkClass = (path: string) =>
    `text-sm transition-colors ${pathname === path ? "text-brand-700 font-semibold" : "text-earth-600 hover:text-brand-700"}`

  const navLinks = [
    { href: "/explore", label: "Explore", icon: Compass },
  ]

  if (user) {
    navLinks.push(
      { href: "/add-item", label: "Add Item", icon: PlusCircle },
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/chat", label: "Messages", icon: MessageSquare },
    )
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-shadow ${
        scrolled ? "shadow-sm" : ""
      } bg-white/95 backdrop-blur-lg border-b border-earth-100`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-brand-700">
          <Leaf className="h-6 w-6" />
          <span>EcoSwap</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
          <div className="ml-2 flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button size="sm" variant="ghost" className="gap-1.5">
                    <span className="font-semibold text-brand-600">{user.credits}</span>
                    <span className="text-earth-500">pts</span>
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Avatar src={user.profile_image} alt={user.name} fallback={user.name} size="sm" />
                </Link>
                <Button variant="ghost" size="sm" className="text-earth-500" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>

        <button className="md:hidden p-2 text-earth-600" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-earth-100 md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    pathname === link.href
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-earth-600 hover:bg-earth-50"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-earth-100 pt-2 mt-2">
                {user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-earth-600">
                      <Avatar src={user.profile_image} alt={user.name} fallback={user.name} size="sm" />
                      <span className="font-medium text-earth-800">{user.name}</span>
                      <span className="ml-auto font-semibold text-brand-600">{user.credits} pts</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-earth-600 hover:bg-earth-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="block px-3 py-2">
                    <Button className="w-full">Login</Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
