// Extrae del juego construido (dist/colmena.html) todos sus textos y datos a data/*.json.
// Sirve para revisar la historia, traducir o migrar sistemas a datos sin leer el código.
// Uso: npm run datos
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch();
const pg = await b.newPage();
await pg.goto(pathToFileURL(join(ROOT, 'dist/colmena.html')).href);
await pg.waitForTimeout(2500);
const d = await pg.evaluate(() => {
  const g = (n) => { try { return eval(n); } catch (e) { return undefined; } };
  const GR = g('GRUPO') || {}, PI = g('PISO') || {};
  const celdas = ORDER.map((id, i) => ({
    id, orden: i + 1, nombre: SEASON[id] && SEASON[id].name, subtitulo: (CELLS[id] && CELLS[id].sub) || null,
    habitante: (g('NPCN') || {})[id] || null, piso: PI[GR[id]] ?? 0, barrio: GR[id] || null, pos: POS[id],
    mision: (g('MSHORT') || {})[id] || null, favor: (g('SSHORT') || {})[id] || null, pista: (g('HINT2') || {})[id] || null,
    entrada: (NARR.enter || {})[id] || null,
  }));
  return {
    celdas, conexiones: LINKS, atajos: g('ATAJOS') || [],
    transportes: { tipo_por_camino: g('PATH_OF'), nombres: g('PATH_NAME') },
    dialogos: DLG2,
    narracion: { prologo: NARR.pro, entrada: NARR.enter, sellos: NARR.seal, puentes: NARR.bridge, tarde: NARR.late },
    capitulos: g('CHAP'), barrios: { celdas: g('CLUSTER'), nombres: g('CL_NAME') },
    testimonios: g('TESTI'), tablero: g('DEDU'), paginas: g('PAGES'), simbolos: g('GLYPHS'),
    rastro: { paginas: g('RASTRO_PAGES'), frasco: g('RASTRO_BOX'), vecinos: g('RASTRO_DLG') },
    cartas_eco: g('ECO_LET'), recuerdos: g('AMEM'), puentes: g('BRIDGES'),
    objetos: g('ITEM_NAME'), reliquias: g('RELICS'), logros: g('ACH'),
    traducciones: { tabla: g('TR'), plantillas: (g('TPL') || []).map((t) => ({ patron: String(t.re), huecos: t.keys, en: t.to[0], ru: t.to[1], zh: t.to[2] })) },
  };
});
await b.close();
mkdirSync(join(ROOT, 'data'), { recursive: true });
const files = {
  'celdas.json': { celdas: d.celdas, conexiones: d.conexiones, atajos: d.atajos, transportes: d.transportes },
  'dialogos.json': { dialogos: d.dialogos, narracion: d.narracion },
  'historia.json': Object.fromEntries(['capitulos', 'barrios', 'paginas', 'simbolos', 'rastro', 'cartas_eco', 'recuerdos', 'puentes'].map((k) => [k, d[k]])),
  'misterio.json': { testimonios: d.testimonios, tablero: d.tablero },
  'objetos_y_logros.json': { objetos: d.objetos, reliquias: d.reliquias, logros: d.logros },
  'traducciones.json': d.traducciones,
};
for (const [f, v] of Object.entries(files)) writeFileSync(join(ROOT, 'data', f), JSON.stringify(v, null, 1));
console.log(`data/: ${d.celdas.length} celdas, ${Object.keys(d.traducciones.tabla || {}).length} frases traducidas`);
