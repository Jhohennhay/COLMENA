/* ══════════ EL RASTRO DE AMARANTA ══════════
   Entre cuarto y cuarto, en las plazas de los puentes, a veces hay alguien esperando:
   una silueta de papel oscuro, quieta, con un libro bajo el brazo. Al acercarte se deshace
   en copos y te deja una página. Son tres, y cuentan la noche en que el corazón se calló.
   · Los vecinos, cuando ya has leído alguna, cuentan versiones que no encajan.
   · La tercera página deja huellas en su plaza: brillan en la oscuridad y llevan, por una
     pasarela que se arma al pisarla, a la plaza sin nombre. Allí espera el frasco del primer latido.
   Estado: PROG.F.rastro = {p:{1,2,3}, c:cruces, lc:último cruce con página, used:[plazas], a:{ancla}, box, h:{oídos}} */
const RASTRO_PAGES=[
  'La noche que el corazón se calló no había luna. Yo no estaba junto a él: estaba en este puente, contando los latidos que faltaban. Faltaban todos.',
  'Dirán que tomé el último tren. Dirán que fundí cien cartas. Fundí una sola, la mía. Las otras noventa y nueve las escribió alguien con mi letra.',
  'Si has llegado hasta aquí, ya sigues mis pasos. Mira el suelo de esta plaza cuando esté oscuro: mis huellas llevan a una plaza que no sale en ningún mapa. Allí dejé un frasco que parece vacío.'];
const RASTRO_BOX=['Dentro del frasco no hay nada. O eso parece: al destaparlo se oye un latido, uno solo. El primero de la colmena.',
  'Lo guardé aquí la noche en que todo se paró, para que no se perdiera. Llévalo contigo. El corazón sabrá qué hacer con él.'];
/* vecinos que no cuentan lo mismo (a partir de n páginas leídas) */
const RASTRO_DLG=[
  [1,'tre',['¿Amaranta en los puentes esa noche? Imposible. Los puentes estaban levantados; ayudé a bajarlos al amanecer.']],
  [1,'cum',['Una silueta en las plazas… Yo también la he visto desde aquí arriba. Pero siempre camina hacia el corazón. Nunca se aleja de él.']],
  [2,'far',['El haz de mi faro barre las pasarelas cada noche. Hay huellas que solo se ven cuando pasa la luz. Y ninguna viene hacia aquí.']],
  [2,'tea',['En mi ensayo ella se marcha por un puente que no existe. Lo escribí así porque ella me lo pidió. Yo pensaba que era una metáfora.']],
  [3,'bib',['Un mapa al que le falta una plaza no es un mapa incompleto. Es un mapa que miente a propósito. Busca lo que no está dibujado.']],
  [3,'inn',['¿El frasco vacío? Luna dice que lo vio brillar. Luna soy yo. No me acuerdo de haberlo dicho.']]];
const RZFREE=()=>FREE&&!window.RASTRO_TEST;
const RF=()=>{const F=PROG.F;const r=F.rastro||(F.rastro={});r.p=r.p||{};r.used=r.used||[];r.h=r.h||{};r.c=r.c||0;return r};
const rastroN=()=>Object.keys(RF().p).length;
const RZ={enc:null,flakes:[],hid:null};

/* ── geometría: la plaza de un cruce, dónde espera ella y dónde está la plaza sin nombre ── */
function rastroHub(comp){const s=comp.seg[1],N=PLZ.nodes;let bi=-1,bd=1e9;N.forEach((n,i)=>{const d=Math.hypot(n.x-s.x1,n.y-s.y1);if(d<bd){bd=d;bi=i}});return bi}
function rastroSpotFor(comp,hub){const s=comp.seg[1],n=PLZ.nodes[hub],L=Math.hypot(s.x1-s.x0,s.y1-s.y0)||1,dx=(s.x1-s.x0)/L,dy=(s.y1-s.y0)/L;
  let best=null,bd=.3;for(const [j] of PLZ.adj[hub]){const m=PLZ.nodes[j],l=Math.hypot(m.x-n.x,m.y-n.y)||1,ex=(m.x-n.x)/l,ey=(m.y-n.y)/l,dot=ex*dx+ey*dy;if(dot>bd){bd=dot;best=[n.x+ex*125,n.y+ey*125]}}
  return best||[n.x+dx*44,n.y+dy*44]}
function rastroHidden(prefer){plazaBuild();const N=PLZ.nodes,rooms=Object.keys(CW);
  const segClear=(ax,ay,bx,by)=>{for(const id of rooms){const c=CW[id],dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy,t=clamp(((c[0]-ax)*dx+(c[1]-ay)*dy)/Math.max(1,L2),0,1);if(Math.hypot(ax+dx*t-c[0],ay+dy*t-c[1])<R+TH+30)return false}return true};
  const tryN=i=>{const n=N[i];let best=null;for(const rr of[330,290,380])for(let k=0;k<36;k++){const a=k/36*TAU,hx=n.x+Math.cos(a)*rr,hy=n.y+Math.sin(a)*rr;let md=1e9;for(const id of rooms)md=Math.min(md,Math.hypot(CW[id][0]-hx,CW[id][1]-hy));
      if(md<R+TH+120)continue;if(N.some(m=>m!==n&&Math.hypot(m.x-hx,m.y-hy)<200))continue;if(!segClear(n.x,n.y,hx,hy))continue;if(!best||md>best.md)best={ni:i,x:hx,y:hy,md}}return best};
  let b=prefer>=0?tryN(prefer):null;if(!b){for(let i=0;i<N.length;i++){const c=tryN(i);if(c&&(!b||c.md>b.md))b=c}}
  return b?{ni:b.ni,x:Math.round(b.x),y:Math.round(b.y)}:null}

/* ── el encuentro: se decide al empezar el cruce, se resuelve mientras caminas ── */
function rastroInit(cr){cr.rz0=true;if(RZFREE()||inTitle||(typeof DEMO!=='undefined'&&DEMO))return;const RS=RF();RS.c++;
  const k=rastroN(),hub=rastroHub(cr.comp);
  if(RS.a&&RS.a.ni===hub&&!RS.box&&k>=3){cr.choose=true;cr.chosen=false;const i=cr.opts.findIndex(o=>o.to===cur);if(i>0)cr.opts.unshift(cr.opts.splice(i,1)[0])}
  if(k>=3||RS.used.includes(hub))return;
  const seen=Object.keys(PROG.F.seen||{}).length,need=[1,5,8][k];if(seen<need||RS.c<(RS.lc||0)+(k?2:1))return;
  if(k>0&&typeof NIGHTK==='function'&&NIGHTK()<.5&&!window.RASTRO_DAY)return;const n=PLZ.nodes[hub],S=rastroSpotFor(cr.comp,hub);cr.rz={k,hub,S,C:[n.x,n.y],st:'wait',t:0,y3:0};RZ.enc=cr.rz;
  if(k===2){cr.choose=true;cr.chosen=false;const i=cr.opts.findIndex(o=>o.to===cur);if(i>0)cr.opts.unshift(cr.opts.splice(i,1)[0])}}
function rastroTick(cr,fin){const z=cr.rz;if(!z||z.st==='done')return;const px=Pl.x+CW[cur][0],py=Pl.y+CW[cur][1];
  if(z.st==='wait'&&(Math.hypot(px-z.S[0],py-z.S[1])<235||fin||cr.hold)){z.st='fade';z.t=T;Sound.sfx('page',.6);note(_t('Una silueta de papel se deshace en la plaza…'))}
  if(z.st==='fade'&&(T-z.t>1.15||fin))rastroCollect(cr,z)}
function rastroCollect(cr,z){if(z.st==='done')return;z.st='done';z.td=T;const RS=RF(),k=z.k;RS.p[k+1]=1;RS.used.push(z.hub);RS.lc=RS.c;Sound.sfx('page');
  note(_t('Página del rastro')+` · ${rastroN()}/3`);narrClear();const lines=[];if(k===0)lines.push('Esa sombra de la plaza no era yo. O sí: lo que queda de mí cuando nadie mira. Te ha dejado una página.');lines.push(RASTRO_PAGES[k]);
  if(k===2){RS.a=rastroHidden(z.hub);lines.push(RS.a&&RS.a.ni===z.hub?'Mira el suelo de esta plaza: son mis pasos. Solo brillan en la penumbra, y se van hacia el vacío.':'Mis pasos no empiezan aquí. Búscalos en otra plaza de los puentes: brillan en la penumbra.')}
  narrate(lines);stateChanged();
  if(cr.hold&&typeof plzEl!=='undefined'&&plzEl&&!plzEl.hidden&&!cr.trip)plazaAsk(cr)}
const rastroReady=cr=>{const RS=PROG.F.rastro;return!!(RS&&RS.a&&!RS.box&&rastroN()>=3&&cr.comp&&rastroHub(cr.comp)===RS.a.ni)&&!RZFREE()};

/* ── el desvío: seguir las huellas hasta la plaza sin nombre y volver ── */
function rastroTrip(cr){const RS=RF(),n=PLZ.nodes[RS.a.ni];plzEl.hidden=true;const L=Math.hypot(RS.a.x-n.x,RS.a.y-n.y);
  const ux=(RS.a.x-n.x)/L,uy=(RS.a.y-n.y)/L;cr.trip={ph:'go',t0:T,d:Math.max(1.6,L/120),A:[n.x,n.y,n.z],B:[RS.a.x-ux*26,RS.a.y-uy*26,n.z],L};ZKhold={v:.96,until:T+60};narrClear();note(_t('Sigues las huellas…'))}
function tripStep(cr){const tr=cr.trip;Pl.onPath=true;
  if(tr.ph==='go'||tr.ph==='back'){const u=clamp((T-tr.t0)/tr.d,0,1),e=sm01(u)*.3+u*.7,A=tr.ph==='go'?tr.A:tr.B,B=tr.ph==='go'?tr.B:tr.A;tr.u=tr.ph==='go'?e:1;
    Pl.x=lerp(A[0],B[0],e)-CW[cur][0];Pl.y=lerp(A[1],B[1],e)-CW[cur][1];Pl.z=lerp(A[2],B[2],e)-8*Math.sin(Math.PI*e);if(Math.abs(B[0]-A[0])>2)Pl.f=B[0]>A[0]?1:-1;Pl.moving=u<1;
    if(!STILL){const k=Math.floor((T-tr.t0)*2.6);if(k!==tr.creak){tr.creak=k;Sound.sfx('plank',.22)}}
    if(u>=1){if(tr.ph==='go'){tr.ph='there';tr.t0=T;rastroArrive(cr)}else{cr.trip=null;Pl.moving=false;ZKhold={v:.96,until:T+cr.dur-cr.t};plazaAsk(cr)}}}
  else Pl.moving=false;return false}
let rzEl=null;
function rastroArrive(cr){const RS=RF();RS.box=1;RZ.boxT=T;Sound.sfx('seal');note('♥ '+_t('El frasco que parece vacío'));narrClear();narrate(RASTRO_BOX);stateChanged();
  if(!rzEl){rzEl=document.createElement('div');rzEl.className='plaza shadow';rzEl.style.cssText='bottom:auto;top:calc(76px + env(safe-area-inset-top,0px))';rzEl.setAttribute('role','dialog');document.getElementById('stage').appendChild(rzEl)}
  rzEl.innerHTML='';const p=document.createElement('div');p.className='p paper torn';const t=document.createElement('b');t.textContent=_t('La plaza sin nombre');const s=document.createElement('small');s.textContent=_t('Aquí terminan sus huellas.');
  const box=document.createElement('div');box.className='opts';const bt=document.createElement('button');bt.className='main';bt.textContent=_t('Volver a la plaza');
  const back=()=>{if(!cr.trip||cr.trip.ph!=='there')return;rzEl.hidden=true;cr.trip.ph='back';cr.trip.t0=T};bt.addEventListener('click',back);rzEl.onkeydown=e=>{if(e.key==='Escape'||e.key==='Enter'){back();e.preventDefault()}};
  box.appendChild(bt);p.append(t,s,box);rzEl.appendChild(p);rzEl.hidden=false;setTimeout(()=>bt.focus(),60)}

/* ── enganches: el paso del cruce y la pregunta de la plaza ── */
{const st0=plazaStep;plazaStep=function(cr){if(cr.trip)return tripStep(cr);if(!cr.rz0)try{rastroInit(cr)}catch(e){console.warn('rastro',e)}
    const fin=st0(cr);try{rastroTick(cr,fin)}catch(e){console.warn('rastro',e)}return fin};
  const ask0=plazaAsk;plazaAsk=function(cr){ask0(cr);if(!rastroReady(cr))return;const box=plzEl.querySelector('.opts');if(!box)return;
    const bt=document.createElement('button');bt.className='main rastro';bt.textContent='👣 '+_t('Seguir las huellas');bt.addEventListener('click',()=>{if(crossing===cr&&cr.hold&&!cr.trip)rastroTrip(cr)});
    for(const b of box.querySelectorAll('button.main'))b.classList.remove('main');box.prepend(bt);setTimeout(()=>bt.focus(),60)}}
/* vecinos: versiones que no encajan */
{const r0=rot;rot=function(id){const RS=PROG.F.rastro;if(RS&&!RZFREE()){const k=rastroN();for(const [n,who,ls] of RASTRO_DLG)if(who===id&&k>=n&&!RS.h[id+n]){RS.h[id+n]=1;save();return ls}}return r0(id)}}
/* el cuaderno: una sección para el rastro */
{const ob=openBook;openBook=function(tab){ob(tab);const RS=PROG.F.rastro;if(!RS||!Object.keys(RS.p||{}).length)return;const box=document.getElementById('bpages');if(!box)return;
    const e=box.querySelector('p.empty');if(e)e.remove();const h=document.createElement('h3');h.className='rastroh';h.textContent=_t('El rastro de Amaranta')+` · ${rastroN()}/3`;box.appendChild(h);
    for(let k=0;k<3;k++)if(RS.p[k+1]){const a=document.createElement('article'),sm=document.createElement('small');sm.textContent=_t('Plaza de los puentes');a.appendChild(sm);a.appendChild(document.createTextNode(_t(RASTRO_PAGES[k])));box.appendChild(a)}
    if(RS.box){const a=document.createElement('article'),sm=document.createElement('small');sm.textContent=_t('La plaza sin nombre');a.appendChild(sm);a.appendChild(document.createTextNode(RASTRO_BOX.map(_t).join(' ')));box.appendChild(a)}}
  const st=document.createElement('style');st.textContent='.bpages .rastroh{font-size:15px;font-weight:600;margin:14px 0 4px;color:#5A2E3A;letter-spacing:.02em}.plaza button.rastro{background:#3A2734;color:#FBE8C8;box-shadow:0 2px 0 #1E141C}.plaza button.rastro:hover,.plaza button.rastro:focus-visible{background:#56394B}';document.head.appendChild(st)}

/* ══ en 3D: la silueta, los copos, la página que vuela, las huellas y la plaza sin nombre ══ */
let RZSIL=null;
function rastroSilTex(){if(RZSIL)return RZSIL;const sb=2,box=[-80,-200,80,26],w=(box[2]-box[0])*sb,h=(box[3]-box[1])*sb;
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  try{const H=Object.assign({},HUMANS.cor,{pose:'stand',seat:0,_mv:0,_nod:0});const p=STYLE.Pen(g,-box[0]*sb,-box[1]*sb,sb,'rastro',true,true);p.noShadow=true;drawHuman(p,0,0,1,0,'smile',false,H)}catch(e){console.warn('silueta',e)}
  g.globalCompositeOperation='source-atop';g.fillStyle='#2B1C2A';g.fillRect(0,0,w,h);
  const o=document.createElement('canvas');o.width=w;o.height=h;const q=o.getContext('2d');q.shadowColor='rgba(255,196,110,.95)';q.shadowBlur=16;q.drawImage(c,0,0);q.shadowBlur=5;q.shadowColor='rgba(255,226,170,.9)';q.drawImage(c,0,0);q.shadowColor='transparent';q.drawImage(c,0,0);
  return RZSIL={c:o,w:w/sb,h:h/sb,box}}
function rastroSil(){const S=rastroSilTex(),mesh=R3D.cardMesh(S.c,S.w,S.h,{nomip:true});mesh.material.opacity=0;mesh.material.depthWrite=false;mesh.material.fog=false;mesh.scale.setScalar(1.12);mesh.position.set(0,-S.box[1]-S.h/2,0);mesh.renderOrder=4;const g=new THREE.Group();g.add(mesh);g.userData.m=mesh;return g}
let RZPG=null;function rastroPageMat(){if(RZPG)return RZPG;const c=document.createElement('canvas');c.width=64;c.height=52;const g=c.getContext('2d');g.fillStyle='#F6EEDC';g.beginPath();g.moveTo(6,8);g.lineTo(56,4);g.lineTo(60,46);g.lineTo(4,48);g.closePath();g.fill();g.strokeStyle='#8A6A4A';g.lineWidth=2;for(let k=0;k<4;k++){g.beginPath();g.moveTo(14,16+k*8);g.lineTo(50,14+k*8);g.stroke()}
  return RZPG=new THREE.SpriteMaterial({map:R3D.tex(c,{nomip:true}),transparent:true,depthWrite:false,fog:false})}
const rzY=n=>(R3D.lift(n.P.a)+R3D.lift(n.P.b))/2+n.z;
function rastroFlakes(x,y,z){const G=RZ.root;for(let i=0;i<18;i++){const m=new THREE.Sprite(new THREE.SpriteMaterial({color:i%4?'#2B1C2A':'#FFD9A0',transparent:true,depthWrite:false,fog:false}));const s=3+Math.random()*4;m.scale.set(s,s*1.3,1);
    m.position.set(x+(Math.random()-.5)*30,y+20+Math.random()*120,z+(Math.random()-.5)*14);G.add(m);RZ.flakes.push({m,v:[(Math.random()-.5)*40,20+Math.random()*40,(Math.random()-.5)*40],t0:T,life:1.2+Math.random()*.9,sp:Math.random()*8})}}
function rastroHidBuild(){const RS=PROG.F.rastro;if(!RS||!RS.a)return null;const key=RS.a.ni+':'+RS.a.x+':'+RS.a.y;if(RZ.hid&&RZ.hid.key===key)return RZ.hid;
  if(RZ.hid){RZ.root.remove(RZ.hid.g)}plazaBuild();const n=PLZ.nodes[RS.a.ni];if(!n)return null;const {Bk,CYL,BOX,glowSprite}=LP3D.kit,g=new THREE.Group(),B=new Bk();
  const ya=rzY(n),hx=RS.a.x,hz=RS.a.y,yb=ya,dx=hx-n.x,dz=hz-n.y,L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,ang=Math.atan2(-uz,ux);
  /* la plaza sin nombre: papel claro, farolillos fríos */
  B.add(CYL(56,50,10,6),'#CDB892',[hx,yb-5,hz],[0,Math.PI/2,0]);B.add(CYL(54,54,1.6,6),'#EDE1C6',[hx,yb+.6,hz],[0,Math.PI/2,0]);
  for(let k=0;k<6;k++){const a=k*Math.PI/3,px=hx+Math.cos(a)*52,pz=hz+Math.sin(a)*52;B.add(CYL(1.8,2.2,20,5),'#8E7A62',[px,yb+10,pz])}
  const lamps=[];for(const s of[-1,1]){const px=hx+s*36,pz=hz-26;B.add(CYL(1.6,1.6,44,5),'#4A3A30',[px,yb+22,pz]);B.add(BOX(8,10,8),'#4A3A30',[px,yb+48,pz]);const sp=glowSprite('#9FB6FF',40);sp.material.opacity=.4;sp.position.set(px,yb+48,pz);g.add(sp);lamps.push(sp)}
  /* un banco y la caja */
  B.add(BOX(46,4,14),'#9A7450',[hx-6,yb+16,hz+18]);for(const s of[-1,1])B.add(BOX(4,16,12),'#7A5636',[hx-6+s*19,yb+8,hz+18]);
  const boxG=new THREE.Group();const bm=new THREE.MeshLambertMaterial({color:'#CFE6EA',transparent:true,opacity:.72}),lm=new THREE.MeshLambertMaterial({color:'#A8784A'});const b0=new THREE.Mesh(new THREE.CylinderGeometry(5.6,5.6,11,10),bm);b0.position.y=5.5;const lid=new THREE.Mesh(new THREE.CylinderGeometry(4,4,2.6,10),lm);lid.position.y=12.2;boxG.add(b0,lid);
  const glow=glowSprite('#FFE3A0',38);glow.position.y=12;boxG.add(glow);boxG.position.set(hx+10,yb+18,hz+18);g.add(boxG);
  B.mesh(g);
  /* pasarela: tablones que se arman al pisarlos */
  const m=Math.max(4,Math.round((L-110)/15)),pl=new THREE.InstancedMesh(new THREE.BoxGeometry(11,2.6,30),new THREE.MeshLambertMaterial({color:'#E2D2B4'}),m+1),O=new THREE.Object3D();
  for(let k=0;k<=m;k++){const t=(55+k*(L-110)/m)/L;O.position.set(n.x+dx*t,lerp(ya,yb,t)-8*Math.sin(Math.PI*t)-1.3,n.y+dz*t);O.rotation.set(0,ang,0);O.updateMatrix();pl.setMatrixAt(k,O.matrix)}pl.count=0;pl.frustumCulled=false;g.add(pl);
  /* huellas: de la plaza al vacío; brillan con la penumbra y cerca de tu farol */
  const fs=Math.floor((L-20)/24),fg=new THREE.CircleGeometry(4,10);fg.rotateX(-Math.PI/2);fg.scale(.72,1,1.55);const fm=new THREE.MeshBasicMaterial({color:'#FFE6B0',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}),fp=new THREE.InstancedMesh(fg,fm,fs);
  for(let k=0;k<fs;k++){const t=(10+k*24)/L,side=k%2?1:-1;O.position.set(n.x+dx*t-uz*side*6,lerp(ya,yb,t)-8*Math.sin(Math.PI*t)+.7,n.y+dz*t+ux*side*6);O.rotation.set(0,Math.atan2(dx,dz),0);O.updateMatrix();fp.setMatrixAt(k,O.matrix)}fp.renderOrder=3;fp.frustumCulled=false;g.add(fp);
  const sil=rastroSil();sil.position.set(hx+ux*24,yb,hz+uz*24);sil.userData.m.scale.setScalar(.9);g.add(sil);
  RZ.root.add(g);return RZ.hid={key,g,pl,m:m+1,fp,fm,lamps,boxG,glow,sil,ax:n.x,az:n.y,hx,hz,ya,L,show:0}}
function rastro3(dt){if(!window.R3D||!R3D.on||!R3D.scene||!window.LP3D||!PATHS.length)return;
  if(!RZ.root||RZ.root.parent!==R3D.scene){RZ.root=new THREE.Group();R3D.scene.add(RZ.root);RZ.hid=null;RZ.sil=null}
  const yaw=R3D.CAM.yaw||0,RS=PROG.F.rastro;
  /* la silueta del encuentro */
  const z=RZ.enc;if(z){plazaBuild();const n=PLZ.nodes[z.hub];if(!RZ.sil){RZ.sil=rastroSil();RZ.root.add(RZ.sil)}const S=RZ.sil,y=n?rzY(n):0;z.y3=y;S.visible=true;S.position.set(z.S[0],y,z.S[1]);S.rotation.y=yaw;
    const m=S.userData.m.material;let op=0;if(z.st==='wait')op=Math.min(.94,(m.opacity||0)+dt*2.6)*(STILL?1:.94+.06*Math.sin(T*7.3)*Math.sin(T*2.1));else if(z.st==='fade'||z.st==='done'){const u=(T-z.t)/.9;op=Math.max(0,.94*(1-u));if(!z.fl){z.fl=1;rastroFlakes(z.S[0],y,z.S[1])}}
    m.opacity=op;S.userData.m.position.x=STILL?0:Math.sin(T*1.3)*1.2;
    /* la página: de su mano a la tuya */
    if(z.st==='fade'||(z.st==='done'&&T-z.td<.5)){if(!RZ.pg){RZ.pg=new THREE.Sprite(rastroPageMat());RZ.pg.scale.set(15,12,1);RZ.root.add(RZ.pg);RZ.pgl=LP3D.kit.glowSprite('#FFF0C8',30);RZ.root.add(RZ.pgl)}
      const u=clamp((T-z.t)/1.15,0,1),e=sm01(u),px=Pl.x+CW[cur][0],pz=Pl.y+CW[cur][1],tx=lerp(z.S[0],px,e),tz=lerp(z.S[1],pz,e),ty=y+lerp(70,48,e)+Math.sin(u*Math.PI)*24;
      RZ.pg.visible=RZ.pgl.visible=true;RZ.pg.position.set(tx,ty,tz);RZ.pgl.position.set(tx,ty,tz);RZ.pg.material.rotation=STILL?0:Math.sin(T*5)*.4;RZ.pg.material.opacity=z.st==='done'?Math.max(0,1-(T-z.td)*2):1;RZ.pgl.material.opacity=.5*RZ.pg.material.opacity}
    else if(RZ.pg)RZ.pg.visible=RZ.pgl.visible=false;
    if(z.st==='done'&&T-z.td>1.6){RZ.enc=null;S.visible=false;m.opacity=0}}
  else if(RZ.sil)RZ.sil.visible=false;
  /* copos */
  for(let i=RZ.flakes.length-1;i>=0;i--){const f=RZ.flakes[i],u=(T-f.t0)/f.life;if(u>=1){RZ.root.remove(f.m);f.m.material.dispose();RZ.flakes.splice(i,1);continue}
    f.m.position.x+=f.v[0]*dt+Math.sin(T*3+f.sp)*.3;f.m.position.y+=f.v[1]*dt;f.m.position.z+=f.v[2]*dt;f.m.material.opacity=1-u;f.m.material.rotation+=dt*(2+f.sp*.3)}
  /* la plaza sin nombre */
  const H=rastroHidBuild();if(!H)return;const tr=crossing&&crossing.trip,on=!!RS.box||!!tr;
  const px=Pl.x+CW[cur][0],pz=Pl.y+CW[cur][1],near=Math.hypot(px-H.ax,pz-H.az),dk=typeof darkLevel==='function'?clamp((darkLevel(cur)-.08)/.4,0,1):.6;
  const fo=(RS.box?.25:1)*(.18+.82*dk)*clamp(1.4-near/420,0,1)*(tr?1:.95+.05*Math.sin(T*2.4));H.fm.opacity=lerp(H.fm.opacity,fo,Math.min(1,dt*4));H.fp.visible=H.fm.opacity>.01;
  const want=RS.box&&!tr?H.m:tr?Math.min(H.m,Math.ceil(((tr.ph==='go'?tr.u||0:1)*H.L+80)/H.L*H.m)):0;H.pl.count=want;
  H.show=lerp(H.show,on?1:0,Math.min(1,dt*2.5));for(const c of H.g.children)if(c!==H.pl&&c!==H.fp)c.visible=H.show>.02;
  for(const l of H.lamps){l.material.color.set(RS.box?'#FFD36A':'#9FB6FF');l.material.opacity=.42*H.show}
  H.boxG.visible=H.show>.02&&!(RS.box&&RZ.boxT&&T-RZ.boxT>2.4);const bt=STILL?0:T;H.glow.material.opacity=.35+.35*Math.max(0,Math.sin(bt*2.2*Math.PI/2));H.boxG.children[1].rotation.z=RS.box?-.9:0;H.boxG.children[1].position.x=RS.box?-6:0;
  const sm=H.sil.userData.m.material;H.sil.rotation.y=yaw;const sw=tr&&tr.ph==='there'?Math.max(0,.9-(T-tr.t0)*.35):RS.box?0:.9*H.show;sm.opacity=lerp(sm.opacity,sw,Math.min(1,dt*3));H.sil.visible=sm.opacity>.01;
  if(tr&&tr.ph==='there'&&!tr.fl&&T-tr.t0>2.2){tr.fl=1;rastroFlakes(H.sil.position.x,H.ya,H.sil.position.z)}}
if(window.R3DX)R3DX.push(dt=>rastro3(dt||1/60));
