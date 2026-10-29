"""Render the default 1200x630 social-share image.

The mirror had no OG asset of its own - every page pointed at Creiden's
/creiden.jpg or /storage/... CDN paths, none of which exist here. This lays out
the card in HTML so it picks up the site's real Poppins faces and brand tokens,
then screenshots it with headless Chrome.
"""
import os
import shutil
import subprocess
import tempfile

OUT = "assets/oryntech/og-default.png"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

HTML = """<!doctype html>
<html><head><meta charset="utf-8"/>
<link href="FONTCSS" rel="stylesheet"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:1200px; height:630px; }
  body {
    font-family:'Poppins', sans-serif;
    background:
      radial-gradient(1100px 620px at 88% -18%, rgba(0,192,243,.30), transparent 62%),
      radial-gradient(760px 520px at 4% 108%, rgba(0,83,159,.55), transparent 60%),
      linear-gradient(135deg, #1e2a33 0%, #36454f 48%, #0d3f6b 100%);
    color:#fff;
    padding:74px 80px;
    display:flex; flex-direction:column; justify-content:space-between;
    align-items:flex-start;
    position:relative; overflow:hidden;
  }
  .grid {
    position:absolute; inset:0;
    background-image:
      linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
    background-size:60px 60px;
    mask-image:linear-gradient(115deg, #000 18%, transparent 72%);
  }
  .inner { position:relative; display:contents; }
  img.mark { height:52px; }
  h1 {
    font-size:76px; font-weight:700; line-height:1.07;
    letter-spacing:-.035em; max-width:17ch;
  }
  h1 em { font-style:normal; color:#00c0f3; }
  .foot { display:flex; align-items:center; gap:22px; }
  .foot p { font-size:23px; font-weight:400; color:rgba(255,255,255,.74); }
  .rule { width:66px; height:4px; border-radius:2px; background:#ffcc32; }
  .accent {
    position:absolute; right:-150px; bottom:-200px;
    width:520px; height:520px; border-radius:50%;
    border:50px solid rgba(0,192,243,.10);
  }
</style></head>
<body>
  <div class="grid"></div><div class="accent"></div>
  <div class="inner">
    <img class="mark" src="MARK"/>
    <h1>Software that <em>works</em> where it is used.</h1>
    <div class="foot"><span class="rule"></span><p>OrynTech &middot; Kigali, Rwanda</p></div>
  </div>
</body></html>
"""

root = os.path.abspath(".")
html = (HTML
        .replace("FONTCSS", "file:///" + os.path.join(root, "assets/style_2.css").replace("\\", "/"))
        .replace("MARK", "file:///" + os.path.join(root, "assets/oryntech/oryntech-logo-white.svg").replace("\\", "/")))

tmp = tempfile.mkdtemp(prefix="og-")
src = os.path.join(tmp, "og.html")
open(src, "w", encoding="utf-8").write(html)

subprocess.run([
    CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=1", "--window-size=1200,630",
    "--default-background-color=00000000",
    "--virtual-time-budget=4000",
    f"--screenshot={os.path.join(tmp, 'og.png')}",
    "file:///" + src.replace("\\", "/"),
], check=True, capture_output=True)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
shutil.copyfile(os.path.join(tmp, "og.png"), OUT)
shutil.rmtree(tmp, ignore_errors=True)

from PIL import Image
with Image.open(OUT) as im:
    print(f"{OUT}: {im.size[0]}x{im.size[1]}  {os.path.getsize(OUT)} bytes")
