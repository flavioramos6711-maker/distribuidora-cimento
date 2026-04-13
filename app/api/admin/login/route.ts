import { createAdminClient, isAdminServerConfigured } from "@/lib/supabase/admin"
import { attachAdminAccessCookie } from "@/lib/admin/session"
import { findAdminByEmail } from "@/lib/admin/repository"
import { verifyAdminPasswordHash } from "@/lib/admin/password"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * Login do painel admin (tabela public.admin_users + senha bcrypt).
 * Não usa Supabase Auth, não cria usuários, não usa RPC.
 * Sessão: cookie httpOnly `admin_access` com payload assinado (HMAC).
 */
export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development"

  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatorios" }, { status: 400 })
    }

    const emailTrim = String(email).trim()

    if (!isAdminServerConfigured()) {
      if (isDev) {
        return NextResponse.json(
          {
            error:
              "Defina SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL em .env.local e reinicie o servidor. Veja .env.example.",
          },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: "Erro interno" }, { status: 503 })
    }

    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      if (isDev) {
        return NextResponse.json(
          { error: "Falha ao conectar ao Supabase (service role). Confira .env.local." },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: "Erro interno" }, { status: 503 })
    }

    const { admin, error: qErr } = await findAdminByEmail(supabase, emailTrim)
    if (qErr) {
      console.error("[admin login] query:", qErr)
      return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }

    if (!admin || !verifyAdminPasswordHash(String(password), admin.password_hash)) {
      return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    })

    try {
      attachAdminAccessCookie(response, {
        sub: admin.id,
        email: admin.email,
        name: admin.name,
      })
    } catch (e) {
      console.error("[admin login] cookie:", e)
      return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }

    return response
  } catch (err) {
    console.error("[admin login]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    supabaseAdminEnvReady: isAdminServerConfigured(),
  })
}
