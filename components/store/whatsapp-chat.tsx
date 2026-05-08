"use client"

import { useState, useEffect } from "react"
import { MessageCircle, X, Send, ArrowRight } from "lucide-react"
import Image from "next/image"
import { SITE } from "@/lib/site-config"
import { cn } from "@/lib/utils"

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [phone, setPhone] = useState(SITE.whatsappE164)
  
  useEffect(() => {
    async function fetchRotation() {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data } = await supabase
        .from("whatsapp_numbers")
        .select("phone")
        .eq("active", true)
        .order("sort_order")
      
      if (data && data.length > 0) {
        const randomIdx = Math.floor(Math.random() * data.length)
        setPhone(data[randomIdx].phone)
      }
    }
    fetchRotation()
  }, [])

  useEffect(() => {
    if (isOpen) {
      setIsTyping(true)
      const timer = setTimeout(() => setIsTyping(false), 1200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])
  
  const salespersonImg = "/atendente-vendas.png"

  const departments = [
    { label: "Orçamento Corporativo", msg: "Solicito cotação para materiais de construção." },
    { label: "Faturamento e Vendas", msg: "Gostaria de falar com o setor de faturamento." },
    { label: "Suporte Logístico", msg: "Necessito de informações sobre o status de entrega." },
  ]

  const waLink = (msg: string) => `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 font-sans select-none">
      {isOpen && (
        <div className="mb-2 w-[calc(100vw-3rem)] sm:w-[350px] overflow-hidden rounded-3xl bg-white shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 flex flex-col border border-slate-200">
          {/* Corporate Header */}
          <div className="bg-secondary p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/20 bg-slate-800">
                <Image src={salespersonImg} alt="Consultor" fill className="object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-[13px] uppercase tracking-wider">Atendimento Técnico</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-medium opacity-70">Disponível agora</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-5 space-y-4 bg-slate-50">
            <div className="flex items-start gap-3">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200">
                {isTyping ? (
                  <div className="flex gap-1 py-1 px-2">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                ) : (
                  <p className="text-[13px] leading-relaxed text-slate-700 font-medium">
                    Olá! Como podemos auxiliar em sua demanda técnica ou comercial hoje?
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 focus-within:border-primary focus-within:bg-white transition-all">
              <input 
                type="text" 
                placeholder="Digite sua mensagem..." 
                className="flex-1 bg-transparent text-[13px] outline-none text-slate-800 font-medium placeholder:text-slate-400"
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
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary text-primary transition-all hover:bg-primary hover:text-white"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Floating Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-secondary shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-2 border-white overflow-hidden"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary" />
        ) : (
          <div className="relative w-full h-full">
            <Image src={salespersonImg} alt="Atendente" fill className="object-cover" />
            <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
          </div>
        )}
      </button>
    </div>
  )
}
