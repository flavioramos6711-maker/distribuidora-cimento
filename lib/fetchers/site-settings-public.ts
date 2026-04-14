import { createClient } from "@/lib/supabase/client"
import { SITE_SETTINGS_ROW_ID, type SiteSettingsRow } from "@/lib/site-settings"

const supabase = createClient()

/** Leitura pública (RLS) para uso na loja com SWR — apenas importar de Client Components. */
export async function getSiteSettingsPublic(): Promise<SiteSettingsRow | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", SITE_SETTINGS_ROW_ID)
    .maybeSingle()

  if (error) return null
  return data as SiteSettingsRow | null
}
