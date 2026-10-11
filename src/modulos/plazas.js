/* ══════════ PLAZAS: LOS PUENTES SE CRUZAN ══════════
   En mitad de cada puente largo hay una plazoleta flotante, y las plazoletas cercanas se unen
   entre sí con pasarelas. Así los puentes ya no van solo de un cuarto a otro: se cruzan.
   · Si cruzas un puente a pie, al llegar a su plaza eliges a qué cuarto seguir.
   · Si tocas un cuarto lejano, el viajero elige solo el camino más corto, plazas incluidas.
   Las plazas solo llevan a cuartos a los que ya podrías llegar: no se salta ningún acertijo. */
const PLZ = { nodes: [], edges: [], adj: [], ready: false, n: -1 };
function plazaBuild() {
  if (PLZ.ready && PLZ.n === PATHS.length) return PLZ;
  PLZ.n = PATHS.length;
  PLZ.nodes = PATHS.map((P, i) => ({ i, P, x: (P.p0[0] + P.p1[0]) / 2, y: (P.p0[1] + P.p1[1]) / 2, z: pathZ(P, 0.5) }));
  const N = PLZ.nodes,
    clear = (a, b) => {
      for (const id of ORDER) {
        const c = CW[id],
          dx = b.x - a.x,
          dy = b.y - a.y,
          L2 = dx * dx + dy * dy,
          t = clamp(((c[0] - a.x) * dx + (c[1] - a.y) * dy) / Math.max(1, L2), 0, 1),
          d = Math.hypot(a.x + dx * t - c[0], a.y + dy * t - c[1]);
        if (d < R + TH + 25) return false;
      }
      return true;
    };
  const cand = [];
  for (let i = 0; i < N.length; i++)
    for (let j = i + 1; j < N.length; j++) {
      const d = Math.hypot(N[i].x - N[j].x, N[i].y - N[j].y);
      if (clear(N[i], N[j])) cand.push([i, j, d]);
    }
  cand.sort((a, b) => a[2] - b[2]);
  /* árbol mínimo (todas unidas) + atajos cortos que cierran lazos */
  const par = N.map((_, i) => i),
    f = (i) => (par[i] === i ? i : (par[i] = f(par[i])));
  PLZ.edges = [];
  for (const e of cand) {
    const a = f(e[0]),
      b = f(e[1]);
    if (a !== b) {
      par[a] = b;
      PLZ.edges.push(e);
    }
  }
  const mst = PLZ.edges.length ? PLZ.edges[PLZ.edges.length - 1][2] : 0;
  for (const e of cand) if (!PLZ.edges.includes(e) && e[2] < Math.min(900, mst * 0.75)) PLZ.edges.push(e);
  PLZ.adj = N.map(() => []);
  for (const [a, b, d] of PLZ.edges) {
    PLZ.adj[a].push([b, d]);
    PLZ.adj[b].push([a, d]);
  }
  PLZ.ready = true;
  return PLZ;
}
/* la plaza (nodo) y la puerta larga de un cuarto */
const plazaDoors = (id) => CELLS[id].doors.filter((d) => (d.span || 1) > 1 && PATHS.some((P) => P.key === [id, d.to].sort().join('-')));
const plazaOf = (id, d) => {
  plazaBuild();
  const key = [id, d.to].sort().join('-');
  return PLZ.nodes.findIndex((n) => n.P.key === key);
};
/* camino más corto entre dos plazas (Dijkstra) */
function plazaRoute(s, t) {
  const N = PLZ.nodes.length,
    dist = Array(N).fill(1e9),
    prev = Array(N).fill(-1),
    done = Array(N).fill(false);
  dist[s] = 0;
  for (;;) {
    let u = -1;
    for (let i = 0; i < N; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0 || dist[u] >= 1e9) break;
    done[u] = true;
    if (u === t) break;
    for (const [v, w] of PLZ.adj[u])
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
      }
  }
  if (dist[t] >= 1e9) return null;
  const o = [t];
  while (o[0] !== s) o.unshift(prev[o[0]]);
  return { nodes: o, len: dist[t] };
}
/* cuartos a los que ya se puede llegar por puertas abiertas (las plazas no abren nada nuevo) */
function plazaReach() {
  const seen = new Set([cur]),
    q = [cur];
  while (q.length) {
    const a = q.shift();
    for (const d of CELLS[a].doors) {
      if (!PUZ.open(a, d.to) || seen.has(d.to)) continue;
      seen.add(d.to);
      q.push(d.to);
    }
  }
  return seen;
}
/* destinos que ofrece la plaza de la puerta d del cuarto 'from' */
function plazaChoices(from, d) {
  if (!PUZ.open(from, d.to)) return [];
  plazaBuild();
  const s = plazaOf(from, d);
  if (s < 0) return [];
  const ok = plazaReach(),
    out = [];
  for (const id of ORDER) {
    if (id === from || !ok.has(id)) continue;
    for (const e of plazaDoors(id)) {
      if (!PUZ.open(id, e.to)) continue;
      const t = plazaOf(id, e);
      if (t < 0) continue;
      const r = s === t ? { nodes: [s], len: 0 } : plazaRoute(s, t);
      if (!r) continue;
      if (!out.some((o) => o.to === id && o.len <= r.len)) out.push({ to: id, door: e, len: r.len, route: r.nodes });
    }
  }
  out.sort((a, b) => (a.to === d.to ? -1 : b.to === d.to ? 1 : a.len - b.len));
  const best = {};
  for (const o of out) if (!best[o.to] || best[o.to].len > o.len) best[o.to] = o;
  return Object.values(best).sort((a, b) => (a.to === d.to ? -1 : b.to === d.to ? 1 : a.len - b.len));
}

/* ── el recorrido compuesto: cuarto → medio puente → plazas → medio puente → cuarto ── */
function plazaPlan(from, d, to, e, route, a, b) {
  const P0 = PATHS.find((P) => P.key === [from, d.to].sort().join('-')),
    P1 = PATHS.find((P) => P.key === [to, e.to].sort().join('-'));
  const sOut = P0.a === from ? P0.p0 : P0.p1,
    eOut = P1.a === to ? P1.p0 : P1.p1,
    t0 = P0.a === from ? 0 : 1,
    t1 = P1.a === to ? 0 : 1;
  const seg = [];
  const N = PLZ.nodes,
    add = (k, x0, y0, x1, y1, o = {}) => seg.push({ k, x0, y0, x1, y1, L: Math.max(1, Math.hypot(x1 - x0, y1 - y0)), ...o });
  add('room', a[0], a[1], sOut[0], sOut[1]);
  const m0 = N[route[0]];
  add('half', sOut[0], sOut[1], m0.x, m0.y, { P: P0, ta: t0, tb: 0.5 });
  for (let i = 1; i < route.length; i++) {
    const p = N[route[i - 1]],
      q = N[route[i]];
    add('walk', p.x, p.y, q.x, q.y, { za: p.z, zb: q.z, plaza: i === 1 ? route[0] : -1 });
  }
  const m1 = N[route[route.length - 1]];
  add('half', m1.x, m1.y, eOut[0], eOut[1], { P: P1, ta: 0.5, tb: t1 });
  add('room', eOut[0], eOut[1], b[0], b[1]);
  /* tiempo: a pie dentro del cuarto y en los medios puentes; en las pasarelas el paso es más largo */
  let L = 0,
    D = 0;
  for (const s of seg) {
    s.c0 = L;
    s.d0 = D;
    L += s.L;
    s.d = s.L / (s.k === 'walk' ? Math.min(520, 240 + s.L * 0.12) : s.k === 'half' ? 150 : 170);
    D += s.d;
  }
  return { seg, L, dur: Math.max(1, D), hub: seg[1].c0 + seg[1].L, hubT: seg[1].d0 + seg[1].d };
}
function plazaAt(pl, tm) {
  let s = pl.seg[pl.seg.length - 1];
  for (const q of pl.seg)
    if (tm <= q.d0 + q.d) {
      s = q;
      break;
    }
  const u = sm01(clamp((tm - s.d0) / s.d, 0, 1)) * 0.2 + clamp((tm - s.d0) / s.d, 0, 1) * 0.8,
    x = lerp(s.x0, s.x1, u),
    y = lerp(s.y0, s.y1, u);
  let z = 0;
  if (s.k === 'half') z = pathZ(s.P, lerp(s.ta, s.tb, u));
  else if (s.k === 'walk') z = lerp(s.za, s.zb, u) - 10 * Math.sin(Math.PI * u);
  return { x, y, z, on: s.k !== 'room', dx: s.x1 - s.x0 };
}
/* un paso del cruce (lo llama el bucle del juego) */
function plazaStep(cr) {
  const pl = cr.comp;
  if (cr.hold) {
    Pl.moving = false;
    return false;
  }
  let tm = cr.t;
  if (cr.choose && !cr.chosen && tm >= pl.hubT) {
    cr.t = tm = pl.hubT;
    cr.hold = true;
    plazaAsk(cr);
  }
  const q = plazaAt(pl, tm);
  Pl.x = q.x - CW[cur][0];
  Pl.y = q.y - CW[cur][1];
  Pl.z = q.z;
  Pl.onPath = q.on;
  if (Math.abs(q.dx) > 2) Pl.f = q.dx > 0 ? 1 : -1;
  Pl.moving = !cr.hold;
  if (q.on && !STILL && !window.BSTEP) {
    const k = Math.floor(cr.t * 2.6);
    if (k !== cr.creak) {
      cr.creak = k;
      Sound.sfx('plank', 0.25);
    }
  }
  return tm >= pl.dur - 0.001;
}
/* entrar en otro cuarto a mitad de camino (lo mismo que hace cross al empezar) */
function plazaEnter(to) {
  if (cur === to) return;
  cur = to;
  if (!baked(cur)) bakeCell(cur);
  {
    const keep = new Set([cur, ...CELLS[cur].doors.map((d) => d.to)]);
    for (const k in BAKED) if (!keep.has(k)) delete BAKED[k];
  }
  closeTalk();
  Pl.route = null;
  STYLE.tag(CELLS[cur]);
  seenMark(to);
  idleAcc = 0;
  narrate([NARR.enter[to]], 'enter:' + to, { delay: 0.8 });
  FLY.length = 0;
  PUFF.length = 0;
  if (PUZ.want(to)) EMO[to] = { ch: '!', t0: T + 0.6 };
  save();
}
function plazaCross(d, to, choose) {
  const from = cur,
    opts = plazaChoices(from, d),
    o = opts.find((x) => x.to === to);
  if (!o) return false;
  if (!DARK[from] || DARK[from].key !== darkKey(from)) bakeDark(from);
  const a = [CW[from][0] + Pl.x, CW[from][1] + Pl.y],
    arr = [o.door.mid[0] + o.door.n[0] * 46, o.door.mid[1] + o.door.n[1] * 46],
    b = [CW[to][0] + arr[0], CW[to][1] + arr[1]];
  const comp = plazaPlan(from, d, to, o.door, o.route, a, b);
  plazaEnter(to);
  crossing = { from, a, b, t: 0, long: true, plan: null, comp, dur: comp.dur, choose: !!choose && opts.length > 1, d, opts };
  ZKhold = { v: 0.96, until: T + comp.dur - 0.5 };
  Pl.x = a[0] - CW[cur][0];
  Pl.y = a[1] - CW[cur][1];
  note(_t('Plaza de los puentes'));
  return true;
}
/* en la plaza: ¿a dónde sigues? */
let plzEl = null;
function plazaAsk(cr) {
  if (!plzEl) {
    plzEl = document.createElement('div');
    plzEl.id = 'plaza';
    plzEl.className = 'plaza shadow';
    plzEl.setAttribute('role', 'dialog');
    plzEl.setAttribute('aria-label', _t('Plaza de los puentes'));
    document.getElementById('stage').appendChild(plzEl);
    const st = document.createElement('style');
    st.textContent =
      '.plaza{position:absolute;left:50%;bottom:calc(96px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:4;max-width:calc(100% - 24px)}.plaza .p{display:flex;flex-direction:column;gap:8px;padding:14px 18px;align-items:stretch}.plaza b{font-weight:600;font-size:17px;text-align:center}.plaza small{display:block;text-align:center;font-size:12.5px;color:#8A5A2E}.plaza .opts{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.plaza button{font:inherit;font-size:15px;padding:8px 14px;min-height:42px;border:0;border-radius:6px;background:#F3E3BE;color:var(--ink);cursor:pointer;box-shadow:0 2px 0 #D9B77A}.plaza button.main{background:var(--honey);font-weight:600;box-shadow:0 2px 0 #B8782C}.plaza button:hover,.plaza button:focus-visible{background:#F8D98E;outline:none}';
    document.head.appendChild(st);
  }
  const nm = (id) => _t((typeof SEASON !== 'undefined' && SEASON[id] && SEASON[id].name) || CELLS[id].name || id);
  plzEl.innerHTML = '';
  const p = document.createElement('div');
  p.className = 'p paper torn';
  const t = document.createElement('b');
  t.textContent = _t('Plaza de los puentes');
  const s = document.createElement('small');
  s.textContent = _t('¿A qué cuarto sigues?');
  const box = document.createElement('div');
  box.className = 'opts';
  cr.opts.slice(0, 8).forEach((o, i) => {
    const bt = document.createElement('button');
    bt.textContent = nm(o.to);
    if (i === 0) bt.className = 'main';
    bt.addEventListener('click', () => plazaPick(cr, o));
    box.appendChild(bt);
  });
  p.append(t, s, box);
  plzEl.appendChild(p);
  plzEl.hidden = false;
  Sound.sfx('door');
  setTimeout(() => {
    const b = plzEl.querySelector('button');
    if (b) b.focus();
  }, 50);
}
function plazaPick(cr, o) {
  if (crossing !== cr) return;
  plzEl.hidden = true;
  cr.chosen = true;
  cr.hold = false;
  if (o.to !== cur) {
    const here = PLZ.nodes[plazaOf(cr.from, cr.d)],
      arr = [o.door.mid[0] + o.door.n[0] * 46, o.door.mid[1] + o.door.n[1] * 46],
      b = [CW[o.to][0] + arr[0], CW[o.to][1] + arr[1]];
    const comp = plazaPlan(cr.from, cr.d, o.to, o.door, o.route, cr.a, b);
    plazaEnter(o.to);
    cr.comp = comp;
    cr.b = b;
    cr.dur = comp.dur;
    cr.t = comp.hubT;
    ZKhold = { v: 0.96, until: T + comp.dur - cr.t };
  }
}
/* teclado: Esc sigue el camino de siempre; 1-8 eligen */
addEventListener('keydown', (e) => {
  if (!plzEl || plzEl.hidden || !crossing || !crossing.hold) return;
  const k = parseInt(e.key);
  if (e.key === 'Escape' || e.key === 'Enter') {
    plazaPick(crossing, crossing.opts[0]);
    e.preventDefault();
  } else if (k >= 1 && k <= crossing.opts.length) {
    plazaPick(crossing, crossing.opts[k - 1]);
    e.preventDefault();
  }
});

/* ── el juego usa las plazas: al cruzar a pie y al buscar el camino más corto ── */
{
  const cross0 = cross;
  cross = function (d) {
    if (crossing) return;
    if ((d.span || 1) > 1 && !inTitle) {
      const hop = Pl.hop && Pl.hop.door === d ? Pl.hop.to : null;
      Pl.hop = null;
      if (hop && hop !== d.to && plazaCross(d, hop, false)) return;
      if (!hop && !Pl.goal && plazaChoices(cur, d).length > 1 && plazaCross(d, d.to, !!window.PLAZA_ALWAYS)) return;
    }
    Pl.hop = null;
    return cross0(d);
  };
  const toward0 = doorToward;
  doorToward = function (id) {
    const d0 = toward0(id);
    if (!d0 || id === cur) return d0;
    /* Dijkstra por cuartos: puertas (coste por distancia) y plazas */
    plazaBuild();
    const ok = plazaReach();
    if (!ok.has(id)) return d0;
    const dist = {},
      prev = {},
      Q = new Set(ok);
    for (const k of ok) dist[k] = 1e9;
    dist[cur] = 0;
    while (Q.size) {
      let u = null;
      for (const k of Q) if (u === null || dist[k] < dist[u]) u = k;
      Q.delete(u);
      if (u === id || dist[u] >= 1e9) break;
      for (const d of CELLS[u].doors) {
        if (!PUZ.open(u, d.to) || !ok.has(d.to)) continue;
        const w = Math.hypot(CW[d.to][0] - CW[u][0], CW[d.to][1] - CW[u][1]);
        if (dist[u] + w < dist[d.to]) {
          dist[d.to] = dist[u] + w;
          prev[d.to] = { u, d, to: d.to };
        }
      }
      for (const d of plazaDoors(u)) {
        if (!PUZ.open(u, d.to)) continue;
        for (const o of plazaChoices(u, d)) {
          if (o.to === d.to) continue;
          const w = o.len + R * 1.6;
          if (dist[u] + w < dist[o.to]) {
            dist[o.to] = dist[u] + w;
            prev[o.to] = { u, d, to: o.to };
          }
        }
      }
    }
    if (!(id in prev)) return d0;
    let n = id;
    while (prev[n].u !== cur) n = prev[n].u;
    const st = prev[n];
    Pl.hop = { door: st.d, to: st.to };
    return st.d;
  };
}

/* ── en 3D: plazoletas de madera con farolillos y pasarelas que se cruzan ── */
let PLZ3 = null;
function plaza3Tick() {
  if (!window.R3D || !R3D.on || !R3D.scene || !PATHS.length || !window.LP3D) return;
  plazaBuild();
  if (PLZ3 && PLZ3.n === PLZ.n) return;
  if (PLZ3) R3D.scene.remove(PLZ3.g);
  const { Bk, CYL, BOX, glowSprite } = LP3D.kit,
    T3 = THREE,
    g = new T3.Group(),
    B = new Bk(),
    Bf = new Bk(),
    N = PLZ.nodes;
  const hy = (n) => (R3D.lift(n.P.a) + R3D.lift(n.P.b)) / 2 + n.z;
  for (const n of N) {
    const y = hy(n);
    B.add(CYL(62, 54, 10, 6), '#B8823E', [n.x, y - 5, n.y], [0, Math.PI / 2, 0]);
    B.add(CYL(60, 60, 1.6, 6), '#E0B35E', [n.x, y + 0.6, n.y], [0, Math.PI / 2, 0]);
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3,
        px = n.x + Math.cos(a) * 58,
        pz = n.y + Math.sin(a) * 58;
      B.add(CYL(2, 2.4, 22, 5), '#7A5232', [px, y + 11, pz]);
    }
    for (const s of [-1, 1]) {
      const px = n.x + s * 40,
        pz = n.y - 30;
      B.add(CYL(1.8, 1.8, 46, 5), '#5A3A22', [px, y + 23, pz]);
      B.add(BOX(9, 11, 9), '#5A3A22', [px, y + 50, pz]);
      const sp = glowSprite('#FFD36A', 46);
      sp.material.opacity = 0.45;
      sp.position.set(px, y + 50, pz);
      g.add(sp);
      const core = new T3.Mesh(new T3.SphereGeometry(3.4, 8, 6), new T3.MeshBasicMaterial({ color: '#FFE3A0' }));
      core.position.set(px, y + 50, pz);
      g.add(core);
    }
  }
  for (const [i, j] of PLZ.edges) {
    const a = N[i],
      b = N[j],
      ya = hy(a),
      yb = hy(b),
      dx = b.x - a.x,
      dz = b.y - a.y,
      L = Math.hypot(dx, dz),
      ux = dx / L,
      uz = dz / L,
      ang = Math.atan2(-uz, ux),
      m = Math.max(4, Math.round((L - 110) / 15));
    for (let k = 0; k <= m; k++) {
      const t = (55 + (k * (L - 110)) / m) / L,
        x = a.x + dx * t,
        z = a.y + dz * t,
        y = lerp(ya, yb, t) - 10 * Math.sin(Math.PI * t);
      B.add(BOX(11, 2.6, 30), k % 2 ? '#C9924E' : '#B57E3E', [x, y - 1.3, z], [0, ang, 0]);
    }
    for (const s of [-1, 1]) {
      const steps = 10;
      for (let k = 0; k < steps; k++) {
        const t0 = 0.08 + (k * 0.84) / steps,
          t1 = t0 + 0.84 / steps,
          p = (t) => [a.x + dx * t - uz * s * 17, lerp(ya, yb, t) - 10 * Math.sin(Math.PI * t) + 16, a.y + dz * t + ux * s * 17],
          P0 = p(t0),
          P1 = p(t1),
          cx = (P0[0] + P1[0]) / 2,
          cy = (P0[1] + P1[1]) / 2,
          cz = (P0[2] + P1[2]) / 2,
          l = Math.hypot(P1[0] - P0[0], P1[1] - P0[1], P1[2] - P0[2]);
        Bf.add(BOX(l, 1.6, 1.6), '#8A6A4A', [cx, cy, cz], [0, ang, Math.atan2(P1[1] - P0[1], Math.hypot(P1[0] - P0[0], P1[2] - P0[2]))]);
        Bf.add(CYL(1.3, 1.3, 16, 4), '#7A5232', [P0[0], P0[1] - 8, P0[2]]);
      }
    }
  }
  B.mesh(g);
  Bf.mesh(g);
  R3D.scene.add(g);
  PLZ3 = { g, n: PLZ.n };
}
if (window.R3DX) R3DX.push(() => plaza3Tick());
