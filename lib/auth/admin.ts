import type { SupabaseClient } from "@supabase/supabase-js"

/** Verifica se o usuário autenticado está na tabela public.admins (RLS: própria linha). */
export async function isAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase.from("admins").select("id").eq("id", userId).maybeSingle()
  if (error) return false
  return Boolean(data)
}
