"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { ShoppingCart, User, Menu, X, Phone, ChevronDown, Tag, Headset } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import DynamicBrandLogo from "@/components/store/dynamic-brand-logo"
import StoreSearch from "@/components/store/store-search"
import Topbar from "@/components/store/topbar"
import LocationSelector from "@/components/store/location-selector"
import ContactPopup from "@/components/store/contact-popup"
import { SITE } from "@/lib/site-config"
import { cn } from "@/lib/utils"

const supabase = createClient()

export default function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    supabase.from("categories").select("id, name, slug").eq("active", true).order("sort_order").then(({ data }) => {
      if (data) setCategories(data)
    })
    function syncUserFromAuth() {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          const meta = data.user.user_metadata as any
          setUser({ email: data.user.email || "", name: meta?.full_name ?? meta?.name })
        } else {
          setUser(null)
        }
      })
    }
    syncUserFromAuth()
    const { data: sub } = supabase.auth.onAuthStateChange(() => syncUserFromAuth())

    const handleCartUpdate = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]")
        setCartCount(cart.reduce((acc: number, item: { qty: number }) => acc + item.qty, 0))
      } catch { /* empty */ }
    }
    handleCartUpdate()
    window.addEventListener("cart-updated", handleCartUpdate)
    setIsMounted(true)

    return () => {
      sub.subscription.unsubscribe()
      window.removeEventListener("cart-updated", handleCartUpdate)
    }
  }, [])

  const barSurface = scrolled 
    ? "bg-white/80 backdrop-blur-2xl border-b border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]" 
    : "bg-white border-b border-slate-50 shadow-sm"

  return (
    <header className="z-50 shrink-0 w-full lg:sticky lg:top-0">
      <div className="hidden lg:block">
        <Topbar />
      </div>
      <div className={cn(barSurface, "transition-all duration-500")}>
        <div className="mx-auto max-w-[1440px] px-4 lg:px-10">
          <div className="flex items-center justify-between gap-10 py-3 lg:py-4">
            {/* Mobile Menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden h-11 w-11 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 active:scale-90 transition-all">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="shrink-0 transition-transform active:scale-95">
              <DynamicBrandLogo variant="full" className="h-9 lg:h-11 w-auto" />
            </Link>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-10">
              <Suspense fallback={<div className="h-14 w-full animate-pulse rounded-2xl bg-slate-50" />}>
                <StoreSearch />
              </Suspense>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 lg:gap-10">
              <div className="hidden xl:block">
                <LocationSelector />
              </div>

              <div className="h-8 w-px bg-slate-100 hidden lg:block" />

              {!user ? (
                <Link href="/login" className="hidden lg:flex items-center gap-3 group">
                   <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                      <User className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                   </div>
                   <div className="flex flex-col items-start">
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Minha Conta</span>
                     <span className="text-[11px] font-black uppercase tracking-tight text-slate-900">Entrar</span>
                   </div>
                </Link>
              ) : (
                <Link href="/minha-conta" className="flex items-center gap-3 group">
                   <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                      <User className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                   </div>
                   <div className="hidden lg:flex flex-col items-start leading-tight">
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Parceiro</span>
                     <span className="text-[11px] font-black uppercase tracking-tight text-secondary truncate max-w-[100px]">
                       {user.name?.split(" ")[0] || "Perfil"}
                     </span>
                   </div>
                </Link>
              )}

              <Link href="/carrinho" className="group relative h-11 w-11 flex items-center justify-center rounded-2xl bg-slate-50 text-secondary border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all">
                <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-white shadow-lg ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Search Row Mobile */}
          <div className="pb-4 lg:hidden">
            <Suspense fallback={<div className="h-14 w-full animate-pulse rounded-2xl bg-slate-50" />}>
              <StoreSearch />
            </Suspense>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:block border-t border-slate-50">
            <ul className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <li>
                  <Link href="/produtos" className="flex items-center gap-2 px-5 py-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                    <Menu className="h-4 w-4" />
                    Catálogo
                  </Link>
                </li>
                <li>
                  <Link href="/promocoes" className="flex items-center gap-2 px-5 py-3 text-[10px] font-black text-[#F47920] uppercase tracking-[0.2em] hover:bg-[#F47920]/5 rounded-xl transition-all">
                    <Tag className="h-4 w-4" />
                    Ofertas
                  </Link>
                </li>
                <li>
                  <Link href="/rastrear-pedido" className="px-5 py-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                    Rastreamento
                  </Link>
                </li>
              </div>
              
              {isMounted && (
                <li>
                  <ContactPopup>
                    <button className="flex items-center gap-2 px-5 py-3 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] hover:bg-slate-50 rounded-xl transition-all">
                      <Headset className="h-4 w-4 text-primary" />
                      Atendimento Consultivo
                    </button>
                  </ContactPopup>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 top-[136px] z-50 bg-white lg:hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-6 space-y-6">
            <Link href="/produtos" onClick={() => setMenuOpen(false)} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-100">
              Catálogo Completo
              <ChevronDown className="h-4 w-4 -rotate-90 opacity-40" />
            </Link>
            <div className="grid grid-cols-1 gap-2">
                {categories.slice(0, 8).map((cat) => (
                  <Link key={cat.id} href={`/categoria/${cat.slug}`} onClick={() => setMenuOpen(false)} className="block px-5 py-3 text-sm font-bold text-slate-600 hover:text-primary">
                      {cat.name}
                  </Link>
                ))}
            </div>
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <a href={`tel:+${SITE.whatsappE164}`} className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-secondary text-white font-black uppercase tracking-widest text-[11px]">
                <Phone className="h-4 w-4" />
                {SITE.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
