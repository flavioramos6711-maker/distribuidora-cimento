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
  
  // 1. Dispara evento no dataLayer para o GTM (Click to Chat)
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: "Click to Chat",
    eventCategory: "WhatsApp",
    eventAction: "click",
    eventLabel: source,
    page: currentPage,
    transactionId: options?.transactionId,
    transactionValue: options?.value,
    transactionCurrency: options?.currency || "BRL",
    userEmail: options?.email,
  })
  
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
