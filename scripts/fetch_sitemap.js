async function get(u){
  const t=await fetch(u).then(r=>r.text());
  const urls=[...t.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  console.log(u, 'total urls', urls.length);
  console.log(urls.slice(0,5).join('\n'));
  console.log('---sample loc 100-105---');
  console.log(urls.slice(100,105).join('\n'));
  return urls;
}
(async()=>{
  const a=await get('https://www.333obra.com.br/media/333obrasitemap-1-1.xml');
  const b=await get('https://www.333obra.com.br/media/333obrasitemap-1-2.xml');
  const c=await get('https://www.333obra.com.br/media/333obrasitemap-1-3.xml');
  const all=[...a,...b,...c];
  const prods=all.filter(u=>u.includes('/p/')||u.match(/\.html$/));
  console.log('ALL',all.length,'prods',prods.length);
  require('fs').writeFileSync('C:/Users/Projetos/AppData/Local/Temp/opencode/distribuidora-cimento/scripts/urls_333obra.txt', prods.slice(0,150).join('\n'));
})().catch(e=>console.log(e));
