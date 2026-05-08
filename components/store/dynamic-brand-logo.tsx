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
}: {
  variant?: Variant
  className?: string
  inverted?: boolean
}) {
  const { data: row, isLoading } = useSWR("site-settings-public", getSiteSettingsPublic, { revalidateOnFocus: false })
  // Usa logo do dashboard, ou o logo padrão
  const logoUrl = row?.logo_url?.trim() || "/images/logo-cimentoecal.jpg"
  
  // Tamanhos responsivos baseados na variante - LOGO GRANDE E PROFISSIONAL
  const sizeClasses = variant === "compact" 
    ? "h-10 sm:h-12" // Versão compacta (footer, mobile menu)
    : "h-14 sm:h-16 md:h-20 lg:h-24" // Versão completa (header principal) - 56px, 64px, 80px, 96px

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("flex items-center", className)}>
        <div className={cn("animate-pulse rounded-lg bg-muted/60 w-40 sm:w-52 md:w-64 lg:w-80", sizeClasses)} />
      </div>
    )
  }

  // Mostra a imagem do logo
  return (
    <Link 
      href="/" 
      className={cn(
        "flex items-center shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      <Image
        src={logoUrl}
        alt={SITE.shortName}
        width={500}
        height={120}
        unoptimized
        className={cn(
          "w-auto max-w-[200px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-[400px] object-contain object-left",
          sizeClasses
        )}
        priority
      />
    </Link>
  )
}
