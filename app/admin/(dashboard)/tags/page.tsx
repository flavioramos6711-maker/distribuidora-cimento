"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Code2,
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Plus,
  Trash2,
  Edit3,
  X,
  BarChart3,
  Target,
  ShoppingCart,
  MessageCircle,
  Globe,
  Zap,
} from "lucide-react"

const supabase = createClient()

// Tipos de tags suportadas
const TAG_TYPES = [
  {
    id: "gtm",
    name: "Google Tag Manager",
    description: "Gerenciador de tags unificado do Google",
    icon: Code2,
    color: "bg-blue-100 text-blue-600",
    placeholder: "GTM-XXXXXXX",
    link: "https://tagmanager.google.com/",
  },
  {
    id: "google_ads",
    name: "Google Ads",
    description: "Tag de conversao e remarketing",
    icon: Target,
    color: "bg-yellow-100 text-yellow-600",
    placeholder: "AW-XXXXXXXXXXX",
    link: "https://ads.google.com/",
  },
  {
    id: "google_analytics",
    name: "Google Analytics 4",
    description: "Analise de trafego e comportamento",
    icon: BarChart3,
    color: "bg-orange-100 text-orange-600",
    placeholder: "G-XXXXXXXXXX",
    link: "https://analytics.google.com/",
  },
  {
    id: "meta_pixel",
    name: "Meta Pixel (Facebook)",
    description: "Pixel de conversao do Facebook/Instagram",
    icon: Globe,
    color: "bg-indigo-100 text-indigo-600",
    placeholder: "XXXXXXXXXXXXXXXX",
    link: "https://business.facebook.com/events_manager",
  },
  {
    id: "tiktok_pixel",
    name: "TikTok Pixel",
    description: "Pixel de conversao do TikTok Ads",
    icon: Zap,
    color: "bg-pink-100 text-pink-600",
    placeholder: "XXXXXXXXXXXXXXXXXX",
    link: "https://ads.tiktok.com/",
  },
  {
    id: "hotjar",
    name: "Hotjar",
    description: "Mapas de calor e gravacao de sessoes",
    icon: MessageCircle,
    color: "bg-red-100 text-red-600",
    placeholder: "XXXXXXX",
    link: "https://www.hotjar.com/",
  },
  {
    id: "clarity",
    name: "Microsoft Clarity",
    description: "Analise de comportamento gratuita",
    icon: BarChart3,
    color: "bg-cyan-100 text-cyan-600",
    placeholder: "XXXXXXXXXX",
    link: "https://clarity.microsoft.com/",
  },
  {
    id: "custom",
    name: "Tag Personalizada",
    description: "Codigo JavaScript personalizado",
    icon: Code2,
    color: "bg-gray-100 text-gray-600",
    placeholder: "Nome da tag",
    link: "",
  },
] as const

type TagType = (typeof TAG_TYPES)[number]["id"]

type Tag = {
  id: string
  type: TagType
  name: string
  tag_id: string
  enabled: boolean
  code?: string
  conversion_label?: string
  created_at?: string
}

type EditingTag = Omit<Tag, "id" | "created_at"> & { id?: string }

const emptyTag = (): EditingTag => ({
  type: "gtm",
  name: "",
  tag_id: "",
  enabled: true,
  code: "",
  conversion_label: "",
})

// Tags já instaladas no código (layout.tsx)
const INSTALLED_TAGS: Tag[] = [
  {
    id: "installed-gtm",
    type: "gtm",
    name: "Google Tag Manager",
    tag_id: "GTM-MLK62TBK",
    enabled: true,
  },
  {
    id: "installed-gtag",
    type: "google_analytics",
    name: "Google Tag",
    tag_id: "GT-T5JVDZPM",
    enabled: true,
  },
  {
    id: "installed-gads",
    type: "google_ads",
    name: "Google Ads",
    tag_id: "AW-16526087847",
    enabled: true,
    conversion_label: "oaK8CIry9L4aEJbA05c_",
  },
]

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>(INSTALLED_TAGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingTag, setEditingTag] = useState<EditingTag>(emptyTag())
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadTags()
  }, [])

  async function loadTags() {
    setLoading(true)
    const { data, error } = await supabase
      .from("marketing_tags")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Erro ao carregar tags:", error)
      // Se a tabela nao existir, mostra apenas as instaladas
      setTags(INSTALLED_TAGS)
    } else {
      // Combina tags instaladas com tags do banco
      setTags([...INSTALLED_TAGS, ...(data || [])])
    }
    setLoading(false)
  }

  function openAddModal() {
    setEditingTag(emptyTag())
    setIsEditing(false)
    setShowModal(true)
  }

  function openEditModal(tag: Tag) {
    setEditingTag({ ...tag })
    setIsEditing(true)
    setShowModal(true)
  }

  async function handleSaveTag() {
    if (!editingTag.tag_id && editingTag.type !== "custom") {
      toast.error("Preencha o ID da tag")
      return
    }
    if (editingTag.type === "custom" && !editingTag.code) {
      toast.error("Preencha o codigo da tag personalizada")
      return
    }

    setSaving(true)

    const tagType = TAG_TYPES.find((t) => t.id === editingTag.type)
    const tagData = {
      type: editingTag.type,
      name: editingTag.name || tagType?.name || "Tag",
      tag_id: editingTag.tag_id,
      enabled: editingTag.enabled,
      code: editingTag.code || null,
      conversion_label: editingTag.conversion_label || null,
    }

    try {
      if (isEditing && editingTag.id) {
        const { error } = await supabase
          .from("marketing_tags")
          .update(tagData)
          .eq("id", editingTag.id)

        if (error) throw error
        toast.success("Tag atualizada com sucesso!")
      } else {
        const { error } = await supabase.from("marketing_tags").insert(tagData)

        if (error) throw error
        toast.success("Tag adicionada com sucesso!")
      }

      setShowModal(false)
      loadTags()
    } catch (err) {
      console.error(err)
      toast.error("Erro ao salvar tag")
    }

    setSaving(false)
  }

  async function handleDeleteTag(id: string) {
    if (!confirm("Tem certeza que deseja remover esta tag?")) return

    const { error } = await supabase.from("marketing_tags").delete().eq("id", id)

    if (error) {
      toast.error("Erro ao remover tag")
      return
    }

    toast.success("Tag removida com sucesso!")
    loadTags()
  }

  async function toggleTagEnabled(tag: Tag) {
    const { error } = await supabase
      .from("marketing_tags")
      .update({ enabled: !tag.enabled })
      .eq("id", tag.id)

    if (error) {
      toast.error("Erro ao atualizar tag")
      return
    }

    setTags((prev) =>
      prev.map((t) => (t.id === tag.id ? { ...t, enabled: !t.enabled } : t))
    )
    toast.success(tag.enabled ? "Tag desativada" : "Tag ativada")
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success("Copiado!")
  }

  function getTagTypeInfo(type: TagType) {
    return TAG_TYPES.find((t) => t.id === type) || TAG_TYPES[TAG_TYPES.length - 1]
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tags de Marketing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie todas as tags de analytics, conversao e remarketing do site.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Adicionar Tag
        </button>
      </div>

      {/* Informativo */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <div className="flex gap-3">
          <Code2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Tags instaladas no codigo
            </p>
            <p className="mt-1 text-blue-700 dark:text-blue-300">
              As tags com badge &quot;No codigo&quot; estao configuradas diretamente no arquivo{" "}
              <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-xs dark:bg-blue-900">
                app/layout.tsx
              </code>
              . Para alteracoes definitivas, edite este arquivo.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Tags */}
      {tags.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Code2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">Nenhuma tag configurada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Adicione tags do Google, Meta, TikTok e outras plataformas.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Adicionar primeira tag
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tags.map((tag) => {
            const typeInfo = getTagTypeInfo(tag.type)
            const Icon = typeInfo.icon

            return (
              <div
                key={tag.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${typeInfo.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-card-foreground">
                          {tag.name || typeInfo.name}
                        </h3>
                        {tag.id.startsWith("installed-") && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            <Code2 className="h-3 w-3" />
                            No codigo
                          </span>
                        )}
                        {tag.enabled ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            <XCircle className="h-3 w-3" />
                            Inativo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{typeInfo.description}</p>
                      {tag.tag_id && (
                        <div className="mt-1 flex items-center gap-2">
                          <code className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {tag.tag_id}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tag.tag_id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                      {tag.conversion_label && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Rotulo: <code className="rounded bg-muted px-1">{tag.conversion_label}</code>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {typeInfo.link && (
                      <a
                        href={typeInfo.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-muted/50"
                        title="Abrir painel"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleTagEnabled(tag)}
                      className={`rounded-lg border p-2 transition ${
                        tag.enabled
                          ? "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                          : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                      }`}
                      title={tag.enabled ? "Desativar" : "Ativar"}
                    >
                      {tag.enabled ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(tag)}
                      className="rounded-lg border border-border bg-background p-2 text-muted-foreground transition hover:bg-muted/50"
                      title="Editar"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(tag.id)}
                      className="rounded-lg border border-destructive/30 bg-background p-2 text-destructive transition hover:bg-destructive/10"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tipos de Tags Disponiveis */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Tags Suportadas</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Clique em uma tag para adiciona-la ao site.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TAG_TYPES.map((type) => {
            const Icon = type.icon
            const isInstalled = tags.some((t) => t.type === type.id)

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setEditingTag({ ...emptyTag(), type: type.id, name: type.name })
                  setIsEditing(false)
                  setShowModal(true)
                }}
                disabled={isInstalled && type.id !== "custom"}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                  isInstalled && type.id !== "custom"
                    ? "cursor-not-allowed border-green-200 bg-green-50/50 opacity-60"
                    : "border-border bg-background hover:bg-muted/50"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${type.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{type.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {isInstalled && type.id !== "custom" ? "Instalada" : "Adicionar"}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-card-foreground">
                {isEditing ? "Editar Tag" : "Adicionar Tag"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-foreground">Tipo de Tag</label>
                <select
                  value={editingTag.type}
                  onChange={(e) =>
                    setEditingTag((t) => ({
                      ...t,
                      type: e.target.value as TagType,
                      name: TAG_TYPES.find((x) => x.id === e.target.value)?.name || "",
                    }))
                  }
                  disabled={isEditing}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm disabled:opacity-60"
                >
                  {TAG_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-foreground">Nome (opcional)</label>
                <input
                  type="text"
                  value={editingTag.name}
                  onChange={(e) => setEditingTag((t) => ({ ...t, name: e.target.value }))}
                  placeholder={getTagTypeInfo(editingTag.type).name}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                />
              </div>

              {/* ID da Tag */}
              {editingTag.type !== "custom" && (
                <div>
                  <label className="block text-sm font-medium text-foreground">ID da Tag</label>
                  <input
                    type="text"
                    value={editingTag.tag_id}
                    onChange={(e) => setEditingTag((t) => ({ ...t, tag_id: e.target.value }))}
                    placeholder={getTagTypeInfo(editingTag.type).placeholder}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-mono"
                  />
                </div>
              )}

              {/* Rotulo de Conversao (Google Ads) */}
              {editingTag.type === "google_ads" && (
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Rotulo de Conversao (opcional)
                  </label>
                  <input
                    type="text"
                    value={editingTag.conversion_label || ""}
                    onChange={(e) =>
                      setEditingTag((t) => ({ ...t, conversion_label: e.target.value }))
                    }
                    placeholder="oaK8CIry9L4aEJbA05c_"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-mono"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Usado para rastrear conversoes especificas (ex: compra, lead)
                  </p>
                </div>
              )}

              {/* Codigo Personalizado */}
              {editingTag.type === "custom" && (
                <div>
                  <label className="block text-sm font-medium text-foreground">Codigo JavaScript</label>
                  <textarea
                    value={editingTag.code || ""}
                    onChange={(e) => setEditingTag((t) => ({ ...t, code: e.target.value }))}
                    rows={6}
                    placeholder="<script>...</script>"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm"
                  />
                </div>
              )}

              {/* Habilitado */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={editingTag.enabled}
                    onChange={(e) => setEditingTag((t) => ({ ...t, enabled: e.target.checked }))}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-muted peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
                <span className="text-sm text-foreground">Tag ativa</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted/50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTag}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isEditing ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
