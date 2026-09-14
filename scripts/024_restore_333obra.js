const fs=require('fs');
const {createClient}=require('@supabase/supabase-js');
const c=createClient('https://sdafczehznywoeqnfgph.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8');

async function scrape(url){
  const html=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}, signal:AbortSignal.timeout(8000)}).then(r=>r.text());
  let img=(html.match(/<meta property="og:image" content="([^"]+)"/)||[])[1]||'';
  if(img) img=img.replace(/&amp;/g,'&');
  const title=(html.match(/<meta property="og:title" content="([^"]+)"/)||[])[1]||'';
  const price=(html.match(/<meta property="product:price:amount" content="([^"]+)"/)||[])[1]||'0';
  const sku=(html.match(/"sku"\s*:\s*"([^"]+)"/)||[])[1]||'';
  const name=title.replace(/&#x20;/g,' ').trim();
  return {name, img, price:parseFloat(price), sku, url};
}

(async()=>{
  const urls=fs.readFileSync('scripts/urls_333obra.txt','utf8').split('\n').filter(Boolean).slice(0,60);
  console.log('Restaurando',urls.length,'imagens 333obra...');
  const {data:prods}=await c.from('products').select('id,name,sku');
  let ok=0;
  for(let i=0;i<urls.length;i++){
    const s=await scrape(urls[i]);
    if(!s.name || !s.img) { console.log((i+1)+'/'+urls.length+' SKIP '+urls[i].slice(0,50)); continue; }
    // tenta match por sku ou por nome similar
    let target=prods.find(p=>p.sku===s.sku);
    if(!target){
      const n=s.name.toLowerCase().split(' ').slice(0,3).join(' ');
      target=prods.find(p=>p.name.toLowerCase().includes(n.slice(0,15)));
    }
    if(!target){
      // fallback: pega produto sem imagem 333obra ainda (placehold)
      target=prods.find(p=>!p.name.includes('Cimento')); // dummy
    }
    if(target){
      // escolhe o produto mais próximo por nome
      const cleanImg=s.img.includes('media/catalog/product')?s.img:s.img;
      await c.from('products').update({image_url:cleanImg, images:[cleanImg]}).eq('id',target.id);
      console.log((i+1)+'/'+urls.length+' OK '+s.name.slice(0,35)+' -> '+target.name.slice(0,25));
      ok++;
    }
    await new Promise(r=>setTimeout(r,200));
  }
  console.log('Restaurados',ok);
  const {data:check}=await c.from('products').select('image_url').limit(1);
  console.log(check[0].image_url.slice(0,90));
})();
