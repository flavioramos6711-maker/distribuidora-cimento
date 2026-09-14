const fs=require('fs');
const {createClient}=require('@supabase/supabase-js');
const crypto=require('crypto');
const c=createClient('https://sdafczehznywoeqnfgph.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8');

function slugify(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);}

async function scrape(url){
  try{
    const html=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}, signal:AbortSignal.timeout(8000)}).then(r=>r.text());
    const ogTitle=(html.match(/<meta property="og:title" content="([^"]+)"/)||[])[1]||'';
    let ogImage=(html.match(/<meta property="og:image" content="([^"]+)"/)||[])[1]||'';
    if(ogImage) ogImage=ogImage.replace(/&amp;/g,'&').replace('height=265&width=265&canvas=265:265','width=700&height=700&canvas=700,700').replace('height=265','height=700').replace('width=265','width=700');
    if(!ogImage){
      const m=html.match(/https:\/\/www\.333obra\.com\.br\/media\/catalog\/product[^"'\s]+/);
      if(m) ogImage=m[0].replace(/&amp;/g,'&');
    }
    const ogDesc=(html.match(/<meta property="og:description" content="([^"]+)"/)||[])[1]||html.match(/<meta name="description" content="([^"]+)"/)?.[1]||'';
    const price=(html.match(/<meta property="product:price:amount" content="([^"]+)"/)||[])[1]||'0';
    const sku=(html.match(/"sku"\s*:\s*"([^"]+)"/)||[])[1]||'';
    const brand=(html.match(/"brand"\s*:\s*\{\s*"@type"\s*:\s*"Brand"\s*,\s*"name"\s*:\s*"([^"]+)"/)||[])[1]||'';
    const catsMatch=html.match(/"categories"\s*:\s*\[([^\]]+)\]/);
    let cats=[];
    if(catsMatch){
      try{ cats=JSON.parse('['+catsMatch[1]+']'); }catch(e){ cats=catsMatch[1].split(',').map(s=>s.replace(/"/g,'').trim()); }
    }
    // filtra Root Catalog etc
    const filtered=cats.filter(x=>!['Root Catalog','Default Category','Todos os Produtos'].includes(x));
    // pega categoria e subcategoria
    let catName=filtered[0]||'Cimento';
    let subName=filtered[1]||catName;
    // limpeza
    catName=catName.replace(/Promo.*/, '').trim()||filtered[0];
    if(!catName) catName='Cimento';
    if(!subName || subName.includes('Promo')) subName=catName;
    const name=ogTitle.replace(/&#x20;/g,' ').replace(/&#x2F;/g,'/').replace(/&#x2013;/g,'-').trim();
    const desc=ogDesc.replace(/&#x20;/g,' ').slice(0,500);
    return {url, name, image:ogImage, desc, price:parseFloat(price)||0, sku:sku.trim()||slugify(name).slice(0,10).toUpperCase(), brand, catName, subName, rawCats:filtered};
  }catch(e){ return {url, error:e.message}; }
}

async function run(){
  // coleta URLs diversas: pega de todos os sitemaps amostrados
  const allUrls=fs.readFileSync('scripts/urls_333obra.txt','utf8').split('\n').filter(Boolean);
  // expande para 400: busca mais do sitemap 1-1 também
  let extra=[];
  try{
    const t1=await fetch('https://www.333obra.com.br/media/333obrasitemap-1-1.xml').then(r=>r.text());
    const urls1=[...t1.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).filter(u=>u.includes('.html')&&u.includes('/p/')).slice(0,50);
    extra=urls1;
  }catch(e){}
  const todo=[...new Set([...allUrls, ...extra])].slice(0,400);
  console.log('Iniciando espelho fiel de',todo.length,'produtos (todas páginas)...');

  const results=[];
  for(let i=0;i<todo.length;i++){
    const r=await scrape(todo[i]);
    if(r.name && r.image && r.price>0){
      results.push(r);
      console.log(`${i+1}/${todo.length} OK ${r.catName} > ${r.subName} | ${r.name.slice(0,35)} R$${r.price}`);
    } else {
      console.log(`${i+1} SKIP ${todo[i].slice(0,60)} -> ${r.error||'sem dados'}`);
    }
    await new Promise(x=>setTimeout(x,250));
  }
  console.log(`\nColetados ${results.length} fiéis`);

  // Agrupa por categoria fiel
  const catSet=new Map();
  for(const r of results){
    if(!catSet.has(r.catName)) catSet.set(r.catName, new Set());
    catSet.get(r.catName).add(r.subName);
  }
  console.log('\nCategorias fiéis encontradas:');
  for(const [k,v] of catSet) console.log(`- ${k}: ${[...v].join(', ')}`);

  // Limpa banco
  await c.from('reviews').delete().not('id','is',null);
  await c.from('products').delete().not('id','is',null);
  // Recria categorias/subcategorias fiéis
  await c.from('subcategories').delete().not('id','is',null);
  await c.from('categories').delete().not('id','is',null);

  const catMap=new Map();
  const subMap=new Map();
  let order=1;
  for(const [catName, subs] of catSet){
    const catId=crypto.randomUUID();
    const slug=slugify(catName);
    // imagem real da categoria (usa primeira imagem de produto da categoria)
    const firstProd=results.find(x=>x.catName===catName);
    const catImg=firstProd?firstProd.image:null;
    await c.from('categories').insert({id:catId, name:catName, slug, image_url:catImg, sort_order:order++, active:true});
    catMap.set(catName,catId);
    for(const subName of subs){
      const subId=crypto.randomUUID();
      const subSlug=slugify(subName);
      await c.from('subcategories').insert({id:subId, name:subName, slug:subSlug, category_id:catId, active:true, sort_order:1});
      subMap.set(catName+'|'+subName, subId);
    }
  }
  console.log(`\nCategorias criadas: ${catMap.size}, Subcategorias: ${subMap.size}`);

  // Insere produtos
  let ins=0;
  for(const p of results){
    const catId=catMap.get(p.catName);
    const subId=subMap.get(p.catName+'|'+p.subName)||[...subMap.values()][0];
    const id=crypto.randomUUID();
    const slug=slugify(p.name)+'-'+p.sku.toLowerCase().replace(/[^a-z0-9]/g,'');
    const {error}=await c.from('products').insert({
      id, name:p.name, slug, sku:p.sku, description:p.desc, price:p.price, original_price:(p.price*1.18).toFixed(2),
      category_id:catId, subcategory_id:subId, image_url:p.image, images:[p.image], unit:'un', weight:(2+Math.random()*48).toFixed(2),
      stock: Math.floor(20+Math.random()*800), active:true, featured:Math.random()<0.2, is_new:Math.random()<0.1, is_discount:true
    });
    if(!error){
      ins++;
      const revs=[
        {product_id:id, customer_name:'João Silva', rating:5, comment:'Chegou rápido e bem embalado!', approved:true},
        {product_id:id, customer_name:'Maria Oliveira', rating:4, comment:'Qualidade excelente, recomendo.', approved:true},
      ];
      await c.from('reviews').insert(revs);
    }
  }
  console.log(`\n✅ ESPELHO FIEL COMPLETO: ${ins} produtos, ${catMap.size} categorias, ${subMap.size} subcategorias`);
}
run().catch(e=>console.error(e));
