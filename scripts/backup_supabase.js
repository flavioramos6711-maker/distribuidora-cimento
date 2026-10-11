const {createClient}=require('@supabase/supabase-js');
const fs=require('fs');
const c=createClient('https://sdafczehznywoeqnfgph.supabase.co',process.env.SUPABASE_SERVICE_ROLE_KEY || "");
(async()=>{
  let all=[];
  let from=0; const size=1000;
  while(true){
    const {data,error}=await c.from('products').select('*').range(from, from+size-1);
    if(error){ console.log(error.message); break; }
    all=all.concat(data);
    console.log(`produtos ${from}-${from+data.length} total ${all.length}`);
    if(data.length < size) break;
    from+=size;
  }
  const {data:cats}=await c.from('categories').select('*');
  const {data:subs}=await c.from('subcategories').select('*');
  fs.writeFileSync('data/backup_supabase_27927.json', JSON.stringify({cats,subs,products:all}, null, 2));
  console.log('backup final',cats.length,'cats',subs.length,'subs',all.length,'prods');
})();
