/* ══════════ VISTA INMERSIVA · AJUSTES DE SONIDO Y TEXTO · COPIA DE SEGURIDAD ══════════
   Al entrar en un cuarto la cámara se acerca hasta que el cuarto llena la pantalla;
   el resto del panal queda en una penumbra cálida. Al acercarte a una puerta abierta la
   cámara respira hacia atrás para que veas adónde da. El mapa sigue a un botón. */
const OPT=(()=>{let o={};try{o=JSON.parse(localStorage.getItem('colmena-opciones')||'{}')||{}}catch(e){}
  return Object.assign({imm:true,vm:1,va:1,vf:1,txt:0},o)})();
function steamSync(){if(!(window.STEAM&&STEAM.saveFile))return;clearTimeout(steamSync.t);steamSync.t=setTimeout(()=>{const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('colmena'))o[k]=localStorage.getItem(k)}}catch(e){}STEAM.saveFile(o)},500)}
function optSave(){try{localStorage.setItem('colmena-opciones',JSON.stringify(OPT))}catch(e){}steamSync()}

/* acercamiento del modo inmersivo; game.js lo pide en layout() */
window.IMMZ=function(portrait){if(!OPT.imm)return 0;
  const w=portrait?VW*1.62/(704*S):VW*.98/(704*S),h=portrait?(VH-150)*.95/(622*S):(VH-20)/(600*S);
  return clamp(Math.min(w,h),1,ZMAX)};
function immOn(){return OPT.imm&&ZF>ZFN*1.03}
function setImm(v){OPT.imm=!!v;optSave();const wasMap=mapMode;layout();if(!wasMap&&!inTitle)zoomTo(ZF,true)}

/* respiro: cerca de una puerta abierta, la cámara se aleja hasta la vista de panal */
let immDoorK=1,immCell=null,immArm=false;
function immTick(dt){
  if(!immOn()||mapMode||inTitle||talking||crossing||Zt!==null||gest||pinch){immDoorK=1;return}
  let dmin=1e9;for(const d of CELLS[cur].doors){if(!PUZ.open(cur,d.to))continue;const dd=Math.hypot(Pl.x-d.trig[0],(Pl.y-d.trig[1])*1.1);if(dd<dmin)dmin=dd}
  /* recién llegado por una puerta: primero la cámara se acerca; el respiro vuelve al alejarte de ella */
  if(immCell!==cur){immCell=cur;immArm=dmin>175}if(!immArm){if(dmin>175)immArm=true;else{immDoorK=1;return}}
  const k0=ZFN/ZF,u=clamp((dmin-55)/120,0,1),tgt=lerp(k0,1,u*u*(3-2*u));
  immDoorK=tgt;if(tgt<.995&&(!ZKhold||ZKhold.imm))ZKhold={v:tgt,until:T+.25,imm:1}}

/* penumbra cálida alrededor del cuarto enfocado */
function immVignette(s){if(!OPT.imm||inTitle||crossing)return;
  const a=clamp((Z-1)/Math.max(.001,ZFN-1),0,1)*FOCUS[cur];if(a<.02)return;
  const W=cv.width,H=cv.height,ox=camX+CW[cur][0]*s,oy=oyOf(cur,s)-60*s,rx=372*s,ry=268*s;
  const q=rx/ry,far=Math.max(Math.hypot(Math.max(ox,W-ox),Math.max(oy,H-oy)*q)/rx,1.6);
  ctx.save();ctx.translate(ox,oy);ctx.scale(1,1/q);
  const g=ctx.createRadialGradient(0,0,rx*.96,0,0,rx*far);
  g.addColorStop(0,'rgba(70,38,14,0)');g.addColorStop(Math.min(.5,.5/far),`rgba(70,38,14,${.4*a})`);g.addColorStop(1,`rgba(40,20,6,${.74*a})`);
  ctx.fillStyle=g;ctx.fillRect(-ox,-oy*q,W,H*q);ctx.restore()}
{const ds0=drawShade;drawShade=function(s,dt){immVignette(s);return ds0(s,dt)}}
{const qf0=qFrame;qFrame=function(s){const dt=Math.min(.1,Math.max(0,T-(qFrame.l||T)));qFrame.l=T;immTick(dt);volTick();return qf0(s)}}

/* ── volúmenes separados: música, ambiente y efectos ── */
const VOLN={amb:{},mus:{},sfx:null,done:false};
function volTick(){if(VOLN.done||!Sound.started())return;const d=Sound._dbg();if(!d.ac||!d.sfxB)return;
  try{for(const id of ORDER){if(!d.bedB[id]||!d.buses[id])continue;
      const ga=d.ac.createGain(),gm=d.ac.createGain();d.bedB[id].disconnect();d.bedB[id].connect(ga);ga.connect(d.buses[id]);
      d.musB[id].disconnect();d.musB[id].connect(gm);gm.connect(d.buses[id]);VOLN.amb[id]=ga;VOLN.mus[id]=gm}
    const gs=d.ac.createGain();d.sfxB.disconnect();d.sfxB.connect(gs);gs.connect(d.master);VOLN.sfx=gs}catch(e){console.warn(e)}
  VOLN.done=true;volApply(true)}
function volApply(now){if(!VOLN.done)return;const ac=Sound._dbg().ac,t=ac.currentTime,set=(g,v)=>{if(g)now?g.gain.setValueAtTime(v,t):g.gain.setTargetAtTime(v,t,.08)};
  for(const id in VOLN.amb)set(VOLN.amb[id],OPT.va);for(const id in VOLN.mus)set(VOLN.mus[id],OPT.vm);set(VOLN.sfx,OPT.vf)}

/* ── tamaño del texto ── */
function txtApply(){document.body.classList.toggle('tx1',OPT.txt==1);document.body.classList.toggle('tx2',OPT.txt==2)}
txtApply();

/* ── ajustes: enlazar los controles nuevos ── */
{const $e=id=>document.getElementById(id),vm=$e('vmus'),va=$e('vamb'),vf=$e('vsfx'),ts=$e('txts'),im=$e('imm'),fr=$e('fsrow'),fc=$e('fsck');
  const canFS=!!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen)&&!(window.STEAM&&STEAM.isDesktop&&false);
  if(fr&&!canFS)fr.hidden=true;
  const TXL=['Normal','Grande','Muy grande'],relabel=()=>{[...ts.options].forEach((o,i)=>{o.textContent=_t(TXL[i])})};$e('lang').addEventListener('change',()=>setTimeout(relabel,0));
  const sync=()=>{relabel();vm.value=Math.round(OPT.vm*100);va.value=Math.round(OPT.va*100);vf.value=Math.round(OPT.vf*100);ts.value=String(OPT.txt|0);im.checked=!!OPT.imm;if(fc)fc.checked=!!document.fullscreenElement};
  const bind=(el,k)=>el.addEventListener('input',()=>{OPT[k]=el.value/100;volApply();optSave();if(k==='vf')Sound.sfx('ui')});
  bind(vm,'vm');bind(va,'va');bind(vf,'vf');
  ts.addEventListener('change',()=>{OPT.txt=+ts.value;txtApply();optSave()});
  im.addEventListener('change',()=>setImm(im.checked));
  if(fc){fc.addEventListener('change',()=>{if(!!document.fullscreenElement!==fc.checked)toggleFS()});document.addEventListener('fullscreenchange',()=>{fc.checked=!!document.fullscreenElement})}
  for(const b of ['bset','bset2'])$e(b).addEventListener('click',sync);sync()}

/* partida recuperada de la copia de seguridad */
setTimeout(()=>{if(saveRecovered)note('Tu partida estaba dañada; se recuperó la copia de seguridad.')},1500);

/* ══ versión móvil: app nativa (Capacitor) e instalada como PWA ══ */
const NATIVE=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
const STANDALONE=NATIVE||matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
if(STANDALONE){document.body.classList.add('standalone');for(const id of['bfs','bfs2','fsrow']){const e=document.getElementById(id);if(e)e.hidden=true}}
/* pantalla encendida mientras juegas (Wake Lock del navegador; en la app, el plugin) */
let wakeL=null;async function keepAwake(){try{const P=window.Capacitor&&Capacitor.Plugins;if(P&&P.KeepAwake){await P.KeepAwake.keepAwake();return}if(navigator.wakeLock&&!wakeL&&document.visibilityState==='visible'){wakeL=await navigator.wakeLock.request('screen');wakeL.addEventListener('release',()=>{wakeL=null})}}catch(e){}}
if(COARSE){addEventListener('pointerdown',keepAwake,{once:true});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')keepAwake()})}
/* al salir de la app: guardar y callar; al volver: sonar de nuevo */
function appPause(){save();steamSync();try{const d=Sound._dbg();if(d.ac&&d.ac.state==='running')d.ac.suspend()}catch(e){}}
function appResume(){try{const d=Sound._dbg();if(d.ac&&Sound.on)d.ac.resume()}catch(e){}keepAwake()}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')appPause();else appResume()});
if(NATIVE){const P=Capacitor.Plugins||{};document.body.classList.add('native');
  try{P.StatusBar&&P.StatusBar.hide()}catch(e){}
  if(P.App){let backT=0;
    P.App.addListener('backButton',()=>{if(typeof M!=='undefined'&&M.on){if(!pickEl.hidden)pickEl.hidden=true;else exitMadr();return}const ui=uiLayer();
      if(talking&&!(DLG&&DLG.forced)){closeTalk();return}
      if(ui&&ui.id!=='title'){uiBack(ui);return}
      if(!inTitle&&mapMode){toggleMap();return}
      if(!inTitle){setMenu(true);return}
      const now=performance.now();if(now-backT<2000){appPause();P.App.exitApp();return}backT=now;note('Pulsa atrás otra vez para salir')});
    P.App.addListener('pause',appPause);P.App.addListener('resume',appResume)}}
