/* ══════════ CLIMA · el aire de cada cuarto (solo versión adulta) ══════════
   Cada cuarto de la tabla recibe UNA cosa en el aire que cuenta su historia: nieve, ventisca, arena que corre,
   brasas, humo, plancton, niebla baja, polvo en la luz… Los cuartos de «noche mojada» (mojado.js) no entran aquí.
   · El motor de Colmena va recortado (sin Points ni sombreadores propios), así que cada efecto es UNA sola malla
     con todas sus partículas dentro (cuatro vértices por partícula) y una sola textura para todos: 1 llamada de dibujo
     (por eso el material lleva `forceSinglePass`: sin él, three.js dibuja dos veces lo transparente de doble cara).
   · Solo se anima el cuarto en el que estás; al salir, su malla se esconde. En modo tranquilo, todo quieto.
   · En móvil, la mitad de partículas. Nada sale del hexágono: las partículas se encogen al acercarse al muro.
   Coordenadas del cuarto: x a la derecha, y hacia la cámara (negativo = fondo), z hacia arriba.
   Capas (k):
     aire   · llena el cuarto y lo cruza con velocidad `v`; si `larg` > 1 son rayas estiradas en el sentido del viento;
              `plano` las tumba sobre el suelo (niebla); `luz: [x, y, radio]` las hace verse solo dentro de esa luz.
     fuente · nacen en `en: [x, y, radio]`, suben de z[0] a z[1] y se apagan (brasas, humo).
     giro   · giran alrededor de `en: [x, y]`; con `sp` van del radio r[0] al r[1] (remolino); sin `sp`, galaxia.
     polvo  · motas dentro de un haz que va de `de` a `a`, con radio r[0] arriba y r[1] abajo.
     rayo   · el propio haz de luz, una cinta que mira a la cámara.
   Para dar aire a otro cuarto basta con añadirlo a CLIMA. */
const CLIMA = {
  /* nevada tranquila: copos finos que caen despacio y de lado */
  inv: {
    op: 0.9,
    capas: [{ k: 'aire', n: 380, v: [10, 4, -17], z: [2, 250], tam: [1.3, 3], bamb: 9, tex: 1, cols: ['#FFFFFF', '#EAF4FA'] }],
  },
  /* ventisca: en el témpano la nieve no cae, cruza */
  ant: {
    op: 0.75,
    rafaga: 0.45,
    capas: [{ k: 'aire', n: 300, v: [-170, 34, -24], z: [3, 200], tam: [1.1, 2.2], larg: 6, bamb: 5, cols: ['#FFFFFF', '#DCEEF6'] }],
  },
  /* arena que corre a ras de suelo, a ráfagas */
  des: {
    op: 0.62,
    rafaga: 0.5,
    capas: [
      {
        k: 'aire',
        n: 260,
        v: [125, 16, 0],
        z: [3, 40],
        bajo: 2.2,
        tam: [1.1, 2.1],
        larg: 8,
        bamb: 3,
        cols: ['#FFF8E0', '#FFEDC0', '#F3D9A0'],
      },
    ],
  },
  /* la columna de brasas que sube del lago de lava */
  vol: {
    add: 1,
    op: 0.9,
    capas: [
      {
        k: 'fuente',
        n: 150,
        en: [120, -170, 78],
        z: [14, 250],
        sp: 0.085,
        der: [-34, 26],
        bamb: 16,
        tam: [1.1, 2.6],
        cols: ['#FF7A2A', '#FFB050', '#FF4A1A', '#FFD890'],
      },
    ],
  },
  /* el humo del órgano de velas, que se deshace antes de llegar arriba */
  sot: {
    op: 0.5,
    capas: [
      {
        k: 'fuente',
        n: 30,
        en: [-122, -212, 38],
        z: [96, 270],
        sp: 0.05,
        der: [40, 46],
        bamb: 12,
        tam: [11, 20],
        crece: 2.2,
        tex: 2,
        cols: ['#E6D8C0', '#CDBDA4'],
      },
    ],
  },
  /* plancton en la corriente: da fondo al agua */
  oce: {
    add: 1,
    op: 0.55,
    capas: [
      { k: 'aire', n: 240, v: [13, 5, 3], z: [6, 230], tam: [0.8, 1.9], bamb: 7, parp: 0.5, cols: ['#DFF8FF', '#BFEFFF', '#FFF6D8'] },
    ],
  },
  /* una galaxia pequeña que gira despacio bajo la cúpula */
  esp: {
    add: 1,
    op: 0.8,
    capas: [
      {
        k: 'giro',
        n: 260,
        en: [0, -30],
        r: [30, 240],
        z: [70, 118],
        brazos: 2,
        gira: 0.035,
        tam: [0.8, 2.3],
        parp: 0.4,
        cols: ['#FFFFFF', '#C8D8FF', '#FFE9A8', '#E6C8FF'],
      },
    ],
  },
  /* niebla baja que se arrastra entre los espejos */
  eco: {
    op: 0.16,
    capas: [{ k: 'aire', n: 16, v: [9, 4, 0], z: [7, 15], tam: [120, 190], plano: 1, tex: 2, cols: ['#C9C0E6', '#A9A0CC'] }],
  },
  /* bruma violeta que la geoda enciende a ras de suelo */
  cue: {
    add: 1,
    op: 0.13,
    capas: [{ k: 'aire', n: 14, v: [-7, 4, 0], z: [6, 13], tam: [120, 180], plano: 1, tex: 2, cols: ['#8A66E0', '#5FB8C8', '#A070E8'] }],
  },
  /* el Corazón reparte luz hacia fuera, a oleadas, como un latido */
  cor: {
    add: 1,
    op: 0.8,
    capas: [
      {
        k: 'giro',
        n: 180,
        en: [0, -76],
        r: [46, 262],
        z: [96, 20],
        vueltas: 0.3,
        sp: 0.045,
        onda: 1,
        tam: [1, 2.3],
        cols: ['#FFE3A0', '#FFD36A', '#FFF4D0'],
      },
    ],
  },
  /* el Reverso es el Corazón del revés: aquí la luz cae en remolino al sol negro del suelo */
  rev: {
    add: 1,
    op: 0.75,
    capas: [
      {
        k: 'giro',
        n: 200,
        en: [-84, 96],
        r: [250, 10],
        z: [120, 5],
        vueltas: 1.25,
        sp: 0.04,
        tam: [0.9, 2.2],
        cols: ['#CFE0FF', '#9FB4E8', '#FFFFFF'],
      },
    ],
  },
  /* viento de altura: rayas blancas que pasan deprisa y jirones de nube que pasan despacio */
  cum: {
    op: 0.34,
    rafaga: 0.4,
    capas: [
      { k: 'aire', n: 90, v: [185, -24, 0], z: [36, 215], tam: [0.9, 1.7], larg: 16, bamb: 4, cols: ['#FFFFFF', '#FFE9DC'] },
      { k: 'aire', n: 7, v: [34, -5, 0], z: [120, 205], tam: [54, 96], tex: 2, cols: ['#FFFFFF', '#FFE4D2'] },
    ],
  },
  /* polvo dentro del rayo de la claraboya (el rayo ya estaba) */
  dsv: {
    add: 1,
    op: 0.85,
    capas: [
      {
        k: 'polvo',
        n: 150,
        de: [31, -220, 380],
        a: [-11, -220, 62],
        r: [11, 40],
        sp: 0.016,
        tam: [0.6, 1.5],
        parp: 0.5,
        cols: ['#FFF0C8', '#FFE2A8'],
      },
    ],
  },
  /* el farol de lo alto de la escalera de caracol: su cono de luz y el polvo de los libros dentro */
  bib: {
    add: 1,
    op: 0.6,
    capas: [
      { k: 'rayo', de: [96, -178, 184], a: [78, -96, 4], r: [7, 88], col: '#FFDFA0', f: 0.55 },
      {
        k: 'polvo',
        n: 120,
        de: [96, -178, 184],
        a: [78, -96, 4],
        r: [5, 70],
        sp: 0.014,
        tam: [0.7, 1.6],
        parp: 0.5,
        cols: ['#FFF0C8', '#FFE3A0'],
      },
    ],
  },
  /* lo perdido cría polvo: se posa en todo el cuarto y solo se ve al pasar por la luz del mostrador */
  per: {
    add: 1,
    op: 0.7,
    capas: [
      {
        k: 'aire',
        n: 190,
        v: [3, 2, -5],
        z: [6, 190],
        tam: [0.8, 1.8],
        bamb: 10,
        luz: [6, -56, 150],
        parp: 0.4,
        cols: ['#FFE9C0', '#FFD9A0'],
      },
    ],
  },
  /* polvo de papel y tinta en la luz de la vela del escritorio */
  est: {
    add: 1,
    op: 0.7,
    capas: [
      {
        k: 'aire',
        n: 160,
        v: [4, 3, -4],
        z: [6, 190],
        tam: [0.8, 1.8],
        bamb: 10,
        luz: [-80, -160, 150],
        parp: 0.4,
        cols: ['#FFE8C0', '#FFD08A'],
      },
    ],
  },
};
if (window.COLMENA_ADULTO && window.R3DX && window.SALAS && window.THREE) {
  const AP = 300 * Math.cos(Math.PI / 6) - 8,
    BX = 296,
    BY = 258,
    HECHO = {},
    CA = new THREE.Color(),
    lerp2 = (a, b, t) => a + (b - a) * t,
    cl01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v),
    envuelve = (v, a, b) => {
      const w = b - a;
      return a + ((((v - a) % w) + w) % w);
    };
  let TEX = null,
    tl = 0,
    antes = null;
  /* una sola textura con cuatro dibujos: mota blanda, copo, jirón de bruma y perfil del haz */
  const textura = () => {
    if (TEX) return TEX;
    TEX = SALAS.kit.ctex(256, 256, (g) => {
      const bola = (x, y, r, paradas) => {
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        for (const [p, a] of paradas) gr.addColorStop(p, `rgba(255,255,255,${a})`);
        g.fillStyle = gr;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      };
      bola(64, 64, 60, [
        [0, 1],
        [0.3, 0.6],
        [1, 0],
      ]);
      bola(192, 64, 60, [
        [0, 1],
        [0.5, 0.95],
        [0.8, 0.3],
        [1, 0],
      ]);
      let s = 77;
      const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
      for (let i = 0; i < 12; i++) {
        const r = 22 + rnd() * 18,
          a = rnd() * 6.283,
          d = rnd() * (58 - r);
        bola(64 + Math.cos(a) * d, 192 + Math.sin(a) * d, r, [
          [0, 0.34],
          [0.5, 0.16],
          [1, 0],
        ]);
      }
      g.save();
      g.beginPath();
      g.rect(128, 128, 128, 128);
      g.clip();
      const h = g.createLinearGradient(130, 0, 254, 0);
      h.addColorStop(0, 'rgba(255,255,255,0)');
      h.addColorStop(0.5, 'rgba(255,255,255,1)');
      h.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = h;
      g.fillRect(130, 130, 124, 124);
      g.globalCompositeOperation = 'destination-in';
      const v = g.createLinearGradient(0, 130, 0, 254);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(0.08, 'rgba(0,0,0,1)');
      v.addColorStop(0.6, 'rgba(0,0,0,.6)');
      v.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = v;
      g.fillRect(128, 128, 128, 128);
      g.restore();
    });
    TEX.generateMipmaps = false;
    TEX.minFilter = THREE.LinearFilter;
    return TEX;
  };
  /* ── monta el efecto de un cuarto: una malla, un material ── */
  function monta(id, c) {
    let s = 0;
    for (const ch of 'clima' + id) s = (Math.imul(s, 31) + ch.charCodeAt(0)) >>> 0;
    const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296,
      entre = (a, b) => a + rnd() * (b - a),
      capas = [],
      uv = [],
      col = [],
      idx = [];
    let total = 0;
    for (const L of c.capas) {
      const n = L.k === 'rayo' ? 1 : Math.max(1, Math.ceil((L.n || 1) * (COARSE ? 0.5 : 1))),
        Q = [],
        celda = L.k === 'rayo' ? 3 : L.tex || 0,
        e = 3 / 256,
        u0 = (celda % 2) * 0.5 + e,
        u1 = (celda % 2) * 0.5 + 0.5 - e,
        v1 = 1 - (celda >> 1) * 0.5 - e,
        v0 = 1 - (celda >> 1) * 0.5 - 0.5 + e;
      for (let i = 0; i < n; i++) {
        const q = {
          p: rnd(),
          s: entre(0.72, 1.28),
          w: rnd() * 6.283,
          t: L.tam ? entre(L.tam[0], L.tam[1]) : 1,
          a: rnd() * 6.283,
          k: Math.sqrt(rnd()),
        };
        if (L.k === 'aire') {
          q.x = entre(-BX, BX);
          q.y = entre(-BY, BY);
          q.z = lerp2(L.z[0], L.z[1], Math.pow(rnd(), L.bajo || 1));
        } else if (L.k === 'fuente') {
          q.x = L.en[0] + Math.cos(q.a) * q.k * L.en[2];
          q.y = L.en[1] + Math.sin(q.a) * q.k * L.en[2] * 0.8;
        } else if (L.k === 'giro' && L.brazos) {
          /* galaxia: los brazos se enroscan hacia fuera y se deshilachan */
          q.a = (Math.floor(rnd() * L.brazos) / L.brazos) * 6.283 + q.p * 4.4 + (rnd() - 0.5) * 1.1;
          q.z = rnd();
          q.p = Math.sqrt(q.p);
        }
        Q.push(q);
        CA.set(L.col || L.cols[i % L.cols.length]).multiplyScalar(L.f || 1);
        for (let k = 0; k < 4; k++) col.push(CA.r, CA.g, CA.b);
        uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
        const b = (total + i) * 4;
        idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
      }
      /* el sentido del viento, ya en coordenadas del mundo, para las rayas */
      let dir = null;
      if (L.larg) {
        const m = Math.hypot(L.v[0], L.v[1], L.v[2]) || 1;
        dir = [L.v[0] / m, L.v[2] / m, L.v[1] / m];
      }
      capas.push({ L, Q, dir, base: total });
      total += n;
    }
    const geo = new THREE.BufferGeometry(),
      pos = new THREE.Float32BufferAttribute(new Float32Array(total * 12), 3);
    pos.usage = 35048;
    geo.setAttribute('position', pos);
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(idx);
    geo.userData.shared = true;
    const mat = SALAS.kit.keep(
        id,
        new THREE.MeshBasicMaterial({
          map: textura(),
          vertexColors: true,
          transparent: true,
          opacity: c.op ?? 1,
          depthWrite: false,
          side: THREE.DoubleSide,
          forceSinglePass: true,
          blending: c.add ? THREE.AdditiveBlending : THREE.NormalBlending,
          fog: false,
        }),
      ),
      malla = new THREE.Mesh(geo, mat);
    malla.frustumCulled = false;
    malla.renderOrder = 4;
    malla.userData.clima = id;
    return { c, capas, pos, mat, malla, total };
  }
  /* ── mueve las partículas del cuarto actual ── */
  function mueve(e, t) {
    const P = e.pos.array,
      m = R3D.camera.matrixWorld.elements,
      rx = m[0],
      ry = m[1],
      rz = m[2],
      ux = m[4],
      uy = m[5],
      uz = m[6],
      fx = m[8],
      fy = m[9],
      fz = m[10];
    /* una partícula = centro (en el mundo: x, alto, y) y dos semiejes */
    const pon = (i, x, h, y, ax, ay, az, bx, by, bz) => {
      const o = i * 12;
      P[o] = x - ax - bx;
      P[o + 1] = h - ay - by;
      P[o + 2] = y - az - bz;
      P[o + 3] = x + ax - bx;
      P[o + 4] = h + ay - by;
      P[o + 5] = y + az - bz;
      P[o + 6] = x + ax + bx;
      P[o + 7] = h + ay + by;
      P[o + 8] = y + az + bz;
      P[o + 9] = x - ax + bx;
      P[o + 10] = h - ay + by;
      P[o + 11] = y - az + bz;
    };
    for (const { L, Q, dir, base } of e.capas) {
      if (L.k === 'rayo') {
        /* la cinta del haz: de arriba abajo, con el ancho girado hacia la cámara */
        const ax = L.a[0] - L.de[0],
          ay = L.a[2] - L.de[2],
          az = L.a[1] - L.de[1];
        let bx = ay * fz - az * fy,
          by = az * fx - ax * fz,
          bz = ax * fy - ay * fx;
        const n = Math.hypot(bx, by, bz) || 1,
          o = base * 12,
          w0 = L.r[0] / n,
          w1 = L.r[1] / n;
        P[o] = L.a[0] - bx * w1;
        P[o + 1] = L.a[2] - by * w1;
        P[o + 2] = L.a[1] - bz * w1;
        P[o + 3] = L.a[0] + bx * w1;
        P[o + 4] = L.a[2] + by * w1;
        P[o + 5] = L.a[1] + bz * w1;
        P[o + 6] = L.de[0] + bx * w0;
        P[o + 7] = L.de[2] + by * w0;
        P[o + 8] = L.de[1] + bz * w0;
        P[o + 9] = L.de[0] - bx * w0;
        P[o + 10] = L.de[2] - by * w0;
        P[o + 11] = L.de[1] - bz * w0;
        continue;
      }
      const bamb = L.bamb || 0;
      /* el semieje corto de las rayas: perpendicular al viento y a la mirada */
      let sx = 0,
        sy = 0,
        sz = 0;
      if (dir) {
        sx = dir[1] * fz - dir[2] * fy;
        sy = dir[2] * fx - dir[0] * fz;
        sz = dir[0] * fy - dir[1] * fx;
        const n = Math.hypot(sx, sy, sz) || 1;
        sx /= n;
        sy /= n;
        sz /= n;
      }
      for (let i = 0; i < Q.length; i++) {
        const q = Q[i];
        let x,
          y,
          z,
          sc = q.t;
        if (L.k === 'aire') {
          x = envuelve(q.x + L.v[0] * t * q.s, -BX, BX) + Math.sin(t * 0.8 + q.w) * bamb;
          y = envuelve(q.y + L.v[1] * t * q.s, -BY, BY) + Math.cos(t * 0.6 + q.w) * bamb * 0.6;
          z = q.z;
          if (L.v[2]) {
            z = envuelve(q.z + L.v[2] * t * q.s, L.z[0], L.z[1]);
            const u = (z - L.z[0]) / (L.z[1] - L.z[0]);
            sc *= Math.min(1, u * 9, (1 - u) * 9);
          }
          if (L.luz) {
            const dx = x - L.luz[0],
              dy = y - L.luz[1];
            sc *= 0.22 + 0.78 * Math.exp(-(dx * dx + dy * dy) / (L.luz[2] * L.luz[2]));
          }
        } else if (L.k === 'fuente') {
          const u = (q.p + t * L.sp * q.s) % 1,
            der = L.der || [0, 0];
          x = q.x + der[0] * u * u + Math.sin(t * 0.9 + q.w) * bamb * u;
          y = q.y + der[1] * u * u + Math.cos(t * 0.7 + q.w) * bamb * u * 0.6;
          z = lerp2(L.z[0], L.z[1], u);
          sc *= (1 + (L.crece || 0) * u) * Math.min(1, u * 6) * Math.min(1, (1 - u) * 2.2);
        } else if (L.k === 'giro') {
          let u = q.p,
            ang = q.a;
          if (L.sp) {
            u = (q.p + t * L.sp * q.s) % 1;
            ang += u * (L.vueltas || 0) * 6.283;
            sc *= Math.min(1, u * 7) * Math.min(1, (1 - u) * 4);
            if (L.onda) sc *= 0.55 + 0.45 * Math.sin(u * 16 - t * 2.3);
            z = lerp2(L.z[0], L.z[1], u) + Math.sin(q.w) * 10;
          } else {
            ang += t * (L.gira || 0) * (1.5 - u);
            z = lerp2(L.z[0], L.z[1], q.z) + Math.sin(t * 0.5 + q.w) * 4;
          }
          const rr = lerp2(L.r[0], L.r[1], u);
          x = L.en[0] + Math.cos(ang) * rr;
          y = L.en[1] + Math.sin(ang) * rr * 0.86;
        } else {
          /* polvo dentro del haz: baja muy despacio y se mece */
          const u = (q.p + t * L.sp * q.s) % 1,
            rr = lerp2(L.r[0], L.r[1], u) * q.k;
          x = lerp2(L.de[0], L.a[0], u) + Math.cos(q.a + t * 0.11 * q.s) * rr;
          y = lerp2(L.de[1], L.a[1], u) + Math.sin(q.a + t * 0.11 * q.s) * rr * 0.7;
          z = lerp2(L.de[2], L.a[2], u) + Math.sin(t * 0.5 + q.w) * 3;
          sc *= Math.min(1, u * 8, (1 - u) * 8);
        }
        if (L.parp) sc *= 1 - L.parp * (0.5 + 0.5 * Math.sin(t * (1.1 + q.s) + q.w * 3));
        /* nada sale del hexágono */
        const ay = Math.abs(y),
          d = Math.max(ay, Math.abs(x) * 0.866 + ay * 0.5);
        sc *= cl01((AP - (L.plano ? q.t * 0.42 : 0) - d) / 28);
        if (sc <= 0.001) pon(base + i, x, z, y, 0, 0, 0, 0, 0, 0);
        else if (L.plano) pon(base + i, x, z, y, sc * Math.cos(q.w), 0, sc * Math.sin(q.w), -sc * Math.sin(q.w), 0, sc * Math.cos(q.w));
        else if (dir) pon(base + i, x, z, y, dir[0] * sc * L.larg, dir[1] * sc * L.larg, dir[2] * sc * L.larg, sx * sc, sy * sc, sz * sc);
        else pon(base + i, x, z, y, rx * sc, ry * sc, rz * sc, ux * sc, uy * sc, uz * sc);
      }
    }
    e.pos.needsUpdate = true;
    if (e.c.rafaga) e.mat.opacity = (e.c.op ?? 1) * (1 - e.c.rafaga * (0.5 + 0.5 * Math.sin(t * 0.47) * Math.sin(t * 0.19 + 1)));
  }
  window.CLIMA_DBG = () => ({ cuarto: antes, particulas: antes && HECHO[antes] ? HECHO[antes].total : 0 });
  R3DX.push((dt) => {
    if (!window.R3D || !R3D.rooms || !R3D.camera) return;
    const c = !inTitle && !mapMode && CLIMA[cur];
    /* al salir del cuarto (o abrir el mapa), su aire se esconde y deja de costar */
    if (antes && (!c || antes !== cur)) {
      if (HECHO[antes]) HECHO[antes].malla.visible = false;
      antes = null;
    }
    if (!c) return;
    const r = R3D.rooms[cur];
    if (!r || !r.grp) return;
    const e = HECHO[cur] || (HECHO[cur] = monta(cur, c));
    /* si el cuarto se reconstruyó, la malla se muda al grupo nuevo */
    if (e.malla.parent !== r.grp) r.grp.add(e.malla);
    e.malla.visible = true;
    antes = cur;
    if (!STILL) tl += Math.min(dt || 0.016, 0.1);
    mueve(e, STILL ? 40 : tl + 40);
  });
}
