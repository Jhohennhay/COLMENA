/* ══════════ CONEXIONES · subir y bajar sin rampas ══════════
   Los tres caminos que más cambiaban de piso eran un puente inclinado (se sentían como una escalera larga).
   Ahora, cuando cambias de piso, te subes a algo:
   · Corazón ↔ Espacio: el ASCENSOR DE LA COLMENA, una torre de cera y cristal con una jaula que suben las abejas.
       Caminas hasta la torre, subes (o bajas) cuatro pisos viendo toda la colmena y sales por la pasarela de arriba.
   · Sótano ↔ Andén: el CUBO DEL POZO. Del Sótano sale un brocal con manivela; bajas dentro del cubo
       por un pozo de piedra hasta los pasillos de la colmena de abajo (y vuelves a subir igual).
   · Sótano → Corazón: el TOBOGÁN DE MIEL, una espiral para bajar deslizándote. Para subir al Sótano,
       las abejas siguen llevándote en su cesta.
   La lógica del juego no cambia: qué está abierto y cuándo sigue igual; solo cambia cómo se recorre. */
(() => {
  if (typeof PATHS === 'undefined' || typeof crossAt !== 'function') return;
  const NEW = { 'cor-esp': 'ascensor', 'and-sot': 'pozo', 'cor-sot': 'tobogan' };
  Object.assign(PATH_OF, NEW);
  Object.assign(PATH_NAME, { ascensor: 'Ascensor de la colmena', pozo: 'Cubo del pozo', tobogan: 'Tobogán de miel' });
  Object.assign(PMAT, {
    ascensor: { c: ['#E8B85A', '#D9A24A'], post: '#8A5A2E', glow: '#FFE08A', icon: '⇅' },
    pozo: { c: ['#9A90A4', '#7E7488'], post: '#4A4258', glow: '#D8C8FF', icon: '◎' },
    tobogan: { c: ['#F0B848', '#E4A030'], post: '#B8762A', glow: '#FFD36A', icon: '≀' },
  });
  const fix = () => {
    for (const P of PATHS) if (NEW[P.key]) P.type = NEW[P.key];
  };
  fix();
  {
    const bp = buildPaths;
    buildPaths = function (...a) {
      const r = bp.apply(this, a);
      fix();
      return r;
    };
  }
  /* estos tres viajes ya no pasan por una plazoleta a mitad de camino: se recorren enteros, con su máquina */
  if (typeof plazaBuild === 'function') {
    const pb0 = plazaBuild;
    plazaBuild = function () {
      if (PLZ.ready && PLZ.n === PATHS.length) return PLZ;
      const all = PATHS.slice();
      PATHS.length = 0;
      PATHS.push(...all.filter((P) => !NEW[P.key]));
      try {
        pb0();
      } finally {
        PATHS.length = 0;
        PATHS.push(...all);
      }
      PLZ.n = PATHS.length;
      return PLZ;
    };
  }
  const MY = { ascensor: { walk: 230, ride: 150 }, pozo: { walk: 230, ride: 105 }, tobogan: { walk: 230, ride: 290 } };
  const FL = (id) => {
    try {
      return PISO[GRUPO[id]] ?? 0;
    } catch (e) {
      return 0;
    }
  };
  const L3 = (id) => {
    try {
      return window.R3D && R3D.lift ? R3D.lift(id) : 0;
    } catch (e) {
      return 0;
    }
  };
  const sm5 = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * (x * (x * 6 - 15) + 10));
  const pathOf = (key) => PATHS.find((P) => P.key === key);
  /* la forma del recorrido, de la celda a (t=0) a la celda b (t=1): puntos con altura y tramos «montado» */
  function shape(P) {
    const la = L3(P.a),
      lb = L3(P.b),
      A = PT(P, 0, 0),
      B = PT(P, 1, 0),
      pts = [{ x: A[0], y: A[1], h: la }];
    if (P.type !== 'tobogan') {
      const ts = P.type === 'ascensor' ? 0.5 : lb > la ? 0.8 : 0.2,
        C = PT(P, ts, 0);
      pts.push({ x: C[0], y: C[1], h: la }, { x: C[0], y: C[1], h: lb, ride: 1 }, { x: B[0], y: B[1], h: lb });
    } else {
      const hc = PT(P, 0.5, 0),
        r = 72,
        th0 = Math.atan2(-P.u[1], -P.u[0]),
        N = 40;
      for (let k = 0; k <= N; k++) {
        const s = k / N,
          th = th0 + s * Math.PI * 3;
        pts.push({ x: hc[0] + Math.cos(th) * r, y: hc[1] + Math.sin(th) * r, h: lerp(la, lb, s), ride: k > 0 ? 1 : 0 });
      }
      pts.push({ x: B[0], y: B[1], h: lb });
    }
    return { pts, la, lb };
  }
  /* tiempos de cada tramo, en el sentido del viaje; los tramos montados se agrupan en un bloque con arranque y frenada suaves */
  function timeline(P, fwd) {
    const { pts } = shape(P),
      sp = MY[P.type];
    let segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        b = pts[i + 1],
        ride = !!b.ride,
        len = Math.hypot(b.x - a.x, b.y - a.y, b.h - a.h);
      segs.push({ a, b, ride, len });
    }
    if (!fwd) segs = segs.reverse().map((s) => ({ a: s.b, b: s.a, ride: s.ride, len: s.len }));
    const blocks = [];
    for (const s of segs) {
      const last = blocks[blocks.length - 1];
      if (last && last.ride === s.ride) last.segs.push(s);
      else blocks.push({ ride: s.ride, segs: [s] });
    }
    let t = 0;
    for (const b of blocks) {
      b.len = b.segs.reduce((a, s) => a + s.len, 0);
      b.dur = (b.len / (b.ride ? sp.ride : sp.walk)) * (b.ride ? 1.3 : 1);
      b.t0 = t;
      t += b.dur;
    }
    return { blocks, d2: t };
  }
  function at(X, t2) {
    const B = X.blocks;
    let b = B[B.length - 1];
    for (const k of B)
      if (t2 < k.t0 + k.dur) {
        b = k;
        break;
      }
    const f = clamp((t2 - b.t0) / Math.max(1e-4, b.dur), 0, 1),
      s = (b.ride ? sm5(f) : f) * b.len;
    let acc = 0,
      seg = b.segs[b.segs.length - 1],
      u = 1;
    for (const g of b.segs) {
      if (s <= acc + g.len) {
        seg = g;
        u = (s - acc) / Math.max(1e-4, g.len);
        break;
      }
      acc += g.len;
    }
    return {
      x: lerp(seg.a.x, seg.b.x, u),
      y: lerp(seg.a.y, seg.b.y, u),
      h: lerp(seg.a.h, seg.b.h, u),
      ride: b.ride,
      dx: seg.b.x - seg.a.x,
      f,
      blk: B.indexOf(b),
    };
  }

  /* ── el plan del cruce: mismo arranque y llegada, el tramo central sigue la nueva forma ── */
  {
    const cp0 = crossPlan;
    crossPlan = function (from, to, a, b) {
      const pl = cp0(from, to, a, b);
      if (!pl || !MY[pl.P.type]) return pl;
      if (pl.P.type === 'tobogan' && FL(to) > FL(from)) return pl; /* subir al Sótano: la cesta de las abejas */
      const X = timeline(pl.P, pl.fwd);
      X.from = from;
      X.to = to;
      pl.X = X;
      pl.d2 = X.d2;
      pl.dur = pl.d1 + pl.d2 + pl.d3;
      return pl;
    };
  }
  {
    const ca0 = crossAt;
    crossAt = function (cr) {
      const pl = cr.plan;
      if (!pl || !pl.X) return ca0(cr);
      const t2 = cr.t - pl.d1;
      if (t2 < 0 || t2 >= pl.d2) return ca0(cr);
      const X = pl.X,
        q = at(X, t2),
        P = pl.P,
        lin = lerp(L3(X.from), L3(X.to), clamp(cr.t / Math.max(0.01, pl.dur), 0, 1)),
        tA = clamp(((q.x - P.p0[0]) * P.u[0] + (q.y - P.p0[1]) * P.u[1]) / P.L, 0, 1);
      const z = q.h - lin;
      return {
        x: q.x,
        y: q.y,
        z,
        on: true,
        ride: q.ride,
        rideF: q.f,
        blk: q.blk,
        dx: Math.abs(q.dx) > 0.5 ? q.dx : pl.e[0] - pl.s[0],
        phase: 2,
        pt: tA,
        r: { t: tA, w: 0, z, hop: q.blk },
        u: t2 / pl.d2,
        seated: q.ride,
      };
    };
  }
  /* en el dibujo de papel (sin 3D) se ven como un puente normal */
  {
    const dp = drawPath;
    drawPath = function (p, P, ...a) {
      return dp(p, MY[P.type] ? Object.assign(Object.create(P), { type: 'puente' }) : P, ...a);
    };
  }
  /* el cartel de la puerta dice en qué se viaja */
  window.VIAL = (to) => {
    const k = [cur, to].sort().join('-'),
      ty = NEW[k];
    if (!ty) return '';
    if (ty === 'tobogan') return ' · ' + _t(FL(to) < FL(cur) ? 'tobogán' : 'cesta');
    return ' · ' + _t(ty === 'ascensor' ? 'ascensor' : 'pozo');
  };

  /* ── sonido y cámara durante el tramo montado ── */
  let ZR = 0,
    lastRide = null;
  window.TRAVZ = () => ZR;
  function rideTick(dt) {
    const cr = crossing,
      q = cr && cr.q,
      mine = cr && cr.plan && cr.plan.X && q && q.phase === 2,
      ride = !!(mine && q.ride),
      ty = mine ? cr.plan.P.type : null;
    const want = ride && !STILL ? (ty === 'ascensor' ? 0.95 : ty === 'pozo' ? 0.45 : 0.3) : 0;
    ZR = lerp(ZR, want, Math.min(1, dt * 1.6));
    const key = ride ? cr.plan.P.key + ':' + q.blk : null;
    if (key !== lastRide) {
      if (key) {
        if (ty === 'tobogan') {
          Sound.sfx('hop', 1);
          note(_t('¡Al tobogán!'));
        } else {
          Sound.sfx('crank', 2.4);
          note(
            _t(
              ty === 'ascensor'
                ? FL(cur) > FL(cr.from)
                  ? 'Las abejas suben el ascensor'
                  : 'Las abejas bajan el ascensor'
                : FL(cur) < FL(cr.from)
                  ? 'Bajas por el pozo dentro del cubo'
                  : 'Subes por el pozo dentro del cubo',
            ),
          );
        }
      } else if (lastRide) {
        Sound.sfx(ty === 'tobogan' || !mine ? 'thump' : 'thunk');
      }
      lastRide = key;
    }
  }

  /* ═════════════ las piezas en 3D ═════════════ */
  const V = { built: null, key: '', objs: [] };
  function build() {
    if (!window.R3D || !R3D.on || !R3D.scene || !window.LP3D) return false;
    const T3 = THREE,
      { Bk, SPH, CYL, CONE, BOX, TOR, LATHE, OCT, shd, mat, matF, glowSprite } = LP3D.kit;
    const key = Object.keys(NEW)
      .map((k) => {
        const P = pathOf(k);
        return P ? Math.round(L3(P.a)) + ',' + Math.round(L3(P.b)) : 'x';
      })
      .join('|');
    if (V.built && V.key === key) return true;
    if (V.built) {
      for (const o of V.objs) {
        R3D.scene.remove(o.g);
        o.g.traverse((m) => {
          if (m.geometry && !m.geometry.userData.shared) m.geometry.dispose();
        });
      }
      V.objs = [];
    }
    V.key = key;
    V.built = true;
    const W = (x, y, h) => [x, h, y];
    /* pasarela recta de a a b a la altura h */
    function walk(B, a, b, h, c1, c2, rail, railC) {
      const dx = b.x - a.x,
        dy = b.y - a.y,
        L = Math.hypot(dx, dy);
      if (L < 4) return;
      const ux = dx / L,
        uy = dy / L,
        yaw = Math.atan2(-dy, dx),
        n = Math.max(1, Math.round(L / 26));
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        B.add(BOX(L / n - 3, 4, 64), i % 2 ? c1 : c2, W(a.x + dx * t, a.y + dy * t, h - 2), [0, yaw, 0]);
      }
      for (const s of [-1, 1])
        B.add(BOX(L, 5, 4), shd(c1, 0.7), W(a.x + dx / 2 - uy * s * 28, a.y + dy / 2 + ux * s * 28, h - 7), [0, yaw, 0]);
      if (rail)
        for (const s of [-1, 1]) {
          const ox = -uy * s * 33,
            oy = ux * s * 33;
          B.add(BOX(L, 2.4, 2.4), railC, W(a.x + dx / 2 + ox, a.y + dy / 2 + oy, h + 38), [0, yaw, 0]);
          for (let i = 0; i <= n; i += 2) {
            const t = i / n;
            B.add(BOX(2.4, 38, 2.4), railC, W(a.x + dx * t + ox, a.y + dy * t + oy, h + 19));
          }
        }
    }
    const lanterns = (g, a, b, h, col, every) => {
      const L = Math.hypot(b.x - a.x, b.y - a.y),
        n = Math.floor(L / every);
      for (let i = 1; i <= n; i++) {
        const t = i / (n + 1),
          s = glowSprite(col, 46);
        s.material.opacity = 0.5;
        s.position.set(...W(lerp(a.x, b.x, t), lerp(a.y, b.y, t), h + 44));
        g.add(s);
      }
    };
    const bee = () => {
      const K = new Bk();
      K.add(SPH(2.4, 6, 4), '#F2C14E', [0, 0, 0], [0, 0, 0], [1.35, 1, 1]);
      K.add(BOX(1.2, 3.6, 3.8), '#3A2A10', [0.6, 0, 0]);
      K.add(SPH(1.7, 5, 3), '#FFFFFF', [0, 1.8, 1.6], [0, 0, 0], [0.7, 0.2, 1.3]);
      K.add(SPH(1.7, 5, 3), '#FFFFFF', [0, 1.8, -1.6], [0, 0, 0], [0.7, 0.2, 1.3]);
      return new T3.Mesh(K.geo(), mat());
    };

    /* ── 1 · el ascensor de la colmena ── */
    {
      const P = pathOf('cor-esp');
      if (P) {
        const S = shape(P),
          C = S.pts[1],
          lo = Math.min(S.la, S.lb),
          hi = Math.max(S.la, S.lb),
          g = new T3.Group(),
          B = new Bk(),
          F = new Bk(),
          HON = '#C9963E',
          HONL = '#E8B85A';
        walk(B, S.pts[0], C, S.la, '#E8B85A', '#D9A24A', true, '#8A5A2E');
        walk(B, S.pts[2], S.pts[3], S.lb, '#E8B85A', '#D9A24A', true, '#8A5A2E');
        const y0 = lo - 60,
          y1 = hi + 150,
          H = y1 - y0;
        for (let k = 0; k < 6; k++) {
          const a = (k * Math.PI) / 3 + Math.PI / 6;
          B.add(BOX(5, H, 5), HON, W(C.x + Math.cos(a) * 54, C.y + Math.sin(a) * 54, y0 + H / 2));
        }
        for (let y = y0 + 20; y < y1; y += 70) B.add(TOR(54, 2.6, 4, 6), HONL, W(C.x, C.y, y), [Math.PI / 2, 0, Math.PI / 6]);
        for (const h of [S.la, S.lb])
          for (let k = 0; k < 6; k++) {
            const a = (k * Math.PI) / 3;
            B.add(BOX(58, 6, 20), '#B8823E', W(C.x + Math.cos(a) * 64, C.y + Math.sin(a) * 64, h - 3), [0, -a + Math.PI / 2, 0]);
          }
        B.add(CYL(62, 62, 8, 6), '#B8823E', W(C.x, C.y, lo - 8));
        B.add(CONE(70, 54, 6), HON, W(C.x, C.y, y1 + 27));
        B.add(CYL(72, 72, 5, 6), '#8A5A2E', W(C.x, C.y, y1 + 1));
        B.add(TOR(16, 3.4, 5, 14), '#8A5A2E', W(C.x, C.y, y1 - 14), [0, 0, 0]);
        const glass = new T3.MeshLambertMaterial({
          color: '#FFF1C8',
          emissive: '#E8B85A',
          emissiveIntensity: 0.25,
          transparent: true,
          opacity: 0.16,
          depthWrite: false,
          side: T3.DoubleSide,
        });
        const tube = new T3.Mesh(CYL(52, 52, H, 6, true), glass);
        tube.position.set(...W(C.x, C.y, y0 + H / 2));
        tube.rotation.y = Math.PI / 6;
        g.add(tube);
        const top = glowSprite('#FFD36A', 140);
        top.material.opacity = 0.45;
        top.position.set(...W(C.x, C.y, y1 + 20));
        g.add(top);
        lanterns(g, S.pts[0], C, S.la, '#FFD36A', 260);
        lanterns(g, S.pts[2], S.pts[3], S.lb, '#FFD36A', 260);
        B.mesh(g);
        F.mesh(g, true);
        /* la jaula */
        const cage = new T3.Group(),
          K = new Bk();
        K.add(CYL(40, 40, 4, 6), '#D9A24A', [0, 2, 0]);
        for (let k = 0; k < 6; k++) {
          const a = (k * Math.PI) / 3 + Math.PI / 6;
          K.add(BOX(2.6, 62, 2.6), '#8A5A2E', [Math.cos(a) * 38, 33, Math.sin(a) * 38]);
        }
        K.add(TOR(38, 2.2, 4, 6), '#C9963E', [0, 30, 0], [Math.PI / 2, 0, Math.PI / 6]);
        K.add(TOR(38, 2.4, 4, 6), '#C9963E', [0, 64, 0], [Math.PI / 2, 0, Math.PI / 6]);
        K.add(CONE(46, 24, 6), '#E8B85A', [0, 77, 0], [0, Math.PI / 6, 0]);
        K.add(SPH(4, 6, 5), '#FFE08A', [0, 92, 0]);
        cage.add(new T3.Mesh(K.geo(), mat()));
        const cl = glowSprite('#FFE08A', 70);
        cl.material.opacity = 0.4;
        cl.position.y = 60;
        cage.add(cl);
        g.add(cage);
        const rope = new T3.Mesh(CYL(0.8, 0.8, 1, 4), new T3.MeshBasicMaterial({ color: '#5A3A22' }));
        g.add(rope);
        const cw = new T3.Mesh(
          SPH(12, 10, 8),
          new T3.MeshLambertMaterial({ color: '#F0B848', emissive: '#C9772F', emissiveIntensity: 0.3 }),
        );
        cw.scale.set(1, 1.3, 1);
        g.add(cw);
        const bees = [];
        for (let k = 0; k < 7; k++) {
          const b = bee();
          g.add(b);
          bees.push({ b, ph: (k / 7) * 6.28, r: 30 + (k % 3) * 8 });
        }
        R3D.scene.add(g);
        V.objs.push({ g, P, S, C, cage, rope, cw, bees, y1, kind: 'ascensor' });
      }
    }

    /* ── 2 · el cubo del pozo ── */
    {
      const P = pathOf('and-sot');
      if (P) {
        const S = shape(P),
          C = S.pts[1],
          lo = Math.min(S.la, S.lb),
          hi = Math.max(S.la, S.lb),
          g = new T3.Group(),
          B = new Bk(),
          STONE = ['#8A8090', '#9A90A4', '#7A7088'];
        const lowA = S.la < S.lb ? S.pts[0] : S.pts[3],
          lowB = C,
          highA = C,
          highB = S.la < S.lb ? S.pts[3] : S.pts[0];
        walk(B, lowA, lowB, lo, '#7E7488', '#9A90A4', true, '#4A4258');
        walk(B, highA, highB, hi, '#9A8A70', '#B09C80', true, '#5A4636');
        lanterns(g, lowA, lowB, lo, '#C8B6FF', 220);
        /* brocal de piedra con tejadillo y manivela */
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * 6.28;
          B.add(BOX(20, 18 + (k % 2) * 5, 12), STONE[k % 3], W(C.x + Math.cos(a) * 44, C.y + Math.sin(a) * 44, hi + 9), [0, -a, 0]);
        }
        for (const s of [-1, 1]) B.add(BOX(7, 92, 7), '#6A4A2E', W(C.x + s * P.v[0] * 52, C.y + s * P.v[1] * 52, hi + 46));
        {
          const yaw = Math.atan2(-P.v[1], P.v[0]),
            X = new T3.Vector3(P.v[0], 0, P.v[1]).normalize();
          for (const s of [-1, 1]) {
            const Z = new T3.Vector3(P.u[0] * s * Math.cos(0.55), -Math.sin(0.55), P.u[1] * s * Math.cos(0.55)).normalize(),
              Y = new T3.Vector3().crossVectors(Z, X).normalize(),
              c = new T3.Vector3(C.x, hi + 112, C.y).addScaledVector(Z, 32);
            B.addM(BOX(130, 5, 64), s < 0 ? '#8A3A2A' : '#7A3222', new T3.Matrix4().makeBasis(X, Y, Z).setPosition(c));
          }
          B.add(CYL(3.4, 3.4, 110, 8), '#5A3A22', W(C.x, C.y, hi + 70), [0, yaw, Math.PI / 2]);
        }
        /* el pozo de piedra que cuelga hasta abajo */
        for (let y = hi - 30; y > lo; y -= 55)
          B.add(TOR(46, 5, 4, 10), STONE[Math.abs(Math.round(y / 55)) % 3], W(C.x, C.y, y), [Math.PI / 2, 0, 0]);
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * 6.28 + 0.4;
          B.add(BOX(5, hi - lo, 5), '#5A4636', W(C.x + Math.cos(a) * 48, C.y + Math.sin(a) * 48, (hi + lo) / 2));
        }
        B.add(CYL(70, 74, 10, 9), '#6E6478', W(C.x, C.y, lo - 6));
        B.mesh(g);
        const crank = new T3.Group();
        crank.position.set(...W(C.x, C.y, hi + 70));
        const KC = new Bk();
        KC.add(BOX(4, 22, 4), '#3A3A44', [0, 11, 0]);
        KC.add(CYL(2, 2, 14, 6), '#5A3A22', [0, 22, 7], [Math.PI / 2, 0, 0]);
        crank.add(new T3.Mesh(KC.geo(), mat()));
        g.add(crank);
        {
          const yaw = Math.atan2(-P.v[1], P.v[0]);
          crank.rotation.y = yaw;
          crank.position.x += P.v[0] * 58;
          crank.position.z += P.v[1] * 58;
        }
        const bucket = new T3.Group(),
          KB = new Bk();
        KB.add(
          LATHE(
            [
              [18, 0],
              [22, 26],
              [23, 26],
              [23, 28],
              [20, 28],
            ],
            12,
          ),
          '#9A6A3A',
          [0, 0, 0],
        );
        KB.add(CYL(18, 18, 2, 12), '#6A4A2E', [0, 1, 0]);
        for (const y of [6, 20]) KB.add(TOR(21, 1.3, 4, 14), '#4A4A52', [0, y, 0], [Math.PI / 2, 0, 0]);
        KB.add(TOR(22, 1.4, 4, 14, Math.PI), '#4A4A52', [0, 28, 0]);
        bucket.add(new T3.Mesh(KB.geo(), mat()));
        g.add(bucket);
        const rope = new T3.Mesh(CYL(0.9, 0.9, 1, 4), new T3.MeshBasicMaterial({ color: '#8A6A4A' }));
        g.add(rope);
        const deep = glowSprite('#B8A6FF', 120);
        deep.material.opacity = 0.35;
        deep.position.set(...W(C.x, C.y, lo + 20));
        g.add(deep);
        R3D.scene.add(g);
        V.objs.push({ g, P, S, C, cage: bucket, rope, crank, y1: hi + 70, kind: 'pozo' });
      }
    }

    /* ── 3 · el tobogán de miel ── */
    {
      const P = pathOf('cor-sot');
      if (P) {
        const S = shape(P),
          g = new T3.Group(),
          B = new Bk(),
          pts = S.pts,
          hz = pts.slice(1, pts.length - 1),
          lo = Math.min(S.la, S.lb),
          hi = Math.max(S.la, S.lb);
        walk(B, pts[0], hz[0], S.la, '#F0C060', '#E4A844', true, '#B8762A');
        walk(B, hz[hz.length - 1], pts[pts.length - 1], S.lb, '#F0C060', '#E4A844', true, '#B8762A');
        /* la canal en U a lo largo de la espiral */
        const pos = [],
          col = [],
          idx = [],
          cc = new T3.Color(),
          M = 8,
          sm = [];
        for (let i = 0; i < hz.length - 1; i++)
          for (let j = 0; j < 4; j++) {
            const a = hz[i],
              b = hz[i + 1],
              u = j / 4;
            sm.push({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), h: lerp(a.h, b.h, u) });
          }
        sm.push(hz[hz.length - 1]);
        sm.forEach((c, i) => {
          const n = sm[Math.min(sm.length - 1, i + 1)],
            p = sm[Math.max(0, i - 1)];
          let tx = n.x - p.x,
            ty = n.y - p.y;
          const tl = Math.hypot(tx, ty) || 1;
          tx /= tl;
          ty /= tl;
          const sx = -ty,
            sy = tx;
          for (let k = 0; k <= M; k++) {
            const an = (Math.PI * k) / M,
              o = Math.cos(an) * 19,
              d = Math.sin(an) * 13;
            pos.push(c.x + sx * o, c.h + 4 - d, c.y + sy * o);
            cc.set(k === 0 || k === M ? '#C98A3A' : i % 6 < 3 ? '#F0B848' : '#E8A83A');
            col.push(cc.r, cc.g, cc.b);
          }
        });
        for (let i = 0; i < sm.length - 1; i++)
          for (let k = 0; k < M; k++) {
            const a = i * (M + 1) + k,
              b = a + 1,
              c = a + M + 1,
              d = c + 1;
            idx.push(a, c, b, b, c, d);
          }
        const cg = new T3.BufferGeometry();
        cg.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
        cg.setAttribute('color', new T3.Float32BufferAttribute(col, 3));
        cg.setIndex(idx);
        cg.computeVertexNormals();
        g.add(
          new T3.Mesh(
            cg,
            new T3.MeshLambertMaterial({ vertexColors: true, side: T3.DoubleSide, emissive: '#5A3208', emissiveIntensity: 0.25 }),
          ),
        );
        const hc = PT(P, 0.5, 0);
        B.add(CYL(9, 11, hi - lo + 90, 8), '#E4A844', W(hc[0], hc[1], (hi + lo) / 2 + 15));
        B.add(CONE(16, 26, 8), '#F0C060', W(hc[0], hc[1], hi + 73));
        for (let i = 4; i < sm.length; i += 10) {
          const c = sm[i];
          const K = Math.hypot(c.x - hc[0], c.y - hc[1]);
          B.add(BOX(K, 3, 3), '#C98A3A', W((c.x + hc[0]) / 2, (c.y + hc[1]) / 2, c.h - 12), [
            0,
            Math.atan2(-(c.y - hc[1]), c.x - hc[0]),
            0,
          ]);
        }
        B.mesh(g);
        const drips = [];
        const dm = new T3.MeshBasicMaterial({ color: '#FFD36A' });
        for (let k = 0; k < 6; k++) {
          const m = new T3.Mesh(SPH(3, 6, 5), dm);
          g.add(m);
          drips.push({ m, ph: k / 6 });
        }
        const gl = glowSprite('#FFD36A', 120);
        gl.material.opacity = 0.3;
        gl.position.set(...W(hc[0], hc[1], hi + 60));
        g.add(gl);
        R3D.scene.add(g);
        V.objs.push({ g, P, S, sm, drips, kind: 'tobogan' });
      }
    }
    return true;
  }

  /* ── cada fotograma: la jaula y el cubo siguen al viajero; si no, esperan en el piso de donde vienes ── */
  function tick3(dt) {
    rideTick(dt);
    if (!build()) return;
    const cr = crossing;
    for (const o of V.objs) {
      const P = o.P,
        hide = window.CHIDE && CHIDE(P.a) && CHIDE(P.b);
      o.g.visible = !hide;
      if (hide) continue;
      if (o.kind === 'tobogan') {
        for (const d of o.drips) {
          const u = STILL ? d.ph : (T * 0.18 + d.ph) % 1,
            i = Math.floor(u * (o.sm.length - 1)),
            f = u * (o.sm.length - 1) - i,
            a = o.sm[o.sm.length - 1 - i],
            b = o.sm[Math.max(0, o.sm.length - 2 - i)];
          d.m.position.set(lerp(a.x, b.x, f), lerp(a.h, b.h, f) + 2, lerp(a.y, b.y, f));
        }
        continue;
      }
      let h;
      const mine = cr && cr.plan && cr.plan.P === P && cr.plan.X && cr.q;
      if (mine && cr.q.phase === 2) {
        h = lerp(L3(cr.plan.X.from), L3(cr.plan.X.to), clamp(cr.t / Math.max(0.01, cr.plan.dur), 0, 1)) + cr.q.z;
        if (!cr.q.ride) h = cr.q.blk === 0 ? L3(cr.plan.X.from) : L3(cr.plan.X.to);
      } else if (mine) h = cr.q.phase === 1 ? L3(cr.plan.X.from) : L3(cr.plan.X.to);
      else h = cur === P.b ? L3(P.b) : cur === P.a ? L3(P.a) : Math.min(L3(P.a), L3(P.b));
      o.cage.position.set(o.C.x, h, o.C.y);
      const top = o.y1,
        len = Math.max(1, top - (h + (o.kind === 'pozo' ? 28 : 90)));
      o.rope.scale.y = len;
      o.rope.position.set(o.C.x, top - len / 2, o.C.y);
      if (o.kind === 'ascensor') {
        const lo = Math.min(o.S.la, o.S.lb),
          hi = Math.max(o.S.la, o.S.lb);
        o.cw.position.set(o.C.x + 46 * Math.cos(0.3), hi + lo - h + 60, o.C.y + 46 * Math.sin(0.3));
        for (const b of o.bees) {
          const a = b.ph + (STILL ? 0 : T * 2.2);
          b.b.position.set(o.C.x + Math.cos(a) * b.r, h + 96 + (STILL ? 0 : Math.sin(T * 6 + b.ph) * 3), o.C.y + Math.sin(a) * b.r);
          b.b.rotation.y = -a;
        }
      } else if (o.crank) {
        const riding = mine && cr.q.ride;
        if (riding && !STILL) o.crank.rotation.x = (o.crank.rotation.x || 0) + dt * 6 * (FL(cur) < FL(cr.from) ? 1 : -1);
      }
    }
  }
  if (window.R3DX)
    R3DX.push((dt) => {
      try {
        tick3(dt || 1 / 60);
      } catch (e) {
        if (!V.err) {
          V.err = 1;
          console.warn('conexiones', e);
        }
      }
    });
  else setInterval(() => rideTick(0.05), 50);

  I18N([
    ['Ascensor de la colmena', 'The hive lift', 'Лифт улья', '蜂巢升降梯'],
    ['Cubo del pozo', 'The well bucket', 'Ведро колодца', '井里的水桶'],
    ['Tobogán de miel', 'The honey slide', 'Медовая горка', '蜂蜜滑梯'],
    ['ascensor', 'lift', 'лифт', '升降梯'],
    ['pozo', 'well', 'колодец', '水井'],
    ['tobogán', 'slide', 'горка', '滑梯'],
    ['cesta', 'basket', 'корзина', '篮子'],
    ['¡Al tobogán!', 'Down the slide!', 'Вниз по горке!', '滑下去！'],
    ['Las abejas suben el ascensor', 'The bees haul the lift up', 'Пчёлы поднимают лифт', '蜜蜂把升降梯拉了上去'],
    ['Las abejas bajan el ascensor', 'The bees lower the lift', 'Пчёлы опускают лифт', '蜜蜂把升降梯放了下去'],
    [
      'Bajas por el pozo dentro del cubo',
      'You go down the well in the bucket',
      'Ты спускаешься в колодец в ведре',
      '你坐在水桶里沿着井往下降',
    ],
    [
      'Subes por el pozo dentro del cubo',
      'You ride the bucket up the well',
      'Ты поднимаешься из колодца в ведре',
      '你坐在水桶里沿着井往上升',
    ],
  ]);
})();
