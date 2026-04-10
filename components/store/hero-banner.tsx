"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { SITE, waLink } from "@/lib/site-config"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"

const supabase = createClient()
const fetcher = async () => {
  const { data } = await supabase.from("banners").select("*").eq("active", true).order("sort_order")
  return data || []
}

export default function HeroBanner() {
  const { data: banners } = useSWR("store-banners", fetcher)
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    if (!banners?.length) return
    setCurrent((c) => (c + 1) % banners.length)
  }, [banners])

  const prev = useCallback(() => {
    if (!banners?.length) return
    setCurrent((c) => (c - 1 + banners.length) % banners.length)
  }, [banners])

  useEffect(() => {
    if (!banners?.length || banners.length <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [banners, next])

  /* Sobrepõe área do header fixo + altura máx. 70vh */
  const shellClass =
    "relative w-full overflow-hidden bg-secondary " +
    "-mt-[8.75rem] pt-[8.75rem] md:-mt-[7.5rem] md:pt-[7.5rem] lg:-mt-[10rem] lg:pt-[10rem] " +
    "min-h-[200px] max-h-[70vh] h-[clamp(200px,38vh,480px)] " +
    "sm:h-[clamp(220px,42vh,500px)] md:h-[clamp(240px,45vh,520px)]"

  if (!banners?.length) {
    return (
      <div className={shellClass}>
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-[#132947] to-secondary" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 py-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
            {SITE.shortName}
          </p>
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-secondary-foreground max-w-3xl text-balance">
            Materiais de construção para obra, indústria e revenda
          </h1>
          <p className="mt-3 max-w-xl text-sm sm:text-base text-secondary-foreground/75">
            {SITE.tagline}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/produtos"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
            >
              Ver catálogo
            </Link>
            <a
              href={waLink("Olá! Gostaria de um orçamento.")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("hero_banner", "/")}
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              Orçamento no WhatsApp
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={shellClass}>
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            i === current ? "opacity-100 z-[1]" : "opacity-0 pointer-events-none z-0"
          }`}
        >
          {banner.link ? (
            <Link href={banner.link} className="block size-full relative">
              <Image
                src={banner.image_url}
                alt={banner.title || "Banner"}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
              {(banner.title || banner.subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent flex items-end sm:items-center sm:bg-gradient-to-r">
                  <div className="max-w-7xl mx-auto px-4 pb-8 sm:px-8 sm:pb-0 w-full sm:translate-y-0">
                    {banner.title && (
                      <h2 className="font-heading text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 text-balance max-w-xl">
                        {banner.title}
                      </h2>
                    )}
                    {banner.subtitle && (
                      <p className="text-sm sm:text-lg text-white/85 max-w-lg">{banner.subtitle}</p>
                    )}
                  </div>
                </div>
              )}
            </Link>
          ) : (
            <div className="size-full relative">
              <Image
                src={banner.image_url}
                alt={banner.title || "Banner"}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
              {(banner.title || banner.subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/45 to-transparent flex items-end sm:items-center sm:bg-gradient-to-r">
                  <div className="max-w-7xl mx-auto px-4 pb-8 sm:px-8 sm:pb-0 w-full">
                    {banner.title && (
                      <h2 className="font-heading text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 text-balance max-w-xl">
                        {banner.title}
                      </h2>
                    )}
                    {banner.subtitle && (
                      <p className="text-sm sm:text-lg text-white/85 max-w-lg">{banner.subtitle}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 sm:left-4 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 sm:right-4 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-6 bg-primary" : "w-1.5 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
