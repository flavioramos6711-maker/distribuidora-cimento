#!/usr/bin/env python3
import json, re, unicodedata, time
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

def slugify(s):
    import unicodedata
    s=unicodedata.normalize("NFD", s)
    s="".join(c for c in s if unicodedata.category(c)!="Mn")
    s=re.sub(r"[^a-z0-9]+","-", s.lower()).strip("-")
    return s[:80] or "sem-nome"

def parse_price(val):
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).strip().replace("R$", "").replace(" ", "")
    if "." in s and "," in s:
        s = s.replace(".", "").replace(",", ".")
    elif "," in s:
        s = s.replace(",", ".")
    try:
        return float(s)
    except:
        return 0.0

CATEGORIAS_MESTRES = {
    "cimentos": "Cimentos",
    "argamassas": "Argamassas",
    "rejuntes": "Rejuntes",
    "impermeabilizantes": "Impermeabilizantes",
    "areia-e-pedra": "Areia e Pedra",
    "cal-e-gesso": "Cal e Gesso",
    "aco-e-ferragens": "Aço e Ferragens",
    "tijolos-e-blocos": "Tijolos e Blocos",
    "telhas-e-coberturas": "Telhas e Coberturas",
    "materiais-hidraulicos": "Materiais Hidráulicos",
    "materiais-eletricos": "Materiais Elétricos",
    "tintas-e-pintura": "Tintas e Pintura",
    "madeiras-e-esquadrias": "Madeiras e Esquadrias",
    "ferramentas-e-epis": "Ferramentas e EPIs",
}

def supa_headers(key):
    return {"apikey":key,"Authorization":f"Bearer {key}","Content-Type":"application/json","Prefer":"resolution=merge-duplicates"}

def main():
    env=load_env()
    url=(env.get("NEXT_PUBLIC_SUPABASE_URL") or "https://sdafczehznywoeqnfgph.supabase.co").rstrip("/")
    key=env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8"
    headers=supa_headers(key)
    client=httpx.Client(timeout=30, headers=headers)

    data_path=Path("data/catalogo_refinado_final.json")
    if not data_path.exists():
        raise SystemExit(f"{data_path} não encontrado")
    catalog=json.loads(data_path.read_text(encoding="utf-8"))
    print(f"Carregado {len(catalog)} produtos refinados")

    print("\n1) Categorias mestres (14 oficiais)...")
    # upsert 14
    for slug, nome in CATEGORIAS_MESTRES.items():
        payload={"name":nome,"slug":slug,"active":True,"sort_order":list(CATEGORIAS_MESTRES.keys()).index(slug)+1}
        r=client.post(f"{url}/rest/v1/categories?on_conflict=slug", json=payload, headers={**headers,"Prefer":"resolution=merge-duplicates"})
        if r.status_code not in (200,201,204):
            print(f"  categoria {nome} erro {r.status_code} {r.text[:200]}")
    # desativa categorias antigas que não são das 14 mestres
    r_all=client.get(f"{url}/rest/v1/categories?select=id,slug", headers=headers)
    try:
        for row in r_all.json():
            if row["slug"] not in CATEGORIAS_MESTRES:
                rr=client.patch(f"{url}/rest/v1/categories?id=eq.{row['id']}", json={"active": False}, headers=headers)
                print(f"  desativada categoria antiga {row['slug']} -> {rr.status_code}")
    except Exception as e:
        print(f"  erro ao desativar antigas: {e}")

    # mapeia slug -> id (apenas ativas mestres)
    r=client.get(f"{url}/rest/v1/categories?select=id,slug&active=eq.true", headers=headers)
    rows=r.json()
    cat_map={row["slug"]:row["id"] for row in rows if row["slug"] in CATEGORIAS_MESTRES}
    print(f"  Categorias no banco: {len(cat_map)}/14")
    for slug in CATEGORIAS_MESTRES:
        if slug not in cat_map:
            print(f"  AVISO: {slug} não encontrado após upsert")

    # garante subcategoria Geral para cada categoria (para FK)
    print("\n  Garantindo subcategorias...")
    r=client.get(f"{url}/rest/v1/subcategories?select=id,slug,category_id", headers=headers)
    subs=r.json()
    sub_map={}
    for row in subs:
        # key por category_id
        sub_map[row["category_id"]] = row["id"]
    for slug, cid in cat_map.items():
        if cid not in sub_map:
            sub_slug=f"{slug}-geral"
            payload={"name":"Geral","slug":sub_slug,"category_id":cid,"active":True,"sort_order":1}
            rr=client.post(f"{url}/rest/v1/subcategories?on_conflict=slug", json=payload, headers={**headers,"Prefer":"resolution=merge-duplicates"})
            # busca id
            rr2=client.get(f"{url}/rest/v1/subcategories?slug=eq.{sub_slug}&select=id", headers=headers)
            try:
                j=rr2.json()
                if j:
                    sub_map[cid]=j[0]["id"]
            except: pass
    print(f"  Subcategorias mapeadas: {len(sub_map)}")

    print("\n2) Limpando 100% dos produtos antigos...")
    for tbl in ["reviews", "products"]:
      total_del = 0
      while True:
        r = client.get(
            f"{url}/rest/v1/{tbl}?select=id&limit=200", headers=headers
        )
        try:
          rows = r.json()
        except:
          rows = []
        if not rows:
          break
        ids = [x["id"] for x in rows]
        # Divide em lotes de 50 IDs para a URL não ultrapassar o limite HTTP (evita erro 400)
        for i in range(0, len(ids), 50):
          chunk_ids = ids[i : i + 50]
          r2 = client.delete(
              f"{url}/rest/v1/{tbl}?id=in.({','.join(chunk_ids)})",
              headers=headers,
          )
        total_del += len(ids)
        print(f"  {tbl}: apagados {len(ids)} (total acumulado: {total_del})")
        time.sleep(0.05)
      print(f"  {tbl}: total final limpo = {total_del}")
    # Desativa categorias antigas que não são das 14 mestres
    print("\n  Desativando categorias antigas...")
    r = client.get(f"{url}/rest/v1/categories?select=id,slug", headers=headers)
    try:
        for cat in r.json():
            active = cat["slug"] in CATEGORIAS_MESTRES
            rr = client.patch(f"{url}/rest/v1/categories?id=eq.{cat['id']}", json={"active": active}, headers=headers)
            if not active:
                print(f"    desativada {cat['slug']} -> {rr.status_code}")
    except Exception as e:
        print(f"    erro ao desativar: {e}")

    print(f"\n3) Inserindo {len(catalog)} produtos em chunks de 500...")
    total_ok=0
    for i in range(0, len(catalog), 500):
        chunk=catalog[i:i+500]
        payload=[]
        for p in chunk:
            slug_mestre=p.get("categoria_mestre_slug") or "ferramentas-e-epis"
            if slug_mestre not in cat_map:
                slug_mestre="ferramentas-e-epis"
            cid=cat_map[slug_mestre]
            sid=sub_map.get(cid)
            if not sid:
                # fallback primeira sub
                sid=list(sub_map.values())[0]
            name=p.get("name") or "Sem nome"
            sku=p.get("sku") or slugify(name)[:20]
            slug=slugify(f"{name}-{sku}")[:80]
            price = parse_price(p.get("preco_final"))
            regular = parse_price(p.get("preco_regular"))
            if regular == 0.0 and price > 0.0:
                regular = price
            if price == 0.0 and regular > 0.0:
                price = regular
            img=p.get("imagem_destaque") or ""
            gallery=p.get("imagens_galeria") or []
            images=[u for u in gallery if u] or ([img] if img else [])
            desc=p.get("descricao_html") or ""
            payload.append({
                "name": name,
                "slug": slug,
                "sku": sku,
                "description": desc,
                "price": price,
                "original_price": regular,
                "image_url": img,
                "images": images,
                "category_id": cid,
                "subcategory_id": sid,
                "stock": 50,
                "unit": "un",
                "active": True
            })
        r=client.post(f"{url}/rest/v1/products", json=payload, headers={**headers,"Prefer":"return=minimal"})
        if r.status_code not in (200,201,204):
            if r.status_code==409:
                # tenta um por um
                ok=0
                for pp in payload:
                    rr=client.post(f"{url}/rest/v1/products", json=pp, headers={**headers,"Prefer":"return=minimal"})
                    if rr.status_code in (200,201,204):
                        ok+=1
                total_ok+=ok
                print(f"  chunk {i//500+1}: {ok}/{len(payload)} ok (duplicatas) total {total_ok}")
            else:
                print(f"  chunk {i//500+1} erro {r.status_code} {r.text[:400]}")
        else:
            total_ok+=len(payload)
            print(f"  chunk {i//500+1}: {len(payload)} ok total {total_ok}/{len(catalog)}")
        time.sleep(0.3)

    print(f"\n[OK] Importados {total_ok}/{len(catalog)}")

    # Validação
    print("\n4) Validação no Supabase...")
    r=client.get(f"{url}/rest/v1/categories?select=id&active=eq.true", headers=headers)
    # conta via head count
    r2=client.get(f"{url}/rest/v1/products?select=id", headers={**headers,"Prefer":"count=exact"}, params={"select":"id","active":"eq.true","limit":"1"})
    # melhor usa count head
    r3=client.request("HEAD", f"{url}/rest/v1/products?select=id&active=eq.true", headers=headers)
    # fallback via get count
    import httpx as hx
    # usa client get com count
    # vamos fazer via supabase count
    # tenta via GET com Prefer count
    headers_count={**headers,"Prefer":"count=exact"}
    rr=client.get(f"{url}/rest/v1/products?select=id&active=eq.true&limit=1", headers=headers_count)
    total = rr.headers.get("content-range","").split("/")[-1] if "/" in rr.headers.get("content-range","") else "?"
    print(f"  Produtos no banco (content-range): {total}")
    # alternativa via query count
    # busca 5 de controle
    for sku, cat_esp in [("1012","impermeabilizantes"),("1008-99","impermeabilizantes"),("202517","cimentos")]:
        rr=client.get(f"{url}/rest/v1/products?sku=eq.{sku}&select=name,sku,price,category_id", headers=headers)
        try:
            j=rr.json()
            if j:
                prod=j[0]
                # busca categoria
                crr=client.get(f"{url}/rest/v1/categories?id=eq.{prod['category_id']}&select=slug,name", headers=headers)
                cat=crr.json()[0] if crr.json() else {}
                slug=cat.get("slug","?")
                status="OK" if slug==cat_esp else f"FALHA got {slug}"
                print(f"  SKU {sku} -> {prod['name'][:40]} | cat {slug} esperado {cat_esp} [{status}] preco R${prod['price']}")
            else:
                print(f"  SKU {sku} -> NÃO ENCONTRADO")
        except Exception as e:
            print(f"  SKU {sku} erro {e}")

    # verifica categorias
    rr=client.get(f"{url}/rest/v1/categories?select=slug&active=eq.true", headers=headers)
    try:
        cats=[r["slug"] for r in rr.json()]
        print(f"  Categorias ativas: {len(cats)}/14 {cats}")
    except:
        pass

    client.close()
    print("\n[OK] Sincronização concluída. Verifique http://127.0.0.1:3000/produtos")

if __name__=="__main__":
    main()
