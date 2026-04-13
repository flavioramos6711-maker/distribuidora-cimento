import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { isAdmin } from "@/lib/auth/admin"
import { AUTH_SCOPE_ADMIN } from "@/lib/auth/scopes"
import { NextRequest } from "next/server"

/**
 * Login via Supabase Auth.
 * - Loja: POST { email, password }
 * - Painel admin: POST { email, password, scope: "admin" } — exige linha em public.admins
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, scope } = body as {
      email?: string
      password?: string
      scope?: string
    }

    if (!email || !password) {
      return Response.json({ error: "Email e senha obrigatórios" }, { status: 400 })
    }

    const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(password),
    })

    if (error || !data.session) {
      return Response.json(
        { error: error?.message || "Credenciais inválidas" },
        { status: 401 }
      )
    }

    if (scope === AUTH_SCOPE_ADMIN) {
      const adminOk = await isAdmin(supabase, data.user.id)
      if (!adminOk) {
        await supabase.auth.signOut()
        return jsonWithSession(
          { error: "Acesso negado: usuário não é administrador." },
          { status: 403 }
        )
      }
    }

    return jsonWithSession({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
      user: data.user,
    })
  } catch {
    return Response.json({ error: "Erro interno" }, { status: 500 })
  }
}
