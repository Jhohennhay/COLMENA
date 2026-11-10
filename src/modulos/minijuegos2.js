/* ══════════ MINIJUEGOS «PAPEL Y MIEL» (nov 2026) ══════════
   Los minijuegos se veían pobres (cajas planas). Este módulo solo cambia cómo se DIBUJAN:
   · Todos: fondo con luz y grano de papel, viñeta y filo dorado, onda al tocar, y al ganar
     un sello de miel con confeti de hexágonos (dura lo que tarda API.win en cerrar, 1,1 s).
   · Temporada 1, dibujados de nuevo con su cuarto detrás: books (estantería de nogal),
     cook (cocina de azulejos y olla de cobre), rhythm (colmenar al amanecer) y clocks (relojería).
     Con animación de acierto y de fallo.
   No toca reglas, dificultad, zonas de toque, `finish` ni claves: las funciones `tap` envueltas
   llaman a la original y solo miran el estado antes y después. La lógica que `rhythm` lleva
   dentro de `draw` (marcar fallos y cerrar la ronda) está copiada tal cual.
   Respeta «reducir movimiento» y el modo tranquilo (STILL): sin partículas, sin temblores,
   sin vuelos; solo cambios de color y fundidos. */
{
  I18N([
    ['Balda lista', 'Shelf done', 'Полка готова', '这一层齐了'],
    ['¡Justo!', 'Right on!', 'Точно!', '正好！'],
    ['Se escapó', 'Missed it', 'Упустил', '错过了'],
    ['En hora', 'On time', 'Время верное', '时间对了'],
  ]);
  const PI = Math.PI;
  const calm = () => typeof STILL !== 'undefined' && !!STILL;
  const c01 = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
  const eo = (u) => 1 - (1 - u) ** 3;
  const back = (u) => 1 + 2.7 * (u - 1) ** 3 + 1.7 * (u - 1) ** 2;
  const CACHE = {};

  /* ── capas fijas pintadas una vez (por resolución) ── */
  function layer(key, fn) {
    const r = (GAME && GAME.r) || 1,
      k = key + '@' + r;
    let c = CACHE[k];
    if (!c) {
      c = document.createElement('canvas');
      c.width = MW * r;
      c.height = MH * r;
      const x = c.getContext('2d');
      x.setTransform(r, 0, 0, r, 0, 0);
      fn(x);
      CACHE[k] = c;
    }
    return c;
  }
  const put = (g, c) => g.drawImage(c, 0, 0, MW, MH);
  function grain(x) {
    const R = rng('grano');
    for (let i = 0; i < 2600; i++) {
      x.fillStyle = R() < 0.5 ? `rgba(60,36,16,${0.025 + R() * 0.05})` : `rgba(255,250,235,${0.03 + R() * 0.05})`;
      const s = 0.6 + R() * 1.1;
      x.fillRect(R() * MW, R() * MH, s, s);
    }
    x.lineWidth = 0.6;
    for (let i = 0; i < 70; i++) {
      x.strokeStyle = `rgba(90,60,30,${0.03 + R() * 0.04})`;
      const px = R() * MW,
        py = R() * MH,
        a = R() * TAU,
        l = 6 + R() * 16;
      x.beginPath();
      x.moveTo(px, py);
      x.quadraticCurveTo(px + Math.cos(a + 0.6) * l * 0.5, py + Math.sin(a + 0.6) * l * 0.5, px + Math.cos(a) * l, py + Math.sin(a) * l);
      x.stroke();
    }
  }
  function vign(x) {
    const gr = x.createRadialGradient(MW / 2, MH / 2, 150, MW / 2, MH / 2, 340);
    gr.addColorStop(0, 'rgba(40,22,10,0)');
    gr.addColorStop(1, 'rgba(40,22,10,.26)');
    x.fillStyle = gr;
    x.fillRect(0, 0, MW, MH);
    rr(x, 5.5, 5.5, MW - 11, MH - 11, 7, null, 'rgba(226,190,120,.6)', 1);
    rr(x, 8.5, 8.5, MW - 17, MH - 17, 5, null, 'rgba(255,248,230,.2)', 1);
  }
  /* el fondo de papel de todos los minijuegos gana luz cálida y grano */
  const pb0 = paperBg;
  paperBg = function (g, c1, c2) {
    pb0(g, c1, c2);
    const gr = g.createRadialGradient(140, 30, 10, 140, 30, 430);
    gr.addColorStop(0, 'rgba(255,244,214,.22)');
    gr.addColorStop(1, 'rgba(255,244,214,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, MW, MH);
    put(g, layer('grano', grain));
  };

  /* ── efectos: partículas, ondas, letreros que flotan, temblor ── */
  function fx() {
    if (!GAME) return null;
    return GAME._m2 || (GAME._m2 = { p: [], rg: [], tx: [], sh: null, won: null, lt: null });
  }
  function burst(x, y, n, cols, sp = 120, life = 0.7, kind = 'dot', grav = 160) {
    const F = fx();
    if (!F || calm()) return;
    const t = API.now();
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU,
        v = sp * (0.4 + Math.random() * 0.8);
      F.p.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - sp * 0.3,
        t0: t,
        life: life * (0.7 + Math.random() * 0.6),
        c: cols[i % cols.length],
        s: 2 + Math.random() * 3,
        k: kind,
        rot: Math.random() * TAU,
        vr: (Math.random() - 0.5) * 8,
        g: grav,
      });
    }
  }
  function ring(x, y, r0, r1, dur, col, lw = 3) {
    const F = fx();
    if (F) F.rg.push({ x, y, r0, r1, dur, col, lw, t0: API.now() });
  }
  function float(x, y, s, col) {
    const F = fx();
    if (F) F.tx.push({ x, y, s, col, t0: API.now() });
  }
  function shake(amp, dur = 0.3) {
    const F = fx();
    if (F && !calm()) F.sh = { t0: API.now(), amp, dur };
  }
  function jig(t) {
    const F = fx();
    if (!F || !F.sh) return 0;
    const u = (t - F.sh.t0) / F.sh.dur;
    if (u >= 1 || u < 0) {
      F.sh = null;
      return 0;
    }
    return Math.sin(u * 38) * F.sh.amp * (1 - u);
  }
  function drawFx(g, t) {
    const F = fx();
    if (!F) return;
    const dt = F.lt == null ? 0 : Math.min(0.05, Math.max(0, t - F.lt));
    F.lt = t;
    F.p = F.p.filter((p) => t - p.t0 < p.life);
    for (const p of F.p) {
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      g.globalAlpha = c01((1 - (t - p.t0) / p.life) * 1.4);
      g.fillStyle = p.c;
      if (p.k === 'hex') {
        hexPath(g, p.x, p.y, p.s + 1.5, p.rot);
        g.fill();
        g.strokeStyle = 'rgba(143,90,23,.45)';
        g.lineWidth = 0.8;
        g.stroke();
      } else if (p.k === 'leaf') {
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.beginPath();
        g.ellipse(0, 0, p.s * 1.7, p.s * 0.75, 0, 0, TAU);
        g.fill();
        g.restore();
      } else {
        g.beginPath();
        g.arc(p.x, p.y, p.k === 'puff' ? p.s * 2.4 + (t - p.t0) * 14 : p.s, 0, TAU);
        g.fill();
      }
    }
    g.globalAlpha = 1;
    F.rg = F.rg.filter((o) => t - o.t0 < o.dur);
    for (const o of F.rg) {
      const u = c01((t - o.t0) / o.dur),
        r = calm() ? (o.r0 + o.r1) / 2 : o.r0 + (o.r1 - o.r0) * eo(u);
      g.globalAlpha = 1 - u;
      g.strokeStyle = o.col;
      g.lineWidth = o.lw;
      g.beginPath();
      g.arc(o.x, o.y, r, 0, TAU);
      g.stroke();
    }
    g.globalAlpha = 1;
    F.tx = F.tx.filter((o) => t - o.t0 < 0.95);
    for (const o of F.tx) {
      const u = (t - o.t0) / 0.95,
        y = o.y - (calm() ? 0 : eo(u) * 20);
      g.globalAlpha = c01(1.6 - u * 1.6) * c01(u * 8);
      g.font = mgFont(17, 600);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.strokeStyle = 'rgba(251,246,234,.92)';
      g.lineWidth = 5;
      g.strokeText(_t(o.s), o.x, y);
      g.fillStyle = o.col;
      g.fillText(_t(o.s), o.x, y);
    }
    g.globalAlpha = 1;
  }

  /* ── al ganar: luz, sello de miel y confeti ── */
  function seal(g, x, y, k, t) {
    const s = calm() ? 1 : back(c01(k));
    g.save();
    g.translate(x, y);
    g.globalAlpha = c01(k * 2);
    g.save();
    g.rotate(calm() ? 0 : t * 0.5);
    g.fillStyle = 'rgba(255,236,170,.45)';
    for (let i = 0; i < 12; i++) {
      g.rotate(TAU / 12);
      g.beginPath();
      g.moveTo(-5, -42);
      g.lineTo(0, -82 * s);
      g.lineTo(5, -42);
      g.fill();
    }
    g.restore();
    g.scale(s, s);
    hexPath(g, 2, 5, 40, PI / 6);
    g.fillStyle = 'rgba(60,30,10,.28)';
    g.fill();
    hexPath(g, 0, 0, 40, PI / 6);
    g.fillStyle = '#B9802A';
    g.fill();
    const gr = g.createLinearGradient(-30, -30, 30, 30);
    gr.addColorStop(0, '#FBDA8C');
    gr.addColorStop(0.55, '#E3A43E');
    gr.addColorStop(1, '#C47A2C');
    hexPath(g, 0, 0, 36, PI / 6);
    g.fillStyle = gr;
    g.fill();
    hexPath(g, 0, 0, 28, PI / 6);
    g.strokeStyle = 'rgba(255,248,225,.6)';
    g.lineWidth = 1.5;
    g.stroke();
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (const [c, w, o] of [
      ['#8F5A17', 7, 1.5],
      ['#FFF8E6', 5.5, 0],
    ]) {
      g.strokeStyle = c;
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(-13, 1 + o);
      g.lineTo(-4, 10 + o);
      g.lineTo(14, -10 + o);
      g.stroke();
    }
    g.restore();
  }
  function celebrate(g, t, d) {
    const F = fx();
    if (F.won == null) {
      F.won = t;
      if (!calm()) {
        const now = API.now();
        for (let i = 0; i < 34; i++) {
          const a = -PI / 2 + (Math.random() - 0.5) * 2.6,
            v = 220 + Math.random() * 220;
          F.p.push({
            x: 250 + (Math.random() - 0.5) * 60,
            y: 200,
            vx: Math.cos(a) * v,
            vy: Math.sin(a) * v,
            t0: now,
            life: 1 + Math.random() * 0.4,
            c: ['#E3A43E', '#F2C46E', '#FFF1B0', '#C47A2C', '#FBF6EA'][i % 5],
            s: 3 + Math.random() * 4,
            k: 'hex',
            rot: Math.random() * TAU,
            vr: (Math.random() - 0.5) * 10,
            g: 420,
          });
        }
      }
    }
    const u = t - F.won;
    const gr = g.createRadialGradient(250, 200, 10, 250, 200, 300);
    gr.addColorStop(0, `rgba(255,236,170,${0.42 * c01(u * 3)})`);
    gr.addColorStop(1, 'rgba(255,236,170,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, MW, MH);
    if (!d._m2noSeal) seal(g, 250, 200, c01(u * 3.2), t);
  }
  function over(g, t, d) {
    g.setTransform(GAME.r, 0, 0, GAME.r, 0, 0);
    g.globalAlpha = 1;
    g.shadowBlur = 0;
    g.shadowColor = 'transparent';
    g.globalCompositeOperation = 'source-over';
    put(g, layer('vin', vign));
    if (GAME.done) celebrate(g, t, d);
    drawFx(g, t);
  }

  /* ═══ La estantería de Tomo (Biblioteca) ═══ */
  const BC = ['#B8484A', '#3F7F5F', '#4A548E'],
    BD = ['#6E2427', '#1F4A37', '#262D57'],
    BL = ['#DE7D74', '#6DAE89', '#7C87C4'];
  function booksBg(x) {
    let gr = x.createLinearGradient(0, 0, 0, MH);
    gr.addColorStop(0, '#5A3920');
    gr.addColorStop(1, '#33200F');
    x.fillStyle = gr;
    x.fillRect(0, 0, MW, MH);
    for (let px = 40; px < 460; px += 60) {
      x.fillStyle = 'rgba(0,0,0,.22)';
      x.fillRect(px, 0, 1.5, MH);
      x.fillStyle = 'rgba(255,220,170,.06)';
      x.fillRect(px + 1.5, 0, 1, MH);
    }
    const R = rng('nogal');
    x.lineWidth = 1;
    for (let i = 0; i < 90; i++) {
      const px = 40 + R() * 420,
        py = R() * MH,
        l = 30 + R() * 80;
      x.strokeStyle = `rgba(${R() < 0.5 ? '0,0,0' : '255,215,160'},${0.05 + R() * 0.05})`;
      x.beginPath();
      x.moveTo(px, py);
      x.bezierCurveTo(px + 2, py + l * 0.3, px - 2, py + l * 0.6, px + 1, py + l);
      x.stroke();
    }
    for (const yb of [14, 140, 250]) {
      gr = x.createLinearGradient(0, yb, 0, yb + 28);
      gr.addColorStop(0, 'rgba(10,5,0,.5)');
      gr.addColorStop(1, 'rgba(10,5,0,0)');
      x.fillStyle = gr;
      x.fillRect(40, yb, 420, 28);
    }
    for (const [a, b] of [
      [40, 64],
      [460, 436],
    ]) {
      gr = x.createLinearGradient(a, 0, b, 0);
      gr.addColorStop(0, 'rgba(10,5,0,.4)');
      gr.addColorStop(1, 'rgba(10,5,0,0)');
      x.fillStyle = gr;
      x.fillRect(Math.min(a, b), 0, 24, MH);
    }
    for (const [x0, x1] of [
      [0, 40],
      [460, 500],
    ]) {
      gr = x.createLinearGradient(x0, 0, x1, 0);
      gr.addColorStop(0, '#6E4524');
      gr.addColorStop(0.5, '#9A6538');
      gr.addColorStop(1, '#5A361A');
      x.fillStyle = gr;
      x.fillRect(x0, 0, x1 - x0, MH);
    }
    gr = x.createLinearGradient(0, 0, 0, 14);
    gr.addColorStop(0, '#A36D3E');
    gr.addColorStop(1, '#6B4322');
    x.fillStyle = gr;
    x.fillRect(0, 0, MW, 14);
    for (const y of [120, 230, 340]) {
      rr(x, 36, y, 428, 5, 2, '#D29A5E');
      gr = x.createLinearGradient(0, y + 4, 0, y + 20);
      gr.addColorStop(0, '#B57A44');
      gr.addColorStop(1, '#7A4A26');
      x.fillStyle = gr;
      x.fillRect(36, y + 4, 428, 16);
      x.fillStyle = 'rgba(30,15,5,.55)';
      x.fillRect(36, y + 20, 428, 1.5);
      gr = x.createLinearGradient(0, y + 7, 0, y + 16);
      gr.addColorStop(0, '#F1D58E');
      gr.addColorStop(1, '#A97C33');
      rr(x, 228, y + 7, 44, 9, 1.5, gr, 'rgba(90,55,15,.7)', 1);
      x.fillStyle = 'rgba(70,40,10,.7)';
      x.fillRect(231, y + 10.5, 2, 2);
      x.fillRect(267, y + 10.5, 2, 2);
    }
    gr = x.createLinearGradient(0, 360, 0, MH);
    gr.addColorStop(0, '#4A2C15');
    gr.addColorStop(1, '#2A180A');
    x.fillStyle = gr;
    x.fillRect(0, 361, MW, 40);
    gr = x.createRadialGradient(250, -60, 20, 250, -60, 430);
    gr.addColorStop(0, 'rgba(255,214,150,.32)');
    gr.addColorStop(1, 'rgba(255,214,150,0)');
    x.fillStyle = gr;
    x.fillRect(0, 0, MW, MH);
    grain(x);
  }
  function emblem(g, x, y, c) {
    g.fillStyle = BD[c];
    if (c === 0) {
      hexPath(g, x, y, 6.5, PI / 6);
      g.fill();
    } else if (c === 1) {
      g.beginPath();
      g.ellipse(x, y, 7.5, 3.6, -0.6, 0, TAU);
      g.fill();
      g.strokeStyle = '#EFE2C4';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x - 5, y + 3.4);
      g.lineTo(x + 5, y - 3.4);
      g.stroke();
    } else {
      g.beginPath();
      g.arc(x, y, 6.5, 0, TAU);
      g.fill();
      g.fillStyle = '#EFE2C4';
      g.beginPath();
      g.arc(x + 3.2, y - 2.2, 5.4, 0, TAU);
      g.fill();
    }
  }
  function book(g, x, base, w, h, c, sel, lift) {
    const b = base - lift,
      top = b - h;
    rr(g, x + 6, base - h + 3, w - 2, h - 3, 4, 'rgba(12,6,2,.34)');
    if (lift > 1) {
      g.fillStyle = 'rgba(12,6,2,.3)';
      g.beginPath();
      g.ellipse(x + w / 2, base, w * 0.45, 3, 0, 0, TAU);
      g.fill();
    }
    const gr = g.createLinearGradient(x, 0, x + w, 0);
    gr.addColorStop(0, BD[c]);
    gr.addColorStop(0.12, BC[c]);
    gr.addColorStop(0.3, BL[c]);
    gr.addColorStop(0.55, BC[c]);
    gr.addColorStop(0.88, BD[c]);
    gr.addColorStop(1, BD[c]);
    rr(g, x, top, w, h, 4, gr);
    g.fillStyle = 'rgba(255,240,210,.2)';
    g.fillRect(x + 3, top + 2, w - 6, 2);
    for (const yy of [top + 8, top + 13, b - 12, b - 17]) {
      g.fillStyle = 'rgba(240,206,128,.88)';
      g.fillRect(x + 3, yy, w - 6, 1.6);
      g.fillStyle = 'rgba(40,20,5,.35)';
      g.fillRect(x + 3, yy + 1.6, w - 6, 0.8);
    }
    const ly = top + h / 2 - 11;
    rr(g, x + 10, ly, w - 20, 22, 2, '#EFE2C4', 'rgba(120,80,30,.6)', 1);
    emblem(g, x + w / 2, ly + 11, c);
    if (sel) {
      g.save();
      g.shadowColor = 'rgba(255,200,90,.95)';
      g.shadowBlur = 16;
      rr(g, x - 1.5, top - 1.5, w + 3, h + 3, 5, null, '#F2C46E', 3);
      g.restore();
    }
  }
  function drawBooks(g, t, st) {
    put(g, layer('bk-bg', booksBg));
    const F = fx(),
      T = calm() ? 0 : t;
    const done = st.sh.map((s) => s.every((v) => v === s[0]));
    if (!F.bk) F.bk = done.slice();
    done.forEach((d, r) => {
      if (d && !F.bk[r] && !GAME.done) {
        const y = 120 + r * 110;
        for (let i = 0; i < 5; i++) burst(70 + i * 76 + 28, y - 40, 3, ['#FFF1B0', '#F2C46E'], 70, 0.8, 'hex', -20);
        ring(250, y + 11, 6, 40, 0.6, 'rgba(255,220,140,.9)', 2);
        float(250, y - 52, 'Balda lista', '#6E3A10');
      }
    });
    F.bk = done;
    /* polvo en la luz de la lámpara */
    for (let k = 0; k < 16; k++) {
      const px = 60 + ((k * 67) % 380) + Math.sin(T * 0.3 + k) * 12,
        py = 24 + ((k * 53 + T * 6) % 330);
      g.fillStyle = `rgba(255,236,190,${0.12 + (k % 3) * 0.06})`;
      g.beginPath();
      g.arc(px, py, 1 + (k % 2) * 0.6, 0, TAU);
      g.fill();
    }
    for (let r = 0; r < 3; r++) {
      const y = 120 + r * 110;
      if (done[r]) {
        const gr = g.createLinearGradient(0, y - 96, 0, y);
        gr.addColorStop(0, 'rgba(255,210,120,0)');
        gr.addColorStop(1, `rgba(255,210,120,${0.2 + 0.06 * Math.sin(T * 3)})`);
        g.fillStyle = gr;
        g.fillRect(40, y - 96, 420, 96);
        g.save();
        g.shadowColor = 'rgba(255,214,120,.9)';
        g.shadowBlur = 10;
        rr(g, 228, y + 7, 44, 9, 1.5, '#FBE3A0', 'rgba(90,55,15,.7)', 1);
        g.restore();
      }
    }
    const sw = F.sw && !calm() ? F.sw : null,
      su = sw ? (t - sw.t0) / 0.32 : 1;
    for (let r = 0; r < 3; r++) {
      const y = 120 + r * 110;
      st.sh[r].forEach((c, i) => {
        const h = st.h[r * 5 + i],
          sel = st.sel && st.sel[0] === r && st.sel[1] === i;
        let x = 70 + i * 76,
          base = y + 2,
          lift = sel ? 10 + Math.sin(T * 8) * 2 : 0;
        if (sw && su < 1) {
          const o = sw.a[0] === r && sw.a[1] === i ? sw.b : sw.b[0] === r && sw.b[1] === i ? sw.a : null;
          if (o) {
            const e = eo(su),
              ox = 70 + o[1] * 76,
              oy = 120 + o[0] * 110 + 2;
            x = ox + (x - ox) * e;
            base = oy + (base - oy) * e;
            lift += Math.sin(su * PI) * 26;
          }
        }
        book(g, x, base, 56, h, c, sel, lift);
      });
    }
    if (GAME.done) {
      const t0 = st.wt != null ? st.wt : F.won != null ? F.won : t,
        u = calm() ? 1 : c01((t - t0) * 2.6),
        e = eo(u);
      g.fillStyle = `rgba(30,16,6,${0.38 * u})`;
      g.fillRect(0, 0, MW, MH);
      g.save();
      g.translate(250, 196 - (1 - e) * 80);
      g.rotate(-0.05 * e);
      g.globalAlpha = c01(u * 2);
      rr(g, -84, -54, 176, 120, 4, 'rgba(20,10,2,.35)');
      rr(g, -88, -60, 176, 120, 4, '#FBF4E3', '#C9A05C', 1.5);
      g.fillStyle = 'rgba(176,132,62,.25)';
      for (let yy = -18; yy < 54; yy += 12) g.fillRect(-76, yy, 152, 1);
      tx(g, 'Receta de Amaranta', 0, -38, 15);
      g.strokeStyle = 'rgba(74,50,34,.55)';
      g.lineWidth = 1.3;
      for (let k = 0; k < 4; k++) {
        const yy = -24 + k * 12,
          len = [118, 96, 124, 70][k];
        g.beginPath();
        for (let xx = 0; xx <= len; xx += 4) g.lineTo(-70 + xx, yy + Math.sin(xx * 0.45 + k) * 1.6);
        g.stroke();
      }
      hexPath(g, 60, 38, 15, PI / 6);
      g.fillStyle = '#C8842C';
      g.fill();
      hexPath(g, 60, 38, 9, PI / 6);
      g.strokeStyle = 'rgba(255,240,200,.7)';
      g.lineWidth = 1.2;
      g.stroke();
      g.restore();
    }
  }
  GAMES.books._m2noSeal = true;
  {
    const bt0 = GAMES.books.tap;
    GAMES.books.tap = function (x, y, st) {
      const s0 = st.sel ? st.sel.slice() : null,
        m0 = st.moves;
      let hit = null;
      for (let r = 0; r < 3; r++) {
        const yb = 120 + r * 110;
        for (let i = 0; i < 5; i++) {
          const h = st.h[r * 5 + i],
            bx = 70 + i * 76;
          if (x > bx && x < bx + 56 && y > yb - h - 12 && y < yb) hit = [r, i];
        }
      }
      bt0.call(this, x, y, st);
      const F = fx();
      if (!F || !hit) return;
      if (st.moves > m0 && s0) {
        F.sw = { a: s0, b: hit, t0: API.now() };
        for (const [r, i] of [s0, hit]) burst(70 + i * 76 + 28, 120 + r * 110, 5, ['rgba(255,236,200,.7)'], 40, 0.5, 'dot', -30);
      }
    };
  }

  /* ═══ La cena de Amaranta (La Última Cena) ═══ */
  const SOUP = ['#7CC0CF', '#7CC0CF', '#F0B040', '#C9B05A', '#E4A844'];
  function cookBg(x) {
    let gr = x.createLinearGradient(0, 0, 0, 290);
    gr.addColorStop(0, '#F5EAD3');
    gr.addColorStop(1, '#E4CFA6');
    x.fillStyle = gr;
    x.fillRect(0, 0, MW, 290);
    const R = rng('azulejo');
    for (let ty = 0; ty < 290; ty += 36)
      for (let tx2 = (ty / 36) % 2 ? -18 : 0; tx2 < MW; tx2 += 36) {
        x.fillStyle = 'rgba(255,255,255,.28)';
        x.fillRect(tx2 + 2, ty + 2, 32, 3);
        x.fillRect(tx2 + 2, ty + 2, 3, 32);
        x.fillStyle = 'rgba(120,80,30,.08)';
        x.fillRect(tx2 + 2, ty + 31, 32, 3);
        x.fillRect(tx2 + 31, ty + 2, 3, 32);
        if (R() < 0.12) {
          hexPath(x, tx2 + 18, ty + 18, 8, PI / 6);
          x.fillStyle = 'rgba(228,168,68,.22)';
          x.fill();
          x.strokeStyle = 'rgba(196,122,44,.45)';
          x.lineWidth = 1.3;
          x.stroke();
        }
        x.strokeStyle = 'rgba(160,120,70,.32)';
        x.lineWidth = 1.2;
        x.strokeRect(tx2 + 0.5, ty + 0.5, 36, 36);
      }
    gr = x.createRadialGradient(110, 40, 10, 110, 40, 330);
    gr.addColorStop(0, 'rgba(255,248,226,.5)');
    gr.addColorStop(1, 'rgba(255,248,226,0)');
    x.fillStyle = gr;
    x.fillRect(0, 0, MW, 290);
    /* repisa con tarros */
    rr(x, 214, 112, 92, 6, 2, '#9A6438');
    x.fillStyle = 'rgba(60,30,10,.25)';
    x.fillRect(216, 118, 88, 5);
    const jar = (jx, h, col, lid) => {
      rr(x, jx - 11, 112 - h, 22, h, 5, col, 'rgba(90,55,20,.5)', 1);
      rr(x, jx - 12, 108 - h, 24, 6, 2, lid);
      x.fillStyle = 'rgba(255,255,255,.35)';
      x.fillRect(jx - 7, 112 - h + 4, 3, h - 9);
    };
    jar(232, 28, '#E9B24C', '#8A5A34');
    jar(259, 22, '#F3EEE2', '#B8484A');
    rr(x, 278, 96, 20, 16, 3, '#B5643A');
    for (const [a, b] of [
      [-0.7, 0],
      [0.2, 3],
      [0.9, -2],
    ]) {
      x.fillStyle = '#5E9E5A';
      x.beginPath();
      x.ellipse(288 + b * 2, 88, 7, 3, a, 0, TAU);
      x.fill();
    }
    /* barra con cazos */
    x.strokeStyle = '#A97C33';
    x.lineWidth = 3;
    x.beginPath();
    x.moveTo(398, 34);
    x.lineTo(486, 34);
    x.stroke();
    x.strokeStyle = '#7A4A26';
    x.lineWidth = 4;
    x.lineCap = 'round';
    x.beginPath();
    x.moveTo(420, 36);
    x.lineTo(420, 92);
    x.stroke();
    x.fillStyle = '#B86A3A';
    x.beginPath();
    x.ellipse(420, 100, 13, 10, 0, 0, TAU);
    x.fill();
    x.fillStyle = 'rgba(255,230,200,.35)';
    x.beginPath();
    x.ellipse(416, 97, 5, 3, -0.4, 0, TAU);
    x.fill();
    x.strokeStyle = '#8F6424';
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(462, 36);
    x.lineTo(462, 66);
    x.stroke();
    for (const k of [-1, 0, 1]) {
      x.beginPath();
      x.ellipse(462 + k * 3, 84, 6 - Math.abs(k) * 2, 18, 0, 0, TAU);
      x.stroke();
    }
    /* encimera */
    gr = x.createLinearGradient(0, 288, 0, 352);
    gr.addColorStop(0, '#C48E58');
    gr.addColorStop(1, '#D9A86E');
    x.fillStyle = gr;
    x.fillRect(0, 288, MW, 64);
    x.fillStyle = 'rgba(70,40,15,.35)';
    x.fillRect(0, 288, MW, 2);
    x.strokeStyle = 'rgba(110,65,25,.18)';
    x.lineWidth = 1;
    for (let k = 0; k < 7; k++) {
      x.beginPath();
      x.moveTo(0, 296 + k * 8);
      x.bezierCurveTo(160, 294 + k * 8 + (k % 3), 330, 298 + k * 8, MW, 295 + k * 8);
      x.stroke();
    }
    x.fillStyle = 'rgba(255,240,210,.45)';
    x.fillRect(0, 351, MW, 1.5);
    gr = x.createLinearGradient(0, 352, 0, MH);
    gr.addColorStop(0, '#8E5C33');
    gr.addColorStop(1, '#5E3A1E');
    x.fillStyle = gr;
    x.fillRect(0, 352, MW, 48);
    gr = x.createLinearGradient(0, 352, 0, 362);
    gr.addColorStop(0, 'rgba(0,0,0,.28)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr;
    x.fillRect(0, 352, MW, 10);
    x.fillStyle = 'rgba(30,15,5,.45)';
    for (const sx of [165, 330]) x.fillRect(sx, 356, 1.5, 44);
    for (const kx of [82, 248, 415]) {
      x.fillStyle = '#C9A050';
      x.beginPath();
      x.arc(kx, 378, 4, 0, TAU);
      x.fill();
    }
    /* trébedes de hierro */
    x.fillStyle = 'rgba(40,20,8,.35)';
    x.beginPath();
    x.ellipse(340, 344, 118, 12, 0, 0, TAU);
    x.fill();
    x.strokeStyle = '#2A2420';
    x.lineWidth = 4;
    x.beginPath();
    x.ellipse(340, 340, 100, 10, 0, 0, TAU);
    x.stroke();
    grain(x);
  }
  function recipeCard(g, st, t) {
    const F = fx(),
      bad = F.bad && !calm() ? c01(1 - (t - F.bad.t0) / 0.6) : 0;
    g.save();
    g.translate(115, 125);
    g.rotate(-0.03);
    rr(g, -81, -89, 170, 190, 6, 'rgba(60,30,10,.25)');
    rr(g, -85, -95, 170, 190, 6, '#FBF4E3', '#C9A05C', 1.5);
    g.fillStyle = 'rgba(176,132,62,.22)';
    for (let i = 0; i < 5; i++) g.fillRect(-74, -48 + i * 30, 148, 1);
    tx(g, 'Cena de las nueve', 0, -69, 15);
    st.steps.forEach((s, i) => {
      const y = 92 + i * 30 - 125,
        ok = i < st.k;
      if (i === st.k && !GAME.done) rr(g, -79, y - 12, 158, 24, 4, `rgba(227,164,62,${0.2 + bad * 0.35})`);
      tx(g, `${i + 1}. ${_t(s)}`, -63, y, 16, ok ? '#7C8F5C' : PAL.ink, 'left', ok ? 400 : 600);
      if (ok) {
        g.strokeStyle = 'rgba(196,122,44,.75)';
        g.lineWidth = 2;
        g.beginPath();
        for (let xx = -65; xx <= 58; xx += 6) g.lineTo(xx, y + Math.sin(xx * 0.4) * 1.2);
        g.stroke();
        g.strokeStyle = '#5E7A3A';
        g.lineWidth = 2.4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(63, y);
        g.lineTo(67, y + 4);
        g.lineTo(74, y - 5);
        g.stroke();
      }
    });
    g.fillStyle = 'rgba(60,20,10,.3)';
    g.beginPath();
    g.arc(1.5, -86, 6, 0, TAU);
    g.fill();
    g.fillStyle = '#B8484A';
    g.beginPath();
    g.arc(0, -88, 6, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)';
    g.beginPath();
    g.arc(-2, -90, 2, 0, TAU);
    g.fill();
    g.restore();
  }
  function ingredient(g, s, x, y, u) {
    g.save();
    g.translate(x, y);
    if (s === 'Agua') {
      for (const [dx, dy] of [
        [0, 0],
        [-12, -16],
        [11, -22],
      ]) {
        g.fillStyle = '#7CC0CF';
        g.strokeStyle = '#3E8496';
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(dx, dy - 11);
        g.quadraticCurveTo(dx + 8, dy + 1, dx, dy + 5);
        g.quadraticCurveTo(dx - 8, dy + 1, dx, dy - 11);
        g.fill();
        g.stroke();
      }
    } else if (s === 'Tarro de miel') {
      g.rotate(u * 1.4);
      rr(g, -14, -16, 28, 30, 7, '#F0B040', '#9A6428', 1.5);
      rr(g, -15, -23, 30, 8, 2, '#8A5A34');
      rr(g, -9, -6, 18, 10, 2, '#FBF4E3');
      g.fillStyle = 'rgba(255,255,255,.4)';
      g.fillRect(-10, -12, 3, 20);
    } else if (s === 'Menta') {
      for (const [a, dx, dy] of [
        [-0.6, -8, 0],
        [0.5, 8, -4],
        [1.4, 0, -14],
      ]) {
        g.save();
        g.translate(dx, dy);
        g.rotate(a + u * 3);
        g.fillStyle = '#5E9E5A';
        g.beginPath();
        g.ellipse(0, 0, 10, 4.5, 0, 0, TAU);
        g.fill();
        g.strokeStyle = '#A8D49A';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(-8, 0);
        g.lineTo(8, 0);
        g.stroke();
        g.restore();
      }
    }
    g.restore();
  }
  function drawCook(g, t, st) {
    put(g, layer('ck-bg', cookBg));
    const F = fx(),
      T = calm() ? 0 : t,
      cx = 340,
      cy = 270,
      k = Math.min(st.k, 4);
    if (F.k0 == null) F.k0 = st.k;
    if (st.k > F.k0) F.drop = { s: st.steps[st.k - 1], t0: t };
    F.k0 = st.k;
    recipeCard(g, st, t);
    /* fuego bajo la olla */
    const glow = 0.45 + (calm() ? 0 : Math.sin(T * 7) * 0.08 + Math.sin(T * 13) * 0.05);
    let gr = g.createRadialGradient(cx, 352, 6, cx, 352, 120);
    gr.addColorStop(0, `rgba(255,150,50,${glow})`);
    gr.addColorStop(1, 'rgba(255,150,50,0)');
    g.fillStyle = gr;
    g.fillRect(cx - 130, 300, 260, 70);
    for (let i = 0; i < 7; i++) {
      const fx2 = cx - 84 + i * 28,
        hh = 13 + (calm() ? 2 : Math.sin(T * 9 + i * 1.7) * 4 + Math.sin(T * 15 + i) * 2);
      gr = g.createLinearGradient(0, 362 - hh, 0, 362);
      gr.addColorStop(0, '#FFE08A');
      gr.addColorStop(1, '#E0582A');
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(fx2 - 7, 362);
      g.quadraticCurveTo(fx2 - 6, 362 - hh * 0.6, fx2, 362 - hh);
      g.quadraticCurveTo(fx2 + 6, 362 - hh * 0.6, fx2 + 7, 362);
      g.fill();
    }
    const j = jig(t),
      px = cx + j;
    /* asas */
    g.strokeStyle = '#6E3416';
    g.lineWidth = 7;
    g.lineCap = 'round';
    g.beginPath();
    g.arc(px - 98, cy + 4, 14, PI * 0.5, PI * 1.5);
    g.stroke();
    g.beginPath();
    g.arc(px + 98, cy + 4, 14, -PI * 0.5, PI * 0.5);
    g.stroke();
    /* cuerpo de cobre */
    gr = g.createLinearGradient(px - 95, 0, px + 95, 0);
    gr.addColorStop(0, '#5A2810');
    gr.addColorStop(0.2, '#B86A3A');
    gr.addColorStop(0.31, '#E9A874');
    gr.addColorStop(0.5, '#A85A2C');
    gr.addColorStop(0.85, '#6E3416');
    gr.addColorStop(1, '#4A200C');
    rr(g, px - 95, cy - 28, 190, 108, 28, gr);
    g.fillStyle = 'rgba(60,25,8,.35)';
    g.fillRect(px - 94, cy + 10, 188, 3);
    g.fillStyle = 'rgba(255,220,180,.22)';
    g.fillRect(px - 94, cy + 13, 188, 1);
    /* boca */
    g.fillStyle = '#6A3014';
    g.beginPath();
    g.ellipse(px, cy - 28, 95, 18, 0, 0, TAU);
    g.fill();
    gr = g.createRadialGradient(px - 20, cy - 32, 4, px, cy - 27, 90);
    gr.addColorStop(0, '#FFFFFF');
    gr.addColorStop(0.12, SOUP[k]);
    gr.addColorStop(1, SOUP[k]);
    g.fillStyle = gr;
    g.globalAlpha = 0.95;
    g.beginPath();
    g.ellipse(px, cy - 27, 86, 14, 0, 0, TAU);
    g.fill();
    g.globalAlpha = 1;
    g.fillStyle = 'rgba(40,15,5,.18)';
    g.beginPath();
    g.ellipse(px, cy - 31, 86, 9, 0, PI, TAU);
    g.fill();
    if (k > 0)
      for (let b = 0; b < 5; b++) {
        const u = calm() ? 0.5 : (T * 0.8 + b * 0.37) % 1,
          bx = px - 60 + ((b * 41) % 120),
          by = cy - 27 + ((b * 7) % 9) - 4;
        g.strokeStyle = `rgba(255,255,255,${0.55 * (1 - u)})`;
        g.lineWidth = 1.2;
        g.beginPath();
        g.ellipse(bx, by, 2 + u * 4, 1 + u * 1.5, 0, 0, TAU);
        g.stroke();
      }
    g.strokeStyle = '#E9A874';
    g.lineWidth = 3;
    g.beginPath();
    g.ellipse(px, cy - 28, 95, 18, 0, 0.05, PI - 0.05);
    g.stroke();
    g.strokeStyle = 'rgba(255,230,200,.35)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.ellipse(px, cy - 28, 95, 18, 0, PI + 0.1, TAU - 0.1);
    g.stroke();
    rr(g, px - 72, cy - 6, 8, 70, 4, 'rgba(255,236,210,.24)');
    /* lo que cae en la olla */
    if (F.drop) {
      const u = (t - F.drop.t0) / 0.5;
      if (u < 1 && !calm()) ingredient(g, F.drop.s, px + Math.sin(u * 3) * 6, 110 + (cy - 34 - 110) * u * u, u);
      else if (!F.drop.sp) {
        F.drop.sp = 1;
        ring(px, cy - 27, 10, 80, 0.5, 'rgba(255,255,255,.8)', 2.5);
        burst(px, cy - 34, 12, [SOUP[k], '#FFFFFF', SOUP[k]], 110, 0.6);
        if (F.drop.s === 'Menta') burst(px, cy - 34, 5, ['#5E9E5A', '#7DB873'], 90, 0.7, 'leaf');
      }
      if (u > 2) F.drop = null;
    }
    /* vapor */
    if (k > 0) {
      g.lineCap = 'round';
      for (let w = 0; w < 3; w++) {
        const bx = px - 40 + w * 40;
        for (let s = 0; s < 7; s++) {
          const y0 = cy - 44 - s * 14,
            y1 = y0 - 14,
            o0 = Math.sin(y0 * 0.05 + T * 2 + w * 2) * 8,
            o1 = Math.sin(y1 * 0.05 + T * 2 + w * 2) * 8;
          g.strokeStyle = `rgba(255,255,255,${0.42 * (1 - s / 7) * Math.min(1, k / 2)})`;
          g.lineWidth = 7 - s * 0.5;
          g.beginPath();
          g.moveTo(bx + o0, y0);
          g.lineTo(bx + o1, y1);
          g.stroke();
        }
      }
    }
    if (st.k >= 4) {
      const sx = px + 30 + Math.sin(T * 6) * 20;
      g.strokeStyle = '#7A4A26';
      g.lineWidth = 7;
      g.beginPath();
      g.moveTo(sx, cy - 30);
      g.lineTo(px + 70, cy - 110);
      g.stroke();
      g.strokeStyle = 'rgba(255,220,170,.4)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(sx - 2, cy - 32);
      g.lineTo(px + 68, cy - 110);
      g.stroke();
    }
  }
  function cookBad(label) {
    const F = fx();
    if (!F) return;
    F.bad = { t0: API.now() };
    shake(5, 0.4);
    const key = ['Sal', 'Pimienta'].find((s) => _t(s) === label);
    if (key) burst(340, 200, 14, [key === 'Sal' ? '#FFFFFF' : '#2A2420'], 90, 0.7, 'dot', 300);
    burst(340, 236, 6, ['rgba(236,228,218,.5)'], 30, 0.9, 'puff', -40);
  }

  /* ═══ El zumbido de la colmena (Colmenar) ═══ */
  function rhyBg(x) {
    let gr = x.createLinearGradient(0, 0, 0, MH);
    gr.addColorStop(0, '#FDF1CF');
    gr.addColorStop(0.55, '#F6D58C');
    gr.addColorStop(1, '#E8B25A');
    x.fillStyle = gr;
    x.fillRect(0, 0, MW, MH);
    gr = x.createRadialGradient(250, 210, 0, 250, 210, 240);
    gr.addColorStop(0, 'rgba(255,252,232,.85)');
    gr.addColorStop(1, 'rgba(255,240,190,0)');
    x.fillStyle = gr;
    x.fillRect(0, 0, MW, MH);
    const r = 22,
      w = r * Math.sqrt(3);
    x.strokeStyle = 'rgba(143,90,23,.08)';
    x.lineWidth = 1.2;
    for (let row = 0, y = 0; y < MH + r; row++, y += r * 1.5)
      for (let xx = row % 2 ? w / 2 : 0; xx < MW + w; xx += w) {
        hexPath(x, xx, y, r - 1, PI / 6);
        x.stroke();
      }
    x.fillStyle = 'rgba(200,150,80,.35)';
    x.beginPath();
    x.moveTo(0, 312);
    x.bezierCurveTo(90, 284, 170, 300, 250, 296);
    x.bezierCurveTo(340, 292, 420, 278, MW, 300);
    x.lineTo(MW, MH);
    x.lineTo(0, MH);
    x.fill();
    gr = x.createLinearGradient(0, 318, 0, MH);
    gr.addColorStop(0, 'rgba(150,120,170,.55)');
    gr.addColorStop(1, 'rgba(110,86,140,.75)');
    x.fillStyle = gr;
    x.beginPath();
    x.moveTo(0, 336);
    for (let k = 0; k <= 10; k++) x.quadraticCurveTo(k * 50 - 25, 316 + (k % 2) * 6, k * 50, 332 + (k % 3) * 3);
    x.lineTo(MW, MH);
    x.lineTo(0, MH);
    x.fill();
    const R = rng('lavanda');
    for (let i = 0; i < 160; i++) {
      const px = R() * MW,
        py = 330 + R() * 70;
      x.strokeStyle = 'rgba(110,140,80,.45)';
      x.lineWidth = 1;
      x.beginPath();
      x.moveTo(px, py + 8);
      x.lineTo(px, py);
      x.stroke();
      x.fillStyle = R() < 0.5 ? 'rgba(142,115,176,.8)' : 'rgba(196,176,220,.8)';
      x.beginPath();
      x.ellipse(px, py - 2, 1.8, 4, 0, 0, TAU);
      x.fill();
    }
    grain(x);
  }
  function bee(g, x, y, dir, T) {
    g.save();
    g.translate(x, y);
    g.scale(1.45, 1.45);
    g.fillStyle = 'rgba(60,35,10,.16)';
    g.beginPath();
    g.ellipse(2, 14, 7, 2.5, 0, 0, TAU);
    g.fill();
    g.rotate(dir);
    const gr = g.createLinearGradient(0, -5, 0, 5);
    gr.addColorStop(0, '#FFE07A');
    gr.addColorStop(0.5, '#F0B83A');
    gr.addColorStop(1, '#B9801E');
    g.fillStyle = gr;
    g.beginPath();
    g.ellipse(0, 0, 7.5, 5, 0, 0, TAU);
    g.fill();
    g.save();
    g.clip();
    g.fillStyle = '#2E1E10';
    g.fillRect(-3.8, -6, 2.2, 12);
    g.fillRect(0.6, -6, 2.2, 12);
    g.restore();
    g.fillStyle = '#2E1E10';
    g.beginPath();
    g.moveTo(-7, -1.2);
    g.lineTo(-10, 0);
    g.lineTo(-7, 1.2);
    g.fill();
    g.beginPath();
    g.arc(7, 0, 3.4, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,.7)';
    g.beginPath();
    g.arc(8, -1.2, 0.9, 0, TAU);
    g.fill();
    const fl = calm() ? 0.7 : 0.35 + Math.abs(Math.sin(T * 42)) * 0.65;
    g.fillStyle = 'rgba(255,255,255,.72)';
    g.strokeStyle = 'rgba(120,90,60,.4)';
    g.lineWidth = 0.6;
    for (const sd of [-1, 1]) {
      g.beginPath();
      g.ellipse(0, sd * (3 + 3 * fl), 5, 2.4 * fl + 0.6, sd * 0.4, 0, TAU);
      g.fill();
      g.stroke();
    }
    g.restore();
  }
  function drawRhythm(g, t, st) {
    put(g, layer('rh-bg', rhyBg));
    const cx = 250,
      cy = 210,
      F = fx(),
      T = calm() ? 0 : t;
    /* ── reglas: copia literal de la `draw` original (marcar fallos y cerrar la ronda) ── */
    for (const n of st.notes)
      if (!n.hit && !n.miss && t > n.t + 0.24) {
        n.miss = true;
      }
    if (!st.eval && st.notes.every((n) => n.hit || n.miss)) {
      st.eval = true;
      const ok = st.notes.every((n) => n.hit);
      setTimeout(() => {
        if (!GAME) return;
        if (ok) {
          st.round++;
          if (st.round >= 3) {
            this.finish(st);
            return;
          }
          API.say('¡Bien! Otra ronda, un poco más larga.');
          this.newRound(st);
        } else {
          API.say('Otra vez, con calma.');
          this.newRound(st);
        }
      }, 500);
    }
    /* ── efectos de acierto y fallo ── */
    for (const n of st.notes) {
      if (n.m2) continue;
      if (n.hit) {
        n.m2 = 1;
        ring(cx, cy, 34, 110, 0.5, 'rgba(255,214,120,.95)', 4);
        burst(cx, cy, 12, ['#F2C46E', '#FFF1B0', '#E3A43E'], 150, 0.6, 'hex', 60);
        float(cx, cy - 64, '¡Justo!', '#8F5A17');
        F.pop = t;
      } else if (n.miss) {
        n.m2 = 1;
        ring(cx, cy, 34, 54, 0.4, 'rgba(158,59,40,.8)', 3);
        shake(5, 0.35);
        float(cx, cy - 64, 'Se escapó', '#9E3B28');
      }
    }
    /* polen */
    for (let k = 0; k < 12; k++) {
      const px = (k * 89 + T * (6 + (k % 3) * 3)) % MW,
        py = 40 + ((k * 61) % 250) + Math.sin(T * 0.8 + k) * 8;
      g.fillStyle = 'rgba(255,248,220,.7)';
      g.beginPath();
      g.arc(px, py, 1.2 + (k % 2), 0, TAU);
      g.fill();
    }
    /* la entrada de la colmena */
    const j = jig(t),
      pop = F.pop != null && !calm() ? c01(1 - (t - F.pop) / 0.25) : 0,
      next = st.notes.find((n) => !n.hit && !n.miss),
      nd = next ? next.t - t : 9,
      gl = c01(1 - Math.abs(nd) / 0.3);
    g.save();
    g.translate(cx + j, cy);
    if (gl > 0) {
      const gr = g.createRadialGradient(0, 0, 10, 0, 0, 80);
      gr.addColorStop(0, `rgba(255,226,140,${0.6 * gl})`);
      gr.addColorStop(1, 'rgba(255,226,140,0)');
      g.fillStyle = gr;
      g.fillRect(-80, -80, 160, 160);
    }
    g.scale(1 + pop * 0.12, 1 + pop * 0.12);
    hexPath(g, 0, 4, 34, PI / 6);
    g.fillStyle = 'rgba(90,50,15,.32)';
    g.fill();
    hexPath(g, 0, 0, 34, PI / 6);
    g.fillStyle = '#A8691F';
    g.fill();
    let gr = g.createLinearGradient(-26, -26, 26, 26);
    gr.addColorStop(0, '#FBD98A');
    gr.addColorStop(0.55, '#E3A43E');
    gr.addColorStop(1, '#B9741E');
    hexPath(g, 0, 0, 30.5, PI / 6);
    g.fillStyle = gr;
    g.fill();
    hexPath(g, 0, 0, 22, PI / 6);
    g.fillStyle = 'rgba(255,245,215,.16)';
    g.fill();
    g.strokeStyle = 'rgba(143,90,23,.45)';
    g.lineWidth = 1.5;
    g.stroke();
    g.fillStyle = '#3A2410';
    g.beginPath();
    g.ellipse(0, 5, 12, 7.5, 0, 0, TAU);
    g.fill();
    g.strokeStyle = 'rgba(255,230,170,.7)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.ellipse(0, 5, 12, 7.5, 0, 0.2, PI - 0.2);
    g.stroke();
    g.restore();
    /* los anillos que llegan: mismo radio y mismo ritmo que antes */
    for (const n of st.notes) {
      if (n.hit || n.miss) continue;
      const d = n.t - t;
      if (d > 1.6) continue;
      const r = 34 + Math.max(0, d) * 95,
        near = Math.abs(d) < 0.24;
      g.globalAlpha = clamp(1.6 - d, 0, 1);
      hexPath(g, cx + j, cy, r, PI / 6);
      g.strokeStyle = near ? 'rgba(255,226,150,.6)' : 'rgba(255,244,214,.5)';
      g.lineWidth = near ? 10 : 7;
      g.stroke();
      g.strokeStyle = near ? '#C47A2C' : '#8A5A34';
      g.lineWidth = near ? 4 : 3;
      g.stroke();
      g.globalAlpha = 1;
    }
    /* las abejas que ya han salido */
    if (F.bn == null) {
      F.bn = st.bees;
      F.bt = [];
    }
    while (F.bn < st.bees) F.bt[F.bn++] = t;
    if (st.bees < F.bn) F.bn = st.bees;
    for (let k = 0; k < st.bees; k++) {
      const a = T * 1.4 + k * 1.9,
        r = 60 + (k % 4) * 22;
      let bx = cx + Math.cos(a) * r * 1.4,
        by = cy + Math.sin(a) * r * 0.7;
      const born = F.bt[k] != null && !calm() ? eo(c01((t - F.bt[k]) / 0.5)) : 1;
      bx = cx + (bx - cx) * born;
      by = cy + (by - cy) * born;
      if (F.won != null && !calm()) {
        const s = 1 + (t - F.won) * 2.2;
        bx = cx + (bx - cx) * s;
        by = cy + (by - cy) * s - (t - F.won) * 40;
      }
      bee(g, bx, by, Math.atan2(Math.cos(a) * r * 0.7, -Math.sin(a) * r * 1.4), T);
    }
    /* los toques de esta ronda */
    const nn = st.notes.length;
    st.notes.forEach((n, i) => {
      const x = cx + (i - (nn - 1) / 2) * 20;
      hexPath(g, x, 338, 6.5, PI / 6);
      g.fillStyle = n.hit ? '#E3A43E' : n.miss ? '#B9654A' : 'rgba(251,246,234,.75)';
      g.fill();
      g.strokeStyle = n.miss ? '#7A2A1A' : '#8F5A17';
      g.lineWidth = 1.2;
      g.stroke();
    });
    /* las tres rondas */
    rr(g, 176, 356, 148, 28, 14, 'rgba(251,246,234,.78)', 'rgba(205,167,101,.85)', 1);
    for (let i = 0; i < 3; i++) {
      hexPath(g, 200 + i * 50, 370, 10, PI / 6);
      if (i < st.round) {
        gr = g.createLinearGradient(190 + i * 50, 360, 210 + i * 50, 380);
        gr.addColorStop(0, '#FBD98A');
        gr.addColorStop(1, '#C47A2C');
        g.fillStyle = gr;
      } else g.fillStyle = 'rgba(138,90,52,.16)';
      g.fill();
      g.strokeStyle = 'rgba(143,90,23,.6)';
      g.lineWidth = 1;
      g.stroke();
    }
  }

  /* ═══ Las horas de la casa (Relojería) ═══ */
  function clkBg(x) {
    let gr = x.createLinearGradient(0, 0, 0, MH);
    gr.addColorStop(0, '#EEDFC0');
    gr.addColorStop(1, '#D3B98D');
    x.fillStyle = gr;
    x.fillRect(0, 0, MW, MH);
    for (let xx = 0; xx < MW; xx += 22) {
      x.fillStyle = 'rgba(255,250,235,.14)';
      x.fillRect(xx, 0, 11, MH);
    }
    x.fillStyle = 'rgba(176,120,50,.13)';
    for (let yy = 22, r = 0; yy < 380; yy += 44, r++)
      for (let xx = r % 2 ? 22 : 0; xx < MW + 22; xx += 44) {
        x.beginPath();
        x.moveTo(xx, yy - 6);
        x.lineTo(xx + 4, yy);
        x.lineTo(xx, yy + 6);
        x.lineTo(xx - 4, yy);
        x.fill();
      }
    gr = x.createLinearGradient(0, 0, 0, 24);
    gr.addColorStop(0, 'rgba(60,30,10,.18)');
    gr.addColorStop(1, 'rgba(60,30,10,0)');
    x.fillStyle = gr;
    x.fillRect(0, 0, MW, 24);
    gr = x.createLinearGradient(0, 376, 0, MH);
    gr.addColorStop(0, '#7A4A26');
    gr.addColorStop(1, '#4E2E14');
    x.fillStyle = gr;
    x.fillRect(0, 376, MW, 24);
    x.fillStyle = '#A36D3E';
    x.fillRect(0, 374, MW, 3);
    x.fillStyle = 'rgba(255,230,190,.35)';
    x.fillRect(0, 374, MW, 1);
    gr = x.createRadialGradient(250, 40, 10, 250, 40, 380);
    gr.addColorStop(0, 'rgba(255,246,220,.38)');
    gr.addColorStop(1, 'rgba(255,246,220,0)');
    x.fillStyle = gr;
    x.fillRect(0, 0, MW, MH);
    grain(x);
  }
  function gear(g, x, y, r, n, a) {
    g.save();
    g.translate(x, y);
    g.rotate(a);
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * TAU,
        s = TAU / n;
      g.lineTo(Math.cos(a0) * r, Math.sin(a0) * r);
      g.lineTo(Math.cos(a0 + s * 0.12) * r * 1.16, Math.sin(a0 + s * 0.12) * r * 1.16);
      g.lineTo(Math.cos(a0 + s * 0.45) * r * 1.16, Math.sin(a0 + s * 0.45) * r * 1.16);
      g.lineTo(Math.cos(a0 + s * 0.57) * r, Math.sin(a0 + s * 0.57) * r);
    }
    g.closePath();
    const gr = g.createLinearGradient(-r, -r, r, r);
    gr.addColorStop(0, 'rgba(236,206,130,.75)');
    gr.addColorStop(1, 'rgba(160,112,40,.75)');
    g.fillStyle = gr;
    g.fill();
    g.strokeStyle = 'rgba(110,70,20,.5)';
    g.lineWidth = 1;
    g.stroke();
    g.strokeStyle = 'rgba(110,70,20,.45)';
    g.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(Math.cos((i * PI) / 2) * r * 0.78, Math.sin((i * PI) / 2) * r * 0.78);
      g.stroke();
    }
    g.beginPath();
    g.arc(0, 0, r * 0.78, 0, TAU);
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = '#8F6424';
    g.beginPath();
    g.arc(0, 0, 4, 0, TAU);
    g.fill();
    g.restore();
  }
  function hand(g, cx, cy, a, len, w, col) {
    g.save();
    g.translate(cx, cy);
    g.rotate(a);
    g.beginPath();
    g.moveTo(-len * 0.2, -w / 2);
    g.lineTo(len, -w * 0.2);
    g.lineTo(len + 2.5, 0);
    g.lineTo(len, w * 0.2);
    g.lineTo(-len * 0.2, w / 2);
    g.closePath();
    g.fillStyle = col;
    g.fill();
    g.restore();
  }
  function knob(g, x, y, plus, hot) {
    const s = 1 - hot * 0.15;
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    if (hot > 0) {
      g.fillStyle = `rgba(255,214,120,${0.7 * hot})`;
      g.beginPath();
      g.arc(0, 0, 15, 0, TAU);
      g.fill();
    }
    const gr = g.createLinearGradient(-8, -8, 8, 8);
    gr.addColorStop(0, '#F4DC9A');
    gr.addColorStop(1, '#A97C33');
    g.fillStyle = gr;
    g.beginPath();
    g.arc(0, 0, 8.5, 0, TAU);
    g.fill();
    g.strokeStyle = '#6E4A18';
    g.lineWidth = 1;
    g.stroke();
    g.strokeStyle = '#33221A';
    g.lineWidth = 2;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-4, 0);
    g.lineTo(4, 0);
    if (plus) {
      g.moveTo(0, -4);
      g.lineTo(0, 4);
    }
    g.stroke();
    g.restore();
  }
  /* esfera, bisel y marcas de un reloj: se pintan una vez (normal y en hora) */
  function clockFace(g, cx, cy, ok) {
    g.fillStyle = 'rgba(40,22,10,.15)';
    g.beginPath();
    g.arc(cx + 3, cy + 6, 64, 0, TAU);
    g.fill();
    g.beginPath();
    g.arc(cx + 2, cy + 4, 61, 0, TAU);
    g.fill();
    if (ok) {
      g.save();
      g.shadowColor = 'rgba(255,200,90,.95)';
      g.shadowBlur = 18;
      g.fillStyle = '#E3A43E';
      g.beginPath();
      g.arc(cx, cy, 61, 0, TAU);
      g.fill();
      g.restore();
    }
    let gr = g.createRadialGradient(cx - 20, cy - 25, 8, cx, cy, 62);
    gr.addColorStop(0, '#B07A48');
    gr.addColorStop(0.7, '#7A4A26');
    gr.addColorStop(1, '#4E2E14');
    g.fillStyle = gr;
    g.beginPath();
    g.arc(cx, cy, 60, 0, TAU);
    g.fill();
    gr = g.createLinearGradient(cx - 55, cy - 55, cx + 55, cy + 55);
    gr.addColorStop(0, '#F4DC9A');
    gr.addColorStop(0.5, '#B98A3C');
    gr.addColorStop(0.75, '#E6C77E');
    gr.addColorStop(1, '#8F6424');
    g.strokeStyle = gr;
    g.lineWidth = 4;
    g.beginPath();
    g.arc(cx, cy, 54.5, 0, TAU);
    g.stroke();
    gr = g.createRadialGradient(cx - 14, cy - 18, 4, cx, cy, 53);
    gr.addColorStop(0, ok ? '#FFF8DC' : '#FFFCF2');
    gr.addColorStop(1, ok ? '#F6D98E' : '#EDDDBA');
    g.fillStyle = gr;
    g.beginPath();
    g.arc(cx, cy, 52, 0, TAU);
    g.fill();
    g.strokeStyle = PAL.ink;
    for (let k = 0; k < 60; k++) {
      const a = (k / 60) * TAU,
        big = k % 5 === 0,
        r0 = big ? 42 : 46.5;
      g.globalAlpha = k % 15 === 0 ? 1 : big ? 0.8 : 0.4;
      g.lineWidth = big ? (k % 15 === 0 ? 3 : 2) : 1;
      g.beginPath();
      g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      g.lineTo(cx + Math.cos(a) * 49, cy + Math.sin(a) * 49);
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  function faceSprite(ok) {
    const r = (GAME && GAME.r) || 1,
      k = 'cf' + (ok ? 1 : 0) + '@' + r;
    if (!CACHE[k]) {
      const c = document.createElement('canvas');
      c.width = c.height = 160 * r;
      const x = c.getContext('2d');
      x.setTransform(r, 0, 0, r, 0, 0);
      clockFace(x, 80, 80, ok);
      CACHE[k] = c;
    }
    return CACHE[k];
  }
  function drawClocks(g, t, st) {
    put(g, layer('rl-bg', clkBg));
    const F = fx(),
      dt = F.ct == null ? 0 : Math.min(0.05, Math.max(0, t - F.ct));
    F.ct = t;
    const nok = st.ok.filter(Boolean).length,
      sp = calm() ? 0 : GAME.done ? 3 : 0.12 + nok * 0.2;
    F.ga = (F.ga || 0) + dt * sp;
    gear(g, 250, 168, 30, 11, F.ga);
    gear(g, 250 + 23, 168 + 58, 24, 9, -F.ga * (11 / 9) + 0.2);
    if (!F.dv) F.dv = st.v.slice();
    for (let i = 0; i < 4; i++) {
      const d = ((((st.v[i] - F.dv[i]) % 720) + 720 + 360) % 720) - 360;
      F.dv[i] = calm() || Math.abs(d) < 0.05 ? st.v[i] : F.dv[i] + d * Math.min(1, dt * 14);
    }
    for (let i = 0; i < 4; i++) {
      const [cx, cy] = this.pos(i),
        ok = st.ok[i];
      g.drawImage(faceSprite(ok), cx - 80, cy - 80, 160, 160);
      const v = F.dv[i],
        m = ((v % 60) + 60) % 60,
        h = v / 60,
        ha = (h / 12) * TAU - PI / 2,
        ma = (m / 60) * TAU - PI / 2;
      hand(g, cx + 1.5, cy + 2.5, ha, 26, 5, 'rgba(40,22,10,.22)');
      hand(g, cx + 1.5, cy + 2.5, ma, 40, 3.2, 'rgba(40,22,10,.22)');
      hand(g, cx, cy, ha, 26, 5, '#33221A');
      hand(g, cx, cy, ma, 40, 3.2, '#33221A');
      let gr = g.createRadialGradient(cx - 1.5, cy - 1.5, 0.5, cx, cy, 5);
      gr.addColorStop(0, '#FBE7A8');
      gr.addColorStop(1, '#9A6E26');
      g.fillStyle = gr;
      g.beginPath();
      g.arc(cx, cy, 4.8, 0, TAU);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,.5)';
      g.lineWidth = 4;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(cx, cy, 44, -2.55, -1.75);
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.22)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, cy, 38, -2.4, -1.95);
      g.stroke();
      const kn = F.kn && F.kn[i] && !calm() ? F.kn[i] : null,
        hot = kn ? c01(1 - (t - kn.t0) / 0.3) : 0;
      knob(g, cx - 60, cy, false, kn && kn.s < 0 ? hot : 0);
      knob(g, cx + 60, cy, true, kn && kn.s > 0 ? hot : 0);
      if (ok) {
        hexPath(g, cx + 42, cy - 42, 11, PI / 6);
        g.fillStyle = '#E3A43E';
        g.fill();
        g.strokeStyle = '#8F5A17';
        g.lineWidth = 1.2;
        g.stroke();
        g.strokeStyle = '#FFF8E6';
        g.lineWidth = 2.4;
        g.beginPath();
        g.moveTo(cx + 37, cy - 42);
        g.lineTo(cx + 41, cy - 38);
        g.lineTo(cx + 47, cy - 46);
        g.stroke();
      }
      /* placa de latón con el nombre */
      const lab = _t(st.lab[i]);
      g.font = mgFont(13, 600);
      const mw = g.measureText(lab).width,
        fs = mw > 150 ? (13 * 150) / mw : 13,
        pw = Math.min(170, Math.max(96, Math.min(mw, 150) + 26));
      gr = g.createLinearGradient(0, cy + 68, 0, cy + 89);
      gr.addColorStop(0, '#F1D58E');
      gr.addColorStop(1, '#B98A3C');
      rr(g, cx - pw / 2 + 1.5, cy + 70, pw, 21, 3, 'rgba(40,22,10,.25)');
      rr(g, cx - pw / 2, cy + 68, pw, 21, 3, gr, '#7A5520', 1);
      g.fillStyle = 'rgba(70,40,10,.7)';
      g.beginPath();
      g.arc(cx - pw / 2 + 6, cy + 78.5, 1.4, 0, TAU);
      g.arc(cx + pw / 2 - 6, cy + 78.5, 1.4, 0, TAU);
      g.fill();
      g.font = mgFont(fs, 600);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = 'rgba(255,240,200,.5)';
      g.fillText(lab, cx, cy + 79.5);
      g.fillStyle = '#3A2410';
      g.fillText(lab, cx, cy + 78.5);
    }
  }
  {
    const ct0 = GAMES.clocks.tap;
    GAMES.clocks.tap = function (x, y, st) {
      const was = st.ok ? st.ok.slice() : [];
      ct0.call(this, x, y, st);
      const F = fx();
      if (!F) return;
      for (let i = 0; i < 4; i++) {
        const [cx, cy] = this.pos(i);
        if (Math.hypot(x - cx, y - cy) < 62) {
          F.kn = F.kn || [];
          F.kn[i] = { s: x > cx ? 1 : -1, t0: API.now() };
          if (st.ok[i] && !was[i]) {
            ring(cx, cy, 54, 86, 0.55, 'rgba(255,214,120,.95)', 4);
            burst(cx, cy - 30, 10, ['#F2C46E', '#FFF1B0', '#E3A43E'], 120, 0.6, 'hex', 80);
            float(cx, cy - 74, 'En hora', '#8F5A17');
          }
        }
      }
    };
  }

  /* ── todos los minijuegos: dibujo nuevo (si lo hay) + capa común ── */
  const NEW = { books: drawBooks, cook: drawCook, rhythm: drawRhythm, clocks: drawClocks };
  for (const k in GAMES) {
    const d = GAMES[k],
      d0 = d.draw,
      d1 = NEW[k];
    if (!d0) continue;
    d.draw = function (g, t, st) {
      let ok = false;
      g.save();
      if (d1 && !d._m2bad) {
        try {
          d1.call(this, g, t, st);
          ok = true;
        } catch (e) {
          d._m2bad = 1;
          console.warn('[minijuegos2] ' + k, e);
        }
      }
      g.restore();
      if (!ok) d0.call(this, g, t, st);
      try {
        over(g, t, d);
      } catch (e) {}
    };
  }

  /* onda donde se toca */
  mgc.addEventListener('pointerdown', (e) => {
    if (!GAME || GAME.done || !GAME.def.tap) return;
    const b = mgc.getBoundingClientRect();
    ring(((e.clientX - b.left) / b.width) * MW, ((e.clientY - b.top) / b.height) * MH, 3, 24, 0.35, 'rgba(255,246,220,.9)', 2);
  });
  /* botones: miel si avanzas, temblor y rojo si no (cocina y cometa) */
  const STEP = { cook: (st) => st.k, kite: (st) => st.round };
  mgB.addEventListener(
    'click',
    (e) => {
      const b = e.target.closest && e.target.closest('button');
      if (!b || !GAME || GAME.done || !STEP[GAME.key]) return;
      const G = GAME,
        v0 = STEP[G.key](G.st);
      setTimeout(() => {
        if (GAME !== G) return;
        const good = G.done || STEP[G.key](G.st) !== v0;
        b.classList.remove('mg2-si', 'mg2-no', 'mg2-mov');
        void b.offsetWidth;
        b.classList.add(good ? 'mg2-si' : 'mg2-no');
        if (!good && !calm()) b.classList.add('mg2-mov');
        setTimeout(() => b.classList.remove('mg2-si', 'mg2-no', 'mg2-mov'), 650);
        if (!good && G.key === 'cook') cookBad(b.textContent);
      }, 0);
    },
    true,
  );
  /* el mensaje de abajo entra con un pequeño fundido */
  {
    const say0 = API.say;
    API.say = function (m) {
      say0(m);
      mgS.classList.remove('mg2in');
      if (calm() || !m) return;
      void mgS.offsetWidth;
      mgS.classList.add('mg2in');
    };
  }
  /* la hoja del minijuego con el estilo de la interfaz nueva */
  const css = document.createElement('style');
  css.id = 'mg2css';
  const B = 'html body.ui2';
  css.textContent = `
${B} #mgc{border:1px solid var(--u-edge);border-radius:8px;background:var(--u-paper2);box-shadow:0 0 0 4px var(--u-paper2),0 0 0 5px var(--u-line),0 10px 24px rgba(40,22,10,.22)}
${B} #mgt::before,${B} #mgt::after{content:"";display:inline-block;width:11px;height:12px;margin:0 .55em .12em;vertical-align:middle;background:var(--u-honey);
  clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}
${B} .mgd{color:var(--u-ink2)}
${B} .mgs{color:var(--u-honeyd);font-weight:500}
${B} .mgb{gap:8px}
${B} .mgb button.mg2-si{background:var(--u-honey2)!important;border-color:var(--u-honeyd)!important}
${B} .mgb button.mg2-no{background:#F6E1D8!important;border-color:var(--u-danger)!important;color:var(--u-danger)!important}
.mgb button.mg2-mov{animation:mg2no .4s ease-out}
.mgs.mg2in{animation:mg2in .35s ease-out}
@keyframes mg2no{20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
@keyframes mg2in{from{opacity:0;transform:translateY(4px)}}
@media (prefers-reduced-motion:reduce){.mgb button.mg2-mov,.mgs.mg2in{animation:none}}`;
  document.head.appendChild(css);
}
