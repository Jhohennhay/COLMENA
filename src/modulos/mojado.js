/* ══════════ NOCHE MOJADA · lluvia, suelo que refleja y luz fría contra cálida (solo versión adulta) ══════════
   Muestra en el Faro, pedida por el dueño tras ver una demo de three.js de una tienda bajo la lluvia.
   · Luz: el cielo pasa a azul frío y la lente del faro da la única luz cálida.
   · Suelo mojado: se oscurece, y en escritorio refleja el cuarto y a los personajes. El motor de Colmena va recortado
     (sin texturas de destino ni sombreadores propios), así que el reflejo es una copia espejada de cada pieza,
     dibujada sin profundidad y recortada con la plantilla a la parte del suelo que se ve.
   · Lluvia: un solo dibujo con todas las gotas, que baja y vuelve a empezar.
   Para llevarlo a otro cuarto basta con añadirlo a MOJADO. En móvil no hay reflejos (rendimiento). */
const MOJADO = {
  far: { cielo: '#4E6CB0', sol: '#8FA8E8', suelo: '#A3AECB', luz: [0, -110, 80, '#FFC070'], estelas: [[0, 40, 56, 190, '#FFD9A0', 0.3]] },
};
if (window.COLMENA_ADULTO && window.R3DX && window.SALAS) {
  const REFLEJOS = !COARSE,
    H = 2.4,
    HECHO = new WeakMap(),
    M4 = new THREE.Matrix4(),
    CA = new THREE.Color(),
    V = new THREE.Vector3();
  let base = null,
    faro = null,
    antes = null,
    holder = null,
    gemelos = [],
    cuenta = 0,
    cadaTanto = 0,
    tl = 0;
  /* ── la lluvia: N gotas finas en una sola malla; dos copias apiladas para que no se note el salto ── */
  function lluvia() {
    const N = COARSE ? 320 : 620,
      ALTO = 420,
      pos = [];
    let s = 20261012;
    const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
    for (let i = 0; i < N; i++) {
      const a = rnd() * 6.283,
        r = Math.sqrt(rnd()) * 360,
        x = Math.cos(a) * r,
        z = Math.sin(a) * r,
        y = rnd() * ALTO,
        l = 18 + rnd() * 20,
        w = 0.55;
      pos.push(x - w, y, z, x + w, y, z, x + w + 3, y + l, z, x - w, y, z, x + w + 3, y + l, z, x - w + 3, y + l, z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const m = new THREE.MeshBasicMaterial({
      color: '#C4D6FF',
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    });
    const grp = new THREE.Group();
    for (const k of [0, 1]) {
      const me = new THREE.Mesh(g, m);
      me.position.y = k * ALTO;
      me.frustumCulled = false;
      me.renderOrder = 4;
      grp.add(me);
    }
    grp.userData = { ALTO, lluvia: true };
    return grp;
  }
  function monta(id, r, c) {
    const kit = SALAS.kit,
      g = new THREE.Group();
    /* el suelo, más oscuro y azulado */
    const mm = kit.keep(
        id,
        new THREE.MeshBasicMaterial({
          color: c.suelo,
          transparent: true,
          depthWrite: false,
          fog: false,
          blending: THREE.MultiplyBlending || 4,
        }),
      ),
      velo = new THREE.Mesh(kit.flatHex(4, 3.92), mm);
    g.add(velo);
    /* la luz del faro, estirada sobre el agua hacia la cámara */
    for (const e of c.estelas || []) kit.lightPool(id, g, e[0], e[1], e[2], e[3], e[4], e[5], 4.1);
    const ll = lluvia();
    g.add(ll);
    if (REFLEJOS) {
      /* la plantilla: marca solo el suelo que se ve (lo que tiene delante lo tapa por profundidad) */
      const pm = kit.keep(
          id,
          new THREE.MeshBasicMaterial({
            colorWrite: false,
            depthWrite: false,
            transparent: true,
            stencilWrite: true,
            stencilRef: 1,
            stencilFunc: 519,
            stencilZPass: 7681,
          }),
        ),
        pl = new THREE.Mesh(kit.flatHex(5, H), pm);
      pl.renderOrder = -100;
      g.add(pl);
    }
    r.grp.add(g);
    return { g, ll };
  }
  /* ── reflejos: un gemelo espejado por cada pieza opaca que sobresale del suelo ── */
  /* cuánto sobresale del suelo una pieza y qué grosor tiene, en medidas del mundo */
  function alto(me, y0) {
    const ge = me.geometry;
    if (!ge.boundingBox) ge.computeBoundingBox();
    const b = ge.boundingBox;
    let mx = -1e9,
      mn = 1e9;
    for (const x of [b.min.x, b.max.x])
      for (const y of [b.min.y, b.max.y])
        for (const z of [b.min.z, b.max.z]) {
          const wy = V.set(x, y, z).applyMatrix4(me.matrixWorld).y;
          mx = Math.max(mx, wy);
          mn = Math.min(mn, wy);
        }
    return [mx - y0, mx - mn];
  }
  function gemela(src) {
    const s = src.material,
      m = new THREE.MeshBasicMaterial({
        color: CA.copy(s.color || CA.set('#FFFFFF'))
          .multiplyScalar(0.78)
          .clone(),
        map: s.map || null,
        vertexColors: !!s.vertexColors,
        side: s.side,
        transparent: true,
        opacity: 0.36,
        depthTest: false,
        depthWrite: false,
        fog: false,
        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: 514,
      }),
      t = new THREE.Mesh(src.geometry, m);
    t.matrixAutoUpdate = false;
    t.frustumCulled = false;
    t.renderOrder = -90;
    t.userData.src = src;
    return t;
  }
  function recuenta(r, y0, extra) {
    const srcs = [];
    const mira = (o) =>
      o &&
      o.traverse((me) => {
        if (!me.isMesh || !me.geometry || me.userData.src) return;
        const mt = me.material;
        if (!mt || Array.isArray(mt) || mt.transparent || mt.colorWrite === false) return;
        /* solo lo que sobresale del suelo; las capas planas no se reflejan a sí mismas */
        const [sobre, grosor] = alto(me, y0);
        if (sobre < 4 || grosor < 1.5) return;
        srcs.push(me);
      });
    mira(r.grp);
    mira(extra);
    mira(r.npc && r.npc.lp && r.npc.lp.root);
    if (srcs.length === cuenta) return;
    cuenta = srcs.length;
    for (const t of gemelos) {
      holder.remove(t);
      t.material.dispose();
    }
    gemelos = srcs.map(gemela);
    for (const t of gemelos) holder.add(t);
  }
  window.MOJADO_DBG = () => ({
    gemelos: gemelos.length,
    cuenta,
    plantilla: R3D.renderer.getContext().getContextAttributes().stencil,
    holder: !!holder && holder.visible,
  });
  const visible = (o) => {
    for (let q = o; q; q = q.parent) if (!q.visible) return false;
    return true;
  };
  R3DX.push((dt) => {
    if (!window.R3D || !R3D.renderer || !R3D.sun) return;
    const c = !inTitle && !mapMode && MOJADO[cur],
      sun = R3D.sun,
      hemi = R3D.hemi,
      sc = R3D.scene;
    if (!base) base = { h: hemi.color.clone(), s: sun.color.clone() };
    if (!c) {
      /* al salir, todo vuelve a su sitio */
      if (antes) {
        hemi.color.copy(base.h);
        sun.color.copy(base.s);
        antes = null;
      }
      if (faro) faro.intensity = 0;
      if (holder) holder.visible = false;
      return;
    }
    const r = R3D.rooms[cur];
    if (!r || !r.grp) return;
    antes = cur;
    hemi.color.copy(base.h).lerp(CA.set(c.cielo), 0.8);
    sun.color.copy(base.s).lerp(CA.set(c.sol), 0.85);
    hemi.intensity *= 0.78;
    sun.intensity *= 0.6;
    if (sc.fog) sc.fog.color.lerp(CA.set('#141A2C'), 0.7);
    if (!faro) {
      faro = new THREE.PointLight(0xffc070, 0, 760, 1.3);
      sc.add(faro);
    }
    const o = R3D.worldOf(cur, c.luz[0], c.luz[1], c.luz[2]);
    faro.color.set(c.luz[3]);
    faro.position.copy(o);
    tl += dt || 0.016;
    faro.intensity = 7.5 * (STILL ? 1 : 1 + Math.sin(tl * 1.3) * 0.05);
    let e = HECHO.get(r);
    if (!e) HECHO.set(r, (e = monta(cur, r, c)));
    /* la lluvia cae y vuelve a empezar */
    if (!STILL) {
      const A = e.ll.userData.ALTO;
      e.ll.position.y = -((tl * 520) % A);
    }
    if (!REFLEJOS) return;
    if (!holder) {
      holder = new THREE.Group();
      sc.add(holder);
    }
    holder.visible = true;
    const y0 = R3D.worldOf(cur, 0, 0, 0).y + H,
      pl = R3D.player;
    cadaTanto -= dt || 0.016;
    if (cadaTanto <= 0) {
      cadaTanto = 1.5;
      recuenta(r, y0, pl && pl.grp);
    }
    /* cada gemelo copia a su original, espejado respecto al suelo */
    M4.identity();
    M4.elements[5] = -1;
    M4.elements[13] = 2 * y0;
    for (const t of gemelos) {
      const s = t.userData.src;
      t.visible = visible(s);
      if (!t.visible) continue;
      t.matrix.multiplyMatrices(M4, s.matrixWorld);
      t.matrixWorldNeedsUpdate = true;
    }
  });
}
