"""Retire Creiden-specific content and move the stale 'egypt' URLs to Rwanda.

The two egypt-slugged pages were already rewritten for Rwanda - 0 mentions of
Egypt in their copy, titles reading "... in Rwanda" - so only the URL and a few
labels still said Egypt. They are renamed rather than deleted. The ThemeForest
article is about Creiden's run as a theme author, so it goes.
"""
import glob
import os
import re
import shutil

RENAMES = [
    ("software-development-company-egypt", "software-development-company-rwanda"),
    ("contracting-a-software-company-in-egypt", "contracting-a-software-company-in-rwanda"),
]

LABELS = [
    ("Software Development in Egypt", "Software Development in Rwanda"),
    ("Contracting a Software Company in Egypt", "Contracting a Software Company in Rwanda"),
    ("Written by an Egyptian firm that invoices abroad.",
     "Written by a Rwandan firm that invoices abroad."),
    ("softwareDevelopmentEgypt", "softwareDevelopmentRwanda"),
    ("egypt-why-creiden-heading", "rwanda-why-oryntech-heading"),
]

DOOMED = "seven-years-on-themeforest"

TEXT_EXT = (".html", ".json", ".js", ".xml", ".txt", ".css")


def text_files():
    for p in glob.glob("**/*", recursive=True):
        if os.path.isfile(p) and p.endswith(TEXT_EXT):
            yield p


# --- 1. remove the ThemeForest article -------------------------------------
removed = []
for p in sorted(glob.glob(f"**/*{DOOMED}*", recursive=True), key=len, reverse=True):
    if os.path.isdir(p):
        shutil.rmtree(p)
    else:
        os.remove(p)
    removed.append(p)
print("deleted:", *removed, sep="\n  ")

# Strip its entries out of the crawl index and the sitemap.
for p in ["pages_index.html", "sitemap.xml"]:
    if not os.path.exists(p):
        continue
    text = open(p, encoding="utf-8", errors="ignore").read()
    if p.endswith(".xml"):
        new = re.sub(rf"\s*<url>(?:(?!</url>).)*{DOOMED}(?:(?!</url>).)*</url>", "", text, flags=re.S)
    else:
        new = re.sub(rf"\s*<(div|li|tr)\b(?:(?!</\1>).)*{DOOMED}(?:(?!</\1>).)*</\1>", "", text, flags=re.S)
    if new != text:
        open(p, "w", encoding="utf-8").write(new)
        print(f"pruned {DOOMED} entries from {p}")

# --- 2. rewrite slugs and labels inside every text file ---------------------
changed = 0
for p in text_files():
    text = open(p, encoding="utf-8", errors="ignore").read()
    new = text
    for old, repl in RENAMES + LABELS:
        new = new.replace(old, repl)
    if new != text:
        open(p, "w", encoding="utf-8").write(new)
        changed += 1
print(f"\nrewrote references in {changed} files")

# --- 3. move the files and directories themselves ---------------------------
for old, repl in RENAMES:
    for p in sorted(glob.glob(f"**/*{old}*", recursive=True), key=len, reverse=True):
        dest = os.path.join(os.path.dirname(p), os.path.basename(p).replace(old, repl))
        if p != dest:
            os.rename(p, dest)
            print(f"moved {p} -> {dest}")
