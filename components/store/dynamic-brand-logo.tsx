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
  
  // Tamanhos responsivos - LOGO BEM GRANDE
  const sizeClasses = variant === "compact" 
    ? "h-12 sm:h-14" // Versão compacta
    : "h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32" // Header: 64px, 80px, 96px, 112px, 128px

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("flex items-center", className)}>
        <div className={cn("animate-pulse rounded-lg bg-muted/60 w-48 sm:w-60 md:w-72 lg:w-96", sizeClasses)} />
      </div>
    )
  }

  // Mostra a imagem do logo
  return (
    <Link 
      href="/" 
      className={cn(
        "flex items-center shrink-0 transition-transform hover:scale-[1.01] active:scale-[0.99]",
        className
      )}
    >
      <Image
        src={logoUrl}
        alt={SITE.shortName}
        width={600}
        height={150}
        unoptimized
        className={cn(
          "w-auto max-w-[220px] sm:max-w-[300px] md:max-w-[380px] lg:max-w-[480px] xl:max-w-[550px] object-contain object-left",
          sizeClasses
        )}
        priority
      />
    </Link>
  )
}
