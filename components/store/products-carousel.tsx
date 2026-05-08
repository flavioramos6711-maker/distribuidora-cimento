"use client"

import { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ProductCard, { ProductCardProduct } from "@/components/store/product-card"

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

  if (products.length === 0) return null

  return (
    <div className="relative group/carousel">
      <div 
        className="overflow-hidden" 
        ref={emblaRef}
      >
        <div className="flex touch-pan-y -ml-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-0 shrink-0 grow-0 pl-4 basis-[85%] sm:basis-1/3 lg:basis-1/4"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
        className="absolute -left-2 sm:-left-6 top-1/2 hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-100 transition-all hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-0 z-10"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
        className="absolute -right-2 sm:-right-6 top-1/2 hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-100 transition-all hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-0 z-10"
        aria-label="Próximo"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  )
}
