/* ══════════ INTERFAZ «PAPEL Y MIEL» · solo con window.COLMENA_UI2 (dist/muestra-interfaz.html) ══════════
   Muestra de la interfaz nueva que eligió el dueño (nov 2026). Sin la marca, el juego no cambia nada.
   1 · Un solo estilo: tarjetas crema con filo dorado fino, sombra suave, esquinas poco redondeadas,
       texto marrón oscuro y un acento miel. Fuera los bordes rasgados y los recuadros oscuros.
   2 · Portada que enseña el juego: la colmena 3D de fondo, título grande, «Temporada 1 · El despertar» y pocos botones.
   3 · Botones de esquina con icono claro y su nombre debajo (Hora, Explorar, Mapa, Menú).
   4 · Menú con jerarquía: lo principal arriba, la partida aparte y «Reiniciar» separado, en rojo y con confirmación propia.
   5 · Nada se pisa: el tutorial se aparta del rótulo de hablar, la narración del mapa sube, los logros no caen bajo
       los botones y el creador tiene su pie fuera de la zona que se desplaza.
   6 · Letra más grande en PC (objetivo, nombre del cuarto, carteles de puerta), cuaderno vacío con su ilustración,
       casillas de Ajustes junto a su texto, zonas táctiles de 44 px y respeto a «reducir movimiento». */
if (window.COLMENA_UI2) {
  document.body.classList.add('ui2');
  const $ = (id) => document.getElementById(id);
  I18N([
    ['Hora', 'Time', 'Время', '时辰'],
    ['Explorar', 'Explore', 'Обзор', '探索'],
    ['Mapa', 'Map', 'Карта', '地图'],
    ['Volver', 'Back', 'Назад', '返回'],
    ['Opciones', 'Options', 'Настройки', '选项'],
    ['¿Reiniciar la partida?', 'Restart this game?', 'Начать игру заново?', '重新开始这局游戏？'],
    [
      'Se borrará el progreso de esta partida: sellos, mochila y cuaderno. No se puede deshacer.',
      'This save’s progress will be erased: seals, backpack and notebook. It cannot be undone.',
      'Прогресс этой игры будет стёрт: печати, рюкзак и тетрадь. Отменить нельзя.',
      '这局游戏的进度将被清除：封印、背包和笔记本。此操作无法撤销。',
    ],
    ['Cancelar', 'Cancel', 'Отмена', '取消'],
    ['Sí, reiniciar', 'Yes, restart', 'Да, заново', '是的，重新开始'],
    ['Aún no hay páginas', 'No pages yet', 'Страниц пока нет', '还没有书页'],
    ['Sin encargos todavía', 'No errands yet', 'Поручений пока нет', '还没有委托'],
    ['Nada por aquí todavía', 'Nothing here yet', 'Здесь пока пусто', '这里还什么都没有'],
  ]);
  const svg = (d, w) =>
    'url("data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${w || '#33221A'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`,
    ) +
    '")';
  /* iconos de trazo fino, todos del mismo dibujo */
  const IC = {
    explora: '<circle cx="10.5" cy="10.5" r="6.3"/><path d="M15.3 15.3L20.5 20.5M10.5 7.6v5.8M7.6 10.5h5.8"/>',
    mapa: '<path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
    cuarto: '<path d="M12 3.2l7.6 4.4v8.8L12 20.8l-7.6-4.4V7.6z"/><circle cx="12" cy="12" r="2.3"/>',
    menu: '<path d="M4.5 7h15M4.5 12h15M4.5 17h15"/>',
    libro:
      '<path d="M6.5 3.5H18v14H7a2 2 0 0 0-2 2V5a1.5 1.5 0 0 1 1.5-1.5z"/><path d="M5 19.5a2 2 0 0 0 2 1.5h11v-3.5M10 3.5v6l2-1.4 2 1.4v-6"/>',
    ajustes:
      '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21M5.6 5.6l1.9 1.9M16.5 16.5l1.9 1.9M5.6 18.4l1.9-1.9M16.5 7.5l1.9-1.9"/>',
    sonido: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.4 7.4 0 0 1 0 10.4"/>',
    persona: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6"/>',
    foto: '<path d="M4 8h3.5L9 5.5h6L16.5 8H20v11H4z"/><circle cx="12" cy="13.3" r="3.3"/>',
    pantalla: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
    guardar: '<path d="M12 4v10.5M7.5 10L12 14.5 16.5 10M5 19.5h14"/>',
    cargar: '<path d="M12 14.5V4M7.5 8.5L12 4l4.5 4.5M5 19.5h14"/>',
    titulo: '<path d="M4 11l8-6.5 8 6.5M6.5 9.5V20h11V9.5"/>',
    reinicia: '<path d="M4.6 12a7.4 7.4 0 1 0 2.2-5.3"/><path d="M4.6 4.4v4.1h4.1"/>',
    pista: '<circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.6a2.4 2.4 0 1 1 3.3 2.2c-.7.3-1 .8-1 1.6M12 16.7v.1"/>',
    pagina:
      '<path d="M12 6.5C10 5 7 4.6 4 5v13c3-.4 6 0 8 1.5 2-1.5 5-1.9 8-1.5V5c-3-.4-6 0-8 1.5z"/><path d="M12 6.5v13M6.5 8.5c1.2-.1 2.4.1 3.5.5M6.5 11.5c1.2-.1 2.4.1 3.5.5M14 9c1.1-.4 2.3-.6 3.5-.5"/>',
  };
  const ICB = { danger: '#9E3B28' };
  const MENU = {
    bbook: ['libro', '📖 Cuaderno'],
    map: ['mapa', null],
    hintb: ['pista', '? Pista'],
    bset2: ['ajustes', '⚙ Ajustes'],
    snd: ['sonido', null],
    bchar: ['persona', '✎ Personaje'],
    bphoto: ['foto', '📷 Modo foto'],
    bfs2: ['pantalla', '⛶ Pantalla completa'],
    bsavec: ['guardar', '💾 Guardar copia'],
    bloadc: ['cargar', '📂 Cargar copia'],
    btitle: ['titulo', '⌂ Volver al título'],
    rst: ['reinicia', '↺ Reiniciar'],
  };

  /* ═══ 1 · el estilo ═══
     Todo va colgado de «html body.ui2» para ganar a las reglas de adulto.js, ui_fix.js y head.html sin tocarlas. */
  const B = 'html body.ui2';
  const css = document.createElement('style');
  css.id = 'ui2css';
  css.textContent = `
${B}{--u-paper:#FBF6EA;--u-paper2:#F3EAD6;--u-paper3:#EADDBF;--u-edge:#CDA765;--u-line:rgba(176,132,62,.32);--u-ink:#33221A;--u-ink2:#6A4D36;--u-ink3:#8C6A4C;
  --u-honey:#E3A43E;--u-honey2:#F2C46E;--u-honeyd:#8F5A17;--u-danger:#9E3B28;--u-r:6px;
  --u-sh:0 1px 2px rgba(40,22,10,.16),0 6px 18px rgba(40,22,10,.2);--u-sh2:0 1px 2px rgba(40,22,10,.2),0 14px 40px rgba(30,15,5,.34);
  --u-font:Fraunces,'Noto Serif','Noto Serif SC',Georgia,serif}
/* ── base: sin papel rasgado ni sombras de recorte ── */
${B} .torn{clip-path:none!important}
${B} .shadow{filter:none!important}
${B} .paper{background:var(--u-paper)!important;background-image:none!important;border:1px solid var(--u-edge);border-radius:var(--u-r);box-shadow:var(--u-sh);color:var(--u-ink)}
${B} button{border-radius:5px!important}
${B} :focus-visible{outline:2px solid var(--u-honeyd)!important;outline-offset:2px}
/* botones: miel el principal, crema con filo el resto */
${B} .tbtns button,${B} #sclose,${B} .bclose,${B} .crbtns button,${B} .recap button,${B} .mgb button,${B} .mgx button,${B} .photo button,${B} .plogb,${B} .ubtn{
  font:500 16px/1.2 var(--u-font)!important;min-height:46px;padding:10px 18px;border:1px solid var(--u-edge)!important;background:var(--u-paper)!important;color:var(--u-ink)!important;
  box-shadow:0 1px 0 rgba(120,80,30,.12)!important;cursor:pointer;transition:background .15s,border-color .15s,transform .12s}
${B} .tbtns button:hover,${B} #sclose:hover,${B} .bclose:hover,${B} .crbtns button:hover,${B} .recap button:hover,${B} .mgb button:hover,${B} .mgx button:hover,${B} .photo button:hover,${B} .ubtn:hover{background:#FFF9EE!important;border-color:var(--u-honeyd)!important;transform:none}
${B} .tbtns button:first-child:not([hidden]),${B} .tbtns #bnew,${B} #sclose,${B} .bclose,${B} #crok,${B} .recap button.pri,${B} .ubtn.pri,${B} .mgb button[aria-pressed="true"],${B} .photo button[aria-pressed="true"]{
  background:var(--u-honey)!important;border-color:#B9802A!important;color:#2A1A10!important;font-weight:600!important}
${B} .tbtns button:first-child:not([hidden]):hover,${B} .tbtns #bnew:hover,${B} #sclose:hover,${B} .bclose:hover,${B} #crok:hover,${B} .recap button.pri:hover,${B} .ubtn.pri:hover{background:var(--u-honey2)!important}
${B} .ubtn.danger{background:var(--u-danger)!important;border-color:#7A2A1A!important;color:#FFF4EA!important;font-weight:600!important}
${B} .ubtn.danger:hover{background:#B4482F!important}

/* ── nombre del cuarto ── */
${B} .tag .p{padding:9px 18px 10px 10px;gap:11px}
${B} .tag .seal{width:38px;height:38px;font-size:18px;color:var(--u-paper);background:var(--u-honey);box-shadow:inset 0 0 0 1px #B9802A}
${B} .tag b{font-size:24px;letter-spacing:.005em;color:var(--u-ink)}
${B} .tag i{font-size:15px;opacity:1;color:var(--u-ink2)}
/* ── objetivo ── */
${B} #goal{top:var(--u-goal-top,88px)!important;background:var(--u-paper)!important;color:var(--u-ink)!important;border:1px solid var(--u-edge)!important;border-left:4px solid var(--u-honey)!important;border-radius:var(--u-r)!important;
  box-shadow:var(--u-sh)!important;font-size:17px!important;line-height:1.35!important;padding:9px 16px 10px 14px!important;max-width:min(440px,60vw)!important}
${B} #goal *{color:inherit!important}
${B} #goal::before{color:var(--u-honeyd)!important;font-size:11.5px!important;letter-spacing:.14em;font-weight:600;margin-bottom:2px}
${B} #goal[data-go]::after{color:var(--u-honeyd)!important;font-size:14px!important}
/* ── avisos, logros y celebraciones ── */
${B} #note{background:var(--u-paper)!important;color:var(--u-ink)!important;border:1px solid var(--u-edge)!important;border-radius:var(--u-r)!important;box-shadow:var(--u-sh)!important;font-size:16px;padding:9px 18px!important}
${B} #note *{color:inherit!important}
${B} .achv{top:var(--u-achv-top,96px)!important;bottom:auto!important;background:var(--u-paper);color:var(--u-ink);border:1px solid var(--u-edge);border-radius:var(--u-r);box-shadow:var(--u-sh2);z-index:9}
${B} .achv .ahx{color:var(--u-honey)}${B} .achv small{color:var(--u-honeyd);opacity:1;font-weight:600}${B} .achv b{font-size:16px}
${B} .celeb{background:var(--u-paper);color:var(--u-ink);border:1px solid var(--u-edge);border-radius:var(--u-r);box-shadow:var(--u-sh2)}
${B} .celeb i{background:var(--u-honey);color:var(--u-ink)}${B} .celeb small{color:var(--u-honeyd);font-weight:600}
/* ── tutorial ── */
${B} .tut{width:min(460px,calc(100% - 24px))}
${B} .tut .p,${B} .tut .paper{background:var(--u-paper)!important;border:1px solid var(--u-edge)!important;border-radius:var(--u-r)!important;box-shadow:var(--u-sh2)!important;padding:10px 10px 10px 14px!important}
${B} .tut *{color:var(--u-ink)!important}
${B} .tut .tn{background:var(--u-honey)!important;color:var(--u-ink)!important;width:30px;height:30px}
${B} .tut p{font-size:16px;line-height:1.4}
${B} .tut button{color:var(--u-ink2)!important;text-decoration:none!important;border:1px solid var(--u-line)!important;border-radius:5px!important;padding:0 12px!important}
${B} .tut.utop{top:var(--u-tut-top,90px)!important;bottom:auto!important}
${B} .hint .p{font-size:14px;padding:8px 14px;color:var(--u-ink2)}
/* ── rótulo de hablar, viaje y diálogo ── */
${B} #talk .p{font-size:16px;padding:9px 16px 10px;border-color:var(--u-honey)}
${B} .travel .p{font-size:16px}
${B} .dlg{width:min(540px,calc(100% - 24px))}
${B} .dlg .p{padding:16px 20px 14px 16px;gap:16px;box-shadow:var(--u-sh2)}
${B} .hexf{background:var(--u-honey)}
${B} .dlg b{font-size:20px;color:var(--u-ink)}
${B} .dlg p.l{font-size:17px;line-height:1.45;color:var(--u-ink)}
${B} .dlg small{font-size:13px;color:var(--u-ink3);opacity:1}
${B} .dch button{background:var(--u-paper2)!important;border:1px solid var(--u-edge)!important;box-shadow:none!important;min-height:44px;font-size:16px}
${B} .dch button:hover,${B} .dch button:focus-visible{background:#FFF1D2!important;border-color:var(--u-honeyd)!important}
${B} .dskip{color:var(--u-ink2)!important;font-size:13.5px!important;min-height:44px!important}
/* ── narración: subtítulo limpio ── */
${B} .narr{background:linear-gradient(90deg,rgba(26,15,8,0),rgba(26,15,8,.72) 18%,rgba(26,15,8,.72) 82%,rgba(26,15,8,0));padding:12px 44px 10px;font-size:19px;color:#FBF1DC}
${B} .narr small{color:var(--u-honey2);opacity:.9;font-weight:600}
/* ── mochila ── */
${B} .hand .p{padding:7px 12px 7px 12px;gap:10px}
${B} .hand small,${B} .bagk small{color:var(--u-honeyd)!important;font-weight:600}
${B} .bagk b{color:var(--u-ink2)!important}
${B} .bagslots i{color:var(--u-ink)!important;font-size:12px}
${B} .bagslots canvas{background:var(--u-paper2);border-radius:5px}
/* ── el mapa ── */
${B} .pisos .p{padding:12px 14px 10px}${B} .pisos b{color:var(--u-honeyd)}${B} .pisos span{color:var(--u-ink2)}${B} .pisos span.on{color:var(--u-ink)}
${B} .barrio{background:var(--u-paper)!important;border:1px solid var(--u-edge);border-radius:5px!important;box-shadow:var(--u-sh)!important;color:var(--u-ink)!important;font-size:13.5px!important}
${B} .aqui{border-radius:5px;font-size:13.5px}
${B} .aqui.yo{background:var(--u-ink)}${B} .aqui.ve{background:var(--u-honey);color:var(--u-ink)}

/* ═══ botones de esquina: icono y nombre ═══ */
${B} .ctrl{gap:6px;top:calc(14px + env(safe-area-inset-top,0px))}
${B} .ctrl button{width:60px;height:60px;border-radius:7px!important;padding:6px 0 0;background:var(--u-paper);border:1px solid var(--u-edge);box-shadow:var(--u-sh);color:var(--u-ink);font-size:0!important;filter:none!important;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;transition:background .15s,border-color .15s}
${B} .ctrl button:hover{background:#FFF9EE;border-color:var(--u-honeyd)}
${B} .ctrl button::before{content:"";display:block;width:24px;height:24px;background:var(--ic) center/24px 24px no-repeat}
${B} .ctrl button::after,${B} .ctrl button.off::after{content:attr(data-l);position:static;display:block;border:0;transform:none;font:600 11.5px/1 var(--u-font);letter-spacing:.01em;color:var(--u-ink2);white-space:nowrap}
${B} .ctrl button[aria-pressed="true"],${B} .ctrl button.on,${B} .ctrl #menu[aria-expanded="true"]{background:var(--u-honey);border-color:#B9802A;outline:0}
${B} .ctrl button[aria-pressed="true"]::after,${B} .ctrl button.on::after,${B} .ctrl #menu[aria-expanded="true"]::after{color:var(--u-ink)}
${B} #hora::before{display:none}
${B} #hora svg{width:26px;height:26px;margin:0}
${B} #hora svg circle[stroke]{stroke:var(--u-paper3)}
${B} #hora svg path{stroke:var(--u-honey)}
${B} #hora svg circle[fill="#FFE07A"]{fill:var(--u-honey)}
${B} #hora svg circle[fill="#8A6A9A"]{fill:var(--u-paper)}
${B} #hora svg circle[fill="#E6E9FF"]{fill:#5B6A9A}
${B} #m2heart{right:6px;bottom:22px}
${B} #bexp{--ic:${svg(IC.explora)}}
${B} #bmap{--ic:${svg(IC.mapa)}}
${B}.umapa #bmap{--ic:${svg(IC.cuarto)}}
${B} #menu{--ic:${svg(IC.menu)}}

/* ═══ menú: jerarquía ═══ */
${B} .panel{top:calc(86px + env(safe-area-inset-top,0px))}
${B} .panelbg{background:rgba(26,14,6,.28)}
${B} .panel .p{width:min(340px,calc(100vw - 24px));padding:16px 14px 14px;box-shadow:var(--u-sh2)}
${B} .panel .phead{border-bottom:1px solid var(--u-line);padding:0 4px 10px;margin-bottom:12px}
${B} .panel .mhead{color:var(--u-ink2)!important;font-size:13px}
${B} .panel .mhead:first-child{color:var(--u-ink)!important;font-weight:600;font-size:14px}
${B} .pgrid{gap:6px;grid-template-columns:1fr 1fr}
${B} .pgrid button{order:20;min-height:44px!important;padding:8px 10px!important;gap:9px!important;font:500 14.5px/1.2 var(--u-font)!important;color:var(--u-ink)!important;background:transparent!important;
  border:1px solid transparent!important;box-shadow:none!important;justify-content:flex-start!important;margin:0!important;grid-column:auto!important;text-align:left;font-weight:500!important}
${B} .pgrid button:hover,${B} .pgrid button:focus-visible{background:var(--u-paper2)!important;border-color:var(--u-line)!important}
${B} .pgrid .uic{flex:none;width:22px;height:22px;background:var(--ic) center/22px 22px no-repeat}
${B} .pgrid .ulb{min-width:0}
/* lo principal: Cuaderno y Mapa, dos baldosas grandes */
${B} .pgrid #bbook,${B} .pgrid #map{order:1;min-height:76px!important;flex-direction:column!important;justify-content:center!important;align-items:center!important;gap:6px!important;text-align:center;
  background:var(--u-paper2)!important;border:1px solid var(--u-edge)!important;font-weight:600!important;font-size:15.5px!important}
${B} .pgrid #bbook .uic,${B} .pgrid #map .uic{width:28px;height:28px;background-size:28px 28px}
${B} .pgrid #bbook:hover,${B} .pgrid #map:hover{background:#FFF1D2!important;border-color:var(--u-honeyd)!important}
${B} .pgrid #map{order:2}
${B} .pgrid #hintb{order:3;grid-column:1/-1!important}
${B} .pgrid #bset2{order:11}${B} .pgrid #snd{order:12}${B} .pgrid #bchar{order:13}${B} .pgrid #bphoto{order:14}${B} .pgrid #bfs2{order:15;grid-column:1/-1!important}
${B} .pgrid .ugh{order:10;grid-column:1/-1;margin:10px 4px 0;font:600 11px/1 var(--u-font);letter-spacing:.14em;text-transform:uppercase;color:var(--u-ink3)}
${B} .pgrid .ugh.u2{order:30}
${B} .pgrid #bsavec{order:31}${B} .pgrid #bloadc{order:32}
${B} .pgrid #bloadc.sure{background:var(--u-danger)!important;color:#FFF4EA!important}
${B} .pgrid .usep{order:40;grid-column:1/-1;height:1px;background:var(--u-line);margin:8px 0 4px}
${B} .pgrid #btitle{order:41;grid-column:1/-1!important}
${B} .pgrid #rst{order:42;grid-column:1/-1!important;color:var(--u-danger)!important;background:transparent!important;font-size:14px!important;border:0!important}
${B} .pgrid #rst .uic{--ic:${svg(IC.reinicia, ICB.danger)}!important}
${B} .pgrid #rst:hover{background:rgba(158,59,40,.08)!important}
${B} .pgrid .psep{display:none!important}
${Object.entries(MENU)
  .filter(([k]) => k !== 'rst')
  .map(([k, [ic]]) => `${B} #${k} .uic{--ic:${svg(IC[ic])}}`)
  .join('\n')}
${B}.umapa #map .uic{--ic:${svg(IC.cuarto)}}

/* ═══ ventanas: ajustes, cuaderno, minijuegos, informe ═══ */
${B} .modal{background:rgba(26,14,6,.42)}
${B} .modal .p{box-shadow:var(--u-sh2)}
${B} .modal.sheet .p{padding:24px 24px 18px}
${B} .modal h2{font:600 24px/1.2 var(--u-font);color:var(--u-ink);padding-bottom:10px;border-bottom:1px solid var(--u-line);margin-bottom:6px!important}
${B} .modal .row{border-bottom:1px solid var(--u-line);color:var(--u-ink);font-size:16px;min-height:44px;box-sizing:border-box}
${B} .modal .row small{color:var(--u-ink3);font-size:13px;margin-top:2px}
${B} .mfoot{border-top:1px solid var(--u-line)}
${B} .modal select{font:500 15px var(--u-font);min-height:40px;padding:6px 10px;border:1px solid var(--u-edge);border-radius:5px;background:var(--u-paper);color:var(--u-ink)}
${B} .modal input[type=range]{accent-color:var(--u-honey)}
/* casillas: a la izquierda, pegadas a su texto */
${B} #settings label.row:has(input[type=checkbox]){justify-content:flex-start!important;gap:14px!important;cursor:pointer}
${B} #settings label.row input[type=checkbox]{order:-1;flex:none;appearance:none;-webkit-appearance:none;width:24px!important;height:24px!important;margin:0;border:1.5px solid var(--u-edge);border-radius:5px;background:var(--u-paper);display:grid;place-items:center;cursor:pointer}
${B} #settings label.row input[type=checkbox]:checked{background:var(--u-honey);border-color:#B9802A}
${B} #settings label.row input[type=checkbox]:checked::after{content:"";width:12px;height:7px;border-left:2.5px solid var(--u-ink);border-bottom:2.5px solid var(--u-ink);transform:translateY(-2px) rotate(-45deg)}
${B} #settings .keys{color:var(--u-ink2)}${B} kbd{background:var(--u-paper2);box-shadow:inset 0 0 0 1px var(--u-line)}
/* cuaderno */
${B} .btop{background:var(--u-paper2);padding:4px;border-radius:7px;gap:4px;margin-bottom:12px}
${B} .btop button{border:1px solid transparent!important;background:transparent!important;color:var(--u-ink2)!important;font:600 15px var(--u-font)!important;min-height:44px}
${B} .btop button[aria-selected="true"]{background:var(--u-paper)!important;border-color:var(--u-edge)!important;color:var(--u-ink)!important;box-shadow:0 1px 3px rgba(40,22,10,.14)}
${B} .btabs{border-bottom:1px solid var(--u-line)}
${B} .btabs button{color:var(--u-ink3)!important;background:none!important;border-radius:0!important}
${B} .btabs button[aria-selected="true"]{color:var(--u-ink)!important;border-bottom-color:var(--u-honey)!important;background:none!important}
${B} .bpages article,${B} .nbr,${B} .bach div,${B} .dq{background:var(--u-paper2)!important;border-radius:5px}
${B} .bglyph{color:var(--u-ink2)}
${B} .uempty{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:26px 18px 22px;margin:4px 0 10px;border:1px dashed var(--u-edge);border-radius:var(--u-r);background:linear-gradient(var(--u-paper2),var(--u-paper))}
${B} .uempty i{width:64px;height:64px;border-radius:50%;background:var(--u-paper) ${svg(IC.pagina, '#B07A2A')} center/34px 34px no-repeat;box-shadow:inset 0 0 0 1px var(--u-edge);margin-bottom:6px}
${B} .uempty h4{margin:0;font:600 18px/1.25 var(--u-font);color:var(--u-ink)}
${B} .uempty p.empty{margin:0;max-width:34ch;font-style:normal!important;font-size:15px!important;line-height:1.45;color:var(--u-ink2)!important}
/* creador: el pie fuera de lo que se desplaza */
${B} .modal.creator .p{display:flex!important;flex-direction:column;overflow:hidden!important;max-height:calc(100dvh - 24px)!important;box-sizing:border-box}
${B} .crscroll{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;margin:0 -8px;padding:0 8px 6px;display:flex;flex-direction:column}
${B} .crscroll>.crbody{order:1}${B} .crscroll>.difbox{order:2}
${B} .modal.creator .crbtns{flex:none;position:static!important;margin:10px 0 0!important;padding:12px 0 0!important;border-top:1px solid var(--u-line);background:none!important;box-shadow:none!important}
${B} .crl{color:var(--u-ink3)!important;font-weight:600;font-size:12px!important;letter-spacing:.1em;text-transform:uppercase}
${B} .crrow{border-bottom:1px solid var(--u-line)!important}
${B} .cropts button:not(.sw){background:var(--u-paper)!important;border:1px solid var(--u-edge)!important;box-shadow:none!important;color:var(--u-ink)!important}
${B} .cropts button:not(.sw)[aria-pressed="true"]{background:var(--u-honey)!important;border-color:var(--u-ink)!important;box-shadow:0 0 0 1px var(--u-ink)!important;font-weight:600!important}
${B} .cropts button.sw{border:1px solid rgba(0,0,0,.15)!important}
${B} .cropts button.sw[aria-pressed="true"]{box-shadow:0 0 0 2px var(--u-paper),0 0 0 4px var(--u-ink)!important}
${B} .difs button{border:1px solid var(--u-edge)!important;background:var(--u-paper)!important;border-radius:5px!important}
${B} .difs button.on{background:#FFF1D2!important;border-color:var(--u-honeyd)!important;box-shadow:inset 0 0 0 1px var(--u-honeyd)}
${B} #crprev3d{border-radius:5px}
/* resumen al continuar */
${B} .recap .p{border-radius:var(--u-r)}
${B} .recap .obj{background:var(--u-paper2);color:var(--u-ink);border-left:4px solid var(--u-honey);border-radius:5px}
${B} .recap .obj small{color:var(--u-honeyd)}
/* confirmación de reiniciar */
${B} #uconf .p{width:min(420px,calc(100vw - 32px));box-sizing:border-box;padding:22px 22px 18px}
${B} #uconf p{margin:6px 0 18px;font-size:16px;line-height:1.45;color:var(--u-ink2)}
${B} #uconf .ub{display:flex;gap:10px;flex-wrap:wrap}${B} #uconf .ub button{flex:1 1 140px}
${B} #uconf h2{border:0;padding:0;margin:0!important;display:flex;gap:10px;align-items:center}
${B} #uconf h2::before{content:"";flex:none;width:30px;height:30px;border-radius:50%;background:rgba(158,59,40,.1) ${svg(IC.reinicia, ICB.danger)} center/20px no-repeat}

/* ═══ portada: la colmena de fondo ═══ */
${B} #cv3{transition:transform 1.4s cubic-bezier(.2,.7,.2,1)}
${B}.intitle #cv3{transform:translateX(15vw) translateY(4vh) scale(1.02)}${B} .title :focus-visible{outline-color:#F8ECD4!important;outline-offset:3px}
${B} .title{display:flex;align-items:center;justify-content:flex-start;padding:0 0 0 max(7vw,32px);box-sizing:border-box;
  background:linear-gradient(90deg,rgba(18,10,5,.86) 0%,rgba(18,10,5,.66) 30%,rgba(18,10,5,.12) 58%,rgba(18,10,5,0) 72%),linear-gradient(0deg,rgba(18,10,5,.5),rgba(18,10,5,0) 30%)}
${B} .tcard .p{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;min-width:0!important;width:min(420px,86vw);text-align:left;display:flex;flex-direction:column}
${B} .title h1{order:1;white-space:nowrap;font-size:clamp(68px,8.4vw,120px);line-height:.95;letter-spacing:-.015em;color:#F8ECD4;font-weight:600}
${B} .title h1 span{animation:none!important;color:inherit!important;transform:none!important}
${B} .tdemo{order:2;display:block!important;margin:10px 0 0!important;padding:0!important;background:none!important;border-radius:0!important;color:var(--u-honey2)!important;font:italic 500 23px/1.25 var(--u-font)!important;letter-spacing:.01em!important;text-transform:none!important}
${B} .tsub{order:3;margin:8px 0 0!important;color:rgba(248,236,212,.72)!important;font-size:16px!important;font-style:normal!important}
${B} .slots{order:4;justify-content:flex-start!important;margin:30px 0 10px!important;color:rgba(248,236,212,.72)!important;font-size:13.5px!important;gap:6px!important}
${B} .slots span{margin-right:4px;letter-spacing:.08em;text-transform:uppercase;font-size:11.5px;font-weight:600}
${B} .slots button{color:#F8ECD4!important;box-shadow:inset 0 0 0 1px rgba(242,196,110,.45)!important;border-radius:5px!important;background:transparent!important}
${B} .slots button[aria-pressed="true"]{background:rgba(242,196,110,.2)!important;box-shadow:inset 0 0 0 1.5px var(--u-honey2)!important}
${B} .tbtns{order:5;max-width:none!important;margin:0!important;gap:10px!important}
${B} .tbtns button{min-height:52px!important;font-size:17px!important}
${B} .tbtns #bfs{position:absolute;top:calc(16px + env(safe-area-inset-top,0px));right:16px;min-height:44px!important;padding:8px 14px 8px 38px!important;font-size:14px!important;background:rgba(251,246,234,.1) ${svg(IC.pantalla, '#F8ECD4')} 12px center/18px no-repeat!important;
  color:#F8ECD4!important;border-color:rgba(242,196,110,.45)!important}
${B} .tbtns #bfs:hover{background-color:rgba(251,246,234,.2)!important}
${B} .tcopy{order:6;justify-content:flex-start!important;margin:6px 0 0 -10px!important}
${B} .tcopy button{color:rgba(248,236,212,.8)!important;font-size:14px!important}
${B} .langs{order:7;justify-content:flex-start!important;margin:18px 0 0!important;max-width:none!important;gap:2px!important}
${B} .langs button{background:transparent!important;color:rgba(248,236,212,.7)!important;box-shadow:none!important;font-size:14px!important;border-radius:0!important;border-bottom:2px solid transparent!important;padding:4px 10px!important}
${B} .langs button[aria-pressed="true"]{color:#F8ECD4!important;border-bottom-color:var(--u-honey)!important;font-weight:600}
${B} .tfoot{order:8;position:absolute;left:max(7vw,32px);bottom:calc(18px + env(safe-area-inset-bottom,0px));margin:0!important;color:rgba(248,236,212,.55)!important;font-size:13px!important;text-align:left}
${B} .tfoot b{color:rgba(248,236,212,.85)}

/* ═══ escritorio: carteles y textos más grandes ═══ */
@media (min-width:761px){
  ${B} .hand .p{padding:8px 14px}
  ${B} .bagslots span{width:70px}${B} .bagslots canvas{width:44px;height:44px}${B} .bagslots i{font-size:12.5px;max-width:70px}
  ${B} .bagk small{font-size:11.5px}${B} .bagk b{font-size:14px!important}
}
/* ═══ móvil ═══ */
@media (max-width:760px){
  ${B} .tag b{font-size:20px}${B} .tag i{font-size:13.5px}${B} .tag .seal{width:32px;height:32px;font-size:16px}${B} .tag .p{padding:7px 14px 8px 8px}
  ${B} #goal{font-size:15px!important;max-width:calc(100% - 24px)!important;padding:7px 12px 8px 12px!important}
  ${B} .tut{width:calc(100% - 24px)}${B} .tut p{font-size:15px}
  ${B}.umapa .narr{top:var(--u-narr-top,70px)!important;bottom:auto!important;background:rgba(26,15,8,.84);border-radius:var(--u-r);padding:10px 16px 8px;max-width:calc(100% - 24px);z-index:5}
  ${B}.umapa #note{top:auto!important;bottom:calc(78px + env(safe-area-inset-bottom,0px))!important}
  ${B}.umapa.unarr #goal,${B}.umapa.unarr .pisos{visibility:hidden}
  ${B} .achv{left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:max-content;max-width:calc(100% - 24px);box-sizing:border-box}
}
@media (max-width:520px){
  ${B} .ctrl{top:auto;bottom:calc(12px + env(safe-area-inset-bottom,0px));right:10px;gap:4px}
  ${B} .ctrl button{width:50px;height:54px;padding-top:4px;gap:3px}
  ${B} .ctrl button::before{width:22px;height:22px;background-size:22px 22px}
  ${B} .ctrl button::after,${B} .ctrl button.off::after{font-size:10px;letter-spacing:-.01em}
  ${B} #hora svg{width:24px;height:24px}
  ${B} .dlg{bottom:calc(78px + env(safe-area-inset-bottom,0px))}
  ${B} .dlg .p{padding:12px 14px 10px 12px;gap:12px}${B} .dlg p.l{font-size:16px}${B} .dlg b{font-size:18px}
  ${B} .hexf{width:76px;height:66px}${B} .hexf canvas{width:70px;height:61px}
  ${B} .hand{left:10px!important;bottom:calc(12px + env(safe-area-inset-bottom,0px))!important}
  ${B} .hand .p{padding:5px 8px;gap:4px}
  ${B} .bagslots{gap:4px}${B} .bagslots span{width:46px}${B} .bagslots canvas{width:34px;height:34px}${B} .bagslots i{font-size:10.5px;max-width:46px}
  ${B} .panel{left:10px;right:10px;bottom:calc(76px + env(safe-area-inset-bottom,0px))}
  ${B} .panel .p{width:100%;max-height:calc(100dvh - 100px)}
  ${B} .modal.sheet .p{padding:22px 16px calc(14px + env(safe-area-inset-bottom,0px))}
  ${B} .modal.sheet .p{border-radius:10px 10px 0 0!important;border-bottom:0}
}
@media (max-width:760px){
  /* portada en el móvil: título arriba, la colmena en medio, los botones abajo */
  ${B}.intitle #cv3{transform:translateY(2vh) scale(1.08)}
  ${B} .title{align-items:stretch;padding:calc(40px + env(safe-area-inset-top,0px)) 20px calc(16px + env(safe-area-inset-bottom,0px));
    background:linear-gradient(180deg,rgba(18,10,5,.78) 0%,rgba(18,10,5,.2) 30%,rgba(18,10,5,0) 44%,rgba(18,10,5,.55) 60%,rgba(18,10,5,.9) 78%)}
  ${B} .tcard{width:100%}
  ${B} .tcard .p{width:100%;height:100%;text-align:center;align-items:stretch}
  ${B} .title h1{font-size:64px}
  ${B} .tdemo{font-size:19px!important;margin-top:6px!important}
  ${B} .tsub{font-size:14.5px!important}
  ${B} .slots{margin:auto 0 10px!important;justify-content:center!important}
  ${B} .tbtns{width:100%}
  ${B} .tcopy,${B} .langs{justify-content:center!important;margin-left:0!important}
  ${B} .langs{margin-top:8px!important}
  ${B} .tfoot{position:static;margin:6px 0 0!important;text-align:center}
  ${B} .tbtns #bfs{top:calc(10px + env(safe-area-inset-top,0px));right:10px;font-size:0!important;padding:0!important;width:44px;background-position:center!important}
  /* creador: el personaje a la vista mientras se eligen opciones */
  ${B} .modal.creator{padding:10px}
  ${B} .modal.creator .p{width:100%!important;max-width:none!important;max-height:calc(100dvh - 20px)!important;padding:16px 14px 12px!important}
  ${B} .crscroll>.difbox{order:0;margin:0 0 10px!important}
  ${B} .crbody{gap:10px!important}
  ${B} #crprev3d,${B} #crprev{position:sticky;top:0;z-index:1;height:150px!important;box-shadow:0 6px 10px -6px rgba(40,22,10,.35)}
  ${B} .modal.creator .crbtns{display:grid!important;grid-template-columns:1fr 1fr;gap:8px}
  ${B} .modal.creator .crbtns #crok{grid-column:1/-1;order:3}
  ${B} .modal.creator .crbtns button{padding:10px 8px!important}
}
@media (prefers-reduced-motion:reduce){
  ${B} #cv3,${B} .ctrl button,${B} .tbtns button{transition:none!important}
  ${B} .aqui.ve,${B} .tut,${B} .achv,${B} .celeb,${B} #note{animation:none!important}
  ${B} .achv,${B} .celeb{opacity:1}
}
`;
  document.head.appendChild(css);

  /* ═══ 2 · botones de esquina: su nombre ═══ */
  const tileL = () => {
    const pon = (id, es) => {
      const b = $(id);
      if (b && b.dataset.l !== _t(es)) b.dataset.l = _t(es);
    };
    pon('hora', 'Hora');
    pon('bexp', 'Explorar');
    pon('bmap', typeof mapMode !== 'undefined' && mapMode ? 'Volver' : 'Mapa');
    pon('menu', 'Menú');
  };

  /* ═══ 4 · el menú: icono y texto separados, con su orden ═══ */
  const strip = (s) => {
    s = String(s || '').trim();
    const m = s.match(/^(\S+)\s+([\s\S]*)$/);
    return m && !/[\p{L}\p{N}]/u.test(m[1]) ? m[2] : s;
  };
  const parte = (b, txt) => {
    const i = document.createElement('i'),
      sp = document.createElement('span');
    i.className = 'uic';
    i.setAttribute('aria-hidden', 'true');
    sp.className = 'ulb';
    sp.textContent = txt;
    b.replaceChildren(i, sp);
  };
  const hecho = (b) => b.childNodes.length === 2 && b.firstChild.className === 'uic';
  const vigila = new MutationObserver((ms) => {
    for (const m of ms) {
      const b = m.target;
      if (!hecho(b)) parte(b, strip(b.textContent));
    }
  });
  const menuMonta = () => {
    const g = document.querySelector('.pgrid');
    if (!g) return;
    for (const id in MENU) {
      const b = $(id);
      if (!b || b.dataset.u2) continue;
      b.dataset.u2 = '1';
      const k = MENU[id][1];
      parte(b, k ? strip(_t(k)) : strip(b.textContent));
      vigila.observe(b, { childList: true });
    }
    if (!g.querySelector('.ugh')) {
      const h1 = document.createElement('p'),
        h2 = document.createElement('p'),
        sep = document.createElement('span');
      h1.className = 'ugh';
      h2.className = 'ugh u2';
      h1.dataset.es = 'Opciones';
      h2.dataset.es = 'Partida';
      sep.className = 'usep';
      sep.setAttribute('aria-hidden', 'true');
      g.append(h1, h2, sep);
    }
    for (const h of g.querySelectorAll('.ugh')) h.textContent = _t(h.dataset.es);
  };
  menuMonta();
  /* los botones de copia los añade pulido.js: puede que lleguen después */
  setTimeout(menuMonta, 0);

  /* ═══ confirmación de reiniciar, dentro del juego ═══ */
  let conf = null;
  const confAbre = () => {
    if (!conf) {
      conf = document.createElement('div');
      conf.id = 'uconf';
      conf.className = 'modal';
      conf.hidden = true;
      conf.setAttribute('role', 'alertdialog');
      conf.setAttribute('aria-modal', 'true');
      conf.setAttribute('aria-labelledby', 'uconft');
      conf.innerHTML =
        '<div class="p paper"><h2 id="uconft"></h2><p id="uconfp"></p><div class="ub"><button class="ubtn" id="uconfno"></button><button class="ubtn danger" id="uconfsi"></button></div></div>';
      $('stage').appendChild(conf);
      conf.addEventListener('click', (e) => {
        if (e.target === conf) confCierra();
      });
      $('uconfno').addEventListener('click', confCierra);
      $('uconfsi').addEventListener('click', () => {
        confCierra();
        const r = $('rst');
        if (!r) return;
        r.dataset.uok = '1';
        r.dataset.ok = '1'; /* ui_fix.js deja pasar el clic sin su doble toque */
        r.click();
        delete r.dataset.uok;
      });
    }
    $('uconft').textContent = _t('¿Reiniciar la partida?');
    $('uconfp').textContent = _t('Se borrará el progreso de esta partida: sellos, mochila y cuaderno. No se puede deshacer.');
    $('uconfno').textContent = _t('Cancelar');
    $('uconfsi').textContent = _t('Sí, reiniciar');
    conf.hidden = false;
    setTimeout(() => $('uconfno').focus(), 30);
  };
  function confCierra() {
    if (conf) conf.hidden = true;
  }
  {
    const g = document.querySelector('.pgrid');
    if (g)
      g.addEventListener(
        'click',
        (e) => {
          const r = e.target.closest && e.target.closest('#rst');
          if (!r || r.dataset.uok === '1') return;
          e.stopPropagation();
          e.preventDefault();
          if (typeof Sound !== 'undefined') Sound.sfx('blocked');
          confAbre();
        },
        true,
      );
    addEventListener(
      'keydown',
      (e) => {
        if (!conf || conf.hidden) return;
        if (e.key === 'Escape') {
          e.stopImmediatePropagation();
          e.preventDefault();
          confCierra();
        } else if (e.key === 'Tab') {
          const a = $('uconfno'),
            b = $('uconfsi');
          if (e.shiftKey && document.activeElement === a) {
            e.preventDefault();
            b.focus();
          } else if (!e.shiftKey && document.activeElement === b) {
            e.preventDefault();
            a.focus();
          }
        } else if (!['Enter', ' '].includes(e.key)) e.stopImmediatePropagation();
      },
      true,
    );
  }

  /* ═══ cuaderno vacío: ilustración, título y qué hacer ═══ */
  const VACIO = { bpages: 'Aún no hay páginas', benc: 'Sin encargos todavía' };
  const vacio = () => {
    for (const p of document.querySelectorAll('#book p.empty')) {
      if (p.parentNode.classList.contains('uempty')) continue;
      const w = document.createElement('div'),
        i = document.createElement('i'),
        h = document.createElement('h4'),
        box = p.parentNode;
      w.className = 'uempty';
      h.dataset.es = VACIO[box.id] || 'Nada por aquí todavía';
      h.textContent = _t(h.dataset.es);
      p.replaceWith(w);
      w.append(i, h, p);
    }
  };
  if (typeof bookTab === 'function') {
    const bt = bookTab;
    bookTab = function (t) {
      const r = bt.apply(this, arguments);
      try {
        vacio();
      } catch (e) {}
      return r;
    };
  }

  /* ═══ creador: lo que se desplaza, aparte del pie ═══ */
  {
    const p = document.querySelector('#creator .p'),
      body = p && p.querySelector('.crbody'),
      foot = p && p.querySelector('.crbtns');
    if (p && body && foot) {
      const sc = document.createElement('div');
      sc.className = 'crscroll';
      p.insertBefore(sc, body);
      const dif = $('difbox');
      sc.append(body);
      if (dif) sc.append(dif);
      if (typeof openCreator === 'function') {
        const oc = openCreator;
        openCreator = function () {
          const r = oc.apply(this, arguments);
          sc.scrollTop = 0;
          return r;
        };
      }
    }
  }

  /* ═══ idioma: lo que pinta este módulo ═══ */
  if (typeof setLang === 'function') {
    const sl = setLang;
    setLang = function () {
      const r = sl.apply(this, arguments);
      try {
        tileL();
        for (const id in MENU) {
          const b = $(id),
            k = MENU[id][1];
          if (b && k && hecho(b)) b.lastChild.textContent = strip(_t(k));
        }
        menuMonta();
        for (const h of document.querySelectorAll('#book .uempty h4')) h.textContent = _t(h.dataset.es);
      } catch (e) {}
      return r;
    };
  }

  /* ═══ carteles de puerta: más grandes en PC y nunca cortados por el borde ═══ */
  if (STYLE && typeof STYLE.doorLabel === 'function') {
    const dl = STYLE.doorLabel;
    STYLE.doorLabel = function (p, d, tg, a, open) {
      if (!p || !p.g || !(p.s > 0) || !d || !tg) return dl.apply(this, arguments);
      let q = null;
      try {
        q = d.back ? p.W(wallPt(d.e, 0.5, 112)) : p.P(d.mid[0] - d.n[0] * (TH + 80), d.mid[1] - d.n[1] * (TH + 80), 66);
      } catch (e) {}
      if (!q || !Number.isFinite(q[0]) || !Number.isFinite(q[1])) return dl.apply(this, arguments);
      const g = p.g,
        dpr = window.DPR || 1,
        ex = typeof EXPLORA !== 'undefined' && EXPLORA.e > 0,
        k = ex || COARSE ? 1 : 1.15;
      g.save();
      g.font = `600 ${Math.round(13 * p.s)}px Fraunces, Georgia, serif`;
      let hw = 0;
      try {
        hw = (g.measureText(_t((open ? 'Hacia ' : 'Cerrado · ') + SEASON[tg.id].name)).width / 2 + 24 * p.s) * k;
      } catch (e) {}
      g.restore();
      const W = g.canvas.width,
        m = 10 * dpr;
      let dx = 0;
      if (hw * 2 < W - 2 * m) {
        if (q[0] - hw < m) dx = m - (q[0] - hw);
        else if (q[0] + hw > W - m) dx = W - m - (q[0] + hw);
      }
      if (k === 1 && !dx) return dl.apply(this, arguments);
      g.save();
      g.translate(q[0] + dx, q[1]);
      g.scale(k, k);
      g.translate(-q[0], -q[1]);
      try {
        return dl.apply(this, arguments);
      } finally {
        g.restore();
      }
    };
  }

  /* ═══ 5 · que nada se pise ═══ */
  {
    const vis = (e) =>
      !!(
        e &&
        !e.hidden &&
        e.offsetParent !== null &&
        getComputedStyle(e).display !== 'none' &&
        getComputedStyle(e).visibility !== 'hidden'
      );
    const cruza = (a, b, m = 6) => a.left < b.right + m && b.left < a.right + m && a.top < b.bottom + m && b.top < a.bottom + m;
    const vars = {};
    const pon = (k, v) => {
      v = Math.round(v) + 'px';
      if (vars[k] !== v) {
        vars[k] = v;
        document.body.style.setProperty(k, v);
      }
    };
    let tutArriba = false;
    const lay = () => {
      tileL();
      const mapa = typeof mapMode !== 'undefined' && mapMode && !inTitle;
      document.body.classList.toggle('umapa', !!mapa);
      if (inTitle) return;
      const S = $('stage').getBoundingClientRect(),
        narrow = innerWidth <= 760,
        tag = document.querySelector('.tag'),
        goal = $('goal'),
        note = $('note'),
        tut = document.querySelector('.tut'),
        talkB = $('talk'),
        narr = $('narr'),
        ctrl = document.querySelector('.ctrl');
      const tagB = vis(tag) ? tag.getBoundingClientRect().bottom - S.top : 14;
      pon('--u-goal-top', tagB + 10);
      pon('--u-narr-top', tagB + 8);
      const goalB = vis(goal) ? goal.getBoundingClientRect().bottom - S.top : tagB;
      const noteR = vis(note) ? note.getBoundingClientRect() : null;
      document.body.classList.toggle('unarr', !!(narr && narr.classList.contains('on')));
      /* el tutorial: abajo (pulido.js) salvo que tape el rótulo de hablar; en el móvil, arriba salvo que lo tape allí */
      if (tut && vis(tut)) {
        const h = tut.getBoundingClientRect().height,
          w = tut.getBoundingClientRect().width,
          l = S.left + (S.width - w) / 2,
          bot = parseFloat(tut.style.bottom) || 150,
          abajo = { left: l, right: l + w, top: S.bottom - bot - h, bottom: S.bottom - bot };
        let topY = narrow ? Math.max(goalB, tagB) + 8 : 14;
        if (noteR && noteR.bottom - S.top + 8 > topY && noteR.top - S.top < topY + h) topY = noteR.bottom - S.top + 8;
        if (!narrow && S.width < 1100) topY = Math.max(topY, goalB + 8);
        const arriba = { left: l, right: l + w, top: S.top + topY, bottom: S.top + topY + h },
          tR = vis(talkB) ? talkB.getBoundingClientRect() : null;
        let up = narrow;
        if (tR) {
          if (narrow && cruza(arriba, tR)) up = false;
          else if (!narrow && cruza(abajo, tR)) up = true;
        }
        if (up !== tutArriba) {
          tutArriba = up;
          tut.classList.toggle('utop', up);
        }
        pon('--u-tut-top', topY);
      } else if (tutArriba && tut) {
        tutArriba = false;
        tut.classList.remove('utop');
      }
      /* los logros: en PC bajo los botones de esquina; en el móvil arriba, bajo el objetivo y el tutorial */
      let aT;
      if (!narrow && vis(ctrl)) aT = ctrl.getBoundingClientRect().bottom - S.top + 10;
      else {
        aT = goalB + 8;
        if (tutArriba && vis(tut)) aT = Math.max(aT, tut.getBoundingClientRect().bottom - S.top + 8);
        if (noteR && noteR.top - S.top < S.height / 2) aT = Math.max(aT, noteR.bottom - S.top + 8);
        if (mapa && narr && narr.classList.contains('on')) aT = Math.max(aT, narr.getBoundingClientRect().bottom - S.top + 8);
      }
      pon('--u-achv-top', aT);
    };
    /* en el mapa, los rótulos de ui2.js y mapa2.js no se salen por los lados */
    if (window.R3DX)
      R3DX.push(() => {
        if (typeof mapMode === 'undefined' || !mapMode || inTitle) return;
        const W = innerWidth;
        for (const e of document.querySelectorAll('.aqui:not([hidden]),#barrios .barrio')) {
          const R = e.getBoundingClientRect();
          if (!R.width) continue;
          const dx = R.left < 8 ? 8 - R.left : R.right > W - 8 ? W - 8 - R.right : 0;
          if (dx) e.style.left = parseFloat(e.style.left) + dx + 'px';
        }
      });
    const loop = () => {
      try {
        lay();
      } catch (e) {}
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  if (typeof i18nDom === 'function' && LANG !== 'es') {
    try {
      menuMonta();
      tileL();
    } catch (e) {}
  }
}
