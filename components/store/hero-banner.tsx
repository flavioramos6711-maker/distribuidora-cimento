"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import useSWR from "swr"
import useEmblaCarousel from "embla-carousel-react"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { SITE, waLink } from "@/lib/site-config"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"
import { getSiteSettingsPublic } from "@/lib/fetchers/site-settings-public"
import { cmsBannerSlides, type CmsBannerSlide } from "@/lib/site-settings"

const supabase = createClient()

async function fetchBanners() {
  const { data } = await supabase.from("banners").select("*").eq("active", true).order("sort_order")
  return data || []
}

type DbBanner = {
  id: string
  image_url: string
  link?: string | null
  title?: string | null
  subtitle?: string | null
}

type HeroSlide = {
  key: string
  image_url: string
  link?: string | null
  title?: string | null
  subtitle?: string | null
}

function mapCmsToSlides(slides: CmsBannerSlide[]): HeroSlide[] {
  return slides.map((s, i) => ({
    key: `cms-${i}`,
    image_url: s.image_url,
    link: s.link,
    title: s.title,
    subtitle: s.subtitle,
  }))
}

function mapDbToSlides(banners: DbBanner[]): HeroSlide[] {
  return banners.map((b) => ({
    key: b.id,
    image_url: b.image_url,
    link: b.link,
    title: b.title,
    subtitle: b.subtitle,
  }))
}

function SlideVisual({
  banner,
  priority,
  imgSizes,
}: {
  banner: HeroSlide
  priority: boolean
  imgSizes: string
}) {
  const inner = (
    <>
      <Image
        src={banner.image_url}
        alt={banner.title || "Banner"}
        fill
        priority={priority}
        sizes={imgSizes}
        className="object-cover object-center transition duration-700 ease-out"
      />
      {(banner.title || banner.subtitle) && (
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/25 to-transparent sm:items-center sm:bg-gradient-to-r sm:from-black/60 sm:via-black/20">
          <div className="w-full max-w-7xl px-4 pb-8 pt-16 sm:px-8 sm:pb-0 sm:pt-0">
            {banner.title && (
              <h2 className="max-w-xl text-balance font-heading text-xl font-bold text-white sm:text-3xl md:text-4xl">
                {banner.title}
              </h2>
            )}
            {banner.subtitle && (
              <p className="mt-2 max-w-lg text-sm text-white/90 sm:text-lg">{banner.subtitle}</p>
            )}
          </div>
        </div>
      )}
    </>
  )

  if (banner.link) {
    return (
      <Link href={banner.link} className="relative block size-full">
        {inner}
      </Link>
    )
  }
  return <div className="relative size-full">{inner}</div>
}

export default function HeroBanner() {
  const { data: settings } = useSWR("site-settings-public", getSiteSettingsPublic, {
    revalidateOnFocus: false,
  })
  const cms = useMemo(() => cmsBannerSlides(settings ?? null), [settings])

  const { data: dbBanners } = useSWR(cms.length > 0 ? null : "store-banners", fetchBanners, {
    revalidateOnFocus: false,
  })

  const slides = useMemo(() => {
    if (cms.length > 0) return mapCmsToSlides(cms)
    return mapDbToSlides((dbBanners || []) as DbBanner[])
  }, [cms, dbBanners])

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: slides.length > 1,
    align: "start",
    duration: 22,
  })
  const [selected, setSelected] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap())
    emblaApi.on("reInit", onSelect)
    emblaApi.on("select", onSelect)
    onSelect()
    return () => {
      emblaApi.off("reInit", onSelect)
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  useEffect(() => {
    emblaApi?.reInit()
  }, [emblaApi, slides])

  useEffect(() => {
    if (!emblaApi || slides.length <= 1) return
    const id = setInterval(() => emblaApi.scrollNext(), 6000)
    return () => clearInterval(id)
  }, [emblaApi, slides.length])

  const shellClass =
    "relative w-full overflow-hidden bg-secondary min-h-[200px] max-h-[68vh] h-[min(42vw,320px)] sm:h-[min(38vw,400px)] md:h-[min(36vw,480px)]"

  const imgSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"

  if (slides.length === 0) {
    return (
      <section className="w-full px-3 pt-1 sm:px-4 sm:pt-4" aria-label="Destaque">
        <div className={`${shellClass} mx-auto max-w-7xl rounded-2xl shadow-app sm:rounded-3xl`}>
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-[#132947] to-secondary" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 py-10 text-center">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary sm:text-xs">
              {SITE.shortName}
            </p>
            <h1 className="max-w-xl text-balance font-heading text-2xl font-bold leading-tight text-secondary-foreground sm:text-3xl md:text-4xl">
              Materiais de construção para obra e revenda
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-secondary-foreground/75 sm:text-base">
              {SITE.tagline}
            </p>
            <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <Link
                href="/produtos"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-app transition duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                Ver catálogo
              </Link>
              <a
                href={waLink("Olá! Gostaria de um orçamento.")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("hero_banner", "/")}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 bg-white/10 px-8 text-sm font-semibold text-white backdrop-blur-sm transition duration-200 hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98]"
              >
                Orçamento no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full px-3 pt-1 sm:px-4 sm:pt-4" aria-label="Banners">
      <div className={`${shellClass} mx-auto max-w-7xl rounded-2xl shadow-app sm:rounded-3xl`}>
        <div className="embla h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full touch-pan-y">
            {slides.map((banner, i) => (
              <div
                className="relative h-full min-h-[200px] min-w-0 shrink-0 grow-0 basis-full"
                key={banner.key}
              >
                <SlideVisual banner={banner} priority={i === 0} imgSizes={imgSizes} />
              </div>
            ))}
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white shadow-app backdrop-blur-md transition duration-200 hover:scale-[1.06] hover:bg-white/30 active:scale-[0.95] sm:left-4 sm:h-11 sm:w-11"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white shadow-app backdrop-blur-md transition duration-200 hover:scale-[1.06] hover:bg-white/30 active:scale-[0.95] sm:right-4 sm:h-11 sm:w-11"
              aria-label="Próximo slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-4">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === selected ? "w-7 bg-primary" : "w-1.5 bg-white/45 hover:bg-white/70"
                  }`}
                  aria-label={`Ir para slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
