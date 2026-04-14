import { NextRequest } from "next/server"
import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { isAdmin } from "@/lib/auth/admin"
import {
  SITE_SETTINGS_ROW_ID,
  parseBannerImages,
  parseTestimonials,
} from "@/lib/site-settings"

const MAX_CMS_BANNERS = 6
const MAX_TESTIMONIALS = 24

export async function PATCH(request: NextRequest) {
  const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonWithSession({ error: "Faça login no painel." }, { status: 401 })
  }
  if (!(await isAdmin(supabase, user.id))) {
    return jsonWithSession({ error: "Acesso restrito a administradores." }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonWithSession({ error: "JSON inválido." }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return jsonWithSession({ error: "Corpo inválido." }, { status: 400 })
  }

  const b = body as Record<string, unknown>

  const logo_url =
    b.logo_url === null || b.logo_url === "" ? null : typeof b.logo_url === "string" ? b.logo_url : null
  const favicon_url =
    b.favicon_url === null || b.favicon_url === ""
      ? null
      : typeof b.favicon_url === "string"
        ? b.favicon_url
        : null
  const institutional_title =
    b.institutional_title === null || b.institutional_title === ""
      ? null
      : typeof b.institutional_title === "string"
        ? b.institutional_title
        : null
  const institutional_body =
    b.institutional_body === null || b.institutional_body === ""
      ? null
      : typeof b.institutional_body === "string"
        ? b.institutional_body
        : null

  if (!Array.isArray(b.banner_images)) {
    return jsonWithSession({ error: "banner_images deve ser um array." }, { status: 400 })
  }
  const banner_images = parseBannerImages(b.banner_images)
  if (banner_images.length > MAX_CMS_BANNERS) {
    return jsonWithSession(
      { error: `No máximo ${MAX_CMS_BANNERS} banners no CMS.` },
      { status: 400 },
    )
  }

  if (!Array.isArray(b.testimonials)) {
    return jsonWithSession({ error: "testimonials deve ser um array." }, { status: 400 })
  }
  const testimonials = parseTestimonials(b.testimonials)
  if (testimonials.length > MAX_TESTIMONIALS) {
    return jsonWithSession(
      { error: `No máximo ${MAX_TESTIMONIALS} depoimentos.` },
      { status: 400 },
    )
  }

  const payload = {
    id: SITE_SETTINGS_ROW_ID,
    logo_url,
    favicon_url,
    institutional_title,
    institutional_body,
    banner_images,
    testimonials,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single()

  if (error) {
    return jsonWithSession(
      {
        error: error.message,
        hint:
          'Crie a tabela com scripts/011_site_settings_cms.sql no Supabase (tabela "site_settings").',
      },
      { status: 500 },
    )
  }

  return jsonWithSession({ ok: true, data })
}
