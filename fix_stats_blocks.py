"""Remove the stat blocks built on Creiden's track record.

The "Impact in Numbers" / "In numbers" bands are doubly broken: the figures are
Creiden's, and the count-up script never runs in this static mirror, so they
render a literal "0+" for every stat. The inherited client and partner lists go
with them.
"""
import glob
import re

DEAD = re.compile(r'<script[^>]*type="text/disabled-framework"[^>]*>.*?</script>', re.S)

STAT_LABELS = ["Projects delivered", "Countries served", "Building and running software"]
LIST_HEADINGS = ["Clients include", "Regional partners"]


def element_span(html, tag, start):
    """Span of the element opening at `start`, accounting for nesting."""
    open_re = re.compile(rf"<{tag}\b", re.I)
    close_re = re.compile(rf"</{tag}>", re.I)
    depth, pos = 0, start
    while pos < len(html):
        o = open_re.search(html, pos)
        c = close_re.search(html, pos)
        if c is None:
            return None
        if o and o.start() < c.start():
            depth += 1
            pos = o.end()
        else:
            depth -= 1
            pos = c.end()
            if depth == 0:
                return start, pos
    return None


def enclosing(html, tag, index):
    """Span of the nearest `tag` element that encloses `index`."""
    pos = index
    while True:
        s = html.rfind(f"<{tag}", 0, pos)
        if s == -1:
            return None
        span = element_span(html, tag, s)
        if span and span[0] <= index < span[1]:
            return span
        pos = s


def cut(html, spans):
    spans = sorted(set(spans))
    out, prev = [], 0
    for a, b in spans:
        if a < prev:
            continue
        out.append(html[prev:a])
        prev = b
    out.append(html[prev:])
    return "".join(out)


total = 0
for page in sorted(glob.glob("**/*.html", recursive=True)):
    html = open(page, encoding="utf-8", errors="ignore").read()
    dead = [m.span() for m in DEAD.finditer(html)]

    def live(i):
        return not any(a <= i < b for a, b in dead)

    spans, notes = [], []

    for m in re.finditer(r'<section aria-labelledby="stats-bar-heading"', html):
        if live(m.start()):
            span = element_span(html, "section", m.start())
            if span:
                spans.append(span)
                notes.append("stats band")

    for label in STAT_LABELS:
        for m in re.finditer(rf"<dt[^>]*>{re.escape(label)}</dt>", html):
            if not live(m.start()):
                continue
            span = enclosing(html, "div", m.start())
            if span:
                spans.append(span)
                notes.append(label)

    for heading in LIST_HEADINGS:
        for m in re.finditer(rf"<h3[^>]*>{re.escape(heading)}</h3>", html):
            if not live(m.start()):
                continue
            span = enclosing(html, "div", m.start())
            if span:
                spans.append(span)
                notes.append(heading)

    if spans:
        open(page, "w", encoding="utf-8").write(cut(html, spans))
        total += len(spans)
        print(f"{page}: removed {len(notes)} -> {', '.join(sorted(set(notes)))}")

print(f"\ntotal blocks removed: {total}")
