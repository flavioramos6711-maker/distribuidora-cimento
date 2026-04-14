"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Package, MessageCircle } from "lucide-react"
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
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0

  const waHref = waLink(
    `Olá! Tenho interesse em: ${product.name} — R$ ${Number(product.price).toFixed(2)} (${product.unit})`,
  )

  return (
    <div className="relative bg-card rounded-2xl border border-border/90 overflow-hidden group flex flex-col transition-all duration-300 hover:shadow-xl hover:border-primary/25 hover:-translate-y-0.5">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.is_new && (
          <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm">
            Novo
          </span>
        )}
        {discount > 0 && (
          <span className="px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm">
            -{discount}%
          </span>
        )}
        {product.is_discount && discount === 0 && (
          <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm">
            Oferta
          </span>
        )}
      </div>

      <Link href={`/produto/${product.slug}`} className="block relative aspect-square overflow-hidden bg-muted/25">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-contain p-3 sm:p-4 transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/40">
            <Package className="w-16 h-16 text-muted-foreground/25" />
          </div>
        )}
      </Link>

      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3 min-h-0">
        <Link href={`/produto/${product.slug}`} className="min-h-[2.75rem] shrink-0">
          <h3 className="text-sm sm:text-[15px] font-semibold text-card-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex flex-col gap-3 pt-1">
          {product.original_price && product.original_price > product.price && (
            <p className="text-xs text-muted-foreground line-through">
              R$ {Number(product.original_price).toFixed(2).replace(".", ",")}
            </p>
          )}
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">A partir de</p>
            <p className="text-xl sm:text-2xl font-heading font-bold text-primary leading-tight tabular-nums">
              R$ {Number(product.price).toFixed(2).replace(".", ",")}
            </p>
            <p className="text-xs text-muted-foreground">por {product.unit}</p>
          </div>

          <button
            type="button"
            onClick={() => addToCart(product)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/15 transition hover:bg-primary/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 active:scale-[0.99]"
          >
            <ShoppingCart className="w-4 h-4 shrink-0" aria-hidden />
            Adicionar ao orçamento
          </button>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("product_page", `/produto/${product.slug}`)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:border-emerald-500/35 hover:bg-emerald-500/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25"
          >
            <MessageCircle className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
