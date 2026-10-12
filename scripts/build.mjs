// Construye el juego en un solo archivo HTML (dist/), igual que la versión publicada.
// Uso: node scripts/build.mjs [--min]
//  · src/manifiesto.json dice qué módulos van en cada hueco /*@@...@@*/ de src/game.js y en qué orden.
//  · El orden importa: muchos módulos envuelven funciones globales definidas antes (ver docs/arquitectura.md).
// Para trabajar varios a la vez sin pisarse (cada uno en su módulo de salas):
//  · COLMENA_DIST=<carpeta>  escribe ahí en vez de en dist/
//  · COLMENA_SOLO=salas5     deja fuera los demás módulos salas4…salas8 (por si están a medio escribir)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = process.env.COLMENA_DIST || join(ROOT, 'dist');
const SOLO = process.env.COLMENA_SOLO || '';
const rd = (f) => readFileSync(join(ROOT, f), 'utf8');
// COLMENA_SIN=clima,post deja fuera esos módulos (para que quien trabaja en uno no dependa de otro a medio escribir)
const SIN = (process.env.COLMENA_SIN || '').split(',').filter(Boolean);
const entra = (f) => (!SOLO || !/salas[4-8]\.js$/.test(f) || f.endsWith(SOLO + '.js')) && !SIN.some((k) => f.endsWith('/' + k + '.js'));
const man = JSON.parse(rd('src/manifiesto.json'));

let js = rd(man.nucleo);
for (const [hueco, files] of Object.entries(man.huecos)) {
  if (!js.includes(hueco)) throw new Error(`Falta el hueco ${hueco} en ${man.nucleo}`);
  js = js.replace(hueco, () => files.filter(entra).map(rd).join(''));
}

if (process.argv.includes('--min')) {
  const { transform } = await import('esbuild');
  const r = await transform(js, { minify: true, target: 'es2020', loader: 'js', legalComments: 'none', charset: 'utf8' });
  js = r.code;
}

const head = rd(man.cabecera);
const three = '<script>/* three.js r169 (MIT) · https://threejs.org · selección para Colmena */\n' + rd(man.vendor) + '</script>\n';
const page = (h, extra = '') => h + extra + three + '<script>' + js + '</script>\n</body>\n</html>\n';
const titulo = (t) => head.replace('<title>Colmena</title>', `<title>${t}</title>`);

mkdirSync(DIST, { recursive: true });
// El juego entero también va en versión adulta (src/modulos/adulto.js); el aspecto de papel queda en la demo y las pruebas de diseño.
const full = page(head, '<script>window.COLMENA_ADULTO=true</script>');
writeFileSync(join(DIST, 'colmena.html'), full);
// La portada (index.html) es la Temporada 1: doce celdas, hasta el tercer sello (src/modulos/temporada.js),
// en su versión adulta (src/modulos/adulto.js).
// colmena.html sigue siendo el juego entero: la versión de trabajo y la que usan las pruebas.
writeFileSync(join(DIST, 'index.html'), page(titulo('Colmena · Temporada 1'), '<script>window.COLMENA_T1=true;window.COLMENA_ADULTO=true</script>'));
writeFileSync(join(DIST, 'colmena-demo.html'), page(titulo('Colmena Demo'), '<script>window.COLMENA_DEMO=true</script>'));
// La prueba del diseño «islas»: solo el capítulo 1, con los cuartos separados (src/modulos/islas.js).
writeFileSync(join(DIST, 'prueba.html'), page(titulo('Colmena · prueba'), '<script>window.COLMENA_DEMO=true;window.COLMENA_ISLAS=true</script>'));
// La misma prueba con Verano en otra dirección de arte (arquitectura, color plano, cámara casi isométrica).
writeFileSync(join(DIST, 'prueba-mv.html'), page(titulo('Colmena · prueba de estilo'), '<script>window.COLMENA_DEMO=true;window.COLMENA_ISLAS=true;window.COLMENA_MV=true</script>'));
console.log(`construido ${process.env.COLMENA_DIST ? DIST : 'dist'}/ (${(full.length / 1e6).toFixed(2)} MB${process.argv.includes('--min') ? ', minificado' : ''})`);
