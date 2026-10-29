"""Reduce the world map to a single Kigali headquarters pin.

The map shipped Creiden's 14 markets with per-country project counts. Kigali's
position is derived from the map's own projection: latitude is exactly linear
(y = -3.0112*lat + 260.85 fits all 14 reference pins to under half a pixel) and
longitude is linear enough across the Africa/Europe band used here.
"""
import glob
import json
import re
import statistics

KIGALI_LAT, KIGALI_LNG = -1.9441, 30.0619

DEAD = re.compile(r'<script[^>]*type="text/disabled-framework"[^>]*>.*?</script>', re.S)
LINE = re.compile(r'<line class="WhyCreiden-module__[^"]*__dashLine".*?</line>', re.S)
PIN = re.compile(r'<g aria-label="[^"]*"[^>]*>\s*<circle class="WhyCreiden-module__[^"]*__pinPulse".*?</g>', re.S)


def solve(html):
    """Fit the projection from the pins already on the page."""
    m = re.search(r'\\"pins\\":\[(.*?)\]', html, re.S)
    pins = json.loads("[" + m.group(1).replace('\\"', '"') + "]")
    latlng = {p["name"]: (p["lat"], p["lng"]) for p in pins}
    coords = {g.group(1): (float(g.group(2)), float(g.group(3)))
              for g in re.finditer(r'<g aria-label="([^",]+), [^"]*"[^>]*>\s*<circle[^>]*cx="([\d.]+)" cy="([\d.]+)"', html)}
    rows = [(latlng[n], coords[n]) for n in coords if n in latlng]

    def fit(xs, ys):
        mx, my = statistics.mean(xs), statistics.mean(ys)
        a = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
        return a, my - a * mx

    c, d = fit([ll[0] for ll, _ in rows], [xy[1] for _, xy in rows])
    band = [(ll, xy) for ll, xy in rows if abs(ll[1]) < 60]
    a, b = fit([ll[1] for ll, _ in band], [xy[0] for _, xy in band])
    worst = max(abs(a * ll[1] + b - xy[0]) for ll, xy in band)
    return a, b, c, d, worst


HQ = ('<g aria-label="Kigali, Rwanda, Headquarters" class="cursor-pointer" role="button" tabindex="0">'
      '<circle class="WhyCreiden-module__sEQ2vG__pinPulse" cx="{x:.4f}" cy="{y:.4f}" fill="#00C0F3" '
      'fill-opacity="0.25" r="7" style="animation-duration:2.40s;transform-origin:{x:.4f}px {y:.4f}px"></circle>'
      '<circle cx="{x:.4f}" cy="{y:.4f}" fill="#00C0F3" fill-opacity="0.9" filter="url(#{uid}-glow-hq)" '
      'r="5" stroke="white" stroke-width="1.5"></circle></g>')

changed = 0
for page in sorted(glob.glob("**/*.html", recursive=True)):
    raw = open(page, encoding="utf-8", errors="ignore").read()
    if 'aria-label="World map showing' not in DEAD.sub("", raw):
        continue

    a, b, c, d, worst = solve(raw)
    x, y = a * KIGALI_LNG + b, c * KIGALI_LAT + d
    uid = re.search(r'filter id="([^"]*)-glow-hq"', raw).group(1)

    dead = [m.span() for m in DEAD.finditer(raw)]

    def live(m):
        return not any(lo <= m.start() < hi for lo, hi in dead)

    out, prev, placed, removed = [], 0, False, 0
    for m in sorted([m for m in LINE.finditer(raw) if live(m)] +
                    [m for m in PIN.finditer(raw) if live(m)], key=lambda m: m.start()):
        out.append(raw[prev:m.start()])
        if m.re is PIN and not placed:
            out.append(HQ.format(x=x, y=y, uid=uid))
            placed = True
        prev = m.end()
        removed += 1
    out.append(raw[prev:])
    new = "".join(out).replace("World map showing Creiden project locations",
                               "World map showing OrynTech's headquarters in Kigali, Rwanda")
    open(page, "w", encoding="utf-8").write(new)
    changed += 1
    print(f"{page}: Kigali at ({x:.1f}, {y:.1f}); removed {removed} elements; "
          f"longitude fit worst-case {worst:.1f}px")

print(f"\npages updated: {changed}")
