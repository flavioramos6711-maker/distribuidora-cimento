"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Package, Star, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { waLink } from "@/lib/site-config"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"

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

    const handleStorage = () => setUserCity(localStorage.getItem("user-location") || "")
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
    <div className="group relative flex flex-col h-full overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-sm transition-all duration-500 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-1.5">
      {/* Floating Badges */}
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-2 pointer-events-none">
        {product.is_new && (
          <div className="flex items-center bg-slate-950 text-white px-3 py-1.5 rounded-xl shadow-md border border-white/10 backdrop-blur-md">
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Lançamento</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex items-center bg-[#F47920] text-white px-3 py-1.5 rounded-xl shadow-md">
            <span className="text-[10px] font-black uppercase tracking-widest">-{discount}% OFF</span>
          </div>
        )}
      </div>

      {/* Image Container */}
      <Link
        href={`/produto/${product.slug}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-transparent to-slate-50/50"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-contain p-8 transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-slate-200" />
          </div>
        )}
        {/* Subtle overlay effect */}
        <div className="absolute inset-0 bg-slate-900/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 mix-blend-multiply" />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Rating and Stock */}
        <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/50">
                <CheckCircle2 className="w-3 h-3" />
                Pronta Entrega
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100/50 text-amber-500">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-black">5.0</span>
            </div>
        </div>

        {/* Title */}
        <Link href={`/produto/${product.slug}`} className="mb-4">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-slate-800 transition-colors group-hover:text-[#F47920]">
            {product.name}
          </h3>
        </Link>

        {/* Price and Actions */}
        <div className="mt-auto space-y-5">
          <div className="flex flex-col">
            {product.original_price && product.original_price > product.price ? (
              <p className="text-[11px] text-slate-400 line-through font-bold mb-0.5">
                R$ {Number(product.original_price).toFixed(2).replace(".", ",")}
              </p>
            ) : (
              <div className="h-[18px]" /> /* Spacer if no original price to keep cards same height */
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-slate-500 mt-1">R$</span>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {Number(product.price).toFixed(2).replace(".", ",")}
              </p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                /{product.unit}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button
              type="button"
              onClick={() => addToCart(product)}
              className="group/buy relative flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.15em] transition-all hover:bg-slate-800 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 translate-x-[-100%] group-hover/buy:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]" />
              <ShoppingCart className="h-4 w-4" />
              <span>Adicionar</span>
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group/wa relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366] text-white transition-all hover:bg-[#20bd5a] hover:shadow-lg active:scale-95 overflow-hidden"
              title="Comprar via WhatsApp"
              onClick={() => trackWhatsAppClick("product_card", `/produto/${product.slug}`)}
            >
              <div className="absolute inset-0 translate-x-[-100%] group-hover/wa:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
              <img src="https://img.icons8.com/color/48/whatsapp--v1.png" alt="WhatsApp" className="h-6 w-6 brightness-0 invert" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
