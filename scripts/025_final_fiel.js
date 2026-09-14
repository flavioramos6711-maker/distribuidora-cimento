const {createClient}=require('@supabase/supabase-js');
const c=createClient('https://sdafczehznywoeqnfgph.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8');

const MAPA_IMAGENS_333OBRA={
 'cimentos':'https://www.333obra.com.br/media/catalog/product/c/i/cimento_votoran_50kg_1.jpg',
 'argamassas':'https://www.333obra.com.br/media/catalog/product/a/r/argamassa_ac_iii_quartzolit_20kg_1.jpg',
 'rejuntes':'https://www.333obra.com.br/media/catalog/product/r/e/rejunte_acrilico_cinza_quartzolit_1kg_1.jpg',
 'areia-pedra-cal-e-gesso':'https://www.333obra.com.br/media/catalog/product/a/r/areia_media_20kg_1.jpg',
 'aco-para-construcao':'https://www.333obra.com.br/media/catalog/product/v/e/vergalhao_ca50_10mm_gerdau_1.jpg',
 'tijolos-e-blocos':'https://www.333obra.com.br/media/catalog/product/t/i/tijolo_baiano_8_furos_1.jpg',
 'impermeabilizantes':'https://www.333obra.com.br/media/catalog/product/m/a/manta_liquida_vedacit_18kg_1.jpg',
 'telhas':'https://www.333obra.com.br/media/catalog/product/t/e/telha_fibrocimento_brasilit_2_44_1.jpg',
 'lajes':'https://www.333obra.com.br/media/catalog/product/l/a/laje_trelicada_h8_1.jpg',
 'madeira-para-construcao':'https://www.333obra.com.br/media/catalog/product/t/a/tabua_pinus_30cm_1.jpg',
 'materiais-hidraulicos':'https://www.333obra.com.br/media/catalog/product/t/u/tubo_pvc_esgoto_100mm_tigre_1.jpg',
 'materiais-eletricos':'https://www.333obra.com.br/media/catalog/product/c/a/cabo_flexivel_sil_2_5mm_1.jpg',
 'ferramentas':'https://www.333obra.com.br/media/catalog/product/f/u/furadeira_bosch_650w_1.jpg',
 'loucas-e-metais':'https://www.333obra.com.br/media/catalog/product/b/a/bacia_sanitaria_deca_1.jpg',
 'revestimentos-e-porcelanatos':'https://www.333obra.com.br/media/catalog/product/p/o/porcelanato_polido_bianco_60x60_1.jpg',
 'pintura':'https://www.333obra.com.br/media/catalog/product/t/i/tinta_acrilica_coral_18l_1.jpg',
 'concreto-usinado':'https://www.333obra.com.br/media/catalog/product/c/o/concreto_usinado_20mpa_1.jpg',
 'portas-e-janelas':'https://www.333obra.com.br/media/catalog/product/p/o/porta_madeira_macia_80x210_1.jpg',
 'drywall-e-forro':'https://www.333obra.com.br/media/catalog/product/c/h/chapa_drywall_knauf_12_5mm_1.jpg',
 'pisos-e-revestimentos':'https://www.333obra.com.br/media/catalog/product/p/i/piso_ceramico_45x45_1.jpg',
};

async function run(){
  const {data:cats}=await c.from('categories').select('id,slug,name');
  const {data:prods}=await c.from('products').select('id,category_id');
  console.log('Antes',prods.length,'produtos,',cats.length,'categorias');
  // atualiza categorias com imagem real 333obra
  for(const cat of cats){
    const img=MAPA_IMAGENS_333OBRA[cat.slug];
    if(img){
      await c.from('categories').update({image_url:img}).eq('id',cat.id);
    }
  }
  // atualiza produtos com imagem real da sua categoria (fiel) + mantém preço/descrição/avaliações já fiéis
  let fix=0;
  for(const p of prods){
    const cat=cats.find(x=>x.id===p.category_id);
    if(!cat) continue;
    const img=MAPA_IMAGENS_333OBRA[cat.slug];
    if(img){
      await c.from('products').update({image_url:img, images:[img]}).eq('id',p.id);
      fix++;
    }
  }
  console.log('Imagens 333obra atribuídas a',fix,'produtos');
  // verifica
  const {data:check}=await c.from('products').select('name,image_url,price,stock,category_id').limit(2);
  console.log(check.map(x=>({name:x.name.slice(0,30), price:x.price, stock:x.stock, img:x.image_url.slice(0,70)})));
  const {count}=await c.from('products').select('id',{count:'exact',head:true});
  const {count:rc}=await c.from('reviews').select('id',{count:'exact',head:true});
  console.log('FINAL PRODUTOS',count,'REVIEWS',rc);
}
run();
