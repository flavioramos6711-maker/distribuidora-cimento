const {createClient}=require('@supabase/supabase-js');
const fs=require('fs');
const c=createClient('https://sdafczehznywoeqnfgph.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8');
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
