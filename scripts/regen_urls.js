fetch('https://www.333obra.com.br/media/333obrasitemap-1-2.xml').then(r=>r.text()).then(t2=>{
  return fetch('https://www.333obra.com.br/media/333obrasitemap-1-3.xml').then(r=>r.text()).then(t3=>{
    const urls2=[...t2.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).filter(u=>u.includes('.html') && !u.includes('/todas-as-categorias'));
    const urls3=[...t3.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).filter(u=>u.includes('.html') && !u.includes('/todas-as-categorias'));
    const all=[...urls2,...urls3];
    // sampling diverse: pega 1 a cada 150 + inclui cimento manualmente
    const sampled=[];
    for(let i=0;i<all.length;i+=180) sampled.push(all[i]);
    // adiciona cimentos conhecidos
    const cimentos=[
      'https://www.333obra.com.br/cimento-cpii-32-votoran-50-kg.html',
      'https://www.333obra.com.br/cimento-cpiii-40-votoran-50-kg.html',
      'https://www.333obra.com.br/cimento-votoran-cpii-25kg-todas-as-obras.html',
      'https://www.333obra.com.br/cimento-50kg-cpii-32-supremo.html'
    ];
    const final=[...cimentos, ...sampled].slice(0,105);
    require('fs').writeFileSync('scripts/urls_333obra.txt', final.join('\n'));
    console.log('gerado',final.length);
    console.log(final.slice(0,5));
  });
});
