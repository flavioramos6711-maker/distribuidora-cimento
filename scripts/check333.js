fetch('https://www.333obra.com.br/todas-as-categorias/cimentos.html',{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text()).then(t=>{
  require('fs').writeFileSync('C:/Users/Projetos/AppData/Local/Temp/opencode/crawl.html', t.slice(0,120000));
  console.log('len',t.length);
  const hasMedia=t.includes('media/catalog/product');
  console.log('hasMedia',hasMedia);
  const m=t.match(/media\/catalog\/product[^\"']+/g);
  console.log('mediaMatches', m ? m.slice(0,5) : 'none');
  const json=t.match(/"items"\s*:\s*\[/);
  console.log('has items json',!!json);
  // procura product-item
  const prod=t.match(/product-item/g);
  console.log('product-item count', prod?prod.length:'0');
}).catch(e=>console.log(e.message));
