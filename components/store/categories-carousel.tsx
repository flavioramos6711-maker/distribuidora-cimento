"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Category {
  id: string
  name: string
  slug: string
  image_url?: string | null
  products?: { id: string }[]
}

interface CategoriesCarouselProps {
  categories: Category[]
}

export default function CategoriesCarousel({ categories }: CategoriesCarouselProps) {
  const [paused, setPaused] = useState(false)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: categories.length > 3,
    dragFree: false,
    containScroll: false,
    slidesToScroll: 1,
  })

  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const update = () => {
      setCanPrev(emblaApi.canScrollPrev())
      setCanNext(emblaApi.canScrollNext())
    }
    emblaApi.on("reInit", update)
    emblaApi.on("select", update)
    update()
    return () => {
      emblaApi.off("reInit", update)
      emblaApi.off("select", update)
    }
  }, [emblaApi])

  useEffect(() => {
    emblaApi?.reInit()
  }, [emblaApi, categories.length])

  // Pausa enquanto o usuário interage (drag/tap)
  useEffect(() => {
    if (!emblaApi) return
    const onDown = () => setPaused(true)
    const onUp = () => setPaused(false)
    emblaApi.on("pointerDown", onDown)
    emblaApi.on("pointerUp", onUp)
    return () => {
      emblaApi.off("pointerDown", onDown)
      emblaApi.off("pointerUp", onUp)
    }
  }, [emblaApi])

  // Autoplay com loop infinito
  useEffect(() => {
    if (!emblaApi || categories.length <= 3) return
    if (typeof window === "undefined") return

    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return

    const id = window.setInterval(() => {
      if (paused) return
      emblaApi.scrollNext()
    }, 4000)

    return () => window.clearInterval(id)
  }, [emblaApi, categories.length, paused])

  if (!categories || categories.length === 0) return null

  return (
    <div
      className="relative"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {/* Navigation buttons */}
      <div className="absolute -top-14 right-0 z-10 hidden gap-2 sm:flex">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canPrev && !emblaApi?.canScrollPrev()}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-background text-foreground shadow-sm transition enabled:hover:border-primary/30 enabled:hover:shadow-app disabled:opacity-40"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          disabled={!canNext && !emblaApi?.canScrollNext()}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-background text-foreground shadow-sm transition enabled:hover:border-primary/30 enabled:hover:shadow-app disabled:opacity-40"
          aria-label="Próximo"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="min-w-0 shrink-0 grow-0 basis-[min(42vw,180px)] sm:basis-[calc(33.333%-0.75rem)] md:basis-[calc(25%-0.75rem)] lg:basis-[calc(16.666%-0.833rem)]"
            >
              <Link
                href={`/categoria/${cat.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-app transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-app-lg active:scale-[0.98]"
              >
                <div className="relative flex aspect-square w-full items-center justify-center bg-gradient-to-b from-muted/40 to-muted/10 p-3">
                  {cat.image_url ? (
                    <div className="relative h-full w-full overflow-hidden rounded-full">
                      <Image
                        src={cat.image_url}
                        alt=""
                        fill
                        sizes="(max-width:640px) 42vw, (max-width:1024px) 25vw, 16vw"
                        className="object-contain object-center transition duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-heading text-2xl font-bold text-primary/50">
                      {cat.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="border-t border-border/40 p-3 text-center">
                  <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground transition group-hover:text-primary">
                    {cat.name}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                    {cat.products?.length || 0} produtos
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
