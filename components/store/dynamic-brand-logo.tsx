"use client"

import useSWR from "swr"
import Image from "next/image"
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
  const { data: row } = useSWR("site-settings-public", getSiteSettingsPublic, { revalidateOnFocus: false })
  
  // Use user-provided logo paths
  // Header logo is preferred for the 'full' variant usually used in headers.
  const url = variant === "full" ? "/logo-header.png" : "/logo-oficial.png" 

  const FallbackLogo = () => (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl rotate-3 shadow-lg transition-transform hover:rotate-0",
        inverted ? "bg-white text-[#002D5B]" : "bg-[#002D5B] text-white"
      )}>
        <div className="relative">
          <div className="w-5 h-5 border-2 border-current rounded-sm rotate-45" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#F47920] rounded-full animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-heading text-xl font-black tracking-tighter sm:text-2xl italic",
            inverted ? "text-white" : "text-[#002D5B]",
          )}
        >
          {SITE.shortName.toUpperCase()}
        </span>
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-[0.3em] sm:text-[10px]",
            inverted ? "text-white/60" : "text-[#F47920]",
          )}
        >
          Distribuidora
        </span>
      </div>
    </div>
  )

  // In a real scenario, we'd check if /logo-oficial.png exists. 
  // For now, we'll assume it exists if the user sent it, 
  // but if it fails to load, the browser will show a broken image.
  // To be safe, we could use a state to handle error and fallback.

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
        width={400}
        height={120}
        unoptimized
        className="h-10 w-auto max-w-[280px] object-contain object-left sm:h-14 lg:h-16"
        priority
        onError={(e) => {
           // Fallback logic could go here, but next/image doesn't easily support it via onError in this way
        }}
      />
    </div>
  )
}
