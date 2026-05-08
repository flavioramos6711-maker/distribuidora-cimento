"use client"

import useSWR from "swr"
import { Building2, ShieldCheck, Truck, Award, CheckCircle2, Warehouse, Timer, Star } from "lucide-react"
import { getSiteSettingsPublic } from "@/lib/fetchers/site-settings-public"
import { cn } from "@/lib/utils"

const pillars = [
  { 
    icon: Warehouse, 
    label: "Escala Industrial", 
    desc: "Fornecimento contínuo para obras de todos os portes.",
    color: "bg-secondary/5 text-secondary"
  },
  { 
    icon: CheckCircle2, 
    label: "Certificação ABNT", 
    desc: "Materiais com rastreio e parcerias sólidas no setor.",
    color: "bg-primary/5 text-primary"
  },
  { 
    icon: Timer, 
    label: "Logística Inteligente", 
    desc: "Entregas organizadas para manter seu cronograma em dia.",
    color: "bg-secondary/5 text-secondary"
  },
  { 
    icon: Star, 
    label: "Autoridade Atacadista", 
    desc: "Mais de 20 anos de experiência no mercado de construção.",
    color: "bg-primary/5 text-primary"
  },
]

export default function InstitutionalSection() {
  const { data: row } = useSWR("site-settings-public", getSiteSettingsPublic, { revalidateOnFocus: false })

  const title = "Referência em Atacado de Construção"
  const body = "Somos o parceiro estratégico de construtoras e lojistas em todo o país. Oferecemos uma infraestrutura completa para garantir que sua obra nunca pare, com os melhores preços do mercado e logística própria de alta performance."

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-50 rounded-full blur-[120px] -mr-96 -mt-96 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -ml-64 -mb-64 opacity-40" />
      
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          {/* Left Column: Text Content */}
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="h-1.5 w-12 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  Nossa Identidade
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-secondary tracking-tighter leading-[1.05]">
                Compromisso com a <br/>
                <span className="text-primary italic">sua produtividade.</span>
              </h2>
            </div>

            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
              {body}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10 pt-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary shadow-lg shadow-secondary/10">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary/60">Segurança de<br/>Ponta a Ponta</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary shadow-lg shadow-secondary/10">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary/60">Qualidade<br/>Certificada</span>
                </div>
            </div>
          </div>

          {/* Right Column: Grid of Pillars */}
          <div className="flex-1 w-full">
            <div className="grid gap-6 sm:grid-cols-2">
              {pillars.map((p, i) => (
                <div
                  key={p.label}
                  className="group relative bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-app hover:shadow-app-lg hover:border-primary/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                    p.color
                  )}>
                    <p.icon className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <h3 className="text-xl font-bold text-secondary tracking-tight group-hover:text-primary transition-colors">
                        {p.label}
                    </h3>
                    <p className="text-xs font-semibold text-muted-foreground leading-relaxed uppercase tracking-[0.1em]">
                        {p.desc}
                    </p>
                  </div>

                  {/* Corner Accent Illustration */}
                  <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
                    <p.icon className="w-32 h-32 rotate-12" />
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
