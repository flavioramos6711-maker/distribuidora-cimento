"use client"

import Link from "next/link"
import { Phone } from "lucide-react"
import { SITE } from "@/lib/site-config"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"

export default function Topbar() {
  return (
    <div className="w-full bg-[#0B0F19] text-slate-300 border-b border-slate-800/80 shadow-xs">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 sm:px-10 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Televendas:</span>
            <a
              href={`tel:+${SITE.whatsappE164}`}
              onClick={() => trackWhatsAppClick("topbar_phone")}
              data-source="topbar_phone"
              data-track="btn_whatsapp"
              data-button-name="btn_whatsapp"
              data-name="btn_whatsapp"
              className="flex items-center gap-1.5 text-white hover:text-blue-400 transition-colors font-black tracking-widest btn-whatsapp-track"
            >
              <Phone className="h-3 w-3 text-blue-500" />
              {SITE.phoneDisplay}
            </a>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Suporte:</span>
            <span className="text-slate-200 font-black">{SITE.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black tracking-widest text-emerald-400">Logística em Tempo Real</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <Link href="/promocoes" className="flex items-center gap-2 text-slate-300 hover:text-white transition-all group">
            <span className="text-slate-500 group-hover:text-slate-300 transition-colors">Ofertas Especiais</span>
            <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter">VER AGORA</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
