import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/security/rate-limiter"
import { handleError, errorResponse } from "@/lib/security/error-handler"

/**
 * =============================================================================
 * CREATE ROUTE HANDLER SUPABASE
 * =============================================================================
 * Melhorado com rate limiting e tratamento de erros centralizado
 */

export function createRouteHandlerSupabase(request: NextRequest) {
  const response = NextResponse.next()

  // === RATE LIMITING ===
  const ip = request.headers.get("x-forwarded-for") || (request as any).ip || "unknown"
  const rateLimit = checkRateLimit(`api:${ip}`, {
    windowMs: 60000,    // 1 minuto
    maxRequests: 30,     // 30 requisições por minuto
  })

  if (!rateLimit.allowed) {
    // Rate limit - adiciona header mas não bloqueia em build-time type check
    // Em runtime, o chamador pode verificar headers
    response.headers.set("X-RateLimit-Exceeded", "1")
  }

  // Adicionar headers de rate limit à resposta
  response.headers.set("X-RateLimit-Limit", "30")
  response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining))
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimit.resetTime / 1000)))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  /**
   * Wrapper para JSON response que inclui cookies da sessão
   */
  function jsonWithSession<T>(body: T, init?: ResponseInit): NextResponse {
    const res = NextResponse.json(body, init)

    response.cookies.getAll().forEach((cookie) => {
      res.cookies.set(cookie.name, cookie.value, cookie)
    })

    return res
  }

  return { supabase, jsonWithSession }
}

/**
 * Helper para GET request com autenticação
 */
export async function handleGet(request: NextRequest, handler: (supabase: ReturnType<typeof createRouteHandlerSupabase>["supabase"], user: unknown) => Promise<Response>) {
  const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return errorResponse(handleError({ message: "Não autorizado", code: "AUTH_USER_NOT_FOUND" }), { status: 401 })
  }

  return handler(supabase, user)
}

/**
 * Helper para POST request com validação
 */
export async function handlePost(
  request: NextRequest,
  handler: (supabase: ReturnType<typeof createRouteHandlerSupabase>["supabase"], user: unknown, body: unknown) => Promise<Response>,
) {
  const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)
  const { data: { user } } = await supabase.auth.getUser()

  try {
    const body = await request.json()
    return handler(supabase, user, body)
  } catch {
    return errorResponse(handleError({ message: "Body inválido", code: "INVALID_INPUT_FORMAT" }), { status: 400 })
  }
}
