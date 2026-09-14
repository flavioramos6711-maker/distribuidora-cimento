"use client"

import { ArrowRight } from "lucide-react"
import { waLink } from "@/lib/site-config"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"
import type { WaClickSource } from "@/lib/wa-analytics-sources"
import { cn } from "@/lib/utils"

export default function HomeWhatsAppCta({
  source = "home_cta" as WaClickSource,
  page,
  userId,
  text = "Olá! Gostaria de fazer um orçamento.",
  label = "FALAR COM VENDEDOR",
  className,
  variant = "solid",
}: {
  source: WaClickSource
  page?: string
  userId?: string | null
  text?: string
  label?: string
  className?: string
  variant?: "solid" | "outline"
}) {
  const href = waLink(text)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-track="btn_whatsapp"
      data-button-name="btn_whatsapp"
      data-name="btn_whatsapp"
      data-source={source}
      className="group/btn relative flex h-16 sm:h-20 w-full sm:w-auto sm:min-w-[280px] items-center justify-center gap-3 rounded-2xl btn-whatsapp-track bg-white text-base sm:text-lg font-black text-slate-950 shadow-xl transition-all duration-300 hover:bg-slate-100 hover:scale-105 active:scale-95"
      onClick={() => trackWhatsAppClick(source, page, userId)}
    >
      <span className="relative z-10">FALAR COM VENDEDOR</span>
      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1 text-blue-600" />
    </a>
  )
}