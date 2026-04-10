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
  text = "Olá! Gostaria de falar com a Cimento & Cal Distribuidora.",
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
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition",
        variant === "solid" && "bg-[#25d366] text-white hover:bg-[#20c15c] shadow-md shadow-[#25d366]/25",
        variant === "outline" &&
          "border-2 border-[#25d366] text-[#128C7E] bg-white hover:bg-[#25d366]/10",
        className,
      )}
    >
      <MessageCircle className="w-5 h-5 shrink-0" aria-hidden />
      {label}
    </a>
  )
}
