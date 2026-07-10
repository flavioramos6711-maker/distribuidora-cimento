import type { WaClickSource } from "@/lib/wa-analytics-sources"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

/** Dispara evento de conversão no Meta Pixel (Contact) */
function fireMetaPixelContact(source: WaClickSource) {
  try {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "Contact", { content_name: source })
    }
  } catch (_) {}
}

/** Registra clique antes de abrir o WhatsApp (fire-and-forget) */
export function trackWhatsAppClick(source: WaClickSource, page?: string, userId?: string | null) {
  if (typeof window === "undefined") return

  // 1. Dispara conversão no Meta Pixel
  fireMetaPixelContact(source)

  // 2. Salva no banco interno (Supabase analytics)
  const body = JSON.stringify({ source, page: page ?? window.location.pathname, userId: userId ?? null })
  void fetch("/api/analytics/whatsapp-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {})
}

