// =============================================================================
// RASTREAMENTO DE WHATSAPP — COM INTEGRAÇÃO GOOGLE ADS
// =============================================================================
// Rastreia cliques no WhatsApp e dispara conversões do Google Ads
// e eventos do Google Tag Manager para remarketing.
// =============================================================================

import type { WaClickSource } from "@/lib/wa-analytics-sources"
import { fireWhatsappConversion, fireRemarketingEvent } from "@/lib/google-ads"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/**
 * Dispara evento de conversão no Meta Pixel (Contact)
 */
function fireMetaPixelContact(source: WaClickSource) {
  try {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "Contact", {
        content_name: "btn_whatsapp",
        button_name: "btn_whatsapp",
        source: source,
      })
    }
  } catch (_) {}
}

/**
 * Registra clique antes de abrir o WhatsApp
 * - Dispara conversão Google Ads (se configurado)
 * - Dispara Meta Pixel Contact
 * - Salva no banco interno (Supabase analytics)
 * - Dispara evento GTM para remarketing
 */
export function trackWhatsAppClick(
  source: WaClickSource,
  page?: string,
  userId?: string | null
) {
  if (typeof window === "undefined") return

  const pagePath = page ?? window.location.pathname

  // Dispara evento para o Google Tag Manager (GTM)
  try {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: "whatsapp_click",
        button_name: "btn_whatsapp",
        event_label: "btn_whatsapp",
        wa_source: source,
        page_path: pagePath,
      })
    }
  } catch (_) {}

  // 1. Dispara conversão no Meta Pixel
  fireMetaPixelContact(source)

  // 2. Dispara conversão no Google Ads
  fireWhatsappConversion(source, pagePath)

  // 3. Dispara evento de remarketing (usuário não converteu ainda)
  fireRemarketingEvent(source)

  // 4. Salva no banco interno (Supabase analytics)
  const body = JSON.stringify({ source, page: pagePath, userId: userId ?? null })
  void fetch("/api/analytics/whatsapp-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {})
}

/**
 * Dispara conversão de "add to cart" (adicionar ao orçamento) para Google Ads
 */
export function trackAddToCart(
  productId: string,
  productName: string,
  price: number,
  unit: string
) {
  if (typeof window === "undefined") return

  // Dispara evento no dataLayer para GTM
  if (typeof window.dataLayer !== "undefined") {
    window.dataLayer.push({
      event: "add_to_cart",
      ecommerce: {
        currency: "BRL",
        value: price,
        items: [
          {
            item_id: productId,
            item_name: productName,
            price: price,
            currency: "BRL",
            quantity: 1,
          },
        ],
      },
    })
  }

  // Dispara conversão direta no Google Ads
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", "add_to_cart", {
        send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_ADD_TO_CART_ID || "",
        value: price,
        currency: "BRL",
        items: [
          {
            item_id: productId,
            item_name: productName,
            price: price,
            currency: "BRL",
            quantity: 1,
          },
        ],
      })
    }
  } catch (_) {}
}

/**
 * Dispara conversão de compra/lead para Google Ads
 */
export function trackPurchase(
  orderId: string,
  totalValue: number,
  items: Array<{ id: string; name: string; price: number; quantity: number }>
) {
  if (typeof window === "undefined") return

  // Dispara evento no dataLayer para GTM
  if (typeof window.dataLayer !== "undefined") {
    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        transaction_id: orderId,
        value: totalValue,
        currency: "BRL",
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    })
  }

  // Dispara conversão direta no Google Ads
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", "purchase", {
        send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_ID || "",
        transaction_id: orderId,
        value: totalValue,
        currency: "BRL",
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      })
    }
  } catch (_) {}
}

/**
 * Inicializa o dataLayer para Google Ads e GTM
 */
export function initTracking() {
  if (typeof window === "undefined") return

  // Inicializa dataLayer
  window.dataLayer = window.dataLayer || []

  // Dispara evento de página view
  if (typeof window.gtag === "function") {
    window.gtag("js", new Date())
    window.gtag("config", process.env.NEXT_PUBLIC_GA_ID || "", {
      send_page_view: true,
      custom_map: {
        dimension1: "page_type",
        dimension2: "user_type",
      },
    })
  }
}
