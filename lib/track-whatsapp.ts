import type { WaClickSource } from "@/lib/wa-analytics-sources"

/** Registra clique antes de abrir o WhatsApp (fire-and-forget) */
export function trackWhatsAppClick(source: WaClickSource, page?: string, userId?: string | null) {
  if (typeof window === "undefined") return
  const body = JSON.stringify({ source, page: page ?? window.location.pathname, userId: userId ?? null })
  void fetch("/api/analytics/whatsapp-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {})
}
