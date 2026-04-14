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
    <div className="min-h-[60vh]">
      <div className="border-b border-border/60 bg-card/90 shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:rounded-b-3xl md:py-10">
          <Link
            href="/"
            className="mb-6 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            Voltar à loja
          </Link>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{subtitle}</p> : null}
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <article className="rounded-2xl border border-border/50 bg-card p-6 shadow-app sm:rounded-3xl md:p-8">
          <div className="space-y-4 text-sm md:text-[15px] text-foreground/90 leading-relaxed">{children}</div>
        </article>
      </div>
    </div>
  )
}
