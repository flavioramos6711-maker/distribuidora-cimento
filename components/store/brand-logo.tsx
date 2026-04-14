import { cn } from "@/lib/utils"
import { SITE } from "@/lib/site-config"

type Variant = "full" | "compact" | "mono"

/** Marca corporativa: blocos + traço industrial — simples e memorável */
function LogoMark({
  className,
  mono,
  inverted,
}: {
  className?: string
  mono?: boolean
  inverted?: boolean
}) {
  return (
    <svg viewBox="0 0 44 44" className={cn("shrink-0", className)} aria-hidden>
      <rect
        width="44"
        height="44"
        rx="10"
        className={cn(
          inverted && "fill-white/[0.12]",
          mono && !inverted && "fill-current",
          !mono && !inverted && "fill-secondary",
        )}
      />
      <path
        fill="none"
        stroke={inverted ? "#fb923c" : mono ? "currentColor" : "#ea580c"}
        strokeWidth="2.5"
        strokeLinecap="square"
        d="M12 14h20M12 22h14M12 30h20"
        className={cn(mono && !inverted && "opacity-80")}
      />
      <rect
        x="28"
        y="18"
        width="6"
        height="10"
        rx="1"
        className={cn(
          inverted ? "fill-primary" : "fill-primary",
          mono && !inverted && "fill-current opacity-50",
        )}
      />
    </svg>
  )
}

export default function BrandLogo({
  variant = "full",
  className,
  inverted = false,
}: {
  variant?: Variant
  className?: string
  inverted?: boolean
}) {
  const mono = variant === "mono"

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5",
          mono && "text-foreground",
          inverted && "text-secondary-foreground",
          className,
        )}
      >
        <LogoMark className="w-9 h-9 md:w-10 md:h-10" mono={mono} inverted={inverted} />
        <div className="leading-tight">
          <p
            className={cn(
              "font-heading font-bold text-sm tracking-tight",
              inverted ? "text-white" : "text-foreground",
              mono && "text-inherit",
            )}
          >
            {SITE.shortName}
          </p>
          <p
            className={cn(
              "text-[9px] font-semibold uppercase tracking-[0.15em]",
              inverted ? "text-white/55" : "text-muted-foreground",
            )}
          >
            Distribuidora
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-3", mono && "text-foreground", inverted && "text-white", className)}>
      <LogoMark className="w-10 h-10 sm:w-11 sm:h-11" mono={mono} inverted={inverted} />
      <div className="leading-tight hidden sm:block">
        <p
          className={cn(
            "font-heading font-bold text-[15px] sm:text-base tracking-tight",
            inverted ? "text-white" : "text-foreground",
            mono && "text-inherit",
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
    </div>
  )
}
