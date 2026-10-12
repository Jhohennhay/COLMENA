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
  const NIEBLA = '#3A2418';
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
body.adulto canvas{filter:saturate(.86) contrast(1.06)}
body.adulto #hud *,body.adulto #goal,body.adulto #note,body.adulto .tut{border-radius:3px!important;letter-spacing:.01em}
body.adulto #goal,body.adulto #note,body.adulto .tut{background:rgba(28,20,14,.82)!important;color:#EFE4CC!important;box-shadow:none!important;border:1px solid rgba(228,168,68,.35)!important;clip-path:none!important}
body.adulto #goal *,body.adulto #note *,body.adulto .tut *{color:#EFE4CC!important}
body.adulto button{border-radius:4px!important;font-weight:500!important}`;
    document.head.appendChild(st);
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
    rn.render(R3D.scene, cam);
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
  /* ── 2 · luz ── */
  if (window.R3DX) {
    const VISTO = new WeakSet(),
      SOMBRAS = !COARSE,
      CNIEBLA = new THREE.Color(NIEBLA);
    let listo = false,
      espera = 0;
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
    R3DX.push((dt) => {
      if (inTitle || !window.R3D || !R3D.renderer || !R3D.sun) return;
      const sun = R3D.sun,
        hemi = R3D.hemi,
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
      /* un cuarto dormido ya es oscuro de por sí: ahí se quita menos luz de relleno */
      hemi.intensity *= 0.62 + 0.3 * Math.min(1, darkLevel(cur) || 0);
      sun.intensity *= 1.7;
      const r = R3D.rooms[cur];
      if (SOMBRAS) {
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
