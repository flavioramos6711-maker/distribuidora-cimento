import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { NextRequest } from "next/server"

/**
 * Login de clientes da loja via Supabase Auth (não usa admin_users).
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

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
