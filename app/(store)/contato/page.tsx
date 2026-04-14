import type { Metadata } from "next"
import InstitutionalLayout from "@/components/store/institutional-layout"
import WhatsAppCta from "@/components/store/whatsapp-cta"
import { SITE } from "@/lib/site-config"
import { Mail, MapPin, Phone } from "lucide-react"

export const metadata: Metadata = {
  title: "Contato",
}

export default function ContatoPage() {
  return (
    <InstitutionalLayout
      title="Contato"
      subtitle="Fale com a equipe comercial e logística do Atacado de Construção."
    >
      <p>
        Atendemos construtoras, revendas e obras de todos os portes. Para orçamentos, prazos de entrega e
        condições comerciais, utilize os canais abaixo.
      </p>
      <div className="not-prose space-y-4 rounded-xl bg-muted/40 p-5 border border-border/60">
        <div className="flex gap-3">
          <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Telefone / WhatsApp</p>
            <a href={`tel:+${SITE.whatsappE164}`} className="text-primary hover:underline">
              {SITE.phoneDisplay}
            </a>
          </div>
        </div>
        <div className="flex gap-3">
          <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">E-mail</p>
            <a href={`mailto:${SITE.email}`} className="text-primary hover:underline break-all">
              {SITE.email}
            </a>
          </div>
        </div>
        <div className="flex gap-3">
          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Endereço</p>
            <p className="text-muted-foreground">
              {SITE.address.street}, {SITE.address.district}
              <br />
              {SITE.address.city} — {SITE.address.zip}
            </p>
          </div>
        </div>
      </div>
      <div className="not-prose pt-2">
        <WhatsAppCta
          source="contact_page"
          page="/contato"
          text="Olá! Vim pela página de contato e gostaria de falar com o comercial."
          label="Chamar no WhatsApp"
        />
      </div>
    </InstitutionalLayout>
  )
}
