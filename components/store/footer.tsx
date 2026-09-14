"use client"

import { Phone, Shield, Star, Smartphone, Instagram, Youtube, Facebook } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import DynamicBrandLogo from "@/components/store/dynamic-brand-logo"
import { SITE } from "@/lib/site-config"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"

const PaymentCard = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div
    title={label}
    className="h-9 px-3 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
  >
    {children}
  </div>
)

export default function StoreFooter() {
  const currentYear = new Date().getFullYear()

  const institutionalLinks = [
    { label: `Sobre a ${SITE.shortName}`, href: "/sobre" },
    { label: "Nossas Lojas", href: "/nossas-lojas" },
    { label: "Trabalhe Conosco", href: "/carreiras" },
    { label: "Política de Privacidade", href: "/politica-de-privacidade" },
    { label: "Termos de Uso", href: "/termos-de-uso" },
  ]

  const supportLinks = [
    { label: "Central de Ajuda", href: "/faq" },
    { label: "Trocas e Devoluções", href: "/trocas-e-devolucoes" },
    { label: "Política de Frete", href: "/politica-de-frete" },
    { label: "Rastrear Pedido", href: "/rastrear-pedido" },
    { label: "Fale Conosco", href: "/fale-conosco" },
  ]

  return (
    <footer className="bg-[#00213F] text-white font-sans mt-20 relative overflow-hidden">

      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F47920] via-[#FFB347] to-[#F47920]" />

      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F47920] mb-1">Newsletter</p>
            <h4 className="text-base font-bold text-white">Receba ofertas e cotações exclusivas</h4>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto bg-white/5 border border-white/10 rounded-xl p-1.5">
            <input
              type="email"
              placeholder="Seu melhor e-mail..."
              className="bg-transparent px-4 py-2 outline-none text-sm font-medium flex-1 sm:w-64 text-white placeholder:text-white/30"
            />
            <button className="h-9 px-6 rounded-lg bg-[#F47920] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#e06810] transition-colors whitespace-nowrap">
              Cadastrar
            </button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-6 py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-7">
            <DynamicBrandLogo variant="full" className="h-9 w-auto" />

            <p className="text-sm text-blue-100/55 leading-relaxed max-w-xs">
              Cimento, argamassa e ferragens para construtoras e obras em todo o Brasil. Atacado com logística própria e preços direto da fábrica.
            </p>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${SITE.whatsappE164}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick("footer_whatsapp")}
              className="inline-flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all rounded-2xl px-4 py-3 group"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-md">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#25D366] leading-none mb-1">Televendas via WhatsApp</p>
                <p className="text-lg font-black text-white tracking-tight leading-none">{SITE.phoneDisplay}</p>
              </div>
            </a>

            {/* Social Media */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-3">Redes Sociais</p>
              <div className="flex items-center gap-2">
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-[#E1306C] hover:border-[#E1306C] hover:text-white transition-all">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white transition-all">
                  <Youtube className="h-4 w-4" />
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-all">
                  <Facebook className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Institutional links */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Institucional</h4>
            <ul className="space-y-3">
              {institutionalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-100/55 hover:text-white hover:translate-x-1 inline-block transition-all duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Atendimento</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-100/55 hover:text-white hover:translate-x-1 inline-block transition-all duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment + Trust column */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-8">

            {/* Payment flags */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Formas de Pagamento</h4>

              {/* Pix + InfinitePay pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-[#32BCAD] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M10 0L12.4 7.6H20L13.8 12.3L16.2 20L10 15.3L3.8 20L6.2 12.3L0 7.6H7.6L10 0Z"/>
                  </svg>
                  Pix à vista
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#00C2FF]/20 border border-[#00C2FF]/40 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#00C2FF] shadow-sm">
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
                    <rect width="16" height="16" rx="3"/>
                    <path d="M4 8h8M8 4v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  InfinitePay
                </span>
              </div>

              {/* Card flags — até 12x */}
              <div>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mb-2">Cartão de Crédito · até 12x</p>
                <div className="flex flex-wrap gap-2">
                  <PaymentCard label="Visa">
                    <Image src="/images/footer/brands/visa.svg" alt="Visa" width={44} height={14} className="h-3.5 w-auto" />
                  </PaymentCard>
                  <PaymentCard label="Mastercard">
                    <Image src="/images/footer/brands/mastercard.svg" alt="Mastercard" width={36} height={28} className="h-6 w-auto" />
                  </PaymentCard>
                  <PaymentCard label="American Express">
                    <Image src="/images/footer/brands/amex.svg" alt="Amex" width={40} height={40} className="h-5 w-auto" />
                  </PaymentCard>
                  <PaymentCard label="Elo">
                    <Image src="/images/footer/brands/elo.svg" alt="Elo" width={40} height={24} className="h-4 w-auto" />
                  </PaymentCard>
                  <PaymentCard label="Boleto Bancário">
                    <svg viewBox="0 0 36 24" className="h-4 w-auto" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="4" width="2" height="16" fill="#1a1a1a"/>
                      <rect x="6" y="4" width="1" height="16" fill="#1a1a1a"/>
                      <rect x="9" y="4" width="3" height="16" fill="#1a1a1a"/>
                      <rect x="14" y="4" width="1" height="16" fill="#1a1a1a"/>
                      <rect x="17" y="4" width="2" height="16" fill="#1a1a1a"/>
                      <rect x="21" y="4" width="1" height="16" fill="#1a1a1a"/>
                      <rect x="24" y="4" width="3" height="16" fill="#1a1a1a"/>
                      <rect x="29" y="4" width="1" height="16" fill="#1a1a1a"/>
                      <rect x="32" y="4" width="2" height="16" fill="#1a1a1a"/>
                    </svg>
                  </PaymentCard>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Segurança e Confiança</h4>
              <div className="flex flex-wrap gap-3">

                {/* Reclame Aqui */}
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-[#00B057] shrink-0">
                    <Star className="h-4 w-4 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#00B057] leading-none">Reclame Aqui</p>
                    <p className="text-xs font-black text-white leading-tight">Ótimo · 9.8/10</p>
                  </div>
                </div>

                {/* Secure */}
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-green-500/20 shrink-0">
                    <Shield className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-green-400 leading-none">SSL Seguro</p>
                    <p className="text-xs font-black text-white leading-tight">Compra Protegida</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Play */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 flex items-center gap-2">
                <Smartphone className="h-3.5 w-3.5" /> Aplicativo
              </h4>
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-black hover:bg-zinc-900 border border-white/10 transition-colors rounded-xl px-4 py-2.5 group shadow-lg"
              >
                <svg viewBox="0 0 512 512" className="h-7 w-7 shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35V477c0 15.8 8.7 28.2 21.7 35l242.7-242L47 0zM425.2 225.6l-58.9-33.9-65.1 64.5 65.1 64.5 60.1-34.3c17.1-9.8 17.1-34.4-.1-50.4l-1.1-.4zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" fill="url(#gp)"/>
                  <defs>
                    <linearGradient id="gp" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EA4335"/>
                      <stop offset="33%" stopColor="#FBBC04"/>
                      <stop offset="66%" stopColor="#34A853"/>
                      <stop offset="100%" stopColor="#4285F4"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div>
                  <p className="text-[9px] text-white/50 font-semibold uppercase tracking-widest leading-none">Disponível no</p>
                  <p className="text-sm font-black text-white leading-tight">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30 font-medium">
            © {currentYear} {SITE.legalName}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/politica-de-privacidade" className="text-[10px] text-white/30 hover:text-white/60 font-bold uppercase tracking-widest transition-colors">
              Privacidade
            </Link>
            <Link href="/termos-de-uso" className="text-[10px] text-white/30 hover:text-white/60 font-bold uppercase tracking-widest transition-colors">
              Termos
            </Link>
            <Link href="/politica-de-frete" className="text-[10px] text-white/30 hover:text-white/60 font-bold uppercase tracking-widest transition-colors">
              Frete
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
