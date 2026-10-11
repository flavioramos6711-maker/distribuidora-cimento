import { createPublicClient } from "@/lib/supabase/public"
import { SITE_SETTINGS_ROW_ID, type SiteSettingsRow } from "@/lib/site-settings"

export async function getSiteSettingsServer(): Promise<SiteSettingsRow | null> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", SITE_SETTINGS_ROW_ID)
      .maybeSingle()

    if (error || !data) return null
    return data as SiteSettingsRow
  } catch {
    return null
  }
}
