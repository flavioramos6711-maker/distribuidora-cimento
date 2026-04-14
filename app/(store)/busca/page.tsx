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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <div className="flex items-center gap-2 mb-8">
        <Search className="w-5 h-5 text-primary shrink-0" />
        <h1 className="text-2xl font-bold text-foreground">
          {q ? `Resultados para “${q}”` : "Buscar produtos"}
        </h1>
      </div>

      {!q ? (
        <p className="text-center text-muted-foreground py-12 rounded-2xl border border-dashed border-border/80 bg-muted/20">
          Digite no campo de busca do topo para encontrar produtos por nome ou descrição. Os resultados atualizam
          em tempo real.
        </p>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : !products.length ? (
        <p className="text-center text-muted-foreground py-12">Nenhum produto encontrado para sua busca.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
