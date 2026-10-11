/* ══════════ POMPÓN Y NALA · la madriguera secreta de Amaranta ══════════
   Pompón: conejito blanco y esponjoso (orejas grises, ojos rojizos), fiel compañero.
   Nala: su llamita de peluche de toda la vida (gorrito rojo, borlas rosas, cuentas moradas,
   chaleco morado, faja turquesa y un pompón de todos los colores). */

/* ── dibujo: Pompón en papel recortado ── */
const PPC = {
  fur: '#FCFBF7',
  fur2: '#EDE9F0',
  shade: '#DCD6E2',
  ear: '#8E8C99',
  earIn: '#D9C3CE',
  eye: '#D22A48',
  eyeRim: '#F4A9B6',
  nose: '#EFA3B2',
};
function fluff(cx, cy, rx, ry, n, amp, R, s, rot = 0) {
  const o = [],
    c = Math.cos(rot),
    si = Math.sin(rot);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * TAU,
      sp = (k % 2 ? 1 : 0) * amp * (0.5 + R() * 0.9),
      x = Math.cos(a) * (rx + sp),
      y = Math.sin(a) * (ry + sp * 0.8);
    o.push([cx + (x * c - y * si) * s, cy + (x * si + y * c) * s]);
  }
  return o;
}
/* nube de pelo: una elipse con el borde hecho de bolitas (se lee esponjoso, no picudo) */
function puffs(p, cx, cy, rx, ry, col, R, sc, o = {}) {
  const s = p.s,
    n = o.n || Math.round((rx + ry) / 2.2);
  p.cut(p.ell(cx, cy, rx * sc, ry * sc, 24), col, { rough: 0.2, blur: o.blur ?? 3, sh: o.sh });
  for (let k = 0; k < n; k++) {
    const a = (k / n) * TAU + R() * 0.3,
      r = (o.r || 3.6) * (0.75 + R() * 0.5) * sc;
    if (o.top && Math.sin(a) > 0.4) continue;
    p.cut(p.ell(cx + Math.cos(a) * rx * s * sc * 0.92, cy + Math.sin(a) * ry * s * sc * 0.92, r, r, 10), col, { rough: 0.2, sh: 0 });
  }
}
/* mode: 'full' | 'ears' (solo asoman las orejas) | 'tail' (solo la colita) */
function drawPompon(p, x, y, z, f = 1, t = 0, o = {}) {
  const s = p.s,
    b = p.P(x, y, z),
    R = rng('pompon'),
    mode = o.mode || 'full',
    sc = o.sc || 1,
    S = (v) => v * s * sc;
  const hop = o.hop || 0,
    bx = b[0],
    by = b[1] - S(hop),
    tw = STILL ? 0 : Math.sin(t * 7) * 0.08 * (Math.sin(t * 1.3) > 0.6 ? 1 : 0),
    sniff = STILL ? 0 : Math.sin(t * 16) * (o.sniff ? 1 : 0.25);
  const earAt = (hx, hy, ang, len, w = 4.6) => {
    const a = -Math.PI / 2 + ang * f;
    p.cut(p.leaf(hx, hy, a, len * sc, w * sc), PPC.ear, { rough: 0.15, blur: 2 });
    p.flat(p.leaf(hx + Math.cos(a) * S(2.5), hy + Math.sin(a) * S(2.5), a, len * 0.7 * sc, w * 0.5 * sc), PPC.earIn, 0.9);
    p.flat(p.leaf(hx, hy, a, len * 0.34 * sc, w * 1.05 * sc), PPC.fur, 1);
  };
  if (mode === 'ears') {
    const q = p.P(x, y, z + (o.peek || 0));
    for (const [ang, dx] of [
      [-0.25 + tw, -3],
      [0.12 - tw, 3],
    ])
      earAt(q[0] + S(dx), q[1], ang, 17);
    return;
  }
  if (mode === 'tail') {
    const q = p.P(x, y, z + (o.peek || 0));
    puffs(p, q[0], q[1] - S(4), 5, 4.6, PPC.fur, R, sc, { r: 2.6, n: 9, blur: 2 });
    return;
  }
  p.flat(p.ell(b[0], b[1] + S(1), 19 * sc, 5 * sc, 18), 'rgba(60,35,15,.22)');
  const hx = bx + S(13) * f,
    hy = by - S(22);
  /* oreja de atrás */
  earAt(hx - S(2) * f, hy - S(8), -0.34 + tw, 21);
  /* colita y cuerpo */
  puffs(p, bx - S(18) * f, by - S(12), 5, 4.6, PPC.fur, R, sc, { r: 2.6, n: 9 });
  puffs(p, bx - S(3) * f, by - S(12), 16, 11, PPC.fur, R, sc, { r: 4.2 });
  p.flat(p.ell(bx - S(4) * f, by - S(6), 12 * sc, 4 * sc, 16), PPC.fur2, 0.85);
  /* patitas delanteras */
  for (const dx of [7, 12]) p.cut(p.ell(bx + S(dx) * f, by - S(1.8), 4 * sc, 2.6 * sc, 12), PPC.fur, { rough: 0.2, sh: 0 });
  /* pecho y melena (conejo cabeza de león) */
  puffs(p, bx + S(9) * f, by - S(13), 8, 8, PPC.fur, R, sc, { r: 3.4, n: 10, sh: 0 });
  puffs(p, hx - S(1) * f, hy + S(1), 11.5, 10.5, PPC.fur, R, sc, { r: 4.4, n: 16 });
  p.cut(p.ell(hx + S(2) * f, hy + S(1), 8.4 * sc, 7.6 * sc, 20), '#FFFFFF', { rough: 0.2, sh: 0 });
  /* oreja de delante */
  earAt(hx + S(2) * f, hy - S(8), 0.12 - tw, 22);
  /* mechones sueltos de la melena */
  for (let k = 0; k < 5; k++) {
    const a = Math.PI * (1.05 + k * 0.2),
      r0 = S(11),
      q = [hx - S(1) * f + Math.cos(a) * r0 * f, hy + Math.sin(a) * r0 * 0.9];
    p.line(
      [q, [q[0] + Math.cos(a) * S(4.5) * f, q[1] + Math.sin(a) * S(4) + S(STILL ? 0 : Math.sin(t * 2 + k) * 0.6)]],
      '#FFFFFF',
      1.1,
      0.9,
      { exact: true },
    );
  }
  /* ojo rojizo con brillo */
  const ex = hx + S(4) * f,
    ey = hy - S(1);
  p.flat(p.ell(ex, ey, 3 * sc, 3 * sc, 14), PPC.eyeRim);
  p.flat(p.ell(ex, ey, 2.3 * sc, 2.3 * sc, 12), PPC.eye);
  p.flat(p.ell(ex + S(0.8) * f, ey - S(0.9), 0.8 * sc, 0.8 * sc, 8), '#FFFFFF');
  /* nariz y bigotes */
  const nx = hx + S(10) * f,
    ny = hy + S(3) + S(sniff * 0.4);
  p.flat(p.ell(nx, ny, 1.7 * sc, 1.3 * sc, 10), PPC.nose);
  for (const [dy, l] of [
    [-0.6, 9],
    [1.2, 8],
  ])
    p.line(
      [
        [nx, ny + S(dy)],
        [nx + S(l) * f, ny + S(dy * 2.4)],
      ],
      '#C9C2D2',
      0.5,
      0.9,
      { exact: true },
    );
}

/* ── dibujo: Nala y los otros peluches ── */
const NALA = {
  hat: '#F2335E',
  hat2: '#FF6F8E',
  tassel: '#EC6BA6',
  beads: '#A070E8',
  vest: '#7B3FC4',
  trim: '#F47A5A',
  strap: '#1BA7B5',
  motif: '#E8508A',
  edge: '#6AD66A',
  feet: '#E0487E',
  rainbow: true,
  tassels: true,
  hasBeads: true,
  hasHat: true,
};
const RAINBOW = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#1E88E5', '#8E24AA'];
function drawNala(p, x, y, z, o = {}) {
  const V = { ...NALA, ...(o.v || {}) },
    s = p.s,
    sc = o.sc || 1,
    S = (v) => v * s * sc,
    b = p.P(x, y, z),
    t = o.t || 0,
    R = rng('nala' + (o.seed || ''));
  const bx = b[0],
    by = b[1],
    sw = STILL ? 0 : Math.sin(t * 1.6) * 0.6;
  if (!o.noShadow) p.flat(p.ell(bx, by + S(1), 16 * sc, 5 * sc, 18), 'rgba(60,35,15,.22)');
  /* patas: blancas con pies rosas */
  for (const [dx, back] of [
    [-9, 1],
    [7, 1],
    [-5, 0],
    [11, 0],
  ]) {
    const X = bx + S(dx),
      top = by - S(18),
      bot = by - (back ? S(2) : 0);
    p.cut(
      [
        [X - S(3.6), top],
        [X + S(3.6), top],
        [X + S(3.8), bot],
        [X - S(3.8), bot],
      ],
      back ? '#EDE7DE' : '#FBF8F2',
      { rough: 0.3, blur: 2 },
    );
    p.cut(
      [
        [X - S(3.9), bot - S(6)],
        [X + S(3.9), bot - S(6)],
        [X + S(4.1), bot],
        [X - S(4.1), bot],
      ],
      back ? shade(V.feet, 0.85) : V.feet,
      { rough: 0.2, sh: 0 },
    );
  }
  /* cuerpo */
  const cy = by - S(24);
  p.cut(p.ell(bx, cy, 17 * sc, 11 * sc, 24), '#FBF8F2', { rough: 0.5, blur: 3 });
  /* chaleco morado con cuadritos blancos y ribete coral */
  const vest = [
    [bx - S(15), cy - S(6)],
    [bx + S(10), cy - S(9)],
    [bx + S(16), cy + S(2)],
    [bx + S(12), cy + S(8)],
    [bx - S(14), cy + S(8)],
    [bx - S(17), cy + S(1)],
  ];
  p.cut(vest, V.vest, { rough: 0.4, blur: 2 });
  p.clip(vest, () => {
    for (let i = -3; i <= 3; i++)
      for (let j = -1; j <= 1; j++) {
        const q = [bx + S(i * 5 + (j % 2 ? 2.5 : 0)), cy + S(j * 5)];
        p.flat(
          [
            [q[0], q[1] - S(1.6)],
            [q[0] + S(1.6), q[1]],
            [q[0], q[1] + S(1.6)],
            [q[0] - S(1.6), q[1]],
          ],
          '#FBF8F2',
          0.9,
        );
      }
  });
  const trim = [];
  for (let k = 0; k <= 14; k++) {
    const u = k / 14;
    trim.push([lerp(bx - S(14), bx + S(12), u), cy + S(8) + Math.abs(Math.sin(u * Math.PI * 7)) * S(2.2)]);
  }
  p.line(trim, V.trim, 2.6, 1, { exact: true });
  /* cuello y cabeza */
  const nx = bx + S(6),
    ny0 = cy - S(6),
    ny1 = cy - S(30);
  p.cut(
    [
      [nx - S(6), ny0],
      [nx + S(6), ny0],
      [nx + S(5.5), ny1],
      [nx - S(5.5), ny1],
    ],
    '#FBF8F2',
    { rough: 0.3, blur: 2 },
  );
  /* faja turquesa cruzada y pompón arcoíris */
  if (V.strap) {
    const band = (a0, a1, b0, b1) => {
      p.line([a0, a1], V.strap, 3.4, 1, { exact: true });
      p.line([a0, a1], V.edge, 0.6, 0.9, { exact: true });
      for (let k = 1; k < 5; k++) {
        const u = k / 5;
        p.flat(p.ell(lerp(a0[0], a1[0], u), lerp(a0[1], a1[1], u), 1, 0.8, 6), V.motif);
      }
    };
    band([nx - S(6), ny0 - S(4)], [bx + S(9), cy + S(9)]);
    band([nx + S(6), ny0 - S(4)], [bx - S(6), cy + S(9)]);
  }
  const pc = [nx, cy - S(3)];
  if (V.rainbow) {
    for (let k = 0; k < 6; k++) {
      const a0 = (k / 6) * TAU,
        a1 = ((k + 1) / 6) * TAU,
        Q = [pc];
      for (let m = 0; m <= 4; m++) {
        const a = lerp(a0, a1, m / 4);
        Q.push([pc[0] + Math.cos(a) * S(5.2), pc[1] + Math.sin(a) * S(4.8)]);
      }
      p.flat(Q, RAINBOW[k]);
    }
    p.flat(p.ell(pc[0] - S(1.2), pc[1] - S(1), 2 * sc, 1.8 * sc, 10), '#23307A', 0.8);
  } else if (V.pompom) p.cut(p.ell(pc[0], pc[1], 5 * sc, 4.6 * sc, 14), V.pompom, { rough: 0.6, sh: 0 });
  const hx = nx + S(1) + S(sw * 0.3),
    hy = ny1 - S(6);
  /* gorrito (chullo) de crochet con orejeras */
  if (V.hasHat) {
    const cap = [
      [hx - S(12), hy + S(10)],
      [hx - S(13), hy - S(2)],
      [hx - S(9), hy - S(11)],
      [hx, hy - S(14)],
      [hx + S(9), hy - S(11)],
      [hx + S(13), hy - S(2)],
      [hx + S(12), hy + S(10)],
      [hx + S(8), hy + S(12)],
      [hx + S(8), hy + S(2)],
      [hx - S(8), hy + S(2)],
      [hx - S(8), hy + S(12)],
    ];
    p.cut(cap, V.hat, { rough: 0.6, blur: 2 });
    for (let k = 0; k < 5; k++) {
      const u = k / 4;
      p.line(
        [
          [hx - S(10) + u * S(20), hy - S(9) + Math.abs(u - 0.5) * S(5)],
          [hx - S(9) + u * S(18), hy - S(3)],
        ],
        V.hat2,
        0.9,
        0.7,
      );
    }
    /* borlas */
    if (V.tassels)
      for (const sg of [-1, 1]) {
        const tx = hx + sg * S(13),
          ty = hy + S(4);
        p.cut(p.ell(tx, ty, 2.6 * sc, 2.6 * sc, 10), V.tassel, { rough: 0.3, sh: 0 });
        const Q = [
          [tx - S(3), ty + S(2)],
          [tx + S(3), ty + S(2)],
          [tx + S(5) + sg * S(1), ty + S(15)],
          [tx - S(5) + sg * S(1), ty + S(15)],
        ];
        p.cut(Q, V.tassel, { rough: 0.4, blur: 2 });
        for (let k = 0; k < 6; k++) {
          const u = k / 5;
          p.line(
            [
              [lerp(tx - S(3), tx + S(3), u), ty + S(3)],
              [lerp(tx - S(5), tx + S(5), u) + sg * S(1), ty + S(15) + R() * S(1.5)],
            ],
            shade(V.tassel, 0.8),
            0.5,
            0.8,
            { exact: true },
          );
        }
      }
    if (V.hasBeads)
      for (const sg of [-1, 1])
        for (let k = 0; k < 2; k++)
          p.cut(p.ell(hx + sg * S(10.5 + k * 1.6), hy - S(5) + S(k * 3), 1.7 * sc, 1.7 * sc, 10), V.beads, { rough: 0, sh: 0 });
  }
  /* la carita */
  const face = p.cut(p.ell(hx, hy + S(2), 8 * sc, 7.4 * sc, 20), '#FFFDF8', { rough: 0.3, sh: 0 });
  if (!V.hasHat) {
    for (const sg of [-1, 1]) p.cut(p.leaf(hx + sg * S(5), hy - S(4), -Math.PI / 2 + sg * 0.3, 9 * sc, 3 * sc), '#FBF8F2', { rough: 0.2 });
  }
  for (const sg of [-1, 1]) {
    const ex = hx + sg * S(3.4),
      ey = hy + S(0.5);
    const arc = [];
    for (let k = 0; k <= 6; k++) {
      const a = Math.PI * (k / 6);
      arc.push([ex - Math.cos(a) * S(2.2), ey + Math.sin(a) * S(1.2)]);
    }
    p.line(arc, '#2A1A1A', 0.8, 1, { exact: true });
    for (let k = 0; k < 3; k++) {
      const a = Math.PI * (0.2 + k * 0.3);
      p.line(
        [
          [ex - Math.cos(a) * S(2.2), ey + Math.sin(a) * S(1.2)],
          [ex - Math.cos(a) * S(3.4), ey + Math.sin(a) * S(1.2) + S(1.3)],
        ],
        '#2A1A1A',
        0.5,
        1,
        { exact: true },
      );
    }
    p.flat(p.ell(hx + sg * S(5), hy + S(4), 1.8 * sc, 1.1 * sc, 10), '#F4A0AE', 0.7);
  }
  const m = [hx, hy + S(5.2)];
  p.line(
    [
      [m[0] - S(2.4), m[1] - S(0.4)],
      [m[0] - S(1.2), m[1] + S(0.9)],
      [m[0], m[1]],
      [m[0] + S(1.2), m[1] + S(0.9)],
      [m[0] + S(2.4), m[1] - S(0.4)],
    ],
    '#2A1A1A',
    0.7,
    1,
    { exact: true },
  );
  p.line(
    [
      [m[0], m[1] - S(2.4)],
      [m[0], m[1]],
    ],
    '#2A1A1A',
    0.6,
    1,
    { exact: true },
  );
}
/* otros peluches del montón (para que Nala no sea evidente) */
const PLUSH_ALT = [
  { hat: '#3A6ED8', hat2: '#6A9AF0' },
  { tassels: false, vest: '#3E9A5A' },
  { hasBeads: false, vest: '#E8843A', rainbow: false, pompom: '#D83A3A' },
  { hasHat: false },
  { rainbow: false, pompom: null, strap: '#C94A4A', edge: '#F2C94C' },
  { tassel: '#F2C94C', hat: '#F2335E', hasBeads: false },
];
function drawBear(p, x, y, z, sc = 1, col = '#B9855A') {
  const s = p.s,
    b = p.P(x, y, z),
    S = (v) => v * s * sc;
  p.flat(p.ell(b[0], b[1] + S(1), 14 * sc, 4 * sc, 16), 'rgba(60,35,15,.2)');
  p.cut(p.ell(b[0], b[1] - S(12), 12 * sc, 11 * sc, 20), col, { rough: 0.4 });
  p.cut(p.ell(b[0], b[1] - S(28), 10 * sc, 9 * sc, 20), col, { rough: 0.4 });
  for (const sg of [-1, 1]) p.cut(p.ell(b[0] + sg * S(8), b[1] - S(36), 3.6 * sc, 3.6 * sc, 12), col, { rough: 0.3, sh: 0 });
  p.flat(p.ell(b[0], b[1] - S(25), 4.4 * sc, 3.4 * sc, 12), shade(col, 1.25));
  for (const sg of [-1, 1]) p.flat(p.ell(b[0] + sg * S(3.4), b[1] - S(30), 1 * sc, 1 * sc, 8), '#2A1A1A');
  p.flat(p.ell(b[0], b[1] - S(26.5), 1.3 * sc, 1 * sc, 8), '#2A1A1A');
}
function drawSheep(p, x, y, z, sc = 1) {
  const s = p.s,
    b = p.P(x, y, z),
    S = (v) => v * s * sc,
    R = rng('oveja');
  p.flat(p.ell(b[0], b[1] + S(1), 15 * sc, 4 * sc, 16), 'rgba(60,35,15,.2)');
  p.cut(fluff(b[0], b[1] - S(13), 14 * sc, 10 * sc, 22, 2.4, R, s), '#F4EEE2', { rough: 0.4 });
  p.cut(p.ell(b[0] + S(12), b[1] - S(18), 6 * sc, 5.4 * sc, 14), '#4A3A34', { rough: 0.3 });
  for (const sg of [-1, 1]) p.flat(p.ell(b[0] + S(12) + sg * S(2), b[1] - S(19), 0.9 * sc, 0.9 * sc, 8), '#FFFFFF');
}

/* ══════════ LA MADRIGUERA ══════════
   Debajo del escenario del Teatro hay una raíz, y en la raíz un hueco: el escondite de Amaranta
   de niña. Se abre cuando el escenario mira a la pared (ninguna puerta encaja). No hay nadie
   con quien hablar: hay que buscar entre las cosas. */
const MF = () => {
  const F = QF();
  return F.madr || (F.madr = {});
};
const MAD_PAL = mkPal(
  'madr',
  '#C9A27A',
  ['#CFA47A', '#C49A70', '#D6AE84', '#BF946A', '#D2A87E'],
  ['#D9A0A8', '#E2AEB4', '#CF949E'],
  ['#C98890', '#F7D2D6'],
  '#8A5A4A',
  '#7A4A3A',
);
const HATCH = { x: 40, y: 95 }; /* la trampilla en el escenario del Teatro */
const MHID = 5; /* la orientación del escenario que mira a la pared */
/* escondites: [id, x, y, alto, etiqueta, dónde se para el jugador] */
const MSPOT = [
  { id: 'cojines', x: -170, y: 60, h: 40, label: 'Levantar los cojines' },
  { id: 'cesta', x: 175, y: 95, h: 44, label: 'Mirar en la cesta' },
  { id: 'fuerte', x: 30, y: -165, h: 70, label: 'Asomarse al fuerte de mantas' },
  { id: 'cajas', x: -175, y: -110, h: 62, label: 'Mover las cajas' },
  { id: 'baul', x: 190, y: -60, h: 40, label: 'Abrir el baúl de juguetes' },
  { id: 'peluches', x: -20, y: 170, h: 40, label: 'Buscar entre los peluches', pile: true },
  { id: 'nota', x: -95, y: -205, h: 86, label: 'Leer la nota de la pared', note: true },
  { id: 'salida', x: 95, y: 10, h: 6, label: 'Volver al Teatro', exit: true },
];
const HIDES = ['cojines', 'cesta', 'fuerte', 'cajas', 'baul'];
const M = {
  on: false,
  t: 0,
  pl: { x: 95, y: 40, f: -1, tx: null, ty: null, go: null, moving: false },
  lift: {},
  pom: null,
  peekT: 3,
  nibT: 1,
  miss: 0,
  hover: null,
  bake: null,
  key: '',
  cv: null,
  g: null,
  s: 1,
  ox: 0,
  oy: 0,
  dust: [],
  scurry: null,
};
const mEl = document.createElement('canvas');
mEl.id = 'madr';
mEl.setAttribute('aria-label', 'La madriguera: un cuarto pequeño lleno de cojines, cajas y peluches');
mEl.hidden = true;
document.getElementById('cv').after(mEl);
const madrCss = document.createElement('style');
madrCss.textContent = `#madr{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:pointer;background:#1C120E}
body.inmadr .ctrl,body.inmadr #goal,body.inmadr .hint,body.inmadr #hand,body.inmadr #travel,body.inmadr #panel,body.inmadr #talk{display:none!important}
.npick{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:10px 0}.npick button{padding:4px;border-radius:10px;background:#FFF9EC;border:2px solid #E3C98E;cursor:pointer}
.npick button:hover,.npick button:focus-visible{border-color:#C47A2C;outline:none;transform:translateY(-2px)}.npick canvas{width:100%;height:auto;display:block}
.npick button.no{animation:nshake .45s}@keyframes nshake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.nknow{font-size:14px;line-height:1.45;margin:4px 0 0;color:#6A4A32}.nknow b{color:#8A3A4A}
#npk .p{max-height:calc(100dvh - 30px);overflow-y:auto;padding-top:34px;padding-bottom:30px}
@media (max-width:520px){.npick{grid-template-columns:repeat(3,1fr);gap:6px}.npick button{padding:2px}}`;
document.head.appendChild(madrCss);
/* el selector de peluches */
const pickEl = document.createElement('div');
pickEl.id = 'npk';
pickEl.className = 'modal';
pickEl.hidden = true;
pickEl.setAttribute('role', 'dialog');
pickEl.setAttribute('aria-modal', 'true');
pickEl.innerHTML =
  '<div class="shadow"><div class="p paper torn"><h2>¿Cuál es Nala?</h2><p class="nknow" id="nknow"></p><div class="npick" id="npick"></div><div class="crbtns"><button id="npx">Seguir buscando</button></div></div></div>';
document.getElementById('stage').appendChild(pickEl);
DOM_SKIP.add('npick');
DOM_SKIP.add('nknow');

/* lo que se sabe de Nala: por las huellas del rastro o por la nota de la pared */
const NALA_FACTS = [
  ['gorro', 'un gorrito rojo'],
  ['borlas', 'dos borlas rosas'],
  ['cuentas', 'cuentas moradas junto a las orejas'],
  ['chaleco', 'un chaleco morado de cuadritos'],
  ['pompon', 'un pompón de todos los colores'],
];
function nalaKnown() {
  const F = MF(),
    k = F.know || {};
  return NALA_FACTS.filter((f) => k[f[0]]).map((f) => f[1]);
}
function learn(...keys) {
  const F = MF();
  F.know = F.know || {};
  for (const k of keys) F.know[k] = 1;
}

/* ── el rastro: huellas de conejo en tres cuartos ── */
const MTRAIL = {
  col: {
    x: 70,
    y: 150,
    lines: ['Huellas pequeñas, de conejo. Van hacia el Teatro.', 'Pompón nunca venía cuando lo llamaba. Venía cuando dejaba de buscarlo.'],
    know: ['gorro', 'borlas'],
  },
  inn: {
    x: -70,
    y: 165,
    lines: [
      'Un mechón de pelo blanco, muy suave, enganchado en una hoja.',
      'Pompón arrastraba a Nala a todas partes: un gorrito rojo, cuentas moradas, un pompón de todos los colores.',
    ],
    know: ['cuentas', 'pompon'],
  },
  dsv: {
    x: 60,
    y: 150,
    lines: [
      'Las huellas se meten debajo de una puerta y ya no salen.',
      'Cuando el escenario del Teatro mira a la pared, se abre el suelo. Solo Pompón y yo lo sabíamos.',
    ],
    know: ['chaleco'],
  },
};
for (const id in MTRAIL) {
  const T0 = MTRAIL[id];
  (PUZ.things[id] = PUZ.things[id] || []).push({
    id: 'huellas',
    x: T0.x,
    y: T0.y,
    z: 0,
    r: 70,
    ax: T0.x - 34,
    ay: T0.y - 8,
    label: () => 'Mirar las huellas',
    show: () => !PUZ.cellLocked(id) && !(MF().trail && MF().trail[id]),
  });
}
function readTrail(id) {
  const F = MF();
  F.trail = F.trail || {};
  if (F.trail[id]) return;
  F.trail[id] = 1;
  learn(...MTRAIL[id].know);
  Sound.sfx('page');
  const n = Object.keys(F.trail).length;
  note(`Huellas de conejo · ${n}/3`);
  narrClear();
  narrate(MTRAIL[id].lines);
  if (n === 3) setTimeout(() => note('Las huellas acaban en el Teatro, cuando el escenario mira a la pared.'), 5200);
  stateChanged();
}
function drawPrints(p, x, y, a, alpha) {
  const s = p.s;
  for (let k = 0; k < 7; k++) {
    const u = k / 6,
      px = x - 70 + u * 120,
      py = y + 22 - u * 50 + (k % 2 ? 7 : -7),
      q = p.P(px, py, 0.5);
    for (const [dx, dy, r] of [
      [0, 0, 3.2],
      [-3, -5, 1.6],
      [1, -6, 1.6],
      [4, -4, 1.5],
    ])
      p.flat(p.ell(q[0] + dx * s, q[1] + dy * s * 0.7, r, r * 0.7, 10), '#6A4A3A', alpha * (0.35 + 0.4 * u));
  }
}
/* la trampilla del escenario */
PUZ.things.tea = PUZ.things.tea || [];
PUZ.things.tea.push({
  id: 'trampilla',
  x: HATCH.x,
  y: HATCH.y,
  z: 0,
  r: 72,
  ax: HATCH.x - 34,
  ay: HATCH.y - 6,
  label: () => 'Bajar por la trampilla',
  show: () => hatchOpen(),
});
const hatchOpen = () => !PUZ.cellLocked('tea') && typeof rotR === 'function' && rotR('tea') === MHID && !rotBusy('tea');
function drawHatch(p, t) {
  const s = p.s,
    { x, y } = HATCH,
    Q = [p.P(x - 22, y - 16, 1), p.P(x + 22, y - 16, 1), p.P(x + 22, y + 16, 1), p.P(x - 22, y + 16, 1)];
  p.g.save();
  p.g.globalCompositeOperation = 'lighter';
  p.flat(p.ell(...p.P(x, y, 1), 34, 14, 20), 'rgba(255,200,120,.22)');
  p.g.restore();
  p.cut(Q, '#8A5A34', { blur: 3, rough: 0.3 });
  for (let k = 1; k < 4; k++) p.line([p.P(x - 22, y - 16 + k * 8, 1.2), p.P(x + 22, y - 16 + k * 8, 1.2)], '#6E4424', 1.2, 0.8);
  const r = p.P(x + 10, y + 2, 2);
  p.line([...p.ell(r[0], r[1], 4, 2.6, 12), p.ell(r[0], r[1], 4, 2.6, 12)[0]], '#E4A844', 1.6);
  if (MF().trail && Object.keys(MF().trail).length) {
    const q = p.P(x - 18, y + 12, 2);
    p.cut(p.ell(q[0], q[1], 3.4, 2.4, 10), '#FCFBF7', { rough: 0.6, sh: 0 });
  }
}
{
  const qu0 = qUnder;
  qUnder = function (p, id) {
    qu0(p, id);
    const F = MF();
    if (MTRAIL[id] && !PUZ.cellLocked(id)) {
      const T0 = MTRAIL[id],
        done = F.trail && F.trail[id];
      drawPrints(p, T0.x, T0.y, 0, done ? 0.35 : 1);
      if (!done) STYLE.hot(p, T0.x, T0.y, T, 18);
    }
    if (id === 'tea' && hatchOpen()) drawHatch(p, T);
  };
}
{
  const a0 = act;
  act = function (t) {
    if (t && t.id === 'huellas') {
      readTrail(cur);
      return;
    }
    if (t && t.id === 'trampilla') {
      enterMadr();
      return;
    }
    a0(t);
  };
}

/* ── entrar y salir ── */
function enterMadr() {
  if (M.on) return;
  const F = MF();
  closeTalk();
  narrClear();
  Pl.route = null;
  Pl.goal = null;
  fadeEl.classList.add('on');
  Sound.sfx('door');
  setTimeout(() => {
    M.on = true;
    document.body.classList.add('inmadr');
    mEl.hidden = false;
    M.t = 0;
    M.pl = { x: 95, y: 40, f: -1, go: null, moving: false };
    M.lift = {};
    M.miss = 0;
    M.scurry = null;
    if (!F.pom) {
      M.pom = { spot: HIDES[Math.floor(Math.random() * HIDES.length)], found: false };
    } else M.pom = { spot: null, found: true, x: 60, y: 70, f: -1, hop: 0 };
    M.bake = null;
    madrSize();
    document.getElementById('tn').textContent = _t('La madriguera');
    document.getElementById('ts').textContent = _t('El escondite de Amaranta');
    fadeEl.classList.remove('on');
    F.visits = (F.visits || 0) + 1;
    if (!F.seen) {
      F.seen = 1;
      achieve('madr');
      save();
      narrate(
        [
          'Debajo del escenario había una raíz. Y en la raíz, un hueco del tamaño de una niña.',
          'Aquí no entraba nadie. Solo Pompón, Nala y yo.',
        ],
        'madr1',
        { delay: 0.6 },
      );
      setTimeout(() => note('La madriguera · busca entre las cosas'), 900);
    } else if (!F.pom) setTimeout(() => note('Pompón sigue escondido. Escucha: se le oye mordisquear.'), 700);
    mEl.focus && mEl.focus();
  }, 480);
}
function exitMadr() {
  if (!M.on) return;
  fadeEl.classList.add('on');
  Sound.sfx('door');
  pickEl.hidden = true;
  setTimeout(() => {
    M.on = false;
    document.body.classList.remove('inmadr');
    mEl.hidden = true;
    STYLE.tag(CELLS[cur]);
    Pl.x = HATCH.x - 30;
    Pl.y = HATCH.y + 10;
    Pl.route = null;
    camReady = false;
    last = performance.now();
    if (MF().pom) POM.here = null;
    fadeEl.classList.remove('on');
    save();
  }, 450);
}

/* ── tamaño y proyección ── */
function madrSize() {
  const w = Math.round(mEl.clientWidth * DPR),
    h = Math.round(mEl.clientHeight * DPR);
  if (!w || !h) return;
  if (mEl.width !== w || mEl.height !== h) {
    mEl.width = w;
    mEl.height = h;
  }
  const portrait = h > w * 1.2;
  M.s = portrait ? Math.min(w / 590, h / 700) : Math.min(w / 800, h / 640);
  M.ox = w / 2;
  M.oy = h * (portrait ? 0.54 : 0.6);
  M.g = mEl.getContext('2d');
  const key = w + 'x' + h + LANG;
  if (M.key !== key) {
    M.key = key;
    M.bake = null;
  }
}
addEventListener('resize', () => {
  if (M.on) madrSize();
});
const mP = (x, y, z = 0) => [M.ox + x * M.s, M.oy + (y * K - z) * M.s];
function toFloor(sx, sy) {
  return [(sx - M.ox) / M.s, (sy - M.oy) / (M.s * K)];
}

/* ── el cuarto: cáscara, paredes con dibujos, raíces y la alfombra andina ── */
function madrBake() {
  const c = newCanvas(mEl.width, mEl.height),
    g = c.getContext('2d'),
    p = STYLE.Pen(g, M.ox, M.oy, M.s, 'madr');
  g.fillStyle = '#1C120E';
  g.fillRect(0, 0, c.width, c.height);
  /* raíces que sostienen el hueco desde arriba */
  const R0 = rng('raizm');
  for (let k = 0; k < 9; k++) {
    const x0 = (R0() - 0.5) * c.width * 1.2 + c.width / 2,
      pts = [];
    for (let i = 0; i <= 10; i++) {
      const u = i / 10;
      pts.push([x0 + Math.sin(u * 5 + k) * 30 * M.s + (c.width / 2 - x0) * u * 0.45, -20 + u * (M.oy - 240 * M.s)]);
    }
    p.line(pts, k % 2 ? '#3A2416' : '#4A2E1C', 8 + R0() * 10, 1, { exact: false });
  }
  shell(p, MAD_PAL);
  /* dibujos de niña en las paredes */
  const pin = (e, u, z, w, h, draw) => {
    const Q = wallRect(p, e, u - w / 600, u + w / 600, z - h / 2, z + h / 2, -2);
    p.cut(Q, '#FFF8E8', { blur: 3, rough: 0.4 });
    const c0 = p.W(wallPt(e, u, z, -3));
    draw(c0);
    p.flat(p.ell(...p.W(wallPt(e, u, z + h / 2 - 3, -3)), 2, 2, 8), '#C94A4A');
  };
  pin(EL, 0.25, 78, 40, 34, (c) => {
    p.flat(p.ell(c[0], c[1], 7, 7, 14), '#F2B632');
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      p.line(
        [
          [c[0] + Math.cos(a) * 9 * M.s, c[1] + Math.sin(a) * 9 * M.s],
          [c[0] + Math.cos(a) * 13 * M.s, c[1] + Math.sin(a) * 13 * M.s],
        ],
        '#F2B632',
        1.4,
      );
    }
  });
  pin(EL, 0.62, 86, 44, 36, (c) => {
    drawPompon(STYLE.Pen(g, c[0] - 2 * M.s, c[1] + 10 * M.s, M.s * 0.55, 'dib'), 0, 0, 0, 1, 0);
  });
  pin(ET, 0.2, 92, 40, 40, (c) => {
    drawNala(STYLE.Pen(g, c[0], c[1] + 16 * M.s, M.s * 0.38, 'dib2'), 0, 0, 0, { noShadow: true });
  });
  pin(ET, 0.78, 80, 46, 30, (c) => {
    for (let k = 0; k < 3; k++)
      p.line(
        [
          [c[0] - 16 * M.s, c[1] - 8 * M.s + k * 7 * M.s],
          [c[0] + 16 * M.s, c[1] - 8 * M.s + k * 7 * M.s],
        ],
        ['#E86A8A', '#3AA7A0', '#E4A844'][k],
        2.2,
      );
  });
  pin(ER, 0.5, 84, 42, 34, (c) => {
    p.line([...hexPts(c, 10, M.s), hexPts(c, 10, M.s)[0]], '#C47A2C', 2);
    p.text('♥', c[0], c[1], 10, '#D84A5A');
  });
  /* raíces que atraviesan las paredes */
  for (const [e, u] of [
    [EL, 0.45],
    [ET, 0.5],
    [ER, 0.2],
  ]) {
    const pts = [];
    for (let k = 0; k <= 8; k++) {
      const z = HW + 26 - k * 14;
      pts.push(p.W(wallPt(e, u + Math.sin(k * 0.9) * 0.03, z, -4)));
    }
    p.line(pts, '#6E4424', 5, 1, { sh: 1 });
    p.line(pts, '#8A5A34', 2, 0.8);
  }
  /* alfombra redonda de colores, como las de Cusco */
  const rc = [0, 40];
  for (const [r, col] of [
    [118, '#C9304A'],
    [104, '#F28C28'],
    [90, '#E8508A'],
    [76, '#1BA7B5'],
    [62, '#7B3FC4'],
    [48, '#F2C94C'],
    [34, '#C9304A'],
    [20, '#1BA7B5'],
  ])
    p.cut(p.ring(rc[0], rc[1], 0.6, r, r * 0.92, 40), col, { rough: 0.5, sh: r === 118 ? 1 : 0, blur: 3 });
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * TAU,
      q = p.P(rc[0] + Math.cos(a) * 111, rc[1] + Math.sin(a) * 102, 0.8);
    p.flat(
      [
        [q[0], q[1] - 3 * M.s],
        [q[0] + 3 * M.s, q[1]],
        [q[0], q[1] + 3 * M.s],
        [q[0] - 3 * M.s, q[1]],
      ],
      '#FFF6D8',
      0.9,
    );
  }
  /* colchón con edredón junto a la pared */
  box3P(p, -80, 70, -235, -190, 0, 16, '#E9D2C0', '#D6BCA8', '#F6E6D6', { rough: 0.3 });
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 2; j++) {
      const c0 = p.P(-72 + i * 30, -230 + j * 20, 16.5);
      p.flat(
        [
          [c0[0], c0[1]],
          [c0[0] + 28 * M.s, c0[1]],
          [c0[0] + 28 * M.s, c0[1] + 10 * M.s * K],
          [c0[0], c0[1] + 10 * M.s * K],
        ],
        (i + j) % 2 ? '#F2C6D2' : '#FBE7B4',
        0.95,
      );
    }
  shellTop(p, MAD_PAL);
  /* guirnalda de lucecitas en lo alto */
  for (const e of [EL, ET, ER])
    for (let k = 1; k < 10; k++) {
      const u = k / 10,
        q = p.W(wallPt(e, u, HW - 6 - Math.sin(u * Math.PI) * 14, -3));
      p.flat(p.ell(q[0], q[1], 2.2, 2.2, 8), ['#FFD36A', '#FF9AA8', '#9AE0FF'][k % 3]);
    }
  return c;
}

/* ── los escondites ── */
function spotDraw(p, S, t) {
  const s = p.s,
    L = M.lift[S.id] || 0,
    u = Math.min(1, L),
    x = S.x,
    y = S.y;
  switch (S.id) {
    case 'cojines': {
      for (const [dz, col, w] of [
        [0, '#E8829A', 34],
        [12, '#E4B040', 30],
        [23, '#3AA7A0', 25],
      ]) {
        const lift = dz === 23 ? u * 26 : 0,
          dx = dz === 23 ? u * 18 : 0;
        const q = p.P(x + dx, y, dz + lift);
        p.cut(p.ell(q[0], q[1] - 6 * s, w, w * 0.52, 24), col, { rough: 0.6, blur: 4 });
        p.flat(p.ell(q[0] - 4 * s, q[1] - 9 * s, w * 0.5, w * 0.2, 16), shade(col, 1.15), 0.6);
      }
      break;
    }
    case 'cesta': {
      cylinder(p, x, y, 0, 24, 30, '#C9964E', '#8A5A30', { r1: 27 });
      for (let k = 0; k < 4; k++) p.line(p.ring(x, y, 6 + k * 6, 24 + k * 0.7, 24 + k * 0.7, 26).slice(0, 14), '#A87A3A', 1.2, 0.8);
      const q = p.P(x - u * 14, y, 31 + u * 22);
      p.cut(
        [
          [q[0] - 26 * s, q[1] + 2 * s],
          [q[0] + 24 * s, q[1] - 6 * s - u * 10 * s],
          [q[0] + 30 * s, q[1] + 8 * s],
          [q[0] - 18 * s, q[1] + 14 * s],
        ],
        '#F2C6D2',
        { rough: 0.5, blur: 3 },
      );
      break;
    }
    case 'fuerte': {
      const A = p.P(x - 44, y + 26, 0),
        B = p.P(x + 44, y + 26, 0),
        Tp = p.P(x, y + 10, 70),
        Bk = p.P(x, y - 30, 64),
        Ab = p.P(x - 44, y - 34, 0),
        Bb = p.P(x + 44, y - 34, 0);
      p.cut([Ab, Bk, Bb], '#E8D2B0', { rough: 0.4 });
      p.cut([A, Tp, Bk, Ab], '#F6E7C8', { rough: 0.5, blur: 4 });
      p.cut([B, Tp, Bk, Bb], '#EAD4B0', { rough: 0.4, sh: 0 });
      for (let k = 1; k < 4; k++) {
        const f = k / 4;
        p.line(
          [
            [lerp(A[0], Tp[0], f), lerp(A[1], Tp[1], f)],
            [lerp(Ab[0], Bk[0], f), lerp(Ab[1], Bk[1], f)],
          ],
          '#E8829A',
          2,
          0.7,
        );
      }
      const open = u,
        m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      p.flat([A, [m[0], Tp[1] + (m[1] - Tp[1]) * 0.15], B], '#3A2418', 0.55 + 0.35 * open);
      if (open < 0.98)
        p.cut([A, [lerp(m[0], A[0], open), lerp(Tp[1], A[1], open * 0.6)], [lerp(B[0], A[0], open), B[1]]], '#FBEFD8', {
          rough: 0.5,
          sh: 0,
        });
      break;
    }
    case 'cajas': {
      box3P(p, x - 30, x + 30, y - 22, y + 22, 0, 34, '#C79A6A', '#B08256', '#DDB48A', { rough: 0.3 });
      const dx = u * 26;
      box3P(p, x - 22 + dx, x + 22 + dx, y - 16, y + 16, 34, 58, '#B8845A', '#A0704A', '#D6A77A', { rough: 0.3 });
      const q = p.P(x, y + 22, 17);
      p.text('✿', q[0], q[1], 11, '#E86A8A');
      const lp = p.P(x - 14 + dx, y, 60);
      cylinder(p, x - 14 + dx, y, 58, 5, 10, '#6E4424', '#8A5A34');
      p.cut(p.ell(lp[0], lp[1] - 16 * s, 7, 8, 14), '#FFE3A0', { rough: 0.2, sh: 0 });
      break;
    }
    case 'baul': {
      box3P(p, x - 30, x + 30, y - 20, y + 20, 0, 30, '#8A5A8A', '#744874', '#A874A8', { rough: 0.3 });
      const q = p.P(x, y + 20, 15);
      p.text('★', q[0], q[1], 12, '#F2C94C');
      const a = u * 1.2,
        top = [
          p.P(x - 30, y - 20, 30),
          p.P(x + 30, y - 20, 30),
          p.P(x + 30, y - 20 + 40 * Math.cos(a), 30 + 40 * Math.sin(a)),
          p.P(x - 30, y - 20 + 40 * Math.cos(a), 30 + 40 * Math.sin(a)),
        ];
      p.cut(top, '#9A6A9A', { rough: 0.3, blur: 3 });
      break;
    }
    case 'peluches': {
      const F = MF();
      drawBear(p, x - 40, y - 8, 0, 0.95);
      drawSheep(p, x + 44, y - 14, 0, 0.9);
      drawNala(p, x + 18, y + 4, 0, { sc: 0.55, v: PLUSH_ALT[0], seed: 'a' });
      drawNala(p, x - 18, y + 8, 0, { sc: 0.52, v: PLUSH_ALT[3], seed: 'b' });
      if (!F.nala) drawNala(p, x + 2, y + 14, 0, { sc: 0.56, t });
      drawBear(p, x + 60, y + 20, 0, 0.7, '#D8A8B8');
      break;
    }
    case 'nota': {
      const Q = wallRect(p, EL, 0.78 - 0.06, 0.78 + 0.06, 70, 102, -2);
      p.cut(Q, '#FFF4D6', { blur: 3, rough: 0.5 });
      const c0 = p.W(wallPt(EL, 0.78, 86, -3));
      for (let k = 0; k < 4; k++)
        p.line(
          [
            [c0[0] - 12 * s, c0[1] - 8 * s + k * 5 * s],
            [c0[0] + 12 * s, c0[1] - 8 * s + k * 5 * s],
          ],
          '#8A6A5A',
          0.9,
          0.8,
        );
      p.flat(p.ell(...p.W(wallPt(EL, 0.78, 100, -3)), 2, 2, 8), '#C94A4A');
      break;
    }
    case 'salida': {
      const Q = [p.P(x - 24, y - 17, 0.8), p.P(x + 24, y - 17, 0.8), p.P(x + 24, y + 17, 0.8), p.P(x - 24, y + 17, 0.8)];
      p.flat(Q, '#1A0E08');
      p.g.save();
      p.g.globalCompositeOperation = 'lighter';
      p.flat(p.ell(...p.P(x, y, 1), 20, 8, 16), 'rgba(255,200,120,.25)');
      p.g.restore();
      p.line([Q[0], Q[1], Q[2], Q[3], Q[0]], '#8A5A34', 3);
      break;
    }
  }
}
/* dónde mirar cada escondite en pantalla (para tocarlo) */
const spotAt = (S) =>
  S.note
    ? (() => {
        const q = STYLE.Pen(M.g, M.ox, M.oy, M.s, 'x').W(wallPt(EL, 0.78, 86, -3));
        return q;
      })()
    : mP(S.x, S.y, S.h * 0.5);

/* ── sonidos propios: mordisquitos, roce de tela, saltito ── */
const MSND = {
  nib(v) {
    const d = Sound._dbg();
    if (!Sound.on || !d.ac || !d.sfxB || d.ac.state !== 'running') return;
    const ac = d.ac,
      t = ac.currentTime;
    for (let k = 0; k < 3; k++) {
      const n = Math.floor(ac.sampleRate * 0.035),
        b = ac.createBuffer(1, n, ac.sampleRate),
        x = b.getChannelData(0);
      for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * Math.exp((-i / n) * 6);
      const src = ac.createBufferSource(),
        f = ac.createBiquadFilter(),
        g = ac.createGain();
      src.buffer = b;
      f.type = 'bandpass';
      f.frequency.value = 2600 + Math.random() * 900;
      f.Q.value = 3;
      g.gain.value = 0.5 * v;
      src.connect(f);
      f.connect(g);
      g.connect(d.sfxB);
      src.start(t + k * 0.09);
    }
  },
  rustle(v = 1) {
    const d = Sound._dbg();
    if (!Sound.on || !d.ac || !d.sfxB || d.ac.state !== 'running') return;
    const ac = d.ac,
      t = ac.currentTime,
      n = Math.floor(ac.sampleRate * 0.4),
      b = ac.createBuffer(1, n, ac.sampleRate),
      x = b.getChannelData(0);
    for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / n) * (0.6 + 0.4 * Math.sin(i / 300));
    const src = ac.createBufferSource(),
      f = ac.createBiquadFilter(),
      g = ac.createGain();
    src.buffer = b;
    f.type = 'highpass';
    f.frequency.value = 1800;
    g.gain.value = 0.22 * v;
    src.connect(f);
    f.connect(g);
    g.connect(d.sfxB);
    src.start(t);
  },
  boing() {
    const d = Sound._dbg();
    if (!Sound.on || !d.ac || !d.sfxB || d.ac.state !== 'running') return;
    const ac = d.ac,
      t = ac.currentTime,
      o = ac.createOscillator(),
      g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(980, t + 0.12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g);
    g.connect(d.sfxB);
    o.start(t);
    o.stop(t + 0.3);
  },
};

/* ── la escena, cada fotograma ── */
function madrFrame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  T += dt;
  M.t += dt;
  madrSize();
  if (!M.g) return;
  const g = M.g,
    W = mEl.width,
    H = mEl.height;
  if (!M.bake) M.bake = madrBake();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(M.bake, 0, 0);
  const p = STYLE.Pen(g, M.ox, M.oy, M.s, 'madrd' + (STILL ? 0 : Math.floor(T * 4)), true),
    pv = STYLE.Pen(g, M.ox, M.oy, M.s, 'vol', true, true);
  madrMove(dt);
  madrPom(dt);
  madrPad();
  /* la lámpara */
  g.save();
  g.globalCompositeOperation = 'lighter';
  const lp = mP(-175, -110, 70),
    fl = STILL ? 1 : 0.92 + 0.08 * Math.sin(T * 9) * Math.sin(T * 3.1);
  const rg = g.createRadialGradient(lp[0], lp[1], 0, lp[0], lp[1], 260 * M.s);
  rg.addColorStop(0, `rgba(255,200,120,${0.3 * fl})`);
  rg.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, W, H);
  g.restore();
  const items = [];
  for (const S of MSPOT) if (!S.note) items.push({ y: S.y, f: () => spotDraw(p, S, T) });
  items.push({ y: M.pl.y, f: () => STYLE.player(pv, M.pl.x, M.pl.y, 0, M.pl.f, T, M.pl.moving) });
  const P0 = M.pom;
  if (P0 && P0.found) items.push({ y: P0.y, f: () => drawPompon(pv, P0.x, P0.y, 0, P0.f, T, { hop: P0.hop || 0, sniff: P0.sniff }) });
  if (M.scurry) {
    const u = (M.t - M.scurry.t0) / 0.55;
    if (u >= 1) M.scurry = null;
    else {
      const x = lerp(M.scurry.a.x, M.scurry.b.x, u),
        y = lerp(M.scurry.a.y, M.scurry.b.y, u);
      items.push({
        y,
        f: () => {
          const q = mP(x, y, 6 + Math.abs(Math.sin(u * TAU * 2)) * 10);
          p.cut(fluff(q[0], q[1], 10, 7, 16, 2, rng('sc'), M.s), '#FCFBF7', { rough: 0.4, sh: 0 });
        },
      });
    }
  }
  items.sort((a, b) => a.y - b.y);
  for (const it of items) it.f();
  spotDraw(
    p,
    MSPOT.find((s) => s.note),
    T,
  );
  /* orejas o colita que asoman */
  if (P0 && !P0.found && M.peek && M.t - M.peek.t0 < 1.3) {
    const S = MSPOT.find((s) => s.id === P0.spot),
      u = (M.t - M.peek.t0) / 1.3,
      up = Math.sin(Math.PI * Math.min(1, u * 1.4)) * 1;
    const pk = PEEK[P0.spot];
    drawPompon(p, S.x + pk[0], S.y + pk[1], pk[2] * up, 1, T, { mode: M.peek.kind, peek: 0 });
  }
  /* polvo en la luz */
  if (!STILL) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 26; k++) {
      const q = mP(-200 + ((k * 97 + T * 6) % 400), -200 + ((k * 53) % 360), 40 + ((k * 31 + T * 9) % 120));
      g.fillStyle = `rgba(255,230,180,${0.18 + 0.12 * Math.sin(T + k)})`;
      g.beginPath();
      g.arc(q[0], q[1], 1.4 * DPR, 0, TAU);
      g.fill();
    }
    g.restore();
  }
  /* resaltado y etiqueta de lo que se puede tocar */
  const near = madrNear();
  const hv = M.hover || near;
  if (hv) {
    const q = spotAt(hv);
    p.g.save();
    p.g.globalCompositeOperation = 'lighter';
    p.flat(p.ell(q[0], q[1], 46, 28, 20), 'rgba(255,220,150,.16)');
    p.g.restore();
    if (near === hv || M.hover) {
      g.save();
      g.font = `600 ${Math.round(15 * DPR)}px Fraunces, 'Noto Serif', 'Noto Serif SC', Georgia, serif`;
      g.textAlign = 'center';
      const txt = _t(hv.label) + (near === hv && !COARSE ? ' · E' : ''),
        w = g.measureText(txt).width + 22 * DPR,
        y = q[1] - 56 * M.s;
      g.fillStyle = 'rgba(251,244,227,.96)';
      g.fillRect(q[0] - w / 2, y - 17 * DPR, w, 26 * DPR);
      g.fillStyle = '#4A3222';
      g.fillText(txt, q[0], y + 2 * DPR);
      g.restore();
    }
  }
  narrTick(dt);
}
/* dónde asoma Pompón en cada escondite: [dx, dy, alto] */
const PEEK = { cojines: [18, -4, 40], cesta: [4, -4, 44], fuerte: [0, 20, 20], cajas: [26, 6, 34], baul: [0, -8, 34] };
{
  const fb0 = frameBody;
  frameBody = function (now) {
    if (M.on) {
      madrFrame(now);
      return;
    }
    fb0(now);
  };
}

/* ── moverse: tocar el suelo, un escondite, o con teclado/mando ── */
const MKEYS = {};
function madrNear() {
  let best = null,
    bd = 1e9;
  for (const S of MSPOT) {
    const tx = S.note ? -95 : S.x,
      ty = S.note ? -190 : S.y,
      d = Math.hypot(M.pl.x - tx, (M.pl.y - ty) * 1.2);
    if (d < (S.exit ? 60 : 95) && d < bd) {
      bd = d;
      best = S;
    }
  }
  return best;
}
function inRoom(x, y) {
  return inHex(x, y * 1.02, R - 40);
}
function madrMove(dt) {
  const P = M.pl;
  let vx = (MKEYS.r ? 1 : 0) - (MKEYS.l ? 1 : 0),
    vy = (MKEYS.d ? 1 : 0) - (MKEYS.u ? 1 : 0);
  if (M.padV) {
    vx += M.padV[0];
    vy += M.padV[1];
  }
  if (vx || vy) {
    P.go = null;
    const L = Math.hypot(vx, vy),
      sp = 150;
    const nx = P.x + (vx / L) * sp * dt,
      ny = P.y + (vy / L) * sp * dt;
    if (inRoom(nx, ny)) {
      P.x = nx;
      P.y = ny;
    }
    if (Math.abs(vx) > 0.1) P.f = vx > 0 ? 1 : -1;
    P.moving = true;
    return;
  }
  if (P.go) {
    const dx = P.go.x - P.x,
      dy = P.go.y - P.y,
      d = Math.hypot(dx, dy);
    if (d < 4) {
      const S = P.go.spot;
      P.go = null;
      P.moving = false;
      if (S) madrUse(S);
      return;
    }
    const sp = 160 * dt;
    P.x += (dx / d) * Math.min(sp, d);
    P.y += (dy / d) * Math.min(sp, d);
    if (Math.abs(dx) > 2) P.f = dx > 0 ? 1 : -1;
    P.moving = true;
    return;
  }
  P.moving = false;
}
function walkToSpot(S) {
  const tx = S.note ? -95 : S.x,
    ty = S.note ? -190 : S.y;
  let ax = tx + (tx > 0 ? -44 : 44),
    ay = ty + (S.exit ? 30 : 34);
  if (!inRoom(ax, ay)) {
    ax = tx * 0.7;
    ay = ty * 0.7 + 30;
  }
  M.pl.go = { x: ax, y: ay, spot: S };
}
mEl.addEventListener('pointerdown', (e) => {
  if (!M.on) return;
  e.preventDefault();
  const r = mEl.getBoundingClientRect(),
    sx = (e.clientX - r.left) * DPR,
    sy = (e.clientY - r.top) * DPR;
  let hit = null,
    bd = 1e9;
  for (const S of MSPOT) {
    const q = spotAt(S),
      d = Math.hypot(sx - q[0], sy - q[1]);
    if (d < Math.max(60 * M.s, 34 * DPR) && d < bd) {
      bd = d;
      hit = S;
    }
  }
  if (hit) {
    walkToSpot(hit);
    return;
  }
  const [x, y] = toFloor(sx, sy);
  if (inRoom(x, y)) M.pl.go = { x, y, spot: null };
});
mEl.addEventListener('pointermove', (e) => {
  if (!M.on || e.pointerType !== 'mouse') return;
  const r = mEl.getBoundingClientRect(),
    sx = (e.clientX - r.left) * DPR,
    sy = (e.clientY - r.top) * DPR;
  M.hover = null;
  for (const S of MSPOT) {
    const q = spotAt(S);
    if (Math.hypot(sx - q[0], sy - q[1]) < Math.max(60 * M.s, 34 * DPR)) {
      M.hover = S;
      break;
    }
  }
});
addEventListener(
  'keydown',
  (e) => {
    if (!M.on) return;
    if (!pickEl.hidden) {
      if (e.key === 'Escape') {
        pickEl.hidden = true;
        e.preventDefault();
      }
      e.stopImmediatePropagation();
      return;
    }
    const k = e.key,
      map = {
        ArrowUp: 'u',
        w: 'u',
        W: 'u',
        ArrowDown: 'd',
        s: 'd',
        S: 'd',
        ArrowLeft: 'l',
        a: 'l',
        A: 'l',
        ArrowRight: 'r',
        d: 'r',
        D: 'r',
      };
    if (map[k]) {
      MKEYS[map[k]] = 1;
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    if (k === 'e' || k === 'E' || k === 'Enter' || k === ' ') {
      const S = madrNear();
      if (S) madrUse(S);
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    if (k === 'Escape') {
      if (!pickEl.hidden) pickEl.hidden = true;
      else exitMadr();
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    e.stopImmediatePropagation();
  },
  true,
);
addEventListener(
  'keyup',
  (e) => {
    const map = {
      ArrowUp: 'u',
      w: 'u',
      W: 'u',
      ArrowDown: 'd',
      s: 'd',
      S: 'd',
      ArrowLeft: 'l',
      a: 'l',
      A: 'l',
      ArrowRight: 'r',
      d: 'r',
      D: 'r',
    };
    if (map[e.key]) MKEYS[map[e.key]] = 0;
  },
  true,
);
/* mando: stick para caminar, A usar, B salir */
let mPadPrev = {};
function madrPad() {
  let gp = null;
  try {
    gp = [...(navigator.getGamepads ? navigator.getGamepads() : [])].find((x) => x);
  } catch (e) {}
  if (!gp) {
    M.padV = null;
    return;
  }
  const b = (i) => gp.buttons[i] && gp.buttons[i].pressed,
    edge = (i) => b(i) && !mPadPrev[i];
  let x = Math.abs(gp.axes[0] || 0) > 0.3 ? gp.axes[0] : 0,
    y = Math.abs(gp.axes[1] || 0) > 0.3 ? gp.axes[1] : 0;
  if (b(14)) x = -1;
  if (b(15)) x = 1;
  if (b(12)) y = -1;
  if (b(13)) y = 1;
  M.padV = x || y ? [x, y] : null;
  if (!pickEl.hidden) {
    const L = [...pickEl.querySelectorAll('button')],
      a = document.activeElement,
      i = L.indexOf(a);
    if (edge(15) || edge(13)) (L[(i + 1) % L.length] || L[0]).focus();
    if (edge(14) || edge(12)) (L[(i - 1 + L.length) % L.length] || L[0]).focus();
    if (edge(0) && a && L.includes(a)) a.click();
    if (edge(1)) pickEl.hidden = true;
    M.padV = null;
  } else {
    if (edge(0)) {
      const S = madrNear();
      if (S) madrUse(S);
    }
    if (edge(1)) exitMadr();
  }
  for (let i = 0; i < 16; i++) mPadPrev[i] = b(i);
}

/* ── usar un escondite ── */
const MISS = [
  'Aquí no hay nadie. Solo pelusa.',
  'Nada. Huele a heno y a lavanda.',
  'Vacío. Pero algo se movió cerca…',
  'Solo un calcetín perdido.',
];
function madrUse(S) {
  const F = MF();
  if (S.exit) {
    exitMadr();
    return;
  }
  if (S.note) {
    learn('gorro', 'borlas', 'cuentas', 'chaleco', 'pompon');
    Sound.sfx('page');
    narrClear();
    narrate(
      [
        '«Nala: gorrito rojo con dos borlas rosas, cuentas moradas, chaleco morado de cuadritos y un pompón de todos los colores. Si la pierdes, la encuentras por el pompón.»',
        'Lo escribí a los siete años, por si alguna vez se perdía.',
      ],
      null,
    );
    return;
  }
  if (S.pile) {
    if (F.nala) {
      note('Los demás peluches se quedan aquí, cuidando la madriguera.');
      return;
    }
    openPicker();
    return;
  }
  if (M.lift[S.id] > 0.5) {
    M.lift[S.id] = 0;
    MSND.rustle(0.6);
    return;
  }
  M.lift[S.id] = 1;
  MSND.rustle();
  buzz(12);
  if (M.pom && !M.pom.found && M.pom.spot === S.id) {
    pomFound(S);
    return;
  }
  M.miss++;
  note(MISS[(M.miss - 1) % MISS.length]);
  if (M.pom && !M.pom.found && M.miss >= 2 && Math.random() < 0.4) {
    const left = HIDES.filter((h) => h !== M.pom.spot && !(M.lift[h] > 0.5));
    if (left.length) {
      const to = left[Math.floor(Math.random() * left.length)],
        a = MSPOT.find((s) => s.id === M.pom.spot),
        b = MSPOT.find((s) => s.id === to);
      M.scurry = { a, b, t0: M.t };
      M.pom.spot = to;
      setTimeout(() => {
        note('¡Algo blanco cruzó el suelo!');
        MSND.rustle(0.8);
      }, 200);
    }
  }
  setTimeout(() => {
    if (M.lift[S.id] > 0.5) M.lift[S.id] = 0;
  }, 2600);
}
function pomFound(S) {
  const F = MF();
  M.pom.found = true;
  M.pom.x = S.x + (S.x > 0 ? -30 : 30);
  M.pom.y = S.y + 30;
  M.pom.f = M.pl.x > M.pom.x ? 1 : -1;
  M.pom.hopT = M.t;
  F.pom = 1;
  MSND.boing();
  buzz([20, 40, 20]);
  EMO_M.push({ t0: M.t, x: M.pom.x, y: M.pom.y });
  achieve('pompon');
  stateChanged();
  narrClear();
  narrate(['Ahí estabas. Siempre en el último sitio donde miras.', 'Pompón. Mi fiel compañero. Desde hoy, te sigue a ti.'], null, {
    delay: 0.4,
  });
  setTimeout(() => note('Pompón te seguirá por toda la colmena'), 1200);
  updHand();
}
const EMO_M = [];
function madrPom(dt) {
  const P = M.pom;
  if (!P) return;
  if (!P.found) {
    M.peekT -= dt;
    if (M.peekT <= 0) {
      M.peekT = 5 + Math.random() * 4;
      M.peek = { t0: M.t, kind: Math.random() < 0.6 ? 'ears' : 'tail' };
      MSND.rustle(0.35);
    }
    M.nibT -= dt;
    if (M.nibT <= 0) {
      M.nibT = 1.6 + Math.random() * 1.2;
      const S = MSPOT.find((s) => s.id === P.spot),
        d = Math.hypot(M.pl.x - S.x, M.pl.y - S.y);
      MSND.nib(clamp(1.1 - d / 380, 0.08, 1));
    }
    return;
  }
  /* ya encontrado: te sigue dando saltitos */
  const tx = M.pl.x - M.pl.f * 38,
    ty = M.pl.y + 10,
    dx = tx - P.x,
    dy = ty - P.y,
    d = Math.hypot(dx, dy);
  if (d > 18) {
    const sp = 150 * dt;
    P.x += (dx / d) * Math.min(sp, d);
    P.y += (dy / d) * Math.min(sp, d);
    P.f = dx > 0 ? 1 : -1;
    P.hop = Math.abs(Math.sin(M.t * 9)) * 7;
  } else {
    P.hop = Math.max(0, (P.hop || 0) - dt * 40);
    P.f = M.pl.x > P.x ? 1 : -1;
  }
  if (M.t - (P.hopT || 0) < 1.2) P.hop = Math.abs(Math.sin((M.t - P.hopT) * 8)) * 14;
}

/* ── elegir a Nala entre los peluches ── */
function openPicker() {
  const F = MF(),
    box = document.getElementById('npick'),
    kn = nalaKnown();
  document.getElementById('nknow').innerHTML = kn.length
    ? _t('Lo que sabes de Nala:') + ' <b>' + kn.map((x) => _t(x)).join(LANG === 'zh' ? '、' : ', ') + '</b>'
    : _t('Todavía no sabes cómo era Nala. Quizá alguna nota lo diga.');
  const opts = [{ v: {}, ok: true }, ...PLUSH_ALT.slice(0, 5).map((v) => ({ v, ok: false }))];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  box.innerHTML = '';
  opts.forEach((o, i) => {
    const b = document.createElement('button'),
      c = document.createElement('canvas'),
      w = Math.round(120 * DPR),
      h = Math.round(140 * DPR);
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    g.fillStyle = '#FFF4DC';
    g.fillRect(0, 0, w, h);
    drawNala(STYLE.Pen(g, w / 2, h * 0.93, DPR * 1.25, 'pk' + i, false, true), 0, 0, 0, { v: o.v, seed: i, t: 0 });
    b.appendChild(c);
    b.setAttribute('aria-label', _t('Peluche') + ' ' + (i + 1));
    b.addEventListener('click', () => {
      if (o.ok) nalaFound();
      else {
        b.classList.remove('no');
        void b.offsetWidth;
        b.classList.add('no');
        Sound.sfx('blocked');
        note(nalaDiff(o.v));
      }
    });
    box.appendChild(b);
  });
  pickEl.hidden = false;
  setTimeout(() => {
    const f = box.querySelector('button');
    if (f) f.focus({ preventScroll: true });
  }, 60);
}
function nalaDiff(v) {
  if (v.hat && v.hat !== NALA.hat) return 'No es ella: el gorrito de Nala era rojo.';
  if (v.hasHat === false) return 'No es ella: Nala nunca se quitaba el gorrito.';
  if (v.tassels === false) return 'No es ella: le faltan las borlas rosas.';
  if (v.tassel && v.tassel !== NALA.tassel) return 'No es ella: las borlas de Nala eran rosas.';
  if (v.hasBeads === false) return 'No es ella: Nala tenía cuentas moradas junto a las orejas.';
  if (v.rainbow === false) return 'No es ella: el pompón de Nala era de todos los colores.';
  if (v.vest && v.vest !== NALA.vest) return 'No es ella: el chaleco de Nala era morado.';
  return 'No es ella.';
}
document.getElementById('npx').addEventListener('click', () => {
  pickEl.hidden = true;
});
function nalaFound() {
  const F = MF();
  pickEl.hidden = true;
  F.nala = 1;
  RELICS.includes('nala') || RELICS.push('nala');
  relics().nala = 1;
  Sound.sfx('seal');
  buzz([20, 60, 30]);
  achieve('nala');
  stateChanged();
  updHand();
  narrClear();
  narrate(
    [
      'Nala. Con su gorrito torcido y el pompón medio deshecho.',
      'La tengo desde que tengo memoria. Si alguna vez me encuentras, devuélvemela.',
    ],
    null,
    { delay: 0.3 },
  );
}
RELICS.includes('nala') || RELICS.push('nala');
Object.assign(ITEM_NAME, { nala: 'Nala, la llamita de peluche' });
Object.assign(ITEM_SHORT, { nala: 'Nala' });
{
  const tk0 = STYLE.token;
  STYLE.token = (p, x, y, z, kind, t, small) => {
    if (kind === 'nala') {
      drawNala(p, x, y, z - (small ? 18 : 10), { sc: small ? 0.42 : 0.5, noShadow: small, t });
      return;
    }
    tk0(p, x, y, z, kind, t, small);
  };
}
ACH.push(
  ['madr', 'La madriguera', 'Descubre el escondite debajo del escenario'],
  ['pompon', 'Fiel compañero', 'Encuentra a Pompón'],
  ['nala', 'De toda la vida', 'Reconoce a Nala entre los peluches'],
);

/* ══════════ POMPÓN, COMPAÑERO · te sigue por la colmena y olfatea las páginas escondidas ══════════ */
const POM = { here: null, x: 0, y: 0, f: 1, hop: 0, sniff: false, fear: 0, said: {} };
function pomTick(dt) {
  if (!MF().pom || (FREE && !MF().pom)) return;
  if (crossing || Pl.onPath) {
    POM.here = null;
    return;
  }
  if (POM.here !== cur) {
    POM.here = cur;
    POM.x = Pl.x - Pl.f * 34;
    POM.y = Pl.y + 12;
    if (!inHex(POM.x, POM.y * 1.02, R - 40)) {
      POM.x = Pl.x;
      POM.y = Pl.y + 14;
    }
    POM.sniff = false;
  }
  const F = PROG.F,
    page = PAGES[cur] && !(F.pages && F.pages[cur]) ? PAGES[cur] : null;
  let tx = Pl.x - Pl.f * 34,
    ty = Pl.y + 12;
  POM.sniff = false;
  if (POM.fear > 0) {
    POM.fear -= dt;
    tx = Pl.x - Pl.f * 18;
    ty = Pl.y - 6;
  } else if (page && !Pl.moving && !talking) {
    tx = page[0] + (page[0] > 0 ? -26 : 26);
    ty = page[1] + 14;
    if (Math.hypot(POM.x - tx, POM.y - ty) < 20) {
      POM.sniff = true;
      if (!POM.said.page) {
        POM.said.page = 1;
        note('Pompón olfatea algo en el suelo…');
      }
    }
  }
  const dx = tx - POM.x,
    dy = ty - POM.y,
    d = Math.hypot(dx, dy);
  if (d > 16) {
    const sp = (d > 160 ? 240 : 150) * dt;
    POM.x += (dx / d) * Math.min(sp, d);
    POM.y += (dy / d) * Math.min(sp, d);
    if (Math.abs(dx) > 1) POM.f = dx > 0 ? 1 : -1;
    POM.hop = STILL ? 0 : Math.abs(Math.sin(T * 9)) * 7;
  } else {
    POM.hop = Math.max(0, POM.hop - dt * 40);
    if (!POM.sniff) POM.f = Pl.x > POM.x ? 1 : -1;
  }
}
/* se dibuja ordenado con el resto de cosas del cuarto */
window.XITEMS = function (p, pv, items, id) {
  if (!MF().pom || POM.here !== id || id !== cur || crossing || Pl.onPath) return;
  const jit = POM.fear > 0 && !STILL ? Math.sin(T * 60) * 1.2 : 0;
  items.push({
    y: POM.y,
    f: () => {
      drawPompon(pv, POM.x + jit, POM.y, 0, POM.f, T, { hop: POM.hop, sniff: POM.sniff, sc: 0.9 });
      if (POM.sniff && !STILL && Math.sin(T * 2) > 0.2) {
        const q = pv.P(POM.x + POM.f * 14, POM.y, 40);
        pv.text('?', q[0], q[1], 12, '#8A5A34');
      }
    },
  });
};
{
  const qf0 = qFrame;
  qFrame = function (s) {
    qf0(s);
    const dt = Math.min(0.1, Math.max(0, T - (qFrame.lp || T)));
    qFrame.lp = T;
    pomTick(dt);
  };
}
/* tocar a Pompón: un saltito y un corazón */
{
  const i0 = interact;
  interact = function () {
    if (MF().pom && POM.here === cur && !talking && !nearObj && Math.hypot(Pl.x - POM.x, Pl.y - POM.y) < 70) {
      POM.hop = 16;
      EMO_POM = T;
      MSND.boing();
      return;
    }
    i0();
  };
}
let EMO_POM = -9;

/* ── en los finales: Pompón y Nala ── */
{
  const se0 = showEnding;
  showEnding = function (k, title, lines, after) {
    if (/^Final/.test(k)) {
      const F = MF(),
        L = lines.slice(),
        at = Math.max(
          0,
          L.findIndex((l) => l.startsWith('—')),
        );
      const add = [];
      if (F.nala) add.push('Le devolviste a Nala. «La guardé toda la vida», dijo. «Pensé que la había perdido esa noche.»');
      if (F.pom) add.push('Pompón se acurrucó a sus pies, como si nunca se hubiera ido.');
      if (add.length) {
        L.splice(at < 0 ? L.length : at, 0, ...add);
        lines = L;
      }
    }
    return se0(k, title, lines, after);
  };
}
