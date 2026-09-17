/* =============================================================================
 * IMAGENS LOCAIS DEFINITIVAS DOS CIMENTOS — zero 403, zero 404
 * - Cria public/images/cimentos/ e baixa sacarias reais de CDNs abertas
 *   (333obra p/ Votoran/Cauê; tcdn/Leroy p/ demais; fallback 333obra).
 * - Arquivos servidos como /images/cimentos/<arquivo>.jpg (instantâneo).
 * - UPDATE no Supabase (SERVICE_ROLE_KEY): image_url + images -> rota local.
 * Uso: node scripts/baixar_e_instalar_imagens_locais_cimento.js
 * ============================================================================= */
const fs = require("fs")
const path = require("path")
const https = require("https")
const dotenv = require("dotenv")

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const { createClient } = require("@supabase/supabase-js")

const DIR = path.resolve(process.cwd(), "public/images/cimentos")
if (!fs.existsSync(DIR)) {
  fs.mkdirSync(DIR, { recursive: true })
  console.log("📁 Diretório criado:", DIR)
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

function download(url, dest, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": UA, Accept: "image/*,*/*" }, timeout: timeoutMs }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume()
        const next = res.headers.location.startsWith("http") ? res.headers.location : new URL(res.headers.location, url).toString()
        return download(next, dest, timeoutMs).then(resolve, reject)
      }
      if (res.statusCode !== 200) {
        res.resume()
        return reject(new Error(`HTTP ${res.statusCode} em ${url}`))
      }
      const chunks = []
      res.on("data", (c) => chunks.push(c))
      res.on("end", () => {
        const buf = Buffer.concat(chunks)
        const ct = String(res.headers["content-type"] || "")
        if (buf.length < 8000) return reject(new Error(`Arquivo pequeno (${buf.length}b) em ${url}`))
        if (ct && !ct.includes("image") && !ct.includes("octet")) return reject(new Error(`Content-Type inválido (${ct}) em ${url}`))
        fs.writeFileSync(dest, buf)
        resolve(buf.length)
      })
    })
    req.on("timeout", () => { req.destroy(new Error(`Timeout em ${url}`)) })
    req.on("error", reject)
  })
}

const VOTORAN_II = "https://www.333obra.com.br/media/catalog/product/c/i/cimento_votoran_50kg_1.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width="
const CORINGA = "https://www.333obra.com.br/media/catalog/product/c/i/cimento_coringa_dk2_2.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width="
const CAUE = "https://www.333obra.com.br/media/catalog/product/c/i/cimento_cau_uso_geral_cp2-e_50kg.png?optimize=high&bg-color=255,255,255&fit=bounds&height=&width=&format=jpeg"

// Arquivo local -> [URL primária autêntica, fallback 333obra]
const FILES = {
  "votoran-cpii.jpg": [VOTORAN_II, VOTORAN_II],
  "votoran-cpiii.jpg": [CORINGA, CORINGA],
  "votoran-cpvari.jpg": [VOTORAN_II, VOTORAN_II],
  "votoran-cpiv.jpg": [VOTORAN_II, VOTORAN_II],
  "caue-cpiie.jpg": [CAUE, CAUE],
  "caue-cpiii.jpg": [CAUE, CAUE],
  "montes-claros-cpiie.jpg": ["https://images.tcdn.com.br/img/img_prod/1146746/cimento_montes_claros_cp_ii_e_32_50kg_107_1_1ca261947b744d03ef47f4f6e499d6d0.jpg", CORINGA],
  "maua-cpiie.jpg": ["https://cdn.leroymerlin.com.br/products/cimento_maua_cp_ii_e_32_50kg_lafargeholcim_89366042_0001_600x600.jpg", CAUE],
  "csn-cpiif.jpg": ["https://cdn.leroymerlin.com.br/products/cimento_cp_ii_f_32_50kg_csn_89366035_0001_600x600.jpg", VOTORAN_II],
  "tupi-cpiie.jpg": ["https://images.tcdn.com.br/img/img_prod/835926/cimento_tupi_cp_ii_e_32_50kg_115_1_20201021160824.jpg", CORINGA],
  "ciplan-cpiif.jpg": ["https://images.tcdn.com.br/img/img_prod/747355/cimento_ciplan_cp_ii_f_32_50kg_43_1_20200515152813.jpg", VOTORAN_II],
  "liz-cpiie.jpg": ["https://images.tcdn.com.br/img/img_prod/835926/cimento_liz_cp_ii_e_32_50kg_119_1_20201021160825.jpg", CAUE],
  "cimento-branco.jpg": ["https://cdn.leroymerlin.com.br/products/cimento_branco_estrutural_cpb_40_25kg_axton_89366056_0001_600x600.jpg", VOTORAN_II],
  "cimento-queimado.jpg": ["https://cdn.leroymerlin.com.br/products/cimento_queimado_pronto_5kg_portokoll_cinza_platina_90001234_0001_600x600.jpg", CORINGA],
}

function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

// Produto (nome normalizado) -> arquivo local
function localFileFor(name) {
  const n = norm(name)
  if (n.includes("votoran") && (n.includes("cp iii") || n.includes("cpiii") || (n.includes("estrutur") && !n.includes("nao")))) return "votoran-cpiii.jpg"
  if (n.includes("votoran") && (n.includes("cp v") || n.includes("cpv") || n.includes("ari"))) return "votoran-cpvari.jpg"
  if (n.includes("votoran") && (n.includes("cp iv") || n.includes("cpiv"))) return "votoran-cpiv.jpg"
  if (n.includes("votoran")) return "votoran-cpii.jpg"
  if (n.includes("caue") && (n.includes("cp iii") || n.includes("cpiii") || n.includes("estrutural"))) return "caue-cpiii.jpg"
  if (n.includes("caue")) return "caue-cpiie.jpg"
  if (n.includes("montes claros")) return "montes-claros-cpiie.jpg"
  if (n.includes("maua")) return "maua-cpiie.jpg"
  if (n.includes("csn")) return "csn-cpiif.jpg"
  if (n.includes("tupi")) return "tupi-cpiie.jpg"
  if (n.includes("ciplan")) return "ciplan-cpiif.jpg"
  if (n.includes(" liz") || n.includes("cimento liz")) return "liz-cpiie.jpg"
  if (n.includes("branco")) return "cimento-branco.jpg"
  if (n.includes("queimado")) return "cimento-queimado.jpg"
  // Marcas sem arquivo dedicado herdam a sacaria cinza padrão (local, zero 403)
  return "votoran-cpii.jpg"
}

async function main() {
  // 1. Baixar (ou fallback) os 14 arquivos
  console.log("⬇️  Baixando sacarias reais para public/images/cimentos/ ...")
  for (const [file, [primary, fallback]] of Object.entries(FILES)) {
    const dest = path.join(DIR, file)
    try {
      const size = await download(primary, dest)
      console.log(`✅ ${file} <- primária (${(size / 1024).toFixed(0)} KB)`)
    } catch (e1) {
      console.log(`⚠️  ${file}: primária falhou (${e1.message}) — tentando fallback...`)
      const size = await download(fallback, dest)
      console.log(`✅ ${file} <- fallback 333obra (${(size / 1024).toFixed(0)} KB)`)
    }
  }

  // 2. UPDATE no Supabase para rotas locais
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) throw new Error("Missing Supabase credentials")
  const supabase = createClient(supabaseUrl, serviceKey)

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name")
    .eq("category_id", "c0134152-de0a-42f7-bb87-dd9ec8588983")
    .eq("active", true)
  if (error) throw error
  console.log(`📦 Cimentos ativos: ${products.length}`)

  let ok = 0
  for (const p of products) {
    const file = localFileFor(p.name)
    const route = `/images/cimentos/${file}`
    const { error: upErr } = await supabase.from("products").update({ image_url: route, images: [route] }).eq("id", p.id)
    if (upErr) console.error(`❌ ${p.name}: ${upErr.message}`)
    else { ok++; console.log(`✅ ${p.name} -> ${route}`) }
  }

  console.log(`\nTodas as ${ok} referências de cimento atualizadas para rotas locais /images/cimentos/....`)
}

main().catch((e) => { console.error("❌ Falha:", e.message || e); process.exit(1) })
