/* ══════════ SALAS 3 · el segundo barrio: Espacio, Desierto y Antártida (Océano ya está en salas.js) ══════════
   Mismo criterio que las anteriores, con la lección de la limpieza: una pieza protagonista, algo que sobresale
   del muro, suelo propio, luz con intención, UNA cosa en altura y UN movimiento. Pocas piezas y suelo libre.
   No cambia la lógica: vecinos, puertas, objetos y recuerdos siguen en su sitio. */
(() => {
  if (!window.SALAS || !SALAS.kit.texFloor || !window.PROPS3D || !window.LP3D || !window.THREE) return;
  const T3 = THREE,
    { Bk, SPH, CYL, CONE, BOX, TOR, glowSprite } = LP3D.kit,
    { WYAW, P, rf, limb } = PROPS3D.kit,
    { keep, ctex, solid, lightPool, layer, vignette, blobs, poolTex, tx, ty, texFloor, hangers } = SALAS.kit;
  const LT = [3, 4],
    BT = [4, 5],
    RT = [5, 0];

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
      g.add(new T3.Mesh(H.geo(), iceM));
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
