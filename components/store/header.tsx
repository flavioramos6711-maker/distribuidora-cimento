"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { ShoppingCart, User, Menu, X, Phone, ChevronDown, LogIn, Tag, Headset } from "lucide-react"
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
          const extractedName = meta?.full_name ?? meta?.name ?? meta?.first_name ?? meta?.displayName
          
          setUser({
            email: data.user.email || "",
            name: extractedName,
          })
        } else {
          setUser(null)
        }
      })
    }
    syncUserFromAuth()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      syncUserFromAuth()
    })

    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      setCartCount(cart.reduce((acc: number, item: { qty: number }) => acc + item.qty, 0))
    } catch {
      /* empty */
    }

    function handleCartUpdate() {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]")
        setCartCount(cart.reduce((acc: number, item: { qty: number }) => acc + item.qty, 0))
      } catch {
        /* empty */
      }
    }
    window.addEventListener("cart-updated", handleCartUpdate)
    setIsMounted(true)

    return () => {
      sub.subscription.unsubscribe()
      window.removeEventListener("cart-updated", handleCartUpdate)
    }
  }, [])

  const barSurface = scrolled 
    ? "bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.05)]" 
    : "bg-white border-b border-slate-50 shadow-sm"

  return (
    <header
      className={
        "z-50 shrink-0 w-full transition-all duration-500 " +
        "max-lg:fixed max-lg:inset-x-0 max-lg:top-0 " +
        "lg:sticky lg:top-0"
      }
    >
      <div className="hidden lg:block">
        <Topbar />
      </div>
      <div className={`${barSurface} transition-all duration-500`}>
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          {/* Main Bar */}
          <div className="flex items-center justify-between gap-6 py-3 lg:py-5">
              {/* Mobile Menu Trigger */}
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-secondary border border-slate-100 lg:hidden shadow-sm active:scale-90 transition-all"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex shrink-0 items-center hover:opacity-80 transition-opacity"
            >
              <DynamicBrandLogo variant="full" className="h-8 lg:h-12 w-auto" />
            </Link>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-12">
              <Suspense fallback={<div className="h-12 w-full animate-pulse rounded-2xl bg-slate-50" />}>
                <StoreSearch />
              </Suspense>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 lg:gap-8">
              {!user ? (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary text-white text-[10px] font-bold uppercase tracking-widest shadow-md hover:bg-secondary/90 active:scale-95 transition-all lg:bg-transparent lg:text-secondary lg:shadow-none lg:p-0"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </Link>
              ) : (
                <Link
                  href="/minha-conta"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-primary transition-all">
                      <User className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="hidden lg:flex flex-col items-start leading-tight">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Meu Perfil</span>
                    <span className="text-[11px] font-bold text-secondary truncate max-w-[120px] uppercase tracking-tight">
                      {user.name || user.email.split("@")[0]}
                    </span>
                  </div>
                </Link>
              )}

              {/* Desktop Location Selector */}
              <div className="hidden lg:block border-l border-slate-100 pl-8">
                <LocationSelector />
              </div>

              {/* Cart */}
              <Link
                href="/carrinho"
                className="group relative h-10 w-10 lg:h-11 lg:w-11 flex items-center justify-center rounded-xl bg-slate-50 text-secondary border border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-lg transition-all active:scale-95"
              >
                <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-lg ring-2 ring-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Search Row (Mobile/Tablet Only) */}
          <div className="pb-3 lg:hidden">
            <Suspense fallback={<div className="h-12 w-full animate-pulse rounded-2xl bg-slate-50" />}>
              <StoreSearch />
            </Suspense>
          </div>

          {/* Streamlined Nav */}
          <nav className="hidden lg:block border-t border-slate-50">
            <ul className="flex items-center gap-1 py-1">
              <li>
                <Link
                  href="/produtos"
                  className="flex items-center gap-2 px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-[0.15em] hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <Menu className="h-4 w-4" />
                  Catálogo Completo
                </Link>
              </li>
              <div className="w-px h-4 bg-slate-100 mx-2" />
              <li>
                <Link
                  href="/promocoes"
                  className="flex items-center gap-2 px-6 py-3 text-[11px] font-bold text-[#F47920] uppercase tracking-[0.15em] hover:bg-[#F47920]/5 rounded-xl transition-all"
                >
                  <Tag className="h-4 w-4" />
                  Ofertas Exclusivas
                </Link>
              </li>
              <div className="w-px h-4 bg-slate-100 mx-2" />
              <li>
                <Link
                  href="/rastrear-pedido"
                  className="flex items-center gap-2 px-6 py-3 text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Rastreamento
                </Link>
              </li>
              <li className="ml-auto">
                {isMounted && (
                  <ContactPopup>
                    <button className="flex items-center gap-2 px-6 py-3 text-[11px] font-black text-slate-900 uppercase tracking-[0.15em] hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                      <Headset className="h-4 w-4 text-[#F47920]" />
                      Atendimento
                    </button>
                  </ContactPopup>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {menuOpen && (
        <div className="max-h-[min(85vh,600px)] overflow-y-auto border-b border-slate-100 bg-white/98 shadow-2xl backdrop-blur-2xl lg:hidden animate-in slide-in-from-top-4 duration-300">
          <div className="mx-auto max-w-7xl space-y-1 p-4">
            <Link
              href="/produtos"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 text-sm font-black uppercase tracking-widest text-slate-900 transition active:scale-[0.98]"
            >
              Ver catálogo completo
              <ChevronDown className="h-4 w-4 -rotate-90 opacity-40" />
            </Link>
            <div className="grid grid-cols-1 gap-1 py-2">
                {categories.map((cat) => (
                <Link
                    key={cat.id}
                    href={`/categoria/${cat.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-2xl px-5 py-3.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98]"
                >
                    {cat.name}
                </Link>
                ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm">
              <a href={`tel:+${SITE.whatsappE164}`} className="flex items-center gap-3 rounded-2xl bg-slate-900 text-[#F47920] px-5 py-4 font-black uppercase tracking-widest shadow-lg">
                <Phone className="h-4 w-4" />
                {SITE.phoneDisplay}
              </a>
              <Link href="/rastrear-pedido" className="flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 font-black uppercase tracking-widest text-slate-500" onClick={() => setMenuOpen(false)}>
                Rastrear pedido
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
