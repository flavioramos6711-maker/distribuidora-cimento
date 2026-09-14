fetch('https://www.333obra.com.br/cimento-cpii-32-votoran-50-kg.html',{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text()).then(t=>{
  // procura BreadcrumbList
  const bc=t.match(/BreadcrumbList[\s\S]{0,3000}/);
  console.log(bc?bc[0].slice(0,2500):'no BreadcrumbList');
  const ld=t.match(/"@type"\s*:\s*"Product"[\s\S]{0,4000}/);
  console.log(ld?ld[0].slice(0,2000):'no Product');
  // também procura var com category
  const cat=t.match(/"categories"\s*:\s*\[[^\]]+\]/);
  console.log(cat?cat[0].slice(0,800):'no categories');
});
