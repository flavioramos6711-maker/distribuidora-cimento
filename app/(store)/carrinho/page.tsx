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
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:py-20">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/80 shadow-inner">
          <ShoppingCart className="h-9 w-9 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Carrinho vazio</h1>
        <p className="mt-2 text-sm text-muted-foreground">Adicione produtos ao seu orçamento.</p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-app transition hover:scale-[1.03] hover:bg-primary/92 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" /> Continuar comprando
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
          Carrinho · {totalItems} {totalItems === 1 ? "item" : "itens"}
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="self-start text-sm font-medium text-destructive transition hover:underline sm:self-auto"
        >
          Limpar carrinho
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-3 lg:col-span-2">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-3 shadow-app sm:gap-4 sm:rounded-3xl sm:p-4"
            >
              {item.image_url ? (
                <Image src={item.image_url} alt={item.name} width={80} height={80} className="h-16 w-16 shrink-0 rounded-2xl object-cover sm:h-20 sm:w-20" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-muted sm:h-20 sm:w-20">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-card-foreground text-sm line-clamp-2">{item.name}</h3>
                <p className="text-primary font-bold mt-1">R$ {Number(item.price).toFixed(2)} <span className="text-xs text-muted-foreground font-normal">/{item.unit}</span></p>
              </div>
              <div className="flex shrink-0 items-center overflow-hidden rounded-full border border-border/80">
                <button type="button" onClick={() => updateQty(item.id, -1)} className="p-2.5 text-foreground transition hover:bg-muted">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[2rem] px-2 text-center text-sm font-semibold text-foreground">{item.qty}</span>
                <button type="button" onClick={() => updateQty(item.id, 1)} className="p-2.5 text-foreground transition hover:bg-muted">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="font-bold text-card-foreground text-sm shrink-0 w-24 text-right">R$ {(item.price * item.qty).toFixed(2)}</p>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="shrink-0 rounded-full p-2.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-border/50 bg-card p-5 shadow-app sm:rounded-3xl sm:p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 font-heading text-lg font-bold text-card-foreground">Resumo</h2>
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
            className="mb-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-app transition duration-200 hover:scale-[1.02] hover:bg-emerald-600/92 active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
            Finalizar via WhatsApp
          </button>
          <p className="text-[11px] text-muted-foreground text-center mb-3 leading-snug">
            Um código de pedido será gerado para você acompanhar em &quot;Minha conta&quot; e em &quot;Rastrear pedido&quot;.
          </p>
          <Link
            href="/"
            className="block w-full rounded-full border border-border/80 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-muted/60"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
