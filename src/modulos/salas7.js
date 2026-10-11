/* ══════════ SALAS 7 · la memoria: Desván, Estudio de Amaranta, Sala de retratos y Jardín de los nombres ══════════
   Mismo criterio que salas3.js: una pieza protagonista, algo que sobresale del muro, suelo propio, luz con
   intención, UNA cosa en altura y UN movimiento. Pocas piezas y suelo libre.
   No cambia la lógica: vecinos, puertas, muebles, objetos y recuerdos siguen en su sitio. */
(() => {
  if (!window.SALAS || !SALAS.kit.texFloor || !window.PROPS3D || !window.LP3D || !window.THREE) return;
  const T3 = THREE,
    { Bk, SPH, CYL, CONE, BOX, TOR, glowSprite, shd } = LP3D.kit,
    { WYAW, P, rf, limb } = PROPS3D.kit,
    { keep, ctex, solid, lightPool, layer, vignette, blobs, poolTex, tx, ty, texFloor, hangers, rope, ropeMesh, away } = SALAS.kit;
  const LT = [3, 4],
    BT = [4, 5],
    RT = [5, 0];
  /* tablas de madera para los suelos: filas con juntas alternas */
  function tablas(c, w, R1, alto, junta, veta) {
    for (let y = 0, f = 0; y < w; y += alto, f++) {
      c.fillStyle = junta;
      c.fillRect(0, y, w, 1.6);
      for (let x = (f % 2) * 60 + R1(0, 40); x < w; x += R1(90, 150)) c.fillRect(x, y, 1.6, alto);
      c.fillStyle = veta;
      for (let k = 0; k < 5; k++) c.fillRect(R1(0, w), y + R1(4, alto - 4), R1(30, 90), 1);
    }
  }
  /* el suelo propio va bajo lo que el juego pinta encima (disco giratorio, huellas, marcas) */
  function suelo(id, g, tex) {
    const m = texFloor(id, g, tex, 0.4).material;
    m.polygonOffset = true;
    m.polygonOffsetFactor = m.polygonOffsetUnits = -2;
  }

  /* ═════════════════ DESVÁN · la montaña de baúles y la caja cerrada en lo alto ═════════════════ */
  const DSV = (() => {
    const id = 'dsv',
      MX = -16,
      MY = -216;
    solid(id, MX, MY, 52);
    return () => {
      const g = new T3.Group(),
        B = new Bk();
      /* ── la montaña: baúles apilados contra la pared del fondo, hasta por encima del muro ── */
      const baul = (x, y, z, w, d, h, col, yaw, tapa = 0.3) => {
        const c = Math.cos(yaw),
          s = Math.sin(yaw),
          at = (ox, oy, oz) => P(x + ox * c + oy * s, y - ox * s + oy * c, z + oz);
        B.add(BOX(w, h * (1 - tapa), d), col, at(0, 0, (h * (1 - tapa)) / 2), [0, yaw, 0]);
        B.add(BOX(w + 2.4, h * tapa, d + 2.4), shd(col, 0.82), at(0, 0, h * (1 - tapa / 2)), [0, yaw, 0]);
        for (const ox of [-w * 0.3, w * 0.3]) B.add(BOX(3.4, h + 1.2, d + 3.6), '#C9A05C', at(ox, 0, h / 2), [0, yaw, 0]);
        B.add(BOX(6, 7, 2), '#E4A844', at(0, d / 2 + 1.8, h * (1 - tapa) - 1), [0, yaw, 0]);
      };
      baul(MX - 26, MY + 2, 0, 86, 48, 36, '#8A4A2A', 0.05);
      baul(MX + 48, MY - 2, 0, 56, 42, 32, '#6E4E36', -0.14);
      baul(MX + 4, MY - 2, 36, 64, 40, 28, '#3F5F4A', -0.08);
      baul(MX - 50, MY, 36, 34, 32, 22, '#7A2E3A', 0.16);
      baul(MX + 56, MY - 6, 32, 34, 28, 22, '#B8823E', 0.24, 0.5);
      /* una sombrerera, para que no todo sean baúles */
      B.add(CYL(13, 13, 14, 10), '#E9DCC6', P(MX - 50, MY, 65));
      B.add(CYL(14.2, 14.2, 4, 10), '#B8946A', P(MX - 50, MY, 73));
      /* la caja cerrada, atada con cordel y lacrada: «para cuando esté lista» */
      const CZ = 64,
        CY = MY - 4,
        CX = MX + 4;
      B.add(BOX(28, 20, 22), '#F3E7C8', P(CX, CY, CZ + 10), [0, -0.2, 0]);
      B.add(BOX(30, 5, 24), '#E4D3A8', P(CX, CY, CZ + 20), [0, -0.2, 0]);
      B.add(BOX(3, 24, 23.4), '#C9783A', P(CX, CY, CZ + 11.4), [0, -0.2, 0]);
      B.add(BOX(29.4, 24, 3), '#C9783A', P(CX, CY, CZ + 11.4), [0, -0.2, 0]);
      B.add(CYL(3.4, 3.4, 1.6, 8), '#C9483A', P(CX, CY, CZ + 23.6));
      /* la escalera de mano por la que subió */
      for (const dx of [-9, 9]) limb(B, [MX + 8 + dx, MY + 42, 0], [MX + 8 + dx, MY + 21, 70], 1.7, 1.7, '#B8945E', 5);
      for (let k = 1; k < 5; k++)
        limb(B, [MX - 1, MY + 42 - k * 4.2, k * 14], [MX + 17, MY + 42 - k * 4.2, k * 14], 1.3, 1.3, '#A07C4A', 4);
      /* ── suelo: tablas viejas del desván, con el polvo más claro en el centro ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#A48B70';
        c.fillRect(0, 0, w, w);
        const R1 = rf('dsv-suelo');
        blobs(c, w, w, 34, R1, ['rgba(190,168,138,A)', 'rgba(124,100,78,A)'], 30, 90, 0.4);
        tablas(c, w, R1, 26, 'rgba(70,48,30,.42)', 'rgba(90,64,42,.16)');
        const h = c.createRadialGradient(tx(-10, w), ty(10, w), 20, tx(-10, w), ty(10, w), 200);
        h.addColorStop(0, 'rgba(236,222,196,.34)');
        h.addColorStop(1, 'rgba(236,222,196,0)');
        c.fillStyle = h;
        c.fillRect(0, 0, w, w);
      });
      suelo(id, g, fl);
      /* ── en altura, una sola cosa: el rayo de la claraboya, que cae justo sobre la caja ── */
      const rg = new T3.CylinderGeometry(15, 46, 330, 12, 1, true);
      rg.userData.shared = true;
      const rayo = new T3.Mesh(
        rg,
        keep(
          id,
          new T3.MeshBasicMaterial({
            color: '#FFE9B8',
            transparent: true,
            opacity: 0.13,
            depthWrite: false,
            blending: T3.AdditiveBlending,
            side: T3.DoubleSide,
            fog: false,
          }),
        ),
      );
      rayo.position.set(...P(CX + 22, CY, CZ + 160));
      rayo.rotation.z = -0.13;
      g.add(rayo);
      const brillo = glowSprite('#FFE2A8', 96);
      brillo.position.set(...P(CX, CY + 4, CZ + 18));
      g.add(brillo);
      /* ── el único movimiento: el polvo que flota dentro del rayo ── */
      const N = 16,
        R0 = rf('sala-dsv'),
        mo = Array.from({ length: N }, () => [R0(0, 1), R0(0, 6.28), R0(0.3, 1)]),
        o = new T3.Object3D();
      const polvo = new T3.InstancedMesh(
        SPH(1.5, 5, 4),
        keep(
          id,
          new T3.MeshBasicMaterial({
            color: '#FFF0C8',
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
            blending: T3.AdditiveBlending,
            fog: false,
          }),
        ),
        N,
      );
      polvo.frustumCulled = false;
      g.add(polvo);
      /* ── luz: cálida al pie de la montaña; los rincones, en penumbra de madera ── */
      const pool = lightPool(id, g, MX, MY + 70, 170, 110, '#FFDFA0', 0.3);
      layer(id, g, vignette('rgba(46,28,14,A)'), 3.5, { op: 0.62 });
      B.mesh(g);
      g.userData.tick = (t, still) => {
        mo.forEach(([u0, ph, r], i) => {
          const u = ((still ? 0 : t * 0.025) + u0) % 1,
            rad = (16 + u * 22) * r;
          o.position.set(...P(CX + 4 + u * 26 + Math.cos(ph + u * 3) * rad, CY + Math.sin(ph + u * 3) * rad * 0.6, CZ + 30 + u * 180));
          o.scale.setScalar(Math.sin(u * Math.PI));
          o.updateMatrix();
          polvo.setMatrixAt(i, o.matrix);
        });
        polvo.instanceMatrix.needsUpdate = true;
        const k = still ? 1 : 0.86 + 0.14 * Math.sin(t * 0.9);
        brillo.material.opacity = 0.5 * k;
        pool.material.opacity = 0.3 * k;
      };
      return g;
    };
  })();

  /* ═════════════════ ESTUDIO DE AMARANTA · el casillero de cartas, la pluma que escribe sola y las cartas en el aire ═════════════════ */
  const EST = (() => {
    const id = 'est',
      KX = -100,
      KY = -245;
    solid(id, KX, KY + 6, 44);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        R0 = rf('sala-est');
      /* ── el casillero de cartas, detrás del escritorio: sube por encima del muro ── */
      const KW = 88,
        KH = 132;
      B.add(BOX(KW, KH, 24), '#9A6A3A', P(KX, KY, KH / 2));
      B.add(BOX(KW - 8, KH - 12, 2), '#5A3A22', P(KX, KY + 12.4, KH / 2 + 2));
      B.add(BOX(KW + 10, 6, 30), '#B8823E', P(KX, KY, KH + 3));
      B.add(BOX(KW + 4, 5, 27), '#7A4E2A', P(KX, KY, 2.5));
      for (let r = 1; r < 5; r++) B.add(BOX(KW - 8, 2.4, 5), '#C9954E', P(KX, KY + 13, 31 + r * 19));
      for (let c = 1; c < 4; c++) B.add(BOX(2.4, 76, 5), '#C9954E', P(KX - KW / 2 + 4 + (c * (KW - 8)) / 4, KY + 13, 88));
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++) {
          if ((r * 3 + c * 5) % 7 < 2) continue;
          const x = KX - KW / 2 + 4 + ((c + 0.5) * (KW - 8)) / 4,
            z = 50 + r * 19 + 9;
          B.add(BOX(13, 9, 3), (r + c) % 3 ? '#FBF4E3' : '#EFE2C6', P(x + R0(-2, 2), KY + 14, z - 3), [0.25, 0, R0(-0.3, 0.3)]);
          if ((r + c) % 2) B.add(CYL(1.6, 1.6, 1, 6), '#C9483A', P(x, KY + 16, z - 3), [Math.PI / 2, 0, 0]);
        }
      /* ── suelo: tarima de miel con la alfombra azul tinta de Amaranta y unas gotas de tinta junto al escritorio ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#CFA873';
        c.fillRect(0, 0, w, w);
        const R1 = rf('est-suelo'),
          k = w / (2 * R);
        blobs(c, w, w, 34, R1, ['rgba(232,200,146,A)', 'rgba(170,128,82,A)'], 30, 90, 0.4);
        tablas(c, w, R1, 22, 'rgba(110,70,36,.36)', 'rgba(130,90,50,.16)');
        const ov = (rx, ry, col) => {
          c.fillStyle = col;
          c.beginPath();
          c.ellipse(tx(10, w), ty(50, w), rx * k, ry * k, 0, 0, 6.28);
          c.fill();
        };
        ov(168, 112, '#E4C88A');
        ov(160, 104, '#3F4C6B');
        ov(132, 80, '#F0DDB0');
        ov(126, 74, '#4A587A');
        c.strokeStyle = 'rgba(240,221,176,.5)';
        c.lineWidth = 1.6;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * 6.28;
          c.beginPath();
          c.ellipse(tx(10 + Math.cos(a) * 66, w), ty(50 + Math.sin(a) * 38, w), 20 * k, 20 * k, 0, 0, 6.28);
          c.stroke();
        }
        c.fillStyle = 'rgba(40,46,80,.7)';
        for (const [x, y, r] of [
          [-40, -130, 5],
          [-28, -120, 2.4],
          [-52, -116, 3],
          [-20, -136, 1.8],
        ]) {
          c.beginPath();
          c.arc(tx(x, w), ty(y, w), r * k * 1.6, 0, 6.28);
          c.fill();
        }
      });
      suelo(id, g, fl);
      /* ── la pluma que escribe sola, sobre el cuaderno abierto ── */
      const Q = new Bk(),
        QP = [KX - 6, -182, 49];
      Q.add(CYL(0.5, 1, 46, 5), '#C9A060', [0, 23, 0]);
      Q.add(SPH(8, 8, 6), '#FBF4E3', [0, 30, 0], [0, 0, 0], [1, 2.2, 0.14]);
      Q.add(CONE(1.2, 5, 5), '#3A2A20', [0, 2.5, 0], [Math.PI, 0, 0]);
      const pluma = new T3.Group();
      Q.mesh(pluma);
      g.add(pluma);
      /* ── en altura, una sola cosa (y el único movimiento): las cartas que salen del escritorio hacia la puerta del Corazón ── */
      const S = new Bk();
      S.add(BOX(16, 0.8, 11), '#FBF4E3');
      S.add(CYL(2, 2, 1.4, 7), '#C9483A', [0, 0.5, 0]);
      const NC = 11,
        cartas = new T3.InstancedMesh(S.geo(), keep(id, new T3.MeshLambertMaterial({ vertexColors: true, side: T3.DoubleSide })), NC),
        o = new T3.Object3D(),
        A0 = [KX, -196, 62],
        C0 = [30, -226, 176],
        B0 = [196, -158, 92];
      cartas.frustumCulled = false;
      g.add(cartas);
      /* ── luz: la vela calienta el escritorio; los bordes, en sepia ── */
      const pool = lightPool(id, g, KX + 20, -150, 170, 120, '#FFD08A', 0.34);
      lightPool(id, g, 180, -110, 100, 80, '#FFB8A0', 0.14);
      layer(id, g, vignette('rgba(66,38,16,A)'), 3.5, { op: 0.58 });
      B.mesh(g);
      g.userData.tick = (t, still) => {
        const tt = still ? 0 : t;
        for (let i = 0; i < NC; i++) {
          const u = (tt * 0.035 + i / NC) % 1,
            v = 1 - u,
            f = (k) => v * v * A0[k] + 2 * v * u * C0[k] + u * u * B0[k];
          o.position.set(...P(f(0), f(1), f(2) + Math.sin(tt * 1.3 + i * 2) * 4));
          o.rotation.set(Math.sin(tt * 0.9 + i) * 0.7, i * 1.3 + tt * 0.4, Math.cos(tt * 0.7 + i * 1.9) * 0.6);
          o.scale.setScalar(Math.min(1, Math.sin(u * Math.PI) * 2.4) * 1.4);
          o.updateMatrix();
          cartas.setMatrixAt(i, o.matrix);
        }
        cartas.instanceMatrix.needsUpdate = true;
        pluma.position.set(...P(QP[0] + Math.sin(tt * 1.1) * 9, QP[1], QP[2] + Math.abs(Math.sin(tt * 7)) * 1.4));
        pluma.rotation.set(-0.25, 0, -0.5 + Math.sin(tt * 7) * 0.07);
        pool.material.opacity = still ? 0.34 : 0.32 + 0.03 * Math.sin(t * 4.3) * Math.sin(t * 1.3);
      };
      return g;
    };
  })();

  /* ═════════════════ SALA DE RETRATOS · el caballete enorme con el marco vacío y los retratos que te siguen con la mirada ═════════════════ */
  const RET = (() => {
    const id = 'ret',
      EX = 0,
      EY = -212;
    solid(id, EX, EY + 6, 46);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        MAD = '#8A5A34',
        ORO = '#D9A441',
        TOP = 128,
        TH = Math.atan(40 / TOP),
        lean = (z) => EY + 30 - (40 * z) / TOP;
      /* ── el caballete: tres patas hasta por encima del muro y, en su repisa, el marco dorado que espera a Amaranta ── */
      for (const sd of [-1, 1]) limb(B, [EX + sd * 50, EY + 30, 0], [EX + sd * 10, EY - 10, TOP], 4.8, 3.6, MAD, 6);
      limb(B, [EX, EY - 32, 0], [EX, EY - 10, TOP - 6], 4, 3.4, '#6E4424', 6);
      B.add(BOX(30, 9, 9), '#6E4424', P(EX, EY - 10, TOP - 3));
      B.add(BOX(100, 5, 13), MAD, P(EX, lean(24) + 7, 24));
      B.add(BOX(100, 4, 2.6), '#A87544', P(EX, lean(24) + 13, 28));
      const MW = 88,
        MH = 92,
        Z0 = 28,
        bar = (w, h, x, z, col = ORO, d = 5) => B.add(BOX(w, h, d), col, P(EX + x, lean(z) + 6, z), [-TH, 0, 0]);
      for (const sd of [-1, 1]) bar(8, MH, (sd * (MW - 8)) / 2, Z0 + MH / 2);
      bar(MW, 8, 0, Z0 + 4);
      bar(MW, 8, 0, Z0 + MH - 4);
      for (const sd of [-1, 1])
        for (const z of [Z0 + 4, Z0 + MH - 4]) B.add(SPH(6, 7, 5), '#F2C877', P(EX + (sd * (MW - 8)) / 2, lean(z) + 8, z));
      B.add(CYL(10, 10, 4, 6), '#F2C877', P(EX, lean(Z0 + MH) + 7, Z0 + MH + 5), [Math.PI / 2 - TH, 0, 0]);
      /* un pincel y un trapo olvidados en la repisa */
      limb(B, [EX + 40, lean(24) + 9, 28], [EX + 48, lean(24) + 12, 29], 1.1, 1.1, '#3E8FA0', 4);
      B.add(BOX(14, 3, 9), '#F3EBD8', P(EX - 44, lean(24) + 9, 28.5), [0, 0.3, 0]);
      const hueco = glowSprite('#FFE3B0', 130);
      hueco.position.set(...P(EX, lean(Z0 + MH / 2) + 2, Z0 + MH / 2));
      g.add(hueco);
      /* ── suelo: tarima oscura de galería con una alfombra de panal bajo el taller de Marco ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#7A4A50';
        c.fillRect(0, 0, w, w);
        const R1 = rf('ret-suelo'),
          k = w / (2 * R);
        blobs(c, w, w, 34, R1, ['rgba(150,96,98,A)', 'rgba(84,44,54,A)'], 30, 90, 0.4);
        tablas(c, w, R1, 24, 'rgba(48,20,28,.42)', 'rgba(60,28,36,.18)');
        const hex = (r, col) => {
          c.fillStyle = col;
          c.beginPath();
          for (let i = 0; i < 6; i++) c.lineTo(tx(-6 + Math.cos((i / 6) * 6.28) * r, w), ty(10 + Math.sin((i / 6) * 6.28) * r * 0.86, w));
          c.closePath();
          c.fill();
        };
        hex(150, '#C9A060');
        hex(142, '#5A2E3A');
        hex(112, '#C9A060');
        hex(106, '#6E3644');
        c.strokeStyle = 'rgba(201,160,96,.4)';
        c.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * 6.28 + 0.52;
          c.beginPath();
          for (let j = 0; j <= 6; j++)
            c.lineTo(
              tx(-6 + Math.cos(a) * 62 + Math.cos((j / 6) * 6.28) * 26, w),
              ty(10 + (Math.sin(a) * 62 + Math.sin((j / 6) * 6.28) * 26) * 0.86, w),
            );
          c.stroke();
        }
      });
      suelo(id, g, fl);
      /* ── en altura, una sola cosa (y el único movimiento): los retratos colgados, que se giran para mirarte ── */
      const pts = [
          [-186, -44, 168],
          [-120, -150, 172],
          [124, -154, 172],
          [190, -36, 168],
        ],
        S = new Bk(),
        ov = [Math.PI / 2, 0, 0];
      for (const q of pts) limb(B, [q[0], q[1], q[2] - 2], [q[0], q[1], 430], 0.5, 0.5, '#B89A78', 3);
      S.add(CYL(15, 15, 2.6, 12), ORO, [0, -20, 0], ov, [1, 1, 1.28]);
      S.add(CYL(11.6, 11.6, 3.2, 12), '#3A2A32', [0, -20, 0], ov, [1, 1, 1.28]);
      S.add(SPH(8, 8, 6), '#4E6B7A', [0, -29, 1.2], [0, 0, 0], [1, 0.8, 0.25]);
      S.add(SPH(4.6, 8, 6), '#E7B994', [0, -19, 1.6], [0, 0, 0], [1, 1.1, 0.4]);
      S.add(CYL(8.4, 8.4, 1.2, 10), '#E9C46A', [0, -14.6, 2], [0.5, 0, 0]);
      S.add(SPH(4, 7, 5), '#E9C46A', [0, -13.4, 1.8], [0, 0, 0], [1, 0.8, 0.5]);
      for (const sx of [-1.7, 1.7]) S.add(SPH(0.75, 5, 4), '#2A1A1A', [sx, -19, 3.5]);
      const cuadros = new T3.InstancedMesh(S.geo(), keep(id, new T3.MeshLambertMaterial({ vertexColors: true })), pts.length),
        o = new T3.Object3D(),
        yaw = pts.map((q) => Math.atan2(-q[0], 60 - q[1]));
      cuadros.frustumCulled = false;
      g.add(cuadros);
      /* ── luz: un foco cálido sobre el marco vacío; los bordes, en vino ── */
      lightPool(id, g, EX, EY + 70, 170, 110, '#FFE3B0', 0.34);
      layer(id, g, vignette('rgba(44,12,28,A)'), 3.5, { op: 0.6 });
      B.mesh(g);
      g.userData.tick = (t, still) => {
        const aqui = !still && typeof cur !== 'undefined' && cur === id && typeof Pl !== 'undefined';
        pts.forEach((q, i) => {
          const a = aqui ? Math.atan2(Pl.x - q[0], Pl.y - q[1]) : Math.atan2(-q[0], 60 - q[1]);
          yaw[i] += (a - yaw[i]) * 0.06;
          o.position.set(...P(...q));
          o.rotation.set(still ? 0 : Math.sin(t * 0.8 + i * 1.7) * 0.04, yaw[i], 0);
          o.updateMatrix();
          cuadros.setMatrixAt(i, o.matrix);
        });
        cuadros.instanceMatrix.needsUpdate = true;
        hueco.material.opacity = still ? 0.26 : 0.22 + 0.08 * Math.sin(t * 0.8);
      };
      return g;
    };
  })();

  /* ═════════════════ JARDÍN DE LOS NOMBRES · el árbol sin nombre y la guirnalda de etiquetas que llega hasta él ═════════════════ */
  const JAR = (() => {
    const id = 'jar',
      TX = 166,
      TY = -114;
    solid(id, TX, TY, 24);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        R0 = rf('sala-jar'),
        CORT = '#EADCC0';
      /* ── el árbol sin nombre: joven, de corteza clara y hojas de oro pálido, más alto que el muro ── */
      limb(B, [TX, TY, 0], [TX - 4, TY + 2, 74], 9, 6, CORT, 7);
      const ramas = [
        [TX - 30, TY + 8, 116],
        [TX + 22, TY - 6, 124],
        [TX - 2, TY + 14, 132],
      ];
      for (const r of ramas) limb(B, [TX - 4, TY + 2, 70], r, 5, 2.4, CORT, 6);
      for (const z of [22, 40, 57]) B.add(BOX(7, 1.6, 2), '#B8A27C', P(TX - 2 + (z % 5), TY + 8.6 - z * 0.03, z), [0, 0.2, 0]);
      for (const [dx, dy, z, r, col] of [
        [-34, 8, 126, 26, '#F4D56E'],
        [26, -4, 134, 28, '#F8E39A'],
        [-4, 18, 144, 30, '#FFEFB4'],
        [-2, -10, 156, 26, '#F4D56E'],
        [-48, 16, 110, 16, '#F8E39A'],
        [44, 6, 112, 15, '#FFEFB4'],
      ])
        F.add(SPH(r, 7, 5), col, P(TX + dx, TY + dy, z), [R0(0, 3), R0(0, 3), 0], [1, 0.82, 1]);
      /* la tierra recién removida y su corro de piedras */
      B.add(SPH(34, 10, 6), '#6E4E34', P(TX - 2, TY + 6, 0), [0, 0, 0], [1, 0.14, 0.8]);
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * 6.28 + 0.3;
        B.add(
          SPH(4.6, 6, 4),
          k % 2 ? '#E9E2D0' : '#CFC6B2',
          P(TX - 2 + Math.cos(a) * 36, TY + 6 + Math.sin(a) * 29, 1.6),
          [0, a, 0],
          [1, 0.7, 1],
        );
      }
      /* ── suelo: hierba tierna, un sendero de losas entre las dos puertas y pétalos al pie del árbol ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#A9BF86';
        c.fillRect(0, 0, w, w);
        const R1 = rf('jar-suelo'),
          k = w / (2 * R);
        blobs(c, w, w, 46, R1, ['rgba(196,214,150,A)', 'rgba(120,150,96,A)'], 26, 80, 0.5);
        c.strokeStyle = 'rgba(90,124,76,.35)';
        c.lineWidth = 1.4;
        for (let i = 0; i < 150; i++) {
          const x = R1(0, w),
            y = R1(0, w);
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + R1(-3, 3), y - R1(4, 8));
          c.stroke();
        }
        const A = [225, 130],
          M = [40, 70],
          Z = [0, -230];
        for (let i = 0; i <= 13; i++) {
          const t = i / 13,
            u = 1 - t,
            x = u * u * A[0] + 2 * u * t * M[0] + t * t * Z[0] + R1(-6, 6),
            y = u * u * A[1] + 2 * u * t * M[1] + t * t * Z[1] + R1(-4, 4);
          c.fillStyle = i % 2 ? '#DAD6C2' : '#CBC8B4';
          c.beginPath();
          c.ellipse(tx(x, w), ty(y, w), R1(13, 17) * k, R1(9, 11) * k, R1(0, 3), 0, 6.28);
          c.fill();
        }
        for (let i = 0; i < 40; i++) {
          const a = R1(0, 6.28),
            d = R1(34, 92);
          c.fillStyle = i % 3 ? 'rgba(255,244,200,.85)' : 'rgba(255,255,255,.85)';
          c.beginPath();
          c.ellipse(tx(TX - 14 + Math.cos(a) * d, w), ty(TY + 24 + Math.sin(a) * d * 0.8, w), 2.6, 1.6, a, 0, 6.28);
          c.fill();
        }
      });
      suelo(id, g, fl);
      /* ── en altura, una sola cosa (y el único movimiento): la guirnalda de nombres; la última etiqueta, junto al árbol, está en blanco ── */
      const L1 = rope([-128, -120, 122], [-44, -250, 106], 8, 7),
        L2 = rope([44, -250, 106], ramas[0], 9, 8);
      ropeMesh(B, L1, 0.7, '#8A6A4A');
      ropeMesh(B, L2, 0.7, '#8A6A4A');
      limb(B, L1[7], L2[0], 0.7, 0.7, '#8A6A4A', 4);
      const TG = new Bk(),
        tp = [...L1.slice(1, 6), ...L2.slice(2, 8)];
      TG.add(BOX(0.8, 7, 0.8), '#FFFFFF', [0, -3.5, 0]);
      TG.add(BOX(10, 14, 1), '#FFFFFF', [0, -13, 0]);
      const tags = hangers(
        id,
        g,
        tp,
        TG.geo(),
        tp.map((_, i) => (i === tp.length - 1 ? '#FFFFFF' : ['#EAD3A0', '#F0C9B8', '#DCE0B0', '#E8D9B8'][i % 4])),
        0.3,
      );
      const aura = glowSprite('#FFF2B0', 230);
      aura.position.set(...P(TX - 6, TY + 14, 138));
      g.add(aura);
      /* ── luz: el sol se cuela justo sobre el árbol nuevo; los bordes, en verde hondo ── */
      const pool = lightPool(id, g, TX - 30, TY + 50, 160, 116, '#FFF0B0', 0.32);
      layer(id, g, vignette('rgba(24,56,30,A)'), 3.5, { op: 0.5 });
      B.mesh(g);
      F.mesh(g, true);
      g.userData.tick = (t, still) => {
        tags(still ? 0 : t, 0.2, 1.1);
        const k = still ? 1 : 0.85 + 0.15 * Math.sin(t * 0.7);
        aura.material.opacity = 0.3 * k;
        pool.material.opacity = 0.32 * k;
      };
      return g;
    };
  })();

  SALAS.add('dsv', [], DSV, { hideTiles: 1, noRug: 1 });
  SALAS.add('est', [], EST, { hideTiles: 1, noRug: 1 });
  SALAS.add('ret', ['jars'], RET, { hideTiles: 1, noRug: 1 });
  SALAS.add('jar', ['flowers'], JAR, { hideTiles: 1, noRug: 1 });
})();
