"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

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
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Entrar na sua conta</h1>
        <p className="text-muted-foreground mt-2 text-sm">Acompanhe pedidos e dados da {` `}
          <span className="text-foreground font-medium">Atacado de Construção</span>
        </p>
      </div>
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-8 shadow-sm">
        <div className="mb-5">
          <label className="block text-sm font-medium text-card-foreground mb-2">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 outline-none transition"
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-card-foreground mb-2">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 outline-none transition"
              placeholder="Sua senha"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 shadow-md shadow-primary/15"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <p className="text-center text-sm text-muted-foreground mt-5">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-primary font-semibold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  )
}
