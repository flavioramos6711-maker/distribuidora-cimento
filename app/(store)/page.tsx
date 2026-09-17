// =============================================================================
// SERVER COMPONENT — app/(store)/page.tsx
// Home B2B corporativa — seções por departamento
// =============================================================================

export const revalidate = 60

import { createClient } from "@/lib/supabase/server"
import { HeroBanner } from "@/components/store/hero-banner"
import CategoriesCarousel from "@/components/store/categories-carousel"
import ProductsCarousel from "@/components/store/products-carousel"
import InstitutionalSection from "@/components/store/institutional-section"
import TestimonialsCarousel from "@/components/store/testimonials-carousel"
import Link from "next/link"
import Image from "next/image"
import {
  Truck, ShieldCheck, ReceiptText, CreditCard,
  ChevronRight, BadgeCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SITE, waLink } from "@/lib/site-config"
import { parseBannerImages } from "@/lib/site-settings"
import HomeWhatsAppCta from "@/components/store/home-whatsapp-cta"

const CAT_CIMENTO = "c0134152-de0a-42f7-bb87-dd9ec8588983"
const CAT_ACO = "914576a6-f187-4f97-83e1-dd7e0c38dd1b"
const CAT_HIDRA = "aec3d582-a015-4968-a883-d0913379bf10"
const CAT_ARGAMASSA = "6df9b914-06d0-484a-9b0c-c2d9192fcfa9"
const CAT_REJUNTE = "8463a6e3-5c46-4f1f-b022-45754287d12a"
const CAT_IMPERM = "2ec0f24f-65d1-4282-a428-16667259409c"

const PROD_FIELDS =
  "id, name, slug, price, original_price, image_url, unit, stock, category_id, is_new, is_discount, featured"

async function fetchHome() {
  const supabase = await createClient()

  const [
    featuredRes,
    categoriesRes,
    newRes,
    discountRes,
    cimentosRes,
    acoRes,
    hidraRes,
    argRes,
    rejRes,
    impermRes,
    siteSettingsRes,
  ] = await Promise.all([
    supabase.from("products").select(PROD_FIELDS).eq("active", true).eq("featured", true).not("image_url", "is", null).order("created_at", { ascending: false }).limit(24),
    supabase.from("categories").select("*, products(id)").eq("active", true).order("sort_order"),
    supabase.from("products").select(PROD_FIELDS).eq("active", true).eq("is_new", true).not("image_url", "is", null).order("created_at", { ascending: false }).limit(12),
    supabase.from("products").select(PROD_FIELDS).eq("active", true).eq("is_discount", true).not("image_url", "is", null).order("created_at", { ascending: false }).limit(12),
    supabase.from("products").select(PROD_FIELDS).eq("active", true).eq("category_id", CAT_CIMENTO).not("image_url", "is", null).order("featured", { ascending: false }).order("price", { ascending: true }).limit(30),
    supabase.from("products").select(PROD_FIELDS).eq("active", true).eq("category_id", CAT_ACO).not("image_url", "is", null).order("created_at", { ascending: false }).limit(10),
    supabase.from("products").select(PROD_FIELDS).eq("active", true).eq("category_id", CAT_HIDRA).not("image_url", "is", null).order("created_at", { ascending: false }).limit(10),
    supabase.from("products").select(PROD_FIELDS).eq("active", true).eq("category_id", CAT_ARGAMASSA).not("image_url", "is", null).order("created_at", { ascending: false }).limit(6),
    supabase.from("products").select(PROD_FIELDS).eq("active", true).eq("category_id", CAT_REJUNTE).not("image_url", "is", null).order("created_at", { ascending: false }).limit(6),
    supabase.from("products").select(PROD_FIELDS).eq("active", true).eq("category_id", CAT_IMPERM).not("image_url", "is", null).order("created_at", { ascending: false }).limit(6),
    supabase.from("site_settings").select("banner_images").eq("id", "default").maybeSingle(),
  ])

  const acabamento: any[] = []
  const seen = new Set<string>()
  const groups = [argRes.data || [], rejRes.data || [], impermRes.data || []]
  const max = Math.max(...groups.map((g) => g.length))
  for (let i = 0; i < max; i++) {
    for (const g of groups) {
      const p: any = g[i]
      if (p && !seen.has(p.id)) {
        acabamento.push(p)
        seen.add(p.id)
      }
    }
  }

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
    featured: featuredRes.data || [],
    categories: categoriesRes.data || [],
    newProducts: newRes.data || [],
    discounts: discountRes.data || [],
    cimentos: cimentosRes.data || [],
    aco: acoRes.data || [],
    hidraulica: hidraRes.data || [],
    acabamento,
    slides: [],
    siteSettingsRes,
  }
}

function norm(s: string) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function pickLeaders(cimentos: any[]) {
  const brands = ["votoran", "caue", "montes claros", "csn", "maua", "tupi", "ciplan", "liz", "apodi", "campeao", "mizu", "nassau"]
  const out: any[] = []
  for (const b of brands) {
    const found = cimentos.find((p) => norm(p.name).includes(b))
    if (found && !out.some((o) => o.id === found.id)) out.push(found)
  }
  for (const p of cimentos) {
    if (out.length >= 12) break
    if (!out.some((o) => o.id === p.id)) out.push(p)
  }
  return out.slice(0, 12)
}

function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel,
  className,
  dark,
}: {
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
  className?: string
  dark?: boolean
}) {
  return (
    <div className={cn("mb-8 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-[2px] w-10 bg-gradient-to-r from-primary to-[#F47920] rounded-full" />
          {subtitle && (
            <span className="text-[11px] font-black uppercase tracking-[0.35em] text-primary">
              {subtitle}
            </span>
          )}
        </div>
        <h2 className={cn("text-3xl font-black tracking-tight sm:text-4xl leading-[1.05]", dark ? "text-white" : "text-slate-900")}>
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
  const initialSlides = cmsSlides.filter((s) => s.image_url?.trim()).map((s: any, i: number) => ({
    key: `cms-${i}`,
    image_url: s.image_url,
    link: s.link ?? null,
    title: s.title ?? null,
    subtitle: s.subtitle ?? null,
  }))

  const leaders = pickLeaders(data.cimentos || [])

  const trustPillars = [
    { icon: CreditCard, title: "Parcele em até 12x", desc: "No cartão de crédito sem acréscimos" },
    { icon: Truck, title: "Entrega com Descarga Inclusa", desc: "Munck e paletizado na sua obra" },
    { icon: ShieldCheck, title: "Produtos com Garantia ABNT", desc: "Laudos técnicos em todas as entregas" },
    { icon: ReceiptText, title: "PIX com Desconto", desc: "Melhor preço pagando à vista no PIX" },
  ]

  return (
    <div className="relative pb-20 sm:pb-32 bg-mesh">
      {/* ── HERO B2B ── */}
      <div className="w-full">
        <HeroBanner initialSlides={initialSlides} />
      </div>

      {/* Faixa corporativa B2B sob o hero */}
      <section className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-widest">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-emerald-300">
              <BadgeCheck className="h-4 w-4" /> Parcele em até 12x no cartão
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white/80">
              <Truck className="h-4 w-4" /> PIX com desconto especial
            </span>
            <span className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white/80 md:inline-flex">
              Entrega programada para SP e região
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={waLink("Olá! Gostaria de comprar materiais de construção. Podem me enviar os preços?")}
              target="_blank"
              rel="noopener noreferrer"
              data-track="btn_whatsapp"
              data-button-name="btn_whatsapp"
              data-source="hero_banner"
              className="btn-whatsapp-track inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#1EBE5B] px-7 text-sm font-black text-white shadow-lg transition-all hover:bg-[#189e4c] active:scale-95"
            >
              Pedir Orçamento no WhatsApp
            </a>
            <Link
              href="/produtos"
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-white/20 px-7 text-sm font-black text-white transition-all hover:bg-white/10"
            >
              Ver todos os produtos
            </Link>
          </div>
        </div>
      </section>

      {/* ── BARRA DE CONFIANÇA CORPORATIVA ── */}
      <section className="border-b border-slate-200/70 bg-slate-50/80">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 sm:py-12 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-slate-200">
          {trustPillars.map((item) => (
            <div key={item.title} className="flex items-center gap-4 px-2 sm:px-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-800 shadow-xs">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black leading-snug tracking-tight text-slate-900">{item.title}</h4>
                <p className="text-xs font-medium leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIAS (contadores reais) ── */}
      {data?.categories && data.categories.length > 0 && (
        <section className="overflow-hidden py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader title="Departamentos da obra" subtitle="Categorias" href="/produtos" linkLabel="Ver tudo" />
          </div>
          <div className="mx-auto max-w-7xl px-6">
            <CategoriesCarousel categories={data.categories} />
          </div>
        </section>
      )}

      {/* ── SEÇÃO 1: CIMENTOS ── */}
      {leaders.length > 0 && (
        <section className="relative overflow-hidden bg-slate-950 py-14 text-white sm:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,211,102,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(244,121,32,0.12),transparent_55%)]" />
          <div className="relative mx-auto max-w-7xl px-6">
            <SectionHeader
              dark
              title="Cimentos para sua Obra"
              subtitle="Preço direto da fábrica"
              href="/cimento"
              linkLabel="Tabela completa"
            />
            <style>{`@keyframes cimento-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
            <div className="group/marquee relative overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-950 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-950 to-transparent" />
              <div
                className="flex w-max gap-4 py-2 pr-4 animate-[cimento-marquee_45s_linear_infinite] group-hover/marquee:[animation-play-state:paused] motion-reduce:[animation:none] motion-reduce:flex-wrap motion-reduce:w-full"
                style={{ animationDuration: `${Math.max(30, leaders.length * 4)}s` }}
              >
              {[...leaders, ...leaders].map((p: any, li: number) => {
                const dup = li >= leaders.length
                const economy =
                  p.original_price && Number(p.original_price) > Number(p.price)
                    ? Number(p.original_price) - Number(p.price)
                    : 0
                return (
                  <article key={`${p.id}-${li}`} aria-hidden={dup} className="flex w-56 shrink-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur transition-all hover:-translate-y-1 hover:border-[#25D366]/50 hover:shadow-2xl sm:w-64">
                    <div className="relative aspect-square bg-white p-4">
                      {p.image_url && (
                        <Image src={p.image_url} alt={dup ? "" : p.name} fill className="object-contain p-3" sizes="256px" />
                      )}
                      {economy > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-[#F47920] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                          -{Math.round((economy / Number(p.original_price)) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-black leading-snug">{p.name}</h3>
                      <div className="mt-2">
                        {p.original_price && Number(p.original_price) > Number(p.price) && (
                          <p className="text-xs text-white/40 line-through">
                            R$ {Number(p.original_price).toFixed(2).replace(".", ",")}
                          </p>
                        )}
                        <p className="text-2xl font-black tracking-tight text-[#25D366]">
                          R$ {Number(p.price).toFixed(2).replace(".", ",")}
                          <span className="ml-1 text-xs font-bold text-white/50">/{p.unit}</span>
                        </p>
                        {economy > 0 && (
                          <p className="mt-0.5 text-[11px] font-bold text-emerald-300">
                            Economize R$ {economy.toFixed(2).replace(".", ",")} no palete/carga
                          </p>
                        )}
                      </div>
                      <div className="mt-3 flex flex-col gap-2">
                        <a
                          href={waLink(`Olá! Quero comprar ${p.name} (R$ ${Number(p.price).toFixed(2).replace(".", ",")}/${p.unit}). Quais as formas de pagamento?`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={dup ? -1 : undefined}
                          data-track="btn_whatsapp"
                          data-button-name="btn_whatsapp"
                          data-source="home_cta"
                          className="btn-whatsapp-track inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 text-xs font-black uppercase tracking-wide text-white transition-all hover:bg-[#1EBE5B] active:scale-95"
                        >
                          Comprar no WhatsApp
                        </a>
                        <Link href={`/produto/${p.slug}`} tabIndex={dup ? -1 : undefined} className="text-center text-[11px] font-semibold text-white/40 hover:text-white transition-colors">
                          Ver detalhes →
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SEÇÃO 2: ESTRUTURA & AÇO ── */}
      {data?.aco && data.aco.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader
              title="Estrutura & Aço"
              subtitle="Vergalhões e telas soldadas"
              href="/categoria/aco-e-ferragens"
              linkLabel="Ver aço"
            />
            <ProductsCarousel products={data.aco} autoplayDelay={6000} />
          </div>
        </section>
      )}

      {/* ── SEÇÃO 3: HIDRÁULICOS ── */}
      {data?.hidraulica && data.hidraulica.length > 0 && (
        <section className="bg-secondary/5 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader
              title="Materiais Hidráulicos & Tubulações"
              subtitle="Tigre / Amanco / caixas d'água"
              href="/categoria/materiais-hidraulicos"
              linkLabel="Ver hidráulica"
            />
            <ProductsCarousel products={data.hidraulica} autoplayDelay={6500} />
          </div>
        </section>
      )}

      {/* ── SE��O 4: ACABAMENTO ── */}
      {data?.acabamento && data.acabamento.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeader
              title="Argamassas, Rejuntes & Impermeabilização"
              subtitle="Argamassas, rejuntes e impermeabilizantes"
              href="/produtos"
              linkLabel="Ver acabamento"
            />
            <ProductsCarousel products={data.acabamento} autoplayDelay={7000} />
          </div>
        </section>
      )}

      {/* ── INSTITUCIONAL + DEPOIMENTOS ── */}
      <div className="py-10">
        <InstitutionalSection />
      </div>

      <section className="relative my-12 overflow-hidden bg-secondary py-16 sm:py-24">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="relative z-10">
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ── CTA B2B ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-800/90 bg-gradient-to-br from-slate-900 via-[#0C1222] to-slate-950 p-8 text-white shadow-2xl sm:rounded-[3.5rem] sm:p-12 lg:p-16">
          <div className="absolute -translate-y-1/2 translate-x-1/2 right-0 top-0 h-64 w-64 rounded-full bg-blue-600 opacity-20 blur-[100px] transition-transform duration-700 group-hover:scale-110 sm:h-96 sm:w-96" />
          <div className="relative z-10 flex flex-col items-center gap-10 text-center lg:flex-row lg:text-left">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Orçamento Imediato</span>
              </div>
              <h2 className="text-4xl font-black leading-[1.0] tracking-tight sm:text-5xl">
                Preço de atacado<br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">direto da fonte.</span>
              </h2>
              <p className="mx-auto max-w-xl text-lg font-medium leading-relaxed text-white/70 lg:mx-0">
                Cimento, aço, hidráulica e acabamento com entrega rápida, parcelamento em até 12x no cartão e desconto especial no PIX.
              </p>
            </div>
            <HomeWhatsAppCta />
          </div>
        </div>
      </section>

      {/* ── OFERTAS ── */}
      {data?.discounts && data.discounts.length > 0 && (
        <section id="promocoes" className="relative mx-4 my-6 overflow-hidden rounded-[2rem] bg-[#020617] py-16 text-white sm:rounded-[3rem] sm:py-20">
          <div className="absolute inset-0 bg-mesh opacity-10" />
          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-12 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Oportunidades Únicas</span>
                </div>
                <h2 className="text-4xl font-black leading-[1.0] tracking-tight text-white sm:text-5xl">Ofertas da Semana</h2>
              </div>
              <Link href="/produtos" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:text-white">
                Ver todas as ofertas
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-8">
              <ProductsCarousel products={data.discounts} autoplayDelay={6000} />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
