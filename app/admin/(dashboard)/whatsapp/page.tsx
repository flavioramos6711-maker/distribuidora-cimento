"use client"

import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2, X, Phone, Power, PowerOff } from "lucide-react"
import { toast } from "sonner"

const supabase = createClient()

const fetchNumbers = async () => {
  const { data } = await supabase.from("whatsapp_numbers").select("*").order("sort_order")
  return data || []
}

type WForm = { name: string; phone: string; sort_order: string; active: boolean }
const emptyForm: WForm = { name: "", phone: "", sort_order: "0", active: true }

export default function WhatsAppPage() {
  const { data: numbers, mutate, isLoading } = useSWR("admin-whatsapp", fetchNumbers)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<WForm>(emptyForm)

  function openNew() { setEditing(null); setForm(emptyForm); setShowForm(true) }

  function openEdit(n: Record<string, unknown>) {
    setEditing(n.id as string)
    setForm({
      name: n.name as string,
      phone: n.phone as string,
      sort_order: String(n.sort_order || 0),
      active: n.active as boolean,
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name || !form.phone) { toast.error("Nome e telefone sao obrigatorios"); return }
    const payload = {
      name: form.name,
      phone: form.phone.replace(/\D/g, ""),
      sort_order: parseInt(form.sort_order) || 0,
      active: form.active,
    }

    if (editing) {
      const { error } = await supabase.from("whatsapp_numbers").update(payload).eq("id", editing)
      if (error) { toast.error(error.message); return }
      toast.success("Numero atualizado!")
    } else {
      const { error } = await supabase.from("whatsapp_numbers").insert(payload)
      if (error) { toast.error(error.message); return }
      toast.success("Numero adicionado!")
    }
    setShowForm(false); mutate()
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir este numero?")) return
    await supabase.from("whatsapp_numbers").delete().eq("id", id)
    toast.success("Numero excluido!"); mutate()
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from("whatsapp_numbers").update({ active: !active }).eq("id", id)
    toast.success(active ? "Numero desativado" : "Numero ativado")
    mutate()
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{numbers?.length || 0} numeros cadastrados</p>
          <p className="text-xs text-muted-foreground mt-1">Gerencie os numeros de WhatsApp que recebem pedidos. O sistema faz rodizio automatico entre os numeros ativos.</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
          <Plus className="w-4 h-4" /> Novo Numero
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-card-foreground">{editing ? "Editar Numero" : "Novo Numero"}</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Nome do Vendedor</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Vendedor 1" className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Numero WhatsApp (com DDI)</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="5516996447972" className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
                <p className="text-xs text-muted-foreground mt-1">Formato: 55 + DDD + numero (ex: 5516996447972)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Ordem</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-card-foreground">Ativo</span>
              </label>
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">{editing ? "Atualizar" : "Adicionar"}</button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {numbers?.map((n) => (
          <div key={n.id} className={`bg-card rounded-xl border border-border p-5 flex items-center justify-between ${!n.active ? "opacity-60" : ""}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${n.active ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-card-foreground">{n.name}</h4>
                <p className="text-sm text-muted-foreground">+{n.phone}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pedidos: {n.order_count || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(n.id, n.active)} className={`p-2 rounded-lg transition ${n.active ? "hover:bg-red-50 text-green-600 hover:text-red-500" : "hover:bg-green-50 text-muted-foreground hover:text-green-600"}`} title={n.active ? "Desativar" : "Ativar"}>
                {n.active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
              </button>
              <button onClick={() => openEdit(n)} className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(n.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {(!numbers || numbers.length === 0) && (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum numero cadastrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
