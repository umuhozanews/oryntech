"""Site-wide health check: broken links, JSON-LD validity, branding residue."""
import glob
import html as html_mod
import json
import os
import re
from collections import Counter
from urllib.parse import unquote, urlsplit

SITE = "https://www.oryntechltd.com/"
DEAD = re.compile(r'<script[^>]*type="text/disabled-framework"[^>]*>.*?</script>', re.S)
SCRIPT = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.S)
TAG = re.compile(r"<[^>]+>")
LD = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.S)
REF = re.compile(r'(?:src|href)="([^"]+)"')

pages = sorted(glob.glob("**/*.html", recursive=True))

broken, remote_missing = [], Counter()
ld_total = ld_bad = ld_creiden = 0
visible_creiden = Counter()
dupe_org = []

for page in pages:
    raw = open(page, encoding="utf-8", errors="ignore").read()
    live = DEAD.sub("", raw)
    base = os.path.dirname(page)

    # --- local link targets ---
    for url in REF.findall(live):
        url = html_mod.unescape(url)
        if url.startswith(SITE):
            rel = urlsplit(url).path.lstrip("/")
            if rel and not os.path.exists(unquote(rel)):
                remote_missing[rel.split("/")[0]] += 1
            continue
        if re.match(r"^(?:[a-z]+:|//|#)", url) or not url:
            continue
        target = unquote(urlsplit(url).path)
        if not target:
            continue
        cand = os.path.normpath(os.path.join(base, target)) if not target.startswith("/") \
            else os.path.normpath(target.lstrip("/"))
        if not os.path.exists(cand) and not os.path.exists(cand + ".html"):
            broken.append((page, url))

    # --- structured data ---
    orgs = 0
    for block in LD.findall(raw):
        ld_total += 1
        try:
            data = json.loads(block)
        except Exception:
            ld_bad += 1
            continue
        if "creiden" in block.lower():
            ld_creiden += 1
        nodes = data["@graph"] if isinstance(data, dict) and "@graph" in data else [data]
        orgs += sum(1 for n in nodes if isinstance(n, dict) and n.get("@type") == "Organization")
    if orgs > 1:
        dupe_org.append(page)

    # --- visible branding residue ---
    text = TAG.sub(" ", SCRIPT.sub(" ", live))
    for word in re.findall(r"Creiden|Alexandria|Sidi Gaber|Port Said", text):
        visible_creiden[word] += 1

print(f"pages scanned                 {len(pages)}")
print(f"broken local refs             {len(broken)}")
for p, u in broken[:10]:
    print(f"    {p} -> {u}")
print(f"missing absolute-URL targets  {dict(remote_missing)}")
print(f"JSON-LD blocks                {ld_total}  (unparseable {ld_bad}, naming creiden {ld_creiden})")
print(f"pages with >1 Organization    {len(dupe_org)}")
print(f"visible branding residue      {dict(visible_creiden)}")
