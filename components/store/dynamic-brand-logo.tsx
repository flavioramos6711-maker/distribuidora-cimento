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
  // Usa logo do dashboard, ou o logo padrão gerado
  const logoUrl = row?.logo_url?.trim() || "/images/logo-cimentoecal.jpg"

  const h = variant === "compact" ? 48 : 56
  const wMax = variant === "compact" ? 200 : 280

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

  // Mostra a imagem do logo (dashboard ou padrão)
  return (
    <Link href="/" className={cn("flex items-center", className)}>
      <Image
        src={logoUrl}
        alt={SITE.shortName}
        width={wMax}
        height={h}
        unoptimized
        className="h-12 w-auto max-w-[200px] object-contain object-left sm:h-14 sm:max-w-[280px]"
        priority
      />
    </Link>
  )
}
