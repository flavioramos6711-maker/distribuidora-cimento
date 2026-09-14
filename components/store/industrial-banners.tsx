"use client"

import Link from "next/link"
import { ArrowRight, Truck, Package, ShieldAlert } from "lucide-react"

export default function IndustrialBanners() {
  return (
    <section className="py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Banner 1: Carga Fechada de Cimento & Básicos */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#002D5B] to-[#001833] p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between min-h-[220px] group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform" />
            <div className="relative z-10 space-y-2 max-w-sm">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F47920] text-white text-[9px] font-black uppercase tracking-widest">
                Carga Fechada & Pallet
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white">
                Cimentos, Cal e Argamassa no Atacado
              </h3>
              <p className="text-xs text-slate-300">
                Descontos progressivos a partir de 40 sacos direto da distribuidora.
              </p>
            </div>
            <div className="relative z-10 pt-4">
              <Link
                href="/categoria/cimentos"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#F47920] group-hover:text-white transition-colors"
              >
                Ver ofertas por volume
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Banner 2: Impermeabilização & Coberturas */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-[#1e293b] p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between min-h-[220px] group border border-slate-800">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform" />
            <div className="relative z-10 space-y-2 max-w-sm">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest">
                Pronta Entrega
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white">
                Impermeabilizantes & Telhas
              </h3>
              <p className="text-xs text-slate-300">
                Linha completa Vedacit, Sika e Brasilit para blindar sua estrutura.
              </p>
            </div>
            <div className="relative z-10 pt-4">
              <Link
                href="/categoria/impermeabilizantes"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400 group-hover:text-white transition-colors"
              >
                Conferir departamentos
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
