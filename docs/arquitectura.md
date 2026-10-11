# Arquitectura de Colmena (v43)

## El resultado: un solo archivo

`npm run build` produce `dist/colmena.html` (~1,9 MB sin minificar, ~1,7 MB minificado): estilos y estructura de `src/head.html`, three.js r169 recortado (`vendor/`) y un único `<script>` con todo el juego. No hay servidor ni dependencias en tiempo de ejecución; se abre con doble clic o desde GitHub Pages. `dist/colmena-demo.html` es lo mismo con `window.COLMENA_DEMO=true`.

## Cómo se ensambla

`src/game.js` es el núcleo y tiene huecos de la forma `/*@@NOMBRE@@*/`. `src/manifiesto.json` dice qué archivos se pegan en cada hueco y en qué orden. Todo comparte **un mismo ámbito global** (no son módulos ES): las funciones y `const` de un archivo se ven en los siguientes.

| Hueco | Archivos (en orden) | Para qué |
| --- | --- | --- |
| `I18N` | `i18n.js`, `i18n_dict*.js` | `_t()`, `I18N()`, `TPLadd()` y el diccionario principal |
| `HUMANS` | `humans.js`, `wardrobe.js`, `variants.js` | Los vecinos como títeres de papel, su ropa y sus variantes |
| `ROOMS2` | `rooms2.js` | Celdas 9–25 (capítulos 3 a 6 y el Corazón) |
| `ROOMS3` | `rooms3.js`, `rooms_abajo.js`, `layout.js` | Detalles de cuartos, Acto III (celdas 26–30) y la colmena en anillos (posiciones, pisos, conexiones, atajos) |
| `MYST` | `mystery.js` | Páginas del cuaderno y el misterio |
| `PATHS` | `paths.js` | Caminos largos entre racimos y sus tipos |
| `LIFE` | `life.js` | Vecinos que se mueven por su cuarto |
| `QUESTS` | 29 archivos (abajo) | Sistemas, misiones, 3D, mejoras y traducciones de módulos |

Los 29 de `QUESTS`, en orden:

| Archivo | Qué hace |
| --- | --- |
| `quests_core.js` | Mochila, cuaderno, amistad, logros, pistas, foto |
| `quests_story.js` | Misiones, sellos 3–6, favores, el Corazón y los finales |
| `minigames.js` | Un minijuego por vecino |
| `quests_fx.js` | Abejas hacia el Corazón, luz en el suelo, libro desplegable |
| `quests_more.js` | Puertas que giran, testimonios y tablero del misterio (5 preguntas), informe de prueba |
| `quests_imm.js` | Vista inmersiva, ajustes de sonido y texto, copia de seguridad |
| `quests_madr.js` | La madriguera de Pompón y Nala |
| `quests_ramas.js` | Las ramas de las que cuelga la colmena |
| `lowpoly3d.js` | Personajes 3D low-poly y el kit de piezas (`Bk`, `SPH`, `CYL`, `BOX`…) |
| `props3d.js` | Muebles 3D y la decoración hecha a mano de Primavera |
| `rooms3d.js` | Decoración 3D genérica de los demás cuartos (`R3THEME`, `R3ADD`) |
| `render3d.js` | El diorama 3D: cámara, cuartos, caminos, mapa, toques. Exporta `R3D` |
| `plazas.js` | Plazoletas a mitad de los caminos largos; rutas con Dijkstra |
| `rastro.js`, `misterio2.js` | El rastro de Amaranta y el frasco del latido |
| `abajo_q.js` | Historia y acertijos del Acto III |
| `cambios.js`, `mejoras.js`, `mejoras2.js` | Ajustes de cuartos existentes, jugabilidad, tutorial, encargos, tres ranuras |
| `viaje.js` | Puente vivo, cámara de viaje, cesta de las abejas, encuentros |
| `sonido.js` | Ambiente propio de cada cuarto; el tema en los finales |
| `ui_fix.js` | Usabilidad y accesibilidad (44 px, foco, contraste, objetivo clicable) |
| `mapa2.js` | Atajos, el tablón del Corazón, carteles con ★, progreso por barrio en el mapa |
| `pulido.js` | Textos que no se pisan, copia de partida, resumen al volver, celebraciones, tiempo estable |
| `salas.js` | Primavera, Océano y Volcán rediseñados (guía de estilo: `docs/guia-salas.md`) |
| `salas2.js` | Verano, Otoño e Invierno rediseñados con las piezas de `SALAS.kit` |
| `conexiones.js` | Ascensor, cubo del pozo y tobogán de miel (`docs/conexiones.md`) |
| `i18n_m2.js`, `i18n_m3.js`, `i18n_m4.js` | Traducciones de los módulos posteriores |

## Patrones que hay que conocer

**Envolver funciones globales.** Casi todas las mejoras se añadieron así:

```js
{const a0 = act; act = function (t) { if (t && t.id === 'tablon') { openBook('enc'); return; } return a0(t); };}
```

Funciona porque las funciones de `game.js` son declaraciones globales que se llaman por su nombre. Consecuencia: **el orden del manifiesto es parte del comportamiento**, y una función puede tener varias capas (por ejemplo `crossAt`: `paths.js` → `viaje.js` → `conexiones.js`). Antes de tocar una función, busca todas sus envolturas: `grep -n "crossAt=function\|const ca0=crossAt" src -r`.

**Estado.** `PROG.F` guarda todas las banderas de la partida (`done`, `star`, `s1`…`s6`, `met`, `ok`, `ab.*`, `atajos`, `tut`, `tabSeen`…); `PROG.bag` la mochila. `QF()` devuelve `PROG.F`. Cambiar el estado ⇒ `stateChanged()` (guarda, recalcula el objetivo y los visuales).

**Celdas.** `CELLS[id]` tiene `props` (muebles con `bb` y `draw`), `npc`, `doors` (`to`, `e`, `mid`, `trig`, `span`), `solids` (círculos de colisión `[x,y,r]`), `base(p)` (dibujo de papel del suelo y las paredes). Coordenadas del cuarto: hexágono de radio `R=300`, `x` a la derecha, `y` hacia la cámara, `z` hacia arriba. `ORDER` es la lista de las 30 celdas; `CW[id]` su posición en el mundo; `GRUPO`/`PISO` su barrio y piso.

**Cruces.** `cross(d)` inicia un cruce: corto (puerta entre vecinas, salto), largo (`crossing.plan`, un camino de `PATHS`) o compuesto (`crossing.comp`, pasando por plazoletas). `frameLogic` lo avanza y `crossAt(cr)` dice dónde está el viajero. La altura en 3D es `lerp(lift(origen), lift(destino), t/dur) + Pl.z`.

**3D.** `R3D.rooms[id]` es el cuarto construido (`grp`, `mats`, `deco`…). La decoración de cada cuarto la devuelve `PROPS3D.room(id)` (se cachea y se reutiliza); sus animaciones van en `group.userData.tick(t, quieto, luzAmbiente)`. `tintRoom` oscurece las vecinas multiplicando `material.color` desde `material.userData.base`.

**Textos.** `_t('español')` traduce en tiempo de ejecución; `I18N([[es,en,ru,zh]])` añade filas; `TPLadd()` plantillas con `{huecos}`. Los textos estáticos del HTML se traducen solos al cambiar de idioma (`i18nDom`).

**Guardado.** `localStorage`: `colmena-progreso` (+`-2`, `-3`, y `-bak` de cada una), `colmena-slot`, `colmena-avatar`, `colmena-lang`, `colmena-vol`, `colmena-calma`, `colmena-gfx`, `colmena-lp`, `colmena-q3d`, `colmena-dpr`, `colmena-tts`, `colmena-opciones`, `colmena-chars`, `colmena-prueba`, `colmena-tip-run`, `colmena-tip3d`.

## Deuda técnica conocida

- Las capas de envolturas hacen difícil seguir una función de principio a fin. `docs/plan.md` (fase 1) propone reunirlas.
- Textos de diálogo y misión mezclados con la lógica en `quests_*.js` y `rooms*.js` (fase 3: pasarlos a datos).
- Dos dibujos en paralelo (papel 2D y 3D). El 2D es respaldo; los cuartos nuevos solo se diseñan en 3D.
- `render3d.js` y `game.js` son muy grandes (≈95 KB y ≈220 KB).
