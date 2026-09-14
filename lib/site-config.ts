/** Dados da loja — e-mail e site alinhados ao domínio oficial */
export const SITE = {
  legalName: "Cimento & Cal Distribuidora",
  shortName: "C&C Distribuidora",
  tagline: "Sua parceira em materiais de construção: força, confiança e logística profissional.",
  whatsappE164: "5516996536403",
  phoneDisplay: "(16) 99653-6403",
  email: "contato@atacadodeconstrucao.com",
  website: "https://www.atacadodeconstrucao.com",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.atacadodeconstrucao.com",
  address: {
    street: "Rua Igarapava, 73",
    district: "Vila Albertina",
    city: "Ribeirão Preto - SP",
    zip: "CEP 14.075-453",
  },
} as const

export function waLink(text: string) {
  return `https://wa.me/${SITE.whatsappE164}?text=${encodeURIComponent(text)}`
}

export function imageUrl(path: string) {
  return `${SITE.siteUrl}/storage/v1/object/public/${path}`
}
