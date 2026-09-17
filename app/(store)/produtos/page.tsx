"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import { ArrowLeft, SlidersHorizontal, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { rawTokens, slugTokens, escapeLike } from "@/lib/search-normalize"

const supabase = createClient()
const PAGE_SIZE = 36

type Category = { id: string; name: string; slug: string }
type Product = {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  image_url: string | null
  images?: string[] | null | undefined
  unit: string
  stock: number
  category_id: string | null
  is_new?: boolean
  is_discount?: boolean
  featured?: boolean
  sku?: string | null
}

function pageNumbers(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const window = new Set<number>([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages])
  const nums = [...window].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b)
  const out: (number | "…")[] = []
  let prev = 0
  for (const n of nums) {
    if (n - prev > 1) out.push("…")
    out.push(n)
    prev = n
  }
  return out
}

export default function ProductsPage() {
  const [categoryId, setCategoryId] = useState<string | "all">("all")
  const [nameQuery, setNameQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [page, setPage] = useState(1)

  // debounce 400ms da busca textual
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(nameQuery.trim()), 400)
    return () => clearTimeout(t)
  }, [nameQuery])

  const q = debouncedQuery

  const handleSearch = (v: string) => {
    setNameQuery(v)
    setPage(1)
  }

  const handleCategory = (id: string | "all") => {
    setCategoryId(id)
    setPage(1)
  }

  const { data: categories } = useSWR("product-filters-cats", async () => {
    const { data } = await supabase.from("categories").select("id, name, slug").eq("active", true).order("sort_order")
    return (data || []) as Category[]
  })

  // Paginação e filtragem SERVER-SIDE no Supabase (suporta 4.738 itens)
  const { data, isLoading } = useSWR(
    ["products-paginated", categoryId, q, page],
    async () => {
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      let query = supabase
        .from("products")
        .select("id, name, slug, price, original_price, image_url, unit, stock, category_id, is_new, is_discount, featured, sku", { count: "exact" })
        .eq("active", true)
        .not("image_url", "is", null)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
      if (categoryId !== "all") query = query.eq("category_id", categoryId)
      if (q) {
        // Busca por tokens (AND) em 3 frentes (OR): nome original (acentuado),
        // slug cru e slug normalizado — cobre "caue"→"Cauê", "cp2"→"CP II",
        // "cimento 50kg" (tokens independentes, sem exigir contiguidade).
        const rt = rawTokens(q).map(escapeLike)
        const st = slugTokens(q).map(escapeLike)
        const andName = rt.map((t) => `name.ilike.%${t}%`).join(",")
        const andSlugRaw = rt.map((t) => `slug.ilike.%${t}%`).join(",")
        const andSlugNorm = st.map((t) => `slug.ilike.%${t}%`).join(",")
        query = query.or(`and(${andName}),and(${andSlugRaw}),and(${andSlugNorm})`)
      }
      const { data, count, error } = await query.range(from, to)
      if (error) throw error
      return { products: (data || []) as Product[], total: count || 0 }
    },
    { keepPreviousData: true } as any
  )

  const products = data?.products || []
  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pages = pageNumbers(safePage, totalPages)

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8 md:py-10">
      <Link href="/" className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary sm:mb-6">
        <ArrowLeft className="h-4 w-4 shrink-0" /> Voltar
      </Link>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <aside className="shrink-0 lg:w-56">
          <div className="lg:sticky lg:top-24">
            <div className="mb-1 hidden items-center gap-2 font-heading text-sm font-bold text-foreground lg:flex">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filtros
            </div>
            <p className="mb-2 hidden text-xs text-muted-foreground lg:block">Categoria</p>
            <div className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-1.5 lg:overflow-visible lg:rounded-2xl lg:border lg:border-border/50 lg:bg-card lg:p-3 lg:shadow-app">
              <button type="button" onClick={() => handleCategory("all")} className={`shrink-0 snap-start rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 lg:w-full lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-left ${categoryId === "all" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-foreground hover:bg-muted lg:bg-transparent"}`}>
                Todas
              </button>
              {(categories || []).map((c) => (
                <button key={c.id} type="button" onClick={() => handleCategory(c.id)} className={`max-w-[200px] shrink-0 snap-start truncate rounded-full px-4 py-2.5 text-sm font-medium transition duration-200 lg:max-w-none lg:w-full lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-left ${categoryId === c.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-foreground hover:bg-muted lg:bg-transparent"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">Catálogo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLoading && !data ? "Carregando..." : `${total.toLocaleString("pt-BR")} produtos disponíveis${totalPages > 1 ? ` — página ${safePage} de ${totalPages}` : ""}`}
          </p>
          <div className="relative mb-6 mt-4 max-w-lg">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="search" value={nameQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Filtrar por nome..." className="h-11 w-full rounded-full border border-border/50 bg-background pl-10 pr-4 text-sm shadow-inner outline-none transition duration-200 focus:border-primary/35 focus:shadow-app" aria-label="Filtrar produtos por nome" />
          </div>

          {isLoading && !data ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[0.72] rounded-2xl bg-muted shadow-app" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>

              {products.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border/80 bg-muted/20 py-16 text-center text-muted-foreground">Nenhum produto encontrado.</p>
              )}

              {totalPages > 1 && (
                <nav aria-label="Paginação do catálogo" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
                  <button disabled={safePage <= 1} onClick={() => setPage(1)} className="hidden h-10 px-3 items-center justify-center rounded-full border bg-white text-xs font-bold text-slate-600 disabled:opacity-40 sm:inline-flex">
                    Primeira
                  </button>
                  <button disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Página anterior" className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {pages.map((p, i) =>
                    p === "…" ? (
                      <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        aria-current={p === safePage ? "page" : undefined}
                        className={cn(
                          "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-2 text-sm font-bold transition",
                          p === safePage ? "border-slate-900 bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Próxima página" className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white disabled:opacity-40">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button disabled={safePage >= totalPages} onClick={() => setPage(totalPages)} className="hidden h-10 px-3 items-center justify-center rounded-full border bg-white text-xs font-bold text-slate-600 disabled:opacity-40 sm:inline-flex">
                    Última
                  </button>
                </nav>
              )}
              {isLoading && data && (
                <div className="mt-4 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
