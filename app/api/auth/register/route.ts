import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { createAdminClient } from "@/lib/supabase/admin"
import { AUTH_SCOPE_ADMIN } from "@/lib/auth/scopes"
import { NextRequest } from "next/server"

/**
 * Cadastro via Supabase Auth.
 * - Loja: { name, email, cpf?, phone?, password }
 * - Admin: { scope: "admin", email, password, name? } — só se ADMIN_REGISTRATION_OPEN=true
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const scope = body.scope as string | undefined

    if (scope === AUTH_SCOPE_ADMIN) {
      if (process.env.ADMIN_REGISTRATION_OPEN !== "true") {
        return Response.json(
          { error: "Cadastro de administrador desativado no servidor." },
          { status: 403 }
        )
      }

      const { email, password, name } = body as {
        email?: string
        password?: string
        name?: string
      }
      if (!email || !password) {
        return Response.json({ error: "Email e senha obrigatórios" }, { status: 400 })
      }

      const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: String(email).trim(),
        password: String(password),
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${request.nextUrl.origin}/`,
          data: { full_name: name || null },
        },
      })

      if (authError) {
        return Response.json({ error: authError.message }, { status: 400 })
      }

      const user = authData.user
      if (!user?.id) {
        return Response.json({ error: "Falha ao criar usuário" }, { status: 400 })
      }

      let adminClient
      try {
        adminClient = createAdminClient()
      } catch {
        return Response.json({ error: "Servidor não configurado (service role)." }, { status: 503 })
      }

      const { error: insErr } = await adminClient.from("admins").insert({
        id: user.id,
        email: user.email || String(email).trim(),
        role: "admin",
      })

      if (insErr) {
        console.error("[auth/register admin] insert admins:", insErr)
        return Response.json({ error: "Não foi possível concluir o cadastro de admin." }, { status: 500 })
      }

      const session = authData.session
      return jsonWithSession({
        success: true,
        user,
        session,
        needsEmailConfirmation: Boolean(user && !session),
      })
    }

    const { name, email, cpf, phone, password } = body as {
      name?: string
      email?: string
      cpf?: string
      phone?: string
      password?: string
    }
    if (!name || !email || !password) {
      return Response.json({ error: "Nome, email e senha sao obrigatorios" }, { status: 400 })
    }

    const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${request.nextUrl.origin}/`,
        data: {
          full_name: name,
          cpf: cpf || null,
          phone: phone || null,
        },
      },
    })

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 })
    }

    const session = authData.session
    const user = authData.user

    return jsonWithSession({
      success: true,
      user,
      session,
      needsEmailConfirmation: Boolean(user && !session),
    })
  } catch {
    return Response.json({ error: "Erro interno" }, { status: 500 })
  }
}
