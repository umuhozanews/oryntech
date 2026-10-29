"""Strip Creiden's track-record claims out of the copy.

"15+ years", "since 2011", "400+ projects", "15+ countries", "five continents"
and the 98%/350+ figures are all Creiden's, so each sentence is rewritten to
stand on its own rather than carry a number we cannot stand behind.
"""
import glob

SWAPS = [
    # Author bios
    ("is a trusted tech partner, empowering businesses since 2011. With 400+ projects "
     "delivered across 15+ countries, we specialize",
     "is a trusted tech partner. We specialize"),
    ("He has spent 15+ years building software products with clients and partners across 15+ countries.",
     "He builds software products with clients and partners across a range of industries."),

    # Footer tagline
    ("Custom web, mobile, and AI products built to last. 15+ years, 400+ shipped projects, 15+ countries.",
     "Custom web, mobile, and AI products built to last."),

    # Map section
    ("Over 15 years, we've built for governments, enterprises, and platform builders on five continents. "
     "<b>Select a pin to see what we delivered.</b>",
     "We build for governments, enterprises and platform builders, from our base in Kigali."),
    ("Over 15 years, we've built for governments, enterprises, and platform builders on five continents.",
     "We build for governments, enterprises and platform builders, from our base in Kigali."),

    # Service FAQ answers
    ("OrynTech has built for the web since 2011, with 15+ years of experience, 400+ projects, "
     "and clients in 15+ countries. We work with",
     "OrynTech builds web platforms for clients in Rwanda and abroad. We work with"),
    ("We have delivered 350+ web platforms across 12 industries, and we keep a 98% client retention "
     "rate after launch because we stay involved long after the first release.",
     "We stay involved long after the first release."),
    ("OrynTech is a mobile app development company with 15+ years of experience, 400+ projects, "
     "and clients in 15+ countries.",
     "OrynTech is a mobile app development company building iOS, Android and cross-platform apps."),
    ("OrynTech is an ecommerce development company with 15+ years of experience and 400+ projects.",
     "OrynTech is an ecommerce development company building digital commerce platforms."),
    ("We have shipped mobile apps for 15+ years across 400+ projects in 15+ countries.",
     "We have shipped mobile apps across a wide range of projects."),
    ("Over 15+ years, we have delivered 400+ projects for clients in 15+ countries.",
     "We have delivered projects for clients in Rwanda and abroad."),

    # Partnership / staffing copy
    ("We have worked as all three over 15+ years and 400+ projects.", "We have worked as all three."),
    ("We point to 400+ projects across 15+ countries because shipped work says more than a sales deck.",
     "We point to shipped work because it says more than a sales deck."),
    ("With 15+ years of experience and 400+ projects behind us, we focus on what works in production, "
     "not on demos.",
     "We focus on what works in production, not on demos."),
    ("backed by 15+ years of building products and 400+ delivered projects.",
     "backed by senior engineers who have shipped production software."),
    ("Every team member comes backed by 15+ years of building real products at OrynTech.",
     "Every team member comes backed by real product experience at OrynTech."),
    ("bring 15+ years of product-building experience to every recommendation.",
     "bring real product-building experience to every recommendation."),
    ("Fifteen years of helping companies scale capacity without scaling their hiring overhead.",
     "Helping companies scale capacity without scaling their hiring overhead."),

    # Founding-date claims
    ("Fifteen years of shipping for clients we never share a city with",
     "Shipping for clients we never share a city with"),
    ("We have been a software development company in Rwanda since 2011, working out of Kigali",
     "We are a software development company in Rwanda, working out of Kigali"),
    ("OrynTech is a software development company based in Kigali, Rwanda, and we have been here "
     "since we were founded in 2011.",
     "OrynTech is a software development company based in Kigali, Rwanda."),
    ("most of our work runs remotely with clients across 15+ countries.",
     "most of our work runs remotely."),
    ("We have been building custom platforms since 2011, for clients in Rwanda, the Gulf, Europe, "
     "and North America.",
     "We build custom platforms for clients in Rwanda and abroad."),
    ("We have built learning platforms for 15+ years, and the pattern is consistent.",
     "We have built learning platforms, and the pattern is consistent."),
    ("that has invoiced clients in Europe, North America, and the Gulf since 2011,",
     "that invoices clients abroad,"),

    # Grammar slip left by the earlier rebrand
    ("an Rwandan", "a Rwandan"),
    ("An Rwandan", "A Rwandan"),
]

total = 0
touched = 0
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

print(f"{total} replacements across {touched} files")
