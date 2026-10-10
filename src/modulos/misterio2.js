/* ══════════ MISTERIO ENTRE ISLAS ══════════
   2 · Niebla entre islas: a veces, al cruzar, sube la niebla; se oyen pasos que no son tuyos
       y algo brilla un momento: una chispa de cera que puedes atrapar.
   3 · El mapa que miente: las plazas y pasarelas solo se dibujan cuando las has pisado;
       las demás son un «?». La plaza sin nombre no sale nunca en el mapa.
   4 · Faroles con mensajes: en algunas plazas cuelga un farol apagado. Con una chispa se enciende
       y dice algo verdadero sobre lo que aún te falta.
   5 · La hora de la colmena: día y noche. De noche todo está más oscuro, la colmena late más
       a menudo (se ven los símbolos) y la silueta de Amaranta solo espera de noche.
   6 · El latido como brújula: si en el cuarto hay un secreto sin encontrar, el latido se acelera
       cuanto más cerca estás. Un corazón pequeño en la esquina late con él.
   Y además: la caja que no pesa nada se devuelve al Corazón, y el rastro se ve también en 2D.
   Estado: PROG.F.m2 = {hora, ch:chispas, cx:cruces, n:{plazas vistas}, e:{pasarelas vistas}, f:{faroles}, s:{dichos}} */
const M2F=()=>{const F=PROG.F;const m=F.m2||(F.m2={});m.n=m.n||{};m.e=m.e||{};m.f=m.f||{};m.s=m.s||{};m.hora=m.hora||0;m.ch=m.ch||0;m.cx=m.cx||0;return m};
const M2ALL=()=>FREE&&!window.RASTRO_TEST;
let M2V=0,M2LT=0;

/* ── 5 · la hora de la colmena: 7 minutos por vuelta (4 de día, ½ atardecer, 2 de noche, ½ amanecer) ── */
const HORA={len:420,day:240,dusk:30,night:120};
function NIGHTK(){const h=M2F().hora%HORA.len,a=HORA.day,b=a+HORA.dusk,c=b+HORA.night;if(h<a)return 0;if(h<b)return sm01((h-a)/HORA.dusk);if(h<c)return 1;return 1-sm01((h-c)/(HORA.len-c))}
const horaPhase=()=>{const h=M2F().hora%HORA.len,a=HORA.day,b=a+HORA.dusk,c=b+HORA.night;return h<a?'dia':h<b?'tarde':h<c?'noche':'alba'};
{const dl0=darkLevel;darkLevel=function(id){const b=dl0(id),k=NIGHTK();return k?lerp(b,Math.max(b,.5),k):b}}

/* ── el reloj y el corazón-brújula en la esquina ── */
let horaEl=null,heartEl=null;
function horaUI(){if(horaEl||!document.querySelector('.ctrl'))return;const st=document.createElement('style');
  st.textContent='#hora{position:relative;overflow:visible}#hora svg{width:30px;height:30px;display:block;margin:auto}#m2heart{position:absolute;right:-3px;bottom:-3px;width:18px;height:18px;border-radius:50%;background:#7A2E3A;color:#FFE3C8;font-size:11px;line-height:18px;text-align:center;opacity:0;transition:opacity .6s;pointer-events:none}#m2heart.on{opacity:1}#m2heart.b{animation:m2b .5s ease-out}@keyframes m2b{0%{transform:scale(1)}30%{transform:scale(1.55)}100%{transform:scale(1)}}'+
  '#niebla{position:absolute;inset:-12%;pointer-events:none;z-index:2;opacity:0;transition:opacity 1.8s ease;--fc:238,232,222}#niebla i{position:absolute;inset:0;background:radial-gradient(38% 30% at 28% 42%,rgba(var(--fc),.9),rgba(var(--fc),0) 72%),radial-gradient(34% 26% at 72% 58%,rgba(var(--fc),.85),rgba(var(--fc),0) 72%),radial-gradient(52% 34% at 50% 88%,rgba(var(--fc),.8),rgba(var(--fc),0) 72%),radial-gradient(46% 30% at 52% 12%,rgba(var(--fc),.7),rgba(var(--fc),0) 72%);animation:nieb 17s ease-in-out infinite alternate}#niebla i+i{animation-duration:23s;animation-direction:alternate-reverse;opacity:.75;transform:scale(1.3)}@keyframes nieb{from{transform:translate(-7%,3%)}to{transform:translate(7%,-3%)}}'+
  '#chispa{position:absolute;z-index:5;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;border:0;cursor:pointer;background:radial-gradient(circle,#FFF6D8 0%,#FFD27A 34%,rgba(255,190,90,.35) 62%,rgba(255,190,90,0) 72%);color:#7A4A1A;font:600 22px Fraunces,Georgia,serif;animation:chf 1.6s ease-in-out infinite alternate}#chispa:focus-visible{outline:2px solid #FFF4D6;outline-offset:3px}@keyframes chf{from{transform:translateY(-6px) scale(.94)}to{transform:translateY(6px) scale(1.06)}}'+
  '@media (prefers-reduced-motion:reduce){#niebla i,#chispa{animation:none}}';document.head.appendChild(st);
  horaEl=document.createElement('button');horaEl.id='hora';horaEl.setAttribute('aria-label',_t('La hora de la colmena'));horaEl.title=_t('La hora de la colmena');
  heartEl=document.createElement('span');heartEl.id='m2heart';heartEl.textContent='♥';heartEl.setAttribute('aria-hidden','true');
  horaEl.addEventListener('click',()=>{const ph=horaPhase(),h=M2F().hora%HORA.len,min=Math.max(1,Math.round(((ph==='dia'?HORA.day:HORA.len+HORA.day)-h)/60));
    note(ph==='noche'?_t('Es de noche en la colmena. Lo escondido se deja ver.'):ph==='tarde'?_t('Atardece en la colmena.'):ph==='alba'?_t('Amanece en la colmena.'):_t('Es de día en la colmena.')+' '+_t('La noche llega en unos {a} min.').replace('{a}',min))});
  const c=document.querySelector('.ctrl');c.insertBefore(horaEl,c.firstChild);horaDraw(true)}
let horaLast='';
function horaDraw(force){if(!horaEl)return;const h=M2F().hora%HORA.len,k=NIGHTK(),key=Math.round(h/4)+':'+Math.round(k*10);if(!force&&key===horaLast)return;horaLast=key;
  const a=h/HORA.len*Math.PI*2,sx=15+Math.sin(a)*9,sy=15-Math.cos(a)*9;
  horaEl.innerHTML=`<svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="12" fill="none" stroke="rgba(255,244,214,.35)" stroke-width="2"/><path d="M15 3 A12 12 0 0 1 ${(15+Math.sin(HORA.day/HORA.len*Math.PI*2)*12).toFixed(1)} ${(15-Math.cos(HORA.day/HORA.len*Math.PI*2)*12).toFixed(1)}" fill="none" stroke="#FFE3A0" stroke-width="2"/>${k>.5?`<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="5" fill="#E6E9FF"/><circle cx="${(sx+2.4).toFixed(1)}" cy="${(sy-1.6).toFixed(1)}" r="4.2" fill="#8A6A9A"/>`:`<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="4.6" fill="#FFE07A"/>`}</svg>`;horaEl.appendChild(heartEl)}

/* ── 2 · la niebla ── */
let fogEl=null,sparkEl=null;
function fogUI(){if(fogEl)return;const st=document.getElementById('stage');if(!st)return;fogEl=document.createElement('div');fogEl.id='niebla';fogEl.innerHTML='<i></i><i></i>';fogEl.setAttribute('aria-hidden','true');st.appendChild(fogEl)}
const WHISPER=['…no era un tren…','…cuenta los latidos…','…¿la has visto pasar?…','…la cera recuerda…','…no mires atrás en el puente…','…ella volvió por aquí…'];
function sparkShow(cr){if(!sparkEl){sparkEl=document.createElement('button');sparkEl.id='chispa';sparkEl.textContent='✦';sparkEl.setAttribute('aria-label',_t('Atrapar la chispa'));sparkEl.title=_t('Atrapar la chispa');sparkEl.addEventListener('click',e=>{e.stopPropagation();sparkCatch()});document.getElementById('stage').appendChild(sparkEl)}
  sparkEl.style.left=(30+Math.random()*40)+'%';sparkEl.style.top=(30+Math.random()*22)+'%';sparkEl.hidden=false;sparkEl.dataset.until=String(T+4.8);Sound.sfx('pick',.25)}
function sparkCatch(){if(!sparkEl||sparkEl.hidden)return;sparkEl.hidden=true;const m=M2F();m.ch++;Sound.sfx('pick');buzz(15);note(_t('Chispa de cera')+` · ${m.ch}`);
  if(!m.s.ch1){m.s.ch1=1;narrate(['Las chispas de la niebla son cera que todavía recuerda el fuego. Algunos faroles de las plazas las están esperando.'],'chispa1')}save()}
addEventListener('keydown',e=>{if(sparkEl&&!sparkEl.hidden&&(e.key==='e'||e.key==='E'||e.key===' ')){sparkCatch();e.preventDefault();e.stopPropagation()}},true);
function fogTick(dt){const cr=crossing;if(cr&&!cr.m2f&&(cr.plan||cr.comp)&&!inTitle){cr.m2f={};const m=M2F();m.cx++;
    if(m.cx>=3&&!cr.trip&&Math.random()<.24+.3*NIGHTK()){cr.m2f.fog={t0:T,w:false,sp:false,st:T+.6}}}
  const fog=cr&&cr.m2f&&cr.m2f.fog;if(fogEl){const on=!!fog&&!STILL&&!mapMode;const o=Math.max(on?(NIGHTK()>.5?.62:.74):0,!mapMode&&window.FOGROOM?FOGROOM():0);if(fogEl.style.opacity!==String(o)){fogEl.style.opacity=o;fogEl.style.setProperty('--fc',NIGHTK()>.5?'150,156,186':'238,232,222')}}
  if(fog){const u=T-fog.t0;
    if(!fog.w&&u>1.4){fog.w=true;note(_t(WHISPER[Math.floor(Math.random()*WHISPER.length)]));if(!said('niebla1'))narrate(['En la niebla los puentes se alargan. Y a veces se oyen pasos que no son de nadie.'],'niebla1',{delay:.6})}
    if(T>fog.st){fog.st=T+.55+Math.random()*.9;Sound.sfx('plank',.07+Math.random()*.06)}
    if(!fog.sp&&u>Math.min(3.2,(cr.dur||6)*.3)){fog.sp=true;sparkShow(cr)}}
  if(sparkEl&&!sparkEl.hidden&&(T>+sparkEl.dataset.until||!cr))sparkEl.hidden=true}

/* ── 3 · el mapa que miente: qué plazas y pasarelas has pisado ── */
const plzSeenN=i=>M2ALL()||!!M2F().n[i];
const plzSeenE=(a,b)=>M2ALL()||!!M2F().e[Math.min(a,b)+'-'+Math.max(a,b)];
function seenTick(){const cr=crossing;if(!cr||inTitle||!PATHS.length)return;plazaBuild();const m=M2F(),px=Pl.x+CW[cur][0],py=Pl.y+CW[cur][1];let ch=false;
  if(cr.comp&&!cr.trip){for(let i=0;i<PLZ.nodes.length;i++){const n=PLZ.nodes[i];if(Math.hypot(n.x-px,n.y-py)>70)continue;if(!m.n[i]){m.n[i]=1;ch=true}
      if(cr.lastN!=null&&cr.lastN!==i&&PLZ.adj[i].some(([j])=>j===cr.lastN)){const k=Math.min(i,cr.lastN)+'-'+Math.max(i,cr.lastN);if(!m.e[k]){m.e[k]=1;ch=true}}cr.lastN=i}}
  else if(cr.plan&&cr.plan.P){const i=PLZ.nodes.findIndex(n=>n.P===cr.plan.P);if(i>=0&&!m.n[i]&&Math.hypot(PLZ.nodes[i].x-px,PLZ.nodes[i].y-py)<80){m.n[i]=1;ch=true}}
  if(ch)M2V++}

/* ── 4 · faroles: uno de cada tres plazas ── */
const isFarol=i=>i%3===0;
function m2Hint(){const F=PROG.F,RS=F.rastro||{},m=M2F(),used=new Set(Object.values(m.f)),nm=id=>_t(SEASON[id].name),c=[];
  if(rastroN()<3)c.push('Hay una silueta que espera en las plazas cuando cae la noche. No le tengas miedo: deja páginas.');
  for(const id of ORDER)if(PAGES[id]&&!(F.pages&&F.pages[id])&&isSeen(id))c.push(_t('Una página del cuaderno duerme en lo oscuro de {a}.').replace('{a}',nm(id)));
  for(const id of ORDER)if(GLYPHS[id]&&!(F.glyphs&&F.glyphs[id])&&isSeen(id))c.push(_t('En {a} hay un símbolo grabado en la cera. Solo se ve cuando la colmena late.').replace('{a}',nm(id)));
  if(rastroN()>=3&&!RS.box)c.push('Las huellas de la tercera plaza siguen ahí. Síguelas de noche.');
  if(RS.box&&!RS.given)c.push('El latido del frasco quiere volver al Corazón.');
  if(PAGES&&Object.keys(PAGES).some(id=>!(F.pages&&F.pages[id])&&!isSeen(id)))c.push('Algunas páginas están en cuartos que todavía no has pisado.');
  c.push('Quien enciende un farol en la niebla nunca cruza solo.','La colmena no se paró de golpe: se fue olvidando de latir, celda a celda.','Las plazas se cruzan porque ella quería que nadie se quedara sin camino.');
  return c.find(t=>!used.has(t))||c[c.length-1]}
function farolLight(cr,i){const m=M2F();if(m.f[i]||m.ch<1)return;m.ch--;const t=m2Hint();m.f[i]=t;Sound.sfx('seal',.5);buzz([15,40,15]);note('🏮 '+_t('El farol se enciende'));narrClear();narrate([t]);M2V++;
  if(PLZ.nodes.filter((_,k)=>isFarol(k)).every((_,k2)=>m.f[k2*3]))achieve('faroles');save();if(crossing===cr&&cr.hold)plazaAsk(cr)}

/* ── enganches del cruce: forzar la parada si hay un farol que encender ── */
{const st0=plazaStep;plazaStep=function(cr){if(!cr.m2i&&cr.comp&&!cr.trip){cr.m2i=1;try{const hub=rastroHub(cr.comp),m=M2F();
      if(isFarol(hub)&&!m.f[hub]&&!M2ALL()){if(m.ch>0){cr.choose=true;cr.chosen=false;const k=cr.opts.findIndex(o=>o.to===cur);if(k>0)cr.opts.unshift(cr.opts.splice(k,1)[0])}
        else if(!m.s['fa'+hub]){m.s['fa'+hub]=1;setTimeout(()=>{if(crossing===cr)note(_t('Un farol apagado cuelga en esta plaza.'))},1400);if(!said('farol0'))narrate(['Dejé faroles apagados en algunas plazas. Si les das una chispa, te dirán lo que yo no me atreví a decir.'],'farol0',{delay:2.2})}}}catch(e){console.warn('m2',e)}}
    return st0(cr)};
  const ask0=plazaAsk;plazaAsk=function(cr){ask0(cr);try{const hub=rastroHub(cr.comp),m=M2F();if(!isFarol(hub)||M2ALL())return;const box=plzEl.querySelector('.opts');if(!box)return;
    if(m.f[hub]){const q=document.createElement('small');q.className='farolq';q.textContent='🏮 '+_t(m.f[hub]);box.parentNode.insertBefore(q,box);return}
    const bt=document.createElement('button');bt.className='farol';bt.textContent='🏮 '+_t('Encender el farol')+` (${m.ch})`;bt.disabled=m.ch<1;if(m.ch<1)bt.title=_t('Necesitas una chispa: la niebla las trae.');
    bt.addEventListener('click',()=>{if(crossing===cr&&cr.hold&&!cr.trip)farolLight(cr,hub)});box.prepend(bt);if(m.ch>0)setTimeout(()=>bt.focus(),60)}catch(e){console.warn('m2',e)}}
  const st=document.createElement('style');st.textContent='.plaza button.farol{background:#5A3A1E;color:#FFE6B0;box-shadow:0 2px 0 #2E1E0E}.plaza button.farol:disabled{opacity:.55;cursor:default}.plaza small.farolq{font-style:italic;max-width:440px;margin:0 auto;color:#6A3E1E}';document.head.appendChild(st)}

/* ── 6 · el latido como brújula ── */
function m2Target(){const F=PROG.F,RS=F.rastro||{},pts=[];
  if(crossing){const z=crossing.rz;if(z&&z.st==='wait'){const px=Pl.x+CW[cur][0],py=Pl.y+CW[cur][1];return{v:clamp(1-Math.hypot(px-z.S[0],py-z.S[1])/900,0,1)*.8+.2}}return null}
  if(PAGES[cur]&&!(F.pages&&F.pages[cur]))pts.push(PAGES[cur]);if(GLYPHS[cur]&&!(F.glyphs&&F.glyphs[cur]))pts.push(GLYPHS[cur]);if(cur==='cor'&&RS.box&&!RS.given)pts.push([0,10]);
  if(pts.length){let d=1e9;for(const p of pts)d=Math.min(d,Math.hypot(p[0]-Pl.x,p[1]-Pl.y));return{v:clamp(1-d/440,0,1)*.82+.18}}
  for(const d of CELLS[cur].doors){const id=d.to;if(isSeen(id)&&((PAGES[id]&&!(F.pages&&F.pages[id]))||(GLYPHS[id]&&!(F.glyphs&&F.glyphs[id]))))return{v:.08,far:1}}return null}
{const bt0=beatTick;beatTick=function(){const now=T,dt=Math.min(.1,Math.max(0,now-M2LT));M2LT=now;
    try{m2Tick(dt)}catch(e){if(!m2Tick.err){m2Tick.err=1;console.warn('m2',e)}}
    if(inTitle||M2ALL())return bt0();const tg=m2Target();if(heartEl)heartEl.classList.toggle('on',!!tg&&!tg.far);if(!tg)return bt0();
    const keep=BEAT.pulse;BEAT.pulse=1e12;bt0();BEAT.pulse=keep;
    if(T>(BEAT.pulse||0)){BEAT.pulse=T+lerp(1.9,.42,tg.v);Sound.sfx('thump',.25+.75*tg.v);if(heartEl&&!tg.far){heartEl.classList.remove('b');void heartEl.offsetWidth;heartEl.classList.add('b')}
      if(!tg.far&&tg.v>.3&&!said('brujula1'))narrate(['El latido se acelera cuando algo escondido está cerca. Fíate de él.'],'brujula1',{delay:.4})}}}

/* ── el tictac de todo lo anterior (una vez por fotograma, en 2D y en 3D) ── */
let horaPh=null;
function m2Tick(dt){horaUI();fogUI();if(inTitle)return;const m=M2F();
  const busy=document.visibilityState!=='visible'||(typeof BOOK!=='undefined'&&!BOOK.hidden);if(!busy)m.hora+=dt;horaDraw(false);
  const ph=horaPhase();if(horaPh&&ph!==horaPh&&!M2ALL()){if(ph==='tarde'){note(_t('Atardece en la colmena.'));if(!said('noche1'))narrate(['De noche la colmena enseña otras cosas. Lo que de día es cera, de noche es camino.'],'noche1',{delay:1})}
    else if(ph==='noche'){achieve('noche');if(T-(BEAT.t0||0)>8)BEAT.next=Math.min(BEAT.next,T+2)}else if(ph==='alba')note(_t('Amanece en la colmena.'))}horaPh=ph;
  /* de noche la colmena late más a menudo: se ven los símbolos */
  if(ph==='noche'&&BEAT.next>T+11)BEAT.next=T+rd(Math.random,8,11);
  fogTick(dt);seenTick();if(window.RASTRO_TEST||!FREE){if(rastroN()>=3)achieve('rastro')}}

/* ══ en 3D: plazas vistas, «?» en las que no, faroles, y la plaza sin nombre fuera del mapa ══ */
let QTEX=null;function qMat(){if(QTEX)return QTEX;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='rgba(90,60,40,.55)';g.beginPath();g.arc(32,32,26,0,TAU);g.fill();g.fillStyle='#FFF4D6';g.font='600 38px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText('?',32,35);
  return QTEX=new THREE.SpriteMaterial({map:R3D.tex(c,{nomip:true}),transparent:true,depthWrite:false,fog:false,opacity:.75})}
plaza3Tick=function(){if(!window.R3D||!R3D.on||!R3D.scene||!PATHS.length||!window.LP3D)return;plazaBuild();const key=PLZ.n+':'+M2V+':'+(M2ALL()?1:0);if(PLZ3&&PLZ3.key===key&&PLZ3.g.parent===R3D.scene)return;
  if(PLZ3){R3D.scene.remove(PLZ3.g);PLZ3.g.traverse(o=>{if(o.isMesh&&o.geometry&&!o.geometry.userData.shared)o.geometry.dispose()})}
  const {Bk,CYL,BOX,glowSprite}=LP3D.kit,T3=THREE,g=new T3.Group(),B=new Bk(),Bf=new Bk(),N=PLZ.nodes,far={},qs=[];
  const hy=n=>(R3D.lift(n.P.a)+R3D.lift(n.P.b))/2+n.z;
  N.forEach((n,i)=>{const y=hy(n);if(!plzSeenN(i)){const q=new T3.Sprite(qMat());q.scale.setScalar(26);q.position.set(n.x,y+34,n.y);q.renderOrder=3;g.add(q);qs.push(q);return}
    B.add(CYL(62,54,10,6),'#B8823E',[n.x,y-5,n.y],[0,Math.PI/2,0]);B.add(CYL(60,60,1.6,6),'#E0B35E',[n.x,y+.6,n.y],[0,Math.PI/2,0]);
    for(let k=0;k<6;k++){const a=k*Math.PI/3,px=n.x+Math.cos(a)*58,pz=n.y+Math.sin(a)*58;B.add(CYL(2,2.4,22,5),'#7A5232',[px,y+11,pz])}
    for(const s of[-1,1]){const px=n.x+s*40,pz=n.y-30;B.add(CYL(1.8,1.8,46,5),'#5A3A22',[px,y+23,pz]);B.add(BOX(9,11,9),'#5A3A22',[px,y+50,pz]);const sp=glowSprite('#FFD36A',46);sp.material.opacity=.45;sp.position.set(px,y+50,pz);g.add(sp);
      const core=new T3.Mesh(new T3.SphereGeometry(3.4,8,6),new T3.MeshBasicMaterial({color:'#FFE3A0'}));core.position.set(n.x+s*40,y+50,n.y-30);g.add(core)}
    if(isFarol(i)){const fx=n.x,fz=n.y+40;B.add(CYL(2.2,2.6,64,6),'#3E2A1C',[fx,y+32,fz]);B.add(BOX(26,2.4,2.4),'#3E2A1C',[fx+12,y+63,fz]);B.add(CYL(.5,.5,8,4),'#3E2A1C',[fx+22,y+58,fz]);
      B.add(CYL(5.4,4.2,3,6),'#3E2A1C',[fx+22,y+54,fz]);B.add(CYL(4.4,4.4,11,6),'#2A1E16',[fx+22,y+47,fz]);B.add(CYL(5.4,3.6,3,6),'#3E2A1C',[fx+22,y+40,fz]);
      const core=new T3.Mesh(new T3.CylinderGeometry(3.6,3.6,9,6),new T3.MeshBasicMaterial({color:'#4A3A30'}));core.position.set(fx+22,y+47,fz);g.add(core);const sp=glowSprite('#FFB04A',64);sp.position.set(fx+22,y+47,fz);sp.material.opacity=0;g.add(sp);far[i]={core,sp}}});
  for(const [i,j] of PLZ.edges){if(!plzSeenE(i,j)||Math.hypot(N[i].x-N[j].x,N[i].y-N[j].y)<40)continue;const a=N[i],b=N[j],ya=hy(a),yb=hy(b),dx=b.x-a.x,dz=b.y-a.y,L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,ang=Math.atan2(-uz,ux),m=Math.max(4,Math.round((L-110)/15));
    for(let k=0;k<=m;k++){const t=(55+k*(L-110)/m)/L,x=a.x+dx*t,z=a.y+dz*t,y=lerp(ya,yb,t)-10*Math.sin(Math.PI*t);B.add(BOX(11,2.6,30),k%2?'#C9924E':'#B57E3E',[x,y-1.3,z],[0,ang,0])}
    for(const s of[-1,1]){const steps=10;for(let k=0;k<steps;k++){const t0=.08+k*.84/steps,t1=t0+.84/steps,p=t=>[a.x+dx*t-uz*s*17,lerp(ya,yb,t)-10*Math.sin(Math.PI*t)+16,a.y+dz*t+ux*s*17],P0=p(t0),P1=p(t1),cx=(P0[0]+P1[0])/2,cy=(P0[1]+P1[1])/2,cz=(P0[2]+P1[2])/2,l=Math.hypot(P1[0]-P0[0],P1[1]-P0[1],P1[2]-P0[2]);
      Bf.add(BOX(l,1.6,1.6),'#8A6A4A',[cx,cy,cz],[0,ang,Math.atan2(P1[1]-P0[1],Math.hypot(P1[0]-P0[0],P1[2]-P0[2]))]);Bf.add(CYL(1.3,1.3,16,4),'#7A5232',[P0[0],P0[1]-8,P0[2]])}}}
  B.mesh(g);Bf.mesh(g);R3D.scene.add(g);PLZ3={g,n:PLZ.n,key,far,qs}};
function m2Tick3(){if(!window.R3D||!R3D.on||!PLZ3)return;const m=M2F();
  for(const i in PLZ3.far){const F=PLZ3.far[i],lit=!!m.f[i];F.core.material.color.set(lit?'#FFE0A0':'#4A3A30');F.sp.material.opacity=lit?(.5+(STILL?0:.08*Math.sin(T*9+ +i)*Math.sin(T*3.3))):0}
  for(const q of PLZ3.qs)q.material.opacity=.55+(STILL?0:.15*Math.sin(T*1.7));
  /* la plaza sin nombre no sale en el mapa */
  if(RZ.hid)RZ.hid.g.visible=!mapMode}
if(window.R3DX)R3DX.push(()=>m2Tick3());

/* ══ la caja que no pesa nada vuelve al Corazón ══ */
(PUZ.things.cor=PUZ.things.cor||[]).push({id:'latido',x:10,y:30,z:30,r:80,ax:30,ay:70,label:()=>'Devolver el latido',show:()=>{const RS=PROG.F.rastro;return!!(RS&&RS.box&&!RS.given)}});
{const a0=act;act=function(t){if(t&&t.id==='latido'){const RS=PROG.F.rastro;if(!RS||!RS.box||RS.given)return;RS.given=1;
    WAVE={t0:T+.4,id:'cor'};BEAT.t0=T+.3;BEAT.next=T+6;Sound.sfx('seal');setTimeout(()=>Sound.sfx('thump',1),420);setTimeout(()=>Sound.sfx('thump',.8),900);buzz([30,90,30,90,40]);
    ZKhold={v:.62,until:T+3.6};EMO.cor={ch:'♥',t0:T+.6};Pl.happy=T+3;note('♥ '+_t('El primer latido vuelve al Corazón'));narrClear();
    narrate(['Ahí está. El primer latido, otra vez en su sitio.','No sé si eso me despierta. Pero la colmena ya no tiene que acordarse sola de cómo se late.'],null,{delay:1.2});achieve('latido');stateChanged();return}a0(t)}}
/* en el cuaderno, después del rastro */
{const ob=openBook;openBook=function(tab){ob(tab);const F=PROG.F,box=document.getElementById('bpages');if(!box)return;const RS=F.rastro||{},m=F.m2||{};
    if(RS.given){const a=document.createElement('article'),sm=document.createElement('small');sm.textContent=_t('El Corazón');a.appendChild(sm);a.appendChild(document.createTextNode(_t('Devolviste el primer latido al Corazón. Late distinto: como si alguien se acordara.')));box.appendChild(a)}
    const fs=Object.entries(m.f||{});if(fs.length){const e=box.querySelector('p.empty');if(e)e.remove();const h=document.createElement('h3');h.className='rastroh';h.textContent=_t('Faroles de las plazas')+` · ${fs.length}`;box.appendChild(h);
      for(const [,t] of fs){const a=document.createElement('article'),sm=document.createElement('small');sm.textContent='🏮 '+_t('Farol');a.appendChild(sm);a.appendChild(document.createTextNode(_t(t)));box.appendChild(a)}}}}
ACH.push(['rastro','El rastro','Encuentra las tres páginas del rastro de Amaranta'],['latido','El primer latido','Devuelve el latido del frasco al Corazón'],['faroles','Faroles encendidos','Enciende todos los faroles de las plazas'],['noche','La hora de la colmena','Ve caer la noche sobre la colmena']);

/* ══ en 2D (papel clásico): plazas pisadas, la silueta, la página y la plaza sin nombre ══ */
function m2Draw2D(g,s){if(window.R3D&&R3D.on||inTitle||!PATHS.length)return;plazaBuild();const pen=STYLE.Pen(g,camX,camY,s,'m2',true),N=PLZ.nodes,W=g.canvas.width,H=g.canvas.height,m=M2F();
  const P=(x,y,z)=>[camX+x*s,camY+(y*K-z)*s],vis=q=>q[0]>-200&&q[0]<W+200&&q[1]>-200&&q[1]<H+200;
  const cr=crossing,showAll=!!cr&&(cr.comp||cr.trip);if(!showAll&&!RZ.enc)return;
  /* pasarelas y plazas pisadas */
  g.save();for(const [i,j] of PLZ.edges){if(!plzSeenE(i,j))continue;const a=P(N[i].x,N[i].y,N[i].z),b=P(N[j].x,N[j].y,N[j].z);if(!vis(a)&&!vis(b))continue;g.strokeStyle='#8A5A2E';g.lineWidth=22*s;g.lineCap='butt';g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();
    g.strokeStyle='#C9924E';g.lineWidth=17*s;g.setLineDash([9*s,4*s]);g.stroke();g.setLineDash([])}g.restore();
  N.forEach((n,i)=>{const c=P(n.x,n.y,n.z);if(!vis(c))return;if(!plzSeenN(i)){pen.text('?',c[0],c[1]-30*s,20,'rgba(90,60,40,.7)',{w:600});return}
    pen.cut(hexV(60,n.x,n.y).map(v=>P(v[0],v[1],n.z-6)),'#9A6A32',{sh:0});pen.cut(hexV(56,n.x,n.y).map(v=>P(v[0],v[1],n.z)),'#E0B35E',{sh:0,rough:.3});
    if(isFarol(i)){const q=P(n.x+22,n.y+40,n.z+47);pen.line([P(n.x,n.y+40,n.z),P(n.x,n.y+40,n.z+64),P(n.x+22,n.y+40,n.z+64)],'#3E2A1C',2.4);g.save();if(m.f[i]){g.globalCompositeOperation='lighter';pen.flat(pen.ell(q[0],q[1],16,16,16),'rgba(255,176,74,.35)')}g.restore();pen.flat(pen.ell(q[0],q[1],4.6,6,10),m.f[i]?'#FFE0A0':'#4A3A30')}});
  /* la plaza sin nombre (solo cuando la recorres o ya la encontraste, y nunca en el mapa) */
  const RS=PROG.F.rastro;if(RS&&RS.a&&!mapMode&&(RS.box||(cr&&cr.trip))){const a=N[RS.a.ni],hx=RS.a.x,hz=RS.a.y,tr=cr&&cr.trip,u=tr?(tr.ph==='go'?tr.u||0:1):1;
    const A=P(a.x,a.y,a.z),Bq=P(lerp(a.x,hx,Math.min(1,u+.15)),lerp(a.y,hz,Math.min(1,u+.15)),a.z);g.save();g.strokeStyle='#CDB892';g.lineWidth=17*s;g.setLineDash([8*s,4*s]);g.beginPath();g.moveTo(A[0],A[1]);g.lineTo(Bq[0],Bq[1]);g.stroke();g.restore();
    if(RS.box||u>.6){pen.cut(hexV(54,hx,hz).map(v=>P(v[0],v[1],a.z-6)),'#B8A27E',{sh:0});pen.cut(hexV(50,hx,hz).map(v=>P(v[0],v[1],a.z)),'#EDE1C6',{sh:0,rough:.3})}}
  /* la silueta y la página */
  const z=RZ.enc;if(z&&z.st!=='done'||z&&T-z.td<1){const S=rastroSilTex(),n=N[z.hub],q=P(z.S[0],z.S[1],n?n.z:0),fd=z.st==='wait'?1:Math.max(0,1-(T-z.t)/.9);
    if(fd>0){g.save();g.globalAlpha=.94*fd*(STILL?1:.94+.06*Math.sin(T*7.3));g.drawImage(S.c,q[0]+S.box[0]*s*1.1,q[1]+S.box[1]*s*1.1,(S.box[2]-S.box[0])*s*1.1,(S.box[3]-S.box[1])*s*1.1);g.restore()}
    if(z.st!=='wait'){const u=clamp((T-z.t)/1.15,0,1),e=sm01(u),px=Pl.x+CW[cur][0],py=Pl.y+CW[cur][1],pq=P(lerp(z.S[0],px,e),lerp(z.S[1],py,e),(n?n.z:0)+lerp(70,48,e)+Math.sin(u*Math.PI)*24);if(z.st!=='done')pageDraw(pen,(pq[0]-camX)/s,(pq[1]-camY)/(s*K),T)}}
  /* tú, mientras cruzas por las plazas (en 2D el cuarto no te dibuja fuera de él) */
  if(cr&&(cr.comp||cr.trip)){const wx=Pl.x+CW[cur][0],wy=Pl.y+CW[cur][1];STYLE.player(pen,wx,wy-(Pl.z||0)/K,0,Pl.f,T,Pl.moving)}}
{const pd0=window.POSTDRAW;window.POSTDRAW=(g,s)=>{if(pd0)pd0(g,s);try{m2Draw2D(g,s)}catch(e){if(!m2Draw2D.err){m2Draw2D.err=1;console.warn('m2 2d',e)}}}}
