"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import HeroBanner from "@/components/store/hero-banner"
import HeroSearchBar from "@/components/store/hero-search-bar"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Truck, ShieldCheck, Award, Headphones } from "lucide-react"
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
      <Skeleton className="w-full min-h-[220px] max-h-[50vh] h-[40vh] rounded-none bg-muted" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-12 max-w-2xl mx-auto rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data, isLoading } = useSWR("store-home", fetchHome)

  if (isLoading) {
    return <HomeSkeleton />
  }

  return (
    <div>
      <HeroBanner />
      <HeroSearchBar />

      <section className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Truck, title: "Entrega ágil", desc: "Logística para obra e revenda" },
              { icon: ShieldCheck, title: "Compra segura", desc: "Atendimento consultivo" },
              { icon: Award, title: "Marcas confiáveis", desc: "Materiais de qualidade" },
              { icon: Headphones, title: "Suporte direto", desc: "WhatsApp comercial" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 transition hover:border-primary/25 hover:bg-muted/40"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {data?.categories && data.categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Categorias</h2>
            <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-xl mx-auto">
              Linhas de produto para obra, indústria e revenda
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {data.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition hover:border-primary/35 hover:shadow-md"
              >
                <div className="relative h-[88px] sm:h-[96px] w-full bg-muted/50 flex items-center justify-center p-2 sm:p-3">
                  {cat.image_url ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={cat.image_url}
                        alt=""
                        fill
                        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 16vw"
                        className="object-contain object-center transition duration-300 group-hover:opacity-95"
                      />
                    </div>
                  ) : (
                    <span className="text-2xl font-heading font-bold text-primary/35">{cat.name.charAt(0)}</span>
                  )}
                </div>
                <div className="p-3 text-center border-t border-border/60">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
                    {cat.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">{cat.products?.length || 0} produtos</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data?.featured && data.featured.length > 0 && (
        <section className="bg-muted/25 border-y border-border/80">
          <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Produtos em destaque</h2>
                <p className="text-muted-foreground mt-2 text-sm">Seleção comercial — pronta para orçamento</p>
              </div>
              <Link
                href="/produtos"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline shrink-0"
              >
                Ver catálogo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {data.featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {data?.newProducts && data.newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Novidades</h2>
              <p className="text-muted-foreground mt-2 text-sm">Últimos lançamentos no portfólio</p>
            </div>
            <Link href="/produtos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {data.newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-secondary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left max-w-xl">
            <h2 className="font-heading text-2xl md:text-4xl font-bold text-secondary-foreground text-balance">
              Orçamento corporativo e prazos de obra
            </h2>
            <p className="text-secondary-foreground/70 mt-4 text-sm md:text-base">
              Fale com a equipe {SITE.shortName} no WhatsApp. Atendimento para construtoras, lojistas e consumidor final.
            </p>
          </div>
          <a
            href={waLink("Olá! Gostaria de fazer um orçamento.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("hero_banner", "/")}
            className="inline-flex items-center justify-center px-8 py-4 min-h-[52px] rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-lg shadow-primary/30 hover:bg-primary/90 transition w-full sm:w-auto min-w-[220px]"
          >
            Falar no WhatsApp
          </a>
        </div>
      </section>

      {data?.discounts && data.discounts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Ofertas</h2>
              <p className="text-muted-foreground mt-2 text-sm">Condições especiais por tempo limitado</p>
            </div>
            <Link href="/produtos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {data.discounts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
