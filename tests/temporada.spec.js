// La Temporada 1 (dist/index.html): doce celdas, hasta el tercer sello, con su cierre.
// El juego entero sigue en dist/colmena.html y lo prueban juego.spec.js e historia.spec.js.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const URL = pathToFileURL(join(process.cwd(), 'dist/index.html')).href;
const ev = (page, fn, arg) => page.evaluate(fn, arg);
const T1 = ['pri', 'ver', 'oto', 'inv', 'esp', 'oce', 'des', 'ant', 'col', 'bib', 'coc', 'rel'];
const DOS_SELLOS = { done: 1, star: 1, bloom: 1, melted: 1, bridge: 1, floe: 1, inkFixed: 1, askSun: 1, gotSun: 1, askIce: 1, askWater: 1, tookWater: 1, tookIce: 1, askLens: 1, gotLens: 1, askPearl: 1, gotPearl: 1, askAurora: 1, gotAurora: 1 };

async function nueva(page) {
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  await page.goto(URL);
  await expect(page.locator('#bnew')).toBeVisible();
  await page.click('#bnew');
  await page.click('#crok');
  await expect(page.locator('.tut')).toBeVisible({ timeout: 45_000 });
  return errores;
}
async function ir(page, id) {
  expect(await ev(page, (id) => PUZ.cellLocked(id), id), `${id} debería estar abierta`).toBe(false);
  if (await ev(page, (id) => cur === id, id)) return;
  await ev(page, (id) => fastTravel(id), id);
  await expect.poll(() => ev(page, () => cur), { timeout: 15_000 }).toBe(id);
  await page.waitForTimeout(350);
}
async function pasar(page) {
  for (let n = 0; n < 40; n++) if (!(await ev(page, () => { if (!talking) return false; talk(); return true; }))) return;
  throw new Error('el diálogo no termina');
}
async function hablar(page) {
  await ev(page, () => { const n = CELLS[cur].npc; Pl.route = null; Pl.goal = null; Pl.x = n.x + 30; Pl.y = n.y + 24; nearObj = { kind: 'npc' }; near = true; if (!talking) talk(); });
  await pasar(page);
  await page.waitForTimeout(420);
}
async function usar(page, id) {
  const ok = await ev(page, (id) => { const t = thingsHere().find((t) => t.id === id); if (!t) return false; act(t); return true; }, id);
  expect(ok, `«${id}» debería poder usarse`).toBe(true);
}
async function ganar(page, clave) {
  await expect.poll(() => ev(page, () => GAME && GAME.key), { timeout: 5_000, message: `minijuego ${clave}` }).toBe(clave);
  await ev(page, () => GAME.def.finish(GAME.st));
  await expect.poll(() => ev(page, () => !GAME), { timeout: 5_000 }).toBe(true);
  await page.waitForTimeout(200);
  await pasar(page);
  await page.waitForTimeout(450);
}

test.describe('Temporada 1', () => {
  test.setTimeout(360_000);

  test('solo se abren sus doce celdas y no se piden encargos de la Temporada 2', async ({ page }) => {
    const errores = await nueva(page);
    await expect(page.locator('#bfree')).toBeHidden();
    await ev(page, (f) => { Object.assign(PROG.F, f); stateChanged(); }, DOS_SELLOS);
    const r = await ev(page, (T1) => ({
      abiertas: ORDER.filter((id) => !PUZ.cellLocked(id)),
      porque: PUZ.why('pri', 'col') === '' && PUZ.why('rel', 'tea'),
      preguntas: DEDU.map((q) => q.id),
      favores: ['pri', 'ver', 'oto', 'inv', 'des', 'oce', 'ant'].filter((id) => Q[id] && Q[id]()),
      fuera: ORDER.filter((id) => !T1.includes(id) && PUZ.open('pri', id)),
    }), T1);
    expect(r.abiertas.sort()).toEqual([...T1].sort());
    expect(r.preguntas).not.toContain('quien');
    expect(r.favores).toEqual([]);
    expect(r.fuera).toEqual([]);
    // Brote no pide el polen de Luna (es de la Temporada 2)
    await hablar(page);
    expect(await ev(page, () => PROG.F.askPolen)).toBeUndefined();
    // desde cada celda de la temporada se llega a las demás
    // las celdas recién abiertas tardan unos segundos en subir desde la niebla; hasta entonces sus puertas no cuentan
    const rutas = () => ev(page, (T1) => { PROG.F.seen = PROG.F.seen || {}; for (const id of T1) PROG.F.seen[id] = 1; /* la guía de rutas solo pasa por celdas ya vistas */ const bad = []; for (const a of T1) for (const b of T1) { if (a === b) continue; cur = a; if (!doorToward(b)) bad.push(a + '>' + b); } cur = 'pri'; return bad; }, T1);
    await expect.poll(rutas, { timeout: 90_000, intervals: [3000] }).toEqual([]);
    expect(errores).toEqual([]);
  });

  test('la casa de Amaranta enciende el tercer sello y llega el cierre de la temporada', async ({ page }) => {
    const errores = await nueva(page);
    await ev(page, (f) => { Object.assign(PROG.F, f); PROG.bag.length = 0; stateChanged(); }, DOS_SELLOS);
    await ir(page, 'bib'); await hablar(page); await ganar(page, 'books');
    await ir(page, 'coc'); await hablar(page);
    await ir(page, 'col'); await hablar(page); await usar(page, 'miel'); await usar(page, 'menta');
    await ir(page, 'coc'); await hablar(page); await ganar(page, 'cook');
    await ir(page, 'col'); await hablar(page); await ganar(page, 'rhythm');
    await ir(page, 'rel'); await hablar(page); await hablar(page); await ganar(page, 'clocks');
    expect(await ev(page, () => sealOn(3))).toBe(true);
    await expect(page.locator('#ending')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#endk')).toHaveText('Fin de la Temporada 1');
    await expect(page.locator('#endt')).toHaveText('El despertar');
    await expect(page.locator('#endx')).toContainText('Hoy, por fin, ha venido alguien.');
    await expect(page.locator('#endx')).toContainText('Continuará en la Temporada 2');
    const r = await ev(page, () => ({ fin: PROG.F.t1fin, anden: PUZ.cellLocked('and'), aviso: !!(PROG.F.ab && PROG.F.ab.aviso), meta: PUZ.goal() }));
    expect(r).toEqual({ fin: 1, anden: true, aviso: false, meta: 'Fin de la Temporada 1 · pasea por la colmena a tu aire' });
    // se puede cerrar y seguir paseando
    await page.click('#endb');
    await expect(page.locator('#ending')).toBeHidden();
    await ir(page, 'pri');
    expect(errores).toEqual([]);
  });

  test('los textos del cierre están en los cuatro idiomas', async ({ page }) => {
    await nueva(page);
    const r = await ev(page, () => {
      const faltan = [];
      for (const l of ['en', 'ru', 'zh']) {
        setLang(l);
        for (const t of [T1_CIERRE.rotulo, T1_CIERRE.titulo, ...T1_CIERRE.lineas, T1_CIERRE.continuara, T1_CIERRE.cerrado, 'Temporada 1 · El despertar', 'Me faltan miel y una ramita de menta. Las dos están en el Colmenar.']) if (_t(t) === t) faltan.push(l + ': ' + t.slice(0, 30));
      }
      setLang('es');
      return faltan;
    });
    expect(r).toEqual([]);
  });
});
