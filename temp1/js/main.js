/* Aditi & Jeet · Shubh Vivah — interactions */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);

  /* ---------------------------------------------------------
     Monogram (A & J in a laurel ring with a lotus crown)
     --------------------------------------------------------- */
  function monogramSVG() {
    const cx = 100, cy = 100, R = 76;
    const rad = d => d * Math.PI / 180;
    const pt = (deg, r) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];
    const leaf = 'M0 -8.5 C 4.2 -4, 4.2 4, 0 8.5 C -4.2 4, -4.2 -4, 0 -8.5Z';
    let leaves = '', stems = '';

    for (const side of [-1, 1]) {
      // stem arc from near bottom up the side
      const a1 = 90 + side * 24, a2 = 90 + side * 148;
      const [x1, y1] = pt(a1, R), [x2, y2] = pt(a2, R);
      stems += `<path class="m-stem" stroke-width="1.1" d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 ${side > 0 ? 1 : 0} ${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;
      for (let i = 0; i < 9; i++) {
        const a = 90 + side * (30 + i * 14.5);
        for (const k of [-1, 1]) {
          const [x, y] = pt(a, R + k * 5.2);
          const rot = a + k * side * 38 + (side > 0 ? 0 : 180);
          const sc = 1 - i * 0.035;
          leaves += `<path class="m-leaf" d="${leaf}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sc.toFixed(2)})"/>`;
        }
      }
    }

    const lotus =
      `<g class="m-leaf" transform="translate(100 27)">
        <path d="M0 -9 C 4.5 -4, 4.5 3, 0 7 C -4.5 3, -4.5 -4, 0 -9Z"/>
        <path d="M0 7 C -3 2, -9 -2, -13 -1 C -11 4, -6 7, 0 7Z"/>
        <path d="M0 7 C 3 2, 9 -2, 13 -1 C 11 4, 6 7, 0 7Z"/>
        <circle cx="0" cy="11" r="1.4"/>
      </g>`;
    const knot = `<g class="m-leaf" transform="translate(100 176)"><path d="M0 -4 L4 0 L0 4 L-4 0Z"/><circle cx="-9" cy="0" r="1.3"/><circle cx="9" cy="0" r="1.3"/></g>`;

    return `<svg class="mono" viewBox="0 0 200 200" role="img" aria-label="Aditi and Jeet monogram">
      <circle class="m-ring" cx="100" cy="100" r="95" stroke-width="1.4"/>
      <circle class="m-ring" cx="100" cy="100" r="90.5" stroke-width=".6"/>
      <circle class="m-ring" cx="100" cy="100" r="62" stroke-width=".5" stroke-dasharray=".1 4.2" stroke-linecap="round" style="stroke-width:1.6"/>
      ${stems}${leaves}${lotus}${knot}
      <text class="m-a" x="84" y="124" font-size="84" text-anchor="middle">A</text>
      <text class="m-j" x="116" y="126" font-size="84" text-anchor="middle">J</text>
    </svg>`;
  }
  $$('[data-monogram]').forEach(el => { el.innerHTML = monogramSVG(); });

  /* ---------------------------------------------------------
     Mandala
     --------------------------------------------------------- */
  function mandalaSVG() {
    const layers = [
      { r: 10, n: 8,  len: 12, w: 5 },
      { r: 24, n: 12, len: 16, w: 7 },
      { r: 42, n: 16, len: 18, w: 7 },
      { r: 62, n: 24, len: 16, w: 6 },
      { r: 80, n: 36, len: 12, w: 4 },
    ];
    let s = '<svg viewBox="-100 -100 200 200" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width=".55">';
    for (const L of layers) {
      s += `<circle r="${L.r}"/>`;
      const p = `M0 ${-L.r} C ${L.w} ${-(L.r + L.len * .35)}, ${L.w * .55} ${-(L.r + L.len * .85)}, 0 ${-(L.r + L.len)} C ${-L.w * .55} ${-(L.r + L.len * .85)}, ${-L.w} ${-(L.r + L.len * .35)}, 0 ${-L.r}Z`;
      for (let i = 0; i < L.n; i++) {
        const a = (360 / L.n) * i;
        s += `<path d="${p}" transform="rotate(${a})"/>`;
        if (L.r > 20) s += `<circle cx="0" cy="${-(L.r + L.len + 3)}" r=".9" fill="currentColor" transform="rotate(${a + 180 / L.n})"/>`;
      }
    }
    s += '<circle r="95"/><circle r="97.5" stroke-dasharray="1 3"/></g></svg>';
    return s;
  }
  const mandala = mandalaSVG();
  $$('[data-mandala]').forEach(el => { el.innerHTML = mandala; });

  /* ---------------------------------------------------------
     Toran (marigold garland with mango leaves)
     --------------------------------------------------------- */
  function drawToran() {
    const el = $('[data-toran]');
    if (!el) return;
    const w = el.clientWidth || innerWidth;
    const step = w < 500 ? 30 : 36;
    const n = Math.ceil(w / step) + 1;
    const off = (w - (n - 1) * step) / 2;
    const lens = [4, 2, 5, 2, 3, 2];
    let s = `<svg width="${w}" height="120" viewBox="0 0 ${w} 120" aria-hidden="true">
      <defs>
        <radialGradient id="mgA" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#FFD873"/><stop offset=".55" stop-color="#F39C12"/><stop offset="1" stop-color="#C2560A"/></radialGradient>
        <radialGradient id="mgB" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#FFE9A8"/><stop offset=".55" stop-color="#F7C21B"/><stop offset="1" stop-color="#C98A06"/></radialGradient>
        <linearGradient id="lfG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6DB043"/><stop offset="1" stop-color="#2E6A1E"/></linearGradient>
      </defs>
      <rect x="0" y="0" width="${w}" height="7" fill="#5A0A14"/>
      <path d="M0 6 H${w}" stroke="#C9A24A" stroke-width="2"/>`;

    // leaves first (behind)
    for (let i = 0; i < n - 1; i++) {
      const x = off + i * step + step / 2;
      const rot = (i % 2 ? 1 : -1) * 7;
      s += `<g class="str" style="animation-delay:${(-i * 0.37).toFixed(2)}s"><path transform="translate(${x} 6) rotate(${rot})" d="M0 0 C 7 8, 7 22, 0 32 C -7 22, -7 8, 0 0Z" fill="url(#lfG)"/><path transform="translate(${x} 6) rotate(${rot})" d="M0 2 V29" stroke="#BFE39A" stroke-width=".7" opacity=".7"/></g>`;
    }
    // marigold strands
    for (let i = 0; i < n; i++) {
      const x = off + i * step;
      const len = lens[i % lens.length];
      const yEnd = 14 + (len - 1) * 12.5;
      let g = `<g class="str" style="animation-delay:${(-i * 0.53).toFixed(2)}s"><path d="M${x} 6 V${yEnd + 8}" stroke="#7A5418" stroke-width="1"/>`;
      for (let k = 0; k < len; k++) {
        const y = 14 + k * 12.5;
        const grad = (i + k) % 3 === 0 ? 'mgB' : 'mgA';
        g += `<circle cx="${x}" cy="${y}" r="6.6" fill="url(#${grad})" stroke="${grad === 'mgA' ? '#B4500A' : '#B07A05'}" stroke-width="1.6" stroke-dasharray="1.6 1.2"/>`;
      }
      g += `<path d="M${x - 3} ${yEnd + 7} L${x + 3} ${yEnd + 7} L${x} ${yEnd + 15} Z" fill="#C9A24A"/>`;
      g += `<circle cx="${x}" cy="${yEnd + 16.5}" r="1.8" fill="#C9A24A"/></g>`;
      s += g;
    }
    s += '</svg>';
    el.innerHTML = s;
  }
  drawToran();
  let rT;
  addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(drawToran, 200); });

  /* ---------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;
  function startReveal() {
    $$('.rv').forEach(el => io ? io.observe(el) : el.classList.add('in'));
  }

  /* ---------------------------------------------------------
     Petals
     --------------------------------------------------------- */
  function startPetals() {
    if (reduce) return;
    const box = $('#petals');
    const cols = ['#F39C12', '#F7B733', '#E8505B', '#C2185B', '#F6D365', '#FF7F50'];
    const count = innerWidth < 600 ? 14 : 22;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      p.style.setProperty('--x', (Math.random() * 100).toFixed(1) + 'vw');
      p.style.setProperty('--s', (9 + Math.random() * 10).toFixed(1) + 'px');
      p.style.setProperty('--col', cols[i % cols.length]);
      p.style.setProperty('--dur', (10 + Math.random() * 10).toFixed(1) + 's');
      p.style.setProperty('--del', (-Math.random() * 20).toFixed(1) + 's');
      p.style.setProperty('--dx', ((Math.random() - .5) * 40).toFixed(1) + 'vw');
      box.appendChild(p);
    }
  }

  /* ---------------------------------------------------------
     Confetti burst
     --------------------------------------------------------- */
  function confetti(originEl) {
    if (reduce) return;
    const cv = document.createElement('canvas');
    cv.className = 'confetti';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const r = originEl.getBoundingClientRect();
    const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
    const cols = ['#C9A24A', '#F1DB9E', '#F39C12', '#C2185B', '#7B1426', '#E8505B', '#FFFFFF'];
    const parts = Array.from({ length: 160 }, () => {
      const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9;
      return {
        x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5,
        w: 5 + Math.random() * 7, h: 3 + Math.random() * 5,
        rot: Math.random() * 6, vr: (Math.random() - .5) * .4,
        c: cols[(Math.random() * cols.length) | 0], petal: Math.random() < .4,
      };
    });
    const t0 = performance.now();
    (function frame(t) {
      const el = t - t0;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalAlpha = Math.max(0, 1 - el / 3200);
      for (const p of parts) {
        p.vy += .22; p.vx *= .985; p.vy *= .985;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
        if (p.petal) { ctx.beginPath(); ctx.ellipse(0, 0, p.w * .7, p.w * .4, 0, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (el < 3200) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }

  /* ---------------------------------------------------------
     Scratch card
     --------------------------------------------------------- */
  function initScratch() {
    const wrap = $('#scratch');
    const cv = $('canvas', wrap);
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    let w = 0, h = 0, dpr = 1, started = false, done = false, drawing = false, last = null, moves = 0;

    function paint() {
      const r = wrap.getBoundingClientRect();
      w = r.width; h = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';

      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#9B7429'); g.addColorStop(.25, '#E9CF85'); g.addColorStop(.45, '#C9A24A');
      g.addColorStop(.6, '#FFF0C2'); g.addColorStop(.78, '#C9A24A'); g.addColorStop(1, '#8C6A22');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      // foil grain
      for (let i = 0; i < w * h / 55; i++) {
        ctx.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '90,60,10'},${(Math.random() * .22).toFixed(2)})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2);
      }
      // faint mandala rings
      ctx.strokeStyle = 'rgba(90,10,20,.18)'; ctx.lineWidth = 1;
      for (let rr = 18; rr < Math.max(w, h); rr += 16) { ctx.beginPath(); ctx.arc(w / 2, h / 2, rr, 0, Math.PI * 2); ctx.stroke(); }
      // inner border
      ctx.strokeStyle = 'rgba(90,10,20,.45)'; ctx.lineWidth = 1;
      roundRect(12, 12, w - 24, h - 24, 16); ctx.stroke();

      ctx.fillStyle = '#5A0A14'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '500 13px Cinzel, Georgia, serif';
      spaced('✦  SCRATCH TO REVEAL  ✦', w / 2, h / 2 - 22, 2.2);
      ctx.font = 'italic 500 30px "Cormorant Garamond", Georgia, serif';
      ctx.fillText('the big day', w / 2, h / 2 + 12);
    }
    function roundRect(x, y, rw, rh, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + rw, y, x + rw, y + rh, r); ctx.arcTo(x + rw, y + rh, x, y + rh, r);
      ctx.arcTo(x, y + rh, x, y, r); ctx.arcTo(x, y, x + rw, y, r); ctx.closePath();
    }
    function spaced(text, x, y, sp) {
      const chars = [...text];
      const widths = chars.map(c => ctx.measureText(c).width);
      const total = widths.reduce((a, b) => a + b, 0) + sp * (chars.length - 1);
      let cx = x - total / 2;
      ctx.textAlign = 'left';
      chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += widths[i] + sp; });
      ctx.textAlign = 'center';
    }

    function pos(e) { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function scratchTo(p) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = Math.max(34, w * .11); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill();
      last = p;
      if (++moves % 8 === 0) check();
    }
    function check() {
      const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0, total = 0;
      for (let i = 3; i < data.length; i += 4 * 24) { total++; if (data[i] < 40) clear++; }
      if (clear / total > 0.48) reveal();
    }
    function reveal() {
      if (done) return;
      done = true;
      wrap.classList.add('done', 'touched');
      $('#date').classList.add('revealed');
      confetti(wrap);
      if (navigator.vibrate) navigator.vibrate(40);
    }

    cv.addEventListener('pointerdown', e => {
      if (done) return;
      drawing = true; started = true; wrap.classList.add('touched');
      cv.setPointerCapture(e.pointerId);
      last = pos(e); scratchTo(last);
    });
    cv.addEventListener('pointermove', e => { if (drawing && !done) scratchTo(pos(e)); });
    const end = () => { if (drawing) { drawing = false; if (!done) check(); } };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    $('#revealAll').addEventListener('click', reveal);

    const go = () => paint();
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
    addEventListener('resize', () => { if (!started && !done) paint(); });
  }
  initScratch();

  /* ---------------------------------------------------------
     Countdown
     --------------------------------------------------------- */
  (function countdown() {
    const target = new Date('2026-12-02T20:30:00+05:30').getTime();
    const box = $('#cd');
    const els = { d: $('[data-u="d"]', box), h: $('[data-u="h"]', box), m: $('[data-u="m"]', box), s: $('[data-u="s"]', box) };
    const pad = n => String(n).padStart(2, '0');
    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) { box.innerHTML = '<p class="cd-done">The celebrations have begun!</p>'; return; }
      const vals = {
        d: Math.floor(diff / 864e5),
        h: Math.floor(diff / 36e5) % 24,
        m: Math.floor(diff / 6e4) % 60,
        s: Math.floor(diff / 1e3) % 60,
      };
      for (const k in vals) {
        const v = pad(vals[k]);
        if (els[k].textContent !== v) {
          els[k].textContent = v;
          els[k].classList.remove('tick'); void els[k].offsetWidth; els[k].classList.add('tick');
        }
      }
      setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    }
    tick();
  })();

  /* ---------------------------------------------------------
     Add-to-calendar links (Google Calendar)
     --------------------------------------------------------- */
  $$('.ev').forEach(ev => {
    const a = $('.ev-cal', ev);
    const q = new URLSearchParams({
      action: 'TEMPLATE',
      text: ev.dataset.calTitle,
      dates: `${ev.dataset.calStart}/${ev.dataset.calEnd}`,
      location: ev.dataset.calLoc,
      details: 'With love, the Chourasia Family. Aap aaiye, baaki hum sambhal lenge!',
      ctz: 'Asia/Kolkata',
    });
    a.href = `https://calendar.google.com/calendar/render?${q}`;
  });

  /* ---------------------------------------------------------
     Music (only appears if a music.mp3 sits next to index.html)
     --------------------------------------------------------- */
  const bgm = $('#bgm'), mBtn = $('#musicBtn');
  let wantMusic = false;
  bgm.addEventListener('canplay', () => {
    mBtn.hidden = false;
    if (wantMusic) bgm.play().catch(() => mBtn.classList.add('paused'));
    else mBtn.classList.add('paused');
  }, { once: true });
  mBtn.addEventListener('click', () => {
    if (bgm.paused) { bgm.play().then(() => mBtn.classList.remove('paused')).catch(() => {}); }
    else { bgm.pause(); mBtn.classList.add('paused'); }
  });

  /* ---------------------------------------------------------
     Share
     --------------------------------------------------------- */
  const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); };
  $('#shareBtn').addEventListener('click', async () => {
    const data = { title: 'Aditi & Jeet · Shubh Vivah', text: 'You are invited to the wedding of Aditi & Jeet! 💛', url: location.href.split('?')[0] };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); toast('Link copied — share the joy!'); }
    } catch (_) { /* user closed the share sheet */ }
  });

  /* ---------------------------------------------------------
     Gate / doors
     --------------------------------------------------------- */
  const gate = $('#gate');
  function openGate() {
    if (gate.classList.contains('open')) return;
    gate.classList.add('open');
    wantMusic = true;
    if (!mBtn.hidden) bgm.play().then(() => mBtn.classList.remove('paused')).catch(() => {});
    setTimeout(() => {
      document.body.classList.remove('locked');
      startReveal();
      startPetals();
    }, reduce ? 0 : 700);
    setTimeout(() => gate.classList.add('gone'), reduce ? 0 : 2000);
  }
  $('#openBtn').addEventListener('click', openGate);

  if (params.has('open')) {
    gate.classList.add('open', 'gone');
    document.body.classList.remove('locked');
    startReveal();
    startPetals();
  }
})();
