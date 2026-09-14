import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Removendo destaques de itens elétricos (disjuntores, conduítes)...");
  
  // Buscar produtos de elétrica
  const { data: eletrica, error: err1 } = await supabase.from('products')
    .select('id, name')
    .or('name.ilike.%disjuntor%,name.ilike.%conduite%,name.ilike.%conduíte%,name.ilike.%cabo%,name.ilike.%fio%');
    
  if (err1) {
    console.error("Erro ao buscar elétrica:", err1);
  } else if (eletrica && eletrica.length > 0) {
    const ids = eletrica.map(p => p.id);
    await supabase.from('products').update({ featured: false, is_new: false, is_discount: false }).in('id', ids);
    console.log(`✅ Removidos destaques de ${ids.length} produtos elétricos.`);
  }

  console.log("Destacando cimento, argamassa e ferragens...");
  
  // Buscar produtos de cimento e ferragens
  const { data: cimentoFerragem, error: err2 } = await supabase.from('products')
    .select('id, name')
    .or('name.ilike.%cimento%,name.ilike.%argamassa%,name.ilike.%vergalhão%,name.ilike.%vergalhao%,name.ilike.%aço%,name.ilike.%arame%,name.ilike.%malha%,name.ilike.%treliça%,name.ilike.%coluna%');
    
  if (err2) {
    console.error("Erro ao buscar cimento/ferragens:", err2);
  } else if (cimentoFerragem && cimentoFerragem.length > 0) {
    const ids = cimentoFerragem.map(p => p.id);
    
    // Divide em blocos: alguns featured, alguns is_new, alguns is_discount para preencher todas as prateleiras
    const featuredIds = ids.slice(0, 10);
    const newIds = ids.slice(10, 20);
    const discountIds = ids.slice(20, 30);
    
    if(featuredIds.length > 0) await supabase.from('products').update({ featured: true }).in('id', featuredIds);
    if(newIds.length > 0) await supabase.from('products').update({ is_new: true, featured: true }).in('id', newIds);
    if(discountIds.length > 0) await supabase.from('products').update({ is_discount: true }).in('id', discountIds);
    
    // Todos os que sobraram ganham featured
    const remainingIds = ids.slice(30);
    if(remainingIds.length > 0) await supabase.from('products').update({ featured: true }).in('id', remainingIds);

    console.log(`✅ Adicionados destaques para ${ids.length} produtos de cimento e ferragens!`);
  } else {
    console.log("⚠️ Nenhum produto de cimento ou ferragem encontrado no catálogo.");
  }
}

run().catch(console.error);
