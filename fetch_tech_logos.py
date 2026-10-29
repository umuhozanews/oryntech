"""Fetch the tech-stack brand logos that were never captured from the source site.

The logos already present (e.g. assets/Tech_2F28-anthropic.svg) are Simple Icons
glyphs with the brand colour applied as the root `fill`. This fetches the same
glyphs for the missing entries and writes them under the same naming scheme, so
the existing markup resolves without further edits.

Run from the repo root:  python fetch_tech_logos.py
"""

import os
import re
import urllib.error
import urllib.request

OUT_DIR = "assets"
CDN = "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/{slug}.svg"

# asset basename -> (Simple Icons slug, official brand hex)
LOGOS = {
    "Tech_2F14-typescript": ("typescript", "#3178C6"),
    "Tech_2F16-redis": ("redis", "#FF4438"),
    "Tech_2F17-graphql": ("graphql", "#E10098"),
    "Tech_2F20-swift": ("swift", "#F05138"),
    "Tech_2F21-kotlin": ("kotlin", "#7F52FF"),
    "Tech_2F22-expo": ("expo", "#000020"),
    "Tech_2F23-firebase": ("firebase", "#DD2C00"),
    "Tech_2F24-supabase": ("supabase", "#3FCF8E"),
    "Tech_2F25-sentry": ("sentry", "#362D59"),
    "Tech_2F26-python": ("python", "#3776AB"),
    "Tech_2F29-langchain": ("langchain", "#1C3C3C"),
    "Tech_2F31-kafka": ("apachekafka", "#231F20"),
    "Tech_2F32-airflow": ("apacheairflow", "#017CEE"),
    "Tech_2F33-dbt": ("dbt", "#FF694B"),
    "Tech_2F34-bigquery": ("googlebigquery", "#669DF6"),
    "Tech_2F35-snowflake": ("snowflake", "#29B5E8"),
    "Tech_2F36-metabase": ("metabase", "#509EE3"),
    "Tech_2F37-fastapi": ("fastapi", "#009688"),
    "Tech_2F38-stripe": ("stripe", "#635BFF"),
    "Tech_2F41-woocommerce": ("woocommerce", "#96588A"),
    "Tech_2F47-kubernetes": ("kubernetes", "#326CE5"),
    "Tech_2F48-terraform": ("terraform", "#844FBA"),
    "Tech_2F49-figma": ("figma", "#F24E1E"),
    "Tech_2F50-go": ("go", "#00ADD8"),
}


def fetch(slug):
    req = urllib.request.Request(CDN.format(slug=slug), headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8")


def main():
    written, failed, skipped = 0, [], 0

    for name, (slug, hex_colour) in LOGOS.items():
        path = os.path.join(OUT_DIR, f"{name}.svg")
        if os.path.exists(path):
            skipped += 1
            continue
        try:
            svg = fetch(slug)
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
            failed.append((name, slug, exc))
            continue

        # Match the convention of the logos already in the repo.
        if "fill=" in svg.split(">", 1)[0]:
            svg = re.sub(r'(<svg[^>]*?)fill="[^"]*"', rf'\1fill="{hex_colour}"', svg, count=1)
        else:
            svg = svg.replace("<svg", f'<svg fill="{hex_colour}"', 1)

        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(svg)
        written += 1
        print(f"  {name}.svg  <- {slug}  {hex_colour}")

    print(f"\nwritten {written}, already present {skipped}, failed {len(failed)}")
    for name, slug, exc in failed:
        print(f"  FAILED {name} (slug '{slug}'): {exc}")


if __name__ == "__main__":
    main()
