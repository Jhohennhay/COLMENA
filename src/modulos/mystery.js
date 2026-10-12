/* ══════════ MISTERIO ══════════
   1 · Las celdas que no has pisado están tapadas con cera: no se ve qué hay dentro.
   2 · Penumbra: solo se ve lo que alumbra algo (tu farol, los vecinos, velas, ventanas).
       Al encender el sello de un capítulo, sus celdas recuperan la luz.
   3 · Secretos: páginas del cuaderno escondidas en la oscuridad, símbolos que solo
       aparecen cuando la colmena late, y vecinos que no cuentan lo mismo.
   4 · Un latido que se oye más fuerte cuanto más cerca estás del Corazón. */
const isSeen = (id) => FREE || !!(PROG.F.seen && PROG.F.seen[id]);
const hexDist = (a, b) => {
  const dq = POS[a][0] - POS[b][0],
    dr = POS[a][1] - POS[b][1];
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
};

/* ── 1 · la tapa de cera ── */
function waxCap(p, id, locked) {
  const s = p.s,
    R0 = rng('cap' + id),
    top = HW * 0.86,
    base = locked ? '#B07434' : '#D9A24A';
  const g = p.g;
  g.save();
  g.shadowColor = 'rgba(40,20,5,.5)';
  g.shadowBlur = 26 * s;
  g.shadowOffsetY = 20 * s;
  g.fillStyle = C.amberD;
  g.beginPath();
  VO.forEach((v, i) => {
    const q = p.P(v[0], v[1], -BASE);
    i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]);
  });
  g.closePath();
  g.fill();
  g.restore();
  FRONT.forEach((e, k) => {
    const A = VO[e[0]],
      B = VO[e[1]];
    p.cut([p.P(A[0], A[1], -BASE), p.P(B[0], B[1], -BASE), p.P(B[0], B[1], top), p.P(A[0], A[1], top)], shade(base, [0.8, 0.7, 0.88][k]), {
      blur: 3,
      rough: 0.6,
    });
    for (let m = 0; m < 5; m++) {
      const u = rd(R0, 0.08, 0.92),
        z0 = rd(R0, top * 0.35, top * 0.9),
        L = rd(R0, 14, 38);
      p.line(
        [p.P(lerp(A[0], B[0], u), lerp(A[1], B[1], u), z0), p.P(lerp(A[0], B[0], u) + rd(R0, -4, 4), lerp(A[1], B[1], u), z0 - L)],
        shade(base, 1.08),
        3.2,
        0.55,
      );
    }
  });
  const lid = VO.map((v) => p.P(v[0], v[1], top));
  p.cut(lid, shade(base, 1.1), { sh: 0, rough: 0.7 });
  p.clip(lid, () => {
    const rt = 30;
    for (let q = -7; q <= 7; q++)
      for (let r = -7; r <= 7; r++) {
        const cx = 1.5 * rt * q,
          cy = Math.sqrt(3) * rt * (r + q / 2);
        if (Math.abs(cy) > R + rt || Math.abs(cx) > R + TH + rt) continue;
        p.cut(
          hexV(rt - 3, cx, cy).map((v) => p.P(v[0], v[1], top)),
          shade(base, rd(R0, 1.02, 1.2)),
          { sh: 0, rough: 0.35 },
        );
      }
    const c = p.P(-60, -80, top);
    p.flat(p.ell(c[0], c[1], 150, 60, 30), 'rgba(255,240,200,.16)');
  });
  p.line([...lid, lid[0]], shade(base, 0.62), 2, 0.7);
  const c = p.P(0, 0, top);
  if (locked) {
    p.flat(p.ell(c[0], c[1], 30, 30, 28), '#7A3E22');
    p.flat(p.ell(c[0], c[1], 24, 24, 24), '#96502C');
    p.flat(p.ell(c[0], c[1] - 4 * s, 5.5, 5.5, 14), '#F3E0C0');
    p.flat(
      [
        [c[0] - 3 * s, c[1] - 2 * s],
        [c[0] + 3 * s, c[1] - 2 * s],
        [c[0] + 4.5 * s, c[1] + 9 * s],
        [c[0] - 4.5 * s, c[1] + 9 * s],
      ],
      '#F3E0C0',
    );
  }
}
/* las siluetas, iconos, carteles y rótulos no revelan lo que no has visto */
{
  const g0 = STYLE.ghost,
    gi = STYLE.ghostIcon,
    sg = STYLE.sign,
    dl = STYLE.doorLabel;
  STYLE.ghost = (p, id, a, named, locked) => {
    if (!isSeen(id) || locked) {
      const g = p.g;
      g.save();
      g.globalAlpha = a;
      waxCap(p, id, locked);
      g.restore();
      return;
    }
    g0(p, id, a, named, locked);
  };
  STYLE.ghostIcon = (p, id, a, named, locked) => {
    if (isSeen(id)) return gi(p, id, a, named, locked);
    if (locked) return;
    const s = p.s,
      c = p.P(0, 0, HW * 0.86),
      g = p.g;
    g.save();
    g.globalAlpha = Math.max(0.5, a);
    p.flat(p.ell(c[0], c[1], 20, 20, 24), 'rgba(90,50,20,.45)');
    p.text('?', c[0], c[1] + 1 * s, 22, '#FBE8B0', { w: 600 });
    g.restore();
  };
  STYLE.sign = (p, d, tg, x, y, z) => {
    if (isSeen(tg.id)) return sg(p, d, tg, x, y, z);
    const s = p.s,
      b = p.P(x, y, -8),
      tp = p.P(x, y, 40);
    p.flat(p.ell(b[0], b[1], 10, 3.5), 'rgba(70,40,15,.25)');
    p.line([b, tp], '#9A6230', 3, 1, { sh: 1 });
    p.cut(p.ell(tp[0], tp[1] - 6 * s, 11, 11, 20), '#8A6A4A', { blur: 3, rough: 0.5 });
    p.text('?', tp[0], tp[1] - 5.5 * s, 12, '#FFF4D6', { w: 600 });
  };
  STYLE.doorLabel = (p, d, tg, a, open) => {
    if (isSeen(tg.id)) return dl(p, d, tg, a, open);
    dl(p, d, { id: '_x' }, a, open);
  };
  SEASON._x = { name: 'lo desconocido', icon: '?', seal: '#8A6A4A', tint: '#C9934C', door: '#E9DCC6' };
}

/* ── 2 · penumbra ── */
const LIGHTS = {
  pri: [[0, -255, 90, 170]],
  ver: [
    [0, -255, 90, 190],
    [-200, -60, 150, 160],
  ],
  oto: [[-10, -255, 90, 150]],
  inv: [
    [-228, -110, 20, 190],
    [-160, -230, 90, 100],
  ],
  esp: [
    [20, -60, 150, 120],
    [205, -125, 110, 110],
  ],
  oce: [[0, -250, 95, 150]],
  des: [[0, -255, 100, 190]],
  ant: [[-205, -125, 100, 170]],
  col: [
    [-150, -240, 90, 120],
    [150, -130, 70, 110],
  ],
  bib: [
    [-40, -40, 70, 120],
    [0, -255, 90, 130],
  ],
  coc: [[170, -105, 50, 190]],
  rel: [
    [-185, -50, 110, 110],
    [120, -40, 60, 90],
  ],
  inn: [
    [110, -190, 112, 170],
    [-130, -70, 30, 110],
    [0, -250, 110, 120],
  ],
  tea: [[210, -90, 80, 190]],
  far: [[0, -110, 70, 260]],
  tre: [
    [-120, -195, 112, 160],
    [0, -255, 100, 110],
  ],
  sot: [
    [155, 108, 40, 130],
    [-110, -195, 40, 90],
  ],
  cue: [
    [-120, -60, 40, 150],
    [200, 40, 40, 80],
  ],
  vol: [
    [120, -170, 10, 210],
    [0, -250, 110, 130],
  ],
  cum: [[0, -240, 120, 230]],
  dsv: [
    [220, -120, 90, 130],
    [0, -240, 90, 90],
  ],
  est: [[-100, -185, 56, 140]],
  ret: [
    [-40, -40, 80, 130],
    [0, -255, 90, 100],
  ],
  jar: [[0, -240, 100, 210]],
  cor: [[0, -60, 86, 240]],
};
const CH_OF = (id) => (['pri', 'ver', 'oto', 'inv'].includes(id) ? 1 : NEW_CELLS.includes(id) ? 2 : id === 'cor' ? 9 : 3);
function darkLevel(id) {
  const F = PROG.F,
    ch = CH_OF(id);
  if (FREE && ch === 3) return 0.26;
  if (ch === 1 && F.done) return 0.1;
  if (ch === 2 && F.star) return 0.12;
  return 0.52;
}
const shadeC = document.createElement('canvas'),
  shadeG = shadeC.getContext('2d');
let DARKA = null;
let LIGHTSPR = null;
function lightSprite() {
  if (LIGHTSPR) return LIGHTSPR;
  const n = 128,
    c = newCanvas(n, n),
    g = c.getContext('2d'),
    gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  gr.addColorStop(0, 'rgba(0,0,0,1)');
  gr.addColorStop(0.45, 'rgba(0,0,0,.85)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, n, n);
  return (LIGHTSPR = c);
}
let GLOWSPR = null;
function glowSprite() {
  if (GLOWSPR) return GLOWSPR;
  const n = 128,
    c = newCanvas(n, n),
    g = c.getContext('2d'),
    gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  gr.addColorStop(0, 'rgba(255,196,110,.34)');
  gr.addColorStop(1, 'rgba(255,170,80,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, n, n);
  return (GLOWSPR = c);
}
/* se pinta sobre el cuarto actual (recortado a su silueta), a media resolución */
function drawShade(s, dt) {
  const tgt = inTitle || mapMode ? 0 : darkLevel(cur) * (STILL ? 0.8 : 1);
  DARKA = DARKA === null ? tgt : lerp(DARKA, tgt, Math.min(1, dt * 1.6));
  const beat = beatK();
  const a = clamp(DARKA - beat * 0.18, 0, 1);
  if (a < 0.02) return;
  const ox = camX + CW[cur][0] * s,
    oy = oyOf(cur, s),
    x0 = ox - (R + TH + 10) * s,
    y0 = oy - (HW + R * K + 30) * s,
    w = 2 * (R + TH + 10) * s,
    h = (HW + 2 * R * K + BASE + 60) * s,
    k = 0.5;
  const W = Math.max(8, Math.ceil(w * k)),
    H = Math.max(8, Math.ceil(h * k));
  if (shadeC.width !== W || shadeC.height !== H) {
    shadeC.width = W;
    shadeC.height = H;
  }
  const g = shadeG;
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, W, H);
  g.fillStyle = `rgba(16,9,30,${a})`;
  g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'destination-out';
  const spr = lightSprite(),
    L = [];
  const at = (x, y, z) => [(ox + x * s - x0) * k, (oy + (y * K - z) * s - y0) * k];
  const fl = STILL ? 0 : T;
  L.push([...at(Pl.x, Pl.y, 40), (210 + Math.sin(fl * 3.1) * 6) * s * k, 1]);
  const n = CELLS[cur].npc;
  L.push([...at(n.x, n.y, 50), 110 * s * k, 0.85]);
  for (const [x, y, z, r] of LIGHTS[cur] || []) L.push([...at(x, y, z), (r + Math.sin(fl * 2.3 + x) * r * 0.04) * s * k, 0.95]);
  for (const [cx, cy, r, al] of L) {
    g.globalAlpha = al;
    g.drawImage(spr, cx - r, cy - r, 2 * r, 2 * r * 0.8);
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  /* recorte a la silueta del cuarto: los vecinos ya tienen su propia noche */
  const P = (i, z) => [ox + VO[i][0] * s, oy + (VO[i][1] * K - z) * s];
  ctx.save();
  ctx.beginPath();
  const poly = [P(3, HW), P(4, HW), P(5, HW), P(0, HW), P(0, -BASE), P(1, -BASE), P(2, -BASE), P(3, -BASE)];
  ctx.moveTo(...poly[0]);
  for (const q of poly.slice(1)) ctx.lineTo(...q);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(shadeC, x0, y0, W / k, H / k);
  /* un poco de calor alrededor de las luces */
  ctx.globalCompositeOperation = 'lighter';
  const gs = glowSprite();
  ctx.globalAlpha = Math.min(1, a * 1.6);
  for (const [x, y, z, r] of LIGHTS[cur] || []) {
    const q = [ox + x * s, oy + (y * K - z) * s],
      rr = r * 0.7 * s;
    ctx.drawImage(gs, q[0] - rr, q[1] - rr * 0.8, 2 * rr, 1.6 * rr);
  }
  {
    const q = [ox + Pl.x * s, oy + (Pl.y * K - 40) * s],
      rr = 120 * s;
    ctx.drawImage(gs, q[0] - rr, q[1] - rr * 0.8, 2 * rr, 1.6 * rr);
  }
  ctx.restore();
}

/* ── 3 · el latido de la colmena ── */
let BEAT = { next: 14, t0: -99 };
const beatK = () => {
  const u = T - BEAT.t0;
  if (u < 0 || u > 2.4) return 0;
  return (Math.max(0, Math.sin((u * Math.PI) / 2.4)) * (1 + 0.5 * Math.sin(u * TAU * 1.6))) / 1.5;
};
function beatTick() {
  if (inTitle) return;
  if (T > BEAT.next) {
    BEAT.t0 = T;
    BEAT.next = T + rd(Math.random, 22, 32);
    Sound.sfx('beat');
    if (!STILL) buzz([30, 120, 30]);
    if (!said('beat1')) setTimeout(() => narrate(['La colmena late. Cuando late, se ve lo que la cera esconde.'], 'beat1'), 1600);
  }
  /* el pulso de fondo: más fuerte cuanto más cerca del Corazón */
  const d = hexDist(cur, 'cor'),
    v = clamp(1 - (d - 1) / 4, 0, 1);
  if (v > 0 && T > (BEAT.pulse || 0)) {
    BEAT.pulse = T + 1.5 - v * 0.3;
    Sound.sfx('thump', v);
  }
}

/* páginas del cuaderno de Amaranta: en el suelo, en rincones oscuros */
const PAGES = {
  ver: [
    165,
    105,
    'Día uno. Encontré la colmena parada y a un viejo apicultor dormido en el corazón. Me dijo que tenía mi edad cuando se durmió.',
  ],
  oto: [-205, 40, 'Le pedí a Ocre que no imprimiera esta página. Es la única que me ha obedecido.'],
  oce: [120, 175, 'Coral me preguntó qué pasa si el corazón deja de latir del todo. No le contesté. Ya lo sabía.'],
  bib: [190, 110, 'El libro sin título no es un libro. Es una puerta. Tomo lo sabe y por eso no lo busca de verdad.'],
  tea: [-190, 110, 'Telón ensaya un final en el que me quedo. Nunca le dije que el final ya lo escribí yo.'],
  sot: [-200, 70, 'Encontré noventa y nueve cartas con mi letra que yo no escribí. Fundí la mía, la número cien. La cera sabe a sal.'],
  jar: [170, 90, 'Planté un árbol sin nombre. Quien lo nombre tendrá que quedarse. Perdóname.'],
};
/* símbolos: un hexágono con puntos. Solo se ven cuando la colmena late */
const GLYPHS = { pri: [150, 40, 3], inv: [60, -60, 5], des: [-150, 60, 1], cue: [-40, 120, 6], ret: [140, 60, 2], cum: [-60, 150, 4] };
function pageDraw(p, x, y, t) {
  const s = p.s,
    q = p.P(x, y, 1),
    sh = STILL ? 0 : Math.max(0, Math.sin(t * 2.2 + x)) * 0.6;
  p.cut(
    [
      [q[0] - 10 * s, q[1] - 2 * s],
      [q[0] + 8 * s, q[1] - 5 * s],
      [q[0] + 11 * s, q[1] + 3 * s],
      [q[0] - 7 * s, q[1] + 6 * s],
    ],
    '#F6EEDC',
    { blur: 2, rough: 0.4, dy: 1 },
  );
  for (let k = 0; k < 3; k++)
    p.line(
      [
        [q[0] - 6 * s, q[1] - 1 * s + k * 2.4 * s],
        [q[0] + 6 * s, q[1] - 3 * s + k * 2.4 * s],
      ],
      '#8A6A4A',
      0.7,
      0.6,
    );
  if (sh > 0) {
    p.g.save();
    p.g.globalCompositeOperation = 'lighter';
    p.flat(p.ell(q[0] + 4 * s, q[1] - 2 * s, 3 + sh * 3, 2 + sh * 2, 10), 'rgba(255,250,220,.7)', sh);
    p.g.restore();
  }
}
function glyphDraw(p, x, y, n, a) {
  if (a < 0.02) return;
  const s = p.s,
    g = p.g;
  g.save();
  g.globalAlpha = a;
  g.globalCompositeOperation = 'lighter';
  const H = hexV(26, x, y).map((v) => p.P(v[0], v[1], 1));
  p.line([...H, H[0]], '#FFC46A', 2.4);
  p.flat(H, 'rgba(255,190,90,.18)');
  for (let k = 0; k < n; k++) {
    const an = (k / n) * TAU - Math.PI / 2,
      q = p.P(x + Math.cos(an) * 13 * (n > 1 ? 1 : 0), y + Math.sin(an) * 13 * (n > 1 ? 1 : 0), 1);
    p.flat(p.ell(q[0], q[1], 2.6, 1.6, 10), '#FFE6A8');
  }
  g.restore();
}
for (const id in PAGES) {
  const [x, y, txt] = PAGES[id];
  (PUZ.things[id] = PUZ.things[id] || []).push({
    id: 'pagina',
    secret: 'page',
    x,
    y,
    z: 0,
    r: 62,
    ax: x - Math.sign(x) * 40,
    ay: y - 20,
    label: () => 'Leer la página',
    show: () => !(PROG.F.pages && PROG.F.pages[id]),
  });
}
for (const id in GLYPHS) {
  const [x, y, n] = GLYPHS[id];
  (PUZ.things[id] = PUZ.things[id] || []).push({
    id: 'simbolo',
    secret: 'glyph',
    n,
    x,
    y,
    z: 0,
    r: 60,
    ax: x - Math.sign(x || 1) * 40,
    ay: y - 24,
    label: () => 'Mirar el símbolo',
    show: () => !!(PROG.F.glyphs && PROG.F.glyphs[id]) || beatK() > 0.25,
  });
}
function readSecret(t) {
  const F = PROG.F;
  if (t.secret === 'page') {
    F.pages = F.pages || {};
    if (F.pages[cur]) return;
    F.pages[cur] = 1;
    Sound.sfx('page');
    const n = Object.keys(F.pages).length;
    note(`Página del cuaderno · ${n}/${Object.keys(PAGES).length}`);
    narrClear();
    narrate([PAGES[cur][2]]);
    stateChanged();
    return true;
  }
  if (t.secret === 'glyph') {
    F.glyphs = F.glyphs || {};
    const first = !F.glyphs[cur];
    F.glyphs[cur] = t.n;
    Sound.sfx('pick');
    note(
      `Un hexágono con ${t.n} ${t.n > 1 ? 'puntos' : 'punto'} grabado en la cera · ${Object.keys(F.glyphs).length}/${Object.keys(GLYPHS).length}`,
    );
    if (first && Object.keys(F.glyphs).length === 1)
      narrate(['Esos símbolos los grabé yo. Cuéntalos. El corazón sabrá si los has leído en orden.'], 'glyph1');
    stateChanged();
    return true;
  }
}
function drawSecrets(p, id) {
  if (!(p.s > 1e-6)) return;
  const F = PROG.F;
  if (PAGES[id] && !(F.pages && F.pages[id])) {
    const [x, y] = PAGES[id];
    pageDraw(p, x, y, T);
  }
  if (GLYPHS[id]) {
    const [x, y, n] = GLYPHS[id],
      found = !!(F.glyphs && F.glyphs[id]);
    glyphDraw(p, x, y, n, Math.max(found ? 0.35 : 0, beatK()));
  }
}
function updJournal() {
  const F = PROG.F,
    el = document.getElementById('mjour');
  if (!el) return;
  const pg = Object.keys(F.pages || {}).length,
    gl = F.glyphs || {};
  const code = ORDER.filter((id) => gl[id])
    .map((id) => gl[id])
    .join(' · ');
  el.textContent =
    _t(`Cuaderno: ${pg}/${Object.keys(PAGES).length} páginas · Símbolos: ${Object.keys(gl).length}/${Object.keys(GLYPHS).length}`) +
    (code ? ' (' + code + ')' : '');
}

/* ── vecinos que no cuentan lo mismo ── */
DLG2.tre.again.push([
  'No recuerdo haber visto su cara debajo del velo. Al volver, el tren venía vacío y el sombrero estaba en el asiento.',
]);
DLG2.cum.again.push(['Esa noche la vi bajar a pie hacia el corazón. Desde aquí se ve todo, y no subió a ningún tren.']);
DLG2.sot.again.push([
  'Estuvo aquí abajo hasta las tres y media, fundiendo una sola carta. Luego bajó hacia el corazón, no hacia el andén.',
]);
DLG2.dsv.again.push(['Amaranta subió esa caja a las diez de la noche. Luego bajó deprisa, sin despedirse.']);
