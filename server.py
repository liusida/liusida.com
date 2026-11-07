import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/post/"):
            # Mimic GitHub Pages: /post/<slug> -> post/<slug>.html if pre-rendered.
            slug = self.path.split("?", 1)[0][len("/post/"):].strip("/")
            if slug and os.path.isfile(os.path.join("post", slug + ".html")):
                self.path = f"/post/{slug}.html"
            else:
                self.path = "/post.html"
        return super().do_GET()


if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "9998"))
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"Serving at http://{host}:{port}")
    server.serve_forever()
