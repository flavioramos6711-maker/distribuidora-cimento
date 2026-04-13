import { createHmac, timingSafeEqual } from "node:crypto"
import { ADMIN_SESSION_MAX_AGE_SEC } from "./constants"

export type AdminAccessPayload = {
  /** UUID do admin_users */
  sub: string
  email: string
  name: string | null
  exp: number
}

/**
 * Chave HMAC derivada (nunca usar o service role em texto como chave direta em logs).
 * Ordem: ADMIN_SESSION_SECRET (recomendado) → fallback SUPABASE_SERVICE_ROLE_KEY.
 */
function hmacSecretKey(): Buffer {
  const raw =
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    ""
  if (!raw) {
    throw new Error("Defina ADMIN_SESSION_SECRET ou SUPABASE_SERVICE_ROLE_KEY")
  }
  return createHmac("sha256", "admin-access-v1").update(raw).digest()
}

/** Token no formato base64url(payload).base64url(hmac) */
export function signAdminAccessToken(input: { sub: string; email: string; name: string | null }): string {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SEC
  const payload: AdminAccessPayload = { ...input, exp }
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")
  const sig = createHmac("sha256", hmacSecretKey()).update(body).digest("base64url")
  return `${body}.${sig}`
}

export function verifyAdminAccessToken(token: string | undefined | null): AdminAccessPayload | null {
  if (!token || typeof token !== "string") return null
  const last = token.lastIndexOf(".")
  if (last <= 0) return null
  const body = token.slice(0, last)
  const sig = token.slice(last + 1)
  let key: Buffer
  let expected: string
  try {
    key = hmacSecretKey()
    expected = createHmac("sha256", key).update(body).digest("base64url")
  } catch {
    return null
  }
  if (sig.length !== expected.length) return null
  try {
    if (!timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expected, "utf8"))) return null
  } catch {
    return null
  }
  let payload: AdminAccessPayload
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AdminAccessPayload
  } catch {
    return null
  }
  if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null
  if (typeof payload.sub !== "string" || payload.sub.length < 10) return null
  if (typeof payload.email !== "string" || !payload.email.includes("@")) return null
  return payload
}
