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

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("flex items-center", className)}>
        <div className="animate-pulse rounded bg-muted h-10 w-40 sm:h-12 sm:w-52" />
      </div>
    )
  }

  // Mostra a imagem do logo (dashboard ou padrão)
  return (
    <Link href="/" className={cn("flex items-center shrink-0", className)}>
      <Image
        src={logoUrl}
        alt={SITE.shortName}
        width={320}
        height={80}
        unoptimized
        className="h-10 w-auto object-contain object-left sm:h-12 md:h-14 lg:h-16"
        priority
      />
    </Link>
  )
}
