"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  DEFAULT_INSTITUTIONAL_BODY,
  DEFAULT_INSTITUTIONAL_TITLE,
  DEFAULT_TESTIMONIALS,
  parseBannerImages,
  parseTestimonials,
  type CmsBannerSlide,
  type CmsTestimonial,
} from "@/lib/site-settings"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  ImageIcon,
  Loader2,
  Package,
  Palette,
  Plus,
  Save,
  Trash2,
  Upload,
  FolderTree,
  MessageSquareQuote,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react"
import { uploadImage } from "@/lib/upload-image"

const supabase = createClient()

const MAX_BANNERS = 6

type FormState = {
  logo_url: string
  favicon_url: string
  institutional_title: string
  institutional_body: string
  banner_images: CmsBannerSlide[]
  testimonials: CmsTestimonial[]
  chat_avatar_url: string
  chat_agent_name: string
}

const initialForm = (): FormState => ({
  logo_url: "",
  favicon_url: "",
  institutional_title: DEFAULT_INSTITUTIONAL_TITLE,
  institutional_body: DEFAULT_INSTITUTIONAL_BODY,
  banner_images: [],
  testimonials: DEFAULT_TESTIMONIALS.map((t) => ({ ...t })),
  chat_avatar_url: "",
  chat_agent_name: "Atendente",
})

export default function AdminSiteSettingsPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadKey, setUploadKey] = useState<"logo" | "favicon" | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", "default").maybeSingle()
      if (cancelled) return
      if (error) {
        toast.error(error.message)
        setForm(initialForm())
        setLoading(false)
        return
      }
      if (!data) {
        setForm(initialForm())
        setLoading(false)
        return
      }
      const t = parseTestimonials(data.testimonials)
      setForm({
        logo_url: data.logo_url || "",
        favicon_url: data.favicon_url || "",
        institutional_title: data.institutional_title?.trim() || DEFAULT_INSTITUTIONAL_TITLE,
        institutional_body: data.institutional_body?.trim() || DEFAULT_INSTITUTIONAL_BODY,
        banner_images: parseBannerImages(data.banner_images),
        testimonials: t.length > 0 ? t : DEFAULT_TESTIMONIALS.map((x) => ({ ...x })),
        chat_avatar_url: data.chat_avatar_url || "",
        chat_agent_name: data.chat_agent_name || "Atendente",
      })
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo_url: form.logo_url || null,
          favicon_url: form.favicon_url || null,
          institutional_title: form.institutional_title || null,
          institutional_body: form.institutional_body || null,
          banner_images: form.banner_images,
          testimonials: form.testimonials,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || json.hint || "Falha ao salvar")
        return
      }
      toast.success("Configurações salvas. A loja atualiza na próxima carga.")
    } catch {
      toast.error("Erro de rede ao salvar")
    }
    setSaving(false)
  }

  async function onLogoUpload(e: React.ChangeEvent<HTMLInputElement>, kind: "logo" | "favicon") {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploadKey(kind)
    const data = await uploadImage(file, "logos")
    setUploadKey(null)
    if (data?.url) {
      if (kind === "logo") setForm((f) => ({ ...f, logo_url: data.url }))
      else setForm((f) => ({ ...f, favicon_url: data.url }))
      toast.success(kind === "logo" ? "Logo enviada!" : "Favicon enviado!")
    } else {
      toast.error("Falha no upload")
    }
  }

  async function onBannerSlideUpload(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const data = await uploadImage(file, "banners")
    if (data?.url) {
      setForm((f) => {
        const next = [...f.banner_images]
        next[index] = { ...next[index], image_url: data.url }
        return { ...f, banner_images: next }
      })
      toast.success("Imagem do slide atualizada")
    } else {
      toast.error("Falha no upload")
    }
  }

  function addBannerSlide() {
    if (form.banner_images.length >= MAX_BANNERS) {
      toast.error(`Máximo de ${MAX_BANNERS} banners no CMS`)
      return
    }
    setForm((f) => ({
      ...f,
      banner_images: [...f.banner_images, { image_url: "", title: "", subtitle: "", link: "" }],
    }))
  }

  function removeBannerSlide(i: number) {
    setForm((f) => ({ ...f, banner_images: f.banner_images.filter((_, j) => j !== i) }))
  }

  function moveBanner(i: number, dir: -1 | 1) {
    setForm((f) => {
      const j = i + dir
      if (j < 0 || j >= f.banner_images.length) return f
      const next = [...f.banner_images]
      ;[next[i], next[j]] = [next[j], next[i]]
      return { ...f, banner_images: next }
    })
  }

  function addTestimonial() {
    setForm((f) => ({
      ...f,
      testimonials: [...f.testimonials, { name: "", text: "", rating: 5, role: "" }],
    }))
  }

  function removeTestimonial(i: number) {
    setForm((f) => ({ ...f, testimonials: f.testimonials.filter((_, j) => j !== i) }))
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CMS do site</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Identidade visual e conteúdo institucional. Imagens no Supabase Storage; URLs na tabela{" "}
            <code className="rounded bg-muted px-1 text-xs">site_settings</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar tudo
        </button>
      </div>

      <Tabs defaultValue="marca" className="w-full gap-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1">
          <TabsTrigger value="marca" className="gap-1.5">
            <Palette className="h-4 w-4" /> Marca
          </TabsTrigger>
          <TabsTrigger value="hero" className="gap-1.5">
            <ImageIcon className="h-4 w-4" /> Hero / banners
          </TabsTrigger>
          <TabsTrigger value="conteudo" className="gap-1.5">
            <MessageSquareQuote className="h-4 w-4" /> Institucional & depoimentos
          </TabsTrigger>
          <TabsTrigger value="catalogo" className="gap-1.5">
            <Package className="h-4 w-4" /> Catálogo
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageCircle className="h-4 w-4" /> Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marca" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Logo e favicon</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Envio no bucket <strong>produtos</strong> (pasta <code className="text-xs">cms/</code>). PNG ou WebP recomendados.
          </p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Logo (header)</p>
              <p className="text-xs text-muted-foreground">PNG ou JPEG. Recomendado: 220x44px</p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {form.logo_url ? (
                  <div className="relative h-16 w-40 overflow-hidden rounded-xl border bg-muted/30">
                    <Image src={form.logo_url} alt="Logo" fill unoptimized className="object-contain p-2" />
                  </div>
                ) : (
                  <div className="flex h-16 w-40 items-center justify-center rounded-xl border border-dashed border-orange-300 bg-orange-50 text-xs text-orange-600">
                    Nenhum logo
                  </div>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted/50">
                  <Upload className="h-4 w-4" />
                  {uploadKey === "logo" ? "Enviando…" : "Enviar logo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => onLogoUpload(e, "logo")}
                    disabled={uploadKey !== null}
                  />
                </label>
              </div>
              {form.logo_url && (
                <button
                  type="button"
                  className="mt-2 text-xs text-red-600 underline hover:text-red-700"
                  onClick={() => setForm((f) => ({ ...f, logo_url: "" }))}
                >
                  Remover logo
                </button>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Favicon</p>
              <p className="text-xs text-muted-foreground">PNG ou ICO. Recomendado: 32x32px ou 64x64px</p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {form.favicon_url ? (
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl border bg-muted/30">
                    <Image src={form.favicon_url} alt="Favicon" fill unoptimized className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-orange-300 bg-orange-50 text-[10px] text-orange-600 text-center px-1">
                    Nenhum
                  </div>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted/50">
                  <Upload className="h-4 w-4" />
                  {uploadKey === "favicon" ? "Enviando…" : "Enviar favicon"}
                  <input
                    type="file"
                    accept="image/png,image/x-icon,image/jpeg"
                    className="hidden"
                    onChange={(e) => onLogoUpload(e, "favicon")}
                    disabled={uploadKey !== null}
                  />
                </label>
              </div>
              {form.favicon_url && (
                <button
                  type="button"
                  className="mt-2 text-xs text-red-600 underline hover:text-red-700"
                  onClick={() => setForm((f) => ({ ...f, favicon_url: "" }))}
                >
                  Remover favicon
                </button>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hero" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Banners da Home</h2>
          <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Os banners sao gerenciados no menu Banners.</strong> Acesse{" "}
              <Link href="/admin/banners" className="underline hover:text-blue-600">
                Banners
              </Link>{" "}
              para adicionar, editar ou remover imagens do carrossel.
            </p>
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
              Dimensoes recomendadas: <strong>1920 x 430 pixels</strong> (PNG ou JPEG)
            </p>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Os slides abaixo sao opcionais e sobrepoem os banners da tabela principal quando configurados.
          </p>
          <button
            type="button"
            onClick={addBannerSlide}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted/50"
          >
            <Plus className="h-4 w-4" /> Adicionar slide ({form.banner_images.length}/{MAX_BANNERS})
          </button>
          <div className="mt-4 space-y-4">
            {form.banner_images.map((slide, i) => (
              <div key={i} className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">Slide {i + 1}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveBanner(i, -1)}
                      className="rounded-lg border border-border bg-background p-2 hover:bg-muted/50"
                      aria-label="Subir"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBanner(i, 1)}
                      className="rounded-lg border border-border bg-background p-2 hover:bg-muted/50"
                      aria-label="Descer"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBannerSlide(i)}
                      className="rounded-lg border border-destructive/30 bg-background p-2 text-destructive hover:bg-destructive/10"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">Imagem</label>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      {slide.image_url ? (
                        <div className="relative h-24 w-40 overflow-hidden rounded-lg border">
                          <Image src={slide.image_url} alt="" fill unoptimized className="object-cover" />
                        </div>
                      ) : null}
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs font-medium">
                        <Upload className="h-3.5 w-3.5" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => onBannerSlideUpload(i, e)}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Título</label>
                    <input
                      value={slide.title || ""}
                      onChange={(e) => {
                        const v = e.target.value
                        setForm((f) => {
                          const next = [...f.banner_images]
                          next[i] = { ...next[i], title: v }
                          return { ...f, banner_images: next }
                        })
                      }}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Subtítulo</label>
                    <input
                      value={slide.subtitle || ""}
                      onChange={(e) => {
                        const v = e.target.value
                        setForm((f) => {
                          const next = [...f.banner_images]
                          next[i] = { ...next[i], subtitle: v }
                          return { ...f, banner_images: next }
                        })
                      }}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">Link (opcional)</label>
                    <input
                      value={slide.link || ""}
                      onChange={(e) => {
                        const v = e.target.value
                        setForm((f) => {
                          const next = [...f.banner_images]
                          next[i] = { ...next[i], link: v || null }
                          return { ...f, banner_images: next }
                        })
                      }}
                      placeholder="/produtos ou URL"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conteudo" className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Bloco institucional (home)</h2>
            <label className="mt-4 block text-sm font-medium">Título</label>
            <input
              value={form.institutional_title}
              onChange={(e) => setForm((f) => ({ ...f, institutional_title: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
            />
            <label className="mt-4 block text-sm font-medium">Texto</label>
            <textarea
              value={form.institutional_body}
              onChange={(e) => setForm((f) => ({ ...f, institutional_body: e.target.value }))}
              rows={5}
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Depoimentos</h2>
                <p className="text-sm text-muted-foreground">Exibidos no carrossel da home. Mínimo recomendado: 11.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, testimonials: DEFAULT_TESTIMONIALS.map((t) => ({ ...t })) }))
                  }
                  className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium"
                >
                  Restaurar padrão (11)
                </button>
                <button
                  type="button"
                  onClick={addTestimonial}
                  className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </button>
              </div>
            </div>
            <div className="mt-4 max-h-[480px] space-y-3 overflow-y-auto pr-1">
              {form.testimonials.map((t, i) => (
                <div key={i} className="rounded-xl border border-border/80 bg-muted/15 p-3">
                  <div className="mb-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeTestimonial(i)}
                      className="text-destructive hover:underline text-xs"
                    >
                      Remover
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      placeholder="Nome"
                      value={t.name}
                      onChange={(e) => {
                        const v = e.target.value
                        setForm((f) => {
                          const next = [...f.testimonials]
                          next[i] = { ...next[i], name: v }
                          return { ...f, testimonials: next }
                        })
                      }}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="Cargo / contexto (opcional)"
                      value={t.role || ""}
                      onChange={(e) => {
                        const v = e.target.value
                        setForm((f) => {
                          const next = [...f.testimonials]
                          next[i] = { ...next[i], role: v || undefined }
                          return { ...f, testimonials: next }
                        })
                      }}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={t.rating ?? 5}
                        onChange={(e) => {
                          const n = Number(e.target.value)
                          setForm((f) => {
                            const next = [...f.testimonials]
                            next[i] = { ...next[i], rating: Number.isFinite(n) ? n : 5 }
                            return { ...f, testimonials: next }
                          })
                        }}
                        className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                      <span className="ml-2 text-xs text-muted-foreground">estrelas (1–5)</span>
                    </div>
                    <div className="sm:col-span-2">
                      <textarea
                        placeholder="Texto do depoimento"
                        value={t.text}
                        onChange={(e) => {
                          const v = e.target.value
                          setForm((f) => {
                            const next = [...f.testimonials]
                            next[i] = { ...next[i], text: v }
                            return { ...f, testimonials: next }
                          })
                        }}
                        rows={3}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="catalogo" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Imagens de produtos e categorias</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Para não duplicar lógica de estoque e preços, as imagens de cada produto e categoria continuam sendo
            gerenciadas nas telas dedicadas — com upload já integrado ao Supabase.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/categorias"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition hover:bg-muted/50"
            >
              <FolderTree className="h-4 w-4" /> Categorias
            </Link>
            <Link
              href="/admin/produtos"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition hover:bg-muted/50"
            >
              <Package className="h-4 w-4" /> Produtos
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Chat de Atendimento</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Personalize o avatar e nome do atendente no botao de chat flutuante.
          </p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Avatar do atendente</p>
              <p className="text-xs text-muted-foreground">PNG ou JPEG. Recomendado: 200x200px (circular)</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {form.chat_avatar_url ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary/20 bg-muted/30">
                    <Image src={form.chat_avatar_url} alt="Avatar" fill unoptimized className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-orange-300 bg-orange-50 text-xs text-orange-600">
                    Nenhum
                  </div>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted/50">
                  <Upload className="h-4 w-4" />
                  Enviar avatar
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        const url = await uploadImage(file, "produtos", "cms/chat-avatar")
                        setForm((f) => ({ ...f, chat_avatar_url: url }))
                        toast.success("Avatar enviado!")
                      } catch (err) {
                        toast.error("Erro ao enviar avatar")
                      }
                    }}
                  />
                </label>
              </div>
              {form.chat_avatar_url && (
                <button
                  type="button"
                  className="mt-2 text-xs text-red-600 underline hover:text-red-700"
                  onClick={() => setForm((f) => ({ ...f, chat_avatar_url: "" }))}
                >
                  Remover avatar
                </button>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Nome do atendente</p>
              <p className="text-xs text-muted-foreground">Exibido no cabecalho do chat</p>
              <input
                type="text"
                value={form.chat_agent_name}
                onChange={(e) => setForm((f) => ({ ...f, chat_agent_name: e.target.value }))}
                placeholder="Ex: Atendente, Julia, Vendas..."
                className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
              />
            </div>
          </div>
          
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Visualizacao:</strong> O avatar aparece no botao flutuante e no cabecalho do chat.
              Se nenhum avatar for enviado, usara a imagem padrao do sistema.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-center text-xs text-muted-foreground">
        Primeira vez? Rode <code className="rounded bg-muted px-1">scripts/011_site_settings_cms.sql</code> no Supabase.
      </p>
    </div>
  )
}
