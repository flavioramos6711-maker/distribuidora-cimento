"use client"

import { Building2, FileSpreadsheet, Truck, ShieldCheck, ArrowRight, MessageSquare, Clock, CheckCircle2 } from "lucide-react"
import { waLink } from "@/lib/site-config"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"

export default function ProSolutionsSection() {
  const waCotacaoHref = waLink(
    "Olá! Sou profissional da construção / construtora e gostaria de cotar uma lista de materiais com condições de atacado para minha obra."
  )

  const benefits = [
    {
      icon: FileSpreadsheet,
      title: "Cotação Ágil de Lista de Obra",
      desc: "Envie sua planilha ou foto da lista de materiais e receba os melhores preços de atacado em até 15 minutos.",
    },
    {
      icon: Building2,
      title: "Faturamento Direto no CNPJ",
      desc: "Condições exclusivas para construtoras, empreiteiros e lojistas com emissão de NF e boleto a prazo.",
    },
    {
      icon: Truck,
      title: "Logística Pesada no Canteiro",
      desc: "Frota própria e parceira para descarregar cimento, areia, blocos e telhas direto na sua obra com pontualidade.",
    },
    {
      icon: ShieldCheck,
      title: "Lotes Certificados ABNT",
      desc: "Produtos 100% originais das marcas líderes (Votoran, Quartzolit, Gerdau, Tigre, Brasilit) com laudo de fábrica.",
    },
  ]

  return (
    <section className="py-10 sm:py-16 bg-slate-900 text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F47920]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#002D5B]/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 mb-10 sm:mb-12">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F47920]/20 border border-[#F47920]/40 text-[#F47920]">
              <span className="w-2 h-2 rounded-full bg-[#F47920] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Espaço do Profissional & Construtora
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Preço de Usina para Sua Obra <br className="hidden sm:inline" />
              <span className="text-[#F47920]">Não Ficar Parada.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              Atendemos mestres de obras, engenheiros e construtoras com preços escalonados por volume e entrega programada.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <a
              href={waCotacaoHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("pro_solutions_banner", "/")}
              className="inline-flex h-13 px-8 items-center justify-center gap-3 rounded-2xl bg-[#25D366] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#25D366]/25 hover:bg-[#20bd5a] hover:scale-105 active:scale-95 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Cotar Lista no WhatsApp
            </a>
          </div>
        </div>

        {/* Grid de 4 Pilares Obramax */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-[#F47920]/50 hover:bg-white/[0.07] transition-all duration-300 flex flex-col gap-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#F47920] group-hover:bg-[#F47920] group-hover:text-white transition-all">
                <b.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white leading-snug">
                {b.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
