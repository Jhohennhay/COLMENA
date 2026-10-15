/* ══════════ DETALLE · vegetación densa en los cuartos con plantas (versión adulta) ══════════
   Muestra en Primavera, tras ver «El Principito entre las estrellas» (hierba y helechos muy detallados).
   Todo se genera por código, sin modelos descargados: miles de briznas y algunas flores en UNA sola malla por cuarto,
   que el viento mece en la tarjeta gráfica (un retoque al material, sin coste por brizna en el procesador).
   Respeta la receta de los cuartos: la hierba crece junto a los muros y al pie de los muebles, y deja libre el centro,
   las puertas, los caminos y el sitio del vecino. Tabla DETALLE; en móvil, la mitad de briznas. */
const DETALLE = {
  pri: {
    matas: 150,
    hojas: 22,
    alto: [9, 20],
    verdes: ['#5E8A4A', '#7FA65A', '#9DBE6E', '#6F9550'],
    flores: ['#F2B8C6', '#FFFFFF', '#F6D36B', '#C9A0DC'],
    flor: 0.12,
  },
};
if (window.COLMENA_ADULTO && window.R3DX && window.SALAS) {
  const HECHO = new WeakSet(),
    MITAD = COARSE ? 0.5 : 1,
    TIEMPO = { value: 0 };
  function materialConViento(id) {
    const m = SALAS.kit.keep(id, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uT = TIEMPO;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aPunta;\nuniform float uT;')
        .replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nfloat ola = sin(uT * 1.7 + position.x * 0.045 + position.z * 0.03) + 0.5 * sin(uT * 3.1 + position.z * 0.08);\ntransformed.x += ola * 1.6 * aPunta * aPunta;\ntransformed.z += ola * 0.7 * aPunta * aPunta;',
        );
    };
    m.customProgramCacheKey = () => 'colmena-viento';
    return m;
  }
  function genera(id, c) {
    const cel = CELLS[id],
      rHex = SALAS.kit.rHex;
    let s = 1907 + id.charCodeAt(0) * 31 + id.charCodeAt(1);
    const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
    const libre = (x, y) => {
      for (const d of cel.doors) if (Math.hypot(x - d.mid[0] * 0.86, y - d.mid[1] * 0.86) < 95) return false;
      for (const [sx, sy, sr] of cel.solids) if (Math.hypot(x - sx, y - sy) < sr + 4) return false;
      const n = cel.npc;
      if (n && Math.hypot(x - n.x, y - n.y) < 55) return false;
      return true;
    };
    const pos = [],
      col = [],
      punta = [],
      C = new THREE.Color(),
      D = new THREE.Color();
    const brizna = (x, y, h, ang, inc, verde) => {
      const w = 1.1 + rnd() * 0.9,
        ca = Math.cos(ang),
        sa = Math.sin(ang),
        tx = x + Math.cos(ang + 1.57) * inc,
        ty = y + Math.sin(ang + 1.57) * inc;
      C.set(verde).multiplyScalar(0.55);
      D.set(verde).offsetHSL(0, 0, 0.08 + rnd() * 0.06);
      /* dos triángulos: base ancha, punta fina y algo doblada */
      const b1 = [x - ca * w, 0, y - sa * w],
        b2 = [x + ca * w, 0, y + sa * w],
        m1 = [(x + tx) / 2 - ca * w * 0.5, h * 0.55, (y + ty) / 2 - sa * w * 0.5],
        m2 = [(x + tx) / 2 + ca * w * 0.5, h * 0.55, (y + ty) / 2 + sa * w * 0.5],
        p = [tx, h, ty];
      for (const v of [b1, b2, m2, b1, m2, m1, m1, m2, p]) pos.push(v[0], v[1] + 2.4, v[2]);
      const kk = [0, 0, 0.55, 0, 0.55, 0.55, 0.55, 0.55, 1];
      for (const k of kk) {
        const q = C.clone().lerp(D, k);
        col.push(q.r, q.g, q.b);
        punta.push(k);
      }
    };
    const flor = (x, y, h, color) => {
      C.set(color);
      const r = 2.2 + rnd() * 1.6;
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * 6.283,
          b = a + 1.256;
        for (const v of [
          [x, h, y],
          [x + Math.cos(a) * r, h + 0.6, y + Math.sin(a) * r],
          [x + Math.cos(b) * r, h + 0.6, y + Math.sin(b) * r],
        ])
          pos.push(v[0], v[1] + 2.4, v[2]);
        for (let j = 0; j < 3; j++) {
          col.push(C.r, C.g, C.b);
          punta.push(1);
        }
      }
    };
    const matas = Math.round(c.matas * MITAD);
    let puestas = 0,
      intentos = 0;
    while (puestas < matas && intentos++ < matas * 30) {
      const th = rnd() * 6.283,
        borde = rHex(th, 8),
        /* casi todas junto al muro; unas pocas al pie de los muebles */
        cerca = rnd() < 0.8,
        r = cerca ? borde * (0.78 + rnd() * 0.2) : borde * (0.25 + rnd() * 0.5),
        x = Math.cos(th) * r,
        y = Math.sin(th) * r;
      if (!libre(x, y)) continue;
      if (!cerca && !cel.solids.some(([sx, sy, sr]) => Math.hypot(x - sx, y - sy) < sr + 26)) continue;
      puestas++;
      const verde = c.verdes[(rnd() * c.verdes.length) | 0],
        n = Math.round(c.hojas * (0.6 + rnd() * 0.8));
      for (let i = 0; i < n; i++) {
        const a = rnd() * 6.283,
          d = Math.sqrt(rnd()) * 11,
          bx = x + Math.cos(a) * d,
          by = y + Math.sin(a) * d,
          h = c.alto[0] + rnd() * (c.alto[1] - c.alto[0]) * (1 - d / 16);
        brizna(bx, by, h, rnd() * 3.14, (rnd() - 0.5) * h * 0.5, verde);
      }
      if (rnd() < c.flor * 3)
        flor(x + (rnd() - 0.5) * 8, y + (rnd() - 0.5) * 8, c.alto[1] * (0.8 + rnd() * 0.4), c.flores[(rnd() * c.flores.length) | 0]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('aPunta', new THREE.Float32BufferAttribute(punta, 1));
    g.computeVertexNormals();
    const me = new THREE.Mesh(g, materialConViento(id));
    me.receiveShadow = true;
    me.userData.detalle = true;
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
