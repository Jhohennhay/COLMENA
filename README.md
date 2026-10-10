# Colmena

Juego web narrativo: un chico, una colmena de papel detenida, treinta vecinos y seis sellos para despertar a Amaranta.

- **Jugar:** abre `dist/colmena.html` en el navegador (o la página de GitHub Pages cuando esté activada).
- **Trabajar con Claude Code:** abre esta carpeta en Claude Code. Lee primero `CLAUDE.md`; ahí están los comandos, las reglas y cómo está hecho.

## Primeros pasos con Claude Code

1. Crea un repositorio vacío en GitHub llamado `colmena` (privado) y sube esta carpeta, o simplemente abre la carpeta en Claude Code.
2. Pídele: *«Lee CLAUDE.md y docs/plan.md, instala las dependencias, ejecuta npm test y dime qué ves. No cambies nada todavía.»*
3. Cuando las pruebas estén en verde, sigue el plan por fases de `docs/plan.md`.

## Qué hay en cada carpeta

| Carpeta | Contenido |
| --- | --- |
| `src/` | El código del juego: `game.js` (núcleo), `modulos/` (sistemas, cuartos, 3D, misiones…), `i18n/` (traducciones), `head.html` (estilos y estructura de la página) |
| `vendor/` | three.js r169 (licencia MIT), recortado para el juego |
| `scripts/` | Construir el juego y extraer sus datos |
| `dist/` | El juego construido, listo para abrir o publicar |
| `data/` | Todos los textos y datos del juego en JSON (celdas, diálogos, misterio, traducciones…) |
| `docs/` | Historia, arquitectura, plan, guía de estilo de las salas, conexiones, cambios y capturas |
| `tests/` | Pruebas automáticas de navegador (escritorio y móvil) |
