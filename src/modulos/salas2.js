/* ══════════ SALAS 2 · el resto del primer barrio: Verano, Otoño e Invierno ══════════
   Mismo criterio que salas.js (docs/guia-salas.md): pieza protagonista, arquitectura que sale del
   hexágono, suelo propio, luz con intención, algo en altura y un movimiento pequeño.
   No cambia la lógica: vecinos, puertas, objetos y páginas siguen donde estaban. */
(() => {
  if (!window.SALAS || !window.PROPS3D || !window.LP3D || !window.THREE) return;
  const T3 = THREE,
    { Bk, SPH, CYL, CONE, BOX, TOR, OCT, CIRC, shd, mix, glowSprite } = LP3D.kit,
    { WP, WYAW, P, rf, limb } = PROPS3D.kit,
    { keep, ctex, solid, rHex, flatHex, layer, vignette, lightPool, blobs } = SALAS.kit;
  const LT = [3, 4],
    BT = [4, 5],
    RT = [5, 0];
  /* del cuarto (x, y) al lienzo de una textura de suelo de lado w */
  const tx = (x, w) => ((x / R + 1) / 2) * w,
    ty = (y, w) => (1 - (y / R + 1) / 2) * w;
  /* suelo liso con una textura propia, debajo de las alfombras */
  function texFloor(id, g, tex, h = 2.3) {
    const m = new T3.Mesh(flatHex(3, h), keep(id, new T3.MeshLambertMaterial({ map: tex })));
    g.add(m);
    return m;
  }
  /* puntos de una cuerda que cuelga entre a y b (coordenadas del cuarto) */
  function rope(a, b, sag, n) {
    const o = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      o.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t - sag * 4 * t * (1 - t)]);
    }
    return o;
  }
  function ropeMesh(B, pts, r, col) {
    for (let k = 1; k < pts.length; k++) limb(B, pts[k - 1], pts[k], r, r, col, 4);
  }
  /* muchas piezas iguales colgando de unos puntos, que se mecen (banderines, pliegos, carámbanos) */
  function hangers(id, g, pts, geo, cols, yaw) {
    const m = keep(id, new T3.MeshLambertMaterial({ color: '#FFFFFF', side: T3.DoubleSide })),
      I = new T3.InstancedMesh(geo, m, pts.length),
      c = new T3.Color(),
      o = new T3.Object3D();
    pts.forEach((p, i) => I.setColorAt(i, c.set(cols[i % cols.length])));
    I.frustumCulled = false;
    g.add(I);
    return (t, amp, sp) => {
      pts.forEach((p, i) => {
        o.position.set(...P(...p));
        o.rotation.set(Math.sin(t * sp + i * 1.7) * amp, yaw, Math.sin(t * sp * 0.7 + i) * amp * 0.4);
        o.updateMatrix();
        I.setMatrixAt(i, o.matrix);
      });
      I.instanceMatrix.needsUpdate = true;
    };
  }
  /* lo que solo se ve de cerca: en el modo explorar y en el cuarto donde está el chico (ver salas.js) */
  const CERCA = [],
    cerca = (id) => typeof EXPLORA !== 'undefined' && EXPLORA.on && cur === id;
  if (window.R3DX)
    R3DX.push(() => {
      for (const c of CERCA) {
        const v = cerca(c.id);
        if (c.near) c.near.visible = v;
        if (c.far) c.far.visible = !v;
      }
    });
  const away = (id, x, y, d = 80) => !CELLS[id].doors.some((q) => Math.hypot(x - q.mid[0], y - q.mid[1]) < d);
  /* piezas comunes para los siguientes módulos de salas (salas3.js…) */
  Object.assign(SALAS.kit, { tx, ty, texFloor, rope, ropeMesh, hangers, away });

  /* ═════════════════ VERANO · la terraza: la gran sombrilla, las palmeras y el sol de papel ═════════════════ */
  const VER = ISLAS
    ? null
    : (() => {
        const id = 'ver',
          R0 = rf('sala-ver'),
          PX = 40,
          PY = -50;
        const palms = [wallPt(RT, 0.52, 0, 40)];
        for (const p of palms) solid(id, p[0], p[1], 15);
        return () => {
          const g = new T3.Group(),
            B = new Bk(),
            F = new Bk();
          /* ── la sombrilla gigante, clavada al borde de la piscina: sobresale del muro ── */
          const UX = PX + 30,
            UY = PY - 96,
            UH = 172;
          limb(B, [UX, UY, 0], [UX - 6, UY, UH], 4.5, 3.5, '#F6EFD9', 8);
          for (let k = 0; k < 12; k++) {
            F.add(CYL(3, 112, 36, 1, true, (k * Math.PI) / 6, Math.PI / 6), k % 2 ? '#F4EBD2' : '#E8674F', P(UX - 6, UY, UH - 16));
            const a = (k * Math.PI) / 6;
            F.add(SPH(4, 6, 5), '#F7C948', P(UX - 6 + Math.sin(a) * 112, UY + Math.cos(a) * 112, UH - 36));
          }
          B.add(SPH(6, 8, 6), '#F7C948', P(UX - 6, UY, UH + 5));
          {
            /* de cerca: varillas y tirantes bajo la tela, vivos en las costuras, faldón festoneado,
               remate, rótula para inclinarla, manivela y el pie con su peso */
            const HX = UX - 6,
              HY = UY,
              px = (z) => UX - (6 * z) / UH,
              ZR = UH - 62;
            for (let k = 0; k < 12; k++) {
              const a = (k * Math.PI) / 6,
                s = Math.sin(a),
                c = Math.cos(a),
                tip = [HX + s * 110, HY + c * 110, UH - 35.4];
              limb(B, [HX, HY, UH - 1.5], tip, 1.1, 0.8, '#D9C39A', 5);
              limb(B, [px(ZR), HY, ZR + 4], [HX + s * 46, HY + c * 46, UH - 1.5 - (35.4 - 1.5) * 0.42 - 1], 0.7, 0.7, '#CDB68A', 4);
              limb(F, [HX, HY, UH + 2.9], [HX + s * 112.6, HY + c * 112.6, UH - 33.2], 0.65, 0.65, '#FFF7E4', 3);
              F.add(CYL(112, 112, 9, 1, true, a, Math.PI / 6), k % 2 ? '#F4EBD2' : '#E8674F', P(HX, HY, UH - 38.5));
              for (let j = 0; j < 2; j++) {
                const b = a + ((j + 0.5) * Math.PI) / 12;
                F.add(
                  CIRC(7.2, 6, Math.PI, Math.PI),
                  k % 2 ? '#E8674F' : '#F4EBD2',
                  P(HX + Math.sin(b) * 111.6, HY + Math.cos(b) * 111.6, UH - 43),
                  [0, b, 0],
                );
              }
            }
            B.add(CYL(4.4, 4.4, 9, 8), '#C9A05C', P(px(ZR), HY, ZR));
            B.add(TOR(4.6, 1, 4, 10), '#E9C46A', P(px(ZR), HY, ZR + 4.5), [Math.PI / 2, 0, 0]);
            B.add(CONE(2.6, 12, 6), '#F7C948', P(HX, HY, UH + 15));
            B.add(TOR(4.2, 1, 4, 10), '#C9A05C', P(HX, HY, UH + 1), [Math.PI / 2, 0, 0]);
            /* la rótula y la manivela */
            B.add(SPH(5.4, 8, 6), '#C9A05C', P(px(118), HY, 118));
            B.add(CYL(1.6, 1.6, 12, 6), '#9A7A44', P(px(118) + 5, HY, 118), [0, 0, Math.PI / 2]);
            limb(B, [px(96), HY, 96], [px(96) + 12, HY + 3, 92], 1.1, 1.1, '#9A7A44', 5);
            B.add(CYL(1.8, 1.8, 6, 6), '#7A5632', P(px(96) + 12, HY + 3, 95));
            /* el pie: cuatro patas y el disco de peso */
            for (let k = 0; k < 4; k++) {
              const a = k * 1.5708 + 0.4;
              B.add(BOX(20, 3, 4), '#B08A52', P(UX + Math.cos(a) * 9, UY + Math.sin(a) * 9, 1.5), [0, -a, 0]);
              B.add(SPH(2.2, 6, 4), '#7A5632', P(UX + Math.cos(a) * 18, UY + Math.sin(a) * 18, 1.6));
            }
            B.add(CYL(8, 9.5, 6, 10), '#C9A05C', P(UX, UY, 5));
            B.add(TOR(8.2, 1, 4, 10), '#E9C46A', P(UX, UY, 8), [Math.PI / 2, 0, 0]);
          }
          /* ── palmeras altas contra las paredes del fondo ── */
          palms.forEach((p, i) => {
            const h = 150 + i * 18,
              lean = i === 2 ? -22 : 18;
            let a = [p[0], p[1], 0];
            for (let k = 1; k <= 7; k++) {
              const t = k / 7,
                b = [p[0] + lean * t * t, p[1] + 6 * t, h * t];
              limb(B, a, b, 9 - t * 3.5, 8.4 - t * 3.5, k % 2 ? '#A9794A' : '#96683C', 7);
              a = b;
            }
            for (let k = 0; k < 9; k++) {
              const an = (k / 9) * 6.28 + i,
                L = R0(70, 96),
                tip = [a[0] + Math.cos(an) * L, a[1] + Math.sin(an) * L, a[2] - R0(18, 46)],
                mid = [a[0] + Math.cos(an) * L * 0.5, a[1] + Math.sin(an) * L * 0.5, a[2] + 14];
              limb(F, a, mid, 5, 9, k % 2 ? '#5E9A5A' : '#6FAE62', 4);
              limb(F, mid, tip, 9, 1.5, k % 2 ? '#4E8A52' : '#5E9A5A', 4);
            }
            for (let k = 0; k < 3; k++) B.add(SPH(6, 7, 6), '#7A5632', P(a[0] + R0(-7, 7), a[1] + R0(-7, 7), a[2] - 8));
          });
          /* ── suelo: gres claro calentado por el sol, mojado alrededor de la piscina y con huellas ── */
          const fl = ctex(512, 512, (c, w) => {
            c.fillStyle = '#F1DDB2';
            c.fillRect(0, 0, w, w);
            const R1 = rf('ver-suelo');
            blobs(c, w, w, 60, R1, ['rgba(250,236,200,A)', 'rgba(228,198,150,A)'], 20, 70, 0.55);
            c.strokeStyle = 'rgba(190,150,96,.38)';
            c.lineWidth = 1.6;
            for (let k = -8; k <= 8; k++) {
              c.beginPath();
              c.moveTo(0, w / 2 + k * 46 + 23);
              c.lineTo(w, w / 2 + k * 46 + 23);
              c.stroke();
              for (let j = -8; j <= 8; j++) {
                c.beginPath();
                c.moveTo(w / 2 + j * 62 + (k % 2 ? 31 : 0), w / 2 + k * 46 - 23);
                c.lineTo(w / 2 + j * 62 + (k % 2 ? 31 : 0), w / 2 + k * 46 + 23);
                c.stroke();
              }
            }
            const wet = c.createRadialGradient(tx(PX, w), ty(PY, w), 78, tx(PX, w), ty(PY, w), 150);
            wet.addColorStop(0, 'rgba(150,120,84,.5)');
            wet.addColorStop(1, 'rgba(150,120,84,0)');
            c.fillStyle = wet;
            c.fillRect(0, 0, w, w);
            c.fillStyle = 'rgba(140,108,74,.42)';
            for (let k = 0; k < 9; k++) {
              const t = k / 8,
                x = PX - 80 - t * 70,
                y = PY + 70 + t * 30 + (k % 2 ? 7 : -7);
              c.beginPath();
              c.ellipse(tx(x, w), ty(y, w), 5.5, 3.2, 0.5, 0, 6.28);
              c.fill();
            }
          });
          texFloor(id, g, fl);
          /* ── en altura, una sola cosa: el sol de papel que gira ── */
          const sun = new T3.Group(),
            S = new Bk();
          S.add(CYL(34, 34, 5, 20), '#F7C948', [0, 0, 0], [Math.PI / 2, 0, 0]);
          S.add(CYL(24, 24, 6.4, 20), '#FBD968', [0, 0, 0], [Math.PI / 2, 0, 0]);
          for (let k = 0; k < 12; k++) {
            const a = (k / 12) * 6.28,
              L = k % 2 ? 22 : 32;
            S.add(
              CONE(8, L, 4),
              k % 2 ? '#F7B23B' : '#F58A3C',
              [Math.cos(a) * (38 + L / 2), Math.sin(a) * (38 + L / 2), 0],
              [0, 0, a - Math.PI / 2],
              [1, 1, 0.35],
            );
          }
          S.mesh(sun, true);
          const sunPiv = new T3.Group();
          sunPiv.position.set(...P(-98, -226, 150));
          sunPiv.rotation.x = -0.45;
          sunPiv.scale.setScalar(0.82);
          sunPiv.add(sun);
          g.add(sunPiv);
          const sunGlow = glowSprite('#FFE08A', 230);
          sunGlow.position.set(...P(-98, -226, 150));
          g.add(sunGlow);
          limb(B, [-98, -230, 184], [-98, -230, 420], 0.8, 0.8, '#C9A56A', 4);
          /* ── luz: el sol cae sobre la piscina; los bordes, en ocre caliente ── */
          const pool = lightPool(id, g, PX - 10, PY + 10, 190, 150, '#FFF3B8', 0.34);
          lightPool(id, g, -120, 20, 90, 70, '#FFD9A0', 0.16);
          layer(id, g, vignette('rgba(176,92,40,A)'), 3.5, { op: 0.42 });
          const glints = [];
          for (let k = 0; k < 6; k++) {
            const s = glowSprite('#FFFFFF', 16);
            g.add(s);
            glints.push({ s, a: R0(0, 6.28), r: R0(10, 62), ph: R0(0, 6) });
          }
          B.mesh(g);
          F.mesh(g, true);
          g.userData.tick = (t, still) => {
            const tt = still ? 0 : t;
            sun.rotation.z = tt * 0.12;
            sunGlow.material.opacity = 0.42 + (still ? 0 : 0.06 * Math.sin(t * 1.1));
            pool.material.opacity = 0.3 + (still ? 0 : 0.05 * Math.sin(t * 0.8));
            for (const q of glints) {
              q.s.position.set(...P(PX + Math.cos(q.a) * q.r, PY + Math.sin(q.a) * q.r * 0.8, 12));
              q.s.material.opacity = still ? 0.25 : Math.max(0, Math.sin(t * 2.2 + q.ph)) * 0.85;
            }
          };
          return g;
        };
      })();

  /* ═════════════════ OTOÑO · el taller: la bobina de papel, los pliegos a secar y el suelo de tablas ═════════════════ */
  const OTO = (() => {
    const id = 'oto',
      R0 = rf('sala-oto'),
      QA = wallPt(RT, 0.36, 0, 16),
      QB = wallPt(RT, 0.8, 0, 16),
      CAB = wallPt(RT, 0.88, 0, 30),
      STK = [[214, 96, 20]];
    solid(id, QA[0], QA[1], 12);
    solid(id, QB[0], QB[1], 12);
    for (const s of STK) solid(id, ...s);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        WOOD = '#8A5A34',
        yaw = WYAW(RT);
      /* ── la bobina gigante sobre el muro: dos postes, la viga y el papel que baja a la prensa ── */
      const HB = 150,
        mid = [(QA[0] + QB[0]) / 2, (QA[1] + QB[1]) / 2];
      for (const q of [QA, QB]) {
        limb(B, [q[0], q[1], 0], [q[0], q[1], HB + 26], 7, 6, WOOD, 6);
        limb(B, [q[0], q[1], HB - 60], [(q[0] + mid[0]) / 2, (q[1] + mid[1]) / 2, HB + 22], 3.5, 3.5, shd(WOOD, 0.85), 5);
        B.add(BOX(20, 6, 20), shd(WOOD, 0.8), P(q[0], q[1], 3));
      }
      limb(B, [QA[0], QA[1], HB + 24], [QB[0], QB[1], HB + 24], 5, 5, WOOD, 6);
      const reel = new T3.Group(),
        RB = new Bk(),
        RL = Math.hypot(QB[0] - QA[0], QB[1] - QA[1]) - 34;
      RB.add(CYL(36, 36, RL, 18), '#F6EEDC', [0, 0, 0], [0, 0, Math.PI / 2]);
      RB.add(CYL(40, 40, 4, 18), '#C98A42', [RL / 2, 0, 0], [0, 0, Math.PI / 2]);
      RB.add(CYL(40, 40, 4, 18), '#C98A42', [-RL / 2, 0, 0], [0, 0, Math.PI / 2]);
      for (let k = 0; k < 6; k++)
        RB.add(BOX(3, 70, 5), '#8A5A34', [RL / 2 + 2.4, 0, 0], [(k * Math.PI) / 6, 0, 0]).add(
          BOX(3, 70, 5),
          '#8A5A34',
          [-RL / 2 - 2.4, 0, 0],
          [(k * Math.PI) / 6, 0, 0],
        );
      RB.mesh(reel);
      const reelPiv = new T3.Group();
      reelPiv.position.set(...P(mid[0], mid[1], HB - 14));
      reelPiv.rotation.y = Math.atan2(-(QB[1] - QA[1]), QB[0] - QA[0]);
      reelPiv.add(reel);
      g.add(reelPiv);
      {
        /* el papel: de la bobina a los rodillos de la prensa (135, -45) */
        const a0 = [mid[0] - 22, mid[1] + 30, HB - 30],
          b0 = [150, -52, 74],
          hw = 30,
          dx = (QB[0] - QA[0]) / Math.hypot(QB[0] - QA[0], QB[1] - QA[1]),
          dy = (QB[1] - QA[1]) / Math.hypot(QB[0] - QA[0], QB[1] - QA[1]);
        const v = [
          [a0[0] - dx * hw, a0[1] - dy * hw, a0[2]],
          [a0[0] + dx * hw, a0[1] + dy * hw, a0[2]],
          [b0[0] + dx * hw, b0[1] + dy * hw, b0[2]],
          [b0[0] - dx * hw, b0[1] - dy * hw, b0[2]],
        ].map((q) => P(...q));
        const pg = new T3.BufferGeometry();
        pg.setAttribute('position', new T3.Float32BufferAttribute([...v[0], ...v[1], ...v[2], ...v[0], ...v[2], ...v[3]], 3));
        pg.computeVertexNormals();
        pg.userData.shared = true;
        g.add(new T3.Mesh(pg, keep(id, new T3.MeshLambertMaterial({ color: '#F6EEDC', side: T3.DoubleSide }))));
      }
      /* ── el mueble de tipos con sus cajones, tinteros y un rodillo ── */
      {
        const [x, y] = CAB;
        B.add(BOX(92, 50, 26), '#9A6A3A', P(x, y, 25), [0, yaw, 0]);
        B.add(BOX(96, 4, 30), '#B8823E', P(x, y, 52), [0, yaw, 0]);
        const ux = Math.cos(-yaw),
          uy = Math.sin(-yaw),
          nx = -Math.sin(yaw),
          ny = -Math.cos(yaw);
        for (let r = 0; r < 4; r++)
          for (let c = 0; c < 4; c++) {
            const o = (c - 1.5) * 22;
            B.add(BOX(19, 9, 2), r % 2 ? '#C9965A' : '#B8823E', P(x + ux * o - nx * 13.5, y + uy * o - ny * 13.5, 8 + r * 11), [0, yaw, 0]);
            B.add(SPH(1.6, 5, 4), '#5E4634', P(x + ux * o - nx * 15, y + uy * o - ny * 15, 8 + r * 11));
          }
        ['#2E2A3A', '#B8362E', '#2F6F8A', '#E0A030'].forEach((c, k) => {
          const o = (k - 1.5) * 15;
          B.add(CYL(4.5, 5.5, 10, 8), c, P(x + ux * o, y + uy * o, 59));
          B.add(CYL(2.2, 2.2, 4, 6), '#3A2E2A', P(x + ux * o, y + uy * o, 66));
        });
      }
      /* ── resmas de papel apiladas y montones de hojas barridas ── */
      const PAPER = ['#F4AFA6', '#8EC3CF', '#F5CE55', '#FBF4E3', '#E9C99A'];
      STK.forEach(([x, y, r], i) => {
        let z = 0;
        for (let k = 0; k < 7 - i * 2; k++) {
          const h = R0(5, 8);
          B.add(BOX(r * 1.7, h, r * 1.3), PAPER[(k + i) % 5], P(x + R0(-2, 2), y + R0(-2, 2), z + h / 2), [0, R0(-0.12, 0.12) + 0.5, 0]);
          z += h + 0.4;
        }
      });
      const LEAF = ['#C9563A', '#E07A3E', '#F0A848', '#B8563A', '#D9902E'];
      for (const [cx, cy, n, rad] of [
        [-232, -20, 34, 34],
        [120, 212, 30, 30],
      ])
        for (let k = 0; k < n; k++) {
          const a = R0(0, 6.28),
            d = rad * Math.sqrt(R0(0, 1)),
            x = cx + Math.cos(a) * d,
            y = cy + Math.sin(a) * d * 0.7;
          if (Math.hypot(x, y) > rHex(Math.atan2(y, x), 14)) continue;
          F.add(OCT(R0(3.5, 6)), LEAF[k % 5], P(x, y, 3 + (1 - d / rad) * 9 * R0(0.4, 1)), [R0(0, 3), R0(0, 3), R0(0, 3)], [1, 0.22, 0.8]);
        }
      /* ── suelo de tablas, con manchas de tinta junto a la prensa ── */
      const fl = ctex(512, 512, (c, w) => {
        const R1 = rf('oto-suelo'),
          TON = ['#C7955A', '#BD8A50', '#CFA068', '#B98347', '#C99A60'];
        for (let i = 0; i < 16; i++) {
          c.fillStyle = TON[Math.floor(R1(0, 5))];
          c.fillRect(i * 32, 0, 32, w);
          c.strokeStyle = 'rgba(120,76,36,.25)';
          c.lineWidth = 1;
          for (let k = 0; k < 5; k++) {
            const x = i * 32 + R1(4, 28);
            c.beginPath();
            c.moveTo(x, 0);
            c.bezierCurveTo(x + R1(-5, 5), w * 0.3, x + R1(-5, 5), w * 0.7, x + R1(-3, 3), w);
            c.stroke();
          }
          c.fillStyle = 'rgba(92,56,26,.6)';
          c.fillRect(i * 32, 0, 1.6, w);
          for (let y = R1(0, 120); y < w; y += R1(110, 190)) {
            c.fillRect(i * 32, y, 32, 1.6);
            c.beginPath();
            c.arc(i * 32 + 6, y + 6, 1.3, 0, 6.28);
            c.arc(i * 32 + 26, y + 6, 1.3, 0, 6.28);
            c.fill();
          }
        }
        blobs(c, w, w, 22, R1, ['rgba(255,232,190,A)', 'rgba(110,66,30,A)'], 30, 90, 0.16);
        for (const [x, y, r, col] of [
          [96, -8, 15, 'rgba(34,30,44,.78)'],
          [118, 22, 7, 'rgba(34,30,44,.7)'],
          [70, 40, 5, 'rgba(34,30,44,.6)'],
          [150, 44, 9, 'rgba(160,44,36,.6)'],
          [40, 96, 6, 'rgba(34,30,44,.5)'],
        ]) {
          c.fillStyle = col;
          c.beginPath();
          for (let k = 0; k <= 14; k++) {
            const a = (k / 14) * 6.28,
              rr = r * R1(0.75, 1.2) * (w / (2 * R));
            c.lineTo(tx(x, w) + Math.cos(a) * rr, ty(y, w) + Math.sin(a) * rr * 0.8);
          }
          c.fill();
        }
      });
      texFloor(id, g, fl);
      /* ── en altura: una cuerda con pliegos recién impresos y la lámpara de la prensa ── */
      const top = [mid[0], mid[1], HB + 22],
        L2 = rope(wallPt(BT, 0.14, 132, 2), top, 26, 11);
      ropeMesh(B, L2, 0.7, '#6E4A2E');
      const sheetG = new Bk()
        .add(BOX(21, 28, 0.7), '#FFFFFF', [0, -15, 0])
        .add(BOX(15, 2, 0.9), '#5E5048', [0, -8, 0])
        .add(BOX(15, 1.2, 0.9), '#8A7A70', [0, -13, 0])
        .add(BOX(11, 1.2, 0.9), '#8A7A70', [0, -17, 0])
        .add(BOX(4, 3, 2), '#8A5A34', [0, -1, 0])
        .geo();
      const sheets = hangers(id, g, L2.slice(1, -1), sheetG, ['#FBF4E3', '#F8E6C8', '#FBF4E3', '#F6D9CC', '#EFE6C2'], 0.5);
      limb(B, [118, -40, 196], [118, -40, 330], 0.8, 0.8, '#3A2E2A', 4);
      F.add(CYL(5, 30, 20, 8, true), '#3E5C54', P(118, -40, 186));
      B.add(SPH(6, 8, 6), '#FFE9B0', P(118, -40, 178));
      const lamp = glowSprite('#FFD890', 190);
      lamp.position.set(...P(118, -40, 172));
      g.add(lamp);
      /* ── luz: ámbar sobre la prensa; los rincones, en castaño ── */
      const pool = lightPool(id, g, 100, -10, 190, 150, '#FFCF88', 0.34);
      lightPool(id, g, -70, 70, 110, 80, '#FFE6B8', 0.12);
      layer(id, g, vignette('rgba(58,26,8,A)'), 3.5, { op: 0.62 });
      B.mesh(g);
      F.mesh(g, true);
      g.userData.tick = (t, still) => {
        /* en la prueba «islas» el taller está parado hasta que pones en marcha la prensa */
        const on = !window.ISLAS_AWAKE || ISLAS_AWAKE('oto'),
          tt = still || !on ? 0 : t;
        reel.rotation.x = -tt * 0.25;
        sheets(tt, 0.2, 1.1);
        const k = (still ? 1 : 0.92 + 0.08 * Math.sin(t * 7.3) * Math.sin(t * 2.1)) * (on ? 1 : 0.12);
        lamp.material.opacity = 0.5 * k;
        pool.material.opacity = 0.32 * k;
      };
      return g;
    };
  })();

  /* ═════════════════ INVIERNO · la brasa: la bufanda infinita, la chimenea de hielo y la nieve ═════════════════ */
  const INV = (() => {
    const id = 'inv',
      R0 = rf('sala-inv'),
      BALL = [128, -192],
      FX = -205,
      FY = -150;
    solid(id, BALL[0], BALL[1], 26);
    /* agujas de hielo a los lados de la chimenea y por la pared del fondo */
    const ICE = [];
    for (const [e, u0, u1, n] of [
      [LT, 0.06, 0.3, 3],
      [LT, 0.8, 0.98, 2],
      [BT, 0.02, 0.2, 2],
      [RT, 0.04, 0.2, 2],
      [RT, 0.8, 0.96, 2],
    ])
      for (let k = 0; k < n; k++) {
        const u = u0 + ((u1 - u0) * k) / Math.max(1, n - 1),
          d = R0(6, 20),
          r = R0(9, 16),
          h = R0(70, 190) * (e === RT && u > 0.5 ? 0.55 : 1);
        ICE.push({ e, u, d, r, h });
        if (d + r > 26) {
          const p = wallPt(e, u, 0, d);
          solid(id, p[0], p[1], r * 0.7);
        }
      }
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        K = new Bk(),
        iceB = new Bk();
      for (const c of ICE) {
        const p = wallPt(c.e, c.u, 0, c.d);
        iceB.add(CONE(c.r, c.h, 5), '#FFFFFF', P(p[0], p[1], c.h / 2), [R0(-0.06, 0.06), R0(0, 3), R0(-0.06, 0.06)]);
        iceB.add(CONE(c.r * 0.6, c.h * 0.5, 4), '#FFFFFF', P(p[0] + R0(-10, 10), p[1] + R0(-6, 10), c.h * 0.25), [
          R0(-0.2, 0.2),
          R0(0, 3),
          R0(-0.2, 0.2),
        ]);
      }
      const iceM = keep(
        id,
        new T3.MeshLambertMaterial({
          color: '#BFE4F2',
          transparent: true,
          opacity: 0.86,
          flatShading: true,
          emissive: '#3A6A8A',
          emissiveIntensity: 0.35,
        }),
      );
      g.add(new T3.Mesh(iceB.geo(), iceM));
      /* ── la bufanda infinita: sale del sillón, da la vuelta al cuarto, sube al muro y acaba en el ovillo ── */
      const PATH = [
        [-92, 62, 20],
        [-70, 84, 4],
        [-20, 120, 3.6],
        [50, 100, 3.6],
        [118, 122, 3.6],
        [160, 70, 3.6],
        [130, 10, 3.6],
        [150, -60, 3.6],
        [118, -128, 3.6],
        [40, -150, 3.6],
        [-50, -128, 3.6],
        [-96, -170, 3.6],
        [-150, -200, 30],
        [...wallPt(LT, 0.72, 104, -4)],
        [...wallPt(BT, 0.12, 110, -4)],
        [...wallPt(BT, 0.36, 96, -6)],
        [...wallPt(BT, 0.64, 110, -4)],
        [...wallPt(BT, 0.86, 102, -6)],
        [...wallPt(BT, 0.95, 96, 10)],
        [BALL[0] + 20, BALL[1] - 22, 62],
        [BALL[0] + 4, BALL[1] - 6, 44],
      ];
      const curve = new T3.CatmullRomCurve3(
          PATH.map((q) => new T3.Vector3(...P(...q))),
          false,
          'catmullrom',
          0.5,
        ),
        NSEG = 200,
        STR = ['#C9694B', '#FBF4E3', '#7FA7A0', '#FBF4E3', '#E0A030', '#FBF4E3'],
        o = new T3.Object3D(),
        up = new T3.Vector3(0, 1, 0),
        _m = new T3.Matrix4(),
        _q = new T3.Quaternion(),
        _y = new T3.Vector3(0, 1, 0);
      /* de cerca se ve el punto: cada tramo lleva una fila de uves de lana en relieve (tres columnas) */
      for (let k = 0; k < NSEG; k++) {
        const a = curve.getPointAt(k / NSEG),
          b = curve.getPointAt((k + 1) / NSEG),
          L = a.distanceTo(b),
          col = STR[Math.floor((k * 170) / NSEG / 3) % 6];
        o.position.copy(a).add(b).multiplyScalar(0.5);
        o.up.copy(up);
        o.lookAt(b.x + (b.x - a.x), b.y + (b.y - a.y), b.z + (b.z - a.z));
        o.updateMatrix();
        const M0 = o.matrix.clone();
        o.matrix.scale(new T3.Vector3(1, 1, L + 0.8));
        B.addM(BOX(21, 1.8, 1), shd(col, 0.86), o.matrix);
        for (let c = -1; c <= 1; c++)
          for (const sd of [-1, 1]) {
            _m.compose(
              new T3.Vector3(c * 6.6 + sd * 1.6, 0.85, 0),
              _q.setFromAxisAngle(_y, sd * 0.5),
              new T3.Vector3(1.9, 0.75, (L + 0.8) * 0.62),
            );
            K.addM(OCT(1), mix(col, '#FFFFFF', 0.08), M0.clone().multiply(_m));
          }
      }
      for (let k = 0; k < 7; k++) B.add(BOX(1.6, 1.4, 12), k % 2 ? '#C9694B' : '#FBF4E3', P(-98 + (k - 3) * 2.8, 58, 14), [0.5, 0, 0]);
      /* el ovillo, con las agujas clavadas */
      B.add(SPH(26, 14, 10), '#C9694B', P(BALL[0], BALL[1], 26));
      /* de cerca: muchas vueltas de hebra en tres tonos y una lazada suelta por el suelo */
      for (let k = 0; k < 9; k++)
        B.add(TOR(26.4, 1.5, 5, 22), k % 2 ? '#B8563A' : '#DB7E60', P(BALL[0], BALL[1], 26), [R0(0, 3.14), R0(0, 3.14), R0(0, 3.14)]);
      for (let k = 0; k < 12; k++)
        K.add(TOR(27.2, 0.8, 3, 26), ['#D06E50', '#E28A6A', '#B85A3E'][k % 3], P(BALL[0], BALL[1], 26), [
          R0(0, 3.14),
          R0(0, 3.14),
          R0(0, 3.14),
        ]);
      {
        const lz = [];
        for (let k = 0; k <= 14; k++) {
          const t = k / 14,
            an = 2.2 + t * 4.4;
          lz.push([BALL[0] - 18 - t * 22 + Math.cos(an) * 12, BALL[1] + 26 + Math.sin(an) * 9 + t * 8, k ? 2.2 : 8]);
        }
        for (let k = 1; k < lz.length; k++) limb(B, lz[k - 1], lz[k], 1.1, 1.1, '#C9694B', 5);
        B.add(SPH(1.6, 6, 4), '#B8563A', P(...lz[lz.length - 1]));
      }
      limb(B, [BALL[0] - 30, BALL[1] + 26, 6], [BALL[0] + 20, BALL[1] - 16, 72], 1.6, 1.2, '#E9D9B8', 6);
      limb(B, [BALL[0] + 26, BALL[1] + 30, 6], [BALL[0] - 16, BALL[1] - 14, 74], 1.6, 1.2, '#E9D9B8', 6);
      B.add(SPH(3.4, 6, 5), '#E0A030', P(BALL[0] + 20, BALL[1] - 16, 73));
      B.add(SPH(3.4, 6, 5), '#E0A030', P(BALL[0] - 16, BALL[1] - 14, 75));
      /* ── nieve amontonada en lo alto del muro y contra las paredes ── */
      for (const e of [LT, BT, RT])
        for (let u = 0.04; u < 0.98; u += 0.075) {
          const p = wallPt(e, u + R0(-0.01, 0.01), 0, -8),
            s = R0(14, 22);
          B.add(SPH(s, 7, 5), '#F6FAFC', P(p[0], p[1], 100), [0, R0(0, 3), 0], [1.25, 0.42, 1]);
        }
      for (let k = 0; k < 8; k++) {
        const th = R0(0, 6.28),
          rr = rHex(th, 0) * R0(0.86, 0.95),
          x = Math.cos(th) * rr,
          y = Math.sin(th) * rr;
        if (!away(id, x, y, 86) || Math.hypot(x - FX, y - FY) < 90) continue;
        const s = R0(14, 26);
        B.add(SPH(s, 8, 5), k % 3 ? '#F6FAFC' : '#E4EEF4', P(x, y, 1), [0, R0(0, 3), 0], [1.3, 0.5, 1]);
      }
      /* ── suelo: nieve pisada, deshecha alrededor de la brasa y del sillón ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#EDF3F6';
        c.fillRect(0, 0, w, w);
        const R1 = rf('inv-suelo');
        blobs(c, w, w, 70, R1, ['rgba(255,255,255,A)', 'rgba(196,214,228,A)', 'rgba(214,226,238,A)'], 18, 64, 0.55);
        for (const [x, y, r0, r1, col] of [
          [FX + 40, FY + 60, 30, 130, '214,176,128'],
          [-116, 30, 40, 120, '216,190,150'],
        ]) {
          const gr = c.createRadialGradient(tx(x, w), ty(y, w), r0 * (w / (2 * R)), tx(x, w), ty(y, w), r1 * (w / (2 * R)));
          gr.addColorStop(0, `rgba(${col},.95)`);
          gr.addColorStop(0.7, `rgba(${col},.5)`);
          gr.addColorStop(1, `rgba(${col},0)`);
          c.fillStyle = gr;
          c.fillRect(0, 0, w, w);
        }
        c.fillStyle = 'rgba(150,176,198,.6)';
        const TR = [
          [0, -240],
          [10, -170],
          [-10, -110],
          [-50, -50],
          [-70, 20],
          [-30, 90],
          [40, 130],
          [70, 150],
          [-60, 150],
          [-150, 150],
          [-210, 130],
        ];
        for (let k = 1; k < TR.length; k++) {
          const [x0, y0] = TR[k - 1],
            [x1, y1] = TR[k],
            n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 22),
            a = Math.atan2(-(y1 - y0), x1 - x0);
          for (let j = 0; j < n; j++) {
            const t = j / n,
              sd = j % 2 ? 6 : -6,
              x = x0 + (x1 - x0) * t + Math.sin(a) * sd,
              y = y0 + (y1 - y0) * t + Math.cos(a) * sd;
            c.beginPath();
            c.ellipse(tx(x, w), ty(y, w), 5.2, 2.8, a, 0, 6.28);
            c.fill();
          }
        }
      });
      texFloor(id, g, fl);
      /* ── en altura: carámbanos en el borde del muro y copos de papel colgados ── */
      const icPts = [];
      for (const e of [LT, BT, RT]) for (let u = 0.05; u < 0.97; u += 0.058) icPts.push(wallPt(e, u, 92, 5));
      const icG = new Bk()
        .add(CONE(3.4, 22, 4), '#FFFFFF', [0, -11, 0], [Math.PI, 0, 0])
        .add(CONE(2, 12, 4), '#FFFFFF', [5, -6, 0], [Math.PI, 0, 0])
        .geo();
      const icicles = hangers(id, g, icPts, icG, ['#DDF1F8', '#C4E6F2', '#EAF7FB'], 0);
      const flakePts = [
        [-40, -60, 200],
        [80, -120, 230],
        [150, 20, 190],
      ];
      for (const q of flakePts) limb(B, q, [q[0], q[1], 420], 0.5, 0.5, '#C9D6DE', 3);
      const flG = new Bk();
      for (let k = 0; k < 3; k++) flG.add(BOX(24, 2.4, 0.8), '#FFFFFF', [0, -12, 0], [0, 0, (k * Math.PI) / 3]);
      for (let k = 0; k < 6; k++)
        flG.add(
          BOX(8, 1.8, 0.8),
          '#FFFFFF',
          [Math.cos((k * Math.PI) / 3) * 8, -12 + Math.sin((k * Math.PI) / 3) * 8, 0],
          [0, 0, (k * Math.PI) / 3 + 1.05],
        );
      const flakes = hangers(id, g, flakePts, flG.geo(), ['#FFFFFF', '#E4F1F5'], 0);
      /* ── luz: la brasa calienta su rincón; el resto, azul de tarde ── */
      const ember = glowSprite('#FF8A3A', 230);
      ember.position.set(...P(FX + 20, FY + 30, 44));
      g.add(ember);
      const pool = lightPool(id, g, FX + 70, FY + 90, 190, 150, '#FFB060', 0.4);
      lightPool(id, g, -116, 34, 110, 86, '#FFD9A0', 0.2);
      lightPool(id, g, 150, 60, 150, 120, '#BFE0FF', 0.16);
      layer(id, g, vignette('rgba(24,44,84,A)'), 3.5, { op: 0.6 });
      B.mesh(g);
      F.mesh(g, true);
      /* el punto de la bufanda y las vueltas finas del ovillo: solo de cerca (modo explorar) */
      const KM = K.mesh(g, true);
      KM.visible = false;
      g.userData.tick = (t, still) => {
        KM.visible = cerca(id);
        const k = still ? 1 : 0.86 + 0.14 * Math.sin(t * 5.1) * Math.sin(t * 1.7) + (typeof beatK === 'function' ? beatK() * 0.15 : 0);
        ember.material.opacity = 0.5 * k;
        pool.material.opacity = 0.36 * k;
        icicles(0, 0, 0);
        flakes(still ? 0 : t, 0.5, 0.6);
        iceM.emissiveIntensity = 0.3 + (still ? 0 : 0.08 * Math.sin(t * 0.9));
      };
      return g;
    };
  })();

  /* ═════════════════ VERANO LIGERO · solo en la prueba «islas» ═════════════════
     La receta nueva (ver la propuesta de rediseño): una protagonista (la piscina con su sombrilla), pocas
     piezas secundarias (la tumbona, la mesita, una palmera, el sol de papel), más de medio suelo libre y liso,
     tres colores (arena, turquesa y el dorado del sol), una sola cosa en altura y un solo movimiento.
     Dormido: el sol está gris y quieto y la luz es fría. Despierto (Solano ya tiene su hielo): llega el sol. */
  const VERL =
    !ISLAS || window.COLMENA_MV
      ? null
      : (() => {
          const id = 'ver',
            R0 = rf('sala-ver-l'),
            PX = 40,
            PY = -50,
            palm = wallPt(RT, 0.36, 0, 38);
          solid(id, palm[0], palm[1], 15);
          /* la sombrilla pequeña se quita: también su obstáculo */
          CELLS[id].solids = CELLS[id].solids.filter((q) => !(q[0] === -205 && q[1] === -60));
          {
            const mk0 = PROPS3D.make;
            PROPS3D.make = (roomId, pr) => (roomId === id && pr.id === 'sombrilla' ? new T3.Group() : mk0(roomId, pr));
          }
          return () => {
            const g = new T3.Group(),
              B = new Bk(),
              F = new Bk();
            /* ── la protagonista: la sombrilla grande sobre la piscina ── */
            const UX = PX + 26,
              UY = PY - 98,
              UH = 176;
            limb(B, [UX, UY, 0], [UX - 5, UY, UH], 4.5, 3.5, '#F6EFD9', 8);
            for (let k = 0; k < 12; k++)
              F.add(CYL(3, 118, 34, 1, true, (k * Math.PI) / 6, Math.PI / 6), k % 2 ? '#F4EBD2' : '#4FB7B0', P(UX - 5, UY, UH - 15));
            B.add(SPH(6, 8, 6), '#F4EBD2', P(UX - 5, UY, UH + 5));
            /* ── una sola palmera, al fondo a la derecha ── */
            {
              const h = 168;
              let a = [palm[0], palm[1], 0];
              for (let k = 1; k <= 7; k++) {
                const t = k / 7,
                  b = [palm[0] + 20 * t * t, palm[1] + 6 * t, h * t];
                limb(B, a, b, 9 - t * 3.5, 8.4 - t * 3.5, k % 2 ? '#B08A5C' : '#A27C50', 7);
                a = b;
              }
              for (let k = 0; k < 8; k++) {
                const an = (k / 8) * 6.28 + 0.4,
                  L = R0(74, 96),
                  tip = [a[0] + Math.cos(an) * L, a[1] + Math.sin(an) * L, a[2] - R0(20, 44)],
                  mid = [a[0] + Math.cos(an) * L * 0.5, a[1] + Math.sin(an) * L * 0.5, a[2] + 14];
                limb(F, a, mid, 5, 9, '#7FA98A', 4);
                limb(F, mid, tip, 9, 1.5, '#6E9A7C', 4);
              }
            }
            /* ── dos grupos de detalles: junto a la piscina y junto a la tumbona ── */
            B.add(BOX(7, 1.4, 16), '#4FB7B0', P(PX + 118, PY + 62, 3), [0, 0.5, 0]);
            B.add(BOX(7, 1.4, 16), '#4FB7B0', P(PX + 130, PY + 70, 3), [0, 0.2, 0]);
            for (let k = 0; k < 5; k++) B.add(BOX(44, 1.2, 8), k % 2 ? '#F4EBD2' : '#4FB7B0', P(-150, 74 + (k - 2) * 8, 3), [0, 0.2, 0]);
            /* ── suelo: arena lisa; el dibujo solo junto a la piscina (mojado y huellas) ── */
            const fl = ctex(512, 512, (c, w) => {
              c.fillStyle = '#F2E2BC';
              c.fillRect(0, 0, w, w);
              const R1 = rf('ver-suelo-l');
              blobs(c, w, w, 34, R1, ['rgba(250,240,212,A)', 'rgba(236,214,172,A)'], 40, 110, 0.35);
              const wet = c.createRadialGradient(tx(PX, w), ty(PY, w), 78, tx(PX, w), ty(PY, w), 138);
              wet.addColorStop(0, 'rgba(160,132,96,.42)');
              wet.addColorStop(1, 'rgba(160,132,96,0)');
              c.fillStyle = wet;
              c.fillRect(0, 0, w, w);
              c.fillStyle = 'rgba(150,120,86,.34)';
              for (let k = 0; k < 8; k++) {
                const t = k / 7,
                  x = PX - 82 - t * 62,
                  y = PY + 68 + t * 26 + (k % 2 ? 7 : -7);
                c.beginPath();
                c.ellipse(tx(x, w), ty(y, w), 5.5, 3.2, 0.5, 0, 6.28);
                c.fill();
              }
            });
            texFloor(id, g, fl);
            /* ── en altura, una sola cosa: el sol de papel. Su material aparte, para apagarlo y encenderlo ── */
            const sun = new T3.Group(),
              S = new Bk(),
              sunM = keep(id, new T3.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: T3.DoubleSide }));
            S.add(CYL(34, 34, 5, 20), '#F7C948', [0, 0, 0], [Math.PI / 2, 0, 0]);
            S.add(CYL(24, 24, 6.4, 20), '#FBD968', [0, 0, 0], [Math.PI / 2, 0, 0]);
            for (let k = 0; k < 12; k++) {
              const a = (k / 12) * 6.28,
                L = k % 2 ? 22 : 32;
              S.add(
                CONE(8, L, 4),
                k % 2 ? '#F7B23B' : '#F5A03C',
                [Math.cos(a) * (38 + L / 2), Math.sin(a) * (38 + L / 2), 0],
                [0, 0, a - Math.PI / 2],
                [1, 1, 0.35],
              );
            }
            sun.add(new T3.Mesh(S.geo(), sunM));
            const sunPiv = new T3.Group();
            sunPiv.position.set(...P(-110, -226, 128));
            sunPiv.rotation.x = -0.45;
            sunPiv.add(sun);
            g.add(sunPiv);
            const sunGlow = glowSprite('#FFE08A', 260);
            sunGlow.position.set(...P(-110, -226, 128));
            g.add(sunGlow);
            limb(B, [-110, -230, 164], [-110, -230, 420], 0.8, 0.8, '#C9A56A', 4);
            /* ── luz: un charco sobre la piscina y la tumbona; el borde, apenas en penumbra ── */
            const pool = lightPool(id, g, PX - 40, PY + 20, 220, 160, '#FFF3B8', 0.34),
              cold = lightPool(id, g, PX - 40, PY + 20, 220, 160, '#B8C8E8', 0.0);
            layer(id, g, vignette('rgba(150,96,60,A)'), 3.5, { op: 0.3 });
            B.mesh(g);
            F.mesh(g, true);
            const GREY = new T3.Color('#8C8C9C'),
              GOLD = new T3.Color('#FFFFFF');
            let k = AWAKE.ver() ? 1 : 0,
              spin = 0,
              lt = 0;
            g.userData.tick = (t, still) => {
              const dt = Math.min(0.1, Math.max(0, t - lt));
              lt = t;
              k = clamp(k + (AWAKE.ver() ? dt : -dt) / 1.6, 0, 1);
              const e = k * k * (3 - 2 * k);
              if (!still) spin += dt * 0.12 * e;
              sun.rotation.z = spin;
              sunPiv.scale.setScalar(0.72 + 0.14 * e);
              sunM.color.copy(GREY).lerp(GOLD, e);
              sunGlow.material.opacity = 0.04 + 0.42 * e;
              pool.material.opacity = 0.04 + 0.3 * e;
              cold.material.opacity = 0.14 * (1 - e);
            };
            return g;
          };
        })();
  /* ═════════════════ VERANO «ARQUITECTURA» · solo con window.COLMENA_MV (dist/prueba-mv.html) ═════════════════
     Una prueba de otra dirección de arte: la arquitectura manda (torres, arcada, escalera, un canal de agua),
     color plano en tres tonos, sin texturas, casi sin objetos y cámara casi isométrica.
     Dormido: no corre el agua y el disco del sol está apagado. Despierto: cae la cascada y el disco se enciende. */
  const MV = ISLAS && !!window.COLMENA_MV;
  const VERM = !MV
    ? null
    : (() => {
        const id = 'ver',
          TL = [-160, -276],
          TR = [160, -276],
          TREE = [226, 60],
          CORAL = '#EFA58F',
          CORAL_D = '#D98673',
          CORAL_L = '#F7C4B0',
          CREAM = '#FBF1DC',
          WATER = '#5CC6BE',
          GOLD = '#F6C453';
        CELLS[id].solids = CELLS[id].solids.filter((q) => !(q[0] === -205 && q[1] === -60));
        {
          const mk0 = PROPS3D.make;
          PROPS3D.make = (roomId, pr) => (roomId === id && pr.id === 'sombrilla' ? new T3.Group() : mk0(roomId, pr));
        }
        /* la escalera pegada al muro izquierdo ocupa suelo */
        const STEPS = [];
        for (let k = 0; k < 8; k++) {
          const u = 0.64 + k * 0.043,
            p = wallPt(LT, u, 0, 20);
          STEPS.push(p);
          if (k % 2 === 0) solid(id, p[0], p[1], 20);
        }
        solid(id, TREE[0], TREE[1], 15);
        /* cámara casi isométrica y cielo en degradado, para toda la prueba de este estilo */
        {
          const css = document.createElement('style');
          css.textContent =
            'body.mv #stage{background:linear-gradient(180deg,#FBE6C4 0%,#F8CBB0 55%,#EFA99A 100%)!important}body.mv #bg{opacity:0}';
          document.head.appendChild(css);
          document.body.classList.add('mv');
        }
        let camSet = null;
        const SEENR = {};
        if (window.R3DX)
          R3DX.push(() => {
            if (!window.R3D || !R3D.camera) return;
            /* un poco más lejos, para que las torres entren en el encuadre (conexiones.js define TRAVZ después de este módulo) */
            if (!window.TRAVZ || !window.TRAVZ.mv) {
              const tz0 = window.TRAVZ;
              window.TRAVZ = () => (tz0 ? tz0() : 0) + 0.4;
              window.TRAVZ.mv = 1;
            }
            if (camSet !== R3D.camera) {
              camSet = R3D.camera;
              R3D.camera.fov = 11;
              R3D.camera.updateProjectionMatrix();
              R3D.CAM.pitchT = 0.5;
            }
            /* los muros y el borde del cuarto, de un solo color plano */
            const r = R3D.rooms && R3D.rooms[id];
            if (!r || SEENR.r === r) return;
            SEENR.r = r;
            const flat = (m, col) => {
              if (!m) return;
              m.map = null;
              m.vertexColors = false;
              m.userData.base = new T3.Color(col);
              m.color.copy(m.userData.base);
              m.needsUpdate = true;
            };
            for (const w of r.walls || []) {
              const ms = Array.isArray(w.mesh.material) ? w.mesh.material : [w.mesh.material];
              flat(ms[0], CORAL_L);
              flat(ms[1], CORAL_D);
              for (const lf of w.leaves || []) flat(lf.material, '#C96F63');
            }
            for (const o of r.grp.children)
              if (
                o.isMesh &&
                !o.userData.floor &&
                !o.userData.tiles &&
                !Array.isArray(o.material) &&
                o.material.vertexColors &&
                !o.userData.lp
              )
                flat(o.material, CORAL);
          });
        return () => {
          const g = new T3.Group(),
            B = new Bk();
          /* ── dos torres en las esquinas del fondo ── */
          for (const [p, h, dome] of [
            [TL, 122, 0],
            [TR, 142, 1],
          ]) {
            B.add(BOX(58, h, 58), CORAL, P(p[0], p[1], h / 2));
            B.add(BOX(66, 8, 66), CORAL_L, P(p[0], p[1], h + 4));
            if (dome) B.add(SPH(26, 14, 8, 0, 6.28, 0, Math.PI / 2), CREAM, P(p[0], p[1], h + 8));
            else B.add(CONE(40, 34, 4), CREAM, P(p[0], p[1], h + 25), [0, Math.PI / 4, 0]);
            for (const z of [h * 0.45, h * 0.72]) B.add(BOX(10, 20, 2), CORAL_D, P(p[0], p[1] + 30, z));
          }
          /* ── la arcada sobre el muro del fondo ── */
          for (let k = 0; k <= 6; k++) {
            const x = -104 + k * 34.7;
            B.add(BOX(7, 44, 7), CREAM, P(x, -272, 122));
            if (k < 6) B.add(TOR(13.5, 3.2, 4, 10, Math.PI), CREAM, P(x + 17.3, -272, 140));
          }
          B.add(BOX(222, 7, 12), CORAL_L, P(0, -272, 158));
          /* ── la escalera que sube a la torre de la izquierda ── */
          STEPS.forEach((p, k) => {
            const h = 12 + k * 12.5;
            B.add(BOX(30, h, 26), k % 2 ? CORAL_L : CREAM, P(p[0], p[1], h / 2), [0, WYAW(LT), 0]);
          });
          /* ── el canal: de la torre de la derecha a la piscina ── */
          const CH = [
            [150, -236],
            [150, -170],
            [118, -128],
          ];
          for (let k = 1; k < CH.length; k++) {
            const a = CH[k - 1],
              b = CH[k],
              L = Math.hypot(b[0] - a[0], b[1] - a[1]);
            B.add(BOX(24, 3, L + 22), CREAM, P((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 3), [0, Math.atan2(b[0] - a[0], b[1] - a[1]), 0]);
          }
          const waterM = keep(id, new T3.MeshBasicMaterial({ color: WATER })),
            wB = new Bk();
          for (let k = 1; k < CH.length; k++) {
            const a = CH[k - 1],
              b = CH[k],
              L = Math.hypot(b[0] - a[0], b[1] - a[1]);
            wB.add(BOX(13, 1, L + 16), '#FFFFFF', P((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 5.2), [
              0,
              Math.atan2(b[0] - a[0], b[1] - a[1]),
              0,
            ]);
          }
          const channel = new T3.Mesh(wB.geo(), waterM);
          g.add(channel);
          const fallG = BOX(13, 1, 2).clone();
          fallG.translate(0, -0.5, 0);
          fallG.userData.shared = true;
          const fall = new T3.Mesh(fallG, waterM);
          fall.position.set(...P(TR[0] - 10, TR[1] + 31, 126));
          g.add(fall);
          B.add(BOX(20, 8, 6), CORAL_L, P(TR[0] - 10, TR[1] + 32, 130));
          /* ── un solo árbol, de formas simples ── */
          B.add(CYL(3.5, 4.5, 26, 6), '#B98A6A', P(TREE[0], TREE[1], 13));
          B.add(CONE(20, 64, 8), '#8FC2A2', P(TREE[0], TREE[1], 56));
          B.add(CYL(20, 22, 10, 8), CREAM, P(TREE[0], TREE[1], 5));
          /* ── suelo: un solo color, con un hexágono más claro bajo la zona de la piscina ── */
          const fl = ctex(256, 256, (c, w) => {
            c.fillStyle = '#F8E2BE';
            c.fillRect(0, 0, w, w);
            c.fillStyle = '#FBEBD0';
            c.beginPath();
            for (let k = 0; k < 6; k++)
              c.lineTo(tx(40 + Math.cos((k * Math.PI) / 3) * 150, w), ty(-50 + Math.sin((k * Math.PI) / 3) * 150, w));
            c.fill();
          });
          texFloor(id, g, fl);
          /* ── en altura, una sola cosa: el disco del sol sobre la torre, con su anillo ── */
          const sunM = keep(id, new T3.MeshBasicMaterial({ color: GOLD })),
            disc = new T3.Mesh(SPH(17, 16, 12), sunM),
            ring = new T3.Mesh(TOR(30, 2.2, 6, 28), sunM),
            sunP = P(TL[0], TL[1], 192);
          disc.position.set(...sunP);
          ring.position.set(...sunP);
          g.add(disc, ring);
          const glow = glowSprite('#FFE6A0', 230);
          glow.position.set(...sunP);
          g.add(glow);
          const pool = lightPool(id, g, 10, -30, 240, 180, '#FFF6DC', 0.3);
          layer(id, g, vignette('rgba(200,120,96,A)'), 3.5, { op: 0.14 });
          B.mesh(g, true);
          const OFF = new T3.Color('#B9A9B4'),
            ON = new T3.Color(GOLD),
            WOFF = new T3.Color('#CFE4E0'),
            WON = new T3.Color(WATER);
          let k = AWAKE.ver() ? 1 : 0,
            spin = 0,
            lt = 0;
          g.userData.tick = (t, still) => {
            const dt = Math.min(0.1, Math.max(0, t - lt));
            lt = t;
            k = clamp(k + (AWAKE.ver() ? dt : -dt) / 2.2, 0, 1);
            const e = k * k * (3 - 2 * k);
            if (!still) spin += dt * 0.5 * e;
            ring.rotation.set(1.1, spin, 0.3);
            sunM.color.copy(OFF).lerp(ON, e);
            glow.material.opacity = 0.02 + 0.45 * e;
            pool.material.opacity = 0.05 + 0.26 * e;
            /* el agua baja de la torre y llena el canal */
            fall.scale.y = Math.max(0.001, 122 * clamp(e * 2, 0, 1));
            channel.visible = e > 0.5;
            waterM.color.copy(WOFF).lerp(WON, clamp(e * 2 - 0.6, 0, 1));
          };
          return g;
        };
      })();
  /* ═════════════════ DE CERCA · la piscina de Verano y la prensa de Otoño ═════════════════
     Sustituyen a las de props3d.js en el mismo sitio y con la misma huella (sus obstáculos no cambian),
     con el detalle que pide el modo explorar. Siguen siendo las mismas mallas fundidas: no suben las llamadas. */
  {
    /* un trozo de anillo hexagonal (esquinas a 0°, 60°…), del tramo f0–f1 del lado k, entre los radios ri y ro */
    const hexSeg = (ri, ro, z0, z1, k, f0 = 0, f1 = 1) => {
      const cn = (j) => [Math.cos(j * (Math.PI / 3)), Math.sin(j * (Math.PI / 3))],
        a = cn(k),
        b = cn(k + 1),
        at = (f, r, z) => [(a[0] + (b[0] - a[0]) * f) * r, z, (a[1] + (b[1] - a[1]) * f) * r],
        v = [
          at(f0, ri, z1),
          at(f1, ri, z1),
          at(f1, ro, z1),
          at(f0, ro, z1),
          at(f0, ri, z0),
          at(f1, ri, z0),
          at(f1, ro, z0),
          at(f0, ro, z0),
        ],
        F4 = [
          [0, 3, 2, 1],
          [4, 5, 1, 0],
          [3, 7, 6, 2],
          [0, 4, 7, 3],
          [1, 2, 6, 5],
        ],
        pos = [];
      for (const [p, q, r, s] of F4) for (const i of [p, q, r, p, r, s]) pos.push(...v[i]);
      const g = new T3.BufferGeometry();
      g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
      g.computeVertexNormals();
      return g;
    };
    function pileta(orig) {
      const B = new Bk(),
        x = 40,
        y = -50,
        WZ = 5.2,
        TILE = ['#3E8E9A', '#7CC6D2', '#F3E0B8', '#2C6E7C', '#7CC6D2', '#F7C948'],
        STONE = ['#F6E6C2', '#EFDAB0', '#F3E0B8', '#EAD3A4'];
      for (let k = 0; k < 6; k++) {
        /* el murete, la cenefa de mosaico sobre el agua y el borde de losas con su canto redondeado */
        B.add(hexSeg(76, 92, 0, 7.6, k), '#E2C694', P(x, y, 0));
        for (let j = 0; j < 16; j++)
          B.add(hexSeg(75.5, 76.2, WZ + 0.2, 7.5, k, j / 16 + 0.004, (j + 1) / 16 - 0.004), TILE[(j + k * 2) % 6], P(x, y, 0));
        for (let j = 0; j < 4; j++)
          B.add(hexSeg(74.6, 94, 7.6, 10.2, k, j / 4 + 0.005, (j + 1) / 4 - 0.005), STONE[(j + k) % 4], P(x, y, 0));
        const a = [x + Math.cos((k * Math.PI) / 3) * 74.8, y + Math.sin((k * Math.PI) / 3) * 74.8],
          b = [x + Math.cos(((k + 1) * Math.PI) / 3) * 74.8, y + Math.sin(((k + 1) * Math.PI) / 3) * 74.8];
        limb(B, [a[0], a[1], 8.9], [b[0], b[1], 8.9], 1.4, 1.4, '#FFF2D6', 6);
      }
      /* el flotador a franjas, con su cuerda */
      for (let k = 0; k < 8; k++)
        B.add(TOR(13, 4, 5, 3, Math.PI / 4), k % 2 ? '#FBF4E3' : '#E8674F', P(x + 30, y - 18, WZ + 1), [Math.PI / 2, 0, (k * Math.PI) / 4]);
      B.add(TOR(17.4, 0.45, 3, 24), '#E9D7B0', P(x + 30, y - 18, WZ + 1.6), [Math.PI / 2, 0, 0]);
      /* la escalerilla: dos pasamanos que salen del agua y se curvan sobre el borde */
      {
        const am = -Math.PI / 6,
          n = [Math.cos(am), Math.sin(am)],
          t = [-n[1], n[0]],
          yaw = Math.atan2(-n[1], n[0]);
        for (const s of [-1, 1]) {
          const o = [x + t[0] * s * 8, y + t[1] * s * 8];
          limb(B, [o[0] + n[0] * 64.4, o[1] + n[1] * 64.4, 0], [o[0] + n[0] * 64.4, o[1] + n[1] * 64.4, 18], 1.2, 1.2, '#B7C3C6', 6);
          B.add(TOR(8.2, 1.2, 6, 10, Math.PI), '#C8D3D6', P(o[0] + n[0] * 72.6, o[1] + n[1] * 72.6, 18), [0, yaw, 0]);
          limb(B, [o[0] + n[0] * 80.8, o[1] + n[1] * 80.8, 18], [o[0] + n[0] * 80.8, o[1] + n[1] * 80.8, 10], 1.2, 1.2, '#B7C3C6', 6);
          B.add(CYL(2.4, 2.4, 0.8, 8), '#9AA6A9', P(o[0] + n[0] * 80.8, o[1] + n[1] * 80.8, 10.4));
        }
        for (const z of [0.5, 3.5]) B.add(BOX(16, 1.2, 2.6), '#B7C3C6', P(x + n[0] * 64.6, y + n[1] * 64.6, z), [0, yaw + Math.PI / 2, 0]);
      }
      const parts = [B];
      /* el agua de siempre (su material), con la forma exacta del hexágono */
      const w = orig && orig.children.find((m) => m.isMesh && m.material && !m.material.vertexColors);
      if (w) {
        const pos = [];
        for (let k = 0; k < 6; k++) {
          const a = (k * Math.PI) / 3,
            b = ((k + 1) * Math.PI) / 3;
          pos.push(0, 0, 0, Math.cos(b) * 75.6, 0, Math.sin(b) * 75.6, Math.cos(a) * 75.6, 0, Math.sin(a) * 75.6);
        }
        const g = new T3.BufferGeometry();
        g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
        g.computeVertexNormals();
        g.userData.shared = true;
        const W = new T3.Mesh(g, w.material);
        W.position.set(...P(x, y, WZ));
        parts.push(W);
      }
      return parts;
    }
    function prensa() {
      const B = new Bk(),
        F = new Bk(),
        x = 135,
        y = -45,
        WOOD = '#B8783A',
        WOODD = '#9A6436',
        IRON = '#55625F',
        IRONL = '#6F8D8A',
        GOLD = '#D69646';
      /* la mesa: patas torneadas con collarines, travesaños y el tablero con sus guías de hierro */
      for (const dx of [-34, 34])
        for (const dy of [-16, 16]) {
          B.add(CYL(2.4, 2.9, 32, 8), WOODD, P(x + dx, y + dy, 17));
          for (const z of [9, 27]) B.add(CYL(3.6, 3.6, 2.2, 8), WOOD, P(x + dx, y + dy, z));
          B.add(SPH(3.4, 8, 5), WOODD, P(x + dx, y + dy, 1.6), [0, 0, 0], [1, 0.6, 1]);
        }
      for (const dy of [-16, 16]) B.add(BOX(66, 3, 2.4), WOOD, P(x, y + dy, 8));
      for (const dx of [-34, 34]) B.add(BOX(2.4, 3, 30), WOOD, P(x + dx, y, 8));
      B.add(BOX(84, 8, 42), WOODD, P(x, y, 38));
      B.add(BOX(86, 1.4, 44), WOOD, P(x, y, 42.4));
      for (const dy of [-12, 12]) B.add(BOX(84, 1.6, 2.4), IRON, P(x, y + dy, 43.8));
      /* la platina con la forma: el marco de hierro y las filas de tipos de plomo */
      B.add(BOX(42, 2.2, 30), '#4A5452', P(x - 14, y, 44.4));
      for (const [w, d, ox, oy] of [
        [36, 2, 0, -12],
        [36, 2, 0, 12],
        [2, 26, -17, 0],
        [2, 26, 17, 0],
      ])
        B.add(BOX(w, 2.4, d), IRONL, P(x - 14 + ox, y + oy, 46.6));
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 11; c++) {
          if ((r === 2 && c > 7) || (r === 5 && c < 2)) continue;
          F.add(BOX(2.4, 2.2, 2.4), (r + c) % 4 ? '#2E2A30' : '#3C3840', P(x - 14 - 14 + c * 2.8, y - 9 + r * 3, 46.7));
        }
      /* el tímpano abierto, con la hoja recién impresa */
      {
        const hx = x - 38,
          hz = 45,
          u = [-0.5, 0.866],
          c = [hx + u[0] * 17, hz + u[1] * 17];
        for (const [w, ox, oy] of [
          [34, 0, -14],
          [34, 0, 14],
        ])
          B.add(BOX(w, 1.6, 2), IRONL, P(c[0], y + oy, c[1]), [0, 0, 2.094]);
        for (const s of [-1, 1]) B.add(BOX(2, 1.6, 30), IRONL, P(c[0] + u[0] * s * 16, y, c[1] + u[1] * s * 16), [0, 0, 2.094]);
        B.add(BOX(30, 0.6, 26), C.cream, P(c[0] + 0.3, y, c[1] - 0.2), [0, 0, 2.094]);
        const pt = (f, g) => P(c[0] + u[0] * f + 0.9, y + g, c[1] + u[1] * f + 0.5);
        F.add(CIRC(5, 10), C.petalD, pt(2, -4), [-Math.PI / 2, Math.PI / 3, 0]);
        F.add(CIRC(4, 10), C.teal, pt(-3, 5), [-Math.PI / 2, Math.PI / 3, 0]);
        for (let k = 0; k < 4; k++) F.add(BOX(0.4, 0.8, 14 - k * 2), '#5E5048', pt(-9 + k * 2.4, -2), [0, 0, 2.094]);
        B.add(CYL(1.6, 1.6, 34, 6), IRON, P(hx, y, hz), [Math.PI / 2, 0, 0]);
      }
      /* el bastidor de hierro: dos montantes con filete dorado, la cabeza y el remate de panal */
      for (const s of [-1, 1]) {
        B.add(BOX(9, 56, 6), IRONL, P(x + 6, y + s * 19, 72));
        B.add(BOX(13, 4, 9), IRON, P(x + 6, y + s * 19, 46));
        B.add(BOX(0.6, 46, 0.6), GOLD, P(x + 6, y + s * 22.1, 72));
      }
      B.add(BOX(14, 10, 48), IRONL, P(x + 6, y, 103));
      B.add(BOX(15, 1, 49), GOLD, P(x + 6, y, 98.4));
      B.add(TOR(11, 1.8, 5, 12, Math.PI), IRON, P(x + 6, y, 108), [0, Math.PI / 2, 0]);
      B.add(TOR(5.4, 1.3, 4, 6), GOLD, P(x + 6, y, 121), [0, Math.PI / 2, Math.PI / 6]);
      B.add(SPH(3, 8, 6), C.honeyL || '#F2C877', P(x + 6, y, 121));
      /* el husillo con su rosca, la barra con el mango de madera y la platina con nervios */
      B.add(CYL(2.6, 2.6, 30, 8), '#7A8684', P(x + 6, y, 83));
      for (let k = 0; k < 6; k++) B.add(TOR(2.8, 0.6, 3, 10), '#4A5452', P(x + 6, y, 86 + k * 2.2), [Math.PI / 2, 0, 0]);
      B.add(SPH(4.4, 8, 6), IRON, P(x + 6, y, 82));
      limb(B, [x + 6, y, 82], [x + 26, y + 22, 78], 1.4, 1.2, IRON, 6);
      limb(B, [x + 26, y + 22, 78], [x + 33, y + 30, 77], 2.4, 2.2, '#7A4A24', 7);
      B.add(SPH(2.6, 7, 5), '#7A4A24', P(x + 33.5, y + 30.5, 77));
      B.add(BOX(30, 5, 30), IRON, P(x + 6, y, 66));
      for (const s of [-1, 0, 1]) B.add(BOX(28, 2, 1.6), IRONL, P(x + 6, y + s * 9, 69.4));
      B.add(CYL(5, 6, 4, 8), IRONL, P(x + 6, y, 70.5));
      /* los rodillos donde llega el papel de la bobina */
      for (const z of [70, 77]) {
        B.add(CYL(3.2, 3.2, 34, 12), z > 72 ? '#D8CBB0' : '#3A3634', P(x + 22, y, z), [Math.PI / 2, 0, 0]);
        for (const s of [-1, 1]) B.add(BOX(4, 4, 2), IRON, P(x + 22, y + s * 18, z));
      }
      for (const s of [-1, 1]) limb(B, [x + 14, y + s * 19, 64], [x + 22, y + s * 19, 79], 1.2, 1.2, IRON, 4);
      /* la rueda: aro con radios, cubo, manijas y su soporte */
      B.add(CYL(2, 2, 26, 6), '#5A4A42', P(x + 33, y, 62), [0, 0, Math.PI / 2]);
      B.add(BOX(3.4, 20, 3.4), IRON, P(x + 40, y, 52));
      const w = P(x + 46, y, 62);
      B.add(TOR(20, 2.8, 5, 18), GOLD, w, [0, Math.PI / 2, 0]);
      B.add(TOR(7, 1.2, 4, 12), shd(GOLD, 0.85), w, [0, Math.PI / 2, 0]);
      for (let k = 0; k < 6; k++) B.add(BOX(2, 36, 2), GOLD, w, [(k * Math.PI) / 6, 0, 0]);
      B.add(SPH(4, 6, 5), C.honeyL, w);
      for (let k = 0; k < 3; k++) {
        const a = (k * 2 * Math.PI) / 3 + 0.3;
        B.add(CYL(1.6, 1.6, 9, 6), '#7A4A24', P(x + 51, y + Math.cos(a) * 18, 62 + Math.sin(a) * 18), [0, 0, Math.PI / 2]);
      }
      /* la losa de tinta con el rodillo de entintar */
      B.add(BOX(16, 1.4, 14), '#D8D4CC', P(x + 26, y + 10, 43.6));
      F.add(OCT(1), '#2E2A3A', P(x + 25, y + 10, 44.4), [0, 0.4, 0], [6, 0.3, 4.4]);
      B.add(CYL(2.4, 2.4, 10, 10), '#3A3634', P(x + 28, y + 12, 46.8), [Math.PI / 2, 0, 0]);
      limb(B, [x + 28, y + 12, 46.8], [x + 34, y + 8, 49], 0.6, 0.6, IRON, 4);
      limb(B, [x + 34, y + 8, 49], [x + 40, y + 4, 51], 1.4, 1.4, '#7A4A24', 6);
      return [B, F];
    }
    const BUILD = { pileta: ISLAS ? null : ['ver', pileta], prensa: ['oto', prensa] },
      CACHE = {},
      mk0 = PROPS3D.make;
    PROPS3D.make = (roomId, pr) => {
      const b = BUILD[pr.id];
      if (b && b[0] === roomId)
        try {
          if (CACHE[pr.id]) return CACHE[pr.id];
          const g = new T3.Group(),
            near = new T3.Group(),
            far = mk0(roomId, pr);
          g.userData = { kind: 'prop3d', id: pr.id };
          b[1](far).forEach((q, i) => {
            if (q.isMesh) return near.add(q);
            const m = q.mesh(near, i > 0);
            if (m) m.userData.lp = 1;
          });
          near.visible = false;
          g.add(far, near);
          CERCA.push({ id: roomId, far, near });
          return (CACHE[pr.id] = g);
        } catch (e) {
          console.warn('pieza de cerca', pr.id, e);
        }
      return mk0(roomId, pr);
    };
  }
  if (MV) SALAS.add('ver', [], VERM, { hideTiles: 1, noRug: 1, noLife: 1 });
  else if (ISLAS) SALAS.add('ver', [], VERL, { hideTiles: 1, noRug: 1, noLife: 1 });
  else SALAS.add('ver', ['flowers', 'shells', 'bigplant'], VER, { hideTiles: 1 });
  SALAS.add('oto', ['books', 'bush', 'stool', 'paper'], OTO, { hideTiles: 1 });
  SALAS.add('inv', ['lantern', 'pillow', 'candles'], INV, { hideTiles: 1 });
})();
