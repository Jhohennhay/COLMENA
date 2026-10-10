# Colmena — La historia completa

Oct 4, 2026 · @Jhohennhay

Biblia narrativa y de diseño de «Colmena» para reconstruir el juego desde cero en Claude Code. Recoge la trama, los 30 habitantes, cada misión, el misterio, los finales y las reglas del mundo tal como están en la versión actual (v34).

> **Nota del 10 de octubre:** el plan cambió. El juego ya no se reconstruye desde cero: se mejora por fases sobre la v43 (`docs/plan.md`). Todo lo que este documento dice de la historia, los nombres, el misterio y los finales sigue mandando. Los textos revisados el 4 de octubre ya están aplicados en el juego. Los datos actuales del mapa y las conexiones están en `data/celdas.json` y `docs/conexiones.md`.

## La premisa

Amaranta, la guardiana de la colmena, la detuvo una noche a las cuatro menos cuarto y se encerró dormida en el Corazón. El protagonista, un chico, llega a la colmena parada y debe encender seis sellos para despertarla.

La colmena es un panal de celdas hexagonales unidas por puentes. Cada celda es un mundo pequeño con un habitante. La colmena «late una vez por cada día del mundo»; al pararse, todo se quedó a oscuras y quieto.

Prólogo (voz de Amaranta):

> La colmena late una vez por cada día del mundo. Esta noche la he detenido. Perdóname por dejarte esto a ti. Enciende los sellos. Te espero en el corazón.

**El tema:** una colmena no se manda, se escucha. Se para cuando quien la cuida deja de escucharla. Amaranta no huía: estaba agotada y necesitaba que alguien volviera a escuchar por ella.

**El linaje de guardianes:** el viejo apicultor Alvéolo cuidó la colmena, se durmió y Amaranta lo encontró con veinte años. Ahora Amaranta duerme y llega el protagonista. No es la primera vez que el panal se para, ni ella fue la primera en despertarlo.

**La verdad (lo que el jugador descubre):** a medianoche Amaranta dejó de escuchar la colmena y de esa grieta nació Eco, su parte de papel. Eco tocó la campana, se puso el sombrero con velo de Amaranta y subió al último tren (3:45, destino Ayer) para que nadie la buscara abajo. Amaranta, que había pasado la noche con Vela fundiendo una sola carta, bajó a pie al Corazón, lo cerró con la llave de Ceniza y dejó un libro, una llave y un árbol para quien viniera a despertarla. **Nadie miente:** cada testigo cuenta lo que vio, y Estela vio a Eco.

**El tono:** cuento tranquilo de papel recortado, melancólico y tierno. El Acto III añade un toque de terror suave (fantasmas de papel), sin sustos violentos.

## Línea de tiempo oficial de esa noche

Esta tabla es la fuente de verdad: cualquier diálogo, página o testimonio debe poder cuadrar con ella. Cada hecho tiene al menos un testigo que el jugador puede encontrar.

| Hora | Qué pasa | Quién lo vio |
| --- | --- | --- |
| Días antes | Amaranta pide a Ceniza la llave del corazón y luego le pide que la olvide | Ceniza |
| Última tarde | Planta el árbol sin nombre en el Jardín | Rocío |
| 21:00 | Miel ha puesto 25 platos. Amaranta entra, no llega a sentarse y vuelca su silla al irse con prisa | Miel |
| 22:00 | Sube al Desván la caja con el libro sin título, «para cuando esté lista» | Trasto |
| 00:00 | Amaranta deja de escuchar la colmena. Nace Eco, una chica de papel casi transparente, y toca la campana una sola vez | Nube (ve a «alguien de papel» tirar de la cuerda) |
| 00:00–03:30 | Amaranta funde en el Sótano una sola carta, la suya. Mientras tanto Eco escribe con su letra 99 despedidas que ella nunca se atrevió a escribir | Vela |
| 03:30 | Amaranta guarda el primer latido en un frasco vacío y lo deja en la plaza escondida. Luego baja a pie hacia el Corazón; el faro se desvía y la alumbra | Nube, Albor |
| 03:45 | Cierra el Corazón con la llave y se duerme. Todos los relojes se paran. Sale el último tren (destino Ayer) con Eco a bordo, con el sombrero con velo | Péndulo, Silbo, Estela |
| Al amanecer | El tren vuelve vacío. Estela recoge el sombrero del asiento y lo guarda; no recuerda haber visto la cara bajo el velo | Estela |

Eco no es una villana: es la parte de Amaranta que no quería irse. Escribió las despedidas y subió al tren para que todos la creyeran lejos y nadie bajara a despertarla antes de tiempo.

## Personajes clave

| Personaje | Quién es | Papel en la historia |
| --- | --- | --- |
| El protagonista | Un chico, avatar configurable por el jugador | Enciende los sellos, reúne la verdad y decide el final |
| Amaranta | La guardiana; sombrero con velo, cuaderno, siempre con prisa | Detuvo la colmena y duerme en el Corazón. Narra el juego en primera persona (narraciones de entrada, sellos, páginas) |
| Alvéolo | El viejo apicultor, guardián anterior | Duerme en la Celda del Apicultor (Acto III). Tiene la edad de Amaranta cuando se durmió |
| Eco | Chica de papel casi transparente | Nació a medianoche, cuando Amaranta dejó de escuchar: «el eco de alguien que no quería irse». Tocó la campana, escribió 99 despedidas con su letra y subió al último tren con su sombrero |
| Pompón | Conejito blanco (orejas grises, ojos rojizos), compañero de Amaranta | Escondido en la madriguera; al encontrarlo te sigue por toda la colmena |
| Nala | Llamita de peluche: gorrito rojo, borlas rosas, cuentas moradas, chaleco morado de cuadritos y pompón de colores | Hay que reconocerla entre otros peluches parecidos |
| Etorb | Brote «del otro lado» del espejo | Guarda El Reverso; su nombre se lee al revés |

Los otros 24 vecinos de las celdas aparecen en la tabla siguiente. Cada uno conoció a Amaranta y guarda una pieza de lo que pasó.

## Las 30 celdas

Hay 30 celdas en seis pisos: 25 de la colmena original y 5 de la colmena de abajo (Acto III). El piso va de +2 (los sueños, arriba) a −3 (la colmena de abajo).

| # | Celda (id) | Habitante | Piso | Misión principal | Lo que sabe o esconde |
| --- | --- | --- | --- | --- | --- |
| 1 | Primavera · La celda de Brote (pri) | Brote | 0 | Sol para el cerezo | Regaba antes del alba. Da agua de lluvia |
| 2 | Verano · La terraza de la siesta (ver) | Solano | 0 | Algo frío para la limonada | Espera algo que nunca se atrevió a pedir |
| 3 | Otoño · El taller de papel (oto) | Ocre | 0 | Agua para la tinta | Imprime todo lo que pasa, «casi todo». Mueve el puente a Invierno |
| 4 | Invierno · La brasa (inv) | Escarcha | 0 | Hielo para Verano | Teje una vuelta por cada día que Amaranta falta |
| 5 | Espacio · El observatorio (esp) | Orión | +2 | Una lente nueva | Cree que las estrellas se pierden |
| 6 | Océano · El arrecife (oce) | Coral | −1 | Luz para el fondo del mar | No se quita la escafandra desde que ella se fue |
| 7 | Desierto · La duna (des) | Duna | −1 | Una perla para pulir | Hizo cada frasco de Amaranta |
| 8 | Antártida · El témpano (ant) | Témpano | −1 | Llevar la aurora | Le escribe cada noche; ella nunca contestó |
| 9 | Colmenar (col) | Abril | 0 | Que salgan las abejas | «Una colmena no se manda. Se escucha.» |
| 10 | Biblioteca (bib) | Tomo | 0 | Ordenar la estantería | Falta un libro sin título con tapas de cera |
| 11 | La Última Cena (coc) | Miel | 0 | Terminar la receta de Amaranta | Puso 25 platos esa noche; la silla caída es la de Amaranta |
| 12 | Relojería (rel) | Péndulo | 0 | Poner en hora los relojes | Todos se pararon a las cuatro menos cuarto |
| 13 | Invernadero nocturno (inn) | Luna | +2 | Abrir las flores sin mirarlas | Amaranta venía aquí «a no mirarlas» para descansar |
| 14 | Teatro de sombras (tea) | Telón | +2 | Terminar la obra de sombras | Ensaya un final en que ella se queda. Esconde la madriguera |
| 15 | Faro (far) | Albor | +2 | Girar los espejos del faro | La luz se desvió sola hacia el Corazón esa noche |
| 16 | Tren nocturno (tre) | Estela | +2 | Picar estrellas en el tren | Vio salir el último tren con una pasajera con velo: era Eco. Guarda el sombrero |
| 17 | Sótano de cera (sot) | Vela | −1 | Leer la cera | Amaranta estuvo con ella hasta las tres y media fundiendo una sola carta |
| 18 | Cueva de cristales (cue) | Geoda | −1 | Encontrar el cristal que late | Amaranta le pidió un cristal que latiera |
| 19 | Volcán (vol) | Ceniza | −1 | Forjar la llave del corazón | Forjó la llave y le pidieron que la olvidara |
| 20 | El Campanario (cum) | Nube | −1 | Leer el viento con la cometa | La vio bajar a pie; vio a alguien de papel tocar la campana |
| 21 | Desván (dsv) | Trasto | +1 | Abrir la caja | Guarda la caja «para cuando esté lista», con el libro sin título |
| 22 | Estudio de Amaranta (est) | Pluma | +1 | Repartir tres cartas | Escribía sus cartas sin firma. Desde aquí se baja al Corazón |
| 23 | Sala de retratos (ret) | Marco | +1 | Pintar a Amaranta | Nunca pudo pintarla; un cuadro tapado apareció solo |
| 24 | Jardín de los nombres (jar) | Rocío | +1 | Poner nombre al árbol | Un árbol sin nombre plantado para quien la despierte |
| 25 | El Corazón (cor) | Amaranta | −2 | Despertar | Duerme con el cuaderno abierto en la última página en blanco |
| 26 | El Andén Vacío (and) | Silbo | −3 | Leer el horario del andén | El último tren salió a las cuatro menos cuarto, destino Ayer |
| 27 | La Casa de los Ecos (eco) | Eco | −3 | Escuchar a los ecos | «Si te quedas quieto, vienen.» |
| 28 | Objetos Perdidos (per) | Olvido | −3 | Encontrar lo que es del apicultor | Todo lo que la colmena olvida acaba aquí |
| 29 | La Celda del Apicultor (api) | Alvéolo | −3 | Dar cuerda al reloj | Duerme; su reloj parado a las cuatro menos cuarto |
| 30 | El Reverso (rev) | Etorb | −3 | Atravesar el espejo | Todo al revés; tu sombra sí está |

Cada celda tiene una narración de entrada de Amaranta. Ejemplos: Relojería «Aquí todas las horas se pararon a la vez. Fui yo.»; Tren «Del andén salió el último tren. Yo iba dentro.» (mentira deliberada); Corazón «Aquí estoy. Todavía no. Pero casi.»; Celda del Apicultor «Aquí duerme quien me dio las llaves. Tenía tu edad, una vez.»

## Estructura: tres actos y siete capítulos

El juego avanza por sellos: cada sello encendido abre el capítulo siguiente, y el Corazón solo se abre con los seis.

| Acto | Capítulo | Título | Celdas | Se cierra con |
| --- | --- | --- | --- | --- |
| I · El despertar | 1 | El primer sello | pri, ver, oto, inv | Sello 1: el cerezo de Brote florece |
| I | 2 | Más allá de la colmena | esp, oce, des, ant | Sello 2: la estrella vuelve a Orión |
| II · Las celdas dormidas | 3 | La casa de Amaranta | col, bib, coc, rel | Sello 3: los relojes en hora. Se abre el Andén (Acto III) |
| II | 4 | Los sueños | inn, far, tre, tea | Sello 4: la obra de sombras termina |
| II | 5 | Las raíces | sot, cue, vol, cum | Sello 5: la llave forjada |
| II | 6 | La memoria | dsv, est, ret, jar | Sello 6: el árbol tiene nombre |
| III · La colmena de abajo | en paralelo desde el sello 3 | Lo que se olvidó | and, eco, per, api, rev | Eco cruza el espejo y deja de ser transparente |
| Final | 7 | El corazón | cor | Uno de los tres finales |

Los capítulos 3 a 6 se juegan en cualquier orden. El Acto III se juega en paralelo desde el tercer sello y se cierra antes de bajar al Corazón. Los finales A y B no lo exigen; el final completo C sí, porque la verdad entera incluye a Eco. Tras el final queda el «Recorrido libre · Las treinta celdas».

## Capítulos 1 y 2: la cadena de favores

Los dos primeros capítulos son cadenas de trueque: cada vecino necesita algo que tiene otro, y los puentes que giran conectan las celdas.

**Capítulo 1 · El primer sello** (Primavera, Verano, Otoño, Invierno)

1. Brote necesita sol para que florezca su cerezo.
2. Solano (Verano) cambia un frasco de sol por algo frío para su limonada.
3. El hielo está en Invierno, pero el puente no apunta allí.
4. La manivela del puente de Ocre está atascada con tinta seca: necesita agua de lluvia de Primavera.
5. Con el agua, Ocre gira el puente hacia Invierno («Los puentes de la colmena se acuerdan de hacia dónde miraban»).
6. Escarcha da el hielo, Solano da el sol, el cerezo florece.

**Sello 1** — «Uno. El panal vuelve a latir. Débil, pero late. / Yo tenía veinte años cuando encontré esta colmena detenida, con un viejo apicultor dormido dentro. / No era la primera vez que el panal se paraba. Yo tampoco fui la primera en despertarlo.»

**Capítulo 2 · Más allá de la colmena** (Espacio, Océano, Desierto, Antártida)

1. Orión ha perdido una estrella y necesita una lente nueva.
2. Duna la talla, pero necesita una perla para pulirla.
3. Coral da la perla a cambio de luz para el fondo del mar.
4. Témpano da la luz de aurora. Su témpano solo gira hacia la Antártida cuando la colmena ya late («Hasta el hielo sabe girar, si se le da tiempo»).
5. Orión recupera la estrella.

**Sello 2** — «Dos. Desde aquí ya se oye el mundo girar. / Llené frascos con arena, hielo y luz que me mandaban desde los confines. Nunca fui a verlos. / Detrás de cada pared hay alguien que me conoció. Pregúntales. Yo ya no me acuerdo de todo.»

Este segundo sello abre la investigación: desde aquí el cuaderno empieza a anotar testimonios.

## Capítulos 3 a 6: los cuatro barrios

Cada barrio son cuatro celdas con un minijuego por celda; la cuarta enciende el sello. Aquí se consiguen los tres objetos que abren el final: el billete, la llave y el libro.

**Capítulo 3 · La casa de Amaranta** (Colmenar, Biblioteca, La Última Cena, Relojería)

1. Biblioteca: ordenar la estantería por colores. Detrás del lomo rojo aparece la receta de Amaranta y una nota: «Cierro la biblioteca a medianoche».
2. La Última Cena: receta + miel (Colmenar) + menta (Jardín) y cocinar con Miel. «Amaranta cenaba a las nueve en punto.» Da miel tibia.
3. Colmenar: la miel tibia para Abril; las abejas salen tocando al compás del latido.
4. Relojería: con las horas de Tomo, Miel y Abril (12, 9, 6) y la hora en que todo paró (las cuatro menos cuarto), poner los relojes en hora.

**Sello 3** — «Tres. La casa vuelve a tener horas. / Todas las noches ponía la mesa para dos. Nunca vino nadie. / El viejo apicultor me enseñó que la colmena se para cuando quien la cuida deja de escucharla.»

**Capítulo 4 · Los sueños** (Invernadero, Faro, Tren, Teatro)

1. Invernadero: abrir tres flores sin mirarlas (ponerlas a tu espalda). Da la silueta de la polilla.
2. Faro: girar espejos un cuarto de vuelta para guiar el rayo. Da la silueta del faro y la luz del faro.
3. Tren: picar cinco estrellas esperándolas en el aro. Estela da el billete de vuelta, la silueta del tren y el sombrero con velo que recogió del asiento: «No recuerdo haber visto su cara debajo».
4. Teatro: con las tres siluetas, representar la obra. Telón señala el enigma: Estela vio salir el tren con su sombrero, pero Nube y Vela dicen que se quedó. ¿Cómo pueden tener razón los tres? El escenario gira con un torno.

**Sello 4** — «Cuatro. El teatro ya sabe el final. / No subí a ese tren. Dejé mi sombrero en el asiento para que nadie me siguiera. / Bajé a pie hacia el corazón, con la luz del faro en la espalda.»

**Capítulo 5 · Las raíces** (Sótano de cera, Cueva, Volcán, El Campanario)

1. El Campanario: leer el viento con la cometa (las banderolas apuntan hacia donde va el viento).
2. Cueva de cristales: encontrar el cristal que late al ritmo del hexágono de arriba.
3. Sótano de cera: calentar placas hasta que brillen y leer las palabras de Amaranta en orden. Da cera de sellar.
4. Volcán: cristal + cera, fuelle y martillo para forjar la llave del corazón. «Amaranta me pidió que la olvidara. No pude.»

**Sello 5** — «Cinco. La forja vuelve a arder. / Pedí una llave para cerrarme por dentro. Ceniza la hizo sin preguntar. / Quien tenga la llave puede abrir. No quise que fuera nadie. Y ahora eres tú.»

**Capítulo 6 · La memoria** (Desván, Estudio, Sala de retratos, Jardín)

1. Desván: abrir el candado de la caja; cada hexágono es una celda y los números son los puntos de los símbolos de cera. Dentro: el libro sin título, con tapas de cera. El desván también gira.
2. Estudio: Pluma da tres cartas sin firma para Témpano, Telón y Coral. Cada destinatario devuelve una palabra.
3. Sala de retratos: poner en la silla lo que más la recuerde (el sombrero, sobre todo) y elegir la luz. «No es su cara: es cómo la miras tú.»
4. Jardín: agua de lluvia de Primavera + luz del faro, y el jugador escribe el nombre del árbol.

**Sello 6** — «Seis. El árbol tiene nombre. / Escribí que quien lo nombrara tendría que quedarse. No es verdad: se queda quien quiere. / Ven. El corazón está abierto.»

## El misterio: testimonios y las cinco preguntas

La versión oficial es que Amaranta se fue en el último tren. El jugador la desmonta cruzando testimonios: el cuaderno anota cada frase clave y, con suficientes, se responde un tablero de cinco preguntas que abre el final completo. La clave del misterio es que **nadie miente**: los testigos vieron a dos personas distintas aquella noche.

**Los 17 testimonios**

| Clave | Quién | Testimonio |
| --- | --- | --- |
| tren1 | Estela | El último salió de esta estación con un solo pasajero. Llevaba un sombrero con velo. |
| tren2 | Estela | No recuerdo haber visto su cara debajo del velo. Al volver, el tren venía vacío y el sombrero estaba en el asiento. |
| nube | Nube | Esa noche la vi bajar a pie hacia el corazón. Desde aquí se ve todo, y no subió a ningún tren. |
| campana | Nube | La campana sonó a medianoche. Una sola vez. No era Amaranta: era alguien de papel, casi transparente. |
| vela | Vela | Estuvo aquí abajo hasta las tres y media, fundiendo una sola carta. Luego bajó hacia el corazón, no hacia el andén. |
| reloj | Péndulo | Todos los relojes se pararon a la misma hora: las cuatro menos cuarto. |
| horario | Silbo | Último tren: 3:45. Destino: Ayer. |
| faro | Albor | La última noche la luz se desvió sola. Apuntó abajo, al corazón, y se quedó ahí. |
| llave | Ceniza | Una llave para el corazón. Me la pidió… y luego me pidió que la olvidara. |
| libro | Tomo | Falta un libro. Uno sin título, con tapas de cera. Lo escribió ella. |
| arbol | Rocío | Hay uno sin nombre todavía. Amaranta lo plantó la última tarde. Creo que es para quien la despierte. |
| caja | Trasto | Amaranta subió una caja la última noche. Dijo «para cuando esté lista». No la he abierto. |
| abril | Abril | Ella decía que una colmena no se manda. Se escucha. |
| apic | Amaranta | El viejo apicultor me enseñó que la colmena se para cuando quien la cuida deja de escucharla. |
| antes | Amaranta | No era la primera vez que el panal se paraba. Yo tampoco fui la primera en despertarlo. |
| pag7 | Amaranta | Planté un árbol sin nombre. Quien lo nombre tendrá que quedarse. Perdóname. |
| eco | Eco | Me puse su sombrero y subí a ese tren para que nadie la buscara abajo. Estela no mintió: me vio a mí. |

**Lo que el jugador debe notar**

- Estela vio una pasajera con velo, pero no le vio la cara y el tren volvió vacío.
- Vela la tuvo en el sótano hasta las tres y media, y Nube la vio bajar a pie: Amaranta no pudo estar en el andén a las 3:45.
- A medianoche sonó la campana, pero quien tiró de la cuerda era de papel. Ya había alguien más despierto esa noche.
- Todo se paró a las cuatro menos cuarto, a la misma hora en que salía el tren.

**El tablero: cinco preguntas** (cada una pide un mínimo de testimonios anotados)

| Pregunta | Respuesta correcta | Opciones falsas | Pruebas (mínimo) |
| --- | --- | --- | --- |
| ¿Subió Amaranta al último tren? | No: bajó a pie hacia el corazón | Sí, con su sombrero; se escondió en la caja del desván | tren1, tren2, nube, vela (3) |
| ¿A qué hora se detuvo la colmena? | A las cuatro menos cuarto | A medianoche; al amanecer | reloj, horario, faro (2) |
| ¿Qué dejó preparado para quien la encontrara? | Una llave, un libro sin título y un árbol sin nombre | Billete y carta de despedida; nada | llave, libro, arbol, caja (3) |
| ¿Por qué detuvo la colmena? | Había dejado de escucharla y necesitaba que alguien la despertara | Por accidente; quería irse para siempre | abril, apic, antes, pag7 (2) |
| ¿Quién subió al tren con su sombrero? | Eco, la parte de Amaranta que no quería irse | Amaranta; nadie, el tren salió vacío | tren1, campana, eco (3) · solo tras el Acto III |

Al resolver las cuatro primeras: «Lo has entendido casi todo. Queda alguien a quien no has escuchado.» Al resolver la quinta: «Lo has entendido. Ya no hace falta que te lo cuente. Ven al corazón cuando quieras. Te espero despierta.» El cuaderno muestra entonces «La verdad de Amaranta» (ver La premisa).

## El cuaderno: siete páginas y seis símbolos

Siete páginas del diario de Amaranta están escondidas en el suelo de siete celdas. En el Corazón, el libro de cera contiene las páginas que faltaban y se cuenta cuántas de las 7 encontraste.

| Celda | Página |
| --- | --- |
| Verano | Día uno. Encontré la colmena parada y a un viejo apicultor dormido en el corazón. Me dijo que tenía mi edad cuando se durmió. |
| Otoño | Le pedí a Ocre que no imprimiera esta página. Es la única que me ha obedecido. |
| Océano | Coral me preguntó qué pasa si el corazón deja de latir del todo. No le contesté. Ya lo sabía. |
| Biblioteca | El libro sin título no es un libro. Es una puerta. Tomo lo sabe y por eso no lo busca de verdad. |
| Teatro | Telón ensaya un final en el que me quedo. Nunca le dije que el final ya lo escribí yo. |
| Sótano | Encontré noventa y nueve cartas con mi letra que yo no escribí. Fundí la mía, la número cien. La cera sabe a sal. |
| Jardín | Planté un árbol sin nombre. Quien lo nombre tendrá que quedarse. Perdóname. |

**Los seis símbolos de cera** están en Primavera (3 puntos), Sala de retratos (2), El Campanario (4), Invierno (5), Cueva (6) y Desierto (1). Aparecen cuando la colmena late. Son la combinación del candado de la caja del Desván: cada hexágono del candado es una celda y su número son los puntos del símbolo.

## El rastro de Amaranta

Una silueta con sombrero aparece en las plazas entre celdas. Seguirla da tres páginas que reescriben la noche del parón y llevan a una plaza que no está en ningún mapa. El primer encuentro puede ser de día; el segundo y el tercero solo de noche.

| Encuentro | Página del rastro |
| --- | --- |
| 1 | La noche que el corazón se calló no había luna. Yo no estaba junto a él: estaba en este puente, contando los latidos que faltaban. Faltaban todos. |
| 2 | Dirán que tomé el último tren. Dirán que fundí cien cartas. Fundí una sola, la mía. Las otras noventa y nueve las escribió alguien con mi letra. |
| 3 | Si has llegado hasta aquí, ya sigues mis pasos. Mira el suelo de esta plaza cuando esté oscuro: mis huellas llevan a una plaza que no sale en ningún mapa. Allí dejé un frasco que parece vacío. |

Tras cada página, dos vecinos añaden una frase nueva que la contradice o la matiza:

- Tras la 1: Estela («los puentes estaban levantados; ayudé a bajarlos al amanecer») y Nube («siempre camina hacia el corazón, nunca se aleja»).
- Tras la 2: Albor («hay huellas que solo se ven cuando pasa la luz») y Telón («en mi ensayo se marcha por un puente que no existe; ella me lo pidió»).
- Tras la 3: Tomo («un mapa al que le falta una plaza miente a propósito») y Luna («¿El frasco vacío? Luna dice que lo vio brillar. Luna soy yo. No me acuerdo de haberlo dicho»).

**La plaza escondida.** Con el botón «Seguir las huellas» se viaja a ella. Allí está el frasco: «Dentro del frasco no hay nada. O eso parece: al destaparlo se oye un latido, uno solo. El primero de la colmena. / Lo guardé aquí la noche en que todo se paró, para que no se perdiera. Llévalo contigo. El corazón sabrá qué hacer con él.» Es un frasco como los que Duna hacía para ella.

**El latido.** Al recoger el latido aparece una brújula de latidos que guía al Corazón; entregarlo allí marca el rastro como resuelto (logro «El primer latido»). Es requisito para atravesar El Reverso.

La idea de fondo: hubo dos Amarantas aquella noche. La que fundió una sola carta y bajó al corazón, y su eco de papel, que escribió las otras 99 con su letra, tocó la campana y subió al tren. El rastro es la primera pista de que existe Eco: la segunda página ya lo insinúa.

## Acto III: la colmena de abajo

Bajo el Corazón hay una segunda colmena, la de lo olvidado, con cinco celdas en el piso −3. Aquí se revela quién es Eco y por qué los testigos parecen contradecirse. El Acto III se juega en paralelo a los capítulos 4 a 6 y se cierra antes de bajar al Corazón. El tono es de terror suave: fantasmas de papel, rincones oscuros, silencio.

**Acceso.** El Andén Vacío se abre desde el Sótano de cera al encender el tercer sello. El juego avisa del Acto III en ese momento.

1. **El Andén Vacío (Silbo).** Leer el horario: «Último tren, 3:45. Destino: AYER.» Silbo explica: «No iba a ningún sitio. Volvía. Para quien quería deshacer una noche. Amaranta compró un billete. Pero no subió ella.» Da un billete de ayer que abre la casa de al lado.
2. **La Casa de los Ecos (Eco).** Los fantasmas de papel se acercan si te quedas quieto y se esconden si te mueves. Quieto, se recogen tres de las 99 despedidas que Eco escribió con la letra de Amaranta, firmadas «—A.»:
   - A Estela: «Guarda mi sombrero hasta que vuelva. La del velo no era yo.»
   - A Nube: «Lo que viste tirar de la campana no era yo. Era lo que se quedó despierto.»
   - A Vela: «Gracias por la última noche. Fundí la mía; las otras noventa y nueve no son mías.»
3. **La confesión de Eco.** «Las escribí yo, con su letra: noventa y nueve despedidas que ella nunca se atrevió a escribir. Cuando dejó de escuchar la colmena, yo me desperté. Toqué la campana para que alguien escuchara. Nadie vino. Así que me puse su sombrero y subí al último tren, para que nadie la buscara abajo antes de tiempo. Estela no mintió. Me vio a mí.» Añade el testimonio «eco» al cuaderno y desbloquea el retrato tapado de la Sala de retratos: una Amaranta joven y casi transparente, firmado «Eco».
4. **Objetos Perdidos (Olvido).** Hay tres cosas de la misma noche en la mesa; una es del apicultor. Hay que elegir el reloj parado («¿Qué miraba siempre el viejo?»). Si te equivocas, se vuelve a perder. Aquí también está el otro guante de Amaranta.
5. **La Celda del Apicultor (Alvéolo).** Dar cuerda al reloj lo despierta: «Soy Alvéolo. Fui guardián de esta colmena cuando tenía tu edad… y luego me dormí en el corazón. Una niña me despertó. Se llamaba Amaranta. Yo bajé aquí a dormir y ella se quedó guardando. Así funciona: cada guardián duerme cuando llega el siguiente. Pero a ella le falta un trozo. Está al otro lado del espejo.»
6. **El Reverso (Etorb).** Un mundo al revés: plantas que cuelgan, sol negro, nadie tiene sombra salvo tú. Etorb es Brote leído al revés. El espejo solo se abre «para quien trae a alguien de vuelta»: requiere haber despertado a Alvéolo y llevar el latido del frasco. Al cruzarlo con Eco, ella deja de ser transparente y acepta subir al Corazón contigo.

**Cierre del Acto III.** Etorb: «Tu sombra tiene dos colores ahora. Una es tuya. La otra… creo que es de Eco. Se ha quedado contigo.» Desde aquí se puede responder la quinta pregunta del tablero. El antiguo epílogo «El reverso» pasa a formar parte del final completo (ver la sección siguiente).

## El Corazón y los finales

Con los seis sellos se baja al Corazón desde el Estudio de Amaranta. Sin la llave y el libro, Amaranta sigue dormida y el juego dice qué falta.

**La escena.** «(La llave de Ceniza encaja en el libro de cera. Se abre.) (Dentro están las páginas que faltaban. Encajan con las que has encontrado: N de 7.) (Amaranta abre los ojos, despacio.) ¿Has sido tú quien encendió los sellos? Gracias. No sabía cómo volver. ¿Qué hacemos ahora?» Si el tablero no está completo, añade: «En tu cuaderno quedan preguntas sin responder. Quizá haya un final más completo.»

| Final | Requisito | Opción del jugador | Texto |
| --- | --- | --- | --- |
| A · El tren de vuelta | Tener el billete de vuelta (Tren) | Darle el billete de vuelta | Amaranta subió al tren nocturno con su billete de vuelta. Esta vez llevaba puesto su sombrero. La colmena siguió latiendo sola. De vez en cuando llega una carta con su letra; ahora sí es suya. |
| B · Nuevo guardián | Siempre disponible | Quedarme a cuidar la colmena | Te quedaste en el corazón de la colmena. Amaranta plantó un árbol nuevo junto al que nombraste: «\[nombre del árbol\]». Ahora eres tú quien la escucha latir. |
| C · La colmena entera | Tablero completo (5 preguntas) y Acto III cerrado | Contarle la verdad que has descubierto | Le contaste lo que habías descubierto, pieza a pieza. Eco dio un paso adelante, ya sin transparencia. «Ya puedes despertar del todo», le dijo. «Yo me quedo con lo que olvidaste.» Con cada verdad, una celda recuperó su color. Amaranta se quedó. No por obligación: porque quiso. Abajo, las cartas, el andén y el reloj volvieron a su estante. La colmena florece entera. |

Si el jugador escribió una carta propia, se intercala: «Dejaste tu carta en su regazo: «…»». Pompón, si lo encontraste, aparece en la última imagen de cada final: en el tren con Amaranta (A), a tus pies (B) o dormido entre los dos (C). Todos cierran con «— Colmena · gracias por jugar —» y permiten seguir paseando. En el final completo hay un detalle extra: mirar hacia arriba (logro «Hay algo más arriba»).

El final canónico es C: Amaranta se queda por decisión propia y Eco, su parte olvidada, se queda abajo guardando lo perdido. El epílogo «El reverso» ya no es una pantalla aparte: está dentro de este final.

## Misiones secundarias y secretos

Tras el segundo sello, los ocho primeros vecinos piden un favor nuevo que conecta con los barrios del Acto II. Son opcionales y cuentan para el logro «Todos los favores».

| Vecino | Favor | De dónde sale | Recompensa |
| --- | --- | --- | --- |
| Brote | Polen de luna para el cerezo | Luna (Invernadero) | Agua de lluvia para el árbol de Rocío; el cerezo florece de noche |
| Solano | Un billete de tren | Estela (Tren) | «Era para ir a ver a Escarcha. Nunca me atreví a pedírselo a nadie.» Verano visita Invierno |
| Ocre | Un boceto de Marco | Marco (Retratos) | Imprime el boceto (tú, de espaldas) en la portada del periódico de la colmena: «Quien la despertó» |
| Escarcha | Sopa caliente de Miel | Miel (La Última Cena) | «Con sopa caliente y Solano de visita, ya no hace falta contar los días.» Deja de tejer |
| Orión | Unir las estrellas | Minijuego de constelación | Su cielo completo |
| Coral | Una carta de Amaranta | Pluma (Estudio) | Se quita la escafandra por fin |
| Duna | Una brasa de la forja | Ceniza (Volcán) | Vidrio nuevo para el faro de Albor |
| Témpano | Sintonizar la radio | Carta de Amaranta con las frecuencias 7, 3, 9 | «Cada noche te leo, aunque no te escriba.» |

**Amistad.** Cada vecino tiene niveles de amistad con frases nuevas al volver a hablar. Logros a los 10 y a los 24 vecinos; la galería guarda sus retratos.

**La madriguera de Amaranta.** Huellas de conejo en el Colmenar, el Invernadero y el Desván dan pistas. Cuando el escenario del Teatro mira a la pared, se abre una trampilla: «Debajo del escenario había una raíz. Y en la raíz, un hueco del tamaño de una niña. Aquí no entraba nadie. Solo Pompón, Nala y yo.» Dentro hay que encontrar a Pompón, que después te sigue por la colmena (se sienta a tu lado cuando hablas y aparece en la última imagen de cada final), y reconocer a Nala entre peluches parecidos con la descripción de una nota de la pared.

**Los recuerdos de Amaranta.** Cuatro objetos en los confines, todos apuntan hacia abajo:

- Espacio: catalejo de juguete, grabado «Para mirar hacia abajo».
- Océano: botella con la nota «El tren no lleva a ningún sitio. Vuelve.»
- Desierto: reloj de arena con toda la arena abajo.
- Antártida: guante de lana con una A bordada; el otro está en Objetos Perdidos.

**Celdas cambiadas.** La Cocina pasó a ser La Última Cena (25 platos servidos y la silla caída). La Cumbre pasó a ser El Campanario (la campana que sonó una vez a medianoche).

**Las ramas.** Las celdas cuelgan de ramas y crujen con el tiempo. Hay tres niveles de fragilidad: Tranquila (nunca caen), Normal (una celda puede caer a la niebla y hay que rescatarla) y Vértigo (más rápido).

## Mecánicas y sistemas

El juego es exploración tranquila con conversaciones, trueques y un minijuego por celda; no hay combate ni muerte.

| Sistema | Cómo funciona |
| --- | --- |
| Movimiento | Tocar o hacer clic para caminar dentro de la celda; teclado y mando también. 3D por defecto, 2D de papel como alternativa |
| Viaje entre celdas | Las puertas llevan a puentes y plazas entre celdas. El traslado es rápido y se puede saltar («Saltar»). En las plazas se puede cambiar de rumbo |
| Viaje rápido | Desde el mapa, tocar una celda ya visitada y «Ir a» |
| Puentes que giran | Algunos puentes y celdas (Otoño, Invierno, Teatro, Desván) giran para cambiar qué puertas conectan |
| Mochila | Máximo 3 objetos a la vez; las reliquias (billete, llave, libro, cartas, Nala) van aparte |
| Farol (pistas) | Un único botón de farol da la pista del objetivo actual en voz del vecino |
| Objetivo | Siempre visible arriba; se calcula según el estado (qué llevar a quién, con quién hablar) |
| Cuaderno | Pestañas: encargos, testimonios y tablero de la verdad, páginas, logros y galería |
| Día y noche | Ciclo de 7 minutos; ciertos encuentros (rastro) solo de noche |
| Niebla | Las plazas tienen niebla con chispas que se pueden atrapar |
| Mapa mentiroso | Las plazas no visitadas salen como «?» |
| Faroles de plaza | Al encenderlos dan una pista verdadera |
| Brújula de latido | Tras el rastro, apunta al Corazón |
| Oscuridad | Cada celda está apagada hasta que su barrio despierta; ilumina el avance |
| Tutorial | Cinco pasos con una burbuja abajo |
| Guardado | Tres ranuras de partida en la pantalla de título |
| Idiomas | Español, inglés, ruso y chino |
| Extras | Modo foto, música por celda, confeti al progresar, «Ya leído · saltar» en diálogos repetidos |

**Logros (34).** Seis sellos, siete páginas, seis símbolos, mochila llena, sin mirar, mano de estrellas, billete de ida y vuelta, foto, todos los favores, 10 y 24 amigos, los tres finales, puertas que giran, la verdad, madriguera, Pompón, Nala, rescate, Vértigo, «hay algo más arriba», rastro, latido, faroles, la hora de la colmena, ecos, reverso y recuerdos.

## Mapa, pisos y conexiones

La colmena se dispone en anillo alrededor del Corazón, con los habitantes repartidos por pisos: arriba lo soñado, abajo lo enterrado y lo olvidado.

| Piso | Nombre | Celdas |
| --- | --- | --- |
| +2 | Los sueños | Espacio, Invernadero, Teatro, Faro, Tren |
| +1 | La memoria | Desván, Estudio, Sala de retratos, Jardín |
| 0 | Las estaciones y la casa | Primavera, Verano, Otoño, Invierno, Colmenar, Biblioteca, La Última Cena, Relojería |
| −1 | Las raíces y los confines | Sótano, Cueva, Volcán, El Campanario, Océano, Desierto, Antártida |
| −2 | El corazón | El Corazón |
| −3 | La colmena de abajo | Andén, Casa de los Ecos, Objetos Perdidos, Celda del Apicultor, El Reverso |

**Conexiones (34 puentes).**

- Estaciones: Primavera–Verano, Primavera–Otoño, Primavera–Invierno, Verano–Otoño, Otoño–Invierno (puente que gira).
- Casa: Primavera–Colmenar, Colmenar–Biblioteca, Colmenar–Cena, Biblioteca–Relojería, Cena–Relojería.
- Confines: Primavera–Océano, Verano–Desierto, Invierno–Antártida (témpano que gira).
- Sueños: Verano–Espacio, Espacio–Teatro, Teatro–Invernadero, Teatro–Faro, Teatro–Tren.
- Raíces: Otoño–Sótano, Sótano–Cueva, Sótano–Volcán, Cueva–Campanario.
- Memoria: Invierno–Desván, Desván–Retratos, Desván–Estudio, Retratos–Jardín.
- Al Corazón: Estudio–Corazón, Sótano–Corazón, Espacio–Corazón (todos cerrados hasta los seis sellos).
- Abajo: Sótano–Andén, Andén–Ecos, Ecos–Perdidos, Perdidos–Apicultor, Apicultor–Reverso.

Entre celdas hay plazas (cruces de puentes) con faroles, niebla y la silueta del rastro. Una plaza extra, la escondida, no sale en el mapa.

## Alcance de la versión 1

La primera versión en Claude Code se queda con el núcleo de la historia; el resto queda diseñado aquí y entra después.

| Entra en la versión 1 | Queda para después |
| --- | --- |
| Las 30 celdas, sus vecinos y sus minijuegos | Niebla con chispas y faroles de plaza |
| Los seis sellos y el Corazón | Ciclo de día y noche (los encuentros del rastro pasan a depender del capítulo) |
| Tablero de cinco preguntas y testimonios | Mapa mentiroso con plazas «?» |
| El rastro (3 páginas y el frasco del latido) | Los seis símbolos de cera (el candado del Desván usa otra pista) |
| Acto III completo | Ramas que caen y niveles de fragilidad |
| Los tres finales | Los cuatro recuerdos de Amaranta |
| Las siete páginas del cuaderno | Madriguera, Pompón y Nala (se mantiene el diseño para la versión 2) |
| Misiones secundarias de los ocho primeros vecinos | Modo foto y galería de amistad |

Si Pompón se queda para después, su aparición en los finales también.

## Reglas para reconstruirlo en Claude Code

Estas reglas protegen la historia al empezar desde cero; lo demás (motor, arte, interfaz) puede cambiar.

- **Nombres fijos.** El juego se llama Colmena. Se respetan todos los nombres de celdas y habitantes de este documento.
- **El protagonista es un chico** con avatar configurable. Amaranta es la narradora en primera persona; el protagonista no habla.
- **Plataforma.** Versión web (HTML) jugable en navegador de escritorio y móvil. Sin APK, iOS ni Steam por ahora.
- **Una sola fuente de verdad para la historia.** Celdas, diálogos, testimonios, páginas y finales en archivos de datos (JSON), no repartidos por el código. Los cuatro idiomas salen de esos datos.
- **Estado del jugador en un solo objeto** (sellos, mochila, testimonios, rastro, Acto III, finales) con guardado en tres ranuras.
- **La verdad nunca se dice directamente** hasta el tablero: cada pista sale de un vecino y las contradicciones deben poder notarse solas.
- **Ningún bloqueo sin pista.** Cada objetivo tiene su frase de farol y el objetivo visible dice siempre qué llevar a quién.
- **Tono.** Cuento de papel, melancolía tierna. El terror del Acto III es suave: quietud, fantasmas de papel, nada violento.
- **Ritmo.** Viajes cortos y saltables, viaje rápido desde el mapa, un minijuego por celda que dure menos de dos minutos.

**Pendientes conocidos de la versión actual** (a resolver en la reconstrucción):

- En 2D no existen los pisos: en la reconstrucción se elige un solo modo principal.
- El «pasillo de cera» jugable entre celdas no está hecho (pasa a la versión 2).
- El tamaño real de las celdas no varía.
- Las partidas antiguas no sirven: la reconstrucción empieza con un formato de guardado nuevo.
- Hay que reescribir en los datos del juego los textos cambiados en esta revisión (tren, cartas de Eco, frasco, página del Sótano, finales).

**Cambios de la revisión del 4 de octubre**

- Línea de tiempo oficial de la noche; nadie miente y Estela vio a Eco.
- El «tren de medianoche» pasa a ser «el último tren» (3:45, destino Ayer).
- Eco nace a medianoche, toca la campana, escribe 99 despedidas y sube al tren con el sombrero.
- El sombrero lo da Estela; la caja del Desván solo guarda el libro.
- La caja del rastro pasa a ser un frasco, para no confundirla con la del Desván.
- Quinta pregunta en el tablero; el Acto III va antes del Corazón y el epílogo entra en el final C.
- El final B se llama «Nuevo guardián».
- Cierres de los favores de Solano, Ocre y Escarcha, y papel de Pompón en los finales.
