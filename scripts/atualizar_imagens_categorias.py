#!/usr/bin/env python3
"""Atualiza as 14 categorias com imagens reais de produtos representativos."""
import sys
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

CATEGORY_IMAGES = {
    "cimentos": "https://www.333obra.com.br/media/catalog/product/c/i/cimento_votoran_cp_ii_f_32_50kg_01.jpg",
    "argamassas": "https://www.333obra.com.br/media/catalog/product/a/r/argamassa_ac3_cinza_20kg_quartzolit_1.jpg",
    "rejuntes": "https://www.333obra.com.br/media/catalog/product/r/e/rejunte_resinado_cinza_outono_1kg_quartzolit_1.jpg",
    "impermeabilizantes": "https://www.333obra.com.br/media/catalog/product/v/e/vedacit_18l_1.jpg",
    "areia-e-pedra": "https://www.333obra.com.br/media/catalog/product/s/h/shared_image__1_.jpg",
    "cal-e-gesso": "https://www.333obra.com.br/media/catalog/product/c/a/cal_hidratada_ita_ch_i_20kg_1.jpg",
    "aco-e-ferragens": "https://www.333obra.com.br/media/catalog/product/v/e/vergalhao_gerdau_ca_50_10mm_12m.jpg",
    "tijolos-e-blocos": "https://www.333obra.com.br/media/catalog/product/b/l/bloco_concreto_estrutural_14x19x39_1.jpg",
    "telhas-e-coberturas": "https://www.333obra.com.br/media/catalog/product/t/e/telha_fibrocimento_ondulada_244x110_6mm_brasilit.jpg",
    "materiais-hidraulicos": "https://www.333obra.com.br/media/catalog/product/t/u/tubo_esgoto_pvc_100mm_6m_tigre.jpg",
    "materiais-eletricos": "https://www.333obra.com.br/media/catalog/product/c/a/cabo_flexivel_2_5mm_750v_azul_100m_sil.jpg",
    "tintas-e-pintura": "https://www.333obra.com.br/media/catalog/product/t/i/tinta_acrilica_fosco_branco_neve_18l_suvinil.jpg",
    "madeiras-e-esquadrias": "https://www.333obra.com.br/media/catalog/product/c/h/chapa_compensado_resinado_14mm_220x110.jpg",
    "ferramentas-e-epis": "https://www.333obra.com.br/media/catalog/product/c/a/capacete_seguranca_aba_frontal_branco_com_carneira.jpg",
}

def main():
    env = load_env()
    url = (env.get("NEXT_PUBLIC_SUPABASE_URL") or "").rstrip("/")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or ""
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    client = httpx.Client(timeout=30, headers=headers)

    print("Atualizando image_url das categorias no Supabase...")
    sucesso = 0
    for slug, img_url in CATEGORY_IMAGES.items():
        r = client.patch(
            f"{url}/rest/v1/categories?slug=eq.{slug}",
            json={"image_url": img_url}
        )
        if r.status_code in (200, 204):
            sucesso += 1
            print(f"  [OK] {slug:25} -> atualizado")
        else:
            print(f"  [ERRO] {slug:25} status {r.status_code}: {r.text}")

    print(f"\nFinalizado: {sucesso}/{len(CATEGORY_IMAGES)} categorias atualizadas com sucesso.")
    client.close()

if __name__ == "__main__":
    main()
