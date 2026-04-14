import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { isAdmin } from "@/lib/auth/admin"
import { createAdminClient, isAdminServerConfigured } from "@/lib/supabase/admin"

const MAX_BYTES = 8 * 1024 * 1024

/** Bucket no Supabase Storage (crie como público para leitura ou use URL assinada). Padrão: uploads */
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "uploads"

function extFromMime(mime: string): string {
  const m: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  }
  return m[mime.toLowerCase()] || "jpg"
}

export async function POST(request: NextRequest) {
  const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Faça login no painel para enviar arquivos." }, { status: 401 })
  }
  if (!(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 })
  }

  if (!isAdminServerConfigured()) {
    return NextResponse.json(
      {
        error:
          "Upload indisponível: configure SUPABASE_SERVICE_ROLE_KEY no ambiente (ex.: Vercel → Environment Variables).",
      },
      { status: 503 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 })
  }

  const file = formData.get("file")
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Arquivo acima de 8 MB." }, { status: 400 })
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Envie apenas imagens (JPEG, PNG, WebP ou GIF)." }, { status: 400 })
  }

  const admin = createAdminClient()
  const ext = extFromMime(file.type)
  const path = `site/${Date.now()}-${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  })

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        hint:
          `Verifique se o bucket "${BUCKET}" existe no Supabase Storage e se as políticas permitem upload (service role).`,
      },
      { status: 500 },
    )
  }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)
  return jsonWithSession({ url: pub.publicUrl })
}
