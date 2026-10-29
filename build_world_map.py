"""Draw the world map that the disabled framework script used to render.

The map panel ships pin markup but no continents: creiden.com drew them in the
browser from world-atlas TopoJSON, and that code never runs in this static
mirror, so the section rendered as an empty box. The TopoJSON itself was
captured under api/responses, so the outlines can be baked straight into the
SVG using the projection the pins already use.
"""
import glob
import json
import re
import statistics

ATLAS = "api/responses/api_1_npm_world-atlas_2_countries-110m_json.json"
DEAD = re.compile(r'<script[^>]*type="text/disabled-framework"[^>]*>.*?</script>', re.S)
KIGALI_LAT, KIGALI_LNG = -1.9441, 30.0619

# Projection: lifted from the original pin coordinates (see solve_projection).
# Latitude is exactly linear; longitude is linear across the band the map uses.
A, B = 2.40000, 415.90000
C, D = -3.01120, 260.85480


def decode(topo):
    """Minimal TopoJSON -> rings decoder (delta-encoded arcs, quantised)."""
    tx, ty = topo["transform"]["translate"]
    sx, sy = topo["transform"]["scale"]
    arcs = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx
            y += dy
            pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)

    def ring(idxs):
        out = []
        for i in idxs:
            pts = arcs[~i][::-1] if i < 0 else arcs[i]
            out.extend(pts if not out else pts[1:])
        return out

    polys = []
    for geom in topo["objects"]["countries"]["geometries"]:
        if geom.get("id") == "010":  # Antarctica, below the panel's useful area
            continue
        shapes = [geom["arcs"]] if geom["type"] == "Polygon" else geom.get("arcs", [])
        for shape in shapes:
            for idxs in shape:
                polys.append(ring(idxs))
    return polys


def split_antimeridian(ring):
    """Cut rings where they jump the dateline, so they don't streak across the map."""
    pieces, cur = [], [ring[0]]
    for prev, pt in zip(ring, ring[1:]):
        if abs(pt[0] - prev[0]) > 180:
            pieces.append(cur)
            cur = []
        cur.append(pt)
    pieces.append(cur)
    return pieces


def path_d(polys):
    parts = []
    for ring in polys:
        for piece in split_antimeridian(ring):
            pts = [(A * lng + B, C * lat + D) for lng, lat in piece]
            # Drop sub-pixel noise so the markup stays small.
            simple = [pts[0]]
            for p in pts[1:]:
                if abs(p[0] - simple[-1][0]) > 0.35 or abs(p[1] - simple[-1][1]) > 0.35:
                    simple.append(p)
            if len(simple) < 3:
                continue
            parts.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in simple) + "Z")
    return "".join(parts)


topo = json.load(open(ATLAS, encoding="utf-8"))
d = path_d(decode(topo))
print(f"world path: {len(d)} chars")

LAYER = (f'<path d="{d}" fill="#4a5a66" fill-opacity="0.55" fill-rule="evenodd" '
         f'stroke="#64748b" stroke-opacity="0.35" stroke-width="0.4"></path>')

x_k, y_k = A * KIGALI_LNG + B, C * KIGALI_LAT + D
print(f"Kigali pin -> ({x_k:.1f}, {y_k:.1f})")

RECT = re.compile(r'<rect fill="transparent" height="522" width="900"></rect>')
PIN = re.compile(r'(<g aria-label="Kigali, Rwanda, Headquarters".*?</g>)', re.S)

for page in sorted(glob.glob("**/*.html", recursive=True)):
    raw = open(page, encoding="utf-8", errors="ignore").read()
    if 'aria-label="World map showing' not in DEAD.sub("", raw):
        continue
    group = '<g id="world-landmass">' + LAYER + "</g>"
    if "world-landmass" in raw:
        new = re.sub(r'<g id="world-landmass">.*?</g>', lambda _: group, raw, flags=re.S)
        n = "replaced"
    else:
        new, n = RECT.subn(lambda m: m.group(0) + group, raw)
    # Keep the pin consistent with the projection used for the outlines.
    new = PIN.sub(lambda m: re.sub(r'c[xy]="[\d.]+"',
                                   lambda c: f'{c.group(0)[:2]}="{x_k:.4f}"' if c.group(0).startswith("cx")
                                   else f'cy="{y_k:.4f}"', m.group(1)), new)
    new = re.sub(r"transform-origin:[\d.]+px [\d.]+px",
                 f"transform-origin:{x_k:.4f}px {y_k:.4f}px", new)
    open(page, "w", encoding="utf-8").write(new)
    print(f"{page}: inserted landmass layer ({n} rect(s))")
