# Colmena

Juego web narrativo y tranquilo. Un chico llega a una colmena detenida, enciende seis sellos y despierta a Amaranta, la guardiana dormida en el Corazón. Hay 30 celdas con un vecino cada una, un misterio que se resuelve cruzando testimonios y tres finales. Idiomas: español (original), inglés, ruso y chino.

Este repositorio contiene **el juego completo y jugable (v43)**. No se reconstruye desde cero: se mejora y se ordena por fases sin que deje de funcionar nunca (ver `docs/plan.md`).

## Comandos

```bash
npm install                 # una vez (instala esbuild y Playwright)
npx playwright install chromium   # una vez, el navegador de las pruebas
npm run build               # src/ → dist/colmena.html, dist/index.html, dist/colmena-demo.html
npm run build:min           # igual, minificado (lo que se publica)
npm test                    # construye y juega 5 pruebas en escritorio y en móvil
npm run serve               # sirve dist/ en http://localhost:8080
npm run datos               # vuelca textos y datos del juego a data/*.json
npm run formato             # deja src/ con líneas cortas (Prettier); no cambia el juego publicado
```

Un push a `main` publica `dist/` en GitHub Pages (`.github/workflows/pages.yml`).

## Para gastar menos al leer el código

- El código de `src/` está formateado con Prettier (una instrucción por línea). Lee tramos con `offset`/`limit` o busca con grep; no hace falta abrir archivos enteros. Tras tocar código, `npm run formato`.
- Hay un mapa del código en `graphify-out/` (no se sube a GitHub): `graphify query "pregunta"` dice en qué archivo y línea está cada función. No recoge las envolturas de funciones globales; para esas, grep (`const a0=act` y parecidos).
- `npm test` completo tarda unos 20 minutos. Mientras trabajas, lanza solo lo afectado (`npx playwright test -g "Acto III"`) y la batería completa antes de subir. Si `dist/` minificado queda idéntico byte a byte, no hace falta repetirla.

## Cómo está hecho (lo imprescindible; el detalle está en `docs/arquitectura.md`)

- **Un solo HTML, sin dependencias en tiempo de ejecución.** `scripts/build.mjs` pega `src/head.html` + three.js (`vendor/`) + `src/game.js` con los módulos insertados en sus huecos `/*@@...@@*/`, en el orden de `src/manifiesto.json`.
- **Todo es global y el orden importa.** Los módulos de `src/modulos/` se cargan en el mismo ámbito que `game.js` y muchos **envuelven funciones globales** ya definidas (`act`, `talk`, `goTo`, `cross`, `crossAt`, `crossPlan`, `PUZ.open`, `PUZ.why`, `startGame`, `openTitle`, `frameLogic`…). Si añades un módulo, ponlo en el manifiesto después de lo que envuelve.
- **El estado del jugador** es `PROG.F` (banderas) y `PROG.bag` (mochila, 3 huecos). `save()` lo guarda en `localStorage` (`colmena-progreso`, `-2`, `-3` para las tres ranuras, más copia `-bak`). «Guardar copia» descarga un `.json` (`pulido.js`).
- **Dibujo:** 3D con three.js r169 por defecto (`render3d.js`, `lowpoly3d.js`, `props3d.js`, `rooms3d.js`, `salas.js`). El dibujo de papel 2D (`STYLE`, en `game.js`) queda como respaldo y para texturas de suelo y pared.
- **Ganchos por fotograma en 3D:** `R3DX.push(dt=>…)`.
- **Textos:** todo texto visible pasa por `_t('texto en español')`. Las traducciones se añaden con `I18N([[es,en,ru,zh],…])` y las plantillas con huecos con `TPLadd('… {n} …', en, ru, zh)`.
- **Modo libre** (`#bfree`): todas las puertas abiertas y nada se guarda. Es la forma rápida de probar cualquier cuarto (`fastTravel('oce')`).

## Reglas que no se cambian sin preguntar al dueño

- El juego se llama **Colmena**. Se respetan todos los nombres de celdas y vecinos (`docs/historia.md`, `data/celdas.json`).
- **El protagonista es un chico**, con avatar configurable. No habla; Amaranta narra en primera persona.
- Solo **web** (navegador de escritorio y móvil). Nada de APK, iOS ni Steam por ahora.
- **Nadie miente** en el misterio: cada testigo cuenta lo que vio. La «Línea de tiempo oficial de esa noche» de `docs/historia.md` manda sobre cualquier diálogo.
- El final B se llama «Nuevo guardián». Tono de cuento de papel recortado, melancólico y tierno; el terror del Acto III es suave.
- No más tráileres por ahora.

## Calidad mínima de cualquier cambio

- `npm test` en verde en escritorio y en móvil. Si tocas puertas, caminos o desbloqueos, la prueba «desde cualquier celda se llega a cualquier otra» no puede fallar.
- Móvil primero: botones de 44 px, nada que se salga de la pantalla, textos que no se pisan (el reparto de textos está en `pulido.js`).
- Rendimiento: si añades muchas piezas que se mueven, usa `InstancedMesh` o fúndelas con `Bk` (ver `salas.js`).
- Texto nuevo = sus cuatro idiomas en el mismo cambio.
- Antes de dar algo por hecho, ábrelo y míralo (captura en escritorio y en móvil).

## Cómo trabajar con el dueño del proyecto

- Escríbele en **español**, claro y sin tecnicismos innecesarios.
- Le gusta **ver las ideas antes de ejecutarlas** cuando cambian la historia, el diseño o la distribución. Para trabajo ya acordado, avanza sin pedir permiso en cada paso.
- En cada entrega incluye **un enlace para abrirlo desde la web** (la página de GitHub Pages) y, si es visual, una captura de antes y después.
