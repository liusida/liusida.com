import json
import time
import os
import urllib.request
import urllib.parse

QQ = "382286"
COOKIE_FILE = os.path.join(os.path.dirname(__file__), "cookie.txt")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "posts")

with open(COOKIE_FILE) as f:
    raw = f.read().strip().strip('"')

COOKIES = raw


def get_gtk(p_skey):
    h = 5381
    for c in p_skey:
        h += (h << 5) + ord(c)
    return h & 0x7FFFFFFF


p_skey = ""
for part in COOKIES.split(";"):
    part = part.strip()
    if part.startswith("p_skey="):
        p_skey = part.split("=", 1)[1]
        break

GTK = get_gtk(p_skey)
print(f"g_tk = {GTK}")

HEADERS = {
    "Cookie": COOKIES,
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
    "Referer": f"https://user.qzone.qq.com/{QQ}/blog",
}

os.makedirs(OUTPUT_DIR, exist_ok=True)


def fetch_url(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_jsonp(text):
    """Strip JSONP callback wrapper to get raw JSON."""
    start = text.index("{")
    end = text.rindex("}") + 1
    return json.loads(text[start:end])


def fetch_blog_list(pos=0, num=30):
    url = (
        f"https://h5.qzone.qq.com/proxy/domain/b.qzone.qq.com/cgi-bin/blognew/get_abs?"
        f"hostUin={QQ}&blogType=0&cateName=&cateHex=&statYear=&reqInfo=7"
        f"&pos={pos}&num={num}&sortType=0&source=0&ref=qzone&g_tk={GTK}"
        f"&callback=callback"
    )
    text = fetch_url(url)
    data = parse_jsonp(text)
    return data


def fetch_blog_content(blog_id):
    url = (
        f"https://h5.qzone.qq.com/proxy/domain/b.qzone.qq.com/cgi-bin/blognew/blog_output_data?"
        f"uin={QQ}&blogid={blog_id}&styledm=qzonestyle.gtimg.cn&imgdm=qzs.qq.com"
        f"&bdm=b.qzone.qq.com&mode=2&numperpage=15&timestamp={int(time.time())}"
        f"&ref=qzone&g_tk={GTK}&callback=callback"
    )
    text = fetch_url(url)
    data = parse_jsonp(text)
    return data


all_posts = []
pos = 0
batch = 30

print("Fetching blog list...")
while True:
    print(f"  pos={pos}")
    data = fetch_blog_list(pos, batch)
    if data.get("code") != 0 and data.get("ret") != 0:
        print(f"  Error: {data}")
        break

    blog_list = data.get("data", {}).get("list", [])
    if not blog_list:
        break

    all_posts.extend(blog_list)
    total = data.get("data", {}).get("totalNum", 0)
    print(f"  got {len(blog_list)} posts (total so far: {len(all_posts)}/{total})")

    if len(all_posts) >= total:
        break
    pos += batch
    time.sleep(0.5)

print(f"\nTotal posts found: {len(all_posts)}")

with open(os.path.join(OUTPUT_DIR, "_index.json"), "w", encoding="utf-8") as f:
    json.dump(all_posts, f, ensure_ascii=False, indent=2)

print("\nFetching individual post content...")
for i, post in enumerate(all_posts):
    blog_id = post.get("blogId") or post.get("blogid")
    title = post.get("title", "untitled")
    date = post.get("pubtime", "")
    safe_title = "".join(c if c.isalnum() or c in " -_" else "_" for c in title)[:60]
    filename = f"{date}_{safe_title}.json" if date else f"{i:04d}_{safe_title}.json"

    filepath = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(filepath):
        print(f"  [{i+1}/{len(all_posts)}] skip (exists): {title}")
        continue

    print(f"  [{i+1}/{len(all_posts)}] {title}")
    try:
        content = fetch_blog_content(blog_id)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(content, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"    ERROR: {e}")

    time.sleep(0.3)

print("\nDone!")
