/* ══════════ SALAS 4 · la casa de Amaranta: Colmenar, Biblioteca, La Última Cena y Relojería ══════════
   Mismo criterio que salas3.js (docs/guia-salas.md, lección de la limpieza): una pieza protagonista, algo que
   sobresale del muro, suelo propio, luz con intención, UNA cosa en altura y UN movimiento. Pocas piezas y suelo libre.
   No cambia la lógica: vecinos, puertas, objetos y muebles siguen en su sitio. */
(() => {
  if (!window.SALAS || !SALAS.kit.texFloor || !window.PROPS3D || !window.LP3D || !window.THREE) return;
  const T3 = THREE,
    { Bk, SPH, CYL, CONE, BOX, TOR, LATHE, CIRC, glowSprite } = LP3D.kit,
    { WYAW, P, rf, limb } = PROPS3D.kit,
    { keep, ctex, solid, lightPool, layer, vignette, blobs, poolTex, tx, ty, texFloor, hangers, rope, ropeMesh, away } = SALAS.kit,
    /* el detalle de cerca: ver salas3.js */
    { deCerca, pon, tubo, BLQ, BX } = SALAS.kit;
  const LT = [3, 4],
    BT = [4, 5],
    RT = [5, 0],
    HALF = Math.PI / 2;
  /* una esfera de reloj que mira al frente, parada a las cuatro menos cuarto */
  function esfera(B, x, y, z, r, aro, lados = 20) {
    B.add(CYL(r + 5, r + 5, 5, lados), aro, P(x, y, z), [HALF, 0, 0]);
    B.add(CYL(r, r, 6, 20), '#FBF4E3', P(x, y + 1, z), [HALF, 0, 0]);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * 6.283,
        q = r * 0.82;
      B.add(BOX(k % 3 ? 1.6 : 2.6, r * 0.16, 1.4), '#5A3A22', P(x + Math.sin(a) * q, y + 4.2, z + Math.cos(a) * q), [0, 0, -a]);
    }
    const mano = (a, L, w) => limb(B, [x, y + 5.4, z], [x + Math.sin(a) * L, y + 5.4, z + Math.cos(a) * L], w, w * 0.6, '#3A2618', 4);
    mano(4.712, r * 0.74, 1.7);
    mano(1.963, r * 0.5, 2.2);
    B.add(CYL(r * 0.1, r * 0.1, 3, 8), '#C9A24A', P(x, y + 6, z), [HALF, 0, 0]);
  }

  /* ═════════════════ RELOJERÍA · el gran reloj de péndulo con los engranajes a la vista ═════════════════ */
  const REL = (() => {
    const id = 'rel',
      KX = 0,
      KY = -232;
    solid(id, KX, KY, 50);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        NOG = '#5A3A22',
        MAD = '#7A5232',
        LATON = '#C9A24A';
      /* ── la caja abierta del reloj: zócalo, dos montantes, fondo oscuro y la esfera por encima del muro ── */
      B.add(BOX(118, 14, 42), NOG, P(KX, KY - 4, 7));
      B.add(BOX(124, 3, 46), MAD, P(KX, KY - 4, 15));
      B.add(BOX(100, 126, 3), '#3A2618', P(KX, KY - 20, 77));
      for (const sx of [-1, 1]) B.add(BOX(10, 126, 12), MAD, P(KX + sx * 52, KY - 8, 77));
      esfera(B, KX, KY - 10, 102, 32, '#D89A45', 24);
      /* el tejadillo, por encima del muro */
      B.add(BOX(126, 6, 46), NOG, P(KX, KY - 6, 143));
      B.add(CYL(27, 27, 122, 3, false, HALF), MAD, P(KX, KY - 6, 160), [0, 0, HALF]);
      B.add(CONE(6, 16, 4), LATON, P(KX, KY - 6, 194), [0, Math.PI / 4, 0]);
      /* ── los tres engranajes: cada uno es una malla que gira a saltos con el péndulo ── */
      const rueda = (r, n, col, x, z) => {
        const G = new Bk();
        G.add(CYL(r, r, 5, n * 2), col);
        for (let k = 0; k < n; k++) {
          const a = (k / n) * 6.283;
          G.add(BOX(r * 0.3, 5, r * 0.34), col, [Math.cos(a) * r * 1.08, 0, Math.sin(a) * r * 1.08], [0, -a, 0]);
        }
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * 6.283 + 0.6;
          G.add(CYL(r * 0.2, r * 0.2, 5.6, 6), '#3A2618', [Math.cos(a) * r * 0.56, 0, Math.sin(a) * r * 0.56]);
        }
        G.add(CYL(r * 0.2, r * 0.2, 7.5, 8), NOG);
        const m = G.mesh(g);
        m.position.set(...P(KX + x, KY - 14, z));
        m.rotation.x = HALF;
        return { m, n };
      };
      const ruedas = [rueda(20, 14, '#C9A060', -25, 41), rueda(13, 9, '#8A6A4A', 11, 49), rueda(9, 6, '#E4A844', 33, 36)];
      /* ── el péndulo: varilla y lenteja de latón colgando del travesaño ── */
      const pend = new T3.Group(),
        PB = new Bk();
      PB.add(CYL(1.2, 1.2, 38, 5), '#8A6A4A', [0, -19, 0]);
      PB.add(CYL(10, 10, 4, 16), '#E4A844', [0, -38, 0], [HALF, 0, 0]);
      PB.add(CYL(5.5, 5.5, 5, 12), '#F6D27A', [0, -38, 0.4], [HALF, 0, 0]);
      const pendM = PB.mesh(pend);
      const brillo = glowSprite('#FFD98A', 50);
      brillo.position.set(0, -38, 4);
      brillo.material.opacity = 0.34;
      pend.add(brillo);
      pend.position.set(...P(KX, KY - 2, 68));
      g.add(pend);
      /* ── en altura, una sola cosa: los relojes parados que cuelgan, todos a la misma hora ── */
      for (const [x, y, z, r] of [
        [-92, -216, 114, 10],
        [100, -224, 120, 11],
      ]) {
        limb(B, [x, y, z + r + 8], [x, y, 430], 0.5, 0.5, '#8A6A4A', 3);
        B.add(TOR(4, 1, 4, 8), LATON, P(x, y, z + r + 7));
        esfera(B, x, y, z, r, LATON, 14);
      }
      /* ── suelo: nogal oscuro con ruedas de latón incrustadas, como el dibujo de un mecanismo ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#6E4A30';
        c.fillRect(0, 0, w, w);
        const R1 = rf('rel-suelo'),
          k = w / (2 * R);
        blobs(c, w, w, 34, R1, ['rgba(138,96,60,A)', 'rgba(70,44,26,A)'], 30, 90, 0.4);
        for (let y = 0; y < w; y += 26) {
          c.fillStyle = 'rgba(40,24,12,.3)';
          c.fillRect(0, y, w, 1.6);
          const o = R1(0, 120);
          for (let x = o; x < w; x += 132) c.fillRect(x, y, 1.6, 26);
        }
        const rd = (x, y, r, n, a0) => {
          const cx = tx(x, w),
            cy = ty(y, w);
          c.beginPath();
          for (let i = 0; i <= n * 4; i++) {
            const a = a0 + (i / (n * 4)) * 6.283,
              q = (Math.floor((i + 1) / 2) % 2 ? r * 1.1 : r * 0.94) * k;
            c.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q);
          }
          c.closePath();
          c.stroke();
          c.beginPath();
          c.arc(cx, cy, r * 0.66 * k, 0, 6.283);
          c.stroke();
          for (let i = 0; i < 6; i++) {
            const a = a0 + (i / 6) * 6.283;
            c.beginPath();
            c.moveTo(cx + Math.cos(a) * r * 0.16 * k, cy + Math.sin(a) * r * 0.16 * k);
            c.lineTo(cx + Math.cos(a) * r * 0.66 * k, cy + Math.sin(a) * r * 0.66 * k);
            c.stroke();
          }
          c.beginPath();
          c.arc(cx, cy, r * 0.16 * k, 0, 6.283);
          c.stroke();
        };
        c.strokeStyle = 'rgba(226,182,100,.5)';
        c.lineWidth = 2.6;
        rd(-30, 40, 118, 20, 0.1);
        rd(128, 150, 62, 11, 0.32);
        rd(-176, 156, 50, 9, 0);
        rd(150, -30, 44, 8, 0.2);
      });
      texFloor(id, g, fl);
      /* ── luz: el reloj en su charco dorado; los bordes, en nogal ── */
      const pool = lightPool(id, g, KX, KY + 70, 190, 130, '#FFD28A', 0.36);
      lightPool(id, g, 40, 90, 150, 110, '#FFE6B8', 0.12);
      layer(id, g, vignette('rgba(40,22,8,A)'), 3.5, { op: 0.62 });
      B.mesh(g);
      F.mesh(g, true);
      /* ── de cerca: esfera con números romanos, caja tallada, y ruedas y péndulo de relojero (las mismas mallas, otra geometría) ── */
      deCerca(id, g, () => {
        const N = new Bk(),
          OSC = '#3A2618',
          CLARO = '#F3D88E',
          DX = KX,
          DY = KY - 10,
          DZ = 102,
          RD = 32,
          CARA = DY + 5,
          PL = (x, z, y = CARA + 0.15) => P(x, y, z),
          QD = new T3.PlaneGeometry(1, 1);
        /* cara y bisel: la esfera nueva tapa las marcas de siempre */
        N.add(CYL(1, 1, 1, 48), '#FBF4E3', P(DX, CARA - 0.3, DZ), [HALF, 0, 0], [RD + 0.6, 0.6, RD + 0.6]);
        N.add(
          LATHE(
            [
              [RD - 0.2, 0],
              [RD + 1.2, 3.1],
              [RD + 3, 3.5],
              [RD + 5.6, 2.2],
              [RD + 6, -3],
            ],
            48,
          ),
          '#D89A45',
          P(DX, DY + 2, DZ),
          [HALF, 0, 0],
        );
        for (let k = 0; k < 40; k++) {
          const a = (k / 40) * 6.2832;
          N.add(
            SPH(1, 5, 3),
            CLARO,
            P(DX + Math.sin(a) * (RD + 3.1), DY + 5.7, DZ + Math.cos(a) * (RD + 3.1)),
            [0, 0, 0],
            [0.75, 0.75, 0.75],
          );
        }
        /* los anillos, el minutero y el rosetón del centro */
        for (const [r, t] of [
          [RD * 0.95, 0.12],
          [RD * 0.875, 0.1],
          [RD * 0.62, 0.1],
          [RD * 0.58, 0.07],
        ])
          N.add(TOR(r, t, 3, 56), OSC, P(DX, CARA + 0.1, DZ));
        for (let k = 0; k < 60; k++) {
          const a = (k / 60) * 6.2832,
            q = RD * 0.915,
            l = k % 5 ? 1.6 : 2.9;
          N.add(QD, OSC, PL(DX + Math.sin(a) * q, DZ + Math.cos(a) * q), [0, 0, -a], [k % 5 ? 0.3 : 0.7, l, 1]);
        }
        for (let k = 0; k < 24; k++) {
          const a = (k / 24) * 6.2832,
            q = RD * 0.3;
          N.add(QD, k % 2 ? '#D8C48E' : '#EADFC0', PL(DX + Math.sin(a) * q, DZ + Math.cos(a) * q), [0, 0, -a], [0.7, RD * 0.52, 1]);
        }
        /* números romanos: cada trazo, un cuadro plano girado con la hora */
        const ROM = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'],
          QR = RD * 0.745;
        ROM.forEach((s, h) => {
          const a = (h / 12) * 6.2832,
            ca = Math.cos(a),
            sa = Math.sin(a),
            pone = (lx, lz, rz, w, l) =>
              N.add(QD, OSC, PL(DX + sa * QR + ca * lx + sa * lz, DZ + ca * QR - sa * lx + ca * lz), [0, 0, -a + rz], [w, l, 1]);
          const ancho = [...s].reduce((q, c) => q + (c === 'I' ? 1.2 : 2.7), 0);
          let x = -ancho / 2;
          for (const c of s) {
            if (c === 'I') {
              pone(x + 0.6, 0, 0, 0.62, 5);
              x += 1.2;
            } else {
              const lean = c === 'X' ? 0.38 : 0.26;
              if (c === 'X') {
                pone(x + 1.35, 0, lean, 0.62, 5.4);
                pone(x + 1.35, 0, -lean, 0.28, 5.4);
              } else {
                pone(x + 0.85, 0, lean, 0.62, 5.2);
                pone(x + 1.85, 0, -lean, 0.28, 5.2);
              }
              x += 2.7;
            }
          }
        });
        /* las agujas caladas, en la misma hora parada */
        const aguja = (a, L, w) => {
          const sa = Math.sin(a),
            ca = Math.cos(a),
            at = (u, s = 0) => [DX + sa * L * u + ca * s, CARA + 2.8, DZ + ca * L * u - sa * s],
            rot = [0, 0, -a];
          N.add(BX, OSC, P(...at(0.34)), rot, [w * 0.9, L * 0.68, 0.7]);
          N.add(BX, OSC, P(...at(-0.13)), rot, [w * 0.7, L * 0.26, 0.7]);
          N.add(TOR(w * 1.7, w * 0.35, 3, 12), OSC, P(...at(0.72)));
          N.add(CONE(w * 1.3, L * 0.26, 4), OSC, P(...at(0.92)), [0, 0, -a], [1, 1, 0.3]);
          N.add(TOR(w * 1.2, w * 0.3, 3, 10), OSC, P(...at(-0.3)));
        };
        aguja(4.712, RD * 0.82, 1.7);
        aguja(1.963, RD * 0.56, 2.2);
        N.add(
          LATHE(
            [
              [0, 3.8],
              [3.2, 3.4],
              [3.4, 2.6],
              [2, 1],
              [2, -1],
            ],
            12,
          ),
          '#C9A24A',
          P(DX, CARA + 1.2, DZ),
          [HALF, 0, 0],
          [1, 1, 1],
        );
        /* los pilares: columna estriada delante del montante de siempre, con basa y capitel */
        for (const sx of [-1, 1]) {
          const x = KX + sx * 52,
            y = KY - 1.5;
          N.add(CYL(1, 1, 1, 14), '#8A6040', P(x, y, 77), [0, 0, 0], [4.8, 92, 4.8]);
          for (const [z, q] of [
            [24, 1],
            [130, -1],
          ]) {
            N.add(
              LATHE(
                [
                  [4.8, 7 * q],
                  [5.8, 5.5 * q],
                  [5.2, 3.5 * q],
                  [6.2, 2 * q],
                  [6.8, 0],
                ],
                14,
              ),
              '#C9A24A',
              P(x, y, z),
            );
            N.add(BX, NOG, P(x, y - 1.5, z - q * 3), [0, 0, 0], [13, 6, 14]);
          }
          for (let k = -2; k <= 2; k++) {
            const a = k * 0.6;
            N.add(BX, '#5A3A22', P(x + Math.sin(a) * 4.7, y + Math.cos(a) * 4.7, 77), [0, a, 0], [0.7, 88, 0.5]);
          }
        }
        /* la platina de latón al fondo, grabada, con sus pilares; el eje de cada rueda; el áncora sobre el péndulo */
        N.add(BX, '#6E5426', P(KX, KY - 18.1, 42), [0, 0, 0], [90, 56, 0.6]);
        for (const [x, z] of [
          [-42, 18],
          [42, 18],
          [-42, 66],
          [42, 66],
        ]) {
          N.add(CYL(2.4, 2.4, 5, 8), '#C9A24A', P(KX + x, KY - 15.5, z), [HALF, 0, 0]);
          N.add(SPH(1, 6, 4), CLARO, P(KX + x, KY - 12.8, z), [0, 0, 0], [1.6, 1.6, 1.2]);
        }
        for (let k = 0; k < 3; k++) {
          const pts = [];
          for (let i = 0; i <= 24; i++) {
            const t = i / 24;
            pts.push([KX - 40 + t * 80, KY - 17.6, 26 + k * 14 + Math.sin(t * 12.5 + k) * 4]);
          }
          tubo(N, pts, 0.28, '#8E7032', 3);
        }
        for (const [x, z, h] of [
          [-25, 41, 13],
          [11, 49, 13],
          [33, 36, 12],
        ]) {
          N.add(CYL(1.5, 1.5, h, 8), CLARO, P(KX + x, KY - 12, z), [HALF, 0, 0]);
          N.add(CYL(2.6, 2.6, 1.4, 10), '#8A6A4A', P(KX + x, KY - 17, z), [HALF, 0, 0]);
        }
        const anc = [];
        for (let i = 0; i <= 10; i++) {
          const a = -0.9 + (i / 10) * 1.8;
          anc.push([KX + Math.sin(a) * 15, KY - 6, 46 + Math.cos(a) * 15]);
        }
        tubo(N, anc, 1, CLARO, 5);
        N.add(BX, '#C9A24A', P(KX, KY - 3.5, 68), [0, 0, 0], [14, 3, 3]);
        /* el zócalo y la cornisa con dentellones; el tejadillo, de tejas; el remate, torneado */
        N.add(BX, MAD, P(KX, KY + 17.6, 7), [0, 0, 0], [96, 8, 0.8]);
        N.add(BX, NOG, P(KX, KY + 18.1, 7), [0, 0, 0], [88, 5.5, 0.8]);
        for (let k = 0; k < 3; k++) N.add(SPH(1, 7, 5), '#E4A844', P(KX - 30 + k * 30, KY + 18.8, 7), [0, 0, 0], [1.6, 1.6, 1.6]);
        for (let k = 0; k < 25; k++) N.add(BX, LATON, P(KX - 60 + k * 5, KY + 17.4, 138.6), [0, 0, 0], [2.6, 3, 1.4]);
        N.add(BX, MAD, P(KX, KY + 17.6, 135.6), [0, 0, 0], [124, 2, 1.8]);
        N.add(BX, '#8A6040', P(KX, KY + 17.6, 146.6), [0, 0, 0], [130, 2.4, 2.6]);
        {
          const y0 = KY - 6,
            sl = Math.hypot(23.4, 40.5),
            dir = [0, -23.4 / sl, 40.5 / sl],
            nr = [0, 40.5 / sl, 23.4 / sl],
            FIL = 7;
          for (let i = 0; i < FIL; i++) {
            const t = (i + 0.4) / FIL;
            for (let k = 0; k < 13; k++)
              pon(
                N,
                BX,
                (i + k) % 3 ? '#7E5636' : '#6E4A2E',
                [KX - 57 + k * 9.5 + (i % 2) * 4.2, y0 + 23.4 * (1 - t) + nr[1] * 0.9, 146.5 + 40.5 * t + nr[2] * 0.9],
                dir,
                nr,
                [9, (sl / FIL) * 1.3, 1],
              );
          }
          N.add(CYL(2, 2, 122, 8), LATON, P(KX, y0, 187.6), [0, 0, HALF]);
          N.add(
            LATHE(
              [
                [0, 0],
                [5, 0],
                [5.6, 1.4],
                [3, 3],
                [2, 5],
                [4.6, 8],
                [4.6, 10.4],
                [1.4, 13],
                [1, 15.5],
                [2.4, 17],
                [0, 21],
              ],
              12,
            ),
            '#E4A844',
            P(KX, y0, 187),
          );
        }
        /* una rueda de verdad: dientes trapezoidales y cinco brazos calados */
        const ruedaG = (r, n, col) => {
          const S = new T3.Shape(),
            ri = r * 0.98,
            ro = r * 1.2;
          for (let k = 0; k < n; k++) {
            const a0 = (k / n) * 6.2832,
              st = 6.2832 / n;
            for (const [da, q] of [
              [0, ri],
              [st * 0.2, ri],
              [st * 0.3, ro],
              [st * 0.48, ro],
              [st * 0.58, ri],
            ]) {
              const x = Math.cos(a0 + da) * q,
                y = Math.sin(a0 + da) * q;
              k === 0 && da === 0 ? S.moveTo(x, y) : S.lineTo(x, y);
            }
          }
          S.closePath();
          const BR = 5;
          for (let k = 0; k < BR; k++) {
            const H = new T3.Path(),
              a0 = (k / BR) * 6.2832 + 0.2,
              a1 = a0 + (6.2832 / BR) * 0.78,
              r0 = r * 0.27,
              r1 = r * 0.8;
            H.moveTo(Math.cos(a0) * r0, Math.sin(a0) * r0);
            for (let i = 0; i <= 5; i++) {
              const a = a0 + ((a1 - a0) * i) / 5;
              H.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
            }
            H.lineTo(Math.cos(a1) * r0, Math.sin(a1) * r0);
            H.closePath();
            S.holes.push(H);
          }
          const G = new T3.ExtrudeGeometry(S, { depth: 4.4, bevelEnabled: false, curveSegments: 2 });
          G.translate(0, 0, -2.2);
          G.rotateX(HALF);
          const Q = new Bk();
          Q.add(G, col);
          Q.add(CYL(r * 0.21, r * 0.21, 8, 10), NOG);
          Q.add(CYL(r * 0.09, r * 0.09, 9.2, 8), '#F3D88E');
          Q.add(TOR(r * 0.88, 0.5, 3, n * 3), '#F3D88E', [0, 2.4, 0], [HALF, 0, 0]);
          return Q.geo();
        };
        const cols = ['#C9A060', '#8A6A4A', '#E4A844'];
        /* el péndulo: varilla con tuerca de ajuste y lenteja abombada con su aro */
        const Pn = new Bk();
        Pn.add(CYL(0.8, 0.8, 38, 8), '#D8B878', [0, -19, 0]);
        Pn.add(BX, '#6A5A40', [0, -1, 0], [0, 0, 0], [3, 5, 0.5]);
        Pn.add(CYL(1.6, 1.6, 2.6, 8), '#8A6A4A', [0, -31, 0]);
        Pn.add(
          LATHE(
            [
              [0, 3],
              [4, 2.8],
              [8, 1.6],
              [10.6, 0.5],
              [11, 0],
              [10.6, -0.5],
              [8, -1.6],
              [4, -2.8],
              [0, -3],
            ],
            28,
          ),
          '#E4A844',
          [0, -38, 0],
          [HALF, 0, 0],
        );
        Pn.add(TOR(7, 0.28, 3, 24), '#A67C34', [0, -38, 2.1]);
        Pn.add(TOR(3.6, 0.28, 3, 18), '#F6D27A', [0, -38, 2.9]);
        return {
          B: N,
          cambia: [...ruedas.map((q, i) => [q.m, ruedaG([20, 13, 9][i], q.n, cols[i])]), [pendM, Pn.geo()]],
        };
      });
      /* ── el único movimiento: el péndulo oscila y, a cada vaivén, las ruedas avanzan medio diente ── */
      g.userData.tick = (t, still) => {
        const tt = still ? 0 : t,
          ph = (tt * 2.6) / Math.PI,
          paso = Math.floor(ph) + Math.min(1, (ph % 1) * 4);
        pend.rotation.z = still ? 0 : Math.sin(tt * 2.6) * 0.3;
        ruedas.forEach((q, i) => (q.m.rotation.y = ((i % 2 ? -1 : 1) * paso * Math.PI) / q.n));
        pool.material.opacity = 0.34 + (still ? 0 : 0.03 * Math.sin(tt * 2.6));
      };
      return g;
    };
  })();

  /* ═════════════════ BIBLIOTECA · la estantería en espiral que sube por encima del muro ═════════════════ */
  const BIB = (() => {
    const id = 'bib',
      R0 = rf('sala-bib'),
      SX = 96,
      SY = -178;
    solid(id, SX, SY, 60);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        LOMOS = ['#6F8D8A', '#C9563A', '#E9C99A', '#4E6B46', '#8A5A3A', '#C9A060', '#F3E7C8', '#A5523A', '#6F968C'];
      /* ── la espiral: un eje de madera y una rampa de estantes que sube dando vueltas, con sus libros al borde ── */
      B.add(CYL(58, 61, 5, 16), '#5A3A22', P(SX, SY, 2.5));
      B.add(CYL(8, 10, 176, 8), '#7A5232', P(SX, SY, 88));
      const N = 46,
        da = 6.283 / 16;
      const LIBROS = [];
      for (let i = 0; i < N; i++) {
        const a = 2.2 + i * da,
          z = 9 + i * 3.5,
          r = 54 - i * 0.5,
          len = 2 * r * Math.tan(da / 2) + 1.5,
          yw = HALF - a,
          rm = (8 + r) / 2;
        B.add(BOX(len, 2.6, r - 6), i % 2 ? '#8A5A34' : '#9A6A40', P(SX + Math.cos(a) * rm, SY + Math.sin(a) * rm, z), [0, yw, 0]);
        for (let j = 0; j < 3; j++) {
          if (R0(0, 1) < 0.14) continue;
          const s = ((j - 1) * len) / 3,
            h = 11 + R0(0, 6),
            q = r - 6,
            col = LOMOS[Math.floor(R0(0, LOMOS.length))],
            pos = P(SX + Math.cos(a) * q + Math.sin(a) * s, SY + Math.sin(a) * q - Math.cos(a) * s, z + 1.3 + h / 2),
            incl = R0(0, 1) < 0.15 ? 0.22 : 0;
          B.add(BOX(len / 3 - 0.8, h, 9), col, pos, [0, yw, incl]);
          LIBROS.push({ pos, yw, incl, w: len / 3 - 0.8, h, col });
        }
      }
      /* el farol de lectura en lo alto del eje */
      B.add(CYL(13, 9, 4, 8), '#5A3A22', P(SX, SY, 177));
      B.add(CONE(8, 9, 6), '#C9A24A', P(SX, SY, 198));
      const farol = new T3.Mesh(SPH(7, 8, 6), keep(id, new T3.MeshBasicMaterial({ color: '#FFE9B0' })));
      farol.position.set(...P(SX, SY, 187));
      g.add(farol);
      const luz = glowSprite('#FFE3A0', 120);
      luz.position.set(...P(SX, SY, 187));
      g.add(luz);
      /* ── suelo: parqué en espiga y una alfombra verde de lectura ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#B58852';
        c.fillRect(0, 0, w, w);
        const R1 = rf('bib-suelo'),
          k = w / (2 * R);
        blobs(c, w, w, 36, R1, ['rgba(214,170,110,A)', 'rgba(140,96,52,A)'], 30, 90, 0.4);
        c.strokeStyle = 'rgba(88,54,24,.3)';
        c.lineWidth = 1.4;
        for (let y = -20; y < w + 20; y += 18) {
          c.beginPath();
          for (let x = 0, i = 0; x <= w; x += 18, i++) c.lineTo(x, y + (i % 2 ? 18 : 0));
          c.stroke();
        }
        const hex = (r) => {
          c.beginPath();
          for (let i = 0; i < 6; i++) c.lineTo(tx(-24 + Math.cos(i * 1.0472) * r, w), ty(78 + Math.sin(i * 1.0472) * r, w));
          c.closePath();
        };
        hex(104);
        c.fillStyle = '#56784F';
        c.fill();
        c.strokeStyle = '#E9D9A8';
        c.lineWidth = 7 * k * 1.2;
        hex(94);
        c.stroke();
        c.strokeStyle = 'rgba(201,160,96,.9)';
        c.lineWidth = 2.4;
        hex(80);
        c.stroke();
        hex(32);
        c.stroke();
      });
      texFloor(id, g, fl);
      /* ── en altura, una sola cosa (y el único movimiento): los libros que vuelan en corro alrededor de la espiral ── */
      const NB = 6,
        alaG = (sx) => {
          const q = new T3.BoxGeometry(11, 1, 15);
          q.translate(sx * 5.5, 0, 0);
          q.userData.shared = true;
          return q;
        },
        alaM = keep(id, new T3.MeshLambertMaterial({ color: '#FFFFFF', side: T3.DoubleSide })),
        alas = [-1, 1].map((sx) => {
          const I = new T3.InstancedMesh(alaG(sx), alaM, NB),
            c = new T3.Color();
          for (let i = 0; i < NB; i++) I.setColorAt(i, c.set(['#F3E7C8', '#C9563A', '#6F968C', '#E9C99A', '#F3E7C8', '#C9A060'][i]));
          I.frustumCulled = false;
          g.add(I);
          return { I, sx };
        }),
        o = new T3.Object3D();
      const vuela = (t, quieto) => {
        for (let i = 0; i < NB; i++) {
          const a = t * 0.22 + (i / NB) * 6.283,
            rx = 100 + (i % 3) * 20,
            ry = 62 + (i % 2) * 16,
            fl2 = quieto ? 0.45 : 0.5 + 0.42 * Math.sin(t * 5 + i * 1.9);
          for (const w of alas) {
            o.position.set(...P(SX - 24 + Math.cos(a) * rx, SY + 52 + Math.sin(a) * ry, 122 + 12 * Math.sin(a * 2 + i)));
            o.rotation.set(0, Math.atan2(-Math.sin(a) * rx, Math.cos(a) * ry), w.sx * fl2);
            o.updateMatrix();
            w.I.setMatrixAt(i, o.matrix);
          }
        }
        for (const w of alas) w.I.instanceMatrix.needsUpdate = true;
      };
      /* ── luz: el farol baña la espiral; la lámpara de la mesa, su rincón; los bordes, en verde hondo ── */
      lightPool(id, g, SX - 16, SY + 76, 180, 126, '#FFE2A0', 0.32);
      lightPool(id, g, -104, -40, 110, 84, '#FFD890', 0.2);
      layer(id, g, vignette('rgba(22,40,26,A)'), 3.5, { op: 0.6 });
      B.mesh(g);
      F.mesh(g, true);
      /* ── de cerca: los libros con lomo redondo, nervios dorados y hojas; los estantes con canto, ménsulas y barandilla; el farol, calado ── */
      deCerca(id, g, () => {
        const Q = new Bk(),
          LOMO = CYL(1, 1, 1, 4, true, -HALF, Math.PI),
          TOPE = new T3.PlaneGeometry(1, 1),
          _m = new T3.Matrix4(),
          _e = new T3.Euler(),
          _p = new T3.Vector3(),
          _s = new T3.Vector3(),
          _q = new T3.Quaternion(),
          ORO = '#E0B860',
          R1 = rf('bib-det'),
          en = (b, lx, ly, lz, sx, sy, sz, rx = 0) => {
            _e.set(rx, 0, 0);
            _q.setFromEuler(new T3.Euler(0, b.yw, b.incl));
            _p.set(lx, ly, lz)
              .applyQuaternion(_q)
              .add(new T3.Vector3(...b.pos));
            if (rx) _q.multiply(new T3.Quaternion().setFromEuler(_e));
            return _m.compose(_p, _q, _s.set(sx, sy, sz));
          };
        for (const b of LIBROS) {
          const clara = b.col === '#F3E7C8' || b.col === '#E9C99A',
            oro = clara ? '#8A5A3A' : ORO;
          Q.addM(LOMO, b.col, en(b, 0, 0, 4.5, b.w / 2, b.h, 1.4));
          /* nervios y tejuelo */
          for (const u of [0.34, -0.34]) Q.addM(LOMO, oro, en(b, 0, u * b.h, 4.5, (b.w / 2) * 1.05, 0.8, 1.5));
          if (R1(0, 1) < 0.55) Q.addM(LOMO, clara ? '#A5523A' : '#F3E7C8', en(b, 0, 0.12 * b.h, 4.5, (b.w / 2) * 1.04, b.h * 0.18, 1.48));
          /* las hojas por arriba, entre las tapas */
          Q.addM(TOPE, '#EFE3C4', en(b, 0, b.h / 2 + 0.06, 0, b.w * 0.82, 8, 1, -HALF));
        }
        /* el canto de la rampa, la barandilla y la ménsula de cada estante */
        const canto = [],
          riel = [];
        for (let i = 0; i <= N; i++) {
          const a = 2.2 + (i - 0.5) * da,
            z = 9 + (i - 0.5) * 3.5,
            r = 54 - i * 0.5 + 1;
          canto.push([SX + Math.cos(a) * r, SY + Math.sin(a) * r, z - 0.2]);
          riel.push([SX + Math.cos(a) * (r + 0.4), SY + Math.sin(a) * (r + 0.4), z + 5.4]);
        }
        tubo(Q, canto, 1.7, '#6E4A2A', 5);
        tubo(Q, riel, 0.5, '#C9A24A', 4);
        for (let i = 0; i < N; i++) {
          const a = 2.2 + i * da,
            z = 9 + i * 3.5,
            r = 54 - i * 0.5,
            ca = Math.cos(a),
            sa = Math.sin(a);
          if (i % 2 === 0)
            limb(
              Q,
              [SX + ca * (r + 1.3), SY + sa * (r + 1.3), z],
              [SX + ca * (r + 1.4), SY + sa * (r + 1.4), z + 5.8],
              0.42,
              0.42,
              '#C9A24A',
              4,
            );
          limb(Q, [SX + ca * 9, SY + sa * 9, z - 13], [SX + ca * (r - 8), SY + sa * (r - 8), z - 1.6], 1.5, 1, '#6E4A2A', 4);
        }
        /* el eje torneado y su base con clavos */
        for (let k = 0; k < 6; k++) {
          const z = 18 + k * 30;
          Q.add(TOR(10.1 - k * 0.3, 1, 4, 14), '#C9A24A', P(SX, SY, z), [HALF, 0, 0]);
        }
        Q.add(
          LATHE(
            [
              [62.2, 0],
              [62.6, 2],
              [60.5, 5.3],
              [57, 5.8],
            ],
            32,
          ),
          '#6E4A2A',
          P(SX, SY, 0),
        );
        for (let k = 0; k < 24; k++) {
          const a = (k / 24) * 6.2832;
          Q.add(SPH(1, 5, 3), '#C9A24A', P(SX + Math.cos(a) * 61, SY + Math.sin(a) * 61, 3.6), [0, 0, 0], [1, 1, 1]);
        }
        /* el farol: jaula de varillas, sombrero con escamas y remate */
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * 6.2832,
            q = [SX + Math.cos(a) * 8.6, SY + Math.sin(a) * 8.6];
          limb(Q, [q[0], q[1], 179], [q[0], q[1], 194], 0.45, 0.45, '#C9A24A', 4);
        }
        for (const z of [179.5, 193.5]) Q.add(TOR(8.8, 0.7, 4, 14), '#C9A24A', P(SX, SY, z), [HALF, 0, 0]);
        Q.add(CONE(10.4, 11, 8), '#A67C34', P(SX, SY, 199));
        for (let k = 0; k < 8; k++) {
          const a = ((k + 0.5) / 8) * 6.2832;
          limb(Q, [SX + Math.cos(a) * 10, SY + Math.sin(a) * 10, 194], [SX, SY, 205], 0.4, 0.3, '#F3D88E', 3);
        }
        Q.add(SPH(1, 7, 5), '#F3D88E', P(SX, SY, 206.5), [0, 0, 0], [2, 2, 2]);
        return { B: Q };
      });
      g.userData.tick = (t, still) => {
        vuela(still ? 0 : t, still);
        luz.material.opacity = still ? 0.5 : 0.5 + 0.06 * Math.sin(t * 1.3);
      };
      return g;
    };
  })();

  /* ═════════════════ LA ÚLTIMA CENA · la mesa larga a medio comer y el reloj parado ═════════════════ */
  const COC = (() => {
    const id = 'coc',
      R0 = rf('sala-coc'),
      TX = -5,
      TY = 208,
      SIL = TX - 136;
    for (const x of [-90, -30, 30, 90]) solid(id, TX + x, TY, 32);
    solid(id, SIL - 20, TY + 4, 22);
    /* una sola mesa: la del centro se retira (el dueño pidió dejar una) y sus platos pasan a la larga */
    CELLS[id].props = CELLS[id].props.filter((q) => q.id !== 'mesa');
    CELLS[id].solids = CELLS[id].solids.filter((q) => !(q[0] === -40 && q[1] === 60));
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        MAD = '#8A5A34',
        MADL = '#A87044',
        LOZA = '#FFFDF4';
      /* ── la mesa larga, con los veinticinco platos de aquella noche ── */
      B.add(BOX(246, 4, 46), MADL, P(TX, TY, 24));
      B.add(BOX(236, 6, 38), MAD, P(TX, TY, 19));
      for (const sx of [-112, 0, 112]) for (const sy of [-16, 16]) B.add(BOX(5, 17, 5), MAD, P(TX + sx, TY + sy, 8.5));
      B.add(BOX(238, 0.8, 22), '#FBF4E3', P(TX, TY, 26.4));
      for (const sy of [-8, 8]) B.add(BOX(238, 0.9, 2), '#E4A844', P(TX, TY + sy, 26.5));
      const PLATOS = [];
      const plato = (x, y, k) => {
        PLATOS.push([x, y, k]);
        B.add(CYL(6.2, 4.6, 1.4, 10), LOZA, P(x, y, 27.4));
        if (k % 3) B.add(BOX(4.2, 2.4, 3.4), k % 2 ? '#E4A844' : '#C9873C', P(x + 0.6, y, 29), [0, k * 1.3, 0]);
        if (k % 2) B.add(CYL(1.9, 1.5, 3.8, 6), '#C9873C', P(x + 8.5, y - 2, 28.6));
      };
      for (let k = 0; k < 12; k++) {
        plato(TX - 99 + k * 18, TY - 15, k);
        plato(TX - 99 + k * 18, TY + 15, k + 4);
      }
      B.add(CYL(6.2, 4.6, 1.4, 10), LOZA, P(TX - 114, TY, 27.4));
      /* el pastel de miel sin terminar, la jarra y tres candeleros: solo una vela sigue encendida */
      B.add(CYL(9, 9, 5, 12, false, 0, 5.1), '#E9B24A', P(TX + 36, TY, 29.4));
      B.add(CYL(9.4, 9.4, 1.2, 12, false, 0, 5.1), '#FBE7B4', P(TX + 36, TY, 32.4));
      B.add(CYL(3.6, 5, 11, 8), '#C9694B', P(TX - 36, TY, 32.4));
      [
        [-72, 4],
        [0, 10],
        [72, 3],
      ].forEach(([x, h]) => {
        B.add(CYL(1.4, 2.8, 3, 8), '#C9A24A', P(TX + x, TY, 28.4));
        B.add(CYL(1.3, 1.3, h, 6), '#FBF4E3', P(TX + x, TY, 30 + h / 2));
      });
      const llama = glowSprite('#FFC870', 44);
      llama.position.set(...P(TX, TY, 44));
      g.add(llama);
      B.add(CONE(1.4, 4.6, 5), '#FFD36A', P(TX, TY, 42.4));
      /* los bancos, a los dos lados */
      for (const sy of [-33, 33]) {
        B.add(BOX(222, 3, 11), MAD, P(TX, TY + sy, 13));
        for (const sx of [-100, 0, 100]) B.add(BOX(4, 12, 9), '#6E4A2A', P(TX + sx, TY + sy, 6));
      }
      /* la silla de Amaranta, caída de espaldas en la cabecera */
      B.add(BOX(26, 3, 16), MADL, P(SIL - 31, TY + 4, 1.5));
      B.add(BOX(3, 16, 16), MAD, P(SIL - 18, TY + 4, 8));
      B.add(BOX(1.6, 12, 12), '#E4A844', P(SIL - 20, TY + 4, 8));
      for (const [sy, z] of [
        [-6.5, 1.5],
        [6.5, 1.5],
        [-6.5, 14.5],
        [6.5, 14.5],
      ])
        B.add(BOX(18, 2.4, 2.4), '#6E4A2A', P(SIL - 9, TY + 4 + sy, z));
      /* ── en altura, una sola cosa: el reloj parado sobre la puerta del fondo, asomando por encima del muro ── */
      esfera(B, 0, -254, 132, 27, '#D89A45', 6);
      B.add(BOX(12, 5, 8), MAD, P(0, -256, 100));
      /* ── suelo: baldosa de barro en damero, hollín junto al horno y una estera bajo la mesa larga ── */
      const fl = ctex(512, 512, (c, w) => {
        const R1 = rf('coc-suelo'),
          n = 12,
          q = w / n;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const v = Math.round(R1(-7, 7));
            c.fillStyle = (i + j) % 2 ? `rgb(${216 + v},${156 + v},${112 + v})` : `rgb(${200 + v},${136 + v},${94 + v})`;
            c.fillRect(i * q, j * q, q, q);
          }
        c.fillStyle = 'rgba(250,232,200,.5)';
        for (let i = 0; i <= n; i++) {
          c.fillRect(i * q - 1, 0, 2, w);
          c.fillRect(0, i * q - 1, w, 2);
        }
        blobs(c, w, w, 26, R1, ['rgba(236,180,130,A)', 'rgba(150,84,50,A)'], 30, 90, 0.26);
        const h = c.createRadialGradient(tx(160, w), ty(-120, w), 20, tx(160, w), ty(-120, w), 110);
        h.addColorStop(0, 'rgba(60,34,24,.5)');
        h.addColorStop(1, 'rgba(60,34,24,0)');
        c.fillStyle = h;
        c.fillRect(0, 0, w, w);
        const x0 = tx(TX - 136, w),
          x1 = tx(TX + 136, w),
          y0 = ty(TY + 44, w),
          y1 = ty(TY - 44, w);
        c.fillStyle = '#B9583F';
        c.fillRect(x0, y0, x1 - x0, y1 - y0);
        c.fillStyle = 'rgba(243,223,180,.85)';
        for (const u of [0.1, 0.9]) c.fillRect(x0, y0 + (y1 - y0) * u - 2, x1 - x0, 4);
        c.fillStyle = 'rgba(228,168,68,.7)';
        c.fillRect(x0, y0 + (y1 - y0) * 0.5 - 1, x1 - x0, 2);
      });
      texFloor(id, g, fl);
      /* ── luz: la vela que queda sobre la mesa y el rescoldo del horno; los bordes, en tierra tostada ── */
      const pool = lightPool(id, g, TX, TY - 14, 200, 84, '#FFD08A', 0.36);
      lightPool(id, g, 140, -90, 120, 90, '#FFB870', 0.2);
      layer(id, g, vignette('rgba(70,30,14,A)'), 3.5, { op: 0.55 });
      B.mesh(g);
      F.mesh(g, true);
      /* ── de cerca: la cena a medio comer. Loza con filete, cubiertos, migas, el pastel cortado, cera corrida; la mesa, de tablas y patas torneadas ── */
      deCerca(id, g, () => {
        const Q = new Bk(),
          R1 = rf('coc-det'),
          FIL = '#C9A24A',
          ZP = 28.15,
          PERF = [
            [0, 0.02],
            [4.1, 0.02],
            [5, 0.14],
            [7, 0.82],
            [5, -0.9],
            [4.5, -1.3],
          ],
          ANI = [
            [5.9, 0.52],
            [6.3, 0.66],
          ],
          CUE = [
            [2.1, 1.9],
            [2.28, 2],
            [1.6, -1.9],
            [0, -2],
          ];
        const sitio = ([x, y, k]) => {
          /* el plato: loza, filete dorado y el resto de la cena */
          Q.add(LATHE(PERF, 12), LOZA, P(x, y, ZP));
          Q.add(LATHE(ANI, 12), FIL, P(x, y, ZP));
          const sn = y < TY ? -1 : 1;
          if (k % 3) {
            const c = k % 2 ? '#E4A844' : '#C9873C',
              a = k * 1.3;
            Q.add(BLQ(), c, P(x + 0.6, y, 29.2), [0, a, 0], [5.4, 3.3, 4.4]);
            Q.add(BX, '#FBE7B4', P(x + 0.6, y, 30.8), [0, a, 0], [4.2, 0.6, 3.2]);
            for (let i = 0; i < 3; i++) {
              const b = R1(0, 6.2832),
                d = R1(3.4, 5.2);
              Q.add(BX, c, P(x + Math.cos(b) * d, y + Math.sin(b) * d, ZP + 0.35), [0, b, 0], [R1(0.5, 1.2), 0.5, R1(0.5, 1)]);
            }
          } else {
            /* un plato rebañado: la mancha de miel y la cuchara dentro */
            Q.add(CYL(1, 1, 1, 10), '#D89A3C', P(x - 1, y + 0.6, ZP + 0.05), [0, 0, 0], [3, 0.06, 2.3]);
          }
          /* cubiertos: el tenedor a un lado; la cuchara, apoyada en el plato */
          const fx = x - 8.2;
          Q.add(BX, '#C8C2B0', P(fx, y, ZP - 0.95), [0, 0.05, 0], [0.7, 0.3, 7]);
          Q.add(BX, '#C8C2B0', P(fx, y - sn * 4.3, ZP - 0.95), [0, 0.05, 0], [1.6, 0.3, 2]);
          for (const u of [-0.5, 0.5]) Q.add(BX, '#C8C2B0', P(fx + u, y - sn * 6.2, ZP - 0.9), [0, 0.05, 0], [0.34, 0.25, 2]);
          limb(Q, [x + 2.5, y + sn * 2.5, ZP + 0.3], [x + 7.6, y + sn * 6.6, ZP + 0.9], 0.3, 0.26, '#C8C2B0', 3);
          Q.add(SPH(1, 5, 3), '#D8D2C0', P(x + 1.6, y + sn * 1.8, ZP + 0.3), [0, 0.6, 0], [1.5, 0.45, 1.1]);
        };
        PLATOS.forEach(sitio);
        Q.add(LATHE(PERF, 12), LOZA, P(TX - 114, TY, ZP));
        Q.add(LATHE(ANI, 12), FIL, P(TX - 114, TY, ZP));
        /* las jarritas, con su asa y un fondo de miel */
        for (const [x, y, k] of PLATOS)
          if (k % 2) {
            const cx = x + 8.5,
              cy = y - 2;
            Q.add(LATHE(CUE, 8), '#C9873C', P(cx, cy, 28.6));
            Q.add(CIRC(2.02, 8), '#6A3E1A', P(cx, cy, 30.15), [-HALF, 0, 0]);
            Q.add(TOR(1.1, 0.27, 3, 6, Math.PI), '#A86E2E', P(cx + 2.05, cy, 28.7), [0, 0, -HALF]);
          }
        /* el pastel: bizcocho en capas, cortes, glaseado que chorrea y la porción que falta */
        const PZ = TX + 36,
          PC = 29.4,
          AR = 5.1;
        Q.add(CYL(1, 1, 1, 26, true, 0, AR), '#E9B24A', P(PZ, TY, PC), [0, 0, 0], [9.25, 5.3, 9.25]);
        Q.add(CYL(1, 1, 1, 26, true, 0, AR), '#FBE7B4', P(PZ, TY, PC - 0.1), [0, 0, 0], [9.32, 0.8, 9.32]);
        Q.add(
          LATHE(
            [
              [9.75, -0.6],
              [9.8, 0],
              [9.2, 0.7],
              [0, 0.85],
            ],
            26,
            0,
            AR,
          ),
          '#FFF2CC',
          P(PZ, TY, 32.5),
        );
        for (const th of [0, AR]) {
          const sn = Math.sin(th),
            cs = Math.cos(th),
            a = th - HALF;
          Q.add(BX, '#E9B24A', P(PZ + sn * 4.65, TY + cs * 4.65, PC), [0, a, 0], [9.3, 5.3, 0.1]);
          Q.add(BX, '#FBE7B4', P(PZ + sn * 4.65, TY + cs * 4.65, PC + 0.1), [0, a, 0], [9.3, 0.8, 0.14]);
        }
        for (let k = 0; k < 16; k++) {
          const th = (k / 16) * AR + 0.1,
            h = R1(1.2, 3.4);
          Q.add(
            SPH(1, 5, 4),
            '#FFF2CC',
            P(PZ + Math.sin(th) * 9.45, TY + Math.cos(th) * 9.45, 32.2 - h / 2),
            [0, 0, 0],
            [0.9, h / 2 + 0.3, 0.6],
          );
        }
        for (let k = 0; k < 7; k++) {
          const th = (k / 7) * AR + 0.3;
          Q.add(
            SPH(1, 5, 3),
            k % 2 ? '#D8542E' : '#E4A844',
            P(PZ + Math.sin(th) * 6.4, TY + Math.cos(th) * 6.4, 33.5),
            [0, 0, 0],
            [0.9, 0.7, 0.9],
          );
        }
        /* la jarra de barro, panzuda, con asa y pico */
        Q.add(
          LATHE(
            [
              [0, -5.6],
              [5.5, -5.6],
              [6.2, -3],
              [5.7, 0],
              [4.3, 3.5],
              [3.95, 5],
              [4.7, 5.9],
              [3.6, 5.5],
              [3.4, 3],
            ],
            14,
          ),
          '#C9694B',
          P(TX - 36, TY, 32.4),
        );
        tubo(
          Q,
          [
            [TX - 31.5, TY, 37],
            [TX - 28.6, TY, 37],
            [TX - 27.2, TY, 34],
            [TX - 28.4, TY, 31],
            [TX - 30.6, TY, 29.6],
          ],
          0.8,
          '#A85538',
          5,
        );
        Q.add(CONE(1.5, 3, 5), '#C9694B', P(TX - 40.8, TY, 37.6), [0, 0, 1.2]);
        Q.add(TOR(5.92, 0.15, 3, 18), '#F3DFB4', P(TX - 36, TY, 32.4), [HALF, 0, 0]);
        /* los candeleros, con la cera corrida; dos apagados, con la mecha negra */
        [
          [-72, 4],
          [0, 10],
          [72, 3],
        ].forEach(([x, h]) => {
          const cx = TX + x,
            tope = 30 + h;
          Q.add(
            LATHE(
              [
                [0, 0],
                [3.2, 0],
                [3.4, 0.5],
                [1.8, 1.2],
                [1, 2],
                [1.2, 2.6],
                [2.4, 3.2],
                [2.6, 3.8],
                [1.4, 3.9],
              ],
              12,
            ),
            '#C9A24A',
            P(cx, TY, 26.85),
          );
          if (x) limb(Q, [cx, TY, tope], [cx + 0.2, TY, tope + 1.6], 0.2, 0.18, '#2A2018', 3);
          for (let k = 0; k < 4; k++) {
            const a = k * 1.7 + x,
              L = R1(1.5, Math.max(2, h - 0.5));
            Q.add(
              SPH(1, 5, 4),
              '#FFF9EA',
              P(cx + Math.cos(a) * 1.3, TY + Math.sin(a) * 1.3, tope - L / 2),
              [0, 0, 0],
              [0.5, L / 2 + 0.2, 0.5],
            );
          }
          Q.add(CYL(1, 1, 1, 8), '#FFF9EA', P(cx, TY, tope + 0.05), [0, 0, 0], [1.55, 0.45, 1.55]);
          Q.add(CYL(1, 1, 1, 10), '#FFF9EA', P(cx, TY, 30.6), [0, 0, 0], [2.7, 0.3, 2.7]);
        });
        /* la mesa: juntas y fendas en las tablas, canto moldurado, encaje del camino, patas torneadas y travesaño */
        for (const y of [-19, -15, 15, 19]) Q.add(BX, '#6E4A2A', P(TX, TY + y, 26.03), [0, 0, 0], [245, 0.08, 0.35]);
        for (const y of [-21, -17, -13, 13, 17, 21])
          for (let k = 0; k < 2; k++) Q.add(BX, '#6E4A2A', P(TX + R1(-110, 110), TY + y, 26.03), [0, 0, 0], [0.35, 0.08, 3.8]);
        for (const y of [-1, 1]) {
          Q.add(CYL(1.2, 1.2, 246.8, 6), '#94603A', P(TX, TY + y * 23.1, 24), [0, 0, HALF]);
          Q.add(CYL(0.7, 0.7, 236.8, 6), '#6E4A2A', P(TX, TY + y * 19.2, 16.2), [0, 0, HALF]);
          for (let k = 0; k < 30; k++) {
            const x = TX - 116 + k * 8;
            Q.add(CIRC(1.9, 5, 0, Math.PI), '#FBF4E3', P(x, TY + y * 11, 26.86), [-HALF, 0, y > 0 ? Math.PI : 0], [1, 1, 1]);
          }
        }
        for (const sx of [-112, 0, 112])
          for (const sy of [-16, 16]) {
            Q.add(
              LATHE(
                [
                  [2.7, 0],
                  [3.9, 0.6],
                  [3.9, 2],
                  [2.3, 4],
                  [3.5, 6.5],
                  [3.5, 8],
                  [2.2, 10],
                  [3.8, 13],
                  [3.9, 16.2],
                ],
                9,
              ),
              '#8A5A34',
              P(TX + sx, TY + sy, 0),
            );
          }
        Q.add(BX, '#6E4A2A', P(TX, TY, 5.5), [0, 0, 0], [226, 2.2, 3]);
        for (const sx of [-112, 0, 112]) Q.add(BX, '#6E4A2A', P(TX + sx, TY, 5.5), [0, 0, 0], [3, 2.2, 32]);
        /* los bancos: tablas con canto y clavos */
        for (const sy of [-33, 33]) {
          for (const u of [-1, 1]) Q.add(CYL(0.8, 0.8, 223, 6), '#94603A', P(TX, TY + sy + u * 5.3, 14), [0, 0, HALF]);
          Q.add(BX, '#6E4A2A', P(TX, TY + sy, 14.53), [0, 0, 0], [221, 0.08, 0.3]);
          for (const sx of [-100, 0, 100])
            for (const u of [-3, 3]) Q.add(SPH(1, 5, 3), '#4A3222', P(TX + sx, TY + sy + u, 14.55), [0, 0, 0], [0.5, 0.25, 0.5]);
        }
        return { B: Q };
      });
      /* ── el único movimiento: la llama de la última vela ── */
      g.userData.tick = (t, still) => {
        const k = still ? 1 : 0.86 + 0.14 * Math.sin(t * 7.3) * Math.sin(t * 2.1);
        llama.material.opacity = 0.6 * k;
        pool.material.opacity = 0.34 * k;
      };
      return g;
    };
  })();

  /* ═════════════════ COLMENAR · la torre de colmenas apiladas y el enjambre que sale ═════════════════ */
  const COL = (() => {
    const id = 'col',
      TWX = 126,
      TWY = -220,
      YAW = Math.atan2(-TWX, -TWY),
      FX = Math.sin(YAW),
      FY = Math.cos(YAW);
    solid(id, TWX, TWY, 36);
    return () => {
      const g = new T3.Group(),
        B = new Bk(),
        F = new Bk(),
        MIEL = '#E4A844';
      /* ── la torre: cinco colmenas de madera apiladas, cada una un poco torcida, con su piquera y su tejadillo ── */
      for (const [sx, sy] of [
        [-22, -22],
        [22, -22],
        [-22, 22],
        [22, 22],
      ])
        B.add(BOX(6, 8, 6), '#7A5232', P(TWX + sx, TWY + sy, 4));
      let wTop = 0;
      const CAJAS = [];
      [0.06, -0.1, 0.08, -0.05, 0.1].forEach((dy, k) => {
        const w = 62 - k * 5,
          z0 = 8 + k * 24,
          yw = YAW + dy,
          fx = Math.sin(yw),
          fy = Math.cos(yw),
          x = TWX + [0, 2, -2, 1, -1][k],
          y = TWY;
        B.add(BOX(w, 22, w), k % 2 ? '#EFE2C4' : '#F8F1DE', P(x, y, z0 + 13), [0, yw, 0]);
        B.add(BOX(w + 3, 3, w + 3), k === 2 ? MIEL : '#D89A45', P(x, y, z0 + 1.5), [0, yw, 0]);
        B.add(BOX(16, 4, 1.6), '#4A3222', P(x + fx * (w / 2 + 0.4), y + fy * (w / 2 + 0.4), z0 + 8), [0, yw, 0]);
        B.add(BOX(22, 1.6, 7), '#B8783A', P(x + fx * (w / 2 + 3), y + fy * (w / 2 + 3), z0 + 4.4), [0, yw, 0]);
        CAJAS.push({ k, w, z0, yw, x, y });
        wTop = w;
      });
      B.add(BOX(wTop + 12, 3, wTop + 12), '#8A5A34', P(TWX, TWY, 129.5), [0, YAW, 0]);
      B.add(CYL(23, 23, wTop + 14, 3, false, HALF), '#B8783A', P(TWX, TWY, 142.5), [0, YAW, HALF]);
      /* la miel que rebosa de la tercera colmena y gotea hasta el suelo */
      {
        const x = TWX + FX * 27 + FY * 14,
          y = TWY + FY * 27 - FX * 14;
        limb(B, [x, y, 58], [x, y, 30], 2.4, 1.2, MIEL, 5);
        B.add(SPH(2.6, 6, 5), MIEL, P(x, y, 27), [0, 0, 0], [1, 1.5, 1]);
      }
      const halo = glowSprite('#FFE08A', 130);
      halo.position.set(...P(TWX + FX * 30, TWY + FY * 30, 100));
      halo.material.opacity = 0.26;
      g.add(halo);
      /* ── suelo: cera clara con el dibujo grande del panal, algunas celdas llenas y un charco de miel al pie ── */
      const fl = ctex(512, 512, (c, w) => {
        c.fillStyle = '#F2DDA4';
        c.fillRect(0, 0, w, w);
        const R1 = rf('col-suelo'),
          k = w / (2 * R),
          r = 44;
        blobs(c, w, w, 38, R1, ['rgba(252,238,196,A)', 'rgba(226,186,110,A)'], 30, 90, 0.45);
        c.strokeStyle = 'rgba(204,146,56,.34)';
        c.lineWidth = 2.2;
        for (let i = -6; i <= 6; i++)
          for (let j = -7; j <= 7; j++) {
            const x = 1.5 * r * i,
              y = Math.sqrt(3) * r * (j + (i & 1) / 2);
            c.beginPath();
            for (let v = 0; v < 6; v++) c.lineTo(tx(x + Math.cos(v * 1.0472) * (r - 3), w), ty(y + Math.sin(v * 1.0472) * (r - 3), w));
            c.closePath();
            if (R1(0, 1) < 0.1) {
              c.fillStyle = 'rgba(236,176,66,.3)';
              c.fill();
            }
            c.stroke();
          }
        const px = tx(TWX + FX * 54, w),
          py = ty(TWY + FY * 54, w),
          h = c.createRadialGradient(px, py, 4, px, py, 34 * k);
        h.addColorStop(0, 'rgba(226,150,40,.85)');
        h.addColorStop(0.7, 'rgba(232,168,60,.6)');
        h.addColorStop(1, 'rgba(232,168,60,0)');
        c.fillStyle = h;
        c.fillRect(0, 0, w, w);
      });
      texFloor(id, g, fl);
      /* ── en altura, una sola cosa (y el único movimiento): el enjambre que sale de las piqueras y vuelve ── */
      const AB = new Bk();
      AB.add(SPH(2.6, 6, 5), '#F5CE55', [0, 0, 0], [0, 0, 0], [1, 1, 1.6]);
      for (const z of [-1.4, 1.2]) AB.add(CYL(2.66, 2.66, 1, 6), '#4A3222', [0, 0, z], [HALF, 0, 0]);
      for (const sx of [-1, 1]) AB.add(SPH(2.6, 5, 4), '#FFFFFF', [sx * 2.6, 2.1, -0.4], [0, 0, sx * 0.5], [1, 0.14, 0.6]);
      const NA = 24,
        I = new T3.InstancedMesh(AB.geo(), keep(id, new T3.MeshLambertMaterial({ vertexColors: true })), NA),
        o = new T3.Object3D(),
        RUTA = [
          [0.15, 122, 46, 124, 92],
          [-0.55, 92, 36, 100, 80],
          [0.7, 72, 30, 76, 68],
        ],
        A0 = Math.atan2(FY, FX);
      I.frustumCulled = false;
      g.add(I);
      const en = (k, u, i) => {
        const [da, A, W, z0, z1] = RUTA[k],
          a = u * 6.283,
          dx = Math.cos(A0 + da),
          dy = Math.sin(A0 + da),
          al = A * (1 - Math.cos(a)),
          sd = W * Math.sin(a);
        return [
          TWX + FX * 30 + dx * al - dy * sd,
          TWY + FY * 30 + dy * al + dx * sd,
          z0 + ((z1 - z0) * (1 - Math.cos(a))) / 2 + 5 * Math.sin(a * 3 + i),
        ];
      };
      const enjambre = (t) => {
        for (let i = 0; i < NA; i++) {
          const k = i % 3,
            u = (t * 0.05 * (1 + 0.25 * k) + i / NA + (i % 5) * 0.013) % 1,
            p = en(k, u, i),
            q = en(k, u + 0.01, i);
          o.position.set(...P(...p));
          o.rotation.set(0, Math.atan2(q[0] - p[0], q[1] - p[1]), 0);
          o.updateMatrix();
          I.setMatrixAt(i, o.matrix);
        }
        I.instanceMatrix.needsUpdate = true;
      };
      /* ── luz: sol de miel al pie de la torre; los bordes, en ámbar ── */
      lightPool(id, g, TWX - 60, TWY + 90, 200, 136, '#FFE08A', 0.34);
      layer(id, g, vignette('rgba(120,72,14,A)'), 3.5, { op: 0.5 });
      B.mesh(g);
      F.mesh(g, true);
      /* ── de cerca: colmenas de tablas con la pintura gastada, piqueras con su cera y su propóleo, tejadillo de tablillas ── */
      deCerca(id, g, () => {
        const Q = new Bk(),
          R1 = rf('col-det'),
          CLAROS = ['#F8F1DE', '#EFE2C4', '#F4E9CF', '#E6D6B4', '#F1E6CC'],
          GRIS = ['#D8CAA8', '#CFC09C', '#E0D2B0'];
        for (const { k, w, z0, yw, x, y } of CAJAS) {
          const fx = Math.sin(yw),
            fy = Math.cos(yw),
            rx = Math.cos(yw),
            ry = -Math.sin(yw),
            L = (u, f, z) => [x + rx * u + fx * f, y + ry * u + fy * f, z],
            h2 = w / 2;
          /* las tablas de los cuatro lados, con tablas desgastadas sueltas */
          for (let b = 0; b < 5; b++) {
            const z = z0 + 3 + 2 + b * 4.4 + 0.2;
            for (let s = 0; s < 4; s++) {
              const a = yw + (s * Math.PI) / 2,
                col = R1(0, 1) < 0.2 ? GRIS[Math.floor(R1(0, 3))] : CLAROS[(k % 2) * 1 + ((b + s) % 3)];
              Q.add(BX, col, P(x + Math.sin(a) * (h2 + 0.35), y + Math.cos(a) * (h2 + 0.35), z), [0, a, 0], [w + 0.5, 4, 0.9]);
            }
          }
          /* esquineros, clavos y el asidero de los lados */
          for (const [su, sf] of [
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ]) {
            Q.add(BX, '#C8B48C', P(...L(su * (h2 + 0.2), sf * (h2 + 0.2), z0 + 13.5)), [0, yw, 0], [3.2, 22, 3.2]);
            for (const z of [z0 + 6, z0 + 13, z0 + 20])
              Q.add(SPH(1, 4, 3), '#6A5A48', P(...L(su * (h2 - 3), sf * (h2 + 1.05), z)), [0, 0, 0], [0.5, 0.5, 0.3]);
          }
          for (const su of [-1, 1]) {
            Q.add(BX, '#A87C4A', P(...L(su * (h2 + 1.3), 0, z0 + 17)), [0, yw, 0], [1.6, 2.2, 15]);
            Q.add(BX, '#6A5236', P(...L(su * (h2 + 0.95), 0, z0 + 15.2)), [0, yw, 0], [0.5, 1.4, 12]);
          }
          /* la piquera: marco, dientes de la reductora, tablilla con su mensulilla y el rastro de propóleo */
          const F0 = h2 + 0.9,
            ZP = z0 + 8;
          Q.add(BX, '#4A3222', P(...L(0, F0, ZP)), [0, yw, 0], [16.4, 4.4, 0.2]);
          Q.add(BX, '#A87C4A', P(...L(0, F0 + 0.3, ZP + 3.2)), [0, yw, 0], [20, 2, 1]);
          for (const u of [-1, 1]) Q.add(BX, '#A87C4A', P(...L(u * 9.6, F0 + 0.3, ZP + 0.4)), [0, yw, 0], [1.8, 6.6, 1]);
          for (let t = 0; t < 6; t++) Q.add(BX, '#A87C4A', P(...L(-6.5 + t * 2.6, F0 + 0.2, ZP - 1.3)), [0, yw, 0], [1, 2, 0.7]);
          for (const u of [-8, 8]) Q.add(BX, '#8A5A34', P(...L(u, h2 + 3.5, z0 + 2.4)), [-0.2, yw, 0], [2, 3, 5.4]);
          for (let t = 0; t < 5; t++)
            Q.add(
              BX,
              t % 2 ? '#D8A040' : '#C07A2E',
              P(...L(-8 + t * 4, h2 + 2.5 + (t % 2) * 2, z0 + 5.35)),
              [0, yw, 0],
              [R1(1.6, 3), 0.18, R1(1.5, 3.4)],
            );
          /* el tornillo y la chapa con el número de la caja */
          Q.add(BX, '#C9A24A', P(...L(0, h2 + 0.95, z0 + 18)), [0, yw, 0], [8.5, 4.6, 0.3]);
          for (let t = 0; t <= k; t++) Q.add(BX, '#5A3A22', P(...L((t - k / 2) * 1.5, h2 + 1.15, z0 + 18)), [0, yw, 0], [0.5, 2.8, 0.1]);
          /* el reborde de la tapa */
          for (let s = 0; s < 4; s++) {
            const a = yw + (s * Math.PI) / 2;
            Q.add(CYL(0.9, 0.9, w + 3.2, 5), '#E4B060', P(x + Math.sin(a) * (h2 + 1.7), y + Math.cos(a) * (h2 + 1.7), z0 + 3), [
              0,
              a,
              HALF,
            ]);
          }
        }
        /* la tercera colmena rebosa: panal roto asomando por la junta, con celdas llenas y miel que baja */
        {
          const x0 = TWX + FX * 27 + FY * 14,
            y0 = TWY + FY * 27 - FX * 14;
          for (let i = 0; i < 16; i++) {
            const c = i % 4,
              f = Math.floor(i / 4),
              u = (c - 1.5) * 4.8 + (f % 2) * 2.4,
              z = 67 - f * 4.1;
            pon(
              Q,
              CYL(2.5, 2.5, 1.4, 6),
              i % 3 ? '#E8B64C' : '#C98A2A',
              [x0 + FY * u + FX * 1.6, y0 - FX * u + FY * 1.6, z],
              [FX, FY, 0],
              [0, 0, 1],
            );
          }
          const P2 = [];
          for (let i = 0; i <= 12; i++) {
            const t = i / 12;
            P2.push([x0 + Math.sin(t * 6) * 0.9, y0 + FY * 0.9 + Math.cos(t * 5) * 0.5, 60 - t * 32]);
          }
          tubo(Q, P2, (u) => 2.6 - 1.2 * Math.sin(u * 3) + (u > 0.9 ? 0.8 : 0), MIEL, 7);
          Q.add(CYL(1, 1, 1, 12), '#D89A32', P(x0 + 1, y0, 0.2), [0, 0, 0], [9, 0.4, 7]);
          for (let i = 0; i < 4; i++)
            Q.add(SPH(1, 6, 4), MIEL, P(x0 + R1(-8, 8), y0 + R1(-6, 6), 0.4), [0, 0, 0], [R1(2, 4), 0.6, R1(2, 3.4)]);
        }
        /* el tejadillo de tablillas, con caballete y la tabla de la cumbrera; las patas, con su pie de piedra */
        {
          const wr = wTop + 14,
            RXv = Math.cos(YAW),
            RYv = -Math.sin(YAW),
            sl = Math.hypot(19.92, 34.5),
            FIL = 7,
            POR = 9;
          for (const sd of [-1, 1]) {
            const dir = [(-FX * sd * 19.92) / sl, (-FY * sd * 19.92) / sl, 34.5 / sl],
              nr = [(FX * sd * 34.5) / sl, (FY * sd * 34.5) / sl, 19.92 / sl];
            for (let i = 0; i < FIL; i++) {
              const t = (i + 0.45) / FIL;
              for (let k = 0; k < POR; k++) {
                const u = -wr / 2 + ((k + 0.5 + (i % 2) * 0.5 - (i % 2 ? 0.25 : 0)) * wr) / POR,
                  f = sd * 19.92 * (1 - t),
                  z = 131 + 34.5 * t;
                pon(
                  Q,
                  BX,
                  ['#B8783A', '#A86C34', '#C28444', '#9C6230'][Math.floor(R1(0, 4))],
                  [TWX + RXv * u + FX * f + nr[0] * 0.8, TWY + RYv * u + FY * f + nr[1] * 0.8, z + nr[2] * 0.8],
                  dir,
                  nr,
                  [wr / POR + 0.2, (sl / FIL) * 1.32, 0.9],
                );
              }
            }
          }
          Q.add(CYL(2.2, 2.2, wr + 2, 7), '#8A5A34', P(TWX, TWY, 165.8), [0, YAW, HALF]);
          for (const sd of [-1, 1]) {
            const x = TWX + RXv * sd * (wr / 2 + 0.3),
              y = TWY + RYv * sd * (wr / 2 + 0.3);
            for (const s2 of [-1, 1]) {
              const a = [x + FX * s2 * 21, y + FY * s2 * 21, 129],
                b = [x, y, 167];
              limb(Q, a, b, 1.5, 1.5, '#8A5A34', 5);
            }
            Q.add(CYL(3, 3, 1, 6), '#D89A45', P(x, y, 142), [0, YAW, HALF]);
            Q.add(CYL(1.9, 1.9, 1.2, 6), '#4A3222', P(x + RXv * sd * 0.2, y + RYv * sd * 0.2, 142), [0, YAW, HALF]);
          }
        }
        for (const [sx, sy] of [
          [-22, -22],
          [22, -22],
          [-22, 22],
          [22, 22],
        ])
          Q.add(BLQ(), '#A89C88', P(TWX + sx, TWY + sy, 1.2), [0, sx * 0.03, 0], [12, 3, 12]);
        return { B: Q };
      });
      g.userData.tick = (t, still) => enjambre(still ? 0 : t);
      return g;
    };
  })();

  SALAS.add('rel', [], REL, { hideTiles: 1, noRug: 1 });
  SALAS.add('bib', [], BIB, { hideTiles: 1, noRug: 1 });
  SALAS.add('coc', [], COC, { hideTiles: 1, noRug: 1 });
  SALAS.add('col', ['flowers'], COL, { hideTiles: 1, noRug: 1, noLife: 1 });
})();
