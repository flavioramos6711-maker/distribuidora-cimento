"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { SITE } from "@/lib/site-config"
import DynamicBrandLogo from "@/components/store/dynamic-brand-logo"

export default function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erro ao fazer login")
        return
      }

      if (data.session?.access_token && data.session?.refresh_token) {
        const supabase = createClient()
        const { error: sessionErr } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
        if (sessionErr) {
          toast.error(sessionErr.message)
          return
        }
      }

      toast.success("Login realizado com sucesso!")
      router.refresh()
      router.push(redirectTo.startsWith("/") ? redirectTo : "/")
    } catch {
      toast.error("Erro de conexao")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-mesh relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        <div className="flex justify-center mb-10">
          <Link href="/">
            <DynamicBrandLogo variant="full" className="h-12 w-auto" />
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] border border-white p-8 md:p-10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)]">
          <div className="text-center mb-10">
            <h1 className="text-[28px] font-black tracking-tight text-slate-900 mb-2">Bem-vindo de volta</h1>
            <p className="text-[13px] text-slate-500 font-medium">Acesse sua conta para gerenciar seus pedidos na {SITE.shortName}.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">E-mail Corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Senha de Acesso</label>
                <Link href="/recuperar-senha" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Esqueci a senha</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-secondary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-secondary/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Autenticando..." : "Acessar Conta"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-[13px] text-slate-500 font-medium">
              Ainda não é parceiro?{" "}
              <Link href="/cadastro" className="text-primary font-black uppercase tracking-widest hover:underline ml-1">
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
