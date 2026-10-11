/* ══════════ SONIDO AMBIENTE PROPIO DE CADA HABITACIÓN ══════════
   La música es una sola (el tema de Amaranta, con una variación por zona). Lo que distingue a cada
   habitación es su ambiente: olas en el Océano, tictac en la Relojería, viento en el Campanario… */
{
  const ob = STYLE.sound.beds;
  STYLE.sound.beds = (H) => {
    ob(H);
    const b = H.bus.bind(H),
      n = H.nz;
    H.lfo(0.06, 0.1, H.bed(b('and'), n.brown, [['lowpass', 140]], 0.14).gain);
    H.lfo(0.03, 0.05, H.bed(b('eco'), n.pink, [['bandpass', 700, 1.2]], 0.04).gain);
    H.bed(b('per'), n.brown, [['lowpass', 200]], 0.08);
    H.lfo(0.12, 0.06, H.bed(b('api'), n.pink, [['lowpass', 500]], 0.07).gain);
    H.lfo(
      0.05,
      0.06,
      H.bed(
        b('rev'),
        n.pink,
        [
          ['highpass', 2000],
          ['lowpass', 5000],
        ],
        0.04,
      ).gain,
    );
  };
}

{
  const ot = STYLE.sound.tick;
  STYLE.sound.tick = (H, id, t, nx) => {
    ot(H, id, t, nx);
    const b = H.bus(id),
      r = H.rnd,
      z = H.nz,
      due = (k) => !(t < nx[k]);
    switch (id) {
      case 'esp':
        if (due('sh')) {
          H.tone(b, 'sine', r(1600, 2400), r(2600, 3600), 0.015, 1.6);
          nx.sh = t + r(3, 7);
        }
        break; /* estrellas que cantan */
      case 'oce':
        if (due('ola')) {
          H.hit(b, z.pink, 'lowpass', r(500, 800), 0.7, 0.16, 1.4, 0.9);
          nx.ola = t + r(4, 7);
        }
        if (due('bur')) {
          for (let k = 0; k < 3; k++) H.tone(b, 'sine', r(500, 900), r(900, 1400), 0.02, 0.06, t + k * 0.09);
          nx.bur = t + r(2, 5);
        }
        break; /* olas y burbujas */
      case 'des':
        if (due('rach')) {
          H.hit(b, z.pink, 'bandpass', r(900, 1500), 0.7, 0.1, 1.6, 0.7);
          H.hit(b, z.white, 'highpass', 5000, 0.6, 0.02, 1, 0.5);
          nx.rach = t + r(4, 8);
        }
        break; /* ráfagas con arena */
      case 'ant':
        if (due('sil')) {
          H.tone(b, 'sine', r(700, 900), r(500, 650), 0.012, 1.8);
          nx.sil = t + r(5, 9);
        }
        if (due('cr')) {
          H.hit(b, z.white, 'highpass', r(2000, 4000), 0.7, 0.05, 0.02, 0.001);
          nx.cr = t + r(1, 4);
        }
        break; /* viento silbando y hielo que cruje */
      case 'col':
        if (due('zum')) {
          const f = r(200, 260);
          for (let k = 0; k < 8; k++) H.hit(b, z.pink, 'bandpass', f, 8, 0.05, 0.07, 0.02, t + k * 0.06);
          nx.zum = t + r(1.5, 4);
        }
        break; /* abejas */
      case 'bib':
        if (due('hoja')) {
          H.hit(b, z.white, 'bandpass', 3400, 0.9, 0.05, 0.2, 0.05);
          H.hit(b, z.white, 'bandpass', 2200, 0.9, 0.03, 0.12, 0.02, t + 0.14);
          nx.hoja = t + r(6, 12);
        }
        break; /* páginas */
      case 'coc':
        if (due('hierve')) {
          for (let k = 0; k < 4; k++) H.tone(b, 'sine', r(160, 260), r(300, 420), 0.03, 0.05, t + k * r(0.08, 0.2));
          nx.hierve = t + r(0.8, 2);
        }
        if (due('taza')) {
          H.tone(b, 'sine', r(2400, 3000), r(2380, 2980), 0.02, 0.4);
          nx.taza = t + r(8, 15);
        }
        break; /* olla y tazas */
      case 'far':
        if (due('sirena')) {
          H.tone(b, 'sawtooth', 98, 92, 0.02, 2.4);
          nx.sirena = t + r(14, 22);
        }
        if (due('gav')) {
          H.tone(b, 'sine', r(1300, 1600), r(900, 1100), 0.025, 0.25);
          H.tone(b, 'sine', r(1300, 1600), r(900, 1100), 0.02, 0.2, t + 0.3);
          nx.gav = t + r(6, 12);
        }
        break; /* sirena lejana y gaviotas */
      case 'tea':
        if (due('pap')) {
          H.hit(b, z.white, 'bandpass', r(1800, 2600), 1, 0.03, 0.25, 0.08);
          nx.pap = t + r(2, 5);
        }
        break; /* títeres de papel */
      case 'sot':
        if (due('gota')) {
          H.tone(b, 'sine', r(300, 420), r(150, 200), 0.05, 0.12);
          nx.gota = t + r(2, 5);
        }
        break; /* cera que gotea */
      case 'vol':
        if (due('chis')) {
          H.hit(b, z.white, 'bandpass', r(1500, 4000), 2, r(0.03, 0.08), 0.02, 0.001);
          nx.chis = t + (Math.random() < 0.3 ? r(0.02, 0.08) : r(0.12, 0.6));
        }
        if (due('ret')) {
          H.hit(b, z.brown, 'lowpass', 90, 0.7, 0.18, 1.8, 0.6);
          nx.ret = t + r(6, 12);
        }
        break; /* brasas y retumbo */
      case 'cum':
        if (due('vto')) {
          H.hit(b, z.pink, 'bandpass', r(500, 800), 0.6, 0.1, 2.4, 1.1);
          nx.vto = t + r(5, 9);
        }
        if (due('camp')) {
          H.tone(b, 'sine', 196, 195, 0.03, 3.5);
          H.tone(b, 'sine', 493, 492, 0.012, 2.5);
          nx.camp = t + r(20, 35);
        }
        break; /* viento y la campana, muy de vez en cuando */
      case 'dsv':
        if (due('cruje')) {
          H.tone(b, 'sawtooth', r(120, 180), r(90, 130), 0.012, 0.4);
          nx.cruje = t + r(4, 9);
        }
        if (due('raton')) {
          for (let k = 0; k < 5; k++) H.hit(b, z.white, 'bandpass', 4200, 2, 0.02, 0.02, 0.001, t + k * 0.05);
          nx.raton = t + r(10, 20);
        }
        break; /* madera y un ratón */
      case 'est':
        if (due('pluma')) {
          const n = 4 + Math.floor(Math.random() * 6);
          for (let k = 0; k < n; k++) H.hit(b, z.white, 'bandpass', r(3000, 4500), 3, 0.025, 0.06, 0.01, t + k * 0.11);
          nx.pluma = t + r(3, 7);
        }
        break; /* pluma que escribe */
      case 'ret':
        if (due('pincel')) {
          H.hit(b, z.pink, 'bandpass', r(1200, 1800), 1, 0.04, 0.35, 0.12);
          nx.pincel = t + r(2.5, 6);
        }
        break; /* pinceladas */
      case 'and':
        if (due('eco')) {
          H.tone(b, 'sine', 440, 435, 0.012, 1.2);
          H.tone(b, 'sine', 440, 435, 0.006, 1.2, t + 0.6);
          nx.eco = t + r(12, 20);
        }
        if (due('gota')) {
          H.tone(b, 'sine', r(1500, 2200), r(800, 1100), 0.03, 0.1);
          nx.gota = t + r(2, 6);
        }
        break; /* un silbato lejano y goteo */
      case 'eco':
        if (due('sus')) {
          for (let k = 0; k < 3; k++) H.hit(b, z.white, 'bandpass', r(1800, 3200), 4, 0.025, 0.18, 0.08, t + k * r(0.15, 0.3));
          nx.sus = t + r(3, 7);
        }
        break; /* susurros */
      case 'per':
        if (due('cosa')) {
          H.tone(b, 'sine', r(1800, 2600), r(1790, 2590), 0.015, 0.5);
          H.hit(b, z.brown, 'lowpass', 400, 0.8, 0.05, 0.08, 0.002);
          nx.cosa = t + r(4, 9);
        }
        break; /* cosas que se mueven en las estanterías */
      case 'api':
        if (due('resp')) {
          H.hit(b, z.pink, 'lowpass', 500, 0.7, 0.06, 1.6, 1.4);
          nx.resp = t + 4.2;
        }
        if (PROG.F.ab && PROG.F.ab.api && due('tic')) {
          H.hit(b, z.white, 'bandpass', 3200, 4, 0.05, 0.015, 0.001);
          nx.tic = t + 0.5;
        }
        break; /* respiración del viejo; tictac si despertó */
      case 'rev':
        if (due('rv')) {
          H.hit(b, z.pink, 'bandpass', r(800, 1600), 1, 0.05, 0.04, 1.2);
          nx.rv = t + r(4, 8);
        }
        break; /* sonidos que van hacia atrás */
    }
  };
}

/* en los finales suena el tema completo */
{
  const se0 = showEnding;
  showEnding = function (...a) {
    try {
      Sound.theme && Sound.theme();
    } catch (e) {}
    return se0(...a);
  };
}
