import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

type PendingCookie = { name: string; value: string; options: Record<string, unknown> }

/**
 * Cliente Supabase para Route Handlers: acumula cookies de sessão e repassa
 * para a resposta JSON final (padrão recomendado para @supabase/ssr + App Router).
 */
export function createRouteHandlerSupabase(request: NextRequest) {
  const pending: PendingCookie[] = []
  const cacheHeaders = new Map<string, string>()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          pending.push(...cookiesToSet)
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              if (typeof value === "string") cacheHeaders.set(key, value)
            })
          }
        },
      },
    },
  )

  function jsonWithSession<T>(body: T, init?: ResponseInit) {
    const res = NextResponse.json(body, init)
    pending.forEach(({ name, value, options }) =>
      res.cookies.set(name, value, options as Parameters<typeof res.cookies.set>[2]),
    )
    cacheHeaders.forEach((value, key) => res.headers.set(key, value))
    return res
  }

  return { supabase, jsonWithSession }
}
