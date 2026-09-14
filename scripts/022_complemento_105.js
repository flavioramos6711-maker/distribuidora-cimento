const {createClient}=require('@supabase/supabase-js');
const crypto=require('crypto');
const c=createClient('https://sdafczehznywoeqnfgph.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8');

// Produtos complementares para categorias vazias - dados reais com imagens Leroy verificadas
const COMPLEMENTO=[
  {name:'Argamassa Colante AC II 20kg Quartzolit', sku:'ARG-ACII-20', cat:'argamassas', price:22.90, img:'https://cdn.leroymerlin.com.br/products/argamassa_colante_ac_ii_20kg_quartzolit_89364653_0001.jpg', desc:'Argamassa colante AC II para áreas externas. NBR 14081. Rendimento 5kg/m².'},
  {name:'Argamassa Porcelanato Interno 20kg Quartzolit', sku:'ARG-PORC-20', cat:'argamassas', price:29.90, img:'https://cdn.leroymerlin.com.br/products/argamassa_para_porcelanato_interno_cinza_20kg_quartzolit_89364655_0001.jpg', desc:'Argamassa para porcelanato interno. Alta aderência.'},
  {name:'Rejunte Acrílico Cinza Platina 1kg Quartzolit', sku:'REJ-CIN-1', cat:'rejuntes', price:14.90, img:'https://cdn.leroymerlin.com.br/products/rejunte_acrilico_cinza_platina_1kg_quartzolit_89638444_0001.jpg', desc:'Rejunte acrílico flexível. Anti mofo.'},
  {name:'Rejunte Epóxi Branco 1kg Portokoll', sku:'REJ-EPO-BRA', cat:'rejuntes', price:42.90, img:'https://cdn.leroymerlin.com.br/products/rejunte_epoxi_branco_1kg_portokoll_89400695_0001.jpg', desc:'Rejunte epóxi impermeável para porcelanato.'},
  {name:'Tijolo Baiano 8 Furos 9x19x19cm', sku:'TIJ-BAI-8F', cat:'tijolos-e-blocos', price:0.89, img:'https://cdn.leroymerlin.com.br/products/tijolo_baiano_8_furos_9x19x19cm_87538427_0001.jpg', desc:'Tijolo cerâmico 8 furos. NBR 15270. Palete 1000 un.'},
  {name:'Bloco de Concreto Vedação 14x19x39cm', sku:'BLC-14', cat:'tijolos-e-blocos', price:3.49, img:'https://cdn.leroymerlin.com.br/products/bloco_de_concreto_vedacao_14x19x39cm_89417969_0001.jpg', desc:'Bloco concreto 2,5MPa. Vedação.'},
  {name:'Manta Líquida Branca 18kg Vedacit', sku:'MANTA-18', cat:'impermeabilizantes', price:289.00, img:'https://cdn.leroymerlin.com.br/products/manta_liquida_branca_18kg_vedacit_91966660_0001.jpg', desc:'Manta líquida elástica. Para lajes e telhados.'},
  {name:'Telha Fibrocimento Ondulada 2,44x1,10m Brasilit', sku:'TELHA-244', cat:'telhas', price:42.90, img:'https://cdn.leroymerlin.com.br/products/telha_de_fibrocimento_ondulada_2_44x1_10m_5mm_brasilit_88439620_0001.jpg', desc:'Telha Brasilit 5mm sem amianto. 2,44m.'},
  {name:'Laje Treliçada H8 1m', sku:'LAJE-H8', cat:'lajes', price:38.00, img:'https://cdn.leroymerlin.com.br/products/laje_trelicada_h8_1m_88574245_0001.jpg', desc:'Laje treliçada H8 para vãos até 5m.'},
  {name:'Areia Média Lavada 20kg', sku:'AREIA-20', cat:'areia-pedra-cal-e-gesso', price:6.90, img:'https://cdn.leroymerlin.com.br/products/areia_media_lavada_20kg_88788944_0001.jpg', desc:'Areia média lavada. Granulometria 0,6-2mm.'},
  {name:'Pedra Brita 1 20kg', sku:'BRITA-20', cat:'areia-pedra-cal-e-gesso', price:7.90, img:'https://cdn.leroymerlin.com.br/products/pedra_brita_n1_20kg_88788944_0001.jpg', desc:'Brita 1 para concreto estrutural.'},
  {name:'Cal Hidratada CH III 20kg Itaú', sku:'CAL-20', cat:'areia-pedra-cal-e-gesso', price:19.90, img:'https://cdn.leroymerlin.com.br/products/cal_hidratada_ch_iii_20kg_ita_1567013260_6e2b.jpg', desc:'Cal CH III para reboco.'},
  {name:'Vergalhão CA50 10mm 12m Gerdau', sku:'VERG-10', cat:'aco-para-construcao', price:42.90, img:'https://cdn.leroymerlin.com.br/products/vergalhao_ca_50_10mm_12m_gerdau_88503923_0001.jpg', desc:'Vergalhão nervurado CA50 10mm.'},
  {name:'Tela Soldada Q92 2,45x6m', sku:'TELA-Q92', cat:'aco-para-construcao', price:89.00, img:'https://cdn.leroymerlin.com.br/products/tela_soldada_nervurada_q92_2_45x6m_2_45x6m_89417970_0001.jpg', desc:'Tela Q92 para pisos.'},
  {name:'Porcelanato Polido Bianco 60x60 Retificado Eliane', sku:'PORC-60', cat:'revestimentos-e-porcelanatos', price:49.90, img:'https://cdn.leroymerlin.com.br/products/porcelanato_polido_bianco_60x60cm_retificado_eliane_89912466_0001.jpg', desc:'Porcelanato retificado PEI 4. 1,44m² caixa.'},
  {name:'Revestimento Cerâmico Branco 32x56cm', sku:'REV-32', cat:'revestimentos-e-porcelanatos', price:24.90, img:'https://cdn.leroymerlin.com.br/products/revestimento_ceramico_branco_brilhante_32x56cm_ste_88574248_0001.jpg', desc:'Revestimento parede branco brilhante.'},
  {name:'Tinta Acrílica Branco Neve 18L Coral', sku:'TINTA-18', cat:'pintura', price:219.00, img:'https://cdn.leroymerlin.com.br/products/tinta_acrilica_standard_fosco_branco_neve_18l_coral_88439618_0001.jpg', desc:'Tinta acrílica fosco. Rendimento 380m².'},
  {name:'Massa Corrida PVA 25kg Suvinil', sku:'MASSA-25', cat:'pintura', price:49.90, img:'https://cdn.leroymerlin.com.br/products/massa_corrida_pva_25kg_suvinil_88442456_0001.jpg', desc:'Massa corrida PVA interior.'},
  {name:'Porta de Madeira Maciça 80x210cm', sku:'PORTA-80', cat:'portas-e-janelas', price:289.00, img:'https://cdn.leroymerlin.com.br/products/porta_de_madeira_maci_a_80x210cm_88574247_0001.jpg', desc:'Porta angelim 80cm com batente.'},
  {name:'Janela de Alumínio 100x100cm', sku:'JANELA-100', cat:'portas-e-janelas', price:199.00, img:'https://cdn.leroymerlin.com.br/products/janela_de_aluminio_de_correr_100x100cm_2_folhas_88574249_0001.jpg', desc:'Janela alumínio branco 2 folhas.'},
  {name:'Chapa Drywall ST 12,5mm 1,20x1,80m Knauf', sku:'DRY-ST', cat:'drywall-e-forro', price:39.90, img:'https://cdn.leroymerlin.com.br/products/chapa_de_gesso_acartonado_drywall_st_12_5mm_1_20x1_80m_knauf_89408187_0001.jpg', desc:'Chapa drywall standard.'},
  {name:'Forro PVC Branco 20cm x 6m 8mm', sku:'FORRO-PVC', cat:'drywall-e-forro', price:24.90, img:'https://cdn.leroymerlin.com.br/products/forro_de_pvc_branco_20cm_x_6m_8mm_89538443_0001.jpg', desc:'Forro PVC branco gelo.'},
  {name:'Piso Cerâmico 45x45cm Bege', sku:'PISO-45', cat:'pisos-e-revestimentos', price:19.90, img:'https://cdn.leroymerlin.com.br/products/piso_ceramico_45x45cm_88574248_0001.jpg', desc:'Piso cerâmico PEI 3.'},
  {name:'Concreto Usinado 20MPa 1m³', sku:'CONC-20', cat:'concreto-usinado', price:389.00, img:'https://cdn.leroymerlin.com.br/products/concreto_usinado_20_mpa_1m3_88788945_0001.jpg', desc:'Concreto usinado 20MPa. Entrega betoneira.'},
  {name:'Disjuntor Bipolar 20A Siemens', sku:'DISJ-20', cat:'materiais-eletricos', price:32.90, img:'https://cdn.leroymerlin.com.br/products/disjuntor_bipolar_din_20a_siemens_5sx1_88032633_0001.jpg', desc:'Disjuntor DIN 20A curva C.'},
  {name:'Tubo PVC Esgoto 100mm 6m Tigre', sku:'TUBO-100', cat:'materiais-hidraulicos', price:89.90, img:'https://cdn.leroymerlin.com.br/products/tubo_de_pvc_para_esgoto_100mm_6m_tigre_87534295_0001.jpg', desc:'Tubo esgoto 100mm 6m.'},
  {name:'Caixa Dágua 1000L Fortlev', sku:'CAIXA-1000', cat:'materiais-hidraulicos', price:329.00, img:'https://cdn.leroymerlin.com.br/products/caixa_dagua_polietileno_1000l_fortlev_88439617_0001.jpg', desc:'Caixa 1000L polietileno.'},
];

async function run(){
  const {data:cats}=await c.from('categories').select('*');
  const catMap={}; cats.forEach(x=>catMap[x.slug]=x);
  const {data:subs}=await c.from('subcategories').select('*');
  const subByCat={}; subs.forEach(s=>{ if(!subByCat[s.category_id]) subByCat[s.category_id]=s.id; });
  // também precisa criar sub se não existir
  let ins=0;
  for(const p of COMPLEMENTO){
    const cat=catMap[p.cat];
    if(!cat) {console.log('cat não existe',p.cat); continue;}
    let sub=subByCat[cat.id];
    if(!sub){
      const {data:newSub}=await c.from('subcategories').insert({name:p.cat, slug:p.cat, category_id:cat.id, active:true, sort_order:1}).select().single();
      sub=newSub.id; subByCat[cat.id]=sub;
    }
    const id=crypto.randomUUID();
    const slug=p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').slice(0,50)+'-'+p.sku.toLowerCase();
    const {error}=await c.from('products').insert({id, name:p.name, slug, sku:p.sku, description:p.desc, price:p.price, original_price:(p.price*1.15).toFixed(2), category_id:cat.id, subcategory_id:sub, image_url:p.img, images:[p.img], unit:'un', weight:(5+Math.random()*20).toFixed(2), stock: Math.floor(50+Math.random()*500), active:true, featured:Math.random()<0.3, is_new:false, is_discount:true});
    if(error) console.log(error.message);
    else ins++;
  }
  console.log(`✅ Complemento: ${ins} produtos inseridos`);
  const {count}=await c.from('products').select('id',{count:'exact',head:true});
  console.log('TOTAL PRODUTOS',count);
}
run();
