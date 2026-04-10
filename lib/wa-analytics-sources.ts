/** Origens rastreadas — alinhado ao dashboard admin */

export const WA_CLICK_SOURCES = [
  "floating_button",
  "checkout_finalize",
  "product_page",
  "contact_page",
  "hero_banner",
  "minha_conta",
] as const

export type WaClickSource = (typeof WA_CLICK_SOURCES)[number]

export function isWaClickSource(s: string): s is WaClickSource {
  return (WA_CLICK_SOURCES as readonly string[]).includes(s)
}

export const WA_SOURCE_LABELS: Record<WaClickSource, string> = {
  floating_button: "Botão flutuante",
  checkout_finalize: "Finalizar compra",
  product_page: "Página de produto",
  contact_page: "Página de contato / institucional",
  hero_banner: "Banner / hero",
  minha_conta: "Minha conta",
}
