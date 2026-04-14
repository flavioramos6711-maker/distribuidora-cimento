"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { ShoppingCart, User, Menu, X, Phone, ChevronDown, LogIn } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import BrandLogo from "@/components/store/brand-logo"
import StoreSearch from "@/components/store/store-search"
import { SITE } from "@/lib/site-config"

const supabase = createClient()

export default function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
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
          const meta = data.user.user_metadata as { full_name?: string; name?: string } | undefined
          setUser({
            email: data.user.email || "",
            name: meta?.full_name ?? meta?.name,
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
    } catch { /* empty */ }

    function handleCartUpdate() {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]")
        setCartCount(cart.reduce((acc: number, item: { qty: number }) => acc + item.qty, 0))
      } catch { /* empty */ }
    }
    window.addEventListener("cart-updated", handleCartUpdate)

    return () => {
      sub.subscription.unsubscribe()
      window.removeEventListener("cart-updated", handleCartUpdate)
    }
  }, [])

  const glass = scrolled
    ? "bg-background/88 shadow-md shadow-black/5 border-border/80"
    : "bg-background/45 border-white/10"

  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-transparent transition-all duration-300 shrink-0">
      <div
        className={`${glass} backdrop-blur-xl backdrop-saturate-150 border-b transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="hidden sm:flex items-center justify-between gap-3 py-1.5 text-[11px] text-muted-foreground border-b border-border/30">
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="w-3 h-3 text-primary shrink-0" aria-hidden />
              <a href={`tel:+${SITE.whatsappE164}`} className="hover:text-primary transition truncate">
                {SITE.phoneDisplay}
              </a>
              <span className="text-border hidden md:inline">|</span>
              <span className="hidden md:inline truncate">Atacado B2B e B2C</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/rastrear-pedido" className="hover:text-primary transition">
                Rastrear
              </Link>
              <Link href="/contato" className="hover:text-primary transition">
                Contato
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-2.5 sm:py-3">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="order-1 lg:hidden p-2 rounded-xl text-foreground hover:bg-foreground/5 -ml-1"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="order-2 shrink-0 min-w-0 mr-1">
              <BrandLogo variant="full" />
            </Link>

            <div className="order-3 flex items-center gap-1 sm:gap-2 ml-auto shrink-0 md:order-4">
              <Link
                href={user ? "/minha-conta" : "/login"}
                className="group flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/[0.07] px-2.5 sm:px-3 py-2 text-foreground transition hover:bg-primary/15 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary group-hover:bg-primary/25 transition">
                  {user ? <User className="w-[18px] h-[18px]" strokeWidth={2.25} /> : <LogIn className="w-[18px] h-[18px]" strokeWidth={2.25} />}
                </span>
                <span className="hidden lg:flex flex-col items-start leading-tight max-w-[120px]">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                    {user ? "Minha conta" : "Entrar"}
                  </span>
                  <span className="text-xs font-semibold truncate w-full">{user ? user.name || "Perfil" : "Cadastre-se"}</span>
                </span>
              </Link>

              <Link
                href="/carrinho"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-background/50 text-foreground transition hover:bg-muted/80 hover:border-primary/25"
                aria-label="Carrinho"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            <Suspense
              fallback={
                <div className="order-4 h-11 w-full basis-full min-w-0 rounded-xl bg-muted/60 animate-pulse border border-border/40 md:order-3 md:flex-1 md:max-w-2xl md:mx-auto md:basis-auto" />
              }
            >
              <div className="order-4 w-full basis-full min-w-0 md:order-3 md:flex-1 md:max-w-2xl md:mx-auto md:basis-auto">
                <StoreSearch />
              </div>
            </Suspense>
          </div>

          <nav className="hidden lg:block border-t border-border/40">
            <ul className="flex flex-wrap items-center justify-center gap-0">
              <li>
                <Link
                  href="/produtos"
                  className="group relative flex items-center gap-1 px-4 py-3 text-sm font-semibold text-foreground/90 transition hover:text-primary"
                >
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" aria-hidden />
                  Todos os produtos
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 scale-x-0 bg-primary transition group-hover:scale-x-100" />
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categoria/${cat.slug}`}
                    className="group relative block px-4 py-3 text-sm font-medium text-foreground/85 transition hover:text-primary"
                  >
                    {cat.name}
                    <span className="absolute bottom-2 left-4 right-4 h-0.5 scale-x-0 bg-primary transition group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl shadow-lg max-h-[min(75vh,560px)] overflow-y-auto">
          <div className="p-3 space-y-1">
            <Link
              href="/produtos"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted"
            >
              Todos os produtos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-sm hover:bg-muted"
              >
                {cat.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-2 sm:hidden flex flex-col gap-1 text-sm">
              <a href={`tel:+${SITE.whatsappE164}`} className="px-4 py-2 text-muted-foreground">
                {SITE.phoneDisplay}
              </a>
              <Link href="/rastrear-pedido" className="px-4 py-2" onClick={() => setMenuOpen(false)}>
                Rastrear pedido
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
