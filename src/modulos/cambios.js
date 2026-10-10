/* ══════════ CAMBIOS EN CUARTOS QUE YA EXISTÍAN (para que la trama gane peso) ══════════
   · Cocina de miel → La Última Cena: la cena de la noche en que todo se paró, servida y sin comensales.
   · Cumbre → El Campanario: la campana que sonó una sola vez a medianoche.
   · Sala de retratos: un retrato tapado con una tela; solo se descubre tras la Casa de los Ecos.
   · Espacio, Océano, Desierto y Antártida: un recuerdo de Amaranta en cada uno, que apunta a la colmena de abajo. */

/* ── La Última Cena ── */
SEASON.coc.name='La Última Cena';CELLS.coc.sub='La cena de la noche en que todo se paró';
{const pr=CELLS.coc.props.find(p=>p.id==='mesa');if(pr){const d0=pr.draw;pr.bb=[pr.bb[0]-40,pr.bb[1]-20,pr.bb[2]+40,pr.bb[3]+30];
  pr.draw=p=>{const s=p.s,x=-40,y=60;
    /* sillas alrededor, todas vacías; la de Amaranta, caída */
    for(const [dx,dy,f] of[[-78,-10,0],[-78,24,0],[38,-10,0],[38,24,0],[-30,-44,0],[10,-44,0]]){const cx=x+dx,cy=y+dy;box3P(p,cx-8,cx+8,cy-8,cy+8,18,21,'#8A5A34','#6E4A2A','#A87044',{rough:.2});for(const [a,b] of[[-6,-6],[6,-6],[-6,6],[6,6]])p.line([p.P(cx+a,cy+b,0),p.P(cx+a,cy+b,18)],'#6E4A2A',1.6);box3P(p,cx-8,cx+8,cy-10,cy-7,21,42,'#8A5A34',null,'#A87044',{rough:.2})}
    d0(p);
    for(const [dx,dy] of[[-22,-6],[-2,-6],[18,-6],[-22,14],[-2,14],[18,14]]){const q=p.P(x+dx,y+dy,40);p.cut(p.ell(q[0],q[1],6.4,2.8,14),'#F6EEDC',{sh:0,rough:.1});p.flat(p.ell(q[0],q[1],3.6,1.5,10),'#E9DCC6')}
    const f=p.P(x+70,y+50,0);p.cut([[f[0]-18*s,f[1]],[f[0]+16*s,f[1]-4*s],[f[0]+18*s,f[1]+3*s],[f[0]-16*s,f[1]+7*s]],'#8A5A34',{rough:.3});p.line([[f[0]+14*s,f[1]-2*s],[f[0]+30*s,f[1]-10*s]],'#6E4A2A',2.4)}}}
CELLS.coc.solids.push([30,110,14]);
DLG2.coc.again.push(['Esa noche puse veinticinco platos. Nadie se sentó. Los he dejado así.'],['La silla caída es la de Amaranta. Se levantó tan deprisa que nadie la recogió.']);
NARR.enter.coc='La cena de aquella noche sigue servida. Nadie se atrevió a recoger.';

/* ── El Campanario ── */
SEASON.cum.name='El Campanario';CELLS.cum.sub='La campana de medianoche';
function drawBell(p,sw){const s=p.s,x=170,y=-100;for(const dx of[-26,26])p.line([p.P(x+dx,y,0),p.P(x+dx,y,120)],'#6E4A2A',4);p.line([p.P(x-32,y,120),p.P(x+32,y,120)],'#6E4A2A',5);
  const top=p.P(x,y,116),a=sw||0,c=[top[0]+Math.sin(a)*14*s,top[1]+30*s];p.line([top,c],'#4A3A30',1.6);
  p.cut([[c[0]-16*s,c[1]+14*s],[c[0]+16*s,c[1]+14*s],[c[0]+11*s,c[1]-10*s],[c[0],c[1]-16*s],[c[0]-11*s,c[1]-10*s]],'#C9A05C',{blur:3,rough:.2});p.flat(p.ell(c[0],c[1]+14*s,16,3,14),'#8A6A2A');p.flat(p.ell(c[0]+Math.sin(a)*4*s,c[1]+18*s,3,3,8),'#6A4A2A');
  p.line([[c[0]+Math.sin(a)*4*s,c[1]+20*s],[p.P(x+4,y+6,30)[0],p.P(x+4,y+6,30)[1]]],'#C9A46A',1.2)}
CELLS.cum.props.push({id:'campana',y:-100,bb:[130,-260,210,-80],draw:p=>drawBell(p,0)});CELLS.cum.solids.push([170,-100,30]);
{const o0=CELLS.cum.over;CELLS.cum.over=function(p,T,st){if(o0)o0(p,T,st);if(st)return;const a=Math.sin(T*.9)*.12;if(Math.abs(a)>.02){const g=p.g;g.save();g.globalCompositeOperation='lighter';const q=p.P(170,-100,90);p.flat(p.ell(q[0],q[1],22,14,14),'rgba(255,220,150,.06)');g.restore()}}}
(PUZ.things.cum=PUZ.things.cum||[]).push({id:'campana',x:170,y:-96,z:80,r:70,ax:150,ay:-36,label:()=>'Tocar la campana',show:()=>true});
DLG2.cum.again.push(['La campana sonó a medianoche. Una sola vez. Desde aquí vi quién tiraba de la cuerda.'],['No era Amaranta. Era alguien de papel, casi transparente.']);
NARR.enter.cum='Esa noche la campana sonó una vez. Yo ya no la oí.';
MGOAL.cum=()=>['Lanza la cometa con Nube · El Campanario','cum'];

/* ── el retrato tapado (Sala de retratos) ── */
const RETP={x:-160,y:-130};
function drawCovered(p,open){const s=p.s,{x,y}=RETP,b=p.P(x,y,0);p.flat(p.ell(b[0],b[1]+1*s,30,8,16),'rgba(70,40,15,.22)');
  const q=[p.P(x-28,y,4),p.P(x+28,y,4),p.P(x+24,y-10,96),p.P(x-24,y-10,96)];p.cut(q,'#C9A05C',{blur:4,rough:.2});
  const inn=[p.P(x-22,y,10),p.P(x+22,y,10),p.P(x+19,y-9,90),p.P(x-19,y-9,90)];
  if(open){p.flat(inn,'#3A3048');try{const c=p.P(x,y-5,32);p.g.save();p.g.beginPath();inn.forEach((v,i)=>i?p.g.lineTo(v[0],v[1]):p.g.moveTo(v[0],v[1]));p.g.closePath();p.g.clip();drawHuman(p,x,y-5,1,0,'smile',true,HUMANS.eco);p.g.restore()}catch(e){}}
  else{p.cut([p.P(x-30,y+2,0),p.P(x+30,y+2,0),p.P(x+28,y-8,104),p.P(x,y-12,112),p.P(x-28,y-8,104)],'#E6E0F0',{blur:3,rough:.8});for(const dx of[-12,0,12])p.line([p.P(x+dx,y+2,4),p.P(x+dx*.8,y-8,100)],'#C8C0D8',1,.7)}}
(PUZ.things.ret=PUZ.things.ret||[]).push({id:'tapado',x:RETP.x,y:RETP.y,z:50,r:70,ax:RETP.x+30,ay:RETP.y+70,label:()=>'Levantar la tela',show:()=>!!(PROG.F.ab&&PROG.F.ab.eco)&&!(PROG.F.ab&&PROG.F.ab.retrato)});
{const o0=CELLS.ret.over;CELLS.ret.over=function(p,T,st){if(o0)o0(p,T,st);drawCovered(p,!!(PROG.F.ab&&PROG.F.ab.retrato))}}
CELLS.ret.solids.push([RETP.x,RETP.y,30]);
DLG2.ret.again.push(['Ese cuadro tapado no lo pinté yo. Apareció una mañana, ya con la tela encima.']);

/* ── recuerdos de Amaranta en los cuatro biomas ── */
const AMEM={esp:{x:160,y:80,k:'catalejo',label:'Mirar el catalejo de juguete',t:'Un catalejo de juguete. En el tubo, grabado: «Para mirar hacia abajo».',n:'Lo usaba para mirar hacia abajo, no hacia arriba. Abajo también hay estrellas.'},
  oce:{x:-130,y:110,k:'botella',label:'Leer la botella',t:'Una botella con una nota: «El tren no lleva a ningún sitio. Vuelve.»',n:'Tiré esa botella al mar sin saber a quién avisaba. Quizá a mí misma.'},
  des:{x:40,y:150,k:'arena',label:'Mirar el reloj de arena',t:'Un reloj de arena vacío por arriba. Toda la arena se quedó abajo.',n:'Lo que importa siempre se queda abajo. Como la arena.'},
  ant:{x:-150,y:100,k:'guante',label:'Coger el guante de lana',t:'Un guante de lana con una A bordada. El otro debe de andar perdido.',n:'Perdí el otro guante bajando. Allí abajo guardan todo lo perdido.'}};
const amF=()=>PROG.F.am||(PROG.F.am={});
function drawAmem(p,o,seen,T,st){const s=p.s,q=p.P(o.x,o.y,0);if(!seen&&!st){p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(q[0],q[1]-6*s,18,9,14),'rgba(255,230,170,.14)',.6+.4*Math.sin(T*2.4));p.g.restore()}
  if(o.k==='catalejo'){p.cut([[q[0]-14*s,q[1]-2*s],[q[0]+12*s,q[1]-8*s],[q[0]+13*s,q[1]-3*s],[q[0]-13*s,q[1]+3*s]],'#C9A05C',{rough:.2});p.flat(p.ell(q[0]+13*s,q[1]-5.5*s,2.6,3,10),'#7CB5C8')}
  else if(o.k==='botella'){p.cut([[q[0]-12*s,q[1]],[q[0]+8*s,q[1]-5*s],[q[0]+9*s,q[1]+1*s],[q[0]-11*s,q[1]+5*s]],'rgba(140,200,180,.85)',{rough:.2});p.flat([[q[0]-6*s,q[1]],[q[0]+2*s,q[1]-2*s],[q[0]+2*s,q[1]+1*s],[q[0]-6*s,q[1]+3*s]],'#F6EEDC')}
  else if(o.k==='arena'){p.cut([[q[0]-7*s,q[1]],[q[0]+7*s,q[1]],[q[0]+2*s,q[1]-9*s],[q[0]+7*s,q[1]-18*s],[q[0]-7*s,q[1]-18*s],[q[0]-2*s,q[1]-9*s]],'rgba(220,235,240,.8)',{rough:.1});p.flat([[q[0]-6*s,q[1]-1*s],[q[0]+6*s,q[1]-1*s],[q[0]+3*s,q[1]-5*s],[q[0]-3*s,q[1]-5*s]],'#E0B060')}
  else{p.cut(p.ell(q[0],q[1]-4*s,9,6,14),'#B8484A',{rough:.4});p.cut([[q[0]-9*s,q[1]-4*s],[q[0]-15*s,q[1]-8*s],[q[0]-12*s,q[1]-10*s],[q[0]-6*s,q[1]-7*s]],'#B8484A',{rough:.3});p.text('A',q[0]+1*s,q[1]-3*s,7,'#F6EEDC',{w:600})}}
for(const id in AMEM){const o=AMEM[id];(PUZ.things[id]=PUZ.things[id]||[]).push({id:'amem',am:id,x:o.x,y:o.y,z:6,r:56,ax:o.x+(o.x>0?-36:36),ay:o.y-10,label:()=>o.label,show:()=>true});
  const o0=CELLS[id].over;CELLS[id].over=function(p,T,st){if(o0)o0(p,T,st);drawAmem(p,o,!!amF()[id],T,st)}}
ACH.push(['recuerdos','Lo que dejó','Encuentra los cuatro recuerdos de Amaranta']);
{const a0=act;act=function(t){
  if(t&&t.id==='amem'){const o=AMEM[t.am],F=amF(),first=!F[t.am];F[t.am]=1;Sound.sfx('page');narrClear();narrate([o.t,...(first?[o.n]:[])]);const n=Object.keys(F).length;note(_t('Recuerdo de Amaranta')+` · ${n}/4`);if(n>=4)achieve('recuerdos');stateChanged();return}
  if(t&&t.id==='campana'){Sound.sfx('thump',.9);setTimeout(()=>Sound.sfx('thump',.5),700);buzz([20,80,20]);narrClear();narrate(['Suena una vez. El eco tarda en volver… y vuelve desde abajo.'],null);return}
  if(t&&t.id==='tapado'){PROG.F.ab.retrato=1;Sound.sfx('page');narrClear();narrate(['Debajo de la tela hay una chica de pelo rojo. Es Amaranta… pero joven, y casi transparente.','En la esquina, firmado: «Eco».']);note(_t('El retrato tapado'));stateChanged();return}
  a0(t)}}
{const ob=openBook;openBook=function(tab){ob(tab);const F=PROG.F.am||{},ks=Object.keys(F);const box=document.getElementById('bpages');if(!box||!ks.length)return;const e=box.querySelector('p.empty');if(e)e.remove();
    const h=document.createElement('h3');h.className='rastroh';h.textContent=_t('Recuerdos de Amaranta')+` · ${ks.length}/4`;box.appendChild(h);
    for(const id of ['esp','oce','des','ant'])if(F[id]){const a=document.createElement('article'),sm=document.createElement('small');sm.textContent=_t(SEASON[id].name);a.appendChild(sm);a.appendChild(document.createTextNode(_t(AMEM[id].t)));box.appendChild(a)}}}
/* el cuaderno: la galería cuenta a todos los vecinos */
{const fg=fillGallery;fillGallery=function(){fg();const k=document.getElementById('bgalk');if(k)k.textContent=k.textContent.replace(/\/\s*24\b/,'/'+(ORDER.length-1))}}
