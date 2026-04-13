import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

async function verifyAdmin(request: NextRequest) {
  const sessionId = request.cookies.get("admin_session")?.value
  if (!sessionId) return null
  let supabase
  try {
    supabase = createAdminClient()
  } catch {
    return null
  }
  const { data, error } = await supabase.from("admin_users").select("id").eq("id", sessionId).maybeSingle()
  if (error || !data) return null
  return data
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY ausente" }, { status: 503 })
    }
    const { data, error } = await supabase
      .from("whatsapp_clicks")
      .select("id, source, page, device_type, browser, os, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(8000)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rows: data ?? [] })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
