import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdmin } from "@/lib/auth/admin"

export const runtime = "nodejs"

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

  try {
    let adminSb
    try {
      adminSb = createAdminClient()
    } catch {
      return NextResponse.json({ error: "Erro interno" }, { status: 503 })
    }

    const { data, error } = await adminSb
      .from("whatsapp_clicks")
      .select("id, source, page, device_type, browser, os, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(8000)

    if (error) {
      return jsonWithSession({ error: error.message }, { status: 500 })
    }

    return jsonWithSession({ rows: data ?? [] })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro"
    return jsonWithSession({ error: msg }, { status: 500 })
  }
}
