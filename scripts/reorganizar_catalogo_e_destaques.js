const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/)[1];
const key = (env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/) || env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/))[1];
const supabase = createClient(url, key);

const CAT_CIMENTO = 'c0134152-de0a-42f7-bb87-dd9ec8588983'; // cimentos
const CAT_ACO = '914576a6-f187-4f97-83e1-dd7e0c38dd1b'; // aco-e-ferragens
const CAT_TINTA = '5564e59c-c674-4d39-a93e-ba1e8d940627'; // tintas-e-pintura
const CAT_ARGAMASSA = '6df9b914-06d0-484a-9b0c-c2d9192fcfa9'; // argamassas

async function run() {
  console.log('--- 1. REATRIBUINDO PRODUTOS DE AÇO PARA aco-e-ferragens ---');
  // Buscar produtos com termos de aço / gerdau / estribo / tela de aço / prego
  const { data: acoProds } = await supabase
    .from('products')
    .select('id, name')
    .or('name.ilike.%gerdau%,name.ilike.%estribo%,name.ilike.%tela de aço%,name.ilike.%prego%,name.ilike.%arame%');

  if (acoProds && acoProds.length > 0) {
    const acoIds = acoProds.map(p => p.id);
    const { error: errAco } = await supabase
      .from('products')
      .update({ category_id: CAT_ACO })
      .in('id', acoIds);
    console.log(`Reatribuídos ${acoIds.length} produtos para Aço e Ferragens (erro: ${errAco ? errAco.message : 'nenhum'})`);
  }

  console.log('--- 2. REATRIBUINDO PRODUTOS DE PINTURA PARA tintas-e-pintura ---');
  // Buscar produtos com termos de pintura / coral / suvinil / rolo pintura / trincha
  const { data: tintaProds } = await supabase
    .from('products')
    .select('id, name')
    .or('name.ilike.%coral%,name.ilike.%suvinil%,name.ilike.%tinta%,name.ilike.%rolo%,name.ilike.%trincha%,name.ilike.%pincel%');

  if (tintaProds && tintaProds.length > 0) {
    const tintaIds = tintaProds.map(p => p.id);
    const { error: errTinta } = await supabase
      .from('products')
      .update({ category_id: CAT_TINTA })
      .in('id', tintaIds);
    console.log(`Reatribuídos ${tintaIds.length} produtos para Tintas e Pintura (erro: ${errTinta ? errTinta.message : 'nenhum'})`);
  }

  console.log('--- 3. ADICIONANDO PRODUTOS CARRO-CHEFE DE CIMENTO, TINTA E AÇO (se não existirem) ---');
  const essentialProducts = [
    {
      name: 'Vergalhão CA-50 Gerdau 3/8" (10mm) Barra 12m',
      slug: 'vergalhao-ca50-gerdau-10mm-barra-12m',
      category_id: CAT_ACO,
      price: 54.90,
      description: 'Vergalhão de aço CA-50 Gerdau com superfície nervurada. Alta aderência ao concreto, ideal para vigas, pilares e sapatas estruturais.',
      images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'],
      active: true,
      featured: true,
      is_new: false,
      is_discount: true,
      stock: 1200
    },
    {
      name: 'Vergalhão CA-50 Gerdau 5/16" (8mm) Barra 12m',
      slug: 'vergalhao-ca50-gerdau-8mm-barra-12m',
      category_id: CAT_ACO,
      price: 38.50,
      description: 'Vergalhão CA-50 8.0mm Gerdau em barra reta de 12 metros. Certificação ABNT NBR 7480 para estruturas de concreto armado.',
      images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'],
      active: true,
      featured: true,
      is_new: false,
      is_discount: false,
      stock: 950
    },
    {
      name: 'Vergalhão CA-50 Gerdau 1/2" (12.5mm) Barra 12m',
      slug: 'vergalhao-ca50-gerdau-12-5mm-barra-12m',
      category_id: CAT_ACO,
      price: 89.90,
      description: 'Vergalhão de alta resistência para estruturas pesadas, fundações e lajes maciças.',
      images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'],
      active: true,
      featured: true,
      is_new: false,
      is_discount: false,
      stock: 600
    },
    {
      name: 'Arame Recozido Gerdau BWG 18 Rolo 1kg',
      slug: 'arame-recozido-gerdau-bwg-18-1kg',
      category_id: CAT_ACO,
      price: 24.50,
      description: 'Arame recozido macio de alta maleabilidade para amarração de ferragens e estribos em armações de concreto.',
      images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
      active: true,
      featured: true,
      is_new: true,
      is_discount: false,
      stock: 1500
    },
    {
      name: 'Tinta Acrílica Fosca Rende Muito Branco Neve 18L - Coral',
      slug: 'tinta-acrilica-coral-rende-muito-branco-18l',
      category_id: CAT_TINTA,
      price: 349.90,
      description: 'Tinta acrílica standard de alto rendimento. Diluição com até 80% de água, máxima cobertura e acabamento fosco aveludado.',
      images: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop&q=80'],
      active: true,
      featured: true,
      is_new: true,
      is_discount: true,
      stock: 350
    },
    {
      name: 'Tinta Acrílica Fosco Completo Branco 18L - Suvinil',
      slug: 'tinta-acrilica-suvinil-fosco-completo-branco-18l',
      category_id: CAT_TINTA,
      price: 489.00,
      description: 'Tinta Premium Suvinil Fosco Completo. Disfarça pequenas imperfeições da parede, alta lavabilidade e sem cheiro após aplicação.',
      images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80'],
      active: true,
      featured: true,
      is_new: false,
      is_discount: true,
      stock: 280
    },
    {
      name: 'Massa Corrida PVA Balde 25kg - Suvinil',
      slug: 'massa-corrida-pva-suvinil-25kg',
      category_id: CAT_TINTA,
      price: 94.90,
      description: 'Massa corrida para nivelamento e correção de paredes internas. Fácil de lixar e excelente aderência.',
      images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80'],
      active: true,
      featured: true,
      is_new: false,
      is_discount: false,
      stock: 400
    },
    {
      name: 'Cimento Votoran Todas as Obras CP II-F-32 50kg',
      slug: 'cimento-votoran-todas-as-obras-cp2-50kg',
      category_id: CAT_CIMENTO,
      price: 36.90,
      description: 'Cimento Portland composto com filer, versátil para fundações, pilares, vigas, lajes, rebocos e contrapisos.',
      images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'],
      active: true,
      featured: true,
      is_new: false,
      is_discount: true,
      stock: 5000
    },
    {
      name: 'Cimento Montes Claros CP II-E-32 50kg',
      slug: 'cimento-montes-claros-cp2-50kg',
      category_id: CAT_CIMENTO,
      price: 34.50,
      description: 'Cimento de alta performance para concretos de resistência superior e obras de grande porte.',
      images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'],
      active: true,
      featured: true,
      is_new: false,
      is_discount: true,
      stock: 4000
    }
  ];

  for (const prod of essentialProducts) {
    const { data: exists } = await supabase.from('products').select('id').eq('slug', prod.slug).single();
    if (!exists) {
      const { error: insErr } = await supabase.from('products').insert(prod);
      console.log(`Inserido produto: ${prod.name} (erro: ${insErr ? insErr.message : 'ok'})`);
    } else {
      await supabase.from('products').update(prod).eq('id', exists.id);
      console.log(`Atualizado produto existente: ${prod.name}`);
    }
  }

  console.log('--- 4. DEFININDO DESTAQUES (FEATURED) EQUILIBRADOS ---');
  // 1) Limpar todos os featured
  await supabase.from('products').update({ featured: false }).eq('featured', true);

  // 2) Marcar Cimentos como featured (os 8 melhores)
  const { data: cimentosToFeature } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', CAT_CIMENTO)
    .eq('active', true)
    .limit(8);
  if (cimentosToFeature) {
    await supabase.from('products').update({ featured: true }).in('id', cimentosToFeature.map(p => p.id));
    console.log(`Marcados ${cimentosToFeature.length} cimentos como featured`);
  }

  // 3) Marcar Aço como featured (os 8 melhores)
  const { data: acoToFeature } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', CAT_ACO)
    .eq('active', true)
    .limit(8);
  if (acoToFeature) {
    await supabase.from('products').update({ featured: true }).in('id', acoToFeature.map(p => p.id));
    console.log(`Marcados ${acoToFeature.length} produtos de aço como featured`);
  }

  // 4) Marcar Tintas como featured (os 8 melhores)
  const { data: tintaToFeature } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', CAT_TINTA)
    .eq('active', true)
    .limit(8);
  if (tintaToFeature) {
    await supabase.from('products').update({ featured: true }).in('id', tintaToFeature.map(p => p.id));
    console.log(`Marcados ${tintaToFeature.length} produtos de tinta como featured`);
  }

  // 5) Marcar Argamassas como featured (os 4 melhores)
  const { data: argToFeature } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', CAT_ARGAMASSA)
    .eq('active', true)
    .limit(4);
  if (argToFeature) {
    await supabase.from('products').update({ featured: true }).in('id', argToFeature.map(p => p.id));
    console.log(`Marcados ${argToFeature.length} argamassas como featured`);
  }

  console.log('✅ Banco de dados reorganizado com sucesso!');
}

run().catch(console.error);
