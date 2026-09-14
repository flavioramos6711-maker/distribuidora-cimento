#!/usr/bin/env python3
import json, re, unicodedata
from pathlib import Path
from collections import defaultdict

def normalize(s):
    if not s: return ""
    s=unicodedata.normalize("NFD", s)
    s="".join(c for c in s if unicodedata.category(c)!="Mn")
    s=s.lower()
    s=re.sub(r"\s+", " ", s)
    s=re.sub(r"[^a-z0-9 ]+", " ", s)
    return s.strip()

def extrair_atributos(nome):
    n=normalize(nome)
    # extrai cor, peso, tamanho para manter variações
    attrs=[]
    for cor in ["cinza escuro","cinza claro","branco","bege","preto","azul","verde","vermelho","amarelo","marrom","grafite"]:
        if cor in n: attrs.append(cor)
    m=re.search(r"(\d+\s*kg)", n)
    if m: attrs.append(m.group(1).replace(" ",""))
    m=re.search(r"(\d+\s*mm)", n)
    if m: attrs.append(m.group(1).replace(" ",""))
    m=re.search(r"(\d+\s*w)", n)
    if m: attrs.append(m.group(1).replace(" ",""))
    return " ".join(sorted(set(attrs)))

src=Path("data/catalogo_333obra.json")
data=json.loads(src.read_text(encoding="utf-8"))
print(f"Original: {len(data)}")

# backup
Path("data/backup_catalogo_53874.json").write_text(src.read_text(encoding="utf-8"), encoding="utf-8")

grupos=defaultdict(list)
for p in data:
    nome=p.get("name") or ""
    marca=(p.get("categorias") or [{}])[0].get("name") if p.get("categorias") else ""
    # tenta pegar marca do campo brand se existir
    # usa sku base sem sufixo - mas vamos usar nome+marca+atributos
    key = normalize(nome) + "|" + normalize(str(p.get("sku") or "").split("-")[0])  # sku base?
    # melhor: nome normalizado + marca + atributos
    # vamos usar nome sem variação de vendedor: remove " - 1 Unidade" etc?
    nome_base = re.sub(r"\s*-\s*\d+\s*un.*$", "", normalize(nome))
    nome_base = re.sub(r"\s*\d+\s*-\s*\d+.*$", "", nome_base)
    attrs=extrair_atributos(nome)
    brand_norm=normalize(str(p.get("sku") or ""))  # fallback
    # tenta extrair marca do nome se tiver
    # usa categorias[0] como proxy de marca não, melhor usar sku prefix
    key2 = nome_base + "|" + attrs
    grupos[key2].append(p)

print(f"Grupos formados: {len(grupos)}")

# para cada grupo, mantém menor preco_final
refinado=[]
for key, lista in grupos.items():
    # filtra com preco_final válido
    validos=[x for x in lista if x.get("preco_final") is not None]
    if not validos:
        validos=lista
    # menor preço
    escolhido=min(validos, key=lambda x: float(x.get("preco_final") or 999999))
    # limpa descrição PageBuilder
    desc=escolhido.get("descricao_html") or ""
    # remove style tags e data-attributes
    desc=re.sub(r"<style.*?</style>", "", desc, flags=re.S|re.I)
    desc=re.sub(r"\sdata-[a-z-]+=\"[^\"]*\"", "", desc)
    desc=re.sub(r"\sstyle=\"[^\"]*\"", "", desc)
    # mantém só p,strong,ul,li,br
    # se ainda muito grande, corta
    if len(desc) > 3000:
        desc=desc[:3000]
    escolhido["descricao_html"]=desc
    # garante imagem destaque não placeholder
    img=escolhido.get("imagem_destaque") or ""
    if "placeholder" in img:
        gal=escolhido.get("imagens_galeria") or []
        for g in gal:
            if g and "placeholder" not in g:
                escolhido["imagem_destaque"]=g
                break
    refinado.append(escolhido)

print(f"Refinado (menor preço por grupo): {len(refinado)}")

# Se ainda >5280, pega os 5280 mais baratos? Ou mantém todos e deixa para o usuário?
# O público tem 5280, vamos limitar aos 5280 com menor preço global se ainda maior
if len(refinado) > 5280:
    refinado_sorted=sorted(refinado, key=lambda x: float(x.get("preco_final") or 999999))
    refinado=refinado_sorted[:5280]
    print(f"Cortado para 5280 mais baratos")

# Se ainda <5280, completa com próximos mais baratos do original?
print(f"Final: {len(refinado)} únicos")

# salva
Path("data/catalogo_333obra_refinado_5280.json").write_text(json.dumps(refinado, ensure_ascii=False, indent=2), encoding="utf-8")
# csv
import csv
with open("data/catalogo_333obra_refinado_5280.csv","w",newline="",encoding="utf-8") as f:
    w=csv.DictWriter(f, fieldnames=["sku","name","preco_regular","preco_final","imagem_destaque","categorias","url"])
    w.writeheader()
    for p in refinado:
        w.writerow({"sku":p.get("sku"),"name":p.get("name"),"preco_regular":p.get("preco_regular"),"preco_final":p.get("preco_final"),"imagem_destaque":p.get("imagem_destaque"),"categorias":" | ".join([c.get("name") for c in p.get("categorias") or []]),"url":p.get("url")})
print("Salvo data/catalogo_333obra_refinado_5280.json/csv")
# mostra 5 exemplos
for p in refinado[:5]:
    print(p["sku"], p["name"][:50], p["preco_final"])
