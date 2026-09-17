/* =============================================================================
 * REFERÊNCIA POR CATEGORIA — cada categoria exibe a foto real de um produto
 * específico do catálogo (baixada local, sem hotlink). Nassau via Instagram.
 * + cache-bust ?v=2 nas rotas de cimento (expurga ilustrações antigas do cache).
 * Uso: node scripts/instalar_referencia_categorias.js
 * ============================================================================= */
const fs = require("fs")
const path = require("path")
const https = require("https")
const dotenv = require("dotenv")

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const { createClient } = require("@supabase/supabase-js")

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
const PUB = path.resolve(process.cwd(), "public")

function download(url, dest, referer) {
  return new Promise((resolve, reject) => {
    const h = { "User-Agent": UA, Accept: "image/*,*/*" }
    if (referer) h.Referer = referer
    https.get(url, { headers: h, timeout: 25000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume()
        const nx = res.headers.location.startsWith("http") ? res.headers.location : new URL(res.headers.location, url).toString()
        return download(nx, dest, referer).then(resolve, reject)
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode} ${url}`)) }
      const ch = []
      res.on("data", (c) => ch.push(c))
      res.on("end", () => {
        const buf = Buffer.concat(ch)
        if (buf.length < 5000) return reject(new Error(`pequeno (${buf.length}b) ${url}`))
        fs.writeFileSync(dest, buf)
        resolve(buf.length)
      })
    }).on("timeout", function () { this.destroy(new Error("timeout " + url)) }).on("error", reject)
  })
}

// slug categoria -> slug produto-referência (null = usa foto local existente)
const REFS = {
  "cimentos": null, // -> /images/cimentos/votoran-cpii.jpg (pack oficial)
  "aco-e-ferragens": "prego-12x12-com-cabeca-pacote-de-1-kg-206079",
  "areia-e-pedra": "pedra-britada-n-1-15kg-matieli",
  "cal-e-gesso": "gesso-rapido-1kg-juntalider-unidade-733881-10",
  "tijolos-e-blocos": "tijolo-comum-9x5x18cm-helvetia",
  "telhas-e-coberturas": "cumeeira-fibrocimento-1-10mx30cmx6mm-articulada-inferior-confibra",
  "materiais-hidraulicos": "joelho-45-pvc-rigido-para-esgoto-6",
  "argamassas": "argamassa-matrix-5201-multiplo-uso-50kg-cinza-votorantim-1-unidade-20-2",
  "rejuntes": "rejunte-flexivel-branco-pisokoll-1kg",
  "impermeabilizantes": "aditivo-impermeabilizante-para-argamassa-e-concreto-vedacit-900ml-vedacit-1-unid",
  "materiais-eletricos": "eletroduto-corrugado-32mm-pvc-azul-25-metros-fortlev-1-unidade-795",
  "tintas-e-pintura": "fundo-preparador-de-parede-base-agua-18-litros-suvinil-1-unidade-121869",
  "madeiras-e-esquadrias": "madeirite-resinado-rosa-1-10x2-20m-14mm-635",
  "ferramentas-e-epis": "broca-sds-plus-6x210mm-makita-1-unidade-4636",
}

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  // 1. Nassau real (Instagram, loja) — mesma foto nos 2 tipos da marca
  const nasSrc = path.resolve("/tmp/nonexistent")
  void nasSrc
  console.log("Nassau: usar stage-retail/dl-nassau.jpg (baixado antes)")

  // 2. Baixar fotos-ref dos produtos
  for (const [cat, pslug] of Object.entries(REFS)) {
    if (!pslug) continue
    const { data: p } = await sb.from("products").select("name,image_url").eq("slug", pslug).maybeSingle()
    if (!p) { console.log(`⚠️  produto ${pslug} não achado`); continue }
    const dest = path.join(PUB, "images/categories", `ref-${cat}.jpg`)
    try {
      const size = await download(p.image_url.split("?")[0], dest, "https://www.333obra.com.br/")
      console.log(`✅ ref-${cat}.jpg <- ${p.name.slice(0, 45)} (${(size / 1024).toFixed(0)} KB)`)
    } catch (e) { console.log(`❌ ref-${cat}.jpg: ${e.message}`) }
  }

  // 3. Apontar categorias (com ?v=2 p/ bust de cache)
  for (const cat of Object.keys(REFS)) {
    const route = cat === "cimentos"
      ? "/images/cimentos/votoran-cpii.jpg?v=2"
      : `/images/categories/ref-${cat}.jpg?v=2`
    const { error } = await sb.from("categories").update({ image_url: route }).eq("slug", cat)
    console.log((error ? "❌ " : "✅ ") + cat + " -> " + route)
  }

  // 4. Cache-bust ?v=2 em todos os cimentos
  const { data: cims } = await sb.from("products").select("id,image_url,images").eq("category_id", "c0134152-de0a-42f7-bb87-dd9ec8588983").eq("active", true)
  for (const c of cims) {
    const base = String(c.image_url).split("?")[0]
    const url = `${base}?v=2`
    await sb.from("products").update({ image_url: url, images: [url] }).eq("id", c.id)
  }
  console.log(`✅ cache-bust ?v=2 em ${cims.length} cimentos`)
}

main().catch((e) => { console.error("❌", e.message || e); process.exit(1) })
