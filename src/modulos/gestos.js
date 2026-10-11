/* ══════════ GESTOS Y DESPERTARES · tanda de evaluación (oct 2026) ══════════
   1 · Los vecinos tienen cara según lo que pasa en su cuarto, no solo en el diálogo: apagados mientras su cuarto
       duerme, sorprendidos cuando te acercas por primera vez, contentos un rato después de que les ayudes.
   2 · En móvil, los personajes se ven un poco más grandes.
   3 · Cada cuarto de los dos primeros capítulos se ilumina en cuanto despierta él, sin esperar al sello.
   4 · Si otra celda queda delante de la cámara, se esconde mientras estás dentro de la tuya.
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
  /* 4 · Nada tapa el cuarto en el que estás: si otra celda queda entre la cámara y la tuya (pasa con celdas de
     otros pisos, por ejemplo en Otoño cuando ya hay más sellos), se esconde mientras estás dentro. */
  const TAPA = new Set();
  if (window.R3DX)
    R3DX.push(() => {
      if (!window.R3D || !R3D.rooms || !R3D.camera || !window.THREE) return;
      const libre = inTitle || mapMode || !!crossing;
      const cam = R3D.camera.position,
        yo = R3D.worldOf(cur, 0, 0, 0),
        dYo = Math.hypot(cam.x - yo.x, cam.y - yo.y, cam.z - yo.z),
        v = (G.v = G.v || new THREE.Vector3());
      for (const id in R3D.rooms) {
        const r = R3D.rooms[id];
        if (!r || !r.grp || id === cur) continue;
        let tapa = false;
        if (!libre) {
          const w = R3D.worldOf(id, 0, 0, 0),
            d = Math.hypot(cam.x - w.x, cam.y - w.y, cam.z - w.z);
          if (d < dYo - 60) {
            v.set(w.x, w.y, w.z).project(R3D.camera);
            tapa = v.z < 1 && Math.abs(v.x) < 1.25 && Math.abs(v.y) < 1.35;
          }
        }
        if (tapa) {
          if (r.grp.visible) {
            r.grp.visible = false;
            TAPA.add(id);
          }
        } else if (TAPA.has(id)) {
          r.grp.visible = true;
          TAPA.delete(id);
        }
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
