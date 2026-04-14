import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { isAdmin } from "@/lib/auth/admin"
import { createAdminClient, isAdminServerConfigured } from "@/lib/supabase/admin"
import { isStorageBucketId, type StorageBucketId, STORAGE_BUCKETS } from "@/lib/storage-buckets"
import { ensureStorageBucket } from "@/lib/supabase/initStorage"

const MAX_BYTES = 8 * 1024 * 1024

/** Prefixo opcional de pasta dentro do bucket (ex.: categorias → produtos/categorias/...) */
const PREFIX_RE = /^[a-z0-9_-]{1,40}$/

function extFromMime(mime: string): string {
  const m: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }
  return m[mime.toLowerCase()] || "jpg"
}

function resolveBucket(formData: FormData): StorageBucketId {
  const raw = formData.get("bucket")
  const s = typeof raw === "string" ? raw.trim().toLowerCase() : ""
  if (isStorageBucketId(s)) return s
  const env = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim().toLowerCase()
  if (env && isStorageBucketId(env)) return env
  return STORAGE_BUCKETS.produtos
}

function resolvePathPrefix(formData: FormData): string {
  const raw = formData.get("path_prefix")
  if (typeof raw !== "string") return ""
  const t = raw.trim().toLowerCase()
  if (!t || !PREFIX_RE.test(t)) return ""
  return t
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
  if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
    return NextResponse.json({ error: "Envie apenas imagens (JPG, PNG ou WebP)." }, { status: 400 })
  }

  const bucket = resolveBucket(formData)
  const prefix = resolvePathPrefix(formData)
  const admin = createAdminClient()
  await ensureStorageBucket(bucket)
  const ext = extFromMime(file.type)
  const rawOriginal = formData.get("original_name")
  const original = typeof rawOriginal === "string" ? rawOriginal.trim() : ""
  const safeOriginal = original.replace(/[^a-z0-9_-]+/gi, "-").slice(0, 80)
  const fileName = `${Date.now()}-${safeOriginal || crypto.randomUUID()}.${ext}`
  const path = prefix ? `${prefix}/${fileName}` : fileName
  const buffer = Buffer.from(await file.arrayBuffer())

  const uploadOnce = async () =>
    admin.storage.from(bucket).upload(path, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    })

  const { error } = await uploadOnce()

  if (error) {
    const isBucketMissing =
      error.message.toLowerCase().includes("bucket not found") ||
      error.message.toLowerCase().includes("not found")
    if (isBucketMissing) {
      try {
        await ensureStorageBucket(bucket)
        const retry = await uploadOnce()
        if (!retry.error) {
          const { data: pub } = admin.storage.from(bucket).getPublicUrl(path)
          return jsonWithSession({ url: pub.publicUrl, bucket, path })
        }
      } catch (e) {
        console.error("[/api/upload] Falha ao garantir bucket", bucket, e)
      }
    }
    return NextResponse.json(
      {
        error: error.message,
        bucket,
        hint: isBucketMissing
          ? `Buckets ausentes. Verifique/crie: "${STORAGE_BUCKETS.produtos}", "${STORAGE_BUCKETS.banners}", "${STORAGE_BUCKETS.logos}".`
          : "Verifique permissões do Storage e variável SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 },
    )
  }

  const { data: pub } = admin.storage.from(bucket).getPublicUrl(path)
  return jsonWithSession({ url: pub.publicUrl, bucket, path })
}
