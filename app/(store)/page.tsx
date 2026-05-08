"use client"

import type { ComponentType } from "react"
import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import HeroBanner from "@/components/store/hero-banner"
import CategoriesCarousel from "@/components/store/categories-carousel"
import ProductsCarousel from "@/components/store/products-carousel"
import InstitutionalSection from "@/components/store/institutional-section"
import TestimonialsCarousel from "@/components/store/testimonials-carousel"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Truck, ShieldCheck, Award, Headphones, LayoutGrid, Sparkles, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
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
  className,
}: {
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
  icon?: ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <div className={cn("mb-12 flex flex-col gap-8 sm:mb-16 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-4">
        <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
                <div className="w-8 h-1.5 bg-[#F47920] rounded-full" />
                <div className="w-12 h-1.5 bg-[#002D5B] rounded-full" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-[#002D5B] sm:text-4xl md:text-5xl uppercase">
                {title}
            </h2>
        </div>
        {subtitle && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F47920]" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    {subtitle}
                </p>
            </div>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex h-14 shrink-0 items-center justify-center gap-3 rounded-xl bg-white border border-slate-200 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#002D5B] transition-all hover:border-[#002D5B] hover:shadow-xl active:scale-95 sm:self-auto"
        >
          {linkLabel || "Explorar Tudo"} 
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  )
}

export default function HomePage() {
  const { data, isLoading } = useSWR("store-home", fetchHome)

  const trustItems = [
    { icon: Truck, title: "Entrega Ágil", desc: "Logística especializada" },
    { icon: ShieldCheck, title: "Compra Segura", desc: "Ambiente protegido" },
    { icon: Headphones, title: "Suporte Direto", desc: "Vendedores online" },
    { icon: Award, title: "Qualidade Premium", desc: "Produtos certificados" },
  ]

  if (isLoading) {
    return <HomeSkeleton />
  }

  return (
    <div className="pb-12 sm:pb-20">
      <div className="px-0">
        <HeroBanner />
      </div>



      {/* Benefits Bar - Premium Glassmorphism */}
      <section className="relative z-20 mt-4 sm:-mt-12 mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-2 rounded-3xl bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50">
          {trustItems.map((item) => (
            <div key={item.title} className="flex items-center gap-4 p-5 rounded-2xl hover:bg-white/50 transition-all group">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-900 text-[#F47920] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight truncate">{item.title}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {data?.categories && data.categories.length > 0 && (
        <section className="py-12 sm:py-24 bg-white">
          <SectionHeader
            title="Departamentos"
            subtitle="Explore nossa linha completa por categoria"
            href="/produtos"
            icon={LayoutGrid}
            className="mx-auto max-w-7xl px-4"
          />
          <CategoriesCarousel categories={data.categories} />
        </section>
      )}

      {/* Featured Products - Infinite Loop */}
      {data?.featured && data.featured.length > 0 && (
        <section className="py-16 sm:py-24 bg-slate-50/50">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeader
              title="Em Destaque"
              subtitle="Os produtos mais procurados para sua obra"
              href="/produtos"
              icon={Sparkles}
            />
            <ProductsCarousel products={data.featured} autoplayDelay={4500} />
          </div>
        </section>
      )}

      {/* New Products - Infinite Loop */}
      {data?.newProducts && data.newProducts.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeader 
              title="Novidades" 
              subtitle="As últimas soluções e lançamentos do setor" 
              href="/produtos" 
              icon={Sparkles} 
            />
            <ProductsCarousel products={data.newProducts} autoplayDelay={6000} />
          </div>
        </section>
      )}

      {/* Institutional Brief - Moved Further Down for Credibility after Products */}
      <InstitutionalSection />

      {/* Testimonials */}
      <div className="bg-[#002D5B] py-20 my-10">
         <TestimonialsCarousel />
      </div>

      {/* Offer Banner / CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#002D5B] to-[#003d7a] p-10 lg:p-16 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F47920] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
            <div className="flex-1 space-y-6">
               <h2 className="text-4xl lg:text-6xl font-black leading-tight">
                 Preço de atacado<br/>
                 <span className="text-[#F47920]">para sua obra</span>
               </h2>
               <p className="text-lg text-white/70 max-w-xl font-medium">
                 Seja para reforma residencial ou grandes empreendimentos, temos a logística e o preço que você precisa.
               </p>
            </div>
            <a
              href={waLink("Olá! Gostaria de fazer um orçamento.")}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-20 min-w-[300px] items-center justify-center gap-4 rounded-3xl bg-[#F47920] text-xl font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              FALAR COM VENDEDOR
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Discounts / Monthly Offers - Infinite Loop */}
      {data?.discounts && data.discounts.length > 0 && (
        <section id="promocoes" className="py-16 sm:py-24 bg-slate-900 text-white">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeader
              title="Ofertas do Mês"
              subtitle="Condições exclusivas para compras imediatas"
              href="/produtos"
              icon={Tag}
              className="text-white"
            />
            <div className="bg-white/5 p-8 rounded-[3rem] backdrop-blur-sm border border-white/5">
                <ProductsCarousel products={data.discounts} autoplayDelay={5000} />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
