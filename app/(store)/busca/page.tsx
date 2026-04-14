"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useMemo } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"

const supabase = createClient()

async function fetchActiveProducts() {
  const { data, error } = await supabase.from("products").select("*").eq("active", true).order("name")
  if (error) throw error
  return data || []
}

function SearchResults() {
  const searchParams = useSearchParams()
  const qRaw = searchParams.get("q") || ""
  const q = qRaw.trim()
  const qLower = q.toLowerCase()

  const { data: allProducts, isLoading } = useSWR(q ? "store-catalog-active-v1" : null, fetchActiveProducts)

  const products = useMemo(() => {
    if (!allProducts || !qLower) return []
    return allProducts.filter((p) => {
      const name = (p.name as string).toLowerCase()
      const desc = p.description ? String(p.description).toLowerCase() : ""
      return name.includes(qLower) || desc.includes(qLower)
    })
  }, [allProducts, qLower])

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-10">
      <Link
        href="/"
        className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" /> Voltar
      </Link>
      <div className="mb-6 flex items-center gap-3 sm:mb-8">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Search className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
            {q ? `“${q}”` : "Buscar produtos"}
          </h1>
          {q ? <p className="text-sm text-muted-foreground">Resultados da busca</p> : null}
        </div>
      </div>

      {!q ? (
        <p className="rounded-2xl border border-dashed border-border/80 bg-card/80 px-4 py-12 text-center text-sm leading-relaxed text-muted-foreground shadow-app">
          Digite no campo de busca do topo. Os resultados atualizam em tempo real conforme você digita.
        </p>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !products.length ? (
        <p className="rounded-2xl border border-border/50 bg-muted/20 py-12 text-center text-muted-foreground">
          Nenhum produto encontrado para sua busca.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  )
}
