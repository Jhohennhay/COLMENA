// Capturas para revisar cuartos: abre el juego construido, viaja a cada cuarto y guarda una imagen.
// También comprueba que el vecino, los objetos y las puertas siguen alcanzables y recoge los errores de la página.
// Uso: node scripts/capturas.mjs <carpeta de salida> [ids separados por comas | todos] [movil] [archivo de dist]
//   p. ej.  node scripts/capturas.mjs /tmp/cap pri,ver,oto
// El estado es una partida normal con todos los sellos encendidos (cuartos despiertos).
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const [out = 'capturas', ids = 'todos', modo = '', archivo = 'colmena.html'] = process.argv.slice(2);
const movil = modo === 'movil';
mkdirSync(out, { recursive: true });

// con tarjeta gráfica en Windows (mucho más rápido); COLMENA_GPU=0 vuelve al dibujo por software
const GPU = !process.env.CI && process.platform === 'win32' && process.env.COLMENA_GPU !== '0';
const b = await chromium.launch({
  args: GPU ? ['--use-angle=d3d11', '--enable-gpu', '--enable-webgl', '--ignore-gpu-blocklist'] : ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const c = await b.newContext(movil ? devices['Pixel 7'] : { viewport: { width: 1280, height: 720 } });
const p = await c.newPage();
const errores = new Set();
p.on('pageerror', (e) => errores.add(String(e).slice(0, 200)));
await p.goto(pathToFileURL(join(process.env.COLMENA_DIST || join(ROOT, 'dist'), archivo)).href);
await p.click('#bnew');
await p.click('#crok');
await p.waitForFunction(() => typeof inTitle !== 'undefined' && !inTitle, null, { timeout: 30000 });
await p.evaluate(() => {
  Object.assign(PROG.F, {
    done: 1,
    star: 1,
    bloom: 1,
    melted: 1,
    bridge: 1,
    floe: 1,
    inkFixed: 1,
    askSun: 1,
    gotSun: 1,
    tookIce: 1,
    gotPearl: 1,
    tut: 9,
    s3: 1,
    s4: 1,
    s5: 1,
    s6: 1,
  });
  PROG.F.ab = { and: 1, eco: 1, per: 1, api: 1, api2: 1 };
  PROG.F.rastro = { box: 1, given: 1 };
  stateChanged();
});
const lista = ids === 'todos' ? await p.evaluate(() => ORDER.filter((id) => !PUZ.cellLocked(id))) : ids.split(',');
const informe = [];
for (const id of lista) {
  await p.evaluate((id) => {
    if (cur !== id) fastTravel(id);
  }, id);
  await p.waitForFunction((id) => cur === id && !crossing, id, { timeout: 30000 });
  await p.waitForTimeout(4500);
  await p.evaluate(() => {
    try {
      narrClear();
      hideTut();
      if (talking) closeTalk();
    } catch (e) {}
  });
  await p.waitForTimeout(300);
  const f = join(out, `${id}${movil ? '-movil' : ''}.png`);
  await p.screenshot({ path: f });
  const r = await p.evaluate(() => {
    delete GRIDS[cur];
    const n = CELLS[cur].npc;
    const pts = [
      [n.x + (n.tx ?? 45), n.y + (n.ty ?? 40), 'vecino'],
      ...thingsHere().map((t) => [t.ax ?? t.x, t.ay ?? t.y, t.id]),
      ...CELLS[cur].doors.map((d) => [d.mid[0] * 0.8, d.mid[1] * 0.8, 'puerta ' + d.to]),
    ];
    const malos = [];
    const x0 = Pl.x,
      y0 = Pl.y;
    Pl.x = 0;
    Pl.y = 60;
    for (const [x, y, k] of pts) {
      const rt = route(x, y);
      if (!rt || !rt.length) malos.push(k);
    }
    Pl.x = x0;
    Pl.y = y0;
    const info = window.R3D && R3D.renderer ? R3D.renderer.info.render : null;
    return { malos, llamadas: info ? info.calls : null, triangulos: info ? info.triangles : null };
  });
  informe.push(
    `${id}: inalcanzable: ${r.malos.length ? r.malos.join(', ') : 'nada'} · dibujo: ${r.llamadas} llamadas, ${r.triangulos} triángulos`,
  );
}
console.log(informe.join('\n'));
console.log('errores de la página: ' + (errores.size ? [...errores].join(' | ') : 'ninguno'));
await b.close();
