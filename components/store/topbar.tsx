"use client"

import Link from "next/link"
import { Phone, Truck, MapPin, Mail } from "lucide-react"
import { SITE } from "@/lib/site-config"

export default function Topbar() {
  return (
    <div className="w-full bg-[#002D5B]/95 backdrop-blur-md text-white/90 border-b border-white/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] sm:text-[11px]">
        <div className="flex items-center gap-3">
          <span className="opacity-50">Televendas</span>
          <div className="flex items-center gap-2 text-[#F47920]">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <a href={`tel:+${SITE.whatsappE164}`} className="hover:text-white transition-colors">{SITE.phoneDisplay}</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline opacity-50">Ofertas Exclusivas</span>
          <Link href="/promocoes" className="flex items-center gap-2 text-[#F47920] hover:text-white transition-all group">
            Orçamento Relâmpago
            <span className="bg-white/10 px-2.5 py-1 rounded-full text-[9px] group-hover:bg-[#F47920] group-hover:text-white transition-all">Ver Agora</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
