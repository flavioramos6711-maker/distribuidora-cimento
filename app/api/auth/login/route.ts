import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return Response.json({ error: "Email e senha obrigatorios" }, { status: 400 })
    }

    const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return Response.json({ error: "Credenciais invalidas" }, { status: 401 })
    }

    return jsonWithSession({
      success: true,
      user: data.user,
      session: data.session,
    })
  } catch {
    return Response.json({ error: "Erro interno" }, { status: 500 })
  }
}
