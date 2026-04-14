import { isStorageBucketId, type StorageBucketId } from "@/lib/storage-buckets"

type UploadOk = { url: string; bucket: StorageBucketId; path?: string }

function isAllowedImage(file: File): boolean {
  return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)
}

function safeFileName(originalName: string): string {
  const base = originalName
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return base || "imagem"
}

/**
 * Upload padronizado (client-side) via `/api/upload`.
 * - Retorna `null` em caso de erro (não quebra UI).
 * - Faz validação simples de bucket + tipo de arquivo.
 */
export async function uploadImage(file: File | null | undefined, bucket: StorageBucketId): Promise<UploadOk | null> {
  if (!file) return null
  if (!isStorageBucketId(bucket)) return null
  if (!isAllowedImage(file)) return null

  const fd = new FormData()
  fd.append("file", file)
  fd.append("bucket", bucket)
  // Nome único com timestamp + nome original sanitizado (servidor usa o próprio nome, mas mantemos padrão aqui também)
  fd.append("original_name", `${Date.now()}-${safeFileName(file.name)}`)

  try {
    const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" })
    const json = (await res.json()) as { url?: string; bucket?: StorageBucketId; path?: string; error?: string; hint?: string }
    if (!res.ok || !json.url || !json.bucket) {
      console.error("[uploadImage] Falha no upload", { status: res.status, error: json.error, hint: json.hint })
      return null
    }
    return { url: json.url, bucket: json.bucket, path: json.path }
  } catch (e) {
    console.error("[uploadImage] Erro de rede", e)
    return null
  }
}

