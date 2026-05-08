"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Package, Star, CheckCircle2, Heart } from "lucide-react"
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
  const [isWishlist, setIsWishlist] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0

  const waHref = waLink(
    `Olá! Tenho interesse em: ${product.name} — R$ ${Number(product.price).toFixed(2)} (${product.unit})`,
  )

  return (
    <div 
      className="group relative flex flex-col h-full overflow-hidden rounded-[32px] border border-slate-200/60 bg-white transition-all duration-500 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Actions & Badges */}
      <div className="absolute inset-x-4 top-4 z-10 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-2">
          {product.is_new && (
            <div className="flex items-center bg-secondary/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg border border-white/20">
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">NOVO</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex items-center bg-[#F47920] text-white px-3 py-1.5 rounded-full shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-widest">-{discount}%</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={(e) => {
            e.preventDefault()
            setIsWishlist(!isWishlist)
          }}
          className={cn(
            "pointer-events-auto h-10 w-10 flex items-center justify-center rounded-full transition-all duration-300 backdrop-blur-md border",
            isWishlist 
              ? "bg-red-500 text-white border-red-500" 
              : "bg-white/70 text-slate-400 border-white hover:bg-white hover:text-red-500"
          )}
        >
          <Heart className={cn("h-5 w-5", isWishlist && "fill-current")} />
        </button>
      </div>

      {/* Image Section */}
      <Link
        href={`/produto/${product.slug}`}
        className="relative block aspect-square w-full overflow-hidden bg-slate-50/30"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-contain p-10 transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-16 w-16 text-slate-100" />
          </div>
        )}
        
        {/* Rapid Add Overlay */}
        <div className={cn(
          "absolute inset-x-4 bottom-4 z-20 transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
        )}>
          <button
            onClick={(e) => {
              e.preventDefault()
              addToCart(product)
            }}
            className="w-full h-12 bg-white/90 backdrop-blur-xl text-secondary text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl border border-white hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Quick Add
          </button>
        </div>
      </Link>

      {/* Info Section */}
      <div className="flex flex-1 flex-col p-6 pt-2">
        <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Disponível
            </div>
            <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-black text-slate-400">5.0</span>
            </div>
        </div>

        <Link href={`/produto/${product.slug}`} className="mb-6 block group-hover:no-underline">
          <h3 className="line-clamp-2 text-[16px] font-bold leading-tight text-slate-800 transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex flex-col mb-6">
            {product.original_price && product.original_price > product.price && (
              <p className="text-[11px] text-slate-400 line-through font-bold">
                R$ {Number(product.original_price).toFixed(2).replace(".", ",")}
              </p>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-slate-400">R$</span>
              <p className="text-3xl font-black text-slate-950 tracking-tight">
                {Number(product.price).toFixed(2).replace(".", ",")}
              </p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/{product.unit}</span>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Link
              href={`/produto/${product.slug}`}
              className="flex h-14 items-center justify-center gap-3 rounded-[20px] bg-secondary text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200"
            >
              Ver Detalhes
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#25D366] text-white transition-all hover:bg-[#20bd5a] hover:shadow-xl active:scale-95 shadow-lg shadow-emerald-100"
              title="Orçar via WhatsApp"
              onClick={() => trackWhatsAppClick("product_card", `/produto/${product.slug}`)}
            >
              <img src="https://img.icons8.com/color/48/whatsapp--v1.png" alt="WhatsApp" className="h-7 w-7 brightness-0 invert" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
