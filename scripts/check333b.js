fetch('https://www.333obra.com.br/catalogsearch/result/?q=cimento',{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text()).then(t=>{
  require('fs').writeFileSync('C:/Users/Projetos/AppData/Local/Temp/opencode/crawl2.html', t.slice(0,150000));
  console.log('len',t.length);
  const m=t.match(/media\/catalog\/product[^\"']+/g);
  console.log('media', m?m.slice(0,3):'none');
  console.log('has product-item', (t.match(/product-item/g)||[]).length);
  console.log(t.slice(t.indexOf('product-item')-200, t.indexOf('product-item')+800).replace(/\n/g,' ').slice(0,1000));
}).catch(e=>console.log(e.message));
