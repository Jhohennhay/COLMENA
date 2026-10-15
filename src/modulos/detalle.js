/* ══════════ DETALLE · vegetación densa en los cuartos con plantas (versión adulta) ══════════
   Muestra en Primavera, tras ver «El Principito entre las estrellas» (hierba y helechos muy detallados).
   Todo se genera por código, sin modelos descargados: miles de hojas y algunas flores en UNA sola malla por cuarto,
   que el viento (o el agua) mece en la tarjeta gráfica (un retoque al material, sin coste por hoja en el procesador).
   Respeta la receta de los cuartos: crece junto a los muros y al pie de los muebles, más baja hacia delante, y deja
   libre el centro, las puertas, los objetos que se usan y el sitio del vecino. En móvil, la mitad de plantas.
   Tabla DETALLE: cada cuarto tiene su viento y sus capas. Formas de planta:
     hierba  · matas de briznas curvadas (y alguna flor si `flor` > 0)
     helecho · frondas que se arquean con foliolos a los dos lados
     alga    · cintas largas de posidonia que ondulan con una ola que sube por la hoja
     flores  · matas de flores de miel: margaritas, espigas de lavanda y estrellas de borraja, con briznas debajo
   Sitios: `muro` (al pie del muro), `pie` (al pie de los muebles), `suelto` (por todo el suelo libre, solo matas bajas).
   Sin vegetación, a propósito: Verano (terraza de baldosas; ya tiene palmera y macetas) y Otoño (taller de suelo de
   madera que ya tiene sus hojas caídas). */
const DETALLE = {
  pri: {
    viento: { amp: 1.6, ola: 0, vel: 1 },
    capas: [
      {
        forma: 'hierba',
        matas: 150,
        hojas: 22,
        alto: [9, 21],
        sitio: { muro: 0.8, pie: 0.2 },
        verdes: ['#5E8A4A', '#7FA65A', '#9DBE6E', '#6F9550'],
        flores: ['#F2B8C6', '#FFFFFF', '#F6D36B', '#C9A0DC'],
        flor: 0.4,
      },
      { forma: 'helecho', matas: 14, hojas: 7, alto: [14, 22], sitio: { muro: 1 }, fondo: true, verdes: ['#4F7A43', '#5E8A4A'] },
    ],
  },
  jar: {
    viento: { amp: 1.1, ola: 0, vel: 0.8 },
    capas: [
      {
        forma: 'hierba',
        matas: 140,
        hojas: 20,
        alto: [8, 15],
        sitio: { muro: 0.7, pie: 0.3 },
        verdes: ['#6E8F4E', '#7E9E58', '#5F8045', '#8AA866'],
        flores: ['#FFFFFF', '#FFF4D0', '#F6D36B'],
        flor: 0.35,
      },
      { forma: 'hierba', matas: 160, hojas: 9, alto: [3, 6], sitio: { suelto: 1 }, verdes: ['#6E8F4E', '#7E9E58', '#89A563'] },
    ],
  },
  inn: {
    viento: { amp: 0.7, ola: 0, vel: 0.6 },
    capas: [
      {
        forma: 'helecho',
        matas: 40,
        hojas: 7,
        alto: [16, 26],
        sitio: { muro: 0.75, pie: 0.25 },
        bajoDelante: 0.65,
        verdes: ['#2F5A4C', '#3A6B55', '#284D44'],
      },
      {
        forma: 'hierba',
        matas: 70,
        hojas: 12,
        alto: [6, 12],
        sitio: { muro: 0.6, pie: 0.4 },
        verdes: ['#2E5546', '#3B6650'],
        flores: ['#8FE3FF', '#C9B8FF', '#E8F6FF'],
        flor: 0.5,
        brillo: 0.85,
        florChica: true,
      },
    ],
  },
  oce: {
    viento: { amp: 0.5, ola: 3.2, vel: 0.55 },
    capas: [
      {
        forma: 'alga',
        matas: 130,
        hojas: 16,
        alto: [20, 40],
        sitio: { muro: 0.6, pie: 0.4 },
        verdes: ['#3E6B3C', '#4C7A40', '#5B7F3A', '#365F3A'],
        puntas: '#9C8A4A',
      },
    ],
  },
  col: {
    viento: { amp: 1.3, ola: 0, vel: 0.9 },
    capas: [
      {
        forma: 'flores',
        matas: 95,
        hojas: 9,
        alto: [12, 22],
        sitio: { muro: 0.65, pie: 0.35 },
        verdes: ['#6F8A4A', '#7F9A55', '#88A05C'],
        flores: ['#9B7FD0', '#B596E0', '#FFFFFF', '#F6D36B', '#6E8FE0', '#F2B8C6'],
      },
    ],
  },
};
if (window.COLMENA_ADULTO && window.R3DX && window.SALAS) {
  const HECHO = new WeakSet(),
    MITAD = COARSE ? 0.5 : 1,
    TOPE = 40000 * MITAD,
    TIEMPO = { value: 0 };
  /* Lambert con color por vértice, doble cara y luz como si la hoja mirara al cielo por las dos caras
     (sin la cara trasera negra). aPunta: 0 en la base, 1 en la punta; aFase: desfase de cada planta;
     aBrillo: lo que brilla sola de noche (Invernadero). uAmp: cabeceo del viento; uOla: ola que sube por la hoja (agua). */
  function material(id, v) {
    const m = SALAS.kit.keep(id, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uT = TIEMPO;
      sh.uniforms.uAmp = { value: v.amp };
      sh.uniforms.uOla = { value: v.ola };
      sh.uniforms.uVel = { value: v.vel };
      sh.vertexShader = sh.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nattribute float aPunta;\nattribute float aFase;\nattribute float aBrillo;\nuniform float uT;\nuniform float uAmp;\nuniform float uOla;\nuniform float uVel;\nvarying float vBrillo;',
        )
        .replace(
          '#include <begin_vertex>',
          [
            '#include <begin_vertex>',
            'vBrillo = aBrillo;',
            'float tt = uT * uVel;',
            'float ola = sin(tt * 1.7 + position.x * 0.045 + position.z * 0.03 + aFase) + 0.5 * sin(tt * 3.1 + position.z * 0.08 + aFase * 1.7);',
            'float p2 = aPunta * aPunta;',
            'float sube = uOla * aPunta * sin(tt * 2.2 - aPunta * 3.6 + aFase + position.x * 0.02);',
            'transformed.x += ola * uAmp * p2 + sube;',
            'transformed.z += ola * uAmp * 0.45 * p2 + uOla * 0.6 * aPunta * cos(tt * 1.6 - aPunta * 3.0 + aFase * 1.3);',
          ].join('\n'),
        );
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vBrillo;')
        .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\nnormal *= faceDirection;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vColor.rgb * vBrillo;');
    };
    m.customProgramCacheKey = () => 'colmena-detalle';
    return m;
  }
  function genera(id, cfg) {
    const cel = CELLS[id],
      rHex = SALAS.kit.rHex,
      cosas = (window.PUZ && PUZ.things[id]) || [];
    let s = 1907 + id.charCodeAt(0) * 31 + id.charCodeAt(1);
    const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296,
      ent = (a, b) => a + rnd() * (b - a);
    const libre = (x, y, holgura = 4) => {
      for (const d of cel.doors) if (Math.hypot(x - d.mid[0] * 0.86, y - d.mid[1] * 0.86) < 95) return false;
      for (const [sx, sy, sr] of cel.solids) if (Math.hypot(x - sx, y - sy) < sr + holgura) return false;
      for (const t of cosas) if (Math.hypot(x - (t.ax ?? t.x), y - (t.ay ?? t.y)) < 34) return false;
      const n = cel.npc;
      if (n && Math.hypot(x - n.x, y - n.y) < 58) return false;
      return true;
    };
    const pos = [],
      col = [],
      punta = [],
      fase = [],
      brillo = [],
      C = new THREE.Color(),
      D = new THREE.Color(),
      Q = new THREE.Color();
    let fa = 0,
      br = 0;
    /* un vértice: posición, color, altura relativa (para el viento) y si brilla */
    const v = (p, c, k, b = 0) => {
      pos.push(p[0], p[1] + 2.4, p[2]);
      col.push(c.r, c.g, c.b);
      punta.push(k);
      fase.push(fa);
      brillo.push(b);
    };
    const tri = (a, b, c, ca, cb, cc, ka, kb, kc, g = 0) => {
      v(a, ca, ka, g);
      v(b, cb, kb, g);
      v(c, cc, kc, g);
    };
    /* tira de hoja: centro que sube y se dobla, ancho que se afila; S tramos, el último en punta */
    const hoja = (x, y, h, ang, lean, ancho, S, colorBase, colorPunta, recto = 0, fin = 0) => {
      const ca = Math.cos(ang),
        sa = Math.sin(ang),
        lx = Math.cos(ang + 1.57),
        ly = Math.sin(ang + 1.57),
        P = [];
      for (let k = 0; k <= S; k++) {
        const t = k / S,
          dob = lean * Math.pow(t, 1.7),
          cx = x + lx * dob,
          cy = y + ly * dob,
          w = k === S ? 0 : ancho * (recto ? 1 - 0.25 * t : Math.pow(1 - t, 0.75)),
          yy = h * t * (1 - 0.12 * t);
        Q.copy(colorBase).lerp(colorPunta, Math.pow(t, fin || 1));
        P.push({ a: [cx - ca * w, yy, cy - sa * w], b: [cx + ca * w, yy, cy + sa * w], m: [cx, yy, cy], c: Q.clone(), t });
      }
      for (let k = 0; k < S; k++) {
        const A = P[k],
          B = P[k + 1];
        if (k === S - 1) tri(A.a, A.b, B.m, A.c, A.c, B.c, A.t, A.t, B.t);
        else {
          tri(A.a, A.b, B.b, A.c, A.c, B.c, A.t, A.t, B.t);
          tri(A.a, B.b, B.a, A.c, B.c, B.c, A.t, B.t, B.t);
        }
      }
      return P[S].m;
    };
    /* fronda de helecho: raquis que se arquea hacia fuera y foliolos que menguan hacia la punta */
    const fronda = (x, y, H, ang, largo, verde) => {
      const dx = Math.cos(ang),
        dy = Math.sin(ang),
        px = -dy,
        py = dx,
        K = 8,
        R = [];
      C.set(verde).multiplyScalar(0.55);
      D.set(verde).offsetHSL(0.02, 0.05, 0.1);
      for (let k = 0; k <= K; k++) {
        const t = k / K;
        R.push([x + dx * largo * t, (H * (2.4 * t - 1.9 * t * t)) / 0.5, y + dy * largo * t, t]);
      }
      for (let k = 1; k < K; k++) {
        const a = R[k],
          b = R[k + 1],
          t = a[3],
          l = largo * 0.42 * Math.pow(1 - t, 0.6) * (0.6 + 0.4 * Math.sin(t * 3.14)),
          ca = Q.copy(C).lerp(D, t).clone(),
          cb = D.clone().lerp(Q.set(verde).offsetHSL(0.03, 0, 0.16), t);
        for (const sd of [-1, 1]) {
          const tip = [a[0] + (px * sd + dx * 0.6) * l, a[1] - l * 0.25, a[2] + (py * sd + dy * 0.6) * l];
          tri(a, b, tip, ca, ca, cb, t, b[3], Math.min(1, t + 0.1));
        }
      }
      /* raquis fino */
      for (let k = 0; k < K; k++) {
        const a = R[k],
          b = R[k + 1];
        tri([a[0] - px * 0.5, a[1], a[2] - py * 0.5], [a[0] + px * 0.5, a[1], a[2] + py * 0.5], b, C, C, D, a[3], a[3], b[3]);
      }
    };
    /* flor: cinco pétalos en copa y un botón en el centro */
    const cabeza = (p, r, color, g) => {
      C.set(color);
      D.copy(C).offsetHSL(0, 0, -0.12);
      Q.set(color === '#F6D36B' ? '#C98A2E' : '#E8B640');
      const o = rnd() * 6.283;
      for (let k = 0; k < 5; k++) {
        const a = o + (k / 5) * 6.283,
          b = a + 0.62,
          e = a - 0.62,
          tip = [p[0] + Math.cos(a) * r, p[1] + r * 0.35, p[2] + Math.sin(a) * r],
          l = [p[0] + Math.cos(b) * r * 0.55, p[1] + r * 0.2, p[2] + Math.sin(b) * r * 0.55],
          rr = [p[0] + Math.cos(e) * r * 0.55, p[1] + r * 0.2, p[2] + Math.sin(e) * r * 0.55];
        tri(p, rr, tip, D, C, C, 1, 1, 1, g);
        tri(p, tip, l, D, C, C, 1, 1, 1, g);
      }
      const c = r * 0.3,
        top = [p[0], p[1] + c * 0.8, p[2]];
      for (let k = 0; k < 3; k++) {
        const a = o + (k / 3) * 6.283,
          b = a + 2.094;
        tri(
          top,
          [p[0] + Math.cos(a) * c, p[1] + r * 0.2, p[2] + Math.sin(a) * c],
          [p[0] + Math.cos(b) * c, p[1] + r * 0.2, p[2] + Math.sin(b) * c],
          Q,
          Q,
          Q,
          1,
          1,
          1,
          g * 0.6,
        );
      }
    };
    /* espiga de lavanda: tallo y bolitas en rombo a lo largo del último tercio */
    const espiga = (x, y, h, color, verde) => {
      C.set(verde).multiplyScalar(0.6);
      D.set(verde);
      const lean = ent(-2, 2),
        tip = hoja(x, y, h, rnd() * 3.14, lean, 0.45, 3, C, D);
      const F = new THREE.Color(color),
        G = F.clone().offsetHSL(0, 0, -0.15);
      for (let k = 0; k < 6; k++) {
        const t = 0.62 + k * 0.07,
          cx = x + (tip[0] - x) * t,
          cz = y + (tip[2] - y) * t,
          cy = h * t * 1.05,
          r = 1.5 * (1 - k * 0.09),
          a = rnd() * 3.14,
          ex = Math.cos(a) * r,
          ez = Math.sin(a) * r;
        tri([cx, cy - r, cz], [cx + ex, cy, cz + ez], [cx, cy + r, cz], G, F, F, t, t, t);
        tri([cx, cy - r, cz], [cx, cy + r, cz], [cx - ex, cy, cz - ez], G, F, F, t, t, t);
      }
    };
    /* las capas */
    const verdeBase = new THREE.Color(),
      verdePunta = new THREE.Color();
    const tris = () => pos.length / 9;
    const fondoFrente = (y, k = 0.4) => (y > 0 ? 1 - k * Math.min(1, y / 220) : 1);
    const sitio = (c) => {
      const w = c.sitio,
        u = rnd(),
        pie = w.pie || 0,
        muro = w.muro || 0;
      let x, y;
      if (u < muro) {
        const th = c.fondo ? ent(3.4, 6.0) : rnd() * 6.283,
          r = rHex(th, 8) * ent(0.78, 0.98);
        x = Math.cos(th) * r;
        y = Math.sin(th) * r;
      } else if (u < muro + pie && cel.solids.length) {
        const [sx, sy, sr] = cel.solids[(rnd() * cel.solids.length) | 0],
          a = rnd() * 6.283,
          d = sr + ent(6, 22);
        x = sx + Math.cos(a) * d;
        y = sy + Math.sin(a) * d;
        if (Math.hypot(x, y) > rHex(Math.atan2(y, x), 8) * 0.97) return null;
      } else {
        const th = rnd() * 6.283,
          r = rHex(th, 8) * Math.sqrt(rnd()) * 0.95;
        x = Math.cos(th) * r;
        y = Math.sin(th) * r;
      }
      return libre(x, y) ? [x, y] : null;
    };
    for (const c of cfg.capas) {
      const matas = Math.round(c.matas * MITAD);
      let puestas = 0,
        intentos = 0;
      while (puestas < matas && intentos++ < matas * 30 && tris() < TOPE) {
        const lugar = sitio(c);
        if (!lugar) continue;
        puestas++;
        const [x, y] = lugar,
          f = fondoFrente(y, c.bajoDelante),
          verde = c.verdes[(rnd() * c.verdes.length) | 0],
          n = Math.max(2, Math.round(c.hojas * ent(0.6, 1.4)));
        fa = rnd() * 6.283;
        if (c.forma === 'helecho') {
          const H = ent(c.alto[0], c.alto[1]) * f,
            o = rnd() * 6.283;
          for (let i = 0; i < n; i++)
            fronda(
              x + ent(-2, 2),
              y + ent(-2, 2),
              (H * ent(0.75, 1.1)) / 1.52,
              o + (i / n) * 6.283 + ent(-0.3, 0.3),
              H * ent(0.9, 1.3),
              verde,
            );
          continue;
        }
        if (c.forma === 'alga') {
          verdeBase.set(verde).multiplyScalar(0.5);
          for (let i = 0; i < n; i++) {
            const a = rnd() * 6.283,
              d = Math.sqrt(rnd()) * 7,
              h = ent(c.alto[0], c.alto[1]) * f * (1 - d / 14);
            verdePunta.set(verde).lerp(D.set(c.puntas), ent(0.2, 0.7));
            hoja(
              x + Math.cos(a) * d,
              y + Math.sin(a) * d,
              h,
              rnd() * 3.14,
              ent(-0.25, 0.25) * h,
              ent(1.1, 1.6),
              6,
              verdeBase,
              verdePunta,
              1,
              0.7,
            );
          }
          continue;
        }
        /* hierba y flores: briznas curvadas */
        const radio = c.forma === 'flores' ? 7 : 11;
        for (let i = 0; i < n; i++) {
          const a = rnd() * 6.283,
            d = Math.sqrt(rnd()) * radio,
            h = (c.alto[0] + rnd() * (c.alto[1] - c.alto[0]) * (1 - d / (radio * 1.5))) * f * (c.forma === 'flores' ? 0.6 : 1);
          verdeBase.set(verde).multiplyScalar(ent(0.42, 0.55));
          verdePunta.set(verde).offsetHSL(ent(-0.03, 0.01), 0, ent(0.06, 0.15));
          hoja(x + Math.cos(a) * d, y + Math.sin(a) * d, h, rnd() * 3.14, ent(-0.35, 0.35) * h, ent(0.9, 1.6), 4, verdeBase, verdePunta);
        }
        if (c.forma === 'flores') {
          const k = 3 + ((rnd() * 4) | 0),
            tipo = rnd();
          for (let i = 0; i < k; i++) {
            const a = rnd() * 6.283,
              d = Math.sqrt(rnd()) * 6,
              fx = x + Math.cos(a) * d,
              fy = y + Math.sin(a) * d,
              h = ent(c.alto[0], c.alto[1]) * f;
            if (tipo < 0.45) espiga(fx, fy, h * 1.15, c.flores[(rnd() * 2) | 0], verde);
            else {
              C.set(verde).multiplyScalar(0.6);
              D.set(verde);
              const p = hoja(fx, fy, h, rnd() * 3.14, ent(-2.5, 2.5), 0.4, 3, C, D);
              cabeza(p, ent(2.2, 3.4), c.flores[2 + ((rnd() * (c.flores.length - 2)) | 0)], 0);
            }
          }
        } else if (c.flores && rnd() < c.flor) {
          const k = c.florChica ? 2 + ((rnd() * 3) | 0) : 1;
          for (let i = 0; i < k; i++) {
            const fx = x + ent(-5, 5),
              fy = y + ent(-5, 5),
              h = c.alto[1] * ent(0.75, 1.15) * f;
            C.set(verde).multiplyScalar(0.6);
            D.set(verde);
            const p = hoja(fx, fy, h, rnd() * 3.14, ent(-2, 2), 0.4, 3, C, D);
            cabeza(p, c.florChica ? ent(1.3, 2.0) : ent(2.0, 3.0), c.flores[(rnd() * c.flores.length) | 0], c.brillo || 0);
          }
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('aPunta', new THREE.Float32BufferAttribute(punta, 1));
    g.setAttribute('aFase', new THREE.Float32BufferAttribute(fase, 1));
    g.setAttribute('aBrillo', new THREE.Float32BufferAttribute(brillo, 1));
    /* normales hacia arriba con un poco de la cara: luz pareja, como un prado visto desde lejos */
    const N = [],
      P = pos;
    for (let i = 0; i < P.length; i += 9) {
      const ux = P[i + 3] - P[i],
        uy = P[i + 4] - P[i + 1],
        uz = P[i + 5] - P[i + 2],
        wx = P[i + 6] - P[i],
        wy = P[i + 7] - P[i + 1],
        wz = P[i + 8] - P[i + 2];
      let nx = uy * wz - uz * wy,
        ny = uz * wx - ux * wz,
        nz = ux * wy - uy * wx;
      const l = Math.hypot(nx, ny, nz) || 1;
      nx = (nx / l) * 0.35;
      ny = Math.abs(ny / l) * 0.35 + 1;
      nz = (nz / l) * 0.35;
      const m = Math.hypot(nx, ny, nz);
      for (let j = 0; j < 3; j++) N.push(nx / m, ny / m, nz / m);
    }
    g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    g.computeBoundingSphere();
    const me = new THREE.Mesh(g, material(id, cfg.viento));
    me.receiveShadow = true;
    me.userData.detalle = true;
    me.userData.triangulos = tris();
    return me;
  }
  R3DX.push((dt) => {
    if (!STILL) TIEMPO.value += dt || 0.016;
    if (inTitle || !DETALLE[cur] || !window.R3D || !R3D.rooms) return;
    const r = R3D.rooms[cur];
    if (!r || !r.grp || HECHO.has(r)) return;
    HECHO.add(r);
    try {
      r.grp.add(genera(cur, DETALLE[cur]));
    } catch (e) {
      console.warn('[detalle]', e);
    }
  });
}
