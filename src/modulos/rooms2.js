/* ══════════ CAPÍTULOS 3 A 6 Y EL CORAZÓN · 17 habitaciones (papel) ══════════ */
Object.assign(SEASON, {
  col: { tint: '#F2D08A', seal: '#D69B2E', icon: '⬢', door: '#FBE7B4', name: 'Colmenar' },
  bib: { tint: '#7C9A76', seal: '#4E6B46', icon: '❡', door: '#E8DDB8', name: 'Biblioteca' },
  coc: { tint: '#E8A070', seal: '#C9694B', icon: '♨', door: '#FBE1C8', name: 'Cocina de miel' },
  rel: { tint: '#C9A878', seal: '#8A6A3A', icon: '◎', door: '#F2E4C4', name: 'Relojería' },
  inn: { tint: '#4A5A8A', seal: '#3A4A7A', icon: '☾', door: '#2E3A62', name: 'Invernadero nocturno' },
  tea: { tint: '#8A4A5A', seal: '#8A3A4A', icon: '◐', door: '#F6D9A0', name: 'Teatro de sombras' },
  tre: { tint: '#7A4A3A', seal: '#3F5F4A', icon: '◆', door: '#E9D2A8', name: 'Tren nocturno' },
  far: { tint: '#D8E2EA', seal: '#B8484A', icon: '✺', door: '#F7F4EE', name: 'Faro' },
  sot: { tint: '#C9A060', seal: '#8A6A3A', icon: '▣', door: '#F3E0B0', name: 'Sótano de cera' },
  cue: { tint: '#6A6090', seal: '#5A4A8A', icon: '◇', door: '#C8C0E8', name: 'Cueva de cristales' },
  vol: { tint: '#6A4040', seal: '#C9563A', icon: '✹', door: '#F0A060', name: 'Volcán' },
  cum: { tint: '#C8DCEC', seal: '#6A8AAA', icon: '∧', door: '#EEF4F8', name: 'Cumbre' },
  dsv: { tint: '#D0B890', seal: '#8A6A4A', icon: '✉', door: '#EEDCB8', name: 'Desván' },
  est: { tint: '#E8C888', seal: '#A06A3A', icon: '✎', door: '#F8E4B4', name: 'Estudio de Amaranta' },
  ret: { tint: '#9A4A5A', seal: '#7A3240', icon: '▢', door: '#F2D8C8', name: 'Sala de retratos' },
  jar: { tint: '#A8C48A', seal: '#5E7C50', icon: '❀', door: '#E4F0D4', name: 'Jardín de los nombres' },
  cor: { tint: '#F0C060', seal: '#C9772F', icon: '♥', door: '#FFE8B0', name: 'El Corazón' },
});
const mkPal = (seed, floor, tiles, walls, relief, wainscot, seam, floorDecor) => ({
  seed,
  floor,
  tiles,
  walls: { '3,4': walls[0], '4,5': walls[1], '5,0': walls[2] },
  relief,
  wainscot,
  seam,
  floorDecor,
});
const EL = [3, 4],
  ET = [4, 5],
  ER = [5, 0];
const room = (pal, decor) => (p) => {
  shell(p, pal);
  decor(p, rng(pal.seed + '-dec'));
  shellTop(p, pal);
};
const box3P = (p, x0, x1, y0, y1, z0, z1, c1, c2, c3, o = {}) => {
  p.cut([p.P(x0, y1, z0), p.P(x1, y1, z0), p.P(x1, y1, z1), p.P(x0, y1, z1)], c1, { blur: 4, rough: o.rough ?? 0.4 });
  if (c2) p.cut([p.P(x1, y1, z0), p.P(x1, y0, z0), p.P(x1, y0, z1), p.P(x1, y1, z1)], c2, { sh: 0, rough: 0.3 });
  p.cut([p.P(x0, y0, z1), p.P(x1, y0, z1), p.P(x1, y1, z1), p.P(x0, y1, z1)], c3, { sh: 0, rough: 0.3 });
};
const glowA = (p, x, y, z, rx, ry, col, a) => {
  const q = p.P(x, y, z);
  p.g.save();
  p.g.globalCompositeOperation = 'lighter';
  p.flat(p.ell(q[0], q[1], rx, ry, 20), col, a);
  p.g.restore();
};
const wallHexes = (p, e, u0, u1, z0, z1, r, cols, R0) => {
  for (let z = z0, row = 0; z < z1; z += r * 1.75, row++)
    for (let u = u0 + ((row % 2) * r * 0.9) / 300; u < u1; u += (r * 1.8) / 300) {
      const H = [];
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3 + Math.PI / 6;
        H.push(p.W(wallPt(e, u + (Math.cos(a) * r * 0.95) / 300, z + Math.sin(a) * r * 0.95, 1)));
      }
      p.cut(H, pick(R0, cols), { sh: 0, rough: 0.2 });
    }
};
const booksRow = (p, e, u0, u1, z, R0) => {
  let u = u0;
  while (u < u1 - 0.02) {
    const w = rd(R0, 0.012, 0.024),
      h = rd(R0, 14, 22),
      col = pick(R0, ['#B8484A', '#3F7F5F', '#E4A844', '#4A548E', '#8A5A3A', '#C9694B', '#6F8D5E', '#F3E6C4']);
    p.cut([p.W(wallPt(e, u, z, 6)), p.W(wallPt(e, u + w, z, 6)), p.W(wallPt(e, u + w, z + h, 6)), p.W(wallPt(e, u, z + h, 6))], col, {
      sh: 0,
      rough: 0.1,
    });
    u += w + 0.002;
  }
};
const nightWin = (p, e, u, z, r, R0, moon) => {
  const w = circWin(p, e, u, z, r, 30);
  p.cut(circWin(p, e, u, z, r + 7, 30), '#8A5A34', { blur: 3, rough: 0.3 });
  p.flat(w, '#1E2A4A');
  p.clip(w, () => {
    for (let k = 0; k < 22; k++) {
      const q = p.W(wallPt(e, u + rd(R0, -0.18, 0.18), z + rd(R0, -r, r), -8));
      p.flat(p.ell(q[0], q[1], 0.8, 0.8, 6), '#FFF6D8', rd(R0, 0.4, 1));
    }
    if (moon) {
      const m = p.W(wallPt(e, u + 0.05, z + r * 0.35, -8));
      p.flat(p.ell(m[0], m[1], 9, 9, 18), '#F6EBD0');
    }
  });
  return w;
};
const flameAt = (p, x, y, z, t, sz = 1) => {
  const q = p.P(x, y, z),
    s = p.s,
    fl = Math.sin(t * 11 + x) * 0.8;
  p.flat(
    [
      [q[0] - 2.2 * s * sz, q[1]],
      [q[0] + fl * s, q[1] - 9 * s * sz],
      [q[0] + 2.2 * s * sz, q[1]],
    ],
    '#F5A83A',
  );
  p.flat(
    [
      [q[0] - 1 * s * sz, q[1]],
      [q[0] + fl * 0.5 * s, q[1] - 5 * s * sz],
      [q[0] + 1 * s * sz, q[1]],
    ],
    '#FFE08A',
  );
};
const R2 = (seed) => rng(seed);

/* ─────────── 3 · LOS OFICIOS ─────────── */
const COL = mkPal(
  'col',
  '#F1DDA2',
  ['#EFD394', '#F3DDA8', '#E8C77E', '#F6E2B2', '#EACB88'],
  ['#F2D79C', '#F7E0A8', '#F4DBA0'],
  ['#E4B866', '#FFF0C8'],
  '#C98A2F',
  '#D2A04C',
  (p, R0) => {
    for (let k = 0; k < 7; k++) {
      const q = p.P(rd(R0, -R * 0.8, R * 0.8), rd(R0, -R * 0.5, R * 0.8), 0);
      for (let j = 0; j < 4; j++)
        flowerDot(p, q[0] + rd(R0, -14, 14) * p.s, q[1] + rd(R0, -5, 5) * p.s, rd(R0, 2.2, 3.2), pick(R0, [C.cream, C.butter, '#D8A3C9']));
    }
  },
);
const colBase = room(COL, (p, R0) => {
  wallHexes(p, ER, 0.1, 0.9, 36, 118, 7, ['#E4A844', '#F0C060', '#F6D27A', '#F9EBC6', '#E4A844'], R0);
});
function drawHive(p, x, y, lv = 3) {
  const s = p.s;
  p.flat(p.ell(...p.P(x, y, 0), 34, 12), 'rgba(70,40,15,.22)');
  for (let k = 0; k < lv; k++) {
    const z0 = 6 + k * 20;
    box3P(p, x - 26, x + 26, y - 18, y + 18, z0, z0 + 18, k % 2 ? '#F4EFE2' : '#EFE6D2', '#DCD0B8', '#F7F2E6');
    p.line([p.P(x - 26, y + 18, z0 + 9), p.P(x + 26, y + 18, z0 + 9)], '#E4A844', 1.6, 0.8);
  }
  p.flat([p.P(x - 10, y + 18, 8), p.P(x + 10, y + 18, 8), p.P(x + 10, y + 18, 11), p.P(x - 10, y + 18, 11)], '#3A2A20');
  const zt = 6 + lv * 20;
  p.cut(
    [
      p.P(x - 30, y + 20, zt),
      p.P(x + 30, y + 20, zt),
      p.P(x + 30, y - 20, zt),
      p.P(x - 30, y - 20, zt),
      p.P(x, y - 20, zt + 14),
      p.P(x, y + 20, zt + 14),
    ]
      .filter((q, i) => i < 4 || true)
      .slice(0, 4),
    '#C98A42',
    { rough: 0.3 },
  );
  p.cut([p.P(x - 30, y + 20, zt), p.P(x + 30, y + 20, zt), p.P(x, y + 20, zt + 14)], '#B8783A', { rough: 0.2 });
}
const HIVES = [
  [150, -130, 3],
  [195, -30, 2],
  [-150, 110, 3],
];
const BEES = [...Array(10)].map((_, k) => [k % 3, (k * 0.37) % 1, 0.6 + (k % 4) * 0.25, (k * 53) % 360]);

/* Biblioteca */
const BIB = mkPal(
  'bib',
  '#C9A36F',
  ['#D2AE7C', '#C9A36F', '#DDBF90', '#CFAA76', '#D6B582'],
  ['#5E7A5A', '#66835F', '#607C5C'],
  ['#4E6B4A', '#789676'],
  '#6E3E17',
  '#3A2A20',
);
const bibBase = room(BIB, (p, R0) => {
  for (const [e, u0, u1] of [
    [EL, 0.05, 0.34],
    [EL, 0.66, 0.95],
    [ER, 0.05, 0.95],
  ]) {
    for (const z of [26, 52, 78, 104]) {
      shelf(p, e, u0, u1, z, 16, '#8A5A34');
      booksRow(p, e, u0 + 0.02, u1 - 0.02, z + 1, R0);
    }
  }
  const w = hexWin(p, ET, 0.5, 78, 40);
  p.cut(hexWin(p, ET, 0.5, 78, 48), '#8A5A34', { blur: 3, rough: 0.3 });
  p.flat(w, '#1E2A4A');
  p.clip(w, () => {
    for (let k = 0; k < 18; k++) {
      const q = p.W(wallPt(ET, 0.5 + rd(R0, -0.12, 0.12), rd(R0, 44, 112), -8));
      p.flat(p.ell(q[0], q[1], 0.8, 0.8, 6), '#FFF6D8', 0.8);
    }
    const m = p.W(wallPt(ET, 0.55, 96, -8));
    p.flat(p.ell(m[0], m[1], 8, 8, 18), '#F6EBD0');
  });
  shelf(p, ET, 0.12, 0.32, 40, 16, '#8A5A34');
  booksRow(p, ET, 0.13, 0.31, 41, R0);
  shelf(p, ET, 0.68, 0.88, 40, 16, '#8A5A34');
  booksRow(p, ET, 0.69, 0.87, 41, R0);
});
function drawReadingTable(p) {
  const s = p.s,
    x = -120,
    y = -40;
  for (const [dx, dy] of [
    [-40, -20],
    [40, -20],
    [-40, 20],
    [40, 20],
  ])
    p.line([p.P(x + dx, y + dy, 0), p.P(x + dx, y + dy, 32)], '#6E3E17', 3);
  box3P(p, x - 46, x + 46, y - 24, y + 24, 32, 38, '#8A5A34', '#6E3E17', '#A87044');
  p.cut([p.P(x - 18, y - 6, 39), p.P(x + 2, y - 8, 40), p.P(x + 2, y + 10, 40), p.P(x - 18, y + 12, 39)], C.cream, { sh: 0, rough: 0.2 });
  p.cut([p.P(x + 2, y - 8, 40), p.P(x + 22, y - 6, 39), p.P(x + 22, y + 12, 39), p.P(x + 2, y + 10, 40)], '#F6EFDC', { sh: 0, rough: 0.2 });
  const l = p.P(x + 30, y - 10, 38);
  p.line([l, [l[0], l[1] - 22 * s]], '#3A2A20', 2);
  p.cut(
    [
      [l[0] - 10 * s, l[1] - 20 * s],
      [l[0] + 10 * s, l[1] - 20 * s],
      [l[0] + 6 * s, l[1] - 30 * s],
      [l[0] - 6 * s, l[1] - 30 * s],
    ],
    '#3F7F5F',
    { rough: 0.1 },
  );
  p.flat(p.ell(l[0], l[1] - 19 * s, 7, 2, 12), '#FFE08A');
}
function drawGlobe(p) {
  const s = p.s,
    x = 170,
    y = 60,
    b = p.P(x, y, 0);
  p.line([b, [b[0], b[1] - 30 * s]], '#6E3E17', 3);
  const c = [b[0], b[1] - 46 * s];
  p.cut(p.ell(c[0], c[1], 17, 17, 26), '#7CB5C8', { rough: 0.2 });
  p.flat(p.ell(c[0] - 5 * s, c[1] - 3 * s, 7, 9, 16, 0.4), '#8FB573');
  p.flat(p.ell(c[0] + 7 * s, c[1] + 6 * s, 5, 4, 12), '#8FB573');
  const r = p.ell(c[0], c[1], 20, 20, 26);
  p.line(r.slice(3, 17), '#C9A05C', 1.6);
}
function drawLadder(p) {
  const s = p.s,
    x = 215,
    y = -80;
  for (const dy of [-14, 14]) p.line([p.P(x, y + dy, 0), p.P(x + 30, y + dy, 118)], '#A87044', 2.4);
  for (let k = 1; k < 9; k++) {
    const f = k / 9;
    p.line([p.P(x + 30 * f, y - 14, 118 * f), p.P(x + 30 * f, y + 14, 118 * f)], '#A87044', 1.6);
  }
}
const MOTES = [...Array(12)].map((_, k) => [((k * 37) % 100) / 100, ((k * 53) % 100) / 100, 0.02 + (k % 5) * 0.006]);

/* Cocina de miel */
const COC = mkPal(
  'coc',
  '#D98A5A',
  ['#D98A5A', '#E09A68', '#CF7F52', '#E6A676', '#D58F60'],
  ['#F4E1BE', '#F8E8C8', '#F2DDB6'],
  ['#E8CFA0', '#FFF4DC'],
  '#6F8D5E',
  '#C9A05C',
);
const cocBase = room(COC, (p, R0) => {
  const a = [];
  for (let k = 0; k <= 16; k++) {
    const an = Math.PI + (k / 16) * Math.PI;
    a.push(p.W(wallPt(ER, 0.5 + (Math.cos(an) * 70) / 300, 54 - Math.sin(an) * 44, 1)));
  }
  a.push(p.W(wallPt(ER, 0.5 + 70 / 300, 0, 1)), p.W(wallPt(ER, 0.5 - 70 / 300, 0, 1)));
  p.cut(a, '#B8583E', { blur: 4, rough: 0.4 });
  const inn = [];
  for (let k = 0; k <= 12; k++) {
    const an = Math.PI + (k / 12) * Math.PI;
    inn.push(p.W(wallPt(ER, 0.5 + (Math.cos(an) * 48) / 300, 34 - Math.sin(an) * 28, 2)));
  }
  inn.push(p.W(wallPt(ER, 0.5 + 48 / 300, 0, 2)), p.W(wallPt(ER, 0.5 - 48 / 300, 0, 2)));
  p.flat(inn, '#3A2A20');
  for (let k = 0; k < 5; k++) {
    const q = p.W(wallPt(ER, 0.44 + k * 0.03, 6, 4));
    p.cut(p.ell(q[0], q[1], 6, 2.6, 12), '#8A5A3A', { sh: 0, rough: 0.2 });
  }
  for (const z of [40, 76]) {
    shelf(p, EL, 0.1, 0.9, z, 18, '#B8783A');
    for (let u = 0.16; u < 0.86; u += 0.1) {
      const w = wallPt(EL, u, z, 9),
        c = p.P(w[0], w[1], z);
      p.cut(
        [
          [c[0] - 6 * p.s, c[1]],
          [c[0] + 6 * p.s, c[1]],
          [c[0] + 6 * p.s, c[1] - 14 * p.s],
          [c[0] - 6 * p.s, c[1] - 14 * p.s],
        ],
        'rgba(228,168,68,.92)',
        { rough: 0.1 },
      );
      p.flat(
        [
          [c[0] - 6.6 * p.s, c[1] - 14 * p.s],
          [c[0] + 6.6 * p.s, c[1] - 14 * p.s],
          [c[0] + 6.6 * p.s, c[1] - 18 * p.s],
          [c[0] - 6.6 * p.s, c[1] - 18 * p.s],
        ],
        pick(R0, [C.petalD, C.teal, C.sageD, C.cream]),
      );
    }
  }
  for (let k = 0; k < 6; k++) {
    const q = p.W(wallPt(EL, 0.14 + k * 0.14, 118, 2));
    p.line([q, [q[0], q[1] + 14 * p.s]], '#6A4226', 1);
    for (let j = 0; j < 3; j++)
      leafShape(p, q[0] + rd(R0, -3, 3) * p.s, q[1] + (12 + j * 4) * p.s, Math.PI / 2 + rd(R0, -0.6, 0.6), 8, C.sageD);
  }
});
function drawPot(p) {
  const s = p.s,
    x = 150,
    y = -95;
  const c = cylinder(p, x, y, 0, 28, 34, '#B8653A', '#3A2A20', { r1: 32 });
  p.flat(p.ring(x, y, 34, 26, 26), '#E4A844');
  p.line([p.P(x - 32, y, 30), p.P(x - 40, y, 30)], '#8A4A2A', 3);
  p.line([p.P(x + 32, y, 30), p.P(x + 40, y, 30)], '#8A4A2A', 3);
}
function drawKTable(p) {
  const s = p.s,
    x = -40,
    y = 60;
  for (const [dx, dy] of [
    [-44, -20],
    [44, -20],
    [-44, 20],
    [44, 20],
  ])
    p.line([p.P(x + dx, y + dy, 0), p.P(x + dx, y + dy, 30)], '#8A5A34', 3);
  box3P(p, x - 50, x + 50, y - 24, y + 24, 30, 36, '#A87044', '#8A5A34', '#C98A5A');
  const b = p.P(x - 18, y, 37);
  p.cut(p.ell(b[0], b[1] - 5 * s, 16, 9, 20), '#D69646', { rough: 0.4 });
  for (let k = -1; k <= 1; k++)
    p.line(
      [
        [b[0] + k * 6 * s - 3 * s, b[1] - 9 * s],
        [b[0] + k * 6 * s + 3 * s, b[1] - 3 * s],
      ],
      '#B8783A',
      1.2,
    );
  const j = p.P(x + 20, y - 4, 36);
  p.cut(
    [
      [j[0] - 7 * s, j[1]],
      [j[0] + 7 * s, j[1]],
      [j[0] + 7 * s, j[1] - 16 * s],
      [j[0] - 7 * s, j[1] - 16 * s],
    ],
    'rgba(228,168,68,.95)',
    { rough: 0.1 },
  );
  p.flat(
    [
      [j[0] - 7.6 * s, j[1] - 16 * s],
      [j[0] + 7.6 * s, j[1] - 16 * s],
      [j[0] + 7.6 * s, j[1] - 20 * s],
      [j[0] - 7.6 * s, j[1] - 20 * s],
    ],
    C.petalD,
  );
  p.line(
    [
      [j[0] + 3 * s, j[1] - 22 * s],
      [j[0] + 9 * s, j[1] - 34 * s],
    ],
    '#8A5A34',
    1.6,
  );
}

/* Relojería */
const REL = mkPal(
  'rel',
  '#8A5A3A',
  ['#8A5A3A', '#946244', '#7E5234', '#9A6848', '#86583A'],
  ['#E9D8B4', '#EFDFBE', '#E6D3AC'],
  ['#D8C295', '#F8ECD0'],
  '#6E3E17',
  '#8A6A3A',
);
const clockFace = (p, e, u, z, r, R0) => {
  const c = p.W(wallPt(e, u, z, 2));
  p.cut(p.ell(c[0], c[1], r + 2.5, r + 2.5, 24), pick(R0, ['#8A5A34', '#C9A05C', '#6E3E17']), { blur: 2, rough: 0.2 });
  p.flat(p.ell(c[0], c[1], r, r, 22), '#FBF4E3');
  const a1 = rd(R0, 0, TAU),
    a2 = rd(R0, 0, TAU);
  p.line([c, [c[0] + Math.cos(a1) * r * 0.55 * p.s, c[1] + Math.sin(a1) * r * 0.55 * p.s]], C.ink, 1.2);
  p.line([c, [c[0] + Math.cos(a2) * r * 0.8 * p.s, c[1] + Math.sin(a2) * r * 0.8 * p.s]], C.ink, 0.8);
};
const relBase = room(REL, (p, R0) => {
  for (const [u, z, r] of [
    [0.15, 94, 11],
    [0.3, 70, 15],
    [0.47, 100, 9],
    [0.6, 66, 12],
    [0.76, 96, 14],
    [0.88, 62, 8],
    [0.2, 46, 8],
    [0.72, 40, 7],
  ])
    clockFace(p, EL, u, z, r, R0);
  shelf(p, ER, 0.55, 0.92, 44, 18, '#6E3E17');
  const tb = [p.W(wallPt(ER, 0.1, 50, 1)), p.W(wallPt(ER, 0.48, 50, 1)), p.W(wallPt(ER, 0.48, 112, 1)), p.W(wallPt(ER, 0.1, 112, 1))];
  p.cut(tb, '#C9A878', { blur: 3, rough: 0.3 });
  for (const [u, z] of [
    [0.18, 98],
    [0.28, 84],
    [0.4, 100],
    [0.22, 64],
    [0.38, 70],
  ]) {
    const q = p.W(wallPt(ER, u, z, 1.5));
    p.line(
      [
        [q[0], q[1]],
        [q[0], q[1] + 10 * p.s],
      ],
      '#5A4A42',
      1.6,
    );
    p.flat(p.ell(q[0], q[1], 2, 2, 8), '#5A4A42');
  }
});
function gearPts(cx, cy, r, n, rot, s) {
  const o = [];
  for (let k = 0; k < n * 2; k++) {
    const a = rot + (k / (n * 2)) * TAU,
      rr = (k % 2 ? r * 0.78 : r) * s;
    o.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.95]);
  }
  return o;
}
function drawGrandClock(p) {
  const s = p.s,
    x = -185,
    y = -50;
  box3P(p, x - 18, x + 18, y - 12, y + 12, 0, 130, '#6E3E17', '#5A3212', '#8A5A34');
  const f = p.P(x, y + 12, 108);
  p.flat(p.ell(f[0], f[1], 13, 13, 22), '#C9A05C');
  p.flat(p.ell(f[0], f[1], 11, 11, 22), '#FBF4E3');
  p.line([f, [f[0] + 4 * s, f[1] - 7 * s]], C.ink, 1.3);
  p.line([f, [f[0] - 6 * s, f[1] + 2 * s]], C.ink, 1);
  p.flat([p.P(x - 9, y + 12, 24), p.P(x + 9, y + 12, 24), p.P(x + 9, y + 12, 86), p.P(x - 9, y + 12, 86)], '#2A1E18');
}
function drawWorkbench(p) {
  const s = p.s,
    x = 150,
    y = -40;
  for (const [dx, dy] of [
    [-40, -18],
    [40, -18],
    [-40, 18],
    [40, 18],
  ])
    p.line([p.P(x + dx, y + dy, 0), p.P(x + dx, y + dy, 34)], '#5A3212', 3);
  box3P(p, x - 46, x + 46, y - 22, y + 22, 34, 40, '#8A5A34', '#6E3E17', '#A87044');
  for (const [dx, dy, r] of [
    [-20, 0, 6],
    [-6, 6, 4],
    [10, -4, 5],
  ]) {
    const c = p.P(x + dx, y + dy, 41);
    p.line([...gearPts(c[0], c[1], r, 8, 0, s)], '#C9A05C', 1.2);
  }
  const l = p.P(x + 30, y - 12, 40);
  p.line([l, [l[0] - 6 * s, l[1] - 24 * s], [l[0] + 2 * s, l[1] - 34 * s]], '#5A5A66', 2);
  p.cut(p.ell(l[0] + 2 * s, l[1] - 34 * s, 7, 4, 12), '#5A5A66', { rough: 0.1 });
}

/* ─────────── 4 · LOS SUEÑOS ─────────── */
const INN = mkPal(
  'inn',
  '#2E3A52',
  ['#344262', '#2F3B58', '#3A4A6C', '#2B3650', '#36445F'],
  ['#243052', '#2A3760', '#263358'],
  ['#1E2848', '#3A4878'],
  '#4A6A5A',
  '#1A2240',
  (p, R0) => {
    for (let k = 0; k < 14; k++) {
      const q = p.P(rd(R0, -R * 0.8, R * 0.8), rd(R0, -R * 0.6, R * 0.8), 0);
      p.flat(p.ell(q[0], q[1], rd(R0, 8, 18), rd(R0, 3, 6), 12), '#4A6A7A', 0.35);
    }
  },
);
const innBase = room(INN, (p, R0) => {
  for (const e of [EL, ET, ER]) {
    for (let u = 0.1; u < 0.95; u += 0.2) p.line([p.W(wallPt(e, u, 0, 1)), p.W(wallPt(e, u, HW, 1))], '#6A7AA8', 1.4, 0.7);
    for (const z of [44, 88]) p.line([p.W(wallPt(e, 0, z, 1)), p.W(wallPt(e, 1, z, 1))], '#6A7AA8', 1.2, 0.6);
    for (let k = 0; k < 10; k++) {
      const q = p.W(wallPt(e, rd(R0, 0.05, 0.95), rd(R0, 50, 126), -4));
      p.flat(p.ell(q[0], q[1], 0.8, 0.8, 6), '#FFF6D8', rd(R0, 0.4, 0.9));
    }
  }
  const m = p.W(wallPt(ET, 0.62, 100, -6));
  p.flat(p.ell(m[0], m[1], 18, 18, 26), '#F6EBD0');
  p.flat(p.ell(m[0] + 6 * p.s, m[1] - 3 * p.s, 15, 15, 24), '#243052');
  for (const e of [EL, ER])
    for (let k = 0; k < 4; k++) {
      const u = 0.1 + k * 0.26,
        pts = [];
      for (let j = 0; j <= 8; j++) pts.push(p.W(wallPt(e, u + Math.sin(j * 0.8 + k) * 0.02, 4 + j * 10, 2)));
      p.line(pts, '#3F6A5A', 2.2, 0.9);
      for (let j = 2; j < 8; j += 2) leafShape(p, pts[j][0], pts[j][1], rd(R0, 0, TAU), 9, '#4E8A6E');
    }
});
function drawMoonBed(p) {
  const s = p.s,
    x = -130,
    y = -70,
    R0 = rng('lunar');
  box3P(p, x - 60, x + 60, y - 30, y + 30, 0, 22, '#3A4A6C', '#2E3A5A', '#2A3450');
  p.flat([p.P(x - 54, y - 26, 22), p.P(x + 54, y - 26, 22), p.P(x + 54, y + 26, 22), p.P(x - 54, y + 26, 22)], '#243040');
  for (let k = 0; k < 9; k++) {
    const dx = rd(R0, -48, 48),
      dy = rd(R0, -20, 20),
      h = rd(R0, 22, 40),
      b = p.P(x + dx, y + dy, 22),
      tp = [b[0], b[1] - h * s];
    p.line([b, tp], '#4E8A6E', 1.6);
    leafShape(p, b[0], b[1] - h * 0.4 * s, -Math.PI / 2 + rd(R0, -1, 1), 10, '#4E8A6E');
    p.flat(p.ell(tp[0], tp[1], 9, 9, 14), 'rgba(200,220,255,.18)');
    flowerDot(p, tp[0], tp[1], rd(R0, 3.4, 4.6), pick(R0, ['#E8F0FF', '#D8D0FF', '#CFEFFF']), '#FFF6C8');
  }
}
function drawNightPlant(p) {
  const s = p.s,
    x = 150,
    y = -120;
  pot(p, x, y, 26, 30, '#3A4A6C');
  const b = p.P(x, y, 30);
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI / 2 + (k - 3) * 0.34;
    p.cut(p.leaf(b[0], b[1], a, 56 + (k % 2) * 14, 12), k % 2 ? '#3F6A5A' : '#4E8A6E', { rough: 0.3 });
  }
  const fl = [b[0] + 4 * s, b[1] - 70 * s];
  p.flat(p.ell(fl[0], fl[1], 20, 20, 18), 'rgba(220,235,255,.2)');
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * TAU;
    p.cut(p.ell(fl[0] + Math.cos(a) * 7 * s, fl[1] + Math.sin(a) * 6 * s, 7, 4, 12, a), '#F0F4FF', { sh: 0, rough: 0.2 });
  }
  p.flat(p.ell(fl[0], fl[1], 3.4, 3.4, 10), '#FFF0A8');
}
const FIRE = [...Array(14)].map((_, k) => [((k * 47) % 100) / 100, ((k * 71) % 100) / 100, ((k * 29) % 100) / 100]);

/* Teatro de sombras */
const TEA = mkPal(
  'tea',
  '#7A3A2E',
  ['#7A3A2E', '#84423A', '#6E3228', '#8A4A3C', '#763A30'],
  ['#3A2230', '#422838', '#3E2434'],
  ['#301A28', '#5A3A4A'],
  '#8C4B1F',
  '#2A1420',
  (p, R0) => {
    for (let row = 0; row < 3; row++)
      for (let k = 0; k < 4; k++) {
        const q = p.P(-60 + row * 40 - k * 24, -40 + k * 48 + row * 6, 0);
        p.cut(p.ell(q[0], q[1], 13, 6, 16), pick(R0, ['#B8484A', '#E4A844', '#8A3A4A']), { blur: 2, rough: 0.3 });
      }
  },
);
const SCREEN = [0.2, 0.8, 34, 112];
const teaBase = room(TEA, (p, R0) => {
  const [u0, u1, z0, z1] = SCREEN,
    sc = [p.W(wallPt(ER, u0, z0, 2)), p.W(wallPt(ER, u1, z0, 2)), p.W(wallPt(ER, u1, z1, 2)), p.W(wallPt(ER, u0, z1, 2))];
  p.cut(sc, '#F6D9A0', { blur: 6, rough: 0.2 });
  for (const [ua, ub] of [
    [u0 - 0.08, u0 + 0.05],
    [u1 - 0.05, u1 + 0.08],
  ]) {
    const cu = [p.W(wallPt(ER, ua, 6, 4)), p.W(wallPt(ER, ub, 6, 4)), p.W(wallPt(ER, ub, 124, 4)), p.W(wallPt(ER, ua, 124, 4))];
    p.cut(cu, '#B8484A', { blur: 4, rough: 0.5 });
    p.clip(cu, () => {
      for (let u = ua; u < ub; u += 0.025) p.line([p.W(wallPt(ER, u, 6, 4.5)), p.W(wallPt(ER, u, 124, 4.5))], '#8A2E3A', 1.4, 0.6);
    });
  }
  const va = [
    p.W(wallPt(ER, u0 - 0.08, 114, 5)),
    p.W(wallPt(ER, u1 + 0.08, 114, 5)),
    p.W(wallPt(ER, u1 + 0.08, 126, 5)),
    p.W(wallPt(ER, u0 - 0.08, 126, 5)),
  ];
  p.cut(va, '#8A2E3A', { blur: 3, rough: 0.3 });
  for (let u = u0 - 0.07; u < u1 + 0.08; u += 0.03) {
    const q = p.W(wallPt(ER, u, 114, 5.5));
    p.flat(p.ell(q[0], q[1], 2, 3, 8), '#E4A844');
  }
  const bs = [p.W(wallPt(ER, 0.05, 0, 24)), p.W(wallPt(ER, 0.95, 0, 24)), p.W(wallPt(ER, 0.95, 14, 24)), p.W(wallPt(ER, 0.05, 14, 24))];
  p.cut(bs, '#6E3E17', { blur: 3 });
});
const SHADOW = (p, t) => {
  const [u0, u1, z0, z1] = SCREEN,
    sc = [p.W(wallPt(ER, u0, z0, 2)), p.W(wallPt(ER, u1, z0, 2)), p.W(wallPt(ER, u1, z1, 2)), p.W(wallPt(ER, u0, z1, 2))],
    s = p.s;
  p.clip(sc, () => {
    const u = 0.5 + Math.sin(t * 0.45) * 0.22,
      c = p.W(wallPt(ER, u, 60, 2.5)),
      fl = Math.sin(t * 6) * 0.5;
    p.flat(
      [
        [c[0] - 16 * s, c[1]],
        [c[0] - 2 * s, c[1] - (8 + fl * 6) * s],
        [c[0], c[1] - 2 * s],
        [c[0] + 3 * s, c[1] - (8 - fl * 6) * s],
        [c[0] + 16 * s, c[1]],
        [c[0], c[1] + 4 * s],
      ],
      'rgba(42,24,34,.85)',
    );
    const u2 = 0.5 - Math.sin(t * 0.3) * 0.18,
      b = p.W(wallPt(ER, u2, z0, 2.5)),
      w = Math.sin(t * 3) * 3;
    p.flat(
      [
        [b[0] - 6 * s, b[1]],
        [b[0] - 4 * s + w * s, b[1] - 18 * s],
        [b[0] - 7 * s, b[1] - 30 * s],
        [b[0], b[1] - 40 * s],
        [b[0] + 7 * s, b[1] - 30 * s],
        [b[0] + 4 * s - w * s, b[1] - 18 * s],
        [b[0] + 6 * s, b[1]],
      ],
      'rgba(42,24,34,.85)',
    );
    p.flat(p.ell(b[0], b[1] - 44 * s, 6, 6, 14), 'rgba(42,24,34,.85)');
  });
};

/* Tren nocturno */
const TRE = mkPal(
  'tre',
  '#6E2E2A',
  ['#6E2E2A', '#782F2C', '#662A26', '#7E3632', '#70302C'],
  ['#8A5A3A', '#946244', '#8E5E3E'],
  ['#7A4A2E', '#A87050'],
  '#3F5F4A',
  '#5A3A2A',
);
const trainWins = (p, e) => {
  const ws = [];
  for (const u of [0.25, 0.72]) {
    const W = [
      p.W(wallPt(e, u - 0.14, 50, 1)),
      p.W(wallPt(e, u + 0.14, 50, 1)),
      p.W(wallPt(e, u + 0.14, 104, 1)),
      p.W(wallPt(e, u - 0.14, 104, 1)),
    ];
    p.cut(W, '#C9A05C', { blur: 3, rough: 0.1 });
    const I = [
      p.W(wallPt(e, u - 0.12, 54, 1.5)),
      p.W(wallPt(e, u + 0.12, 54, 1.5)),
      p.W(wallPt(e, u + 0.12, 100, 1.5)),
      p.W(wallPt(e, u - 0.12, 100, 1.5)),
    ];
    p.flat(I, '#1A2440');
    ws.push(I);
  }
  return ws;
};
const TRE_W = [];
const treBase = room(TRE, (p, R0) => {
  for (const e of [ET, ER]) {
    trainWins(p, e);
    p.line([p.W(wallPt(e, 0.05, 116, 14)), p.W(wallPt(e, 0.95, 116, 14))], '#C9A05C', 2);
    p.line([p.W(wallPt(e, 0.05, 112, 14)), p.W(wallPt(e, 0.95, 112, 14))], '#C9A05C', 1.2);
    for (const [u, w, col] of [
      [0.18, 0.12, '#8A3A2A'],
      [0.38, 0.08, '#3F5F4A'],
      [0.66, 0.14, '#C9772F'],
    ]) {
      const b = [p.W(wallPt(e, u, 117, 12)), p.W(wallPt(e, u + w, 117, 12)), p.W(wallPt(e, u + w, 128, 12)), p.W(wallPt(e, u, 128, 12))];
      p.cut(b, col, { blur: 2, rough: 0.2 });
    }
  }
});
function drawBench(x, y, f) {
  return (p) => {
    const s = p.s;
    box3P(p, x - 50, x + 50, y - 18, y + 18, 0, 24, '#5A3A2A', '#4A2E20', '#3F5F4A');
    const bk =
      f > 0
        ? [p.P(x - 50, y - 18, 24), p.P(x + 50, y - 18, 24), p.P(x + 50, y - 18, 62), p.P(x - 50, y - 18, 62)]
        : [p.P(x - 50, y + 18, 24), p.P(x + 50, y + 18, 24), p.P(x + 50, y + 18, 62), p.P(x - 50, y + 18, 62)];
    p.cut(bk, '#3F5F4A', { blur: 3, rough: 0.3 });
    p.line([bk[3], bk[2]], '#C9A05C', 1.4);
  };
}
function drawTrainTable(p) {
  const x = 120,
    y = 0,
    s = p.s;
  p.line([p.P(x, y, 0), p.P(x, y, 34)], '#5A3A2A', 3);
  box3P(p, x - 18, x + 18, y - 14, y + 14, 34, 38, '#8A5A3A', '#6E3E17', '#A87044');
  const l = p.P(x, y, 38);
  p.cut(
    [
      [l[0] - 5 * s, l[1]],
      [l[0] + 5 * s, l[1]],
      [l[0] + 3 * s, l[1] - 12 * s],
      [l[0] - 3 * s, l[1] - 12 * s],
    ],
    '#E4A844',
    { rough: 0.1 },
  );
  p.flat(p.ell(l[0], l[1] - 14 * s, 6, 3, 12), '#B8484A');
}
const PASS = [...Array(6)].map((_, k) => [k / 6, ((k * 37) % 100) / 100]);

/* Faro */
const FAR = mkPal(
  'far',
  '#E6DCCB',
  ['#DCD2C0', '#E8DECE', '#D2C8B6', '#EAE2D4', '#D8CEBC'],
  ['#F2EFE8', '#F7F4EE', '#F0ECE4'],
  ['#E2DCD0', '#FFFFFF'],
  '#B8484A',
  '#C9C0B0',
);
const seaWin = (p, e, u, z, r, R0) => {
  const w = circWin(p, e, u, z, r, 28);
  p.cut(circWin(p, e, u, z, r + 6, 28), '#3E5A6E', { blur: 3, rough: 0.2 });
  p.flat(w, '#223A5A');
  p.clip(w, () => {
    const h = p.W(wallPt(e, u, z - 6, -8));
    p.flat(
      [
        [h[0] - 60 * p.s, h[1]],
        [h[0] + 60 * p.s, h[1]],
        [h[0] + 60 * p.s, h[1] + 40 * p.s],
        [h[0] - 60 * p.s, h[1] + 40 * p.s],
      ],
      '#2E5A7A',
    );
    for (let k = 0; k < 4; k++)
      p.line(
        [
          [h[0] - 30 * p.s + k * 14 * p.s, h[1] + (4 + k * 5) * p.s],
          [h[0] - 20 * p.s + k * 14 * p.s, h[1] + (4 + k * 5) * p.s],
        ],
        '#8FC3D6',
        1.2,
        0.8,
      );
    for (let k = 0; k < 8; k++) {
      const q = p.W(wallPt(e, u + rd(R0, -0.1, 0.1), z + rd(R0, 2, r), -8));
      p.flat(p.ell(q[0], q[1], 0.8, 0.8, 6), '#FFF6D8', 0.8);
    }
  });
};
const farBase = room(FAR, (p, R0) => {
  for (const e of [EL, ET, ER]) {
    p.flat([p.W(wallPt(e, 0, 36, 1)), p.W(wallPt(e, 1, 36, 1)), p.W(wallPt(e, 1, 46, 1)), p.W(wallPt(e, 0, 46, 1))], '#B8484A', 0.9);
    seaWin(p, e, e === ET ? 0.26 : 0.5, 86, 24, R0);
    if (e === ET) seaWin(p, e, 0.74, 86, 24, R0);
  }
});
function drawLamp(p) {
  const s = p.s,
    x = 0,
    y = -110;
  cylinder(p, x, y, 0, 30, 26, '#C9A05C', '#B08A4A');
  cylinder(p, x, y, 26, 14, 20, '#8A6A3A', '#C9A05C');
  const c = p.P(x, y, 70);
  for (let k = 0; k < 5; k++) {
    const r = 20 - Math.abs(k - 2) * 3;
    p.cut(p.ell(c[0], c[1] - (k - 2) * 9 * s, r, 5, 20), 'rgba(220,240,250,.9)', { sh: 0, rough: 0.1 });
    p.line(p.ell(c[0], c[1] - (k - 2) * 9 * s, r, 5, 20), '#9AB8C8', 0.8);
  }
  p.flat(p.ell(c[0], c[1], 9, 9, 16), '#FFF0B0');
  const top = p.P(x, y, 100);
  p.cut(
    [
      [top[0] - 18 * s, top[1]],
      [top[0] + 18 * s, top[1]],
      [top[0], top[1] - 16 * s],
    ],
    '#B8484A',
    { rough: 0.2 },
  );
}

/* ─────────── 5 · LAS RAÍCES ─────────── */
const SOT = mkPal(
  'sot',
  '#8A6A48',
  ['#7E6040', '#8A6A48', '#745838', '#907050', '#806244'],
  ['#C9A060', '#D2AA68', '#CCA464'],
  ['#B89050', '#E2C080'],
  '#6E4A2A',
  '#8A6A3A',
);
const CANDLES = [];
const sotBase = room(SOT, (p, R0) => {
  for (const z of [30, 62, 94]) {
    shelf(p, ET, 0.08, 0.35, z, 16, '#8A5A34');
    shelf(p, ET, 0.65, 0.92, z, 16, '#8A5A34');
    for (let u = 0.12; u < 0.9; u += 0.055) {
      if (u > 0.33 && u < 0.67) continue;
      const h = rd(R0, 8, 18),
        w = wallPt(ET, u, z, 8),
        c = p.P(w[0], w[1], z);
      p.cut(
        [
          [c[0] - 2.6 * p.s, c[1]],
          [c[0] + 2.6 * p.s, c[1]],
          [c[0] + 2.6 * p.s, c[1] - h * p.s],
          [c[0] - 2.6 * p.s, c[1] - h * p.s],
        ],
        '#FBF4E3',
        { sh: 0, rough: 0.1 },
      );
      CANDLES.push([w[0], w[1], z + h]);
    }
  }
  for (const e of [EL, ER])
    for (let k = 0; k < 9; k++) {
      const u = rd(R0, 0.05, 0.95),
        L = rd(R0, 10, 26),
        a = p.W(wallPt(e, u - 0.01, HW, 1)),
        b = p.W(wallPt(e, u + 0.01, HW, 1)),
        tp = p.W(wallPt(e, u, HW - L, 1));
      p.cut([a, b, [tp[0] + 1.4 * p.s, tp[1]], [tp[0] - 1.4 * p.s, tp[1]]], '#F3E0B0', { sh: 0, rough: 0.1 });
    }
});
function drawWaxVat(p) {
  const s = p.s,
    x = -110,
    y = -30;
  cylinder(p, x, y, 0, 34, 30, '#6E4A2A', '#F3E0B0', { r1: 36 });
  p.flat(p.ring(x, y, 30, 30, 30), '#F6E6BC');
  const b = p.P(x, y, 0);
  p.flat(p.ell(b[0], b[1], 30, 10), 'rgba(245,120,40,.3)');
}
function drawPillars(p) {
  const s = p.s,
    R0 = rng('pilares');
  for (const [x, y, h] of [
    [150, 110, 34],
    [170, 90, 22],
    [128, 96, 26],
    [180, 124, 16],
  ]) {
    cylinder(p, x, y, 0, 8, h, '#FBF4E3', '#F3E0B0');
    const q = p.P(x, y, h);
    p.line([q, [q[0], q[1] - 4 * s]], C.ink, 1);
  }
}

/* Cueva de cristales */
const CUE = mkPal(
  'cue',
  '#4A4260',
  ['#4E4666', '#443C5C', '#56506E', '#40385A', '#4A4264'],
  ['#5A5078', '#625880', '#5C527A'],
  ['#4A4068', '#7A70A0'],
  '#3A3252',
  '#2E2844',
);
const crystal = (p, x, y, z, h, w, col, s, a = 0) => {
  const b = p.P(x, y, z);
  const pts = [
    [b[0] - w * s, b[1]],
    [b[0] - w * 0.8 * s + a * h * 0.2 * s, b[1] - h * 0.8 * s],
    [b[0] + a * h * 0.3 * s, b[1] - h * s],
    [b[0] + w * 0.8 * s + a * h * 0.2 * s, b[1] - h * 0.8 * s],
    [b[0] + w * s, b[1]],
  ];
  p.cut(pts, col, { rough: 0.1, dy: 1.5 });
  p.flat([pts[0], pts[1], pts[2], [b[0], b[1]]], 'rgba(255,255,255,.22)');
};
const cueBase = room(CUE, (p, R0) => {
  for (const e of [EL, ER, ET]) {
    for (let k = 0; k < 10; k++) {
      const q = p.W(wallPt(e, rd(R0, 0.05, 0.95), rd(R0, 10, 120), 1));
      p.flat(p.ell(q[0], q[1], rd(R0, 8, 18), rd(R0, 5, 12), 14, rd(R0, 0, 3)), pick(R0, ['#4A4068', '#6A608E', '#524878']), 0.5);
    }
  }
  for (const e of [EL, ER])
    for (let k = 0; k < 5; k++) {
      const u = rd(R0, 0.1, 0.9),
        z = rd(R0, 30, 100),
        w = wallPt(e, u, z, 3);
      crystal(p, w[0], w[1], z, rd(R0, 16, 30), rd(R0, 5, 8), pick(R0, ['#9A8CE0', '#7ACFE0', '#C8A0F0']), p.s, rd(R0, -0.4, 0.4));
    }
});
function drawBigCrystal(p) {
  const s = p.s,
    R0 = rng('drusa');
  for (const [dx, dy, h, w, col, a] of [
    [-10, 0, 70, 14, '#9A8CE0', -0.2],
    [14, 6, 54, 11, '#7ACFE0', 0.3],
    [-28, 10, 40, 9, '#C8A0F0', -0.5],
    [30, -6, 32, 8, '#9A8CE0', 0.4],
    [2, 14, 28, 8, '#7ACFE0', 0],
  ])
    crystal(p, -120 + dx, -60 + dy, 0, h, w, col, s, a);
  glowA(p, -120, -60, 30, 60, 40, 'rgba(150,140,240,.12)', 1);
}
const SPARK = [...Array(10)].map((_, k) => [(k * 61) % 100, (k * 37) % 100, (k * 13) % 7]);

/* Volcán */
const VOL = mkPal(
  'vol',
  '#3A3032',
  ['#3E3436', '#342A2C', '#463A3C', '#3A2E30', '#40363A'],
  ['#4A3A3A', '#523E3C', '#4C3C3A'],
  ['#3A2C2C', '#6A4A44'],
  '#2A2020',
  '#2A2020',
);
const volBase = room(VOL, (p, R0) => {
  for (const e of [EL, ET, ER])
    for (let k = 0; k < 5; k++) {
      const pts = [];
      let u = rd(R0, 0.05, 0.95),
        z = rd(R0, 20, 120);
      for (let j = 0; j < 5; j++) {
        pts.push(p.W(wallPt(e, u, z, 1)));
        u += rd(R0, -0.04, 0.04);
        z -= rd(R0, 6, 14);
      }
      p.line(pts, '#F08A3A', 1.6, 0.8);
    }
  const fall = [p.W(wallPt(ET, 0.62, HW, 2)), p.W(wallPt(ET, 0.72, HW, 2)), p.W(wallPt(ET, 0.74, 0, 2)), p.W(wallPt(ET, 0.6, 0, 2))];
  p.cut(fall, '#F08A3A', { blur: 6, rough: 0.8, shc: 'rgba(255,120,40,.6)' });
  p.flat(
    fall.map((q, i) => [q[0] + (i < 2 ? 2 : -2) * p.s, q[1]]),
    '#FFC24A',
    0.5,
  );
  const pool = p.ell(...p.P(120, -170, 0), 62, 20, 26);
  p.cut(pool, '#F08A3A', { blur: 10, rough: 0.6, shc: 'rgba(255,120,40,.5)' });
  p.flat(p.ell(...p.P(120, -170, 0), 40, 12, 22), '#FFC24A', 0.7);
});
function drawAnvil(p) {
  const s = p.s,
    x = -100,
    y = 40;
  box3P(p, x - 12, x + 12, y - 10, y + 10, 0, 24, '#3A3A44', '#2A2A34', '#4A4A56');
  const t = [
    p.P(x - 30, y - 12, 24),
    p.P(x + 26, y - 12, 24),
    p.P(x + 34, y - 12, 32),
    p.P(x + 26, y - 12, 36),
    p.P(x - 26, y - 12, 36),
    p.P(x - 30, y - 12, 30),
  ];
  p.cut(t, '#4A4A56', { blur: 3, rough: 0.1 });
  p.flat([p.P(x - 26, y - 12, 36), p.P(x + 26, y - 12, 36), p.P(x + 26, y + 12, 36), p.P(x - 26, y + 12, 36)], '#5A5A66');
  const bar = p.P(x + 4, y, 37);
  p.cut(
    [
      [bar[0] - 10 * s, bar[1] - 2 * s],
      [bar[0] + 10 * s, bar[1] - 2 * s],
      [bar[0] + 10 * s, bar[1] + 1 * s],
      [bar[0] - 10 * s, bar[1] + 1 * s],
    ],
    '#F08A3A',
    { sh: 0, rough: 0 },
  );
}
const EMB = [...Array(14)].map((_, k) => [((k * 43) % 100) / 100, ((k * 67) % 100) / 100, 0.08 + (k % 5) * 0.03]);

/* Cumbre */
const CUM = mkPal(
  'cum',
  '#E4EAEE',
  ['#E8EEF2', '#DDE6EC', '#F2F6F8', '#D2DCE4', '#E4EAEE'],
  ['#BFD6E8', '#C8DDEE', '#BCD3E6'],
  ['#A8C4DC', '#E0EEF8'],
  '#8A9AAA',
  '#9AAABA',
  (p, R0) => {
    for (let k = 0; k < 6; k++) {
      const q = p.P(rd(R0, -R * 0.8, R * 0.8), rd(R0, -R * 0.5, R * 0.8), 0);
      p.cut(p.ell(q[0], q[1], rd(R0, 14, 26), rd(R0, 6, 10), 14), '#9AA4AE', { blur: 2, rough: 0.8 });
    }
  },
);
const cumBase = room(CUM, (p, R0) => {
  for (const e of [EL, ET, ER]) {
    const pts = [p.W(wallPt(e, 0, 10, 1))];
    for (let k = 0; k <= 8; k++) {
      const u = k / 8;
      pts.push(p.W(wallPt(e, u, k % 2 ? rd(R0, 50, 86) : rd(R0, 24, 40), 1)));
    }
    pts.push(p.W(wallPt(e, 1, 10, 1)));
    p.flat(pts, '#8FA6BC');
    for (let k = 1; k < 8; k += 2) {
      const u = k / 8,
        tp = pts[k + 1];
      p.flat([[tp[0] - 8 * p.s, tp[1] + 10 * p.s], tp, [tp[0] + 8 * p.s, tp[1] + 10 * p.s]], '#F4F8FA');
    }
    for (let k = 0; k < 2; k++) {
      const q = p.W(wallPt(e, rd(R0, 0.15, 0.85), rd(R0, 96, 118), 1));
      p.flat(p.ell(q[0], q[1], 24, 7, 16), '#F4F8FA', 0.9);
      p.flat(p.ell(q[0] + 10 * p.s, q[1] - 4 * p.s, 14, 6, 14), '#FFFFFF', 0.9);
    }
  }
  const su = p.W(wallPt(ET, 0.78, 108, 1));
  p.flat(p.ell(su[0], su[1], 14, 14, 20), '#FFE9A8');
});
function drawFlags(p) {
  const s = p.s,
    a = p.P(-200, -60, 0),
    b = p.P(80, -200, 0);
  for (const q of [a, b]) p.line([q, [q[0], q[1] - 70 * s]], '#6A4A30', 2.2);
  const A = [a[0], a[1] - 68 * s],
    B = [b[0], b[1] - 68 * s],
    cols = ['#B8484A', '#E4A844', '#3E8FA0', '#F2EADB', '#6F8D5E'];
  for (let k = 0; k < 11; k++) {
    const u = k / 11,
      x = lerp(A[0], B[0], u),
      y = lerp(A[1], B[1], u) + Math.sin(u * Math.PI) * 16 * s;
    p.cut(
      [
        [x, y],
        [x + 10 * s, y + 1 * s],
        [x + 6 * s, y + 12 * s],
        [x - 2 * s, y + 10 * s],
      ],
      cols[k % 5],
      { sh: 0, rough: 0.1 },
    );
  }
  p.line([A, [lerp(A[0], B[0], 0.5), lerp(A[1], B[1], 0.5) + 16 * s], B], '#6A4A30', 0.8);
}
function drawTent(p) {
  const s = p.s,
    x = -150,
    y = 60;
  const a = p.P(x - 44, y + 26, 0),
    b = p.P(x + 40, y + 26, 0),
    c = p.P(x - 10, y - 10, 56),
    d = p.P(x + 70, y - 30, 0);
  p.cut([a, b, c], '#E07A4E', { blur: 4, rough: 0.3 });
  p.cut([b, d, [c[0] + 26 * s, c[1] - 8 * s], c], '#C9563A', { rough: 0.3 });
  p.flat(
    [
      [lerp(a[0], b[0], 0.4), a[1]],
      [lerp(a[0], b[0], 0.6), b[1]],
      [c[0], c[1] + 30 * s],
    ],
    '#6E2A1E',
  );
}
const MIST = [...Array(5)].map((_, k) => [k / 5, ((k * 37) % 100) / 100]);

/* ─────────── 6 · LA MEMORIA ─────────── */
const DSV = mkPal(
  'dsv',
  '#B8946A',
  ['#B8946A', '#AE8A60', '#C29E74', '#A88458', '#BC986E'],
  ['#D9C49C', '#E0CCA6', '#D6C098'],
  ['#C8B088', '#EEDCB8'],
  '#8A6A4A',
  '#8A6A4A',
);
const dsvBase = room(DSV, (p, R0) => {
  for (const e of [EL, ET, ER]) {
    for (let u = 0.12; u < 1; u += 0.3)
      p.cut(
        [
          p.W(wallPt(e, u - 0.02, HW, 1)),
          p.W(wallPt(e, u + 0.02, HW, 1)),
          p.W(wallPt(e, u + 0.07, HW - 40, 1)),
          p.W(wallPt(e, u + 0.03, HW - 40, 1)),
        ],
        '#8A6A4A',
        { blur: 2, rough: 0.2 },
      );
  }
  const w = circWin(p, ER, 0.5, 84, 24, 28);
  p.cut(circWin(p, ER, 0.5, 84, 30, 28), '#8A6A4A', { blur: 3, rough: 0.2 });
  p.flat(w, '#2A3656');
  p.clip(w, () => {
    const m = p.W(wallPt(ER, 0.53, 92, -8));
    p.flat(p.ell(m[0], m[1], 8, 8, 16), '#F6EBD0');
    for (let k = 0; k < 8; k++) {
      const q = p.W(wallPt(ER, 0.5 + rd(R0, -0.08, 0.08), rd(R0, 64, 106), -8));
      p.flat(p.ell(q[0], q[1], 0.8, 0.8, 6), '#FFF6D8', 0.8);
    }
  });
  p.line([p.W(wallPt(ER, 0.5, 60, 1)), p.W(wallPt(ER, 0.5, 108, 1))], '#8A6A4A', 2);
  p.line([p.W(wallPt(ER, 0.5 - 24 / 300, 84, 1)), p.W(wallPt(ER, 0.5 + 24 / 300, 84, 1))], '#8A6A4A', 2);
});
function drawTrunks(p) {
  const s = p.s;
  for (const [x, y, z, w, col] of [
    [-150, -60, 0, 34, '#8A4A2A'],
    [-150, -60, 26, 28, '#3F5F4A'],
    [-95, -110, 0, 30, '#6E3E17'],
  ]) {
    box3P(p, x - w, x + w, y - 16, y + 16, z, z + 24, col, shade(col, 0.8), shade(col, 1.15));
    p.flat([p.P(x - w, y + 16, z + 12), p.P(x + w, y + 16, z + 12), p.P(x + w, y + 16, z + 15), p.P(x - w, y + 16, z + 15)], '#C9A05C');
    const lk = p.P(x, y + 16, z + 16);
    p.flat(p.ell(lk[0], lk[1], 2.4, 2.4, 8), '#E4A844');
  }
}
function drawSheet(p) {
  const s = p.s,
    x = 150,
    y = -40,
    R0 = rng('sabana');
  const pts = [
    p.P(x - 44, y + 22, 0),
    p.P(x + 44, y + 22, 0),
    p.P(x + 46, y + 10, 30),
    p.P(x + 34, y - 6, 56),
    p.P(x + 10, y - 10, 62),
    p.P(x - 20, y - 8, 58),
    p.P(x - 40, y + 4, 40),
  ];
  p.cut(pts, '#F4F0E6', { blur: 5, rough: 1.2 });
  for (let k = 0; k < 4; k++) {
    const a = p.P(x - 30 + k * 20, y + 22, 2),
      b = p.P(x - 24 + k * 16, y, 50);
    p.line([a, b], '#DCD4C4', 1.2, 0.8);
  }
}
const DUST = [...Array(12)].map((_, k) => [((k * 31) % 100) / 100, ((k * 57) % 100) / 100, 0.015 + (k % 4) * 0.008]);

/* Estudio de Amaranta */
const EST = mkPal(
  'est',
  '#A8744A',
  ['#A8744A', '#B07C50', '#9E6C44', '#B68256', '#A47048'],
  ['#E8C888', '#EECF92', '#E6C584'],
  ['#D8B070', '#F8E0A8'],
  '#8C4B1F',
  '#A06A3A',
  (p, R0) => {
    const c = p.P(-20, 40, 0);
    for (const [r, col] of [
      [110, '#8C4B1F'],
      [96, '#B8653A'],
      [78, '#D69646'],
      [50, '#B8653A'],
    ])
      p.cut(p.ring(-20, 40, 0, r, r * 0.62, 32), col, { blur: 2, rough: 0.6 });
  },
);
const estBase = room(EST, (p, R0) => {
  const map = [p.W(wallPt(EL, 0.3, 54, 1)), p.W(wallPt(EL, 0.7, 54, 1)), p.W(wallPt(EL, 0.7, 118, 1)), p.W(wallPt(EL, 0.3, 118, 1))];
  p.cut(map, '#F3E6C4', { blur: 3, rough: 0.4 });
  for (const id of ORDER) {
    const [q, r] = POS[id],
      u = 0.5 + q * 0.026,
      z = 86 - (r + q / 2) * 6.4,
      H = [];
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      H.push(p.W(wallPt(EL, u + (Math.cos(a) * 3.3) / 300, z + Math.sin(a) * 3.3, 1.5)));
    }
    p.flat(H, id === 'cor' ? C.terra : SEASON[id].seal, 0.85);
  }
  for (const [u, z, col] of [
    [0.22, 96, C.petal],
    [0.78, 70, C.butter],
    [0.8, 100, '#CFE3B8'],
  ]) {
    const n = [
      p.W(wallPt(ET, u - 0.04, z - 8, 1)),
      p.W(wallPt(ET, u + 0.04, z - 8, 1)),
      p.W(wallPt(ET, u + 0.04, z + 8, 1)),
      p.W(wallPt(ET, u - 0.04, z + 8, 1)),
    ];
    p.cut(n, col, { sh: 0, rough: 0.2 });
  }
  for (const z of [44, 80]) {
    shelf(p, ER, 0.12, 0.88, z, 16, '#8A5A34');
    for (let u = 0.18; u < 0.86; u += 0.1) {
      const w = wallPt(ER, u, z, 8),
        c = p.P(w[0], w[1], z);
      p.cut(
        [
          [c[0] - 5 * p.s, c[1]],
          [c[0] + 5 * p.s, c[1]],
          [c[0] + 5 * p.s, c[1] - 12 * p.s],
          [c[0] - 5 * p.s, c[1] - 12 * p.s],
        ],
        pick(R0, ['rgba(228,168,68,.9)', 'rgba(124,192,207,.8)', 'rgba(245,206,85,.9)']),
        { rough: 0.1 },
      );
      p.flat(
        [
          [c[0] - 3 * p.s, c[1] - 5 * p.s],
          [c[0] + 3 * p.s, c[1] - 5 * p.s],
          [c[0] + 3 * p.s, c[1] - 9 * p.s],
          [c[0] - 3 * p.s, c[1] - 9 * p.s],
        ],
        C.cream,
      );
    }
  }
  const hk = p.W(wallPt(ER, 0.5, 112, 2));
  p.cut(p.ell(hk[0], hk[1] + 4 * p.s, 18, 5, 20), '#F4EFE2', { rough: 0.3 });
  p.cut(
    [
      [hk[0] - 8 * p.s, hk[1] + 4 * p.s],
      [hk[0] + 8 * p.s, hk[1] + 4 * p.s],
      [hk[0] + 6 * p.s, hk[1] - 6 * p.s],
      [hk[0] - 6 * p.s, hk[1] - 6 * p.s],
    ],
    '#FBF8F0',
    { rough: 0.2 },
  );
});
function drawDesk(p) {
  const s = p.s,
    x = -110,
    y = -185;
  for (const [dx, dy] of [
    [-50, -18],
    [50, -18],
    [-50, 18],
    [50, 18],
  ])
    p.line([p.P(x + dx, y + dy, 0), p.P(x + dx, y + dy, 36)], '#6E3E17', 3.4);
  box3P(p, x - 56, x + 56, y - 22, y + 22, 36, 42, '#8A5A34', '#6E3E17', '#B07C50');
  p.cut([p.P(x - 20, y - 6, 43), p.P(x, y - 8, 44), p.P(x, y + 12, 44), p.P(x - 20, y + 14, 43)], C.cream, { sh: 0, rough: 0.2 });
  p.cut([p.P(x, y - 8, 44), p.P(x + 20, y - 6, 43), p.P(x + 20, y + 14, 43), p.P(x, y + 12, 44)], '#F6EFDC', { sh: 0, rough: 0.2 });
  for (let k = 0; k < 4; k++) p.line([p.P(x + 3, y - 4 + k * 4, 44), p.P(x + 17, y - 3 + k * 4, 43.5)], '#8A6A4A', 0.8, 0.7);
  const c = p.P(x + 40, y, 42);
  p.cut(
    [
      [c[0] - 3 * s, c[1]],
      [c[0] + 3 * s, c[1]],
      [c[0] + 3 * s, c[1] - 14 * s],
      [c[0] - 3 * s, c[1] - 14 * s],
    ],
    '#FBF4E3',
    { sh: 0, rough: 0 },
  );
  const q = p.P(x - 38, y, 43);
  p.cut(
    [
      [q[0] - 6 * s, q[1]],
      [q[0] + 6 * s, q[1]],
      [q[0] + 6 * s, q[1] - 14 * s],
      [q[0] - 6 * s, q[1] - 14 * s],
    ],
    'rgba(228,168,68,.95)',
    { rough: 0.1 },
  );
}

/* Sala de retratos */
const RET = mkPal(
  'ret',
  '#7E4E5E',
  ['#7E4E5E', '#885868', '#744656', '#906070', '#825262'],
  ['#8A3A4A', '#924250', '#8C3E4C'],
  ['#7A3240', '#A85060'],
  '#4A2A30',
  '#5A2A34',
);
const portrait = (p, e, u, z, w, h, R0, hat) => {
  const F = [
    p.W(wallPt(e, u - w, z - h, 1)),
    p.W(wallPt(e, u + w, z - h, 1)),
    p.W(wallPt(e, u + w, z + h, 1)),
    p.W(wallPt(e, u - w, z + h, 1)),
  ];
  p.cut(F, '#C9A05C', { blur: 4, rough: 0.2 });
  const I = [
    p.W(wallPt(e, u - w * 0.82, z - h * 0.84, 1.5)),
    p.W(wallPt(e, u + w * 0.82, z - h * 0.84, 1.5)),
    p.W(wallPt(e, u + w * 0.82, z + h * 0.84, 1.5)),
    p.W(wallPt(e, u - w * 0.82, z + h * 0.84, 1.5)),
  ];
  p.flat(I, pick(R0, ['#3A4A5A', '#4A3A30', '#2E3A2E', '#5A4A3A']));
  const s = p.s,
    c = p.W(wallPt(e, u, z + h * 0.15, 2));
  p.flat(
    [
      [c[0] - 10 * s, c[1] + h * 0.8 * s],
      [c[0] + 10 * s, c[1] + h * 0.8 * s],
      [c[0] + 8 * s, c[1] + 8 * s],
      [c[0] - 8 * s, c[1] + 8 * s],
    ],
    pick(R0, ['#C47A2C', '#6F8D5E', '#8A5A3A', '#4A548E']),
  );
  p.flat(p.ell(c[0], c[1], 6.4, 7, 14), pick(R0, ['#E7B994', '#C98A64', '#8D5A3B']));
  if (hat) {
    p.flat(p.ell(c[0], c[1] - 6 * s, 13, 3.4, 16), '#E9C46A');
    p.flat(
      [
        [c[0] - 6 * s, c[1] - 6 * s],
        [c[0] + 6 * s, c[1] - 6 * s],
        [c[0] + 5 * s, c[1] - 12 * s],
        [c[0] - 5 * s, c[1] - 12 * s],
      ],
      '#E9C46A',
    );
  }
};
const retBase = room(RET, (p, R0) => {
  for (const [e, us] of [
    [EL, [0.3, 0.7]],
    [ET, [0.25, 0.5, 0.75]],
    [ER, [0.3, 0.7]],
  ])
    us.forEach((u, i) => portrait(p, e, u, 76, 0.1, 26, R0, true));
  for (const e of [EL, ET, ER]) p.line([p.W(wallPt(e, 0, 40, 1)), p.W(wallPt(e, 1, 40, 1))], '#C9A05C', 1.4, 0.7);
});
function drawEasel(p) {
  const s = p.s,
    x = -40,
    y = -40;
  for (const dx of [-16, 16]) p.line([p.P(x + dx, y + 10, 0), p.P(x, y, 110)], '#8A5A34', 2.6);
  p.line([p.P(x, y - 14, 0), p.P(x, y, 100)], '#8A5A34', 2.2);
  const c = [p.P(x - 26, y + 6, 40), p.P(x + 26, y + 6, 40), p.P(x + 24, y + 2, 98), p.P(x - 24, y + 2, 98)];
  p.cut(c, '#F4EFE2', { blur: 4, rough: 0.2 });
  const m = p.P(x, y + 5, 72);
  p.flat(p.ell(m[0], m[1], 8, 9, 16), '#E7B994', 0.7);
  p.flat(p.ell(m[0], m[1] - 9 * s, 18, 4.6, 18), '#E9C46A', 0.8);
  p.line(
    [
      [m[0] - 10 * s, m[1] + 12 * s],
      [m[0] - 12 * s, m[1] + 26 * s],
    ],
    '#C47A2C',
    1.4,
    0.7,
  );
  p.line(
    [
      [m[0] + 10 * s, m[1] + 12 * s],
      [m[0] + 12 * s, m[1] + 26 * s],
    ],
    '#C47A2C',
    1.4,
    0.7,
  );
}
function drawBenchR(p) {
  const x = 120,
    y = -100;
  box3P(p, x - 50, x + 50, y - 14, y + 14, 0, 20, '#4A2A30', '#3A2024', '#8A3A4A');
}

/* Jardín de los nombres */
const JAR = mkPal(
  'jar',
  '#A8C48A',
  ['#A8C48A', '#9EBC80', '#B2CC94', '#96B478', '#AACA8E'],
  ['#6F8D5E', '#789666', '#728F60'],
  ['#5E7C50', '#8AA878'],
  '#5A4A3A',
  '#4E6B46',
  (p, R0) => {
    for (let k = 0; k < 10; k++) {
      const q = p.P(-40 + k * 22, 160 - k * 34, 0);
      p.cut(p.ell(q[0], q[1], 13, 6, 14, rd(R0, 0, 3)), '#D8D2C4', { blur: 2, rough: 0.5 });
    }
    for (const [x, y] of [
      [60, -60],
      [100, -20],
      [140, -70],
      [90, 40],
      [160, 10],
      [40, -120],
    ]) {
      const q = p.P(x, y, 0);
      p.cut(
        [
          [q[0] - 7 * p.s, q[1]],
          [q[0] + 7 * p.s, q[1]],
          [q[0] + 6 * p.s, q[1] - 12 * p.s],
          [q[0] - 6 * p.s, q[1] - 12 * p.s],
        ],
        '#B8B4AA',
        { blur: 2, rough: 0.4 },
      );
      p.line(
        [
          [q[0] - 3 * p.s, q[1] - 7 * p.s],
          [q[0] + 3 * p.s, q[1] - 7 * p.s],
        ],
        '#6A665E',
        1,
        0.8,
      );
      flowerDot(p, q[0] + 9 * p.s, q[1] - 1 * p.s, 2.6, pick(R0, [C.petal, C.butter, C.cream, '#D8A3C9']));
    }
  },
);
const jarBase = room(JAR, (p, R0) => {
  for (const e of [EL, ET, ER]) {
    for (let k = 0; k < 18; k++) {
      const q = p.W(wallPt(e, rd(R0, 0.02, 0.98), rd(R0, 20, 124), 2));
      p.cut(p.ell(q[0], q[1], rd(R0, 10, 18), rd(R0, 8, 14), 14), pick(R0, ['#5E7C50', '#6F8D5E', '#4E6B46']), { sh: 0, rough: 1 });
    }
    for (let k = 0; k < 8; k++) {
      const q = p.W(wallPt(e, rd(R0, 0.05, 0.95), rd(R0, 30, 120), 3));
      flowerDot(p, q[0], q[1], 2.6, pick(R0, [C.cream, C.petal, C.butter]));
    }
  }
});
function drawNameTree(p) {
  const R0 = rng('nombres'),
    x = -150,
    y = -100,
    s = p.s;
  const t0 = p.P(x, y, 0),
    t1 = p.P(x - 4, y, 120);
  p.cut(
    [
      [t0[0] - 12 * s, t0[1]],
      [t0[0] + 12 * s, t0[1]],
      [t1[0] + 6 * s, t1[1]],
      [t1[0] + 24 * s, t1[1] - 28 * s],
      [t1[0] + 14 * s, t1[1] - 30 * s],
      [t1[0] - 2 * s, t1[1] - 10 * s],
      [t1[0] - 20 * s, t1[1] - 26 * s],
      [t1[0] - 28 * s, t1[1] - 20 * s],
      [t1[0] - 6 * s, t1[1] + 4 * s],
    ],
    C.brown,
    { blur: 3 },
  );
  const c = p.P(x, y, 160);
  for (const [col, n, rr] of [
    ['#4E6B46', 8, 56],
    ['#6F8D5E', 9, 50],
    ['#8FB573', 6, 36],
  ])
    for (let k = 0; k < n; k++) {
      const a = rd(R0, 0, TAU),
        d = rd(R0, 0, rr);
      p.cut(p.ell(c[0] + Math.cos(a) * d * s * 1.1, c[1] + Math.sin(a) * d * s * 0.75, rd(R0, 22, 34), rd(R0, 17, 24), 22), col, {
        blur: 4,
        rough: 1.6,
      });
    }
  for (let k = 0; k < 18; k++) {
    const a = rd(R0, 0, TAU),
      d = rd(R0, 0, 60);
    flowerDot(p, c[0] + Math.cos(a) * d * s * 1.1, c[1] + Math.sin(a) * d * s * 0.7, 2.4, C.cream, '#F5CE55');
  }
  for (let k = 0; k < 5; k++) {
    const a = -1.2 + k * 0.6,
      q = [c[0] + Math.cos(a) * 50 * s, c[1] + 30 * s + Math.sin(a) * 14 * s];
    p.line([[q[0], q[1] - 14 * s], q], '#8A6A4A', 0.8);
    p.cut(
      [
        [q[0] - 5 * s, q[1]],
        [q[0] + 5 * s, q[1]],
        [q[0] + 5 * s, q[1] + 6 * s],
        [q[0] - 5 * s, q[1] + 6 * s],
      ],
      C.cream,
      { sh: 0, rough: 0.1 },
    );
  }
}
const PETALS2 = [...Array(8)].map((_, k) => {
  const R0 = rng('j' + k);
  return [rd(R0, -230, -60), rd(R0, -180, -60), R0(), rd(R0, 0.04, 0.07), rd(R0, 0, TAU)];
});

/* El Corazón */
const COR = mkPal(
  'cor',
  '#E8B84C',
  ['#E8B84C', '#F0C45C', '#E0AC40', '#F4CC68', '#E6B448'],
  ['#D89A3A', '#E0A442', '#DA9C3C'],
  ['#C88A2A', '#F8C860'],
  '#8C4B1F',
  '#A0602A',
  (p, R0) => {
    for (const [r, col] of [
      [150, '#D69B2E'],
      [118, '#E8B84C'],
      [86, '#F0C45C'],
    ])
      p.cut(
        hexV(r, 0, -60).map((v) => p.P(v[0], v[1], 0)),
        col,
        { blur: 2, rough: 0.4 },
      );
  },
);
const corBase = room(COR, (p, R0) => {
  for (const e of [EL, ER]) wallHexes(p, e, 0.05, 0.95, 14, 124, 11, ['#E4A844', '#F0C060', '#F6D27A', '#D69B2E', '#FBE4A0'], R0);
});
function heartPts(cx, cy, r, s) {
  const o = [];
  for (let k = 0; k < 40; k++) {
    const t = (k / 40) * TAU,
      x = 16 * Math.pow(Math.sin(t), 3),
      y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    o.push([cx + ((x * r) / 16) * s, cy - ((y * r) / 16) * s]);
  }
  return o;
}
function drawHeart(p) {
  const s = p.s,
    x = 0,
    y = -60;
  cylinder(p, x, y, 0, 40, 24, '#C9772F', '#E4A844');
  const c = p.P(x, y, 86);
  p.cut(heartPts(c[0], c[1], 42, s), '#E4A844', { blur: 8, rough: 0.3, shc: 'rgba(255,190,90,.6)' });
  p.clip(heartPts(c[0], c[1], 42, s), () => {
    for (let r = -6; r <= 6; r++)
      for (let q = -6; q <= 6; q++) {
        const hx = c[0] + q * 11 * s + (r % 2) * 5.5 * s,
          hy = c[1] + r * 9.5 * s;
        const H = hexV(5, 0, 0).map((v) => [hx + v[0] * s, hy + v[1] * s]);
        p.flat(H, (q + r) % 3 ? '#F6C860' : '#F0B040');
      }
  });
  p.line([...heartPts(c[0], c[1], 42, s), heartPts(c[0], c[1], 42, s)[0]], '#C9772F', 2);
}
function drawThrone(p) {
  const s = p.s,
    x = -120,
    y = 30;
  box3P(p, x - 30, x + 30, y - 26, y + 26, 0, 30, '#C9772F', '#A0602A', '#E4A844');
  const bk = [p.P(x - 30, y - 26, 30), p.P(x + 30, y - 26, 30), p.P(x + 26, y - 26, 96), p.P(x, y - 26, 108), p.P(x - 26, y - 26, 96)];
  p.cut(bk, '#D69B2E', { blur: 4, rough: 0.3 });
  p.clip(bk, () => {
    for (let z = 36; z < 104; z += 12)
      for (let dx = -24; dx <= 24; dx += 12) {
        const q = p.P(x + dx + ((z / 12) % 2) * 6, y - 26, z);
        p.flat(
          hexV(4.5, 0, 0).map((v) => [q[0] + v[0] * s, q[1] + v[1] * s]),
          '#F0C060',
        );
      }
  });
}

/* ─────────── las 17 celdas en el juego ─────────── */
const RN = (id, x, y, o = {}) =>
  Object.assign(
    {
      name: o.name,
      x,
      y,
      f: o.f ?? 1,
      lz: o.lz ?? 88,
      tx: o.tx ?? 45,
      ty: o.ty ?? 40,
      draw: humanDraw(id),
      idle: o.idle || 'smile',
      pbg: o.pbg,
      pf: o.pf || hpf(id),
      ex: ['open', 'smile', 'happy'],
    },
    o.extra || {},
  );
Object.assign(STYLE.cells, {
  col: {
    sub: 'El colmenar',
    base: colBase,
    props: HIVES.map(([x, y, l], i) => ({
      id: 'col' + i,
      y,
      bb: [x - 46, (y - 22) * K - (6 + l * 20) - 34, x + 46, (y + 22) * K + 16],
      draw: (p) => drawHive(p, x, y, l),
    })),
    solids: HIVES.map(([x, y]) => [x, y, 32]).concat([[40, 20, 26]]),
    npc: RN('col', 40, 20, { name: 'Abril', pbg: ['#FBE7B4', '#EFC46A'] }),
    over(p, T, st) {
      if (st) return;
      const s = p.s;
      for (const [h, o, spd, ph] of BEES) {
        const [x, y, l] = HIVES[h],
          a = T * spd * 2 + o * TAU,
          q = p.P(x + Math.cos(a) * (30 + o * 20), y + Math.sin(a) * (20 + o * 10), 30 + l * 20 + Math.sin(T * 3 + ph) * 10);
        p.flat(p.ell(q[0], q[1], 2.4, 1.8, 8), '#3A2A20');
        p.flat(p.ell(q[0] - 1 * s, q[1], 1.4, 1.8, 8), '#F5CE55');
        p.flat(p.ell(q[0], q[1] - 2 * s, 2, 1.2, 8, Math.sin(T * 40)), '#FFFFFF', 0.7);
      }
    },
  },
  bib: {
    sub: 'La biblioteca',
    base: bibBase,
    props: [
      { id: 'mesa', y: -40, bb: [-175, -115, -65, -5], draw: drawReadingTable },
      { id: 'globo', y: 60, bb: [145, -40, 195, 45], draw: drawGlobe },
      { id: 'escalera', y: -80, bb: [200, -190, 255, -30], draw: drawLadder },
    ],
    solids: [
      [-120, -40, 50],
      [170, 60, 20],
      [228, -80, 24],
    ],
    npc: RN('bib', 60, 30, { name: 'Tomo', lz: 100, pbg: ['#C9D6A6', '#6F8D5E'] }),
    over(p, T, st) {
      const l = p.P(-90, -50, 50);
      glowA(p, -90, -50, 50, 70, 40, 'rgba(255,220,140,.10)', 1);
      if (st) return;
      const s = p.s;
      for (const [a, b, sp] of MOTES) {
        const u = (T * sp + b) % 1,
          q = [l[0] + (a - 0.5) * 110 * s + Math.sin(T + a * 9) * 4 * s, l[1] - u * 90 * s];
        p.flat(p.ell(q[0], q[1], 1, 1, 6), '#FFF4C8', 0.6 * Math.sin(u * Math.PI));
      }
    },
  },
  coc: {
    sub: 'La cocina de miel',
    base: cocBase,
    props: [
      { id: 'olla', y: -95, bb: [100, -136, 200, -36], draw: drawPot },
      { id: 'mesa', y: 60, bb: [-100, -46, 20, 70], draw: drawKTable },
    ],
    solids: [
      [150, -95, 40],
      [-40, 60, 54],
    ],
    npc: RN('coc', 70, -40, { name: 'Miel', lz: 100, pbg: ['#FBE1C8', '#E8A070'] }),
    under(p, T, st) {
      const s = p.s,
        fl = st ? 0 : T;
      for (let k = 0; k < 3; k++) {
        const u = 0.47 + k * 0.03,
          h = 10 + 5 * Math.sin(fl * 8 + k * 2),
          b = p.W(wallPt(ET, u, 4, 6)),
          tp = p.W(wallPt(ET, u, 4 + h, 6));
        p.flat(
          [
            [b[0] - 5 * s, b[1]],
            [tp[0], tp[1]],
            [b[0] + 5 * s, b[1]],
          ],
          '#F08A3A',
        );
      }
    },
    over(p, T, st) {
      if (st) return;
      const s = p.s,
        m = p.P(150, -95, 40);
      for (let k = 0; k < 3; k++) {
        const o = (T * 0.4 + k / 3) % 1,
          pts = [];
        for (let j = 0; j <= 8; j++)
          pts.push([m[0] + Math.sin(j * 0.8 + T * 2 + k * 2) * 3 * s + (k - 1) * 8 * s, m[1] - (j * 4 + o * 12) * s]);
        p.line(pts, 'rgba(255,255,255,.6)', 2.2, 0.5 * Math.sin(o * Math.PI) + 0.1);
      }
    },
  },
  rel: {
    sub: 'La relojería',
    base: relBase,
    props: [
      { id: 'reloj', y: -50, bb: [-215, -210, -155, 0], draw: drawGrandClock },
      { id: 'banco', y: -40, bb: [95, -110, 205, 0], draw: drawWorkbench },
    ],
    solids: [
      [-185, -50, 28],
      [150, -40, 52],
    ],
    npc: RN('rel', 60, 60, { name: 'Péndulo', pbg: ['#F2E4C4', '#C9A878'] }),
    over(p, T, st) {
      const s = p.s,
        top = p.P(-185, -38, 84),
        a = st ? 0 : Math.sin(T * 2.6) * 0.35;
      const bob = [top[0] + Math.sin(a) * 52 * s, top[1] + Math.cos(a) * 52 * s];
      p.line([top, bob], '#C9A05C', 1.4);
      p.cut(p.ell(bob[0], bob[1], 6, 6, 14), '#E4A844', { sh: 0, rough: 0 });
      const g = p.W(wallPt(ER, 0.29, 80, 2));
      p.line(
        [...gearPts(g[0], g[1], 22, 12, st ? 0 : T * 0.5, s)].concat([gearPts(g[0], g[1], 22, 12, st ? 0 : T * 0.5, s)[0]]),
        '#8A5A34',
        2.2,
      );
      p.flat(p.ell(g[0], g[1], 5, 5, 12), '#8A5A34');
      const g2 = p.W(wallPt(ER, 0.42, 58, 2));
      p.line(
        [...gearPts(g2[0], g2[1], 13, 8, st ? 0 : -T * 0.84, s)].concat([gearPts(g2[0], g2[1], 13, 8, st ? 0 : -T * 0.84, s)[0]]),
        '#C9A05C',
        1.8,
      );
    },
  },
  inn: {
    sub: 'El invernadero nocturno',
    base: innBase,
    props: [
      { id: 'lecho', y: -70, bb: [-198, -160, -62, -14], draw: drawMoonBed },
      { id: 'planta', y: -120, bb: [95, -240, 205, -48], draw: drawNightPlant },
    ],
    solids: [
      [-130, -70, 64],
      [150, -120, 30],
    ],
    npc: RN('inn', 40, 40, { name: 'Luna', pbg: ['#4A5A8A', '#243052'] }),
    over(p, T, st) {
      glowA(p, -130, -70, 50, 70, 30, 'rgba(180,200,255,.08)', 1);
      if (st) return;
      const s = p.s;
      for (const [a, b, c] of FIRE) {
        const x = lerp(-220, 220, a) + Math.sin(T * 0.6 + c * 9) * 20,
          y = lerp(-200, 180, b) + Math.cos(T * 0.5 + a * 7) * 16,
          z = 30 + Math.sin(T + c * 5) * 20,
          q = p.P(x, y, z),
          on = (Math.sin(T * 2.2 + c * 20) + 1) / 2;
        glowA(p, x, y, z, 8, 8, 'rgba(220,255,140,.5)', on * 0.6);
        p.flat(p.ell(q[0], q[1], 1.4, 1.4, 6), '#F4FFB0', on);
      }
    },
  },
  tea: {
    sub: 'El teatro de sombras',
    base: teaBase,
    props: [],
    solids: [[-40, 40, 24]],
    npc: RN('tea', -40, 40, { name: 'Telón', lz: 106, pbg: ['#F6D9A0', '#8A4A5A'] }),
    under(p, T, st) {
      SHADOW(p, st ? 0 : T);
    },
    over(p, T, st) {
      const c = p.W(wallPt(ER, 0.5, 70, 40));
      glowA(p, 120, -60, 0, 120, 50, 'rgba(255,210,140,.08)', 1);
    },
  },
  tre: {
    sub: 'El tren nocturno',
    base: treBase,
    props: [
      { id: 'b1', y: -50, bb: [20, -120, 190, -20], draw: drawBench(100, -60, 1) },
      { id: 'b2', y: 70, bb: [20, -10, 190, 100], draw: drawBench(100, 70, -1) },
      { id: 'mesita', y: 4, bb: [94, -62, 145, 20], draw: drawTrainTable },
    ],
    solids: [
      [100, -60, 56],
      [100, 70, 56],
      [120, 0, 20],
    ],
    npc: RN('tre', -80, 60, { name: 'Estela', pbg: ['#E9D2A8', '#3F5F4A'] }),
    under(p, T, st) {
      for (const e of [ET, ER])
        for (const u of [0.25, 0.72]) {
          const I = [
            p.W(wallPt(e, u - 0.12, 54, 1.5)),
            p.W(wallPt(e, u + 0.12, 54, 1.5)),
            p.W(wallPt(e, u + 0.12, 100, 1.5)),
            p.W(wallPt(e, u - 0.12, 100, 1.5)),
          ];
          p.clip(I, () => {
            const s = p.s;
            for (const [o, h] of PASS) {
              const f = ((st ? 0 : T * 0.18) + o) % 1,
                q = p.W(wallPt(e, u + 0.14 - f * 0.28, 62 + h * 30, 1));
              p.flat(p.ell(q[0], q[1], 1.6, 1.6, 8), '#FFE08A', 0.9);
              p.flat(
                [
                  [q[0] - 10 * s, q[1] + 14 * s],
                  [q[0], q[1] + 2 * s],
                  [q[0] + 10 * s, q[1] + 14 * s],
                ],
                '#0E1628',
              );
            }
          });
        }
    },
  },
  far: {
    sub: 'El faro',
    base: farBase,
    props: [{ id: 'lampara', y: -110, bb: [-45, -250, 45, -38], draw: drawLamp }],
    solids: [[0, -110, 40]],
    npc: RN('far', 90, 60, { name: 'Albor', pbg: ['#F7F4EE', '#9AB8C8'] }),
    over(p, T, st) {
      const s = p.s,
        c = p.P(0, -110, 70),
        a = st ? -0.6 : T * 0.6;
      p.g.save();
      p.g.globalCompositeOperation = 'lighter';
      p.flat(
        [
          c,
          [c[0] + Math.cos(a - 0.12) * 420 * s, c[1] + Math.sin(a - 0.12) * 240 * s],
          [c[0] + Math.cos(a + 0.12) * 420 * s, c[1] + Math.sin(a + 0.12) * 240 * s],
        ],
        'rgba(255,240,170,.13)',
      );
      p.flat(p.ell(c[0], c[1], 26, 26, 20), 'rgba(255,240,170,.22)');
      p.g.restore();
    },
  },
  sot: {
    sub: 'El sótano de cera',
    base: sotBase,
    props: [
      { id: 'tina', y: -30, bb: [-150, -80, -70, 10], draw: drawWaxVat },
      { id: 'velas', y: 110, bb: [112, 18, 196, 130], draw: drawPillars },
    ],
    solids: [
      [-110, -30, 40],
      [155, 108, 30],
    ],
    npc: RN('sot', 60, 20, { name: 'Vela', pbg: ['#F3E0B0', '#C9A060'] }),
    over(p, T, st) {
      for (const [x, y, z] of CANDLES) flameAt(p, x, y, z, st ? 0 : T, 0.8);
      for (const [x, y, h] of [
        [150, 110, 34],
        [170, 90, 22],
        [128, 96, 26],
        [180, 124, 16],
      ])
        flameAt(p, x, y, h + 3, st ? 0 : T);
      glowA(p, 0, -200, 70, 200, 60, 'rgba(255,180,80,.08)', 1);
    },
  },
  cue: {
    sub: 'La cueva de cristales',
    base: cueBase,
    props: [{ id: 'drusa', y: -60, bb: [-175, -180, -65, -18], draw: drawBigCrystal }],
    solids: [[-120, -60, 46]],
    npc: RN('cue', 60, 50, { name: 'Geoda', lz: 96, pbg: ['#C8C0E8', '#5A5078'] }),
    over(p, T, st) {
      if (st) return;
      const s = p.s;
      for (const [a, b, c] of SPARK) {
        const on = Math.max(0, Math.sin(T * 2 + c * 3));
        if (on < 0.7) continue;
        const q = p.P(-200 + a * 4, -180 + b * 3, 20 + c * 10),
          r = (on - 0.7) * 18;
        p.line(
          [
            [q[0] - r * s, q[1]],
            [q[0] + r * s, q[1]],
          ],
          '#FFFFFF',
          1.2,
        );
        p.line(
          [
            [q[0], q[1] - r * s],
            [q[0], q[1] + r * s],
          ],
          '#FFFFFF',
          1.2,
        );
      }
    },
  },
  vol: {
    sub: 'El volcán',
    base: volBase,
    props: [{ id: 'yunque', y: 40, bb: [-140, -28, -60, 60], draw: drawAnvil }],
    solids: [
      [-100, 40, 36],
      [120, -170, 70],
    ],
    npc: RN('vol', -30, 70, { name: 'Ceniza', lz: 104, pbg: ['#F0A060', '#6A4040'] }),
    over(p, T, st) {
      glowA(p, 120, -170, 0, 90, 30, 'rgba(255,120,40,.18)', 1);
      if (st) return;
      const s = p.s;
      for (const [a, b, sp] of EMB) {
        const u = (T * sp + b) % 1,
          q = p.P(lerp(-200, 200, a) + Math.sin(T + a * 9) * 14, lerp(-190, 120, b), u * 190);
        p.flat(p.ell(q[0], q[1], 1.6, 1.6, 6), '#FFB04A', 1 - u);
      }
    },
  },
  cum: {
    sub: 'La cumbre',
    base: cumBase,
    props: [
      { id: 'banderas', y: -130, bb: [-215, -235, 95, -28], draw: drawFlags },
      { id: 'tienda', y: 60, bb: [-202, -42, -74, 90], draw: drawTent },
    ],
    solids: [
      [-150, 60, 52],
      [-200, -60, 10],
      [80, -200, 10],
    ],
    npc: RN('cum', 70, 40, { name: 'Nube', pbg: ['#EEF4F8', '#8FA6BC'] }),
    over(p, T, st) {
      if (st) return;
      const s = p.s;
      for (const [o, h] of MIST) {
        const u = (T * 0.03 + o) % 1,
          q = p.P(lerp(-320, 320, u), lerp(-150, 180, h), 10);
        p.flat(p.ell(q[0], q[1], 50, 12, 18), '#FFFFFF', 0.25 * Math.sin(u * Math.PI));
      }
    },
  },
  dsv: {
    sub: 'El desván',
    base: dsvBase,
    props: [
      { id: 'baules', y: -60, bb: [-195, -140, -55, -20], draw: drawTrunks },
      { id: 'sabana', y: -40, bb: [95, -120, 205, -5], draw: drawSheet },
    ],
    solids: [
      [-150, -60, 40],
      [-95, -110, 34],
      [150, -40, 50],
    ],
    npc: RN('dsv', 40, 60, { name: 'Trasto', pbg: ['#EEDCB8', '#B8946A'] }),
    over(p, T, st) {
      const s = p.s,
        w = p.W(wallPt(ER, 0.5, 84, 1)),
        f = p.P(-20, 80, 0);
      p.g.save();
      p.g.globalCompositeOperation = 'lighter';
      p.flat(
        [
          [w[0] - 18 * s, w[1] - 14 * s],
          [w[0] + 10 * s, w[1] + 18 * s],
          [f[0] + 40 * s, f[1]],
          [f[0] - 60 * s, f[1] - 10 * s],
        ],
        'rgba(220,230,255,.07)',
      );
      p.g.restore();
      if (st) return;
      for (const [a, b, sp] of DUST) {
        const u = (T * sp + b) % 1,
          q = [lerp(w[0], f[0], a) + Math.sin(T + a * 9) * 6 * s, lerp(w[1], f[1], u)];
        p.flat(p.ell(q[0], q[1], 1, 1, 6), '#FFFFFF', 0.5 * Math.sin(u * Math.PI));
      }
    },
  },
  est: {
    sub: 'El estudio de Amaranta',
    base: estBase,
    props: [{ id: 'escritorio', y: -185, bb: [-174, -235, -46, -87], draw: drawDesk }],
    solids: [[-110, -185, 60]],
    npc: RN('est', 60, 40, { name: 'Pluma', pbg: ['#F8E4B4', '#A06A3A'] }),
    over(p, T, st) {
      flameAt(p, 20, -190, 56, st ? 0 : T);
      glowA(p, 20, -190, 60, 60, 40, 'rgba(255,190,90,.12)', 1);
    },
  },
  ret: {
    sub: 'La sala de retratos',
    base: retBase,
    props: [
      { id: 'caballete', y: -40, bb: [-75, -160, -5, -20], draw: drawEasel },
      { id: 'banco', y: -100, bb: [62, -130, 178, -40], draw: drawBenchR },
    ],
    solids: [
      [-40, -40, 28],
      [120, -100, 52],
    ],
    npc: RN('ret', 70, 60, { name: 'Marco', pbg: ['#F2D8C8', '#9A4A5A'] }),
    over(p, T, st) {
      glowA(p, -40, -40, 70, 60, 50, 'rgba(255,230,180,.10)', 1);
    },
  },
  jar: {
    sub: 'El jardín de los nombres',
    base: jarBase,
    props: [{ id: 'arbol', y: -100, bb: [-270, -330, -30, -40], draw: drawNameTree }],
    solids: [[-150, -100, 40]],
    npc: RN('jar', 50, 60, { name: 'Rocío', pbg: ['#E4F0D4', '#8FB573'] }),
    over(p, T, st) {
      if (st) return;
      for (const [x, y, o, spd, ph] of PETALS2) {
        const u = (T * spd + o) % 1,
          q = p.P(x + u * 120 + Math.sin(T * 1.2 + ph) * 14, y + u * 80, 170 * (1 - u));
        p.flat(p.ell(q[0], q[1], 3.2, 1.8, 10, T * 2 + ph), C.cream, u > 0.9 ? (1 - u) * 10 : 1);
      }
    },
  },
  cor: {
    sub: 'El corazón de la colmena',
    base: corBase,
    props: [
      { id: 'corazon', y: -60, bb: [-58, -172, 58, 4], draw: drawHeart },
      { id: 'trono', y: 30, bb: [-160, -114, -80, 60], draw: drawThrone },
    ],
    solids: [
      [0, -60, 50],
      [-120, 30, 40],
    ],
    npc: RN('cor', -116, 34, {
      name: 'Amaranta',
      idle: 'sleep',
      lz: 104,
      f: 1,
      extra: { turn: false, dy: 30 },
      pbg: ['#FFE8B0', '#E4A844'],
    }),
    over(p, T, st) {
      const s = p.s,
        c = p.P(0, -60, 86),
        u = st ? 0.5 : (T * 1.1) % 1,
        pulse = st ? 0 : Math.max(0, Math.sin((T * 2.2 * Math.PI) / 2)) * 0.12;
      p.g.save();
      p.g.globalCompositeOperation = 'lighter';
      p.flat(heartPts(c[0], c[1], 42 * (1 + pulse * 0.4), s), 'rgba(255,200,90,.18)');
      const r = 60 + u * 120;
      p.line(
        [...p.ell(c[0], c[1] + 10 * s, r, r * 0.5, 32), p.ell(c[0], c[1] + 10 * s, r, r * 0.5, 32)[0]],
        'rgba(255,210,120,.5)',
        2,
        0.5 * (1 - u),
      );
      p.g.restore();
      if (st) return;
      for (let k = 0; k < 3; k++) {
        const w = (T * 0.22 + k / 3) % 1,
          q = p.P(-100 + w * 20, 34, 120 + w * 50);
        p.text('z', q[0] + Math.sin(T * 2 + k) * 4 * s, q[1], 10 + w * 8, C.ink, { alpha: Math.sin(w * Math.PI) * 0.7 });
      }
    },
  },
});
/* sonido de fondo de cada celda nueva */
{
  const ob = STYLE.sound.beds;
  STYLE.sound.beds = (H) => {
    ob(H);
    const b = H.bus.bind(H),
      n = H.nz;
    {
      const g = H.bed(b('col'), n.pink, [['bandpass', 220, 6]], 0.14);
      H.lfo(3.3, 0.06, g.gain);
    }
    H.bed(b('bib'), n.brown, [['lowpass', 160]], 0.12);
    H.bed(b('coc'), n.brown, [['lowpass', 240]], 0.16);
    H.bed(b('rel'), n.brown, [['lowpass', 150]], 0.1);
    H.bed(
      b('inn'),
      n.pink,
      [
        ['highpass', 3000],
        ['lowpass', 7000],
      ],
      0.05,
    );
    H.bed(b('tea'), n.pink, [['bandpass', 500, 0.8]], 0.06);
    {
      const g = H.bed(b('tre'), n.brown, [['lowpass', 120]], 0.3);
      H.lfo(0.9, 0.08, g.gain);
    }
    H.lfo(0.08, 0.12, H.bed(b('far'), n.pink, [['lowpass', 700]], 0.2).gain);
    H.bed(b('sot'), n.brown, [['lowpass', 200]], 0.14);
    H.bed(b('cue'), n.brown, [['lowpass', 260]], 0.08);
    H.lfo(0.2, 0.1, H.bed(b('vol'), n.brown, [['lowpass', 140]], 0.3).gain);
    H.lfo(
      0.07,
      0.1,
      H.bed(
        b('cum'),
        n.white,
        [
          ['highpass', 1500],
          ['lowpass', 5000],
        ],
        0.08,
      ).gain,
    );
    H.bed(b('dsv'), n.brown, [['lowpass', 180]], 0.09);
    H.bed(b('est'), n.brown, [['lowpass', 200]], 0.08);
    H.bed(b('ret'), n.brown, [['lowpass', 160]], 0.08);
    H.lfo(0.06, 0.06, H.bed(b('jar'), n.pink, [['bandpass', 1800, 0.5]], 0.07).gain);
    H.bed(b('cor'), n.brown, [['lowpass', 120]], 0.12);
  };
}
{
  const ot = STYLE.sound.tick;
  STYLE.sound.tick = (H, id, t, nx) => {
    ot(H, id, t, nx);
    const b = H.bus(id),
      r = H.rnd;
    if (id === 'rel' && !(t < nx.tic)) {
      H.hit(b, H.nz.white, 'bandpass', 3200, 4, 0.06, 0.015, 0.001);
      nx.tic = t + 0.5;
    } else if (id === 'tre' && !(t < nx.clak)) {
      H.hit(b, H.nz.white, 'bandpass', 900, 3, 0.08, 0.04, 0.001);
      H.hit(b, H.nz.white, 'bandpass', 900, 3, 0.06, 0.04, 0.001, t + 0.14);
      nx.clak = t + 1.1;
    } else if (id === 'cor' && !(t < nx.beat)) {
      H.tone(b, 'sine', 70, 48, 0.2, 0.18);
      H.tone(b, 'sine', 66, 44, 0.14, 0.2, t + 0.24);
      nx.beat = t + 1.4;
    } else if (id === 'cue' && !(t < nx.drip)) {
      H.tone(b, 'sine', r(1800, 2600), r(900, 1300), 0.04, 0.12);
      nx.drip = t + r(1.5, 4);
    } else if (id === 'inn' && !(t < nx.cri)) {
      for (let k = 0; k < 3; k++) H.tone(b, 'sine', 4200, 4000, 0.012, 0.05, t + k * 0.07);
      nx.cri = t + r(0.8, 2);
    } else if (id === 'jar' && !(t < nx.bird)) {
      let s = t;
      const f = r(2600, 3800);
      for (let k = 0; k < 3; k++) {
        H.tone(b, 'sine', f * r(0.9, 1.1), f * r(1.2, 1.4), 0.04, 0.08, s);
        s += 0.12;
      }
      nx.bird = t + r(4, 9);
    }
  };
}
