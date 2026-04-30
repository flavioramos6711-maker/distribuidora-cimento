"use client"

import { use, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { ShoppingCart, Minus, Plus, Package, Star, ChevronRight, Truck, ShieldCheck, Award } from "lucide-react"
import { addToCart } from "@/components/store/product-card"
import Link from "next/link"
import { toast } from "sonner"
import { waLink } from "@/lib/site-config"
import { trackWhatsAppClick } from "@/lib/track-whatsapp"

const supabase = createClient()

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [qty, setQty] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)

  const { data: product, isLoading } = useSWR(`product-${slug}`, async () => {
    const { data } = await supabase.from("products").select("*, categories(name, slug)").eq("slug", slug).single()
    return data
  })

  const { data: reviews, mutate: mutateReviews } = useSWR(product ? `reviews-${product.id}` : null, async () => {
    if (!product) return []
    const { data } = await supabase.from("reviews").select("*").eq("product_id", product.id).eq("approved", true).order("created_at", { ascending: false })
    return data || []
  })

  async function handleSubmitReview() {
    if (!product) return
    if (!reviewForm.name.trim()) { toast.error("Informe seu nome"); return }
    if (!reviewForm.comment.trim()) { toast.error("Escreva um comentario"); return }
    setSubmittingReview(true)
    const { error } = await supabase.from("reviews").insert({
      product_id: product.id,
      customer_name: reviewForm.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      approved: false,
    })
    if (error) { toast.error("Erro ao enviar avaliacao"); setSubmittingReview(false); return }
    toast.success("Avaliacao enviada! Aguarde aprovacao.")
    setReviewForm({ name: "", rating: 5, comment: "" })
    setSubmittingReview(false)
    mutateReviews()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">Produto não encontrado.</p>
      </div>
    )
  }

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean) as string[]
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0
  const avgRating = reviews?.length ? (reviews.reduce((a: number, r: { rating: number }) => a + r.rating, 0) / reviews.length).toFixed(1) : "0.0"
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({ star, count: reviews?.filter((r: { rating: number }) => r.rating === star).length || 0 }))
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        {product.categories && (
          <>
            <Link href={`/categoria/${product.categories.slug}`} className="hover:text-primary transition-colors">{product.categories.name}</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </>
        )}
        <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Column: Images */}
        <div className="lg:col-span-7">
          <div className="sticky top-24 space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-border/40 bg-white shadow-app transition-all">
              {allImages.length > 0 ? (
                <Image 
                  src={allImages[selectedImage]} 
                  alt={product.name} 
                  fill 
                  priority
                  className="object-contain p-8 transition-transform duration-700 hover:scale-110" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/20">
                  <Package className="w-24 h-24 text-muted-foreground/10" />
                </div>
              )}
              
              <div className="absolute left-6 top-6 flex flex-col gap-2">
                {discount > 0 && (
                  <span className="rounded-full bg-[#F47920] px-4 py-1.5 text-xs font-black text-white shadow-lg">
                    -{discount}%
                  </span>
                )}
                {product.is_new && (
                  <span className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-black text-white shadow-lg">NOVO</span>
                )}
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {allImages.map((img: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedImage(i)} 
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      i === selectedImage ? "border-[#002D5B] shadow-lg scale-105" : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-muted text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {product.categories?.name || "Produto"}
              </span>
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(Number(avgRating)) ? "text-amber-400 fill-amber-400" : "text-border"}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-foreground/80">{avgRating}</span>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-black text-[#002D5B] leading-[1.1] mb-6">
              {product.name}
            </h1>

            <div className="space-y-1 mb-8">
              {product.original_price && product.original_price > product.price && (
                <p className="text-lg text-muted-foreground line-through opacity-50 font-medium">
                  R$ {Number(product.original_price).toFixed(2).replace(".", ",")}
                </p>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-[#002D5B]">R$</span>
                <p className="text-5xl font-black text-[#002D5B] tracking-tighter">
                  {Number(product.price).toFixed(2).replace(".", ",")}
                </p>
                <span className="text-lg font-bold text-muted-foreground">/{product.unit}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 mb-8">
              <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
              <span className="text-sm font-bold text-emerald-800">
                {product.stock > 0 ? `Disponível para entrega imediata (${product.stock} em estoque)` : "Produto indisponível no momento"}
              </span>
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Quantidade</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-muted/40 rounded-2xl p-1 border border-border/40">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))} 
                    className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 text-center font-black text-lg text-[#002D5B]">{qty}</span>
                  <button 
                    onClick={() => setQty(Math.min(product.stock, qty + 1))} 
                    className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => addToCart(product, qty)}
                disabled={product.stock <= 0}
                className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#002D5B] text-lg font-black text-white shadow-app transition-all hover:bg-[#003d7a] hover:scale-[1.02] active:scale-95 disabled:opacity-30"
              >
                <ShoppingCart className="h-6 w-6" /> Adicionar ao Carrinho
              </button>
              <a
                href={waLink(`Olá! Tenho interesse no produto: ${product.name} — R$ ${Number(product.price).toFixed(2)}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl border-2 border-emerald-500/20 bg-emerald-50 text-lg font-black text-emerald-700 transition-all hover:bg-emerald-100 hover:border-emerald-500/40 active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Fazer Orçamento
              </a>
            </div>
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-1 gap-4 pt-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                <Truck className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-foreground">Entrega agilizada para sua obra</p>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-foreground">Pagamento seguro na entrega</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details & Reviews Tabs */}
      <div className="mt-20 lg:mt-24">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <div className="lg:col-span-7 space-y-12">
            {product.description && (
              <section>
                <h2 className="text-2xl font-black text-[#002D5B] mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-[#F47920] rounded-full" />
                  Descrição do Produto
                </h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-foreground/80 leading-relaxed text-lg whitespace-pre-line">{product.description}</p>
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-[#002D5B] flex items-center gap-3">
                  <div className="w-2 h-8 bg-[#F47920] rounded-full" />
                  Avaliações
                </h2>
                {reviews && reviews.length > 0 && (
                  <div className="px-4 py-2 bg-muted/40 rounded-full text-sm font-bold text-muted-foreground">
                    {reviews.length} depoimentos
                  </div>
                )}
              </div>

              {/* Rating summary board */}
              <div className="bg-[#002D5B] rounded-[2rem] p-8 text-white mb-10 flex flex-col md:flex-row items-center gap-10">
                <div className="text-center md:border-r md:border-white/10 md:pr-10">
                  <p className="text-7xl font-black leading-none mb-2">{avgRating}</p>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(avgRating)) ? "text-amber-400 fill-amber-400" : "text-white/20"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-white/60 font-medium">Nota média do produto</p>
                </div>
                <div className="flex-1 w-full space-y-3">
                  {ratingCounts.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-4">
                      <span className="text-xs font-bold w-12 text-white/70">{star} estrelas</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: reviews?.length ? `${(count / reviews.length) * 100}%` : "0%" }} />
                      </div>
                      <span className="text-xs font-bold w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Feed */}
              <div className="space-y-6 mb-12">
                {reviews && reviews.length > 0 ? (
                  reviews.map((r: any) => (
                    <div key={r.id} className="p-6 rounded-[1.5rem] border border-border/40 bg-white hover:border-primary/20 transition-all shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-[#002D5B] font-black text-lg">
                          {(r.customer_name || "C").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-foreground">{r.customer_name || "Cliente Verificado"}</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-border"}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-auto font-medium">{new Date(r.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <p className="text-foreground/70 leading-relaxed italic">&ldquo;{r.comment}&rdquo;</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-muted/10 rounded-[2rem] border-2 border-dashed border-border/40">
                    <Star className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium italic">Ainda não há avaliações para este produto.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Review Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-muted/30 rounded-[2.5rem] p-8 border border-border/40">
              <h3 className="text-xl font-black text-[#002D5B] mb-2">Deixe sua opinião</h3>
              <p className="text-sm text-muted-foreground mb-8">Sua avaliação ajuda outros construtores a escolherem os melhores materiais.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Nome Completo</label>
                  <input 
                    value={reviewForm.name} 
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} 
                    className="w-full h-14 px-6 rounded-2xl border border-border/60 bg-white focus:ring-2 focus:ring-[#002D5B]/10 focus:border-[#002D5B]/30 outline-none transition-all font-medium" 
                    placeholder="Como deseja ser identificado?" 
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Sua Nota</label>
                  <div className="flex items-center gap-2 bg-white p-4 rounded-2xl border border-border/60">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button key={i} onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })} className="hover:scale-110 transition-transform">
                        <Star className={`w-8 h-8 ${i < reviewForm.rating ? "text-amber-400 fill-amber-400" : "text-border"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Comentário</label>
                  <textarea 
                    value={reviewForm.comment} 
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} 
                    rows={4} 
                    className="w-full px-6 py-4 rounded-2xl border border-border/60 bg-white focus:ring-2 focus:ring-[#002D5B]/10 focus:border-[#002D5B]/30 outline-none transition-all font-medium resize-none" 
                    placeholder="Conte o que achou da qualidade, entrega..." 
                  />
                </div>

                <button 
                  onClick={handleSubmitReview} 
                  disabled={submittingReview} 
                  className="w-full h-16 bg-[#F47920] text-white rounded-2xl font-black text-lg shadow-lg hover:bg-[#e06b10] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {submittingReview ? "Enviando..." : "Publicar Avaliação"}
                </button>
                <p className="text-[10px] text-center text-muted-foreground px-4">Sua avaliação passará por uma moderação rápida antes de aparecer no site.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
