"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { ShoppingCart, User, Menu, X, Phone, ChevronDown, LogIn } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import DynamicBrandLogo from "@/components/store/dynamic-brand-logo"
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

    return () => {
      sub.subscription.unsubscribe()
      window.removeEventListener("cart-updated", handleCartUpdate)
    }
  }, [])

  const barSurface = scrolled
    ? "bg-background/92 shadow-app border-border/60"
    : "bg-background/80 border-border/40"

  return (
    <header
      className={
        "z-50 shrink-0 border-b border-transparent " +
        /* Mobile: fixed evita sobreposição do 1º bloco (banner) com layout flex+sticky; desktop: sticky no fluxo */
        "max-lg:fixed max-lg:inset-x-0 max-lg:top-0 max-lg:bg-background max-lg:pt-[env(safe-area-inset-top,0px)] " +
        "lg:sticky lg:top-0 lg:bg-transparent lg:pt-0"
      }
    >
      <div
        className={`${barSurface} backdrop-blur-xl backdrop-saturate-150 border-b transition-all duration-200 ease-out max-lg:bg-background/95`}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="hidden sm:flex items-center justify-between gap-3 py-2 text-[11px] text-muted-foreground border-b border-border/25">
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden />
              <a href={`tel:+${SITE.whatsappE164}`} className="hover:text-foreground transition truncate">
                {SITE.phoneDisplay}
              </a>
              <span className="text-border hidden md:inline">|</span>
              <span className="hidden md:inline truncate">Entrega e atacado</span>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link href="/rastrear-pedido" className="hover:text-foreground transition">
                Rastrear
              </Link>
              <Link href="/contato" className="hover:text-foreground transition">
                Contato
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 py-2.5 sm:py-3">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="order-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-transparent text-foreground transition hover:bg-muted/80 hover:scale-[1.03] active:scale-[0.97] lg:hidden"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link
              href="/"
              className="order-2 flex min-w-0 shrink-0 items-center transition hover:opacity-90 active:scale-[0.98]"
            >
              <DynamicBrandLogo variant="full" className="max-w-[min(100%,200px)] sm:max-w-none" />
            </Link>

            <div className="order-3 ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 md:order-4">
              <Link
                href={user ? "/minha-conta" : "/login"}
                className="group flex h-11 min-w-[2.75rem] items-center justify-center gap-2 rounded-full border border-border/60 bg-muted/30 px-2.5 text-foreground transition hover:border-primary/25 hover:bg-muted/60 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:px-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-primary shadow-sm">
                  {user ? <User className="h-[17px] w-[17px]" strokeWidth={2.2} /> : <LogIn className="h-[17px] w-[17px]" strokeWidth={2.2} />}
                </span>
                <span className="hidden lg:flex max-w-[100px] flex-col items-start leading-tight">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {user ? "Conta" : "Entrar"}
                  </span>
                  <span className="truncate text-xs font-semibold">{user ? user.name || "Perfil" : "Acesso"}</span>
                </span>
              </Link>

              <Link
                href="/carrinho"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-muted/30 text-foreground transition hover:border-primary/25 hover:bg-muted/60 hover:scale-[1.03] active:scale-[0.97]"
                aria-label="Carrinho"
              >
                <ShoppingCart className="h-[1.15rem] w-[1.15rem]" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>

            <Suspense
              fallback={
                <div className="order-4 h-11 w-full basis-full min-w-0 animate-pulse rounded-full bg-muted/50 md:order-3 md:flex-1 md:max-w-2xl md:mx-auto md:basis-auto" />
              }
            >
              <div className="order-4 w-full basis-full min-w-0 md:order-3 md:flex-1 md:max-w-2xl md:mx-auto md:basis-auto">
                <StoreSearch />
              </div>
            </Suspense>
          </div>

          <nav className="scrollbar-hide hidden overflow-x-auto border-t border-border/30 lg:block">
            <ul className="flex min-w-0 flex-nowrap items-center justify-start gap-0.5 py-1">
              <li className="shrink-0">
                <Link
                  href="/produtos"
                  className="flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold text-foreground/85 transition hover:bg-muted/80 hover:text-primary"
                >
                  <ChevronDown className="h-3.5 w-3.5 opacity-45" aria-hidden />
                  Catálogo
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id} className="shrink-0">
                  <Link
                    href={`/categoria/${cat.slug}`}
                    className="block whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-muted/80 hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
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
