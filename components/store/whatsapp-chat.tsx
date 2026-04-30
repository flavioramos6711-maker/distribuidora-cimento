"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send } from "lucide-react"
import Image from "next/image"
import { SITE } from "@/lib/site-config"
import { cn } from "@/lib/utils"

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false)
  
  const salespersonImg = "/atendente-vendas.jpg"

  const departments = [
    { label: "Quero fazer um orcamento", msg: "Olá! Gostaria de fazer um orçamento." },
    { label: "Duvida sobre produtos", msg: "Olá! Tenho uma dúvida sobre produtos." },
    { label: "Informacoes de entrega", msg: "Olá! Gostaria de informações sobre entrega." },
  ]

  const waLink = (msg: string) => `https://wa.me/${SITE.whatsappE164}?text=${encodeURIComponent(msg)}`

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 font-sans">
      {/* 1:1 Clone of the requested style */}
      {isOpen && (
        <div className="mb-2 w-[calc(100vw-3rem)] sm:w-[380px] overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-5 duration-300 flex flex-col border border-slate-100">
          {/* Orange Header */}
          <div className="bg-[#F47920] p-4 text-white flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 bg-white/10">
              <Image src={salespersonImg} alt="Atendente" fill className="object-cover" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#F47920] rounded-full" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm leading-none">Atendente</h4>
              <p className="text-[10px] opacity-80 mt-1">Online agora</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 p-5 space-y-6 bg-slate-50/30">
            {/* Initial Message Bubble */}
            <div className="flex items-start gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1">
                 <Image src={salespersonImg} alt="Atendente" fill className="object-cover" />
              </div>
              <div className="space-y-1">
                <div className="bg-white p-4 rounded-[1.2rem] rounded-tl-none shadow-sm border border-slate-100">
                  <p className="text-[13px] leading-relaxed text-slate-700">
                    Olá! Bem-vindo a {SITE.shortName}.<br />
                    Como posso ajudar você hoje?
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 ml-1">Agora</span>
              </div>
            </div>

            {/* Quick Options */}
            <div className="space-y-3">
              <p className="text-[11px] text-slate-400 font-medium ml-1">Selecione ou digite:</p>
              <div className="flex flex-col gap-2">
                {departments.map((dept, i) => (
                  <button
                    key={i}
                    onClick={() => window.open(waLink(dept.msg), "_blank")}
                    className="w-full p-3.5 text-left bg-white border border-slate-200 rounded-2xl hover:border-[#F47920]/50 hover:bg-slate-50 transition-all text-[13px] font-medium text-slate-600"
                  >
                    {dept.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Input Area */}
          <div className="p-5 bg-white border-t border-slate-100">
            <div className="relative flex items-center gap-2 bg-slate-50 rounded-full px-5 py-2.5 border border-slate-100">
              <input 
                type="text" 
                placeholder="Digite sua mensagem..." 
                className="flex-1 bg-transparent text-[13px] outline-none text-slate-600 placeholder:text-slate-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    window.open(waLink(e.currentTarget.value), "_blank")
                  }
                }}
              />
              <button 
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Digite sua mensagem..."]') as HTMLInputElement
                  if (input?.value) window.open(waLink(input.value), "_blank")
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F47920] text-white shadow-lg active:scale-95 transition-all"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger (Standard Rounded) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-[#F47920] text-white shadow-[0_10px_30px_rgba(244,121,32,0.3)] flex items-center justify-center transition-all hover:scale-110 active:scale-90"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8 fill-current" />}
      </button>
    </div>
  )
}
