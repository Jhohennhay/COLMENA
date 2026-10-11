/* ══════════ SALAS 6 · las raíces y el centro: Sótano de cera, Cueva de cristales, El Campanario y El Corazón ══════════
   Mismo criterio que salas3.js (docs/guia-salas.md, lección de la limpieza): una pieza protagonista, algo que
   sobresale del muro, suelo propio, luz con intención, UNA cosa en altura y UN movimiento. Pocas piezas y suelo libre.
   No cambia la lógica: vecinos, puertas, objetos y recuerdos siguen en su sitio. */
(() => {
  if (!window.SALAS || !SALAS.kit.texFloor || !window.PROPS3D || !window.LP3D || !window.THREE) return;
  const T3 = THREE,
    { Bk, SPH, CYL, CONE, BOX, OCT, glowSprite } = LP3D.kit,
    { WYAW, P, rf, limb } = PROPS3D.kit,
    { keep, ctex, solid, lightPool, layer, vignette, blobs, tx, ty, texFloor, hangers, rope, ropeMesh, wallQuad } = SALAS.kit;
  const LT = [3, 4],
    BT = [4, 5],
    RT = [5, 0];
  const beat = () => (typeof beatK === 'function' ? beatK() : 0);
  /* rejilla de panal muy tenue para los suelos propios: la firma de la colmena, sin competir */
  function panal(c, w, lado, col) {
    c.strokeStyle = col;
    c.lineWidth = 1.5;
    const h = lado * Math.sqrt(3);
    for (let i = -1; i * lado * 1.5 < w + lado; i++)
      for (let j = -1; j * h < w + h; j++) {
        const x = i * lado * 1.5,
          y = j * h + (i % 2 ? h / 2 : 0);
        c.beginPath();
        for (let k = 0; k < 6; k++) c.lineTo(x + Math.cos((k * Math.PI) / 3) * lado, y + Math.sin((k * Math.PI) / 3) * lado);
        c.closePath();
        c.stroke();
      }
  }

  /* ═════════════════ SÓTANO DE CERA · el órgano de velas derretidas y la rueda que gotea ═════════════════ */
  const SOT = (() => {
    const id = 'sot',
      ESQ = wallPt(LT, 1, 0, 0),
      D = [0.5, 0.866],
      S = [0.866, -0.5],
      C0 = [ESQ[0] + D[0] * 26, ESQ[1] + D[1] * 26],
      /* estalactitas de cera que rebosan del muro: [pared, u, largo] */
      EST = [
        [LT, 0.64, 14],
        [LT, 0.675, 26],
        [LT, 0.71, 18],
        [LT, 0.745, 38],
        [LT, 0.78, 24],
        [LT, 0.815, 46],
        [LT, 0.85, 30],
        [LT, 0.885, 52],
        [LT, 0.92, 36],
        [LT, 0.955, 58],
        [BT, 0.03, 44],
        [BT, 0.07, 22],
      ],
      ZM = 128;
    solid(id, C0[0] + D[0] * 8, C0[1] + D[1] * 8, 36);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        FL = new Bk(),
        CERA = ['#F6EBCB', '#EFDFB4', '#E7D09C'],
        glows = [];
      const llama = (x, y, z, r) => {
        B.add(CYL(0.7, 0.7, r * 0.6, 4), '#3A2A20', P(x, y, z + r * 0.3));
        FL.add(CONE(r * 0.36, r * 1.1, 5), '#FFC860', P(x, y, z + r * 0.95));
        FL.add(SPH(r * 0.3, 6, 5), '#FFE9A8', P(x, y, z + r * 0.55));
      };
      /* una vela gorda: cuerpo, borde fundido y goterones que le cuelgan */
      const vela = (x, y, z0, r, h, k, gotas = 3) => {
        const col = CERA[k % 3];
        B.add(CYL(r * 0.9, r, h, 8), col, P(x, y, z0 + h / 2));
        B.add(SPH(r, 8, 5), col, P(x, y, z0 + h), [0, 0, 0], [1.04, 0.3, 1.04]);
        for (let j = 0; j < gotas; j++) {
          const a = 1.2 + j * 2.1 + k,
            L = h * (0.18 + 0.14 * ((j + k) % 3));
          B.add(
            SPH(r * 0.3, 6, 5),
            col,
            P(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, z0 + h - L / 2),
            [0, 0, 0],
            [1, L / (r * 0.6), 1],
          );
        }
      };
      /* ── la pieza: el órgano de velas en la esquina del fondo, más alto que el muro ── */
      [
        [0, -8, 18, 106],
        [-25, 0, 14, 92],
        [23, -2, 15, 96],
        [-10, 19, 14, 74],
        [15, 21, 13, 62],
        [-38, 13, 11, 56],
        [39, 11, 11, 46],
        [-22, 34, 10, 36],
        [5, 38, 10, 28],
        [31, 32, 9, 20],
      ].forEach(([s, d, r, h], k) => {
        const x = C0[0] + S[0] * s + D[0] * d,
          y = C0[1] + S[1] * s + D[1] * d;
        vela(x, y, 0, r, h, k);
        llama(x, y, h + r * 0.3, r * 0.55);
        if (k < 3) glows.push([x, y, h + r + 6, 74 - k * 8]);
      });
      B.add(SPH(52, 12, 6), CERA[1], P(C0[0] + D[0] * 12, C0[1] + D[1] * 12, 1), [0, 0, 0], [1, 0.16, 1]);
      /* la carta que Amaranta fundió: una esquina de papel asoma de la cera, con su lacre */
      {
        const x = C0[0] + D[0] * 50 - S[0] * 12,
          y = C0[1] + D[1] * 50 - S[1] * 12;
        B.add(BOX(17, 1.2, 12), '#FBF4E3', P(x, y, 6), [0.5, 0.6, 0.12]);
        B.add(CYL(2.6, 2.6, 1.6, 8), '#B8382E', P(x + 1, y + 2, 7.6), [0.5, 0.6, 0.12]);
      }
      /* ── en altura, una sola cosa: la cera que rebosa por lo alto del muro y cuelga en estalactitas ── */
      EST.forEach(([e, u, L], k) => {
        const q = wallPt(e, u, ZM, 5),
          r = 4 + L * 0.07;
        B.add(SPH(11, 8, 5), CERA[0], P(q[0], q[1], ZM), [0, WYAW(e), 0], [1.5, 0.6, 0.8]);
        B.add(CONE(r, L, 7), CERA[k % 2], P(q[0], q[1], ZM - 2 - L / 2), [Math.PI, 0, 0]);
      });
      /* ── la cera escrita en las paredes: renglones de letra menuda a los lados de las puertas ── */
      const esc = ctex(512, 128, (c, w, h) => {
        const R1 = rf('sot-letra');
        c.strokeStyle = 'rgba(255,240,205,.95)';
        c.lineWidth = 2.2;
        c.lineCap = 'round';
        for (let r = 0; r < 5; r++) {
          let x = 10 + R1(0, 16);
          const y = 16 + r * 24;
          while (x < w - 30) {
            const L = R1(18, 54);
            c.beginPath();
            c.moveTo(x, y);
            for (let u = 0; u <= L; u += 3)
              c.lineTo(x + u, y + Math.sin(u * 0.55 + r) * 3.4 * Math.sin((u / L) * Math.PI) - (u % 9 < 3 ? 5 : 0));
            c.stroke();
            x += L + R1(8, 14);
            if (R1(0, 1) < 0.14) x += 40;
          }
        }
      });
      const escM = keep(
        id,
        new T3.MeshBasicMaterial({ map: esc, color: '#FFE2A8', transparent: true, opacity: 0.42, depthWrite: false, side: T3.DoubleSide }),
      );
      for (const [e, u0, u1] of [
        [LT, 0.05, 0.31],
        [LT, 0.69, 0.87],
        [RT, 0.06, 0.31],
        [RT, 0.69, 0.95],
      ])
        g.add(new T3.Mesh(wallQuad(e, u0, u1, 22, 22 + (u1 - u0) * 300 * 0.25 * 1.9, 2.5), escM));
      /* ── suelo: losa tibia de sótano, con la cera derramada desde el órgano y las gotas bajo la rueda ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#5A4A3C';
        c.fillRect(0, 0, w, w);
        const R1 = rf('sot-suelo');
        blobs(c, w, w, 44, R1, ['rgba(112,92,72,A)', 'rgba(58,46,38,A)'], 26, 84, 0.5);
        panal(c, w, 34, 'rgba(34,24,18,.34)');
        const charco = (x, y, r, a) => {
          const q = c.createRadialGradient(tx(x, w), ty(y, w), 0, tx(x, w), ty(y, w), (r * w) / 600);
          q.addColorStop(0, `rgba(246,234,200,${a})`);
          q.addColorStop(0.86, `rgba(236,218,172,${a * 0.92})`);
          q.addColorStop(1, 'rgba(236,218,172,0)');
          c.fillStyle = q;
          c.fillRect(0, 0, w, w);
        };
        for (const [s, d, r] of [
          [0, 26, 60],
          [-28, 56, 26],
          [34, 54, 30],
          [8, 80, 16],
        ])
          charco(C0[0] + S[0] * s + D[0] * d, C0[1] + S[1] * s + D[1] * d, r, 0.92);
        for (const k of [3, 5, 9]) {
          const q = wallPt(EST[k][0], EST[k][1], 0, 5);
          charco(q[0], q[1], 13, 0.9);
        }
      });
      texFloor(id, g, fl, 1);
      /* ── el único movimiento: las gotas que caen de las estalactitas (las llamas solo respiran) ── */
      const gotaM = keep(id, new T3.MeshBasicMaterial({ color: '#FFF1CC' })),
        gotas = [];
      for (const k of [3, 5, 9]) {
        const q = wallPt(EST[k][0], EST[k][1], 0, 5),
          m = new T3.Mesh(SPH(2.2, 6, 5), gotaM);
        g.add(m);
        gotas.push({ m, x: q[0], y: q[1], z: ZM - 4 - EST[k][2], ph: k * 0.37 });
      }
      g.add(new T3.Mesh(FL.geo(), keep(id, new T3.MeshBasicMaterial({ vertexColors: true }))));
      const luces = glows.map(([x, y, z, s], i) => {
        const sp = glowSprite('#FFB85A', s);
        sp.position.set(...P(x, y, z));
        g.add(sp);
        return { sp, ph: i * 1.9 };
      });
      /* ── luz: el órgano alumbra su esquina y la tina; los bordes, en sombra de bodega ── */
      const pool = lightPool(id, g, C0[0] + 40, C0[1] + 90, 200, 150, '#FFA848', 0.3);
      lightPool(id, g, 40, 40, 130, 96, '#FFD08A', 0.12);
      layer(id, g, vignette('rgba(26,12,6,A)'), 3.5, { op: 0.72 });
      B.mesh(g);
      g.userData.tick = (t, still) => {
        const k = still ? 1 : 0.88 + 0.12 * Math.sin(t * 4.1) * Math.sin(t * 1.3);
        luces.forEach((q, i) => (q.sp.material.opacity = 0.42 * (still ? 1 : 0.85 + 0.15 * Math.sin(t * 3.3 + q.ph))));
        pool.material.opacity = 0.3 * k;
        for (const q of gotas) {
          const u = ((still ? 0 : t * 0.42) + q.ph) % 1,
            v = Math.min(1, u / 0.45);
          q.m.position.set(...P(q.x, q.y, q.z - v * v * (q.z - 3)));
          q.m.visible = !still && u < 0.45;
        }
      };
      return g;
    };
  })();

  /* ═════════════════ CUEVA DE CRISTALES · la geoda abierta y el cristal que late ═════════════════ */
  const CUE = (() => {
    const id = 'cue',
      R0 = rf('sala-cue'),
      GX = -36,
      GY = -206,
      GZ = 56,
      GR = 88,
      INC = 0.92,
      TH0 = 1.02;
    solid(id, GX, GY, 72);
    /* la cáscara partida (se hace una vez): roca por fuera, amatista por dentro y la veta blanca del borde */
    const casc = (r) => {
      const q = new T3.SphereGeometry(r, 10, 6, 0, Math.PI * 2, TH0, Math.PI - TH0);
      q.userData.shared = true;
      return q;
    };
    const G_OUT = casc(GR),
      G_IN = casc(GR - 7),
      G_RIM = new T3.TorusGeometry((GR - 3.5) * Math.sin(TH0), 5.2, 5, 10);
    G_RIM.rotateX(Math.PI / 2);
    G_RIM.rotateY(Math.PI / 10);
    G_RIM.translate(0, (GR - 3.5) * Math.cos(TH0), 0);
    G_RIM.userData.shared = true;
    return () => {
      const g = new T3.Group(),
        F = new Bk(),
        X = new Bk(),
        ROCA = ['#4A3E5A', '#5A4E6E', '#3E3550'],
        CRI = ['#C8B6FF', '#9FB6FF', '#9FE0D0', '#FFB6E6', '#E6DCFF'];
      /* ── la pieza: la geoda, medio hundida al fondo y más alta que el muro, abierta hacia quien entra ── */
      const geo = new T3.Group();
      geo.position.set(...P(GX, GY, GZ));
      geo.rotation.x = INC;
      geo.add(new T3.Mesh(G_OUT, keep(id, new T3.MeshLambertMaterial({ color: '#54466C', flatShading: true }))));
      geo.add(
        new T3.Mesh(
          G_IN,
          keep(
            id,
            new T3.MeshLambertMaterial({
              color: '#8B6BD0',
              flatShading: true,
              side: T3.BackSide,
              emissive: '#4A2A8A',
              emissiveIntensity: 0.55,
            }),
          ),
        ),
      );
      geo.add(
        new T3.Mesh(
          G_RIM,
          keep(id, new T3.MeshLambertMaterial({ color: '#F2EAFF', flatShading: true, emissive: '#8A7AB0', emissiveIntensity: 0.35 })),
        ),
      );
      g.add(geo);
      /* el eje de la boca, en coordenadas del cuarto, y el centro del hueco */
      const AX = [0, Math.sin(INC), Math.cos(INC)],
        CEN = [GX, GY, GZ];
      /* cristales que tapizan el interior: nacen de la pared de amatista y apuntan al centro */
      for (let k = 0; k < 32; k++) {
        const th = 1.28 + (k % 5) * 0.34 + R0(-0.08, 0.08),
          ph = (k / 32) * 6.28 * 5 + R0(-0.2, 0.2),
          /* dirección en el marco de la geoda (y = eje) y luego inclinada como ella */
          lx = Math.sin(th) * Math.cos(ph),
          ly = Math.cos(th),
          lz = Math.sin(th) * Math.sin(ph),
          d = [lx, ly * Math.sin(INC) + lz * Math.cos(INC), ly * Math.cos(INC) - lz * Math.sin(INC)],
          L = R0(14, 28) * (th > 2.3 ? 1.3 : 1),
          r = 4 + L * 0.13,
          a = [CEN[0] + d[0] * (GR - 8), CEN[1] + d[1] * (GR - 8), CEN[2] + d[2] * (GR - 8)],
          m = [a[0] - d[0] * L, a[1] - d[1] * L, a[2] - d[2] * L],
          b = [m[0] - d[0] * r * 1.5, m[1] - d[1] * r * 1.5, m[2] - d[2] * r * 1.5];
        if (a[2] < 3) continue;
        limb(X, a, m, r, r * 0.86, CRI[k % 5], 6);
        limb(X, m, b, r * 0.86, 0.3, CRI[k % 5], 6);
      }
      const criM = keep(
        id,
        new T3.MeshLambertMaterial({
          vertexColors: true,
          flatShading: true,
          emissive: '#6A4AB0',
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.94,
        }),
      );
      g.add(new T3.Mesh(X.geo(), criM));
      /* rocas al pie, para que la geoda asiente en el suelo */
      for (const [dx, dy, r] of [
        [-74, 30, 22],
        [-52, 58, 15],
        [70, 34, 20],
        [48, 60, 13],
        [-88, -6, 18],
      ])
        F.add(SPH(r, 6, 4), ROCA[Math.floor(R0(0, 3))], P(GX + dx, GY + dy, r * 0.3), [R0(0, 3), R0(0, 3), 0], [1, 0.62, 1]);
      /* ── el cristal que late, en el centro del hueco ── */
      const KP = [CEN[0] + AX[0] * 6, CEN[1] + AX[1] * 6, CEN[2] + AX[2] * 6],
        K = new Bk();
      K.add(OCT(15), '#FFE6F7', [0, 0, 0], [0, 0.5, 0], [1, 2.1, 1]);
      K.add(OCT(8), '#FFD0EE', [13, -8, 4], [0.2, 0.2, 0.5], [1, 1.9, 1]);
      K.add(OCT(7), '#E6DCFF', [-12, -10, 2], [0.1, 0.9, -0.45], [1, 1.8, 1]);
      const cor = new T3.Mesh(
        K.geo(),
        keep(id, new T3.MeshLambertMaterial({ vertexColors: true, flatShading: true, emissive: '#FF9AD8', emissiveIntensity: 0.7 })),
      );
      cor.position.set(...P(...KP));
      cor.rotation.x = 0.3;
      g.add(cor);
      const halo = glowSprite('#F0B8FF', 230);
      halo.position.set(...P(KP[0], KP[1] + 10, KP[2] + 8));
      g.add(halo);
      /* ── suelo: roca violeta con vetas de cristal que salen de la geoda ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#3D3556';
        c.fillRect(0, 0, w, w);
        const R1 = rf('cue-suelo');
        blobs(c, w, w, 46, R1, ['rgba(84,72,116,A)', 'rgba(40,32,62,A)'], 26, 84, 0.5);
        panal(c, w, 34, 'rgba(24,18,44,.3)');
        c.lineCap = 'round';
        for (let i = 0; i < 9; i++) {
          const an = 0.35 + (i / 8) * 2.44 + R1(-0.08, 0.08);
          let x = GX + Math.cos(an) * 70,
            y = GY + Math.sin(an) * 70,
            a = an;
          const n = 5 + (i % 3) * 2;
          for (let j = 0; j < n; j++) {
            a += R1(-0.5, 0.5);
            const x1 = x + Math.cos(a) * 30,
              y1 = y + Math.sin(a) * 30;
            c.strokeStyle = `rgba(214,196,255,${0.5 * (1 - j / n)})`;
            c.lineWidth = 3.2 * (1 - j / n) + 0.6;
            c.beginPath();
            c.moveTo(tx(x, w), ty(y, w));
            c.lineTo(tx(x1, w), ty(y1, w));
            c.stroke();
            x = x1;
            y = y1;
          }
        }
        c.fillStyle = 'rgba(236,226,255,.6)';
        for (let i = 0; i < 80; i++) c.fillRect(R1(0, w), R1(0, w), 1.5, 1.5);
      });
      texFloor(id, g, fl, 1);
      /* ── en altura, una sola cosa: cristales colgados de un hilo, quietos casi ── */
      const pts = [
          [-190, -80, 176],
          [-116, 40, 190],
          [96, -150, 168],
          [176, -50, 184],
          [128, 70, 196],
        ],
        HG = new Bk();
      HG.add(OCT(6.5), '#FFFFFF', [0, -15, 0], [0, 0.4, 0], [1, 2.3, 1]);
      const hilos = new Bk();
      for (const q of pts) limb(hilos, q, [q[0], q[1], 460], 0.45, 0.45, '#8E86B0', 3);
      hilos.mesh(g);
      const cuelga = hangers(
        id,
        g,
        pts,
        HG.geo(),
        pts.map((_, i) => CRI[(i * 2) % 5]),
        0,
      );
      /* ── luz: la geoda tiñe el cuarto de lila y late; los bordes, en violeta hondo ── */
      const pool = lightPool(id, g, GX + 20, GY + 120, 220, 160, '#C39CFF', 0.3);
      lightPool(id, g, 70, 60, 110, 84, '#9FE0D0', 0.1);
      layer(id, g, vignette('rgba(12,6,30,A)'), 3.5, { op: 0.72 });
      F.mesh(g, true);
      g.userData.tick = (t, still) => {
        const b = still ? 0 : beat(),
          r = still ? 0.5 : 0.5 + 0.5 * Math.sin(t * 1.5),
          k = 0.25 * r + b;
        cuelga(still ? 0 : t, 0.1, 0.7);
        cor.scale.setScalar(1 + 0.05 * r + 0.16 * b);
        cor.material.emissiveIntensity = 0.55 + 0.6 * k;
        halo.material.opacity = Math.min(0.95, 0.4 + 0.5 * k);
        pool.material.opacity = 0.26 + 0.2 * k;
        criM.emissiveIntensity = 0.42 + 0.4 * k;
      };
      return g;
    };
  })();

  /* ═════════════════ EL CAMPANARIO · el templete de la campana de medianoche y las cometas atadas ═════════════════ */
  const CUM = (() => {
    const id = 'cum',
      BX = 170,
      BY = -116,
      HP = 128,
      POSTES = [
        [BX - 47, BY + 27],
        [BX + 47, BY + 27],
        [BX - 47, BY - 27],
        [BX + 47, BY - 27],
      ];
    for (const q of POSTES) solid(id, q[0], q[1], 7);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        MAD = '#8A5A34',
        MADO = '#6E4426';
      /* ── la pieza: el templete del campanario sobre la campana, con su tejado por encima del muro ── */
      POSTES.forEach((q, k) => {
        limb(B, [q[0], q[1], 0], [q[0], q[1], HP], 5, 4.2, MAD, 6);
        B.add(BOX(15, 5, 15), MADO, P(q[0], q[1], 2.5));
        const o = POSTES[[1, 3, 0, 2][k]];
        limb(B, [q[0], q[1], HP - 3], [o[0], o[1], HP - 3], 3.6, 3.6, MADO, 5);
        /* jabalcones bajo el alero */
        const s = q[0] < BX ? 1 : -1;
        limb(B, [q[0], q[1], HP - 34], [q[0] + s * 26, q[1], HP - 5], 2.4, 2.4, MADO, 4);
      });
      B.add(BOX(122, 5, 82), MADO, P(BX, BY, HP + 1));
      F.add(CONE(86, 34, 4), '#C9694B', P(BX, BY, HP + 20), [0, Math.PI / 4, 0], [1, 1, 0.68]);
      F.add(CONE(38, 16, 4), '#B4573C', P(BX, BY, HP + 31), [0, Math.PI / 4, 0], [1, 1, 0.68]);
      B.add(SPH(4.5, 8, 6), '#E8B84A', P(BX, BY, HP + 41));
      /* ── las cometas: atadas al templete, vuelan sobre el cuarto (lo único en altura, lo único que se mueve) ── */
      const pts = [
          [30, -96, 150],
          [-84, -30, 164],
          [-150, -128, 134],
        ],
        K = new Bk();
      K.add(CONE(22, 1, 4), '#FFFFFF', [0, 13, 4], [-Math.PI / 2 + 0.4, 0, 0], [0.8, 1, 1.28]);
      K.add(CYL(0.5, 0.5, 34, 3), '#FFFFFF', [0, -26, -8], [0.3, 0, 0]);
      for (let k = 0; k < 3; k++)
        K.add(CONE(5, 1, 4), '#FFFFFF', [k % 2 ? 3.5 : -3.5, -19 - k * 10, -5.8 - k * 3.1], [-Math.PI / 2 + 0.3, 0, 0], [1.3, 1, 0.8]);
      const cometas = hangers(id, g, pts, K.geo(), ['#FFC2B8', '#FFD76A', '#A8DCEE'], 0);
      pts.forEach((q, i) => {
        const a = POSTES[i === 2 ? 2 : 0];
        ropeMesh(B, rope([a[0], a[1], HP], q, 14 + i * 5, 9), 0.5, '#E9DFC8');
      });
      /* ── nubes posadas en el muro, a los lados: el campanario está por encima de ellas ── */
      for (const [e, u, r] of [
        [LT, 0.1, 30],
        [LT, 0.24, 22],
        [RT, 0.78, 24],
        [RT, 0.92, 32],
      ]) {
        const q = wallPt(e, u, 0, -14);
        B.add(SPH(r, 10, 7), '#FFFFFF', P(q[0], q[1], 118 + r * 0.2), [0, 0, 0], [1.25, 0.62, 1]);
      }
      /* ── suelo: losa clara de torre con una rosa de los vientos y nieve en los bordes ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#C5CBD2';
        c.fillRect(0, 0, w, w);
        const R1 = rf('cum-suelo'),
          k = w / (2 * R);
        blobs(c, w, w, 44, R1, ['rgba(226,231,236,A)', 'rgba(160,170,182,A)'], 26, 84, 0.5);
        panal(c, w, 34, 'rgba(110,122,138,.3)');
        /* la losa oscura bajo el templete */
        c.fillStyle = 'rgba(120,112,108,.42)';
        c.beginPath();
        for (let i = 0; i < 6; i++) c.lineTo(tx(BX + Math.cos((i * Math.PI) / 3) * 74, w), ty(BY + Math.sin((i * Math.PI) / 3) * 62, w));
        c.fill();
        /* la rosa de los vientos, delante */
        const cx = tx(-40, w),
          cy = ty(70, w);
        c.strokeStyle = 'rgba(176,122,52,.6)';
        c.lineWidth = 2;
        for (const r of [62, 70]) {
          c.beginPath();
          c.arc(cx, cy, r * k, 0, 6.28);
          c.stroke();
        }
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4,
            L = (i % 2 ? 34 : 58) * k,
            wd = (i % 2 ? 7 : 10) * k;
          for (const sg of [-1, 1]) {
            c.fillStyle = sg > 0 ? 'rgba(201,146,62,.72)' : 'rgba(118,128,146,.6)';
            c.beginPath();
            c.moveTo(cx, cy);
            c.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L);
            c.lineTo(cx + Math.cos(a + sg * 0.785) * wd, cy + Math.sin(a + sg * 0.785) * wd);
            c.fill();
          }
        }
        const n = c.createRadialGradient(w / 2, w / 2, w * 0.33, w / 2, w / 2, w * 0.5);
        n.addColorStop(0, 'rgba(255,255,255,0)');
        n.addColorStop(1, 'rgba(255,255,255,.85)');
        c.fillStyle = n;
        c.fillRect(0, 0, w, w);
      });
      texFloor(id, g, fl, 1);
      /* ── luz: claridad de altura en el centro, un rincón cálido bajo el tejado; los bordes, en azul de cielo ── */
      lightPool(id, g, -20, 40, 200, 150, '#FFFFFF', 0.16);
      lightPool(id, g, BX - 10, BY + 40, 120, 90, '#FFD9A0', 0.22);
      layer(id, g, vignette('rgba(64,92,130,A)'), 3.5, { op: 0.42 });
      B.mesh(g);
      F.mesh(g, true);
      g.userData.tick = (t, still) => cometas(still ? 0 : t, 0.16, 0.8);
      return g;
    };
  })();

  /* ═════════════════ EL CORAZÓN · el capullo de cera que late y las raíces de luz hacia los seis sellos ═════════════════ */
  const COR = (() => {
    const id = 'cor',
      CX = 0,
      CY = -76,
      CZ = 72,
      SX = 80,
      SY = 62,
      SZ = 84,
      AB = 1.08,
      TMAX = Math.PI * 0.94;
    solid(id, CX, CY - 16, 60);
    solid(id, CX - 68, CY + 8, 16);
    solid(id, CX + 68, CY + 8, 16);
    /* un punto de la cáscara (ph alrededor, th desde la punta): un huevo que se afila hacia arriba */
    const casc = (ph, th, k = 1) => {
      const y = Math.cos(th),
        f = (y > 0 ? 1 - 0.42 * Math.pow(y, 1.6) : 1) * Math.sin(th) * k;
      return [CX - Math.cos(ph) * f * SX, CY + Math.sin(ph) * f * SY, CZ + y * SZ * (y > 0 ? 1.12 : 1)];
    };
    const PH0 = Math.PI / 2 + AB,
      PHL = Math.PI * 2 - 2 * AB;
    /* la cáscara abierta por delante (se hace una vez) */
    const G = new T3.SphereGeometry(1, 10, 7, PH0, PHL, 0, TMAX),
      pp = G.attributes.position;
    for (let i = 0; i < pp.count; i++) {
      const y = pp.getY(i),
        f = y > 0 ? 1 - 0.42 * Math.pow(y, 1.6) : 1;
      pp.setXYZ(i, pp.getX(i) * f * SX, y * SZ * (y > 0 ? 1.12 : 1), pp.getZ(i) * f * SY);
    }
    G.computeVertexNormals();
    G.userData.shared = true;
    /* las seis raíces: del pie del capullo hacia los seis vértices del panal */
    const raices = (c, w, R1, col, ancho, luz) => {
      c.lineCap = 'round';
      c.lineJoin = 'round';
      if (luz) {
        c.shadowColor = col;
        c.shadowBlur = 10;
      }
      for (let k = 0; k < 6; k++) {
        const an = (k * Math.PI) / 3,
          a = [CX + Math.cos(an) * 46, CY + 18 + Math.sin(an) * 40],
          b = [Math.cos(an) * 268, Math.sin(an) * 268],
          L = Math.hypot(b[0] - a[0], b[1] - a[1]),
          nx = -(b[1] - a[1]) / L,
          ny = (b[0] - a[0]) / L,
          N = 12;
        let p = a;
        for (let j = 1; j <= N; j++) {
          const t = j / N,
            o = Math.sin(t * Math.PI) * Math.sin(t * 6 + k * 1.7) * 9,
            q = [a[0] + (b[0] - a[0]) * t + nx * o, a[1] + (b[1] - a[1]) * t + ny * o];
          c.strokeStyle = col;
          c.lineWidth = ancho * (1 - 0.72 * t);
          c.beginPath();
          c.moveTo(tx(p[0], w), ty(p[1], w));
          c.lineTo(tx(q[0], w), ty(q[1], w));
          c.stroke();
          /* una raicilla a cada lado */
          if (j === 4 || j === 8) {
            const s = j === 4 ? 1 : -1,
              e = [q[0] + (b[0] - a[0]) * 0.1 + nx * s * 26, q[1] + (b[1] - a[1]) * 0.1 + ny * s * 26];
            c.lineWidth = ancho * 0.34;
            c.beginPath();
            c.moveTo(tx(q[0], w), ty(q[1], w));
            c.lineTo(tx(e[0], w), ty(e[1], w));
            c.stroke();
          }
          p = q;
        }
        /* el sello al final de cada raíz */
        c.fillStyle = col;
        c.beginPath();
        for (let i = 0; i < 6; i++) c.lineTo(tx(b[0] + Math.cos((i * Math.PI) / 3) * 9, w), ty(b[1] + Math.sin((i * Math.PI) / 3) * 9, w));
        c.fill();
      }
      c.shadowBlur = 0;
    };
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        CERA = '#EBCB7C',
        CERAL = '#F7E4AE',
        CERAO = '#D6AC58';
      /* ── la pieza: el capullo de cera, abierto por delante, que guarda el corazón y sobresale del muro ── */
      const capM = keep(
        id,
        new T3.MeshLambertMaterial({ color: CERA, flatShading: true, side: T3.DoubleSide, emissive: '#C9772F', emissiveIntensity: 0.34 }),
      );
      const cap = new T3.Mesh(G, capM);
      cap.position.set(...P(CX, CY, CZ));
      g.add(cap);
      /* los labios de la abertura y tres vueltas de hilo de cera que lo envuelven */
      for (const ph of [PH0, PH0 + PHL]) {
        const L = [];
        for (let j = 0; j <= 10; j++) L.push(casc(ph, 0.02 + (TMAX - 0.02) * (j / 10), 1.01));
        ropeMesh(B, L, 4.6, CERAL);
      }
      [0.62, 1.2, 1.86].forEach((th, i) => {
        const L = [];
        for (let j = 0; j <= 12; j++) L.push(casc(PH0 + PHL * (j / 12), th + 0.1 * Math.sin(j * 0.9 + i), 1.03));
        ropeMesh(B, L, 2.6, CERAO);
      });
      /* la punta y la cera que se remansa al pie */
      B.add(SPH(9, 8, 6), CERAL, P(CX, CY, CZ + SZ * 1.12 + 2), [0, 0, 0], [1, 1.3, 1]);
      for (const [dx, dy, r] of [
        [-74, 6, 20],
        [74, 6, 20],
        [0, -46, 40],
      ])
        B.add(SPH(r, 9, 5), CERA, P(CX + dx, CY + dy, 1), [0, 0, 0], [1, 0.2, 0.8]);
      /* ── en altura, una sola cosa: los hilos de cera que sostienen el capullo desde lo alto ── */
      const TOP = [CX, CY, CZ + SZ * 1.12 + 8];
      for (const [dx, dy] of [
        [0, 0],
        [-90, -30],
        [90, -30],
        [-44, 40],
        [44, 40],
      ])
        limb(B, TOP, [CX + dx * 2.6, CY + dy * 2.6, 470], 0.9, 0.5, CERAL, 4);
      const halo = glowSprite('#FFC860', 280);
      halo.position.set(...P(CX, CY + 20, CZ + 4));
      g.add(halo);
      /* ── suelo: cera oscura de panal, tibia en el centro, con las seis raíces dibujadas ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#7C5A34';
        c.fillRect(0, 0, w, w);
        const R1 = rf('cor-suelo');
        blobs(c, w, w, 44, R1, ['rgba(156,116,66,A)', 'rgba(92,64,36,A)'], 26, 84, 0.5);
        const q = c.createRadialGradient(tx(CX, w), ty(-20, w), 10, tx(CX, w), ty(-20, w), w * 0.36);
        q.addColorStop(0, 'rgba(244,196,110,.6)');
        q.addColorStop(1, 'rgba(244,196,110,0)');
        c.fillStyle = q;
        c.fillRect(0, 0, w, w);
        panal(c, w, 34, 'rgba(58,36,16,.3)');
        raices(c, w, R1, 'rgba(250,214,130,.5)', 9, 0);
      });
      texFloor(id, g, fl, 1);
      /* la luz de las raíces, encima: es lo que late */
      const rz = layer(
        id,
        g,
        ctex(512, 512, (c, w) => raices(c, w, rf('cor-suelo'), 'rgba(255,226,150,.95)', 5, 1)),
        3.3,
        { add: 1, op: 0.4, col: '#FFD27A' },
      );
      /* ── luz: todo sale del capullo; los bordes, en penumbra de miel oscura ── */
      const pool = lightPool(id, g, CX, CY + 86, 230, 170, '#FFB84A', 0.3);
      layer(id, g, vignette('rgba(36,16,4,A)'), 3.5, { op: 0.72 });
      B.mesh(g);
      /* ── el único movimiento: el latido (capullo, halo y raíces respiran y laten con la colmena) ── */
      g.userData.tick = (t, still) => {
        const b = still ? 0 : beat(),
          r = still ? 0.5 : 0.5 + 0.5 * Math.sin(t * 1.1),
          k = 0.3 * r + b;
        capM.emissiveIntensity = 0.3 + 0.5 * k;
        halo.material.opacity = Math.min(0.9, 0.34 + 0.5 * k);
        pool.material.opacity = 0.26 + 0.22 * k;
        rz.material.opacity = Math.min(1, 0.3 + 0.7 * k);
        cap.scale.setScalar(1 + 0.025 * b);
      };
      return g;
    };
  })();

  SALAS.add('sot', ['candles'], SOT, { hideTiles: 1, noRug: 1 });
  SALAS.add('cue', ['crystals'], CUE, { hideTiles: 1, noRug: 1 });
  SALAS.add('cum', ['snow', 'flowers'], CUM, { hideTiles: 1, noRug: 1 });
  SALAS.add('cor', ['candles'], COR, { hideTiles: 1, noRug: 1 });
})();
