/** Dados da loja — e-mail e site alinhados ao domínio oficial */
export const SITE = {
  legalName: "Atacado de Construção",
  shortName: "Atacado de Construção",
  tagline: "Materiais de construção com força, confiança e logística profissional.",
  whatsappE164: "5516996447972",
  phoneDisplay: "(16) 9 9644-7972",
  email: "contato@atacadodeconstrucao.com",
  website: "https://www.atacadodeconstrucao.com",
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
