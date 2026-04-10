import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, cpf, phone, password } = await request.json()
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

    // Sem sessão: confirmação de e-mail ativa no projeto — o cliente pode orientar o usuário.
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
