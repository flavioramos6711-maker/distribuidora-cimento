"use client"

import useSWR from "swr"
import { Building2, ShieldCheck, Truck, Award, CheckCircle2, Warehouse, Timer, Star, ArrowRight } from "lucide-react"
import { getSiteSettingsPublic } from "@/lib/fetchers/site-settings-public"
import { cn } from "@/lib/utils"
import Link from "next/link"

const pillars = [
  {
    icon: Warehouse,
    label: "Escala Industrial",
    desc: "Fornecimento contínuo para obras de todos os portes.",
    stat: "3.800+",
    statLabel: "produtos",
    accent: "#F47920",
  },
  {
    icon: CheckCircle2,
    label: "Certificação ABNT",
    desc: "Materiais rastreados com parcerias sólidas no setor.",
    stat: "100%",
    statLabel: "certificado",
    accent: "#2563eb",
  },
  {
    icon: Timer,
    label: "Logística Inteligente",
    desc: "Entregas pontuais para manter seu cronograma em dia.",
    stat: "48h",
    statLabel: "prazo médio",
    accent: "#F47920",
  },
  {
    icon: Star,
    label: "Autoridade Atacadista",
    desc: "Mais de 20 anos de experiência no mercado.",
    stat: "20+",
    statLabel: "anos",
    accent: "#2563eb",
  },
]

export default function InstitutionalSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Top divider accent */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />

      {/* Stats Band - Clean & Breathable Light Architecture */}
      <div className="bg-slate-50/70 border-y border-slate-200/70 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-slate-200">
            {pillars.map((p) => (
              <div key={p.label} className="flex flex-col items-center lg:items-start gap-1 px-0 lg:px-8 text-center lg:text-left group">
                <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none" style={{ color: p.accent === "#F47920" ? "#F47920" : "#0f172a" }}>
                  {p.stat}
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{p.statLabel}</p>
                <p className="text-xs text-slate-500 font-medium mt-1 hidden sm:block">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative py-20 sm:py-28">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-50 rounded-full blur-[120px] -mr-64 -mt-64 opacity-60" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] -ml-32 -mb-32 opacity-50" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start">

            {/* Left: Text */}
            <div className="flex-1 space-y-8 max-w-xl">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="h-1 w-10 rounded-full bg-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Nossa Identidade</span>
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">
                  Compromisso com a{" "}
                  <span className="text-blue-600 italic">sua obra.</span>
                </h2>
              </div>

              <p className="text-base text-slate-500 leading-relaxed font-medium">
                Somos o parceiro estratégico de construtoras e lojistas em todo o Brasil. Infraestrutura completa, melhores preços do mercado e logística própria de alta performance para garantir que sua obra nunca pare.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="/produtos"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 text-sm font-black text-white hover:bg-slate-800 shadow-md transition-all"
                >
                  Ver catálogo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/sobre"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-7 text-sm font-black text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-colors"
                >
                  Sobre nós
                </Link>
              </div>
            </div>

            {/* Right: Pillar Cards */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
              {pillars.map((p) => (
                <div
                  key={p.label}
                  className="group relative bg-white p-7 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-600/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: p.accent + "18", color: p.accent }}
                  >
                    <p.icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">{p.label}</h3>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>

                  {/* Accent corner */}
                  <div
                    className="absolute top-0 right-0 h-1 w-16 rounded-bl-lg transition-all duration-300 group-hover:w-full"
                    style={{ background: p.accent }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
