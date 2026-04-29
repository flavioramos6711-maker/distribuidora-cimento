"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import useSWR from "swr"
import useEmblaCarousel from "embla-carousel-react"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const supabase = createClient()

async function fetchBanners() {
  const { data } = await supabase.from("banners").select("*").eq("active", true).order("sort_order")
  return data || []
}

type DbBanner = {
  id: string
  image_url: string
  link?: string | null
}

export default function HeroBanner() {
  const { data: dbBanners, isLoading } = useSWR("store-banners", fetchBanners, {
    revalidateOnFocus: false,
  })

  const slides = useMemo(() => {
    return (dbBanners || []) as DbBanner[]
  }, [dbBanners])

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

  // Aspect ratio: 1920x430 = ~4.47:1
  // Responsive: 100% width, height auto based on aspect ratio
  const aspectRatio = "aspect-[1920/430]"
  const imgSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"

  // Nao exibe nada se nao houver banners cadastrados
  if (!isLoading && slides.length === 0) {
    return null
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="w-full" aria-label="Banner">
        <div className={`${aspectRatio} w-full animate-pulse bg-muted`} />
      </section>
    )
  }

  return (
    <section className="w-full" aria-label="Banners">
      <div className={`relative w-full ${aspectRatio} overflow-hidden`}>
        <div className="embla h-full w-full" ref={emblaRef}>
          <div className="flex h-full w-full touch-pan-y">
            {slides.map((banner, i) => (
              <div
                className="relative h-full min-w-0 shrink-0 grow-0 basis-full"
                key={banner.id}
              >
                {banner.link ? (
                  <Link href={banner.link} className="relative block size-full">
                    <Image
                      src={banner.image_url}
                      alt={`Banner ${i + 1}`}
                      fill
                      priority={i === 0}
                      sizes={imgSizes}
                      className="object-cover object-center"
                    />
                  </Link>
                ) : (
                  <div className="relative size-full">
                    <Image
                      src={banner.image_url}
                      alt={`Banner ${i + 1}`}
                      fill
                      priority={i === 0}
                      sizes={imgSizes}
                      className="object-cover object-center"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white shadow-lg backdrop-blur-sm transition duration-200 hover:bg-black/50 active:scale-95 sm:left-4 sm:h-10 sm:w-10"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white shadow-lg backdrop-blur-sm transition duration-200 hover:bg-black/50 active:scale-95 sm:right-4 sm:h-10 sm:w-10"
              aria-label="Proximo slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-4">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === selected ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
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
