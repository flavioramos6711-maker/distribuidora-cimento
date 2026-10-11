/**
 * Gera avaliações em massa para TODOS os produtos ativos do catálogo.
 * Uso: node scripts/seed-all-reviews.mjs
 * Requer: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local
 *
 * O endpoint /api/admin/products/seed-reviews-bulk exige autenticação admin.
 * Este script usa a service_role key diretamente no Supabase para buscar
 * os IDs e chama o endpoint autenticado via cookie de sessão admin.
 *
 * ALTERNATIVA DIRETA: inserção via service_role (sem autenticação de rota).
 */
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

// Carregar .env.local manualmente
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local")
    const lines = readFileSync(envPath, "utf-8").split("\n")
    for (const line of lines) {
      const [key, ...rest] = line.split("=")
      if (key && rest.length) {
        process.env[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "")
      }
    }
  } catch (_) {}
}
loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sdafczehznywoeqnfgph.supabase.co"
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Pool de avaliações realistas brasileiras
const REVIEW_POOL = [
  { name: "Carlos Eduardo S.", rating: 5, comment: "Produto de excelente qualidade. Chegou no prazo e bem embalado. Recomendo muito!" },
  { name: "Marcos Antônio R.", rating: 5, comment: "Comprei para reforma da minha casa. Qualidade superior ao que encontro no mercado local. Preço ótimo." },
  { name: "Roberto Almeida", rating: 5, comment: "Entrega rápida e produto conforme descrito. Já é minha segunda compra e continuarei comprando." },
  { name: "Fernanda Costa", rating: 5, comment: "Atendimento excelente! Produto chegou antes do prazo e a qualidade é impecável." },
  { name: "João Paulo M.", rating: 5, comment: "Material de primeira linha. Usei na construção do meu salão e ficou perfeito. Super recomendo." },
  { name: "Ana Paula L.", rating: 4, comment: "Produto muito bom, embalagem perfeita. Só achei o prazo de entrega um pouco longo mas valeu a pena." },
  { name: "Luís Fernando B.", rating: 5, comment: "Melhor custo-benefício que encontrei. Qualidade profissional a preço de atacado. Nota 10!" },
  { name: "Patricia Oliveira", rating: 5, comment: "Comprei para reforma do banheiro. Produto de alta qualidade e o atendimento no WhatsApp foi rápido." },
  { name: "Diego Mendes", rating: 5, comment: "Produto chegou bem embalado e dentro do prazo. Qualidade excelente, vou comprar mais vezes." },
  { name: "Renata Souza", rating: 4, comment: "Ótima qualidade! Usei profissionalmente e o resultado foi excelente. Recomendo para construtores." },
  { name: "Thiago Castro", rating: 5, comment: "Produto de qualidade superior. Comprei para construção e a resistência é muito boa. Ótimo!" },
  { name: "Márcia Ribeiro", rating: 5, comment: "Chegou rápido e bem embalado. Produto com qualidade que esperava. Com certeza voltarei a comprar." },
  { name: "André Silva", rating: 5, comment: "Produto excelente! Preço competitivo e qualidade de primeira. Recomendo a todos os construtores." },
  { name: "Juliana Ferreira", rating: 4, comment: "Muito satisfeita com a compra. Produto de boa qualidade e entrega dentro do prazo. Recomendo!" },
  { name: "Sandro Pereira", rating: 5, comment: "Comprei para minha obra e o produto superou as expectativas. Qualidade e preço imbatíveis!" },
  { name: "Cláudia Santos", rating: 5, comment: "Produto de alta qualidade. Já é a terceira vez que compro aqui e nunca me decepcionou." },
  { name: "Eduardo Lima", rating: 5, comment: "Ótimo produto, excelente qualidade e entrega no prazo. Atendimento via WhatsApp foi perfeito." },
  { name: "Camila Rodrigues", rating: 4, comment: "Produto bom e bem embalado. Entrega demorou um pouco mais que o esperado mas o produto compensou." },
  { name: "Alexandre Nunes", rating: 5, comment: "Qualidade incrível! Usei em projeto profissional e o resultado ficou excelente. Super indico." },
  { name: "Beatriz Martins", rating: 5, comment: "Comprei para reforma da cozinha. Produto de ótima qualidade, chegou perfeito. Recomendo demais!" },
]

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDateInPast(maxDaysAgo) {
  const daysAgo = randomBetween(1, maxDaysAgo)
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(randomBetween(8, 18))
  date.setMinutes(randomBetween(0, 59))
  return date.toISOString()
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function main() {
  console.log("🔍 Buscando todos os produtos ativos...")
  // Paginação para buscar todos os produtos (Supabase limita 1000/query)
  let products = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error: pageError } = await supabase
      .from("products")
      .select("id, name")
      .eq("active", true)
      .order("name")
      .range(from, from + PAGE - 1)
    if (pageError) {
      console.error("❌ Erro ao buscar produtos:", pageError.message)
      process.exit(1)
    }
    if (!data || data.length === 0) break
    products = products.concat(data)
    if (data.length < PAGE) break
    from += PAGE
    console.log(`📦 Carregados ${products.length} produtos até agora...`)
  }
  const error = null // compatibilidade com o bloco abaixo

  console.log(`✅ ${products.length} produtos encontrados. Iniciando geração de avaliações...\n`)

  let totalGenerated = 0
  let totalSkipped = 0

  for (let idx = 0; idx < products.length; idx++) {
    const product = products[idx]
    // Buscar avaliações existentes
    const { data: existing } = await supabase
      .from("reviews")
      .select("comment")
      .eq("product_id", product.id)

    const existingComments = new Set((existing || []).map((r) => r.comment))
    const available = REVIEW_POOL.filter((r) => !existingComments.has(r.comment))

    if (available.length === 0) {
      console.log(`⏭️  [${idx + 1}/${products.length}] ${product.name} — já tem todas as avaliações`)
      totalSkipped++
      continue
    }

    const count = Math.min(randomBetween(8, 15), available.length)
    const selected = shuffle(available).slice(0, count)
    const rows = selected.map((r) => ({
      product_id: product.id,
      customer_name: r.name,
      rating: r.rating,
      comment: r.comment,
      approved: true,
      created_at: randomDateInPast(1095), // até 3 anos atrás
    }))

    const { error: insertError } = await supabase.from("reviews").insert(rows)

    if (insertError) {
      console.error(`❌ [${idx + 1}/${products.length}] ${product.name} — erro:`, insertError.message)
    } else {
      console.log(`✅ [${idx + 1}/${products.length}] ${product.name} — ${rows.length} avaliações inseridas`)
      totalGenerated += rows.length
    }

    // Pausa para não sobrecarregar o banco
    await new Promise((r) => setTimeout(r, 50))
  }

  console.log(`\n🎉 Concluído! ${totalGenerated} avaliações geradas · ${totalSkipped} produtos ignorados (já completos)`)
}

main()
