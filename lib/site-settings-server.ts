import { unstable_cache } from "next/cache"
import { createPublicClient } from "@/lib/supabase/public"
import { SITE_SETTINGS_ROW_ID, type SiteSettingsRow } from "@/lib/site-settings"

async function fetchSiteSettings(): Promise<SiteSettingsRow | null> {
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

// Cache por 5 minutos — Worker reutiliza sem nova query ao Supabase
export const getSiteSettingsServer = unstable_cache(
  fetchSiteSettings,
  ["site-settings"],
  { revalidate: 300, tags: ["site-settings"] }
)
