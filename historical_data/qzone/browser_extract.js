// Run this in Firefox console while on your Qzone page (https://user.qzone.qq.com/382286/blog)
// IMPORTANT: Stop the previous run first by refreshing the page, then paste this.

(async function() {
    const QQ = "382286";
    const YEAR = new Date().getFullYear();

    function getGtk() {
        const match = document.cookie.match(/p_skey=([^;]+)/);
        if (!match) { console.error("p_skey not found!"); return 0; }
        let h = 5381;
        for (const c of match[1]) h += (h << 5) + c.charCodeAt(0);
        return h & 0x7FFFFFFF;
    }
    const gtk = getGtk();
    console.log("g_tk:", gtk);

    async function fetchRaw(url) {
        const resp = await fetch(url, { credentials: "include" });
        const buf = await resp.arrayBuffer();
        return new TextDecoder("gbk").decode(buf);
    }

    function parseJsonp(text) {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}") + 1;
        if (start === -1 || end === 0) return null;
        return JSON.parse(text.substring(start, end));
    }

    // Step 1: Fetch all blog list entries
    const allPosts = [];
    let pos = 0;
    const batch = 15;

    console.log("=== Step 1: Fetching blog list ===");
    while (true) {
        console.log("Fetching pos=" + pos + "...");
        const url = "https://user.qzone.qq.com/proxy/domain/b.qzone.qq.com/cgi-bin/blognew/get_abs?hostUin=" + QQ + "&uin=" + QQ + "&blogType=0&cateName=&cateHex=&statYear=" + YEAR + "&reqInfo=7&pos=" + pos + "&num=" + batch + "&sortType=0&source=0&rand=" + Math.random() + "&ref=qzone&g_tk=" + gtk + "&verbose=1";
        try {
            const text = await fetchRaw(url);
            const data = parseJsonp(text);
            if (!data || data.code !== 0 || !data.data || !data.data.list) {
                console.log("  Stopped.");
                break;
            }
            allPosts.push(...data.data.list);
            const total = data.data.totalNum || 0;
            console.log("  Got " + data.data.list.length + ". Total: " + allPosts.length + "/" + total);
            if (allPosts.length >= total || data.data.list.length < batch) break;
            pos += batch;
            await new Promise(r => setTimeout(r, 500));
        } catch(e) {
            console.error("Error at pos " + pos + ":", e);
            break;
        }
    }
    console.log("=== List done: " + allPosts.length + " posts ===");

    if (allPosts.length === 0) { console.error("No posts. Aborting."); return; }

    // Step 2: Fetch content as raw HTML
    console.log("=== Step 2: Fetching content (raw HTML) ===");
    const fullPosts = [];
    let okCount = 0, failCount = 0;
    for (let i = 0; i < allPosts.length; i++) {
        const post = allPosts[i];
        const blogId = post.blogId || post.blogid;
        const title = post.title || "untitled";
        try {
            const url = "https://user.qzone.qq.com/proxy/domain/b.qzone.qq.com/cgi-bin/blognew/blog_output_data?uin=" + QQ + "&blogid=" + blogId + "&styledm=qzonestyle.gtimg.cn&imgdm=qzs.qq.com&bdm=b.qzone.qq.com&mode=2&numperpage=15&timestamp=" + Date.now() + "&ref=qzone&g_tk=" + gtk;
            const raw = await fetchRaw(url);
            fullPosts.push({
                title: title,
                date: post.pubTime || post.pubtime || "",
                category: post.cate || "",
                blogId: blogId,
                listData: post,
                rawContent: raw
            });
            okCount++;
            if ((i + 1) % 20 === 0 || i === allPosts.length - 1) {
                console.log("[" + (i+1) + "/" + allPosts.length + "] OK:" + okCount + " FAIL:" + failCount + " — " + title);
            }
        } catch(e) {
            failCount++;
            console.error("[" + (i+1) + "/" + allPosts.length + "] FAILED: " + title, e);
            fullPosts.push({ title, date: post.pubTime || "", blogId, listData: post, error: String(e) });
        }
        await new Promise(r => setTimeout(r, 300));
    }

    // Step 3: Download
    console.log("=== Downloading " + fullPosts.length + " posts (OK:" + okCount + " FAIL:" + failCount + ") ===");
    const blob = new Blob([JSON.stringify(fullPosts, null, 2)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qzone_posts_382286.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log("=== Done! ===");
})();
