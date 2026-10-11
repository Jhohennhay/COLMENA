/* ══════════ PRUEBA «ISLAS» · solo con window.COLMENA_ISLAS (dist/prueba.html) ══════════
   Una prueba del rediseño con el capítulo 1; el juego normal no cambia.
   1 · Cada cuarto es una isla: game.js separa las celdas y cada pareja de vecinos se une por un camino (paths.js).
   2 · El traslado es un viaje: unos 7 segundos con la cámara de viaje; el rótulo dice por dónde vas.
   3 · Pantalla limpia: una sola cosa habla cada vez y los sistemas secundarios quedan apagados.
   4 · Otoño tiene su tarea dentro del cuarto (poner en marcha la prensa) y despierta al terminarla. */
if (ISLAS) {
  const IF = () => {
    const F = PROG.F;
    return F.isl || (F.isl = {});
  };
  window.ISLAS_AWAKE = (id) => !!IF()[id];

  /* ── 2 · el viaje: ritmo y rótulo ── */
  Object.assign(PATH_SPEED, { puente: 105, piedras: 100, arena: 110, hielo: 100 });
  {
    const css = document.createElement('style');
    css.textContent =
      'body.isl-viaje .tut,body.isl-voz .tut{visibility:hidden}' +
      'body.isl-viaje #goal{opacity:0;transition:opacity .4s}' +
      'body.islas .ach,body.islas #niebla,body.islas #horaui{display:none!important}' +
      '#tn,#ts{transition:opacity .35s}body.isl-viaje #ts{font-style:italic}';
    document.head.appendChild(css);
    document.body.classList.add('islas');
  }
  let wasCrossing = false;
  if (window.R3DX)
    R3DX.push(() => {
      const cr = crossing,
        B = document.body.classList;
      B.toggle('isl-viaje', !!cr && !inTitle);
      B.toggle('isl-voz', narrEl.classList.contains('on') || talking);
      if (cr && cr.plan && cr.plan.P) {
        /* durante el viaje el rótulo dice el camino y a dónde lleva; el nombre del cuarto llega al llegar */
        const nm = _t(PATH_NAME[cr.plan.P.type] || 'Puente colgante');
        if (tn.textContent !== nm) {
          tn.textContent = nm;
          ts.textContent = _t('Hacia') + ' ' + _t(SEASON[cur].name);
        }
      } else if (wasCrossing) STYLE.tag(CELLS[cur]);
      wasCrossing = !!cr;
    });

  /* el nombre del camino ya está en el rótulo: no hace falta repetirlo en un aviso */
  {
    const n0 = note,
      NAMES = new Set(Object.values(PATH_NAME));
    note = function (m) {
      if (NAMES.has(m) || [...NAMES].some((k) => _t(k) === m)) return;
      return n0(m);
    };
  }

  /* ── 3 · pantalla limpia: el tutorial solo habla de Brote cuando estás con Brote ── */
  {
    const tt0 = tutTick;
    tutTick = function () {
      if ((PROG.F.tut || 0) === 1 && cur !== 'pri') return hideTut();
      return tt0();
    };
  }

  /* ── 4 · Otoño: poner en marcha la prensa, dentro del cuarto ── */
  const STEPS = ['tintero', 'bobina', 'palanca'],
    RT_ = [5, 0],
    cab = wallPt(RT_, 0.88, 0, 30),
    cabA = wallPt(RT_, 0.84, 0, 92),
    post = wallPt(RT_, 0.36, 0, 16),
    postA = wallPt(RT_, 0.36, 0, 70);
  const stepN = () => STEPS.filter((k) => IF()[k]).length,
    going = () => !!IF().go && !IF().oto,
    next = () => STEPS.find((k) => !IF()[k]);
  PUZ.things.oto.push(
    {
      id: 'tintero',
      x: cab[0],
      y: cab[1],
      z: 60,
      r: 80,
      ax: cabA[0],
      ay: cabA[1],
      label: () => 'Llenar el tintero con el agua',
      show: () => going() && !IF().tintero,
    },
    {
      id: 'bobina',
      x: post[0],
      y: post[1],
      z: 60,
      r: 76,
      ax: postA[0],
      ay: postA[1],
      label: () => 'Dar una vuelta a la bobina',
      show: () => going() && !IF().bobina,
    },
    {
      id: 'palanca',
      x: 135,
      y: -45,
      z: 50,
      r: 96,
      ax: 96,
      ay: 26,
      label: () => 'Bajar la palanca de la prensa',
      show: () => going() && !IF().palanca,
    },
  );
  {
    const d0 = PUZ.dialog;
    PUZ.dialog = function (id) {
      if (id === 'oto' && !PROG.F.inkFixed) {
        const F = IF();
        if (going())
          return {
            lines: [
              {
                tintero: 'Primero la tinta: echa el agua en el tintero, sobre el mueble de los tipos.',
                bobina: 'Ahora la bobina, junto al muro. Una vuelta y el papel baja solo.',
                palanca: 'Solo queda la palanca de la prensa. Bájala con ganas.',
              }[next()],
            ],
            ex: ['smile'],
          };
        if (bagHas('agua'))
          return {
            lines: [
              '¡Agua de lluvia! Mi tinta estaba seca como una hoja vieja.',
              'Pero la prensa lleva parada desde aquella noche. Ayúdame a ponerla en marcha.',
              'Llena el tintero, dale una vuelta a la bobina y baja la palanca. En ese orden.',
            ],
            ex: ['open', 'neutral', 'smile'],
            fx: () => {
              F.go = 1;
            },
          };
      }
      return d0.call(PUZ, id);
    };
    const g0 = PUZ.goal;
    PUZ.goal = function () {
      if (cur && going()) return `Pon en marcha la prensa de Ocre · ${stepN()}/3`;
      return g0.call(PUZ);
    };
    const a0 = act;
    act = function (t) {
      if (!t || !STEPS.includes(t.id)) return a0(t);
      const F = IF();
      if (t.id !== next()) {
        note('Todavía no. Ocre dijo: tintero, bobina y palanca.');
        Sound.sfx('blocked');
        return;
      }
      F[t.id] = 1;
      buzz(15);
      if (t.id === 'tintero') {
        bagTake('agua');
        FLY.push({ item: 'agua', a: hands, b: () => [t.x, t.y, 60], t0: T, dur: 0.5 });
        Sound.sfx('give');
        note('La tinta vuelve a estar líquida · 1/3');
      } else if (t.id === 'bobina') {
        Sound.sfx('crank', 1);
        note('El papel baja hasta la prensa · 2/3');
      } else {
        /* el despertar del cuarto: la prensa arranca, la lámpara se enciende, los pliegos se mecen */
        F.oto = 1;
        PROG.F.inkFixed = 1;
        Sound.sfx('seal', 0.6);
        WAVE = { t0: T + 0.3, id: 'oto' };
        EMO.oto = { ch: '✦', t0: T + 0.4 };
        ZKhold = { v: 0.7, until: T + 3.2 };
        Pl.happy = T + 3;
        buzz([20, 60, 30]);
        note('✦ El taller de papel despierta');
        setTimeout(() => {
          if (cur !== 'oto') return;
          sayNPC(
            [
              '¡Imprime! Oye cómo suena: llevaba callada desde aquella noche.',
              'La manivela junto al puente ya gira: lo lleva hacia Invierno.',
            ],
            ['happy', 'smile'],
          );
        }, 1300);
      }
      stateChanged();
    };
  }

  I18N([
    ['Hacia', 'To', 'К:', '前往'],
    ['Llenar el tintero con el agua', 'Fill the inkwell with the water', 'Налить воду в чернильницу', '把水倒进墨水瓶'],
    ['Dar una vuelta a la bobina', 'Give the paper reel a turn', 'Провернуть бумажный рулон', '转一圈纸卷'],
    ['Bajar la palanca de la prensa', 'Pull the press lever', 'Опустить рычаг пресса', '压下印刷机的拉杆'],
    [
      'Primero la tinta: echa el agua en el tintero, sobre el mueble de los tipos.',
      'Ink first: pour the water into the inkwell, on the type cabinet.',
      'Сначала чернила: налей воду в чернильницу на наборной кассе.',
      '先弄墨水：把水倒进铅字柜上的墨水瓶。',
    ],
    [
      'Ahora la bobina, junto al muro. Una vuelta y el papel baja solo.',
      'Now the reel, by the wall. One turn and the paper comes down by itself.',
      'Теперь рулон у стены. Один оборот — и бумага пойдёт сама.',
      '现在是墙边的纸卷。转一圈，纸就自己下来了。',
    ],
    [
      'Solo queda la palanca de la prensa. Bájala con ganas.',
      'Only the press lever is left. Pull it hard.',
      'Остался только рычаг пресса. Опусти его как следует.',
      '只剩印刷机的拉杆了。用力压下去。',
    ],
    [
      'Pero la prensa lleva parada desde aquella noche. Ayúdame a ponerla en marcha.',
      'But the press has stood still since that night. Help me get it running.',
      'Но пресс стоит с той самой ночи. Помоги мне запустить его.',
      '可是印刷机从那晚起就停了。帮我把它开动起来吧。',
    ],
    [
      'Llena el tintero, dale una vuelta a la bobina y baja la palanca. En ese orden.',
      'Fill the inkwell, give the reel a turn and pull the lever. In that order.',
      'Наполни чернильницу, проверни рулон и опусти рычаг. Именно в таком порядке.',
      '装满墨水瓶，转一圈纸卷，再压下拉杆。按这个顺序。',
    ],
    [
      'Todavía no. Ocre dijo: tintero, bobina y palanca.',
      'Not yet. Ocre said: inkwell, reel, then lever.',
      'Ещё рано. Окре сказал: чернильница, рулон, рычаг.',
      '还不行。奥克雷说：墨水瓶、纸卷、拉杆。',
    ],
    ['La tinta vuelve a estar líquida · 1/3', 'The ink flows again · 1/3', 'Чернила снова жидкие · 1/3', '墨水又能流动了 · 1/3'],
    [
      'El papel baja hasta la prensa · 2/3',
      'The paper runs down to the press · 2/3',
      'Бумага спускается к прессу · 2/3',
      '纸送到印刷机了 · 2/3',
    ],
    ['✦ El taller de papel despierta', '✦ The paper workshop wakes up', '✦ Бумажная мастерская просыпается', '✦ 造纸坊醒来了'],
    [
      '¡Imprime! Oye cómo suena: llevaba callada desde aquella noche.',
      'It prints! Listen to it: it had been silent since that night.',
      'Печатает! Послушай, как звучит: он молчал с той самой ночи.',
      '印起来了！听这声音：从那晚起它就没响过。',
    ],
    [
      'La manivela junto al puente ya gira: lo lleva hacia Invierno.',
      'The crank by the bridge turns now: it swings it toward Winter.',
      'Рукоятка у моста теперь крутится: она поворачивает его к Зиме.',
      '桥边的摇柄能转了：它会把桥转向冬天。',
    ],
  ]);
  TPLadd(
    'Pon en marcha la prensa de Ocre · {n}/3',
    'Get Ocre’s press running · {n}/3',
    'Запусти пресс Окре · {n}/3',
    '开动奥克雷的印刷机 · {n}/3',
  );
}
