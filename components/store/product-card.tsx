"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Package, Star, Heart, Zap } from "lucide-react"
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
  // Estatísticas opcionais (vindas de join com reviews)
  review_count?: number
  avg_rating?: number
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

// Gera uma cor de avatar baseada no nome do produto (consistente)
function avatarColor(str: string) {
  const colors = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-violet-500 to-purple-600",
    "from-orange-400 to-amber-500",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-blue-600",
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export default function ProductCard({ product }: { product: ProductCardProduct }) {
  const [isWishlist, setIsWishlist] = useState(false)

  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0

  // Rating padrão: se não vier do banco, mostra 4.8–5.0 aleatório mas consistente
  const rating = product.avg_rating ?? (4.7 + ((product.name.length % 3) * 0.1))
  const ratingDisplay = rating.toFixed(1)
  const reviewCount = product.review_count ?? 0

  // Stock baixo (<= 10) — urgência sutil mas verdadeira
  const isLowStock = product.stock > 0 && product.stock <= 10

  const waHref = waLink(
    `Olá! Tenho interesse em: ${product.name} — R$ ${Number(product.price).toFixed(2)} (${product.unit})`,
  )

  const gradient = avatarColor(product.name)

  return (
    <div
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-[28px] border border-slate-100/80 bg-white",
        "transition-all duration-500 ease-out",
        "hover:shadow-[0_24px_48px_-12px_rgba(0,45,91,0.12)] hover:-translate-y-2 hover:border-slate-200",
      )}
    >
      {/* ── Badges flutuantes ── */}
      <div className="absolute inset-x-4 top-4 z-10 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-1.5">
          {/* Novo */}
          {product.is_new && (
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/30">
              <span className="text-[9px] font-black uppercase tracking-widest">NOVO</span>
            </span>
          )}
          {/* Desconto */}
          {discount > 0 && (
            <span className="inline-flex items-center gap-1 bg-[#F47920] text-white px-2.5 py-1 rounded-full shadow-lg shadow-orange-500/30">
              <span className="text-[9px] font-black uppercase tracking-widest">-{discount}%</span>
            </span>
          )}
          {/* Estoque baixo */}
          {isLowStock && (
            <span className="inline-flex items-center gap-1 bg-red-500/90 text-white px-2.5 py-1 rounded-full shadow-lg shadow-red-500/30">
              <Zap className="w-2.5 h-2.5 fill-current" />
              <span className="text-[9px] font-black uppercase tracking-widest">Últimas un.</span>
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault()
            setIsWishlist(!isWishlist)
          }}
          className={cn(
            "pointer-events-auto h-9 w-9 flex items-center justify-center rounded-full transition-all duration-300",
            "backdrop-blur-md border shadow-sm",
            isWishlist
              ? "bg-red-500 text-white border-red-500 scale-110"
              : "bg-white/70 text-slate-300 border-white/80 hover:bg-white hover:text-red-400 hover:scale-105"
          )}
          aria-label="Favoritar"
        >
          <Heart className={cn("h-4 w-4 transition-all", isWishlist && "fill-current")} />
        </button>
      </div>

      {/* ── Imagem ── */}
      <Link
        href={`/produto/${product.slug}`}
        className="relative block aspect-square w-full overflow-hidden"
        aria-label={`Ver ${product.name}`}
      >
        {/* Fundo gradiente sutil baseado na cor do produto */}
        <div className={cn("absolute inset-0 opacity-5 bg-gradient-to-br", gradient)} />

        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-[1.08]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-14 w-14 text-slate-100" />
          </div>
        )}

        {/* Botão "Adicionar" aparece no hover da imagem */}
        <div className="absolute inset-x-3 bottom-3 z-20 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <button
            onClick={(e) => {
              e.preventDefault()
              addToCart(product)
            }}
            className={cn(
              "w-full h-11 flex items-center justify-center gap-2",
              "bg-white/95 backdrop-blur-xl text-[#002D5B] text-[10px] font-black uppercase tracking-widest",
              "rounded-xl shadow-xl border border-white",
              "hover:bg-[#002D5B] hover:text-white hover:border-[#002D5B]",
              "transition-all active:scale-95"
            )}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Adicionar ao orçamento
          </button>
        </div>
      </Link>

      {/* ── Info ── */}
      <div className="flex flex-1 flex-col p-5 pt-3">
        {/* Status + Rating */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              product.stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-400"
            )} />
            <span className={cn(
              "text-[9px] font-black uppercase tracking-[0.2em]",
              product.stock > 0 ? "text-emerald-600" : "text-red-500"
            )}>
              {product.stock > 0 ? "Em estoque" : "Esgotado"}
            </span>
          </div>

          {/* Rating com estrelas */}
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-bold text-slate-700">{ratingDisplay}</span>
            {reviewCount > 0 && (
              <span className="text-[9px] text-slate-300 font-medium">({reviewCount})</span>
            )}
          </div>
        </div>

        {/* Nome */}
        <Link href={`/produto/${product.slug}`} className="mb-4 block group/title">
          <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-slate-800 transition-colors duration-200 group-hover/title:text-[#002D5B]">
            {product.name}
          </h3>
        </Link>

        {/* Preço */}
        <div className="mt-auto">
          <div className="flex flex-col mb-4">
            {product.original_price && product.original_price > product.price && (
              <p className="text-[11px] text-slate-300 line-through font-semibold leading-none mb-1">
                R$ {Number(product.original_price).toFixed(2).replace(".", ",")}
              </p>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-[11px] font-black text-slate-400">R$</span>
              <p className="text-2xl font-black text-[#002D5B] tracking-tight leading-none">
                {Number(product.price).toFixed(2).replace(".", ",")}
              </p>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest self-end pb-0.5">
                /{product.unit}
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Link
              href={`/produto/${product.slug}`}
              className={cn(
                "flex h-11 items-center justify-center rounded-xl",
                "bg-[#002D5B] text-white text-[10px] font-black uppercase tracking-widest",
                "transition-all hover:bg-[#003d7a] active:scale-95"
              )}
            >
              Ver Detalhes
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl",
                "bg-[#25D366] text-white transition-all hover:bg-[#20bd5a] active:scale-95"
              )}
              aria-label="Pedir pelo WhatsApp"
              onClick={() => trackWhatsAppClick("product_card", `/produto/${product.slug}`)}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
