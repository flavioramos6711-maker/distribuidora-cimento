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
  
  // Tamanhos responsivos baseados na variante
  const sizeClasses = variant === "compact" 
    ? "h-8 sm:h-10" // Versão compacta (footer, mobile menu)
    : "h-11 sm:h-14 md:h-16 lg:h-[70px]" // Versão completa (header principal)

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("flex items-center", className)}>
        <div className={cn("animate-pulse rounded-lg bg-muted/60 w-32 sm:w-44 md:w-52", sizeClasses)} />
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
        width={400}
        height={100}
        unoptimized
        className={cn(
          "w-auto object-contain object-left",
          sizeClasses
        )}
        priority
      />
    </Link>
  )
}
