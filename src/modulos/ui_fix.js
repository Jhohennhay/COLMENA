/* ══════════ INTERFAZ: REVISIÓN DE USABILIDAD Y ACCESIBILIDAD ══════════
   1 · «Reiniciar» pide confirmación y queda apartado.
   2 · Una sola instrucción a la vez (el tutorial manda; la leyenda de pisos no lo tapa en el móvil).
   3 · El objetivo, más visible: no se desvanece, late al cambiar y tocarlo te lleva al sitio.
   4 · Creador en el móvil: la fragilidad de la colmena se ve sin desplazarse.
   Accesibilidad: zonas táctiles de 44 px, foco dentro de las ventanas, contraste y nombres.
   Diseño: menú con Cuaderno y Mapa destacados, cuaderno con avisos de novedades y letra mínima de 14 px. */
(()=>{
const css=document.createElement('style');css.textContent=`
/* 1 · reiniciar, apartado y en dos pasos */
.pgrid #rst{grid-column:1/-1;margin-top:6px;justify-content:center;color:#8A3A2A;background:transparent;box-shadow:inset 0 0 0 1.5px #E2B9A8}
.pgrid #rst.sure{background:#A5452A;color:#FFF4E6;box-shadow:0 2px 0 #6E2A18;font-weight:600}
/* 2 · una instrucción a la vez */
body.tuton .hint{display:none!important}
@media (max-width:620px){.pisos{top:calc(124px + env(safe-area-inset-top,0px))!important;transform:none!important;left:10px!important}.pisos .p{font-size:12.5px}}
/* 3 · objetivo visible */
.goal{font-size:16px!important;padding:9px 16px 10px 14px!important;border-left-width:6px!important;max-width:min(420px,70vw)!important;pointer-events:auto!important;cursor:pointer}
.goal::before{font-size:11.5px!important;color:#8A4E1E!important}
.goal.fade{opacity:1!important;transform:none!important}
.goal[data-go]::after{content:'  ➜ ' attr(data-go);display:inline-block;margin-left:6px;font-size:13px;font-weight:600;color:#8A4E1E;white-space:nowrap}
.goal.pop{animation:goalpop 1.4s ease!important}
@keyframes goalpop{0%{transform:translateX(-8px);background:#FFE7A6;box-shadow:0 0 0 0 rgba(232,169,58,.8)}35%{box-shadow:0 0 0 10px rgba(232,169,58,0)}100%{transform:none}}
.goal:focus-visible{outline:3px solid #4A3222;outline-offset:2px}
@media (max-width:520px){.goal{font-size:15px!important;max-width:calc(100% - 92px)!important}}
/* 4 · creador en el móvil */
@media (max-width:600px){.creator .p{display:flex;flex-direction:column;width:calc(100vw - 24px)!important;max-width:calc(100vw - 24px)!important;box-sizing:border-box}.creator .p>*{min-width:0;max-width:100%}.crbody,#crrows,.crrow,.cropts{min-width:0}.creator .p>h2{order:-3}.creator .difbox{order:-2;margin:2px 0 10px}.creator .crbody{order:-1}
  #crprev{height:112px!important}.difbox{max-width:100%;min-width:0}.difs{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important}.difs button{padding:8px 6px!important;text-align:center!important}
  .difs button small{display:none!important}.difs button.on small{display:none!important}.difnote{display:block;font-size:14px;line-height:1.35;margin-top:6px;color:#6A4426}}
@media (min-width:601px){.difnote{display:none}}
/* accesibilidad · zonas táctiles de 44 px */
#book .btabs button{min-height:44px!important;padding-left:12px!important;padding-right:12px!important;font-size:14px!important}
#book .btabs{overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap!important;width:0;min-width:100%}#book .p{max-width:calc(100vw - 16px);box-sizing:border-box}#book .mbody{min-width:0}
.tut button,.tut .p button{min-height:44px!important;min-width:64px;font-size:14px!important}.difs button{min-height:44px}#talk,.talk button,button.talk{min-height:44px!important}
.slots button{min-width:44px!important;min-height:44px!important}
.langs button{min-height:44px!important;padding-left:10px!important;padding-right:10px!important}
.cropts button{min-height:44px!important;font-size:15px!important}.cropts button.sw{width:44px!important;height:44px!important}
#settings input[type=checkbox]{width:26px;height:26px}
#settings input[type=range]{height:44px;min-width:150px}
#settings select{min-height:44px}
/* accesibilidad · contraste */
.mjour{opacity:1!important;color:#6A4426!important}
.bach .no{opacity:1!important}.bach .no b{color:#6A5646}.bach .no small{color:#6E5A48!important}.bach .no .hx::after{content:' 🔒';font-size:13px}
/* diseño · menú: Cuaderno y Mapa primero y más grandes */
.pgrid #bbook,.pgrid #map{min-height:56px;font-size:16px;font-weight:600;background:#F6D58A;box-shadow:0 2px 0 #C9963E}
.pgrid button{font-size:14.5px}.pgrid .psep{display:none}#bbook{order:1}#map{order:2}#bset2{order:3}#snd{order:4}#bchar{order:5}#bphoto{order:6}#bfs2{order:7}.pgrid #btitle{order:8;grid-column:1/-1;margin-top:8px;justify-content:center}.pgrid #rst{order:9}
/* diseño · cuaderno: novedades y letra mínima */
#book .btabs button.new::after{content:'';display:inline-block;width:8px;height:8px;margin-left:6px;border-radius:50%;background:#C8452F;vertical-align:middle}
#book .mbody small,#book .mbody .bglyph,#book .enc small,#bach small,#bnb small,#bclue small{font-size:14px!important;line-height:1.35}
.tfoot{font-size:14px!important;line-height:1.4;text-wrap:balance}
`;document.head.appendChild(css);

/* ── 1 · Reiniciar en dos pasos ── */
{const r=document.getElementById('rst');if(r){const lbl=r.textContent;let t=null;
  r.addEventListener('click',e=>{if(r.dataset.ok==='1'){r.dataset.ok='';return}e.stopImmediatePropagation();e.preventDefault();
    if(!r.classList.contains('sure')){r.classList.add('sure');r.textContent=_t('¿Borrar esta partida? Toca otra vez');Sound.sfx('blocked');clearTimeout(t);t=setTimeout(reset,4000)}
    else{reset();r.dataset.ok='1';r.click()}},true);
  function reset(){r.classList.remove('sure');r.textContent=_t(lbl.trim())}
  const sm=setMenu;setMenu=function(o){if(!o)reset();return sm(o)}}}

/* ── 2 · el tutorial manda ── */
setInterval(()=>{const tut=document.querySelector('.tut');document.body.classList.toggle('tuton',!!(tut&&!tut.hidden))},400);

/* ── 3 · el objetivo: siempre visible, late al cambiar y te lleva ── */
{const g=document.getElementById('goal');if(g){g.setAttribute('role','button');g.tabIndex=0;g.setAttribute('aria-live','polite');
  const target=()=>{try{PUZ.goal();return QGOAL.cell||null}catch(e){return null}};
  const sync=()=>{const c=target();const can=c&&c!==cur&&typeof fastOK==='function'&&fastOK(c);if(can){const n=_t((SEASON[c]&&SEASON[c].name)||c);if(g.dataset.go!==_t('Ir a')+' '+n)g.dataset.go=_t('Ir a')+' '+n}else if(g.dataset.go)delete g.dataset.go;
    g.setAttribute('aria-label',_t('Objetivo')+': '+g.textContent+(can?' · '+g.dataset.go:''))};
  setInterval(sync,700);
  const go=()=>{const c=target();if(c&&c!==cur&&typeof fastOK==='function'&&fastOK(c)){fastTravel(c)}else if(typeof hintPress==='function')hintPress();else note(PUZ.goal())};
  g.addEventListener('click',go);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
  const sg=showGoal;showGoal=function(){sg();try{Sound.sfx('card')}catch(e){}}}}

/* ── 4 · fragilidad en el móvil: la descripción de la opción elegida, debajo ── */
{const box=document.getElementById('difbox');if(box){const n=document.createElement('p');n.className='difnote';box.appendChild(n);
  const up=()=>{const b=box.querySelector('button.on small');n.textContent=b?b.textContent:''};box.addEventListener('click',()=>setTimeout(up,0));setInterval(()=>{if(!document.getElementById('creator').hidden)up()},800);up()}}

/* ── accesibilidad: el foco no se escapa de las ventanas ── */
addEventListener('keydown',e=>{if(e.key!=='Tab')return;const dlg=[...document.querySelectorAll('[role=dialog][aria-modal=true],#panel')].find(d=>!d.hidden&&d.offsetParent!==null);if(!dlg)return;
  const f=[...dlg.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&x.offsetParent!==null);if(!f.length)return;
  const a=f[0],z=f[f.length-1];if(!dlg.contains(document.activeElement)){e.preventDefault();a.focus();return}
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}},true);
/* el menú se anuncia como ventana, recibe el foco y se cierra con Esc */
{const p=document.getElementById('panel');if(p){p.setAttribute('role','dialog');p.setAttribute('aria-modal','true');p.setAttribute('aria-label',_t('Menú'));
  const sm=setMenu;setMenu=function(o){const r=sm(o);if(o)setTimeout(()=>{const b=p.querySelector('.pgrid button');if(b)b.focus()},30);else{const m=document.getElementById('menu');if(m&&p.contains(document.activeElement))m.focus()}return r};
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!p.hidden){setMenu(false)}})}}
/* la zona con scroll del cuaderno se puede recorrer con el teclado */
for(const el of document.querySelectorAll('#book .mbody,#settings .mbody'))if(!el.hasAttribute('tabindex'))el.tabIndex=0;

/* ── diseño: avisos de novedades en las pestañas del cuaderno ── */
const NEWK={pages:()=>Object.keys(QF().pages||{}).length,clues:()=>Object.keys(QF().heard||{}).length,ach:()=>{try{return Object.keys(QF().ach||{}).length}catch(e){return 0}},gal:()=>{try{return ORDER.filter(id=>frOf(id)>=3).length}catch(e){return 0}}};
function markTabs(){const S=PROG.F.tabSeen||(PROG.F.tabSeen={});for(const [k,f] of Object.entries(NEWK)){const b=BOOK.querySelector(`.btabs button[data-tab="${k}"]`);if(!b)continue;const n=f();b.classList.toggle('new',n>(S[k]||0))}}
{const bt=bookTab;bookTab=function(t){const r=bt(t);try{const S=PROG.F.tabSeen||(PROG.F.tabSeen={});if(NEWK[t])S[t]=NEWK[t]();markTabs()}catch(e){}return r}}
{const ob=openBook;openBook=function(...a){const r=ob(...a);try{markTabs()}catch(e){}return r}}

I18N([["¿Borrar esta partida? Toca otra vez","Delete this save? Tap again","Удалить это сохранение? Нажми ещё раз","删除这个存档？再点一次"],
["Despierta a la guardiana de la colmena","Wake the guardian of the hive","Разбуди хранительницу улья","唤醒蜂巢的守护者"],
["Ir a","Go to","Идти в","前往"],
["Todavía no se conocen.","You haven't met yet.","Вы ещё не знакомы.","你们还不认识。"]]);
})();
