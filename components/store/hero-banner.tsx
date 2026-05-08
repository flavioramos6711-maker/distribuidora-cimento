"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import useEmblaCarousel from "embla-carousel-react"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const supabase = createClient()

async function fetchBanners() {
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
  return data || []
}

type DbBanner = {
  id: string
  image_url: string
  link?: string | null
}

export default function HeroBanner() {
  const { data: slides, isLoading } = useSWR<DbBanner[]>("store-banners", fetchBanners, {
    revalidateOnFocus: false,
  })

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: (slides?.length ?? 0) > 1,
    align: "start",
    duration: 40,
  })

  const [selected, setSelected] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelected(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  const [isPaused, setIsPaused] = useState(false)

  // Autoplay
  useEffect(() => {
    if (!emblaApi || !slides || slides.length <= 1 || isPaused) return
    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, 6000)
    return () => clearInterval(interval)
  }, [emblaApi, slides, isPaused])

  if (isLoading || !slides || slides.length === 0) {
    return (
      <div className="relative aspect-[16/7] sm:aspect-[16/6] lg:aspect-[1920/600] w-full bg-muted animate-pulse" />
    )
  }

  return (
    <section 
      className="group/hero relative w-full overflow-hidden" 
      aria-label="Banners principais"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((banner, i) => (
            <div key={banner.id} className="relative min-w-0 shrink-0 grow-0 basis-full">
              <div className="relative aspect-[16/9] sm:aspect-[16/6] lg:aspect-[1920/600] w-full overflow-hidden bg-white">
                <Image
                  src={banner.image_url}
                  alt={`Banner ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className={cn(
                    "object-contain lg:object-cover transition-transform duration-[8000ms] ease-out",
                    i === selected ? "lg:scale-110 scale-100" : "scale-100"
                  )}
                />
                
                {/* Softened Gradient Overlays for elegance */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                {banner.link && (
                  <Link 
                    href={banner.link} 
                    className="absolute inset-0 z-10"
                  >
                    <span className="sr-only">Ver detalhes</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          {/* Navigation Controls */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 hidden md:flex justify-between pointer-events-none z-20">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              className="pointer-events-auto h-14 w-14 flex items-center justify-center rounded-2xl glass text-secondary opacity-0 group-hover/hero:opacity-100 transition-all hover:bg-primary hover:text-white -translate-x-4 group-hover/hero:translate-x-0"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              className="pointer-events-auto h-14 w-14 flex items-center justify-center rounded-2xl glass text-secondary opacity-0 group-hover/hero:opacity-100 transition-all hover:bg-primary hover:text-white translate-x-4 group-hover/hero:translate-x-0"
              aria-label="Próximo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

        </>
      )}
    </section>
  )
}

