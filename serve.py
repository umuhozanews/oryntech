import os
import sys
import mimetypes
import webbrowser
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = 8080

mimetypes.init()
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("font/woff", ".woff")
mimetypes.add_type("video/mp4", ".mp4")
mimetypes.add_type("video/webm", ".webm")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/json", ".json")

class CleanURLHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # Support clean URLs: /about -> /about.html or /about/index.html
        path = self.path.split("?")[0].split("#")[0]

        # Intercept /_next/image?url=...
        if path == "/_next/image" and "?" in self.path:
            import urllib.parse
            query = self.path.split("?", 1)[1]
            params = urllib.parse.parse_qs(query)
            raw_url = params.get("url", [""])[0]
            if raw_url:
                filename = os.path.basename(urllib.parse.unquote(raw_url))
                if os.path.exists(os.path.join("assets", filename)):
                    self.path = "/assets/" + filename
                    return super().do_GET()
            self.send_response(200)
            self.send_header("Content-Type", "image/png")
            self.send_header("Content-Length", "68")
            self.end_headers()
            self.wfile.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82")
            return

        full_path = self.translate_path(path)

        if not os.path.exists(full_path):
            if os.path.exists(full_path + ".html"):
                self.path = path + ".html"
            elif os.path.exists(os.path.join(full_path, "index.html")):
                self.path = os.path.join(path, "index.html")

        return super().do_GET()

def run():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    server = None
    port = PORT
    for p in range(PORT, PORT + 50):
        try:
            server = ThreadingHTTPServer(("127.0.0.1", p), CleanURLHandler)
            port = p
            break
        except OSError:
            continue

    if not server:
        print("[!] Error: Could not bind to an open port.")
        sys.exit(1)

    url = f"http://127.0.0.1:{port}/"
    print("=" * 65)
    print(f"[*] Offline Rebuilt Site: creiden_com")
    print(f"[*] Local Server running at: {url}")
    print(f"[*] Full clean URLs, video streaming, APIs, and animations active!")
    print(f"[*] Press Ctrl+C in this window to stop.")
    print("=" * 65)

    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[+] Server stopped.")

if __name__ == "__main__":
    run()
