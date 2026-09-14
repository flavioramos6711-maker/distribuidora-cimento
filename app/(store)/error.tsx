// =============================================================================
// ERROR BOUNDARY — app/(store)/error.tsx
// Componente de erro com botão "Tentar Novamente" e link para WhatsApp
// Garante que o usuário nunca veja tela branca em caso de falha
// =============================================================================

"use client"

import { useEffect } from "react"
import { RefreshCw, Phone, Home, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { waLink, SITE } from "@/lib/site-config"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error("[Store Error]", error.message, error.digest)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="mx-auto max-w-lg text-center space-y-8">
        {/* Ícone de erro */}
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#002D5B]">
              Ops! Algo deu errado
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Não conseguimos carregar a loja no momento.
            </p>
          </div>
        </div>

        {/* Detalhes do erro (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === "development" && (
          <details className="rounded-xl border border-border bg-muted/30 p-4 text-left">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
              Ver detalhes técnicos
            </summary>
            <pre className="mt-3 text-xs text-destructive whitespace-pre-wrap">
              {error.message}
              {error.digest ? `\nDigest: ${error.digest}` : ""}
            </pre>
          </details>
        )}

        {/* Ações */}
        <div className="flex flex-col gap-3">
          {/* Botão Tentar Novamente */}
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#002D5B] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#002D5B]/20 transition-all hover:bg-[#003d7a] hover:scale-[1.02] active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </button>

          {/* Link para Home */}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-muted/50"
          >
            <Home className="h-4 w-4" />
            Voltar para a Home
          </Link>

          {/* Link para WhatsApp de Suporte */}
          <a
            href={waLink("Olá! Tive um problema ao carregar a loja. Podem me ajudar?")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-6 py-3.5 text-sm font-black text-emerald-700 transition-all hover:bg-emerald-100 hover:border-emerald-300 active:scale-95"
          >
            <Phone className="h-4 w-4 fill-current" />
            Falar com Suporte via WhatsApp
          </a>
        </div>

        {/* Mensagem de suporte */}
        <p className="text-xs text-muted-foreground">
          Se o problema persistir, entre em contato pelo WhatsApp{" "}
          <a
            href={waLink("")}
            className="text-[#002D5B] font-semibold underline underline-offset-2"
          >
            {SITE.phoneDisplay}
          </a>{" "}
          ou{" "}
          <Link href="/contato" className="text-[#002D5B] font-semibold underline underline-offset-2">
            nossa página de contato
          </Link>
          .
        </p>
      </div>
    </div>
  )
}