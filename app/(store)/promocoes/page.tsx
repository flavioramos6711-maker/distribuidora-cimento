"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import ProductCard from "@/components/store/product-card"
import { Tag, ArrowLeft, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"

const supabase = createClient()

async function fetchPromotions() {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .or("is_discount.eq.true,original_price.gt.price")
    .order("created_at", { ascending: false })
  return data || []
}

export default function PromocoesPage() {
  const { data: products, isLoading } = useSWR("store-promocoes", fetchPromotions)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="opacity-50">/</span>
            <span className="text-foreground">Promoções</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F47920]/10 text-[#F47920]">
              <Tag className="h-6 w-6" />
            </div>
            <h1 className="font-heading text-3xl font-black tracking-tight text-[#002D5B] sm:text-4xl">
              Promoções Imperdíveis
            </h1>
          </div>
          <p className="mt-3 text-muted-foreground">
            As melhores ofertas em materiais de construção para sua obra.
          </p>
        </div>
        
        <div className="flex items-center gap-3 rounded-2xl bg-[#002D5B] p-4 text-white shadow-lg sm:p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Ofertas de hoje</p>
            <p className="font-bold">Economia real na entrega</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border-2 border-dashed border-border/40 bg-muted/5 py-20 text-center">
          <Tag className="mx-auto h-12 w-12 text-muted-foreground/20" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Não há promoções ativas no momento.
          </p>
          <Link
            href="/produtos"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-[#002D5B] px-8 text-sm font-bold text-white transition-all hover:scale-105"
          >
            Ver catálogo completo
          </Link>
        </div>
      )}

      {/* Orçamento Relâmpago CTA */}
      <div className="mt-20 overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#002D5B] to-[#003d7a] p-8 text-white shadow-2xl sm:p-12">
        <div className="relative z-10 flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">
              Precisa de um <span className="text-[#F47920]">Orçamento Relâmpago</span>?
            </h2>
            <p className="max-w-xl text-lg font-medium text-white/70">
              Mande sua lista de materiais agora e receba os melhores preços em minutos via WhatsApp.
            </p>
          </div>
          <a
            href="https://wa.me/5516996447972?text=Olá! Preciso de um orçamento relâmpago para minha obra."
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-16 min-w-[280px] items-center justify-center gap-3 rounded-2xl bg-[#F47920] px-8 text-lg font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            SOLICITAR AGORA
            <Sparkles className="h-5 w-5 animate-pulse" />
          </a>
        </div>
      </div>
    </div>
  )
}
