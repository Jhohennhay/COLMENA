/* ══════════ ACTO III · LA COLMENA DE ABAJO: la historia y los acertijos ══════════
   Se abre al devolver el primer latido al Corazón (rastro.given).
   1 · Andén Vacío: lees el horario («Último tren → AYER») y Silbo te da el billete de ayer.
   2 · Casa de los Ecos: si te quedas quieto, los fantasmas se acercan; cada uno trae una carta
       con la letra de Amaranta (a Estela, a Nube, a Vela: por eso cuentan cosas distintas). Eco confiesa.
   3 · Objetos Perdidos: de tres objetos, coge el que es del apicultor (el reloj parado).
   4 · Celda del Apicultor: dale cuerda al reloj; Alvéolo despierta y cuenta lo de los guardianes.
   5 · El Reverso: tocas el espejo y Eco vuelve con Amaranta. Epílogo.                         */
const ABF=()=>{const F=PROG.F;return F.ab||(F.ab={})};
const abOpen=()=>FREE||(typeof sealCount==='function'&&sealCount()>=3);
const abGiven=()=>FREE||!!(PROG.F.rastro&&PROG.F.rastro.given);
/* ── puertas y cerrojos ── */
{const o0=PUZ.open,l0=PUZ.cellLocked,w0=PUZ.why;
  const NEED={'and-sot':abOpen,'and-eco':()=>!!ABF().and,'eco-per':()=>!!ABF().eco,'api-per':()=>!!ABF().per,'api-rev':()=>!!ABF().api&&abGiven()};
  const LOCK={and:abOpen,eco:()=>!!ABF().and,per:()=>!!ABF().eco,api:()=>!!ABF().per,rev:()=>!!ABF().api&&abGiven()};
  PUZ.open=function(a,b){const k=[a,b].sort().join('-');if(NEED[k])return FREE||NEED[k]();return o0.call(PUZ,a,b)};
  PUZ.cellLocked=function(id){if(LOCK[id])return!FREE&&!LOCK[id]();return l0.call(PUZ,id)};
  PUZ.why=function(a,b){const k=[a,b].sort().join('-');
    if(k==='and-sot')return'Bajo las raíces hay algo dormido. Enciende antes tres sellos.';
    if(k==='and-eco')return'La puerta no se abre sin billete. Pregunta a Silbo.';
    if(k==='eco-per')return'Los ecos no te dejan pasar todavía.';
    if(k==='api-per')return'La celda espera algo que se perdió.';
    if(k==='api-rev')return ABF().api?'El espejo espera al primer latido. Devuélveselo antes al Corazón.':'El espejo sigue dormido, como el apicultor.';return w0.call(PUZ,a,b)}}
AWAKE.and=()=>!!ABF().and;AWAKE.eco=()=>!!ABF().eco;AWAKE.per=()=>!!ABF().per;AWAKE.api=()=>!!ABF().api;AWAKE.rev=()=>!!ABF().fin;
Object.assign(NPCN,{and:'Silbo',eco:'Eco',per:'Olvido',api:'Alvéolo',rev:'Etorb'});
Object.assign(MSHORT,{and:'Leer el horario del andén',eco:'Escuchar a los ecos',per:'Encontrar lo que es del apicultor',api:'Dar cuerda al reloj',rev:'Atravesar el espejo'});
Object.assign(NARR.enter,{and:'Aquí esperé un tren que no quería coger.',eco:'No mires mucho rato a las esquinas. Ni dejes de mirarlas.',per:'Todo lo que olvidé está aquí. Hasta cosas que nunca supe.',
  api:'Aquí duerme quien me dio las llaves. Tenía tu edad, una vez.',rev:'Del otro lado del espejo, la colmena se acuerda de todo al revés.'});
Object.assign(LIGHTS,{and:[[200,120,118,150],[-170,-60,90,90]],eco:[[180,100,84,110]],per:[[60,-90,60,150],[-150,60,40,120]],api:[[130,40,50,120],[-150,-90,40,90]],rev:[[-20,-200,70,160]]});
{const dl0=darkLevel;darkLevel=function(id){const L={and:.5,eco:.66,per:.36,api:.42,rev:.3}[id];if(L!=null){if(FREE)return L*.6;return id==='api'&&ABF().api?.18:id==='eco'&&ABF().eco?.4:L}return dl0(id)}}
{const q0=QSTAT;QSTAT=function(id){if(!ABAJO.includes(id))return q0(id);const F=ABF(),done={and:F.and,eco:F.eco,per:F.per,api:F.api,rev:F.fin}[id];return done?{text:'Hecho: '+MSHORT[id],done:true}:{text:'Te pidió: '+MSHORT[id],ask:true}}}
ACH.push(['ecos','Quieto','Recoge las tres cartas de los ecos'],['reverso','El reverso','Atraviesa el espejo de la colmena de abajo']);

/* ── 1 · el Andén Vacío ── */
(PUZ.things.and=PUZ.things.and||[]).push({id:'horario',x:-170,y:-56,z:60,r:80,ax:-170,ay:4,label:()=>'Leer el horario',show:()=>!ABF().and});
Q.and=function(){const F=ABF();
  if(F.and)return{lines:rot('and'),ex:['smile']};
  if(!F.read)return null;
  return{lines:['¿Lo has leído? «Último tren, 3:45. Destino: AYER.»','No iba a ningún sitio. Volvía. Para quien quería deshacer una noche.','Amaranta compró un billete. Pero no subió ella.','Toma. Es un billete de ayer. Abre la casa de al lado; allí vive lo que se quedó.'],
    ex:['neutral','sad','open','smile'],fx:()=>{F.and=1;friend('and',3);Sound.sfx('seal',.5);note('🎫 '+_t('Billete de ayer'));narrate(['Ese billete lo compré yo. Lo recuerdo como se recuerda un sueño.'],'ab:and',{delay:1.2})}}};

/* el horario cuenta como testimonio de la hora (docs/historia.md): se anota al oírselo a Silbo */
TESTI.horario=['Silbo','¿Lo has leído? «Último tren, 3:45. Destino: AYER.»'];TBY[TESTI.horario[1]]='horario';DEDU.find(q=>q.id==='hora').ev.push('horario');
{const hb0=hearBackfill;hearBackfill=function(){hb0();if(!FREE&&ABF().and){const F=QF();F.heard=F.heard||{};F.heard.horario=1}}}
/* ── 2 · la Casa de los Ecos: fantasmas de papel ── */
const mixHex=(a,b,t)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),c=k=>Math.round(((A>>k)&255)*(1-t)+((B>>k)&255)*t);return'#'+((1<<24)|(c(16)<<16)|(c(8)<<8)|c(0)).toString(16).slice(1)};
const bleach=H=>{const o={};for(const k in H){const v=H[k];o[k]=typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?mixHex(v,'#E6E0F0',.72):v}return o};
const ECO_LET=[
  {who:'tre',x:-200,y:-110,t:'«Estela: guarda mi sombrero hasta que vuelva. La del velo no era yo. —A.»'},
  {who:'cum',x:205,y:30,t:'«Nube: lo que viste tirar de la campana no era yo. Era lo que se quedó despierto. —A.»'},
  {who:'sot',x:-80,y:170,t:'«Vela: gracias por la última noche. Fundí la mía; las otras noventa y nueve no son mías. —A.»'}];
const GH=ECO_LET.map(l=>({x:l.x,y:l.y,a:0,h:null,ph:Math.random()*6}));
function ecoTick(dt){if(cur!=='eco'||inTitle)return;const F=ABF();F.got=F.got||{};const active=!F.eco&&(F.and||FREE);
  if(active){const still=!Pl.moving&&!crossing&&!talking;
    GH.forEach((g,i)=>{if(F.got[i])return;g.h=g.h||bleach(HUMANS[ECO_LET[i].who]);const L=ECO_LET[i],dx=Pl.x-g.x,dy=Pl.y-g.y,d=Math.hypot(dx,dy)||1;
      if(still){const v=22+Math.min(30,(T-(ecoTick.st||T))*3);g.x+=dx/d*v*dt;g.y+=dy/d*v*dt;g.a=Math.min(1,g.a+dt*.7)}else{ecoTick.st=T;const bx=L.x-g.x,by=L.y-g.y,bd=Math.hypot(bx,by);if(bd>2){g.x+=bx/bd*60*dt;g.y+=by/bd*60*dt}g.a=Math.max(.12,g.a-dt*1.5)}
      if(d<46&&g.a>.5){F.got[i]=1;F.letters=(F.letters||0)+1;Sound.sfx('thump',1);buzz([40,60,40]);Sound.sfx('page');note(_t('Carta con la letra de Amaranta')+` · ${F.letters}/3`);narrClear();narrate([L.t]);save();
        if(F.letters>=3){achieve('ecos');narrate(['Esas cartas no las escribí yo. Pero son mi letra.'],'ab:eco3',{delay:4.5})}}});
    if(still&&!ecoTick.st)ecoTick.st=T;if(!still)ecoTick.st=0}
  /* susurros */
  if(!STILL&&T>(ecoTick.w||0)){ecoTick.w=T+rd(Math.random,11,19);if(ecoTick.wn){note(_t(['…quédate…','…no era su letra…','…¿quién escribe de noche?…','…detrás de ti no, delante…','…ella sigue aquí…'][Math.floor(Math.random()*5)]));Sound.sfx('plank',.06)}ecoTick.wn=1}}
window.FOGROOM=()=>cur==='eco'&&!crossing&&!inTitle&&!STILL?.32:cur==='and'&&!crossing&&!inTitle&&!STILL?.16:0;
{const o0=CELLS.eco.over;CELLS.eco.over=function(p,T,st){if(o0)o0(p,T,st);const F=ABF();
    /* velas que tiemblan */
    glowA(p,180,100,84,46,32,'rgba(255,210,140,.16)',st?1:.6+.4*Math.abs(Math.sin(T*9)*Math.sin(T*2.7)));
    if(F.eco||!(F.and||FREE))return;F.got=F.got||{};
    GH.forEach((g,i)=>{if(F.got[i]||g.a<.02||!g.h)return;const gg=p.g;gg.save();gg.globalAlpha=g.a*(st?.55:.45+.12*Math.sin(T*3+g.ph));try{drawHuman(p,g.x,g.y,Pl.x>=g.x?1:-1,st?0:T,'sad',false,g.h)}catch(e){}gg.restore();
      if(!st){const q=p.P(g.x,g.y,0);gg.save();gg.globalCompositeOperation='lighter';p.flat(p.ell(q[0],q[1]-50*p.s,26,40,16),'rgba(200,190,255,.06)',g.a);gg.restore()}})}}
Q.eco=function(){const F=ABF();if(F.eco)return{lines:rot('eco'),ex:['smile']};if((F.letters||0)<3)return null;
  return{lines:['Las has encontrado. Las tres.','Las escribí yo, con su letra: noventa y nueve despedidas que ella nunca se atrevió a escribir.','Cuando dejó de escuchar la colmena, yo me desperté. Toqué la campana para que alguien escuchara. Nadie vino.','Así que me puse su sombrero y subí al último tren, para que nadie la buscara abajo antes de tiempo.','Estela no mintió. Me vio a mí.','El viejo de abajo siempre miraba su reloj parado. A las cuatro menos cuarto. Búscalo entre lo perdido.'],
    ex:['sad','neutral','sad','neutral','open','open'],fx:()=>{F.eco=1;friend('eco',2);stateChanged();Sound.sfx('seal',.4);note('☾ '+_t('Eco te deja pasar'))}}};

/* ── 3 · Objetos Perdidos ── */
for(const o of PER_OBJ)(PUZ.things.per=PUZ.things.per||[]).push({id:'obj_'+o.k,obj:o.k,x:o.x,y:o.y,z:36,r:40,ax:o.x,ay:o.y+56,label:()=>o.label,show:()=>!ABF().per&&!!ABF().met_per});
{const o0=CELLS.per.over;CELLS.per.over=function(p,T,st){if(o0)o0(p,T,st);if(ABF().per)return;for(const o of PER_OBJ)drawPerObj(p,o)}}
Q.per=function(){const F=ABF();if(F.per)return{lines:rot('per'),ex:['smile']};
  if(!F.met_per)return{lines:[...DLG2.per.first,'En la mesa hay tres cosas de la misma noche. Una es del viejo apicultor que duerme más abajo.','Si sabes cuál, llévatela. Si te equivocas, se vuelve a perder.'],ex:['smile','open','neutral','neutral','neutral'],fx:()=>{F.met_per=1;stateChanged()}};
  return{lines:['¿Ya sabes cuál es la suya? Piensa en lo que nunca dejaba de mirar.'],ex:['neutral']}};

/* ── 4 · la Celda del Apicultor ── */
(PUZ.things.api=PUZ.things.api||[]).push({id:'reloj_api',x:130,y:40,z:40,r:70,ax:130,ay:96,label:()=>'Dar cuerda al reloj',show:()=>!!ABF().per&&!ABF().api});
Q.api=function(){const F=ABF();if(!F.api)return null;
  if(!F.api2)return{lines:['…Tic. Tac. Hacía mucho que no oía eso.','Soy Alvéolo. Fui guardián de esta colmena cuando tenía tu edad… y luego me dormí en el corazón.','Una niña me despertó. Se llamaba Amaranta. Yo bajé aquí a dormir y ella se quedó guardando.','Así funciona: cada guardián duerme cuando llega el siguiente. Pero a ella le falta un trozo.','Está al otro lado del espejo. Ve. Yo ya he dormido bastante.'],
    ex:['sad','neutral','smile','neutral','happy'],fx:()=>{F.api2=1;friend('api',3);stateChanged()}};
  /* ya despierto: solo sus frases de despierto (la primera de DLG2.api.again es la de dormido) */
  const D=DLG2.api.again.slice(1),T2=PROG.F.talk2||(PROG.F.talk2={}),i=(T2.api||0)%D.length;T2.api=(T2.api||0)+1;return{lines:D[i],ex:['smile']}};
DLG2.api.again.push(['Cuando me desperté, la colmena era más pequeña. O yo más grande.'],['Dale recuerdos a Amaranta. Ella sabrá cuáles.']);

/* ── 5 · El Reverso ── */
(PUZ.things.rev=PUZ.things.rev||[]).push({id:'espejo',x:-20,y:-196,z:70,r:84,ax:-20,ay:-120,label:()=>'Tocar el espejo',show:()=>!!ABF().api&&!ABF().fin});
{const o0=CELLS.rev.over;CELLS.rev.over=function(p,T,st){if(o0)o0(p,T,st);const F=ABF();
    if(F.api&&!F.fin){const c=p.P(-20,-200,70);p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(c[0],c[1],40,70,20),'rgba(255,240,200,.12)',st?1:.6+.4*Math.sin(T*2));p.g.restore()}
    if(F.fin){const h=HUMANS.eco;p.g.save();p.g.globalAlpha=.55;try{drawHuman(p,-60,-150,1,st?0:T,'happy',false,h)}catch(e){}p.g.restore()}}}
Q.rev=function(){const F=ABF();if(F.fin)return{lines:['Tu sombra tiene dos colores ahora. Una es tuya.','La otra… creo que es de Eco. Se ha quedado contigo.'],ex:['happy','smile']};return null};

/* ── las acciones ── */
{const a0=act;act=function(t){const F=ABF();
  if(t&&t.id==='horario'){F.read=1;Sound.sfx('page');narrClear();narrate(['SALIDAS · Último tren · 3:45 · Destino: AYER.','Debajo, alguien ha escrito a lápiz: «No subas. Ya subí yo.»']);note(_t('Habla con Silbo'));stateChanged();return}
  if(t&&t.obj){if(t.obj==='reloj'){F.per=1;Sound.sfx('seal',.5);narrClear();narrate(['Olvido asiente. «Ese reloj se paró cuando él se durmió. Llévaselo.»']);note('⏱ '+_t('El reloj parado del apicultor'));friend('per',3);stateChanged()}
    else{Sound.sfx('blocked');note(_t('Olvido: «Eso no es suyo. Vuelve a su estante.»'))}return}
  if(t&&t.id==='reloj_api'){F.api=1;CELLS.api.npc.idle='smile';WAVE={t0:T+.3,id:'api'};Sound.sfx('seal');buzz([20,60,20]);note('⏱ '+_t('El reloj vuelve a andar'));EMO.api={ch:'!',t0:T+.5};stateChanged();setTimeout(()=>{if(cur==='api'){nearObj={kind:'npc'};near=true;talking=false;talk();DLG.forced=true}},1400);return}
  if(t&&t.id==='espejo'){F.fin=1;WAVE={t0:T+.2,id:'rev'};Sound.sfx('seal');buzz([30,90,30,90,40]);achieve('reverso');friend('eco',3);friend('rev',3);stateChanged();
    narrClear();narrate(['Tocaste el espejo y Eco apareció a tu lado, por fin sin transparencia.','«Ya sé dónde está lo que le falta», dijo. «Subo contigo al corazón.»','Arriba, en el corazón, Amaranta sonrió en sueños.'],'ab:rev',{delay:1});setTimeout(()=>{note(_t('Eco te acompañará al Corazón'));updGoal()},900);return}
  a0(t)}}

/* ── objetivo, pistas y cuaderno ── */
{const g0=PUZ.goal;PUZ.goal=function(){const F=PROG.F,A=ABF();if(FREE||A.fin||!abOpen()||!(A.read||A.api||(F.rastro&&F.rastro.given)))return g0.call(PUZ);if(A.api2&&!abGiven())return g0.call(PUZ);
  const set=(c,t)=>{QGOAL.cell=c;return t};
  if(!A.and)return A.read?set('and','Habla con Silbo · El Andén Vacío'):set('and','Baja al Andén Vacío · bajo las raíces');
  if(!A.eco)return(A.letters||0)<3?set('eco',`Quédate quieto en la Casa de los Ecos · cartas ${A.letters||0}/3`):set('eco','Habla con Eco · La Casa de los Ecos');
  if(!A.per)return set('per',A.met_per?'Coge lo que es del apicultor · Objetos Perdidos':'Habla con Olvido · Objetos Perdidos');
  if(!A.api)return set('api','Dale cuerda al reloj del apicultor · La Celda del Apicultor');
  if(!A.api2)return set('api','Habla con Alvéolo · La Celda del Apicultor');
  return set('rev','Toca el espejo · El Reverso')}}
Object.assign(HINT2,{and:'Silbo: «Los horarios no mienten. Léelo antes de pedirme nada.»',eco:'Eco: «Si te quedas quieto, vienen. Si te mueves, se esconden.»',per:'Olvido: «¿Qué miraba siempre el viejo? Eso es lo suyo.»',api:'Alvéolo duerme. Su reloj lleva parado desde las cuatro menos cuarto.',rev:'Etorb: «El espejo se abre para quien trae a alguien de vuelta.»'});
{const ob=openBook;openBook=function(tab){ob(tab);const F=ABF(),box=document.getElementById('bpages');if(!box||!(F.letters||F.read))return;const e=box.querySelector('p.empty');if(e)e.remove();
    const h=document.createElement('h3');h.className='rastroh';h.textContent=_t('La colmena de abajo');box.appendChild(h);
    const add=(k,t)=>{const a=document.createElement('article'),sm=document.createElement('small');sm.textContent=_t(k);a.appendChild(sm);a.appendChild(document.createTextNode(_t(t)));box.appendChild(a)};
    if(F.read)add('El Andén Vacío','SALIDAS · Último tren · 3:45 · Destino: AYER.');F.got=F.got||{};ECO_LET.forEach((l,i)=>{if(F.got[i])add('La Casa de los Ecos',l.t)});
    if(F.eco)add('Eco','Las escribí yo, con su letra. Quise que cada uno tuviera una despedida.');if(F.api2)add('Alvéolo','Cada guardián duerme cuando llega el siguiente.')}}

/* ── el tictac de la isla (en 2D y en 3D) ── */
{const bt0=beatTick;let lt=0;beatTick=function(){const dt=Math.min(.1,Math.max(0,T-lt));lt=T;try{ecoTick(dt);if(cur==='api')CELLS.api.npc.idle=ABF().api?'smile':'sleep'}catch(e){if(!beatTick.e){beatTick.e=1;console.warn('abajo',e)}}return bt0()}}

/* ── en 3D: su decoración ── */
if(window.R3ADD){const W=(k,c,r,o)=>({k,c:c||[],r:r||26,...(o||{})});
  R3ADD('and',{items:[W('lantern',['#BFE0FF','#9FB6FF'],12),W('barrel',['#4E5A66'],16),W('crate',['#5A6470'],18),W('rocks',['#6E7A84','#5A6670'],20),W('paper',[],24)],life:[{p:'drift',n:24,cols:['#BFE0FF','#E6EAEE'],size:1.4,z0:10,z1:180,op:.6}]});
  R3ADD('eco',{items:[W('candles',['#E6E0D0'],14),W('books',['#4A3A5E','#6A5A7E','#2A2036'],18),W('frame',['#8A6A3A','#2A2036'],18),W('pillow',['#6A3A4A','#4A3A5E'],18),W('candles',['#D8D0E6'],14)],life:[{p:'blink',n:20,cols:['#E6DCFF','#C8C0E8'],size:1.6,add:1,z0:20,z1:170},{p:'drift',n:12,cols:['#D8D0E6'],size:3,z0:10,z1:120,op:.35}]});
  R3ADD('per',{items:[W('crate',['#A87044'],20),W('books',['#8A5A3A','#C9A060',C.cream],18),W('jars',['#C9A878','#8A6A4A','#E9DCC6'],18),W('crate',['#C9A878'],18),W('barrel',['#8A5A34'],16)],life:[{p:'drift',n:22,cols:['#FFF0C8'],size:1.2,add:1,z0:10,z1:180,op:.6}]});
  R3ADD('api',{items:[W('honey',[],20),W('jars',[C.honey,C.honeyL,C.amber],18),W('candles',[C.cream],14),W('bigplant',[C.terra,C.sage,C.sageD],22)],life:[{p:'rise',n:18,cols:['#FFE3A0','#FFD36A'],size:1.4,add:1,sp:.04,op:.7},{f:'fly',n:2,cols:['#F5CE55'],at:[[-60,-40],[80,60]],body:3,bodyCol:'#E4A844',wing:3.4,wingCol:'#FFFFFF',wingOp:.7,flap:30,amp:.8,sp:.4,rx:30,ry:24,z:50}]});
  R3ADD('rev',{items:[W('flowers',['#9AD0C0','#B8E0F0','#C8B6FF'],22),W('bush',['#5A8A7A','#3E6A5E','#7AB0A0'],22),W('flowers',['#C8B6FF','#9AD0C0'],22),W('bigplant',['#5A4A6E','#7AB0A0','#5A8A7A'],22)],life:[{p:'rise',n:22,cols:['#B8E0F0','#C8B6FF','#FFFFFF'],size:2.2,sp:.04,wob:20}]})}
