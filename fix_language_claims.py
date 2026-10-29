"""Correct the language claims inherited from Creiden.

The site told visitors that Arabic was the team's native language and that
delivery came in "AR and EN", which is Creiden's Egyptian profile rather than a
Kigali company's. Rwanda's official languages are Kinyarwanda, English, French
and Swahili, and the site's own VUGA product works in Kinyarwanda.
"""
import glob

SWAPS = [
    ("Arabic is our native language, which matters a lot when your product ships to the Gulf "
     "or the wider Arab world. We design and build right-to-left interfaces, review Arabic "
     "content, and make sure your product feels natural to Arabic-speaking users, not just "
     "translated. This makes OrynTech a strong fit for bilingual Arabic and English platforms, "
     "from websites and mobile apps to e-learning systems. Our clients in Saudi Arabia, the UAE, "
     "and Qatar often work with us for exactly this reason.",
     "We also work in Kinyarwanda and French, which matters when your product ships to users "
     "across Rwanda and the wider East African region. We design and build multilingual "
     "interfaces and review local-language content, so your product reads naturally to the "
     "people using it rather than feeling translated. This makes OrynTech a strong fit for "
     "multilingual platforms, from websites and mobile apps to e-learning systems."),

    (">Delivery in both languages</dt>", ">Delivery languages</dt>"),
    (">AR and EN</dd>", ">English &amp; Kinyarwanda</dd>"),
    ('\\"Delivery in both languages\\"', '\\"Delivery languages\\"'),
    ('\\"AR and EN\\"', '\\"English and Kinyarwanda\\"'),
    ('"availableLanguage": ["ar", "en"]', '"availableLanguage": ["en", "rw"]'),
]

total = touched = 0
for page in sorted(glob.glob("**/*", recursive=True)):
    if not page.endswith((".html", ".json", ".js")):
        continue
    text = open(page, encoding="utf-8", errors="ignore").read()
    new, n = text, 0
    for old, repl in SWAPS:
        n += new.count(old)
        new = new.replace(old, repl)
    if n:
        open(page, "w", encoding="utf-8").write(new)
        total += n
        touched += 1
        print(f"{page}: {n}")

print(f"\n{total} replacements across {touched} files")
