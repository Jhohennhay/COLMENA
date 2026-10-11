/* ══════════ SALAS 8 · la colmena de abajo: Andén Vacío, Casa de los Ecos, Objetos Perdidos, Celda del Apicultor y El Reverso ══════════
   Lo que la colmena olvidó. Mismo criterio que salas3.js y la lección de la limpieza: una pieza protagonista,
   algo que sobresale del muro, suelo propio, luz escasa con UN punto cálido, UNA cosa en altura y UN movimiento.
   No cambia la lógica: vecinos, puertas, objetos y muebles siguen en su sitio. */
(() => {
  if (!window.SALAS || !SALAS.kit.texFloor || !window.PROPS3D || !window.LP3D || !window.THREE) return;
  const T3 = THREE,
    { Bk, SPH, CYL, CONE, BOX, TOR, glowSprite } = LP3D.kit,
    { WYAW, P, rf, limb } = PROPS3D.kit,
    { keep, ctex, solid, lightPool, layer, vignette, blobs, poolTex, tx, ty, texFloor, hangers, rope, ropeMesh, away } = SALAS.kit;
  const LT = [3, 4],
    BT = [4, 5],
    RT = [5, 0];
  /* una pieza que brilla con luz propia (ventanas encendidas, llamas) */
  const lit = (id, g, geo, col) => {
    const m = new T3.Mesh(geo, keep(id, new T3.MeshBasicMaterial({ color: col, fog: false })));
    g.add(m);
    return m;
  };

  /* ═════════════════ EL ANDÉN VACÍO · el último tren, parado en la vía, y el reloj de la estación ═════════════════ */
  const AND = (() => {
    const id = 'and',
      TY = -224,
      RELOJ = [152, -210];
    for (const x of [-116, -62, -8, 46, 92]) solid(id, x, TY, 34);
    solid(id, RELOJ[0], RELOJ[1], 12);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        HIERRO = '#2C3644',
        VAGON = '#8097AC',
        LOCO = '#5B6E84',
        LATON = '#C9A45A';
      /* ── la vía ── */
      B.add(BOX(362, 3, 3), '#8E9AA6', P(0, TY + 21, 4));
      /* ── el vagón: una sola ventanilla sigue encendida ── */
      const VX = -81;
      B.add(BOX(118, 8, 40), HIERRO, P(VX, TY, 13));
      B.add(BOX(118, 56, 44), VAGON, P(VX, TY, 45));
      B.add(BOX(119, 7, 45), '#C4CACB', P(VX, TY, 31));
      B.add(BOX(126, 5, 52), '#44505E', P(VX, TY, 75.5));
      B.add(BOX(112, 5, 34), '#4C5967', P(VX, TY, 80));
      for (const x of [-124, -95, -66, -37]) {
        if (x !== -95) B.add(BOX(19, 21, 2), '#1C2634', P(x, TY + 22, 54));
        B.add(BOX(23, 2.4, 3), '#C4CACB', P(x, TY + 22.4, 42.5));
      }
      for (const x of [-122, -100, -62, -40]) B.add(CYL(10, 10, 5, 12), HIERRO, P(x, TY + 21, 10), [Math.PI / 2, 0, 0]);
      const vent = lit(id, g, BOX(19, 21, 2), '#FFD98A');
      vent.position.set(...P(-95, TY + 22, 54));
      const brillo = glowSprite('#FFC870', 96);
      brillo.position.set(...P(-95, TY + 30, 54));
      g.add(brillo);
      /* ── la locomotora, mirando hacia la puerta: fría y con un hilo de vapor ── */
      B.add(BOX(8, 4, 6), HIERRO, P(-18, TY, 20));
      B.add(BOX(112, 8, 40), HIERRO, P(43, TY, 13));
      B.add(BOX(42, 74, 46), LOCO, P(7, TY, 54));
      B.add(BOX(50, 5, 54), '#2F3B49', P(7, TY, 93.5));
      B.add(BOX(20, 20, 2), '#1C2634', P(7, TY + 23, 70));
      B.add(BOX(43, 6, 47), LATON, P(7, TY, 40));
      B.add(CYL(23, 23, 64, 12), LOCO, P(60, TY, 42), [0, 0, Math.PI / 2]);
      for (const x of [38, 76]) B.add(CYL(24, 24, 4, 12), LATON, P(x, TY, 42), [0, 0, Math.PI / 2]);
      B.add(CYL(19, 23, 6, 12), '#2F3B49', P(95, TY, 42), [0, 0, -Math.PI / 2]);
      B.add(SPH(9, 10, 7), LATON, P(52, TY, 64));
      B.add(CYL(7, 8.5, 30, 8), '#2F3B49', P(76, TY, 78));
      B.add(CYL(11, 8, 7, 8), '#2F3B49', P(76, TY, 96));
      B.add(BOX(8, 11, 9), '#B9C6D2', P(98, TY + 8, 58));
      B.add(BOX(10, 10, 42), HIERRO, P(101, TY, 11), [0, 0, 0.3]);
      for (const [x, r] of [
        [0, 10],
        [30, 13],
        [58, 13],
        [84, 10],
      ])
        B.add(CYL(r, r, 5, 12), HIERRO, P(x, TY + 21, r), [Math.PI / 2, 0, 0]);
      limb(B, [30, TY + 24.5, 13], [58, TY + 24.5, 13], 1.6, 1.6, '#8E9AA6', 5);
      /* ── sobre el muro: el reloj de la estación, parado a las cuatro menos cuarto ── */
      const [rx, ry] = RELOJ,
        RZ = 104;
      B.add(CYL(7, 10, 8, 8), HIERRO, P(rx, ry, 4));
      limb(B, [rx, ry, 0], [rx, ry, RZ - 18], 3.2, 2.6, HIERRO, 6);
      B.add(CYL(21, 21, 8, 18), HIERRO, P(rx, ry, RZ), [Math.PI / 2, 0, 0]);
      B.add(CYL(17.5, 17.5, 9.4, 18), '#EEF2F4', P(rx, ry, RZ), [Math.PI / 2, 0, 0]);
      for (let k = 0; k < 12; k += 3) {
        const a = (k / 12) * 6.283;
        B.add(BOX(2, 2, 1), HIERRO, P(rx + Math.sin(a) * 14, ry + 5, RZ + Math.cos(a) * 14));
      }
      const ah = (3.75 / 12) * 6.283,
        am = 0.75 * 6.283;
      limb(B, [rx, ry + 5.2, RZ], [rx + Math.sin(ah) * 9, ry + 5.2, RZ + Math.cos(ah) * 9], 1.5, 1.5, HIERRO, 4);
      limb(B, [rx, ry + 5.2, RZ], [rx + Math.sin(am) * 14, ry + 5.2, RZ + Math.cos(am) * 14], 1, 1, HIERRO, 4);
      /* ── suelo: losas frías de andén, la franja amarilla gastada y el balasto de la vía con sus traviesas ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#8492A0';
        c.fillRect(0, 0, w, w);
        const R1 = rf('and-suelo');
        blobs(c, w, w, 40, R1, ['rgba(156,170,182,A)', 'rgba(104,118,132,A)'], 30, 90, 0.4);
        c.strokeStyle = 'rgba(48,60,72,.3)';
        c.lineWidth = 1.4;
        for (let y = -120; y < 300; y += 60) {
          c.beginPath();
          c.moveTo(0, ty(y, w));
          c.lineTo(w, ty(y, w));
          c.stroke();
          for (let x = -300 + ((y / 60) % 2 ? 45 : 0); x < 300; x += 90) {
            c.beginPath();
            c.moveTo(tx(x, w), ty(y, w));
            c.lineTo(tx(x, w), ty(y + 60, w));
            c.stroke();
          }
        }
        /* balasto y traviesas */
        c.fillStyle = '#3A444E';
        c.fillRect(0, ty(-178, w), w, w);
        c.fillStyle = '#9AA8B4';
        c.fillRect(0, ty(-166, w) - 2, w, ty(-178, w) - ty(-166, w) + 2);
        c.fillStyle = 'rgba(96,84,74,.9)';
        for (let x = -290; x < 300; x += 24) c.fillRect(tx(x, w), ty(-190, w), 7, ty(-262, w) - ty(-190, w));
        /* la franja amarilla, a trozos */
        for (let x = -290; x < 300; x += 34) {
          c.fillStyle = `rgba(226,190,84,${0.5 + R1(0, 0.4)})`;
          c.fillRect(tx(x, w), ty(-150, w), 20, 7);
        }
        c.fillStyle = 'rgba(40,50,62,.28)';
        c.fillRect(0, ty(-166, w), w, 3);
      });
      texFloor(id, g, fl);
      /* ── en altura, una sola cosa (y el único movimiento): el vapor que aún le queda a la locomotora ── */
      const humo = [];
      for (let k = 0; k < 5; k++) {
        const sm = new T3.SpriteMaterial({
          map: poolTex(),
          color: '#E4EEF8',
          transparent: true,
          opacity: 0,
          depthWrite: false,
          fog: false,
        });
        sm.userData.shared = true;
        const s = new T3.Sprite(sm);
        g.add(s);
        humo.push({ s, ph: k / 5 });
      }
      /* ── luz: la ventanilla calienta un trozo de andén; la farola, un charco frío; los bordes, en azul pizarra ── */
      const pool = lightPool(id, g, -92, -158, 120, 70, '#FFC060', 0.5);
      lightPool(id, g, 190, 110, 110, 86, '#BFE0FF', 0.2);
      layer(id, g, vignette('rgba(14,22,36,A)'), 3.5, { op: 0.6 });
      B.mesh(g);
      g.userData.tick = (t, still) => {
        const k = still ? 1 : 0.9 + 0.1 * Math.sin(t * 3.1) * Math.sin(t * 0.9);
        vent.material.color.set('#FFD98A').multiplyScalar(k);
        brillo.material.opacity = 0.5 * k;
        pool.material.opacity = 0.5 * k;
        for (const q of humo) {
          const u = ((still ? 0.3 : t * 0.05) + q.ph) % 1;
          q.s.position.set(...P(76 - u * 90 + Math.sin(u * 5 + q.ph * 9) * 6, TY + u * 26, 104 + u * 34));
          q.s.scale.setScalar(20 + u * 44);
          q.s.material.opacity = 0.42 * Math.sin(u * Math.PI);
        }
      };
      return g;
    };
  })();

  /* ═════════════════ LA CASA DE LOS ECOS · el biombo de espejos y las caracolas que repiten lo que oyes ═════════════════ */
  const ECO = (() => {
    const id = 'eco',
      XS = [-114, -72, -30, 12, 54],
      HS = [92, 104, 114, 104, 92],
      PY = (i) => -247 + Math.abs(i - 2) * 7;
    XS.forEach((x, i) => solid(id, x, PY(i), 23));
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        V = new Bk(),
        ORO = '#9C8A5E';
      /* ── el biombo: cinco espejos altos en arco contra la pared del fondo; el del centro sigue tapado con su sábana ── */
      XS.forEach((px, i) => {
        const th = (2 - i) * 0.2,
          py = PY(i),
          h = HS[i],
          at = (lx, lz, ld) => P(px + lx * Math.cos(th) + ld * Math.sin(th), py - lx * Math.sin(th) + ld * Math.cos(th), lz);
        B.add(BOX(40, h, 4), ORO, at(0, h / 2, 0), [0, th, 0]);
        B.add(CYL(20, 20, 4, 18), ORO, at(0, h, 0), [Math.PI / 2, 0, -th]);
        for (const sx of [-17, 17]) B.add(BOX(5, 7, 7), '#6E6040', at(sx, 3.5, 1), [0, th, 0]);
        if (i === 2) {
          /* la sábana */
          B.add(BOX(45, h - 8, 7), '#E6E0F0', at(0, h / 2 + 6, 2), [0, th, 0]);
          B.add(SPH(23, 12, 8), '#E6E0F0', at(0, h + 1, 2), [0, th, 0], [1, 0.96, 0.24]);
          for (const [sx, w] of [
            [-13, 3],
            [-2, 2.4],
            [10, 3.4],
          ])
            B.add(BOX(w, h - 4, 1.2), '#CBC3DE', at(sx, h / 2 + 5, 5.4), [0, th, 0]);
          return;
        }
        const col = i % 2 ? '#B6B0D8' : '#A9A4CE';
        V.add(BOX(33, h - 6, 0.8), col, at(0, h / 2 + 2, 2.4), [0, th, 0]);
        V.add(CYL(16.5, 16.5, 0.8, 18), col, at(0, h, 2.4), [Math.PI / 2, 0, -th]);
        /* el brillo del azogue, en dos trazos */
        V.add(BOX(5, 46, 0.5), '#DEDAF2', at(-6, h * 0.62, 3), [0, th, 0.5]);
        V.add(BOX(2.4, 30, 0.5), '#DEDAF2', at(3, h * 0.5, 3), [0, th, 0.5]);
        if (i === 3) {
          /* en uno de los espejos hay alguien de papel que no está en el cuarto */
          V.add(SPH(7, 10, 8), '#EFECFA', at(2, 62, 3.2), [0, th, 0], [1, 1, 0.08]);
          V.add(CONE(11, 40, 8), '#EFECFA', at(2, 34, 3.2), [0, th, 0], [1, 1, 0.08]);
        }
      });
      g.add(new T3.Mesh(V.geo(), keep(id, new T3.MeshBasicMaterial({ vertexColors: true, fog: false }))));
      const frio = glowSprite('#CFC4FF', 230);
      frio.position.set(...P(-30, -226, 70));
      frio.material.opacity = 0.2;
      g.add(frio);
      /* ── suelo: tarima morada y la alfombra larga del pasillo, gastada, que lleva hasta los espejos ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#54466A';
        c.fillRect(0, 0, w, w);
        const R1 = rf('eco-suelo');
        for (let x = -300; x < 300; x += 40) {
          c.fillStyle = `rgba(${R1(0, 1) > 0.5 ? '110,94,136' : '50,40,66'},${R1(0.1, 0.3)})`;
          c.fillRect(tx(x, w), 0, tx(x + 40, w) - tx(x, w), w);
          c.fillStyle = 'rgba(30,22,44,.5)';
          c.fillRect(tx(x, w), 0, 1.6, w);
          for (let k = 0; k < 3; k++) c.fillRect(tx(x, w), R1(0, w), tx(x + 40, w) - tx(x, w), 1.4);
        }
        const x0 = tx(-50, w),
          x1 = tx(50, w),
          y0 = ty(-196, w),
          y1 = ty(262, w);
        c.fillStyle = '#8A6484';
        c.fillRect(x0, y0, x1 - x0, y1 - y0);
        c.strokeStyle = '#C9B4D4';
        c.lineWidth = 2.4;
        c.strokeRect(x0 + 7, y0 + 7, x1 - x0 - 14, y1 - y0 - 14);
        c.fillStyle = 'rgba(214,196,226,.75)';
        for (let y = -170; y < 250; y += 46) {
          const cx = tx(0, w),
            cy = ty(y, w);
          c.beginPath();
          c.moveTo(cx, cy - 11);
          c.lineTo(cx + 13, cy);
          c.lineTo(cx, cy + 11);
          c.lineTo(cx - 13, cy);
          c.fill();
        }
        c.strokeStyle = '#C9B4D4';
        c.lineWidth = 1.6;
        for (let x = x0 + 3; x < x1; x += 7) {
          c.beginPath();
          c.moveTo(x, y0);
          c.lineTo(x, y0 - 9);
          c.stroke();
        }
        blobs(c, w, w, 26, R1, ['rgba(60,46,80,A)', 'rgba(120,104,146,A)'], 24, 70, 0.3);
      });
      texFloor(id, g, fl);
      /* ── en altura, una sola cosa (y el único movimiento): las caracolas colgadas de un hilo, que se mecen ── */
      const pts = [
        [-206, -64, 142],
        [-150, -168, 150],
        [-52, -150, 168],
        [70, -170, 160],
        [176, -150, 150],
        [226, -30, 138],
      ];
      for (const q of pts) limb(B, q, [q[0], q[1], 430], 0.5, 0.5, '#9A8AB0', 3);
      const SG = new Bk();
      SG.add(SPH(9, 9, 7), '#FFFFFF', [0, -10, 0], [0, 0, 0.3], [1, 0.82, 0.9]);
      SG.add(SPH(6, 8, 6), '#FFFFFF', [4, -19, 0], [0, 0, 0.3], [1, 0.8, 0.9]);
      SG.add(CONE(4.4, 15, 7), '#FFFFFF', [9, -29, 0], [Math.PI, 0, 0.5]);
      const caracolas = hangers(id, g, pts, SG.geo(), ['#F3E6DC', '#E9CFD2', '#DDD4F0'], 0);
      /* ── al pie del candelabro, tres velas: lo único cálido del cuarto ── */
      const LL = new Bk(),
        llamas = [];
      for (const [x, y, h] of [
        [168, 108, 20],
        [180, 116, 13],
        [192, 106, 16],
      ]) {
        B.add(CYL(4, 4.4, h, 8), '#E6E0D0', P(x, y, h / 2));
        LL.add(CONE(2.6, 8, 6), '#FFD36A', P(x, y, h + 5));
        const s = glowSprite('#FFC870', 46);
        s.position.set(...P(x, y, h + 6));
        g.add(s);
        llamas.push(s);
      }
      lit(id, g, LL.geo(), '#FFD36A');
      /* ── luz: los espejos dan una claridad fría; el candelabro, el único rincón cálido; los bordes, en violeta ── */
      lightPool(id, g, -30, -176, 170, 84, '#CFC4FF', 0.3);
      const pool = lightPool(id, g, 176, 96, 96, 76, '#FFC878', 0.32);
      layer(id, g, vignette('rgba(22,12,38,A)'), 3.5, { op: 0.7 });
      B.mesh(g);
      g.userData.tick = (t, still) => {
        caracolas(still ? 0 : t, 0.16, 0.8);
        const k = still ? 1 : 0.9 + 0.1 * Math.sin(t * 4.1) * Math.sin(t * 1.3);
        pool.material.opacity = 0.34 * k;
        for (const s of llamas) s.material.opacity = 0.5 * k;
      };
      return g;
    };
  })();

  /* ═════════════════ OBJETOS PERDIDOS · el archivo: estanterías con etiquetas, la escalera y la lámpara del mostrador ═════════════════ */
  const PER = (() => {
    const id = 'per',
      ESC = wallPt(RT, 0.56, 0, 54);
    for (let u = 0.14; u < 0.86; u += 0.14) {
      const a = wallPt(RT, u, 0, 18),
        b = wallPt(LT, 1 - u + 0.02, 0, 18);
      solid(id, a[0], a[1], 22);
      solid(id, b[0], b[1], 22);
    }
    solid(id, ESC[0], ESC[1], 13);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        MAD = '#7E6A56',
        MADO = '#5E4E40',
        CAJ = ['#8E8A7C', '#A39A84', '#7C8690', '#B9AE94', '#6F7A80'],
        tags = { rt: [], lt: [] };
      /* una estantería de archivo contra una pared: cajas iguales con su etiqueta, algún hueco y alguna cosa sin dueño */
      const estante = (e, u0, u1, niv, n, R1, raros, tg) => {
        const yw = WYAW(e),
          L = 300 * (u1 - u0),
          H = niv * 36 + 6,
          m = wallPt(e, (u0 + u1) / 2, 0, 18);
        B.add(BOX(L + 4, H, 1.6), MADO, P(...wallPt(e, (u0 + u1) / 2, H / 2, 7)), [0, yw, 0]);
        for (let k = 0; k <= niv; k++) B.add(BOX(L + 8, 3.4, 24), MAD, P(m[0], m[1], 4 + k * 36), [0, yw, 0]);
        for (let k = 0; k <= 3; k++) B.add(BOX(4, H, 24), MAD, P(...wallPt(e, u0 + ((u1 - u0) * k) / 3, H / 2, 18)), [0, yw, 0]);
        for (let lv = 0; lv < niv; lv++)
          for (let i = 0; i < n; i++) {
            const u = u0 + ((u1 - u0) * (i + 0.5)) / n,
              z0 = 5.7 + lv * 36,
              q = wallPt(e, u, 0, 18),
              raro = raros[lv + ',' + i],
              r = R1(0, 1);
            if (raro === 'pelota') B.add(SPH(10, 10, 8), '#A8605A', P(q[0], q[1], z0 + 10));
            else if (raro === 'sombrero') {
              B.add(CYL(13, 13, 1.6, 12), '#5A4A6E', P(q[0], q[1], z0 + 0.8));
              B.add(CYL(7, 8, 11, 10), '#5A4A6E', P(q[0], q[1], z0 + 6.5));
            } else if (raro === 'rollos') {
              for (let k = 0; k < 3; k++) {
                const o = wallPt(e, u + (k === 2 ? 0 : (k - 0.5) * 0.026), 0, 18);
                B.add(CYL(3.6, 3.6, 20, 7), k % 2 ? '#E9E0C8' : '#CFC6AC', P(o[0], o[1], z0 + 3.6 + (k === 2 ? 6.2 : 0)), [
                  Math.PI / 2,
                  0,
                  -yw,
                ]);
              }
            } else if (raro !== 'hueco' && r > 0.13) {
              const w = L / n - R1(5, 9),
                h = R1(19, 27);
              B.add(BOX(w, h, 17), CAJ[Math.floor(R1(0, 5))], P(q[0], q[1], z0 + h / 2), [0, yw, 0]);
              B.add(BOX(w * 0.5, 6, 0.8), '#F1E9D4', P(...wallPt(e, u, z0 + h * 0.56, 27)), [0, yw, 0]);
            }
            if (lv > 0 && r < 0.62) tg.push(wallPt(e, u + R1(-0.012, 0.012), z0 - 3.2, 30.5));
          }
        return H;
      };
      /* ── la grande, a la derecha: sube por encima del muro, con dos maletas arriba ── */
      const HR = estante(
        RT,
        0.1,
        0.86,
        4,
        6,
        rf('per-rt'),
        { '3,1': 'pelota', '2,4': 'sombrero', '1,2': 'hueco', '3,4': 'rollos', '0,5': 'hueco' },
        tags.rt,
      );
      {
        const yw = WYAW(RT),
          a = wallPt(RT, 0.66, 0, 18);
        B.add(BOX(44, 16, 20), '#7A5A4A', P(a[0], a[1], HR + 8), [0, yw, 0]);
        B.add(BOX(34, 12, 18), '#5E6E78', P(a[0], a[1], HR + 22), [0, yw + 0.12, 0]);
        B.add(BOX(45, 2.4, 21), '#C9B48A', P(a[0], a[1], HR + 8), [0, yw, 0]);
      }
      /* ── la baja, a la izquierda ── */
      estante(LT, 0.16, 0.9, 3, 6, rf('per-lt'), { '2,2': 'rollos', '1,4': 'hueco', '2,5': 'hueco' }, tags.lt);
      /* ── la escalera de archivo, apoyada en la grande ── */
      for (const du of [-0.04, 0.04]) limb(B, wallPt(RT, 0.56 + du, 0, 60), wallPt(RT, 0.56 + du, 134, 32), 1.9, 1.9, '#9A7A52', 5);
      for (let k = 1; k <= 7; k++) {
        const t = k / 8;
        limb(B, wallPt(RT, 0.52, 134 * t, 60 - 28 * t), wallPt(RT, 0.6, 134 * t, 60 - 28 * t), 1.3, 1.3, '#9A7A52', 4);
      }
      /* ── la lámpara del mostrador: la única luz cálida ── */
      const LX = -8,
        LY = -84;
      B.add(CYL(5, 6.4, 2.4, 10), '#8A7440', P(LX, LY, 47.2));
      limb(B, [LX, LY, 48], [LX, LY, 64], 1.1, 1.1, '#8A7440', 5);
      B.add(CYL(4.4, 10.5, 9, 10), '#4E7A6A', P(LX, LY, 66));
      const bombilla = lit(id, g, CYL(8.6, 8.6, 0.8, 10), '#FFE6A8');
      bombilla.position.set(...P(LX, LY, 61.6));
      const brillo = glowSprite('#FFC870', 110);
      brillo.position.set(...P(LX, LY + 4, 58));
      g.add(brillo);
      /* ── suelo: tarima apagada, con el camino gastado que va de la puerta al mostrador ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#8F8474';
        c.fillRect(0, 0, w, w);
        const R1 = rf('per-suelo');
        for (let y = -300; y < 300; y += 30) {
          c.fillStyle = `rgba(${R1(0, 1) > 0.5 ? '176,166,148' : '96,88,80'},${R1(0.08, 0.26)})`;
          c.fillRect(0, ty(y + 30, w), w, ty(y, w) - ty(y + 30, w));
          c.fillStyle = 'rgba(52,44,40,.45)';
          c.fillRect(0, ty(y, w), w, 1.5);
          for (let k = 0; k < 4; k++) c.fillRect(R1(0, w), ty(y + 30, w), 1.4, ty(y, w) - ty(y + 30, w));
        }
        c.strokeStyle = 'rgba(214,206,190,.1)';
        c.lineCap = 'round';
        c.lineWidth = 62;
        c.beginPath();
        c.moveTo(tx(-190, w), ty(150, w));
        c.quadraticCurveTo(tx(-40, w), ty(120, w), tx(40, w), ty(20, w));
        c.moveTo(tx(0, w), ty(-230, w));
        c.quadraticCurveTo(tx(-70, w), ty(-60, w), tx(40, w), ty(20, w));
        c.stroke();
        blobs(c, w, w, 30, R1, ['rgba(70,66,74,A)', 'rgba(170,164,150,A)'], 24, 70, 0.28);
      });
      texFloor(id, g, fl);
      /* ── en altura, una sola cosa (y el único movimiento): las etiquetas que cuelgan de los estantes ── */
      const TG = new Bk();
      TG.add(BOX(0.5, 5, 0.5), '#FFFFFF', [0, -2.5, 0]);
      TG.add(BOX(6.4, 9.6, 0.7), '#FFFFFF', [0, -9.6, 0]);
      const TC = ['#F1E9D4', '#E2D2A8', '#F1E9D4', '#D9C7C0'],
        mueve = [hangers(id, g, tags.rt, TG.geo(), TC, WYAW(RT)), hangers(id, g, tags.lt, TG.geo(), TC, WYAW(LT))];
      /* ── luz: la lámpara calienta el mostrador; lo demás, penumbra de archivo ── */
      const pool = lightPool(id, g, 10, -50, 150, 100, '#FFC060', 0.34);
      layer(id, g, vignette('rgba(34,30,46,A)'), 3.5, { op: 0.66 });
      B.mesh(g);
      g.userData.tick = (t, still) => {
        for (const f of mueve) f(still ? 0 : t, 0.3, 1.1);
        const k = still ? 1 : 0.94 + 0.06 * Math.sin(t * 2.3) * Math.sin(t * 0.7);
        pool.material.opacity = 0.34 * k;
        brillo.material.opacity = 0.5 * k;
      };
      return g;
    };
  })();

  /* ═════════════════ LA CELDA DEL APICULTOR · el sillón de orejas donde duerme, su lámpara y las colmenas apiladas ═════════════════ */
  const API = (() => {
    const id = 'api',
      AX = 30,
      AY = -68,
      LAMP = [-22, -86],
      T1 = [-118, -214],
      T2 = [-58, -228],
      MOV = [34, -50, 150];
    solid(id, AX, AY, 34);
    solid(id, LAMP[0], LAMP[1], 10);
    solid(id, T1[0], T1[1], 30);
    solid(id, T2[0], T2[1], 27);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        TELA = '#B5824C',
        TELAO = '#97683C';
      /* ── el sillón de orejas, justo detrás del viejo: gastado, con su manta doblada en el respaldo ── */
      for (const [dx, dy] of [
        [-25, -18],
        [25, -18],
        [-25, 18],
        [25, 18],
      ])
        B.add(CYL(3, 2.4, 6, 6), '#5E4028', P(AX + dx, AY + dy, 3));
      B.add(BOX(60, 16, 42), TELAO, P(AX, AY, 14));
      B.add(BOX(48, 7, 34), TELA, P(AX, AY + 3, 25));
      B.add(BOX(60, 70, 12), TELA, P(AX, AY - 20, 49), [-0.08, 0, 0]);
      B.add(CYL(30, 30, 12, 14, false, 0, Math.PI), TELA, P(AX, AY - 22.6, 84), [Math.PI / 2 - 0.08, 0, 0]);
      for (const sx of [-1, 1]) {
        B.add(BOX(11, 16, 40), TELAO, P(AX + sx * 30, AY + 1, 30));
        B.add(CYL(8, 8, 11, 10), TELA, P(AX + sx * 30, AY + 21, 34), [0, 0, Math.PI / 2]);
        B.add(BOX(8, 34, 20), TELAO, P(AX + sx * 30, AY - 10, 64), [0, sx * 0.3, 0]);
      }
      B.add(BOX(34, 26, 3), '#E9DCC6', P(AX - 8, AY - 13.4, 76), [-0.08, 0, 0.06]);
      B.add(BOX(34, 5, 3.4), '#C9694B', P(AX - 8, AY - 13, 70), [-0.08, 0, 0.06]);
      /* ── la lámpara de pie: la única luz encendida ── */
      B.add(CYL(9, 11, 3, 10), '#6E4A2A', P(LAMP[0], LAMP[1], 1.5));
      limb(B, [LAMP[0], LAMP[1], 2], [LAMP[0], LAMP[1], 100], 1.6, 1.6, '#6E4A2A', 6);
      const pantalla = lit(id, g, CYL(9, 17, 20, 12, true), '#FFD890');
      pantalla.material.side = T3.DoubleSide;
      pantalla.position.set(...P(LAMP[0], LAMP[1], 108));
      const brillo = glowSprite('#FFB850', 190);
      brillo.position.set(...P(LAMP[0], LAMP[1] + 6, 104));
      g.add(brillo);
      /* ── las colmenas de toda una vida, apiladas en el rincón: la torre alta asoma sobre el muro ── */
      const torre = (x, y, cols, yaw, tejado) => {
        cols.forEach((col, k) => {
          B.add(BOX(46, 24, 46), col, P(x, y, 12.5 + k * 25), [0, yaw, 0]);
          B.add(BOX(47.4, 2.4, 47.4), '#7A6248', P(x, y, 25 * (k + 1) - 0.4), [0, yaw, 0]);
          B.add(BOX(14, 3, 1.4), '#5E4A38', P(x + Math.sin(yaw) * 23.4, y + Math.cos(yaw) * 23.4, 15 + k * 25), [0, yaw, 0]);
        });
        const h = cols.length * 25;
        B.add(BOX(16, 3.4, 1.6), '#3A2A20', P(x + Math.sin(yaw) * 23.5, y + Math.cos(yaw) * 23.5, 4), [0, yaw, 0]);
        if (tejado) {
          B.add(BOX(54, 4, 54), '#7A6248', P(x, y, h + 2), [0, yaw, 0]);
          B.add(CONE(36, 16, 4), '#8A7460', P(x, y, h + 12), [0, yaw + Math.PI / 4, 0]);
        }
        return h;
      };
      torre(T1[0], T1[1], ['#D9CBA8', '#B9C0A4', '#E3D6B4', '#C9A96E', '#D9CBA8'], 0.34, 1);
      const h2 = torre(T2[0], T2[1], ['#C9A96E', '#E3D6B4', '#B9C0A4'], 0.08, 0);
      B.add(BOX(50, 4, 50), '#7A6248', P(T2[0], T2[1], h2 + 2), [0, 0.08, 0]);
      for (const [dx, dy, col] of [
        [-10, 4, '#D9963A'],
        [6, -6, '#E4B050'],
        [12, 10, '#C9822E'],
      ]) {
        B.add(CYL(6, 6, 12, 8), col, P(T2[0] + dx, T2[1] + dy, h2 + 10));
        B.add(CYL(6.4, 6.4, 3, 8), '#E9DCC6', P(T2[0] + dx, T2[1] + dy, h2 + 17.5));
      }
      /* ── suelo: tarima de miel oscura y la alfombra redonda, raída, bajo el sillón ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#A07E4E';
        c.fillRect(0, 0, w, w);
        const R1 = rf('api-suelo');
        for (let y = -300; y < 300; y += 34) {
          c.fillStyle = `rgba(${R1(0, 1) > 0.5 ? '196,160,104' : '110,80,48'},${R1(0.08, 0.26)})`;
          c.fillRect(0, ty(y + 34, w), w, ty(y, w) - ty(y + 34, w));
          c.fillStyle = 'rgba(70,46,26,.45)';
          c.fillRect(0, ty(y, w), w, 1.5);
          for (let k = 0; k < 3; k++) c.fillRect(R1(0, w), ty(y + 34, w), 1.4, ty(y, w) - ty(y + 34, w));
        }
        const cx = tx(34, w),
          cy = ty(-22, w),
          k = w / 600;
        [
          [124, '#7E4A38'],
          [116, '#D2B078'],
          [96, '#9A5E44'],
          [72, '#C9A468'],
          [46, '#8A5440'],
          [20, '#D2B078'],
        ].forEach(([r, col]) => {
          c.fillStyle = col;
          c.beginPath();
          c.arc(cx, cy, r * k, 0, 6.29);
          c.fill();
        });
        c.strokeStyle = 'rgba(60,36,24,.22)';
        c.lineWidth = 1;
        for (let r = 8; r < 124; r += 6) {
          c.beginPath();
          c.arc(cx, cy, r * k, 0, 6.29);
          c.stroke();
        }
        blobs(c, w, w, 30, R1, ['rgba(80,54,34,A)', 'rgba(214,180,124,A)'], 24, 70, 0.26);
      });
      texFloor(id, g, fl);
      /* ── en altura, una sola cosa (y el único movimiento): el móvil de abejas de papel, que gira despacio sobre su sueño ── */
      limb(B, MOV, [MOV[0], MOV[1], 430], 0.5, 0.5, '#8A6A4A', 3);
      B.add(TOR(17, 0.9, 5, 16), '#8A6A4A', P(...MOV), [Math.PI / 2, 0, 0]);
      const AB = new Bk();
      AB.add(BOX(0.5, 12, 0.5), '#FFFFFF', [0, -6, 0]);
      AB.add(SPH(4.4, 8, 6), '#FFFFFF', [0, -15, 0], [0, 0, 0], [1.4, 0.9, 0.9]);
      for (const sz of [-1, 1]) AB.add(SPH(4, 6, 4), '#FFFFFF', [0, -11.6, sz * 4.4], [sz * 0.5, 0, 0], [0.8, 0.12, 1.1]);
      const pts = [0, 1, 2, 3, 4].map(() => [MOV[0], MOV[1], MOV[2]]),
        abejas = hangers(id, g, pts, AB.geo(), ['#F2C24E', '#E4A844', '#F6D98A', '#E4A844', '#F2C24E'], 0);
      /* ── luz: la lámpara abriga el sillón; el resto del cuarto se queda en penumbra parda ── */
      const pool = lightPool(id, g, 14, -44, 190, 132, '#FFB050', 0.42);
      layer(id, g, vignette('rgba(40,24,22,A)'), 3.5, { op: 0.74 });
      B.mesh(g);
      g.userData.tick = (t, still) => {
        const a = still ? 0.4 : t * 0.22;
        pts.forEach((q, i) => {
          q[0] = MOV[0] + Math.cos(a + i * 1.2566) * 17;
          q[1] = MOV[1] + Math.sin(a + i * 1.2566) * 17;
        });
        abejas(still ? 0 : t, 0.14, 0.9);
        const k = still ? 1 : 0.95 + 0.05 * Math.sin(t * 0.9);
        pool.material.opacity = 0.42 * k;
        brillo.material.opacity = 0.5 * k;
      };
      return g;
    };
  })();

  /* ═════════════════ EL REVERSO · el cielo en el suelo, el sol negro y el arco del espejo por donde entra la luz de casa ═════════════════ */
  const REV = (() => {
    const id = 'rev',
      MX = -20,
      MY = -218,
      SOL = [-84, 96];
    for (const sx of [-1, 1]) solid(id, MX + sx * 44, MY, 12);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        PIE = '#8C98AE',
        PIEO = '#6C7890';
      /* ── el arco de piedra fría que guarda el espejo, con sus enredaderas colgando ── */
      for (const sx of [-1, 1]) {
        const x = MX + sx * 44;
        B.add(BOX(19, 7, 19), PIEO, P(x, MY, 3.5));
        B.add(BOX(13, 82, 13), PIE, P(x, MY, 48));
        B.add(BOX(19, 6, 19), PIEO, P(x, MY, 90));
        limb(B, [x + sx * 9, MY + 4, 90], [x + sx * 12, MY + 6, sx < 0 ? 46 : 64], 0.8, 0.5, '#3E6A5E', 4);
        for (let z = 82; z > (sx < 0 ? 48 : 66); z -= 11)
          B.add(CONE(4, 11, 4), z % 2 ? '#7AB0A0' : '#5A8A7A', P(x + sx * (13 + (z % 3)), MY + 7, z), [Math.PI, 0, sx * 0.5], [1, 1, 0.4]);
      }
      B.add(TOR(44, 6.5, 6, 14, Math.PI), PIE, P(MX, MY, 93), [0, 0, 0], [1, 0.7, 1]);
      B.add(BOX(12, 15, 15), PIEO, P(MX, MY, 124));
      const calor = glowSprite('#FFD08A', 190);
      calor.position.set(...P(MX, MY + 6, 74));
      calor.material.opacity = 0.26;
      g.add(calor);
      /* ── suelo: aquí abajo está el cielo. Nubes de papel boca abajo y el sol negro con su corona pálida ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#66768A';
        c.fillRect(0, 0, w, w);
        const R1 = rf('rev-suelo'),
          k = w / 600;
        blobs(c, w, w, 34, R1, ['rgba(126,142,164,A)', 'rgba(70,78,104,A)'], 30, 100, 0.45);
        /* nubes: la panza plana, arriba */
        for (const [x, y, s] of [
          [-190, -40, 1],
          [150, -70, 0.8],
          [110, 170, 1.1],
          [-30, -120, 0.6],
          [-200, 190, 0.7],
          [210, 70, 0.6],
        ]) {
          const cx = tx(x, w),
            cy = ty(y, w);
          c.fillStyle = 'rgba(176,190,208,.5)';
          c.beginPath();
          for (const [dx, r] of [
            [-34, 17],
            [-10, 25],
            [18, 21],
            [40, 14],
          ])
            c.arc(cx + dx * s * k, cy, r * s * k, Math.PI, 2 * Math.PI);
          c.fill();
        }
        /* el sol negro */
        const sx = tx(SOL[0], w),
          sy = ty(SOL[1], w);
        const h = c.createRadialGradient(sx, sy, 50 * k, sx, sy, 150 * k);
        h.addColorStop(0, 'rgba(222,230,246,.5)');
        h.addColorStop(1, 'rgba(222,230,246,0)');
        c.fillStyle = h;
        c.fillRect(0, 0, w, w);
        c.fillStyle = 'rgba(226,234,248,.8)';
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * 6.283,
            r1 = (i % 2 ? 96 : 116) * k;
          c.beginPath();
          c.moveTo(sx + Math.cos(a - 0.07) * 64 * k, sy + Math.sin(a - 0.07) * 64 * k);
          c.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1);
          c.lineTo(sx + Math.cos(a + 0.07) * 64 * k, sy + Math.sin(a + 0.07) * 64 * k);
          c.fill();
        }
        c.beginPath();
        c.arc(sx, sy, 60 * k, 0, 6.29);
        c.fill();
        c.fillStyle = '#16141F';
        c.beginPath();
        c.arc(sx, sy, 55 * k, 0, 6.29);
        c.fill();
      });
      texFloor(id, g, fl);
      /* ── en altura, una sola cosa (y el único movimiento): las macetas del revés, con las hojas colgando hacia abajo ── */
      const pts = [
        [-238, 16, 150],
        [-190, -92, 170],
        [-128, -196, 150],
        [-150, -24, 190],
        [216, -76, 164],
        [248, 34, 142],
      ];
      for (const q of pts) limb(B, q, [q[0], q[1], 430], 0.5, 0.5, '#5A4A6E', 3);
      const MG = new Bk(),
        HG = new Bk();
      MG.add(CYL(8, 11.5, 13, 8), '#FFFFFF', [0, -6.5, 0]);
      MG.add(CYL(12.6, 12.6, 3, 8), '#FFFFFF', [0, -13, 0]);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * 6.283;
        HG.add(
          CONE(4.6, 30 + (k % 3) * 7, 4),
          '#FFFFFF',
          [Math.cos(a) * 6, -27 - (k % 3) * 3, Math.sin(a) * 6],
          [Math.PI + Math.sin(a) * 0.42, 0, -Math.cos(a) * 0.42],
          [1, 1, 0.5],
        );
      }
      const mueve = [
        hangers(id, g, pts, MG.geo(), ['#6A8AA0', '#5A4A6E', '#7A6A9A'], 0),
        hangers(id, g, pts, HG.geo(), ['#7AB0A0', '#9AD0C0', '#C8B6FF', '#B8E0F0'], 0),
      ];
      /* ── luz: por el espejo se cuela la luz cálida de casa; todo lo demás, frío y sin sombras ── */
      const pool = lightPool(id, g, MX, -150, 120, 84, '#FFC878', 0.4);
      layer(id, g, vignette('rgba(16,14,36,A)'), 3.5, { op: 0.7 });
      B.mesh(g);
      g.userData.tick = (t, still) => {
        for (const f of mueve) f(still ? 0 : t, 0.12, 0.7);
        const k = still ? 1 : 0.9 + 0.1 * Math.sin(t * 0.8);
        pool.material.opacity = 0.4 * k;
        calor.material.opacity = 0.26 * k;
      };
      return g;
    };
  })();

  SALAS.add('and', [], AND, { hideTiles: 1, noRug: 1 });
  SALAS.add('rev', [], REV, { hideTiles: 1, noRug: 1 });
  SALAS.add('api', [], API, { hideTiles: 1, noRug: 1 });
  SALAS.add('per', [], PER, { hideTiles: 1, noRug: 1 });
  SALAS.add('eco', [], ECO, { hideTiles: 1, noRug: 1 });
})();
