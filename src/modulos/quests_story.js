/* ══════════ MISIONES · sellos 3 a 6, favores y el corazón ══════════
   Cada racimo enciende un sello con una cadena de cuatro favores. Cada vecino tiene
   su minijuego. Los ocho primeros vecinos vuelven a pedir algo cuando la historia avanza. */
Object.assign(FREE_F, { s3: 1, s4: 1, s5: 1, s6: 1 });
CHAP[4] = ['Capítulo 4', 'La colmena despierta'];
CHAP[5] = ['Capítulo 5', 'Las voces de la cera'];
CHAP[6] = ['Capítulo 6', 'El último sello'];
CHAP[7] = ['Capítulo 7', 'El corazón'];
NARR.seal[3] = [
  'Tres. La casa vuelve a tener horas.',
  'Todas las noches ponía la mesa para dos. Nunca vino nadie.',
  'El viejo apicultor me enseñó que la colmena se para cuando quien la cuida deja de escucharla.',
];
NARR.seal[4] = [
  'Cuatro. El teatro ya sabe el final.',
  'No subí a ese tren. Subió mi sombrero, con alguien debajo que se me parecía.',
  'Bajé a pie hacia el corazón, con la luz del faro en la espalda.',
];
NARR.seal[5] = [
  'Cinco. La forja vuelve a arder.',
  'Pedí una llave para cerrarme por dentro. Ceniza la hizo sin preguntar.',
  'Quien tenga la llave puede abrir. No quise que fuera nadie. Y ahora eres tú.',
];
NARR.seal[6] = [
  'Seis. El árbol tiene nombre.',
  'Escribí que quien lo nombrara tendría que quedarse. No es verdad: se queda quien quiere.',
  'Ven. El corazón está abierto.',
];
const clue = (k) => {
    const F = QF();
    F.clue = F.clue || {};
    F.clue[k] = 1;
  },
  clues = () => Object.keys(QF().clue || {}).length;
const sil = (k) => {
    const F = QF();
    F.sil = F.sil || {};
    F.sil[k] = 1;
  },
  sils = () => Object.keys(QF().sil || {}).length;
const word = (k, w) => {
    const F = QF();
    F.words = F.words || {};
    F.words[k] = w;
  },
  words = () => Object.keys(QF().words || {}).length;
const side = (id) => !!(QF().side && QF().side[id]),
  sideDone = (id) => {
    const F = QF();
    F.side = F.side || {};
    if (F.side[id]) return;
    F.side[id] = 1;
    friend(id, 3);
    if (Object.keys(F.side).length >= 8) achieve('sides');
  };
const missing = (list) => list.filter((i) => !bagHas(i)).map((i) => ITEM_NAME[i]);
function complete(id) {
  const F = QF();
  F.ok = F.ok || {};
  F.ok[id] = 1;
  setStep(id, 9);
  friend(id, 2);
  stateChanged();
}
function met(id) {
  const F = QF();
  F.met = F.met || {};
  F.met[id] = 1;
  friend(id, 1);
  if (!mStep(id)) setStep(id, 1);
}
function rot(id) {
  const D = DLG2[id],
    F = QF();
  F.talk2 = F.talk2 || {};
  const i = (F.talk2[id] || 0) % D.again.length;
  F.talk2[id] = (F.talk2[id] || 0) + 1;
  return D.again[i];
}
function lightSeal(n, cell) {
  const F = QF();
  if (F['s' + n]) return;
  F['s' + n] = 1;
  EMO[cell] = { ch: '✦', t0: T + 0.4 };
  WAVE = { t0: T + 0.5, id: cell };
  Sound.sfx('seal');
  narrate(NARR.seal[n], 'seal' + n, { delay: 1.2 });
  ZKhold = { v: 0.62, until: T + 3.4 };
  Pl.happy = T + 3;
  buzz([20, 60, 30]);
  achieve('s' + n);
  beesFrom(cell);
  for (const id of CLUSTER[n]) delete DARK[id];
  rebakeCell(cell);
  stateChanged();
  note(`✦ Sello ${n} encendido · ${sealCount()}/6`);
  pendingCard = Math.min(7, sealCount() + 1);
  if (sealCount() >= 6) {
    delete DARK.cor;
    delete DARK.est;
  }
}
/* una victoria en un minijuego: el vecino habla y la historia avanza */
function winTalk(lines, ex, fx) {
  const b0 = PROG.bag.slice();
  if (fx) fx();
  bagFly(b0);
  stateChanged();
  sayNPC(lines, ex || ['happy', 'smile', 'open']);
}

/* ── objetos que se recogen en los cuartos nuevos ── */
PUZ.things.col = (PUZ.things.col || []).concat([
  {
    id: 'miel',
    x: -190,
    y: -10,
    z: 34,
    r: 80,
    ax: -150,
    ay: 30,
    item: 'miel',
    label: () => 'Coger un tarro de miel',
    show: () => !!QF().star && !bagHas('miel') && !mDone('coc') && mStep('coc') > 0,
  },
]);
PUZ.things.col = (PUZ.things.col || []).concat([
  {
    id: 'menta',
    x: -150,
    y: 150,
    z: 22,
    r: 80,
    ax: 130,
    ay: 150,
    item: 'menta',
    label: () => 'Coger una ramita de menta',
    show: () => !!QF().star && !bagHas('menta') && !mDone('coc') && mStep('coc') > 0,
  },
]);
{
  const w = PUZ.things.pri.find((t) => t.id === 'agua');
  w.show = () => !PROG.F.tookWater || (!!QF().star && !bagHas('agua') && !mDone('jar') && mStep('jar') > 0);
}
/* las tres flores de Luna: se abren si les das la espalda */
const FLOWERS = [
  [-175, 95],
  [175, 105],
  [-30, 185],
];
FLOWERS.forEach(([x, y], i) =>
  (PUZ.things.inn = PUZ.things.inn || []).push({
    id: 'flor' + i,
    x,
    y,
    z: 14,
    r: 70,
    ax: x + (x < 0 ? 40 : -40),
    ay: y - 26,
    label: () => (flowerOpen(i) ? 'Recoger el polen' : 'Una flor cerrada'),
    show: () => mStep('inn') > 0 && !mDone('inn') && !(QF().pollen && QF().pollen[i]),
  }),
);
const FLW = {};
const flowerOpen = (i) => (FLW[i] || 0) >= 1;
function flowerTick(dt) {
  if (cur !== 'inn' || mStep('inn') < 1 || mDone('inn')) return;
  FLOWERS.forEach(([x, y], i) => {
    if (QF().pollen && QF().pollen[i]) return;
    const d = Math.hypot(Pl.x - x, Pl.y - y),
      watched = Math.sign(x - Pl.x) === Pl.f;
    const tg = d < 150 && !watched ? 1 : 0;
    FLW[i] = clamp((FLW[i] || 0) + (tg ? dt / 1.4 : -dt / 0.5), 0, 1.001);
    if (tg && FLW[i] >= 1 && !FLW['s' + i]) {
      FLW['s' + i] = 1;
      Sound.sfx('pick', 0.6);
      note('La flor se abrió a tu espalda');
    }
    if (!tg && FLW[i] < 0.2) FLW['s' + i] = 0;
  });
}
const QDRAW = {
  inn(p) {
    if (mStep('inn') < 1 || mDone('inn')) return;
    const s = p.s;
    FLOWERS.forEach(([x, y], i) => {
      const got = QF().pollen && QF().pollen[i],
        o = got ? 1 : Math.min(1, FLW[i] || 0),
        b = p.P(x, y, 0),
        top = p.P(x, y, 26);
      p.flat(p.ell(b[0], b[1], 14, 5), 'rgba(10,10,40,.25)');
      p.line([b, top], '#3F7F5F', 2.4);
      p.cut(p.leaf(b[0], b[1] - 8 * s, -Math.PI / 2 - 0.9, 14, 5), '#4E8A6A', { sh: 0, rough: 0.2 });
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU + 0.3,
          sp = 4 + o * 10;
        p.cut(
          p.leaf(top[0], top[1], a - (Math.PI / 2) * (1 - o) * 0.0 - (1 - o) * 1.2 * Math.sign(Math.cos(a)), sp, 3 + o * 2.2),
          o > 0.5 ? '#E6E0F4' : '#8A93C8',
          { sh: 0, rough: 0.1 },
        );
      }
      p.flat(p.ell(top[0], top[1], 3 + o * 1.5, 3 + o * 1.5, 10), got ? '#8A93C8' : '#FFF6D8');
      if (o > 0.9 && !got) {
        p.g.save();
        p.g.globalCompositeOperation = 'lighter';
        p.flat(p.ell(top[0], top[1], 18, 14, 14), 'rgba(207,227,255,.35)');
        p.g.restore();
      }
    });
  },
};
{
  const act0 = act;
  act = function (t) {
    if (cur === 'inn' && t.id && t.id.startsWith('flor')) {
      const i = +t.id.slice(4);
      if (!flowerOpen(i)) {
        note('Está cerrada. Date la vuelta y espera: no le gusta que la miren.');
        return;
      }
      const F = QF();
      F.pollen = F.pollen || {};
      F.pollen[i] = 1;
      Sound.sfx('pick');
      const n = Object.keys(F.pollen).length;
      note(`Polen de luna · ${n}/3`);
      if (n >= 3) achieve('look');
      stateChanged();
      return;
    }
    act0(t);
  };
}

/* ── los diálogos de cada vecino ── */
const Q = {
  /* Sello 3 · La casa de Amaranta */
  bib() {
    const F = QF(),
      st = mStep('bib');
    if (!st)
      return {
        lines: [
          ...DLG2.bib.first,
          'Amaranta escondió algo detrás de una balda, pero la estantería se desordenó cuando la colmena se paró.',
          '¿Me ayudas? Cada balda, de un solo color. Así la ordenaba ella.',
        ],
        ex: ['smile', 'open', 'neutral', 'sad', 'smile'],
        fx: () => met('bib'),
        after: () => openGame('books'),
      };
    if (!mDone('bib'))
      return { lines: ['La estantería sigue hecha un lío. ¿Lo intentamos otra vez?'], ex: ['smile'], after: () => openGame('books') };
    if (bagHas('libro'))
      return {
        lines: [
          'Ese libro… es el suyo. Tapas de cera y sin título.',
          'No lo abras aquí. Solo se abre en el corazón, con la llave adecuada.',
        ],
        ex: ['surprised', 'neutral'],
      };
    if (sealOn(3) && frOf('bib') < 3)
      return {
        lines: ['La biblioteca vuelve a oler a papel despierto. Gracias por ordenarla conmigo.'],
        ex: ['happy'],
        fx: () => friend('bib', 3),
      };
    return { lines: rot('bib'), ex: ['smile'] };
  },
  coc() {
    const st = mStep('coc');
    if (!st)
      return {
        lines: [
          ...DLG2.coc.first,
          'Si encontrara su receta, la terminaría por fin.',
          'Me faltan miel y una ramita de menta. Las dos están en el Colmenar.',
        ],
        ex: ['happy', 'open', 'sad', 'smile', 'open'],
        fx: () => met('coc'),
      };
    if (!mDone('coc')) {
      const m = missing(['receta', 'miel', 'menta']);
      if (m.length)
        return {
          lines: [
            `Todavía me falta: ${LJ(m)}.`,
            bagHas('receta')
              ? 'Con la receta ya sé el orden. Solo faltan los ingredientes.'
              : 'Tomo guarda todo lo que ella escribía. Quizá la receta esté en la biblioteca.',
          ],
          ex: ['neutral', 'smile'],
        };
      return {
        lines: ['¡La receta! Y la miel, y la menta.', 'Tú lees la tarjeta y yo remuevo.'],
        ex: ['surprised', 'happy'],
        after: () => openGame('cook'),
      };
    }
    if (QF().askSoup && !QF().gaveSoup && !bagFull())
      return {
        lines: ['¿Sopa para Escarcha? Claro. Que no se enfríe por el camino.'],
        ex: ['happy'],
        fx: () => {
          bagGive('sopa');
          QF().gaveSoup = 1;
        },
      };
    if (sealOn(3) && frOf('coc') < 3)
      return {
        lines: ['Ya no guardo un plato para quien falta. Ahora cocino para quien viene.'],
        ex: ['happy'],
        fx: () => friend('coc', 3),
      };
    return { lines: rot('coc'), ex: ['smile'] };
  },
  col() {
    const st = mStep('col');
    if (!st)
      return {
        lines: [
          ...DLG2.col.first,
          'Esperan algo que les recuerde a ella.',
          'Miel le guardaba un plato caliente cada noche… Si algo huele a Amaranta, es eso.',
        ],
        ex: ['open', 'neutral', 'smile', 'sad', 'smile'],
        fx: () => met('col'),
      };
    if (!mDone('col')) {
      if (!bagHas('mieltibia')) return { lines: ['Las abejas siguen dentro. Algo tibio, de su cocina, las haría salir.'], ex: ['sad'] };
      return {
        lines: ['¡Miel tibia! Déjala en la piquera… y ahora escucha.', 'Marca el zumbido conmigo, sin prisa.'],
        ex: ['surprised', 'smile'],
        after: () => openGame('rhythm'),
      };
    }
    if (sealOn(3) && frOf('col') < 3)
      return { lines: ['Las abejas te siguen un poco cuando pasas. Te han adoptado.'], ex: ['laugh'], fx: () => friend('col', 3) };
    return { lines: rot('col'), ex: ['smile'] };
  },
  rel() {
    const st = mStep('rel');
    if (!st)
      return {
        lines: [
          ...DLG2.rel.first,
          'Si supiera a qué hora pasaba cada cosa en esta casa, podría volver a darles cuerda.',
          'Pregunta a Tomo, a Miel y a Abril. Ellos se acuerdan de sus horas.',
        ],
        ex: ['neutral', 'open', 'sad', 'smile', 'smile'],
        fx: () => met('rel'),
      };
    if (!mDone('rel')) {
      const n = [
        ['bib', 'Tomo'],
        ['coc', 'Miel'],
        ['col', 'Abril'],
      ]
        .filter(([k]) => !(QF().clue && QF().clue[k]))
        .map((x) => x[1]);
      if (n.length)
        return {
          lines: [`Me faltan horas. Pregunta a ${LJ(n)}.`, 'Cada uno recuerda una hora de su trabajo con ella.'],
          ex: ['neutral', 'smile'],
        };
      return {
        lines: [
          'Las horas de la casa. Ya las tengo todas.',
          'Pon tú las agujas. El último reloj marca la hora en que ella cerró el corazón.',
        ],
        ex: ['happy', 'neutral'],
        after: () => openGame('clocks'),
      };
    }
    if (frOf('rel') < 3)
      return { lines: ['Tic, tac. Ya no cuento por costumbre: cuento porque me gusta.'], ex: ['laugh'], fx: () => friend('rel', 3) };
    return { lines: rot('rel'), ex: ['smile'] };
  },
  /* Sello 4 · Los sueños */
  inn() {
    const st = mStep('inn'),
      F = QF(),
      n = Object.keys(F.pollen || {}).length;
    if (!st)
      return {
        lines: [
          ...DLG2.inn.first,
          'Tres flores de luna guardan polen. Solo se abren si les das la espalda.',
          'Acércate a una, date la vuelta y espera. Luego recoge el polen.',
        ],
        ex: ['neutral', 'open', 'smile', 'smile', 'open'],
        fx: () => met('inn'),
      };
    if (!mDone('inn')) {
      if (n < 3) return { lines: [`Llevas ${n} de 3. No las mires: ellas lo notan.`], ex: ['smile'] };
      return {
        lines: ['Tres. Nunca nadie las había abierto todas.', 'Toma esta silueta de polilla. Telón la estaba buscando para su obra.'],
        ex: ['surprised', 'happy'],
        fx: () => {
          sil('polilla');
          complete('inn');
        },
      };
    }
    if (F.askPolen && !F.gavePolen && !bagFull())
      return {
        lines: ['¿Polen para el cerezo de Brote? Llévate este frasco. Brilla de noche.'],
        ex: ['happy'],
        fx: () => {
          bagGive('polen2');
          F.gavePolen = 1;
        },
      };
    if (sealOn(4) && frOf('inn') < 3)
      return {
        lines: ['Ahora las flores se abren aunque las mire. Creo que ya se fían de mí.'],
        ex: ['happy'],
        fx: () => friend('inn', 3),
      };
    return { lines: rot('inn'), ex: ['smile'] };
  },
  far() {
    const st = mStep('far'),
      F = QF();
    if (bagHas('vidrio'))
      return {
        lines: ['¡Vidrio nuevo de Duna! Ahora el haz llega hasta el último rincón del mapa.'],
        ex: ['surprised', 'happy'],
        fx: () => {
          bagTake('vidrio');
          F.glass = 1;
          friend('far', 3);
        },
      };
    if (!st)
      return {
        lines: [
          ...DLG2.far.first,
          'Tengo que devolver la luz al invernadero, a la estación y al teatro.',
          'Tú tienes mejor pulso que yo: gira los espejos.',
        ],
        ex: ['open', 'smile', 'sad', 'neutral', 'smile'],
        fx: () => met('far'),
        after: () => openGame('mirrors'),
      };
    if (!mDone('far')) return { lines: ['Los espejos siguen torcidos. ¿Otra vez?'], ex: ['smile'], after: () => openGame('mirrors') };
    if (sealOn(4) && frOf('far') < 3 && !F.askBrasa)
      return {
        lines: ['Un faro no busca barcos: les dice dónde está la orilla. Tú has sido mi orilla.'],
        ex: ['happy'],
        fx: () => friend('far', 3),
      };
    return { lines: rot('far'), ex: ['smile'] };
  },
  tre() {
    const st = mStep('tre'),
      F = QF();
    if (!st)
      return {
        lines: [
          ...DLG2.tre.first,
          'Quiero hacerle un billete de vuelta, pero el tren no sale sin estrellas picadas.',
          'Sube conmigo y pica cinco estrellas por la ventanilla.',
        ],
        ex: ['open', 'neutral', 'sad', 'smile', 'open'],
        fx: () => met('tre'),
        after: () => openGame('stars'),
      };
    if (!mDone('tre'))
      return { lines: ['¿Probamos otra vuelta? Las estrellas pasan deprisa.'], ex: ['smile'], after: () => openGame('stars') };
    if (F.askTicket && !F.gaveTicket && !bagFull())
      return {
        lines: ['¿Solano quiere viajar? ¡Por fin! Aquí tiene su billete.'],
        ex: ['laugh'],
        fx: () => {
          bagGive('billete2');
          F.gaveTicket = 1;
        },
      };
    if (sealOn(4) && frOf('tre') < 3)
      return {
        lines: ['El tren nocturno vuelve a tener horario. Desde el mapa puedes subirte cuando quieras.'],
        ex: ['happy'],
        fx: () => friend('tre', 3),
      };
    return { lines: rot('tre'), ex: ['smile'] };
  },
  tea() {
    const st = mStep('tea'),
      F = QF();
    if (bagHas('cartaL'))
      return {
        lines: [
          '¿Una carta de Amaranta… para mí?',
          '«Deja que el final lo escriban los demás.» Qué cosas tiene.',
          'Llévale a Pluma esta palabra: «el final».',
        ],
        ex: ['surprised', 'neutral', 'smile'],
        fx: () => {
          bagTake('cartaL');
          word('L', 'el final');
        },
      };
    if (!st)
      return {
        lines: [
          ...DLG2.tea.first,
          'La obra se quedó a oscuras en el segundo acto. Me faltan tres siluetas: una polilla, un faro y un tren.',
          'Tráemelas y la representamos juntos.',
        ],
        ex: ['laugh', 'open', 'smile', 'sad', 'smile'],
        fx: () => met('tea'),
      };
    if (!mDone('tea')) {
      if (sils() < 3) {
        const f = [
          ['polilla', 'una polilla (Luna)'],
          ['faro', 'un faro (Albor)'],
          ['tren', 'un tren (Estela)'],
        ]
          .filter(([k]) => !(F.sil && F.sil[k]))
          .map((x) => x[1]);
        return { lines: [`Me faltan siluetas: ${LJ(f)}.`], ex: ['neutral'] };
      }
      return { lines: ['¡Las tres! Siéntate. Tú decides el orden de las escenas.'], ex: ['laugh'], after: () => openGame('theatre') };
    }
    if (frOf('tea') < 3 && side('oto'))
      return { lines: ['¡Ocre imprimió el programa! Ya tenemos cien espectadores de papel.'], ex: ['laugh'], fx: () => friend('tea', 3) };
    return { lines: rot('tea'), ex: ['smile'] };
  },
  /* Sello 5 · Las raíces */
  cum() {
    const st = mStep('cum');
    if (!st)
      return {
        lines: [
          ...DLG2.cum.first,
          'El viento sabe qué celdas siguen dormidas.',
          'Si lanzas la cometa hacia donde sopla, me lo irá diciendo.',
        ],
        ex: ['open', 'smile', 'neutral', 'smile', 'open'],
        fx: () => met('cum'),
        after: () => openGame('kite'),
      };
    if (!mDone('cum')) return { lines: ['El viento sigue cambiando. ¿Otra vez?'], ex: ['smile'], after: () => openGame('kite') };
    if (sealOn(5) && frOf('cum') < 3)
      return {
        lines: ['Desde aquí veo el humo de la forja. Y la luz de tu farol, yendo y viniendo.'],
        ex: ['happy'],
        fx: () => friend('cum', 3),
      };
    return { lines: rot('cum'), ex: ['smile'] };
  },
  cue() {
    const st = mStep('cue');
    if (!st)
      return {
        lines: [...DLG2.cue.first, 'Uno de estos cristales late a la vez que la colmena. Ayúdame a encontrarlo.'],
        ex: ['surprised', 'neutral', 'smile', 'open'],
        fx: () => met('cue'),
        after: () => openGame('crystals'),
      };
    if (!mDone('cue'))
      return { lines: ['Escucha el latido y mira qué cristal le sigue.'], ex: ['smile'], after: () => openGame('crystals') };
    if (sealOn(5) && frOf('cue') < 3)
      return {
        lines: ['El cristal que encontraste sigue latiendo en la forja. Lo oigo desde aquí.'],
        ex: ['happy'],
        fx: () => friend('cue', 3),
      };
    return { lines: rot('cue'), ex: ['smile'] };
  },
  sot() {
    const st = mStep('sot');
    if (!st)
      return {
        lines: [
          ...DLG2.sot.first,
          'Las cartas que fundió se quedaron dentro de la cera.',
          'Si la calientas con la vela, salen las palabras.',
        ],
        ex: ['neutral', 'smile', 'sad', 'neutral', 'open'],
        fx: () => met('sot'),
        after: () => openGame('wax'),
      };
    if (!mDone('sot')) return { lines: ['La cera no tiene prisa. ¿Lo intentamos otra vez?'], ex: ['smile'], after: () => openGame('wax') };
    if (sealOn(5) && frOf('sot') < 3)
      return { lines: ['Esta noche voy a encender una vela más. Para ti.'], ex: ['happy'], fx: () => friend('sot', 3) };
    return { lines: rot('sot'), ex: ['smile'] };
  },
  vol() {
    const st = mStep('vol'),
      F = QF();
    if (!st)
      return {
        lines: [
          ...DLG2.vol.first,
          'Puedo forjar otra llave del corazón.',
          'Me faltan un cristal que lata, de la cueva de Geoda, y cera para el molde, del sótano de Vela.',
        ],
        ex: ['open', 'neutral', 'sad', 'smile', 'open'],
        fx: () => met('vol'),
      };
    if (!mDone('vol')) {
      const m = missing(['cristal', 'cera']);
      if (m.length) return { lines: [`Me falta: ${LJ(m)}.`], ex: ['neutral'] };
      return {
        lines: ['Cristal y cera. Vamos allá: dale al fuelle y golpea cuando brille.'],
        ex: ['laugh'],
        after: () => openGame('forge'),
      };
    }
    if (F.askBrasa && !F.gaveBrasa && !bagFull())
      return {
        lines: ['¿Una brasa para Duna? Toma, envuelta en arcilla. No quema… mucho.'],
        ex: ['laugh'],
        fx: () => {
          bagGive('brasa');
          F.gaveBrasa = 1;
        },
      };
    if (frOf('vol') < 3)
      return { lines: ['La forja no se apaga del todo nunca. Se esconde, como la gente.'], ex: ['smile'], fx: () => friend('vol', 3) };
    return { lines: rot('vol'), ex: ['smile'] };
  },
  /* Sello 6 · La memoria */
  dsv() {
    const st = mStep('dsv'),
      F = QF();
    if (F.boxOpen && !mDone('dsv')) {
      const need = ['libro'].filter((i) => !(F.boxGot && F.boxGot[i]));
      const free = BAGMAX - PROG.bag.length;
      if (free < 1) return { lines: ['Haz sitio en la mochila: dentro de la caja hay cosas para ti.'], ex: ['neutral'] };
      return {
        lines: [
          'Dentro hay un libro sin título, con tapas de cera.',
          'Es el que busca Tomo, pero dice que no se abre aquí. Solo en el corazón, con la llave adecuada.',
        ],
        ex: ['surprised', 'smile'],
        fx: () => {
          F.boxGot = F.boxGot || {};
          for (const i of need) {
            if (bagFull()) break;
            bagGive(i);
            F.boxGot[i] = 1;
          }
          if (F.boxGot.libro) complete('dsv');
        },
      };
    }
    if (!st)
      return {
        lines: [
          ...DLG2.dsv.first,
          'La caja tiene un candado de seis hexágonos. Cada uno lleva el dibujo de una celda.',
          'Dicen que la colmena enseña los números cuando late.',
        ],
        ex: ['smile', 'neutral', 'sad', 'neutral', 'open'],
        fx: () => met('dsv'),
        after: () => openGame('lock'),
      };
    if (!mDone('dsv'))
      return {
        lines: ['¿Probamos otra combinación? El cuaderno guarda los símbolos que has encontrado.'],
        ex: ['smile'],
        after: () => openGame('lock'),
      };
    if (sealOn(6) && frOf('dsv') < 3)
      return {
        lines: ['La caja ya está vacía. Es lo que pasa con las cosas cuando llegan a su sitio.'],
        ex: ['happy'],
        fx: () => friend('dsv', 3),
      };
    return { lines: rot('dsv'), ex: ['smile'] };
  },
  est() {
    const st = mStep('est'),
      F = QF();
    if (!st || (!F.letters && !mDone('est'))) {
      return {
        lines: [
          ...(st ? [] : DLG2.est.first),
          'Tres cartas sin enviar: para Témpano, para Telón y para Coral.',
          'Repártelas. Cada uno te dará una palabra, y con ellas escribiremos la respuesta.',
        ],
        ex: ['neutral', 'smile', 'open', 'neutral', 'smile'],
        fx: () => {
          met('est');
          F.letters = 1;
          bagGive('cartaT');
          bagGive('cartaL');
          bagGive('cartaC');
        },
      };
    }
    if (!mDone('est')) {
      const w = words();
      if (w < 3)
        return {
          lines: [`Llevas ${w} de 3 palabras. Témpano está en la Antártida, Telón en el teatro y Coral en el océano.`],
          ex: ['smile'],
        };
      return {
        lines: ['Tres palabras. Escribe tú la respuesta; yo solo sujeto la pluma.'],
        ex: ['happy'],
        after: () => openGame('compose'),
      };
    }
    if (sealOn(6) && frOf('est') < 3)
      return {
        lines: ['Tu carta la dejé encima de todas las demás. Es la única con respuesta.'],
        ex: ['happy'],
        fx: () => friend('est', 3),
      };
    return { lines: rot('est'), ex: ['smile'] };
  },
  ret() {
    const st = mStep('ret'),
      F = QF();
    if (!st)
      return {
        lines: [
          ...DLG2.ret.first,
          'Para pintarla necesito algo suyo. Su sombrero, por ejemplo.',
          'Trasto guarda todo lo que nadie quiere. Quizá lo tenga.',
        ],
        ex: ['surprised', 'smile', 'sad', 'neutral', 'smile'],
        fx: () => met('ret'),
      };
    if (!mDone('ret')) {
      if (!bagHas('sombrero')) return { lines: ['Sin algo suyo no me sale. ¿Has ido al desván de Trasto?'], ex: ['neutral'] };
      return {
        lines: ['¡Su sombrero! Colócalo en la silla. Y elige qué más pondrías tú.'],
        ex: ['surprised'],
        after: () => openGame('portrait'),
      };
    }
    if (F.askSketch && !F.gaveSketch && !bagFull())
      return {
        lines: ['¿Un boceto para el programa de Telón? Ahí va, todavía húmedo.'],
        ex: ['laugh'],
        fx: () => {
          bagGive('boceto');
          F.gaveSketch = 1;
        },
      };
    if (sealOn(6) && frOf('ret') < 3)
      return { lines: ['Ya tengo su retrato. Ahora pinto a los demás: mira tu cuaderno.'], ex: ['happy'], fx: () => friend('ret', 3) };
    return { lines: rot('ret'), ex: ['smile'] };
  },
  jar() {
    const st = mStep('jar');
    if (!st)
      return {
        lines: [
          ...DLG2.jar.first,
          'El árbol sin nombre necesita agua de lluvia, de Primavera, y la luz del faro de Albor.',
          'Después, un nombre. El que tú quieras.',
        ],
        ex: ['smile', 'open', 'sad', 'neutral', 'smile'],
        fx: () => met('jar'),
      };
    if (!mDone('jar')) {
      const m = missing(['agua', 'luzfaro']);
      if (m.length) return { lines: [`Todavía le falta: ${LJ(m)}.`], ex: ['neutral'] };
      return {
        lines: ['Agua y luz… mira cómo estira las ramas.', 'Ahora dale un nombre.'],
        ex: ['surprised', 'smile'],
        after: () => openGame('name'),
      };
    }
    if (frOf('jar') < 3)
      return {
        lines: [`«${QF().treeName || '…'}» ha echado otra hoja. Creo que le gusta su nombre.`],
        ex: ['happy'],
        fx: () => friend('jar', 3),
      };
    return { lines: rot('jar'), ex: ['smile'] };
  },
  /* El corazón */
  cor() {
    const F = QF();
    if (!F.ending && !FREE && !allSeals())
      return {
        lines: [
          '(Amaranta duerme dentro de un capullo de cera que late despacio.)',
          `(Faltan ${6 - sealCount()} sellos para que se abra.)`,
          '(En la pared hay un tablón con los encargos de toda la colmena.)',
        ],
        ex: ['sleep', 'sleep', 'sleep'],
      };
    if (F.ending) return { lines: ['Gracias por despertarme. La colmena late sola, y late bien.'], ex: ['smile'] };
    if (!bagHas('llave') || !bagHas('libro')) {
      const m = missing(['llave', 'libro']);
      return {
        lines: [
          '(Amaranta duerme sentada, con el cuaderno abierto sobre las rodillas.)',
          '(La última página está en blanco. Junto a ella, un libro cerrado con cera… no: el hueco de un libro.)',
          `(Falta: ${LJ(m)}.)`,
        ],
        ex: ['sleep'],
      };
    }
    const pg = Object.keys(F.pages || {}).length,
      all = !!F.truth;
    const ch = [];
    if (bagHas('billete')) ch.push(['Darle el billete de vuelta', () => ending('A')]);
    ch.push(['Quedarme a cuidar la colmena', () => ending('B')]);
    if (all) ch.push(['Contarle la verdad que has descubierto', () => ending('C')]);
    const tip = all ? [] : ['(En tu cuaderno quedan preguntas sin responder. Quizá haya un final más completo.)'];
    return {
      lines: [
        '(La llave de Ceniza encaja en el libro de cera. Se abre.)',
        `(Dentro están las páginas que faltaban. Encajan con las que has encontrado: ${pg} de 7.)`,
        '(Amaranta abre los ojos, despacio.)',
        '¿Has sido tú quien encendió los sellos?',
        ...tip,
        'Gracias. No sabía cómo volver. ¿Qué hacemos ahora?',
      ],
      ex: ['sleep', 'sleep', 'surprised', 'open', ...(all ? [] : ['neutral']), 'smile'],
      choices: ch,
    };
  },
  /* Los ocho primeros vecinos: favores nuevos */
  pri() {
    const F = QF();
    if (!F.star) return null;
    if (side('pri')) return { lines: ['Mira el cerezo: ahora florece también de noche. Brilla como el polen de Luna.'], ex: ['happy'] };
    if (bagHas('polen2'))
      return {
        lines: [
          '¡Polen de luna! Mi cerezo florecerá también de noche.',
          'Gracias. Toma, riega con esto el árbol de Rocío: es agua de la lluvia de hoy.',
        ],
        ex: ['surprised', 'happy'],
        fx: () => {
          bagTake('polen2');
          if (!bagFull() && !bagHas('agua')) bagGive('agua');
          sideDone('pri');
        },
      };
    if (F.askPolen) return { lines: ['Luna tiene el polen que brilla. Su invernadero está en la isla del teatro.'], ex: ['smile'] };
    return {
      lines: [
        'La colmena late otra vez, pero mi cerezo solo florece de día.',
        'Dicen que Luna tiene polen que brilla de noche. ¿Me traes un poco?',
      ],
      ex: ['neutral', 'smile'],
      fx: () => {
        F.askPolen = 1;
      },
    };
  },
  ver() {
    const F = QF();
    if (!mDone('tre')) return null;
    if (side('ver')) return { lines: ['Voy a ver a Escarcha. Sin prisa, claro. Nunca con prisa.'], ex: ['happy'] };
    if (bagHas('billete2'))
      return {
        lines: ['¡Un billete! A mi nombre y todo.', 'Era para ir a ver a Escarcha. Nunca me atreví a pedírselo a nadie.'],
        ex: ['surprised', 'happy'],
        fx: () => {
          bagTake('billete2');
          sideDone('ver');
        },
      };
    if (F.askTicket) return { lines: ['Estela vende los billetes en la estación del tren nocturno.'], ex: ['smile'] };
    return {
      lines: ['Oye… ¿es verdad que el tren nocturno vuelve a salir?', 'Siempre quise subir. Nunca me atreví a pedir billete.'],
      ex: ['surprised', 'sad'],
      fx: () => {
        F.askTicket = 1;
      },
    };
  },
  oto() {
    const F = QF();
    if (!mDone('ret')) return null;
    if (side('oto'))
      return { lines: ['Mira la portada del periódico: «Quien la despertó». Sales de espaldas, como siempre.'], ex: ['laugh'] };
    if (bagHas('boceto'))
      return {
        lines: [
          '¡Eres tú, de espaldas! Marco siempre te pinta así.',
          'Lo pondré en la portada del periódico de la colmena: «Quien la despertó».',
        ],
        ex: ['happy'],
        fx: () => {
          bagTake('boceto');
          sideDone('oto');
        },
      };
    if (F.askSketch) return { lines: ['Marco dibuja mejor que nadie. Está en la sala de retratos.'], ex: ['smile'] };
    return {
      lines: ['Quiero sacar el periódico de la colmena, pero me falta un dibujo para la portada.', '¿Le pides un boceto a Marco?'],
      ex: ['neutral', 'smile'],
      fx: () => {
        F.askSketch = 1;
      },
    };
  },
  inv() {
    const F = QF();
    if (!mDone('coc')) return null;
    if (side('inv')) return { lines: ['Ya no tejo. Solano viene de visita, y con eso basta.'], ex: ['smile'] };
    if (bagHas('sopa'))
      return {
        lines: [
          'Mmm… Con sopa caliente y Solano de visita, ya no hace falta contar los días.',
          'Toma: la última vuelta de bufanda. Para ti.',
        ],
        ex: ['happy', 'smile'],
        fx: () => {
          bagTake('sopa');
          sideDone('inv');
          AVATAR.accessory = 'bufanda';
          AVATAR.accent = '#C9694B';
          try {
            localStorage.setItem('colmena-avatar', JSON.stringify(AVATAR));
          } catch (e) {}
          note('Ahora llevas la bufanda de Escarcha');
        },
      };
    if (F.askSoup) return { lines: ['Miel hacía una sopa que calentaba hasta los recuerdos.'], ex: ['smile'] };
    return {
      lines: ['Hace tanto frío aquí que ya no noto las agujas.', 'Miel hacía una sopa que calentaba hasta los recuerdos…'],
      ex: ['sad', 'smile'],
      fx: () => {
        F.askSoup = 1;
      },
    };
  },
  esp() {
    const F = QF();
    if (!sealOn(3) && !sealOn(4)) return null;
    if (side('esp')) return { lines: ['El hexágono sigue ahí arriba. Esta noche le pondré tu nombre.'], ex: ['happy'] };
    return {
      lines: [
        'Desde que la colmena late, veo estrellas nuevas.',
        'Ayúdame a unir estas seis: forman algo que ella dibujaba en todas partes.',
      ],
      ex: ['surprised', 'smile'],
      after: () => openGame('constel'),
    };
  },
  oce() {
    const F = QF();
    if (bagHas('cartaC'))
      return {
        lines: ['¿Una carta suya… para mí?', '«La luz también llega al fondo, aunque tarde.»', '…Creo que ya no necesito la escafandra.'],
        ex: ['surprised', 'neutral', 'happy'],
        fx: () => {
          bagTake('cartaC');
          word('C', 'la luz');
          sideDone('oce');
          coralHelmet();
        },
      };
    if (side('oce'))
      return {
        lines: ['Qué raro es ver el mar sin cristal delante. Raro y bonito.', 'Dale a Pluma mi palabra: «la luz».'],
        ex: ['happy', 'smile'],
      };
    return null;
  },
  des() {
    const F = QF();
    if (!mDone('vol')) return null;
    if (side('des')) return { lines: ['Albor dice que su faro se ve desde la Antártida. Exagera, pero me gusta.'], ex: ['laugh'] };
    if (bagHas('brasa'))
      return {
        lines: ['¡Qué calor tan bueno!', 'Aquí tienes el vidrio. Llévaselo a Albor, al faro.'],
        ex: ['surprised', 'happy'],
        fx: () => {
          bagTake('brasa');
          if (!bagFull()) bagGive('vidrio');
          sideDone('des');
        },
      };
    if (F.askBrasa) return { lines: ['Necesito una brasa de la forja de Ceniza, en el volcán.'], ex: ['smile'] };
    return {
      lines: [
        'Albor dice que su faro no llega a todas partes. Con un vidrio nuevo llegaría.',
        'Pero necesito calor de verdad: una brasa de la forja de Ceniza.',
      ],
      ex: ['neutral', 'smile'],
      fx: () => {
        F.askBrasa = 1;
      },
    };
  },
  ant() {
    const F = QF();
    if (bagHas('cartaT'))
      return {
        lines: [
          '¡Una carta de Amaranta! Por fin me contesta.',
          '«Cada noche te leo, aunque no te escriba.»',
          'Y trae números: siete, tres, nueve. Son frecuencias de radio. Ayúdame a sintonizarlas.',
        ],
        ex: ['surprised', 'happy', 'open'],
        fx: () => {
          bagTake('cartaT');
          word('T', 'cada noche');
        },
        after: () => openGame('radio'),
      };
    if (F.words && F.words.T && !side('ant'))
      return { lines: ['Siete, tres, nueve. ¿Lo intentamos otra vez?'], ex: ['smile'], after: () => openGame('radio') };
    if (side('ant'))
      return { lines: ['La tengo grabada. Cuando la echo de menos, la escucho. Pero ya casi no hace falta.'], ex: ['happy'] };
    return null;
  },
};
function coralHelmet() {
  const H = HUMANS.oce;
  if (!H._helmet) H._helmet = H.head;
  H.head = null;
  H.hair = '#9A5A2A';
  H.hair_s = 'rizado';
  H.skin = '#E7B994';
  H.faceX = FX.all(FX.rosy, FX2.freckles());
  H.hold = HOLD2.helmet;
  H.neck = NECK.kerchief('#E0584A');
  delete DARK.oce;
}
/* Coral recuerda si ya se quitó la escafandra */
setTimeout(() => {
  if (side('oce')) coralHelmet();
}, 0);

{
  const d0 = PUZ.dialog.bind(PUZ);
  PUZ.dialog = function (id) {
    friend(id, 1);
    const q = Q[id];
    if (q) {
      const r = q();
      if (r) return r;
    }
    if (DLG2[id]) return dlg2(id);
    return d0(id);
  };
}
/* el mismo diálogo que se abrió: al cerrarlo, el minijuego (DLG.after lo lanza closeTalk) */

/* ── sellos 3–6 y el corazón ── */
Object.assign(PUZ.seal, { rel: () => sealOn(3), tea: () => sealOn(4), vol: () => sealOn(5), jar: () => sealOn(6) });
PUZ.seals = sealCount;
PUZ.chapter = () => {
  const n = sealCount();
  return n < 2 ? (QF().done ? 2 : 1) : Math.min(7, n + 1);
};
const allSeals = () => [3, 4, 5, 6].every(sealOn);
{
  const o0 = PUZ.open.bind(PUZ),
    l0 = PUZ.cellLocked,
    w0 = PUZ.why.bind(PUZ);
  PUZ.open = (a, b) => {
    if (a === 'cor' || b === 'cor') return FREE || !!QF().star;
    return o0(a, b);
  };
  PUZ.cellLocked = (id) => (id === 'cor' ? !(FREE || !!QF().star) : l0(id));
  PUZ.why = (a, b) => {
    if (a === 'cor' || b === 'cor') return `El corazón sigue sellado. Faltan ${6 - sealCount()} sellos.`;
    return w0(a, b);
  };
}
darkLevel = function (id) {
  const F = QF(),
    ch = CH_OF(id);
  if (FREE) return ch === 3 || ch === 9 ? 0.22 : 0.1;
  if (ch === 1 && F.done) return 0.1;
  if (ch === 2 && F.star) return 0.12;
  if (ch === 9) return allSeals() ? 0.3 : 0.6;
  if (ch === 3) {
    const n = clusterOf(id);
    return n && sealOn(n) ? 0.12 : mDone(id) ? 0.3 : 0.48;
  }
  return 0.52;
};

/* ── los finales ── */
function ending(k) {
  const F = QF();
  F.ending = k;
  F.ok = F.ok || {};
  F.ok.cor = 1;
  achieve('end' + k);
  stateChanged();
  wakeCheck();
  const tree = F.treeName || 'el árbol sin nombre',
    letter = F.letter ? [`Dejaste tu carta en su regazo: «${F.letter}»`] : [],
    pom = !!(F.madr && F.madr.pom),
    ecoUp = !!(PROG.F.ab && PROG.F.ab.fin);
  const E = {
    A: [
      'Final',
      'El tren de vuelta',
      [
        'Amaranta subió al tren nocturno con su billete de vuelta.',
        'Esta vez llevaba puesto su sombrero.',
        ...letter,
        ...(pom ? ['Pompón iba en su regazo.'] : []),
        'La colmena siguió latiendo sola. De vez en cuando llega una carta con su letra; ahora sí es suya.',
      ],
    ],
    B: [
      'Final',
      'Nuevo guardián',
      [
        'Te quedaste en el corazón de la colmena.',
        `Amaranta plantó un árbol nuevo junto al que nombraste: «${tree}».`,
        ...letter,
        ...(pom ? ['Pompón se durmió a tus pies.'] : []),
        'Ahora eres tú quien la escucha latir.',
      ],
    ],
    C: [
      'Final completo',
      'La colmena entera',
      [
        'Le contaste lo que habías descubierto, pieza a pieza.',
        ...(ecoUp
          ? [
              'Eco dio un paso adelante, ya sin transparencia.',
              '«Ya puedes despertar del todo», le dijo. «Yo me quedo con lo que olvidaste.»',
            ]
          : ['Abajo, alguien de papel sonrió.']),
        'Con cada verdad, una celda recuperó su color.',
        ...letter,
        'Amaranta se quedó. No por obligación: porque quiso.',
        'Abajo, las cartas, el andén y el reloj volvieron a su estante.',
        ...(pom ? ['Pompón se durmió entre los dos.'] : []),
        'La colmena florece entera.',
      ],
    ],
  }[k];
  Sound.sfx('seal');
  setTimeout(
    () =>
      showEnding(E[0], E[1], [...E[2], '— Colmena · gracias por jugar —'], () => {
        note('Puedes seguir paseando por la colmena.');
        updGoal();
      }),
    600,
  );
}

/* ── objetivo y pistas ── */
const ITEM_TO = {
  receta: 'coc',
  miel: 'coc',
  menta: 'coc',
  mieltibia: 'col',
  polen2: 'pri',
  luzfaro: 'jar',
  billete: 'cor',
  billete2: 'ver',
  cristal: 'vol',
  cera: 'vol',
  llave: 'cor',
  sombrero: 'ret',
  libro: 'cor',
  cartaT: 'ant',
  cartaL: 'tea',
  cartaC: 'oce',
  sopa: 'inv',
  boceto: 'oto',
  brasa: 'des',
  vidrio: 'far',
  agua: 'jar',
};
const MGOAL = {
  bib: () => ['Ordena la estantería de Tomo · Biblioteca', 'bib'],
  coc: () =>
    !bagHas('receta') && !mDone('bib')
      ? ['Busca la receta de Amaranta · pregunta a Tomo en la Biblioteca', 'bib']
      : !bagHas('miel')
        ? ['Coge un tarro de miel en el Colmenar', 'col']
        : !bagHas('menta')
          ? ['Coge una ramita de menta en el Colmenar', 'col']
          : ['Cocina con Miel · Cocina de miel', 'coc'],
  col: () =>
    bagHas('mieltibia') ? ['Lleva la miel tibia a Abril · Colmenar', 'col'] : ['Consigue algo tibio de la cocina de Miel', 'coc'],
  rel: () =>
    clues() < 3 ? ['Pregunta a Tomo, Miel y Abril por sus horas', 'bib'] : ['Pon en hora los relojes de Péndulo · Relojería', 'rel'],
  inn: () => [`Abre las flores de Luna sin mirarlas · ${Object.keys(QF().pollen || {}).length}/3`, 'inn'],
  far: () => ['Gira los espejos del faro de Albor · Faro', 'far'],
  tre: () => ['Pica estrellas en el tren de Estela · Tren nocturno', 'tre'],
  tea: () =>
    sils() < 3
      ? [`Consigue las siluetas para Telón · ${sils()}/3`, !(QF().sil || {}).polilla ? 'inn' : !(QF().sil || {}).faro ? 'far' : 'tre']
      : ['Representa la obra de Telón · Teatro de sombras', 'tea'],
  cum: () => ['Lanza la cometa con Nube · El Campanario', 'cum'],
  cue: () => ['Encuentra el cristal que late · Cueva de cristales', 'cue'],
  sot: () => ['Descubre las palabras de la cera con Vela · Sótano de cera', 'sot'],
  vol: () =>
    missing(['cristal', 'cera']).length
      ? ['Consigue un cristal que lata y cera para Ceniza', bagHas('cristal') ? 'sot' : 'cue']
      : ['Forja la llave con Ceniza · Volcán', 'vol'],
  dsv: () => ['Abre la caja de Trasto · Desván', 'dsv'],
  est: () => (QF().letters ? [`Reparte las cartas de Pluma · ${words()}/3`, 'est'] : ['Habla con Pluma · Estudio de Amaranta', 'est']),
  ret: () =>
    bagHas('sombrero')
      ? ['Lleva el sombrero de Amaranta a Marco · Sala de retratos', 'ret']
      : ['Busca algo de Amaranta para el retrato de Marco · pregunta a Estela en el Tren nocturno', 'tre'],
  jar: () =>
    missing(['agua', 'luzfaro']).length
      ? [`Consigue ${LJ(missing(['agua', 'luzfaro']))} para Rocío`, !bagHas('agua') ? 'pri' : 'far']
      : ['Pon nombre al árbol de Rocío · Jardín de los nombres', 'jar'],
};
const CL_NAME = { 3: 'La casa de Amaranta', 4: 'Los sueños', 5: 'Las raíces', 6: 'La memoria' };
function QGOAL() {
  const F = QF();
  QGOAL.cell = null;
  for (const it of [...PROG.bag.slice().reverse(), ...Object.keys(QF().relic || {}).filter((k) => k.startsWith('carta'))]) {
    const d = ITEM_TO[it];
    if (!d || (it === 'agua' && !mStep('jar'))) continue;
    if ((it === 'billete' || it === 'llave' || it === 'libro') && !allSeals()) continue;
    QGOAL.cell = d;
    return `Lleva ${ITEM_NAME[it]} a ${NPCN[d]} · ${SEASON[d].name}`;
  }
  if (allSeals() && !F.ending) {
    QGOAL.cell = 'cor';
    return missing(['llave', 'libro']).length
      ? `Baja al corazón con ${LJ(missing(['llave', 'libro']))}`
      : 'Baja al corazón de la colmena · desde el Estudio de Amaranta';
  }
  const order = [3, 4, 5, 6]
    .filter((n) => !sealOn(n))
    .sort((a, b) => CLUSTER[b].filter(mDone).length - CLUSTER[a].filter(mDone).length || a - b);
  for (const n of order)
    for (const id of CLUSTER[n]) {
      if (mDone(id)) continue;
      if (!mStep(id)) {
        QGOAL.cell = id;
        return `Habla con ${NPCN[id]} · ${SEASON[id].name}`;
      }
      const [t, c] = MGOAL[id]();
      QGOAL.cell = c;
      return t;
    }
  for (const id of ['pri', 'ver', 'oto', 'inv', 'esp', 'oce', 'des', 'ant'])
    if (!side(id) && Q[id] && Q[id]()) {
      QGOAL.cell = id;
      return `Visita a ${NPCN[id]} · ${SEASON[id].name}`;
    }
  return F.ending ? 'La colmena late. Pasea por las celdas a tu aire.' : 'Enciende los sellos que faltan';
}
{
  const g0 = PUZ.goal.bind(PUZ);
  PUZ.goal = function () {
    QGOAL.cell = null;
    if (!QF().star || FREE) return g0();
    return QGOAL();
  };
}
const HINT2 = {
  bib: 'Tomo: «Rojo con rojo, verde con verde, azul con azul. Una balda para cada color.»',
  coc: 'Miel: «La tarjeta dice el orden. Yo solo sé remover.»',
  col: 'Abril: «Las abejas vuelan al compás del latido. Espera el círculo y toca.»',
  rel: 'Péndulo: «Nueve, doce, seis… y la hora en que se pararon todos: las cuatro menos cuarto.»',
  inn: 'Luna: «Si la flor está delante de ti, te ve. Ponla a tu espalda.»',
  far: 'Albor: «Cada espejo gira la luz un cuarto de vuelta. Sigue el rayo con el dedo.»',
  tre: 'Estela: «No persigas la estrella. Espérala en el aro.»',
  tea: 'Telón: «Estela vio salir el tren con su sombrero… pero Nube y Vela dicen que ella se quedó.»',
  cum: 'Nube: «Las banderolas apuntan hacia donde va el viento, no de donde viene.»',
  cue: 'Geoda: «Mira el hexágono de arriba. Cuando late, el cristal bueno late con él.»',
  sot: 'Vela: «Calienta cada placa hasta que brille. Luego lee como leería ella: de principio a fin.»',
  vol: 'Ceniza: «El fuelle, hasta la franja clara. El martillo, cuando la chispa esté en el centro.»',
  dsv: 'Trasto: «Cada hexágono del candado es una celda. Los puntos que viste al latir la colmena son los números.»',
  est: 'Pluma: «Cada carta tiene su dueño. Cada dueño, su palabra.»',
  ret: 'Marco: «Pon en la silla lo que más la recuerde. Su sombrero, sobre todo.»',
  jar: 'Rocío: «Agua de la lluvia de Primavera. Luz del faro de Albor. Y un nombre que te guste.»',
  cor: 'Amaranta: «El libro sin título y la llave. Lo demás ya lo tienes.»',
};
function QHINT() {
  const c = QGOAL.cell || goalCell(PUZ.goal());
  return c && HINT2[c] ? HINT2[c] : null;
}
{
  const h0 = NARR.hint;
  NARR.hint = function () {
    if (!QF().star || FREE) return h0();
    const g = PUZ.goal(),
      c = QGOAL.cell;
    return c ? ['q:' + g, HINT2[c] || g] : h0();
  };
}
const MSHORT = {
  bib: 'Ordenar la estantería',
  coc: 'Terminar la receta de Amaranta',
  col: 'Que salgan las abejas',
  rel: 'Poner en hora los relojes',
  inn: 'Abrir las flores sin mirarlas',
  far: 'Girar los espejos del faro',
  tre: 'Picar estrellas en el tren',
  tea: 'Terminar la obra de sombras',
  cum: 'Leer el viento con la cometa',
  cue: 'Encontrar el cristal que late',
  sot: 'Leer la cera',
  vol: 'Forjar la llave del corazón',
  dsv: 'Abrir la caja',
  est: 'Repartir tres cartas',
  ret: 'Pintar a Amaranta',
  jar: 'Poner nombre al árbol',
  pri: 'Sol para el cerezo',
  ver: 'Algo frío para la limonada',
  oto: 'Agua para la tinta',
  inv: 'Hielo para Verano',
  esp: 'Una lente nueva',
  oce: 'Luz para el fondo del mar',
  des: 'Una perla para pulir',
  ant: 'Llevar la aurora',
  cor: 'Despertar',
};
const SSHORT = {
  pri: 'Polen de luna para el cerezo',
  ver: 'Un billete de tren',
  oto: 'Un boceto de Marco',
  inv: 'Sopa caliente de Miel',
  esp: 'Unir las estrellas',
  oce: 'Una carta de Amaranta',
  des: 'Una brasa de la forja',
  ant: 'Sintonizar la radio',
};
function QSTAT(id) {
  const F = QF(),
    early = ['pri', 'ver', 'oto', 'inv', 'esp', 'oce', 'des', 'ant'].includes(id),
    main = early ? AWAKE[id]() : mDone(id);
  if (id === 'cor')
    return F.ending
      ? { text: 'Despierta', done: true }
      : { text: allSeals() ? 'Te espera en el corazón' : 'Duerme en el corazón', ask: allSeals() };
  if (!main) return { text: 'Te pidió: ' + MSHORT[id], ask: true };
  if (early) {
    if (side(id)) return { text: 'Favor hecho: ' + SSHORT[id], done: true };
    const asked = {
      pri: F.askPolen,
      ver: F.askTicket,
      oto: F.askSketch,
      inv: F.askSoup,
      esp: F.star && (sealOn(3) || sealOn(4)),
      oce: F.letters,
      des: F.askBrasa,
      ant: F.letters,
    }[id];
    return asked ? { text: 'Te pidió: ' + SSHORT[id], ask: true } : { text: 'Hecho: ' + MSHORT[id], done: true };
  }
  return { text: 'Hecho: ' + MSHORT[id], done: true };
}

/* ── cuando cambia algo: despertar celdas y revisar logros ── */
function achTick() {
  const F = QF();
  if (F.done) achieve('s1');
  if (F.star) achieve('s2');
  if (Object.keys(F.pages || {}).length >= 7) achieve('pages');
  if (Object.keys(F.glyphs || {}).length >= 6) achieve('glyphs');
  for (const id of ['pri', 'ver', 'oto', 'inv', 'esp', 'oce', 'des', 'ant']) if (AWAKE[id]()) friend(id, 2);
}
{
  const sc0 = stateChanged;
  stateChanged = function () {
    sc0();
    wakeCheck();
    achTick();
  };
}
