import { NextRequest, NextResponse } from "next/server"
import { createAdminClient, isAdminServerConfigured } from "@/lib/supabase/admin"
import { getAdminAccessPayload } from "@/lib/admin/session"

export const runtime = "nodejs"

/** Confirma cookie assinado e que o admin ainda existe no banco. */
export async function GET(request: NextRequest) {
  const payload = getAdminAccessPayload(request)
  if (!payload) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  if (!isAdminServerConfigured()) {
    return NextResponse.json({ valid: false }, { status: 503 })
  }

  let supabase
  try {
    supabase = createAdminClient()
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 })
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("id, email, name")
    .eq("id", payload.sub)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  return NextResponse.json({
    valid: true,
    admin: { id: data.id, email: data.email, name: data.name },
  })
}
