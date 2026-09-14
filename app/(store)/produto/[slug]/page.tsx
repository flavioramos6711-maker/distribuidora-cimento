// =============================================================================
// SERVEUR COMPONENT — app/(store)/produto/[slug]/page.tsx
// Server Component com generateMetadata() para SEO e Google Ads
// Garante que o robô do Google leia título, descrição e preço no HTML inicial
// =============================================================================

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SITE } from "@/lib/site-config"
import { ProductPageClient } from "./ProductPageClient"

export const revalidate = 60

// ─── Tipos ────────────────────────────────────────────────────────────
type Review = {
  id: string
  customer_name: string
  rating: number
  comment: string
  created_at: string
  approved: boolean
}

// ─── Função de busca de produto no servidor ──────────────────────────
async function getProduct(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .single()

  if (error || !data) return null
  return data
}

// ─── Gera metadados SEO no servidor ──────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return {
      title: "Produto não encontrado | Cimento & Cal Distribuidora",
      description: "O produto solicitado não foi encontrado em nosso catálogo.",
    }
  }

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean) as string[]
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return {
    title: `${product.name} | Preço de Atacado | Cimento & Cal`,
    description: product.description || `${product.name} — ${SITE.shortName}. Compre com preço de atacado e entrega ágil.`,
    keywords: [product.name, product.category?.name, "materiais de construção", "preço de atacado"],
    images: allImages.length > 0 ? allImages : undefined,
    openGraph: {
      title: `${product.name} | Preço de Atacado | Cimento & Cal`,
      description: product.description || `${product.name} — ${SITE.shortName}. Compre com preço de atacado e entrega ágil.`,
      images: allImages.length > 0 ? allImages : undefined,
      type: "website" as const,
      url: `${SITE.siteUrl}/produto/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${product.name} | Preço de Atacado | Cimento & Cal`,
      description: product.description || `${product.name} — ${SITE.shortName}`,
      images: allImages.length > 0 ? allImages : undefined,
    },
    other: {
      "product:price:amount": product.price.toString(),
      "product:price:currency": "BRL",
      "product:availability": product.stock > 0 ? "in stock" : "out of stock",
      ...(discount > 0 ? { "product:savings:percent": discount.toString() } : {}),
    },
  }
}

// ─── Parâmetros dinâmicos (revalidação) ─────────────────────
// Nota: generateStaticParams removido para evitar problemas de contexto de cookies.
// Os slugs são gerados dinamicamente pelo Next.js on-demand.

// ─── Server Component principal ──────────────────────────────────────
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  return <ProductPageClient product={product} />
}
