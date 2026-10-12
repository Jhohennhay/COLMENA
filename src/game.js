'use strict';
/*@@I18N@@*/
/* prueba «islas» (window.COLMENA_ISLAS): cuartos separados, viajes entre ellos y pantalla limpia. Ver src/modulos/islas.js */
const ISLAS = !!window.COLMENA_ISLAS;
const CFG = { TH: 24, LIP: 14, BASE: 26, KEY: 'colmena' };
/* ══════════ NÚCLEO COMPARTIDO · geometría del panal ══════════ */
const cv = document.getElementById('cv'),
  ctx = cv.getContext('2d');
const COARSE = matchMedia('(pointer:coarse)').matches;
let STILL = matchMedia('(prefers-reduced-motion: reduce)').matches;
try {
  if (localStorage.getItem('colmena-calma') === '1') STILL = true;
} catch (e) {}
const TAU = Math.PI * 2,
  lerp = (a, b, t) => a + (b - a) * t,
  clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}
const rd = (R, a, b) => a + R() * (b - a),
  pick = (R, a) => a[Math.floor(R() * a.length)];
const R = 300,
  HW = 130,
  K = 0.58,
  TH = CFG.TH,
  LIP = CFG.LIP,
  BASE = CFG.BASE;
const hexV = (r, cx = 0, cy = 0) =>
  [0, 1, 2, 3, 4, 5].map((k) => [cx + r * Math.cos((k * Math.PI) / 3), cy + r * Math.sin((k * Math.PI) / 3)]);
const VI = hexV(R),
  VO = hexV(R + TH);
const hexPts = (c, r, s, rot = 0) => {
  const o = [];
  for (let k = 0; k < 6; k++) {
    const a = rot + (k * Math.PI) / 3;
    o.push([c[0] + Math.cos(a) * r * s, c[1] + Math.sin(a) * r * s]);
  }
  return o;
};
const BACK = [
    [3, 4],
    [4, 5],
    [5, 0],
  ],
  FRONT = [
    [0, 1],
    [1, 2],
    [2, 3],
  ];
const EDGE_OF = { '1,0': [0, 1], '1,-1': [5, 0], '0,-1': [4, 5], '-1,0': [3, 4], '-1,1': [2, 3], '0,1': [1, 2] };
const isBack = (e) => BACK.some((b) => b[0] === e[0] && b[1] === e[1]);
function wallPt(e, u, z, inw = 0) {
  const A = VI[e[0]],
    B = VI[e[1]],
    mx = (A[0] + B[0]) / 2,
    my = (A[1] + B[1]) / 2,
    L = Math.hypot(mx, my);
  return [lerp(A[0], B[0], u) - (mx / L) * inw, lerp(A[1], B[1], u) - (my / L) * inw, z];
}
const RC = R + TH + (CFG.GAP || 18);
const cellCenter = (q, r) => [1.5 * RC * q, Math.sqrt(3) * RC * (r + q / 2)];
const signPos = (q, r) => {
  const c = cellCenter(q, r);
  return [c[0] * 0.72, c[1] * 0.72];
};
/* el panal: Primavera en el centro y las otras tres alrededor, en ciclo */
const ORDER = [
  'pri',
  'ver',
  'oto',
  'inv',
  'esp',
  'oce',
  'des',
  'ant',
  'col',
  'bib',
  'coc',
  'rel',
  'inn',
  'tea',
  'far',
  'tre',
  'sot',
  'cue',
  'vol',
  'cum',
  'dsv',
  'est',
  'ret',
  'jar',
  'cor',
];
/* el archipiélago: racimos de celdas pegadas, separados por el vacío y unidos por caminos */
const POS = {
  pri: [0, 0],
  ver: [1, -1],
  oto: [1, 0],
  inv: [0, 1],
  col: [-2, 0],
  bib: [-2, -1],
  coc: [-3, 0],
  rel: [-3, -1],
  oce: [0, -2],
  esp: [3, -3],
  tea: [3, -5],
  inn: [2, -5],
  far: [3, -6],
  tre: [4, -6],
  des: [3, -1],
  sot: [1, 2],
  cue: [2, 1],
  vol: [2, 2],
  cum: [3, 1],
  dsv: [-2, 3],
  ret: [-3, 3],
  jar: [-3, 4],
  est: [-2, 4],
  ant: [0, 4],
  cor: [-2, 6],
};
/* qué celdas vecinas se comunican con una puerta */
const LINKS = [
  ['pri', 'ver'],
  ['pri', 'oto'],
  ['pri', 'inv'],
  ['ver', 'oto'],
  ['oto', 'inv'],
  ['pri', 'col'],
  ['col', 'bib'],
  ['col', 'coc'],
  ['bib', 'rel'],
  ['coc', 'rel'],
  ['pri', 'oce'],
  ['ver', 'esp'],
  ['esp', 'tea'],
  ['tea', 'inn'],
  ['tea', 'far'],
  ['tea', 'tre'],
  ['ver', 'des'],
  ['oto', 'sot'],
  ['sot', 'cue'],
  ['sot', 'vol'],
  ['cue', 'cum'],
  ['inv', 'dsv'],
  ['dsv', 'ret'],
  ['dsv', 'est'],
  ['ret', 'jar'],
  ['inv', 'ant'],
  ['est', 'cor'],
];
const linked = (a, b) => LINKS.some((l) => (l[0] === a && l[1] === b) || (l[0] === b && l[1] === a));
/* rectángulo que contiene una puerta cortada en el borde delantero */
const DOOR_W = 0.13;
/* ══════════ AVATAR DEL JUGADOR ══════════
   Rasgos estándar. Cuando exista la pantalla de personalización,
   bastará con cambiar estos valores (o cargarlos del guardado). */
const AVATAR = {
  skin: '#D9A07E',
  hairStyle: 'corto',
  hair: '#3B2A22' /* piel y pelo */,
  top: '#F2EADB',
  bottom: '#5B4A3A',
  shoes: '#6A4A30' /* túnica, pantalón, botas */,
  cape: '#2F5E9E',
  capePattern: 'liso' /* capa: el azul es el color del jugador */,
  accessory: 'bufanda',
  accent: '#E4A844' /* accesorio y su color */,
};
try {
  const saved = JSON.parse(localStorage.getItem('colmena-avatar') || 'null');
  if (saved) Object.assign(AVATAR, saved);
} catch (e) {}
/* ══════════ LA HISTORIA ══════════
   Capítulo 1 · El primer sello       (Primavera, Verano, Otoño, Invierno)
   Capítulo 2 · Más allá de la colmena (Espacio, Océano, Desierto, Antártida)
   B: llevar elementos · C: cadena de favores · A: puentes que giran          */
const PROG = { F: {}, bag: [] };
const BAGMAX = 3;
/* la mochila: hasta tres cosas. «hand» es la última que cogiste (la que se ve en tu mano) */
Object.defineProperty(PROG, 'hand', {
  get() {
    return this.bag.length ? this.bag[this.bag.length - 1] : null;
  },
  set(v) {
    if (v == null) this.bag.pop();
    else if (!this.bag.includes(v)) {
      this.bag.push(v);
      if (this.bag.length > BAGMAX) this.bag.shift();
    }
  },
});
/* las reliquias (lo que se lleva al corazón) no ocupan sitio en la mochila */
const RELICS = ['billete', 'llave', 'libro', 'cartaT', 'cartaL', 'cartaC'],
  isRelic = (i) => RELICS.includes(i),
  relics = () => PROG.F.relic || (PROG.F.relic = {});
const bagHas = (i) => (isRelic(i) ? !!relics()[i] : PROG.bag.includes(i)),
  bagGive = (i) => {
    if (isRelic(i)) {
      relics()[i] = 1;
      return;
    }
    if (!PROG.bag.includes(i)) PROG.bag.push(i);
  },
  bagTake = (i) => {
    if (isRelic(i)) {
      delete relics()[i];
      return;
    }
    const k = PROG.bag.indexOf(i);
    if (k >= 0) PROG.bag.splice(k, 1);
  },
  bagFull = () => PROG.bag.length >= BAGMAX;
const ITEM_NAME = {
  agua: 'agua de lluvia',
  hielo: 'hielo',
  sol: 'sol en frasco',
  lente: 'una lente',
  perla: 'una perla',
  aurora: 'luz de aurora',
};
const NEW_CELLS = ['esp', 'oce', 'des', 'ant'];
/* puentes que giran: dónde está su manivela y qué hace falta para usarla */
const BRIDGES = {
  'inv-oto': {
    flag: 'bridge',
    cell: 'oto',
    to: 'inv',
    x: -150,
    y: 176,
    label: ['Manivela atascada', 'Girar la manivela'],
    needs: () => !!PROG.F.inkFixed,
    stuck: 'Está atascada con tinta seca. Habla con Ocre.',
    done: 'El puente ya apunta a Invierno.',
  },
  'ant-inv': {
    flag: 'floe',
    cell: 'inv',
    to: 'ant',
    x: 150,
    y: 190,
    label: ['Rueda helada', 'Girar la rueda del témpano'],
    needs: () => !!PROG.F.done,
    stuck: 'La rueda está helada. La colmena todavía duerme.',
    done: 'El témpano ya apunta a la Antártida.',
  },
};
/* ══════════ CAPÍTULO 3 · Las celdas dormidas ══════════
   Tras el segundo sello se abren dieciséis celdas. Cada vecino guarda un pedazo de Amaranta.
   first: al conocerle · again: las veces siguientes (rotan). Los sellos 3–6 llegan en la próxima entrega. */
const LATE = ['col', 'bib', 'coc', 'rel', 'tea', 'inn', 'far', 'tre', 'sot', 'cue', 'vol', 'cum', 'dsv', 'est', 'ret', 'jar'];
let FREE = false;
const DLG2 = {
  col: {
    first: [
      '¿Tú también la buscas? Soy Abril. Amaranta me dejó a cargo de las colmenas pequeñas…',
      '…y de ninguna instrucción. Las abejas no salen: esperan a que el corazón vuelva a latir.',
      'Ella decía que una colmena no se manda. Se escucha.',
    ],
    again: [['Mira cómo se asoman. Saben que alguien ha encendido sellos.'], ['El humo las calma. A mí me calma el ruido que hacen.']],
  },
  bib: {
    first: [
      'Silencio, por favor… ah, eres tú. Soy Tomo.',
      'Aquí está todo lo que Amaranta leyó. Y lo que no se atrevió a leer.',
      'Falta un libro. Uno sin título, con tapas de cera. Lo escribió ella.',
    ],
    again: [
      ['Los libros también duermen cuando la colmena se para. Algunos roncan.'],
      ['Si encuentras un libro sin título, tráemelo. No lo abras.'],
    ],
  },
  coc: {
    first: [
      '¡Por fin una cara con hambre! Soy Miel.',
      'Amaranta comía de pie, siempre con prisa. Yo le guardaba un plato caliente cada noche.',
      'El plato sigue en el horno. No he tenido valor de sacarlo.',
    ],
    again: [['La sopa no se enfría. Aquí nada se enfría desde que se fue.'], ['Cocinar para alguien es una forma de esperarle.']],
  },
  rel: {
    first: [
      'Tic… tac… perdona, cuento por costumbre. Soy Péndulo.',
      'Todos los relojes se pararon a la misma hora: las cuatro menos cuarto.',
      'La hora exacta en que Amaranta cerró el corazón.',
    ],
    again: [
      ['Un reloj parado acierta dos veces al día. Estos, ni eso.'],
      ['Cuando vuelva a latir la colmena, les daré cuerda a todos a la vez.'],
    ],
  },
  tea: {
    first: [
      '¡Público! ¡Hacía siglos! Soy Telón, a su servicio.',
      '¿Sabías que Amaranta nos recortó a todos de papel? A mí me salió el sombrero un poco torcido.',
      'Yo le devuelvo el favor con títeres. El de hoy es ella. Todavía no sé cómo termina.',
    ],
    again: [
      ['Toda función necesita un final. Esta se ha quedado a oscuras en el segundo acto.'],
      ['Aplaude si quieres. Los títeres lo agradecen.'],
    ],
  },
  inn: {
    first: [
      'Shh… no las mires fijamente. Soy Luna.',
      'Las plantas de noche solo abren cuando nadie las mira.',
      'Amaranta venía aquí a no mirarlas. Decía que era su forma de descansar.',
    ],
    again: [['Esa flor abrió anoche. Sin testigos, como le gusta.'], ['El invernadero guarda el calor de las cosas que ya no están.']],
  },
  far: {
    first: [
      '¡Ah del panal! Soy Albor, el farero.',
      'Este faro alumbra hacia dentro. Así nadie se pierde en la colmena.',
      'La última noche la luz se desvió sola. Apuntó abajo, al corazón, y se quedó ahí.',
    ],
    again: [['Un faro no busca barcos. Les dice dónde está la orilla.'], ['Desde aquí arriba se ve la luz de cada sello. Ya van dos.']],
  },
  tre: {
    first: [
      '¡Billetes, por favor! Ah, no, no hay tren. Soy Estela.',
      'El último salió de esta estación con un solo pasajero. Llevaba un sombrero con velo.',
      'Su billete decía: «Ayer. Solo ida».',
    ],
    again: [['Las vías siguen calientes. Eso significa algo.'], ['Cuando vuelva el tren, pitaré tan fuerte que se oirá en la Antártida.']],
  },
  sot: {
    first: [
      'Cuidado con la vela, que es la última. Soy Vela.',
      'Aquí abajo se guarda la cera vieja de la colmena.',
      'Amaranta bajaba de noche a fundir cartas sin enviar. Decía que así la cera aprendía a decir cosas.',
    ],
    again: [
      ['Esta cera de aquí está hecha de «perdón». Huele un poco a limón.'],
      ['No hay prisa en un sótano. Por eso aquí se guarda lo importante.'],
    ],
  },
  cue: {
    first: [
      '¡Mira dónde pisas! Esos cristales tardaron mil años. Soy Geoda.',
      'Las piedras crecen muy despacio. Como las ganas de decir algo.',
      'Amaranta me pidió un cristal que latiera. Todavía lo estoy buscando.',
    ],
    again: [['Toca esa geoda. ¿Notas el pulso? Es la colmena, muy lejos.'], ['En la cueva el tiempo no se para. Solo va más despacio.']],
  },
  vol: {
    first: [
      '¡Atrás, que salta! Soy Ceniza, la herrera.',
      'La forja se apagó con la colmena. Pero antes forjé una llave para Amaranta.',
      'Una llave para el corazón. Me la pidió… y luego me pidió que la olvidara.',
    ],
    again: [['El fuego no se apaga del todo. Se esconde.'], ['Martillo, yunque, paciencia. Así se hace todo.']],
  },
  cum: {
    first: [
      '¡Uf! Qué subida. Soy Nube.',
      'Desde la cumbre se ven las veinticinco celdas. Una late distinto: la de abajo del todo.',
      'Amaranta subía a mirarla. Nunca bajó a abrirla hasta esa noche.',
    ],
    again: [['Aquí arriba el viento trae noticias de todas las celdas.'], ['Si te pierdes, sube. Desde arriba todo tiene sentido.']],
  },
  dsv: {
    first: [
      '¿Buscas algo? Seguro que está aquí. Soy Trasto.',
      'Todo lo que nadie quiere acaba en el desván. Hasta los recuerdos.',
      'Amaranta subió una caja la última noche. Dijo «para cuando esté lista». No la he abierto.',
    ],
    again: [
      ['Guardar no es lo mismo que olvidar. Es darle tiempo a las cosas.'],
      ['Esa caja de ahí pesa como si dentro hubiera un año entero.'],
    ],
  },
  est: {
    first: [
      'Un momento, que termino la frase… Ya. Soy Pluma.',
      'Amaranta me dictaba sus cartas. Nunca las firmaba.',
      'Decía que la firma la ponía quien las leía. Mira el mapa: cada celda es una carta suya.',
    ],
    again: [['Una carta sin enviar sigue siendo una carta. Solo que más paciente.'], ['He marcado en el mapa las celdas que ya laten.']],
  },
  ret: {
    first: [
      '¡Quieto! Así, con esa luz… Soy Marco.',
      'Pinto a todos los de la colmena. A Amaranta nunca pude: no se quedaba quieta el tiempo suficiente.',
      'Ese marco vacío es para ella. Cuando vuelva, se sentará. Me lo prometió.',
    ],
    again: [
      ['Un retrato no copia una cara. Copia cómo la mira alguien.'],
      ['Te he pintado de espaldas. Es como siempre te veo: yendo a algún sitio.'],
    ],
  },
  jar: {
    first: [
      'Bienvenida, bienvenido. Soy Rocío.',
      'Cada árbol del jardín lleva el nombre de alguien que cuidó esta colmena.',
      'Hay uno sin nombre todavía. Amaranta lo plantó la última tarde. Creo que es para quien la despierte.',
    ],
    again: [['Los nombres se leen mejor con las manos.'], ['Ese árbol sin nombre ha echado una hoja nueva. Justo hoy.']],
  },
  cor: {
    first: ['(Amaranta duerme sentada, con el cuaderno abierto sobre las rodillas.)', '(La última página está en blanco.)'],
    again: [['(Respira despacio, al compás de la colmena.)']],
  },
};
function dlg2(id) {
  const F = PROG.F,
    D = DLG2[id];
  F.met = F.met || {};
  if (!F.met[id])
    return {
      lines: D.first,
      ex: D.first.map((_, i) => ['smile', 'open', 'neutral'][i % 3]),
      fx: () => {
        F.met[id] = 1;
      },
    };
  F.talk2 = F.talk2 || {};
  const i = (F.talk2[id] || 0) % D.again.length;
  return {
    lines: D.again[i],
    ex: ['smile'],
    fx: () => {
      F.talk2[id] = (F.talk2[id] || 0) + 1;
    },
  };
}
/* recorrido libre: todas las puertas abiertas, nada se guarda */
const FREE_F = {
  done: 1,
  star: 1,
  bloom: 1,
  melted: 1,
  bridge: 1,
  floe: 1,
  inkFixed: 1,
  askSun: 1,
  gotSun: 1,
  askIce: 1,
  askWater: 1,
  tookWater: 1,
  tookIce: 1,
  askLens: 1,
  gotLens: 1,
  askPearl: 1,
  gotPearl: 1,
  askAurora: 1,
  gotAurora: 1,
  nl: { pro: 1 },
};
const PUZ = {
  open(a, b) {
    const k = [a, b].sort().join('-'),
      F = PROG.F;
    if (FREE) return true;
    if (a === 'cor' || b === 'cor') return false;
    if ((LATE.includes(a) || LATE.includes(b)) && !F.star) return false;
    if ((NEW_CELLS.includes(a) || NEW_CELLS.includes(b)) && !F.done) return false;
    if (k === 'inv-pri') return !!F.melted;
    if (BRIDGES[k]) return !!F[BRIDGES[k].flag];
    return true;
  },
  dyn: (a, b) => {
    const k = [a, b].sort().join('-');
    return !!BRIDGES[k] && BRIDGES[k].cell === a;
  },
  cellLocked: (id) => !FREE && ((NEW_CELLS.includes(id) && !PROG.F.done) || (LATE.includes(id) && !PROG.F.star) || id === 'cor'),
  why(a, b) {
    const k = [a, b].sort().join('-'),
      F = PROG.F;
    if (a === 'cor' || b === 'cor') return 'El corazón sigue sellado. Faltan sellos.';
    if ((LATE.includes(a) || LATE.includes(b)) && !F.star)
      return F.done ? 'Sellado. Hace falta el segundo sello.' : 'Sellado. La colmena todavía duerme.';
    if ((NEW_CELLS.includes(a) || NEW_CELLS.includes(b)) && !F.done) return 'Sellado. La colmena todavía duerme.';
    if (k === 'inv-pri') return 'El paso está congelado. Quizá con calor…';
    if (BRIDGES[k]) {
      const B = BRIDGES[k];
      return B.needs() ? 'Está girado. Usa la ' + (B.cell === 'oto' ? 'manivela.' : 'rueda del témpano.') : B.stuck;
    }
    return '';
  },
  chapter: () => (PROG.F.star ? 3 : PROG.F.done ? 2 : 1),
  seals: () => (PROG.F.done ? 1 : 0) + (PROG.F.star ? 1 : 0),
  goal() {
    const F = PROG.F,
      h = PROG.hand;
    if (F.done) {
      if (FREE) return 'Recorrido libre · todas las puertas abiertas';
      if (F.star) {
        const m = LATE.filter((id) => F.met && F.met[id]).length;
        return m < LATE.length
          ? `Conoce a los vecinos de las celdas nuevas · ${m}/${LATE.length}`
          : 'Los sellos 3 a 6 llegarán pronto. El corazón sigue cerrado.';
      }
      if (bagHas('lente')) return 'Coloca la lente en el telescopio de Orión · Espacio';
      if (bagHas('perla')) return 'Lleva la perla a Duna · Desierto';
      if (bagHas('aurora')) return 'Lleva la aurora a Coral · Océano';
      if (F.askAurora) return F.floe ? 'Consigue luz de aurora en la Antártida' : 'Gira la rueda del témpano en Invierno';
      if (F.askPearl) return 'Consigue una perla en el Océano';
      if (F.askLens) return 'Pide una lente a Duna · Desierto';
      return 'Habla con Orión en el Espacio · se llega desde Verano';
    }
    if (bagHas('sol')) return 'Lleva el sol al cerezo de Brote · Primavera';
    if (bagHas('hielo')) return 'Lleva el hielo a Solano · Verano';
    if (F.bridge) return 'Consigue hielo en Invierno';
    if (F.inkFixed) return 'Gira la manivela del puente · Otoño';
    if (bagHas('agua')) return 'Lleva el agua de lluvia a Ocre · Otoño';
    if (F.askWater) return 'Consigue agua de lluvia en Primavera';
    if (F.askIce) return 'Busca la forma de llegar a Invierno';
    if (F.askSun) return 'Consigue sol para el cerezo de Brote';
    return 'Habla con Brote';
  },
  dialog(id) {
    const F = PROG.F,
      h = PROG.hand;
    if (DLG2[id]) return dlg2(id);
    if (id === 'pri') {
      if (F.done && !F.star)
        return {
          lines: [
            '¡Mira cómo florece! La colmena vuelve a latir.',
            'Se abrieron celdas nuevas. Orión, el astrónomo, busca algo en el cielo. Se llega desde Verano.',
          ],
          ex: ['happy', 'smile'],
        };
      if (F.done)
        return {
          lines: [
            'Dos sellos. Se abrieron celdas por todo el panal.',
            'La casa de Amaranta está detrás de mi pared: su colmenar, su biblioteca, su cocina…',
          ],
          ex: ['happy', 'smile'],
        };
      if (bagHas('sol')) return { lines: ['¡Sol de verdad! Ponlo junto al cerezo, por favor.'], ex: ['open'] };
      if (F.askSun) return { lines: ['¿Conseguiste el sol? Solano vive en la terraza de Verano.'], ex: ['smile'] };
      return {
        lines: [
          'Amaranta se fue anoche y la colmena se quedó quieta. Cada estación, atrapada en su celda.',
          'Mi cerezo no florece sin un poco de sol del verano. ¿Me lo consigues?',
          'Solano vive en la celda de al lado. Suele tener sol de sobra.',
        ],
        ex: ['neutral', 'open', 'smile'],
        fx: () => {
          F.askSun = 1;
        },
      };
    }
    if (id === 'ver') {
      if (bagHas('hielo'))
        return {
          lines: ['¡Hielo! Justo lo que le faltaba a mi limonada.', 'Te lo cambio por este sol en frasco. Cuidado, que calienta.'],
          ex: ['open', 'happy'],
          fx: () => {
            bagTake('hielo');
            bagGive('sol');
            F.gotSun = 1;
          },
        };
      if (F.gotSun) return { lines: ['Ahhh… limonada fría. Ahora sí, la siesta perfecta.'], ex: ['happy'] };
      if (F.askSun)
        return {
          lines: [
            'Mmm… ¿sol? Tengo de sobra, pero no lo regalo.',
            'Te lo cambio por algo frío: mi limonada está tibia. En Invierno hay hielo.',
          ],
          ex: ['neutral', 'smile'],
          fx: () => {
            F.askIce = 1;
          },
        };
      return { lines: ['Mmm… estoy en plena siesta. Vuelve más tarde.'], ex: ['neutral'] };
    }
    if (id === 'oto') {
      if (bagHas('agua'))
        return {
          lines: [
            '¡Agua de lluvia! Mi tinta estaba seca como una hoja vieja.',
            'Listo. Usa la manivela junto al puente: lo gira hacia Invierno.',
          ],
          ex: ['open', 'happy'],
          fx: () => {
            bagTake('agua');
            F.inkFixed = 1;
          },
        };
      if (F.inkFixed) return { lines: ['La manivela junto al puente gira el paso hacia Invierno.'], ex: ['smile'] };
      return {
        lines: [
          'El puente hacia Invierno está girado, y la manivela se atascó con tinta seca.',
          'Si me traes agua de lluvia, lo arreglamos. En Primavera siempre llueve.',
        ],
        ex: ['neutral', 'smile'],
        fx: () => {
          F.askWater = 1;
        },
      };
    }
    if (id === 'inv') {
      if (F.done && !F.floe)
        return {
          lines: [
            '¿Oyes crujir el hielo? La colmena despierta.',
            'Esa rueda de ahí gira el témpano hacia la Antártida. Ahora ya se mueve.',
          ],
          ex: ['open', 'smile'],
        };
      if (F.gotSun || bagHas('hielo')) return { lines: ['Ese hielo no durará para siempre, pero sí lo suficiente.'], ex: ['smile'] };
      return {
        lines: [
          'Por fin alguien cruza el puente. Aquí el frío se ha quedado quieto.',
          'Si necesitas hielo, ahí delante hay un buen trozo. A mí me sobra.',
          'Tejo una vuelta por cada día que Amaranta falta. Ya no cabe en el cuarto.',
        ],
        ex: ['smile', 'happy', 'neutral'],
      };
    }
    if (id === 'esp') {
      if (F.star)
        return {
          lines: [
            'Ahí está: la estrella perdida. Su luz enciende el segundo sello.',
            'Desde aquí veo dieciséis celdas despertando. Y una, abajo del todo, que sigue a oscuras: el corazón.',
          ],
          ex: ['happy', 'smile'],
        };
      if (bagHas('lente')) return { lines: ['¡Una lente nueva! Colócala en el telescopio, por favor.'], ex: ['open'] };
      if (F.askLens) return { lines: ['Duna sabe fundir arena en vidrio. Vive en el desierto, al otro lado de Verano.'], ex: ['smile'] };
      return {
        lines: [
          'Buenas noches… aunque aquí siempre es de noche.',
          'Busco una estrella que se perdió cuando la colmena se detuvo. Sin ella no se enciende el segundo sello.',
          'Pero la lente de mi telescopio se rajó. Duna, en el desierto, podría hacerme otra.',
        ],
        ex: ['neutral', 'open', 'smile'],
        fx: () => {
          F.askLens = 1;
        },
      };
    }
    if (id === 'des') {
      if (bagHas('perla'))
        return {
          lines: ['¡Una perla! Perfecta para pulir el vidrio.', 'Toma: una lente redonda como una luna. Orión la estaba esperando.'],
          ex: ['open', 'happy'],
          fx: () => {
            bagTake('perla');
            bagGive('lente');
            F.gotLens = 1;
          },
        };
      if (F.gotLens) return { lines: ['El desierto guarda el calor del día para toda la noche.'], ex: ['smile'] };
      if (F.askLens)
        return {
          lines: [
            '¿Una lente para Orión? La fundo con arena y sol, pero necesito una perla para pulirla.',
            'Coral, en el océano, guarda perlas. Su celda está junto a Primavera.',
          ],
          ex: ['neutral', 'smile'],
          fx: () => {
            F.askPearl = 1;
          },
        };
      return { lines: ['Arena, sol y silencio. Aquí el tiempo se derrite despacio.'], ex: ['smile'] };
    }
    if (id === 'oce') {
      if (bagHas('aurora'))
        return {
          lines: ['¡Luz de aurora! El fondo del mar vuelve a brillar.', 'Ten esta perla. La guardaba para quien trajera luz.'],
          ex: ['open', 'happy'],
          fx: () => {
            bagTake('aurora');
            bagGive('perla');
            F.gotPearl = 1;
          },
        };
      if (F.gotPearl) return { lines: ['Mira cómo bailan los peces con la aurora.'], ex: ['happy'] };
      if (F.askPearl)
        return {
          lines: [
            '¿Una perla? Te la cambio por luz: el fondo del mar se quedó a oscuras.',
            'Dicen que en la Antártida el cielo se enciende de colores. Se llega desde el Desierto o el Océano.',
          ],
          ex: ['neutral', 'smile'],
          fx: () => {
            F.askAurora = 1;
          },
        };
      return { lines: ['Blub… Las corrientes se detuvieron con la colmena. Qué quietud tan rara.'], ex: ['neutral'] };
    }
    if (id === 'ant') {
      if (F.gotAurora || bagHas('aurora')) return { lines: ['Cuida esa luz. Se apaga si la miras demasiado.'], ex: ['smile'] };
      if (bagFull()) return { lines: ['¡Llegaste! Pero traes la mochila llena. Vuelve cuando te quepa algo.'], ex: ['open'] };
      return {
        lines: [
          '¡Llegaste! Aquí el cielo se enciende de colores por la noche.',
          'Llévate un poco de aurora en este frasco. A mí me sobra cielo.',
          'Si ves a Amaranta, dile que sigo escribiéndole. Cada noche.',
        ],
        ex: ['open', 'happy', 'smile'],
        fx: () => {
          bagGive('aurora');
          F.gotAurora = 1;
        },
      };
    }
    return { lines: ['…'], ex: ['smile'] };
  },
  want(id) {
    const F = PROG.F;
    if (id === 'pri') return F.bloom ? null : 'sol';
    if (id === 'ver') return F.askSun && !F.gotSun ? 'hielo' : null;
    if (id === 'oto') return F.inkFixed ? null : 'agua';
    if (id === 'esp') return F.done && !F.star ? 'lente' : null;
    if (id === 'des') return F.askLens && !F.gotLens ? 'perla' : null;
    if (id === 'oce') return F.askPearl && !F.gotPearl ? 'aurora' : null;
    return null;
  },
  seal: { pri: () => !!PROG.F.done, esp: () => !!PROG.F.star },
  things: {
    pri: [
      {
        id: 'agua',
        x: -110,
        y: 95,
        z: 46,
        r: 80,
        ax: -60,
        ay: 120,
        item: 'agua',
        label: () => 'Recoger agua de lluvia',
        show: () => !PROG.F.tookWater,
      },
      {
        id: 'cerezo',
        x: -130,
        y: -185,
        z: 0,
        r: 120,
        ax: -88,
        ay: -112,
        label: () => (bagHas('sol') ? 'Dar el sol al cerezo' : 'Mirar el cerezo'),
        show: () => !PROG.F.bloom,
      },
    ],
    oto: [
      {
        id: 'manivela',
        bridge: 'inv-oto',
        x: -150,
        y: 176,
        z: 0,
        r: 70,
        ax: -100,
        ay: 150,
        label: () => BRIDGES['inv-oto'].label[PROG.F.inkFixed ? 1 : 0],
        show: () => !PROG.F.bridge,
      },
    ],
    inv: [
      {
        id: 'hielo',
        x: 70,
        y: 150,
        z: 40,
        r: 80,
        ax: 70,
        ay: 100,
        item: 'hielo',
        label: () => 'Recoger hielo',
        show: () => !PROG.F.tookIce,
      },
      {
        id: 'rueda',
        bridge: 'ant-inv',
        x: 150,
        y: 190,
        z: 0,
        r: 70,
        ax: 110,
        ay: 162,
        label: () => BRIDGES['ant-inv'].label[PROG.F.done ? 1 : 0],
        show: () => !PROG.F.floe,
      },
    ],
    esp: [
      {
        id: 'telescopio',
        x: 20,
        y: -60,
        z: 0,
        r: 115,
        ax: -20,
        ay: 25,
        label: () => (bagHas('lente') ? 'Colocar la lente' : 'Mirar por el telescopio'),
        show: () => !PROG.F.star,
      },
    ],
    ver: [],
    oce: [],
    des: [],
    ant: [],
  },
};
/* ══════════ ESTILO · COLMENA DE PAPEL ══════════ */
const C = {
  wax: '#F2DDA8',
  waxS: '#E8CD91',
  waxR: '#EDD49B',
  honey: '#E4A844',
  honeyL: '#F3C872',
  amber: '#C47A2C',
  amberD: '#8C4B1F',
  cream: '#FBF4E3',
  sage: '#A7BE8B',
  sageL: '#C9D6A6',
  sageD: '#6F8D5E',
  sageDD: '#4E6B46',
  terra: '#C9694B',
  terraD: '#A5523A',
  petal: '#F4AFA6',
  petalD: '#E07F7F',
  petalL: '#FAD0C8',
  butter: '#F5CE55',
  teal: '#8DB5AA',
  tealD: '#6F968C',
  sky: '#CDE0D8',
  sea: '#7CC0CF',
  ink: '#4A3222',
  soil: '#6A4631',
  brown: '#8A5A3A',
};
const SEASON = {
  pri: { tint: '#CFE3B8', seal: '#8FB573', icon: '✿', door: '#E4F1CF', name: 'Primavera' },
  ver: { tint: '#F6D56A', seal: '#E0A93A', icon: '☀', door: '#FFF2C4', name: 'Verano' },
  oto: { tint: '#E8A560', seal: '#C9772F', icon: '❦', door: '#F7CD96', name: 'Otoño' },
  inv: { tint: '#DCE4E6', seal: '#8FA9B6', icon: '❄', door: '#E6F0F4', name: 'Invierno' },
};
/* colores: aclarar u oscurecer cualquier color css sencillo */
const COLC = new Map();
function colK(c, k) {
  if (typeof c !== 'string') return c;
  const key = c + '|' + k;
  let r = COLC.get(key);
  if (r) return r;
  let m,
    rgb = null,
    a = 1;
  if (c[0] === '#' && c.length === 7) {
    const n = parseInt(c.slice(1), 16);
    rgb = [n >> 16, (n >> 8) & 255, n & 255];
  } else if ((m = c.match(/rgba?\(([^)]+)\)/))) {
    const v = m[1].split(',').map(Number);
    rgb = v.slice(0, 3);
    if (v.length > 3) a = v[3];
  }
  if (!rgb) r = c;
  else {
    const f = (x) => Math.round(clamp(k >= 1 ? x + (255 - x) * (k - 1) : x * k, 0, 255));
    r = `rgba(${f(rgb[0])},${f(rgb[1])},${f(rgb[2])},${a})`;
  }
  COLC.set(key, r);
  return r;
}
function Pen(g, ox, oy, s, seed = 'x', fast = false, vol = false) {
  const PAPER = vol === 'paper';
  vol = vol === true;
  let SIL = null,
    SB = 0;
  const PJ = window.PENPROJ || null,
    R0 = rng(seed),
    P = PJ ? (x, y, z = 0) => PJ(x, y, z, ox, oy, s) : (x, y, z = 0) => [ox + x * s, oy + (y * K - z) * s],
    W = (q) => P(q[0], q[1], q[2]);
  const path = (pts) => {
    g.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const q = pts[i];
      i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]);
    }
    g.closePath();
  };
  /* trazo de tijera: cada borde se curva un poco (como papel recortado a mano) y tiembla apenas */
  function rough(pts, amp = 1) {
    const out = [],
      n = pts.length;
    /* pluma sin escala (el punto queda detrás de la cámara en un vuelo): L/(6·s) sería infinito y el bucle no acabaría */
    if (!(s > 1e-6)) return pts.slice();
    for (let i = 0; i < n; i++) {
      const a = pts[i],
        b = pts[(i + 1) % n],
        L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1,
        m = Math.min(4096, Math.max(1, Math.ceil(L / (6 * s)) || 1)),
        nx = -(b[1] - a[1]) / L,
        ny = (b[0] - a[0]) / L;
      const bend = vol ? 0 : m > 2 ? (R0() - 0.5) * 2 * Math.min(L * 0.032, 3.4 * s) * Math.min(1, amp * 1.6) * (PAPER ? 0.35 : 1) : 0;
      if (vol) amp *= 0.25;
      else if (PAPER) amp *= 0.4;
      for (let k = 0; k < m; k++) {
        const t = k / m,
          j = (R0() - 0.5) * 2 * amp * s * (k ? 0.8 : 0.2) + Math.sin(Math.PI * t) * bend;
        out.push([lerp(a[0], b[0], t) + nx * j, lerp(a[1], b[1], t) + ny * j]);
      }
    }
    return out;
  }
  /* contorno suave: curvas por los puntos medios, así no quedan esquinas duras */
  const soft = (Q) => {
    const n = Q.length;
    if (n < 3) {
      path(Q);
      return;
    }
    g.beginPath();
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let s0 = m(Q[n - 1], Q[0]);
    g.moveTo(s0[0], s0[1]);
    for (let i = 0; i < n; i++) {
      const q = Q[i],
        r = m(q, Q[(i + 1) % n]);
      g.quadraticCurveTo(q[0], q[1], r[0], r[1]);
    }
    g.closePath();
  };
  function cut(pts, col, o = {}) {
    if (vol && o.sh !== 0) o = { ...o, sh: 0 };
    const ex = o.rough === 0,
      Q = ex ? pts : rough(pts, o.rough ?? 0.8),
      dr = ex ? path : soft;
    if (SIL) {
      if (faint(col, o.alpha ?? 1)) return Q;
      g.save();
      g.fillStyle = SIL;
      g.strokeStyle = SIL;
      g.lineWidth = SB * 2 * s;
      g.lineJoin = 'round';
      dr(Q);
      g.fill();
      if (SB > 0) g.stroke();
      g.restore();
      return Q;
    }
    g.save();
    if (o.alpha != null) g.globalAlpha = o.alpha;
    if (PAPER && o.sh !== 0) o = { ...o, shc: o.shc || 'rgba(78,44,16,.16)', dx: (o.dx ?? 1.2) * 0.6, dy: (o.dy ?? 2.4) * 0.6 };
    if (o.sh !== 0) {
      if (fast) {
        g.save();
        g.translate((o.dx ?? 1.2) * s, (o.dy ?? 2.4) * s * 0.8);
        g.fillStyle = o.shc || 'rgba(78,44,16,.22)';
        dr(Q);
        g.fill();
        g.restore();
      } else {
        g.shadowColor = o.shc || 'rgba(78,44,16,.34)';
        g.shadowBlur = (o.blur ?? 5) * s;
        g.shadowOffsetX = (o.dx ?? 1.2) * s;
        g.shadowOffsetY = (o.dy ?? 2.4) * s;
      }
    }
    if (vol && typeof col === 'string' && !o.flat) {
      let x0 = 1e9,
        y0 = 1e9,
        x1 = -1e9,
        y1 = -1e9;
      for (const q of Q) {
        if (q[0] < x0) x0 = q[0];
        if (q[0] > x1) x1 = q[0];
        if (q[1] < y0) y0 = q[1];
        if (q[1] > y1) y1 = q[1];
      }
      const w = Math.max(1, x1 - x0),
        h = Math.max(1, y1 - y0),
        lg = g.createLinearGradient(x0 + w * 0.15, y0, x0 + w * 0.85, y1);
      lg.addColorStop(0, colK(col, 1.2));
      lg.addColorStop(0.5, col);
      lg.addColorStop(1, colK(col, 0.64));
      g.shadowColor = 'transparent';
      g.fillStyle = lg;
      dr(Q);
      g.fill();
      if (w > 3 * s && h > 3 * s) {
        const cx = x0 + w * 0.33,
          cy = y0 + h * 0.28,
          rg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.62);
        rg.addColorStop(0, 'rgba(255,252,240,.4)');
        rg.addColorStop(0.5, 'rgba(255,252,240,.08)');
        rg.addColorStop(1, 'rgba(255,252,240,0)');
        g.save();
        dr(Q);
        g.clip();
        g.fillStyle = rg;
        g.fillRect(x0, y0, w, h);
        const rim = g.createLinearGradient(0, y1 - h * 0.25, 0, y1);
        rim.addColorStop(0, 'rgba(40,20,10,0)');
        rim.addColorStop(1, 'rgba(40,20,10,.18)');
        g.fillStyle = rim;
        g.fillRect(x0, y0, w, h);
        g.restore();
      }
      g.restore();
      return Q;
    }
    g.fillStyle = col;
    dr(Q);
    g.fill();
    g.restore();
    return Q;
  }
  const faint = (col, al) =>
    al < 0.35 ||
    g.globalCompositeOperation === 'lighter' ||
    (typeof col === 'string' && col.startsWith('rgba') && parseFloat(col.slice(col.lastIndexOf(',') + 1)) < 0.35);
  function flat(pts, col, alpha = 1) {
    if (SIL) {
      if (faint(col, alpha)) return;
      g.save();
      g.fillStyle = SIL;
      g.strokeStyle = SIL;
      g.lineWidth = SB * 2 * s;
      g.lineJoin = 'round';
      path(pts);
      g.fill();
      if (SB > 0) g.stroke();
      g.restore();
      return;
    }
    g.save();
    g.globalAlpha = alpha;
    g.fillStyle = col;
    path(pts);
    g.fill();
    g.restore();
  }
  /* línea a mano alzada: los tramos largos se arquean un poco y las uniones se redondean */
  function line(pts, col, w, alpha = 1, o = {}) {
    g.save();
    g.globalAlpha = alpha;
    g.strokeStyle = col;
    g.lineWidth = w * s;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    if (o.sh && !fast) {
      g.shadowColor = 'rgba(78,44,16,.3)';
      g.shadowBlur = 2 * s;
      g.shadowOffsetY = 1.2 * s;
    }
    let Q = pts;
    if (!o.exact && pts.length > 1) {
      Q = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1],
          b = pts[i],
          L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (L > 18 * s) {
          const m = Math.min(8, Math.ceil(L / (14 * s))),
            nx = -(b[1] - a[1]) / L,
            ny = (b[0] - a[0]) / L,
            bend = (R0() - 0.5) * 2 * Math.min(L * 0.02, 1.8 * s);
          for (let k = 1; k < m; k++) {
            const t = k / m,
              j = Math.sin(Math.PI * t) * bend;
            Q.push([lerp(a[0], b[0], t) + nx * j, lerp(a[1], b[1], t) + ny * j]);
          }
        }
        Q.push(b);
      }
    }
    if (SIL) {
      if (faint(col, alpha)) {
        g.restore();
        return;
      }
      g.globalAlpha = 1;
      g.strokeStyle = SIL;
      g.lineWidth = w * s + SB * 2 * s;
      g.beginPath();
      g.moveTo(Q[0][0], Q[0][1]);
      for (let i = 1; i < Q.length; i++) g.lineTo(Q[i][0], Q[i][1]);
      g.stroke();
      g.restore();
      return;
    }
    if (vol && typeof col === 'string' && w >= 1.4 && !o.exact) {
      g.strokeStyle = colK(col, 0.78);
      g.beginPath();
      g.moveTo(Q[0][0], Q[0][1]);
      for (let i = 1; i < Q.length; i++) g.lineTo(Q[i][0], Q[i][1]);
      g.stroke();
      g.strokeStyle = colK(col, 1.1);
      g.lineWidth = w * s * 0.62;
      g.beginPath();
      g.moveTo(Q[0][0] - w * s * 0.12, Q[0][1] - w * s * 0.12);
      for (let i = 1; i < Q.length; i++) g.lineTo(Q[i][0] - w * s * 0.12, Q[i][1] - w * s * 0.12);
      g.stroke();
      g.strokeStyle = colK(col, 1.35);
      g.globalAlpha = alpha * 0.55;
      g.lineWidth = w * s * 0.22;
      g.beginPath();
      g.moveTo(Q[0][0] - w * s * 0.22, Q[0][1] - w * s * 0.22);
      for (let i = 1; i < Q.length; i++) g.lineTo(Q[i][0] - w * s * 0.22, Q[i][1] - w * s * 0.22);
      g.stroke();
      g.restore();
      return;
    }
    g.beginPath();
    g.moveTo(Q[0][0], Q[0][1]);
    if (Q.length < 3 || o.exact) for (let i = 1; i < Q.length; i++) g.lineTo(Q[i][0], Q[i][1]);
    else {
      for (let i = 1; i < Q.length - 1; i++) {
        const q = Q[i],
          r = Q[i + 1];
        g.quadraticCurveTo(q[0], q[1], (q[0] + r[0]) / 2, (q[1] + r[1]) / 2);
      }
      g.lineTo(Q[Q.length - 1][0], Q[Q.length - 1][1]);
    }
    g.stroke();
    g.restore();
  }
  const ring = (x, y, z, rx, ry = rx, n = 30) => {
    const o = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU;
      o.push(P(x + Math.cos(a) * rx, y + Math.sin(a) * ry, z));
    }
    return o;
  };
  const ell = (sx, sy, rx, ry, n = 26, rot = 0) => {
    const o = [],
      c = Math.cos(rot),
      si = Math.sin(rot);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU,
        x = Math.cos(a) * rx * s,
        y = Math.sin(a) * ry * s;
      o.push([sx + x * c - y * si, sy + x * si + y * c]);
    }
    return o;
  };
  const clip = (pts, fn) => {
    g.save();
    path(pts);
    g.clip();
    fn();
    g.restore();
  };
  const leaf = (sx, sy, a, len, wid) => {
    const c = Math.cos(a),
      si = Math.sin(a),
      o = [];
    for (let k = 0; k <= 10; k++) {
      const t = k / 10,
        w = Math.sin(t * Math.PI) * wid;
      o.push([sx + (c * t * len - si * w) * s, sy + (si * t * len + c * w) * s]);
    }
    for (let k = 9; k > 0; k--) {
      const t = k / 10,
        w = -Math.sin(t * Math.PI) * wid * 0.9;
      o.push([sx + (c * t * len - si * w) * s, sy + (si * t * len + c * w) * s]);
    }
    return o;
  };
  const text = (t, x, y, size, col, o = {}) => {
    if (SIL) return;
    g.save();
    g.font = `${o.it ? 'italic ' : ''}${o.w || 600} ${Math.round(size * s)}px Fraunces, 'Noto Serif', 'Noto Serif SC', Georgia, serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = col;
    g.globalAlpha = o.alpha ?? 1;
    g.fillText(_t(t), x, y);
    g.restore();
  };
  return {
    g,
    s,
    P,
    W,
    cut,
    flat,
    line,
    ring,
    ell,
    clip,
    leaf,
    text,
    rough,
    R: R0,
    ox,
    oy,
    seed,
    sil(c, b = 0) {
      SIL = c;
      SB = b;
    },
    silOn: () => !!SIL,
  };
}
let GRAIN = null;
function grain() {
  const c = document.createElement('canvas');
  c.width = c.height = 180;
  const g = c.getContext('2d'),
    im = g.createImageData(180, 180),
    R = rng('fibra');
  for (let i = 0; i < im.data.length; i += 4) {
    const v = R();
    if (v < 0.5) {
      im.data[i] = 90;
      im.data[i + 1] = 55;
      im.data[i + 2] = 22;
      im.data[i + 3] = Math.round((0.5 - v) * 34);
    } else {
      im.data[i] = 255;
      im.data[i + 1] = 250;
      im.data[i + 2] = 236;
      im.data[i + 3] = Math.round((v - 0.5) * 26);
    }
  }
  g.putImageData(im, 0, 0);
  g.strokeStyle = 'rgba(120,80,40,.08)';
  g.lineWidth = 0.6;
  for (let k = 0; k < 140; k++) {
    const x = R() * 180,
      y = R() * 180,
      a = R() * TAU,
      l = 2 + R() * 7;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  return c;
}
function applyGrain(c) {
  const g = c.getContext('2d');
  g.save();
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = g.createPattern(GRAIN, 'repeat');
  g.fillRect(0, 0, c.width, c.height);
  g.restore();
}

/* ── piezas comunes ── */
function cylinder(p, x, y, z, r, h, body, top, o = {}) {
  const n = 28,
    b = [],
    t = [],
    r1 = o.r1 ?? r;
  for (let k = 0; k <= n / 2; k++) {
    const a = (k / (n / 2)) * Math.PI;
    b.push(p.P(x + Math.cos(a) * r, y + Math.sin(a) * r, z));
  }
  for (let k = n / 2; k >= 0; k--) {
    const a = (k / (n / 2)) * Math.PI;
    t.push(p.P(x + Math.cos(a) * r1, y + Math.sin(a) * r1, z + h));
  }
  p.cut([...b, ...t], body, o);
  const tp = p.ring(x, y, z + h, r1, r1, n);
  if (top) p.cut(tp, top, { sh: 0, rough: 0.5 });
  return { top: tp, c: p.P(x, y, z + h) };
}
function pot(p, x, y, r, h, col = C.terra) {
  const c = cylinder(p, x, y, 0, r * 0.82, h, col, C.soil, { r1: r });
  const rim = [];
  for (let k = 0; k <= 14; k++) {
    const a = (k / 14) * Math.PI;
    rim.push(p.P(x + Math.cos(a) * r, y + Math.sin(a) * r, h));
  }
  for (let k = 14; k >= 0; k--) {
    const a = (k / 14) * Math.PI;
    rim.push(p.P(x + Math.cos(a) * r, y + Math.sin(a) * r, h - 6));
  }
  p.cut(rim, col === C.terra ? '#D98060' : C.honeyL, { sh: 0, rough: 0.4 });
  p.flat(p.ring(x, y, h, r * 0.8, r * 0.8), C.soil);
  return c;
}
function flowerDot(p, sx, sy, r, col, cen = C.butter) {
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * TAU;
    p.flat(p.ell(sx + Math.cos(a) * r * 0.9 * p.s, sy + Math.sin(a) * r * 0.9 * p.s, r * 0.62, r * 0.62, 10), col);
  }
  p.flat(p.ell(sx, sy, r * 0.42, r * 0.42, 10), cen);
}
function hexWin(p, e, u, z, r) {
  const o = [];
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    o.push(p.W(wallPt(e, u + (Math.cos(a) * r) / 300, z + Math.sin(a) * r)));
  }
  return o;
}
function circWin(p, e, u, z, r, n = 28) {
  const o = [];
  for (let k = 0; k < n; k++) {
    const a = (k / n) * TAU;
    o.push(p.W(wallPt(e, u + (Math.cos(a) * r) / 300, z + Math.sin(a) * r)));
  }
  return o;
}
function wallRect(p, e, u0, u1, z0, z1, inw = 0) {
  return [p.W(wallPt(e, u0, z0, inw)), p.W(wallPt(e, u1, z0, inw)), p.W(wallPt(e, u1, z1, inw)), p.W(wallPt(e, u0, z1, inw))];
}
function shelf(p, e, u0, u1, z, d = 22, col = '#D69646') {
  const s = p.s,
    sh = [p.W(wallPt(e, u0, z)), p.W(wallPt(e, u1, z)), p.W(wallPt(e, u1, z, d)), p.W(wallPt(e, u0, z, d))];
  p.cut(sh, col, { blur: 4 });
  p.cut([sh[3], sh[2], [sh[2][0], sh[2][1] + 5 * s], [sh[3][0], sh[3][1] + 5 * s]], '#B06E2E', { sh: 0, rough: 0.3 });
  return sh;
}
function leafShape(p, sx, sy, a, sz, col) {
  p.cut(p.leaf(sx, sy, a, sz, sz * 0.42), col, { blur: 2, rough: 0.3 });
}

/* ── la cáscara de cada celda: suelo de baldosas, paredes de cera, cantos ── */
function shell(p, o) {
  const g = p.g,
    s = p.s,
    R0 = rng(o.seed);
  g.save();
  g.shadowColor = 'rgba(40,20,5,.55)';
  g.shadowBlur = 34 * s;
  g.shadowOffsetY = 26 * s;
  g.fillStyle = C.amberD;
  const foot = VO.map((v) => p.P(v[0], v[1], -BASE));
  g.beginPath();
  foot.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
  g.closePath();
  g.fill();
  g.restore();
  const floor = VI.map((v) => p.P(v[0], v[1], 0));
  p.flat(floor, o.floor);
  p.clip(floor, () => {
    const rt = 27;
    for (let q = -8; q <= 8; q++)
      for (let r = -8; r <= 8; r++) {
        const cx = 1.5 * rt * q,
          cy = Math.sqrt(3) * rt * (r + q / 2);
        if (Math.abs(cy) > R * 0.87 + rt || Math.abs(cx) > R + rt) continue;
        p.cut(
          hexV(rt - 2.6, cx, cy).map((v) => p.P(v[0], v[1], 0)),
          pick(R0, o.tiles),
          { blur: 1.6, dx: 0.4, dy: 1, rough: 0.35, shc: 'rgba(90,70,30,.28)' },
        );
      }
    if (o.floorDecor) o.floorDecor(p, R0);
  });
  for (const e of BACK) {
    const A = VI[e[0]],
      B = VI[e[1]],
      F = [p.P(A[0], A[1], 0), p.P(B[0], B[1], 0)];
    for (let k = WALLN; k >= 0; k--) F.push(p.W(wallPt(e, k / WALLN, HW + wallProf(k / WALLN, e))));
    const FT = F[F.length - 1];
    p.flat(F, o.walls[e.join(',')]);
    p.clip(F, () => {
      for (let z = 44, row = 0; z < HW + 34; z += 17, row++)
        for (let u = (row % 2) * 0.035; u < 1.03; u += 0.07) {
          const hx = [];
          for (let k = 0; k < 6; k++) {
            const a = (k * Math.PI) / 3;
            hx.push(p.W(wallPt(e, u + (Math.cos(a) * 7.5) / 300, z + Math.sin(a) * 7.5)));
          }
          p.flat(hx, row % 2 ? o.relief[0] : o.relief[1], 0.16);
        }
      const zb = [p.W(wallPt(e, 0, 0)), p.W(wallPt(e, 1, 0))];
      for (let k = 24; k >= 0; k--) {
        const u = k / 24;
        zb.push(p.W(wallPt(e, u, 30 + Math.abs(Math.sin(u * Math.PI * 12)) * 5)));
      }
      p.cut(zb, o.wainscot, { blur: 3, dy: -1.2, dx: 0, rough: 0.5 });
      const g1 = g.createLinearGradient(0, FT[1], 0, F[0][1]);
      g1.addColorStop(0, 'rgba(255,248,225,.35)');
      g1.addColorStop(0.7, 'rgba(255,248,225,0)');
      g1.addColorStop(1, 'rgba(90,50,20,.18)');
      g.fillStyle = g1;
      g.fillRect(Math.min(F[0][0], F[1][0]), FT[1] - HW * s, Math.abs(F[1][0] - F[0][0]) + 1, HW * s * 2.4);
      wallFace(p, o, e);
    });
  }
  if (WALLSTYLE === 1)
    for (const v of [VI[4], VI[5]]) {
      const a = p.P(v[0], v[1], 0),
        b = p.P(v[0], v[1], HW);
      p.line([a, b], C.honey, 13, 1);
      p.line(
        [
          [a[0] - 2.5 * s, a[1]],
          [b[0] - 2.5 * s, b[1]],
        ],
        C.honeyL,
        5,
        0.8,
      );
    }
  else for (const v of [VI[4], VI[5]]) p.line([p.P(v[0], v[1], 0), p.P(v[0], v[1], HW)], o.seam, 2.4, 0.8);
}
/* ── el perfil de lo alto de las paredes: 0 recto · 1 cera blanda · 2 papel recortado · 3 arco de colmena ── */
let WALLSTYLE = 3;
const WALLN = 36;
function wallProf(u, e) {
  switch (WALLSTYLE) {
    case 1:
      return 7 * Math.sin(u * Math.PI * 3) * Math.min(1, Math.sin(Math.PI * u) * 3);
    case 2:
      return 9 * Math.pow(Math.abs(Math.sin(u * Math.PI * 6)), 0.55);
    case 3:
      return 24 * Math.sin(Math.PI * u);
    default:
      return 0;
  }
}
/* lo alto del borde delantero: la misma idea, más suave */
function lipProf(u) {
  switch (WALLSTYLE) {
    case 1:
      return 2.6 * Math.sin(u * Math.PI * 6);
    case 2:
      return 4.2 * Math.pow(Math.abs(Math.sin(u * Math.PI * 10)), 0.55);
    case 3:
      return 0;
    default:
      return 0;
  }
}
/* adornos propios de cada estilo sobre la cara de la pared */
function wallFace(p, o, e) {
  const s = p.s;
  if (WALLSTYLE === 2) {
    const q = [];
    for (let k = 0; k <= WALLN * 2; k++) {
      const u = k / (WALLN * 2);
      q.push(p.W(wallPt(e, u, HW - 8 + wallProf(u, e) * 0.4 - 4 * Math.pow(Math.abs(Math.sin(u * Math.PI * 14)), 0.7))));
    }
    for (let k = WALLN; k >= 0; k--) {
      const u = k / WALLN;
      q.push(p.W(wallPt(e, u, HW + 20)));
    }
    p.cut(q, o.wainscot, { blur: 3, dy: 2, rough: 0.2, alpha: 0.55 });
  }
  if (WALLSTYLE === 3) {
    for (let k = 1; k < 8; k++) {
      const u = k / 8,
        z = HW + wallProf(u, e) - 10,
        c = p.W(wallPt(e, u, z));
      p.line([...hexPts(c, 5, s), hexPts(c, 5, s)[0]], o.relief[1], 1.2, 0.5);
    }
  }
}
function shellTop(p, o) {
  const s = p.s;
  for (const e of BACK) {
    const A = VI[e[0]],
      B = VI[e[1]],
      Ao = VO[e[0]],
      Bo = VO[e[1]];
    if (!WALLSTYLE) {
      p.cut([p.P(A[0], A[1], HW), p.P(B[0], B[1], HW), p.P(Bo[0], Bo[1], HW), p.P(Ao[0], Ao[1], HW)], C.honey, {
        blur: 3,
        dy: -1,
        rough: 0.4,
      });
      p.line([p.P(A[0], A[1], HW), p.P(B[0], B[1], HW)], C.honeyL, 2, 0.9);
      continue;
    }
    const inn = [],
      out = [];
    for (let k = 0; k <= WALLN; k++) {
      const u = k / WALLN,
        z = HW + wallProf(u, e);
      inn.push(p.P(lerp(A[0], B[0], u), lerp(A[1], B[1], u), z));
      out.push(p.P(lerp(Ao[0], Bo[0], u), lerp(Ao[1], Bo[1], u), z));
    }
    p.cut([...inn, ...out.reverse()], C.honey, { blur: 3, dy: -1, rough: 0 });
    p.line(inn, C.honeyL, 2, 0.9, { exact: true });
    if (WALLSTYLE === 1) {
      const R1 = rng('drip' + e.join());
      for (let k = 0; k < 5; k++) {
        const u = 0.1 + k * 0.2 + R1() * 0.06,
          z = HW + wallProf(u, e),
          l = 14 + R1() * 22,
          c = p.W(wallPt(e, u, z, -1)),
          w = 3.2 + R1() * 2.2;
        p.cut(
          [
            [c[0] - w * s, c[1]],
            [c[0] + w * s, c[1]],
            [c[0] + w * 0.8 * s, c[1] + (l - w) * s],
            [c[0], c[1] + l * s],
            [c[0] - w * 0.8 * s, c[1] + (l - w) * s],
          ],
          C.honeyL,
          { blur: 2, dy: 1, rough: 0.1 },
        );
      }
    }
    if (WALLSTYLE === 3)
      for (let k = 0; k <= 9; k++) {
        const u = k / 9,
          z = HW + wallProf(u, e),
          c = p.P(lerp((A[0] + Ao[0]) / 2, (B[0] + Bo[0]) / 2, u), lerp((A[1] + Ao[1]) / 2, (B[1] + Bo[1]) / 2, u), z + 4.5);
        p.cut(hexPts(c, k % 3 ? 4.4 : 6, s, Math.PI / 6), k % 3 ? C.honeyL : C.honey, { blur: 2, dy: 1, rough: 0 });
      }
  }
  if (WALLSTYLE === 1)
    for (const v of [VI[4], VI[5]]) {
      const c = p.P(v[0] * 1.04, v[1] * 1.04, HW + 2);
      p.cut(p.ell(c[0], c[1], 9, 6, 18), C.honeyL, { blur: 2, dy: 1, rough: 0.1 });
    }
  for (const k of [3, 0]) {
    const A = VI[k],
      Ao = VO[k],
      F = [p.P(A[0], A[1], LIP), p.P(Ao[0], Ao[1], LIP), p.P(Ao[0], Ao[1], HW), p.P(A[0], A[1], HW)];
    p.flat(F, k === 3 ? '#E3AE58' : '#CF9443');
    p.clip(F, () => {
      for (let z = LIP + 22; z < HW; z += 34) p.line([p.P(A[0], A[1], z), p.P(Ao[0], Ao[1], z)], '#FFF1CF', 1.2, 0.35);
    });
  }
}
/* ── puerta en una pared del fondo ── */
/* dos hojas de madera sobre el arco: giran hacia dentro al acercarte (a: 0 cerrada, 1 abierta) */
function doorLeaves(p, d, a) {
  if (a > 0.985) return;
  const s = p.s,
    e = d.e,
    hw = DOOR_W,
    top = 76,
    th = a * 1.35,
    c = Math.cos(th),
    sn = Math.sin(th);
  for (const side of [-1, 1]) {
    const uh = 0.5 + side * hw,
      pt = (u, z) => {
        const du = u - uh;
        return p.W(wallPt(e, uh + du * c, z, Math.abs(du) * 300 * sn + 1));
      };
    const q = [pt(uh, 0), pt(uh, top * 0.7), pt(0.5 + side * hw * 0.45, top), pt(0.5, top * 0.99), pt(0.5, 0)];
    const shade = a > 0.02 ? `rgba(90,50,20,${0.1 + 0.25 * a})` : null;
    p.cut(q, side < 0 ? '#D9974A' : '#CF8C40', { blur: 2, rough: 0.25, dy: 0.6 });
    if (shade) p.flat(q, shade);
    for (const z of [18, 40, 58]) p.line([pt(uh + (0.5 - uh) * 0.12, z), pt(0.5 - (0.5 - uh) * 0.1, z)], '#A9682C', 1.1, 0.55);
    const kn = pt(0.5 - (0.5 - uh) * 0.2, top * 0.42);
    p.flat(p.ell(kn[0], kn[1], 2.2, 2.2, 8), '#6E3E17');
  }
}
function doorBack(p, d, tg) {
  const s = p.s,
    e = d.e,
    hw = DOOR_W,
    top = 76,
    SE = SEASON[tg.id];
  const arch = (du, dz) =>
    [
      wallPt(e, 0.5 - hw - du, 0),
      wallPt(e, 0.5 - hw - du, top * 0.7 + dz),
      wallPt(e, 0.5 - hw * 0.45 - du * 0.5, top + dz),
      wallPt(e, 0.5 + hw * 0.45 + du * 0.5, top + dz),
      wallPt(e, 0.5 + hw + du, top * 0.7 + dz),
      wallPt(e, 0.5 + hw + du, 0),
    ].map(p.W);
  const sp = p.W(wallPt(e, 0.5, 0, 40));
  {
    const n = parseInt(SE.door.slice(1), 16),
      r = n >> 16,
      gg = (n >> 8) & 255,
      bb = n & 255,
      lum = (r * 0.3 + gg * 0.59 + bb * 0.11) / 255,
      mx = lum < 0.55 ? 0.6 : 0,
      col = `rgb(${Math.round(r + (255 - r) * mx)},${Math.round(gg + (255 - gg) * mx)},${Math.round(bb + (255 - bb) * mx)})`;
    p.g.save();
    p.g.filter = `blur(${8 * s}px)`;
    p.flat(p.ell(sp[0], sp[1], 58, 20), col, lum < 0.55 ? 0.3 : 0.55);
    p.g.restore();
  }
  p.cut(arch(0.025, 10), C.honey, { blur: 4 });
  const inner = arch(0, 0);
  p.flat(inner, SE.door);
  if (d.span >= 2) pathView(p, d, inner, top, pathTypeOf(d.from, d.to));
  p.clip(inner, () => {
    const g = p.g,
      gr = g.createLinearGradient(0, inner[2][1], 0, inner[0][1]);
    gr.addColorStop(0, 'rgba(120,70,30,.28)');
    gr.addColorStop(1, 'rgba(255,255,255,.25)');
    g.fillStyle = gr;
    g.fillRect(inner[0][0] - 40 * s, inner[2][1] - 5 * s, 200 * s, 120 * s);
    const m = p.W(wallPt(e, 0.5, top * 0.45, -14));
    p.text(SE.icon, m[0], m[1], 26, SE.seal, { alpha: 0.55 });
  });
  const sg = p.W(wallPt(e, 0.5, top + 26));
  p.cut(p.ell(sg[0], sg[1], 12, 12, 22), SE.seal, { blur: 3, rough: 0.6 });
  p.text(SE.icon, sg[0], sg[1] + 0.5 * s, 12, '#FFF4D6', { w: 400 });
}
/* ── borde delantero cortado, con huecos y puentes hacia las celdas de delante ── */
function lip(p, c) {
  const g = p.g,
    s = p.s,
    col = { '0,1': '#D39A45', '1,2': '#E0AA52', '2,3': '#E9B861' };
  const segs = (e) =>
    c.doors.some((d) => !d.back && d.e[0] === e[0] && d.e[1] === e[1])
      ? [
          [0, 0.5 - DOOR_W, 1],
          [0.5 - DOOR_W, 0.5 + DOOR_W, 0],
          [0.5 + DOOR_W, 1, 1],
        ]
      : [[0, 1, 1]];
  const pt = (V, e, u) => [lerp(V[e[0]][0], V[e[1]][0], u), lerp(V[e[0]][1], V[e[1]][1], u)];
  const LN = 18,
    top = (V, e, u0, u1, zt) => {
      const o = [];
      for (let k = 0; k <= LN; k++) {
        const u = lerp(u0, u1, k / LN),
          q = pt(V, e, u);
        o.push(p.P(q[0], q[1], zt + (zt ? lipProf(u) * Math.min(1, Math.sin((Math.PI * k) / LN) * 4) : 0)));
      }
      return o;
    };
  for (const e of FRONT)
    for (const [u0, u1, full] of segs(e)) {
      const a = pt(VO, e, u0),
        b = pt(VO, e, u1),
        zt = full ? LIP : 0,
        F =
          WALLSTYLE && full
            ? [p.P(a[0], a[1], -BASE), p.P(b[0], b[1], -BASE), ...top(VO, e, u0, u1, zt).reverse()]
            : [p.P(a[0], a[1], -BASE), p.P(b[0], b[1], -BASE), p.P(b[0], b[1], zt), p.P(a[0], a[1], zt)];
      p.flat(F, col[e.join(',')]);
      p.clip(F, () => {
        for (const [z, cc, al] of [
          [-BASE + 8, C.amberD, 0.18],
          [-4, C.honeyL, 0.5],
          [LIP - 4, '#FFF1CF', 0.45],
        ])
          if (z < zt) p.line([p.P(a[0], a[1], z), p.P(b[0], b[1], z)], cc, 1.4, al);
      });
    }
  for (const e of FRONT)
    for (const [u0, u1, full] of segs(e)) {
      if (!full) continue;
      const a = pt(VI, e, u0),
        b = pt(VI, e, u1),
        ao = pt(VO, e, u0),
        bo = pt(VO, e, u1);
      if (WALLSTYLE) {
        const ti = top(VI, e, u0, u1, LIP),
          to = top(VO, e, u0, u1, LIP);
        p.cut([...ti, ...to.reverse()], C.honey, { blur: 3, dy: 1.5, rough: 0 });
        p.line(ti, C.honeyL, 1.8, 0.9, { exact: true });
        if (WALLSTYLE === 3)
          for (let k = 1; k < LN; k += 3) {
            const q = pt(VO, e, lerp(u0, u1, k / LN)),
              c = p.P(q[0], q[1], LIP - 8);
            p.cut(hexPts(c, 3.4, s, Math.PI / 6), C.honeyL, { blur: 1.5, dy: 0.8, rough: 0 });
          }
        continue;
      }
      p.cut([p.P(a[0], a[1], LIP), p.P(b[0], b[1], LIP), p.P(bo[0], bo[1], LIP), p.P(ao[0], ao[1], LIP)], C.honey, {
        blur: 3,
        dy: 1.5,
        rough: 0.4,
      });
      p.line([p.P(a[0], a[1], LIP), p.P(b[0], b[1], LIP)], C.honeyL, 1.8, 0.9);
    }
  /* puentes de papel hacia la celda vecina */
  for (const d of c.doors) {
    if (d.back || d.dyn || d.span >= 2) continue;
    const e = d.e,
      out = [-d.n[0], -d.n[1]],
      u0 = 0.5 - DOOR_W * 0.8,
      u1 = 0.5 + DOOR_W * 0.8,
      a = pt(VI, e, u0),
      b = pt(VI, e, u1),
      L = TH + 62;
    const Q = [
      p.P(a[0], a[1], 1),
      p.P(b[0], b[1], 1),
      p.P(b[0] + out[0] * L, b[1] + out[1] * L, -6),
      p.P(a[0] + out[0] * L, a[1] + out[1] * L, -6),
    ];
    p.cut(Q, '#E8B862', { blur: 5, dy: 3 });
    for (let k = 1; k < 7; k++) {
      const f = k / 7,
        x0 = lerp(a[0], a[0] + out[0] * L, f),
        y0 = lerp(a[1], a[1] + out[1] * L, f),
        x1 = lerp(b[0], b[0] + out[0] * L, f),
        y1 = lerp(b[1], b[1] + out[1] * L, f);
      p.line([p.P(x0, y0, 1 - f * 7), p.P(x1, y1, 1 - f * 7)], C.amber, 1.2, 0.45);
    }
    for (const k of [0, 1]) {
      const v = k ? b : a;
      p.line(
        [
          p.P(v[0], v[1], 1),
          p.P(v[0], v[1], 26),
          p.P(v[0] + out[0] * L, v[1] + out[1] * L, 20),
          p.P(v[0] + out[0] * L, v[1] + out[1] * L, -6),
        ],
        C.amberD,
        1.6,
        0.7,
      );
    }
    const m = pt(VI, e, 0.5),
      q = p.P(m[0] + out[0] * 20, m[1] + out[1] * 20, 2),
      SE = SEASON[d.to];
    p.text('›', q[0], q[1], 22, SE.seal, { alpha: 0.9 });
  }
  for (const [e, u, len] of [
    [[1, 2], 0.18, 20],
    [[1, 2], 0.82, 26],
    [[0, 1], 0.25, 16],
    [[2, 3], 0.75, 22],
  ]) {
    const ok = !segs(e).some(([u0, u1, f]) => !f && u > u0 - 0.05 && u < u1 + 0.05);
    if (!ok) continue;
    const x = lerp(VO[e[0]][0], VO[e[1]][0], u),
      y = lerp(VO[e[0]][1], VO[e[1]][1], u),
      q = p.P(x, y, LIP);
    const D = [
      [q[0] - 6 * s, q[1]],
      [q[0] + 6 * s, q[1]],
      [q[0] + 3.5 * s, q[1] + (len - 8) * s],
      [q[0] + 5 * s, q[1] + len * s],
      [q[0], q[1] + (len + 5) * s],
      [q[0] - 5 * s, q[1] + len * s],
      [q[0] - 3.5 * s, q[1] + (len - 8) * s],
    ];
    p.cut(D, '#E6A233', { blur: 3, rough: 0.2 });
    p.flat(p.ell(q[0] - 1.5 * s, q[1] + (len - 1) * s, 1.6, 2.6), C.honeyL, 0.9);
  }
}
/* ── carteles de las celdas vecinas ── */
function signAt(d) {
  if (d.back) return null;
  const L = TH + 80;
  return [d.mid[0] - d.n[0] * L, d.mid[1] - d.n[1] * L, 0];
}
function sign(p, d, tg, x, y, z) {
  const s = p.s,
    SE = SEASON[tg.id],
    b = p.P(x, y, -8),
    tp = p.P(x, y, 40);
  p.flat(p.ell(b[0], b[1], 10, 3.5), 'rgba(70,40,15,.25)');
  p.line([b, tp], '#9A6230', 3, 1, { sh: 1 });
  p.cut(p.ell(tp[0], tp[1] - 6 * s, 11, 11, 20), SE.seal, { blur: 3, rough: 0.5 });
  p.text(SE.icon, tp[0], tp[1] - 5.5 * s, 11, '#FFF4D6', { w: 400 });
}
/* ── siluetas de las celdas donde no estás: planas, apagadas, con el sello de su estación ── */
function ghost(p, id, a, named, locked) {
  const s = p.s,
    SE = SEASON[id],
    g = p.g;
  g.save();
  g.globalAlpha = a * 0.9;
  const top = VO.map((v) => p.P(v[0], v[1], 0));
  for (const e of FRONT) {
    const A = VO[e[0]],
      B = VO[e[1]];
    p.flat([p.P(A[0], A[1], -BASE), p.P(B[0], B[1], -BASE), p.P(B[0], B[1], 0), p.P(A[0], A[1], 0)], '#A8702F');
  }
  p.flat(top, '#C9934C');
  p.flat(
    VI.map((v) => p.P(v[0], v[1], 0)),
    SE.tint,
    0.42,
  );
  p.line([...top, top[0]], '#7A4A1C', 2.2, 0.55);
  for (const e of BACK) {
    const A = VI[e[0]],
      B = VI[e[1]];
    p.flat([p.P(A[0], A[1], 0), p.P(B[0], B[1], 0), p.P(B[0], B[1], HW * 0.55), p.P(A[0], A[1], HW * 0.55)], '#D9AE6A', 0.7);
  }
  const c = p.P(0, 0, 0);
  if (locked) {
    p.flat(p.ell(c[0], c[1], 30, 30, 28), '#7A3E22');
    p.flat(p.ell(c[0], c[1], 24, 24, 24), '#96502C');
    p.flat(p.ell(c[0], c[1] - 4 * s, 5.5, 5.5, 14), '#F3E0C0');
    p.flat(
      [
        [c[0] - 3 * s, c[1] - 2 * s],
        [c[0] + 3 * s, c[1] - 2 * s],
        [c[0] + 4.5 * s, c[1] + 9 * s],
        [c[0] - 4.5 * s, c[1] + 9 * s],
      ],
      '#F3E0C0',
    );
  } else {
    p.flat(p.ell(c[0], c[1], 30, 30, 28), SE.seal);
    p.flat(p.ell(c[0], c[1], 22, 22, 24), 'rgba(255,244,214,.25)');
    p.text(SE.icon, c[0], c[1] + 1 * s, 24, '#FFF4D6', { w: 400 });
  }
  if (named) {
    g.globalAlpha = a;
    const w = 62 * s,
      y0 = c[1] + 40 * s;
    p.flat(
      [
        [c[0] - w, y0],
        [c[0] + w, y0],
        [c[0] + w, y0 + 26 * s],
        [c[0] - w, y0 + 26 * s],
      ],
      C.cream,
    );
    p.text(locked ? 'Sellado' : SE.name, c[0], y0 + 13 * s, 16, C.ink);
  }
  g.restore();
}
/* el nombre de la puerta aparece al acercarte */
function doorLabel(p, d, tg, a, open) {
  const s = p.s,
    SE = SEASON[tg.id],
    q = d.back
      ? p.W(wallPt(d.e, 0.5, 112))
      : (() => {
          const L = TH + 80;
          return p.P(d.mid[0] - d.n[0] * L, d.mid[1] - d.n[1] * L, 66);
        })();
  const g = p.g;
  g.save();
  g.globalAlpha = a;
  g.font = `600 ${Math.round(13 * s)}px Fraunces, 'Noto Serif', 'Noto Serif SC', Georgia, serif`;
  const t = _t((open ? 'Hacia ' : 'Cerrado · ') + SE.name),
    w = g.measureText(t).width / 2 + 12 * s;
  g.restore();
  g.save();
  g.globalAlpha = a;
  p.flat(
    [
      [q[0] - w, q[1] - 11 * s],
      [q[0] + w, q[1] - 11 * s],
      [q[0] + w, q[1] + 11 * s],
      [q[0] - w, q[1] + 11 * s],
    ],
    open ? C.cream : '#E9DCC6',
  );
  p.text(t, q[0], q[1] + 0.5 * s, 13, C.ink);
  g.restore();
}
/* anillo turquesa que late: esto se puede tocar */
const HOT = '#2FA39A';
function hot(p, x, y, t, r = 20) {
  const s = p.s,
    q = p.P(x, y, 0),
    k = (Math.sin(t * 3.2) + 1) / 2;
  const E = p.ell(q[0], q[1], r + k * 6, (r + k * 6) * 0.42, 28);
  p.line([...E, E[0]], HOT, 2.6, 0.35 + 0.45 * (1 - k));
  const I = p.ell(q[0], q[1], r * 0.7, r * 0.7 * 0.42, 22);
  p.line([...I, I[0]], HOT, 1.6, 0.5);
}
/* burbuja con lo que desea un habitante */
function want(p, x, y, z, item, match, t) {
  const s = p.s,
    q = p.P(x, y, z + Math.sin(t * 1.6) * 2);
  if (match) {
    const k = (Math.sin(t * 5) + 1) / 2;
    p.flat(p.ell(q[0], q[1], 22 + k * 5, 19 + k * 4, 26), HOT, 0.25);
  }
  p.cut(p.ell(q[0], q[1], 17, 15, 24), C.cream, { rough: 0.4, dy: 2 });
  p.cut(p.ell(q[0] - 10 * s, q[1] + 15 * s, 4, 3.4, 12), C.cream, { rough: 0.2, dy: 1 });
  p.cut(p.ell(q[0] - 14 * s, q[1] + 22 * s, 2.4, 2, 10), C.cream, { rough: 0.1, dy: 1 });
  token(p, x, y, z + Math.sin(t * 1.6) * 2 - 0, item, t, true);
}
/* ── el panal de fondo: las celdas vecinas se tiñen de su estación ── */
function backdrop(p, W, H) {
  /* el vacío entre racimos: un cielo de miel oscura; solo las celdas habitadas tienen zócalo */
  const g = p.g,
    s = p.s,
    R0 = rng('panal');
  const gr = g.createRadialGradient(W / 2, H * 0.42, 40 * s, W / 2, H / 2, Math.max(W, H) * 0.85);
  gr.addColorStop(0, '#7A4A22');
  gr.addColorStop(0.45, '#4E2C18');
  gr.addColorStop(1, '#1E1320');
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  const Z0 = -BASE - 40;
  /* motas de polen flotando en el vacío */
  for (let i = 0; i < 140; i++) {
    const x = rd(R0, 0, W),
      y = rd(R0, 0, H),
      r = rd(R0, 0.6, 2.2) * Math.max(1, s * 1.4);
    g.globalAlpha = rd(R0, 0.15, 0.55);
    g.fillStyle = i % 5 ? '#F6D98A' : '#FFF6E0';
    g.beginPath();
    g.arc(x, y, r, 0, 7);
    g.fill();
  }
  g.globalAlpha = 1;
  for (let q = -9; q <= 10; q++)
    for (let r = -12; r <= 12; r++) {
      const [cx, cy] = cellCenter(q, r),
        c = p.P(cx, cy, Z0);
      if (c[0] < -RC * s * 1.2 || c[0] > W + RC * s * 1.2 || c[1] < -RC * s || c[1] > H + RC * s) continue;
      let sid = ORDER.find((id) => POS[id][0] === q && POS[id][1] === r);
      if (sid && window.CHIDE && CHIDE(sid)) sid = null;
      const outer = hexV(RC - 6, cx, cy).map((v) => p.P(v[0], v[1], Z0));
      if (sid) {
        const gl = g.createRadialGradient(c[0], c[1], RC * s * 0.2, c[0], c[1], RC * s * 1.25);
        gl.addColorStop(0, 'rgba(240,170,70,.30)');
        gl.addColorStop(1, 'rgba(240,170,70,0)');
        g.fillStyle = gl;
        g.beginPath();
        g.ellipse(c[0], c[1], RC * s * 1.3, RC * s * 1.3 * K, 0, 0, 7);
        g.fill();
        p.line([...outer, outer[0]], 'rgba(246,217,138,.10)', 1.1, 1);
        continue;
      }
      /* hueco vacío: solo el contorno, muy tenue */
      const a = 0.05 + (0.07 * (Math.abs(q * 7 + r * 13) % 3)) / 2;
      p.line([...outer, outer[0]], 'rgba(246,217,138,' + a.toFixed(3) + ')', 1.1, 1);
    }
  const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(20,10,20,0)');
  vg.addColorStop(1, 'rgba(20,10,20,.5)');
  g.fillStyle = vg;
  g.fillRect(0, 0, W, H);
}

/* ══════════ PERSONAJES ══════════ */
/* la abejita (tú) */
function drawBee(p, x, y, z, f, t, moving) {
  const s = p.s,
    flap = 0.35 + 0.65 * Math.abs(Math.sin(t * (moving ? 38 : 26)));
  {
    const sh = p.P(x, y, 0),
      k = clamp(1 - (z - 20) / 60, 0.4, 1);
    p.flat(p.ell(sh[0], sh[1], 15 * k, 5.5 * k), 'rgba(70,40,15,.22)');
  }
  const c = p.P(x, y, z);
  for (const [dx, a] of [
    [-4, -0.5],
    [3, -0.2],
  ]) {
    const w = p.ell(c[0] + dx * f * s, c[1] - 13 * s, 11, 7 * flap + 2, 18, a * f);
    p.cut(w, 'rgba(250,247,238,.82)', { rough: 0.2, shc: 'rgba(78,44,16,.14)' });
    p.line([...w, w[0]], 'rgba(160,140,110,.45)', 0.8);
  }
  const body = p.ell(c[0], c[1], 19, 14.5, 32);
  p.cut(body, C.butter, { rough: 0.3 });
  p.clip(body, () => {
    for (const dx of [-9, 1])
      p.flat(
        [
          [c[0] + (dx - 3) * f * s, c[1] - 20 * s],
          [c[0] + (dx + 3) * f * s, c[1] - 20 * s],
          [c[0] + (dx + 1) * f * s, c[1] + 20 * s],
          [c[0] + (dx - 5) * f * s, c[1] + 20 * s],
        ],
        C.ink,
        0.92,
      );
    p.flat(p.ell(c[0] - 2 * f * s, c[1] - 8 * s, 12, 4), 'rgba(255,247,220,.55)');
  });
  p.flat(
    [
      [c[0] - 18 * f * s, c[1] - 2 * s],
      [c[0] - 25 * f * s, c[1] + 1 * s],
      [c[0] - 18 * f * s, c[1] + 3 * s],
    ],
    C.ink,
  );
  const h = [c[0] + 19 * f * s, c[1] - 5 * s];
  p.cut(p.ell(h[0], h[1], 10.5, 10, 22), '#5A3D29', { rough: 0.2 });
  p.flat(p.ell(h[0] + 4 * f * s, h[1] - 2 * s, 3.2, 3.4, 12), C.cream);
  p.flat(p.ell(h[0] + 5 * f * s, h[1] - 1.6 * s, 1.7, 1.9, 10), C.ink);
  p.flat(p.ell(h[0] + 6 * f * s, h[1] + 4 * s, 2.6, 1.8, 10), C.petal, 0.85);
  for (const k of [-1, 1]) {
    const tip = [h[0] + (4 + k * 4) * f * s, h[1] - 20 * s + Math.sin(t * 3 + k) * 1.5 * s];
    p.line([[h[0] + k * 2 * f * s, h[1] - 8 * s], [h[0] + (3 + k * 3) * f * s, h[1] - 14 * s], tip], C.ink, 1.5);
    p.flat(p.ell(tip[0], tip[1], 2.2, 2.2, 8), C.ink);
  }
}
function markRing(p, x, y, a) {
  const q = p.P(x, y, 0),
    E = p.ell(q[0], q[1], 14, 5.5, 20);
  p.line([...E, E[0]], C.honeyL, 2.4, 0.9 * a);
}
/* ojos, mejillas y boca comunes */
function face(p, e1, e2, m, f, t, ex, o = {}) {
  const s = p.s,
    blink = (t + (o.ph || 0)) % 4.6 < 0.12,
    er = (o.er || 2.4) * (ex === 'surprised' ? 1.25 : 1),
    closed = ex === 'happy' || ex === 'laugh';
  for (const e of [e1, e2]) {
    if (!e) continue;
    if (closed || blink)
      p.line(
        [
          [e[0] - 3 * s, e[1] + (blink ? 0 : 0.5 * s)],
          [e[0], e[1] - (blink ? 0 : 2.4 * s)],
          [e[0] + 3 * s, e[1] + (blink ? 0 : 0.5 * s)],
        ],
        C.ink,
        1.4,
      );
    else {
      p.flat(p.ell(e[0], e[1], er, er * 1.08, 12), C.ink);
      p.flat(p.ell(e[0] + 0.8 * s, e[1] - 0.9 * s, 0.8, 0.8, 6), '#FFFFFF', 0.9);
    }
    if (ex === 'sad')
      p.line(
        [
          [e[0] - 3 * s, e[1] - 4.2 * s],
          [e[0] + 2.6 * s, e[1] - 5.6 * s * (e === e1 ? 0.8 : 1.2) + (e === e1 ? -1.2 * s : 0)],
        ],
        C.ink,
        1.1,
        0.8,
      );
    if (ex === 'surprised')
      p.line(
        [
          [e[0] - 2.6 * s, e[1] - 5.4 * s],
          [e[0], e[1] - 6.4 * s],
          [e[0] + 2.6 * s, e[1] - 5.4 * s],
        ],
        C.ink,
        1,
        0.8,
      );
  }
  if (o.cheek) p.flat(p.ell(o.cheek[0], o.cheek[1], 3.2, 2.2, 10), C.petal, ex === 'laugh' ? 1 : 0.8);
  if (ex === 'open') p.flat(p.ell(m[0], m[1] + 1 * s, 2, 2.4, 10), C.ink);
  else if (ex === 'surprised') p.flat(p.ell(m[0], m[1] + 0.6 * s, 2.2, 3, 12), C.ink);
  else if (ex === 'laugh') {
    p.flat(
      [
        [m[0] - 3.6 * f * s, m[1] - 0.6 * s],
        [m[0] + 3.6 * f * s, m[1] - 0.6 * s],
        [m[0] + 2.2 * f * s, m[1] + 3 * s],
        [m[0] - 0.4 * f * s, m[1] + 3.6 * s],
        [m[0] - 2.6 * f * s, m[1] + 2.4 * s],
      ],
      C.ink,
    );
    p.flat(p.ell(m[0], m[1] + 2.4 * s, 1.6, 0.9, 8), '#E07F7F');
  } else if (ex === 'sad')
    p.line(
      [
        [m[0] - 2.8 * f * s, m[1] + 1.6 * s],
        [m[0], m[1] + 0.2 * s],
        [m[0] + 2.8 * f * s, m[1] + 1.6 * s],
      ],
      C.ink,
      1.3,
    );
  else
    p.line(
      [
        [m[0] - 3 * f * s, m[1]],
        [m[0], m[1] + (ex === 'neutral' ? 0.6 : 2) * s],
        [m[0] + 3 * f * s, m[1]],
      ],
      C.ink,
      1.3,
    );
}
/* Brote, caracola jardinera */
function drawSnail(p, x, y, f, t, ex, portrait) {
  const s = p.s,
    sq = 1 + Math.sin(t * 1.3) * 0.035,
    sw = Math.sin(t * 2.1) * 0.12,
    P = (dx, dz) => p.P(x + dx * f, y, dz);
  if (!portrait) p.flat(p.ell(...P(-2, 0), 44, 12), 'rgba(70,40,15,.22)');
  p.cut(
    [
      P(-40, 0),
      P(-20, 0),
      P(10, 0),
      P(30, 0),
      P(38, 2),
      P(37, 12 * sq),
      P(30, 24 * sq),
      P(22, 30 * sq),
      P(12, 22),
      P(-6, 14),
      P(-30, 10),
      P(-44, 5),
    ],
    '#E5DDB6',
    { rough: 0.4 },
  );
  p.flat([P(-40, 0), P(30, 0), P(34, 4), P(-38, 4)], '#D1C596', 0.8);
  const hx = 26,
    hz = 26 * sq,
    eyes = [];
  for (const [k, off] of [
    [0, -3],
    [1, 5],
  ]) {
    const a = -0.25 + sw * (k ? 1 : -0.6) + (k ? 0.15 : -0.1),
      L = 24,
      ex_ = hx + off + Math.sin(a) * L,
      ez = hz + Math.cos(a) * L;
    p.line([P(hx + off, hz), P(ex_, ez)], '#DCD3A8', 4.2);
    const e = P(ex_, ez);
    p.cut(p.ell(e[0], e[1], 5, 5), C.cream, { sh: 0, rough: 0.2 });
    eyes.push([e[0] + 1.2 * f * s, e[1] + 0.4 * s]);
  }
  const m = P(33, 17 * sq);
  face(p, eyes[0], eyes[1], [m[0] + 4 * f * s, m[1] + 2 * s], f, t, ex, { cheek: [m[0] - 1 * f * s, m[1] - 1 * s], er: 2.3, ph: 1.7 });
  const hc = P(24, 33 * sq);
  p.cut(p.leaf(hc[0] - 12 * f * s, hc[1], f > 0 ? -0.28 : Math.PI + 0.28, 28, 9), C.sageD, { rough: 0.3 });
  p.line(
    [
      [hc[0] - 12 * f * s, hc[1]],
      [hc[0] + 14 * f * s, hc[1] - 5 * s],
    ],
    C.sageDD,
    1.2,
    0.8,
  );
  const c = P(-8, 34 * sq),
    r = 27;
  p.cut(p.ell(c[0], c[1], r, r * 0.96, 32), C.honey, { rough: 0.5 });
  p.cut(p.ell(c[0] + 2 * f * s, c[1] + 2 * s, r * 0.72, r * 0.7, 28), C.amber, { sh: 0, rough: 0.4 });
  p.cut(p.ell(c[0] + 3 * f * s, c[1] + 3 * s, r * 0.46, r * 0.45, 24), C.honeyL, { sh: 0, rough: 0.3 });
  const sp = [];
  for (let k = 0; k <= 46; k++) {
    const a = (k / 46) * TAU * 2.3,
      rr = r * (0.9 - (k / 46) * 0.82);
    sp.push([c[0] + Math.cos(a * f) * rr * s + (3 * f * s * k) / 46, c[1] + Math.sin(a) * rr * 0.96 * s + (3 * s * k) / 46]);
  }
  p.line(sp, C.amberD, 1.4, 0.75);
  if (!portrait) {
    const w = P(-6, 62 * sq),
      tilt = 0.25 * f;
    const B = [
      [w[0] - 9 * s, w[1] - 8 * s],
      [w[0] + 9 * s, w[1] - 8 * s],
      [w[0] + 10 * s, w[1] + 8 * s],
      [w[0] - 10 * s, w[1] + 8 * s],
    ].map((q) => {
      const dx = q[0] - w[0],
        dy = q[1] - w[1];
      return [w[0] + dx * Math.cos(tilt) - dy * Math.sin(tilt), w[1] + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
    });
    p.cut(B, C.teal, { rough: 0.2 });
    const tip = [w[0] + 22 * f * s, w[1] + 3 * s];
    p.line([[w[0] + 8 * f * s, w[1]], tip], C.tealD, 3.4);
    for (let k = 0; k < 5; k++) {
      const u = (t * 1.4 + k / 5) % 1;
      p.flat(p.ell(tip[0] + u * 10 * f * s, tip[1] + u * 38 * s, 1.6, 2.2, 8), '#8FC3D6', 0.9 * (1 - u * 0.5));
    }
  }
}
/* Solano, lagartija que duerme la siesta */
function drawLizard(p, x, y, f, t, ex, portrait) {
  const s = p.s,
    br = 1 + Math.sin(t * 1.1) * 0.04,
    tail = Math.sin(t * 1.6) * 0.25,
    P = (dx, dz) => p.P(x + dx, y, dz);
  if (!portrait) {
    /* cola que cuelga de la tumbona */
    const tl = [];
    for (let k = 0; k <= 14; k++) {
      const u = k / 14;
      tl.push(P(30 + u * 42, 24 - u * 14 + Math.sin(u * 3 + tail) * 6));
    }
    p.line(tl, '#7FB05C', 7 - 0);
    p.line(tl, '#9CC47A', 4.5);
  }
  /* cuerpo tumbado */
  const body = [P(-26, 34 * br), P(-6, 38 * br), P(20, 36 * br), P(34, 28), P(30, 20), P(0, 18), P(-24, 20)];
  p.cut(body, '#9CC47A', { rough: 0.5 });
  p.flat([P(-20, 24), P(24, 24), P(28, 21), P(-18, 20)], '#D3E6A4', 0.9);
  for (const [dx, dz] of [
    [-10, 33],
    [4, 35],
    [18, 32],
  ])
    p.flat(p.ell(...P(dx, dz), 3, 2), '#6E9C4E', 0.8);
  for (const dx of [-16, 22]) p.line([P(dx, 22), P(dx + 4, 12), P(dx + 8, 12)], '#86B566', 3);
  /* brazo con abanico de papel */
  const hand = P(6, 44 * br);
  p.line([P(-4, 34), hand], '#86B566', 3.4);
  {
    const fc = [hand[0], hand[1]];
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI * 0.9 + (k / 6) * Math.PI * 0.8 + Math.sin(t * 2.4) * 0.08;
      p.cut(
        [
          [fc[0], fc[1]],
          [fc[0] + Math.cos(a) * 16 * s, fc[1] + Math.sin(a) * 16 * s],
          [fc[0] + Math.cos(a + 0.13) * 16 * s, fc[1] + Math.sin(a + 0.13) * 16 * s],
        ],
        k % 2 ? C.petal : C.cream,
        { sh: 0, rough: 0 },
      );
    }
  }
  /* cabeza sobre el respaldo */
  const hc = P(-34, 50);
  p.cut(p.ell(hc[0], hc[1], 16, 11, 26, -0.25), '#A6CB84', { rough: 0.4 });
  p.flat(p.ell(hc[0] - 12 * s, hc[1] + 3 * s, 6, 4, 14, -0.25), '#A6CB84');
  const g1 = [hc[0] - 8 * s, hc[1] - 2 * s],
    g2 = [hc[0] + 2 * s, hc[1] - 4 * s];
  if (ex === 'happy') {
    p.line(
      [
        [g1[0] - 3 * s, g1[1]],
        [g1[0], g1[1] - 2 * s],
        [g1[0] + 3 * s, g1[1]],
      ],
      C.ink,
      1.4,
    );
    p.line(
      [
        [g2[0] - 3 * s, g2[1]],
        [g2[0], g2[1] - 2 * s],
        [g2[0] + 3 * s, g2[1]],
      ],
      C.ink,
      1.4,
    );
  } else {
    for (const g of [g1, g2]) p.cut(p.ell(g[0], g[1], 5.2, 4.2, 16), '#3A2A20', { sh: 0, rough: 0 });
    p.line([g1, g2], '#3A2A20', 1.4);
    p.flat(p.ell(g1[0] - 1.5 * s, g1[1] - 1.5 * s, 1.4, 1, 8), '#FFFFFF', 0.6);
  }
  const mo = [hc[0] - 12 * s, hc[1] + 5 * s];
  if (ex === 'open') p.flat(p.ell(mo[0], mo[1], 2, 1.8, 10), C.ink);
  else
    p.line(
      [
        [mo[0] - 3 * s, mo[1]],
        [mo[0], mo[1] + (ex === 'neutral' ? 0.5 : 1.8) * s],
        [mo[0] + 3 * s, mo[1]],
      ],
      C.ink,
      1.2,
    );
  p.flat(p.ell(hc[0] - 4 * s, hc[1] + 4 * s, 3, 2, 10), C.petal, 0.7);
  /* sombrero de paja */
  const hb = [hc[0] + 4 * s, hc[1] - 10 * s];
  p.cut(p.ell(hb[0], hb[1], 17, 5, 26, -0.25), '#F2D37A', { rough: 0.5 });
  p.cut(
    [
      [hb[0] - 9 * s, hb[1] - 1 * s],
      [hb[0] - 7 * s, hb[1] - 11 * s],
      [hb[0] + 8 * s, hb[1] - 14 * s],
      [hb[0] + 10 * s, hb[1] - 4 * s],
    ],
    '#F5DA86',
    { rough: 0.4 },
  );
  p.flat(
    [
      [hb[0] - 8.5 * s, hb[1] - 4 * s],
      [hb[0] + 9.5 * s, hb[1] - 7 * s],
      [hb[0] + 10 * s, hb[1] - 4 * s],
      [hb[0] - 8.5 * s, hb[1] - 1 * s],
    ],
    C.petalD,
    0.9,
  );
}
/* Ocre, polilla impresora */
function drawMoth(p, x, y, f, t, ex, portrait) {
  const s = p.s,
    bob = Math.sin(t * 1.7) * 1.2,
    P = (dx, dz) => p.P(x + dx * f, y, dz + bob);
  if (!portrait) p.flat(p.ell(...p.P(x, y, 0), 20, 7), 'rgba(70,40,15,.22)');
  /* alas plegadas como una capa */
  const wing = (k) => {
    const o = k * 6;
    p.cut([P(-6 + o, 58), P(-30 + o, 64), P(-40 + o, 40), P(-34 + o, 14), P(-14 + o, 10)], k ? '#B98252' : '#A06A40', { rough: 0.8 });
    p.flat(p.ell(...P(-28 + o, 40), 6, 6, 16), C.cream, 0.9);
    p.flat(p.ell(...P(-28 + o, 40), 3, 3, 12), C.ink);
  };
  wing(0);
  wing(1);
  /* piernas */
  for (const dx of [-4, 6]) p.line([P(dx, 14), P(dx, 1)], '#6E4B34', 3);
  /* cuerpo peludo con delantal */
  const body = [P(-12, 14), P(12, 14), P(15, 36), P(10, 56), P(-10, 56), P(-15, 36)];
  p.cut(body, '#F1E1BE', { rough: 1.4 });
  p.clip(
    body.map((q) => q),
    () => {
      for (const z of [22, 32]) p.flat([P(-16, z), P(16, z), P(16, z + 3), P(-16, z + 3)], '#E2C48E', 0.8);
    },
  );
  p.cut([P(-4, 50), P(12, 50), P(14, 16), P(-2, 16)], C.terra, { rough: 0.4 });
  for (const [dx, dz] of [
    [4, 40],
    [8, 28],
    [2, 24],
  ])
    p.flat(p.ell(...P(dx, dz), 1.8, 1.6, 8), C.ink, 0.7);
  /* brazos con un grabado */
  const hA = P(20, 40);
  p.line([P(8, 48), hA], '#E8D5AE', 3.4);
  p.line([P(-2, 48), P(16, 38)], '#E8D5AE', 3.4);
  if (!portrait) {
    const pr = [
      [hA[0] - 2 * s, hA[1] - 14 * s],
      [hA[0] + 14 * f * s, hA[1] - 16 * s],
      [hA[0] + 15 * f * s, hA[1] + 2 * s],
      [hA[0] - 1 * s, hA[1] + 3 * s],
    ];
    p.cut(pr, C.cream, { rough: 0.3 });
    p.flat(p.ell(hA[0] + 7 * f * s, hA[1] - 8 * s, 4, 4, 12), C.petalD, 0.85);
    p.flat(p.ell(hA[0] + 9 * f * s, hA[1] - 6 * s, 4, 3, 12), C.teal, 0.7);
  }
  /* cabeza con ojos grandes y antenas de pluma */
  const hc = P(2, 68);
  p.cut(p.ell(hc[0], hc[1], 13, 12, 26), '#F4E6C6', { rough: 1.2 });
  const e1 = [hc[0] + 2 * f * s, hc[1] - 1 * s],
    e2 = [hc[0] + 9 * f * s, hc[1] - 1 * s];
  if (ex === 'happy' || (t + 0.8) % 4.4 < 0.12) {
    for (const e of [e1, e2])
      p.line(
        [
          [e[0] - 3 * s, e[1]],
          [e[0], e[1] - 2.4 * s],
          [e[0] + 3 * s, e[1]],
        ],
        C.ink,
        1.5,
      );
  } else
    for (const e of [e1, e2]) {
      p.flat(p.ell(e[0], e[1], 3.6, 4.2, 14), C.ink);
      p.flat(p.ell(e[0] + 1 * s, e[1] - 1.4 * s, 1.1, 1.1, 8), '#FFFFFF', 0.9);
    }
  const mo = [hc[0] + 6 * f * s, hc[1] + 6 * s];
  if (ex === 'open') p.flat(p.ell(mo[0], mo[1], 1.8, 2.2, 10), C.ink);
  else
    p.line(
      [
        [mo[0] - 2.5 * s, mo[1]],
        [mo[0], mo[1] + 1.6 * s],
        [mo[0] + 2.5 * s, mo[1]],
      ],
      C.ink,
      1.2,
    );
  p.flat(p.ell(hc[0] + 12 * f * s, hc[1] + 3 * s, 2.6, 1.8, 10), C.petal, 0.8);
  for (const k of [-1, 1]) {
    const base = [hc[0] + (3 + k * 4) * f * s, hc[1] - 10 * s],
      a = -Math.PI / 2 + k * 0.45 * f + Math.sin(t * 2 + k) * 0.06;
    p.cut(p.leaf(base[0], base[1], a, 22, 6), '#C99A62', { rough: 0.3 });
    for (let m = 1; m < 8; m++) {
      const u = m / 8,
        q = [base[0] + Math.cos(a) * 22 * u * s, base[1] + Math.sin(a) * 22 * u * s];
      p.line([q, [q[0] + Math.cos(a + 1.2) * 4 * s, q[1] + Math.sin(a + 1.2) * 4 * s]], C.amberD, 0.7, 0.6);
      p.line([q, [q[0] + Math.cos(a - 1.2) * 4 * s, q[1] + Math.sin(a - 1.2) * 4 * s]], C.amberD, 0.7, 0.6);
    }
  }
}
/* Escarcha, erizo que teje */
function drawHedgehog(p, x, y, f, t, ex, portrait) {
  const s = p.s,
    br = 1 + Math.sin(t * 1.2) * 0.03,
    P = (dx, dz) => p.P(x + dx * f, y, dz);
  /* púas */
  const c = P(-4, 42 * br);
  for (let k = 0; k < 26; k++) {
    const a = Math.PI * 0.35 + (k / 25) * Math.PI * 1.3,
      r1 = 24,
      r2 = 36 + (k % 2) * 4,
      b = [c[0] + Math.cos(a) * r1 * s * f, c[1] + Math.sin(a) * r1 * 0.95 * s],
      tp = [c[0] + Math.cos(a) * r2 * s * f, c[1] + Math.sin(a) * r2 * 0.95 * s];
    p.cut(
      [[b[0] - Math.sin(a) * 5 * s, b[1] + Math.cos(a) * 5 * s], tp, [b[0] + Math.sin(a) * 5 * s, b[1] - Math.cos(a) * 5 * s]],
      k % 3 ? '#8A7766' : '#7A6758',
      { sh: 0, rough: 0 },
    );
    p.flat(p.ell(tp[0], tp[1], 1.6, 1.6, 6), '#EFE4D0', 0.9);
  }
  p.cut(p.ell(c[0], c[1], 28, 26, 30), '#9A8674', { rough: 0.8 });
  /* barriga y cara */
  p.cut(p.ell(c[0] + 10 * f * s, c[1] + 6 * s, 18, 20, 26), '#F2E6D2', { rough: 0.6 });
  const hc = [c[0] + 14 * f * s, c[1] - 12 * s];
  p.cut(
    [
      [hc[0] - 12 * f * s, hc[1] - 10 * s],
      [hc[0] + 6 * f * s, hc[1] - 8 * s],
      [hc[0] + 22 * f * s, hc[1] + 2 * s],
      [hc[0] + 4 * f * s, hc[1] + 10 * s],
      [hc[0] - 12 * f * s, hc[1] + 8 * s],
    ],
    '#F4EADA',
    { rough: 0.5 },
  );
  p.flat(p.ell(hc[0] + 22 * f * s, hc[1] + 2 * s, 3.4, 3, 12), C.petalD);
  face(p, [hc[0] + 6 * f * s, hc[1] - 2 * s], null, [hc[0] + 14 * f * s, hc[1] + 6 * s], f, t, ex, {
    cheek: [hc[0] + 4 * f * s, hc[1] + 5 * s],
    er: 2.4,
    ph: 0.6,
  });
  p.cut(p.ell(hc[0] - 6 * f * s, hc[1] - 11 * s, 4.5, 4, 14), '#D9C9B0', { sh: 0, rough: 0.2 });
  /* bufanda */
  p.cut(
    [
      [c[0] - 4 * f * s, c[1] - 4 * s],
      [c[0] + 22 * f * s, c[1] - 2 * s],
      [c[0] + 22 * f * s, c[1] + 5 * s],
      [c[0] - 4 * f * s, c[1] + 4 * s],
    ],
    C.petalD,
    { rough: 0.4 },
  );
  p.cut(
    [
      [c[0] + 12 * f * s, c[1] + 3 * s],
      [c[0] + 18 * f * s, c[1] + 3 * s],
      [c[0] + 20 * f * s, c[1] + 20 * s],
      [c[0] + 13 * f * s, c[1] + 20 * s],
    ],
    C.petalD,
    { rough: 0.4 },
  );
  for (let k = 0; k < 3; k++)
    p.line(
      [
        [c[0] + (13 + k * 2.4) * f * s, c[1] + 20 * s],
        [c[0] + (13 + k * 2.4) * f * s, c[1] + 24 * s],
      ],
      C.petalD,
      1,
    );
  /* manos tejiendo */
  if (!portrait) {
    const hk = [c[0] + 20 * f * s, c[1] + 12 * s],
      w = Math.sin(t * 6) * 1.5 * s;
    p.cut(
      [
        [hk[0] - 6 * s, hk[1]],
        [hk[0] + 8 * s, hk[1]],
        [hk[0] + 9 * s, hk[1] + 10 * s],
        [hk[0] - 5 * s, hk[1] + 11 * s],
      ],
      C.sage,
      { rough: 0.3 },
    );
    p.line(
      [
        [hk[0] - 8 * s, hk[1] - 6 * s + w],
        [hk[0] + 10 * s, hk[1] + 4 * s],
      ],
      '#B58A5A',
      1.6,
    );
    p.line(
      [
        [hk[0] + 12 * s, hk[1] - 6 * s - w],
        [hk[0] - 6 * s, hk[1] + 4 * s],
      ],
      '#B58A5A',
      1.6,
    );
    p.line(
      [
        [hk[0], hk[1] + 11 * s],
        [hk[0] + 8 * f * s, hk[1] + 30 * s],
        [hk[0] + 30 * f * s, hk[1] + 40 * s],
      ],
      C.sage,
      1,
      0.8,
    );
  }
}
/* ══════════ EL JUGADOR · viajero/a chibi con capa y mochila de frascos ══════════ */
function shade(hex, k = 0.78) {
  const n = parseInt(hex.slice(1), 16),
    r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`;
}
const ITEM_GLOW = { agua: '#7CC0CF', hielo: '#DDEFF5', sol: '#F5CE55', lente: '#DCEFF6', perla: '#FBF7F0', aurora: '#6FE0A8' };
function drawPerson(p, x, y, z, f, t, moving) {
  const s = p.s,
    A = AVATAR,
    ph = moving ? t * 11 : 0,
    sw = moving ? Math.sin(ph) : 0,
    bob = moving ? Math.abs(Math.sin(ph)) * 2.2 : Math.sin(t * 2) * 0.6;
  const Q = p.P(x, y, 0),
    X = (d) => Q[0] + d * f * s,
    Y = (d) => Q[1] - d * s,
    pt = (a, b) => [X(a), Y(b)];
  let ex = 'smile',
    held = null;
  try {
    ex = Pl.ex || 'smile';
    if (PROG.hand && T >= handHideUntil) held = PROG.hand;
  } catch (e) {}
  const hip = 13 + bob * 0.3,
    sh = 31 + bob,
    hd = 48 + bob,
    fl = moving ? 1 : 0.62,
    wv = Math.sin(t * (moving ? 9 : 2.2));
  if (!p.noShadow) p.flat(p.ell(Q[0], Q[1] + 1 * s, 17, 6), 'rgba(70,40,15,.24)');
  /* capa: cuelga de los hombros y ondea hacia atrás al caminar */
  const cape = [
    pt(-6, sh + 2),
    pt(6, sh + 2),
    pt(5, hip - 3),
    pt(-2 - 8 * fl, hip - 8 + wv * 2),
    pt(-11 - 12 * fl, hip - 4 - wv * 2.5),
    pt(-15 - 9 * fl, hip + 8 + wv * 1.5),
    pt(-10, sh - 3),
  ];
  p.cut(cape, A.cape, { rough: 0.4 });
  p.clip(cape, () => {
    const cc = shade(A.cape, 1.25),
      c0 = Y(hip - 8),
      c1 = Y(sh + 4);
    if (A.capePattern === 'rayas')
      for (let k = -4; k < 6; k++)
        p.line(
          [
            [X(-26 + k * 6), c0],
            [X(-14 + k * 6), c1],
          ],
          cc,
          2.2,
          0.8,
        );
    else if (A.capePattern === 'lunares')
      for (let a = -26; a < 8; a += 6)
        for (let b = hip - 6; b < sh + 4; b += 6) p.flat(p.ell(X(a + (b % 12 ? 3 : 0)), Y(b), 1.3, 1.3, 8), cc, 0.9);
    else if (A.capePattern === 'panal')
      for (let a = -26; a < 8; a += 7)
        for (let b = hip - 6, r = 0; b < sh + 4; b += 6, r++) {
          const H = hexV(2.6, 0, 0).map((v) => [X(a + (r % 2 ? 3.5 : 0)) + v[0] * s, Y(b) + v[1] * s]);
          p.line([...H, H[0]], cc, 0.9, 0.9);
        }
  });
  /* mochila con un frasco que brilla del color de lo que llevas */
  p.cut([pt(-12, sh - 1), pt(-4, sh), pt(-4, hip + 2), pt(-12, hip + 3)], '#8A5A34', { rough: 0.3 });
  p.line([pt(-12, hip + 10), pt(-4, hip + 10)], '#6A4226', 1.2, 0.7);
  {
    const j = pt(-13, hip + 6);
    p.cut(p.ell(j[0], j[1], 3.6, 4.6, 12), 'rgba(235,245,248,.85)', { sh: 0, rough: 0.1 });
    if (held) {
      p.flat(p.ell(j[0], j[1] + 1 * s, 2.6, 3, 10), ITEM_GLOW[held] || '#FFF');
      p.flat(p.ell(j[0], j[1], 7, 7, 12), ITEM_GLOW[held] || '#FFF', 0.25);
    }
  }
  /* piernas cortas */
  const lift = (v) => (moving ? Math.max(0, v) * 3 : 0);
  const leg = (o, k) => {
    const ft = pt(o * 5 * sw + (k ? 2 : -1), lift(o * Math.sin(ph)));
    p.line([pt(k ? 2.5 : -1, hip), ft], k ? A.bottom : shade(A.bottom), 5.4);
    p.cut(p.ell(ft[0] + 2 * f * s, ft[1] - 1 * s, 4.4, 2.6, 14), A.shoes, { rough: 0.2, dy: 1 });
  };
  const arm = (o, k) => {
    const hnd = held ? pt(k ? 10 : 8, hip + 7) : pt(-o * 6 * sw + (k ? 4 : -1), hip + 3);
    p.line([pt(k ? 4 : -3, sh - 3), hnd], k ? A.top : shade(A.top), 4.4);
    p.cut(p.ell(hnd[0], hnd[1], 2.6, 2.6, 10), A.skin, { sh: 0, rough: 0.1 });
  };
  leg(-1, 0);
  arm(1, 0);
  leg(1, 1);
  /* túnica y cinturón */
  p.cut([pt(-7, sh), pt(8, sh), pt(10, hip - 2), pt(-8, hip - 2)], A.top, { rough: 0.5 });
  p.flat([pt(-8, hip + 1.5), pt(10, hip + 1.5), pt(10, hip - 1), pt(-8, hip - 1)], '#8A5A34');
  p.line([pt(-6, sh), pt(3, hip + 1)], '#6A4226', 1.6, 0.9);
  if (held) STYLE.token(p, x + f * 12, y + 1, hip + 10, held, t, true);
  arm(-1, 1);
  /* cabeza grande */
  const hc = pt(2, hd),
    R = 14.5;
  if (A.accessory === 'bufanda') {
    p.cut([pt(-7, sh + 2), pt(9, sh + 3), pt(9, sh - 3), pt(-7, sh - 3)], A.accent, { rough: 0.3 });
    p.cut([pt(-6, sh - 1), pt(-2, sh - 1), pt(-4 - wv * 1.5, sh - 13), pt(-8 - wv * 1.5, sh - 12)], A.accent, { rough: 0.3 });
  }
  p.cut(p.ell(hc[0], hc[1], R, R * 1.02, 28), A.skin, { rough: 0.3 });
  p.flat(p.ell(X(-6), Y(hd - 1), 2.4, 3, 10), shade(A.skin));
  hairOf(p, pt, hd, A, t);
  face(p, pt(6, hd), pt(11.5, hd), pt(9.5, hd - 5.5), f, t, ex, { er: 2.5, ph: 0.5, cheek: pt(5, hd - 3.5) });
  hatOf(p, pt, hd, A, t, s);
}
function hairOf(p, pt, hd, A, t) {
  const c = A.hair,
    arc = (a0, a1, r, n = 16) => {
      const o = [];
      for (let k = 0; k <= n; k++) {
        const a = ((a0 + ((a1 - a0) * k) / n) * Math.PI) / 180;
        o.push(pt(2 + Math.cos(a) * r, hd + Math.sin(a) * r));
      }
      return o;
    };
  const st = A.hairStyle;
  if (A.accessory === 'gorro' && st !== 'largo') return;
  if (st === 'rapado') {
    p.flat([...arc(200, -10, 15.2), pt(12, hd + 5), pt(-2, hd + 8), pt(-12, hd + 2)], c, 0.6);
    return;
  }
  let front = [pt(14, hd + 4), pt(10, hd + 7), pt(6, hd + 5), pt(2, hd + 8), pt(-3, hd + 6)];
  if (st === 'flequillo') front = [pt(15, hd + 1), pt(12, hd + 2.5), pt(9, hd + 1.5), pt(6, hd + 2.5), pt(2, hd + 2), pt(-3, hd + 5)];
  let back = [];
  if (st === 'largo') back = [pt(-16, hd - 16), pt(-10, hd - 18), pt(-7, hd - 6)];
  p.cut([...arc(205, -12, 16.2), ...front, ...back], c, { rough: 0.5 });
  if (st === 'rizado')
    for (let a = 190; a >= -10; a -= 24) {
      const q = pt(2 + Math.cos((a * Math.PI) / 180) * 15.5, hd + Math.sin((a * Math.PI) / 180) * 15.5);
      p.cut(p.ell(q[0], q[1], 4.4, 4.4, 12), c, { sh: 0, rough: 0.4 });
    }
  if (st === 'recogido') {
    const b = pt(-10, hd + 14);
    p.cut(p.ell(b[0], b[1], 6, 6, 16), c, { rough: 0.4 });
    p.line([pt(-7, hd + 10), pt(-4, hd + 14)], shade(c, 1.3), 1.2, 0.6);
  }
}
function hatOf(p, pt, hd, A, t, s) {
  const a = A.accessory;
  if (a === 'sombrero') {
    const b = pt(2, hd + 11);
    p.cut(p.ell(b[0], b[1], 23, 6.5, 26), '#B8783A', { rough: 0.4 });
    p.cut([pt(-8, hd + 11), pt(12, hd + 11), pt(10, hd + 23), pt(-6, hd + 23)], '#A0652E', { rough: 0.3 });
    p.flat([pt(-8, hd + 13), pt(12, hd + 13), pt(11.6, hd + 16), pt(-7.6, hd + 16)], A.accent);
  } else if (a === 'velo') {
    const b = pt(2, hd + 12);
    p.flat([pt(-18, hd + 11), pt(22, hd + 11), pt(18, hd - 10), pt(-14, hd - 10)], 'rgba(250,246,236,.32)');
    for (let k = -3; k <= 4; k++) p.line([pt(2 + k * 4.6, hd + 11), pt(2 + k * 4.2, hd - 10)], 'rgba(90,70,50,.28)', 0.8);
    p.cut(p.ell(b[0], b[1], 24, 6.6, 26), '#EFE6D2', { rough: 0.4 });
    const cr = [];
    for (let k = 0; k <= 14; k++) {
      const an = Math.PI + (k / 14) * Math.PI;
      cr.push([b[0] + Math.cos(an) * 11 * s, b[1] + Math.sin(an) * 12 * s]);
    }
    p.cut(cr, '#F6F0E2', { rough: 0.3 });
    p.line(
      [
        [b[0] - 11 * s, b[1] - 2 * s],
        [b[0] + 11 * s, b[1] - 2 * s],
      ],
      A.accent,
      2,
    );
  } else if (a === 'gorro') {
    const cap = [];
    for (let k = 0; k <= 16; k++) {
      const an = ((200 - k * 13.4) * Math.PI) / 180;
      cap.push(pt(2 + Math.cos(an) * 16, hd + 2 + Math.sin(an) * 17));
    }
    p.cut(cap, A.cape, { rough: 0.4 });
    p.flat([pt(-13, hd + 3), pt(17, hd + 3), pt(17, hd + 7), pt(-13, hd + 7)], shade(A.cape, 0.8));
    const pp = pt(2, hd + 20);
    p.cut(p.ell(pp[0], pp[1], 4.6, 4.6, 14), '#F2EADB', { rough: 0.4 });
  }
}
/* ══════════ piezas del tramo · papel ══════════ */
function token(p, x, y, z, kind, t, small) {
  const s = p.s,
    k = small ? 0.75 : 1,
    q = p.P(x, y, z);
  if (!small) {
    const g = p.P(x, y, 0);
    p.flat(p.ell(g[0], g[1], 11, 4), 'rgba(70,40,15,.2)');
  }
  if (kind === 'agua') {
    const D = [];
    for (let m = 0; m <= 20; m++) {
      const a = (m / 20) * TAU,
        r = m === 0 || m === 20 ? 0 : 1;
      D.push([
        q[0] + Math.sin(a) * 9 * k * s * (a > Math.PI * 0.2 && a < Math.PI * 1.8 ? 1 : 0.2),
        q[1] + (-Math.cos(a) * 11 - (m < 3 || m > 17 ? 6 : 0)) * k * s,
      ]);
    }
    p.cut(D, '#7CC0CF', { rough: 0.3, dy: 2 });
    p.flat(p.ell(q[0] - 3 * k * s, q[1] - 1 * k * s, 2, 3.4, 10), '#E9F7F8', 0.8);
  } else if (kind === 'hielo') {
    const H = hexV(11 * k, 0, 0).map((v) => [q[0] + v[0] * s, q[1] + v[1] * s * 1.1]);
    p.cut(H, '#DDEFF5', { rough: 0.2, dy: 2 });
    p.line(
      [
        [q[0] - 6 * k * s, q[1] - 7 * k * s],
        [q[0] + 5 * k * s, q[1] + 6 * k * s],
      ],
      '#9CC6D4',
      1.4,
    );
    p.line(
      [
        [q[0] + 4 * k * s, q[1] - 8 * k * s],
        [q[0] + 7 * k * s, q[1] - 2 * k * s],
      ],
      '#FFFFFF',
      1.6,
    );
  } else if (kind === 'sol') {
    const J = [
      [q[0] - 8 * k * s, q[1] - 8 * k * s],
      [q[0] + 8 * k * s, q[1] - 8 * k * s],
      [q[0] + 9 * k * s, q[1] + 10 * k * s],
      [q[0] - 9 * k * s, q[1] + 10 * k * s],
    ];
    p.cut(J, 'rgba(251,244,227,.85)', { rough: 0.2, dy: 2 });
    p.flat(p.ell(q[0], q[1] + 2 * k * s, 6 * k, 6 * k, 18), '#F5CE55');
    for (let m = 0; m < 8; m++) {
      const a = (m / 8) * TAU + t;
      p.line(
        [
          [q[0] + Math.cos(a) * 7 * k * s, q[1] + 2 * k * s + Math.sin(a) * 7 * k * s],
          [q[0] + Math.cos(a) * 9.5 * k * s, q[1] + 2 * k * s + Math.sin(a) * 9.5 * k * s],
        ],
        '#F0A838',
        1.2,
      );
    }
    p.cut(
      [
        [q[0] - 9 * k * s, q[1] - 8 * k * s],
        [q[0] + 9 * k * s, q[1] - 8 * k * s],
        [q[0] + 9 * k * s, q[1] - 12 * k * s],
        [q[0] - 9 * k * s, q[1] - 12 * k * s],
      ],
      C.honey,
      { sh: 0, rough: 0.2 },
    );
  } else if (kind === 'lente') {
    p.cut(p.ell(q[0], q[1], 11 * k, 11 * k, 24), '#C98A42', { rough: 0.2, dy: 2 });
    p.flat(p.ell(q[0], q[1], 8 * k, 8 * k, 22), '#DCEFF6');
    p.flat(p.ell(q[0] - 3 * k * s, q[1] - 3 * k * s, 2.6 * k, 1.6 * k, 10, -0.6), '#FFFFFF', 0.9);
  } else if (kind === 'perla') {
    p.cut(
      [
        [q[0] - 12 * k * s, q[1] + 4 * k * s],
        [q[0] + 12 * k * s, q[1] + 4 * k * s],
        [q[0] + 8 * k * s, q[1] + 9 * k * s],
        [q[0] - 8 * k * s, q[1] + 9 * k * s],
      ],
      '#C9B2D9',
      { rough: 0.2, dy: 1 },
    );
    p.cut(p.ell(q[0], q[1] - 1 * k * s, 7 * k, 7 * k, 20), '#FBF7F0', { rough: 0.1, dy: 2 });
    p.flat(p.ell(q[0] - 2.4 * k * s, q[1] - 3.4 * k * s, 2 * k, 2 * k, 8), '#FFFFFF');
  } else if (kind === 'aurora') {
    const J = [
      [q[0] - 8 * k * s, q[1] - 8 * k * s],
      [q[0] + 8 * k * s, q[1] - 8 * k * s],
      [q[0] + 9 * k * s, q[1] + 10 * k * s],
      [q[0] - 9 * k * s, q[1] + 10 * k * s],
    ];
    p.cut(J, 'rgba(20,34,74,.9)', { rough: 0.2, dy: 2 });
    for (const [dz, col] of [
      [-2, '#6FE0A8'],
      [3, '#E08AD0'],
    ]) {
      const pts = [];
      for (let m = 0; m <= 6; m++) pts.push([q[0] - 7 * k * s + m * 2.3 * k * s, q[1] + (dz + Math.sin(m + t * 3) * 1.6) * k * s]);
      p.line(pts, col, 2.4);
    }
    p.cut(
      [
        [q[0] - 9 * k * s, q[1] - 8 * k * s],
        [q[0] + 9 * k * s, q[1] - 8 * k * s],
        [q[0] + 9 * k * s, q[1] - 12 * k * s],
        [q[0] - 9 * k * s, q[1] - 12 * k * s],
      ],
      '#8AB2C6',
      { sh: 0, rough: 0.2 },
    );
  } else if (kind === 'sello') {
    p.cut(p.ell(q[0], q[1], 24, 24, 30), C.terra, { rough: 1.2, dy: 3 });
    p.flat(p.ell(q[0], q[1], 17, 17, 26), 'rgba(255,230,190,.3)');
    p.text('✦', q[0], q[1] + 1 * s, 20, '#FFF4D6', { w: 400 });
  }
  const tw = (Math.sin(t * 3 + x) + 1) / 2;
  if (tw > 0.6) {
    const a = [q[0] + 11 * k * s, q[1] - 12 * k * s];
    p.line(
      [
        [a[0] - 3 * s * tw, a[1]],
        [a[0] + 3 * s * tw, a[1]],
      ],
      '#FFFFFF',
      1.2,
    );
    p.line(
      [
        [a[0], a[1] - 3 * s * tw],
        [a[0], a[1] + 3 * s * tw],
      ],
      '#FFFFFF',
      1.2,
    );
  }
}
function blocker(p, d, kind, t) {
  const s = p.s;
  if (kind === 'seal') {
    const c = d.back ? p.W(wallPt(d.e, 0.5, 40, 6)) : p.P(d.mid[0] - d.n[0] * 34, d.mid[1] - d.n[1] * 34, 20);
    for (const k of [-1, 1])
      p.line(
        [
          [c[0] - 26 * s, c[1] - 22 * k * s],
          [c[0] + 26 * s, c[1] + 22 * k * s],
        ],
        '#B8692C',
        3.2,
        0.9,
      );
    p.cut(p.ell(c[0], c[1], 14, 14, 22), '#9A3E22', { rough: 1, dy: 2 });
    p.flat(p.ell(c[0], c[1], 10, 10, 18), '#B24A2A');
    p.flat(p.ell(c[0], c[1] - 3 * s, 3, 3, 10), '#F3E0C0');
    p.flat(
      [
        [c[0] - 2 * s, c[1] - 2 * s],
        [c[0] + 2 * s, c[1] - 2 * s],
        [c[0] + 3 * s, c[1] + 5 * s],
        [c[0] - 3 * s, c[1] + 5 * s],
      ],
      '#F3E0C0',
    );
    return;
  }
  if (d.back) {
    const e = d.e,
      c = p.W(wallPt(e, 0.5, 36, 6));
    if (kind === 'shut') {
      for (const [a, b] of [
        [-1, 1],
        [1, -1],
      ])
        p.cut(
          [
            [c[0] + a * 30 * s, c[1] - 34 * s],
            [c[0] + a * 24 * s, c[1] - 38 * s],
            [c[0] + b * 30 * s, c[1] + 34 * s],
            [c[0] + b * 24 * s, c[1] + 38 * s],
          ].map((q, i, A) => q),
          C.honey,
          { rough: 0.4 },
        );
      p.cut(
        [
          [c[0] - 32 * s, c[1] - 6 * s],
          [c[0] + 32 * s, c[1] - 6 * s],
          [c[0] + 32 * s, c[1] + 6 * s],
          [c[0] - 32 * s, c[1] + 6 * s],
        ],
        '#D69646',
        { rough: 0.4 },
      );
    } else
      for (let k = 0; k < 7; k++) {
        const dx = (k - 3) * 9,
          h = 26 + ((k * 37) % 20),
          b = [c[0] + dx * s, c[1] + 34 * s];
        p.cut(
          [
            [b[0] - 7 * s, b[1]],
            [b[0] + 7 * s, b[1]],
            [b[0] + 2 * s, b[1] - h * s],
            [b[0] - 3 * s, b[1] - (h - 6) * s],
          ],
          k % 2 ? 'rgba(221,239,245,.92)' : 'rgba(190,222,234,.92)',
          { rough: 0.3 },
        );
        p.line(
          [
            [b[0] - 1 * s, b[1] - 4 * s],
            [b[0] + 1 * s, b[1] - (h - 6) * s],
          ],
          '#FFFFFF',
          1,
          0.7,
        );
      }
  } else {
    const m = [d.mid[0] - d.n[0] * 34, d.mid[1] - d.n[1] * 34],
      c = p.P(m[0], m[1], 0);
    for (let k = 0; k < 8; k++) {
      const dx = (k - 3.5) * 8,
        h = 22 + ((k * 29) % 22),
        b = [c[0] + dx * s, c[1] + (k % 2) * 4 * s];
      p.cut(
        [
          [b[0] - 7 * s, b[1]],
          [b[0] + 7 * s, b[1]],
          [b[0] + 2 * s, b[1] - h * s],
          [b[0] - 3 * s, b[1] - (h - 6) * s],
        ],
        k % 2 ? 'rgba(221,239,245,.94)' : 'rgba(190,222,234,.94)',
        { rough: 0.3 },
      );
      p.line(
        [
          [b[0] - 1 * s, b[1] - 4 * s],
          [b[0] + 1 * s, b[1] - (h - 6) * s],
        ],
        '#FFFFFF',
        1,
        0.7,
      );
    }
  }
}
function rot2(v, a) {
  return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
}
function bridgeDyn(p, d, ang, t) {
  const s = p.s,
    A = VI[d.e[0]],
    B = VI[d.e[1]],
    m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2],
    L0 = Math.hypot(B[0] - A[0], B[1] - A[1]),
    pe = rot2([(B[0] - A[0]) / L0, (B[1] - A[1]) / L0], ang),
    out = rot2([-d.n[0], -d.n[1]], ang),
    w = DOOR_W * 0.8 * R,
    L = TH + 62;
  const a = [m[0] - pe[0] * w, m[1] - pe[1] * w],
    b = [m[0] + pe[0] * w, m[1] + pe[1] * w],
    Q = [
      p.P(a[0], a[1], 1),
      p.P(b[0], b[1], 1),
      p.P(b[0] + out[0] * L, b[1] + out[1] * L, -6),
      p.P(a[0] + out[0] * L, a[1] + out[1] * L, -6),
    ];
  p.cut(p.ell(...p.P(m[0], m[1], 0), 16, 7, 20), C.amber, { sh: 0, rough: 0.3 });
  p.cut(Q, '#E8B862', { dy: 3, rough: 0.4 });
  for (let k = 1; k < 7; k++) {
    const f = k / 7;
    p.line(
      [
        p.P(lerp(a[0], a[0] + out[0] * L, f), lerp(a[1], a[1] + out[1] * L, f), 1 - f * 7),
        p.P(lerp(b[0], b[0] + out[0] * L, f), lerp(b[1], b[1] + out[1] * L, f), 1 - f * 7),
      ],
      C.amber,
      1.2,
      0.45,
    );
  }
  for (const v of [a, b])
    p.line(
      [
        p.P(v[0], v[1], 1),
        p.P(v[0], v[1], 26),
        p.P(v[0] + out[0] * L, v[1] + out[1] * L, 20),
        p.P(v[0] + out[0] * L, v[1] + out[1] * L, -6),
      ],
      C.amberD,
      1.6,
      0.7,
    );
  const q = p.P(m[0] + out[0] * 24, m[1] + out[1] * 24, 2);
  p.text('›', q[0], q[1], 22, SEASON[d.to].seal, { alpha: ang < 0.05 ? 0.9 : 0.35 });
}
function crank(p, x, y, ang, stuck, t) {
  const s = p.s,
    b = p.P(x, y, 0),
    top = p.P(x, y, 34);
  p.flat(p.ell(b[0], b[1], 12, 4), 'rgba(70,40,15,.25)');
  p.line([b, top], '#9A6230', 4);
  const r = 14,
    sp = -(1.05 - ang) * 9;
  p.cut(p.ell(top[0], top[1], r, r, 26), C.honey, { rough: 0.4 });
  p.flat(p.ell(top[0], top[1], r * 0.72, r * 0.72, 22), '#B8783A');
  for (let k = 0; k < 4; k++) {
    const a = sp + (k * Math.PI) / 2;
    p.line([top, [top[0] + Math.cos(a) * r * 0.8 * s, top[1] + Math.sin(a) * r * 0.8 * s]], C.honeyL, 2.2);
  }
  const hd = [top[0] + Math.cos(sp) * r * s, top[1] + Math.sin(sp) * r * s];
  p.cut(p.ell(hd[0], hd[1], 3.4, 3.4, 10), C.terra, { sh: 0, rough: 0 });
  if (stuck)
    for (const [dx, dy, rr] of [
      [-5, -3, 4],
      [4, 2, 3.2],
      [0, 6, 2.4],
    ])
      p.flat(p.ell(top[0] + dx * s, top[1] + dy * s, rr, rr * 0.8, 12), '#2E2A40', 0.85);
}
/* ══════════ CELDAS · COLMENA DE PAPEL ══════════ */
/* ── PRIMAVERA · la celda de Brote ── */
const PRI = {
  seed: 'pri',
  floor: '#E9E2BE',
  tiles: ['#E3E4B9', '#D4DCA9', '#CBD59E', '#ECE6C6', '#DDE0B1'],
  walls: { '3,4': C.waxS, '4,5': C.wax, '5,0': C.waxR },
  relief: ['#E2C483', '#F6E6BC'],
  wainscot: '#D9A551',
  seam: '#C9A05C',
  floorDecor(p, R0) {
    const s = p.s;
    for (let k = 0; k < 7; k++) {
      const a = rd(R0, 0, TAU),
        rr = rd(R0, 0.72, 0.95) * R,
        q = p.P(Math.cos(a) * rr, Math.sin(a) * rr * 0.9, 0);
      p.cut(p.ell(q[0], q[1], rd(R0, 14, 26), rd(R0, 6, 10)), pick(R0, [C.sage, C.sageL, '#B6C996']), { blur: 2, dy: 1, rough: 1.4 });
    }
    const lp = [p.P(-70, -252, 0), p.P(70, -252, 0), p.P(118, -60, 0), p.P(-22, -60, 0)];
    p.g.save();
    p.g.filter = `blur(${10 * s}px)`;
    p.flat(lp, '#FFF7DC', 0.4);
    p.g.restore();
  },
};
function priBase(p) {
  const s = p.s,
    R0 = rng('pri-dec');
  shell(p, PRI);
  const eT = [4, 5];
  p.cut(hexWin(p, eT, 0.5, 80, 47), C.honey, { blur: 4 });
  const glass = hexWin(p, eT, 0.5, 80, 37);
  p.flat(glass, C.sky);
  p.clip(glass, () => {
    const q = p.W(wallPt(eT, 0.5, 58, -10));
    p.flat(p.ell(q[0] - 20 * s, q[1] + 6 * s, 70, 18), '#B7CFA2');
    p.flat(p.ell(q[0] + 26 * s, q[1] + 10 * s, 60, 15), '#9DB88A');
    for (let k = 0; k < 5; k++) {
      const x = q[0] + (-34 + k * 17) * s,
        y = q[1] + 4 * s;
      p.flat(
        [
          [x - 5 * s, y],
          [x, y - 18 * s],
          [x + 5 * s, y],
        ],
        C.sageDD,
        0.8,
      );
    }
  });
  /* con el cuarto en 3D, marcos, estantes y celosía son piezas de verdad: aquí solo queda la pintura */
  if (window.WALL3D && WALL3D.pri && window.R3D && R3D.on && window.PENPROJ) {
    shellTop(p, PRI);
    return;
  }
  p.line([p.W(wallPt(eT, 0.5, 43)), p.W(wallPt(eT, 0.5, 117))], C.honeyL, 3.4, 1, { sh: 1 });
  p.line([p.W(wallPt(eT, 0.5 - 37 / 300, 80)), p.W(wallPt(eT, 0.5 + 37 / 300, 80))], C.honeyL, 3.4, 1, { sh: 1 });
  shelf(p, eT, 0.36, 0.64, 36, 20, '#D89A45');
  const eL = [3, 4];
  shelf(p, eL, 0.06, 0.3, 74, 24);
  shelf(p, eL, 0.7, 0.94, 74, 24);
  for (const u of [0.14, 0.24, 0.82]) {
    const w = wallPt(eL, u, 74, 12),
      c = p.P(w[0], w[1], 74);
    p.cut(
      [
        [c[0] - 8 * s, c[1] - 11 * s],
        [c[0] + 8 * s, c[1] - 11 * s],
        [c[0] + 6 * s, c[1]],
        [c[0] - 6 * s, c[1]],
      ],
      u === 0.24 ? C.teal : C.terra,
      { blur: 2.5 },
    );
    for (let k = 0; k < 3; k++) leafShape(p, c[0], c[1] - 11 * s, -Math.PI / 2 + (k - 1) * 0.6, 13, k % 2 ? C.sage : C.sageD);
    if (u === 0.82) flowerDot(p, c[0] + 2 * s, c[1] - 24 * s, 3, C.petal);
  }
  const eR = [5, 0];
  for (const [a0, a1] of [
    [0.08, 0.34],
    [0.66, 0.92],
  ])
    for (let k = 0; k < 3; k++) {
      const a = a0 + (k * (a1 - a0)) / 3;
      p.line([p.W(wallPt(eR, a, 24, 1)), p.W(wallPt(eR, Math.min(a1, a + 0.12), 120, 1))], C.cream, 3, 1, { sh: 1 });
      p.line([p.W(wallPt(eR, Math.min(a1, a + 0.12), 24, 1)), p.W(wallPt(eR, a, 120, 1))], '#F2E3BE', 3, 1, { sh: 1 });
    }
  for (let k = 0; k < 9; k++) {
    const u = R0() < 0.5 ? rd(R0, 0.1, 0.33) : rd(R0, 0.67, 0.9),
      z = rd(R0, 30, 118),
      q = p.W(wallPt(eR, u, z, 2));
    leafShape(p, q[0], q[1], rd(R0, 0, TAU), rd(R0, 10, 15), pick(R0, [C.sage, C.sageD, '#8FAA75']));
    if (R0() < 0.45) flowerDot(p, q[0], q[1], rd(R0, 3, 4.2), pick(R0, [C.petal, C.petalL, '#D8A3C9']), C.cream);
  }
  shellTop(p, PRI);
}
function drawCherry(p) {
  const R0 = rng('cerezo'),
    x = -130,
    y = -185,
    s = p.s;
  pot(p, x, y, 34, 44);
  const t0 = p.P(x, y, 40),
    t1 = p.P(x - 6, y, 150);
  p.cut(
    [
      [t0[0] - 7 * s, t0[1]],
      [t0[0] + 7 * s, t0[1]],
      [t1[0] + 4 * s, t1[1]],
      [t1[0] + 22 * s, t1[1] - 26 * s],
      [t1[0] + 14 * s, t1[1] - 28 * s],
      [t1[0] - 2 * s, t1[1] - 8 * s],
      [t1[0] - 20 * s, t1[1] - 24 * s],
      [t1[0] - 26 * s, t1[1] - 18 * s],
      [t1[0] - 5 * s, t1[1] + 4 * s],
    ],
    C.brown,
    { blur: 3 },
  );
  const c = p.P(x, y, 178),
    layer = (n, col, rr, dy) => {
      for (let k = 0; k < n; k++) {
        const a = rd(R0, 0, TAU),
          d = rd(R0, 0, rr);
        p.cut(
          p.ell(
            c[0] + Math.cos(a) * d * s * 1.15,
            c[1] + Math.sin(a) * d * s * 0.75 + dy * s,
            rd(R0, 22, 34),
            rd(R0, 17, 24),
            22,
            rd(R0, 0, 3),
          ),
          col,
          { blur: 4, rough: 1.6 },
        );
      }
    };
  if (!PROG.F.bloom) {
    for (const [dx, dy] of [
      [-40, -30],
      [36, -34],
      [-20, -58],
      [24, -62],
      [0, -44],
    ]) {
      p.line(
        [
          [t1[0], t1[1]],
          [t1[0] + dx * s, t1[1] + dy * s],
        ],
        C.brown,
        3.4,
      );
      for (let k = 0; k < 2; k++) p.flat(p.ell(t1[0] + dx * s * (0.6 + k * 0.35), t1[1] + dy * s * (0.6 + k * 0.35), 2.4, 2, 8), C.petal);
    }
    return;
  }
  layer(7, C.petalD, 52, -6);
  layer(8, C.petal, 48, 0);
  layer(6, C.petalL, 36, -10);
  for (let k = 0; k < 40; k++) {
    const a = rd(R0, 0, TAU),
      d = rd(R0, 0, 64);
    flowerDot(
      p,
      c[0] + Math.cos(a) * d * s * 1.1,
      c[1] + Math.sin(a) * d * s * 0.7,
      rd(R0, 2.2, 3.2),
      pick(R0, [C.cream, '#FFE9E3', C.petalL]),
      '#E9A0A0',
    );
  }
}
function drawPlanter(p) {
  const R0 = rng('huerto'),
    x = 10,
    y = -55,
    rr = 80,
    h = 34,
    s = p.s,
    V = hexV(rr, x, y),
    Vi = hexV(rr - 11, x, y),
    cols = ['#B87632', '#C9873C', '#D69748'];
  FRONT.forEach((e, k) => {
    const A = V[e[0]],
      B = V[e[1]];
    p.cut([p.P(A[0], A[1], 0), p.P(B[0], B[1], 0), p.P(B[0], B[1], h), p.P(A[0], A[1], h)], cols[k], { blur: 4 });
    for (let m = 1; m < 4; m++) {
      const u = m / 4;
      p.line([p.P(lerp(A[0], B[0], u), lerp(A[1], B[1], u), 1), p.P(lerp(A[0], B[0], u), lerp(A[1], B[1], u), h - 1)], C.amberD, 1, 0.35);
    }
  });
  const top = V.map((v) => p.P(v[0], v[1], h)),
    inner = Vi.map((v) => p.P(v[0], v[1], h));
  p.cut(top, '#DDA253', { sh: 0, rough: 0.4 });
  p.flat(inner, C.soil);
  for (const [dx, dy] of [
    [-38, -18],
    [-8, -30],
    [24, -22],
    [-26, 14],
    [8, 4],
  ]) {
    const q = p.P(x + dx, y + dy, h);
    for (let l = 0; l < 3; l++)
      for (let k = 0; k < 6; k++)
        p.cut(p.leaf(q[0], q[1] - 3 * s, (k / 6) * TAU + l * 0.5, 14 - l * 4, 7 - l * 1.6), [C.sageD, C.sage, C.sageL][l], {
          blur: 2,
          rough: 0.4,
        });
  }
  for (const dx of [34, 48, 58]) {
    const q = p.P(x + dx, y + 18 - dx * 0.2, h);
    p.flat(p.ell(q[0], q[1], 4, 3), '#E8843C');
    for (let k = -1; k <= 1; k++) p.line([q, [q[0] + k * 4 * s, q[1] - 13 * s]], C.sageDD, 1.6);
  }
}
function drawTulips(p, x, y, col, seed) {
  const R0 = rng(seed),
    s = p.s,
    c = pot(p, x, y, 18, 26).c;
  for (let k = 0; k < 4; k++)
    leafShape(p, c[0] + rd(R0, -5, 5) * s, c[1], -Math.PI / 2 + rd(R0, -0.8, 0.8), rd(R0, 24, 32), k % 2 ? C.sage : C.sageD);
  for (let k = 0; k < 4; k++) {
    const bx = c[0] + rd(R0, -10, 10) * s,
      tp = [bx + rd(R0, -4, 4) * s, c[1] - rd(R0, 40, 56) * s];
    p.line([[bx, c[1]], tp], C.sageD, 2);
    p.cut(
      [
        [tp[0] - 7 * s, tp[1] - 9 * s],
        [tp[0] - 3 * s, tp[1] - 4 * s],
        [tp[0], tp[1] - 11 * s],
        [tp[0] + 3 * s, tp[1] - 4 * s],
        [tp[0] + 7 * s, tp[1] - 9 * s],
        [tp[0] + 6 * s, tp[1] + 3 * s],
        [tp[0] - 6 * s, tp[1] + 3 * s],
      ],
      col,
      { blur: 2.5, rough: 0.3 },
    );
  }
}
function drawCan(p) {
  const x = -110,
    y = 95,
    s = p.s,
    c = cylinder(p, x, y, 0, 16, 24, C.teal, '#A7CBC1');
  const a = p.P(x - 12, y, 16),
    b = p.P(x - 40, y, 34);
  p.cut(
    [
      [a[0], a[1] - 3 * s],
      [b[0], b[1] - 3 * s],
      [b[0] - 1 * s, b[1] + 3 * s],
      [a[0], a[1] + 5 * s],
    ],
    '#7EA79C',
    { blur: 2.5, rough: 0.2 },
  );
  p.line(
    [
      [c.c[0] - 8 * s, c.c[1]],
      [c.c[0] - 3 * s, c.c[1] - 15 * s],
      [c.c[0] + 10 * s, c.c[1] - 8 * s],
      [c.c[0] + 14 * s, c.c[1] + 6 * s],
    ],
    C.tealD,
    3,
    1,
    { sh: 1 },
  );
}
function drawMush(p, x, y, k) {
  const s = p.s;
  p.cut([p.P(x - 8 * k, y, 0), p.P(x + 8 * k, y, 0), p.P(x + 6 * k, y, 26 * k), p.P(x - 6 * k, y, 26 * k)], C.cream, { blur: 3 });
  const c = p.P(x, y, 28 * k),
    cap = [];
  for (let m = 0; m <= 16; m++) {
    const a = Math.PI + (m / 16) * Math.PI;
    cap.push([c[0] + Math.cos(a) * 27 * k * s, c[1] + Math.sin(a) * 18 * k * s]);
  }
  cap.push([c[0] + 24 * k * s, c[1] + 4 * k * s], [c[0] - 24 * k * s, c[1] + 4 * k * s]);
  p.cut(cap, C.terra, { blur: 4, rough: 0.5 });
  for (const [dx, dy, r] of [
    [-11, -8, 4],
    [6, -12, 3.2],
    [14, -3, 2.6],
    [-2, -3, 2.4],
  ])
    p.flat(p.ell(c[0] + dx * k * s, c[1] + dy * k * s, r * k, r * k * 0.8), C.cream);
}
function drawCrate(p) {
  const R0 = rng('caja'),
    x = 95,
    y = -168,
    w = 34,
    d = 18,
    h = 30,
    s = p.s,
    A = [x - w, y + d],
    B = [x + w, y + d];
  const front = [p.P(A[0], A[1], 0), p.P(B[0], B[1], 0), p.P(B[0], B[1], h), p.P(A[0], A[1], h)];
  p.cut(front, '#C98A42', { blur: 4 });
  p.flat([p.P(x - w, y - d, h), p.P(x + w, y - d, h), p.P(x + w, y + d, h), p.P(x - w, y + d, h)], '#8E5B2E');
  const cols = [C.petal, C.butter, C.sage, C.petalL, C.teal, C.cream];
  for (let k = 0; k < 6; k++) {
    const q = p.P(x - 26 + k * 10.5, y + rd(R0, -4, 6), h),
      hh = rd(R0, 18, 24);
    p.cut(
      [
        [q[0] - 6 * s, q[1] - hh * s],
        [q[0] + 6 * s, q[1] - hh * s],
        [q[0] + 6 * s, q[1] + 2 * s],
        [q[0] - 6 * s, q[1] + 2 * s],
      ],
      cols[k],
      { blur: 2.5, rough: 0.3 },
    );
    flowerDot(p, q[0], q[1] - 11 * s, 2.4, k % 2 ? C.petalD : C.sageD, C.cream);
  }
  p.cut(front, '#C98A42', { blur: 3, sh: 0 });
  for (const z of [10, 20]) p.line([p.P(A[0], A[1], z), p.P(B[0], B[1], z)], C.amberD, 1, 0.4);
}
const PET = [...Array(9)].map((_, k) => {
  const R0 = rng('p' + k);
  return [rd(R0, -195, -65), rd(R0, -235, -145), R0(), rd(R0, 0.05, 0.09), rd(R0, 0, TAU)];
});
function windowRain(p, T, e, u, z, r) {
  const g = hexWin(p, e, u, z, r - 10);
  p.clip(g, () => {
    for (let k = 0; k < 14; k++) {
      const R0 = rng('r' + k),
        uu = rd(R0, -0.12, 0.12),
        o = R0(),
        spd = rd(R0, 0.8, 1.3),
        f = (T * spd + o) % 1,
        q = p.W(wallPt(e, u + uu, z + 37 - f * 80, -12));
      p.line([q, [q[0] - 2 * p.s, q[1] + 9 * p.s]], '#9FBFD0', 1.2, 0.8);
    }
  });
}

/* ── VERANO · la terraza de la siesta ── */
const VER = {
  seed: 'ver',
  floor: '#F6EACB',
  tiles: ['#F3E4BE', '#EFDDB0', '#F7ECCB', '#EBCB9A', '#F1D9AC'],
  walls: { '3,4': '#F4DFA6', '4,5': '#FBE9B6', '5,0': '#F6E3AA' },
  relief: ['#E7CB8C', '#FFF1CC'],
  wainscot: '#8EC3CF',
  seam: '#D5AD62',
  floorDecor(p, R0) {
    const s = p.s;
    const lp = [p.P(-120, -255, 0), p.P(120, -255, 0), p.P(190, -20, 0), p.P(-50, -20, 0)];
    p.g.save();
    p.g.filter = `blur(${14 * s}px)`;
    p.flat(lp, '#FFF6C9', 0.55);
    p.g.restore();
  },
};
function verBase(p) {
  const s = p.s,
    R0 = rng('ver-dec');
  shell(p, VER);
  /* ventana redonda al mar */
  const eT = [4, 5];
  p.cut(circWin(p, eT, 0.5, 80, 52), C.honey, { blur: 4 });
  const gl = circWin(p, eT, 0.5, 80, 42);
  p.flat(gl, '#CBEAF0');
  p.clip(gl, () => {
    const q = p.W(wallPt(eT, 0.5, 64, -10));
    p.flat(
      [
        [q[0] - 80 * s, q[1]],
        [q[0] + 80 * s, q[1]],
        [q[0] + 80 * s, q[1] + 60 * s],
        [q[0] - 80 * s, q[1] + 60 * s],
      ],
      C.sea,
    );
    const su = p.W(wallPt(eT, 0.56, 94, -20));
    p.cut(p.ell(su[0], su[1], 13, 13, 24), '#FFE08A', { sh: 0, rough: 0.4 });
    p.flat(p.ell(su[0], su[1], 20, 20, 24), '#FFF2B8', 0.35);
    for (let k = 0; k < 4; k++)
      p.line(
        [
          [q[0] - 40 * s + k * 22 * s, q[1] + 6 * s + k * 3 * s],
          [q[0] - 30 * s + k * 22 * s, q[1] + 6 * s + k * 3 * s],
        ],
        '#E8F6F8',
        1.4,
        0.8,
      );
    p.cut(
      [
        [q[0] + 14 * s, q[1]],
        [q[0] + 30 * s, q[1]],
        [q[0] + 26 * s, q[1] + 4 * s],
        [q[0] + 18 * s, q[1] + 4 * s],
      ],
      C.cream,
      { sh: 0, rough: 0.2 },
    );
    p.line(
      [
        [q[0] + 22 * s, q[1]],
        [q[0] + 22 * s, q[1] - 14 * s],
      ],
      C.ink,
      1,
    );
    p.flat(
      [
        [q[0] + 22 * s, q[1] - 14 * s],
        [q[0] + 22 * s, q[1] - 2 * s],
        [q[0] + 31 * s, q[1] - 3 * s],
      ],
      C.petalD,
    );
  });
  shellTop(p, VER);
}
function drawPool(p) {
  const s = p.s,
    x = 40,
    y = -50,
    V = hexV(92, x, y),
    Vw = hexV(76, x, y),
    R0 = rng('pileta');
  FRONT.forEach((e, k) => {
    const A = V[e[0]],
      B = V[e[1]];
    p.cut([p.P(A[0], A[1], 0), p.P(B[0], B[1], 0), p.P(B[0], B[1], 8), p.P(A[0], A[1], 8)], ['#E7C68C', '#EFD29E', '#F3DCAE'][k], {
      blur: 3,
    });
  });
  p.cut(
    V.map((v) => p.P(v[0], v[1], 8)),
    '#FBF0D6',
    { sh: 0, rough: 0.3 },
  );
  const w = Vw.map((v) => p.P(v[0], v[1], 6));
  p.flat(w, '#7CC6D2');
  p.clip(w, () => {
    p.flat(
      hexV(60, x - 10, y - 12).map((v) => p.P(v[0], v[1], 6)),
      '#95D4DE',
      0.8,
    );
    for (let k = 0; k < 10; k++) {
      const q = p.P(x + rd(R0, -60, 60), y + rd(R0, -55, 55), 6),
        pts = [];
      for (let m = 0; m <= 8; m++) pts.push([q[0] + (m - 4) * 4 * s, q[1] + Math.sin(m * 1.3) * 1.5 * s]);
      p.line(pts, '#E9F7F8', 1.4, 0.8);
    }
  });
  const f = p.P(x + 30, y - 18, 8);
  p.cut(p.ell(f[0], f[1], 17, 9, 26), C.petal, { blur: 3, rough: 0.3 });
  p.flat(p.ell(f[0], f[1], 8, 4, 20), '#7CC6D2');
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * TAU + 0.4;
    p.flat(p.ell(f[0] + Math.cos(a) * 12.5 * s, f[1] + Math.sin(a) * 6.5 * s, 3.4, 2.6, 10), C.cream);
  }
  const lad = p.P(x + 70, y - 10, 8);
  for (const dx of [0, 10])
    p.line(
      [
        [lad[0] + dx * s, lad[1]],
        [lad[0] + dx * s, lad[1] - 18 * s],
      ],
      '#B7C3C6',
      2.4,
    );
}
function drawParasol(p) {
  const s = p.s,
    x = -205,
    y = -60;
  {
    const q = p.P(x - 20, y + 14, 0);
    p.g.save();
    p.g.filter = `blur(${6 * s}px)`;
    p.flat(p.ell(q[0], q[1], 62, 22), 'rgba(120,70,20,.22)');
    p.g.restore();
  }
  p.line([p.P(x, y, 0), p.P(x, y, 150)], '#E9D7B0', 4, 1, { sh: 1 });
  const c = p.P(x, y, 150),
    ap = p.P(x, y, 172);
  for (let k = 0; k < 8; k++) {
    const a0 = (k / 8) * TAU,
      a1 = ((k + 1) / 8) * TAU,
      A = p.P(x + Math.cos(a0) * 74, y + Math.sin(a0) * 74, 146),
      B = p.P(x + Math.cos(a1) * 74, y + Math.sin(a1) * 74, 146);
    p.cut([ap, A, B], k % 2 ? C.cream : C.petalD, { blur: 3, rough: 0.2 });
  }
  p.cut(p.ell(ap[0], ap[1], 4, 4, 10), C.honey, { sh: 0, rough: 0 });
  for (let k = 0; k < 8; k++) {
    const a0 = (k / 8) * TAU,
      a1 = ((k + 1) / 8) * TAU,
      A = p.P(x + Math.cos(a0) * 74, y + Math.sin(a0) * 74, 146),
      B = p.P(x + Math.cos(a1) * 74, y + Math.sin(a1) * 74, 146),
      m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 6 * s];
    p.flat([A, m, B], k % 2 ? C.cream : C.petalD);
  }
}
function drawLounger(p) {
  const s = p.s,
    x = -120,
    y = -10;
  for (const dx of [-40, 40]) for (const dy of [-14, 14]) p.line([p.P(x + dx, y + dy, 0), p.P(x + dx, y + dy, 16)], '#A87544', 2.4);
  p.cut([p.P(x - 44, y - 18, 16), p.P(x + 46, y - 18, 16), p.P(x + 46, y + 18, 16), p.P(x - 44, y + 18, 16)], '#C98A42', { blur: 4 });
  const seat = [p.P(x - 18, y - 16, 19), p.P(x + 44, y - 16, 19), p.P(x + 44, y + 16, 19), p.P(x - 18, y + 16, 19)];
  p.cut(seat, C.cream, { blur: 2, rough: 0.3 });
  p.clip(seat, () => {
    for (let k = 0; k < 6; k++) {
      const xx = x - 14 + k * 11;
      p.flat([p.P(xx, y - 16, 19), p.P(xx + 5, y - 16, 19), p.P(xx + 5, y + 16, 19), p.P(xx, y + 16, 19)], '#8EC3CF');
    }
  });
  const back = [p.P(x - 18, y - 16, 19), p.P(x - 18, y + 16, 19), p.P(x - 46, y + 16, 52), p.P(x - 46, y - 16, 52)];
  p.cut(back, C.cream, { blur: 3, rough: 0.3 });
  p.clip(back, () => {
    for (let k = 0; k < 3; k++) {
      const f = 0.1 + k * 0.32;
      p.flat(
        [
          p.P(lerp(x - 18, x - 46, f), y - 16, lerp(19, 52, f)),
          p.P(lerp(x - 18, x - 46, f + 0.14), y - 16, lerp(19, 52, f + 0.14)),
          p.P(lerp(x - 18, x - 46, f + 0.14), y + 16, lerp(19, 52, f + 0.14)),
          p.P(lerp(x - 18, x - 46, f), y + 16, lerp(19, 52, f)),
        ],
        '#8EC3CF',
      );
    }
  });
}
function drawLemon(p) {
  const R0 = rng('limonero'),
    x = -212,
    y = -150,
    s = p.s;
  pot(p, x, y, 30, 38, C.teal);
  p.line([p.P(x, y, 36), p.P(x + 2, y, 110)], C.brown, 5, 1, { sh: 1 });
  const c = p.P(x, y, 130);
  for (const [col, n, rr] of [
    [C.sageD, 7, 40],
    [C.sage, 8, 36],
    ['#B9CD92', 5, 24],
  ])
    for (let k = 0; k < n; k++) {
      const a = rd(R0, 0, TAU),
        d = rd(R0, 0, rr);
      p.cut(p.ell(c[0] + Math.cos(a) * d * s, c[1] + Math.sin(a) * d * s * 0.75, rd(R0, 18, 26), rd(R0, 14, 20), 22), col, {
        blur: 4,
        rough: 1.4,
      });
    }
  for (let k = 0; k < 11; k++) {
    const a = rd(R0, 0, TAU),
      d = rd(R0, 4, 40),
      q = [c[0] + Math.cos(a) * d * s, c[1] + Math.sin(a) * d * s * 0.75];
    p.cut(p.ell(q[0], q[1], 5.5, 4.4, 14, 0.4), '#F7D548', { blur: 2, rough: 0.2 });
    p.flat(p.ell(q[0] - 1.5 * s, q[1] - 1.2 * s, 1.6, 1, 8), '#FFF4C0', 0.8);
  }
}
function drawLemonade(p) {
  const s = p.s,
    x = -78,
    y = -122;
  p.line([p.P(x, y, 0), p.P(x, y, 34)], '#A87544', 3);
  const t = p.ring(x, y, 36, 22, 22, 28);
  p.cut(t, C.cream, { blur: 4, rough: 0.3 });
  const pj = p.P(x - 4, y, 36);
  p.cut(
    [
      [pj[0] - 7 * s, pj[1]],
      [pj[0] + 7 * s, pj[1]],
      [pj[0] + 6 * s, pj[1] - 20 * s],
      [pj[0] - 6 * s, pj[1] - 20 * s],
    ],
    'rgba(247,213,72,.85)',
    { blur: 2, rough: 0.2 },
  );
  p.flat(
    [
      [pj[0] - 6 * s, pj[1] - 20 * s],
      [pj[0] + 6 * s, pj[1] - 20 * s],
      [pj[0] + 6 * s, pj[1] - 16 * s],
      [pj[0] - 6 * s, pj[1] - 16 * s],
    ],
    '#FFF4C0',
    0.8,
  );
  p.flat(p.ell(pj[0] + 2 * s, pj[1] - 12 * s, 3.4, 3.4, 12), '#F2E27A');
  for (const dx of [10, 16]) {
    const g = p.P(x + dx, y + 4, 36);
    p.cut(
      [
        [g[0] - 3.2 * s, g[1]],
        [g[0] + 3.2 * s, g[1]],
        [g[0] + 3.6 * s, g[1] - 10 * s],
        [g[0] - 3.6 * s, g[1] - 10 * s],
      ],
      'rgba(247,213,72,.7)',
      { blur: 1.5, rough: 0 },
    );
  }
}
function drawBall(p) {
  const s = p.s,
    c = p.P(110, 100, 16),
    B = p.ell(c[0], c[1], 16, 16, 30);
  p.flat(p.ell(...p.P(110, 100, 0), 16, 6), 'rgba(90,50,20,.2)');
  p.cut(B, C.cream, { blur: 3, rough: 0.2 });
  p.clip(B, () => {
    const cols = [C.petalD, '#8EC3CF', C.butter];
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU;
      p.flat(
        [
          [c[0], c[1]],
          [c[0] + Math.cos(a) * 20 * s, c[1] + Math.sin(a) * 20 * s],
          [c[0] + Math.cos(a + 0.9) * 20 * s, c[1] + Math.sin(a + 0.9) * 20 * s],
        ],
        cols[k],
      );
    }
    p.flat(p.ell(c[0] - 5 * s, c[1] - 6 * s, 5, 3.4, 12), '#FFFFFF', 0.5);
  });
}

/* ── OTOÑO · el taller de papel ── */
const OTO = {
  seed: 'oto',
  floor: '#EFD6A6',
  tiles: ['#E8C98E', '#E2BD7E', '#EDD3A0', '#DDB074', '#E9C487'],
  walls: { '3,4': '#EFD29B', '4,5': '#F4DBA8', '5,0': '#F1D5A0' },
  relief: ['#DDB672', '#FBE7BF'],
  wainscot: '#B8733A',
  seam: '#C99A55',
  floorDecor(p, R0) {
    const s = p.s;
    for (let k = 0; k < 26; k++) {
      const a = rd(R0, 0, TAU),
        d = Math.sqrt(R0()) * 45,
        q = p.P(210 + Math.cos(a) * d * 1.2, -40 + Math.sin(a) * d * 0.7, 0);
      leafShape(p, q[0], q[1] - rd(R0, 0, 6) * s, rd(R0, 0, TAU), rd(R0, 9, 13), pick(R0, ['#E07A3E', '#C9563A', '#F0B048', '#D8913E']));
    }
  },
};
function otoBase(p) {
  const s = p.s,
    R0 = rng('oto-dec');
  shell(p, OTO);
  /* pared noreste: estantes de resmas y tendedero de grabados */
  const eR = [5, 0];
  const line = [];
  for (let k = 0; k <= 16; k++) {
    const u = 0.06 + (k / 16) * 0.88;
    line.push(p.W(wallPt(eR, u, 112 - Math.sin(((u - 0.06) / 0.88) * Math.PI) * 8, 3)));
  }
  p.line(line, C.amberD, 1, 0.8);
  for (let k = 1; k < 16; k += 3) {
    const q = line[k],
      pr = [
        [q[0] - 9 * s, q[1] + 2 * s],
        [q[0] + 9 * s, q[1] + 1 * s],
        [q[0] + 9 * s, q[1] + 22 * s],
        [q[0] - 9 * s, q[1] + 23 * s],
      ];
    p.cut(pr, C.cream, { blur: 3, rough: 0.3 });
    p.flat(p.ell(q[0], q[1] + 12 * s, 5, 5, 14), pick(R0, [C.petalD, C.teal, C.butter, C.terra]), 0.85);
    p.flat(p.ell(q[0] + 3 * s, q[1] + 14 * s, 4, 3, 12), pick(R0, [C.sage, C.petal]), 0.7);
    p.cut(
      [
        [q[0] - 1.5 * s, q[1] - 2 * s],
        [q[0] + 1.5 * s, q[1] - 2 * s],
        [q[0] + 1.5 * s, q[1] + 5 * s],
        [q[0] - 1.5 * s, q[1] + 5 * s],
      ],
      '#B8783A',
      { sh: 0, rough: 0 },
    );
  }
  /* pared del fondo: ventana con el arce de la calle y dos carteles */
  const eT = [4, 5];
  p.cut(circWin(p, eT, 0.2, 80, 30), C.honey, { blur: 4 });
  const gw = circWin(p, eT, 0.2, 80, 23);
  p.flat(gw, '#F6E3B7');
  p.clip(gw, () => {
    const q = p.W(wallPt(eT, 0.2, 70, -10));
    for (let k = 0; k < 9; k++)
      p.cut(
        p.ell(q[0] + rd(R0, -22, 22) * s, q[1] - rd(R0, 0, 26) * s, rd(R0, 8, 13), rd(R0, 6, 10), 18),
        pick(R0, ['#E07A3E', '#C9563A', '#F0B048']),
        { sh: 0, rough: 0.8 },
      );
  });
  shellTop(p, OTO);
}
function drawPress(p) {
  const s = p.s,
    x = 135,
    y = -45,
    R0 = rng('prensa');
  for (const dx of [-34, 34]) for (const dy of [-16, 16]) p.line([p.P(x + dx, y + dy, 0), p.P(x + dx, y + dy, 34)], '#5F5048', 3);
  const box = (x0, x1, y0, y1, z0, z1, c1, c2, c3) => {
    p.cut([p.P(x0, y1, z0), p.P(x1, y1, z0), p.P(x1, y1, z1), p.P(x0, y1, z1)], c1, { blur: 4 });
    p.cut([p.P(x1, y1, z0), p.P(x1, y0, z0), p.P(x1, y0, z1), p.P(x1, y1, z1)], c2, { sh: 0, rough: 0.3 });
    p.cut([p.P(x0, y0, z1), p.P(x1, y0, z1), p.P(x1, y1, z1), p.P(x0, y1, z1)], c3, { sh: 0, rough: 0.3 });
  };
  box(x - 40, x + 40, y - 20, y + 20, 34, 44, '#B8783A', '#9A6230', '#D69646');
  box(x - 26, x + 22, y - 16, y + 16, 44, 70, '#6F8D8A', '#5A7472', '#84A29F');
  box(x - 30, x + 26, y - 14, y + 14, 70, 80, '#5F7B78', '#4E6664', '#7C9895');
  const sh = [p.P(x - 24, y - 10, 45), p.P(x + 20, y - 10, 45), p.P(x + 26, y + 22, 44), p.P(x - 18, y + 22, 44)];
  p.cut(sh, C.cream, { blur: 2, rough: 0.3 });
  p.flat(p.ell(...p.P(x, y + 8, 45), 7, 4, 14), C.petalD, 0.8);
  p.flat(p.ell(...p.P(x + 6, y + 10, 45), 6, 3, 14), C.teal, 0.6);
  const w = p.P(x + 46, y, 62);
  p.cut(p.ell(w[0], w[1], 22, 24, 30), '#D69646', { blur: 4, rough: 0.4 });
  p.flat(p.ell(w[0], w[1], 16, 18, 26), '#7C5530');
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * TAU;
    p.line([w, [w[0] + Math.cos(a) * 17 * s, w[1] + Math.sin(a) * 19 * s]], '#D69646', 2.4);
  }
  p.cut(p.ell(w[0], w[1], 4, 4, 12), C.honeyL, { sh: 0, rough: 0 });
}
function drawMaple(p) {
  const R0 = rng('arce'),
    x = 222,
    y = -150,
    s = p.s;
  pot(p, x, y, 32, 40, C.teal);
  const t0 = p.P(x, y, 36),
    t1 = p.P(x - 4, y, 140);
  p.cut(
    [
      [t0[0] - 6 * s, t0[1]],
      [t0[0] + 6 * s, t0[1]],
      [t1[0] + 4 * s, t1[1]],
      [t1[0] + 18 * s, t1[1] - 20 * s],
      [t1[0] + 10 * s, t1[1] - 22 * s],
      [t1[0] - 2 * s, t1[1] - 6 * s],
      [t1[0] - 16 * s, t1[1] - 20 * s],
      [t1[0] - 22 * s, t1[1] - 14 * s],
      [t1[0] - 5 * s, t1[1] + 4 * s],
    ],
    C.brown,
    { blur: 3 },
  );
  const c = p.P(x, y, 166);
  for (const [col, n, rr] of [
    ['#B8563A', 7, 48],
    ['#E07A3E', 8, 44],
    ['#F0A848', 6, 32],
  ])
    for (let k = 0; k < n; k++) {
      const a = rd(R0, 0, TAU),
        d = rd(R0, 0, rr);
      p.cut(
        p.ell(c[0] + Math.cos(a) * d * s * 1.1, c[1] + Math.sin(a) * d * s * 0.75, rd(R0, 20, 30), rd(R0, 15, 22), 22, rd(R0, 0, 3)),
        col,
        { blur: 4, rough: 1.6 },
      );
    }
  for (let k = 0; k < 24; k++) {
    const a = rd(R0, 0, TAU),
      d = rd(R0, 20, 70),
      q = [c[0] + Math.cos(a) * d * s, c[1] + Math.sin(a) * d * s * 0.7];
    leafShape(p, q[0], q[1], a, rd(R0, 9, 12), pick(R0, ['#C9563A', '#F0B048', '#E07A3E']));
  }
}
function drawTable(p) {
  const R0 = rng('mesa'),
    x = 160,
    y = 85,
    s = p.s;
  for (const [dx, dy] of [
    [-52, -24],
    [52, -24],
    [-52, 24],
    [52, 24],
  ])
    p.line([p.P(x + dx, y + dy, 0), p.P(x + dx, y + dy, 36)], '#9A6230', 3.4);
  p.cut([p.P(x - 58, y + 28, 36), p.P(x + 58, y + 28, 36), p.P(x + 58, y + 28, 42), p.P(x - 58, y + 28, 42)], '#B8783A', { blur: 4 });
  p.cut([p.P(x - 58, y - 28, 42), p.P(x + 58, y - 28, 42), p.P(x + 58, y + 28, 42), p.P(x - 58, y + 28, 42)], '#D69646', {
    sh: 0,
    rough: 0.3,
  });
  for (let k = 0; k < 4; k++) {
    const q = p.P(x - 30 + k * 4, y - 6 + k * 2, 43 + k),
      pr = [
        [q[0] - 15 * s, q[1] - 9 * s],
        [q[0] + 15 * s, q[1] - 10 * s],
        [q[0] + 15 * s, q[1] + 8 * s],
        [q[0] - 15 * s, q[1] + 9 * s],
      ];
    p.cut(pr, C.cream, { blur: 2, rough: 0.3 });
  }
  {
    const q = p.P(x - 18, y, 47);
    p.flat(p.ell(q[0], q[1], 8, 5, 16), C.petalD, 0.85);
    p.flat(p.ell(q[0] + 4 * s, q[1] + 1 * s, 7, 4, 16), C.butter, 0.7);
  }
  for (const [dx, col] of [
    [22, C.petalD],
    [34, C.teal],
    [46, C.butter],
  ]) {
    const c = cylinder(p, x + dx, y + 12, 42, 5, 8, col, '#3A2A20');
  }
  const b = p.P(x + 26, y - 14, 44);
  p.cut(
    [
      [b[0] - 10 * s, b[1] - 4 * s],
      [b[0] + 10 * s, b[1] - 4 * s],
      [b[0] + 10 * s, b[1] + 3 * s],
      [b[0] - 10 * s, b[1] + 3 * s],
    ],
    '#5A4A42',
    { blur: 2, rough: 0.2 },
  );
  p.line(
    [
      [b[0] + 10 * s, b[1]],
      [b[0] + 22 * s, b[1] - 6 * s],
    ],
    '#B8783A',
    2.4,
  );
}
function drawReams(p) {
  const x = -40,
    y = 165,
    s = p.s;
  let z = 0;
  for (const [col, h] of [
    [C.petal, 12],
    ['#8EC3CF', 14],
    [C.butter, 12],
    [C.cream, 10],
  ]) {
    const w = 30,
      d = 20,
      F = [p.P(x - w, y + d, z), p.P(x + w, y + d, z), p.P(x + w, y + d, z + h), p.P(x - w, y + d, z + h)];
    p.cut(F, C.cream, { blur: 3, rough: 0.3 });
    for (let yy = z + 2; yy < z + h; yy += 2.2) p.line([p.P(x - w, y + d, yy), p.P(x + w, y + d, yy)], col, 0.8, 0.7);
    p.cut([p.P(x - w, y - d, z + h), p.P(x + w, y - d, z + h), p.P(x + w, y + d, z + h), p.P(x - w, y + d, z + h)], C.cream, {
      sh: 0,
      rough: 0.3,
    });
    z += h;
  }
}
const LEAVES = [...Array(5)].map((_, k) => {
  const R0 = rng('h' + k);
  return [rd(R0, 170, 270), rd(R0, -190, -110), R0(), rd(R0, 0.05, 0.08), rd(R0, 0, TAU), R0()];
});

/* ── INVIERNO · la brasa ── */
const INV = {
  seed: 'inv',
  floor: '#ECEBE2',
  tiles: ['#E3E8E6', '#D8E1E2', '#EEF0EA', '#CFDADD', '#E6E3D8'],
  walls: { '3,4': '#E9DEC6', '4,5': '#EFE5CF', '5,0': '#ECE1CA' },
  relief: ['#D7C9A8', '#FBF4E3'],
  wainscot: '#8FA7B3',
  seam: '#BFAE8A',
  floorDecor(p, R0) {
    const s = p.s,
      c = [-95, 40];
    for (const [f, col] of [
      [1, C.petalD],
      [0.82, C.cream],
      [0.64, C.sage],
      [0.46, C.petal],
      [0.28, C.butter],
      [0.12, C.cream],
    ])
      p.cut(p.ring(c[0], c[1], 0, 130 * f, 90 * f, 40), col, { blur: 2.5, dy: 1, rough: 0.6 });
    for (let k = 0; k < 40; k++) {
      const a = (k / 40) * TAU,
        q = p.P(c[0] + Math.cos(a) * 136, c[1] + Math.sin(a) * 95, 0);
      p.line([q, [q[0] + Math.cos(a) * 4 * s, q[1] + Math.sin(a) * 3 * s]], C.cream, 1.4, 0.9);
    }
    const fl = p.P(-240, -50, 0);
    p.g.save();
    p.g.filter = `blur(${16 * s}px)`;
    p.flat(p.ell(fl[0], fl[1], 110, 50), '#FFC878', 0.5);
    p.g.restore();
  },
};
function invBase(p) {
  const s = p.s,
    R0 = rng('inv-dec');
  shell(p, INV);
  /* chimenea en la pared noroeste */
  const eL = [3, 4],
    u0 = 0.28,
    u1 = 0.72,
    dep = 26;
  const box = (z0, z1, d0, d1, col) =>
    p.cut([p.W(wallPt(eL, u0, z0, d1)), p.W(wallPt(eL, u1, z0, d1)), p.W(wallPt(eL, u1, z1, d1)), p.W(wallPt(eL, u0, z1, d1))], col, {
      blur: 4,
    });
  box(0, HW, 0, dep, '#C9694B');
  const fr = [p.W(wallPt(eL, u0, 0, dep)), p.W(wallPt(eL, u1, 0, dep)), p.W(wallPt(eL, u1, HW, dep)), p.W(wallPt(eL, u0, HW, dep))];
  p.clip(fr, () => {
    for (let z = 0, r = 0; z < HW; z += 11, r++)
      for (let u = u0 - (r % 2) * 0.03; u < u1; u += 0.06)
        p.cut(
          [
            p.W(wallPt(eL, u + 0.003, z + 1, dep + 0.5)),
            p.W(wallPt(eL, u + 0.056, z + 1, dep + 0.5)),
            p.W(wallPt(eL, u + 0.056, z + 10, dep + 0.5)),
            p.W(wallPt(eL, u + 0.003, z + 10, dep + 0.5)),
          ],
          pick(R0, ['#D07458', '#BD5E43', '#C9694B', '#B8583E']),
          { sh: 0, rough: 0.3 },
        );
  });
  p.cut([p.W(wallPt(eL, u1, 0, 0)), p.W(wallPt(eL, u1, 0, dep)), p.W(wallPt(eL, u1, HW, dep)), p.W(wallPt(eL, u1, HW, 0))], '#A5523A', {
    sh: 0,
    rough: 0.2,
  });
  const fb = [];
  fb.push(p.W(wallPt(eL, 0.38, 4, dep + 1)));
  for (let k = 0; k <= 12; k++) {
    const a = Math.PI - (k / 12) * Math.PI;
    fb.push(p.W(wallPt(eL, 0.5 + Math.cos(a) * 0.12, 44 + Math.sin(a) * 14, dep + 1)));
  }
  fb.push(p.W(wallPt(eL, 0.62, 4, dep + 1)));
  p.cut(
    fb.map((q) => q),
    '#3A2A20',
    { blur: 3, rough: 0.3 },
  );
  for (const u of [0.43, 0.5, 0.57]) {
    const q = p.W(wallPt(eL, u, 8, dep + 2));
    p.cut(p.ell(q[0], q[1], 9, 4, 14, 0.2), '#8A5A3A', { sh: 0, rough: 0.3 });
  }
  const ma = [
    p.W(wallPt(eL, u0 - 0.04, 62, 0)),
    p.W(wallPt(eL, u1 + 0.04, 62, 0)),
    p.W(wallPt(eL, u1 + 0.04, 62, dep + 10)),
    p.W(wallPt(eL, u0 - 0.04, 62, dep + 10)),
  ];
  p.cut(ma, '#D69646', { blur: 4 });
  p.cut([ma[3], ma[2], [ma[2][0], ma[2][1] + 6 * s], [ma[3][0], ma[3][1] + 6 * s]], '#B06E2E', { sh: 0, rough: 0.2 });
  for (const [u, h] of [
    [0.34, 18],
    [0.4, 12],
  ]) {
    const q = p.W(wallPt(eL, u, 62, dep));
    p.cut(
      [
        [q[0] - 3 * s, q[1]],
        [q[0] + 3 * s, q[1]],
        [q[0] + 3 * s, q[1] - h * s],
        [q[0] - 3 * s, q[1] - h * s],
      ],
      C.cream,
      { blur: 2, rough: 0 },
    );
    p.flat(p.ell(q[0], q[1] - (h + 4) * s, 2.4, 3.6, 10), '#FFC24A');
  }
  {
    const q = p.W(wallPt(eL, 0.6, 62, dep - 4));
    p.cut(p.ell(q[0], q[1] - 12 * s, 10, 10, 20), '#D69646', { blur: 2 });
    p.flat(p.ell(q[0], q[1] - 12 * s, 7.5, 7.5, 20), C.cream);
    p.line(
      [
        [q[0], q[1] - 12 * s],
        [q[0], q[1] - 17 * s],
      ],
      C.ink,
      1,
    );
    p.line(
      [
        [q[0], q[1] - 12 * s],
        [q[0] + 4 * s, q[1] - 12 * s],
      ],
      C.ink,
      1,
    );
  }
  for (const u of [0.36, 0.5, 0.64]) {
    const q = p.W(wallPt(eL, u, 60, dep + 10));
    p.cut(
      [
        [q[0] - 5 * s, q[1]],
        [q[0] + 4 * s, q[1]],
        [q[0] + 4 * s, q[1] + 14 * s],
        [q[0] + 9 * s, q[1] + 18 * s],
        [q[0] + 8 * s, q[1] + 22 * s],
        [q[0] - 5 * s, q[1] + 20 * s],
      ],
      pick(R0, [C.petalD, C.sage, C.teal]),
      { blur: 3, rough: 0.3 },
    );
  }
  /* ventana nevada en la pared del fondo */
  const eT = [4, 5];
  p.cut(hexWin(p, eT, 0.2, 80, 34), C.honey, { blur: 4 });
  const gw = hexWin(p, eT, 0.2, 80, 26);
  p.flat(gw, '#3E4E6A');
  p.clip(gw, () => {
    const q = p.W(wallPt(eT, 0.2, 66, -10));
    p.flat(p.ell(q[0] - 10 * s, q[1] + 8 * s, 40, 12), '#EAF0F2');
    for (let k = 0; k < 4; k++) {
      const x = q[0] + (-22 + k * 14) * s;
      p.flat(
        [
          [x - 4 * s, q[1] + 2 * s],
          [x, q[1] - 12 * s],
          [x + 4 * s, q[1] + 2 * s],
        ],
        '#2E3B52',
      );
    }
    const m = p.W(wallPt(eT, 0.25, 96, -10));
    p.flat(p.ell(m[0], m[1], 5, 5, 14), '#FFF6D8');
  });
  shellTop(p, INV);
}
function drawArmchair(p) {
  const s = p.s,
    x = -110,
    y = 20;
  const box = (x0, x1, y0, y1, z0, z1, c1, c2, c3) => {
    p.cut([p.P(x0, y1, z0), p.P(x1, y1, z0), p.P(x1, y1, z1), p.P(x0, y1, z1)], c1, { blur: 4, rough: 0.4 });
    if (c2) p.cut([p.P(x1, y1, z0), p.P(x1, y0, z0), p.P(x1, y0, z1), p.P(x1, y1, z1)], c2, { sh: 0, rough: 0.3 });
    p.cut([p.P(x0, y0, z1), p.P(x1, y0, z1), p.P(x1, y1, z1), p.P(x0, y1, z1)], c3, { sh: 0, rough: 0.3 });
  };
  box(x - 40, x + 40, y - 30, y - 12, 0, 74, '#E07F7F', '#C96A6A', '#F4AFA6');
  box(x - 42, x + 42, y - 14, y + 26, 0, 26, '#E07F7F', '#C96A6A', '#F4AFA6');
  box(x - 46, x - 34, y - 20, y + 28, 0, 40, '#D46F6F', '#B85C5C', '#EE9A93');
  const bl = [
    p.P(x + 10, y - 12, 74),
    p.P(x + 34, y - 12, 74),
    p.P(x + 40, y + 26, 24),
    p.P(x + 40, y + 30, 4),
    p.P(x + 14, y + 30, 4),
    p.P(x + 14, y + 26, 24),
  ];
  p.cut(bl, C.sage, { blur: 3, rough: 0.5 });
  p.clip(bl, () => {
    for (let k = 0; k < 5; k++) {
      const f = k / 5;
      p.line([p.P(x + 10 + f * 30, y - 12, 74), p.P(x + 14 + f * 28, y + 30, 4)], C.cream, 1.4, 0.6);
    }
  });
  box(x + 34, x + 46, y - 20, y + 28, 0, 40, '#D46F6F', '#B85C5C', '#EE9A93');
}
function drawSideTable(p) {
  const s = p.s,
    x = -26,
    y = 78;
  p.line([p.P(x, y, 0), p.P(x, y, 32)], '#A87544', 3.2);
  p.cut(p.ring(x, y, 34, 20, 20, 28), '#D69646', { blur: 4, rough: 0.3 });
  const m = cylinder(p, x - 2, y, 34, 6.5, 11, C.cream, '#8A5A3A');
  p.line(
    [
      [m.c[0] + 6 * s, m.c[1] + 4 * s],
      [m.c[0] + 10 * s, m.c[1] + 6 * s],
      [m.c[0] + 6 * s, m.c[1] + 9 * s],
    ],
    C.cream,
    1.8,
  );
}
function drawPine(p) {
  const R0 = rng('pino'),
    x = 205,
    y = 62,
    s = p.s;
  pot(p, x, y, 30, 36, C.petalD);
  p.line([p.P(x, y, 34), p.P(x, y, 56)], C.brown, 5);
  for (let k = 0; k < 3; k++) {
    const zb = 54 + k * 40,
      zt = zb + 62,
      rw = 56 - k * 14,
      b = p.P(x, y, zb),
      tp = p.P(x, y, zt);
    const T3 = [
      [b[0] - rw * s, b[1]],
      [tp[0], tp[1]],
      [b[0] + rw * s, b[1]],
      [b[0] + rw * 0.5 * s, b[1] + 6 * s],
      [b[0], b[1] + 8 * s],
      [b[0] - rw * 0.5 * s, b[1] + 6 * s],
    ];
    p.cut(T3, k % 2 ? C.sageD : '#5F7F50', { blur: 4, rough: 0.8 });
    p.flat(
      [
        [b[0] - rw * s, b[1]],
        [b[0] - rw * 0.5 * s, b[1] + 6 * s],
        [b[0], b[1] + 8 * s],
        [b[0] + rw * 0.5 * s, b[1] + 6 * s],
        [b[0] + rw * s, b[1]],
        [b[0] + rw * 0.6 * s, b[1] - 4 * s],
        [b[0], b[1] - 2 * s],
        [b[0] - rw * 0.6 * s, b[1] - 4 * s],
      ],
      C.cream,
      0.9,
    );
    for (let m = 0; m < 5; m++) {
      const f = (m + 0.5) / 5;
      flowerDot(
        p,
        b[0] - rw * 0.75 * s + f * rw * 1.5 * s,
        b[1] - rw * 0.35 * s * Math.sin(f * Math.PI) - rd(R0, 4, 10) * s,
        2.2,
        pick(R0, [C.butter, C.petal, '#8EC3CF']),
        '#FFF6D8',
      );
    }
  }
  const st = p.P(x, y, 178),
    star = [];
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k / 10) * TAU,
      r = (k % 2 ? 4 : 10) * s;
    star.push([st[0] + Math.cos(a) * r, st[1] + Math.sin(a) * r]);
  }
  p.cut(star, C.butter, { blur: 3, rough: 0 });
}
function drawWood(p) {
  const s = p.s,
    x = -238,
    y = 70;
  for (let row = 0; row < 3; row++)
    for (let k = 0; k < 4 - row; k++) {
      const c = p.P(x - 24 + k * 16 + row * 8, y + 22, 9 + row * 16);
      p.cut(p.ell(c[0], c[1], 8, 8, 18), '#C98A5A', { blur: 3, rough: 0.4 });
      p.flat(p.ell(c[0], c[1], 5, 5, 14), '#E8C290');
      p.line(p.ell(c[0], c[1], 2.5, 2.5, 10), '#B8783A', 0.8);
    }
}
function drawYarn(p) {
  const s = p.s,
    x = -40,
    y = 135,
    b = cylinder(p, x, y, 0, 16, 16, '#C98A42', '#8E5B2E');
  for (const [dx, dy, col] of [
    [-5, -3, C.petalD],
    [5, -4, C.sage],
    [0, -8, C.butter],
  ]) {
    const q = [b.c[0] + dx * s, b.c[1] + dy * s];
    p.cut(p.ell(q[0], q[1], 6, 5.6, 16), col, { blur: 2, rough: 0.3 });
    p.line(
      [
        [q[0] - 4 * s, q[1] - 2 * s],
        [q[0] + 4 * s, q[1] + 2 * s],
      ],
      'rgba(255,255,255,.5)',
      0.8,
    );
  }
}
const SNOWW = [...Array(16)].map((_, k) => {
  const R0 = rng('nv' + k);
  return [rd(R0, -0.08, 0.08), R0(), rd(R0, 0.25, 0.45)];
});

/* ══════════ el objeto de estilo ══════════ */
const tn = document.getElementById('tn'),
  ts = document.getElementById('ts');
const STYLE = {
  Pen,
  doorBack,
  doorLeaves,
  lip,
  sign,
  signAt,
  backdrop,
  ghost,
  doorLabel,
  hot,
  want,
  token,
  blocker,
  bridge: bridgeDyn,
  crank,
  actLabel: (t) => (COARSE ? t : `${t} · E`),
  player: (p, x, y, z, f, t, moving) => {
    const Q = p.P(x, y, 0);
    if (!p.noShadow) p.flat(p.ell(Q[0], Q[1] + 1 * p.s, 17 * PAPER.scale, 6 * PAPER.scale), 'rgba(70,40,15,.24)');
    paperFigure(p, 'player', f, (q, sg) => drawPerson(q, x, y, z, sg, t, moving), { ax: Q[0], ay: Q[1] });
  },
  mark: markRing,
  typewriter: false,
  snapTint: 'rgba(126,74,30,.26)',
  init() {
    if (!GRAIN) GRAIN = grain();
  },
  afterBake: applyGrain,
  tag(c) {
    tn.textContent = _t(SEASON[c.id].name);
    ts.textContent = _t(c.sub);
  },
  talkLabel: (n) => (COARSE ? `Hablar con ${n.name}` : `${n.name} · E para hablar`),
  setTalk(b, l) {
    const sp = b.firstElementChild;
    l = _t(l);
    if (sp.textContent !== l) sp.textContent = l;
  },
  dlgName: (n) => n.name,
  dlgHint: () => (COARSE ? 'Toca para seguir' : 'E para seguir · Esc para cerrar'),
  portrait(cv2, n, ex) {
    const w = Math.round(88 * DPR),
      h = Math.round(77 * DPR);
    cv2.width = w;
    cv2.height = h;
    const g = cv2.getContext('2d');
    const gr = g.createRadialGradient(w * 0.5, h * 0.4, 4, w * 0.5, h * 0.5, w * 0.7);
    gr.addColorStop(0, n.pbg[0]);
    gr.addColorStop(1, n.pbg[1]);
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    n.draw(Pen(g, w * n.pf[0], h + n.pf[1] * DPR, n.pf[2] * DPR, 'retrato', false, true), 0, 0, n.pf[3], 1.3, ex, true);
    applyGrain(cv2);
  },
  cells: {
    pri: {
      sub: 'La celda de Brote',
      base: priBase,
      props: [
        { id: 'cerezo', y: -185, bb: [-255, -400, -5, -70], draw: drawCherry },
        { id: 'huerto', y: 14, bb: [-85, -130, 110, 25], draw: drawPlanter },
        { id: 'reg', y: 95, bb: [-168, -2, -78, 78], draw: drawCan },
      ],
      solids: [
        [-130, -185, 44],
        [10, -55, 88],
        [-110, 95, 22],
        [-45, 55, 40],
      ],
      npc: {
        name: 'Brote',
        x: -45,
        y: 55,
        f: 1,
        lz: 80,
        draw: drawSnail,
        idle: 'smile',
        pbg: ['#E6ECC8', '#B9CC98'],
        pf: [0.82, 12, 1.55, -1],
        ex: ['open', 'smile', 'happy'],
        lines: [
          '¡Despacito! Acabo de sembrar las lechugas y todavía están tímidas.',
          'Llego tarde a todo, menos a la lluvia.',
          'Dicen que en la celda de al lado ya empezó el verano. Yo voy a mi ritmo.',
        ],
      },
      under(p, T, st) {
        if (!st) windowRain(p, T, [4, 5], 0.5, 80, 47);
      },
      over(p, T, st) {
        if (st) return;
        const s = p.s;
        if (PROG.F.bloom)
          for (const [x, y, o, spd, ph] of PET) {
            const u = (T * spd + o) % 1,
              q = p.P(x + u * 120 + Math.sin(T * 1.2 + ph) * 14, y + u * 80, 190 * (1 - u));
            p.flat(p.ell(q[0], q[1], 3.4, 1.8, 10, T * 2 + ph), C.petalL, u > 0.9 ? (1 - u) * 10 : 1);
          }
      },
    },
    ver: {
      sub: 'La terraza de la siesta',
      base: verBase,
      props: [
        { id: 'pileta', y: 30, bb: [-62, -95, 142, 28], draw: drawPool },
        { id: 'sombrilla', y: -60, bb: [-290, -227, -120, 8], draw: drawParasol },
        { id: 'tumbona', y: 10, bb: [-180, -81, -60, 14], draw: drawLounger },
        { id: 'limonada', y: -118, bb: [-115, -150, -45, -60], draw: drawLemonade },
      ],
      solids: [
        [40, -50, 96],
        [-205, -60, 18],
        [-145, -10, 30],
        [-95, -10, 30],
        [-78, -122, 26],
      ],
      npc: {
        name: 'Solano',
        x: -120,
        y: -8,
        turn: false,
        dy: 20,
        f: 1,
        lz: 74,
        tx: 70,
        ty: 55,
        draw: drawLizard,
        idle: 'neutral',
        pbg: ['#FFF1C4', '#F2C979'],
        pf: [1.23, 56, 1.9, 1],
        ex: ['neutral', 'smile', 'happy'],
        lines: [
          'Mmm… ¿ya es la hora de la limonada?',
          'Yo no duermo la siesta: la practico con disciplina.',
          'Si vas al taller de Ocre, dile que el sol de aquí no se imprime: se toma.',
        ],
      },
      over(p, T, st) {
        if (st) return;
        const s = p.s;
        for (let k = 0; k < 3; k++) {
          const u = (T * 0.22 + k / 3) % 1,
            q = p.P(-160 + u * 20, -8, 62 + u * 50);
          p.text('z', q[0] + Math.sin(T * 2 + k) * 4 * s, q[1], 10 + u * 8, C.ink, { alpha: Math.sin(u * Math.PI) * 0.7 });
        }
      },
    },
    oto: {
      sub: 'El taller de papel',
      base: otoBase,
      props: [
        { id: 'prensa', y: -15, bb: [70, -150, 210, -15], draw: drawPress },
        { id: 'arce', y: -150, bb: [130, -360, 310, -70], draw: drawMaple },
      ],
      solids: [
        [135, -45, 52],
        [222, -150, 40],
      ],
      npc: {
        name: 'Ocre',
        x: 70,
        y: -10,
        f: 1,
        lz: 96,
        tx: -40,
        ty: 40,
        draw: drawMoth,
        idle: 'smile',
        pbg: ['#FBE3BA', '#E9B26E'],
        pf: [0.4, 70, 1.35, 1],
        ex: ['open', 'smile', 'happy'],
        lines: [
          'Cuidado, la tinta todavía está fresca.',
          'Cada color es una pasada distinta. Si se corre un poco, mejor: así se nota la mano.',
          'Las hojas del arce son mis mejores marcapáginas. Y mis peores clientes: nunca pagan.',
        ],
      },
      over(p, T, st) {
        if (st) return;
        const s = p.s;
        for (const [x, y, o, spd, ph, c] of LEAVES) {
          const u = (T * spd + o) % 1,
            q = p.P(x - u * 120 + Math.sin(T * 1.1 + ph) * 18, y + u * 120, 170 * (1 - u));
          const L = p.leaf(q[0], q[1], T * 1.6 + ph, 11, 4.6);
          p.cut(L, c < 0.33 ? '#E07A3E' : c < 0.66 ? '#F0B048' : '#C9563A', {
            rough: 0,
            dy: 5,
            shc: 'rgba(78,44,16,.16)',
            alpha: u > 0.92 ? (1 - u) / 0.08 : 1,
          });
        }
      },
    },
    inv: {
      sub: 'La brasa',
      base: invBase,
      props: [
        { id: 'sillon', y: 50, bb: [-175, -110, -45, 65], draw: drawArmchair },
        { id: 'pino', y: 62, bb: [140, -210, 275, 100], draw: drawPine },
      ],
      solids: [
        [-110, 20, 50],
        [205, 62, 36],
      ],
      npc: {
        name: 'Escarcha',
        x: -116,
        y: 22,
        turn: false,
        dy: 32,
        f: 1,
        lz: 84,
        tx: -10,
        ty: 80,
        draw: drawHedgehog,
        idle: 'smile',
        pbg: ['#F4E8DA', '#D9C3B0'],
        pf: [0.28, 26, 1.45, 1],
        ex: ['smile', 'neutral', 'happy'],
        lines: [
          'Acércate al fuego, que afuera ya está nevando.',
          'Tengo té en la mesita. Todavía humea.',
          'Esta bufanda es para Brote. No le digas nada: siempre tiene frío en el cuello.',
        ],
      },
      under(p, T, st) {
        const s = p.s,
          eL = [3, 4],
          fl = st ? 0 : T;
        for (let k = 0; k < 3; k++) {
          const u = 0.44 + k * 0.06,
            h = (18 + 7 * Math.sin(fl * 7 + k * 2) + 4 * Math.sin(fl * 13 + k)) * (k === 1 ? 1.3 : 1),
            b = p.W(wallPt(eL, u, 6, 28)),
            tp = p.W(wallPt(eL, u + 0.006 * Math.sin(fl * 5 + k), 6 + h, 28));
          p.flat(
            [
              [b[0] - 7 * s, b[1]],
              [tp[0], tp[1]],
              [b[0] + 7 * s, b[1]],
            ],
            '#F08A3A',
          );
          p.flat(
            [
              [b[0] - 4 * s, b[1]],
              [lerp(b[0], tp[0], 0.6), lerp(b[1], tp[1], 0.6)],
              [b[0] + 4 * s, b[1]],
            ],
            '#FFD36A',
          );
        }
        if (!st) {
          const gw = hexWin(p, [4, 5], 0.2, 80, 26);
          p.clip(gw, () => {
            for (const [du, o, spd] of SNOWW) {
              const f = (T * spd + o) % 1,
                q = p.W(wallPt([4, 5], 0.2 + du, 104 - f * 48, -10));
              p.flat(p.ell(q[0] + Math.sin(T + o * 9) * 2 * s, q[1], 1.5, 1.5, 6), '#FFFFFF', 0.9);
            }
          });
        }
      },
      over(p, T, st) {
        if (st) return;
        const f = p.W(wallPt([3, 4], 0.5, 20, 40));
        p.g.save();
        p.g.globalCompositeOperation = 'lighter';
        p.flat(p.ell(f[0], f[1], 44 + Math.sin(T * 9) * 3, 20), 'rgba(255,150,60,.10)');
        p.g.restore();
      },
    },
  },
  sound: {
    beds(H) {
      const b = H.bus.bind(H);
      H.lfo(
        0.07,
        0.08,
        H.bed(
          b('pri'),
          H.nz.pink,
          [
            ['highpass', 1400],
            ['lowpass', 7000],
          ],
          0.22,
        ).gain,
      );
      H.bed(b('pri'), H.nz.brown, [['lowpass', 300]], 0.1);
      {
        const g = H.bed(b('ver'), H.nz.white, [['bandpass', 5400, 7]], 0.05),
          am = H.ac.createGain();
        am.gain.value = 0.5;
        g.disconnect();
        g.connect(am);
        am.connect(b('ver'));
        H.lfo(41, 0.05, g.gain);
        H.lfo(0.08, 0.5, am.gain);
        const w = H.bed(b('ver'), H.nz.brown, [['lowpass', 420]], 0.17);
        H.lfo(0.23, 0.07, w.gain);
      }
      H.lfo(0.05, 0.1, H.bed(b('oto'), H.nz.brown, [['bandpass', 620, 0.6]], 0.26).gain);
      H.bed(b('inv'), H.nz.brown, [['lowpass', 170]], 0.28);
      {
        const w = H.ac.createBufferSource();
        w.buffer = H.nz.pink;
        w.loop = true;
        const bq = H.ac.createBiquadFilter();
        bq.type = 'bandpass';
        bq.frequency.value = 720;
        bq.Q.value = 4;
        const g = H.ac.createGain();
        g.gain.value = 0.05;
        w.connect(bq);
        bq.connect(g);
        g.connect(b('inv'));
        w.start();
        H.lfo(0.07, 260, bq.frequency);
      }
    },
    voice(H, master) {
      const g = H.ac.createGain();
      g.gain.value = 0;
      g.connect(master);
      return { gain: g.gain, on: 0, off: 0 };
    },
    step(H, id) {
      const b = H.bus(id);
      if (id === 'oto' || id === 'inv') H.hit(b, H.nz.white, 'bandpass', H.rnd(650, 850), 1.2, 0.05, 0.05, 0.002);
      else H.hit(b, H.nz.white, 'bandpass', H.rnd(2200, 2800), 1.4, 0.035, 0.035, 0.002);
    },
    tick(H, id, t, nx) {
      const b = H.bus(id),
        r = H.rnd;
      if (id === 'pri') {
        if (!(t < nx.drop)) {
          H.tone(b, 'sine', r(2400, 3800), r(1600, 2400), r(0.02, 0.05), r(0.03, 0.06));
          nx.drop = t + r(0.05, 0.3);
        }
        if (!(t < nx.bird)) {
          let s = t;
          const n = 2 + Math.floor(Math.random() * 4),
            f = r(2600, 4000);
          for (let k = 0; k < n; k++) {
            H.tone(b, 'sine', f * r(0.9, 1.1), f * r(1.25, 1.55), 0.05, r(0.06, 0.09), s);
            s += r(0.09, 0.15);
          }
          nx.bird = t + r(3, 9);
        }
      } else if (id === 'ver') {
        if (!(t < nx.plip)) {
          H.tone(b, 'sine', r(700, 1000), r(350, 450), 0.04, 0.09);
          nx.plip = t + r(1.5, 5);
        }
      } else if (id === 'oto') {
        if (!(t < nx.riso)) {
          const n = 6 + Math.floor(Math.random() * 6);
          for (let k = 0; k < n; k++) {
            const s = t + 0.05 + k * 0.42;
            H.hit(b, H.nz.white, 'bandpass', 1500, 2.2, 0.16, 0.04, 0.002, s);
            H.tone(b, 'sine', 120, 70, 0.14, 0.07, s);
            H.hit(b, H.nz.white, 'bandpass', 4200, 1, 0.035, 0.14, 0.05, s + 0.18);
          }
          nx.riso = t + n * 0.42 + r(4, 8);
        }
        if (!(t < nx.rustle)) {
          H.hit(b, H.nz.pink, 'bandpass', 3200, 0.8, 0.06, 0.3, 0.12);
          nx.rustle = t + r(2, 6);
        }
      } else if (id === 'inv') {
        if (!(t < nx.crack)) {
          if (Math.random() < 0.25) H.hit(b, H.nz.white, 'bandpass', r(300, 600), 1, 0.12, 0.03, 0.001);
          else H.hit(b, H.nz.white, 'highpass', r(1800, 4500), 0.7, r(0.03, 0.13), r(0.004, 0.02), 0.001);
          nx.crack = t + (Math.random() < 0.2 ? r(0.01, 0.05) : r(0.08, 0.5));
        }
      }
    },
  },
};
/* ══════════ CAPÍTULO 2 · CUATRO CELDAS NUEVAS (papel) ══════════ */
Object.assign(SEASON, {
  esp: { tint: '#5B6399', seal: '#4A548E', icon: '✦', door: '#2A3160', name: 'Espacio' },
  oce: { tint: '#8FCFD3', seal: '#3E8FA0', icon: '≈', door: '#CFEFF0', name: 'Océano' },
  des: { tint: '#F0C98A', seal: '#D08A3C', icon: '▲', door: '#FBE3B4', name: 'Desierto' },
  ant: { tint: '#E3EEF4', seal: '#6F9DB8', icon: '❅', door: '#F0F7FA', name: 'Antártida' },
});

/* ─────────────── ESPACIO · El observatorio ─────────────── */
const ESP = {
  seed: 'esp',
  floor: '#2E3561',
  tiles: ['#343C6E', '#2F3666', '#3A4278', '#2B3262'],
  walls: { '3,4': '#2A305C', '4,5': '#303767', '5,0': '#2C335F' },
  relief: ['#232957', '#454E88'],
  wainscot: '#4B5290',
  seam: '#1E2448',
  floorDecor(p, R0) {
    const s = p.s;
    for (let k = 0; k < 22; k++) {
      const q = p.P(rd(R0, -R * 0.85, R * 0.85), rd(R0, -R * 0.8, R * 0.8), 0),
        r = rd(R0, 1.4, 3);
      p.flat(
        [
          [q[0] - r * s, q[1]],
          [q[0], q[1] - r * s],
          [q[0] + r * s, q[1]],
          [q[0], q[1] + r * s],
        ],
        '#F6E7B8',
        0.7,
      );
    }
    const c = p.P(10, -120, 0);
    p.flat(p.ell(c[0], c[1], 130, 50, 30), 'rgba(180,190,255,.10)');
  },
};
function espBase(p) {
  const s = p.s,
    R0 = rng('esp-dec');
  shell(p, ESP);
  const eT = [5, 0],
    w = circWin(p, eT, 0.5, 72, 54, 36);
  p.cut(circWin(p, eT, 0.5, 72, 62, 36), C.honey, { blur: 3, rough: 0.5 });
  p.flat(w, '#141A3A');
  p.clip(w, () => {
    for (let k = 0; k < 40; k++) {
      const q = p.W(wallPt(eT, 0.5 + rd(R0, -0.2, 0.2), rd(R0, 16, 126), -8));
      p.flat(p.ell(q[0], q[1], rd(R0, 0.6, 1.6), rd(R0, 0.6, 1.6), 6), '#FFF6D8', rd(R0, 0.5, 1));
    }
    const pl = p.W(wallPt(eT, 0.44, 86, -10));
    p.cut(p.ell(pl[0], pl[1], 20, 20, 28), '#E07A4E', { sh: 0, rough: 0.3 });
    p.flat(p.ell(pl[0] - 5 * s, pl[1] - 5 * s, 9, 8, 20), '#F29C6B', 0.8);
    const ring = p.ell(pl[0], pl[1], 34, 8, 32, -0.25);
    p.line([...ring, ring[0]], '#F4E2B8', 2.4, 0.9);
    const mo = p.W(wallPt(eT, 0.6, 110, -10));
    p.flat(p.ell(mo[0], mo[1], 7, 7, 18), '#EDE3C8');
    if (PROG.F.star) {
      const st = p.W(wallPt(eT, 0.57, 56, -10));
      p.flat(p.ell(st[0], st[1], 22, 22, 20), 'rgba(255,240,180,.3)');
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2;
        p.line(
          [
            [st[0], st[1]],
            [st[0] + Math.cos(a) * 15 * s, st[1] + Math.sin(a) * 15 * s],
          ],
          '#FFF4C2',
          2.2,
        );
      }
      p.flat(p.ell(st[0], st[1], 6, 6, 16), '#FFFBE6');
    }
  });
  const eL = [3, 4],
    cm = p.W(wallPt(eL, 0.5, 70, 1));
  p.cut(p.ell(cm[0], cm[1], 38, 40, 30), '#F3E6C4', { blur: 3, rough: 0.6 });
  const pts = [
    [-0.07, 86],
    [-0.03, 74],
    [0.02, 80],
    [0.06, 66],
    [0.04, 56],
    [-0.05, 60],
  ].map(([du, z]) => p.W(wallPt(eL, 0.5 + du, z, 1.5)));
  p.line(pts, '#4A548E', 1.2, 0.8);
  for (const q of pts) p.flat(p.ell(q[0], q[1], 2, 2, 8), '#2E3561');
  const eR = [4, 5],
    gl = [];
  for (let k = 0; k <= 14; k++) {
    const u = 0.12 + (k / 14) * 0.76;
    gl.push(p.W(wallPt(eR, u, 112 - Math.sin((k / 14) * Math.PI) * 12, 2)));
  }
  p.line(gl, '#8A7A5A', 1, 0.7);
  for (let k = 1; k < 14; k += 2) {
    const q = gl[k];
    p.text('✦', q[0], q[1] + 5 * s, 9, '#F6D98A');
  }
  shellTop(p, ESP);
}
function drawTelescope(p) {
  const s = p.s,
    x = 20,
    y = -60,
    b = p.P(x, y, 0),
    hub = p.P(x, y, 44);
  p.flat(p.ell(b[0], b[1], 34, 12), 'rgba(10,10,30,.3)');
  for (const [dx, dy] of [
    [-26, 10],
    [24, 14],
    [2, -24],
  ])
    p.line([p.P(x + dx, y + dy, 0), hub], '#8A5A2E', 3.4);
  const a = p.P(x + 26, y + 12, 40),
    c = p.P(x - 26, y - 40, 96),
    ang = Math.atan2(c[1] - a[1], c[0] - a[0]),
    nx = -Math.sin(ang),
    ny = Math.cos(ang),
    w0 = 9 * s,
    w1 = 13 * s;
  p.cut(
    [
      [a[0] + nx * w0, a[1] + ny * w0],
      [c[0] + nx * w1, c[1] + ny * w1],
      [c[0] - nx * w1, c[1] - ny * w1],
      [a[0] - nx * w0, a[1] - ny * w0],
    ],
    '#D69646',
    { rough: 0.4 },
  );
  for (const f of [0.25, 0.6]) {
    const q = [lerp(a[0], c[0], f), lerp(a[1], c[1], f)],
      w = lerp(w0, w1, f) + 1.5 * s;
    p.line(
      [
        [q[0] + nx * w, q[1] + ny * w],
        [q[0] - nx * w, q[1] - ny * w],
      ],
      '#8A5A2E',
      3,
    );
  }
  if (PROG.F.star) p.flat(p.ell(c[0], c[1], 26, 26, 20), 'rgba(255,240,180,.3)');
  p.cut(p.ell(c[0], c[1], 13, 13, 24), '#8A5A2E', { sh: 0, rough: 0.2 });
  p.flat(p.ell(c[0], c[1], 9.5, 9.5, 20), PROG.F.star ? '#FFF4C2' : '#1B1F3E');
  if (!PROG.F.star)
    p.line(
      [
        [c[0] - 6 * s, c[1] - 5 * s],
        [c[0] + 1 * s, c[1] + 1 * s],
        [c[0] + 5 * s, c[1] - 2 * s],
      ],
      '#6A74B0',
      1,
      0.9,
    );
  p.cut(p.ell(a[0], a[1], 5, 5, 12), '#8A5A2E', { sh: 0, rough: 0 });
}
/* Orión, búho astrónomo */
function drawOwl(p, x, y, f, t, ex, portrait) {
  const s = p.s,
    br = Math.sin(t * 1.5) * 0.8,
    P = (dx, dz) => p.P(x + dx * f, y, dz);
  if (!portrait) p.flat(p.ell(...P(0, 0), 26, 8), 'rgba(10,10,30,.3)');
  for (const dx of [-6, 6]) p.line([P(dx, 2), P(dx + 3, -1)], '#E0A040', 2.6);
  const bc = P(0, 28 + br);
  p.cut(p.ell(bc[0], bc[1], 22, 28, 30), '#9A7454', { rough: 0.5 });
  p.cut(p.ell(bc[0] + 3 * f * s, bc[1] + 6 * s, 14, 19, 26), '#F1E1C0', { sh: 0, rough: 0.4 });
  for (let r = 0; r < 3; r++)
    for (let k = -1; k <= 1; k++) {
      const q = [bc[0] + 3 * f * s + k * 6 * s, bc[1] + (-2 + r * 8) * s];
      p.line(
        [
          [q[0] - 3 * s, q[1]],
          [q[0], q[1] + 2.4 * s],
          [q[0] + 3 * s, q[1]],
        ],
        '#C9A77E',
        1,
        0.9,
      );
    }
  p.cut([P(-18, 40 + br), P(-8, 40 + br), P(-4, 14), P(-16, 10)], '#7E5C40', { rough: 0.3 });
  const hc = P(2, 62 + br);
  for (const k of [-1, 1]) p.cut([P(2 + k * 9, 74 + br), P(2 + k * 16, 86 + br), P(2 + k * 17, 70 + br)], '#7E5C40', { rough: 0.2 });
  p.cut(p.ell(hc[0], hc[1], 20, 17, 28), '#9A7454', { rough: 0.5 });
  const e1 = P(-5, 63 + br),
    e2 = P(10, 63 + br);
  for (const e of [e1, e2]) p.cut(p.ell(e[0], e[1], 8, 8, 20), '#F6EBD0', { sh: 0, rough: 0.2 });
  face(p, [e1[0] + 1 * f * s, e1[1]], [e2[0] + 1 * f * s, e2[1]], P(3, 53 + br), f, t, ex, { er: 3.2, ph: 0.9 });
  const bk = P(3, 58 + br);
  p.cut(
    [
      [bk[0] - 3 * s, bk[1] - 3 * s],
      [bk[0] + 3 * s, bk[1] - 3 * s],
      [bk[0] + 0.5 * f * s, bk[1] + 4 * s],
    ],
    '#E0A040',
    { sh: 0, rough: 0 },
  );
  const sc = P(2, 45 + br);
  p.cut(
    [
      [sc[0] - 17 * s, sc[1] - 3 * s],
      [sc[0] + 17 * s, sc[1] - 3 * s],
      [sc[0] + 15 * s, sc[1] + 5 * s],
      [sc[0] - 15 * s, sc[1] + 5 * s],
    ],
    '#4A548E',
    { rough: 0.3 },
  );
  p.text('✦', sc[0] + 6 * f * s, sc[1] + 1 * s, 7, '#F6D98A');
}

/* ─────────────── OCÉANO · El arrecife ─────────────── */
const OCE = {
  seed: 'oce',
  floor: '#E7DBB4',
  tiles: ['#E4D5A8', '#DCCB9A', '#EDE2BF', '#D5DECB', '#E8DDB8'],
  walls: { '3,4': '#98CCD0', '4,5': '#A6D6D8', '5,0': '#9FD0D4' },
  relief: ['#80BABF', '#C7E8E9'],
  wainscot: '#5B9CAA',
  seam: '#6CA6AF',
  floorDecor(p, R0) {
    const s = p.s;
    for (let k = 0; k < 7; k++) {
      const q = p.P(rd(R0, -R * 0.8, R * 0.8), rd(R0, -R * 0.7, R * 0.8), 0);
      p.flat(p.ell(q[0], q[1], rd(R0, 30, 60), rd(R0, 10, 20), 24, rd(R0, 0, 3)), 'rgba(120,200,215,.16)');
    }
    for (let k = 0; k < 6; k++) {
      const q = p.P(rd(R0, -R * 0.7, R * 0.7), rd(R0, -R * 0.6, R * 0.75), 0);
      p.cut(p.ell(q[0], q[1], rd(R0, 4, 7), rd(R0, 2.4, 4), 12), pick(R0, ['#F6E6D0', '#E9C9B0', '#CFE3E3']), { rough: 0.3, dy: 1 });
    }
  },
};
function oceBase(p) {
  const s = p.s,
    R0 = rng('oce-dec');
  shell(p, OCE);
  const eT = [4, 5],
    w = circWin(p, eT, 0.5, 72, 46, 32);
  p.cut(circWin(p, eT, 0.5, 72, 54, 32), '#C9A05C', { blur: 3, rough: 0.4 });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU,
      q = p.W(wallPt(eT, 0.5 + (Math.cos(a) * 50) / 300, 72 + Math.sin(a) * 50, 1));
    p.flat(p.ell(q[0], q[1], 2.4, 2.4, 8), '#8A6A3A');
  }
  const g = p.g,
    gr = g.createLinearGradient(0, p.W(wallPt(eT, 0.5, 118))[1], 0, p.W(wallPt(eT, 0.5, 26))[1]);
  gr.addColorStop(0, '#4FA3B8');
  gr.addColorStop(1, '#1D5470');
  p.flat(w, gr);
  p.clip(w, () => {
    for (let k = 0; k < 3; k++) {
      const b = p.W(wallPt(eT, 0.5 + rd(R0, -0.08, 0.08), 30, -8));
      p.cut(p.leaf(b[0], b[1], -Math.PI / 2 + rd(R0, -0.25, 0.25), 44, 7), '#2F7A5A', { sh: 0, rough: 0.3 });
    }
    for (const [du, z, col, dir] of [
      [-0.06, 86, '#F09A4A', 1],
      [0.05, 64, '#F4C04E', -1],
      [0.02, 102, '#E97A5A', 1],
    ]) {
      const q = p.W(wallPt(eT, 0.5 + du, z, -8));
      p.cut(
        [
          [q[0] - 9 * dir * s, q[1]],
          [q[0] + 6 * dir * s, q[1] - 5 * s],
          [q[0] + 9 * dir * s, q[1]],
          [q[0] + 6 * dir * s, q[1] + 5 * s],
        ],
        col,
        { sh: 0, rough: 0.2 },
      );
      p.cut(
        [
          [q[0] - 8 * dir * s, q[1]],
          [q[0] - 15 * dir * s, q[1] - 5 * s],
          [q[0] - 15 * dir * s, q[1] + 5 * s],
        ],
        col,
        { sh: 0, rough: 0.2 },
      );
    }
  });
  const eL = [3, 4];
  for (let k = 0; k < 7; k++) {
    const u = 0.08 + k * 0.13,
      pts = [];
    for (let j = 0; j <= 10; j++) pts.push(p.W(wallPt(eL, u + Math.sin(j * 0.7 + k) * 0.012, 30 + j * 8, 2)));
    p.line(pts, k % 2 ? '#4E9A6E' : '#3C8560', 5 - (k % 2), 0.95);
  }
  const eR = [5, 0];
  for (let k = 0; k < 5; k++) p.line([p.W(wallPt(eR, 0.08 + k * 0.05, 110, 2)), p.W(wallPt(eR, 0.1 + k * 0.05, 40, 2))], '#B89A6A', 1, 0.6);
  for (let z = 48; z < 110; z += 14) p.line([p.W(wallPt(eR, 0.08, z, 2)), p.W(wallPt(eR, 0.3, z, 2))], '#B89A6A', 1, 0.6);
  {
    const q = p.W(wallPt(eR, 0.19, 74, 3));
    p.text('★', q[0], q[1], 16, '#E97A5A');
  }
  shellTop(p, OCE);
}
function drawReef(p) {
  const s = p.s,
    x = 150,
    y = 50,
    R0 = rng('arrecife'),
    b = p.P(x, y, 0);
  p.flat(p.ell(b[0], b[1], 70, 24), 'rgba(40,70,80,.22)');
  p.cut(
    [p.P(x - 62, y + 10, 0), p.P(x + 60, y + 14, 0), p.P(x + 52, y - 4, 22), p.P(x + 10, y - 10, 34), p.P(x - 40, y - 6, 26)],
    '#8FA6B0',
    { rough: 0.8 },
  );
  const branch = (bx, by, bz, h, col, n) => {
    const q0 = p.P(bx, by, bz);
    for (let k = 0; k < n; k++) {
      const a = -Math.PI / 2 + (k - (n - 1) / 2) * 0.42,
        L = h * (0.7 + 0.3 * R0()),
        pts = [q0];
      let q = q0;
      for (let j = 1; j <= 4; j++) {
        q = [q[0] + ((Math.cos(a + Math.sin(j + k) * 0.2) * L) / 4) * s, q[1] + ((Math.sin(a) * L) / 4) * s];
        pts.push(q);
      }
      p.line(pts, col, 6 - (k % 2), 1);
      p.cut(p.ell(q[0], q[1], 3.4, 3.4, 10), col, { sh: 0, rough: 0 });
    }
  };
  branch(x - 30, y - 4, 26, 70, '#E97A7A', 5);
  branch(x + 20, y - 6, 30, 86, '#F09A4A', 4);
  branch(x + 44, y + 4, 18, 54, '#C96AA0', 3);
  const cb = p.P(x - 4, y + 10, 20);
  p.cut(p.ell(cb[0], cb[1], 18, 12, 20), '#F4C04E', { rough: 0.5 });
  for (let k = 0; k < 4; k++)
    p.line(
      [
        [cb[0] - 12 * s, cb[1] - 6 * s + k * 4 * s],
        [cb[0] + 12 * s, cb[1] - 6 * s + k * 4 * s],
      ],
      '#D69646',
      1,
      0.7,
    );
  const an = p.P(x - 50, y + 12, 10);
  for (let k = 0; k < 9; k++) {
    const a = -Math.PI / 2 + (k - 4) * 0.3;
    p.line([an, [an[0] + Math.cos(a) * 16 * s, an[1] + Math.sin(a) * 16 * s]], '#F29CC2', 2.6);
  }
}
function drawClam(p) {
  const s = p.s,
    x = -160,
    y = -40,
    b = p.P(x, y, 0),
    c = p.P(x, y, 16);
  p.flat(p.ell(b[0], b[1], 40, 13), 'rgba(40,70,80,.22)');
  const bot = [],
    top = [];
  for (let k = 0; k <= 18; k++) {
    const a = (k / 18) * Math.PI;
    bot.push([c[0] + Math.cos(a) * 36 * s, c[1] + Math.sin(a) * 16 * s]);
    top.push([c[0] + Math.cos(a) * 36 * s, c[1] - 4 * s - Math.sin(a) * 26 * s]);
  }
  p.cut(top, '#B9A2C9', { rough: 0.4 });
  for (let k = 1; k < 6; k++) {
    const a = (k / 6) * Math.PI;
    p.line(
      [
        [c[0], c[1] - 4 * s],
        [c[0] + Math.cos(a) * 34 * s, c[1] - 4 * s - Math.sin(a) * 24 * s],
      ],
      '#9A82AE',
      1,
      0.7,
    );
  }
  p.flat(p.ell(c[0], c[1] - 2 * s, 32, 6, 20), '#F4E4EE');
  if (!PROG.F.gotPearl) {
    p.cut(p.ell(c[0], c[1] - 5 * s, 6, 6, 16), '#FFFFFF', { sh: 0, rough: 0 });
    p.flat(p.ell(c[0] - 2 * s, c[1] - 7 * s, 2, 2, 8), '#FFFFFF');
  }
  p.cut(bot, '#C9B2D9', { rough: 0.4 });
  for (let k = 1; k < 6; k++) {
    const a = (k / 6) * Math.PI;
    p.line(
      [
        [c[0], c[1]],
        [c[0] + Math.cos(a) * 34 * s, c[1] + Math.sin(a) * 14 * s],
      ],
      '#A48DB8',
      1,
      0.7,
    );
  }
}
/* Coral, pulpo guardián de perlas */
function drawOctopus(p, x, y, f, t, ex, portrait) {
  const s = p.s,
    br = Math.sin(t * 1.6) * 1.2,
    P = (dx, dz) => p.P(x + dx * f, y, dz);
  if (!portrait) p.flat(p.ell(...P(0, 0), 30, 9), 'rgba(40,70,80,.25)');
  for (let k = 0; k < 6; k++) {
    const a = (k - 2.5) * 0.42,
      pts = [];
    for (let j = 0; j <= 8; j++) {
      const u = j / 8;
      pts.push(P(Math.sin(a) * (8 + u * 26) + Math.sin(t * 2 + k + u * 3) * 3 * u, 14 - u * 14 + Math.sin(u * Math.PI) * 4));
    }
    p.line(pts, k % 2 ? '#B98ACF' : '#A77ABF', 6 - (k % 2) * 1.2);
  }
  const hc = P(0, 36 + br);
  p.cut(p.ell(hc[0], hc[1], 22, 24, 30), '#B98ACF', { rough: 0.5 });
  for (const [dx, dz, r] of [
    [-10, 48, 3],
    [8, 52, 2.4],
    [-2, 56, 2],
  ])
    p.flat(p.ell(...P(dx, dz + br), r, r, 10), '#D6B4E4');
  face(p, P(-3, 34 + br), P(10, 34 + br), P(4, 26 + br), f, t, ex, { cheek: P(-8, 28 + br), er: 2.8, ph: 2.3 });
  const bw = P(12, 56 + br);
  p.cut(
    [
      [bw[0] - 7 * s, bw[1] - 4 * s],
      [bw[0], bw[1]],
      [bw[0] - 7 * s, bw[1] + 4 * s],
    ],
    '#F29CC2',
    { sh: 0, rough: 0.2 },
  );
  p.cut(
    [
      [bw[0] + 7 * s, bw[1] - 4 * s],
      [bw[0], bw[1]],
      [bw[0] + 7 * s, bw[1] + 4 * s],
    ],
    '#F29CC2',
    { sh: 0, rough: 0.2 },
  );
  p.flat(p.ell(bw[0], bw[1], 2.2, 2.2, 8), '#FFFFFF');
}

/* ─────────────── DESIERTO · La duna ─────────────── */
const DES = {
  seed: 'des',
  floor: '#F1D29C',
  tiles: ['#EFCB8E', '#F4D9A6', '#E9C282', '#F6DFB0', '#EDC994'],
  walls: { '3,4': '#E6AE70', '4,5': '#EDBA7E', '5,0': '#E9B375' },
  relief: ['#D4935A', '#F6C88E'],
  wainscot: '#B9683F',
  seam: '#C27A4A',
  floorDecor(p, R0) {
    for (let k = 0; k < 9; k++) {
      const cx = rd(R0, -R * 0.6, R * 0.6),
        cy = rd(R0, -R * 0.55, R * 0.7),
        pts = [];
      for (let j = 0; j <= 10; j++) {
        const u = j / 10;
        pts.push(p.P(cx - 50 + u * 100, cy + Math.sin(u * Math.PI * 2) * 6, 0));
      }
      p.line(pts, '#D9A868', 1.6, 0.55);
    }
    const d = p.P(-190, 130, 0);
    p.cut(p.ell(d[0], d[1], 60, 18, 26), '#F6DDA8', { blur: 3, rough: 0.8, dy: 1 });
  },
};
function desBase(p) {
  const s = p.s,
    R0 = rng('des-dec');
  shell(p, DES);
  const eT = [4, 5],
    arch = [];
  for (let k = 0; k <= 20; k++) {
    const a = Math.PI + (k / 20) * Math.PI;
    arch.push(p.W(wallPt(eT, 0.5 + (Math.cos(a) * 48) / 300, 80 - Math.sin(a) * 38)));
  }
  arch.push(p.W(wallPt(eT, 0.5 + 48 / 300, 34)), p.W(wallPt(eT, 0.5 - 48 / 300, 34)));
  const g = p.g,
    gr = g.createLinearGradient(0, p.W(wallPt(eT, 0.5, 118))[1], 0, p.W(wallPt(eT, 0.5, 34))[1]);
  gr.addColorStop(0, '#F7C77A');
  gr.addColorStop(1, '#FBE8C0');
  p.flat(arch, gr);
  p.clip(arch, () => {
    const su = p.W(wallPt(eT, 0.56, 92, -10));
    p.flat(p.ell(su[0], su[1], 22, 22, 20), 'rgba(255,244,214,.35)');
    p.flat(p.ell(su[0], su[1], 13, 13, 20), '#FFF4D6');
    for (const [z0, col] of [
      [62, '#E9A95E'],
      [52, '#D98E48'],
      [44, '#C97A3A'],
    ]) {
      const pts = [];
      for (let k = 0; k <= 16; k++) {
        const u = k / 16;
        pts.push(p.W(wallPt(eT, 0.5 - 50 / 300 + (u * 100) / 300, z0 + Math.sin(u * Math.PI * 1.4 + z0) * 8, -10)));
      }
      pts.push(p.W(wallPt(eT, 0.5 + 50 / 300, 20, -10)), p.W(wallPt(eT, 0.5 - 50 / 300, 20, -10)));
      p.flat(pts, col);
    }
    const cb = p.W(wallPt(eT, 0.42, 54, -10));
    p.line([cb, [cb[0], cb[1] - 20 * s]], '#5E7A3A', 4);
    p.line(
      [
        [cb[0], cb[1] - 10 * s],
        [cb[0] - 6 * s, cb[1] - 10 * s],
        [cb[0] - 6 * s, cb[1] - 16 * s],
      ],
      '#5E7A3A',
      3,
    );
  });
  p.line([...arch, arch[0]], '#A85E34', 3.4);
  const eR = [5, 0],
    T0 = [p.W(wallPt(eR, 0.3, 110, 1)), p.W(wallPt(eR, 0.7, 110, 1)), p.W(wallPt(eR, 0.7, 50, 1)), p.W(wallPt(eR, 0.3, 50, 1))];
  p.cut(T0, '#C0563A', { blur: 3, rough: 0.4 });
  p.clip(T0, () => {
    for (let z = 56; z < 108; z += 13) {
      const pts = [];
      for (let k = 0; k <= 8; k++) pts.push(p.W(wallPt(eR, 0.3 + k * 0.05, z + (k % 2 ? 5 : -5), 1.5)));
      p.line(pts, z % 26 < 13 ? '#F4E1B8' : '#2E8A8A', 2.2);
    }
  });
  for (let k = 0; k < 8; k++) {
    const q = p.W(wallPt(eR, 0.31 + k * 0.055, 50, 1.5));
    p.line([q, [q[0], q[1] + 7 * s]], '#F4E1B8', 1.2);
  }
  shellTop(p, DES);
}
function drawKiln(p) {
  const s = p.s,
    x = 120,
    y = -60,
    c = p.P(x, y, 0);
  p.flat(p.ell(c[0], c[1], 60, 20), 'rgba(70,40,15,.25)');
  const ch = [
    [c[0] + 20 * s, c[1] - 50 * s],
    [c[0] + 34 * s, c[1] - 50 * s],
    [c[0] + 34 * s, c[1] - 86 * s],
    [c[0] + 20 * s, c[1] - 86 * s],
  ];
  p.cut(ch, '#B96A3E', { rough: 0.3 });
  const dome = [];
  for (let k = 0; k <= 20; k++) {
    const a = Math.PI + (k / 20) * Math.PI;
    dome.push([c[0] + Math.cos(a) * 52 * s, c[1] + Math.sin(a) * 70 * s]);
  }
  p.cut(dome, '#C9774A', { rough: 0.7 });
  for (let r = 1; r < 4; r++) {
    const pts = [];
    for (let k = 0; k <= 12; k++) {
      const a = Math.PI + (k / 12) * Math.PI;
      pts.push([c[0] + Math.cos(a) * 50 * s, c[1] - r * 16 * s + Math.sin(a) * 8 * s]);
    }
    p.line(pts, '#A85E34', 1.2, 0.45);
  }
  const mo = [];
  for (let k = 0; k <= 12; k++) {
    const a = Math.PI + (k / 12) * Math.PI;
    mo.push([c[0] + 6 * s + Math.cos(a) * 18 * s, c[1] - 2 * s + Math.sin(a) * 24 * s]);
  }
  p.flat(mo, '#3A1E12');
  p.flat(
    mo.map((q) => [q[0], q[1] + (c[1] - q[1]) * 0.5]),
    '#F08A3A',
  );
}
function drawCactus(p) {
  const s = p.s,
    x = 200,
    y = 60;
  pot(p, x, y, 18, 16, '#C0563A');
  const b = p.P(x, y, 16);
  const body = (bx, by, w, h) => {
    const P2 = [];
    for (let k = 0; k <= 12; k++) {
      const a = Math.PI + (k / 12) * Math.PI;
      P2.push([bx + Math.cos(a) * w * s, by - h * s + Math.sin(a) * w * s]);
    }
    P2.push([bx + w * s, by], [bx - w * s, by]);
    p.cut(P2, '#6E9A4E', { rough: 0.3 });
    p.line(
      [
        [bx, by],
        [bx, by - h * s - w * 0.6 * s],
      ],
      '#557A3A',
      1,
      0.6,
    );
  };
  p.line(
    [
      [b[0] - 9 * s, b[1] - 26 * s],
      [b[0] - 16 * s, b[1] - 26 * s],
    ],
    '#6E9A4E',
    6,
  );
  p.line(
    [
      [b[0] + 9 * s, b[1] - 36 * s],
      [b[0] + 15 * s, b[1] - 36 * s],
    ],
    '#6E9A4E',
    6,
  );
  body(b[0] - 16 * s, b[1] - 24 * s, 5.5, 20);
  body(b[0] + 15 * s, b[1] - 34 * s, 5, 16);
  body(b[0], b[1], 9, 62);
  flowerDot(p, b[0], b[1] - 72 * s, 4, '#F29CC2');
}
/* Duna, zorrita del desierto que funde vidrio */
function drawFennec(p, x, y, f, t, ex, portrait) {
  const s = p.s,
    br = Math.sin(t * 1.7) * 0.8,
    tw = Math.sin(t * 1.1) * 0.2,
    P = (dx, dz) => p.P(x + dx * f, y, dz);
  if (!portrait) p.flat(p.ell(...P(0, 0), 30, 9), 'rgba(70,40,15,.22)');
  p.cut([P(-14, 14), P(-34, 20), P(-44, 34 + Math.sin(t * 1.3) * 3), P(-36, 40), P(-20, 30), P(-10, 22)], '#EDBE82', { rough: 0.4 });
  const tt = P(-42, 36);
  p.cut(p.ell(tt[0], tt[1], 6, 5, 12), '#FBF0DC', { sh: 0, rough: 0.2 });
  const bc = P(0, 24 + br);
  p.cut(p.ell(bc[0], bc[1], 17, 22, 26), '#EDBE82', { rough: 0.4 });
  p.cut(p.ell(bc[0] + 5 * f * s, bc[1] + 4 * s, 9, 14, 20), '#FBF0DC', { sh: 0, rough: 0.3 });
  for (const dx of [-2, 9]) p.cut(p.ell(...P(dx, 3), 5, 3.4, 12), '#E3AE70', { sh: 0, rough: 0.2 });
  const sc = P(4, 38 + br);
  p.cut(
    [
      [sc[0] - 13 * s, sc[1] - 3 * s],
      [sc[0] + 13 * s, sc[1] - 3 * s],
      [sc[0] + 3 * f * s, sc[1] + 9 * s],
    ],
    '#2E9A9A',
    { rough: 0.3 },
  );
  const hc = P(6, 52 + br);
  for (const k of [-1, 1]) {
    p.cut([P(6 + k * 5 - 3, 60 + br), P(6 + k * 16 + tw * 6 * k, 90 + br), P(6 + k * 13, 58 + br)], '#E3AE70', { rough: 0.3 });
    p.cut([P(6 + k * 6 - 2, 61 + br), P(6 + k * 15 + tw * 6 * k, 85 + br), P(6 + k * 12, 60 + br)], '#F6C9B0', { sh: 0, rough: 0.2 });
  }
  p.cut(p.ell(hc[0], hc[1], 14, 12, 24), '#EDBE82', { rough: 0.4 });
  const sn = P(18, 48 + br);
  p.cut(
    [
      [hc[0] + 4 * f * s, hc[1] - 4 * s],
      [sn[0] + 3 * f * s, sn[1]],
      [hc[0] + 4 * f * s, hc[1] + 6 * s],
    ],
    '#FBF0DC',
    { sh: 0, rough: 0.2 },
  );
  p.flat(p.ell(sn[0] + 3 * f * s, sn[1] - 0.5 * s, 2.2, 1.8, 8), C.ink);
  face(p, P(4, 55 + br), P(12, 55 + br), P(13, 45 + br), f, t, ex, { er: 2.5, ph: 3.1, cheek: P(8, 49 + br) });
}

/* ─────────────── ANTÁRTIDA · El témpano ─────────────── */
const ANT = {
  seed: 'ant',
  floor: '#EDF4F7',
  tiles: ['#E3EEF3', '#F4F9FB', '#D8E7EE', '#EAF2F6', '#DDEAF0'],
  walls: { '3,4': '#C9DFE9', '4,5': '#D4E7EF', '5,0': '#CEE3EC' },
  relief: ['#B3CEDB', '#F2F8FB'],
  wainscot: '#8AB2C6',
  seam: '#A2C3D3',
  floorDecor(p, R0) {
    const s = p.s;
    for (let k = 0; k < 6; k++) {
      const q = p.P(rd(R0, -R * 0.8, R * 0.8), rd(R0, -R * 0.6, R * 0.8), 0),
        pts = [q];
      let c = q;
      for (let j = 0; j < 3; j++) {
        c = [c[0] + rd(R0, -14, 14) * s, c[1] + rd(R0, -5, 5) * s];
        pts.push(c);
      }
      p.line(pts, '#AFCBDA', 1.2, 0.7);
    }
    for (const [x, y] of [
      [-210, 120],
      [200, 150],
      [-40, 215],
    ]) {
      const q = p.P(x, y, 0);
      p.cut(p.ell(q[0], q[1], rd(R0, 30, 46), rd(R0, 10, 15), 22), '#FFFFFF', { blur: 3, rough: 0.8, dy: 1 });
    }
  },
};
function antBase(p) {
  const s = p.s,
    R0 = rng('ant-dec');
  shell(p, ANT);
  const eT = [3, 4],
    w = hexWin(p, eT, 0.5, 76, 56);
  p.cut(hexWin(p, eT, 0.5, 76, 64), '#8AB2C6', { blur: 3, rough: 0.4 });
  p.flat(w, '#14224A');
  p.clip(w, () => {
    for (let k = 0; k < 30; k++) {
      const q = p.W(wallPt(eT, 0.5 + rd(R0, -0.2, 0.2), rd(R0, 24, 130), -8));
      p.flat(p.ell(q[0], q[1], 0.9, 0.9, 6), '#FFFFFF', 0.8);
    }
    for (const [z0, col, a] of [
      [100, '#6FE0A8', 0.8],
      [90, '#A6F0C8', 0.6],
      [112, '#E08AD0', 0.55],
    ]) {
      const t1 = [],
        t2 = [];
      for (let k = 0; k <= 18; k++) {
        const u = k / 18,
          uu = 0.3 + u * 0.4;
        t1.push(p.W(wallPt(eT, uu, z0 + Math.sin(u * Math.PI * 2.2 + z0) * 10, -8)));
        t2.push(p.W(wallPt(eT, uu, z0 - 20 + Math.sin(u * Math.PI * 2.2 + z0) * 10, -8)));
      }
      p.flat([...t1, ...t2.reverse()], col, a * 0.55);
    }
    const ice = [];
    for (let k = 0; k <= 10; k++) ice.push(p.W(wallPt(eT, 0.3 + k * 0.04, 44 + (k % 3) * 4, -8)));
    ice.push(p.W(wallPt(eT, 0.7, 10, -8)), p.W(wallPt(eT, 0.3, 10, -8)));
    p.flat(ice, '#E6F2F8');
  });
  for (const e of [
    [3, 4],
    [4, 5],
    [5, 0],
  ])
    for (let k = 0; k < 11; k++) {
      const u = 0.05 + k * 0.09,
        L = rd(R0, 8, 20),
        a = p.W(wallPt(e, u - 0.012, HW - 2, 1)),
        b = p.W(wallPt(e, u + 0.012, HW - 2, 1)),
        tp = p.W(wallPt(e, u, HW - 2 - L, 1));
      p.cut([a, b, tp], '#F4FAFD', { sh: 0, rough: 0.1 });
      p.line([a, tp], '#B9D5E2', 0.8, 0.8);
    }
  const eR = [5, 0],
    f0 = p.W(wallPt(eR, 0.25, 40, 2)),
    f1 = p.W(wallPt(eR, 0.25, 112, 2));
  p.line([f0, f1], '#8A6A4A', 2.4);
  p.cut([f1, p.W(wallPt(eR, 0.42, 106, 2)), p.W(wallPt(eR, 0.25, 98, 2))], '#E07A4E', { rough: 0.3 });
  shellTop(p, ANT);
}
function drawIgloo(p) {
  const s = p.s,
    x = 130,
    y = -70,
    c = p.P(x, y, 0);
  p.flat(p.ell(c[0], c[1], 70, 22), 'rgba(60,90,110,.2)');
  const dome = [];
  for (let k = 0; k <= 24; k++) {
    const a = Math.PI + (k / 24) * Math.PI;
    dome.push([c[0] + Math.cos(a) * 64 * s, c[1] + Math.sin(a) * 62 * s]);
  }
  p.cut(dome, '#F6FBFD', { rough: 0.5 });
  for (let r = 1; r <= 4; r++) {
    const yy = c[1] - r * 13 * s,
      hw = Math.sqrt(Math.max(0, 1 - ((r * 13) / 62) ** 2)) * 64 * s;
    p.line(
      [
        [c[0] - hw, yy],
        [c[0] + hw, yy],
      ],
      '#BFD7E3',
      1.2,
    );
    for (let k = -3; k <= 3; k++) {
      const xx = c[0] + (k * 18 + (r % 2) * 9) * s;
      if (Math.abs(xx - c[0]) < hw - 4 * s)
        p.line(
          [
            [xx, yy],
            [xx, yy + 13 * s],
          ],
          '#BFD7E3',
          1,
        );
    }
  }
  const en = [];
  for (let k = 0; k <= 12; k++) {
    const a = Math.PI + (k / 12) * Math.PI;
    en.push([c[0] - 10 * s + Math.cos(a) * 16 * s, c[1] + Math.sin(a) * 24 * s]);
  }
  p.cut(en, '#E6F2F8', { rough: 0.3 });
  p.flat(
    en.map((q) => [c[0] - 10 * s + (q[0] - c[0] + 10 * s) * 0.7, c[1] + (q[1] - c[1]) * 0.75]),
    '#2A3E5A',
  );
}
/* Témpano, pingüino guardián de la aurora */
function drawPenguin(p, x, y, f, t, ex, portrait) {
  const s = p.s,
    br = Math.sin(t * 1.8) * 0.8,
    P = (dx, dz) => p.P(x + dx * f, y, dz);
  if (!portrait) p.flat(p.ell(...P(0, 0), 24, 8), 'rgba(60,90,110,.25)');
  for (const dx of [-6, 6]) p.cut(p.ell(...P(dx + 3, 1), 6, 2.6, 12), '#F0A040', { sh: 0, rough: 0.2 });
  const bc = P(0, 28 + br);
  p.cut(p.ell(bc[0], bc[1], 19, 28, 30), '#2E3A52', { rough: 0.4 });
  p.cut(p.ell(bc[0] + 4 * f * s, bc[1] + 3 * s, 13, 23, 26), '#F7F4EC', { sh: 0, rough: 0.3 });
  p.cut([P(-16, 42 + br), P(-26, 20 + br + Math.sin(t * 2.4) * 3), P(-14, 26 + br)], '#26314A', { rough: 0.2 });
  const hc = P(2, 58 + br);
  p.cut(p.ell(hc[0], hc[1], 15, 14, 24), '#2E3A52', { rough: 0.4 });
  p.cut(p.ell(hc[0] + 5 * f * s, hc[1] - 1 * s, 9, 9, 20), '#F7F4EC', { sh: 0, rough: 0.2 });
  face(p, P(4, 60 + br), P(10, 60 + br), P(9, 53 + br), f, t, ex, { er: 2.2, ph: 0.4, cheek: P(5, 55 + br) });
  const bk = P(14, 56 + br);
  p.cut(
    [
      [bk[0] - 3 * f * s, bk[1] - 2.4 * s],
      [bk[0] + 6 * f * s, bk[1]],
      [bk[0] - 3 * f * s, bk[1] + 2.4 * s],
    ],
    '#F0A040',
    { sh: 0, rough: 0 },
  );
  const sc = P(2, 46 + br);
  p.cut(
    [
      [sc[0] - 15 * s, sc[1] - 3 * s],
      [sc[0] + 15 * s, sc[1] - 3 * s],
      [sc[0] + 14 * s, sc[1] + 4 * s],
      [sc[0] - 14 * s, sc[1] + 4 * s],
    ],
    '#E07A4E',
    { rough: 0.3 },
  );
  p.cut(
    [
      [sc[0] - 10 * f * s, sc[1]],
      [sc[0] - 14 * f * s, sc[1] + 16 * s],
      [sc[0] - 7 * f * s, sc[1] + 16 * s],
      [sc[0] - 5 * f * s, sc[1]],
    ],
    '#E07A4E',
    { rough: 0.2 },
  );
  const ht = P(1, 70 + br);
  p.cut(
    [
      [ht[0] - 13 * s, ht[1] + 3 * s],
      [ht[0] + 13 * s, ht[1] + 3 * s],
      [ht[0] + 8 * s, ht[1] - 9 * s],
      [ht[0] - 8 * s, ht[1] - 9 * s],
    ],
    '#6FA0C0',
    { rough: 0.3 },
  );
  p.cut(p.ell(ht[0], ht[1] - 11 * s, 4.4, 4.4, 12), '#F7F4EC', { sh: 0, rough: 0.3 });
}

/* ─────────────── las celdas en el juego ─────────────── */
const BUBB = [...Array(9)].map((_, k) => [k * 0.11, 0.25 + (k % 3) * 0.08, ((k * 37) % 100) / 100]);
const FLK = [...Array(26)].map((_, k) => [((k * 53) % 100) / 100, ((k * 29) % 100) / 100, 0.05 + (k % 5) * 0.012]);
Object.assign(STYLE.cells, {
  esp: {
    sub: 'El observatorio',
    base: espBase,
    props: [{ id: 'telescopio', y: -60, bb: [-45, -185, 90, 15], draw: drawTelescope }],
    solids: [
      [20, -60, 40],
      [-70, -10, 34],
    ],
    npc: {
      name: 'Orión',
      x: -70,
      y: -10,
      f: 1,
      lz: 96,
      tx: 40,
      ty: 40,
      draw: drawOwl,
      idle: 'smile',
      pbg: ['#454E88', '#262C55'],
      pf: [0.5, 24, 1.55, 1],
      ex: ['open', 'smile', 'happy'],
    },
    over(p, T, st) {
      if (st) return;
      const s = p.s,
        eT = [4, 5];
      for (let k = 0; k < 5; k++) {
        const tw = Math.max(0, Math.sin(T * 1.7 + k * 1.9));
        if (tw < 0.6) continue;
        const q = p.W(wallPt(eT, 0.38 + k * 0.06, 40 + ((k * 23) % 80), -8));
        const r = (tw - 0.6) * 12;
        p.line(
          [
            [q[0] - r * s, q[1]],
            [q[0] + r * s, q[1]],
          ],
          '#FFF6D8',
          1.2,
        );
        p.line(
          [
            [q[0], q[1] - r * s],
            [q[0], q[1] + r * s],
          ],
          '#FFF6D8',
          1.2,
        );
      }
    },
  },
  oce: {
    sub: 'El arrecife',
    base: oceBase,
    props: [
      { id: 'arrecife', y: 50, bb: [70, -100, 230, 60], draw: drawReef },
      { id: 'almeja', y: -40, bb: [-205, -80, -112, 5], draw: drawClam },
    ],
    solids: [
      [150, 50, 58],
      [-160, -40, 36],
      [-40, -10, 34],
    ],
    npc: {
      name: 'Coral',
      x: -40,
      y: -10,
      f: 1,
      lz: 78,
      tx: 45,
      ty: 40,
      draw: drawOctopus,
      idle: 'smile',
      pbg: ['#CFEFF0', '#8FCFD3'],
      pf: [0.5, 18, 1.6, 1],
      ex: ['open', 'smile', 'happy'],
    },
    over(p, T, st) {
      if (st) return;
      const s = p.s;
      for (const [o, spd, x0] of BUBB) {
        const u = (T * spd + o) % 1,
          q = p.P(lerp(-160, 170, x0), lerp(-40, 50, x0), 20 + u * 170);
        p.line([...p.ell(q[0] + Math.sin(T * 2 + o * 9) * 3 * s, q[1], 2.6 + x0 * 2, 2.6 + x0 * 2, 10)], '#FFFFFF', 1, 0.7 * (1 - u));
      }
    },
  },
  des: {
    sub: 'La duna',
    base: desBase,
    props: [
      { id: 'horno', y: -60, bb: [60, -135, 180, -15], draw: drawKiln },
      { id: 'cactus', y: 60, bb: [170, -80, 232, 50], draw: drawCactus },
    ],
    solids: [
      [120, -60, 58],
      [200, 60, 26],
      [20, -10, 32],
    ],
    npc: {
      name: 'Duna',
      x: 20,
      y: -10,
      f: 1,
      lz: 96,
      tx: 45,
      ty: 40,
      draw: drawFennec,
      idle: 'smile',
      pbg: ['#FBE3B4', '#EDB678'],
      pf: [0.52, 16, 1.5, 1],
      ex: ['open', 'smile', 'happy'],
    },
    over(p, T, st) {
      const s = p.s,
        c = p.P(120, -60, 0),
        m = [c[0] + 6 * s, c[1] - 10 * s];
      p.g.save();
      p.g.globalCompositeOperation = 'lighter';
      p.flat(p.ell(m[0], m[1], 26 + (st ? 0 : Math.sin(T * 8) * 3), 18, 20), 'rgba(255,150,60,.16)');
      p.g.restore();
      if (st) return;
      for (let k = 0; k < 3; k++) {
        const u = (T * 0.08 + k / 3) % 1,
          q = p.P(-240 + u * 480, 40 + k * 50, 4);
        p.line(
          [
            [q[0], q[1]],
            [q[0] + 40 * s, q[1] - 2 * s],
          ],
          '#FFF1D0',
          2,
          0.4 * Math.sin(u * Math.PI),
        );
      }
    },
  },
  ant: {
    sub: 'El témpano',
    base: antBase,
    props: [{ id: 'iglu', y: -70, bb: [60, -115, 200, -20], draw: drawIgloo }],
    solids: [
      [130, -70, 68],
      [-30, 10, 30],
    ],
    npc: {
      name: 'Témpano',
      x: -30,
      y: 10,
      f: 1,
      lz: 86,
      tx: 45,
      ty: 40,
      draw: drawPenguin,
      idle: 'smile',
      pbg: ['#F0F7FA', '#C9DFE9'],
      pf: [0.5, 22, 1.55, 1],
      ex: ['open', 'smile', 'happy'],
    },
    over(p, T, st) {
      if (st) return;
      const s = p.s;
      for (const [x0, o, spd] of FLK) {
        const u = (T * spd + o) % 1,
          q = p.P(lerp(-230, 230, x0), lerp(-200, 200, (x0 * 7) % 1), 200 * (1 - u));
        p.flat(p.ell(q[0] + Math.sin(T + o * 9) * 4 * s, q[1], 1.8, 1.8, 6), '#FFFFFF', 0.9);
      }
    },
  },
});
/* fondos sonoros de las celdas nuevas */
{
  const ob = STYLE.sound.beds;
  STYLE.sound.beds = (H) => {
    ob(H);
    const b = H.bus.bind(H);
    H.bed(b('esp'), H.nz.brown, [['lowpass', 180]], 0.12);
    H.osc(b('esp'), 'sine', 110, 0.012);
    H.osc(b('esp'), 'sine', 164.8, 0.008);
    H.lfo(0.09, 0.1, H.bed(b('oce'), H.nz.pink, [['lowpass', 900]], 0.2).gain);
    H.lfo(0.05, 0.08, H.bed(b('des'), H.nz.pink, [['bandpass', 1200, 0.6]], 0.12).gain);
    H.lfo(
      0.07,
      0.08,
      H.bed(
        b('ant'),
        H.nz.white,
        [
          ['highpass', 2500],
          ['lowpass', 6000],
        ],
        0.07,
      ).gain,
    );
    H.bed(b('ant'), H.nz.brown, [['lowpass', 200]], 0.1);
  };
}
/* ══════════ LUZ, GESTOS Y VIDA · papel ══════════ */
Object.assign(STYLE, {
  /* la luz de cada celda cuenta tu progreso */
  night: { locked: 'rgba(26,14,34,.74)', unseen: 'rgba(38,22,34,.56)', seen: 'rgba(48,28,22,.40)', sealed: 'rgba(64,34,8,.14)' },
  ghostIcon(p, id, a, named, locked) {
    const s = p.s,
      SE = SEASON[id],
      g = p.g,
      c = p.P(0, 0, 0);
    g.save();
    g.globalAlpha = Math.max(0.5, a);
    if (locked) {
      p.flat(p.ell(c[0], c[1], 24, 24, 24), '#7A3E22');
      p.flat(p.ell(c[0], c[1], 19, 19, 22), '#96502C');
      p.flat(p.ell(c[0], c[1] - 3 * s, 4.5, 4.5, 14), '#F3E0C0');
      p.flat(
        [
          [c[0] - 2.5 * s, c[1] - 1.5 * s],
          [c[0] + 2.5 * s, c[1] - 1.5 * s],
          [c[0] + 3.8 * s, c[1] + 7.5 * s],
          [c[0] - 3.8 * s, c[1] + 7.5 * s],
        ],
        '#F3E0C0',
      );
    } else {
      p.flat(p.ell(c[0], c[1], 22, 22, 24), SE.seal);
      p.text(SE.icon, c[0], c[1] + 1 * s, 20, '#FFF4D6', { w: 400 });
    }
    if (named) {
      const w = 60 * s,
        y0 = c[1] + 32 * s;
      p.flat(
        [
          [c[0] - w, y0],
          [c[0] + w, y0],
          [c[0] + w, y0 + 24 * s],
          [c[0] - w, y0 + 24 * s],
        ],
        C.cream,
      );
      p.text(locked ? 'Sellado' : SE.name, c[0], y0 + 12 * s, 15, C.ink);
    }
    g.restore();
  },
  /* un gesto sobre la cabeza del habitante: ! ♥ ✦ */
  emote(p, x, y, z, ch, age) {
    if (age < 0) return;
    const s = p.s,
      k = Math.min(1, age * 6),
      a = age > 2 ? Math.max(0, 1 - (age - 2) / 0.4) : 1,
      q = p.P(x, y, z + Math.sin(age * 5) * 2),
      g = p.g;
    g.save();
    g.globalAlpha = a;
    const r = 13 * (0.6 + 0.4 * k);
    p.cut(p.ell(q[0], q[1], r, r, 20), C.cream, { rough: 0.3, dy: 2 });
    p.text(ch, q[0], q[1] + 1 * s, 15 * (0.6 + 0.4 * k), ch === '♥' ? '#D8574A' : ch === '✦' ? '#C9772F' : C.ink);
    g.restore();
  },
  /* huellas al caminar, del material de cada celda */
  puff(p, x, y, u, id) {
    const s = p.s,
      col =
        { pri: '#F4C6CF', des: '#E9C98E', inv: '#FFFFFF', ant: '#FFFFFF', oce: '#DDF1F2', esp: '#B8C0F0', oto: '#E8A560', ver: '#FFF2C4' }[
          id
        ] || '#F3E6C4',
      q = p.P(x, y, 1 + u * 6);
    p.flat(p.ell(q[0], q[1], 3 + u * 7, (3 + u * 7) * 0.5, 12), col, 0.65 * (1 - u));
  },
  /* una mariposa de papel que viaja entre celdas */
  critter(p, x, y, z, t) {
    const s = p.s,
      q = p.P(x, y, z),
      fl = 0.25 + 0.75 * Math.abs(Math.sin(t * 11)),
      dir = Math.cos(t * 0.043) > 0 ? 1 : -1;
    for (const sg of [-1, 1])
      p.cut(
        [
          [q[0], q[1]],
          [q[0] + sg * 10 * s * fl, q[1] - 9 * s],
          [q[0] + sg * 11 * s * fl, q[1] + 1 * s],
          [q[0] + sg * 5 * s * fl, q[1] + 7 * s],
        ],
        sg * dir > 0 ? C.petal : C.butter,
        { dy: 5, rough: 0, shc: 'rgba(78,44,16,.18)' },
      );
    p.line(
      [
        [q[0], q[1] - 5 * s],
        [q[0], q[1] + 5 * s],
      ],
      C.ink,
      1.6,
    );
  },
});
/* ══════════ HABITANTES Y CELDAS NUEVAS ══════════ */
/*@@HUMANS@@*/
/*@@ROOMS2@@*/
/*@@ROOMS3@@*/
/*@@MYST@@*/
/*@@PATHS@@*/
/*@@LIFE@@*/
/* los ocho primeros vecinos ahora son títeres humanos */
{
  const HP = {
    pri: { lz: 70 },
    ver: { lz: 58 },
    oto: { lz: 96 },
    inv: { lz: 80 },
    esp: { lz: 88 },
    oce: { lz: 92 },
    des: { lz: 88 },
    ant: { lz: 88 },
  };
  for (const id in HP) Object.assign(STYLE.cells[id].npc, { draw: humanDraw(id), pf: hpf(id) }, HP[id]);
}
/* ══════════ MOTOR COMPARTIDO · panal completo ══════════ */
const CELLS = STYLE.cells;
/* prueba «islas»: cada cuarto queda a dos celdas del vecino, con un camino de por medio */
if (ISLAS) for (const k in POS) POS[k] = [POS[k][0] * 2, POS[k][1] * 2];
for (const a of ORDER) {
  CELLS[a].id = a;
  CELLS[a].doors = [];
  for (const b of ORDER) {
    if (a === b) continue;
    if (!linked(a, b)) continue;
    const dq = POS[b][0] - POS[a][0],
      dr = POS[b][1] - POS[a][1];
    let e = null,
      span = 1;
    for (let k = 1; k <= (ISLAS ? 8 : 4) && !e; k++)
      if (dq % k === 0 && dr % k === 0 && EDGE_OF[dq / k + ',' + dr / k]) {
        e = EDGE_OF[dq / k + ',' + dr / k];
        span = k;
      }
    if (!e) continue;
    const A = VI[e[0]],
      B = VI[e[1]],
      mx = (A[0] + B[0]) / 2,
      my = (A[1] + B[1]) / 2,
      L = Math.hypot(mx, my),
      nx = -mx / L,
      ny = -my / L;
    CELLS[a].doors.push({
      from: a,
      to: b,
      e,
      back: isBack(e),
      mid: [mx, my],
      n: [nx, ny],
      trig: [mx + nx * 20, my + ny * 20],
      spawn: [mx + nx * 74, my + ny * 74],
      dir: [dq, dr],
      span,
    });
  }
}
for (const a of ORDER) for (const d of CELLS[a].doors) d.dyn = PUZ.dyn(a, d.to);
/* posición de cada celda en el mundo y orden de dibujo (de atrás hacia delante) */
const CW = {};
for (const id of ORDER) CW[id] = cellCenter(...POS[id]);
const DRAW = [...ORDER].sort((a, b) => CW[a][1] - CW[b][1]);
const CL = (() => {
  let x0 = 1e9,
    x1 = -1e9,
    y0 = 1e9,
    y1 = -1e9;
  for (const id of ORDER) {
    const [x, y] = CW[id];
    x0 = Math.min(x0, x - 372);
    x1 = Math.max(x1, x + 372);
    y0 = Math.min(y0, y * K - 335);
    y1 = Math.max(y1, y * K + 265);
  }
  return { x0, x1, y0, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
})();
buildPaths();
let cur = 'pri';
const bgC = document.getElementById('bg'),
  talkBtn = document.getElementById('talk'),
  dlg = document.getElementById('dlg'),
  dn = document.getElementById('dn'),
  dl = document.getElementById('dl'),
  dm = document.getElementById('dm'),
  ptC = document.getElementById('pt'),
  sndBtn = document.getElementById('snd');
let DPR = 1,
  VW = 0,
  VH = 0,
  S = 1,
  Z = 1,
  ZF = 2,
  ZFN = 2,
  mapMode = false,
  ZMAX = 3,
  zoomT = 0,
  lastBgT = '',
  BGinfo = null,
  firstLayout = true;
const BBOX = [-352, -350, 352, 300],
  LIPBOX = [-400, -34, 400, 330],
  SNAPBOX = [-420, -395, 420, 372];
const BAKED = {},
  SNAP = {},
  FOCUS = {};
for (const id of ORDER) FOCUS[id] = id === cur ? 1 : 0;
const Pl = { x: 70, y: 170, z: 0, onPath: false, f: -1, moving: false, route: null, goal: null };
let crossing = null;
/* calidad adaptativa: si el equipo no llega, baja un poco la resolución interna */
let dprCap = COARSE ? 1.5 : 2;
try {
  const v = parseFloat(localStorage.getItem('colmena-dpr'));
  if (v >= 1) dprCap = Math.min(dprCap, v);
} catch (e) {}
const perf = { n: 0, t: 0, frames: 0 };
/* cuarto actual elevado; vistas nocturnas de los demás; gestos, objetos que vuelan, huellas, onda de luz */
let ZK = 1,
  ZKhold = null;
const DOORA = {},
  DOORT = {};
const LIFT = 12,
  oyOf = (id, s) => camY + CW[id][1] * K * s - FOCUS[id] * LIFT * s + (window.CDY ? CDY(id) * s : 0);
const DARK = {},
  EMO = {},
  FLY = [],
  PUFF = [];
let WAVE = null,
  handHideUntil = 0;
function seenMark(id) {
  const F = PROG.F;
  F.seen = F.seen || {};
  if (!F.seen[id]) {
    F.seen[id] = 1;
    save();
    for (const d of CELLS[id].doors) if (d.to !== cur) delete BAKED[d.to];
  }
}
function lightOf(id) {
  if (PUZ.cellLocked(id)) return 'locked';
  if (PUZ.seal[id] && PUZ.seal[id]()) return 'sealed';
  return PROG.F.seen && PROG.F.seen[id] ? 'seen' : 'unseen';
}
const darkKey = (id) =>
  lightOf(id) + '|' + (VIS[id] ? VIS[id]() : '') + '|' + S.toFixed(4) + '|' + ZF.toFixed(3) + '|' + (isAwake(id) ? 'a' : 'z');
const goalEl = document.getElementById('goal'),
  noteEl = document.getElementById('note'),
  rstBtn = document.getElementById('rst');
let SAVEK =
  CFG.KEY +
  '-progreso' +
  (() => {
    try {
      const n = +localStorage.getItem('colmena-slot') || 1;
      return n > 1 ? '-' + n : '';
    } catch (e) {
      return '';
    }
  })();
const SAVEV = 2;
let SAVEB = SAVEK + '-bak';
let saveRecovered = false;
function saveOk(t) {
  try {
    const d = JSON.parse(t);
    return !!(d && typeof d === 'object' && d.F && typeof d.F === 'object');
  } catch (e) {
    return false;
  }
}
function save() {
  if (FREE) return;
  try {
    const prev = localStorage.getItem(SAVEK);
    if (prev && saveOk(prev)) localStorage.setItem(SAVEB, prev);
    localStorage.setItem(
      SAVEK,
      JSON.stringify({
        v: SAVEV,
        t: Date.now(),
        F: PROG.F,
        bag: PROG.bag,
        cur,
        x: Number.isFinite(Pl.x) ? Pl.x : 0,
        y: Number.isFinite(Pl.y) ? Pl.y : 60,
      }),
    );
  } catch (e) {}
}
function saveMigrate(d) {
  /* v1 (sin versión) → v2: mismo formato, solo se añade la marca */ if (!d.v) d.v = 1;
  if (d.v < 2) {
    d.v = 2;
  }
  if (!d.F || typeof d.F !== 'object') d.F = {};
  return d;
}
function load() {
  try {
    let raw = localStorage.getItem(SAVEK);
    if (!raw || !saveOk(raw)) {
      const b = localStorage.getItem(SAVEB);
      if (b && saveOk(b)) {
        raw = b;
        saveRecovered = true;
        try {
          localStorage.setItem(SAVEK, b);
        } catch (e) {}
      } else raw = null;
    }
    const d = raw ? saveMigrate(JSON.parse(raw)) : null;
    if (d) {
      PROG.F = d.F || {};
      PROG.bag = Array.isArray(d.bag) ? d.bag.slice(0, BAGMAX) : d.hand ? [d.hand] : [];
      if (d.cur && CELLS[d.cur]) {
        cur = d.cur;
        Pl.x = Number.isFinite(d.x) ? d.x : 0;
        Pl.y = Number.isFinite(d.y) ? d.y : 60;
      }
    }
  } catch (e) {}
}
let noteT = 0,
  lastNote = '';
function note(m) {
  if (!m) return;
  const now = performance.now();
  if (m === lastNote && now - noteT < 2500) return;
  lastNote = m;
  noteT = now;
  noteEl.textContent = _t(m);
  noteEl.hidden = false;
  noteEl.classList.remove('show');
  void noteEl.offsetWidth;
  noteEl.classList.add('show');
  clearTimeout(note.t);
  note.t = setTimeout(() => {
    noteEl.hidden = true;
  }, 2800);
}
/* el objetivo aparece un rato cuando cambia y luego se retira; tocar el nombre del cuarto lo vuelve a mostrar */
let goalRaw = '';
function showGoal() {
  if (!goalEl || inTitle) return;
  goalEl.hidden = false;
  goalEl.classList.remove('fade', 'pop');
  void goalEl.offsetWidth;
  goalEl.classList.add('pop');
  clearTimeout(showGoal.t);
  showGoal.t = setTimeout(() => goalEl.classList.add('fade'), 7000);
}
function updGoal() {
  const g = PUZ.goal();
  if (!goalEl) return;
  const tg = _t(g);
  if (goalRaw !== g || goalEl.textContent !== tg) {
    const changed = goalRaw !== g;
    goalRaw = g;
    goalEl.textContent = tg;
    if (changed) showGoal();
  }
}
function stateChanged() {
  idleAcc = 0;
  for (const k in GRIDS) delete GRIDS[k];
  save();
  updGoal();
  refreshVisuals();
}
const VIS = { pri: () => !!PROG.F.bloom, esp: () => !!PROG.F.star, oce: () => !!PROG.F.gotPearl },
  visKey = {};
function refreshVisuals() {
  for (const id in VIS) {
    const k = VIS[id]();
    if (visKey[id] !== undefined && visKey[id] !== k) {
      delete BAKED[id];
      if (id === cur) bakeCell(id);
    }
    visKey[id] = k;
  }
}
function rebakeCell(id) {
  delete BAKED[id];
  if (id === cur) bakeCell(id);
}
/* el puente que gira (A) */
const BRS = {};
for (const k in BRIDGES) BRS[k] = { ang: 1.05, target: 1.05, turning: false };
const bkey = (a, b) => [a, b].sort().join('-');
const blockKind = (id, d) => (PUZ.cellLocked(d.to) || PUZ.cellLocked(id) ? 'seal' : bkey(id, d.to) === 'inv-pri' ? 'ice' : 'shut');
let pendingCard = null;
const buzz = (ms) => {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch (e) {}
};

/* ── horneado ── */
const newCanvas = (w, h) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
};
function bake(bb, draw, seed, sb) {
  const [x0, y0, x1, y1] = bb,
    c = newCanvas((x1 - x0) * sb, (y1 - y0) * sb);
  draw(STYLE.Pen(c.getContext('2d'), -x0 * sb, -y0 * sb, sb, seed));
  if (STYLE.afterBake) STYLE.afterBake(c);
  return { c, x0, y0 };
}
function bakeCell(id) {
  const c = CELLS[id],
    sb = S * Z * DPR;
  const base = bake(
    BBOX,
    (p) => {
      c.base(p);
      for (const d of c.doors) if (d.back) STYLE.doorBack(p, d, CELLS[d.to]);
    },
    id + 'base',
    sb,
  );
  const lip = bake(LIPBOX, (p) => STYLE.lip(p, c), id + 'lip', sb);
  const spr = c.props.map((pr) => ({ ...bake(pr.bb, pr.draw, id + pr.id, sb), y: pr.y }));
  const extras = (c.extras || []).map((x) => ({ ...bake(x.bb, x.draw, id + x.id, sb), blend: x.blend, flick: x.flick }));
  const signs = c.doors
    .filter((d) => STYLE.signAt(d))
    .map((d) => {
      const [x, y, z] = STYLE.signAt(d),
        yw = y * K - z;
      return {
        ...bake([x - 80, yw - 78, x + 80, yw + 40], (p) => STYLE.sign(p, d, CELLS[d.to], x, y, z), id + 's' + d.to, sb),
        ph: d.dir[0] * 2 + d.dir[1],
        d,
      };
    });
  BAKED[id] = { z: Z, base, lip, spr, extras, signs };
}
const baked = (id) => !!BAKED[id] && Z <= BAKED[id].z * 1.03 && Z >= BAKED[id].z * 0.8;
/* la celda entera en una sola imagen pequeña, desenfocada y apagada */
function bakeSnap(id) {
  const c = CELLS[id],
    sb = S * DPR * 0.42,
    [x0, y0, x1, y1] = SNAPBOX,
    A = newCanvas((x1 - x0) * sb, (y1 - y0) * sb),
    g = A.getContext('2d'),
    p = STYLE.Pen(g, -x0 * sb, -y0 * sb, sb, id + 'snap');
  c.base(p);
  for (const d of c.doors) if (d.back) STYLE.doorBack(p, d, CELLS[d.to]);
  const n = c.npc,
    items = c.props.map((pr) => ({ y: pr.y, f: () => pr.draw(p) }));
  items.push({
    y: n.y + (n.dy ?? 1),
    f: () => n.draw(STYLE.Pen(g, -x0 * sb, -y0 * sb, sb, 'v', false, true), n.x, n.y, n.f ?? 1, 0, n.idle || 'smile', false),
  });
  items.sort((a, b) => a.y - b.y);
  for (const it of items) it.f();
  STYLE.lip(p, c);
  for (const d of c.doors) {
    const at = STYLE.signAt(d);
    if (at) STYLE.sign(p, d, CELLS[d.to], ...at);
  }
  for (const x of c.extras || []) {
    g.save();
    if (x.blend) g.globalCompositeOperation = x.blend;
    if (x.flick) g.globalAlpha = clamp(x.flick(0), 0, 1);
    x.draw(p);
    g.restore();
  }
  if (STYLE.afterBake) STYLE.afterBake(A);
  const B = newCanvas(A.width, A.height),
    h = B.getContext('2d');
  h.filter = `blur(${Math.max(1.2, 2 * sb)}px)`;
  h.drawImage(A, 0, 0);
  h.filter = 'none';
  h.globalCompositeOperation = 'source-atop';
  h.fillStyle = STYLE.snapTint;
  h.fillRect(0, 0, B.width, B.height);
  SNAP[id] = { c: B, x0, y0, w: x1 - x0, h: y1 - y0, cz: null, z: 0 };
}
function bakeDark(id) {
  const c = CELLS[id],
    sb = Math.min(S * ZF * DPR, 1.05),
    [x0, y0, x1, y1] = SNAPBOX,
    A = newCanvas((x1 - x0) * sb, (y1 - y0) * sb),
    g = A.getContext('2d'),
    p = STYLE.Pen(g, -x0 * sb, -y0 * sb, sb, id + 'snap');
  if (!isSeen(id) || PUZ.cellLocked(id)) {
    waxCap(p, id, PUZ.cellLocked(id));
    if (STYLE.afterBake) STYLE.afterBake(A);
  } else {
    c.base(p);
    for (const d of c.doors) if (d.back) STYLE.doorBack(p, d, CELLS[d.to]);
    const n = c.npc,
      items = c.props.map((pr) => ({ y: pr.y, f: () => pr.draw(p) }));
    items.push({
      y: n.y + (n.dy ?? 1),
      f: () => n.draw(STYLE.Pen(g, -x0 * sb, -y0 * sb, sb, 'v', false, true), n.x, n.y, n.f ?? 1, 0, n.idle || 'smile', false),
    });
    items.sort((a, b) => a.y - b.y);
    for (const it of items) it.f();
    STYLE.lip(p, c);
    for (const d of c.doors) {
      const at = STYLE.signAt(d);
      if (at) STYLE.sign(p, d, CELLS[d.to], ...at);
    }
    for (const x of c.extras || []) {
      g.save();
      if (x.blend) g.globalCompositeOperation = x.blend;
      if (x.flick) g.globalAlpha = clamp(x.flick(0), 0, 1);
      x.draw(p);
      g.restore();
    }
    if (STYLE.afterBake) STYLE.afterBake(A);
  }
  const L = lightOf(id),
    cap = !isSeen(id) || PUZ.cellLocked(id);
  g.save();
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = cap ? (PUZ.cellLocked(id) ? 'rgba(30,14,30,.4)' : 'rgba(40,20,20,.22)') : STYLE.night[L];
  g.fillRect(0, 0, A.width, A.height);
  if (L === 'sealed' && !cap) {
    g.globalCompositeOperation = 'lighter';
    const gr = g.createRadialGradient(A.width / 2, A.height * 0.52, 10, A.width / 2, A.height * 0.52, A.width * 0.5);
    gr.addColorStop(0, 'rgba(255,190,90,.24)');
    gr.addColorStop(1, 'rgba(255,190,90,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, A.width, A.height);
  }
  g.restore();
  DARK[id] = { c: A, x0, y0, w: x1 - x0, h: y1 - y0, sb, half: null, key: darkKey(id) };
}
function darkWork(full) {
  if (crossing && crossing.long && full) {
    for (const d of CELLS[cur].doors)
      if (!DARK[d.to]) {
        bakeDark(d.to);
        return;
      }
    return;
  }
  if (crossing || Zt !== null) return;
  const near = [...ORDER].sort(
    (a, b) => Math.hypot(CW[a][0] - CW[cur][0], CW[a][1] - CW[cur][1]) - Math.hypot(CW[b][0] - CW[cur][0], CW[b][1] - CW[cur][1]),
  );
  for (const id of near) {
    const d = DARK[id];
    if (!d) {
      bakeDark(id);
      return;
    }
    if (full && d.key !== darkKey(id) && !Pl.moving) {
      bakeDark(id);
      return;
    }
  }
}
/* ── capa del panal: todas las celdas a oscuras compuestas en un solo lienzo.
   Se repinta solo al cambiar de cuarto, de estado o de zoom; la cámara la mueve con CSS. ── */
const worldC = document.createElement('canvas'),
  WPAD = 60;
const WORLD = { ok: false, excl: null, key: '', r: 1, lastT: '' };
const inWorld = (id) => WORLD.ok && id !== WORLD.excl && !(window.CDYN && CDYN(id));
function worldKey(excl, s) {
  return (
    excl +
    '|' +
    s.toFixed(4) +
    '|' +
    ORDER.map((id) => (id === excl ? 'x' : DARK[id] ? DARK[id].key : '-')).join(',') +
    '|' +
    (window.CDKEY ? CDKEY() : '')
  );
}
function bakeWorld(excl, s) {
  const wu = CL.x1 - CL.x0 + 2 * WPAD,
    hu = CL.y1 - CL.y0 + 2 * WPAD,
    r = Math.min(s, Math.sqrt(12e6 / (wu * hu)));
  const W = Math.ceil(wu * r),
    H = Math.ceil(hu * r);
  if (worldC.width !== W || worldC.height !== H) {
    worldC.width = W;
    worldC.height = H;
    worldC.style.width = W + 'px';
    worldC.style.height = H + 'px';
  }
  const g = worldC.getContext('2d');
  g.clearRect(0, 0, W, H);
  g.imageSmoothingQuality = 'high';
  for (const id of DRAW) {
    if (id === excl || (window.CDYN && CDYN(id))) continue;
    const d = DARK[id];
    if (!d) continue;
    let im = d.c;
    const cdy = window.CDY ? CDY(id) : 0;
    if (r < d.sb * 0.6) {
      if (!d.half) {
        d.half = newCanvas(d.c.width / 2, d.c.height / 2);
        const hg = d.half.getContext('2d');
        hg.imageSmoothingQuality = 'high';
        hg.drawImage(d.c, 0, 0, d.half.width, d.half.height);
      }
      im = d.half;
    }
    g.drawImage(im, (CW[id][0] + d.x0 - CL.x0 + WPAD) * r, (CW[id][1] * K + d.y0 - CL.y0 + WPAD + cdy) * r, d.w * r, d.h * r);
  }
  WORLD.ok = true;
  WORLD.excl = excl;
  WORLD.r = r;
  WORLD.key = worldKey(excl, s);
  WORLD.lastT = '';
}
/* ¿toca recomponer? solo con todo en reposo, para no dar tirones al caminar entre cuartos */
function worldWork(s, now) {
  if (crossing || Zt !== null || pinch || now - zoomT < 250) return;
  for (const id of ORDER) {
    const f = FOCUS[id];
    if (f > 0 && f < 1) return;
  }
  const excl = FOCUS[cur] >= 1 ? cur : null;
  for (const id of ORDER) if (id !== excl && !DARK[id]) return;
  if (!Pl.moving && ORDER.some((id) => id !== excl && DARK[id].key !== darkKey(id))) return; /* espera a que se enciendan todas */
  if (WORLD.key !== worldKey(excl, s)) bakeWorld(excl, s);
}
/* silueta opaca del cuarto actual: ahí el panal no se ve, así que no se copia */
function cellHole(s) {
  if (WORLD.excl !== cur || FOCUS[cur] < 1) return null;
  const cx = camX + CW[cur][0] * s,
    cy = oyOf(cur, s),
    k = 0.95,
    P = (i, z) => [cx + VO[i][0] * k * s, cy + (VO[i][1] * K * k - z) * s];
  return [
    P(3, HW * 0.92),
    P(4, HW * 0.92),
    P(5, HW * 0.92),
    P(0, HW * 0.92),
    P(0, -BASE * 0.8),
    P(1, -BASE * 0.8),
    P(2, -BASE * 0.8),
    P(3, -BASE * 0.8),
  ];
}
function placeWorld(s) {
  if (!WORLD.ok) return;
  const k = s / WORLD.r,
    ox = camX + (CL.x0 - WPAD) * s,
    oy = camY + (CL.y0 - WPAD) * s,
    W = cv.width,
    H = cv.height;
  const hole = cellHole(s);
  if (hole) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.moveTo(...hole[0]);
    for (const q of hole.slice(1)) ctx.lineTo(...q);
    ctx.closePath();
    ctx.clip('evenodd');
  }
  placeWorld0(k, ox, oy, W, H);
  if (hole) ctx.restore();
}
function placeWorld0(k, ox, oy, W, H) {
  /* solo la parte que se ve; si la escala coincide, es una copia directa */
  const sx0 = Math.max(0, -ox / k),
    sy0 = Math.max(0, -oy / k),
    sx1 = Math.min(worldC.width, (W - ox) / k),
    sy1 = Math.min(worldC.height, (H - oy) / k);
  if (sx1 <= sx0 || sy1 <= sy0) return;
  if (Math.abs(k - 1) < 0.002) {
    const dx = Math.round(ox + sx0),
      dy = Math.round(oy + sy0);
    ctx.drawImage(
      worldC,
      Math.round(sx0),
      Math.round(sy0),
      Math.round(sx1 - sx0),
      Math.round(sy1 - sy0),
      dx,
      dy,
      Math.round(sx1 - sx0),
      Math.round(sy1 - sy0),
    );
  } else ctx.drawImage(worldC, sx0, sy0, sx1 - sx0, sy1 - sy0, ox + sx0 * k, oy + sy0 * k, (sx1 - sx0) * k, (sy1 - sy0) * k);
}
/* la imagen desenfocada ya estirada al tamaño de pantalla: se rehace solo al hacer zoom */
function snapAt(id, s) {
  const sn = SNAP[id];
  if (!sn) return null;
  if (!sn.cz || sn.z !== Z) {
    const sc = Math.min(s, 1.25),
      c = newCanvas(sn.w * sc, sn.h * sc),
      g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(sn.c, 0, 0, c.width, c.height);
    sn.cz = c;
    sn.z = Z;
  }
  return sn;
}
function bakeBackdrop() {
  /* con un 20 % de margen por lado: el paralaje nunca deja ver el borde */
  const sb = S * Z * DPR * 0.5,
    W = Math.ceil(VW * 1.4 * DPR * 0.5),
    H = Math.ceil(VH * 1.4 * DPR * 0.5),
    mx = VW * 0.2 * DPR,
    my = VH * 0.2 * DPR;
  bgC.width = W;
  bgC.height = H;
  const cam = camTarget();
  STYLE.backdrop(STYLE.Pen(bgC.getContext('2d'), (cam[0] + mx) * 0.5, (cam[1] + my) * 0.5, sb, 'bg'), W, H);
  if (STYLE.afterBake) STYLE.afterBake(bgC);
  BGinfo = { cx: cam[0], cy: cam[1], z: Z };
  lastBgT = '';
  bgC.style.transform = '';
}
function layout() {
  DPR = Math.min(dprCap, window.devicePixelRatio || 1);
  VW = cv.clientWidth;
  VH = cv.clientHeight;
  cv.width = Math.round(VW * DPR);
  cv.height = Math.round(VH * DPR);
  S = Math.min((VW * 0.97) / (CL.x1 - CL.x0), (VH - 70) / (CL.y1 - CL.y0));
  ZMAX = clamp(2.2 / S, 2.5, 20);
  const portrait = VH > VW * 1.2,
    zf0 = ZF;
  ZF = clamp(
    Math.min((VW * (COARSE ? (portrait ? 1.42 : 0.98) : 0.7)) / (704 * S), ((VH - (portrait ? 170 : 90)) * 0.86) / (622 * S)),
    1,
    ZMAX,
  );
  ZFN = ZF;
  if (window.IMMZ) {
    const zi = IMMZ(portrait);
    if (zi > ZF) ZF = zi;
  }
  ZMAX = Math.max(ZMAX, ZF * 2.2);
  if (firstLayout) {
    Z = ZF;
    firstLayout = false;
  } else if (!mapMode && Zt === null && Math.abs(Z - zf0) < 0.03) Z = ZF;
  Z = clamp(Z, 1, ZMAX);
  if (STYLE.init) STYLE.init();
  if (window.R3D && R3D.on) {
    R3D.resize();
    camReady = false;
    return;
  }
  for (const k in BAKED) delete BAKED[k];
  bakeCell(cur);
  bakeBackdrop();
  camReady = false;
}
let camX = 0,
  camY = 0,
  camReady = false;
/* desplazamiento manual (arrastrar / pellizcar): se suma al encuadre automático y se desvanece al caminar */
const PAN = { x: 0, y: 0 };
function camTarget() {
  const b = camBase();
  return [b[0] + PAN.x, b[1] + PAN.y];
}
function camBase() {
  const s = S * Z * ZK * DPR,
    W = cv.width,
    H = cv.height;
  let x = W / 2 - CL.cx * s,
    y = H / 2 - CL.cy * s + 22 * DPR;
  if (Z > 1.04) {
    const cx = CW[cur][0],
      cy = CW[cur][1] * K;
    x = W / 2 - cx * s;
    y = H / 2 - (cy - 11) * s + 14 * DPR;
    if (talking && !mapMode) {
      const n = CELLS[cur].npc,
        mx = (Pl.x + n.x) / 2,
        my = (Pl.y + n.y) / 2;
      x = W / 2 - (cx + mx) * s;
      y = H / 2 - (cy + my * K - 40) * s - 70 * DPR;
    } else {
      const wx = cx + Pl.x,
        wy = cy + Pl.y * K;
      /* cada eje sigue al jugador solo si el cuarto no cabe en ese eje (móvil en vertical: sigue en horizontal, centra en vertical) */
      if (704 * s > W * 0.98) x = clamp(W / 2 - wx * s, W - (cx + 352) * s - 6 * DPR, -(cx - 352) * s + 6 * DPR);
      if (622 * s > H - 60 * DPR) y = clamp(H / 2 - (wy - 30) * s, H - (cy + 300) * s - 6 * DPR, -(cy - 322) * s + 60 * DPR);
    }
    /* por un camino largo la cámara acompaña al jugador */
    if (crossing && crossing.long && !mapMode) {
      const wx = cx + Pl.x,
        wy = cy + Pl.y * K - (Pl.z || 0) * 0.6;
      x = W / 2 - wx * s;
      y = H / 2 - (wy - 30) * s;
    }
  }
  return [x, y];
}

/* ── colisiones y rutas dentro de la celda actual ── */
function clampPan() {
  const s = S * Z * ZK * DPR,
    b = camBase(),
    W = cv.width,
    H = cv.height;
  /* el panal no puede salir de la pantalla: al menos un 35 % de ella sigue mostrando celdas */
  const x0 = b[0] + CL.x0 * s,
    x1 = b[0] + CL.x1 * s,
    y0 = b[1] + CL.y0 * s,
    y1 = b[1] + CL.y1 * s,
    mx = W * 0.35,
    my = H * 0.35;
  PAN.x = clamp(PAN.x, mx - x1, W - mx - x0);
  PAN.y = clamp(PAN.y, my - y1, H - my - y0);
}
function inHex(x, y, r) {
  const ax = Math.abs(x),
    ay = Math.abs(y);
  return ay <= (Math.sqrt(3) / 2) * r && Math.sqrt(3) * ax + ay <= Math.sqrt(3) * r;
}
function segDist(px, py, ax, ay, bx, by) {
  const vx = bx - ax,
    vy = by - ay,
    t = clamp(((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy), 0, 1);
  return Math.hypot(px - ax - vx * t, py - ay - vy * t);
}
function free(x, y) {
  const c = CELLS[cur];
  for (const d of c.doors)
    if (PUZ.open(cur, d.to) && segDist(x, y, d.spawn[0], d.spawn[1], d.mid[0] - d.n[0] * 4, d.mid[1] - d.n[1] * 4) < 24) return true;
  if (!inHex(x, y * 1.02, R - 24)) return false;
  for (const [sx, sy, sr] of c.solids) if (Math.hypot(x - sx, (y - sy) * 1.15) < sr + 10) return false;
  return true;
}
const GS = 10,
  GN = 62,
  GRIDS = {};
function grid() {
  const g = new Uint8Array(GN * GN);
  for (let a = 0; a < GN; a++) for (let b = 0; b < GN; b++) g[a * GN + b] = free(-310 + (a + 0.5) * GS, -310 + (b + 0.5) * GS) ? 1 : 0;
  return g;
}
const cellOf = (x, y) => [Math.floor((x + 310) / GS), Math.floor((y + 310) / GS)],
  cellPt = (a, b) => [-310 + (a + 0.5) * GS, -310 + (b + 0.5) * GS];
function nearest(G, x, y, maxR = 14) {
  const ok = (a, b) => a >= 0 && b >= 0 && a < GN && b < GN && G[a * GN + b] === 1,
    [a0, b0] = cellOf(x, y);
  for (let r = 0; r <= maxR; r++) {
    let best = null,
      bd = 1e9;
    for (let a = a0 - r; a <= a0 + r; a++)
      for (let b = b0 - r; b <= b0 + r; b++) {
        if (Math.max(Math.abs(a - a0), Math.abs(b - b0)) !== r || !ok(a, b)) continue;
        const q = cellPt(a, b),
          d = Math.hypot(q[0] - x, q[1] - y);
        if (d < bd) {
          bd = d;
          best = [a, b];
        }
      }
    if (best) return best;
  }
  return null;
}
function astar(G, st, tg) {
  const ok = (a, b) => a >= 0 && b >= 0 && a < GN && b < GN && G[a * GN + b] === 1,
    N2 = GN * GN,
    gs = new Float32Array(N2).fill(Infinity),
    from = new Int32Array(N2).fill(-1),
    done = new Uint8Array(N2),
    open = [];
  const h = (a, b) => {
    const dx = Math.abs(a - tg[0]),
      dy = Math.abs(b - tg[1]);
    return Math.max(dx, dy) + 0.414 * Math.min(dx, dy);
  };
  const sk = st[0] * GN + st[1],
    tk = tg[0] * GN + tg[1];
  gs[sk] = 0;
  open.push([h(...st), sk]);
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
    const [, k] = open.splice(bi, 1)[0];
    if (done[k]) continue;
    done[k] = 1;
    if (k === tk) {
      const o = [];
      let c = k;
      while (c !== -1) {
        o.push(cellPt(Math.floor(c / GN), c % GN));
        c = from[c];
      }
      return o.reverse();
    }
    const a = Math.floor(k / GN),
      b = k % GN;
    for (const [da, db, cst] of [
      [1, 0, 1],
      [-1, 0, 1],
      [0, 1, 1],
      [0, -1, 1],
      [1, 1, 1.41],
      [1, -1, 1.41],
      [-1, 1, 1.41],
      [-1, -1, 1.41],
    ]) {
      const na = a + da,
        nb = b + db;
      if (!ok(na, nb) || (da && db && (!ok(a + da, b) || !ok(a, b + db)))) continue;
      const nk = na * GN + nb,
        ng = gs[k] + cst;
      if (ng < gs[nk]) {
        gs[nk] = ng;
        from[nk] = k;
        open.push([ng + h(na, nb), nk]);
      }
    }
  }
  return null;
}
function lineFree(a, b) {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]),
    n = Math.ceil(d / 5);
  for (let k = 1; k <= n; k++) {
    const f = k / n;
    if (!free(lerp(a[0], b[0], f), lerp(a[1], b[1], f))) return false;
  }
  return true;
}
function route(tx, ty) {
  const G = GRIDS[cur] || (GRIDS[cur] = grid());
  let st = cellOf(Pl.x, Pl.y);
  if (!(G[st[0] * GN + st[1]] === 1)) st = nearest(G, Pl.x, Pl.y, 3);
  const tg = nearest(G, tx, ty);
  if (!st || !tg) return null;
  const pts = astar(G, st, tg);
  if (!pts) return null;
  const out = [];
  let c = [Pl.x, Pl.y],
    k = 0;
  while (k < pts.length) {
    let far = k;
    for (let m = pts.length - 1; m > k; m--)
      if (lineFree(c, pts[m])) {
        far = m;
        break;
      }
    out.push(pts[far]);
    c = pts[far];
    k = far + 1;
  }
  return out;
}

/* ── cruzar a la celda vecina caminando por el puente ── */
function cross(d) {
  if (crossing) return;
  const from = cur,
    to = d.to,
    back = CELLS[to].doors.find((x) => x.to === from);
  if (!DARK[from] || DARK[from].key !== darkKey(from)) bakeDark(from);
  const a = [CW[from][0] + Pl.x, CW[from][1] + Pl.y],
    arr = [back.mid[0] + back.n[0] * 46, back.mid[1] + back.n[1] * 46],
    b = [CW[to][0] + arr[0], CW[to][1] + arr[1]];
  cur = to;
  if (!baked(cur)) bakeCell(cur);
  /* memoria: con 25 celdas solo se guardan horneadas la actual y sus vecinas con puerta */
  {
    const keep = new Set([cur, ...CELLS[cur].doors.map((d) => d.to)]);
    for (const k in BAKED) if (!keep.has(k)) delete BAKED[k];
  }
  closeTalk();
  Pl.route = null;
  STYLE.tag(CELLS[cur]);
  seenMark(to);
  idleAcc = 0;
  narrate([NARR.enter[to]], 'enter:' + to, { delay: 0.8 });
  FLY.length = 0;
  PUFF.length = 0;
  if (PUZ.want(to)) EMO[to] = { ch: '!', t0: T + 0.6 };
  save();
  const long = (d.span || 1) > 1,
    plan = long ? crossPlan(from, to, a, b) : null;
  crossing = { from, a, b, t: 0, long, plan, dur: plan ? plan.dur : Math.max(0.55, Math.hypot(b[0] - a[0], b[1] - a[1]) / 170) };
  if (plan) {
    note(PATH_NAME[plan.P.type]);
    ZKhold = { v: 0.96, until: T + plan.dur - 0.5 };
  }
  Pl.x = a[0] - CW[cur][0];
  Pl.y = a[1] - CW[cur][1];
}
/* la puerta de la celda actual que más acerca a otra celda */
function doorToward(id) {
  const prev = { [cur]: null },
    q = [cur];
  while (q.length) {
    const a = q.shift();
    if (a === id) break;
    for (const d of CELLS[a].doors) {
      if (!PUZ.open(a, d.to) || d.to in prev) continue;
      prev[d.to] = { a, d };
      q.push(d.to);
    }
  }
  if (!(id in prev) || id === cur) return null;
  let n = id;
  while (prev[n].a !== cur) n = prev[n].a;
  return prev[n].d;
}
let idleT = 0;
function prebake(now) {
  if (crossing || now - idleT < 900) return;
  const nb = CELLS[cur].doors.map((d) => d.to).find((id) => !baked(id));
  if (nb) {
    bakeCell(nb);
    idleT = now;
  }
}

/* ── sonido: un bus por estación ── */
const Sound = (() => {
  let ac = null,
    master = null,
    voice = null,
    mus = null,
    on = false,
    H = null,
    vol = 1;
  try {
    const v = parseFloat(localStorage.getItem('colmena-vol'));
    if (!isNaN(v)) vol = v;
  } catch (e) {}
  const buses = {},
    nx = {},
    bedB = {},
    musB = {};
  let sfxB = null;
  let pref = true;
  try {
    pref = localStorage.getItem(CFG.KEY + '-sonido') !== 'off';
  } catch (e) {}
  function noise(kind) {
    const len = ac.sampleRate * 4,
      b = ac.createBuffer(1, len, ac.sampleRate),
      d = b.getChannelData(0);
    let l = 0,
      b0 = 0,
      b1 = 0,
      b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'white') d[i] = w;
      else if (kind === 'pink') {
        b0 = 0.99765 * b0 + w * 0.099;
        b1 = 0.963 * b1 + w * 0.2965;
        b2 = 0.57 * b2 + w * 1.0526;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.16;
      } else {
        l = (l + 0.02 * w) / 1.02;
        d[i] = l * 3.5;
      }
    }
    return b;
  }
  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16;
    master.connect(comp);
    comp.connect(ac.destination);
    const nz = { pink: noise('pink'), brown: noise('brown'), white: noise('white') };
    const filt = (n, fl) => {
      for (const [t, f, q] of fl || []) {
        const bq = ac.createBiquadFilter();
        bq.type = t;
        bq.frequency.value = f;
        bq.Q.value = q || 0.7;
        n.connect(bq);
        n = bq;
      }
      return n;
    };
    H = {
      ac,
      nz,
      rnd: (a, b) => a + Math.random() * (b - a),
      bus: (id) => bedB[id],
      bed(dest, buf, fl, vol) {
        const s = ac.createBufferSource();
        s.buffer = buf;
        s.loop = true;
        const g = ac.createGain();
        g.gain.value = vol;
        filt(s, fl).connect(g);
        g.connect(dest);
        s.start(0, Math.random() * 3);
        return g;
      },
      osc(dest, type, f, vol, fl) {
        const o = ac.createOscillator();
        o.type = type;
        o.frequency.value = f;
        const g = ac.createGain();
        g.gain.value = vol;
        filt(o, fl).connect(g);
        g.connect(dest);
        o.start();
        return { o, g };
      },
      lfo(freq, depth, param) {
        const o = ac.createOscillator();
        o.frequency.value = freq;
        const g = ac.createGain();
        g.gain.value = depth;
        o.connect(g);
        g.connect(param);
        o.start();
      },
      tone(dest, type, f0, f1, vol, dur, t = ac.currentTime) {
        const o = ac.createOscillator(),
          g = ac.createGain();
        o.type = type;
        o.connect(g);
        g.connect(dest);
        o.frequency.setValueAtTime(f0, t);
        o.frequency.exponentialRampToValueAtTime(f1, t + dur);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.start(t);
        o.stop(t + dur + 0.05);
      },
      hit(dest, buf, type, f, q, vol, dur, att = 0.003, t = ac.currentTime) {
        const s = ac.createBufferSource();
        s.buffer = buf;
        const bq = ac.createBiquadFilter();
        bq.type = type;
        bq.frequency.value = f;
        bq.Q.value = q;
        const g = ac.createGain();
        g.gain.value = 0;
        s.connect(bq);
        bq.connect(g);
        g.connect(dest);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + att);
        g.gain.exponentialRampToValueAtTime(0.0001, t + att + dur);
        s.start(t, Math.random() * 3, att + dur + 0.05);
      },
    };
    for (const id of ORDER) {
      buses[id] = ac.createGain();
      buses[id].gain.value = 0;
      buses[id].connect(master);
      bedB[id] = ac.createGain();
      bedB[id].gain.value = 0.4 * (BG[id] || 1);
      bedB[id].connect(buses[id]);
      musB[id] = ac.createGain();
      musB[id].gain.value = MG[id] || 1;
      musB[id].connect(buses[id]);
    }
    sfxB = ac.createGain();
    sfxB.gain.value = 1;
    sfxB.connect(master);
    STYLE.sound.beds(H);
    voice = STYLE.sound.voice(H, master);
    document.addEventListener('visibilitychange', () => {
      if (!ac) return;
      document.hidden ? ac.suspend() : on && ac.resume();
    });
    return true;
  }
  /* ══════════ MÚSICA GENERATIVA · una pieza por habitación ══════════
     Cada cuarto tiene escala, acordes, tempo e instrumentos propios.
     Capas: 0 sellos = base · 1 sello = +segunda voz · 2 sellos = +contracanto */
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  /* mezcla: la música unos 5 dB por encima del ambiente en cada cuarto */
  const MG = { pri: 1.55, ver: 2.4, oto: 2.1, inv: 2.1, esp: 1.7, oce: 1.7, des: 2.1, ant: 2.4 },
    BG = { pri: 0.76, ver: 1, oto: 1, inv: 0.72, esp: 1, oce: 0.63, des: 1, ant: 0.8 };
  const MUS = {
    pri: {
      bpm: 84,
      root: 65,
      ch: [
        [0, 4, 7],
        [-3, 0, 4],
        [5, 9, 12],
        [7, 11, 14],
      ],
      sc: [0, 2, 4, 7, 9],
    },
    ver: {
      bpm: 96,
      root: 67,
      ch: [
        [0, 4, 7],
        [-2, 2, 5],
        [5, 9, 12],
        [0, 4, 7],
      ],
      sc: [0, 2, 4, 5, 7, 9, 10],
    },
    oto: {
      bpm: 72,
      root: 57,
      ch: [
        [0, 3, 7],
        [5, 9, 12],
        [0, 3, 7],
        [-2, 2, 5],
      ],
      sc: [0, 2, 3, 5, 7, 9, 10],
    },
    inv: {
      bpm: 60,
      root: 62,
      ch: [
        [0, 3, 7],
        [-4, 0, 3],
        [3, 7, 10],
        [7, 11, 14],
      ],
      sc: [0, 2, 3, 5, 7, 8, 10],
    },
    esp: {
      bpm: 50,
      root: 64,
      ch: [
        [0, 4, 7, 11],
        [2, 6, 9, 12],
      ],
      sc: [0, 2, 4, 6, 7, 9, 11],
    },
    oce: {
      bpm: 66,
      root: 58,
      ch: [
        [0, 4, 7],
        [-3, 0, 4],
        [5, 9, 12],
        [7, 11, 14],
      ],
      sc: [0, 2, 4, 7, 9],
    },
    des: {
      bpm: 80,
      root: 62,
      ch: [
        [0, 3, 7],
        [1, 5, 8],
        [0, 3, 7],
        [-2, 1, 5],
      ],
      sc: [0, 1, 3, 5, 7, 8, 10],
    },
    ant: {
      bpm: 56,
      root: 57,
      ch: [
        [0, 3, 7],
        [-4, 0, 3],
        [3, 7, 10],
        [-2, 2, 5],
      ],
      sc: [0, 2, 3, 5, 7, 8, 10],
    },
    col: {
      bpm: 90,
      root: 67,
      ch: [
        [0, 4, 7],
        [5, 9, 12],
        [-3, 0, 4],
        [7, 11, 14],
      ],
      sc: [0, 2, 4, 7, 9],
    },
    bib: {
      bpm: 58,
      root: 60,
      ch: [
        [0, 4, 7, 11],
        [-3, 0, 4, 7],
        [5, 9, 12, 16],
        [7, 11, 14],
      ],
      sc: [0, 2, 4, 5, 7, 9, 11],
    },
    coc: {
      bpm: 104,
      root: 65,
      ch: [
        [0, 4, 7],
        [5, 9, 12],
        [7, 11, 14],
        [0, 4, 7],
      ],
      sc: [0, 2, 4, 5, 7, 9, 10],
    },
    rel: {
      bpm: 76,
      root: 62,
      ch: [
        [0, 3, 7],
        [-4, 0, 3],
        [-2, 2, 5],
        [-5, -1, 2],
      ],
      sc: [0, 2, 3, 5, 7, 8, 11],
    },
    inn: {
      bpm: 46,
      root: 60,
      ch: [
        [0, 4, 7, 11],
        [2, 6, 9, 14],
      ],
      sc: [0, 2, 4, 6, 7, 9, 11],
    },
    tea: {
      bpm: 92,
      root: 64,
      ch: [
        [0, 3, 7],
        [-4, 0, 3],
        [-7, -3, 0],
        [-5, -1, 2],
      ],
      sc: [0, 2, 3, 5, 7, 8, 11],
    },
    far: {
      bpm: 62,
      root: 60,
      ch: [
        [0, 4, 7],
        [-5, -1, 2],
        [-3, 0, 4],
        [5, 9, 12],
      ],
      sc: [0, 2, 4, 7, 9],
    },
    tre: {
      bpm: 112,
      root: 62,
      ch: [
        [0, 4, 7],
        [5, 9, 12],
        [0, 4, 7],
        [7, 11, 14],
      ],
      sc: [0, 2, 4, 5, 7, 9, 10],
    },
    sot: {
      bpm: 54,
      root: 57,
      ch: [
        [0, 3, 7],
        [-2, 2, 5],
        [-4, 0, 3],
        [-5, -1, 2],
      ],
      sc: [0, 2, 3, 5, 7, 8, 10],
    },
    cue: {
      bpm: 52,
      root: 59,
      ch: [
        [0, 3, 7],
        [3, 7, 10],
        [-4, 0, 3],
      ],
      sc: [0, 2, 3, 5, 7, 9, 10],
    },
    vol: {
      bpm: 70,
      root: 55,
      ch: [
        [0, 3, 7],
        [1, 5, 8],
        [0, 3, 7],
        [-2, 1, 5],
      ],
      sc: [0, 1, 3, 5, 7, 8, 10],
    },
    cum: {
      bpm: 54,
      root: 62,
      ch: [
        [0, 5, 7],
        [-2, 3, 5],
        [0, 4, 7],
        [5, 9, 12],
      ],
      sc: [0, 2, 4, 7, 9],
    },
    dsv: {
      bpm: 66,
      root: 60,
      ch: [
        [0, 3, 7],
        [5, 9, 12],
        [3, 7, 10],
        [-2, 2, 5],
      ],
      sc: [0, 2, 3, 5, 7, 9, 10],
    },
    est: {
      bpm: 60,
      root: 64,
      ch: [
        [0, 3, 7],
        [-4, 0, 3],
        [-7, -3, 0],
        [-2, 2, 5],
      ],
      sc: [0, 2, 3, 5, 7, 8, 10],
    },
    ret: {
      bpm: 78,
      root: 62,
      ch: [
        [0, 4, 7, 11],
        [5, 9, 12, 16],
        [-3, 0, 4, 7],
        [2, 5, 9],
      ],
      sc: [0, 2, 4, 7, 9],
    },
    jar: {
      bpm: 88,
      root: 65,
      ch: [
        [0, 4, 7],
        [2, 6, 9],
        [-5, -1, 2],
        [0, 4, 7],
      ],
      sc: [0, 2, 4, 6, 7, 9, 11],
    },
    cor: {
      bpm: 44,
      root: 60,
      ch: [
        [0, 4, 7],
        [-3, 0, 4],
        [-7, -3, 0],
        [-5, -1, 2],
      ],
      sc: [0, 2, 4, 7, 9],
    },
    and: {
      bpm: 48,
      root: 57,
      ch: [
        [0, 3, 7],
        [-4, 0, 3],
        [-2, 1, 5],
        [-5, -2, 2],
      ],
      sc: [0, 2, 3, 5, 7, 8, 10],
    },
    eco: {
      bpm: 40,
      root: 56,
      ch: [
        [0, 3, 6],
        [-1, 3, 6],
        [0, 3, 7],
        [-4, -1, 3],
      ],
      sc: [0, 1, 3, 5, 6, 8, 10],
    },
    per: {
      bpm: 62,
      root: 60,
      ch: [
        [0, 3, 7],
        [5, 8, 12],
        [3, 7, 10],
        [-2, 2, 5],
      ],
      sc: [0, 2, 3, 5, 7, 9, 10],
    },
    api: {
      bpm: 50,
      root: 60,
      ch: [
        [0, 4, 7],
        [-3, 0, 4],
        [5, 9, 12],
        [-5, -1, 2],
      ],
      sc: [0, 2, 4, 7, 9],
    },
    rev: {
      bpm: 46,
      root: 61,
      ch: [
        [0, 4, 7],
        [-1, 3, 6],
        [-5, -1, 2],
        [2, 5, 9],
      ],
      sc: [0, 2, 4, 6, 7, 9, 11],
    },
  };
  const env = (g, t, a, peak, dec) => {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  };
  const osc = (type, f, t, stop) => {
    const o = ac.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.start(t);
    o.stop(stop);
    return o;
  };
  const I = {
    /* kalimba, arpa, piano de fieltro, cuerda pulsada */
    pluck(d, t, m, v, dec = 0.9, bright = 0.25) {
      const f = mtof(m),
        g = ac.createGain(),
        g2 = ac.createGain(),
        o = osc('sine', f, t, t + dec + 0.1),
        o2 = osc('triangle', f * 2.001, t, t + dec + 0.1);
      g2.gain.value = bright;
      o.connect(g);
      o2.connect(g2);
      g2.connect(g);
      g.connect(d);
      env(g, t, 0.004, v, dec);
    },
    /* campana FM: celesta, glockenspiel, campanas */
    bell(d, t, m, v, dec = 1.6, ratio = 3.5) {
      const f = mtof(m),
        g = ac.createGain(),
        mg = ac.createGain(),
        c = osc('sine', f, t, t + dec + 0.1),
        mo = osc('sine', f * ratio, t, t + dec + 0.1);
      mg.gain.setValueAtTime(f * 1.6, t);
      mg.gain.exponentialRampToValueAtTime(f * 0.04, t + dec);
      mo.connect(mg);
      mg.connect(c.frequency);
      c.connect(g);
      g.connect(d);
      env(g, t, 0.003, v, dec);
    },
    /* marimba */
    mar(d, t, m, v) {
      const f = mtof(m),
        g = ac.createGain(),
        g2 = ac.createGain(),
        o = osc('sine', f, t, t + 0.6),
        o2 = osc('sine', f * 3.93, t, t + 0.2);
      g2.gain.value = 0.35;
      o.connect(g);
      o2.connect(g2);
      g2.connect(g);
      g.connect(d);
      env(g, t, 0.003, v, 0.42);
    },
    /* flauta, clarinete, silbido: nota sostenida con vibrato */
    lead(d, t, m, v, dur, type = 'sine', cut = 2600) {
      const f = mtof(m),
        o = osc(type, f, t, t + dur + 0.05),
        lf = osc('sine', 5.2, t, t + dur + 0.05),
        lg = ac.createGain(),
        bq = ac.createBiquadFilter(),
        g = ac.createGain();
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(f * 0.007, t + 0.4);
      lf.connect(lg);
      lg.connect(o.frequency);
      bq.type = 'lowpass';
      bq.frequency.value = cut;
      o.connect(bq);
      bq.connect(g);
      g.connect(d);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.08);
      g.gain.setValueAtTime(v, t + Math.max(0.1, dur - 0.22));
      g.gain.linearRampToValueAtTime(0, t + dur);
    },
    /* colchón de cuerdas o sintetizador */
    pad(d, t, ms, v, dur, cut = 900) {
      const a = Math.min(1.4, dur * 0.35);
      for (const m of ms)
        for (const dt of [-7, 7]) {
          const o = osc('triangle', mtof(m), t, t + dur + 1.6),
            bq = ac.createBiquadFilter(),
            g = ac.createGain();
          o.detune.value = dt;
          bq.type = 'lowpass';
          bq.frequency.value = cut;
          o.connect(bq);
          bq.connect(g);
          g.connect(d);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(v, t + a);
          g.gain.setValueAtTime(v, t + Math.max(a, dur - 0.1));
          g.gain.linearRampToValueAtTime(0, t + dur + 1.4);
        }
    },
    bass(d, t, m, v, dur) {
      const o = osc('triangle', mtof(m), t, t + dur + 0.1),
        bq = ac.createBiquadFilter(),
        g = ac.createGain();
      bq.type = 'lowpass';
      bq.frequency.value = 420;
      o.connect(bq);
      bq.connect(g);
      g.connect(d);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    },
    drum(d, t, v) {
      H.hit(d, H.nz.brown, 'lowpass', 170, 0.8, v, 0.28, 0.002, t);
      H.hit(d, H.nz.pink, 'bandpass', 950, 1.4, v * 0.25, 0.06, 0.001, t);
    },
  };
  /* una nota de la escala cerca de la anterior: melodías que caminan, no que saltan */
  const walk = (st, M, lo, hi) => {
    st.mel = clamp(st.mel + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)], lo, hi);
    const n = M.sc.length,
      o = Math.floor(st.mel / n),
      k = ((st.mel % n) + n) % n;
    return M.root + o * 12 + M.sc[k];
  };
  const chance = (p) => Math.random() < p;
  /* qué suena en cada corchea de cada habitación · i = corchea, b = compás, c = acorde, L = capas */
  const PLAY = {
    pri(d, st, t, M, i, b, c, L, q) {
      const r = M.root,
        k = i % 8;
      if (k === 0)
        I.pad(
          d,
          t,
          c.map((o) => r + o),
          0.01,
          q * 8,
          700,
        );
      if (chance(0.82)) {
        const n = c[(k + Math.floor(k / 3)) % c.length] + (k >= 4 ? 12 : 0);
        I.pluck(d, t, r + 12 + n, 0.05, 1.2);
      }
      if (L >= 1 && b % 2 === 0 && k % 4 === 0 && chance(0.7)) I.lead(d, t + q * 0.05, walk(st, M, 5, 11), 0.028, q * 3.4, 'sine', 2200);
      if (L >= 2 && (k === 0 || k === 4)) I.bass(d, t, r - 12 + c[0], 0.07, q * 3);
    },
    ver(d, st, t, M, i, b, c, L, q) {
      const r = M.root,
        k = i % 8,
        sw = k % 2 ? q * 0.16 : 0;
      if (k === 0 || k === 4) I.bass(d, t, r - 12 + (k ? c[2] - 12 : c[0]), 0.075, q * 2.6);
      if ([0, 3, 4, 6].includes(k) && chance(0.9)) I.mar(d, t + sw, r + 12 + c[Math.floor(Math.random() * c.length)], 0.055);
      if (L >= 1 && (k === 2 || k === 6)) c.forEach((o, j) => I.pluck(d, t + sw + j * 0.018, r + o, 0.022, 0.5, 0.5));
      if (L >= 2 && b % 2 === 1 && k === 1 && chance(0.7)) I.lead(d, t, walk(st, M, 7, 14), 0.02, q * 5, 'sine', 3000);
    },
    oto(d, st, t, M, i, b, c, L, q) {
      const r = M.root,
        k = i % 8;
      if (k % 2 === 0) {
        const j = k / 2,
          n = j === 0 ? c[0] : c[(j % (c.length - 1)) + 1] + (j === 3 ? 12 : 0);
        I.pluck(d, t, r + n, 0.06, 1.7, 0.1);
      }
      if (L >= 1 && b % 2 === 0 && k === 2 && chance(0.8)) I.lead(d, t, walk(st, M, 7, 13), 0.016, q * 5.5, 'square', 1100);
      if (L >= 2 && k === 0) I.bass(d, t, r - 12 + c[0], 0.07, q * 6);
    },
    inv(d, st, t, M, i, b, c, L, q) {
      const r = M.root,
        k = i % 8;
      if (k === 0)
        I.pad(
          d,
          t,
          c.map((o) => r + o - 12),
          0.012,
          q * 8,
          760,
        );
      if (k % 2 === 0 && chance(L >= 1 ? 0.5 : 0.32)) I.bell(d, t, walk(st, M, 12, 20), 0.028, 1.9);
      if (L >= 1 && k === 0) I.pluck(d, t, r - 12 + c[0], 0.05, 2.4, 0.05);
      if (L >= 2 && b % 2 === 1 && k === 4 && chance(0.8)) I.lead(d, t, walk(st, M, 7, 12), 0.014, q * 6, 'triangle', 1400);
    },
    esp(d, st, t, M, i, b, c, L, q) {
      const r = M.root,
        k = i % 8;
      if (k === 0 && b % 2 === 0)
        I.pad(
          d,
          t,
          c.map((o) => r + o - 12),
          0.012,
          q * 16,
          1100,
        );
      if (k % 2 === 0 && chance(0.26)) I.bell(d, t, walk(st, M, 14, 24), 0.026, 2.8, 2.01);
      if (L >= 1 && k === 0 && b % 2 === 0) I.pad(d, t, [r - 24], 0.02, q * 16, 300);
      if (L >= 2 && chance(0.18)) I.bell(d, t, r + 24 + c[Math.floor(Math.random() * c.length)], 0.014, 1.4, 4.2);
    },
    oce(d, st, t, M, i, b, c, L, q) {
      const r = M.root,
        k = i % 8,
        up = [0, 1, 2, 3, 4, 3, 2, 1][k],
        tone = c[up % c.length] + 12 * Math.floor(up / c.length);
      if (k === 0)
        I.pad(
          d,
          t,
          c.map((o) => r + o),
          0.009,
          q * 8,
          650,
        );
      I.pluck(d, t, r + tone, 0.045, 1.5, 0.15);
      if (L >= 1 && b % 2 === 1 && k === 0 && chance(0.8)) I.lead(d, t, walk(st, M, 6, 11), 0.022, q * 6, 'sine', 1800);
      if (L >= 2 && k === 0) I.bass(d, t, r - 12 + c[0], 0.06, q * 6);
    },
    des(d, st, t, M, i, b, c, L, q) {
      const r = M.root,
        k = i % 8;
      if (k === 0 && b % 2 === 0) I.pad(d, t, [r - 12, r - 5], 0.013, q * 16, 520);
      if ([0, 3, 4, 6].includes(k)) I.drum(d, t, k === 0 ? 0.1 : 0.055);
      if (k % 2 === 1 || chance(0.3)) {
        if (chance(0.55)) I.pluck(d, t, walk(st, M, 4, 12), 0.045, 0.45, 0.6);
      }
      if (L >= 1 && k === 0) I.pluck(d, t, r - 12 + c[0], 0.05, 0.9, 0.3);
      if (L >= 2 && b % 4 === 3 && k === 2) I.lead(d, t, walk(st, M, 7, 11), 0.016, q * 5, 'triangle', 1500);
    },
    ant(d, st, t, M, i, b, c, L, q) {
      const r = M.root,
        k = i % 8;
      if (k === 0 && b % 2 === 0) I.pad(d, t, [r - 12, r - 5], 0.011, q * 16, 420);
      if (k % 2 === 0 && chance(0.16)) I.bell(d, t, walk(st, M, 14, 21), 0.026, 2.3, 5.4);
      if (L >= 1 && k === 0)
        I.pad(
          d,
          t,
          c.map((o) => r + o),
          0.006,
          q * 8,
          800,
        );
      if (L >= 2 && k === 4 && chance(0.3)) I.bell(d, t, walk(st, M, 10, 17), 0.016, 2, 3.5);
    },
  };
  /* las celdas nuevas reutilizan los arreglos con su propia tonalidad y tempo */
  for (const [a, b] of Object.entries({
    col: 'pri',
    bib: 'inv',
    coc: 'ver',
    rel: 'oto',
    inn: 'esp',
    tea: 'des',
    far: 'oce',
    tre: 'ver',
    sot: 'inv',
    cue: 'ant',
    vol: 'des',
    cum: 'esp',
    dsv: 'oto',
    est: 'inv',
    ret: 'pri',
    jar: 'pri',
    cor: 'esp',
    and: 'inv',
    eco: 'ant',
    per: 'oto',
    api: 'pri',
    rev: 'esp',
  }))
    PLAY[a] = PLAY[b];
  for (const id of ORDER) {
    if (!(id in MG)) MG[id] = 2.1;
    if (!(id in BG)) BG[id] = 0.9;
  }
  /* ══ EL TEMA DE AMARANTA ══ una sola melodía de cuatro compases (grados de la escala de cada cuarto).
     Cada zona la toca con su instrumento: los sueños con caja de música, la memoria con piano,
     las estaciones y la casa con guitarra y flauta, las raíces con chelo, el Corazón solo con el latido
     y la colmena de abajo al revés y casi sin notas. Cada cuarto conserva su tonalidad y su tempo. */
  const THEME = [
    [0, 4, 3],
    [3, 2, 1],
    [4, 1, 2],
    [6, 0, 2],
    [8, 1, 2],
    [10, 2, 2],
    [12, 4, 4],
    [16, 5, 3],
    [19, 4, 1],
    [20, 2, 2],
    [22, 1, 2],
    [24, 2, 2],
    [26, 0, 6],
  ];
  const THEME_R = THEME.map(([e, g, d]) => [30 - e - d + 2, g, d]).sort((a, b) => a[0] - b[0]);
  const deg = (M, g, oct = 0) => {
    const n = M.sc.length,
      o = Math.floor(g / n),
      k = ((g % n) + n) % n;
    return M.root + (o + oct) * 12 + M.sc[k];
  };
  const zoneOf = (id) => {
    try {
      return GRUPO[id] || 'sea';
    } catch (e) {
      return 'sea';
    }
  };
  const ZP = {
    /* guitarra que puntea el acorde + flauta con el tema */
    sea(d, st, t, M, i, b, c, L, q, mel) {
      const r = M.root,
        k = i % 8;
      if (k % 2 === 0) I.pluck(d, t, r - 12 + c[(k / 2) % c.length] + (k >= 4 ? 12 : 0), 0.035, 1.1, 0.35);
      if (mel) I.lead(d, t, deg(M, mel[1], 1), 0.03, mel[2] * q * 0.95, 'triangle', 2400);
      if (L >= 1 && k === 0)
        I.pad(
          d,
          t,
          c.map((o) => r + o),
          0.006,
          q * 8,
          700,
        );
      if (L >= 2 && mel && mel[2] >= 2) I.pluck(d, t + q, deg(M, mel[1] - 2, 1), 0.02, 0.8);
    },
    ofi(...a) {
      ZP.sea(...a);
    },
    /* caja de música: todo agudo, campanitas y un colchón muy suave */
    dre(d, st, t, M, i, b, c, L, q, mel) {
      const r = M.root,
        k = i % 8;
      if (k === 0)
        I.pad(
          d,
          t,
          c.map((o) => r + o),
          0.006,
          q * 8,
          600,
        );
      if (mel) I.bell(d, t, deg(M, mel[1], 2), 0.04, 1.8, 3.5);
      else if (k % 2 === 1 && chance(0.45)) I.bell(d, t, r + 24 + c[k % c.length], 0.015, 1.2, 5.4);
      if (L >= 2 && mel) I.bell(d, t + q * 0.5, deg(M, mel[1] + 2, 2), 0.012, 1.2, 5.4);
    },
    /* piano: mano izquierda en el acorde, derecha con el tema */
    mem(d, st, t, M, i, b, c, L, q, mel) {
      const r = M.root,
        k = i % 8;
      if (k === 0 || k === 4) I.pluck(d, t, r - 12 + c[0], 0.04, 1.8, 0.15);
      if (k === 2 || k === 6) I.pluck(d, t, r + c[1 % c.length], 0.025, 1.2, 0.15);
      if (mel) I.pluck(d, t, deg(M, mel[1], 1), 0.06, 1.6 + mel[2] * 0.2, 0.3);
      if (L >= 1 && k === 0)
        I.pad(
          d,
          t,
          c.map((o) => r + o),
          0.005,
          q * 8,
          600,
        );
    },
    /* chelo: notas largas y graves, con un bajo que sostiene */
    rai(d, st, t, M, i, b, c, L, q, mel) {
      const r = M.root,
        k = i % 8;
      if (k === 0) I.bass(d, t, r - 12 + c[0], 0.05, q * 7);
      if (mel) I.lead(d, t, deg(M, mel[1], 0), 0.035, mel[2] * q, 'sawtooth', 900);
      if (L >= 1 && k === 4)
        I.pad(
          d,
          t,
          c.map((o) => r - 12 + o),
          0.006,
          q * 4,
          500,
        );
    },
    /* el Corazón: solo el latido, y el tema apenas insinuado cuando hay sellos */
    cor(d, st, t, M, i, b, c, L, q, mel) {
      const k = i % 8;
      if (k === 0) {
        I.drum(d, t, 0.12);
        I.drum(d, t + 0.26, 0.07);
      }
      if (mel && L >= 3 && chance(0.6)) I.bell(d, t, deg(M, mel[1], 1), 0.02, 2.4, 3.5);
    },
    /* la colmena de abajo: el tema al revés, escaso y un poco desafinado */
    aba(d, st, t, M, i, b, c, L, q, mel, rev) {
      const r = M.root,
        k = i % 8;
      if (k === 0 && chance(0.5)) I.pad(d, t, [r - 12 + c[0], r - 12 + c[1 % c.length] + 1], 0.006, q * 8, 400);
      if (rev && chance(0.55)) I.bell(d, t, deg(M, rev[1], 1) + (chance(0.3) ? 0.5 : 0), 0.025, 2.2, 2.01);
    },
  };
  /* 64 corcheas: tema (32), variación libre (16) y silencio (16, lo pone musicTick) */
  for (const id of ORDER) {
    PLAY[id] = (d, st, t, M, i, b, c, L, q) => {
      const z = ZP[zoneOf(id)] || ZP.sea,
        e = i % 64,
        inT = e < 32,
        mel = inT ? THEME.find((n) => n[0] === e) : null,
        rev = inT ? THEME_R.find((n) => n[0] === e) : null;
      if (!inT && e % 2 === 0 && chance(0.3)) {
        const free = [e, Math.floor(Math.random() * 5), 1];
        return z(d, st, t, M, i, b, c, L, q, zoneOf(id) === 'cor' ? null : free, null);
      }
      z(d, st, t, M, i, b, c, L, q, mel, rev);
    };
  }
  /* el tema entero, para los finales */
  function themeNow() {
    if (!on || !ac || ac.state !== 'running') return;
    const M = MUS[cur] || MUS.pri,
      q = 60 / Math.max(60, M.bpm) / 2,
      t0 = ac.currentTime + 0.2;
    for (const [e, g, dd] of THEME) {
      I.bell(sfxB, t0 + e * q, deg(M, g, 1), 0.05, 2.2, 3.5);
      I.pluck(sfxB, t0 + e * q, deg(M, g, 0), 0.03, 1.4);
    }
    I.pad(
      sfxB,
      t0,
      M.ch[0].map((o) => M.root + o),
      0.02,
      q * 32,
      800,
    );
  }

  const MS = {};
  let musRoom = null;
  window.MUSBPM = (id) => (MUS[id] || MUS.pri).bpm;
  function musicTick(t) {
    const id = cur,
      M = MUS[id],
      play = PLAY[id];
    if (!M || !play) return;
    const st = MS[id] || (MS[id] = { i: 0, next: 0, mel: M.sc.length + 2 }),
      q = 60 / M.bpm / 2,
      L = PUZ.seals();
    if (musRoom !== id || st.next < t - 0.3) {
      st.next = t + 0.12;
      musRoom = id;
    }
    /* más silencio: la música respira y calla dos compases de cada ocho */
    while (st.next < t + 0.3) {
      const i = st.i,
        b = Math.floor(i / 8);
      if (b % 8 < 6) play(musB[id], st, st.next, M, i, b, M.ch[b % M.ch.length], L, q);
      st.i++;
      st.next += q;
    }
  }
  /* ══════════ SONIDOS DE LAS INTERACCIONES · afinados en la tonalidad del cuarto ══════════ */
  function sfx(name, a) {
    if (!on || !ac || ac.state !== 'running') return;
    const t = ac.currentTime + 0.01,
      d = sfxB,
      M = MUS[cur] || MUS.pri,
      r = M.root,
      c = M.ch[0];
    if (name === 'pick') {
      I.pluck(d, t, r + 12, 0.1, 0.5);
      I.pluck(d, t + 0.09, r + 19, 0.1, 0.7);
      I.bell(d, t + 0.17, r + 31, 0.035, 0.6, 5);
    } else if (name === 'give') {
      c.slice(0, 3).forEach((o, k) => I.pluck(d, t + k * 0.07, r + 12 + o, 0.08, 1.3));
      I.bell(d, t + 0.24, r + 24, 0.045, 1.5);
    } else if (name === 'crank') {
      const dur = a || 1.9,
        n = Math.round(dur / 0.085);
      for (let k = 0; k < n; k++) {
        const u = k / n;
        H.hit(d, H.nz.white, 'bandpass', 1300 + u * 1700, 7, 0.11, 0.022, 0.001, t + (k * dur) / n);
        if (k % 3 === 0) H.hit(d, H.nz.brown, 'lowpass', 260, 0.8, 0.05, 0.04, 0.002, t + (k * dur) / n);
      }
      const o = osc('sawtooth', 80, t, t + dur),
        bq = ac.createBiquadFilter(),
        g = ac.createGain();
      o.frequency.linearRampToValueAtTime(130, t + dur);
      bq.type = 'bandpass';
      bq.frequency.value = 520;
      bq.Q.value = 6;
      o.connect(bq);
      bq.connect(g);
      g.connect(d);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.018, t + 0.2);
      g.gain.setValueAtTime(0.018, t + dur - 0.2);
      g.gain.linearRampToValueAtTime(0, t + dur);
    } else if (name === 'thunk') {
      H.tone(d, 'sine', 120, 46, 0.26, 0.4);
      H.hit(d, H.nz.brown, 'lowpass', 320, 0.7, 0.3, 0.22, 0.002);
      I.pluck(d, t + 0.12, r + 12 + c[2], 0.05, 1.2);
    } else if (name === 'door') {
      const o = osc('sawtooth', 160, t, t + 0.5),
        bq = ac.createBiquadFilter(),
        g = ac.createGain();
      o.frequency.linearRampToValueAtTime(240, t + 0.22);
      o.frequency.linearRampToValueAtTime(150, t + 0.48);
      bq.type = 'bandpass';
      bq.frequency.value = 900;
      bq.Q.value = 9;
      o.connect(bq);
      bq.connect(g);
      g.connect(d);
      env(g, t, 0.06, 0.028, 0.42);
      H.hit(d, H.nz.pink, 'bandpass', 650, 2, 0.05, 0.14, 0.01, t + 0.02);
    } else if (name === 'blocked') {
      H.tone(d, 'sine', 150, 92, 0.12, 0.28);
      H.hit(d, H.nz.brown, 'lowpass', 380, 0.7, 0.14, 0.14, 0.002);
    } else if (name === 'cheer') {
      const mo = [0, 4, 7];
      mo.forEach((o, k) => I.pluck(d, t + k * 0.11, r + 12 + o, 0.09, 1.2));
      I.bell(d, t + 0.36, r + 24 + c[2 % c.length], 0.05, 1.8);
      I.bell(d, t + 0.36, r + 31, 0.03, 2);
    } else if (name === 'atajo') {
      H.hit(d, H.nz.brown, 'lowpass', 180, 0.8, 0.12, 0.25, 0.05);
      [7, 12].forEach((o, k) => I.bell(d, t + 0.12 + k * 0.16, r + 12 + o, 0.045, 1.4));
    } else if (name === 'flash') {
      I.bell(d, t, r + 24, 0.05, 2.6);
      I.bell(d, t, r + 31, 0.035, 2.6);
      I.bell(d, t + 0.02, r + 36, 0.02, 2.4);
    } else if (name === 'seal') {
      const mo = [7, 4, 2, 0];
      mo.forEach((o, k) => {
        I.bell(d, t + k * 0.42, r + 12 + o, 0.07, 2.2);
        I.pluck(d, t + k * 0.42, r + o, 0.04, 1.6);
      });
      I.bell(d, t + 1.9, r + 24, 0.06, 3.2);
      I.pad(
        d,
        t + 1.6,
        c.slice(0, 3).map((o) => r + o),
        0.03,
        2.4,
        1200,
      );
      I.pad(
        d,
        t + 1.6,
        c.slice(0, 3).map((o) => r + 12 + o),
        0.018,
        2.4,
        700,
      );
      for (const id of ORDER) musB[id].gain.setTargetAtTime(0.25 * (MG[id] || 1), t, 0.2);
      setTimeout(() => {
        if (ac) for (const id of ORDER) musB[id].gain.setTargetAtTime(MG[id] || 1, ac.currentTime, 1.2);
      }, 4200);
    } else if (name === 'card') {
      I.bell(d, t, r + 24, 0.04, 2.4);
      I.bell(d, t + 0.25, r + 31, 0.03, 2.4);
    } else if (name === 'page') {
      H.hit(d, H.nz.white, 'bandpass', 3400, 0.9, 0.05, 0.2, 0.05);
      H.hit(d, H.nz.white, 'bandpass', 2200, 0.9, 0.03, 0.12, 0.02, t + 0.14);
    } else if (name === 'plank') {
      const v = a || 0.4;
      H.hit(d, H.nz.brown, 'lowpass', 420, 1, 0.12 * v, 0.08, 0.002);
      H.hit(d, H.nz.white, 'bandpass', H.rnd(700, 1100), 6, 0.05 * v, 0.05, 0.002);
    } else if (name === 'bstep') {
      /* pasos en los puentes, al compás y con el material de cada zona */ const m = a || 'mad';
      if (m === 'hie') {
        H.hit(d, H.nz.white, 'highpass', 4200, 1, 0.05, 0.05, 0.001);
        I.bell(d, t, r + 31 + [0, 5, 7][Math.floor(Math.random() * 3)], 0.012, 0.35, 6);
      } else if (m === 'cor') {
        H.tone(d, 'sine', H.rnd(520, 700), H.rnd(260, 340), 0.045, 0.12);
        H.hit(d, H.nz.pink, 'lowpass', 900, 0.7, 0.03, 0.08, 0.003);
      } else if (m === 'are') {
        H.hit(d, H.nz.pink, 'bandpass', H.rnd(1800, 2600), 0.8, 0.05, 0.14, 0.02);
      } else if (m === 'sue') {
        H.hit(d, H.nz.brown, 'bandpass', H.rnd(500, 700), 5, 0.06, 0.09, 0.004);
        if (Math.random() < 0.35) I.bell(d, t + 0.05, r + 24 + [0, 4, 7, 12][Math.floor(Math.random() * 4)], 0.014, 0.9, 5.4);
      } else if (m === 'rai') {
        H.tone(d, 'sine', 110, 70, 0.07, 0.14);
        H.hit(d, H.nz.brown, 'lowpass', 260, 0.8, 0.08, 0.1, 0.003);
      } else if (m === 'aba') {
        H.hit(d, H.nz.white, 'bandpass', H.rnd(900, 1300), 3, 0.03, 0.12, 0.01);
        if (Math.random() < 0.2) H.tone(d, 'sine', 220, 180, 0.012, 0.6);
      } else if (m === 'cora') {
        H.tone(d, 'sine', 62, 40, 0.08, 0.3);
      } else {
        H.hit(d, H.nz.brown, 'lowpass', 420, 1, 0.09, 0.08, 0.002);
        H.hit(d, H.nz.white, 'bandpass', H.rnd(700, 1100), 6, 0.035, 0.05, 0.002);
        if (m === 'mem' && Math.random() < 0.25) I.pluck(d, t, r + 24, 0.02, 0.5);
      }
    } else if (name === 'hop') {
      if (a) {
        I.bell(d, t, r + 24 + [0, 4, 7][Math.floor(Math.random() * 3)], 0.02, 0.5, 5.4);
        H.hit(d, H.nz.white, 'highpass', 3000, 0.7, 0.03, 0.1, 0.005);
      } else {
        H.hit(d, H.nz.brown, 'lowpass', 300, 0.8, 0.14, 0.07, 0.002);
        I.pluck(d, t, r + 12, 0.03, 0.3);
      }
    } else if (name === 'whistle') {
      for (const [dt, f, dur] of [
        [0, 880, 0.35],
        [0.4, 740, 0.6],
      ]) {
        const o = osc('sine', f, t + dt, t + dt + dur + 0.05),
          o2 = osc('sine', f * 1.5, t + dt, t + dt + dur + 0.05),
          g = ac.createGain();
        o.connect(g);
        o2.connect(g);
        g.connect(d);
        g.gain.setValueAtTime(0, t + dt);
        g.gain.linearRampToValueAtTime(0.03, t + dt + 0.05);
        g.gain.setValueAtTime(0.03, t + dt + dur - 0.08);
        g.gain.linearRampToValueAtTime(0, t + dt + dur);
      }
    } else if (name === 'ui') H.hit(d, H.nz.white, 'bandpass', 2600, 1.2, 0.05, 0.03, 0.002);
    else if (name === 'beat') {
      for (const [dt, v] of [
        [0, 0.34],
        [0.28, 0.24],
      ]) {
        H.tone(d, 'sine', 62, 38, v, 0.5, t + dt);
        H.hit(d, H.nz.brown, 'lowpass', 140, 0.8, v * 0.8, 0.3, 0.004, t + dt);
      }
      I.pad(d, t + 0.1, [r - 24, r - 17], 0.02, 2, 300);
    } else if (name === 'thumb' || name === 'thump') {
      const v = (a || 0) * 0.12;
      H.tone(d, 'sine', 58, 40, v, 0.35, t);
      H.tone(d, 'sine', 54, 38, v * 0.7, 0.3, t + 0.26);
    }
  }
  function setOn(v) {
    on = v;
    try {
      localStorage.setItem(CFG.KEY + '-sonido', v ? 'on' : 'off');
    } catch (e) {}
    if (v && !ac && !build()) {
      on = false;
      return;
    }
    if (!ac) return;
    if (v) ac.resume();
    master.gain.setTargetAtTime(v ? 0.7 * vol : 0, ac.currentTime, 0.3);
  }
  function setVolume(v) {
    vol = v;
    try {
      localStorage.setItem('colmena-vol', v);
    } catch (e) {}
    if (ac && on) master.gain.setTargetAtTime(0.7 * vol, ac.currentTime, 0.1);
  }
  function tick(moving) {
    if (!on || !ac || ac.state !== 'running') return;
    const t = ac.currentTime;
    for (const id of ORDER) buses[id].gain.setTargetAtTime(id === cur ? 1 : 0, t, 0.45);
    voice.gain.setTargetAtTime(moving ? voice.on : voice.off, t, 0.12);
    STYLE.sound.tick(H, cur, t, nx);
    musicTick(t);
  }
  function step() {
    if (on && ac && ac.state === 'running' && STYLE.sound.step) STYLE.sound.step(H, cur);
  }
  return {
    get on() {
      return on;
    },
    get pref() {
      return pref;
    },
    get vol() {
      return vol;
    },
    started: () => !!ac,
    setOn,
    tick,
    step,
    theme: () => {
      try {
        themeNow();
      } catch (e) {}
    },
    setVolume,
    sfx,
    _dbg: () => ({ ac, buses, bedB, musB, sfxB, master }),
  };
})();

/* ── entrada ── */
const keys = {},
  kmap = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r', w: 'u', s: 'd', a: 'l', d: 'r', W: 'u', S: 'd', A: 'l', D: 'r' };
let near = false,
  nearObj = null,
  talking = false,
  lineIx = 0,
  typeT = 0,
  mark = null,
  DLG = null;
addEventListener('keydown', (e) => {
  const d = kmap[e.key];
  if (d) {
    keys[d] = 1;
    e.preventDefault();
    return;
  }
  if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || (e.key === ' ' && e.target === document.body)) {
    if (near || talking) {
      e.preventDefault();
      interact();
    }
  } else if (e.key === 'Escape') {
    const bk = document.getElementById('book');
    if (!bk.hidden) {
      bk.hidden = true;
      return;
    }
    if (talking) closeTalk();
    else if (!inTitle) setMenu(panel.hidden);
  } else if (e.key === 'f' || e.key === 'F') toggleFS();
  else if (e.key === '+' || e.key === '=') zoomTo(Z * 1.25);
  else if (e.key === '-') zoomTo(Z / 1.25);
  else if (e.key === '0') zoomTo(1);
});
addEventListener('keyup', (e) => {
  const d = kmap[e.key];
  if (d) keys[d] = 0;
});
addEventListener('blur', () => {
  for (const k in keys) keys[k] = 0;
});
function updSnd() {
  sndBtn.setAttribute('aria-pressed', Sound.on);
  sndBtn.textContent = _t(Sound.on ? '♪ Sonido: sí' : '♪ Sonido: no');
  sndBtn.classList.toggle('off', !Sound.on);
}
const kick = (e) => {
  if (e.target === sndBtn) return;
  if (Sound.pref && !Sound.started()) {
    Sound.setOn(true);
    updSnd();
  }
};
addEventListener('pointerdown', kick, true);
addEventListener('keydown', kick, true);
sndBtn.addEventListener('click', () => {
  Sound.setOn(!Sound.on);
  updSnd();
});
updSnd();
let Zt = null;
function zoomTo(z, smooth) {
  const v = clamp(z, 1, ZMAX);
  mapMode = v < 1.04;
  zoomT = performance.now();
  if (smooth) Zt = v;
  else {
    Zt = null;
    Z = v;
  }
}
function toggleMap() {
  PAN.x = PAN.y = 0;
  zoomTo(mapMode ? ZF : 1);
  mapBtn.textContent = _t(mapMode ? '⤡ Volver al cuarto' : '⤢ Ver el mapa');
  const bm = document.getElementById('bmap');
  if (bm) {
    bm.textContent = mapMode ? '⤡' : '⤢';
    bm.setAttribute('aria-label', _t(mapMode ? 'Volver al cuarto' : 'Ver el mapa'));
  }
}
const menuBtn = document.getElementById('menu'),
  panel = document.getElementById('panel'),
  mapBtn = document.getElementById('map');
function setMenu(o) {
  panel.hidden = !o;
  const pb = document.getElementById('panelbg');
  if (pb) pb.hidden = !o;
  if (o) updJournal();
  menuBtn.setAttribute('aria-expanded', o);
}
document.getElementById('panelbg').addEventListener('click', () => setMenu(false));
menuBtn.addEventListener('click', () => setMenu(panel.hidden));
mapBtn.addEventListener('click', () => {
  toggleMap();
  setMenu(false);
});
document.getElementById('bmap').addEventListener('click', () => {
  toggleMap();
  setMenu(false);
});
document.querySelector('.tag').addEventListener('click', () => showGoal());
document.querySelector('.tag').style.pointerEvents = 'auto';
document.querySelector('.tag').style.cursor = 'pointer';
/* el cuaderno: las páginas encontradas y los símbolos */
function openBook() {
  setMenu(false);
  const F = PROG.F,
    box = document.getElementById('bpages');
  box.innerHTML = '';
  const got = ORDER.filter((id) => F.pages && F.pages[id] && PAGES[id]);
  if (!got.length) {
    const e = document.createElement('p');
    e.className = 'empty';
    e.textContent = _t('Todavía no has encontrado ninguna página. Busca en los rincones oscuros.');
    box.appendChild(e);
  }
  for (const id of got) {
    const a = document.createElement('article'),
      sm = document.createElement('small');
    sm.textContent = _t(SEASON[id].name);
    a.appendChild(sm);
    a.appendChild(document.createTextNode(_t(PAGES[id][2])));
    box.appendChild(a);
  }
  const gl = F.glyphs || {},
    n = Object.keys(gl).length;
  document.getElementById('bglyph').textContent =
    _t(`Páginas: ${got.length}/${Object.keys(PAGES).length} · Símbolos: ${n}/${Object.keys(GLYPHS).length}`) +
    (n
      ? ' — ' +
        ORDER.filter((id) => gl[id])
          .map((id) => '⬡'.repeat(1) + gl[id])
          .join('  ')
      : '');
  document.getElementById('book').hidden = false;
  document.getElementById('bclose').focus();
}
document.getElementById('bbook').addEventListener('click', openBook);
document.getElementById('bclose').addEventListener('click', () => {
  document.getElementById('book').hidden = true;
});
document.getElementById('hintb').addEventListener('click', () => {
  setMenu(false);
  note(PUZ.goal());
});
addEventListener('keydown', (e) => {
  if (e.key === 'm' || e.key === 'M') toggleMap();
});
const ptrs = new Map();
let pinch = null,
  tap = null,
  drag = null,
  gest = false;
const dev = (e) => {
  const r = cv.getBoundingClientRect();
  return [(e.clientX - r.left) * DPR, (e.clientY - r.top) * DPR];
};
/* zoom anclado: el punto del mundo bajo (mx,my) se queda bajo los dedos / el cursor */
function zoomAt(z, mx, my, ref) {
  const s0 = S * Z * ZK * DPR,
    wx = (mx - (ref ? ref.cx : camX)) / s0,
    wy = (my - (ref ? ref.cy : camY)) / s0;
  Zt = null;
  Z = clamp(z, 1, ZMAX);
  mapMode = Z < 1.04;
  zoomT = performance.now();
  const s1 = S * Z * ZK * DPR,
    b = camBase();
  PAN.x = mx - wx * s1 - b[0];
  PAN.y = my - wy * s1 - b[1];
  clampPan();
  const t = camTarget();
  camX = t[0];
  camY = t[1];
  mapBtn.textContent = _t(mapMode ? '⤡ Volver al cuarto' : '⤢ Ver el mapa');
}
cv.addEventListener('pointerdown', (e) => {
  try {
    cv.setPointerCapture(e.pointerId);
  } catch (_) {}
  ptrs.set(e.pointerId, dev(e));
  if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()];
    pinch = { d0: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] };
    tap = null;
    drag = null;
    gest = true;
  } else if (ptrs.size === 1) {
    tap = { p: dev(e), t: performance.now(), ok: true };
    drag = { p: dev(e), on: false };
  }
});
cv.addEventListener('pointermove', (e) => {
  if (!ptrs.has(e.pointerId)) return;
  ptrs.set(e.pointerId, dev(e));
  if (pinch && ptrs.size >= 2) {
    const [a, b] = [...ptrs.values()],
      d = Math.hypot(a[0] - b[0], a[1] - b[1]),
      m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    /* dos dedos: pellizco + arrastre a la vez */
    PAN.x += m[0] - pinch.m[0];
    PAN.y += m[1] - pinch.m[1];
    camX += m[0] - pinch.m[0];
    camY += m[1] - pinch.m[1];
    zoomAt((Z * d) / pinch.d0, m[0], m[1]);
    pinch.d0 = d || 1;
    pinch.m = m;
    return;
  }
  const q = dev(e);
  if (tap && Math.hypot(q[0] - tap.p[0], q[1] - tap.p[1]) > 10 * DPR) tap.ok = false;
  if ((drag && e.pointerType !== 'mouse') || (drag && e.buttons)) {
    if (!drag.on && tap && !tap.ok) drag.on = true;
    if (drag.on) {
      PAN.x += q[0] - drag.p[0];
      PAN.y += q[1] - drag.p[1];
      clampPan();
      const t = camTarget();
      camX = t[0];
      camY = t[1];
      gest = true;
    }
    drag.p = q;
  }
});
const upP = (e) => {
  if (e.type === 'pointerup' && tap && tap.ok && ptrs.size === 1 && performance.now() - tap.t < 600) onTap(...dev(e));
  ptrs.delete(e.pointerId);
  if (ptrs.size < 2) pinch = null;
  if (ptrs.size === 1 && !pinch) {
    const q = [...ptrs.values()][0];
    drag = { p: q, on: true };
    tap = null;
  }
  if (!ptrs.size) {
    tap = null;
    drag = null;
    gest = false;
    panHold = performance.now();
  }
};
let panHold = 0;
cv.addEventListener('pointerup', upP);
cv.addEventListener('pointercancel', upP);
cv.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    const [mx, my] = dev(e);
    zoomAt(Z * Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0016)), mx, my);
  },
  { passive: false },
);
document.addEventListener('gesturestart', (e) => e.preventDefault());
function goTo(tx, ty, npc = false, door = null, thing = null) {
  const rt = route(tx, ty);
  if (!rt || !rt.length) {
    if (thing && Math.hypot(Pl.x - thing.x, (Pl.y - thing.y) * 1.2) < thing.r) act(thing);
    return false;
  }
  Pl.route = { pts: rt, k: 0, npc, door, thing, stuck: 0 };
  mark = { x: rt[rt.length - 1][0], y: rt[rt.length - 1][1], t: T };
  if (talking && !npc) closeTalk();
  return true;
}
function onTap(sx, sy) {
  if (crossing || inTitle) return;
  const s = S * Z * ZK * DPR,
    c = CELLS[cur],
    B = BAKED[cur],
    ox = camX + CW[cur][0] * s,
    oy = oyOf(cur, s);
  Pl.goal = null;
  for (const g of B.signs) {
    const r = s / (S * B.z * DPR),
      x0 = ox + g.x0 * s,
      y0 = oy + g.y0 * s,
      w = g.c.width * r,
      h = g.c.height * r;
    if (sx > x0 + w * 0.15 && sx < x0 + w * 0.85 && sy > y0 + h * 0.1 && sy < y0 + h * 0.9) {
      goTo(g.d.trig[0], g.d.trig[1], false, g.d);
      return;
    }
  }
  for (const d of c.doors) {
    if (!d.back) continue;
    const q = [ox + d.mid[0] * s, oy + (d.mid[1] * K - 40) * s];
    if (Math.abs(sx - q[0]) < 42 * s && Math.abs(sy - q[1]) < 48 * s) {
      goTo(d.trig[0], d.trig[1], false, d);
      return;
    }
  }
  for (const t of thingsHere()) {
    const q = [ox + t.x * s, oy + (t.y * K - t.z - 8) * s];
    if (Math.hypot(sx - q[0], sy - q[1]) < 44 * s) {
      goTo(t.ax, t.ay, false, null, t);
      return;
    }
  }
  const n = c.npc,
    ns = [ox + n.x * s, oy + (n.y * K - 30) * s];
  if (Math.hypot((sx - ns[0]) / (50 * s), (sy - ns[1]) / (45 * s)) < 1) {
    goTo(n.x + (n.tx ?? 45), n.y + (n.ty ?? 30), true);
    return;
  }
  const wx = (sx - camX) / s,
    wy = (sy - camY) / s / K,
    lx = wx - CW[cur][0],
    ly = wy - CW[cur][1] + LIFT / K;
  /* ¿tocó otro cuarto? ir hacia él, pasando por los que hagan falta */
  if (!inHex(lx, ly, R - 6)) {
    for (const id of ORDER) {
      if (id === cur) continue;
      if (inHex(wx - CW[id][0], wy - CW[id][1], R + TH)) {
        const d = doorToward(id);
        if (!d) {
          const dd = c.doors.find((x) => x.to === id);
          note(dd ? PUZ.why(cur, id) : 'Todavía no hay forma de llegar ahí.');
          if (dd) goTo(dd.trig[0], dd.trig[1], false, dd);
          return;
        }
        Pl.goal = id;
        goTo(d.trig[0], d.trig[1], false, d);
        return;
      }
    }
    let best = null,
      bd = 0.6;
    for (const d of c.doors) {
      const a = Math.atan2(ly, lx),
        b = Math.atan2(d.mid[1], d.mid[0]),
        df = Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
      if (df < bd) {
        bd = df;
        best = d;
      }
    }
    if (best) {
      goTo(best.trig[0], best.trig[1], false, best);
      return;
    }
  }
  goTo(lx, ly);
}
const thingsHere = () => (PUZ.things[cur] || []).filter((t) => t.show());
const hands = () => [Pl.x + Pl.f * 12, Pl.y + 2, 24],
  npcAt = () => {
    const n = CELLS[cur].npc;
    return [n.x, n.y, (n.lz ?? 80) - 24];
  };
function interact() {
  if (talking) {
    talk();
    return;
  }
  if (!nearObj) return;
  if (nearObj.kind === 'npc') talk();
  else act(nearObj.t);
}
function act(t) {
  const F = PROG.F;
  if (t.secret) {
    readSecret(t);
    return;
  }
  if (t.item) {
    if (bagHas(t.item)) {
      note('Ya llevas ' + ITEM_NAME[t.item] + '.');
      return;
    }
    if (bagFull()) {
      note('La mochila está llena: caben tres cosas.');
      Sound.sfx('blocked');
      return;
    }
    bagGive(t.item);
    FLY.push({ item: t.item, a: () => [t.x, t.y, t.z], b: hands, t0: T, dur: 0.45 });
    handHideUntil = T + 0.45;
    if (t.item === 'agua') F.tookWater = 1;
    if (t.item === 'hielo') F.tookIce = 1;
    buzz(15);
    Sound.sfx('pick');
    note('Llevas ' + ITEM_NAME[t.item] + '.');
    stateChanged();
    return;
  }
  if (t.bridge) {
    const B = BRIDGES[t.bridge],
      b = BRS[t.bridge];
    if (!B.needs()) {
      note(B.stuck);
      Sound.sfx('blocked');
      return;
    }
    if (!b.turning) {
      b.target = 0;
      b.turning = true;
      buzz(12);
      Sound.sfx('crank', b.ang / 0.55);
      note('Empieza a girar…');
    }
    return;
  }
  if (t.id === 'telescopio') {
    if (!bagHas('lente')) {
      note('Sin lente no se ve nada.');
      return;
    }
    bagTake('lente');
    FLY.push({ item: 'lente', a: hands, b: () => [t.x - 20, t.y, 90], t0: T, dur: 0.5 });
    EMO.esp = { ch: '✦', t0: T + 0.4 };
    WAVE = { t0: T + 0.5, id: 'esp' };
    Sound.sfx('seal');
    narrate(NARR.seal[2], 'seal2', { delay: 1 });
    ZKhold = { v: 0.62, until: T + 3.4 };
    Pl.happy = T + 3;
    F.star = 1;
    stateChanged();
    rebakeCell('esp');
    buzz([20, 60, 30]);
    note('✦ Segundo sello encendido');
    pendingCard = 'fin';
    nearObj = { kind: 'npc' };
    near = true;
    talking = false;
    talk();
    DLG.forced = true;
    return;
  }
  if (t.id === 'cerezo') {
    if (!bagHas('sol')) {
      note('Duerme. Le falta sol del verano.');
      return;
    }
    bagTake('sol');
    FLY.push({ item: 'sol', a: hands, b: () => [t.x, t.y, 60], t0: T, dur: 0.5 });
    EMO.pri = { ch: '✦', t0: T + 0.4 };
    WAVE = { t0: T + 0.5, id: 'pri' };
    Sound.sfx('seal');
    narrate(NARR.seal[1], 'seal1', { delay: 1 });
    ZKhold = { v: 0.62, until: T + 3.4 };
    Pl.happy = T + 3;
    F.bloom = 1;
    F.done = 1;
    F.melted = 1;
    stateChanged();
    rebakeCell('pri');
    for (const id of NEW_CELLS) delete BAKED[id];
    buzz([20, 60, 30]);
    note('✦ Primer sello encendido');
    pendingCard = 2;
    nearObj = { kind: 'npc' };
    near = true;
    talking = false;
    talk();
    DLG.forced = true;
  }
}
/* lo que cambia de manos al hablar: vuela de la mochila al vecino y al revés */
function bagFly(b0) {
  const b1 = PROG.bag,
    gone = b0.filter((i) => !b1.includes(i)),
    got = b1.filter((i) => !b0.includes(i));
  if (!gone.length && !got.length) return;
  buzz(15);
  if (gone.length) Sound.sfx('give');
  if (got.length) setTimeout(() => Sound.sfx('pick'), gone.length ? 520 : 0);
  gone.forEach((h, k) => FLY.push({ item: h, a: hands, b: npcAt, t0: T + k * 0.15, dur: 0.45 }));
  got.forEach((h, k) => FLY.push({ item: h, a: npcAt, b: hands, t0: T + (gone.length ? 0.5 : 0) + k * 0.15, dur: 0.45 }));
  handHideUntil = got.length ? T + (gone.length ? 0.95 : 0.45) : 0;
  EMO[cur] = { ch: '♥', t0: T + 0.3 };
  Pl.happy = T + 2.5;
}
function talk() {
  const n = CELLS[cur].npc;
  if (talking) {
    if (STYLE.typewriter && typeT < DLG.lines[lineIx].length) {
      typeT = 1e9;
      return;
    }
    lineIx++;
    if (lineIx >= DLG.lines.length) {
      closeTalk();
      return;
    }
  } else {
    const b0 = PROG.bag.slice();
    DLG = PUZ.dialog(cur);
    if (DLG.fx) {
      DLG.fx();
      stateChanged();
      bagFly(b0);
    }
    talking = true;
    lineIx = 0;
  }
  typeT = 0;
  dn.textContent = _t(STYLE.dlgName(n));
  dl.textContent = STYLE.typewriter ? '' : _t(DLG.lines[lineIx]);
  dm.textContent = _t(STYLE.dlgHint());
  dlg.hidden = false;
  talkBtn.hidden = true;
  STYLE.portrait(ptC, n, DLG.ex[lineIx % DLG.ex.length]);
}
function closeTalk() {
  talking = false;
  dlg.hidden = true;
  if (DLG && DLG.after) {
    const f = DLG.after;
    DLG.after = null;
    setTimeout(f, 260);
  }
  if (pendingCard && DLG && DLG.forced) {
    const c = pendingCard;
    pendingCard = null;
    setTimeout(() => showChapter(c), 350);
  }
}
talkBtn.addEventListener('click', (e) => {
  e.preventDefault();
  interact();
});
dlg.addEventListener('click', () => talk());

/* ── dibujo de una celda nítida ── */
/* sombra suave bajo el cuarto actual: se prepara una vez y se dibuja escalada */
let SPOT = null;
function spotSprite() {
  if (SPOT) return SPOT;
  const n = 256,
    c = newCanvas(n, n),
    g = c.getContext('2d'),
    gr = g.createRadialGradient(n / 2, n / 2, ((n / 2) * 10) / 390, n / 2, n / 2, n / 2);
  gr.addColorStop(0, 'rgba(40,20,5,.6)');
  gr.addColorStop(1, 'rgba(40,20,5,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, n, n);
  return (SPOT = c);
}
function drawCell(id, ox, oy, s, f) {
  const B = BAKED[id],
    c = CELLS[id],
    r = s / (S * B.z * DPR),
    put = (o, dy = 0) => ctx.drawImage(o.c, ox + o.x0 * s, oy + o.y0 * s + dy, o.c.width * r, o.c.height * r);
  ctx.save();
  ctx.globalAlpha = f;
  put(B.base);
  const p = STYLE.Pen(ctx, ox, oy, s, 'din' + (STILL ? 0 : Math.floor(T * 4)), true),
    pv = STYLE.Pen(ctx, ox, oy, s, 'vol', true, true),
    live = id === cur;
  if (live && c.under) c.under(p, T, STILL);
  if (live) drawSecrets(p, id);
  if (live) qUnder(p, id);
  if (live && STYLE.doorLeaves)
    for (const d of c.doors)
      if (d.back) {
        const k = id + d.to,
          tg = PUZ.open(id, d.to) && (Math.hypot(Pl.x - d.trig[0], Pl.y - d.trig[1]) < 125 || (crossing && crossing.from === id)) ? 1 : 0;
        if (tg && !DOORT[k]) Sound.sfx('door');
        DOORT[k] = tg;
        DOORA[k] = STILL ? tg : lerp(DOORA[k] ?? 0, tg, 0.14);
        STYLE.doorLeaves(p, d, DOORA[k]);
      }
  for (const d of c.doors)
    if (d.back && d.span >= 2) {
      const U = UNF[[id, d.to].sort().join('-')],
        ue = U ? (id < d.to ? U.a : U.b) : 0,
        lit = Math.max(ue, live ? clamp((230 - Math.hypot(Pl.x - d.trig[0], Pl.y - d.trig[1])) / 100, 0, 1) : 0);
      drawBackLanterns(p, id, d, lit, PUZ.open(id, d.to));
    }
  for (const d of c.doors) if (d.back && !PUZ.open(id, d.to)) STYLE.blocker(p, d, blockKind(id, d), T);
  const items = B.spr.map((o) => ({ y: o.y, f: () => put(o) })),
    n = c.npc;
  const nf =
    live && n._walk
      ? n._wf
      : live && n._lookF
        ? n._lookF
        : live && n.turn !== false && Math.hypot(Pl.x - n.x, Pl.y - n.y) < 230
          ? Pl.x >= n.x
            ? 1
            : -1
          : (n.f ?? 1);
  items.push({ y: n.y + (n.dy ?? 1), f: () => n.draw(pv, n.x, n.y, nf, STILL ? 0 : T, n.idle || 'smile', false) });
  if (live && !Pl.onPath)
    items.push({
      y: Pl.y,
      f: () => {
        if (mark && !crossing && (Pl.route || T - mark.t < 1)) STYLE.mark(p, mark.x, mark.y, Pl.route ? 1 : 1 - (T - mark.t));
        STYLE.player(pv, Pl.x, Pl.y - (Pl.z || 0) / K, 0, Pl.f, T, Pl.moving);
      },
    });
  if (live) for (const pf of PUFF) items.push({ y: pf.y - 0.2, f: () => STYLE.puff(p, pf.x, pf.y, (T - pf.t0) / 0.7, id) });
  for (const t of PUZ.things[id] || [])
    if (t.show() && (t.item || live) && !t.secret) {
      const hot = t.item || t.id !== 'cerezo' || bagHas('sol');
      items.push({
        y: t.y - 0.5,
        f: () => {
          if (hot && live) STYLE.hot(p, t.x, t.y, T, t.id === 'cerezo' ? 40 : 20);
        },
      });
      if (t.item) items.push({ y: t.y, f: () => STYLE.token(p, t.x, t.y, t.z + Math.sin(T * 2 + t.x) * 3, t.item, T, false) });
    }
  {
    const w = PUZ.want(id);
    if (w) items.push({ y: n.y + (n.dy ?? 1) + 0.5, f: () => STYLE.want(p, n.x, n.y, (n.lz ?? 80) + 14, w, bagHas(w), T) });
  }
  for (const k in BRIDGES) {
    const b = BRIDGES[k];
    if (b.cell === id) items.push({ y: b.y, f: () => STYLE.crank(p, b.x, b.y, BRS[k].ang, !b.needs(), T) });
  }
  if (window.XITEMS) XITEMS(p, pv, items, id);
  items.sort((a, b) => a.y - b.y);
  for (const it of items) it.f();
  put(B.lip);
  for (const d of c.doors) {
    if (d.span < 2 || d.dyn) continue;
    const op = PUZ.open(id, d.to),
      U = UNF[[id, d.to].sort().join('-')],
      ue = U ? (id < d.to ? U.a : U.b) : 0,
      lit = Math.max(ue, live ? clamp((230 - Math.hypot(Pl.x - d.trig[0], Pl.y - d.trig[1])) / 100, 0, 1) : 0);
    if (!d.back) drawThreshold(p, id, d, lit, op);
  }
  if (live) {
    for (let i = FLY.length - 1; i >= 0; i--) {
      const q = FLY[i],
        u = (T - q.t0) / q.dur;
      if (u < 0) continue;
      if (u >= 1) {
        FLY.splice(i, 1);
        continue;
      }
      const a = q.a(),
        b = q.b(),
        e = u * u * (3 - 2 * u);
      STYLE.token(p, lerp(a[0], b[0], e), lerp(a[1], b[1], e), lerp(a[2], b[2], e) + Math.sin(u * Math.PI) * 48, q.item, T, true);
    }
    const em = EMO[id];
    if (em && T - em.t0 < 2.4) STYLE.emote(p, n.x, n.y, (n.lz ?? 80) + (PUZ.want(id) ? 50 : 20), em.ch, T - em.t0);
  }
  for (const d of c.doors) {
    if (d.dyn) STYLE.bridge(p, d, BRS[bkey(id, d.to)].ang, T);
    else if (!d.back && !PUZ.open(id, d.to)) STYLE.blocker(p, d, blockKind(id, d), T);
  }
  if (live)
    for (const d of c.doors) {
      const dd = Math.hypot(Pl.x - d.trig[0], Pl.y - d.trig[1]);
      if (dd < 230 && !crossing)
        STYLE.doorLabel(p, d, CELLS[d.to], clamp((230 - dd) / 90, 0, 1) * (dd < 130 ? 1 : 0.75), PUZ.open(id, d.to));
    }
  if (PUZ.seal[id] && PUZ.seal[id]()) STYLE.token(p, 0, -262, 150 + Math.sin(T * 1.5) * 3, 'sello', T, false);
  for (const g of B.signs) {
    ctx.globalAlpha = f * (STYLE.signAlpha ? STYLE.signAlpha(T, g.ph) : 1);
    put(g, STILL ? 0 : Math.sin(T * 1.3 + g.ph) * 1.5 * s);
  }
  for (const x of B.extras) {
    ctx.save();
    if (x.blend) ctx.globalCompositeOperation = x.blend;
    ctx.globalAlpha = f * (x.flick && !STILL ? x.flick(T) : 1);
    put(x);
    ctx.restore();
  }
  ctx.globalAlpha = f;
  if (live && c.over) c.over(p, T, STILL);
  if (live) qOver(p, id);
  ctx.restore();
}

/* ── bucle ── */
let T = 0,
  last = performance.now(),
  rz = 0,
  lastStep = 0;
function frame(now) {
  try {
    frameBody(now);
  } catch (e) {
    if (!frame.err) {
      frame.err = 1;
      console.error(e);
    }
  }
  requestAnimationFrame(frame);
}
function frameBody(now) {
  const dt = frameLogic(now);
  if (window.R3D && R3D.on) R3D.frame(dt, now);
  else frameDraw2D(dt, now);
  frameTail(dt, now);
}
/* solo se cruza una puerta si la tocaste, si vas hacia ella o si el viajero va de camino */
function doorWant(d, dx, dy) {
  if (Pl.goal || (Pl.route && Pl.route.door === d)) return true;
  if (dx || dy) {
    const n = d.n || [0, 0],
      L = Math.hypot(n[0], n[1]) || 1;
    return -(dx * n[0] + dy * n[1]) / L > 0.35;
  }
  return false;
}
function frameLogic(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  T += dt;
  const c = CELLS[cur];
  let dx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0),
    dy = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
  Pl.moving = false;
  {
    const g = pad();
    if (g) {
      dx += g[0];
      dy += g[1];
    }
  }
  if (inTitle) {
    dx = 0;
    dy = 0;
  }
  const want = !!(dx || dy || Pl.route);
  Pl.vk = want ? Math.min(1, (Pl.vk || 0) + dt * 6) : Math.max(0, (Pl.vk || 0) - dt * 7);
  Pl.run = !!(Pl.route && Pl.route.run) || (!!(dx || dy) && !!window.RUNK);
  let sp = 150 * dt * (STILL ? 1 : 0.35 + 0.65 * Pl.vk) * (Pl.run ? 1.85 : 1),
    g3 = window.R3D && R3D.on,
    fx = dx;
  if (g3 && (dx || dy)) {
    const r = R3D.rotIn(dx, dy);
    dx = r[0];
    dy = r[1];
  }
  if (crossing) {
    crossing.t += crossing.hold ? 0 : dt * (window.TRAVK ? TRAVK(crossing) : 1);
    let fin = false;
    if (crossing.comp) {
      fin = plazaStep(crossing);
    } else if (crossing.plan) {
      const q = crossAt(crossing);
      crossing.q = q;
      Pl.x = q.x - CW[cur][0];
      Pl.y = q.y - CW[cur][1];
      Pl.z = q.z;
      Pl.onPath = q.on;
      if (Math.abs(q.dx) > 2) Pl.f = q.dx > 0 ? 1 : -1;
      Pl.moving = !q.seated;
      crossSound(crossing, q);
      if (q.done) {
        fin = true;
        const P = crossing.plan.P;
        if (P.type === 'tren') PARK[P.key] = crossing.plan.fwd ? 0.94 : 0.06;
        if (P.type === 'arena') TRAIL[P.key] = { t0: T, fwd: crossing.plan.fwd };
      }
    } else {
      const u = clamp(crossing.t / crossing.dur, 0, 1),
        wx = lerp(crossing.a[0], crossing.b[0], u),
        wy = lerp(crossing.a[1], crossing.b[1], u);
      Pl.x = wx - CW[cur][0];
      Pl.y = wy - CW[cur][1];
      Pl.z = STILL ? 0 : Math.sin(Math.PI * u) * 7;
      const ddx = crossing.b[0] - crossing.a[0];
      if (Math.abs(ddx) > 2) Pl.f = ddx > 0 ? 1 : -1;
      Pl.moving = true;
      fin = u >= 1;
    }
    if (fin) {
      crossing = null;
      Pl.z = 0;
      Pl.onPath = false;
      save();
      if (Pl.goal && Pl.goal !== cur) {
        const d = doorToward(Pl.goal);
        if (d) goTo(d.trig[0], d.trig[1], false, d);
        else Pl.goal = null;
      } else Pl.goal = null;
    }
  } else {
    if (dx || dy) {
      Pl.route = null;
      Pl.goal = null;
      const m = Math.hypot(dx, dy);
      dx /= m;
      dy /= m;
      Pl.gl = [dx, dy];
      const nx = Pl.x + dx * sp,
        ny = Pl.y + dy * sp * (g3 ? 1.1 : 1.3);
      if (free(nx, Pl.y)) Pl.x = nx;
      if (free(Pl.x, ny)) Pl.y = ny;
      if (g3 ? Math.abs(fx) > 0.2 : dx) Pl.f = (g3 ? fx : dx) > 0 ? 1 : -1;
      Pl.moving = true;
    } else if (Pl.route) {
      const [tx, ty] = Pl.route.pts[Pl.route.k],
        ex = tx - Pl.x,
        ey = ty - Pl.y,
        d = Math.hypot(ex, ey);
      {
        const L = Pl.route.pts,
          e = L[L.length - 1],
          rem = Math.hypot(e[0] - Pl.x, e[1] - Pl.y);
        if (!STILL && !Pl.route.door && rem < 34) sp *= 0.45 + (0.55 * rem) / 34;
        Pl.gl = d > 0 ? [ex / d, ey / d] : Pl.gl;
      }
      if (d <= sp) {
        Pl.x = tx;
        Pl.y = ty;
        Pl.route.k++;
      } else {
        const nx = Pl.x + (ex / d) * sp,
          ny = Pl.y + (ey / d) * sp;
        if (free(nx, ny)) {
          Pl.x = nx;
          Pl.y = ny;
        } else if (Math.abs(ex) > 1 && free(nx, Pl.y)) {
          Pl.x = nx;
        } else if (Math.abs(ey) > 1 && free(Pl.x, ny)) {
          Pl.y = ny;
        } else Pl.route.stuck += dt;
      }
      if (Math.abs(ex) > 2) Pl.f = ex > 0 ? 1 : -1;
      Pl.moving = true;
      if (Pl.route.stuck > 0.4) {
        const r = Pl.route,
          end = r.pts[r.pts.length - 1],
          tries = (r.tries || 0) + 1,
          rt = tries <= 2 ? route(end[0], end[1]) : null;
        if (rt && rt.length) {
          Pl.route = { pts: rt, k: 0, npc: r.npc, door: r.door, thing: r.thing, stuck: 0, tries };
        } else {
          Pl.route = null;
          Pl.goal = null;
        }
      } else if (Pl.route.k >= Pl.route.pts.length) {
        const r = Pl.route;
        Pl.route = null;
        if (r.npc) {
          near = true;
          nearObj = { kind: 'npc' };
          talking = false;
          talk();
        } else if (r.thing) act(r.thing);
        else if (r.door) {
          if (PUZ.open(cur, r.door.to)) cross(r.door);
          else note(PUZ.why(cur, r.door.to));
        }
      }
    } else if (!STILL && Pl.vk > 0.05 && Pl.gl) {
      const g = Pl.gl,
        k = 150 * dt * Pl.vk * 0.55,
        nx = Pl.x + g[0] * k,
        ny = Pl.y + g[1] * k;
      if (free(nx, ny)) {
        Pl.x = nx;
        Pl.y = ny;
      }
    }
    if (!crossing)
      for (const d of c.doors) {
        const dd = Math.hypot(Pl.x - d.trig[0], Pl.y - d.trig[1]);
        if (PUZ.open(cur, d.to)) {
          if (dd < 16 && doorWant(d, dx, dy)) {
            cross(d);
            break;
          }
        } else if (dd < 64) {
          const m = PUZ.why(cur, d.to);
          if (m !== lastNote || performance.now() - noteT > 2500) Sound.sfx('blocked');
          note(m);
        }
      }
  }
  if (Pl.moving) {
    idleT = now;
    const st = Math.floor((T * 10) / Math.PI);
    if (st !== lastStep) {
      lastStep = st;
      Sound.step();
      if (!STILL && !crossing) {
        PUFF.push({ x: Pl.x - Pl.f * 5, y: Pl.y + 2, t0: T });
        if (PUFF.length > 10) PUFF.shift();
      }
    }
  }
  for (let i = PUFF.length - 1; i >= 0; i--) if (T - PUFF[i].t0 > 0.7) PUFF.splice(i, 1);
  Pl.ex = talking ? 'open' : T < (Pl.happy || 0) ? 'happy' : 'smile';
  for (const k in BRS) {
    const b = BRS[k];
    if (b.ang !== b.target) {
      b.ang = Math.max(b.target, b.ang - dt * 0.55);
      if (b.ang === b.target && b.turning) {
        b.turning = false;
        PROG.F[BRIDGES[k].flag] = 1;
        stateChanged();
        buzz(25);
        Sound.sfx('thunk');
        note(BRIDGES[k].done);
        narrate([NARR.bridge[k]], 'br:' + k, { delay: 0.9 });
      }
    }
  }
  if (Zt !== null) {
    Z = lerp(Z, Zt, Math.min(1, dt * 2.6));
    if (Math.abs(Z - Zt) < 0.004) {
      Z = Zt;
      Zt = null;
    }
    zoomT = now;
  }
  for (const id of ORDER) FOCUS[id] = clamp(FOCUS[id] + (id === cur ? 1 : -1) * dt * 3, 0, 1);
  Sound.tick(Pl.moving);
  {
    const zk = ZKhold && T < ZKhold.until ? ZKhold.v : talking && !mapMode && !inTitle ? 1.12 : 1;
    if (ZKhold && T >= ZKhold.until) ZKhold = null;
    ZK = STILL ? zk : lerp(ZK, zk, Math.min(1, dt * (zk < ZK ? 2.2 : 3)));
    if (Math.abs(ZK - zk) < 0.002) ZK = zk;
  }
  return dt;
}
function frameDraw2D(dt, now) {
  const c = CELLS[cur];
  darkWork(++perf.frames % 6 === 0);
  if (!inTitle && !crossing && Zt === null) {
    perf.n++;
    perf.t += dt;
    if (perf.t > 1.5) {
      const fps = perf.n / perf.t;
      perf.n = 0;
      perf.t = 0;
      if (fps < 38 && dprCap > 1) {
        dprCap = fps < 27 ? 1 : Math.max(1, dprCap - 0.25);
        try {
          localStorage.setItem('colmena-dpr', dprCap);
        } catch (e) {}
        layout();
      }
    }
  } else {
    perf.n = 0;
    perf.t = 0;
  }
  if (Z !== BAKED[cur].z && !pinch && !gest && now - zoomT > 200 && (Z > BAKED[cur].z * 1.03 || Z < BAKED[cur].z * 0.8)) {
    for (const k in BAKED) if (k !== cur) delete BAKED[k];
    bakeCell(cur);
    bakeBackdrop();
  } else if (BGinfo && (Math.hypot(camX - BGinfo.cx, camY - BGinfo.cy) * 0.35 > cv.width * 0.1 || Z / BGinfo.z < 0.8)) bakeBackdrop();
  else prebake(now);
  const s = S * Z * ZK * DPR,
    W = cv.width,
    Hh = cv.height,
    tgt = camTarget();
  if (!gest && (Pl.moving || talking || crossing || Zt !== null) && (PAN.x || PAN.y) && performance.now() - panHold > 350) {
    const k = Math.exp(-dt * (crossing || Zt !== null ? 6 : 2.4));
    PAN.x *= k;
    PAN.y *= k;
    if (Math.hypot(PAN.x, PAN.y) < 1) {
      PAN.x = PAN.y = 0;
    }
  }
  if (!camReady) {
    camX = tgt[0];
    camY = tgt[1];
    camReady = true;
  } else if (gest) {
    camX = tgt[0];
    camY = tgt[1];
  } else {
    camX = lerp(camX, tgt[0], 0.12);
    camY = lerp(camY, tgt[1], 0.12);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, Hh);
  {
    const k = Z / BGinfo.z,
      tx = ((camX - BGinfo.cx) * 0.35) / DPR,
      ty = ((camY - BGinfo.cy) * 0.35) / DPR,
      tr = `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${k.toFixed(4)})`;
    if (tr !== lastBgT) {
      bgC.style.transform = tr;
      lastBgT = tr;
    }
  }
  /* los cuartos desenfocados detrás; el cuarto enfocado siempre al frente */
  worldWork(S * Z * DPR, now);
  qBack(s, W, Hh);
  placeWorld(s);
  drawPaths(s, W, Hh);
  for (const id of [...DRAW.filter((i) => i !== cur), cur]) {
    const ox = camX + CW[id][0] * s,
      oy = oyOf(id, s);
    if (ox + 420 * s < 0 || ox - 420 * s > W || oy + 372 * s < 0 || oy - 395 * s > Hh) continue;
    if (window.CHIDE && CHIDE(id)) continue;
    const f = FOCUS[id],
      locked = PUZ.cellLocked(id);
    if (f < 1) {
      const d = inWorld(id) ? null : DARK[id],
        pn = STYLE.Pen(ctx, ox, oy, s, 'g' + id, true);
      if (inWorld(id)) {
      } else if (d) {
        let im = d.c;
        if (s < d.sb * 0.6) {
          if (!d.half) {
            d.half = newCanvas(d.c.width / 2, d.c.height / 2);
            const hg = d.half.getContext('2d');
            hg.imageSmoothingQuality = 'high';
            hg.drawImage(d.c, 0, 0, d.half.width, d.half.height);
          }
          im = d.half;
        }
        ctx.drawImage(im, ox + d.x0 * s, oy + d.y0 * s, d.w * s, d.h * s);
      } else STYLE.ghost(pn, id, 1, false, locked);
      if (mapMode || locked) STYLE.ghostIcon(pn, id, 1 - f, mapMode, locked);
      const w = PUZ.want(id),
        nn = CELLS[id].npc;
      if (w && !locked && f < 0.5) STYLE.want(pn, nn.x, nn.y, (nn.lz ?? 80) + 14, w, false, T);
    }
    if (f > 0 && BAKED[id]) {
      if (id === cur && !COARSE) {
        const gy = camY + CW[id][1] * K * s + 16 * s;
        ctx.save();
        ctx.globalAlpha = 0.42 * f;
        ctx.drawImage(spotSprite(), ox - 390 * s, gy - 390 * s * K, 780 * s, 780 * s * K);
        ctx.restore();
      }
      drawCell(id, ox, oy, s, f);
    }
  }
  if (window.AFTERCELLS) AFTERCELLS(s, W, Hh);
  if (!inTitle && !crossing) drawShade(s, dt);
  else DARKA = null;
  /* la onda de luz al encender un sello y la mariposa que viaja entre celdas */
  if (WAVE) {
    const u = (T - WAVE.t0) / 1.8;
    if (u >= 1) WAVE = null;
    else if (u > 0) {
      const ox = camX + CW[WAVE.id][0] * s,
        oy = oyOf(WAVE.id, s),
        r = u * Math.max(W, Hh) * 1.15;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(255,214,140,${0.55 * (1 - u)})`;
      ctx.lineWidth = 46 * DPR * (1 - u) + 2;
      ctx.beginPath();
      ctx.ellipse(ox, oy, r, r * K, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }
  if (!STILL && !inTitle) {
    const wx = CL.cx + Math.sin(T * 0.043) * (CL.x1 - CL.x0) * 0.34,
      wyS = CL.cy + Math.sin(T * 0.071 + 1.3) * (CL.y1 - CL.y0) * 0.3;
    STYLE.critter(STYLE.Pen(ctx, camX, camY, s, 'mari', true), wx, wyS / K, 70 + Math.sin(T * 1.3) * 16, T);
  }
  /* clima de la celda actual, solo sobre ella */
  if (STYLE.overlay && !STILL) {
    const ox = camX + CW[cur][0] * s,
      oy = oyOf(cur, s);
    ctx.save();
    ctx.beginPath();
    ctx.rect(ox - 360 * s, oy - 335 * s, 720 * s, 640 * s);
    ctx.clip();
    STYLE.overlay(ctx, T, W, Hh, c);
    ctx.restore();
  }
  qFrame(s);
  if (window.POSTDRAW) window.POSTDRAW(ctx, s);
}
/* dónde va el botón de hablar (en píxeles de pantalla) */
function talkAt(ax, ay, az) {
  if (window.R3D && R3D.on) return R3D.screenOf(cur, ax, ay, az);
  const s = S * Z * ZK * DPR;
  return [(camX + (CW[cur][0] + ax) * s) / DPR, (oyOf(cur, s) + (ay * K - az) * s) / DPR];
}
function frameTail(dt, now) {
  const c = CELLS[cur];
  /* ¿hay alguien cerca? */
  const n = c.npc;
  nearObj = null;
  {
    let bd = Math.hypot(n.x - Pl.x, (n.y - Pl.y) * 1.2);
    if (bd < 105) nearObj = { kind: 'npc' };
    for (const t of thingsHere()) {
      const d = Math.hypot(t.x - Pl.x, (t.y - Pl.y) * 1.2);
      if (d < t.r && (!nearObj || d < bd)) {
        bd = d;
        nearObj = { kind: 'thing', t };
      }
    }
  }
  near = !crossing && !!nearObj;
  if (talking && !(DLG && DLG.forced) && !(nearObj && nearObj.kind === 'npc')) closeTalk();
  if (near && !talking) {
    const th = nearObj.kind === 'thing' ? nearObj.t : null,
      ax = th ? th.x : n.x,
      ay = th ? th.y : n.y,
      az = th ? th.z + 46 : (n.lz ?? 80);
    const [x, y] = talkAt(ax, ay, az);
    STYLE.setTalk(talkBtn, th ? STYLE.actLabel(th.label()) : STYLE.talkLabel(n));
    talkBtn.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)`;
    talkBtn.hidden = false;
  } else talkBtn.hidden = true;
  narrTick(dt);
  idleTick(dt);
  beatTick();
  npcTick(dt);
  if (talking && STYLE.typewriter) {
    const L = _t(DLG.lines[lineIx]);
    if (typeT < L.length) {
      typeT += dt * 48;
      dl.textContent = L.slice(0, Math.floor(typeT)) + (Math.floor(T * 6) % 2 ? '▌' : ' ');
    } else if (dl.textContent !== L) dl.textContent = L;
  }
}
addEventListener('resize', () => {
  clearTimeout(rz);
  rz = setTimeout(layout, 160);
});
/* ══════════ EL NARRADOR · Amaranta leyendo su cuaderno ══════════
   Nunca da órdenes: recuerda cómo es la gente y cómo funcionan las cosas.
   Habla al entrar por primera vez a un cuarto, al girar un puente, al encender un sello
   y, si llevas un rato sin avanzar, deja caer una pista (una sola vez por situación). */
const NARR = {
  pro: [
    'La colmena late una vez por cada día del mundo. Esta noche la he detenido.',
    'Perdóname por dejarte esto a ti. Enciende los sellos. Te espero en el corazón.',
  ],
  enter: {
    pri: 'Brote regaba siempre antes del alba. Decía que las plantas escuchan mejor cuando nadie habla.',
    ver: 'Solano presume de no tener prisa. En realidad espera algo que nunca se atrevió a pedir.',
    oto: 'Ocre imprime todo lo que pasa en la colmena. Casi todo.',
    inv: 'Escarcha teje una vuelta por cada día que falto. No quiero saber cuánto mide ya.',
    esp: 'Orión cree que las estrellas se pierden. No se pierden: se cansan.',
    des: 'Duna me hizo cada frasco que tuve. Dice que el vidrio recuerda el calor que lo formó.',
    oce: 'Coral no se ha quitado la escafandra desde que me fui.',
    ant: 'Témpano me escribe cada noche. Nunca supe qué contestarle.',
  },
  bridge: {
    'inv-oto': 'Los puentes de la colmena se acuerdan de hacia dónde miraban.',
    'ant-inv': 'Hasta el hielo sabe girar, si se le da tiempo.',
  },
  seal: {
    1: [
      'Uno. El panal vuelve a latir. Débil, pero late.',
      'Yo tenía veinte años cuando encontré esta colmena detenida, con un viejo apicultor dormido dentro.',
      'No era la primera vez que el panal se paraba. Yo tampoco fui la primera en despertarlo.',
    ],
    2: [
      'Dos. Desde aquí ya se oye el mundo girar.',
      'Llené frascos con arena, hielo y luz que me mandaban desde los confines. Nunca fui a verlos.',
      'La colmena hace girar el mundo, y yo solo lo conocí por carta.',
    ],
  },
  /* la pista depende de en qué punto de la historia estás, no del cuarto */
  hint() {
    const F = PROG.F,
      h = PROG.hand;
    if (FREE) return null;
    if (bagHas('sol')) return ['sol', 'El cerezo nunca floreció sin un poco de verano prestado.'];
    if (bagHas('hielo')) return ['hielo', 'A Solano siempre se le ganaba con algo frío.'];
    if (bagHas('agua')) return ['agua', 'Ocre nunca rechazó un poco de lluvia.'];
    if (bagHas('aurora')) return ['aurora', 'El fondo del mar se apagó. Solo una luz del sur podría encenderlo.'];
    if (bagHas('perla')) return ['perla', 'Una perla pule el vidrio mejor que cualquier lija.'];
    if (bagHas('lente')) return ['lente', 'Un telescopio sin lente es solo un tubo con buenas intenciones.'];
    if (F.done) {
      if (F.star) {
        if (LATE.some((id) => !(F.met && F.met[id]))) return ['late', NARR.late[0]];
        return null;
      }
      if (F.floe && F.askAurora) return ['aurora2', 'Témpano guarda el cielo en frascos. Le sobra.'];
      if (F.askAurora) return ['floe', 'El témpano del invierno también gira, si se le pide con paciencia.'];
      if (F.askPearl) return ['perla2', 'Para pulir vidrio, Duna siempre usaba algo nacido en el mar.'];
      if (F.askLens) return ['lente2', 'El desierto queda al otro lado del verano. Allí el vidrio se hace con sol.'];
      return ['orion', 'Orión mira el cielo desde lo alto del panal, más allá del verano.'];
    }
    if (F.bridge) return ['hielo2', 'El hielo de Escarcha no se derrite ni en agosto.'];
    if (F.inkFixed) return ['puente', 'Los puentes de Ocre giran si alguien les da cuerda.'];
    if (F.askWater) return ['lluvia', 'La tinta seca no se discute: se moja. Y en Primavera nunca deja de llover.'];
    if (F.askIce) return ['frio', 'El frío vive al fondo del panal, pero el camino pasa por el taller de Ocre.'];
    if (F.askSun) return ['verano', 'El cerezo nunca floreció sin un poco de verano prestado.'];
    return ['brote', 'Brote siempre tuvo algo que pedir. Solo había que acercarse.'];
  },
};
Object.assign(NARR.enter, {
  col: 'Mis colmenas pequeñas. Abril las cuida como si fueran a romperse. A veces lo parecen.',
  bib: 'Tomo sabe dónde está cada libro. Menos uno.',
  coc: 'Miel cocina para quien falta. Es la cocinera más paciente del mundo.',
  rel: 'Aquí todas las horas se pararon a la vez. Fui yo.',
  tea: 'Telón convierte en función todo lo que pasa. Hasta lo que duele.',
  inn: 'En el invernadero de noche aprendí a descansar sin cerrar los ojos.',
  far: 'Albor nunca ha visto el mar. Dice que no le hace falta para ser farero.',
  tre: 'Del andén salió el último tren. Yo iba dentro.',
  sot: 'Debajo de todo, la cera vieja. Ahí se queda lo que no se dijo.',
  cue: 'Geoda escucha a las piedras. Tienen poco que decir, pero lo dicen muy bien.',
  vol: 'Ceniza forjó lo único que me dio miedo pedir.',
  cum: 'Desde aquí arriba se ve todo el panal. También lo que no quería ver.',
  dsv: 'Todo lo guardado espera algo. Una caja, sobre todo.',
  est: 'Pluma escribió cada carta que dicté. Ninguna llevaba firma.',
  ret: 'Marco me debe un retrato. O yo le debo una tarde quieta.',
  jar: 'Un árbol por cada persona que cuidó la colmena. Me faltó plantar uno.',
  cor: 'Aquí estoy. Todavía no. Pero casi.',
});
NARR.seal[2] = [
  'Dos. Desde aquí ya se oye el mundo girar.',
  'Llené frascos con arena, hielo y luz que me mandaban desde los confines. Nunca fui a verlos.',
  'Detrás de cada pared hay alguien que me conoció. Pregúntales. Yo ya no me acuerdo de todo.',
];
NARR.late = ['Las celdas nuevas no piden nada todavía. Solo que alguien las escuche.'];
const narrEl = document.getElementById('narr'),
  narrTx = document.getElementById('narrt'),
  narrQ = [];
let narrCur = null,
  narrGap = 0,
  idleAcc = 0,
  ttsOn = false,
  speaking = false;
try {
  ttsOn = localStorage.getItem('colmena-tts') === '1';
} catch (e) {}
const said = (k) => !!(PROG.F.nl && PROG.F.nl[k]);
function narrate(lines, key, o = {}) {
  if (!lines || !lines.length) return;
  if (key) {
    if (said(key)) return;
    PROG.F.nl = PROG.F.nl || {};
    PROG.F.nl[key] = 1;
    save();
  }
  lines.forEach((l, i) => narrQ.push({ text: l, delay: i ? 0.35 : o.delay || 0 }));
  if (o.then) narrQ.push({ fn: o.then, delay: 0.2 });
}
function narrClear() {
  narrQ.length = 0;
  narrCur = null;
  narrEl.classList.remove('on');
  try {
    speechSynthesis.cancel();
  } catch (e) {}
  speaking = false;
}
/* no habla encima de un diálogo, una tarjeta de capítulo, el título o un menú */
function narrBusy() {
  return (
    inTitle ||
    !dlg.hidden ||
    !document.getElementById('book').hidden ||
    document.body.classList.contains('carding') ||
    !document.getElementById('creator').hidden ||
    !document.getElementById('settings').hidden
  );
}
function speak(t) {
  if (!ttsOn) return;
  try {
    const S = window.speechSynthesis;
    if (!S) return;
    S.cancel();
    const u = new SpeechSynthesisUtterance(t);
    const lc = { es: 'es-ES', en: 'en-US', ru: 'ru-RU', zh: 'zh-CN' }[LANG] || 'es-ES',
      pre = lc.slice(0, 2);
    u.lang = lc;
    const v =
      S.getVoices().find(
        (v) =>
          v.lang.toLowerCase().startsWith(pre) &&
          /female|mujer|mónica|monica|paulina|helena|elvira|lucia|samantha|milena|ting|mei/i.test(v.name),
      ) || S.getVoices().find((v) => v.lang.toLowerCase().startsWith(pre));
    if (v) u.voice = v;
    u.rate = 0.92;
    u.pitch = 1.02;
    speaking = true;
    u.onend = u.onerror = () => {
      speaking = false;
    };
    S.speak(u);
  } catch (e) {
    speaking = false;
  }
}
function narrTick(dt) {
  if (narrCur) {
    narrCur.left -= dt;
    narrCur.max -= dt;
    if ((narrCur.left <= 0 && !speaking) || narrCur.max <= 0 || (narrBusy() && narrCur.left < narrCur.full - 1.2)) {
      narrEl.classList.remove('on');
      narrCur = null;
      narrGap = 0.7;
    }
    return;
  }
  if (narrGap > 0) {
    narrGap -= dt;
    return;
  }
  if (!narrQ.length || narrBusy()) return;
  const it = narrQ[0];
  if (it.delay > 0) {
    it.delay -= dt;
    return;
  }
  narrQ.shift();
  if (it.fn) {
    it.fn();
    return;
  }
  narrTx.textContent = _t(it.text);
  narrEl.hidden = false;
  void narrEl.offsetWidth;
  narrEl.classList.add('on');
  const full = (3 + it.text.length * 0.058) * (window.LENTO ? 1.7 : 1); /* LENTO: ajuste «Textos más lentos» (ui2.js) */
  narrCur = { left: full, full, max: full + 14 };
  Sound.sfx('page');
  speak(_t(it.text));
}
/* si llevas un rato sin avanzar, una pista velada */
function idleTick(dt) {
  if (inTitle || talking || crossing || narrCur || narrQ.length || !dlg.hidden) {
    return;
  }
  idleAcc += dt;
  if (idleAcc > 45) {
    idleAcc = 0;
    const h = NARR.hint();
    if (h) narrate([h[1]], 'h:' + h[0]);
  }
}
/* ══════════ CAPA DE PRODUCTO ══════════ */
let inTitle = true;
const $ = (id) => document.getElementById(id);
const titleEl = $('title'),
  bcont = $('bcont'),
  bnew = $('bnew'),
  tseals = $('tseals'),
  setEl = $('settings'),
  volEl = $('vol'),
  calmEl = $('calm'),
  handEl = $('hand'),
  handC = $('handc'),
  handN = $('handn'),
  cardEl = $('card'),
  cardK = $('cardk'),
  cardT = $('cardt'),
  mhead = $('mhead');
const CHAP = {
  1: ['Capítulo 1', 'El primer sello'],
  2: ['Capítulo 2', 'Más allá de la colmena'],
  3: ['Capítulo 3', 'Las celdas dormidas'],
  fin: ['Capítulo 3', 'Las celdas dormidas'],
  free: ['Recorrido libre', 'Las treinta celdas'],
};
function showChapter(c) {
  const [k, t] = CHAP[c];
  Sound.sfx('card');
  document.body.classList.add('carding');
  clearTimeout(showChapter.u);
  showChapter.u = setTimeout(() => document.body.classList.remove('carding'), 3900);
  cardK.textContent = _t(k);
  cardT.textContent = _t(t);
  cardEl.hidden = false;
  cardEl.classList.remove('show');
  void cardEl.offsetWidth;
  cardEl.classList.add('show');
  clearTimeout(showChapter.t);
  showChapter.t = setTimeout(() => {
    cardEl.hidden = true;
  }, 3900);
  updHead();
}
function updHead() {
  const c = PUZ.chapter(),
    n = PUZ.seals();
  mhead.textContent = FREE ? `${_t(CHAP.free[0])} · ${_t(CHAP.free[1])}` : `${_t(CHAP[c][0])} · ${_t(CHAP[c][1])} — ${_t('Sellos')} ${n}/6`;
  tseals.textContent = n;
}
/* lo que llevas en la mano, dibujado con el mismo estilo del juego */
let lastHand = 'x';
function updHand() {
  const h = PROG.hand || '';
  if (h === lastHand) return;
  lastHand = h;
  if (!h) {
    handEl.hidden = true;
    return;
  }
  handEl.hidden = false;
  handN.textContent = _t(ITEM_NAME[h]);
  const w = Math.round(46 * DPR);
  handC.width = handC.height = w;
  const g = handC.getContext('2d');
  g.clearRect(0, 0, w, w);
  STYLE.token(STYLE.Pen(g, w / 2, w * 0.64, DPR * 1.5, 'mano', true), 0, 0, 0, h, 1, true);
  updHead();
}
/* pantalla completa */
function toggleFS() {
  const no = () => note('La pantalla completa no está disponible aquí.');
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(no);
    else no();
  } catch (e) {
    no();
  }
}
/* mando: stick o cruceta para caminar, A interactuar, B cerrar, Y mapa, Start menú */
let padPrev = [];
addEventListener('gamepadconnected', () => {
  if (!padOff) note('Mando conectado');
});
let padOff = false;
function pad() {
  if (padOff) return null;
  let list = [];
  try {
    list = navigator.getGamepads ? [...navigator.getGamepads()] : [];
  } catch (e) {
    padOff = true;
    return null;
  }
  const gp = list.find((g) => g);
  if (!gp) return null;
  const b = (i) => gp.buttons[i] && gp.buttons[i].pressed,
    edge = (i) => b(i) && !padPrev[i];
  let x = Math.abs(gp.axes[0] || 0) > 0.3 ? gp.axes[0] : 0,
    y = Math.abs(gp.axes[1] || 0) > 0.3 ? gp.axes[1] : 0;
  if (b(14)) x = -1;
  if (b(15)) x = 1;
  if (b(12)) y = -1;
  if (b(13)) y = 1;
  if (edge(0)) {
    if (inTitle) startGame(!hasSave());
    else interact();
  }
  if (edge(1)) {
    if (talking) closeTalk();
    else setMenu(false);
    setEl.hidden = true;
  }
  if (edge(9) && !inTitle) setMenu(panel.hidden);
  if (edge(3) && !inTitle) toggleMap();
  padPrev = gp.buttons.map((q) => q.pressed);
  return [x, y];
}
/* partida nueva, continuar y volver al título */
function hasSave() {
  try {
    const a = localStorage.getItem(SAVEK),
      b = localStorage.getItem(SAVEB);
    return !!(a && saveOk(a)) || !!(b && saveOk(b));
  } catch (e) {
    return false;
  }
}
function resetGame(silent) {
  FREE = false;
  narrClear();
  PROG.F = {};
  PROG.bag = [];
  try {
    localStorage.removeItem(SAVEK);
    localStorage.removeItem(SAVEB);
  } catch (e) {}
  crossing = null;
  Pl.route = null;
  Pl.goal = null;
  closeTalk();
  cur = 'pri';
  Pl.x = 70;
  Pl.y = 170;
  Pl.f = -1;
  FLY.length = 0;
  PUFF.length = 0;
  WAVE = null;
  seenMark('pri');
  for (const k in DARK) delete DARK[k];
  for (const k in BRS) {
    BRS[k].ang = BRS[k].target = 1.05;
    BRS[k].turning = false;
  }
  for (const id of ORDER) FOCUS[id] = id === cur ? 1 : 0;
  for (const k in GRIDS) delete GRIDS[k];
  for (const k in BAKED) delete BAKED[k];
  for (const k in visKey) delete visKey[k];
  refreshVisuals();
  bakeCell(cur);
  STYLE.tag(CELLS[cur]);
  bakeBackdrop();
  camReady = false;
  updGoal();
  updHead();
  setMenu(false);
  if (!silent) note('Partida reiniciada');
}
function openTitle() {
  narrClear();
  endFree();
  inTitle = true;
  document.body.classList.add('intitle');
  titleEl.hidden = false;
  setMenu(false);
  setEl.hidden = true;
  closeTalk();
  bcont.hidden = !hasSave();
  updHead();
  zoomTo(1, true);
  setTimeout(() => (bcont.hidden ? bnew : bcont).focus(), 50);
}
function startGame(fresh) {
  if (fresh) resetGame(true);
  seenMark(cur);
  inTitle = false;
  document.body.classList.remove('intitle');
  titleEl.hidden = true;
  zoomTo(ZF, true);
  mapBtn.textContent = _t('⤢ Ver el mapa');
  idleAcc = 0;
  if (fresh) {
    narrate(NARR.pro, 'pro', { delay: 1.2, then: () => showChapter(1) });
    narrate([NARR.enter.pri], 'enter:pri', { delay: 0.6 });
  } else if (!window.RECAP) setTimeout(() => note(PUZ.goal()), 1000);
}
let armT = 0;
bnew.addEventListener('click', () => {
  if (hasSave() && PROG.F.askSun && performance.now() - armT > 3000) {
    armT = performance.now();
    bnew.textContent = _t('¿Seguro? Se borrará la partida');
    setTimeout(() => {
      bnew.textContent = _t('Nueva partida');
    }, 3000);
    return;
  }
  bnew.textContent = _t('Nueva partida');
  openCreator(true);
});
bcont.addEventListener('click', () => startGame(false));
/* recorrido libre: para ver las 25 celdas sin jugar la historia. No toca la partida guardada. */
function startFree() {
  FREE = true;
  narrClear();
  PROG.F = JSON.parse(JSON.stringify(FREE_F));
  PROG.F.seen = {};
  for (const id of ORDER) PROG.F.seen[id] = 1;
  PROG.bag = [];
  crossing = null;
  Pl.route = null;
  Pl.goal = null;
  closeTalk();
  cur = 'pri';
  Pl.x = 70;
  Pl.y = 170;
  Pl.f = -1;
  FLY.length = 0;
  PUFF.length = 0;
  WAVE = null;
  for (const k in DARK) delete DARK[k];
  for (const k in BRS) {
    BRS[k].ang = BRS[k].target = 0;
    BRS[k].turning = false;
  }
  for (const id of ORDER) FOCUS[id] = id === cur ? 1 : 0;
  for (const k in GRIDS) delete GRIDS[k];
  for (const k in BAKED) delete BAKED[k];
  for (const k in visKey) delete visKey[k];
  refreshVisuals();
  bakeCell(cur);
  STYLE.tag(CELLS[cur]);
  bakeBackdrop();
  camReady = false;
  updGoal();
  updHead();
  inTitle = false;
  document.body.classList.remove('intitle');
  titleEl.hidden = true;
  zoomTo(ZF, true);
  mapBtn.textContent = _t('⤢ Ver el mapa');
  idleAcc = 0;
  setTimeout(() => showChapter('free'), 400);
}
function endFree() {
  if (!FREE) return;
  FREE = false;
  PROG.F = {};
  PROG.bag = [];
  cur = 'pri';
  Pl.x = 70;
  Pl.y = 170;
  load();
  for (const k in BRS) {
    const B = BRIDGES[k];
    BRS[k].ang = BRS[k].target = B && PROG.F[B.flag] ? 0 : 1.05;
  }
  for (const k in DARK) delete DARK[k];
  for (const k in BAKED) delete BAKED[k];
  for (const k in visKey) delete visKey[k];
  for (const id of ORDER) FOCUS[id] = id === cur ? 1 : 0;
  refreshVisuals();
  bakeCell(cur);
  STYLE.tag(CELLS[cur]);
  bakeBackdrop();
  camReady = false;
  updGoal();
  updHead();
}
$('bfree').addEventListener('click', startFree);
function openSettings() {
  setMenu(false);
  setEl.hidden = false;
  volEl.value = Math.round(Sound.vol * 100);
  calmEl.checked = STILL;
  volEl.focus();
}
$('bset').addEventListener('click', openSettings);
$('bset2').addEventListener('click', openSettings);
$('sclose').addEventListener('click', () => {
  setEl.hidden = true;
});
volEl.addEventListener('input', () => Sound.setVolume(volEl.value / 100));
const ttsEl = document.getElementById('tts');
ttsEl.checked = ttsOn;
ttsEl.addEventListener('change', () => {
  ttsOn = ttsEl.checked;
  try {
    localStorage.setItem('colmena-tts', ttsOn ? '1' : '0');
  } catch (e) {}
  if (ttsOn) speak('Así sonará mi voz.');
  else
    try {
      speechSynthesis.cancel();
    } catch (e) {}
});
document.addEventListener(
  'click',
  (e) => {
    if (e.target.closest && e.target.closest('button')) Sound.sfx('ui');
  },
  true,
);
calmEl.addEventListener('change', () => {
  STILL = calmEl.checked;
  try {
    localStorage.setItem('colmena-calma', STILL ? '1' : '0');
  } catch (e) {}
});
$('bfs').addEventListener('click', toggleFS);
$('bfs2').addEventListener('click', () => {
  setMenu(false);
  toggleFS();
});
$('btitle').addEventListener('click', () => {
  save();
  openTitle();
});
rstBtn.addEventListener('click', () => {
  resetGame(false);
  setTimeout(() => showChapter(1), 300);
});
/* creación del personaje: al empezar partida y desde el menú */
const CREATOR = {
  skin: ['#F3D2B8', '#E7B994', '#D9A07E', '#B97A55', '#8D5A3B', '#5E3A26'],
  hairStyle: [
    ['corto', 'Corto'],
    ['largo', 'Largo'],
    ['rizado', 'Rizado'],
    ['recogido', 'Moño'],
    ['flequillo', 'Flequillo'],
    ['rapado', 'Rapado'],
  ],
  hair: ['#2A1E18', '#5A3A22', '#9A5A2A', '#D9A441', '#E6DED0', '#B8484A'],
  top: ['#F2EADB', '#E9C46A', '#9CC5A1', '#E8A08A', '#B7A6D6', '#6E8FB8'],
  cape: ['#2F5E9E', '#B8484A', '#3F7F5F', '#8A5AA8', '#D98A2B', '#3A3A48'],
  capePattern: [
    ['liso', 'Lisa'],
    ['rayas', 'Rayas'],
    ['lunares', 'Lunares'],
    ['panal', 'Panal'],
  ],
  accessory: [
    ['ninguno', 'Nada'],
    ['bufanda', 'Bufanda'],
    ['sombrero', 'Sombrero'],
    ['velo', 'Velo de apicultor'],
    ['gorro', 'Gorro'],
  ],
};
const CR_ROWS = [
  ['Piel', 'skin'],
  ['Peinado', 'hairStyle'],
  ['Color de pelo', 'hair'],
  ['Túnica', 'top'],
  ['Capa', 'cape'],
  ['Diseño de la capa', 'capePattern'],
  ['Accesorio', 'accessory'],
];
const crEl = $('creator'),
  crRows = $('crrows'),
  crPrev = $('crprev');
let crOpen = false,
  crNew = false;
function buildCreator() {
  crRows.innerHTML = '';
  for (const [label, key] of CR_ROWS) {
    const r = document.createElement('div');
    r.className = 'crrow';
    const l = document.createElement('span');
    l.className = 'crl';
    l.textContent = _t(label);
    r.appendChild(l);
    const box = document.createElement('div');
    box.className = 'cropts';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', label);
    for (const o of CREATOR[key]) {
      const b = document.createElement('button'),
        val = Array.isArray(o) ? o[0] : o;
      if (Array.isArray(o)) b.textContent = _t(o[1]);
      else {
        b.className = 'sw';
        b.style.background = o;
        b.setAttribute('aria-label', label + ' ' + (CREATOR[key].indexOf(o) + 1));
      }
      b.setAttribute('aria-pressed', AVATAR[key] === val);
      b.addEventListener('click', () => {
        AVATAR[key] = val;
        for (const q of box.children) q.setAttribute('aria-pressed', q === b);
      });
      box.appendChild(b);
    }
    r.appendChild(box);
    crRows.appendChild(r);
  }
}
function openCreator(fromNew) {
  crNew = fromNew;
  crOpen = true;
  buildCreator();
  crEl.hidden = false;
  titleEl.hidden = true;
  setMenu(false);
  $('crok').textContent = _t(fromNew ? 'Empezar la aventura' : 'Listo');
  $('crback').hidden = !fromNew;
  requestAnimationFrame(crLoop);
  const pp = crEl.querySelector('.p');
  if (pp) pp.scrollTop = 0;
  if (!COARSE) setTimeout(() => $('crok').focus({ preventScroll: true }), 60);
}
function closeCreator() {
  crOpen = false;
  crEl.hidden = true;
  try {
    localStorage.setItem('colmena-avatar', JSON.stringify(AVATAR));
  } catch (e) {}
}
function crLoop() {
  if (!crOpen) return;
  const w = Math.round(crPrev.clientWidth * DPR),
    h = Math.round(crPrev.clientHeight * DPR);
  if (crPrev.width !== w || crPrev.height !== h) {
    crPrev.width = w;
    crPrev.height = h;
  }
  const g = crPrev.getContext('2d');
  g.clearRect(0, 0, w, h);
  const tt = performance.now() / 1000;
  STYLE.player(
    STYLE.Pen(g, w / 2, h * 0.88, h / 150, 'crea', true, true),
    0,
    0,
    0,
    Math.sin(tt * 0.5) > 0 ? 1 : -1,
    tt,
    Math.sin(tt * 0.8) > 0.2,
  );
  requestAnimationFrame(crLoop);
}
$('crrand').addEventListener('click', () => {
  for (const [, k] of CR_ROWS) {
    const L = CREATOR[k],
      o = L[Math.floor(Math.random() * L.length)];
    AVATAR[k] = Array.isArray(o) ? o[0] : o;
  }
  buildCreator();
});
$('crok').addEventListener('click', () => {
  closeCreator();
  if (crNew) startGame(true);
  else if (inTitle) titleEl.hidden = false;
});
$('crback').addEventListener('click', () => {
  closeCreator();
  titleEl.hidden = false;
});
$('bchar').addEventListener('click', () => openCreator(false));
/* cursor de mano sobre lo que se puede tocar */
function hoverable(sx, sy) {
  const s = S * Z * ZK * DPR,
    c = CELLS[cur],
    ox = camX + CW[cur][0] * s,
    oy = oyOf(cur, s);
  for (const t of thingsHere()) {
    const q = [ox + t.x * s, oy + (t.y * K - t.z - 8) * s];
    if (Math.hypot(sx - q[0], sy - q[1]) < 44 * s) return true;
  }
  const n = c.npc,
    ns = [ox + n.x * s, oy + (n.y * K - 30) * s];
  if (Math.hypot((sx - ns[0]) / (50 * s), (sy - ns[1]) / (45 * s)) < 1) return true;
  for (const d of c.doors) {
    const m = d.back ? [d.mid[0], d.mid[1] * K - 40] : [d.mid[0] - d.n[0] * 60, (d.mid[1] - d.n[1] * 60) * K];
    if (Math.abs(sx - (ox + m[0] * s)) < 42 * s && Math.abs(sy - (oy + m[1] * s)) < 48 * s) return true;
  }
  const wx = (sx - camX) / s,
    wy = (sy - camY) / s / K;
  for (const id of ORDER) if (id !== cur && inHex(wx - CW[id][0], wy - CW[id][1], R + TH)) return true;
  return false;
}
cv.style.cursor = 'default';
cv.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || e.buttons || inTitle) return;
  const [sx, sy] = dev(e);
  const h = hoverable(sx, sy);
  if (cv.style.cursor !== (h ? 'pointer' : 'default')) cv.style.cursor = h ? 'pointer' : 'default';
});
/* ══════════ IDIOMA · aplicar a la interfaz ══════════ */
const DOMT = new WeakMap(),
  DOM_SKIP = new Set([
    'note',
    'narrt',
    'dl',
    'dn',
    'dm',
    'tn',
    'ts',
    'cardk',
    'cardt',
    'mhead',
    'mjour',
    'handn',
    'talkt',
    'tseals',
    'crrows',
    'bpages',
    'bglyph',
    'goal',
    'bagslots',
    'bnb',
    'bgal',
    'bgalk',
    'bach',
    'bachk',
    'bclue',
    'bcluek',
    'plogx',
    'mgt',
    'mgd',
    'mgs',
    'mgb',
    'travelt',
    'achn',
    'endk',
    'endt',
    'endx',
    'dch',
  ]);
function i18nDom() {
  const walk = (el) => {
    for (const ch of el.childNodes) {
      if (ch.nodeType === 3) {
        const raw = ch.nodeValue;
        if (!raw.trim()) continue;
        if (!DOMT.has(ch)) DOMT.set(ch, raw);
        const o = DOMT.get(ch),
          k = o.trim();
        ch.nodeValue = o.replace(k, _t(k));
      } else if (
        ch.nodeType === 1 &&
        !DOM_SKIP.has(ch.id) &&
        !(ch.classList && ch.classList.contains('langs')) &&
        !['SCRIPT', 'CANVAS', 'H1', 'STYLE', 'OPTION'].includes(ch.tagName)
      )
        walk(ch);
    }
  };
  walk(document.body);
  for (const el of document.querySelectorAll('[aria-label],[title]'))
    for (const at of ['aria-label', 'title']) {
      if (!el.hasAttribute(at)) continue;
      const key = 'i18n' + at.replace('-', '');
      if (!el.dataset[key]) el.dataset[key] = el.getAttribute(at);
      el.setAttribute(at, _t(el.dataset[key]));
    }
}
function setLang(l) {
  LANG = l;
  try {
    localStorage.setItem('colmena-lang', l);
  } catch (e) {}
  TCACHE.clear();
  if (goalEl) goalEl.dataset.k = _t('Objetivo');
  document.documentElement.lang = l === 'zh' ? 'zh-Hans' : l;
  i18nDom();
  for (const b of document.querySelectorAll('.langs button')) b.setAttribute('aria-pressed', b.dataset.l === l);
  const sel = document.getElementById('lang');
  if (sel) sel.value = l;
  STYLE.tag(CELLS[cur]);
  updSnd();
  updHead();
  updJournal();
  lastHand = 'x';
  updHand();
  goalRaw = '';
  updGoal();
  mapBtn.textContent = _t(mapMode ? '⤡ Volver al cuarto' : '⤢ Ver el mapa');
  bnew.textContent = _t('Nueva partida');
  if (talking && DLG) {
    dn.textContent = _t(STYLE.dlgName(CELLS[cur].npc));
    dl.textContent = _t(DLG.lines[lineIx]);
    dm.textContent = _t(STYLE.dlgHint());
  }
}
for (const b of document.querySelectorAll('.langs button')) b.addEventListener('click', () => setLang(b.dataset.l));
document.getElementById('lang').addEventListener('change', (e) => setLang(e.target.value));
/*@@QUESTS@@*/
/* arranque */
load();
refreshVisuals();
for (const id of ORDER) FOCUS[id] = id === cur ? 1 : 0;
for (const k in BRIDGES)
  if (PROG.F[BRIDGES[k].flag]) {
    BRS[k].ang = BRS[k].target = 0;
  }
setInterval(updHand, 200);
STYLE.tag(CELLS[cur]);
layout();
updGoal();
Z = 1;
mapMode = true;
openTitle();
setLang(LANG);
requestAnimationFrame(frame);
