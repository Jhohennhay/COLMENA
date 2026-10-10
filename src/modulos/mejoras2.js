/* ══════════ MEJORAS 2 · traslado, primeros minutos, encargos y más ══════════
   Traslado
   · A · Dentro del racimo: la celda vecina gira y se acopla al entrar (medio segundo).
   · B · Entre racimos: los puentes se cruzan el doble de rápido, con la cámara cerca; «⏩ Saltar» los acaba al momento.
   · C · Viaje rápido y tren: la pantalla pasa como una página.
   Juego
   1 · Primeros minutos guiados (caminar, hablar, mochila, farol).
   2 · Pestaña «Encargos» en el cuaderno: quién pidió qué, y botón para ir.
   3 · Celebración al encender un sello o terminar un encargo.
   4 · Los vecinos de papel se mueven al hablar (en render3d).
   5 · Móvil: solo se preparan los cuartos cercanos (en render3d).
   6 · Tres partidas guardadas y «⏭ Saltar» en diálogos ya leídos. */

/* ── B · velocidad de los cruces y «Saltar» ── */
const TRAV={skip:null};
window.TRAVK=cr=>{if(TRAV.skip===cr)return 7;if(cr.trip)return 1;return cr.long||cr.comp?2.1:1.5};
let skipEl=null;
function skipUI(){if(skipEl)return skipEl;skipEl=document.createElement('button');skipEl.id='saltar';skipEl.className='saltar';skipEl.textContent='⏩ '+_t('Saltar');skipEl.hidden=true;
  skipEl.addEventListener('click',()=>{if(crossing){TRAV.skip=crossing;Sound.sfx('pick',.3)}skipEl.hidden=true});document.getElementById('stage').appendChild(skipEl);
  const st=document.createElement('style');st.textContent='.saltar{position:absolute;right:16px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:4;font:600 15px Fraunces,Georgia,serif;padding:10px 16px;min-height:44px;border:0;border-radius:22px;background:rgba(58,36,18,.82);color:#FFF4D6;cursor:pointer;box-shadow:0 3px 8px rgba(40,20,5,.35)}.saltar:focus-visible{outline:2px solid #FFF4D6;outline-offset:2px}'+
    '.qfade.page{background:linear-gradient(90deg,#D9C79F 0%,#F6EBD0 18%,#FBF4E3 60%,#EADBB8 100%);opacity:1;transform:perspective(1400px) rotateY(-92deg);transform-origin:left center;transition:transform .42s cubic-bezier(.5,0,.3,1);box-shadow:inset -30px 0 60px rgba(120,80,40,.25)}.qfade.page.on{transform:perspective(1400px) rotateY(0deg)}'+
    '@media (prefers-reduced-motion:reduce){.qfade.page{transition:none}}';document.head.appendChild(st);return skipEl}
function skipTick(){const b=skipUI(),cr=crossing,show=!!(cr&&(cr.long||cr.comp)&&!cr.hold&&!cr.trip&&TRAV.skip!==cr&&!inTitle&&cr.t>.4&&cr.t<(cr.dur||9)-.8);if(b.hidden===show)b.hidden=!show;if(!cr)TRAV.skip=null}
addEventListener('keydown',e=>{if(crossing&&(e.key===' '||e.key==='Enter')&&skipEl&&!skipEl.hidden){TRAV.skip=crossing;skipEl.hidden=true;e.preventDefault()}});
/* ── C · la página que pasa ── */
fadeEl.classList.add('page');

/* ── A · la celda vecina gira y se acopla ── */
const GIRO={};
{const c0=cross;cross=function(d){const was=crossing;c0(d);if(crossing&&crossing!==was&&!((d.span||1)>1)){Sound.sfx('door',.5)}}}
if(window.R3DX)R3DX.push(()=>{for(const id in GIRO){const r=R3D.rooms[id],g=GIRO[id],u=(T-g.t0)/.6;if(!r){if(u>2)delete GIRO[id];continue}
    if(u>=1||STILL){r.grp.rotation.y=0;delete GIRO[id];continue}const e=1-Math.pow(1-u,3),ov=Math.sin(u*Math.PI)*.08;r.grp.rotation.y=g.s*((1-e)*.42-ov*(u>.55?1:0))}});

/* ── 5 · móvil: cuartos cercanos ── */
window.NEARROOM=id=>{const a=POS[cur],b=POS[id];if(!a||!b)return true;const dq=a[0]-b[0],dr=a[1]-b[1];return(Math.abs(dq)+Math.abs(dr)+Math.abs(dq+dr))/2<=4};

/* ── 1 · primeros minutos guiados ── */
let tutEl=null;
const TUT=[
  {t:'Toca el suelo (o usa WASD / flechas) para caminar.',done:()=>Math.hypot(Pl.x-TUT.x0,Pl.y-TUT.y0)>70},
  {t:'Acércate a Brote y tócala para hablar (o pulsa E).',done:()=>!!(PROG.F.met&&PROG.F.met.pri)||talking},
  {t:'Lo que te den aparece abajo, en tu mochila. Caben tres cosas.',wait:5},
  {t:'¿Perdido? Toca el farol de arriba: te da una pista, y late cerca de los secretos.',wait:6},
  {t:'Abre el mapa (⤢) para ver la colmena y viajar a los cuartos que ya despertaste.',wait:6}];
function tutTick(){const F=PROG.F;if(FREE||inTitle||F.tut>=TUT.length||(typeof DEMO!=='undefined'&&DEMO&&false))return hideTut();
  if(!document.getElementById('creator').hidden||!BOOK.hidden){return hideTut()}if(talking&&F.tut!==1){return hideTut()}if(typeof mapMode!=='undefined'&&mapMode&&F.tut!==4)return hideTut();if(talking){F.tut=2;save();return hideTut()}
  if(F.tut==null&&F.met&&Object.keys(F.met).length>2){F.tut=TUT.length;return hideTut()}F.tut=F.tut||0;const st=TUT[F.tut];if(TUT.x0==null){TUT.x0=Pl.x;TUT.y0=Pl.y;TUT.t0=T}
  if(!tutEl){tutEl=document.createElement('div');tutEl.className='tut shadow';tutEl.setAttribute('role','status');tutEl.innerHTML='<div class="p paper torn"><span class="tn"></span><p></p><button>'+_t('Omitir')+'</button></div>';document.getElementById('stage').appendChild(tutEl);
    tutEl.querySelector('button').addEventListener('click',()=>{F.tut=TUT.length;save();hideTut()});
    const css=document.createElement('style');css.textContent='.tut{position:absolute;left:50%;bottom:calc(150px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:3;width:min(440px,calc(100% - 28px));animation:tin .5s ease}.tut .p{display:flex;gap:10px;align-items:center;padding:12px 16px}.tut .tn{flex:none;width:28px;height:28px;border-radius:50%;background:var(--honey);color:#3A2412;font-weight:600;display:grid;place-items:center;font-size:14px}.tut p{margin:0;flex:1;font-size:15px;line-height:1.35}.tut button{flex:none;font:inherit;font-size:12.5px;border:0;background:none;color:#8A5A2E;cursor:pointer;text-decoration:underline;min-height:36px}@media (max-width:560px){.tut{bottom:calc(150px + env(safe-area-inset-bottom,0px))}.tut p{font-size:14px}}';document.head.appendChild(css)}
  const k=F.tut+':'+LANG;if(tutEl.dataset.k!==k){tutEl.dataset.k=k;tutEl.querySelector('.tn').textContent=F.tut+1;tutEl.querySelector('p').textContent=_t(st.t);TUT.t0=T}if(tutEl.hidden)tutEl.hidden=false;
  if(st.done?st.done():T-TUT.t0>st.wait){F.tut++;TUT.x0=Pl.x;TUT.y0=Pl.y;save();if(F.tut<TUT.length)Sound.sfx('pick',.2)}}
function hideTut(){if(tutEl&&!tutEl.hidden)tutEl.hidden=true}

/* ── 2 · encargos ── */
{const tabs=BOOK.querySelector('.btabs'),body=BOOK.querySelector('.mbody');if(tabs&&body){const b=document.createElement('button');b.setAttribute('role','tab');b.dataset.tab='enc';b.setAttribute('aria-selected','false');b.textContent=_t('Encargos');tabs.insertBefore(b,tabs.children[1]);
  b.addEventListener('click',()=>bookTab('enc'));const pane=document.createElement('div');pane.dataset.pane='enc';pane.hidden=true;pane.innerHTML='<p class="bglyph" id="benck"></p><div id="benc" class="bnb"></div>';body.insertBefore(pane,body.firstChild);
  const st=document.createElement('style');st.textContent='.enc{display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center;padding:9px 12px;border-radius:8px;background:#F6EEDC;border-left:4px solid #E4A844}.enc.done{border-left-color:#6F8D5E;opacity:.7}.enc b{font-size:15px}.enc small{display:block;font-size:12.5px;color:#7A5232;line-height:1.3}.enc .st{color:#A5452A}.enc button{font:inherit;font-size:13px;padding:6px 10px;min-height:36px;border:0;border-radius:6px;background:var(--honey);color:#3A2412;cursor:pointer}.encgoal{padding:10px 12px;border-radius:8px;background:#4A3222;color:#FFF4D6;margin-bottom:10px;font-size:14.5px}.encgoal small{display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.75}';document.head.appendChild(st)}}
function fillEnc(){const box=document.getElementById('benc');if(!box)return;box.innerHTML='';const F=PROG.F;let n=0,d=0;
  const g=document.createElement('div');g.className='encgoal';const gs=document.createElement('small');gs.textContent=_t('Objetivo');g.appendChild(gs);g.appendChild(document.createTextNode(_t(PUZ.goal())));box.appendChild(g);
  const rows=[];for(const id of ORDER){const met=!!(F.fr&&F.fr[id])||!!(F.met&&F.met[id]);if(!met)continue;let st;try{st=QSTAT(id)}catch(e){continue}if(!st||(!st.ask&&!st.done))continue;rows.push({id,st})}
  rows.sort((a,b)=>(a.st.done?1:0)-(b.st.done?1:0));
  for(const {id,st} of rows){if(st.done)d++;else n++;const r=document.createElement('div');r.className='enc'+(st.done?' done':'');const tx=document.createElement('div'),b=document.createElement('b');b.textContent=_t(NPCN[id]||'')+' · '+_t(SEASON[id].name);const s=document.createElement('small');s.className='st';s.textContent=_t(st.text);tx.append(b,s);r.appendChild(tx);
    if(!st.done&&id!==cur&&typeof fastOK==='function'&&fastOK(id)){const go=document.createElement('button');go.textContent=_t('Ir');go.addEventListener('click',()=>{BOOK.hidden=true;fastTravel(id)});r.appendChild(go)}else r.appendChild(document.createElement('span'));box.appendChild(r)}
  if(!rows.length){const e=document.createElement('p');e.className='empty';e.textContent=_t('Habla con los vecinos: sus encargos aparecerán aquí.');box.appendChild(e)}
  document.getElementById('benck').textContent=_t('Encargos')+` · ${n} `+_t('pendientes')+` · ${d} `+_t('hechos')}
{const bt0=bookTab;bookTab=function(t){bt0(t);if(t==='enc')fillEnc()}}

/* ── 3 · celebración ── */
let CEL=null;const celScore=()=>{const F=PROG.F;let s=Object.keys(F.ok||{}).length*2;for(let k=1;k<=6;k++)if(typeof sealOn==='function'&&sealOn(k))s+=5;return s};
function confetti(){if(STILL)return;const st=document.getElementById('stage'),w=document.createElement('div');w.className='confeti';w.setAttribute('aria-hidden','true');
  for(let i=0;i<34;i++){const c=document.createElement('i');const a=Math.random()*Math.PI*2,v=120+Math.random()*260;c.style.setProperty('--x',Math.cos(a)*v+'px');c.style.setProperty('--y',(Math.sin(a)*v-160)+'px');c.style.setProperty('--r',(Math.random()*720-360)+'deg');c.style.background=['#E4A844','#F4AFA6','#A7BE8B','#FBF4E3','#8DB5AA','#F5CE55'][i%6];c.style.animationDelay=(Math.random()*.12)+'s';w.appendChild(c)}
  st.appendChild(w);setTimeout(()=>w.remove(),1900)}
{const css=document.createElement('style');css.textContent='.confeti{position:absolute;left:50%;top:45%;width:0;height:0;z-index:6;pointer-events:none}.confeti i{position:absolute;width:9px;height:13px;border-radius:2px;animation:conf 1.6s cubic-bezier(.2,.7,.3,1) forwards}@keyframes conf{0%{transform:translate(0,0) rotate(0);opacity:1}70%{opacity:1}100%{transform:translate(var(--x),calc(var(--y) + 260px)) rotate(var(--r));opacity:0}}';document.head.appendChild(css)}
{const sc0=stateChanged;stateChanged=function(){sc0.apply(this,arguments);if(FREE||inTitle)return;const s=celScore();if(CEL!==null&&s>CEL){confetti();buzz([15,40,15]);EMO[cur]={ch:'♥',t0:T+.2}}CEL=s}}

/* ── 6a · tres partidas ── */
const SLOTK='colmena-slot';const slotN=()=>{try{return+localStorage.getItem(SLOTK)||1}catch(e){return 1}};
function setSlot(n){try{localStorage.setItem(SLOTK,n)}catch(e){}SAVEK=CFG.KEY+'-progreso'+(n>1?'-'+n:'');SAVEB=SAVEK+'-bak';PROG.F={};PROG.bag=[];cur='pri';Pl.x=70;Pl.y=170;
  if(hasSave())load();bcont.hidden=!hasSave();try{updHead()}catch(e){}slotsDraw()}
let slotsEl=null;
function slotsDraw(){if(!slotsEl){slotsEl=document.createElement('div');slotsEl.className='slots';slotsEl.setAttribute('role','group');slotsEl.setAttribute('aria-label',_t('Partida'));const tb=document.querySelector('.tbtns');if(!tb)return;tb.parentNode.insertBefore(slotsEl,tb);
    const css=document.createElement('style');css.textContent='.slots{display:flex;gap:6px;justify-content:center;align-items:center;margin:-6px 0 14px;font-size:13px;color:#8A5A2E}.slots button{font:inherit;font-size:13px;min-width:38px;min-height:34px;border:0;border-radius:16px;background:transparent;color:#7A4E2A;cursor:pointer;box-shadow:inset 0 0 0 1.5px #E3C98E}.slots button[aria-pressed="true"]{background:#4A3222;color:#FFF4D6;box-shadow:none}.slots button small{opacity:.7;margin-left:3px}';document.head.appendChild(css)}
  const n=slotN();slotsEl.innerHTML='<span>'+_t('Partida')+'</span>';for(let k=1;k<=3;k++){const b=document.createElement('button');b.setAttribute('aria-pressed',k===n);let has=false;try{has=!!localStorage.getItem(CFG.KEY+'-progreso'+(k>1?'-'+k:''))}catch(e){}b.innerHTML=k+(has?'<small>●</small>':'');b.title=has?_t('Partida guardada'):_t('Vacía');b.addEventListener('click',()=>{if(k!==slotN())setSlot(k)});slotsEl.appendChild(b)}}
slotsDraw();

/* ── 6b · saltar diálogos ya leídos ── */
const READK='colmena-leido';let READ=new Set();try{READ=new Set(JSON.parse(localStorage.getItem(READK)||'[]'))}catch(e){}
const rk=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return h.toString(36)};
let skipD=null;
function dlgSkipUI(){if(skipD)return skipD;skipD=document.createElement('button');skipD.className='dskip';skipD.textContent='⏭ '+_t('Ya leído · saltar');skipD.hidden=true;skipD.addEventListener('click',e=>{e.stopPropagation();closeTalk()});
  const host=document.querySelector('#dlg .p > div:last-child')||document.getElementById('dlg');host.appendChild(skipD);
  const css=document.createElement('style');css.textContent='.dskip{display:block;margin-top:6px;font:inherit;font-size:12.5px;border:0;background:none;color:#8A5A2E;cursor:pointer;text-decoration:underline;padding:4px 0;min-height:30px}';document.head.appendChild(css);return skipD}
{const t0=talk;talk=function(){t0.apply(this,arguments);const b=dlgSkipUI();if(!talking||!DLG||!DLG.lines){b.hidden=true;return}
    const keys=DLG.lines.map(l=>rk(String(l)));const all=keys.every(k=>READ.has(k));b.hidden=!(all&&lineIx===0&&DLG.lines.length>1&&!DLG.forced);
    const k=keys[lineIx];if(k&&!READ.has(k)){READ.add(k);try{localStorage.setItem(READK,JSON.stringify([...READ].slice(-3000)))}catch(e){}}}}

/* ── tictac ── */
{const bt0=beatTick;beatTick=function(){try{skipTick();tutTick()}catch(e){if(!TRAV.err){TRAV.err=1;console.warn('mejoras2',e)}}return bt0()}}
