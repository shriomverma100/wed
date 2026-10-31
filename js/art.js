/* Hand-drawn line illustrations for the invitation.
   Every stroke uses class "s" (drawn on when it scrolls into view);
   small filled accents use class "f" (fade in after the lines). */
window.ART = (() => {
  'use strict';
  const r1 = n => Math.round(n * 10) / 10;
  const S = (d, extra = '') => `<path class="s" d="${d}" ${extra}/>`;
  const F = (d, extra = '') => `<path class="f" d="${d}" ${extra}/>`;
  const circ = (cx, cy, r) => `M${r1(cx - r)} ${r1(cy)} a${r} ${r} 0 1 0 ${r1(2 * r)} 0 a${r} ${r} 0 1 0 ${r1(-2 * r)} 0`;
  const dot = (cx, cy, r = 1.3, extra = '') => `<circle class="f" cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" ${extra}/>`;
  const svg = (vb, body, cls = '') => `<svg class="ill ${cls}" viewBox="${vb}" aria-hidden="true">${body}</svg>`;

  /* scalloped marigold outline */
  function flower(cx, cy, r, n = 10) {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = i / n * Math.PI * 2, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      d += i === 0 ? `M${r1(x)} ${r1(y)}` : ` A${r1(r * .36)} ${r1(r * .36)} 0 0 1 ${r1(x)} ${r1(y)}`;
    }
    return S(d) + S(circ(cx, cy, r * .42)) + dot(cx, cy, Math.max(.9, r * .14));
  }
  /* points along a cubic bezier */
  function bez(p0, p1, p2, p3, n) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      out.push([
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ]);
    }
    return out;
  }

  /* Mughal multifoil arch (used by the hero frame and the card cover) */
  function archPath(x0, y0, W, H, archH, lobes) {
    const P = [[0, archH], [0, archH * .42], [W * .26, archH * .1], [W / 2, 0]];
    const pts = bez(P[0], P[1], P[2], P[3], lobes);
    const all = pts.concat(pts.slice(0, -1).reverse().map(([x, y]) => [W - x, y]));
    let d = `M${r1(x0)} ${r1(y0 + H)} L${r1(x0)} ${r1(y0 + archH)}`;
    for (let i = 1; i < all.length; i++) {
      const [ax, ay] = all[i - 1], [bx, by] = all[i];
      const rr = Math.hypot(bx - ax, by - ay) * .62;
      d += ` A${r1(rr)} ${r1(rr)} 0 0 1 ${r1(x0 + bx)} ${r1(y0 + by)}`;
    }
    return d + ` L${r1(x0 + W)} ${r1(y0 + H)}`;
  }

  const kalash = () => svg('0 0 120 150',
    S('M60 20 C71 20 75 31 70 39 C66 45 54 45 50 39 C45 31 49 20 60 20Z') +
    S('M60 20 C57 13 63 9 60 3') +
    S('M55 24 C53 30 54 36 57 40') + S('M65 24 C67 30 66 36 63 40') +
    S('M50 44 C38 38 24 40 14 50 C27 53 40 51 50 44Z') + S('M48 45 L18 49') +
    S('M70 44 C82 38 96 40 106 50 C93 53 80 51 70 44Z') + S('M72 45 L102 49') +
    S('M52 42 C44 32 34 28 24 30 C30 39 40 44 52 42Z') + S('M50 41 L28 32') +
    S('M68 42 C76 32 86 28 96 30 C90 39 80 44 68 42Z') + S('M70 41 L92 32') +
    S('M42 46 H78') + S('M44 46 C44 51 48 53 50 55 H70 C72 53 76 51 76 46') +
    S('M50 55 C28 61 20 86 28 106 C35 122 85 122 92 106 C100 86 92 61 70 55') +
    S('M50 63 C55 71 65 71 70 63') +
    S('M27 84 C48 92 72 92 93 84') + S('M29 94 C49 102 71 102 91 94') +
    [36, 44, 52, 60, 68, 76, 84].map((x, i) => dot(x, 90.5 + Math.sin(i / 6 * Math.PI) * 3.4, 1.1)).join('') +
    S('M44 120 C50 127 70 127 76 120') + S('M40 127 H80') +
    dot(20, 70, 1) + dot(100, 74, 1) + dot(14, 98, .8) + dot(106, 104, .8),
    'ill-kalash');

  function hand() {
    let petals = '';
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2, cx = 56, cy = 112;
      const p = (aa, r) => `${r1(cx + r * Math.cos(aa))} ${r1(cy + r * Math.sin(aa))}`;
      petals += S(`M${p(a - .25, 11)} Q${p(a, 18)} ${p(a + .25, 11)}`);
    }
    return svg('0 0 110 160',
      S('M30 154 L28 110 C27 102 24 96 18 90 C12 84 6 78 9 73 C12 68 19 71 24 77 L32 86 L32 36 C32 28 44 28 44 36 L44 76 L45 26 C45 18 57 18 57 26 L57 76 L58 32 C58 24 70 24 70 32 L70 80 L71 48 C71 41 81 41 81 48 L81 102 C81 118 76 130 74 154') +
      S(circ(56, 112, 11)) + S(circ(56, 112, 6)) + dot(56, 112, 1.6) + petals +
      S('M33 41 Q38 44.5 43 41') + S('M46 31 Q51 34.5 56 31') + S('M59 37 Q64 40.5 69 37') + S('M72 53 Q76 56 80 53') +
      [[38, 52], [38, 60], [38, 68], [51, 42], [51, 50], [51, 58], [51, 66], [64, 48], [64, 56], [64, 64], [76, 62], [76, 70]].map(([x, y]) => dot(x, y, 1.1)).join('') +
      S('M13 77 Q19 80 23 85') + dot(16, 82, .9) +
      S('M56 129 C52 133 52 137 56 139 C60 137 60 133 56 129Z') +
      S('M29 141 C42 146 62 146 75 141') + S('M29 147 C42 152 62 152 75 147') +
      [36, 44, 52, 60, 68].map(x => dot(x, 145, .9)).join(''),
      'ill-hand');
  }

  const bowl = () => svg('0 0 160 130',
    '<g class="steam">' + S('M66 38 C60 31 72 25 66 16') + S('M80 34 C74 27 86 21 80 10') + S('M94 38 C88 31 100 25 94 16') + '</g>' +
    S('M46 62 C54 44 106 44 114 62') +
    S('M22 64 C22 57 138 57 138 64') + S('M22 64 C22 71 138 71 138 64') +
    S('M22 64 C24 90 50 106 80 106 C110 106 136 90 138 64') +
    S('M34 82 C60 92 100 92 126 82') +
    [46, 58, 70, 80, 90, 102, 114].map((x, i) => dot(x, 86.6 + Math.sin(i / 6 * Math.PI) * 2.6, 1)).join('') +
    S('M62 106 L58 116 H102 L98 106') +
    flower(20, 104, 9) + flower(144, 100, 8) + flower(152, 116, 5, 8) + flower(10, 120, 5, 8) +
    S('M30 114 C38 119 46 117 50 111 C42 109 34 111 30 114Z') +
    S('M132 112 C124 118 116 117 112 111 C120 108 128 109 132 112Z'),
    'ill-bowl');

  function dholak() {
    const bells = [[44, 112], [56, 116], [68, 118], [80, 119], [92, 118], [104, 116], [116, 112]]
      .map(([x, y]) => S(circ(x, y, 3.2)) + S(`M${x} ${y + .6} V${y + 3.2}`)).join('');
    return svg('0 0 160 130',
      S('M34 42 C23 42 23 86 34 86 C45 86 45 42 34 42Z') +
      S('M126 42 C115 42 115 86 126 86 C137 86 137 42 126 42Z') +
      S('M34 42 C60 35 100 35 126 42') + S('M34 86 C60 93 100 93 126 86') +
      S('M42 44 L52 88 L62 40 L72 90 L82 39 L92 90 L102 40 L112 88 L120 44') +
      S('M36 104 C64 116 96 116 124 104') + bells +
      '<g class="notes">' +
      S('M66 28 V8 L80 4 V24') + F('M58.5 28 a3.6 2.6 -20 1 0 7.2 0 a3.6 2.6 -20 1 0 -7.2 0') + F('M72.5 24 a3.6 2.6 -20 1 0 7.2 0 a3.6 2.6 -20 1 0 -7.2 0') +
      '</g><g class="notes n2">' +
      S('M104 22 V4 C108 8 112 8 113 14') + F('M96.5 22 a3.6 2.6 -20 1 0 7.2 0 a3.6 2.6 -20 1 0 -7.2 0') +
      '</g>' +
      S('M24 18 v8 M20 22 h8') + S('M140 26 v6 M137 29 h6'),
      'ill-dholak');
  }

  function mandap() {
    let scallops = 'M26 46';
    for (let x = 26; x < 144; x += 13.1) scallops += ` A6.55 6.55 0 0 0 ${r1(x + 13.1)} 46`;
    const swag = bez([38, 54], [52, 70], [70, 70], [85, 54], 7).concat(bez([85, 54], [100, 70], [118, 70], [132, 54], 7).slice(1));
    return svg('0 0 170 140',
      S('M26 46 C42 16 128 16 144 46') + S('M22 46 H148') + S(scallops) +
      S('M85 23 V11') + S(circ(85, 8, 2.6)) + S('M79 24 C79 19 91 19 91 24') +
      S('M30 46 V122') + S('M38 46 V122') + S('M27 51 H41') + S('M27 117 H41') +
      S('M132 46 V122') + S('M140 46 V122') + S('M129 51 H143') + S('M129 117 H143') +
      S('M60 52 V114', 'opacity=".5"') + S('M110 52 V114', 'opacity=".5"') +
      swag.map(([x, y]) => dot(x, y, 1.5)).join('') +
      S('M60 46 V64') + S('M85 46 V58') + S('M110 46 V64') + dot(60, 66, 1.6) + dot(85, 60, 1.6) + dot(110, 66, 1.6) +
      S('M66 124 L70 110 H100 L104 124 Z') + S('M70 116 H100') + S('M58 128 H112') +
      '<g class="fire">' +
      F('M85 108 C76 100 79 90 85 82 C87 90 95 92 93 101 C92 105 89 108 85 108Z', 'class="f flame"') +
      F('M85 106 C81.5 102 82.5 97 85 93.5 C87 97 89 99.5 88 102.5 C87.4 104.5 86.2 106 85 106Z', 'class="f flame-in"') +
      '</g>' +
      dot(80, 74, 1, 'class="f spark"') + dot(90, 70, .9, 'class="f spark s2"') + dot(85, 66, .8, 'class="f spark s3"') +
      S('M8 132 H162'),
      'ill-mandap');
  }

  const diya = () => svg('0 0 60 64',
    `<circle class="f glow" cx="30" cy="24" r="15"/>` +
    F('M30 10 C37 18 37 27 30 34 C23 27 23 18 30 10Z', 'class="f flame"') +
    F('M30 19 C33 23 33 28 30 31 C27 28 27 23 30 19Z', 'class="f flame-in"') +
    S('M8 40 C12 52 48 52 52 40 Z') + S('M52 40 C57 38 59 35 58 32') + S('M30 40 V35') +
    S('M24 50 L22 56 H38 L36 50') + S('M14 44 C24 47 36 47 46 44'),
    'ill-diya');

  const flourish = () => svg('0 0 240 36',
    S('M120 30 C113 22 113 13 120 6 C127 13 127 22 120 30Z') +
    S('M120 30 C110 29 103 23 102 16 C111 17 117 23 120 30Z') +
    S('M120 30 C130 29 137 23 138 16 C129 17 123 23 120 30Z') +
    S('M98 24 C84 26 76 14 64 18 C56 21 58 31 65 30 C70 29 69 23 64 24') + S('M58 26 H12') + dot(7, 26, 1.6) +
    S('M142 24 C156 26 164 14 176 18 C184 21 182 31 175 30 C170 29 171 23 176 24') + S('M182 26 H228') + dot(233, 26, 1.6),
    'ill-flourish');

  const corner = cls => svg('0 0 44 44',
    S('M2 42 V16 C2 8 8 2 16 2 H42') + S('M8 34 V20 C8 13 13 8 20 8 H34') +
    S('M12 12 C15 7 21 7 24 11 C20 15 15 16 12 12Z') + dot(5, 5, 1.3),
    'ill-corner ' + (cls || ''));

  const bell = () => svg('0 0 40 100',
    S('M20 0 V35') + dot(20, 8, 1.2) + dot(20, 17, 1.2) + dot(20, 26, 1.2) +
    S(circ(20, 37, 2.2)) +
    S('M20 39.5 C12 39.5 9 49 9 58 L6 68 H34 L31 58 C31 49 28 39.5 20 39.5Z') +
    S('M5 68 H35') + S('M11 58 H29') + dot(20, 74, 3) + S('M20 77 V88') + dot(20, 90, 1.6),
    'ill-bell');

  function route() {
    const road = 'M58 104 C110 140 168 20 252 66';
    const pts = bez([58, 104], [110, 140], [168, 20], [252, 66], 18);
    return svg('0 0 320 150',
      S(road) + pts.slice(1, -1).map(([x, y]) => dot(x, y - 6, .8, 'opacity=".5"')).join('') +
      S('M28 112 V96 L44 82 L60 96 V112 Z') + S('M40 112 V102 H48 V112') + S('M22 112 H66') +
      S('M262 80 C246 62 248 38 262 36 C276 38 278 62 262 80Z') + S(circ(262, 54, 5)) +
      S('M118 46 C112 42 114 32 120 32 C126 32 128 42 122 46 Z M120 46 V54') +
      S('M196 104 C190 100 192 90 198 90 C204 90 206 100 200 104 Z M198 104 V112') +
      S('M150 120 C145 117 146 109 151 109 C156 109 157 117 152 120 Z M151 120 V126') +
      `<circle class="f halo" r="9"><animateMotion dur="6s" repeatCount="indefinite" path="${road}" rotate="auto"/></circle>` +
      `<circle class="f" r="3.6"><animateMotion dur="6s" repeatCount="indefinite" path="${road}"/></circle>`,
      'ill-route');
  }

  function garland(W) {
    const step = W < 420 ? 30 : 36, n = Math.ceil(W / step) + 1, off = (W - (n - 1) * step) / 2;
    const lens = [3, 2, 4, 2, 3];
    let body = S(`M0 4 H${W}`);
    for (let i = 0; i < n - 1; i++) {
      const x = off + i * step + step / 2;
      body += S(`M${r1(x)} 4 C${r1(x + 5)} 10 ${r1(x + 5)} 20 ${r1(x)} 26 C${r1(x - 5)} 20 ${r1(x - 5)} 10 ${r1(x)} 4Z`);
    }
    for (let i = 0; i < n; i++) {
      const x = off + i * step, len = lens[i % lens.length];
      let g = `<g class="str" style="animation-delay:${(-i * .45).toFixed(2)}s">` + S(`M${r1(x)} 4 V${8 + len * 12}`);
      for (let k = 0; k < len; k++) g += flower(x, 12 + k * 12, 5, 9);
      g += dot(x, 14 + len * 12, 1.4) + '</g>';
      body += g;
    }
    return `<svg class="ill ill-garland" viewBox="0 0 ${W} 70" width="${W}" height="70" aria-hidden="true">${body}</svg>`;
  }

  function cover() {
    let rosette = S(circ(150, 210, 50)) + S(circ(150, 210, 58));
    for (let i = 0; i < 20; i++) {
      const a = i / 20 * Math.PI * 2, p = (aa, r) => `${r1(150 + r * Math.cos(aa))} ${r1(210 + r * Math.sin(aa))}`;
      rosette += S(`M${p(a - .12, 58)} Q${p(a, 72)} ${p(a + .12, 58)}`);
      rosette += dot(150 + 78 * Math.cos(a + .157), 210 + 78 * Math.sin(a + .157), .9);
    }
    const cn = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})">` +
      S('M0 40 V14 C0 6 6 0 14 0 H40') + S('M6 32 V18 C6 11 11 6 18 6 H32') + dot(4, 4, 1.2) + '</g>';
    return svg('0 0 300 420',
      S('M26 12 H274 Q288 12 288 26 V394 Q288 408 274 408 H26 Q12 408 12 394 V26 Q12 12 26 12Z') +
      S('M28 20 H272 Q280 20 280 28 V392 Q280 400 272 400 H28 Q20 400 20 392 V28 Q20 20 28 20Z', 'opacity=".55"') +
      cn(28, 28, 0) + cn(272, 28, 90) + cn(272, 392, 180) + cn(28, 392, 270) +
      S(archPath(62, 66, 176, 300, 118, 5)) + S(archPath(70, 76, 160, 290, 106, 5), 'opacity=".5"') +
      S('M150 50 V64') + S(circ(150, 46, 3)) +
      rosette +
      `<use class="f" href="#ganesh" x="135" y="96" width="30" height="30"/>` +
      `<text class="f cv-names" x="150" y="326" text-anchor="middle">Aditi &amp; Jeet</text>` +
      `<text class="f cv-small" x="150" y="352" text-anchor="middle">WEDDING INVITATION</text>`,
      'ill-cover');
  }

  return { archPath, kalash, hand, bowl, dholak, mandap, diya, flourish, corner, bell, route, garland, cover };
})();
