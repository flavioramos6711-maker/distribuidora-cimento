/** Buckets públicos usados pelo painel — devem existir no Supabase Storage (ver scripts/010_supabase_storage_whatsapp_production.sql). */
export const STORAGE_BUCKETS = {
  produtos: "produtos",
  banners: "banners",
  logos: "logos",
} as const

export type StorageBucketId = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS]

export const STORAGE_BUCKET_LIST = Object.values(STORAGE_BUCKETS) as StorageBucketId[]

export function isStorageBucketId(s: string): s is StorageBucketId {
  return STORAGE_BUCKET_LIST.includes(s as StorageBucketId)
}
