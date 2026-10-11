/* ══════════ MEJORAS DE JUGABILIDAD ══════════
   2 · Viaje rápido: en el mapa, toca un cuarto despierto y viaja directo. En las plazas ya no te detienes:
       si quieres cambiar de rumbo, toca «⇄ Cambiar de rumbo» mientras cruzas.
   3 · Un solo sistema de pistas: el farol (el botón del reloj). Tócalo para pedir pista; late cerca de secretos.
   4 · El Andén Vacío se abre al tercer sello (aviso una vez).
   5 · El 3D es la versión principal; el papel 2D queda como modo ligero.
   6 · El Corazón y las plazas, más grandes; todo lo que se puede tocar lleva el mismo anillo dorado.
   7 · Mapa legible: nombres solo del racimo actual, del objetivo y del que señalas; leyenda de pisos.     */

/* ── racimos (para el mapa y el viaje) ── */
const GRUPO = {
  pri: 'sea',
  ver: 'sea',
  oto: 'sea',
  inv: 'sea',
  col: 'ofi',
  bib: 'ofi',
  coc: 'ofi',
  rel: 'ofi',
  tea: 'dre',
  inn: 'dre',
  far: 'dre',
  tre: 'dre',
  esp: 'dre',
  sot: 'rai',
  cue: 'rai',
  vol: 'rai',
  cum: 'rai',
  oce: 'rai',
  des: 'rai',
  ant: 'rai',
  dsv: 'mem',
  ret: 'mem',
  jar: 'mem',
  est: 'mem',
  cor: 'cor',
  and: 'aba',
  eco: 'aba',
  per: 'aba',
  api: 'aba',
  rev: 'aba',
};
const PISO = { dre: 2, mem: 1, sea: 0, ofi: 0, rai: -1, cor: -2, aba: -3 };
const PISO_N = { 2: 'Los sueños', 1: 'La memoria', 0: 'La colmena', [-1]: 'Las raíces', [-2]: 'El Corazón', [-3]: 'La colmena de abajo' };

/* ── 2 · viaje rápido ── */
const fastOK = (id) =>
  id !== cur &&
  isSeen(id) &&
  !PUZ.cellLocked(id) &&
  (FREE || isAwake(id)) &&
  !(typeof isDown === 'function' && !FREE && (isDown(id) || !isRisen(id)));
function fastTravel(id) {
  travelEl.hidden = true;
  travelTo = null;
  Sound.sfx('door');
  fadeEl.classList.add('on');
  setTimeout(() => {
    narrClear();
    closeTalk();
    crossing = null;
    Pl.route = null;
    Pl.goal = null;
    cur = id;
    const n = CELLS[id].npc;
    Pl.x = clamp(n.x + (n.tx ?? 45) + 30, -200, 200);
    Pl.y = clamp(n.y + (n.ty ?? 40) + 40, -180, 200);
    for (const k in BAKED) if (k !== id) delete BAKED[k];
    bakeCell(id);
    STYLE.tag(CELLS[id]);
    seenMark(id);
    for (const k of ORDER) FOCUS[k] = k === id ? 1 : 0;
    if (mapMode) toggleMap();
    camReady = false;
    save();
    updGoal();
    setTimeout(() => fadeEl.classList.remove('on'), 250);
  }, 480);
}
function fastOffer(id) {
  if (!fastOK(id)) {
    travelEl.hidden = true;
    travelTo = null;
    return false;
  }
  travelTo = id;
  const train = typeof canTravel === 'function' && canTravel() && GRUPO[id] === 'dre';
  travelT.textContent = train ? _t(`🚂 Viajar en el tren nocturno a ${SEASON[id].name}`) : _t('⬡ Ir a') + ' ' + _t(SEASON[id].name);
  travelEl.dataset.fast = train ? '' : '1';
  travelEl.hidden = false;
  return true;
}
travelEl.addEventListener(
  'click',
  (e) => {
    if (travelTo && travelEl.dataset.fast) {
      e.stopImmediatePropagation();
      fastTravel(travelTo);
    }
  },
  true,
);
travelOffer = function (id) {
  return fastOffer(id);
};
window.FASTGO = (id) => {
  if (!mapMode) return false;
  return (
    fastOffer(id) ||
    (note(PUZ.cellLocked(id) || !isSeen(id) ? _t('Todavía no puedes llegar ahí.') : _t('Despierta ese cuarto para poder viajar directo.')),
    true)
  );
};
{
  const ot0 = onTap;
  onTap = function (sx, sy) {
    if (mapMode && !crossing && !inTitle) {
      const s = S * Z * ZK * DPR,
        wx = (sx - camX) / s,
        wy = (sy - camY) / s / K;
      for (const id of ORDER) {
        if (inHex(wx - CW[id][0], wy - CW[id][1] + (LIFT / K) * FOCUS[id], R + TH)) {
          if (fastOffer(id)) return;
        }
      }
    }
    travelEl.hidden = true;
    ot0(sx, sy);
  };
}
{
  const tm0 = toggleMap;
  toggleMap = function () {
    tm0.apply(this, arguments);
    if (!mapMode) {
      travelEl.hidden = true;
      travelTo = null;
    } else if (!MEJ.mapTip) {
      MEJ.mapTip = 1;
      note(_t('Toca un cuarto despierto para viajar directo.'));
    }
  };
}
const MEJ = {};

/* ── 2b · plazas: «Cambiar de rumbo» solo si lo pides ── */
let rumboEl = null;
function rumboUI() {
  if (rumboEl) return rumboEl;
  rumboEl = document.createElement('button');
  rumboEl.id = 'rumbo';
  rumboEl.className = 'travel shadow';
  rumboEl.innerHTML = '<span class="p paper torn">⇄ ' + _t('Cambiar de rumbo en la plaza') + '</span>';
  rumboEl.hidden = true;
  rumboEl.addEventListener('click', () => {
    const cr = crossing;
    if (cr && cr.comp && !cr.choose) {
      cr.choose = true;
      cr.chosen = false;
      const k = cr.opts.findIndex((o) => o.to === cur);
      if (k > 0) cr.opts.unshift(cr.opts.splice(k, 1)[0]);
      Sound.sfx('door', 0.5);
    }
    rumboEl.hidden = true;
  });
  document.getElementById('stage').appendChild(rumboEl);
  return rumboEl;
}
function rumboTick() {
  const cr = crossing,
    b = rumboUI(),
    show = !!(
      cr &&
      cr.comp &&
      !cr.trip &&
      !cr.choose &&
      !cr.hold &&
      cr.opts &&
      cr.opts.length > 1 &&
      cr.t < cr.comp.hubT - 0.2 &&
      !inTitle
    );
  if (b.hidden === show) b.hidden = !show;
}

/* ── 3 · el farol: un solo botón de pistas ── */
function farolUI() {
  const h = document.getElementById('hora');
  if (!h || h.dataset.farol) return;
  h.dataset.farol = 1;
  const nb = h.cloneNode(true);
  h.replaceWith(nb);
  nb.setAttribute('aria-label', _t('Farol · pedir una pista'));
  nb.title = _t('Farol · pedir una pista');
  nb.addEventListener('click', () => {
    setMenu(false);
    hintPress();
    Sound.sfx('pick', 0.3);
  });
  horaEl = nb;
  heartEl = nb.querySelector('#m2heart') || heartEl;
  if (heartEl) {
    heartEl.textContent = '✦';
    heartEl.style.background = '#B8783A';
  }
  horaDraw(true);
  const hb = document.getElementById('hintb');
  if (hb) hb.remove();
}
/* en la primera pista, si el farol late, dilo */
{
  const hp0 = hintPress;
  hintPress = function () {
    const tg = typeof m2Target === 'function' && m2Target();
    if (tg && !tg.far && tg.v > 0.25 && !MEJ.hp) {
      MEJ.hp = T;
      narrClear();
      narrate(['Tu farol late. Hay algo escondido muy cerca de aquí.']);
      note(_t('El farol late: busca lo que brilla.'));
      setTimeout(() => {
        MEJ.hp = 0;
      }, 9000);
      return;
    }
    return hp0();
  };
}

/* ── 4 · aviso: la colmena de abajo ya se puede visitar ── */
function abajoTick() {
  if (FREE || inTitle || typeof abOpen !== 'function') return;
  if (abOpen() && !(PROG.F.ab && PROG.F.ab.aviso)) {
    (PROG.F.ab = PROG.F.ab || {}).aviso = 1;
    save();
    note('🕰 ' + _t('Bajo las raíces se ha abierto un andén'));
    narrate(['Bajo el Sótano hay un andén donde esperé un tren que no quería coger. Ya puedes bajar.'], 'ab:aviso', { delay: 2 });
  }
}

/* ── 5 · 3D principal, 2D ligero ── */
{
  const sel = document.getElementById('gfxsel');
  if (sel) {
    const relabel = () => {
      sel.options[0].textContent = _t('Diorama 3D (completo)');
      sel.options[1].textContent = _t('Papel 2D (ligero)');
    };
    relabel();
    sel.addEventListener('focus', relabel);
    const sm = document.querySelector('#gfxrow small');
    if (sm) sm.textContent = _t('el 3D es la versión completa, con pisos y efectos; el papel 2D es un modo ligero para móviles antiguos');
  }
}

/* ── 6 · todo lo que se puede tocar: el mismo anillo dorado ── */
{
  const qu0 = qUnder;
  qUnder = function (p, id) {
    qu0(p, id);
    if (id !== cur || crossing) return;
    for (const t of thingsHere()) {
      if (t.secret || t.item) continue;
      const a = STILL ? 0.55 : 0.4 + 0.25 * Math.sin(T * 3 + t.x * 0.01);
      const q = p.P(t.x, t.y, 1);
      p.line(
        [
          ...p.ell(q[0], q[1], Math.min(46, (t.r || 50) * 0.55), Math.min(18, (t.r || 50) * 0.22), 26),
          p.ell(q[0], q[1], Math.min(46, (t.r || 50) * 0.55), Math.min(18, (t.r || 50) * 0.22), 26)[0],
        ],
        '#F3C872',
        2.2,
        a,
      );
    }
  };
}
/* el Corazón: una corona de cera alrededor, más grande que cualquier cuarto; plazas más anchas */
let CORONA = null;
function corona3() {
  if (!window.R3D || !R3D.on || !R3D.scene || !window.LP3D) return;
  if (CORONA && CORONA.parent === R3D.scene) return;
  const { Bk, CYL, BOX, glowSprite } = LP3D.kit,
    B = new Bk(),
    g = new THREE.Group(),
    c = CW.cor,
    y = R3D.lift('cor');
  B.add(CYL(R + TH + 150, R + TH + 120, 26, 6), '#B8782C', [c[0], y - 28, c[1]], [0, Math.PI / 2, 0]);
  B.add(CYL(R + TH + 146, R + TH + 146, 2, 6), '#E4A844', [c[0], y - 14, c[1]], [0, Math.PI / 2, 0]);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * TAU + 0.26,
      r = R + TH + 128,
      x = c[0] + Math.cos(a) * r,
      z = c[1] + Math.sin(a) * r;
    B.add(CYL(3, 3.6, 60, 6), '#6E4A2A', [x, y + 16, z]);
    B.add(BOX(12, 14, 12), '#6E4A2A', [x, y + 52, z]);
    const sp = glowSprite('#FFD36A', 54);
    sp.material.opacity = 0.5;
    sp.position.set(x, y + 52, z);
    g.add(sp);
  }
  B.mesh(g);
  g.userData.corona = 1;
  R3D.scene.add(g);
  CORONA = g;
}
if (window.R3DX)
  R3DX.push(() => {
    try {
      corona3();
      if (CORONA) CORONA.position.y = R3D.lift('cor') - (CORONA.userData.y0 ?? (CORONA.userData.y0 = R3D.lift('cor')));
    } catch (e) {}
  });

/* ── 7 · mapa legible: nombres justos y leyenda de pisos ── */
let MAPHOVER = null;
window.MAPFULL = (id) => {
  if (id === MAPHOVER) return true;
  if (GRUPO[id] === GRUPO[cur]) return true;
  const gc = typeof QGOAL !== 'undefined' && QGOAL.cell;
  if (id === gc) return true;
  try {
    if (id === goalCell(PUZ.goal())) return true;
  } catch (e) {}
  return false;
};
addEventListener(
  'pointermove',
  (e) => {
    if (!mapMode || !window.R3D || !R3D.on) return;
    let best = null,
      bd = 70 * DPR;
    const dpr = DPR,
      cx = e.clientX * dpr,
      cy = e.clientY * dpr;
    for (const id of ORDER) {
      try {
        const q = R3D.projW(...R3D.base3(id, HW + 70));
        const d = Math.hypot(q[0] - cx, q[1] - cy);
        if (d < bd) {
          bd = d;
          best = id;
        }
      } catch (_) {}
    }
    MAPHOVER = best;
  },
  { passive: true },
);
let legEl = null;
function legendTick() {
  if (!legEl) {
    legEl = document.createElement('div');
    legEl.id = 'pisos';
    legEl.className = 'pisos shadow';
    legEl.setAttribute('aria-hidden', 'true');
    document.getElementById('stage').appendChild(legEl);
    const st = document.createElement('style');
    st.textContent =
      '.pisos{position:absolute;left:14px;top:50%;transform:translateY(-50%);z-index:2;pointer-events:none}.pisos .p{padding:12px 14px 10px;display:flex;flex-direction:column;gap:3px;font-size:12.5px}.pisos b{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#A5652A;margin-bottom:2px}.pisos span{display:flex;gap:8px;align-items:center;color:#6A4426;opacity:.75}.pisos span i{font-style:normal;font-variant-numeric:tabular-nums;width:20px;text-align:right;font-weight:600}.pisos span.on{opacity:1;color:#3A2412;font-weight:600}.pisos span.on i{color:#C47A2C}@media (max-width:560px){.pisos{top:auto;bottom:calc(76px + env(safe-area-inset-bottom,0px));transform:none}.pisos .p{padding:8px 10px;font-size:11.5px}}';
    document.head.appendChild(st);
    legEl.dataset.k = '';
  }
  const show = mapMode && !inTitle && window.R3D && R3D.on,
    k = (show ? 1 : 0) + ':' + cur + ':' + LANG;
  if (legEl.dataset.k === k) return;
  legEl.dataset.k = k;
  legEl.hidden = !show;
  if (!show) return;
  const here = PISO[GRUPO[cur]] ?? 0;
  legEl.innerHTML =
    '<div class="p paper torn"><b>' +
    _t('Pisos') +
    '</b>' +
    [2, 1, 0, -1, -2, -3]
      .map((n) => `<span class="${n === here ? 'on' : ''}"><i>${n > 0 ? '+' + n : n}</i>${_t(PISO_N[n])}</span>`)
      .join('') +
    '</div>';
}

/* ── el tictac de todo esto ── */
{
  const bt0 = beatTick;
  beatTick = function () {
    try {
      rumboTick();
      farolUI();
      abajoTick();
      legendTick();
    } catch (e) {
      if (!MEJ.err) {
        MEJ.err = 1;
        console.warn('mejoras', e);
      }
    }
    return bt0();
  };
}
