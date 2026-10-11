/* ══════════ TEMPORADAS · el juego se publica en dos partes (docs/historia-temporadas.md) ══════════
   Temporada 1 · «El despertar»: las estaciones, los confines y la casa de Amaranta (12 celdas), hasta el tercer sello.
   Temporada 2 · «La verdad»: los sueños, las raíces, la memoria, la colmena de abajo, el Corazón y los finales.
   Con window.COLMENA_T1 (dist/index.html) solo se juega la primera: las demás celdas quedan cerradas, los encargos
   que dependen de ellas no se piden, y al encender el tercer sello llega el cierre de la temporada.
   Sin esa marca (dist/colmena.html) el juego está entero, como siempre: es la versión de trabajo y la de las pruebas. */
const T1 = !!window.COLMENA_T1;
const T1_CELDAS = ['pri', 'ver', 'oto', 'inv', 'esp', 'oce', 'des', 'ant', 'col', 'bib', 'coc', 'rel'];
/* el cierre de la Temporada 1, en la voz de Amaranta (texto de docs/historia-temporadas.md) */
const T1_CIERRE = {
  rotulo: 'Fin de la Temporada 1',
  titulo: 'El despertar',
  lineas: [
    'Escucha. La casa ha despertado: las abejas han salido y los relojes vuelven a andar.',
    'Doce celdas laten ya. Las encendiste tú, de favor en favor, sin decir una palabra.',
    'Yo dejé de escuchar la colmena. Tú la has escuchado por mí.',
    'Pero yo sigo dormida. Faltan tres sellos, y aquella noche no cabe entera en esta casa.',
    'Bajo las raíces se ha abierto un andén vacío. Hay un tren del que aún no te he hablado.',
    'Todas las noches puse la mesa para dos. Hoy, por fin, ha venido alguien.',
  ],
  continuara: 'Continuará en la Temporada 2 · «La verdad». Quedan tres sellos y una noche por contar.',
  cerrado: 'Esta parte de la colmena llega con la Temporada 2.',
};
if (T1) {
  const mia = (id) => T1_CELDAS.includes(id);
  {
    const l0 = PUZ.cellLocked,
      w0 = PUZ.why,
      o0 = PUZ.open,
      g0 = PUZ.goal;
    PUZ.cellLocked = function (id) {
      return !mia(id) || l0.call(PUZ, id);
    };
    PUZ.open = function (a, b) {
      return mia(a) && mia(b) && o0.call(PUZ, a, b);
    };
    PUZ.why = function (a, b) {
      return !mia(a) || !mia(b) ? T1_CIERRE.cerrado : w0.call(PUZ, a, b);
    };
    PUZ.goal = function () {
      if (sealOn(3)) {
        QGOAL.cell = null;
        return 'Fin de la Temporada 1 · pasea por la colmena a tu aire';
      }
      return g0.call(PUZ);
    };
  }
  /* los favores que piden algo de una celda de la Temporada 2 no se ofrecen todavía */
  /* (también el de Escarcha: su cierre agradece una visita de Solano que depende del billete de Estela) */
  for (const id of ['pri', 'ver', 'oto', 'inv', 'des', 'oce', 'ant']) if (Q[id]) Q[id] = () => null;
  /* el aviso «se ha abierto un andén» lo da el cierre de la temporada, no un cartel suelto */
  abajoTick = function () {};
  /* del rastro de Amaranta, solo el primer encuentro; los otros dos y el frasco son de la Temporada 2 */
  {
    const ri0 = rastroInit;
    rastroInit = function (cr) {
      if (rastroN() >= 1) {
        cr.rz0 = true;
        return;
      }
      return ri0(cr);
    };
  }
  /* la quinta pregunta del tablero («¿quién subió al tren?») da por hecho algo que aún no se sabe: se guarda */
  {
    const i = DEDU.findIndex((q) => q.id === 'quien');
    if (i >= 0) DEDU.splice(i, 1);
  }
  /* tras el tercer sello no llega el capítulo 4: llega el cierre */
  {
    const sc0 = showChapter;
    showChapter = function (c) {
      if (c >= 4) {
        temporadaFin();
        return;
      }
      sc0(c);
    };
  }
  document.getElementById('bfree').hidden = true;
  {
    const t = document.getElementById('tdemo');
    if (t) {
      t.hidden = false;
      t.dataset.es = 'Temporada 1 · El despertar';
      t.textContent = _t('Temporada 1 · El despertar');
      const lg = document.getElementById('lang');
      if (lg) lg.addEventListener('change', () => setTimeout(() => (t.textContent = _t('Temporada 1 · El despertar')), 0));
    }
  }
}
function temporadaFin() {
  const F = QF();
  if (F.t1fin) {
    note('Puedes seguir paseando por las doce celdas.');
    return;
  }
  F.t1fin = 1;
  save();
  PLOG.ev('fin-temporada-1');
  Sound.sfx('seal');
  setTimeout(
    () =>
      showEnding(
        T1_CIERRE.rotulo,
        T1_CIERRE.titulo,
        [...T1_CIERRE.lineas, T1_CIERRE.continuara, '— Colmena · Temporada 1 —'].filter(Boolean),
        () => {
          note('Puedes seguir paseando por las doce celdas.');
          updGoal();
        },
      ),
    600,
  );
}

/* textos de las temporadas en los cuatro idiomas (docs/historia-temporadas.md) */
I18N([
  [
    'Esta parte de la colmena llega con la Temporada 2.',
    'This part of the hive arrives with Season 2.',
    'Эта часть улья откроется во втором сезоне.',
    '蜂巢的这一部分将在第二季开放。',
  ],
  ['Fin de la Temporada 1', 'End of Season 1', 'Конец первого сезона', '第一季 · 完'],
  ['El despertar', 'The Awakening', 'Пробуждение', '苏醒'],
  [
    'Escucha. La casa ha despertado: las abejas han salido y los relojes vuelven a andar.',
    'Listen. The house is awake: the bees are out and the clocks are ticking again.',
    'Слышишь? Дом проснулся: пчёлы вылетели, и часы снова идут.',
    '你听。家醒了：蜜蜂飞出来了，钟表又走起来了。',
  ],
  [
    'Doce celdas laten ya. Las encendiste tú, de favor en favor, sin decir una palabra.',
    'Twelve cells are beating now. You lit them, one favour at a time, without saying a word.',
    'Двенадцать сот уже бьются. Их зажёг ты: услуга за услугой, не сказав ни слова.',
    '十二间巢室已经在跳动。是你点亮了它们，一个忙接着一个忙，一句话也没说。',
  ],
  [
    'Yo dejé de escuchar la colmena. Tú la has escuchado por mí.',
    'I stopped listening to the hive. You have listened for me.',
    'Я перестала слушать улей. Ты слушал его за меня.',
    '我不再倾听蜂巢。是你替我听见了它。',
  ],
  [
    'Pero yo sigo dormida. Faltan tres sellos, y aquella noche no cabe entera en esta casa.',
    'But I am still asleep. Three seals remain, and that night does not fit inside this house.',
    'Но я всё ещё сплю. Осталось три печати, а та ночь не умещается в этом доме.',
    '可我还在沉睡。还差三枚封印，而那一夜，这个家装不下。',
  ],
  [
    'Bajo las raíces se ha abierto un andén vacío. Hay un tren del que aún no te he hablado.',
    'Beneath the roots, an empty platform has opened. There is a train I have not told you about yet.',
    'Под корнями открылась пустая платформа. Есть поезд, о котором я тебе ещё не рассказала.',
    '根下开出了一座空站台。有一班火车，我还没有对你说起。',
  ],
  [
    'Todas las noches puse la mesa para dos. Hoy, por fin, ha venido alguien.',
    'Every night I set the table for two. Today, at last, someone came.',
    'Каждый вечер я накрывала стол на двоих. Сегодня наконец кто-то пришёл.',
    '每晚我都摆两副餐具。今天，终于有人来了。',
  ],
  [
    'Continuará en la Temporada 2 · «La verdad». Quedan tres sellos y una noche por contar.',
    'To be continued in Season 2 · “The Truth”. Three seals remain, and one night still untold.',
    'Продолжение во втором сезоне · «Правда». Остались три печати и одна нерассказанная ночь.',
    '未完待续 · 第二季“真相”。还有三枚封印，和一个尚未讲完的夜晚。',
  ],
  [
    'Doce celdas laten. La casa tiene horas, miel tibia y abejas. Yo sigo dormida.',
    'Twelve cells are beating. The house has its hours, warm honey and bees. I am still asleep.',
    'Двенадцать сот бьются. В доме снова есть часы, тёплый мёд и пчёлы. А я всё ещё сплю.',
    '十二间巢室在跳动。家里有了时间，有温热的蜂蜜，有蜜蜂。我还在沉睡。',
  ],
  [
    'Faltan tres sellos: uno en los sueños, uno en las raíces y uno en la memoria.',
    'Three seals remain: one in the dreams, one in the roots and one in memory.',
    'Осталось три печати: одна во снах, одна в корнях и одна в памяти.',
    '还差三枚封印：一枚在梦里，一枚在根下，一枚在记忆里。',
  ],
  [
    'Dirán que me fui en el último tren. Escúchalos a todos, también cuando se contradigan.',
    'They will say I left on the last train. Listen to them all, even when they contradict each other.',
    'Скажут, что я уехала последним поездом. Выслушай всех, даже когда они противоречат друг другу.',
    '他们会说，我坐末班火车走了。每个人的话都听一听，哪怕彼此对不上。',
  ],
  [
    'Y debajo de todo hay un andén abierto. Baja cuando quieras. Te espero en el corazón.',
    'And beneath it all, a platform stands open. Go down whenever you like. I’ll wait for you in the heart.',
    'А под всем этим открыта платформа. Спускайся, когда захочешь. Я жду тебя в сердце.',
    '而在这一切的下面，有一座站台开着。想下去的时候就下去。我在心脏等你。',
  ],
  ['Temporada 1 · El despertar', 'Season 1 · The Awakening', 'Сезон 1 · Пробуждение', '第一季 · 苏醒'],
  [
    'Fin de la Temporada 1 · pasea por la colmena a tu aire',
    'End of Season 1 · wander the hive at your own pace',
    'Конец первого сезона · гуляй по улью, сколько захочешь',
    '第一季结束 · 随意在蜂巢里走走',
  ],
  [
    'Puedes seguir paseando por las doce celdas.',
    'You can keep wandering the twelve cells.',
    'Можно и дальше гулять по двенадцати сотам.',
    '你可以继续在十二间巢室里漫步。',
  ],
  ['— Colmena · Temporada 1 —', '— Colmena · Season 1 —', '— Colmena · Сезон 1 —', '——蜂巢 · 第一季——'],
  [
    'Me faltan miel y una ramita de menta. Las dos están en el Colmenar.',
    'I’m missing honey and a sprig of mint. You’ll find both in the Apiary.',
    'Мне не хватает мёда и веточки мяты. И то и другое есть на Пасеке.',
    '我还缺蜂蜜和一枝薄荷。两样蜂场里都有。',
  ],
]);
