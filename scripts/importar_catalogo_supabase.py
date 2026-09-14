#!/usr/bin/env python3
"""
Importador catálogo 333obra -> Supabase
Lê data/categorias.json e data/catalogo_333obra.json e faz upsert em public.categories/subcategories/products
Uso: python scripts/importar_catalogo_supabase.py [--limit 100]
"""
import argparse
import json
import re
import os
import time
import random
from pathlib import Path
import httpx

def load_env():
    env_path = Path(".env.local")
    env = {}
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line=line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k,v=line.split("=",1)
                env[k.strip()]=v.strip().strip('"').strip("'")
    return env

def slugify(s):
    import unicodedata
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s.lower()).strip("-")
    return s[:80] or "sem-nome"

def supa_headers(key):
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

def normalize_txt(s):
    import unicodedata
    if not s:
        return ""
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.lower()

def classificar_categoria_por_nome(nome_produto):
    """
    Retorna slug da categoria raiz correta baseado em regras semânticas prioritárias.
    Prioridade: impermeabilizantes > demais
    """
    n = normalize_txt(nome_produto or "")
    # 1) Impermeabilizantes - PRIORIDADE MÁXIMA
    termos_imper = ["impermeabilizante","vedacit","vedapren","manta asfaltica","fita multiuso","asfalto","neutrol","tecplus","sikatop","viapol","bianco","hidrofugante","selante"]
    for t in termos_imper:
        if normalize_txt(t) in n:
            return "impermeabilizantes"
    # 2) Cimentos (e não rejunte/cola)
    if "cimento" in n and "rejunte" not in n and "cola" not in n:
        return "cimentos"
    # 3) Argamassas (e não impermeabilizante - já tratado)
    if "argamassa" in n:
        return "argamassas"
    # 4) Rejuntes
    if "rejunte" in n:
        return "rejuntes"
    # 5) Areia-pedra
    for t in ["areia","pedra","brita","pedrisco","rachao"]:
        if t in n:
            return "areia-pedra"
    # 6) Cal-e-gesso
    # contém "cal " com espaço para evitar falso positivo em "local", ou "gesso", ou "cal hidratada"
    if "cal hidratada" in n or " gesso" in n or "gesso " in n or n.startswith("gesso") or " cal " in f" {n} " or n.startswith("cal ") or " cal," in n:
        return "cal-e-gesso"
    # 7) Aço para construção
    for t in ["vergalhao","coluna armada","estribo","trelica","arame","malha pop"]:
        if normalize_txt(t) in n:
            return "aco-para-construcao"
    # 8) Tijolos e blocos
    for t in ["bloco de concreto","tijolo","canaleta"]:
        if normalize_txt(t) in n:
            return "tijolos-e-blocos"
    # 9) Materiais hidráulicos
    for t in ["tubo","conexao","caixa d'agua","registro","joelho","ralo","sifao"]:
        if normalize_txt(t) in n:
            return "materiais-hidraulicos"
    # 10) Materiais elétricos
    for t in ["fio","cabo","disjuntor","eletroduto","tomada","interruptor","lampada","plafon"]:
        # evita falso positivo: "cabo" dentro de "acabamento" - mas mantemos simples
        if normalize_txt(t) in n:
            return "materiais-eletricos"
    # 11) Pintura
    for t in ["tinta","verniz","esmalte","massa corrida","massa acrilica","selador","trincha","rolo"]:
        if normalize_txt(t) in n:
            return "pintura"
    # 12) Telhas
    for t in ["telha","cumeeira"]:
        if normalize_txt(t) in n:
            return "telhas"
    # 13) Ferramentas
    for t in ["furadeira","esmerilhadeira","trena","colher de pedreiro","desempenadeira","martelo"]:
        if normalize_txt(t) in n:
            return "ferramentas"
    return None

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None, help="Limita produtos")
    parser.add_argument("--test-rules", action="store_true", help="Testa classificação de 50 produtos críticos sem gravar no banco")
    args=parser.parse_args()

    env=load_env()
    url=env.get("NEXT_PUBLIC_SUPABASE_URL") or env.get("SUPABASE_URL")
    service_key=env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if not url or not service_key:
        # tenta fallback hardcoded do projeto
        url="https://sdafczehznywoeqnfgph.supabase.co"
        service_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYWZjemVoem55d29lcW5mZ3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMjk0OCwiZXhwIjoyMDg3Njg4OTQ4fQ.jDUDj3hH5KGlzWISUMi5MIp_u5QiQ3aV0JBwV7PT3S8"
        print(f"[!] .env.local não encontrado, usando fallback {url}")

    url=url.rstrip("/")
    headers=supa_headers(service_key)
    client=httpx.Client(timeout=30, headers=headers)

    data_dir=Path("data")
    cat_path=data_dir/"categorias.json"
    catalog_path=data_dir/"catalogo_333obra.json"
    if not cat_path.exists() or not catalog_path.exists():
        raise SystemExit("Arquivos data/categorias.json ou data/catalogo_333obra.json não encontrados. Rode o crawler primeiro.")

    print("1) Carregando categorias...")
    cat_data=json.loads(cat_path.read_text(encoding="utf-8"))
    flat=cat_data.get("flat") or []
    # Filtra apenas categorias relevantes (abaixo de Todos os Produtos)
    # flat tem path como "Default Category > Todos os Produtos > Cimento > Cimento Votoran"
    # Vamos extrair nível 3 como categoria raiz e nível 4+ como sub
    # Para simplificar: cria categorias para cada nome distinto no nível 3
    from collections import defaultdict, OrderedDict
    # Mapeia id original -> para referência, mas vamos criar novos UUIDs via Supabase (ou deixar gerar)
    # Estratégia: upsert por slug

    # Primeiro, limpa e cria categorias raiz
    # Identifica categorias nível 3 (ex: Cimento, Argamassas)
    raiz_map=OrderedDict()
    for c in flat:
        parts=c["path"].split(" > ")
        # path exemplo: Default Category > Todos os Produtos > Cimento
        # ou ... > Cimento > Cimento Votoran
        if len(parts) < 3:
            continue
        # nível 3 é índice 2
        if len(parts) >= 3:
            raiz_name=parts[2].strip()
            if raiz_name in ["Todos os Produtos","Default Category","Root Catalog"]:
                continue
            if raiz_name not in raiz_map:
                raiz_map[raiz_name] = {"slug": slugify(raiz_name), "name": raiz_name}

    print(f"  Categorias raiz identificadas: {len(raiz_map)}")
    # Se for apenas teste de regras, não altera o banco
    if args.test_rules:
        print("  [test-rules] modo somente leitura - não altera banco")
    else:
        if args.limit is None:
            print("  Limpando produtos/reviews/categorias antigas (carga completa)...")
            for tbl in ["reviews","products","subcategories","categories"]:
                try:
                    r=client.delete(f"{url}/rest/v1/{tbl}?id=not.is.null", headers=headers)
                    print(f"    {tbl}: {r.status_code}")
                except Exception as e:
                    print(f"    {tbl} erro {e}")
                time.sleep(0.2)
        else:
            print(f"  [limit {args.limit}] mantendo categorias existentes, apenas upsert")

    if args.test_rules:
        cat_id_map={}
        sub_id_map={}
    else:
        # Insere categorias raiz
        cat_id_map={} # slug -> id
        for name, info in raiz_map.items():
            slug=info["slug"]
            # tenta upsert
            payload={"name": name, "slug": slug, "active": True, "sort_order": list(raiz_map.keys()).index(name)+1}
            # supabase upsert via POST com Prefer merge-duplicates e onConflict slug
            r=client.post(f"{url}/rest/v1/categories?on_conflict=slug", json=payload, headers={**headers, "Prefer":"resolution=merge-duplicates"})
            if r.status_code not in (200,201,204):
                print(f"    categoria {name} erro {r.status_code} {r.text[:300]}")
            # busca id gerado
            r2=client.get(f"{url}/rest/v1/categories?slug=eq.{slug}&select=id", headers=headers)
            try:
                j=r2.json()
                if j:
                    cat_id_map[slug]=j[0]["id"]
            except:
                pass

    # Se ainda não temos cat_id_map (ex: tabela vazia e select falhou por falta de dados), busca todos
    if not cat_id_map:
        r=client.get(f"{url}/rest/v1/categories?select=id,slug", headers=headers)
        for row in r.json():
            cat_id_map[row["slug"]]=row["id"]

    print(f"  Categorias no banco: {len(cat_id_map)}")

    # Cria subcategorias para folhas (nível 4+)
    sub_id_map={}
    for c in flat:
        parts=c["path"].split(" > ")
        if len(parts) < 4:
            continue
        # sub é nível 4 em diante
        sub_name=parts[3].strip()
        raiz_name=parts[2].strip()
        raiz_slug=slugify(raiz_name)
        cat_id=cat_id_map.get(raiz_slug)
        if not cat_id:
            continue
        sub_slug=slugify(sub_name)
        key=f"{raiz_slug}__{sub_slug}"
        if key in sub_id_map:
            continue
        # verifica se já existe
        r=client.get(f"{url}/rest/v1/subcategories?slug=eq.{sub_slug}&select=id", headers=headers)
        try:
            j=r.json()
            if j:
                sub_id_map[key]=j[0]["id"]
                continue
        except:
            pass
        payload={"name": sub_name, "slug": sub_slug, "category_id": cat_id, "active": True, "sort_order": 1}
        r=client.post(f"{url}/rest/v1/subcategories?on_conflict=slug", json=payload, headers={**headers, "Prefer":"resolution=merge-duplicates"})
        # busca id
        r2=client.get(f"{url}/rest/v1/subcategories?slug=eq.{sub_slug}&select=id", headers=headers)
        try:
            j=r2.json()
            if j:
                sub_id_map[key]=j[0]["id"]
        except:
            pass

    # Fallback: se sub_id_map ainda vazio, cria uma sub genérica por categoria
    if not sub_id_map:
        for slug, cid in cat_id_map.items():
            sub_slug=f"{slug}-geral"
            payload={"name": "Geral", "slug": sub_slug, "category_id": cid, "active": True, "sort_order": 1}
            client.post(f"{url}/rest/v1/subcategories?on_conflict=slug", json=payload, headers={**headers, "Prefer":"resolution=merge-duplicates"})
        # recarrega
        r=client.get(f"{url}/rest/v1/subcategories?select=id,slug,category_id", headers=headers)
        for row in r.json():
            # mapeia por category_id
            for k in list(cat_id_map.keys()):
                if row["category_id"]==cat_id_map[k]:
                    sub_id_map[f"{k}__{row['slug']}"]=row["id"]
                    break

    print(f"  Subcategorias no banco: {len(sub_id_map)}")

    # Garante que Impermeabilizantes exista (requisito)
    imper_slug = "impermeabilizantes"
    if imper_slug not in cat_id_map:
        print(f"  Criando categoria obrigatória Impermeabilizantes...")
        payload={"name":"Impermeabilizantes","slug":imper_slug,"active":True,"sort_order":99}
        client.post(f"{url}/rest/v1/categories?on_conflict=slug", json=payload, headers={**headers, "Prefer":"resolution=merge-duplicates"})
        r=client.get(f"{url}/rest/v1/categories?slug=eq.{imper_slug}&select=id", headers=headers)
        try:
            j=r.json()
            if j: cat_id_map[imper_slug]=j[0]["id"]
        except: pass
        # cria sub genérica
        sub_slug=f"{imper_slug}-geral"
        client.post(f"{url}/rest/v1/subcategories?on_conflict=slug", json={"name":"Geral","slug":sub_slug,"category_id":cat_id_map[imper_slug],"active":True,"sort_order":1}, headers={**headers, "Prefer":"resolution=merge-duplicates"})
        r=client.get(f"{url}/rest/v1/subcategories?slug=eq.{sub_slug}&select=id", headers=headers)
        try:
            j=r.json()
            if j: sub_id_map[f"{imper_slug}__{sub_slug}"]=j[0]["id"]
        except: pass

    # Garante slugs do classificador (areia-pedra, cal-e-gesso etc.)
    for slug, nome in [("areia-pedra","Areia e Pedra"),("cal-e-gesso","Cal e Gesso"),("cimentos","Cimentos"),("aco-para-construcao","Aço para Construção"),("tijolos-e-blocos","Tijolos e Blocos"),("materiais-hidraulicos","Materiais Hidráulicos"),("materiais-eletricos","Materiais Elétricos")]:
        if slug not in cat_id_map:
            payload={"name":nome,"slug":slug,"active":True,"sort_order":99}
            client.post(f"{url}/rest/v1/categories?on_conflict=slug", json=payload, headers={**headers, "Prefer":"resolution=merge-duplicates"})
            r=client.get(f"{url}/rest/v1/categories?slug=eq.{slug}&select=id", headers=headers)
            try:
                j=r.json()
                if j: cat_id_map[slug]=j[0]["id"]
            except: pass
            sub_slug=f"{slug}-geral"
            client.post(f"{url}/rest/v1/subcategories?on_conflict=slug", json={"name":"Geral","slug":sub_slug,"category_id":cat_id_map[slug],"active":True,"sort_order":1}, headers={**headers, "Prefer":"resolution=merge-duplicates"})
            r=client.get(f"{url}/rest/v1/subcategories?slug=eq.{sub_slug}&select=id", headers=headers)
            try:
                j=r.json()
                if j: sub_id_map[f"{slug}__{sub_slug}"]=j[0]["id"]
            except: pass

    # 2) Carrega catálogo
    print("\n2) Carregando catálogo...")
    catalog=json.loads(catalog_path.read_text(encoding="utf-8"))
    if args.limit:
        catalog=catalog[:args.limit]
        print(f"  [limit {args.limit}] usando {len(catalog)} produtos")

    # Modo teste de regras
    if args.test_rules:
        print("\n[TEST-RULES] Classificação de 50 produtos críticos (inclui SKU 1012 e 1008-99):")
        # seleciona 50: garante que 1012 e 1008-99 estejam inclusos se existirem, completa com outros
        criticos=[]
        sku_map={p.get("sku"):p for p in catalog}
        for sku in ["1012","1008-99"]:
            if sku in sku_map:
                criticos.append(sku_map[sku])
        # adiciona produtos que são casos críticos conhecidos
        for p in catalog:
            if len(criticos) >= 50:
                break
            if p not in criticos:
                # prioriza casos que testam regras: impermeabilizantes, argamassas, etc.
                n=normalize_txt(p.get("name") or "")
                if any(k in n for k in ["vedacit","tecplus","fita multiuso","argamassa","rejunte","cimento","areia","tijolo","tubo","fio","tinta","telha","furadeira"]):
                    criticos.append(p)
        # completa até 50 com aleatórios
        for p in catalog:
            if len(criticos) >= 50:
                break
            if p not in criticos:
                criticos.append(p)
        criticos=criticos[:50]
        for p in criticos:
            cat_slug=classificar_categoria_por_nome(p.get("name") or "")
            cat_display=cat_slug or "(fallback JSON)"
            print(f"[{p.get('name','')[:60]}] (SKU {p.get('sku')}) -> [{cat_display}]")
        # valida casos obrigatórios
        print("\n[VALIDAÇÃO OBRIGATÓRIA]")
        for nome_esperado, cat_esperada in [("Fita para Reparo Multiuso Vedacit","impermeabilizantes"),("Impermeabilizante Tecplus Top Quartzolit","impermeabilizantes")]:
            # busca produto real com nome similar ou usa nome_esperado diretamente
            found=None
            for p in catalog:
                if normalize_txt(nome_esperado) in normalize_txt(p.get("name") or ""):
                    found=p
                    break
            test_nome=found["name"] if found else nome_esperado
            got=classificar_categoria_por_nome(test_nome)
            status="OK" if got==cat_esperada else f"FALHOU (got {got})"
            print(f"  '{test_nome[:50]}' -> {got} esperado {cat_esperada} [{status}]")
        return

    # Mapeia categoria de cada produto para cat_id/sub_id
    # Usa campo categoria_folha_origem ou categorias[0]
    def get_cat_for_product(prod):
        # 1) Classificação prioritária por NOME (regra semântica)
        nome = prod.get("name") or ""
        slug_class = classificar_categoria_por_nome(nome)
        if slug_class:
            # alias para compatibilidade com slugs existentes no banco
            alias = {
                "cimentos": "cimentos",
                "areia-pedra": "areia-pedra",
                "cal-e-gesso": "cal-e-gesso",
            }
            # tenta direto, se não existir tenta fallback combinado
            cid = cat_id_map.get(slug_class)
            if not cid and slug_class in ["areia-pedra","cal-e-gesso"]:
                # fallback para categoria combinada se separadas não existirem
                cid = cat_id_map.get("areia-pedra-cal-e-gesso") or cat_id_map.get(slug_class)
            if cid:
                # subcategoria coerente: pega primeira sub da categoria classificada
                for k,v in sub_id_map.items():
                    if k.startswith(slug_class+"__"):
                        return cid, v
                # se não tem sub com esse prefixo, pega qualquer sub dessa categoria
                for k,v in sub_id_map.items():
                    # sub_id_map keys são "slug__subslug", verifica se cat_id corresponde
                    # busca sub que pertence à categoria cid
                    # para isso, precisa mapear cat_id -> sub
                    pass
                # fallback genérico: primeira sub da categoria
                # procura sub com category_id == cid (reconstrói)
                # como sub_id_map não guarda cat_id, faz lookup via DB já mapeado: pega primeira que começa com slug
                # se ainda não, retorna cid com sub default
                return cid, None

        # 2) Fallback JSON original
        # tenta categoria_folha_origem.path
        fol=prod.get("categoria_folha_origem") or {}
        path=fol.get("path") or ""
        if path:
            parts=path.split(" > ")
            if len(parts)>=3:
                raiz=parts[2].strip()
                slug=slugify(raiz)
                cid=cat_id_map.get(slug)
                if cid:
                    # sub
                    sub_name=parts[3].strip() if len(parts)>=4 else raiz
                    sub_slug=slugify(sub_name)
                    key=f"{slug}__{sub_slug}"
                    sid=sub_id_map.get(key)
                    if not sid:
                        # fallback primeira sub da categoria
                        for k,v in sub_id_map.items():
                            if k.startswith(slug+"__"):
                                sid=v
                                break
                    return cid, sid
        # fallback por categorias array
        cats_prod=prod.get("categorias") or []
        for cp in cats_prod:
            n=cp.get("name") or ""
            s=slugify(n)
            if s in cat_id_map:
                cid=cat_id_map[s]
                # pega primeira sub
                for k,v in sub_id_map.items():
                    if k.startswith(s+"__"):
                        return cid, v
                return cid, None
            # tenta por nome parcial
            for slug,cid in cat_id_map.items():
                if n.lower() in slug or slug in n.lower():
                    for k,v in sub_id_map.items():
                        if k.startswith(slug+"__"):
                            return cid, v
                    return cid, None
        # último fallback: primeira categoria
        first_slug=list(cat_id_map.keys())[0]
        cid=cat_id_map[first_slug]
        # primeira sub dessa cat
        for k,v in sub_id_map.items():
            if k.startswith(first_slug+"__"):
                return cid, v
        return cid, None

    # Prepara upsert em chunks de 500
    print(f"  Inserindo {len(catalog)} produtos em chunks de 500...")
    # Para pegar sub default se necessário
    # Busca uma sub genérica
    default_sub=None
    try:
        r=client.get(f"{url}/rest/v1/subcategories?select=id&limit=1", headers=headers)
        j=r.json()
        if j:
            default_sub=j[0]["id"]
    except:
        pass

    total_ok=0
    for i in range(0, len(catalog), 500):
        chunk=catalog[i:i+500]
        payload=[]
        for prod in chunk:
            cid,sid=get_cat_for_product(prod)
            if not sid:
                sid=default_sub
            # fallback se ainda None, pega qualquer sub
            if not sid and sub_id_map:
                sid=list(sub_id_map.values())[0]
            name=prod.get("name") or "Sem nome"
            sku=prod.get("sku") or slugify(name)[:20]
            slug=slugify(f"{name}-{sku}")[:80]
            price=prod.get("preco_final")
            if price is None:
                price=prod.get("preco_regular") or 0
            try:
                price=float(price)
            except:
                price=0
            regular=prod.get("preco_regular")
            try:
                regular=float(regular) if regular is not None else None
            except:
                regular=None
            img=prod.get("imagem_destaque") or ""
            gallery=prod.get("imagens_galeria") or []
            # garante que images não seja vazio
            images=[u for u in gallery if u] or ([img] if img else [])
            desc=prod.get("descricao_html") or prod.get("descricao_texto") or ""
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
        # insert sem on_conflict (sku pode não ter constraint unique em alguns bancos)
        # primeiro tenta upsert, fallback para insert simples
        r=client.post(f"{url}/rest/v1/products", json=payload, headers={**headers, "Prefer":"return=minimal"})
        if r.status_code not in (200,201,204):
            # se erro de duplicata (409) tenta um por um ignorando duplicatas
            if r.status_code == 409:
                ok_in_chunk=0
                for p in payload:
                    rr=client.post(f"{url}/rest/v1/products", json=p, headers={**headers, "Prefer":"return=minimal"})
                    if rr.status_code in (200,201,204):
                        ok_in_chunk+=1
                total_ok+=ok_in_chunk
                print(f"  chunk {i//500+1}: {ok_in_chunk}/{len(payload)} ok (duplicatas ignoradas) (total {total_ok}/{len(catalog)})")
            else:
                print(f"  chunk {i//500+1} erro {r.status_code} {r.text[:500]}")
                for p in payload[:1]:
                    print("    exemplo payload", json.dumps(p, ensure_ascii=False)[:400])
        else:
            total_ok+=len(payload)
            print(f"  chunk {i//500+1}: {len(payload)} ok (total {total_ok}/{len(catalog)})")
        time.sleep(0.3)

    print(f"\n[OK] Importados {total_ok}/{len(catalog)} produtos")
    client.close()

if __name__=="__main__":
    main()
