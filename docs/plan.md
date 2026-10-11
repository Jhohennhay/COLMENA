# Plan de trabajo en Claude Code

**Decisión:** no se reconstruye desde cero. El juego v43 funciona, tiene mucho trabajo de diseño encima y pruebas que lo protegen. Se mejora por fases, y **cada fase termina con el juego jugable, `npm test` en verde y un enlace web para verlo**.

| Fase | Qué se hace | Hecho cuando |
| --- | --- | --- |
| 0 · Puesta en marcha | Subir el repositorio a GitHub, activar Pages, `npm install`, `npm test` | El juego se abre desde `https://<usuario>.github.io/colmena/` y las 10 pruebas pasan |
| 1 · Ordenar sin cambiar nada | Un script que liste cada función global envuelta y por qué módulos; reunir las envolturas de las funciones más usadas (`act`, `talk`, `cross`, `crossAt`, `goTo`, `PUZ.*`) en un solo lugar por función | Mismo comportamiento (pruebas y capturas iguales) y un mapa de envolturas en `docs/` |
| 2 · Pruebas de la historia | Partidas automáticas: capítulo 1 completo, los seis sellos, el tablero de cinco preguntas, el Acto III y los tres finales (inyectando estado donde haga falta) | Las tres rutas a los finales pasan solas |
| 3 · Datos fuera del código | Diálogos, misiones y pistas pasan a `data/*.json` y el build los incrusta | Cambiar una frase no requiere tocar código; las traducciones siguen completas |
| 4 · Las salas | Aplicar `docs/guia-salas.md` a los 27 cuartos restantes, por barrios, con captura de antes y después | Cada cuarto tiene pieza protagonista, arquitectura, suelo, luz, capa alta y movimiento propios |
| 5 · Las conexiones | Avión de papel (Otoño→Sótano), esclusa (Océano↔Primavera), estrellas-peldaño (Verano↔Espacio), enredadera (Corazón↔Estudio) e icono del transporte en el cartel de la puerta (`docs/conexiones.md`) | Ningún cambio de piso se hace caminando por una rampa |
| 6 · De papel a 3D | Los muebles que aún son recortes (almeja y arrecife del Océano, yunque del Volcán…) pasan a 3D | Ningún mueble de cuarto rediseñado es un recorte plano |
| 7 · Rendimiento | 60 fps en un móvil medio, carga más ligera, separar un poco más los cuartos si hace falta | Medido con el ajuste de calidad automático y en un móvil real |
| 8 · Prueba con jugadores | 3 o 4 personas juegan 20 minutos sin ayuda y envían el «Informe de prueba» | Los problemas que aparezcan en más de una persona están resueltos |
| 9 · Versión 2 | Lo que `docs/historia.md` deja fuera de la versión 1 | Se decide una por una con el dueño del proyecto |

Lo pendiente de antes de la mudanza que no entra en ninguna fase: voz grabada del narrador (hoy usa la voz del sistema).

## Estado (11 de octubre de 2026)

- Fase 0 hecha: el juego está en `https://jhohennhay.github.io/COLMENA/`.
- Fase 2 hecha antes que la 1, a propósito: `tests/historia.spec.js` juega los seis sellos, el tablero, el Acto III y los tres finales. Sirve de red para ordenar el código.
- Fase 1 en curso: código formateado (`npm run formato`) y mapa de envolturas en `docs/envolturas.md` (`npm run envolturas`). Falta reunir las envolturas de las funciones más usadas en un solo lugar por función.

## Primer encargo sugerido

> Lee `CLAUDE.md`, `docs/arquitectura.md` y este plan. Instala las dependencias, ejecuta `npm test` y cuéntame qué ves. Después propón cómo harías la fase 1. No cambies código todavía.
