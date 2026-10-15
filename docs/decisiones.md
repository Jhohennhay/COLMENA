# Decisiones de Colmena

Qué se eligió y qué se descartó, con el porqué. Lo más reciente, arriba. Léelo antes de proponer un cambio de dirección.

## 15 oct 2026

- **Inspiración: «El Principito entre las estrellas»** (littleprince.dev, Unity + WebGPU + modelos de Tripo, unos 89 MB por visita). Respuestas del dueño: quiere las dos cosas (recorrer de cerca y más detalle), acepta hasta unos 20 MB, aún no usar Tripo, el modo explorar se añade con un botón, y se prueba primero en Primavera.
- **Modo explorar** (`explorar.js`): botón ◎ y tecla C; cámara detrás y por encima del chico, que gira despacio hacia donde anda; arrastrar la gira sin topes. Si el punto de detrás queda fuera de la celda, la cámara sube para mirar por encima del muro. Descartado: acercar la cámara contra el muro (quedaba pegada a la cara del chico) y sustituir la vista de siempre.
- **Vegetación** (`detalle.js`, de momento solo Primavera): miles de briznas y flores en una sola malla, mecidas por el viento en la tarjeta gráfica, junto a los muros y al pie de los muebles, dejando libre el centro, las puertas y al vecino. Descartado: modelos descargados (peso) y Tripo (el dueño lo aplaza). Descartado: pasar el juego a Unity.

## 12 oct 2026

- **Trabajo por roles (motor, animación, ambiente)**, pedido por el dueño: «decide tú, con subagentes, buscando el mejor rendimiento y gráficos».
  - *Motor.* Elegido: exponer clases que el three.js recortado ya llevaba dentro (WebGLRenderTarget, ShaderMaterial y otras) en vez de engordar el bundle. Reflejos reales a media resolución (`post.js` + `mojado.js`), con los gemelos como respaldo automático. Brillo de pantalla sutil a 1/4 y 1/8, solo en escritorio. Descartado: `copyFramebufferToTexture` (2,7 fps con reflejos), resolver profundidad del destino MSAA (10 fps), bloom en móvil (sin medir en teléfono real).
  - *Animación.* Elegido: tobillo, pelvis y costillas nuevos; paso por claves con apoyo de talón; velocidad medida dentro de `animate`; capa, bufanda y pelo con muelle. El chico trota a su velocidad normal (andando patinaría); constante `TROTE` si se quiere cambiar. Descartado: tela simulada y cinemática inversa completa (coste en móvil); mover la boca al hablar (haría falta que `render3d.js` pase `talk`).
  - *Ambiente.* Elegido: un solo efecto por cuarto en 16 cuartos (`clima.js`, tabla `CLIMA`), una malla y +1 dibujo cada uno. 14 cuartos sin nada porque ya tenían su movimiento o son de noche mojada. Descartado: haces de luz inventados donde no hay ventana; congelar el aire en cuartos dormidos (sin probar).
  - Presupuesto que se puso: reflejos + brillo no bajan la fluidez más de un 25 %; cada clima, como mucho 2 dibujos extra. Medido con todo integrado a 1080p en la UHD 620: de 34 a 60 fps (Primavera, el más pesado, pierde un 23 %).

- **Noche mojada en Andén, Invernadero y Tren.** Elegido: lluvia solo en el Andén, que está a la intemperie; en el Invernadero (techo de cristal) y el Tren (vagón) el suelo brilla y refleja, pero no llueve dentro. Descartado: llover en los tres, porque bajo techo no tendría sentido.

- **El Faro como muestra de «noche mojada»** (`src/modulos/mojado.js`), tras ver una demo de three.js de una tienda bajo la lluvia. Elegido: lluvia dentro del cuarto, luz fría contra la cálida de la lente, suelo oscuro y reflejos en escritorio. Los reflejos son una copia espejada de cada pieza recortada con plantilla, porque el three.js del juego va recortado (sin texturas de destino ni sombreadores). Descartado por ahora: ampliar el motor para reflejos y brillo de pantalla reales (más peso y más trabajo); reflejos en móvil (rendimiento); página de prueba aparte.
- **Andar natural** para todos los personajes 3D: hombros contra cadera, cadera que cae, codo que se dobla al avanzar. Descartado: tocar la capa, que ya tenía su propio vaivén.

- **Versión adulta en todo el juego.** Elegido: personajes 3D de proporción adulta, sombras, colores menos saturados, fondo generativo oscuro, retratos 3D (`src/modulos/adulto.js`). Motivo: el dueño sentía que el juego parecía hecho para niños. Descartado: seguir solo con recortes de papel; quedan en la demo.
- **Proporción de muebles.** Elegido: agrandar los personajes 3D un 30 %. Descartado: redimensionar mueble por mueble en 30 cuartos (mucho trabajo, mismo efecto).
- **Puentes.** Elegido: quitar los puentecitos de las puertas; el puente giratorio de la manivela se queda (es un acertijo) y se esconde si tapa la vista. Descartado: quitar también el giratorio.
- **Referencia No Man's Sky.** Descartado copiar su jugabilidad (exploración procedural infinita): sería otro juego. Se toma solo la idea de atmósfera y de descubrir.
- **Tráiler.** Hecho uno de muestra con juego grabado en movimiento. Pendiente para uno público: música de verdad.
- **Pruebas con tarjeta gráfica.** En Windows las pruebas y capturas usan la Intel UHD 620 del equipo; en GitHub siguen por software.

## 11 oct 2026

- **Dos temporadas.** Temporada 1 (12 celdas, hasta el tercer sello) en la portada; Temporada 2 en el juego entero. Motivo: 30 cuartos eran muchos para un primer juego.
- **Rediseño de los 30 cuartos** con la receta de las tres salas modelo: una pieza protagonista, algo sobre el muro, suelo propio, luz intencionada, medio suelo libre.
- **Descartado: islas separadas, «receta ligera» y estilo Monument Valley.** El dueño sintió que se perdía la base del juego.
- **La cesta de las abejas** sustituye a escaleras y caminos largos.
- **La Última Cena con una sola mesa**, la larga, con los 25 platos.
- **Paleta**: no se cambia la base; ocho cuartos reciben un matiz propio (`src/modulos/paleta.js`).
- **Ritmo de trabajo**: comprobación corta y publicar; la batería completa corre en GitHub.
