"use client"

import { useCallback, useEffect, useState } from "react"
import useSWR from "swr"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { getSiteSettingsPublic } from "@/lib/fetchers/site-settings-public"
import { resolveTestimonials } from "@/lib/site-settings"

function Stars({ n }: { n: number }) {
  const count = Math.min(5, Math.max(1, n))
  return (
    <div className="flex gap-0.5" aria-label={`${count} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${i < count ? "fill-amber-400 text-amber-400" : "text-muted-foreground/35"}`}
          aria-hidden
        />
      ))}
    </div>
  )
}

export default function TestimonialsCarousel() {
  const { data: row } = useSWR("site-settings-public", getSiteSettingsPublic, { revalidateOnFocus: false })
  const items = resolveTestimonials(row ?? null)
  const [paused, setPaused] = useState(false)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: items.length > 1,
    dragFree: false,
    containScroll: "trimSnaps",
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
  }, [emblaApi, items.length])

  useEffect(() => {
    if (!emblaApi) return

    // Pausa enquanto o usuário interage (drag/tap), para não "brigar" com o autoplay.
    const onDown = () => setPaused(true)
    const onUp = () => setPaused(false)
    emblaApi.on("pointerDown", onDown)
    emblaApi.on("pointerUp", onUp)
    return () => {
      emblaApi.off("pointerDown", onDown)
      emblaApi.off("pointerUp", onUp)
    }
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi || items.length <= 1) return
    if (typeof window === "undefined") return

    const reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return

    const id = window.setInterval(() => {
      if (paused) return
      emblaApi.scrollNext()
    }, 6000)

    return () => window.clearInterval(id)
  }, [emblaApi, items.length, paused])

  return (
    <section
      className="bg-muted/25 py-10 sm:py-14"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Depoimentos</p>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Quem compra, confia
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-[15px]">
              Avaliações reais de clientes que valorizam entrega, segurança e qualidade dos materiais.
            </p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background text-foreground shadow-sm transition enabled:hover:border-primary/30 enabled:hover:shadow-app disabled:opacity-40"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background text-foreground shadow-sm transition enabled:hover:border-primary/30 enabled:hover:shadow-app disabled:opacity-40"
              aria-label="Próximo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden pb-1" ref={emblaRef}>
          <div className="flex gap-3 sm:gap-4">
            {items.map((t, idx) => (
              <div
                key={`${t.name}-${idx}`}
                className="min-w-0 shrink-0 grow-0 basis-[min(88vw,340px)] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.75rem)]"
              >
                <article className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-app transition duration-300 hover:border-primary/20 hover:shadow-app-lg">
                  <Quote className="h-8 w-8 text-primary/25" aria-hidden />
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-5 flex flex-col gap-2 border-t border-border/50 pt-4">
                    <Stars n={t.rating ?? 5} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      {t.role ? <p className="text-xs text-muted-foreground">{t.role}</p> : null}
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
