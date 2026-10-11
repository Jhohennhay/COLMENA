// La prueba del diseño «islas» (dist/prueba.html): capítulo 1 con los cuartos separados,
// los viajes entre ellos y la tarea de la prensa dentro de Otoño.
import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const URL = pathToFileURL(join(process.cwd(), 'dist/prueba.html')).href;
const ev = (page, fn, arg) => page.evaluate(fn, arg);

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

// La otra dirección de arte (dist/prueba-mv.html): se comprueba que carga y que Verano sigue siendo jugable.
test('prueba de estilo «arquitectura»: Verano carga y todo sigue alcanzable', async ({ page }) => {
  test.setTimeout(120_000);
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  await page.goto(URL.replace('prueba.html', 'prueba-mv.html'));
  await page.click('#bnew'); await page.click('#crok');
  await expect(page.locator('.tut')).toBeVisible({ timeout: 15_000 });
  await ir(page, 'ver');
  await page.waitForTimeout(2500);
  const malos = await ev(page, () => {
    delete GRIDS[cur];
    const n = CELLS[cur].npc, pts = [[n.x + (n.tx ?? 45), n.y + (n.ty ?? 40), 'vecino'], ...thingsHere().map((t) => [t.ax ?? t.x, t.ay ?? t.y, t.id]), ...CELLS[cur].doors.map((d) => [d.mid[0] * 0.8, d.mid[1] * 0.8, 'puerta ' + d.to])];
    const bad = []; Pl.x = 0; Pl.y = 60;
    for (const [x, y, k] of pts) { const r = route(x, y); if (!r || !r.length) bad.push(k); }
    return bad;
  });
  expect(malos).toEqual([]);
  expect(await ev(page, () => R3D.camera.fov)).toBeLessThan(15);
  await hablar(page);
  expect(errores).toEqual([]);
});

test.describe('prueba «islas»', () => {
  test.setTimeout(360_000);

  test('los cuartos están separados y cada puerta del capítulo 1 lleva a un camino', async ({ page }) => {
    const errores = [];
    page.on('pageerror', (e) => errores.push(String(e)));
    await page.goto(URL);
    await page.click('#bnew'); await page.click('#crok');
    await expect(page.locator('.tut')).toBeVisible({ timeout: 15_000 });
    const r = await ev(page, () => {
      const CH = ['pri', 'ver', 'oto', 'inv'], o = { cerca: [], sinCamino: [], dur: [] };
      for (const a of CH) for (const b of CH) {
        if (a >= b) continue;
        const d = Math.hypot(CW[a][0] - CW[b][0], CW[a][1] - CW[b][1]);
        if (d < 2 * (R + TH) + 300) o.cerca.push(a + '-' + b);
        const door = CELLS[a].doors.find((x) => x.to === b);
        if (!door) continue;
        const P = PATHS.find((p) => p.key === [a, b].sort().join('-'));
        if (!P) o.sinCamino.push(a + '-' + b); else o.dur.push(+(P.L / (PATH_SPEED[P.type] || 150)).toFixed(1));
      }
      return o;
    });
    expect(r.cerca, 'ningún cuarto toca a otro').toEqual([]);
    expect(r.sinCamino).toEqual([]);
    for (const d of r.dur) { expect(d).toBeGreaterThan(4); expect(d).toBeLessThan(11); }
    expect(errores).toEqual([]);
  });

  test('capítulo 1 completo: la prensa de Otoño se pone en marcha dentro del cuarto', async ({ page }) => {
    const errores = [];
    page.on('pageerror', (e) => errores.push(String(e)));
    await page.goto(URL);
    await page.click('#bnew'); await page.click('#crok');
    await expect(page.locator('.tut')).toBeVisible({ timeout: 15_000 });

    await hablar(page);
    await ir(page, 'ver'); await hablar(page);
    await ir(page, 'oto'); await hablar(page);
    expect(await ev(page, () => !!window.ISLAS_AWAKE('oto')), 'el taller empieza parado').toBe(false);
    await ir(page, 'pri'); await usar(page, 'agua');
    await ir(page, 'oto'); await hablar(page);
    expect(await ev(page, () => !!PROG.F.inkFixed), 'el agua sola ya no basta').toBe(false);
    expect(await ev(page, () => PUZ.goal())).toBe('Pon en marcha la prensa de Ocre · 0/3');

    // Fuera de orden no cuenta.
    await usar(page, 'palanca');
    expect(await ev(page, () => PROG.F.isl.palanca)).toBeUndefined();
    await usar(page, 'tintero');
    expect(await ev(page, () => PROG.bag.includes('agua'))).toBe(false);
    await usar(page, 'bobina');
    await usar(page, 'palanca');
    expect(await ev(page, () => !!window.ISLAS_AWAKE('oto')), 'el taller despierta').toBe(true);
    expect(await ev(page, () => !!PROG.F.inkFixed)).toBe(true);
    await page.waitForTimeout(1800); await pasar(page);

    await usar(page, 'manivela');
    await expect.poll(() => ev(page, () => !!PROG.F.bridge), { timeout: 90_000 }).toBe(true);
    await ir(page, 'inv'); await hablar(page); await usar(page, 'hielo');
    await ir(page, 'ver'); await hablar(page);
    await ir(page, 'pri'); await usar(page, 'cerezo');
    await pasar(page);
    expect(await ev(page, () => PROG.F.done)).toBe(1);
    expect(errores).toEqual([]);
  });

  test('desde cada cuarto del capítulo 1 se llega andando a los demás, y vecino y objetos son alcanzables', async ({ page }) => {
    await page.goto(URL);
    await page.click('#bnew'); await page.click('#crok');
    await expect(page.locator('.tut')).toBeVisible({ timeout: 15_000 });
    const malos = await ev(page, () => {
      Object.assign(PROG.F, { bridge: 1, melted: 1, inkFixed: 1 }); PROG.F.isl = { go: 1 };
      const CH = ['pri', 'ver', 'oto', 'inv'], bad = [];
      for (const a of CH) {
        cur = a; delete GRIDS[a];
        for (const b of CH) if (a !== b && !doorToward(b)) bad.push(a + '>' + b);
        const n = CELLS[a].npc, pts = [[n.x + (n.tx ?? 45), n.y + (n.ty ?? 40), 'vecino'], ...thingsHere().map((t) => [t.ax ?? t.x, t.ay ?? t.y, t.id])];
        Pl.x = 0; Pl.y = 60;
        for (const [x, y, k] of pts) { const r = route(x, y); if (!r || !r.length) bad.push(a + ': ' + k); }
      }
      cur = 'pri'; return bad;
    });
    expect(malos).toEqual([]);
  });
});
