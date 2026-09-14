async function s(url){
  const html=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text());
  console.log('len',html.length);
  const t=(html.match(/<meta property="og:title" content="([^"]+)"/)||[])[1];
  console.log(t);
}
s('https://www.333obra.com.br/cimento-cpiii-40-votoran-50-kg.html').catch(e=>console.log(e));
