const {createClient}=require('@supabase/supabase-js');
const c=createClient('https://sdafczehznywoeqnfgph.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8');

const MAP=[
  {kw:['cimento','cal '], slug:'cimentos'},
  {kw:['argamassa'], slug:'argamassas'},
  {kw:['rejunte'], slug:'rejuntes'},
  {kw:['areia','brita','pedrisco'], slug:'areia-pedra-cal-e-gesso'},
  {kw:['vergalhao','tela soldada','arame','trelica','prego','coluna'], slug:'aco-para-construcao'},
  {kw:['tijolo','bloco'], slug:'tijolos-e-blocos'},
  {kw:['impermeabilizante','manta liquida','vedacit','bianco'], slug:'impermeabilizantes'},
  {kw:['telha'], slug:'telhas'},
  {kw:['laje'], slug:'lajes'},
  {kw:['madeira','madeirite','caibro','ripa','tabua'], slug:'madeira-para-construcao'},
  {kw:['tubo pvc','conex','caixa dagua','torneira','ralo','bomba','registro','valvula'], slug:'materiais-hidraulicos'},
  {kw:['cabo flexivel','disjuntor','tomada','interruptor','quadro','lampada','eletroduto','fita isolante'], slug:'materiais-eletricos'},
  {kw:['furadeira','esmerilhadeira','betoneira','carrinho','enxada',' pa ','trena','nivel laser'], slug:'ferramentas'},
  {kw:['louca','vaso','pia','chuveiro'], slug:'loucas-e-metais'},
  {kw:['porcelanato','ceramica esmaltada','pastilha'], slug:'revestimentos-e-porcelanatos'},
  {kw:['tinta acrilica','massa corrida','massa acrilica','selador','rolo','pincel'], slug:'pintura'},
  {kw:['concreto usinado'], slug:'concreto-usinado'},
  {kw:['porta','janela'], slug:'portas-e-janelas'},
  {kw:['drywall','chapa gesso','perfil','forro pvc','fita telada','massa drywall'], slug:'drywall-e-forro'},
  {kw:['piso cimenticio','ladrilho'], slug:'pisos-e-revestimentos'},
];

async function run(){
  const {data:cats}=await c.from('categories').select('id,slug');
  const catMap={}; cats.forEach(x=>catMap[x.slug]=x.id);
  const {data:subs}=await c.from('subcategories').select('id,slug,category_id');
  // também precisa mapear subcategorias? simplifica: usa primeira sub da categoria
  const subByCat={}; subs.forEach(s=>{ if(!subByCat[s.category_id]) subByCat[s.category_id]=s.id; });
  
  const {data:prods}=await c.from('products').select('id,name,category_id');
  let fix=0;
  for(const p of prods){
    const n=p.name.toLowerCase();
    let target=null;
    for(const m of MAP){ if(m.kw.some(k=>n.includes(k))){ target=m.slug; break; } }
    if(!target) target='cimentos';
    const targetId=catMap[target];
    if(targetId && p.category_id!==targetId){
      const newSub=subByCat[targetId];
      await c.from('products').update({category_id:targetId, subcategory_id:newSub}).eq('id',p.id);
      fix++;
    }
  }
  console.log(`✅ ${fix}/${prods.length} produtos reatribuídos a categorias fiéis`);
  // conta por categoria
  for(const cat of cats){
    const {count}=await c.from('products').select('id',{count:'exact',head:true}).eq('category_id',cat.id);
    console.log(`${cat.slug}: ${count} produtos`);
  }
}
run();
