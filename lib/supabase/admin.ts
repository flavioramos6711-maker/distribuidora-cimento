import { createClient, type SupabaseClient } from "@supabase/supabase-js"

function readEnv(name: string): string | undefined {
  const v = process.env[name]
  if (typeof v !== "string") return undefined
  const t = v.trim()
  return t.length > 0 ? t : undefined
}

/** Indica se URL pública e service role estão definidas (sem expor valores). */
export function isAdminServerConfigured(): boolean {
  return Boolean(readEnv("NEXT_PUBLIC_SUPABASE_URL") && readEnv("SUPABASE_SERVICE_ROLE_KEY"))
}

/** Só para logs no servidor — nunca enviar ao cliente. */
export function getAdminEnvDiagnostics(): {
  hasPublicUrl: boolean
  hasServiceRoleKey: boolean
  keyLength: number
} {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL")
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY")
  return {
    hasPublicUrl: Boolean(url),
    hasServiceRoleKey: Boolean(key),
    keyLength: key?.length ?? 0,
  }
}

/**
 * Cliente Supabase com service role — apenas em código de servidor (Route Handlers, Server Actions).
 * Variável: SUPABASE_SERVICE_ROLE_KEY (arquivo .env.local na raiz do projeto, ao lado de package.json).
 */
export function createAdminClient(): SupabaseClient {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL")
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY")

  if (!url || !key) {
    const missing: string[] = []
    if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!key) missing.push("SUPABASE_SERVICE_ROLE_KEY")
    throw new Error(
      `[createAdminClient] Variável(is) ausente(s) ou vazia(s) após trim: ${missing.join(", ")}. ` +
        `Crie .env.local na raiz do Next.js e reinicie o servidor (pnpm dev).`
    )
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
