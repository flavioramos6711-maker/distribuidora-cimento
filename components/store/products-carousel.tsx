"use client"

import { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ProductCard, { ProductCardProduct } from "@/components/store/product-card"
import { cn } from "@/lib/utils"

interface ProductsCarouselProps {
  products: ProductCardProduct[]
  autoplayDelay?: number
}

export default function ProductsCarousel({ products, autoplayDelay = 5000 }: ProductsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: products.length > 4,
    align: "start",
    skipSnaps: false,
    dragFree: true
  })

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setPrevBtnEnabled(emblaApi.canScrollPrev())
    setNextBtnEnabled(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  if (products.length === 0) return null

  return (
    <div className="relative group/carousel">
      <div 
        className="overflow-hidden px-4 -mx-4" 
        ref={emblaRef}
      >
        <div className="flex touch-pan-y -ml-4 py-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-0 shrink-0 grow-0 pl-4 basis-[82%] sm:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Elevated Design */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none hidden sm:flex justify-between px-2 xl:-mx-8">
        <button
          onClick={scrollPrev}
          disabled={!prevBtnEnabled}
          className={cn(
            "pointer-events-auto h-14 w-14 flex items-center justify-center rounded-2xl bg-white text-secondary shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 transition-all hover:bg-primary hover:text-white hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none",
            !prevBtnEnabled && "opacity-0"
          )}
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={scrollNext}
          disabled={!nextBtnEnabled}
          className={cn(
            "pointer-events-auto h-14 w-14 flex items-center justify-center rounded-2xl bg-white text-secondary shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 transition-all hover:bg-primary hover:text-white hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none",
            !nextBtnEnabled && "opacity-0"
          )}
          aria-label="Próximo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Modern Progress Indicators */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-1.5 transition-all duration-300 rounded-full",
              index === selectedIndex 
                ? "w-8 bg-primary" 
                : "w-2 bg-slate-200 hover:bg-slate-300"
            )}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
