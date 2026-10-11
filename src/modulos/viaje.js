/* ══════════ VIAJE: LOS PUENTES COBRAN VIDA ══════════
   1 · Puente vivo: tablones de cera se despliegan delante del chico, se hunden bajo sus pies y se pliegan detrás.
   2 · Cámara de viaje (en render3d: se eleva, mira de lado y adelanta hacia donde vas).
   3 · Cesta de las abejas: si el viaje cambia de piso, un enjambre te sube o te baja en una cesta.
   4 · Llegada de libro desplegable: el cuarto de destino espera plegado y se levanta al llegar.
   5 · Pasos al compás de la música, con el sonido del material de cada zona.
   6 · Cada zona tiñe los tablones y suelta sus propias partículas (nieve, burbujas, arena, pétalos…).
   7 · A veces un vecino cruza en sentido contrario y saluda.
   Nada de esto detiene el viaje: «Saltar» y el viaje rápido siguen igual. */
const VIAJE = (() => {
  const THEME = {
    inv: 'hie',
    ant: 'hie',
    oce: 'cor',
    des: 'are',
    inn: 'sue',
    far: 'sue',
    tre: 'sue',
    tea: 'sue',
    esp: 'sue',
    dsv: 'mem',
    est: 'mem',
    ret: 'mem',
    jar: 'mem',
    sot: 'rai',
    cue: 'rai',
    vol: 'rai',
    cum: 'rai',
    cor: 'cora',
    and: 'aba',
    eco: 'aba',
    per: 'aba',
    api: 'aba',
    rev: 'aba',
  };
  const themeOf = (id) => THEME[id] || 'mad';
  const TCOL = {
    mad: '#E8B85A',
    hie: '#CFEAF5',
    cor: '#F2A08E',
    are: '#E8CF98',
    sue: '#CDBDF2',
    mem: '#F0B7B0',
    rai: '#D9944A',
    cora: '#FFE08A',
    aba: '#A69CC4',
  };
  const PCOL = {
    mad: '#FFE08A',
    hie: '#FFFFFF',
    cor: '#CFF2FF',
    are: '#F1DDA8',
    sue: '#E9DDFF',
    mem: '#FFC9D2',
    rai: '#FFB25A',
    cora: '#FFE9A8',
    aba: '#E6E0F0',
  };
  const FALL = { hie: 1, are: 1, mem: 1, aba: 1 };
  const floorOf = (id) => {
    try {
      return PISO[GRUPO[id]] ?? 0;
    } catch (e) {
      return 0;
    }
  };
  const sm = (u) => u * u * (3 - 2 * u);
  const V = { cr: null, on: false, tiles: null, parts: [], pi: 0, basket: null, enc: null, fold: null, beat: -1, ph: 0, npcM: {} };

  /* dónde está el viajero en el instante t del viaje (coordenadas 3D) */
  function tpos(cr, t) {
    t = clamp(t, 0, cr.dur);
    let q;
    try {
      if (cr.comp) q = plazaAt(cr.comp, t);
      else if (cr.plan) q = crossAt({ plan: cr.plan, t, a: cr.a, b: cr.b });
    } catch (e) {
      q = null;
    }
    if (!q) {
      const u = clamp(t / Math.max(0.01, cr.dur), 0, 1);
      q = { x: lerp(cr.a[0], cr.b[0], u), y: lerp(cr.a[1], cr.b[1], u), z: 0, on: false };
    }
    const L = lerp(R3D.lift(cr.from), R3D.lift(cur), clamp(t / Math.max(0.01, cr.dur), 0, 1));
    return { x: q.x, y: (q.z || 0) + L, z: q.y, on: !!q.on && !q.ride };
  }
  /* puntos del camino cada 'gap' unidades, hacia delante (dir=1) o hacia atrás (dir=-1) */
  function march(cr, dir, n, gap) {
    const out = [];
    let t = cr.t,
      p = tpos(cr, t),
      acc = 0,
      guard = 0;
    const dt = 0.012;
    while (out.length < n && guard++ < 600) {
      const t2 = t + dir * dt;
      if (t2 < 0 || t2 > cr.dur) break;
      const p2 = tpos(cr, t2);
      acc += Math.hypot(p2.x - p.x, p2.z - p.z);
      if (acc >= gap) {
        acc = 0;
        out.push({ ...p2, t: t2, dx: (p2.x - p.x) * dir, dz: (p2.z - p.z) * dir });
      }
      t = t2;
      p = p2;
    }
    return out;
  }

  function ensure() {
    if (V.on) return true;
    if (!window.R3D || !R3D.on || !R3D.scene || !window.LP3D || typeof THREE === 'undefined') return false;
    const sc = R3D.scene;
    const geo = new THREE.BoxGeometry(14, 2.6, 34),
      mat = new THREE.MeshLambertMaterial({ color: '#FFFFFF', emissive: '#4A2E08' });
    V.tiles = new THREE.InstancedMesh(geo, mat, 22);
    V.tiles.frustumCulled = false;
    V.tiles.count = 0;
    V.tiles.renderOrder = 2;
    for (let i = 0; i < 22; i++) V.tiles.setColorAt(i, new THREE.Color('#E8B85A'));
    sc.add(V.tiles);
    for (let i = 0; i < 40; i++) {
      const sp = LP3D.glowSprite('#FFE08A', 7);
      sp.visible = false;
      sp.material.opacity = 0;
      sc.add(sp);
      V.parts.push({ sp, life: 0, vx: 0, vy: 0, vz: 0 });
    }
    V.on = true;
    return true;
  }

  /* ── 1 y 6 · los tablones vivos ── */
  const O = typeof THREE !== 'undefined' ? new THREE.Object3D() : null,
    COL = typeof THREE !== 'undefined' ? new THREE.Color() : null,
    CA = typeof THREE !== 'undefined' ? new THREE.Color() : null;
  function tilesTick(cr) {
    const M = V.tiles;
    if (!cr || (STILL && false)) {
      M.count = 0;
      return;
    }
    const ahead = march(cr, 1, 14, 17),
      behind = march(cr, -1, 7, 17),
      here = tpos(cr, cr.t),
      all = [
        ...behind.map((p, i) => ({ ...p, s: -(i + 1) * 17 })),
        { ...here, s: 0, dx: (ahead[0] || here).x - here.x, dz: (ahead[0] || here).z - here.z },
        ...ahead.map((p, i) => ({ ...p, s: (i + 1) * 17 })),
      ];
    const step = Math.abs(Math.sin(V.ph));
    let n = 0;
    const t0 = themeOf(cr.from),
      t1 = themeOf(cur);
    for (const p of all) {
      if (!p.on || n >= 22) continue;
      const L = Math.hypot(p.dx, p.dz) || 1,
        ux = p.dx / L,
        uz = p.dz / L,
        ang = Math.atan2(-uz, ux);
      let y = p.y + 1.4,
        sc = 1,
        fold = 0;
      if (p.s > 0) {
        const a = clamp(1 - (p.s - 55) / 170, 0, 1),
          e = sm(a);
        y -= (1 - e) * 26;
        sc = 0.25 + 0.75 * e;
        fold = (1 - e) * 0.9;
      } else if (p.s < 0) {
        const f = clamp(-p.s / 133, 0, 1);
        fold = -f * 1.5;
        y += f * 9;
        sc = 1 - f * 0.85;
      }
      y -= 2.4 * Math.exp(-((p.s / 22) ** 2)) * (0.55 + 0.45 * step);
      O.position.set(p.x, y, p.z);
      O.rotation.set(0, ang, fold, 'YZX');
      O.scale.set(sc, sc, sc);
      O.updateMatrix();
      M.setMatrixAt(n, O.matrix);
      const u = sm(clamp(p.t / Math.max(0.01, cr.dur), 0, 1));
      COL.set(TCOL[t0]);
      CA.set(TCOL[t1]);
      COL.lerp(CA, u);
      M.setColorAt(n, COL);
      n++;
    }
    M.count = n;
    M.instanceMatrix.needsUpdate = true;
    if (M.instanceColor) M.instanceColor.needsUpdate = true;
  }

  /* partículas de cada zona al pisar */
  function puff(p, theme) {
    for (let k = 0; k < 2; k++) {
      const P = V.parts[V.pi++ % V.parts.length];
      P.sp.material.color.set(PCOL[theme]);
      P.sp.position.set(p.x + (Math.random() - 0.5) * 14, p.y + 3, p.z + (Math.random() - 0.5) * 14);
      const fall = FALL[theme];
      P.vx = (Math.random() - 0.5) * 16;
      P.vz = (Math.random() - 0.5) * 16;
      P.vy = fall ? -(6 + Math.random() * 10) : 10 + Math.random() * 16;
      if (fall) P.sp.position.y += 26;
      P.life = 1;
      P.sp.visible = true;
      P.sp.scale.setScalar(theme === 'cor' ? 6 : 4.5);
    }
  }
  function partsTick(dt) {
    for (const P of V.parts) {
      if (P.life <= 0) {
        if (P.sp.visible) {
          P.sp.visible = false;
        }
        continue;
      }
      P.life -= dt / 1.3;
      P.sp.position.x += P.vx * dt;
      P.sp.position.y += P.vy * dt;
      P.sp.position.z += P.vz * dt;
      P.sp.material.opacity = Math.max(0, P.life) * 0.75;
    }
  }

  /* ── 5 · pasos al compás ── */
  function stepsTick(cr) {
    const q = tpos(cr, cr.t);
    if (!q.on || cr.hold) {
      V.beat = -1;
      return;
    }
    const bpm = (window.MUSBPM && MUSBPM(cur)) || 84,
      beat = 60 / bpm / 2,
      b = Math.floor(T / beat);
    if (b === V.beat) return;
    V.beat = b;
    const u = clamp(cr.t / Math.max(0.01, cr.dur), 0, 1),
      th = u < 0.5 ? themeOf(cr.from) : themeOf(cur);
    if (!cr.basket) Sound.sfx('bstep', th);
    else if (b % 2 === 0) Sound.sfx('hop', 1);
    if (V.on && !STILL) puff(q, th);
  }

  /* ── 3 · la cesta de las abejas ── */
  function basketBuild() {
    const g = new THREE.Group(),
      wick = new THREE.MeshLambertMaterial({ color: '#B07A3E', side: THREE.DoubleSide }),
      dark = new THREE.MeshLambertMaterial({ color: '#7A4E24', side: THREE.DoubleSide });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(15, 11, 15, 12, 1, true), wick);
    body.position.y = 6.5;
    g.add(body);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(15.8, 15.8, 2.2, 12, 1, true), dark);
    rim.position.y = 14;
    g.add(rim);
    const bot = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 1.2, 12), dark);
    bot.position.y = -0.6;
    g.add(bot);
    for (let k = 0; k < 3; k++) {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(12.4 + k * 1.3, 12.4 + k * 1.3, 0.9, 12, 1, true), dark);
      band.position.y = 2 + k * 4;
      g.add(band);
    }
    const apex = new THREE.Vector3(0, 92, 0),
      rmat = new THREE.MeshBasicMaterial({ color: '#6A4A2A' });
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4,
        from = new THREE.Vector3(Math.cos(a) * 15, 14, Math.sin(a) * 15),
        d = apex.clone().sub(from),
        len = d.length();
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, len, 4), rmat);
      r.position.copy(from).addScaledVector(d, 0.5);
      r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      g.add(r);
    }
    const bees = [],
      bm = new THREE.MeshBasicMaterial({ color: '#F2C14E' }),
      bk = new THREE.MeshBasicMaterial({ color: '#3A2A10' }),
      wm = new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.7 });
    for (let k = 0; k < 18; k++) {
      const b = new THREE.Group(),
        s = new THREE.Mesh(new THREE.SphereGeometry(2.1, 6, 4), k % 3 ? bm : bk);
      s.scale.set(1.3, 1, 1);
      b.add(s);
      for (const sd of [-1, 1]) {
        const w = new THREE.Mesh(new THREE.SphereGeometry(1.5, 5, 3), wm);
        w.scale.set(0.7, 0.2, 1.3);
        w.position.set(0, 1.6, sd * 1.6);
        b.add(w);
        b.userData['w' + sd] = w;
      }
      b.userData.ph = Math.random() * TAU;
      b.userData.r = 6 + Math.random() * 12;
      b.userData.h = Math.random() * 14 - 4;
      g.add(b);
      bees.push(b);
    }
    const glow = LP3D.glowSprite('#FFE08A', 60);
    glow.material.opacity = 0.35;
    glow.position.copy(apex);
    g.add(glow);
    g.visible = false;
    R3D.scene.add(g);
    return { g, bees, apex };
  }
  function basketTick(cr) {
    if (!cr || !cr.basket) {
      if (V.basket) V.basket.g.visible = false;
      return;
    }
    if (!V.basket) V.basket = basketBuild();
    const B = V.basket,
      q = tpos(cr, cr.t),
      w = R3D.worldOf(cur, Pl.x, Pl.y, Pl.z || 0),
      y = w.y + (lerp(R3D.lift(cr.from), R3D.lift(cur), clamp(cr.t / Math.max(0.01, cr.dur), 0, 1)) - R3D.lift(cur));
    const u = clamp(cr.t / Math.max(0.01, cr.dur), 0, 1),
      show = sm(clamp(u * 6, 0, 1)) * sm(clamp((1 - u) * 6, 0, 1));
    B.g.visible = show > 0.02;
    B.g.position.set(w.x, y - 1 + (STILL ? 0 : Math.sin(T * 3) * 1.6), w.z);
    B.g.scale.setScalar((0.4 + 0.6 * show) * 1.75);
    B.g.rotation.y = STILL ? 0 : Math.sin(T * 0.8) * 0.25;
    for (const b of B.bees) {
      const d = b.userData,
        a = d.ph + (STILL ? 0 : T * 2.4);
      b.position.set(B.apex.x + Math.cos(a) * d.r, B.apex.y + d.h + (STILL ? 0 : Math.sin(T * 7 + d.ph) * 2), B.apex.z + Math.sin(a) * d.r);
      b.rotation.y = -a;
      const f = STILL ? 0 : Math.sin(T * 60 + d.ph) * 0.6;
      b.userData.w1.rotation.x = f;
      b.userData['w-1'].rotation.x = -f;
    }
  }

  /* ── 7 · un vecino que cruza en sentido contrario ── */
  function npcModel(id) {
    if (id in V.npcM) return V.npcM[id];
    let m = null;
    try {
      const H = HUMANS[id];
      if (H) {
        m = LP3D.human(LP3D.fromHuman(id, H));
        if (m.S && m.S.pose === 'sit') m = null;
      }
    } catch (e) {
      m = null;
    }
    V.npcM[id] = m;
    return m;
  }
  function encPlan(cr) {
    if (cr.plan && cr.plan.X) return null;
    if (STILL || cr.basket || !(cr.dur > 2.4) || Math.random() > 0.38) return null;
    if (cr.plan && cr.plan.P && cr.plan.P.type === 'tren') return null;
    const pool = ORDER.filter(
      (id) =>
        id !== cur &&
        id !== cr.from &&
        !['cor', 'api', 'rev', 'eco'].includes(id) &&
        isSeen(id) &&
        typeof HUMANS !== 'undefined' &&
        HUMANS[id],
    );
    for (let k = 0; k < 4 && pool.length; k++) {
      const id = pool.splice(Math.floor(Math.random() * pool.length), 1)[0],
        m = npcModel(id);
      if (m) return { id, m, t0: cr.dur * (0.22 + Math.random() * 0.25), said: false, ph: 0 };
    }
    return null;
  }
  function encTick(cr, dt) {
    const E = V.enc;
    if (!E) return;
    const g = E.m.root;
    if (!cr || cr !== V.cr) {
      if (g.parent) g.parent.remove(g);
      V.enc = null;
      return;
    }
    if (cr.t < E.t0) {
      if (g.parent) g.parent.remove(g);
      return;
    }
    const te = E.t0 + 1.5 - (cr.t - E.t0) * 1.05;
    if (te < cr.t - 1.4 || te < 0) {
      if (g.parent) g.parent.remove(g);
      V.enc = null;
      return;
    }
    const p = tpos(cr, te),
      p2 = tpos(cr, Math.max(0, te - 0.05));
    if (!p.on) {
      if (g.parent) g.parent.remove(g);
      return;
    }
    if (g.parent !== R3D.scene) R3D.scene.add(g);
    const dx = p2.x - p.x,
      dz = p2.z - p.z,
      L = Math.hypot(dx, dz) || 1,
      side = 24;
    g.position.set(p.x - (dz / L) * side, p.y, p.z + (dx / L) * side);
    const near = 1 - clamp(Math.abs(te - cr.t) / 1.2, 0, 1);
    g.scale.setScalar(0.35 + 0.65 * clamp((1.6 - Math.abs(te - cr.t)) / 0.5, 0, 1));
    E.ph += dt * 10.5;
    try {
      LP3D.animate(E.m, { t: T, dt, walk: 1, ph: E.ph, ex: near > 0.5 ? 'happy' : 'smile', held: false, still: STILL });
    } catch (e) {}
    g.rotation.y = Math.atan2(dx, dz);
    if (!E.said && Math.abs(te - cr.t) < 0.25) {
      E.said = true;
      Sound.sfx('hop', 1);
      note(_t('{n} te saluda al pasar').replace('{n}', _t(NPCN[E.id] || E.id)));
    }
  }

  /* ── 4 · el cuarto de destino espera plegado y se despliega al llegar ── */
  function foldTick(cr) {
    const F = V.fold,
      rooms = R3D.rooms;
    if (cr && cr.long) {
      if (!F || F.id !== cur) {
        if (F && rooms[F.id]) rooms[F.id].grp.scale.y = 1;
        V.fold = { id: cur, pop: null };
      }
      const G = V.fold;
      if (G.pop == null && cr.t >= cr.dur - 1.05) {
        G.pop = T;
        Sound.sfx('page');
      }
      const r = rooms[cur];
      if (r) r.grp.scale.y = G.pop == null ? 0.05 : Math.max(0.05, easeBack(clamp((T - G.pop) / 0.85, 0, 1)));
      return;
    }
    if (F) {
      const r = rooms[F.id];
      if (F.pop == null) {
        F.pop = T;
        Sound.sfx('page');
      }
      const u = (T - F.pop) / 0.85;
      if (r) r.grp.scale.y = u >= 1 ? 1 : Math.max(0.05, easeBack(clamp(u, 0, 1)));
      if (u >= 1) V.fold = null;
    }
  }

  /* ── cada fotograma (3D) ── */
  function tick3(dt) {
    const cr = crossing && !inTitle ? crossing : null;
    if (cr !== V.cr) {
      if (cr && !cr.long && !STILL) {
        if (V.fold && V.fold.id !== cur && R3D.rooms[V.fold.id]) R3D.rooms[V.fold.id].grp.scale.y = 1;
        V.fold = { id: cur, pop: T };
      }
      if (cr && cr.long) {
        /* la cesta lleva en todos los caminos largos, no solo al cambiar de piso; el tren y las conexiones propias (ascensor, pozo, tobogán) siguen igual */
        cr.basket = !(cr.plan && cr.plan.P && cr.plan.P.type === 'tren') && !(cr.plan && cr.plan.X);
        if (cr.basket)
          setTimeout(() => {
            if (crossing === cr)
              note(
                _t(
                  floorOf(cur) > floorOf(cr.from)
                    ? 'Las abejas te suben en su cesta'
                    : floorOf(cur) < floorOf(cr.from)
                      ? 'Las abejas te bajan en su cesta'
                      : 'Las abejas te llevan en su cesta',
                ),
              );
          }, 500);
        if (V.on || ensure()) V.enc = encPlan(cr);
      }
      V.cr = cr;
      V.beat = -1;
    }
    window.BSTEP = !!(cr && cr.long);
    if (cr && cr.long) {
      V.ph += dt * 10.5;
      stepsTick(cr);
    }
    if (!ensure()) {
      return;
    }
    tilesTick(cr && cr.long ? cr : null);
    if (!(cr && cr.long)) V.tiles.count = 0;
    partsTick(dt);
    basketTick(cr && cr.long ? cr : null);
    encTick(cr, dt);
    foldTick(cr);
    if (cr && cr.long && !cr.basket) V.tiles.visible = true;
  }
  return { tick3, tpos, themeOf, V };
})();
/* con la cesta para todo, las escaleras y los puentes largos dejan de dibujarse (render3d.js, pathsTick) */
window.SIN_CAMINOS = true;
I18N([['Las abejas te llevan en su cesta', 'The bees carry you in their basket', 'Пчёлы несут тебя в своей корзине', '蜜蜂用篮子载着你']]);
if (window.R3DX) R3DX.push((dt) => VIAJE.tick3(dt));

/* sin 3D: al menos los pasos al compás y el libro desplegable */
{
  let last = null;
  setInterval(() => {
    if (window.R3D && R3D.on) return;
    const cr = crossing;
    window.BSTEP = !!(cr && cr.long);
    if (cr && cr.long) {
      try {
        const q = cr.comp ? plazaAt(cr.comp, cr.t) : cr.plan ? crossAt(cr) : null;
        if (q && q.on) {
          const bpm = (window.MUSBPM && MUSBPM(cur)) || 84,
            b = Math.floor(T / (60 / bpm / 2));
          if (b !== VIAJE.V.beat) {
            VIAJE.V.beat = b;
            Sound.sfx('bstep', VIAJE.themeOf(cr.t / cr.dur < 0.5 ? cr.from : cur));
          }
        }
      } catch (e) {}
    }
    if (last && !cr && !STILL) POP[cur] = { t0: T };
    last = cr;
  }, 60);
}

/* la cesta: el chico va quieto dentro, no camina */
{
  const ps0 = plazaStep;
  plazaStep = function (cr) {
    const r = ps0(cr);
    if (cr.basket) Pl.moving = false;
    return r;
  };
}
{
  const ca0 = crossAt;
  crossAt = function (cr) {
    const q = ca0(cr);
    if (crossing && crossing.basket && cr === crossing && q && q.on) q.seated = true;
    return q;
  };
}

TPLadd('{n} te saluda al pasar', '{n} waves as you pass', '{n} машет тебе, проходя мимо', '{n}经过时向你挥手');
I18N([
  [
    'Las abejas te suben en su cesta',
    'The bees lift you up in their basket',
    'Пчёлы поднимают тебя в своей корзине',
    '蜜蜂用篮子把你提了上去',
  ],
  [
    'Las abejas te bajan en su cesta',
    'The bees lower you down in their basket',
    'Пчёлы опускают тебя в своей корзине',
    '蜜蜂用篮子把你放了下去',
  ],
]);

/* correr: tocar dos veces el mismo sitio (o mantener Mayús con el teclado) */
{
  let lt = 0,
    lp = null,
    nTap = 0;
  const g0 = goTo;
  goTo = function (tx, ty, ...a) {
    const r = g0(tx, ty, ...a),
      now = performance.now();
    if (r !== false && Pl.route && lp && Math.hypot(tx - lp[0], ty - lp[1]) < 70 && (now - lt < 420 || Pl.run)) Pl.route.run = true;
    lt = now;
    lp = [tx, ty];
    if (++nTap === 5)
      setTimeout(() => {
        try {
          if (!localStorage.getItem('colmena-tip-run')) {
            localStorage.setItem('colmena-tip-run', '1');
            note(_t('Consejo: toca dos veces para correr'));
          }
        } catch (e) {}
      }, 1500);
    return r;
  };
}
addEventListener('keydown', (e) => {
  if (e.key === 'Shift') window.RUNK = true;
});
addEventListener('keyup', (e) => {
  if (e.key === 'Shift') window.RUNK = false;
});
I18N([['Consejo: toca dos veces para correr', 'Tip: tap twice to run', 'Совет: коснись дважды, чтобы бежать', '提示：点两下可以跑起来']]);
