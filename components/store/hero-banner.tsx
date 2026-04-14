"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  const touchStartX = useRef<number | null>(null)

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
    const timer = setInterval(next, 6500)
    return () => clearInterval(timer)
  }, [banners, next])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (dx > 48) prev()
    else if (dx < -48) next()
  }

  const shellClass =
    "relative w-full overflow-hidden bg-secondary min-h-[200px] max-h-[68vh] h-[min(42vw,320px)] sm:h-[min(38vw,400px)] md:h-[min(36vw,480px)]"

  const imgSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"

  if (!banners?.length) {
    return (
      <section className="w-full px-3 pt-1 sm:px-4 sm:pt-4" aria-label="Destaque">
        <div
          className={`${shellClass} mx-auto max-w-7xl rounded-2xl shadow-app sm:rounded-3xl`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-[#132947] to-secondary" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 py-10 text-center">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary sm:text-xs">{SITE.shortName}</p>
            <h1 className="max-w-xl text-balance font-heading text-2xl font-bold leading-tight text-secondary-foreground sm:text-3xl md:text-4xl">
              Materiais de construção para obra e revenda
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-secondary-foreground/75 sm:text-base">{SITE.tagline}</p>
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
      <div
        className={`${shellClass} mx-auto max-w-7xl rounded-2xl shadow-app sm:rounded-3xl`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-out ${
              i === current ? "z-[1] opacity-100" : "pointer-events-none z-0 opacity-0"
            }`}
          >
            {banner.link ? (
              <Link href={banner.link} className="relative block size-full">
                <Image
                  src={banner.image_url}
                  alt={banner.title || "Banner"}
                  fill
                  priority={i === 0}
                  sizes={imgSizes}
                  className="object-cover object-center"
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
              </Link>
            ) : (
              <div className="relative size-full">
                <Image
                  src={banner.image_url}
                  alt={banner.title || "Banner"}
                  fill
                  priority={i === 0}
                  sizes={imgSizes}
                  className="object-cover object-center"
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
              </div>
            )}
          </div>
        ))}

        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white shadow-app backdrop-blur-md transition duration-200 hover:scale-[1.06] hover:bg-white/30 active:scale-[0.95] sm:left-4 sm:h-11 sm:w-11"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white shadow-app backdrop-blur-md transition duration-200 hover:scale-[1.06] hover:bg-white/30 active:scale-[0.95] sm:right-4 sm:h-11 sm:w-11"
              aria-label="Próximo slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-4">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? "w-7 bg-primary" : "w-1.5 bg-white/45 hover:bg-white/70"
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
