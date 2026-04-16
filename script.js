function toggleOrder(btn) {
    var container = btn.closest('article, section');
    var items = Array.from(container.querySelectorAll('.journey-chapter, .bookshelf-period'));
    var parent = items[0].parentNode;
    items.reverse().forEach(function (el) { parent.appendChild(el); });
    var isNewest = btn.dataset.order === 'newest';
    btn.dataset.order = isNewest ? 'oldest' : 'newest';
    btn.textContent = isNewest ? 'Oldest first \u2191' : 'Newest first \u2193';
}

(function () {
    'use strict';

    var THEMES = {
        'All': "Notes from the intersection of AI, philosophy, mathematics, and tinkering \u2014 written over the past decade as I tried to understand intelligence, reality, and the tools we build.",
        'AI and Cognition': "How do minds work, and can we build them? From probing LLM internals and the residual stream to embodied cognition and System 2 reasoning, these posts trace my evolving understanding of what intelligence actually is.",
        'Philosophy and Mathematics': "Is math invented or discovered? Does the external world exist? From Wolfram\u2019s computational universe to the detour of idealism, these are the big questions I keep circling back to.",
        'Book Reviews': "Notes on books that changed how I think \u2014 from Tegmark\u2019s mathematical universe to Chalmers\u2019 Reality+ to Seung\u2019s connectome.",
        'Technical Notes': "The hands-on stuff: CUDA programming, ESP32 hardware, search indexing, quantitative trading, and various tools I\u2019ve built or broken."
    };

    /* ---- Writing page ---- */

    async function loadWriting() {
        var filterBar = document.getElementById('filter-bar');
        var narrativeEl = document.getElementById('theme-narrative');
        var listEl = document.getElementById('post-list');
        if (!filterBar || !narrativeEl || !listEl) return;

        try {
            var res = await fetch('data/posts.json');
            if (!res.ok) return;
            var posts = await res.json();

            Object.keys(THEMES).forEach(function (theme) {
                var btn = document.createElement('button');
                btn.className = 'filter-pill' + (theme === 'All' ? ' active' : '');
                btn.textContent = theme;
                btn.setAttribute('data-theme', theme);
                btn.addEventListener('click', function () {
                    setFilter(theme);
                });
                filterBar.appendChild(btn);
            });

            narrativeEl.textContent = THEMES['All'];

            posts.forEach(function (p) {
                var card = document.createElement('a');
                card.className = 'post-card';
                card.href = 'post.html?slug=' + encodeURIComponent(p.slug);
                card.setAttribute('data-theme', p.theme);

                var row = document.createElement('div');
                row.className = 'post-card-row';

                var title = document.createElement('span');
                title.className = 'post-card-title';
                title.textContent = p.title;

                var date = document.createElement('span');
                date.className = 'post-card-date';
                date.textContent = formatDate(p.date);

                row.appendChild(title);
                row.appendChild(date);
                card.appendChild(row);

                if (p.summary) {
                    var summary = document.createElement('div');
                    summary.className = 'post-card-summary';
                    summary.textContent = p.summary;
                    card.appendChild(summary);
                }

                listEl.appendChild(card);
            });
        } catch (e) {
            console.error('Failed to load writing:', e);
        }
    }

    function setFilter(theme) {
        document.querySelectorAll('.filter-pill').forEach(function (p) {
            p.classList.toggle('active', p.getAttribute('data-theme') === theme);
        });
        var el = document.getElementById('theme-narrative');
        if (el) el.textContent = THEMES[theme] || '';

        document.querySelectorAll('.post-card').forEach(function (c) {
            if (theme === 'All' || c.getAttribute('data-theme') === theme) {
                c.classList.remove('hidden');
            } else {
                c.classList.add('hidden');
            }
        });
    }

    /* ---- Bookshelf page (expanded grid) ---- */

    async function loadBookshelfPage() {
        var container = document.getElementById('bookshelf-container');
        if (!container) return;

        try {
            var res = await fetch('data/books.json');
            if (!res.ok) return;
            var periods = await res.json();

            periods.forEach(function (period) {
                var section = document.createElement('div');
                section.className = 'bookshelf-period';

                var heading = document.createElement('h3');
                heading.textContent = period.period;
                section.appendChild(heading);

                var grid = document.createElement('div');
                grid.className = 'bookshelf-grid';

                period.books.forEach(function (book) {
                    var entry = document.createElement('div');
                    entry.className = 'book-entry';

                    var img = document.createElement('img');
                    img.src = book.img;
                    img.alt = book.title;
                    img.loading = 'lazy';
                    entry.appendChild(img);

                    var body = document.createElement('div');
                    body.className = 'book-entry-body';

                    var title = document.createElement('div');
                    title.className = 'book-entry-title';
                    if (book.link) {
                        var a = document.createElement('a');
                        a.href = book.link;
                        a.target = '_blank';
                        a.rel = 'noopener';
                        a.textContent = book.title;
                        title.appendChild(a);
                    } else {
                        title.textContent = book.title;
                    }
                    body.appendChild(title);

                    if (book.comment) {
                        var comment = document.createElement('div');
                        comment.className = 'book-entry-comment';
                        comment.textContent = book.comment;
                        body.appendChild(comment);
                    }

                    if (book.review) {
                        var reviewLink = document.createElement('a');
                        reviewLink.href = book.review;
                        reviewLink.className = 'book-entry-review';
                        reviewLink.textContent = 'Read my review \u2192';
                        body.appendChild(reviewLink);
                    }

                    entry.appendChild(body);
                    grid.appendChild(entry);
                });

                section.appendChild(grid);
                container.appendChild(section);
            });
        } catch (e) {
            console.error('Failed to load bookshelf:', e);
        }
    }

    /* ---- Hero particles ---- */

    function initParticles() {
        var canvas = document.getElementById('hero-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var dpr = window.devicePixelRatio || 1;
        var particles = [];
        var count = 60;

        var palette = [
            [120, 180, 220],
            [180, 140, 200],
            [100, 190, 170],
            [200, 160, 120],
            [160, 170, 210]
        ];

        function resize() {
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function spawn(full) {
            var c = palette[Math.floor(Math.random() * palette.length)];
            var r = 0.8 + Math.random() * 2;
            return {
                x: Math.random() * window.innerWidth,
                y: full ? Math.random() * window.innerHeight : -4,
                vy: 0.1 + r * 0.2,
                r: r,
                phase: Math.random() * Math.PI * 2,
                amp: 8 + Math.random() * 20,
                freq: 0.003 + Math.random() * 0.004,
                color: c
            };
        }

        resize();
        for (var i = 0; i < count; i++) particles.push(spawn(true));
        window.addEventListener('resize', resize);

        var tick = 0;
        function draw() {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            tick++;
            for (var i = particles.length - 1; i >= 0; i--) {
                var p = particles[i];
                p.y += p.vy;
                var drawX = p.x + Math.sin(p.phase + tick * p.freq) * p.amp;
                var alpha = 0.08 + 0.05 * Math.sin(p.phase + tick * 0.005);
                ctx.beginPath();
                ctx.arc(drawX, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + alpha + ')';
                ctx.fill();
                if (p.y > window.innerHeight + 10) {
                    particles[i] = spawn(false);
                }
            }
            requestAnimationFrame(draw);
        }

        draw();
    }

    /* ---- Theme toggle ---- */

    function setupThemeToggle() {
        var saved = localStorage.getItem('theme');
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
        }

        var btn = document.createElement('button');
        btn.className = 'theme-toggle';
        btn.setAttribute('aria-label', 'Toggle light/dark theme');

        function updateIcon() {
            var theme = document.documentElement.getAttribute('data-theme');
            var isDark;
            if (theme === 'dark') isDark = true;
            else if (theme === 'light') isDark = false;
            else isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            btn.innerHTML = isDark
                ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
                : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        }

        btn.addEventListener('click', function () {
            var theme = document.documentElement.getAttribute('data-theme');
            var isDark;
            if (theme === 'dark') isDark = true;
            else if (theme === 'light') isDark = false;
            else isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            var next = isDark ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateIcon();
        });

        updateIcon();
        document.body.appendChild(btn);
    }

    /* ---- Shared ---- */

    function formatDate(dateStr) {
        var d = new Date(dateStr + 'T00:00:00');
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }

    function setupReveal() {
        var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            document.querySelectorAll('.reveal').forEach(function (el) {
                el.classList.add('visible');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        document.querySelectorAll('.reveal').forEach(function (el) {
            observer.observe(el);
        });
    }

    /* ---- Init ---- */

    document.addEventListener('DOMContentLoaded', function () {
        setupThemeToggle();
        setupReveal();

        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            initParticles();
        }

        if (document.getElementById('filter-bar')) {
            loadWriting();
        }

        if (document.querySelector('.bookshelf-page')) {
            loadBookshelfPage();
        }

    });
})();
