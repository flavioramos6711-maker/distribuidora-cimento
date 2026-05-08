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
    ? "bg-white/40 backdrop-blur-2xl border-b border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.05)]" 
    : "bg-transparent border-b border-transparent"

  return (
    <header
      className={
        "z-50 shrink-0 w-full transition-all duration-500 " +
        "max-lg:fixed max-lg:inset-x-0 max-lg:top-0 " +
        "lg:sticky lg:top-0"
      }
    >
      <Topbar />
      <div className={`${barSurface} transition-all duration-500`}>
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          {/* Main Bar */}
          <div className="flex items-center justify-between gap-6 py-2.5 lg:py-5">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#002D5B] lg:hidden"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex shrink-0 items-center"
            >
              <DynamicBrandLogo variant="full" className="h-9 lg:h-12 w-auto" />
            </Link>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-12">
              <Suspense fallback={<div className="h-12 w-full animate-pulse rounded-lg bg-slate-50" />}>
                <StoreSearch />
              </Suspense>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 lg:gap-8">
              {/* User Account */}
              <Link
                href={user ? "/minha-conta" : "/login"}
                className="hidden sm:flex items-center gap-3 group"
              >
                <User className="h-5 w-5 text-slate-400 group-hover:text-[#F47920] transition-colors" />
                <div className="hidden lg:flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {user ? "Bem-vindo," : "Acesse sua"}
                  </span>
                  <span className="text-[12px] font-bold text-[#002D5B] truncate max-w-[120px]">
                    {user ? (user.name || user.email.split("@")[0]) : "Conta"}
                  </span>
                </div>
              </Link>

              {/* Desktop Location Selector */}
              <div className="hidden lg:block border-l border-slate-200 pl-6">
                <LocationSelector />
              </div>

              {/* Cart */}
              <Link
                href="/carrinho"
                className="group relative flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-[#002D5B] hover:border-[#F47920] hover:text-[#F47920] transition-all"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F47920] px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Search Row (Mobile/Tablet Only) */}
          <div className="pb-2 lg:hidden">
            <Suspense fallback={<div className="h-12 w-full animate-pulse rounded-lg bg-slate-50" />}>
              <StoreSearch />
            </Suspense>
          </div>

          {/* Streamlined Nav */}
          <nav className="hidden lg:block border-t border-border/10">
            <ul className="flex items-center gap-1 py-1">
              <li>
                <Link
                  href="/produtos"
                  className="flex items-center gap-2 px-6 py-3 text-sm font-black text-[#002D5B] uppercase tracking-wide hover:bg-muted/50 rounded-xl transition-all"
                >
                  <Menu className="h-4 w-4" />
                  Todos os Produtos
                </Link>
              </li>
              <div className="w-px h-4 bg-border/40 mx-2" />
              <li>
                <Link
                  href="/promocoes"
                  className="flex items-center gap-2 px-6 py-3 text-sm font-black text-[#F47920] uppercase tracking-wide hover:bg-[#F47920]/10 rounded-xl transition-all"
                >
                  <Tag className="h-4 w-4" />
                  Ofertas do Dia
                </Link>
              </li>
              <div className="w-px h-4 bg-border/40 mx-2" />
              <li>
                <Link
                  href="/rastrear-pedido"
                  className="flex items-center gap-2 px-6 py-3 text-sm font-black text-[#002D5B]/70 uppercase tracking-wide hover:bg-muted/50 rounded-xl transition-all"
                >
                  Rastrear Pedido
                </Link>
              </li>
              <li className="ml-auto">
                {isMounted && (
                  <ContactPopup>
                    <button className="flex items-center gap-2 px-6 py-3 text-sm font-black text-[#002D5B] uppercase tracking-wide hover:bg-muted/50 rounded-xl transition-all cursor-pointer">
                      <Headset className="h-4 w-4 text-[#F47920]" />
                      Atendimento Oficial
                    </button>
                  </ContactPopup>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {menuOpen && (
        <div className="max-h-[min(78vh,520px)] overflow-y-auto border-b border-border bg-background/98 shadow-app-lg backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 p-3">
            <Link
              href="/produtos"
              onClick={() => setMenuOpen(false)}
              className="block rounded-2xl px-4 py-3.5 text-sm font-semibold transition hover:bg-muted/80 active:scale-[0.99]"
            >
              Ver catálogo completo
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm transition hover:bg-muted/80 active:scale-[0.99]"
              >
                {cat.name}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-1 border-t border-border/60 pt-3 text-sm sm:hidden">
              <a href={`tel:+${SITE.whatsappE164}`} className="rounded-2xl px-4 py-2.5 text-muted-foreground">
                {SITE.phoneDisplay}
              </a>
              <Link href="/rastrear-pedido" className="rounded-2xl px-4 py-2.5" onClick={() => setMenuOpen(false)}>
                Rastrear pedido
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
