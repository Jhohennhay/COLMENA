/* ══════════ GESTOS Y DESPERTARES · tanda de evaluación (oct 2026) ══════════
   1 · Los vecinos tienen cara según lo que pasa en su cuarto, no solo en el diálogo: apagados mientras su cuarto
       duerme, sorprendidos cuando te acercas por primera vez, contentos un rato después de que les ayudes.
   2 · En móvil, los personajes se ven un poco más grandes.
   3 · Cada cuarto de los dos primeros capítulos se ilumina en cuanto despierta él, sin esperar al sello.
   4 · Si otra celda (o una torre, una pasarela) queda delante de la cámara, se esconde mientras estás dentro de la tuya.
   No toca la historia ni el estilo: mismos recortes de papel, mismas caras que ya usan los diálogos. */
{
  const G = { id: null, cerca: 0, feliz: 0, despierto: null };
  const NO = (n) => n.idle === 'sleep' || n._idle0 === 'sleep';
  if (window.R3DX)
    R3DX.push(() => {
      if (inTitle || !CELLS[cur]) return;
      const n = CELLS[cur].npc;
      if (!n) return;
      if (n._idle0 === undefined) n._idle0 = n.idle || 'smile';
      const aw = isAwake(cur);
      if (G.id !== cur) {
        G.id = cur;
        G.cerca = 0;
        G.feliz = 0;
        G.despierto = aw;
      }
      /* acaba de despertar su cuarto: un rato de alegría */
      if (aw && G.despierto === false) G.feliz = T + 7;
      G.despierto = aw;
      if (!NO(n)) {
        const d = Math.hypot(Pl.x - n.x, Pl.y - n.y);
        if (d < 130 && !G.cerca) G.cerca = T;
        n.idle = T < G.feliz ? 'happy' : G.cerca && T - G.cerca < 1.3 ? 'surprised' : !aw ? (FREE ? n._idle0 : 'sad') : n._idle0;
      }
      /* en móvil, vecino y jugador algo más grandes */
      if (COARSE && window.R3D && R3D.rooms) {
        const r = R3D.rooms[cur];
        if (r && r.npc && r.npc.grp && r.npc.grp.scale.x !== 1.16) r.npc.grp.scale.setScalar(1.16);
        const pl = R3D.player;
        if (pl && pl.grp && pl.grp.scale.x !== 1.16) pl.grp.scale.setScalar(1.16);
      }
    });
  /* 4 · Nada tapa el cuarto en el que estás. Si algo ajeno queda entre la cámara y tu cuarto (una celda de otro piso,
     una celda que sube desde la niebla, la torre del ascensor delante de Otoño…), se esconde mientras estás dentro.
     Antes se miraba solo dónde caía el centro de cada celda (`R3D.worldOf`): fallaba con las que se mueven o asoman
     por un borde, y no veía las torres y pasarelas de `conexiones.js`. Ahora se lanzan rayos de la cámara a varios puntos
     del suelo de tu cuarto y se esconde cualquier grupo de la escena que corte uno de ellos antes de llegar (sus piezas
     casi transparentes no cuentan), y vuelve a verse cuando lleva un rato (0,6 s) sin cortar ninguno. Lo que toca tu propio
     cuarto (la pasarela de tu puerta) no se esconde. Corre después de
     colocar la cámara (`R3DXP`, también tras la de explorar.js), así que usa la posición de este mismo fotograma. */
  const TAPA = new Map(),
    OC = { id: null, caja: new WeakMap(), visto: new WeakSet(), t: 0, rc: null, hits: [] };
  /* caja de un grupo, medida una vez y luego desplazada con él (las celdas suben y bajan enteras) */
  const cajaDe = (g) => {
    let c = OC.caja.get(g);
    if (!c || T - c.t > 3) {
      g.updateMatrixWorld(true);
      c = { b: new THREE.Box3().setFromObject(g), p: g.position.clone(), t: T };
      OC.caja.set(g, c);
    }
    return (OC.bw = OC.bw || new THREE.Box3()).copy(c.b).translate((OC.dv = OC.dv || new THREE.Vector3()).subVectors(g.position, c.p));
  };
  const opaca = (o) => {
    if (!o.isMesh || o.isSprite || o.isPoints || o.isLine) return false;
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    return !!m && !(m.transparent && m.opacity < 0.5);
  };
  /* ¿corta este grupo el rayo antes de llegar a tu cuarto? Primero contra la caja de cada pieza, que es barato; solo las
     piezas pequeñas se prueban triángulo a triángulo. Las grandes (más de 1.500 triángulos) y, en móvil, todas, cuentan
     como que cortan si su caja lo hace: así se esconde algo de más a veces, pero los rayos dejan de comerse el procesador
     (medido en móvil simulado: se llevaban la mitad del tiempo). */
  const triangulos = (ge) => (ge.index ? ge.index.count : ge.attributes.position ? ge.attributes.position.count : 0) / 3;
  const corta = (g, ray, hasta, mia) => {
    let si = false;
    const bx = (OC.mb = OC.mb || new THREE.Box3()),
      pt = (OC.mp = OC.mp || new THREE.Vector3());
    g.traverseVisible((o) => {
      if (si || !opaca(o) || !o.geometry) return;
      const ge = o.geometry;
      if (!ge.boundingBox) ge.computeBoundingBox();
      bx.copy(ge.boundingBox).applyMatrix4(o.matrixWorld);
      if (!ray.ray.intersectBox(bx, pt) || ray.ray.origin.distanceTo(pt) > hasta) return;
      if (COARSE || triangulos(ge) > 1500) {
        si = true;
        return;
      }
      OC.hits.length = 0;
      try {
        OC.rc.intersectObject(o, false, OC.hits);
      } catch (e) {
        return;
      }
      for (const h of OC.hits)
        if (h.distance < hasta && !mia.containsPoint(h.point)) {
          si = true;
          return;
        }
    });
    return si;
  };
  /* firma de un grupo: conexiones.js rehace su torre en cada fotograma mientras una celda sube; la nueva copia hereda
     lo que se decidió de la anterior sin volver a lanzar rayos */
  const firma = (g) => {
    const b = cajaDe(g);
    return [g.type, g.children.length, ...[b.min.x, b.min.z, b.max.x, b.max.z].map((v) => Math.round(v / 50))].join('|');
  };
  function nadaTapa() {
    if (!window.R3D || !R3D.rooms || !R3D.camera || !window.THREE) return;
    const sc = R3D.scene,
      mio = R3D.rooms[cur];
    const libre = inTitle || mapMode || !!crossing || !sc || !mio || !mio.grp;
    if (libre || OC.id !== cur) {
      OC.id = libre ? null : cur;
      for (const g of TAPA.keys()) g.visible = true;
      TAPA.clear();
      OC.caja = new WeakMap();
      OC.visto = new WeakSet();
      OC.t = 0;
      if (libre) return;
    }
    const pl = R3D.player && R3D.player.grp,
      cand = [],
      nuevos = [];
    /* los rayos cuestan (unos 5 ms con la torre del ascensor delante): todos se lanzan cada 0,15 s; entre medias solo se
       prueba lo que acaba de aparecer en la escena, y lo ya escondido se vuelve a esconder (otros módulos lo muestran) */
    const cada = COARSE ? 0.4 : 0.15,
      todo = !(T - OC.t < cada && T >= OC.t);
    if (todo) {
      OC.t = T;
      for (const g of TAPA.keys()) g.visible = true;
    } else for (const g of TAPA.keys()) g.visible = false;
    for (const g of sc.children) {
      if (!g.visible || g === mio.grp || g === pl || !(g.isGroup || g.isMesh) || g.isLight) continue;
      if (todo) cand.push(g);
      else if (!OC.visto.has(g)) nuevos.push(g);
      OC.visto.add(g);
    }
    /* una copia nueva de algo que tapaba, tapa igual */
    if (nuevos.length && TAPA.size) {
      const sigs = new Map();
      for (const [g, v] of TAPA) if (!g.parent) sigs.set(v.sig, v.t);
      for (let i = nuevos.length - 1; i >= 0; i--) {
        const g = nuevos[i],
          t = sigs.get(firma(g));
        if (t !== undefined) {
          TAPA.set(g, { t, sig: firma(g) });
          g.visible = false;
          nuevos.splice(i, 1);
        }
      }
    }
    if (!todo) cand.push(...nuevos);
    const ahora = new Set();
    if (cand.length) {
      const cam = R3D.camera.position,
        rc = (OC.rc = OC.rc || new THREE.Raycaster());
      rc.camera = R3D.camera;
      const mia = cajaDe(mio.grp).clone().expandByScalar(30),
        pts = [[Pl.x, Pl.y, 50]];
      for (const x of [-200, 0, 200]) for (const y of [-130, 0, 130]) pts.push([x, y, 20]);
      const dir = (OC.d = OC.d || new THREE.Vector3()),
        hit = (OC.h = OC.h || new THREE.Vector3());
      for (const [x, y, z] of pts) {
        const w = R3D.worldOf(cur, x, y, z),
          lejos = cam.distanceTo(w);
        dir.subVectors(w, cam).normalize();
        rc.set(cam, dir);
        rc.far = lejos;
        const hasta = lejos - 40;
        for (let i = cand.length - 1; i >= 0; i--) {
          const g = cand[i],
            caja = cajaDe(g);
          if (caja.containsPoint(cam) && caja.getSize(hit).length() > 6000) continue; /* fondos que lo envuelven todo */
          if (!rc.ray.intersectBox(caja, hit) || cam.distanceTo(hit) > hasta) continue;
          if (corta(g, rc, hasta, mia)) {
            ahora.add(g);
            cand.splice(i, 1);
          }
        }
      }
    }
    for (const g of ahora) TAPA.set(g, { t: T, sig: firma(g) });
    for (const [g, v] of TAPA)
      if (T - v.t >= 0.6) {
        g.visible = true;
        TAPA.delete(g);
      } else g.visible = false;
  }

  if (window.R3DX) {
    /* se apunta al final de R3DXP en el primer fotograma, cuando ya están todos los módulos (explorar.js va detrás) */
    let ya = false;
    R3DX.push(() => {
      if (ya) return;
      ya = true;
      (window.R3DXP = window.R3DXP || []).push(nadaTapa);
    });
  }

  /* el puente que gira con la manivela tampoco tapa: si queda apuntando hacia la cámara, se esconden su tabla y sus
     barandillas (el disco de la manivela se queda). Pasaba en Otoño al llegar desde Verano. */
  if (window.R3DX)
    R3DX.push(() => {
      if (inTitle || !window.R3D || !R3D.rooms || !R3D.camera || !window.THREE) return;
      const r = R3D.rooms[cur];
      if (!r || !r.dyn || !r.dyn.length) return;
      const a = (G.a = G.a || new THREE.Vector3()),
        b = (G.b = G.b || new THREE.Vector3()),
        cam = R3D.camera.position;
      for (const g of r.dyn) {
        g.getWorldPosition(a);
        b.set(0, 0, 1).applyQuaternion(g.getWorldQuaternion((G.q = G.q || new THREE.Quaternion())));
        const dx = cam.x - a.x,
          dz = cam.z - a.z,
          d = Math.hypot(dx, dz) || 1,
          haciaCam = (b.x * dx + b.z * dz) / d > 0.35;
        g.children.forEach((m, i) => {
          if (i < 3) m.visible = !haciaCam;
        });
      }
    });

  /* los ocho primeros cuartos se iluminan al despertar ellos (los demás ya lo hacían al ayudar a su vecino) */
  const PRIMEROS = ['pri', 'ver', 'oto', 'inv', 'esp', 'oce', 'des', 'ant'],
    dl0 = darkLevel;
  darkLevel = function (id) {
    const d = dl0(id);
    return !FREE && PRIMEROS.includes(id) && AWAKE[id] && AWAKE[id]() ? Math.min(d, 0.2) : d;
  };
}
