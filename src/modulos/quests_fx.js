/* ══════════ EFECTOS · abejas, luz en el suelo, capas de fondo, libro desplegable ══════════ */
/* una abeja de papel pequeña, con borde blanco */
function miniBee(p, x, y, z, t, f = 1, k = 1) {
  const s = p.s,
    c = p.P(x, y, z),
    fl = 0.3 + 0.7 * Math.abs(Math.sin(t * 34 + x));
  const g = p.g;
  g.save();
  g.fillStyle = '#FFFDF6';
  g.beginPath();
  g.ellipse(c[0], c[1], 7.6 * k * s, 6 * k * s, 0, 0, TAU);
  g.fill();
  for (const d of [-1, 1]) {
    g.fillStyle = 'rgba(250,250,245,.9)';
    g.beginPath();
    g.ellipse(c[0] + d * 2.4 * k * s, c[1] - 5.4 * k * s, 4.4 * k * s, (1.6 + 2.6 * fl) * k * s, d * 0.5, 0, TAU);
    g.fill();
  }
  g.fillStyle = '#F5CE55';
  g.beginPath();
  g.ellipse(c[0], c[1], 6 * k * s, 4.6 * k * s, 0, 0, TAU);
  g.fill();
  g.fillStyle = '#3A2A20';
  g.fillRect(c[0] - 2.4 * k * s, c[1] - 4.4 * k * s, 1.8 * k * s, 8.8 * k * s);
  g.fillRect(c[0] + 1.2 * k * s, c[1] - 4.2 * k * s, 1.6 * k * s, 8.4 * k * s);
  g.beginPath();
  g.arc(c[0] + 5.6 * f * k * s, c[1] - 1 * k * s, 2.6 * k * s, 0, TAU);
  g.fill();
  g.restore();
}
/* ── abejas que viajan hacia el corazón al encenderse un sello ── */
const QBEES = [];
function routeTo(a, b) {
  const prev = { [a]: null },
    q = [a];
  while (q.length) {
    const x = q.shift();
    if (x === b) break;
    for (const [u, v] of LINKS) {
      const y = u === x ? v : v === x ? u : null;
      if (y && !(y in prev)) {
        prev[y] = x;
        q.push(y);
      }
    }
  }
  const r = [];
  let k = b;
  if (!(b in prev)) return [a];
  while (k) {
    r.unshift(k);
    k = prev[k];
  }
  return r;
}
function beesFrom(cell) {
  const r = routeTo(cell, 'cor').map((id) => CW[id]);
  if (r.length < 2) return;
  for (let i = 0; i < 9; i++) QBEES.push({ pts: r, t0: T + i * 0.28, sp: 240 + i * 9, ph: i * 1.7, side: ((i % 3) - 1) * 40 });
}
function beePos(b) {
  let d = (T - b.t0) * b.sp;
  for (let i = 0; i < b.pts.length - 1; i++) {
    const a = b.pts[i],
      c = b.pts[i + 1],
      L = Math.hypot(c[0] - a[0], c[1] - a[1]);
    if (d <= L) {
      const u = d / L,
        nx = -(c[1] - a[1]) / L,
        ny = (c[0] - a[0]) / L,
        w = Math.sin(T * 3 + b.ph) * 18 + b.side;
      return [lerp(a[0], c[0], u) + nx * w, lerp(a[1], c[1], u) + ny * w, 150 + Math.sin(T * 5 + b.ph) * 18, Math.sign(c[0] - a[0]) || 1];
    }
    d -= L;
  }
  return null;
}
/* ── la capa de papel del fondo, más lenta que la cámara ── */
let PARA = null;
function paraTile() {
  if (PARA) return PARA;
  const n = 900,
    c = newCanvas(n, n),
    g = c.getContext('2d'),
    R0 = rng('fondo');
  for (let k = 0; k < 22; k++) {
    const x = R0() * n,
      y = R0() * n,
      r = 30 + R0() * 90;
    g.strokeStyle = `rgba(255,226,170,${0.05 + R0() * 0.06})`;
    g.lineWidth = 2 + R0() * 3;
    hexPath(g, x, y, r, Math.PI / 6);
    g.stroke();
    if (R0() < 0.3) {
      g.fillStyle = 'rgba(255,220,160,.035)';
      g.fill();
    }
  }
  for (let k = 0; k < 7; k++) {
    const x = R0() * n,
      y = R0() * n,
      w = 90 + R0() * 140;
    g.fillStyle = 'rgba(255,240,215,.06)';
    for (let j = 0; j < 5; j++) {
      g.beginPath();
      g.ellipse(x + j * w * 0.18 - w * 0.36, y + Math.sin(j * 1.7) * 10, w * 0.22, w * 0.12, 0, 0, TAU);
      g.fill();
    }
  }
  for (let k = 0; k < 60; k++) {
    g.fillStyle = `rgba(255,244,214,${0.15 + R0() * 0.35})`;
    g.beginPath();
    g.arc(R0() * n, R0() * n, 0.8 + R0() * 1.4, 0, TAU);
    g.fill();
  }
  return (PARA = c);
}
function qBack(s, W, H) {
  if (STILL) return;
  const tile = paraTile(),
    k = Math.min(1.6, Math.max(0.7, s / (S * DPR * 1.4))),
    n = tile.width * k,
    ox = (((camX * 0.42) % n) + n) % n,
    oy = (((camY * 0.42) % n) + n) % n;
  ctx.save();
  ctx.globalAlpha = inTitle ? 0.7 : 1;
  for (let x = ox - n; x < W; x += n) for (let y = oy - n; y < H; y += n) ctx.drawImage(tile, x, y, n, n);
  ctx.restore();
}
/* ── la luz que los vecinos llevan en la mano, sobre el suelo ── */
const NPC_LIGHT = {
  inn: 'rgba(207,227,255,.34)',
  tre: 'rgba(246,217,138,.36)',
  far: 'rgba(255,241,176,.36)',
  sot: 'rgba(255,190,90,.34)',
  des: 'rgba(143,224,208,.32)',
  dsv: 'rgba(255,211,106,.34)',
  esp: 'rgba(207,227,255,.3)',
  cue: 'rgba(143,211,196,.3)',
  vol: 'rgba(245,168,58,.36)',
  ant: 'rgba(143,211,196,.26)',
  oce: 'rgba(143,211,196,.26)',
};
function qUnder(p, id) {
  const n = CELLS[id].npc,
    col = NPC_LIGHT[id];
  if (col) {
    const q = p.P(n.x + 14 * (n._wf || 1), n.y + 6, 0),
      fl = STILL ? 1 : 0.9 + 0.1 * Math.sin(T * 6 + n.x);
    p.g.save();
    p.g.globalCompositeOperation = 'lighter';
    p.flat(p.ell(q[0], q[1], 70 * fl, 26 * fl, 24), col);
    p.flat(p.ell(q[0], q[1], 36 * fl, 13 * fl, 20), col);
    p.g.restore();
  }
  if (PROG.bag.length) {
    const g = ITEM_GLOW[PROG.hand];
    if (g) {
      const q = p.P(Pl.x, Pl.y, 0);
      p.g.save();
      p.g.globalCompositeOperation = 'lighter';
      p.flat(p.ell(q[0], q[1], 40, 15, 20), g, 0.16);
      p.g.restore();
    }
  }
  if (QDRAW[id]) QDRAW[id](p);
}
/* ── pétalos y ola de color al despertar una celda; las abejas de Abril ── */
function qOver(p, id) {
  const s = p.s;
  if (WAKE && WAKE.id === id) {
    const u = (T - WAKE.t0) / 1.6;
    if (u >= 1) WAKE = null;
    else {
      const g = p.g,
        c = p.P(0, 0, 0),
        r = u * (R + 60);
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = (1 - u) * 0.5;
      g.strokeStyle = '#FFE6A8';
      g.lineWidth = 24 * s * (1 - u) + 2;
      g.beginPath();
      g.ellipse(c[0], c[1], r * s, r * K * s, 0, 0, TAU);
      g.stroke();
      g.restore();
    }
  }
  for (let i = PETALS.length - 1; i >= 0; i--) {
    const q = PETALS[i],
      u = T - q.t0;
    if (u > 3.2) {
      PETALS.splice(i, 1);
      continue;
    }
    const x = q.x + q.vx * u,
      z = q.z + q.vz * u - u * u * 6;
    if (z < 0) continue;
    const c = p.P(x, q.y, z);
    p.g.save();
    p.g.globalAlpha = Math.min(1, 3.2 - u);
    p.cut(p.leaf(c[0], c[1], q.r + u * 2, 9, 4), q.c, { sh: 0, rough: 0 });
    p.g.restore();
  }
  if (QF().swarm && CLUSTER[3].includes(id) && !STILL)
    for (let k = 0; k < 3; k++) {
      const a = T * 1.7 + k * 2.1;
      miniBee(
        p,
        Pl.x + Math.cos(a) * 38,
        Pl.y + Math.sin(a) * 20,
        70 + Math.sin(T * 3 + k) * 10,
        T,
        Math.cos(a + Math.PI / 2) > 0 ? 1 : -1,
      );
    }
}
/* ── cada fotograma: abejas viajeras, flecha de pista, flores de Luna ── */
let qLast = 0;
function qFrame(s) {
  const dt = Math.min(0.1, Math.max(0, T - qLast));
  qLast = T;
  flowerTick(dt);
  if (window.R3D && R3D.on) {
    if (R3D.over) R3D.over();
    return;
  }
  if (QBEES.length) {
    const p = STYLE.Pen(ctx, camX, camY, s, 'abejas', true);
    for (let i = QBEES.length - 1; i >= 0; i--) {
      const b = QBEES[i];
      if (T < b.t0) continue;
      const q = beePos(b);
      if (!q) {
        QBEES.splice(i, 1);
        continue;
      }
      miniBee(p, q[0], q[1] / 1, q[2], T, q[3], 1.4);
    }
  }
  drawArrow(s);
}
/* ── libro desplegable: la primera vez que entras en una celda, se levanta como una página ── */
const POP = {};
{
  const sm0 = seenMark;
  seenMark = function (id) {
    const F = PROG.F,
      first = !(F.seen && F.seen[id]);
    sm0(id);
    if (first && !inTitle && !FREE && !STILL && id !== 'pri') {
      POP[id] = { t0: T + 0.15 };
      setTimeout(() => Sound.sfx('page'), 200);
    }
  };
}
const easeBack = (u) => {
  const c1 = 1.5,
    c3 = c1 + 1;
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
};
{
  const dc0 = drawCell;
  drawCell = function (id, ox, oy, s, f) {
    const P = POP[id];
    if (P) {
      const u = (T - P.t0) / 0.8;
      if (u >= 1) delete POP[id];
      else {
        const e = Math.max(0.02, easeBack(Math.max(0, u))),
          ay = oy + R * K * s * 0.95;
        ctx.save();
        ctx.translate(ox, ay);
        ctx.scale(1, e);
        ctx.translate(-ox, -ay);
        try {
          dc0(id, ox, oy, s, f);
        } finally {
          ctx.restore();
        }
        return;
      }
    }
    dc0(id, ox, oy, s, f);
  };
}
/* Coral vuelve a ponerse la escafandra si empiezas de cero */
{
  const rg0 = resetGame;
  resetGame = function (sil) {
    const H = HUMANS.oce;
    if (H._helmet) {
      H.head = H._helmet;
      Object.assign(H, { hair: undefined, faceX: HB.oce.faceX, hold: HB.oce.hold, neck: HB.oce.neck, ...VARIANTS.oce[LOOK].o });
      H.head = H._helmet;
    }
    for (const k in AWK) delete AWK[k];
    rg0(sil);
  };
}
setTimeout(wakeCheck, 0);
