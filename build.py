# /// script
# requires-python = ">=3.10"
# dependencies = ["markdown-it-py[linkify]>=3", "mdit-py-plugins>=0.4"]
# ///
"""Pre-render posts to static HTML so search engines can index them.

posts/<slug>.md + data/posts.json  ->  post/<slug>.html  (served at /post/<slug>)
Also writes static post links into writing.html and generates sitemap.xml.

Run:  uv run build.py   (the git pre-commit hook does this automatically)
"""
import html
import json
import re
from pathlib import Path

from markdown_it import MarkdownIt
from mdit_py_plugins.dollarmath import dollarmath_plugin

ROOT = Path(__file__).resolve().parent
SITE = "https://liusida.com"
MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()


def math_passthrough(content, opts):
    # Keep TeX as text with its delimiters so MathJax renders it in the browser.
    d = "$$" if opts.get("display_mode") else "$"
    return html.escape(f"{d}{content}{d}", quote=False)


md = (
    MarkdownIt("commonmark", {"html": True, "linkify": True, "typographer": False})
    .enable(["table", "strikethrough", "linkify"])
    .use(dollarmath_plugin, renderer=math_passthrough)
)


def fmt_date(iso):
    y, m, d = (int(x) for x in iso.split("-"))
    return f"{MONTHS[m - 1]} {d}, {y}"


def esc(s):
    return html.escape(s, quote=True)


def render_post(template, meta, body_html):
    slug, title = meta["slug"], meta["title"]
    url = f"{SITE}/post/{slug}"
    desc = meta.get("summary", "")
    head = (
        f"<title>{esc(title)} — Sida Liu</title>\n"
        f'    <meta name="description" content="{esc(desc)}">\n'
        f'    <link rel="canonical" href="{url}">\n'
        f'    <meta property="og:type" content="article">\n'
        f'    <meta property="og:title" content="{esc(title)}">\n'
        f'    <meta property="og:description" content="{esc(desc)}">\n'
        f'    <meta property="og:url" content="{url}">\n'
        f'    <meta property="article:published_time" content="{meta["date"]}">'
    )
    out = template.replace("<title>Sida Liu</title>", head, 1)
    out = out.replace('<h1 id="post-title"></h1>', f'<h1 id="post-title">{esc(title)}</h1>', 1)
    out = out.replace(
        '<time id="post-date"></time>',
        f'<time id="post-date" datetime="{meta["date"]}">{fmt_date(meta["date"])}</time>', 1)
    out = out.replace(
        '<div id="post-content"></div>',
        f'<div id="post-content" data-prerendered>\n{body_html}</div>', 1)
    return out


def static_list(posts):
    items = []
    for p in posts:
        items.append(
            f'<a class="post-card" href="/post/{p["slug"]}" data-theme="{esc(p.get("theme", ""))}">'
            f'<div class="post-card-row"><span class="post-card-title">{esc(p["title"])}</span>'
            f'<time class="post-card-date">{fmt_date(p["date"])}</time></div>'
            f'<p class="post-card-summary">{esc(p.get("summary", ""))}</p></a>')
    return "\n".join(items)


def main():
    posts = json.loads((ROOT / "data/posts.json").read_text())
    template = (ROOT / "post.html").read_text()
    for marker in ("<title>Sida Liu</title>", '<h1 id="post-title"></h1>',
                   '<time id="post-date"></time>', '<div id="post-content"></div>'):
        assert marker in template, f"post.html template missing: {marker}"

    outdir = ROOT / "post"
    outdir.mkdir(exist_ok=True)
    expected = set()
    for meta in posts:
        src = ROOT / "posts" / f"{meta['slug']}.md"
        if not src.exists():
            print(f"warning: no markdown for {meta['slug']}")
            continue
        page = render_post(template, meta, md.render(src.read_text()))
        dst = outdir / f"{meta['slug']}.html"
        expected.add(dst.name)
        if not dst.exists() or dst.read_text() != page:
            dst.write_text(page)
    for stale in outdir.glob("*.html"):
        if stale.name not in expected:
            stale.unlink()

    # Static links inside #post-list (script.js clears and re-renders them).
    w = ROOT / "writing.html"
    text = w.read_text()
    new = re.sub(r'(<div class="post-list" id="post-list">).*?(</div>\s*</section>)',
                 lambda m: f"{m.group(1)}\n{static_list(posts)}\n            {m.group(2)}",
                 text, count=1, flags=re.S)
    assert new != text or static_list(posts) in text, "could not find #post-list in writing.html"
    w.write_text(new)

    # Sitemap: main pages, research notes, posts.
    urls = [(f"{SITE}/", None)]
    for page in ("research-notes.html", "writing.html", "projects.html",
                 "journey.html", "bookshelf.html"):
        if (ROOT / page).exists():
            urls.append((f"{SITE}/{page}", None))
    for note in sorted((ROOT / "research-notes").glob("*/index.html")):
        if not note.parent.name.startswith("_"):
            urls.append((f"{SITE}/research-notes/{note.parent.name}/", None))
    for p in posts:
        if (outdir / f"{p['slug']}.html").exists():
            urls.append((f"{SITE}/post/{p['slug']}", p["date"]))
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, lastmod in urls:
        lm = f"<lastmod>{lastmod}</lastmod>" if lastmod else ""
        lines.append(f"  <url><loc>{esc(loc)}</loc>{lm}</url>")
    lines.append("</urlset>\n")
    (ROOT / "sitemap.xml").write_text("\n".join(lines))
    print(f"built {len(expected)} posts, sitemap with {len(urls)} urls")


if __name__ == "__main__":
    main()
