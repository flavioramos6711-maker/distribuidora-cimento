#!/usr/bin/env python3
"""
Crawler 333obra - Extrator GraphQL Magento 2
Endpoint: https://www.333obra.com.br/graphql
Gera: data/categorias.json, data/catalogo_333obra.json, data/catalogo_333obra.csv
Uso: python scripts/crawler_333obra.py [--dry-run] [--limit 50] [--category-id 123]
"""
import argparse
import csv
import json
import time
import random
from pathlib import Path
from collections import defaultdict

import httpx
from tqdm import tqdm

ENDPOINT = "https://www.333obra.com.br/graphql"
HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "application/json",
}
BASE_URL = "https://www.333obra.com.br"

# GraphQL queries
CATEGORY_LIST_QUERY = """
query {
  categoryList {
    id
    name
    url_path
    url_key
    children {
      id
      name
      url_path
      url_key
      children {
        id
        name
        url_path
        url_key
        children {
          id
          name
          url_path
          url_key
        }
      }
    }
  }
}
"""

PRODUCTS_QUERY = """
query GetCategoryProducts($categoryId: String!, $page: Int!) {
  products(filter: { category_id: { eq: $categoryId } }, pageSize: 50, currentPage: $page) {
    total_count
    page_info {
      current_page
      page_size
      total_pages
    }
    items {
      id
      sku
      name
      url_key
      price_range {
        minimum_price {
          regular_price { value currency }
          final_price { value currency }
        }
      }
      categories { id name url_path }
      image { url label }
      media_gallery { url label position disabled }
      description { html }
      short_description { html }
    }
  }
}
"""

def request_with_retry(client, payload, max_retries=5):
    for attempt in range(max_retries):
        try:
            r = client.post(ENDPOINT, json=payload, headers=HEADERS, timeout=30)
            if r.status_code == 429 or r.status_code >= 500:
                wait = (2 ** attempt) + random.random()
                print(f"  [retry {attempt+1}/{max_retries}] HTTP {r.status_code} -> aguardando {wait:.1f}s")
                time.sleep(wait)
                continue
            r.raise_for_status()
            data = r.json()
            if "errors" in data:
                # GraphQL errors - log mas tenta continuar
                print(f"  GraphQL errors: {data['errors'][:1]}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
            return data
        except httpx.RequestError as e:
            wait = (2 ** attempt) + random.random()
            print(f"  [retry {attempt+1}] RequestError {e} -> {wait:.1f}s")
            time.sleep(wait)
    raise RuntimeError(f"Falha após {max_retries} tentativas: {payload.get('variables')}")

def flatten_categories(tree, parent_path=None):
    """Achata árvore em lista com path hierárquico."""
    flat = []
    for node in tree:
        cur_path = (parent_path + " > " + node["name"]) if parent_path else node["name"]
        flat.append({
            "id": str(node["id"]),
            "name": node["name"],
            "url_path": node.get("url_path") or node.get("url_key") or "",
            "path": cur_path,
            "level": cur_path.count(" > ") + 1,
            "is_leaf": len(node.get("children") or []) == 0
        })
        if node.get("children"):
            flat.extend(flatten_categories(node["children"], cur_path))
    return flat

def get_leaf_categories(flat):
    # folha = sem filhos na árvore original -> já marcado is_leaf
    # mas se queremos todas as folhas reais, filtra is_leaf
    return [c for c in flat if c["is_leaf"]]

def main():
    parser = argparse.ArgumentParser(description="Crawler 333obra GraphQL")
    parser.add_argument("--dry-run", action="store_true", help="Teste rápido: apenas 1 categoria folha com 1 página")
    parser.add_argument("--limit", type=int, default=None, help="Limita total de produtos únicos coletados (útil para teste)")
    parser.add_argument("--category-id", type=str, default=None, help="Filtra apenas uma categoria específica (id)")
    args = parser.parse_args()

    data_dir = Path("data")
    data_dir.mkdir(exist_ok=True)
    scripts_dir = Path("scripts")
    scripts_dir.mkdir(exist_ok=True)

    client = httpx.Client(timeout=30, follow_redirects=True)

    print("="*60)
    print("1) Coletando categorias via categoryList...")
    cat_data = request_with_retry(client, {"query": CATEGORY_LIST_QUERY})
    # categoryList pode vir como data.categoryList ou data.categories
    categories_tree = None
    if "data" in cat_data:
        categories_tree = cat_data["data"].get("categoryList") or cat_data["data"].get("categories") or []
    if not categories_tree:
        print("ERRO: categoryList vazio. Resposta:", json.dumps(cat_data, indent=2)[:1500])
        # fallback: tenta com filtro ids
        fallback_query = """query { categoryList(filters:{ids:{in:["2"]}}) { id name url_path children { id name url_path children { id name url_path children { id name url_path } } } } }"""
        cat_data = request_with_retry(client, {"query": fallback_query})
        categories_tree = cat_data.get("data",{}).get("categoryList",[])

    if not categories_tree:
        raise SystemExit("Não foi possível obter categorias.")

    # Salva árvore bruta
    flat = flatten_categories(categories_tree)
    leafs = get_leaf_categories(flat)
    print(f"  Total categorias (flatten): {len(flat)} | Folhas: {len(leafs)}")
    # Se --category-id filtrar
    if args.category_id:
        leafs = [c for c in leafs if c["id"] == args.category_id]
        print(f"  Filtrado por category-id={args.category_id} -> {len(leafs)} folhas")
    if args.dry_run:
        # pula WhatsApp/Promoções que geralmente estão vazias, pega uma folha com produtos (ex: Cimento)
        leafs = [c for c in leafs if "cimento" in c["name"].lower()][:1] or leafs[2:3]
        if not leafs:
            leafs = leafs[:1]
        print(f"  [dry-run] usando apenas 1 folha: {leafs[0]['path']} (id={leafs[0]['id']})")

    # Salva categorias.json com árvore e flat
    categorias_out = {
        "total_categorias": len(flat),
        "total_folhas": len(leafs),
        "arvore": categories_tree,
        "flat": flat,
        "folhas": leafs
    }
    with open(data_dir / "categorias.json", "w", encoding="utf-8") as f:
        json.dump(categorias_out, f, ensure_ascii=False, indent=2)
    print(f"  -> salvo data/categorias.json")

    # 2) Coleta produtos por categoria folha
    print("\n2) Coletando produtos por categoria folha (pageSize=50)...")
    dedup = {}
    total_requests = 0

    # Se dry-run, limita páginas; se --limit, interrompe ao atingir
    pbar = tqdm(leafs, desc="Categorias", unit="cat")
    for cat in pbar:
        cat_id = cat["id"]
        pbar.set_postfix_str(f"{cat['path'][:30]} | únicos:{len(dedup)}")
        page = 1
        while True:
            payload = {"query": PRODUCTS_QUERY, "variables": {"categoryId": str(cat_id), "page": page}}
            data = request_with_retry(client, payload)
            total_requests += 1
            products_data = data.get("data",{}).get("products")
            if not products_data:
                # pula categoria sem produtos
                break

            items = products_data.get("items") or []
            page_info = products_data.get("page_info") or {}
            total_pages = page_info.get("total_pages") or 1
            total_count = products_data.get("total_count") or 0

            for it in items:
                sku = (it.get("sku") or "").strip()
                if not sku:
                    continue
                if sku in dedup:
                    continue
                # Extrai campos
                pr = (it.get("price_range") or {}).get("minimum_price") or {}
                regular = (pr.get("regular_price") or {}).get("value")
                final = (pr.get("final_price") or {}).get("value")
                # fallback se final for None
                if final is None:
                    final = regular
                if regular is None:
                    regular = final

                cats_prod = it.get("categories") or []
                img = it.get("image") or {}
                gallery = it.get("media_gallery") or []
                desc_html = (it.get("description") or {}).get("html") or ""
                url_key = it.get("url_key") or ""
                url = f"{BASE_URL}/{url_key}.html" if url_key else f"{BASE_URL}/p/{it.get('id')}.html"
                # Fallback imagem destaque se for placeholder
                img_url = img.get("url") or ""
                if "placeholder" in img_url and gallery:
                    # pega primeira da galeria que não seja placeholder
                    for g in gallery:
                        u = g.get("url") or ""
                        if u and "placeholder" not in u:
                            img_url = u
                            break
                dedup[sku] = {
                    "sku": sku,
                    "name": it.get("name") or "",
                    "preco_regular": regular,
                    "preco_final": final,
                    "moeda": (pr.get("regular_price") or {}).get("currency") or "BRL",
                    "imagem_destaque": img_url,
                    "imagem_destaque_label": img.get("label") or "",
                    "imagens_galeria": [g.get("url") for g in gallery if g.get("url") and "placeholder" not in g.get("url")],
                    "categorias": [{"id": str(c.get("id")), "name": c.get("name"), "url_path": c.get("url_path")} for c in cats_prod],
                    "categoria_folha_origem": {"id": cat["id"], "name": cat["name"], "path": cat["path"]},
                    "descricao_html": desc_html,
                    "descricao_texto": (it.get("short_description") or {}).get("html") or "",
                    "url": url,
                    "url_key": url_key,
                    "id_magento": str(it.get("id")),
                }
                if args.limit and len(dedup) >= args.limit:
                    break

            # Checagem de limite global
            if args.limit and len(dedup) >= args.limit:
                print(f"\n  [limit {args.limit} atingido] interrompendo.")
                break
            # dry-run: apenas 1 página por categoria
            if args.dry_run:
                break
            if page >= total_pages:
                break
            page += 1
            # pequeno delay para não sobrecarregar
            time.sleep(0.35)

        if args.limit and len(dedup) >= args.limit:
            break

    print(f"\n  Total produtos únicos coletados: {len(dedup)} (em {total_requests} requisições)")

    # 3) Exporta JSON e CSV
    catalogo = list(dedup.values())
    # Ordena por sku
    catalogo.sort(key=lambda x: x["sku"])

    # JSON
    with open(data_dir / "catalogo_333obra.json", "w", encoding="utf-8") as f:
        json.dump(catalogo, f, ensure_ascii=False, indent=2)
    print(f"  -> salvo data/catalogo_333obra.json ({len(catalogo)} itens)")

    # CSV
    csv_path = data_dir / "catalogo_333obra.csv"
    # Campos achatados
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "sku","name","preco_regular","preco_final","moeda",
            "imagem_destaque","imagens_galeria","categorias","url","descricao_html"
        ])
        writer.writeheader()
        for it in catalogo:
            writer.writerow({
                "sku": it["sku"],
                "name": it["name"],
                "preco_regular": it["preco_regular"],
                "preco_final": it["preco_final"],
                "moeda": it["moeda"],
                "imagem_destaque": it["imagem_destaque"],
                "imagens_galeria": " | ".join(it["imagens_galeria"]),
                "categorias": " | ".join([c["name"] for c in it["categorias"]]),
                "url": it["url"],
                "descricao_html": it["descricao_html"][:2000].replace("\n"," ").replace("\r"," ")
            })
    print(f"  -> salvo data/catalogo_333obra.csv")

    # Validação
    print("\n3) Validação:")
    # JSON válido já garantido, verifica duplicatas
    skus = [x["sku"] for x in catalogo]
    dup = len(skus) - len(set(skus))
    print(f"  - Duplicatas por sku: {dup} (esperado 0)")
    sem_imagem = sum(1 for x in catalogo if not x["imagem_destaque"])
    sem_desc = sum(1 for x in catalogo if not x["descricao_html"])
    sem_preco = sum(1 for x in catalogo if x["preco_final"] is None)
    print(f"  - Sem imagem_destaque: {sem_imagem}")
    print(f"  - Sem descricao_html: {sem_desc}")
    print(f"  - Sem preco_final: {sem_preco}")
    if catalogo:
        print(f"  - Exemplo 1 sku={catalogo[0]['sku']} preco_final={catalogo[0]['preco_final']} img={catalogo[0]['imagem_destaque'][:60]}...")
        if len(catalogo) > 1:
            print(f"  - Exemplo 2 sku={catalogo[1]['sku']} preco_final={catalogo[1]['preco_final']}")
    else:
        print("  - Nenhum produto coletado nesta execução.")

    print("\n[OK] Concluido.")
    client.close()

if __name__ == "__main__":
    main()
