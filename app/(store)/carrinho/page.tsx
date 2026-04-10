"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, Package, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { saveLocalOrder, generateOrderCode } from "@/lib/local-orders"
import { waLink } from "@/lib/site-config"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"

type CartItem = {
  id: string
  name: string
  price: number
  image_url: string | null
  unit: string
  qty: number
}

function getCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem("cart") || "[]") } catch { return [] }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(cart))
  window.dispatchEvent(new Event("cart-updated"))
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => { setCart(getCart()) }, [])

  function updateQty(id: string, delta: number) {
    const updated = cart.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    setCart(updated); saveCart(updated)
  }

  function removeItem(id: string) {
    const updated = cart.filter((i) => i.id !== id)
    setCart(updated); saveCart(updated)
  }

  function clearCart() { setCart([]); saveCart([]) }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0)

  async function finalizeWhatsApp() {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    const email = data.user?.email ?? undefined
    const code = generateOrderCode()
    const lines = cart.map((i) => `- ${i.name} (x${i.qty}) — R$ ${(i.price * i.qty).toFixed(2)}`)
    const summary = lines.join("\n")
    saveLocalOrder({
      code,
      email,
      status: "received",
      total,
      itemsSummary: summary,
    })
    const msg = `Olá! Quero finalizar o pedido *${code}*:\n\n${summary}\n\n*Total:* R$ ${total.toFixed(2)}`
    trackWhatsAppClick("checkout_finalize", "/carrinho")
    window.open(waLink(msg), "_blank", "noopener,noreferrer")
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Carrinho Vazio</h1>
        <p className="text-muted-foreground mb-6">Adicione produtos ao seu carrinho.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
          <ArrowLeft className="w-4 h-4" /> Continuar Comprando
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Carrinho ({totalItems} itens)</h1>
        <button onClick={clearCart} className="text-sm text-destructive hover:underline">Limpar carrinho</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
              {item.image_url ? (
                <Image src={item.image_url} alt={item.name} width={80} height={80} className="w-20 h-20 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0"><Package className="w-8 h-8 text-muted-foreground" /></div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-card-foreground text-sm line-clamp-2">{item.name}</h3>
                <p className="text-primary font-bold mt-1">R$ {Number(item.price).toFixed(2)} <span className="text-xs text-muted-foreground font-normal">/{item.unit}</span></p>
              </div>
              <div className="flex items-center border border-border rounded-lg shrink-0">
                <button onClick={() => updateQty(item.id, -1)} className="p-2 text-foreground hover:bg-muted transition"><Minus className="w-3 h-3" /></button>
                <span className="px-3 text-sm font-medium text-foreground">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="p-2 text-foreground hover:bg-muted transition"><Plus className="w-3 h-3" /></button>
              </div>
              <p className="font-bold text-card-foreground text-sm shrink-0 w-24 text-right">R$ {(item.price * item.qty).toFixed(2)}</p>
              <button onClick={() => removeItem(item.id)} className="p-2 text-muted-foreground hover:text-destructive transition shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-card-foreground mb-4">Resumo</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({totalItems} itens)</span>
              <span className="text-card-foreground font-medium">R$ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frete</span>
              <span className="text-green-600 font-medium">A calcular</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-bold text-card-foreground">Total</span>
              <span className="font-bold text-primary text-xl">R$ {total.toFixed(2)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void finalizeWhatsApp()}
            className="flex w-full items-center justify-center gap-2 py-3.5 bg-[#25d366] text-white rounded-xl font-semibold hover:bg-[#20c15c] transition mb-3 shadow-md shadow-[#25d366]/20"
          >
            <MessageCircle className="w-5 h-5 shrink-0" aria-hidden />
            Finalizar via WhatsApp
          </button>
          <p className="text-[11px] text-muted-foreground text-center mb-3 leading-snug">
            Um código de pedido será gerado para você acompanhar em &quot;Minha conta&quot; e em &quot;Rastrear pedido&quot;.
          </p>
          <Link href="/" className="block w-full text-center py-3 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition">
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
