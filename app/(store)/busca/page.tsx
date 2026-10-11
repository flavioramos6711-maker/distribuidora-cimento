"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import ProductCard from "@/components/store/product-card"
import Link from "next/link"
import { ArrowLeft, Search, PackageOpen } from "lucide-react"

const supabase = createClient()

async function searchProducts(query: string) {
  if (!query || query.trim().length === 0) return []
  
  const q = query.trim()
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, original_price, image_url, unit, stock, is_new, is_discount, featured")
    .eq("active", true)
    .not("image_url", "is", null)
    .ilike("name", `%${q}%`)
    .order("featured", { ascending: false })
    .order("name", { ascending: true })
    .limit(36)

  if (error) {
    console.error("Erro na busca:", error)
    return []
  }
  return data || []
}

function SearchResults() {
  const searchParams = useSearchParams()
  const qRaw = searchParams.get("q") || ""
  const q = qRaw.trim()

  const { data: products, isLoading } = useSWR(
    q ? `search-products-${q}` : null,
    () => searchProducts(q),
    { revalidateOnFocus: false }
  )

  const results = products || []

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
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {q ? (
              <>
                Resultados para <span className="text-primary font-black">"{q}"</span>
              </>
            ) : (
              "Buscar produtos"
            )}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {isLoading
              ? "Buscando materiais no estoque..."
              : q
              ? `${results.length} produto${results.length === 1 ? "" : "s"} encontrado${results.length === 1 ? "" : "s"}`
              : "Digite o nome do produto ou marca para pesquisar"}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200/60" />
          ))}
        </div>
      )}

      {!isLoading && q && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PackageOpen className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Nenhum produto encontrado</h3>
          <p className="text-sm text-slate-500 max-w-md mb-6">
            Não encontramos resultados para "{q}". Verifique a ortografia ou tente pesquisar termos mais genéricos como "cimento", "ferro" ou "tinta".
          </p>
          <Link
            href="/produtos"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-primary/90"
          >
            Ver catálogo completo
          </Link>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] p-8 text-center text-sm text-slate-400">Carregando busca...</div>}>
      <SearchResults />
    </Suspense>
  )
}
