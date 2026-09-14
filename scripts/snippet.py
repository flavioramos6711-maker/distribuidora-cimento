#!/usr/bin/env python3
from pathlib import Path

html = Path("scratch/333obra_home.html").read_text(encoding="utf-8", errors="replace")
idx = html.find("Cimentos_1_.png")
if idx != -1:
    print("=== SNIPPET 333OBRA CAROUSEL ===")
    print(html[idx-400:idx+400])
