const fs=require('fs');
const {createClient}=require('@supabase/supabase-js');
const c=createClient('https://sdafczehznywoeqnfgph.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8');
const crypto=require('crypto');

function slugify(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);}

async function scrape(url){
  try{
    const html=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text());
    const ogTitle=(html.match(/<meta property="og:title" content="([^"]+)"/)||[])[1]||'';
    const ogImage=(html.match(/<meta property="og:image" content="([^"]+)"/)||[])[1]||'';
    const ogDesc=(html.match(/<meta property="og:description" content="([^"]+)"/)||[])[1]||html.match(/<meta name="description" content="([^"]+)"/)?.[1]||'';
    const price=(html.match(/<meta property="product:price:amount" content="([^"]+)"/)||[])[1]||'0';
    const currency=(html.match(/<meta property="product:price:currency" content="([^"]+)"/)||[])[1]||'BRL';
    const sku=(html.match(/"sku"\s*:\s*"([^"]+)"/)|| html.match(/<div class="value">([^<]+)<\/div>/ )||[])[1]||'';
    const brand=(html.match(/"brand"\s*:\s*\{\s*"@type"\s*:\s*"Brand"\s*,\s*"name"\s*:\s*"([^"]+)"/)||[])[1]||'';
    // clean image: upgrade 265 to 700
    let img=ogImage;
    if(img) img=img.replace('height=265&width=265&canvas=265:265','width=700&height=700&canvas=700,700').replace('height=265','height=700').replace('width=265','width=700');
    // fallback media catalog
    if(!img){
      const m=html.match(/https:\/\/www\.333obra\.com\.br\/media\/catalog\/product[^"']+/);
      if(m) img=m[0];
    }
    return {url, name: ogTitle.replace(/&#x20;/g,' ').trim(), image: img, desc: ogDesc.replace(/&#x20;/g,' ').slice(0,400), price: parseFloat(price)||0, currency, sku: sku.trim()||slugify(ogTitle).slice(0,12).toUpperCase(), brand};
  }catch(e){ return {url, error:e.message}; }
}

const MAP_CAT=[
  {kw:['cimento','cal '], slug:'cimentos'},
  {kw:['argamassa'], slug:'argamassas'},
  {kw:['rejunte'], slug:'rejuntes'},
  {kw:['areia','brita','pedra','pedrisco','gesso'], slug:'areia-pedra-cal-e-gesso'},
  {kw:['vergalhao','tela soldada','arame','trelica','prego','coluna','malha'], slug:'aco-para-construcao'},
  {kw:['tijolo','bloco'], slug:'tijolos-e-blocos'},
  {kw:['impermeabilizante','manta liquida','vedacit'], slug:'impermeabilizantes'},
  {kw:['telha'], slug:'telhas'},
  {kw:['laje'], slug:'lajes'},
  {kw:['madeira','madeirite','caibro','ripa','tabua','chapa'], slug:'madeira-para-construcao'},
  {kw:['tubo','conex','caixa dagua','torneira','ralo','bomba','registro','valvula','hidraul'], slug:'materiais-hidraulicos'},
  {kw:['cabo','disjuntor','tomada','interruptor','quadro','lampada','spot','eletroduto','fio'], slug:'materiais-eletricos'},
  {kw:['furadeira','esmerilhadeira','betoneira','carrinho','enxada','trena','nivel','disco','lamina','serra','ferramenta','compressor','epi'], slug:'ferramentas'},
  {kw:['louca','vaso','pia','chuveiro','bacia'], slug:'loucas-e-metais'},
  {kw:['porcelanato','ceramica','revestimento','pastilha'], slug:'revestimentos-e-porcelanatos'},
  {kw:['tinta','massa corrida','selador','rolo','pincel','lixa'], slug:'pintura'},
  {kw:['concreto usinado'], slug:'concreto-usinado'},
  {kw:['porta','janela'], slug:'portas-e-janelas'},
  {kw:['drywall','gesso acartonado','perfil','forro pvc'], slug:'drywall-e-forro'},
];

async function run(){
  const urls=fs.readFileSync('scripts/urls_333obra.txt','utf8').split('\n').filter(Boolean).slice(0,105);
  console.log('Escapando',urls.length,'produtos reais da 333obra...');
  const results=[];
  for(let i=0;i<urls.length;i++){
    const r=await scrape(urls[i]);
    if(r.name && r.image && r.price>0){
      results.push(r);
      console.log(`${i+1}/${urls.length} OK ${r.name.slice(0,40)} R$${r.price} SKU:${r.sku}`);
    } else {
      console.log(`${i+1} SKIP ${urls[i]} -> ${r.error||'sem dados'}`);
    }
    await new Promise(r=>setTimeout(r,300)); // 300ms delay p/ não bloquear
  }
  console.log(`\nColetados ${results.length} produtos fiéis`);

  // Buscar categorias fiéis já existentes
  const {data:cats}=await c.from('categories').select('*');
  const catMap={}; cats.forEach(x=>catMap[x.slug]=x);
  const {data:subs}=await c.from('subcategories').select('*');
  
  // Limpa produtos/reviews anteriores
  await c.from('reviews').delete().not('id','is',null);
  await c.from('products').delete().not('id','is',null);
  console.log('Banco limpo');

  let inserted=0;
  for(const p of results){
    const n=p.name.toLowerCase();
    let targetSlug='cimentos';
    for(const m of MAP_CAT) if(m.kw.some(k=>n.includes(k))) {targetSlug=m.slug; break;}
    const cat=catMap[targetSlug]||cats[0];
    // pega primeira sub da categoria
    let sub=subs.find(s=>s.category_id===cat.id);
    if(!sub) sub=subs[0];
    const id=crypto.randomUUID();
    const slug=slugify(p.name)+'-'+p.sku.toLowerCase().replace(/[^a-z0-9]/g,'');
    const {error}=await c.from('products').insert({
      id, name:p.name, slug, sku:p.sku, description:p.desc, price:p.price, original_price: p.price*1.18, category_id:cat.id, subcategory_id:sub.id,
      image_url:p.image, images:[p.image], unit:'un', weight: (5+Math.random()*45).toFixed(2), stock: Math.floor(30+Math.random()*800), active:true, featured: Math.random()<0.2, is_new: Math.random()<0.15, is_discount: Math.random()<0.25
    });
    if(error) console.log('insert erro',p.name,error.message);
    else inserted++;
    // reviews 2-4
    const reviews=[];
    for(let i=0;i<2+Math.floor(Math.random()*3);i++){
      reviews.push({product_id:id, customer_name:['João S.','Maria O.','Carlos A.','Ana P.','Roberto M.'][i%5], rating: Math.random()<0.7?5:4, comment:['Excelente!','Chegou rápido','Qualidade top','Recomendo'][i%4], approved:true});
    }
    await c.from('reviews').insert(reviews);
  }
  console.log(`✅ ESPELHO REAL: ${inserted} produtos inseridos com imagens reais 333obra (media/catalog/product)`);
}
run();
