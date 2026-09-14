fetch('https://www.333obra.com.br/cimento-cpii-32-votoran-50-kg.html',{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text()).then(t=>{
  const idx=t.indexOf('breadcrumbs');
  console.log(t.slice(idx-1000, idx+3000).replace(/\n/g,' ').slice(0,3000));
  const m=t.match(/<div class="breadcrumbs[^>]*>[\s\S]{0,2000}/);
  console.log(m?m[0].slice(0,1200):'not found div');
  // procura json com category
  const j=t.match(/"category[^"]*"\s*:\s*"[^"]+"/gi);
  console.log(j?.slice(0,10));
});
