/* ══════════ SALAS · tres cuartos rediseñados como guía de estilo ══════════
   Primavera, Océano y Volcán dejan de ser «la misma caja con otro color». Cada uno tiene:
   · una PIEZA PROTAGONISTA que se recuerda (el invernadero de cristal, el esqueleto de ballena, el lago de lava),
   · ARQUITECTURA propia que sobresale del hexágono (cristaleras, algas altas, columnas de basalto),
   · SUELO propio (musgo y charcos, arena con ondas y cáusticas, basalto con vetas de lava),
   · LUZ con intención (un charco de luz principal, bordes en penumbra del color del cuarto),
   · una capa en ALTURA (cestas colgantes y guirnalda, medusas y peces, humo y chispas)
   · y MOVIMIENTO pequeño (lluvia en el cristal, algas que se mecen, lava que fluye).
   No cambia nada de la lógica: vecinos, puertas, objetos y misiones siguen en su sitio; las piezas
   nuevas que ocupan suelo añaden su obstáculo para que nadie las atraviese. */
(() => {
  if (!window.PROPS3D || !window.LP3D || !window.THREE || !window.R3THEME) return;
  const T3 = THREE,
    { Bk, SPH, CYL, CONE, BOX, TOR, LATHE, OCT, CIRC, shd, mix, mat, matF, glowSprite } = LP3D.kit,
    { WP, WYAW, P, rf, limb, pot, sunMat } = PROPS3D.kit;
  const A6 = Math.PI / 3,
    AP = R * Math.cos(Math.PI / 6);
  const MT = { pri: [], oce: [], vol: [] };
  const keep = (id, m) => {
    m.userData.shared = true;
    m.userData.base = m.color.clone();
    (MT[id] = MT[id] || []).push(m);
    return m;
  };
  const ctex = (w, h, draw, rep) => {
    const c = newCanvas(w, h),
      g = c.getContext('2d');
    draw(g, w, h);
    const t = new T3.CanvasTexture(c);
    t.colorSpace = T3.SRGBColorSpace;
    if (rep) {
      t.wrapS = t.wrapT = T3.RepeatWrapping;
    }
    t.userData.shared = true;
    return t;
  };
  const solid = (id, x, y, r) => CELLS[id].solids.push([x, y, r]);
  /* el hexágono del suelo: radio hasta el borde en la dirección th */
  const rHex = (th, ins = 3) => {
    const a = (R - ins) * Math.cos(Math.PI / 6),
      k = Math.round((th - Math.PI / 6) / A6),
      n = k * A6 + Math.PI / 6;
    return a / Math.cos(th - n);
  };
  /* una malla de suelo con relieve y color por vértice, y un plano liso con UV para las capas de luz */
  function floorMesh(ins, hf, cf, N = 26, M = 132) {
    const pos = [],
      col = [],
      uv = [],
      idx = [],
      c = new T3.Color();
    const put = (x, y) => {
      const h = hf(x, y);
      pos.push(x, h, y);
      c.set(cf(x, y, h));
      col.push(c.r, c.g, c.b);
      uv.push((x / R + 1) / 2, (y / R + 1) / 2);
    };
    put(0, 0);
    for (let j = 1; j <= N; j++)
      for (let i = 0; i < M; i++) {
        const th = (i / M) * Math.PI * 2,
          r = (rHex(th, ins) * j) / N;
        put(Math.cos(th) * r, Math.sin(th) * r);
      }
    for (let i = 0; i < M; i++) idx.push(0, 1 + ((i + 1) % M), 1 + i);
    for (let j = 1; j < N; j++)
      for (let i = 0; i < M; i++) {
        const a = 1 + (j - 1) * M + i,
          b = 1 + (j - 1) * M + ((i + 1) % M),
          cc = 1 + j * M + i,
          d = 1 + j * M + ((i + 1) % M);
        idx.push(a, b, cc, b, d, cc);
      }
    const g = new T3.BufferGeometry();
    g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new T3.Float32BufferAttribute(col, 3));
    g.setAttribute('uv', new T3.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    g.userData.shared = true;
    return g;
  }
  const flatHex = (ins, h) =>
    floorMesh(
      ins,
      () => h,
      () => '#FFFFFF',
      1,
      6,
    );
  /* capas de luz sobre el suelo */
  function layer(id, g, tex, h, o = {}) {
    const m = keep(
      id,
      new T3.MeshBasicMaterial({
        map: tex,
        color: o.col || '#FFFFFF',
        transparent: true,
        opacity: o.op ?? 1,
        depthWrite: false,
        blending: o.add ? T3.AdditiveBlending : T3.NormalBlending,
        fog: false,
      }),
    );
    const me = new T3.Mesh(o.geo || flatHex(o.ins ?? 4, h), m);
    if (o.geo) me.position.y = h;
    me.renderOrder = o.ro ?? 0;
    g.add(me);
    return me;
  }
  const vignette = (col) =>
    ctex(256, 256, (g, w) => {
      const r = g.createRadialGradient(w / 2, w / 2, w * 0.18, w / 2, w / 2, w * 0.5);
      r.addColorStop(0, 'rgba(0,0,0,0)');
      r.addColorStop(0.62, col.replace('A', 0.18));
      r.addColorStop(1, col.replace('A', 0.9));
      g.fillStyle = r;
      g.fillRect(0, 0, w, w);
    });
  let POOLT = null;
  const poolTex = () =>
    POOLT ||
    (POOLT = ctex(128, 128, (g, w) => {
      const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      r.addColorStop(0, 'rgba(255,255,255,1)');
      r.addColorStop(0.45, 'rgba(255,255,255,.45)');
      r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r;
      g.fillRect(0, 0, w, w);
    }));
  function lightPool(id, g, x, y, rx, ry, col, op, h = 3.2) {
    const geo = new T3.PlaneGeometry(rx * 2, ry * 2);
    geo.rotateX(-Math.PI / 2);
    geo.userData.shared = true;
    const m = keep(
      id,
      new T3.MeshBasicMaterial({
        map: poolTex(),
        color: col,
        transparent: true,
        opacity: op,
        depthWrite: false,
        blending: T3.AdditiveBlending,
        fog: false,
      }),
    );
    const me = new T3.Mesh(geo, m);
    me.position.set(...P(x, y, h));
    me.renderOrder = 1;
    g.add(me);
    return me;
  }
  /* una pieza plana a lo largo de una pared (cristal, cascada…) */
  function wallQuad(e, u0, u1, z0, z1, d) {
    const a = wallPt(e, u0, z0, d),
      b = wallPt(e, u1, z0, d),
      c = wallPt(e, u1, z1, d),
      f = wallPt(e, u0, z1, d);
    const g = new T3.BufferGeometry();
    g.setAttribute('position', new T3.Float32BufferAttribute([...P(...a), ...P(...b), ...P(...c), ...P(...a), ...P(...c), ...P(...f)], 3));
    g.setAttribute('uv', new T3.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    g.userData.shared = true;
    return g;
  }
  /* ruido tileable sencillo para texturas */
  function blobs(g, w, h, n, R0, cols, rmin, rmax, alpha) {
    for (let k = 0; k < n; k++) {
      const x = R0(0, w),
        y = R0(0, h),
        r = R0(rmin, rmax),
        col = cols[k % cols.length];
      for (const dx of [-w, 0, w])
        for (const dy of [-h, 0, h]) {
          const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
          gr.addColorStop(0, col.replace('A', alpha));
          gr.addColorStop(1, col.replace('A', 0));
          g.fillStyle = gr;
          g.fillRect(x + dx - r, y + dy - r, 2 * r, 2 * r);
        }
    }
  }

  /* ═════════════════ 1 · PRIMAVERA · el invernadero de cristal ═════════════════ */
  const PRI = (() => {
    const id = 'pri',
      lt = [3, 4],
      bt = [4, 5],
      rt = [5, 0],
      R0 = rf('sala-pri');
    /* lo que ocupa suelo */
    solid(id, 140, -212, 30);
    solid(id, 236, -22, 20);
    solid(id, 236, 22, 20);
    solid(id, -236, -58, 24);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk();
      const HON = '#D89A45',
        HONL = C.honeyL || '#F2C877';
      /* ── cristalera sobre las tres paredes del fondo: el cuarto crece hacia arriba ── */
      const glass = keep(
        id,
        new T3.MeshLambertMaterial({
          color: '#E3F4EE',
          emissive: '#9CC9BC',
          emissiveIntensity: 0.25,
          transparent: true,
          opacity: 0.24,
          depthWrite: false,
          side: T3.DoubleSide,
        }),
      );
      for (const e of [lt, rt]) {
        const y = WYAW(e);
        g.add(new T3.Mesh(wallQuad(e, 0, 1, 160, 250, 3), glass));
        for (let k = 0; k <= 6; k++) B.add(BOX(4, 92, 4), HON, WP(e, k / 6, 205, 3), [0, y, 0]);
        for (const z of [160, 206, 250]) B.add(BOX(310, z === 206 ? 3 : 5, 5), z === 206 ? HONL : HON, WP(e, 0.5, z, 3), [0, y, 0]);
      }
      {
        const y = WYAW(bt),
          gg = new T3.BufferGeometry(),
          pts = [
            [0, 160],
            [1, 160],
            [1, 250],
            [0.5, 330],
            [0, 250],
          ].map(([u, z]) => P(...wallPt(bt, u, z, 3)));
        gg.setAttribute(
          'position',
          new T3.Float32BufferAttribute(
            [...pts[0], ...pts[1], ...pts[2], ...pts[0], ...pts[2], ...pts[4], ...pts[4], ...pts[2], ...pts[3]],
            3,
          ),
        );
        gg.computeVertexNormals();
        gg.userData.shared = true;
        g.add(new T3.Mesh(gg, glass));
        B.add(BOX(310, 5, 5), HON, WP(bt, 0.5, 160, 3), [0, y, 0]);
        B.add(BOX(310, 4, 5), HON, WP(bt, 0.5, 250, 3), [0, y, 0]);
        for (const s of [-1, 1]) {
          const a = wallPt(bt, s < 0 ? 0 : 1, 250, 3),
            b = wallPt(bt, 0.5, 330, 3);
          limb(B, a, b, 3, 3, HON, 6);
        }
        for (const u of [1 / 6, 2 / 6, 4 / 6, 5 / 6]) {
          const zt = 250 + 80 * (1 - Math.abs(u - 0.5) * 2);
          limb(B, wallPt(bt, u, 160, 3), wallPt(bt, u, zt, 3), 2, 2, HON, 5);
        }
        /* rosetón hexagonal en el frontón */
        const rc = WP(bt, 0.5, 280, 4);
        B.addM(
          TOR(20, 3, 4, 6),
          HON,
          new T3.Matrix4()
            .makeRotationY(y)
            .multiply(new T3.Matrix4().makeRotationZ(Math.PI / 6))
            .setPosition(...rc),
        );
        for (let k = 0; k < 6; k++) {
          const a = k * A6;
          B.add(BOX(1.6, 20, 1.6), HONL, [rc[0], rc[1], rc[2]], [0, y, a]);
        }
      }
      /* ── la viga de lado a lado, con guirnalda de bombillas y tres cestas colgantes ── */
      const va = wallPt(lt, 0.55, 236, 6),
        vb = wallPt(rt, 0.45, 236, 6);
      limb(B, va, vb, 4.2, 4.2, '#B87A3A', 7);
      const at = (t) => [lerp(va[0], vb[0], t), lerp(va[1], vb[1], t), lerp(va[2], vb[2], t)];
      const bulbs = [];
      {
        const n = 11;
        for (let k = 0; k < n; k++) {
          const t = (k + 0.5) / n,
            p = at(t),
            z = p[2] - 10 - Math.sin(t * Math.PI) * 26;
          bulbs.push([p[0], p[1] + 4, z]);
        }
        for (let k = 0; k < bulbs.length - 1; k++) limb(B, bulbs[k], bulbs[k + 1], 0.5, 0.5, '#5A4636', 3);
        limb(B, at(0), bulbs[0], 0.5, 0.5, '#5A4636', 3);
        limb(B, bulbs[bulbs.length - 1], at(1), 0.5, 0.5, '#5A4636', 3);
      }
      const glows = [];
      {
        const BL = new Bk();
        bulbs.forEach((b, i) => {
          BL.add(SPH(2.6, 6, 5), '#FFE6A6', P(...b));
          if (i % 2 === 0) {
            const s = glowSprite('#FFC870', 44);
            s.position.set(...P(b[0], b[1], b[2]));
            s.material.opacity = 0.5;
            g.add(s);
            glows.push(s);
          }
        });
        g.add(new T3.Mesh(BL.geo(), keep(id, new T3.MeshBasicMaterial({ vertexColors: true }))));
      }
      const baskets = [];
      for (const [t, seed, fl] of [
        [0.22, 'c1', C.petal],
        [0.5, 'c2', C.butter],
        [0.78, 'c3', '#D8A3C9'],
      ]) {
        const top = at(t),
          len = 58 + R0(-6, 8);
        const bg = new T3.Group();
        bg.position.set(...P(...top));
        g.add(bg);
        const BB = new Bk(),
          BF = new Bk();
        BB.add(CYL(0.6, 0.6, len, 4), '#6A5040', [0, -len / 2, 0]);
        BB.add(
          LATHE(
            [
              [2, 0],
              [13, 5],
              [15, 12],
              [15.5, 13],
              [13, 13],
            ],
            10,
          ),
          '#C9873C',
          [0, -len - 12, 0],
        );
        BB.add(CYL(13, 13, 1, 10), C.soil, [0, -len, 0]);
        const R1 = rf(seed);
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * 6.28 + R1(0, 0.5);
          BF.add(
            OCT(5),
            k % 2 ? C.sage : C.sageD,
            [Math.cos(a) * 9, -len + 4 + R1(0, 5), Math.sin(a) * 9],
            [R1(0, 3), a, R1(-0.5, 0.5)],
            [1, 1.7, 0.35],
          );
        }
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * 6.28 + 0.3;
          let x = Math.cos(a) * 14,
            z = Math.sin(a) * 14,
            y = -len - 4;
          for (let j = 0; j < 4; j++) {
            BF.add(OCT(3.4), j % 2 ? C.sage : '#7FA86A', [x, y, z], [R1(0, 3), a, 0], [1, 1.5, 0.4]);
            y -= 7;
            x *= 1.06;
            z *= 1.06;
          }
        }
        for (let k = 0; k < 4; k++) {
          const a = R1(0, 6.28);
          BF.add(SPH(2.6, 5, 4), fl, [Math.cos(a) * 8, -len + 9, Math.sin(a) * 8]);
        }
        BB.mesh(bg);
        BF.mesh(bg, true);
        baskets.push({ bg, ph: R0(0, 6) });
      }
      /* ── el rincón del jardinero: herramientas, sacos de semillas y macetas apiladas ── */
      {
        const x = 140,
          y = -212;
        for (const [dx, dy, s] of [
          [10, -10, 1],
          [-14, 8, 0.85],
        ]) {
          const c = P(x + dx, y + dy, 0);
          B.add(SPH(15 * s, 7, 5), '#C9A877', [c[0], c[1] + 12 * s, c[2]], [0, dx, 0], [1, 1.1, 0.9]);
          B.add(CYL(5 * s, 8 * s, 7 * s, 7), '#B8945E', [c[0], c[1] + 26 * s, c[2]]);
          B.add(TOR(5.4 * s, 1.1, 4, 8), '#7A5A3A', [c[0], c[1] + 24 * s, c[2]], [Math.PI / 2, 0, 0]);
          for (let k = 0; k < 5; k++)
            F.add(SPH(1.6, 4, 3), k % 2 ? '#E9C74A' : '#8A5A2E', [c[0] + R0(-4, 4) * s, c[1] + 30 * s, c[2] + R0(-4, 4) * s]);
        }
        /* rastrillo y pala apoyados en la pared */
        const w0 = wallPt(bt, 0.86, 0, 8),
          w1 = wallPt(bt, 0.86, 96, 2);
        limb(B, [w0[0], w0[1], 2], [w1[0], w1[1], 96], 1.6, 1.6, '#B07A44', 5);
        B.add(BOX(26, 3, 4), '#7A7A82', P(w1[0], w1[1] - 2, 98), [0, WYAW(bt), 0]);
        for (let k = 0; k < 6; k++) B.add(BOX(1.4, 7, 1.4), '#7A7A82', P(w1[0] - 11 + k * 4.4, w1[1] - 2, 94), [0, WYAW(bt), 0]);
        const s0 = wallPt(bt, 0.95, 0, 10),
          s1 = wallPt(bt, 0.95, 74, 3);
        limb(B, [s0[0], s0[1], 14], [s1[0], s1[1], 74], 1.5, 1.5, '#B07A44', 5);
        B.add(BOX(13, 16, 2), '#8A8A92', P(s0[0], s0[1], 7), [0, WYAW(bt), 0.12]);
        /* macetas de barro apiladas */
        const px = 104,
          py = -232;
        for (let k = 0; k < 4; k++)
          B.add(
            LATHE(
              [
                [7, 0],
                [10, 12],
                [11, 12],
                [11, 14],
                [8, 14],
              ],
              10,
            ),
            C.terra,
            P(px + (k % 2) * 2, py, k * 7),
            [0, 0, k % 2 ? 0.06 : -0.04],
          );
        B.add(
          LATHE(
            [
              [7, 0],
              [10, 12],
              [11, 12],
              [11, 14],
              [8, 14],
            ],
            10,
          ),
          shd(C.terra, 0.92),
          P(px + 22, py + 6, 0),
          [Math.PI / 2.3, 0, 0.4],
        );
      }
      /* ── banco de semilleros entre las dos puertas de la derecha ── */
      {
        const x = 236,
          a = Math.PI / 2;
        for (const dy of [-30, 30]) for (const dx of [-10, 10]) B.add(BOX(3, 20, 3), '#9A6A3A', P(x + dx, dy, 10));
        B.add(BOX(26, 4, 76), '#C9873C', P(x, 0, 22));
        for (let k = 0; k < 3; k++) {
          const yy = -24 + k * 24;
          B.add(BOX(22, 5, 20), '#8A5A32', P(x, yy, 27));
          for (let j = 0; j < 6; j++)
            F.add(SPH(2.6, 5, 4), j % 2 ? '#8FB573' : '#6F9A55', P(x - 7 + (j % 3) * 7, yy - 5 + Math.floor(j / 3) * 10, 31));
        }
        B.add(CYL(7, 6, 14, 8), '#7FA4A0', P(x + 4, 44, 7));
        B.add(TOR(5, 1, 4, 8, Math.PI), '#6A8A86', P(x + 4, 44, 14), [0, a, 0]);
      }
      /* ── a la izquierda, bajo los estantes: cubo de zinc y macetas vacías ── */
      {
        const x = -236,
          y = -58;
        B.add(
          LATHE(
            [
              [9, 0],
              [11, 18],
              [12, 18],
              [12, 19],
              [10, 19],
            ],
            12,
          ),
          '#A9B3B6',
          P(x, y, 0),
        );
        B.add(CYL(10, 10, 1, 12), '#7FB8C4', P(x, y, 15));
        B.add(TOR(11, 0.8, 3, 10, Math.PI), '#7A8488', P(x, y, 19), [0, 0, 0]);
        for (let k = 0; k < 3; k++)
          B.add(
            LATHE(
              [
                [5, 0],
                [7, 9],
                [8, 9],
                [8, 10.5],
                [6, 10.5],
              ],
              9,
            ),
            C.terra,
            P(x + 16 + k * 3, y + 18 - k * 4, k * 8.5),
          );
      }
      /* ── suelo: musgo junto a las paredes, charcos de lluvia, pétalos caídos ── */
      for (let k = 0; k < 16; k++) {
        const th = R0(0, 6.28),
          rr = rHex(th, 0) * R0(0.8, 0.9),
          x0 = Math.cos(th) * rr,
          y0 = Math.sin(th) * rr;
        if (y0 > 150 && Math.abs(x0) < 60) continue;
        if (CELLS[id].doors.some((d) => Math.hypot(x0 - d.mid[0], y0 - d.mid[1]) < 76)) continue;
        for (let j = 0; j < 6; j++) {
          const x = x0 + R0(-18, 18),
            y = y0 + R0(-12, 12);
          F.add(
            SPH(R0(10, 17), 6, 3),
            ['#8DB878', '#7FA86A', '#9CC48A', C.sage][j % 4],
            P(x, y, 2.6),
            [0, R0(0, 3), 0],
            [1, 0.12, R0(0.6, 0.9)],
          );
        }
        if (k % 2)
          for (let j = 0; j < 3; j++) F.add(SPH(2.2, 5, 4), [C.butter, C.cream, C.petal][j], P(x0 + R0(-14, 14), y0 + R0(-10, 10), 5));
      }
      const puddles = [];
      for (const [x, y, rx, ry] of [
        [-165, -8, 34, 20],
        [68, 150, 26, 15],
        [-30, -150, 22, 13],
      ]) {
        const pm = keep(
          id,
          new T3.MeshLambertMaterial({
            color: '#A9D3D8',
            emissive: '#5E9AA4',
            emissiveIntensity: 0.35,
            transparent: true,
            opacity: 0.7,
            depthWrite: false,
          }),
        );
        const pg = CIRC(1, 18);
        const me = new T3.Mesh(pg, pm);
        me.rotation.x = -Math.PI / 2;
        me.scale.set(rx, ry, 1);
        me.position.set(...P(x, y, 3.1));
        me.renderOrder = 1;
        g.add(me);
        const rm = keep(id, new T3.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false }));
        const ring = new T3.Mesh(TOR(1, 0.06, 3, 24), rm);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(...P(x, y, 3.3));
        g.add(ring);
        puddles.push({ ring, rx, ry, x, y, ph: R0(0, 3) });
      }
      const petals = new Bk();
      for (let k = 0; k < 46; k++) {
        const a = R0(0, 6.28),
          d = Math.sqrt(R0(0, 1)) * 120;
        petals.add(
          OCT(3.2),
          k % 3 ? C.petal : C.petalL,
          P(-130 + Math.cos(a) * d * 1.1, -170 + Math.sin(a) * d * 0.7, 3.2),
          [0, R0(0, 6), 0],
          [1.3, 0.15, 0.8],
        );
      }
      const petalM = petals.mesh(g, true);
      /* ── luz: el sol de la ventana cae sobre el huerto; los bordes, en sombra verde ── */
      const sunPool = lightPool(id, g, 8, -110, 130, 100, '#FFE7A8', 0.4);
      layer(id, g, vignette('rgba(40,70,30,A)'), 3.4, { op: 0.5 });
      /* ── lluvia que resbala por el cristal ── */
      const dropG = new T3.PlaneGeometry(1.1, 9);
      dropG.userData.shared = true;
      const dropM = keep(
        id,
        new T3.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.55, depthWrite: false, side: T3.DoubleSide }),
      );
      const drops = [],
        NDROP = 30,
        dropI = new T3.InstancedMesh(dropG, dropM, NDROP);
      dropI.frustumCulled = false;
      g.add(dropI);
      const _o = new T3.Object3D();
      for (let k = 0; k < NDROP; k++) {
        const e = [lt, bt, rt][k % 3];
        drops.push({ e, u: R0(0.03, 0.97), z: R0(165, 250), v: R0(28, 60), yaw: WYAW(e) });
      }
      B.mesh(g);
      F.mesh(g, true);
      g.userData.tick = (t, still, amb) => {
        const dt = FDTS();
        drops.forEach((d, i) => {
          if (!still) {
            d.z -= d.v * dt;
            if (d.z < 162) {
              d.z = R0(232, 256);
              d.u = R0(0.03, 0.97);
            }
          }
          const top = d.e === bt ? 250 + 80 * (1 - Math.abs(d.u - 0.5) * 2) : 250;
          if (d.z > top) d.z = top - 1;
          _o.position.set(...WP(d.e, d.u, d.z, 4));
          _o.rotation.set(0, d.yaw, 0);
          _o.updateMatrix();
          dropI.setMatrixAt(i, _o.matrix);
        });
        dropI.instanceMatrix.needsUpdate = true;
        for (const p of puddles) {
          const c = ((t * 0.55 + p.ph) % 1.6) / 1.6;
          p.ring.scale.set(p.rx * (0.15 + c * 0.8), p.ry * (0.15 + c * 0.8), 1);
          p.ring.material.opacity = still ? 0 : 0.5 * (1 - c);
        }
        for (const b of baskets) {
          b.bg.rotation.z = still ? 0 : Math.sin(t * 0.7 + b.ph) * 0.035;
          b.bg.rotation.x = still ? 0 : Math.cos(t * 0.55 + b.ph) * 0.03;
        }
        for (let i = 0; i < glows.length; i++)
          glows[i].material.opacity = (0.25 + 0.35 * Math.max(0, 1 - amb * 0.8)) * (still ? 1 : 0.9 + 0.1 * Math.sin(t * 3 + i * 1.7));
        sunPool.material.opacity = 0.16 + 0.34 * Math.max(0, amb - 0.3);
        petalM.visible = !!PROG.F.bloom || FREE;
      };
      return g;
    };
  })();

  /* ═════════════════ 2 · OCÉANO · el esqueleto de ballena ═════════════════ */
  const OCE = (() => {
    const id = 'oce',
      lt = [3, 4],
      bt = [4, 5],
      rt = [5, 0],
      R0 = rf('sala-oce'),
      SY = -206;
    for (const [x, r] of [
      [-168, 34],
      [-104, 38],
      [-36, 44],
      [34, 44],
      [100, 38],
      [160, 26],
    ])
      solid(id, x, SY, r);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        BONE = '#EFE6D2',
        BONED = '#D8CCB2';
      /* ── la ballena: costillas en arco, columna, cráneo y aletas, con percebes y corales ── */
      const ribs = [];
      for (let k = 0; k < 8; k++) {
        const x = -112 + k * 30,
          s = Math.sin((Math.PI * (k + 1)) / 9),
          r = 30 + 30 * Math.sqrt(s);
        ribs.push([x, r]);
        B.add(TOR(r, 3.4 - k * 0.12, 5, 16, Math.PI), k % 2 ? BONE : BONED, P(x, SY, 0), [0, Math.PI / 2 + 0.55, (k - 3.5) * 0.02]);
      }
      const spineZ = (x) => {
        if (x <= -112) return 40 + (x + 112) * -0.02;
        if (x >= 98) return Math.max(5, ribs[7][1] - (x - 98) * 0.42);
        const i = Math.min(6, Math.floor((x + 112) / 30)),
          u = (x + 112) / 30 - i;
        return lerp(ribs[i][1], ribs[i + 1][1], u);
      };
      for (let x = -130; x <= 190; x += 11) {
        const z = spineZ(x) + 3,
          s = x > 110 ? Math.max(0.45, 1 - (x - 110) / 120) : 1;
        B.add(CYL(5.2 * s, 5.2 * s, 8, 7), BONE, P(x, SY, z), [0, 0, Math.PI / 2]);
        B.add(CONE(2.4 * s, 9 * s, 4), BONED, P(x, SY, z + 7 * s), [0, 0, 0]);
      }
      {
        const x = -148,
          z = 26;
        B.add(SPH(28, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), BONE, P(x, SY, 6), [0, 0, 0], [1.1, 0.95, 1.05]);
        limb(B, [x - 6, SY + 6, 14], [x - 52, SY + 66, 8], 24, 5, BONE, 8);
        B.add(SPH(7, 7, 5), '#3A3530', P(x + 4, SY + 22, z), [0, 0, 0], [1, 0.8, 0.6]);
        B.add(SPH(4, 6, 4), '#3A3530', P(x - 14, SY + 30, z - 4));
        limb(B, [x + 10, SY + 16, 3], [x - 40, SY + 86, 3], 4.2, 3, BONED, 6);
        limb(B, [x - 26, SY - 10, 3], [x - 70, SY + 52, 3], 4.2, 3, BONED, 6);
      }
      for (const s of [-1, 1]) {
        const x0 = -70,
          y0 = SY + s * 58;
        limb(B, [x0, y0, 3], [x0 + 26, y0 + s * 22, 2], 3.6, 3, BONE, 5);
        for (let k = 0; k < 4; k++) limb(B, [x0 + 26, y0 + s * 22, 2], [x0 + 40 + k * 5, y0 + s * (30 + k * 7), 2], 1.6, 1.1, BONED, 4);
      }
      for (let k = 0; k < 40; k++) {
        const [x, r] = ribs[Math.floor(R0(0, 8))],
          a = R0(0.2, Math.PI - 0.2),
          c = [C.petal, '#F59A5A', '#E07FD0', '#F3DFB4', '#8DB5AA'][k % 5];
        F.add(CONE(R0(1.6, 3), R0(3, 6), 5), c, P(x, SY - Math.cos(a) * r, Math.sin(a) * r + 2), [R0(-1, 1), 0, R0(-1, 1)]);
      }
      for (const [x, cs] of [
        [-60, ['#E07FD0', '#C85FB0']],
        [60, [C.petalD, '#F59A5A']],
        [130, ['#F59A5A', C.butter]],
      ]) {
        const R1 = rf('co' + x);
        for (let k = 0; k < 5; k++) {
          const a = R1(0, 6.28),
            h = R1(18, 32);
          limb(F, [x, SY + 38, 0], [x + Math.cos(a) * 10, SY + 38 + Math.sin(a) * 7, h], 2.4, 1.4, cs[k % 2], 5);
          F.add(SPH(2.4, 5, 4), cs[0], P(x + Math.cos(a) * 10, SY + 38 + Math.sin(a) * 7, h));
        }
      }
      /* ── ojos de buey al mar abierto en las paredes de los lados, con peces que pasan ── */
      const deep = ctex(128, 128, (gg, w) => {
        const r = gg.createLinearGradient(0, 0, 0, w);
        r.addColorStop(0, '#4FA6BE');
        r.addColorStop(0.55, '#1E5E7A');
        r.addColorStop(1, '#0E2E44');
        gg.fillStyle = r;
        gg.fillRect(0, 0, w, w);
        gg.globalAlpha = 0.18;
        gg.fillStyle = '#BFF0FF';
        for (let k = 0; k < 5; k++) {
          gg.beginPath();
          gg.moveTo(20 + k * 22, 0);
          gg.lineTo(30 + k * 22, 0);
          gg.lineTo(10 + k * 26, w);
          gg.lineTo(0 + k * 26, w);
          gg.fill();
        }
      });
      const fishT = ctex(
        256,
        128,
        (gg, w, h) => {
          const R1 = rf('peces');
          gg.fillStyle = 'rgba(8,30,44,.85)';
          for (let k = 0; k < 16; k++) {
            const x = R1(0, w),
              y = R1(18, h - 18),
              s = R1(4, 9);
            for (const dx of [-w, 0, w]) {
              gg.beginPath();
              gg.ellipse(x + dx, y, s * 1.6, s * 0.7, 0, 0, 6.3);
              gg.fill();
              gg.beginPath();
              gg.moveTo(x + dx + s * 1.4, y);
              gg.lineTo(x + dx + s * 2.6, y - s * 0.8);
              gg.lineTo(x + dx + s * 2.6, y + s * 0.8);
              gg.fill();
            }
          }
        },
        true,
      );
      const deepM = keep(id, new T3.MeshBasicMaterial({ map: deep })),
        fishM = keep(id, new T3.MeshBasicMaterial({ map: fishT, transparent: true, depthWrite: false })),
        glassO = keep(
          id,
          new T3.MeshLambertMaterial({
            color: '#CFF4FF',
            emissive: '#7FD0E6',
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.22,
            depthWrite: false,
          }),
        );
      const ports = [];
      for (const e of [lt, rt]) {
        const y = WYAW(e),
          c = WP(e, 0.5, 92, 1.5),
          r = 44;
        const m4 = (k) => new T3.Matrix4().makeRotationY(y).setPosition(...WP(e, 0.5, 92, 1.5 + k));
        const d1 = new T3.Mesh(CIRC(r, 28), deepM);
        d1.applyMatrix4(m4(0));
        g.add(d1);
        const d2 = new T3.Mesh(CIRC(r, 28), fishM);
        d2.applyMatrix4(m4(0.6));
        g.add(d2);
        const d3 = new T3.Mesh(CIRC(r, 28), glassO);
        d3.applyMatrix4(m4(1.4));
        g.add(d3);
        B.addM(TOR(r + 3, 5.5, 6, 28), '#C9963E', m4(2));
        B.addM(TOR(r + 9, 2, 4, 28), '#A87A2E', m4(1));
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * 6.28;
          B.addM(
            SPH(2.2, 5, 4),
            '#E8C27A',
            m4(4).multiply(new T3.Matrix4().makeTranslation(Math.cos(a) * (r + 3), Math.sin(a) * (r + 3), 0)),
          );
        }
        ports.push(fishT);
      }
      /* ── bosque de algas altas junto a las paredes: se mecen y sobresalen del cuarto ── */
      const kelp = [],
        segG = (() => {
          const K = new Bk();
          K.add(BOX(2, 40, 1.2), '#3E7A5E', [0, 20, 0]);
          for (const [y, sd, c] of [
            [10, -1, '#4E8A6E'],
            [22, 1, '#5F9A7A'],
            [33, -1, '#5F9A7A'],
          ])
            K.add(OCT(6), c, [sd * 4.5, y, 0], [0, 0, sd * 0.5], [1, 2.3, 0.25]);
          return K.geo();
        })();
      const kelpM = matF();
      for (const [e, u] of [
        [lt, 0.12],
        [lt, 0.24],
        [lt, 0.78],
        [lt, 0.9],
        [rt, 0.1],
        [rt, 0.22],
        [rt, 0.8],
        [rt, 0.9],
        [bt, 0.06],
        [bt, 0.94],
      ]) {
        const base = new T3.Group();
        base.position.set(...WP(e, u, 0, 16));
        base.rotation.y = WYAW(e) + R0(-0.4, 0.4);
        g.add(base);
        let par = base;
        const n = Math.round(R0(4, 6)),
          segs = [];
        for (let k = 0; k < n; k++) {
          const s = new T3.Mesh(segG, kelpM);
          if (k) s.position.y = 40;
          s.scale.setScalar(1 - k * 0.04);
          par.add(s);
          segs.push(s);
          par = s;
        }
        kelp.push({ segs, ph: R0(0, 6) });
      }
      /* ── suelo de arena con ondas, estrellas de mar y piedrecitas ── */
      const sandG = floorMesh(
        3,
        (x, y) => 1.4 + 1.1 * Math.sin(x * 0.05 + Math.sin(y * 0.018) * 2.4) + 0.5 * Math.sin(y * 0.09 + x * 0.02),
        (x, y, h) => mix('#D9C59A', '#F0E2BE', Math.min(1, Math.max(0, (h - 0.6) / 2.4))),
      );
      const sand = new T3.Mesh(sandG, keep(id, new T3.MeshLambertMaterial({ vertexColors: true })));
      g.add(sand);
      for (let k = 0; k < 7; k++) {
        let x, y;
        for (let n = 0; n < 40; n++) {
          x = R0(-220, 220);
          y = R0(-120, 220);
          if (Math.hypot(x + 40, y + 10) > 70 && Math.hypot(x - 150, y - 50) > 80 && Math.hypot(x + 160, y + 40) > 60) break;
        }
        const c = ['#E8743C', '#F59A5A', '#C85FB0', '#F3B04A'][k % 4],
          a = R0(0, 6);
        for (let j = 0; j < 5; j++) {
          const b = a + j * 1.2566;
          B.add(CONE(3.2, 13, 4), c, P(x + Math.cos(b) * 6, y + Math.sin(b) * 6, 3.2), [Math.PI / 2, 0, -b + Math.PI / 2], [1, 1, 0.4]);
        }
        B.add(CYL(4, 4, 2, 8), shd(c, 0.9), P(x, y, 3.4));
      }
      for (let k = 0; k < 26; k++) {
        const th = R0(0, 6.28),
          rr = rHex(th, 0) * R0(0.55, 0.92);
        B.add(
          SPH(R0(2.5, 5), 5, 4),
          ['#B8C4C2', '#9AAAA8', '#D9CDB4'][k % 3],
          P(Math.cos(th) * rr, Math.sin(th) * rr, 2.6),
          [0, R0(0, 3), 0],
          [1, 0.55, R0(0.7, 1)],
        );
      }
      /* ── luz: cáusticas que se mueven en el suelo, rayos desde arriba, penumbra azul en los bordes ── */
      const caus = ctex(
        160,
        160,
        (gg, w) => {
          const R1 = rf('caus'),
            pts = [];
          for (let k = 0; k < 22; k++) pts.push([R1(0, w), R1(0, w)]);
          const im = gg.createImageData(w, w);
          for (let y = 0; y < w; y++)
            for (let x = 0; x < w; x++) {
              let d1 = 1e9,
                d2 = 1e9;
              for (const [px, py] of pts)
                for (const ox of [-w, 0, w])
                  for (const oy of [-w, 0, w]) {
                    const d = (x - px - ox) ** 2 + (y - py - oy) ** 2;
                    if (d < d1) {
                      d2 = d1;
                      d1 = d;
                    } else if (d < d2) d2 = d;
                  }
              const e = Math.sqrt(d2) - Math.sqrt(d1),
                v = Math.max(0, 1 - e / 7);
              const i = (y * w + x) * 4;
              im.data[i] = im.data[i + 1] = im.data[i + 2] = 255;
              im.data[i + 3] = Math.round(255 * v * v);
            }
          gg.putImageData(im, 0, 0);
        },
        true,
      );
      caus.repeat.set(2.4, 2.4);
      const caus2 = caus.clone();
      caus2.userData.shared = true;
      caus2.repeat.set(1.7, 1.7);
      caus2.needsUpdate = true;
      const cl1 = layer(id, g, caus, 4.2, { add: 1, op: 0.22, col: '#CFF8FF', ro: 1 }),
        cl2 = layer(id, g, caus2, 4.3, { add: 1, op: 0.14, col: '#BFF0FF', ro: 1 });
      lightPool(id, g, -30, 40, 150, 110, '#BFF6FF', 0.22);
      layer(id, g, vignette('rgba(10,50,70,A)'), 4.6, { op: 0.6 });
      const rays = [];
      for (const [x, y, w, rot] of [
        [-90, -60, 46, 0.3],
        [60, -20, 60, -0.25],
        [150, 110, 40, 0.2],
      ]) {
        const pg = new T3.PlaneGeometry(w, 330);
        pg.translate(0, -165, 0);
        pg.userData.shared = true;
        const m = new T3.Mesh(
          pg,
          keep(
            id,
            new T3.MeshBasicMaterial({
              color: '#E6FAFF',
              transparent: true,
              opacity: 0.1,
              blending: T3.AdditiveBlending,
              depthWrite: false,
              side: T3.DoubleSide,
              fog: false,
            }),
          ),
        );
        m.position.set(...P(x, y, 330));
        m.rotation.set(0.12, R0(0, 3), rot);
        g.add(m);
        rays.push({ m, ph: R0(0, 6) });
      }
      /* ── vida: dos bancos de peces y tres medusas ── */
      const fishG = (() => {
        const K = new Bk();
        K.add(OCT(5), '#F59A5A', [0, 0, 0], [0, 0, 0], [1.7, 1, 0.6]);
        K.add(CONE(3.4, 6, 4), '#E8743C', [-9, 0, 0], [0, 0, Math.PI / 2], [1, 1, 0.4]);
        K.add(SPH(1, 4, 3), '#2A2A2A', [5, 1.4, 2]);
        return K.geo();
      })();
      const fishG2 = (() => {
        const K = new Bk();
        K.add(OCT(4.4), '#8EC3CF', [0, 0, 0], [0, 0, 0], [1.8, 1, 0.55]);
        K.add(CONE(3, 5, 4), '#5FA9B6', [-8, 0, 0], [0, 0, Math.PI / 2], [1, 1, 0.4]);
        K.add(BOX(5, 1, 4.6), C.butter, [1, 0, 0]);
        return K.geo();
      })();
      const schools = [],
        _f = new T3.Object3D();
      for (const [gg, cx, cy, r1, r2, z, sp] of [
        [fishG, -40, 40, 170, 110, 120, 0.32],
        [fishG2, 40, -60, 140, 90, 165, -0.26],
      ]) {
        const L = [],
          I = new T3.InstancedMesh(gg, matF(), 8);
        I.frustumCulled = false;
        g.add(I);
        for (let k = 0; k < 8; k++) L.push({ o: k * 0.11 + R0(0, 0.05), dz: R0(-10, 10), dr: R0(-12, 12) });
        schools.push({ I, L, cx, cy, r1, r2, z, sp });
      }
      const jm = [];
      for (const [x, y, z, col] of [
        [-200, -120, 150, '#F2B6E6'],
        [190, -110, 180, '#B6E2F2'],
        [-150, 150, 200, '#F6D2B6'],
      ]) {
        const jg = new T3.Group();
        jg.position.set(...P(x, y, z));
        g.add(jg);
        const dm = keep(
          id,
          new T3.MeshLambertMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: 0.45,
            transparent: true,
            opacity: 0.62,
            side: T3.DoubleSide,
            depthWrite: false,
          }),
        );
        const d = new T3.Mesh(SPH(13, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), dm);
        jg.add(d);
        const K = new Bk();
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * 6.28;
          let p = [Math.cos(a) * 8, Math.sin(a) * 8, 0];
          for (let j = 0; j < 3; j++) {
            const q = [p[0] * 0.9 + Math.sin(j + k) * 2, p[1] * 0.9, p[2] - 10];
            limb(K, p, q, 0.7, 0.5, col, 3);
            p = q;
          }
        }
        K.mesh(jg, true);
        const s = glowSprite(col, 60);
        s.material.opacity = 0.35;
        jg.add(s);
        jm.push({ jg, y0: jg.position.y, ph: R0(0, 6), d });
      }
      B.mesh(g);
      F.mesh(g, true);
      g.userData.tick = (t, still, amb) => {
        const tt = still ? 0 : t;
        caus.offset.set(tt * 0.012, tt * 0.008);
        caus2.offset.set(-tt * 0.009, tt * 0.011);
        cl1.material.opacity = 0.12 + 0.12 * amb;
        cl2.material.opacity = 0.08 + 0.08 * amb;
        for (const f of ports) f.offset.x = -tt * 0.02;
        for (const k of kelp)
          k.segs.forEach((s, i) => {
            s.rotation.z = Math.sin(tt * 0.9 + k.ph + i * 0.55) * 0.09;
            s.rotation.x = Math.cos(tt * 0.7 + k.ph + i * 0.4) * 0.05;
          });
        for (const S of schools) {
          S.L.forEach((f, i) => {
            const a = tt * S.sp + f.o * 6.28 * 0.35,
              x = S.cx + Math.cos(a) * (S.r1 + f.dr),
              y = S.cy + Math.sin(a) * (S.r2 + f.dr * 0.6),
              z = S.z + f.dz + Math.sin(tt * 1.3 + f.o * 9) * 6;
            _f.position.set(...P(x, y, z));
            const vx = -Math.sin(a) * S.r1 * S.sp,
              vy = Math.cos(a) * S.r2 * S.sp;
            _f.rotation.set(0, Math.atan2(-vy, vx), 0);
            _f.updateMatrix();
            S.I.setMatrixAt(i, _f.matrix);
          });
          S.I.instanceMatrix.needsUpdate = true;
        }
        for (const j of jm) {
          const p = Math.sin(tt * 1.4 + j.ph);
          j.jg.position.y = j.y0 + Math.sin(tt * 0.5 + j.ph) * 14;
          j.d.scale.set(1 + 0.08 * p, 1 - 0.1 * p, 1 + 0.08 * p);
        }
        for (const r of rays)
          r.m.material.opacity = 0.05 + 0.1 * Math.max(0, amb - 0.3) * (still ? 1 : 0.75 + 0.25 * Math.sin(t * 0.6 + r.ph));
      };
      return g;
    };
  })();

  /* ═════════════════ 3 · VOLCÁN · el lago de lava y las columnas de basalto ═════════════════ */
  const VOL = (() => {
    const id = 'vol',
      lt = [3, 4],
      bt = [4, 5],
      rt = [5, 0],
      R0 = rf('sala-vol'),
      LX = 120,
      LY = -170;
    /* columnas de basalto pegadas a las paredes: las que asoman al cuarto ocupan sitio */
    const COLS = [];
    for (const [e, skip] of [
      [lt, [0.3, 0.7]],
      [bt, [0.72, 0.92]],
      [rt, [0.3, 0.7]],
    ])
      for (let u = 0.03; u < 0.98; u += 0.052) {
        if (u > skip[0] && u < skip[1]) continue;
        const back = e === lt ? u : e === rt ? 1 - u : 1,
          h = (40 + 120 * Math.abs(Math.sin(u * 7.3 + e[0])) + R0(-15, 25)) * (0.35 + 0.65 * back) + (e === bt ? 30 : 0),
          r = R0(10, 15),
          d = R0(8, 22);
        COLS.push({ e, u, h, r, d });
        if (d + r > 24) {
          const p = wallPt(e, u, 0, d);
          solid(id, p[0], p[1], r * 0.8);
        }
      }
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        BAS = ['#2E2724', '#3A312D', '#453A35', '#332A27'];
      for (const c of COLS) {
        const p = wallPt(c.e, c.u, 0, c.d),
          col = BAS[Math.floor(R0(0, 4))];
        B.add(CYL(c.r, c.r * 1.04, c.h, 6), col, P(p[0], p[1], c.h / 2), [0, R0(0, 1), 0]);
        B.add(CYL(c.r * 0.96, c.r, 2.4, 6), '#5E4E46', P(p[0], p[1], c.h + 1), [0, R0(0, 1), 0]);
      }
      /* vetas encendidas en las paredes, entre columnas */
      const crackM = keep(id, new T3.MeshBasicMaterial({ color: '#FF8A3A' }));
      const cracks = new Bk();
      for (let k = 0; k < 16; k++) {
        const e = [lt, bt, rt][k % 3],
          u = R0(0.05, 0.95),
          z0 = R0(20, 120);
        let z = z0,
          uu = u;
        for (let j = 0; j < 4; j++) {
          const z1 = z + R0(8, 16),
            u1 = uu + R0(-0.015, 0.015);
          limb(cracks, wallPt(e, uu, z, 1), wallPt(e, u1, z1, 1), 0.9, 0.6, '#FFFFFF', 3);
          z = z1;
          uu = u1;
        }
      }
      /* ── el lago de lava: borde de basalto, superficie que fluye, costras, burbujas y humo ── */
      const lavaT = ctex(
        256,
        256,
        (gg, w) => {
          gg.fillStyle = '#B8320E';
          gg.fillRect(0, 0, w, w);
          const R1 = rf('lava');
          blobs(gg, w, w, 26, R1, ['rgba(255,120,30,A)', 'rgba(255,170,60,A)'], 18, 60, 0.9);
          blobs(gg, w, w, 14, R1, ['rgba(255,226,140,A)'], 8, 26, 0.95);
          gg.strokeStyle = 'rgba(90,20,6,.55)';
          gg.lineWidth = 3;
          for (let k = 0; k < 10; k++) {
            gg.beginPath();
            let x = R1(0, w),
              y = R1(0, w);
            gg.moveTo(x, y);
            for (let j = 0; j < 5; j++) {
              x += R1(-30, 30);
              y += R1(-30, 30);
              gg.lineTo(x, y);
            }
            gg.stroke();
          }
        },
        true,
      );
      const lavaM = keep(id, new T3.MeshBasicMaterial({ map: lavaT }));
      const lake = new T3.Mesh(CIRC(68, 30), lavaM);
      lake.rotation.x = -Math.PI / 2;
      lake.position.set(...P(LX, LY, 4));
      g.add(lake);
      for (let k = 0; k < 18; k++) {
        const a = (k / 18) * 6.28 + R0(-0.1, 0.1),
          rr = R0(70, 80),
          h = Math.sin(a) < -0.2 ? R0(24, 58) : R0(6, 22),
          r = R0(9, 14);
        B.add(CYL(r, r * 1.05, h, 6), BAS[k % 4], P(LX + Math.cos(a) * rr, LY + Math.sin(a) * rr * 0.95, h / 2), [0, R0(0, 1), 0]);
        B.add(CYL(r * 0.95, r, 2, 6), '#5E4E46', P(LX + Math.cos(a) * rr, LY + Math.sin(a) * rr * 0.95, h + 0.8), [0, R0(0, 1), 0]);
      }
      const crustM = keep(id, new T3.MeshLambertMaterial({ color: '#2A1E1A' }));
      const crusts = [];
      for (let k = 0; k < 6; k++) {
        const m = new T3.Mesh(CYL(R0(6, 11), R0(7, 12), 1.4, Math.round(R0(5, 7))), crustM);
        g.add(m);
        crusts.push({ m, a: R0(0, 6.28), r: R0(12, 50), sp: R0(0.04, 0.09) * (k % 2 ? 1 : -1) });
      }
      const bubM = keep(id, new T3.MeshBasicMaterial({ color: '#FFD27A' }));
      const bubs = [];
      for (let k = 0; k < 5; k++) {
        const m = new T3.Mesh(SPH(4, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), bubM);
        g.add(m);
        bubs.push({ m, ph: R0(0, 2), x: 0, y: 0 });
      }
      const smokeM = [];
      const smokes = [];
      for (let k = 0; k < 7; k++) {
        const sm = new T3.SpriteMaterial({ map: poolTex(), color: '#6A5A55', transparent: true, opacity: 0, depthWrite: false });
        sm.userData.shared = true;
        const s = new T3.Sprite(sm);
        g.add(s);
        smokes.push({ s, ph: k / 7 });
      }
      const lakeGlow = glowSprite('#FF7A2A', 260);
      lakeGlow.position.set(...P(LX, LY, 30));
      lakeGlow.material.opacity = 0.55;
      g.add(lakeGlow);
      /* ── la cascada de lava que baja por la pared del fondo hasta el lago ── */
      const fallT = lavaT.clone();
      fallT.userData.shared = true;
      fallT.repeat.set(0.5, 2.2);
      fallT.needsUpdate = true;
      const fallM = keep(id, new T3.MeshBasicMaterial({ map: fallT, side: T3.DoubleSide }));
      const fall = new T3.Mesh(wallQuad(bt, 0.785, 0.855, 0, 150, 2), fallM);
      g.add(fall);
      for (const s of [0.765, 0.875])
        for (let z = 10; z < 160; z += R0(18, 30)) {
          const p = wallPt(bt, s + R0(-0.008, 0.008), z, 6),
            r = R0(7, 11);
          B.add(CYL(r, r, R0(16, 28), 6), BAS[Math.floor(R0(0, 4))], P(p[0], p[1], z), [R0(-0.3, 0.3), R0(0, 1), R0(-0.3, 0.3)]);
        }
      {
        const p0 = wallPt(bt, 0.82, 0, 4),
          p1 = [LX - 8, LY - 60];
        const cg = new T3.PlaneGeometry(26, Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + 8);
        cg.rotateX(-Math.PI / 2);
        cg.userData.shared = true;
        const ch = new T3.Mesh(cg, fallM);
        ch.position.set(...P((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, 3.6));
        ch.rotation.y = -Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) + Math.PI / 2;
        g.add(ch);
      }
      const fallGlow = glowSprite('#FF9A3A', 160);
      fallGlow.position.set(...WP(bt, 0.82, 80, 20));
      fallGlow.material.opacity = 0.4;
      g.add(fallGlow);
      /* ── suelo: rocas de lava enfriada con grietas, esquirlas de obsidiana y azufre ── */
      for (let k = 0; k < 14; k++) {
        let x, y;
        for (let n = 0; n < 50; n++) {
          const th = R0(0, 6.28),
            rr = rHex(th, 0) * R0(0.6, 0.88);
          x = Math.cos(th) * rr;
          y = Math.sin(th) * rr;
          if (
            Math.hypot(x - LX, y - LY) > 110 &&
            Math.hypot(x + 30, y - 70) > 80 &&
            Math.hypot(x + 100, y - 40) > 60 &&
            !CELLS[id].doors.some((d) => Math.hypot(x - d.mid[0], y - d.mid[1]) < 80)
          )
            break;
        }
        const s = R0(6, 13);
        B.add(SPH(s, 5, 4), '#2A2220', P(x, y, s * 0.35), [R0(0, 3), R0(0, 3), 0], [1, 0.6, 1]);
        for (let j = 0; j < 3; j++)
          limb(
            cracks,
            [x + R0(-s, s) * 0.6, y + R0(-s, s) * 0.6, s * 0.62],
            [x + R0(-s, s) * 0.6, y + R0(-s, s) * 0.6, s * 0.62],
            0.7,
            0.7,
            '#FFFFFF',
            3,
          );
      }
      g.add(new T3.Mesh(cracks.geo(), crackM));
      for (let k = 0; k < 10; k++) {
        const th = R0(0, 6.28),
          rr = rHex(th, 0) * R0(0.78, 0.9),
          x = Math.cos(th) * rr,
          y = Math.sin(th) * rr;
        if (CELLS[id].doors.some((d) => Math.hypot(x - d.mid[0], y - d.mid[1]) < 80)) continue;
        if (k % 3 === 0) {
          for (let j = 0; j < 4; j++)
            F.add(OCT(R0(3, 6)), '#E8D24A', P(x + R0(-8, 8), y + R0(-8, 8), 3), [R0(0, 3), R0(0, 3), 0], [1, 1.6, 1]);
        } else {
          for (let j = 0; j < 3; j++)
            F.add(CONE(R0(3, 5), R0(10, 22), 4), '#1E1622', P(x + R0(-8, 8), y + R0(-8, 8), 6), [R0(-0.4, 0.4), R0(0, 3), R0(-0.4, 0.4)]);
        }
      }
      /* ── luz: el lago ilumina el cuarto; los bordes se hunden en rojo oscuro ── */
      const pool = lightPool(id, g, LX - 20, LY + 30, 190, 150, '#FF7A2A', 0.38);
      const pool2 = lightPool(id, g, -30, 70, 120, 90, '#FFB060', 0.14);
      layer(id, g, vignette('rgba(20,4,2,A)'), 3.6, { op: 0.75 });
      B.mesh(g);
      F.mesh(g, true);
      g.userData.tick = (t, still, amb) => {
        const tt = still ? 0 : t,
          beat = typeof beatK === 'function' ? beatK() : 0;
        lavaT.offset.set(tt * 0.01, tt * 0.006);
        fallT.offset.y = tt * 0.22;
        for (const c of crusts) {
          const a = c.a + tt * c.sp;
          c.m.position.set(...P(LX + Math.cos(a) * c.r, LY + Math.sin(a) * c.r * 0.9, 4.6));
          c.m.rotation.y = a;
        }
        for (const b of bubs) {
          const u = ((tt * 0.55 + b.ph) % 2) / 2;
          if (u < 0.02 || !b.x) {
            const a = Math.random() * 6.28,
              r = Math.random() * 48;
            b.x = LX + Math.cos(a) * r;
            b.y = LY + Math.sin(a) * r;
          }
          b.m.position.set(...P(b.x, b.y, 4));
          const s = u < 0.8 ? u / 0.8 : Math.max(0, 1 - ((u - 0.8) / 0.2) * 1.6);
          b.m.scale.setScalar(still ? 0 : s);
        }
        for (const s of smokes) {
          const u = (tt * 0.06 + s.ph) % 1;
          s.s.position.set(...P(LX + Math.sin(u * 6 + s.ph * 9) * 20, LY + s.ph * 20 - 10, 40 + u * 260));
          s.s.scale.setScalar(50 + u * 120);
          s.s.material.opacity = still ? 0.1 : 0.22 * Math.sin(u * Math.PI);
        }
        const k = 0.85 + 0.15 * Math.sin(t * 1.7) + beat * 0.2;
        lakeGlow.material.opacity = 0.45 * k;
        fallGlow.material.opacity = 0.35 * k;
        pool.material.opacity = 0.3 * k;
        pool2.material.opacity = 0.1 + 0.06 * k;
        crackM.color.setRGB(1, 0.45 + 0.12 * Math.sin(t * 2.3), 0.2);
      };
      return g;
    };
  })();

  /* ── se instalan: Primavera conserva lo que tenía y suma lo nuevo; Océano y Volcán cambian su decoración genérica ── */
  const FDT0 = { t: performance.now() };
  function FDTS() {
    const n = performance.now(),
      d = Math.min(0.1, (n - FDT0.t) / 1000);
    FDT0.t = n;
    return d;
  }
  {
    const old = PROPS3D.room('pri');
    PROPS3D.addRoom('pri', () => {
      const g = new T3.Group();
      if (old) g.add(old);
      const n = PRI();
      g.add(n);
      g.userData.tick = (t, s, a) => {
        try {
          old && old.userData.tick && old.userData.tick(t, s, a);
        } catch (e) {}
        n.userData.tick(t, s, a);
      };
      return g;
    });
  }
  for (const [id, keepK, mk] of [
    ['oce', ['shells', 'rocks'], OCE],
    ['vol', ['rocks'], VOL],
  ]) {
    const th = R3THEME[id];
    if (!th) continue;
    R3ADD(id, { ...th, beam: null, items: th.items.filter((i) => keepK.includes(i.k)) });
    const base = PROPS3D.room(id);
    PROPS3D.addRoom(id, () => {
      const g = new T3.Group();
      if (base) g.add(base);
      const n = mk();
      g.add(n);
      g.userData.tick = (t, s, a) => {
        try {
          base && base.userData.tick && base.userData.tick(t, s, a);
        } catch (e) {}
        n.userData.tick(t, s, a);
      };
      return g;
    });
  }

  /* ── los demás cuartos se rediseñan en otros módulos (salas2.js…) con estas mismas piezas ──
     SALAS.add(id, itemsGenéricosQueSeQuedan, () => grupo, { hideTiles, tilesCol }) */
  const OPT = {};
  function install(id, keepK, mk, opt) {
    MT[id] = MT[id] || [];
    OPT[id] = opt || {};
    const th = R3THEME[id];
    if (th)
      R3ADD(id, {
        ...th,
        beam: opt && opt.beam ? th.beam : null,
        rug: opt && opt.noRug ? null : th.rug,
        life: opt && opt.noLife ? [] : th.life,
        items: th.items.filter((i) => keepK.includes(i.k)),
      });
    const base = PROPS3D.room(id);
    PROPS3D.addRoom(id, () => {
      const g = new T3.Group();
      if (base) g.add(base);
      const n = mk();
      g.add(n);
      g.userData.tick = (t, s, a) => {
        try {
          base && base.userData.tick && base.userData.tick(t, s, a);
        } catch (e) {}
        n.userData.tick && n.userData.tick(t, s, a);
      };
      return g;
    });
  }
  window.SALAS = {
    add: install,
    kit: { keep, ctex, solid, rHex, floorMesh, flatHex, layer, vignette, poolTex, lightPool, wallQuad, blobs, FDTS },
  };

  /* ── al construirse cada uno de estos cuartos: su suelo propio y sus materiales entran en el oscurecido de vecinas ── */
  const SEEN = {};
  if (window.R3DX)
    R3DX.push(() => {
      if (!window.R3D || !R3D.rooms) return;
      for (const id in MT) {
        const r = R3D.rooms[id];
        if (!r) continue;
        if (SEEN[id] !== r) {
          SEEN[id] = r;
          const ref = r.mats.find((m) => m.userData.base && !MT[id].includes(m) && !m.isMeshBasicMaterial),
            kc = ref
              ? new T3.Color(
                  ref.color.r / Math.max(0.01, ref.userData.base.r),
                  ref.color.g / Math.max(0.01, ref.userData.base.g),
                  ref.color.b / Math.max(0.01, ref.userData.base.b),
                )
              : null;
          for (const m of MT[id]) {
            if (!r.mats.includes(m)) r.mats.push(m);
            if (kc) m.color.copy(m.userData.base).multiply(kc);
          }
          for (const o of r.grp.children) {
            if (o.userData.tiles) {
              const op = OPT[id];
              if (op && op.hideTiles) o.visible = false;
              if (op && op.tilesCol) {
                const m = o.material;
                m.userData.base = new T3.Color(op.tilesCol);
                m.color.copy(m.userData.base);
              }
              if (id === 'oce') o.visible = false;
              if (id === 'vol') {
                const m = o.material;
                m.userData.base = new T3.Color('#A89890');
                m.color.copy(m.userData.base);
              }
            }
            if (o.userData.floor === id && id === 'vol' && r.grp.children.some((q) => q.userData.tiles)) {
              const m = o.material;
              m.emissive = new T3.Color('#FF4A12');
              m.emissiveIntensity = 0.9;
              o.userData.veins = 1;
            }
          }
        }
        if (id === 'vol')
          for (const o of r.grp.children)
            if (o.userData.veins) {
              const k = r.k ?? 1;
              o.material.emissiveIntensity = (0.55 + 0.25 * Math.sin(T * 1.3)) * k;
            }
      }
    });
})();
