// Medidas de uno o varios cuartos, para rediseñarlos sin tapar nada: dónde está el vecino, las puertas,
// los obstáculos, los muebles, los objetos que se usan y la decoración genérica que tiene hoy.
// Uso: node scripts/medidas.mjs esp,des,ant     (antes: node scripts/build.mjs)
// Coordenadas del cuarto: hexágono de radio 300; x a la derecha, y hacia la cámara (el fondo es y negativa), z arriba.
// Paredes del fondo: "34" izquierda, "45" centro, "50" derecha. Las demás aristas son el frente (muro bajo).
import { chromium } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ids = (process.argv[2] || 'pri').split(',');
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const p = await b.newPage();
await p.goto(pathToFileURL(join(process.env.COLMENA_DIST || join(ROOT, 'dist'), 'colmena.html')).href);
await p.waitForTimeout(1500);
const r = await p.evaluate((ids) => {
  const rd = (v) => Math.round(v);
  const o = {};
  for (const id of ids) {
    const c = CELLS[id];
    o[id] = {
      nombre: SEASON[id].name,
      vecino: [c.npc.name, rd(c.npc.x), rd(c.npc.y)],
      puertas: c.doors.map((d) => `${d.to} en la arista ${d.e.join('')} (centro ${rd(d.mid[0])},${rd(d.mid[1])})`),
      obstaculos: c.solids.map((s) => s.map(rd).join(',')).join(' | '),
      muebles: c.props.map((q) => q.id + (q.bb ? ' [' + q.bb.map(rd).join(',') + ']' : '')).join(' | '),
      objetos: (PUZ.things[id] || []).map((t) => `${t.id}@${rd(t.x)},${rd(t.y)}${t.rot ? ' (gira el cuarto)' : ''}`).join(' | '),
      decoracionGenerica: window.R3THEME && R3THEME[id] ? R3THEME[id].items.map((i) => i.k).join(',') + (R3THEME[id].rug ? ' + alfombra en ' + R3THEME[id].rug.at : '') : 'ninguna',
      piso: typeof PISO !== 'undefined' ? PISO[id] : null,
    };
  }
  return o;
}, ids);
console.log(JSON.stringify(r, null, 1));
await b.close();
