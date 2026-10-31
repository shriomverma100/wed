/* Aditi & Jeet · Template 2 — "Lotus Pond" */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const f = n => n.toFixed(1);

  /* ---------------------------------------------------------
     Cusped (multifoil) Mughal arch path
     --------------------------------------------------------- */
  function archPath(x0, y0, W, H, archH, lobes) {
    const P = [[0, archH], [0, archH * .42], [W * .26, archH * .1], [W / 2, 0]];
    const bez = t => {
      const u = 1 - t;
      return [
        u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0],
        u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1],
      ];
    };
    const left = Array.from({ length: lobes + 1 }, (_, i) => bez(i / lobes));
    const right = left.slice(0, -1).reverse().map(([x, y]) => [W - x, y]);
    const pts = left.concat(right);
    let d = `M${f(x0)} ${f(y0 + H)} L${f(x0)} ${f(y0 + archH)}`;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const r = Math.hypot(bx - ax, by - ay) * .62;
      d += ` A${f(r)} ${f(r)} 0 0 1 ${f(x0 + bx)} ${f(y0 + by)}`;
    }
    d += ` L${f(x0 + W)} ${f(y0 + H)} Z`;
    return d;
  }

  function drawArches() {
    $$('[data-arch]').forEach(el => {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      const venue = el.classList.contains('venue-arch');
      const archH = Math.min(W * (venue ? .5 : .56), H * .6);
      const lobes = 7, g = venue ? 0 : 8;
      el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
        <path d="${archPath(0, 0, W, H, archH, lobes)}" fill="${venue ? 'rgba(255,253,248,.72)' : 'none'}" stroke="#C5A059" stroke-width="1.3"/>
        <path d="${archPath(g + 6, g + 9, W - 2 * (g + 6), H - (g + 9) - 6, archH - g, lobes)}" fill="none" stroke="#C5A059" stroke-width=".6" opacity=".7"/>
        <path d="M${W / 2} -16 V0" stroke="#C5A059" stroke-width="1.2"/>
        <circle cx="${W / 2}" cy="-19" r="3" fill="#C5A059"/>
        <path d="M${W / 2 - 7} -3 Q${W / 2} -12 ${W / 2 + 7} -3" fill="none" stroke="#C5A059" stroke-width="1"/>
      </svg>`;
    });
  }
  drawArches();
  if ('ResizeObserver' in window) {
    let t; const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(drawArches, 120); });
    $$('[data-arch]').forEach(el => ro.observe(el));
  } else addEventListener('resize', drawArches);

  /* ---------------------------------------------------------
     AJ monogram — letters inside a cusped arch, lotus at the foot
     --------------------------------------------------------- */
  function monogram() {
    return `<svg class="mono" viewBox="0 0 160 212" role="img" aria-label="Aditi and Jeet monogram">
      <path class="m-arch" stroke-width="1.4" d="${archPath(6, 14, 148, 192, 86, 6)}"/>
      <path class="m-arch" stroke-width=".6" d="${archPath(13, 23, 134, 177, 78, 6)}"/>
      <path class="m-arch" stroke-width="1.2" d="M80 0 V14 M74 12 Q80 4 86 12"/>
      <text class="m-a" x="64" y="132" font-size="86" text-anchor="middle">A</text>
      <text class="m-j" x="96" y="132" font-size="82" text-anchor="middle">J</text>
      <use href="#lotus" x="54" y="150" width="52" height="39"/>
      <text class="m-txt" x="80" y="198" font-size="6.5" text-anchor="middle">ADITI · JEET</text>
    </svg>`;
  }
  $$('[data-mono]').forEach(el => { el.innerHTML = monogram(); });

  /* ---------------------------------------------------------
     Lotus petal ring around the scratch medallion
     --------------------------------------------------------- */
  (function petalRing() {
    const el = $('[data-petals]');
    if (!el) return;
    const petal = (r0, L, w) => `M0 ${-r0} C ${w} ${-(r0 + L * .3)}, ${w * .55} ${-(r0 + L * .86)}, 0 ${-(r0 + L)} C ${-w * .55} ${-(r0 + L * .86)}, ${-w} ${-(r0 + L * .3)}, 0 ${-r0}Z`;
    let s = `<svg viewBox="-100 -100 200 200" aria-hidden="true"><defs>
      <radialGradient id="rgOut" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#E3A0A8"/><stop offset="1" stop-color="#FCEDEA"/></radialGradient>
      <radialGradient id="rgIn" cx="0" cy="0" r="86" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#C9677A"/><stop offset="1" stop-color="#F6CFCF"/></radialGradient>
      <radialGradient id="rgLeaf" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse"><stop offset=".6" stop-color="#2E6B5B"/><stop offset="1" stop-color="#6FA48A"/></radialGradient>
    </defs>`;
    for (let i = 0; i < 12; i++) s += `<path d="${petal(56, 44, 13)}" fill="url(#rgLeaf)" opacity=".85" transform="rotate(${i * 30 + 15})"/>`;
    for (let i = 0; i < 16; i++) s += `<path d="${petal(50, 46, 15)}" fill="url(#rgOut)" transform="rotate(${i * 22.5})"/>`;
    for (let i = 0; i < 16; i++) s += `<path d="${petal(48, 34, 12)}" fill="url(#rgIn)" transform="rotate(${i * 22.5 + 11.25})"/>`;
    for (let i = 0; i < 32; i++) s += `<circle r="1.1" cy="-62" fill="#C5A059" transform="rotate(${i * 11.25})"/>`;
    s += '</svg>';
    el.innerHTML = s;
  })();

  /* ---------------------------------------------------------
     Ambient: stars, fireflies, marigold garlands
     --------------------------------------------------------- */
  $$('[data-stars]').forEach(el => {
    let h = '';
    for (let i = 0; i < 46; i++) {
      const sz = rnd(1, 2.6);
      h += `<i style="left:${f(rnd(2, 98))}%;top:${f(rnd(2, 62))}%;width:${f(sz)}px;height:${f(sz)}px;--t:${f(rnd(2, 5))}s;--dl:${f(-rnd(0, 5))}s"></i>`;
    }
    el.innerHTML = h;
  });
  $$('[data-flies]').forEach(el => {
    let h = '';
    for (let i = 0; i < 16; i++) {
      h += `<i style="left:${f(rnd(4, 96))}%;top:${f(rnd(10, 90))}%;--x:${f(rnd(-50, 50))}px;--y:${f(rnd(-60, 30))}px;--t:${f(rnd(3, 7))}s;--dl:${f(-rnd(0, 6))}s"></i>`;
    }
    el.innerHTML = h;
  });
  $$('[data-garland]').forEach((el, gi) => {
    let h = '';
    for (let s = 0; s < 2; s++) {
      let str = `<div class="str" style="animation-delay:${f(-(gi * 1.3 + s * .9))}s;margin-top:${s * 18}px">`;
      for (let k = 0; k < 64; k++) str += (k % 6 === 5) ? '<b></b>' : '<i></i>';
      h += str + '</div>';
    }
    el.innerHTML = h;
  });

  /* ---------------------------------------------------------
     Pages: reveal + progress dots
     --------------------------------------------------------- */
  const pages = $$('.page');
  const dots = $('#dots');
  pages.forEach((p, i) => {
    p.id = p.id || `p${i + 1}`;
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', p.dataset.label || `Page ${i + 1}`);
    b.addEventListener('click', () => p.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));
    dots.appendChild(b);
  });
  const dotBtns = $$('button', dots);

  let revealing = false;
  function startPages() {
    if (revealing) return;
    revealing = true;
    if (!('IntersectionObserver' in window)) { pages.forEach(p => p.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in');
    }), { threshold: .25 });
    const act = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        const i = pages.indexOf(e.target);
        dotBtns.forEach((b, j) => b.classList.toggle('on', j === i));
      }
    }), { rootMargin: '-48% 0px -48% 0px' });
    pages.forEach(p => { io.observe(p); act.observe(p); });
  }

  /* ---------------------------------------------------------
     Petal confetti
     --------------------------------------------------------- */
  function bloom(originEl) {
    if (reduce) return;
    const cv = document.createElement('canvas');
    cv.className = 'confetti';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const r = originEl.getBoundingClientRect();
    const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
    const cols = ['#E7A3AA', '#C9677A', '#F6CFCF', '#C5A059', '#E8D3A0', '#4F8A74', '#FFFFFF', '#F39C12'];
    const ps = Array.from({ length: 150 }, () => {
      const a = rnd(0, Math.PI * 2), v = rnd(3, 10);
      return { x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, s: rnd(4, 9), rot: rnd(0, 6), vr: rnd(-.2, .2), c: cols[(Math.random() * cols.length) | 0], sw: rnd(0, 6) };
    });
    const t0 = performance.now();
    (function frame(t) {
      const el = t - t0;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalAlpha = Math.max(0, 1 - el / 3600);
      for (const p of ps) {
        p.vy += .16; p.vx *= .982; p.vy *= .982; p.sw += .08;
        p.x += p.vx + Math.sin(p.sw) * .6; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.quadraticCurveTo(p.s * .8, 0, 0, p.s); ctx.quadraticCurveTo(-p.s * .8, 0, 0, -p.s); ctx.fill();
        ctx.restore();
      }
      if (el < 3600) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }

  /* ---------------------------------------------------------
     Scratch the lotus
     --------------------------------------------------------- */
  (function scratch() {
    const wrap = $('#scratch');
    const cv = $('canvas', wrap);
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    let w = 0, dpr = 1, started = false, done = false, drawing = false, last = null, moves = 0;

    function paint() {
      w = wrap.clientWidth; dpr = Math.min(devicePixelRatio || 1, 2);
      if (!w) return;
      cv.width = cv.height = Math.round(w * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createLinearGradient(0, 0, w, w);
      g.addColorStop(0, '#B9786B'); g.addColorStop(.25, '#F3CDBF'); g.addColorStop(.45, '#D99A8B');
      g.addColorStop(.6, '#FBE4D8'); g.addColorStop(.8, '#C98C7E'); g.addColorStop(1, '#A9655A');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, w);
      for (let i = 0; i < w * w / 40; i++) {
        ctx.fillStyle = `rgba(${Math.random() < .55 ? '255,255,255' : '120,50,40'},${(Math.random() * .25).toFixed(2)})`;
        ctx.fillRect(Math.random() * w, Math.random() * w, 1.2, 1.2);
      }
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1;
      for (let rr = 10; rr < w / 2; rr += 9) { ctx.beginPath(); ctx.arc(w / 2, w / 2, rr, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = '#7A3442'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `${Math.round(w * .2)}px "Pinyon Script", cursive`;
      ctx.fillText('scratch', w / 2, w * .47);
      ctx.font = `${Math.max(9, Math.round(w * .055))}px Italiana, serif`;
      const label = 'T O   R E V E A L';
      ctx.fillText(label, w / 2, w * .66);
    }
    const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * (w / r.width), y: (e.clientY - r.top) * (w / r.height) }; };
    function stroke(p) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = Math.max(30, w * .17); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p;
      if (++moves % 8 === 0) check();
    }
    function check() {
      const N = cv.width, data = ctx.getImageData(0, 0, N, N).data, R = N / 2;
      let clear = 0, total = 0;
      for (let y = 0; y < N; y += 6) for (let x = 0; x < N; x += 6) {
        if ((x - R) ** 2 + (y - R) ** 2 > R * R) continue;
        total++;
        if (data[(y * N + x) * 4 + 3] < 40) clear++;
      }
      if (total && clear / total > .5) reveal();
    }
    function reveal() {
      if (done) return;
      done = true;
      wrap.classList.add('done');
      $('#date').classList.add('revealed');
      bloom(wrap);
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    }
    cv.addEventListener('pointerdown', e => {
      if (done) return;
      drawing = true; started = true; cv.setPointerCapture(e.pointerId);
      last = pos(e); stroke({ x: last.x + .1, y: last.y + .1 });
    });
    cv.addEventListener('pointermove', e => { if (drawing && !done) stroke(pos(e)); });
    const end = () => { if (drawing) { drawing = false; if (!done) check(); } };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    $('#revealAll').addEventListener('click', reveal);
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(paint);
    addEventListener('resize', () => { if (!started && !done) paint(); });
  })();

  /* ---------------------------------------------------------
     Countdown rings
     --------------------------------------------------------- */
  (function countdown() {
    const target = new Date('2026-12-02T20:30:00+05:30').getTime();
    const box = $('#cd');
    const C = 2 * Math.PI * 52;
    const rings = { d: $('[data-u="d"]', box), h: $('[data-u="h"]', box), m: $('[data-u="m"]', box), s: $('[data-u="s"]', box) };
    const max = { d: 100, h: 24, m: 60, s: 60 };
    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) { box.innerHTML = '<p class="cd-done">The celebrations have begun!</p>'; return; }
      const v = { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 };
      for (const k in v) {
        $('b', rings[k]).textContent = String(v[k]).padStart(2, '0');
        $('.r-fg', rings[k]).style.strokeDashoffset = f(C * (1 - Math.min(v[k] / max[k], 1)));
      }
      setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    }
    tick();
  })();

  /* ---------------------------------------------------------
     Timeline swipe dots + calendar links
     --------------------------------------------------------- */
  const track = $('#track'), tdots = $$('#trackDots i');
  const cards = $$('.ev', track);
  function syncDots() {
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bd = Infinity;
    cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
    tdots.forEach((d, i) => d.classList.toggle('on', i === best));
  }
  track.addEventListener('scroll', () => requestAnimationFrame(syncDots), { passive: true });
  syncDots();

  cards.forEach(ev => {
    const q = new URLSearchParams({
      action: 'TEMPLATE',
      text: ev.dataset.calTitle,
      dates: `${ev.dataset.calStart}/${ev.dataset.calEnd}`,
      location: ev.dataset.calLoc,
      details: 'With love, the Chourasia Family. Aap aaiye, baaki hum sambhal lenge!',
      ctz: 'Asia/Kolkata',
    });
    $('.ev-cal', ev).href = `https://calendar.google.com/calendar/render?${q}`;
  });

  /* ---------------------------------------------------------
     Music (shows only if music.mp3 sits beside index.html)
     --------------------------------------------------------- */
  const bgm = $('#bgm'), mBtn = $('#musicBtn');
  let wantMusic = false;
  bgm.addEventListener('canplay', () => {
    mBtn.hidden = false;
    if (wantMusic) bgm.play().catch(() => mBtn.classList.add('paused'));
    else mBtn.classList.add('paused');
  }, { once: true });
  mBtn.addEventListener('click', () => {
    if (bgm.paused) bgm.play().then(() => mBtn.classList.remove('paused')).catch(() => {});
    else { bgm.pause(); mBtn.classList.add('paused'); }
  });

  /* ---------------------------------------------------------
     Share
     --------------------------------------------------------- */
  const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); };
  $('#shareBtn').addEventListener('click', async () => {
    const data = { title: 'Aditi & Jeet · Shubh Vivah', text: 'You are invited to the wedding of Aditi & Jeet!', url: location.href.split(/[?#]/)[0] };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); toast('Link copied — share the joy!'); }
    } catch (_) { /* share sheet closed */ }
  });

  /* ---------------------------------------------------------
     Envelope
     --------------------------------------------------------- */
  const intro = $('#intro');
  function open(skip) {
    if (intro.classList.contains('opening')) return;
    intro.classList.add('opening');
    wantMusic = true;
    if (!mBtn.hidden) bgm.play().then(() => mBtn.classList.remove('paused')).catch(() => {});
    const t = skip || reduce ? 0 : 2000;
    setTimeout(() => {
      intro.classList.add('done');
      document.body.classList.remove('locked');
      startPages();
      drawArches();
    }, t);
  }
  $('#openBtn').addEventListener('click', () => open(false));

  if (params.has('open')) {
    intro.style.transition = 'none';
    open(true);
    if (location.hash) {
      const tgt = document.getElementById(location.hash.slice(1));
      if (tgt) setTimeout(() => tgt.scrollIntoView(), 30);
    }
  }
})();
