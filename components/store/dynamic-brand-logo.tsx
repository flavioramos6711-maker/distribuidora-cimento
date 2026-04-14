"use client"

import useSWR from "swr"
import Image from "next/image"
import { cn } from "@/lib/utils"
import BrandLogo from "@/components/store/brand-logo"
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
  const { data: row } = useSWR("site-settings-public", getSiteSettingsPublic, { revalidateOnFocus: false })
  const url = row?.logo_url?.trim()

  if (!url) {
    return <BrandLogo variant={variant} className={className} inverted={inverted} />
  }

  const h = variant === "compact" ? 36 : 44
  const wMax = variant === "compact" ? 140 : 200

  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        variant === "mono" && "text-foreground",
        inverted && "text-white",
        className,
      )}
    >
      <Image
        src={url}
        alt={SITE.shortName}
        width={wMax}
        height={h}
        unoptimized
        className="h-9 w-auto max-w-[min(100%,var(--logo-max,200px))] object-contain object-left sm:h-11"
        style={{ ["--logo-max" as string]: `${wMax}px` }}
        priority
      />
      {variant !== "compact" && (
        <div className="leading-tight hidden sm:block">
          <p
            className={cn(
              "font-heading font-bold text-[15px] sm:text-base tracking-tight",
              inverted ? "text-white" : "text-foreground",
            )}
          >
            {SITE.shortName}
          </p>
          <p
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.14em]",
              inverted ? "text-white/60" : "text-muted-foreground",
            )}
          >
            Distribuidora
          </p>
        </div>
      )}
    </div>
  )
}
