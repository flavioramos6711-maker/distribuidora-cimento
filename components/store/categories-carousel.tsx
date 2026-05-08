"use client"

import { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Category {
  id: string
  name: string
  slug: string
  image_url?: string | null
}

interface CategoriesCarouselProps {
  categories: Category[]
}

export default function CategoriesCarousel({ categories }: CategoriesCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: categories.length > 3,
    align: "start",
    skipSnaps: false,
  })

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setPrevBtnEnabled(emblaApi.canScrollPrev())
    setNextBtnEnabled(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  const [isPaused, setIsPaused] = useState(false)

  // Autoplay manual
  useEffect(() => {
    if (!emblaApi || categories.length <= 3 || isPaused) return
    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, 4000)
    return () => clearInterval(interval)
  }, [emblaApi, categories.length, isPaused])

  if (categories.length === 0) return null

  return (
    <section 
      className="w-full py-8 sm:py-12" 
      aria-label="Categorias"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-x">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="min-w-0 shrink-0 grow-0 px-2 basis-1/3 sm:basis-1/4 lg:basis-1/6"
                >
                  <Link
                    href={`/categoria/${category.slug}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl p-2 transition-all hover:bg-muted/50 active:scale-95"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-full bg-secondary shadow-sm ring-1 ring-border/50 transition-all group-hover:shadow-md group-hover:ring-primary/20">
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold">
                          {category.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-center text-xs font-semibold text-foreground/90 transition-colors group-hover:text-primary sm:text-sm">
                      {category.name}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Only Buttons */}
          <div className="hidden lg:block">
            <button
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className="absolute -left-5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-lg ring-1 ring-border transition-all hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-0"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className="absolute -right-5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-lg ring-1 ring-border transition-all hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-0"
              aria-label="Próximo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
