/* ══════════ VIDA · los vecinos se mueven por su cuarto ══════════
   Cada vecino pasea entre su sitio y dos o tres rincones libres, se para a hacer
   lo suyo (levanta lo que lleva en la mano), saluda cuando entras, se gira hacia ti
   y asiente mientras habla. Los que están sentados o tumbados no pasean. */
const NPCS = {};
let lifeCur = null;
const HUM = (id) => (typeof HUMANS !== 'undefined' ? HUMANS[id] : null);
function npcSpotOK(c, x, y, n) {
  if (!inHex(x, y * 1.02, R - 46)) return false;
  for (const [sx, sy, sr] of c.solids) {
    if (Math.hypot(sx - n.hx, sy - n.hy) < 6) continue;
    if (Math.hypot(x - sx, (y - sy) * 1.15) < sr + 24) return false;
  }
  for (const d of c.doors) if (Math.hypot(x - d.trig[0], y - d.trig[1]) < 95) return false;
  for (const t of PUZ.things[c.id] || [])
    if (Math.hypot(x - (t.ax ?? t.x), y - (t.ay ?? t.y)) < 65 || Math.hypot(x - t.x, y - t.y) < 60) return false;
  for (const k in BRIDGES) {
    const b = BRIDGES[k];
    if (b.cell === c.id && Math.hypot(x - b.x, y - b.y) < 70) return false;
  }
  return true;
}
function npcLineOK(c, a, b, n) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]),
    m = Math.ceil(L / 8);
  for (let k = 2; k <= m; k++) {
    const t = k / m;
    if (!npcSpotOK(c, lerp(a[0], b[0], t), lerp(a[1], b[1], t), n)) return false;
  }
  return true;
}
function npcInit(id) {
  const c = CELLS[id],
    n = c.npc,
    H = HUM(id);
  if (n.hx == null) {
    n.hx = n.x;
    n.hy = n.y;
  }
  const still = !H || H.pose === 'sit' || H.pose === 'lie' || n.turn === false || id === 'cor' || id === 'ver' || id === 'inv';
  const st = {
    spots: [],
    mode: 'wait',
    t: 1.2 + Math.random() * 2,
    at: -1,
    still,
    use: 0,
    wave: 0,
    nod: 0,
    mv: 0,
    ph: 0,
    greet: false,
    sol: c.solids.findIndex((q) => Math.hypot(q[0] - n.hx, q[1] - n.hy) < 6),
  };
  if (!still) {
    const home = [n.hx, n.hy];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * TAU,
        r = [70, 100, 130][k % 3],
        x = n.hx + Math.cos(a) * r,
        y = n.hy + Math.sin(a) * r * 0.8;
      if (!npcSpotOK(c, x, y, n) || !npcLineOK(c, home, [x, y], n)) continue;
      if (!free(x + (n.tx ?? 45), y + (n.ty ?? 40))) continue;
      if (st.spots.every((q) => Math.hypot(q[0] - x, q[1] - y) > 70)) st.spots.push([x, y]);
    }
    st.spots = st.spots.slice(0, 3);
  }
  return (NPCS[id] = st);
}
/* al salir de un cuarto, su vecino vuelve a su sitio (así se ve bien en el mapa) */
function npcPark(id) {
  const n = CELLS[id].npc,
    st = NPCS[id],
    H = HUM(id);
  if (n.hx != null) {
    n.x = n.hx;
    n.y = n.hy;
  }
  n._walk = false;
  if (H) {
    H._mv = 0;
    H._wave = 0;
    H._use = 0;
    H._nod = 0;
  }
  if (st && st.sol >= 0) {
    const q = CELLS[id].solids[st.sol];
    q[0] = n.hx;
    q[1] = n.hy;
    delete GRIDS[id];
  }
  if (st) {
    st.mode = 'wait';
    st.t = 1.5;
    st.at = -1;
  }
}
function npcTick(dt) {
  if (inTitle) return;
  const id = cur,
    c = CELLS[id],
    n = c.npc,
    H = HUM(id);
  if (lifeCur !== id) {
    if (lifeCur) npcPark(lifeCur);
    lifeCur = id;
    const st0 = NPCS[id] || npcInit(id);
    st0.greet = false;
  }
  const st = NPCS[id];
  if (!st) return;
  const d = Math.hypot(Pl.x - n.x, Pl.y - n.y),
    busy = talking || d < 120 || (Pl.route && Pl.route.npc) || crossing;
  /* saludo la primera vez que te ve al entrar */
  if (!st.greet && !crossing && d < 330) {
    st.greet = true;
    st.wave = 1.8;
  }
  st.wave = Math.max(0, st.wave - dt);
  st.use = Math.max(0, st.use - dt);
  st.nod = lerp(st.nod, talking ? 1 : 0, Math.min(1, dt * 6));
  if (!st.still) {
    if (st.mode === 'walk' && !busy) {
      const tg = st.tg,
        ex = tg[0] - n.x,
        ey = tg[1] - n.y,
        L = Math.hypot(ex, ey),
        sp = 40 * dt;
      if (L <= sp) {
        n.x = tg[0];
        n.y = tg[1];
        st.mode = 'wait';
        st.t = 2.5 + Math.random() * 3.5;
        st.use = Math.random() < 0.7 ? 1.3 : 0;
        n._walk = false;
        if (st.sol >= 0) {
          const q = c.solids[st.sol];
          q[0] = n.x;
          q[1] = n.y;
          delete GRIDS[id];
        }
      } else {
        n.x += (ex / L) * sp;
        n.y += (ey / L) * sp;
        n._walk = true;
        n._wf = ex > 0 ? 1 : -1;
        st.ph += dt * 9;
      }
    } else if (st.mode === 'walk' && busy) {
      n._walk = false;
    } else if (st.mode === 'wait') {
      n._walk = false;
      if (!busy) st.t -= dt;
      if (st.t <= 0 && st.spots.length) {
        const home = st.at >= 0;
        if (home) {
          st.tg = [n.hx, n.hy];
          st.at = -1;
        } else {
          st.at = Math.floor(Math.random() * st.spots.length);
          st.tg = st.spots[st.at];
        }
        st.mode = 'walk';
        if (st.sol >= 0) {
          const q = c.solids[st.sol];
          q[0] = -9999;
          q[1] = -9999;
          delete GRIDS[id];
        }
      } else if (st.t <= 0) {
        st.t = 3 + Math.random() * 3;
        if (Math.random() < 0.5) st.use = 1.3;
        else {
          st.look = 1.6;
        }
      }
    }
    st.look = Math.max(0, (st.look || 0) - dt);
    n._walk = n._walk || false;
    if (st.look > 0 && !busy) {
      n._walk = false;
      n._lookF = Math.sin(st.look * 4) > 0 ? 1 : -1;
    } else n._lookF = 0;
  } else if (!busy) {
    st.t -= dt;
    if (st.t <= 0) {
      st.t = 4 + Math.random() * 4;
      st.use = 1.3;
    }
  }
  st.mv = lerp(st.mv, n._walk ? 1 : 0, Math.min(1, dt * 8));
  if (H) {
    H._mv = st.mv;
    H._ph = st.ph;
    H._wave = Math.min(1, st.wave / 0.4) * Math.min(1, (1.8 - st.wave) / 0.3 + 0.0001);
    H._use = Math.sin(Math.PI * clamp(st.use / 1.3, 0, 1));
    H._nod = st.nod;
  }
}
