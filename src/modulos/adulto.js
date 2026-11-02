/* ══════════ VERSIÓN ADULTA · solo con window.COLMENA_ADULTO (la Temporada 1, dist/index.html) ══════════
   El mismo juego con otro tono, para que no parezca hecho para niños. La base no cambia: panal de miel, papel y luz cálida.
   1 · personajes en 3D con proporción adulta (cabeza más pequeña; render3d.js y lowpoly3d.js miran la marca);
   2 · luz con contraste: sombras de verdad (en escritorio), menos luz de relleno, colores algo menos saturados;
   3 · interfaz sobria: rótulos más finos y menos redondeados, sin el aire de pegatina;
   4 · fondo generativo «Enjambre en reposo» (docs/arte-generativo.md) en lugar del papel crema;
   5 · el retrato del diálogo es un primer plano del personaje 3D, no el recorte de papel.
   Sin la marca (dist/colmena.html) el juego sigue como siempre: es la versión de trabajo y la de las pruebas. */
if (window.COLMENA_ADULTO) {
  document.body.classList.add('adulto');
  const NIEBLA = '#3A2418',
    /* radio de lo que se dibuja alrededor del cuarto (la primera corona está a 592 y la segunda a 1 026 y 1 185) y distancia de la cámara dentro de un cuarto */
    LEJOS = 1100,
    CAM_CERCA = 800;
  /* ── 4 · el fondo: un campo de corrientes torcido por una retícula hexagonal que no se dibuja ── */
  function enjambre(seed, W) {
    const c = newCanvas(W, W),
      g = c.getContext('2d');
    let s = seed >>> 0;
    const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
    /* ruido suave por capas, periódico para que el fondo se pueda repetir sin costura */
    const N = 8,
      G = [];
    for (let i = 0; i < N * N; i++) G.push(rnd() * Math.PI * 2);
    const sm = (t) => t * t * (3 - 2 * t);
    const ruido = (x, y) => {
      const xi = Math.floor(x),
        yi = Math.floor(y),
        fx = sm(x - xi),
        fy = sm(y - yi),
        at = (i, j) => G[(((j % N) + N) % N) * N + (((i % N) + N) % N)];
      const a = at(xi, yi),
        b = at(xi + 1, yi),
        d = at(xi, yi + 1),
        e = at(xi + 1, yi + 1);
      return a + (b - a) * fx + (d - a) * fy + (a - b - d + e) * fx * fy;
    };
    /* el vértice de panal más cercano: las corrientes giran a su alrededor */
    const HX = W / 6,
      giro = (x, y) => {
        const q = Math.round(x / (HX * 1.5)),
          r = Math.round(y / (HX * 0.866) - (q & 1) * 0.5),
          cx = q * HX * 1.5,
          cy = (r + (q & 1) * 0.5) * HX * 0.866 * 2 * 0.5,
          dx = x - cx,
          dy = y - cy,
          d = Math.hypot(dx, dy) / HX;
        return [Math.atan2(dy, dx) + Math.PI / 2, Math.max(0, 1 - d * 1.5)];
      };
    /* el color viene de la altura: pardo arriba, cera en medio, miel abajo */
    const gr = g.createLinearGradient(0, 0, 0, W);
    gr.addColorStop(0, '#1B120E');
    gr.addColorStop(0.45, '#3A2418');
    gr.addColorStop(0.8, '#6B4326');
    gr.addColorStop(1, '#9A6430');
    g.fillStyle = gr;
    g.fillRect(0, 0, W, W);
    const tono = (y) => {
      const t = y / W;
      return t < 0.45 ? [120, 84, 56] : t < 0.8 ? [196, 140, 84] : [240, 190, 110];
    };
    g.lineWidth = 1;
    g.lineCap = 'round';
    for (let k = 0; k < 2600; k++) {
      let x = rnd() * W,
        y = rnd() * W;
      const [r0, g0, b0] = tono(y);
      g.strokeStyle = `rgba(${r0},${g0},${b0},${(0.035 + rnd() * 0.05).toFixed(3)})`;
      g.beginPath();
      g.moveTo(x, y);
      for (let i = 0; i < 46; i++) {
        const a0 = ruido((x / W) * N, (y / W) * N) + 0.5 * ruido((x / W) * N * 2 + 3.1, (y / W) * N * 2 + 1.7),
          [ah, kh] = giro(x, y),
          a = a0 + (ah - a0) * kh * 0.55;
        x += Math.cos(a) * 5;
        y += Math.sin(a) * 5 * 0.7;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    /* grano de papel */
    for (let k = 0; k < 5200; k++) {
      g.fillStyle = rnd() < 0.5 ? 'rgba(255,236,200,.035)' : 'rgba(0,0,0,.05)';
      g.fillRect(rnd() * W, rnd() * W, 1.4, 1.4);
    }
    return c;
  }
  let FONDO = '';
  try {
    FONDO = enjambre(1907, 1024).toDataURL('image/jpeg', 0.86);
  } catch (e) {}
  /* ── 3 · interfaz ── */
  {
    const st = document.createElement('style');
    st.textContent = `
body.adulto.g3d #stage{background-color:#2A1A12!important;background-image:${FONDO ? `url(${FONDO})` : 'none'}!important;background-size:cover!important;background-position:center!important}
/* con el brillo de post.js encendido, el tono lo pone su sombreador: el filtro sobre los lienzos a pantalla completa cuesta una pasada entera */
body.adulto canvas{filter:saturate(.86) contrast(1.06)}
body.adulto.tono3d #cv3,body.adulto.tono3d #cv,body.adulto.tono3d #bg{filter:none}
body.adulto #hud *,body.adulto #goal,body.adulto #note,body.adulto .tut{border-radius:3px!important;letter-spacing:.01em}
body.adulto #goal,body.adulto #note,body.adulto .tut{background:rgba(28,20,14,.82)!important;color:#EFE4CC!important;box-shadow:none!important;border:1px solid rgba(228,168,68,.35)!important;clip-path:none!important}
body.adulto #goal *,body.adulto #note *,body.adulto .tut *{color:#EFE4CC!important}
body.adulto .tut .paper{background:rgba(28,20,14,.9)!important}
body.adulto button{border-radius:4px!important;font-weight:500!important}
/* el creador entero cabe en una pantalla de portátil, también las opciones de fragilidad y los botones del pie */
#crprev3d{display:block;width:220px;height:300px;border-radius:6px;background:radial-gradient(ellipse at 50% 62%,#6B4A30 0%,#3A2418 62%,#21140E 100%);cursor:grab;touch-action:none}
#crprev3d:active{cursor:grabbing}
@media (min-width:761px){
body.adulto .modal.creator .p{width:min(1040px,96vw);max-height:96vh;padding:16px 26px 30px;box-sizing:border-box}
body.adulto .modal.creator h2{margin:6px 0 6px}
body.adulto .crbody{gap:22px;align-items:stretch}
body.adulto #crprev3d{height:100%;min-height:270px}
body.adulto .crrow{padding:4px 0}
body.adulto .crl{margin-bottom:3px}
body.adulto .cropts{gap:5px}
body.adulto .difbox{margin:8px 0 0}
body.adulto .difh{margin-bottom:4px}
body.adulto .difs button{min-height:0;padding:6px 10px}
body.adulto .crbtns{position:sticky;bottom:0;margin-top:10px;padding-top:6px;background:var(--paper)}
}
@media (min-width:761px) and (hover:hover) and (pointer:fine){
body.adulto .cropts button{min-height:34px!important;padding:3px 10px;font-size:14px!important}
body.adulto .cropts button.sw{width:34px!important;height:34px!important;min-height:34px!important;padding:0}
}
@media (max-width:600px){#crprev3d{width:100%;height:150px}}`;
    document.head.appendChild(st);
  }
  /* ── el creador enseña el personaje 3D de verdad, el mismo que luego anda por el juego ──
     Un lienzo y un dibujante propios, que solo viven mientras el creador está abierto. Sin WebGL, queda el dibujo de papel. */
  {
    const papel = crLoop;
    let V = null;
    const monta = () => {
      const lienzo = document.createElement('canvas');
      lienzo.id = 'crprev3d';
      lienzo.setAttribute('aria-hidden', 'true');
      crPrev.before(lienzo);
      const rn = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true });
      rn.outputColorSpace = THREE.SRGBColorSpace;
      rn.setClearColor(0x000000, 0);
      crPrev.style.display = 'none';
      const sc = new THREE.Scene(),
        cam = new THREE.PerspectiveCamera(24, 1, 1, 4000),
        base = new THREE.Group(),
        hemi = new THREE.HemisphereLight(0xfff1d6, 0x7a4a26, 2.1),
        sol = new THREE.DirectionalLight(0xfff0dc, 1.7),
        contra = new THREE.DirectionalLight(0xffc070, 1.1),
        sombra = new THREE.Mesh(
          new THREE.CircleGeometry(1, 28),
          new THREE.MeshBasicMaterial({ color: 0x120a06, transparent: true, opacity: 0.42, depthWrite: false }),
        );
      sol.position.set(-0.5, 1, 0.8);
      contra.position.set(0.8, 0.5, -0.9);
      sombra.rotation.x = -Math.PI / 2;
      sc.add(hemi, sol, contra, base, sombra);
      V = { lienzo, rn, sc, cam, base, sombra, M: null, k: '', giro: 0.55, ti: performance.now(), arr: null };
      const v = V;
      lienzo.addEventListener('pointerdown', (e) => {
        v.arr = e.clientX;
        lienzo.setPointerCapture(e.pointerId);
      });
      lienzo.addEventListener('pointermove', (e) => {
        if (v.arr === null) return;
        v.giro += (e.clientX - v.arr) * 0.012;
        v.arr = e.clientX;
      });
      lienzo.addEventListener('pointerup', () => (v.arr = null));
      lienzo.addEventListener('pointercancel', () => (v.arr = null));
    };
    const quita = () => {
      if (!V) return;
      V.rn.dispose();
      V.rn.forceContextLoss();
      V.lienzo.remove();
      V = null;
    };
    const dibuja = () => {
      const { lienzo, rn, sc, cam, base } = V,
        w = lienzo.clientWidth,
        h = lienzo.clientHeight;
      if (!w || !h) return;
      const pr = Math.min(window.devicePixelRatio || 1, 2);
      if (lienzo.width !== Math.round(w * pr) || lienzo.height !== Math.round(h * pr)) {
        rn.setPixelRatio(pr);
        rn.setSize(w, h, false);
        cam.aspect = w / h;
        cam.updateProjectionMatrix();
      }
      const k = JSON.stringify(AVATAR);
      if (k !== V.k) {
        if (V.M) base.remove(V.M.root);
        V.M = LP3D.human(LP3D.fromAvatar(AVATAR));
        base.add(V.M.root);
        V.k = k;
        V.M.root.updateMatrixWorld(true);
        /* se encuadra por la altura de la cabeza: con sombrero o sin él, el mismo tamaño de chico */
        const alto = V.M.head.getWorldPosition(new THREE.Vector3()).y + V.M.head.getWorldScale(new THREE.Vector3()).y * 0.46,
          d = (alto * 1.32) / (2 * Math.tan((cam.fov * Math.PI) / 360));
        V.sombra.scale.set(alto * 0.26, alto * 0.2, 1);
        V.sombra.position.y = 0.5;
        cam.position.set(0, alto * 0.62, d);
        cam.lookAt(0, alto * 0.5, 0);
      }
      const ahora = performance.now(),
        dt = Math.min(0.1, (ahora - V.ti) / 1000);
      V.ti = ahora;
      /* da la vuelta muy despacio para que se vea la capa; arrastrando se gira a mano */
      if (V.arr === null && !STILL) V.giro += dt * 0.35;
      V.M.root.rotation.y = V.giro;
      LP3D.animate(V.M, { t: ahora / 1000, dt, walk: 0, ph: 0, ex: 'smile', still: STILL });
      rn.render(sc, cam);
    };
    crLoop = function () {
      if (!crOpen) {
        quita();
        return;
      }
      if (!V) {
        try {
          monta();
        } catch (e) {
          console.warn('[adulto] creador 3D', e);
          crLoop = papel;
          return papel();
        }
      }
      try {
        dibuja();
      } catch (e) {
        console.warn('[adulto] creador 3D', e);
        quita();
        crPrev.style.display = '';
        crLoop = papel;
        return papel();
      }
      requestAnimationFrame(crLoop);
    };
  }
  /* ── 5 · retratos: un primer plano del personaje 3D sustituye al recorte en el diálogo ── */
  const FOTO = (window.ADULTO_FOTO = {});
  for (const id of ORDER) {
    const n = CELLS[id] && CELLS[id].npc;
    if (!n || !n.draw) continue;
    const d0 = n.draw;
    n.draw = function (p, x, y, f, t, ex, portrait) {
      const im = portrait && FOTO[id];
      if (!im || !p || !p.g) return d0.apply(this, arguments);
      const g = p.g,
        cv = g.canvas;
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.drawImage(im, 0, 0, cv.width, cv.height);
      g.restore();
    };
  }
  function foto(id, r) {
    const M = r.npc && r.npc.lp;
    if (!M || !M.head || !M.root) return false;
    const rn = R3D.renderer,
      el = rn.domElement,
      c = M.head.getWorldPosition(new THREE.Vector3()),
      s = M.head.getWorldScale(new THREE.Vector3()).y * 0.46;
    if (!(s > 0) || !el.width) return false;
    const hd = M.root.rotation.y + 0.4,
      cam = new THREE.PerspectiveCamera(20, el.width / el.height, 1, 6000),
      d = s * 5.2;
    cam.position.set(c.x + Math.sin(hd) * d, c.y + s * 0.5, c.z + Math.cos(hd) * d);
    cam.lookAt(c.x, c.y + s * 0.1, c.z);
    cam.updateProjectionMatrix();
    /* el retrato siempre con luz de día, aunque el cuarto esté dormido: es la cara de quien te habla. Solo dura esta foto */
    const hemi = R3D.hemi,
      sun = R3D.sun,
      h0 = hemi.intensity,
      s0 = sun.intensity,
      hc = hemi.color.clone(),
      sc = sun.color.clone();
    hemi.intensity = 2.3;
    hemi.color.set(0xfff1d6);
    sun.intensity = 1.5;
    sun.color.set(0xfff4e0);
    /* lo de papel y sin luz propia (MeshBasic) lo oscurece tintRoom: se le quita un momento */
    const basicas = (r.mats || []).filter((m) => m.isMeshBasicMaterial && m.userData.base),
      colores = basicas.map((m) => m.color.clone());
    for (const m of basicas) m.color.copy(m.userData.base);
    try {
      rn.render(R3D.scene, cam);
    } finally {
      hemi.intensity = h0;
      sun.intensity = s0;
      hemi.color.copy(hc);
      sun.color.copy(sc);
      basicas.forEach((m, i) => m.color.copy(colores[i]));
    }
    const q = Math.min(el.width, el.height),
      out = newCanvas(256, 256);
    out.getContext('2d').drawImage(el, (el.width - q) / 2, (el.height - q) / 2, q, q, 0, 0, 256, 256);
    /* si la cámara no pilló nada (el cuarto aún estaba llegando), no vale: se repite más tarde */
    const mu = newCanvas(8, 8),
      gm = mu.getContext('2d');
    gm.drawImage(out, 0, 0, 8, 8);
    const px = gm.getImageData(0, 0, 8, 8).data;
    let llenos = 0;
    for (let i = 3; i < px.length; i += 4) if (px[i] > 200) llenos++;
    if (llenos < 40) return false;
    FOTO[id] = out;
    return true;
  }
  /* ── los cuartos lejanos no se dibujan ──
     Con la cámara dentro de un cuarto, los que quedan más allá de la primera corona apenas asoman (y lo que asoma es niebla),
     pero sumaban 230 piezas al fotograma y todo su trabajo de procesador: es la causa de la lentitud en cuanto la colmena
     se ha abierto entera. Vuelven a verse al alejar la cámara (el radio crece con ella), en los viajes y en el mapa. */
  window.R3DLEJOS = (id) => {
    if (id === cur || mapMode || crossing || inTitle) return false;
    const a = CW[cur],
      b = CW[id];
    if (!a || !b) return false;
    const lim = LEJOS * Math.max(1, R3D.CAM.dist / CAM_CERCA);
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 > lim * lim;
  };
  /* ── 2 · luz ── */
  /* La penumbra de un cuarto dormido. Antes solo quedaba un relleno gris azulado (el sol casi apagado): se veía todo plano
     y oscuro, justo en la primera impresión. Ahora: luz de luna fría y baja que da forma y sombras, relleno violeta bajo
     lo justo para leer el cuarto, y charcos de luz de miel donde hay que mirar (tabla GUIA, por la tabla LIGHTS, que render3d.js
     enciende cuanto más oscuro está el cuarto). Al despertar el cuarto, todo esto se va solo. */
  const PENUMBRA = { hemi: 0.68, sol: 0.52, farol: 15, charco: 16 },
    LUNA = new THREE.Color(0xa9bcf0),
    SOL = new THREE.Color(0xfff4e0),
    VIOLETA = new THREE.Color(0x8d8cd0),
    GUIA = {
      /* Primavera: Brote y el cerezo, los dos sitios que pide el primer objetivo */
      pri: () => {
        const n = CELLS.pri.npc,
          c = (PUZ.things.pri || []).find((t) => t.id === 'cerezo');
        return [[n.x, n.y, 110, 95], c ? [c.x, c.y, 170, 120] : null].filter(Boolean);
      },
    };
  for (const id in GUIA) {
    /* van las primeras para que nunca se queden sin luz: render3d.js enciende solo tres */
    try {
      LIGHTS[id] = [...GUIA[id](), ...(LIGHTS[id] || [])].slice(0, 3);
    } catch (e) {
      console.warn('[adulto] guía', id, e);
    }
  }
  let dormido = 0;
  window.R3DLUZ = (dt, lamp, puntos) => {
    const hemi = R3D.hemi,
      sun = R3D.sun,
      d = inTitle || mapMode ? 0 : Math.max(0, Math.min(1, ((darkLevel(cur) || 0) - 0.2) / 0.25));
    dormido = STILL ? d : dormido + (d - dormido) * Math.min(1, (dt || 0.016) * 1.6);
    if (dormido < 0.01) {
      sun.color.copy(SOL);
      lamp.decay = 1.4;
      for (const l of puntos) l.decay = 1.2;
      return;
    }
    hemi.intensity = Math.max(hemi.intensity, PENUMBRA.hemi * dormido);
    hemi.color.lerp(VIOLETA, dormido);
    sun.intensity = Math.max(sun.intensity, PENUMBRA.sol * dormido);
    sun.color.copy(SOL).lerp(LUNA, dormido);
    /* las luces de punto, con la caída física y un cuarto de cientos de unidades, apenas llegaban al suelo (una centésima
       del relleno): con menos caída y más fuerza son por fin charcos de luz. Solo en la penumbra: de día todo sigue igual */
    lamp.decay = 1.4 - 0.6 * dormido;
    lamp.intensity += (PENUMBRA.farol - lamp.intensity) * dormido;
    for (const l of puntos) {
      l.decay = 1.2 - 0.7 * dormido;
      if (l.intensity > 0) l.intensity += (PENUMBRA.charco - l.intensity) * dormido;
    }
  };
  if (window.R3DX) {
    const VISTO = new WeakSet(),
      SOMBRAS = !COARSE,
      CNIEBLA = new THREE.Color(NIEBLA);
    let listo = false,
      espera = 0,
      sombraN = false;
    const marca = (o) => {
      o.traverse((m) => {
        if (!m.isMesh || VISTO.has(m)) return;
        VISTO.add(m);
        const mt = m.material;
        if (!mt || Array.isArray(mt)) return;
        m.receiveShadow = !mt.transparent;
        /* la vegetación (detalle.js) no hace sombra: se decidió así por coste, y eran 2 de cada 3 triángulos del mapa de sombras */
        m.castShadow = !mt.transparent && !mt.isMeshBasicMaterial && !m.userData.detalle;
      });
    };
    R3DX.push((dt) => {
      if (inTitle || !window.R3D || !R3D.renderer || !R3D.sun) return;
      const sun = R3D.sun,
        rn = R3D.renderer,
        sc = R3D.scene;
      if (sc.fog) sc.fog.color.lerp(CNIEBLA, 0.82);
      if (!listo) {
        listo = true;
        if (SOMBRAS) {
          rn.shadowMap.enabled = true;
          rn.shadowMap.type = THREE.PCFSoftShadowMap;
          sun.castShadow = true;
          sun.shadow.mapSize.set(2048, 2048);
          sun.shadow.bias = -0.0012;
          sun.shadow.normalBias = 1.2;
          const c = sun.shadow.camera;
          c.left = c.bottom = -460;
          c.right = c.top = 460;
          c.near = 50;
          c.far = 2600;
          c.updateProjectionMatrix();
          sc.add(sun.target);
        }
      }
      /* el mapa tapa la tarjeta de capítulo: abierto a la vez, el título caía encima del panal */
      if (!cardEl.hidden) cardEl.style.visibility = mapMode || (Zt !== null && Zt < 1.04) ? 'hidden' : '';
      const r = R3D.rooms[cur];
      if (SOMBRAS) {
        /* el mapa de sombras se rehace un fotograma sí y otro no: casi todo lo que hace sombra está quieto */
        rn.shadowMap.autoUpdate = sombraN = !sombraN;
        /* el sol, bajo y de lado: sombras largas hacia la cámara */
        const o = R3D.worldOf(cur, 0, 0, 0);
        sun.target.position.copy(o);
        sun.position.set(o.x - 520, o.y + 900, o.z - 380);
        if (r && r.grp) marca(r.grp);
        const pl = R3D.player;
        if (pl && pl.grp) marca(pl.grp);
      }
      /* el retrato de este vecino, una vez, cuando el cuarto ya está quieto */
      if (r && !FOTO[cur] && !crossing && !talking) {
        espera += dt || 0.016;
        if (espera > 0.6) {
          espera = 0;
          try {
            if (!foto(cur, r)) FOTO[cur] = FOTO[cur] || null;
          } catch (e) {
            console.warn('[adulto] retrato', e);
          }
        }
      } else if (crossing) espera = 0;
    });
  }
}
