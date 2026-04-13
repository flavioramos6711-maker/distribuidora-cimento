import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)
    await supabase.auth.signOut()
    return jsonWithSession({ success: true })
  } catch {
    return Response.json({ error: "Erro interno" }, { status: 500 })
  }
}
