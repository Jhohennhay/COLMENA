// Pruebas de humo del juego completo. Si algo de aquí falla, el juego está roto para el jugador.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const URL = pathToFileURL(join(process.cwd(), 'dist/colmena.html')).href;

async function abrir(page) {
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  await page.goto(URL);
  await expect(page.locator('#bnew')).toBeVisible();
  return errores;
}

test('la portada carga en los cuatro idiomas', async ({ page }) => {
  const errores = await abrir(page);
  for (const [l, txt] of [['en', 'New game'], ['ru', 'Новая игра'], ['zh', '新游戏'], ['es', 'Nueva partida']]) {
    await page.evaluate((l) => setLang(l), l);
    await expect(page.locator('#bnew')).toHaveText(txt);
  }
  expect(errores).toEqual([]);
});

test('partida nueva: creador, tutorial y objetivo', async ({ page }) => {
  const errores = await abrir(page);
  await page.click('#bnew');
  await expect(page.locator('#creator')).toBeVisible();
  await page.click('#crok');
  await expect(page.locator('.tut')).toBeVisible({ timeout: 45_000 }); // el tutorial espera a que Amaranta termine de hablar
  expect(await page.evaluate(() => cur)).toBe('pri');
  expect(errores).toEqual([]);
});

test('recorrido libre: se puede visitar cada una de las 30 celdas', async ({ page }) => {
  const errores = await abrir(page);
  await page.click('#bfree');
  const ids = await page.evaluate(() => ORDER.slice());
  expect(ids.length).toBe(30);
  for (const id of ids) {
    await page.evaluate((id) => { if (cur !== id) fastTravel(id); }, id);
    await expect.poll(() => page.evaluate(() => cur), { timeout: 15_000 }).toBe(id);
  }
  expect(errores).toEqual([]);
});

test('desde cualquier celda se llega a cualquier otra', async ({ page }) => {
  await abrir(page);
  await page.click('#bfree');
  const malos = await page.evaluate(() => {
    const bad = [];
    for (const a of ORDER) for (const b of ORDER) {
      if (a === b) continue; let x = a, n = 0;
      while (x !== b && n < 40) { cur = x; const d = doorToward(b); if (!d) { bad.push(a + '>' + b); break; } x = Pl.hop && Pl.hop.door === d ? Pl.hop.to : d.to; Pl.hop = null; n++; }
      if (n >= 40) bad.push(a + '>' + b + ' (bucle)');
    }
    cur = 'pri'; return bad;
  });
  expect(malos).toEqual([]);
});

test('el ascensor, el pozo y el tobogán llevan a su destino', async ({ page }) => {
  const errores = await abrir(page);
  await page.click('#bfree');
  for (const [a, b, tipo] of [['cor', 'esp', 'ascensor'], ['and', 'sot', 'pozo'], ['sot', 'cor', 'tobogan']]) {
    await page.evaluate((a) => { if (cur !== a) fastTravel(a); }, a);
    await expect.poll(() => page.evaluate(() => cur), { timeout: 15_000 }).toBe(a);
    await page.waitForTimeout(1500);
    const t = await page.evaluate((b) => { const d = CELLS[cur].doors.find((x) => x.to === b); cross(d); return crossing.plan && crossing.plan.X ? crossing.plan.P.type : null; }, b);
    expect(t).toBe(tipo);
    await page.evaluate(() => { crossing.t = crossing.dur - 0.01; });
    await expect.poll(() => page.evaluate(() => !crossing && cur), { timeout: 15_000 }).toBe(b);
  }
  expect(errores).toEqual([]);
});

test('modo explorar: se entra y se sale con el botón, y la cámara sigue al chico', async ({ page }) => {
  const errores = await abrir(page);
  await page.click('#bfree');
  await expect.poll(() => page.evaluate(() => !inTitle), { timeout: 30_000 }).toBe(true);
  const lejos = () => page.evaluate(() => {
    const p = R3D.worldOf(cur, Pl.x, Pl.y, 0);
    return R3D.camera.position.distanceTo(p);
  });
  /* espera a que la cámara de llegada se asiente: al empezar todavía se está acercando */
  const quieta = async () => {
    let a = await lejos();
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(1000);
      const b = await lejos();
      if (Math.abs(b - a) < 2) return b;
      a = b;
    }
    return a;
  };
  const vista = await quieta();
  await page.click('#bexp');
  /* dibujando por software (GitHub) van 2 o 3 imágenes por segundo y los vuelos de cámara tardan más */
  await expect.poll(lejos, { timeout: 90_000 }).toBeLessThan(vista * 0.7);
  await page.evaluate(() => goTo(-120, 80));
  await page.waitForTimeout(1500);
  const cerca = await lejos();
  expect(cerca).toBeLessThan(vista * 0.7);
  await page.click('#bexp');
  await expect.poll(lejos, { timeout: 90_000 }).toBeGreaterThan(cerca * 1.5);
  expect(errores).toEqual([]);
});
