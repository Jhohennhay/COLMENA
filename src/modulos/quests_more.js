/* ══════════ PUERTAS QUE GIRAN · el Teatro y el Desván giran sobre sí mismos ══════════
   Cada uno tiene un pasillo con dos aberturas. Al girarlo (un sexto de vuelta cada vez)
   cambian las puertas que quedan alineadas con sus vecinas. Se gira con el torno del centro
   o, desde la celda de al lado, con la palanca que hay junto a la puerta. */
const ROTORS = {
  tea: {
    open: [1, 3],
    torno: [70, -40],
    disc: '#8A3A4A',
    disc2: '#A84A58',
    line: '#F6D9A0',
    inside: 'Girar el escenario',
    outside: 'Girar el Teatro hacia aquí',
    name: 'el escenario del Teatro',
    msgIn: 'Esta puerta no mira a ningún sitio. Gira el escenario con el torno del centro.',
    msgOut: 'El Teatro mira hacia otro lado. Usa la palanca junto a la puerta.',
    narr: 'Telón pidió un escenario que girara. Desde entonces, el teatro decide adónde vas.',
  },
  dsv: {
    open: [5, 1],
    torno: [-30, -20],
    disc: '#8A6A4A',
    disc2: '#A8845C',
    line: '#FBF4E3',
    inside: 'Girar el desván',
    outside: 'Girar el Desván hacia aquí',
    name: 'el Desván',
    msgIn: 'Esta puerta no mira a ningún sitio. Gira el desván con el torno del centro.',
    msgOut: 'El Desván mira hacia otro lado. Usa la palanca junto a la puerta.',
    narr: 'El desván gira como una caja de música. Trasto le puso un torno para no perder la costumbre.',
  },
};
const ROT = {};
for (const id in ROTORS) ROT[id] = { t: 0, a: 0 };
function rotLoad() {
  const F = QF();
  for (const id in ROTORS) {
    const r = (F.rot && F.rot[id]) || 0;
    ROT[id].t = r;
    ROT[id].a = r;
  }
}
const rotR = (id) => ((Math.round(ROT[id].t) % 6) + 6) % 6;
const edgeTo = (a, b) => {
  const d = CELLS[a].doors.find((x) => x.to === b);
  return d ? d.e[0] : -1;
};
const facesAt = (rid, r, N) => {
  const e = edgeTo(rid, N);
  return ROTORS[rid].open.some((o) => (o + r) % 6 === e);
};
const faces = (rid, N) => facesAt(rid, rotR(rid), N);
const rotBusy = (id) => Math.abs(ROT[id].a - ROT[id].t) > 0.01;
const rotStuck = (a, b) => !!ROTORS[a] && (rotBusy(a) || !faces(a, b));
const rotBlocks = (a, b) => !FREE && (rotStuck(a, b) || rotStuck(b, a));
{
  const o0 = PUZ.open.bind(PUZ),
    w0 = PUZ.why.bind(PUZ);
  PUZ._open0 = o0;
  PUZ.open = (a, b) => o0(a, b) && !rotBlocks(a, b);
  PUZ.why = (a, b) => {
    if (o0(a, b) && rotBlocks(a, b)) {
      const rid = rotStuck(a, b) ? a : b;
      if (rotBusy(rid)) return 'Está girando…';
      PLOG.bump(rid);
      return rid === a ? ROTORS[rid].msgIn : ROTORS[rid].msgOut;
    }
    return w0(a, b);
  };
}
function rotStep(id, k = 1) {
  if (rotBusy(id)) return;
  const R = ROT[id];
  R.t += k;
  Sound.sfx('crank', 0.5 * k + 0.25);
  buzz(12);
  const F = QF();
  F.rot = F.rot || {};
  F.rot[id] = rotR(id);
  F.rotUsed = F.rotUsed || {};
  F.rotUsed[id] = 1;
  if (Object.keys(F.rotUsed).length >= 2) achieve('turn');
  save();
  for (const g in GRIDS) delete GRIDS[g];
  PLOG.ev('gira', id);
}
function rotFace(id, N) {
  if (rotBusy(id)) return;
  for (let k = 1; k < 6; k++)
    if (facesAt(id, (rotR(id) + k) % 6, N)) {
      rotStep(id, k);
      return;
    }
}
function rotTick(dt) {
  for (const id in ROTORS) {
    const R = ROT[id];
    if (!rotBusy(id)) continue;
    const v = dt / 0.5;
    R.a = Math.abs(R.t - R.a) <= v ? R.t : R.a + Math.sign(R.t - R.a) * v;
    if (!rotBusy(id)) {
      R.a = R.t = rotR(id);
      Sound.sfx('thunk');
      stateChanged();
      if (cur === id || CELLS[cur].doors.some((d) => d.to === id))
        note(
          Object.values(CELLS[id].doors).filter((d) => faces(id, d.to)).length
            ? 'Las puertas encajan.'
            : 'Ninguna puerta encaja. Sigue girando.',
        );
    }
  }
}
/* el torno del centro y las palancas de las celdas vecinas: son piezas de papel horneadas con el cuarto */
function drawTorno(p, x, y, rid) {
  const s = p.s,
    b = p.P(x, y, 0),
    tp = p.P(x, y, 40),
    SE = SEASON[rid];
  p.flat(p.ell(b[0], b[1], 16, 6), 'rgba(70,40,15,.25)');
  p.line([b, tp], '#8A5A34', 5, 1, { sh: 1 });
  const r = 17;
  p.cut(p.ell(tp[0], tp[1], r, r * 0.9, 26), C.honey, { rough: 0.4 });
  p.flat(p.ell(tp[0], tp[1], r * 0.7, r * 0.62, 22), '#B8783A');
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3 + 0.3;
    p.line([tp, [tp[0] + Math.cos(a) * r * 0.85 * s, tp[1] + Math.sin(a) * r * 0.78 * s]], C.honeyL, 2.2);
  }
  const hd = [tp[0] + r * s, tp[1] - 3 * s];
  p.cut(p.ell(hd[0], hd[1], 3.6, 3.6, 10), C.terra, { sh: 0, rough: 0 });
  p.cut(p.ell(tp[0], tp[1], 6, 5.4, 14), SE.seal, { sh: 0, rough: 0.2 });
  p.text(SE.icon, tp[0], tp[1] + 0.4 * s, 7, '#FFF4D6', { w: 400 });
}
function drawLever(p, x, y, rid) {
  const s = p.s,
    b = p.P(x, y, 0),
    tp = p.P(x, y, 50),
    SE = SEASON[rid];
  p.flat(p.ell(b[0], b[1], 10, 3.6), 'rgba(70,40,15,.25)');
  p.line([b, tp], '#9A6230', 3.4, 1, { sh: 1 });
  p.line([tp, [tp[0] + 12 * s, tp[1] - 15 * s]], '#6E3E17', 2.6);
  p.cut(p.ell(tp[0] + 12 * s, tp[1] - 15 * s, 4, 4, 12), C.terra, { sh: 0, rough: 0 });
  const c = p.P(x, y, 32);
  p.cut(p.ell(c[0], c[1], 11, 11, 20), SE.seal, { blur: 3, rough: 0.4 });
  p.text('↻', c[0], c[1] + 0.5 * s, 12, '#FFF4D6', { w: 600 });
}
function leverSpot(N, rid) {
  const c = CELLS[N],
    d = c.doors.find((x) => x.to === rid),
    n = d.n,
    tg = [-n[1], n[0]];
  for (const [a, b] of [
    [100, 80],
    [100, -80],
    [135, 100],
    [135, -100],
    [80, 120],
    [80, -120],
    [160, 0],
  ]) {
    const x = d.mid[0] + n[0] * a + tg[0] * b,
      y = d.mid[1] + n[1] * a + tg[1] * b;
    if (!inHex(x, y * 1.02, R - 55)) continue;
    if (c.solids.some(([sx, sy, sr]) => Math.hypot(x - sx, (y - sy) * 1.15) < sr + 42)) continue;
    if (c.doors.some((o) => Math.hypot(x - o.trig[0], y - o.trig[1]) < 80)) continue;
    if ((PUZ.things[N] || []).some((q) => Math.hypot(x - q.x, y - q.y) < 80)) continue;
    return [x, y];
  }
  return [d.mid[0] + n[0] * 110, d.mid[1] + n[1] * 110];
}
const addProp = (id, nm, x, y, h, fn) => {
  CELLS[id].props.push({ id: nm, y, bb: [x - 40, y * K - h - 30, x + 40, y * K + 18], draw: (p) => fn(p, x, y) });
  CELLS[id].solids.push([x, y, 14]);
};
for (const rid in ROTORS) {
  const [x, y] = ROTORS[rid].torno;
  (LIGHTS[rid] = LIGHTS[rid] || []).push([x, y, 30, 170]);
  addProp(rid, 'torno', x, y, 62, (p, a, b) => drawTorno(p, a, b, rid));
  (PUZ.things[rid] = PUZ.things[rid] || []).push({
    id: 'torno',
    rot: rid,
    x,
    y,
    z: 34,
    r: 85,
    ax: x + (x > 0 ? -10 : 10),
    ay: y + 58,
    label: () => ROTORS[rid].inside,
    show: () => !PUZ.cellLocked(rid),
  });
  for (const d of CELLS[rid].doors) {
    const N = d.to;
    if (N === 'cor') continue;
    const [lx, ly] = leverSpot(N, rid);
    addProp(N, 'palanca' + rid, lx, ly, 64, (p, a, b) => drawLever(p, a, b, rid));
    (PUZ.things[N] = PUZ.things[N] || []).push({
      id: 'palanca',
      rot: rid,
      face: N,
      x: lx,
      y: ly,
      z: 34,
      r: 80,
      ax: lx * 0.82,
      ay: ly * 0.82 + 34,
      label: () => ROTORS[rid].outside,
      show: () => !PUZ.cellLocked(rid) && !faces(rid, N) && !FREE,
    });
  }
}
{
  const a0 = act;
  act = function (t) {
    if (t && t.rot) {
      if (rotBusy(t.rot)) return;
      if (t.face) rotFace(t.rot, t.face);
      else rotStep(t.rot, 1);
      return;
    }
    a0(t);
  };
}
/* el disco giratorio del suelo, con el pasillo pintado hacia sus dos aberturas */
function drawDisc(p, rid) {
  const Rt = ROTORS[rid],
    [cx, cy] = Rt.torno,
    rad = 148,
    ang = (ROT[rid].a * Math.PI) / 3,
    s = p.s,
    z = 0.6,
    g = p.g,
    busy = rotBusy(rid);
  p.flat(p.ring(cx, cy + 5, z, rad + 12, rad + 12, 48), 'rgba(50,25,10,.28)');
  p.cut(p.ring(cx, cy, z, rad, rad, 48), C.honey, { sh: 0, rough: 0.4 });
  p.flat(p.ring(cx, cy, z, rad - 8, rad - 8, 48), Rt.disc);
  p.flat(p.ring(cx, cy, z, rad - 22, rad - 22, 48), Rt.disc2);
  for (let k = 0; k < 12; k++) {
    const a = (k * Math.PI) / 6 + ang,
      c = Math.cos(a),
      si = Math.sin(a);
    p.line([p.P(cx + c * (rad - 8), cy + si * (rad - 8), z), p.P(cx + c * (rad - 1), cy + si * (rad - 1), z)], '#8C4B1F', 1.4, 0.7);
  }
  const arrow = (o, col, al, wk = 1) => {
    const a = ((o + 0.5) * Math.PI) / 3 + ang,
      c = Math.cos(a),
      si = Math.sin(a),
      nx = -si,
      ny = c,
      w = 16 * wk,
      L = rad - 34;
    const band = [
      p.P(cx + nx * w + c * 26, cy + ny * w + si * 26, z),
      p.P(cx + c * L + nx * w, cy + si * L + ny * w, z),
      p.P(cx + c * L + nx * w * 2.1, cy + si * L + ny * w * 2.1, z),
      p.P(cx + c * (rad - 6), cy + si * (rad - 6), z),
      p.P(cx + c * L - nx * w * 2.1, cy + si * L - ny * w * 2.1, z),
      p.P(cx + c * L - nx * w, cy + si * L - ny * w, z),
      p.P(cx - nx * w + c * 26, cy - ny * w + si * 26, z),
    ];
    p.flat(band, col, al);
    return band;
  };
  for (const o of Rt.open) {
    const b = arrow(o, '#FFF4D6', 0.95);
    p.line([...b, b[0]], '#6E3E17', 1.6, 0.8);
  }
  if (!busy && !STILL) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (const o of Rt.open) arrow(o, 'rgba(255,214,140,1)', 0.18 + 0.14 * Math.sin(T * 3));
    g.restore();
  }
  p.cut(p.ring(cx, cy, z, 26, 26, 24), C.honey, { sh: 0, rough: 0.2 });
  p.flat(p.ring(cx, cy, z, 18, 18, 20), Rt.disc);
}
/* hilo de luz desde el disco hasta cada puerta que encaja */
function drawAlign(p, rid) {
  if (rotBusy(rid)) return;
  const [cx, cy] = ROTORS[rid].torno,
    s = p.s;
  for (const d of CELLS[rid].doors) {
    if (!faces(rid, d.to) || !PUZ._open0(rid, d.to)) continue;
    const tx = d.mid[0] + d.n[0] * 30,
      ty = d.mid[1] + d.n[1] * 30,
      L = Math.hypot(tx - cx, ty - cy),
      n = Math.floor(L / 22);
    for (let i = 5; i < n; i++) {
      const u = i / n,
        q = p.P(lerp(cx, tx, u), lerp(cy, ty, u), 1),
        pu = 0.5 + 0.5 * Math.sin(T * 3 - i * 0.6);
      p.flat(p.ell(q[0], q[1], 3, 1.6, 8), '#FFE6A8', 0.35 + 0.5 * pu);
    }
  }
}
/* biombo de papel en las puertas que no encajan */
function drawScreen(p, d, rid) {
  const e = d.e,
    hw = DOOR_W * 1.08,
    top = d.back ? 84 : 34,
    Rt = ROTORS[rid],
    s = p.s,
    inw = d.back ? 7 : 3;
  for (let k = 0; k < 3; k++) {
    const u0 = 0.5 - hw + (k * hw * 2) / 3,
      u1 = u0 + (hw * 2) / 3;
    const P = [
      p.W(wallPt(e, u0, 0, inw + (k % 2) * 4)),
      p.W(wallPt(e, u1, 0, inw + ((k + 1) % 2) * 4)),
      p.W(wallPt(e, u1, top, inw + ((k + 1) % 2) * 4)),
      p.W(wallPt(e, u0, top, inw + (k % 2) * 4)),
    ];
    p.cut(P, k % 2 ? Rt.disc2 : Rt.disc, { blur: 3, rough: 0.3 });
    p.line([P[3], P[2]], Rt.line, 1.4, 0.8);
  }
  const c = p.W(wallPt(e, 0.5, top * 0.55, inw + 6));
  p.cut(p.ell(c[0], c[1], 10, 10, 18), Rt.line, { sh: 0, rough: 0.3 });
  p.text('↻', c[0], c[1] + 0.5 * s, 12, Rt.disc, { w: 600 });
}
const DOOROWN = new Map();
for (const id of ORDER) for (const d of CELLS[id].doors) DOOROWN.set(d, id);
{
  const b0 = STYLE.blocker;
  STYLE.blocker = function (p, d, kind, t) {
    const id = DOOROWN.get(d);
    if (kind !== 'seal' && id && PUZ._open0(id, d.to) && rotBlocks(id, d.to)) {
      drawScreen(p, d, rotStuck(id, d.to) ? id : d.to);
      return;
    }
    b0(p, d, kind, t);
  };
}
{
  const u0 = qUnder;
  qUnder = function (p, id) {
    if (ROTORS[id]) {
      drawDisc(p, id);
      drawAlign(p, id);
    }
    u0(p, id);
  };
}
/* en el mapa y desde lejos: dos flechas de papel dicen hacia dónde mira cada celda que gira */
function rotMapArrows(s) {
  if (window.R3D && R3D.on) return;
  for (const rid in ROTORS) {
    if (FOCUS[rid] > 0.98 || PUZ.cellLocked(rid) || !isSeen(rid)) continue;
    const cx = camX + CW[rid][0] * s,
      cy = oyOf(rid, s),
      sz = Math.max(26 * s, 15 * DPR);
    for (const o of ROTORS[rid].open) {
      const a = ((o + ROT[rid].a + 0.5) * Math.PI) / 3,
        x = cx + Math.cos(a) * R * 0.56 * s,
        y = cy + Math.sin(a) * R * 0.56 * K * s,
        sa = Math.atan2(Math.sin(a) * K, Math.cos(a));
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(sa);
      ctx.shadowColor = 'rgba(40,20,5,.55)';
      ctx.shadowBlur = sz * 0.3;
      ctx.shadowOffsetY = sz * 0.08;
      ctx.fillStyle = '#FFFDF6';
      ctx.strokeStyle = '#8C4B1F';
      ctx.lineWidth = Math.max(1.5, sz * 0.1);
      ctx.beginPath();
      ctx.moveTo(sz, 0);
      ctx.lineTo(0, -sz * 0.6);
      ctx.lineTo(0, -sz * 0.25);
      ctx.lineTo(-sz * 0.8, -sz * 0.25);
      ctx.lineTo(-sz * 0.8, sz * 0.25);
      ctx.lineTo(0, sz * 0.25);
      ctx.lineTo(0, sz * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.stroke();
      ctx.fillStyle = ROTORS[rid].disc;
      ctx.beginPath();
      ctx.moveTo(sz * 0.75, 0);
      ctx.lineTo(sz * 0.12, -sz * 0.38);
      ctx.lineTo(sz * 0.12, sz * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
}
/* el objetivo avisa cuando lo único que falta es girar una celda */
function pathTo(to, op) {
  const prev = { [cur]: null },
    q = [cur];
  while (q.length) {
    const a = q.shift();
    if (a === to) break;
    for (const d of CELLS[a].doors) {
      if (d.to in prev || !op(a, d.to)) continue;
      prev[d.to] = a;
      q.push(d.to);
    }
  }
  if (!(to in prev)) return null;
  const r = [];
  let k = to;
  while (k) {
    r.unshift(k);
    k = prev[k];
  }
  return r;
}
{
  const g0 = PUZ.goal.bind(PUZ);
  PUZ.goal = function () {
    const g = g0(),
      c = QGOAL.cell;
    if (FREE || DEMO || !c || c === cur || PUZ.cellLocked(c)) return g;
    if (pathTo(c, PUZ.open)) return g;
    const P = pathTo(c, PUZ._open0);
    if (!P) return g;
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i],
        b = P[i + 1];
      if (!rotBlocks(a, b)) continue;
      const rid = rotStuck(a, b) ? a : b,
        other = rid === a ? b : a;
      QGOAL.cell = rid;
      return `Gira ${ROTORS[rid].name} hacia: ${SEASON[other].name}`;
    }
    return g;
  };
}
{
  const h0 = HINT2;
  h0.tea_rot = 'Telón: «El torno del centro gira el escenario. Mira las flechas del suelo: apuntan a las puertas que quedan abiertas.»';
  h0.dsv_rot = 'Trasto: «Cada vuelta del torno, un sexto de giro. Las flechas del suelo te dicen adónde mira el desván.»';
}
{
  const qh0 = QHINT;
  QHINT = function () {
    const g = PUZ.goal();
    if (g.startsWith('Gira ') && ROTORS[QGOAL.cell]) return HINT2[QGOAL.cell + '_rot'];
    return qh0();
  };
}

/* ══════════ TABLERO DE PISTAS · lo que cuentan los vecinos, cruzado en el cuaderno ══════════
   Cada frase importante que oyes se anota sola. Con testimonios suficientes puedes responder
   cinco preguntas sobre la noche en que Amaranta detuvo la colmena. Resolverlas abre el final completo. */
const TESTI = {
  tren1: ['Estela', 'El último salió de esta estación con un solo pasajero. Llevaba un sombrero con velo.'],
  tren2: ['Estela', 'No recuerdo haber visto su cara debajo del velo. Al volver, el tren venía vacío y el sombrero estaba en el asiento.'],
  nube: ['Nube', 'Esa noche la vi bajar a pie hacia el corazón. Desde aquí se ve todo, y no subió a ningún tren.'],
  campana: ['Nube', 'No era Amaranta. Era alguien de papel, casi transparente.'],
  vela: ['Vela', 'Estuvo aquí abajo hasta las tres y media, fundiendo una sola carta. Luego bajó hacia el corazón, no hacia el andén.'],
  somb: ['Amaranta', 'No subí a ese tren. Subió mi sombrero, con alguien debajo que se me parecía.'],
  reloj: ['Péndulo', 'Todos los relojes se pararon a la misma hora: las cuatro menos cuarto.'],
  faro: ['Albor', 'La última noche la luz se desvió sola. Apuntó abajo, al corazón, y se quedó ahí.'],
  llave: ['Ceniza', 'Una llave para el corazón. Me la pidió… y luego me pidió que la olvidara.'],
  libro: ['Tomo', 'Falta un libro. Uno sin título, con tapas de cera. Lo escribió ella.'],
  arbol: ['Rocío', 'Hay uno sin nombre todavía. Amaranta lo plantó la última tarde. Creo que es para quien la despierte.'],
  caja: ['Trasto', 'Amaranta subió una caja la última noche. Dijo «para cuando esté lista». No la he abierto.'],
  abril: ['Abril', 'Ella decía que una colmena no se manda. Se escucha.'],
  apic: ['Amaranta', 'El viejo apicultor me enseñó que la colmena se para cuando quien la cuida deja de escucharla.'],
  antes: ['Amaranta', 'No era la primera vez que el panal se paraba. Yo tampoco fui la primera en despertarlo.'],
  pag7: ['Amaranta', 'Planté un árbol sin nombre. Quien lo nombre tendrá que quedarse. Perdóname.'],
  eco: ['Eco', 'Estela no mintió. Me vio a mí.'],
};
const TBY = {};
for (const k in TESTI) TBY[TESTI[k][1]] = k;
const DEDU = [
  {
    id: 'tren',
    q: '¿Subió Amaranta al tren nocturno aquella noche?',
    opts: [
      'Sí: se fue en el último tren, con su sombrero.',
      'Se escondió en el desván, dentro de la caja.',
      'No: bajó a pie hacia el corazón y nunca llegó al andén.',
    ],
    ok: 2,
    ev: ['tren1', 'tren2', 'nube', 'vela', 'somb'],
    need: 3,
    who: 'Estela, Nube y Vela',
  },
  {
    id: 'hora',
    q: '¿A qué hora se detuvo la colmena?',
    opts: ['A las cuatro menos cuarto.', 'A medianoche, cuando sonó la campana.', 'Al amanecer.'],
    ok: 0,
    ev: ['reloj', 'vela', 'faro'],
    need: 2,
    who: 'Péndulo, Vela y Albor',
  },
  {
    id: 'deja',
    q: '¿Qué dejó preparado para quien la encontrara?',
    opts: [
      'Un billete de vuelta y una carta de despedida.',
      'Una llave, un libro sin título y un árbol sin nombre.',
      'Nada: no quería que nadie la encontrara.',
    ],
    ok: 1,
    ev: ['llave', 'libro', 'arbol', 'caja'],
    need: 3,
    who: 'Ceniza, Tomo, Rocío y Trasto',
  },
  {
    id: 'porque',
    q: '¿Por qué detuvo la colmena?',
    opts: [
      'Por accidente, al cerrar el corazón.',
      'Porque quería irse para siempre.',
      'Porque había dejado de escucharla y necesitaba que alguien la despertara.',
    ],
    ok: 2,
    ev: ['abril', 'apic', 'antes', 'pag7'],
    need: 2,
    who: 'Abril y el cuaderno de Amaranta',
  },
  {
    id: 'quien',
    q: '¿Quién subió al último tren con su sombrero?',
    opts: ['Amaranta, para irse lejos.', 'Nadie: el tren salió vacío.', 'Eco, la parte de Amaranta que no quería irse.'],
    ok: 2,
    ev: ['tren1', 'campana', 'eco'],
    need: 3,
    who: 'Estela, Nube y Eco',
  },
];
const heard = (k) => !!(QF().heard && QF().heard[k]);
let newTesti = 0;
function hear(line) {
  const k = TBY[line];
  if (!k || FREE) return;
  const F = QF();
  F.heard = F.heard || {};
  if (F.heard[k]) return;
  F.heard[k] = 1;
  newTesti++;
  PLOG.ev('testimonio', k);
  save();
}
function hearBackfill() {
  const F = QF();
  if (FREE) return;
  const add = (k) => {
    F.heard = F.heard || {};
    F.heard[k] = 1;
  };
  const M = F.met || {};
  const first = { tre: 'tren1', rel: 'reloj', far: 'faro', vol: 'llave', bib: 'libro', jar: 'arbol', dsv: 'caja', col: 'abril' };
  for (const id in first) if (M[id]) add(first[id]);
  if (F.done) add('antes');
  if (F.s3) add('apic');
  if (F.s4) add('somb');
  if (F.pages && F.pages.jar) add('pag7');
}
{
  const t0 = talk;
  talk = function () {
    t0();
    if (talking && DLG && DLG.lines) hear(DLG.lines[lineIx]);
  };
}
{
  const s0 = sayNPC;
  sayNPC = function (lines, ex, o) {
    s0(lines, ex, o);
    if (lines && lines[0]) hear(lines[0]);
  };
}
{
  const n0 = narrate;
  narrate = function (lines, key, o) {
    if (lines) for (const l of lines) hear(l);
    return n0(lines, key, o);
  };
}
{
  const c0 = closeTalk;
  closeTalk = function () {
    c0();
    if (newTesti && !inTitle) {
      const n = newTesti;
      newTesti = 0;
      setTimeout(() => note(n > 1 ? 'Nuevos testimonios en el cuaderno · Pistas' : 'Nuevo testimonio en el cuaderno · Pistas'), 400);
    }
  };
}
/* los vecinos cuentan primero lo que todavía no has oído */
{
  const r0 = rot;
  rot = function (id) {
    const D = DLG2[id];
    if (D && !FREE) {
      const un = D.again.find((ls) => ls.some((l) => TBY[l] && !heard(TBY[l])));
      if (un) return un;
    }
    return r0(id);
  };
}
function fillClues() {
  const box = document.getElementById('bclue'),
    F = QF();
  box.innerHTML = '';
  const n = Object.keys(TESTI).filter(heard).length;
  document.getElementById('bcluek').textContent =
    _t(`Testimonios anotados: ${n}/${Object.keys(TESTI).length}`) +
    (F.truth ? '' : ' · ' + _t('Responde las cinco preguntas para abrir el final completo.'));
  for (const q of DEDU) {
    const done = !!(F.dedu && F.dedu[q.id]),
      ev = q.ev.filter(heard),
      d = document.createElement('div');
    d.className = 'dq' + (done ? ' ok' : '');
    const h = document.createElement('h4');
    h.textContent = _t(q.q);
    d.appendChild(h);
    const zh = LANG === 'zh';
    for (const k of ev) {
      const p = document.createElement('p');
      p.className = 'tq';
      const b = document.createElement('b');
      b.textContent = _t(TESTI[k][0]) + (zh ? '：' : ':');
      p.append(b, document.createTextNode((zh ? '「' : '«') + _t(TESTI[k][1]) + (zh ? '」' : '»')));
      d.appendChild(p);
    }
    if (done) {
      const a = document.createElement('p');
      a.className = 'ans';
      a.textContent = '✔ ' + _t(q.opts[q.ok]);
      d.appendChild(a);
    } else if (ev.length >= q.need) {
      const o = document.createElement('div');
      o.className = 'opts';
      const msg = document.createElement('p');
      msg.className = 'msg';
      msg.setAttribute('aria-live', 'polite');
      q.opts.forEach((t, i) => {
        const b = document.createElement('button');
        b.textContent = _t(t);
        b.addEventListener('click', () => {
          if (i === q.ok) {
            F.dedu = F.dedu || {};
            F.dedu[q.id] = 1;
            Sound.sfx('give');
            PLOG.ev('tablero-ok', q.id);
            save();
            if (DEDU.every((x) => F.dedu[x.id])) truthSolved();
            else if (!F.casi && DEDU.filter((x) => x.id !== 'quien').every((x) => F.dedu[x.id])) {
              F.casi = 1;
              narrate(['Lo has entendido casi todo.', 'Queda alguien a quien no has escuchado. Está debajo de todo.'], 'casi', {
                delay: 0.6,
              });
            }
            fillClues();
          } else {
            Sound.sfx('blocked');
            b.classList.remove('no');
            void b.offsetWidth;
            b.classList.add('no');
            msg.textContent = _t('No encaja con lo que cuentan los vecinos.');
            PLOG.wrong(q.id);
          }
        });
        o.appendChild(b);
      });
      d.append(o, msg);
    } else {
      const p = document.createElement('p');
      p.className = 'need';
      p.textContent = _t(`Faltan testimonios (${ev.length}/${q.need}). Pregunta a: ${q.who}`);
      d.appendChild(p);
    }
    box.appendChild(d);
  }
  if (F.truth) {
    const t = document.createElement('div');
    t.className = 'truth';
    const b = document.createElement('b');
    b.textContent = _t('La verdad de Amaranta');
    t.append(
      b,
      document.createTextNode(
        _t(
          'A medianoche dejó de escuchar la colmena y nació Eco, su parte de papel. Eco tocó la campana, se puso su sombrero y subió al último tren para que nadie la buscara abajo. Amaranta fundió una sola carta con Vela, bajó a pie al corazón y lo cerró con la llave de Ceniza a las cuatro menos cuarto. Dejó un libro, una llave y un árbol para quien viniera a despertarla. Nadie mintió: cada uno contó lo que vio.',
        ),
      ),
    );
    box.appendChild(t);
  }
}
function truthSolved() {
  const F = QF();
  if (F.truth) return;
  F.truth = 1;
  achieve('truth');
  stateChanged();
  note('✦ Has descubierto la verdad de Amaranta');
  narrate(['Lo has entendido. Ya no hace falta que te lo cuente.', 'Ven al corazón cuando quieras. Te espero despierta.'], 'truth', {
    delay: 0.8,
  });
}
{
  const bt0 = bookTab;
  bookTab = function (t) {
    bt0(t);
    if (t === 'clues') fillClues();
  };
}
ACH.push(
  ['turn', 'Puertas que giran', 'Gira el Teatro y el Desván'],
  ['truth', 'La verdad de Amaranta', 'Resuelve el tablero de pistas del cuaderno'],
);

/* ══════════ DEMO · solo el capítulo 1 ══════════ */
const DEMO = !!window.COLMENA_DEMO || /[?&]demo\b/.test(location.search);
const CH1 = ['pri', 'ver', 'oto', 'inv'];
if (DEMO) {
  {
    const l0 = PUZ.cellLocked,
      w0 = PUZ.why.bind(PUZ),
      g0 = PUZ.goal.bind(PUZ),
      o0 = PUZ.open.bind(PUZ);
    PUZ.cellLocked = (id) => !CH1.includes(id) || l0(id);
    PUZ.open = (a, b) => CH1.includes(a) && CH1.includes(b) && o0(a, b);
    PUZ.why = (a, b) => (!CH1.includes(a) || !CH1.includes(b) ? 'Esta parte de la colmena llega con el juego completo.' : w0(a, b));
    PUZ.goal = () => (QF().done ? 'Fin de la demo · gracias por jugar' : g0());
  }
  {
    const sc0 = showChapter;
    showChapter = function (c) {
      if (c === 2) {
        demoEnd();
        return;
      }
      sc0(c);
    };
  }
  document.getElementById('tdemo').hidden = false;
  document.getElementById('bfree').hidden = true;
}
function demoEnd() {
  PLOG.ev('fin-demo');
  showEnding(
    'Demo',
    'Gracias por jugar',
    [
      'Has encendido el primer sello y la colmena vuelve a latir.',
      'En el juego completo te esperan seis sellos, veinticinco vecinos, puertas que giran y tres finales.',
      'Si te ha gustado, añade Colmena a tu lista de deseados en Steam.',
      '— Colmena · demo —',
    ],
    () => note('Puedes seguir paseando por las cuatro estaciones.'),
  );
}

/* ══════════ INFORME DE PRUEBA · lo que pasa en la partida, para mejorar el juego ══════════
   Todo se guarda solo en este navegador. Nada se envía a ningún sitio: el jugador copia el
   informe y lo manda a quien le pidió probar. */
const PLOG = {
  d: null,
  lastGoal: '',
  gT: 0,
  lastBump: {},
  load() {
    try {
      this.d = JSON.parse(localStorage.getItem('colmena-prueba') || 'null');
    } catch (e) {}
    if (!this.d || !this.d.v)
      this.d = { v: 1, t: 0, start: Date.now(), ev: [], mg: {}, hints: [0, 0, 0], bumps: {}, wrong: {}, stuck: [], seals: {}, cells: {} };
  },
  save() {
    try {
      localStorage.setItem('colmena-prueba', JSON.stringify(this.d));
    } catch (e) {}
  },
  ev(k, x) {
    if (!this.d || FREE) return;
    this.d.ev.push([Math.round(this.d.t), k, x || '']);
    if (this.d.ev.length > 500) this.d.ev.shift();
    this.save();
  },
  bump(id) {
    if (!this.d || FREE) return;
    const now = performance.now();
    if (now - (this.lastBump[id] || 0) < 3000) return;
    this.lastBump[id] = now;
    this.d.bumps[id] = (this.d.bumps[id] || 0) + 1;
  },
  wrong(q) {
    if (!this.d) return;
    this.d.wrong[q] = (this.d.wrong[q] || 0) + 1;
    this.ev('tablero-mal', q);
  },
  tick(dt) {
    if (!this.d || FREE || inTitle || document.hidden) return;
    this.d.t += dt;
    if ((this.gk = (this.gk || 0) + dt) < 1) return;
    this.d.cells[cur] = (this.d.cells[cur] || 0) + this.gk;
    const step = this.gk;
    this.gk = 0;
    const g = PUZ.goal();
    if (g !== this.lastGoal) {
      const gap = this.d.t - this.gT;
      if (this.lastGoal && gap > 120) this.d.stuck.push([Math.round(this.gT), Math.round(gap), this.lastGoal]);
      this.lastGoal = g;
      this.gT = this.d.t;
    }
    for (let n = 1; n <= 6; n++)
      if (sealOn(n) && !this.d.seals[n]) {
        this.d.seals[n] = Math.round(this.d.t);
        this.ev('sello', n);
      }
    if ((this.saveT = (this.saveT || 0) + step) > 5) {
      this.saveT = 0;
      this.save();
    }
  },
  text() {
    const d = this.d,
      F = QF(),
      m = (v) => {
        v = Math.round(v);
        return v < 60 ? v + ' s' : Math.floor(v / 60) + ' min ' + (v % 60 ? String(v % 60).padStart(2, '0') + ' s' : '');
      };
    const L = [];
    L.push(
      'INFORME DE PRUEBA · COLMENA' + (DEMO ? ' (demo)' : ''),
      'Fecha: ' +
        new Date().toLocaleString() +
        ' · Idioma: ' +
        LANG +
        ' · Pantalla: ' +
        innerWidth +
        '×' +
        innerHeight +
        (COARSE ? ' táctil' : ''),
      '',
    );
    L.push(
      'Tiempo jugado: ' + m(d.t),
      'Sellos: ' + sealCount() + '/6 · Capítulo ' + PUZ.chapter() + (F.ending ? ' · Final ' + F.ending : ''),
    );
    const sl = Object.entries(d.seals);
    if (sl.length) L.push('Sellos encendidos a los: ' + sl.map(([n, t]) => n + ' → ' + m(t)).join(' · '));
    L.push('Objetivo actual: ' + PUZ.goal(), '');
    L.push(
      'Pistas pedidas: ' +
        (d.hints[0] + d.hints[1] + d.hints[2]) +
        ' (nivel 1: ' +
        d.hints[0] +
        ', nivel 2: ' +
        d.hints[1] +
        ', flecha: ' +
        d.hints[2] +
        ')',
    );
    L.push('Atascos (más de 2 min con el mismo objetivo): ' + (d.stuck.length ? '' : 'ninguno'));
    for (const [t, g, o] of d.stuck.slice(-12)) L.push('  · ' + m(g) + ' desde el min ' + Math.floor(t / 60) + ' — «' + o + '»');
    const mg = Object.entries(d.mg);
    L.push('', 'Minijuegos:' + (mg.length ? '' : ' ninguno todavía'));
    for (const [k, v] of mg)
      L.push(
        '  · ' +
          k +
          ': ' +
          v.open +
          ' intento(s), ' +
          (v.win ? 'resuelto en ' + m(v.time) : 'sin resolver') +
          (v.quit ? ', abandonado ' + v.quit + ' vez/veces' : '') +
          (v.hint ? ', pistas ' + v.hint : ''),
      );
    const bp = Object.entries(d.bumps);
    if (bp.length) L.push('', 'Puertas giratorias cerradas con las que chocó: ' + bp.map(([k, v]) => SEASON[k].name + ' ' + v).join(' · '));
    const wr = Object.entries(d.wrong);
    L.push(
      'Tablero de pistas: ' +
        Object.keys(F.dedu || {}).length +
        '/4 resueltas' +
        (wr.length ? ' · respuestas equivocadas: ' + wr.map(([k, v]) => k + ' ' + v).join(', ') : ''),
    );
    const cl = Object.entries(d.cells)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    if (cl.length) L.push('Celdas donde más tiempo pasó: ' + cl.map(([k, v]) => SEASON[k].name + ' ' + m(v)).join(' · '));
    L.push('', 'Últimos sucesos:');
    for (const [t, k, x] of d.ev.slice(-25))
      L.push(
        '  ' + String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0') + '  ' + k + (x !== '' ? ' · ' + x : ''),
      );
    return L.join('\n');
  },
};
PLOG.load();
{
  const h0 = hintPress;
  hintPress = function () {
    h0();
    PLOG.d.hints[(HLV.n || 1) - 1]++;
    PLOG.ev('pista', HLV.n);
  };
}
{
  const o0 = openGame;
  openGame = function (k) {
    o0(k);
    if (!PLOG.d || FREE) return;
    const v = (PLOG.d.mg[k] = PLOG.d.mg[k] || { open: 0, win: 0, quit: 0, time: 0, hint: 0 });
    v.open++;
    PLOG.ev('minijuego', k);
  };
}
{
  const w0 = API.win;
  API.win = function (fn, msg) {
    if (GAME && !GAME.done && PLOG.d && !FREE) {
      const v = PLOG.d.mg[GAME.key];
      if (v && !v.win) {
        v.win = 1;
        v.time = API.now();
      }
      PLOG.ev('minijuego-ok', GAME.key);
      PLOG.save();
    }
    return w0(fn, msg);
  };
}
{
  MGEL.addEventListener(
    'click',
    (e) => {
      if (e.target.id === 'mgq' && GAME && !GAME.done && PLOG.d && PLOG.d.mg[GAME.key]) {
        PLOG.d.mg[GAME.key].quit++;
        PLOG.ev('minijuego-salir', GAME.key);
      }
    },
    true,
  );
}
document.getElementById('mgh').addEventListener('click', () => {
  if (GAME && PLOG.d && PLOG.d.mg[GAME.key]) PLOG.d.mg[GAME.key].hint++;
});
const plogEl = document.getElementById('plog');
function openPlog() {
  document.getElementById('settings').hidden = true;
  document.getElementById('plogx').textContent = PLOG.text();
  plogEl.hidden = false;
  document.getElementById('plogc').focus({ preventScroll: true });
}
document.getElementById('bplog').addEventListener('click', openPlog);
document.getElementById('plogk').addEventListener('click', () => {
  plogEl.hidden = true;
});
document.getElementById('plogc').addEventListener('click', async () => {
  const t = PLOG.text();
  try {
    await navigator.clipboard.writeText(t);
    note('Informe copiado');
  } catch (e) {
    const r = document.createRange();
    r.selectNodeContents(document.getElementById('plogx'));
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
    note('Selecciona el texto y cópialo (Ctrl+C)');
  }
});
document.getElementById('plogs').addEventListener('click', async () => {
  const t = PLOG.text(),
    name = 'colmena-informe.txt';
  try {
    if (window.claude && window.claude.use) {
      const dl = await window.claude.use('downloads');
      if (dl) {
        await dl.save({ filename: name, data: t });
        return;
      }
    }
    const a = document.createElement('a');
    a.download = name;
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(t);
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (e) {
    if (!e || e.code !== 'declined') note('No se pudo guardar. Usa «Copiar».');
  }
});
document.getElementById('plogr').addEventListener('click', () => {
  try {
    localStorage.removeItem('colmena-prueba');
  } catch (e) {}
  PLOG.d = null;
  PLOG.load();
  document.getElementById('plogx').textContent = PLOG.text();
  note('Datos de prueba borrados');
});
addEventListener(
  'keydown',
  (e) => {
    if (e.key === 'Escape' && !plogEl.hidden) {
      plogEl.hidden = true;
      e.stopImmediatePropagation();
    }
  },
  true,
);

/* ══════════ cada fotograma: giros, informe, primera visita a una celda que gira ══════════ */
let mLast = 0,
  mCur = null;
{
  const f0 = qFrame;
  qFrame = function (s) {
    const dt = Math.min(0.1, Math.max(0, T - mLast));
    mLast = T;
    rotTick(dt);
    PLOG.tick(dt);
    f0(s);
    if (!inTitle) rotMapArrows(s);
    if (cur !== mCur) {
      mCur = cur;
      const F = QF();
      if (ROTORS[cur] && !FREE && !PUZ.cellLocked(cur)) {
        F.rotTut = F.rotTut || {};
        if (!F.rotTut[cur]) {
          F.rotTut[cur] = 1;
          save();
          narrate([ROTORS[cur].narr], 'rot:' + cur, { delay: 2.4 });
          setTimeout(() => note('Este cuarto gira: usa el torno del centro para cambiar qué puertas quedan abiertas.'), 1600);
        }
      }
      PLOG.ev('celda', cur);
    }
  };
}
/* al cargar, reiniciar o salir del recorrido libre, los giros vuelven a su sitio */
{
  const r0 = resetGame;
  resetGame = function (sil) {
    r0(sil);
    rotLoad();
    PLOG.ev('partida-nueva');
  };
}
{
  const e0 = endFree;
  endFree = function () {
    e0();
    rotLoad();
  };
}
{
  const s0 = startFree;
  startFree = function () {
    for (const id in ROTORS) {
      ROT[id].t = ROT[id].a = 0;
    }
    s0();
  };
}
setTimeout(() => {
  rotLoad();
  hearBackfill();
}, 0);

/* ══════════ MANDO EN TODAS PARTES · menús, cuaderno, diálogos y minijuegos (Steam Deck) ══════════
   Cruceta: mover el foco entre botones. A: pulsar. B: volver o cerrar. X: pista. Select: cuaderno.
   En los minijuegos que se juegan tocando, el stick mueve un cursor de papel y A toca donde está. */
const PADU = { prev: [], dir: '', held: 0, mode: 'nav', cur: { x: MW / 2, y: MH / 2, on: false, t: 0 }, last: 0 };
const visEl = (id) => {
  const e = document.getElementById(id);
  return e && !e.hidden ? e : null;
};
function uiLayer() {
  return (
    visEl('ending') ||
    visEl('plog') ||
    visEl('mg') ||
    visEl('book') ||
    visEl('settings') ||
    visEl('creator') ||
    visEl('dch') ||
    (!panel.hidden ? panel : null) ||
    (photoOn ? photoEl : null) ||
    (inTitle ? visEl('title') : null)
  );
}
function focusables(root) {
  return [...root.querySelectorAll('button,input,select')].filter(
    (e) => !e.disabled && !e.closest('[hidden]') && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden',
  );
}
function uiMove(root, dx, dy) {
  const L = focusables(root);
  if (!L.length) return;
  const a = document.activeElement;
  if (!L.includes(a)) {
    L[0].focus({ preventScroll: false });
    return;
  }
  if (a.type === 'range' && dx) {
    a.value = +a.value + dx * +(a.step || 1) * 2;
    a.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
  if (a.tagName === 'SELECT' && dx) {
    a.selectedIndex = (a.selectedIndex + dx + a.options.length) % a.options.length;
    a.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  const r0 = a.getBoundingClientRect(),
    c0 = [r0.left + r0.width / 2, r0.top + r0.height / 2];
  let best = null,
    bd = 1e9;
  for (const e of L) {
    if (e === a) continue;
    const r = e.getBoundingClientRect(),
      vx = r.left + r.width / 2 - c0[0],
      vy = r.top + r.height / 2 - c0[1],
      al = vx * dx + vy * dy;
    if (al <= 4) continue;
    const d = al + Math.abs(vx * dy - vy * dx) * 2.4;
    if (d < bd) {
      bd = d;
      best = e;
    }
  }
  if (!best) {
    const i = L.indexOf(a),
      j = dx + dy > 0 ? i + 1 : i - 1;
    best = L[(j + L.length) % L.length];
  }
  best.focus();
  best.scrollIntoView({ block: 'nearest' });
}
function uiBack(ui) {
  const pick = (id) => {
    const e = document.getElementById(id);
    if (e) e.click();
  };
  if (ui.id === 'ending') pick('endb');
  else if (ui.id === 'plog') pick('plogk');
  else if (ui.id === 'mg') pick('mgq');
  else if (ui.id === 'book') pick('bclose');
  else if (ui.id === 'settings') pick('sclose');
  else if (ui.id === 'creator') pick('crback');
  else if (ui.id === 'dch') {
  } else if (ui === panel) setMenu(false);
  else if (photoOn) photoMode(false);
}
pad = function () {
  if (padOff) return null;
  let list = [];
  try {
    list = navigator.getGamepads ? [...navigator.getGamepads()] : [];
  } catch (e) {
    padOff = true;
    return null;
  }
  const gp = list.find((g) => g);
  if (!gp) return null;
  const b = (i) => gp.buttons[i] && gp.buttons[i].pressed,
    edge = (i) => b(i) && !PADU.prev[i],
    now = performance.now() / 1000,
    dt = Math.min(0.1, now - (PADU.last || now));
  PADU.last = now;
  let x = Math.abs(gp.axes[0] || 0) > 0.3 ? gp.axes[0] : 0,
    y = Math.abs(gp.axes[1] || 0) > 0.3 ? gp.axes[1] : 0;
  const dpx = b(14) ? -1 : b(15) ? 1 : 0,
    dpy = b(12) ? -1 : b(13) ? 1 : 0;
  const ui = uiLayer();
  let out = null;
  if (ui) {
    const inMg = ui.id === 'mg' && GAME;
    if (inMg && (x || y) && GAME.def.tap) {
      const C = PADU.cur;
      C.x = clamp(C.x + x * 420 * dt, 0, MW);
      C.y = clamp(C.y + y * 420 * dt, 0, MH);
      C.on = true;
      C.t = now;
    }
    const dx = dpx || (!inMg || !GAME.def.tap ? Math.round(x) : 0),
      dy = dpy || (!inMg || !GAME.def.tap ? Math.round(y) : 0),
      dir = dx + ',' + dy;
    if (inMg && (x || y) && GAME.def.tap) PADU.mode = 'act';
    if (dx || dy) {
      PADU.mode = 'nav';
      if (dir !== PADU.dir) {
        PADU.held = 0;
        uiMove(ui, dx, dy);
        if (inMg) PADU.cur.on = false;
      } else {
        PADU.held += dt;
        if (PADU.held > 0.38) {
          PADU.held = 0.26;
          uiMove(ui, dx, dy);
        }
      }
    }
    PADU.dir = dx || dy ? dir : '';
    if (edge(0)) {
      const a = document.activeElement,
        navBtn = PADU.mode === 'nav' && a && ui.contains(a) && a.tagName === 'BUTTON';
      if (inMg && GAME.def.key && !navBtn) {
        PADU.mode = 'act';
        GAME.def.key(GAME.st);
      } else if (inMg && GAME.def.tap && PADU.cur.on && !navBtn && !GAME.done) GAME.def.tap(PADU.cur.x, PADU.cur.y, GAME.st);
      else if (a && ui.contains(a) && a.tagName === 'BUTTON') a.click();
      else if (a && ui.contains(a) && a.tagName === 'INPUT' && window.STEAM && STEAM.textInput) {
        STEAM.textInput(_t(a.placeholder || ''), a.maxLength > 0 ? a.maxLength : 24, a.value).then((v) => {
          if (v != null) {
            a.value = v;
            a.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
          }
        });
      } else {
        const f = focusables(ui)[0];
        if (f) f.focus();
      }
    }
    if (edge(1)) uiBack(ui);
    if (edge(2) && inMg) document.getElementById('mgh').click();
  } else {
    out = [x || dpx, y || dpy];
    if (edge(0)) interact();
    if (edge(1)) {
      if (talking) closeTalk();
    }
    if (edge(9) && !inTitle) {
      setMenu(true);
      setTimeout(() => {
        const f = focusables(panel)[0];
        if (f) f.focus();
      }, 30);
    }
    if (edge(3) && !inTitle) toggleMap();
    if (edge(2) && !inTitle) hintPress();
    if (edge(8) && !inTitle) openBook('pages');
  }
  if (ui && edge(9) && ui === panel) setMenu(false);
  if (ui && inTitle && ui.id === 'title' && !document.activeElement.closest('#title')) {
    const f = focusables(ui)[0];
    if (f) f.focus();
  }
  PADU.prev = gp.buttons.map((q) => q.pressed);
  return ui ? [0, 0] : out;
};
/* el cursor de papel del mando dentro de los minijuegos */
mgLoop = function () {
  if (!GAME || MGEL.hidden) return;
  const g = mgc.getContext('2d');
  g.setTransform(GAME.r, 0, 0, GAME.r, 0, 0);
  try {
    GAME.def.draw(g, API.now(), GAME.st);
  } catch (e) {
    console.error(e);
  }
  const C = PADU.cur;
  if (C.on && GAME.def.tap && document.body.classList.contains('pad') && performance.now() / 1000 - C.t < 8) {
    g.save();
    g.translate(C.x, C.y);
    g.shadowColor = 'rgba(40,20,5,.5)';
    g.shadowBlur = 6;
    g.fillStyle = '#FFFDF6';
    g.strokeStyle = '#8C4B1F';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(0, 22);
    g.lineTo(6, 16);
    g.lineTo(11, 26);
    g.lineTo(15, 24);
    g.lineTo(10, 14);
    g.lineTo(18, 14);
    g.closePath();
    g.fill();
    g.shadowColor = 'transparent';
    g.stroke();
    g.restore();
  }
  requestAnimationFrame(mgLoop);
};
{
  const o0 = openGame;
  openGame = function (k) {
    const d = GAMES[k];
    PADU.cur = { x: MW / 2, y: MH / 2, on: !!(d && d.tap), t: performance.now() / 1000 };
    PADU.mode = 'act';
    o0(k);
  };
}
{
  const ob = openBook;
  openBook = function (t) {
    ob(t);
    if (document.body.classList.contains('pad'))
      setTimeout(() => {
        const a = BOOK.querySelector('.btabs [aria-selected="true"]');
        if (a) a.focus();
      }, 40);
  };
}
addEventListener('gamepadconnected', () => {
  document.body.classList.add('pad');
});

/* ══════════ VERSIÓN DE ESCRITORIO (Steam) · el guardado también va a un archivo que Steam Cloud sincroniza ══════════ */
{
  const sv0 = save;
  save = function () {
    sv0();
    if (window.STEAM && STEAM.saveFile) {
      clearTimeout(save.t);
      save.t = setTimeout(() => {
        const o = {};
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('colmena')) o[k] = localStorage.getItem(k);
          }
        } catch (e) {}
        STEAM.saveFile(o);
      }, 500);
    }
  };
}
if (window.STEAM && STEAM.isDesktop) {
  document.body.classList.add('desktop');
  const tb = document.querySelector('.tbtns'),
    q = document.createElement('button');
  q.id = 'bquit';
  q.textContent = 'Salir del juego';
  q.addEventListener('click', () => {
    save();
    STEAM.quit();
  });
  tb.appendChild(q);
  if (STEAM.isDeck) document.body.classList.add('deck');
}
{
  const de0 = demoEnd;
  demoEnd = function () {
    de0();
    if (window.STEAM && STEAM.openStore) {
      const b = document.createElement('button');
      b.id = 'bwish';
      b.textContent = _t('Añadir a la lista de deseados');
      b.className = 'wish';
      b.addEventListener('click', () => STEAM.openStore());
      document.getElementById('endx').appendChild(b);
    }
  };
}
