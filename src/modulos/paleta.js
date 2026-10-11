/* ══════════ PALETA · un matiz propio para los cuartos que se parecían demasiado (oct 2026) ══════════
   Puestos los treinta cuartos juntos, tres grupos se confundían entre sí:
   · los de madera marrón (Relojería, Tren, Desván, Objetos Perdidos): cada uno recibe un matiz suyo;
   · los de suelo casi negro (Volcán, Reverso, Sótano): el negro sube a un tono oscuro y cálido, de papel;
   · los blancos grisáceos (Invierno, Antártida, Campanario): el Campanario pasa a luz de atardecer.
   No cambia el estilo ni ninguna pieza: es un velo de color sobre el suelo de cada cuarto.
   mul = el suelo se multiplica por ese color (vira el tono); add = se le suma (levanta los negros). */
const PALETA = {
  rel: { mul: '#E4EACB' },
  tre: { mul: '#D6E2E8' },
  dsv: { mul: '#E9DEF0' },
  per: { mul: '#DCE4EC' },
  sot: { add: '#170F06' },
  vol: { add: '#2C120A' },
  rev: { add: '#0A0D1A' },
  cum: { mul: '#FFDCC4', add: '#180A04' },
};
if (window.R3DX && window.SALAS) {
  const HECHO = new WeakSet();
  const velo = (id, r, col, modo, h) => {
    const m = SALAS.kit.keep(
      id,
      new THREE.MeshBasicMaterial({ color: col, transparent: true, depthWrite: false, fog: false, blending: modo }),
    );
    const me = new THREE.Mesh(SALAS.kit.flatHex(4, h), m);
    me.renderOrder = 0;
    r.grp.add(me);
  };
  R3DX.push(() => {
    if (inTitle || !PALETA[cur] || !window.R3D || !R3D.rooms) return;
    const r = R3D.rooms[cur];
    if (!r || !r.grp || HECHO.has(r)) return;
    HECHO.add(r);
    const p = PALETA[cur];
    if (p.mul) velo(cur, r, p.mul, THREE.MultiplyBlending || 4, 3.9);
    if (p.add) velo(cur, r, p.add, THREE.AdditiveBlending, 3.95);
  });
}
