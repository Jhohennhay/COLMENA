/* ══════════ SALAS 4 · la casa de Amaranta: Colmenar, Biblioteca, La Última Cena y Relojería ══════════
   Mismo criterio que salas3.js (docs/guia-salas.md, lección de la limpieza): una pieza protagonista, algo que
   sobresale del muro, suelo propio, luz con intención, UNA cosa en altura y UN movimiento. Pocas piezas y suelo libre.
   No cambia la lógica: vecinos, puertas, objetos y muebles siguen en su sitio. */
(() => {
  if (!window.SALAS || !SALAS.kit.texFloor || !window.PROPS3D || !window.LP3D || !window.THREE) return;
  const T3 = THREE,
    { Bk, SPH, CYL, CONE, BOX, TOR, glowSprite } = LP3D.kit,
    { WYAW, P, rf, limb } = PROPS3D.kit,
    { keep, ctex, solid, lightPool, layer, vignette, blobs, poolTex, tx, ty, texFloor, hangers, rope, ropeMesh, away } = SALAS.kit;
  const LT = [3, 4],
    BT = [4, 5],
    RT = [5, 0],
    HALF = Math.PI / 2;
  /* una esfera de reloj que mira al frente, parada a las cuatro menos cuarto */
  function esfera(B, x, y, z, r, aro, lados = 20) {
    B.add(CYL(r + 5, r + 5, 5, lados), aro, P(x, y, z), [HALF, 0, 0]);
    B.add(CYL(r, r, 6, 20), '#FBF4E3', P(x, y + 1, z), [HALF, 0, 0]);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * 6.283,
        q = r * 0.82;
      B.add(BOX(k % 3 ? 1.6 : 2.6, r * 0.16, 1.4), '#5A3A22', P(x + Math.sin(a) * q, y + 4.2, z + Math.cos(a) * q), [0, 0, -a]);
    }
    const mano = (a, L, w) => limb(B, [x, y + 5.4, z], [x + Math.sin(a) * L, y + 5.4, z + Math.cos(a) * L], w, w * 0.6, '#3A2618', 4);
    mano(4.712, r * 0.74, 1.7);
    mano(1.963, r * 0.5, 2.2);
    B.add(CYL(r * 0.1, r * 0.1, 3, 8), '#C9A24A', P(x, y + 6, z), [HALF, 0, 0]);
  }

  /* ═════════════════ RELOJERÍA · el gran reloj de péndulo con los engranajes a la vista ═════════════════ */
  const REL = (() => {
    const id = 'rel',
      KX = 0,
      KY = -232;
    solid(id, KX, KY, 50);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        NOG = '#5A3A22',
        MAD = '#7A5232',
        LATON = '#C9A24A';
      /* ── la caja abierta del reloj: zócalo, dos montantes, fondo oscuro y la esfera por encima del muro ── */
      B.add(BOX(118, 14, 42), NOG, P(KX, KY - 4, 7));
      B.add(BOX(124, 3, 46), MAD, P(KX, KY - 4, 15));
      B.add(BOX(100, 126, 3), '#3A2618', P(KX, KY - 20, 77));
      for (const sx of [-1, 1]) B.add(BOX(10, 126, 12), MAD, P(KX + sx * 52, KY - 8, 77));
      esfera(B, KX, KY - 10, 102, 32, '#D89A45', 24);
      /* el tejadillo, por encima del muro */
      B.add(BOX(126, 6, 46), NOG, P(KX, KY - 6, 143));
      B.add(CYL(27, 27, 122, 3, false, HALF), MAD, P(KX, KY - 6, 160), [0, 0, HALF]);
      B.add(CONE(6, 16, 4), LATON, P(KX, KY - 6, 194), [0, Math.PI / 4, 0]);
      /* ── los tres engranajes: cada uno es una malla que gira a saltos con el péndulo ── */
      const rueda = (r, n, col, x, z) => {
        const G = new Bk();
        G.add(CYL(r, r, 5, n * 2), col);
        for (let k = 0; k < n; k++) {
          const a = (k / n) * 6.283;
          G.add(BOX(r * 0.3, 5, r * 0.34), col, [Math.cos(a) * r * 1.08, 0, Math.sin(a) * r * 1.08], [0, -a, 0]);
        }
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * 6.283 + 0.6;
          G.add(CYL(r * 0.2, r * 0.2, 5.6, 6), '#3A2618', [Math.cos(a) * r * 0.56, 0, Math.sin(a) * r * 0.56]);
        }
        G.add(CYL(r * 0.2, r * 0.2, 7.5, 8), NOG);
        const m = G.mesh(g);
        m.position.set(...P(KX + x, KY - 14, z));
        m.rotation.x = HALF;
        return { m, n };
      };
      const ruedas = [rueda(20, 14, '#C9A060', -25, 41), rueda(13, 9, '#8A6A4A', 11, 49), rueda(9, 6, '#E4A844', 33, 36)];
      /* ── el péndulo: varilla y lenteja de latón colgando del travesaño ── */
      const pend = new T3.Group(),
        PB = new Bk();
      PB.add(CYL(1.2, 1.2, 38, 5), '#8A6A4A', [0, -19, 0]);
      PB.add(CYL(10, 10, 4, 16), '#E4A844', [0, -38, 0], [HALF, 0, 0]);
      PB.add(CYL(5.5, 5.5, 5, 12), '#F6D27A', [0, -38, 0.4], [HALF, 0, 0]);
      PB.mesh(pend);
      const brillo = glowSprite('#FFD98A', 50);
      brillo.position.set(0, -38, 4);
      brillo.material.opacity = 0.34;
      pend.add(brillo);
      pend.position.set(...P(KX, KY - 2, 68));
      g.add(pend);
      /* ── en altura, una sola cosa: los relojes parados que cuelgan, todos a la misma hora ── */
      for (const [x, y, z, r] of [
        [-92, -216, 114, 10],
        [100, -224, 120, 11],
      ]) {
        limb(B, [x, y, z + r + 8], [x, y, 430], 0.5, 0.5, '#8A6A4A', 3);
        B.add(TOR(4, 1, 4, 8), LATON, P(x, y, z + r + 7));
        esfera(B, x, y, z, r, LATON, 14);
      }
      /* ── suelo: nogal oscuro con ruedas de latón incrustadas, como el dibujo de un mecanismo ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#6E4A30';
        c.fillRect(0, 0, w, w);
        const R1 = rf('rel-suelo'),
          k = w / (2 * R);
        blobs(c, w, w, 34, R1, ['rgba(138,96,60,A)', 'rgba(70,44,26,A)'], 30, 90, 0.4);
        for (let y = 0; y < w; y += 26) {
          c.fillStyle = 'rgba(40,24,12,.3)';
          c.fillRect(0, y, w, 1.6);
          const o = R1(0, 120);
          for (let x = o; x < w; x += 132) c.fillRect(x, y, 1.6, 26);
        }
        const rd = (x, y, r, n, a0) => {
          const cx = tx(x, w),
            cy = ty(y, w);
          c.beginPath();
          for (let i = 0; i <= n * 4; i++) {
            const a = a0 + (i / (n * 4)) * 6.283,
              q = (Math.floor((i + 1) / 2) % 2 ? r * 1.1 : r * 0.94) * k;
            c.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q);
          }
          c.closePath();
          c.stroke();
          c.beginPath();
          c.arc(cx, cy, r * 0.66 * k, 0, 6.283);
          c.stroke();
          for (let i = 0; i < 6; i++) {
            const a = a0 + (i / 6) * 6.283;
            c.beginPath();
            c.moveTo(cx + Math.cos(a) * r * 0.16 * k, cy + Math.sin(a) * r * 0.16 * k);
            c.lineTo(cx + Math.cos(a) * r * 0.66 * k, cy + Math.sin(a) * r * 0.66 * k);
            c.stroke();
          }
          c.beginPath();
          c.arc(cx, cy, r * 0.16 * k, 0, 6.283);
          c.stroke();
        };
        c.strokeStyle = 'rgba(226,182,100,.5)';
        c.lineWidth = 2.6;
        rd(-30, 40, 118, 20, 0.1);
        rd(128, 150, 62, 11, 0.32);
        rd(-176, 156, 50, 9, 0);
        rd(150, -30, 44, 8, 0.2);
      });
      texFloor(id, g, fl);
      /* ── luz: el reloj en su charco dorado; los bordes, en nogal ── */
      const pool = lightPool(id, g, KX, KY + 70, 190, 130, '#FFD28A', 0.36);
      lightPool(id, g, 40, 90, 150, 110, '#FFE6B8', 0.12);
      layer(id, g, vignette('rgba(40,22,8,A)'), 3.5, { op: 0.62 });
      B.mesh(g);
      F.mesh(g, true);
      /* ── el único movimiento: el péndulo oscila y, a cada vaivén, las ruedas avanzan medio diente ── */
      g.userData.tick = (t, still) => {
        const tt = still ? 0 : t,
          ph = (tt * 2.6) / Math.PI,
          paso = Math.floor(ph) + Math.min(1, (ph % 1) * 4);
        pend.rotation.z = still ? 0 : Math.sin(tt * 2.6) * 0.3;
        ruedas.forEach((q, i) => (q.m.rotation.y = ((i % 2 ? -1 : 1) * paso * Math.PI) / q.n));
        pool.material.opacity = 0.34 + (still ? 0 : 0.03 * Math.sin(tt * 2.6));
      };
      return g;
    };
  })();

  /* ═════════════════ BIBLIOTECA · la estantería en espiral que sube por encima del muro ═════════════════ */
  const BIB = (() => {
    const id = 'bib',
      R0 = rf('sala-bib'),
      SX = 96,
      SY = -178;
    solid(id, SX, SY, 60);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        LOMOS = ['#6F8D8A', '#C9563A', '#E9C99A', '#4E6B46', '#8A5A3A', '#C9A060', '#F3E7C8', '#A5523A', '#6F968C'];
      /* ── la espiral: un eje de madera y una rampa de estantes que sube dando vueltas, con sus libros al borde ── */
      B.add(CYL(58, 61, 5, 16), '#5A3A22', P(SX, SY, 2.5));
      B.add(CYL(8, 10, 176, 8), '#7A5232', P(SX, SY, 88));
      const N = 46,
        da = 6.283 / 16;
      for (let i = 0; i < N; i++) {
        const a = 2.2 + i * da,
          z = 9 + i * 3.5,
          r = 54 - i * 0.5,
          len = 2 * r * Math.tan(da / 2) + 1.5,
          yw = HALF - a,
          rm = (8 + r) / 2;
        B.add(BOX(len, 2.6, r - 6), i % 2 ? '#8A5A34' : '#9A6A40', P(SX + Math.cos(a) * rm, SY + Math.sin(a) * rm, z), [0, yw, 0]);
        for (let j = 0; j < 3; j++) {
          if (R0(0, 1) < 0.14) continue;
          const s = ((j - 1) * len) / 3,
            h = 11 + R0(0, 6),
            q = r - 6;
          B.add(
            BOX(len / 3 - 0.8, h, 9),
            LOMOS[Math.floor(R0(0, LOMOS.length))],
            P(SX + Math.cos(a) * q + Math.sin(a) * s, SY + Math.sin(a) * q - Math.cos(a) * s, z + 1.3 + h / 2),
            [0, yw, R0(0, 1) < 0.15 ? 0.22 : 0],
          );
        }
      }
      /* el farol de lectura en lo alto del eje */
      B.add(CYL(13, 9, 4, 8), '#5A3A22', P(SX, SY, 177));
      B.add(CONE(8, 9, 6), '#C9A24A', P(SX, SY, 198));
      const farol = new T3.Mesh(SPH(7, 8, 6), keep(id, new T3.MeshBasicMaterial({ color: '#FFE9B0' })));
      farol.position.set(...P(SX, SY, 187));
      g.add(farol);
      const luz = glowSprite('#FFE3A0', 120);
      luz.position.set(...P(SX, SY, 187));
      g.add(luz);
      /* ── suelo: parqué en espiga y una alfombra verde de lectura ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#B58852';
        c.fillRect(0, 0, w, w);
        const R1 = rf('bib-suelo'),
          k = w / (2 * R);
        blobs(c, w, w, 36, R1, ['rgba(214,170,110,A)', 'rgba(140,96,52,A)'], 30, 90, 0.4);
        c.strokeStyle = 'rgba(88,54,24,.3)';
        c.lineWidth = 1.4;
        for (let y = -20; y < w + 20; y += 18) {
          c.beginPath();
          for (let x = 0, i = 0; x <= w; x += 18, i++) c.lineTo(x, y + (i % 2 ? 18 : 0));
          c.stroke();
        }
        const hex = (r) => {
          c.beginPath();
          for (let i = 0; i < 6; i++) c.lineTo(tx(-24 + Math.cos(i * 1.0472) * r, w), ty(78 + Math.sin(i * 1.0472) * r, w));
          c.closePath();
        };
        hex(104);
        c.fillStyle = '#56784F';
        c.fill();
        c.strokeStyle = '#E9D9A8';
        c.lineWidth = 7 * k * 1.2;
        hex(94);
        c.stroke();
        c.strokeStyle = 'rgba(201,160,96,.9)';
        c.lineWidth = 2.4;
        hex(80);
        c.stroke();
        hex(32);
        c.stroke();
      });
      texFloor(id, g, fl);
      /* ── en altura, una sola cosa (y el único movimiento): los libros que vuelan en corro alrededor de la espiral ── */
      const NB = 6,
        alaG = (sx) => {
          const q = new T3.BoxGeometry(11, 1, 15);
          q.translate(sx * 5.5, 0, 0);
          q.userData.shared = true;
          return q;
        },
        alaM = keep(id, new T3.MeshLambertMaterial({ color: '#FFFFFF', side: T3.DoubleSide })),
        alas = [-1, 1].map((sx) => {
          const I = new T3.InstancedMesh(alaG(sx), alaM, NB),
            c = new T3.Color();
          for (let i = 0; i < NB; i++) I.setColorAt(i, c.set(['#F3E7C8', '#C9563A', '#6F968C', '#E9C99A', '#F3E7C8', '#C9A060'][i]));
          I.frustumCulled = false;
          g.add(I);
          return { I, sx };
        }),
        o = new T3.Object3D();
      const vuela = (t, quieto) => {
        for (let i = 0; i < NB; i++) {
          const a = t * 0.22 + (i / NB) * 6.283,
            rx = 100 + (i % 3) * 20,
            ry = 62 + (i % 2) * 16,
            fl2 = quieto ? 0.45 : 0.5 + 0.42 * Math.sin(t * 5 + i * 1.9);
          for (const w of alas) {
            o.position.set(...P(SX - 24 + Math.cos(a) * rx, SY + 52 + Math.sin(a) * ry, 122 + 12 * Math.sin(a * 2 + i)));
            o.rotation.set(0, Math.atan2(-Math.sin(a) * rx, Math.cos(a) * ry), w.sx * fl2);
            o.updateMatrix();
            w.I.setMatrixAt(i, o.matrix);
          }
        }
        for (const w of alas) w.I.instanceMatrix.needsUpdate = true;
      };
      /* ── luz: el farol baña la espiral; la lámpara de la mesa, su rincón; los bordes, en verde hondo ── */
      lightPool(id, g, SX - 16, SY + 76, 180, 126, '#FFE2A0', 0.32);
      lightPool(id, g, -104, -40, 110, 84, '#FFD890', 0.2);
      layer(id, g, vignette('rgba(22,40,26,A)'), 3.5, { op: 0.6 });
      B.mesh(g);
      F.mesh(g, true);
      g.userData.tick = (t, still) => {
        vuela(still ? 0 : t, still);
        luz.material.opacity = still ? 0.5 : 0.5 + 0.06 * Math.sin(t * 1.3);
      };
      return g;
    };
  })();

  /* ═════════════════ LA ÚLTIMA CENA · la mesa larga a medio comer y el reloj parado ═════════════════ */
  const COC = (() => {
    const id = 'coc',
      R0 = rf('sala-coc'),
      TX = -5,
      TY = 208,
      SIL = TX - 136;
    for (const x of [-90, -30, 30, 90]) solid(id, TX + x, TY, 32);
    solid(id, SIL - 20, TY + 4, 22);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        MAD = '#8A5A34',
        MADL = '#A87044',
        LOZA = '#FFFDF4';
      /* ── la mesa larga: con la mesa del centro suman los veinticinco platos de aquella noche ── */
      B.add(BOX(246, 4, 46), MADL, P(TX, TY, 24));
      B.add(BOX(236, 6, 38), MAD, P(TX, TY, 19));
      for (const sx of [-112, 0, 112]) for (const sy of [-16, 16]) B.add(BOX(5, 17, 5), MAD, P(TX + sx, TY + sy, 8.5));
      B.add(BOX(238, 0.8, 22), '#FBF4E3', P(TX, TY, 26.4));
      for (const sy of [-8, 8]) B.add(BOX(238, 0.9, 2), '#E4A844', P(TX, TY + sy, 26.5));
      const plato = (x, y, k) => {
        B.add(CYL(6.2, 4.6, 1.4, 10), LOZA, P(x, y, 27.4));
        if (k % 3) B.add(BOX(4.2, 2.4, 3.4), k % 2 ? '#E4A844' : '#C9873C', P(x + 0.6, y, 29), [0, k * 1.3, 0]);
        if (k % 2) B.add(CYL(1.9, 1.5, 3.8, 6), '#C9873C', P(x + 8.5, y - 2, 28.6));
      };
      for (let k = 0; k < 9; k++) {
        plato(TX - 96 + k * 24, TY - 15, k);
        plato(TX - 96 + k * 24, TY + 15, k + 4);
      }
      B.add(CYL(6.2, 4.6, 1.4, 10), LOZA, P(TX - 114, TY, 27.4));
      /* el pastel de miel sin terminar, la jarra y tres candeleros: solo una vela sigue encendida */
      B.add(CYL(9, 9, 5, 12, false, 0, 5.1), '#E9B24A', P(TX + 36, TY, 29.4));
      B.add(CYL(9.4, 9.4, 1.2, 12, false, 0, 5.1), '#FBE7B4', P(TX + 36, TY, 32.4));
      B.add(CYL(3.6, 5, 11, 8), '#C9694B', P(TX - 36, TY, 32.4));
      [
        [-72, 4],
        [0, 10],
        [72, 3],
      ].forEach(([x, h]) => {
        B.add(CYL(1.4, 2.8, 3, 8), '#C9A24A', P(TX + x, TY, 28.4));
        B.add(CYL(1.3, 1.3, h, 6), '#FBF4E3', P(TX + x, TY, 30 + h / 2));
      });
      const llama = glowSprite('#FFC870', 44);
      llama.position.set(...P(TX, TY, 44));
      g.add(llama);
      B.add(CONE(1.4, 4.6, 5), '#FFD36A', P(TX, TY, 42.4));
      /* los bancos, a los dos lados */
      for (const sy of [-33, 33]) {
        B.add(BOX(222, 3, 11), MAD, P(TX, TY + sy, 13));
        for (const sx of [-100, 0, 100]) B.add(BOX(4, 12, 9), '#6E4A2A', P(TX + sx, TY + sy, 6));
      }
      /* la silla de Amaranta, caída de espaldas en la cabecera */
      B.add(BOX(26, 3, 16), MADL, P(SIL - 31, TY + 4, 1.5));
      B.add(BOX(3, 16, 16), MAD, P(SIL - 18, TY + 4, 8));
      B.add(BOX(1.6, 12, 12), '#E4A844', P(SIL - 20, TY + 4, 8));
      for (const [sy, z] of [
        [-6.5, 1.5],
        [6.5, 1.5],
        [-6.5, 14.5],
        [6.5, 14.5],
      ])
        B.add(BOX(18, 2.4, 2.4), '#6E4A2A', P(SIL - 9, TY + 4 + sy, z));
      /* ── en altura, una sola cosa: el reloj parado sobre la puerta del fondo, asomando por encima del muro ── */
      esfera(B, 0, -254, 132, 27, '#D89A45', 6);
      B.add(BOX(12, 5, 8), MAD, P(0, -256, 100));
      /* ── suelo: baldosa de barro en damero, hollín junto al horno y una estera bajo la mesa larga ── */
      const fl = ctex(512, 512, (c, w) => {
        const R1 = rf('coc-suelo'),
          n = 12,
          q = w / n;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const v = Math.round(R1(-7, 7));
            c.fillStyle = (i + j) % 2 ? `rgb(${216 + v},${156 + v},${112 + v})` : `rgb(${200 + v},${136 + v},${94 + v})`;
            c.fillRect(i * q, j * q, q, q);
          }
        c.fillStyle = 'rgba(250,232,200,.5)';
        for (let i = 0; i <= n; i++) {
          c.fillRect(i * q - 1, 0, 2, w);
          c.fillRect(0, i * q - 1, w, 2);
        }
        blobs(c, w, w, 26, R1, ['rgba(236,180,130,A)', 'rgba(150,84,50,A)'], 30, 90, 0.26);
        const h = c.createRadialGradient(tx(160, w), ty(-120, w), 20, tx(160, w), ty(-120, w), 110);
        h.addColorStop(0, 'rgba(60,34,24,.5)');
        h.addColorStop(1, 'rgba(60,34,24,0)');
        c.fillStyle = h;
        c.fillRect(0, 0, w, w);
        const x0 = tx(TX - 136, w),
          x1 = tx(TX + 136, w),
          y0 = ty(TY + 44, w),
          y1 = ty(TY - 44, w);
        c.fillStyle = '#B9583F';
        c.fillRect(x0, y0, x1 - x0, y1 - y0);
        c.fillStyle = 'rgba(243,223,180,.85)';
        for (const u of [0.1, 0.9]) c.fillRect(x0, y0 + (y1 - y0) * u - 2, x1 - x0, 4);
        c.fillStyle = 'rgba(228,168,68,.7)';
        c.fillRect(x0, y0 + (y1 - y0) * 0.5 - 1, x1 - x0, 2);
      });
      texFloor(id, g, fl);
      /* ── luz: la vela que queda sobre la mesa y el rescoldo del horno; los bordes, en tierra tostada ── */
      const pool = lightPool(id, g, TX, TY - 14, 200, 84, '#FFD08A', 0.36);
      lightPool(id, g, 140, -90, 120, 90, '#FFB870', 0.2);
      layer(id, g, vignette('rgba(70,30,14,A)'), 3.5, { op: 0.55 });
      B.mesh(g);
      F.mesh(g, true);
      /* ── el único movimiento: la llama de la última vela ── */
      g.userData.tick = (t, still) => {
        const k = still ? 1 : 0.86 + 0.14 * Math.sin(t * 7.3) * Math.sin(t * 2.1);
        llama.material.opacity = 0.6 * k;
        pool.material.opacity = 0.34 * k;
      };
      return g;
    };
  })();

  /* ═════════════════ COLMENAR · la torre de colmenas apiladas y el enjambre que sale ═════════════════ */
  const COL = (() => {
    const id = 'col',
      TWX = 126,
      TWY = -220,
      YAW = Math.atan2(-TWX, -TWY),
      FX = Math.sin(YAW),
      FY = Math.cos(YAW);
    solid(id, TWX, TWY, 36);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        MIEL = '#E4A844';
      /* ── la torre: cinco colmenas de madera apiladas, cada una un poco torcida, con su piquera y su tejadillo ── */
      for (const [sx, sy] of [
        [-22, -22],
        [22, -22],
        [-22, 22],
        [22, 22],
      ])
        B.add(BOX(6, 8, 6), '#7A5232', P(TWX + sx, TWY + sy, 4));
      let wTop = 0;
      [0.06, -0.1, 0.08, -0.05, 0.1].forEach((dy, k) => {
        const w = 62 - k * 5,
          z0 = 8 + k * 24,
          yw = YAW + dy,
          fx = Math.sin(yw),
          fy = Math.cos(yw),
          x = TWX + [0, 2, -2, 1, -1][k],
          y = TWY;
        B.add(BOX(w, 22, w), k % 2 ? '#EFE2C4' : '#F8F1DE', P(x, y, z0 + 13), [0, yw, 0]);
        B.add(BOX(w + 3, 3, w + 3), k === 2 ? MIEL : '#D89A45', P(x, y, z0 + 1.5), [0, yw, 0]);
        B.add(BOX(16, 4, 1.6), '#4A3222', P(x + fx * (w / 2 + 0.4), y + fy * (w / 2 + 0.4), z0 + 8), [0, yw, 0]);
        B.add(BOX(22, 1.6, 7), '#B8783A', P(x + fx * (w / 2 + 3), y + fy * (w / 2 + 3), z0 + 4.4), [0, yw, 0]);
        wTop = w;
      });
      B.add(BOX(wTop + 12, 3, wTop + 12), '#8A5A34', P(TWX, TWY, 129.5), [0, YAW, 0]);
      B.add(CYL(23, 23, wTop + 14, 3, false, HALF), '#B8783A', P(TWX, TWY, 142.5), [0, YAW, HALF]);
      /* la miel que rebosa de la tercera colmena y gotea hasta el suelo */
      {
        const x = TWX + FX * 27 + FY * 14,
          y = TWY + FY * 27 - FX * 14;
        limb(B, [x, y, 58], [x, y, 30], 2.4, 1.2, MIEL, 5);
        B.add(SPH(2.6, 6, 5), MIEL, P(x, y, 27), [0, 0, 0], [1, 1.5, 1]);
      }
      const halo = glowSprite('#FFE08A', 130);
      halo.position.set(...P(TWX + FX * 30, TWY + FY * 30, 100));
      halo.material.opacity = 0.26;
      g.add(halo);
      /* ── suelo: cera clara con el dibujo grande del panal, algunas celdas llenas y un charco de miel al pie ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#F2DDA4';
        c.fillRect(0, 0, w, w);
        const R1 = rf('col-suelo'),
          k = w / (2 * R),
          r = 44;
        blobs(c, w, w, 38, R1, ['rgba(252,238,196,A)', 'rgba(226,186,110,A)'], 30, 90, 0.45);
        c.strokeStyle = 'rgba(204,146,56,.34)';
        c.lineWidth = 2.2;
        for (let i = -6; i <= 6; i++)
          for (let j = -7; j <= 7; j++) {
            const x = 1.5 * r * i,
              y = Math.sqrt(3) * r * (j + (i & 1) / 2);
            c.beginPath();
            for (let v = 0; v < 6; v++) c.lineTo(tx(x + Math.cos(v * 1.0472) * (r - 3), w), ty(y + Math.sin(v * 1.0472) * (r - 3), w));
            c.closePath();
            if (R1(0, 1) < 0.1) {
              c.fillStyle = 'rgba(236,176,66,.3)';
              c.fill();
            }
            c.stroke();
          }
        const px = tx(TWX + FX * 54, w),
          py = ty(TWY + FY * 54, w),
          h = c.createRadialGradient(px, py, 4, px, py, 34 * k);
        h.addColorStop(0, 'rgba(226,150,40,.85)');
        h.addColorStop(0.7, 'rgba(232,168,60,.6)');
        h.addColorStop(1, 'rgba(232,168,60,0)');
        c.fillStyle = h;
        c.fillRect(0, 0, w, w);
      });
      texFloor(id, g, fl);
      /* ── en altura, una sola cosa (y el único movimiento): el enjambre que sale de las piqueras y vuelve ── */
      const AB = new Bk();
      AB.add(SPH(2.6, 6, 5), '#F5CE55', [0, 0, 0], [0, 0, 0], [1, 1, 1.6]);
      for (const z of [-1.4, 1.2]) AB.add(CYL(2.66, 2.66, 1, 6), '#4A3222', [0, 0, z], [HALF, 0, 0]);
      for (const sx of [-1, 1]) AB.add(SPH(2.6, 5, 4), '#FFFFFF', [sx * 2.6, 2.1, -0.4], [0, 0, sx * 0.5], [1, 0.14, 0.6]);
      const NA = 24,
        I = new T3.InstancedMesh(AB.geo(), keep(id, new T3.MeshLambertMaterial({ vertexColors: true })), NA),
        o = new T3.Object3D(),
        RUTA = [
          [0.15, 122, 46, 124, 92],
          [-0.55, 92, 36, 100, 80],
          [0.7, 72, 30, 76, 68],
        ],
        A0 = Math.atan2(FY, FX);
      I.frustumCulled = false;
      g.add(I);
      const en = (k, u, i) => {
        const [da, A, W, z0, z1] = RUTA[k],
          a = u * 6.283,
          dx = Math.cos(A0 + da),
          dy = Math.sin(A0 + da),
          al = A * (1 - Math.cos(a)),
          sd = W * Math.sin(a);
        return [
          TWX + FX * 30 + dx * al - dy * sd,
          TWY + FY * 30 + dy * al + dx * sd,
          z0 + ((z1 - z0) * (1 - Math.cos(a))) / 2 + 5 * Math.sin(a * 3 + i),
        ];
      };
      const enjambre = (t) => {
        for (let i = 0; i < NA; i++) {
          const k = i % 3,
            u = (t * 0.05 * (1 + 0.25 * k) + i / NA + (i % 5) * 0.013) % 1,
            p = en(k, u, i),
            q = en(k, u + 0.01, i);
          o.position.set(...P(...p));
          o.rotation.set(0, Math.atan2(q[0] - p[0], q[1] - p[1]), 0);
          o.updateMatrix();
          I.setMatrixAt(i, o.matrix);
        }
        I.instanceMatrix.needsUpdate = true;
      };
      /* ── luz: sol de miel al pie de la torre; los bordes, en ámbar ── */
      lightPool(id, g, TWX - 60, TWY + 90, 200, 136, '#FFE08A', 0.34);
      layer(id, g, vignette('rgba(120,72,14,A)'), 3.5, { op: 0.5 });
      B.mesh(g);
      F.mesh(g, true);
      g.userData.tick = (t, still) => enjambre(still ? 0 : t);
      return g;
    };
  })();

  SALAS.add('rel', [], REL, { hideTiles: 1, noRug: 1 });
  SALAS.add('bib', [], BIB, { hideTiles: 1, noRug: 1 });
  SALAS.add('coc', [], COC, { hideTiles: 1, noRug: 1 });
  SALAS.add('col', ['flowers'], COL, { hideTiles: 1, noRug: 1, noLife: 1 });
})();
