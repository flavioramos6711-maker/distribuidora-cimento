#!/usr/bin/env python3
"""Ativa flags de destaque, novidade e desconto distribuídos pelas 14 categorias para dar variedade máxima à vitrine."""
import sys, random
from pathlib import Path
import httpx

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

def load_env():
    env = {}
    p = Path(".env.local")
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"): continue
            if "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env

def main():
    env = load_env()
    url = (env.get("NEXT_PUBLIC_SUPABASE_URL") or "").rstrip("/")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or ""
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    client = httpx.Client(timeout=30, headers=headers)

    # Busca todas as 14 categorias ativas
    r_cat = client.get(f"{url}/rest/v1/categories?select=id,slug,name&active=eq.true&order=sort_order")
    cats = r_cat.json()
    print(f"Distribuindo variedade pelas {len(cats)} categorias...")

    total_featured = 0
    total_discount = 0
    total_new = 0

    for c in cats:
        cid = c["id"]
        slug = c["slug"]
        # Busca produtos ativos desta categoria
        rp = client.get(f"{url}/rest/v1/products?select=id,name,price,original_price&category_id=eq.{cid}&active=eq.true&limit=15")
        prods = rp.json() if rp.status_code == 200 else []
        if not prods: continue

        # Seleciona produtos para destaque, desconto e novos
        for i, p in enumerate(prods):
            pid = p["id"]
            price = float(p.get("price") or 0)
            update_data = {}

            if i in (0, 1, 2):
                update_data["is_featured"] = True
                total_featured += 1
            if i in (1, 3, 4) and price > 0:
                update_data["is_discount"] = True
                orig = float(p.get("original_price") or 0)
                if orig <= price:
                    update_data["original_price"] = round(price * random.choice([1.12, 1.15, 1.18, 1.25]), 2)
                total_discount += 1
            if i in (2, 5, 6):
                update_data["is_new"] = True
                total_new += 1

            if update_data:
                client.patch(f"{url}/rest/v1/products?id=eq.{pid}", json=update_data)

        print(f"  [OK] {slug:25}: configurados {min(len(prods), 7)} produtos")

    print(f"\nResumo:")
    print(f"  Total is_featured: {total_featured}")
    print(f"  Total is_discount: {total_discount}")
    print(f"  Total is_new: {total_new}")
    client.close()

if __name__ == "__main__":
    main()
