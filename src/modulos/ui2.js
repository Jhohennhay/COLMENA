/* ══════════ INTERFAZ 2 · ocho mejoras de uso en todo el juego (oct 2026) ══════════
   1 · Avisos de uno en uno, y nunca en mitad de un diálogo.
   2 · Las marcas de lo que se puede tocar y los rótulos de las puertas aparecen al acercarte.
   3 · El tutorial enseña cada cosa cuando hace falta: la mochila al recibir algo, el farol si te atascas, el mapa al abrirse cuartos nuevos.
   4 · El cuaderno pasa de seis pestañas a tres: Encargos, Misterio y Recuerdos.
   5 · En el mapa se ve dónde estás y a dónde toca ir, y los rótulos de barrio no pisan a los de cuarto.
   6 · Con mando, las ayudas hablan de sus botones y el texto crece para leerlo desde lejos.
   7 · Cada cambio en la mochila da el mismo saltito.
   8 · Ajuste nuevo: «Textos más lentos», para leer la voz de Amaranta sin prisa.
   Nada de esto toca la historia. */
{
  const $ = (id) => document.getElementById(id);
  const css = document.createElement('style');
  css.textContent =
    '#barrios .barrio{margin-top:-30px}' +
    '.aqui{position:absolute;transform:translate(-50%,-100%);padding:4px 11px 5px;border-radius:13px;font:600 13px Fraunces,Georgia,serif;white-space:nowrap;box-shadow:0 2px 6px rgba(60,30,10,.35);pointer-events:none}' +
    '.aqui:after{content:"";position:absolute;left:50%;top:100%;margin-left:-6px;border:6px solid transparent;border-bottom:0}' +
    '.aqui.yo{background:#3A2412;color:#FBF4E3}.aqui.yo:after{border-top-color:#3A2412}' +
    '.aqui.ve{background:#F6D58A;color:#3A2412;animation:aquip 1.4s ease-in-out infinite}.aqui.ve:after{border-top-color:#F6D58A}' +
    '@keyframes aquip{50%{transform:translate(-50%,-100%) translateY(-5px)}}' +
    '.btop{display:flex;gap:6px;margin:0 0 10px}.btop button{flex:1;font:inherit;font-size:15.5px;font-weight:600;padding:9px 8px;min-height:44px;border:2px solid #E3C98E;border-radius:10px;background:#FBF4E3;color:#8A5A2E;cursor:pointer}' +
    '.btop button[aria-selected="true"]{background:#E4A844;border-color:#C98A3A;color:#3A2412}' +
    '.btabs.una{display:none}' +
    '#bagslots.salto{animation:bsalto .38s ease}@keyframes bsalto{35%{transform:translateY(-7px) scale(1.06)}}' +
    '@media (prefers-reduced-motion:reduce){.aqui.ve,#bagslots.salto{animation:none}}';
  document.head.appendChild(css);

  /* ── 1 · avisos de uno en uno ── */
  const visible = (el) => !!el && !el.hidden && getComputedStyle(el).display !== 'none';
  const ocupado = () => talking || visible($('celeb')) || visible($('achv'));
  {
    const n0 = note,
      Q = [];
    note = function (m) {
      if (!m) return;
      if (inTitle || (!ocupado() && $('note').hidden && !Q.length)) return n0(m);
      if (Q.some((q) => q.m === m)) return;
      Q.push({ m, t: performance.now() });
      if (Q.length > 4) Q.shift();
    };
    setInterval(() => {
      const now = performance.now();
      while (Q.length && now - Q[0].t > 15000) Q.shift();
      if (Q.length && !ocupado() && $('note').hidden) n0(Q.shift().m);
    }, 300);
    /* los logros esperan a que termine el diálogo o la celebración */
    const a0 = achRun;
    achRun = function () {
      if (talking || visible($('celeb'))) {
        clearTimeout(achRun.u);
        achRun.u = setTimeout(achRun, 700);
        return;
      }
      return a0();
    };
  }

  /* ── 2 · las marcas aparecen al acercarte ── */
  {
    const h0 = STYLE.hot;
    STYLE.hot = function (p, x, y, t, r) {
      if (!mapMode && Math.hypot(Pl.x - x, (Pl.y - y) * 1.2) > 210) return;
      return h0.call(STYLE, p, x, y, t, r);
    };
    const d0 = STYLE.doorLabel;
    STYLE.doorLabel = function (p, d, tg, a, open) {
      if (!mapMode && d && d.mid && d.from === cur && Math.hypot(Pl.x - d.mid[0], Pl.y - d.mid[1]) > 190) return;
      return d0.call(STYLE, p, d, tg, a, open);
    };
  }

  /* ── 3 · el tutorial, cada cosa a su tiempo ── */
  {
    let meta = '',
      desde = 0;
    TUT[2].wait = 7;
    TUT[2].when = () => PROG.bag.length > 0 || Object.keys(PROG.F.relic || {}).length > 0;
    TUT[3].wait = 8;
    TUT[3].when = () => T - desde > 45; /* el objetivo lleva un rato sin cambiar */
    TUT[4].wait = 8;
    TUT[4].when = () => !!PROG.F.done; /* ya hay cuartos nuevos a los que ir */
    const tt0 = tutTick;
    tutTick = function () {
      const g = PUZ.goal();
      if (g !== meta) {
        meta = g;
        desde = T;
      }
      const st = TUT[PROG.F.tut || 0];
      if (st && st.when && !FREE && !inTitle && !st.when()) {
        TUT.t0 = T;
        return hideTut();
      }
      return tt0();
    };
  }

  /* ── 4 · el cuaderno en tres pestañas ── */
  {
    const GR = [
      ['enc', 'Encargos', ['enc']],
      ['mis', 'Misterio', ['clues', 'pages']],
      ['rec', 'Recuerdos', ['nb', 'gal', 'ach']],
    ];
    let top = null;
    const monta = () => {
      const tabs = BOOK.querySelector('.btabs');
      if (!tabs || top) return !!top;
      top = document.createElement('div');
      top.className = 'btop';
      top.setAttribute('role', 'tablist');
      for (const [k, nombre, ts] of GR) {
        const b = document.createElement('button');
        b.dataset.g = k;
        b.dataset.es = nombre;
        b.textContent = _t(nombre);
        b.addEventListener('click', () => bookTab(ts.find((t) => tabs.querySelector(`button[data-tab="${t}"]`)) || ts[0]));
        top.appendChild(b);
      }
      tabs.parentNode.insertBefore(top, tabs);
      return true;
    };
    const bt0 = bookTab;
    bookTab = function (t) {
      bt0(t);
      if (!monta()) return;
      const tabs = BOOK.querySelector('.btabs'),
        g = GR.find((x) => x[2].includes(t)) || GR[1];
      for (const b of top.children) {
        b.setAttribute('aria-selected', b.dataset.g === g[0]);
        b.textContent = _t(b.dataset.es);
      }
      let n = 0;
      for (const b of tabs.querySelectorAll('button')) {
        const mio = g[2].includes(b.dataset.tab);
        b.hidden = !mio;
        if (mio) n++;
      }
      tabs.classList.toggle('una', n < 2);
    };
  }

  /* ── 5 · en el mapa: dónde estás y a dónde toca ir ── */
  {
    let yo = null,
      ve = null;
    const pin = (cls) => {
      const e = document.createElement('div');
      e.className = 'aqui ' + cls;
      e.hidden = true;
      $('stage').appendChild(e);
      return e;
    };
    const pon = (el, id, txt) => {
      let q = null;
      try {
        q = R3D.projW(CW[id][0], R3D.lift(id) + 430, CW[id][1]);
      } catch (e) {}
      const dpr = window.DPR || 1;
      if (!q || !Number.isFinite(q[0])) {
        el.hidden = true;
        return;
      }
      el.hidden = false;
      el.textContent = _t(txt);
      el.style.left = q[0] / dpr + 'px';
      el.style.top = q[1] / dpr + 'px';
    };
    if (window.R3DX)
      R3DX.push(() => {
        const show = mapMode && !inTitle && window.R3D && R3D.on && !crossing;
        /* en el mapa no se habla con nadie: el botón de hablar no debe taparlo */
        talkBtn.style.visibility = mapMode && !inTitle ? 'hidden' : '';
        if (!yo) {
          yo = pin('yo');
          ve = pin('ve');
        }
        if (!show) {
          yo.hidden = ve.hidden = true;
          return;
        }
        pon(yo, cur, 'Estás aquí');
        let c = null;
        try {
          PUZ.goal();
          c = (typeof QGOAL !== 'undefined' && QGOAL.cell) || (typeof goalCell === 'function' ? goalCell(PUZ.goal()) : null);
        } catch (e) {}
        if (c && c !== cur && CW[c] && !PUZ.cellLocked(c) && !(window.CHIDE && CHIDE(c))) pon(ve, c, 'Siguiente');
        else ve.hidden = true;
      });
  }

  /* ── 6 · con mando: sus botones en las ayudas y texto más grande ── */
  {
    let mando = false;
    const hay = () => {
      try {
        return [...(navigator.getGamepads ? navigator.getGamepads() : [])].some((g) => g);
      } catch (e) {
        return false;
      }
    };
    const pon = (v) => {
      if (v === mando) return;
      mando = v;
      document.body.classList.toggle('mando', v);
      if (typeof OPT !== 'undefined' && !(OPT.txt | 0)) document.body.classList.toggle('tx1', v);
    };
    addEventListener('gamepadconnected', () => pon(true));
    addEventListener('gamepaddisconnected', () => pon(hay()));
    addEventListener('pointerdown', () => pon(false), true);
    addEventListener('keydown', () => pon(false), true);
    setInterval(() => {
      if (mando) return;
      try {
        const g = [...(navigator.getGamepads ? navigator.getGamepads() : [])].find((x) => x);
        if (g && (g.buttons.some((b) => b.pressed) || g.axes.some((a) => Math.abs(a) > 0.5))) pon(true);
      } catch (e) {}
    }, 400);
    const t0 = STYLE.talkLabel,
      h0 = STYLE.dlgHint,
      a0 = STYLE.actLabel;
    STYLE.talkLabel = (n) => (mando ? `${n.name} · Ⓐ para hablar` : t0(n));
    STYLE.dlgHint = () => (mando ? 'Ⓐ para seguir · Ⓑ para cerrar' : h0());
    if (a0) STYLE.actLabel = (l) => (mando ? l : a0(l)); /* con mando, el rótulo va sin tecla: el botón Ⓐ ya se enseña al hablar */
  }

  /* ── 7 · la mochila da un saltito cada vez que cambia ── */
  {
    let antes = '';
    const el = $('bagslots');
    if (el && window.R3DX)
      R3DX.push(() => {
        const k = PROG.bag.join(',') + '|' + Object.keys(PROG.F.relic || {}).join(',');
        if (k !== antes) {
          if (antes !== '' && !inTitle) {
            el.classList.remove('salto');
            void el.offsetWidth;
            el.classList.add('salto');
          }
          antes = k;
        }
      });
  }

  /* ── 8 · «Textos más lentos»: la voz de Amaranta se queda más tiempo en pantalla ── */
  {
    const aplica = () => {
      window.LENTO = !!(typeof OPT !== 'undefined' && OPT.lento);
    };
    aplica();
    const sel = $('txts');
    const host = sel ? sel.closest('label') || sel.parentNode : null;
    if (host && host.parentNode) {
      const lab = document.createElement('label');
      lab.className = host.className;
      lab.style.cssText = 'display:flex;align-items:center;gap:10px;min-height:44px;cursor:pointer';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = 'olento';
      cb.checked = !!window.LENTO;
      const sp = document.createElement('span');
      sp.dataset.es = 'Textos más lentos';
      sp.textContent = _t('Textos más lentos');
      lab.append(cb, sp);
      host.parentNode.insertBefore(lab, host.nextSibling);
      cb.addEventListener('change', () => {
        OPT.lento = cb.checked ? 1 : 0;
        optSave();
        aplica();
      });
      const lg = $('lang');
      if (lg) lg.addEventListener('change', () => setTimeout(() => (sp.textContent = _t('Textos más lentos')), 0));
    }
  }

  I18N([
    ['Misterio', 'Mystery', 'Тайна', '谜团'],
    ['Recuerdos', 'Keepsakes', 'Воспоминания', '回忆'],
    ['Estás aquí', 'You are here', 'Ты здесь', '你在这里'],
    ['Siguiente', 'Next', 'Дальше', '下一步'],
    ['Ⓐ para seguir · Ⓑ para cerrar', 'Ⓐ to continue · Ⓑ to close', 'Ⓐ — дальше · Ⓑ — закрыть', 'Ⓐ 继续 · Ⓑ 关闭'],
    ['Textos más lentos', 'Slower text', 'Медленный текст', '文字放慢'],
  ]);
  TPLadd('{n} · Ⓐ para hablar', '{n} · Ⓐ to talk', '{n} · Ⓐ — говорить', '{n} · Ⓐ 交谈');
}
