/* ══════════ MUEBLES LOW-POLY 3D ══════════
   Los muebles de papel pasan a ser piezas 3D sólidas, como en el prototipo «Colmena 3D»:
   facetas planas, madera, cerámica y tela con su luz. Cada pieza ocupa exactamente el sitio y
   la huella del dibujo de papel (las mismas coordenadas), así que la lógica del juego no cambia.
   Las piezas sin versión 3D siguen siendo recortes de papel.
   Optimizado: cada mueble son 1-3 mallas fusionadas con colores por vértice y materiales compartidos;
   se construye una vez y se reutiliza al reconstruir el cuarto.
   También aquí: las baldosas en relieve del suelo, con la misma pintura del suelo encima. */
const PROPS3D = (() => {
  const T3 = window.THREE;
  if (!T3 || !window.LP3D) return null;
  const { Bk, SPH, CYL, CONE, BOX, TOR, LATHE, OCT, CIRC, shd, mix } = LP3D.kit;
  const P = (x, y, z) => [x, z, y]; /* coordenadas del cuarto → mundo */
  const rf = (seed) => {
    const r = rng(seed);
    return (a, b) => a + (b - a) * r();
  };
  const UP = new T3.Vector3(0, 1, 0);
  /* un tramo cilíndrico entre dos puntos (ramas, asas, patas inclinadas) */
  function limb(B, a, b, r0, r1, col, n = 6) {
    const A = new T3.Vector3(...P(...a)),
      Bv = new T3.Vector3(...P(...b)),
      d = Bv.clone().sub(A),
      L = d.length();
    const q = new T3.Quaternion().setFromUnitVectors(UP, d.clone().normalize());
    B.addM(CYL(r1, r0, 1, n), col, new T3.Matrix4().compose(A.clone().add(Bv).multiplyScalar(0.5), q, new T3.Vector3(1, L, 1)));
  }
  function pot(B, x, y, r, h, col = C.terra) {
    B.add(
      LATHE(
        [
          [r * 0.8, 0],
          [r * 0.97, h - 7],
          [r * 1.04, h - 6],
          [r * 1.04, h],
          [r * 0.84, h],
        ],
        14,
      ),
      col,
      P(x, y, 0),
    );
    B.add(CYL(r * 0.84, r * 0.84, 1.5, 14), C.soil, P(x, y, h - 2.5));
    B.add(TOR(r * 1.02, 2.6, 4, 16), shd(col, 1.12), P(x, y, h - 1), [Math.PI / 2, 0, 0]);
  }
  /* copa de árbol: racimos facetados */
  function crown(F, x, y, z, seed, cols, n, rad, size) {
    const R = rf(seed);
    for (let k = 0; k < n; k++) {
      const a = R(0, Math.PI * 2),
        d = R(0, rad),
        s = R(size * 0.7, size * 1.15);
      F.add(
        SPH(s, 5, 4),
        cols[k % cols.length],
        P(x + Math.cos(a) * d * 1.1, y + Math.sin(a) * d * 0.8, z + R(-0.35, 0.45) * rad * 0.6),
        [R(0, 3), R(0, 3), 0],
        [1, R(0.75, 0.95), 1],
      );
    }
  }
  function trunk(B, x, y, z0, z1, seed, col = C.brown) {
    B.add(CYL(4.5, 7.5, z1 - z0, 7), col, P(x, y, (z0 + z1) / 2));
    const R = rf(seed);
    for (const [dx, dy, dz] of [
      [-34, -6, 26],
      [30, 4, 30],
      [-14, 10, 46],
      [18, -10, 50],
      [2, 0, 40],
    ])
      limb(B, [x, y, z1 - 6], [x + dx + R(-4, 4), y + dy, z1 + dz], 3.2, 1.6, col, 5);
    return [x, y, z1];
  }

  const LEAF_O = ['#C9563A', '#E07A3E', '#F0A848', '#B8563A'];
  const B3 = {
    /* ── Primavera ── */
    cerezo() {
      const B = new Bk(),
        F = new Bk(),
        x = -130,
        y = -185;
      pot(B, x, y, 34, 44);
      const t = trunk(B, x, y, 44, 150, 'cer');
      if (PROG.F.bloom) {
        crown(F, x, y, 178, 'cer1', [C.petalD, C.petal, C.petalL, '#F6C4BE'], 22, 58, 26);
        const R = rf('cer2');
        for (let k = 0; k < 26; k++) {
          const a = R(0, 6.28),
            d = R(10, 66);
          F.add(OCT(4), k % 3 ? C.cream : '#FFE9E3', P(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, 178 + R(-8, 34)));
        }
      } else {
        const R = rf('cer3');
        for (const [dx, dy, dz] of [
          [-34, -6, 26],
          [30, 4, 30],
          [-14, 10, 46],
          [18, -10, 50],
          [2, 0, 40],
        ])
          for (let k = 0; k < 2; k++)
            F.add(SPH(3, 5, 4), C.petal, P(x + dx * (0.65 + k * 0.33), y + dy * (0.65 + k * 0.33), 144 + dz * (0.65 + k * 0.33)));
      }
      return [B, F];
    },
    huerto() {
      const B = new Bk(),
        F = new Bk(),
        x = 10,
        y = -55;
      B.add(CYL(80, 80, 34, 6), '#C9873C', P(x, y, 17), [0, Math.PI / 2, 0]);
      B.add(CYL(80, 80, 2.4, 6), '#DDA253', P(x, y, 35), [0, Math.PI / 2, 0]);
      B.add(CYL(68, 68, 2.4, 6), C.soil, P(x, y, 35.6), [0, Math.PI / 2, 0]);
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3 + Math.PI / 6;
        B.add(BOX(2, 32, 2), '#A86A2C', P(x + Math.cos(a) * 79.5, y + Math.sin(a) * 79.5, 17));
      }
      for (const [dx, dy] of [
        [-38, -18],
        [-8, -30],
        [24, -22],
        [-26, 14],
        [8, 4],
      ]) {
        const c = P(x + dx, y + dy, 40);
        F.add(SPH(13, 6, 4), C.sageD, c, [0, dx, 0], [1, 0.6, 1]);
        F.add(SPH(9, 6, 4), C.sage, [c[0], c[1] + 3, c[2]], [0, dy, 0], [1, 0.7, 1]);
        F.add(SPH(5, 5, 3), C.sageL, [c[0], c[1] + 6, c[2]]);
      }
      for (const dx of [34, 48, 58]) {
        const c = P(x + dx, y + 18 - dx * 0.2, 37);
        F.add(CONE(4, 9, 5), '#E8843C', [c[0], c[1] + 2, c[2]], [Math.PI, 0, 0]);
        for (let k = -1; k <= 1; k++) F.add(CONE(1.6, 12, 3), C.sageDD, [c[0] + k * 2.5, c[1] + 11, c[2]], [0, 0, k * 0.35]);
      }
      return [B, F];
    },
    reg() {
      const B = new Bk(),
        x = -110,
        y = 95;
      B.add(CYL(15, 16, 24, 10), C.teal, P(x, y, 12));
      B.add(CYL(15.5, 15.5, 1.5, 10), '#A7CBC1', P(x, y, 24));
      limb(B, [x - 12, y, 10], [x - 40, y, 34], 3.2, 2.2, '#7EA79C');
      B.add(CYL(4.5, 3, 4, 6), '#6F968C', P(x - 41, y, 35), [0, 0, 1]);
      B.add(TOR(10, 1.8, 4, 10, Math.PI), C.tealD, P(x + 3, y, 24), [0, 0, 0]);
      return [B];
    },
    /* ── Verano ── */
    pileta() {
      const B = new Bk(),
        x = 40,
        y = -50;
      B.add(
        LATHE(
          [
            [76, 1],
            [76, 9],
            [92, 9],
            [92, 0],
          ],
          6,
        ),
        '#F3DFB4',
        P(x, y, 0),
        [0, Math.PI / 2, 0],
      );
      B.add(CYL(76, 76, 1, 6), '#5FA9B6', P(x, y, 1), [0, Math.PI / 2, 0]);
      B.add(TOR(13, 4, 5, 14), C.petal, P(x + 30, y - 18, 9.5), [Math.PI / 2, 0, 0]);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * 6.28 + 0.4;
        B.add(BOX(4, 4.4, 6), C.cream, P(x + 30 + Math.cos(a) * 13, y - 18 + Math.sin(a) * 13, 9.5), [0, -a, 0]);
      }
      for (const dx of [0, 10]) B.add(CYL(1.2, 1.2, 22, 5), '#B7C3C6', P(x + 70 + dx, y - 10, 14));
      for (let k = 0; k < 3; k++) B.add(CYL(0.9, 0.9, 10, 4), '#B7C3C6', P(x + 75, y - 10, 10 + k * 6), [0, 0, Math.PI / 2]);
      const W = new T3.Mesh(CYL(75.5, 75.5, 1, 6), WATER());
      W.position.set(...P(x, y, 6.8));
      W.rotation.y = Math.PI / 2;
      return [B, W];
    },
    sombrilla() {
      const B = new Bk(),
        x = -205,
        y = -60;
      B.add(CYL(2.4, 2.4, 152, 6), '#E9D7B0', P(x, y, 76));
      B.add(CYL(14, 16, 4, 10), '#C9A05C', P(x, y, 2));
      for (let k = 0; k < 8; k++) B.add(CYL(3, 74, 26, 1, true, (k * Math.PI) / 4, Math.PI / 4), k % 2 ? C.cream : C.petalD, P(x, y, 159));
      B.add(SPH(4, 6, 5), C.honey, P(x, y, 173));
      return [B];
    },
    tumbona() {
      const B = new Bk(),
        x = -120,
        y = -10;
      for (const dx of [-40, 40]) for (const dy of [-14, 14]) B.add(CYL(1.8, 1.8, 16, 4), '#A87544', P(x + dx, y + dy, 8));
      B.add(BOX(90, 4, 36), '#C98A42', P(x + 1, y, 17));
      B.add(BOX(62, 3, 32), C.cream, P(x + 13, y, 20));
      for (let k = 0; k < 6; k++) B.add(BOX(5, 3.2, 32.4), '#8EC3CF', P(x - 11 + k * 11, y, 20.1));
      const th = Math.atan2(33, -28);
      B.add(BOX(43, 3, 32), C.cream, P(x - 32, y, 35.5), [0, 0, th]);
      for (let k = 0; k < 3; k++) {
        const f = 0.18 + k * 0.3;
        B.add(BOX(5, 3.2, 32.4), '#8EC3CF', P(x - 18 - 28 * f, y, 19 + 33 * f), [0, 0, th]);
      }
      return [B];
    },
    limonada() {
      const B = new Bk(),
        x = -78,
        y = -122;
      B.add(CYL(2, 2, 34, 5), '#A87544', P(x, y, 17));
      B.add(CYL(10, 12, 2, 8), '#A87544', P(x, y, 1));
      B.add(CYL(22, 22, 3, 14), C.cream, P(x, y, 36));
      B.add(CYL(6, 7, 20, 8), '#F2CF46', P(x - 4, y, 47.5));
      B.add(CYL(6.2, 6.2, 3, 8), '#FFF4C0', P(x - 4, y, 56));
      B.add(TOR(4, 1, 3, 8, Math.PI), '#E9C23A', P(x + 2, y, 48), [0, 0, -Math.PI / 2]);
      for (const dx of [10, 16]) B.add(CYL(3.4, 3, 10, 6), '#F7E08A', P(x + dx, y + 4, 42.5));
      return [B];
    },
    /* ── Otoño ── */
    prensa() {
      const B = new Bk(),
        x = 135,
        y = -45;
      for (const dx of [-34, 34]) for (const dy of [-16, 16]) B.add(BOX(4, 34, 4), '#5F5048', P(x + dx, y + dy, 17));
      B.add(BOX(80, 10, 40), '#B8783A', P(x, y, 39));
      B.add(BOX(48, 26, 32), '#6F8D8A', P(x - 2, y, 57));
      B.add(BOX(56, 10, 28), '#5F7B78', P(x - 2, y, 75));
      B.add(BOX(44, 1, 32), C.cream, P(x - 2, y + 6, 44.6));
      B.add(CIRC(6, 10), C.petalD, P(x, y + 8, 45.2), [-Math.PI / 2, 0, 0]);
      B.add(CIRC(5, 10), C.teal, P(x + 7, y + 10, 45.25), [-Math.PI / 2, 0, 0]);
      B.add(CYL(2, 2, 26, 6), '#5A4A42', P(x + 33, y, 62), [0, 0, Math.PI / 2]);
      const w = P(x + 46, y, 62);
      B.add(TOR(20, 2.8, 5, 18), '#D69646', w, [0, Math.PI / 2, 0]);
      for (let k = 0; k < 6; k++) B.add(BOX(2, 36, 2), '#D69646', w, [(k * Math.PI) / 6, 0, 0]);
      B.add(SPH(4, 6, 5), C.honeyL, w);
      return [B];
    },
    arce() {
      const B = new Bk(),
        F = new Bk(),
        x = 192,
        y = -128;
      pot(B, x, y, 30, 38, C.teal);
      trunk(B, x, y, 38, 128, 'arc');
      crown(F, x, y, 152, 'arc1', ['#B8563A', '#E07A3E', '#F0A848'], 20, 44, 21);
      const R = rf('arc2');
      for (let k = 0; k < 26; k++) {
        const a = R(0, 6.28),
          d = Math.sqrt(R(0, 1)) * 45;
        F.add(OCT(5), LEAF_O[k % 4], P(210 + Math.cos(a) * d * 1.2, -40 + Math.sin(a) * d * 0.7, 1), [0, R(0, 6), 0], [1.2, 0.18, 0.7]);
      }
      return [B, F];
    },
    /* ── Invierno ── */
    sillon() {
      const B = new Bk(),
        x = -110,
        y = 20;
      const pink = '#E07F7F',
        pinkD = '#D46F6F',
        top = '#F4AFA6';
      B.add(BOX(80, 74, 18), pink, P(x, y - 21, 37));
      B.add(BOX(76, 4, 14), top, P(x, y - 21, 75));
      B.add(BOX(84, 26, 40), pink, P(x, y + 6, 13));
      B.add(BOX(70, 6, 36), top, P(x, y + 8, 28));
      for (const s of [-1, 1]) {
        B.add(BOX(12, 40, 48), pinkD, P(x + s * 40, y + 4, 20));
        B.add(CYL(6, 6, 48, 8, false, 0, Math.PI), '#EE9A93', P(x + s * 40, y + 4, 40), [Math.PI / 2, 0, 0]);
      }
      for (const dx of [-36, 36]) for (const dy of [-26, 24]) B.add(CYL(2.4, 1.8, 6, 6), '#8A5A3A', P(x + dx, y + dy, 0));
      /* la manta de punto, caída sobre el respaldo y el brazo */
      B.add(BOX(24, 3, 22), C.sage, P(x + 22, y - 21, 76));
      B.add(BOX(24, 40, 3), C.sage, P(x + 22, y - 10, 56), [0.15, 0, 0]);
      B.add(BOX(24, 3, 30), C.sage, P(x + 24, y + 12, 30));
      B.add(BOX(24, 26, 3), C.sage, P(x + 26, y + 28, 16));
      for (let k = 0; k < 5; k++) B.add(BOX(1.2, 3.4, 23), C.cream, P(x + 12 + k * 5, y - 21, 76.2));
      return [B];
    },
    pino() {
      const B = new Bk(),
        F = new Bk(),
        x = 205,
        y = 62;
      pot(B, x, y, 30, 36, C.petalD);
      B.add(CYL(4, 5, 22, 6), C.brown, P(x, y, 45));
      for (let k = 0; k < 3; k++) {
        const zb = 54 + k * 40,
          rw = 56 - k * 14;
        F.add(CONE(rw, 62, 8), k % 2 ? C.sageD : '#5F7F50', P(x, y, zb + 31), [0, k * 0.4, 0]);
        F.add(TOR(rw * 0.88, 3.2, 4, 16), C.cream, P(x, y, zb + 3), [Math.PI / 2, 0, 0]);
      }
      F.add(OCT(10), C.butter, P(x, y, 198), [0, 0, 0], [1, 1.2, 0.5]);
      const R = rf('pin');
      const cols = [C.butter, C.petal, C.teal, '#8EC3CF', C.petalD];
      for (let k = 0; k < 16; k++) {
        const t = k / 16,
          zb = 60 + t * 112,
          rw = (56 - Math.floor(t * 3) * 14) * (1 - ((zb - 54) % 40) / 62) * 0.9 + 4,
          a = R(0, 6.28);
        F.add(SPH(3.2, 5, 4), cols[k % 5], P(x + Math.cos(a) * rw, y + Math.sin(a) * rw, zb));
      }
      return [B, F];
    },
  };
  let WM = null;
  const WATER = () =>
    WM ||
    (WM = Object.assign(new T3.MeshLambertMaterial({ color: '#7CC6D2', emissive: '#2C6E7C', emissiveIntensity: 0.35 }), {
      userData: { shared: true },
    }));
  const CACHE = {};
  const stateKey = (id) => (id === 'cerezo' ? (PROG.F.bloom ? 'b' : 'n') : '');
  function make(roomId, pr) {
    const key = roomId + ':' + pr.id + ':' + stateKey(pr.id);
    let g = CACHE[key];
    if (!g) {
      g = new T3.Group();
      g.userData = { kind: 'prop3d', id: pr.id };
      const parts = B3[pr.id]();
      parts.forEach((b, i) => {
        if (!b) return;
        if (b.isMesh) {
          g.add(b);
          return;
        }
        const m = b.mesh(g, i > 0);
        if (m) m.userData.lp = 1;
      });
      CACHE[key] = g;
    }
    return g;
  }

  /* ── baldosas en relieve: la misma rejilla que el suelo pintado (rt=27), con su pintura encima ── */
  let TG = null;
  function tilesGeo() {
    if (TG) return TG;
    const rt = 27,
      rr = rt - 2.6,
      h = 2.6,
      ins = R - 3,
      pos = [],
      uv = [],
      col = [];
    const FHh = R * Math.sin(Math.PI / 3) * K;
    const inHex = (x, y) => {
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3 + Math.PI / 6;
        if (x * Math.cos(a) + y * Math.sin(a) > ins * Math.cos(Math.PI / 6)) return false;
      }
      return true;
    };
    const U = (x, y) => [(x + R) / (2 * R), 1 - (y * K + FHh) / (2 * FHh)];
    const push = (x, y, z, sh) => {
      pos.push(x, z, y);
      uv.push(...U(x, y));
      col.push(sh, sh, sh);
    };
    for (let q = -8; q <= 8; q++)
      for (let r = -8; r <= 8; r++) {
        const cx = 1.5 * rt * q,
          cy = Math.sqrt(3) * rt * (r + q / 2);
        const V = hexV(rr, cx, cy);
        if (!V.every((v) => inHex(v[0], v[1]))) continue;
        const Vt = hexV(rr - 1.2, cx, cy);
        for (let k = 0; k < 6; k++) {
          const a = Vt[k],
            b = Vt[(k + 1) % 6];
          push(cx, cy, h, 1);
          push(b[0], b[1], h, 1);
          push(a[0], a[1], h, 1);
        }
        for (let k = 0; k < 6; k++) {
          const a = V[k],
            b = V[(k + 1) % 6],
            at = Vt[k],
            bt = Vt[(k + 1) % 6],
            ang = ((k + 0.5) * Math.PI) / 3,
            sh = 0.62 + 0.22 * Math.max(0, Math.sin(ang));
          push(a[0], a[1], 0, sh);
          push(at[0], at[1], h, sh);
          push(b[0], b[1], 0, sh);
          push(b[0], b[1], 0, sh);
          push(at[0], at[1], h, sh);
          push(bt[0], bt[1], h, sh);
        }
      }
    const g = new T3.BufferGeometry();
    g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new T3.Float32BufferAttribute(uv, 2));
    g.setAttribute('color', new T3.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    g.userData.shared = true;
    return (TG = g);
  }

  /* ══ decoración de cuarto en 3D (paredes, suelo y vida) — habitación por habitación ══ */
  /* un punto en la pared e (u a lo largo, z de altura, d hacia dentro) y el giro que mira al centro */
  const WP = (e, u, z, d = 0) => {
    const q = wallPt(e, u, z, d);
    return [q[0], q[2], q[1]];
  };
  const WYAW = (e) => {
    const A = VI[e[0]],
      B = VI[e[1]],
      mx = (A[0] + B[0]) / 2,
      my = (A[1] + B[1]) / 2;
    return Math.atan2(-mx, -my);
  };
  let SUNM = null;
  const sunMat = () =>
    SUNM ||
    (SUNM = Object.assign(
      new T3.MeshBasicMaterial({
        color: '#FFF2C4',
        transparent: true,
        opacity: 0.14,
        blending: T3.AdditiveBlending,
        depthWrite: false,
        side: T3.DoubleSide,
        fog: false,
      }),
      { userData: { shared: true } },
    ));
  let GLASSM = null;
  const glassMat = () =>
    GLASSM ||
    (GLASSM = Object.assign(new T3.MeshLambertMaterial({ color: '#CFE6EE', emissive: '#9CC4D4', emissiveIntensity: 0.55 }), {
      userData: { shared: true },
    }));
  function shelf(B, e, u0, u1, z, dep, col) {
    const um = (u0 + u1) / 2,
      L = (u1 - u0) * Math.hypot(VI[e[1]][0] - VI[e[0]][0], VI[e[1]][1] - VI[e[0]][1]),
      y = WYAW(e);
    B.add(BOX(L, 3, dep), col, WP(e, um, z, dep / 2 + 1), [0, y, 0]);
    for (const u of [u0 + 0.02, u1 - 0.02]) B.add(BOX(3, 10, dep * 0.8), shd(col, 0.8), WP(e, u, z - 6, dep * 0.4 + 1), [0, y, 0]);
  }
  function potPlant(B, F, p, col, seed, flower) {
    const [x, y, z] = p;
    B.add(
      LATHE(
        [
          [6, 0],
          [8, 11],
          [8.6, 11],
          [8.6, 13],
          [6.6, 13],
        ],
        10,
      ),
      col,
      [x, y, z],
    );
    B.add(CYL(6.6, 6.6, 1, 10), C.soil, [x, y + 12.4, z]);
    const R = rf(seed);
    for (let k = 0; k < 5; k++) {
      const a = R(0, 6.28);
      F.add(
        OCT(4.5),
        k % 2 ? C.sage : C.sageD,
        [x + Math.cos(a) * 4, y + 16 + R(0, 6), z + Math.sin(a) * 4],
        [R(0, 3), a, R(-0.5, 0.5)],
        [1, 1.8, 0.35],
      );
    }
    if (flower) F.add(SPH(2.6, 5, 4), flower, [x + 1, y + 24, z]);
  }
  const ROOM3D = {
    /* 1 · Primavera — la celda de Brote: un invernadero de cera en primavera */
    pri() {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        R = rf('pri3d'),
        bt = [4, 5],
        lt = [3, 4],
        rt = [5, 0];
      /* ventana hexagonal sobre la puerta del fondo, con su marco de cera y un rayo de sol */
      const wy = WYAW(bt),
        wc = WP(bt, 0.5, 80, 1);
      B.addM(
        LATHE(
          [
            [37, -4],
            [49, -4],
            [49, 4],
            [37, 4],
          ],
          6,
        ),
        C.honey,
        new T3.Matrix4()
          .makeRotationY(wy)
          .multiply(new T3.Matrix4().makeRotationX(Math.PI / 2))
          .multiply(new T3.Matrix4().makeRotationY(Math.PI / 6))
          .setPosition(...wc),
      );
      B.add(BOX(2.4, 74, 2.6), C.honeyL, WP(bt, 0.5, 80, 2), [0, wy, 0]);
      B.add(BOX(74, 2.4, 2.6), C.honeyL, WP(bt, 0.5, 80, 2), [0, wy, 0]);
      B.add(BOX(64, 4, 10), '#D89A45', WP(bt, 0.5, 33, 4), [0, wy, 0]);
      {
        const sg = new T3.PlaneGeometry(70, 260);
        sg.translate(0, -130, 0);
        sg.userData.shared = true;
        const s = new T3.Mesh(sg, sunMat());
        s.position.set(...WP(bt, 0.5, 80, 10));
        s.rotation.order = 'YXZ';
        s.rotation.set(-0.62, wy, 0);
        s.userData.sun = 1;
        g.add(s);
      }
      /* pared izquierda: un estante con macetas */
      shelf(B, lt, 0.06, 0.3, 74, 24, '#D89A45');
      potPlant(B, F, WP(lt, 0.12, 76, 12), C.terra, 'p1');
      potPlant(B, F, WP(lt, 0.2, 76, 12), C.teal, 'p2', C.petal);
      potPlant(B, F, WP(lt, 0.26, 76, 12), C.terra, 'p3');
      /* pared derecha: una celosía de listones con una enredadera en flor */
      {
        const y = WYAW(rt),
          L = 300;
        for (const [a0, a1] of [[0.08, 0.34]]) {
          for (let k = 0; k < 4; k++) {
            const a = a0 + (k * (a1 - a0)) / 3,
              b = Math.min(a1, a + 0.12);
            for (const [u0, u1] of [
              [a, b],
              [b, a],
            ]) {
              const p0 = WP(rt, u0, 24, 3),
                p1 = WP(rt, u1, 120, 3);
              const dx = p1[0] - p0[0],
                dz = p1[2] - p0[2],
                dh = p1[1] - p0[1],
                l = Math.hypot(dx, dh, dz);
              B.add(
                BOX(2.6, l, 2.2),
                C.cream,
                [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2],
                [0, y, Math.atan2((u1 - u0) * L, dh) * -1],
              );
            }
          }
        }
        for (let k = 0; k < 14; k++) {
          const u = R(0.09, 0.33),
            z = R(28, 118);
          F.add(OCT(5.5), k % 3 ? C.sage : C.sageD, WP(rt, u, z, 5), [R(0, 3), y, R(0, 3)], [1, 1.6, 0.3]);
          if (k % 3 === 0)
            F.add(SPH(3.2, 5, 4), [C.petal, C.petalL, '#D8A3C9'][k % 3 === 0 ? ((k / 3) | 0) % 3 : 0], WP(rt, u + 0.01, z + 4, 7));
        }
      }
      /* suelo: camino de piedras desde la puerta delantera hasta el huerto */
      for (let k = 0; k < 6; k++) {
        const t = k / 5,
          x = lerp(-4, 18, t) + Math.sin(t * 3) * 14,
          y = lerp(222, 40, t);
        B.add(CYL(15 - k * 0.5, 16, 2.2, 8), k % 2 ? '#D8CBB0' : '#CBBD9E', [x, 3.4, y], [0, R(0, 2), 0], [1, 1, 0.82]);
      }
      /* dos matas de flores, en las esquinas de delante */
      for (const [cx, cy] of [
        [-180, 175],
        [180, 160],
      ]) {
        for (let k = 0; k < 7; k++) {
          const a = R(0, 6.28),
            d = R(0, 18);
          F.add(
            SPH(R(6, 10), 5, 4),
            k % 2 ? C.sage : C.sageD,
            [cx + Math.cos(a) * d, 5 + R(0, 4), cy + Math.sin(a) * d],
            [0, a, 0],
            [1, 0.7, 1],
          );
        }
        for (let k = 0; k < 6; k++) {
          const a = R(0, 6.28),
            d = R(0, 18);
          F.add(SPH(3, 5, 4), [C.petal, C.butter, C.cream, C.petalD][k % 4], [cx + Math.cos(a) * d, 13 + R(0, 4), cy + Math.sin(a) * d]);
        }
      }
      B.mesh(g);
      F.mesh(g, true);
      /* mariposas: tres, revoloteando entre las flores y el cerezo */
      const BF = [];
      for (let k = 0; k < 3; k++) {
        const b = new T3.Group(),
          col = [C.petalD, C.butter, '#8EC3CF'][k];
        for (const s of [-1, 1]) {
          const w = new T3.Mesh(CIRC(5, 6), new T3.MeshBasicMaterial({ color: col, side: T3.DoubleSide }));
          w.position.x = s * 4;
          w.scale.set(1, 0.7, 1);
          b.add(w);
          w.userData.s = s;
        }
        g.add(b);
        BF.push({ b, k, cx: [-130, 10, 180][k], cy: [-150, -40, 90][k] });
      }
      g.userData.tick = (t, still, amb) => {
        for (const f of BF) {
          const tt = t * 0.5 + f.k * 2.1;
          f.b.position.set(f.cx + Math.sin(tt) * 60, 70 + Math.sin(tt * 1.7) * 18, f.cy + Math.cos(tt * 0.8) * 45);
          f.b.rotation.y = -tt;
          const fl = still ? 0.3 : Math.sin(t * 22 + f.k) * 1.1;
          f.b.children[0].rotation.y = fl;
          f.b.children[1].rotation.y = -fl;
          f.b.visible = amb > 0.6;
        }
        for (const o of g.children)
          if (o.userData.sun) {
            o.material.opacity = 0.05 + 0.12 * Math.max(0, amb - 0.4) * (still ? 1 : 0.85 + 0.15 * Math.sin(t * 0.7));
          }
      };
      return g;
    },
  };
  /* ¿esta celda tiene paredes y suelo decorados en 3D? (entonces su pintura de pared va lisa) */
  window.WALL3D = Object.fromEntries(Object.keys(ROOM3D).map((k) => [k, true]));
  const RC3 = {};
  function room(id) {
    if (!ROOM3D[id]) return null;
    return RC3[id] || (RC3[id] = ROOM3D[id]());
  }

  return {
    has: (id) => !!B3[id],
    make,
    tilesGeo,
    room,
    keys: () => Object.keys(B3),
    addRoom: (id, f) => {
      ROOM3D[id] = f;
      delete RC3[id];
    },
    kit: { WP, WYAW, shelf, potPlant, pot, crown, trunk, limb, P, rf, sunMat, glassMat },
  };
})();
window.PROPS3D = PROPS3D;
