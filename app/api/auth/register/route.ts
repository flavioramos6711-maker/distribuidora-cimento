import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { createAdminClient } from "@/lib/supabase/admin"
import { AUTH_SCOPE_ADMIN } from "@/lib/auth/scopes"
import { registerSchema } from "@/lib/security/validation"
import { NextRequest } from "next/server"

/**
 * Cadastro via Supabase Auth.
 * - Loja: { email, password, name, phone? }
 * - Admin: { scope: "admin", email, password, name? } — só se ADMIN_REGISTRATION_OPEN=true
 * 
 * Segurança:
 * - Validação de input com Zod
 * - Rate limiting via route-handler
 * - Trim de email
 * - Tratamento de erros centralizado
 */
export async function POST(request: NextRequest) {
  try {
    // === VALIDAÇÃO DE INPUT ===
    const body = await request.json()
    const parseResult = registerSchema.safeParse(body)

    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => ({
        field: e.path.join("."),
        message: e.message,
      }))
      return Response.json({ error: "Dados inválidos", details: errors }, { status: 400 })
    }

    const { email, password, name, phone } = parseResult.data
    const scope = body.scope as string | undefined

    // === VERIFICAÇÃO DE ADMIN ===
    if (scope === AUTH_SCOPE_ADMIN) {
      if (process.env.ADMIN_REGISTRATION_OPEN !== "true") {
        return Response.json(
          { error: "Cadastro de administrador desativado no servidor." },
          { status: 403 },
        )
      }
    }

    const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)

    // === CADASTRO ===
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${request.nextUrl.origin}/`,
        data: {
          full_name: name,
          phone: phone || null,
        },
      },
    })

    if (authError) {
      return jsonWithSession(
        { error: authError.message },
        { status: 400 },
      )
    }

    const user = authData.user
    if (!user?.id) {
      return jsonWithSession({ error: "Falha ao criar usuário" }, { status: 400 })
    }

    // === CADASTRO ADMIN ===
    if (scope === AUTH_SCOPE_ADMIN) {
      let adminClient
      try {
        adminClient = createAdminClient()
      } catch {
        return jsonWithSession(
          { error: "Servidor não configurado (service role)." },
          { status: 503 },
        )
      }

      const { error: insErr } = await adminClient.from("admins").insert({
        id: user.id,
        email: user.email || email,
        role: "admin",
      })

      if (insErr) {
        console.error("[auth/register admin] insert admins:", insErr)
        return jsonWithSession(
          { error: "Não foi possível concluir o cadastro de admin." },
          { status: 500 },
        )
      }
    }

    const session = authData.session
    return jsonWithSession({
      success: true,
      user,
      session,
      needsEmailConfirmation: Boolean(user && !session),
    })
  } catch (err) {
    console.error("[auth/register] Erro:", err)
    return Response.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}
