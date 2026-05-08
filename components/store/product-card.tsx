"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Package, MessageCircle, ChevronRight, Star } from "lucide-react"
import { toast } from "sonner"
import { waLink } from "@/lib/site-config"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"
import { cn } from "@/lib/utils"

export type ProductCardProduct = {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  image_url: string | null
  unit: string
  stock: number
  is_new?: boolean
  is_discount?: boolean
}

export function addToCart(product: ProductCardProduct, qty = 1) {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const idx = cart.findIndex((i: { id: string }) => i.id === product.id)
    if (idx >= 0) {
      cart[idx].qty += qty
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        unit: product.unit,
        qty,
      })
    }
    localStorage.setItem("cart", JSON.stringify(cart))
    window.dispatchEvent(new Event("cart-updated"))
    toast.success("Adicionado ao orçamento!")
  } catch {
    toast.error("Erro ao adicionar")
  }
}

export default function ProductCard({ product }: { product: ProductCardProduct }) {
  const [userCity, setUserCity] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("user-location") || ""
    setUserCity(saved)

    const handleStorage = () => {
      setUserCity(localStorage.getItem("user-location") || "")
    }
    window.addEventListener("storage", handleStorage)
    window.addEventListener("user-location-updated", handleStorage)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("user-location-updated", handleStorage)
    }
  }, [])

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0

  const waHref = waLink(
    `Olá! Tenho interesse em: ${product.name} — R$ ${Number(product.price).toFixed(2)} (${product.unit})`,
  )

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:shadow-app-lg hover:-translate-y-2">
      {/* Floating Badges */}
      <div className="pointer-events-none absolute left-0 top-6 z-10 flex flex-col gap-2">
        {product.is_new && (
          <div className="flex items-center bg-secondary text-white pl-5 pr-4 py-2 rounded-r-2xl shadow-xl border-l-4 border-primary">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Novo</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex items-center bg-primary text-white pl-5 pr-4 py-2 rounded-r-2xl shadow-xl">
            <span className="text-[11px] font-bold uppercase tracking-tight">-{discount}% OFF</span>
          </div>
        )}
      </div>

      {/* Image Container */}
      <Link
        href={`/produto/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-slate-50/50"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-contain p-10 transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-16 w-16 text-slate-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Em Estoque
            </div>
            <div className="flex items-center gap-1 text-slate-300">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-semibold">5.0</span>
            </div>
        </div>

        <Link href={`/produto/${product.slug}`} className="mb-6">
          <h3 className="line-clamp-2 text-base font-bold leading-tight text-secondary transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto space-y-6">
          <div className="border-t border-slate-100 pt-6">
            {product.original_price && product.original_price > product.price && (
              <p className="text-xs text-slate-400 line-through font-semibold mb-1">
                R$ {Number(product.original_price).toFixed(2).replace(".", ",")}
              </p>
            )}
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-secondary tabular-nums tracking-tighter">
                <span className="text-sm font-semibold mr-1 text-slate-400">R$</span>
                {Number(product.price).toFixed(2).replace(".", ",")}
              </p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/{product.unit}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => addToCart(product)}
              className="group/buy relative flex-1 flex h-14 items-center justify-center rounded-2xl bg-secondary text-white text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-secondary/10 transition-all hover:bg-secondary/90 hover:shadow-secondary/20 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 translate-x-[-100%] group-hover/buy:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]" />
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span>Orçar</span>
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group/wa relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-95 overflow-hidden"
              title="Orçamento via WhatsApp"
              onClick={() => trackWhatsAppClick("product_card", `/produto/${product.slug}`)}
            >
              <div className="absolute inset-0 translate-x-[-100%] group-hover/wa:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
              <MessageCircle className="h-6 w-6 fill-current" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

