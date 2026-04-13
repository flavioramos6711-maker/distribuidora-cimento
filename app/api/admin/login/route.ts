import { timingSafeEqual } from "node:crypto"
import bcrypt from "bcryptjs"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

/**
 * A coluna `password_hash` na tabela admin_users deve guardar:
 * - hash bcrypt ($2a$, $2b$, $2y$), ou
 * - legado: senha em texto (não recomendado; só para compatibilidade com dados antigos).
 */
function verifyStoredPassword(plain: string, stored: string | null | undefined): boolean {
  if (!stored || typeof stored !== "string") return false
  const s = stored.trim()
  if (s.startsWith("$2$") || s.startsWith("$2a$") || s.startsWith("$2b$") || s.startsWith("$2y$")) {
    return bcrypt.compareSync(plain, s)
  }
  try {
    const a = Buffer.from(plain, "utf8")
    const b = Buffer.from(s, "utf8")
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatorios" }, { status: 400 })
    }

    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      return NextResponse.json({ error: "Configuracao do servidor incompleta" }, { status: 503 })
    }

    const emailTrim = String(email).trim()
    let { data: admin, error } = await supabase
      .from("admin_users")
      .select("id, email, name, password_hash")
      .eq("email", emailTrim)
      .maybeSingle()

    if (!error && !admin && emailTrim.toLowerCase() !== emailTrim) {
      ;({ data: admin, error } = await supabase
        .from("admin_users")
        .select("id, email, name, password_hash")
        .eq("email", emailTrim.toLowerCase())
        .maybeSingle())
    }

    if (error) {
      console.error("[admin login] supabase:", error)
      return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }

    if (!admin || !verifyStoredPassword(String(password), admin.password_hash)) {
      return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    })
    response.cookies.set("admin_session", admin.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    return response
  } catch (err) {
    console.error("[v0] Admin login error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
