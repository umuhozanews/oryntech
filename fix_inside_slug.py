"""Rename the /en/inside-creiden route to /en/inside-oryntech.

It is the site's real About page - linked from the nav on 140 pages - so the
Creiden name sits in the most-visited URL on the site. The page content is
already fully rebranded; only the slug and the references to it need changing.
"""
import glob
import os
import re
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

RENAMES = [
    ("en/inside-creiden.html", "en/inside-oryntech.html"),
    ("en/inside-creiden", "en/inside-oryntech"),
    ("api/responses/api_8_en_inside-creiden.json",
     "api/responses/api_8_en_inside-oryntech.json"),
]

for src, dst in RENAMES:
    if os.path.exists(src):
        subprocess.run(["git", "mv", src, dst], check=True)
        print(f"renamed {src} -> {dst}")

# Both the URL slug and the json filename form appear in links and fetch maps.
PAIRS = [
    ("inside-creiden", "inside-oryntech"),
    ("api_8_en_inside-creiden", "api_8_en_inside-oryntech"),
]

files = [p for ext in ("html", "json", "js", "xml", "txt")
         for p in glob.glob(f"**/*.{ext}", recursive=True)
         if ".git" not in p]

touched = total = 0
for path in files:
    try:
        original = open(path, encoding="utf-8", errors="ignore").read()
    except OSError:
        continue
    text = original
    hits = 0
    for old, new in PAIRS:
        hits += text.count(old)
        text = text.replace(old, new)
    if text != original:
        open(path, "w", encoding="utf-8", errors="ignore").write(text)
        touched += 1
        total += hits

print(f"\n{total} references rewritten across {touched} files")
