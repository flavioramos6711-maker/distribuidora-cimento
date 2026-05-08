"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send } from "lucide-react"
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
      const timer = setTimeout(() => setIsTyping(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isOpen])
  
  const salespersonImg = "/atendente-vendas.jpg"

  const departments = [
    { label: "Quero fazer um orçamento", msg: "Olá! Gostaria de fazer um orçamento." },
    { label: "Dúvida sobre produtos", msg: "Olá! Tenho uma dúvida sobre produtos." },
    { label: "Informações de entrega", msg: "Olá! Gostaria de informações sobre entrega." },
  ]

  const waLink = (msg: string) => `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 font-sans select-none">
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-3rem)] sm:w-[400px] overflow-hidden rounded-[2.5rem] bg-white shadow-app-lg animate-in slide-in-from-bottom-10 fade-in duration-500 flex flex-col border border-slate-100">
          {/* Professional Header */}
          <div className="bg-gradient-to-r from-[#002D5B] to-[#003d7a] p-6 text-white flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 shadow-inner">
              <Image src={salespersonImg} alt="Atendente" fill className="object-cover" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#002D5B] rounded-full shadow-sm" />
            </div>
            
            <div className="flex-1 relative z-10">
              <h4 className="font-black text-base leading-none tracking-tight uppercase italic">Atendimento Oficial</h4>
              <div className="flex items-center gap-1.5 mt-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Online Agora</p>
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
          <div className="flex-1 p-6 space-y-8 bg-slate-50/50 max-h-[400px] overflow-y-auto scrollbar-hide">
            {/* Initial Message Bubble */}
            <div className="flex items-start gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 mt-1 shadow-sm border border-slate-200">
                 <Image src={salespersonImg} alt="Atendente" fill className="object-cover" />
              </div>
              
              <div className="space-y-1.5 flex-1">
                {isTyping ? (
                  <div className="bg-white px-5 py-4 rounded-[1.5rem] rounded-tl-none shadow-sm border border-slate-100 w-20 flex justify-center items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#F47920] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-[#F47920] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-[#F47920] rounded-full animate-bounce" />
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-[1.8rem] rounded-tl-none shadow-sm border border-slate-100 animate-in fade-in slide-in-from-left-2 duration-500">
                    <p className="text-[13px] leading-relaxed text-slate-700 font-medium">
                      Olá! 👋 Bem-vindo à <span className="font-black text-[#002D5B]">{SITE.shortName}</span>.<br />
                      Sou seu assistente virtual. Como posso acelerar sua obra hoje?
                    </p>
                  </div>
                )}
                {!isTyping && <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Visto agora</span>}
              </div>
            </div>

            {/* Smart Quick Options */}
            {!isTyping && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1">Como podemos ajudar?</p>
                <div className="flex flex-col gap-2.5">
                  {departments.map((dept, i) => (
                    <button
                      key={i}
                      onClick={() => window.open(waLink(dept.msg), "_blank")}
                      className="w-full p-4 text-left bg-white border border-slate-200 rounded-2xl hover:border-[#F47920] hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all text-[13px] font-bold text-slate-600 group/item flex items-center justify-between"
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
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="relative flex items-center gap-3 bg-slate-50 rounded-2xl px-5 py-3 border border-slate-200 focus-within:border-[#F47920] focus-within:bg-white transition-all">
              <input 
                type="text" 
                placeholder="Digite sua mensagem..." 
                className="flex-1 bg-transparent text-[14px] outline-none text-slate-700 font-medium placeholder:text-slate-400"
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
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F47920] text-white shadow-lg active:scale-90 transition-all hover:brightness-110"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Floating Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F47920] text-white shadow-[0_15px_35px_rgba(244,121,32,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-90"
      >
        <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping opacity-20" />
        {isOpen ? (
          <X className="w-8 h-8 sm:w-10 sm:h-10 animate-in spin-in-90 duration-300" />
        ) : (
          <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 fill-current animate-in zoom-in duration-300" />
        )}
      </button>
    </div>
  )
}
