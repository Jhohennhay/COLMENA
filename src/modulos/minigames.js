/* ══════════ MINIJUEGOS · uno por vecino ══════════
   Se abren en una hoja de papel sobre el juego. Ninguno se puede perder: si fallas,
   el vecino te da una pista y vuelves a intentarlo. */
const MGEL = document.getElementById('mg'),
  mgc = document.getElementById('mgc'),
  mgT = document.getElementById('mgt'),
  mgD = document.getElementById('mgd'),
  mgB = document.getElementById('mgb'),
  mgS = document.getElementById('mgs');
const MW = 500,
  MH = 400;
let GAME = null;
const PAL = {
  paper: '#F6EEDC',
  paper2: '#EFE2C4',
  ink: '#4A3222',
  honey: '#E4A844',
  amber: '#C47A2C',
  wood: '#B8783A',
  woodD: '#8A5A34',
  night: '#2E3561',
  night2: '#1E2448',
  glow: '#FFF1B0',
};
function mgFont(sz, w = 600) {
  return `${w} ${sz}px Fraunces,'Noto Serif','Noto Serif SC',Georgia,serif`;
}
function rr(g, x, y, w, h, r, fill, stroke, lw = 2) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
  if (fill) {
    g.fillStyle = fill;
    g.fill();
  }
  if (stroke) {
    g.strokeStyle = stroke;
    g.lineWidth = lw;
    g.stroke();
  }
}
function tx(g, t, x, y, sz, col = PAL.ink, al = 'center', w = 600) {
  g.font = mgFont(sz, w);
  g.fillStyle = col;
  g.textAlign = al;
  g.textBaseline = 'middle';
  g.fillText(_t(t), x, y);
}
function paperBg(g, c1 = PAL.paper, c2 = PAL.paper2) {
  const gr = g.createLinearGradient(0, 0, 0, MH);
  gr.addColorStop(0, c1);
  gr.addColorStop(1, c2);
  g.fillStyle = gr;
  g.fillRect(0, 0, MW, MH);
}
function starShape(g, x, y, r, col) {
  g.beginPath();
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5,
      rr2 = k % 2 ? r * 0.45 : r;
    g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2);
  }
  g.closePath();
  g.fillStyle = col;
  g.fill();
}
function hexPath(g, x, y, r, rot = 0) {
  g.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = rot + (k * Math.PI) / 3;
    g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  g.closePath();
}
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const API = {
  say: (m) => {
    mgS.textContent = _t(m);
  },
  buttons(list) {
    mgB.innerHTML = '';
    for (const b of list) {
      if (b.input) {
        const i = document.createElement('input');
        i.type = 'text';
        i.maxLength = b.max || 24;
        i.placeholder = _t(b.input);
        i.id = 'mgin';
        i.autocomplete = 'off';
        i.addEventListener('keydown', (e) => {
          e.stopPropagation();
          if (e.key === 'Enter' && b.enter) b.enter(i.value);
        });
        mgB.appendChild(i);
        continue;
      }
      const e = document.createElement('button');
      e.textContent = _t(b[0]);
      e.addEventListener('click', (ev) => {
        ev.stopPropagation();
        b[1](e);
      });
      if (b[2]) for (const k in b[2]) e.setAttribute(k, b[2][k]);
      mgB.appendChild(e);
    }
  },
  win(fn, msg) {
    if (!GAME || GAME.done) return;
    GAME.done = true;
    API.say(msg || '¡Hecho!');
    Sound.sfx('seal', 0.5);
    buzz([20, 40, 20]);
    setTimeout(() => {
      closeGame();
      fn();
    }, 1100);
  },
  now: () => (GAME ? performance.now() / 1000 - GAME.t0 : 0),
};
function openGame(key) {
  const def = GAMES[key];
  if (!def) return;
  narrClear();
  GAME = { key, def, st: {}, t0: performance.now() / 1000, done: false };
  mgT.textContent = _t(def.title);
  mgD.textContent = _t(def.desc);
  mgS.textContent = '';
  mgB.innerHTML = '';
  MGEL.hidden = false;
  const r = Math.min(3, DPR || 1);
  mgc.width = MW * r;
  mgc.height = MH * r;
  GAME.r = r;
  def.init(GAME.st);
  requestAnimationFrame(mgLoop);
  Sound.sfx('card');
  setTimeout(() => {
    const b = mgB.querySelector('button,input');
    if (b && !COARSE) b.focus({ preventScroll: true });
    else document.getElementById('mgq').focus({ preventScroll: true });
  }, 80);
}
function closeGame() {
  MGEL.hidden = true;
  GAME = null;
}
function mgLoop() {
  if (!GAME || MGEL.hidden) return;
  const g = mgc.getContext('2d');
  g.setTransform(GAME.r, 0, 0, GAME.r, 0, 0);
  try {
    GAME.def.draw(g, API.now(), GAME.st);
  } catch (e) {
    console.error(e);
  }
  requestAnimationFrame(mgLoop);
}
mgc.addEventListener('pointerdown', (e) => {
  if (!GAME || GAME.done || !GAME.def.tap) return;
  const b = mgc.getBoundingClientRect();
  GAME.def.tap(((e.clientX - b.left) / b.width) * MW, ((e.clientY - b.top) / b.height) * MH, GAME.st);
});
document.getElementById('mgq').addEventListener('click', () => {
  closeGame();
  note('Puedes volver cuando quieras: habla otra vez con quien te lo pidió.');
});
document.getElementById('mgh').addEventListener('click', () => {
  if (GAME) API.say(GAME.def.hint || HINT2[cur] || '');
});
addEventListener(
  'keydown',
  (e) => {
    if (MGEL.hidden || !GAME) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeGame();
      return;
    }
    if (
      (e.key === ' ' || e.key === 'e' || e.key === 'E' || e.key === 'Enter') &&
      GAME.def.key &&
      document.activeElement.tagName !== 'INPUT'
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
      GAME.def.key(GAME.st);
    }
  },
  true,
);
{
  const i0 = interact;
  interact = function () {
    if (!MGEL.hidden || !endEl.hidden) return;
    i0();
  };
}
/* guardar lo que no cabe en la mochila: el vecino te lo da en la próxima visita */
function giveOr(id, item) {
  if (bagHas(item)) return true;
  if (!bagFull()) {
    bagGive(item);
    return true;
  }
  const F = QF();
  F.pend = F.pend || {};
  F.pend[id] = (F.pend[id] || []).concat(item);
  note(`No te cabe ${ITEM_NAME[item]}: ${NPCN[id]} te lo guarda.`);
  return false;
}
{
  const d1 = PUZ.dialog;
  PUZ.dialog = function (id) {
    const F = QF();
    if (F.pend && F.pend[id] && F.pend[id].length && !bagFull()) {
      const it = F.pend[id][0];
      return {
        lines: [`Toma, te lo guardé: ${ITEM_NAME[it]}.`],
        ex: ['smile'],
        fx: () => {
          bagGive(it);
          F.pend[id].shift();
        },
      };
    }
    return d1(id);
  };
}

const GAMES = {
  /* ── Tomo · la estantería ── */
  books: {
    finish(st) {
      API.win(
        () =>
          winTalk(
            [
              '¡Eso es! Detrás del lomo rojo… una tarjeta con su letra.',
              'Es la receta de la cena que Miel le guardaba cada noche.',
              'Y en el margen: «Cierro la biblioteca a medianoche». Siempre cerraba a las doce.',
            ],
            ['surprised', 'happy', 'smile'],
            () => {
              giveOr('bib', 'receta');
              clue('bib');
              complete('bib');
            },
          ),
        'Algo cae detrás de los libros…',
      );
    },
    title: 'La estantería de Tomo',
    desc: 'Toca dos libros para cambiarlos de sitio. Cada balda, de un solo color.',
    hint: 'Empieza por la balda de arriba: elige un color y llévale todos sus libros.',
    init(st) {
      const cols = shuffle([...Array(5).fill(0), ...Array(5).fill(1), ...Array(5).fill(2)]);
      st.sh = [cols.slice(0, 5), cols.slice(5, 10), cols.slice(10)];
      st.h = cols.map((_, i) => 60 + ((i * 37) % 28));
      st.sel = null;
      st.moves = 0;
    },
    draw(g, t, st) {
      paperBg(g, '#EAD8B0', '#D9BF8A');
      const C3 = ['#B8484A', '#3F7F5F', '#4A548E'];
      for (let r = 0; r < 3; r++) {
        const y = 120 + r * 110;
        rr(g, 40, y, 420, 14, 3, PAL.wood);
        rr(g, 40, y + 14, 420, 6, 2, PAL.woodD);
        st.sh[r].forEach((c, i) => {
          const h = st.h[r * 5 + i],
            x = 70 + i * 76,
            sel = st.sel && st.sel[0] === r && st.sel[1] === i,
            lift = sel ? 10 + Math.sin(t * 8) * 2 : 0;
          rr(g, x, y - h - lift, 56, h, 4, C3[c], sel ? PAL.honey : 'rgba(0,0,0,.25)', sel ? 4 : 1.5);
          g.fillStyle = 'rgba(255,255,255,.35)';
          g.fillRect(x + 6, y - h - lift + 10, 44, 4);
          g.fillRect(x + 6, y - lift - 16, 44, 4);
        });
      }
      if (GAME.done) {
        g.save();
        g.globalAlpha = Math.min(1, (t - (st.wt || t)) * 2);
        rr(g, 170, 150, 160, 100, 6, '#FBF4E3', '#C9A05C');
        tx(g, 'Receta de Amaranta', 250, 185, 15);
        tx(g, '✎', 250, 220, 26, PAL.amber);
        g.restore();
      }
    },
    tap(x, y, st) {
      for (let r = 0; r < 3; r++) {
        const yb = 120 + r * 110;
        st.sh[r].forEach((c, i) => {
          const h = st.h[r * 5 + i],
            bx = 70 + i * 76;
          if (x > bx && x < bx + 56 && y > yb - h - 12 && y < yb) {
            if (!st.sel) st.sel = [r, i];
            else {
              const [r0, i0] = st.sel;
              [st.sh[r0][i0], st.sh[r][i]] = [st.sh[r][i], st.sh[r0][i0]];
              st.sel = null;
              st.moves++;
              Sound.sfx('plank', 0.4);
              if (st.sh.every((s) => s.every((v) => v === s[0])) && new Set(st.sh.map((s) => s[0])).size === 3) {
                st.wt = API.now();
                this.finish(st);
              }
            }
          }
        });
      }
    },
  },
  /* ── Miel · la receta ── */
  cook: {
    finish(st) {
      API.win(
        () =>
          winTalk(
            [
              'Huele exactamente como cuando ella llegaba tarde.',
              'Llévale esta miel tibia a Abril. Las abejas la reconocerán.',
              'Amaranta cenaba a las nueve en punto. Ni un minuto antes.',
            ],
            ['happy', 'smile', 'open'],
            () => {
              bagTake('receta');
              bagTake('miel');
              bagTake('menta');
              giveOr('coc', 'mieltibia');
              clue('coc');
              complete('coc');
            },
          ),
        '¡Listo! Huele a miel tibia.',
      );
    },
    title: 'La cena de Amaranta',
    desc: 'Sigue la tarjeta: echa cada cosa al puchero en su orden.',
    hint: 'Lee la tarjeta de arriba abajo. La sal y la pimienta no salen en ella.',
    init(st) {
      st.steps = ['Agua', 'Tarro de miel', 'Menta', 'Remover'];
      st.k = 0;
      st.bub = [];
      API.buttons(
        shuffle(['Agua', 'Tarro de miel', 'Menta', 'Sal', 'Pimienta', 'Remover']).map((n) => [
          n,
          () => {
            if (GAME.done) return;
            if (n === st.steps[st.k]) {
              st.k++;
              Sound.sfx('pick', 0.5);
              st.flash = API.now();
              if (st.k >= 4) this.finish(st);
              else API.say(['', '¡Bien! Ahora lo siguiente.', 'Eso es. Sigue.', 'Casi: falta el último paso.'][st.k]);
            } else {
              API.say('Todavía no: mira la tarjeta.');
              Sound.sfx('blocked');
            }
          },
        ]),
      );
    },
    draw(g, t, st) {
      paperBg(g, '#F3D9B0', '#E3B880');
      rr(g, 30, 30, 170, 190, 8, '#FBF4E3', '#C9A05C');
      tx(g, 'Cena de las nueve', 115, 56, 15);
      st.steps.forEach((s, i) => {
        tx(g, `${i + 1}. ${_t(s)}`, 52, 92 + i * 30, 16, i < st.k ? '#8FA070' : PAL.ink, 'left', i < st.k ? 400 : 600);
        if (i < st.k) {
          g.strokeStyle = '#8FA070';
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(50, 92 + i * 30);
          g.lineTo(180, 92 + i * 30);
          g.stroke();
        }
      });
      const cx = 340,
        cy = 270;
      g.fillStyle = '#3A2A20';
      g.beginPath();
      g.ellipse(cx, cy + 60, 110, 22, 0, 0, TAU);
      g.fill();
      rr(g, cx - 95, cy - 30, 190, 110, 30, '#5A5A66');
      g.fillStyle = ['#7CC0CF', '#7CC0CF', '#F0B040', '#C9B05A', '#E4A844'][st.k];
      g.beginPath();
      g.ellipse(cx, cy - 28, 86, 16, 0, 0, TAU);
      g.fill();
      for (let k = 0; k < st.k * 3; k++) {
        const u = (t * 0.6 + k / 9) % 1;
        g.globalAlpha = 1 - u;
        g.fillStyle = '#FFFFFF';
        g.beginPath();
        g.arc(cx - 60 + ((k * 37) % 120), cy - 40 - u * 90, 4 + u * 6, 0, TAU);
        g.fill();
        g.globalAlpha = 1;
      }
      if (st.k >= 4) {
        g.strokeStyle = '#8A5A34';
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(cx + 30 + Math.sin(t * 6) * 20, cy - 30);
        g.lineTo(cx + 70, cy - 110);
        g.stroke();
      }
    },
  },
  /* ── Abril · el zumbido ── */
  rhythm: {
    finish(st) {
      API.win(
        () =>
          winTalk(
            [
              '¡Salen! Mira cómo te rodean.',
              'Amaranta abría la colmena a las seis de la mañana. Salían con ella, todas a la vez.',
              'Péndulo querrá saberlo. Él guarda todas las horas.',
            ],
            ['surprised', 'happy', 'smile'],
            () => {
              bagTake('mieltibia');
              clue('col');
              QF().swarm = 1;
              complete('col');
            },
          ),
        '¡Todas fuera!',
      );
    },
    title: 'El zumbido de la colmena',
    desc: 'Toca (o pulsa espacio) cuando cada círculo llegue al hexágono.',
    hint: 'No te adelantes: espera a que el círculo toque el borde del hexágono.',
    init(st) {
      st.round = 0;
      st.bees = 0;
      this.newRound(st);
    },
    newRound(st) {
      const n = [3, 4, 5][st.round],
        t0 = API.now() + 1.2;
      st.notes = [...Array(n)].map((_, i) => ({ t: t0 + i * 0.8, hit: false, miss: false }));
      st.eval = false;
      API.say(`Ronda ${st.round + 1} de 3`);
    },
    key(st) {
      this.tap(0, 0, st);
    },
    tap(x, y, st) {
      const t = API.now();
      let best = null,
        bd = 0.24;
      for (const n of st.notes)
        if (!n.hit && !n.miss && Math.abs(n.t - t) < bd) {
          bd = Math.abs(n.t - t);
          best = n;
        }
      if (best) {
        best.hit = true;
        st.bees++;
        Sound.sfx('hop', 0.4);
      }
    },
    draw(g, t, st) {
      paperBg(g, '#FBE7B4', '#EFC46A');
      const cx = 250,
        cy = 210;
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
      hexPath(g, cx, cy, 34, Math.PI / 6);
      g.fillStyle = PAL.honey;
      g.fill();
      g.strokeStyle = PAL.amber;
      g.lineWidth = 4;
      g.stroke();
      for (const n of st.notes) {
        if (n.hit || n.miss) continue;
        const d = n.t - t;
        if (d > 1.6) continue;
        const r = 34 + Math.max(0, d) * 95;
        g.globalAlpha = clamp(1.6 - d, 0, 1);
        g.strokeStyle = '#8A5A34';
        g.lineWidth = 3;
        hexPath(g, cx, cy, r, Math.PI / 6);
        g.stroke();
        g.globalAlpha = 1;
      }
      for (let k = 0; k < st.bees; k++) {
        const a = t * 1.4 + k * 1.9,
          r = 60 + (k % 4) * 22;
        const bx = cx + Math.cos(a) * r * 1.4,
          by = cy + Math.sin(a) * r * 0.7;
        g.fillStyle = '#3A2A20';
        g.beginPath();
        g.ellipse(bx, by, 6, 4.5, 0, 0, TAU);
        g.fill();
        g.fillStyle = '#F5CE55';
        g.fillRect(bx - 2, by - 4, 3, 8);
        g.fillStyle = 'rgba(255,255,255,.8)';
        g.beginPath();
        g.ellipse(bx, by - 6, 4, 2.5, Math.sin(t * 40), 0, TAU);
        g.fill();
      }
      for (let i = 0; i < 3; i++) {
        hexPath(g, 200 + i * 50, 370, 10, Math.PI / 6);
        g.fillStyle = i < st.round ? PAL.honey : 'rgba(138,90,52,.25)';
        g.fill();
      }
    },
  },
  /* ── Péndulo · los relojes ── */
  clocks: {
    finish(st) {
      API.win(
        () =>
          winTalk(['Tic… tac… ¡tic, tac! Todos a la vez.', 'La casa vuelve a tener horas.'], ['surprised', 'happy'], () => {
            complete('rel');
            lightSeal(3, 'rel');
          }),
        'Los cuatro relojes echan a andar.',
      );
    },
    title: 'Las horas de la casa',
    desc: 'Toca la mitad derecha de un reloj para adelantarlo y la izquierda para atrasarlo.',
    hint: 'Miel: las nueve. Tomo: las doce. Abril: las seis. El corazón: las cuatro menos cuarto.',
    init(st) {
      st.lab = ['La cena de Miel', 'El cierre de Tomo', 'Las abejas de Abril', 'El corazón'];
      st.tg = [540, 0, 360, 225];
      st.v = st.tg.map((v) => (v + [135, 240, 405, 300][st.tg.indexOf(v)]) % 720);
      st.ok = st.v.map(() => false);
      st.said = false;
    },
    pos: (i) => [140 + (i % 2) * 220, 110 + Math.floor(i / 2) * 170],
    tap(x, y, st) {
      for (let i = 0; i < 4; i++) {
        const [cx, cy] = this.pos(i);
        if (Math.hypot(x - cx, y - cy) < 62) {
          st.v[i] = (st.v[i] + (x > cx ? 15 : -15) + 720) % 720;
          Sound.sfx('plank', 0.3);
          const was = st.ok[i];
          st.ok[i] = st.v[i] % 720 === st.tg[i] % 720;
          if (st.ok[i] && !was) {
            Sound.sfx('pick', 0.5);
            if (!st.said) {
              st.said = true;
              API.say('Las abejas zumban: esa hora es la buena.');
            }
          }
          if (st.ok.every(Boolean)) this.finish(st);
        }
      }
    },
    draw(g, t, st) {
      paperBg(g, '#EFE2C4', '#DCC39A');
      for (let i = 0; i < 4; i++) {
        const [cx, cy] = this.pos(i),
          ok = st.ok[i];
        g.fillStyle = '#8A5A34';
        g.beginPath();
        g.arc(cx, cy, 60, 0, TAU);
        g.fill();
        g.fillStyle = ok ? '#FFF1C4' : '#FBF4E3';
        g.beginPath();
        g.arc(cx, cy, 52, 0, TAU);
        g.fill();
        if (ok) {
          g.strokeStyle = PAL.honey;
          g.lineWidth = 5;
          g.beginPath();
          g.arc(cx, cy, 60, 0, TAU);
          g.stroke();
        }
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * TAU;
          g.fillStyle = PAL.ink;
          g.beginPath();
          g.arc(cx + Math.cos(a) * 44, cy + Math.sin(a) * 44, k % 3 ? 1.6 : 3, 0, TAU);
          g.fill();
        }
        const m = st.v[i] % 60,
          h = (st.v[i] / 60) % 12,
          ha = (h / 12) * TAU - Math.PI / 2,
          ma = (m / 60) * TAU - Math.PI / 2;
        g.strokeStyle = PAL.ink;
        g.lineCap = 'round';
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + Math.cos(ha) * 26, cy + Math.sin(ha) * 26);
        g.stroke();
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + Math.cos(ma) * 40, cy + Math.sin(ma) * 40);
        g.stroke();
        tx(g, '−', cx - 78, cy, 26, '#8A5A34');
        tx(g, '+', cx + 78, cy, 26, '#8A5A34');
        tx(g, st.lab[i], cx, cy + 78, 14);
      }
    },
  },
  /* ── Albor · los espejos ── */
  mirrors: {
    finish(st) {
      API.win(
        () =>
          winTalk(
            ['¡Ahí va! La luz vuelve a cada casa.', 'Guarda un poco en este frasco. Y esta silueta de faro: Telón me la pidió hace mucho.'],
            ['surprised', 'happy'],
            () => {
              giveOr('far', 'luzfaro');
              sil('faro');
              complete('far');
            },
          ),
        'La luz llega a su sitio.',
      );
    },
    title: 'El haz del faro',
    desc: 'Toca los espejos para girarlos y lleva la luz hasta la ventana marcada.',
    hint: '«/» manda la luz hacia arriba si viene de la izquierda; «\\» la manda hacia abajo.',
    L: [
      { m: [[3, 2]], s: [1], t: [3, 0], n: 'Invernadero' },
      {
        m: [
          [2, 2],
          [2, 4],
        ],
        s: [0, 0],
        t: [6, 4],
        n: 'Estación',
      },
      {
        m: [
          [1, 2],
          [1, 0],
          [5, 0],
          [5, 3],
        ],
        s: [1, 1, 0, 1],
        t: [2, 3],
        n: 'Teatro',
      },
    ],
    init(st) {
      st.lv = 0;
      this.load(st);
    },
    load(st) {
      const L = this.L[st.lv];
      st.m = L.m.map((p, i) => ({ x: p[0], y: p[1], s: L.s[i] }));
      API.say(`Luz para: ${L.n} · ${st.lv + 1}/3`);
    },
    trace(st) {
      const L = this.L[st.lv];
      let x = 0,
        y = 2,
        dx = 1,
        dy = 0;
      const pts = [[x, y]];
      for (let k = 0; k < 40; k++) {
        x += dx;
        y += dy;
        if (x < 0 || y < 0 || x > 6 || y > 4) {
          pts.push([x, y]);
          return { pts, hit: false };
        }
        pts.push([x, y]);
        if (x === L.t[0] && y === L.t[1]) return { pts, hit: true };
        const m = st.m.find((q) => q.x === x && q.y === y);
        if (m) {
          [dx, dy] = m.s === 0 ? [-dy, -dx] : [dy, dx];
        }
      }
      return { pts, hit: false };
    },
    X: (x) => 40 + x * 70,
    Y: (y) => 40 + y * 70,
    tap(x, y, st) {
      for (const m of st.m)
        if (Math.abs(x - this.X(m.x)) < 32 && Math.abs(y - this.Y(m.y)) < 32) {
          m.s = 1 - m.s;
          Sound.sfx('plank', 0.35);
          const r = this.trace(st);
          if (r.hit) {
            Sound.sfx('pick', 0.6);
            if (st.lv < 2) {
              st.lv++;
              setTimeout(() => {
                if (GAME) this.load(st);
              }, 700);
            } else this.finish(st);
          }
        }
    },
    draw(g, t, st) {
      paperBg(g, '#24304E', '#172038');
      const L = this.L[st.lv];
      for (let x = 0; x < 7; x++)
        for (let y = 0; y < 5; y++) {
          g.fillStyle = 'rgba(255,255,255,.05)';
          g.fillRect(this.X(x) - 32, this.Y(y) - 32, 64, 64);
        }
      g.fillStyle = '#F2C94C';
      g.beginPath();
      g.arc(this.X(0), this.Y(2), 22, 0, TAU);
      g.fill();
      tx(g, '✹', this.X(0), this.Y(2), 20, '#8A5A34');
      rr(g, this.X(L.t[0]) - 26, this.Y(L.t[1]) - 26, 52, 52, 8, '#FBF4E3', '#E4A844', 3);
      tx(g, '▢', this.X(L.t[0]), this.Y(L.t[1]) - 4, 20, PAL.ink);
      tx(g, L.n, this.X(L.t[0]), this.Y(L.t[1]) + 16, 9);
      const r = this.trace(st);
      g.save();
      g.strokeStyle = `rgba(255,241,176,${0.75 + 0.2 * Math.sin(t * 6)})`;
      g.lineWidth = 8;
      g.lineCap = 'round';
      g.shadowColor = '#FFE9A0';
      g.shadowBlur = 14;
      g.beginPath();
      r.pts.forEach(([x, y], i) => {
        const px = this.X(clamp(x, -0.5, 6.5)),
          py = this.Y(clamp(y, -0.5, 4.5));
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      });
      g.stroke();
      g.restore();
      for (const m of st.m) {
        const cx = this.X(m.x),
          cy = this.Y(m.y);
        g.fillStyle = '#5E6B7A';
        g.beginPath();
        g.arc(cx, cy, 26, 0, TAU);
        g.fill();
        g.strokeStyle = '#DCEFF6';
        g.lineWidth = 7;
        g.lineCap = 'round';
        g.beginPath();
        if (m.s === 0) {
          g.moveTo(cx - 18, cy + 18);
          g.lineTo(cx + 18, cy - 18);
        } else {
          g.moveTo(cx - 18, cy - 18);
          g.lineTo(cx + 18, cy + 18);
        }
        g.stroke();
      }
    },
  },
  /* ── Estela · estrellas por la ventanilla ── */
  stars: {
    finish(st) {
      API.win(
        () =>
          winTalk(
            [
              '¡Cinco! El tren nocturno vuelve a tener horario.',
              'Toma: un billete de vuelta, para ella. Y la silueta del tren para Telón.',
              'Y esto: su sombrero. Lo recogí del asiento cuando el tren volvió vacío.',
            ],
            ['laugh', 'happy', 'neutral'],
            () => {
              giveOr('tre', 'billete');
              giveOr('tre', 'sombrero');
              sil('tren');
              complete('tre');
            },
          ),
        '¡Billete listo!',
      );
    },
    title: 'El tren nocturno',
    desc: 'Toca (o pulsa espacio) cuando una estrella pase por el aro. Pica cinco.',
    hint: 'No persigas la estrella: espérala en el aro.',
    init(st) {
      st.list = [];
      st.next = API.now() + 0.8;
      st.hits = 0;
      st.miss = 0;
    },
    key(st) {
      this.tap(0, 0, st);
    },
    tap(x, y, st) {
      let best = null;
      for (const s of st.list)
        if (!s.hit && Math.abs(s.x - 250) < 34) {
          best = s;
          break;
        }
      if (best) {
        best.hit = true;
        st.hits++;
        Sound.sfx('hop', 0.5);
        API.say(`Estrellas picadas: ${st.hits}/5`);
        if (st.hits >= 5) {
          if (st.miss === 0) achieve('stars');
          this.finish(st);
        }
      } else {
        st.miss++;
        Sound.sfx('blocked', 0.4);
      }
    },
    draw(g, t, st) {
      paperBg(g, '#1E2448', '#2E3561');
      for (let k = 0; k < 40; k++) {
        const x = (k * 97 - t * 20 * (1 + (k % 3))) % MW;
        g.fillStyle = 'rgba(255,255,255,.4)';
        g.fillRect((x + MW) % MW, (k * 53) % MH, 2, 2);
      }
      if (t > st.next && !GAME.done) {
        st.list.push({ x: MW + 20, y: 200 + Math.sin(t) * 10, hit: false });
        st.next = t + 0.9 + Math.random() * 0.7;
      }
      for (const s of st.list) {
        s.x -= 170 / 60;
        const gl = s.hit ? 1 : 0.9;
        starShape(g, s.x, s.y + (s.hit ? -(MW - s.x) * 0.0 : 0), s.hit ? 12 : 16, s.hit ? '#8FA070' : '#FFE08A');
        if (!s.hit && s.x < 250 - 40 && !s.gone) {
          s.gone = true;
        }
      }
      st.list = st.list.filter((s) => s.x > -30);
      g.strokeStyle = '#F3E0B0';
      g.lineWidth = 5;
      g.beginPath();
      g.arc(250, 200, 34, 0, TAU);
      g.stroke();
      rr(g, 20, 20, MW - 40, MH - 40, 26, null, '#8A5A34', 18);
      tx(g, `${st.hits}/5`, 250, 350, 18, '#F3E0B0');
    },
  },
  /* ── Telón · el teatro de sombras ── */
  theatre: {
    finish(st) {
      API.win(
        () =>
          winTalk(
            [
              '…Y así termina. El tren se fue vacío. Ella descansó entre las flores y siguió la luz del faro hasta el corazón.',
              'Por fin la obra tiene final. ¡Aplaude, que los títeres lo agradecen!',
            ],
            ['sad', 'laugh'],
            () => {
              complete('tea');
              lightSeal(4, 'tea');
            },
          ),
        'Telón llora un poco. De alegría.',
      );
    },
    title: 'La última función',
    desc: 'Elige el orden de las tres escenas y pulsa «Representar».',
    hint: 'Estela vio salir el tren con el sombrero… pero nadie la vio a ella dentro. ¿Qué pasó después?',
    init(st) {
      st.slots = [];
      st.play = null;
      const lab = { tren: 'Tren', polilla: 'Polilla', faro: 'Faro' };
      this.btns(st, lab);
    },
    btns(st, lab) {
      API.buttons([
        ...['tren', 'polilla', 'faro'].map((k) => [
          lab[k],
          () => {
            if (st.play || st.slots.includes(k) || st.slots.length >= 3) return;
            st.slots.push(k);
            Sound.sfx('plank', 0.4);
            this.btns(st, lab);
          },
          st.slots.includes(k) ? { disabled: '' } : null,
        ]),
        [
          'Borrar',
          () => {
            st.slots = [];
            this.btns(st, lab);
          },
        ],
        [
          'Representar',
          () => {
            if (st.slots.length < 3) {
              API.say('Faltan escenas.');
              return;
            }
            st.play = { t0: API.now() };
            API.say('');
          },
        ],
      ]);
    },
    cap: {
      tren: 'El tren salió de la estación, con un sombrero en el asiento…',
      polilla: 'Una polilla descansaba entre las flores de noche, sin que nadie la mirara…',
      faro: 'La luz del faro apuntó hacia abajo, hacia el corazón…',
    },
    draw(g, t, st) {
      paperBg(g, '#3A1E24', '#240F14');
      rr(g, 60, 40, 380, 240, 6, '#F6D9A0');
      const gr = g.createRadialGradient(250, 160, 20, 250, 160, 220);
      gr.addColorStop(0, 'rgba(255,240,200,.6)');
      gr.addColorStop(1, 'rgba(160,90,40,.2)');
      g.fillStyle = gr;
      g.fillRect(60, 40, 380, 240);
      g.fillStyle = '#8A2E2E';
      g.fillRect(40, 30, 40, 270);
      g.fillRect(420, 30, 40, 270);
      for (let i = 0; i < 3; i++) {
        rr(g, 95 + i * 110, 310, 90, 60, 6, 'rgba(255,255,255,.1)', '#C9A05C');
        if (st.slots[i]) this.sil(g, st.slots[i], 140 + i * 110, 340, 0.45, '#F6D9A0');
      }
      if (st.play) {
        const u = t - st.play.t0,
          i = Math.floor(u / 2.4);
        if (i < 3) {
          const k = st.slots[i],
            a = Math.min(1, (u % 2.4) * 2);
          g.globalAlpha = a;
          this.sil(g, k, 250 + Math.sin(u * 2) * 20, 170, 1.2, '#1A0E08');
          g.globalAlpha = 1;
          tx(g, this.cap[k], 250, 265, 12.5, '#3A2412');
        } else if (!st.done) {
          st.done = true;
          const ok = st.slots.join() === 'tren,polilla,faro';
          if (ok) this.finish(st);
          else {
            const alt =
              {
                'faro,tren,polilla': '«No… si hubiera ido al corazón, no habría subido al tren.»',
                'polilla,faro,tren': '«¿Y quién iba entonces en el tren? Estela vio salir el sombrero…»',
                'polilla,tren,faro': '«Casi. Pero el tren salió antes de que ella descansara.»',
                'tren,faro,polilla': '«Casi. Después del tren, algo la hizo descansar antes de bajar.»',
                'faro,polilla,tren': '«Así se iría para siempre. Nube y Vela cuentan otra cosa.»',
              }[st.slots.join()] || '«Así no acaba.»';
            API.say('Telón: ' + alt);
            setTimeout(() => {
              if (!GAME) return;
              st.play = null;
              st.done = false;
              st.slots = [];
              this.btns(st, { tren: 'Tren', polilla: 'Polilla', faro: 'Faro' });
            }, 2600);
          }
        }
      }
    },
    sil(g, k, x, y, sc, col) {
      g.save();
      g.translate(x, y);
      g.scale(sc, sc);
      g.fillStyle = col;
      if (k === 'tren') {
        g.fillRect(-50, -22, 100, 34);
        g.fillRect(28, -44, 16, 24);
        for (const w of [-32, -8, 16, 38]) {
          g.beginPath();
          g.arc(w, 14, 9, 0, TAU);
          g.fill();
        }
      } else if (k === 'polilla') {
        for (const s of [-1, 1]) {
          g.beginPath();
          g.ellipse(s * 22, -6, 24, 16, s * 0.5, 0, TAU);
          g.fill();
          g.beginPath();
          g.ellipse(s * 14, 16, 12, 9, -s * 0.4, 0, TAU);
          g.fill();
        }
        g.fillRect(-3, -20, 6, 44);
      } else {
        g.beginPath();
        g.moveTo(-16, 40);
        g.lineTo(16, 40);
        g.lineTo(9, -30);
        g.lineTo(-9, -30);
        g.closePath();
        g.fill();
        g.fillRect(-13, -44, 26, 14);
        g.beginPath();
        g.moveTo(-15, -44);
        g.lineTo(0, -58);
        g.lineTo(15, -44);
        g.fill();
        g.globalAlpha *= 0.4;
        g.beginPath();
        g.moveTo(8, -38);
        g.lineTo(90, -60);
        g.lineTo(90, -16);
        g.closePath();
        g.fill();
      }
      g.restore();
    },
  },
  /* ── Nube · la cometa ── */
  kite: {
    finish(st) {
      API.win(
        () =>
          winTalk(
            [
              '¡Mira! Cuatro celdas señaladas en el mapa.',
              'Desde aquí arriba vi a Amaranta bajar a pie hacia el corazón. No iba en ningún tren.',
            ],
            ['surprised', 'neutral'],
            () => {
              QF().pins = st.pins;
              complete('cum');
            },
          ),
        'El viento te ha contado lo que sabe.',
      );
    },
    title: 'El mapa del viento',
    desc: 'Mira hacia dónde apunta la banderola y lanza la cometa en esa dirección.',
    hint: 'La banderola apunta hacia donde va el viento.',
    init(st) {
      st.round = 0;
      st.pins = [];
      this.wind(st);
      const D = [
        ['↖', 'NO'],
        ['↑', 'N'],
        ['↗', 'NE'],
        ['←', 'O'],
        ['·', ''],
        ['→', 'E'],
        ['↙', 'SO'],
        ['↓', 'S'],
        ['↘', 'SE'],
      ];
      API.buttons(
        D.filter((d) => d[1]).map(([a, k]) => [
          a,
          () => {
            if (GAME.done) return;
            if (k === st.w) {
              st.round++;
              st.fly = API.now();
              Sound.sfx('whistle', 0.3);
              const cand = ORDER.filter((id) => !isAwake(id) && id !== 'cor' && !st.pins.includes(id));
              st.pins.push(cand[0] || ORDER[st.round]);
              API.say(`Una celda dormida: ${SEASON[st.pins[st.pins.length - 1]].name}`);
              if (st.round >= 4) this.finish(st);
              else
                setTimeout(() => {
                  if (GAME) this.wind(st);
                }, 700);
            } else {
              API.say('El viento se ríe. Mira la banderola.');
              Sound.sfx('blocked', 0.4);
            }
          },
          { 'aria-label': k },
        ]),
      );
    },
    wind(st) {
      const K = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
      st.w = K[(Math.random() * 8) | 0];
      st.wa = ({ N: -90, NE: -45, E: 0, SE: 45, S: 90, SO: 135, O: 180, NO: -135 }[st.w] * Math.PI) / 180;
    },
    draw(g, t, st) {
      paperBg(g, '#CFE3F2', '#EEF4F8');
      for (let k = 0; k < 5; k++) {
        const x = ((k * 140 + t * 14) % 640) - 70;
        g.fillStyle = 'rgba(255,255,255,.85)';
        g.beginPath();
        g.ellipse(x, 60 + k * 40, 50, 16, 0, 0, TAU);
        g.fill();
      }
      const bx = 160,
        by = 250;
      g.strokeStyle = '#8A5A34';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(bx, by + 100);
      g.lineTo(bx, by - 60);
      g.stroke();
      const a = st.wa,
        w = Math.sin(t * 6) * 0.08;
      g.fillStyle = '#E0584A';
      g.beginPath();
      g.moveTo(bx, by - 60);
      g.lineTo(bx + Math.cos(a + w) * 60, by - 60 + Math.sin(a + w) * 60 * 0.6);
      g.lineTo(bx + Math.cos(a + 0.25) * 22, by - 60 + Math.sin(a + 0.25) * 22 * 0.6 + 10);
      g.closePath();
      g.fill();
      const fl = st.fly ? Math.min(1, (t - st.fly) * 1.4) : 0,
        kx = 340 + Math.cos(t) * 10,
        ky = 140 - fl * 40 + Math.sin(t * 1.7) * 8;
      g.strokeStyle = 'rgba(60,40,30,.5)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(300, 370);
      g.quadraticCurveTo(360, 260, kx, ky + 26);
      g.stroke();
      g.fillStyle = '#F4AFA6';
      g.beginPath();
      g.moveTo(kx, ky - 26);
      g.lineTo(kx + 20, ky);
      g.lineTo(kx, ky + 26);
      g.lineTo(kx - 20, ky);
      g.closePath();
      g.fill();
      for (let i = 0; i < 4; i++) {
        hexPath(g, 380 + (i % 2) * 50, 300 + Math.floor(i / 2) * 44, 18, 0);
        g.fillStyle = i < st.pins.length ? PAL.honey : 'rgba(138,90,52,.2)';
        g.fill();
        if (st.pins[i]) tx(g, SEASON[st.pins[i]].icon, 380 + (i % 2) * 50, 300 + Math.floor(i / 2) * 44, 13, '#FFF4D6');
      }
    },
  },
  /* ── Geoda · el cristal que late ── */
  crystals: {
    finish(st) {
      API.win(
        () =>
          winTalk(
            ['¡Ese! Late como un corazón pequeño.', 'Llévaselo a Ceniza. Con él, la forja recordará cómo arder.'],
            ['surprised', 'happy'],
            () => {
              giveOr('cue', 'cristal');
              complete('cue');
            },
          ),
        '¡Ese es!',
      );
    },
    title: 'El cristal que late',
    desc: 'Toca el cristal que brilla a la vez que el hexágono de arriba.',
    hint: 'Fíjate solo en el hexágono: cuando se enciende, ¿qué cristal se enciende con él?',
    init(st) {
      st.round = 0;
      this.newRound(st);
    },
    newRound(st) {
      const n = [4, 5, 6][st.round],
        P = 1.2;
      st.P = P;
      st.c = [...Array(n)].map((_, i) => ({ p: P * [0.62, 0.8, 1.27, 1.45, 0.9, 1.12][i], ph: Math.random() * 2 }));
      const k = (Math.random() * n) | 0;
      st.c[k] = { p: P, ph: 0 };
      st.k = k;
      API.say(`Ronda ${st.round + 1} de 3`);
    },
    pulse: (t, p, ph) => Math.max(0, Math.cos(((t + ph) / p) * TAU)) ** 6,
    tap(x, y, st) {
      const n = st.c.length;
      for (let i = 0; i < n; i++) {
        const cx = 70 + i * (360 / (n - 1 || 1)),
          cy = 250;
        if (Math.abs(x - cx) < 30 && y > 170 && y < 330) {
          if (i === st.k) {
            Sound.sfx('pick', 0.6);
            st.round++;
            if (st.round >= 3) this.finish(st);
            else {
              API.say('¡Ese! Ahora otro, entre más cristales.');
              this.newRound(st);
            }
          } else {
            API.say('Ese late a su aire.');
            Sound.sfx('blocked', 0.4);
          }
        }
      }
    },
    draw(g, t, st) {
      paperBg(g, '#2A2440', '#1A1628');
      const hb = this.pulse(t, st.P, 0);
      hexPath(g, 250, 70, 30 + hb * 6, Math.PI / 6);
      g.fillStyle = `rgba(255,196,110,${0.3 + hb * 0.7})`;
      g.fill();
      g.strokeStyle = '#FFC46A';
      g.lineWidth = 3;
      g.stroke();
      const n = st.c.length;
      st.c.forEach((c, i) => {
        const cx = 70 + i * (360 / (n - 1 || 1)),
          cy = 250,
          b = this.pulse(t, c.p, c.ph),
          col = ['#C9B8F0', '#8FD3C4', '#F4AFA6', '#DCEFF6', '#E6E0F4', '#B7E4D4'][i];
        g.save();
        g.shadowColor = col;
        g.shadowBlur = b * 30;
        g.fillStyle = col;
        g.globalAlpha = 0.45 + b * 0.55;
        g.beginPath();
        g.moveTo(cx, cy - 70);
        g.lineTo(cx + 26, cy - 20);
        g.lineTo(cx + 18, cy + 60);
        g.lineTo(cx - 18, cy + 60);
        g.lineTo(cx - 26, cy - 20);
        g.closePath();
        g.fill();
        g.restore();
      });
      for (let i = 0; i < 3; i++) {
        hexPath(g, 200 + i * 50, 375, 10, Math.PI / 6);
        g.fillStyle = i < st.round ? PAL.honey : 'rgba(255,255,255,.15)';
        g.fill();
      }
    },
  },
  /* ── Vela · la cera que habla ── */
  wax: {
    finish(st) {
      API.win(
        () =>
          winTalk(
            [
              '«Si alguien me despierta, que no sea por obligación.»',
              'Eso escribió. Llévate esta cera de sellar: Ceniza la necesitará para el molde.',
            ],
            ['sad', 'smile'],
            () => {
              giveOr('sot', 'cera');
              complete('sot');
            },
          ),
        'La frase aparece entera.',
      );
    },
    title: 'La cera que habla',
    desc: 'Calienta las placas hasta que salgan las palabras. Luego tócalas en orden.',
    hint: 'La frase empieza por «Si alguien».',
    init(st) {
      st.w = shuffle(['Si alguien', 'me despierta,', 'que no sea', 'por obligación.', 'por deber.', 'mañana,']).map((w) => ({ w, h: 0 }));
      st.seq = [];
      st.goal = ['Si alguien', 'me despierta,', 'que no sea', 'por obligación.'];
    },
    tap(x, y, st) {
      st.w.forEach((o, i) => {
        const cx = 95 + (i % 3) * 155,
          cy = 110 + Math.floor(i / 3) * 120;
        if (Math.abs(x - cx) < 70 && Math.abs(y - cy) < 45) {
          if (o.h < 1) {
            o.h = Math.min(1, o.h + 0.34);
            Sound.sfx('pick', 0.2);
            return;
          }
          if (o.w === st.goal[st.seq.length]) {
            st.seq.push(o.w);
            Sound.sfx('plank', 0.4);
            if (st.seq.length === 4) this.finish(st);
          } else if (!st.seq.includes(o.w)) {
            st.seq = [];
            API.say('No suena como ella. Empieza otra vez.');
            Sound.sfx('blocked', 0.4);
          }
        }
      });
    },
    draw(g, t, st) {
      paperBg(g, '#5A3A22', '#3A2412');
      g.fillStyle = 'rgba(255,190,90,.25)';
      g.beginPath();
      g.arc(250, -40, 260, 0, TAU);
      g.fill();
      st.w.forEach((o, i) => {
        const cx = 95 + (i % 3) * 155,
          cy = 110 + Math.floor(i / 3) * 120,
          used = st.seq.includes(o.w);
        rr(g, cx - 70, cy - 45, 140, 90, 10, used ? '#C9A05C' : '#E4A844', '#8A5A34', 3);
        g.fillStyle = `rgba(255,235,170,${o.h * 0.6})`;
        g.fillRect(cx - 66, cy - 41, 132, 82);
        if (o.h >= 1) tx(g, o.w, cx, cy, 16, used ? '#6A4A2A' : '#3A2412');
        else {
          tx(g, '~ ~ ~', cx, cy, 16, 'rgba(90,50,20,.5)');
          g.fillStyle = '#8A5A34';
          g.fillRect(cx - 40, cy + 26, 80, 6);
          g.fillStyle = '#F5A83A';
          g.fillRect(cx - 40, cy + 26, 80 * o.h, 6);
        }
      });
      tx(g, st.seq.join(' ') || '…', 250, 360, 17, '#FFF4D6');
    },
  },
  /* ── Ceniza · la forja ── */
  forge: {
    finish(st) {
      API.win(
        () =>
          winTalk(['Aquí la tienes. Pesa más de lo que parece.', 'Amaranta me pidió que la olvidara. No pude.'], ['happy', 'sad'], () => {
            bagTake('cristal');
            bagTake('cera');
            giveOr('vol', 'llave');
            complete('vol');
            lightSeal(5, 'vol');
          }),
        '¡La llave está forjada!',
      );
    },
    title: 'La forja de Ceniza',
    desc: 'Dale al fuelle hasta que el fuego esté en la franja clara. Después, golpea tres veces cuando la chispa pase por el centro.',
    hint: 'El fuelle, a golpes cortos. El martillo, sin prisa: espera a la chispa.',
    init(st) {
      st.ph = 0;
      st.heat = 20;
      st.hold = 0;
      st.hits = 0;
      st.last = API.now();
      API.buttons([
        [
          'Fuelle',
          () => {
            if (st.ph === 0) {
              st.heat = Math.min(100, st.heat + 11);
              Sound.sfx('plank', 0.25);
            }
          },
        ],
        ['Martillo', () => this.hit(st)],
      ]);
    },
    key(st) {
      if (st.ph === 0) {
        st.heat = Math.min(100, st.heat + 11);
        Sound.sfx('plank', 0.25);
      } else this.hit(st);
    },
    hit(st) {
      if (st.ph !== 1 || GAME.done) return;
      const m = Math.sin(API.now() * 2.6);
      if (Math.abs(m) < 0.18) {
        st.hits++;
        Sound.sfx('thunk', 0.6);
        buzz(20);
        API.say(`¡Clang! ${st.hits}/3`);
        if (st.hits >= 3) this.finish(st);
      } else {
        API.say('La chispa se escapó. Espera al centro.');
        Sound.sfx('blocked', 0.3);
      }
    },
    draw(g, t, st) {
      const dt = Math.min(0.1, t - st.last);
      st.last = t;
      paperBg(g, '#4A2A20', '#2A1410');
      if (st.ph === 0) {
        st.heat = Math.max(0, st.heat - dt * 16);
        const inb = st.heat >= 60 && st.heat <= 85;
        st.hold = inb ? st.hold + dt : Math.max(0, st.hold - dt * 0.5);
        if (st.hold >= 1.6) {
          st.ph = 1;
          API.say('¡El fuego está listo! Ahora el martillo.');
        }
      }
      const fx = 250,
        fy = 230,
        hh = st.ph === 0 ? st.heat / 100 : 1;
      for (let k = 0; k < 14; k++) {
        const a = t * 3 + k,
          r = 20 + hh * 50;
        g.fillStyle = `rgba(${240},${120 + ((k * 23) % 80)},40,${0.25 + hh * 0.35})`;
        g.beginPath();
        g.ellipse(fx + Math.sin(a) * r * 0.6, fy - hh * 40 - ((t * 60 + k * 20) % 80) * hh, 10 + hh * 12, 16 + hh * 18, 0, 0, TAU);
        g.fill();
      }
      rr(g, 160, 250, 180, 60, 8, '#5A5A66');
      if (st.ph === 0) {
        rr(g, 440, 60, 30, 280, 8, 'rgba(255,255,255,.1)', '#C9A05C');
        g.fillStyle = 'rgba(255,241,176,.35)';
        g.fillRect(442, 60 + 280 * (1 - 0.85), 26, 280 * 0.25);
        g.fillStyle = '#F5A83A';
        g.fillRect(446, 60 + 280 * (1 - st.heat / 100), 18, (280 * st.heat) / 100);
        tx(g, 'Fuego', 455, 360, 13, '#F3E0B0');
        g.fillStyle = '#8FA070';
        g.fillRect(40, 370, 120 * Math.min(1, st.hold / 1.6), 8);
      } else {
        const m = Math.sin(t * 2.6),
          x = 250 + m * 170;
        rr(g, 70, 100, 360, 26, 13, 'rgba(255,255,255,.1)', '#C9A05C');
        g.fillStyle = 'rgba(255,241,176,.4)';
        g.fillRect(250 - 30, 100, 60, 26);
        starShape(g, x, 113, 14, '#FFE08A');
        tx(g, `${st.hits}/3`, 250, 160, 18, '#F3E0B0');
        g.fillStyle = '#E4A844';
        g.fillRect(200, 270, 100, 12);
        g.beginPath();
        g.arc(190, 276, 10, 0, TAU);
        g.fill();
      }
    },
  },
  /* ── Trasto · el candado ── */
  lock: {
    finish(st) {
      API.win(() => {
        QF().boxOpen = 1;
        stateChanged();
        const d = Q.dsv();
        winTalk(d.lines, d.ex, d.fx);
      }, '¡Clic! La caja se abre.');
    },
    title: 'La caja de Trasto',
    desc: 'Cada hexágono es una celda. Ponle los puntos de su símbolo y pulsa «Abrir».',
    hint: 'Los símbolos aparecen en el suelo cuando la colmena late. El cuaderno guarda los que has visto.',
    ids: ['pri', 'inv', 'des', 'cue', 'ret', 'cum'],
    init(st) {
      st.v = [1, 1, 1, 1, 1, 1];
      API.buttons([
        [
          'Abrir',
          () => {
            const ok = this.ids.map((id, i) => st.v[i] === GLYPHS[id][2]),
              n = ok.filter(Boolean).length;
            if (n === 6) this.finish(st);
            else {
              API.say(`No se abre. ${n} de 6 están bien.`);
              Sound.sfx('blocked', 0.4);
            }
          },
        ],
      ]);
    },
    tap(x, y, st) {
      this.ids.forEach((id, i) => {
        const cx = 100 + (i % 3) * 150,
          cy = 120 + Math.floor(i / 3) * 150;
        if (Math.hypot(x - cx, y - cy) < 55) {
          st.v[i] = (st.v[i] % 6) + 1;
          Sound.sfx('plank', 0.3);
        }
      });
    },
    draw(g, t, st) {
      paperBg(g, '#8A6A4A', '#6A4A30');
      const gl = QF().glyphs || {};
      this.ids.forEach((id, i) => {
        const cx = 100 + (i % 3) * 150,
          cy = 120 + Math.floor(i / 3) * 150;
        hexPath(g, cx, cy, 55, Math.PI / 6);
        g.fillStyle = '#D9B77A';
        g.fill();
        g.strokeStyle = '#5A3A22';
        g.lineWidth = 4;
        g.stroke();
        tx(g, SEASON[id].icon, cx, cy - 30, 18, '#5A3A22');
        const n = st.v[i];
        for (let k = 0; k < n; k++) {
          const a = (k / n) * TAU - Math.PI / 2,
            r = n > 1 ? 16 : 0;
          g.fillStyle = '#3A2412';
          g.beginPath();
          g.arc(cx + Math.cos(a) * r, cy + 8 + Math.sin(a) * r, 5, 0, TAU);
          g.fill();
        }
        tx(g, SEASON[id].name, cx, cy + 68, 12, '#FBF4E3');
        if (gl[id]) tx(g, `(${gl[id]})`, cx + 40, cy - 36, 12, '#FFE6A8');
      });
    },
  },
  /* ── Pluma · la respuesta ── */
  compose: {
    finish(st) {
      API.win(
        () =>
          winTalk(
            ['Ya está. Sin firma: la firma la pone quien la lea.', 'Llévala en el corazón. Allí la leerá.'],
            ['happy', 'smile'],
            () => {
              QF().letter = this.text(st);
              complete('est');
            },
          ),
        'La carta está escrita.',
      );
    },
    title: 'La respuesta',
    desc: 'Completa la carta con las palabras que te dieron. Cualquier elección vale.',
    hint: 'No hay respuesta mala: es tu carta.',
    init(st) {
      const F = QF(),
        w = Object.values(F.words || {});
      st.opts = [...new Set([...w, 'siempre', 'la llave', 'el té'])];
      st.fill = [];
      this.btns(st);
    },
    tpl: ['Querida Amaranta: te leemos', '. Guardamos', 'para ti. Y cuando vuelvas, escribiremos juntos', '.'],
    btns(st) {
      API.buttons([
        ...st.opts.map((o) => [
          o,
          () => {
            if (st.fill.length < 3) {
              st.fill.push(o);
              Sound.sfx('page', 0.4);
              this.btns(st);
              if (st.fill.length === 3) {
                this.finish(st);
              }
            }
          },
          st.fill.includes(o) ? { disabled: '' } : null,
        ]),
        [
          'Borrar',
          () => {
            st.fill = [];
            this.btns(st);
          },
        ],
      ]);
    },
    text(st) {
      const T2 = this.tpl.map((s) => _t(s));
      return `${T2[0]} ${st.fill[0] ? _t(st.fill[0]) : '___'}${T2[1]} ${st.fill[1] ? _t(st.fill[1]) : '___'} ${T2[2]} ${st.fill[2] ? _t(st.fill[2]) : '___'}${T2[3]}`;
    },
    draw(g, t, st) {
      paperBg(g, '#F3E0B0', '#E3C98E');
      rr(g, 50, 40, 400, 300, 8, '#FBF4E3', '#C9A05C');
      g.font = mgFont(19, 400);
      g.fillStyle = PAL.ink;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      const words = this.text(st).split(' ');
      let x = 80,
        y = 80;
      for (const w of words) {
        const wd = g.measureText(w + ' ').width;
        if (x + wd > 430) {
          x = 80;
          y += 34;
        }
        g.fillStyle = w === '___' ? '#C98A42' : PAL.ink;
        g.fillText(w, x, y);
        x += wd;
      }
      tx(g, '— sin firma —', 250, 300, 14, '#8A6A4A', 'center', 400);
    },
  },
  /* ── Marco · el retrato ── */
  portrait: {
    finish(st) {
      API.win(
        () =>
          winTalk(
            ['Ya está. No es su cara: es cómo la miras tú.', 'Lo colgaré junto a los demás. Por fin está completa la sala.'],
            ['happy', 'smile'],
            () => {
              QF().portrait = { o: st.o, light: st.light };
              bagTake('sombrero');
              complete('ret');
            },
          ),
        'Marco pinta deprisa, casi sin respirar.',
      );
    },
    title: 'El retrato de Amaranta',
    desc: 'Elige hasta tres cosas para la silla (su sombrero, sí o sí) y la luz. Luego, «Pintar».',
    hint: 'El sombrero tiene que estar en la silla. Lo demás, lo que tú quieras.',
    init(st) {
      const F = QF();
      st.o = ['sombrero'];
      st.light = 'tarde';
      st.all = [
        ['sombrero', 'Su sombrero'],
        ['libro', 'El libro sin título'],
        ['flor', 'Una flor del jardín'],
        ['billete', 'El billete de vuelta'],
        ['miel', 'Un tarro de miel'],
        ['carta', 'Una carta'],
      ];
      this.btns(st);
    },
    btns(st) {
      API.buttons([
        ...st.all.map(([k, n]) => [
          n,
          () => {
            if (st.done) return;
            if (st.o.includes(k)) {
              if (k !== 'sombrero') st.o = st.o.filter((x) => x !== k);
            } else if (st.o.length < 3) st.o.push(k);
            this.btns(st);
          },
          { 'aria-pressed': st.o.includes(k) },
        ]),
        ...[
          ['mañana', 'Mañana'],
          ['tarde', 'Tarde'],
          ['noche', 'Noche'],
        ].map(([k, n]) => [
          n,
          () => {
            st.light = k;
            this.btns(st);
          },
          { 'aria-pressed': st.light === k },
        ]),
        [
          'Pintar',
          () => {
            st.done = API.now();
            this.finish(st);
          },
        ],
      ]);
    },
    draw(g, t, st) {
      const bg = { mañana: ['#FBE7B4', '#F3C872'], tarde: ['#F4C9A0', '#C9694B'], noche: ['#4A5A8A', '#243052'] }[st.light];
      paperBg(g, bg[0], bg[1]);
      rr(g, 130, 30, 240, 300, 4, null, '#D69646', 16);
      if (st.done) {
        const k = Math.min(1, (t - st.done) * 1.2);
        g.save();
        g.globalAlpha = k;
        g.beginPath();
        g.rect(138, 38, 224, 284);
        g.clip();
        const n = CELLS.cor.npc;
        try {
          n.draw(Pen(g, 250, 330, 3.6, 'retratoA', false, true), 0, 0, 1, 1.3, 'smile', true);
        } catch (e) {}
        g.restore();
      } else {
        g.fillStyle = '#8A5A34';
        g.fillRect(200, 240, 100, 14);
        g.fillRect(205, 254, 10, 70);
        g.fillRect(285, 254, 10, 70);
        g.fillRect(200, 150, 12, 95);
      }
      st.o.forEach((k, i) => {
        const x = 170 + i * 80,
          y = 365;
        hexPath(g, x, y, 20, Math.PI / 6);
        g.fillStyle = '#FBF4E3';
        g.fill();
        tx(g, { sombrero: '⌂', libro: '▤', flor: '✿', billete: '◉', miel: '⬢', carta: '✉' }[k], x, y, 16, PAL.amber);
      });
    },
  },
  /* ── Rocío · el nombre ── */
  name: {
    finish(st) {
      API.win(
        () =>
          winTalk([`«${st.n}». Qué bien le queda.`, 'Ya tiene nombre. Y la colmena, su sexto sello.'], ['happy', 'surprised'], () => {
            bagTake('agua');
            bagTake('luzfaro');
            QF().treeName = st.n;
            complete('jar');
            lightSeal(6, 'jar');
          }),
        'El árbol se estira hacia la luz.',
      );
    },
    title: 'El árbol sin nombre',
    desc: 'Escribe el nombre del árbol. El que tú quieras.',
    hint: 'Puede ser tu nombre, el de alguien que quieras o una palabra bonita.',
    init(st) {
      const go = (v) => {
        v = (v || '').trim().slice(0, 22);
        if (!v) {
          API.say('Escribe un nombre.');
          return;
        }
        st.n = v;
        this.finish(st);
      };
      API.buttons([
        { input: 'Nombre del árbol', max: 22, enter: go },
        ['Nombrar', () => go(document.getElementById('mgin').value)],
        ['Esperanza', () => go(_t('Esperanza'))],
        ['Alba', () => go(_t('Alba'))],
        ['Latido', () => go(_t('Latido'))],
      ]);
    },
    draw(g, t, st) {
      paperBg(g, '#E4F0D4', '#A8C48A');
      g.fillStyle = '#6E4A2E';
      g.fillRect(238, 190, 24, 150);
      const sw = Math.sin(t) * 3;
      for (const [x, y, r] of [
        [250, 150, 70],
        [200, 180, 50],
        [300, 180, 50],
        [250, 100, 45],
      ]) {
        g.fillStyle = '#6F8D5E';
        g.beginPath();
        g.arc(x + sw, y, r, 0, TAU);
        g.fill();
      }
      for (let k = 0; k < 12; k++) {
        g.fillStyle = k % 2 ? '#F4AFA6' : '#FBF4E3';
        g.beginPath();
        g.arc(190 + ((k * 47) % 130), 90 + ((k * 31) % 120) + sw, 5, 0, TAU);
        g.fill();
      }
      rr(g, 170, 300, 160, 40, 6, '#FBF4E3', '#8A5A34', 3);
      const inp = document.getElementById('mgin');
      tx(g, st.n || (inp && inp.value) || '…', 250, 320, 17);
    },
  },
  /* ── Orión · la constelación ── */
  constel: {
    finish(st) {
      const miss = Object.keys(GLYPHS).filter((id) => !(QF().glyphs && QF().glyphs[id]));
      API.win(
        () =>
          winTalk(
            [
              '¡Un hexágono! Como sus símbolos.',
              miss.length
                ? `Y mira: el cielo marca dónde faltan los tuyos: ${LJ(miss.map((id) => SEASON[id].name))}.`
                : 'Y ya los has encontrado todos. El cielo te guiña un ojo.',
            ],
            ['surprised', 'smile'],
            () => sideDone('esp'),
          ),
        'La figura se enciende.',
      );
    },
    title: 'Estrellas nuevas',
    desc: 'Une las seis estrellas que forman la figura que ella dibujaba. Tócalas una detrás de otra.',
    hint: 'Es un hexágono. Ve de una estrella a su vecina, sin saltarte ninguna.',
    init(st) {
      st.s = [...Array(6)].map((_, k) => ({
        x: 250 + Math.cos((k * Math.PI) / 3) * 120,
        y: 190 + Math.sin((k * Math.PI) / 3) * 110,
        h: k,
      }));
      st.s.push({ x: 90, y: 70, h: -1 }, { x: 420, y: 340, h: -1 }, { x: 400, y: 60, h: -1 });
      st.path = [];
    },
    tap(x, y, st) {
      for (const s of st.s)
        if (Math.hypot(x - s.x, y - s.y) < 24) {
          if (s.h < 0) {
            st.path = [];
            API.say('Esa no forma parte de la figura.');
            Sound.sfx('blocked', 0.3);
            return;
          }
          const last = st.path[st.path.length - 1];
          if (st.path.includes(s.h)) {
            if (st.path.length === 6 && s.h === st.path[0]) this.finish(st);
            return;
          }
          if (last !== undefined && Math.abs(last - s.h) % 6 !== 1 && Math.abs(last - s.h) % 6 !== 5) {
            st.path = [s.h];
            API.say('Salta a una vecina, no más lejos.');
            return;
          }
          st.path.push(s.h);
          Sound.sfx('pick', 0.3);
          if (st.path.length === 6) this.finish(st);
        }
    },

    draw(g, t, st) {
      paperBg(g, '#1E2448', '#2E3561');
      g.strokeStyle = '#FFE08A';
      g.lineWidth = 3;
      g.beginPath();
      st.path.forEach((h, i) => {
        const s = st.s[h];
        i ? g.lineTo(s.x, s.y) : g.moveTo(s.x, s.y);
      });
      if (st.path.length === 6) {
        const s = st.s[st.path[0]];
        g.lineTo(s.x, s.y);
      }
      g.stroke();
      for (const s of st.s) {
        starShape(g, s.x, s.y, 12 + Math.sin(t * 3 + s.x) * 2, st.path.includes(s.h) ? '#FFE08A' : '#DCE4FF');
      }
    },
  },
  /* ── Témpano · la radio ── */
  radio: {
    finish(st) {
      API.win(
        () =>
          winTalk(
            ['«Si oyes esto, la colmena ya late. Gracias por no dejar de escribirme.»', 'Era su voz. Gracias por traerme la carta.'],
            ['sad', 'happy'],
            () => sideDone('ant'),
          ),
        'La radio habla con su voz.',
      );
    },
    title: 'Frecuencia perdida',
    desc: 'Gira el dial a cada número de la carta (siete, tres, nueve) y pulsa «Sintonizar».',
    hint: 'Primero el siete, después el tres, al final el nueve.',
    init(st) {
      st.f = 5;
      st.k = 0;
      st.seq = [7, 3, 9];
      API.buttons([
        [
          '◀',
          () => {
            st.f = Math.max(0, st.f - 1);
            Sound.sfx('plank', 0.2);
          },
        ],
        [
          '▶',
          () => {
            st.f = Math.min(10, st.f + 1);
            Sound.sfx('plank', 0.2);
          },
        ],
        [
          'Sintonizar',
          () => {
            if (st.f === st.seq[st.k]) {
              st.k++;
              Sound.sfx('pick', 0.5);
              API.say(['', 'Algo se oye…', 'Una voz, entre el ruido…'][st.k] || '');
              if (st.k >= 3) this.finish(st);
            } else {
              API.say('Solo ruido.');
              Sound.sfx('blocked', 0.3);
            }
          },
        ],
      ]);
    },
    draw(g, t, st) {
      paperBg(g, '#C9DFE9', '#8AB2C6');
      rr(g, 70, 70, 360, 230, 16, '#5E6B7A', '#3A3A48', 4);
      rr(g, 100, 100, 300, 60, 8, '#2E3A52');
      for (let k = 0; k <= 10; k++) {
        const x = 115 + k * 27;
        g.fillStyle = '#F3E0B0';
        g.fillRect(x, 108, 2, k % 5 ? 10 : 18);
        tx(g, String(k), x + 1, 145, 11, '#F3E0B0');
      }
      g.fillStyle = '#E0584A';
      g.fillRect(115 + st.f * 27 - 1, 104, 4, 50);
      g.fillStyle = '#3A3A48';
      g.beginPath();
      g.arc(250, 230, 48, 0, TAU);
      g.fill();
      g.strokeStyle = '#F3E0B0';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(250, 230);
      const a = -Math.PI * 1.2 + (st.f / 10) * Math.PI * 1.4;
      g.lineTo(250 + Math.cos(a) * 40, 230 + Math.sin(a) * 40);
      g.stroke();
      const noise = st.k >= 3 ? 0 : 1;
      for (let k = 0; k < 30; k++) {
        g.fillStyle = `rgba(255,255,255,${noise * Math.random() * 0.3})`;
        g.fillRect(100 + Math.random() * 300, 100 + Math.random() * 60, 3, 2);
      }
      for (let i = 0; i < 3; i++) {
        g.fillStyle = i < st.k ? '#E4A844' : 'rgba(255,255,255,.3)';
        g.beginPath();
        g.arc(210 + i * 40, 330, 8, 0, TAU);
        g.fill();
      }
    },
  },
};
