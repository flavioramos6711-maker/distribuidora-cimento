#!/usr/bin/env python3
"""Insere reviews nos produtos que ainda não têm (paginação via content-range)."""
import time, random, datetime, sys
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

def supa_headers(key):
    return {"apikey": key, "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"}

def main():
    env = load_env()
    url = (env.get("NEXT_PUBLIC_SUPABASE_URL") or "https://sdafczehznywoeqnfgph.supabase.co").rstrip("/")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or ""
    headers = supa_headers(key)
    client = httpx.Client(timeout=60, headers=headers)

    NOMES_BR = [
        "Carlos Eduardo", "Ana Paula", "Marcos Vinicius", "Fernanda Lima",
        "Roberto Silva", "Juliana Costa", "Diego Souza", "Patricia Mendes",
        "Lucas Oliveira", "Camila Ferreira", "Alexandre Santos", "Beatriz Rocha",
        "Rafael Gomes", "Larissa Pereira", "Thiago Alves", "Mariana Cardoso",
        "Bruno Martins", "Aline Ribeiro", "Gustavo Moura", "Vanessa Neves"
    ]
    COMENTARIOS = [
        "Produto de excelente qualidade. Chegou bem embalado e dentro do prazo.",
        "Muito satisfeito com a compra! Recomendo para todos.",
        "Produto conforme descrito. Otimo custo-beneficio.",
        "Boa qualidade, usamos na obra e o resultado foi otimo.",
        "Entrega rapida e produto original. Voltarei a comprar.",
        "Superou minhas expectativas. Produto resistente e de qualidade.",
        "Recomendo! Produto de primeira linha, sem defeitos.",
        "Tudo certo com o produto. Equipe de pedreiros aprovou.",
        "Excelente! Produto funciona perfeitamente para o que precisavamos.",
        "Muito bom. Produto com boa resistencia e acabamento perfeito.",
        "Qualidade garantida. Ja comprei outras vezes e nunca decepcionou.",
        "Produto original e de boa procedencia. Aprovado!",
        "Compra segura, produto exatamente como descrito na pagina.",
        "Otima relacao custo-beneficio. Usamos em obra grande sem problemas.",
        "Satisfeito com a qualidade e o prazo de entrega. Nota 10!"
    ]

    # ── 1) Descobre total real via content-range ───────────────────────────────
    print("Descobrindo total de produtos via content-range...")
    r = client.get(
        f"{url}/rest/v1/products?select=id&active=eq.true&limit=1",
        headers={**headers, "Prefer": "count=exact"}
    )
    cr = r.headers.get("content-range", "")
    # formato: "0-0/6342"
    try:
        total_produtos = int(cr.split("/")[-1])
    except Exception:
        total_produtos = None
    print(f"  content-range: {cr!r}  ->  total={total_produtos}")

    # ── 2) Busca IDs já com review ────────────────────────────────────────────
    print("Buscando product_ids que já têm review...")
    ids_com_review = set()
    offset = 0
    PAGE = 1000
    while True:
        r = client.get(
            f"{url}/rest/v1/reviews?select=product_id&limit={PAGE}&offset={offset}",
            headers=headers
        )
        batch = r.json() if r.status_code == 200 else []
        if not batch:
            break
        ids_com_review.update(row["product_id"] for row in batch)
        if len(batch) < PAGE:
            break
        offset += PAGE
        if offset % 5000 == 0:
            print(f"  ...lidos {offset} reviews")
    print(f"  Produtos com review existente: {len(ids_com_review)}")

    # ── 3) Busca TODOS os IDs de produtos com paginação robusta ───────────────
    print("Buscando todos os IDs de produtos...")
    all_ids = []
    offset = 0
    while True:
        r = client.get(
            f"{url}/rest/v1/products?select=id&active=eq.true&limit={PAGE}&offset={offset}",
            headers={**headers, "Prefer": "count=exact"}
        )
        batch = r.json() if r.status_code == 200 else []
        if not batch:
            break
        all_ids.extend(row["id"] for row in batch)
        # usa content-range para saber se chegou ao fim
        cr2 = r.headers.get("content-range", "")
        try:
            fim = int(cr2.split("/")[0].split("-")[1])
            tot = int(cr2.split("/")[1])
            print(f"  offset={offset} batch={len(batch)} range={cr2}")
            if fim + 1 >= tot:
                break
        except Exception:
            if len(batch) < PAGE:
                break
        offset += PAGE
    print(f"Total de IDs coletados: {len(all_ids)}")

    # ── 4) Filtra apenas sem review ───────────────────────────────────────────
    sem_review = [pid for pid in all_ids if pid not in ids_com_review]
    print(f"Produtos sem review: {len(sem_review)}")

    if not sem_review:
        print("[OK] Todos os produtos já têm review. Nada a fazer.")
        client.close()
        return

    # ── 5) Gera e insere reviews ──────────────────────────────────────────────
    now = datetime.datetime.utcnow()
    reviews = []
    for pid in sem_review:
        for _ in range(random.randint(3, 5)):
            reviews.append({
                "product_id": pid,
                "customer_name": random.choice(NOMES_BR),
                "rating": random.choice([4, 4, 5, 5, 5]),
                "comment": random.choice(COMENTARIOS),
                "approved": True,
                "created_at": (now - datetime.timedelta(days=random.randint(1, 180))).isoformat()
            })
    print(f"Reviews a inserir: {len(reviews)}")

    total_ok = 0
    for i in range(0, len(reviews), 500):
        chunk = reviews[i:i+500]
        r = client.post(
            f"{url}/rest/v1/reviews",
            json=chunk,
            headers={**headers, "Prefer": "return=minimal"}
        )
        if r.status_code in (200, 201, 204):
            total_ok += len(chunk)
            print(f"  chunk {i//500+1}: {len(chunk)} ok - total {total_ok}/{len(reviews)}")
        else:
            print(f"  chunk {i//500+1} ERRO {r.status_code}: {r.text[:300]}")
        time.sleep(0.2)

    print(f"\n[OK] Reviews inseridas: {total_ok}/{len(reviews)}")

    # ── 6) Contagem final ──────────────────────────────────────────────────────
    r = client.get(
        f"{url}/rest/v1/reviews?select=id&limit=1",
        headers={**headers, "Prefer": "count=exact"}
    )
    cr_final = r.headers.get("content-range", "?")
    print(f"Total de reviews no banco: {cr_final.split('/')[-1]}")
    client.close()

if __name__ == "__main__":
    main()
