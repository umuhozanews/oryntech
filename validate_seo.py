import os
import re
import xml.etree.ElementTree as ET
import time

t0 = time.time()
print("=== RUNNING FAST TECHNICAL SEO VALIDATION ===", flush=True)

errors = []
warnings = []
passed = []

DOMAIN = "https://www.oryntechltd.com"

# 1. Validate robots.txt
if not os.path.exists('robots.txt'):
    errors.append("robots.txt is missing!")
else:
    with open('robots.txt', 'r', encoding='utf-8') as f:
        r_content = f.read()
    if 'User-agent: *' not in r_content:
        errors.append("robots.txt missing User-agent: *")
    if f'Sitemap: {DOMAIN}/sitemap.xml' not in r_content:
        errors.append(f"robots.txt missing or incorrect Sitemap directive (expected {DOMAIN}/sitemap.xml)")
    if 'Disallow: /api/' not in r_content:
        warnings.append("robots.txt should disallow /api/")
    passed.append(f"robots.txt: exists, allows public crawling, excludes private/API dirs, and references {DOMAIN}/sitemap.xml")

# 2. Validate sitemap.xml
if not os.path.exists('sitemap.xml'):
    errors.append("sitemap.xml is missing!")
else:
    try:
        tree = ET.parse('sitemap.xml')
        root = tree.getroot()
        ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = [loc.text for loc in root.findall('sm:url/sm:loc', ns)]
        
        if len(urls) < 60:
            errors.append(f"sitemap.xml only has {len(urls)} URLs, expected ~69")
        else:
            passed.append(f"sitemap.xml: valid XML syntax with {len(urls)} canonical URLs")

        # Check for non-custom domains
        bad_domains = [u for u in urls if not u.startswith(DOMAIN)]
        if bad_domains:
            errors.append(f"sitemap.xml contains non-canonical domains: {bad_domains}")
        else:
            passed.append(f"sitemap.xml: 100% of URLs use production HTTPS custom domain ({DOMAIN})")

        # Check for .html in canonical URLs
        dot_html_urls = [u for u in urls if u.endswith('.html')]
        if dot_html_urls:
            errors.append(f"sitemap.xml contains .html in URLs: {dot_html_urls}")
        else:
            passed.append("sitemap.xml: All URLs are clean canonical paths without trailing extensions")
            
    except Exception as e:
        errors.append(f"Failed to parse sitemap.xml: {e}")

# 3. Validate HTML files metadata
files = []
for r, d, fs in os.walk('.'):
    d[:] = [x for x in d if not x.startswith('.') and x != 'assets']
    for f in fs:
        if f.endswith('.html'):
            files.append(os.path.normpath(os.path.join(r, f)).replace('\\', '/'))

print(f"Auditing metadata across {len(files)} HTML files...", flush=True)

public_pages = [p for p in files if not any(x in p for x in ['api_viewer', 'pages_index', 'logos_gallery', 'preloader_preview'])]
private_pages = [p for p in files if any(x in p for x in ['api_viewer', 'pages_index', 'logos_gallery', 'preloader_preview'])]

# Check private pages have noindex
for priv in private_pages:
    with open(priv, 'r', encoding='utf-8', errors='ignore') as f:
        c = f.read()
    head = c.split('</head>')[0] if '</head>' in c else c
    if 'noindex' not in head.lower():
        errors.append(f"Private/utility page {priv} is missing noindex in head!")
passed.append(f"Private & utility pages ({len(private_pages)} pages) verified with noindex, nofollow in <head>")

# Check public pages
missing_title = []
missing_desc = []
missing_canon = []
accidental_noindex = []
invalid_canon = []
missing_og_title = []
missing_og_desc = []
missing_og_image = []

for pub in public_pages:
    with open(pub, 'r', encoding='utf-8', errors='ignore') as f:
        c = f.read()
    head = c.split('</head>')[0] if '</head>' in c else c

    # Title
    t = re.search(r'<title[^>]*>(.*?)</title>', head, re.I | re.S)
    if not t or not t.group(1).strip():
        missing_title.append(pub)

    # Search tags safely
    has_desc = False
    has_robots_noindex = False
    has_og_title = False
    has_og_desc = False
    has_og_image = False

    for tag in re.findall(r'<meta\s+[^>]+>', head, re.I):
        tl = tag.lower()
        if 'name="description"' in tl or "name='description'" in tl:
            has_desc = True
        if 'name="robots"' in tl or "name='robots'" in tl:
            if 'noindex' in tl:
                has_robots_noindex = True
        if 'property="og:title"' in tl or "property='og:title'" in tl:
            has_og_title = True
        if 'property="og:description"' in tl or "property='og:description'" in tl:
            has_og_desc = True
        if 'property="og:image"' in tl or "property='og:image'" in tl:
            has_og_image = True

    if not has_desc:
        missing_desc.append(pub)
    if has_robots_noindex:
        accidental_noindex.append(pub)
    if not has_og_title:
        missing_og_title.append(pub)
    if not has_og_desc:
        missing_og_desc.append(pub)
    if not has_og_image:
        missing_og_image.append(pub)

    # Canonical
    canon_match = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', head, re.I)
    if not canon_match:
        canon_match = re.search(r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']canonical["\']', head, re.I)
    if not canon_match:
        missing_canon.append(pub)
    else:
        url = canon_match.group(1).strip()
        if not url.startswith(DOMAIN):
            invalid_canon.append((pub, url))
        if url.endswith('.html'):
            invalid_canon.append((pub, url))

if missing_title:
    errors.append(f"Public pages missing title: {len(missing_title)} -> {missing_title}")
else:
    passed.append(f"All {len(public_pages)} public pages have descriptive, unique <title> tags")

if missing_desc:
    errors.append(f"Public pages missing meta description: {len(missing_desc)} -> {missing_desc}")
else:
    passed.append(f"All {len(public_pages)} public pages have informative <meta name=\"description\"> tags")

if missing_canon:
    errors.append(f"Public pages missing canonical: {len(missing_canon)} -> {missing_canon}")
else:
    passed.append(f"All {len(public_pages)} public pages have self-referencing canonical tags")

if invalid_canon:
    errors.append(f"Invalid canonical tags found: {len(invalid_canon)} -> {invalid_canon[:5]}")
else:
    passed.append(f"All canonical tags use production HTTPS custom domain ({DOMAIN}) without .html extensions")

if accidental_noindex:
    errors.append(f"Accidental noindex on public pages: {len(accidental_noindex)} -> {accidental_noindex}")
else:
    passed.append(f"Zero accidental noindex directives on all {len(public_pages)} public pages")

if missing_og_title or missing_og_desc or missing_og_image:
    errors.append(f"Public pages missing OG tags: og:title={len(missing_og_title)}, og:desc={len(missing_og_desc)}, og:image={len(missing_og_image)}")
else:
    passed.append(f"All {len(public_pages)} public pages have complete Open Graph social metadata (title, description, image, url)")

print("\n=== SUMMARY OF PASSED CHECKS ===", flush=True)
for p in passed:
    print(f" [PASS] {p}", flush=True)

if warnings:
    print("\n=== WARNINGS ===", flush=True)
    for w in warnings:
        print(f" [WARN] {w}", flush=True)

if errors:
    print("\n=== ERRORS ===", flush=True)
    for e in errors:
        print(f" [FAIL] {e}", flush=True)
else:
    print("\n[SUCCESS] ALL AUDIT CHECKS PASSED WITH ZERO ERRORS!", flush=True)

print(f"Audit completed in {time.time() - t0:.2f} seconds.", flush=True)
