/* ══════════ MODO EXPLORAR · cámara detrás del chico para recorrer la celda de cerca (oct 2026) ══════════
   Idea tomada de «El Principito entre las estrellas» (littleprince.dev): cada planeta se recorre de cerca.
   Se añade a la vista de siempre, con un botón (◎) o la tecla C; no la sustituye.
   · La cámara cuelga de un brazo detrás y algo por encima del chico. Todo va con muelles amortiguados
     (aceleran y frenan sin pasarse), así no tiembla cuando el chico se para o choca.
   · Arrastrar con el ratón o el dedo gira alrededor de él (y sube o baja un poco); la rueda o el pellizco
     acercan o alejan dentro de unos límites. Las flechas mueven al chico respecto a la cámara (R3D.rotIn).
   · Al andar, la cámara se coloca sola detrás, despacio y solo si hace un rato que no la giras tú.
   · Si un mueble alto queda entre la cámara y el chico, se vuelve casi transparente mientras tapa;
     si tapa un muro o una pieza grande, la cámara sube. Si el brazo saldría de la celda, también sube.
   · Entrar y salir es un vuelo suave entre las dos cámaras. Durante viajes, diálogos, el mapa y los
     minijuegos vuelve la vista de siempre con el mismo vuelo, y al acabar regresa a explorar.
   · Los carteles de puerta, las burbujas y los objetos flotantes se dibujan en la capa de papel con la
     escala de la perspectiva: de cerca serían enormes, así que aquí se limita su tamaño en pantalla.
   Cómo convive con render3d.js: un gancho en R3DX (antes de camUpdate) devuelve a la vista de siempre su
   propio giro y su campo de visión, y lee lo que arrastre, la rueda o el pellizco sumaron; otro en R3DXP
   (después de camUpdate) mezcla las dos cámaras y pisa la posición. */
const EXPLORA = {
  on: false /* el botón está puesto */,
  act: false /* explorando ahora (no hay diálogo, viaje, mapa ni minijuego) */,
  w: 0 /* 0 = vista de siempre, 1 = explorar; e = w suavizada */,
  e: 0,
  yaw: 0,
  yawT: 0,
  yawV: 0,
  acerca: 1 /* 0,6 … 1,8: lo que acercan la rueda y el pellizco */,
  acercaT: 1,
  acercaV: 0,
  incl: 0 /* inclinación extra que pone el arrastre vertical */,
  inclT: 0,
  inclV: 0,
  alza: 0 /* subida por muros o piezas grandes que tapan */,
  alzaT: 0,
  alzaV: 0,
  corta: 0 /* lo que se recoge el brazo cuando saldría de la celda */,
  cortaV: 0,
  px: 0,
  py: 0,
  pz: 0,
  pxV: 0,
  pyV: 0,
  pzV: 0,
  vx: 0,
  vy: 0,
  ux: null,
  uy: 0,
  ultArr: -9 /* cuándo giró el jugador la cámara por última vez */,
  nyaw: 0 /* el giro de la vista de siempre, que se le devuelve antes de camUpdate */,
  yawMod: false,
  fovB: 0,
  fovMod: false,
  yb: 0,
  pb: 0.56,
  zb: 1,
  zf: 0,
  yawT0: 0,
  pitchT0: 0.56,
  base: null,
  baseId: null,
  baseT: -9,
};
/* muelle amortiguado crítico (como SmoothDamp): acelera, frena y no se pasa; s = {v, vel}, tiempo en s */
const exAmort = (o, k, kv, obj, tiempo, dt) => {
  const w = 2 / Math.max(1e-4, tiempo),
    x = w * dt,
    e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x),
    c = o[k] - obj,
    t = (o[kv] + w * c) * dt;
  o[kv] = (o[kv] - w * t) * e;
  o[k] = obj + (c + t) * e;
};
const exAng = (a) => {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};
{
  const ctrl = document.querySelector('.ctrl'),
    b = document.createElement('button');
  b.id = 'bexp';
  b.textContent = '◎';
  b.setAttribute('aria-pressed', 'false');
  const rotulo = () => {
    const t = EXPLORA.on ? _t('Volver a la vista de la colmena (C)') : _t('Explorar de cerca (C)');
    b.title = t;
    b.setAttribute('aria-label', t);
  };
  rotulo();
  if (ctrl) ctrl.insertBefore(b, ctrl.firstChild);
  const cambia = () => {
    if (!window.R3D || !R3D.CAM) return;
    EXPLORA.on = !EXPLORA.on;
    b.setAttribute('aria-pressed', String(EXPLORA.on));
    b.classList.toggle('on', EXPLORA.on);
    document.body.classList.toggle('explora', EXPLORA.on);
    rotulo();
    if (typeof note === 'function')
      note(
        EXPLORA.on
          ? COARSE
            ? 'Modo explorar: arrastra para girar · pellizca para acercar.'
            : 'Modo explorar: arrastra para girar · rueda para acercar.'
          : 'Vista de la colmena.',
      );
  };
  window.exploraCambia = cambia;
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    cambia();
  });
  addEventListener('keydown', (e) => {
    if (
      (e.key === 'c' || e.key === 'C') &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      !inTitle &&
      !talking &&
      !/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')
    )
      cambia();
  });
  const st = document.createElement('style');
  st.textContent = '#bexp.on{outline:2px solid #E9B45A;outline-offset:2px}';
  document.head.appendChild(st);
}

/* ── ¿se explora ahora? (si no, vuelve la vista de siempre) ── */
const exPuede = () =>
  EXPLORA.on &&
  !!window.R3D &&
  !!R3D.on &&
  !!R3D.camera &&
  !inTitle &&
  !mapMode &&
  !crossing &&
  !talking &&
  !(typeof GAME !== 'undefined' && GAME);

/* ── antes de camUpdate: la vista de siempre recupera lo suyo; se recoge lo que sumó el jugador ── */
window.R3DX = window.R3DX || [];
R3DX.push(() => {
  if (!window.R3D || !R3D.CAM || !R3D.camera) return;
  const X = EXPLORA,
    C = R3D.CAM,
    cam = R3D.camera;
  if (X.fovMod) {
    cam.fov = X.fovB;
    X.fovMod = false;
  }
  if (X.yawMod) {
    C.yaw = X.nyaw;
    X.yawMod = false;
  }
  const puede = exPuede();
  if (puede && !X.act) {
    /* entra (o vuelve tras un diálogo): se guarda la vista de siempre para devolvérsela igual */
    X.act = true;
    X.yawT0 = C.yawT;
    X.pitchT0 = C.pitchT;
    X.yb = clamp(C.yawT, -0.9, 0.9);
    X.pb = clamp(C.pitchT, 0.4, 0.95);
    C.yawT = X.yb;
    C.pitchT = X.pb;
    X.zb = Z;
    X.zf = ZF;
    if (X.w <= 0) {
      /* desde parado: el brazo arranca donde mira la vista de siempre */
      X.yaw = X.yawT = C.yaw;
      X.yawV = X.inclV = X.acercaV = X.alzaV = 0;
      X.ux = null;
      X.base = null;
    }
    return;
  }
  if (!puede && X.act) {
    X.act = false;
    C.yawT = X.yawT0;
    C.pitchT = X.pitchT0;
    return;
  }
  if (!X.act) return;
  /* arrastrar (o el stick, o Q y R): lo que la vista de siempre sumaría a su giro, aquí gira el brazo */
  const k = COARSE ? 1.8 : 2.2,
    dy = C.yawT - X.yb,
    dp = C.pitchT - X.pb;
  if (dy || dp) {
    X.yawT += dy * k;
    X.inclT = clamp(X.inclT + dp * 1.1, -0.18, 0.75);
    X.ultArr = T;
    C.yawT = X.yb;
    C.pitchT = X.pb;
  }
  /* la rueda y el pellizco cambian Z (el acercamiento de la vista de siempre): aquí acercan el brazo */
  if (Zt !== null) {
    /* un acercamiento suave del propio juego (no del jugador): se respeta y se toma su destino */
    X.zb = Zt;
  } else if (ZF !== X.zf) {
    /* la ventana cambió de tamaño: el juego recoloca Z; no es un gesto del jugador */
    X.zf = ZF;
    X.zb = Z;
  } else if (!mapMode && Z !== X.zb) {
    /* acotado por fotograma: un golpe de rueda muy largo no salta de un extremo a otro */
    const r = clamp(Z / X.zb, 0.6, 1.7);
    X.acercaT = clamp(X.acercaT / r, 0.6, 1.8);
    Z = X.zb;
  }
});

/* ── las piezas que tapan al chico: transparentes mientras tapan; muros y piezas grandes suben la cámara ── */
const EXOC = {
  r: null,
  t: -9,
  ver: [] /* piezas sueltas que se pueden aclarar */,
  sube: [] /* muros y mallas fundidas: no se aclaran, se sube */,
  todas: [],
  fade: new Map() /* malla → {m0, m1, a, t} */,
  de: new Map() /* malla → mallas de su pieza */,
  piezas: new Map(),
  anchos: new Map(),
  n: 0,
  hits: [],
  rc: null,
  o: null,
  d: null,
  box: null,
  tPrueba: -9,
  tapa: false,
  libre: true,
};
/* se recoge al entrar en un cuarto (o si cambia lo que tiene): las piezas del cuarto y los personajes cercanos.
   Cada malla apunta a su «pieza» (la estantería entera, el vecino entero), y se aclara la pieza completa. */
const exPieza = (o, tope) => {
  let q = o;
  for (let n = 0; n < 14 && q.parent && q.parent !== tope; n++) {
    const pa = q.parent;
    let w = EXOC.anchos.get(pa);
    if (w === undefined) {
      EXOC.box.setFromObject(pa);
      w = Math.max(EXOC.box.max.x - EXOC.box.min.x, EXOC.box.max.z - EXOC.box.min.z);
      EXOC.anchos.set(pa, w);
    }
    if (w > 230) break;
    q = pa;
  }
  return q;
};
const exMete = (o, y0, tope, raiz) => {
  if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || !o.visible) return;
  const u = o.userData;
  if (u.floor || u.lid || u.detalle || u.tex || u.clima || u.follow) return;
  const fd = EXOC.fade.get(o),
    m = fd ? fd.m0 : o.material,
    multi = Array.isArray(m);
  if (!multi && (!m || m.transparent || m.opacity < 1)) return;
  const box = EXOC.box;
  box.setFromObject(o);
  /* solo lo que se alza del suelo (los gemelos de los reflejos quedan por debajo) */
  if (box.max.y < y0 + 30 || box.min.y > y0 + 260) return;
  const ancho = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
  EXOC.todas.push(o);
  if (multi || ancho > 280) {
    EXOC.sube.push(o);
    return;
  }
  EXOC.ver.push(o);
  const pz = raiz || exPieza(o, tope);
  let L = EXOC.piezas.get(pz);
  if (!L) EXOC.piezas.set(pz, (L = []));
  L.push(o);
  EXOC.de.set(o, L);
};
const exRecoge = (r, y0, bx, bz) => {
  EXOC.r = r;
  EXOC.n = r.grp.children.length;
  EXOC.ver.length = 0;
  EXOC.sube.length = 0;
  EXOC.todas.length = 0;
  EXOC.de.clear();
  EXOC.piezas.clear();
  EXOC.anchos.clear();
  if (!EXOC.box) EXOC.box = new THREE.Box3();
  const sc = R3D.scene;
  sc.updateMatrixWorld(true);
  r.grp.traverse((o) => exMete(o, y0, r.grp, null));
  /* los personajes (el vecino) cuelgan de grupos de la escena, no del cuarto: se miran los grupos con mallas «lp»
     cuyo centro cae en esta celda; el del chico queda fuera */
  const rg = new Set();
  for (const id in R3D.rooms) if (R3D.rooms[id] && R3D.rooms[id].grp) rg.add(R3D.rooms[id].grp);
  let pg = R3D.player && R3D.player.grp;
  while (pg && pg.parent && pg.parent !== sc) pg = pg.parent;
  for (const g of sc.children) {
    if (!g.isGroup || g === pg || rg.has(g)) continue;
    let lp = false;
    g.traverse((o) => {
      if (o.isMesh && o.userData.lp) lp = true;
    });
    if (!lp) continue;
    EXOC.box.setFromObject(g);
    const cx = (EXOC.box.min.x + EXOC.box.max.x) / 2,
      cz = (EXOC.box.min.z + EXOC.box.max.z) / 2;
    if (Math.hypot(cx - bx, cz - bz) > 260) continue;
    g.traverse((o) => exMete(o, y0, g, null));
  }
};
const exAclara1 = (o) => {
  let f = EXOC.fade.get(o);
  if (!f) {
    const m1 = o.material.clone();
    m1.transparent = true;
    m1.depthWrite = false;
    f = { m0: o.material, m1, a: 1, t: T };
    EXOC.fade.set(o, f);
  }
  f.t = T;
};
const exAclara = (o) => {
  const L = EXOC.de.get(o);
  if (!L) return exAclara1(o);
  for (let i = 0; i < L.length; i++) exAclara1(L[i]);
};
/* sin crear objetos por fotograma: forEach con una función fija y los datos en EXOC */
const exAclaraUna = (f, o) => {
  const obj = EXOC.sigue && T - f.t < 0.3 ? 0.22 : 1;
  f.a += (obj - f.a) * Math.min(1, EXOC.dt * (obj < f.a ? 7 : 4));
  if (f.a > 0.985 && obj === 1) {
    o.material = f.m0;
    f.m1.dispose();
    EXOC.fade.delete(o);
    return;
  }
  if (o.material !== f.m1) o.material = f.m1;
  f.m1.opacity = f.a;
};
const exAclaraTick = (dt, sigue) => {
  if (!EXOC.fade.size) return;
  EXOC.dt = dt;
  EXOC.sigue = sigue;
  EXOC.fade.forEach(exAclaraUna);
};
const exSueltaUna = (f, o) => {
  o.material = f.m0;
  f.m1.dispose();
};
const exSueltaTodo = () => {
  EXOC.fade.forEach(exSueltaUna);
  EXOC.fade.clear();
};
/* un rayo hacia una altura del chico: aclara lo suelto que tapa; devuelve true si tapa un muro o una pieza grande */
const exTapa = (cx, cy, cz, hz) => {
  const X = EXPLORA,
    h1 = exRayo(EXOC.todas, cx, cy, cz, X.px, X.py + hz, X.pz);
  if (!h1) return false;
  if (!EXOC.ver.includes(h1.object)) return true;
  const o1 = h1.object,
    hx = h1.point.x,
    hy = h1.point.y,
    hzz = h1.point.z;
  exAclara(o1);
  /* puede haber otra detrás: un segundo rayo desde justo después */
  const h2 = exRayo(EXOC.ver, hx, hy, hzz, X.px, X.py + hz, X.pz);
  if (h2 && h2.object !== o1) exAclara(h2.object);
  return false;
};
/* un rayo de (ox,oy,oz) a (tx,ty,tz) contra la lista; devuelve el primer golpe o null */
const exRayo = (lista, ox, oy, oz, tx, ty, tz) => {
  if (!lista.length) return null;
  const rc = EXOC.rc || (EXOC.rc = new THREE.Raycaster()),
    o = EXOC.o || (EXOC.o = new THREE.Vector3()),
    d = EXOC.d || (EXOC.d = new THREE.Vector3());
  o.set(ox, oy, oz);
  d.set(tx - ox, ty - oy, tz - oz);
  const L = d.length();
  if (L < 1) return null;
  d.multiplyScalar(1 / L);
  rc.set(o, d);
  rc.near = 0;
  rc.far = L - 22;
  EXOC.hits.length = 0;
  rc.intersectObjects(lista, false, EXOC.hits);
  return EXOC.hits.length ? EXOC.hits[0] : null;
};

/* ── después de camUpdate: el brazo detrás del chico, mezclado con la vista de siempre ── */
window.R3DXP = window.R3DXP || [];
R3DXP.push((dt0) => {
  const X = EXPLORA;
  if (!window.R3D || !R3D.camera || !R3D.CAM) return;
  /* el paso de tiempo, acotado: al cambiar el reloj (pestaña dormida, pruebas) puede llegar negativo o enorme */
  const dt = dt0 > 0 ? Math.min(0.05, Math.max(0.001, dt0)) : 0.016,
    C = R3D.CAM,
    cam = R3D.camera;
  if (inTitle) X.w = 0;
  else X.w = clamp(X.w + (X.act ? dt / 0.8 : -dt / 0.65), 0, 1);
  X.e = X.w * X.w * (3 - 2 * X.w);
  if (X.w <= 0) {
    if (EXOC.fade.size) exSueltaTodo();
    return;
  }
  /* el sitio del chico en el mundo, sin crear objetos cada fotograma */
  if (X.baseId !== cur || !X.base || T - X.baseT > 0.5) {
    X.base = R3D.worldOf(cur, 0, 0, 0);
    if (X.baseId !== cur) {
      X.baseId = cur;
      exSueltaTodo();
    }
    X.baseT = T;
  }
  const bx = X.base.x + Pl.x,
    by = X.base.y,
    bz = X.base.z + Pl.y;
  /* velocidad del chico, filtrada (con ella se coloca la cámara detrás y mira un poco adelante) */
  if (X.ux === null || Math.hypot(Pl.x - X.ux, Pl.y - X.uy) > 80 || Math.hypot(bx - X.px, bz - X.pz) > 420) {
    X.px = bx;
    X.py = by;
    X.pz = bz;
    X.pxV = X.pyV = X.pzV = X.vx = X.vy = 0;
  } else {
    const kv = Math.min(1, dt * 5);
    X.vx += ((Pl.x - X.ux) / dt - X.vx) * kv;
    X.vy += ((Pl.y - X.uy) / dt - X.vy) * kv;
  }
  X.ux = Pl.x;
  X.uy = Pl.y;
  exAmort(X, 'px', 'pxV', bx, 0.16, dt);
  exAmort(X, 'pz', 'pzV', bz, 0.16, dt);
  exAmort(X, 'py', 'pyV', by, 0.35, dt);
  const vel = Math.hypot(X.vx, X.vy);
  /* al andar, la cámara se coloca poco a poco detrás; nunca si el chico viene hacia ella, y no justo después de girarla tú */
  if (X.act && vel > 40 && T - X.ultArr > 1.4) {
    const d = exAng(Math.atan2(-X.vx, -X.vy) - X.yawT);
    if (Math.abs(d) < 2.0) X.yawT += d * Math.min(1, dt * 1.3 * clamp((vel - 40) / 140, 0, 1));
  }
  exAmort(X, 'yaw', 'yawV', X.yawT, 0.11, dt);
  exAmort(X, 'acerca', 'acercaV', X.acercaT, 0.18, dt);
  exAmort(X, 'incl', 'inclV', X.inclT, 0.12, dt);
  /* el brazo: más corto con el campo de visión más abierto; en pantalla vertical, algo más lejos */
  const asp = cam.aspect || 1.6,
    vert = asp < 1,
    fovE = vert ? 52 : 44,
    largo = (vert ? 300 : 235) * X.acerca,
    incl = clamp(0.3 + (X.acerca - 1) * 0.16 + X.incl, 0.08, 1.15),
    sy = Math.sin(X.yaw),
    cy = Math.cos(X.yaw),
    adel = clamp(vel * 0.12, 0, 34),
    vxn = vel > 1 ? X.vx / vel : 0,
    vyn = vel > 1 ? X.vy / vel : 0;
  /* a dónde mira: un poco por delante del chico y algo más hacia donde anda */
  const mx = X.px - sy * 50 + vxn * adel,
    my = X.py + 62,
    mz = X.pz - cy * 50 + vyn * adel;
  let ch = Math.cos(incl) * (largo + 50),
    cv0 = Math.sin(incl) * (largo + 50);
  /* si el brazo sale de la celda: se recoge un poco (sin pegarse a la cara del chico) y sube para mirar por encima del muro */
  let fuera = 0;
  if (window.SALAS && SALAS.kit && SALAS.kit.rHex) {
    const x = Pl.x + sy * (ch - 50),
      y = Pl.y + cy * (ch - 50);
    fuera = Math.max(0, Math.hypot(x, y) - SALAS.kit.rHex(Math.atan2(y, x), 10));
  }
  exAmort(X, 'corta', 'cortaV', Math.min(fuera * 0.55, (ch - 50) * 0.3), 0.3, dt);
  ch -= X.corta;
  /* piezas que tapan: cada pocos fotogramas, rayos de la cámara al pecho y a la cabeza del chico */
  const r = R3D.rooms && R3D.rooms[cur];
  if (X.act && r && r.grp) {
    if (EXOC.r !== r || EXOC.n !== r.grp.children.length) exRecoge(r, by, X.base.x, X.base.z);
    if (T - EXOC.tPrueba > 0.08) {
      EXOC.tPrueba = T;
      const cx = mx + sy * ch,
        cyy = my + cv0 + X.alza,
        cz = mz + cy * ch;
      const tapa = exTapa(cx, cyy, cz, 45) | exTapa(cx, cyy, cz, 88);
      /* ¿bajaría sin que nada tape? (así no sube y baja sin parar) */
      const libre = !exRayo(EXOC.sube, cx, cyy - 45, cz, X.px, X.py + 80, X.pz);
      EXOC.tapa = !!tapa;
      EXOC.libre = libre;
    }
    if (EXOC.tapa) X.alzaT = Math.min(240, X.alzaT + dt * 260);
    else if (EXOC.libre) X.alzaT = Math.max(0, X.alzaT - dt * 120);
  } else X.alzaT = Math.max(0, X.alzaT - dt * 120);
  exAclaraTick(dt, X.act);
  exAmort(X, 'alza', 'alzaV', X.alzaT + Math.min(220, fuera * 0.7), 0.3, dt);
  cv0 += X.alza;
  /* mezcla con la vista de siempre, en coordenadas del brazo (giro, distancia, altura): un vuelo, no una recta */
  const e = X.e,
    cp = Math.cos(C.pitch),
    nh = cp * C.dist,
    nv = Math.sin(C.pitch) * C.dist,
    yawN = C.yaw,
    yaw = yawN + exAng(X.yaw - yawN) * e,
    hh = lerp(nh, ch, e),
    vv = lerp(nv, cv0, e),
    tx = lerp(C.tx, mx, e),
    ty = lerp(C.ty, my, e),
    tz = lerp(C.tz, mz, e);
  cam.position.set(tx + Math.sin(yaw) * hh, ty + vv, tz + Math.cos(yaw) * hh);
  cam.lookAt(tx, ty, tz);
  X.fovB = cam.fov;
  cam.fov = lerp(X.fovB, fovE, e);
  X.fovMod = true;
  cam.near = lerp(cam.near, 5, e);
  cam.updateProjectionMatrix();
  const f = R3D.fog;
  if (f) {
    f.near = lerp(f.near, 650, e);
    f.far = lerp(f.far, 2600, e);
  }
  /* el resto del juego (flechas, pistas, figuras que miran a cámara) usa el giro que se ve */
  X.nyaw = C.yaw;
  X.yawMod = true;
  C.yaw = X.act ? X.yaw : yaw;
});

/* ── la capa de papel: carteles, burbujas y objetos con un tamaño de pantalla razonable ── */
{
  /* escala máxima de la pluma (en px CSS por unidad) en modo explorar; la vista de siempre ronda 1,5 en escritorio y 0,65 en móvil */
  const tope = (f) => DPR * (COARSE ? 1.05 : 1.25) * f;
  const envuelve = (nombre, f, punto) => {
    const f0 = STYLE[nombre];
    if (typeof f0 !== 'function') return;
    /* argumentos fijos (no «...a»): así no se crea una lista en cada dibujo */
    STYLE[nombre] = function (p, a, b, c, d, e1, f1) {
      const e = EXPLORA.e;
      if (!(e > 0) || !p || p.g !== ctx || !(p.s > 0) || !window.R3D || !R3D.on) return f0.call(this, p, a, b, c, d, e1, f1);
      const k = Math.min(1, tope(f) / p.s);
      if (k > 0.995) return f0.call(this, p, a, b, c, d, e1, f1);
      let q = null;
      try {
        q = punto(p, a, b, c);
      } catch (_) {}
      if (!q || !Number.isFinite(q[0]) || !Number.isFinite(q[1])) return f0.call(this, p, a, b, c, d, e1, f1);
      const s = 1 + (k - 1) * e,
        g = p.g;
      g.save();
      g.translate(q[0], q[1]);
      g.scale(s, s);
      g.translate(-q[0], -q[1]);
      try {
        return f0.call(this, p, a, b, c, d, e1, f1);
      } finally {
        g.restore();
      }
    };
  };
  /* cartel de puerta: el mismo punto que usa STYLE.doorLabel */
  envuelve('doorLabel', 1, (p, d) => {
    if (d.back) return p.W(wallPt(d.e, 0.5, 112));
    const L = TH + 80;
    return p.P(d.mid[0] - d.n[0] * L, d.mid[1] - d.n[1] * L, 66);
  });
  const enSuSitio = (p, x, y, z) => p.P(x, y, z);
  envuelve('want', 1.2, enSuSitio);
  envuelve('emote', 1.2, enSuSitio);
  envuelve('token', 1.7, enSuSitio);
}

I18N([
  ['Explorar de cerca (C)', 'Explore up close (C)', 'Осмотреться вблизи (C)', '近距离探索（C）'],
  ['Volver a la vista de la colmena (C)', 'Back to the hive view (C)', 'Вернуться к виду улья (C)', '返回蜂巢视图（C）'],
  [
    'Modo explorar: arrastra para girar · rueda para acercar.',
    'Explore mode: drag to turn · scroll to zoom.',
    'Режим осмотра: тяни, чтобы повернуть · колёсико приближает.',
    '探索模式：拖动以转动 · 滚轮缩放。',
  ],
  [
    'Modo explorar: arrastra para girar · pellizca para acercar.',
    'Explore mode: drag to turn · pinch to zoom.',
    'Режим осмотра: тяни, чтобы повернуть · сведи пальцы, чтобы приблизить.',
    '探索模式：拖动以转动 · 双指缩放。',
  ],
  ['Vista de la colmena.', 'Hive view.', 'Вид улья.', '蜂巢视图。'],
]);
