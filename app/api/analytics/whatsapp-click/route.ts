import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { parseUserAgent } from "@/lib/user-agent"
import { isWaClickSource } from "@/lib/wa-analytics-sources"

export async function POST(request: NextRequest) {
  try {
    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      return NextResponse.json({ ok: false, error: "Servidor não configurado" }, { status: 503 })
    }

    const body = await request.json()
    const source = body?.source as string
    const page = typeof body?.page === "string" ? body.page.slice(0, 500) : null
    const userId = typeof body?.userId === "string" ? body.userId : null

    if (!isWaClickSource(source)) {
      return NextResponse.json({ error: "Origem inválida" }, { status: 400 })
    }

    const ua = request.headers.get("user-agent")
    const { browser, os, deviceType } = parseUserAgent(ua)
    const { error } = await supabase.from("whatsapp_clicks").insert({
      source,
      page,
      user_id: userId,
      browser,
      os,
      device_type: deviceType,
    })

    if (error) {
      console.error("whatsapp_clicks insert", error.message)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
