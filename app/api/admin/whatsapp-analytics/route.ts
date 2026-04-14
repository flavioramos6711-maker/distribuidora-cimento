import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { createAdminClient, isAdminServerConfigured } from "@/lib/supabase/admin"
import { isAdmin } from "@/lib/auth/admin"

export const runtime = "nodejs"

const SELECT_COLUMNS =
  "id, source, page, device_type, browser, os, user_id, created_at" as const

function hintForDbError(message: string): string | undefined {
  const m = message.toLowerCase()
  if (m.includes("does not exist") || m.includes("não existe") || m.includes("schema cache")) {
    return 'Execute o script scripts/003_whatsapp_clicks_analytics.sql no SQL Editor do Supabase para criar a tabela "whatsapp_clicks".'
  }
  if (m.includes("permission denied") || m.includes("rls") || m.includes("policy")) {
    return "Sem permissão na tabela: adicione SUPABASE_SERVICE_ROLE_KEY no .env ou rode a parte de RLS no script 003 (política de leitura para admins)."
  }
  return undefined
}

export async function GET(request: NextRequest) {
  const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const adminOk = await isAdmin(supabase, user.id)
  if (!adminOk) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const runSelect = async (client: typeof supabase) => {
    return client
      .from("whatsapp_clicks")
      .select(SELECT_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(8000)
  }

  try {
    if (isAdminServerConfigured()) {
      const adminSb = createAdminClient()
      const { data, error } = await runSelect(adminSb)
      if (error) {
        const hint = hintForDbError(error.message)
        return jsonWithSession(
          { error: error.message, code: "WHATSAPP_CLICKS_QUERY", hint },
          { status: 500 },
        )
      }
      return jsonWithSession({ rows: data ?? [] })
    }

    // Sem service role: leitura via sessão do admin (exige política RLS em scripts/003)
    const { data, error } = await runSelect(supabase)
    if (error) {
      const hint =
        hintForDbError(error.message) ||
        "Defina SUPABASE_SERVICE_ROLE_KEY no .env (local) ou nas variáveis da Vercel, ou execute o trecho RLS do script 003_whatsapp_clicks_analytics.sql."
      return jsonWithSession(
        {
          error: error.message,
          code: "WHATSAPP_CLICKS_QUERY_FALLBACK",
          hint,
        },
        { status: 500 },
      )
    }

    return jsonWithSession({ rows: data ?? [] })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido"
    const hint =
      isAdminServerConfigured() === false
        ? "Configure SUPABASE_SERVICE_ROLE_KEY na raiz do projeto (mesmo valor do painel Supabase → Settings → API → service_role)."
        : undefined
    return jsonWithSession({ error: msg, code: "WHATSAPP_ANALYTICS_EXCEPTION", hint }, { status: 503 })
  }
}
