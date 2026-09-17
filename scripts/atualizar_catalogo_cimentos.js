/* =============================================================================
 * HIGIENIZAÇÃO FORENSE DO CATÁLOGO DE CIMENTO — Supabase
 * - Remove duplicatas idênticas de Cauê (mantém 1 registro limpo)
 * - Remove niveladores/argamassas da categoria "cimentos"
 * - Upsert dos 8 cimentos oficiais com fotos reais, preço promo + original
 * Uso: node scripts/atualizar_catalogo_cimentos.js
 * ============================================================================= */
const path = require("path")
const dotenv = require("dotenv")

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

const VOTORAN_IMG =
  "https://www.333obra.com.br/media/catalog/product/c/i/cimento_votoran_50kg_1.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width="
const CORINGA_IMG =
  "https://www.333obra.com.br/media/catalog/product/c/i/cimento_coringa_dk2_2.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width="
const CAUE_IMG =
  "https://www.333obra.com.br/media/catalog/product/c/i/cimento_cau_uso_geral_cp2-e_50kg.png?optimize=high&bg-color=255,255,255&fit=bounds&height=&width=&format=jpeg"

async function getCategoryId(slug) {
  const { data, error } = await supabase.from("categories").select("id, name, slug").eq("slug", slug).single()
  if (error || !data) throw new Error(`Categoria '${slug}' não encontrada: ${error?.message || "n/a"}`)
  return data
}

async function main() {
  console.log("🔎 Conectado ao Supabase:", supabaseUrl)

  const catCimentos = await getCategoryId("cimentos")
  const catArgamassas = await getCategoryId("argamassas")
  console.log(`📦 Categoria cimentos: ${catCimentos.id} | argamassas: ${catArgamassas.id}`)

  // ── 1. Listar tudo da categoria cimentos ──
  const { data: allCimentos, error: listErr } = await supabase
    .from("products")
    .select("id, name, slug, price, category_id")
    .eq("category_id", catCimentos.id)
    .order("name")
  if (listErr) throw listErr
  console.log(`📋 Produtos atuais em 'cimentos': ${allCimentos.length}`)

  // ── 2. Desativar duplicatas de Cauê (mantém 1 canônico) ──
  const CAUE_CANONICAL_SLUG = "cimento-caue-uso-geral-cp2-e-50kg-202517"
  const caueDupes = allCimentos.filter(
    (p) => /cau[eê]/i.test(p.name) && p.slug !== CAUE_CANONICAL_SLUG
  )
  // Também inclui o segundo Votoran duplicado (slug longo) como dupe a desativar
  const VOTORAN_DUPE_SLUG = "cimento-cp-ii-f32-todas-obras-50kg-cinza-votoran-992-266"
  const votoranDupe = allCimentos.filter((p) => p.slug === VOTORAN_DUPE_SLUG)

  const toDeactivate = [...caueDupes, ...votoranDupe]
  console.log(`🧹 Cauê duplicatas encontradas: ${caueDupes.length} | Votoran dupe: ${votoranDupe.length}`)

  if (toDeactivate.length > 0) {
    const ids = toDeactivate.map((p) => p.id)
    // Desativar em lotes de 50 para evitar limite de URL
    for (let i = 0; i < ids.length; i += 50) {
      const batch = ids.slice(i, i + 50)
      const { error } = await supabase.from("products").update({ active: false, featured: false }).in("id", batch)
      if (error) throw error
    }
    console.log(`✅ Desativadas ${ids.length} duplicatas (Cauê + Votoran dupe). IDs:`, ids.map((id) => id.slice(0, 8)).join(", "))
  } else {
    console.log("✅ Nenhuma duplicata Cauê pendente.")
  }

  // ── 3. Remover niveladores/argamassas da categoria cimentos ──
  const { data: intrusos, error: intrErr } = await supabase
    .from("products")
    .select("id, name, slug")
    .eq("category_id", catCimentos.id)
    .or("name.ilike.%nivela%,name.ilike.%argamassa%")
  if (intrErr) throw intrErr
  console.log(`🧹 Intrusos (niveladores/argamassas) em 'cimentos': ${intrusos.length}`)

  if (intrusos.length > 0) {
    // Mantém 1 nivelador como representante e move para argamassas; desativa o resto
    const [keeper, ...rest] = intrusos
    const { error: moveErr } = await supabase
      .from("products")
      .update({ category_id: catArgamassas.id, featured: false })
      .eq("id", keeper.id)
    if (moveErr) throw moveErr
    console.log(`➡️  Movido para 'argamassas': ${keeper.name} (${keeper.slug})`)

    if (rest.length > 0) {
      const restIds = rest.map((p) => p.id)
      for (let i = 0; i < restIds.length; i += 50) {
        const batch = restIds.slice(i, i + 50)
        const { error } = await supabase.from("products").update({ active: false, featured: false }).in("id", batch)
        if (error) throw error
      }
      console.log(`✅ Desativados ${rest.length} niveladores duplicados restantes.`)
    }
  }

  // ── 4. Upsert dos 8 cimentos oficiais ──
  const oficiais = [
    {
      slug: "cimento-votoran-todas-as-obras-cp2-50kg",
      name: "Cimento Votoran Todas as Obras CP II-F-32 50kg",
      description:
        "Cimento Votoran Todas as Obras CP II-F-32, saco 50kg. Uso geral: reboco, contrapiso, alvenaria e concreto simples. Palete com 40 sacos ou carga fechada 560–640 sacos com descarga paletizada. NF-e + laudo ABNT NBR 16697.",
      price: 34.9,
      original_price: 39.9,
      category_id: catCimentos.id,
      image_url: VOTORAN_IMG,
      images: [VOTORAN_IMG],
      unit: "sc",
      stock: 5000,
      active: true,
      featured: true,
      is_new: false,
      is_discount: true,
      sku: "VOT-CPIIF32-50",
      weight: 50,
    },
    {
      slug: "cimento-cp-iii-todas-obras-50kg-cinza-votoran-1-unidade-993",
      name: "Cimento Votoran Obras Estruturais CP III-40 50kg",
      description:
        "Cimento Votoran CP III-40 com escória de alto-forno, saco 50kg. Ideal para lajes, vigas, pilares, fundações e ambientes agressivos. Baixo calor de hidratação. Palete 40 sacos / carga fechada com descarga. NBR 16697.",
      price: 35.9,
      original_price: 41.9,
      category_id: catCimentos.id,
      image_url: CORINGA_IMG,
      images: [CORINGA_IMG],
      unit: "sc",
      stock: 5000,
      active: true,
      featured: true,
      is_new: false,
      is_discount: true,
      sku: "VOT-CPIII40-50",
      weight: 50,
    },
    {
      slug: "cimento-votoran-alta-resistencia-cp-v-ari-50kg",
      name: "Cimento Votoran Alta Resistência CP V ARI 50kg",
      description:
        "Cimento Votoran CP V ARI de alta resistência inicial, saco 50kg. Desforma rápida para pré-moldados, industrial e obra acelerada. Entrega em palete ou carga fechada com laudo ABNT.",
      price: 41.9,
      original_price: 47.9,
      category_id: catCimentos.id,
      image_url: VOTORAN_IMG,
      images: [VOTORAN_IMG],
      unit: "sc",
      stock: 3000,
      active: true,
      featured: true,
      is_new: true,
      is_discount: true,
      sku: "VOT-CPVARI-50",
      weight: 50,
    },
    {
      slug: CAUE_CANONICAL_SLUG,
      name: "Cimento Cauê Uso Geral CP II-E-32 50kg",
      description:
        "Cimento Cauê CP II-E-32, saco 50kg. Versátil e econômico para alvenaria, reboco e contrapiso. O queridinho do atacado: palete 40 sacos ou carga fechada 560–640 sacos com descarga inclusa. NBR 16697.",
      price: 34.5,
      original_price: 39.9,
      category_id: catCimentos.id,
      image_url: CAUE_IMG,
      images: [CAUE_IMG],
      unit: "sc",
      stock: 8000,
      active: true,
      featured: true,
      is_new: false,
      is_discount: true,
      sku: "CAU-CPIIE32-50",
      weight: 50,
    },
    {
      slug: "cimento-montes-claros-cp2-50kg",
      name: "Cimento Montes Claros CP II-E-32 50kg",
      description:
        "Cimento Montes Claros CP II-E-32, saco 50kg. Excelente trabalhabilidade para obras e reformas. Menor preço do atacado no palete e na carga fechada, com entrega e descarga.",
      price: 33.9,
      original_price: 38.9,
      category_id: catCimentos.id,
      image_url: CORINGA_IMG,
      images: [CORINGA_IMG],
      unit: "sc",
      stock: 8000,
      active: true,
      featured: true,
      is_new: false,
      is_discount: true,
      sku: "MCL-CPIIE32-50",
      weight: 50,
    },
    {
      slug: "cimento-csn-cp-ii-f-32-50kg",
      name: "Cimento CSN CP II-F-32 50kg",
      description:
        "Cimento CSN CP II-F-32, saco 50kg. Padrão CSN com filler calcário para alvenaria, reboco e concreto simples. Palete 40 sacos / carga fechada com NF-e e laudo.",
      price: 34.2,
      original_price: 39.5,
      category_id: catCimentos.id,
      image_url: CORINGA_IMG,
      images: [CORINGA_IMG],
      unit: "sc",
      stock: 5000,
      active: true,
      featured: false,
      is_new: true,
      is_discount: true,
      sku: "CSN-CPIIF32-50",
      weight: 50,
    },
    {
      slug: "cimento-maua-cp-ii-e-32-50kg",
      name: "Cimento Mauá CP II-E-32 50kg",
      description:
        "Cimento Mauá CP II-E-32, saco 50kg. Tradição e regularidade para obras residenciais e comerciais. Atacado em palete ou carga fechada com descarga paletizada.",
      price: 34.9,
      original_price: 39.9,
      category_id: catCimentos.id,
      image_url: CAUE_IMG,
      images: [CAUE_IMG],
      unit: "sc",
      stock: 5000,
      active: true,
      featured: false,
      is_new: true,
      is_discount: true,
      sku: "MAU-CPIIE32-50",
      weight: 50,
    },
    {
      slug: "cimento-branco-estrutural-25kg",
      name: "Cimento Branco Estrutural 25kg",
      description:
        "Cimento Branco Estrutural, saco 25kg. Para acabamento arquitetônico, mármores, rejuntes especiais e revestimentos finos. Entrega combinada com carga de cimento cinza.",
      price: 58.9,
      original_price: 69.9,
      category_id: catCimentos.id,
      image_url: VOTORAN_IMG,
      images: [VOTORAN_IMG],
      unit: "sc",
      stock: 1500,
      active: true,
      featured: false,
      is_new: false,
      is_discount: true,
      sku: "BRANCO-EST-25",
      weight: 25,
    },
  ]

  console.log("⬆️  Upsert dos 8 cimentos oficiais...")
  const { data: upserted, error: upErr } = await supabase
    .from("products")
    .upsert(oficiais, { onConflict: "slug" })
    .select("id, name, slug, price, original_price, active")
  if (upErr) throw upErr
  console.log(`✅ Upsert concluído: ${upserted.length} registros.`)

  // ── 5. Listagem final ──
  const { data: final, error: finErr } = await supabase
    .from("products")
    .select("name, slug, price, original_price, active, stock")
    .eq("category_id", catCimentos.id)
    .eq("active", true)
    .order("price")
  if (finErr) throw finErr

  console.log("\n===== CATÁLOGO FINAL — CIMENTOS ATIVOS =====")
  final.forEach((p) => {
    const de = p.original_price ? ` (de R$ ${Number(p.original_price).toFixed(2)})` : ""
    console.log(`• ${p.name} | R$ ${Number(p.price).toFixed(2)}${de} | ${p.slug} | estoque ${p.stock}`)
  })
  console.log(`TOTAL ativos em 'cimentos': ${final.length}`)
  console.log("==========================================\n")
}

main().catch((e) => {
  console.error("❌ Falha na higienização:", e.message || e)
  process.exit(1)
})
