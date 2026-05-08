"use client"

import { useState, useEffect, useRef } from "react"
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
      const timer = setTimeout(() => setIsTyping(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])
  
  const salespersonImg = "/atendente-vendas.png"

  const departments = [
    { label: "Quero fazer um orçamento", msg: "Olá! Gostaria de fazer um orçamento." },
    { label: "Dúvida sobre produtos", msg: "Olá! Tenho uma dúvida sobre produtos." },
    { label: "Informações de entrega", msg: "Olá! Gostaria de informações sobre entrega." },
  ]

  const waLink = (msg: string) => `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 font-sans select-none">
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-3rem)] sm:w-[380px] overflow-hidden rounded-[2.5rem] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-10 fade-in duration-500 flex flex-col border border-white/50">
          {/* Professional Header - Glassmorphism */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white flex items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F47920]/10 rounded-full -mr-24 -mt-24 blur-3xl" />
            
            <div className="relative w-16 h-16 rounded-3xl overflow-hidden border-2 border-white/10 bg-white/5 shadow-2xl rotate-2">
              <Image src={salespersonImg} alt="Atendente" fill className="object-cover" />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-4 border-slate-900 rounded-full shadow-lg" />
            </div>
            
            <div className="flex-1 relative z-10">
              <h4 className="font-black text-lg leading-none tracking-tight uppercase italic text-white">Central de Vendas</h4>
              <div className="flex items-center gap-2 mt-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Consultor Online</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)} 
              className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Chat Content */}
          <div className="flex-1 p-8 space-y-10 bg-slate-50/50 max-h-[380px] overflow-y-auto scrollbar-hide">
            {/* Initial Message Bubble */}
            <div className="flex items-start gap-4">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden shrink-0 mt-1 shadow-md border border-white bg-white rotate-[-3deg]">
                 <Image src={salespersonImg} alt="Atendente" fill className="object-cover" />
              </div>
              
              <div className="space-y-2 flex-1">
                {isTyping ? (
                  <div className="bg-white px-6 py-5 rounded-[2rem] rounded-tl-none shadow-sm border border-slate-100 w-24 flex justify-center items-center gap-1.5">
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-[2rem] rounded-tl-none shadow-xl shadow-slate-200/40 border border-slate-100 animate-in fade-in slide-in-from-left-2 duration-500">
                    <p className="text-[14px] leading-relaxed text-slate-600 font-semibold italic">
                      "Olá! 👋 Sou consultor da <span className="font-black text-slate-900 not-italic">{SITE.shortName}</span>. Como posso acelerar sua obra com os melhores preços hoje?"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Quick Options */}
            {!isTyping && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] ml-1">Atalhos rápidos</p>
                <div className="flex flex-col gap-3">
                  {departments.map((dept, i) => (
                    <button
                      key={i}
                      onClick={() => window.open(waLink(dept.msg), "_blank")}
                      className="w-full p-5 text-left bg-white/60 backdrop-blur-sm border border-white/50 rounded-[1.5rem] hover:border-[#F47920]/50 hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all text-[13px] font-black text-slate-700 group/item flex items-center justify-between"
                    >
                      {dept.label}
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover/item:text-[#F47920] group-hover/item:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Premium Footer Input */}
          <div className="p-8 bg-white border-t border-slate-100">
            <div className="relative flex items-center gap-3 bg-slate-100 rounded-[1.5rem] px-6 py-4 border-2 border-transparent focus-within:border-[#F47920] focus-within:bg-white transition-all shadow-inner">
              <input 
                type="text" 
                placeholder="Escreva sua dúvida..." 
                className="flex-1 bg-transparent text-[14px] outline-none text-slate-800 font-bold placeholder:text-slate-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    window.open(waLink(e.currentTarget.value), "_blank")
                  }
                }}
              />
              <button 
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Escreva sua dúvida..."]') as HTMLInputElement
                  if (input?.value) window.open(waLink(input.value), "_blank")
                }}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-900 text-[#F47920] shadow-xl active:scale-90 transition-all hover:scale-105"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Floating Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-18 h-18 sm:w-22 sm:h-22 rounded-[2.5rem] bg-slate-900 text-[#F47920] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all hover:scale-110 active:scale-90 border-2 border-white/10"
      >
        <div className="absolute inset-0 rounded-[2.5rem] border-4 border-[#F47920]/20 animate-ping opacity-20" />
        {isOpen ? (
          <X className="w-10 h-10 animate-in spin-in-90 duration-300" />
        ) : (
          <div className="relative">
              <MessageCircle className="w-10 h-10 fill-current animate-in zoom-in duration-300" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
        )}
      </button>
    </div>
  )
}
