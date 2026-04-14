import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { STORAGE_BUCKET_LIST, type StorageBucketId } from "@/lib/storage-buckets"

const ensured = new Set<StorageBucketId>()

const BUCKET_CONFIG = {
  public: true,
  fileSizeLimit: 8 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
}

export async function ensureStorageBucket(bucket: StorageBucketId): Promise<void> {
  if (ensured.has(bucket)) return

  const admin = createAdminClient()
  const { data, error } = await admin.storage.listBuckets()
  if (error) {
    throw new Error(`[ensureStorageBucket] Falha ao listar buckets: ${error.message}`)
  }

  const exists = (data || []).some((b) => b.id === bucket || b.name === bucket)
  if (!exists) {
    const { error: createError } = await admin.storage.createBucket(bucket, BUCKET_CONFIG)
    if (createError && !createError.message.toLowerCase().includes("already exists")) {
      throw new Error(`[ensureStorageBucket] Falha ao criar bucket "${bucket}": ${createError.message}`)
    }
  }

  ensured.add(bucket)
}

export async function ensureStorageBuckets(): Promise<void> {
  await Promise.all(STORAGE_BUCKET_LIST.map((b) => ensureStorageBucket(b)))
}

