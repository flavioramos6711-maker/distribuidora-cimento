"use client"

import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Check, X as XIcon, Trash2, Pencil, Search, MessageSquare, Star } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

const supabase = createClient()

type ReviewWithProduct = {
  id: string
  product_id: string
  customer_name: string
  rating: number
  comment: string
  approved: boolean
  created_at: string
  products: {
    name: string
    image_url: string | null
  }
}

const fetchReviews = async () => {
  const { data } = await supabase
    .from("reviews")
    .select("*, products(name, image_url)")
    .order("created_at", { ascending: false })
  return (data || []) as ReviewWithProduct[]
}

export default function AvaliacoesPage() {
  const { data: reviews, mutate, isLoading } = useSWR("admin-reviews", fetchReviews)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all")
  
  // Seleção em massa
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modal de edição
  const [editingReview, setEditingReview] = useState<ReviewWithProduct | null>(null)
  const [editForm, setEditForm] = useState({ customer_name: "", comment: "", rating: 5 })

  // ─── Ações Individuais ────────────────────────────────────────────────────────

  async function handleToggleApproval(id: string, currentStatus: boolean) {
    const { error } = await supabase.from("reviews").update({ approved: !currentStatus }).eq("id", id)
    if (error) {
      toast.error("Erro ao atualizar status.")
      return
    }
    toast.success(currentStatus ? "Avaliação ocultada!" : "Avaliação aprovada!")
    mutate()
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir esta avaliação?")) return
    const { error } = await supabase.from("reviews").delete().eq("id", id)
    if (error) {
      toast.error("Erro ao excluir.")
      return
    }
    toast.success("Avaliação excluída!")
    // Remove da seleção se estivesse selecionada
    const next = new Set(selectedIds)
    next.delete(id)
    setSelectedIds(next)
    mutate()
  }

  function openEdit(r: ReviewWithProduct) {
    setEditingReview(r)
    setEditForm({ customer_name: r.customer_name, comment: r.comment, rating: r.rating })
  }

  async function handleSaveEdit() {
    if (!editingReview) return
    if (!editForm.customer_name || !editForm.comment) {
      toast.error("Nome e comentário são obrigatórios.")
      return
    }
    const { error } = await supabase.from("reviews").update({
      customer_name: editForm.customer_name,
      comment: editForm.comment,
      rating: editForm.rating
    }).eq("id", editingReview.id)

    if (error) {
      toast.error("Erro ao salvar alterações.")
      return
    }
    toast.success("Avaliação atualizada!")
    setEditingReview(null)
    mutate()
  }

  // ─── Ações em Massa ──────────────────────────────────────────────────────────

  function toggleSelection(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  function toggleAll() {
    if (selectedIds.size === filteredReviews.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredReviews.map((r) => r.id)))
    }
  }

  async function handleBulkApprove() {
    if (selectedIds.size === 0) return
    const { error } = await supabase
      .from("reviews")
      .update({ approved: true })
      .in("id", Array.from(selectedIds))
    
    if (error) toast.error("Erro na aprovação em massa.")
    else {
      toast.success(`${selectedIds.size} avaliações aprovadas!`)
      setSelectedIds(new Set())
      mutate()
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Deseja excluir permanentemente ${selectedIds.size} avaliações?`)) return
    const { error } = await supabase
      .from("reviews")
      .delete()
      .in("id", Array.from(selectedIds))
    
    if (error) toast.error("Erro na exclusão em massa.")
    else {
      toast.success(`${selectedIds.size} avaliações excluídas!`)
      setSelectedIds(new Set())
      mutate()
    }
  }

  // ─── Filtros ────────────────────────────────────────────────────────────────

  const filteredReviews = reviews?.filter((r) => {
    const matchSearch =
      !searchQuery ||
      r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.products?.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "pending" && !r.approved) ||
      (filterStatus === "approved" && r.approved)

    return matchSearch && matchStatus
  }) || []

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Moderação de Avaliações</h1>
          <p className="text-sm text-muted-foreground">
            Aprove comentários de clientes ou edite antes de publicar.
          </p>
        </div>
      </div>

      {/* ─── Controles Superiores ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 mr-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {selectedIds.size} selecionados
            </span>
            <button
              onClick={handleBulkApprove}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-medium hover:bg-emerald-100 transition text-sm"
              title="Aprovar Selecionados"
            >
              <Check className="w-4 h-4" /> Aprovar
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-2 bg-destructive/10 text-destructive rounded-lg font-medium hover:bg-destructive/20 transition text-sm"
              title="Excluir Selecionados"
            >
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </div>
        )}

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, produto ou texto..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendente (Não publicado)</option>
          <option value="approved">Aprovado (Público)</option>
        </select>
      </div>

      {/* ─── Tabela ─── */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr className="border-b border-border">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filteredReviews.length > 0 && selectedIds.size === filteredReviews.length}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-primary cursor-pointer rounded border-border"
                  />
                </th>
                <th className="px-4 py-3 font-semibold">Produto</th>
                <th className="px-4 py-3 font-semibold">Avaliação</th>
                <th className="px-4 py-3 font-semibold w-24">Data</th>
                <th className="px-4 py-3 font-semibold w-28">Status</th>
                <th className="px-4 py-3 font-semibold w-28 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReviews.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(r.id)}
                      onChange={() => toggleSelection(r.id)}
                      className="w-4 h-4 accent-primary cursor-pointer rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {r.products?.image_url ? (
                        <Image src={r.products.image_url} alt="Prod" width={32} height={32} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <p className="font-medium text-foreground line-clamp-2 max-w-[200px]">
                        {r.products?.name || "Produto excluído"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-bold text-foreground">{r.customer_name}</span>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground line-clamp-2" title={r.comment}>
                      "{r.comment}"
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    {r.approved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-widest">
                        Aprovado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-widest">
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleApproval(r.id, r.approved)}
                        className={`p-2 rounded-lg transition-colors ${
                          r.approved
                            ? "hover:bg-amber-50 text-muted-foreground hover:text-amber-600"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                        title={r.approved ? "Ocultar" : "Aprovar"}
                      >
                        {r.approved ? <XIcon className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEdit(r)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhuma avaliação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal de Edição ─── */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl border border-border">
            <h3 className="mb-4 text-lg font-bold text-foreground">Editar Avaliação</h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">Cliente</label>
                <input
                  value={editForm.customer_name}
                  onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">Nota (Estrelas)</label>
                <select
                  value={editForm.rating}
                  onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Estrelas</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">Comentário</label>
                <textarea
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingReview(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
