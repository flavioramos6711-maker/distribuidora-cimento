import type { SupabaseClient } from "@supabase/supabase-js"

export type AdminUserRow = {
  id: string
  email: string
  name: string | null
  password_hash: string
}

export function emailLookupVariants(emailTrim: string): string[] {
  return Array.from(
    new Set([emailTrim, emailTrim.toLowerCase(), emailTrim.toUpperCase()].filter((e) => e.length > 0))
  )
}

export async function findAdminByEmail(
  supabase: SupabaseClient,
  emailTrim: string
): Promise<{ admin: AdminUserRow | null; error: Error | null }> {
  const variants = emailLookupVariants(emailTrim)
  const { data: rows, error } = await supabase
    .from("admin_users")
    .select("id, email, name, password_hash")
    .in("email", variants)
    .limit(1)

  if (error) {
    return { admin: null, error: new Error(error.message) }
  }
  const row = rows?.[0]
  if (!row) return { admin: null, error: null }
  return {
    admin: row as AdminUserRow,
    error: null,
  }
}
