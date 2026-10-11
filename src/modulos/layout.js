/* ══════════ LA COLMENA EN ANILLOS ══════════
   El Corazón en el centro (y abajo, en el piso −2). Alrededor, un racimo por capítulo:
   las estaciones al norte, los oficios al noroeste, la memoria al oeste, las raíces al sureste,
   los sueños al noreste, y la colmena de abajo colgando de las raíces, al sur.
   Cuatro caminos bajan al Corazón (Estudio, Sótano, Espacio) y se abren al final.
   Posiciones calculadas para que todas las puertas sigan un eje del panal y ningún puente atraviese otra celda. */
Object.assign(POS, {
  cor: [0, 0],
  dsv: [-2, 1],
  ret: [-3, 1],
  jar: [-3, 2],
  est: [-2, 2],
  pri: [1, -3],
  ver: [2, -4],
  oto: [2, -3],
  inv: [1, -2],
  col: [-1, -1],
  bib: [-1, -2],
  coc: [-2, -1],
  rel: [-2, -2],
  oce: [1, -6],
  esp: [4, -4],
  tea: [4, -6],
  inn: [3, -6],
  far: [4, -7],
  tre: [5, -7],
  des: [0, -4],
  sot: [2, 0],
  cue: [3, -1],
  vol: [3, 0],
  cum: [4, -1],
  ant: [1, 2],
  and: [-2, 4],
  eco: [-1, 4],
  per: [-1, 5],
  api: [-2, 6],
  rev: [-1, 6],
});
{
  const i = LINKS.findIndex((l) => l[0] === 'cor' && l[1] === 'and');
  if (i >= 0) LINKS.splice(i, 1);
}
LINKS.push(['sot', 'and'], ['sot', 'cor'], ['esp', 'cor']);

/* ── distribución 2: menos callejones sin salida ──
   · La Antártida se muda junto al Océano y el Desierto (un mar helado): el capítulo 2 queda en un solo barrio.
   · Atajos que se abren al ayudar a los vecinos: Invernadero–Faro, Faro–Tren, Campanario–Volcán, Jardín–Estudio. */
POS.ant = [0, -5];
{
  const i = LINKS.findIndex((l) => (l[0] === 'inv' && l[1] === 'ant') || (l[0] === 'ant' && l[1] === 'inv'));
  if (i >= 0) LINKS.splice(i, 1);
}
LINKS.push(['des', 'ant'], ['ant', 'oce']);
const ATAJOS = [
  ['inn', 'far'],
  ['far', 'tre'],
  ['cum', 'vol'],
  ['jar', 'est'],
];
LINKS.push(...ATAJOS);
/* el témpano ya no gira: se llega a pie en cuanto despierta la colmena */
delete BRIDGES['ant-inv'];
if (PUZ.things && PUZ.things.inv) PUZ.things.inv = PUZ.things.inv.filter((t) => t.id !== 'rueda');
