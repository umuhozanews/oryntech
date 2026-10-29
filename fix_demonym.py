"""Repair the 'Egyptian' -> 'Rwandaian' find/replace slip. The demonym is 'Rwandan'."""
import glob

SWAPS = [("Rwandaian", "Rwandan"), ("rwandaian", "rwandan"), ("RWANDAIAN", "RWANDAN")]

total = pages = 0
for page in sorted(glob.glob("**/*", recursive=True)):
    if not page.endswith((".html", ".json", ".js")):
        continue
    text = open(page, encoding="utf-8", errors="ignore").read()
    new = text
    n = 0
    for old, repl in SWAPS:
        n += new.count(old)
        new = new.replace(old, repl)
    if n:
        open(page, "w", encoding="utf-8").write(new)
        total += n
        pages += 1

print(f"fixed {total} occurrences across {pages} files")
