#!/usr/bin/env python3
import json, csv
from pathlib import Path
from collections import Counter

JSON_PATH = Path("data/catalogo_refinado_final.json")
CSV_PATH = Path("data/catalogo_refinado_final.csv")

def main():
    if not JSON_PATH.exists():
        print(f"ERRO: {JSON_PATH} não encontrado. Rode refinar_catalogo_5280.py primeiro.")
        return
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    print(f"Total produtos únicos: {len(data)}")
    if not (5000 <= len(data) <= 6500):
        print(f"AVISO: fora da faixa esperada 5000-6500")
    else:
        print("OK: dentro da faixa 5000-6500")

    # Distribuição
    cnt = Counter(p.get("categoria_mestre_slug","?") for p in data)
    print("\nDistribuição por categoria (14 mestres):")
    for slug, qtd in cnt.most_common():
        print(f"  {slug:25} {qtd:4d}")
    # Verifica 14 categorias presentes
    esperadas = ["cimentos","argamassas","rejuntes","impermeabilizantes","areia-e-pedra","cal-e-gesso","aco-e-ferragens","tijolos-e-blocos","telhas-e-coberturas","materiais-hidraulicos","materiais-eletricos","tintas-e-pintura","madeiras-e-esquadrias","ferramentas-e-epis"]
    faltando = [s for s in esperadas if s not in cnt]
    if faltando:
        print(f"AVISO: categorias sem produtos: {faltando}")
    else:
        print("OK: todas as 14 categorias mestres têm produtos")

    # Checagem duplicatas SKU
    skus = [p.get("sku") for p in data]
    dup = len(skus) - len(set(skus))
    print(f"\nDuplicatas por SKU: {dup} (esperado 0) - {'OK' if dup==0 else 'FALHA'}")

    # Checagem campos críticos
    sem_img = sum(1 for p in data if not p.get("imagem_destaque") or "placeholder" in p.get("imagem_destaque",""))
    sem_desc = sum(1 for p in data if not p.get("descricao_html") or len(p.get("descricao_html","")) < 20)
    sem_preco = sum(1 for p in data if p.get("preco_final") is None)
    print(f"Sem imagem_destaque: {sem_img} - {'OK' if sem_img==0 else 'FALHA'}")
    print(f"Sem descricao_html: {sem_desc}")
    print(f"Sem preco_final: {sem_preco}")

    # Conferência 5 produtos de controle (por SKU quando possível)
    print("\nConferência 5 produtos de controle:")
    controles = [
        ("1012", "Fita para Reparo Multiuso Vedacit", "impermeabilizantes"),
        ("1008-99", "Impermeabilizante Tecplus Top 18Kg", "impermeabilizantes"),
        ("202517", "Cimento Votoran 50Kg", "cimentos"),
        ("8972", "Argamassa AC-II", "argamassas"),
        ("51110", "Tubo PVC 100mm Esgoto", "materiais-hidraulicos"),
    ]
    # Normaliza para busca
    import unicodedata, re
    def norm(s): 
        s=unicodedata.normalize("NFD", s)
        s="".join(c for c in s if unicodedata.category(c)!="Mn")
        return s.lower()
    for sku_busca, nome_busca, cat_esperada in controles:
        # busca por SKU exato primeiro
        encontrados = [p for p in data if p.get("sku") == sku_busca]
        if not encontrados:
            encontrados = [p for p in data if p.get("sku","").startswith(sku_busca) or sku_busca in p.get("sku","")]
        if not encontrados:
            encontrados = [p for p in data if norm(nome_busca) in norm(p.get("name",""))]
        if encontrados:
            p = min(encontrados, key=lambda x: len(x.get("name","")))
            got = p.get("categoria_mestre_slug")
            preco = p.get("preco_final")
            status = "OK" if got==cat_esperada else f"FALHA (got {got})"
            preco_ok = ""
            if cat_esperada=="cimentos" and preco:
                try:
                    pf=float(preco)
                    if 34 <= pf <= 38:
                        preco_ok="preço OK (~R$34-38)"
                    else:
                        preco_ok=f"preço {pf} fora faixa R$34-38"
                except: pass
            print(f"  '{p['name'][:55]}' sku={p['sku']} -> {got} esperado {cat_esperada} [{status}] {preco} {preco_ok}")
        else:
            print(f"  '{nome_busca}' (SKU {sku_busca}) -> NÃO ENCONTRADO")

    # Valida CSV
    if CSV_PATH.exists():
        with open(CSV_PATH, encoding="utf-8") as f:
            reader = list(csv.DictReader(f))
            print(f"\nCSV: {len(reader)} linhas (deve bater com JSON {len(data)}) - {'OK' if len(reader)==len(data) else 'FALHA'}")
            # verifica cabeçalho
            print(f"CSV colunas: {reader[0].keys() if reader else 'vazio'}")
    else:
        print(f"CSV não encontrado: {CSV_PATH}")

    print("\nRelatório concluído.")

if __name__ == "__main__":
    main()
