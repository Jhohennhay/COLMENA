/* ══════════ SALAS 3 · el segundo barrio: Espacio, Desierto y Antártida (Océano ya está en salas.js) ══════════
   Mismo criterio que las anteriores, con la lección de la limpieza: una pieza protagonista, algo que sobresale
   del muro, suelo propio, luz con intención, UNA cosa en altura y UN movimiento. Pocas piezas y suelo libre.
   No cambia la lógica: vecinos, puertas, objetos y recuerdos siguen en su sitio. */
(() => {
  if (!window.SALAS || !SALAS.kit.texFloor || !window.PROPS3D || !window.LP3D || !window.THREE) return;
  const T3 = THREE,
    { Bk, SPH, CYL, CONE, BOX, TOR, LATHE, CIRC, mat, glowSprite } = LP3D.kit,
    { WYAW, P, rf, limb } = PROPS3D.kit,
    { keep, ctex, solid, lightPool, layer, vignette, blobs, poolTex, tx, ty, texFloor, hangers } = SALAS.kit;
  const LT = [3, 4],
    BT = [4, 5],
    RT = [5, 0],
    HALF = Math.PI / 2;

  /* ═════════════════ DE CERCA · la pieza protagonista, con detalle solo para el modo explorar ═════════════════
     Como en Primavera y las estaciones (salas.js, salas2.js): lo fino solo se ve en modo explorar y en el cuarto
     donde está el chico. Aquí además se construye la primera vez que hace falta, así que en la vista normal no cuesta
     ni dibujo, ni triángulos, ni memoria. Cada cuarto suma UNA malla fundida. Tres formas de sustituir sin subir llamadas:
     · encima de lo de siempre (la malla grande del cuarto sigue debajo, envuelta por la nueva, y da la sombra);
     · ocultando la carta de papel del mueble (`carta`), que se cambia por el modelo en 3D;
     · cambiando la geometría de una malla que ya existe (`cambia`): ruedas, péndulo, hielo. */
  const DC = [],
    cartaDe = (c) => {
      const r = window.R3D && R3D.rooms && R3D.rooms[c.id];
      if (!r || !r.grp) return null;
      return r.grp.children.find(
        (q) => q.userData.kind === 'prop' && Math.abs(q.position.x - c.o.carta[0]) < 2 && Math.abs(q.position.z - c.o.carta[1]) < 2,
      );
    },
    /* varias geometrías de Bk (posición, normal y color) en una sola */
    funde = (gs) => {
      if (gs.length === 1) return gs[0];
      const n = gs.reduce((a, q) => a + q.attributes.position.count, 0),
        G = new T3.BufferGeometry();
      for (const k of ['position', 'normal', 'color']) {
        const A = new Float32Array(n * 3);
        let o = 0;
        for (const q of gs) {
          A.set(q.attributes[k].array, o);
          o += q.attributes[k].array.length;
        }
        G.setAttribute(k, new T3.BufferAttribute(A, 3));
      }
      G.computeBoundingSphere();
      G.userData.shared = true;
      return G;
    },
    monta = (c) => {
      const r = c.build(),
        near = new T3.Group(),
        m = new T3.Mesh(funde([r.B.geo(), ...(r.extra || [])]), c.o.mat ? c.o.mat() : mat());
      /* no entra en los rayos de la cámara de explorar: la malla de debajo ya la representa */
      m.userData.lp = 1;
      m.userData.detalle = true;
      near.add(m, ...(r.hijos || []));
      near.visible = false;
      c.g.add(near);
      c.near = near;
      c.malla = m;
      c.cambia = (r.cambia || []).map(([q, g]) => ({ q, far: q.geometry, g }));
      c.clave = c.o.clave ? c.o.clave() : 0;
    },
    deCerca = (id, g, build, o = {}) => DC.push({ id, g, build, o, near: null, v: false });
  if (window.R3DX)
    R3DX.push(() => {
      for (const c of DC) {
        const v = typeof EXPLORA !== 'undefined' && EXPLORA.on && cur === c.id;
        if (!v && !c.v) continue;
        if (v && !c.fallo && (!c.near || (c.o.clave && c.o.clave() !== c.clave))) {
          try {
            if (c.near) {
              for (const q of c.cambia) q.q.geometry = q.far;
              c.g.remove(c.near);
              c.malla.geometry.dispose();
            }
            monta(c);
          } catch (e) {
            c.fallo = true;
            console.warn('pieza de cerca', c.id, e);
          }
        }
        if (!c.near || c.fallo) continue;
        c.near.visible = v;
        /* la sombra la da la malla de debajo, salvo donde esta sustituye a una carta */
        if (v) {
          c.malla.castShadow = !!c.o.carta;
          for (const q of c.near.children) if (q !== c.malla) q.castShadow = false;
        }
        for (const q of c.cambia) q.q.geometry = v ? q.g : q.far;
        if (c.o.carta) {
          const k = cartaDe(c);
          if (k) k.visible = !v;
        }
        c.v = v;
      }
    });
  /* piezas para modelar: un punto y sus ejes en coordenadas del cuarto (z arriba) */
  const V3 = (a, b, c) => new T3.Vector3(a, b, c),
    W = (v) => V3(v[0], v[2], v[1]),
    BX = BOX(1, 1, 1),
    /* coloca geo con su eje Y hacia `up` y su eje Z hacia `fr`, en el punto p */
    pon = (B, geo, col, p, up, fr = [0, 1, 0], s = [1, 1, 1]) => {
      const Y = W(up).normalize();
      let Z = W(fr);
      Z.addScaledVector(Y, -Z.dot(Y));
      if (Z.lengthSq() < 1e-6) {
        Z = V3(1, 0, 0);
        Z.addScaledVector(Y, -Y.x);
      }
      Z.normalize();
      const X = V3(0, 0, 0).crossVectors(Y, Z);
      B.addM(
        geo,
        col,
        new T3.Matrix4()
          .makeBasis(X, Y, Z)
          .setPosition(...P(...p))
          .scale(V3(...s)),
      );
    },
    /* un tubo sin tapas por una línea de puntos; rad es un número o una función de 0 a 1 */
    tubo = (B, pts, rad, col, n = 6) => {
      const N = pts.length,
        pos = [],
        nor = [],
        idx = [],
        t = V3(0, 0, 0);
      let ref = null;
      for (let i = 0; i < N; i++) {
        const a = W(pts[i]);
        t.copy(W(pts[Math.min(i + 1, N - 1)]))
          .sub(W(pts[Math.max(i - 1, 0)]))
          .normalize();
        if (!ref) ref = Math.abs(t.y) < 0.9 ? V3(0, 1, 0) : V3(1, 0, 0);
        ref.addScaledVector(t, -ref.dot(t)).normalize();
        const v = V3(0, 0, 0).crossVectors(t, ref),
          r = typeof rad === 'function' ? rad(i / (N - 1)) : rad;
        for (let k = 0; k < n; k++) {
          const q = (k / n) * 6.2832,
            c = Math.cos(q),
            s = Math.sin(q),
            nx = ref.x * c + v.x * s,
            ny = ref.y * c + v.y * s,
            nz = ref.z * c + v.z * s;
          pos.push(a.x + nx * r, a.y + ny * r, a.z + nz * r);
          nor.push(nx, ny, nz);
          if (i < N - 1) {
            const j = i * n + k,
              l = i * n + ((k + 1) % n);
            idx.push(j, l, j + n, l, l + n, j + n);
          }
        }
      }
      const g = new T3.BufferGeometry();
      g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new T3.Float32BufferAttribute(nor, 3));
      g.setIndex(idx);
      B.add(g, col);
    },
    /* la misma geometría con caras planas (hielo, roca) */
    plana = (g) => {
      const q = g.index ? g.toNonIndexed() : g.clone();
      q.computeVertexNormals();
      q.userData.shared = true;
      return q;
    },
    /* un bloque con las esquinas comidas (nieve, hielo, migas) */
    BLQ = (() => {
      let G = null;
      return () => {
        if (G) return G;
        G = new T3.BoxGeometry(1, 1, 1, 2, 2, 2);
        const a = G.attributes.position;
        for (let i = 0; i < a.count; i++) {
          const k = Math.abs(a.getX(i)) + Math.abs(a.getY(i)) + Math.abs(a.getZ(i)),
            s = k > 1.2 ? 0.78 : k > 0.8 ? 0.95 : 1;
          a.setXYZ(i, a.getX(i) * s, a.getY(i) * s, a.getZ(i) * s);
        }
        G.computeVertexNormals();
        G.userData.shared = true;
        return G;
      };
    })();
  Object.assign(SALAS.kit, { deCerca, pon, tubo, plana, BLQ, BX, V3 });

  /* ═════════════════ ESPACIO · la cúpula del observatorio y las estrellas cansadas ═════════════════ */
  const ESP = (() => {
    const id = 'esp',
      R0 = rf('sala-esp'),
      ROLL = wallPt(RT, 0.55, 0, 34);
    solid(id, ROLL[0], ROLL[1], 20);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        LATON = '#C9A24A',
        A = [0, -150, 232];
      /* ── la cúpula: seis costillas de latón desde el muro hasta el anillo, con la rendija abierta al fondo ── */
      const pies = [
          wallPt(LT, 0.2, 100, -6),
          wallPt(LT, 0.78, 100, -6),
          wallPt(BT, 0.22, 100, -6),
          wallPt(BT, 0.78, 100, -6),
          wallPt(RT, 0.22, 100, -6),
          wallPt(RT, 0.8, 100, -6),
        ],
        medios = [];
      pies.forEach((s) => {
        const c = [s[0] * 0.8 + A[0] * 0.2, s[1] * 0.8 + A[1] * 0.2, 226];
        let a = s;
        for (let k = 1; k <= 7; k++) {
          const t = k / 7,
            u = 1 - t,
            b = [
              u * u * s[0] + 2 * u * t * c[0] + t * t * A[0],
              u * u * s[1] + 2 * u * t * c[1] + t * t * A[1],
              u * u * s[2] + 2 * u * t * c[2] + t * t * A[2],
            ];
          limb(B, a, b, 3.2, 3.2, k % 2 ? LATON : '#B8903C', 5);
          if (k === 3) medios.push(b);
          a = b;
        }
      });
      /* el aro a media altura une las costillas, salvo en la rendija por donde mira el telescopio */
      for (let k = 1; k < medios.length; k++) if (k !== 3) limb(B, medios[k - 1], medios[k], 2, 2, '#B8903C', 4);
      B.add(TOR(24, 3.4, 6, 18), LATON, P(A[0], A[1], A[2]), [Math.PI / 2, 0, 0]);
      /* ── rollos de cartas celestes contra la pared ── */
      for (let k = 0; k < 5; k++)
        B.add(
          CYL(3.6, 3.6, 40, 8),
          k % 2 ? '#EFE6C8' : '#D9CDA8',
          P(ROLL[0] + (k % 3) * 5 - 5, ROLL[1] + k * 4 - 8, 5 + Math.floor(k / 3) * 7),
          [0, WYAW(RT) + 0.2 * (k - 2), Math.PI / 2],
        );
      /* ── suelo: azul de noche con una carta de constelaciones y la rosa del observatorio bajo el telescopio ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#2B3260';
        c.fillRect(0, 0, w, w);
        const R1 = rf('esp-suelo');
        blobs(c, w, w, 36, R1, ['rgba(60,70,128,A)', 'rgba(30,34,78,A)'], 30, 90, 0.5);
        const cx = tx(20, w),
          cy = ty(-60, w),
          k = w / (2 * R);
        c.strokeStyle = 'rgba(214,190,120,.55)';
        c.lineWidth = 2;
        for (const r of [96, 112]) {
          c.beginPath();
          c.arc(cx, cy, r * k, 0, 6.28);
          c.stroke();
        }
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * 6.28;
          c.beginPath();
          c.moveTo(cx + Math.cos(a) * 96 * k, cy + Math.sin(a) * 96 * k);
          c.lineTo(cx + Math.cos(a) * (i % 6 ? 104 : 112) * k, cy + Math.sin(a) * (i % 6 ? 104 : 112) * k);
          c.stroke();
        }
        const CON = [
          [
            [-210, 60],
            [-170, 110],
            [-120, 96],
            [-96, 150],
          ],
          [
            [130, 150],
            [180, 110],
            [150, 60],
            [200, 20],
            [236, 50],
          ],
          [
            [-40, 190],
            [10, 160],
            [60, 196],
          ],
        ];
        c.strokeStyle = 'rgba(190,200,255,.3)';
        c.lineWidth = 1.4;
        for (const L of CON) {
          c.beginPath();
          L.forEach(([x, y], i) => (i ? c.lineTo(tx(x, w), ty(y, w)) : c.moveTo(tx(x, w), ty(y, w))));
          c.stroke();
          for (const [x, y] of L) {
            c.fillStyle = 'rgba(255,240,190,.9)';
            c.beginPath();
            c.arc(tx(x, w), ty(y, w), 3, 0, 6.28);
            c.fill();
          }
        }
        c.fillStyle = 'rgba(230,236,255,.5)';
        for (let i = 0; i < 70; i++) c.fillRect(R1(0, w), R1(0, w), 1.4, 1.4);
      });
      texFloor(id, g, fl);
      /* ── en altura, una sola cosa: las estrellas de papel colgadas. Unas brillan; otras están cansadas ── */
      const pts = [
          [-150, -60, 190],
          [-40, -170, 212],
          [96, -150, 198],
          [172, -40, 182],
          [120, 92, 204],
          [-120, 112, 194],
        ],
        CAN = [0, 0, 1, 0, 1, 0];
      for (const q of pts) limb(B, q, [q[0], q[1], 430], 0.5, 0.5, '#8E93B8', 3);
      const SG = new Bk();
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * 6.28 + Math.PI / 2;
        SG.add(CONE(5, 14, 4), '#FFFFFF', [Math.cos(a) * 9, -14 + Math.sin(a) * 9, 0], [0, 0, a - Math.PI / 2], [1, 1, 0.4]);
      }
      SG.add(CYL(6.5, 6.5, 2.4, 10), '#FFFFFF', [0, -14, 0], [Math.PI / 2, 0, 0]);
      const stars = hangers(
        id,
        g,
        pts,
        SG.geo(),
        pts.map((_, i) => (CAN[i] ? '#8E93B8' : i % 2 ? '#FFD36A' : '#FFE9A0')),
        0,
      );
      const glows = [];
      pts.forEach((q, i) => {
        if (CAN[i]) return;
        const s = glowSprite('#FFE9A0', 70);
        s.position.set(...P(q[0], q[1], q[2] - 14));
        g.add(s);
        glows.push({ s, ph: R0(0, 6) });
      });
      /* ── luz: un charco frío bajo el telescopio; los bordes, en añil ── */
      lightPool(id, g, 10, -40, 180, 136, '#AFC2FF', 0.3);
      layer(id, g, vignette('rgba(8,10,40,A)'), 3.5, { op: 0.7 });
      B.mesh(g);
      F.mesh(g, true);
      /* ── de cerca: el telescopio de papel se cambia por uno de verdad, de latón, en su mismo sitio ── */
      deCerca(
        id,
        g,
        () => {
          const N = new Bk(),
            HB = [20, -60, 66],
            d = V3(-0.26, -0.6, 0.76).normalize(),
            D = [d.x, d.y, d.z],
            at = (s, u = [0, 0, 0], k = 0) => [HB[0] + D[0] * s + u[0] * k, HB[1] + D[1] * s + u[1] * k, HB[2] + D[2] * s + u[2] * k],
            tv = V3(D[1], -D[0], 0).normalize(),
            Tv = [tv.x, tv.y, 0],
            nv = V3(0, 0, 0).crossVectors(tv, d),
            Nv = [nv.x, nv.y, nv.z],
            MAD = '#8A5A2E',
            MADO = '#6E4624',
            LAT = '#D8AE58',
            LATO = '#A67C34',
            TUB = '#D69646',
            sec = (s0, prof, col, n = 20) =>
              pon(
                N,
                LATHE(
                  prof.map(([r, y]) => [r, y]),
                  n,
                ),
                col,
                at(s0),
                D,
                Tv,
              ),
            remaches = (s, r, c = 12) => {
              for (let k = 0; k < c; k++) {
                const a = (k / c) * 6.2832,
                  q = [
                    Tv[0] * Math.cos(a) + Nv[0] * Math.sin(a),
                    Tv[1] * Math.cos(a) + Nv[1] * Math.sin(a),
                    Tv[2] * Math.cos(a) + Nv[2] * Math.sin(a),
                  ];
                N.add(SPH(1, 5, 3), '#F3D88E', P(...at(s, q, r)), [0, 0, 0], [0.8, 0.8, 0.8]);
              }
            };
          /* el tubo: ocular, enfoque, dos cuerpos de duelas, abrazaderas de latón y parasol */
          sec(
            -66,
            [
              [0, 0],
              [2.8, 0],
              [3.5, 1],
              [3, 2.2],
              [2.4, 7],
              [2.8, 12],
            ],
            '#3A2E22',
            12,
          );
          sec(
            -54,
            [
              [3.4, 0],
              [3.4, 3],
              [4.4, 3.6],
              [4.4, 14],
              [5.4, 14.6],
              [5.4, 17],
            ],
            LAT,
            14,
          );
          sec(
            -37,
            [
              [6.8, 0],
              [7.2, 1],
              [7.2, 5],
              [6.8, 6],
            ],
            LATO,
            18,
          );
          sec(
            -31,
            [
              [6.9, 0],
              [8.6, 0.8],
              [9.2, 26],
            ],
            TUB,
          );
          sec(
            -5,
            [
              [9.4, 0],
              [10.6, 0.6],
              [10.6, 5.4],
              [9.5, 6],
            ],
            LATO,
          );
          sec(
            1,
            [
              [9.4, 0],
              [10.6, 44],
            ],
            TUB,
          );
          sec(
            45,
            [
              [10.8, 0],
              [12, 0.6],
              [12, 5.4],
              [11, 6],
            ],
            LATO,
          );
          sec(
            51,
            [
              [11.2, 0],
              [12.8, 0.4],
              [13.4, 16],
              [14.2, 17],
              [13.8, 18],
            ],
            LAT,
          );
          remaches(-2, 10.7);
          remaches(48, 12.1);
          /* las duelas del tubo */
          for (let k = 0; k < 10; k++) {
            const a = (k / 10) * 6.2832,
              q = [
                Tv[0] * Math.cos(a) + Nv[0] * Math.sin(a),
                Tv[1] * Math.cos(a) + Nv[1] * Math.sin(a),
                Tv[2] * Math.cos(a) + Nv[2] * Math.sin(a),
              ];
            tubo(N, [at(-30, q, 8.9), at(-6, q, 9.5)], 0.22, MAD, 3);
            tubo(N, [at(2, q, 9.65), at(44, q, 10.85)], 0.22, MAD, 3);
          }
          /* rueda dentada de enfoque */
          N.add(CYL(1, 1, 1, 10), LATO, P(...at(-34, Nv, 8.6)), [0, 0, 0], [1, 1, 1]);
          pon(N, CYL(3, 3, 2.2, 12), '#F3D88E', at(-34, Tv, 9), Tv, D);
          for (let k = 0; k < 10; k++) {
            const a = (k / 10) * 6.2832,
              q = [
                D[0] * Math.cos(a) + Nv[0] * Math.sin(a),
                D[1] * Math.cos(a) + Nv[1] * Math.sin(a),
                D[2] * Math.cos(a) + Nv[2] * Math.sin(a),
              ];
            pon(
              N,
              BX,
              LATO,
              [...at(-34, Tv, 9)].map((v, i) => v + q[i] * 3.1),
              Tv,
              q,
              [0.6, 2, 0.8],
            );
          }
          /* el buscador: un anteojo pequeño encima, con dos abrazaderas */
          const bs = (s) => at(s, Nv, 15);
          pon(
            N,
            LATHE(
              [
                [0, 0],
                [2, 0],
                [2.6, 1],
                [2.6, 40],
                [3.2, 41],
                [3.2, 45],
              ],
              10,
            ),
            LAT,
            bs(-12),
            D,
            Tv,
          );
          for (const s of [-4, 24]) limb(N, at(s, Nv, 9), bs(s), 1.3, 1, LATO, 5);
          /* la lente: oscura y rajada hasta que se coloca la nueva */
          const lente = at(68.6),
            viva = !!PROG.F.star,
            hijos = [];
          pon(N, CYL(13.3, 13.3, 0.5, 24), viva ? '#FFF4C2' : '#1B1F3E', lente, D, Tv);
          if (viva) {
            const gl = glowSprite('#FFF0B4', 64);
            gl.position.set(...P(...lente));
            gl.material.opacity = 0.42;
            hijos.push(gl);
          } else {
            const u = (a, b) => at(68.95, [Tv[0] * a + Nv[0] * b, Tv[1] * a + Nv[1] * b, Tv[2] * a + Nv[2] * b], 1);
            tubo(N, [u(-8, -6), u(-1, 0), u(5, -2), u(8, -7)], 0.25, '#6A74B0', 3);
            tubo(N, [u(-1, 0), u(-3, 8)], 0.2, '#6A74B0', 3);
          }
          /* la horquilla y los muñones: el tubo bascula sobre ellos */
          for (const sd of [-1, 1]) {
            const c = at(0, Tv, sd * 13.5);
            limb(N, [HB[0] + Tv[0] * sd * 13, HB[1] + Tv[1] * sd * 13, 49], c, 2.6, 1.9, LATO, 6);
            pon(N, CYL(3.6, 3.6, 3, 14), LAT, c, Tv, D);
            pon(N, CYL(1.4, 1.4, 6, 8), '#F3D88E', at(0, Tv, sd * 11), Tv, D);
          }
          pon(N, BX, LATO, [HB[0], HB[1], 48.5], [0, 0, 1], Tv, [32, 3, 8]);
          /* el círculo graduado del muñón, con sus radios y su palanca de freno */
          {
            const c = at(0, Tv, 16.6);
            pon(N, TOR(12, 0.9, 4, 30), LAT, c, D, Tv);
            for (let k = 0; k < 6; k++) {
              const a = (k / 6) * 6.2832,
                q = [
                  D[0] * Math.cos(a) + Nv[0] * Math.sin(a),
                  D[1] * Math.cos(a) + Nv[1] * Math.sin(a),
                  D[2] * Math.cos(a) + Nv[2] * Math.sin(a),
                ];
              tubo(N, [c, c.map((v, i) => v + q[i] * 12)], 0.5, LATO, 4);
            }
            for (let k = 0; k < 24; k++) {
              const a = (k / 24) * 6.2832,
                q = [
                  D[0] * Math.cos(a) + Nv[0] * Math.sin(a),
                  D[1] * Math.cos(a) + Nv[1] * Math.sin(a),
                  D[2] * Math.cos(a) + Nv[2] * Math.sin(a),
                ];
              pon(
                N,
                BX,
                '#5E4420',
                c.map((v, i) => v + q[i] * 12.7 + Tv[i] * 0.5),
                q,
                Tv,
                [0.35, k % 6 ? 1 : 2, 0.5],
              );
            }
          }
          /* la columna del eje y el círculo horizontal, sobre el cabezal del trípode */
          N.add(
            LATHE(
              [
                [0, 0],
                [7, 0],
                [7.6, 1.2],
                [4.6, 3],
                [3.8, 5.5],
                [5, 7],
                [8, 8],
              ],
              16,
            ),
            LATO,
            P(HB[0], HB[1], 39),
          );
          N.add(TOR(14, 1, 4, 32), LAT, P(HB[0], HB[1], 42), [HALF, 0, 0]);
          N.add(CYL(13.5, 13.5, 1, 20), MADO, P(HB[0], HB[1], 42));
          for (let k = 0; k < 24; k++) {
            const a = (k / 24) * 6.2832;
            N.add(
              BX,
              '#5E4420',
              P(HB[0] + Math.cos(a) * 14.6, HB[1] + Math.sin(a) * 14.6, 42.8),
              [0, -a, 0],
              [k % 6 ? 1.2 : 2.4, 0.4, 0.4],
            );
          }
          /* el trípode: cada pata, dos largueros con travesaños y un regatón de latón; tirantes al collarín */
          const pies = [
              [-30, 11],
              [28, 16],
              [2, -28],
            ],
            collar = [HB[0], HB[1], 16];
          N.add(
            LATHE(
              [
                [0, -1.5],
                [3.6, -1.5],
                [4.2, 0],
                [3.6, 1.5],
                [0, 1.5],
              ],
              12,
            ),
            LATO,
            P(...collar),
          );
          limb(N, collar, [HB[0], HB[1], 40], 1, 1, LATO, 6);
          for (const [dx, dy] of pies) {
            const f = [HB[0] + dx, HB[1] + dy, 0],
              s = V3(-dy, dx, 0).normalize(),
              k = [s.x * 2.1, s.y * 2.1, 0],
              top = [HB[0] + dx * 0.2, HB[1] + dy * 0.2, 40],
              en = (t) => [f[0] + (top[0] - f[0]) * t, f[1] + (top[1] - f[1]) * t, f[2] + (top[2] - f[2]) * t];
            for (const sd of [-1, 1]) {
              const a = en(0.06),
                b = top;
              tubo(
                N,
                [
                  [a[0] + k[0] * sd, a[1] + k[1] * sd, a[2]],
                  [b[0] + (k[0] * sd) / 2, b[1] + (k[1] * sd) / 2, b[2]],
                ],
                (u) => 1.5 - u * 0.2,
                MAD,
                6,
              );
            }
            for (const t of [0.3, 0.55, 0.78])
              limb(N, [en(t)[0] - k[0], en(t)[1] - k[1], en(t)[2]], [en(t)[0] + k[0], en(t)[1] + k[1], en(t)[2]], 1, 1, MADO, 5);
            N.add(
              LATHE(
                [
                  [0, 0],
                  [0.9, 0],
                  [2.6, 3],
                  [2.9, 9],
                  [0, 9],
                ],
                8,
              ),
              LATO,
              P(...en(0)),
              [0, 0, 0],
            );
            N.add(CYL(3.1, 3.1, 1.2, 8), '#F3D88E', P(...en(0.17)));
            tubo(N, [en(0.42), collar], 0.5, LATO, 4);
            N.add(SPH(1, 5, 4), '#F3D88E', P(...en(0.42)), [0, 0, 0], [1.2, 1.2, 1.2]);
          }
          return { B: N, hijos };
        },
        { carta: [22.5, -60], clave: () => (PROG.F.star ? 1 : 0) },
      );
      g.userData.tick = (t, still) => {
        stars(still ? 0 : t, 0.22, 0.9);
        for (const q of glows) q.s.material.opacity = still ? 0.4 : 0.3 + 0.25 * Math.max(0, Math.sin(t * 1.7 + q.ph));
      };
      return g;
    };
  })();

  /* ═════════════════ DESIERTO · el horno de vidrio, los frascos que brillan y la duna que entra ═════════════════ */
  const DES = (() => {
    const id = 'des',
      R0 = rf('sala-des'),
      CH = wallPt(RT, 0.3, 0, 30),
      DUNA = [-176, -172];
    solid(id, CH[0], CH[1], 28);
    solid(id, DUNA[0], DUNA[1], 60);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk();
      /* ── la chimenea del horno: sobresale del muro y humea ── */
      const HC = 206;
      B.add(BOX(46, HC, 46), '#C47A4A', P(CH[0], CH[1], HC / 2), [0, WYAW(RT), 0]);
      for (let z = 30; z < HC; z += 44) B.add(BOX(49, 5, 49), '#A9623A', P(CH[0], CH[1], z), [0, WYAW(RT), 0]);
      B.add(BOX(54, 10, 54), '#8A4E2E', P(CH[0], CH[1], HC + 5), [0, WYAW(RT), 0]);
      limb(B, [128, -78, 74], [CH[0] - 10, CH[1] + 16, 96], 8, 8, '#8A5A3A', 7);
      const boca = glowSprite('#FF9A4A', 120);
      boca.position.set(...P(CH[0], CH[1], HC + 16));
      g.add(boca);
      /* ── el estante de frascos recién soplados, en la pared libre: brillan con luz propia ── */
      {
        const yw = WYAW(LT),
          a = wallPt(LT, 0.3, 66, 13),
          b = wallPt(LT, 0.62, 66, 13),
          m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        B.add(BOX(Math.hypot(b[0] - a[0], b[1] - a[1]) + 16, 4, 22), '#B8823E', P(m[0], m[1], 64), [0, yw, 0]);
        for (const q of [a, b]) limb(B, [q[0], q[1], 62], wallPt(LT, q === a ? 0.3 : 0.62, 40, 2), 2, 2, '#8A5A34', 4);
        const J = new Bk(),
          COL = ['#7FD6D0', '#F6C453', '#F08A6A', '#B9E38A', '#F6C453', '#7FD6D0'];
        COL.forEach((col, k) => {
          const t = (k + 0.5) / COL.length,
            x = a[0] + (b[0] - a[0]) * t,
            y = a[1] + (b[1] - a[1]) * t,
            h = 14 + (k % 3) * 5;
          J.add(CYL(5.5 + (k % 2), 7, h, 8), col, P(x, y, 66 + h / 2));
          J.add(SPH(4.6, 8, 6), col, P(x, y, 66 + h + 2));
          B.add(CYL(2.2, 2.2, 3.4, 6), '#8A6A4A', P(x, y, 66 + h + 7));
        });
        g.add(new T3.Mesh(J.geo(), keep(id, new T3.MeshBasicMaterial({ vertexColors: true }))));
        const gl = glowSprite('#FFE2A8', 190);
        gl.position.set(...P(m[0] + 14, m[1] + 8, 84));
        gl.material.opacity = 0.32;
        g.add(gl);
      }
      /* ── la duna que entra por la esquina del fondo, por encima del muro ── */
      {
        const o = wallPt(LT, 0.93, 0, -26);
        for (const [x, y, z, r, s] of [
          [o[0], o[1], 74, 82, [1.25, 0.8, 1]],
          [DUNA[0] - 6, DUNA[1] - 8, 40, 76, [1.2, 0.62, 1]],
          [DUNA[0] + 22, DUNA[1] + 26, 12, 64, [1.3, 0.36, 1]],
          [DUNA[0] + 64, DUNA[1] + 40, 2, 44, [1.4, 0.2, 1]],
        ])
          B.add(SPH(r, 12, 7), z > 30 ? '#EBC78C' : '#F1D29C', P(x, y, z), [0, 0.5, 0], s);
      }
      /* ── suelo: arena con ondas del viento; más oscura y con hollín junto al horno ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#F2D7A4';
        c.fillRect(0, 0, w, w);
        const R1 = rf('des-suelo');
        blobs(c, w, w, 40, R1, ['rgba(250,232,190,A)', 'rgba(226,190,134,A)'], 30, 90, 0.45);
        c.lineWidth = 1.6;
        for (let i = 0; i < 30; i++) {
          const y = (i / 30) * w + R1(-6, 6);
          c.strokeStyle = i % 2 ? 'rgba(196,150,90,.34)' : 'rgba(255,242,208,.5)';
          c.beginPath();
          for (let x = 0; x <= w; x += 16) c.lineTo(x, y + Math.sin(x * 0.03 + i) * 5 + Math.sin(x * 0.011 + i * 2) * 7);
          c.stroke();
        }
        const h = c.createRadialGradient(tx(120, w), ty(-60, w), 40, tx(120, w), ty(-60, w), 120);
        h.addColorStop(0, 'rgba(96,60,40,.5)');
        h.addColorStop(1, 'rgba(96,60,40,0)');
        c.fillStyle = h;
        c.fillRect(0, 0, w, w);
      });
      texFloor(id, g, fl);
      /* ── en altura, una sola cosa (y el único movimiento): el humo de la chimenea ── */
      const humo = [];
      for (let k = 0; k < 6; k++) {
        const sm = new T3.SpriteMaterial({ map: poolTex(), color: '#E9DCC6', transparent: true, opacity: 0, depthWrite: false });
        sm.userData.shared = true;
        const s = new T3.Sprite(sm);
        g.add(s);
        humo.push({ s, ph: k / 6 });
      }
      /* ── luz: el horno calienta su rincón; los bordes, en terracota ── */
      const pool = lightPool(id, g, 104, -36, 180, 136, '#FFB060', 0.36);
      lightPool(id, g, -140, -40, 120, 90, '#FFE2A8', 0.16);
      layer(id, g, vignette('rgba(120,56,20,A)'), 3.5, { op: 0.5 });
      B.mesh(g);
      F.mesh(g, true);
      /* ── de cerca: el horno de papel se cambia por uno de ladrillo; la chimenea, ladrillo a ladrillo; la duna, con su viento ── */
      deCerca(
        id,
        g,
        () => {
          const N = new Bk(),
            R1 = rf('des-det'),
            KX = 120,
            KY = -60,
            RK = 52,
            HK = 72,
            /* la boca mira hacia el centro del cuarto, algo hacia la cámara */
            DA = Math.atan2(-0.6, 0.8),
            LAD = ['#C9774A', '#BE6E42', '#D48556', '#B5653A', '#C47A4A', '#CF8050'],
            FX = Math.sin(DA),
            FY = Math.cos(DA),
            tono = () => LAD[Math.floor(R1(0, LAD.length))];
          /* la cúpula: argamasa debajo y ladrillos en hiladas que se van cerrando */
          N.add(SPH(1, 22, 8, 0, 6.2832, 0, HALF), '#8E5230', P(KX, KY, 0), [0, 0, 0], [RK, HK, RK]);
          const FIL = 11;
          for (let i = 0; i < FIL; i++) {
            const f = ((i + 0.5) / FIL) * HALF * 0.97,
              rho = RK * Math.cos(f),
              z = HK * Math.sin(f),
              n = Math.max(5, Math.round((6.2832 * rho) / 15.5));
            for (let k = 0; k < n; k++) {
              const a = ((k + (i % 2) * 0.5) / n) * 6.2832;
              const dA = Math.atan2(Math.sin(a - DA), Math.cos(a - DA));
              if (Math.abs(dA) < 0.46 && z < 38) continue;
              const nx = Math.sin(a) * Math.cos(f),
                ny = Math.cos(a) * Math.cos(f),
                nz = Math.sin(f),
                up = [-Math.sin(a) * Math.sin(f) * (HK / RK), -Math.cos(a) * Math.sin(f) * (HK / RK), Math.cos(f)];
              pon(
                N,
                BX,
                tono(),
                [KX + Math.sin(a) * rho + nx, KY + Math.cos(a) * rho + ny, z + nz],
                up,
                [nx, ny, nz],
                [(6.2832 * rho) / n - 1.2, 7.2, 2.2],
              );
            }
          }
          /* el zócalo de piedra alrededor */
          for (let k = 0; k < 22; k++) {
            const a = (k / 22) * 6.2832;
            if (Math.abs(Math.atan2(Math.sin(a - DA), Math.cos(a - DA))) < 0.42) continue;
            N.add(
              BLQ(),
              k % 3 ? '#8A6A52' : '#9C7C60',
              P(KX + Math.sin(a) * (RK + 1.5), KY + Math.cos(a) * (RK + 1.5), 3.2),
              [0, a, 0],
              [15.5, 6.8, 7],
            );
          }
          /* la boca: arco de dovelas, fondo oscuro, fuego abajo, solera y dintel; sobresale de la cúpula */
          const FR = (u, f, z) => [KX + FX * f + FY * u, KY + FY * f - FX * u, z],
            ARC = (r, f0) => {
              const q = [];
              for (let k = 0; k <= 12; k++) {
                const a = (k / 12) * Math.PI;
                q.push(FR(Math.cos(a) * r, f0, 6 + Math.sin(a) * r * 1.25));
              }
              return q;
            };
          const f0 = RK - 3;
          pon(N, CYL(1, 1, 1, 18, false, -HALF, Math.PI), '#3A1E12', FR(0, f0 + 4, 6), [FX, FY, 0], [0, 0, 1], [20, 3, 25]);
          for (let k = 0; k < 11; k++) {
            const a = ((k + 0.5) / 11) * Math.PI,
              uu = Math.cos(a),
              zz = Math.sin(a);
            pon(
              N,
              BLQ(),
              k === 5 ? '#E2A268' : k % 2 ? '#A85E34' : '#B96A3E',
              FR(uu * 23, f0 + 6, 6 + zz * 29),
              [FY * uu, -FX * uu, zz],
              [FX, FY, 0],
              [8.2, 8.4, 13],
            );
          }
          /* el hueco: laterales del arco que se hunden y el fuego (dos capas de llama sobre brasas) */
          tubo(N, ARC(19.6, f0 + 4.5), 1.2, '#2A130A', 5);
          for (let k = 0; k < 5; k++) {
            const u = -11 + k * 5.5;
            pon(
              N,
              CONE(1, 1, 5),
              k % 2 ? '#F08A3A' : '#FFB95A',
              FR(u, f0 + 5.8, 7 + (k % 2 ? 6 : 8)),
              [0, 0, 1],
              [FX, FY, 0],
              [4.4, k % 2 ? 13 : 17, 2.4],
            );
            pon(N, BLQ(), k % 2 ? '#FF7A2A' : '#C8441E', FR(u + 2, f0 + 6, 3.6), [0, 0, 1], [FX, FY, 0], [6, 3.4, 4.5]);
          }
          N.add(BX, '#8A6A52', P(...FR(0, f0 + 7, 1.6)), [0, DA, 0], [46, 3.2, 14]);
          const fuego = glowSprite('#FF9A4A', 95);
          fuego.position.set(...P(...FR(0, f0 + 7, 16)));
          fuego.material.opacity = 0.42;
          /* el tubo que une el horno a la chimenea: con bridas y remaches; el collar sobre la cúpula */
          {
            const a = [128, -78, 72],
              b = [CH[0] - 10, CH[1] + 16, 96],
              en = (t) => a.map((v, i) => v + (b[i] - v) * t),
              dr = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
            tubo(N, [en(-0.04), en(1)], 8.7, '#7A4E32', 10);
            for (const t of [0.04, 0.5, 0.94]) pon(N, CYL(10.4, 10.4, 3, 12), '#5A3A24', en(t), dr);
          }
          /* la chimenea: lechada oscura y ladrillo trabado en las tres caras que se ven; hollín arriba */
          {
            const yw = WYAW(RT),
              A0 = 23.5;
            N.add(BX, '#8E5230', P(CH[0], CH[1], HC / 2), [0, yw, 0], [46.8, HC, 46.8]);
            for (let i = 0; i < 28; i++) {
              const z = 3.7 + i * 7.3,
                hol = Math.min(1, Math.max(0, (z - 150) / 50));
              for (const lado of [0, 1, 3]) {
                const a = yw + (lado * Math.PI) / 2,
                  nx = Math.sin(a),
                  ny = Math.cos(a),
                  tx2 = Math.cos(a),
                  ty2 = -Math.sin(a),
                  N2 = i % 2 ? 3 : 4;
                for (let k = 0; k < N2; k++) {
                  /* hiladas trabadas: tres ladrillos enteros, o dos y dos medios */
                  const w = i % 2 || (k > 0 && k < N2 - 1) ? 14.5 : 6.6,
                    u = i % 2 ? (k - 1) * 15.4 : k === 0 ? -19.2 : k === 3 ? 19.2 : (k - 1.5) * 15.4,
                    col = R1(0, 1) < hol ? '#5E3E2C' : tono();
                  N.add(BX, col, P(CH[0] + nx * (A0 + 0.5) + tx2 * u, CH[1] + ny * (A0 + 0.5) + ty2 * u, z), [0, a, 0], [w, 6.5, 1.3]);
                }
              }
            }
            /* los flejes de siempre, con remaches; la boca, con su borde de hollín */
            for (let z = 30; z < HC; z += 44)
              for (const lado of [0, 1, 3])
                for (const u of [-18, 0, 18]) {
                  const a = yw + (lado * Math.PI) / 2;
                  N.add(
                    SPH(1, 5, 3),
                    '#6E3E22',
                    P(CH[0] + Math.sin(a) * 24.8 + Math.cos(a) * u, CH[1] + Math.cos(a) * 24.8 - Math.sin(a) * u, z),
                    [0, 0, 0],
                    [1.1, 1.1, 0.6],
                  );
                }
            N.add(BX, '#2E1E18', P(CH[0], CH[1], HC + 10.2), [0, yw, 0], [42, 0.4, 42]);
            for (const lado of [0, 1, 2, 3]) {
              const a = yw + (lado * Math.PI) / 2;
              N.add(BX, '#6E4228', P(CH[0] + Math.sin(a) * 25, CH[1] + Math.cos(a) * 25, HC + 12), [0, a, 0], [56, 4, 6]);
            }
          }
          /* la duna: un solo manto sobre las bolas de arena de siempre, con ondas de viento y color por vértice */
          const EL = [
              [wallPt(LT, 0.93, 0, -26)[0], wallPt(LT, 0.93, 0, -26)[1], 74, 82, 1.25, 0.8],
              [DUNA[0] - 6, DUNA[1] - 8, 40, 76, 1.2, 0.62],
              [DUNA[0] + 22, DUNA[1] + 26, 12, 64, 1.3, 0.36],
              [DUNA[0] + 64, DUNA[1] + 40, 2, 44, 1.4, 0.2],
            ],
            cA = Math.cos(0.5),
            sA = Math.sin(0.5),
            /* cae suave hasta el suelo más allá de cada bola y nunca queda por debajo de ella */
            base = (x, y) => {
              let s = 0,
                piso = 0;
              for (const [ex, ey, ez, r, sx, sy] of EL) {
                const dx = x - ex,
                  dy = y - ey,
                  lx = dx * cA - dy * sA,
                  lz = dx * sA + dy * cA,
                  u = (lx / (r * sx)) ** 2 + (lz / r) ** 2;
                if (u < 1) piso = Math.max(piso, ez + r * sy * Math.sqrt(1 - u));
                if (u < 1.5) s += Math.exp(0.11 * (ez + r * sy) * (1 - u / 1.5) ** 0.45);
              }
              return s ? Math.max(piso, Math.log(s) / 0.11, 0) : 0;
            },
            onda = (x, y) => Math.sin((x * 0.82 + y * 0.57) * 0.36 + 1.6 * Math.sin((x - y) * 0.016)),
            alto = (x, y) => {
              const b = base(x, y);
              return b > 0.05 ? b + Math.min(1.4, b * 0.2) : 0;
            };
          const pos = [],
            nor = [],
            col = [],
            ca = new T3.Color('#F4DAA8'),
            cb = new T3.Color('#D8AE74'),
            cc = new T3.Color('#E8C48A'),
            tmp = new T3.Color(),
            ST = 6,
            pv = (x, y) => {
              const h = alto(x, y),
                e = 3,
                o = onda(x, y),
                /* las ondas solo inclinan la luz: en geometría parecían una manta */
                nx = alto(x - e, y) - alto(x + e, y) + o * 0.5 * Math.min(1, h / 20),
                ny = alto(x, y - e) - alto(x, y + e) + o * 0.35 * Math.min(1, h / 20),
                l = Math.hypot(nx, ny, 2 * e);
              pos.push(x, h, y);
              nor.push(nx / l, (2 * e) / l, ny / l);
              tmp.copy(cc).lerp(o > 0 ? ca : cb, 0.55 * Math.abs(o) * Math.min(1, h / 16));
              col.push(tmp.r, tmp.g, tmp.b);
            };
          for (let x = -342; x < -24; x += ST)
            for (let y = -312; y < -60; y += ST) {
              const hs = [base(x, y), base(x + ST, y), base(x, y + ST), base(x + ST, y + ST)];
              if (hs.every((h) => h <= 0.05)) continue;
              pv(x, y);
              pv(x, y + ST);
              pv(x + ST, y);
              pv(x + ST, y);
              pv(x, y + ST);
              pv(x + ST, y + ST);
            }
          const DG = new T3.BufferGeometry();
          DG.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
          DG.setAttribute('normal', new T3.Float32BufferAttribute(nor, 3));
          DG.setAttribute('color', new T3.Float32BufferAttribute(col, 3));
          return { B: N, extra: [DG], hijos: [fuego] };
        },
        { carta: [120, -60] },
      );
      g.userData.tick = (t, still) => {
        const k = still ? 1 : 0.88 + 0.12 * Math.sin(t * 4.3) * Math.sin(t * 1.3);
        boca.material.opacity = 0.5 * k;
        pool.material.opacity = 0.34 * k;
        for (const q of humo) {
          const u = ((still ? 0 : t * 0.07) + q.ph) % 1;
          q.s.position.set(...P(CH[0] + Math.sin(u * 5 + q.ph * 9) * 16, CH[1], HC + 20 + u * 190));
          q.s.scale.setScalar(36 + u * 90);
          q.s.material.opacity = 0.2 * Math.sin(u * Math.PI);
        }
      };
      return g;
    };
  })();

  /* ═════════════════ ANTÁRTIDA · el témpano buzón, las cartas heladas y la aurora ═════════════════ */
  const ANT = (() => {
    const id = 'ant',
      R0 = rf('sala-ant'),
      IX = -166,
      IY = -128,
      CUBO = [-88, -150];
    solid(id, IX, IY, 52);
    solid(id, CUBO[0], CUBO[1], 17);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        H = new Bk();
      /* ── el témpano tallado como buzón: grande, al fondo a la izquierda, por encima del muro ── */
      H.add(CONE(48, 168, 5), '#FFFFFF', P(IX, IY, 84), [0, 0.4, 0]);
      H.add(CONE(28, 104, 5), '#FFFFFF', P(IX + 40, IY + 8, 52), [0.1, 1.1, -0.12]);
      H.add(CONE(22, 70, 4), '#FFFFFF', P(IX - 36, IY + 22, 35), [0.12, 0.2, 0.16]);
      H.add(BOX(27, 27, 27), '#FFFFFF', P(CUBO[0], CUBO[1], 13.5), [0, 0.5, 0]);
      for (const [e, u, h] of [
        [LT, 0.2, 64],
        [BT, 0.55, 54],
        [BT, 0.8, 84],
      ]) {
        const p = wallPt(e, u, 0, 12);
        H.add(CONE(13, h, 5), '#FFFFFF', P(p[0], p[1], h / 2), [0, R0(0, 3), 0]);
      }
      const iceM = keep(
        id,
        new T3.MeshLambertMaterial({
          color: '#C3E6F3',
          transparent: true,
          opacity: 0.88,
          flatShading: true,
          emissive: '#3A6A8A',
          emissiveIntensity: 0.32,
        }),
      );
      const hieloM = new T3.Mesh(H.geo(), iceM);
      g.add(hieloM);
      /* la ranura del buzón y su banderita */
      B.add(BOX(32, 6, 4), '#2E4A66', P(IX + 4, IY + 30, 64), [0.28, 0.2, 0]);
      limb(B, [IX + 52, IY + 34, 0], [IX + 52, IY + 34, 92], 1.8, 1.8, '#8A6A4A', 5);
      B.add(BOX(18, 11, 1.6), '#E0584A', P(IX + 61, IY + 34, 84));
      /* cartas heladas: a los pies del témpano y una dentro del cubo de hielo */
      for (const [x, y, z, rx, ry] of [
        [IX + 22, IY + 52, 5, 0.5, 0.3],
        [IX - 8, IY + 60, 3.6, 0.1, 1.1],
        [IX + 50, IY + 62, 3.6, 0.05, -0.4],
        [CUBO[0], CUBO[1], 14, 0.6, 0.7],
      ]) {
        B.add(BOX(17, 1.3, 12), '#FBF4E3', P(x, y, z), [rx, ry, 0]);
        B.add(CYL(2, 2, 1.7, 8), '#C9483A', P(x, y, z + 0.4), [rx, ry, 0]);
      }
      /* ── suelo: hielo liso con grietas finas y nieve en los bordes ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#E4F0F6';
        c.fillRect(0, 0, w, w);
        const R1 = rf('ant-suelo');
        blobs(c, w, w, 46, R1, ['rgba(255,255,255,A)', 'rgba(190,216,232,A)'], 26, 80, 0.5);
        c.strokeStyle = 'rgba(120,160,190,.42)';
        c.lineWidth = 1.2;
        for (let i = 0; i < 9; i++) {
          let x = R1(40, w - 40),
            y = R1(40, w - 40);
          c.beginPath();
          c.moveTo(x, y);
          for (let j = 0; j < 6; j++) {
            x += R1(-36, 36);
            y += R1(-36, 36);
            c.lineTo(x, y);
          }
          c.stroke();
        }
        const n = c.createRadialGradient(w / 2, w / 2, w * 0.3, w / 2, w / 2, w * 0.5);
        n.addColorStop(0, 'rgba(255,255,255,0)');
        n.addColorStop(1, 'rgba(255,255,255,.75)');
        c.fillStyle = n;
        c.fillRect(0, 0, w, w);
      });
      texFloor(id, g, fl);
      /* ── en altura, una sola cosa (y el único movimiento): la aurora, que se refleja en la pared del fondo ── */
      const aT = ctex(64, 64, (c, w) => {
        const gr = c.createLinearGradient(0, 0, 0, w);
        gr.addColorStop(0, 'rgba(255,255,255,0)');
        gr.addColorStop(0.55, 'rgba(255,255,255,.85)');
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = gr;
        c.fillRect(0, 0, w, w);
        c.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < 9; i++) {
          c.fillStyle = `rgba(0,0,0,${0.15 + (i % 3) * 0.12})`;
          c.fillRect(i * 7 + 2, 0, 3, w);
        }
      });
      const auroras = [];
      [
        ['#6FE0A8', 52, -246, 0.7],
        ['#7FD6D0', 70, -250, 0.6],
        ['#B79CFF', 88, -254, 0.5],
      ].forEach(([col, z, y, op], i) => {
        const geo = new T3.PlaneGeometry(300, 52, 22, 1),
          pos = geo.attributes.position;
        for (let k = 0; k < pos.count; k++) pos.setZ(k, Math.sin((pos.getX(k) / 300) * 6.28 * 1.5 + i * 2) * 9);
        geo.userData.shared = true;
        const m = keep(
          id,
          new T3.MeshBasicMaterial({
            map: aT,
            color: col,
            transparent: true,
            opacity: op,
            depthWrite: false,
            blending: T3.AdditiveBlending,
            side: T3.DoubleSide,
            fog: false,
          }),
        );
        const me = new T3.Mesh(geo, m);
        me.position.set(...P(0, y, z));
        g.add(me);
        auroras.push({ me, m, op, z, y, ph: i * 2.1 });
      });
      /* ── luz: la aurora tiñe el hielo; el iglú, un punto cálido; los bordes, en azul hondo ── */
      const pool = lightPool(id, g, -60, -40, 210, 156, '#8FF0C0', 0.2);
      lightPool(id, g, 120, -30, 110, 90, '#FFD9A0', 0.16);
      layer(id, g, vignette('rgba(20,50,90,A)'), 3.5, { op: 0.55 });
      B.mesh(g);
      F.mesh(g, true);
      /* ── de cerca: el iglú de papel se cambia por uno de bloques; el hielo gana facetas (misma malla, otra geometría) ── */
      deCerca(
        id,
        g,
        () => {
          const N = new Bk(),
            O = new Bk(),
            R1 = rf('ant-det'),
            CX = 130,
            CY = -70,
            RI = 60,
            HI = 60,
            DA = Math.atan2(-0.72, 0.7),
            FX = Math.sin(DA),
            FY = Math.cos(DA),
            NIEVE = ['#F6FBFD', '#EAF4F9', '#F0F7FB', '#DCEBF3', '#E4F0F6'],
            FR = (u, f, z) => [CX + FX * f + FY * u, CY + FY * f - FX * u, z];
          /* la cúpula: una concha más oscura en las juntas y encima hiladas de bloques */
          N.add(SPH(1, 20, 8, 0, 6.2832, 0, HALF), '#B4CCDA', P(CX, CY, 0), [0, 0, 0], [RI - 2, HI - 2, RI - 2]);
          const FIL = 7;
          for (let i = 0; i < FIL; i++) {
            const f = ((i + 0.5) / FIL) * HALF * 0.94,
              rho = RI * Math.cos(f),
              z = HI * Math.sin(f),
              n = Math.max(5, Math.round((6.2832 * rho) / 18));
            for (let k = 0; k < n; k++) {
              const a = ((k + (i % 2) * 0.5) / n) * 6.2832,
                dA = Math.atan2(Math.sin(a - DA), Math.cos(a - DA));
              if (Math.abs(dA) < 0.3 && z < 24) continue;
              const nr = [Math.sin(a) * Math.cos(f), Math.cos(a) * Math.cos(f), Math.sin(f)],
                up = [-Math.sin(a) * Math.sin(f), -Math.cos(a) * Math.sin(f), Math.cos(f)],
                j = R1(-0.5, 0.5);
              pon(
                N,
                BLQ(),
                NIEVE[Math.floor(R1(0, NIEVE.length))],
                [CX + Math.sin(a) * rho + nr[0] * j, CY + Math.cos(a) * rho + nr[1] * j, z + nr[2] * j],
                up,
                nr,
                [(6.2832 * rho) / n - 1.1, (HI * HALF) / FIL - 1, 7.5],
              );
            }
          }
          N.add(BLQ(), '#F6FBFD', P(CX, CY, HI - 1.5), [0, 0.4, 0], [15, 6, 15]);
          /* el túnel de entrada: bóveda de bloques, interior oscuro y un fondo con luz cálida */
          const T0 = RI - 8,
            T1 = RI + 10;
          for (let r = 0; r < 3; r++) {
            const f = T0 + 3 + ((r + 0.5) / 3) * (T1 - T0 - 3);
            for (let k = 0; k < 7; k++) {
              const a = ((k + 0.5 + (r % 2) * 0.25) / 7) * Math.PI,
                uu = Math.cos(a),
                zz = Math.sin(a),
                nr = [FY * uu, -FX * uu, zz];
              pon(N, BLQ(), NIEVE[(k + r) % NIEVE.length], FR(uu * 21, f, zz * 24), [FX, FY, 0], nr, [11.5, 6, 7]);
            }
          }
          pon(
            O,
            CYL(1, 1, 1, 16, true, -HALF, Math.PI),
            '#1E2C48',
            FR(0, T0 + (T1 - T0) / 2, 0),
            [FX, FY, 0],
            [0, 0, 1],
            [17.5, T1 - T0, 21],
          );
          O.add(CIRC(1, 14, 0, Math.PI), '#0E1628', P(...FR(0, RI - 0.6, 0)), [0, DA, 0], [17.5, 21, 1]);
          O.add(CIRC(1, 10, 0, Math.PI), '#F0B46E', P(...FR(0, RI - 0.4, 0)), [0, DA, 0], [9, 13, 1]);
          N.add(BX, '#DCEBF3', P(...FR(0, (T0 + T1) / 2, 0.8)), [0, DA, 0], [36, 1.6, T1 - T0 + 4]);
          /* los carámbanos del borde y la nieve amontonada al pie */
          for (let k = 0; k < 11; k++) {
            const a = ((k + 0.5) / 11) * Math.PI,
              h = R1(3, 8);
            pon(
              N,
              plana(CONE(1, 1, 4)),
              '#CFEAF6',
              FR(Math.cos(a) * 19.5, T1 + 2.5, Math.sin(a) * 22.5 - h / 2),
              [0, 0, -1],
              [FX, FY, 0],
              [1.2, h, 1.2],
            );
          }
          for (let k = 0; k < 20; k++) {
            const a = (k / 20) * 6.2832;
            if (Math.abs(Math.atan2(Math.sin(a - DA), Math.cos(a - DA))) < 0.42) continue;
            N.add(
              SPH(1, 7, 4),
              '#FBFEFF',
              P(CX + Math.sin(a) * (RI + R1(0, 5)), CY + Math.cos(a) * (RI + R1(0, 5)), 0),
              [0, a, 0],
              [R1(13, 20), R1(5, 10), R1(10, 15)],
            );
          }
          /* el buzón: marco de madera en la ranura, cartas asomando; la banderita, de tela con su driza y su bola */
          {
            const c = [IX + 4, IY + 31.5, 64];
            O.add(BX, '#7A5232', P(c[0], c[1], c[2] + 5.4), [0.28, 0.2, 0], [38, 2.2, 5]);
            O.add(BX, '#7A5232', P(c[0], c[1], c[2] - 5.4), [0.28, 0.2, 0], [38, 2.2, 5]);
            for (const s of [-1, 1]) O.add(BX, '#7A5232', P(c[0] + s * 18, c[1] - s * 3.5, c[2]), [0.28, 0.2, 0], [2.2, 13, 5]);
            O.add(BX, '#C9A24A', P(c[0], c[1] + 2.4, c[2] - 10.4), [0.28, 0.2, 0], [15, 5, 0.8]);
            for (const [u, r] of [
              [-7, 0.1],
              [4, -0.12],
            ]) {
              O.add(BX, '#FBF4E3', P(c[0] + u, c[1] + 2.8, c[2] + 0.2), [0.75, 0.2, r], [13, 1, 9]);
              O.add(CYL(1.7, 1.7, 1.2, 8), '#C9483A', P(c[0] + u, c[1] + 5.2, c[2] - 1.8), [0.75, 0.2, 0]);
            }
            const PX = IX + 52,
              PY = IY + 34;
            O.add(SPH(1, 8, 6), '#C9A24A', P(PX, PY, 94), [0, 0, 0], [2.6, 2.6, 2.6]);
            tubo(
              O,
              [
                [PX + 1.2, PY, 92],
                [PX + 19, PY + 0.6, 90],
                [PX + 19, PY + 0.6, 78],
                [PX + 1.2, PY, 76],
              ],
              0.28,
              '#D8D0C0',
              3,
            );
            for (let k = 0; k < 7; k++) {
              const u0 = k / 7,
                u1 = (k + 1) / 7;
              const y0 = PY + Math.sin(u0 * 5.4) * 2.2,
                y1 = PY + Math.sin(u1 * 5.4) * 2.2,
                A = [PX + 1.2 + u0 * 18.5, y0 + 0.9],
                C2 = [PX + 1.2 + u1 * 18.5, y1 + 0.9];
              O.add(
                BX,
                k % 2 ? '#E0584A' : '#CE4C40',
                P((A[0] + C2[0]) / 2, (A[1] + C2[1]) / 2, 84),
                [0, -Math.atan2(y1 - y0, 2.64), 0],
                [2.9, 11.6, 0.9],
              );
            }
          }
          /* la nieve vieja en la falda del témpano */
          for (let k = 0; k < 12; k++) {
            const a = R1(0, 6.2832),
              d = R1(40, 62);
            N.add(SPH(1, 7, 4), '#FBFEFF', P(IX + Math.cos(a) * d, IY + Math.sin(a) * d, 0), [0, a, 0], [R1(9, 18), R1(3, 8), R1(8, 13)]);
          }
          /* el hielo: los mismos conos, con caras rotas, cornisas y agujas al pie */
          const H2 = new Bk(),
            cono = (x, y, zc, r, h, rot, sem, lados = 11, ani = 8) => {
              const R2 = rf('hielo' + sem),
                pos = [],
                idx = [];
              for (let j = 0; j <= ani; j++) {
                const t = j / ani,
                  rr = r * (1 - t) ** 0.92 * (j === ani ? 0.02 : 1);
                const off = j % 3 === 1 ? 1.1 : j % 3 === 2 ? 0.9 : 1;
                for (let k = 0; k < lados; k++) {
                  const a = ((k + j * 0.45) / lados) * 6.2832,
                    q = rr * off * (1.03 + R2(0, 0.2));
                  pos.push(Math.cos(a) * q, -h / 2 + h * t + (j && j < ani ? R2(-h * 0.02, h * 0.02) : 0), Math.sin(a) * q);
                  if (j < ani) {
                    const v0 = j * lados + k,
                      v1 = j * lados + ((k + 1) % lados);
                    idx.push(v0, v0 + lados, v1, v1, v0 + lados, v1 + lados);
                  }
                }
              }
              const G = new T3.BufferGeometry();
              G.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
              G.setIndex(idx);
              H2.add(plana(G), '#FFFFFF', P(x, y, zc), rot);
            };
          cono(IX, IY, 84, 48, 168, [0, 0.4, 0], 'a', 13, 12);
          cono(IX + 40, IY + 8, 52, 28, 104, [0.1, 1.1, -0.12], 'b', 11, 9);
          cono(IX - 36, IY + 22, 35, 22, 70, [0.12, 0.2, 0.16], 'c', 9, 7);
          [
            [LT, 0.2, 64],
            [BT, 0.55, 54],
            [BT, 0.8, 84],
          ].forEach(([e, u, h], i) => {
            const p = wallPt(e, u, 0, 12);
            cono(p[0], p[1], h / 2, 13, h, [0, i * 1.3, 0], 'p' + i, 7, 6);
            for (let k = 0; k < 3; k++) {
              const a = R1(0, 6.2832);
              cono(
                p[0] + Math.cos(a) * 14,
                p[1] + Math.sin(a) * 14,
                h * 0.2,
                6,
                h * 0.4,
                [R1(-0.2, 0.2), a, R1(-0.2, 0.2)],
                'q' + i + k,
                5,
                3,
              );
            }
          });
          for (let k = 0; k < 14; k++) {
            const a = R1(0, 6.2832),
              d = R1(34, 56),
              hh = R1(16, 46);
            cono(
              IX + Math.cos(a) * d,
              IY + Math.sin(a) * d,
              hh * 0.4,
              R1(5, 10),
              hh,
              [R1(-0.3, 0.3) * Math.sin(a), R1(0, 3), R1(-0.3, 0.3) * Math.cos(a)],
              'k' + k,
              5,
              3,
            );
          }
          H2.add(plana(BLQ()), '#FFFFFF', P(CUBO[0], CUBO[1], 13.5), [0, 0.5, 0], [30, 28, 30]);
          const G2 = H2.geo();
          const otra = O.mesh();
          otra.userData.detalle = true;
          return { B: N, hijos: [otra], cambia: [[hieloM, G2]] };
        },
        {
          carta: [130, -70],
          /* la nieve es blanca aunque el cuarto sea azul: un poco de luz propia en este material */
          mat: () =>
            Object.assign(
              new T3.MeshLambertMaterial({ vertexColors: true, side: T3.DoubleSide, emissive: '#A8C4D6', emissiveIntensity: 0.42 }),
              {
                userData: { shared: true },
              },
            ),
        },
      );
      g.userData.tick = (t, still) => {
        const tt = still ? 0 : t;
        for (const a of auroras) {
          a.me.position.set(...P(Math.sin(tt * 0.13 + a.ph) * 12, a.y, a.z + Math.sin(tt * 0.31 + a.ph) * 6));
          a.m.opacity = a.op * (0.75 + 0.25 * Math.sin(tt * 0.5 + a.ph));
        }
        pool.material.opacity = 0.16 + 0.06 * Math.sin(tt * 0.5);
      };
      return g;
    };
  })();

  SALAS.add('esp', ['crystals'], ESP, { hideTiles: 1, noRug: 1 });
  SALAS.add('des', ['rocks'], DES, { hideTiles: 1, noRug: 1 });
  SALAS.add('ant', ['ice', 'snow'], ANT, { hideTiles: 1 });
})();
