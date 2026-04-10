"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import { ArrowLeft, SlidersHorizontal } from "lucide-react"
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
    if (categoryId === "all") return products
    return products.filter((p) => p.category_id === categoryId)
  }, [products, categoryId])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        <aside className="lg:w-56 shrink-0">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-28">
            <div className="flex items-center gap-2 text-sm font-heading font-bold text-foreground mb-4">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              Filtros
            </div>
            <p className="text-xs text-muted-foreground mb-3">Categoria</p>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => setCategoryId("all")}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                    categoryId === "all" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground"
                  }`}
                >
                  Todas
                </button>
              </li>
              {(categories || []).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                      categoryId === c.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Catálogo de produtos</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6 md:mb-8">
            {isLoading ? "Carregando..." : `${filtered.length} produtos disponíveis`}
          </p>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[0.72] rounded-2xl bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-16 border border-dashed rounded-2xl">
              Nenhum produto nesta categoria.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
