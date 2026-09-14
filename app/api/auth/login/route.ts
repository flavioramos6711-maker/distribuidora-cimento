import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { isAdmin } from "@/lib/auth/admin"
import { AUTH_SCOPE_ADMIN } from "@/lib/auth/scopes"
import { loginSchema } from "@/lib/security/validation"
import { NextRequest } from "next/server"

/**
 * Login via Supabase Auth.
 * - Loja: POST { email, password }
 * - Painel admin: POST { email, password, scope: "admin" } — exige linha em public.admins
 * 
 * Segurança:
 * - Validação de input com Zod
 * - Rate limiting via route-handler
 * - Trimming de email
 * - Tratamento de erros centralizado
 */
export async function POST(request: NextRequest) {
  try {
    // === VALIDAÇÃO DE INPUT ===
    const body = await request.json()
    const parseResult = loginSchema.safeParse(body)

    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => ({
        field: e.path.join("."),
        message: e.message,
      }))
      return Response.json({ error: "Dados inválidos", details: errors }, { status: 400 })
    }

    const { email, password, scope } = parseResult.data

    const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)

    // === AUTENTICAÇÃO ===
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error || !data.session) {
      return jsonWithSession(
        { error: "Credenciais inválidas" },
        { status: 401 },
      )
    }

    // === VERIFICAÇÃO DE ADMIN ===
    if (scope === AUTH_SCOPE_ADMIN) {
      const adminOk = await isAdmin(supabase, data.user.id)
      if (!adminOk) {
        await supabase.auth.signOut()
        return jsonWithSession(
          { error: "Acesso negado: usuário não é administrador." },
          { status: 403 },
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
  } catch (err) {
    console.error("[auth/login] Erro:", err)
    return Response.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}
