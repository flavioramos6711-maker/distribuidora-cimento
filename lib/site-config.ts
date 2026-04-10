/** Dados da loja — ajuste CNPJ/e-mail conforme necessário */
export const SITE = {
  legalName: "Cimento & Cal Distribuidora",
  shortName: "Cimento & Cal",
  tagline: "Materiais de construção com força, confiança e logística profissional.",
  whatsappE164: "5516996447972",
  phoneDisplay: "(16) 9 9644-7972",
  email: "contato@cimentoecaldistribuidora.com.br",
  website: "https://www.cimentoecaldistribuidora.com.br",
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
