#!/usr/bin/env python3
import json, re, unicodedata
from pathlib import Path
import httpx

def load_env():
    env={}
    p=Path(".env.local")
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            line=line.strip()
            if not line or line.startswith("#"): continue
            if "=" in line:
                k,v=line.split("=",1)
                env[k.strip()]=v.strip().strip('"').strip("'")
    return env

def normalize(s):
    if not s: return ""
    s=unicodedata.normalize("NFD", s)
    s="".join(c for c in s if unicodedata.category(c)!="Mn")
    return s.lower()

def supa_headers(key):
    return {"apikey":key,"Authorization":f"Bearer {key}"}

def main():
    env=load_env()
    url=(env.get("NEXT_PUBLIC_SUPABASE_URL") or "https://sdafczehznywoeqnfgph.supabase.co").rstrip("/")
    key=env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8"
    headers=supa_headers(key)
    client=httpx.Client(timeout=30, headers=headers)

    print("="*70)
    print("AUDITORIA COMPLETA - CATÁLOGO 333OBRA (somente leitura)")
    print("="*70)

    # 1) Supabase - categorias e produtos
    print("\n[1] Supabase - Categorias e Produtos")
    r=client.get(f"{url}/rest/v1/categories?select=id,slug,name,active&active=eq.true", headers=headers)
    cats=r.json() if r.status_code==200 else []
    print(f"  Categorias ativas: {len(cats)}")
    for c in sorted(cats, key=lambda x: x["slug"]):
        print(f"    - {c['slug']:25} {c['name']}")

    # Conta produtos por categoria (via paginação)
    cat_count={}
    for cat in cats:
        # count via head
        rr=client.get(f"{url}/rest/v1/products?select=id&category_id=eq.{cat['id']}&limit=1", headers={**headers,"Prefer":"count=exact"})
        total=0
        cr=rr.headers.get("content-range","")
        if "/" in cr:
            try: total=int(cr.split("/")[-1])
            except: total=0
        cat_count[cat["slug"]]=total
        print(f"    {cat['slug']:25} {total:4d} produtos")

    # Total produtos
    rr=client.get(f"{url}/rest/v1/products?select=id&limit=1", headers={**headers,"Prefer":"count=exact"})
    total_prod=0
    cr=rr.headers.get("content-range","")
    if "/" in cr:
        try: total_prod=int(cr.split("/")[-1])
        except: pass
    if total_prod==0:
        # fallback count via json
        r=client.get(f"{url}/rest/v1/products?select=id", headers=headers)
        # pode ser limitado a 1000, então usa head
        total_prod=len(r.json()) if r.status_code==200 else 0
    print(f"\n  TOTAL produtos no Supabase: {total_prod}")

    # Busca amostra de produtos para auditoria (1000)
    all_prods=[]
    offset=0
    while len(all_prods) < 2000:
        r=client.get(f"{url}/rest/v1/products?select=id,name,price,original_price,image_url,description,sku,category_id&limit=1000&offset={offset}", headers=headers)
        if r.status_code!=200: break
        data=r.json()
        if not data: break
        all_prods.extend(data)
        if len(data) < 1000: break
        offset+=1000
        if len(all_prods) >= 2000: break
    print(f"  Amostra analisada: {len(all_prods)} produtos")

    # Mapa categoria id -> slug
    cat_id_to_slug={c["id"]:c["slug"] for c in cats}

    # 2) Falsos positivos - telha em cimentos etc.
    print("\n[2] Falsos Positivos (categoria errada por nome)")
    falsos=[]
    for p in all_prods:
        n=normalize(p.get("name") or "")
        slug=cat_id_to_slug.get(p.get("category_id"),"?")
        # telha deve estar em telhas-e-coberturas, não em cimentos
        if "telha" in n and slug=="cimentos":
            falsos.append((p["name"][:50], slug, "deveria ser telhas-e-coberturas"))
        if "fibrocimento" in n and slug=="cimentos":
            falsos.append((p["name"][:50], slug, "deveria ser telhas-e-coberturas"))
        if "madeirite" in n and slug not in ["madeiras-e-esquadrias"]:
            falsos.append((p["name"][:50], slug, "deveria ser madeiras-e-esquadrias"))
        if "tijolo" in n and slug not in ["tijolos-e-blocos"]:
            falsos.append((p["name"][:50], slug, "deveria ser tijolos-e-blocos"))
        if "bloco" in n and "bloco de concreto" in n and slug not in ["tijolos-e-blocos"]:
            falsos.append((p["name"][:50], slug, "deveria ser tijolos-e-blocos"))
    if falsos:
        print(f"  Encontrados {len(falsos)} falsos positivos:")
        for nome, cat, exp in falsos[:10]:
            print(f"    - '{nome}' em {cat} -> {exp}")
    else:
        print("  OK: nenhum falso positivo crítico encontrado (telha em cimentos etc.)")

    # 3) Censo de cimentos
    print("\n[3] Censo de Cimentos (marcas, tipos CP, preços)")
    # Busca via Supabase categoria cimentos
    cimento_cat = next((c for c in cats if c["slug"]=="cimentos"), None)
    cimento_prods = [p for p in all_prods if p.get("category_id")== (cimento_cat["id"] if cimento_cat else None)]
    # Se não tem categoria cimentos, busca por nome
    if not cimento_prods:
        cimento_prods = [p for p in all_prods if "cimento" in normalize(p.get("name") or "")]
    print(f"  Produtos em cimentos (amostra): {len(cimento_prods)}")
    # Marcas
    marcas={}
    tipos={}
    precos=[]
    for p in cimento_prods:
        n=normalize(p.get("name") or "")
        for m in ["votoran","caue","csn","ciplan","montes claros","nassau","supremo","ita","tupi","liz"]:
            if m in n:
                marcas[m]=marcas.get(m,0)+1
                break
        for t in ["cp-ii","cp ii","cp-iii","cp iii","cp-iv","cp iv","cp-v","cp v","cpv ari","branco","queimado"]:
            if t in n:
                tipos[t]=tipos.get(t,0)+1
                break
        try:
            precos.append(float(p.get("price") or 0))
        except: pass
    print(f"  Marcas: {marcas}")
    print(f"  Tipos CP: {tipos}")
    if precos:
        precos_sorted=sorted([x for x in precos if x>0])
        if precos_sorted:
            print(f"  Preços: min R${min(precos_sorted):.2f} | mediana R${precos_sorted[len(precos_sorted)//2]:.2f} | max R${max(precos_sorted):.2f}")
            # verifica se tem preços zerados
            zeros=sum(1 for x in precos if x==0)
            print(f"  Preços zerados: {zeros}")

    # 4) Contagem por categoria e fracas
    print("\n[4] Contagem por categoria e categorias fracas")
    # já temos cat_count
    fracas=[k for k,v in cat_count.items() if v < 20]
    if fracas:
        print(f"  Categorias fracas (<20 produtos): {fracas}")
    else:
        print("  OK: nenhuma categoria com <20 (todas bem abastecidas)")

    # 5) Integridade preços, imagens, descrições
    print("\n[5] Integridade")
    sem_preco=sum(1 for p in all_prods if not p.get("price") or float(p.get("price") or 0)==0)
    sem_imagem=sum(1 for p in all_prods if not p.get("image_url") or "placeholder" in (p.get("image_url") or ""))
    sem_desc=sum(1 for p in all_prods if not p.get("description") or len(p.get("description") or "")<20)
    print(f"  Sem preço (0): {sem_preco} / {len(all_prods)}")
    print(f"  Sem imagem real: {sem_imagem} / {len(all_prods)}")
    print(f"  Sem descrição: {sem_desc} / {len(all_prods)}")
    # Verifica descrições com caracteres corrompidos ou PageBuilder
    corrompidas=0
    pagebuilder=0
    for p in all_prods:
        d=p.get("description") or ""
        if "Ã" in d or "�" in d or "�" in d:
            # heurística simples para mojibake
            if any(x in d for x in ["Ã§","Ã£","Ã©","Ã³"]):
                corrompidas+=1
        if "#html-body" in d or "data-pb-style" in d or "data-content-type" in d:
            pagebuilder+=1
    print(f"  Descrições com caracteres corrompidos (Ã§ etc): {corrompidas}")
    print(f"  Descrições com PageBuilder (<style>#html-body): {pagebuilder}")

    # 6) Arquivo original 53k
    print("\n[6] Arquivo original 53k")
    p1=Path("data/catalogo_333obra_53k_original.json")
    p2=Path("data/backup_catalogo_53874.json")
    src=p1 if p1.exists() else p2
    if src and src.exists():
        data=json.loads(src.read_text(encoding="utf-8"))
        print(f"  {src.name}: {len(data)} registros")
        # conta cimentos no arquivo original
        cimentos_orig=[p for p in data if "cimento" in normalize(p.get("name") or "")]
        print(f"  Cimentos no arquivo original: {len(cimentos_orig)}")
        # tipos
        tipos_orig={}
        for p in cimentos_orig:
            n=normalize(p.get("name") or "")
            for t in ["cp-ii","cp-iii","cp-iv","cp-v","cpv ari","branco"]:
                if t in n:
                    tipos_orig[t]=tipos_orig.get(t,0)+1
                    break
        print(f"  Tipos cimento no original: {tipos_orig}")
    else:
        print("  Arquivo original não encontrado")

    print("\n" + "="*70)
    print("FIM DA AUDITORIA")
    print("="*70)
    client.close()

if __name__=="__main__":
    main()
