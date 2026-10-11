/* ══════════ TRES VERSIONES DE CADA HABITANTE ══════════
   A · Pulida  — la misma persona, con la silueta y los colores más claros.
   B · Oficio  — su trabajo se entiende de un vistazo.
   C · Cuento  — más fantasía, con guiños a la colmena.
   Cada versión es una ficha parcial que se mezcla con la actual. */
const HB = Object.fromEntries(Object.entries(HUMANS).map(([k, v]) => [k, { ...v }]));
const U = HOLD.up;
const VARIANTS = {
  pri: [
    {
      n: 'Pulida',
      d: 'Pecas, pañuelo rosa y botones: más niña jardinera, menos muñeco.',
      o: { faceX: FX.all(FX.rosy, FX2.freckles()), neck: NECK.kerchief(C.petalD, '#FBF4E3'), torso: TORSO.buttons('#E4A844', 2), tw: 0.95 },
    },
    {
      n: 'Oficio',
      d: 'Pañuelo verde, botas de agua, delantal con pala y un brote en maceta.',
      o: {
        hat: HAT2.bandana(C.sageD),
        hair_s: 'coleta',
        overall: '#4E6B46',
        bottom: '#4E6B46',
        shoes: '#3E8FA0',
        apron: '#C9A05C',
        torso: TORSO.pocket('#C9A05C', '#8A5A34'),
        hold: HOLD2.sprout,
        hand: U(10, 8),
        faceX: FX.all(FX.rosy, FX2.freckles()),
      },
    },
    {
      n: 'Cuento',
      d: 'Corona de flores y capa de hojas: el espíritu de la primavera.',
      o: {
        hat: HAT2.crown([C.petal, '#FBF4E3', C.butter]),
        overall: null,
        top: '#F4AFA6',
        sleeve: '#FAD0C8',
        skirt: '#F4AFA6',
        bottom: '#FAD0C8',
        back: BACK2.leafCape(C.sage, C.sageD),
      },
    },
  ],
  ver: [
    {
      n: 'Pulida',
      d: 'Más redondo, camisa de rayas de verano. Mantiene gafas, bigote y abanico.',
      o: { tw: 1.18, torso: TORSO.stripes('#F5CE55', 4) },
    },
    {
      n: 'Oficio',
      d: 'Socorrista jubilado: visera roja, silbato y salvavidas.',
      o: {
        hat: HAT2.visor('#E0584A'),
        top: '#FBF4E3',
        bottom: '#E0584A',
        neck: NECK.whistle('#E0584A'),
        hold: HOLD2.lifebuoy,
        hand: U(10, 6),
        tw: 1.1,
        faceX: FX.all(FX.sunglasses, FX.mustache('#F4F0E6', 1.25), FX.rosy),
      },
    },
    {
      n: 'Cuento',
      d: 'El rey del verano: corona de rayos, capa dorada y girasol.',
      o: { hat: HAT2.rays(), back: BACK2.cape('#E9B830', '#F5CE55'), hold: HOLD2.sunflower, top: '#F5CE55', bottom: '#E07A4E', neck: null },
    },
  ],
  oto: [
    {
      n: 'Pulida',
      d: 'Bufanda de otoño y una mancha de tinta en la mejilla.',
      o: { neck: NECK.scarf('#C9694B', '#F3C872'), faceX: FX.all(FX.glasses('#3A2A20'), FX2.smudge('#3A4660')) },
    },
    {
      n: 'Oficio',
      d: 'Grabadora: boina, mangas remangadas, delantal manchado y rodillo de tinta.',
      o: {
        hat: HAT.beret('#C47A2C'),
        sleeve: '#D9A07E',
        apron: '#5A4A3A',
        torso: TORSO.splat(['#3A4660', '#B8484A', '#E4A844']),
        hold: HOLD2.roller,
        hand: U(10, 10),
      },
    },
    {
      n: 'Cuento',
      d: 'La dama de las hojas: corona y capa de hojas secas, una hoja de arce enorme.',
      o: {
        hat: HAT2.leaves(['#E07A4E', '#E4A844', '#C9694B', '#B8484A']),
        back: BACK2.leafCape('#C9694B', '#E4A844'),
        hold: HOLD2.maple,
        hand: U(10, 10),
        apron: null,
        top: '#B8733A',
        sleeve: '#B8733A',
        skirt: '#8A4A2A',
        torso: null,
      },
    },
  ],
  inv: [
    {
      n: 'Pulida',
      d: 'Bufanda larga a rayas y chaqueta de punto con botones.',
      o: { neck: NECK.scarf('#C9694B', '#FBF4E3'), torso: TORSO.buttons('#F3E6C4', 3) },
    },
    {
      n: 'Oficio',
      d: 'Tejedor: chaleco con remiendos, orejeras y el ovillo en la mano.',
      o: {
        torso: both(TORSO.vest('#6F8D5E'), TORSO.patches([C.petalD, '#E4A844'])),
        hat: HAT2.earmuffs('#E07F7F'),
        faceX: FX.all(FX.beard('#F4F0E6'), FX2.bigGlasses('#8A6A4A', 4.2)),
        hold: HOLD2.yarn,
      },
    },
    {
      n: 'Cuento',
      d: 'El abuelo escarcha: gorro de dormir, capa de nieve y chocolate caliente.',
      o: {
        hat: HAT2.nightcap('#8FA9B6'),
        back: BACK2.cape('#DCE9F0', '#8FA9B6', 0),
        top: '#DCE9F0',
        hold: HOLD2.mug,
        twoHands: false,
        hand: (G) => [G.pt(12, G.hip + 9)],
        faceX: FX.all(FX.beard('#F4F0E6'), FX2.snow),
      },
    },
  ],
  esp: [
    {
      n: 'Pulida',
      d: 'Gafas redondas de latón y medalla con hexágono.',
      o: { faceX: FX.all(FX.rosy, FX2.bigGlasses('#C9A05C', 4)), torso: TORSO.buttons('#E4A844', 3), neck: NECK.medal() },
    },
    {
      n: 'Oficio',
      d: 'Astrónoma de campo: gafas de aviador, mochila con mapas y catalejo.',
      o: {
        back: BACK2.backpack('#8A5A3A', '#2E3561'),
        hat: HAT2.goggles('#6A4A30', '#8FC3D6'),
        hold: HOLD.spyglass,
        top: '#5E6B7A',
        sleeve: '#5E6B7A',
        bottom: '#3A3A48',
        torso: TORSO.zipper(),
      },
    },
    {
      n: 'Cuento',
      d: 'Tejedora de constelaciones: vestido estrellado, broche de luna y lámpara lunar.',
      o: {
        back: BACK2.stars('#2E3561', '#454E88'),
        hat: HAT2.moonPin(),
        top: '#2E3561',
        skirt: '#2E3561',
        torso: TORSO.stars(),
        hold: HOLD2.moonLamp,
        hand: U(10, 6),
      },
    },
  ],
  oce: [
    {
      n: 'Pulida',
      d: 'Botella de aire a la espalda, botones de latón y una concha.',
      o: { back: BACK2.tank('#C9A05C'), torso: TORSO.buttons('#C9A05C', 3), hold: HOLD2.shell },
    },
    {
      n: 'Oficio',
      d: 'Se quita el casco: se le ve la cara. Camiseta marinera y casco bajo el brazo.',
      o: {
        head: null,
        skin: '#E7B994',
        hair: '#9A5A2A',
        hair_s: 'rizado',
        hold: HOLD2.helmet,
        torso: TORSO.stripes('#FBF4E3', 4, 0.9),
        top: '#2E3A52',
        sleeve: '#2E3A52',
        neck: NECK.kerchief('#E0584A'),
        faceX: FX.all(FX.rosy, FX2.freckles()),
      },
    },
    {
      n: 'Cuento',
      d: 'Le crece coral en el casco y algas en la espalda; lleva un frasco de luz marina.',
      o: {
        back: BACK2.seaweed,
        hold: HOLD2.jar('#8FD3C4'),
        head: (p, G, hc, R) => {
          HB.oce.head(p, G, hc, R);
          const { pt, hd, s } = G;
          for (const [dx, a, c] of [
            [-6, -0.5, '#E07F7F'],
            [0, -0.1, '#F4AFA6'],
            [7, 0.4, '#E07F7F'],
          ]) {
            const b = pt(dx, hd + 15),
              e = [b[0] + Math.sin(a) * 12 * s, b[1] - 12 * s];
            p.line([b, e], c, 2.2);
            p.line(
              [
                [lerp(b[0], e[0], 0.5), lerp(b[1], e[1], 0.5)],
                [e[0] + Math.sign(a || 1) * 5 * s, e[1] + 2 * s],
              ],
              c,
              1.6,
            );
          }
        },
      },
    },
  ],
  des: [
    {
      n: 'Pulida',
      d: 'Turbante de arena sobre las gafas y fajín turquesa.',
      o: { hat: both(HAT2.wrap('#E9C28A', '#2E9A9A'), HB.des.hat), torso: TORSO.sash('#2E9A9A') },
    },
    {
      n: 'Oficio',
      d: 'Caravanera: mochila con manta, cinturón y bastón de caminante.',
      o: { back: BACK2.backpack('#8A5A3A', '#C9694B'), hold: HOLD2.staff(), hand: U(10, 10), apron: null, belt: '#5A3A2A' },
    },
    {
      n: 'Cuento',
      d: 'Guardiana de las dunas: capa ondulante, turbante turquesa y farol verde.',
      o: {
        back: BACK2.cape('#E6AE70', '#2E9A9A', 4),
        hat: both(HAT2.wrap('#2E9A9A', '#E4A844'), HB.des.hat),
        hold: HOLD.lantern('#8FE0D0'),
        hand: U(10, 6),
        top: '#F0C98A',
        torso: TORSO.stars('#2E9A9A'),
        apron: null,
      },
    },
  ],
  ant: [
    {
      n: 'Pulida',
      d: 'Parka con cremallera, gafas de nieve y manoplas azules.',
      o: { torso: TORSO.zipper(), hat: HAT2.goggles('#3A3A48', '#F5CE55'), inkHands: '#3E8FA0' },
    },
    {
      n: 'Oficio',
      d: 'Radioaficionada: cascos, mochila con antena y libreta de frecuencias.',
      o: {
        hat: HAT2.headphones('#3A3A48', '#E07A4E'),
        back: BACK2.antenna('#5E6B7A'),
        hold: HOLD2.notepad,
        hairBack: null,
        hair_s: 'coleta',
      },
    },
    {
      n: 'Cuento',
      d: 'Aurora: parka con las franjas del cielo polar y un frasco de aurora.',
      o: {
        torso: TORSO.aurora,
        hold: HOLD2.jar('#8FD3C4'),
        hairBack: HAT2.hoodC('#5E6B9A', '#FBF8F2'),
        top: '#5E6B9A',
        sleeve: '#5E6B9A',
        skirt: '#5E6B9A',
      },
    },
  ],
  col: [
    {
      n: 'Pulida',
      d: 'Traje con estampado de panal y guantes color miel.',
      o: { torso: both(HB.col.torso, TORSO.hex('#E4A844', 0.5)), inkHands: '#E4A844' },
    },
    {
      n: 'Oficio',
      d: 'Sombrero de velo echado atrás, cuadro de panal en la mano y una abeja al hombro.',
      o: {
        hat: HAT.wide('#F4EFE2', true),
        hold: HOLD2.comb,
        hand: U(10, 8),
        apron: '#C9A05C',
        torso: TORSO.pocket('#F4EFE2', '#8A5A34'),
        faceX: FX2.freckles(),
        neck: (p, G) => HOLD2.bee(p, G, G.pt(-12, G.sh + 4)),
      },
    },
    {
      n: 'Cuento',
      d: 'La pequeña reina: antenas, alas de papel, rayas de abeja y cazo de miel.',
      o: {
        hat: HAT2.antennae('#4A3222', '#F5CE55'),
        back: BACK2.wings(),
        top: '#F5CE55',
        sleeve: '#F5CE55',
        torso: TORSO.stripes('#4A3222', 3, 0.85),
        bottom: '#4A3222',
        skirt: '#F5CE55',
        hold: HOLD2.dipper,
        hair_s: 'trenzas',
        ribbon: '#4A3222',
      },
    },
  ],
  bib: [
    {
      n: 'Pulida',
      d: 'Chaleco marrón y pajarita roja. Más bibliotecario de toda la vida.',
      o: { torso: TORSO.vest('#8A5A3A'), neck: NECK.bowtie('#B8484A') },
    },
    {
      n: 'Oficio',
      d: 'Archivero: monóculo, cadena de reloj y el llavero de todas las salas.',
      o: {
        faceX: FX.all(FX2.monocle(), FX.mustache('#B8B0A4', 0.8)),
        hold: HOLD2.keys,
        torso: both(TORSO.vest('#5A4A3A'), TORSO.chain()),
        top: '#F3E6C4',
        sleeve: '#F3E6C4',
      },
    },
    {
      n: 'Cuento',
      d: 'El búho de la biblioteca: capa de plumas, gafas enormes y un libro abierto.',
      o: {
        back: BACK2.cape('#8A5A3A', '#C9A05C', 6),
        faceX: FX.all(FX2.bigGlasses('#C9A05C', 5), FX.mustache('#B8B0A4', 0.8)),
        hold: HOLD2.openBook,
        hat: (p, G) => {
          const { pt, hd, f } = G;
          for (const [dx, a] of [
            [-7, -0.55],
            [-2, -0.2],
            [4, 0.25],
          ]) {
            const b = pt(dx, hd + 12);
            p.cut(p.leaf(b[0], b[1], -Math.PI / 2 + a * f, 11, 3.4), '#B8B0A4', { sh: 0, rough: 0.3 });
          }
        },
      },
    },
  ],
  coc: [
    {
      n: 'Pulida',
      d: 'Delantal con manchas de miel en hexágono y pañuelo al cuello.',
      o: { torso: TORSO.hex('#E4A844', 0.55), neck: NECK.kerchief('#E4A844') },
    },
    {
      n: 'Oficio',
      d: 'Pastelera: pañuelo de lunares, mangas remangadas y el pastel recién hecho.',
      o: { hat: HAT2.bandana('#E07F7F'), hold: HOLD2.pie, sleeve: '#C98A64', apron: '#FBF4E3', torso: TORSO.checks('#B8484A') },
    },
    {
      n: 'Cuento',
      d: 'El hada del horno: lazo, alitas y un cazo que gotea miel.',
      o: {
        hat: HAT2.bow('#E4A844'),
        skirt: '#F5CE55',
        top: '#F5CE55',
        torso: TORSO.stripes('#C47A2C', 3, 0.6),
        hold: HOLD2.dipper,
        back: BACK2.wings(),
      },
    },
  ],
  rel: [
    {
      n: 'Pulida',
      d: 'Cadena de reloj y pajarita azul noche.',
      o: { torso: both(HB.rel.torso, TORSO.chain()), neck: NECK.bowtie('#2E3561') },
    },
    {
      n: 'Oficio',
      d: 'Gafas de aumento en la frente, bolsillo con destornillador y un reloj en la mano.',
      o: { hold: HOLD2.clock, hat: HAT2.goggles('#6A4A30', '#DCEFF6'), torso: both(HB.rel.torso, TORSO.pocket('#6E3E17', '#C9A05C')) },
    },
    {
      n: 'Cuento',
      d: 'El señor del tiempo: chistera con esfera, levita y reloj de arena.',
      o: {
        hat: HAT2.clockTop,
        back: BACK2.tails('#3A3A48'),
        top: '#3A3A48',
        sleeve: '#3A3A48',
        hold: HOLD2.hourglass,
        torso: TORSO.chain(),
      },
    },
  ],
  inn: [
    {
      n: 'Pulida',
      d: 'Broche de luna, collar de perlas pálidas y vestido con estrellas.',
      o: { hat: HAT2.moonPin(), neck: NECK.necklace('#C9D3E8', '#F6D98A'), torso: TORSO.stars('#C9D3E8') },
    },
    {
      n: 'Oficio',
      d: 'Jardinera de noche: pañuelo, delantal verde y regadera.',
      o: {
        hat: HAT2.bandana('#3A4278', '#C9D3E8'),
        apron: '#6F8D5E',
        inkHands: '#6F8D5E',
        hold: HOLD.can,
        hand: U(10, 10),
        torso: TORSO.pocket('#6F8D5E', '#8A5A34'),
      },
    },
    {
      n: 'Cuento',
      d: 'La polilla lunar: alas con ojos, antenas de pluma y lámpara de luna.',
      o: {
        back: BACK2.mothWings('#E6E0F4', '#F6D98A'),
        hat: HAT2.antennae('#C9D3E8', '#F6D98A'),
        hold: HOLD2.moonLamp,
        skirt: '#C9D3E8',
        top: '#8A93C8',
      },
    },
  ],
  tea: [
    {
      n: 'Pulida',
      d: 'Gorguera, faldones de frac y botones dorados.',
      o: { neck: NECK.ruff(), back: BACK2.tails('#B8484A'), torso: TORSO.buttons('#E4A844', 3) },
    },
    {
      n: 'Oficio',
      d: 'Titiritero de verdad: todo de negro, boina y una marioneta con hilos.',
      o: {
        hat: HAT.beret('#2A2230'),
        top: '#2A2230',
        sleeve: '#2A2230',
        hold: HOLD2.control,
        hand: U(10, 16),
        neck: NECK.kerchief('#B8484A'),
      },
    },
    {
      n: 'Cuento',
      d: 'Maestro de ceremonias: capa roja con forro de oro y máscaras de teatro.',
      o: { hat: HAT2.plume('#F6D98A', '#2A2230'), back: BACK2.cape('#B8484A', '#E4A844', 6), hold: HOLD2.masks, hand: U(10, 12) },
    },
  ],
  tre: [
    {
      n: 'Pulida',
      d: 'Banda dorada cruzada y pajarita: revisora de gala.',
      o: { torso: both(HB.tre.torso, TORSO.sash('#E4A844')), neck: NECK.bowtie('#E4A844') },
    },
    {
      n: 'Oficio',
      d: 'Picadora de billetes, silbato y cartera de cuero.',
      o: { hold: HOLD2.punch, neck: NECK.whistle('#E4A844'), back: BACK2.backpack('#8A5A3A') },
    },
    {
      n: 'Cuento',
      d: 'Guardiana del tren de estrellas: capa de noche y farol con estrella.',
      o: { back: BACK2.stars('#2A305C', '#454E88'), hold: HOLD2.lantern2('#F6D98A'), torso: TORSO.stars() },
    },
  ],
  far: [
    {
      n: 'Pulida',
      d: 'Impermeable con botones, bufanda marinera.',
      o: { torso: TORSO.buttons('#3E5A6E', 3), neck: NECK.scarf('#3E5A6E', '#FBF4E3') },
    },
    {
      n: 'Oficio',
      d: 'Jersey de marinero, gorro de lana y rollo de cuerda.',
      o: {
        hat: HAT.beanie('#2E3A52'),
        top: '#FBF4E3',
        sleeve: '#FBF4E3',
        skirt: null,
        torso: TORSO.stripes('#2E3A52', 4, 0.9),
        hold: HOLD2.rope,
      },
    },
    {
      n: 'Cuento',
      d: 'El guardián del haz: un pequeño faro por sombrero y farol en alto.',
      o: { hat: HAT2.lamp(), back: BACK2.cape('#2E3A52', '#F2C94C', 4), hold: HOLD.lantern('#FFF1B0'), hand: U(10, 6) },
    },
  ],
  sot: [
    { n: 'Pulida', d: 'Chal de lana sobre el delantal.', o: { neck: NECK.shawl('#C9694B', '#E4A844') } },
    {
      n: 'Oficio',
      d: 'Cerera: mangas remangadas, gotas de cera y un manojo de velas.',
      o: { hold: HOLD2.candles, sleeve: '#D9A07E', torso: TORSO.splat(['#FBF4E3', '#F3E0B0', '#FFF8E8']) },
    },
    {
      n: 'Cuento',
      d: 'La abuela vela: una vela encendida por sombrero y capa de cera.',
      o: { hat: HAT2.candle, neck: NECK.shawl('#8A5A3A'), back: BACK2.cape('#6E4630', '#C9694B', 6) },
    },
  ],
  cue: [
    {
      n: 'Pulida',
      d: 'Parches en el peto y pañuelo rojo.',
      o: { torso: TORSO.patches(['#E4A844', '#B8484A']), neck: NECK.kerchief('#B8484A', '#FBF4E3') },
    },
    {
      n: 'Oficio',
      d: 'Mochila de herramientas y un cristal que brilla en la mano.',
      o: { hold: HOLD2.crystal('#C9B8F0'), back: BACK2.backpack('#8A5A3A') },
    },
    {
      n: 'Cuento',
      d: 'La niña geoda: corona de cristales y capa de amatista.',
      o: {
        hat: HAT2.crystals(['#C9B8F0', '#8FD3C4', '#F4AFA6']),
        back: BACK2.cape('#4A548E', '#C9B8F0', 4),
        hold: HOLD2.crystal('#8FD3C4'),
        overall: null,
        top: '#6A74B0',
      },
    },
  ],
  vol: [
    {
      n: 'Pulida',
      d: 'Ceniza es «la herrera»: sin barba, con coleta y más ancha de hombros.',
      o: { hair_s: 'coleta', faceX: FX.soot, tw: 1.12 },
    },
    {
      n: 'Oficio',
      d: 'Gafas de forja, moño alto y tenazas con la llave al rojo.',
      o: { hold: HOLD2.tongs, hat: HAT2.goggles('#3A2A20', '#F5A83A'), faceX: FX.soot, hair_s: 'moñoalto', apron: '#5A3A2A' },
    },
    {
      n: 'Cuento',
      d: 'La forjadora de brasas: corona de llamas y capa de chispas.',
      o: { hat: HAT2.ember, back: BACK2.ember, faceX: FX.soot, hair_s: 'melena' },
    },
  ],
  cum: [
    {
      n: 'Pulida',
      d: 'Bufanda roja al viento y chaqueta con cremallera.',
      o: { neck: NECK.scarf('#E0584A', '#FBF4E3'), torso: TORSO.zipper() },
    },
    {
      n: 'Oficio',
      d: 'Gafas de montaña, mochila con cuerda y bandera de cumbre.',
      o: {
        hold: HOLD2.flag('#E0584A'),
        hat: both(HAT.beanie('#E4A844'), HAT2.goggles('#3A3A48', '#8FC3D6')),
        back: BACK2.backpack('#B8484A', '#C9A05C'),
        hand: U(13, 5),
      },
    },
    {
      n: 'Cuento',
      d: 'El niño nube: capa de nubes, orejeras y cometa.',
      o: { back: BACK2.cloud(), hold: HOLD2.kite('#F4AFA6'), hat: HAT2.earmuffs('#FBF8F2', '#8FA9B6'), top: '#8FC3D6', neck: null },
    },
  ],
  dsv: [
    {
      n: 'Pulida',
      d: 'Chaleco con remiendos de colores.',
      o: { torso: both(TORSO.vest('#6A5A4A'), TORSO.patches(['#B8484A', '#3E8FA0'])) },
    },
    {
      n: 'Oficio',
      d: 'Plumero, gafas en la punta de la nariz y bolsillos llenos.',
      o: {
        hold: HOLD2.duster,
        faceX: FX.all(FX.mustache('#8A8078', 0.9), FX2.bigGlasses('#6A4A30', 3.8)),
        torso: TORSO.pocket('#8A7A5A', '#C9A05C'),
      },
    },
    {
      n: 'Cuento',
      d: 'El coleccionista de recuerdos: abrigo lleno de etiquetas y farol.',
      o: { torso: TORSO.tags, back: BACK2.cape('#7A6A4A', '#B8484A', 6), hold: HOLD.lantern('#FFD36A'), hat: HAT.top('#6A5A4A') },
    },
  ],
  est: [
    { n: 'Pulida', d: 'Bufanda granate y dedos manchados de tinta.', o: { neck: NECK.scarf('#B8484A'), inkHands: '#3A4660' } },
    {
      n: 'Oficio',
      d: 'Escribana: chaleco, cartas lacradas y rollos a la espalda.',
      o: { hold: HOLD2.letters, back: BACK2.rolls('#8A5A3A'), torso: TORSO.vest('#5A4A3A') },
    },
    {
      n: 'Cuento',
      d: 'Boina con pluma gigante y una estela de hojas de papel.',
      o: { hat: HAT2.feather('#3A4660', '#FBF4E3'), back: BACK2.quiverPaper },
    },
  ],
  ret: [
    {
      n: 'Pulida',
      d: 'Bata salpicada de pintura y pañuelo turquesa.',
      o: { torso: TORSO.splat(['#3E8FA0', '#E4A844', '#B8484A', '#6F8D5E']), neck: NECK.kerchief('#3E8FA0') },
    },
    {
      n: 'Oficio',
      d: 'Lleva el marco vacío de Amaranta y pintura en la cara.',
      o: { hold: HOLD2.frame, hand: U(10, 10), faceX: FX2.paint, apron: '#C9A05C' },
    },
    {
      n: 'Cuento',
      d: 'Boina con pluma, capa de pintor y un pincel enorme.',
      o: { hold: HOLD2.brush, hat: HAT2.feather('#B8484A', '#F5CE55'), back: BACK2.cape('#3E8FA0', '#E4A844', 4), faceX: FX2.paint },
    },
  ],
  jar: [
    { n: 'Pulida', d: 'Chal color miel y chaqueta con botones.', o: { neck: NECK.shawl('#E4A844'), torso: TORSO.buttons('#F3E6C4', 2) } },
    {
      n: 'Oficio',
      d: 'Sombrero de paja, delantal con semillas, guantes y pala.',
      o: { hold: HOLD2.trowel, apron: '#C9A05C', inkHands: '#8A6A3A', hat: HAT.straw(false), torso: TORSO.pocket('#C9A05C', '#6F8D5E') },
    },
    {
      n: 'Cuento',
      d: 'La abuela jardín: corona de flores, capa de hojas y el árbol sin nombre.',
      o: { hat: HAT2.crown(['#FBF4E3', C.petal, '#C9B8F0']), back: BACK2.leafCape('#6F8D5E', '#A7BE8B'), hold: HOLD2.sprout },
    },
  ],
  cor: [
    {
      n: 'Pulida',
      d: 'Chal color miel y vestido con panal bordado.',
      o: { neck: NECK.shawl('#E4A844', '#C47A2C'), torso: TORSO.hex('#E4A844', 0.5) },
    },
    {
      n: 'Oficio',
      d: 'La apicultora: velo, delantal y el cuadro de panal sobre las rodillas.',
      o: { hold: HOLD2.comb, hat: HAT.veil, apron: '#F4EFE2', neck: (p, G) => HOLD2.bee(p, G, G.pt(-10, G.sh + 8)) },
    },
    {
      n: 'Cuento',
      d: 'La reina dormida: corona de cera, alas plegadas y capa de panal.',
      o: { hat: HAT2.hexCrown(), back: both(BACK2.wings(), BACK2.combCape()), neck: NECK.necklace() },
    },
  ],
};
const HUMAN_NAMES = {
  pri: 'Brote',
  ver: 'Solano',
  oto: 'Ocre',
  inv: 'Escarcha',
  esp: 'Orión',
  oce: 'Coral',
  des: 'Duna',
  ant: 'Témpano',
  col: 'Abril',
  bib: 'Tomo',
  coc: 'Miel',
  rel: 'Péndulo',
  inn: 'Luna',
  tea: 'Telón',
  tre: 'Estela',
  far: 'Albor',
  sot: 'Vela',
  cue: 'Geoda',
  vol: 'Ceniza',
  cum: 'Nube',
  dsv: 'Trasto',
  est: 'Pluma',
  ret: 'Marco',
  jar: 'Rocío',
  cor: 'Amaranta',
};
/* dibuja una versión (0 = la actual) en un lienzo y devuelve la imagen */
function variantSheet(id, i, W = 280, Hh = 340, sc = 2.75, t = 1.3, bg = '#FBF6EA') {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = Hh;
  const g = c.getContext('2d');
  {
    const pr = Object.getPrototypeOf(g),
      d = Object.getOwnPropertyDescriptor(pr, 'globalCompositeOperation');
    Object.defineProperty(g, 'globalCompositeOperation', {
      get() {
        return d.get.call(g);
      },
      set(v) {
        d.set.call(g, v === 'lighter' ? 'source-over' : v);
      },
    });
  }
  if (bg) {
    g.fillStyle = bg;
    g.fillRect(0, 0, W, Hh);
  }
  const H = i ? Object.assign({}, HB[id], VARIANTS[id][i - 1].o) : HB[id];
  const p = Pen(g, W * 0.46, Hh - 30, sc, 'var' + id + i, true, true);
  if (H.pose === 'sit') {
    const sz = H.seat || 26;
    p.flat(p.ell(...p.P(4, 0, 0), 24, 7), 'rgba(70,40,15,.18)');
    for (const dx of [-8, 16]) p.line([p.P(dx, 0, 0), p.P(dx, 0, sz - 2)], '#8A5A34', 2.6);
    p.cut([p.P(-13, 0, sz - 2), p.P(21, 0, sz - 2), p.P(21, 0, sz + 3), p.P(-13, 0, sz + 3)], '#C98A42', { rough: 0.2 });
  }
  const sv = HUMANS[id];
  HUMANS[id] = H;
  try {
    drawHuman(p, 0, 0, 1, t, 'smile', false, Object.assign({}, H, { _mv: 0, _wave: 0, _use: 0, _nod: 0 }));
  } finally {
    HUMANS[id] = sv;
  }
  return c.toDataURL('image/png');
}

/* la colmena elige la versión «Cuento» para todos */
const LOOK = 2;
for (const id in VARIANTS) Object.assign(HUMANS[id], VARIANTS[id][LOOK].o);
