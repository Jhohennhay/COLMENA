// Pruebas de la historia: juegan la partida de verdad (hablar, recoger, ganar minijuegos) y comprueban
// que cada paso abre el siguiente. Donde el juego pide habilidad o paciencia (minijuegos, rastro),
// se da por ganado con la misma función que usa el juego o se inyecta el estado, y se dice en el comentario.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const URL = pathToFileURL(join(process.cwd(), 'dist/colmena.html')).href;
const ev = (page, fn, arg) => page.evaluate(fn, arg);

async function nueva(page) {
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#bnew')).toBeVisible();
  await page.click('#bnew');
  await expect(page.locator('#creator')).toBeVisible();
  await page.click('#crok');
  await expect(page.locator('.tut')).toBeVisible({ timeout: 45_000 }); // el tutorial espera a que Amaranta termine de hablar
  return errores;
}

// Viaja a una celda solo si la historia ya la ha abierto.
async function ir(page, id) {
  expect(await ev(page, (id) => PUZ.cellLocked(id), id), `la celda ${id} debería estar abierta`).toBe(false);
  if (await ev(page, (id) => cur === id, id)) return;
  await ev(page, (id) => fastTravel(id), id);
  await expect.poll(() => ev(page, () => cur), { timeout: 15_000 }).toBe(id);
  await page.waitForTimeout(350);
}

// Pasa las líneas del diálogo abierto hasta que se cierra. Si acaba en elecciones, las devuelve sin elegir.
async function pasar(page) {
  for (let n = 0; n < 40; n++) {
    const s = await ev(page, () => {
      if (!talking) return 'fin';
      if (DLG && DLG.choices && !document.getElementById('dch').hidden) return 'elige';
      talk(); return 'sigue';
    });
    if (s === 'fin') return null;
    if (s === 'elige') return ev(page, () => [...document.querySelectorAll('#dch button')].map((b) => b.textContent));
  }
  throw new Error('el diálogo no termina');
}

// Habla con el vecino de la celda. Devuelve las elecciones si las hay.
// Antes se coloca al lado: el juego cierra la conversación si el jugador no está junto al vecino.
async function hablar(page) {
  await ev(page, () => { const n = CELLS[cur].npc; Pl.route = null; Pl.goal = null; Pl.x = n.x + 30; Pl.y = n.y + 24; nearObj = { kind: 'npc' }; near = true; if (!talking) talk(); });
  const ch = await pasar(page);
  await page.waitForTimeout(420); // DLG.after (abrir minijuego) se lanza 260 ms después de cerrar
  return ch;
}

// Usa un objeto del cuarto por su id; falla si la historia todavía no lo muestra.
async function usar(page, id) {
  const ok = await ev(page, (id) => { const t = thingsHere().find((t) => t.id === id); if (!t) return false; act(t); return true; }, id);
  expect(ok, `«${id}» debería poder usarse en ${await ev(page, () => cur)}`).toBe(true);
}

// Da por ganado el minijuego abierto con la misma función que llama el juego al acertar.
async function ganar(page, clave, st) {
  await expect.poll(() => ev(page, () => GAME && GAME.key), { timeout: 5_000, message: `minijuego ${clave}` }).toBe(clave);
  await ev(page, (st) => { Object.assign(GAME.st, st || {}); GAME.def.finish(GAME.st); }, st);
  await expect.poll(() => ev(page, () => !GAME), { timeout: 5_000 }).toBe(true);
  await page.waitForTimeout(200);
  await pasar(page);
  await page.waitForTimeout(450);
}

const F = (page) => ev(page, () => JSON.parse(JSON.stringify(PROG.F)));
const mochila = (page) => ev(page, () => PROG.bag.slice());
const objetivo = (page) => ev(page, () => PUZ.goal());

// Estado de una partida con los dos primeros sellos encendidos, tal como lo deja el juego.
const DOS_SELLOS = { done: 1, star: 1, bloom: 1, melted: 1, bridge: 1, floe: 1, inkFixed: 1, askSun: 1, gotSun: 1, askIce: 1, askWater: 1, tookWater: 1, tookIce: 1, askLens: 1, gotLens: 1, askPearl: 1, gotPearl: 1, askAurora: 1, gotAurora: 1 };
async function inyectar(page, extra) {
  await ev(page, (f) => { Object.assign(PROG.F, f); PROG.bag.length = 0; stateChanged(); }, { ...DOS_SELLOS, ...(extra || {}) });
}

test.describe('la historia', () => {
  test.setTimeout(360_000);

  test('capítulos 1 y 2: la cadena de favores enciende los dos primeros sellos', async ({ page }) => {
    const errores = await nueva(page);
    expect(await objetivo(page)).toBe('Habla con Brote');
    expect(await ev(page, () => ['esp', 'col', 'cor'].map((id) => PUZ.cellLocked(id)))).toEqual([true, true, true]);

    // Capítulo 1
    await hablar(page);                              // Brote pide sol
    await ir(page, 'ver'); await hablar(page);       // Solano lo cambia por hielo
    await ir(page, 'oto'); await hablar(page);       // Ocre pide agua de lluvia
    expect(await ev(page, () => PUZ.open('oto', 'inv'))).toBe(false);
    await ir(page, 'pri'); await usar(page, 'agua');
    await ir(page, 'oto'); await hablar(page);       // la tinta ya no está seca
    await usar(page, 'manivela');
    // el giro depende de los fotogramas; en la máquina de pruebas (sin tarjeta gráfica) puede tardar
    await expect.poll(() => ev(page, () => !!PROG.F.bridge), { timeout: 90_000 }).toBe(true);
    expect(await ev(page, () => PUZ.open('oto', 'inv'))).toBe(true);
    await ir(page, 'inv'); await hablar(page); await usar(page, 'hielo');
    await ir(page, 'ver'); await hablar(page);
    expect(await mochila(page)).toEqual(['sol']);
    expect(await objetivo(page)).toBe('Lleva el sol al cerezo de Brote · Primavera');
    await ir(page, 'pri'); await usar(page, 'cerezo');
    await pasar(page);
    expect((await F(page)).done).toBe(1);
    expect(await ev(page, () => ['esp', 'oce', 'des', 'ant'].map((id) => PUZ.cellLocked(id)))).toEqual([false, false, false, false]);
    expect(await ev(page, () => PUZ.cellLocked('col'))).toBe(true);

    // Capítulo 2
    await page.waitForTimeout(600);
    await ir(page, 'esp'); await hablar(page);       // Orión pide una lente
    await ir(page, 'des'); await hablar(page);       // Duna pide una perla
    await ir(page, 'oce'); await hablar(page);       // Coral pide luz
    await expect.poll(() => ev(page, () => PUZ.open('inv', 'ant')), { timeout: 20_000, message: 'el témpano gira solo hacia la Antártida' }).toBe(true);
    await ir(page, 'ant'); await hablar(page);
    await ir(page, 'oce'); await hablar(page);
    await ir(page, 'des'); await hablar(page);
    expect(await mochila(page)).toEqual(['lente']);
    await ir(page, 'esp'); await usar(page, 'telescopio');
    await pasar(page);
    expect((await F(page)).star).toBe(1);
    expect(await ev(page, () => sealCount())).toBe(2);
    expect(await ev(page, () => LATE.some((id) => PUZ.cellLocked(id)))).toBe(false);
    expect(await ev(page, () => PUZ.cellLocked('and'))).toBe(true);
    expect(errores).toEqual([]);
  });

  test('capítulos 3 a 6: cada barrio enciende su sello y da el billete, la llave y el libro', async ({ page }) => {
    const errores = await nueva(page);
    await inyectar(page);

    // Sello 3 · La casa de Amaranta
    await ir(page, 'bib'); await hablar(page); await ganar(page, 'books');
    expect(await mochila(page)).toContain('receta');
    await ir(page, 'coc'); await hablar(page);
    await ir(page, 'col'); await hablar(page); await usar(page, 'miel'); await usar(page, 'menta');
    await ir(page, 'coc'); await hablar(page); await ganar(page, 'cook');
    expect(await mochila(page)).toContain('mieltibia');
    await ir(page, 'col'); await hablar(page); await ganar(page, 'rhythm');
    await ir(page, 'rel'); await hablar(page); await hablar(page); await ganar(page, 'clocks');
    expect(await ev(page, () => sealOn(3))).toBe(true);
    expect(await ev(page, () => PUZ.cellLocked('and')), 'el tercer sello abre el Andén').toBe(false);

    // Sello 4 · Los sueños. Las flores de Luna se abren de verdad: de espaldas y esperando.
    await ir(page, 'inn'); await hablar(page);
    for (let i = 0; i < 3; i++) {
      await ev(page, (i) => { const [x, y] = FLOWERS[i]; Pl.route = null; Pl.goal = null; Pl.x = x + (x < 0 ? 40 : -40); Pl.y = y - 26; Pl.f = x < 0 ? 1 : -1; }, i);
      await expect.poll(() => ev(page, (i) => flowerOpen(i), i), { timeout: 10_000 }).toBe(true);
      await usar(page, 'flor' + i);
    }
    await hablar(page);
    await ir(page, 'far'); await hablar(page); await ganar(page, 'mirrors');
    await ir(page, 'tre'); await hablar(page); await ganar(page, 'stars');
    expect((await F(page)).relic.billete).toBe(1);
    expect(await mochila(page)).toEqual(expect.arrayContaining(['luzfaro', 'sombrero']));
    await ir(page, 'tea'); await hablar(page); await hablar(page); await ganar(page, 'theatre');
    expect(await ev(page, () => sealOn(4))).toBe(true);

    // Sello 6 (parte) · el retrato usa el sombrero y deja sitio en la mochila
    await ir(page, 'ret'); await hablar(page); await hablar(page); await ganar(page, 'portrait');
    expect(await mochila(page)).not.toContain('sombrero');

    // Sello 5 · Las raíces
    await ir(page, 'cum'); await hablar(page); await ganar(page, 'kite');
    await ir(page, 'cue'); await hablar(page); await ganar(page, 'crystals');
    await ir(page, 'sot'); await hablar(page); await ganar(page, 'wax');
    expect(await mochila(page)).toEqual(expect.arrayContaining(['cristal', 'cera']));
    await ir(page, 'vol'); await hablar(page); await hablar(page); await ganar(page, 'forge');
    expect(await ev(page, () => sealOn(5))).toBe(true);
    expect((await F(page)).relic.llave).toBe(1);

    // Sello 6 · La memoria. El candado se abre con los puntos de los seis símbolos de cera.
    await ir(page, 'dsv'); await hablar(page);
    await expect.poll(() => ev(page, () => GAME && GAME.key)).toBe('lock');
    await ev(page, () => { GAME.st.v = GAME.def.ids.map((id) => GLYPHS[id][2]); document.querySelector('#mgb button').click(); });
    await expect.poll(() => ev(page, () => !GAME), { timeout: 5_000 }).toBe(true);
    await page.waitForTimeout(200); await pasar(page);
    expect((await F(page)).relic.libro).toBe(1);
    await ir(page, 'est'); await hablar(page);
    await ir(page, 'ant'); await hablar(page); await ganar(page, 'radio');
    await ir(page, 'tea'); await hablar(page);
    await ir(page, 'oce'); await hablar(page);
    expect(Object.keys((await F(page)).words).sort()).toEqual(['C', 'L', 'T']);
    await ir(page, 'est'); await hablar(page); await ganar(page, 'compose', { fill: ['cada noche', 'la luz', 'el final'] });
    await ir(page, 'jar'); await hablar(page);
    await ir(page, 'pri'); await usar(page, 'agua');
    await ir(page, 'jar'); await hablar(page); await ganar(page, 'name', { n: 'Latido' });
    const f = await F(page);
    expect(f.treeName).toBe('Latido');
    expect(await ev(page, () => [3, 4, 5, 6].map(sealOn))).toEqual([true, true, true, true]);
    expect(await ev(page, () => ORDER.filter((id) => CLUSTER[3].concat(CLUSTER[4], CLUSTER[5], CLUSTER[6]).includes(id) && !mDone(id)))).toEqual([]);
    expect(await objetivo(page)).toBe('Baja al corazón de la colmena · desde el Estudio de Amaranta');
    expect(errores).toEqual([]);
  });

  test('el tablero del misterio: cinco preguntas, y la quinta solo después de escuchar a Eco', async ({ page }) => {
    const errores = await nueva(page);
    await inyectar(page);
    const tablero = () => ev(page, () => { fillClues(); return DEDU.map((q, i) => document.querySelectorAll('#bclue .dq')[i].querySelectorAll('.opts button').length); });
    const responder = (i, k) => ev(page, ([i, k]) => { fillClues(); document.querySelectorAll('#bclue .dq')[i].querySelectorAll('.opts button')[k].click(); }, [i, k]);

    // Sin testimonios no se puede responder nada.
    expect(await tablero()).toEqual([0, 0, 0, 0, 0]);

    // Se inyectan los testimonios de los vecinos de arriba (todos menos el de Eco).
    await ev(page, () => { const h = (PROG.F.heard = {}); for (const k in TESTI) if (k !== 'eco') h[k] = 1; });
    expect(await tablero()).toEqual([3, 3, 3, 3, 0]);

    // Una respuesta falsa no cuenta.
    await responder(0, 0);
    expect((await F(page)).dedu || {}).toEqual({});

    const bien = await ev(page, () => DEDU.map((q) => q.ok));
    for (let i = 0; i < 4; i++) await responder(i, bien[i]);
    let f = await F(page);
    expect(Object.keys(f.dedu).sort()).toEqual(['deja', 'hora', 'porque', 'tren']);
    expect(f.casi).toBe(1);
    expect(f.truth).toBeUndefined();

    // Con el testimonio de Eco se abre la quinta.
    await ev(page, () => { PROG.F.heard.eco = 1; });
    expect((await tablero())[4]).toBe(3);
    await responder(4, bien[4]);
    f = await F(page);
    expect(f.truth).toBe(1);
    expect(errores).toEqual([]);
  });

  test('Acto III: del Andén Vacío al espejo del Reverso', async ({ page }) => {
    const errores = await nueva(page);
    await inyectar(page);
    expect(await ev(page, () => PUZ.cellLocked('and'))).toBe(true);
    await inyectar(page, { s3: 1 });

    // 1 · El Andén: sin leer el horario, Silbo no da el billete.
    await ir(page, 'and'); await hablar(page);
    expect(await ev(page, () => PUZ.cellLocked('eco'))).toBe(true);
    await usar(page, 'horario'); await hablar(page);
    const f1 = await F(page);
    expect(f1.ab.and).toBe(1);
    expect(f1.heard.horario, 'el horario de Silbo queda anotado como testimonio').toBe(1);
    expect(await ev(page, () => DEDU.find((q) => q.id === 'hora').ev.includes('horario'))).toBe(true);

    // 2 · La Casa de los Ecos: quieto, los tres fantasmas traen su carta.
    await ir(page, 'eco'); await hablar(page);
    expect(await ev(page, () => PUZ.cellLocked('per'))).toBe(true);
    await expect.poll(() => ev(page, () => (PROG.F.ab.letters || 0)), { timeout: 60_000, intervals: [1000] }).toBe(3);
    await page.waitForTimeout(300);
    await hablar(page);
    const f2 = await F(page);
    expect(f2.ab.eco).toBe(1);
    expect(f2.heard.eco, 'la confesión de Eco queda anotada como testimonio').toBe(1);

    // 3 · Objetos Perdidos: solo el reloj es del apicultor.
    await ir(page, 'per'); await hablar(page);
    const otro = await ev(page, () => thingsHere().find((t) => t.obj && t.obj !== 'reloj').id);
    await usar(page, otro);
    expect((await F(page)).ab.per).toBeUndefined();
    await usar(page, 'obj_reloj');
    expect((await F(page)).ab.per).toBe(1);

    // 4 · La Celda del Apicultor
    await ir(page, 'api'); await usar(page, 'reloj_api');
    await expect.poll(() => ev(page, () => PROG.F.ab.api2), { timeout: 8_000, message: 'Alvéolo despierta y habla' }).toBe(1);
    await page.waitForTimeout(300); await pasar(page);
    // Ya despierto, no vuelve a decir que duerme.
    for (let n = 0; n < 3; n++) {
      await ev(page, () => { const m = CELLS[cur].npc; Pl.x = m.x + 30; Pl.y = m.y + 24; nearObj = { kind: 'npc' }; near = true; talk(); });
      expect(await ev(page, () => DLG.lines.join(' '))).not.toContain('dormido');
      await pasar(page);
    }

    // 5 · El Reverso pide además haber devuelto el primer latido al Corazón (se inyecta: el rastro depende de la noche).
    expect(await ev(page, () => PUZ.cellLocked('rev'))).toBe(true);
    await ev(page, () => { PROG.F.rastro = Object.assign(PROG.F.rastro || {}, { box: 1, given: 1 }); stateChanged(); });
    await ir(page, 'rev'); await usar(page, 'espejo');
    expect((await F(page)).ab.fin).toBe(1);
    expect(errores).toEqual([]);
  });

  // El discurso se abre solo aunque el jugador esté junto al reloj y no junto a Alvéolo, y no se cierra hasta leerlo.
  test('Acto III: al dar cuerda al reloj, el discurso de Alvéolo se queda en pantalla', async ({ page }) => {
    await nueva(page);
    await inyectar(page, { s3: 1, ab: { and: 1, eco: 1, per: 1, letters: 3 } });
    await ir(page, 'api');
    await ev(page, () => { const t = thingsHere().find((t) => t.id === 'reloj_api'); Pl.route = null; Pl.goal = null; Pl.x = t.ax; Pl.y = t.ay; });
    await page.waitForTimeout(300);
    await usar(page, 'reloj_api');
    await page.waitForTimeout(2500);
    expect(await ev(page, () => talking && DLG.lines[1])).toContain('Soy Alvéolo');
    await page.waitForTimeout(1500);
    expect(await ev(page, () => talking), 'sigue abierto hasta que el jugador lo pasa').toBe(true);
    await pasar(page);
    expect(await ev(page, () => talking)).toBe(false);
  });

  const SEIS = { s3: 1, s4: 1, s5: 1, s6: 1, treeName: 'Latido' };

  test('el Corazón: sin los seis sellos, la llave y el libro, Amaranta sigue dormida', async ({ page }) => {
    const errores = await nueva(page);
    await inyectar(page, { s3: 1 });
    await ir(page, 'cor');
    expect(await hablar(page)).toBeNull();
    await inyectar(page, SEIS);
    expect(await hablar(page)).toBeNull();
    await inyectar(page, { ...SEIS, relic: { llave: 1 } });
    expect(await hablar(page)).toBeNull();
    expect((await F(page)).ending).toBeUndefined();
    expect(errores).toEqual([]);
  });

  // Se inyectan los seis sellos y las reliquias; la conversación y la elección se juegan de verdad.
  for (const [k, extra, opcion, titulo, cuantas, frase] of [
    ['A', { relic: { llave: 1, libro: 1, billete: 1 } }, 'Darle el billete de vuelta', 'El tren de vuelta', 2, 'Esta vez llevaba puesto su sombrero.'],
    ['B', { relic: { llave: 1, libro: 1 } }, 'Quedarme a cuidar la colmena', 'Nuevo guardián', 1, '«Latido»'],
    ['C', { relic: { llave: 1, libro: 1 }, truth: 1, ab: { fin: 1 } }, 'Contarle la verdad que has descubierto', 'La colmena entera', 2, 'Eco dio un paso adelante'],
  ]) {
    test(`final ${k} · ${titulo}`, async ({ page }) => {
      const errores = await nueva(page);
      await inyectar(page, { ...SEIS, ...extra });
      await ir(page, 'cor');
      const ch = await hablar(page);
      expect(ch, 'opciones que ofrece Amaranta').toHaveLength(cuantas);
      const i = ch.findIndex((t) => t.includes(opcion));
      expect(i, `debería ofrecer «${opcion}»`).toBeGreaterThanOrEqual(0);
      await ev(page, (i) => document.querySelectorAll('#dch button')[i].click(), i);
      // El final completo enseña antes «hay algo más arriba»: la cámara sube y luego llega el texto.
      if (k === 'C') await expect(page.locator('#hook')).toBeAttached({ timeout: 8_000 });
      await expect(page.locator('#ending')).toBeVisible({ timeout: 90_000 });
      await expect(page.locator('#endt')).toHaveText(titulo);
      await expect(page.locator('#endx')).toContainText(frase);
      await expect(page.locator('#endx')).toContainText('gracias por jugar');
      expect((await F(page)).ending).toBe(k);
      expect(errores).toEqual([]);
    });
  }
});
