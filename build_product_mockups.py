"""Generate the case-study product mockups as on-brand SVG wireframes.

Replaces AI-generated and unrelated stock photography. Each mockup is an honest
schematic of the product UI drawn in the Creiden palette, so the case grid reads
as product work rather than stock imagery.

Run from the repo root:  python build_product_mockups.py
"""

from xml.sax.saxutils import escape

OUT_DIR = "assets/oryntech"

# Creiden brand palette, as defined in the compiled stylesheet.
BRAND = {
    "blue": "#00539f",
    "cyan": "#00c0f3",
    "green": "#00b27d",
    "teal": "#007484",
    "magenta": "#bd1a8d",
    "orange": "#fe6625",
    "yellow": "#ffcc32",
    "charcoal": "#36454f",
}
CANVAS = "#f4f7fa"
SURFACE = "#ffffff"
LINE = "#e2e8f0"
INK = "#36454f"
MUTED = "#64748b"
FAINT = "#f1f5f9"

W, H = 800, 500
FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif"


def text(x, y, body, size=13, weight="400", fill=INK, anchor="start"):
    return (
        f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" '
        f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{escape(body)}</text>'
    )


def card(x, y, w, h, fill=SURFACE, r=10, stroke=LINE):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="1"/>'


def bar(x, y, w, h, fill, r=4):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"/>'


def chrome(title, accent):
    """Window frame shared by every mockup."""
    return [
        f'<rect width="{W}" height="{H}" rx="16" fill="{CANVAS}"/>',
        f'<rect x="0.5" y="0.5" width="{W-1}" height="{H-1}" rx="16" fill="none" stroke="{LINE}"/>',
        f'<path d="M0 16a16 16 0 0 1 16-16h{W-32}a16 16 0 0 1 16 16v30H0z" fill="{SURFACE}"/>',
        f'<line x1="0" y1="46" x2="{W}" y2="46" stroke="{LINE}"/>',
        f'<circle cx="26" cy="23" r="5" fill="#e2e8f0"/>',
        f'<circle cx="44" cy="23" r="5" fill="#e2e8f0"/>',
        f'<circle cx="62" cy="23" r="5" fill="#e2e8f0"/>',
        bar(86, 14, 150, 18, FAINT, 9),
        text(96, 27, "oryntech", 11, "600", MUTED),
        text(252, 28, title, 13, "600", INK),
        f'<circle cx="{W-30}" cy="23" r="9" fill="{accent}" opacity="0.15"/>',
        f'<circle cx="{W-30}" cy="23" r="3.5" fill="{accent}"/>',
    ]


def sidebar(x, y, w, h, items, active, accent):
    out = [card(x, y, w, h)]
    ty = y + 34
    for i, item in enumerate(items):
        if i == active:
            out.append(bar(x + 12, ty - 16, w - 24, 30, accent))
            out.append(text(x + 24, ty + 4, item, 11.5, "600", "#ffffff"))
        else:
            out.append(text(x + 24, ty + 4, item, 11.5, "400", MUTED))
        ty += 38
    return out


def donut(cx, cy, r, pct, accent, label, value):
    import math
    circumference = 2 * math.pi * r
    filled = circumference * pct
    return [
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{FAINT}" stroke-width="14"/>',
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{accent}" stroke-width="14" '
        f'stroke-linecap="round" stroke-dasharray="{filled:.1f} {circumference:.1f}" '
        f'transform="rotate(-90 {cx} {cy})"/>',
        text(cx, cy + 2, value, 20, "700", INK, "middle"),
        text(cx, cy + 20, label, 10, "400", MUTED, "middle"),
    ]


def stat(x, y, w, label, value, accent, h=78):
    return [
        card(x, y, w, h),
        text(x + 18, y + 26, label, 9.5, "600", MUTED),
        text(x + 18, y + 56, value, 22, "700", accent),
    ]


# --------------------------------------------------------------------------
# One builder per product. Copy and metrics carry over from the originals.
# --------------------------------------------------------------------------

# Simplified MediaPipe-style hand landmarks, used for the VUGA camera panel.
WRIST = (244, 318)
FINGERS = {
    "thumb": [(206, 300), (178, 272), (158, 248), (144, 226)],
    "index": [(214, 246), (206, 206), (202, 180), (199, 158)],
    "middle": [(243, 240), (242, 196), (242, 168), (242, 146)],
    "ring": [(272, 245), (278, 202), (282, 176), (285, 155)],
    "pinky": [(299, 256), (310, 222), (316, 200), (320, 182)],
}


def hand_skeleton(accent):
    """Draw a recognisable hand: palm arch plus five jointed fingers."""
    bones, joints = [], [WRIST]

    def line(a, b):
        bones.append(
            f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}" '
            f'stroke="{accent}" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>'
        )

    for name, pts in FINGERS.items():
        line(WRIST, pts[0]) if name in ("thumb", "index", "pinky") else None
        for a, b in zip(pts, pts[1:]):
            line(a, b)
        joints.extend(pts)

    # Palm arch across the knuckles.
    knuckles = [FINGERS[f][0] for f in ("index", "middle", "ring", "pinky")]
    for a, b in zip(knuckles, knuckles[1:]):
        line(a, b)

    out = bones
    for x, y in joints:
        r = 6 if (x, y) == WRIST else 4.5
        out.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{accent}"/>')
    return out


def vuga(accent):
    out = chrome("VUGA — Real-Time Sign Language Translation", accent)
    out += [card(24, 66, 440, 300)]
    out += [bar(44, 86, 400, 260, "#eef2f6", 8)]
    out += [f'<rect x="44" y="86" width="400" height="260" rx="8" fill="none" stroke="{LINE}"/>']
    out += hand_skeleton(accent)
    out += [
        bar(60, 100, 92, 20, "#ffffff", 10),
        f'<circle cx="74" cy="110" r="4" fill="{BRAND["green"]}"/>',
        text(86, 114, "LIVE", 9.5, "700", INK),
    ]
    # Translation output
    out += [card(480, 66, 296, 300)]
    out += [text(504, 96, "Translation output", 12, "600", INK)]
    for i, (word, gloss) in enumerate([("MURAHO", "hello"), ("AMAKURU", "how are you")]):
        y = 118 + i * 86
        out += [card(504, y, 248, 68, FAINT, 8, FAINT)]
        out += [text(522, y + 28, word, 16, "700", accent)]
        out += [text(522, y + 50, gloss, 11, "400", MUTED)]
        # waveform
        for j in range(22):
            bh = 4 + (j * 7 % 17)
            out.append(bar(600 + j * 6, y + 34 - bh / 2, 3, bh, accent, 1.5))
    out += [text(504, 316, "Kinyarwanda · on-device inference", 11, "400", MUTED)]
    out += stat(24, 382, 240, "TRANSLATION LATENCY", "180 ms", accent, 90)
    out += stat(280, 382, 240, "GESTURE ACCURACY", "94.2%", accent, 90)
    out += stat(536, 382, 240, "VOCABULARY", "1,200 signs", accent, 90)
    return out


def inzira(accent):
    out = chrome("InziraInsight — Business Management Platform", accent)
    out += sidebar(24, 66, 170, 410,
                   ["Dashboard", "Orders", "Inventory", "Customers", "Analytics",
                    "Transactions", "Reports"], 0, accent)
    out += stat(210, 66, 182, "OPERATIONAL EFFICIENCY", "99.4%", accent)
    out += stat(404, 66, 182, "ACTIVE WORKFLOWS", "Connected", BRAND["green"])
    out += stat(598, 66, 178, "OPEN ORDERS", "1,240", INK)
    # Trend chart
    out += [card(210, 158, 566, 318)]
    out += [text(234, 188, "Revenue trend", 12, "600", INK)]
    out += [text(234, 208, "Rolling 12 months · RWF", 10.5, "400", MUTED)]
    pts = [(250, 420), (300, 392), (350, 404), (400, 352), (450, 368),
           (500, 310), (550, 324), (600, 282), (650, 296), (700, 248), (750, 232)]
    path = " ".join(f"{'M' if i == 0 else 'L'}{x} {y}" for i, (x, y) in enumerate(pts))
    out += [
        f'<defs><linearGradient id="inziraArea" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0%" stop-color="{accent}" stop-opacity="0.22"/>'
        f'<stop offset="100%" stop-color="{accent}" stop-opacity="0"/></linearGradient></defs>',
        f'<path d="{path} L750 440 L250 440 Z" fill="url(#inziraArea)"/>',
        f'<path d="{path}" fill="none" stroke="{accent}" stroke-width="3" '
        f'stroke-linecap="round" stroke-linejoin="round"/>',
    ]
    for x, y in pts[::2]:
        out.append(f'<circle cx="{x}" cy="{y}" r="4" fill="{SURFACE}" stroke="{accent}" stroke-width="2.5"/>')
    out += [f'<line x1="250" y1="444" x2="750" y2="444" stroke="{LINE}"/>']
    for i, month in enumerate(["Jan", "Mar", "May", "Jul", "Sep", "Nov"]):
        out.append(text(250 + i * 100, 462, month, 9.5, "400", MUTED, "middle"))
    return out


def gerayo(accent):
    out = chrome("Gerayo — Fleet Dispatch & Transit Operations", accent)
    out += [card(24, 66, 468, 410)]
    out += [text(48, 96, "Route & dispatch monitoring", 12, "600", INK)]
    # Route line with stops
    out += [
        f'<path d="M70 210 Q 180 160 250 250 T 440 330" fill="none" stroke="{accent}" '
        f'stroke-width="4" stroke-dasharray="9 7" stroke-linecap="round" opacity="0.55"/>'
    ]
    for cx, cy, fill in [(70, 210, accent), (250, 250, accent), (440, 330, BRAND["green"])]:
        out += [
            f'<circle cx="{cx}" cy="{cy}" r="11" fill="{fill}" opacity="0.18"/>',
            f'<circle cx="{cx}" cy="{cy}" r="6" fill="{fill}"/>',
        ]
    out += [
        text(70, 192, "Nyabugogo", 10, "600", MUTED, "middle"),
        text(250, 232, "Base", 10, "600", MUTED, "middle"),
        text(440, 312, "Musanze", 10, "600", MUTED, "middle"),
    ]
    out += [card(48, 372, 200, 80, FAINT, 8, FAINT)]
    out += [text(66, 400, "SCHEDULE ADHERENCE", 9.5, "600", MUTED)]
    out += [text(66, 430, "96.8%", 20, "700", accent)]
    out += [card(268, 372, 200, 80, FAINT, 8, FAINT)]
    out += [text(286, 400, "BUSES IN SERVICE", 9.5, "600", MUTED)]
    out += [text(286, 430, "42", 20, "700", INK)]
    # Live trips
    out += [card(508, 66, 268, 410)]
    out += [text(532, 96, "Live trips", 12, "600", INK)]
    trips = [
        ("Kigali — Musanze", "On route · 42 pax", BRAND["green"]),
        ("Kigali — Huye", "On route · 38 pax", BRAND["green"]),
        ("Kigali — Rubavu", "Boarding · departs 15:30", BRAND["yellow"]),
        ("Kigali — Rusizi", "Scheduled · 16:15", MUTED),
    ]
    for i, (route, status, dot) in enumerate(trips):
        y = 116 + i * 86
        out += [card(532, y, 220, 68, FAINT, 8, FAINT)]
        out += [f'<circle cx="552" cy="{y + 26}" r="4" fill="{dot}"/>']
        out += [text(566, y + 30, route, 12, "600", INK)]
        out += [text(552, y + 52, status, 10.5, "400", MUTED)]
    return out


def ishuri(accent):
    out = chrome("IshuriHub — School Operations & Student Records", accent)
    out += sidebar(24, 66, 176, 410,
                   ["School overview", "Students", "Attendance", "Gradebook",
                    "Timetable", "Parents", "Finance"], 0, accent)
    out += [card(216, 66, 560, 110)]
    out += [text(242, 102, "Unified student & academic records", 16, "700", INK)]
    out += [text(242, 128, "Attendance · gradebooks · parent communication · schedules",
                 11.5, "400", MUTED)]
    out += [bar(242, 142, 120, 24, accent, 6)]
    out += [text(302, 158, "Open term", 10.5, "600", "#ffffff", "middle")]
    # Attendance donut
    out += [card(216, 192, 270, 284)]
    out += [text(242, 222, "Daily attendance", 12, "600", INK)]
    out += donut(351, 330, 62, 0.93, accent, "present today", "93%")
    out += [text(351, 440, "1,418 of 1,525 learners", 10.5, "400", MUTED, "middle")]
    # Term reports
    out += [card(506, 192, 270, 284)]
    out += [text(532, 222, "Term reports", 12, "600", INK)]
    grades = [("S1", 0.86), ("S2", 0.72), ("S3", 0.81), ("S4", 0.68), ("S5", 0.9)]
    for i, (grade, pct) in enumerate(grades):
        y = 254 + i * 44
        out += [text(532, y + 12, grade, 10.5, "600", MUTED)]
        out += [bar(566, y, 180, 16, FAINT, 8)]
        out += [bar(566, y, int(180 * pct), 16, accent, 8)]
    return out


def kacci(accent):
    out = chrome("KACCI — Precision Agriculture & Field Records", accent)
    out += [card(24, 66, 360, 410)]
    out += [text(48, 96, "Farm activity & crop management", 12, "600", INK)]
    blocks = [
        ("Field season tracking", "Planting · cultivation · irrigation log"),
        ("Inventory & inputs", "Seed · fertiliser · tool supply"),
        ("Cooperative members", "2,840 registered smallholders"),
    ]
    for i, (head, sub) in enumerate(blocks):
        y = 116 + i * 104
        out += [card(48, y, 312, 86, FAINT, 8, FAINT)]
        out += [bar(48, y, 4, 86, accent, 2)]
        out += [text(72, y + 34, head, 13, "600", INK)]
        out += [text(72, y + 58, sub, 10.5, "400", MUTED)]
    # Yield chart
    out += [card(400, 66, 376, 410)]
    out += [text(424, 96, "Yield insights & market readiness", 12, "600", INK)]
    out += [text(424, 116, "Tonnes per hectare, by season", 10.5, "400", MUTED)]
    seasons = [("2021A", 0.42), ("2021B", 0.55), ("2022A", 0.49), ("2022B", 0.68),
               ("2023A", 0.74), ("2023B", 0.88)]
    base_y = 400
    for i, (season, pct) in enumerate(seasons):
        x = 440 + i * 54
        bh = int(230 * pct)
        out += [bar(x, base_y - bh, 30, bh, accent, 5)]
        out += [text(x + 15, base_y + 20, season, 9, "400", MUTED, "middle")]
    out += [f'<line x1="424" y1="{base_y + 4}" x2="752" y2="{base_y + 4}" stroke="{LINE}"/>']
    out += [text(424, 452, "Harvest volume trending up across six seasons", 10.5, "400", MUTED)]
    return out


PRODUCTS = {
    "vuga": (vuga, "magenta"),
    "inzira": (inzira, "blue"),
    "gerayo": (gerayo, "cyan"),
    "ishuri": (ishuri, "green"),
    "kacci": (kacci, "teal"),
}


def main():
    for name, (builder, accent_key) in PRODUCTS.items():
        body = "\n  ".join(builder(BRAND[accent_key]))
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
            f'width="{W}" height="{H}" role="img" fill="none">\n  {body}\n</svg>\n'
        )
        path = f"{OUT_DIR}/product-{name}.svg"
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(svg)
        print(f"wrote {path}  ({accent_key}, {len(svg)} bytes)")


if __name__ == "__main__":
    main()
