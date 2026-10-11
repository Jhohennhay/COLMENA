/* ══════════ SALAS 5 · los sueños: Invernadero nocturno, Teatro de sombras, Faro y Tren nocturno ══════════
   Mismo criterio que salas3.js: una pieza protagonista, algo que sobresale del muro, suelo propio, luz con
   intención, UNA cosa en altura y UN movimiento. Aquí es de noche: añiles y luz de luna, con puntos cálidos.
   No cambia la lógica: vecinos, puertas, objetos y recuerdos siguen en su sitio. */
(() => {
  if (!window.SALAS || !SALAS.kit.texFloor || !window.PROPS3D || !window.LP3D || !window.THREE) return;
  const T3 = THREE,
    { Bk, SPH, CYL, CONE, BOX, TOR, glowSprite } = LP3D.kit,
    { WYAW, P, rf, limb } = PROPS3D.kit,
    { keep, ctex, solid, lightPool, layer, vignette, blobs, poolTex, tx, ty, texFloor, hangers, rope, ropeMesh, away } = SALAS.kit;
  const LT = [3, 4],
    BT = [4, 5],
    RT = [5, 0];
  /* una pieza con giro propio y luego giro de pared (para lo que Bk.add no sabe expresar) */
  const MM = (pos, yaw, rx = 0, scl = [1, 1, 1], rz = 0) =>
    new T3.Matrix4()
      .makeTranslation(...pos)
      .multiply(new T3.Matrix4().makeRotationY(yaw))
      .multiply(new T3.Matrix4().makeRotationX(rx))
      .multiply(new T3.Matrix4().makeRotationZ(rz))
      .multiply(new T3.Matrix4().makeScale(...scl));
  /* curva de tres puntos, en tramos */
  const curva = (a, c, b, n) => {
    const o = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n,
        u = 1 - t;
      o.push([0, 1, 2].map((i) => u * u * a[i] + 2 * u * t * c[i] + t * t * b[i]));
    }
    return o;
  };

  /* ═════════════════ INVERNADERO NOCTURNO · la flor de luna, que se cierra cuando la miras ═════════════════ */
  const INN = (() => {
    const id = 'inn',
      R0 = rf('sala-inn'),
      /* pie, punto de curva, cabeza, tamaño y giro de cada flor: la grande y sus dos hermanas */
      FLO = [
        { a: [8, -232, 0], c: [14, -262, 118], h: [0, -146, 86], s: 1.45, yaw: 0, r: 8 },
        { a: [-84, -236, 0], c: [-108, -250, 96], h: [-80, -196, 78], s: 0.6, yaw: 0.5, r: 4.4 },
        { a: [-212, -146, 0], c: [-236, -156, 70], h: [-196, -128, 60], s: 0.46, yaw: 0.9, r: 3.6 },
      ];
    solid(id, 8, -228, 24);
    solid(id, -84, -236, 13);
    solid(id, -212, -146, 12);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        HIERRO = '#3A4674';
      /* ── la cristalera de noche: arcos apuntados de hierro sobre las tres paredes del fondo ── */
      const tri = [];
      for (const e of [LT, BT, RT])
        for (const u0 of [0, 0.5]) {
          const pts = [];
          for (let j = 0; j <= 12; j++) {
            const s = j / 12,
              k = 1 - Math.abs(2 * s - 1);
            pts.push(wallPt(e, u0 + 0.5 * s, 128 + 58 * Math.pow(Math.sin((k * Math.PI) / 2), 0.75), -5));
          }
          for (let j = 1; j < pts.length; j++) limb(B, pts[j - 1], pts[j], 2.2, 2.2, HIERRO, 4);
          limb(B, wallPt(e, u0 + 0.25, 128, -5), pts[6], 1.2, 1.2, HIERRO, 4);
          limb(B, pts[3], pts[9], 1.2, 1.2, HIERRO, 4);
          const m = wallPt(e, u0 + 0.25, 128, -5);
          for (let j = 1; j < pts.length; j++) tri.push(...P(...m), ...P(...pts[j - 1]), ...P(...pts[j]));
        }
      for (const e of [LT, BT, RT]) limb(B, wallPt(e, 0, 129, -5), wallPt(e, 1, 129, -5), 2.2, 2.2, HIERRO, 4);
      {
        const gg = new T3.BufferGeometry();
        gg.setAttribute('position', new T3.Float32BufferAttribute(tri, 3));
        gg.computeVertexNormals();
        gg.userData.shared = true;
        g.add(
          new T3.Mesh(
            gg,
            keep(
              id,
              new T3.MeshBasicMaterial({ color: '#9DB4F0', transparent: true, opacity: 0.16, depthWrite: false, side: T3.DoubleSide }),
            ),
          ),
        );
      }
      /* ── los tallos y las hojas de las tres flores ── */
      const padres = [];
      FLO.forEach((f, i) => {
        const pts = curva(f.a, f.c, f.h, 8);
        for (let k = 1; k < pts.length; k++)
          limb(B, pts[k - 1], pts[k], f.r * (1 - (k - 1) * 0.06), f.r * (1 - k * 0.06), k % 2 ? '#3F7A64' : '#4A8A70', 6);
        for (const [da, len] of [
          [f.yaw + 0.7, 30],
          [f.yaw - 1.2, 26],
        ])
          F.addM(
            SPH(1, 7, 5),
            i ? '#3E7A5E' : '#356E58',
            MM(P(f.a[0] + Math.sin(da) * len * f.s * 0.8, f.a[1] + Math.cos(da) * len * f.s * 0.8, 16 * f.s), da, -0.5, [
              15 * f.s,
              2.4,
              len * f.s,
            ]),
          );
        B.add(SPH(9 * f.s, 8, 6), '#3F7A64', P(...f.h));
        padres.push(MM(P(...f.h), f.yaw, 0.7, [f.s, f.s, f.s]));
      });
      /* ── los pétalos: una sola malla de instancias que se abre y se cierra ── */
      const pg = new T3.SphereGeometry(1, 7, 5);
      pg.scale(11, 2.2, 25);
      pg.translate(0, 0, 25);
      pg.userData.shared = true;
      const NP = 9,
        NI = 6,
        pm = keep(id, new T3.MeshLambertMaterial({ color: '#FFFFFF', emissive: '#7F92D8', emissiveIntensity: 0.42 })),
        I = new T3.InstancedMesh(pg, pm, FLO.length * (NP + NI)),
        col = new T3.Color(),
        o3 = new T3.Object3D(),
        M = new T3.Matrix4();
      I.frustumCulled = false;
      for (let i = 0; i < I.count; i++) I.setColorAt(i, col.set(i % (NP + NI) < NP ? (i % 2 ? '#D6DCFF' : '#ECEFFF') : '#FFF1C2'));
      g.add(I);
      const abre = (o) => {
        let n = 0;
        padres.forEach((pa) => {
          for (let k = 0; k < NP + NI; k++) {
            const dentro = k >= NP,
              a = dentro ? ((k - NP) / NI) * 6.283 + 0.4 : (k / NP) * 6.283,
              phi = dentro ? 1.42 - 0.62 * o : 1.36 - 1.12 * o,
              s = dentro ? 0.56 : 1;
            o3.position.set(0, dentro ? 3 : 0, 0);
            o3.rotation.set(-phi, a, 0, 'YXZ');
            o3.scale.set(s, s, s);
            o3.updateMatrix();
            I.setMatrixAt(n++, M.multiplyMatrices(pa, o3.matrix));
          }
        });
        I.instanceMatrix.needsUpdate = true;
      };
      /* el corazón de cada flor y su resplandor */
      const brillos = FLO.map((f) => {
        const q = [f.h[0], f.h[1] + 8 * f.s, f.h[2] + 9 * f.s],
          s = glowSprite('#CFE0FF', 250 * f.s);
        s.position.set(...P(...q));
        g.add(s);
        return s;
      });
      const HC = new Bk();
      FLO.forEach((f) => HC.add(SPH(7 * f.s, 8, 6), '#FFE9A0', P(f.h[0], f.h[1] + 6 * f.s, f.h[2] + 7 * f.s)));
      g.add(new T3.Mesh(HC.geo(), keep(id, new T3.MeshBasicMaterial({ vertexColors: true }))));
      /* ── suelo: tierra añil con musgo, y la luna entrando por los arcos ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#2A3862';
        c.fillRect(0, 0, w, w);
        const R1 = rf('inn-suelo'),
          k = w / (2 * R);
        blobs(c, w, w, 40, R1, ['rgba(46,92,88,A)', 'rgba(22,28,62,A)', 'rgba(58,74,124,A)'], 26, 84, 0.5);
        for (const cx of [-150, 0, 150]) {
          const x = tx(cx, w),
            y0 = ty(-214, w),
            y1 = ty(70, w),
            hw = 58 * k,
            gr = c.createLinearGradient(0, y0, 0, y1);
          gr.addColorStop(0, 'rgba(176,200,255,.3)');
          gr.addColorStop(1, 'rgba(176,200,255,.03)');
          c.fillStyle = gr;
          c.beginPath();
          c.moveTo(x - hw, y0);
          c.lineTo(x + hw, y0);
          c.lineTo(x + hw * 1.25, y0 + (y1 - y0) * 0.62);
          c.quadraticCurveTo(x + hw * 1.1, y1 - 20 * k, x, y1);
          c.quadraticCurveTo(x - hw * 1.1, y1 - 20 * k, x - hw * 1.25, y0 + (y1 - y0) * 0.62);
          c.closePath();
          c.fill();
          c.save();
          c.globalCompositeOperation = 'destination-out';
          c.strokeStyle = 'rgba(0,0,0,.5)';
          c.lineWidth = 3;
          c.beginPath();
          c.moveTo(x, y0);
          c.lineTo(x, y1);
          for (const t of [0.3, 0.62]) {
            c.moveTo(x - hw * 1.3, y0 + (y1 - y0) * t);
            c.lineTo(x + hw * 1.3, y0 + (y1 - y0) * t);
          }
          c.stroke();
          c.restore();
        }
        /* lo que el destination-out dejó vacío vuelve a ser tierra */
        c.globalCompositeOperation = 'destination-over';
        c.fillStyle = '#263258';
        c.fillRect(0, 0, w, w);
        c.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 46; i++) {
          c.fillStyle = i % 3 ? 'rgba(200,255,170,.4)' : 'rgba(210,225,255,.5)';
          c.beginPath();
          c.arc(R1(0, w), R1(0, w), R1(0.8, 1.8), 0, 6.28);
          c.fill();
        }
      });
      texFloor(id, g, fl);
      /* ── luz: la flor alumbra su rincón en frío; el farol, un punto cálido; los bordes, en añil hondo ── */
      const pool = lightPool(id, g, 0, -120, 170, 124, '#BCCBFF', 0.3);
      lightPool(id, g, 112, -170, 76, 60, '#FFD9A0', 0.24);
      layer(id, g, vignette('rgba(6,10,36,A)'), 3.5, { op: 0.58 });
      B.mesh(g);
      F.mesh(g, true);
      /* ── el movimiento: las flores se abren cuando nadie las mira y se cierran si te vuelves hacia ellas ── */
      let o = 0.75,
        t0 = null,
        puesto = -1;
      g.userData.tick = (t, still) => {
        const dt = t0 == null ? 0 : Math.min(0.1, Math.max(0, t - t0));
        t0 = t;
        let mira = false;
        try {
          mira = cur === id && Math.sign(FLO[0].h[0] - Pl.x) === Pl.f && Math.hypot(Pl.x - FLO[0].h[0], Pl.y - FLO[0].h[1]) < 330;
        } catch (e) {}
        o = Math.max(0.16, Math.min(1, o + (mira ? -dt / 0.7 : dt / 2.6)));
        const v = o + (still ? 0 : 0.04 * Math.sin(t * 0.9) * o);
        if (Math.abs(v - puesto) > 0.002) abre((puesto = v));
        brillos.forEach((s, i) => (s.material.opacity = (0.16 + 0.34 * o) * (i ? 0.8 : 1)));
        pool.material.opacity = 0.14 + 0.2 * o;
      };
      abre(o);
      return g;
    };
  })();

  /* ═════════════════ TEATRO DE SOMBRAS · la embocadura dorada, el telón rojo y los títeres ante la pantalla ═════════════════ */
  const TEA = (() => {
    const id = 'tea',
      yw = WYAW(RT),
      W = (u, z, d) => wallPt(RT, u, z, d);
    for (const u of [0.06, 0.94]) solid(id, W(u, 0, 9)[0], W(u, 0, 9)[1], 12);
    for (const u of [0.13, 0.26, 0.74, 0.87]) solid(id, W(u, 0, 13)[0], W(u, 0, 13)[1], 16);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        ORO = '#D2A048',
        ORO2 = '#B07E32',
        ROJO = '#B8484A',
        ROJO2 = '#98343E';
      /* ── la embocadura: dos columnas doradas y el dintel, por encima del muro ── */
      for (const u of [0.06, 0.94]) {
        B.add(BOX(16, 150, 16), ORO, P(...W(u, 75, 9)), [0, yw, 0]);
        B.add(BOX(23, 10, 23), ORO2, P(...W(u, 5, 9)), [0, yw, 0]);
        B.add(BOX(25, 8, 25), ORO2, P(...W(u, 150, 9)), [0, yw, 0]);
        limb(B, W(u, 154, 9), W(u < 0.5 ? 0.43 : 0.57, 178, 9), 3, 3, ORO, 5);
      }
      B.add(BOX(292, 11, 15), ORO2, P(...W(0.5, 158, 9)), [0, yw, 0]);
      /* el emblema: una luna de papel sobre un sol dorado */
      B.addM(CYL(22, 22, 5, 18), ORO, MM(P(...W(0.5, 182, 9)), yw, Math.PI / 2));
      B.addM(CYL(16, 16, 6, 16), '#FBF4E3', MM(P(...W(0.5, 182, 9)), yw, Math.PI / 2));
      B.addM(CYL(14, 14, 7, 16), ORO, MM(P(...W(0.522, 186, 9)), yw, Math.PI / 2));
      /* ── el telón: bambalina en ondas con flecos y dos caídas recogidas a los lados ── */
      for (let k = 0; k < 7; k++) {
        const u = 0.11 + (k + 0.5) * (0.78 / 7);
        B.add(SPH(1, 9, 6), k % 2 ? ROJO : ROJO2, P(...W(u, 143, 12)), [0, yw, 0], [19, 13, 5]);
        if (k) B.add(SPH(2.6, 6, 5), '#E4A844', P(...W(u - 0.39 / 7, 131, 13)));
      }
      for (const u of [0.125, 0.875]) {
        B.add(CYL(20, 8, 72, 8), ROJO, P(...W(u, 96, 11)), [0, yw, 0], [1, 1, 0.5]);
        B.add(CYL(8, 16, 56, 8), ROJO2, P(...W(u, 32, 11)), [0, yw, 0], [1, 1, 0.5]);
        B.add(TOR(8.6, 2, 5, 10), '#E4A844', P(...W(u, 60, 11)), [Math.PI / 2, 0, 0]);
      }
      /* ── el borde del escenario, con sus candilejas, a los dos lados de la puerta ── */
      const cand = [];
      for (const u0 of [0.05, 0.67]) {
        B.add(BOX(84, 10, 26), '#6E3E17', P(...W(u0 + 0.14, 5, 13)), [0, yw, 0]);
        B.add(BOX(84, 2, 2.4), '#E4A844', P(...W(u0 + 0.14, 10, 26)), [0, yw, 0]);
        for (const du of [0.05, 0.14, 0.23]) cand.push(W(u0 + du, 12, 21));
      }
      const CB = new Bk();
      for (const q of cand) {
        B.add(CYL(5, 3.4, 4, 8), '#8A5A2E', P(q[0], q[1], 12));
        CB.add(SPH(3.4, 6, 5), '#FFE6A8', P(q[0], q[1], 15));
      }
      g.add(new T3.Mesh(CB.geo(), keep(id, new T3.MeshBasicMaterial({ vertexColors: true }))));
      /* ── en altura (y el único movimiento): los títeres de sombra, colgados de una vara ante la pantalla ── */
      B.add(BOX(214, 3.4, 3.4), '#5A3A22', P(...W(0.5, 150, 46)), [0, yw, 0]);
      for (const u of [0.16, 0.84]) limb(B, W(u, 156, 9), W(u, 150, 46), 1.6, 1.6, '#5A3A22', 4);
      const SOMBRA = '#2A1822',
        sm = keep(id, new T3.MeshBasicMaterial({ color: SOMBRA, side: T3.DoubleSide })),
        tit = [],
        hilo = (K, L) => K.add(BOX(0.9, L, 0.9), SOMBRA, [0, -L / 2, 0]);
      const FIG = [
        /* la dama del sombrero con velo */
        (K, L) => {
          hilo(K, L);
          K.add(BOX(24, 2.4, 1.6), SOMBRA, [0, -L - 1, 0]);
          K.add(BOX(12, 7, 1.6), SOMBRA, [0, -L + 3, 0]);
          K.add(SPH(5, 8, 6), SOMBRA, [0, -L - 6, 0], [0, 0, 0], [1, 1, 0.3]);
          K.add(CONE(7, 14, 3), SOMBRA, [7, -L - 8, 0], [0, 0, Math.PI], [1, 1, 0.2]);
          K.add(BOX(7, 11, 1.6), SOMBRA, [0, -L - 15, 0]);
          K.add(CONE(13, 26, 5), SOMBRA, [0, -L - 32, 0], [0, 0, 0], [1, 1, 0.2]);
          K.add(BOX(13, 1.8, 1.4), SOMBRA, [-8, -L - 16, 0], [0, 0, 0.7]);
          K.add(BOX(13, 1.8, 1.4), SOMBRA, [8, -L - 14, 0], [0, 0, 0.5]);
        },
        /* el pájaro */
        (K, L) => {
          hilo(K, L);
          K.add(SPH(1, 8, 6), SOMBRA, [0, -L - 5, 0], [0, 0, 0], [13, 5.5, 1]);
          K.add(CONE(5, 20, 3), SOMBRA, [-5, -L + 4, 0], [0, 0, 0.5], [1, 1, 0.2]);
          K.add(CONE(5, 18, 3), SOMBRA, [5, -L + 3, 0], [0, 0, -0.9], [1, 1, 0.2]);
          K.add(CONE(4, 12, 3), SOMBRA, [-15, -L - 4, 0], [0, 0, 1.2], [1, 1, 0.2]);
          K.add(CONE(2.2, 7, 3), SOMBRA, [15, -L - 5, 0], [0, 0, -1.57], [1, 1, 0.3]);
        },
        /* la luna */
        (K, L) => {
          hilo(K, L);
          K.add(TOR(10, 4.2, 4, 14, 4.1), SOMBRA, [0, -L - 12, 0], [0, 0, 1.2], [1, 1, 0.3]);
        },
        /* la estrella */
        (K, L) => {
          hilo(K, L);
          for (let k = 0; k < 5; k++) {
            const a = (k / 5) * 6.283 + Math.PI / 2;
            K.add(CONE(4.6, 12, 4), SOMBRA, [Math.cos(a) * 8, -L - 12 + Math.sin(a) * 8, 0], [0, 0, a - Math.PI / 2], [1, 1, 0.3]);
          }
          K.add(CYL(5.6, 5.6, 1.6, 10), SOMBRA, [0, -L - 12, 0], [Math.PI / 2, 0, 0]);
        },
      ];
      [
        [0.27, 30],
        [0.43, 22],
        [0.585, 28],
        [0.74, 36],
      ].forEach(([u, L], i) => {
        const K = new Bk(),
          piv = new T3.Group();
        FIG[i](K, L);
        piv.add(new T3.Mesh(K.geo(), sm));
        piv.position.set(...P(...W(u, 149, 46)));
        piv.rotation.y = yw;
        g.add(piv);
        tit.push(piv);
      });
      /* ── suelo: tablas de escenario color vino, gastadas donde se pisa ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#4E2832';
        c.fillRect(0, 0, w, w);
        const R1 = rf('tea-suelo');
        blobs(c, w, w, 34, R1, ['rgba(110,56,60,A)', 'rgba(44,20,32,A)'], 30, 90, 0.42);
        for (let y = 0; y < w; y += 26) {
          c.fillStyle = 'rgba(30,12,22,.5)';
          c.fillRect(0, y, w, 1.6);
          c.fillStyle = 'rgba(255,200,150,.07)';
          c.fillRect(0, y + 2, w, 1.2);
          for (let x = R1(0, 120); x < w; x += R1(90, 190)) {
            c.fillStyle = 'rgba(30,12,22,.45)';
            c.fillRect(x, y, 1.6, 26);
          }
        }
      });
      texFloor(id, g, fl);
      /* ── luz: el foco sobre Telón, las candilejas al pie del escenario; los bordes, en penumbra de terciopelo ── */
      lightPool(id, g, -40, 50, 96, 70, '#FFE2A8', 0.36);
      for (const u of [0.19, 0.81]) lightPool(id, g, W(u, 0, 46)[0], W(u, 0, 46)[1], 70, 52, '#FFC870', 0.3);
      layer(id, g, vignette('rgba(34,8,22,A)'), 3.5, { op: 0.62 });
      B.mesh(g);
      F.mesh(g, true);
      g.userData.tick = (t, still) => {
        tit.forEach((p, i) => {
          p.rotation.z = still ? 0 : Math.sin(t * 0.9 + i * 1.9) * 0.09;
          p.rotation.y = yw + (still ? 0 : Math.sin(t * 0.6 + i * 2.3) * 0.12);
        });
      };
      return g;
    };
  })();

  /* ═════════════════ FARO · la lente de panal alrededor de la lámpara y el haz que barre la colmena ═════════════════ */
  const FAR = (() => {
    const id = 'far',
      LX = 0,
      LY = -110,
      /* el perfil de la lente: radio a cada altura */
      rad = (z) => 47 * Math.pow(Math.max(0, Math.sin(((z - 4) / 136) * Math.PI)), 0.62);
    solid(id, LX, LY, 52);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        LATON = '#C9A24A',
        LATON2 = '#A8822E';
      /* ── la lente: aros de cristal apilados como una colmena, entre seis costillas de latón ── */
      const V = new Bk();
      for (let z = 28; z <= 116; z += 8) V.add(TOR(rad(z), 2.7, 5, 20), '#FFFFFF', P(LX, LY, z), [Math.PI / 2, 0, 0]);
      const vid = keep(
        id,
        new T3.MeshLambertMaterial({
          color: '#D4F0F2',
          transparent: true,
          opacity: 0.6,
          emissive: '#8FC3C8',
          emissiveIntensity: 0.4,
          depthWrite: false,
        }),
      );
      g.add(new T3.Mesh(V.geo(), vid));
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * 6.283 + 0.52;
        let q = null;
        for (let z = 22; z <= 122; z += 12.5) {
          const r = rad(z) + 3.4,
            n = [LX + Math.cos(a) * r, LY + Math.sin(a) * r, z];
          if (q) limb(B, q, n, 1.9, 1.9, LATON, 4);
          q = n;
        }
        limb(B, q, [LX, LY, 136], 1.6, 1.6, LATON, 4);
      }
      B.add(TOR(46, 4.4, 6, 20), LATON2, P(LX, LY, 5), [Math.PI / 2, 0, 0]);
      B.add(TOR(rad(22) + 3, 2.6, 5, 18), LATON, P(LX, LY, 22), [Math.PI / 2, 0, 0]);
      B.add(TOR(rad(122) + 3, 2.6, 5, 18), LATON, P(LX, LY, 122), [Math.PI / 2, 0, 0]);
      B.add(SPH(5, 8, 6), LATON, P(LX, LY, 138));
      B.add(CONE(2.2, 12, 5), LATON2, P(LX, LY, 148));
      /* ── el haz: dos cuñas de luz que giran; se inclinan un poco hacia abajo, hacia el Corazón ── */
      const haz = new T3.Group();
      haz.position.set(...P(LX, LY, 0));
      {
        const pos = [],
          uv = [],
          L = 560,
          Z0 = 74;
        for (const s of [1, -1]) {
          const z1 = s > 0 ? 30 : 100;
          pos.push(0, Z0, -5, s * L, z1, -44, s * L, z1, 44, 0, Z0, -5, s * L, z1, 44, 0, Z0, 5);
          pos.push(0, Z0 - 5, 0, s * L, z1 - 36, 0, s * L, z1 + 36, 0, 0, Z0 - 5, 0, s * L, z1 + 36, 0, 0, Z0 + 5, 0);
          for (let k = 0; k < 2; k++) uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
        }
        const hg = new T3.BufferGeometry();
        hg.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
        hg.setAttribute('uv', new T3.Float32BufferAttribute(uv, 2));
        hg.userData.shared = true;
        /* la luz se apaga con la distancia y hacia los bordes de la cuña */
        const ht = ctex(128, 64, (c, w, h) => {
          const a = c.createLinearGradient(0, 0, w, 0);
          a.addColorStop(0, 'rgba(255,255,255,1)');
          a.addColorStop(0.5, 'rgba(255,255,255,.5)');
          a.addColorStop(1, 'rgba(255,255,255,0)');
          c.fillStyle = a;
          c.fillRect(0, 0, w, h);
          c.globalCompositeOperation = 'destination-in';
          const b = c.createLinearGradient(0, 0, 0, h);
          b.addColorStop(0, 'rgba(0,0,0,0)');
          b.addColorStop(0.5, 'rgba(0,0,0,1)');
          b.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = b;
          c.fillRect(0, 0, w, h);
        });
        const hm = keep(
          id,
          new T3.MeshBasicMaterial({
            map: ht,
            color: '#FFE08C',
            transparent: true,
            opacity: 0.42,
            depthWrite: false,
            blending: T3.AdditiveBlending,
            side: T3.DoubleSide,
            fog: false,
          }),
        );
        const me = new T3.Mesh(hg, hm);
        me.frustumCulled = false;
        me.renderOrder = 3;
        haz.add(me);
        /* la mancha que el haz deja en el suelo */
        const pg = new T3.PlaneGeometry(300, 110);
        pg.rotateX(-Math.PI / 2);
        pg.userData.shared = true;
        const pm = keep(
          id,
          new T3.MeshBasicMaterial({
            map: poolTex(),
            color: '#FFE9A8',
            transparent: true,
            opacity: 0.34,
            depthWrite: false,
            blending: T3.AdditiveBlending,
            fog: false,
          }),
        );
        const su = new T3.Mesh(pg, pm);
        su.position.set(190, 3.3, 0);
        su.renderOrder = 1;
        haz.add(su);
      }
      g.add(haz);
      const foco = glowSprite('#FFF0B4', 150);
      foco.position.set(...P(LX, LY + 6, 76));
      g.add(foco);
      /* ── suelo: piedra azul de noche con la rosa de los vientos en crema y rojo de faro ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#4A5A78';
        c.fillRect(0, 0, w, w);
        const R1 = rf('far-suelo'),
          k = w / (2 * R);
        blobs(c, w, w, 40, R1, ['rgba(96,116,150,A)', 'rgba(44,54,84,A)'], 28, 90, 0.45);
        /* losas en anillos alrededor de la lámpara */
        const lx = tx(LX, w),
          ly = ty(LY, w);
        c.strokeStyle = 'rgba(28,36,62,.4)';
        c.lineWidth = 1.6;
        for (let r = 70; r < 520; r += 46) {
          c.beginPath();
          c.arc(lx, ly, r * k, 0, 6.283);
          c.stroke();
          const n = Math.round(r / 14);
          for (let i = 0; i < n; i++) {
            const a = (i / n) * 6.283 + r;
            c.beginPath();
            c.moveTo(lx + Math.cos(a) * r * k, ly + Math.sin(a) * r * k);
            c.lineTo(lx + Math.cos(a) * (r + 46) * k, ly + Math.sin(a) * (r + 46) * k);
            c.stroke();
          }
        }
        /* la rosa, donde se camina */
        const cx = tx(-10, w),
          cy = ty(70, w);
        c.strokeStyle = 'rgba(243,235,216,.75)';
        c.lineWidth = 2.4;
        for (const r of [104, 112]) {
          c.beginPath();
          c.arc(cx, cy, r * k, 0, 6.283);
          c.stroke();
        }
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * 6.283,
            L = (i % 4 === 0 ? 100 : i % 2 === 0 ? 70 : 40) * k,
            wd = (i % 4 === 0 ? 15 : 10) * k;
          for (const s of [1, -1]) {
            c.fillStyle = i % 4 === 0 ? (s > 0 ? '#F3EBD8' : '#B8484A') : s > 0 ? 'rgba(243,235,216,.85)' : 'rgba(150,170,200,.7)';
            c.beginPath();
            c.moveTo(cx, cy);
            c.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L);
            c.lineTo(cx + Math.cos(a + s * 0.39) * wd * 1.6, cy + Math.sin(a + s * 0.39) * wd * 1.6);
            c.closePath();
            c.fill();
          }
        }
        c.fillStyle = '#C9A24A';
        c.beginPath();
        c.arc(cx, cy, 7 * k, 0, 6.283);
        c.fill();
      });
      texFloor(id, g, fl);
      /* ── luz: la lámpara calienta su círculo; los bordes, en azul de mar de noche ── */
      const pool = lightPool(id, g, LX, LY + 14, 150, 112, '#FFE2A0', 0.34);
      layer(id, g, vignette('rgba(10,20,52,A)'), 3.5, { op: 0.5 });
      B.mesh(g);
      g.userData.tick = (t, still) => {
        haz.rotation.y = still ? 0.5 : t * 0.42;
        const k = still ? 1 : 0.9 + 0.1 * Math.sin(t * 2.1);
        foco.material.opacity = 0.5 * k;
        pool.material.opacity = 0.32 * k;
      };
      return g;
    };
  })();

  /* ═════════════════ TREN NOCTURNO · el túnel hacia Ayer, las vías aún calientes y el reloj parado a las 3:45 ═════════════════ */
  const TRE = (() => {
    const id = 'tre',
      VX = -4,
      TOPE = 212,
      SEM = [46, -238],
      REL = [-62, -118];
    solid(id, VX, TOPE + 4, 22);
    solid(id, REL[0], REL[1], 11);
    solid(id, SEM[0], SEM[1], 10);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        PIEDRA = '#C9A05C',
        PIEDRA2 = '#A8823E',
        HIERRO = '#2A305C',
        yF = -260;
      /* ── la boca del túnel, entre las dos ventanillas: por ahí salió el último tren ── */
      B.add(BOX(40, 46, 1.6), '#121830', P(VX, yF + 1.6, 23));
      B.addM(CYL(20, 20, 1.6, 16, false, -Math.PI / 2, Math.PI), '#121830', MM(P(VX, yF + 1.6, 46), 0, -Math.PI / 2));
      for (const s of [-1, 1])
        for (let k = 0; k < 4; k++) B.add(BOX(10, 11, 8), k % 2 ? PIEDRA : PIEDRA2, P(VX + s * 25, yF + 4, 6 + k * 11.6));
      for (let k = 0; k < 9; k++) {
        const a = (k / 8) * Math.PI;
        B.add(BOX(10.5, 10, 8), k % 2 ? PIEDRA2 : PIEDRA, P(VX + Math.cos(a) * 25, yF + 4, 47 + Math.sin(a) * 25), [0, 0, a - Math.PI / 2]);
      }
      const cola = glowSprite('#FF8A5A', 34);
      cola.position.set(...P(VX, yF + 4, 30));
      g.add(cola);
      /* ── las vías: del túnel al tope del andén; el raíl guarda un filo de calor ── */
      const CAL = new Bk(),
        y0 = yF + 3,
        y1 = TOPE - 6,
        Lv = y1 - y0;
      for (let y = y0 + 16; y < y1; y += 27) B.add(BOX(42, 2.6, 9), y % 2 ? '#5A3A2A' : '#4E3226', P(VX, y, 3.6));
      for (const s of [-1, 1]) {
        B.add(BOX(3.4, 3.4, Lv), '#8087AE', P(VX + s * 12, (y0 + y1) / 2, 6.4));
        CAL.add(BOX(1.3, 0.8, Lv), '#FFB868', P(VX + s * 12, (y0 + y1) / 2, 8.3));
      }
      g.add(new T3.Mesh(CAL.geo(), keep(id, new T3.MeshBasicMaterial({ vertexColors: true }))));
      /* el tope: aquí se acaba la línea */
      for (const s of [-1, 1]) {
        B.add(BOX(5, 24, 5), '#5A3A2A', P(VX + s * 15, TOPE + 4, 12));
        limb(B, [VX + s * 15, TOPE + 4, 20], [VX + s * 15, TOPE + 24, 0], 2, 2, '#5A3A2A', 4);
      }
      for (let k = 0; k < 5; k++) B.add(BOX(9.2, 9, 5.4), k % 2 ? '#F3EBD8' : '#B8484A', P(VX - 18.4 + k * 9.2, TOPE + 1, 19));
      /* ── el reloj del andén, en su poste de hierro: parado a las 3:45 ── */
      const RC = [REL[0], REL[1], 96];
      limb(B, [REL[0], REL[1], 0], [REL[0], REL[1], 74], 3.4, 2.6, HIERRO, 6);
      B.add(CYL(7, 9, 7, 8), HIERRO, P(REL[0], REL[1], 3.5));
      B.add(TOR(5, 1.6, 5, 10), '#E4A844', P(REL[0], REL[1], 66), [Math.PI / 2, 0, 0]);
      B.addM(CYL(23, 23, 9, 22), HIERRO, MM(P(...RC), 0, Math.PI / 2));
      B.add(CONE(4, 9, 6), '#E4A844', P(RC[0], RC[1], RC[2] + 27));
      const RJ = new Bk();
      RJ.addM(CYL(19.5, 19.5, 11, 22), '#FFF3D0', MM(P(...RC), 0, Math.PI / 2));
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * 6.283;
        RJ.add(BOX(k % 3 ? 1 : 1.8, k % 3 ? 2.6 : 4.4, 1), '#3A2A30', P(RC[0] + Math.sin(a) * 16, RC[1] + 5.6, RC[2] + Math.cos(a) * 16), [
          0,
          0,
          -a,
        ]);
      }
      RJ.add(SPH(2, 6, 5), '#3A2A30', P(RC[0], RC[1] + 6.4, RC[2]));
      const rm = keep(id, new T3.MeshBasicMaterial({ vertexColors: true }));
      g.add(new T3.Mesh(RJ.geo(), rm));
      const aguja = (len, w, rz) => {
        const K = new Bk(),
          piv = new T3.Group();
        K.add(BOX(w, len, 1), '#3A2A30', [0, len / 2 - 2, 0]);
        piv.add(new T3.Mesh(K.geo(), rm));
        piv.position.set(...P(RC[0], RC[1] + 6.2, RC[2]));
        piv.rotation.z = rz;
        g.add(piv);
        return piv;
      };
      aguja(10.5, 2.6, -1.9635);
      const minu = aguja(15.5, 1.8, Math.PI / 2);
      const luzR = glowSprite('#FFE9B0', 110);
      luzR.position.set(...P(RC[0], RC[1] - 8, RC[2]));
      luzR.material.opacity = 0.3;
      g.add(luzR);
      /* ── en altura: la señal de brazo, en alto (no pasa nadie) y con su farol rojo ── */
      limb(B, [SEM[0], SEM[1], 0], [SEM[0], SEM[1], 112], 3, 2.2, HIERRO, 6);
      B.add(CYL(6, 8, 6, 8), HIERRO, P(SEM[0], SEM[1], 3));
      B.add(CONE(3.4, 9, 6), '#E4A844', P(SEM[0], SEM[1], 116));
      B.add(BOX(30, 8, 2.4), '#B8484A', P(SEM[0] + 17, SEM[1] + 3, 102));
      B.add(BOX(7, 8, 2.6), '#F3EBD8', P(SEM[0] + 26, SEM[1] + 3.1, 102));
      B.add(BOX(8, 9, 7), HIERRO, P(SEM[0], SEM[1] + 4, 86));
      const SR = new Bk();
      SR.add(SPH(3.2, 8, 6), '#FF6A4A', P(SEM[0], SEM[1] + 8, 86));
      g.add(new T3.Mesh(SR.geo(), rm));
      const roja = glowSprite('#FF6A4A', 60);
      roja.position.set(...P(SEM[0], SEM[1] + 10, 86));
      g.add(roja);
      /* ── suelo: tablas de andén a los lados y el balasto de la vía en medio, con su raya de aviso ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#683E34';
        c.fillRect(0, 0, w, w);
        const R1 = rf('tre-suelo'),
          k = w / (2 * R);
        blobs(c, w, w, 34, R1, ['rgba(130,82,60,A)', 'rgba(60,32,34,A)'], 30, 90, 0.4);
        for (let x = 0; x < w; x += 24) {
          c.fillStyle = 'rgba(40,18,22,.45)';
          c.fillRect(x, 0, 1.6, w);
          for (let y = R1(0, 120); y < w; y += R1(90, 190)) c.fillRect(x, y, 24, 1.6);
        }
        const xa = tx(VX - 30, w),
          xb = tx(VX + 30, w);
        c.fillStyle = '#3A3654';
        c.fillRect(xa, 0, xb - xa, w);
        for (let i = 0; i < 520; i++) {
          c.fillStyle = i % 3 ? 'rgba(96,92,130,.6)' : 'rgba(30,26,48,.6)';
          c.beginPath();
          c.arc(R1(xa + 2, xb - 2), R1(0, w), R1(1, 2.6), 0, 6.283);
          c.fill();
        }
        c.fillStyle = 'rgba(246,217,138,.8)';
        for (let y = 0; y < w; y += 22) c.fillRect(xa - 9 * k, y, 3.4 * k, 13);
        c.fillStyle = 'rgba(30,18,26,.4)';
        c.fillRect(xa - 1.5, 0, 1.5, w);
        c.fillRect(xb, 0, 1.5, w);
      });
      texFloor(id, g, fl);
      /* ── luz: el farol del andén y la lámpara de la mesita, cálidos; el calor de la vía; los bordes, en noche ── */
      lightPool(id, g, -112, -160, 96, 74, '#FFD08A', 0.3);
      lightPool(id, g, 116, 4, 90, 70, '#FFD9A0', 0.2);
      const via = lightPool(id, g, VX, -150, 44, 120, '#FF9A50', 0.2);
      layer(id, g, vignette('rgba(18,12,40,A)'), 3.5, { op: 0.66 });
      B.mesh(g);
      /* ── el movimiento: el minutero intenta pasar de las 3:45 y vuelve; la luz de cola late al fondo del túnel ── */
      g.userData.tick = (t, still) => {
        const tt = still ? 0 : t;
        minu.rotation.z = Math.PI / 2 - (still ? 0 : 0.11 * Math.pow(Math.max(0, Math.sin(tt * 1.5)), 10));
        cola.material.opacity = 0.3 + 0.3 * Math.max(0, Math.sin(tt * 0.8));
        roja.material.opacity = 0.5 + 0.12 * Math.sin(tt * 1.1);
        via.material.opacity = 0.16 + 0.05 * Math.sin(tt * 0.6);
      };
      return g;
    };
  })();

  SALAS.add('inn', ['flowers'], INN, { hideTiles: 1, noRug: 1 });
  SALAS.add('tea', ['candles'], TEA, { hideTiles: 1, noRug: 1 });
  SALAS.add('far', [], FAR, { hideTiles: 1, noRug: 1 });
  SALAS.add('tre', [], TRE, { hideTiles: 1, noRug: 1 });
})();
