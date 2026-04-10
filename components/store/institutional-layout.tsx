import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import type { ReactNode } from "react"

export default function InstitutionalLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-[60vh] bg-muted/20">
      <div className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar à loja
          </Link>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle ? <p className="text-muted-foreground mt-3 text-sm md:text-base leading-relaxed">{subtitle}</p> : null}
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <article className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          <div className="space-y-4 text-sm md:text-[15px] text-foreground/90 leading-relaxed">{children}</div>
        </article>
      </div>
    </div>
  )
}
