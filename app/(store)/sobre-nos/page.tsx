import type { Metadata } from "next"
import InstitutionalLayout from "@/components/store/institutional-layout"
import { SITE } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Sobre nós",
}

export default function SobreNosPage() {
  return (
    <InstitutionalLayout
      title="Sobre nós"
      subtitle={`${SITE.legalName} — parceira de quem constrói com seriedade.`}
    >
      <p>
        Somos uma distribuidora focada em materiais de construção, com operação organizada para atender obras,
        lojistas e projetos que exigem prazo, estoque confiável e transparência comercial.
      </p>
      <p>
        Nossa proposta une logística enxuta, equipe comercial próxima do cliente e curadoria de produtos
        essenciais para cimento, argamassas, acabamentos e insumos correlatos.
      </p>
      <h2 className="font-heading text-lg font-bold text-foreground pt-2">Missão</h2>
      <p>Entregar materiais de construção com agilidade, previsibilidade e custo competitivo.</p>
      <h2 className="font-heading text-lg font-bold text-foreground pt-2">Visão</h2>
      <p>Ser referência regional em distribuição B2B e B2C com atendimento consultivo.</p>
      <h2 className="font-heading text-lg font-bold text-foreground pt-2">Valores</h2>
      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
        <li>Compromisso com prazo e qualidade</li>
        <li>Relacionamento transparente</li>
        <li>Segurança nas operações e nas entregas</li>
      </ul>
    </InstitutionalLayout>
  )
}
