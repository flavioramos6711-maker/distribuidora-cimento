"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import { ArrowLeft, SlidersHorizontal, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const supabase = createClient()

type Category = { id: string; name: string; slug: string }
type Product = {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  image_url: string | null
  unit: string
  stock: number
  category_id: string | null
  is_new?: boolean
  is_discount?: boolean
}

export default function ProductsPage() {
  const [categoryId, setCategoryId] = useState<string | "all">("all")
  const [nameQuery, setNameQuery] = useState("")

  const { data: categories } = useSWR("product-filters-cats", async () => {
    const { data } = await supabase.from("categories").select("id, name, slug").eq("active", true).order("sort_order")
    return (data || []) as Category[]
  })

  const { data: products, isLoading } = useSWR("all-products-v2", async () => {
    const { data } = await supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false })
    return (data || []) as Product[]
  })

  const filtered = useMemo(() => {
    if (!products) return []
    const byCat = categoryId === "all" ? products : products.filter((p) => p.category_id === categoryId)
    const q = nameQuery.trim().toLowerCase()
    if (!q) return byCat
    return byCat.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, categoryId, nameQuery])

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8 md:py-10">
      <Link
        href="/"
        className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary sm:mb-6"
      >
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
              <button
                type="button"
                onClick={() => setCategoryId("all")}
                className={`shrink-0 snap-start rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 lg:w-full lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-left ${
                  categoryId === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-foreground hover:bg-muted lg:bg-transparent"
                }`}
              >
                Todas
              </button>
              {(categories || []).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`max-w-[200px] shrink-0 snap-start truncate rounded-full px-4 py-2.5 text-sm font-medium transition duration-200 lg:max-w-none lg:w-full lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-left ${
                    categoryId === c.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 text-foreground hover:bg-muted lg:bg-transparent"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">Catálogo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLoading ? "Carregando..." : `${filtered.length} produtos disponíveis`}
          </p>
          <div className="relative mb-6 mt-4 max-w-lg">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              placeholder="Filtrar por nome..."
              className="h-11 w-full rounded-full border border-border/50 bg-background pl-10 pr-4 text-sm shadow-inner outline-none transition duration-200 focus:border-primary/35 focus:shadow-app"
              aria-label="Filtrar produtos por nome"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[0.72] rounded-2xl bg-muted shadow-app" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border/80 bg-muted/20 py-16 text-center text-muted-foreground">
              Nenhum produto encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
