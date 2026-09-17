/* =============================================================================
 * CARGA COMPLETA DO CATÁLOGO + GAMA CIMENTOS — Supabase
 * - Lê data/catalogo_refinado_final.json
 * - Importa hidraulicos (~648), rejuntes (~174), telhas (~31), tijolos (~31),
 *   cal-e-gesso + areia-e-pedra em lotes de 100 com upsert por slug
 * - Upsert da gama completa de cimentos (todas as marcas + tipos ABNT)
 * Uso: node scripts/importar_catalogo_completo_e_cimentos.js
 * ============================================================================= */
const fs = require("fs")
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

const CAT_MAP = {
  "cimentos": "c0134152-de0a-42f7-bb87-dd9ec8588983",
  "argamassas": "6df9b914-06d0-484a-9b0c-c2d9192fcfa9",
  "rejuntes": "8463a6e3-5c46-4f1f-b022-45754287d12a",
  "impermeabilizantes": "2ec0f24f-65d1-4282-a428-16667259409c",
  "areia-e-pedra": "5fd60ee9-ce70-4817-bc2d-3dc1a347a84c",
  "cal-e-gesso": "d1d469b3-7209-46df-8429-224db6efd7ae",
  "aco-e-ferragens": "914576a6-f187-4f97-83e1-dd7e0c38dd1b",
  "tijolos-e-blocos": "6b7c9f1f-13d8-477e-a22e-ce0239c927f0",
  "telhas-e-coberturas": "f15547f8-1cc0-4e00-bc26-f45a6ffa7be8",
  "materiais-hidraulicos": "aec3d582-a015-4968-a883-d0913379bf10",
  "materiais-eletricos": "084d0977-0bcf-45b8-9ae4-8acbda5cd1f1",
  "tintas-e-pintura": "5564e59c-c674-4d39-a93e-ba1e8d940627",
  "madeiras-e-esquadrias": "d9e24643-4cf4-405e-96e0-3e185dcb1e3e",
  "ferramentas-e-epis": "c486f6e5-7782-420f-880b-4551c2f8872c",
}

const VOTORAN_IMG =
  "https://www.333obra.com.br/media/catalog/product/c/i/cimento_votoran_50kg_1.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width="
const CORINGA_IMG =
  "https://www.333obra.com.br/media/catalog/product/c/i/cimento_coringa_dk2_2.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width="
const CAUE_IMG =
  "https://www.333obra.com.br/media/catalog/product/c/i/cimento_cau_uso_geral_cp2-e_50kg.png?optimize=high&bg-color=255,255,255&fit=bounds&height=&width=&format=jpeg"

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
}

function stripHtml(html) {
  return String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000)
}

async function upsertBatch(rows, label) {
  let ok = 0
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100)
    const { error } = await supabase.from("products").upsert(batch, { onConflict: "slug" })
    if (error) {
      console.error(`❌ Erro upsert ${label} lote ${i / 100 + 1}:`, error.message)
      throw error
    }
    ok += batch.length
    console.log(`  ⬆️  ${label}: ${ok}/${rows.length}`)
  }
  return ok
}

async function main() {
  console.log("🔎 Supabase:", supabaseUrl)
  const raw = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "data/catalogo_refinado_final.json"), "utf8"))
  console.log(`📦 JSON total: ${raw.length}`)

  const alvos = ["materiais-hidraulicos", "rejuntes", "telhas-e-coberturas", "tijolos-e-blocos", "cal-e-gesso", "areia-e-pedra"]
  const filtrados = raw.filter((p) => alvos.includes(p.categoria_mestre_slug))
  console.log(`🎯 Filtrados (6 categorias): ${filtrados.length}`)

  const porCat = {}
  filtrados.forEach((p) => { porCat[p.categoria_mestre_slug] = (porCat[p.categoria_mestre_slug] || 0) + 1 })
  console.log("Distribuição JSON:", JSON.stringify(porCat))

  const rows = []
  const seen = new Set()
  for (const p of filtrados) {
    const catId = CAT_MAP[p.categoria_mestre_slug]
    if (!catId) continue
    let slug = String(p.url_key || "").trim() || slugify(`${p.name}-${p.sku}`)
    slug = slugify(slug)
    if (!slug || seen.has(slug)) continue
    seen.add(slug)
    const price = Number(p.preco_final) || Number(p.preco_regular) || 0
    if (!price || price <= 0) continue
    const regular = Number(p.preco_regular) || 0
    const image = p.imagem_destaque || (Array.isArray(p.imagens_galeria) ? p.imagens_galeria[0] : null)
    if (!image) continue
    const gallery = Array.isArray(p.imagens_galeria) ? p.imagens_galeria.filter(Boolean).slice(0, 4) : []
    rows.push({
      name: String(p.name).slice(0, 200),
      slug,
      description: stripHtml(p.descricao_texto || p.descricao_html || p.name),
      price,
      original_price: regular > price ? regular : null,
      category_id: catId,
      image_url: image,
      images: gallery.length > 0 ? gallery : [image],
      unit: "un",
      stock: 50,
      active: true,
      featured: false,
      is_new: false,
      is_discount: regular > price,
      sku: String(p.sku || "").slice(0, 60) || null,
    })
  }
  console.log(`✅ Linhas válidas p/ upsert: ${rows.length}`)
  await upsertBatch(rows, "catalogo")

  // ── GAMA COMPLETA DE CIMENTOS ──
  const CAT_CIM = CAT_MAP["cimentos"]
  const C = (slug, name, price, original, img, extra = {}) => ({
    slug, name,
    description: `${name}. Saco com NF-e + laudo ABNT NBR 16697. Palete com 40 sacos ou carga fechada 560–640 sacos com descarga paletizada e frete para SP e região.`,
    price, original_price: original,
    category_id: CAT_CIM,
    image_url: img, images: [img],
    unit: "sc", stock: 5000, active: true,
    featured: false, is_new: false, is_discount: true,
    ...extra,
  })

  const cimentos = [
    C("cimento-votoran-todas-as-obras-cp2-50kg", "Cimento Votoran Todas as Obras CP II-F-32 50kg", 34.9, 39.9, VOTORAN_IMG, { featured: true, sku: "VOT-CPIIF32-50", weight: 50 }),
    C("cimento-cp-iii-todas-obras-50kg-cinza-votoran-1-unidade-993", "Cimento Votoran Obras Estruturais CP III-40 RS 50kg", 35.9, 41.9, CORINGA_IMG, { featured: true, sku: "VOT-CPIII40RS-50", weight: 50 }),
    C("cimento-votoran-alta-resistencia-cp-v-ari-50kg", "Cimento Votoran Alta Resistência CP V ARI 50kg", 41.9, 47.9, VOTORAN_IMG, { featured: true, is_new: true, sku: "VOT-CPVARI-50", weight: 50 }),
    C("cimento-votoran-obras-especiais-cp-iv-32-50kg", "Cimento Votoran Obras Especiais CP IV-32 50kg", 38.9, 44.9, VOTORAN_IMG, { sku: "VOT-CPIV32-50", weight: 50 }),
    C("cimento-caue-uso-geral-cp2-e-50kg-202517", "Cimento Cauê Uso Geral CP II-E-32 50kg", 34.5, 39.9, CAUE_IMG, { featured: true, stock: 8000, sku: "CAU-CPIIE32-50", weight: 50 }),
    C("cimento-caue-estrutural-cp-iii-40-50kg", "Cimento Cauê Estrutural CP III-40 50kg", 36.9, 42.9, CAUE_IMG, { sku: "CAU-CPIII40-50", weight: 50 }),
    C("cimento-montes-claros-cp2-50kg", "Cimento Montes Claros CP II-E-32 50kg", 33.9, 38.9, CORINGA_IMG, { featured: true, stock: 8000, sku: "MCL-CPIIE32-50", weight: 50 }),
    C("cimento-montes-claros-cp-ii-f-32-50kg", "Cimento Montes Claros CP II-F-32 50kg", 34.2, 39.2, CORINGA_IMG, { sku: "MCL-CPIIF32-50", weight: 50 }),
    C("cimento-maua-cp-ii-e-32-50kg", "Cimento Mauá CP II-E-32 50kg", 34.9, 39.9, CAUE_IMG, { featured: true, sku: "MAU-CPIIE32-50", weight: 50 }),
    C("cimento-maua-cp-iii-40-50kg", "Cimento Mauá CP III-40 50kg", 36.5, 41.5, CAUE_IMG, { sku: "MAU-CPIII40-50", weight: 50 }),
    C("cimento-csn-cp-ii-f-32-50kg", "Cimento CSN CP II-F-32 50kg", 34.2, 39.5, CORINGA_IMG, { featured: true, sku: "CSN-CPIIF32-50", weight: 50 }),
    C("cimento-csn-cp-iii-40-rs-50kg", "Cimento CSN CP III-40 RS 50kg", 36.9, 42.5, CORINGA_IMG, { sku: "CSN-CPIII40RS-50", weight: 50 }),
    C("cimento-tupi-cp-ii-e-32-50kg", "Cimento Tupi CP II-E-32 50kg", 33.5, 38.5, CAUE_IMG, { sku: "TUPI-CPIIE32-50", weight: 50 }),
    C("cimento-tupi-cp-iii-40-50kg", "Cimento Tupi CP III-40 50kg", 35.9, 41.9, CAUE_IMG, { sku: "TUPI-CPIII40-50", weight: 50 }),
    C("cimento-ciplan-cp-ii-f-32-50kg", "Cimento Ciplan CP II-F-32 50kg", 34.9, 39.9, CORINGA_IMG, { sku: "CIP-CPIIF32-50", weight: 50 }),
    C("cimento-ciplan-cp-v-ari-50kg", "Cimento Ciplan CP V ARI 50kg", 42.9, 48.9, VOTORAN_IMG, { is_new: true, sku: "CIP-CPVARI-50", weight: 50 }),
    C("cimento-liz-cp-ii-e-32-50kg", "Cimento Liz CP II-E-32 50kg", 33.9, 38.9, CAUE_IMG, { sku: "LIZ-CPIIE32-50", weight: 50 }),
    C("cimento-nassau-cp-ii-f-32-50kg", "Cimento Nassau CP II-F-32 50kg", 34.5, 39.5, CORINGA_IMG, { sku: "NAS-CPIIF32-50", weight: 50 }),
    C("cimento-nassau-cp-iii-40-50kg", "Cimento Nassau CP III-40 50kg", 36.2, 41.2, CORINGA_IMG, { sku: "NAS-CPIII40-50", weight: 50 }),
    C("cimento-apodi-cp-ii-z-32-50kg", "Cimento Apodi CP II-Z-32 50kg", 35.5, 40.5, CORINGA_IMG, { sku: "APO-CPIIZ32-50", weight: 50 }),
    C("cimento-mizu-cp-ii-f-32-50kg", "Cimento Mizu CP II-F-32 50kg", 34.9, 39.9, CORINGA_IMG, { sku: "MIZ-CPIIF32-50", weight: 50 }),
    C("cimento-campeao-cp-ii-f-32-50kg", "Cimento Campeão CP II-F-32 50kg", 33.9, 38.9, CORINGA_IMG, { featured: true, sku: "CAM-CPIIF32-50", weight: 50 }),
    C("cimento-branco-estrutural-25kg", "Cimento Branco Estrutural CPB-40 25kg", 58.9, 69.9, VOTORAN_IMG, { stock: 1500, sku: "BR-E-25", weight: 25 }),
    C("cimento-branco-estrutural-cpb-40-50kg", "Cimento Branco Estrutural CPB-40 50kg", 109.9, 129.9, VOTORAN_IMG, { stock: 800, sku: "BR-E-50", weight: 50 }),
    C("cimento-branco-nao-estrutural-25kg", "Cimento Branco Não-Estrutural 25kg", 54.9, 64.9, VOTORAN_IMG, { stock: 1200, sku: "BR-NE-25", weight: 25 }),
    C("cimento-queimado-pronto-platina-5kg", "Cimento Queimado Pronto Platina 5kg", 39.9, 49.9, CORINGA_IMG, { stock: 800, unit: "un", sku: "Q-PLAT-5", weight: 5 }),
    C("cimento-queimado-pronto-platina-20kg", "Cimento Queimado Pronto Platina 20kg", 119.9, 139.9, CORINGA_IMG, { stock: 600, unit: "un", sku: "Q-PLAT-20", weight: 20 }),
    C("cimento-queimado-pronto-grafite-5kg", "Cimento Queimado Pronto Grafite 5kg", 42.9, 52.9, CORINGA_IMG, { stock: 800, unit: "un", sku: "Q-GRAF-5", weight: 5 }),
    C("cimento-queimado-pronto-grafite-20kg", "Cimento Queimado Pronto Grafite 20kg", 124.9, 144.9, CORINGA_IMG, { stock: 600, unit: "un", sku: "Q-GRAF-20", weight: 20 }),
  ]

  console.log(`⬆️  Upsert cimentos: ${cimentos.length}`)
  await upsertBatch(cimentos, "cimentos")

  // ── Relatório final por categoria (contagem exata) ──
  console.log("\n===== RELATÓRIO FINAL — PRODUTOS ATIVOS POR CATEGORIA =====")
  let grand = 0
  for (const slug of Object.keys(CAT_MAP)) {
    const { count, error } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", CAT_MAP[slug]).eq("active", true)
    if (error) throw error
    grand += count || 0
    console.log(`• ${slug}: ${count}`)
  }
  const { count: total } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true)
  console.log(`TOTAL geral ativos: ${total} (soma 14 oficiais: ${grand})`)
  console.log("==========================================================\n")
}

main().catch((e) => { console.error("❌ Falha:", e.message || e); process.exit(1) })
