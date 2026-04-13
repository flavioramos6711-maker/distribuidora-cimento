import { timingSafeEqual } from "node:crypto"
import bcrypt from "bcryptjs"

/**
 * Compara senha em texto com valor em `password_hash` (bcrypt ou legado em texto).
 */
export function verifyAdminPasswordHash(plain: string, stored: string | null | undefined): boolean {
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
