fetch('https://www.333obra.com.br/cimento-cpii-32-votoran-50-kg.html',{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text()).then(t=>{
  const m=t.match(/breadcrumbs[^}]*}/);
  console.log(t.slice(t.indexOf('breadcrumbs')-500, t.indexOf('breadcrumbs')+1500).replace(/\n/g,' ').slice(0,1200));
  const m2=t.match(/"category[^"]*"/gi);
  console.log(m2?.slice(0,10));
  const cat=t.match(/todos-os-produtos\/([^"'\/]+)/);
  console.log(cat);
  require('fs').writeFileSync('C:/Users/Projetos/AppData/Local/Temp/opencode/breadcrumb.html', t.slice(0,80000));
});
