"use client"

import { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
    loop: categories.length > 5,
    align: "start",
    skipSnaps: false,
    duration: 35,
  })

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const [isPaused, setIsPaused] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setPrevBtnEnabled(emblaApi.canScrollPrev())
    setNextBtnEnabled(emblaApi.canScrollNext())
  }, [emblaApi])

  // Autoplay Effect
  useEffect(() => {
    if (!emblaApi || isPaused) return
    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext()
      } else {
        emblaApi.scrollTo(0)
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [emblaApi, isPaused])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  if (categories.length === 0) return null

  if (categories.length === 0) return null

  return (
    <section 
      className="w-full" 
      aria-label="Categorias"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative">
        <div className="overflow-hidden px-4 py-4" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="min-w-0 shrink-0 grow-0 pl-4 basis-[45%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
              >
                <Link
                  href={`/categoria/${category.slug}`}
                  className="group relative flex flex-col items-center gap-4 rounded-[2.5rem] p-4 transition-all hover:bg-white hover:shadow-app-lg active:scale-95"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-slate-100 shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 15vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary/10 text-secondary font-black text-2xl uppercase">
                        {category.name.charAt(0)}
                      </div>
                    )}
                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="text-center space-y-1">
                    <span className="block text-xs font-black text-secondary uppercase tracking-widest transition-colors group-hover:text-primary">
                      {category.name}
                    </span>
                    <div className="mx-auto h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-10" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 hidden md:flex justify-between pointer-events-none px-2 xl:-mx-8">
          <button
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-2xl glass text-secondary transition-all hover:bg-primary hover:text-white disabled:opacity-0 disabled:pointer-events-none"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-2xl glass text-secondary transition-all hover:bg-primary hover:text-white disabled:opacity-0 disabled:pointer-events-none"
            aria-label="Próximo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  )
}

