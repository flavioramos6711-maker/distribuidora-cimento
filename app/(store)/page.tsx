"use client"

import type { ComponentType } from "react"
import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import HeroBanner from "@/components/store/hero-banner"
import InstitutionalSection from "@/components/store/institutional-section"
import TestimonialsCarousel from "@/components/store/testimonials-carousel"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Truck, ShieldCheck, Award, Headphones, LayoutGrid, Sparkles, Tag } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { SITE, waLink } from "@/lib/site-config"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"

const supabase = createClient()

async function fetchHome() {
  const [featuredRes, categoriesRes, newRes, discountRes] = await Promise.all([
    supabase.from("products").select("*").eq("active", true).eq("featured", true).order("created_at", { ascending: false }).limit(8),
    supabase.from("categories").select("*, products(id)").eq("active", true).order("sort_order"),
    supabase.from("products").select("*").eq("active", true).eq("is_new", true).order("created_at", { ascending: false }).limit(8),
    supabase.from("products").select("*").eq("active", true).eq("is_discount", true).order("created_at", { ascending: false }).limit(8),
  ])
  return {
    featured: featuredRes.data || [],
    categories: categoriesRes.data || [],
    newProducts: newRes.data || [],
    discounts: discountRes.data || [],
  }
}

function HomeSkeleton() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="px-3 pt-3 sm:px-4">
        <Skeleton className="mx-auto h-[min(42vw,320px)] max-w-7xl rounded-2xl bg-muted shadow-app sm:rounded-3xl" />
      </div>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <div className="flex gap-3 overflow-hidden pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 min-w-[220px] shrink-0 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-[42vw] max-w-[200px] shrink-0 rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel,
  icon: Icon,
}: {
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
  icon?: ComponentType<{ className?: string }>
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />}
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">{title}</h2>
        </div>
        {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 self-start rounded-full border border-border/80 bg-background px-4 text-sm font-semibold text-primary shadow-sm transition duration-200 hover:scale-[1.03] hover:border-primary/25 hover:bg-muted/30 active:scale-[0.98] sm:self-auto"
        >
          {linkLabel || "Ver mais"} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

export default function HomePage() {
  const { data, isLoading } = useSWR("store-home", fetchHome)

  const trustItems = [
    { icon: Truck, title: "Entrega Ágil", desc: "Logística para obra e revenda" },
    { icon: ShieldCheck, title: "Compra Segura", desc: "Atendimento consultivo e transparência" },
    { icon: Headphones, title: "Suporte Direto", desc: "Canal comercial para resolver rápido" },
    { icon: Award, title: "Atendimento Profissional", desc: "Experiência no setor e qualidade" },
  ]

  const trustScrollerRef = useRef<HTMLDivElement | null>(null)
  const [trustAutoPaused, setTrustAutoPaused] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const el = trustScrollerRef.current
    if (!el) return

    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return

    // No desktop (>=640px) a seção vira grid; não precisamos de autoplay.
    const desktop = window.matchMedia && window.matchMedia("(min-width: 640px)").matches
    if (desktop) return

    const id = window.setInterval(() => {
      if (trustAutoPaused) return

      const maxLeft = el.scrollWidth - el.clientWidth
      if (maxLeft <= 0) return

      const next = el.scrollLeft + el.clientWidth * 0.85
      el.scrollTo({ left: next >= maxLeft - 2 ? 0 : next, behavior: "smooth" })
    }, 5200)

    return () => window.clearInterval(id)
  }, [trustAutoPaused])

  if (isLoading) {
    return <HomeSkeleton />
  }

  return (
    <div className="pb-6 sm:pb-10">
      <HeroBanner />

      <section className="border-b border-border/40 bg-card/80">
        <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-7">
          <div
            ref={trustScrollerRef}
            className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 sm:gap-4"
            onPointerEnter={() => setTrustAutoPaused(true)}
            onPointerDown={() => setTrustAutoPaused(true)}
            onPointerLeave={() => setTrustAutoPaused(false)}
            onPointerUp={() => setTrustAutoPaused(false)}
          >
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="flex min-w-[min(78vw,280px)] shrink-0 snap-center items-start gap-3 rounded-2xl border border-border/50 bg-muted/20 p-4 shadow-sm transition duration-200 hover:border-emerald-500/20 hover:shadow-app sm:min-w-0"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                  <item.icon className="h-5 w-5 text-emerald-600" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InstitutionalSection />

      {data?.categories && data.categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-12">
          <SectionHeader
            title="Categorias"
            subtitle="Toque para explorar — deslize no celular"
            href="/produtos"
            linkLabel="Ver tudo"
            icon={LayoutGrid}
          />
          <div className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible md:grid-cols-4 lg:grid-cols-6 sm:gap-4">
            {data.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="group flex w-[min(42vw,200px)] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-app transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-app-lg active:scale-[0.98] sm:w-auto"
              >
                <div className="relative flex aspect-square w-full items-center justify-center bg-gradient-to-b from-muted/40 to-muted/10 p-3">
                  {cat.image_url ? (
                    <div className="relative h-full w-full overflow-hidden rounded-full">
                      <Image
                        src={cat.image_url}
                        alt=""
                        fill
                        sizes="(max-width:640px) 42vw, (max-width:1024px) 25vw, 16vw"
                        className="object-contain object-center transition duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-heading text-2xl font-bold text-primary/50">
                      {cat.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="border-t border-border/40 p-3 text-center">
                  <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground transition group-hover:text-primary">
                    {cat.name}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-muted-foreground">{cat.products?.length || 0} produtos</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data?.featured && data.featured.length > 0 && (
        <section className="border-y border-border/40 bg-gradient-to-b from-muted/30 to-background">
          <div className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-12">
            <SectionHeader
              title="Em destaque"
              subtitle="Seleção comercial — pronta para orçamento"
              href="/produtos"
              icon={Sparkles}
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
              {data.featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <TestimonialsCarousel />

      {data?.newProducts && data.newProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-12">
          <SectionHeader title="Novidades" subtitle="Últimos lançamentos" href="/produtos" linkLabel="Catálogo" icon={Sparkles} />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
            {data.newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-3 overflow-hidden rounded-2xl bg-secondary shadow-app sm:mx-4 sm:rounded-3xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-10 text-center sm:flex-row sm:justify-between sm:gap-8 sm:px-8 sm:py-12 sm:text-left">
          <div className="max-w-lg">
            <h2 className="text-balance font-heading text-2xl font-bold text-secondary-foreground sm:text-3xl md:text-4xl">
              Orçamento para obra e revenda
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary-foreground/75 sm:text-base">
              Fale com a equipe {SITE.shortName} no WhatsApp. Resposta ágil para construtoras, lojistas e consumidor.
            </p>
          </div>
          <a
            href={waLink("Olá! Gostaria de fazer um orçamento.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("hero_banner", "/")}
            className="inline-flex min-h-12 w-full min-w-[200px] max-w-xs items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-app transition duration-200 hover:scale-[1.03] hover:bg-primary/92 active:scale-[0.98] sm:w-auto"
          >
            WhatsApp comercial
          </a>
        </div>
      </section>

      {data?.discounts && data.discounts.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-12">
          <div className="mb-5 flex flex-wrap items-center gap-2 sm:mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              <Tag className="h-3.5 w-3.5" />
              Promoções
            </span>
          </div>
          <SectionHeader
            title="Ofertas"
            subtitle="Condições especiais — aproveite no orçamento"
            href="/produtos"
            linkLabel="Ver ofertas"
            icon={Tag}
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
            {data.discounts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
