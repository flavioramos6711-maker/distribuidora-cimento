const fs=require('fs');
const urls=fs.readFileSync('scripts/urls_333obra.txt','utf8').split('\n').filter(Boolean).slice(0,3);
(async()=>{
 for(const u of urls){
   const html=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text());
   const title=(html.match(/<meta property="og:title" content="([^"]+)"/)||[])[1];
   const img=(html.match(/<meta property="og:image" content="([^"]+)"/)||[])[1];
   const price=(html.match(/<meta property="product:price:amount" content="([^"]+)"/)||[])[1];
   console.log(u, '->', title?.slice(0,40), price, img?.slice(0,80));
 }
})();
