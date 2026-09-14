#!/usr/bin/env python3
import sys, re
from pathlib import Path
import httpx

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def check():
    r = httpx.get("https://www.333obra.com.br", headers=headers, follow_redirects=True, timeout=20)
    print("Status:", r.status_code, "URL:", r.url)
    html = r.text

    # Salva o HTML para inspeção se necessário
    Path("scratch/333obra_home.html").write_text(html, encoding="utf-8", errors="replace")

    # Procura imagens de categorias / banners
    img_matches = re.findall(r'<img[^>]+>', html, re.IGNORECASE)
    print(f"Total img tags: {len(img_matches)}")
    found = []
    for tag in img_matches:
        src = ""
        alt = ""
        m1 = re.search(r'src=["\']([^"\']+)["\']', tag)
        if m1: src = m1.group(1)
        m2 = re.search(r'data-src=["\']([^"\']+)["\']', tag)
        if m2 and not src: src = m2.group(1)
        m3 = re.search(r'alt=["\']([^"\']+)["\']', tag)
        if m3: alt = m3.group(1)
        
        found.append((alt, src))

    print("\nImagens encontradas na Home do 333obra:")
    for alt, src in found:
        if src.startswith("http") or src.startswith("/"):
            print(f"ALT: {alt!r} -> {src}")

if __name__ == "__main__":
    check()
