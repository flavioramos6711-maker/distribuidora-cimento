import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("admin_session")?.value
  if (!sessionId) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  let supabase
  try {
    supabase = createAdminClient()
  } catch {
    return NextResponse.json({ valid: false }, { status: 503 })
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
