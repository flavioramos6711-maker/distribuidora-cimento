"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, Lock, Eye, EyeOff, Phone, CreditCard, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { SITE } from "@/lib/site-config"
import DynamicBrandLogo from "@/components/store/dynamic-brand-logo"

function maskCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

function maskPhone(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{1})(\d{4})(\d)/, "$1 $2-$3")
    .replace(/(-\d{4})\d+?$/, "$1")
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", cpf: "", phone: "", password: "", confirmPassword: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function handleChange(field: string, value: string) {
    if (field === "cpf") value = maskCPF(value)
    if (field === "phone") value = maskPhone(value)
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { toast.error("As senhas não coincidem"); return }
    if (form.password.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres"); return }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          cpf: form.cpf,
          phone: form.phone,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Erro ao cadastrar"); return }

      const supabase = createClient()

      if (data.session?.access_token && data.session?.refresh_token) {
        const { error: sessionErr } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
        if (sessionErr) {
          toast.error(sessionErr.message)
          return
        }
      } else if (data.needsEmailConfirmation) {
        toast.info("Confirme seu e-mail para ativar a conta. Depois, faça login.")
        router.push("/login")
        return
      }

      toast.success("Cadastro realizado com sucesso!")
      router.refresh()
      router.push("/")
    } catch {
      toast.error("Erro de conexao")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-mesh relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[540px] relative z-10">
        <div className="flex justify-center mb-10">
          <Link href="/">
            <DynamicBrandLogo variant="full" className="h-10 lg:h-12 w-auto" />
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] border border-white p-8 md:p-12 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)]">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Criar sua conta</h1>
            <p className="text-[13px] text-slate-500 font-medium">Junte-se a centenas de construtores que confiam na {SITE.shortName}.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome Completo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="Seu nome" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">E-mail</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="seu@email.com" required />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">CPF / Documento</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input type="text" value={form.cpf} onChange={(e) => handleChange("cpf", e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="000.000.000-00" maxLength={14} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">WhatsApp / Celular</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input type="text" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="(16) 90000-0000" maxLength={16} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => handleChange("password", e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-12 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="Mín. 6 caracteres" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Confirmar Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input type="password" value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="Repita a senha" required />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full h-14 bg-secondary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-secondary/20 hover:bg-slate-800 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? "Cadastrando..." : "Criar Minha Conta"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-[13px] text-slate-500 font-medium">
              Já possui uma conta?{" "}
              <Link href="/login" className="text-primary font-black uppercase tracking-widest hover:underline ml-1">
                Acesse aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
