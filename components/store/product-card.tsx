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
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-app transition duration-300 hover:z-[1] hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-app-lg">
      <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5 sm:left-3 sm:top-3">
        {product.is_new && (
          <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm sm:text-[10px]">
            Novo
          </span>
        )}
        {discount > 0 && (
          <span className="rounded-full bg-primary px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm sm:text-[10px]">
            -{discount}%
          </span>
        )}
        {product.is_discount && discount === 0 && (
          <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm sm:text-[10px]">
            Oferta
          </span>
        )}
      </div>

      <Link
        href={`/produto/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-gradient-to-b from-white to-muted/30"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.05] sm:p-4"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/30">
            <Package className="h-14 w-14 text-muted-foreground/20 sm:h-16 sm:w-16" />
          </div>
        )}
      </Link>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-3.5 sm:gap-3 sm:p-4">
        <Link href={`/produto/${product.slug}`} className="min-h-[2.5rem] shrink-0 sm:min-h-[2.75rem]">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-[15px]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex flex-col gap-2.5 pt-0.5">
          {product.original_price && product.original_price > product.price && (
            <p className="text-xs text-muted-foreground line-through tabular-nums">
              R$ {Number(product.original_price).toFixed(2).replace(".", ",")}
            </p>
          )}
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">A partir de</p>
            <p className="font-heading text-lg font-bold leading-tight text-primary tabular-nums sm:text-xl md:text-2xl">
              R$ {Number(product.price).toFixed(2).replace(".", ",")}
            </p>
            <p className="text-[11px] text-muted-foreground sm:text-xs">por {product.unit}</p>
          </div>

          <button
            type="button"
            onClick={() => addToCart(product)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary px-2.5 text-[11px] font-semibold leading-tight text-primary-foreground shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-primary/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 active:scale-[0.98] sm:gap-2 sm:px-3 sm:text-sm"
          >
            <ShoppingCart className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
            <span>Adicionar ao carrinho</span>
          </button>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("product_page", `/produto/${product.slug}`)}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-border/70 bg-background px-3 text-xs font-medium text-muted-foreground transition duration-200 hover:scale-[1.01] hover:border-emerald-500/30 hover:bg-emerald-500/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 sm:text-sm"
          >
            <MessageCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600 sm:h-4 sm:w-4" aria-hidden />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
