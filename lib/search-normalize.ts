/** Normalização forense de busca — acentos, CP2/CP3, 50kg, marcas. */

export function normalizeSearch(input: string): string {
  return (input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function canonicalCementSearch(input: string): string {
  let s = ` ${normalizeSearch(input)} `
  // CP2 / CP 2 / CP II -> cp ii
  s = s.replace(/\bcp\s*2\b/g, " cp ii ").replace(/\bcp2\b/g, " cp ii ")
  // CP3 / CP 3 / CP III -> cp iii
  s = s.replace(/\bcp\s*3\b/g, " cp iii ").replace(/\bcp3\b/g, " cp iii ")
  // CP5 / CP 5 / CP V -> cp v
  s = s.replace(/\bcp\s*5\b/g, " cp v ").replace(/\bcp5\b/g, " cp v ")
  // 50 kg / 50kg -> 50kg | 25 kg / 25kg -> 25kg | 20 kg -> 20kg
  s = s.replace(/\b50\s*kg\b/g, " 50kg ").replace(/\b25\s*kg\b/g, " 25kg ").replace(/\b20\s*kg\b/g, " 20kg ")
  // filler/filer, estrutural etc: mantém
  return s.replace(/\s+/g, " ").trim()
}

export function matchesSearch(
  product: { name: string; description?: string | null; slug?: string },
  rawQuery: string
): boolean {
  const q = canonicalCementSearch(rawQuery)
  if (!q) return true
  const hay = canonicalCementSearch(`${product.name || ""} ${product.description || ""} ${product.slug || ""}`)
  const tokens = q.split(" ").filter(Boolean)
  // Todos os tokens precisam aparecer (AND) — ex: "cimento 50kg" exige ambos
  return tokens.every((t) => {
    if (t === "cimento" || t === "cimentos") return hay.includes("cimento")
    if (t === "50kg") return hay.includes("50kg") || hay.includes("50 kg")
    if (t === "25kg") return hay.includes("25kg")
    return hay.includes(t)
  })
}

/** Escapa curingas do LIKE (% _ \) para busca textual segura no Supabase. */
export function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (m) => `\\${m}`)
}

/** Tokens brutos da query (minúsculos, espaços colapsados, sem ,()). */
export function rawTokens(q: string): string[] {
  return q.trim().toLowerCase().replace(/[(),]/g, " ").split(/\s+/).filter(Boolean).slice(0, 6)
}

/**
 * Tokens normalizados p/ coluna `slug` (sem acento): cp2→[cp,ii], 50 kg→[50kg].
 * Usado no OR server-side: (tokens no name) OR (tokens crus no slug)
 * OR (tokens normalizados no slug) — cobre "caue"→"cauê", "cp2"→"CP II".
 */
export function slugTokens(q: string): string[] {
  const norm = normalizeSearch(q)    .replace(/\bcp\s*2\b/g, "cp ii")
    .replace(/\bcp2\b/g, "cp ii")
    .replace(/\bcp\s*3\b/g, "cp iii")
    .replace(/\bcp3\b/g, "cp iii")
    .replace(/\bcp\s*5\b/g, "cp v")
    .replace(/\bcp5\b/g, "cp v")
    .replace(/\b50\s*kg\b/g, "50kg")
    .replace(/\b25\s*kg\b/g, "25kg")
    .replace(/\b20\s*kg\b/g, "20kg")
  return norm.split(" ").filter(Boolean).slice(0, 6)
}
