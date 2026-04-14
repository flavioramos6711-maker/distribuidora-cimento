"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Phone, Mail, Globe } from "lucide-react"
import BrandLogo from "@/components/store/brand-logo"
import { SITE } from "@/lib/site-config"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export default function StoreFooter() {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setCategories(data.slice(0, 8))
      })
  }, [])

  return (
    <footer className="mt-auto rounded-t-[1.75rem] bg-secondary text-secondary-foreground shadow-[0_-8px_40px_-12px_rgb(0,0,0,0.15)] border-t border-white/5 sm:rounded-t-3xl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo variant="compact" inverted className="mb-2" />
            <p className="text-sm text-secondary-foreground/75 leading-relaxed max-w-sm">
              {SITE.tagline}
            </p>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Institucional
            </h3>
            <ul className="space-y-2.5 text-sm text-secondary-foreground/75">
              <li>
                <Link href="/sobre-nos" className="hover:text-white transition">
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidade" className="hover:text-white transition">
                  Política de privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos-de-uso" className="hover:text-white transition">
                  Termos de uso
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Atendimento
            </h3>
            <ul className="space-y-2.5 text-sm text-secondary-foreground/75">
              <li>
                <Link href="/fale-conosco" className="hover:text-white transition">
                  Fale conosco
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-white transition">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/rastrear-pedido" className="hover:text-white transition">
                  Rastrear pedido
                </Link>
              </li>
              <li>
                <Link href="/trocas-e-devolucoes" className="hover:text-white transition">
                  Trocas e devoluções
                </Link>
              </li>
              <li>
                <Link href="/politica-de-frete" className="hover:text-white transition">
                  Política de frete
                </Link>
              </li>
              <li>
                <Link href="/formas-de-pagamento" className="hover:text-white transition">
                  Formas de pagamento
                </Link>
              </li>
              <li>
                <Link href="/calculadora" className="hover:text-white transition">
                  Calculadora de materiais
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Categorias
            </h3>
            <ul className="space-y-2.5 text-sm text-secondary-foreground/75">
              <li>
                <Link href="/produtos" className="hover:text-white transition font-medium">
                  Ver todo o catálogo
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/categoria/${c.slug}`} className="hover:text-white transition line-clamp-1">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Contato
            </h3>
            <ul className="space-y-3 text-sm text-secondary-foreground/75">
              <li className="flex gap-2.5">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" aria-hidden />
                <span className="leading-snug">
                  {SITE.address.street}
                  <br />
                  {SITE.address.district}, {SITE.address.city}
                  <br />
                  {SITE.address.zip}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-primary" aria-hidden />
                <a href={`tel:+${SITE.whatsappE164}`} className="hover:text-white transition">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-primary" aria-hidden />
                <a href={`mailto:${SITE.email}`} className="hover:text-white transition break-all">
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 shrink-0 text-primary" aria-hidden />
                <a href={SITE.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition break-all">
                  {SITE.website.replace(/^https?:\/\//, "")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondary-foreground/45">
          <p>© {new Date().getFullYear()} {SITE.legalName}. Todos os direitos reservados.</p>
          <p className="text-secondary-foreground/35">CNPJ e razão social conforme contrato social.</p>
        </div>
      </div>
    </footer>
  )
}
