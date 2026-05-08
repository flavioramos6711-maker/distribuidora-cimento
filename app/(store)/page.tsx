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
import { ArrowRight, Truck, ShieldCheck, Award, Headphones, LayoutGrid, Sparkles, Tag, Zap, ChevronRight } from "lucide-react"
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
    <div className="animate-in fade-in duration-300 bg-mesh min-h-screen">
      <div className="px-3 pt-3 sm:px-6">
        <Skeleton className="mx-auto h-[min(42vw,400px)] max-w-7xl rounded-3xl bg-muted/50 shadow-app-lg" />
      </div>
      <div className="mx-auto max-w-7xl space-y-12 px-6 py-16">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 min-w-[280px] shrink-0 rounded-2xl bg-muted/50" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 bg-muted/50" />
          <Skeleton className="h-4 w-96 bg-muted/50" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl bg-muted/50" />
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
    <div className={cn("mb-12 flex flex-col gap-6 sm:mb-20 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="relative space-y-4">
        {Icon && (
          <div className="absolute -left-12 top-0 hidden xl:block">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-12 rounded-full bg-primary" />
            {subtitle && (
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {subtitle}
              </span>
            )}
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-secondary sm:text-5xl md:text-6xl">
            {title}
          </h2>
        </div>
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex h-14 shrink-0 items-center justify-center gap-3 rounded-2xl bg-white border border-slate-200 px-8 text-xs font-bold uppercase tracking-widest text-secondary shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow-xl active:scale-95 sm:self-auto"
        >
          {linkLabel || "Ver catálogo completo"} 
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}

export default function HomePage() {
  const { data, isLoading } = useSWR("store-home", fetchHome)

  const trustItems = [
    { icon: Truck, title: "Entrega Ágil", desc: "Logística especializada própria" },
    { icon: ShieldCheck, title: "Compra Segura", desc: "Transações 100% protegidas" },
    { icon: Headphones, title: "Suporte Direto", desc: "Especialistas via WhatsApp" },
    { icon: Award, title: "Qualidade", desc: "Produtos certificados ABNT" },
  ]

  if (isLoading) {
    return <HomeSkeleton />
  }

  return (
    <div className="relative pb-20 sm:pb-32 bg-mesh">
      {/* Hero Section - Back to Top */}
      <div className="px-0 sm:px-6 pt-0 sm:pt-6">
        <div className="mx-auto max-w-[1600px] overflow-hidden sm:rounded-3xl shadow-app-lg bg-white">
          <HeroBanner />
        </div>
      </div>

      {/* Categories - Grid Style */}
      {data?.categories && data.categories.length > 0 && (
        <section className="py-20 sm:py-32 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader
              title="O que você precisa?"
              subtitle="Departamentos Especializados"
              href="/produtos"
              icon={LayoutGrid}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 hidden xl:block" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 hidden xl:block" />
            <CategoriesCarousel categories={data.categories} />
          </div>
        </section>
      )}

      {/* Featured Products - High End Carousel */}
      {data?.featured && data.featured.length > 0 && (
        <section className="py-24 sm:py-32 bg-secondary/5 relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <SectionHeader
              title="Destaques"
              subtitle="Melhores escolhas para sua obra"
              href="/produtos"
              icon={Sparkles}
            />
            <ProductsCarousel products={data.featured} autoplayDelay={5000} />
          </div>
        </section>
      )}

      {/* New Products */}
      {data?.newProducts && data.newProducts.length > 0 && (
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader 
              title="Lançamentos" 
              subtitle="Tecnologia e Inovação" 
              href="/produtos" 
              icon={Zap} 
            />
            <ProductsCarousel products={data.newProducts} autoplayDelay={7000} />
          </div>
        </section>
      )}


      {/* Institutional Brief */}
      <div className="py-10">
        <InstitutionalSection />
      </div>

      {/* Testimonials - Dark Professional */}
      <section className="relative overflow-hidden bg-secondary py-24 sm:py-32 my-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <TestimonialsCarousel />
        </div>
      </section>

      {/* Modern CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
        <div className="group relative overflow-hidden rounded-[2.5rem] sm:rounded-[3.5rem] bg-gradient-to-br from-secondary via-secondary to-blue-900 p-8 sm:p-12 lg:p-20 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] sm:blur-[100px] transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-blue-400 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px] sm:blur-[80px]" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 text-center lg:text-left">
            <div className="flex-1 space-y-8">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                 <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Orçamento Imediato</span>
               </div>
               <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                 Preço de atacado<br/>
                 <span className="text-primary">direto da fonte.</span>
               </h2>
               <p className="text-xl text-white/70 max-w-xl font-medium leading-relaxed">
                 Logística inteligente e condições exclusivas para construtoras e grandes obras. Fale agora com nossa equipe.
               </p>
            </div>
            
            <a
              href={waLink("Olá! Gostaria de fazer um orçamento.")}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative flex h-20 sm:h-24 w-full sm:w-auto sm:min-w-[320px] items-center justify-center gap-4 rounded-2xl sm:rounded-3xl bg-primary text-lg sm:text-xl font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
              onClick={() => trackWhatsAppClick("home_cta")}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover/btn:translate-y-0" />
              <span className="relative z-10">FALAR COM VENDEDOR</span>
              <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 relative z-10 group-hover/btn:translate-x-2 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Weekly Offers - Dark Premium */}
      {data?.discounts && data.discounts.length > 0 && (
        <section id="promocoes" className="py-24 sm:py-32 bg-[#020617] text-white rounded-[3rem] sm:rounded-[4rem] mx-4 my-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-10" />
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-12 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Oportunidades Únicas</span>
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Ofertas da Semana</h2>
              </div>
              <Link href="/produtos" className="text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-2 group">
                Ver todas as ofertas
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            <div className="rounded-[2.5rem] bg-white/5 p-4 sm:p-8 backdrop-blur-sm border border-white/10">
                <ProductsCarousel products={data.discounts} autoplayDelay={6000} />
            </div>
          </div>
        </section>
      )}

      {/* Benefits Bar - Professional Industrial Footer Top */}
      <section className="border-t border-slate-100 bg-white py-16 sm:py-24 mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
            {trustItems.map((item, idx) => (
              <div key={item.title} className={cn(
                "flex flex-col items-center sm:items-start gap-4 group text-center sm:text-left",
                idx % 2 === 0 && "max-sm:border-r max-sm:border-slate-100 max-sm:pr-4"
              )}>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-secondary uppercase tracking-wider leading-none">{item.title}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

