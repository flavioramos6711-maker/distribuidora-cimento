import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// IDs reais das categorias do banco
const CAT_CIMENTOS    = 'c0134152-de0a-42f7-bb87-dd9ec8588983'
const CAT_ARGAMASSAS  = '6df9b914-06d0-484a-9b0c-c2d9192fcfa9'
const CAT_ACO         = '914576a6-f187-4f97-83e1-dd7e0c38dd1b'
const CAT_CAL_GESSO   = 'd1d469b3-7209-46df-8429-224db6efd7ae'

async function run() {
  // 1. Contar produtos por categoria
  for (const [nome, id] of [
    ['Cimentos', CAT_CIMENTOS],
    ['Argamassas', CAT_ARGAMASSAS],
    ['Aço e Ferragens', CAT_ACO],
    ['Cal e Gesso', CAT_CAL_GESSO],
  ]) {
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id)
      .eq('active', true)
    console.log(`  ${nome}: ${count} produtos`)
  }

  // 2. Resetar TODOS os flags
  console.log('\n🔄 Resetando destaques...')
  const { count: total } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('active', true)
  
  // Resetar em lotes de 1000
  let offset = 0
  while (offset < (total ?? 0)) {
    const { data: batch } = await supabase
      .from('products')
      .select('id')
      .eq('active', true)
      .range(offset, offset + 999)
    if (!batch?.length) break
    const ids = batch.map(p => p.id)
    await supabase.from('products')
      .update({ featured: false, is_new: false, is_discount: false })
      .in('id', ids)
    offset += batch.length
    process.stdout.write(`\r  Resetados ${offset}/${total}...`)
  }
  console.log('\n  ✅ Reset completo')

  // 3. CIMENTOS → featured = true (aparece em "O que você precisa?" e Vitrine)
  const { data: cimentos } = await supabase
    .from('products')
    .select('id, name')
    .eq('category_id', CAT_CIMENTOS)
    .eq('active', true)
  
  if (cimentos?.length) {
    const ids = cimentos.map(p => p.id)
    await supabase.from('products').update({ featured: true }).in('id', ids)
    console.log(`✅ ${ids.length} CIMENTOS → featured`)
    console.log('   Ex:', cimentos.slice(0,2).map(p=>p.name))
  } else {
    console.log('⚠️  Nenhum cimento encontrado na categoria!')
  }

  // 4. ARGAMASSAS → featured + is_new (aparece em "Lançamentos")
  const { data: argamassas } = await supabase
    .from('products')
    .select('id, name')
    .eq('category_id', CAT_ARGAMASSAS)
    .eq('active', true)
  
  if (argamassas?.length) {
    const ids = argamassas.map(p => p.id)
    await supabase.from('products').update({ featured: true, is_new: true }).in('id', ids)
    console.log(`✅ ${ids.length} ARGAMASSAS → featured + is_new`)
    console.log('   Ex:', argamassas.slice(0,2).map(p=>p.name))
  } else {
    console.log('⚠️  Nenhuma argamassa encontrada!')
  }

  // 5. AÇO E FERRAGENS → featured + is_discount (aparece em "Ofertas da Semana")
  const { data: aco } = await supabase
    .from('products')
    .select('id, name')
    .eq('category_id', CAT_ACO)
    .eq('active', true)
  
  if (aco?.length) {
    const ids = aco.map(p => p.id)
    await supabase.from('products').update({ featured: true, is_discount: true }).in('id', ids)
    console.log(`✅ ${ids.length} AÇO & FERRAGENS → featured + is_discount`)
    console.log('   Ex:', aco.slice(0,2).map(p=>p.name))
  } else {
    console.log('⚠️  Nenhum produto de aço encontrado!')
  }

  // 6. CAL E GESSO → featured (complementa a vitrine)
  const { data: cal } = await supabase
    .from('products')
    .select('id, name')
    .eq('category_id', CAT_CAL_GESSO)
    .eq('active', true)
  
  if (cal?.length) {
    const ids = cal.map(p => p.id)
    await supabase.from('products').update({ featured: true }).in('id', ids)
    console.log(`✅ ${ids.length} CAL E GESSO → featured`)
  }

  console.log('\n🎉 Vitrine organizada! Recarregue o site.')
}

run().catch(console.error)
