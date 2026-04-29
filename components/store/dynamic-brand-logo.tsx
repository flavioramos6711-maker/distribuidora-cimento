"use client"

import useSWR from "swr"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { SITE } from "@/lib/site-config"
import { getSiteSettingsPublic } from "@/lib/fetchers/site-settings-public"

type Variant = "full" | "compact" | "mono"

export default function DynamicBrandLogo({
  variant = "full",
  className,
  inverted = false,
}: {
  variant?: Variant
  className?: string
  inverted?: boolean
}) {
  const { data: row, isLoading } = useSWR("site-settings-public", getSiteSettingsPublic, { revalidateOnFocus: false })
  const logoUrl = row?.logo_url?.trim()

  const h = variant === "compact" ? 36 : 44
  const wMax = variant === "compact" ? 160 : 220

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("flex items-center", className)}>
        <div 
          className="animate-pulse rounded bg-muted" 
          style={{ width: wMax * 0.7, height: h }}
        />
      </div>
    )
  }

  // Se nao houver logo cadastrado, mostra apenas o nome do site como texto
  if (!logoUrl) {
    return (
      <Link href="/" className={cn("flex items-center", className)}>
        <span
          className={cn(
            "font-heading font-bold text-lg sm:text-xl tracking-tight",
            inverted ? "text-white" : "text-foreground",
          )}
        >
          {SITE.shortName}
        </span>
      </Link>
    )
  }

  // Mostra apenas a imagem do logo carregada pelo dashboard
  return (
    <Link href="/" className={cn("flex items-center", className)}>
      <Image
        src={logoUrl}
        alt={SITE.shortName}
        width={wMax}
        height={h}
        unoptimized
        className="h-9 w-auto max-w-[160px] object-contain object-left sm:h-11 sm:max-w-[220px]"
        priority
      />
    </Link>
  )
}
