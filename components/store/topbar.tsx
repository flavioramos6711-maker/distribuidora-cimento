"use client"

import Link from "next/link"
import { SITE } from "@/lib/site-config"

export default function Topbar() {
  return (
    <div className="w-full bg-[#002D5B] text-white/70 border-b border-white/5">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-10 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="opacity-40">Televendas:</span>
            <a href={`tel:+${SITE.whatsappE164}`} className="text-white hover:text-primary transition-colors font-black tracking-widest">{SITE.phoneDisplay}</a>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="opacity-40">Suporte:</span>
            <span className="text-white/90 font-black">{SITE.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black tracking-widest text-emerald-400">Logística em Tempo Real</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <Link href="/promocoes" className="flex items-center gap-2 text-white hover:text-primary transition-all group">
            <span className="opacity-40 group-hover:opacity-100 transition-opacity">Ofertas Especiais</span>
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter">VER AGORA</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
