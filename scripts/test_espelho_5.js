const fs=require('fs');
const urls=fs.readFileSync('scripts/urls_333obra.txt','utf8').split('\n').filter(Boolean).slice(0,5);
async function scrape(url){
  const html=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text());
  const ogTitle=(html.match(/<meta property="og:title" content="([^"]+)"/)||[])[1]||'';
  const ogImage=(html.match(/<meta property="og:image" content="([^"]+)"/)||[])[1]||'';
  const price=(html.match(/<meta property="product:price:amount" content="([^"]+)"/)||[])[1]||'0';
  console.log(url, '->', ogTitle.slice(0,40), 'price',price, 'img',ogImage.slice(0,60));
  return {ogTitle, ogImage, price};
}
(async()=>{
  for(let i=0;i<urls.length;i++){ await scrape(urls[i]); await new Promise(r=>setTimeout(r,500)); }
})();
