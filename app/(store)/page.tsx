// =============================================================================
// SERVER COMPONENT — app/(store)/page.tsx
// Página home otimizada para SSR/LCP — sem "use client", sem SWR
// =============================================================================

export const revalidate = 60

import { createClient } from "@/lib/supabase/server"
import { HeroBanner } from "@/components/store/hero-banner"
import CategoriesCarousel from "@/components/store/categories-carousel"
import ProductsCarousel from "@/components/store/products-carousel"
import InstitutionalSection from "@/components/store/institutional-section"
import TestimonialsCarousel from "@/components/store/testimonials-carousel"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import {
  ArrowRight, Truck, ShieldCheck, Award, Headphones,
  ChevronRight, Sparkles, Tag, Zap, LayoutGrid,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SITE } from "@/lib/site-config"
import { parseBannerImages } from "@/lib/site-settings"
import HomeWhatsAppCta from "@/components/store/home-whatsapp-cta"

const CAT_CIMENTO = "c0134152-de0a-42f7-bb87-dd9ec8588983"
const CAT_ACO = "914576a6-f187-4f97-83e1-dd7e0c38dd1b"
const CAT_TINTA = "5564e59c-c674-4d39-a93e-ba1e8d940627"
const CAT_ARGAMASSA = "6df9b914-06d0-484a-9b0c-c2d9192fcfa9"

async function fetchHome() {
  const supabase = await createClient()

  const [
    featuredRes,
    categoriesRes,
    newRes,
    discountRes,
    cimentosRes,
    acoRes,
    tintasRes,
    argamassasRes,
    outrosRes,
    siteSettingsRes,
  ] = await Promise.all([
    supabase.from("products").select("id, name, slug, price, original_price, image_url, unit, stock, category_id, is_new, is_discount, featured").eq("active", true).eq("featured", true).not("image_url", "is", null).order("created_at", { ascending: false }).limit(24),
    supabase.from("categories").select("*, products(id)").eq("active", true).order("sort_order"),
    supabase.from("products").select("id, name, slug, price, original_price, image_url, unit, stock, category_id, is_new, is_discount, featured").eq("active", true).eq("is_new", true).not("image_url", "is", null).order("created_at", { ascending: false }).limit(12),
    supabase.from("products").select("id, name, slug, price, original_price, image_url, unit, stock, category_id, is_new, is_discount, featured").eq("active", true).eq("is_discount", true).not("image_url", "is", null).order("created_at", { ascending: false }).limit(12),
    supabase.from("products").select("id, name, slug, price, original_price, image_url, unit, stock, category_id, is_new, is_discount, featured").eq("active", true).eq("category_id", CAT_CIMENTO).not("image_url", "is", null).limit(10),
    supabase.from("products").select("id, name, slug, price, original_price, image_url, unit, stock, category_id, is_new, is_discount, featured").eq("active", true).eq("category_id", CAT_ACO).not("image_url", "is", null).limit(10),
    supabase.from("products").select("id, name, slug, price, original_price, image_url, unit, stock, category_id, is_new, is_discount, featured").eq("active", true).eq("category_id", CAT_TINTA).not("image_url", "is", null).limit(10),
    supabase.from("products").select("id, name, slug, price, original_price, image_url, unit, stock, category_id, is_new, is_discount, featured").eq("active", true).eq("category_id", CAT_ARGAMASSA).not("image_url", "is", null).limit(10),
    supabase.from("products").select("id, name, slug, price, original_price, image_url, unit, stock, category_id, is_new, is_discount, featured").eq("active", true).not("image_url", "is", null).order("created_at", { ascending: false }).limit(20),
    supabase.from("site_settings").select("banner_images").eq("id", "default").maybeSingle(),
  ])

  // Organizar vitrine variada (intercalando cimento, aço, tinta, argamassa e outros)
  const cimentos = cimentosRes.data || []
  const aco = acoRes.data || []
  const tintas = tintasRes.data || []
  const argamassas = argamassasRes.data || []
  const outros = outrosRes.data || []

  const catalog: any[] = []
  const seenIds = new Set<string>()
  const maxGroups = Math.max(cimentos.length, aco.length, tintas.length, argamassas.length)

  for (let i = 0; i < maxGroups; i++) {
    if (cimentos[i] && !seenIds.has(cimentos[i].id)) {
      catalog.push(cimentos[i])
      seenIds.add(cimentos[i].id)
    }
    if (aco[i] && !seenIds.has(aco[i].id)) {
      catalog.push(aco[i])
      seenIds.add(aco[i].id)
    }
    if (tintas[i] && !seenIds.has(tintas[i].id)) {
      catalog.push(tintas[i])
      seenIds.add(tintas[i].id)
    }
    if (argamassas[i] && !seenIds.has(argamassas[i].id)) {
      catalog.push(argamassas[i])
      seenIds.add(argamassas[i].id)
    }
  }

  // Preencher com outros se houver espaço até 40 produtos
  for (const p of outros) {
    if (!seenIds.has(p.id) && catalog.length < 40) {
      catalog.push(p)
      seenIds.add(p.id)
    }
  }

  // Organizar carrossel de destaques com cimento, aço e tinta no topo
  const allFeatured = featuredRes.data || []
  const featCimento = allFeatured.filter((p: any) => p.category_id === CAT_CIMENTO)
  const featAco = allFeatured.filter((p: any) => p.category_id === CAT_ACO)
  const featTinta = allFeatured.filter((p: any) => p.category_id === CAT_TINTA)
  const featOutros = allFeatured.filter(
    (p: any) => ![CAT_CIMENTO, CAT_ACO, CAT_TINTA].includes(p.category_id)
  )

  const balancedFeatured: any[] = []
  const maxFeat = Math.max(featCimento.length, featAco.length, featTinta.length, featOutros.length)
  for (let i = 0; i < maxFeat; i++) {
    if (featCimento[i]) balancedFeatured.push(featCimento[i])
    if (featAco[i]) balancedFeatured.push(featAco[i])
    if (featTinta[i]) balancedFeatured.push(featTinta[i])
    if (featOutros[i]) balancedFeatured.push(featOutros[i])
  }

  // Buscar banners para o HeroBanner
  const { data: settingsData } = await supabase
    .from("site_settings")
    .select("banner_images")
    .eq("id", "default")
    .maybeSingle()

  let slides: any[] = []
  if (settingsData?.banner_images) {
    try {
      const parsed = Array.isArray(settingsData.banner_images)
        ? settingsData.banner_images
        : JSON.parse(settingsData.banner_images)
      slides = parsed
        .filter((s: any) => s.image_url?.trim())
        .map((s: any, i: number) => ({
          key: `cms-${i}`,
          image_url: s.image_url,
          link: s.link ?? null,
          title: s.title ?? null,
          subtitle: s.subtitle ?? null,
        }))
    } catch (_) {}
  }
  if (slides.length === 0) {
    const { data: banners } = await supabase
      .from("banners")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
    slides = (banners || []).map((b: any) => ({
      key: `db-${b.id}`,
      image_url: b.image_url,
      link: b.link ?? null,
      title: b.title ?? null,
      subtitle: b.subtitle ?? null,
    }))
  }

  return {
    featured: balancedFeatured.length > 0 ? balancedFeatured : allFeatured,
    categories: categoriesRes.data || [],
    newProducts: newRes.data || [],
    discounts: discountRes.data || [],
    catalog: catalog.length > 0 ? catalog : (outrosRes.data || []),
    slides: [],
    siteSettingsRes,
  }
}

function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel,
  className,
}: {
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
  className?: string
}) {
  return (
    <div className={cn("mb-10 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-[2px] w-10 bg-gradient-to-r from-primary to-[#F47920] rounded-full" />
          {subtitle && (
           <span className="text-[11px] font-black uppercase tracking-[0.35em] text-primary">
               {subtitle}
             </span>
          )}
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-[3.25rem] leading-[1.05]">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-slate-50 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 transition-all hover:bg-secondary hover:text-white active:scale-95 sm:self-auto"
        >
          {linkLabel || "Ver catálogo"}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}

export default async function HomePage() {
  const data = await fetchHome()
  const siteSettingsData = (data as any).siteSettingsRes || null
  
  const cmsSlides = siteSettingsData?.banner_images ? parseBannerImages(siteSettingsData.banner_images) : []
  const initialSlides = cmsSlides.filter(s => s.image_url?.trim()).map((s: any, i: number) => ({
    key: `cms-${i}`,
    image_url: s.image_url,
    link: s.link ?? null,
    title: s.title ?? null,
    subtitle: s.subtitle ?? null,
  }))

  const trustItems = [
    { icon: Truck, title: "Entrega Ágil", desc: "Logística especializada própria" },
    { icon: ShieldCheck, title: "Compra Segura", desc: "Transações 100% protegidas" },
    { icon: Headphones, title: "Suporte Direto", desc: "Especialistas via WhatsApp" },
    { icon: Award, title: "Qualidade", desc: "Produtos certificados ABNT" },
  ]

  return (
    <div className="relative pb-20 sm:pb-32 bg-mesh">
      {/* Hero Section - Edge to Edge */}
      <div className="w-full">
        <HeroBanner initialSlides={initialSlides} />
      </div>

      {/* Categories - Grid Style */}
      {data?.categories && data.categories.length > 0 && (
        <section className="py-12 sm:py-20 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader
              title="Categorias"
              subtitle="Departamentos"
              href="/produtos"
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
        <section className="py-16 sm:py-24 bg-secondary/5 relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <SectionHeader
              title="O que você precisa?"
              subtitle="Departamentos"
              href="/produtos"
            />
            <ProductsCarousel products={data.featured} autoplayDelay={5000} />
          </div>
        </section>
      )}

      {/* New Products */}
      {data?.newProducts && data.newProducts.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader
              title="Lançamentos"
              subtitle="Tecnologia"
              href="/produtos"
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
      <section className="relative overflow-hidden bg-secondary py-16 sm:py-24 my-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <TestimonialsCarousel />
        </div>
      </section>

      {/* Modern CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
        <div className="group relative overflow-hidden rounded-[2.5rem] sm:rounded-[3.5rem] bg-gradient-to-br from-slate-900 via-[#0C1222] to-slate-950 border border-slate-800/90 p-8 sm:p-12 lg:p-20 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-600 opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] sm:blur-[100px] transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-blue-400 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px] sm:blur-[80px]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 text-center lg:text-left">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Orçamento Imediato</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.0] tracking-tight">
                Preço de atacado<br/>
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">direto da fonte.</span>
              </h2>
              <p className="text-xl text-white/70 max-w-xl font-medium leading-relaxed">
                Logística inteligente e condições exclusivas para construtoras e grandes obras. Fale agora com nossa equipe.
              </p>
            </div>

            <HomeWhatsAppCta />
          </div>
        </div>
      </section>

      {/* Weekly Offers - Dark Premium */}
      {data?.discounts && data.discounts.length > 0 && (
        <section id="promocoes" className="py-16 sm:py-24 bg-[#020617] text-white rounded-[2rem] sm:rounded-[3rem] mx-4 my-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-10" />
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-12 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Oportunidades Únicas</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl leading-[1.0]">Ofertas da Semana</h2>
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

      {/* Vitrine de Produtos (Grid) */}
      {data?.catalog && data.catalog.length > 0 && (
        <section id="vitrine" className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader
              title="Vitrine de Produtos"
              subtitle="Catálogo"
              href="/produtos"
              linkLabel="Ver todos os produtos"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {data.catalog.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

{/* Benefits Bar - Clean & Breathable Light Architecture */}
<section className="bg-slate-50/80 border-y border-slate-200/70 py-12 sm:py-16 mt-16">
  <div className="mx-auto max-w-7xl px-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-slate-200">
      {trustItems.map((item) => (
        <div key={item.title} className="flex items-center gap-4 group px-4 sm:px-8 py-2 rounded-2xl transition-colors">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-slate-200/80 text-slate-800 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:shadow-md">
            <item.icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 tracking-tight leading-snug">{item.title}</h4>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
    </div>
  )
}
