const {createClient}=require('@supabase/supabase-js');
const c=createClient('https://sdafczehznywoeqnfgph.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8');

async function sql(q){
  // usa postgrest via query direta - testa coluna existente
  const {data,error}=await c.from('products').select('sku,weight,images').limit(1);
  if(error) console.log('select check erro',error.message);
  else console.log('colunas check:', Object.keys(data[0]||{}));
  // tenta add via ALTER usando supabase sql endpoint se tiver
  // fallback: testa se consegue inserir com sku
}

async function run(){
  console.log('=== Verificando colunas products ===');
  const {data,error}=await c.from('products').select('sku').limit(1);
  if(error) console.log('sku coluna NAO existe:',error.message);
  else console.log('sku coluna OK');
  const {data:d2,error:e2}=await c.from('products').select('weight').limit(1);
  if(e2) console.log('weight coluna NAO existe:',e2.message);
  else console.log('weight coluna OK');
  const {data:d3,error:e3}=await c.from('products').select('images').limit(1);
  if(e3) console.log('images coluna NAO existe:',e3.message);
  else console.log('images coluna OK');
  
  // Se faltar alguma, tentar criar via inserção teste não funciona - precisa ALTER
  // Vamos tentar via SQL direto usando fetch para pg
  if(error||e2||e3){
    console.log('\n=== Tentando ALTER TABLE via SQL ===');
    const queries=[
      "ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE",
      "ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight NUMERIC(10,2)",
      "ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[]",
      "CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku)",
    ];
    for(const q of queries){
      // supabase não expõe exec_sql por padrão, então vamos ignorar e avisar
      console.log(' ->',q,' (precisa executar manualmente no Dashboard se falhar)');
    }
    console.log('\nSe as colunas não existem, execute scripts/015_adicionar_sku_images.sql no Supabase Dashboard > SQL Editor');
  }
}
run();
