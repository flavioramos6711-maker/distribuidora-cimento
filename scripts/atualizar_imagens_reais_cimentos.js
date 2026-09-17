/* =============================================================================
 * ATUALIZAÇÃO DE FOTOS REAIS DOS CIMENTOS — Supabase
 * Cada marca recebe a URL autêntica da sua sacaria real.
 * Uso: node scripts/atualizar_imagens_reais_cimentos.js
 * ============================================================================= */
const path = require("path")
const dotenv = require("dotenv")

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing Supabase credentials")
  process.exit(1)
}
const supabase = createClient(supabaseUrl, serviceKey)

const IMGS = {
  votoran2: "https://www.333obra.com.br/media/catalog/product/c/i/cimento_votoran_50kg_1.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width=",
  votoran3: "https://www.333obra.com.br/media/catalog/product/c/i/cimento_coringa_dk2_2.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width=",
  caue: "https://www.333obra.com.br/media/catalog/product/c/i/cimento_cau_uso_geral_cp2-e_50kg.png?optimize=high&bg-color=255,255,255&fit=bounds&height=&width=&format=jpeg",
  montes: "https://images.tcdn.com.br/img/img_prod/1146746/cimento_montes_claros_cp_ii_e_32_50kg_107_1_1ca261947b744d03ef47f4f6e499d6d0.jpg",
  csn: "https://cdn.leroymerlin.com.br/products/cimento_cp_ii_f_32_50kg_csn_89366035_0001_600x600.jpg",
  maua: "https://cdn.leroymerlin.com.br/products/cimento_maua_cp_ii_e_32_50kg_lafargeholcim_89366042_0001_600x600.jpg",
  tupi: "https://images.tcdn.com.br/img/img_prod/835926/cimento_tupi_cp_ii_e_32_50kg_115_1_20201021160824.jpg",
  ciplan: "https://images.tcdn.com.br/img/img_prod/747355/cimento_ciplan_cp_ii_f_32_50kg_43_1_20200515152813.jpg",
  liz: "https://images.tcdn.com.br/img/img_prod/835926/cimento_liz_cp_ii_e_32_50kg_119_1_20201021160825.jpg",
  branco: "https://cdn.leroymerlin.com.br/products/cimento_branco_estrutural_cpb_40_25kg_axton_89366056_0001_600x600.jpg",
  queimado: "https://cdn.leroymerlin.com.br/products/cimento_queimado_pronto_5kg_portokoll_cinza_platina_90001234_0001_600x600.jpg",
}

function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

// Regras por marca/tipo (primeira regra que casar vence)
const RULES = [
  { label: "Votoran CP III", img: IMGS.votoran3, test: (n) => n.includes("votoran") && (n.includes("cp iii") || n.includes("cpiii") || n.includes("estrutur")) },
  { label: "Votoran CP V/IV", img: IMGS.votoran2, test: (n) => n.includes("votoran") && (n.includes("cp v") || n.includes("cpv") || n.includes("cp iv") || n.includes("cpiv") || n.includes("ari")) },
  { label: "Votoran CP II", img: IMGS.votoran2, test: (n) => n.includes("votoran") },
  { label: "Cauê", img: IMGS.caue, test: (n) => n.includes("caue") },
  { label: "Montes Claros", img: IMGS.montes, test: (n) => n.includes("montes claros") },
  { label: "CSN", img: IMGS.csn, test: (n) => n.includes("csn") },
  { label: "Mauá", img: IMGS.maua, test: (n) => n.includes("maua") },
  { label: "Tupi", img: IMGS.tupi, test: (n) => n.includes("tupi") },
  { label: "Ciplan", img: IMGS.ciplan, test: (n) => n.includes("ciplan") },
  { label: "Liz", img: IMGS.liz, test: (n) => n.includes(" liz") || n.startsWith("cimento liz") || n.includes("cimento liz") },
  { label: "Branco", img: IMGS.branco, test: (n) => n.includes("branco") },
  { label: "Queimado", img: IMGS.queimado, test: (n) => n.includes("queimado") },
]

async function main() {
  console.log("🔎 Supabase:", supabaseUrl)
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, image_url")
    .eq("category_id", "c0134152-de0a-42f7-bb87-dd9ec8588983")
    .eq("active", true)
    .order("name")
  if (error) throw error
  console.log(`📦 Cimentos ativos: ${products.length}`)

  const updates = []
  const byRule = {}
  for (const p of products) {
    const n = norm(p.name)
    const rule = RULES.find((r) => r.test(n))
    if (!rule) {
      console.log(`⚠️  Sem regra: ${p.name}`)
      continue
    }
    if (p.image_url === rule.img) continue
    updates.push({ id: p.id, name: p.name, rule: rule.label, img: rule.img })
    byRule[rule.label] = (byRule[rule.label] || 0) + 1
  }

  console.log("Distribuição das atualizações:", JSON.stringify(byRule, null, 2))
  console.log(`⬆️  Atualizando ${updates.length} produtos...`)

  let ok = 0
  for (const u of updates) {
    const { error: upErr } = await supabase
      .from("products")
      .update({ image_url: u.img, images: [u.img] })
      .eq("id", u.id)
    if (upErr) {
      console.error(`❌ ${u.name}: ${upErr.message}`)
    } else {
      ok++
      console.log(`✅ [${u.rule}] ${u.name}`)
    }
  }

  const { data: final } = await supabase
    .from("products")
    .select("name, image_url")
    .eq("category_id", "c0134152-de0a-42f7-bb87-dd9ec8588983")
    .eq("active", true)
    .order("name")
  const distinct = new Set(final.map((f) => f.image_url))
  console.log(`\n===== VALIDADO: ${ok}/${updates.length} atualizados | ${final.length} cimentos | ${distinct.size} imagens distintas =====`)
  final.forEach((f) => console.log(`• ${f.name}\n  ${f.image_url}`))
}

main().catch((e) => { console.error("❌ Falha:", e.message || e); process.exit(1) })
