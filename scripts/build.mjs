// Construye el juego en un solo archivo HTML (dist/), igual que la versión publicada.
// Uso: node scripts/build.mjs [--min]
//  · src/manifiesto.json dice qué módulos van en cada hueco /*@@...@@*/ de src/game.js y en qué orden.
//  · El orden importa: muchos módulos envuelven funciones globales definidas antes (ver docs/arquitectura.md).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const rd = (f) => readFileSync(join(ROOT, f), 'utf8');
const man = JSON.parse(rd('src/manifiesto.json'));

let js = rd(man.nucleo);
for (const [hueco, files] of Object.entries(man.huecos)) {
  if (!js.includes(hueco)) throw new Error(`Falta el hueco ${hueco} en ${man.nucleo}`);
  js = js.replace(hueco, () => files.map(rd).join(''));
}

if (process.argv.includes('--min')) {
  const { transform } = await import('esbuild');
  const r = await transform(js, { minify: true, target: 'es2020', loader: 'js', legalComments: 'none', charset: 'utf8' });
  js = r.code;
}

const head = rd(man.cabecera);
const three = '<script>/* three.js r169 (MIT) · https://threejs.org · selección para Colmena */\n' + rd(man.vendor) + '</script>\n';
const page = (h, extra = '') => h + extra + three + '<script>' + js + '</script>\n</body>\n</html>\n';

mkdirSync(join(ROOT, 'dist'), { recursive: true });
const full = page(head);
writeFileSync(join(ROOT, 'dist/colmena.html'), full);
writeFileSync(join(ROOT, 'dist/index.html'), full);
writeFileSync(join(ROOT, 'dist/colmena-demo.html'), page(head.replace('<title>Colmena</title>', '<title>Colmena Demo</title>'), '<script>window.COLMENA_DEMO=true</script>'));
// La prueba del diseño «islas»: solo el capítulo 1, con los cuartos separados (src/modulos/islas.js).
writeFileSync(join(ROOT, 'dist/prueba.html'), page(head.replace('<title>Colmena</title>', '<title>Colmena · prueba</title>'), '<script>window.COLMENA_DEMO=true;window.COLMENA_ISLAS=true</script>'));
console.log(`construido dist/ (${(full.length / 1e6).toFixed(2)} MB${process.argv.includes('--min') ? ', minificado' : ''})`);
