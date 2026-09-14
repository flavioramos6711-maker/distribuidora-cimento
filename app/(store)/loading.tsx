// =============================================================================
// LOADING STATE — app/(store)/loading.tsx
// Exibe skeleton/spinner enquanto dados são carregados
// Garante que o usuário nunca veja tela branca
// =============================================================================

import { Loader2, Package } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar skeleton */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-32 bg-muted rounded-lg" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-32 bg-muted rounded-lg" />
            <Skeleton className="h-8 w-24 bg-muted rounded-lg" />
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* Hero skeleton */}
        <div className="mb-12">
          <Skeleton className="h-4 w-48 bg-muted rounded mb-4" />
          <Skeleton className="h-10 w-96 bg-muted rounded-lg mb-3" />
          <Skeleton className="h-6 w-72 bg-muted rounded" />
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-2xl border border-border bg-card p-6">
              <Skeleton className="h-48 w-full bg-muted rounded-xl" />
              <Skeleton className="h-4 w-3/4 bg-muted rounded" />
              <Skeleton className="h-4 w-1/2 bg-muted rounded" />
              <Skeleton className="h-8 w-full bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      </main>

      {/* Footer skeleton */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Skeleton className="h-16 w-full bg-muted rounded-lg" />
        </div>
      </footer>

      {/* Global spinner overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#002D5B] px-4 py-2 text-white shadow-lg">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Carregando loja...</span>
      </div>
    </div>
  )
}