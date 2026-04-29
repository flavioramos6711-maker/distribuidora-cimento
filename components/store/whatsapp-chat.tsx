"use client"

import { useState } from "react"
import { X, Send } from "lucide-react"
import Image from "next/image"
import useSWR from "swr"
import { SITE, waLink } from "@/lib/site-config"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"
import { getSiteSettingsPublic } from "@/lib/fetchers/site-settings-public"

const DEFAULT_AVATAR = "/images/chat-avatar.png"

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  
  const { data: settings } = useSWR("site-settings-public", getSiteSettingsPublic, {
    revalidateOnFocus: false,
  })
  
  const avatarUrl = settings?.chat_avatar_url?.trim() || DEFAULT_AVATAR
  const agentName = settings?.chat_agent_name?.trim() || "Atendente"

  function sendMessage() {
    const text = message.trim() || "Ola! Gostaria de mais informacoes."
    trackWhatsAppClick("floating_button")
    window.open(waLink(text), "_blank", "noopener,noreferrer")
    setMessage("")
    setOpen(false)
  }

  return (
    <div className="fixed right-4 sm:right-6 z-50 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
      {/* Chat Panel */}
      {open && (
        <div className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
              <Image
                src={avatarUrl}
                alt={agentName}
                fill
                unoptimized
                className="object-cover"
              />
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{agentName}</p>
              <p className="text-xs text-primary-foreground/70">Online agora</p>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              className="text-primary-foreground/70 hover:text-primary-foreground transition p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages area */}
          <div className="p-4 bg-muted/30 min-h-[180px]">
            {/* Message from agent */}
            <div className="flex gap-2 mb-4">
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                <Image
                  src={avatarUrl}
                  alt={agentName}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="bg-card rounded-2xl rounded-tl-sm p-3 shadow-sm max-w-[85%] border border-border/50">
                <p className="text-sm text-foreground">Ola! Bem-vindo a {SITE.shortName}.</p>
                <p className="text-sm text-foreground mt-1">Como posso ajudar voce hoje?</p>
                <p className="text-[10px] text-muted-foreground mt-2">Agora</p>
              </div>
            </div>
            
            {/* Quick replies */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-2">Selecione ou digite:</p>
              {["Quero fazer um orcamento", "Duvida sobre produtos", "Informacoes de entrega"].map((q) => (
                <button
                  key={q}
                  onClick={() => setMessage(q)}
                  className="block w-full text-left px-3 py-2.5 bg-card rounded-xl text-xs text-foreground hover:bg-accent transition border border-border/50 shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 bg-muted/50 border-t border-border flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            <button
              onClick={sendMessage}
              className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FAB - Floating Action Button */}
      <button
        onClick={() => setOpen(!open)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.97]"
        aria-label="Abrir chat"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <div className="relative w-9 h-9 rounded-full overflow-hidden">
              <Image
                src={avatarUrl}
                alt="Chat"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
          </>
        )}
      </button>
    </div>
  )
}
