"use client"

import useSWR from "swr"
import { Building2, ShieldCheck, Truck, TrendingUp } from "lucide-react"
import { getSiteSettingsPublic } from "@/lib/fetchers/site-settings-public"
import { resolveInstitutionalBody, resolveInstitutionalTitle } from "@/lib/site-settings"

const pillars = [
  { icon: Building2, label: "Escala e estrutura", desc: "Fornecimento contínuo para obras de todos os portes." },
  { icon: ShieldCheck, label: "Confiança e segurança", desc: "Materiais com rastreio e parcerias sólidas no setor." },
  { icon: Truck, label: "Logística ágil", desc: "Entregas organizadas para manter seu cronograma em dia." },
  { icon: TrendingUp, label: "Autoridade no setor", desc: "Experiência em materiais de construção e atacado." },
]

export default function InstitutionalSection() {
  const { data: row } = useSWR("site-settings-public", getSiteSettingsPublic, { revalidateOnFocus: false })

  const title = resolveInstitutionalTitle(row ?? null)
  const body = resolveInstitutionalBody(row ?? null)

  return (
    <section className="border-y border-border/40 bg-gradient-to-b from-muted/40 via-background to-background">
      <div className="mx-auto max-w-7xl px-3 py-10 sm:px-4 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Institucional</p>
          <h2 className="mt-3 text-balance font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">{body}</p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {pillars.map((p) => (
            <div
              key={p.label}
              className="group flex gap-4 rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-app"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 transition group-hover:bg-primary/15">
                <p.icon className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{p.label}</p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground sm:text-[13px]">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
