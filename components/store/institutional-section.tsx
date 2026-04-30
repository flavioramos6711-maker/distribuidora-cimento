"use client"

import useSWR from "swr"
import { Building2, ShieldCheck, Truck, Award, CheckCircle2, Warehouse, Timer, Star } from "lucide-react"
import { getSiteSettingsPublic } from "@/lib/fetchers/site-settings-public"
import { resolveInstitutionalBody, resolveInstitutionalTitle } from "@/lib/site-settings"
import { cn } from "@/lib/utils"

const pillars = [
  { 
    icon: Warehouse, 
    label: "Escala e estrutura", 
    desc: "Fornecimento contínuo para obras de todos os portes.",
    color: "bg-blue-50 text-blue-600"
  },
  { 
    icon: CheckCircle2, 
    label: "Confiança e segurança", 
    desc: "Materiais com rastreio e parcerias sólidas no setor.",
    color: "bg-emerald-50 text-emerald-600"
  },
  { 
    icon: Timer, 
    label: "Logística ágil", 
    desc: "Entregas organizadas para manter seu cronograma em dia.",
    color: "bg-amber-50 text-amber-600"
  },
  { 
    icon: Star, 
    label: "Autoridade no setor", 
    desc: "Experiência em materiais de construção e atacado.",
    color: "bg-purple-50 text-purple-600"
  },
]

export default function InstitutionalSection() {
  const { data: row } = useSWR("site-settings-public", getSiteSettingsPublic, { revalidateOnFocus: false })

  // Prioritize the user's provided text for credibility
  const title = "Referência em materiais de construção"
  const body = "A empresa é referência no setor de materiais de construção, oferecendo qualidade, segurança e entrega garantida. Nosso compromisso é com obras seguras, clientes satisfeitos e fornecimento contínuo para construção civil."

  return (
    <section className="relative py-24 overflow-hidden bg-white border-y border-slate-100">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl -mr-64 -mt-64 opacity-50" />
      
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-[#002D5B] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#002D5B]">Institucional</span>
            </div>
            
            <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-black text-[#002D5B] tracking-tight leading-[1.1] italic">
                    {title}
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    {body}
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4 grayscale opacity-40">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Qualidade Garantida</span>
                </div>
                <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Empresa Certificada</span>
                </div>
            </div>
          </div>

          {/* Right Column: Grid of Pillars */}
          <div className="flex-1 w-full max-w-2xl">
            <div className="grid gap-4 sm:grid-cols-2">
              {pillars.map((p, i) => (
                <div
                  key={p.label}
                  className="group relative bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:border-[#002D5B]/10 hover:-translate-y-1 transition-all duration-500"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                    p.color
                  )}>
                    <p.icon className="w-7 h-7" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#002D5B] tracking-tight group-hover:text-[#F47920] transition-colors">
                        {p.label}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed uppercase tracking-wide">
                        {p.desc}
                    </p>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity">
                    <p.icon className="w-12 h-12 rotate-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
