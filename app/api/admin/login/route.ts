import { timingSafeEqual } from "node:crypto"
import bcrypt from "bcryptjs"
import {
  createAdminClient,
  getAdminEnvDiagnostics,
  isAdminServerConfigured,
} from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * A coluna `password_hash` na tabela admin_users deve guardar:
 * - hash bcrypt ($2$ / $2a$ / $2b$ / $2y$), ou
 * - legado: senha em texto (não recomendado).
 *
 * Este endpoint só valida credenciais — não cria usuário admin nem chama signUp.
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
  const isDev = process.env.NODE_ENV === "development"

  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatorios" }, { status: 400 })
    }

    const emailTrim = String(email).trim()
    const envDiag = getAdminEnvDiagnostics()
    const serviceRoleConfigured = isAdminServerConfigured()

    console.log("[admin login]", {
      serviceRoleConfigured,
      hasPublicUrl: envDiag.hasPublicUrl,
      hasServiceRoleKey: envDiag.hasServiceRoleKey,
      serviceRoleKeyLength: envDiag.keyLength,
      emailReceived: emailTrim,
      nodeEnv: process.env.NODE_ENV,
    })

    if (!serviceRoleConfigured) {
      console.error(
        "[admin login] Env incompleto. Local: .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY. Produção: mesmas chaves nas Environment Variables do hospedeiro + redeploy."
      )
      if (isDev) {
        return NextResponse.json(
          {
            error:
              "Ambiente de desenvolvimento: defina SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL em .env.local na raiz do projeto e reinicie `pnpm dev`. Veja .env.example.",
          },
          { status: 503 }
        )
      }
      // 503 reservado a “serviço indisponível por config”: o front pode orientar deploy sem expor segredos.
      return NextResponse.json({ error: "Erro interno" }, { status: 503 })
    }

    let supabase
    try {
      supabase = createAdminClient()
    } catch (e) {
      console.error("[admin login] createAdminClient:", e)
      if (isDev) {
        return NextResponse.json(
          {
            error:
              "Falha ao iniciar cliente Supabase (service role). Verifique .env.local e reinicie o servidor.",
          },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: "Erro interno" }, { status: 503 })
    }

    const emailVariants = Array.from(
      new Set([emailTrim, emailTrim.toLowerCase(), emailTrim.toUpperCase()].filter((e) => e.length > 0))
    )

    const { data: rows, error } = await supabase
      .from("admin_users")
      .select("id, email, name, password_hash")
      .in("email", emailVariants)
      .limit(1)

    const admin = rows?.[0] ?? null

    console.log("[admin login]", { adminRowFound: Boolean(admin), supabaseError: error?.message ?? null })

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
    console.error("[admin login] erro inesperado:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

/**
 * Diagnóstico leve (sem expor chaves). Útil em produção: se supabaseAdminEnvReady for false,
 * configure SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL no painel do hospedeiro e redeploy.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    supabaseAdminEnvReady: isAdminServerConfigured(),
  })
}
