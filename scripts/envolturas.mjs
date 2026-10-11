// Lista qué módulos envuelven (redefinen) cada función global y en qué orden se aplican.
// Uso: node scripts/envolturas.mjs  →  escribe docs/envolturas.md
// Una «envoltura» es una reasignación como `act = function (t) { … a0(t) }`: la última del orden de carga es la que se ejecuta primero.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const rd = (f) => readFileSync(join(ROOT, f), 'utf8');
const man = JSON.parse(rd('src/manifiesto.json'));

// Orden real de carga: el núcleo, con cada hueco sustituido por sus archivos.
const nucleo = rd(man.nucleo).split('\n');
const tramos = []; // {file, from, lines}
let ini = 0;
nucleo.forEach((l, i) => {
  const h = Object.keys(man.huecos).find((k) => l.includes(k));
  if (!h) return;
  tramos.push({ file: man.nucleo, from: ini, lines: nucleo.slice(ini, i) });
  for (const f of man.huecos[h]) tramos.push({ file: f, from: 0, lines: rd(f).split('\n') });
  ini = i + 1;
});
tramos.push({ file: man.nucleo, from: ini, lines: nucleo.slice(ini) });

const decl = {}; // nombre → primera definición `function nombre(`
const asig = {}; // destino → [{file, line, guarda}]
const guardadas = new Set(); // destinos cuyo valor anterior se guarda (`a0 = act`, `PUZ.open.bind(PUZ)`)
const RE_DECL = /^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/;
const RE_ASIG = /^\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*=\s*(?:async\s+)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/;
const RE_GUARDA = /(?:const|let|var|,)?\s*[A-Za-z_$][\w$]*\s*=\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)(?:\.bind\([^)]*\))?\s*[,;]\s*$/;

let orden = 0;
for (const t of tramos)
  t.lines.forEach((l, i) => {
    const pos = { file: t.file, line: t.from + i + 1, orden: orden++ };
    let m;
    if ((m = RE_DECL.exec(l)) && !decl[m[1]]) decl[m[1]] = pos;
    if ((m = RE_ASIG.exec(l))) (asig[m[1]] = asig[m[1]] || []).push(pos);
    else if ((m = RE_GUARDA.exec(l))) guardadas.add(m[1]);
  });

const filas = Object.entries(asig)
  .filter(([k, v]) => (k.includes('.') ? guardadas.has(k) : decl[k]) && v.length) // nombres sueltos: solo funciones declaradas (evita variables locales)
  .map(([k, v]) => ({ k, origen: decl[k], capas: v }))
  .sort((a, b) => b.capas.length - a.capas.length || a.k.localeCompare(b.k));

const corto = (f) => f.replace(/^src\/(modulos\/)?/, '');
const ref = (p) => `\`${corto(p.file)}:${p.line}\``;
const out = [
  '# Mapa de envolturas',
  '',
  'Generado con `npm run envolturas` (no editar a mano). Cada fila es una función global que otros módulos redefinen.',
  'Las capas van en orden de carga: **la última es la que se ejecuta primero** y suele llamar a la anterior.',
  '',
  `${filas.length} funciones envueltas · ${filas.reduce((n, f) => n + f.capas.length, 0)} capas en total.`,
  '',
  '| Función | Capas | Definición original | Capas, en orden de carga |',
  '| --- | --- | --- | --- |',
  ...filas.map((f) => `| \`${f.k}\` | ${f.capas.length} | ${f.origen ? ref(f.origen) : 'propiedad de objeto'} | ${f.capas.map(ref).join(' → ')} |`),
  '',
];
writeFileSync(join(ROOT, 'docs/envolturas.md'), out.join('\n'));
console.log(`docs/envolturas.md: ${filas.length} funciones, ${filas.reduce((n, f) => n + f.capas.length, 0)} capas`);
