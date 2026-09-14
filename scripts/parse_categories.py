#!/usr/bin/env python3
from pathlib import Path
import re

html = Path("scratch/333obra_home.html").read_text(encoding="utf-8", errors="replace")
matches = re.findall(r'<img[^>]+>', html, re.IGNORECASE)
for m in matches:
    if "media/catalog/category/" in m:
        src_m = re.search(r'src=["\']([^"\']+)["\']', m)
        alt_m = re.search(r'alt=["\']([^"\']+)["\']', m)
        src = src_m.group(1) if src_m else ""
        alt = alt_m.group(1) if alt_m else ""
        print(f"{alt:35} -> {src}")
