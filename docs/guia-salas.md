# Guía de estilo de las salas

Primavera, Océano y Volcán (`src/modulos/salas.js`) son el modelo. Los otros 27 cuartos se hacen con el mismo criterio. Antes y después: `docs/capturas/salas-antes-despues.png`.

**Hechas (6 de 30):** Primavera, Océano y Volcán (`salas.js`); Verano, Otoño e Invierno (`salas2.js`, antes y después en `docs/capturas/barrio1-antes-despues.png`). Los cuartos nuevos se registran con `SALAS.add(id, itemsGenéricosQueSeQuedan, () => grupo, { hideTiles: 1 })` y usan las piezas de `SALAS.kit` (suelo con textura propia, `lightPool`, `vignette`, piezas colgantes que se mecen).

## El problema que resuelve

Antes todas las salas eran la misma caja: el mismo hexágono, el mismo suelo de baldosas, un muro bajo y objetos pegados a la pared. El centro quedaba vacío, la luz era plana y se repetían cajas y barriles en todas.

## Las seis capas de cada sala

1. **Pieza protagonista.** Una sola, grande, en el centro o al fondo, que cuenta el cuarto y se recuerda: el invernadero de cristal, el esqueleto de ballena, el lago de lava.
2. **Arquitectura propia que sale del hexágono.** Cristaleras, algas altas o columnas de basalto. Cada cuarto se tiene que reconocer también desde el mapa. Más alto al fondo y más bajo hacia delante, para no tapar la vista.
3. **Suelo propio.** Musgo y charcos, arena con ondas y reflejos de agua, basalto con vetas encendidas. Las baldosas de miel solo se quedan si encajan con el cuarto.
4. **Luz con intención.** Un charco de luz principal (`lightPool`), bordes en penumbra del color del cuarto (`vignette`) y lo que brilla, con brillo (`glowSprite`, materiales sin sombra).
5. **Capa en altura.** Cosas colgando o en el aire: cestas y guirnaldas, peces y medusas, humo y chispas.
6. **Movimiento pequeño.** Lluvia en el cristal, algas que se mecen, lava que fluye. Si el modo tranquilo está activo (`still`), se para.

Composición: uno o dos objetos grandes, unos cinco medianos y más de diez pequeños agrupados, dejando un camino libre. Nada de cajas repetidas.

## Receta técnica (ver `salas.js`)

- La decoración de un cuarto es un `THREE.Group` que devuelve `PROPS3D.addRoom(id, () => grupo)`. Para conservar la de antes, envuélvela (así se hizo con Primavera).
- Piezas estáticas: añádelas a un `Bk` y fúndelas en una sola malla (`B.mesh(g)`, o `F.mesh(g, true)` para facetado). Coordenadas del cuarto con `P(x, y, z)`; puntos en una pared con `WP(pared, u, z, hacia_dentro)` y su giro con `WYAW(pared)`. Paredes del fondo: `[3,4]` izquierda, `[4,5]` centro, `[5,0]` derecha.
- Muchas piezas que se mueven igual (gotas, peces): una `InstancedMesh`.
- Materiales propios: pásalos por `keep(id, material)` para que se oscurezcan con las vecinas y no se destruyan al reconstruir el cuarto.
- Lo que ocupa suelo necesita su obstáculo: `solid(id, x, y, radio)`. Comprueba después que el vecino, las puertas y los objetos siguen alcanzables (prueba de rutas).
- Suelo propio: `floorMesh(...)` para relieve con color por vértice; `layer(...)` para capas de luz encima. Las baldosas del cuarto se ocultan en el gancho del final de `salas.js`.
- Animación en `g.userData.tick = (t, still, amb) => {…}`.

## Lista de comprobación por sala

- [ ] Pieza protagonista reconocible en una captura pequeña de móvil.
- [ ] La silueta del cuarto cambia (algo sobresale del muro).
- [ ] Suelo, luz y color de penumbra propios.
- [ ] Algo en altura y algo que se mueve; todo se para en modo tranquilo.
- [ ] Vecino, puertas, objetos y páginas siguen a la vista y alcanzables.
- [ ] Captura de antes y después en escritorio y en móvil.
- [ ] Sin bajar los fotogramas (pocas mallas nuevas; instancias para lo repetido).

## Ideas de pieza protagonista para los demás cuartos

| Cuarto | Vecino | Pieza protagonista sugerida |
| --- | --- | --- |
| Verano | Solano | La piscina de miel con su sombrilla gigante y un sol de papel que gira en el techo |
| Otoño | Ocre | La prensa de imprenta enorme, con pliegos colgados a secar como banderines |
| Invierno | Escarcha | La bufanda infinita que da vueltas por todo el cuarto, y la brasa en una chimenea de hielo |
| Espacio | Orión | El telescopio de latón apuntando por una cúpula abierta, con estrellas que se cansan |
| Desierto | Duna | El horno de vidrio con frascos que brillan y una duna que entra por la ventana |
| Antártida | Témpano | Un témpano tallado como buzón, con cartas congeladas y aurora en el cielo |
| Colmenar | Abril | Las colmenas de madera apiladas en torre, con abejas saliendo |
| Biblioteca | Tomo | Una estantería en espiral que sube por encima del muro, con escalera de biblioteca |
| La Última Cena | Miel | La mesa puesta a medio comer, con el reloj parado encima |
| Relojería | Péndulo | Un reloj de péndulo gigante con los engranajes a la vista y péndulo que oscila |
| Invernadero nocturno | Luna | Flores luminosas que se cierran cuando las miras |
| Teatro de sombras | Telón | El escenario con telón rojo y figuras de sombra proyectadas en la pared |
| Faro | Albor | La lámpara del faro con su haz girando sobre la colmena |
| Tren nocturno | Estela | El vagón con ventanillas y el andén con el reloj del tren |
| Sótano de cera | Vela | Velas derretidas formando estalactitas y la cera escrita en las paredes |
| Cueva de cristales | Geoda | Una geoda abierta enorme, con el cristal que late |
| El Campanario | Nube | La campana de medianoche colgando, con cometas atadas |
| Desván | Trasto | Una montaña de baúles y la caja cerrada en lo alto |
| Estudio de Amaranta | Pluma | El escritorio con la pluma que escribe sola y cartas en el aire |
| Sala de retratos | Marco | Un caballete enorme y retratos que siguen con la mirada |
| Jardín de los nombres | Rocío | El árbol sin nombre en el centro, con etiquetas colgando |
| El Corazón | Amaranta | El capullo de cera que late, con raíces de luz hacia los seis sellos |
| El Andén Vacío | Silbo | El último tren parado y el horario con letras que cambian |
| La Casa de los Ecos | Eco | Pasillo de espejos y conchas que repiten lo que oyes |
| Objetos Perdidos | Olvido | Estanterías infinitas con etiquetas y un mostrador con campanilla |
| La Celda del Apicultor | Alvéolo | El viejo dormido en su sillón y el reloj de cuerda |
| El Reverso | Etorb | El mismo cuarto que el Corazón, pero del revés y en tonos fríos |

Son propuestas: se enseñan al dueño antes de construirlas.
