import { NextRequest, NextResponse } from "next/server"
import { createAdminClient, isAdminServerConfigured } from "@/lib/supabase/admin"

export const runtime = "nodejs"

async function verifyAdmin(request: NextRequest) {
  const sessionId = request.cookies.get("admin_session")?.value
  if (!sessionId) return null
  if (!isAdminServerConfigured()) {
    console.error("[whatsapp-analytics] env admin incompleto")
    return null
  }
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
    if (!isAdminServerConfigured()) {
      console.error("[whatsapp-analytics] SUPABASE_SERVICE_ROLE_KEY ausente")
      const isDev = process.env.NODE_ENV === "development"
      return NextResponse.json(
        { error: isDev ? "Defina SUPABASE_SERVICE_ROLE_KEY em .env.local" : "Erro interno" },
        { status: isDev ? 503 : 500 }
      )
    }

    const supabase = createAdminClient()
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
