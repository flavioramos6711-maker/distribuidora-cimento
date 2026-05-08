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
        { label: "Política de Privacidade", href: "/privacidade" },
        { label: "Termos de Uso", href: "/termos" },
        { label: "Trabalhe Conosco", href: "/carreiras" },
      ]
    },
    {
      title: "Atendimento",
      links: [
        { label: "Central de Ajuda", href: "/faq" },
        { label: "Trocas e Devoluções", href: "/devolucoes" },
        { label: "Prazos de Entrega", href: "/frete" },
        { label: "Fale Conosco", href: "/contato" },
        { label: "Rastrear Pedido", href: "/rastreio" },
      ]
    }
  ]

  return (
    <footer className="relative bg-slate-950 text-white pt-20 pb-10 overflow-hidden border-t border-white/5">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Upper Footer: Branding & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          <div className="lg:col-span-5 space-y-8">
            <DynamicBrandLogo variant="full" className="h-10 lg:h-12 w-auto" />
            <p className="text-white/50 text-[13px] leading-relaxed max-w-md font-medium">
              Líder em distribuição de materiais básicos e acabamentos. Logística inteligente para o setor da construção civil com condições exclusivas de atacado.
            </p>
            <div className="flex gap-4">
              <a 
                href={`https://wa.me/${SITE.whatsappE164}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-[#25D366]/50 hover:bg-white/10 transition-all max-w-max"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-lg transition-transform group-hover:scale-105">
                  <img src="https://img.icons8.com/color/48/whatsapp--v1.png" alt="WhatsApp" className="h-7 w-7 brightness-0 invert" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#25D366] mb-1">Compre pelo WhatsApp</p>
                  <p className="text-xl font-black tracking-tight text-white">{SITE.phoneDisplay}</p>
                </div>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-12">
            <div className="bg-white/[0.03] rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-2">
                  <h4 className="text-lg font-black tracking-tight text-white">Receba Ofertas Exclusivas</h4>
                  <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">Assine nossa newsletter e receba cotações atualizadas toda semana no seu e-mail.</p>
                </div>
                <div className="w-full md:w-auto flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                  <input 
                    type="email" 
                    placeholder="Seu melhor e-mail" 
                    className="bg-transparent px-4 py-2 outline-none text-[13px] font-bold flex-1 min-w-[200px] text-white placeholder:text-white/30"
                  />
                  <button className="h-11 px-6 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Assinar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Footer: Links & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-8">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[13px] font-bold text-white/50 hover:text-white transition-colors flex items-center gap-2 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-8">Central de Vendas</h4>
            <div className="space-y-6">
              <a href={`tel:${SITE.whatsappE164}`} className="block group">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Televendas</p>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/50" />
                  <span className="text-xl font-black tracking-tight text-white group-hover:text-primary transition-colors">{SITE.phoneDisplay}</span>
                </div>
              </a>
              <div className="block">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">E-mail Corporativo</p>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/50" />
                  <span className="text-[13px] font-bold text-white/70">{SITE.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-8">Segurança e Pagamentos</h4>
            <div className="flex flex-col gap-6">
              {/* Security Images as requested */}
              <div className="flex flex-wrap items-center gap-4">
                <img src="/ssl.png" alt="SSL Secure Connection" className="h-10 w-auto object-contain drop-shadow-sm" />
                <img src="/shield.png" alt="Site Seguro" className="h-10 w-auto object-contain drop-shadow-sm" />
              </div>
              
              {/* Payment Methods Images */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5">
                <img src="/pix.png" alt="Pix" className="h-7 w-auto object-contain" />
                <img src="https://logospng.org/download/mastercard/logo-mastercard-2048.png" alt="Mastercard" className="h-6 w-auto object-contain bg-white rounded-[4px] px-1 py-0.5" />
                <img src="https://logospng.org/download/visa/logo-visa-2048.png" alt="Visa" className="h-5 w-auto object-contain bg-white rounded-[4px] px-1 py-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Lower Footer: Legal */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] text-center md:text-left">
            © {currentYear} {SITE.legalName} • Todos os direitos reservados.
          </p>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
            Ambiente 100% Seguro
          </p>
        </div>
      </div>
    </footer>
  )
}
