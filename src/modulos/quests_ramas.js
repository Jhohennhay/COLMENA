/* ══════════ LAS RAMAS · la colmena cuelga de algo mucho más grande ══════════
   Cada celda cuelga de una rama. Sin latido la savia no baja y las ramas se secan:
   mientras un cuarto no está resuelto, su rama se debilita (solo mientras juegas; se para
   al leer, hablar o jugar un minijuego). Si cede, el cuarto cae a la niebla y hay que
   subirlo tirando de la cuerda desde una puerta vecina. Los cuartos nuevos suben desde
   la niebla cuando llegas cerca. Tres niveles: Tranquila, Normal y Vértigo. */
const SINK=330,DOWNY=230;
const DIF={calma:{rate:1/(15*60),cap:.86,name:'Tranquila'},normal:{rate:1/(15*60),cap:1,name:'Normal'},vertigo:{rate:1/(9*60),cap:1,name:'Vértigo'}};
const BRF=()=>{const F=QF();return F.br||(F.br={})},BRS_=id=>{const B=BRF();return B[id]||(B[id]={w:0})};
const dif=()=>DIF[QF().dif]?QF().dif:'normal';
const risenF=()=>{const F=QF();return F.risen||(F.risen={})};
const CH1C=['pri','ver','oto','inv'];
const secured=id=>id==='cor'||CH1C.includes(id)||(NEW_CELLS.includes(id)?!!QF().star:LATE.includes(id)?(mDone(id)||!!BRS_(id).lost):true);
const isRisen=id=>FREE||inTitle||!!risenF()[id];
const isDown=id=>!FREE&&!!(BRF()[id]&&BRF()[id].down);
const RISE={},FALL={},PULL={},SAP={};let BR_SHAKE=-9;
const rising=id=>RISE[id]&&T-RISE[id].t0<RISE[id].dur;

/* desplazamiento vertical de cada celda (lo usa game.js al dibujar) */
window.CDY=function(id){if(FREE)return 0;
  if(RISE[id]){const u=(T-RISE[id].t0)/RISE[id].dur;if(u<0)return SINK;if(u<1){const e=1-Math.pow(1-u,3),ov=Math.sin(u*Math.PI)*.08;return SINK*(1-e)-SINK*ov*(u>.6?1:0)}}
  if(!isRisen(id))return SINK;
  const B=BRF()[id];if(B&&B.down){let y=DOWNY;const P=PULL[id];if(P)y=lerp(P.from,P.to,Math.min(1,(T-P.t0)/.5));else y=DOWNY*(1-(B.pull||0)/3);
    const Fa=FALL[id];if(Fa){const u=(T-Fa.t0);if(u<1.6)y=y*Math.min(1,u/.45)+Math.sin(u*9)*Math.exp(-u*2.2)*26}return y+(STILL?0:Math.sin(T*1.3+id.length)*5)}
  if(B&&B.w>=.8&&!secured(id)&&!STILL)return Math.sin(T*2.2+id.charCodeAt(0))*3.5+(Math.sin(T*.7)>.93?Math.sin(T*40)*2:0);
  if(T-BR_SHAKE<2.5&&!STILL)return Math.sin((T-BR_SHAKE)*14+id.charCodeAt(1))*3*(1-(T-BR_SHAKE)/2.5);
  return 0};
window.CHIDE=id=>!FREE&&!isRisen(id)&&!RISE[id];
window.CDYN=id=>!FREE&&(!isRisen(id)||rising(id)||isDown(id)||(!secured(id)&&(BRF()[id]||{}).w>=.8)||T-BR_SHAKE<2.5);
window.CDKEY=()=>FREE?'':ORDER.map(id=>(isRisen(id)?'1':'0')+(isDown(id)?'d':'')).join('');
/* el mapa deja sitio abajo para la niebla y arriba para las ramas */
CL.y1+=SINK*.72;CL.y0-=90;CL.cy=(CL.y0+CL.y1)/2;

/* ── subir desde la niebla ── */
function riseEligible(id){if(PUZ.cellLocked(id))return false;if(isSeen(id)&&QF().seen&&QF().seen[id])return true;return LINKS.some(l=>(l[0]===id&&QF().seen&&QF().seen[l[1]])||(l[1]===id&&QF().seen&&QF().seen[l[0]]))}
function riseInit(){if(FREE)return;const R=risenF();for(const id of ORDER)if(!R[id]&&riseEligible(id))R[id]=1}
let riseAcc=0,riseNext=0;
function riseTick(dt){if(FREE||inTitle)return;riseAcc+=dt;if(riseAcc<.4)return;riseAcc=0;const R=risenF();let k=0;
  for(const id of ORDER){if(R[id]||!riseEligible(id))continue;R[id]=1;const t0=Math.max(T+.3,riseNext)+k*.15;riseNext=t0+.7;RISE[id]={t0,dur:2.8};k++;delete DARK[id];
    setTimeout(()=>{rumble(.8);if(id!==cur)note(`Una celda sube desde la niebla: ${SEASON[id].name}`)},Math.max(0,(t0-T)*1000));
    narrate(['Las celdas dormían abajo, en la niebla. Cuando alguien se acerca, suben a mirar.'],'sube',{delay:3.2});PLOG&&PLOG.ev&&PLOG.ev('sube',id)}
  if(k){save();bakeBackdrop()}}

/* ── debilitarse, crujir, caer ── */
function playing(){return!inTitle&&!FREE&&!talking&&MGEL.hidden&&BOOK.hidden&&setEl.hidden&&endEl.hidden&&panel.hidden&&!photoOn&&!(typeof M!=='undefined'&&M.on)&&document.visibilityState==='visible'&&!(typeof DEMO!=='undefined'&&DEMO)}
let creakT=6,beatT=260+Math.random()*160;
function branchTick(dt){if(FREE)return;const D=DIF[dif()],B=BRF();
  for(const id of ORDER){if(!isRisen(id)||rising(id))continue;const b=BRS_(id);
    if(secured(id)){if(b.sec===undefined){b.sec=1;b.w=0;continue}if(!b.sec){b.sec=1;if(b.w>.05||isSeen(id)){SAP[id]=T;if(isSeen(id)&&!CH1C.includes(id)&&id!=='cor'){note(`La savia vuelve a la rama de ${SEASON[id].name}.`);Sound.sfx('seal')}}b.w=0}continue}
    if(b.sec===undefined&&!isSeen(id)){}b.sec=0;if(b.down||!isSeen(id)||!playing())continue;
    const w0=b.w;b.w=Math.min(D.cap,b.w+dt*D.rate);
    if(w0<.5&&b.w>=.5){creak(1);note(id===cur?'Cruje la rama de este cuarto. No tardes.':`Cruje la rama de ${SEASON[id].name}.`);narrate(['Sin latido, la savia no baja y las ramas se secan.','Cuando resuelves lo que un cuarto necesita, su rama se endurece.'],'ramas1',{delay:1})}
    if(w0<.8&&b.w>=.8){creak(1.4);note(id===cur?'¡La rama se dobla! Si cede, este cuarto caerá a la niebla.':`La rama de ${SEASON[id].name} se dobla. Si cede, caerá a la niebla.`)}
    if(b.w>=1){const inside=id===cur||(crossing&&(crossing.to===id||crossing.from===id));if(!inside)fall(id);else if(Math.random()<dt*.5)creak(1.2)}}
  /* crujidos de ambiente cerca de ramas débiles */
  creakT-=dt;if(creakT<=0){creakT=8+Math.random()*7;const near=[cur,...CELLS[cur].doors.map(d=>d.to)].filter(id=>!secured(id)&&(B[id]||{}).w>=.5&&!isDown(id));if(near.length&&playing()){creak(near.includes(cur)?1:.5);if(near.includes(cur)&&typeof POM!=='undefined')POM.fear=2.5}}
  /* un latido hondo, más arriba: no es la colmena */
  if(playing()){beatT-=dt;if(beatT<=0){beatT=240+Math.random()*180;deepBeat();BR_SHAKE=T;narrate(['Eso no fue la colmena. Late más hondo, más arriba.'],'hondo',{delay:1.2})}}}
function fall(id){const b=BRS_(id);b.down=1;b.w=0;b.pull=0;b.falls=(b.falls||0)+1;FALL[id]={t0:T};delete DARK[id];crack();rumble(1.3);buzz([40,30,60]);
  note(`¡La rama de ${SEASON[id].name} cedió! El cuarto cayó a la niebla.`);
  narrate(['Cuando una rama cede, el cuarto queda colgando de una raíz.','Desde una puerta vecina se puede tirar de la cuerda y subirlo.'],'cae1',{delay:1.4});
  if(dif()==='vertigo'&&b.falls>=2&&!b.lost){b.lost=1;setTimeout(()=>note(`${SEASON[id].name} volvió a caer. Algo de ese cuarto se quedará abajo para siempre.`),3200)}
  PLOG&&PLOG.ev&&PLOG.ev('cae',id);stateChanged()}
function pullRope(to){const b=BRS_(to);if(!b.down)return;const from=DOWNY*(1-(b.pull||0)/3);b.pull=(b.pull||0)+1;PULL[to]={t0:T,from,to:DOWNY*(1-b.pull/3)};Sound.sfx('crank',.6);buzz(25);
  if(b.pull>=3){setTimeout(()=>{b.down=0;b.pull=0;b.w=.3;delete PULL[to];delete FALL[to];delete DARK[to];QF().rescues=(QF().rescues||0)+1;achieve('rescate');Sound.sfx('thunk');rumble(.6);
    note(`¡Arriba! ${SEASON[to].name} vuelve a su sitio.`);PLOG&&PLOG.ev&&PLOG.ev('rescata',to);stateChanged()},520)}
  else note(`Tiras de la cuerda… ${b.pull}/3`);save()}

/* puertas cerradas mientras un cuarto está abajo o subiendo */
{const o0=PUZ.open.bind(PUZ),w0=PUZ.why.bind(PUZ);
  PUZ.open=(a,b)=>o0(a,b)&&(FREE||(!isDown(a)&&!isDown(b)&&isRisen(a)&&isRisen(b)&&!rising(a)&&!rising(b)));
  PUZ.why=(a,b)=>{if(!FREE&&o0(a,b)){const x=isDown(a)?a:isDown(b)?b:null;if(x)return`${SEASON[x].name} cayó a la niebla. Tira de la cuerda para subirlo.`;if(rising(a)||rising(b))return'Está subiendo desde la niebla…';if(!isRisen(b))return'Esa celda sigue abajo, en la niebla.'}return w0(a,b)}}
/* los caminos no se despliegan hacia una celda que no está en su sitio */
{const u0=unfoldTick;unfoldTick=function(P,open,mine){const U=u0(P,open,mine);if(!FREE&&(isDown(P.a)||isDown(P.b)||!isRisen(P.a)||!isRisen(P.b)||rising(P.a)||rising(P.b))){U.a=0;U.b=0}return U}}
/* el tren no para en una celda caída */
{const t0=travelOffer;travelOffer=function(id){if(!FREE&&(isDown(id)||!isRisen(id))){travelEl.hidden=true;travelTo=null;return false}return t0(id)}}
/* el objetivo avisa si hay que rescatar un cuarto por el camino */
{const g0=PUZ.goal.bind(PUZ);PUZ.goal=function(){const g=g0();if(FREE)return g;const c=QGOAL.cell;
  const downs=ORDER.filter(isDown);if(!downs.length)return g;
  if(c&&isDown(c)){const nb=LINKS.map(l=>l[0]===c?l[1]:l[1]===c?l[0]:null).find(x=>x&&!isDown(x)&&isRisen(x)&&!PUZ.cellLocked(x));return`Rescata ${SEASON[c].name}: tira de la cuerda desde ${nb?SEASON[nb].name:'una puerta vecina'}`}
  if(c&&typeof pathTo==='function'&&!pathTo(c,PUZ.open)){const P=pathTo(c,(a,b)=>PUZ._open0(a,b));if(P){const x=P.find(isDown);if(x){QGOAL.cell=x;return`Rescata ${SEASON[x].name} tirando de la cuerda`}}}
  return g}}

/* cuerdas en las puertas que dan a un cuarto caído */
for(const [a,b] of LINKS)for(const [from,to] of[[a,b],[b,a]]){const d=CELLS[from].doors.find(x=>x.to===to);if(!d)continue;const x=d.trig[0]+d.n[0]*62,y=d.trig[1]+d.n[1]*62;
  (PUZ.things[from]=PUZ.things[from]||[]).push({id:'cuerda',to,x,y,z:10,r:80,ax:x+d.n[0]*26,ay:y+d.n[1]*26,label:()=>`Tirar de la cuerda (${(BRS_(to).pull||0)}/3)`,show:()=>isDown(to)&&!PUZ.cellLocked(from)})}
function drawRope(p,from,to){const d=CELLS[from].doors.find(x=>x.to===to),s=p.s,x=d.trig[0]+d.n[0]*62,y=d.trig[1]+d.n[1]*62;
  for(let k=0;k<4;k++){const q=p.P(x,y,k*3.2);p.cut(p.ell(q[0],q[1],16-k*2.6,(16-k*2.6)*.5,18),k%2?'#C9A46A':'#B8904E',{rough:.3,sh:k?0:1})}
  const pts=[];for(let k=0;k<=10;k++){const u=k/10;pts.push(p.P(lerp(x,d.trig[0]-d.n[0]*20,u),lerp(y,d.trig[1]-d.n[1]*20,u),12-Math.sin(u*Math.PI)*6+(1-u)*2))}p.line(pts,'#A87E44',3.2,1,{sh:1});STYLE.hot(p,x,y,T,20)}
{const qu0=qUnder;qUnder=function(p,id){qu0(p,id);if(FREE)return;for(const d of CELLS[id].doors)if(isDown(d.to)&&!PUZ.cellLocked(id))drawRope(p,id,d.to)}}
{const a0=act;act=function(t){if(t&&t.id==='cuerda'){pullRope(t.to);return}a0(t)}}

/* ══ dibujo de las ramas ══ */
const TRUNKS=(()=>{const n=4,o=[];for(let i=0;i<n;i++)o.push(CL.x0+(i+.5)*(CL.x1-CL.x0)/n);return o})();
const TRUNK_Y=CL.y0-820;
function bez(a,b,c,d,u){const v=1-u;return[v*v*v*a[0]+3*v*v*u*b[0]+3*v*u*u*c[0]+u*u*u*d[0],v*v*v*a[1]+3*v*v*u*b[1]+3*v*u*u*c[1]+u*u*u*d[1]]}
function branchGeom(id,s,anchorDy){const ax=camX+CW[id][0]*s,ay=camY+CW[id][1]*K*s-FOCUS[id]*LIFT*s+anchorDy*s-248*s;
  const tx0=TRUNKS.reduce((b,t)=>Math.abs(t-CW[id][0])<Math.abs(b-CW[id][0])?t:b,TRUNKS[0]),tx=camX+tx0*s,ty=camY+TRUNK_Y*s;
  const dir=(id.charCodeAt(0)+id.charCodeAt(2))%2?1:-1,A=[ax,ay],B=[ax+dir*230*s,ay-230*s],C=[lerp(tx,ax,.55)-dir*320*s,ty+700*s],Dp=[tx,ty];return{A,B,C,D:Dp,dir}}
function branchPoly(G,s,u0,u1,w0,w1,n=18){const L=[],Rr=[],mid=[];for(let k=0;k<=n;k++){const u=lerp(u0,u1,k/n),q=bez(G.A,G.B,G.C,G.D,u),q2=bez(G.A,G.B,G.C,G.D,Math.min(1,u+.01)),q1=bez(G.A,G.B,G.C,G.D,Math.max(0,u-.01)),tx=q2[0]-q1[0],ty=q2[1]-q1[1],l=Math.hypot(tx,ty)||1,nx=-ty/l,ny=tx/l,w=lerp(w0,w1,u)*s/2;
  L.push([q[0]+nx*w,q[1]+ny*w]);Rr.push([q[0]-nx*w,q[1]-ny*w]);mid.push(q)}return{poly:[...L,...Rr.reverse()],L,mid}}
function drawBranch(p,id,s,W,H){const b=BRF()[id]||{},down=isDown(id),weak=!secured(id)?(b.w||0):0,G=branchGeom(id,s,down?0:CDY(id));
  const xs=[G.A[0],G.D[0],G.C[0]],ys=[G.A[1],G.D[1]];if(Math.max(...xs)<-80*s||Math.min(...xs)>W+80*s||Math.min(...ys)>H+40||Math.max(...ys)<-40)return;
  const bark=weak>=.5?'#4A3226':'#4A2E1C',u0=down?.36:0;
  const Pb=branchPoly(G,s,u0,1,26,120);p.cut(Pb.poly,bark,{rough:.6,blur:6,dy:3});p.line(Pb.L,weak>=.5?'#6A5040':'#7A5232',3.4,.85,{exact:true});{const m2=branchPoly(G,s,u0,1,14,50);p.line(m2.L,'#5E3C24',2,.6,{exact:true})}
  /* nudos y hojitas (con savia) */
  const R0=rng('rama'+id);for(let k=0;k<3;k++){const u=u0+.15+R0()*.6,q=bez(G.A,G.B,G.C,G.D,u);p.flat(p.ell(q[0],q[1],3.6,2.4,10),'#2E1A0E',.8)}
  if(!weak&&!down)for(let k=0;k<5;k++){const u=.08+R0()*.5,q=bez(G.A,G.B,G.C,G.D,u),sg=k%2?1:-1;p.cut(p.leaf(q[0]+sg*8*s,q[1],sg>0?-.3:Math.PI+.3,13,5),k%2?'#8FA86A':'#A8BC78',{rough:.2,sh:0})}
  for(let k=0;k<2;k++){const u=u0+.22+k*.24,q=bez(G.A,G.B,G.C,G.D,u),sg=(k%2?1:-1)*G.dir,tip=[q[0]+sg*70*s,q[1]-40*s];p.line([q,[lerp(q[0],tip[0],.5),q[1]-6*s],tip],weak>=.5?'#4A3226':'#4A2E1C',7,1,{sh:1});
    if(!weak&&!down)for(let m=0;m<3;m++)p.cut(p.leaf(tip[0]-sg*m*14*s,tip[1]+m*4*s,sg>0?-.6+m*.3:Math.PI+.6-m*.3,15,6),m%2?'#8FA86A':'#B5C47E',{rough:.2,sh:0});else if(weak>=.5)p.cut(p.leaf(tip[0],tip[1],sg>0?.9:Math.PI-.9,12,5),'#8A6A3A',{rough:.3,sh:0})}
  /* savia: gotas doradas que bajan */
  const sapK=SAP[id]&&T-SAP[id]<4?1-(T-SAP[id])/4:0;if((!weak&&!down&&!STILL)||sapK>0){p.g.save();p.g.globalCompositeOperation='lighter';const n=sapK>0?10:3;for(let k=0;k<n;k++){const u=1-((T*(sapK>0?.35:.08)+k/n)%1),q=bez(G.A,G.B,G.C,G.D,u);p.flat(p.ell(q[0],q[1],3+sapK*5,3+sapK*5,10),'rgba(255,196,90,'+(.35+sapK*.5)+')')}p.g.restore()}
  /* grietas */
  if(weak>=.5&&!down){const n=weak>=.8?4:2;for(let k=0;k<n;k++){const u=.06+k*.07,q=bez(G.A,G.B,G.C,G.D,u),w=lerp(26,120,u)*s*.5,zz=[];for(let m=0;m<=5;m++)zz.push([q[0]-w+m*w*.4,q[1]+(m%2?3:-3)*s]);p.line(zz,'#1A0A04',1.6,.9,{exact:true})}
    if(weak>=.8){p.g.save();p.g.globalCompositeOperation='lighter';const q=bez(G.A,G.B,G.C,G.D,.12);p.flat(p.ell(q[0],q[1],18,10,14),'rgba(230,90,40,'+(.25+.15*Math.sin(T*6))+')');p.g.restore()}}
  /* rama rota: astillas y la raíz de la que cuelga el cuarto */
  if(down){const q=bez(G.A,G.B,G.C,G.D,u0);for(let k=0;k<5;k++)p.line([q,[q[0]+(k-2)*5*s,q[1]+(8+(k%2)*6)*s]],'#6E4A2E',2.2,1,{exact:true});
    const a=[camX+CW[id][0]*s,oyOf(id,s)-248*s],pts=[];for(let k=0;k<=12;k++){const u=k/12,sw=Math.sin(u*Math.PI)*18*s*Math.sin(T*1.3);pts.push([lerp(q[0],a[0],u)+sw,lerp(q[1],a[1],u)])}p.line(pts,'#5A3A22',4.2,1,{sh:1})}}
function drawTrunks(p,s,W,H){for(const t of TRUNKS){const x=camX+t*s,y=camY+TRUNK_Y*s;if(y<-60||x<-200*s||x>W+200*s)continue;const w=58*s;
  p.cut([[x-w,y+30*s],[x+w,y+30*s],[x+w*1.3,-40],[x-w*1.3,-40]],'#3A2416',{rough:.8,blur:8});p.line([[x-w*.6,y],[x-w*.8,-40]],'#5A3A22',4,.7)}}
window.AFTERCELLS=function(s,W,H){if(FREE||inTitle)return;fogSunk(s,W,H);const p=STYLE.Pen(ctx,camX,camY,s,'ramas'+(STILL?0:Math.floor(T*3)),true);
  const hole=cellHole(s);ctx.save();if(hole){ctx.beginPath();ctx.rect(0,0,W,H);ctx.moveTo(...hole[0]);for(const q of hole.slice(1))ctx.lineTo(...q);ctx.closePath();ctx.clip('evenodd')}
  drawTrunks(p,s,W,H);for(const id of DRAW){if(id===cur&&hole)continue;if(!isRisen(id)&&!rising(id))continue;if(RISE[id]&&T<RISE[id].t0)continue;drawBranch(p,id,s,W,H)}ctx.restore();
  if(hole&&isRisen(cur))drawBranch(p,cur,s,W,H)};

/* niebla sobre las celdas que siguen abajo y señales en el mapa */
function fogSunk(s,W,H){
  for(const id of ORDER){const sunk=!isRisen(id)||(RISE[id]&&T<RISE[id].t0+RISE[id].dur);if(!sunk)continue;const ox=camX+CW[id][0]*s,oy=camY+CW[id][1]*K*s+SINK*s*.6;if(ox<-500*s||ox>W+500*s||oy<-300*s||oy>H+500*s)continue;
    const a=RISE[id]?Math.max(0,1-(T-RISE[id].t0)/RISE[id].dur):1;ctx.save();ctx.globalCompositeOperation='lighter';
    const rg=ctx.createRadialGradient(ox,oy,0,ox,oy,300*s);rg.addColorStop(0,`rgba(255,200,130,${.10*a})`);rg.addColorStop(1,'rgba(255,200,130,0)');ctx.fillStyle=rg;ctx.fillRect(ox-300*s,oy-300*s,600*s,600*s);
    if(!STILL)for(let k=0;k<3;k++){const x=ox+Math.sin(T*.2+k*2+id.length)*160*s,y=oy+(k-1)*50*s;const r2=ctx.createRadialGradient(x,y,0,x,y,170*s);r2.addColorStop(0,`rgba(255,236,210,${.05*a})`);r2.addColorStop(1,'rgba(255,236,210,0)');ctx.fillStyle=r2;ctx.fillRect(x-170*s,y-170*s,340*s,340*s)}
    ctx.restore()}}
function fogAndBadges(s){if(FREE||window.R3D&&R3D.on)return;const W=cv.width,H=cv.height;
  if(!(mapMode||Z<ZFN*.8))return;const p=STYLE.Pen(ctx,camX,camY,s,'insig',true);
  for(const id of ORDER){const b=BRF()[id];if(!b||!isRisen(id))continue;const dn=isDown(id),wk=!secured(id)&&b.w>=.5;if(!dn&&!wk&&!b.lost)continue;
    const ox=camX+CW[id][0]*s,oy=oyOf(id,s)-300*s,sz=Math.max(24*s,14*DPR);p.cut(p.ell(ox,oy,sz/s,sz/s,18),dn?'#5A3A22':b.lost&&!wk?'#6A6A78':'#C9563A',{rough:.2,blur:3});
    ctx.save();ctx.font=`700 ${Math.round(sz*1.1)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#FFF4D6';ctx.fillText(dn?'⤓':wk?'⚡':'✕',ox,oy+1);ctx.restore()}}
{const qf0=qFrame;qFrame=function(s){qf0(s);const dt=Math.min(.1,Math.max(0,T-(qFrame.lr||T)));qFrame.lr=T;riseTick(dt);branchTick(dt);fogAndBadges(s)}}

/* ── sonidos: crujido de madera, estallido, rumor de la niebla, latido hondo ── */
function sndCtx(){const d=Sound._dbg();return Sound.on&&d.ac&&d.sfxB&&d.ac.state==='running'?d:null}
function noiseBuf(ac,sec,shape){const n=Math.floor(ac.sampleRate*sec),b=ac.createBuffer(1,n,ac.sampleRate),x=b.getChannelData(0);for(let i=0;i<n;i++)x[i]=(Math.random()*2-1)*shape(i/n);return b}
function creak(v=1){const d=sndCtx();if(!d)return;const ac=d.ac,t=ac.currentTime;const o=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain(),lfo=ac.createOscillator(),lg=ac.createGain();
  o.type='sawtooth';o.frequency.setValueAtTime(95,t);o.frequency.linearRampToValueAtTime(70,t+.9);lfo.frequency.value=38;lg.gain.value=30;lfo.connect(lg);lg.connect(o.frequency);f.type='bandpass';f.frequency.value=700;f.Q.value=4;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.09*v,t+.15);g.gain.exponentialRampToValueAtTime(.0001,t+1);o.connect(f);f.connect(g);g.connect(d.sfxB);o.start(t);lfo.start(t);o.stop(t+1.05);lfo.stop(t+1.05)}
function crack(){const d=sndCtx();if(!d)return;const ac=d.ac,t=ac.currentTime,src=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();src.buffer=noiseBuf(ac,.5,u=>Math.exp(-u*9)*(u<.02?1:.7));f.type='lowpass';f.frequency.value=2400;g.gain.value=.5;src.connect(f);f.connect(g);g.connect(d.sfxB);src.start(t);creak(1.3)}
function rumble(v=1){const d=sndCtx();if(!d)return;const ac=d.ac,t=ac.currentTime,src=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();src.buffer=noiseBuf(ac,2.2,u=>Math.sin(Math.PI*u));f.type='lowpass';f.frequency.value=180;g.gain.value=.55*v;src.connect(f);f.connect(g);g.connect(d.sfxB);src.start(t)}
function deepBeat(){const d=sndCtx();if(!d)return;const ac=d.ac;for(const [dt,fq,gv] of[[0,42,.5],[.34,36,.36]]){const t=ac.currentTime+dt,o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(fq*1.6,t);o.frequency.exponentialRampToValueAtTime(fq,t+.12);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gv,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+.9);o.connect(g);g.connect(d.master);o.start(t);o.stop(t+1)}}

/* ── nivel de la partida: al empezar (creador) y en Ajustes ── */
let difPick='normal';
{const cr=document.querySelector('#creator .crbtns');const box=document.createElement('div');box.className='difbox';box.id='difbox';
  box.innerHTML='<b class="difh">¿Cómo de frágil es la colmena?</b><div class="difs" role="radiogroup"><button data-d="calma" role="radio"><b>Tranquila</b><small>las ramas crujen y se balancean, pero nunca caen</small></button><button data-d="normal" role="radio"><b>Normal</b><small>si tardas mucho, un cuarto puede caer y tendrás que rescatarlo</small></button><button data-d="vertigo" role="radio"><b>Vértigo</b><small>ramas más débiles; un cuarto que cae dos veces se pierde para siempre</small></button></div>';
  cr.before(box);const sync=()=>box.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-checked',b.dataset.d===difPick);b.classList.toggle('on',b.dataset.d===difPick)});
  box.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{difPick=b.dataset.d;sync();Sound.sfx('ui')}));sync();
  const oc0=openCreator;openCreator=function(fromNew){box.hidden=!fromNew;difPick='normal';sync();oc0(fromNew)};
  const sg0=startGame;startGame=function(fresh){sg0(fresh);if(fresh&&!FREE){QF().dif=difPick;QF().risen={};riseInit();save()}bakeBackdrop()}}
{const row=document.createElement('label');row.className='row';row.id='difrow';row.innerHTML='<span>Fragilidad de las ramas<small>se puede cambiar en cualquier momento</small></span><select id="difsel"><option value="calma">Tranquila</option><option value="normal">Normal</option><option value="vertigo">Vértigo</option></select>';
  const imm=document.getElementById('imm').closest('label');imm.after(row);const sel=document.getElementById('difsel');
  const relabel=()=>{[...sel.options].forEach(o=>{o.textContent=_t(DIF[o.value].name)})};
  const sync=()=>{relabel();sel.value=dif();row.hidden=inTitle||FREE};sel.addEventListener('change',()=>{QF().dif=sel.value;save();note(`Ramas: ${DIF[sel.value].name}`)});
  for(const b of['bset','bset2'])document.getElementById(b).addEventListener('click',sync);document.getElementById('lang').addEventListener('change',()=>setTimeout(relabel,0))}
const difCss=document.createElement('style');difCss.textContent=`.difbox{margin:10px 0 4px;text-align:left}.difh{display:block;font-size:15px;margin-bottom:6px}.difs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.difs button{text-align:left;padding:8px 10px;border-radius:10px;border:2px solid #E3C98E;background:#FFF9EC;cursor:pointer;font:inherit;color:inherit}.difs button b{display:block;font-size:15px}.difs button small{display:block;font-size:12px;line-height:1.3;opacity:.8}
.difs button.on{border-color:#C47A2C;background:#FBE7B4}@media (max-width:620px){.difs{grid-template-columns:1fr}}`;document.head.appendChild(difCss);
DOM_SKIP.add('difsel');

/* ── partida cargada o recorrido libre ── */
setTimeout(()=>{riseInit();bakeBackdrop();for(const id of ORDER){const b=BRF()[id];if(b&&b.down)FALL[id]=null}},0);
{const r0=resetGame;resetGame=function(silent){r0(silent);for(const k in RISE)delete RISE[k];for(const k in FALL)delete FALL[k];for(const k in PULL)delete PULL[k]}}
{const ef0=endFree;endFree=function(){ef0();riseInit()}}

/* ══ LOGROS ══ */
ACH.push(['rescate','Cuerda firme','Sube un cuarto que cayó a la niebla'],['vertigo','Nadie se quedó atrás','Termina en Vértigo sin perder ningún cuarto'],['arriba','Hay algo más arriba','Mira hacia arriba en el final completo']);

/* ══ LOS FINALES: los cuartos perdidos y, en el final completo, mirar hacia arriba ══ */
{const se0=showEnding;showEnding=function(k,title,lines,after){if(!/^Final/.test(k))return se0(k,title,lines,after);
  const lost=ORDER.filter(id=>BRF()[id]&&BRF()[id].lost),L=lines.slice(),at=L.findIndex(l=>l.startsWith('—'));
  if(lost.length){const i=L.indexOf('La colmena florece entera.');if(i>=0)L[i]='La colmena florece, aunque no entera.'}
  if(lost.length)L.splice(at<0?L.length:at,0,_t('No todas las ramas aguantaron.')+' '+lost.map(id=>_t(SEASON[id].name)).join(LANG==='zh'?'、':', ')+' '+_t(lost.length>1?'quedaron más abajo, en la niebla.':'quedó más abajo, en la niebla.'));
  else if(dif()==='vertigo')achieve('vertigo');
  if(k==='Final completo'&&!hookBusy){hookBusy=true;playHook(()=>{hookBusy=false;se0(k,title,L,after)});return}
  return se0(k,title,L,after)}}
let hookBusy=false;
/* la cámara sube por primera vez: la colmena cuelga de algo gigantesco, y no es la única */
function playHook(done){const c=document.createElement('canvas');c.id='hook';c.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:7;background:#0E0A14';document.getElementById('stage').appendChild(c);
  const cap=document.createElement('p');cap.className='hookcap';cap.style.cssText='position:absolute;left:0;right:0;bottom:12%;text-align:center;z-index:8;color:#FFF1D2;font:italic 400 clamp(20px,3.4vw,40px) Fraunces,Georgia,serif;text-shadow:0 2px 20px #000;opacity:0;transition:opacity 1.2s;padding:0 8%';document.getElementById('stage').appendChild(cap);
  const skip=document.createElement('button');skip.textContent=_t('Saltar');skip.style.cssText='position:absolute;right:16px;bottom:16px;z-index:9;opacity:.7';document.getElementById('stage').appendChild(skip);
  const W=c.width=Math.round(c.clientWidth*DPR),H=c.height=Math.round(c.clientHeight*DPR),g=c.getContext('2d'),R0=rng('arriba'),t0=performance.now(),DUR=11.5;
  const hives=[...Array(34)].map((_,i)=>({x:R0(),y:.25+R0()*.75,d:.25+R0()*.75,n:3+Math.floor(R0()*5),ph:R0()*6}));hives.push({x:.5,y:.72,d:1.35,n:9,me:true,ph:0});hives.sort((a,b)=>a.d-b.d);
  const faller=hives.find(h=>!h.me&&h.d>.5&&h.x>.62)||hives[3];let beat2=false,end=false;
  const hexAt=(x,y,r,col,al=1)=>{g.globalAlpha=al;g.fillStyle=col;g.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3+Math.PI/6;k?g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r*.62):g.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r*.62)}g.closePath();g.fill();g.globalAlpha=1};
  achieve('arriba');deepBeat();setTimeout(()=>{cap.textContent=_t('La colmena no está sola.');cap.style.opacity=1},1800);setTimeout(()=>{cap.style.opacity=0},5600);
  setTimeout(()=>{cap.textContent=_t('Algo mucho más grande late ahí arriba.');cap.style.opacity=1},6600);
  const finish=()=>{if(end)return;end=true;c.remove();cap.remove();skip.remove();done()};skip.addEventListener('click',finish);
  (function loop(){if(end)return;const u=Math.min(1,(performance.now()-t0)/1000/DUR),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,zoom=lerp(2.6,1,e),camy=lerp(.62,.18,e);
    const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#05040A');sky.addColorStop(.5,'#1A1230');sky.addColorStop(1,'#3A2A40');g.fillStyle=sky;g.fillRect(0,0,W,H);
    for(let k=0;k<120;k++){const x=(k*137.5%1000)/1000*W,y=(k*71.3%1000)/1000*H*.6;g.fillStyle=`rgba(255,246,220,${.25+.25*Math.sin(k+u*6)})`;g.fillRect(x,y,1.5*DPR,1.5*DPR)}
    const X=(x,d)=>W/2+(x-.5)*W*zoom*d*1.1,Yp=(y,d)=>H/2+(y-camy)*H*zoom*d*1.3;
    /* el árbol colosal: troncos y ramas desde lo alto */
    g.strokeStyle='#120C10';g.lineCap='round';const bough=(x0,x1,y1,w,d)=>{const a=[X(x0,d),-40],b=[X(x1,d),Yp(y1,d)];for(let k=0;k<6;k++){const u0=k/6,u1=(k+1)/6,P=u=>[lerp(a[0],b[0],u)+Math.sin(u*3.2+x0*9)*60*DPR*zoom*d,lerp(a[1],b[1],u*u*.6+u*.4)];g.lineWidth=w*DPR*zoom*d*(1-u0*.75);g.beginPath();g.moveTo(...P(u0));g.lineTo(...P(u1));g.stroke()}};
    for(const [x0,x1,y1,w] of[[.12,.3,.16,70],[.3,.08,.2,50],[.5,.55,.14,110],[.52,.78,.22,60],[.7,.95,.18,70],[.88,.62,.24,44],[.4,.3,.3,30],[.62,.7,.32,28]])bough(x0,x1,y1,w,.95);
    for(const h of hives){const hx=h===faller&&u>.55?h.x:h.x,fallY=h===faller&&u>.55?Math.pow((u-.55)/.45,2)*.9:0,x=X(hx,h.d),y=Yp(h.y+fallY,h.d),r=(h.me?46:22)*DPR*zoom*h.d;
      const col=h.me?'#E4A844':`rgb(${Math.round(60+90*h.d)},${Math.round(40+60*h.d)},${Math.round(40+30*h.d)})`;
      if(!(h===faller&&u>.55)){g.strokeStyle='#1A1210';g.lineWidth=Math.max(1,6*DPR*h.d*zoom*.6);g.beginPath();g.moveTo(x,y-r*.5);g.quadraticCurveTo(x+Math.sin(h.ph)*40*DPR,y-H*.25*h.d,X(Math.round(h.x*3)/3,h.d),-10);g.stroke()}
      for(let k=0;k<h.n;k++){const a=k/h.n*TAU+h.ph,rr=k?r*1.05:0;hexAt(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.62,r*.55,col,h.me?1:.5+.5*h.d);if(!h.me&&R0()<.02){}}
      if(h.me||h.d>.7){g.save();g.globalCompositeOperation='lighter';const rg=g.createRadialGradient(x,y,0,x,y,r*2.2);rg.addColorStop(0,h.me?'rgba(255,200,110,.45)':'rgba(255,190,120,.18)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(x-r*2.2,y-r*2.2,r*4.4,r*4.4);g.restore()}}
    /* niebla abajo */
    const fog=g.createLinearGradient(0,H*.7,0,H);fog.addColorStop(0,'rgba(236,222,200,0)');fog.addColorStop(1,'rgba(236,222,200,.55)');g.fillStyle=fog;g.fillRect(0,H*.6,W,H*.4);
    if(u>.55&&!beat2){beat2=true;deepBeat();crack()}
    if(u>=1){setTimeout(finish,2200);return}requestAnimationFrame(loop)})()}
{const ot0=openTitle;openTitle=function(){ot0();bakeBackdrop()}}
{const sf0=startFree;startFree=function(){sf0();bakeBackdrop()}}
/* en un cuarto en peligro la música se encoge y dejan oírse los crujidos */
let dangerMus=false;
{const qf0=qFrame;qFrame=function(s){qf0(s);if(typeof VOLN==='undefined'||!VOLN.done)return;const b=BRF()[cur],d=!FREE&&!!b&&!secured(cur)&&b.w>=.5&&!inTitle;if(d===dangerMus)return;dangerMus=d;
  const g=VOLN.mus[cur];if(g){const ac=Sound._dbg().ac;g.gain.setTargetAtTime(OPT.vm*(d?.5:1),ac.currentTime,.8)}}}
{const c0=cross;cross=function(d){if(dangerMus&&typeof VOLN!=='undefined'&&VOLN.mus[cur]){const ac=Sound._dbg().ac;VOLN.mus[cur].gain.setTargetAtTime(OPT.vm,ac.currentTime,.5)}dangerMus=false;return c0(d)}}
