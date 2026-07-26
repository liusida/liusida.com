import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/post/"):
            self.path = "/post.html"
        return super().do_GET()


if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "9998"))
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"Serving at http://{host}:{port}")
    server.serve_forever()
