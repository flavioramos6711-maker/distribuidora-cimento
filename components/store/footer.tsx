"use client"

import { Mail, Phone, Send } from "lucide-react"
import Link from "next/link"
import DynamicBrandLogo from "@/components/store/dynamic-brand-logo"
import { SITE } from "@/lib/site-config"

export default function StoreFooter() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: "Institucional",
      links: [
        { label: `Sobre a ${SITE.shortName}`, href: "/sobre" },
        { label: "Nossas Lojas", href: "/nossas-lojas" },
        { label: "Privacidade", href: "/politica-de-privacidade" },
        { label: "Termos de Uso", href: "/termos-de-uso" },
      ]
    },
    {
      title: "Atendimento",
      links: [
        { label: "Central de Ajuda", href: "/faq" },
        { label: "Trocas e Devoluções", href: "/trocas-e-devolucoes" },
        { label: "Prazos de Entrega", href: "/politica-de-frete" },
        { label: "Fale Conosco", href: "/fale-conosco" },
      ]
    }
  ]

  return (
    <footer className="bg-slate-950 text-white border-t border-white/5 font-sans">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand & Info */}
          <div className="lg:col-span-4 space-y-6">
            <DynamicBrandLogo variant="full" className="h-8 w-auto" />
            <p className="text-white/40 text-[13px] leading-relaxed max-w-sm">
              Distribuidora líder em materiais básicos e acabamentos para a construção civil. Logística inteligente e atacado de alta performance.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a 
                href={`https://wa.me/${SITE.whatsappE164}`}
                className="flex items-center gap-3 group"
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all">
                  <img src="https://img.icons8.com/color/48/whatsapp--v1.png" alt="WA" className="h-5 w-5 group-hover:brightness-0 group-hover:invert" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">Vendas</p>
                  <p className="text-base font-bold tracking-tight">{SITE.phoneDisplay}</p>
                </div>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact & Security */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6">Segurança e Pagamentos</h4>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <img src="/ssl.png" alt="SSL" className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                  <img src="/shield.png" alt="Safe" className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <img src="/pix.png" alt="Pix" className="h-5 w-auto" />
                  <div className="h-4 w-[1px] bg-white/10 mx-1" />
                  <img src="https://logospng.org/download/mastercard/logo-mastercard-2048.png" alt="MC" className="h-4 w-auto bg-white/5 rounded px-1" />
                  <img src="https://logospng.org/download/visa/logo-visa-2048.png" alt="Visa" className="h-3 w-auto bg-white/5 rounded px-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter - Minimalist */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xs">
            <h4 className="text-sm font-bold mb-1">Receba nossas ofertas</h4>
            <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest leading-relaxed">Cotações atualizadas toda semana no seu e-mail.</p>
          </div>
          <div className="w-full md:w-auto flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
            <input 
              type="email" 
              placeholder="Seu e-mail" 
              className="bg-transparent px-4 py-2 outline-none text-xs font-bold flex-1 md:w-64 text-white placeholder:text-white/20"
            />
            <button className="h-9 px-4 rounded-lg bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all flex items-center gap-2">
              Assinar
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
          <p>© {currentYear} {SITE.legalName}</p>
          <p>Ambiente 100% Seguro</p>
        </div>
      </div>
    </footer>
  )
}
