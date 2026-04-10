import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("admin_session")?.value
  if (!sessionId) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, email, name")
    .eq("id", sessionId)
    .single()

  if (error || !data) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }
  return NextResponse.json({ valid: true, admin: data })
}
