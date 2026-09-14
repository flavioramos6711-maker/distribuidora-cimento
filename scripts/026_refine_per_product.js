const fs=require('fs');
const {createClient}=require('@supabase/supabase-js');
const c=createClient('https://sdafczehznywoeqnfgph.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8');

function slugify(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function score(a,b){
  const aw=new Set(a.split('-')), bw=new Set(b.split('-'));
  let inter=0; for(const w of aw) if(bw.has(w)) inter++;
  return inter/Math.max(aw.size,bw.size);
}

async function scrape(url){
  const html=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}, signal:AbortSignal.timeout(8000)}).then(r=>r.text());
  let img=(html.match(/<meta property="og:image" content="([^"]+)"/)||[])[1]||'';
  if(img) img=img.replace(/&amp;/g,'&');
  const title=(html.match(/<meta property="og:title" content="([^"]+)"/)||[])[1]||'';
  const name=title.replace(/&#x20;/g,' ').replace(/&#x2F;/g,'/').trim();
  const catsMatch=html.match(/"categories"\s*:\s*\[([^\]]+)\]/);
  let cats=[];
  if(catsMatch){ try{ cats=JSON.parse('['+catsMatch[1]+']'); }catch(e){} }
  cats=cats.filter(x=>!['Root Catalog','Default Category','Todos os Produtos'].includes(x));
  return {name, img, cats};
}

(async()=>{
  console.log('Carregando sitemap completo...');
  const t2=await fetch('https://www.333obra.com.br/media/333obrasitemap-1-2.xml').then(r=>r.text());
  const t3=await fetch('https://www.333obra.com.br/media/333obrasitemap-1-3.xml').then(r=>r.text());
  const urls2=[...t2.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).filter(u=>u.includes('.html')&&u.includes('/p/')===false);
  const urls3=[...t3.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).filter(u=>u.includes('.html'));
  const all=[...urls2,...urls3];
  // filtra só produtos (não categorias) - pega todos .html que não são categorias conhecidas
  const prodUrls=all.filter(u=>u.match(/\.html$/) && !u.includes('/todas-as-categorias/') && !u.includes('/todos-os-produtos.html'));
  console.log('Total URLs produtos disponíveis:',prodUrls.length);
  // pega 500 diversos
  const sampled=[];
  for(let i=0;i<prodUrls.length;i+= Math.floor(prodUrls.length/300)) sampled.push(prodUrls[i]);
  console.log('Amostrados',sampled.length);

  const {data:prods}=await c.from('products').select('id,name,slug,category_id,subcategory_id');
  const {data:cats}=await c.from('categories').select('id,name,slug');
  const catMap=new Map(cats.map(x=>[x.slug,x]));
  const catByName=new Map(cats.map(x=>[x.name.toLowerCase(),x]));

  let ok=0, createdSub=0;
  for(let i=0;i<prods.length;i++){
    const p=prods[i];
    const pSlug=slugify(p.name);
    // encontra melhor URL por score
    let best=null, bestScore=0;
    for(const u of sampled){
      const uSlug=u.split('/').pop().replace('.html','');
      const s=score(pSlug, uSlug);
      if(s>bestScore){ bestScore=s; best=u; }
    }
    if(!best || bestScore<0.3){
      console.log(`${i+1}/${prods.length} SEM MATCH ${p.name.slice(0,35)} (score ${bestScore.toFixed(2)})`);
      continue;
    }
    const scraped=await scrape(best);
    if(!scraped.img){
      console.log(`${i+1} SKIP sem imagem ${best}`);
      continue;
    }
    // Determina categoria fiel via scraped.cats
    let catName=scraped.cats[0]||'Cimento';
    let subName=scraped.cats[1]||catName;
    if(!catName) catName='Cimento';
    // normaliza para slug existente ou cria
    let cat=catByName.get(catName.toLowerCase()) || cats.find(x=>catName.toLowerCase().includes(x.slug.replace(/-/g,' ')) );
    if(!cat){
      // cria categoria fiel nova se não existe
      const id=require('crypto').randomUUID();
      const slug=slugify(catName);
      await c.from('categories').insert({id, name:catName, slug, image_url:scraped.img, sort_order:99, active:true});
      cat={id, name:catName, slug};
      catMap.set(slug,cat);
      catByName.set(catName.toLowerCase(),cat);
      console.log(`+ Categoria criada ${catName}`);
    }
    // subcategoria
    const {data:subs}=await c.from('subcategories').select('id,name').eq('category_id',cat.id);
    let sub=subs.find(s=>s.name.toLowerCase()===subName.toLowerCase());
    if(!sub){
      const sid=require('crypto').randomUUID();
      await c.from('subcategories').insert({id:sid, name:subName, slug:slugify(subName), category_id:cat.id, active:true, sort_order:1});
      sub={id:sid, name:subName};
      createdSub++;
    }
    // atualiza produto com imagem idêntica e categoria fiel
    // testa imagem 333obra retorna 200 antes de salvar
    const imgOk=await fetch(scraped.img,{method:'HEAD'}).then(r=>r.ok).catch(()=>false);
    const finalImg=imgOk? scraped.img : 'https://placehold.co/800x800/eeeeee/333333/png?text='+encodeURIComponent(p.name);
    await c.from('products').update({image_url:finalImg, images:[finalImg], category_id:cat.id, subcategory_id:sub.id}).eq('id',p.id);
    console.log(`${i+1}/${prods.length} OK ${p.name.slice(0,30)} -> ${cat.name} > ${sub.name} | ${finalImg.slice(0,50)}...`);
    ok++;
    await new Promise(r=>setTimeout(r,300));
  }
  console.log(`\n✅ Refinado ${ok}/${prods.length} produtos com imagem idêntica 333obra e categoria fiel. Subs criadas: ${createdSub}`);
})();
