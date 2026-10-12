/* ══════════ COLMENA 3D · diorama de papel ══════════
   El mundo es 3D de verdad: suelos, paredes con puertas que se abren, bordes, ramas y caminos.
   El arte sale del mismo dibujo de papel de siempre: cada suelo y cada pared se pinta en una
   textura con la misma pluma (proyectada sobre su plano) y los muebles, vecinos, Pompón y tú
   sois recortes de papel de pie en el mundo, como en un libro desplegable.
   La lógica del juego no cambia: esto solo sustituye al dibujo. */
const R3D = (() => {
  const TH3 = window.THREE;
  const glOK =
    !!TH3 &&
    (() => {
      try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
      } catch (e) {
        return false;
      }
    })();
  const pref = () => {
    try {
      const v = localStorage.getItem('colmena-gfx');
      if (v) return v;
    } catch (e) {}
    return '3d';
  };
  const Q = { ok: glOK, on: false };
  if (!glOK) return Q;
  const V3 = (x, y, z) => new TH3.Vector3(x, y, z);
  let renderer = null,
    scene = null,
    camera = null,
    cv3 = null,
    hemi = null,
    sun = null,
    lamp = null,
    fog = null;
  const rooms = {};
  let built = false;
  /* ── la cámara: órbita alrededor del cuarto ── */
  const CAM = { yaw: 0, pitch: 0.56, yawT: 0, pitchT: 0.56, dist: 900, tx: 0, ty: 40, tz: 0, ready: false, user: 0 };
  const PR = { x0: 0, y0: 0 };

  /* ══ textura: pintar el dibujo de papel proyectado sobre un plano ══ */
  function safeCtx(g) {
    const cl = g.createLinearGradient.bind(g),
      cr = g.createRadialGradient.bind(g),
      fin = (a) => a.every(Number.isFinite);
    g.createLinearGradient = (...a) => (fin(a) ? cl(...a) : cl(0, 0, 0, 1));
    g.createRadialGradient = (...a) => (fin(a) && a[2] >= 0 && a[5] >= 0 ? cr(...a) : cr(0, 0, 0, 0, 0, 1));
    return g;
  }
  function paint(w, h, proj, draw) {
    const c = newCanvas(w, h),
      g = safeCtx(c.getContext('2d'));
    const prev = window.PENPROJ;
    window.PENPROJ = proj;
    try {
      draw(g);
    } catch (e) {
      console.warn('3D paint', e);
    } finally {
      window.PENPROJ = prev;
    }
    return c;
  }
  const NAN = [NaN, NaN];
  const FH = R * Math.sin(Math.PI / 3) * K; /* medio alto del suelo en la vista oblicua */
  function floorTex(id, res, c = CELLS[id]) {
    const s = res / (2 * R),
      w = res,
      h = Math.round(2 * FH * s);
    return paint(
      w,
      h,
      (x, y, z, ox, oy, ps) => (z > 3 ? NAN : [ox + x * ps, oy + y * K * ps]),
      (g) => {
        const p = STYLE.Pen(g, R * s, FH * s, s, id + 'suelo');
        c.base(p);
        if (c.floor3) c.floor3(p);
      },
    );
  }
  const WALLH = HW + 30;
  function wallTex(id, e, res, c = CELLS[id]) {
    const A = VI[e[0]],
      B = VI[e[1]],
      L = Math.hypot(B[0] - A[0], B[1] - A[1]),
      dx = (B[0] - A[0]) / L,
      dy = (B[1] - A[1]) / L,
      m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2],
      ml = Math.hypot(...m),
      nx = -m[0] / ml,
      ny = -m[1] / ml;
    const s = res / L,
      w = res,
      h = Math.round(WALLH * s);
    return paint(
      w,
      h,
      (x, y, z, ox, oy, ps) => {
        const t = (x - A[0]) * dx + (y - A[1]) * dy,
          d = (x - A[0]) * nx + (y - A[1]) * ny;
        return d < -6 || d > 46 ? NAN : [ox + t * ps, oy - z * ps];
      },
      (g) => {
        const p = STYLE.Pen(g, 0, WALLH * s, s, id + 'pared' + e);
        c.base(p);
      },
    );
  }
  function tex(canvas, o = {}) {
    const t = new TH3.CanvasTexture(canvas);
    t.colorSpace = TH3.SRGBColorSpace;
    t.anisotropy = o.aniso || 4;
    if (o.nomip) {
      t.generateMipmaps = false;
      t.minFilter = TH3.LinearFilter;
    }
    return t;
  }

  /* ══ geometrías del cuarto ══ */
  const ANG = (k) => (k * Math.PI) / 3;
  function floorGeo() {
    const pos = [],
      uv = [],
      idx = [];
    pos.push(0, 0, 0);
    uv.push(0.5, 0.5);
    for (let k = 0; k < 6; k++) {
      const x = VI[k][0],
        y = VI[k][1];
      pos.push(x, 0, y);
      uv.push((x + R) / (2 * R), 1 - (y * K + FH) / (2 * FH));
    }
    for (let k = 0; k < 6; k++) idx.push(0, 1 + ((k + 1) % 6), 1 + k);
    const g = new TH3.BufferGeometry();
    g.setAttribute('position', new TH3.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new TH3.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  /* caja de caras con color por vértice: quads [[p0,p1,p2,p3],color] */
  function quadsGeo(quads) {
    const pos = [],
      col = [],
      idx = [];
    let n = 0;
    const cc = new TH3.Color();
    for (const [q, c] of quads) {
      cc.set(c);
      for (const v of q) {
        pos.push(v[0], v[1], v[2]);
        col.push(cc.r, cc.g, cc.b);
      }
      idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
      n += 4;
    }
    const g = new TH3.BufferGeometry();
    g.setAttribute('position', new TH3.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new TH3.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  const LIPCOL = { '0,1': '#D39A45', '1,2': '#E0AA52', '2,3': '#E9B861' };
  function slabGeo(c) {
    const Q = [];
    for (let k = 0; k < 6; k++) {
      const a = VO[k],
        b = VO[(k + 1) % 6],
        e = [k, (k + 1) % 6],
        front = FRONT.some((f) => f[0] === e[0] && f[1] === e[1]);
      const col = front ? LIPCOL[e.join(',')] || '#D39A45' : '#B87434';
      Q.push([
        [
          [a[0], -BASE, a[1]],
          [b[0], -BASE, b[1]],
          [b[0], 0, b[1]],
          [a[0], 0, a[1]],
        ],
        col,
      ]);
    }
    /* borde delantero con huecos para las puertas */
    for (const e of FRONT) {
      const segs = c.doors.some((d) => !d.back && d.e[0] === e[0] && d.e[1] === e[1])
        ? [
            [0, 0.5 - DOOR_W],
            [0.5 + DOOR_W, 1],
          ]
        : [[0, 1]];
      const pt = (V, u) => [lerp(V[e[0]][0], V[e[1]][0], u), lerp(V[e[0]][1], V[e[1]][1], u)];
      for (const [u0, u1] of segs) {
        const a = pt(VI, u0),
          b = pt(VI, u1),
          ao = pt(VO, u0),
          bo = pt(VO, u1),
          col = LIPCOL[e.join(',')] || '#D39A45';
        Q.push([
          [
            [a[0], 0, a[1]],
            [b[0], 0, b[1]],
            [b[0], LIP, b[1]],
            [a[0], LIP, a[1]],
          ],
          shade(col, 1.08),
        ]); /* cara interior */
        Q.push([
          [
            [a[0], LIP, a[1]],
            [b[0], LIP, b[1]],
            [bo[0], LIP, bo[1]],
            [ao[0], LIP, ao[1]],
          ],
          C.honey,
        ]); /* arriba */
        Q.push([
          [
            [bo[0], -BASE, bo[1]],
            [ao[0], -BASE, ao[1]],
            [ao[0], LIP, ao[1]],
            [bo[0], LIP, bo[1]],
          ],
          col,
        ]); /* cara exterior */
        for (const [p, po] of [
          [a, ao],
          [b, bo],
        ])
          Q.push([
            [
              [p[0], 0, p[1]],
              [po[0], 0, po[1]],
              [po[0], LIP, po[1]],
              [p[0], LIP, p[1]],
            ],
            shade(col, 0.9),
          ]);
      }
    }
    /* anillo superior del zócalo detrás de las paredes (para que no se vea hueco) */
    for (const e of BACK) {
      const a = VI[e[0]],
        b = VI[e[1]],
        ao = VO[e[0]],
        bo = VO[e[1]];
      Q.push([
        [
          [a[0], 0.2, a[1]],
          [b[0], 0.2, b[1]],
          [bo[0], 0.2, bo[1]],
          [ao[0], 0.2, ao[1]],
        ],
        C.honey,
      ]);
    }
    /* fondo */
    Q.push([
      [
        [VO[0][0], -BASE, VO[0][1]],
        [VO[1][0], -BASE, VO[1][1]],
        [VO[2][0], -BASE, VO[2][1]],
        [VO[3][0], -BASE, VO[3][1]],
      ],
      '#6A3A18',
    ]);
    Q.push([
      [
        [VO[0][0], -BASE, VO[0][1]],
        [VO[3][0], -BASE, VO[3][1]],
        [VO[4][0], -BASE, VO[4][1]],
        [VO[5][0], -BASE, VO[5][1]],
      ],
      '#6A3A18',
    ]);
    return quadsGeo(Q);
  }
  /* pared del fondo: contorno con el arco de la puerta abierto abajo, extruida hacia fuera */
  const DOOR_TOP = 76;
  function wallGeo(c, e) {
    const A = VI[e[0]],
      B = VI[e[1]],
      L = Math.hypot(B[0] - A[0], B[1] - A[1]),
      door = c.doors.find((d) => d.back && d.e[0] === e[0] && d.e[1] === e[1]);
    const ext = TH * Math.tan(Math.PI / 6) + 1;
    const sh = new TH3.Shape();
    sh.moveTo(-ext, 0);
    if (door) {
      const hw = DOOR_W,
        u = [0.5 - hw, 0.5 - hw, 0.5 - hw * 0.45, 0.5 + hw * 0.45, 0.5 + hw, 0.5 + hw],
        zz = [0, DOOR_TOP * 0.7, DOOR_TOP, DOOR_TOP, DOOR_TOP * 0.7, 0];
      sh.lineTo(u[0] * L, 0);
      sh.lineTo(u[1] * L, zz[1]);
      sh.quadraticCurveTo(u[1] * L, DOOR_TOP * 0.95, u[2] * L, zz[2]);
      sh.lineTo(u[3] * L, zz[3]);
      sh.quadraticCurveTo(u[4] * L, DOOR_TOP * 0.95, u[4] * L, zz[4]);
      sh.lineTo(u[5] * L, 0);
    }
    sh.lineTo(L + ext, 0);
    for (let k = WALLN; k >= 0; k--) {
      const u = k / WALLN;
      sh.lineTo(lerp(-ext, L + ext, u), HW + wallProf(u, e));
    }
    sh.lineTo(-ext, 0);
    const g = new TH3.ExtrudeGeometry(sh, { depth: TH, bevelEnabled: false, curveSegments: 8 });
    g.translate(0, 0, -TH);
    /* uv de las tapas: (t, z) → textura */
    const uv = g.attributes.uv,
      pos = g.attributes.position;
    for (let i = 0; i < uv.count; i++) {
      const x = pos.getX(i),
        y = pos.getY(i);
      uv.setXY(i, x / L, y / WALLH);
    }
    const dx = (B[0] - A[0]) / L,
      dy = (B[1] - A[1]) / L,
      M = new TH3.Matrix4();
    M.makeBasis(V3(dx, 0, dy), V3(0, 1, 0), V3(-dy, 0, dx));
    M.setPosition(A[0], 0, A[1]);
    g.applyMatrix4(M);
    return { g, door, L, A, dx, dy };
  }
  /* hojas de la puerta */
  let leafTexC = null;
  function leafTex() {
    if (leafTexC) return leafTexC;
    const c = newCanvas(64, 128),
      g = c.getContext('2d');
    g.fillStyle = '#D9974A';
    g.fillRect(0, 0, 64, 128);
    g.strokeStyle = '#A9682C';
    g.lineWidth = 3;
    for (const y of [34, 68, 100]) {
      g.beginPath();
      g.moveTo(8, y);
      g.lineTo(56, y);
      g.stroke();
    }
    g.fillStyle = '#6E3E17';
    g.beginPath();
    g.arc(50, 70, 5, 0, TAU);
    g.fill();
    return (leafTexC = tex(c));
  }

  /* ══ recortes de papel: cualquier dibujo de la pluma, de pie en el mundo ══ */
  function cardMesh(canvas, wU, hU, o = {}) {
    const t = tex(canvas, { nomip: o.nomip });
    const m = new (o.lit ? TH3.MeshLambertMaterial : TH3.MeshBasicMaterial)({
      map: t,
      transparent: true,
      depthWrite: !!o.depthWrite,
      alphaTest: o.alphaTest ?? 0.04,
      side: TH3.DoubleSide,
      fog: true,
    });
    if (o.add) {
      m.blending = TH3.AdditiveBlending;
      m.depthWrite = false;
    }
    const g = new TH3.PlaneGeometry(wU, hU);
    const mesh = new TH3.Mesh(g, m);
    mesh.userData.tex = t;
    mesh.renderOrder = 2;
    return mesh;
  }
  /* un recorte a partir de una caja oblicua bb=[x0,y0,x1,y1] (coordenadas de la celda) apoyado en la profundidad y */
  function propCard(id, pr, sb) {
    const b = bake(pr.bb, pr.draw, id + pr.id + '3d', sb);
    const wU = b.c.width / sb,
      hU = b.c.height / sb,
      cx = (pr.bb[0] + pr.bb[2]) / 2,
      gy = pr.y * K;
    const mesh = cardMesh(b.c, wU, hU);
    const top = gy - pr.bb[1],
      grp = new TH3.Group();
    mesh.position.set(0, top - hU / 2, 0);
    grp.add(mesh);
    grp.position.set(cx, 0, pr.y);
    grp.userData = { kind: 'prop', follow: 0.55 };
    return grp;
  }

  /* ══ tapa de cera para las celdas cerradas o sin visitar ══ */
  function lidMesh(id, locked) {
    const sh = new TH3.Shape();
    for (let k = 0; k < 6; k++) {
      const v = VO[k];
      k ? sh.lineTo(v[0], -v[1]) : sh.moveTo(v[0], -v[1]);
    }
    sh.closePath();
    const g = new TH3.ExtrudeGeometry(sh, { depth: 10, bevelEnabled: true, bevelSize: 6, bevelThickness: 5, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2);
    const c = newCanvas(256, 256),
      x = c.getContext('2d');
    x.fillStyle = locked ? '#C9A060' : C.wax;
    x.fillRect(0, 0, 256, 256);
    const R0 = rng('tapa' + id);
    for (let k = 0; k < 60; k++) {
      x.strokeStyle = `rgba(180,120,50,${0.08 + R0() * 0.08})`;
      x.lineWidth = 2;
      hexPath(x, R0() * 256, R0() * 256, 10 + R0() * 16, Math.PI / 6);
      x.stroke();
    }
    x.fillStyle = locked ? '#8A5A34' : SEASON[id].seal;
    x.font = '700 90px serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(locked ? '⬡' : SEASON[id].icon, 128, 134);
    const t = tex(c);
    const top = new TH3.MeshLambertMaterial({ map: t }),
      side = new TH3.MeshLambertMaterial({ color: locked ? '#B08040' : '#E8C06A' });
    const m = new TH3.Mesh(g, [top, side]);
    m.position.y = HW + 26;
    m.userData.lid = id;
    g.computeBoundingBox();
    /* uv de la tapa: planta */
    const uv = g.attributes.uv,
      pos = g.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + R + TH) / (2 * (R + TH)), (pos.getZ(i) + R + TH) / (2 * (R + TH)));
    return m;
  }

  /* ══ construir un cuarto ══ */
  const HI = () => (COARSE ? 896 : 1280),
    LO = () => (COARSE ? 320 : 384);
  function buildRoom(id, hi) {
    const c = CELLS[id],
      res = hi ? HI() : LO(),
      old = rooms[id];
    if (old) disposeRoom(id);
    const grp = new TH3.Group();
    grp.position.set(CW[id][0], 0, CW[id][1]);
    grp.userData.id = id;
    const mats = [];
    const sleep = isSeen(id) && !PUZ.cellLocked(id) && !isAwake(id) && !FREE,
      dz = (c) => {
        if (sleep) desat(c);
        return c;
      };
    const ft = tex(dz(floorTex(id, res))),
      fm = new TH3.MeshLambertMaterial({ map: ft });
    mats.push(fm);
    const floor = new TH3.Mesh(floorGeo(), fm);
    floor.userData.floor = id;
    grp.add(floor);
    if (LPON() && window.PROPS3D) {
      const tm = new TH3.MeshLambertMaterial({ map: ft, vertexColors: true, side: TH3.DoubleSide });
      mats.push(tm);
      const tl = new TH3.Mesh(PROPS3D.tilesGeo(), tm);
      tl.userData.tiles = 1;
      grp.add(tl);
    }
    const sm = new TH3.MeshLambertMaterial({ vertexColors: true });
    mats.push(sm);
    grp.add(new TH3.Mesh(slabGeo(c), sm));
    const walls = [];
    for (const e of BACK) {
      const W = wallGeo(c, e),
        wt = tex(dz(wallTex(id, e, Math.round(res * 0.5)))),
        wm = new TH3.MeshLambertMaterial({ map: wt }),
        side = new TH3.MeshLambertMaterial({ color: C.honey });
      mats.push(wm, side);
      const mesh = new TH3.Mesh(W.g, [wm, side]);
      grp.add(mesh);
      const w = { mesh, e, door: W.door, leaves: [] };
      if (W.door) {
        const hw = DOOR_W * W.L;
        for (const sd of [-1, 1]) {
          const pg = new TH3.PlaneGeometry(hw, DOOR_TOP * 0.98);
          pg.translate((-sd * hw) / 2, DOOR_TOP * 0.49, 0);
          const lm = new TH3.MeshLambertMaterial({ map: leafTex(), side: TH3.DoubleSide, color: sd < 0 ? '#FFFFFF' : '#F2E6D8' });
          mats.push(lm);
          const leaf = new TH3.Mesh(pg, lm);
          const hx = W.A[0] + W.dx * (W.L * (0.5 + sd * DOOR_W)),
            hy = W.A[1] + W.dy * (W.L * (0.5 + sd * DOOR_W));
          leaf.position.set(hx, 0, hy);
          leaf.rotation.y = Math.atan2(-W.dy, W.dx);
          leaf.userData = { sd, base: leaf.rotation.y };
          grp.add(leaf);
          w.leaves.push(leaf);
        }
      }
      walls.push(w);
    }
    const props = [];
    const sb = hi ? (COARSE ? 1.6 : 2.2) : 0.9,
      P3D = LPON() && window.PROPS3D;
    for (const pr of c.props) {
      try {
        if (P3D && PROPS3D.has(pr.id)) {
          const pc = PROPS3D.make(id, pr);
          grp.add(pc);
          props.push(pc);
          continue;
        }
        const pc = propCard(id, pr, sb);
        grp.add(pc);
        props.push(pc);
        pc.traverse((o) => {
          if (o.material) mats.push(o.material);
        });
      } catch (e) {
        console.warn('prop', id, pr.id, e);
      }
    }
    /* carteles de las puertas delanteras: se mecen un poco */
    const signs = [];
    for (const d of c.doors) {
      const at = STYLE.signAt(d);
      if (!at) continue;
      const [x, y, z] = at,
        yw = y * K - z;
      try {
        const sc = propCard(
          id,
          { id: 's' + d.to, y, bb: [x - 40, yw - 70, x + 40, yw + 14], draw: (p) => STYLE.sign(p, d, CELLS[d.to], x, y, z) },
          sb,
        );
        sc.userData.sway = d.dir ? d.dir[0] * 2 + d.dir[1] : signs.length;
        grp.add(sc);
        signs.push(sc);
        sc.traverse((o) => {
          if (o.material) mats.push(o.material);
        });
      } catch (e) {
        console.warn('cartel', id, e);
      }
    }
    const deco = P3D && PROPS3D.room ? PROPS3D.room(id) : null;
    if (deco) grp.add(deco);
    const R_ = { id, grp, hi, mats, walls, props, signs, deco, npc: null, lid: null, key: roomKey(id), t: T };
    rooms[id] = R_;
    scene.add(grp);
    try {
      roomWorld(R_);
    } catch (e) {
      console.warn('umbral', id, e);
    }
    npcCard(R_);
    updateLid(R_);
    blockers(R_, true);
    tintRoom(R_);
    return R_;
  }
  function disposeRoom(id) {
    const r = rooms[id];
    if (!r) return;
    if (DEC && DEC.mesh.parent === r.grp) r.grp.remove(DEC.mesh);
    scene.remove(r.grp);
    r.grp.traverse((o) => {
      if (o.geometry && !o.isSprite && o.geometry !== BLOBG && !o.geometry.userData.shared) o.geometry.dispose();
      const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of ms) {
        if (m === BLOBM || m.userData.shared) continue;
        if (m.map && m.map !== leafTexC && !m.map.userData.shared) m.map.dispose();
        m.dispose();
      }
    });
    delete rooms[id];
  }
  const roomKey = (id) =>
    (VIS[id] ? VIS[id]() : '') +
    '|' +
    (isSeen(id) ? 1 : 0) +
    '|' +
    (PUZ.cellLocked(id) ? 1 : 0) +
    '|' +
    (isAwake(id) ? 1 : 0) +
    (FREE ? 'f' : '');

  /* ── el vecino: recorte animado ── */
  const NPCBOX = [-90, -190, 90, 40];
  function drawFigure(canvas, sb, box, draw) {
    const g = canvas.getContext('2d');
    g.clearRect(0, 0, canvas.width, canvas.height);
    const p = STYLE.Pen(g, -box[0] * sb, -box[1] * sb, sb, 'vol', true, true);
    p.noShadow = true;
    draw(p);
  }
  /* ── figuras low-poly 3D (si se apagan con colmena-lp=0, vuelven los recortes) ── */
  const LPON = () => {
    if (!window.LP3D) return false;
    try {
      return localStorage.getItem('colmena-lp') !== '0';
    } catch (e) {
      return true;
    }
  };
  const NPCM = {},
    SCARF3 = {};
  let FDT = 1 / 60;
  /* personajes: papel (por defecto) o 3D low-poly; el mundo 3D (muebles, baldosas, noche) no cambia */
  const CH3D = () => {
    if (!LPON()) return false;
    if (window.COLMENA_ADULTO) return true;
    try {
      return localStorage.getItem('colmena-chars') === '3d';
    } catch (e) {
      return false;
    }
  };
  /* papel mejorado: cartón con grosor y luz del cuarto (sin peana: los pies tocan el suelo) */
  function paperDress(grp, mesh, k, mats) {
    const back = new TH3.Mesh(mesh.geometry, mesh.material.clone());
    back.material.color.set('#A8875A');
    back.material.userData.base = null;
    back.position.copy(mesh.position);
    back.position.z -= 2.8;
    back.position.y += 0.4;
    back.renderOrder = mesh.renderOrder;
    back.userData.cardBack = 1;
    grp.add(back);
    if (mats) mats.push(back.material);
    return back;
  }
  function npcModel(id) {
    if (id in NPCM) return NPCM[id];
    const H = typeof HUMANS !== 'undefined' && HUMANS[id];
    let m = null;
    if (H)
      try {
        {
          m = LP3D.human(LP3D.fromHuman(id, H));
          if (m.S.pose === 'sit' && !(window.PROPS3D && CELLS[id].props.some((p) => PROPS3D.has(p.id) && /sillon|trono|banco/.test(p.id))))
            LP3D.front(m);
        }
      } catch (e) {
        console.warn('lp3d', id, e);
      }
    return (NPCM[id] = m);
  }
  function npcModelCard(r, n, M) {
    const sh = new TH3.Mesh(blobGeo(), blobMat());
    sh.rotation.x = -Math.PI / 2;
    sh.scale.setScalar(M.S.k || 1);
    sh.position.set(n.x, 0.8, n.y);
    sh.renderOrder = 1;
    sh.visible = M.S.pose !== 'lie';
    r.grp.add(sh);
    r.grp.add(M.root);
    M.root.position.set(n.x, 0, n.y);
    if (M.S.floorScarf) {
      let sc = SCARF3[r.id];
      if (!sc) {
        const path = [
          [12, 8],
          [30, 30],
          [60, 52],
          [110, 60],
          [160, 48],
          [200, 20],
          [230, -10],
          [235, -50],
          [205, -80],
          [160, -92],
        ];
        sc = SCARF3[r.id] = LP3D.ribbon(
          path.map(([dx, dy]) => [n.x + dx, 3.2, n.y + dy]),
          4.6,
          C.petalD,
          C.cream,
        );
      }
      r.grp.add(sc);
    }
    r.npc = { lp: M, sh, last: -1, px: n.x, py: n.y, hd: Math.atan2(n.f ?? 1, 1.1), lt: T };
    drawNpc(r, true);
  }
  function npcCard(r) {
    const n = CELLS[r.id].npc;
    if (!n || !n.draw) return;
    {
      const M = CH3D() && npcModel(r.id);
      if (M) {
        npcModelCard(r, n, M);
        return;
      }
    }
    const sb = r.hi ? (COARSE ? 1.8 : 2.4) : 1.1,
      box = NPCBOX,
      w = Math.round((box[2] - box[0]) * sb),
      h = Math.round((box[3] - box[1]) * sb);
    const cvn = newCanvas(w, h);
    const LITC = LPON(),
      mesh = cardMesh(cvn, w / sb, h / sb, { nomip: true, lit: LITC });
    mesh.renderOrder = 2;
    const grp = new TH3.Group();
    mesh.position.set(0, -box[1] - h / sb / 2, 0);
    grp.add(mesh);
    grp.position.set(n.x, 0, n.y);
    grp.userData = { kind: 'npc', follow: 1 };
    r.grp.add(grp);
    r.mats.push(mesh.material);
    if (LITC && HUM(r.id) && HUM(r.id).pose !== 'lie') paperDress(grp, mesh, HUM(r.id).k || 1, r.mats);
    const sh = new TH3.Mesh(blobGeo(), blobMat());
    sh.rotation.x = -Math.PI / 2;
    sh.position.set(n.x, 0.8, n.y);
    sh.renderOrder = 1;
    r.grp.add(sh);
    r.npc = { grp, mesh, cvn, sb, box, last: -1, sh };
    drawNpc(r, true);
  }
  let BLOBG = null,
    BLOBM = null;
  const blobGeo = () => BLOBG || (BLOBG = new TH3.CircleGeometry(20, 20).scale(1, 0.62, 1)),
    blobMat = () => BLOBM || (BLOBM = new TH3.MeshBasicMaterial({ color: '#3A2010', transparent: true, opacity: 0.26, depthWrite: false }));
  function drawNpc(r, force) {
    const N = r.npc;
    if (!N) return;
    const n = CELLS[r.id].npc,
      live = r.id === cur;
    if (N.lp) {
      const M = N.lp,
        S = M.S,
        H = (typeof HUM === 'function' && HUM(r.id)) || {},
        dt = Math.min(0.1, Math.max(0, T - N.lt));
      N.lt = T;
      let tg = Math.atan2(n.f ?? 1, 1.1);
      if (S.pose === 'lie') tg = 0;
      else if (S.pose === 'sit') tg = Math.atan2(n.f ?? 1, 1.4);
      else if (live) {
        const dx = n.x - N.px,
          dy = n.y - N.py;
        if (n._walk && Math.hypot(dx, dy) > 0.01) tg = Math.atan2(dx, dy);
        else if (n._lookF) tg = Math.atan2(n._lookF, 0.9);
        else if (n.turn !== false && Math.hypot(Pl.x - n.x, Pl.y - n.y) < 230)
          tg = LP3D.turn(Math.atan2(Pl.x - n.x, Pl.y - n.y), CAM.yaw, 0.3);
      }
      N.hd = force || STILL ? tg : LP3D.turn(N.hd, tg, Math.min(1, dt * 7));
      N.px = n.x;
      N.py = n.y;
      M.root.position.set(n.x, 0, n.y);
      M.root.rotation.y = N.hd;
      if (live || force)
        LP3D.animate(M, {
          t: STILL ? 0 : T,
          dt,
          walk: live ? H._mv || 0 : 0,
          ph: H._ph || 0,
          wave: live ? H._wave || 0 : 0,
          use: live ? H._use || 0 : 0,
          nod: live ? H._nod || 0 : 0,
          ex: n.idle || 'smile',
          still: STILL || !live,
        });
      if (N.sh) N.sh.position.set(n.x + 4, 0.8, n.y + 3);
      return;
    }
    if (!force && (!live || T - N.last < 1 / (n._walk || talking ? (COARSE ? 20 : 30) : COARSE ? 10 : 16))) return;
    N.last = T;
    const nf =
      live && n._walk
        ? n._wf
        : live && n._lookF
          ? n._lookF
          : live && n.turn !== false && Math.hypot(Pl.x - n.x, Pl.y - n.y) < 230
            ? Pl.x >= n.x
              ? 1
              : -1
            : (n.f ?? 1);
    drawFigure(N.cvn, N.sb, N.box, (p) => {
      p.g.save();
      p.g.translate(-n.x * N.sb, -n.y * K * N.sb);
      n.draw(p, n.x, n.y, nf, STILL || !live ? 0 : T, n.idle || 'smile', false);
      p.g.restore();
    });
    N.mesh.material.map.needsUpdate = true;
    N.grp.position.set(n.x, live && talking && !STILL ? Math.abs(Math.sin(T * 8)) * 2.6 : 0, n.y);
    if (N.sh) N.sh.position.set(n.x + 6, 0.8, n.y + 4);
  }
  /* ── tú: recorte animado ── */
  let player = null;
  const PBOX = [-60, -150, 60, 24];
  function playerCard() {
    const sb = COARSE ? 2 : 2.6,
      w = Math.round((PBOX[2] - PBOX[0]) * sb),
      h = Math.round((PBOX[3] - PBOX[1]) * sb),
      c = newCanvas(w, h),
      LITC = LPON();
    const mesh = cardMesh(c, w / sb, h / sb, { nomip: true, lit: LITC });
    const grp = new TH3.Group();
    mesh.position.set(0, -PBOX[1] - h / sb / 2, 0);
    grp.add(mesh);
    scene.add(grp);
    const sh = new TH3.Mesh(
      new TH3.CircleGeometry(18, 20),
      new TH3.MeshBasicMaterial({ color: '#3A2010', transparent: true, opacity: 0.28, depthWrite: false }),
    );
    sh.rotation.x = -Math.PI / 2;
    sh.scale.set(1, 0.45, 1);
    sh.renderOrder = 1;
    scene.add(sh);
    if (LITC) paperDress(grp, mesh, 1);
    player = { grp, mesh, c, sb, sh, last: -1, lit: LITC };
  }
  let PLM = null,
    PLK = '';
  function playerModel() {
    const k = JSON.stringify(AVATAR);
    if (PLM && PLK === k) return PLM;
    if (PLM && PLM.root.parent) PLM.root.parent.remove(PLM.root);
    PLK = k;
    PLM = LP3D.human(LP3D.fromAvatar(AVATAR));
    PLM.hd = Math.atan2(1, 1.2);
    PLM.ph = 0;
    return PLM;
  }
  function heldSprite(M, held) {
    if (M.heldK === held) return;
    M.heldK = held;
    if (M.jar) {
      if (!M.jarM) {
        M.jarM = new TH3.MeshBasicMaterial({ color: '#EBF5F8' });
        M.jar.material = M.jarM;
      }
      M.jarM.color.set((held && typeof ITEM_GLOW !== 'undefined' && ITEM_GLOW[held]) || '#EBF5F8');
    }
    if (M.heldS) {
      M.heldS.parent && M.heldS.parent.remove(M.heldS);
      M.heldS.material.map.dispose();
      M.heldS.material.dispose();
      M.heldS = null;
    }
    if (!held) return;
    const n = 96,
      c = newCanvas(n, n),
      g = c.getContext('2d');
    try {
      const p = STYLE.Pen(g, n / 2, n * 0.6, n / 38, 'tok3', true, true);
      p.noShadow = true;
      STYLE.token(p, 0, 0, 0, held, 0, true);
    } catch (e) {}
    const sp = new TH3.Sprite(new TH3.SpriteMaterial({ map: tex(c, { nomip: true }), transparent: true, depthWrite: false }));
    sp.scale.setScalar(0.46);
    sp.position.set(0, 0.1, 0.12);
    sp.renderOrder = 3;
    M.AR.it.add(sp);
    M.heldS = sp;
  }
  function drawPlayer3() {
    const dt = FDT;
    if (!player || !player.lp) {
      if (player) {
        scene.remove(player.grp);
        scene.remove(player.sh);
      }
      const grp = new TH3.Group();
      scene.add(grp);
      const sh = new TH3.Mesh(
        new TH3.CircleGeometry(18, 20),
        new TH3.MeshBasicMaterial({ color: '#3A2010', transparent: true, opacity: 0.28, depthWrite: false }),
      );
      sh.rotation.x = -Math.PI / 2;
      sh.scale.set(1, 0.55, 1);
      sh.renderOrder = 1;
      scene.add(sh);
      player = { grp, sh, lp: true, walk: 0 };
    }
    const P = player,
      M = playerModel();
    if (M.root.parent !== P.grp) P.grp.add(M.root);
    const w = worldOf(cur, Pl.x, Pl.y, Pl.z || 0);
    w.y += playerLift() - lift(cur);
    const dx = w.x - (P.wx ?? w.x),
      dz = w.z - (P.wz ?? w.z),
      mv = Math.hypot(dx, dz);
    P.wx = w.x;
    P.wz = w.z;
    let tg = M.hd;
    if (mv > 0.15 && mv < 60) tg = Math.atan2(dx, dz);
    else if (talking && !Pl.moving) {
      const n = CELLS[cur].npc;
      if (n) tg = LP3D.turn(Math.atan2(n.x - Pl.x, n.y - Pl.y), CAM.yaw, 0.38);
    } else if (mv <= 0.15 && !Pl.moving && P.f !== Pl.f) {
      tg = Math.atan2(Pl.f || 1, 1.2);
    }
    P.f = Pl.f;
    M.hd = STILL ? tg : LP3D.turn(M.hd, tg, Math.min(1, dt * 11));
    const moving = Pl.moving || (crossing && mv > 0.15 && !crossing.basket);
    P.walk = lerp(P.walk, moving ? 1 : 0, Math.min(1, dt * 9));
    if (P.walk > 0.02) M.ph += dt * 10.5 * (Pl.run ? 1.6 : 1);
    let held = null;
    try {
      if (PROG.hand && T >= handHideUntil) held = PROG.hand;
    } catch (e) {}
    heldSprite(M, held);
    LP3D.animate(M, { t: T, dt, walk: P.walk, ph: M.ph, ex: Pl.ex || 'smile', held: !!held, still: STILL });
    P.grp.position.copy(w);
    P.grp.rotation.y = M.hd;
    P.sh.position.set(w.x, playerLift() + 0.6, w.z);
    P.sh.visible = !Pl.onPath;
    P.grp.visible = !inTitle;
  }
  function drawPlayer() {
    if (CH3D()) {
      drawPlayer3();
      return;
    }
    if (player && !player.lp && !!player.lit !== LPON()) {
      scene.remove(player.grp);
      scene.remove(player.sh);
      player = null;
    }
    if (player && player.lp) {
      scene.remove(player.grp);
      scene.remove(player.sh);
      player = null;
    }
    if (!player) playerCard();
    const P = player;
    if (T - P.last >= 1 / (Pl.moving || crossing || talking ? (COARSE ? 24 : 40) : COARSE ? 10 : 16)) {
      P.last = T;
      drawFigure(P.c, P.sb, PBOX, (p) => STYLE.player(p, 0, 0, 0, Pl.f, T, Pl.moving));
      P.mesh.material.map.needsUpdate = true;
    }
    const w = worldOf(cur, Pl.x, Pl.y, Pl.z || 0);
    w.y += playerLift() - lift(cur);
    P.grp.position.copy(w);
    P.sh.position.set(w.x, playerLift() + 0.6, w.z);
    P.sh.visible = !Pl.onPath;
    P.grp.visible = !inTitle;
    /* títere: se balancea un poco al andar */ P.wob = lerp(P.wob || 0, Pl.moving && !STILL ? 1 : 0, 0.15);
    P.grp.rotation.z = Math.sin(T * 11) * 0.04 * P.wob;
  }

  /* ── luz y color de cada cuarto ── */
  function tintRoom(r) {
    const id = r.id;
    let k = 1,
      sat = 1;
    if (!isSeen(id) || PUZ.cellLocked(id)) k = 0.62;
    else if (!isAwake(id)) k = 0.78;
    const bg = id !== cur && !mapMode && !crossing && !inTitle;
    if (id !== cur) k *= bg ? 0.36 : 0.9;
    /* las vecinas, de fondo: más oscuras y algo más frías para que tu cuarto destaque */
    const col = bg ? new TH3.Color(k * 0.96, k * 0.97, k * 1.06) : new TH3.Color(k, k, k * 0.97),
      kb = id === cur ? lerp(1, AMB, 0.8) : 1,
      colB = new TH3.Color(k * kb, k * kb, k * kb * 0.98);
    for (const m of r.mats) {
      if (!m.userData.base) m.userData.base = m.color.clone();
      m.color.copy(m.userData.base).multiply(m.isMeshBasicMaterial ? colB : col);
    }
    r.k = k;
  }
  function updateLid(r) {
    const id = r.id,
      need = (!isSeen(id) || PUZ.cellLocked(id)) && !FREE;
    if (need && !r.lid) {
      r.lid = lidMesh(id, PUZ.cellLocked(id));
      r.grp.add(r.lid);
    } else if (!need && r.lid) {
      r.grp.remove(r.lid);
      r.lid.geometry.dispose();
      r.lid = null;
    }
  }

  /* ══ montar la escena ══ */
  function init() {
    if (renderer) return true;
    cv3 = document.createElement('canvas');
    cv3.id = 'cv3';
    cv3.setAttribute('aria-hidden', 'true');
    cv3.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    cv.before(cv3);
    {
      const nb = document.createElement('div');
      nb.id = 'night3d';
      nb.setAttribute('aria-hidden', 'true');
      nb.style.cssText =
        'position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(120% 90% at 50% 42%,#2A1F33 0%,#1B1424 55%,#0E0A14 100%)';
      cv3.before(nb);
      NBG = { el: nb, o: 0 };
    }
    try {
      renderer = new TH3.WebGLRenderer({
        canvas: cv3,
        antialias: !COARSE,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      });
    } catch (e) {
      console.warn('WebGL', e);
      cv3.remove();
      Q.ok = false;
      return false;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = TH3.SRGBColorSpace;
    scene = new TH3.Scene();
    fog = new TH3.Fog(0xf0ce96, 1500, 6000);
    scene.fog = fog;
    /* el papel del fondo: hexágonos claros apenas marcados */
    {
      const n = 420,
        c = newCanvas(n, n),
        g = c.getContext('2d'),
        R0 = rng('fondo3d');
      for (let k = 0; k < 16; k++) {
        const x = R0() * n,
          y = R0() * n,
          r = 26 + R0() * 70;
        g.strokeStyle = `rgba(255,255,255,${0.16 + R0() * 0.14})`;
        g.lineWidth = 1.5 + R0() * 2;
        hexPath(g, x, y, r, Math.PI / 6);
        g.stroke();
        if (R0() < 0.35) {
          g.fillStyle = 'rgba(255,250,235,.10)';
          g.fill();
        }
      }
      for (let k = 0; k < 40; k++) {
        g.fillStyle = `rgba(255,255,250,${0.25 + R0() * 0.4})`;
        g.beginPath();
        g.arc(R0() * n, R0() * n, 0.7 + R0() * 1.3, 0, TAU);
        g.fill();
      }
      try {
        document.body.style.setProperty('--tile3d', `url(${c.toDataURL('image/png')})`);
      } catch (e) {}
    }
    camera = new TH3.PerspectiveCamera(30, 1, 20, 40000);
    hemi = new TH3.HemisphereLight(0xfff1d6, 0x7a4a26, 2.3);
    scene.add(hemi);
    sun = new TH3.DirectionalLight(0xfff4e0, 1.5);
    sun.position.set(-0.45, 1, 0.75);
    scene.add(sun);
    lamp = new TH3.PointLight(0xffc070, 0, 520, 1.4);
    scene.add(lamp);
    built = true;
    return true;
  }
  function resize() {
    if (!renderer) return;
    const pr = Math.min(window.devicePixelRatio || 1, COARSE ? 1.5 : 1.75) * Q.scale;
    renderer.setPixelRatio(pr);
    renderer.setSize(cv.clientWidth, cv.clientHeight, false);
    camera.aspect = cv.clientWidth / Math.max(1, cv.clientHeight);
    camera.updateProjectionMatrix();
  }
  Q.scale = 1;

  /* ── posiciones en el mundo ── */
  /* los cuartos que quedan delante del tuyo se pliegan hacia la niebla para no taparlo */
  const SINKV = {};
  /* pisos: cada racimo vive a una altura según su lugar en la historia (solo en 3D) */
  const LV_H = 210,
    LEVELS = {
      inn: 2,
      far: 2,
      tre: 2,
      tea: 2,
      esp: 2,
      dsv: 1,
      est: 1,
      ret: 1,
      jar: 1,
      sot: -1,
      cue: -1,
      vol: -1,
      cum: -1,
      oce: -1,
      des: -1,
      ant: -1,
      cor: -2,
      and: -3,
      eco: -3,
      per: -3,
      api: -3,
      rev: -3,
    };
  const lvl = (id) => (window.FREE_FLAT ? 0 : LEVELS[id] || 0) * LV_H;
  const lift = (id) => lvl(id) - (window.CDY ? CDY(id) : 0) - (SINKV[id] || 0);
  function sinkTick(dt) {
    const e = inTitle ? 0 : (CAM.e ?? 0),
      dx0 = Math.sin(CAM.yaw),
      dz0 = Math.cos(CAM.yaw),
      busy = crossing ? [crossing.from, cur] : [cur];
    for (const id of ORDER) {
      let tg = 0;
      if (!busy.includes(id) && e > 0) {
        const dx = CW[id][0] - CW[cur][0],
          dz = CW[id][1] - CW[cur][1],
          f = dx * dx0 + dz * dz0;
        tg = 270 * clamp((f - 120) / 240, 0, 1) * e;
      }
      const v = SINKV[id] || 0;
      SINKV[id] = STILL ? tg : lerp(v, tg, Math.min(1, dt * (busy.includes(id) ? 9 : 3.5)));
      if (Math.abs(SINKV[id]) < 0.3) SINKV[id] = 0;
    }
  }
  function playerLift() {
    if (!crossing) return lift(cur);
    return lerp(lift(crossing.from), lift(cur), clamp(crossing.t / Math.max(0.01, crossing.dur), 0, 1));
  }
  function worldOf(id, x, y, z) {
    return V3(CW[id][0] + x, z + lift(id), CW[id][1] + y);
  }
  const HIVE = (() => {
    let x0 = 1e9,
      x1 = -1e9,
      y0 = 1e9,
      y1 = -1e9;
    for (const id of ORDER) {
      const [x, y] = CW[id];
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
    return { x0, x1, y0, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0 + 800, d: y1 - y0 + 800 };
  })();

  /* ── cámara ── */
  function roomFit() {
    const a = camera.aspect,
      v = Math.tan((camera.fov * Math.PI) / 360),
      h = Math.atan(v * a);
    const dw = 390 / Math.tan(h),
      dh = 250 / v;
    return Math.max(dw, dh) * (OPT.imm ? 0.82 : 1.1);
  }
  /* el mapa encuadra solo los cuartos que ya están arriba */
  function hiveNow() {
    let x0 = 1e9,
      x1 = -1e9,
      y0 = 1e9,
      y1 = -1e9;
    for (const id of ORDER) {
      if (window.CHIDE && CHIDE(id) && id !== cur) continue;
      const [x, y] = CW[id];
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0 + 900, d: y1 - y0 + 900 };
  }
  function mapFit(Hv) {
    const a = camera.aspect,
      v = Math.tan((camera.fov * Math.PI) / 360),
      h = Math.atan(v * a);
    return Math.max(Hv.w / 2 / Math.tan(h), (Hv.d * 0.55) / v, 1900) * 1.02;
  }
  const TVD = { dx: 0, dz: 1 };
  function camUpdate(dt) {
    const zf = Math.max(1.05, ZF),
      t = clamp((Z - 1) / (zf - 1), 0, 1),
      e = t * t * (3 - 2 * t);
    const rc = CW[cur],
      pw = worldOf(cur, Pl.x, Pl.y, 0);
    let tx = rc[0],
      tz = rc[1],
      ty = lift(cur) + 30;
    const close = Z > zf * 1.01 ? clamp((Z / zf - 1) * 2, 0, 1) : 0;
    tx = lerp(tx, pw.x, 0.18 + 0.35 * close);
    tz = lerp(tz, pw.z, 0.12 + 0.35 * close);
    if (crossing && crossing.long) {
      tx = pw.x;
      tz = pw.z;
      ty = playerLift() + (Pl.z || 0) + 20;
    }
    /* cámara de viaje: se eleva, mira de lado y adelanta un poco hacia donde vas */
    let tvS = 0;
    if (crossing && crossing.long && !mapMode && !STILL) {
      const u = clamp(crossing.t / Math.max(0.01, crossing.dur), 0, 1);
      tvS = Math.sin(Math.PI * clamp(u * 1.12 - 0.06, 0, 1));
      if (crossing.hold) tvS *= 0.4;
      const vx = pw.x - (TVD.x ?? pw.x),
        vz = pw.z - (TVD.z ?? pw.z),
        m = Math.hypot(vx, vz);
      if (m > 0.3 && m < 80) {
        const k = Math.min(1, dt * 3);
        TVD.dx = lerp(TVD.dx, vx / m, k);
        TVD.dz = lerp(TVD.dz, vz / m, k);
      }
      TVD.x = pw.x;
      TVD.z = pw.z;
      tx += TVD.dx * 55 * tvS;
      tz += TVD.dz * 55 * tvS;
    } else {
      TVD.x = TVD.z = undefined;
    }
    if (talking && !mapMode) {
      const n = CELLS[cur].npc;
      tx = lerp(tx, rc[0] + (Pl.x + n.x) / 2, 0.6);
      tz = lerp(tz, rc[1] + (Pl.y + n.y) / 2, 0.6);
    }
    if (inTitle) {
      const Hv = hiveNow(),
        d = mapFit(Hv) * 0.62,
        yaw = Math.sin(T * 0.045) * 0.55,
        pitch = 0.72 + Math.sin(T * 0.07) * 0.06,
        k = CAM.ready ? Math.min(1, dt * 1.5) : 1;
      CAM.e = 0;
      CAM.tx = lerp(CAM.tx, Hv.cx, k);
      CAM.tz = lerp(CAM.tz, Hv.cy + 150, k);
      CAM.ty = lerp(CAM.ty, 0, k);
      CAM.dist = lerp(CAM.dist, d, k);
      CAM.pitch = lerp(CAM.pitch, pitch, k);
      CAM.yaw = lerp(CAM.yaw, yaw, k);
      CAM.ready = true;
      placeCam(0);
      return;
    }
    const Hv = hiveNow(),
      dRoom = (roomFit() * zf) / Math.max(Z, zf) / Math.max(0.4, ZK),
      dMap = mapFit(Hv);
    let dist = Z >= zf ? dRoom : lerp(dMap, dRoom, e);
    dist *= 1 + 0.3 * tvS + (window.TRAVZ ? TRAVZ() : 0);
    const X = lerp(Hv.cx, tx, e),
      Zc = lerp(Hv.cy, tz, e),
      Y = lerp(0, ty, e);
    CAM.e = e;
    const pitchBase = lerp(0.82, 0.56, e),
      pitch = clamp(CAM.pitchT + (pitchBase - 0.56) + 0.1 * tvS, 0.28, 1.35);
    let yaw = CAM.yawT;
    if (tvS > 0) {
      const L = Math.hypot(TVD.dx, TVD.dz) || 1,
        px = TVD.dz / L,
        pz = -TVD.dx / L,
        df = (a) => {
          let d = a - yaw;
          while (d > Math.PI) d -= TAU;
          while (d < -Math.PI) d += TAU;
          return d;
        },
        d1 = df(Math.atan2(px, pz)),
        d2 = df(Math.atan2(-px, -pz));
      yaw += (Math.abs(d1) < Math.abs(d2) ? d1 : d2) * 0.55 * tvS;
    }
    const k = CAM.ready ? Math.min(1, dt * 6) : 1;
    CAM.tx = lerp(CAM.tx, X, k);
    CAM.tz = lerp(CAM.tz, Zc, k);
    CAM.ty = lerp(CAM.ty, Y, k);
    CAM.dist = CAM.ready ? lerp(CAM.dist, dist, Math.min(1, dt * 5)) : dist;
    CAM.pitch = lerp(CAM.pitch, pitch, k);
    CAM.yaw = lerp(CAM.yaw, yaw, k);
    CAM.ready = true;
    placeCam(e);
  }
  function placeCam(e) {
    const cp = Math.cos(CAM.pitch);
    camera.position.set(
      CAM.tx + Math.sin(CAM.yaw) * cp * CAM.dist,
      CAM.ty + Math.sin(CAM.pitch) * CAM.dist,
      CAM.tz + Math.cos(CAM.yaw) * cp * CAM.dist,
    );
    camera.lookAt(CAM.tx, CAM.ty, CAM.tz);
    camera.near = Math.max(10, CAM.dist * 0.05);
    camera.far = CAM.dist * 8 + 8000;
    camera.updateProjectionMatrix();
    fog.near = CAM.dist * lerp(2.4, 1.1, e);
    fog.far = CAM.dist * lerp(5.5, 3.2, e) + 2200;
  }

  /* ══ cada fotograma ══ */
  let lastBuild = 0;
  function ensureRooms() {
    const want = new Set([cur, ...CELLS[cur].doors.map((d) => d.to)]);
    let budget = 1;
    /* el cuarto actual, siempre nítido; los vecinos, pronto */
    for (const id of [cur, ...CELLS[cur].doors.map((d) => d.to)]) {
      const r = rooms[id];
      if (!r || (id === cur && !r.hi) || r.key !== roomKey(id)) {
        if (budget-- > 0 || id === cur) {
          buildRoom(id, id === cur || (r && r.hi));
        }
      }
    }
    if (budget > 0 && T - lastBuild > (COARSE ? 0.14 : 0.07))
      for (const id of DRAW) {
        if (!rooms[id] && (!COARSE || mapMode || (window.NEARROOM ? NEARROOM(id) : true))) {
          buildRoom(id, false);
          lastBuild = T;
          break;
        }
      }
    /* los cuartos lejanos vuelven a baja resolución */
    if (T - lastBuild > 0.2)
      for (const id in rooms) {
        const r = rooms[id];
        if (r.hi && !want.has(id) && T - r.t > 2) {
          buildRoom(id, false);
          lastBuild = T;
          break;
        }
      }
  }
  let blkT = 0,
    lastCur = null;
  /* la noche de los cuartos dormidos: menos luz general y charcos de luz en las lámparas */
  let AMB = 1,
    AMBt = 1;
  const PL4 = [];
  /* noche del prototipo: más oscuro, luz fría y un fondo de panal en penumbra; el farol manda */
  const NIGHT = () => LPON();
  let NBG = null;
  const HEMI_DAY = new TH3.Color(0xfff1d6),
    HEMI_NIGHT = new TH3.Color(0x8e95c8);
  const FOG_DAY = new TH3.Color(0xf0ce96),
    FOG_NIGHT = new TH3.Color(0x1e1628);
  function darkTick(dt) {
    if (!PL4.length)
      for (let i = 0; i < (COARSE ? 2 : 4); i++) {
        const l = new TH3.PointLight(0xffc47a, 0, 300, 1.2);
        scene.add(l);
        PL4.push(l);
      }
    const dl = inTitle || mapMode ? 0 : (typeof darkLevel === 'function' ? darkLevel(cur) : 0) * (STILL ? 0.8 : 1),
      beat = typeof beatK === 'function' ? beatK() : 0,
      tg = 1 - clamp(dl - beat * 0.18, 0, 1) * (NIGHT() ? 1.25 : 0.8);
    AMB = STILL ? tg : lerp(AMB, tg, Math.min(1, dt * 1.6));
    hemi.intensity = 2.3 * AMB;
    sun.intensity = 1.5 * AMB * (NIGHT() ? AMB : 1);
    if (NIGHT()) {
      const nk = clamp((1 - AMB) * 1.4, 0, 1);
      hemi.color.copy(HEMI_DAY).lerp(HEMI_NIGHT, nk);
      if (fog && !MD.on) {
        fog.color.copy(FOG_DAY).lerp(FOG_NIGHT, nk);
      }
      if (NBG) {
        const o = clamp((1 - AMB) * 1.45, 0, 0.9);
        if (Math.abs(o - NBG.o) > 0.005) {
          NBG.o = o;
          NBG.el.style.opacity = o.toFixed(3);
        }
      }
    }
    const Ls = (typeof LIGHTS !== 'undefined' && LIGHTS[cur]) || [],
      on = 1 - AMB;
    for (let i = 0; i < PL4.length; i++) {
      const l = PL4[i],
        L = Ls[i];
      if (L && on > 0.02) {
        l.position.copy(worldOf(cur, L[0], L[1], L[2]));
        l.distance = L[3] * 2.4;
        l.intensity = on * 4.2 * (STILL ? 1 : 1 + Math.sin(T * 2.3 + L[0]) * 0.05);
      } else l.intensity = 0;
    }
    if (Math.abs(AMB - AMBt) > 0.01) {
      AMBt = AMB;
      if (rooms[cur]) tintRoom(rooms[cur]);
      const kb = lerp(1, AMB, 0.8);
      for (const P of [player, POMC])
        if (P && P.mesh && P.mesh.material.isMeshBasicMaterial) P.mesh.material.color.setRGB(kb, kb, kb * 0.98);
    }
  }
  /* calidad adaptativa: si el móvil no llega, se baja la resolución interna (y se vuelve a subir si sobra) */
  const PF = { n: 0, t: 0, up: 0 };
  try {
    const v = parseFloat(localStorage.getItem('colmena-q3d'));
    if (v >= 0.5 && v <= 1) Q.scale = v;
  } catch (e) {}
  function perfTick(dt) {
    if (inTitle || crossing || Zt !== null || document.hidden) {
      PF.n = 0;
      PF.t = 0;
      return;
    }
    PF.n++;
    PF.t += dt;
    if (PF.t < 2) return;
    const fps = PF.n / PF.t;
    PF.n = 0;
    PF.t = 0;
    let ns = Q.scale;
    if (fps < 40 && Q.scale > 0.55) ns = Math.max(0.55, Q.scale - (fps < 28 ? 0.2 : 0.1));
    else if (fps > 57) {
      PF.up++;
      if (PF.up >= 3 && Q.scale < 1) {
        ns = Math.min(1, Q.scale + 0.1);
        PF.up = 0;
      }
    } else PF.up = 0;
    if (ns !== Q.scale) {
      Q.scale = ns;
      try {
        localStorage.setItem('colmena-q3d', ns.toFixed(2));
      } catch (e) {}
      resize();
    }
  }
  function frame(dt, now) {
    if (!renderer) return;
    FDT = Math.min(0.1, dt || 1 / 60);
    madrOff();
    sinkTick(dt);
    ensureRooms();
    perfTick(dt);
    if (cv3.style.filter !== cv.style.filter) cv3.style.filter = cv.style.filter;
    {
      const fk = cur + '|' + (mapMode ? 1 : 0) + (crossing ? 1 : 0) + (inTitle ? 1 : 0);
      if (lastCur !== fk) {
        lastCur = fk;
        for (const id in rooms) tintRoom(rooms[id]);
      }
    }
    const nb = new Set([cur, ...CELLS[cur].doors.map((d) => d.to)]),
      slow = T - blkT > 0.7;
    if (slow) blkT = T;
    for (const id in rooms) {
      const r = rooms[id];
      r.grp.position.y = lift(id);
      r.grp.visible = !(window.CHIDE && CHIDE(id));
      if (id === cur) r.t = T;
      if (!r.grp.visible) continue;
      if (r.npc) drawNpc(r, false);
      if (r.deco && r.deco.userData.tick && (nb.has(id) || mapMode) && !(STILL && r.decoStill)) {
        r.deco.userData.tick(T, STILL, AMB);
        r.decoStill = STILL;
      }
      if (nb.has(id) || slow) {
        blockers(r, false);
        roomWorldTick(r, id === cur);
      }
      /* recortes: miran a la cámara (los muebles solo a medias) */
      {
        const P = typeof POP !== 'undefined' && POP[id];
        if (P) {
          const u = (T - P.t0) / 0.8;
          if (u >= 1) {
            delete POP[id];
            r.grp.scale.y = 1;
          } else r.grp.scale.y = Math.max(0.02, easeBack(Math.max(0, u)));
        } else if (r.grp.scale.y !== 1) r.grp.scale.y = 1;
      }
      r.grp.children.forEach((o) => {
        const f = o.userData.follow;
        if (f) o.rotation.y = CAM.yaw * f;
        if (o.userData.sway !== undefined && !STILL) o.rotation.z = Math.sin(T * 1.3 + o.userData.sway) * 0.025;
      });
      for (const w of r.walls)
        for (const lf of w.leaves) {
          const d = w.door,
            a = doorOpen(id, d);
          lf.rotation.y = lf.userData.base + lf.userData.sd * a * 1.35;
        }
    }
    drawPlayer();
    if (!player.lp) player.grp.rotation.y = CAM.yaw;
    tryD(pomTick3);
    if (window.R3DX) for (const f of R3DX) tryD(() => f(dt));
    camUpdate(dt);
    tryD(pathsTick);
    tryD(() => branchesTick(dt));
    decal();
    const pw = worldOf(cur, Pl.x, Pl.y, 60);
    lamp.position.copy(pw);
    darkTick(dt);
    lamp.intensity = inTitle ? 0 : lerp(lamp.intensity, 0.7 + (1 - AMB) * (NIGHT() ? 7.5 : 5.5), 0.1);
    lamp.distance = NIGHT() ? lerp(520, 380, 1 - AMB) : lerp(520, 300, 1 - AMB);
    renderer.render(scene, camera);
    /* la capa de papel de encima */
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    qFrame(1);
  }
  const DOORA = {},
    DOORT3 = {};
  function doorOpen(id, d) {
    const k = id + d.to,
      tg =
        PUZ.open(id, d.to) && ((id === cur && Math.hypot(Pl.x - d.trig[0], Pl.y - d.trig[1]) < 125) || (crossing && crossing.from === id))
          ? 1
          : 0;
    if (id === cur && tg && !DOORT3[k]) Sound.sfx('door');
    DOORT3[k] = tg;
    const a = DOORA[k] ?? 0;
    const n = lerp(a, tg, 0.12);
    DOORA[k] = n;
    return n;
  }

  /* ── proyección a pantalla (px CSS) ── */
  const _v = new TH3.Vector3();
  function screenOf(id, x, y, z) {
    _v.copy(worldOf(id, x, y, z)).project(camera);
    return [((_v.x + 1) / 2) * cv.clientWidth, ((1 - _v.y) / 2) * cv.clientHeight];
  }

  /* ══ la pluma proyectada: lo que va encima se dibuja en la pantalla, en su sitio del mundo ══ */
  let FOC = 1;
  const _q = new TH3.Vector3();
  function projW(x, y, z) {
    _q.set(x, y, z).applyMatrix4(camera.matrixWorldInverse);
    if (_q.z > -camera.near) return NAN;
    _q.applyMatrix4(camera.projectionMatrix);
    return [((_q.x + 1) / 2) * cv.width, ((1 - _q.y) / 2) * cv.height];
  }
  function depthW(x, y, z) {
    _q.set(x, y, z).applyMatrix4(camera.matrixWorldInverse);
    return -_q.z;
  }
  const base3 = (id, dz = 0) => (id ? [CW[id][0], lift(id) + dz, CW[id][1]] : [0, dz, 0]);
  function sAt(id, x, y, z) {
    const b = base3(id),
      d = depthW(b[0] + x, b[1] + z, b[2] + y);
    return d > 1 ? FOC / d : 0;
  }
  /* una pluma que dibuja en la capa de encima: (x,y,z) del cuarto → píxel de pantalla */
  function pen3(id, seed, a = [0, 0, 0], filt = null, vol = false, dz = 0, smin = 0) {
    const b = base3(id, dz),
      s = Math.max(smin, sAt(id, a[0], a[1], a[2] + dz)),
      prev = window.PENPROJ;
    window.PENPROJ = filt
      ? (x, y, z) => (filt(z) ? projW(b[0] + x, b[1] + z, b[2] + y) : NAN)
      : (x, y, z) => projW(b[0] + x, b[1] + z, b[2] + y);
    const p = STYLE.Pen(ctx, 0, 0, s, seed, true, vol);
    window.PENPROJ = prev;
    return p;
  }
  const FLOORZ = 3,
    upper = (z) => z > FLOORZ;
  const tryD = (f) => {
    try {
      f();
    } catch (e) {
      if (!tryD.n) {
        tryD.n = 1;
        console.warn('3D capa', e);
      }
    }
  };

  /* ══ el suelo dinámico del cuarto: luces, huellas, trampilla, anillos, marcas ══ */
  let DEC = null;
  function decal() {
    const id = cur,
      r = rooms[id];
    if (!r) return;
    if (!DEC) {
      const w = COARSE ? 512 : 768,
        h = Math.round((w * FH) / R),
        c = newCanvas(w, h),
        t = tex(c, { nomip: true });
      const m = new TH3.MeshLambertMaterial({
        map: t,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      });
      const mesh = new TH3.Mesh(floorGeo(), m);
      mesh.position.y = 0.6;
      mesh.renderOrder = 1;
      DEC = { c, g: safeCtx(c.getContext('2d')), t, mesh, last: -9 };
    }
    if (DEC.mesh.parent !== r.grp) {
      r.grp.add(DEC.mesh);
      DEC.last = -9;
    }
    if (T - DEC.last < 1 / (COARSE ? 14 : 22)) return;
    DEC.last = T;
    const g = DEC.g,
      s = DEC.c.width / (2 * R),
      c = CELLS[id];
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, DEC.c.width, DEC.c.height);
    const prev = window.PENPROJ;
    window.PENPROJ = (x, y, z, ox, oy, ps) => (z > FLOORZ ? NAN : [ox + x * ps, oy + y * K * ps]);
    let p;
    try {
      p = STYLE.Pen(g, R * s, FH * s, s, 'din' + (STILL ? 0 : Math.floor(T * 4)), true);
    } finally {
      window.PENPROJ = prev;
    }
    if (!inTitle) {
      if (c.under) tryD(() => c.under(p, T, STILL));
      tryD(() => drawSecrets(p, id));
      tryD(() => qUnder(p, id));
      for (const t of thingsHere())
        if (!t.secret) {
          const hot = t.item || t.id !== 'cerezo' || bagHas('sol');
          if (hot) tryD(() => STYLE.hot(p, t.x, t.y, T, t.id === 'cerezo' ? 40 : 20));
        }
      if (!Pl.onPath && mark && !crossing && (Pl.route || T - mark.t < 1))
        tryD(() => STYLE.mark(p, mark.x, mark.y, Pl.route ? 1 : 1 - (T - mark.t)));
      for (const pf of PUFF) tryD(() => STYLE.puff(p, pf.x, pf.y, (T - pf.t0) / 0.7, id));
    }
    DEC.t.needsUpdate = true;
  }

  /* ══ la capa de encima ══ */
  function over() {
    if (!renderer || !camera) return;
    FOC = cv.height / 2 / Math.tan((camera.fov * Math.PI) / 360);
    const W = cv.width,
      H = cv.height,
      boil = STILL ? 0 : Math.floor(T * 4);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (inTitle) return;
    const id = cur,
      c = CELLS[id],
      n = c.npc;
    /* lo que vive en las paredes o por encima del suelo (llamas, lluvia en la ventana, cuerdas, símbolos) */
    {
      const p = pen3(id, 'din' + boil, [0, 0, 40], upper);
      if (c.under) tryD(() => c.under(p, T, STILL));
      tryD(() => drawSecrets(p, id));
      tryD(() => qUnder(p, id));
    }
    /* objetos, burbujas y manivelas: de lejos a cerca */
    const L = [],
      push = (cid, x, y, z, f) => {
        const b = base3(cid),
          d = depthW(b[0] + x, b[1] + z, b[2] + y);
        if (d > camera.near * 1.2) L.push({ d, f });
      };
    const far = mapMode || Z < ZF * 0.8,
      list = far ? ORDER : [cur, ...c.doors.map((d) => d.to)];
    for (const cid of list) {
      if (window.CHIDE && CHIDE(cid)) continue;
      const live = cid === cur;
      if (!live && (!isSeen(cid) || PUZ.cellLocked(cid))) continue;
      const nn = CELLS[cid].npc;
      for (const t of PUZ.things[cid] || [])
        if (t.item && !t.secret && t.show())
          push(cid, t.x, t.y, t.z, () => {
            const z = t.z + Math.sin(T * 2 + t.x) * 3;
            STYLE.token(pen3(cid, 'tk' + t.id, [t.x, t.y, z]), t.x, t.y, z, t.item, T, false);
          });
      const w = PUZ.want(cid);
      if (w && (live || !talking))
        push(cid, nn.x, nn.y, (nn.lz ?? 80) + 14, () =>
          STYLE.want(
            pen3(cid, 'w' + cid, [nn.x, nn.y, (nn.lz ?? 80) + 14], null, false, 0, far ? 0.5 * DPR : 0),
            nn.x,
            nn.y,
            (nn.lz ?? 80) + 14,
            w,
            live && bagHas(w),
            T,
          ),
        );
      if (PUZ.seal[cid] && PUZ.seal[cid]())
        push(cid, 0, -262, 150, () =>
          STYLE.token(pen3(cid, 'sl' + cid, [0, -262, 150]), 0, -262, 150 + Math.sin(T * 1.5) * 3, 'sello', T, false),
        );
      for (const k in BRIDGES) {
        const b = BRIDGES[k];
        if (b.cell === cid)
          push(cid, b.x, b.y, 20, () => STYLE.crank(pen3(cid, 'cr' + k, [b.x, b.y, 20]), b.x, b.y, BRS[k].ang, !b.needs(), T));
      }
    }
    for (let i = FLY.length - 1; i >= 0; i--) {
      const q = FLY[i],
        u = (T - q.t0) / q.dur;
      if (u < 0) continue;
      if (u >= 1) {
        FLY.splice(i, 1);
        continue;
      }
      const a = q.a(),
        b = q.b(),
        e = u * u * (3 - 2 * u),
        x = lerp(a[0], b[0], e),
        y = lerp(a[1], b[1], e),
        z = lerp(a[2], b[2], e) + Math.sin(u * Math.PI) * 48;
      push(id, x, y, z - 400, () => STYLE.token(pen3(id, 'fly', [x, y, z]), x, y, z, q.item, T, true));
    }
    {
      const em = EMO[id];
      if (em && T - em.t0 < 2.4) {
        const z = (n.lz ?? 80) + (PUZ.want(id) ? 50 : 20);
        push(id, n.x, n.y, z - 300, () => STYLE.emote(pen3(id, 'emo', [n.x, n.y, z]), n.x, n.y, z, em.ch, T - em.t0));
      }
    }
    if (!crossing)
      for (const d of c.doors) {
        const dd = Math.hypot(Pl.x - d.trig[0], Pl.y - d.trig[1]);
        if (dd < 230) {
          const a = d.back ? [...wallPt(d.e, 0.5, 112)] : [d.mid[0] - d.n[0] * (TH + 80), d.mid[1] - d.n[1] * (TH + 80), 66];
          push(id, a[0], a[1], a[2] - 600, () =>
            STYLE.doorLabel(
              pen3(id, 'dl' + d.to, a),
              d,
              CELLS[d.to],
              clamp((230 - dd) / 90, 0, 1) * (dd < 130 ? 1 : 0.75),
              PUZ.open(id, d.to),
            ),
          );
        }
      }
    L.sort((a, b) => b.d - a.d);
    for (const it of L) tryD(it.f);
    /* efectos del cuarto por encima de todo */
    if (!crossing) {
      const p = pen3(id, 'over' + boil, [0, 0, 60]);
      if (c.over) tryD(() => c.over(p, T, STILL));
      tryD(() => qOver(p, id));
    }
    /* abejas viajeras, la mariposa, la onda de luz de los sellos */
    if (QBEES.length) {
      const p = pen3(null, 'abejas', [CW[cur][0], CW[cur][1], 150]);
      for (let i = QBEES.length - 1; i >= 0; i--) {
        const b = QBEES[i];
        if (T < b.t0) continue;
        const q = beePos(b);
        if (!q) {
          QBEES.splice(i, 1);
          continue;
        }
        miniBee(p, q[0], q[1], q[2], T, q[3], 1.4);
      }
    }
    if (!STILL) {
      const wx = CL.cx + Math.sin(T * 0.043) * (CL.x1 - CL.x0) * 0.34,
        wy = (CL.cy + Math.sin(T * 0.071 + 1.3) * (CL.y1 - CL.y0) * 0.3) / K,
        wz = 70 + Math.sin(T * 1.3) * 16;
      tryD(() => STYLE.critter(pen3(null, 'mari', [wx, wy, wz]), wx, wy, wz, T));
    }
    if (WAVE) {
      const u = (T - WAVE.t0) / 1.8;
      if (u >= 1) WAVE = null;
      else if (u > 0) {
        const p = pen3(WAVE.id, 'onda'),
          r = 40 + u * 2600,
          E = p.ring(0, 0, 0, r, r, 72);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        p.line([...E, E[0]], `rgba(255,214,140,${0.55 * (1 - u)})`, 40 * (1 - u) + 3, 1, { exact: true });
        ctx.restore();
      }
    }
    arrow3();
    if (far) mapMarks();
  }
  /* la flecha de papel de la tercera pista */
  function arrow3() {
    if (!HARROW || T > HARROW.until || crossing) return;
    const hid = HARROW.cell,
      s = sAt(cur, Pl.x, Pl.y, 60),
      a0 = projW(...v3a(worldOf(cur, Pl.x, Pl.y, 60)));
    if (!Number.isFinite(a0[0]) || !s) return;
    const g = ctx;
    g.save();
    g.globalAlpha = Math.min(1, (HARROW.until - T) / 2);
    const pulse = 1 + 0.08 * Math.sin(T * 5);
    if (hid === cur) {
      const n = CELLS[cur].npc,
        q = projW(...v3a(worldOf(cur, n.x, n.y, (n.lz ?? 80) + 30)));
      if (!Number.isFinite(q[0])) {
        g.restore();
        return;
      }
      g.translate(q[0], q[1] + Math.sin(T * 4) * 5 * s);
      g.rotate(Math.PI / 2);
    } else {
      const tq = projW(...v3a(worldOf(hid, 0, 0, 40)));
      let a = Math.atan2(tq[1] - a0[1], tq[0] - a0[0]),
        d = Math.hypot(tq[0] - a0[0], tq[1] - a0[1]);
      if (!Number.isFinite(a)) {
        const w = worldOf(hid, 0, 0, 0),
          pw = worldOf(cur, Pl.x, Pl.y, 0);
        a = Math.atan2(w.z - pw.z, w.x - pw.x);
        d = 400;
      }
      const r = Math.min(90 * s, d * 0.4);
      g.translate(a0[0] + Math.cos(a) * r, a0[1] + Math.sin(a) * r);
      g.rotate(a);
    }
    g.scale(pulse, pulse);
    const u = Math.max(s, 0.6 * DPR);
    g.fillStyle = '#FFFDF6';
    g.strokeStyle = '#C4B292';
    g.lineWidth = 2 * u;
    g.beginPath();
    g.moveTo(26 * u, 0);
    g.lineTo(4 * u, -15 * u);
    g.lineTo(4 * u, -7 * u);
    g.lineTo(-20 * u, -7 * u);
    g.lineTo(-20 * u, 7 * u);
    g.lineTo(4 * u, 7 * u);
    g.lineTo(4 * u, 15 * u);
    g.closePath();
    g.fill();
    g.stroke();
    g.fillStyle = '#E4A844';
    g.beginPath();
    g.moveTo(21 * u, 0);
    g.lineTo(7 * u, -9 * u);
    g.lineTo(7 * u, -3.5 * u);
    g.lineTo(-15 * u, -3.5 * u);
    g.lineTo(-15 * u, 3.5 * u);
    g.lineTo(7 * u, 3.5 * u);
    g.lineTo(7 * u, 9 * u);
    g.closePath();
    g.fill();
    g.restore();
  }
  const v3a = (v) => [v.x, v.y, v.z];
  /* etiqueta de papel con el sello y el nombre de la estación, sobre el cuarto */
  function mapLabel(id, full = true) {
    const q = projW(...base3(id, HW + 70));
    if (!Number.isFinite(q[0])) return;
    const SE = SEASON[id],
      name = _t(SE.name),
      f = Math.round(11 * DPR),
      g = ctx;
    if (!full) {
      const r = f * 0.82;
      g.save();
      g.shadowColor = 'rgba(60,30,10,.28)';
      g.shadowBlur = f * 0.4;
      g.fillStyle = SE.seal;
      g.beginPath();
      g.arc(q[0], q[1], r, 0, TAU);
      g.fill();
      g.shadowColor = 'transparent';
      g.fillStyle = '#FFF4D6';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `400 ${Math.round(f * 0.9)}px 'Noto Serif', serif`;
      g.fillText(SE.icon, q[0], q[1] + 1);
      g.restore();
      return;
    }
    g.save();
    g.font = `600 ${f}px Fraunces, 'Noto Serif', 'Noto Serif SC', Georgia, serif`;
    const tw = g.measureText(name).width,
      h = f * 1.9,
      w = tw + h + f * 0.9,
      x = q[0] - w / 2,
      y = q[1] - h / 2;
    g.shadowColor = 'rgba(60,30,10,.28)';
    g.shadowBlur = f * 0.5;
    g.shadowOffsetY = f * 0.15;
    g.fillStyle = 'rgba(251,244,227,.94)';
    g.beginPath();
    g.roundRect ? g.roundRect(x, y, w, h, h / 2) : g.rect(x, y, w, h);
    g.fill();
    g.shadowColor = 'transparent';
    g.fillStyle = SE.seal;
    g.beginPath();
    g.arc(x + h / 2, q[1], h * 0.38, 0, TAU);
    g.fill();
    g.fillStyle = '#FFF4D6';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `400 ${Math.round(f * 0.95)}px 'Noto Serif', serif`;
    g.fillText(SE.icon, x + h / 2, q[1] + 1);
    g.fillStyle = C.ink;
    g.font = `600 ${f}px Fraunces, 'Noto Serif', 'Noto Serif SC', Georgia, serif`;
    g.textAlign = 'left';
    g.fillText(name, x + h + f * 0.35, q[1] + 1);
    g.restore();
  }
  /* en el mapa: nombre de cada estación, señales de las ramas y hacia dónde miran las celdas que giran */
  function mapMarks() {
    for (const id of ORDER) {
      if (id === cur || (window.CHIDE && CHIDE(id))) continue;
      const locked = PUZ.cellLocked(id);
      if (locked || !isSeen(id)) continue;
      tryD(() => mapLabel(id, !window.MAPFULL || MAPFULL(id)));
    }
    if (typeof BRF === 'function' && !FREE)
      for (const id of ORDER) {
        const b = BRF()[id];
        if (!b || !isRisen(id) || (window.CHIDE && CHIDE(id))) continue;
        const dn = isDown(id),
          wk = !secured(id) && b.w >= 0.5;
        if (!dn && !wk && !b.lost) continue;
        const q = projW(...base3(id, HW + 170).map((v, i) => v));
        if (!Number.isFinite(q[0])) continue;
        const sz = Math.max(24 * sAt(id, 0, 0, HW + 170), 14 * DPR);
        ctx.save();
        ctx.fillStyle = dn ? '#5A3A22' : b.lost && !wk ? '#6A6A78' : '#C9563A';
        ctx.shadowColor = 'rgba(40,20,5,.4)';
        ctx.shadowBlur = sz * 0.3;
        ctx.beginPath();
        ctx.arc(q[0], q[1], sz, 0, TAU);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.font = `700 ${Math.round(sz * 1.1)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF4D6';
        ctx.fillText(dn ? '⤓' : wk ? '⚡' : '✕', q[0], q[1] + 1);
        ctx.restore();
      }
    if (typeof ROTORS !== 'undefined')
      for (const rid in ROTORS) {
        if (PUZ.cellLocked(rid) || !isSeen(rid) || (window.CHIDE && CHIDE(rid))) continue;
        const s = sAt(rid, 0, 0, 0),
          sz = Math.max(26 * s, 15 * DPR);
        for (const o of ROTORS[rid].open) {
          const a = ((o + ROT[rid].a + 0.5) * Math.PI) / 3,
            x = Math.cos(a) * R * 0.56,
            y = Math.sin(a) * R * 0.56,
            q = projW(...base3(rid, 8).map((v, i) => v + (i === 0 ? x : i === 2 ? y : 0))),
            q2 = projW(...base3(rid, 8).map((v, i) => v + (i === 0 ? x * 1.2 : i === 2 ? y * 1.2 : 0)));
          if (!Number.isFinite(q[0]) || !Number.isFinite(q2[0])) continue;
          const sa = Math.atan2(q2[1] - q[1], q2[0] - q[0]);
          ctx.save();
          ctx.translate(q[0], q[1]);
          ctx.rotate(sa);
          ctx.shadowColor = 'rgba(40,20,5,.55)';
          ctx.shadowBlur = sz * 0.3;
          ctx.fillStyle = '#FFFDF6';
          ctx.strokeStyle = '#8C4B1F';
          ctx.lineWidth = Math.max(1.5, sz * 0.1);
          ctx.beginPath();
          ctx.moveTo(sz, 0);
          ctx.lineTo(0, -sz * 0.6);
          ctx.lineTo(0, -sz * 0.25);
          ctx.lineTo(-sz * 0.8, -sz * 0.25);
          ctx.lineTo(-sz * 0.8, sz * 0.25);
          ctx.lineTo(0, sz * 0.25);
          ctx.lineTo(0, sz * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.shadowColor = 'transparent';
          ctx.stroke();
          ctx.fillStyle = ROTORS[rid].disc;
          ctx.beginPath();
          ctx.moveTo(sz * 0.75, 0);
          ctx.lineTo(sz * 0.12, -sz * 0.38);
          ctx.lineTo(sz * 0.12, sz * 0.38);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
  }

  /* ══ cierres de las puertas: recortes de papel en el plano de la puerta ══ */
  function edgeFrame(e) {
    const A = VI[e[0]],
      B = VI[e[1]],
      L = Math.hypot(B[0] - A[0], B[1] - A[1]),
      dx = (B[0] - A[0]) / L,
      dy = (B[1] - A[1]) / L;
    return { A, B, L, dx, dy, nx: -dy, ny: dx };
  }
  /* pinta con la pluma sobre el plano vertical de un borde (t a lo largo, z hacia arriba) y lo pone en su sitio */
  function edgeCard(id, e, t0, t1, z0, z1, off, draw, res) {
    const F = edgeFrame(e),
      w = Math.max(8, Math.round((t1 - t0) * res)),
      h = Math.max(8, Math.round((z1 - z0) * res));
    const c = paint(
      w,
      h,
      (x, y, z, ox, oy, ps) => {
        const t = (x - F.A[0]) * F.dx + (y - F.A[1]) * F.dy;
        return [(t - t0) * ps, (z1 - z) * ps];
      },
      (g) => {
        const p = STYLE.Pen(g, 0, 0, res, id + 'cierre' + e, true);
        draw(p);
      },
    );
    const mesh = cardMesh(c, t1 - t0, z1 - z0, { alphaTest: 0.1 });
    const tm = (t0 + t1) / 2;
    mesh.material.side = TH3.DoubleSide;
    const M = new TH3.Matrix4();
    M.makeBasis(V3(F.dx, 0, F.dy), V3(0, 1, 0), V3(F.nx, 0, F.ny));
    mesh.quaternion.setFromRotationMatrix(M);
    mesh.position.set(F.A[0] + F.dx * tm + F.nx * off, (z0 + z1) / 2, F.A[1] + F.dy * tm + F.ny * off);
    mesh.renderOrder = 2;
    return mesh;
  }
  function blockState(id, d) {
    if (d.dyn || PUZ.open(id, d.to)) return '';
    const k = blockKind(id, d);
    let r = '';
    if (k !== 'seal' && typeof rotBlocks === 'function' && PUZ._open0 && PUZ._open0(id, d.to) && rotBlocks(id, d.to))
      r = 'r' + (rotStuck(id, d.to) ? id : d.to);
    return k + r;
  }
  function blockers(r, force) {
    const id = r.id;
    r.blk = r.blk || {};
    for (const d of CELLS[id].doors) {
      const st = blockState(id, d),
        old = r.blk[d.to];
      if (!force && old && old.st === st) continue;
      if (old && old.mesh) {
        r.grp.remove(old.mesh);
        old.mesh.geometry.dispose();
        old.mesh.material.map.dispose();
        old.mesh.material.dispose();
      }
      r.blk[d.to] = { st, mesh: null };
      if (!st) continue;
      const e = d.back ? d.e : [d.e[1], d.e[0]],
        L = edgeFrame(e).L,
        rot = st.includes('r');
      const off = d.back ? (rot ? 9 : 8) : rot ? -3 : TH + 10,
        z1 = d.back ? (rot ? 96 : 92) : st.startsWith('seal') ? 60 : 70;
      try {
        const m = edgeCard(
          id,
          e,
          L * (0.5 - DOOR_W - 0.07),
          L * (0.5 + DOOR_W + 0.07),
          -2,
          z1,
          off,
          (p) => STYLE.blocker(p, d, blockKind(id, d), 0),
          r.hi ? 2.2 : 1.2,
        );
        r.grp.add(m);
        r.blk[d.to].mesh = m;
      } catch (err) {
        console.warn('cierre', id, d.to, err);
      }
    }
  }

  /* ══ tocar en 3D: el rayo de la cámara decide qué tocaste ══ */
  const ray = new TH3.Raycaster(),
    _nd = new TH3.Vector2();
  function hitFloor(sx, sy) {
    _nd.set((sx / cv.clientWidth) * 2 - 1, -(sy / cv.clientHeight) * 2 + 1);
    ray.setFromCamera(_nd, camera);
    const objs = [];
    for (const id in rooms) {
      const r = rooms[id];
      if (!r.grp.visible) continue;
      r.grp.traverse((o) => {
        if (o.userData.floor || o.userData.lid) objs.push(o);
      });
    }
    const h = ray.intersectObjects(objs, false)[0];
    if (!h) return null;
    let o = h.object;
    while (o && !(o.userData.floor || o.userData.lid)) o = o.parent;
    const id = o.userData.floor || o.userData.lid;
    return { id, x: h.point.x - CW[id][0], y: h.point.z - CW[id][1] };
  }
  function onTap3D(cx, cy) {
    if (crossing || inTitle) return;
    const c = CELLS[cur],
      sc = (v) => sAt(cur, ...v) / DPR,
      near = (v, rx, ry) => {
        const q = screenOf(cur, v[0], v[1], v[2]),
          s = sc(v);
        return s > 0 && Math.abs(cx - q[0]) < rx * s && Math.abs(cy - q[1]) < ry * s;
      };
    Pl.goal = null;
    for (const d of c.doors) {
      const at = STYLE.signAt(d);
      if (at && near([at[0], at[1], 34], 24, 30)) {
        goTo(d.trig[0], d.trig[1], false, d);
        return;
      }
    }
    for (const d of c.doors) {
      if (!d.back) continue;
      const m = wallPt(d.e, 0.5, 40);
      if (near(m, 42, 48)) {
        goTo(d.trig[0], d.trig[1], false, d);
        return;
      }
    }
    for (const t of thingsHere()) {
      if (near([t.x, t.y, t.z + 8], 44, 44)) {
        goTo(t.ax, t.ay, false, null, t);
        return;
      }
    }
    {
      const n = c.npc;
      if (near([n.x, n.y, (n.lz ?? 80) * 0.55], 50, (n.lz ?? 80) * 0.6)) {
        goTo(n.x + (n.tx ?? 45), n.y + (n.ty ?? 30), true);
        return;
      }
    }
    const h = hitFloor(cx, cy);
    if (!h) {
      /* tocó el vacío: la puerta que mira hacia allí */ const g = hitPlane(cx, cy);
      if (!g) return;
      const lx = g[0] - CW[cur][0],
        ly = g[1] - CW[cur][1];
      let best = null,
        bd = 0.6;
      for (const d of c.doors) {
        const a = Math.atan2(ly, lx),
          b = Math.atan2(d.mid[1], d.mid[0]),
          df = Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
        if (df < bd) {
          bd = df;
          best = d;
        }
      }
      if (best) goTo(best.trig[0], best.trig[1], false, best);
      return;
    }
    if (h.id !== cur && window.FASTGO && FASTGO(h.id)) return;
    if (h.id !== cur) {
      const id = h.id,
        d = doorToward(id);
      if (!d) {
        const dd = c.doors.find((x) => x.to === id);
        note(dd ? PUZ.why(cur, id) : 'Todavía no hay forma de llegar ahí.');
        if (dd) goTo(dd.trig[0], dd.trig[1], false, dd);
        return;
      }
      Pl.goal = id;
      goTo(d.trig[0], d.trig[1], false, d);
      return;
    }
    if (!inHex(h.x, h.y, R - 6)) {
      let best = null,
        bd = 0.6;
      for (const d of c.doors) {
        const a = Math.atan2(h.y, h.x),
          b = Math.atan2(d.mid[1], d.mid[0]),
          df = Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
        if (df < bd) {
          bd = df;
          best = d;
        }
      }
      if (best) {
        goTo(best.trig[0], best.trig[1], false, best);
        return;
      }
    }
    goTo(h.x, h.y);
  }
  const _pl = new TH3.Plane(new TH3.Vector3(0, 1, 0), 0),
    _hp = new TH3.Vector3();
  function hitPlane(cx, cy) {
    _nd.set((cx / cv.clientWidth) * 2 - 1, -(cy / cv.clientHeight) * 2 + 1);
    ray.setFromCamera(_nd, camera);
    _pl.constant = -lift(cur);
    return ray.ray.intersectPlane(_pl, _hp) ? [_hp.x, _hp.z] : null;
  }
  /* cursor de mano sobre lo que se puede tocar */
  function hoverAt(cx, cy) {
    if (crossing || inTitle) return false;
    const c = CELLS[cur],
      near = (v, rx, ry) => {
        const q = screenOf(cur, v[0], v[1], v[2]),
          s = sAt(cur, ...v) / DPR;
        return s > 0 && Math.abs(cx - q[0]) < rx * s && Math.abs(cy - q[1]) < ry * s;
      };
    if (thingsHere().some((t) => near([t.x, t.y, t.z + 8], 44, 44))) return true;
    const n = c.npc;
    if (near([n.x, n.y, (n.lz ?? 80) * 0.55], 50, (n.lz ?? 80) * 0.6)) return true;
    return c.doors.some((d) =>
      d.back ? near(wallPt(d.e, 0.5, 40), 42, 48) : STYLE.signAt(d) && near([...STYLE.signAt(d).slice(0, 2), 34], 24, 30),
    );
  }

  /* ══════════ EL MUNDO ENTRE LOS CUARTOS: caminos, umbrales, puentes y ramas ══════════ */
  const BOX = new TH3.BoxGeometry(1, 1, 1),
    UPV = new TH3.Vector3(0, 1, 0);
  BOX.userData.shared = true;
  const _ax = new TH3.Vector3(),
    _ay = new TH3.Vector3(),
    _az = new TH3.Vector3(),
    _m4 = new TH3.Matrix4(),
    _m5 = new TH3.Matrix4(),
    _col = new TH3.Color();
  /* una viga de papel de A a B (coordenadas three: x, altura, profundidad), ancho w y grueso h */
  function beamM(A, B, w, h, out) {
    _ax.set(B[0] - A[0], B[1] - A[1], B[2] - A[2]);
    let len = _ax.length();
    if (len < 1e-4) {
      _ax.set(1, 0, 0);
      len = 1e-4;
    } else _ax.divideScalar(len);
    _ay.copy(UPV);
    if (Math.abs(_ax.dot(_ay)) > 0.97) _ay.set(0, 0, 1);
    _az.crossVectors(_ax, _ay).normalize();
    _ay.crossVectors(_az, _ax).normalize();
    out.makeBasis(_ax, _ay, _az);
    out.scale(new TH3.Vector3(len, h, w));
    out.setPosition((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2);
    return out;
  }
  /* un montón de vigas en una sola llamada de dibujo */
  function beamSet(list, basic) {
    const mat = basic ? new TH3.MeshBasicMaterial({ color: '#FFFFFF', fog: true }) : new TH3.MeshLambertMaterial({ color: '#FFFFFF' });
    const geo = list.geo || BOX,
      im = new TH3.InstancedMesh(geo, mat, Math.max(1, list.length));
    im.frustumCulled = false;
    const base = new Float32Array(Math.max(1, list.length) * 16);
    list.forEach((b, i) => {
      const M = b.M || beamM(b.A, b.B, b.w, b.h, _m4);
      M.toArray(base, i * 16);
      im.setMatrixAt(i, M);
      im.setColorAt(i, _col.set(b.col));
    });
    if (!list.length) {
      im.count = 0;
    }
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.userData = { list, base, basic };
    return im;
  }
  /* mostrar las piezas según cuánto está desplegado el camino: crecen al pasar el frente */
  function unfoldSet(im, fa, fb, full, extra) {
    const L = im.userData.list,
      base = im.userData.base;
    let any = false;
    for (let i = 0; i < L.length; i++) {
      const t = L[i].t;
      let f = full
        ? 1
        : Math.max(clamp((fa - t) / 0.07 + 1, 0, 1) * (fa > 0.002 ? 1 : 0), clamp((fb - (1 - t)) / 0.07 + 1, 0, 1) * (fb > 0.002 ? 1 : 0));
      if (fa + fb < 0.002) f = 0;
      _m4.fromArray(base, i * 16);
      if (extra) extra(L[i], _m4, i);
      if (f < 1) {
        _m5.makeScale(f, f, f);
        _m4.multiply(_m5);
        _m4.elements[13] += (1 - f) * 16;
      }
      if (f > 0) any = true;
      im.setMatrixAt(i, _m4);
    }
    im.instanceMatrix.needsUpdate = true;
    return any;
  }

  /* ── caminos ── */
  const P3 = [];
  const pt3 = (P, t, w, z) => {
    const q = PT(P, t, w, z);
    return [q[0], z, q[1]];
  };
  function buildPath3(P) {
    const L = [],
      G = [],
      M = PMAT[P.type] || PMAT.puente,
      n = P.n,
      R0 = rng(P.key + '3d');
    const lit = [];
    const plank = (t0, t1, w0, w1, z, col, h = 4) => {
      const tc = (t0 + t1) / 2;
      L.push({ A: pt3(P, tc, w0, z - h / 2), B: pt3(P, tc, w1, z - h / 2), w: (t1 - t0) * P.L, h, col, t: tc, z });
    };
    const chain = (ts, fw, fz, th, col, list = L, tw) => {
      for (let i = 0; i < ts.length - 1; i++) {
        const a = ts[i],
          b = ts[i + 1];
        list.push({ A: pt3(P, a, fw(a), fz(a)), B: pt3(P, b, fw(b), fz(b)), w: tw || th, h: th, col, t: (a + b) / 2 });
      }
    };
    const vert = (t, w, z0, z1, th, col) => L.push({ A: pt3(P, t, w, z0), B: pt3(P, t, w, z1), w: th, h: th, col, t });
    const steps = (k) => [...Array(k + 1)].map((_, i) => i / k);
    let water = null,
      car = null;
    if (P.type === 'puente') {
      for (let i = 0; i < n; i++) plank(i / n + 0.006, (i + 1) / n - 0.006, -34, 34, SAG((i + 0.5) / n), i % 3 ? '#C9924E' : '#B57E3E');
      L.forEach((b) => (b.dip = 1));
      for (const w of [-38, 38]) {
        chain(
          steps(20),
          () => w,
          (t) => SAG(t) * 0.7 + 44,
          2.4,
          '#8A6A4A',
        );
        for (let i = 1; i < 20; i += 2) {
          const t = i / 20;
          vert(t, w, SAG(t), SAG(t) * 0.7 + 44, 1.3, '#8A6A4A');
        }
      }
    } else if (P.type === 'muelle') {
      for (let i = 0; i < 8; i++) {
        const t = (i + 0.5) / 8;
        for (const w of [-30, 30]) vert(t, w, 0, -72, 5, '#6E4A2E');
      }
      for (let i = 0; i < n; i++) plank(i / n, (i + 1) / n - 0.004, -36, 36, 0, i % 2 ? '#B0875A' : '#A07A50');
      water = new TH3.Mesh(
        new TH3.PlaneGeometry(P.L + 120, 260),
        new TH3.MeshBasicMaterial({ color: '#A9DCE4', transparent: true, opacity: 0.42, depthWrite: false, fog: true }),
      );
      water.rotation.x = -Math.PI / 2;
      water.rotation.z = -Math.atan2(P.u[1], P.u[0]);
      const c = pt3(P, 0.5, 0, -74);
      water.position.set(c[0], c[1], c[2]);
      water.renderOrder = 1;
    } else if (P.type === 'escalera') {
      const zs = (t) => Math.sin(Math.PI * t) * 70;
      for (let i = 0; i < n; i++) {
        const t0 = i / n,
          t1 = (i + 1) / n,
          z = zs(t0);
        plank(t0, t1, -32, 32, z, i % 2 ? '#E9E4F4' : '#D6D0EA');
        L.push({ A: pt3(P, t0, -32, z - 5), B: pt3(P, t0, 32, z - 5), w: 2, h: 10, col: '#A8A0C8', t: t0 });
      }
      for (let k = 0; k < 16; k++) {
        const t = rd(R0, 0.02, 0.98),
          w = rd(R0, -70, 70),
          z = zs(t) + rd(R0, 20, 90),
          c = pt3(P, t, w, z),
          s = 2 + R0() * 2.5;
        G.push({ A: [c[0] - s, c[1], c[2]], B: [c[0] + s, c[1], c[2]], w: s * 2, h: s * 2, col: '#FFF6D8', t });
      }
    } else if (P.type === 'tren') {
      for (let i = 0; i < n * 1.4; i++) {
        const t = i / (n * 1.4);
        plank(t, t + 0.012, -34, 34, 0, '#6E4A2E', 3);
      }
      for (const w of [-20, 20])
        chain(
          steps(12),
          () => w,
          () => 4,
          3,
          '#9AA0B0',
        );
      car = new TH3.Group();
      const bx = (x, y, z, sx, sy, sz, col) => {
        const m = new TH3.Mesh(BOX, new TH3.MeshLambertMaterial({ color: col }));
        m.position.set(x, y, z);
        m.scale.set(sx, sy, sz);
        car.add(m);
        return m;
      };
      bx(0, 9, 0, 68, 4, 52, '#2E3561');
      bx(0, 26, -24, 68, 34, 4, '#3A4278');
      bx(0, 18, 24, 68, 18, 4, '#4A548E');
      bx(-33, 26, 0, 4, 34, 52, '#343C6E');
      bx(33, 18, 0, 4, 18, 52, '#434B82');
      bx(0, 46, -24, 6, 20, 6, '#2A305C');
      const hl = new TH3.Mesh(new TH3.SphereGeometry(4, 10, 8), new TH3.MeshBasicMaterial({ color: '#F6D98A' }));
      hl.position.set(36, 20, 0);
      car.add(hl);
      car.add(glowSprite('#FFE6A0', 46, 0.35, [36, 20, 0]));
    } else if (P.type === 'arena') {
      for (let i = 0; i < 24; i++) {
        const t0 = i / 24,
          t1 = (i + 1) / 24,
          tc = (t0 + t1) / 2,
          wig = Math.sin(tc * 9 + 1) * 10;
        L.push({
          A: pt3(P, tc, -40 + wig, -1),
          B: pt3(P, tc, 40 + wig, -1),
          w: (t1 - t0) * P.L + 3,
          h: 2,
          col: i % 2 ? '#E9C98E' : '#DDB878',
          t: tc,
        });
      }
      for (let k = 0; k < 6; k++) {
        const t = rd(R0, 0.1, 0.9),
          w = rd(R0, -60, 60);
        vert(t, w, 0, 20, 2.2, '#6F8D5E');
        vert(t, w + 5, 0, 13, 2, '#8FA86A');
      }
    } else if (P.type === 'cera') {
      const zs = (t) => -Math.sin(Math.PI * t) * 50;
      for (let i = 0; i < n; i++) {
        const t0 = i / n,
          t1 = (i + 1) / n,
          z = zs(t0);
        plank(t0, t1, -34, 34, z, i % 2 ? '#F0C060' : '#E4A844');
        L.push({ A: pt3(P, t0, -34, z - 6), B: pt3(P, t0, 34, z - 6), w: 2, h: 12, col: '#C98A3A', t: t0 });
      }
      for (let k = 0; k < 7; k++) {
        const t = rd(R0, 0.1, 0.9),
          w = rd(R0, -30, 30),
          z = zs(t);
        vert(t, w, z, z - 14 - R0() * 12, 3, '#E4A844');
      }
    } else if (P.type === 'piedras' || P.type === 'hielo') {
      const S = STONES(P),
        ice = P.type === 'hielo';
      S.forEach(([t, w], i) => {
        const c = pt3(P, t, w, ice ? -4 : -5),
          r = ice ? 24 : 20 + ((i * 7) % 5) - 2;
        const M = new TH3.Matrix4().compose(
          new TH3.Vector3(c[0], c[1], c[2]),
          new TH3.Quaternion().setFromAxisAngle(UPV, i * 0.7),
          new TH3.Vector3(r, ice ? 10 : 9, ice ? r : r * 0.62),
        );
        L.push({ M, col: ice ? (i % 2 ? '#DDEFF5' : '#EEF7FA') : i % 2 ? '#C9C0B0' : '#B8AE9C', t, bob: ice ? i : null });
      });
      L.geo = new TH3.CylinderGeometry(1, 1.08, 1, ice ? 6 : 9);
      if (!ice) for (const [t, w] of S.filter((_, i) => i % 2)) vert(t, w + 30, 0, 12, 1.8, '#6F8D5E');
    } else if (P.type === 'raices') {
      for (const w of [-24, 0, 24])
        chain(
          steps(24),
          (t) => w + Math.sin(t * 12 + w) * 8,
          (t) => -Math.sin(Math.PI * t) * 20,
          w ? 6 : 9,
          '#6E4A2E',
        );
      for (let k = 0; k < 9; k++) {
        const t = (k + 0.5) / 9,
          c = pt3(P, t, Math.sin(t * 12) * 8, -Math.sin(Math.PI * t) * 20 + 6);
        G.push({ A: [c[0] - 3, c[1], c[2]], B: [c[0] + 3, c[1], c[2]], w: 6, h: 6, col: '#F0C060', t, pulse: k });
      }
    }
    const grp = new TH3.Group();
    grp.matrixAutoUpdate = false;
    const main = beamSet(L, false);
    grp.add(main);
    let glow = null;
    if (G.length) {
      glow = beamSet(G, true);
      grp.add(glow);
    }
    if (water) grp.add(water);
    if (car) grp.add(car);
    /* la sombra difusa del camino sobre el vacío */
    scene.add(grp);
    return { P, grp, main, glow, water, car, U: '', open: null };
  }
  function glowSprite(col, size, op, pos) {
    const m = new TH3.SpriteMaterial({
      map: glowTex(),
      color: col,
      transparent: true,
      opacity: op,
      blending: TH3.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const s = new TH3.Sprite(m);
    s.scale.set(size, size, 1);
    if (pos) s.position.set(...pos);
    s.renderOrder = 3;
    return s;
  }
  let GLT = null;
  function glowTex() {
    if (GLT) return GLT;
    const c = newCanvas(64, 64),
      g = c.getContext('2d'),
      r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.35, 'rgba(255,255,255,.45)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
    GLT = tex(c);
    GLT.userData.shared = true;
    return GLT;
  }
  /* el camino se inclina de un cuarto al otro si uno está más alto (subiendo, cayendo o plegado) */
  function shearPath(o) {
    const P = o.P,
      la = lift(P.a),
      lb = lift(P.b),
      k = (lb - la) / P.L,
      ux = P.u[0],
      uz = P.u[1];
    o.grp.matrix.set(1, 0, 0, 0, k * ux, 1, k * uz, la - k * (P.p0[0] * ux + P.p0[1] * uz), 0, 0, 1, 0, 0, 0, 0, 1);
    o.grp.matrixWorldNeedsUpdate = true;
  }
  function pathsTick() {
    if (!P3.length && PATHS.length) for (const P of PATHS) P3.push(buildPath3(P));
    const cr = crossing && crossing.plan ? crossing : null;
    for (const o of P3) {
      const P = o.P,
        open = PUZ.open(P.a, P.b) && !(PUZ.cellLocked(P.a) || PUZ.cellLocked(P.b)),
        mine = !!cr && cr.plan.P === P,
        U = unfoldTick(P, open, mine),
        q = mine ? cr.q : null,
        rd_ = q && q.on ? q.r : null;
      const hide = window.CHIDE && CHIDE(P.a) && CHIDE(P.b);
      /* la cesta de las abejas sustituye a escaleras, puentes y senderos: solo queda a la vista la vía del tren */
      o.grp.visible = !hide && U.a + U.b > 0.002 && !(window.SIN_CAMINOS && P.type !== 'tren');
      if (!o.grp.visible) continue;
      shearPath(o);
      if (o.open !== open) {
        o.open = open;
        const k = open ? 1 : 0.62;
        o.main.material.color.setRGB(k, k, k * 0.96);
        if (o.glow) o.glow.material.color.setRGB(k, k, k);
      }
      const full = U.a + U.b >= 0.999,
        key = U.a.toFixed(3) + U.b.toFixed(3),
        dyn = (rd_ && P.type === 'puente') || P.type === 'hielo' || (o.glow && P.type === 'raices');
      if (key !== o.U || dyn || o.wasRider) {
        o.U = key;
        o.wasRider = !!rd_;
        const rt = rd_ ? rd_.t : -9;
        unfoldSet(
          o.main,
          U.a,
          U.b,
          full,
          dyn
            ? (b, M) => {
                if (b.dip && rd_) {
                  M.elements[13] -= 11 * Math.exp(-((((b.t - rt) * P.L) / 70) ** 2)) + (Math.abs(b.t - rt) * P.L < 30 ? 2 : 0);
                }
                if (b.bob != null && !STILL) M.elements[13] += Math.sin(T * 1.3 + b.bob) * 2;
              }
            : null,
        );
        if (o.glow)
          unfoldSet(
            o.glow,
            U.a,
            U.b,
            full,
            P.type === 'raices' && !STILL
              ? (b, M) => {
                  const pu = Math.max(
                      ((Math.sin(T * 2.2 - b.pulse * 0.6) + 1) / 2) * 0.8,
                      rd_ ? Math.max(0, 1 - (Math.abs(b.t - rt) * P.L) / 55) * 1.2 : 0,
                    ),
                    s = 0.7 + pu * 0.7;
                  _m5.makeScale(s, s, s);
                  M.multiply(_m5);
                }
              : null,
          );
      }
      if (o.water) o.water.visible = true;
      if (o.car) {
        const dl = 34 / P.L,
          info =
            mine && q && !q.on ? (q.phase === 1 ? lerp(PARK[P.key] ?? 0.5, cr.plan.fwd ? 0 : 1, sm01(q.u)) : cr.plan.fwd ? 1 : 0) : null,
          ct = clamp(rd_ ? rd_.t : info != null ? info : (PARK[P.key] ?? 0.5), dl + 0.01, 1 - dl - 0.01);
        const c = pt3(P, ct, 0, 0),
          rock = rd_ && !STILL ? Math.sin(T * 14) * 0.8 : 0;
        o.car.position.set(c[0], c[1] + rock, c[2]);
        o.car.rotation.y = -Math.atan2(P.u[1], P.u[0]) + (P.u[0] < 0 ? Math.PI : 0);
        o.car.visible = full || ct <= U.a || ct >= 1 - U.b;
      }
    }
  }

  /* ── en cada cuarto: umbrales con farolas, puentecitos hacia la celda de al lado y puentes que giran ── */
  function lantern(col, glow) {
    const g = new TH3.Group(),
      body = new TH3.Mesh(BOX, new TH3.MeshLambertMaterial({ color: col }));
    body.scale.set(9, 11, 9);
    g.add(body);
    const core = new TH3.Mesh(BOX, new TH3.MeshBasicMaterial({ color: '#8A7A6A', fog: true }));
    core.scale.set(6.2, 8, 9.4);
    g.add(core);
    const cap = new TH3.Mesh(
      new TH3.ConeGeometry(7, 6, 4),
      new TH3.MeshLambertMaterial({ color: shade(col.length === 7 ? col : '#6E4A2E', 0.8) }),
    );
    cap.position.y = 8.5;
    cap.rotation.y = Math.PI / 4;
    g.add(cap);
    const sp = glowSprite(glow, 50, 0);
    g.add(sp);
    g.userData = { core, sp, glow };
    return g;
  }
  function setLit(l, on) {
    const u = l.userData;
    u.core.material.color.set(on > 0.05 ? u.glow : '#8A7A6A');
    u.sp.material.opacity = 0.3 * on;
  }
  function medallion(icon, col) {
    const c = newCanvas(64, 64),
      g = c.getContext('2d');
    g.fillStyle = col;
    g.beginPath();
    g.arc(32, 32, 29, 0, TAU);
    g.fill();
    g.fillStyle = '#EDE3CF';
    g.font = "400 34px Fraunces, 'Noto Serif', serif";
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(icon, 32, 34);
    const m = cardMesh(c, 15, 15, {});
    m.userData.follow = 1;
    return m;
  }
  function roomWorld(r) {
    const id = r.id,
      c = CELLS[id],
      X = [];
    r.lanterns = [];
    r.dyn = [];
    const pt = (V, e, u) => [lerp(V[e[0]][0], V[e[1]][0], u), lerp(V[e[0]][1], V[e[1]][1], u)];
    for (const d of c.doors) {
      const e = d.e,
        out = [-d.n[0], -d.n[1]],
        type = pathTypeOf(id, d.to),
        M = PMAT[type] || PMAT.puente;
      if (!d.back && !d.dyn && d.span < 2) {
        /* puentecito de papel hacia la celda de delante */ const a = pt(VI, e, 0.5),
          Lp = TH + 62;
        X.push({ A: [a[0], -2, a[1]], B: [a[0] + out[0] * Lp, -9, a[1] + out[1] * Lp], w: DOOR_W * 1.6 * R, h: 4, col: '#E8B862' });
        for (const sg of [-1, 1]) {
          const tg = [-out[1] * sg, out[0] * sg],
            o = [a[0] + tg[0] * DOOR_W * 0.8 * R, a[1] + tg[1] * DOOR_W * 0.8 * R];
          X.push({ A: [o[0], 24, o[1]], B: [o[0] + out[0] * Lp, 18, o[1] + out[1] * Lp], w: 1.8, h: 1.8, col: C.amberD });
          X.push({ A: [o[0], 0, o[1]], B: [o[0], 25, o[1]], w: 2, h: 2, col: C.amberD });
          X.push({
            A: [o[0] + out[0] * Lp, -8, o[1] + out[1] * Lp],
            B: [o[0] + out[0] * Lp, 19, o[1] + out[1] * Lp],
            w: 2,
            h: 2,
            col: C.amberD,
          });
        }
      } else if (!d.back && d.dyn) {
        /* puente que gira con la manivela */ const m = pt(VI, e, 0.5),
          g = new TH3.Group(),
          Lp = TH + 62,
          w = DOOR_W * 1.6 * R;
        g.position.set(m[0], 0, m[1]);
        const pl = new TH3.Mesh(BOX, new TH3.MeshLambertMaterial({ color: '#E8B862' }));
        pl.scale.set(w, 4, Lp);
        pl.position.set(0, -4, Lp / 2);
        g.add(pl);
        for (const sg of [-1, 1]) {
          const rl = new TH3.Mesh(BOX, new TH3.MeshLambertMaterial({ color: C.amberD }));
          rl.scale.set(1.8, 1.8, Lp);
          rl.position.set((sg * w) / 2, 20, Lp / 2);
          g.add(rl);
        }
        const disc = new TH3.Mesh(new TH3.CylinderGeometry(16, 16, 3, 18), new TH3.MeshLambertMaterial({ color: C.amber }));
        disc.position.y = 0.5;
        g.add(disc);
        g.userData = { base: Math.atan2(out[0], out[1]), key: bkey(id, d.to) };
        r.grp.add(g);
        r.dyn.push(g);
      }
      if (d.span >= 2 && !d.back) {
        /* umbral: alfombra del material del camino, dos farolas y un arco */ const u0 = 0.5 - DOOR_W * 0.95,
          u1 = 0.5 + DOOR_W * 0.95,
          a = pt(VI, e, u0),
          b = pt(VI, e, u1),
          ao = pt(VO, e, u0),
          bo = pt(VO, e, u1),
          Xo = (q, k, z) => [q[0] + out[0] * k, z, q[1] + out[1] * k];
        const mid = pt(VI, e, 0.5),
          mo = pt(VO, e, 0.5);
        X.push({ A: Xo(mid, -2, -1.4), B: Xo(mo, 12, -1.4), w: Math.hypot(b[0] - a[0], b[1] - a[1]), h: 3, col: M.c[0] });
        for (let k = 1; k < 4; k++) X.push({ A: Xo(a, k * 8, 0.4), B: Xo(b, k * 8, 0.4), w: 1.4, h: 0.8, col: M.c[1] });
        const h = 50;
        for (const q of [ao, bo]) {
          X.push({ A: Xo(q, 2, 0), B: Xo(q, 2, h), w: 4.2, h: 4.2, col: M.post });
          const l = lantern(M.post, M.glow);
          l.position.set(...Xo(q, 2, h + 6));
          r.grp.add(l);
          r.lanterns.push({ l, d });
        }
        let prev = null;
        for (let k = 0; k <= 12; k++) {
          const u = k / 12,
            q = [lerp(ao[0], bo[0], u), lerp(ao[1], bo[1], u)],
            p = Xo(q, 2, h + 10 + Math.sin(Math.PI * u) * 12);
          if (prev) X.push({ A: prev, B: p, w: 2.6, h: 2.6, col: M.post });
          prev = p;
        }
        const md = medallion(M.icon, M.post);
        md.position.set(...Xo(mo, 2, h + 26));
        r.grp.add(md);
      }
      if (d.span >= 2 && d.back) {
        /* farolas a los lados de la puerta del fondo */ for (const sg of [-1, 1]) {
          const c0 = wallPt(e, 0.5 + sg * (DOOR_W + 0.075), 62, 6),
            b0 = wallPt(e, 0.5 + sg * (DOOR_W + 0.075), 78, 1);
          X.push({ A: [b0[0], b0[2], b0[1]], B: [c0[0], c0[2] + 6, c0[1]], w: 1.6, h: 1.6, col: M.post });
          const l = lantern(M.post, M.glow);
          l.scale.setScalar(0.85);
          l.position.set(c0[0], c0[2], c0[1]);
          r.grp.add(l);
          r.lanterns.push({ l, d });
        }
      }
    }
    if (X.length) {
      const im = beamSet(X, false);
      r.grp.add(im);
      r.mats.push(im.material);
    }
  }
  function roomWorldTick(r, live) {
    const id = r.id;
    for (const { l, d } of r.lanterns) {
      const U = UNF[[id, d.to].sort().join('-')],
        ue = U ? (id < d.to ? U.a : U.b) : 0,
        lit = Math.max(ue, live ? clamp((230 - Math.hypot(Pl.x - d.trig[0], Pl.y - d.trig[1])) / 100, 0, 1) : 0);
      setLit(l, PUZ.open(id, d.to) ? lit : 0);
    }
    for (const g of r.dyn) {
      const b = BRS[g.userData.key];
      g.rotation.y = g.userData.base - (b ? b.ang : 0);
    }
  }

  /* ── las ramas: finas, de papel, cada cuarto cuelga de la suya ── */
  const BR = {},
    TR3 = { g: null };
  const TRUNKZ = () => {
    let y0 = 1e9;
    for (const id of ORDER) y0 = Math.min(y0, CW[id][1]);
    return y0 - 720;
  };
  function tube(curve, n, rad, r0, r1, col) {
    const fr = curve.computeFrenetFrames(n, false),
      pos = [],
      uu = [],
      idx = [],
      P = new TH3.Vector3();
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      curve.getPointAt(u, P);
      const N = fr.normals[i],
        B = fr.binormals[i],
        r = lerp(r0, r1, Math.pow(u, 1.25));
      for (let j = 0; j <= rad; j++) {
        const a = (j / rad) * TAU,
          cx = Math.cos(a),
          sx = Math.sin(a);
        pos.push(P.x + r * (cx * N.x + sx * B.x), P.y + r * (cx * N.y + sx * B.y), P.z + r * (cx * N.z + sx * B.z));
        uu.push(u);
      }
    }
    for (let i = 0; i < n; i++)
      for (let j = 0; j < rad; j++) {
        const a = i * (rad + 1) + j,
          b = a + rad + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    const g = new TH3.BufferGeometry();
    g.setAttribute('position', new TH3.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    g.userData = { base: Float32Array.from(pos), u: uu };
    return new TH3.Mesh(g, new TH3.MeshLambertMaterial({ color: col, flatShading: true }));
  }
  /* el extremo del cuarto sube o baja con él: los vértices se desplazan según lo cerca que estén del cuarto */
  function bend(mesh, dy) {
    const g = mesh.geometry,
      b = g.userData.base,
      u = g.userData.u,
      p = g.attributes.position.array;
    for (let i = 0; i < u.length; i++) {
      p[i * 3] = b[i * 3];
      p[i * 3 + 1] = b[i * 3 + 1] + dy * Math.pow(1 - u[i], 1.6);
      p[i * 3 + 2] = b[i * 3 + 2];
    }
    g.attributes.position.needsUpdate = true;
  }
  function leafTex3() {
    if (leafTex3.t) return leafTex3.t;
    const c = newCanvas(64, 32),
      g = c.getContext('2d');
    g.fillStyle = '#FFFFFF';
    g.beginPath();
    g.moveTo(2, 16);
    g.quadraticCurveTo(30, -4, 62, 16);
    g.quadraticCurveTo(30, 36, 2, 16);
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,.18)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(4, 16);
    g.lineTo(58, 16);
    g.stroke();
    leafTex3.t = tex(c);
    leafTex3.t.userData.shared = true;
    return leafTex3.t;
  }
  function trunks() {
    if (TR3.g) return;
    const g = new TH3.Group(),
      z = TRUNKZ(),
      mat = new TH3.MeshLambertMaterial({ color: '#9A6A42', flatShading: true });
    for (let i = 0; i < TRUNKS.length; i++) {
      const x = TRUNKS[i],
        m = new TH3.Mesh(new TH3.CylinderGeometry(52, 80, 7000, 7), mat);
      m.position.set(x, -1780, z - (i % 2) * 120);
      m.rotation.y = i;
      g.add(m);
    }
    /* arriba, algo mucho más grande sostiene los troncos */
    const x0 = TRUNKS[0],
      x1 = TRUNKS[TRUNKS.length - 1],
      beam = new TH3.Mesh(new TH3.CylinderGeometry(110, 110, x1 - x0 + 900, 8), mat);
    beam.rotation.z = Math.PI / 2;
    beam.position.set((x0 + x1) / 2, 1720, z - 60);
    g.add(beam);
    scene.add(g);
    TR3.g = g;
  }
  function branchState(id) {
    const b = (typeof BRF === 'function' && BRF()[id]) || {},
      down = typeof isDown === 'function' && isDown(id),
      weak = !FREE && typeof secured === 'function' && !secured(id) ? b.w || 0 : 0;
    return { down, weak, key: (down ? 'd' : '') + (weak >= 0.8 ? '2' : weak >= 0.5 ? '1' : '0') };
  }
  function buildBranch(id) {
    const old = BR[id];
    if (old) {
      scene.remove(old.g);
      old.g.traverse((o) => {
        if (o.geometry && !o.isSprite && !o.geometry.userData.shared) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
    }
    const st = branchState(id),
      g = new TH3.Group(),
      [cx, cz] = CW[id],
      zT = TRUNKZ(),
      tx = TRUNKS.reduce((b, t) => (Math.abs(t - cx) < Math.abs(b - cx) ? t : b), TRUNKS[0]),
      dir = (id.charCodeAt(0) + id.charCodeAt(2)) % 2 ? 1 : -1,
      R0 = rng('rama3' + id);
    const A = V3(cx, HW + 24 + 2, cz - R * Math.sin(Math.PI / 3) + 6),
      H = 760 + R0() * 420,
      D = V3(tx + dir * 20, H, zT + 40);
    const curve = new TH3.CubicBezierCurve3(
      A,
      V3(cx + dir * 40, A.y + 260, A.z - 80),
      V3(lerp(tx, cx, 0.5) - dir * 260, H - 320, lerp(zT, A.z, 0.45)),
      D,
    );
    const weakC = st.weak >= 0.5,
      bark = weakC ? '#6A4A36' : '#8A5A36';
    let u0 = 0;
    const parts = [];
    if (st.down) {
      u0 = 0.36;
      const sub = new TH3.CubicBezierCurve3(
        curve.getPointAt(u0),
        curve.getPointAt(lerp(u0, 1, 0.33)),
        curve.getPointAt(lerp(u0, 1, 0.66)),
        D,
      );
      const m = tube(sub, 18, 6, lerp(3.5, 15, u0), 15, bark);
      m.geometry.userData.u = m.geometry.userData.u.map(() => 1);
      g.add(m);
      /* la raíz de la que cuelga ahora el cuarto */ const q = curve.getPointAt(u0);
      const vine = new TH3.CatmullRomCurve3([
        A.clone(),
        V3(lerp(A.x, q.x, 0.4) + 22, lerp(A.y, q.y, 0.4), lerp(A.z, q.z, 0.4)),
        V3(lerp(A.x, q.x, 0.75) - 14, lerp(A.y, q.y, 0.75), lerp(A.z, q.z, 0.75)),
        q.clone(),
      ]);
      const vm = tube(vine, 16, 5, 2.4, 3.2, '#6A4428');
      g.add(vm);
      parts.push(vm);
      for (let k = 0; k < 5; k++) {
        const s = new TH3.Mesh(BOX, new TH3.MeshLambertMaterial({ color: '#7A5234' }));
        s.scale.set(2, 10 + (k % 2) * 6, 2);
        s.position.set(q.x + (k - 2) * 4, q.y - 5, q.z);
        s.rotation.z = (k - 2) * 0.3;
        g.add(s);
      }
    } else {
      const m = tube(curve, 24, 6, 3.2, 15, bark);
      g.add(m);
      parts.push(m);
    }
    /* ramitas y hojas: con savia, verdes; secas, pocas y marrones */
    const leaves = [];
    if (!st.down) {
      for (let k = 0; k < 2; k++) {
        const u = 0.2 + k * 0.22,
          q = curve.getPointAt(u),
          sg = (k % 2 ? 1 : -1) * dir,
          tip = V3(q.x + sg * 70, q.y + 42, q.z + 10);
        const tw = tube(new TH3.QuadraticBezierCurve3(q, V3(lerp(q.x, tip.x, 0.5), q.y + 6, q.z + 5), tip), 6, 4, 2.2, 1.2, bark);
        const tu = tw.geometry.userData;
        tu.u = tu.u.map(() => u);
        g.add(tw);
        parts.push(tw);
        const nl = weakC ? 1 : 3;
        for (let m = 0; m < nl; m++)
          leaves.push({
            p: V3(tip.x - sg * m * 12, tip.y - m * 4, tip.z),
            a: sg > 0 ? -0.5 + m * 0.35 : Math.PI + 0.5 - m * 0.35,
            u,
            col: weakC ? '#8A6A3A' : m % 2 ? '#8FA86A' : '#B5C47E',
          });
      }
      if (!weakC)
        for (let k = 0; k < 4; k++) {
          const u = 0.08 + R0() * 0.45,
            q = curve.getPointAt(u),
            sg = k % 2 ? 1 : -1;
          leaves.push({ p: V3(q.x + sg * 8, q.y + 2, q.z), a: sg > 0 ? -0.3 : Math.PI + 0.3, u, col: k % 2 ? '#8FA86A' : '#A8BC78' });
        }
    }
    const lm = new TH3.MeshLambertMaterial({ map: leafTex3(), transparent: true, alphaTest: 0.3, side: TH3.DoubleSide });
    const lf = [];
    for (const L of leaves) {
      const m = new TH3.Mesh(new TH3.PlaneGeometry(26, 12), lm.clone());
      m.material.color.set(L.col);
      m.position.copy(L.p);
      m.rotation.set(-0.3, 0.2, L.a);
      m.userData = { u: L.u, y0: L.p.y };
      g.add(m);
      lf.push(m);
    }
    scene.add(g);
    BR[id] = { g, parts, lf, key: st.key, dy: null, curve, u0, st, sap: null };
    return BR[id];
  }
  function branchesTick(dt) {
    if (typeof TRUNKS === 'undefined') return;
    trunks();
    const showAll = !inTitle && !FREE;
    TR3.g.visible = showAll;
    {
      const op = lerp(0.22, 1, clamp((CAM.e ?? 1) * 1.3, 0, 1));
      if (TR3.op !== op) {
        TR3.op = op;
        TR3.g.traverse((o) => {
          if (o.material) {
            o.material.transparent = op < 0.99;
            o.material.opacity = op;
            o.material.depthWrite = op > 0.99;
          }
        });
      }
    }
    for (const id of ORDER) {
      const risen = typeof isRisen === 'function' ? isRisen(id) : true,
        ris = typeof RISE !== 'undefined' && RISE[id] && T >= RISE[id].t0 && T < RISE[id].t0 + RISE[id].dur;
      const want = showAll && (risen || ris) && !(typeof RISE !== 'undefined' && RISE[id] && T < RISE[id].t0);
      let b = BR[id];
      const sunk = (SINKV[id] || 0) > 30;
      if (!want || sunk) {
        if (b) b.g.visible = false;
        continue;
      }
      const st = branchState(id);
      if (!b || b.key !== st.key) b = buildBranch(id);
      b.g.visible = true;
      const dy = lift(id);
      if (b.dy === null || Math.abs(dy - b.dy) > 0.25) {
        b.dy = dy;
        for (const m of b.parts) bend(m, dy);
        for (const m of b.lf) m.position.y = m.userData.y0 + dy * Math.pow(1 - m.userData.u, 1.6);
      }
      {
        const op = lerp(0.32, 1, clamp((CAM.e ?? 1) * 1.4, 0, 1));
        if (b.op !== op) {
          b.op = op;
          b.g.traverse((o) => {
            if (o.material && !o.isSprite) {
              o.material.transparent = op < 0.99 || !!o.material.map;
              o.material.opacity = op;
              o.material.depthWrite = op > 0.99;
            }
          });
        }
      }
      if (st.weak >= 0.8 && !STILL) b.g.rotation.z = Math.sin(T * 2.2 + id.charCodeAt(0)) * 0.004;
      else b.g.rotation.z = 0;
      /* rama a punto de ceder: un brillo rojizo en la grieta */
      if (st.weak >= 0.8 && !st.down) {
        if (!b.warn) {
          b.warn = glowSprite('#E65A28', 70, 0.3);
          b.g.add(b.warn);
        }
        const q = b.curve.getPointAt(0.12);
        b.warn.position.set(q.x, q.y + dy * Math.pow(0.88, 1.6), q.z);
        b.warn.material.opacity = 0.28 + 0.16 * Math.sin(T * 6);
      }
      /* savia: gotas doradas que bajan hacia el cuarto */
      const sapK = typeof SAP !== 'undefined' && SAP[id] && T - SAP[id] < 4 ? 1 - (T - SAP[id]) / 4 : 0,
        flow = (!st.weak && !st.down && !STILL && id === cur) || sapK > 0;
      if (flow) {
        if (!b.sap) {
          b.sap = [];
          for (let k = 0; k < 8; k++) {
            const s = glowSprite('#FFC45A', 14, 0);
            b.g.add(s);
            b.sap.push(s);
          }
        }
        const n = sapK > 0 ? 8 : 3;
        b.sap.forEach((s, k) => {
          if (k >= n) {
            s.visible = false;
            return;
          }
          s.visible = true;
          const u = 1 - ((T * (sapK > 0 ? 0.35 : 0.08) + k / n) % 1),
            q = b.curve.getPointAt(Math.max(b.u0, u));
          s.position.set(q.x, q.y + dy * Math.pow(1 - u, 1.6), q.z);
          s.material.opacity = 0.45 + sapK * 0.5;
          const sz = 10 + sapK * 14;
          s.scale.set(sz, sz, 1);
        });
      } else if (b.sap) for (const s of b.sap) s.visible = false;
    }
  }

  /* ══════════ LA MADRIGUERA EN 3D · el escondite debajo del escenario ══════════ */
  const MD = { scene: null, cards: {}, pl: null, pom: null, lamp: null, on: false, res: 0 };
  /* pluma sin proyección (para dibujitos dentro de un dibujo) */
  const subPen = (g, ox, oy, s, seed) => {
    const pj = window.PENPROJ;
    window.PENPROJ = null;
    const q = STYLE.Pen(g, ox, oy, s, seed);
    window.PENPROJ = pj;
    return q;
  };
  function madrArt(p) {
    const g = p.g,
      s = p.s;
    shell(p, MAD_PAL);
    const pin = (e, u, z, w, h, draw) => {
      const Q = wallRect(p, e, u - w / 600, u + w / 600, z - h / 2, z + h / 2, -2);
      p.cut(Q, '#FFF8E8', { blur: 3, rough: 0.4 });
      const c0 = p.W(wallPt(e, u, z, -3));
      if (Number.isFinite(c0[0])) draw(c0);
      p.flat(p.ell(...p.W(wallPt(e, u, z + h / 2 - 3, -3)), 2, 2, 8), '#C94A4A');
    };
    pin(EL, 0.25, 78, 40, 34, (c) => {
      p.flat(p.ell(c[0], c[1], 7, 7, 14), '#F2B632');
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        p.line(
          [
            [c[0] + Math.cos(a) * 9 * s, c[1] + Math.sin(a) * 9 * s],
            [c[0] + Math.cos(a) * 13 * s, c[1] + Math.sin(a) * 13 * s],
          ],
          '#F2B632',
          1.4,
        );
      }
    });
    pin(EL, 0.62, 86, 44, 36, (c) => {
      drawPompon(subPen(g, c[0] - 2 * s, c[1] + 10 * s, s * 0.55, 'dib'), 0, 0, 0, 1, 0);
    });
    pin(ET, 0.2, 92, 40, 40, (c) => {
      drawNala(subPen(g, c[0], c[1] + 16 * s, s * 0.38, 'dib2'), 0, 0, 0, { noShadow: true });
    });
    pin(ET, 0.78, 80, 46, 30, (c) => {
      for (let k = 0; k < 3; k++)
        p.line(
          [
            [c[0] - 16 * s, c[1] - 8 * s + k * 7 * s],
            [c[0] + 16 * s, c[1] - 8 * s + k * 7 * s],
          ],
          ['#E86A8A', '#3AA7A0', '#E4A844'][k],
          2.2,
        );
    });
    pin(ER, 0.5, 84, 42, 34, (c) => {
      p.line([...hexPts(c, 10, s), hexPts(c, 10, s)[0]], '#C47A2C', 2);
      p.text('♥', c[0], c[1], 10, '#D84A5A');
    });
    for (const [e, u] of [
      [EL, 0.45],
      [ET, 0.5],
      [ER, 0.2],
    ]) {
      const pts = [];
      for (let k = 0; k <= 8; k++) {
        const z = HW + 26 - k * 14;
        pts.push(p.W(wallPt(e, u + Math.sin(k * 0.9) * 0.03, z, -4)));
      }
      p.line(pts, '#6E4424', 5, 1, { sh: 1 });
      p.line(pts, '#8A5A34', 2, 0.8);
    }
    const rc = [0, 40];
    for (const [r, col] of [
      [118, '#C9304A'],
      [104, '#F28C28'],
      [90, '#E8508A'],
      [76, '#1BA7B5'],
      [62, '#7B3FC4'],
      [48, '#F2C94C'],
      [34, '#C9304A'],
      [20, '#1BA7B5'],
    ])
      p.cut(p.ring(rc[0], rc[1], 0.6, r, r * 0.92, 40), col, { rough: 0.5, sh: r === 118 ? 1 : 0, blur: 3 });
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * TAU,
        q = p.P(rc[0] + Math.cos(a) * 111, rc[1] + Math.sin(a) * 102, 0.8);
      p.flat(
        [
          [q[0], q[1] - 3 * s],
          [q[0] + 3 * s, q[1]],
          [q[0], q[1] + 3 * s],
          [q[0] - 3 * s, q[1]],
        ],
        '#FFF6D8',
        0.9,
      );
    }
    for (const e of [EL, ET, ER])
      for (let k = 1; k < 10; k++) {
        const u = k / 10,
          q = p.W(wallPt(e, u, HW - 6 - Math.sin(u * Math.PI) * 14, -3));
        p.flat(p.ell(q[0], q[1], 2.2, 2.2, 8), ['#FFD36A', '#FF9AA8', '#9AE0FF'][k % 3]);
      }
    spotDraw(
      p,
      MSPOT.find((x) => x.note),
      0,
    );
    spotDraw(
      p,
      MSPOT.find((x) => x.exit),
      0,
    );
  }
  const MCELL = { id: 'madr', base: madrArt, doors: [], props: [], npc: null };
  function madrBuild() {
    if (MD.scene) return;
    const sc = new TH3.Scene();
    sc.fog = new TH3.Fog(0x1c120e, 1800, 4200);
    MD.scene = sc;
    sc.add(new TH3.HemisphereLight(0xffe6c8, 0x5a3422, 1.7));
    const sun = new TH3.DirectionalLight(0xffe8d0, 0.8);
    sun.position.set(-0.3, 1, 0.8);
    sc.add(sun);
    MD.lamp = new TH3.PointLight(0xffb060, 2.4, 760, 1.3);
    MD.lamp.position.set(-175, 90, -110);
    sc.add(MD.lamp);
    const res = COARSE ? 896 : 1280,
      grp = new TH3.Group();
    sc.add(grp);
    MD.grp = grp;
    grp.add(new TH3.Mesh(floorGeo(), new TH3.MeshLambertMaterial({ map: tex(floorTex('madr', res, MCELL)) })));
    grp.add(new TH3.Mesh(slabGeo(MCELL), new TH3.MeshLambertMaterial({ vertexColors: true })));
    for (const e of BACK) {
      const W = wallGeo(MCELL, e);
      grp.add(
        new TH3.Mesh(W.g, [
          new TH3.MeshLambertMaterial({ map: tex(wallTex('madr', e, Math.round(res * 0.5), MCELL)) }),
          new TH3.MeshLambertMaterial({ color: MAD_PAL.walls ? '#D9A0A8' : C.honey }),
        ]),
      );
    }
    /* raíces que sostienen el hueco desde arriba */
    const R0 = rng('raizm3');
    for (let k = 0; k < 7; k++) {
      const x = (R0() - 0.5) * 640,
        z = -220 + R0() * 140,
        top = V3(x * 1.3, 900, z - 200),
        mid = V3(x, HW + 180, z - 60),
        bot = V3(x * 0.8, HW + 10, Math.max(z, -250));
      grp.add(tube(new TH3.CatmullRomCurve3([bot, mid, top]), 14, 5, 5 + R0() * 3, 14 + R0() * 8, k % 2 ? '#3A2416' : '#4A2E1C'));
    }
    /* el colchón con su edredón */
    const mat = {
      id: 'colchon',
      y: -190,
      bb: [-90, -235 * K - 40, 80, -190 * K + 12],
      draw: (p) => {
        box3P(p, -80, 70, -235, -190, 0, 16, '#E9D2C0', '#D6BCA8', '#F6E6D6', { rough: 0.3 });
        for (let i = 0; i < 5; i++)
          for (let j = 0; j < 2; j++) {
            const c0 = p.P(-72 + i * 30, -230 + j * 20, 16.5);
            p.flat(
              [
                [c0[0], c0[1]],
                [c0[0] + 28 * p.s, c0[1]],
                [c0[0] + 28 * p.s, c0[1] + 10 * p.s * K],
                [c0[0], c0[1] + 10 * p.s * K],
              ],
              (i + j) % 2 ? '#F2C6D2' : '#FBE7B4',
              0.95,
            );
          }
      },
    };
    const mc = propCard('madr', mat, COARSE ? 1.6 : 2.2);
    mc.userData.follow = 0.3;
    grp.add(mc);
    /* tú y Pompón */
    const mkFig = (box, sb) => {
      const w = Math.round((box[2] - box[0]) * sb),
        h = Math.round((box[3] - box[1]) * sb),
        c = newCanvas(w, h),
        mesh = cardMesh(c, w / sb, h / sb, { nomip: true }),
        g = new TH3.Group();
      mesh.position.set(0, -box[1] - h / sb / 2, 0);
      g.add(mesh);
      const sh = new TH3.Mesh(blobGeo(), blobMat());
      sh.rotation.x = -Math.PI / 2;
      sh.renderOrder = 1;
      sc.add(sh);
      sc.add(g);
      return { g, mesh, c, sb, box, sh, last: -1 };
    };
    MD.pl = mkFig(PBOX, COARSE ? 2 : 2.6);
    MD.pom = mkFig([-56, -96, 56, 26], COARSE ? 2 : 2.6);
    if (LPON()) {
      for (const [F, lp] of [
        [MD.pl, LP3D.human(LP3D.fromAvatar(AVATAR))],
        [MD.pom, LP3D.pompon()],
      ]) {
        F.lp = lp;
        F.g.add(lp.root);
        F.hd = 0;
        F.ph = 0;
        F.walk = 0;
      }
      MD.pom.sh.scale.setScalar(0.6);
    }
  }
  function madrSpotKey(S) {
    return (M.lift[S.id] > 0.5 ? 1 : 0) + '|' + (S.pile ? (MF().nala ? 1 : 0) : '');
  }
  function madrCards() {
    for (const S of MSPOT) {
      if (S.note || S.exit) continue;
      const k = madrSpotKey(S),
        old = MD.cards[S.id];
      if (old && old.key === k) continue;
      if (old) {
        MD.grp.remove(old.m);
        old.m.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            if (o.material.map) o.material.map.dispose();
            o.material.dispose();
          }
        });
      }
      const pr = {
        id: 'sp' + S.id + k,
        y: S.y + (S.id === 'fuerte' ? 26 : 18),
        bb: [S.x - 86, S.y * K - (S.h + 80), S.x + 86, S.y * K + 40],
        draw: (p) => spotDraw(p, S, 0),
      };
      const m = propCard('madr', pr, COARSE ? 1.6 : 2.2);
      m.userData.follow = 0.4;
      MD.grp.add(m);
      MD.cards[S.id] = { key: k, m };
    }
  }
  function madrFig(F, x, y, draw, o = {}) {
    const u3 = !!F.lp && CH3D();
    F.mesh.visible = !u3;
    if (F.lp) F.lp.root.visible = u3;
    if (u3) {
      const dt = FDT,
        dx = x - (F.px ?? x),
        dy = y - (F.py ?? y),
        mv = Math.hypot(dx, dy);
      F.px = x;
      F.py = y;
      const tg = mv > 0.1 && mv < 60 ? Math.atan2(dx, dy) : Math.atan2(o.f || 1, 1.1);
      F.hd = STILL ? tg : LP3D.turn(F.hd, tg, Math.min(1, dt * 10));
      if (o.pom) LP3D.animPom(F.lp, { t: T, hop: o.hop || 0, sniff: o.sniff, still: STILL });
      else {
        F.walk = lerp(F.walk, o.moving ? 1 : 0, Math.min(1, dt * 9));
        if (F.walk > 0.02) F.ph += dt * 10.5;
        LP3D.animate(F.lp, { t: T, dt, walk: F.walk, ph: F.ph, ex: 'smile', still: STILL });
      }
      F.g.position.set(x, 0, y);
      F.g.rotation.y = F.hd;
      F.sh.position.set(x + 4, 0.8, y + 3);
      return;
    }
    if (T - F.last >= 1 / 30) {
      F.last = T;
      drawFigure(F.c, F.sb, F.box, draw);
      F.mesh.material.map.needsUpdate = true;
    }
    F.g.position.set(x, 0, y);
    F.g.rotation.y = MD.yaw || 0;
    F.sh.position.set(x + 4, 0.8, y + 3);
  }
  function madrRender(dt) {
    if (!renderer) return;
    madrBuild();
    if (!MD.on) {
      MD.on = true;
      renderer.setClearColor(0x1c120e, 1);
      MD.cam = null;
    }
    madrCards();
    const P = M.pl;
    madrFig(MD.pl, P.x, P.y, (p) => STYLE.player(p, 0, 0, 0, P.f, T, P.moving), { f: P.f, moving: P.moving });
    const P0 = M.pom;
    MD.pom.g.visible = MD.pom.sh.visible = !!(P0 && P0.found);
    if (P0 && P0.found)
      madrFig(MD.pom, P0.x, P0.y, (p) => drawPompon(p, 0, 0, 0, P0.f, T, { hop: P0.hop || 0, sniff: P0.sniff }), {
        pom: 1,
        f: P0.f,
        hop: P0.hop || 0,
        sniff: P0.sniff,
      });
    MD.lamp.intensity = 2.4 * (STILL ? 1 : 0.92 + 0.08 * Math.sin(T * 9) * Math.sin(T * 3.1));
    /* cámara: de frente, siguiendo un poco a quien busca */
    const yaw = STILL ? 0 : Math.sin(T * 0.12) * 0.07;
    MD.yaw = yaw * 0.5;
    const d = roomFit() * 0.96,
      tx = lerp(0, P.x, 0.22),
      tz = lerp(20, P.y, 0.18),
      pit = 0.62;
    const k = MD.cam ? Math.min(1, dt * 3) : 1;
    MD.cam = MD.cam || { x: tx, z: tz };
    MD.cam.x = lerp(MD.cam.x, tx, k);
    MD.cam.z = lerp(MD.cam.z, tz, k);
    camera.position.set(MD.cam.x + Math.sin(yaw) * Math.cos(pit) * d, 30 + Math.sin(pit) * d, MD.cam.z + Math.cos(yaw) * Math.cos(pit) * d);
    camera.lookAt(MD.cam.x, 30, MD.cam.z);
    camera.near = Math.max(10, d * 0.05);
    camera.far = d * 8 + 4000;
    camera.updateProjectionMatrix();
    for (const id in MD.cards) MD.cards[id].m.rotation.y = yaw * 0.4;
    renderer.render(MD.scene, camera);
  }
  function madrOff() {
    if (!MD.on) return;
    MD.on = false;
    renderer.setClearColor(0x000000, 0);
    CAM.ready = false;
  }
  /* proyección a la capa de la madriguera */
  function projM(x, y, z) {
    const q = projW(x, z, y);
    return q;
  }
  function penM(seed, a, vol = false) {
    FOC = cv.height / 2 / Math.tan((camera.fov * Math.PI) / 360);
    _q.set(a[0], a[2], a[1]).applyMatrix4(camera.matrixWorldInverse);
    const s = -_q.z > 1 ? FOC / -_q.z : 1,
      prev = window.PENPROJ;
    window.PENPROJ = (x, y, z) => projM(x, y, z);
    const p = STYLE.Pen(M.g, 0, 0, s, seed, true, vol);
    window.PENPROJ = prev;
    return p;
  }
  const spotPt = (S) => (S.note ? wallPt(EL, 0.78, 86, -3) : [S.x, S.y, S.h * 0.5]);
  function madrOver() {
    const g = M.g,
      W = mEl.width,
      H = mEl.height;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, H);
    const P0 = M.pom;
    if (P0 && !P0.found && M.peek && M.t - M.peek.t0 < 1.3) {
      const S = MSPOT.find((s) => s.id === P0.spot),
        u = (M.t - M.peek.t0) / 1.3,
        up = Math.sin(Math.PI * Math.min(1, u * 1.4)),
        pk = PEEK[P0.spot];
      tryD(() =>
        drawPompon(penM('pk', [S.x + pk[0], S.y + pk[1], pk[2]]), S.x + pk[0], S.y + pk[1], pk[2] * up, 1, T, {
          mode: M.peek.kind,
          peek: 0,
        }),
      );
    }
    if (M.scurry) {
      const u = (M.t - M.scurry.t0) / 0.55;
      if (u >= 1) M.scurry = null;
      else {
        const x = lerp(M.scurry.a.x, M.scurry.b.x, u),
          y = lerp(M.scurry.a.y, M.scurry.b.y, u),
          z = 6 + Math.abs(Math.sin(u * TAU * 2)) * 10,
          p = penM('sc', [x, y, z]),
          q = p.P(x, y, z);
        p.cut(fluff(q[0], q[1], 10, 7, 16, 2, rng('sc'), p.s), '#FCFBF7', { rough: 0.4, sh: 0 });
      }
    }
    if (!STILL) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 26; k++) {
        const q = projM(-200 + ((k * 97 + T * 6) % 400), -200 + ((k * 53) % 360), 40 + ((k * 31 + T * 9) % 120));
        if (!Number.isFinite(q[0])) continue;
        g.fillStyle = `rgba(255,230,180,${0.18 + 0.12 * Math.sin(T + k)})`;
        g.beginPath();
        g.arc(q[0], q[1], 1.4 * DPR, 0, TAU);
        g.fill();
      }
      g.restore();
    }
    const near = madrNear(),
      hv = M.hover || near;
    if (hv) {
      const a = spotPt(hv),
        p = penM('hv', a),
        q = p.P(...a);
      if (Number.isFinite(q[0])) {
        g.save();
        g.globalCompositeOperation = 'lighter';
        p.flat(p.ell(q[0], q[1], 46, 28, 20), 'rgba(255,220,150,.16)');
        g.restore();
        g.save();
        g.font = `600 ${Math.round(15 * DPR)}px Fraunces, 'Noto Serif', 'Noto Serif SC', Georgia, serif`;
        g.textAlign = 'center';
        const txt = _t(hv.label) + (near === hv && !COARSE ? ' · E' : ''),
          w = g.measureText(txt).width + 22 * DPR,
          y = q[1] - 56 * p.s;
        g.fillStyle = 'rgba(251,244,227,.96)';
        g.fillRect(q[0] - w / 2, y - 17 * DPR, w, 26 * DPR);
        g.fillStyle = '#4A3222';
        g.fillText(txt, q[0], y + 2 * DPR);
        g.restore();
      }
    }
  }
  function madrHit(cx, cy) {
    const sx = cx * DPR,
      sy = cy * DPR;
    let hit = null,
      bd = 1e9;
    for (const S of MSPOT) {
      const a = spotPt(S),
        q = projM(...a),
        s = sAtM(a);
      const d = Math.hypot(sx - q[0], sy - q[1]);
      if (d < Math.max(60 * s, 34 * DPR) && d < bd) {
        bd = d;
        hit = S;
      }
    }
    if (hit) return { spot: hit };
    _nd.set((cx / cv.clientWidth) * 2 - 1, -(cy / cv.clientHeight) * 2 + 1);
    ray.setFromCamera(_nd, camera);
    _pl.constant = 0;
    if (!ray.ray.intersectPlane(_pl, _hp)) return null;
    return { x: _hp.x, y: _hp.z };
  }
  function sAtM(a) {
    _q.set(a[0], a[2], a[1]).applyMatrix4(camera.matrixWorldInverse);
    return -_q.z > 1 ? FOC / -_q.z : 1;
  }
  Object.assign(Q, {
    madrRender,
    madrOver,
    madrOff,
    madrHit,
    renderNow: () => {
      if (renderer) renderer.render(MD.on ? MD.scene : scene, camera);
    },
    get canvas() {
      return cv3;
    },
  });

  /* ══ Pompón en la colmena: un recorte que te sigue ══ */
  let POMC = null;
  function pomCard() {
    if (POMC && (!!POMC.lp !== CH3D() || (!POMC.lp && !!POMC.lit !== LPON()))) {
      scene.remove(POMC.g);
      scene.remove(POMC.sh);
      POMC = null;
    }
    if (POMC) return POMC;
    if (CH3D()) {
      const g = new TH3.Group(),
        lp = LP3D.pompon();
      g.add(lp.root);
      scene.add(g);
      const sh = new TH3.Mesh(blobGeo(), blobMat());
      sh.rotation.x = -Math.PI / 2;
      sh.scale.setScalar(0.6);
      sh.renderOrder = 1;
      scene.add(sh);
      return (POMC = { g, sh, lp, hd: 0, last: -1 });
    }
    const box = [-56, -96, 56, 30],
      sb = COARSE ? 2 : 2.6,
      w = Math.round((box[2] - box[0]) * sb),
      h = Math.round((box[3] - box[1]) * sb),
      c = newCanvas(w, h),
      LITC = LPON(),
      mesh = cardMesh(c, w / sb, h / sb, { nomip: true, lit: LITC }),
      g = new TH3.Group();
    mesh.position.set(0, -box[1] - h / sb / 2, 0);
    g.add(mesh);
    scene.add(g);
    if (LITC) paperDress(g, mesh, 0.62);
    const sh = new TH3.Mesh(blobGeo(), blobMat());
    sh.rotation.x = -Math.PI / 2;
    sh.scale.setScalar(0.7);
    sh.renderOrder = 1;
    scene.add(sh);
    return (POMC = { g, mesh, c, sb, box, sh, last: -1, lit: LITC });
  }
  function pomTick3() {
    const on = typeof POM !== 'undefined' && MF().pom && POM.here === cur && !crossing && !Pl.onPath && !inTitle;
    if (!on) {
      if (POMC) {
        POMC.g.visible = POMC.sh.visible = false;
      }
      return;
    }
    const P = pomCard();
    P.g.visible = P.sh.visible = true;
    const jit = POM.fear > 0 && !STILL ? Math.sin(T * 60) * 1.2 : 0;
    if (P.lp) {
      const w = worldOf(cur, POM.x + jit, POM.y, 0),
        dx = w.x - (P.wx ?? w.x),
        dz = w.z - (P.wz ?? w.z),
        mv = Math.hypot(dx, dz);
      P.wx = w.x;
      P.wz = w.z;
      const tg = mv > 0.1 && mv < 60 ? Math.atan2(dx, dz) : Math.atan2(POM.f || 1, 0.8);
      P.hd = STILL ? tg : LP3D.turn(P.hd, tg, Math.min(1, FDT * 9));
      LP3D.animPom(P.lp, { t: T, hop: POM.hop || 0, sniff: POM.sniff, still: STILL });
      P.g.position.copy(w);
      P.g.rotation.y = P.hd;
      P.sh.position.set(w.x + 2, w.y + 0.7, w.z + 2);
      return;
    }
    if (T - P.last >= 1 / (POM.hop > 0.5 || POM.sniff ? (COARSE ? 20 : 30) : COARSE ? 8 : 14)) {
      P.last = T;
      drawFigure(P.c, P.sb, P.box, (p) => {
        drawPompon(p, 0, 0, 0, POM.f, T, { hop: POM.hop, sniff: POM.sniff, sc: 0.9 });
        if (POM.sniff && !STILL && Math.sin(T * 2) > 0.2) {
          const q = p.P(POM.f * 14, 0, 40);
          p.text('?', q[0], q[1], 12, '#8A5A34');
        }
      });
      P.mesh.material.map.needsUpdate = true;
    }
    const w = worldOf(cur, POM.x + jit, POM.y, 0);
    P.g.position.copy(w);
    P.g.rotation.y = CAM.yaw;
    P.sh.position.set(w.x + 3, w.y + 0.7, w.z + 2);
  }

  /* ── encender y apagar ── */
  function setOn(v) {
    if (v && !init()) return;
    Q.on = !!v && Q.ok;
    document.body.classList.toggle('g3d', Q.on);
    if (cv3) cv3.hidden = !Q.on;
    if (NBG) NBG.el.hidden = !Q.on;
    const bg = document.getElementById('bg');
    if (bg) bg.style.visibility = Q.on ? 'hidden' : '';
    if (Q.on) {
      resize();
      CAM.ready = false;
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      layout();
    }
  }
  Object.assign(Q, {
    frame,
    setOn,
    resize,
    screenOf,
    worldOf,
    rooms,
    CAM,
    buildRoom,
    dirty: (id) => {
      const r = rooms[id];
      if (r) r.key = 'x';
    },
    pref,
    over,
    onTap3D,
    hoverAt,
    pen3,
    projW,
    sAt,
    edgeCard,
    cardMesh,
    tex,
    paint,
    lift,
    base3,
    rotIn: (dx, dy) => {
      const c = Math.cos(CAM.yaw),
        s = Math.sin(CAM.yaw);
      return [dx * c + dy * s, -dx * s + dy * c];
    },
  });
  Object.defineProperties(Q, {
    camera: { get: () => camera },
    scene: { get: () => scene },
    renderer: { get: () => renderer },
    player: { get: () => player },
    sun: { get: () => sun },
    hemi: { get: () => hemi },
  });
  return Q;
})();
window.R3D = R3D;

/* ══ control en 3D: arrastrar gira la cámara alrededor del cuarto, pellizcar o la rueda acercan,
   tocar camina. Teclado: Q y R giran, 0 vuelve a la vista de frente. Mando: el stick derecho gira. ══ */
window.R3DX = window.R3DX || [];
{
  const P3 = new Map();
  let g3 = null,
    hovT = 0;
  const pt = (e) => {
    const r = cv.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const orbit = (dx, dy) => {
    const C = R3D.CAM,
      k = 2.6 / Math.max(320, Math.min(cv.clientWidth, cv.clientHeight * 1.4));
    C.yawT = clamp(C.yawT - dx * k, -1.2, 1.2);
    C.pitchT = clamp(C.pitchT + dy * k, 0.2, 1.2);
    C.user = T;
  };
  const zoom3 = (z) => {
    Zt = null;
    Z = clamp(z, 1, ZMAX);
    const was = mapMode;
    mapMode = Z < 1.04;
    zoomT = performance.now();
    if (was !== mapMode) {
      mapBtn.textContent = _t(mapMode ? '⤡ Volver al cuarto' : '⤢ Ver el mapa');
      const bm = document.getElementById('bmap');
      if (bm) {
        bm.textContent = mapMode ? '⤡' : '⤢';
        bm.setAttribute('aria-label', _t(mapMode ? 'Volver al cuarto' : 'Ver el mapa'));
      }
    }
  };
  R3D.orbit = orbit;
  R3D.zoom3 = zoom3;
  addEventListener(
    'pointerdown',
    (e) => {
      if (!R3D.on || e.target !== cv) return;
      e.stopImmediatePropagation();
      try {
        cv.setPointerCapture(e.pointerId);
      } catch (_) {}
      const q = pt(e);
      P3.set(e.pointerId, q);
      if (P3.size === 2) {
        const [a, b] = [...P3.values()];
        g3 = { pinch: true, d0: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] };
        gest = true;
      } else if (P3.size === 1) g3 = { p0: q, p: q, t: performance.now(), tap: true };
    },
    true,
  );
  addEventListener(
    'pointermove',
    (e) => {
      if (!R3D.on) return;
      if (!P3.has(e.pointerId)) {
        if (e.target === cv && e.pointerType === 'mouse' && performance.now() - hovT > 90) {
          hovT = performance.now();
          const q = pt(e);
          cv.style.cursor = R3D.hoverAt(q[0], q[1]) ? 'pointer' : 'grab';
        }
        return;
      }
      e.stopImmediatePropagation();
      const q = pt(e);
      P3.set(e.pointerId, q);
      if (g3 && g3.pinch && P3.size >= 2) {
        const [a, b] = [...P3.values()],
          d = Math.hypot(a[0] - b[0], a[1] - b[1]),
          m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        zoom3((Z * d) / g3.d0);
        orbit((m[0] - g3.m[0]) * 0.8, (m[1] - g3.m[1]) * 0.8);
        g3.d0 = d || 1;
        g3.m = m;
        return;
      }
      if (!g3) return;
      if (g3.tap && Math.hypot(q[0] - g3.p0[0], q[1] - g3.p0[1]) > 9) g3.tap = false;
      if (!g3.tap) {
        orbit(q[0] - g3.p[0], q[1] - g3.p[1]);
        gest = true;
        cv.style.cursor = 'grabbing';
      }
      g3.p = q;
    },
    true,
  );
  const up = (e) => {
    if (!R3D.on || !P3.has(e.pointerId)) return;
    e.stopImmediatePropagation();
    if (e.type === 'pointerup' && g3 && g3.tap && !g3.pinch && P3.size === 1 && performance.now() - g3.t < 650) {
      const q = pt(e);
      R3D.onTap3D(q[0], q[1]);
    }
    P3.delete(e.pointerId);
    if (g3 && g3.pinch && P3.size === 1) {
      const q = [...P3.values()][0];
      g3 = { p0: q, p: q, t: 0, tap: false };
    }
    if (!P3.size) {
      g3 = null;
      gest = false;
      cv.style.cursor = '';
    }
  };
  addEventListener('pointerup', up, true);
  addEventListener('pointercancel', up, true);
  addEventListener(
    'wheel',
    (e) => {
      if (!R3D.on || e.target !== cv) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      zoom3(Z * Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0016)));
    },
    { passive: false, capture: true },
  );
  addEventListener('keydown', (e) => {
    if (!R3D.on || inTitle || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const C = R3D.CAM;
    if (e.key === 'q' || e.key === 'Q') {
      C.yawT = clamp(C.yawT + 0.35, -1.2, 1.2);
      C.user = T;
    } else if (e.key === 'r' || e.key === 'R') {
      C.yawT = clamp(C.yawT - 0.35, -1.2, 1.2);
      C.user = T;
    } else if (e.key === '0') {
      C.yawT = 0;
      C.pitchT = 0.56;
    }
  });
  /* stick derecho del mando */
  R3DX.push((dt) => {
    if (padOff || uiLayer() || inTitle) return;
    let gp = null;
    try {
      gp = [...(navigator.getGamepads ? navigator.getGamepads() : [])].find((x) => x);
    } catch (e) {}
    if (!gp) return;
    const x = gp.axes[2] || 0,
      y = gp.axes[3] || 0;
    if (Math.abs(x) > 0.25 || Math.abs(y) > 0.25) {
      const k = dt * 520;
      orbit(Math.abs(x) > 0.25 ? x * k : 0, Math.abs(y) > 0.25 ? y * k * 0.7 : 0);
    }
    if (gp.buttons[11] && gp.buttons[11].pressed) {
      R3D.CAM.yawT = 0;
      R3D.CAM.pitchT = 0.56;
    }
  });
}

/* ══ la madriguera en 3D: misma lógica, otro dibujo; tocar usa el rayo de la cámara ══ */
if (typeof M !== 'undefined') {
  {
    const fb0 = frameBody;
    frameBody = function (now) {
      if (M.on && R3D.on) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        T += dt;
        M.t += dt;
        madrSize();
        if (!M.g) return;
        madrMove(dt);
        madrPom(dt);
        madrPad();
        try {
          R3D.madrRender(dt);
          R3D.madrOver();
        } catch (e) {
          if (!frameBody.e3) {
            frameBody.e3 = 1;
            console.error(e);
          }
        }
        narrTick(dt);
        return;
      }
      fb0(now);
    };
  }
  addEventListener(
    'pointerdown',
    (e) => {
      if (!R3D.on || !M.on || e.target !== mEl) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const r = mEl.getBoundingClientRect(),
        h = R3D.madrHit(e.clientX - r.left, e.clientY - r.top);
      if (!h) return;
      if (h.spot) {
        walkToSpot(h.spot);
        return;
      }
      if (inRoom(h.x, h.y)) M.pl.go = { x: h.x, y: h.y, spot: null };
    },
    true,
  );
  addEventListener(
    'pointermove',
    (e) => {
      if (!R3D.on || !M.on || e.target !== mEl || e.pointerType !== 'mouse') return;
      e.stopImmediatePropagation();
      const r = mEl.getBoundingClientRect(),
        h = R3D.madrHit(e.clientX - r.left, e.clientY - r.top);
      M.hover = h && h.spot ? h.spot : null;
    },
    true,
  );
}

/* ══ modo foto en 3D: se compone el fondo, el diorama y la capa de papel ══ */
addEventListener(
  'click',
  (e) => {
    if (!R3D.on || !e.target.closest || !e.target.closest('#phsave')) return;
    e.stopImmediatePropagation();
    const fail = () => note('Aquí no se puede guardar la foto. Haz una captura de pantalla.');
    try {
      const c = newCanvas(cv.width, cv.height),
        g = c.getContext('2d');
      g.filter = cv.style.filter || 'none';
      const W = c.width,
        H = c.height,
        gr = g.createRadialGradient(W / 2, H * 0.36, 0, W / 2, H * 0.36, Math.hypot(W, H) * 0.62);
      gr.addColorStop(0, '#FFF6E2');
      gr.addColorStop(0.34, '#F8E2B6');
      gr.addColorStop(0.68, '#EBC285');
      gr.addColorStop(1, '#CF9656');
      g.fillStyle = gr;
      g.fillRect(0, 0, W, H);
      R3D.renderNow();
      g.drawImage(R3D.canvas, 0, 0, W, H);
      g.drawImage(cv, 0, 0);
      achieve('photo');
      if (window.claude && window.claude.use) {
        c.toBlob(async (b) => {
          try {
            const dl = await window.claude.use('downloads');
            if (!dl) {
              fail();
              return;
            }
            await dl.save({ filename: 'colmena-foto.png', data: b });
            note('Foto guardada');
          } catch (err) {
            if (!err || err.code !== 'declined') fail();
          }
        }, 'image/png');
      } else {
        const a = document.createElement('a');
        a.download = 'colmena-foto.png';
        a.href = c.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        a.remove();
        note('Foto guardada');
      }
    } catch (err) {
      fail();
    }
  },
  true,
);

/* ══ ajustes: Gráficos · Diorama 3D o Papel clásico 2D ══ */
{
  const row = document.createElement('label');
  row.className = 'row';
  row.id = 'gfxrow';
  row.innerHTML =
    '<span>Gráficos<small>el diorama 3D se puede girar; el papel 2D es más ligero en móviles antiguos</small></span><select id="gfxsel"><option value="3d">Diorama 3D</option><option value="2d">Papel clásico 2D</option></select>';
  const imm = document.getElementById('imm').closest('label');
  imm.before(row);
  const sel = document.getElementById('gfxsel');
  if (!R3D.ok) row.hidden = true;
  const relabel = () => {
    sel.options[0].textContent = _t('Diorama 3D');
    sel.options[1].textContent = _t('Papel clásico 2D');
  };
  const sync = () => {
    relabel();
    sel.value = R3D.on ? '3d' : '2d';
  };
  sel.addEventListener('change', () => {
    try {
      localStorage.setItem('colmena-gfx', sel.value);
    } catch (e) {}
    R3D.setOn(sel.value === '3d');
    note(sel.value === '3d' ? 'Gráficos: diorama 3D' : 'Gráficos: papel clásico 2D');
    if (sel.value === '3d') tip3d(true);
  });
  for (const b of ['bset', 'bset2']) document.getElementById(b).addEventListener('click', sync);
  document.getElementById('lang').addEventListener('change', () => setTimeout(relabel, 0));
  sync();
}
/* la primera vez en 3D: cómo girar la cámara */
function tip3d(force) {
  if (!R3D.on || inTitle) return;
  let seen = false;
  try {
    seen = localStorage.getItem('colmena-tip3d') === '1';
  } catch (e) {}
  if (seen && !force) return;
  try {
    localStorage.setItem('colmena-tip3d', '1');
  } catch (e) {}
  const say = () =>
    note(
      COARSE ? 'Arrastra para girar la cámara · pellizca para acercar' : 'Arrastra para girar la cámara · rueda para acercar · Q y R giran',
    );
  /* una sola instrucción a la vez: espera a que acabe el tutorial */
  if (force) {
    setTimeout(say, 900);
    return;
  }
  const wait = () => {
    const F = PROG.F;
    if (FREE || inTitle || (typeof TUT !== 'undefined' && (F.tut || 0) >= TUT.length)) {
      setTimeout(say, 1500);
      return;
    }
    setTimeout(wait, 2000);
  };
  setTimeout(wait, 4200);
}
{
  const sg0 = startGame;
  startGame = function (fresh) {
    sg0(fresh);
    tip3d(false);
  };
}

/* en 3D no hacen falta las imágenes 2D de cada cuarto: más ligero */
{
  const bc0 = bakeCell;
  bakeCell = function (id) {
    if (R3D.on) {
      R3D.dirty(id);
      return;
    }
    return bc0(id);
  };
}
{
  const bd0 = bakeDark;
  bakeDark = function (id) {
    if (R3D.on) return;
    return bd0(id);
  };
}
{
  const bb0 = bakeBackdrop;
  bakeBackdrop = function () {
    if (R3D.on) return;
    return bb0();
  };
}
if (R3D.ok && R3D.pref() !== '2d' && !/[?&]2d\b/.test(location.search)) R3D.setOn(true);

/* ══ ajustes: personajes de papel o 3D ══ */
{
  const sel = document.getElementById('chars');
  if (sel) {
    try {
      sel.value = localStorage.getItem('colmena-chars') === '3d' ? '3d' : 'paper';
    } catch (e) {}
    sel.addEventListener('change', () => {
      try {
        localStorage.setItem('colmena-chars', sel.value);
      } catch (e) {}
      if (R3D.on) for (const id in R3D.rooms) R3D.dirty(id);
    });
  }
}
