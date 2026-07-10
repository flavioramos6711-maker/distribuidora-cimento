/**
 * seed-catalog.js
 * Executa a reconstrução completa do catálogo via Supabase REST API.
 * Apaga produtos/subcategorias/categorias e insere o catálogo correto usando UUIDs gerados dinamicamente.
 */

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const supabase = createClient(
  'https://sdafczehznywoeqnfgph.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8'
)

// Helper objects to store mappings from slug -> UUID
const catMap = {}
const subMap = {}

async function run() {
  console.log('━━━ FASE 1: Limpeza ━━━')

  // Reviews first (FK)
  let r = await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (r.error) console.log('  reviews delete error (ok se vazia):', r.error.message)
  else console.log('  ✓ reviews apagadas')

  // Order items
  r = await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (r.error) console.log('  order_items delete:', r.error.message)
  else console.log('  ✓ order_items apagados')

  // Products
  r = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (r.error) console.log('  products delete error:', r.error.message)
  else console.log('  ✓ produtos apagados')

  // Subcategories
  r = await supabase.from('subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (r.error) console.log('  subcategories delete error:', r.error.message)
  else console.log('  ✓ subcategorias apagadas')

  // Categories
  r = await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (r.error) console.log('  categories delete error:', r.error.message)
  else console.log('  ✓ categorias apagadas')

  // ── FASE 2: Categorias ────────────────────────────────────────────────────
  console.log('\n━━━ FASE 2: Categorias ━━━')
  const catsData = [
    { name: 'Cimento e Cal', slug: 'cimento-e-cal', sort_order: 1, active: true },
    { name: 'Argamassas', slug: 'argamassas', sort_order: 2, active: true },
    { name: 'Tijolos e Blocos', slug: 'tijolos-e-blocos', sort_order: 3, active: true },
    { name: 'Pisos e Revestimentos', slug: 'pisos-e-revestimentos', sort_order: 4, active: true },
    { name: 'Areia e Brita', slug: 'areia-e-brita', sort_order: 5, active: true },
    { name: 'Saneamento e Hidráulica', slug: 'saneamento-e-hidraulica', sort_order: 6, active: true },
    { name: 'Drywall e Forro', slug: 'drywall-e-forro', sort_order: 7, active: true },
    { name: 'Tintas e Impermeabilizantes', slug: 'tintas-e-impermeabilizantes', sort_order: 8, active: true },
    { name: 'Ferramentas e EPI', slug: 'ferramentas-e-epi', sort_order: 9, active: true },
    { name: 'Aço e Estrutura', slug: 'aco-e-estrutura', sort_order: 10, active: true },
  ]

  const cats = catsData.map(c => {
    const id = crypto.randomUUID()
    catMap[c.slug] = id
    return { ...c, id }
  })

  r = await supabase.from('categories').insert(cats)
  if (r.error) { console.error('  ERROR categories:', r.error.message); process.exit(1) }
  console.log(`  ✓ ${cats.length} categorias criadas`)

  // ── FASE 3: Subcategorias ─────────────────────────────────────────────────
  console.log('\n━━━ FASE 3: Subcategorias ━━━')
  const subsData = [
    { name: 'Cimento CP II', slug: 'cimento-cp-ii', catSlug: 'cimento-e-cal', sort_order: 1, active: true },
    { name: 'Cimento CP III', slug: 'cimento-cp-iii', catSlug: 'cimento-e-cal', sort_order: 2, active: true },
    { name: 'Cimento CP V ARI', slug: 'cimento-cp-v-ari', catSlug: 'cimento-e-cal', sort_order: 3, active: true },
    { name: 'Cimento Branco', slug: 'cimento-branco', catSlug: 'cimento-e-cal', sort_order: 4, active: true },
    { name: 'Cal Hidratada', slug: 'cal-hidratada', catSlug: 'cimento-e-cal', sort_order: 5, active: true },
    { name: 'Argamassa de Assentamento', slug: 'argamassa-assentamento', catSlug: 'argamassas', sort_order: 1, active: true },
    { name: 'Argamassa de Revestimento', slug: 'argamassa-revestimento', catSlug: 'argamassas', sort_order: 2, active: true },
    { name: 'Chapisco', slug: 'chapisco', catSlug: 'argamassas', sort_order: 3, active: true },
    { name: 'Reboco', slug: 'reboco', catSlug: 'argamassas', sort_order: 4, active: true },
    { name: 'Massa Fina', slug: 'massa-fina', catSlug: 'argamassas', sort_order: 5, active: true },
    { name: 'Graute', slug: 'graute', catSlug: 'argamassas', sort_order: 6, active: true },
    { name: 'Tijolo Cerâmico', slug: 'tijolo-ceramico', catSlug: 'tijolos-e-blocos', sort_order: 1, active: true },
    { name: 'Bloco de Concreto', slug: 'bloco-de-concreto', catSlug: 'tijolos-e-blocos', sort_order: 2, active: true },
    { name: 'Bloco Estrutural', slug: 'bloco-estrutural', catSlug: 'tijolos-e-blocos', sort_order: 3, active: true },
    { name: 'Bloco de Vedação', slug: 'bloco-de-vedacao', catSlug: 'tijolos-e-blocos', sort_order: 4, active: true },
    { name: 'Cerâmica', slug: 'ceramica', catSlug: 'pisos-e-revestimentos', sort_order: 1, active: true },
    { name: 'Porcelanato', slug: 'porcelanato', catSlug: 'pisos-e-revestimentos', sort_order: 2, active: true },
    { name: 'Rejunte', slug: 'rejunte', catSlug: 'pisos-e-revestimentos', sort_order: 3, active: true },
    { name: 'Piso Cimentício', slug: 'piso-cimenticio', catSlug: 'pisos-e-revestimentos', sort_order: 4, active: true },
    { name: 'Areia Fina Lavada', slug: 'areia-fina-lavada', catSlug: 'areia-e-brita', sort_order: 1, active: true },
    { name: 'Areia Grossa', slug: 'areia-grossa', catSlug: 'areia-e-brita', sort_order: 2, active: true },
    { name: 'Brita 0', slug: 'brita-0', catSlug: 'areia-e-brita', sort_order: 3, active: true },
    { name: 'Brita 1', slug: 'brita-1', catSlug: 'areia-e-brita', sort_order: 4, active: true },
    { name: 'Pedrisco', slug: 'pedrisco', catSlug: 'areia-e-brita', sort_order: 5, active: true },
    { name: 'Tubos PVC', slug: 'tubos-pvc', catSlug: 'saneamento-e-hidraulica', sort_order: 1, active: true },
    { name: 'Conexões', slug: 'conexoes', catSlug: 'saneamento-e-hidraulica', sort_order: 2, active: true },
    { name: 'Ralos', slug: 'ralos', catSlug: 'saneamento-e-hidraulica', sort_order: 3, active: true },
    { name: "Caixas d'água", slug: 'caixas-dagua', catSlug: 'saneamento-e-hidraulica', sort_order: 4, active: true },
    { name: 'Registros', slug: 'registros', catSlug: 'saneamento-e-hidraulica', sort_order: 5, active: true },
    { name: 'Chapas Drywall', slug: 'chapas-drywall', catSlug: 'drywall-e-forro', sort_order: 1, active: true },
    { name: 'Perfis Metálicos', slug: 'perfis-metalicos', catSlug: 'drywall-e-forro', sort_order: 2, active: true },
    { name: 'Forro PVC', slug: 'forro-pvc', catSlug: 'drywall-e-forro', sort_order: 3, active: true },
    { name: 'Forro de Gesso', slug: 'forro-de-gesso', catSlug: 'drywall-e-forro', sort_order: 4, active: true },
    { name: 'Tintas Acrílicas', slug: 'tintas-acrilicas', catSlug: 'tintas-e-impermeabilizantes', sort_order: 1, active: true },
    { name: 'Impermeabilizantes', slug: 'impermeabilizantes', catSlug: 'tintas-e-impermeabilizantes', sort_order: 2, active: true },
    { name: 'Massa Corrida', slug: 'massa-corrida', catSlug: 'tintas-e-impermeabilizantes', sort_order: 3, active: true },
    { name: 'Seladores e Primers', slug: 'seladores-e-primers', catSlug: 'tintas-e-impermeabilizantes', sort_order: 4, active: true },
    { name: 'Ferramentas Manuais', slug: 'ferramentas-manuais', catSlug: 'ferramentas-e-epi', sort_order: 1, active: true },
    { name: 'Ferramentas Elétricas', slug: 'ferramentas-eletricas', catSlug: 'ferramentas-e-epi', sort_order: 2, active: true },
    { name: 'EPI', slug: 'epi', catSlug: 'ferramentas-e-epi', sort_order: 3, active: true },
    { name: 'Betoneiras', slug: 'betoneiras', catSlug: 'ferramentas-e-epi', sort_order: 4, active: true },
    { name: 'Vergalhões', slug: 'vergalhoes', catSlug: 'aco-e-estrutura', sort_order: 1, active: true },
    { name: 'Tela Soldada', slug: 'tela-soldada', catSlug: 'aco-e-estrutura', sort_order: 2, active: true },
    { name: 'Arame', slug: 'arame', catSlug: 'aco-e-estrutura', sort_order: 3, active: true },
    { name: 'Prego', slug: 'prego', catSlug: 'aco-e-estrutura', sort_order: 4, active: true },
  ]

  const subs = subsData.map(s => {
    const id = crypto.randomUUID()
    subMap[s.slug] = id
    const { catSlug, ...rest } = s
    return { ...rest, id, category_id: catMap[catSlug] }
  })

  r = await supabase.from('subcategories').insert(subs)
  if (r.error) { console.error('  ERROR subcategories:', r.error.message); process.exit(1) }
  console.log(`  ✓ ${subs.length} subcategorias criadas`)

  // ── FASE 4: Produtos ──────────────────────────────────────────────────────
  console.log('\n━━━ FASE 4: Produtos ━━━')
  const productsData = [
    // ── CIMENTO E CAL ──────────────────────────────────────────────────────
    { name: 'Cimento CP II-F 32 - Votoran - Saco 50kg', slug: 'cimento-cp-ii-f-32-votoran-50kg', description: 'Cimento Portland Composto com fíler CP II-F 32 — uso geral em obras residenciais e comerciais. Excelente trabalhabilidade e resistência à compressão. Norma ABNT NBR 11578. Fabricado pela Votorantim Cimentos, líder nacional.', price: 38.90, original_price: 42.00, catSlug: 'cimento-e-cal', subSlug: 'cimento-cp-ii', unit: 'saco', stock: 500, active: true, featured: true, is_new: false, is_discount: true, sku: 'CIM-CPII-F32-VOT-50KG', weight: 50 },
    { name: 'Cimento CP II-F 32 - Votoran - Saco 25kg', slug: 'cimento-cp-ii-f-32-votoran-25kg', description: 'Cimento Portland Composto CP II-F 32 em embalagem de 25kg — ideal para pequenas obras, reformas e reparos. Mesma qualidade Votoran em formato prático. Norma ABNT NBR 11578.', price: 21.90, original_price: 24.00, catSlug: 'cimento-e-cal', subSlug: 'cimento-cp-ii', unit: 'saco', stock: 500, active: true, featured: false, is_new: false, is_discount: false, sku: 'CIM-CPII-F32-VOT-25KG', weight: 25 },
    { name: 'Cimento CP II-Z 32 - InterCement - Saco 50kg', slug: 'cimento-cp-ii-z-32-intercement-50kg', description: 'Cimento Portland Composto com Pozolana CP II-Z 32. Maior resistência à penetração de agentes agressivos (sulfatos e cloretos). Recomendado para obras em ambientes úmidos, fundações e lajes. Norma ABNT NBR 11578.', price: 39.50, original_price: null, catSlug: 'cimento-e-cal', subSlug: 'cimento-cp-ii', unit: 'saco', stock: 500, active: true, featured: false, is_new: false, is_discount: false, sku: 'CIM-CPII-Z32-ICM-50KG', weight: 50 },
    { name: 'Cimento CP II-E 32 - Nassau - Saco 50kg', slug: 'cimento-cp-ii-e-32-nassau-50kg', description: 'Cimento Portland Composto com Escória de Alto Forno CP II-E 32. Excelente durabilidade e resistência a meios agressivos. Indicado para concreto de pisos, fundações e obras em contato com o solo. Norma ABNT NBR 11578.', price: 38.50, original_price: null, catSlug: 'cimento-e-cal', subSlug: 'cimento-cp-ii', unit: 'saco', stock: 500, active: true, featured: false, is_new: false, is_discount: false, sku: 'CIM-CPII-E32-NSS-50KG', weight: 50 },
    { name: 'Cimento CP III 40 RS - Votoran - Saco 50kg', slug: 'cimento-cp-iii-40-rs-votoran-50kg', description: 'Cimento Portland de Alto-Forno CP III 40 RS — resistente a sulfatos. Alto teor de escória de alto-forno, baixo calor de hidratação. Ideal para grandes obras (barragens, pontes) e ambientes com sulfatos. Norma ABNT NBR 5735.', price: 41.90, original_price: null, catSlug: 'cimento-e-cal', subSlug: 'cimento-cp-iii', unit: 'saco', stock: 300, active: true, featured: false, is_new: false, is_discount: false, sku: 'CIM-CPIII-40RS-VOT-50KG', weight: 50 },
    { name: 'Cimento CP V ARI - Votoran - Saco 50kg', slug: 'cimento-cp-v-ari-votoran-50kg', description: 'Cimento Portland de Alta Resistência Inicial CP V ARI. Atinge resistência superior logo nos primeiros dias. Ideal para pré-moldados, concreto projetado, estruturas com alta demanda de resistência precoce. Norma ABNT NBR 5733.', price: 43.90, original_price: 46.00, catSlug: 'cimento-e-cal', subSlug: 'cimento-cp-v-ari', unit: 'saco', stock: 300, active: true, featured: true, is_new: false, is_discount: false, sku: 'CIM-CPV-ARI-VOT-50KG', weight: 50 },
    { name: 'Cimento CP V ARI RS - InterCement - Saco 50kg', slug: 'cimento-cp-v-ari-rs-intercement-50kg', description: 'Cimento Portland de Alta Resistência Inicial Resistente a Sulfatos CP V ARI RS. Combinação de alta resistência inicial com resistência a meios agressivos. Para pré-moldados, ambientes industriais e obras marítimas.', price: 45.50, original_price: null, catSlug: 'cimento-e-cal', subSlug: 'cimento-cp-v-ari', unit: 'saco', stock: 200, active: true, featured: false, is_new: false, is_discount: false, sku: 'CIM-CPV-ARIS-ICM-50KG', weight: 50 },
    { name: 'Cimento Branco Estrutural CP II - Votoran - Saco 50kg', slug: 'cimento-branco-estrutural-votoran-50kg', description: 'Cimento Portland Branco Estrutural CP II. Mesma resistência do cimento cinza com coloração branca pura. Ideal para rejunte fino, pastilhas, concreto aparente branco e mosaicos. Norma ABNT NBR 12989.', price: 59.90, original_price: 65.00, catSlug: 'cimento-e-cal', subSlug: 'cimento-branco', unit: 'saco', stock: 150, active: true, featured: false, is_new: false, is_discount: true, sku: 'CIM-BRAN-CPII-VOT-50KG', weight: 50 },
    { name: 'Cal Hidratada CH-I - Tocantins - Saco 20kg', slug: 'cal-hidratada-ch-i-tocantins-20kg', description: 'Cal Hidratada superior CH-I, máxima pureza e granulometria fina. Indispensável na argamassa de assentamento e revestimento (traço cimento:cal:areia). Melhora a plasticidade e retenção de água das argamassas. Norma ABNT NBR 7175.', price: 24.90, original_price: 27.00, catSlug: 'cimento-e-cal', subSlug: 'cal-hidratada', unit: 'saco', stock: 500, active: true, featured: true, is_new: false, is_discount: true, sku: 'CAL-CH1-TOC-20KG', weight: 20 },
    { name: 'Cal Hidratada CH-II - Cauê - Saco 20kg', slug: 'cal-hidratada-ch-ii-caue-20kg', description: 'Cal Hidratada comum CH-II. Amplamente utilizada em argamassas de revestimento, pintura caiada e correção de pH. Boa trabalhabilidade e plasticidade. Norma ABNT NBR 7175.', price: 19.90, original_price: null, catSlug: 'cimento-e-cal', subSlug: 'cal-hidratada', unit: 'saco', stock: 500, active: true, featured: false, is_new: false, is_discount: false, sku: 'CAL-CHII-CAU-20KG', weight: 20 },
    { name: 'Cal Hidratada CH-II - Cauê - Saco 7kg', slug: 'cal-hidratada-ch-ii-caue-7kg', description: 'Cal Hidratada CH-II em embalagem de 7kg — formato prático para pequenas obras, manutenção e reparos. Norma ABNT NBR 7175.', price: 8.90, original_price: null, catSlug: 'cimento-e-cal', subSlug: 'cal-hidratada', unit: 'saco', stock: 300, active: true, featured: false, is_new: false, is_discount: false, sku: 'CAL-CHII-CAU-7KG', weight: 7 },

    // ── ARGAMASSAS ─────────────────────────────────────────────────────────
    { name: 'Argamassa Colante AC I - Quartzolit - Saco 20kg', slug: 'argamassa-colante-ac-i-quartzolit-20kg', description: 'Argamassa colante AC I para assentamento de revestimentos cerâmicos em pisos e paredes internas de baixa absorção. Fácil preparo — apenas adicione água. Norma ABNT NBR 14081. Fabricante Quartzolit — Saint-Gobain.', price: 18.90, original_price: 21.00, catSlug: 'argamassas', subSlug: 'argamassa-assentamento', unit: 'saco', stock: 500, active: true, featured: true, is_new: false, is_discount: true, sku: 'ARG-ACI-QZL-20KG', weight: 20 },
    { name: 'Argamassa Colante AC II - Weber - Saco 20kg', slug: 'argamassa-colante-ac-ii-weber-20kg', description: 'Argamassa colante AC II com aditivos melhorados para assentamento de cerâmicas, porcelanatos e pedras naturais. Maior aderência e tempo aberto. Ideal para piscinas, fachadas externas e pisos de alto tráfego. Norma ABNT NBR 14081.', price: 22.90, original_price: 25.00, catSlug: 'argamassas', subSlug: 'argamassa-assentamento', unit: 'saco', stock: 500, active: true, featured: false, is_new: false, is_discount: false, sku: 'ARG-ACII-WBR-20KG', weight: 20 },
    { name: 'Argamassa Colante AC III - Quartzolit - Saco 20kg', slug: 'argamassa-colante-ac-iii-quartzolit-20kg', description: 'Argamassa colante AC III com alta aderência para substratos difíceis. Indicada para grandes formatos (60x60 ou maiores), pastilhas e superfícies de baixa aderência. Norma ABNT NBR 14081.', price: 28.90, original_price: 31.00, catSlug: 'argamassas', subSlug: 'argamassa-assentamento', unit: 'saco', stock: 300, active: true, featured: false, is_new: false, is_discount: false, sku: 'ARG-ACIII-QZL-20KG', weight: 20 },
    { name: 'Argamassa para Assentamento de Blocos - Nacional - 20kg', slug: 'argamassa-assentamento-blocos-20kg', description: 'Argamassa industrializada para assentamento de alvenaria de blocos cerâmicos e de concreto. Basta adicionar água. Elimina o traço manual e garante junta de 10mm uniforme. Produção até 2x mais rápida.', price: 16.90, original_price: null, catSlug: 'argamassas', subSlug: 'argamassa-assentamento', unit: 'saco', stock: 500, active: true, featured: false, is_new: false, is_discount: false, sku: 'ARG-BLK-NAC-20KG', weight: 20 },
    { name: 'Argamassa de Revestimento Interno - Proquil - 20kg', slug: 'argamassa-revestimento-interno-20kg', description: 'Argamassa industrializada para revestimento de paredes e tetos internos. Substitui o traço manual cimento:cal:areia. Excelente trabalhabilidade e aderência. Espessura de 10 a 30mm por camada.', price: 17.50, original_price: null, catSlug: 'argamassas', subSlug: 'argamassa-revestimento', unit: 'saco', stock: 500, active: true, featured: false, is_new: false, is_discount: false, sku: 'ARG-REV-INT-PRQ-20KG', weight: 20 },
    { name: 'Chapisco Rolado - Votorantim - Saco 20kg', slug: 'chapisco-rolado-votorantim-20kg', description: 'Chapisco industrializado para preparo de base em paredes e lajes antes do reboco. Aplicação por rolo de espuma — processo limpo, rápido e uniforme. Excelente aderência ao concreto e blocos. Elimina a mistura manual com cimento puro.', price: 15.90, original_price: 17.50, catSlug: 'argamassas', subSlug: 'chapisco', unit: 'saco', stock: 400, active: true, featured: true, is_new: false, is_discount: true, sku: 'CHP-ROL-VOT-20KG', weight: 20 },
    { name: 'Chapisco Convencional - Nacional - Saco 20kg', slug: 'chapisco-convencional-20kg', description: 'Chapisco industrializado tradicional para aplicação com colher de pedreiro (lance). Prepara a base para recebimento do reboco. Alta aderência. Espessura de 5 a 8mm.', price: 13.90, original_price: null, catSlug: 'argamassas', subSlug: 'chapisco', unit: 'saco', stock: 300, active: true, featured: false, is_new: false, is_discount: false, sku: 'CHP-CON-NAC-20KG', weight: 20 },
    { name: 'Reboco Industrializado - Proquil - Saco 20kg', slug: 'reboco-industrializado-20kg', description: 'Reboco industrializado (emboço) para regularização de paredes externas e internas. Alta resistência e aderência. Aplicação manual ou projetada. Espessura de 15 a 25mm. Reduz o tempo de obra e o desperdício.', price: 17.90, original_price: null, catSlug: 'argamassas', subSlug: 'reboco', unit: 'saco', stock: 400, active: true, featured: false, is_new: false, is_discount: false, sku: 'RBC-IND-PRQ-20KG', weight: 20 },
    { name: 'Massa Fina Interna - Quartzolit - Saco 20kg', slug: 'massa-fina-interna-quartzolit-20kg', description: 'Massa fina industrializada para acabamento interno de alta qualidade. Superfície lisa e pronta para pintura. Excelente trabalhabilidade, sem fissuração. Espessura máxima de 5mm.', price: 24.90, original_price: 27.00, catSlug: 'argamassas', subSlug: 'massa-fina', unit: 'saco', stock: 400, active: true, featured: true, is_new: false, is_discount: true, sku: 'MSF-INT-QZL-20KG', weight: 20 },
    { name: 'Graute Estrutural - Proquil - Saco 25kg', slug: 'graute-estrutural-25kg', description: 'Graute de alta resistência para preenchimento de alvéolos de blocos estruturais, fixação de pinos e nivelamento de equipamentos. Consistência fluida sem segregação. Resistência mínima 20 MPa aos 28 dias. Norma ABNT NBR 15270.', price: 32.90, original_price: null, catSlug: 'argamassas', subSlug: 'graute', unit: 'saco', stock: 200, active: true, featured: false, is_new: false, is_discount: false, sku: 'GRA-EST-PRQ-25KG', weight: 25 },

    // ── TIJOLOS E BLOCOS ────────────────────────────────────────────────────
    { name: 'Tijolo Cerâmico 6 Furos 9x19x19cm', slug: 'tijolo-ceramico-6-furos-9x19x19', description: 'Tijolo cerâmico de 6 furos 9x19x19cm — o mais utilizado para alvenaria de vedação. Baixo peso, boa resistência à compressão e excelente isolamento térmico e acústico. Norma ABNT NBR 15270.', price: 0.65, original_price: null, catSlug: 'tijolos-e-blocos', subSlug: 'tijolo-ceramico', unit: 'un', stock: 50000, active: true, featured: false, is_new: false, is_discount: false, sku: 'TJL-CER-6F-9X19X19', weight: 2.2 },
    { name: 'Tijolo Cerâmico 8 Furos 9x19x19cm', slug: 'tijolo-ceramico-8-furos-9x19x19', description: 'Tijolo cerâmico de 8 furos — maior resistência à compressão que o de 6 furos. Dimensões 9x19x19cm. Norma ABNT NBR 15270.', price: 0.75, original_price: null, catSlug: 'tijolos-e-blocos', subSlug: 'tijolo-ceramico', unit: 'un', stock: 30000, active: true, featured: false, is_new: false, is_discount: false, sku: 'TJL-CER-8F-9X19X19', weight: 2.5 },
    { name: 'Bloco de Concreto de Vedação 9x19x39cm', slug: 'bloco-concreto-vedacao-9x19x39', description: 'Bloco de concreto de vedação 9x19x39cm. Ideal para divisórias e paredes internas. Superfície texturizada para excelente aderência de reboco. Norma ABNT NBR 6136.', price: 2.80, original_price: null, catSlug: 'tijolos-e-blocos', subSlug: 'bloco-de-vedacao', unit: 'un', stock: 20000, active: true, featured: false, is_new: false, is_discount: false, sku: 'BLC-CNT-VED-9X19X39', weight: 11.5 },
    { name: 'Bloco de Concreto de Vedação 14x19x39cm', slug: 'bloco-concreto-vedacao-14x19x39', description: 'Bloco de concreto de vedação 14x19x39cm. Para paredes externas com maior espessura e melhor isolamento térmico e acústico. Norma ABNT NBR 6136.', price: 3.50, original_price: null, catSlug: 'tijolos-e-blocos', subSlug: 'bloco-de-vedacao', unit: 'un', stock: 15000, active: true, featured: false, is_new: false, is_discount: false, sku: 'BLC-CNT-VED-14X19X39', weight: 16.0 },
    { name: 'Bloco Estrutural de Concreto 14x19x39cm', slug: 'bloco-estrutural-concreto-14x19x39', description: 'Bloco de concreto estrutural para alvenaria estrutural que dispensa pilares e vigas convencionais. Resistência mínima 8 MPa. Para prédios de até 5 pavimentos. Norma ABNT NBR 6136 classe A.', price: 4.90, original_price: null, catSlug: 'tijolos-e-blocos', subSlug: 'bloco-estrutural', unit: 'un', stock: 10000, active: true, featured: true, is_new: false, is_discount: false, sku: 'BLC-EST-CNT-14X19X39', weight: 17.5 },
    { name: 'Bloco Estrutural de Concreto 19x19x39cm', slug: 'bloco-estrutural-concreto-19x19x39', description: 'Bloco de concreto estrutural de maior espessura (19cm). Resistência mínima 10 MPa. Para paredes estruturais externas de edifícios de médio e grande porte. Norma ABNT NBR 6136 classe A.', price: 5.90, original_price: null, catSlug: 'tijolos-e-blocos', subSlug: 'bloco-estrutural', unit: 'un', stock: 8000, active: true, featured: false, is_new: false, is_discount: false, sku: 'BLC-EST-CNT-19X19X39', weight: 23.0 },

    // ── AREIA E BRITA ───────────────────────────────────────────────────────
    { name: 'Areia Fina Lavada - Metro Cúbico', slug: 'areia-fina-lavada-m3', description: 'Areia fina lavada e peneirada, granulometria 0,1 a 0,5mm. Para massa fina, argamassa de revestimento e reboco. Sem impurezas orgânicas ou torrões de argila.', price: 95.00, original_price: null, catSlug: 'areia-e-brita', subSlug: 'areia-fina-lavada', unit: 'm³', stock: 999, active: true, featured: false, is_new: false, is_discount: false, sku: 'ARE-FIN-LAV-M3', weight: null },
    { name: 'Areia Grossa Lavada - Metro Cúbico', slug: 'areia-grossa-lavada-m3', description: 'Areia grossa lavada, granulometria 1 a 2,5mm. Ideal para concreto estrutural e argamassa de assentamento. Produto limpo e certificado.', price: 89.00, original_price: null, catSlug: 'areia-e-brita', subSlug: 'areia-grossa', unit: 'm³', stock: 999, active: true, featured: false, is_new: false, is_discount: false, sku: 'ARE-GRS-LAV-M3', weight: null },
    { name: 'Brita 0 (Pedrisco) - Metro Cúbico', slug: 'brita-0-pedrisco-m3', description: 'Brita 0 (pedrisco), diâmetro máx. 9,5mm. Para concreto de pequenas peças, argamassas especiais e drenagens. Material britado de granito/gnaisse de alta resistência.', price: 120.00, original_price: null, catSlug: 'areia-e-brita', subSlug: 'brita-0', unit: 'm³', stock: 999, active: true, featured: false, is_new: false, is_discount: false, sku: 'BRT-0-M3', weight: null },
    { name: 'Brita 1 - Metro Cúbico', slug: 'brita-1-m3', description: 'Brita 1, diâmetro entre 9,5 e 25mm — o agregado graúdo mais utilizado no Brasil para concreto estrutural. Para vigas, pilares, lajes e fundações. Material britado de granito.', price: 115.00, original_price: null, catSlug: 'areia-e-brita', subSlug: 'brita-1', unit: 'm³', stock: 999, active: true, featured: false, is_new: false, is_discount: false, sku: 'BRT-1-M3', weight: null },
    { name: 'Pedrisco Fino - Metro Cúbico', slug: 'pedrisco-fino-m3', description: 'Pedrisco fino (Brita 0 fina), diâmetro máx. 6,3mm. Para concreto de alta resistência, pisos intertravados e drenagem de fundações.', price: 125.00, original_price: null, catSlug: 'areia-e-brita', subSlug: 'pedrisco', unit: 'm³', stock: 999, active: true, featured: false, is_new: false, is_discount: false, sku: 'PED-FIN-M3', weight: null },

    // ── SANEAMENTO E HIDRÁULICA ─────────────────────────────────────────────
    { name: 'Tubo PVC Esgoto 50mm (2") - Tigre - Barra 6m', slug: 'tubo-pvc-esgoto-50mm-tigre-6m', description: 'Tubo PVC rígido para esgoto, diâmetro 50mm (2") para ramais de pias de cozinha, máquinas de lavar e lavatórios. Série normal, cor alaranjada. Norma NBR 5688.', price: 24.90, original_price: null, catSlug: 'saneamento-e-hidraulica', subSlug: 'tubos-pvc', unit: 'barra', stock: 200, active: true, featured: false, is_new: false, is_discount: false, sku: 'TBO-PVC-ESG-50-TGR-6M', weight: null },
    { name: 'Tubo PVC Esgoto 100mm (4") - Tigre - Barra 6m', slug: 'tubo-pvc-esgoto-100mm-tigre-6m', description: 'Tubo PVC rígido para esgoto sanitário, diâmetro 100mm (4") — o mais utilizado para ramais de banheiros e vasos sanitários. Série normal, cor alaranjada. Fabricante Tigre S/A. Norma NBR 5688.', price: 45.90, original_price: null, catSlug: 'saneamento-e-hidraulica', subSlug: 'tubos-pvc', unit: 'barra', stock: 200, active: true, featured: true, is_new: false, is_discount: false, sku: 'TBO-PVC-ESG-100-TGR-6M', weight: null },
    { name: 'Tubo PVC Esgoto 150mm (6") - Tigre - Barra 6m', slug: 'tubo-pvc-esgoto-150mm-tigre-6m', description: 'Tubo PVC rígido para esgoto sanitário, diâmetro 150mm (6") para colunas principais e coletores prediais. Série normal, cor alaranjada. Norma NBR 5688.', price: 72.00, original_price: null, catSlug: 'saneamento-e-hidraulica', subSlug: 'tubos-pvc', unit: 'barra', stock: 150, active: true, featured: false, is_new: false, is_discount: false, sku: 'TBO-PVC-ESG-150-TGR-6M', weight: null },
    { name: "Caixa d'água 500L - Fortlev - Polietileno", slug: 'caixa-dagua-500l-fortlev', description: "Caixa d'água 500 litros em polietileno de alta densidade, tampa rosca, proteção UV. Resistente ao calor, raios UV e agentes químicos. Inclui tampão. Fabricante Fortlev. Norma ABNT NBR 14799.", price: 189.00, original_price: 219.00, catSlug: 'saneamento-e-hidraulica', subSlug: 'caixas-dagua', unit: 'un', stock: 50, active: true, featured: true, is_new: false, is_discount: true, sku: 'CXA-500L-FLV-POLI', weight: null },
    { name: "Caixa d'água 1000L - Fortlev - Polietileno", slug: 'caixa-dagua-1000l-fortlev', description: "Caixa d'água 1000 litros em polietileno de alta densidade para residências maiores ou uso comercial. Tampa com rosca, 4 orifícios. Proteção UV. Norma ABNT NBR 14799.", price: 329.00, original_price: 369.00, catSlug: 'saneamento-e-hidraulica', subSlug: 'caixas-dagua', unit: 'un', stock: 30, active: true, featured: true, is_new: false, is_discount: true, sku: 'CXA-1000L-FLV-POLI', weight: null },
    { name: "Caixa d'água 2000L - Fortlev - Polietileno", slug: 'caixa-dagua-2000l-fortlev', description: "Caixa d'água 2000 litros em polietileno de alta densidade para estabelecimentos comerciais e obras. Ideal para locais com abastecimento irregular. Norma ABNT NBR 14799.", price: 589.00, original_price: null, catSlug: 'saneamento-e-hidraulica', subSlug: 'caixas-dagua', unit: 'un', stock: 15, active: true, featured: false, is_new: false, is_discount: false, sku: 'CXA-2000L-FLV-POLI', weight: null },
    { name: 'Ralo Quadrado PVC 100x100mm - Tigre', slug: 'ralo-quadrado-pvc-100mm-tigre', description: 'Ralo quadrado em PVC 100x100mm com cesto coletador e grelha removível. Para banheiros, áreas de serviço e varandas. Conexão para tubo de 50mm. Fabricante Tigre.', price: 8.90, original_price: null, catSlug: 'saneamento-e-hidraulica', subSlug: 'ralos', unit: 'un', stock: 200, active: true, featured: false, is_new: false, is_discount: false, sku: 'RAL-QUA-PVC-100-TGR', weight: null },
    { name: 'Ralo Linear PVC 15cm - Tigre', slug: 'ralo-linear-pvc-15cm-tigre', description: 'Ralo linear (canaleta) PVC 15cm. Design moderno para box de banheiro, área gourmet e lavanderias. Conexão para tubo 40mm. Fácil instalação e limpeza.', price: 15.90, original_price: null, catSlug: 'saneamento-e-hidraulica', subSlug: 'ralos', unit: 'un', stock: 150, active: true, featured: false, is_new: false, is_discount: false, sku: 'RAL-LIN-PVC-15-TGR', weight: null },
    { name: 'Ralo Linear PVC 30cm - Tigre', slug: 'ralo-linear-pvc-30cm-tigre', description: 'Ralo linear (canaleta) PVC 30cm com grelha removível. Para box de banheiro amplo, áreas externas e piscinas. Conexão para tubo 50mm. Alta capacidade de escoamento.', price: 22.90, original_price: null, catSlug: 'saneamento-e-hidraulica', subSlug: 'ralos', unit: 'un', stock: 100, active: true, featured: false, is_new: false, is_discount: false, sku: 'RAL-LIN-PVC-30-TGR', weight: null },

    // ── DRYWALL E FORRO ─────────────────────────────────────────────────────
    { name: 'Chapa Drywall ST (Branca) 12,5mm - 1,20x1,80m - Knauf', slug: 'chapa-drywall-st-1200x1800-knauf', description: 'Chapa de gesso acartonado Standard (ST) 12,5mm — 1,20m x 1,80m. Para paredes e forros em áreas secas. Superfície branca pronta para pintura. Norma ABNT NBR 14715. Fabricante Knauf.', price: 39.90, original_price: 43.00, catSlug: 'drywall-e-forro', subSlug: 'chapas-drywall', unit: 'un', stock: 300, active: true, featured: true, is_new: false, is_discount: true, sku: 'DRY-ST-1200X1800-KNF', weight: 12 },
    { name: 'Chapa Drywall RU (Verde) 12,5mm - 1,20x1,80m - Knauf', slug: 'chapa-drywall-ru-1200x1800-knauf', description: 'Chapa de gesso acartonado resistente à umidade (RU) 12,5mm — identificada pela coloração verde. Para banheiros, cozinhas e áreas úmidas. Tratamento hidrofugante no núcleo e nas faces. Norma ABNT NBR 14715.', price: 49.90, original_price: 54.00, catSlug: 'drywall-e-forro', subSlug: 'chapas-drywall', unit: 'un', stock: 200, active: true, featured: false, is_new: false, is_discount: false, sku: 'DRY-RU-1200X1800-KNF', weight: 12 },
    { name: 'Perfil Guia 70mm Drywall - Barra 3m - Placo', slug: 'perfil-guia-70mm-drywall-3m-placo', description: 'Perfil U (guia) em aço galvanizado 70mm para sistemas Drywall. Fixado em piso e teto para guiar a montagem. Espessura 0,5mm. Barra 3m. Fabricante Placo.', price: 12.90, original_price: null, catSlug: 'drywall-e-forro', subSlug: 'perfis-metalicos', unit: 'barra', stock: 300, active: true, featured: false, is_new: false, is_discount: false, sku: 'PRF-GUI-70-DRY-3M-PLC', weight: 1.8 },
    { name: 'Forro PVC Branco Liso 0,20x6m - 7mm', slug: 'forro-pvc-branco-liso-020x6m-7mm', description: 'Forro PVC rígido branco liso, largura 20cm, comprimento 6m, espessura 7mm. Instalação com clipes e tabicas. Resistente à umidade, mofo e cupins. Encaixe macho-fêmea.', price: 24.90, original_price: null, catSlug: 'drywall-e-forro', subSlug: 'forro-pvc', unit: 'un', stock: 200, active: true, featured: false, is_new: false, is_discount: false, sku: 'FRO-PVC-BRC-020X6-7MM', weight: null },

    // ── TINTAS E IMPERMEABILIZANTES ─────────────────────────────────────────
    { name: 'Impermeabilizante Manta Líquida - Vedacit - 18kg', slug: 'impermeabilizante-manta-liquida-vedacit-18kg', description: 'Manta líquida impermeabilizante à base de polímeros e fibras de poliéster. Aplicação com rolo ou trincha — sem maçarico. Ideal para lajes, calhas, terraços e sacadas. Cobertura aproximada 1kg/m². Fabricante Vedacit.', price: 289.00, original_price: 319.00, catSlug: 'tintas-e-impermeabilizantes', subSlug: 'impermeabilizantes', unit: 'un', stock: 80, active: true, featured: true, is_new: false, is_discount: true, sku: 'IMP-MAN-LIQ-VDC-18KG', weight: 18 },
    { name: 'Impermeabilizante Cimentício Bicomponente - Vedacit - 18kg', slug: 'impermeabilizante-cimenticio-vedacit-18kg', description: 'Impermeabilizante cimentício bicomponente (pó + líquido). Aderência ao concreto e alvenaria. Para piscinas, reservatórios, caixas d\'água (interior) e fundações. Resistente à pressão positiva e negativa.', price: 149.00, original_price: null, catSlug: 'tintas-e-impermeabilizantes', subSlug: 'impermeabilizantes', unit: 'un', stock: 100, active: true, featured: false, is_new: false, is_discount: false, sku: 'IMP-CIM-BIC-VDC-18KG', weight: 18 },
    { name: 'Tinta Acrílica Premium Fosca - Suvinil - 18L', slug: 'tinta-acrilica-premium-fosca-suvinil-18l', description: 'Tinta acrílica premium para paredes e tetos internos e externos. Resistente à lavagem (mais de 4000 esfregações). Acabamento fosco. Rendimento aprox. 200m² por demão. Disponível em todas as tonalidades Suvinil.', price: 189.00, original_price: 219.00, catSlug: 'tintas-e-impermeabilizantes', subSlug: 'tintas-acrilicas', unit: 'un', stock: 60, active: true, featured: true, is_new: false, is_discount: true, sku: 'TNT-ACR-PRE-SUV-18L', weight: 22 },
    { name: 'Massa Corrida PVA - Suvinil - 25kg', slug: 'massa-corrida-pva-suvinil-25kg', description: 'Massa corrida PVA para preparação de superfícies internas antes da pintura. Preenche imperfeições e microporos. Ideal para paredes rebocadas e drywall. Não indicada para áreas externas.', price: 49.90, original_price: 54.00, catSlug: 'tintas-e-impermeabilizantes', subSlug: 'massa-corrida', unit: 'un', stock: 100, active: true, featured: false, is_new: false, is_discount: false, sku: 'MCS-PVA-SUV-25KG', weight: 25 },
    { name: 'Selador Acrílico - Coral - 18L', slug: 'selador-acrilico-coral-18l', description: 'Selador acrílico para preparação de superfícies porosas antes da massa corrida ou tinta. Penetra nos poros, uniformiza a absorção e melhora a aderência. Rendimento 100–150m² por lata.', price: 119.00, original_price: null, catSlug: 'tintas-e-impermeabilizantes', subSlug: 'seladores-e-primers', unit: 'un', stock: 60, active: true, featured: false, is_new: false, is_discount: false, sku: 'SEL-ACR-CRL-18L', weight: 22 },

    // ── AÇO E ESTRUTURA ─────────────────────────────────────────────────────
    { name: 'Vergalhão CA-50 8mm - Barra 12m', slug: 'vergalhao-ca-50-8mm-12m', description: 'Vergalhão de aço CA-50 diâmetro 8mm, barra 12m. Para armação de lajes, vigas-calha e estruturas menores. Resistência 500 MPa. Norma ABNT NBR 7480.', price: 59.00, original_price: null, catSlug: 'aco-e-estrutura', subSlug: 'vergalhoes', unit: 'barra', stock: 500, active: true, featured: false, is_new: false, is_discount: false, sku: 'VRG-CA50-8MM-12M', weight: 6.0 },
    { name: 'Vergalhão CA-50 10mm - Barra 12m', slug: 'vergalhao-ca-50-10mm-12m', description: 'Vergalhão de aço CA-50 diâmetro 10mm, barra 12m. Para pilares, vigas, fundações e lajes de concreto armado. Alta resistência à tração (500 MPa). Norma ABNT NBR 7480 e NBR 6118.', price: 89.00, original_price: null, catSlug: 'aco-e-estrutura', subSlug: 'vergalhoes', unit: 'barra', stock: 500, active: true, featured: true, is_new: false, is_discount: false, sku: 'VRG-CA50-10MM-12M', weight: 9.2 },
    { name: 'Vergalhão CA-60 5mm - Barra 12m', slug: 'vergalhao-ca-60-5mm-12m', description: 'Vergalhão CA-60 diâmetro 5mm (fio), barra 12m. Para estribos de vigas e pilares, armadura de lajes nervuradas. Aço de alta resistência (600 MPa). Norma ABNT NBR 7480.', price: 28.50, original_price: null, catSlug: 'aco-e-estrutura', subSlug: 'vergalhoes', unit: 'barra', stock: 500, active: true, featured: false, is_new: false, is_discount: false, sku: 'VRG-CA60-5MM-12M', weight: 2.3 },
    { name: 'Tela Soldada Q-92 - 2,45x6m', slug: 'tela-soldada-q-92-245x6m', description: 'Tela soldada Q-92, malha 10x10cm, fio 4,9mm, dimensões 2,45x6m. Para armação de lajes planas, pisos industriais e calçadas. Reduz mão de obra de armação em até 50%. Norma ABNT NBR 7480.', price: 145.00, original_price: null, catSlug: 'aco-e-estrutura', subSlug: 'tela-soldada', unit: 'un', stock: 100, active: true, featured: true, is_new: false, is_discount: false, sku: 'TEL-SOL-Q92-245X6M', weight: 14.2 },
    { name: 'Arame Recozido 18 BWG - Rolo 1kg', slug: 'arame-recozido-18bwg-rolo-1kg', description: 'Arame recozido calibre 18 BWG (1,2mm), rolo 1kg. Para amarração de ferragens em pilares, vigas e lajes. Alta maleabilidade, não parte ao dobrar. Indispensável no canteiro de obras.', price: 12.90, original_price: null, catSlug: 'aco-e-estrutura', subSlug: 'arame', unit: 'un', stock: 300, active: true, featured: false, is_new: false, is_discount: false, sku: 'ARM-REC-18BWG-1KG', weight: 1 },

    // ── FERRAMENTAS E EPI ───────────────────────────────────────────────────
    { name: 'Capacete de Segurança Classe A - Branco - Plastcor', slug: 'capacete-seguranca-classe-a-branco', description: 'Capacete de segurança Classe A para ambientes sem riscos elétricos. Polietileno de alta densidade, suspensão tipo boné de 6 pontos. Cor branca. Norma ABNT NBR 8221 e NR-6.', price: 14.90, original_price: null, catSlug: 'ferramentas-e-epi', subSlug: 'epi', unit: 'un', stock: 200, active: true, featured: false, is_new: false, is_discount: false, sku: 'CAP-SEG-A-BRC-PLC', weight: 0.4 },
    { name: 'Luva de Látex Reforçada - Par - Danny', slug: 'luva-latex-reforcada-par-danny', description: 'Luva de látex natural reforçada para proteção das mãos em obras. Resistente a produtos químicos, argamassas e cimentos. Palma antiderrapante. Tamanhos P, M e G. Norma NR-6.', price: 7.90, original_price: null, catSlug: 'ferramentas-e-epi', subSlug: 'epi', unit: 'un', stock: 200, active: true, featured: false, is_new: false, is_discount: false, sku: 'LUV-LAT-REF-DAN-PAR', weight: null },
    { name: 'Betoneira 400L - Motor 2CV - CSM', slug: 'betoneira-400l-2cv-csm', description: 'Betoneira elétrica 400 litros, motor 2CV bivolt (110/220V), tambor basculante. Capacidade de produção 300L de concreto por carga. Estrutura metálica reforçada com rodas para mobilidade. Fabricante CSM.', price: 1890.00, original_price: 2100.00, catSlug: 'ferramentas-e-epi', subSlug: 'betoneiras', unit: 'un', stock: 10, active: true, featured: true, is_new: false, is_discount: true, sku: 'BTN-400L-2CV-CSM', weight: null },
    { name: 'Enxada Larga - Haste de Madeira - Tramontina', slug: 'enxada-larga-madeira-tramontina', description: 'Enxada larga com lâmina em aço forjado temperado e haste de madeira de eucalipto. Para movimentação de terra, argamassa e concreto no canteiro. Lâmina 1,5kg. Haste 1,30m. Fabricante Tramontina.', price: 42.90, original_price: null, catSlug: 'ferramentas-e-epi', subSlug: 'ferramentas-manuais', unit: 'un', stock: 100, active: true, featured: false, is_new: false, is_discount: false, sku: 'ENX-LAR-MAD-TRM', weight: null },

    // ── PISOS E REVESTIMENTOS ───────────────────────────────────────────────
    { name: 'Rejunte Acetinado Branco - Quartzolit - 5kg', slug: 'rejunte-acetinado-branco-quartzolit-5kg', description: 'Rejunte cimentício acetinado para juntas de 1 a 8mm. Cor branco neve. Alta resistência à penetração de sujeira e manchas. Para pisos cerâmicos, porcelanatos e pedras naturais. Norma ABNT NBR 14992.', price: 18.90, original_price: 21.00, catSlug: 'pisos-e-revestimentos', subSlug: 'rejunte', unit: 'un', stock: 200, active: true, featured: false, is_new: false, is_discount: false, sku: 'REJ-ACT-BRC-QZL-5KG', weight: 5 },
    { name: 'Rejunte Flexível Cinza - Weber - 5kg', slug: 'rejunte-flexivel-cinza-weber-5kg', description: 'Rejunte flexível para juntas de 2 a 12mm. Cor cinza cimento. Formulação com polímeros que acompanham movimentações estruturais sem fissuras. Para áreas externas, piscinas e juntas de grande largura.', price: 22.90, original_price: null, catSlug: 'pisos-e-revestimentos', subSlug: 'rejunte', unit: 'un', stock: 150, active: true, featured: false, is_new: false, is_discount: false, sku: 'REJ-FLX-CZA-WBR-5KG', weight: 5 },
  ]

  const products = productsData.map(p => {
    const { catSlug, subSlug, ...rest } = p
    return {
      ...rest,
      id: crypto.randomUUID(),
      category_id: catMap[catSlug],
      subcategory_id: subMap[subSlug]
    }
  })

  // Inserir em lotes de 20 para evitar limites da API
  const batchSize = 20
  let totalInserted = 0
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    r = await supabase.from('products').insert(batch)
    if (r.error) {
      console.error(`  ERROR products batch ${i/batchSize + 1}:`, r.error.message)
      console.error('  Detalhe:', JSON.stringify(r.error))
      process.exit(1)
    }
    totalInserted += batch.length
    console.log(`  ✓ Lote ${Math.ceil((i+1)/batchSize)}: ${totalInserted}/${products.length} produtos inseridos`)
  }

  // ── Resumo final ──────────────────────────────────────────────────────────
  console.log('\n━━━ RESUMO FINAL ━━━')
  const { data: catCount } = await supabase.from('categories').select('id', { count: 'exact', head: true })
  const { count: subCount } = await supabase.from('subcategories').select('id', { count: 'exact', head: true })
  const { count: prodCount } = await supabase.from('products').select('id', { count: 'exact', head: true })
  console.log(`  ✓ Categorias:    ${cats.length}`)
  console.log(`  ✓ Subcategorias: ${subs.length}`)
  console.log(`  ✓ Produtos:      ${totalInserted}`)
  console.log('\n✅ Catálogo reconstruído com sucesso!')
}

run().catch(err => {
  console.error('ERRO CRÍTICO:', err)
  process.exit(1)
})
