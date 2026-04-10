import type { Metadata } from "next"
import InstitutionalLayout from "@/components/store/institutional-layout"
import WhatsAppCta from "@/components/store/whatsapp-cta"

export const metadata: Metadata = {
  title: "Formas de pagamento",
}

export default function FormasPagamentoPage() {
  return (
    <InstitutionalLayout
      title="Formas de pagamento"
      subtitle="Condições comerciais alinhadas ao perfil B2B e B2C."
    >
      <p>
        As formas de pagamento disponíveis variam conforme análise de crédito, histórico e porte do pedido.
        A confirmação é sempre enviada pelo setor financeiro após o orçamento.
      </p>
      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
        <li>PIX e transferência bancária</li>
        <li>Cartão (quando disponível para a operação)</li>
        <li>Condições para CNPJ e prazo negociado</li>
      </ul>
      <p>
        Para valores, limites e parcelamento, solicite uma proposta formal pelo WhatsApp ou e-mail com a lista
        de materiais e dados da empresa.
      </p>
      <div className="not-prose pt-4">
        <WhatsAppCta
          source="contact_page"
          page="/formas-de-pagamento"
          text="Olá! Gostaria de saber as formas de pagamento para meu pedido."
          label="Falar com o financeiro"
        />
      </div>
    </InstitutionalLayout>
  )
}
