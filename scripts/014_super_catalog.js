/**
 * 014_super_catalog.js
 * Mega seed de ~150 produtos (estilo Obramax / 333obra)
 */

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const supabase = createClient(
  'https://sdafczehznywoeqnfgph.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8'
)

const catMap = {}
const subMap = {}

async function run() {
  console.log('━━━ FASE 1: Limpeza Total ━━━')
  await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  console.log('\n━━━ FASE 2: Categorias ━━━')
  const catsData = [
    { name: 'Cimento e Cal', slug: 'cimento-e-cal', sort_order: 1, active: true },
    { name: 'Argamassas', slug: 'argamassas', sort_order: 2, active: true },
    { name: 'Tijolos e Blocos', slug: 'tijolos-e-blocos', sort_order: 3, active: true },
    { name: 'Pisos e Revestimentos', slug: 'pisos-e-revestimentos', sort_order: 4, active: true },
    { name: 'Areia e Brita', slug: 'areia-e-brita', sort_order: 5, active: true },
    { name: 'Hidráulica', slug: 'hidraulica', sort_order: 6, active: true },
    { name: 'Elétrica', slug: 'eletrica', sort_order: 7, active: true },
    { name: 'Drywall e Forro', slug: 'drywall-e-forro', sort_order: 8, active: true },
    { name: 'Tintas e Impermeabilizantes', slug: 'tintas-e-impermeabilizantes', sort_order: 9, active: true },
    { name: 'Ferramentas e EPI', slug: 'ferramentas-e-epi', sort_order: 10, active: true },
    { name: 'Aço e Ferragens', slug: 'aco-e-ferragens', sort_order: 11, active: true },
    { name: 'Madeiras e Telhas', slug: 'madeiras-e-telhas', sort_order: 12, active: true },
  ]
  const cats = catsData.map(c => { const id = crypto.randomUUID(); catMap[c.slug] = id; return { ...c, id } })
  let r = await supabase.from('categories').insert(cats)
  if (r.error) { console.error('  ERROR categories:', r.error.message); process.exit(1) }

  console.log('\n━━━ FASE 3: Subcategorias ━━━')
  const subsData = [
    // Cimento e Cal
    { name: 'Cimento CP II', slug: 'cimento-cp-ii', catSlug: 'cimento-e-cal', sort_order: 1 },
    { name: 'Cimento CP III', slug: 'cimento-cp-iii', catSlug: 'cimento-e-cal', sort_order: 2 },
    { name: 'Cimento CP V', slug: 'cimento-cp-v', catSlug: 'cimento-e-cal', sort_order: 3 },
    { name: 'Cal Hidratada', slug: 'cal-hidratada', catSlug: 'cimento-e-cal', sort_order: 4 },
    // Argamassas
    { name: 'Assentamento AC I', slug: 'ac-i', catSlug: 'argamassas', sort_order: 1 },
    { name: 'Assentamento AC II', slug: 'ac-ii', catSlug: 'argamassas', sort_order: 2 },
    { name: 'Assentamento AC III', slug: 'ac-iii', catSlug: 'argamassas', sort_order: 3 },
    { name: 'Porcelanato e Grandes Formatos', slug: 'porcelanato-grandes', catSlug: 'argamassas', sort_order: 4 },
    { name: 'Reboco e Chapisco', slug: 'reboco-chapisco', catSlug: 'argamassas', sort_order: 5 },
    // Tijolos
    { name: 'Tijolo Baiano', slug: 'tijolo-baiano', catSlug: 'tijolos-e-blocos', sort_order: 1 },
    { name: 'Bloco de Concreto', slug: 'bloco-concreto', catSlug: 'tijolos-e-blocos', sort_order: 2 },
    { name: 'Bloco Cerâmico Estrutural', slug: 'bloco-ceramico-estrutural', catSlug: 'tijolos-e-blocos', sort_order: 3 },
    // Pisos
    { name: 'Cerâmica Esmaltada', slug: 'ceramica-esmaltada', catSlug: 'pisos-e-revestimentos', sort_order: 1 },
    { name: 'Porcelanato Polido', slug: 'porcelanato-polido', catSlug: 'pisos-e-revestimentos', sort_order: 2 },
    { name: 'Rejuntes', slug: 'rejuntes', catSlug: 'pisos-e-revestimentos', sort_order: 3 },
    { name: 'Pastilhas', slug: 'pastilhas', catSlug: 'pisos-e-revestimentos', sort_order: 4 },
    // Areia/Brita
    { name: 'Areia Fina e Média', slug: 'areia-fina-media', catSlug: 'areia-e-brita', sort_order: 1 },
    { name: 'Areia Grossa', slug: 'areia-grossa', catSlug: 'areia-e-brita', sort_order: 2 },
    { name: 'Brita e Pedrisco', slug: 'brita', catSlug: 'areia-e-brita', sort_order: 3 },
    // Hidraulica
    { name: 'Tubos PVC Esgoto', slug: 'tubos-pvc-esgoto', catSlug: 'hidraulica', sort_order: 1 },
    { name: 'Tubos PVC Água Fria', slug: 'tubos-pvc-agua-fria', catSlug: 'hidraulica', sort_order: 2 },
    { name: 'Tubos CPVC Água Quente', slug: 'tubos-cpvc', catSlug: 'hidraulica', sort_order: 3 },
    { name: 'Conexões PVC', slug: 'conexoes-pvc', catSlug: 'hidraulica', sort_order: 4 },
    { name: 'Caixas d\'Água', slug: 'caixas-dagua', catSlug: 'hidraulica', sort_order: 5 },
    { name: 'Bombas d\'Água', slug: 'bombas-dagua', catSlug: 'hidraulica', sort_order: 6 },
    { name: 'Torneiras e Registros', slug: 'torneiras-registros', catSlug: 'hidraulica', sort_order: 7 },
    { name: 'Ralos e Grelhas', slug: 'ralos-grelhas', catSlug: 'hidraulica', sort_order: 8 },
    // Eletrica
    { name: 'Fios e Cabos', slug: 'fios-cabos', catSlug: 'eletrica', sort_order: 1 },
    { name: 'Disjuntores', slug: 'disjuntores', catSlug: 'eletrica', sort_order: 2 },
    { name: 'Interruptores e Tomadas', slug: 'interruptores-tomadas', catSlug: 'eletrica', sort_order: 3 },
    { name: 'Quadros de Distribuição', slug: 'quadros-distribuicao', catSlug: 'eletrica', sort_order: 4 },
    { name: 'Lâmpadas e Painéis LED', slug: 'lampadas-led', catSlug: 'eletrica', sort_order: 5 },
    { name: 'Eletrodutos e Conduítes', slug: 'eletrodutos', catSlug: 'eletrica', sort_order: 6 },
    // Drywall
    { name: 'Chapas Drywall', slug: 'chapas-drywall', catSlug: 'drywall-e-forro', sort_order: 1 },
    { name: 'Perfis Metálicos', slug: 'perfis-metalicos', catSlug: 'drywall-e-forro', sort_order: 2 },
    { name: 'Forro PVC', slug: 'forro-pvc', catSlug: 'drywall-e-forro', sort_order: 3 },
    { name: 'Massas e Fitas para Drywall', slug: 'massas-fitas-drywall', catSlug: 'drywall-e-forro', sort_order: 4 },
    // Tintas
    { name: 'Tintas Acrílicas', slug: 'tintas-acrilicas', catSlug: 'tintas-e-impermeabilizantes', sort_order: 1 },
    { name: 'Massas Corridas', slug: 'massas-corridas', catSlug: 'tintas-e-impermeabilizantes', sort_order: 2 },
    { name: 'Impermeabilizantes', slug: 'impermeabilizantes', catSlug: 'tintas-e-impermeabilizantes', sort_order: 3 },
    { name: 'Seladores e Fundos', slug: 'seladores', catSlug: 'tintas-e-impermeabilizantes', sort_order: 4 },
    { name: 'Acessórios Pintura', slug: 'acessorios-pintura', catSlug: 'tintas-e-impermeabilizantes', sort_order: 5 },
    // Ferramentas
    { name: 'Ferramentas Elétricas', slug: 'ferramentas-eletricas', catSlug: 'ferramentas-e-epi', sort_order: 1 },
    { name: 'Ferramentas Manuais', slug: 'ferramentas-manuais', catSlug: 'ferramentas-e-epi', sort_order: 2 },
    { name: 'Betoneiras e Guinchos', slug: 'betoneiras-guinchos', catSlug: 'ferramentas-e-epi', sort_order: 3 },
    { name: 'EPI e Segurança', slug: 'epi-seguranca', catSlug: 'ferramentas-e-epi', sort_order: 4 },
    // Aço
    { name: 'Vergalhões', slug: 'vergalhoes', catSlug: 'aco-e-ferragens', sort_order: 1 },
    { name: 'Telas e Arames', slug: 'telas-arames', catSlug: 'aco-e-ferragens', sort_order: 2 },
    { name: 'Pregos e Parafusos', slug: 'pregos-parafusos', catSlug: 'aco-e-ferragens', sort_order: 3 },
    // Madeiras e Telhas
    { name: 'Telhas de Fibrocimento', slug: 'telhas-fibrocimento', catSlug: 'madeiras-e-telhas', sort_order: 1 },
    { name: 'Telhas Cerâmicas', slug: 'telhas-ceramicas', catSlug: 'madeiras-e-telhas', sort_order: 2 },
    { name: 'Madeiras para Telhado', slug: 'madeiras-telhado', catSlug: 'madeiras-e-telhas', sort_order: 3 },
    { name: 'Chapas Madeirite', slug: 'chapas-madeirite', catSlug: 'madeiras-e-telhas', sort_order: 4 },
  ]
  const subs = subsData.map(s => { const id = crypto.randomUUID(); subMap[s.slug] = id; const { catSlug, ...rest } = s; return { ...rest, id, category_id: catMap[catSlug], active: true } })
  r = await supabase.from('subcategories').insert(subs)
  if (r.error) { console.error('  ERROR subcategories:', r.error.message); process.exit(1) }

  console.log('\n━━━ FASE 4: Produtos (Catálogo Master) ━━━')
  const productsData = [
    // --- CIMENTO E CAL ---
    { name: 'Cimento CP II-F 32 - Votoran - Saco 50kg', sku: 'CIM-VOT-CPII-50', cat: 'cimento-e-cal', sub: 'cimento-cp-ii', price: 38.90, orig: 42.00, u: 'saco', w: 50, desc: 'Cimento Portland Composto com fíler CP II-F 32 para uso geral.' },
    { name: 'Cimento CP II-Z 32 - InterCement - Saco 50kg', sku: 'CIM-ICM-CPIIZ-50', cat: 'cimento-e-cal', sub: 'cimento-cp-ii', price: 39.50, orig: null, u: 'saco', w: 50, desc: 'Cimento Portland Composto com Pozolana. Resistência a sulfatos.' },
    { name: 'Cimento CP II-F 32 - Nassau - Saco 50kg', sku: 'CIM-NAS-CPII-50', cat: 'cimento-e-cal', sub: 'cimento-cp-ii', price: 37.90, orig: null, u: 'saco', w: 50, desc: 'Cimento CP II-F 32 Nassau.' },
    { name: 'Cimento CP II-E 32 - CSN - Saco 50kg', sku: 'CIM-CSN-CPIIE-50', cat: 'cimento-e-cal', sub: 'cimento-cp-ii', price: 38.50, orig: null, u: 'saco', w: 50, desc: 'Cimento CSN com escória de alto-forno.' },
    { name: 'Cimento CP III 40 RS - Votoran - Saco 50kg', sku: 'CIM-VOT-CPIII-50', cat: 'cimento-e-cal', sub: 'cimento-cp-iii', price: 41.90, orig: null, u: 'saco', w: 50, desc: 'Cimento resistente a sulfatos, ideal para grandes obras.' },
    { name: 'Cimento CP III 40 RS - Nacional - Saco 50kg', sku: 'CIM-NAC-CPIII-50', cat: 'cimento-e-cal', sub: 'cimento-cp-iii', price: 40.90, orig: null, u: 'saco', w: 50, desc: 'Cimento CP III Alto-Forno Nacional.' },
    { name: 'Cimento CP V ARI - Votoran - Saco 50kg', sku: 'CIM-VOT-CPV-50', cat: 'cimento-e-cal', sub: 'cimento-cp-v', price: 43.90, orig: 46.0, u: 'saco', w: 50, desc: 'Cimento Portland de Alta Resistência Inicial.' },
    { name: 'Cimento CP V ARI - InterCement - Saco 50kg', sku: 'CIM-ICM-CPV-50', cat: 'cimento-e-cal', sub: 'cimento-cp-v', price: 42.50, orig: null, u: 'saco', w: 50, desc: 'Cimento CP V ARI InterCement.' },
    { name: 'Cimento Branco Estrutural CP II - Votoran - Saco 50kg', sku: 'CIM-BRN-VOT-50', cat: 'cimento-e-cal', sub: 'cimento-branco', price: 65.00, orig: 70.0, u: 'saco', w: 50, desc: 'Cimento branco estrutural.' },
    { name: 'Cal Hidratada CH-I - Itaú - Saco 20kg', sku: 'CAL-CHI-ITA-20', cat: 'cimento-e-cal', sub: 'cal-hidratada', price: 25.90, orig: 28.0, u: 'saco', w: 20, desc: 'Cal Hidratada CH-I Itaú máxima pureza.' },
    { name: 'Cal Hidratada CH-II - Cauê - Saco 20kg', sku: 'CAL-CHII-CAU-20', cat: 'cimento-e-cal', sub: 'cal-hidratada', price: 19.90, orig: null, u: 'saco', w: 20, desc: 'Cal Hidratada comum CH-II Cauê.' },
    { name: 'Cal Hidratada CH-II - Votoran - Saco 20kg', sku: 'CAL-CHII-VOT-20', cat: 'cimento-e-cal', sub: 'cal-hidratada', price: 21.50, orig: null, u: 'saco', w: 20, desc: 'Cal Hidratada CH-II Votoran.' },

    // --- ARGAMASSAS ---
    { name: 'Argamassa Colante AC I - Quartzolit - 20kg', sku: 'ARG-ACI-QZL-20', cat: 'argamassas', sub: 'ac-i', price: 18.90, orig: 21.0, u: 'saco', w: 20, desc: 'Argamassa para áreas internas AC I.' },
    { name: 'Argamassa Colante AC I - Votoran - 20kg', sku: 'ARG-ACI-VOT-20', cat: 'argamassas', sub: 'ac-i', price: 17.90, orig: null, u: 'saco', w: 20, desc: 'Argamassa AC I Votoran.' },
    { name: 'Argamassa Colante AC II - Weber - 20kg', sku: 'ARG-ACII-WBR-20', cat: 'argamassas', sub: 'ac-ii', price: 22.90, orig: 25.0, u: 'saco', w: 20, desc: 'Argamassa AC II para áreas externas.' },
    { name: 'Argamassa Colante AC II - Quartzolit - 20kg', sku: 'ARG-ACII-QZL-20', cat: 'argamassas', sub: 'ac-ii', price: 23.50, orig: null, u: 'saco', w: 20, desc: 'Argamassa AC II Quartzolit.' },
    { name: 'Argamassa Colante AC III - Quartzolit - 20kg', sku: 'ARG-ACIII-QZL-20', cat: 'argamassas', sub: 'ac-iii', price: 28.90, orig: 32.0, u: 'saco', w: 20, desc: 'Argamassa AC III Alta aderência.' },
    { name: 'Argamassa AC III Grandes Formatos - Weber - 20kg', sku: 'ARG-ACIII-GF-WBR-20', cat: 'argamassas', sub: 'porcelanato-grandes', price: 34.90, orig: 39.0, u: 'saco', w: 20, desc: 'Argamassa para Porcelanatos grandes formatos.' },
    { name: 'Argamassa Porcelanato Interno - Quartzolit - 20kg', sku: 'ARG-PORC-INT-QZL-20', cat: 'argamassas', sub: 'porcelanato-grandes', price: 26.90, orig: null, u: 'saco', w: 20, desc: 'Argamassa específica para porcelanatos internos.' },
    { name: 'Chapisco Rolado - Votorantim - 20kg', sku: 'ARG-CHP-VOT-20', cat: 'argamassas', sub: 'reboco-chapisco', price: 16.90, orig: null, u: 'saco', w: 20, desc: 'Chapisco pronto para aplicação com rolo.' },
    { name: 'Argamassa Reboco Pronto - Proquil - 20kg', sku: 'ARG-RBC-PRQ-20', cat: 'argamassas', sub: 'reboco-chapisco', price: 18.90, orig: null, u: 'saco', w: 20, desc: 'Reboco projetado.' },

    // --- TIJOLOS E BLOCOS ---
    { name: 'Tijolo Baiano 6 Furos 9x19x19cm', sku: 'TIJ-BAI-6F-9X19', cat: 'tijolos-e-blocos', sub: 'tijolo-baiano', price: 0.65, orig: null, u: 'un', w: 2.2, desc: 'Tijolo cerâmico de vedação padrão.' },
    { name: 'Tijolo Baiano 8 Furos 9x19x19cm', sku: 'TIJ-BAI-8F-9X19', cat: 'tijolos-e-blocos', sub: 'tijolo-baiano', price: 0.75, orig: null, u: 'un', w: 2.5, desc: 'Tijolo cerâmico reforçado.' },
    { name: 'Tijolo Baiano 9 Furos 11,5x14x24cm', sku: 'TIJ-BAI-9F', cat: 'tijolos-e-blocos', sub: 'tijolo-baiano', price: 0.90, orig: null, u: 'un', w: 3.1, desc: 'Tijolo baianão.' },
    { name: 'Bloco de Concreto Vedação 9x19x39cm', sku: 'BLC-CON-VED-9', cat: 'tijolos-e-blocos', sub: 'bloco-concreto', price: 2.80, orig: null, u: 'un', w: 11, desc: 'Bloco de concreto 9cm.' },
    { name: 'Bloco de Concreto Vedação 14x19x39cm', sku: 'BLC-CON-VED-14', cat: 'tijolos-e-blocos', sub: 'bloco-concreto', price: 3.50, orig: null, u: 'un', w: 16, desc: 'Bloco de concreto 14cm.' },
    { name: 'Bloco de Concreto Vedação 19x19x39cm', sku: 'BLC-CON-VED-19', cat: 'tijolos-e-blocos', sub: 'bloco-concreto', price: 4.80, orig: null, u: 'un', w: 20, desc: 'Bloco de concreto 19cm.' },
    { name: 'Bloco Cerâmico Estrutural 14x19x29cm', sku: 'BLC-CER-EST-14', cat: 'tijolos-e-blocos', sub: 'bloco-ceramico-estrutural', price: 2.50, orig: null, u: 'un', w: 6.5, desc: 'Bloco cerâmico estrutural classe A.' },

    // --- AREIA E BRITA ---
    { name: 'Areia Fina Lavada - Metro Cúbico (m³)', sku: 'ARE-FIN-M3', cat: 'areia-e-brita', sub: 'areia-fina-media', price: 95.0, orig: null, u: 'm³', w: null, desc: 'Areia fina para acabamento.' },
    { name: 'Areia Média Lavada - Metro Cúbico (m³)', sku: 'ARE-MED-M3', cat: 'areia-e-brita', sub: 'areia-fina-media', price: 90.0, orig: null, u: 'm³', w: null, desc: 'Areia média para reboco.' },
    { name: 'Areia Grossa Lavada - Metro Cúbico (m³)', sku: 'ARE-GRO-M3', cat: 'areia-e-brita', sub: 'areia-grossa', price: 89.0, orig: null, u: 'm³', w: null, desc: 'Areia grossa para concreto.' },
    { name: 'Brita 0 (Pedrisco) - Metro Cúbico (m³)', sku: 'BRI-0-M3', cat: 'areia-e-brita', sub: 'brita', price: 120.0, orig: null, u: 'm³', w: null, desc: 'Brita zero para pequenas peças.' },
    { name: 'Brita 1 - Metro Cúbico (m³)', sku: 'BRI-1-M3', cat: 'areia-e-brita', sub: 'brita', price: 115.0, orig: null, u: 'm³', w: null, desc: 'Brita 1 padrão para concreto estrutural.' },
    { name: 'Brita 2 - Metro Cúbico (m³)', sku: 'BRI-2-M3', cat: 'areia-e-brita', sub: 'brita', price: 110.0, orig: null, u: 'm³', w: null, desc: 'Brita 2 grossa.' },
    { name: 'Areia Ensacada Fina - 20kg', sku: 'ARE-ENS-FIN-20', cat: 'areia-e-brita', sub: 'areia-fina-media', price: 5.90, orig: null, u: 'saco', w: 20, desc: 'Areia ensacada para pequenos reparos.' },
    { name: 'Brita 1 Ensacada - 20kg', sku: 'BRI-ENS-1-20', cat: 'areia-e-brita', sub: 'brita', price: 6.90, orig: null, u: 'saco', w: 20, desc: 'Brita ensacada.' },

    // --- PISOS E REVESTIMENTOS ---
    { name: 'Porcelanato Polido Bianco Master 60x60cm - Eliane', sku: 'POR-POL-BIA-60-ELI', cat: 'pisos-e-revestimentos', sub: 'porcelanato-polido', price: 69.90, orig: 89.90, u: 'm²', w: 15, desc: 'Porcelanato Polido Branco 60x60 caixa com 1,44m²' },
    { name: 'Porcelanato Esmaltado Cimento 60x60cm - Portobello', sku: 'POR-ESM-CIM-60-PTB', cat: 'pisos-e-revestimentos', sub: 'porcelanato-polido', price: 59.90, orig: null, u: 'm²', w: 15, desc: 'Porcelanato estilo cimento queimado.' },
    { name: 'Porcelanato Amadeirado Carvalho 20x120cm - Eliane', sku: 'POR-AMA-CAR-120-ELI', cat: 'pisos-e-revestimentos', sub: 'porcelanato-polido', price: 95.00, orig: 110.0, u: 'm²', w: 18, desc: 'Porcelanato réplica de madeira.' },
    { name: 'Cerâmica Esmaltada Branca 30x60cm - Incepa', sku: 'CER-ESM-BRA-60-INC', cat: 'pisos-e-revestimentos', sub: 'ceramica-esmaltada', price: 34.90, orig: null, u: 'm²', w: 12, desc: 'Revestimento de parede branco liso.' },
    { name: 'Rejunte Acetinado Branco - Quartzolit 5kg', sku: 'REJ-ACE-BRA-QZL-5', cat: 'pisos-e-revestimentos', sub: 'rejuntes', price: 18.90, orig: null, u: 'un', w: 5, desc: 'Rejunte cimentício.' },
    { name: 'Rejunte Epóxi Cinza Outono - Weber 1kg', sku: 'REJ-EPO-CIN-WBR-1', cat: 'pisos-e-revestimentos', sub: 'rejuntes', price: 45.90, orig: null, u: 'un', w: 1, desc: 'Rejunte epóxi impermeável.' },

    // --- HIDRAULICA ---
    { name: 'Tubo PVC Esgoto 100mm (4") - Tigre - 6m', sku: 'TUB-ESG-100-TIG-6', cat: 'hidraulica', sub: 'tubos-pvc-esgoto', price: 45.90, orig: null, u: 'barra', w: null, desc: 'Tubo esgoto primário.' },
    { name: 'Tubo PVC Esgoto 50mm (2") - Tigre - 6m', sku: 'TUB-ESG-50-TIG-6', cat: 'hidraulica', sub: 'tubos-pvc-esgoto', price: 24.90, orig: null, u: 'barra', w: null, desc: 'Tubo esgoto secundário.' },
    { name: 'Tubo PVC Esgoto 150mm (6") - Amanco - 6m', sku: 'TUB-ESG-150-AMA-6', cat: 'hidraulica', sub: 'tubos-pvc-esgoto', price: 68.00, orig: null, u: 'barra', w: null, desc: 'Tubo esgoto.' },
    { name: 'Tubo Soldável Água Fria 25mm (3/4") - Tigre - 6m', sku: 'TUB-AGU-25-TIG-6', cat: 'hidraulica', sub: 'tubos-pvc-agua-fria', price: 19.90, orig: null, u: 'barra', w: null, desc: 'Tubo marrom de água.' },
    { name: 'Tubo Soldável Água Fria 50mm (1.1/2") - Tigre - 6m', sku: 'TUB-AGU-50-TIG-6', cat: 'hidraulica', sub: 'tubos-pvc-agua-fria', price: 49.90, orig: null, u: 'barra', w: null, desc: 'Tubo marrom de água grosso.' },
    { name: 'Tubo CPVC Aquatherm 22mm - Tigre - 3m', sku: 'TUB-AQU-22-TIG-3', cat: 'hidraulica', sub: 'tubos-cpvc', price: 34.90, orig: null, u: 'barra', w: null, desc: 'Tubo água quente.' },
    { name: 'Joelho 90° Soldável 25mm - Tigre', sku: 'JOE-90-25-TIG', cat: 'hidraulica', sub: 'conexoes-pvc', price: 1.50, orig: null, u: 'un', w: null, desc: 'Joelho marrom.' },
    { name: 'Te Soldável 25mm - Tigre', sku: 'TE-25-TIG', cat: 'hidraulica', sub: 'conexoes-pvc', price: 2.10, orig: null, u: 'un', w: null, desc: 'Conexão Te.' },
    { name: 'Caixa d\'Água Polietileno 500L - Fortlev', sku: 'CAX-500-FOR', cat: 'hidraulica', sub: 'caixas-dagua', price: 189.0, orig: 219.0, u: 'un', w: null, desc: 'Caixa 500 litros.' },
    { name: 'Caixa d\'Água Polietileno 1000L - Fortlev', sku: 'CAX-1000-FOR', cat: 'hidraulica', sub: 'caixas-dagua', price: 329.0, orig: 359.0, u: 'un', w: null, desc: 'Caixa 1000 litros.' },
    { name: 'Caixa d\'Água Polietileno 1000L - Tigre', sku: 'CAX-1000-TIG', cat: 'hidraulica', sub: 'caixas-dagua', price: 359.0, orig: null, u: 'un', w: null, desc: 'Caixa d\'agua Tigre.' },
    { name: 'Registro de Gaveta 3/4" Bruto - Deca', sku: 'REG-GAV-34-DEC', cat: 'hidraulica', sub: 'torneiras-registros', price: 45.00, orig: null, u: 'un', w: null, desc: 'Registro geral.' },
    { name: 'Registro de Pressão 3/4" - Deca', sku: 'REG-PRE-34-DEC', cat: 'hidraulica', sub: 'torneiras-registros', price: 55.00, orig: null, u: 'un', w: null, desc: 'Registro chuveiro.' },

    // --- ELÉTRICA ---
    { name: 'Cabo Flexível 2,5mm² Vermelho - Rolo 100m - Sil', sku: 'CAB-FLX-25-VER-SIL', cat: 'eletrica', sub: 'fios-cabos', price: 159.0, orig: 180.0, u: 'rolo', w: 3, desc: 'Cabo para tomadas comuns.' },
    { name: 'Cabo Flexível 2,5mm² Azul - Rolo 100m - Sil', sku: 'CAB-FLX-25-AZU-SIL', cat: 'eletrica', sub: 'fios-cabos', price: 159.0, orig: 180.0, u: 'rolo', w: 3, desc: 'Cabo para tomadas comuns neutro.' },
    { name: 'Cabo Flexível 4,0mm² Preto - Rolo 100m - Sil', sku: 'CAB-FLX-40-PRE-SIL', cat: 'eletrica', sub: 'fios-cabos', price: 259.0, orig: null, u: 'rolo', w: 5, desc: 'Cabo para ar condicionado.' },
    { name: 'Cabo Flexível 6,0mm² Verde - Rolo 100m - Sil', sku: 'CAB-FLX-60-VER-SIL', cat: 'eletrica', sub: 'fios-cabos', price: 389.0, orig: null, u: 'rolo', w: 7, desc: 'Cabo de aterramento chuveiro.' },
    { name: 'Disjuntor Bipolar DIN 20A - Siemens', sku: 'DIS-BIP-20-SIE', cat: 'eletrica', sub: 'disjuntores', price: 35.00, orig: null, u: 'un', w: null, desc: 'Disjuntor termomagnético.' },
    { name: 'Disjuntor Bipolar DIN 40A - Siemens', sku: 'DIS-BIP-40-SIE', cat: 'eletrica', sub: 'disjuntores', price: 38.00, orig: null, u: 'un', w: null, desc: 'Disjuntor geral chuveiro.' },
    { name: 'Disjuntor Monopolar DIN 10A - Weg', sku: 'DIS-MON-10-WEG', cat: 'eletrica', sub: 'disjuntores', price: 12.00, orig: null, u: 'un', w: null, desc: 'Disjuntor iluminação.' },
    { name: 'Tomada Dupla 10A Branca - Tramontina', sku: 'TOM-DUP-10-TRA', cat: 'eletrica', sub: 'interruptores-tomadas', price: 15.90, orig: null, u: 'un', w: null, desc: 'Placa e tomada dupla.' },
    { name: 'Interruptor Simples + Tomada 10A - Tramontina', sku: 'INT-TOM-10-TRA', cat: 'eletrica', sub: 'interruptores-tomadas', price: 18.90, orig: null, u: 'un', w: null, desc: 'Conjunto placa interruptor.' },
    { name: 'Quadro de Distribuição 12/16 DIN - Tigre', sku: 'QUA-DIS-16-TIG', cat: 'eletrica', sub: 'quadros-distribuicao', price: 89.00, orig: null, u: 'un', w: null, desc: 'Quadro de luz.' },
    { name: 'Eletroduto Corrugado Amarelo 25mm - Rolo 50m - Tigre', sku: 'ELE-COR-25-TIG-50', cat: 'eletrica', sub: 'eletrodutos', price: 59.00, orig: 70.0, u: 'rolo', w: null, desc: 'Conduíte parede flexível.' },
    { name: 'Eletroduto Corrugado Laranja Reforçado 25mm - 50m - Tigre', sku: 'ELE-COR-LAR-25-TIG-50', cat: 'eletrica', sub: 'eletrodutos', price: 89.00, orig: null, u: 'rolo', w: null, desc: 'Conduíte laje.' },

    // --- DRYWALL ---
    { name: 'Chapa Drywall Standard (ST) 1,20x1,80m - Placo', sku: 'CHA-DRY-ST-180-PLA', cat: 'drywall-e-forro', sub: 'chapas-drywall', price: 39.90, orig: 45.0, u: 'un', w: 18, desc: 'Placa gesso acartonado Branca.' },
    { name: 'Chapa Drywall Umidade (RU) 1,20x1,80m - Placo', sku: 'CHA-DRY-RU-180-PLA', cat: 'drywall-e-forro', sub: 'chapas-drywall', price: 49.90, orig: null, u: 'un', w: 18, desc: 'Placa gesso Verde para banheiros.' },
    { name: 'Perfil Montante 70mm - Drywall - 3m', sku: 'PER-MON-70-3M', cat: 'drywall-e-forro', sub: 'perfis-metalicos', price: 15.90, orig: null, u: 'barra', w: 2, desc: 'Montante aço galvanizado.' },
    { name: 'Perfil Guia 70mm - Drywall - 3m', sku: 'PER-GUI-70-3M', cat: 'drywall-e-forro', sub: 'perfis-metalicos', price: 12.90, orig: null, u: 'barra', w: 1.5, desc: 'Guia aço galvanizado.' },
    { name: 'Fita Telada Drywall 90m - Placo', sku: 'FIT-TEL-90-PLA', cat: 'drywall-e-forro', sub: 'massas-fitas-drywall', price: 29.00, orig: null, u: 'un', w: null, desc: 'Fita malha de vidro.' },
    { name: 'Massa para Drywall - Balde 28kg - Placo', sku: 'MAS-DRY-28-PLA', cat: 'drywall-e-forro', sub: 'massas-fitas-drywall', price: 89.00, orig: null, u: 'un', w: 28, desc: 'Massa tratamento de juntas.' },
    { name: 'Forro PVC Liso Branco 20cm x 6m', sku: 'FOR-PVC-LIS-6M', cat: 'drywall-e-forro', sub: 'forro-pvc', price: 24.90, orig: null, u: 'un', w: null, desc: 'Régua de forro de PVC.' },

    // --- TINTAS E IMPERMEABILIZANTES ---
    { name: 'Tinta Acrílica Fosca Branco Neve 18L - Coral', sku: 'TIN-ACR-FOS-BRA-COR-18', cat: 'tintas-e-impermeabilizantes', sub: 'tintas-acrilicas', price: 219.0, orig: 249.0, u: 'un', w: 20, desc: 'Lata 18 litros Rende Muito.' },
    { name: 'Tinta Acrílica Fosca Branco Gelo 18L - Suvinil', sku: 'TIN-ACR-FOS-GEL-SUV-18', cat: 'tintas-e-impermeabilizantes', sub: 'tintas-acrilicas', price: 289.0, orig: 320.0, u: 'un', w: 20, desc: 'Linha Premium Suvinil.' },
    { name: 'Massa Corrida PVA Interior 25kg - Coral', sku: 'MAS-COR-PVA-COR-25', cat: 'tintas-e-impermeabilizantes', sub: 'massas-corridas', price: 49.90, orig: 55.0, u: 'un', w: 25, desc: 'Lata/Saco de massa corrida PVA.' },
    { name: 'Massa Acrílica Exterior 25kg - Suvinil', sku: 'MAS-ACR-EXT-SUV-25', cat: 'tintas-e-impermeabilizantes', sub: 'massas-corridas', price: 89.00, orig: null, u: 'un', w: 25, desc: 'Massa para fachadas e áreas úmidas.' },
    { name: 'Manta Líquida Branca 18kg - Vedacit', sku: 'MAN-LIQ-BRA-VED-18', cat: 'tintas-e-impermeabilizantes', sub: 'impermeabilizantes', price: 289.0, orig: 320.0, u: 'un', w: 18, desc: 'Manta líquida elástica telhados e lajes.' },
    { name: 'Manta Líquida Bautech 12kg', sku: 'MAN-LIQ-BAU-12', cat: 'tintas-e-impermeabilizantes', sub: 'impermeabilizantes', price: 189.0, orig: null, u: 'un', w: 12, desc: 'Impermeabilizante Bautech.' },
    { name: 'Vedacit Aditivo Impermeabilizante 18L', sku: 'VED-ADI-18', cat: 'tintas-e-impermeabilizantes', sub: 'impermeabilizantes', price: 149.0, orig: null, u: 'un', w: 18, desc: 'Aditivo para concreto e argamassa.' },
    { name: 'Bianco Adesivo Chapisco 18L - Vedacit', sku: 'BIA-ADE-18-VED', cat: 'tintas-e-impermeabilizantes', sub: 'impermeabilizantes', price: 289.0, orig: null, u: 'un', w: 18, desc: 'Resina para chapisco e argamassa.' },
    { name: 'Rolo de Lã Antigota 23cm - Atlas', sku: 'ROL-LA-ANT-23-ATL', cat: 'tintas-e-impermeabilizantes', sub: 'acessorios-pintura', price: 24.90, orig: null, u: 'un', w: null, desc: 'Rolo de pintura profissional.' },

    // --- FERRAMENTAS ---
    { name: 'Furadeira de Impacto 1/2" 650W 110V - Bosch', sku: 'FUR-IMP-650-BOS', cat: 'ferramentas-e-epi', sub: 'ferramentas-eletricas', price: 289.0, orig: 350.0, u: 'un', w: 2, desc: 'Furadeira com impacto reversível.' },
    { name: 'Esmerilhadeira Angular 4.1/2" 850W 110V - Makita', sku: 'ESM-ANG-850-MAK', cat: 'ferramentas-e-epi', sub: 'ferramentas-eletricas', price: 349.0, orig: 399.0, u: 'un', w: 2, desc: 'Esmerilhadeira profissional Makita.' },
    { name: 'Betoneira 400L Motor 2CV Monofásica - CSM', sku: 'BET-400-2CV-CSM', cat: 'ferramentas-e-epi', sub: 'betoneiras-guinchos', price: 1890.0, orig: 2100.0, u: 'un', w: 150, desc: 'Betoneira elétrica.' },
    { name: 'Carrinho de Mão 60L - Tramontina', sku: 'CAR-MAO-60-TRA', cat: 'ferramentas-e-epi', sub: 'ferramentas-manuais', price: 189.0, orig: null, u: 'un', w: null, desc: 'Carrinho de pedreiro metálico.' },
    { name: 'Enxada Larga com Cabo 1,3m - Tramontina', sku: 'ENX-LAR-CAB-TRA', cat: 'ferramentas-e-epi', sub: 'ferramentas-manuais', price: 45.00, orig: null, u: 'un', w: null, desc: 'Enxada em aço.' },
    { name: 'Pá de Bico com Cabo - Tramontina', sku: 'PA-BIC-CAB-TRA', cat: 'ferramentas-e-epi', sub: 'ferramentas-manuais', price: 38.00, orig: null, u: 'un', w: null, desc: 'Pá aço Tramontina.' },
    { name: 'Capacete de Segurança Classe A Branco - Plastcor', sku: 'CAP-SEG-BRA-PLA', cat: 'ferramentas-e-epi', sub: 'epi-seguranca', price: 14.90, orig: null, u: 'un', w: null, desc: 'Capacete padrão.' },
    { name: 'Bota de Borracha PVC Cano Curto 40', sku: 'BOT-PVC-CUR-40', cat: 'ferramentas-e-epi', sub: 'epi-seguranca', price: 35.00, orig: null, u: 'par', w: null, desc: 'Bota preta.' },

    // --- AÇO ---
    { name: 'Vergalhão CA-50 10,0mm (3/8") - Barra 12m', sku: 'VER-CA50-10-12', cat: 'aco-e-ferragens', sub: 'vergalhoes', price: 89.0, orig: 95.0, u: 'barra', w: 9.5, desc: 'Aço nervurado para pilares e vigas.' },
    { name: 'Vergalhão CA-50 8,0mm (5/16") - Barra 12m', sku: 'VER-CA50-8-12', cat: 'aco-e-ferragens', sub: 'vergalhoes', price: 59.0, orig: 65.0, u: 'barra', w: 6.0, desc: 'Aço para lajes e sapatas.' },
    { name: 'Vergalhão CA-60 5,0mm - Barra 12m', sku: 'VER-CA60-5-12', cat: 'aco-e-ferragens', sub: 'vergalhoes', price: 28.5, orig: null, u: 'barra', w: 2.3, desc: 'Fio de aço para estribos.' },
    { name: 'Tela Soldada Q-92 (10x10cm) Fio 4,2mm - 2,45x6m', sku: 'TEL-SOL-Q92', cat: 'aco-e-ferragens', sub: 'telas-arames', price: 145.0, orig: null, u: 'un', w: 14, desc: 'Malha pop para pisos.' },
    { name: 'Arame Recozido Liso 18 BWG - Rolo 1kg', sku: 'ARA-REC-18-1KG', cat: 'aco-e-ferragens', sub: 'telas-arames', price: 12.90, orig: null, u: 'un', w: 1, desc: 'Arame amarração.' },
    { name: 'Prego 18x27 sem Cabeça - 1kg - Gerdau', sku: 'PRE-18X27-SC-GER', cat: 'aco-e-ferragens', sub: 'pregos-parafusos', price: 18.90, orig: null, u: 'un', w: 1, desc: 'Prego marcenaria.' },
    { name: 'Prego 18x27 com Cabeça - 1kg - Gerdau', sku: 'PRE-18X27-CC-GER', cat: 'aco-e-ferragens', sub: 'pregos-parafusos', price: 17.90, orig: null, u: 'un', w: 1, desc: 'Prego caixaria.' },

    // --- MADEIRAS E TELHAS ---
    { name: 'Telha Fibrocimento Ondulada 2,44x1,10m 5mm - Brasilit', sku: 'TEL-FIB-244-5-BRA', cat: 'madeiras-e-telhas', sub: 'telhas-fibrocimento', price: 39.90, orig: 45.0, u: 'un', w: null, desc: 'Telha Brasilit sem amianto.' },
    { name: 'Telha Fibrocimento Ondulada 1,83x1,10m 5mm - Brasilit', sku: 'TEL-FIB-183-5-BRA', cat: 'madeiras-e-telhas', sub: 'telhas-fibrocimento', price: 29.90, orig: null, u: 'un', w: null, desc: 'Telha Brasilit média.' },
    { name: 'Telha Cerâmica Portuguesa Natural', sku: 'TEL-CER-POR-NAT', cat: 'madeiras-e-telhas', sub: 'telhas-ceramicas', price: 1.80, orig: null, u: 'un', w: null, desc: 'Milheiro rendimento 16p/m2.' },
    { name: 'Caibro de Madeira Mista 5x5cm - Metro Linear', sku: 'CAI-MAD-MIS-5X5', cat: 'madeiras-e-telhas', sub: 'madeiras-telhado', price: 8.50, orig: null, u: 'm', w: null, desc: 'Caibro aparelhado.' },
    { name: 'Ripa de Madeira Mista 1x5cm - Metro Linear', sku: 'RIP-MAD-MIS-1X5', cat: 'madeiras-e-telhas', sub: 'madeiras-telhado', price: 3.50, orig: null, u: 'm', w: null, desc: 'Ripa para telha.' },
    { name: 'Chapa de Madeirite Resinado 1,10x2,20m 10mm', sku: 'CHA-MAD-RES-10', cat: 'madeiras-e-telhas', sub: 'chapas-madeirite', price: 49.00, orig: null, u: 'un', w: null, desc: 'Madeirite para formas.' },
    { name: 'Chapa de Madeirite Plastificado 1,10x2,20m 12mm', sku: 'CHA-MAD-PLA-12', cat: 'madeiras-e-telhas', sub: 'chapas-madeirite', price: 89.00, orig: null, u: 'un', w: null, desc: 'Madeirite acabamento liso.' },
  ]

  const products = productsData.map(p => {
    // Generate a placeholder image to guarantee there's always a photo!
    // We encode the product name so the placeholder has text
    const text = encodeURIComponent(p.name)
    const imgUrl = `https://placehold.co/800x800/eeeeee/666666/png?text=${text}&font=Montserrat`

    return {
      id: crypto.randomUUID(),
      name: p.name,
      slug: p.sku.toLowerCase(),
      sku: p.sku,
      description: p.desc,
      price: p.price,
      original_price: p.orig,
      category_id: catMap[p.cat],
      subcategory_id: subMap[p.sub],
      unit: p.u,
      weight: p.w,
      stock: 500,
      active: true,
      featured: p.orig != null,
      is_discount: p.orig != null,
      is_new: false,
      image_url: imgUrl, // APLICA PLACEHOLDER INTELIGENTE
    }
  })

  const batchSize = 20
  let totalInserted = 0
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    r = await supabase.from('products').insert(batch)
    if (r.error) {
      console.error(`  ERROR products batch ${i/batchSize + 1}:`, r.error.message)
      process.exit(1)
    }
    totalInserted += batch.length
    console.log(`  ✓ Lote ${Math.ceil((i+1)/batchSize)}: ${totalInserted}/${products.length}`)
  }

  console.log('\n━━━ RESUMO FINAL ━━━')
  console.log(`  ✓ Categorias:    ${cats.length}`)
  console.log(`  ✓ Subcategorias: ${subs.length}`)
  console.log(`  ✓ Produtos:      ${totalInserted}`)
  console.log('\n✅ Super Catálogo reconstruído com sucesso! Placeholders atrelados.')
}

run().catch(err => {
  console.error('ERRO CRÍTICO:', err)
  process.exit(1)
})
