# Decisiones de Colmena

Qué se eligió y qué se descartó, con el porqué. Lo más reciente, arriba. Léelo antes de proponer un cambio de dirección.

## 6 nov 2026

- **Pulido.** Los vecinos mueven la boca mientras dura su frase (unas 15 letras por segundo, porque el texto sale de golpe); el chico no. El humo del Sótano se ve: gris tostado, sin tapar a nadie. Nada tapa la vista: lo que tapaba Otoño era la torre del ascensor de `conexiones.js`, no una celda; ahora se lanzan rayos al suelo del cuarto y se esconde cualquier grupo que corte antes (vuelve a verse a los 0,6 s).
- **Rendimiento de esos rayos.** En móvil se llevaban la mitad del procesador. Elegido: probar primero contra la caja de cada pieza; las piezas de más de 1.500 triángulos, y en móvil todas, cuentan como que tapan si su caja lo hace, y en móvil se lanzan cada 0,4 s en vez de 0,15. Se esconde algo de más a veces. Descartado: probar triángulo a triángulo en móvil.
- **Móvil.** Solo en pantallas táctiles: lo quieto de cada cuarto se funde en una malla por material, el chico y el vecino en una, los vecinos sin animación ni brillos, menos cuartos alrededor y el suelo dinámico a 8 veces por segundo. Medido en móvil simulado (Pixel 7, procesador frenado 4 veces): mediana de 10 a 16 imágenes por segundo, mínimo de 2-3 a 6. No llega a la meta de 30, y falta probarlo en un teléfono real. Escritorio sin cambios (mediana 60, mínimo 45). Se ve distinto en móvil: asoma el fondo donde antes había cuartos lejanos, y los vecinos quedan quietos. Se apaga con `window.COLMENA_MOVIL0` para comparar.

## 5 nov 2026 (tarde)

- **El dueño aprobó cerrar la Temporada 1, pulir, ordenar lo público y el móvil** (puntos 3 a 6 de la lista del coordinador). Lo que ya estaba hecho de esa lista: una sola mesa en La Última Cena (11 oct) y Primavera más clara y ligera (2 nov).
- **Mochila.** Pasa de 3 a 5 huecos desde el capítulo 5 (sello 4), porque los encargos de la Temporada 2 piden más cosas a la vez. En la Temporada 1 se queda en 3. En pantalla estrecha, con 5 huecos sube por encima de los botones y se aparta mientras Amaranta narra. Descartado: 4 huecos (se quedaba corto en la memoria) y esconder los nombres (no ganaba sitio).
- **La Temporada 2 deja de publicarse** (`colmena.html` fuera de GitHub Pages), igual que las pruebas de diseño. Se sigue construyendo para las pruebas. Consecuencia: el dueño ya no puede verla desde la web; para revisarla habrá que abrirla en este equipo o publicarla aparte.
- **Narración del Tren:** sin respuesta del dueño; se queda como está, que era la opción recomendada.

## 5 nov 2026

- **Salida en itch.io, preparada sin publicar.** El dueño dijo «continúa» sin responder a las dos preguntas abiertas (la narración del Tren y el siguiente paso). Elegido: avanzar con lo que no depende de él, que es el paquete de la Temporada 1 para itch.io (zip con `index.html`), la portada, las capturas, los textos en español e inglés y la guía. Pendiente que lo suba él con su cuenta. Sugerido mientras no haya modelo de venta: gratis o con donación. Sin decidir y sin tocar: la narración del Tren.

## 30 oct 2026

- **Rumbo tras el diagnóstico.** El dueño eligió: primero PC, móvil después; modelo de venta sin decidir; primera tienda itch.io (respondió «1» a la pregunta de tienda; lo interpreto como la primera opción, itch.io para probar y Steam después). Objetivo: cerrar la Temporada 1 como producto.
- **Historia.** Mandan los textos del juego sobre el documento: sello 4 («Subió mi sombrero…», que cuadra con la línea de tiempo), 18 testimonios, capítulo 3 «Las celdas dormidas», menta en el Colmenar. Nube dice ahora treinta celdas. Queda abierta para el dueño la narración del Tren («Yo iba dentro»); no se toca.
- **Apertura de la Temporada 2** conectada: se oye una vez al llegar al capítulo 4 o al continuar en el juego entero una partida que vio el cierre de la Temporada 1. Probada la continuidad de la partida entre las dos páginas.
- **Publicación.** Las páginas de prueba rechazadas y la demo en papel dejan de publicarse, aunque se sigan construyendo para las pruebas. `colmena.html` (Temporada 2) sigue pública mientras no se decida cómo venderla: es donde el dueño la revisa.

- **Primeros minutos.** Causa de la lentitud: varios gastos sin rendimiento visible, sobre todo dibujar los 30 cuartos a la vez. Elegido: los cuartos a más de 1.100 unidades no se dibujan (`R3DLEJOS`; vuelven al alejar la cámara, en viajes y en el mapa); el tono pasa a sombreador en vez de filtro CSS; el suavizado baja de 4 a 2 muestras si no llega a 50 imágenes por segundo; mapa de sombras cada dos fotogramas; la vegetación no hace sombra. Primavera dormida con luna fría y charcos de miel. Creador con personaje 3D real. Retratos con luz de día solo durante la foto. Descartado: radio 650 (se perdía la esquina del vecino), sombras duras, vecinos simplificados.
- **Piezas de la Temporada 1.** Los 12 cuartos tienen ya pieza con detalle de cerca. El modelo se construye la primera vez que se entra en explorar en ese cuarto, con coste cero en la vista normal. Telescopio, horno e iglú eran cartas de papel: en explorar se sustituyen por 3D. Descartado: pesas en el reloj (chocaban con las ruedas), relieve en la duna (parecía una manta).
- **Rendimiento medido al integrar:** versión publicada frente a nueva, alternando dos veces a 1080p (Primavera 29/45 frente a 43/44; Volcán 22/53 frente a 44/55; Sótano 17/48 frente a 46/54). Hay mucho ruido, porque el equipo estaba cargado. En esas medidas la calidad adaptativa bajó la resolución interna al 55-60 % en las dos versiones: en esta gráfica el juego se ve algo menos nítido para sostener la fluidez.

## 15 oct 2026

- **Inspiración: «El Principito entre las estrellas»** (littleprince.dev, Unity + WebGPU + modelos de Tripo, unos 89 MB por visita). Respuestas del dueño: quiere las dos cosas (recorrer de cerca y más detalle), acepta hasta unos 20 MB, aún no usar Tripo, el modo explorar se añade con un botón, y se prueba primero en Primavera.
- **Modo explorar** (`explorar.js`): botón ◎ y tecla C; cámara detrás y por encima del chico, que gira despacio hacia donde anda; arrastrar la gira sin topes. Si el punto de detrás queda fuera de la celda, la cámara sube para mirar por encima del muro. Descartado: acercar la cámara contra el muro (quedaba pegada a la cara del chico) y sustituir la vista de siempre.
- **Vegetación** (`detalle.js`, de momento solo Primavera): miles de briznas y flores en una sola malla, mecidas por el viento en la tarjeta gráfica, junto a los muros y al pie de los muebles, dejando libre el centro, las puertas y al vecino. Descartado: modelos descargados (peso) y Tripo (el dueño lo aplaza). Descartado: pasar el juego a Unity.

- **Segunda ronda por especialistas** (el dueño: «a tu criterio, con subagentes expertos»).
  - *Vegetación* (`detalle.js`): Primavera mejorada; nueva en Jardín (césped y margaritas), Invernadero (helechos y florecillas con brillo débil, pequeñas para no confundirse con las flores que se recogen), Océano (posidonia que ondula) y Colmenar (lavanda, margaritas, borraja). Verano y Otoño sin nada: una terraza de baldosas y un taller de madera no piden hierba. Descartado: sombras de la vegetación (coste).
  - *Cámara de explorar* (`explorar.js`): muelles amortiguados, campo de visión más abierto, piezas sueltas que tapan al chico se vuelven translúcidas y, si tapa un muro, la cámara sube; rueda y pellizco acercan; transiciones de entrada y salida; los carteles de puerta, que se dibujan en el lienzo, se encogen a un tamaño de letra normal. Descartado: aclarar mallas grandes fundidas (aclararía medio cuarto).
  - *Piezas* (`salas.js`, `salas2.js`): cerezo y bancal de Primavera, piscina y sombrilla de Verano, prensa de Otoño, bufanda y ovillo de Invierno. El detalle fino solo se monta en modo explorar y en el cuarto donde está el chico, para no cargar la vista normal. Descartado: pétalos que caen (otra pieza en movimiento).

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
