import type { WaClickSource } from "@/lib/wa-analytics-sources"

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    gtag?: (...args: unknown[]) => void
  }
}

interface TrackOptions {
  transactionId?: string
  value?: number
  currency?: string
  email?: string
}

/** Registra clique antes de abrir o WhatsApp (fire-and-forget) */
export function trackWhatsAppClick(
  source: WaClickSource,
  page?: string,
  userId?: string | null,
  options?: TrackOptions
) {
  if (typeof window === "undefined") return
  
  const currentPage = page ?? window.location.pathname
  
  // 1. Dispara evento no dataLayer para o GTM
  // Compatível com acionadores: "Click to Chat", "Acionador wa.me", "Acionador WhatsApp"
  window.dataLayer = window.dataLayer || []
  
  // Push de variáveis primeiro (para GTM capturar)
  window.dataLayer.push({
    transactionId: options?.transactionId || "",
    transactionTotal: options?.value || 0,
    transactionCurrency: options?.currency || "BRL",
    userEmail: options?.email || "",
    clickSource: source,
    clickPage: currentPage,
  })
  
  // Push do evento "Click to Chat" (compatível com seu acionador)
  window.dataLayer.push({
    event: "Click to Chat",
    eventCategory: "WhatsApp",
    eventAction: "click",
    eventLabel: source,
  })
  
  // Push de evento "whatsapp_conversion" para conversões
  if (options?.transactionId) {
    window.dataLayer.push({
      event: "whatsapp_conversion",
      ecommerce: {
        transaction_id: options.transactionId,
        value: options.value,
        currency: options.currency || "BRL",
      },
    })
  }
  
  // 2. Dispara conversão direta do Google Ads (backup caso GTM falhe)
  if (typeof window.gtag === "function" && options?.transactionId) {
    window.gtag("event", "conversion", {
      send_to: "AW-16526087847/oaK8CIry9L4aEJbA05c_",
      transaction_id: options.transactionId,
      value: options.value,
      currency: options.currency || "BRL",
    })
  }
  
  // 3. Registra no backend interno
  const body = JSON.stringify({ 
    source, 
    page: currentPage, 
    userId: userId ?? null 
  })
  void fetch("/api/analytics/whatsapp-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {})
}
