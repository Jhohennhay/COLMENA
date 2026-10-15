/* ══════════ MODO EXPLORAR · cámara detrás del chico para recorrer la celda de cerca (oct 2026) ══════════
   Idea tomada de «El Principito entre las estrellas» (littleprince.dev): cada planeta se recorre de cerca.
   Se añade a la vista de siempre, con un botón (◎) o la tecla C; no la sustituye.
   · La cámara va detrás y algo por encima del chico, y gira sola despacio hacia donde anda.
   · Arrastrar con el ratón o el dedo la gira alrededor de él; las flechas mueven al chico respecto a la cámara,
     como ya hacían (R3D.rotIn usa el giro de la cámara).
   · Si la cámara fuese a quedar fuera de la celda, se acerca para no ver a través de las paredes.
   · Durante viajes, diálogos, el mapa o las escenas, se vuelve a la vista de siempre. */
const EXPLORA = { on: false, yaw: 0, dist: 300, alto: 155, prev: null, hd: null, rumbo: null };
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
    EXPLORA.yaw = R3D.CAM.yaw;
    EXPLORA.prev = R3D.CAM.yawT;
    EXPLORA.hd = null;
    rotulo();
    if (typeof note === 'function') note(EXPLORA.on ? 'Modo explorar: arrastra para girar la cámara.' : 'Vista de la colmena.');
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
window.R3DXP = window.R3DXP || [];
R3DXP.push((dt) => {
  if (!EXPLORA.on || !window.R3D || !R3D.camera || inTitle || mapMode || crossing || talking || (typeof GAME !== 'undefined' && GAME)) {
    if (EXPLORA.on) EXPLORA.prev = R3D.CAM ? R3D.CAM.yawT : null;
    return;
  }
  const CAM = R3D.CAM,
    cam = R3D.camera,
    k = Math.min(1, (dt || 0.016) * 4);
  /* arrastrar: lo que la vista de siempre sumaría a su giro, aquí gira alrededor del chico, sin topes */
  if (EXPLORA.prev !== null && CAM.yawT !== EXPLORA.prev) EXPLORA.yaw += (CAM.yawT - EXPLORA.prev) * 2.2;
  CAM.yawT = 0;
  EXPLORA.prev = 0;
  /* al andar, la cámara se coloca poco a poco detrás */
  if (EXPLORA.rumbo !== null && EXPLORA.prev0 !== undefined) {
    const dx = Pl.x - EXPLORA.rumbo[0],
      dy = Pl.y - EXPLORA.rumbo[1],
      m = Math.hypot(dx, dy);
    if (m > 0.6 && m < 60) {
      let d = Math.atan2(-dx, -dy) - EXPLORA.yaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      /* solo si anda más o menos hacia delante: si va hacia la cámara, no da la vuelta de golpe */
      if (Math.abs(d) < 2.2) EXPLORA.yaw += d * Math.min(1, (dt || 0.016) * 1.1);
    }
  }
  EXPLORA.rumbo = [Pl.x, Pl.y];
  EXPLORA.prev0 = 1;
  const sy = Math.sin(EXPLORA.yaw),
    cy = Math.cos(EXPLORA.yaw);
  /* en pantalla vertical (móvil) hace falta más distancia para ver algo más que al chico */
  const asp = cam.aspect || 1.6,
    dist = EXPLORA.dist * (asp < 1 ? 1.7 : 1);
  /* si el punto de detrás queda fuera de la celda, la cámara sube para mirar por encima del muro */
  let alto = EXPLORA.alto;
  if (window.SALAS && SALAS.kit && SALAS.kit.rHex) {
    const x = Pl.x + sy * dist,
      y = Pl.y + cy * dist,
      fuera = Math.hypot(x, y) - SALAS.kit.rHex(Math.atan2(y, x), 10);
    if (fuera > 0) alto += Math.min(260, fuera * 0.9);
  }
  const p = R3D.worldOf(cur, Pl.x, Pl.y, 0),
    t = (EXPLORA.t = EXPLORA.t || new THREE.Vector3()),
    q = (EXPLORA.q = EXPLORA.q || new THREE.Vector3());
  q.set(p.x + sy * dist, p.y + alto, p.z + cy * dist);
  t.set(p.x - sy * 70, p.y + 58, p.z - cy * 70);
  if (EXPLORA.hd === null) EXPLORA.hd = { c: cam.position.clone(), m: t.clone() };
  EXPLORA.hd.c.lerp(q, k);
  EXPLORA.hd.m.lerp(t, k);
  cam.position.copy(EXPLORA.hd.c);
  cam.lookAt(EXPLORA.hd.m);
  cam.near = 4;
  cam.updateProjectionMatrix();
  const f = R3D.fog;
  if (f) {
    f.near = 600;
    f.far = 2600;
  }
  /* el resto del juego (flechas, pistas en pantalla) sigue usando el giro de la cámara */
  CAM.yaw = EXPLORA.yaw;
});
I18N([
  ['Explorar de cerca (C)', 'Explore up close (C)', 'Осмотреться вблизи (C)', '近距离探索（C）'],
  ['Volver a la vista de la colmena (C)', 'Back to the hive view (C)', 'Вернуться к виду улья (C)', '返回蜂巢视图（C）'],
  [
    'Modo explorar: arrastra para girar la cámara.',
    'Explore mode: drag to turn the camera.',
    'Режим осмотра: потяни, чтобы повернуть камеру.',
    '探索模式：拖动以转动镜头。',
  ],
  ['Vista de la colmena.', 'Hive view.', 'Вид улья.', '蜂巢视图。'],
]);
