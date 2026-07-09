from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/post/"):
            self.path = "/post.html"
        return super().do_GET()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("localhost", 8888), Handler)
    print("Serving at http://localhost:8888")
    server.serve_forever()
