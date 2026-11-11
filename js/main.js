/* Muhammad Tahir Hussain / portfolio v3. Vanilla JS + GSAP + Lenis, no build step.
   The Work list is not written here: it is read from the GitHub API on every visit. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const animate = hasGsap && !reduce;
  const mouse = { x: -9999, y: -9999, vx: 0 };
  let lenis = null, scrollVel = 0;
  const K = '#0b0b0c', W = '#efede6', R = '#ff2d2d';
  const ARROW = '<svg class="ar ar--u"><use href="#ar"/></svg>';

  const USER = 'MuhammadTahirHussain-Official';
  const EMAIL = 'mtahirhussainofficial@gmail.com';

  /* ═════════ GitHub data ═════════
     To change a project on the site, change the repo on GitHub:
       description → the sentence shown · website → adds a "Live" button · topic "portfolio-hide" → hides it.
     META only gives nicer titles and fallback text to repos that have no description yet. */
  const META = {
    'PAI-Sales-DataAnalysis': ['Store Sales Ecuador', 'A three million row retail pipeline, from five raw files to a model-ready table.'],
    'cropglobe-transfer': ['CropGlobe Transfer', 'A pre-registered study of cross-region crop-type transfer.'],
    'Predictive-Typing-Engine-In-C-That-Predict-Your-Next-Word-': ['Veryx Engine', 'A next-word prediction engine written in plain C.'],
    'Weather-Management-System-with-AI-assistant': ['StormWatch', 'A weather desk in C++17 with an LLM assistant built in.'],
    'Professional-Airline-Management-System': ['Nexus Air', 'A full airline, simulated with object-oriented C++.'],
    'Professional-Hospital-Management-System': ['Hospital Management', 'Records, search and multi-key sorting in a C console app.'],
    'Advance-arithmetic-quiz-system-with-timer-in-c': ['Arithmetic Quiz', 'A timed quiz with levels, progression and input timeouts.'],
    'Alien-Invasion-Game-in-Python': ['Alien Invasion', 'An arcade shooter built with Pygame.'],
    'Medicine-Inventory-Website': ['Medicine Inventory', 'A searchable stock website with a PHP backend.'],
    'My-Coding-Game-Journey': ['Coding Game Journey', 'Daily timed coding clashes, solved in C.'],
    'Basic-to-Advance-C-plus-plus': ['Basic to Advanced C++', 'C++20 from first steps upward, one CMake project per topic.'],
  };
  const HIDE = new Set(['portfolio', 'portfolio-v2', 'portfolio-v3', USER]);
  const SNAPSHOT = [['PAI-Sales-DataAnalysis', 'Python'], ['cropglobe-transfer', 'Jupyter Notebook'], ['Basic-to-Advance-C-plus-plus', 'C++'], ['Medicine-Inventory-Website', 'HTML'], ['My-Coding-Game-Journey', 'C'], ['Alien-Invasion-Game-in-Python', 'Python'], ['Weather-Management-System-with-AI-assistant', 'C++'], ['Professional-Airline-Management-System', 'C++'], ['Professional-Hospital-Management-System', 'C'], ['Predictive-Typing-Engine-In-C-That-Predict-Your-Next-Word-', 'C'], ['Advance-arithmetic-quiz-system-with-timer-in-c', 'C']]
    .map(([name, language]) => ({ name, language, html_url: `https://github.com/${USER}/${name}` }));
  const LANG = { 'Jupyter Notebook': 'Jupyter' }, GLYPH = { Python: 'PY', 'Jupyter Notebook': 'NB', JavaScript: 'JS', TypeScript: 'TS', HTML: '<>', Shell: 'SH' };
  const pretty = (n) => n.replace(/[-_]+/g, ' ').trim().replace(/\b[a-z]/g, (c) => c.toUpperCase());
  const ago = (d) => { if (!d) return ''; const s = (Date.now() - new Date(d)) / 1000; for (const [n, l] of [[31536000, 'y'], [2592000, 'mo'], [86400, 'd'], [3600, 'h'], [60, 'm']]) if (s >= n) return Math.floor(s / n) + l + ' ago'; return 'now'; };
  const norm = (r) => {
    const m = META[r.name] || [], lang = LANG[r.language] || r.language || 'Other';
    return { name: r.name, title: m[0] || pretty(r.name), desc: r.description || m[1] || `A ${lang} project.`, lang, glyph: (GLYPH[r.language] || r.language || '{}').toUpperCase().slice(0, 4), url: r.html_url,
      home: /^https?:\/\//.test(r.homepage || '') ? r.homepage : '', stars: r.stargazers_count || 0, pushed: r.pushed_at || '', topics: r.topics || [] };
  };
  async function loadRepos() {
    const KEY = 'mth.v3.repos'; let cached = null;
    try { cached = JSON.parse(localStorage.getItem(KEY)); } catch {}
    if (cached && Date.now() - cached.t < 10 * 60 * 1000) return { list: cached.list, src: 'cache', t: cached.t };
    try {
      const r = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, { headers: { Accept: 'application/vnd.github+json' } });
      if (!r.ok) throw new Error(r.status);
      const list = (await r.json()).filter((x) => !x.fork && !x.archived && !HIDE.has(x.name) && !(x.topics || []).includes('portfolio-hide')).map(norm);
      try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), list })); } catch {}
      return { list, src: 'live', t: Date.now() };
    } catch { return cached ? { list: cached.list, src: 'stale', t: cached.t } : { list: SNAPSHOT.map(norm), src: 'offline', t: 0 }; }
  }

  /* ═════════ poster covers, drawn per repo: type, rules and blocks only ═════════ */
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  function cover(r, i) {
    if (r.cover) return r.cover;
    const c = document.createElement('canvas'), w = c.width = 600, h = c.height = 760, x = c.getContext('2d'), s = hash(r.name);
    const [bg, fg, ac] = [[R, K, W], [K, W, R], [W, K, R], [K, R, W]][s % 4]; let q = s; const rand = () => { q = (Math.imul(q, 1664525) + 1013904223) >>> 0; return q / 4294967296; };
    x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.strokeStyle = fg;
    const kind = (s >>> 4) % 5;
    if (kind === 0) { let px = 0; while (px < w) { const bw = 6 + rand() * 54; if (rand() > .45) x.fillRect(px, 250, bw, h); px += bw + 4 + rand() * 18; } }
    else if (kind === 1) { for (let k = 0; k < 11; k++) x.fillRect(0, 250 + k * 46, 80 + rand() * 520, 26); }
    else if (kind === 2) { x.lineWidth = 10; for (let k = 0; k < 9; k++) x.strokeRect(40 + k * 30, 250 + k * 30, w - 80 - k * 60, h - 290 - k * 60 > 0 ? h - 290 - k * 60 : 1); }
    else if (kind === 3) { x.lineWidth = 14; x.save(); x.beginPath(); x.rect(0, 250, w, h); x.clip(); for (let k = -h; k < w; k += 46) { x.beginPath(); x.moveTo(k, h); x.lineTo(k + h, 0); x.stroke(); } x.restore(); }
    else { for (let k = 0; k < 8; k++) x.fillRect(k * 75, h - (k + 1) * 62, 75, (k + 1) * 62); }
    x.fillStyle = ac; x.font = `400 ${r.glyph.length > 2 ? 300 : 430}px Anton, Impact, sans-serif`; x.textBaseline = 'alphabetic'; x.fillText(r.glyph, -8, h - 26);
    x.fillStyle = fg; x.fillRect(30, 30, w - 60, 4); x.font = '700 22px "JetBrains Mono", monospace'; x.textBaseline = 'top';
    x.fillText(String(i + 1).padStart(2, '0'), 30, 52); x.textAlign = 'right'; x.fillText(r.lang.toUpperCase(), w - 30, 52); x.textAlign = 'left';
    x.font = '400 64px Anton, Impact, sans-serif'; let line = '', y = 96; for (const word of r.title.toUpperCase().split(' ')) { if (x.measureText(line + word).width > w - 60 && line) { x.fillText(line, 30, y); y += 66; line = ''; } line += word + ' '; } x.fillText(line, 30, y);
    return (r.cover = c.toDataURL('image/png'));
  }

  /* ═════════ always-on UI ═════════ */
  $('#year').textContent = new Date().getFullYear();
  const clock = $('#clock'); const tick = () => { clock.textContent = new Date().toLocaleTimeString('en-GB'); }; tick(); setInterval(tick, 1000);
  const go = (t) => { const n = typeof t === 'string' ? $(t) : t; if (n) lenis ? lenis.scrollTo(n, { duration: 1.5 }) : n.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
  document.addEventListener('click', (e) => { const a = e.target.closest('a[href^="#"]'); if (!a || !$(a.getAttribute('href'))) return; e.preventDefault(); go(a.getAttribute('href')); });
  $('#copy').addEventListener('click', async (e) => { const b = e.currentTarget; try { await navigator.clipboard.writeText(EMAIL); b.textContent = 'Copied'; } catch { b.textContent = EMAIL; } setTimeout(() => { b.textContent = 'Copy email'; }, 1800); });

  // top bar takes the colour that reads on the section under it
  const bar = $('#bar');
  const themeIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { bar.classList.toggle('on-light', e.target.dataset.theme === 'light'); bar.classList.toggle('on-red', e.target.dataset.theme === 'red'); } }), { rootMargin: '-28px 0px -96% 0px' });
  $$('[data-theme]').forEach((s) => themeIO.observe(s));

  // roles: hover on desktop, the row at the middle of the screen on touch
  const roles = $$('.role');
  if (fine) roles.forEach((r) => { r.addEventListener('pointerenter', () => r.classList.add('is-on')); r.addEventListener('pointerleave', () => r.classList.remove('is-on')); r.addEventListener('focus', () => r.classList.add('is-on')); r.addEventListener('blur', () => r.classList.remove('is-on')); });
  else { const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-on', e.isIntersecting)), { rootMargin: '-46% 0px -46% 0px' }); roles.forEach((r) => io.observe(r)); }

  // work list
  const rowsEl = $('#rows'), filtersEl = $('#filters'), peek = $('#peek'), peekImg = $('img', peek);
  let repos = [], filter = 'All', peekOn = false;
  function fillBody(li, r, i) {
    const box = $('.row__in', li); if (box.childElementCount) return;
    const img = el('img'); img.src = cover(r, i); img.alt = ''; img.width = 600; img.height = 760;
    const txt = el('div'), m = el('div', 'row__m mono'), a = el('div', 'row__a');
    m.append(el('span', '', r.lang), el('span', '', 'Stars ' + r.stars)); if (r.pushed) m.append(el('span', '', 'Pushed ' + ago(r.pushed))); r.topics.slice(0, 3).forEach((t) => m.append(el('span', '', '#' + t)));
    const mk = (label, href, cls) => { const b = el('a', 'btn ' + cls); b.href = href; b.target = '_blank'; b.rel = 'noopener'; b.dataset.x = 'open'; b.innerHTML = ARROW; b.prepend(label); a.append(b); };
    mk('View code', r.url, 'btn--f'); if (r.home) mk('Live site', r.home, '');
    txt.append(el('p', '', r.desc), m, a); box.append(img, txt);
  }
  function renderRows() {
    rowsEl.textContent = '';
    repos.forEach((r, i) => {
      const li = el('li', 'row'); li.dataset.lang = r.lang;
      const h = el('div', 'row__h'); h.tabIndex = 0; h.setAttribute('role', 'button'); h.setAttribute('aria-expanded', 'false'); h.dataset.x = 'expand';
      h.append(el('span', 'row__n mono', String(i + 1).padStart(2, '0')), el('span', 'row__t', r.title), el('span', 'row__l mono', r.lang), el('span', 'row__d mono', ago(r.pushed)), el('span', 'row__x'));
      const b = el('div', 'row__b'), wrap = el('div'); wrap.append(el('div', 'row__in')); b.append(wrap); li.append(h, b);
      const toggle = () => { const open = !li.classList.contains('is-open'); $$('.row.is-open', rowsEl).forEach((o) => { o.classList.remove('is-open'); $('.row__h', o).setAttribute('aria-expanded', 'false'); }); if (open) { fillBody(li, r, i); li.classList.add('is-open'); h.setAttribute('aria-expanded', 'true'); } if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 650); };
      h.addEventListener('click', toggle); h.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      h.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; peekImg.src = cover(r, i); peekOn = !li.classList.contains('is-open'); });
      h.addEventListener('pointerleave', () => { peekOn = false; });
      rowsEl.append(li);
    });
    applyFilter(false);
  }
  function applyFilter(anim = true) {
    let n = 0; const shown = [];
    $$('.row', rowsEl).forEach((li) => { const on = filter === 'All' || li.dataset.lang === filter; li.classList.toggle('is-hidden', !on); if (on) { $('.row__n', li).textContent = String(++n).padStart(2, '0'); shown.push(li); } });
    $$('button', filtersEl).forEach((b) => b.classList.toggle('is-on', b.dataset.f === filter));
    if (anim && animate) gsap.fromTo(shown, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .5, stagger: .04, ease: 'power3.out', clearProps: 'all' });
    if (hasGsap) ScrollTrigger.refresh();
  }
  function renderFilters() {
    const counts = {}; repos.forEach((r) => { counts[r.lang] = (counts[r.lang] || 0) + 1; }); filtersEl.textContent = '';
    [['All', repos.length], ...Object.entries(counts).sort((a, b) => b[1] - a[1])].forEach(([name, n]) => { const b = el('button', '', name); b.type = 'button'; b.dataset.f = name; b.dataset.x = 'filter'; b.append(el('b', '', String(n).padStart(2, '0'))); b.addEventListener('click', () => { filter = name; applyFilter(); }); filtersEl.append(b); });
  }

  // stack rings: the first ring is whatever languages GitHub reports
  let drum = null;
  function setLangs(list) {
    const counts = {}; list.forEach((r) => { if (r.lang !== 'Other' && r.lang !== 'Jupyter') counts[r.lang] = (counts[r.lang] || 0) + 1; });
    const langs = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 7); if (langs.length < 2) return;
    $('#ringLang').dataset.words = langs.join('|'); if (drum) drum.build();
  }

  const fontsReady = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('400 100px Anton'), document.fonts.load('700 22px "JetBrains Mono"')]).catch(() => {}) : Promise.resolve();
  Promise.all([loadRepos(), fontsReady]).then(([{ list, src, t }]) => {
    repos = list.length ? list : SNAPSHOT.map(norm);
    renderFilters(); renderRows(); setLangs(repos);
    $('#workN').textContent = String(repos.length).padStart(2, '0');
    $('#sync').textContent = { live: 'Synced from GitHub just now', cache: 'Synced from GitHub ' + ago(t), stale: 'GitHub unreachable / last sync ' + ago(t), offline: 'GitHub unreachable / saved list' }[src];
  });

  /* ═════════ portrait: drawn in horizontal slices that shear with the pointer and with scrolling ═════════ */
  const slit = (function slitFn() {
    const cv = $('#slit'), ctx = cv.getContext('2d'), img = new Image(); let w = 0, h = 0, dpr = 1, n = 0, off = [], vel = [], base = null, ghost = null, ready = false, inView = true;
    function build() {
      w = cv.clientWidth; h = cv.clientHeight; if (!w || !img.naturalWidth) return; dpr = Math.min(devicePixelRatio || 1, 2); cv.width = w * dpr; cv.height = h * dpr;
      base = document.createElement('canvas'); base.width = cv.width; base.height = cv.height; base.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      ghost = document.createElement('canvas'); ghost.width = cv.width; ghost.height = cv.height; const g = ghost.getContext('2d'); g.drawImage(base, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = K; g.fillRect(0, 0, cv.width, cv.height);
      const count = Math.ceil(h / 5); if (count !== n) { n = count; off = Array.from({ length: n }, () => (animate ? (Math.random() - .5) * w * 1.6 : 0)); vel = new Array(n).fill(0); }
      ready = true; draw();
    }
    function draw() {
      const sh = cv.height / n; ctx.clearRect(0, 0, cv.width, cv.height);
      for (let i = 0; i < n; i++) { const o = off[i] * dpr; if (Math.abs(o) > .6) ctx.drawImage(ghost, 0, i * sh, cv.width, sh + 1, o * 2.4, i * sh, cv.width, sh + 1); }
      for (let i = 0; i < n; i++) ctx.drawImage(base, 0, i * sh, cv.width, sh + 1, off[i] * dpr, i * sh, cv.width, sh + 1);
    }
    function step(time) {
      if (!ready || !inView) return; const r = cv.getBoundingClientRect(), my = mouse.y - r.top, near = mouse.x > r.left - 200 && mouse.x < r.right + 200;
      for (let i = 0; i < n; i++) {
        const y = (i + .5) * (h / n), d = (y - my) / 90, push = near ? mouse.vx * Math.exp(-d * d) * .5 : 0, idle = Math.sin(time * 1.3 + i * .11) * 1.1;
        vel[i] += push + scrollVel * Math.sin(i * .21 + time) * .05 + (idle - off[i]) * .07; vel[i] *= .86; off[i] += vel[i];
      }
      draw();
    }
    img.onload = build; img.src = 'assets/img/portrait.webp';
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(cv);
    return { step };
  })();

  if (!animate) { document.documentElement.classList.add('static'); $('#loader').remove(); $$('.ring').forEach((r) => r.dataset.words.split('|').forEach((w) => r.append(el('span', '', w), el('span', 'sep', '/')))); return; }

  /* ═════════ motion ═════════ */
  gsap.registerPlugin(ScrollTrigger);
  let lastX = 0; addEventListener('mousemove', (e) => { mouse.vx = e.clientX - lastX; lastX = e.clientX; mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) }); lenis.on('scroll', (l) => { scrollVel = l.velocity; ScrollTrigger.update(); });
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); window.__lenis = lenis;
  }
  gsap.ticker.add((time) => { slit.step(time); mouse.vx *= .8; });

  /* crosshair cursor with live coordinates */
  if (fine) {
    const xh = $('#xh'), hl = $('.xh__h', xh), vl = $('.xh__v', xh), c = $('.xh__c', xh), t = $('#xhT'); let on = false;
    addEventListener('mousemove', (e) => {
      if (!on) { on = true; document.documentElement.classList.add('has-xh'); }
      const x = e.clientX, y = e.clientY; hl.style.transform = `translateY(${y}px)`; vl.style.transform = `translateX(${x}px)`; c.style.transform = `translate(${x}px,${y}px)`; t.style.transform = `translate(${x}px,${y}px)`;
      const hit = e.target.closest && e.target.closest('a, button, [data-x], .row__h, .role'), tag = hit && (hit.dataset.x || (hit.closest('[data-x]') || {}).dataset?.x);
      xh.classList.toggle('is-link', !!hit); t.textContent = tag || (hit ? 'open' : `x${String(x).padStart(4, '0')} y${String(y).padStart(4, '0')}`);
    }, { passive: true });
    document.addEventListener('mouseleave', () => { on = false; document.documentElement.classList.remove('has-xh'); });
  }

  /* cover card that trails the pointer over the work list and leans into its speed */
  if (fine) {
    let px = 0, py = 0, rot = 0, sc = .6, op = 0;
    gsap.ticker.add(() => {
      px += (mouse.x + 26 - px) * .16; py += (mouse.y - 60 - py) * .16; rot += (clamp(mouse.vx * 1.4, -16, 16) - rot) * .1; sc += ((peekOn ? 1 : .6) - sc) * .16; op += ((peekOn ? 1 : 0) - op) * .2;
      peek.style.opacity = op.toFixed(3); peek.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    });
  }

  /* hero lines slide apart as the page leaves */
  [['-7vw'], ['9vw'], ['-4vw']].forEach(([x], i) => gsap.to($$('.hero__name .ln')[i], { x, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } }));

  /* statement: each line is uncovered by a red block that wipes across and off */
  (function say() {
    const p = $('#sayT'), text = p.textContent.trim(); let st = null;
    function split() {
      if (st) st.kill(); p.textContent = ''; const words = text.split(/\s+/).map((w) => { const s = el('span', '', w + ' '); s.style.display = 'inline-block'; s.style.whiteSpace = 'pre'; p.append(s); return s; });
      const lines = []; let top = null; words.forEach((w) => { if (w.offsetTop !== top) { top = w.offsetTop; lines.push(''); } lines[lines.length - 1] += w.textContent; });
      p.textContent = ''; const tl = gsap.timeline({ paused: true });
      lines.forEach((ln, i) => { const l = el('span', 'l'), s = el('span', '', ln.trim()), b = el('i'); l.append(s, b); p.append(l); gsap.set(s, { opacity: 0 });
        tl.to(b, { scaleX: 1, duration: .5, ease: 'power3.inOut' }, i * .16).set(s, { opacity: 1 }).set(b, { transformOrigin: '100% 50%' }).to(b, { scaleX: 0, duration: .5, ease: 'power3.inOut' }); });
      st = ScrollTrigger.create({ trigger: p, start: 'top 78%', once: true, onEnter: () => tl.play() });
    }
    split(); let rt, lw = innerWidth; addEventListener('resize', () => { if (innerWidth === lw) return; lw = innerWidth; clearTimeout(rt); rt = setTimeout(split, 200); });
  })();

  /* big section titles rise out of a mask */
  $$('.disp').forEach((h) => { const inner = el('span'); inner.style.display = 'inline-block'; while (h.firstChild) inner.append(h.firstChild); h.append(inner); h.style.overflow = 'hidden'; h.style.paddingTop = '.12em'; h.style.marginTop = '-.12em';
    gsap.from(inner, { yPercent: 105, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 92%', once: true } }); });

  /* stack: three rings of type in 3D. They turn on their own, faster when you scroll, and you can drag them. */
  drum = (function drumFn() {
    const box = $('#drum'), rings = $$('.ring', box).map((node) => ({ node, dir: +node.dataset.dir, rot: Math.random() * 360, items: [] })); let spin = 0, inView = false, dragging = false, lx = 0;
    function build() {
      const Wd = box.clientWidth, minR = Wd * (Wd < 700 ? .56 : .3);
      rings.forEach((rg) => {
        rg.node.textContent = ''; const words = rg.node.dataset.words.split('|'); let list = [];
        const probe = (t, cls) => { const s = el('span', cls, t); rg.node.append(s); return s; };
        let total = 0; const gap = Math.max(18, Wd * .022);
        while (total < 2 * Math.PI * minR || list.length < 8) { for (const w of words) { const a = probe(w, ''), b = probe('/', 'sep'); list.push(a, b); total += a.offsetWidth + b.offsetWidth + gap * 2; } if (list.length > 60) break; }
        const Rr = total / (2 * Math.PI); let cum = 0;
        rg.items = list.map((s) => { const wd = s.offsetWidth + gap, a = ((cum + wd / 2) / total) * 360; cum += wd; s.style.transform = `translate(-50%,-50%) rotateY(${a.toFixed(2)}deg) translateZ(${Rr.toFixed(1)}px)`; return { s, a, back: null }; });
      });
    }
    build(); let rt, lw = innerWidth; addEventListener('resize', () => { if (innerWidth === lw) return; lw = innerWidth; clearTimeout(rt); rt = setTimeout(build, 200); });
    box.addEventListener('pointerdown', (e) => { dragging = true; lx = e.clientX; box.style.cursor = 'grabbing'; });
    addEventListener('pointermove', (e) => { if (!dragging) return; spin += (e.clientX - lx) * .06; lx = e.clientX; }, { passive: true });
    addEventListener('pointerup', () => { dragging = false; box.style.cursor = ''; }); addEventListener('pointercancel', () => { dragging = false; });
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(box);
    gsap.ticker.add(() => {
      if (!inView) return; spin *= .94; const auto = .1 + Math.min(Math.abs(scrollVel), 90) * .012;
      rings.forEach((rg, k) => {
        rg.rot += rg.dir * auto + spin * (1 - k * .18); rg.node.style.transform = `rotateY(${rg.rot.toFixed(2)}deg)`;
        for (const it of rg.items) { const back = Math.cos((it.a + rg.rot) * Math.PI / 180) < 0; if (back !== it.back) { it.back = back; it.s.classList.toggle('is-back', back); } }
      });
    });
    return { build };
  })();
  fontsReady.then(() => drum.build());

  /* contact: letters stretch upward toward the pointer, and a wave keeps passing through them */
  (function pull() {
    const h = $('#pull'), sec = $('#contact'), text = h.textContent; h.textContent = ''; const L = [];
    [...text].forEach((ch, i) => { if (ch === ' ') { h.append(el('span', 'sp')); return; } const s = el('span', 'pl', ch); s.setAttribute('aria-hidden', 'true'); h.append(s); L.push({ s, i, v: 1, cx: 0 }); });
    const measure = () => L.forEach((l) => { const r = l.s.getBoundingClientRect(); l.cx = r.left + r.width / 2; }); measure(); addEventListener('resize', measure); if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    let inView = false, px = -9999, inside = false; new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) measure(); }).observe(h);
    sec.addEventListener('pointermove', (e) => { px = e.clientX; inside = true; }, { passive: true }); sec.addEventListener('pointerleave', () => { inside = false; });
    gsap.ticker.add((time) => {
      if (!inView) return; const reach = Math.max(120, innerWidth * .12), max = innerWidth < 760 ? 1.9 : 1.5;
      for (const l of L) { const d = (l.cx - px) / reach, near = inside ? Math.exp(-d * d) : 0, wave = Math.pow(Math.sin(time * 1.5 - l.i * .55) * .5 + .5, 6) * .55; l.v += (1 + max * Math.max(near, wave) - l.v) * .14; l.s.style.transform = `scaleY(${l.v.toFixed(3)})`; }
    });
  })();

  /* loader → intro */
  // on a very slow connection the page's safety timer may already have removed the loader: run the intro without it
  let loader = $('#loader'); if (!loader) { loader = el('div'); loader.append(el('i'), el('b')); }
  const num = $('b', loader), fill = $('i', loader); let done = false;
  if (lenis) lenis.stop(); scrollTo(0, 0);
  gsap.set('.hero__name .ln > span', { yPercent: 110 }); gsap.set('.hero__panel', { clipPath: 'inset(0 0 0 100%)' });
  function start() {
    if (done) return; done = true; window.__started = true; num.textContent = '100'; if (lenis) lenis.start();
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .to(loader, { yPercent: -100, duration: .9, ease: 'power4.inOut' })
      .to('.hero__panel', { clipPath: 'inset(0 0 0 0%)', duration: 1.1, ease: 'power4.inOut', clearProps: 'clipPath' }, '-=.55')
      .to('.hero__name .ln > span', { yPercent: 0, duration: 1.1, stagger: .09 }, '-=.8')
      .from('.top > *, .hero__meta > *', { opacity: 0, y: 14, duration: .7, stagger: .06 }, '-=.7')
      .add(() => { loader.remove(); ScrollTrigger.refresh(); });
  }
  const c = { v: 0 };
  gsap.to(c, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => { num.textContent = String(Math.round(c.v)).padStart(3, '0'); fill.style.transform = `scaleY(${c.v / 100})`; }, onComplete: () => setTimeout(start, 120) });
  setTimeout(start, 5000);
  addEventListener('load', () => ScrollTrigger.refresh());
})();
