"use client"

import { MessageCircle } from "lucide-react"
import { waLink } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"
import type { WaClickSource } from "@/lib/wa-analytics-sources"

export default function WhatsAppCta({
  source,
  page,
  userId,
  text = "Olá! Gostaria de falar com o Atacado de Construção.",
  label = "Falar no WhatsApp",
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
      onClick={() => trackWhatsAppClick(source, page, userId)}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30",
        variant === "solid" &&
          "border border-emerald-600/30 bg-emerald-600 text-white shadow-sm hover:bg-emerald-600/90 active:scale-[0.99]",
        variant === "outline" &&
          "border border-border bg-background text-foreground hover:border-emerald-500/35 hover:bg-emerald-500/[0.06]",
        className,
      )}
    >
      <MessageCircle
        className={cn("w-4 h-4 shrink-0", variant === "solid" ? "text-white/95" : "text-emerald-600")}
        aria-hidden
      />
      {label}
    </a>
  )
}
