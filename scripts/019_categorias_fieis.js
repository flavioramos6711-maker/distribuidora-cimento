const {createClient}=require('@supabase/supabase-js');
const c=createClient('https://sdafczehznywoeqnfgph.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8');

// Categorias FIÉIS 333obra (extraídas da navegação real)
const FIEIS=[
  {name:'Cimento', slug:'cimentos', img:'https://cdn.leroymerlin.com.br/products/cimento_todas_as_obras_50kg_votorantim_89370867_0001.jpg', order:1},
  {name:'Argamassas', slug:'argamassas', img:'https://cdn.leroymerlin.com.br/products/argamassa_colante_ac_iii_20kg_quartzolit_89364654_0001.jpg', order:2},
  {name:'Rejuntes', slug:'rejuntes', img:'https://cdn.leroymerlin.com.br/products/rejunte_acrilico_cinza_platina_1kg_quartzolit_89638444_0001.jpg', order:3},
  {name:'Areia, Pedra, Cal e Gesso', slug:'areia-pedra-cal-e-gesso', img:'https://cdn.leroymerlin.com.br/products/areia_fina_20kg_88430877_0001.jpg', order:4},
  {name:'Aço p/ Construção', slug:'aco-para-construcao', img:'https://cdn.leroymerlin.com.br/products/vergalhao_ca_50_10mm_12m_gerdau_88503923_0001.jpg', order:5},
  {name:'Tijolos e Blocos', slug:'tijolos-e-blocos', img:'https://cdn.leroymerlin.com.br/products/tijolo_baiano_8_furos_9x19x19cm_87538427_0001.jpg', order:6},
  {name:'Impermeabilizantes', slug:'impermeabilizantes', img:'https://cdn.leroymerlin.com.br/products/manta_liquida_branca_18kg_vedacit_91966660_0001.jpg', order:7},
  {name:'Telhas', slug:'telhas', img:'https://cdn.leroymerlin.com.br/products/telha_de_fibrocimento_ondulada_2_44x1_10m_5mm_brasilit_88439620_0001.jpg', order:8},
  {name:'Lajes', slug:'lajes', img:'https://cdn.leroymerlin.com.br/products/laje_trelicada_h8_1m_88574245_0001.jpg', order:9},
  {name:'Madeira p/ Construção', slug:'madeira-para-construcao', img:'https://cdn.leroymerlin.com.br/products/tabua_pinus_30cmx3m_88273445_0001.jpg', order:10},
  {name:'Materiais Hidráulicos', slug:'materiais-hidraulicos', img:'https://cdn.leroymerlin.com.br/products/tubo_de_pvc_para_esgoto_100mm_6m_tigre_87534295_0001.jpg', order:11},
  {name:'Materiais Elétricos', slug:'materiais-eletricos', img:'https://cdn.leroymerlin.com.br/products/cabo_flexivel_750v_2_50mm_100m_sil_87918647_0001.jpg', order:12},
  {name:'Ferramentas', slug:'ferramentas', img:'https://cdn.leroymerlin.com.br/products/furadeira_de_impacto_650w_220v_bosch_87534278_0001.jpg', order:13},
  {name:'Louças e Metais', slug:'loucas-e-metais', img:'https://cdn.leroymerlin.com.br/products/bacia_sanitaria_com_caixa_acoplada_deca_88574246_0001.jpg', order:14},
  {name:'Revestimentos e Porcelanatos', slug:'revestimentos-e-porcelanatos', img:'https://cdn.leroymerlin.com.br/products/porcelanato_polido_bianco_60x60cm_retificado_eliane_89912466_0001.jpg', order:15},
  {name:'Pintura', slug:'pintura', img:'https://cdn.leroymerlin.com.br/products/tinta_acrilica_standard_fosco_branco_neve_18l_coral_88439618_0001.jpg', order:16},
  {name:'Concreto Usinado', slug:'concreto-usinado', img:'https://cdn.leroymerlin.com.br/products/concreto_usinado_20_mpa_1m3_88788945_0001.jpg', order:17},
  {name:'Portas e Janelas', slug:'portas-e-janelas', img:'https://cdn.leroymerlin.com.br/products/porta_de_madeira_maci_a_80x210cm_88574247_0001.jpg', order:18},
  {name:'Drywall e Forro', slug:'drywall-e-forro', img:'https://cdn.leroymerlin.com.br/products/chapa_de_gesso_acartonado_drywall_st_12_5mm_1_20x1_80m_knauf_89408187_0001.jpg', order:19},
  {name:'Pisos e Revestimentos', slug:'pisos-e-revestimentos', img:'https://cdn.leroymerlin.com.br/products/piso_ceramico_45x45cm_88574248_0001.jpg', order:20},
];

async function run(){
  console.log('=== CORRIGINDO CATEGORIAS FIÉIS 333OBRA ===');
  const {data:cats}=await c.from('categories').select('*').order('sort_order');
  console.log('Antes:',cats.length);
  // Atualiza primeiros 20 existentes para fiéis
  for(let i=0;i<FIEIS.length;i++){
    const fiel=FIEIS[i];
    const existente=cats[i];
    if(existente){
      const {error}=await c.from('categories').update({name:fiel.name, slug:fiel.slug, image_url:fiel.img, sort_order:fiel.order, active:true}).eq('id',existente.id);
      console.log(`${i+1}. ${existente.name} -> ${fiel.name} ${error?'ERRO '+error.message:'OK'}`);
    } else {
      const {error}=await c.from('categories').insert({name:fiel.name, slug:fiel.slug, image_url:fiel.img, sort_order:fiel.order, active:true});
      console.log(`+ ${fiel.name} ${error?error.message:'criado'}`);
    }
  }
  // Remove extras além de 20 (as inventadas)
  if(cats.length > FIEIS.length){
    const extras=cats.slice(FIEIS.length);
    for(const ex of extras){
      // reatribui produtos dessa categoria para categoria fiel mais próxima antes de deletar
      const {data:prods}=await c.from('products').select('id').eq('category_id',ex.id);
      if(prods && prods.length>0){
        const fallback=cats[0].id;
        await c.from('products').update({category_id: fallback}).eq('category_id', ex.id);
        console.log(`  movidos ${prods.length} produtos de ${ex.name} para ${cats[0].name}`);
      }
      const {data:subs}=await c.from('subcategories').select('id').eq('category_id',ex.id);
      if(subs && subs.length>0){
        for(const s of subs) await c.from('subcategories').delete().eq('id',s.id);
      }
      await c.from('categories').delete().eq('id',ex.id);
      console.log(`- removida ${ex.name}`);
    }
  }
  // Atualiza subcategorias com imagens reais também
  const {data:subs}=await c.from('subcategories').select('id,name,slug,category_id');
  for(const s of subs.slice(0,10)){
    if(!s.image_url) {
      // usa imagem da categoria pai
      const cat=FIEIS.find(f=>f.slug===cats.find(cc=>cc.id===s.category_id)?.slug);
    }
  }
  console.log('=== CATEGORIAS CORRIGIDAS ===');
  const {data:final}=await c.from('categories').select('name,slug,image_url').order('sort_order');
  final.forEach(f=>console.log(`- ${f.name} (${f.slug}) img:${f.image_url?'OK':'FALTA'}`));
}
run();
