import { NextRequest, NextResponse } from "next/server"
import { createAdminClient, isAdminServerConfigured } from "@/lib/supabase/admin"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("admin_session")?.value
  if (!sessionId) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  if (!isAdminServerConfigured()) {
    console.error("[admin verify] SUPABASE_SERVICE_ROLE_KEY ou URL ausentes")
    const isDev = process.env.NODE_ENV === "development"
    return NextResponse.json(
      { valid: false },
      { status: isDev ? 503 : 500 }
    )
  }

  let supabase
  try {
    supabase = createAdminClient()
  } catch (e) {
    console.error("[admin verify] createAdminClient:", e)
    return NextResponse.json({ valid: false }, { status: 500 })
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("id, email, name")
    .eq("id", sessionId)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }
  return NextResponse.json({ valid: true, admin: data })
}
