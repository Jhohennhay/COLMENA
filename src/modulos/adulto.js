/* ══════════ MUESTRA «VERSIÓN ADULTA» · solo con window.COLMENA_ADULTO (dist/prueba-adulta.html) ══════════
   Una sola celda, la Relojería, para que el dueño compare antes de decidir nada:
   1 · personajes en 3D con proporción adulta (cabeza más pequeña; render3d.js y lowpoly3d.js miran la marca);
   2 · luz con contraste: sombras de verdad, menos luz de relleno, colores algo menos saturados;
   3 · interfaz sobria: rótulos más finos y menos redondeados, sin el aire de pegatina.
   La base no cambia: panal de miel, papel y luz cálida. Entra en recorrido libre, así que no guarda nada. */
if (window.COLMENA_ADULTO) {
  const CELDA = 'rel';
  document.body.classList.add('adulto');
  /* ── 3 · interfaz ── */
  {
    const st = document.createElement('style');
    st.textContent = `
body.adulto canvas{filter:saturate(.84) contrast(1.07) brightness(.97)}
body.adulto #hud *,body.adulto #goal,body.adulto #note,body.adulto #dlg,body.adulto #narr,body.adulto #talk,body.adulto .tut{border-radius:3px!important;letter-spacing:.01em}
body.adulto #goal,body.adulto #note,body.adulto .tut{background:rgba(28,20,14,.82)!important;color:#EFE4CC!important;box-shadow:none!important;border:1px solid rgba(228,168,68,.35)!important;clip-path:none!important}
body.adulto #goal *,body.adulto #note *,body.adulto .tut *{color:#EFE4CC!important}
body.adulto button{border-radius:4px!important;font-weight:500!important}
body.adulto .tdemo{letter-spacing:.2em;text-transform:uppercase}`;
    document.head.appendChild(st);
  }
  /* ── la portada: una sola entrada, directa a la Relojería ── */
  {
    const bn = document.getElementById('bnew'),
      bc = document.getElementById('bcont'),
      bf = document.getElementById('bfree'),
      t = document.getElementById('tdemo');
    if (bn) bn.hidden = true;
    if (bc) bc.hidden = true;
    if (bc) bc.style.display = 'none';
    if (bn) bn.style.display = 'none';
    if (bf) {
      bf.hidden = false;
      bf.textContent = 'Entrar a la Relojería';
    }
    if (t) {
      t.hidden = false;
      t.textContent = 'Muestra · versión adulta';
    }
    /* tras entrar en recorrido libre (no guarda nada), directo a la Relojería */
    if (bf)
      bf.addEventListener('click', () => {
        let n = 0;
        const ir = () => {
          try {
            if (!inTitle && cur !== CELDA && !crossing) fastTravel(CELDA);
          } catch (e) {}
          if (cur !== CELDA && n++ < 20) setTimeout(ir, 700);
        };
        setTimeout(ir, 700);
      });
  }
  /* ── 2 · luz: el sol proyecta sombras sobre el cuarto en el que estás ── */
  if (window.R3DX) {
    const VISTO = new WeakSet();
    let listo = false,
      ultimo = null;
    const marca = (o) => {
      o.traverse((m) => {
        if (!m.isMesh || VISTO.has(m)) return;
        VISTO.add(m);
        const mt = m.material;
        if (!mt || Array.isArray(mt)) return;
        m.receiveShadow = !mt.transparent;
        m.castShadow = !mt.transparent && !mt.isMeshBasicMaterial;
      });
    };
    R3DX.push(() => {
      if (inTitle || !window.R3D || !R3D.renderer || !R3D.sun) return;
      const sun = R3D.sun,
        hemi = R3D.hemi,
        rn = R3D.renderer;
      if (!listo) {
        listo = true;
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
        R3D.scene.add(sun.target);
      }
      /* el sol, bajo y de lado: sombras largas hacia la cámara */
      const o = R3D.worldOf(cur, 0, 0, 0);
      sun.target.position.copy(o);
      sun.position.set(o.x - 520, o.y + 900, o.z - 380);
      hemi.intensity *= 0.6;
      sun.intensity *= 1.75;
      const r = R3D.rooms[cur];
      if (r && r.grp) {
        if (ultimo !== r) ultimo = r;
        marca(r.grp);
      }
      const pl = R3D.player;
      if (pl && pl.grp) marca(pl.grp);
    });
  }
}
