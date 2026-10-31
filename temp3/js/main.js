/* Aditi & Jeet · Template 3 — "Stardust"
   A single field of particles travels with the reader and assembles into a
   new form at every chapter: lotus → rings → halo → heart → tree → arch → AJ. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  const rand = Math.random;
  const gauss = () => (rand() + rand() + rand() - 1.5) * .82;

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* =========================================================
     Input — pointer or phone tilt, normalised to -1…1 and smoothed
     ========================================================= */
  const tilt = { x: 0, y: 0, tx: 0, ty: 0, gyro: false, lastMove: 0 };
  addEventListener('pointermove', e => {
    if (tilt.gyro) return;
    tilt.tx = (e.clientX / innerWidth - .5) * 2;
    tilt.ty = (e.clientY / innerHeight - .5) * 2;
    tilt.lastMove = performance.now();
  }, { passive: true });
  function onOrient(e) {
    if (e.gamma == null || e.beta == null) return;
    tilt.gyro = true;
    tilt.tx = clamp(e.gamma / 25, -1, 1);
    tilt.ty = clamp((e.beta - 50) / 25, -1, 1);
    tilt.lastMove = performance.now();
  }
  const needsPermission = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
  if (!needsPermission) addEventListener('deviceorientation', onOrient);
  function enableGyro() {
    if (!needsPermission) return;
    DeviceOrientationEvent.requestPermission().then(s => { if (s === 'granted') addEventListener('deviceorientation', onOrient); }).catch(() => {});
  }
  (function smoothTilt() {
    tilt.x += (tilt.tx - tilt.x) * .06;
    tilt.y += (tilt.ty - tilt.y) * .06;
    requestAnimationFrame(smoothTilt);
  })();

  /* =========================================================
     Text splitting
     ========================================================= */
  function splitChars(el) {
    if (el._chars) return el._chars;
    el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
    const chars = [];
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'sw'; w.setAttribute('aria-hidden', 'true');
            [...part].forEach(ch => { const c = document.createElement('span'); c.className = 'sc'; c.textContent = ch; w.appendChild(c); chars.push(c); });
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    return (el._chars = chars);
  }
  function splitWords(el) {
    if (el._words) return el._words;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
    return (el._words = $$('.w', el));
  }

  /* =========================================================
     WebGL stardust
     ========================================================= */
  const GL = (() => {
    if (!window.THREE) return null;
    const canvas = $('#gl');
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' }); }
    catch (_) { return null; }
    if (!renderer || !renderer.getContext()) return null;

    const DPR = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const FOV = 40, CAMZ = 6;
    const camera = new THREE.PerspectiveCamera(FOV, innerWidth / innerHeight, .1, 60);
    camera.position.z = CAMZ;

    const N = innerWidth < 640 ? 3400 : 4800;
    const cur = new Float32Array(N * 3);
    const form = new Float32Array(N);
    const size = new Float32Array(N);
    const phase = new Float32Array(N);
    const stag = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      size[i] = .55 + Math.pow(rand(), 2.2) * 1.6;
      phase[i] = rand() * 6.283;
      stag[i] = rand();
      const a = rand() * 6.283, b = Math.acos(rand() * 2 - 1), r = Math.cbrt(rand()) * .35;
      cur[i * 3] = r * Math.sin(b) * Math.cos(a);
      cur[i * 3 + 1] = r * Math.cos(b);
      cur[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
    }
    const CLUSTER = cur.slice();

    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(cur, 3); posAttr.setUsage(THREE.DynamicDrawUsage);
    const formAttr = new THREE.BufferAttribute(form, 1); formAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', posAttr);
    geo.setAttribute('aForm', formAttr);
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: {
        uTime: { value: 0 }, uScale: { value: 15 * DPR },
        uColor: { value: new THREE.Color('#A2865A') }, uAlpha: { value: .9 },
      },
      vertexShader: `
        attribute float aForm; attribute float aSize; attribute float aPhase;
        uniform float uTime; uniform float uScale;
        varying float vA;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float tw = .72 + .28 * sin(uTime * 1.7 + aPhase);
          gl_PointSize = aSize * uScale * mix(.55, 1.0, aForm) / -mv.z;
          vA = mix(.30, 1.0, aForm) * tw;
        }`,
      fragmentShader: `
        uniform vec3 uColor; uniform float uAlpha;
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - .5);
          float a = pow(smoothstep(.5, .0, d), 1.5);
          gl_FragColor = vec4(uColor, a * vA * uAlpha);
        }`,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    scene.add(points);

    /* ---------- shapes (unit-sized, local space) ---------- */
    function shapeLotus() {
      const o = new Float32Array(N * 3);
      const L = [
        { n: 9, len: 1.0, h: .40, w: .31, off: 0, wt: 1 },
        { n: 9, len: .80, h: .62, w: .27, off: Math.PI / 9, wt: .85 },
        { n: 7, len: .56, h: .80, w: .22, off: .25, wt: .6 },
      ];
      const tot = L.reduce((a, l) => a + l.wt, 0);
      for (let i = 0; i < N; i++) {
        let x, y, z;
        if (rand() < .07) {
          const a = rand() * 6.283, rr = Math.sqrt(rand()) * .16;
          x = Math.cos(a) * rr; z = Math.sin(a) * rr; y = .04 + rand() * .07;
        } else {
          let pick = rand() * tot, l = L[0];
          for (const q of L) { if ((pick -= q.wt) <= 0) { l = q; break; } }
          const phi = l.off + Math.floor(rand() * l.n) * 2 * Math.PI / l.n;
          const u = Math.pow(rand(), .75);
          const v = rand() < .62 ? (rand() < .5 ? -1 : 1) * (.93 + rand() * .07) : rand() * 2 - 1;
          const w = l.w * Math.pow(Math.sin(Math.PI * Math.min(u, .999)), .8) * (1 - .25 * u);
          const lat = v * w, r = .06 + u * l.len;
          y = l.h * Math.pow(u, 1.7) + Math.abs(v) * w * .45;
          x = r * Math.cos(phi) - lat * Math.sin(phi);
          z = r * Math.sin(phi) + lat * Math.cos(phi);
        }
        o[i * 3] = x; o[i * 3 + 1] = y - .32; o[i * 3 + 2] = z;
      }
      return o;
    }
    function torus(o, i, R, r, cx, plane) {
      const a = rand() * 6.283, b = rand() * 6.283, rr = R + r * Math.cos(b);
      let x = rr * Math.cos(a), y = rr * Math.sin(a), z = r * Math.sin(b);
      if (plane === 'xz') { const t = y; y = z; z = t; }
      o[i * 3] = x + cx; o[i * 3 + 1] = y; o[i * 3 + 2] = z;
    }
    function shapeRings() {
      const o = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const q = i / N;
        if (q < .47) torus(o, i, .62, .045, -.36, 'xy');
        else if (q < .94) torus(o, i, .62, .045, .36, 'xz');
        else {
          let a = rand(), b = rand(), c = rand(); const s = a + b + c;
          a = a / s * .11 * (rand() < .5 ? -1 : 1); b = b / s * .14 * (rand() < .5 ? -1 : 1); c = c / s * .11 * (rand() < .5 ? -1 : 1);
          o[i * 3] = -.36 + a; o[i * 3 + 1] = .76 + b; o[i * 3 + 2] = c;
        }
      }
      return o;
    }
    function shapeHalo() {
      const o = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const a = rand() * 6.283;
        const band = i % 6 === 0 ? 1.17 : (i % 6 === 1 ? .9 : 1);
        const r = band + gauss() * (band === 1 ? .035 : .012);
        o[i * 3] = Math.cos(a) * r; o[i * 3 + 1] = gauss() * .025; o[i * 3 + 2] = Math.sin(a) * r;
      }
      return o;
    }
    function shapeHeart() {
      const M = 720, poly = [], cum = [0];
      for (let k = 0; k < M; k++) {
        const t = k / M * 6.283;
        poly.push([16 * Math.pow(Math.sin(t), 3) / 17, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17 + .1]);
      }
      for (let k = 1; k <= M; k++) { const a = poly[k - 1], b = poly[k % M]; cum.push(cum[k - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
      const total = cum[M];
      const inside = (x, y) => {
        let c = false;
        for (let a = 0, b = M - 1; a < M; b = a++) {
          const pa = poly[a], pb = poly[b];
          if ((pa[1] > y) !== (pb[1] > y) && x < (pb[0] - pa[0]) * (y - pa[1]) / (pb[1] - pa[1]) + pa[0]) c = !c;
        }
        return c;
      };
      const o = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        let x, y, z;
        if (rand() < .52) {
          const L = rand() * total;
          let lo = 0, hi = M;
          while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < L) lo = mid + 1; else hi = mid; }
          const k = Math.max(1, lo), a = poly[k - 1], b = poly[k % M];
          const f = (L - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1);
          x = a[0] + (b[0] - a[0]) * f + gauss() * .01;
          y = a[1] + (b[1] - a[1]) * f + gauss() * .01;
          z = gauss() * .025;
        } else {
          let n = 0;
          do { x = (rand() * 2 - 1) * .98; y = rand() * 1.95 - 1.05; } while (!inside(x, y) && ++n < 200);
          let md = 1e9;
          for (let k = 0; k < M; k += 4) { const d = Math.hypot(poly[k][0] - x, poly[k][1] - y); if (d < md) md = d; }
          z = (rand() < .5 ? -1 : 1) * .3 * Math.sqrt(Math.min(1, md / .4));
        }
        o[i * 3] = x; o[i * 3 + 1] = y; o[i * 3 + 2] = z;
      }
      return o;
    }
    function shapeTree() {
      const segs = [], leaves = [];
      const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
      const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      (function branch(p, d, len, depth) {
        const q = [p[0] + d[0] * len, p[1] + d[1] * len, p[2] + d[2] * len];
        segs.push([p, q, depth]);
        if (depth === 0) { leaves.push(q); return; }
        const ref = Math.abs(d[1]) < .9 ? [0, 1, 0] : [1, 0, 0];
        const p1 = norm(cross(d, ref)), p2 = cross(d, p1);
        const n = depth > 3 ? 2 : 3;
        for (let k = 0; k < n; k++) {
          const ang = k / n * 6.283 + rand() * .8 + depth;
          const sp = .42 + rand() * .25;
          const nd = norm([
            d[0] * Math.cos(sp) + (p1[0] * Math.cos(ang) + p2[0] * Math.sin(ang)) * Math.sin(sp),
            d[1] * Math.cos(sp) + (p1[1] * Math.cos(ang) + p2[1] * Math.sin(ang)) * Math.sin(sp) + .12,
            d[2] * Math.cos(sp) + (p1[2] * Math.cos(ang) + p2[2] * Math.sin(ang)) * Math.sin(sp),
          ]);
          branch(q, nd, len * (.7 + rand() * .1), depth - 1);
        }
      })([0, -1, 0], [0, 1, 0], .55, 5);
      const weights = segs.map(s => Math.hypot(s[1][0] - s[0][0], s[1][1] - s[0][1], s[1][2] - s[0][2]) * (1 + s[2] * .5));
      const wsum = weights.reduce((a, b) => a + b, 0);
      const o = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const q = rand();
        let x, y, z;
        if (q < .38) {
          let pick = rand() * wsum, s = segs[0];
          for (let k = 0; k < segs.length; k++) { if ((pick -= weights[k]) <= 0) { s = segs[k]; break; } }
          const t = rand(), th = .006 + s[2] * .007;
          x = s[0][0] + (s[1][0] - s[0][0]) * t + gauss() * th;
          y = s[0][1] + (s[1][1] - s[0][1]) * t + gauss() * th;
          z = s[0][2] + (s[1][2] - s[0][2]) * t + gauss() * th;
        } else if (q < .95) {
          const l = leaves[(rand() * leaves.length) | 0];
          const a = rand() * 6.283, b = Math.acos(rand() * 2 - 1), r = Math.cbrt(rand()) * .1;
          x = l[0] + r * Math.sin(b) * Math.cos(a); y = l[1] + r * Math.cos(b); z = l[2] + r * Math.sin(b) * Math.sin(a);
        } else {
          const a = rand() * 6.283, r = .2 + rand() * .45;
          x = Math.cos(a) * r; y = -1; z = Math.sin(a) * r;
        }
        o[i * 3] = x; o[i * 3 + 1] = y; o[i * 3 + 2] = z;
      }
      fit(o);
      return o;
    }
    function shapeArch() {
      const o = new Float32Array(N * 3);
      const c = .2727, R = .8927, a0 = 1.881;
      for (let i = 0; i < N; i++) {
        const q = rand();
        let x, y, z;
        if (q < .82) {
          const layer = [-.5, 0, .5][(rand() * 3) | 0];
          const part = rand();
          if (part < .42) { x = (rand() < .5 ? -1 : 1) * .62; y = -1 + rand() * 1.15; }
          else { const th = a0 + rand() * (Math.PI - a0); x = (c + R * Math.cos(th)) * (rand() < .5 ? 1 : -1); y = .15 + R * Math.sin(th); }
          x += gauss() * .022; y += gauss() * .022; z = layer + gauss() * .02;
        } else if (q < .95) {
          x = (rand() - .5) * 1.24; y = -1; z = (rand() - .5) * 1.4;
        } else {
          x = (rand() - .5) * .9; y = -1 + rand() * 1.6; z = (rand() - .5) * 1.0;
        }
        o[i * 3] = x; o[i * 3 + 1] = y; o[i * 3 + 2] = z;
      }
      return o;
    }
    function shapeMono() {
      const W = 440, H = 300, cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const x = cv.getContext('2d');
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = 'italic 250px "Instrument Serif", Georgia, serif';
      x.fillText('AJ', W / 2 - 6, H / 2 + 12);
      const d = x.getImageData(0, 0, W, H).data, px = [];
      for (let yy = 0; yy < H; yy += 2) for (let xx = 0; xx < W; xx += 2) if (d[(yy * W + xx) * 4 + 3] > 128) px.push(xx, yy);
      const o = new Float32Array(N * 3), cnt = px.length / 2;
      for (let i = 0; i < N; i++) {
        if (cnt && rand() < .8) {
          const k = (rand() * cnt) | 0;
          o[i * 3] = (px[k * 2] - W / 2) / 165 + (rand() - .5) * .012;
          o[i * 3 + 1] = -(px[k * 2 + 1] - H / 2) / 165 + (rand() - .5) * .012;
          o[i * 3 + 2] = (rand() - .5) * .14;
        } else {
          const a = rand() * 6.283, r = 1.12 + gauss() * .02;
          o[i * 3] = Math.cos(a) * r; o[i * 3 + 1] = Math.sin(a) * r; o[i * 3 + 2] = gauss() * .03;
        }
      }
      return o;
    }
    function fit(o) {
      let mnx = 1e9, mny = 1e9, mnz = 1e9, mxx = -1e9, mxy = -1e9, mxz = -1e9;
      for (let i = 0; i < N; i++) {
        const x = o[i * 3], y = o[i * 3 + 1], z = o[i * 3 + 2];
        if (x < mnx) mnx = x; if (x > mxx) mxx = x; if (y < mny) mny = y; if (y > mxy) mxy = y; if (z < mnz) mnz = z; if (z > mxz) mxz = z;
      }
      const cx = (mnx + mxx) / 2, cy = (mny + mxy) / 2, cz = (mnz + mxz) / 2;
      const s = 2 / Math.max(mxx - mnx, mxy - mny, 1e-3);
      for (let i = 0; i < N; i++) { o[i * 3] = (o[i * 3] - cx) * s; o[i * 3 + 1] = (o[i * 3 + 1] - cy) * s; o[i * 3 + 2] = (o[i * 3 + 2] - cz) * s; }
    }

    const SH = {
      lotus: { gen: shapeLotus, spin: .16, tiltX: .52 },
      rings: { gen: shapeRings, spin: .32, tiltX: .28 },
      halo:  { gen: shapeHalo,  spin: .22, tiltX: 1.2 },
      heart: { gen: shapeHeart, osc: .4, oscSpeed: .6, tiltX: .05, beat: true },
      tree:  { gen: shapeTree,  spin: .14, tiltX: .08 },
      arch:  { gen: shapeArch,  osc: .6, oscSpeed: .35, tiltX: .2 },
      mono:  { gen: shapeMono,  osc: .32, oscSpeed: .5, tiltX: 0 },
    };
    const cache = {};
    const pts = key => cache[key] || (cache[key] = SH[key].gen());
    if (document.fonts && document.fonts.load) {
      document.fonts.load('italic 250px "Instrument Serif"').then(() => { delete cache.mono; }).catch(() => {});
    }

    /* ---------- ambient dust spread through the visible volume ---------- */
    let DUST = new Float32Array(N * 3), dustW = 0, dustH = 0;
    function makeDust() {
      const vh = 2 * Math.tan(FOV * Math.PI / 360) * CAMZ, vw = vh * camera.aspect;
      for (let i = 0; i < N; i++) {
        const z = -3.2 + rand() * 4.6, f = (CAMZ - z) / CAMZ;
        DUST[i * 3] = (rand() - .5) * vw * f * 1.15;
        DUST[i * 3 + 1] = (rand() - .5) * vh * f * 1.15;
        DUST[i * 3 + 2] = z;
      }
      dustW = innerWidth; dustH = innerHeight;
    }
    function resize() {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      if (Math.abs(innerWidth - dustW) > 2 || Math.abs(innerHeight - dustH) > 160) makeDust();
    }
    resize();
    addEventListener('resize', resize);

    const stages = $$('.stage[data-shape]').map(el => ({ el, key: el.dataset.shape, scale: parseFloat(el.dataset.scale) || 1 }));
    const darks = $$('.dark');
    const colLight = new THREE.Color('#A2865A'), colDark = new THREE.Color('#E6D6B2');
    let opened = false, darkMix = 0, last = performance.now(), kick = null;

    function frame(now) {
      requestAnimationFrame(frame);
      if (document.hidden) return;
      const t = now / 1000, dt = clamp((now - last) / 1000, 0, .05); last = now;
      const vh = innerHeight, vw = innerWidth, vc = vh * .5;

      let best = null, bd = 1e9;
      if (opened) for (const s of stages) {
        const r = s.el.getBoundingClientRect();
        if (!r.height) continue;
        const c = r.top + r.height / 2, d = Math.abs(c - vc);
        if (d < bd) { bd = d; best = { s, r, c }; }
      }
      const F = best ? 1 - smooth(vh * .2, vh * .62, bd) : 0;

      const visH = 2 * Math.tan(FOV * Math.PI / 360) * CAMZ, ppu = vh / visH;
      let P = null, sh = null, cx = 0, cy = 0, sc = 1;
      if (best && F > 0) {
        sh = SH[best.s.key]; P = pts(best.s.key);
        cx = (best.r.left + best.r.width / 2 - vw / 2) / ppu;
        cy = -(best.c - vc) / ppu;
        sc = Math.min(best.r.width, best.r.height) / 2 * .9 * best.s.scale / ppu;
      }
      const ang = sh ? (sh.spin || 0) * t + (sh.osc ? Math.sin(t * (sh.oscSpeed || .5)) * sh.osc : 0) : 0;
      const ry = ang + tilt.x * .45, rx = (sh ? sh.tiltX : 0) + tilt.y * .22;
      const cY = Math.cos(ry), sY = Math.sin(ry), cX = Math.cos(rx), sX = Math.sin(rx);
      let beat = 1;
      if (sh && sh.beat) {
        const ph = (Date.now() % 1000) / 1000;
        beat = 1 + .085 * Math.exp(-ph * 10) + (ph > .2 ? .045 * Math.exp(-(ph - .2) * 12) : 0);
      }

      for (let i = 0; i < N; i++) {
        const j = i * 3;
        const ph = phase[i];
        const dx = DUST[j] + Math.sin(t * .13 + ph) * .14;
        const dy = DUST[j + 1] + Math.cos(t * .11 + ph * 1.3) * .14;
        const dz = DUST[j + 2];
        let x, y, z, fi;
        if (!opened) {
          const br = 1 + .05 * Math.sin(t * 2 + ph);
          x = CLUSTER[j] * br; y = CLUSTER[j + 1] * br; z = CLUSTER[j + 2] * br; fi = .6;
        } else if (P) {
          fi = stag[i] > .88 ? 0 : clamp(F * 1.5 - stag[i] * .5, 0, 1); fi = fi * fi * (3 - 2 * fi);
          const px = P[j] * beat, py = P[j + 1] * beat, pz = P[j + 2] * beat;
          const ax = px * cY + pz * sY, az0 = -px * sY + pz * cY;
          const ay = py * cX - az0 * sX, az = py * sX + az0 * cX;
          const wx = ax * sc + cx, wy = ay * sc + cy, wz = az * sc;
          x = dx + (wx - dx) * fi; y = dy + (wy - dy) * fi; z = dz + (wz - dz) * fi;
        } else { x = dx; y = dy; z = dz; fi = 0; }
        const k = 1 - Math.pow(1 - (.05 + stag[i] * .06), dt * 60);
        cur[j] += (x - cur[j]) * k; cur[j + 1] += (y - cur[j + 1]) * k; cur[j + 2] += (z - cur[j + 2]) * k;
        form[i] += (fi - form[i]) * k;
      }
      if (kick) {
        for (let i = 0; i < N; i++) {
          const j = i * 3, ex = cur[j] - kick.x, ey = cur[j + 1] - kick.y, ez = cur[j + 2];
          const l = Math.hypot(ex, ey, ez) || 1, f = kick.f * (.4 + rand() * .9);
          cur[j] += ex / l * f; cur[j + 1] += ey / l * f; cur[j + 2] += ez / l * f;
        }
        kick = null;
      }
      posAttr.needsUpdate = true; formAttr.needsUpdate = true;

      let inDark = 0;
      for (const d of darks) { const r = d.getBoundingClientRect(); if (r.top < vc && r.bottom > vc) { inDark = 1; break; } }
      darkMix += (inDark - darkMix) * .06;
      mat.uniforms.uColor.value.copy(colLight).lerp(colDark, darkMix);
      mat.uniforms.uAlpha.value = .82 + .18 * darkMix;
      mat.uniforms.uTime.value = t;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);

    return {
      open() { opened = true; },
      burst(el) {
        const r = el.getBoundingClientRect();
        const ppu = innerHeight / (2 * Math.tan(FOV * Math.PI / 360) * CAMZ);
        kick = { x: (r.left + r.width / 2 - innerWidth / 2) / ppu, y: -(r.top + r.height / 2 - innerHeight / 2) / ppu, f: .9 };
      },
    };
  })();
  if (!GL) document.documentElement.classList.add('no-gl');

  /* =========================================================
     Opening card
     ========================================================= */
  const intro = $('#intro'), card = $('#card3d'), cardShadow = $('#cardShadow');
  let introRAF = 0;
  (function introLoop(now) {
    const t = (now || 0) / 1000;
    const live = performance.now() - tilt.lastMove < 2500;
    const ix = live ? tilt.x : Math.sin(t * .7) * .4;
    const iy = live ? tilt.y : Math.cos(t * .55) * .3;
    card.style.setProperty('--ry', (ix * 16).toFixed(2) + 'deg');
    card.style.setProperty('--rx', (-iy * 13).toFixed(2) + 'deg');
    card.style.setProperty('--sx', (50 + ix * 45).toFixed(1) + '%');
    card.style.setProperty('--sy', (30 + iy * 45).toFixed(1) + '%');
    const fl = Math.sin(t * 1.3);
    card.style.translate = `0 ${(fl * 6).toFixed(2)}px`;
    cardShadow.style.transform = `scale(${(1 - fl * .06).toFixed(3)})`;
    cardShadow.style.opacity = (.8 - fl * .15).toFixed(2);
    introRAF = requestAnimationFrame(introLoop);
  })();

  // pre-hide hero so it can bloom in as the card flies away
  const heroChars = $$('[data-split="hero"]').flatMap(splitChars);
  if (hasGSAP && !reduce) {
    gsap.set(heroChars, { yPercent: 105, rotateX: -85, opacity: 0 });
    gsap.set('[data-hero]', { opacity: 0, y: 24, filter: 'blur(8px)' });
  }
  function heroIn() {
    if (!hasGSAP || reduce) return;
    gsap.to('[data-hero]', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.3, stagger: .12, ease: 'power3.out', clearProps: 'filter' });
    gsap.to(heroChars, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.4, stagger: .055, ease: 'expo.out', delay: .2 });
  }

  let isOpen = false;
  function openInvite(instant) {
    if (isOpen) return;
    isOpen = true;
    enableGyro();
    wantMusic = true;
    if (!mBtn.hidden) bgm.play().then(() => mBtn.classList.remove('paused')).catch(() => {});
    if (navigator.vibrate) navigator.vibrate(14);
    const finish = () => {
      cancelAnimationFrame(introRAF);
      intro.remove();
      document.body.classList.remove('is-locked');
      if (GL) GL.open();
      initScroll();
    };
    if (instant || !hasGSAP || reduce) {
      if (GL) GL.open();
      heroIn();
      finish();
      return;
    }
    cancelAnimationFrame(introRAF);
    const tl = gsap.timeline({ onComplete: finish });
    tl.to('#ringFg', { strokeDashoffset: 0, duration: .6, ease: 'power2.inOut' })
      .to('.open-btn, .intro-hint', { opacity: 0, duration: .35, ease: 'power2.in' }, '-=.05')
      .to(card, { rotationX: 0, rotationY: 0, duration: .35, ease: 'power2.out' }, '<')
      .add(() => { if (GL) GL.open(); }, '-=.05')
      .to(card, { z: 560, opacity: 0, duration: 1.05, ease: 'power3.in' })
      .to(cardShadow, { opacity: 0, scale: .4, duration: .5 }, '<')
      .to(intro, { opacity: 0, duration: .55, ease: 'power1.out' }, '-=.5')
      .add(heroIn, '-=.45');
  }
  $('#openBtn').addEventListener('click', () => openInvite(false));

  /* =========================================================
     Scroll choreography
     ========================================================= */
  function initScroll() {
    const words = splitWords($('#scrubText'));
    if (!hasGSAP || reduce) { words.forEach(w => (w.style.opacity = 1)); return; }

    $$('[data-split]:not([data-split="hero"])').forEach(el => {
      gsap.from(splitChars(el), {
        yPercent: 100, rotateX: -80, opacity: 0, duration: 1.15, stagger: .028, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
    $$('[data-reveal]').forEach(el => {
      gsap.from(el, {
        y: 28, opacity: 0, filter: 'blur(6px)', duration: 1.1, ease: 'power3.out', clearProps: 'filter',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      });
    });
    const st = $('[data-words]');
    gsap.from(splitWords(st), {
      opacity: 0, y: 20, rotateX: -60, filter: 'blur(6px)', stagger: .055, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: st, start: 'top 86%', once: true },
    });
    $$('.person').forEach(el => {
      const left = el.classList.contains('from-left');
      gsap.from(el, {
        x: left ? -70 : 70, rotationY: left ? -40 : 40, transformPerspective: 900, opacity: 0, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });
    $$('.dark .bg').forEach(bg => {
      gsap.fromTo(bg, { scaleX: .86, borderRadius: '56px 56px 0px 0px' }, {
        scaleX: 1, borderRadius: '0px 0px 0px 0px', ease: 'none',
        scrollTrigger: { trigger: bg.parentElement, start: 'top bottom', end: 'top 25%', scrub: true },
      });
    });
    gsap.from('#mono', { opacity: 0, scale: .6, rotationX: 50, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '#mono', start: 'top 90%', once: true } });

    ScrollTrigger.create({
      trigger: '#scrubText', start: 'top 82%', end: 'bottom 42%', scrub: true,
      onUpdate: self => {
        const p = self.progress * words.length;
        words.forEach((w, i) => { w.style.opacity = (.16 + .84 * clamp(p - i, 0, 1)).toFixed(3); });
      },
    });

    initDeck();
    ScrollTrigger.refresh();
  }

  /* ---------- timeline: pinned 3D deck ---------- */
  function initDeck() {
    const sec = $('#events'), cards = $$('.ev', sec), n = cards.length;
    const num = $('#deckNum'), bar = $('#deckBar');
    sec.classList.add('stacked');
    function layout(p) {
      cards.forEach((c, k) => {
        const rel = k - p;
        let y, z, rx, s, o;
        if (rel >= 0) {
          const r = Math.min(rel, 3);
          y = r * 16; z = -r * 80; rx = 0; s = 1 - r * .05; o = rel > 2.6 ? 0 : 1 - Math.max(0, rel - 1.6);
        } else {
          const e = Math.min(-rel, 1);
          y = -e * innerHeight * .8; z = e * 150; rx = e * 26; s = 1; o = 1 - e * 1.15;
        }
        gsap.set(c, { y, z, rotationX: rx, scale: s, opacity: clamp(o, 0, 1), zIndex: n - k });
      });
      const idx = Math.min(n, Math.round(p) + 1);
      num.textContent = String(idx).padStart(2, '0');
      bar.style.transform = `scaleX(${(.25 + .75 * p / (n - 1)).toFixed(3)})`;
    }
    layout(0);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: () => '+=' + Math.round(innerHeight * (n - 1) * .85),
      pin: true, scrub: .6, anticipatePin: 1,
      snap: { snapTo: 1 / (n - 1), duration: { min: .2, max: .5 }, delay: .06, ease: 'power1.inOut' },
      onUpdate: self => layout(self.progress * (n - 1)),
    });
  }

  /* =========================================================
     Scratch to reveal
     ========================================================= */
  (function scratch() {
    const wrap = $('#scratch'), cv = $('canvas', wrap);
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    let w = 0, h = 0, dpr = 1, started = false, done = false, drawing = false, last = null, moves = 0;

    function paint() {
      w = wrap.clientWidth; h = wrap.clientHeight; dpr = Math.min(devicePixelRatio || 1, 2);
      if (!w) return;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#8E7550'); g.addColorStop(.28, '#D9C7A0'); g.addColorStop(.46, '#B8A076');
      g.addColorStop(.62, '#F2E7CF'); g.addColorStop(.8, '#AA8E5C'); g.addColorStop(1, '#7E6743');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < w * h / 36; i++) {
        ctx.fillStyle = `rgba(${rand() < .5 ? '255,255,255' : '60,45,20'},${(rand() * .2).toFixed(2)})`;
        ctx.fillRect(rand() * w, rand() * h, 1, 1);
      }
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1;
      for (let x = -h; x < w; x += 7) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke(); }
      ctx.fillStyle = 'rgba(40,30,15,.82)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `italic ${Math.round(h * .2)}px "Instrument Serif", Georgia, serif`;
      ctx.fillText('Scratch here', w / 2, h * .46);
      ctx.font = `600 ${Math.max(9, Math.round(h * .058))}px Manrope, sans-serif`;
      spaced('TO REVEAL THE DATE', w / 2, h * .64, 2.6);
    }
    function spaced(text, x, y, sp) {
      const ch = [...text], ws = ch.map(c => ctx.measureText(c).width);
      let cx = x - (ws.reduce((a, b) => a + b, 0) + sp * (ch.length - 1)) / 2;
      ctx.textAlign = 'left';
      ch.forEach((c, i) => { ctx.fillText(c, cx, y); cx += ws[i] + sp; });
      ctx.textAlign = 'center';
    }
    const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * w / r.width, y: (e.clientY - r.top) * h / r.height }; };
    function stroke(p) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = Math.max(32, h * .24); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p;
      if (++moves % 8 === 0) check();
    }
    function check() {
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0, total = 0;
      for (let i = 3; i < d.length; i += 4 * 20) { total++; if (d[i] < 40) clear++; }
      if (clear / total > .5) reveal();
    }
    function reveal() {
      if (done) return;
      done = true;
      wrap.classList.add('done', 'touched');
      $('#date').classList.add('revealed');
      if (GL) GL.burst(wrap);
      if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
      if (hasGSAP && !reduce) gsap.from('.scratch-under > *', { y: 18, opacity: 0, scale: .92, stagger: .09, duration: 1, ease: 'back.out(1.7)' });
    }
    cv.addEventListener('pointerdown', e => {
      if (done) return;
      drawing = true; started = true; wrap.classList.add('touched');
      cv.setPointerCapture(e.pointerId);
      last = pos(e); stroke({ x: last.x + .1, y: last.y + .1 });
    });
    cv.addEventListener('pointermove', e => { if (drawing && !done) stroke(pos(e)); });
    const end = () => { if (drawing) { drawing = false; if (!done) check(); } };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    $('#revealBtn').addEventListener('click', reveal);
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(paint);
    addEventListener('resize', () => { if (!started && !done) paint(); });
  })();

  /* =========================================================
     3D extruded AJ monogram — drag to spin
     ========================================================= */
  (function mono() {
    const box = $('#mono');
    const rot = document.createElement('div');
    rot.className = 'mono-rot';
    const L = 18;
    let h = '<div class="mono-ring" style="transform:translateZ(-30px)"></div>';
    for (let i = L; i >= 1; i--) {
      const light = 22 + (L - i) * 1.3;
      h += `<div class="mono-layer" aria-hidden="true" style="transform:translateZ(${(-i * 1.25).toFixed(2)}px);color:hsl(37,32%,${light.toFixed(1)}%)">AJ</div>`;
    }
    h += '<div class="mono-layer front" aria-hidden="true">AJ</div>';
    h += '<div class="mono-ring" style="transform:translateZ(18px);width:200px;height:200px;margin:-100px 0 0 -100px;border-color:rgba(220,203,166,.16)"></div>';
    rot.innerHTML = h;
    box.appendChild(rot);

    let ang = 0, vel = 0, dragging = false, lx = 0, visible = false;
    box.addEventListener('pointerdown', e => { dragging = true; lx = e.clientX; vel = 0; box.setPointerCapture(e.pointerId); });
    box.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lx; lx = e.clientX; vel = dx * .7; ang += dx * .7; });
    const up = () => { dragging = false; };
    box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(box);
    else visible = true;
    (function loop(now) {
      requestAnimationFrame(loop);
      if (!visible) return;
      const t = now / 1000;
      if (!dragging) {
        ang += vel; vel *= .95;
        if (Math.abs(vel) < .4) { const home = Math.round(ang / 360) * 360; ang += (home - ang) * .05; }
      }
      const ry = ang + (reduce ? 0 : Math.sin(t * .8) * 16) + tilt.x * 22;
      const rx = (reduce ? 0 : Math.cos(t * .6) * 7) - tilt.y * 12;
      rot.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    })(0);
  })();

  /* =========================================================
     Flip-clock countdown
     ========================================================= */
  (function countdown() {
    const target = new Date('2026-12-02T20:30:00+05:30').getTime();
    const flips = {};
    $$('.flip').forEach(el => {
      el.innerHTML = '<div class="half top"><span>00</span></div><div class="half bot"><span>00</span></div><div class="leaf"><div class="half lf"><span>00</span></div><div class="half lb"><span>00</span></div></div>';
      el._v = null;
      flips[el.dataset.u] = el;
    });
    function set(el, v) {
      if (el._v === v) return;
      const sp = { top: $('.top span', el), bot: $('.bot span', el), lf: $('.lf span', el), lb: $('.lb span', el) };
      if (el._v === null || reduce) { Object.values(sp).forEach(s => (s.textContent = v)); el._v = v; return; }
      const old = el._v; el._v = v;
      sp.top.textContent = v; sp.lf.textContent = old; sp.lb.textContent = v; sp.bot.textContent = old;
      el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
      clearTimeout(el._t);
      el._t = setTimeout(() => { sp.bot.textContent = v; sp.lf.textContent = v; el.classList.remove('go'); }, 650);
    }
    (function tick() {
      const diff = target - Date.now();
      if (diff <= 0) { $('#flips').innerHTML = '<p class="cd-done">The celebrations have begun</p>'; return; }
      const pad = n => String(n).padStart(2, '0');
      set(flips.d, pad(Math.floor(diff / 864e5)));
      set(flips.h, pad(Math.floor(diff / 36e5) % 24));
      set(flips.m, pad(Math.floor(diff / 6e4) % 60));
      set(flips.s, pad(Math.floor(diff / 1e3) % 60));
      setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    })();
  })();

  /* =========================================================
     Touch-tilt glass cards
     ========================================================= */
  $$('[data-tilt]').forEach(el => {
    const set = (rx, ry) => {
      if (hasGSAP) gsap.to(el, { rotationX: rx, rotationY: ry, transformPerspective: 900, duration: .6, ease: 'power2.out', overwrite: 'auto' });
      else { el.style.setProperty('--rx', rx + 'deg'); el.style.setProperty('--ry', ry + 'deg'); }
    };
    const move = e => {
      const r = el.getBoundingClientRect();
      const px = clamp((e.clientX - r.left) / r.width, 0, 1), py = clamp((e.clientY - r.top) / r.height, 0, 1);
      set((py - .5) * -9, (px - .5) * 11);
      el.style.setProperty('--sx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--sy', (py * 100).toFixed(1) + '%');
      el.classList.add('touching');
    };
    const leave = () => { set(0, 0); el.classList.remove('touching'); };
    el.addEventListener('pointerdown', move);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('pointerup', leave);
    el.addEventListener('pointercancel', leave);
  });

  /* =========================================================
     Small things: progress, calendar, music, share
     ========================================================= */
  const bar = $('#progressBar');
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? (scrollY / max).toFixed(4) : 0})`;
  }, { passive: true });

  $$('.ev').forEach(ev => {
    const q = new URLSearchParams({
      action: 'TEMPLATE', text: ev.dataset.calTitle,
      dates: `${ev.dataset.calStart}/${ev.dataset.calEnd}`,
      location: ev.dataset.calLoc,
      details: 'With love, the Chourasia Family. You just come — we will take care of the rest.',
      ctz: 'Asia/Kolkata',
    });
    $('.ev-cal', ev).href = `https://calendar.google.com/calendar/render?${q}`;
  });

  var wantMusic = false;
  const bgm = $('#bgm'), mBtn = $('#musicBtn');
  bgm.addEventListener('canplay', () => {
    mBtn.hidden = false;
    if (wantMusic) bgm.play().catch(() => mBtn.classList.add('paused'));
    else mBtn.classList.add('paused');
  }, { once: true });
  mBtn.addEventListener('click', () => {
    if (bgm.paused) bgm.play().then(() => mBtn.classList.remove('paused')).catch(() => {});
    else { bgm.pause(); mBtn.classList.add('paused'); }
  });

  const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); };
  $('#shareBtn').addEventListener('click', async () => {
    const data = { title: 'Aditi & Jeet — Wedding Invitation', text: 'You are invited to the wedding of Aditi & Jeet.', url: location.href.split(/[?#]/)[0] };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); toast('Link copied'); }
    } catch (_) { /* closed */ }
  });

  if (params.has('open')) openInvite(true);
})();
