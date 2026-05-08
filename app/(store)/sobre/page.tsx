import InstitutionalLayout from "@/components/store/institutional-layout"
import { SITE } from "@/lib/site-config"

export default function Page() {
  return (
    <InstitutionalLayout 
      title={`Sobre a ${SITE.shortName}`}
      subtitle="Conheça nossa história e nosso compromisso com a construção civil."
    >
      <section className="space-y-6">
        <p>
          A {SITE.name} é referência na distribuição de materiais básicos e acabamentos, atendendo com excelência o setor da construção civil. Nossa trajetória é marcada pela busca constante pela inovação e pela satisfação total de nossos clientes.
        </p>
        
        <h2 className="text-lg font-bold text-secondary">Nossa Missão</h2>
        <p>
          Fornecer materiais de construção de alta qualidade com agilidade e transparência, sendo o parceiro estratégico ideal para construtoras, empreiteiras e clientes finais.
        </p>

        <h2 className="text-lg font-bold text-secondary">Nossa Visão</h2>
        <p>
          Ser reconhecida como a maior e mais eficiente distribuidora de cimento e materiais básicos da região, liderando o mercado através de logística inteligente e preços competitivos.
        </p>

        <h2 className="text-lg font-bold text-secondary">Nossos Valores</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Qualidade:</strong> Apenas produtos certificados e das melhores marcas.</li>
          <li><strong>Comprometimento:</strong> Respeito rigoroso aos prazos de entrega.</li>
          <li><strong>Ética:</strong> Transparência total em todas as nossas negociações.</li>
          <li><strong>Inovação:</strong> Melhoria contínua de nossos processos logísticos.</li>
        </ul>
      </section>
    </InstitutionalLayout>
  )
}
