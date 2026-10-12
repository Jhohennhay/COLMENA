# Arte generativo de Colmena: «Enjambre en reposo»

Este documento fija la idea con la que se generan por código el fondo y las texturas de la versión adulta (`src/modulos/adulto.js`). No es una imagen dibujada: es un procedimiento con semilla, así que siempre sale igual en el juego y se puede variar cambiando un número.

## La idea

Una colmena dormida no está quieta: guarda la huella de todos los vuelos que hubo en ella. «Enjambre en reposo» dibuja esa huella. No pinta abejas ni panales; pinta el aire que dejaron. El fondo del juego deja de ser un papel crema con hexágonos y pasa a ser una penumbra cálida, de cera y humo, atravesada por miles de trazos finísimos que siguen corrientes invisibles.

## Cómo se genera

Un campo de corrientes hecho con ruido suave por capas decide, en cada punto, hacia dónde iría una abeja. Sobre ese campo se sueltan unos miles de trazos cortos; cada uno avanza unas decenas de pasos y deja una línea casi transparente. Donde las corrientes coinciden, los trazos se acumulan y aparece luz; donde se separan, queda sombra. Nadie coloca las zonas claras: salen solas de la suma.

El campo no es libre del todo. Debajo hay una retícula hexagonal que no se dibuja, pero tuerce las corrientes: cerca de cada vértice el trazo gira, como si rodeara una celda. Por eso, al mirar de lejos, se intuye el panal sin que haya una sola línea recta. Es la firma de la colmena, escondida en el movimiento en lugar de impresa encima.

El color viene de la altura: arriba, pardo casi negro; en medio, cera tostada; abajo, un resplandor de miel, porque la luz de este mundo sube desde el Corazón. Los trazos toman el color de la franja que cruzan, un punto más claros, y un grano fino de papel lo une todo.

## Reglas de oficio

- Mucho trazo y muy poca opacidad: la riqueza viene de acumular, nunca de un trazo que destaque.
- Los parámetros están afinados a mano, uno por uno, hasta que la imagen deja de parecer ruido: número de trazos, largo, escala del ruido, fuerza de la retícula y semilla.
- La misma semilla da siempre el mismo fondo. La del juego es 1907.
- El fondo nunca compite con el cuarto: es oscuro, de bajo contraste, y la niebla de la escena toma su color para que las celdas lejanas se fundan con él.
