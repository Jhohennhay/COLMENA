# Mapa de envolturas

Generado con `npm run envolturas` (no editar a mano). Cada fila es una función global que otros módulos redefinen.
Las capas van en orden de carga: **la última es la que se ejecuta primero** y suele llamar a la anterior.

99 funciones envueltas · 197 capas en total.

| Función | Capas | Definición original | Capas, en orden de carga |
| --- | --- | --- | --- |
| `act` | 9 | `game.js:8128` | `quests_story.js:215` → `quests_more.js:213` → `quests_madr.js:632` → `quests_ramas.js:388` → `misterio2.js:634` → `abajo_q.js:429` → `cambios.js:342` → `mapa2.js:66` → `islas.js:154` |
| `openBook` | 7 | `game.js:7873` | `quests_core.js:517` → `quests_more.js:1292` → `rastro.js:363` → `misterio2.js:669` → `abajo_q.js:536` → `cambios.js:382` → `ui_fix.js:270` |
| `PUZ.goal` | 7 | propiedad de objeto | `quests_story.js:1254` → `quests_more.js:411` → `quests_more.js:724` → `quests_ramas.js:312` → `abajo_q.js:507` → `islas.js:149` → `temporada.js:40` |
| `PUZ.open` | 7 | propiedad de objeto | `quests_story.js:1060` → `quests_more.js:60` → `quests_more.js:722` → `quests_ramas.js:274` → `abajo_q.js:28` → `mapa2.js:15` → `temporada.js:34` |
| `PUZ.why` | 7 | propiedad de objeto | `quests_story.js:1065` → `quests_more.js:61` → `quests_more.js:723` → `quests_ramas.js:275` → `abajo_q.js:37` → `mapa2.js:19` → `temporada.js:37` |
| `darkLevel` | 5 | `mystery.js:204` | `quests_story.js:1070` → `misterio2.js:51` → `abajo_q.js:88` → `islas.js:66` → `gestos.js:78` |
| `qFrame` | 5 | `quests_fx.js:220` | `quests_more.js:1011` → `quests_imm.js:118` → `quests_madr.js:1707` → `quests_ramas.js:646` → `quests_ramas.js:1086` |
| `beatTick` | 4 | `mystery.js:316` | `misterio2.js:400` → `abajo_q.js:569` → `mejoras.js:383` → `mejoras2.js:441` |
| `bookTab` | 4 | `quests_core.js:507` | `quests_more.js:702` → `mejoras2.js:270` → `ui_fix.js:258` → `ui2.js:124` |
| `PUZ.cellLocked` | 4 | propiedad de objeto | `quests_story.js:1064` → `quests_more.js:721` → `abajo_q.js:33` → `temporada.js:31` |
| `qUnder` | 4 | `quests_fx.js:144` | `quests_more.js:334` → `quests_madr.js:618` → `quests_ramas.js:380` → `mejoras.js:258` |
| `cross` | 3 | `game.js:6528` | `quests_ramas.js:1102` → `plazas.js:315` → `mejoras2.js:75` |
| `note` | 3 | `game.js:5897` | `pulido.js:244` → `islas.js:48` → `ui2.js:34` |
| `openTitle` | 3 | `game.js:9258` | `quests_ramas.js:1070` → `pulido.js:434` → `pulido.js:641` |
| `plazaStep` | 3 | `plazas.js:174` | `rastro.js:310` → `misterio2.js:303` → `viaje.js:524` |
| `PUZ.dialog` | 3 | propiedad de objeto | `quests_story.js:1035` → `minigames.js:224` → `islas.js:119` |
| `resetGame` | 3 | `game.js:9218` | `quests_fx.js:290` → `quests_more.js:1037` → `quests_ramas.js:845` |
| `showEnding` | 3 | `quests_core.js:979` | `quests_madr.js:1732` → `quests_ramas.js:870` → `sonido.js:210` |
| `startGame` | 3 | `game.js:9272` | `quests_ramas.js:789` → `render3d.js:3907` → `pulido.js:410` |
| `STYLE.doorLabel` | 3 | propiedad de objeto | `mystery.js:128` → `mapa2.js:77` → `ui2.js:66` |
| `STYLE.sound.beds` | 3 | propiedad de objeto | `game.js:5549` → `rooms2.js:2026` → `sonido.js:6` |
| `talk` | 3 | `game.js:8242` | `quests_core.js:407` → `quests_more.js:557` → `mejoras2.js:418` |
| `tutTick` | 3 | `mejoras2.js:123` | `pulido.js:713` → `islas.js:57` → `ui2.js:83` |
| `bakeCell` | 2 | `game.js:5984` | `quests_core.js:668` → `render3d.js:3916` |
| `bakeDark` | 2 | `game.js:6054` | `quests_core.js:682` → `render3d.js:3926` |
| `closeTalk` | 2 | `game.js:8273` | `quests_core.js:425` → `quests_more.js:578` |
| `crossAt` | 2 | `paths.js:139` | `viaje.js:532` → `conexiones.js:171` |
| `endFree` | 2 | `game.js:9343` | `quests_more.js:1045` → `quests_ramas.js:854` |
| `frameBody` | 2 | `game.js:8454` | `quests_madr.js:1186` → `render3d.js:3734` |
| `hintPress` | 2 | `quests_core.js:747` | `quests_more.js:894` → `mejoras.js:213` |
| `interact` | 2 | `game.js:8119` | `minigames.js:204` → `quests_madr.js:1717` |
| `onTap` | 2 | `game.js:8034` | `quests_core.js:891` → `mejoras.js:116` |
| `openGame` | 2 | `minigames.js:130` | `quests_more.js:902` → `quests_more.js:1283` |
| `plazaAsk` | 2 | `plazas.js:242` | `rastro.js:327` → `misterio2.js:335` |
| `PROPS3D.make` | 2 | propiedad de objeto | `salas2.js:621` → `salas2.js:755` |
| `rot` | 2 | `quests_story.js:72` | `quests_more.js:590` → `rastro.js:346` |
| `setMenu` | 2 | `game.js:7852` | `ui_fix.js:88` → `ui_fix.js:205` |
| `showChapter` | 2 | `game.js:9115` | `quests_more.js:728` → `temporada.js:72` |
| `startFree` | 2 | `game.js:9301` | `quests_more.js:1052` → `quests_ramas.js:1077` |
| `stateChanged` | 2 | `game.js:5935` | `quests_story.js:1366` → `mejoras2.js:312` |
| `STYLE.sound.tick` | 2 | propiedad de objeto | `rooms2.js:2077` → `sonido.js:32` |
| `STYLE.token` | 2 | propiedad de objeto | `quests_core.js:314` → `quests_madr.js:1624` |
| `travelOffer` | 2 | `quests_core.js:845` | `quests_ramas.js:300` → `mejoras.js:103` |
| `window.PENPROJ` | 2 | propiedad de objeto | `render3d.js:1565` → `render3d.js:3319` |
| `window.TRAVZ` | 2 | propiedad de objeto | `salas2.js:782` → `conexiones.js:218` |
| `abajoTick` | 1 | `mejoras.js:230` | `temporada.js:52` |
| `achRun` | 1 | `quests_core.js:489` | `ui2.js:48` |
| `API.win` | 1 | propiedad de objeto | `quests_more.js:912` |
| `bakeBackdrop` | 1 | `game.js:6274` | `render3d.js:3933` |
| `buildPaths` | 1 | `paths.js:35` | `conexiones.js:27` |
| `CELLS.cum.over` | 1 | propiedad de objeto | `cambios.js:121` |
| `CELLS.eco.over` | 1 | propiedad de objeto | `abajo_q.js:247` |
| `CELLS.per.over` | 1 | propiedad de objeto | `abajo_q.js:313` |
| `CELLS.ret.over` | 1 | propiedad de objeto | `cambios.js:197` |
| `CELLS.rev.over` | 1 | propiedad de objeto | `abajo_q.js:395` |
| `crossPlan` | 1 | `paths.js:122` | `conexiones.js:156` |
| `demoEnd` | 1 | `quests_more.js:739` | `quests_more.js:1340` |
| `doorToward` | 1 | `game.js:6565` | `plazas.js:327` |
| `drawCell` | 1 | `game.js:8308` | `quests_fx.js:264` |
| `drawPath` | 1 | `paths.js:184` | `conexiones.js:202` |
| `drawShade` | 1 | `mystery.js:243` | `quests_imm.js:111` |
| `fillGallery` | 1 | `quests_core.js:592` | `cambios.js:408` |
| `frameLogic` | 1 | `game.js:8470` | `pulido.js:44` |
| `g.createLinearGradient` | 1 | propiedad de objeto | `render3d.js:48` |
| `g.createRadialGradient` | 1 | propiedad de objeto | `render3d.js:49` |
| `goTo` | 1 | `game.js:8023` | `viaje.js:561` |
| `hearBackfill` | 1 | `quests_more.js:540` | `abajo_q.js:148` |
| `layer` | 1 | `salas.js:93` | `game.js:3096` |
| `lightSeal` | 1 | `quests_story.js:80` | `pulido.js:242` |
| `mgLoop` | 1 | `minigames.js:157` | `quests_more.js:1247` |
| `NARR.hint` | 1 | propiedad de objeto | `quests_story.js:1285` |
| `narrate` | 1 | `game.js:8985` | `quests_more.js:571` |
| `narrTick` | 1 | `game.js:9044` | `pulido.js:143` |
| `openCreator` | 1 | `game.js:9496` | `quests_ramas.js:782` |
| `pad` | 1 | `game.js:9175` | `quests_more.js:1149` |
| `plaza3Tick` | 1 | `plazas.js:375` | `misterio2.js:489` |
| `plazaBuild` | 1 | `plazas.js:8` | `conexiones.js:36` |
| `pr.draw` | 1 | propiedad de objeto | `cambios.js:15` |
| `put` | 1 | `pulido.js:70` | `game.js:8312` |
| `QHINT` | 1 | `quests_story.js:1279` | `quests_more.js:437` |
| `QSTAT` | 1 | `quests_story.js:1329` | `abajo_q.js:99` |
| `rastroInit` | 1 | `rastro.js:135` | `temporada.js:56` |
| `save` | 1 | `game.js:5843` | `quests_more.js:1308` |
| `sayNPC` | 1 | `quests_core.js:368` | `quests_more.js:564` |
| `seenMark` | 1 | `game.js:5802` | `quests_fx.js:247` |
| `setSlot` | 1 | `mejoras2.js:334` | `pulido.js:649` |
| `showGoal` | 1 | `game.js:5915` | `ui_fix.js:141` |
| `STYLE.blocker` | 1 | propiedad de objeto | `quests_more.js:323` |
| `STYLE.dlgHint` | 1 | propiedad de objeto | `ui2.js:224` |
| `STYLE.ghost` | 1 | propiedad de objeto | `mystery.js:95` |
| `STYLE.ghostIcon` | 1 | propiedad de objeto | `mystery.js:106` |
| `STYLE.hot` | 1 | propiedad de objeto | `ui2.js:61` |
| `STYLE.sign` | 1 | propiedad de objeto | `mystery.js:118` |
| `STYLE.talkLabel` | 1 | propiedad de objeto | `ui2.js:223` |
| `toggleMap` | 1 | `game.js:7839` | `mejoras.js:133` |
| `tx` | 1 | `minigames.js:46` | `humans.js:45` |
| `unfoldTick` | 1 | `paths.js:508` | `quests_ramas.js:288` |
| `updHand` | 1 | `game.js:9141` | `quests_core.js:324` |
| `window.POSTDRAW` | 1 | propiedad de objeto | `misterio2.js:843` |
