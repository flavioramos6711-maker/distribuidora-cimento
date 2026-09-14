"use client"

import { ArrowRight } from "lucide-react"
import { waLink } from "@/lib/site-config"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"

export default function HomeWhatsAppCta() {
  return (
    <a
      href={waLink("Olá! Gostaria de fazer um orçamento.")}
      target="_blank"
      rel="noopener noreferrer"
      className="group/btn relative flex h-16 sm:h-20 w-full sm:w-auto sm:min-w-[280px] items-center justify-center gap-3 rounded-2xl bg-white text-base sm:text-lg font-black text-slate-950 shadow-xl transition-all duration-300 hover:bg-slate-100 hover:scale-105 active:scale-95"
      onClick={() => trackWhatsAppClick("home_cta")}
    >
      <span className="relative z-10">FALAR COM VENDEDOR</span>
      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1 text-blue-600" />
    </a>
  )
}
