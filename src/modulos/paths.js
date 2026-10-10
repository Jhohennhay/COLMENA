/* ══════════ CAMINOS ENTRE RACIMOS ══════════
   Las celdas pegadas se comunican por una puerta; los racimos lejanos, por un camino
   que cruza el vacío. Cada camino es de un material distinto y se recorre a su manera:
   el puente se hunde bajo tus pies, el tren te lleva sentado, las piedras y el hielo
   se cruzan a saltos, las escaleras suben y bajan escalón a escalón. */
const PATH_OF={'col-pri':'puente','oce-pri':'muelle','esp-ver':'escalera','esp-tea':'tren','des-ver':'arena','oto-sot':'cera','dsv-inv':'piedras','ant-inv':'hielo','cor-est':'raices'};
const PATH_NAME={puente:'Puente colgante',muelle:'Muelle',escalera:'Escalera al cielo',tren:'Vía del tren nocturno',arena:'Camino de arena',cera:'Escalera de cera',piedras:'Sendero de piedras',hielo:'Puente de hielo',raices:'Sendero de raíces'};
const PATH_SPEED={tren:260,puente:130,piedras:120,hielo:120};
const PATHS=[],PARK={},TRAIL={};
function buildPaths(){PATHS.length=0;
  for(const a of ORDER)for(const d of CELLS[a].doors){if(!d.span||d.span<2||a>d.to)continue;const b=d.to,bd=CELLS[b].doors.find(x=>x.to===a);
    const out=(c,dd)=>[CW[c][0]+dd.mid[0]-dd.n[0]*(TH+4),CW[c][1]+dd.mid[1]-dd.n[1]*(TH+4)];
    const p0=out(a,d),p1=out(b,bd),L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]),u=[(p1[0]-p0[0])/L,(p1[1]-p0[1])/L],v=[-u[1],u[0]];
    const key=[a,b].sort().join('-'),type=PATH_OF[key]||'puente',n=Math.max(6,Math.round(L/26));
    PATHS.push({a,b,key,type,p0,p1,L,u,v,n,near:v[1]>=0?1:-1,box:[Math.min(p0[0],p1[0])-120,Math.min(p0[1],p1[1])*K-170,Math.max(p0[0],p1[0])+120,Math.max(p0[1],p1[1])*K+120]})}}
/* un punto del camino: t a lo largo, w a lo ancho, z en altura */
const PT=(P,t,w,z=0)=>[P.p0[0]+P.u[0]*P.L*t+P.v[0]*w,P.p0[1]+P.u[1]*P.L*t+P.v[1]*w,z];
const sm01=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
/* piedras y témpanos: dónde está cada uno */
const STONES=P=>{const m=Math.round(P.n*(P.type==='hielo'?.7:.6)),o=[];for(let i=0;i<m;i++)o.push([(i+.5)/m,P.type==='hielo'?Math.sin(i*2.1)*10:Math.sin(i*1.7)*16]);return o};
/* la altura del suelo del camino (sin nadie encima) */
const SAG=t=>-34*Math.sin(Math.PI*t);
/* dónde va el viajero en cada tipo de camino: desplazamiento lateral y altura */
function riderAt(P,t){const n=P.n,edge=Math.min(1,t*P.L/45,(1-t)*P.L/45);let w=0,z=0,hop=0;
  if(P.type==='puente')z=SAG(t)-10;
  else if(P.type==='escalera'){const i=Math.min(n-1,Math.floor(t*n)),f=t*n-i;z=Math.sin(Math.PI*i/n)*70+Math.sin(Math.PI*f)*4;hop=i}
  else if(P.type==='cera'){const i=Math.min(n-1,Math.floor(t*n)),f=t*n-i;z=-Math.sin(Math.PI*i/n)*50+Math.sin(Math.PI*f)*3;hop=i}
  else if(P.type==='tren')z=12;
  else if(P.type==='arena')w=Math.sin(t*9+1)*10;
  else if(P.type==='raices'){w=Math.sin(t*12)*8;z=-Math.sin(Math.PI*t)*20+4}
  else if(P.type==='piedras'||P.type==='hielo'){const S=[[0,0],...STONES(P),[1,0]];let j=0;while(j<S.length-2&&t>S[j+1][0])j++;const a=S[j],b=S[j+1],f=clamp((t-a[0])/Math.max(1e-4,b[0]-a[0]),0,1);
    w=lerp(a[1],b[1],f);z=Math.sin(Math.PI*f)*(P.type==='hielo'?13:16);hop=j;if(P.type==='hielo'&&j>0&&j<S.length-1)z+=Math.sin(T*1.3+j-1)*2}
  return{t,w:w*edge,z:z*(P.type==='tren'?sm01(edge*1.4):edge),hop}}
/* el recorrido completo: del cuarto al camino, el camino, y del camino al otro cuarto */
function crossPlan(from,to,a,b){const key=[from,to].sort().join('-'),P=PATHS.find(p=>p.key===key);if(!P)return null;
  const fwd=P.a===from,s=fwd?P.p0:P.p1,e=fwd?P.p1:P.p0,sp=PATH_SPEED[P.type]||150;
  const d1=Math.max(.25,Math.hypot(s[0]-a[0],s[1]-a[1])/170),d2=P.L/sp,d3=Math.max(.25,Math.hypot(b[0]-e[0],b[1]-e[1])/170);
  if(P.type==='tren'){PARK[key]=PARK[key]??.5}
  return{P,fwd,s,e,d1,d2,d3,dur:d1+d2+d3+(P.type==='tren'?.5:0)}}
/* posición en el instante τ del cruce: [x, y, z, sobre el camino, dx, sentado] */
function crossAt(cr){const pl=cr.plan,tau=cr.t,P=pl.P;
  if(tau<pl.d1){const u=sm01(tau/pl.d1)*.15+tau/pl.d1*.85;return{x:lerp(cr.a[0],pl.s[0],u),y:lerp(cr.a[1],pl.s[1],u),z:0,on:false,dx:pl.s[0]-cr.a[0],phase:1,u}}
  const wait=P.type==='tren'?.5:0,t2=tau-pl.d1;
  if(t2<pl.d2+wait){const u=P.type==='tren'?sm01(Math.max(0,t2-wait*.6)/pl.d2):clamp(t2/pl.d2,0,1),pt=pl.fwd?u:1-u,r=riderAt(P,pt),q=PT(P,pt,r.w);
    return{x:q[0],y:q[1],z:r.z,on:true,dx:(pl.e[0]-pl.s[0]),phase:2,pt,r,u,seated:P.type==='tren'&&t2>wait*.4}}
  const u=clamp((t2-pl.d2-wait)/pl.d3,0,1);return{x:lerp(pl.e[0],cr.b[0],u),y:lerp(pl.e[1],cr.b[1],u),z:0,on:false,dx:cr.b[0]-pl.e[0],phase:3,u,done:u>=1}}
/* sonidos del camino: tablones, saltos, silbato */
function crossSound(cr,q){const P=cr.plan.P;if(q.phase!==2){cr.lastHop=null;return}
  if(cr.lastHop==null){cr.lastHop=-1;if(P.type==='tren')Sound.sfx('whistle')}
  if(q.r&&q.r.hop!==cr.lastHop&&cr.lastHop!==-1){if(P.type==='escalera'||P.type==='cera')Sound.sfx('plank',.5);else if(P.type==='piedras'||P.type==='hielo')Sound.sfx('hop',P.type==='hielo'?1:0)}
  if(q.r)cr.lastHop=q.r.hop;
  if(P.type==='puente'||P.type==='muelle'){const k=Math.floor(cr.t*2.6);if(k!==cr.creak){cr.creak=k;if(k%2===0)Sound.sfx('plank',.35)}}}

function drawPath(p,P,T,open,R,rider){
  const W=(t,w,z)=>p.W(PT(P,t,w,z)),s=p.s,n=P.n,R0=rng(P.key),g=p.g,nr=P.near;
  const quad=(t0,t1,w0,w1,z0,z1,col,o={})=>p.cut([W(t0,w0,z0),W(t1,w0,z1),W(t1,w1,z1),W(t0,w1,z0)],col,o);
  const wall=(t0,t1,w,z0,z1,col,o={})=>p.cut([W(t0,w,z0),W(t1,w,z0),W(t1,w,z1),W(t0,w,z1)],col,o);
  const end=(t,w0,w1,z0,z1,col,o={})=>p.cut([W(t,w0,z0),W(t,w1,z0),W(t,w1,z1),W(t,w0,z1)],col,o);
  g.save();if(!open)g.globalAlpha=.55;
  /* sombra sobre el vacío */
  {const t0=Math.min(.45,90/P.L+.12),t1=1-t0;if(t1>t0){g.save();g.filter=`blur(${8*s}px)`;p.flat([W(t0,-40,-50),W(t1,-40,-50),W(t1,40,-50),W(t0,40,-50)],'rgba(20,10,5,.30)');g.restore()}}
  const T2=STILL?0:T,rt=R?R.t:-9,near=t=>R?Math.max(0,1-Math.abs(t-rt)*P.L/55):0;
  if(P.type==='puente'){const sw=R?Math.sin(T2*5)*1.6:Math.sin(T2*.8)*.6,dip=t=>SAG(t)-(R?11*Math.exp(-(((t-rt)*P.L/70)**2)):0);
    const rail=w=>p.line([...Array(21)].map((_,i)=>W(i/20,w+sw,dip(i/20)*.7+44)),'#8A6A4A',2.2,1,{sh:1});
    const hangers=w=>{for(let i=1;i<20;i+=2){const t=i/20;p.line([W(t,w,dip(t)),W(t,w+sw,dip(t)*.7+44)],'#8A6A4A',1,.8)}};
    rail(-38*nr);hangers(-38*nr);
    for(let i=0;i<n;i++){const t0=i/n+.006,t1=(i+1)/n-.006,b=near((t0+t1)/2)*2;quad(t0,t1,-34,34,dip(t0)-b,dip(t1)-b,i%3?'#C9924E':'#B57E3E',{blur:2,rough:.3})}
    if(R)rider();rail(38*nr);hangers(38*nr)}
  else if(P.type==='muelle'){for(let i=0;i<8;i++){const t=(i+.5)/8;for(const w of[-30,30])p.line([W(t,w,0),W(t,w,-70)],'#6E4A2E',4,1,{sh:1})}
    for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n-.004,b=near((t0+t1)/2)*2.4;quad(t0,t1,-36,36,-b,-b,i%2?'#B0875A':'#A07A50',{blur:2,rough:.2})}
    for(let k=0;k<6;k++){const t=((T2*.05+k/6)%1),q=W(t,rd(R0,-80,80),-72);p.flat(p.ell(q[0],q[1],14,4,14),'rgba(180,230,240,.35)')}
    if(R){for(let k=0;k<3;k++){const u=((T2*.9+k/3)%1),q=W(rt,0,-72);const E=p.ell(q[0],q[1],10+u*40,3+u*10,20);p.line([...E,E[0]],'rgba(220,245,250,.8)',1.2,(1-u)*.8)}rider()}}
  else if(P.type==='escalera'){const zs=t=>Math.sin(Math.PI*t)*70;
    for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,z=zs(t0),lit=near(t0+.5/n);quad(t0,t1,-32,32,z,z,i%2?'#E9E4F4':'#D6D0EA',{blur:3,rough:.2});quad(t0,t0+.004,-32,32,z-10,z,'#A8A0C8',{sh:0,rough:0});
      if(lit>0){g.save();g.globalCompositeOperation='lighter';const c=W((t0+t1)/2,0,z);p.flat(p.ell(c[0],c[1],30,12,18),'rgba(255,240,200,.35)',lit);g.restore()}}
    for(let k=0;k<14;k++){const t=rd(R0,0,1),q=W(t,rd(R0,-70,70),Math.sin(Math.PI*t)*70+rd(R0,20,90)),tw=(Math.sin(T2*3+k)+1)/2,b=1+near(t)*1.5;p.flat(p.ell(q[0],q[1],(1.4+tw*1.6)*b,(1.4+tw*1.6)*b,8),'#FFF6D8',.5+tw*.5)}
    if(R)rider()}
  else if(P.type==='tren'){for(let i=0;i<n*1.4;i++){const t=i/(n*1.4);quad(t,t+.012,-34,34,0,0,'#6E4A2E',{sh:0,rough:.2})}
    for(const w of[-20,20])p.line([W(0,w,4),W(1,w,4)],'#9AA0B0',3,1,{sh:1});
    /* el vagón: si vas montado, va contigo; si no, espera en el andén donde lo dejaste */
    const dl=34/P.L,ct=clamp(R?rt:(rider&&rider.carT!=null?rider.carT:(PARK[P.key]??.5)),dl+.01,1-dl-.01),a0=ct-dl,a1=ct+dl,far=-26*nr,nw=26*nr,rock=R?Math.sin(T2*14)*.8:0;
    const nearEnd=P.u[1]<0?a0:a1,farEnd=nearEnd===a0?a1:a0;
    quad(a0,a1,-26,26,8,8,'#2E3561',{blur:4});wall(a0,a1,far,8,44+rock,'#3A4278',{blur:3});end(farEnd,-26,26,8,44+rock,'#343C6E');
    {const c=W(farEnd,0,44);p.line([c,[c[0],c[1]-18*s]],'#2A305C',5);}
    if(R)rider();
    wall(a0,a1,nw,8,26+rock,'#4A548E',{blur:2});end(nearEnd,-26,26,8,26+rock,'#434B82');
    for(const tt of[a0+dl*.5,a1-dl*.5])p.line([W(tt,-27,27),W(tt,27,27)],'#C9A05C',1.4,.8);
    const head=W(nearEnd,0,20);p.flat(p.ell(head[0],head[1],6,6,12),'#F6D98A');g.save();g.globalCompositeOperation='lighter';p.flat(p.ell(head[0],head[1],22,12,16),'rgba(255,230,150,.25)');g.restore();
    const q0=W(farEnd,0,64);for(let k=0;k<3;k++){const u=(T2*(R?1.4:.5)+k/3)%1;p.flat(p.ell(q0[0]-u*20*s,q0[1]-u*30*s,4+u*8,4+u*8,12),'#E9E4F4',(1-u)*.6)}}
  else if(P.type==='arena'){const pts=[],pts2=[];for(let i=0;i<=24;i++){const t=i/24,wig=Math.sin(t*9+1)*10;pts.push(W(t,-40+wig,0));pts2.unshift(W(t,40+wig,0))}p.cut([...pts,...pts2],'#E9C98E',{blur:3,rough:1.2});
    /* huellas: aparecen detrás de ti y el viento las borra poco a poco */
    const tr=TRAIL[P.key];if(R||tr){const k0=R?(rider.fwd?0:rt):(tr.fwd?0:0),k1=R?(rider.fwd?rt:1):1,al=R?1:Math.max(0,1-(T-tr.t0)/14);
      if(al>0)for(let i=0;i<24;i++){const t=(i+.5)/24;if(t<k0||t>k1)continue;const q=W(t,(i%2?-6:6)+Math.sin(t*9+1)*10,1);p.flat(p.ell(q[0],q[1],4,2,10),'#B8905A',al*.8)}}
    for(let k=0;k<4;k++){const t=rd(R0,.1,.9),q=W(t,rd(R0,-60,60),0);p.cut([[q[0]-8*s,q[1]],[q[0],q[1]-22*s],[q[0]+3*s,q[1]]],'#6F8D5E',{sh:0,rough:.3})}
    if(R){for(let k=0;k<4;k++){const u=(T2*1.6+k/4)%1,q=W(rt,Math.sin(rt*9+1)*10,2);p.flat(p.ell(q[0]-(rider.fwd?1:-1)*u*18*s,q[1]-u*6*s,2+u*5,1.4+u*3,10),'#F3DDB0',(1-u)*.7)}rider()}}
  else if(P.type==='cera'){const zs=t=>-Math.sin(Math.PI*t)*50;
    for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,z=zs(t0);quad(t0,t1,-34,34,z,z,i%2?'#F0C060':'#E4A844',{blur:2,rough:.3});quad(t0,t0+.005,-34,34,z-12,z,'#C98A3A',{sh:0,rough:0})}
    for(let k=0;k<7;k++){const t=rd(R0,.1,.9),z=zs(t),q=W(t,rd(R0,-30,30),z),sp=1+near(t)*2,dr=((T2*.4*sp+k/7)%1);p.flat(p.ell(q[0],q[1]+dr*30*s,2.4,3.4,8),'#E4A844',1-dr)}
    if(R)rider()}
  else if(P.type==='piedras'){P.stones=P.stones||STONES(P);P.stones.forEach(([t,w],i)=>{const d=near(t)>.6&&R&&R.z<3?3:0,q=W(t,w,-d);p.cut(p.ell(q[0],q[1],20+((i*7)%5)-2,10,14),i%2?'#C9C0B0':'#B8AE9C',{blur:3,rough:1});
      if(i%2){const g2=W(t,w+30,0);for(let k=0;k<3;k++)p.line([g2,[g2[0]+(k-1)*4*s,g2[1]-12*s]],'#6F8D5E',1.6)}});
    if(R)rider()}
  else if(P.type==='hielo'){P.stones=P.stones||STONES(P);P.stones.forEach(([t,w],i)=>{const d=near(t)>.6&&R&&R.z<4?4:0,bob=Math.sin(T2*1.3+i)*2-d,q=W(t,w,bob);const H=hexV(24,0,0).map(v=>[q[0]+v[0]*s,q[1]+v[1]*s*.55]);
      p.cut(H,i%2?'#DDEFF5':'#EEF7FA',{blur:3,rough:.3});p.flat(H.map(v=>[v[0],v[1]+5*s]).slice(0,4),'rgba(140,190,210,.4)');
      if(d){const E=p.ell(q[0],q[1]+4*s,30,9,20);p.line([...E,E[0]],'rgba(230,248,255,.8)',1.2,.7)}});
    if(R)rider()}
  else if(P.type==='raices'){for(const w of[-24,0,24]){const pts=[...Array(25)].map((_,i)=>{const t=i/24;return W(t,w+Math.sin(t*12+w)*8,-Math.sin(Math.PI*t)*20)});p.line(pts,'#6E4A2E',w?6:9,1,{sh:1})}
    for(let k=0;k<9;k++){const t=(k+.5)/9,q=W(t,Math.sin(t*12)*8,-Math.sin(Math.PI*t)*20+4),pu=Math.max((Math.sin(T2*2.2-k*.6)+1)/2*.8,near(t)*1.2);p.flat(p.ell(q[0],q[1],3+pu*4,3+pu*4,10),'#F0C060',.4+Math.min(1,pu)*.6);
      if(pu>.9){g.save();g.globalCompositeOperation='lighter';p.flat(p.ell(q[0],q[1],18,10,14),'rgba(255,200,90,.3)');g.restore()}}
    if(R)rider()}
  g.restore()}
/* ¿se ve el camino en pantalla? */
function pathVisible(P,s,W,H){const b=P.box;return camX+b[2]*s>0&&camX+b[0]*s<W&&camY+b[3]*s>0&&camY+b[1]*s<H}
function drawPaths(s,W,H){if(!PATHS.length)return;const boil=STILL?0:Math.floor(T*4),pn=STYLE.Pen(ctx,camX,camY,s,'caminos'+boil,true);
  const cr=crossing&&crossing.plan?crossing:null;
  for(const P of PATHS){if(!pathVisible(P,s,W,H)){unfoldTick(P,PUZ.open(P.a,P.b),false);continue}const open=PUZ.open(P.a,P.b)&&!(PUZ.cellLocked(P.a)||PUZ.cellLocked(P.b));
    const mine=cr&&cr.plan.P===P,q=mine?cr.q:null,R=q&&q.on?q.r:null;
    /* el vagón viene a buscarte mientras caminas hacia el andén */
    const info={fwd:mine&&cr.plan.fwd,carT:null};
    if(mine&&P.type==='tren'&&q&&!q.on){const st=cr.plan.fwd?0:1,en=1-st;info.carT=q.phase===1?lerp(PARK[P.key]??.5,st,sm01(q.u)):en}
    const rider=()=>{if(!R)return;const pos=PT(P,R.t,R.w),edge=clamp(1-Math.min(R.t,1-R.t)*P.L/70,0,1),lift=FOCUS[cur]*LIFT*s*edge,rp=STYLE.Pen(ctx,camX,camY-lift,s,'rider',true,true);
      STYLE.player(rp,pos[0],pos[1]-R.z/K,0,Pl.f,T,!q.seated)};
    rider.fwd=info.fwd;rider.carT=info.carT;
    const U=unfoldTick(P,open,mine);withUnfold(pn,P,U,()=>drawPath(pn,P,T,open,R,rider))}}
/* ══════════ UMBRALES · el camino nace de la puerta ══════════
   Cada puerta que da a un camino tiene su umbral del mismo material, con dos farolas
   que se encienden al acercarte. El camino está plegado dentro de la puerta y se
   despliega tramo a tramo cuando llegas; al irte se vuelve a plegar. */
const PMAT={puente:{c:['#C9924E','#B57E3E'],post:'#8A6A4A',glow:'#FFD36A',icon:'≋'},muelle:{c:['#B0875A','#A07A50'],post:'#6E4A2E',glow:'#FFE3A0',icon:'⚓'},
  escalera:{c:['#E9E4F4','#D6D0EA'],post:'#8A7AA8',glow:'#FFF6D8',icon:'✦'},tren:{c:['#5E6B7A','#6E4A2E'],post:'#2E3561',glow:'#F6D98A',icon:'◉'},
  arena:{c:['#E9C98E','#DDB878'],post:'#B8905A',glow:'#FFD9A0',icon:'∴'},cera:{c:['#F0C060','#E4A844'],post:'#C98A3A',glow:'#FFE08A',icon:'⬡'},
  piedras:{c:['#C9C0B0','#B8AE9C'],post:'#8A8070',glow:'#FFE9B0',icon:'◦'},hielo:{c:['#DDEFF5','#EEF7FA'],post:'#8FB6C8',glow:'#CFEFFF',icon:'❄'},
  raices:{c:['#6E4A2E','#8A5A34'],post:'#5A3A22',glow:'#F0C060',icon:'❦'}};
const pathTypeOf=(a,b)=>PATH_OF[[a,b].sort().join('-')]||'puente';
const pathZ=(P,t)=>P.type==='puente'?SAG(t):P.type==='escalera'?Math.sin(Math.PI*t)*70:P.type==='cera'?-Math.sin(Math.PI*t)*50:P.type==='raices'?-Math.sin(Math.PI*t)*20:0;
const UNF={};
/* cuánto está desplegado cada camino desde cada extremo */
function unfoldTick(P,open,mine){const U=UNF[P.key]||(UNF[P.key]={a:0,b:0,t:T});const dt=Math.min(.1,Math.max(0,T-U.t));U.t=T;
  const full=mapMode||inTitle||mine||(crossing&&crossing.plan&&crossing.plan.P===P);
  const nearEnd=c=>{if(cur!==c||!open)return 0;const d=CELLS[c].doors.find(x=>x.to===(c===P.a?P.b:P.a));if(!d)return 0;return Math.hypot(Pl.x-d.trig[0],Pl.y-d.trig[1])<170?1:0};
  for(const [k,c] of[['a',P.a],['b',P.b]]){const tg=full?1:nearEnd(c);if(STILL)U[k]=tg;else U[k]=tg>U[k]?Math.min(tg,U[k]+dt*1.5):Math.max(tg,U[k]-dt*.9)}return U}
/* recorta el dibujo del camino a los tramos desplegados */
function hull(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
  for(const p of pts){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}
  up.pop();lo.pop();return lo.concat(up)}
function bandPoly(p,P,t0,t1){const o=[];for(const t of[t0,t1])for(const w of[-150,150])for(const z of[-150,180])o.push(p.W(PT(P,t,w,z)));return hull(o)}
function withUnfold(p,P,U,draw){const g=p.g,a=U.a,b=U.b;if(a+b>=.999){draw();return}if(a<.002&&b<.002)return;
  g.save();g.beginPath();for(const [t0,t1] of[[0,a],[1-b,1]]){if(t1-t0<.002)continue;const H=bandPoly(p,P,t0,t1);H.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath()}g.clip();draw();g.restore();
  /* la hoja que se está desplegando */
  const M=PMAT[P.type]||PMAT.puente,s=p.s;for(const [u,dir] of[[a,1],[1-b,-1]]){if(u<=.004||u>=.996||(dir<0&&b<.004)||(dir>0&&a<.004))continue;const z0=pathZ(P,u),L=Math.min(.08,46/P.L)*dir,lift=24;
    const Q=[p.W(PT(P,u,-34,z0)),p.W(PT(P,u,34,z0)),p.W(PT(P,u+L*.45,34,z0+lift)),p.W(PT(P,u+L*.45,-34,z0+lift))];p.cut(Q,M.c[0],{blur:3,rough:.2});p.line([Q[0],Q[1]],shade(M.c[0].length===7?M.c[0]:'#C9924E',.8),1,.6);
    g.save();g.globalCompositeOperation='lighter';const c=p.W(PT(P,u,0,z0+10));p.flat(p.ell(c[0],c[1],24,10,16),'rgba(255,236,170,.28)');g.restore()}}
/* el umbral de una puerta delantera que lleva a un camino */
function drawThreshold(p,id,d,lit,open){const s=p.s,e=d.e,M=PMAT[pathTypeOf(id,d.to)],out=[-d.n[0],-d.n[1]];
  const pt=(V,u)=>[lerp(V[e[0]][0],V[e[1]][0],u),lerp(V[e[0]][1],V[e[1]][1],u)],u0=.5-DOOR_W*.95,u1=.5+DOOR_W*.95,a=pt(VI,u0),b=pt(VI,u1),ao=pt(VO,u0),bo=pt(VO,u1),X=(q,k,z)=>p.P(q[0]+out[0]*k,q[1]+out[1]*k,z);
  p.cut([X(a,0,.6),X(b,0,.6),X(bo,10,.6),X(ao,10,.6)],M.c[0],{blur:3,rough:.2});for(let k=1;k<4;k++)p.line([X(a,k*8,.8),X(b,k*8,.8)],M.c[1],1.2,.55);
  const h=50;for(const q of[ao,bo]){p.line([X(q,2,0),X(q,2,h)],M.post,4.2,1,{sh:1});const c=X(q,2,h+6),on=open?lit:0;
    p.cut([[c[0]-4.2*s,c[1]-5*s],[c[0]+4.2*s,c[1]-5*s],[c[0]+4.8*s,c[1]+5*s],[c[0]-4.8*s,c[1]+5*s]],M.post,{blur:2,rough:.1});p.cut([[c[0]-5.2*s,c[1]-5*s],[c[0]+5.2*s,c[1]-5*s],[c[0],c[1]-10*s]],shade(M.post.length===7?M.post:'#6E4A2E',.8),{sh:0,rough:.1});
    p.flat(p.ell(c[0],c[1],2.8,3.6,10),on>.05?M.glow:'#8A7A6A',on>.05?.4+.6*on:1);
    if(on>.05){p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(c[0],c[1],22,16,18),M.glow,.22*on);p.flat(p.ell(...X(q,12,0),30,12,18),M.glow,.14*on);p.g.restore()}}
  const arc=[];for(let k=0;k<=12;k++){const u=k/12,q=[lerp(ao[0],bo[0],u),lerp(ao[1],bo[1],u)];arc.push(X(q,2,h+10+Math.sin(Math.PI*u)*12))}p.line(arc,M.post,2.6);
  const m=X(pt(VO,.5),2,h+26);p.cut(p.ell(m[0],m[1],7,7,16),M.post,{blur:2,rough:.2});p.text(M.icon,m[0],m[1]+.5*s,8,open&&lit>.05?M.glow:'#EDE3CF',{w:400})}
/* farolas a los lados de una puerta del fondo */
function drawBackLanterns(p,id,d,lit,open){const s=p.s,e=d.e,M=PMAT[pathTypeOf(id,d.to)];for(const sg of[-1,1]){const c=p.W(wallPt(e,.5+sg*(DOOR_W+.075),64,-4)),b=p.W(wallPt(e,.5+sg*(DOOR_W+.075),76,-1)),on=open?lit:0;
  p.line([b,[c[0],c[1]-5*s]],M.post,1.6);p.cut([[c[0]-4*s,c[1]-5*s],[c[0]+4*s,c[1]-5*s],[c[0]+4.6*s,c[1]+5*s],[c[0]-4.6*s,c[1]+5*s]],M.post,{blur:2,rough:.1});p.flat(p.ell(c[0],c[1],2.6,3.4,10),on>.05?M.glow:'#8A7A6A',on>.05?.4+.6*on:1);
  if(on>.05){p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(c[0],c[1],20,15,18),M.glow,.2*on);p.g.restore()}}}
/* lo que se ve por una puerta del fondo abierta: el camino alejándose */
function pathView(p,d,inner,top,type){const s=p.s,e=d.e,M=PMAT[type]||PMAT.puente,B=p.W(wallPt(e,.5,0)),Tp=p.W(wallPt(e,.5,top));
  p.clip(inner,()=>{const g=p.g,gr=g.createLinearGradient(0,Tp[1],0,B[1]);gr.addColorStop(0,'#2A1C3A');gr.addColorStop(.7,'#4A2E2A');gr.addColorStop(1,'#6A4028');g.fillStyle=gr;g.fillRect(B[0]-90*s,Tp[1]-10*s,180*s,(B[1]-Tp[1])+20*s);
    for(let k=0;k<10;k++){const q=[B[0]+(Math.sin(k*7.3)*34)*s,Tp[1]+(6+(k*13)%38)*s];p.flat(p.ell(q[0],q[1],1,1,6),'#FFF6D8',.8)}
    const vp=[B[0],Tp[1]+36*s];for(let i=0;i<8;i++){const u=i/8,u2=(i+.6)/8,y=v=>lerp(B[1]+2*s,vp[1],v),w=v=>lerp(28,2,v)*s;p.flat([[B[0]-w(u),y(u)],[B[0]+w(u),y(u)],[B[0]+w(u2),y(u2)],[B[0]-w(u2),y(u2)]],i%2?M.c[0]:M.c[1])}
    for(const sg of[-1,1])p.line([[B[0]+sg*20*s,B[1]],[vp[0]+sg*1.4*s,vp[1]]],M.post,1.4,.9,{exact:true});
    g.save();g.globalCompositeOperation='lighter';p.flat(p.ell(vp[0],vp[1]+2*s,12,7,14),'rgba(255,230,150,.6)');g.restore()})}
