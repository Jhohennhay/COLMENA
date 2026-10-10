# Cómo se viaja entre cuartos

De las 39 conexiones, 28 son puertas entre cuartos vecinos (un salto corto) y 11 son caminos largos sobre el vacío (`src/modulos/paths.js`). La colmena tiene 6 pisos.

## Principio

**Si cambias de piso, te subes a algo que pertenece al tema del cuarto.** No se camina por una rampa. Cada viaje dura entre 2 y 5 segundos de efecto y se puede acelerar (`TRAVK` en `mejoras2.js`).

## Tipos de camino

| Camino | Tipo | Cómo se recorre |
| --- | --- | --- |
| Colmenar ↔ Primavera | `puente` | Puente colgante (tablones que se hunden) |
| Océano ↔ Primavera | `muelle` | Muelle (pendiente: esclusa) |
| Verano ↔ Espacio | `escalera` | Escalera al cielo (pendiente: estrellas-peldaño) |
| Espacio ↔ Teatro | `tren` | Vía del tren nocturno, sentado |
| Desierto ↔ Verano | `arena` | Camino de arena |
| Otoño ↔ Sótano | `cera` | Escalera de cera (pendiente: avión de papel) |
| Desván ↔ Invierno | `piedras` | Sendero de piedras, a saltos |
| Corazón ↔ Estudio | `raices` | Sendero de raíces (pendiente: enredadera que crece) |
| **Corazón ↔ Espacio** | `ascensor` | **Ascensor de la colmena**: pasarela, jaula que suben las abejas (cuatro pisos), la cámara se aleja |
| **Andén ↔ Sótano** | `pozo` | **Cubo del pozo**: brocal con manivela, bajas o subes dentro del cubo |
| **Sótano → Corazón** | `tobogan` | **Tobogán de miel** en espiral; de subida, la cesta de las abejas |

Captura: `docs/capturas/conexiones.png`.

## Cómo está hecho un transporte (`src/modulos/conexiones.js`)

- `PATH_OF` asigna el tipo al camino; esos caminos **no** pasan por las plazoletas (se quitan de `plazaBuild`).
- `crossPlan` calcula una línea de tiempo por tramos (andar / montado) y `crossAt` devuelve la posición; la altura se corrige con `Pl.z` frente a la subida lineal.
- La dirección se decide por el piso de cada cuarto (`PISO[GRUPO[id]]`), no por la altura animada.
- La cesta de las abejas (`viaje.js`) se usa en los cambios de piso que no tienen transporte propio.
- La geometría 3D se construye una vez en la escena y la jaula o el cubo siguen al viajero.

## Pendiente

- Avión de papel, esclusa, estrellas-peldaño y enredadera.
- Icono del transporte en el cartel de la puerta (🛗, 🪣, ✈).
- Las bajadas de solo ida como premio que abre un atajo.
