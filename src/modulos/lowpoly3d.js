/* ══════════ PERSONAJES LOW-POLY 3D ══════════
   Tú, los 25 vecinos y Pompón dejan de ser recortes de papel y pasan a ser figuras 3D low-poly:
   proporciones naturales (la cabeza algo grande para que se lean de lejos), cadera, rodilla, hombro
   y codo que se doblan, ojos con iris y brillo que parpadean, pelo por mechones, sombreros y lo que
   cada uno lleva en la mano.
   Optimizado para el móvil: todas las piezas de un mismo hueso se funden en UNA malla con colores
   por vértice y un único material compartido; un personaje entero cuesta unas 14 llamadas de dibujo.
   Los modelos se construyen una vez y se reutilizan al reconstruir los cuartos.
   La lógica del juego no cambia: esto solo sustituye al dibujo. */
const LP3D=(()=>{
  const T3=window.THREE;if(!T3)return null;
  const U0=34;                         /* unidades del mundo por metro de maqueta */
  const LOWSEG=typeof COARSE!=='undefined'&&COARSE;
  const sg=n=>LOWSEG?Math.max(5,Math.round(n*.75)):n;
  const SH={shared:true};
  /* ── materiales compartidos ── */
  let MATF=null;const matF=()=>MATF||(MATF=Object.assign(new T3.MeshLambertMaterial({vertexColors:true,flatShading:true,side:T3.DoubleSide}),{userData:SH}));
  let MAT=null;const mat=()=>MAT||(MAT=Object.assign(new T3.MeshLambertMaterial({vertexColors:true,side:T3.DoubleSide}),{userData:SH}));
  const BASIC={};const basic=(c,o={})=>{const k=c+JSON.stringify(o);return BASIC[k]||(BASIC[k]=Object.assign(new T3.MeshBasicMaterial({color:c,...o}),{userData:SH}))};
  /* ── colores: hex sRGB → oscurecer / aclarar ── */
  const hx=c=>{if(!c||c[0]!=='#')return[200,180,160];const n=c.length===4?c.slice(1).split('').map(x=>parseInt(x+x,16)):[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));return n};
  const shd=(c,k=.8)=>{const n=hx(c).map(v=>Math.max(0,Math.min(255,Math.round(v*k))));return'#'+n.map(v=>v.toString(16).padStart(2,'0')).join('')};
  const mix=(a,b,t)=>{const A=hx(a),B=hx(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
  /* ── plantillas de geometría (se clonan al fundir) ── */
  const GC={};const gq=(k,f)=>GC[k]||(GC[k]=(g=>(g.userData.shared=true,g))(f()));
  const SPH=(r,w=12,h=9,a=0,b=Math.PI*2,c=0,d=Math.PI)=>gq(['s',r,w,h,a,b,c,d].join(),()=>new T3.SphereGeometry(r,sg(w),sg(h),a,b,c,d));
  const CYL=(r0,r1,h,n=10,open=false,a=0,b=Math.PI*2)=>gq(['c',r0,r1,h,n,open,a,b].join(),()=>new T3.CylinderGeometry(r0,r1,h,sg(n),1,open,a,b));
  const CONE=(r,h,n=6)=>gq(['k',r,h,n].join(),()=>new T3.ConeGeometry(r,h,n));
  const BOX=(x,y,z)=>gq(['b',x,y,z].join(),()=>new T3.BoxGeometry(x,y,z));
  const TOR=(r,t,a=6,b=12,arc=Math.PI*2)=>gq(['t',r,t,a,b,arc].join(),()=>new T3.TorusGeometry(r,t,a,sg(b),arc));
  const CIRC=(r,n=10,a=0,b=Math.PI*2)=>gq(['o',r,n,a,b].join(),()=>new T3.CircleGeometry(r,n,a,b));
  const LATHE=(pts,n=12,a=0,b=Math.PI*2)=>gq('l'+JSON.stringify(pts)+n+a+b,()=>new T3.LatheGeometry(pts.map(([r,y])=>new T3.Vector2(r,y)),sg(n),a,b));
  const OCT=r=>gq('8'+r,()=>new T3.OctahedronGeometry(r,0));
  /* ── un cubo de piezas que se funde en una sola malla ── */
  const _m=new T3.Matrix4(),_q=new T3.Quaternion(),_e=new T3.Euler(),_c=new T3.Color(),_v=new T3.Vector3(),_s=new T3.Vector3();
  class Bk{constructor(){this.p=[]}
    add(g,col,pos=[0,0,0],rot=[0,0,0],scl=[1,1,1]){this.p.push({g,col,pos,rot,scl,m:null});return this}
    addM(g,col,m){this.p.push({g,col,m:m.clone()});return this}
    geo(){let n=0;const gs=this.p.map(P=>{const g=P.g.index?P.g.toNonIndexed():P.g.clone();if(P.m)g.applyMatrix4(P.m);else{_e.set(...P.rot);_q.setFromEuler(_e);_m.compose(_v.set(...P.pos),_q,_s.set(...P.scl));g.applyMatrix4(_m)}n+=g.attributes.position.count;return[g,P.col]});
      const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
      for(const [g,c] of gs){const cnt=g.attributes.position.count;pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);_c.set(c);for(let i=0;i<cnt;i++){const j=(o+i)*3;col[j]=_c.r;col[j+1]=_c.g;col[j+2]=_c.b}o+=cnt;g.dispose()}
      const G=new T3.BufferGeometry();G.setAttribute('position',new T3.BufferAttribute(pos,3));G.setAttribute('normal',new T3.BufferAttribute(nor,3));G.setAttribute('color',new T3.BufferAttribute(col,3));G.computeBoundingSphere();G.userData.shared=true;return G}
    mesh(parent,flat){if(!this.p.length)return null;const m=new T3.Mesh(this.geo(),flat?matF():mat());m.userData.lp=1;if(parent)parent.add(m);return m}}
  /* matriz de una pieza dentro de otra (para colocar en un cubo piezas definidas en un grupo hijo) */
  const MX=(pos=[0,0,0],rot=[0,0,0],scl=[1,1,1])=>{_e.set(...rot);_q.setFromEuler(_e);return new T3.Matrix4().compose(new T3.Vector3(...pos),_q.clone(),new T3.Vector3(...scl))};
  const grp=(p,pos=[0,0,0])=>{const g=new T3.Group();g.position.set(...pos);if(p)p.add(g);return g};

  /* ══ el pelo, por peinados (coordenadas de la cabeza, radio ~0.2) ══ */
  function hair(B,st,c,o={}){const d=shd(c,.82),hiC=mix(c,'#FFFFFF',.12);
    const cap=()=>B.add(SPH(.215,16,10,0,Math.PI*2,0,Math.PI*.5),c,[0,.012,-.012],[-.22,0,0],[.97,1.05,1.03]);
    const back=(lo=.72)=>B.add(SPH(.207,14,8,Math.PI*.82,Math.PI*1.36,Math.PI*.3,Math.PI*(lo-.3)),d,[0,0,-.03],[0,0,0],[1,1.02,1]);
    const bangs=(n=5,len=.12,flat=false)=>{for(let i=0;i<n;i++){const u=i/(n-1)-.5,x=u*.27,z=.155-Math.abs(u)*.07,rz=-u*(flat?.3:1.1);B.add(CONE(.05,len,5),i%2?c:hiC,[x,.11-(flat?0:Math.abs(u)*.03),z],[.75+(flat?.15:0),0,rz],[1.25,1,.55])}};
    const tufts=()=>{const t=[[0,.19,.03,-1.1,0],[-.08,.18,.06,-1.2,.4],[.08,.18,.07,-1.25,-.4],[-.15,.12,0,-.5,1.1],[.15,.12,0,-.5,-1.1],[0,.18,-.08,-.3,0],[-.1,.13,-.13,.6,.6],[.1,.13,-.13,.6,-.6],[0,.08,-.18,1.3,0]];
      for(const [x,y,z,rx,rz] of t)B.add(CONE(.055,.1,5),c,[x,y,z],[rx,0,rz],[1.1,1,.8])};
    const sideLocks=(len)=>{for(const s of[-1,1])B.add(CONE(.05,len,6),c,[s*.185,-.02-len*.35,.0],[0,0,s*.12],[1,1,.7])};
    switch(st){
      case'calvo':B.add(TOR(.188,.034,5,12,Math.PI*1.15),c,[0,-.01,0],[-Math.PI/2,0,-Math.PI*.075]);return;
      case'rapado':B.add(SPH(.207,14,8,0,Math.PI*2,0,Math.PI*.52),c,[0,.004,-.008],[-.22,0,0],[.96,1.03,1.01]);back(.62);return;
      case'afro':B.add(SPH(.3,14,10,0,Math.PI*2,0,Math.PI*.62),c,[0,.03,-.05],[-.42,0,0],[1,.96,1]);B.add(SPH(.27,12,9),c,[0,.02,-.1],[0,0,0],[1.02,.95,.9]);
        for(let i=0;i<10;i++){const a=i/10*Math.PI*2;B.add(SPH(.07,6,5),i%2?d:c,[Math.cos(a)*.26,.12+Math.sin(a*2)*.04,-.06+Math.sin(a)*.2])}return;
    }
    cap();
    if(st==='corto'||st==='flequillo'||st==='rizado'||!st){back(.7);if(st==='flequillo')bangs(6,.13,true);else if(st==='rizado'){for(let i=0;i<16;i++){const a=i/16*Math.PI*2,y=.07+(i%3)*.05;B.add(SPH(.06,7,5),i%2?c:d,[Math.cos(a)*.19,y,Math.sin(a)*.18-.03])}}else{bangs(4,.13);if(o.tufts!==false)tufts()}return}
    back(.72);bangs(5,.11);
    if(st==='largo'||st==='melena'){const L=st==='largo'?.42:.3;B.add(CYL(.2,.215,L,12,true,Math.PI*.42,Math.PI*1.16),d,[0,-.02-L/2,-.03],[.08,0,0],[1,1,.9]);sideLocks(L*.85)}
    if(st==='trenzas'){for(const s of[-1,1]){for(let i=0;i<5;i++)B.add(SPH(.042,7,5),i%2?c:d,[s*(.17+i*.006),-.08-i*.07,.02+i*.02]);B.add(SPH(.03,6,5),o.ribbon||'#E07A80',[s*.2,-.44,.11],[0,0,0],[1.6,.8,.8])}}
    if(st==='moño'||st==='recogido')B.add(SPH(.09,10,8),c,[0,st==='moño'?.1:.0,-.21]);
    if(st==='moñoalto'){B.add(SPH(.095,10,8),c,[0,.24,-.04],[0,0,0],[1.1,.85,1.1]);B.add(TOR(.06,.018,5,10),d,[0,.19,-.03],[Math.PI/2,0,0])}
    if(st==='coleta'){B.add(CONE(.07,.3,7),c,[0,-.08,-.25],[-2.7,0,0],[1,1,.8]);B.add(TOR(.04,.014,5,8),d,[0,.04,-.22],[.4,0,0])}}

  /* ══ sombreros ══ */
  function hat(B,h,ctx){if(!h)return;const [k,a,b]=h;
    const brim=(r,c,y=.1,t=.02,rx=-.12)=>B.add(CYL(r,r*.98,t,18),c,[0,y,0],[rx,0,0]);
    const crown=(r0,r1,hh,c,y)=>B.add(CYL(r0,r1,hh,14),c,[0,y,-.01],[-.12,0,0]);
    switch(k){
      case'straw':brim(.36,'#E9C46A',.11);crown(.16,.19,.13,'#F2D37A',.19);B.add(CYL(.192,.192,.03,14,true),a||'#B8484A',[0,.15,-.01],[-.12,0,0]);
        if(b)for(const [x,z,r] of[[-.06,.02,-.4],[.02,-.02,.1],[.08,.03,.5]]){B.add(CYL(.006,.006,.12,4),'#4E6B46',[x,.31,z],[0,0,r]);B.add(SPH(.035,6,4),'#8FB06A',[x+Math.sin(r)*-.06,.37,z],[0,0,0],[1.4,.5,.8])}break;
      case'wide':brim(.38,a,.11);crown(.16,.185,.13,shd(a,.94),.19);B.add(CYL(.188,.19,.035,14,true),shd(a,.7),[0,.15,-.01],[-.12,0,0]);break;
      case'chef':B.add(CYL(.2,.205,.1,14),'#F7F2E8',[0,.13,0],[-.12,0,0]);for(const [x,z,r] of[[-.08,0,.11],[.08,0,.11],[0,-.02,.13],[0,.06,.1]])B.add(SPH(r,10,8),'#FBF7EF',[x,.27,z]);break;
      case'top':brim(.28,a,.13,.02);B.add(CYL(.15,.16,.3,14),a,[0,.29,-.02],[-.1,0,0]);B.add(CYL(.162,.162,.05,14,true),b||'#D8574A',[0,.17,-.01],[-.1,0,0]);break;
      case'cap':B.add(SPH(.218,14,8,0,Math.PI*2,0,Math.PI*.5),a,[0,.03,-.01],[-.15,0,0],[1,.8,1]);B.add(SPH(.15,10,4,0,Math.PI,0,Math.PI*.5),shd(a,.7),[0,.06,.12],[-.05,0,0],[1,.12,1.1]);if(b)B.add(CYL(.218,.218,.035,14,true),b,[0,.06,-.01],[-.15,0,0]);break;
      case'souwester':B.add(SPH(.225,14,8,0,Math.PI*2,0,Math.PI*.5),'#F2C94C',[0,.03,-.01],[-.12,0,0]);B.add(CYL(.25,.36,.1,16,true),'#E8BC3C',[0,.04,-.04],[.25,0,0]);break;
      case'beret':B.add(SPH(.22,12,6),a,[.02,.17,-.01],[-.15,0,.15],[1.05,.32,1]);B.add(CYL(.008,.008,.04,4),shd(a,.7),[.02,.25,-.01]);break;
      case'beanie':B.add(SPH(.228,14,9,0,Math.PI*2,0,Math.PI*.55),a,[0,.02,-.01],[-.18,0,0],[1,1.12,1.03]);B.add(CYL(.232,.232,.06,14,true),shd(a,.8),[0,.035,-.01],[-.18,0,0]);B.add(SPH(.055,8,6),b||'#F2EADB',[0,.27,-.06]);break;
      case'miner':B.add(SPH(.228,14,8,0,Math.PI*2,0,Math.PI*.5),'#E4A844',[0,.03,-.01],[-.12,0,0],[1,.9,1.02]);B.add(CYL(.25,.25,.025,16),'#C9872F',[0,.04,-.01],[-.12,0,0]);B.add(CYL(.045,.045,.05,8),'#6A5A4A',[0,.13,.2],[Math.PI/2-.2,0,0]);B.add(CIRC(.036,8),'#FFF4C2',[0,.135,.228],[-.2,0,0]);break;
      case'flat':B.add(SPH(.22,12,6,0,Math.PI*2,0,Math.PI*.5),a,[0,.07,-.01],[-.25,0,0],[1.02,.5,1.08]);B.add(SPH(.14,10,4,0,Math.PI,0,Math.PI*.5),shd(a,.8),[0,.09,.14],[-.15,0,0],[1,.1,1]);break;
      case'scarf':B.add(SPH(.226,14,9,0,Math.PI*2,0,Math.PI*.58),a,[0,.01,-.02],[-.35,0,0],[1.02,1.05,1.04]);B.add(SPH(.05,6,5),shd(a,.85),[0,-.08,-.2]);for(const s of[-1,1])B.add(BOX(.05,.14,.015),a,[s*.04,-.17,-.2],[.2,0,s*.3]);break;
      case'veil':brim(.34,'#EFE6D2',.12);crown(.15,.17,.12,'#F6F0E2',.19);B.add(CYL(.17,.17,.03,14,true),ctx.accent||'#E4A844',[0,.16,-.01],[-.12,0,0]);ctx.veil=true;break;
      case'hood':B.add(SPH(.27,14,10,0,Math.PI*2,0,Math.PI*.78),a||'#E07A4E',[0,.01,-.04],[-.62,0,0],[1,1.02,1]);B.add(TOR(.2,.05,6,16),'#F3E6C4',[0,-.01,.13],[.12,0,0],[1,1.1,1]);break;
      case'bandana':B.add(CYL(.215,.215,.07,14,true),a,[0,.08,0],[-.18,0,0]);B.add(BOX(.05,.12,.02),a,[-.06,.04,-.22],[.3,0,-.5]);B.add(BOX(.05,.1,.02),a,[.03,.03,-.22],[.3,0,.4]);break;
      case'pencils':for(const [x,r,c] of[[-.03,-.5,'#E4A844'],[.04,.45,'#3E8FA0'],[0,-.1,'#B8484A']])B.add(CYL(.008,.008,.17,5),c,[x+Math.sin(r)*.05,.33,-.04],[0,0,r]);break;
      case'goggles':B.add(CYL(.212,.212,.03,14,true),'#5A4A42',[0,.07,0],[-.25,0,0]);for(const s of[-1,1]){B.add(CYL(.045,.045,.04,10),'#5A4A42',[s*.065,.11,.17],[Math.PI/2-.3,0,0]);B.add(CIRC(.032,10),'#6FC0A0',[s*.065,.115,.192],[-.3,0,0])}break;
      case'crown':{const cols=a||['#F4AFA6','#FBF4E3','#F5CE55'];for(let i=0;i<9;i++){const an=i/9*Math.PI*2,x=Math.sin(an)*.2,z=Math.cos(an)*.2-.01,y=.12+Math.cos(an)*.02;
          B.add(CONE(.022,.07,4),'#6F8D5E',[x*1.04,y-.01,z*1.04],[Math.cos(an)*.9,0,-Math.sin(an)*.9],[1,1,.4]);for(let k=0;k<5;k++){const b=k/5*Math.PI*2;B.add(SPH(.02,5,4),cols[i%cols.length],[x+Math.cos(b)*.022*Math.cos(an),y+Math.sin(b)*.022,z-Math.cos(b)*.022*Math.sin(an)])}B.add(SPH(.012,5,4),'#F5CE55',[x*1.06,y,z*1.06])}}break;
      case'rays':B.add(TOR(.2,.02,5,18),b||'#E4A844',[0,.12,-.01],[Math.PI/2-.12,0,0]);for(let i=0;i<11;i++){const an=-1.5+i*.3,L=i%2?.09:.14;B.add(CONE(.03,L,4),i%2?(b||'#E4A844'):(a||'#F5CE55'),[Math.sin(an)*.2,.14+Math.cos(an)*.04+L/2,Math.cos(an)*.2*.6-.03],[0,0,-an*.45],[1,1,.45])}break;
      case'leaves':{const cols=a;for(let i=0;i<10;i++){const an=i/10*Math.PI*2;B.add(OCT(.06),cols[i%cols.length],[Math.sin(an)*.2,.14+Math.cos(an)*.02,Math.cos(an)*.2-.01],[0,an,0],[.9,1.25,.25])}}break;
      case'nightcap':B.add(CYL(.226,.226,.06,14,true),shd(a,.82),[0,.06,-.01],[-.2,0,0]);B.add(CONE(.226,.5,12),a,[0,.27,-.12],[-.75,0,0],[1,1,1]);B.add(SPH(.06,8,6),b||'#FBF4E3',[0,.36,-.4]);break;
      case'moonPin':B.add(SPH(.04,8,6),a||'#F6D98A',[-.15,.12,.08],[0,0,0],[1,1,.5]);B.add(SPH(.036,8,6),'#C9D3E8',[-.13,.13,.095],[0,0,0],[1,1,.5]);break;
      case'wrap':B.add(SPH(.255,14,9,0,Math.PI*2,0,Math.PI*.55),a,[0,.04,-.02],[-.2,0,0],[1,.85,1.02]);B.add(TOR(.23,.025,5,16),b||shd(a,.8),[0,.05,-.01],[Math.PI/2-.2,0,0]);B.add(SPH(.05,7,6),shd(a,.8),[0,.16,.17]);break;
      case'antennae':B.add(TOR(.205,.012,4,16,Math.PI),a,[0,.06,0],[0,Math.PI/2,0]);for(const s of[-1,1]){B.add(CYL(.008,.008,.26,4),a,[s*.07,.3,.02],[0,0,-s*.35]);B.add(SPH(.03,7,6),b||'#F5CE55',[s*.115,.42,.02])}break;
      case'bow':for(const s of[-1,1])B.add(CONE(.07,.14,4),s<0?shd(a,.85):a,[s*.075,.16,-.12],[0,0,s*Math.PI/2],[1,1,.4]);B.add(SPH(.035,7,6),shd(a,.75),[0,.16,-.12]);break;
      case'clockTop':hat(B,['top','#3A3A48','#C9A05C'],ctx);B.add(CYL(.075,.075,.012,14),'#F4EFE2',[0,.3,.13],[Math.PI/2-.1,0,0]);B.add(TOR(.075,.008,4,14),'#C9A05C',[0,.3,.135],[-.1,0,0]);B.add(BOX(.006,.05,.004),'#3A2A20',[0,.32,.142],[-.1,0,0]);break;
      case'plume':hat(B,['top',b||'#2A2230','#E4A844'],ctx);B.add(OCT(.06),a||'#F6D98A',[0,.5,-.02],[0,0,0],[1,1.2,.35]);break;
      case'lamp':B.add(SPH(.228,14,8,0,Math.PI*2,0,Math.PI*.5),a||'#E4A844',[0,.03,-.01],[-.12,0,0],[1,.85,1.02]);B.add(CYL(.06,.06,.1,8),'#FFF1B0',[0,.28,-.02]);B.add(CONE(.085,.08,8),'#B8484A',[0,.37,-.02]);ctx.glow={c:'#FFF1B0',pos:[0,.28,-.02],r:.05};break;
      case'candle':B.add(CYL(.2,.2,.05,14),'#FBF4E3',[0,.15,-.01],[-.1,0,0]);B.add(CYL(.07,.07,.24,10),'#F6EAD0',[0,.3,-.02]);for(const [x,l] of[[-.05,.08],[.05,.12],[.02,.05]])B.add(CYL(.012,.012,l,5),'#FFF8E8',[x,.4-l/2,.055]);ctx.glow={c:'#FFC45A',pos:[0,.45,-.02],r:.03,flame:1};break;
      case'crystals':{const cols=a;[[-.09,.18,-.4],[0,.24,-.1],[.08,.2,.3],[.14,.12,.7]].forEach(([x,y,r],i)=>B.add(OCT(.055),cols[i%cols.length],[x,y,-.03],[0,.4,r],[.6,1.5,.6]))}break;
      case'ember':B.add(CYL(.214,.214,.05,14,true),'#3A2A20',[0,.08,0],[-.15,0,0]);for(let i=0;i<9;i++){const an=-1.6+i*.4;B.add(CONE(.035,i%2?.1:.15,5),i%2?'#F5A83A':'#E0584A',[Math.sin(an)*.19,.17,Math.cos(an)*.19*.7-.03],[0,0,-an*.3],[1,1,.6])}ctx.glow={c:'#F5A83A',pos:[0,.22,0],r:.001,lamp:.4};break;
      case'earmuffs':B.add(TOR(.215,.014,4,16,Math.PI),b||'#8A5A3A',[0,0,0],[0,Math.PI/2,0]);for(const s of[-1,1])B.add(SPH(.07,9,7),a||'#FBF8F2',[s*.2,-.01,0],[0,0,0],[.6,1,1]);break;
      case'feather':hat(B,['beret',a],ctx);B.add(CONE(.03,.36,5),b||'#F3E6C4',[-.08,.33,-.05],[.25,0,.6],[1,1,.3]);break;
      case'hexCrown':B.add(CYL(.18,.18,.04,14,true),shd(a||'#E4A844',.85),[0,.16,-.01],[-.12,0,0]);[[-.08,.24,.09],[0,.27,.12],[.08,.24,.09]].forEach(([x,y,z])=>B.add(CYL(.045,.045,.02,6),a||'#E4A844',[x,y,z],[Math.PI/2-.2,0,0]));B.add(SPH(.015,5,4),b||'#F4AFA6',[0,.27,.135]);break;
      case'owl':for(const [x,r] of[[-.1,-.55],[-.03,-.2],[.05,.25]])B.add(CONE(.035,.13,4),a||'#B8B0A4',[x,.23,0],[0,0,r],[1,1,.4]);break;
      case'coral':for(const [x,r,c] of[[-.1,-.5,'#E07F7F'],[0,-.1,'#F4AFA6'],[.1,.4,'#E07F7F']]){B.add(CYL(.016,.02,.16,5),c,[x,.33,0],[0,0,r]);B.add(CYL(.012,.014,.07,5),c,[x+.04*Math.sign(r||1),.36,0],[0,0,r+.8])}break;
      case'both':for(const h2 of a)hat(B,h2,ctx);break;
      case'helmet':ctx.noFace=true;B.add(SPH(.3,16,12),'#C9A05C',[0,0,0]);B.add(TOR(.13,.025,6,16),'#8A6A3A',[0,0,.27]);B.add(CIRC(.12,16),'#23404C',[0,0,.285]);B.add(CIRC(.03,8),'#9CC6D4',[-.05,.04,.288]);
        for(const s of[-1,1]){B.add(CYL(.055,.055,.03,10),'#8A6A3A',[s*.28,.02,0],[0,0,Math.PI/2]);B.add(CIRC(.04,8),'#23404C',[s*.296,.02,0],[0,s*Math.PI/2,0])}B.add(CYL(.24,.26,.08,16),'#B08A4A',[0,-.27,0]);break;
    }}
  /* ══ rasgos de la cara ══ */
  function fx(B,list,e){for(const f of list||[]){const [k,a,b]=f;
    if(k==='glasses'){for(const s of[-1,1])B.add(TOR(.042,.007,4,12),a||'#6A4A30',[s*e.x,e.y,e.z+.025]);B.add(BOX(.04,.008,.008),a||'#6A4A30',[0,e.y+.005,e.z+.03])}
    else if(k==='sunglasses'){for(const s of[-1,1])B.add(CYL(.047,.047,.012,12),'#2A2230',[s*e.x,e.y,e.z+.03],[Math.PI/2,0,0],[1,1,.8]);B.add(BOX(.05,.01,.01),'#2A2230',[0,e.y+.01,e.z+.035])}
    else if(k==='monocle'){B.add(TOR(.045,.008,4,12),'#C9A05C',[-e.x,e.y,e.z+.03]);B.add(CIRC(.04,10),'#DCEFF6',[-e.x,e.y,e.z+.029])}
    else if(k==='mustache'){const w=b||1;for(const s of[-1,1])B.add(SPH(.04,8,6),a,[s*.035*w,-.092,.185],[0,0,s*.35],[1.35*w,.45,.6])}
    else if(k==='beard'){B.add(SPH(.155,12,9,0,Math.PI*2,Math.PI*.42,Math.PI*.58),a,[0,-.03,.04],[.25,0,0],[1,1.05,1.02]);for(const s of[-1,1])B.add(SPH(.04,8,6),a,[s*.035,-.092,.187],[0,0,s*.35],[1.35,.45,.6])}
    else if(k==='rosy'){for(const s of[-1,1])B.add(CIRC(.032,10),'#EE8C86',[s*.1,-.06,.168],[0,s*.5,0],[1.3,.85,1])}
    else if(k==='soot'){B.add(CIRC(.03,8),'#5A4A42',[-.11,-.07,.163],[0,-.55,0],[1.3,.7,1]);B.add(CIRC(.022,8),'#5A4A42',[.07,.07,.18],[0,.35,0],[1.4,.6,1])}
    else if(k==='facescarf'){B.add(SPH(.17,12,8,Math.PI*.5-.95,1.9,Math.PI*.5,Math.PI*.32),a,[0,-.03,.03],[0,0,0],[1.08,1,1.12]);B.add(BOX(.06,.18,.02),a,[-.12,-.18,-.12],[.3,0,.4])}
    else if(k==='bigGlasses'){for(const s of[-1,1])B.add(TOR(.055,.009,4,14),a||'#C9A05C',[s*e.x,e.y,e.z+.03]);B.add(BOX(.03,.01,.01),a||'#C9A05C',[0,e.y+.01,e.z+.04])}
    else if(k==='paint'){B.add(CIRC(.02,8),'#3E8FA0',[-.1,-.06,.168],[0,-.5,0],[1.3,.8,1]);B.add(CIRC(.016,8),'#B8484A',[.09,.06,.18],[0,.4,0])}
    else if(k==='freckles'){for(const s of[-1,1])for(let i=0;i<3;i++)B.add(CIRC(.006,5),'#B8784A',[s*(.08+i*.018),-.045-(i%2)*.012,.172],[0,s*.45,0])}}}

  /* ══ lo que llevan en la mano (marco del cuerpo: +y arriba, +z al frente; origen en la mano) ══ */
  function item(B,k,a,G){switch(k){
    case'can':B.add(CYL(.07,.075,.13,10),'#3E8FA0',[0,.0,.03]);B.add(CYL(.012,.02,.16,6),'#2E6E7E',[0,.06,.14],[-.9,0,0]);B.add(TOR(.05,.01,4,10,Math.PI),'#2E6E7E',[0,.07,-.02],[0,Math.PI/2,0]);break;
    case'fan':for(let i=0;i<7;i++){const r=-1.2+i*.4;B.add(BOX(.03,.16,.004),i%2?'#F4AFA6':'#F6EBD6',[Math.sin(r)*.07,.07+Math.cos(r)*.06,.04],[0,0,-r])}break;
    case'print':B.add(BOX(.2,.24,.008),'#F6EBD6',[0,.08,.06],[-.25,0,0]);B.add(CIRC(.04,10),'#D8574A',[-.03,.1,.068],[-.25,0,0]);B.add(CIRC(.03,10),'#3E8FA0',[.04,.06,.07],[-.25,0,0]);break;
    case'knit':B.add(CYL(.004,.004,.24,4),'#B58A5A',[-.04,.05,.04],[0,0,.9]);B.add(CYL(.004,.004,.24,4),'#B58A5A',[.04,.05,.04],[0,0,-.9]);B.add(BOX(.14,.08,.02),'#D4796B',[0,-.02,.05]);break;
    case'star':B.add(BOX(.2,.2,.015),'#2E3561',[0,.06,.06],[-.3,0,.1]);for(const [x,y] of[[-.05,.1],[.04,.04],[0,.0],[.06,.12],[-.03,.03]])B.add(OCT(.012),'#F6D98A',[x,y+.04,.07]);break;
    case'pipe':B.add(CYL(.008,.008,.22,5),'#8A93A6',[0,.03,.1],[Math.PI/2-.2,0,0]);B.add(SPH(.035,8,6),'#F08A3A',[0,.05,.21]);G.glow={c:'#FFE08A',pos:[0,.07,.21],r:.025};break;
    case'radio':B.add(BOX(.15,.1,.06),'#5E6B7A',[0,0,.04]);B.add(CYL(.004,.004,.2,4),'#3A3A48',[.05,.14,.04],[0,0,-.2]);B.add(CIRC(.025,8),'#3A3A48',[-.03,0,.071]);G.glow={c:'#9CF07A',pos:[.045,.03,.072],r:.01};break;
    case'smoker':B.add(CYL(.045,.045,.13,10),'#B8C0C8',[0,0,.04]);B.add(CONE(.045,.06,10),'#9AA2AA',[0,.095,.04]);B.add(BOX(.04,.08,.06),'#8A5A34',[0,-.02,-.04]);break;
    case'books':[['#B8484A',0],['#3F7F5F',1],['#E4A844',2],['#4A548E',3]].forEach(([c,i])=>B.add(BOX(.17-i*.01,.045,.12),c,[i*.006,-.02+i*.047,.04],[0,i*.08-.1,0]));break;
    case'ladle':B.add(CYL(.008,.008,.26,5),'#B8783A',[0,.1,.03],[.15,0,0]);B.add(SPH(.05,8,6,0,Math.PI*2,Math.PI/2,Math.PI/2),'#B8783A',[0,.22,.06]);break;
    case'loupe':B.add(CYL(.01,.01,.1,5),'#8A5A34',[0,-.02,.03]);B.add(TOR(.045,.009,4,12),'#C9A05C',[0,.07,.04]);B.add(CIRC(.04,10),'#DCEFF6',[0,.07,.041]);break;
    case'lantern':B.add(CYL(.004,.004,.08,4),'#3A2A1E',[0,-.04,.04]);B.add(CONE(.06,.04,6),'#6A4226',[0,-.09,.04]);B.add(CYL(.06,.06,.016,6),'#6A4226',[0,-.22,.04]);G.glow={c:a||'#FFD36A',pos:[0,-.155,.04],r:.05,lamp:1};break;
    case'puppet':B.add(CYL(.006,.006,.26,4),'#8A5A34',[0,.12,.04]);B.add(SPH(.05,8,6),'#2A2230',[0,.27,.05]);B.add(CONE(.06,.1,6),'#B8484A',[0,.2,.05]);B.add(SPH(.012,5,4),'#FFFFFF',[.02,.28,.095]);break;
    case'spyglass':B.add(CYL(.025,.035,.26,10),'#C9A05C',[0,.02,.1],[Math.PI/2-.35,0,0]);B.add(TOR(.034,.008,4,10),'#8A5A2E',[0,.05,.18],[-.35,0,0]);break;
    case'candle':B.add(CYL(.03,.03,.12,8),'#FBF4E3',[0,.06,.04]);B.add(CYL(.06,.06,.012,10),'#C9A05C',[0,0,.04]);G.glow={c:'#FFC45A',pos:[0,.145,.04],r:.022,lamp:.6,flame:1};break;
    case'pick':B.add(CYL(.01,.01,.36,5),'#8A5A34',[0,.12,.02],[.1,0,0]);B.add(CYL(.012,.006,.26,5),'#8A93A6',[0,.3,.04],[0,0,Math.PI/2]);break;
    case'hammer':B.add(CYL(.012,.012,.3,5),'#8A5A34',[0,.12,.02]);B.add(BOX(.15,.06,.06),'#5A5A66',[0,.28,.02]);break;
    case'pole':B.add(CYL(.008,.008,.8,5),'#6A74B0',[0,.05,.03]);break;
    case'box':B.add(BOX(.22,.15,.18),'#B8783A',[0,.0,.08]);B.add(BOX(.225,.03,.185),'#E4A844',[0,.03,.08]);break;
    case'book':B.add(BOX(.17,.21,.035),'#4A548E',[0,.04,.07],[-.6,0,0]);B.add(BOX(.15,.19,.02),'#F3E6C4',[0,.045,.08],[-.6,0,0]);break;
    case'quill':item(B,'book',a,G);B.add(CONE(.02,.22,5),'#F3E6C4',[.1,.12,.06],[0,0,-.4],[1,1,.3]);break;
    case'palette':B.add(CYL(.12,.12,.012,14),'#D9B77A',[.02,.02,.08],[Math.PI/2-.4,0,0],[1,1,.7]);[['#B8484A',-.05,.04],['#3E8FA0',0,.07],['#E4A844',.06,.04],['#6F8D5E',.02,-.02]].forEach(([c,x,y])=>B.add(SPH(.016,6,4),c,[x+.02,y+.02,.11]));break;
    case'basket':B.add(LATHE([[.06,0],[.1,.08],[.105,.09]],10),'#C98A42',[0,-.08,.05]);B.add(TOR(.08,.008,4,10,Math.PI),'#A86A2A',[0,0,.05]);[['#F4AFA6',-.04],['#F5CE55',0],['#8FB06A',.04]].forEach(([c,x])=>B.add(SPH(.03,6,5),c,[x,.01,.05]));break;
    case'sprout':B.add(LATHE([[.05,0],[.06,.07],[.065,.075]],8),'#C9694B',[0,-.04,.05]);B.add(SPH(.035,6,4),'#8FB06A',[.02,.08,.05],[0,0,.5],[1.4,.5,.8]);break;
    case'sunflower':B.add(CYL(.008,.01,.5,5),'#4E6B46',[0,.18,.04]);B.add(OCT(.05),'#6F8D5E',[.05,.1,.04],[0,0,.8],[1,.5,.25]);B.add(CYL(.05,.05,.025,12),'#7A4A2A',[0,.44,.07],[Math.PI/2-.4,0,0]);for(let i=0;i<12;i++){const an=i/12*Math.PI*2;B.add(OCT(.04),i%2?'#F5CE55':'#E9B830',[Math.cos(an)*.08,.44+Math.sin(an)*.08*.92,.07+Math.sin(an)*.03],[.4,0,an+Math.PI/2],[.45,1.1,.2])}break;
    case'maple':B.add(CYL(.006,.006,.16,4),'#8A4A2A',[0,.07,.04]);for(let i=0;i<5;i++){const an=-1.2+i*.6;B.add(OCT(.06),a||'#E07A4E',[Math.sin(an)*.06,.2+Math.cos(an)*.06,.05],[0,0,-an],[.7,1.3,.2])}break;
    case'mug':B.add(CYL(.045,.04,.09,10),'#E07A4E',[0,.0,.06]);B.add(TOR(.025,.008,4,8),'#E07A4E',[.05,0,.06],[0,0,0]);B.add(CIRC(.04,10),'#6A3A1A',[0,.046,.06],[-Math.PI/2,0,0]);break;
    case'moonLamp':B.add(CYL(.004,.004,.1,4),'#6A4226',[0,-.05,.05]);B.add(SPH(.035,8,6),'#2E3561',[.02,-.15,.06]);G.glow={c:'#F6E7B0',pos:[-.015,-.15,.05],r:.06,lamp:1};break;
    case'jar':B.add(CYL(.045,.045,.02,10),'#8A5A34',[0,.08,.05]);G.glow={c:a||'#8FD3C4',pos:[0,0,.05],r:.065,lamp:.8};break;
    case'dipper':B.add(CYL(.007,.007,.26,5),'#B8783A',[0,.1,.05],[.2,0,0]);for(let i=0;i<3;i++)B.add(TOR(.03-i*.004,.012,5,10),'#D9974A',[0,.22+i*.025,.08],[Math.PI/2,0,0]);B.add(SPH(.018,6,5),'#F0B040',[0,.17,.08],[0,0,0],[1,1.6,1]);break;
    case'openBook':for(const s of[-1,1])B.add(BOX(.12,.008,.16),'#FBF4E3',[s*.058,.04+.0,.08],[0,0,s*.25]);B.add(BOX(.25,.006,.17),'#8A5A3A',[0,.022,.08]);break;
    case'hourglass':for(const s of[-1,1]){B.add(CYL(.06,.06,.015,8),'#8A5A34',[0,.12+s*.1,.07]);B.add(CONE(.05,.09,8),'#DCEFF6',[0,.12+s*.045,.07],[s>0?0:Math.PI,0,0])}B.add(CONE(.03,.04,8),'#E4A844',[0,.05,.07],[Math.PI,0,0]);break;
    case'masks':B.add(CYL(.006,.006,.2,4),'#8A5A34',[0,.08,.04],[0,0,-.3]);B.add(SPH(.055,8,6),'#FBF4E3',[.02,.22,.07],[0,0,0],[1,1.15,.35]);B.add(SPH(.05,8,6),'#F5CE55',[.1,.19,.06],[0,0,.3],[1,1.15,.35]);break;
    case'crystal':B.add(OCT(.06),a||'#8FD3C4',[0,.1,.06],[0,.4,0],[.7,1.6,.7]);G.glow={c:a||'#8FD3C4',pos:[0,.1,.06],r:.001,lamp:.7};break;
    case'kite':B.add(CYL(.003,.003,.7,3),'#FBF4E3',[.04,.3,.02],[0,0,-.2]);B.add(OCT(.13),a||'#F4AFA6',[.12,.68,.0],[0,0,.2],[.75,1.1,.12]);B.add(BOX(.012,.25,.012),'#FBF4E3',[.12,.68,.015],[0,0,.2]);break;
    case'brush':B.add(CYL(.012,.012,.5,5),'#8A5A34',[0,.18,.03],[0,0,-.2]);B.add(CONE(.03,.1,6),'#B8484A',[.09,.46,.03],[0,0,-.2]);break;
    default:B.add(BOX(.08,.08,.08),a||'#B8783A',[0,0,.04])}}

  /* ══ el muñeco: esqueleto + piezas ══ */
  function human(S){
    const k=S.k||1,child=k<.9,HS=child?1.36:1.27,tall=S.tall?1:0,old=S.old?1:0,tw=S.tw||1;
    const root=new T3.Group(),sc=grp(root);sc.scale.setScalar(U0*k);const lieA=grp(sc),lieB=grp(lieA),lieC=grp(lieB),body=grp(lieC);
    const hipY=.98+tall*.05-old*.02,skin=S.skin||'#E7B994',skD=shd(skin,.9),top=S.top||'#F2EADB',bot=S.bottom||'#5B4A3A',shoe=S.shoes||'#6A4A30',sleeve=S.sleeve||top;
    const R={root,sc,body,lieA,lieB,lieC,S,hipY,k,HS};
    /* cadera, pantalón, falda, túnica */
    const BP=new Bk();const legC=S.overall||bot;
    BP.add(LATHE([[0,hipY-.15],[.17*tw,hipY-.15],[.2*tw,hipY-.07],[.207*tw,hipY+.06],[.197*tw,hipY+.19],[0,hipY+.21]],12),legC);
    if(S.tunic)BP.add(LATHE([[.2*tw,hipY+.21],[.212*tw,hipY+.05],[.232*tw,hipY-.1],[.236*tw,hipY-.14]],14),top);
    if(S.skirt)BP.add(LATHE([[.2*tw,hipY+.2],[.225*tw,hipY+.04],[.3*tw,hipY-.38],[.315*tw,hipY-.44]],14),S.skirt);
    if(S.apron)BP.add(LATHE([[.235*tw,hipY+.17],[.255*tw,hipY],[.31*tw,hipY-(S.skirt?.36:.3)]],8,-.85,1.7),S.apron);
    const beltC=S.belt||(S.tunic?'#8A5A34':null);if(beltC){BP.add(TOR(.205*tw,.02,5,16),beltC,[0,hipY+.12,0],[Math.PI/2,0,0]);BP.add(BOX(.05,.04,.02),'#E4A844',[0,hipY+.12,.215*tw])}
    R.pelvis=BP.mesh(body);
    /* piernas */
    const leg=s=>{const hip=grp(body,[s*.095*tw,hipY,0]),A=new Bk();A.add(CYL(.078,.066,.46,9),s<0?shd(legC,.92):legC,[0,-.23,0]);A.mesh(hip);
      const knee=grp(hip,[0,-.46,0]),B=new Bk();
      if(S.boots){B.add(CYL(.066,.062,.2,9),s<0?shd(legC,.92):legC,[0,-.1,0]);B.add(CYL(.072,.076,.25,9),shoe,[0,-.32,0]);B.add(TOR(.074,.018,5,10),shd(shoe,.75),[0,-.2,0],[Math.PI/2,0,0])}
      else{B.add(CYL(.066,.058,.4,9),s<0?shd(legC,.92):legC,[0,-.2,0]);B.add(CYL(.05,.052,.06,8),skD,[0,-.42,0])}
      B.add(SPH(.08,9,7),shoe,[0,-.47,.05],[0,0,0],[.95,.6,1.55]);B.add(BOX(.14,.024,.25),shd(shoe,.55),[0,-.512,.05]);B.mesh(knee);return{hip,knee}};
    R.L=leg(1);R.Rl=leg(-1);
    /* torso */
    const chest=grp(body,[0,hipY+.18,0]);R.chest=chest;if(tall)chest.scale.y=1.08;
    const BC=new Bk();
    BC.add(LATHE([[0,0],[.19*tw,0],[.2*tw,.12],[.215*tw,.27],[.2*tw,.38],[.12,.45],[0,.47]],12),top);
    if(S.overall){BC.add(BOX(.26*tw,.2,.03),S.overall,[0,.1,.19*tw],[-.06,0,0]);for(const s of[-1,1]){BC.add(BOX(.035,.3,.02),S.overall,[s*.1,.26,.07],[-.15,0,s*.1]);BC.add(CYL(.016,.016,.01,8),'#E4A844',[s*.1,.19,.205],[Math.PI/2,0,0])}}
    if(S.apron){BC.add(BOX(.22*tw,.22,.02),S.apron,[0,.1,.205*tw],[-.08,0,0]);for(const s of[-1,1])BC.add(BOX(.025,.28,.015),S.apron,[s*.09,.3,.08],[-.2,0,s*.1])}
    if(S.vest)BC.add(LATHE([[.205*tw,-.02],[.214*tw,.12],[.229*tw,.27],[.214*tw,.38],[.14,.44]],12,.32,Math.PI*2-.64),S.vest);
    if(S.buttons)for(let i=0;i<3;i++)BC.add(CYL(.012,.012,.01,6),S.buttons,[0,.08+i*.09,.215*tw],[Math.PI/2,0,0]);
    if(S.patches)for(const [x,y,c] of S.patches)BC.add(BOX(.05,.04,.01),c,[x,y,.214*tw]);
    if(S.dots)for(const [x,y,c] of S.dots)BC.add(CIRC(.016,6),c,[x,y,.217*tw]);
    if(S.strap)BC.add(BOX(.03,.52,.02),S.strap,[0,.22,.205*tw],[0,0,.75]);
    if(S.collar)BC.add(TOR(.1,.025,5,12),S.collar,[0,.43,.02],[Math.PI/2-.3,0,0]);
    if(S.scarf){BC.add(TOR(.11,.04,6,14),S.scarf,[0,.45,.0],[Math.PI/2-.1,0,0]);}
    if(S.pack){BC.add(BOX(.26,.3,.13),S.pack,[0,.22,-.25]);BC.add(BOX(.27,.04,.14),shd(S.pack,.75),[0,.3,-.25]);if(S.bedroll)BC.add(CYL(.065,.065,.3,8),S.bedroll,[0,.42,-.26],[0,0,Math.PI/2]);for(const s of[-1,1])BC.add(BOX(.03,.36,.03),shd(S.pack,.7),[s*.12,.25,-.15],[.25,0,0])}
    R.torso=BC.mesh(chest);
    if(S.satchel){const B=new Bk();B.add(BOX(.07,.17,.2),S.satchel,[.25*tw,-.1,-.02],[0,0,-.1]);B.add(BOX(.075,.05,.205),shd(S.satchel,.75),[.252*tw,-.03,-.02],[0,0,-.1]);B.mesh(chest)}
    if(S.jar){const j=new T3.Mesh(SPH(.05,10,8),basic('#EBF5F8'));j.position.set(.27*tw,-.17,.1);j.scale.set(1,1.25,1);chest.add(j);R.jar=j}
    if(S.scarf){const tail=grp(chest,[.07,.42,.1]),B=new Bk();B.add(BOX(.07,.24,.03),S.scarf,[0,-.12,0]);B.add(BOX(.075,.03,.035),shd(S.scarf,.85),[0,-.22,0]);B.mesh(tail);R.scarfTail=tail}
    if(S.back){const cg=grp(chest,[0,.44,-.06]),B=new Bk();R.cape=cg;
      const cape=(c,lin,len=0)=>{const L=.66+len*.035,g=CYL(.215,.34,L,14,true,Math.PI/2-.12,Math.PI+.24);B.add(g,c,[0,-L/2,0]);if(lin)B.add(g,lin,[0,-L/2,.006],[0,0,0],[.96,1,.96]);return L};
      for(const bk of S.back){const [k,a,b,c]=bk;
        if(k==='cape')cape(a,b,c||0);
        else if(k==='leafCape'){const L=cape(a,null,4);for(let i=0;i<7;i++){const an=Math.PI/2+.1+i*.47;B.add(OCT(.07),i%2?b:a,[Math.sin(an)*.34,-L+.02,Math.cos(an)*.34],[0,an,0],[.5,1.2,.18])}}
        else if(k==='stars'){const L=cape(a,b,0);for(let i=0;i<9;i++){const an=Math.PI/2+.25+i*.3,y=-.12-((i*37)%5)*.11,r=.215+.125*(-y/L);B.add(OCT(.018),'#F6D98A',[Math.sin(an)*(r+.008),y,Math.cos(an)*(r+.008)])}}
        else if(k==='ember'){const L=cape('#8C3A2A','#E0584A',2);for(let i=0;i<6;i++){const an=Math.PI/2+.3+i*.45;B.add(OCT(.014),'#F5A83A',[Math.sin(an)*.3,-L*.7+(i%3)*.12,Math.cos(an)*.3])}}
        else if(k==='combCape'){const L=cape(a||'#E4A844','#C47A2C',2);for(let i=0;i<8;i++){const an=Math.PI/2+.35+i*.33,y=-.15-(i%3)*.15,r=.215+.125*(-y/L);B.add(CYL(.035,.035,.01,6),'#C47A2C',[Math.sin(an)*(r+.006),y,Math.cos(an)*(r+.006)],[Math.PI/2,an,0])}}
        else if(k==='quiverPaper'){cape('#FBF4E3','#EFDDB6',4);for(let i=0;i<3;i++)B.add(BOX(.12,.16,.005),'#FBF8EE',[-.18+i*.06,-.25-i*.08,-.32],[.2,.3,.3-i*.2])}
        else if(k==='tails'){for(const s of[-1,1])B.add(BOX(.12,.36,.02),a,[s*.08,-.62,-.2],[.18,0,s*.08])}
        else if(k==='cloud'){for(const [x,y,z,r] of[[0,-.05,-.28,.12],[-.12,-.18,-.26,.1],[.12,-.2,-.26,.11],[0,-.32,-.25,.12],[-.09,-.44,-.22,.08],[.1,-.42,-.22,.09]])B.add(SPH(r,9,7),a||'#FBF8F2',[x,y,z])}
        else if(k==='seaweed'){for(let i=0;i<5;i++)B.add(CONE(.035,.7-i*.06,4),i%2?'#3F7F5F':'#6F8D5E',[-.12+i*.06,-.32,-.22-((i+1)%2)*.02],[Math.PI,0,(i-2)*.08],[1,1,.35])}
        else if(k==='mothWings'){for(const s of[-1,1]){B.add(SPH(.28,10,7),a,[s*.24,-.02,-.24],[0,s*.4,s*-.5],[.85,.6,.06]);B.add(SPH(.07,8,6),b||'#F6D98A',[s*.3,.02,-.255],[0,s*.4,0],[1,1,.1]);B.add(SPH(.16,9,6),shd(a,.92),[s*.14,-.3,-.23],[0,s*.4,s*.4],[.7,.6,.06])}}
        else if(k==='wings')R.wings=1}
      B.mesh(cg);
      if(R.wings){const W=new Bk();for(const s of[-1,1])for(const [r,l,w,y] of[[-.9,.34,.12,.0],[-.45,.27,.1,-.12],[-1.4,.2,.07,.06]])W.add(SPH(.5,8,6),'#FFFFFF',[s*(l*.45+.04),y+.05,-.27],[0,0,s*(r+Math.PI/2)],[l,w,.02].map(v=>v*2));
        const wm=new T3.Mesh(W.geo(),WINGM());cg.add(wm);R.wingM=wm}}
    if(S.torso)for(const [k,a,b] of S.torso){
      if(k==='stars'){const B=new Bk();for(const [x,y] of[[-.06,.3],[.08,.22],[.02,.08],[.1,.06],[-.1,.14]])B.add(OCT(.018),a||'#F6D98A',[x,y,.218*tw]);B.mesh(chest)}
      else if(k==='stripes'||k==='bands'){const B=new Bk(),cols=Array.isArray(a)?a:[a],n=b||3;for(let i=0;i<n;i++){const y=.06+i*(.33/n);B.add(LATHE([[.207*tw,y],[.215*tw+y*.05,y+.05]],12),cols[i%cols.length])}B.mesh(chest)}
      else if(k==='chain'){const B=new Bk();B.add(TOR(.03,.006,4,8),a||'#E4A844',[.1,-.02,.2]);B.add(CYL(.004,.004,.12,3),a||'#E4A844',[.05,0,.21],[0,0,1.3]);B.mesh(chest)}
      else if(k==='tags'){const B=new Bk();for(const [x,y,c] of[[-.07,.25,'#F3E6C4'],[.09,.1,'#FBF4E3'],[.02,.03,'#EFD9A8']])B.add(BOX(.04,.05,.006),c,[x,y,.219*tw],[0,0,.2]);B.mesh(chest)}}
    if(S.neck)for(const [k,a,b] of S.neck){const B=new Bk();
      if(k==='shawl'){B.add(LATHE([[.13,.47],[.23,.36],[.25,.28]],14),a);B.add(CONE(.09,.16,4),a,[0,.25,.21],[Math.PI,0,0],[1,1,.3])}
      else if(k==='necklace'){for(let i=0;i<7;i++){const an=-.9+i*.3;B.add(SPH(.014,5,4),a||'#E4A844',[Math.sin(an)*.15,.42-Math.cos(an*1.2)*.04-.04,Math.cos(an)*.15+.03])}B.add(CYL(.03,.03,.012,6),b||'#C47A2C',[0,.3,.2],[Math.PI/2,0,0])}
      B.mesh(chest)}
    if(S.cape){const cg=grp(chest,[0,.44,-.05]);const g=new T3.CylinderGeometry(.21,.33,.74,sg(14),1,true,Math.PI/2-.15,Math.PI+.3);g.translate(0,-.37,0);g.userData.shared=true;
      const m=new T3.Mesh(g,capeMat(S.cape,S.capePattern));cg.add(m);R.cape=cg;R.capeMesh=m;
      if(S.capeStars){const B=new Bk();for(let i=0;i<9;i++){const a=Math.PI/2+.1+i*.33,y=-.12-((i*37)%5)*.12,r=.2+(.16*(-y/.78));B.add(OCT(.016),'#F6D98A',[Math.sin(a)*(r+.005),y,Math.cos(a)*(r+.005)])}B.mesh(cg)}}
    /* brazos */
    const arm=s=>{const sh=grp(chest,[s*.225*tw,.37,0]);const A=new Bk();A.add(SPH(.064,9,7),sleeve,[0,-.03,0]);A.add(CYL(.058,.052,.27,9),sleeve,[0,-.15,0]);A.mesh(sh);
      const el=grp(sh,[0,-.28,0]),B=new Bk();B.add(CYL(.05,.044,.25,9),sleeve===skin?skin:sleeve,[0,-.12,0]);if(sleeve!==skin)B.add(TOR(.047,.012,5,9),shd(sleeve,.85),[0,-.235,0],[Math.PI/2,0,0]);
      B.add(SPH(.05,8,7),S.inkHands||skin,[0,-.29,.005],[0,0,0],[.78,1.15,.6]);B.add(SPH(.02,5,4),S.inkHands||skin,[s*-.03,-.27,.03]);B.mesh(el);
      const hand=grp(el,[0,-.29,0]),it=grp(hand);return{sh,el,hand,it}};
    R.AL=arm(1);R.AR=arm(-1);
    /* cuello y cabeza */
    const neck=grp(chest,[0,.45,0]);const BN=new Bk();BN.add(CYL(.05,.055,.12,8),skD,[0,.04,0]);BN.mesh(neck);
    const head=grp(neck,[0,.1+.16*HS,0]);head.scale.setScalar(HS);R.head=head;R.neck=neck;
    const BH=new Bk(),ctx={accent:S.accent};const E={x:.072,y:-.005,z:.165};
    const h=S.hat,helmet=h&&(h[0]==='helmet'||(h[0]==='both'&&h[1].some(x=>x[0]==='helmet')));
    if(!helmet){
      BH.add(SPH(.2,16,12),skin,[0,0,0],[0,0,0],[.93,1.05,.98]);BH.add(SPH(.13,12,9),skin,[0,-.08,.05],[0,0,0],[1,.85,1]);
      for(const s of[-1,1])BH.add(SPH(.04,7,6),skD,[s*.18,-.015,-.01],[0,0,0],[.5,1,.8]);
      BH.add(SPH(.024,8,6),skD,[0,-.055,.19],[0,0,0],[1,.85,1.1]);
      /* ojos: blanco, iris, pupila y brillo */
      for(const s of[-1,1]){const x=s*E.x;BH.add(SPH(.036,10,8),'#FBF8F2',[x,E.y,E.z],[0,0,0],[1,1.15,.55]);BH.add(SPH(.024,9,7),S.eye||'#5A3A22',[x,E.y-.003,E.z+.012],[0,0,0],[1,1.1,.5]);
        BH.add(SPH(.012,6,5),'#120806',[x,E.y-.003,E.z+.022],[0,0,0],[1,1,.4]);BH.add(SPH(.007,5,4),'#FFFFFF',[x-.01,E.y+.012,E.z+.026]);
        BH.add(BOX(.068,.007,.01),'#2A1A12',[x,E.y+.03,E.z+.012],[0,0,s*-.05]);
        if(S.hairS!=='calvo'||S.brows)BH.add(BOX(.075,.016,.016),S.brows||S.hair||'#3A2A20',[x+s*.004,E.y+.068,E.z+.002],[0,0,s*(S.girl?.12:.06)])
        else BH.add(BOX(.07,.012,.014),S.hair||'#AAA',[x,E.y+.066,E.z],[0,0,0])}
      if(S.hair&&!(S.hideHair))hair(BH,S.hairS,S.hair,{ribbon:S.ribbon,tufts:S.tufts});
      fx(BH,S.fx,E)}
    hat(BH,h,ctx);
    R.headM=BH.mesh(head);
    if(ctx.glow){const gm=new T3.Mesh(SPH(Math.max(.001,ctx.glow.r),8,6),basic(ctx.glow.c));gm.position.set(...ctx.glow.pos);head.add(gm);if(ctx.glow.flame)R.flame=gm;if(ctx.glow.lamp||ctx.glow.flame){const sp=glowSprite(ctx.glow.c,.45*(ctx.glow.lamp||.7));sp.position.set(...ctx.glow.pos);head.add(sp)}}
    if(!helmet){
      /* párpados (uno para los dos ojos): se cierran al parpadear */
      const BL=new Bk();for(const s of[-1,1])BL.add(SPH(.039,10,6,0,Math.PI*2,0,Math.PI*.5),skin,[s*E.x,0,0],[-.2,0,0],[1,1.15,.62]);
      const lids=BL.mesh(head);lids.position.set(0,E.y+.001,E.z);lids.scale.y=.12;R.lids=lids;
      /* boca: sonrisa o abierta */
      R.mSmile=TOR(.026,.0065,5,10,Math.PI);R.mOpen=SPH(.024,8,6);
      const mo=new T3.Mesh(R.mSmile,basic('#8A3A34'));mo.position.set(0,-.112,.168);mo.rotation.set(0,0,Math.PI);head.add(mo);R.mouth=mo}
    if(ctx.veil){const v=new T3.Mesh(CYL(.31,.33,.36,16,true),VEILM());v.position.set(0,-.06,0);head.add(v)}
    /* lo que lleva en la mano */
    R.hold=S.hold;R.twoHands=S.twoHands;
    if(S.hold){const it=R.AR.it,BI=new Bk(),G={};item(BI,S.hold[0],S.hold[1],G);BI.mesh(it);
      if(G.glow){const gm=new T3.Mesh(SPH(G.glow.r,8,6),basic(G.glow.c));gm.position.set(...G.glow.pos);it.add(gm);R.glow=gm;
        if(G.glow.lamp){const sp=glowSprite(G.glow.c,.5*G.glow.lamp);sp.position.set(...G.glow.pos);it.add(sp)}}}
    /* pose de partida y estado de animación */
    R.st={blink:2+Math.random()*3,bt:0,head:0};
    if(S.pose==='sit'){const seat=(S.seat||26)+4;R.sitY=seat*1.14/U0-hipY*1}
    if(S.pose==='lie'){lieA.position.y=30/(U0*k);lieA.rotation.z=-.62;lieB.rotation.y=Math.PI/2;lieC.rotation.x=-Math.PI/2;body.position.y=-hipY}
    return R}
  let WM=null;const WINGM=()=>WM||(WM=Object.assign(new T3.MeshLambertMaterial({color:'#EEF6FA',transparent:true,opacity:.6,depthWrite:false,side:T3.DoubleSide}),{userData:SH}));
  let VM=null;const VEILM=()=>VM||(VM=Object.assign(new T3.MeshBasicMaterial({color:'#F6F2E8',transparent:true,opacity:.32,depthWrite:false,side:T3.DoubleSide}),{userData:SH}));
  let GT=null;function glowTex(){if(GT)return GT;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);GT=new T3.CanvasTexture(c);GT.userData.shared=true;return GT}
  function glowSprite(c,s){const m=Object.assign(new T3.SpriteMaterial({map:glowTex(),color:c,transparent:true,opacity:.55,blending:T3.AdditiveBlending,depthWrite:false,fog:false}),{userData:SH});const sp=new T3.Sprite(m);sp.scale.setScalar(s);return sp}
  /* la capa del jugador: tela con su diseño (rayas, lunares o panal) */
  const CAPES={};function capeMat(col,pat){const key=col+pat;if(CAPES[key])return CAPES[key];const n=128,c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d');g.fillStyle=col;g.fillRect(0,0,n,n);const cc=mix(col,'#FFFFFF',.28);g.strokeStyle=cc;g.fillStyle=cc;
    if(pat==='rayas'){g.lineWidth=7;for(let i=-n;i<n*2;i+=22){g.beginPath();g.moveTo(i,0);g.lineTo(i+n*.6,n);g.stroke()}}
    else if(pat==='lunares'){for(let y=8;y<n;y+=20)for(let x=(y/20%2?18:8);x<n;x+=20){g.beginPath();g.arc(x,y,4,0,Math.PI*2);g.fill()}}
    else if(pat==='panal'){g.lineWidth=2;const r=9;for(let y=0,row=0;y<n+r;y+=r*1.5,row++)for(let x=(row%2?r*.87:0);x<n+r;x+=r*1.74){g.beginPath();for(let k=0;k<7;k++){const a=Math.PI/6+k*Math.PI/3;g[k?'lineTo':'moveTo'](x+Math.cos(a)*r,y+Math.sin(a)*r)}g.stroke()}}
    g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,n-6,n,6);
    const t=new T3.CanvasTexture(c);t.colorSpace=T3.SRGBColorSpace;t.wrapS=t.wrapT=T3.RepeatWrapping;t.repeat.set(2,1);t.userData.shared=true;
    return CAPES[key]=Object.assign(new T3.MeshLambertMaterial({map:t,side:T3.DoubleSide}),{userData:SH})}

  /* ══ animación: andar, respirar, saludar, usar lo que lleva, asentir, parpadear ══ */
  const L=(a,b,t)=>a+(b-a)*t;
  function animate(R,o){const {t,dt}=o,w=o.walk||0,ph=o.ph||0,S=R.S,still=o.still;
    const sw=Math.sin(ph)*w,br=still?0:Math.sin(t*1.7+(S.ph||0)*3)*.012;
    if(S.pose==='sit'){R.body.position.y=R.sitY;for(const g of[R.L,R.Rl]){g.hip.rotation.x=-1.42;g.knee.rotation.x=1.35}}
    else if(S.pose==='lie'){R.L.hip.rotation.x=-.62;R.Rl.hip.rotation.x=-.58;R.L.knee.rotation.x=R.Rl.knee.rotation.x=.08}
    else{R.L.hip.rotation.x=sw*.62;R.Rl.hip.rotation.x=-sw*.62;
      R.L.knee.rotation.x=w*(.1+.95*Math.max(0,Math.sin(ph-1.2)));R.Rl.knee.rotation.x=w*(.1+.95*Math.max(0,Math.sin(ph+Math.PI-1.2)));
      R.body.position.y=Math.abs(Math.sin(ph))*.035*w+(w?0:br*.4)}
    R.chest.rotation.y=Math.sin(ph)*.1*w;R.chest.rotation.x=(S.old?.07:0)+w*.06+br*.6;
    /* brazos */
    const A=R.AL,B=R.AR,wave=o.wave||0,use=o.use||0;
    const swingL=-sw*.55,swingR=sw*.55,sitArm=S.pose==='sit'||S.pose==='lie';
    A.sh.rotation.set(sitArm?-.45:swingL,0,.08+(S.tw||1)*.02);A.el.rotation.set(sitArm?-.7:-.15-w*.25,0,0);
    B.sh.rotation.set(sitArm?-.45:swingR,0,-.08);B.el.rotation.set(sitArm?-.7:-.15-w*.25,0,0);
    if(R.hold||o.held){const up=use*.5;B.sh.rotation.set(-.42-up-(w*.1),0,-.12);B.el.rotation.set(-1.15-up*.4,0,0)}
    if(R.twoHands){A.sh.rotation.set(-.5,0,-.18);A.el.rotation.set(-1.1,0,.2);B.sh.rotation.set(-.5,0,.18);B.el.rotation.set(-1.1,0,-.2)}
    if(wave>0&&!R.twoHands){A.sh.rotation.set(-.2*wave,0,.08+2.55*wave);A.el.rotation.set(0,0,(.5+Math.sin(t*14)*.4)*wave)}
    /* el objeto mira siempre "arriba" */
    const it=B.it;it.rotation.set(-(B.sh.rotation.x+B.el.rotation.x),0,-(B.sh.rotation.z+B.el.rotation.z));
    if(R.glow&&R.S.hold&&R.S.hold[0]==='candle'&&!still){R.glow.scale.set(1,1.4+Math.sin(t*11)*.25,1)}
    /* cabeza: asentir al hablar y mirar un poco */
    R.head.rotation.x=(o.nod||0)*Math.sin(t*9)*.07-(S.old?.08:0)+(S.pose==='lie'?-.35:0);R.head.rotation.y=L(R.head.rotation.y,o.look||0,.1);
    /* capa y bufanda ondean al andar */
    if(R.cape)R.cape.rotation.x=.08+w*.3+(still?0:Math.sin(t*(w?9:2.2))*(w?.08:.03));
    if(R.scarfTail)R.scarfTail.rotation.set(.15+w*.5+(still?0:Math.sin(t*(w?9:2))*.08),0,.05);
    if(R.wingM&&!still)R.wingM.rotation.y=Math.sin(t*(S.pose==='sit'?2:9))*.06;
    if(R.flame&&!still)R.flame.scale.set(1,1.4+Math.sin(t*11)*.3,1);
    /* parpadeo y boca */
    if(R.lids){const s=R.st;let lid=.12;if(o.ex==='sleep')lid=1.05;else if(!still){s.blink-=dt;if(s.blink<0){s.bt=.13;s.blink=2.5+Math.random()*3.5}if(s.bt>0){s.bt-=dt;lid=1.05}}R.lids.scale.y=lid}
    if(R.mouth){const open=o.ex==='surprise'||o.ex==='open'||o.ex==='wow'||o.ex==='happy'||(o.talk&&!still&&Math.sin(t*14)>.3);const g=open?R.mOpen:R.mSmile;if(R.mouth.geometry!==g){R.mouth.geometry=g;R.mouth.scale.set(open?1:1,open?.75:1,open?.5:1);R.mouth.rotation.z=open?0:Math.PI}}}

  /* ══ fichas: del jugador y de cada vecino ══ */
  function fromAvatar(A){const acc=A.accessory;
    const S={k:1,skin:A.skin,hair:A.hair,hairS:A.hairStyle==='largo'?'largo':A.hairStyle,top:A.top,bottom:A.bottom,shoes:A.shoes,boots:true,tunic:true,strap:'#6A4226',
      cape:A.cape,capePattern:A.capePattern,accent:A.accent,satchel:'#8A5A34',jar:true,eye:'#5A3A22',hold:null};
    if(acc==='bufanda')S.scarf=A.accent;
    if(acc==='sombrero')S.hat=['wide','#B8783A'],S.hatBand=A.accent;
    if(acc==='velo')S.hat=['veil'];
    if(acc==='gorro'){S.hat=['beanie',A.cape,'#F2EADB'];if(A.hairStyle!=='largo')S.hideHair=true}
    if(S.hat)S.tufts=false;return S}
  const P_=['#F4AFA6','#E07F7F','#FBF4E3','#F5CE55','#A7BE8B','#6F8D5E'];
  const X={/* lo que el dibujo de papel hace con funciones: aquí, en piezas 3D (versión «Cuento», la del juego) */
    pri:{hat:['crown',['#F4AFA6','#FBF4E3','#F5CE55']],back:[['leafCape','#A7BE8B','#6F8D5E']],hold:['can'],fx:[['rosy']]},
    ver:{pose:'lie',hat:['rays','#F5CE55','#E4A844'],back:[['cape','#E9B830','#F5CE55']],hold:['sunflower'],fx:[['sunglasses'],['mustache','#F4F0E6',1.25]]},
    oto:{hat:['leaves',['#E07A4E','#E4A844','#C9694B','#B8484A']],back:[['leafCape','#C9694B','#E4A844']],hold:['maple'],fx:[['glasses','#3A2A20']]},
    inv:{hat:['nightcap','#8FA9B6'],back:[['cape','#DCE9F0','#8FA9B6',0]],hold:['mug'],fx:[['beard','#F4F0E6'],['rosy']],floorScarf:true},
    esp:{hat:['moonPin'],back:[['stars','#2E3561','#454E88']],torso:[['stars']],hold:['moonLamp'],fx:[['rosy']]},
    oce:{hat:['both',[['helmet'],['coral']]],back:[['seaweed']],hold:['jar','#8FD3C4']},
    des:{hat:['both',[['wrap','#2E9A9A','#E4A844'],['goggles']]],back:[['cape','#E6AE70','#2E9A9A',4]],torso:[['stars','#2E9A9A']],hold:['lantern','#8FE0D0'],fx:[['facescarf','#2E9A9A']]},
    ant:{hat:['hood','#5E6B9A'],torso:[['bands',['#8FD3C4','#F4AFA6','#C9B8F0'],3]],hold:['jar','#8FD3C4'],fx:[['rosy']]},
    col:{hat:['antennae','#4A3222','#F5CE55'],back:[['wings']],torso:[['stripes','#4A3222',3]],hold:['dipper']},
    bib:{hat:['owl','#B8B0A4'],back:[['cape','#8A5A3A','#C9A05C',6]],hold:['openBook'],fx:[['bigGlasses','#C9A05C'],['mustache','#B8B0A4',.8]]},
    coc:{hat:['bow','#E4A844'],back:[['wings']],torso:[['stripes','#C47A2C',3]],hold:['dipper'],fx:[['rosy']]},
    rel:{hat:['clockTop'],back:[['tails','#3A3A48']],torso:[['chain']],hold:['hourglass'],fx:[['mustache','#6A4A30',.9],['monocle']]},
    inn:{hat:['antennae','#C9D3E8','#F6D98A'],back:[['mothWings','#E6E0F4','#F6D98A']],hold:['moonLamp']},
    tea:{hat:['plume','#F6D98A','#2A2230'],back:[['cape','#B8484A','#E4A844',6]],hold:['masks'],fx:[['mustache','#2A1E18',.7]]},
    tre:{hat:['cap','#2A305C','#E4A844'],back:[['stars','#2A305C','#454E88']],torso:[['stars']],hold:['lantern','#F6D98A']},
    far:{hat:['lamp'],back:[['cape','#2E3A52','#F2C94C',4]],hold:['lantern','#FFF1B0'],fx:[['beard','#F4F0E6']]},
    sot:{hat:['candle'],neck:[['shawl','#8A5A3A']],back:[['cape','#6E4630','#C9694B',6]],hold:['candle']},
    cue:{hat:['crystals',['#C9B8F0','#8FD3C4','#F4AFA6']],back:[['cape','#4A548E','#C9B8F0',4]],hold:['crystal','#8FD3C4'],fx:[['soot']]},
    vol:{hat:['ember'],back:[['ember']],hold:['hammer'],fx:[['soot']]},
    cum:{hat:['earmuffs','#FBF8F2','#8FA9B6'],back:[['cloud']],hold:['kite','#F4AFA6'],fx:[['rosy']]},
    dsv:{hat:['top','#6A5A4A'],back:[['cape','#7A6A4A','#B8484A',6]],torso:[['tags']],hold:['lantern','#FFD36A'],fx:[['mustache','#8A8078',.9]]},
    est:{hat:['feather','#3A4660','#FBF4E3'],back:[['quiverPaper']],hold:['quill'],fx:[['glasses','#3A2A20']]},
    ret:{hat:['feather','#B8484A','#F5CE55'],back:[['cape','#3E8FA0','#E4A844',4]],hold:['brush'],fx:[['paint']]},
    jar:{hat:['crown',['#FBF4E3','#F4AFA6','#C9B8F0']],back:[['leafCape','#6F8D5E','#A7BE8B']],hold:['sprout'],fx:[['rosy']]},
    cor:{hat:['hexCrown'],back:[['wings'],['combCape']],neck:[['necklace']],hold:['book'],twoHands:true}};
  function fromHuman(id,H){const x=X[id]||{};
    const S={k:H.k||1,skin:H.skin,hair:H.hair,hairS:H.hair_s||(H.hair?'corto':null),top:H.top,sleeve:H.sleeve,bottom:H.bottom,shoes:H.shoes,skirt:H.skirt,overall:H.overall,apron:H.apron,belt:H.belt,
      tall:H.tall,old:H.old,tw:H.tw,pose:H.pose,seat:H.seat,inkHands:H.inkHands,ribbon:H.ribbon,ph:H.ph,tufts:false,girl:!!(H.skirt||/trenzas|moño|melena|coleta/.test(H.hair_s||''))};
    Object.assign(S,x);if(id==='oce'&&!H.head)S.hat=['coral'];if(H.twoHands===false||(!H.twoHands&&id!=='cor'))S.twoHands=x.twoHands&&H.twoHands!==false;if(!x.hold&&H.hold)S.hold=['misc','#B8783A'];return S}

  /* ══ Pompón: el conejo blanco de ojos rojos ══ */
  function pompon(){const root=new T3.Group(),sc=grp(root);sc.scale.setScalar(46);const body=grp(sc),B=new Bk(),W='#FBF7F0',Wd='#EDE6DA';
    B.add(SPH(.17,12,9),W,[0,.16,0],[0,0,0],[1,.9,1.2]);B.add(SPH(.05,7,6),'#FFFFFF',[0,.19,-.2]);
    for(const s of[-1,1]){B.add(SPH(.06,8,6),Wd,[s*.1,.07,.1],[0,0,0],[.8,.7,1.3]);B.add(SPH(.05,7,5),Wd,[s*.09,.04,-.1],[0,0,0],[.9,.6,1.4])}
    const head=grp(body,[0,.3,.13]),BH=new Bk();BH.add(SPH(.12,12,9),W,[0,.02,0]);
    for(const s of[-1,1]){BH.add(SPH(.035,7,6),W,[s*.045,.18,-.03],[s*.1-.2,0,s*.15],[1,3,.8]);BH.add(SPH(.024,6,5),'#F2C4C4',[s*.045,.18,-.003],[s*.1-.2,0,s*.15],[.6,2.4,.4]);BH.add(SPH(.022,8,6),'#B8243A',[s*.06,.045,.095],[0,0,0],[1,1,.6]);BH.add(SPH(.007,4,4),'#FFFFFF',[s*.06-.006,.054,.11])}
    BH.add(SPH(.014,6,5),'#E89A9A',[0,.0,.12]);BH.add(SPH(.03,6,5),W,[0,-.04,.1],[0,0,0],[1.4,.8,1]);
    B.mesh(body);BH.mesh(head);return{root,body,head}}
  function animPom(P,o){const {t}=o,hop=o.hop||0;P.body.position.y=Math.max(0,Math.sin(t*12))*.12*hop;P.body.rotation.x=-Math.sin(t*12)*.15*hop;
    P.head.rotation.x=o.sniff&&!o.still?Math.sin(t*16)*.06:0;P.head.rotation.z=o.still?0:Math.sin(t*1.3)*.05;P.root.position.x+=o.jit||0}

  /* la bufanda infinita de Escarcha, tendida por el suelo (unidades del mundo) */
  function ribbon(pts,r,c1,c2){const curve=new T3.CatmullRomCurve3(pts.map(p=>new T3.Vector3(...p))),N=56,B=new Bk(),a=new T3.Vector3(),b=new T3.Vector3(),up=new T3.Vector3(0,1,0),q=new T3.Quaternion(),d=new T3.Vector3();
    for(let i=0;i<N;i++){curve.getPoint(i/N,a);curve.getPoint((i+1)/N,b);d.copy(b).sub(a);const L=d.length()*1.08;q.setFromUnitVectors(up,d.normalize());B.addM(CYL(r,r,1,8),i%7===3?c2:c1,new T3.Matrix4().compose(a.clone().add(b).multiplyScalar(.5),q,new T3.Vector3(1,L,.55)))}
    return B.mesh()}
  /* los vecinos se dibujan después de los recortes de papel (como antes): así se sientan DENTRO del sillón */
  let MATN=null;function front(R){if(!MATN)MATN=Object.assign(mat().clone(),{transparent:true,opacity:1,depthWrite:true,userData:SH});
    R.root.traverse(o=>{if(!o.isMesh&&!o.isSprite)return;if(o.material===MAT)o.material=MATN;else if(o.material&&o.material.isMeshBasicMaterial&&!o.material.transparent){const k='T'+o.material.color.getHexString();o.material=BASIC[k]||(BASIC[k]=Object.assign(new T3.MeshBasicMaterial({color:o.material.color.clone(),transparent:true,opacity:1}),{userData:SH}))}o.renderOrder=3});return R}
  /* ── giro suave hacia donde se mira ── */
  const turn=(a,b,k)=>{let d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return a+d*k};
  return{human,animate,fromAvatar,fromHuman,pompon,animPom,turn,glowSprite,ribbon,front,U0,kit:{Bk,SPH,CYL,CONE,BOX,TOR,LATHE,OCT,CIRC,shd,mix,mat,matF,basic,glowSprite,MX}}})();
window.LP3D=LP3D;
