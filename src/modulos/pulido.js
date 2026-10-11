/* ══════════ PULIDO ANTES DE CLAUDE CODE ══════════
   1 · Cada texto en su sitio: abajo la narración y el tutorial, por turnos y sin pisarse; arriba los
       avisos, los logros y las celebraciones. La narración se pasa tocándola.
   2 · Copia de la partida: se guarda en un archivo y se carga en cualquier navegador o dispositivo.
   3 · Al continuar, una tarjeta recuerda dónde estabas, cuánto llevas y qué toca hacer.
   4 · Los grandes momentos se celebran: sello (destello y pausa breve), vecino ayudado, atajo nuevo.
   5 · El tiempo del juego no se ralentiza en móviles lentos (pasos de 50 ms aunque haya pocos fotogramas). */
(() => {
  const $ = (id) => document.getElementById(id);
  const vis = (e) => !!(e && !e.hidden && e.offsetParent !== null && getComputedStyle(e).display !== 'none');
  const css = document.createElement('style');
  css.textContent = `
#narr,#note,.tut,#achv,#celeb{transition:bottom .35s ease,top .35s ease}
#narr.on{pointer-events:auto;cursor:pointer}
@media (max-width:759px){#note{white-space:normal!important;text-align:center;width:max-content;max-width:calc(100% - 24px)!important;box-sizing:border-box;line-height:1.3}}
.celeb{position:absolute;left:50%;transform:translateX(-50%);z-index:7;display:flex;gap:12px;align-items:center;padding:10px 18px 10px 10px;background:#3A2412;color:#FFF4D6;border-radius:14px;box-shadow:0 0 0 2px #E8A93A,0 6px 18px rgba(20,10,2,.5);pointer-events:none;width:max-content;max-width:calc(100% - 24px);box-sizing:border-box;animation:celin 3s ease forwards}
.celeb i{flex:none;width:38px;height:38px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFE7A6,#E8A93A);color:#3A2412;display:grid;place-items:center;font-style:normal;font-size:20px;font-weight:700}
.celeb small{display:block;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:#F6D58A}
.celeb b{display:block;font:600 16px/1.3 Fraunces,'Noto Serif','Noto Serif SC',Georgia,serif}
@keyframes celin{0%{opacity:.5;transform:translateX(-50%) scale(.88)}10%{opacity:1;transform:translateX(-50%) scale(1.05)}18%{transform:translateX(-50%) scale(1)}85%{opacity:1}100%{opacity:0}}
.flash{position:absolute;inset:0;z-index:6;pointer-events:none;background:radial-gradient(circle at 50% 45%,rgba(255,240,190,.85),rgba(255,214,140,.35) 45%,rgba(255,214,140,0) 75%);animation:flash .9s ease-out forwards}
@keyframes flash{0%{opacity:0}12%{opacity:1}100%{opacity:0}}
.recap{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:rgba(30,15,4,.45);padding:16px}
.recap .p{width:min(420px,100%);box-sizing:border-box;padding:20px 22px 18px;animation:tin .4s ease}
.recap h2{margin:0 0 2px;font:600 22px Fraunces,'Noto Serif','Noto Serif SC',Georgia,serif;color:#3A2412}
.recap .ago{margin:0 0 12px;font-size:14px;color:#7A5232}
.recap dl{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0 0 14px;font-size:15px}
.recap dt{color:#7A5232}.recap dd{margin:0;color:#3A2412;font-weight:600}
.recap .obj{padding:10px 12px;border-radius:8px;background:#4A3222;color:#FFF4D6;font-size:15px;line-height:1.35;margin-bottom:14px}
.recap .obj small{display:block;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:#F6D58A;margin-bottom:2px}
.recap .bt{display:flex;gap:8px;flex-wrap:wrap}.recap button{flex:1;min-height:46px;font:inherit;font-size:15px;border:0;border-radius:8px;cursor:pointer;background:#F6EEDC;color:#3A2412;box-shadow:inset 0 0 0 1.5px #E3C98E}
.recap button.pri{background:#E8A93A;box-shadow:0 2px 0 #C9963E;font-weight:600}
.recap button:focus-visible{outline:3px solid #4A3222;outline-offset:2px}
.tcopy{display:flex;gap:4px;justify-content:center;flex-wrap:wrap;margin:8px 0 0}.tcopy button{font:inherit;font-size:14px;min-height:44px;padding:0 10px;border:0;background:none;color:#7A4E2A;text-decoration:underline;cursor:pointer}
.pgrid #bsavec,.pgrid #bloadc{order:7}.pgrid #bfs2{order:8;grid-column:1/-1}.pgrid #btitle{order:9}.pgrid #rst{order:10}
.pgrid #bloadc.sure{background:#A5452A;color:#FFF4E6}
`;
  document.head.appendChild(css);

  /* ═══ 5 · el tiempo no se ralentiza con pocos fotogramas · y la pausa breve de los sellos ═══ */
  let HOLD = 0;
  {
    const fl = frameLogic;
    frameLogic = function (now) {
      if (HOLD > now) {
        last = now;
        return 0;
      }
      const raw = now - last;
      if (raw > 55 && raw < 400) {
        const n = Math.min(8, Math.ceil(raw / 50));
        let s = 0;
        for (let i = 1; i < n; i++) s += fl(last + raw / n);
        return s + fl(now);
      }
      return fl(now);
    };
  }

  /* ═══ 1 · cada texto en su sitio ═══ */
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:absolute;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)';
  document.body.appendChild(probe);
  const safe = () => {
    const c = getComputedStyle(probe);
    return [parseFloat(c.paddingTop) || 0, parseFloat(c.paddingBottom) || 0];
  };
  const zoomOf = (e) => parseFloat(getComputedStyle(e).zoom) || 1;
  function put(e, side, px) {
    const v = Math.round(px / zoomOf(e)) + 'px',
      o = side === 'top' ? 'bottom' : 'top';
    if (e.style[side] !== v) e.style[side] = v;
    if (e.style[o] !== 'auto') e.style[o] = 'auto';
  }
  let celebEl = null;
  function lay() {
    const stage = $('stage');
    if (!stage || inTitle) return;
    const S = stage.getBoundingClientRect(),
      [st, sb] = safe(),
      narrow = innerWidth < 760;
    /* abajo: la narración y, encima, el tutorial */
    let y = (narrow ? 78 : 84) + sb;
    const narr = $('narr'),
      tut = document.querySelector('.tut');
    if (narr) {
      put(narr, 'bottom', y);
      if (narr.classList.contains('on') || parseFloat(getComputedStyle(narr).opacity) > 0.05) y += narr.getBoundingClientRect().height + 6;
    }
    if (tut && vis(tut)) put(tut, 'bottom', Math.max(y, narrow ? 78 + sb : 150 + sb));
    /* arriba: celebración, aviso y logro, debajo del nombre del cuarto y del objetivo */
    const obs = [...document.querySelectorAll('.tag,#goal,.pisos,.ctrl')]
      .filter(vis)
      .map((e) => e.getBoundingClientRect())
      .filter((r) => r.height && r.top - S.top < S.height * 0.4);
    let top = st + 12;
    for (const e of [celebEl, $('note'), narrow ? $('achv') : null]) {
      if (!e || !vis(e)) continue;
      const R = e.getBoundingClientRect(),
        w = R.width,
        h = R.height,
        l = S.left + S.width / 2 - w / 2,
        r = l + w;
      let y = top;
      for (let k = 0; k < 6; k++) {
        const Y = S.top + y,
          hit = obs.find((o) => o.left < r && l < o.right && Y < o.bottom + 6 && o.top < Y + h);
        if (!hit) break;
        y = hit.bottom - S.top + 8;
      }
      put(e, 'top', y);
      top = y + h + 8;
    }
  }
  {
    const loop = () => {
      try {
        lay();
      } catch (e) {}
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* la narración espera a que leas la tarjeta nueva del tutorial y no empieza con la tarjeta de resumen abierta */
  let tutK = '',
    tutAt = -1e9,
    recapEl = null;
  const recapOpen = () => !!(recapEl && !recapEl.hidden);
  const tutFresh = () => {
    const t = document.querySelector('.tut');
    if (!vis(t)) return false;
    const k = t.dataset.k || '';
    if (k !== tutK) {
      tutK = k;
      tutAt = performance.now();
    }
    return performance.now() - tutAt < 2600;
  };
  {
    const nt = narrTick;
    narrTick = function (dt) {
      if (!narrCur && (tutFresh() || recapOpen())) return;
      return nt(dt);
    };
  }
  /* tocar la narración la pasa */
  {
    const n = $('narr');
    if (n) {
      n.addEventListener('pointerdown', (e) => e.stopPropagation());
      n.addEventListener('click', (e) => {
        e.stopPropagation();
        if (narrCur) {
          narrCur.left = 0;
          narrCur.max = 0;
          try {
            speechSynthesis.cancel();
          } catch (_) {}
          speaking = false;
        }
      });
    }
  }

  /* ═══ 4 · celebraciones ═══ */
  const CQ = [];
  let cBusy = false;
  function flash() {
    const st = $('stage');
    if (!st) return;
    const f = document.createElement('div');
    f.className = 'flash';
    st.appendChild(f);
    setTimeout(() => f.remove(), 1000);
  }
  function fx(c) {
    const calm = typeof STILL !== 'undefined' && STILL;
    if (c.kind === 'seal') {
      if (!calm) {
        flash();
        HOLD = performance.now() + 220;
      }
      buzz([30, 40, 30]);
    } else if (c.kind === 'help') {
      Sound.sfx('cheer');
      if (c.id === cur) EMO[cur] = { ch: '♥', t0: T + 0.1 };
      Pl.happy = T + 2.5;
      if (!calm && !ZKhold) ZKhold = { v: 1.18, until: T + 1.3 };
      buzz([15, 40, 15]);
    } else if (c.kind === 'atajo') {
      Sound.sfx('atajo');
      buzz(25);
    }
  }
  function celebShow() {
    if (cBusy || !CQ.length || inTitle || document.body.classList.contains('carding')) return;
    const c = CQ.shift();
    cBusy = true;
    if (!celebEl) {
      celebEl = document.createElement('div');
      celebEl.id = 'celeb';
      celebEl.className = 'celeb';
      celebEl.setAttribute('role', 'status');
      celebEl.setAttribute('aria-live', 'polite');
      celebEl.hidden = true;
      $('stage').appendChild(celebEl);
    }
    celebEl.textContent = '';
    const i = document.createElement('i');
    i.textContent = c.icon;
    const d = document.createElement('div'),
      s = document.createElement('small'),
      b = document.createElement('b');
    s.textContent = c.k;
    b.textContent = c.t;
    d.append(s, b);
    celebEl.append(i, d);
    celebEl.hidden = false;
    celebEl.style.animation = 'none';
    void celebEl.offsetWidth;
    celebEl.style.animation = '';
    setTimeout(() => {
      celebEl.hidden = true;
      cBusy = false;
      celebShow();
    }, 3000);
  }
  setInterval(celebShow, 250);
  window.CELEB = (c) => {
    if (FREE) return;
    try {
      fx(c);
    } catch (e) {}
    CQ.push(c);
    celebShow();
  };
  /* el aviso suelto del sello se sustituye por la celebración */
  if (typeof lightSeal === 'function') {
    const ls = lightSeal;
    lightSeal = function (...a) {
      const n0 = note;
      note = (m) => {
        if (!/^✦ Sello/.test(String(m || ''))) n0(m);
      };
      try {
        return ls.apply(this, a);
      } finally {
        note = n0;
      }
    };
  }
  /* qué cambió desde hace un momento: sellos nuevos y vecinos ayudados */
  const counted = () =>
    ORDER.filter((id) => {
      if (window.CHIDE && CHIDE(id)) return false;
      try {
        const q = QSTAT(id);
        return !!q;
      } catch (e) {
        return false;
      }
    });
  const doneSet = () => {
    const s = new Set();
    for (const id of counted()) {
      try {
        if (QSTAT(id).done) s.add(id);
      } catch (e) {}
    }
    return s;
  };
  const who = (id) => _t(NPCN[id] || (SEASON[id] && SEASON[id].name) || id);
  let base = null;
  const snap = () => ({ seals: sealCount(), done: doneSet() });
  setInterval(() => {
    if (inTitle || FREE) {
      base = null;
      return;
    }
    if (!base) {
      base = snap();
      return;
    }
    const now = snap(),
      tot = counted().length;
    for (const id of now.done)
      if (!base.done.has(id))
        CELEB({
          kind: 'help',
          id,
          icon: '♥',
          k: _t('Vecino ayudado') + ' · ' + now.done.size + '/' + tot,
          t: _t('Ayudaste a {n}').replace('{n}', who(id)),
        });
    if (now.seals > base.seals)
      CELEB({ kind: 'seal', icon: '✦', k: _t('Sello encendido'), t: _t('Sellos {n} de 6').replace('{n}', now.seals) });
    base = now;
  }, 300);

  /* ═══ 3 · al volver, dónde estabas y qué toca ═══ */
  function ago(t) {
    if (!t) return '';
    const m = Math.round((Date.now() - t) / 60000);
    if (m < 2) return _t('Hace un momento');
    if (m < 60) return _t('Hace {n} minutos').replace('{n}', m);
    const h = Math.round(m / 60);
    if (h < 24) return h === 1 ? _t('Hace una hora') : _t('Hace {n} horas').replace('{n}', h);
    const d = Math.round(h / 24);
    return d === 1 ? _t('Ayer') : _t('Hace {n} días').replace('{n}', d);
  }
  function closeRecap() {
    if (recapEl) recapEl.hidden = true;
  }
  function showRecap(t) {
    if (!recapEl) {
      recapEl = document.createElement('div');
      recapEl.className = 'recap';
      recapEl.setAttribute('role', 'dialog');
      recapEl.setAttribute('aria-modal', 'true');
      recapEl.setAttribute('aria-labelledby', 'rcpt');
      recapEl.hidden = true;
      $('stage').appendChild(recapEl);
      recapEl.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (e.target === recapEl) closeRecap();
      });
      addEventListener(
        'keydown',
        (e) => {
          if (e.key === 'Escape' && recapOpen()) {
            e.stopPropagation();
            closeRecap();
          }
        },
        true,
      );
    }
    const room = _t((SEASON[cur] && SEASON[cur].name) || cur),
      ch = CHAP[PUZ.chapter()],
      done = doneSet().size,
      tot = counted().length;
    let gcell = null,
      goal = '';
    try {
      goal = _t(PUZ.goal());
      gcell = QGOAL.cell;
    } catch (e) {}
    const can = gcell && gcell !== cur && typeof fastOK === 'function' && fastOK(gcell);
    recapEl.textContent = '';
    const p = document.createElement('div');
    p.className = 'p paper torn';
    recapEl.appendChild(p);
    const h = document.createElement('h2');
    h.id = 'rcpt';
    h.textContent = _t('La última vez');
    p.appendChild(h);
    const a = document.createElement('p');
    a.className = 'ago';
    a.textContent = ago(t);
    p.appendChild(a);
    const dl = document.createElement('dl');
    const row = (k, v) => {
      const dt = document.createElement('dt'),
        dd = document.createElement('dd');
      dt.textContent = _t(k);
      dd.textContent = v;
      dl.append(dt, dd);
    };
    row('Estabas en', room);
    if (ch) {
      const n = String(ch[0]).replace(/\D/g, '');
      row('Capítulo', (n ? n + ' · ' : '') + _t(ch[1]));
    }
    row('Sellos', sealCount() + '/6');
    row('Vecinos ayudados', done + '/' + tot);
    p.appendChild(dl);
    if (goal) {
      const o = document.createElement('div');
      o.className = 'obj';
      const s = document.createElement('small');
      s.textContent = _t('Objetivo');
      o.append(s, document.createTextNode(goal));
      p.appendChild(o);
    }
    const bt = document.createElement('div');
    bt.className = 'bt';
    p.appendChild(bt);
    const b1 = document.createElement('button');
    b1.className = 'pri';
    b1.textContent = _t('Seguir');
    b1.addEventListener('click', closeRecap);
    bt.appendChild(b1);
    if (can) {
      const b2 = document.createElement('button');
      b2.textContent = _t('Ir a') + ' ' + _t((SEASON[gcell] && SEASON[gcell].name) || gcell);
      b2.addEventListener('click', () => {
        closeRecap();
        fastTravel(gcell);
      });
      bt.appendChild(b2);
    }
    recapEl.hidden = false;
    Sound.sfx('card');
    setTimeout(() => b1.focus(), 40);
  }
  {
    const sg = startGame;
    startGame = function (fresh) {
      let t = 0;
      if (!fresh && !FREE) {
        try {
          const r = localStorage.getItem(SAVEK);
          t = r ? JSON.parse(r).t : 0;
        } catch (e) {}
      }
      window.RECAP = !fresh && !FREE;
      try {
        return sg.apply(this, arguments);
      } finally {
        const show = window.RECAP;
        window.RECAP = false;
        base = null;
        if (show)
          setTimeout(() => {
            if (!inTitle) showRecap(t);
          }, 450);
      }
    };
  }
  {
    const ot = openTitle;
    openTitle = function (...a) {
      closeRecap();
      return ot.apply(this, a);
    };
  }

  /* ═══ 2 · copia de la partida en un archivo ═══ */
  const today = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  function current() {
    if (FREE) {
      try {
        const r = localStorage.getItem(SAVEK);
        return r && saveOk(r) ? JSON.parse(r) : null;
      } catch (e) {
        return null;
      }
    }
    if (!PROG.F || !Object.keys(PROG.F).length) return null;
    return {
      v: SAVEV,
      t: Date.now(),
      F: PROG.F,
      bag: PROG.bag,
      cur,
      x: Number.isFinite(Pl.x) ? Pl.x : 0,
      y: Number.isFinite(Pl.y) ? Pl.y : 60,
    };
  }
  async function exportSave() {
    const s = current();
    if (!s) {
      note(_t('Todavía no hay partida que guardar'));
      return;
    }
    const data = JSON.stringify({ app: 'colmena', fmt: 1, saved: Date.now(), save: s, avatar: AVATAR }, null, 1),
      name = 'colmena-partida-' + today() + '.json';
    try {
      if (window.claude && window.claude.use) {
        const dl = await window.claude.use('downloads');
        if (dl) {
          await dl.save({ filename: name, data: new Blob([data], { type: 'application/json' }) });
          note(_t('Copia guardada'));
          return;
        }
      }
      const a = document.createElement('a');
      a.download = name;
      a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      note(_t('Copia guardada'));
    } catch (e) {
      if (!e || e.code !== 'declined') note(_t('No se pudo guardar la copia'));
    }
  }
  const picker = document.createElement('input');
  picker.type = 'file';
  picker.accept = '.json,application/json';
  picker.hidden = true;
  document.body.appendChild(picker);
  picker.addEventListener('change', () => {
    const f = picker.files && picker.files[0];
    picker.value = '';
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      let o = null;
      try {
        o = JSON.parse(String(rd.result));
      } catch (e) {}
      if (!o || o.app !== 'colmena' || !o.save || !saveOk(JSON.stringify(o.save))) {
        Sound.sfx('blocked');
        note(_t('Ese archivo no es una partida de Colmena'));
        return;
      }
      applyImport(o);
    };
    rd.onerror = () => note(_t('No se pudo leer el archivo'));
    rd.readAsText(f);
  });
  function applyImport(o) {
    if (FREE) endFree();
    narrClear();
    closeTalk();
    crossing = null;
    Pl.route = null;
    Pl.goal = null;
    const d = saveMigrate(JSON.parse(JSON.stringify(o.save)));
    d.t = Date.now();
    try {
      localStorage.setItem(SAVEK, JSON.stringify(d));
    } catch (e) {}
    if (o.avatar && typeof o.avatar === 'object') {
      Object.assign(AVATAR, o.avatar);
      try {
        localStorage.setItem('colmena-avatar', JSON.stringify(AVATAR));
      } catch (e) {}
    }
    PROG.F = d.F || {};
    PROG.bag = Array.isArray(d.bag) ? d.bag.slice(0, BAGMAX) : [];
    if (d.cur && CELLS[d.cur]) {
      cur = d.cur;
      Pl.x = Number.isFinite(d.x) ? d.x : 0;
      Pl.y = Number.isFinite(d.y) ? d.y : 60;
    } else {
      cur = 'pri';
      Pl.x = 70;
      Pl.y = 170;
    }
    for (const k in BRS) {
      const B = BRIDGES[k];
      BRS[k].ang = BRS[k].target = B && PROG.F[B.flag] ? 0 : 1.05;
      BRS[k].turning = false;
    }
    for (const k in DARK) delete DARK[k];
    for (const k in BAKED) delete BAKED[k];
    for (const k in visKey) delete visKey[k];
    for (const k in GRIDS) delete GRIDS[k];
    for (const id of ORDER) FOCUS[id] = id === cur ? 1 : 0;
    refreshVisuals();
    bakeCell(cur);
    STYLE.tag(CELLS[cur]);
    bakeBackdrop();
    camReady = false;
    updGoal();
    updHead();
    base = null;
    bcont.hidden = false;
    try {
      slotsDraw();
    } catch (e) {}
    copyDraw();
    Sound.sfx('give');
    if (inTitle) {
      note(_t('Partida cargada. Pulsa Continuar.'));
      setTimeout(() => bcont.focus(), 60);
    } else {
      setMenu(false);
      showRecap(o.saved || d.t);
    }
  }
  /* cargar encima de una partida con progreso pide confirmación */
  function askLoad(btn, restore) {
    if (hasSave() && PROG.F && (PROG.F.met || PROG.F.done) && !btn.classList.contains('sure')) {
      btn.classList.add('sure');
      btn.textContent = _t('¿Reemplazar la partida actual? Toca otra vez');
      Sound.sfx('blocked');
      clearTimeout(btn._t);
      btn._t = setTimeout(() => {
        btn.classList.remove('sure');
        btn.textContent = _t(restore);
      }, 4000);
      return;
    }
    btn.classList.remove('sure');
    btn.textContent = _t(restore);
    picker.click();
  }
  /* en el menú */
  {
    const g = document.querySelector('.pgrid'),
      ref = $('btitle');
    if (g) {
      const s = document.createElement('button');
      s.id = 'bsavec';
      s.textContent = '💾 Guardar copia';
      s.addEventListener('click', exportSave);
      const l = document.createElement('button');
      l.id = 'bloadc';
      l.textContent = '📂 Cargar copia';
      l.addEventListener('click', () => askLoad(l, '📂 Cargar copia'));
      if (ref && ref.parentNode === g) {
        g.insertBefore(s, ref);
        g.insertBefore(l, ref);
      } else g.append(s, l);
    }
  }
  /* en la portada */
  let tcopy = null;
  function copyDraw() {
    const tb = document.querySelector('.tbtns');
    if (!tb) return;
    if (!tcopy) {
      tcopy = document.createElement('div');
      tcopy.className = 'tcopy';
      tb.parentNode.insertBefore(tcopy, tb.nextSibling);
      const s = document.createElement('button');
      s.id = 'tsavec';
      s.textContent = 'Guardar copia de la partida';
      s.addEventListener('click', exportSave);
      const l = document.createElement('button');
      l.id = 'tloadc';
      l.textContent = 'Cargar una copia';
      l.addEventListener('click', () => askLoad(l, 'Cargar una copia'));
      tcopy.append(s, l);
    }
    const s = $('tsavec');
    if (s) s.hidden = !hasSave();
  }
  copyDraw();
  {
    const ot = openTitle;
    openTitle = function (...a) {
      const r = ot.apply(this, a);
      copyDraw();
      return r;
    };
  }
  {
    const ss = setSlot;
    setSlot = function (...a) {
      const r = ss.apply(this, a);
      copyDraw();
      return r;
    };
  }

  I18N([
    ['Toca para pasar', 'Tap to skip', 'Нажми, чтобы пропустить', '点击跳过'],
    ['Vecino ayudado', 'Neighbour helped', 'Сосед получил помощь', '帮助了邻居'],
    ['Ayudaste a {n}', 'You helped {n}', 'Ты помог: {n}', '你帮助了{n}'],
    ['Sello encendido', 'Seal lit', 'Печать зажжена', '封印点亮了'],
    ['Sellos {n} de 6', 'Seals: {n} of 6', 'Печатей: {n} из 6', '封印：{n}/6'],
    ['Nuevo atajo', 'New shortcut', 'Новый короткий путь', '新的近路'],
    ['La última vez', 'Last time', 'В прошлый раз', '上次'],
    ['Hace un momento', 'A moment ago', 'Только что', '刚刚'],
    ['Hace {n} minutos', '{n} minutes ago', '{n} мин. назад', '{n}分钟前'],
    ['Hace una hora', 'An hour ago', 'Час назад', '一小时前'],
    ['Hace {n} horas', '{n} hours ago', '{n} ч. назад', '{n}小时前'],
    ['Ayer', 'Yesterday', 'Вчера', '昨天'],
    ['Hace {n} días', '{n} days ago', '{n} дн. назад', '{n}天前'],
    ['Estabas en', 'You were in', 'Ты был в', '你在'],
    ['Capítulo', 'Chapter', 'Глава', '章节'],
    ['Sellos', 'Seals', 'Печати', '封印'],
    ['Vecinos ayudados', 'Neighbours helped', 'Помощь соседям', '帮助过的邻居'],
    ['Seguir', 'Continue', 'Продолжить', '继续'],
    ['Todavía no hay partida que guardar', "There's no game to save yet", 'Пока нечего сохранять', '还没有可以保存的游戏'],
    ['Copia guardada', 'Copy saved', 'Копия сохранена', '副本已保存'],
    ['No se pudo guardar la copia', "Couldn't save the copy", 'Не удалось сохранить копию', '无法保存副本'],
    [
      'Ese archivo no es una partida de Colmena',
      "That file isn't a Colmena save",
      'Этот файл не является сохранением «Улья»',
      '这个文件不是《蜂巢》的存档',
    ],
    ['No se pudo leer el archivo', "Couldn't read the file", 'Не удалось прочитать файл', '无法读取文件'],
    [
      'Partida cargada. Pulsa Continuar.',
      'Game loaded. Press Continue.',
      'Игра загружена. Нажми «Продолжить».',
      '游戏已载入。请点击“继续”。',
    ],
    [
      '¿Reemplazar la partida actual? Toca otra vez',
      'Replace the current game? Tap again',
      'Заменить текущую игру? Нажми ещё раз',
      '要替换当前游戏吗？再点一次',
    ],
    ['💾 Guardar copia', '💾 Save a copy', '💾 Сохранить копию', '💾 保存副本'],
    ['📂 Cargar copia', '📂 Load a copy', '📂 Загрузить копию', '📂 载入副本'],
    ['Guardar copia de la partida', 'Save a copy of the game', 'Сохранить копию игры', '保存游戏副本'],
    ['Cargar una copia', 'Load a copy', 'Загрузить копию', '载入副本'],
  ]);
})();

/* ── una sola voz cada vez: el tutorial espera mientras habla Amaranta o un vecino, o mientras cruzas;
   y solo pide acercarse a Brote cuando estás en su cuarto ── */
{
  const css = document.createElement('style');
  css.textContent = 'body.tut-espera .tut{visibility:hidden}';
  document.head.appendChild(css);
  if (window.R3DX)
    R3DX.push(() => document.body.classList.toggle('tut-espera', !inTitle && (narrEl.classList.contains('on') || talking || !!crossing)));
  const tt0 = tutTick;
  tutTick = function () {
    if ((PROG.F.tut || 0) === 1 && cur !== 'pri') return hideTut();
    return tt0();
  };
}
