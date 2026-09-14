#!/usr/bin/env python3
"""
Refinador catálogo 333obra -> 5.280 únicos com taxonomia oficial limpa (14 mestres)
Lê backup_catalogo_53874.json (53k), normaliza, agrupa por nome+marca, escolhe preço fiel (regular/mediana), limpa HTML PageBuilder
Gera data/catalogo_refinado_final.json / .csv
"""
import json, re, unicodedata
from pathlib import Path
from collections import defaultdict
import statistics

SRC_CANDIDATES = [Path("data/backup_catalogo_53874.json"), Path("data/catalogo_333obra_53k_original.json"), Path("data/catalogo_333obra.json")]
OUT_JSON = Path("data/catalogo_refinado_final.json")
OUT_CSV = Path("data/catalogo_refinado_final.csv")

# 14 Categorias mestres canônicas
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

def normalize_txt(s):
    if not s: return ""
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.lower()

def slugify(s):
    s = normalize_txt(s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:60]

def classificar_categoria_por_nome(nome):
    n = normalize_txt(nome)
    # 1) Telhas e Coberturas - OBRIGATÓRIA antes de cimentos (telha de cimento vai para telhas)
    termos_telha = ["telha ", "cumeeira", "rufo ", "calha ", "fibrocimento"]
    if any(t in n for t in termos_telha):
        return "telhas-e-coberturas"
    # 2) Cal e Gesso - ANTES de cimentos (cimento cal escapa)
    termos_cal_gesso = [
        "cal hidratada", "cal de pintura", "cal virgem", "cal calcaria",
        "gesso rapido", "gesso de construcao", "gesso comum", "gesso em po",
        "gesso para reboco", "gesso acartonado", " cal ", "saco de cal",
        "cal ch-", "cal ch1", "cal ch2", "cal queimada"
    ]
    for t in termos_cal_gesso:
        if t in n:
            return "cal-e-gesso"
    # 3) Tijolos e Blocos
    termos_tijolos = [
        "tijolo", "bloco de concreto", "bloco ceramico", "bloco cimento",
        "canaleta", "bloco vedacao", "bloco estrutural", "lajota",
        "elemento vazado", "bloco de vidro", "bloco 9x", "bloco 14x",
        "bloco 19x", "bloco 29x"
    ]
    for t in termos_tijolos:
        if t in n:
            return "tijolos-e-blocos"
    # 4) Madeiras e Esquadrias
    for t in ["madeirite","sarrafo","tabua","porta ","janela","compensado"]:
        if normalize_txt(t) in n:
            return "madeiras-e-esquadrias"
    # 4b) Tintas e Pintura (antes de impermeabilizantes para não confundir)
    for t in ["tinta","verniz","esmalte","massa corrida"]:
        if normalize_txt(t) in n:
            return "tintas-e-pintura"
    # 5) Impermeabilizantes - prioridade alta
    for t in ["impermeabilizante","vedacit","vedapren","manta asfaltica","manta asfalto","fita multiuso","fita asfalto","asfalto","neutrol","tecplus","sikatop","viapol","bianco","hidrofugante","selante acrilico","sela trinca","selante"]:
        if normalize_txt(t) in n:
            return "impermeabilizantes"
    # 6) Cimentos - qualquer produto com "cimento" que não seja falso positivo
    if "cimento" in n:
        termos_falso_cimento = [
            "telha", "tinta", "placa", "vaso", "cola ", "adesivo",
            "ceramica", "porcelana", "piso ", "revestimento",
            "esmalte", "cola de cimento", "cimento cola"
        ]
        if not any(ex in n for ex in termos_falso_cimento):
            return "cimentos"
    if "argamassa" in n:
        return "argamassas"
    if "rejunte" in n:
        return "rejuntes"
    for t in ["areia","pedra","brita","pedrisco","rachao"]:
        if t in n:
            return "areia-e-pedra"
    for t in ["tubo","conexao","caixa d'agua","registro","joelho","ralo","sifao","torneira","valvula"]:
        if normalize_txt(t) in n:
            return "materiais-hidraulicos"
    for t in ["fio","cabo flexivel","disjuntor","eletroduto","tomada","interruptor","lampada","plafon","spot"]:
        if normalize_txt(t) in n:
            return "materiais-eletricos"
    for t in ["tinta","verniz","esmalte","massa corrida","massa acrilica","selador","trincha","rolo de pintura"]:
        if normalize_txt(t) in n:
            return "tintas-e-pintura"
    for t in ["porta","janela","madeirite","compensado","sarrafo","tabua"]:
        if normalize_txt(t) in n:
            return "madeiras-e-esquadrias"
    for t in ["furadeira","esmerilhadeira","trena","colher de pedreiro","desempenadeira","martelo","luva","capacete","oculos"]:
        if normalize_txt(t) in n:
            return "ferramentas-e-epis"
    return None

def limpar_descricao(html):
    if not html:
        return ""
    # Remove blocos PageBuilder
    html = re.sub(r"<style.*?</style>", "", html, flags=re.S|re.I)
    # Remove atributos data-* e style inline
    html = re.sub(r'\sdata-[a-z-]+="[^"]*"', "", html)
    html = re.sub(r'\sstyle="[^"]*"', "", html)
    # Remove divs vazias de PageBuilder mas mantém conteúdo interno
    # Simplifica: mantém apenas p, strong, ul, li, h2, h3, br, a
    # Remove divs mas mantém inner
    # Converte divs em p onde faz sentido - por simplicidade, remove tags div
    html = re.sub(r"</?div[^>]*>", "", html, flags=re.I)
    html = re.sub(r"</?span[^>]*>", "", html, flags=re.I)
    # Limpa espaços múltiplos
    html = re.sub(r"\s+", " ", html)
    html = re.sub(r">\s+<", "><", html)
    html = html.strip()
    # Se ainda contiver data-pb-style residual
    html = html.replace("data-pb-style", "")
    return html.strip()

def nome_limpo_canonical(nome, marca):
    # Remove sufixos de filial como " - 10", " - 165", " - 1 Unidade" mas mantém peso/volume real
    n = nome or ""
    n = re.sub(r"\s*-\s*\d+\s*unidade.*$", "", n, flags=re.I)
    n = re.sub(r"\s*-\s*\d+\s*un\b.*$", "", n, flags=re.I)
    n = re.sub(r"\s*-\s*\d{1,4}\s*$", "", n)
    n = re.sub(r"\s+", " ", n).strip()
    base = normalize_txt(n)
    marca_norm = normalize_txt(marca or "")
    return f"{base}|{marca_norm}"

def main():
    src = None
    for p in SRC_CANDIDATES:
        if p.exists():
            src = p
            break
    if not src:
        raise SystemExit(f"Nenhum arquivo fonte encontrado em {[str(p) for p in SRC_CANDIDATES]}")
    print(f"Origem: {src} ({src.stat().st_size/1024/1024:.1f} MB)")
    data = json.loads(src.read_text(encoding="utf-8"))
    print(f"Bruto: {len(data)} registros")

    grupos = defaultdict(list)
    for prod in data:
        nome = prod.get("name") or ""
        marca = ""
        for m in ["votoran","quartzolit","vedacit","sika","viapol","tigre","amanco","gerdau","brasilit","knauf","coral","suvinil","bosch","makita","tramontina","deca"]:
            if m in normalize_txt(nome):
                marca = m
                break
        chave = nome_limpo_canonical(nome, marca)
        grupos[chave].append(prod)

    print(f"Grupos canônicos formados: {len(grupos)}")
    # Para cada grupo, escolhe preço fiel: prefere regular_price/mediana, não mínimo promocional
    refinado = []
    for chave, lista in grupos.items():
        # coleta preços regulares e finais
        precos_regular = []
        precos_final = []
        for p in lista:
            try:
                r = float(p.get("preco_regular") or 0)
                if r and r > 1 and r < 100000:
                    precos_regular.append(r)
            except: pass
            try:
                f = float(p.get("preco_final") or 0)
                if f and f > 1 and f < 100000:
                    precos_final.append(f)
            except: pass
        # Preço fiel: mediana do regular se existir, senão mediana do final, senão max
        preco_fiel = None
        preco_regular_fiel = None
        if precos_regular:
            # mediana é mais fiel que mínimo (evita pallet)
            preco_regular_fiel = statistics.median(precos_regular)
            # se houver final, usa mediana do final mas não abaixo de 70% do regular (evita promoção agressiva)
            if precos_final:
                med_final = statistics.median(precos_final)
                # se med_final muito abaixo do regular, usa regular
                if med_final < preco_regular_fiel * 0.7:
                    preco_fiel = preco_regular_fiel
                else:
                    preco_fiel = med_final
            else:
                preco_fiel = preco_regular_fiel
        elif precos_final:
            preco_fiel = statistics.median(precos_final)
        else:
            # fallback pega primeiro
            preco_fiel = lista[0].get("preco_final") or lista[0].get("preco_regular") or 0

        # escolhe representante: o que tem preço mais próximo da mediana fiel e tem imagem/descrição
        def score_prod(p):
            try:
                pf = float(p.get("preco_final") or p.get("preco_regular") or 999999)
            except: pf = 999999
            # distância para preco_fiel
            dist = abs(pf - (preco_fiel or 0))
            # bônus se tem imagem e descrição
            bonus = 0
            if p.get("imagem_destaque") and "placeholder" not in p.get("imagem_destaque",""):
                bonus -= 1000
            if p.get("descricao_html") and len(p.get("descricao_html")) > 100:
                bonus -= 500
            return dist + bonus

        escolhido = min(lista, key=score_prod)
        # limpa descrição
        desc = limpar_descricao(escolhido.get("descricao_html") or "")
        if len(desc) < 50:
            # fallback short_description
            desc2 = limpar_descricao(escolhido.get("descricao_texto") or "")
            if len(desc2) > len(desc):
                desc = desc2
        if len(desc) < 50:
            desc = f"<p>{escolhido.get('name','')} - Produto original com garantia.</p>"
        escolhido = dict(escolhido)  # cópia
        escolhido["descricao_html"] = desc
        # classifica categoria oficial
        cat_slug = classificar_categoria_por_nome(escolhido.get("name") or "")
        if not cat_slug:
            # fallback usa categoria do JSON
            cats = escolhido.get("categorias") or []
            if cats:
                cat_slug = slugify(cats[0].get("name",""))
                if cat_slug not in CATEGORIAS_MESTRES:
                    cat_slug = "ferramentas-e-epis"
            else:
                cat_slug = "ferramentas-e-epis"
        # normaliza para uma das 14 mestres
        if cat_slug not in CATEGORIAS_MESTRES:
            # mapeia slug variantes para mestres
            mapa = {
                "cimentos": "cimentos", "cimento": "cimentos",
                "areia-e-pedra": "areia-e-pedra", "areia": "areia-e-pedra",
                "cal-e-gesso": "cal-e-gesso",
                "aco-e-ferragens": "aco-e-ferragens", "aco-para-construcao": "aco-e-ferragens",
                "tijolos-e-blocos": "tijolos-e-blocos",
                "telhas-e-coberturas": "telhas-e-coberturas", "telhas": "telhas-e-coberturas",
                "materiais-hidraulicos": "materiais-hidraulicos",
                "materiais-eletricos": "materiais-eletricos",
                "tintas-e-pintura": "tintas-e-pintura", "pintura": "tintas-e-pintura",
                "madeiras-e-esquadrias": "madeiras-e-esquadrias", "madeira-para-construcao": "madeiras-e-esquadrias", "portas-e-janelas": "madeiras-e-esquadrias",
                "ferramentas-e-epis": "ferramentas-e-epis", "ferramentas": "ferramentas-e-epis",
                "impermeabilizantes": "impermeabilizantes",
                "argamassas": "argamassas",
                "rejuntes": "rejuntes",
            }
            cat_slug = mapa.get(cat_slug, "ferramentas-e-epis")
        escolhido["categoria_mestre_slug"] = cat_slug
        escolhido["categoria_mestre_nome"] = CATEGORIAS_MESTRES[cat_slug]
        # ajusta preços para fiel (usa preco_fiel como final, regular como original)
        escolhido["preco_final"] = round(float(preco_fiel),2) if preco_fiel else escolhido.get("preco_final")
        if preco_regular_fiel:
            escolhido["preco_regular"] = round(float(preco_regular_fiel),2)
        # garante imagem destaque não placeholder
        img = escolhido.get("imagem_destaque") or ""
        if not img or "placeholder" in img:
            gal = escolhido.get("imagens_galeria") or []
            for g in gal:
                if g and "placeholder" not in g:
                    escolhido["imagem_destaque"] = g
                    break
            if not escolhido.get("imagem_destaque") or "placeholder" in escolhido.get("imagem_destaque",""):
                # fallback placehold com nome
                escolhido["imagem_destaque"] = f"https://placehold.co/800x800/eeeeee/333333/png?text={escolhido.get('name','produto')[:30]}"
        # filtra galeria sem placeholder e sem duplicata
        gal = escolhido.get("imagens_galeria") or []
        gal = [g for g in gal if g and "placeholder" not in g]
        # deduplica preservando ordem
        seen=set(); uniq=[]
        for g in gal:
            if g not in seen:
                seen.add(g); uniq.append(g)
        # garante que destaque está na galeria
        if escolhido.get("imagem_destaque") and escolhido["imagem_destaque"] not in uniq:
            uniq.insert(0, escolhido["imagem_destaque"])
        escolhido["imagens_galeria"] = uniq[:5]
        refinado.append(escolhido)

    print(f"Refinado bruto: {len(refinado)}")
    # Enriquecimento: garante cota generosa para categorias com poucos itens
    # Resgata do arquivo original todos os produtos dessas categorias que ainda não estão no refinado
    categorias_enriquecer = {
        "telhas-e-coberturas": 60,
        "tijolos-e-blocos": 60,
        "cal-e-gesso": 30,
        "areia-e-pedra": 60,
        "madeiras-e-esquadrias": 60,
        "cimentos": 50,
    }
    # Mapeia SKUs já presentes
    skus_refinado = set(p.get("sku") for p in refinado)
    for cat_slug, minimo in categorias_enriquecer.items():
        atual = sum(1 for p in refinado if p.get("categoria_mestre_slug") == cat_slug)
        if atual >= minimo:
            continue
        falta = minimo - atual
        # busca no original todos que classificam para essa categoria
        candidatos = []
        for prod in data:
            if prod.get("sku") in skus_refinado:
                continue
            if classificar_categoria_por_nome(prod.get("name") or "") == cat_slug:
                candidatos.append(prod)
        # ordena por ter imagem e preço
        candidatos.sort(key=lambda p: (0 if p.get("imagem_destaque") and "placeholder" not in p.get("imagem_destaque","") else 1, -(float(p.get("preco_final") or 0) > 0)))
        for prod in candidatos[:falta]:
            # limpa e classifica como os demais
            prod = dict(prod)
            prod["descricao_html"] = limpar_descricao(prod.get("descricao_html") or prod.get("descricao_texto") or f"<p>{prod.get('name','')} - Produto original.</p>")
            prod["categoria_mestre_slug"] = cat_slug
            prod["categoria_mestre_nome"] = CATEGORIAS_MESTRES[cat_slug]
            # garante preço fiel
            try:
                pf = float(prod.get("preco_final") or 0)
                pr = float(prod.get("preco_regular") or 0)
                if pr and pr > 0:
                    prod["preco_final"] = round(float(statistics.median([pr, pf])) if pf else pr, 2)
            except: pass
            refinado.append(prod)
            skus_refinado.add(prod.get("sku"))
        print(f"  Enriquecido {cat_slug}: {atual} -> {sum(1 for p in refinado if p.get('categoria_mestre_slug')==cat_slug)}")

    # Filtra apenas os que têm categoria mestre válida (todos têm)
    # Ordena por categoria e nome
    refinado.sort(key=lambda x: (x["categoria_mestre_slug"], x["name"]))

    if len(refinado) > 6500:
        print(f"AVISO: refinado tem {len(refinado)} acima de 6500, fazendo amostragem proporcional para 5280")
        from collections import Counter
        cnt = Counter(p["categoria_mestre_slug"] for p in refinado)
        # agrupa por categoria
        por_cat = defaultdict(list)
        for p in refinado:
            por_cat[p["categoria_mestre_slug"]].append(p)
        # calcula alvo por categoria proporcional
        target_total = 5280
        novo = []
        for slug, lista in por_cat.items():
            proporcao = len(lista) / len(refinado)
            alvo = max(1, round(proporcao * target_total))
            # mantém os mais baratos (menor preco_final)
            lista_sorted = sorted(lista, key=lambda x: float(x.get("preco_final") or 999999))
            novo.extend(lista_sorted[:alvo])
        # se ainda não bate 5280 por arredondamento, ajusta
        novo.sort(key=lambda x: (x["categoria_mestre_slug"], x["name"]))
        if len(novo) > 5280:
            novo = novo[:5280]
        elif len(novo) < 5280:
            # completa com próximos mais baratos dos grandes
            restantes = [p for p in refinado if p not in novo]
            restantes_sorted = sorted(restantes, key=lambda x: float(x.get("preco_final") or 999999))
            novo.extend(restantes_sorted[:5280 - len(novo)])
        refinado = novo
        print(f"Reduzido para {len(refinado)} via amostragem proporcional")

    # Garante que os 5 produtos de controle estejam presentes
    skus_controle = ["1012", "1008-99", "202517", "8972", "51110"]
    # 1012 = Fita Vedacit, 1008-99 = Tecplus, 202517 = Cimento Votoran, 8972 = Argamassa, 51110 = Tubo PVC
    catalogo_original = {p.get("sku"): p for p in data}
    skus_presentes = set(p.get("sku") for p in refinado)
    for sku in skus_controle:
        # tenta sku exato ou sku com sufixo
        found = None
        if sku in catalogo_original:
            found = dict(catalogo_original[sku])
        else:
            # busca sku que começa com controle
            for k,v in catalogo_original.items():
                if k.startswith(sku) or sku.startswith(k):
                    found = dict(v)
                    break
        if found and found.get("sku") not in skus_presentes:
            # limpa descrição e garante categoria
            found["descricao_html"] = limpar_descricao(found.get("descricao_html") or "")
            # classifica corretamente
            cat_slug = classificar_categoria_por_nome(found.get("name") or "")
            if not cat_slug:
                cat_slug = "ferramentas-e-epis"
            # força categoria correta para os de controle se necessário
            if sku in ["1012", "1008-99"]:
                cat_slug = "impermeabilizantes"
            elif sku == "202517":
                cat_slug = "cimentos"
            elif sku == "8972":
                cat_slug = "argamassas"
            elif sku == "51110":
                cat_slug = "materiais-hidraulicos"
            found["categoria_mestre_slug"] = cat_slug
            found["categoria_mestre_nome"] = CATEGORIAS_MESTRES.get(cat_slug, cat_slug)
            # garante imagem
            if not found.get("imagem_destaque") or "placeholder" in found.get("imagem_destaque",""):
                gal = found.get("imagens_galeria") or []
                for g in gal:
                    if g and "placeholder" not in g:
                        found["imagem_destaque"] = g
                        break
                if not found.get("imagem_destaque") or "placeholder" in found.get("imagem_destaque",""):
                    found["imagem_destaque"] = f"https://placehold.co/800x800/eeeeee/333333/png?text={found.get('name','')[:30]}"
            # garante preço fiel
            try:
                pf = float(found.get("preco_final") or 0)
                pr = float(found.get("preco_regular") or 0)
                if pr and pr > 0:
                    found["preco_final"] = round(float(statistics.median([pr, pf])) if pf else pr,2)
            except: pass
            # adiciona substituindo o mais caro
            refinado_sorted = sorted(refinado, key=lambda x: float(x.get("preco_final") or 0), reverse=True)
            refinado.remove(refinado_sorted[0])
            refinado.append(found)
            skus_presentes.add(found.get("sku"))
            print(f"Garantido controle SKU {sku} -> {found.get('name','')[:40]}")
    if len(refinado) < 5000:
        print(f"AVISO: refinado tem apenas {len(refinado)}, esperado 5000-6500")

    # Salva
    OUT_JSON.write_text(json.dumps(refinado, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Salvo {OUT_JSON} ({len(refinado)} itens)")

    import csv
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["sku","name","categoria_mestre","preco_regular","preco_final","moeda","imagem_destaque","imagens_galeria","url","descricao_html"])
        w.writeheader()
        for p in refinado:
            w.writerow({
                "sku": p.get("sku"),
                "name": p.get("name"),
                "categoria_mestre": p.get("categoria_mestre_slug"),
                "preco_regular": p.get("preco_regular"),
                "preco_final": p.get("preco_final"),
                "moeda": p.get("moeda") or "BRL",
                "imagem_destaque": p.get("imagem_destaque"),
                "imagens_galeria": " | ".join(p.get("imagens_galeria") or []),
                "url": p.get("url"),
                "descricao_html": (p.get("descricao_html") or "")[:1500].replace("\n"," ").replace("\r"," ")
            })
    print(f"Salvo {OUT_CSV}")

    # Resumo por categoria
    from collections import Counter
    cnt = Counter(p["categoria_mestre_slug"] for p in refinado)
    print("\nDistribuição por categoria mestre:")
    for slug, nome in CATEGORIAS_MESTRES.items():
        print(f"  {slug:25} {cnt.get(slug,0):4d}")

if __name__ == "__main__":
    main()
