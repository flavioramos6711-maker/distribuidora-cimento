const {createClient}=require('@supabase/supabase-js');
const c=createClient('https://sdafczehznywoeqnfgph.supabase.co',process.env.SUPABASE_SERVICE_ROLE_KEY || "");

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
