/* ══════════ ACTO III · LA COLMENA DE ABAJO (habitaciones 26–30) ══════════
   Una isla nueva bajo el Corazón. Se abre cuando devuelves el primer latido.
   26 · El Andén Vacío       — el último tren, destino Ayer (Silbo, el revisor)
   27 · La Casa de los Ecos  — terror: fantasmas de papel que se acercan cuando te quedas quieto (Eco)
   28 · Objetos Perdidos     — lo que la colmena olvidó (Olvido)
   29 · La Celda del Apicultor — el guardián anterior, dormido (Alvéolo)
   30 · El Reverso           — la Primavera del otro lado del espejo (Etorb)          */
const ABAJO=['and','eco','per','api','rev'];
ORDER.push(...ABAJO);
Object.assign(POS,{and:[-2,8],eco:[-1,8],per:[-1,9],api:[-2,10],rev:[-1,10]});
LINKS.push(['cor','and'],['and','eco'],['eco','per'],['per','api'],['api','rev']);
Object.assign(SEASON,{
  and:{tint:'#9FB6C8',seal:'#4E6A86',icon:'🕰',door:'#DCE6EE',name:'El Andén Vacío'},
  eco:{tint:'#9A8AB0',seal:'#4A3A5E',icon:'☾',door:'#D8D0E6',name:'La Casa de los Ecos'},
  per:{tint:'#D9B77A',seal:'#8A5A2E',icon:'?',door:'#F3E6C4',name:'Objetos Perdidos'},
  api:{tint:'#E4B866',seal:'#A5652A',icon:'⬡',door:'#FBE8C0',name:'La Celda del Apicultor'},
  rev:{tint:'#B8A0C8',seal:'#5A3A6E',icon:'◐',door:'#E6DCF0',name:'El Reverso'}});
Object.assign(HUMAN_NAMES,{and:'Silbo',eco:'Eco',per:'Olvido',api:'Alvéolo',rev:'Etorb'});

/* ── habitantes ── */
Object.assign(HUMANS,{
  and:{k:1.06,old:1,skin:'#C9D2DA',hair:'#E6EAEE',hair_s:'corto',top:'#3A4A6A',sleeve:'#3A4A6A',bottom:'#2A3450',shoes:'#1E2438',hat:HAT.cap('#2A3450','#C9D2DA'),faceX:FX.mustache('#E6EAEE'),hand:HOLD.up(10,6),hold:HOLD.lantern('#BFE0FF'),
    torso:(p,G)=>{const {pt,sh}=G;for(let k=0;k<3;k++)p.flat(p.ell(...pt(4,sh-4-k*5),1.2,1.2,8),'#C9D2DA')}},
  eco:{k:.92,skin:'#E8E0F0',hair:'#B8483A',hair_s:'moño',top:'#E6E0F0',sleeve:'#E6E0F0',skirt:'#D8D0E6',bottom:'#D8D0E6',shoes:'#9A8AB0',hand:HOLD.up(9,8),hold:HOLD.quill},
  per:{k:.98,old:1,skin:'#D9B08A',hair:'#C8C0B4',hair_s:'calvo',top:'#7A5A3A',sleeve:'#7A5A3A',bottom:'#4A3A2A',shoes:'#3A2A20',apron:'#C9A878',faceX:FX.all(FX.glasses('#3A2A20'),FX.beard('#C8C0B4')),hand:HOLD.up(10,8),hold:HOLD.loupe},
  api:{k:1,old:1,pose:'sit',seat:28,skin:'#E0B890',hair:'#F4F0E6',hair_s:'corto',top:'#F3E6C4',sleeve:'#F3E6C4',bottom:'#C9A878',shoes:'#6A4A30',hat:HAT.veil,faceX:FX.beard('#F4F0E6'),hand:HOLD.up(10,4),hold:HOLD.smoker},
  rev:{...HUMANS.pri,skin:'#B8C8D8',top:'#5A8A7A',sleeve:'#3A6A5A',skirt:'#5A8A7A',bottom:'#3A6A5A',hair:'#E8F0F4'}});
/* fantasmas: el mismo dibujo, pero de papel transparente y frío */
const ghostDraw=(id,a=.58)=>{const d=humanDraw(id);return(p,x,y,f,t,ex,portrait)=>{if(portrait)return d(p,x,y,f,t,ex,portrait);const g=p.g;g.save();g.globalAlpha*=a*(STILL?1:.9+.1*Math.sin(t*2.3));d(p,x,y,f,t,ex,portrait);g.restore()}};

/* ── 26 · El Andén Vacío ── */
const AND=mkPal('and','#7E8C96',['#7E8C96','#87959E','#76848E','#8C9AA2','#808E98'],['#3E5468','#435A6E','#3A5064'],['#4E6A86','#9FB6C8'],'#2A3A4A','#5A6E80',
  (p,R0)=>{const y0=-150;for(let k=-9;k<=9;k++){const a=p.P(k*30,y0,0),b=p.P(k*30+18,y0,0);p.line([a,b],'#E4C04A',4,.8)}
    for(let k=0;k<5;k++){const q=p.P(rd(R0,-200,200),rd(R0,-60,180),0);p.flat(p.ell(q[0],q[1],rd(R0,10,24),rd(R0,3,7),14),'rgba(30,40,50,.25)')}});
const andBase=room(AND,(p,R0)=>{const s=p.s;
  /* el reloj del andén, parado a las cuatro menos cuarto */
  const c=p.W(wallPt(ET,.5,92,2));p.cut(p.ell(c[0],c[1],30,30,28),'#2A3450',{blur:3,rough:.2});p.cut(p.ell(c[0],c[1],25,25,28),'#EEF2F4',{sh:0,rough:.1});
  for(let k=0;k<12;k++){const a=k/12*TAU;p.line([[c[0]+Math.cos(a)*20*s,c[1]+Math.sin(a)*20*s],[c[0]+Math.cos(a)*23*s,c[1]+Math.sin(a)*23*s]],'#2A3450',1.4)}
  const ah=(3.75/12)*TAU-Math.PI/2,am=(45/60)*TAU-Math.PI/2;p.line([c,[c[0]+Math.cos(ah)*12*s,c[1]+Math.sin(ah)*12*s]],'#2A3450',2.4);p.line([c,[c[0]+Math.cos(am)*19*s,c[1]+Math.sin(am)*19*s]],'#2A3450',1.6);
  p.line([p.W(wallPt(ET,.5,122,2)),p.W(wallPt(ET,.5,140,2))],'#2A3450',2);
  /* carteles de viaje despegados */
  for(const [e,u,col] of[[EL,.22,'#C9694B'],[EL,.62,'#E4A844'],[ER,.3,'#6F8D8A'],[ER,.74,'#B8484A']]){const q=[p.W(wallPt(e,u-.07,40)),p.W(wallPt(e,u+.07,40)),p.W(wallPt(e,u+.07,96)),p.W(wallPt(e,u-.07,96))];p.cut(q,shade(col,.8),{rough:.5});
    p.cut([q[0],q[1],[lerp(q[1][0],q[2][0],.7),lerp(q[1][1],q[2][1],.7)],[lerp(q[0][0],q[3][0],.85),lerp(q[0][1],q[3][1],.85)]],'#F3E6C4',{sh:0,rough:.4});const m=p.W(wallPt(e,u,72));p.text('⇢',m[0],m[1],14,'#3A2A20',{w:600})}
  /* farolas apagadas en la pared */
  for(const u of[.18,.82]){const b=p.W(wallPt(ET,u,40,2)),t=p.W(wallPt(ET,u,108,2));p.line([b,t],'#2A3450',3);p.cut(p.ell(t[0],t[1]+4*s,7,9,12),'#9FB6C8',{sh:0,rough:.2})}});
function drawTimetable(p){const s=p.s,x=-170,y=-60;for(const dx of[-34,34])p.line([p.P(x+dx,y,0),p.P(x+dx,y,96)],'#2A3450',3);
  const q=[p.P(x-44,y,58),p.P(x+44,y,58),p.P(x+44,y,112),p.P(x-44,y,112)];p.cut(q,'#1E2438',{blur:3,rough:.2});
  for(let k=0;k<4;k++){const a=p.P(x-38,y,102-k*11),b=p.P(x+38,y,102-k*11);p.line([a,b],k===3?'#FFD36A':'#9FB6C8',2.2,k===3?.95:.55)}
  const t=p.P(x,y,114);p.text('SALIDAS',t[0],t[1]-4*s,10,'#E6EAEE',{w:600})}
function drawBenchA(p,x,y,col='#5A4A42'){for(const dx of[-30,30])p.line([p.P(x+dx,y,0),p.P(x+dx,y,20)],'#2A2230',3);box3P(p,x-38,x+38,y-10,y+10,20,24,col,shade(col,.8),shade(col,1.15));
  box3P(p,x-38,x+38,y-12,y-8,24,46,shade(col,.95),null,shade(col,1.1))}
function drawLampPost(p,x,y){const b=p.P(x,y,0),t=p.P(x,y,128);p.line([b,t],'#2A3450',3.4);p.cut([[t[0]-9*p.s,t[1]],[t[0]+9*p.s,t[1]],[t[0]+6*p.s,t[1]-16*p.s],[t[0]-6*p.s,t[1]-16*p.s]],'#2A3450',{rough:.1});p.flat(p.ell(t[0],t[1]-7*p.s,5,6,10),'#BFE0FF')}

/* ── 27 · La Casa de los Ecos ── */
const ECO=mkPal('eco','#4A3E56',['#4A3E56','#52455E','#443850','#584A64','#4E4258'],['#3A3048','#40344E','#362C44'],['#5A4A6E','#9A8AB0'],'#2A2036','#3A2E48',
  (p,R0)=>{for(let k=0;k<4;k++){const q=p.P(rd(R0,-180,180),rd(R0,-100,170),0);p.flat(p.ell(q[0],q[1],rd(R0,30,60),rd(R0,10,20),18),'rgba(20,10,30,.25)')}});
const ecoBase=room(ECO,(p,R0)=>{const s=p.s;
  /* papel pintado a rayas, despegado */
  for(const e of[EL,ET,ER])for(let u=.04;u<.97;u+=.05){const a=p.W(wallPt(e,u,10)),b=p.W(wallPt(e,u,124));p.line([a,b],'rgba(154,138,176,.22)',3)}
  for(const [e,u] of[[EL,.3],[ER,.62],[ET,.14]]){const a=p.W(wallPt(e,u,110)),b=p.W(wallPt(e,u+.06,124)),c=p.W(wallPt(e,u+.03,84));p.cut([a,b,c],'#6A5A7E',{rough:.6})}
  /* retratos sin cara */
  for(const [e,u] of[[EL,.5],[ER,.22],[ER,.82]]){const q=[p.W(wallPt(e,u-.06,58)),p.W(wallPt(e,u+.06,58)),p.W(wallPt(e,u+.06,104)),p.W(wallPt(e,u-.06,104))];p.cut(q,'#8A6A3A',{rough:.3});
    const m=p.W(wallPt(e,u,81));p.cut(p.ell(m[0],m[1],11,15,18),'#2A2036',{sh:0,rough:.2});p.cut(p.ell(m[0],m[1]-6*s,7,8,14),'#D8D0E6',{sh:0,rough:.3})}
  /* el espejo tapado con una sábana */
  const sh=[p.W(wallPt(ET,.42,20,3)),p.W(wallPt(ET,.58,20,3)),p.W(wallPt(ET,.6,120,3)),p.W(wallPt(ET,.5,132,3)),p.W(wallPt(ET,.4,120,3))];p.cut(sh,'#E6E0F0',{blur:4,rough:.8});
  for(const u of[.45,.5,.55]){p.line([p.W(wallPt(ET,u,24,4)),p.W(wallPt(ET,u+.01,118,4))],'#C8C0D8',1.2,.7)}
  /* telarañas en las esquinas altas */
  for(const e of[EL,ER]){const c=p.W(wallPt(e,e===EL?.02:.98,124,2));for(let k=0;k<5;k++){const a=Math.PI*.5+k*.3*(e===EL?1:-1);p.line([c,[c[0]+Math.cos(a)*36*s*(e===EL?1:-1),c[1]+Math.sin(a)*30*s]],'rgba(230,224,240,.5)',.8)}
    for(const r of[12,22,32]){const o=[];for(let k=0;k<5;k++){const a=Math.PI*.5+k*.3*(e===EL?1:-1);o.push([c[0]+Math.cos(a)*r*s*(e===EL?1:-1),c[1]+Math.sin(a)*r*.85*s])}p.line(o,'rgba(230,224,240,.4)',.7)}}});
function drawArmchairE(p,x,y,col='#6A3A4A'){box3P(p,x-30,x+30,y-18,y+18,0,24,col,shade(col,.8),shade(col,1.1));box3P(p,x-30,x+30,y-24,y-14,0,62,shade(col,.92),null,shade(col,1.1));for(const dx of[-30,26])box3P(p,x+dx,x+dx+6,y-18,y+18,0,38,shade(col,.85),null,shade(col,1.05))}
function drawCandelabra(p,x,y,lit){const s=p.s,b=p.P(x,y,0);p.line([b,p.P(x,y,70)],'#8A7A5A',3);p.line([p.P(x-20,y,70),p.P(x+20,y,70)],'#8A7A5A',2.4);
  for(const dx of[-20,0,20]){const q=p.P(x+dx,y,dx?78:84);p.cut([[q[0]-2.4*s,q[1]],[q[0]+2.4*s,q[1]],[q[0]+2.4*s,q[1]-12*s],[q[0]-2.4*s,q[1]-12*s]],'#E6E0D0',{sh:0,rough:.1});if(lit)p.flat(p.ell(q[0],q[1]-15*s,2.4,4,8),'#FFD36A')}}
function drawPiano(p){const x=150,y=-120,col='#2A2036';box3P(p,x-60,x+60,y-26,y+20,0,58,col,shade(col,.8),shade(col,1.3));box3P(p,x-56,x+56,y+14,y+30,40,46,'#F3EEE4',null,'#FBF8F0');for(let k=0;k<14;k++){const q=p.P(x-52+k*8,y+24,46.2);p.flat([[q[0],q[1]],[q[0]+3*p.s,q[1]],[q[0]+3*p.s,q[1]-3*p.s],[q[0],q[1]-3*p.s]],'#2A2036')}}

/* ── 28 · Objetos Perdidos ── */
const PER=mkPal('per','#B8925E',['#B8925E','#C29C68','#AE8854','#C8A472','#BC965F'],['#D8C29A','#DEC8A2','#D4BE94'],['#C9A878','#F3E6C4'],'#6E4A2A','#8A6A4A');
const perBase=room(PER,(p,R0)=>{for(const e of[EL,ET,ER]){for(const z of[30,64,98]){shelf(p,e,e===ET?.08:.06,e===ET?.32:.94,z,18,'#8A5A34');
      for(let u=(e===ET?.1:.08);u<(e===ET?.3:.92);u+=rd(R0,.05,.08)){const w=wallPt(e,u,z,9),c=p.P(w[0],w[1],z),h=rd(R0,10,20),ww=rd(R0,7,11);const col=pick(R0,['#C9A878','#B8925E','#E9DCC6','#8A6A4A','#D8C29A']);
        p.cut([[c[0]-ww*p.s,c[1]],[c[0]+ww*p.s,c[1]],[c[0]+ww*p.s,c[1]-h*p.s],[c[0]-ww*p.s,c[1]-h*p.s]],col,{rough:.2});if(R0()<.4)p.flat([[c[0]-3*p.s,c[1]-h*.5*p.s],[c[0]+3*p.s,c[1]-h*.5*p.s],[c[0]+3*p.s,c[1]-h*.5*p.s-4*p.s],[c[0]-3*p.s,c[1]-h*.5*p.s-4*p.s]],'#F6EEDC')}}
    if(e===ET)for(const z of[30,64,98]){shelf(p,e,.68,.92,z,18,'#8A5A34');booksRow(p,e,.69,.91,z+1,R0)}}
  const sg=p.W(wallPt(ET,.5,112,2));p.cut([[sg[0]-46*p.s,sg[1]-10*p.s],[sg[0]+46*p.s,sg[1]-10*p.s],[sg[0]+46*p.s,sg[1]+10*p.s],[sg[0]-46*p.s,sg[1]+10*p.s]],'#3A2A20',{rough:.2});p.text('OBJETOS PERDIDOS',sg[0],sg[1]+1*p.s,9,'#F3E6C4',{w:600})});
function drawCounter(p){const x=60,y=-90;box3P(p,x-80,x+80,y-20,y+20,0,46,'#8A5A34','#6E4A2A','#A87044');const b=p.P(x+50,y,47);p.cut(p.ell(b[0],b[1]-5*p.s,8,7,14),'#E4C04A',{sh:0,rough:.1});p.line([[b[0],b[1]-12*p.s],[b[0],b[1]-15*p.s]],'#8A6A2A',2);
  for(let k=0;k<3;k++){const q=p.P(x-50+k*16,y,47+k*3);p.cut([[q[0]-7*p.s,q[1]],[q[0]+7*p.s,q[1]],[q[0]+7*p.s,q[1]-3*p.s],[q[0]-7*p.s,q[1]-3*p.s]],'#F6EEDC',{sh:0,rough:.2})}}
function drawShowTable(p){const x=-150,y=60;for(const [dx,dy] of[[-50,-18],[50,-18],[-50,18],[50,18]])p.line([p.P(x+dx,y+dy,0),p.P(x+dx,y+dy,30)],'#6E4A2A',3);box3P(p,x-58,x+58,y-24,y+24,30,35,'#A87044','#8A5A34','#C9A878')}
const PER_OBJ=[{k:'sombrero',x:-190,y:58,label:'Coger el sombrero'},{k:'reloj',x:-150,y:58,label:'Coger el reloj parado'},{k:'muneca',x:-110,y:58,label:'Coger la muñeca de cera'}];
function drawPerObj(p,o){const s=p.s,q=p.P(o.x,o.y,36);
  if(o.k==='sombrero'){p.cut(p.ell(q[0],q[1],16,6,18),'#4A3A5E',{rough:.2});p.cut([[q[0]-9*s,q[1]],[q[0]+9*s,q[1]],[q[0]+7*s,q[1]-12*s],[q[0]-7*s,q[1]-12*s]],'#5A4A6E',{rough:.2});p.line([[q[0]-9*s,q[1]-3*s],[q[0]+9*s,q[1]-3*s]],'#C9A05C',2)}
  else if(o.k==='reloj'){p.cut(p.ell(q[0],q[1]-8*s,9,9,18),'#C9A05C',{rough:.1});p.cut(p.ell(q[0],q[1]-8*s,7,7,18),'#F6EEDC',{sh:0,rough:.1});p.line([[q[0],q[1]-8*s],[q[0]+4*s,q[1]-6*s]],'#3A2A20',1.2);p.line([[q[0],q[1]-8*s],[q[0]-4*s,q[1]-11*s]],'#3A2A20',1);p.line([[q[0],q[1]-17*s],[q[0],q[1]-20*s]],'#C9A05C',1.6)}
  else{p.cut(p.ell(q[0],q[1]-6*s,6,8,14),'#F3E7C8',{rough:.2});p.cut(p.ell(q[0],q[1]-17*s,5,5,14),'#F3E7C8',{rough:.2});p.flat(p.ell(q[0]-2*s,q[1]-18*s,.8,.8,6),'#3A2A20');p.flat(p.ell(q[0]+2*s,q[1]-18*s,.8,.8,6),'#3A2A20')}}

/* ── 29 · La Celda del Apicultor ── */
const APIP=mkPal('api','#C9A060',['#C9A060','#D2AA6A','#BE9656','#D8B276','#C49C5C'],['#E8D2A0','#EDD8A8','#E4CC98'],['#E4B866','#FFF0C8'],'#8A5A2E','#B8823E');
const apiBase=room(APIP,(p,R0)=>{wallHexes(p,ET,.06,.94,20,124,10,['#E4A844','#F0C060','#F6D27A','#D69B2E','#FBE4A0'],R0);
  const w=hexWin(p,EL,.5,84,30);p.cut(hexWin(p,EL,.5,84,36),'#8A5A34',{blur:3,rough:.3});p.flat(w,'#2A3450');p.clip(w,()=>{for(let k=0;k<10;k++){const q=p.W(wallPt(EL,.5+rd(R0,-.08,.08),rd(R0,58,110),-8));p.flat(p.ell(q[0],q[1],.8,.8,6),'#FFF6D8',.8)}});
  /* el traje de apicultor colgado */
  const h=p.W(wallPt(ER,.3,108,4));p.line([h,[h[0],h[1]+6*p.s]],'#6A4226',1.4);const b=[h[0],h[1]+8*p.s];p.cut([[b[0]-14*p.s,b[1]],[b[0]+14*p.s,b[1]],[b[0]+18*p.s,b[1]+60*p.s],[b[0]-18*p.s,b[1]+60*p.s]],'#F3E6C4',{rough:.5});
  p.cut(p.ell(b[0],b[1]-4*p.s,12,10,16),'#E9DCC6',{rough:.3});for(let k=0;k<5;k++)p.line([[b[0]-10*p.s,b[1]-8*p.s+k*2.4*p.s],[b[0]+10*p.s,b[1]-8*p.s+k*2.4*p.s]],'#8A7A5A',.6,.6);
  shelf(p,ER,.6,.9,70,18,'#8A5A34');for(let k=0;k<4;k++){const ww=wallPt(ER,.64+k*.07,70,9),c=p.P(ww[0],ww[1],70);p.cut([[c[0]-5*p.s,c[1]],[c[0]+5*p.s,c[1]],[c[0]+5*p.s,c[1]-13*p.s],[c[0]-5*p.s,c[1]-13*p.s]],'rgba(228,168,68,.9)',{rough:.1})}});
function drawCot(p){const x=-150,y=-90;for(const [dx,dy] of[[-50,-20],[50,-20],[-50,20],[50,20]])p.line([p.P(x+dx,y+dy,0),p.P(x+dx,y+dy,20)],'#6E4A2A',3);box3P(p,x-56,x+56,y-24,y+24,20,30,'#E9DCC6','#C9B898','#F6EEDC');box3P(p,x-56,x-34,y-20,y+20,30,38,'#FBF4E3',null,'#FFFFFF');
  box3P(p,x-30,x+56,y-24,y+24,30,33,'#C9694B',null,'#D98A5A')}
function drawApiTable(p){const x=130,y=40;for(const [dx,dy] of[[-26,-16],[26,-16],[-26,16],[26,16]])p.line([p.P(x+dx,y+dy,0),p.P(x+dx,y+dy,34)],'#6E4A2A',3);box3P(p,x-32,x+32,y-20,y+20,34,39,'#A87044','#8A5A34','#C9A878');
  const q=p.P(x-8,y,40);p.cut(p.ell(q[0],q[1],10,4,14),'#B8823E',{rough:.2});p.cut([[q[0]-4*p.s,q[1]],[q[0]+4*p.s,q[1]],[q[0]+3*p.s,q[1]-12*p.s],[q[0]-3*p.s,q[1]-12*p.s]],'#F3E7C8',{sh:0,rough:.1})}

/* ── 30 · El Reverso: la Primavera al otro lado del espejo ── */
const REV=mkPal('rev','#5A6E64',['#5A6E64','#62766C','#526660','#6A7E74','#5E7268'],['#3E3050','#433656','#3A2C4C'],['#5A4A6E','#B8A0C8'],'#2A2036','#3A2E48',
  (p,R0)=>{for(let k=0;k<8;k++){const q=p.P(rd(R0,-R*.8,R*.8),rd(R0,-R*.5,R*.8),0);for(let j=0;j<4;j++)flowerDot(p,q[0]+rd(R0,-14,14)*p.s,q[1]+rd(R0,-5,5)*p.s,rd(R0,2.2,3.2),pick(R0,['#9AD0C0','#B8E0F0','#C8B6FF']),'#3A2C4C')}});
const revBase=room(REV,(p,R0)=>{const s=p.s;
  /* plantas colgando boca abajo desde lo alto de las paredes */
  for(const e of[EL,ER])for(let u=.1;u<.92;u+=.12){const t=p.W(wallPt(e,u,124,6));p.line([t,[t[0],t[1]+18*s]],'#3A2C4C',1.2);const pc=[t[0],t[1]+20*s];p.cut([[pc[0]-8*s,pc[1]],[pc[0]+8*s,pc[1]],[pc[0]+6*s,pc[1]+10*s],[pc[0]-6*s,pc[1]+10*s]],'#6A8AA0',{rough:.2});
    for(let k=0;k<4;k++)leafShape(p,pc[0]+rd(R0,-5,5)*s,pc[1]+10*s,Math.PI/2+rd(R0,-.9,.9),rd(R0,10,16),pick(R0,['#7AB0A0','#5A8A7A']))}
  /* la ventana hexagonal, invertida: noche con sol negro */
  const w=hexWin(p,ET,.5,80,38);p.cut(hexWin(p,ET,.5,80,46),'#5A4A6E',{blur:3,rough:.3});p.flat(w,'#E8E0F0');p.clip(w,()=>{const m=p.W(wallPt(ET,.5,86,-6));p.flat(p.ell(m[0],m[1],12,12,20),'#2A2036')})});
function drawTreeUpside(p){const s=p.s,x=130,y=-185,top=p.P(x,y,140);for(let k=0;k<5;k++){const a=Math.PI/2+(k-2)*.35;p.line([top,[top[0]+Math.cos(a)*40*s,top[1]+Math.sin(a)*46*s]],'#2A2036',3)}
  for(let k=0;k<14;k++){const a=k*.7,r=24+(k%3)*10;p.cut(p.ell(top[0]+Math.cos(a)*r*s,top[1]+30*s+Math.sin(a)*r*.6*s,12,10,14),pick(rng('tu'+k),['#9AD0C0','#B8E0F0','#C8B6FF']),{rough:.3})}
  const b=p.P(x,y,0);p.line([b,[b[0],b[1]-70*s]],'#3A2C4C',2.2,.5)}
function drawMirror(p,lit){const s=p.s,x=-20,y=-200;const c=p.P(x,y,70);p.cut([[c[0]-30*s,c[1]+64*s],[c[0]+30*s,c[1]+64*s],[c[0]+34*s,c[1]-56*s],[c[0],c[1]-74*s],[c[0]-34*s,c[1]-56*s]],'#8A6A3A',{blur:4,rough:.3});
  p.cut([[c[0]-24*s,c[1]+58*s],[c[0]+24*s,c[1]+58*s],[c[0]+27*s,c[1]-50*s],[c[0],c[1]-66*s],[c[0]-27*s,c[1]-50*s]],lit?'#FFF0C8':'#C8D8E8',{sh:0,rough:.1});
  p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(c[0]-8*s,c[1]-20*s,6,30,10),'rgba(255,255,255,.25)');p.g.restore()}

/* ── las celdas ── */
Object.assign(STYLE.cells,{
  and:{sub:'El andén vacío',base:andBase,props:[{id:'horario',y:-60,bb:[-220,-170,-120,6],draw:drawTimetable},{id:'banco1',y:60,bb:[-210,-16,-110,76],draw:p=>drawBenchA(p,-160,60)},{id:'banco2',y:-40,bb:[110,-110,210,-24],draw:p=>drawBenchA(p,160,-40)},{id:'farola',y:120,bb:[170,-40,230,130],draw:p=>drawLampPost(p,200,120)}],
    solids:[[-170,-60,40],[-160,60,40],[160,-40,40],[200,120,14]],npc:RN('and',20,20,{name:'Silbo',pbg:['#DCE6EE','#4E6A86'],extra:{draw:ghostDraw('and',.66)}}),
    over(p,T,st){if(st)return;const t=p.P(200,120,120),on=Math.sin(T*7)*Math.sin(T*2.3)>-.3;glowA(p,200,120,118,50,34,'rgba(190,224,255,.18)',on?1:.2)}},
  eco:{sub:'La casa de los ecos',base:ecoBase,props:[{id:'sillon',y:40,bb:[-200,-40,-120,60],draw:p=>drawArmchairE(p,-160,40)},{id:'piano',y:-120,bb:[86,-200,214,-60],draw:drawPiano},{id:'velas',y:100,bb:[150,-10,210,110],draw:p=>drawCandelabra(p,180,100,!(PROG.F.ab&&PROG.F.ab.dark))}],
    solids:[[-160,40,40],[150,-120,60],[180,100,20]],npc:RN('eco',0,-90,{name:'Eco',pbg:['#D8D0E6','#4A3A5E'],extra:{draw:ghostDraw('eco',.5)}})},
  per:{sub:'Objetos perdidos',base:perBase,props:[{id:'mostrador',y:-90,bb:[-30,-150,150,-40],draw:drawCounter},{id:'mesita',y:60,bb:[-215,0,-85,70],draw:drawShowTable}],
    solids:[[60,-90,80],[-150,60,60]],npc:RN('per',60,-30,{name:'Olvido',lz:96,pbg:['#F3E6C4','#8A5A2E']})},
  api:{sub:'La celda del apicultor',base:apiBase,props:[{id:'catre',y:-90,bb:[-215,-140,-85,-40],draw:drawCot},{id:'mesa',y:40,bb:[90,-30,170,70],draw:drawApiTable}],
    solids:[[-150,-90,60],[130,40,36]],npc:RN('api',30,-40,{name:'Alvéolo',idle:'sleep',lz:96,pbg:['#FBE8C0','#A5652A'],extra:{turn:false,dy:30}})},
  rev:{sub:'El otro lado del espejo',base:revBase,props:[{id:'arbolinv',y:-185,bb:[60,-260,200,10],draw:drawTreeUpside},{id:'espejo',y:-200,bb:[-60,-240,20,-60],draw:p=>drawMirror(p,false)}],
    solids:[[130,-185,30],[-20,-200,34]],npc:RN('rev',90,40,{name:'Etorb',f:-1,pbg:['#E6DCF0','#5A3A6E'],extra:{draw:ghostDraw('rev',.82)}})}});
for(const id of ABAJO){const n=STYLE.cells[id].npc;if(n.draw===undefined)n.draw=humanDraw(id)}
/* diálogos base (los de cada misión están en abajo_q.js) */
Object.assign(DLG2,{
  and:{first:['Billete, por favor. …Ah. No llevas.','Soy Silbo. Picaba billetes en este andén.','El último tren salió a las cuatro menos cuarto, justo cuando se pararon los relojes.'],
       again:[['Nadie se fue esa noche. O todos se fueron. Depende de a quién preguntes.'],['El reloj marca la hora en que me quedé esperando.']]},
  eco:{first:['…','(Una chica de papel, casi transparente, te mira sin parpadear.)','Si te quedas quieto, vienen. Si te mueves, se esconden.'],
       again:[['No les tengas miedo. Son lo que la gente olvida de sí misma.'],['Yo también soy un eco. El de alguien que no quería irse.']]},
  per:{first:['Bienvenido a Objetos Perdidos. Soy Olvido.','Aquí llega todo lo que la colmena deja de recordar. Llaves, nombres, horas.','Puedes llevarte una cosa, pero solo si sabes de quién es.'],
       again:[['Lo que se pierde no desaparece. Solo cambia de estantería.'],['Si coges lo que no es tuyo, se vuelve a perder.']]},
  api:{first:['(Un anciano duerme sentado. Respira al ritmo de la colmena.)','(Sobre la mesa hay un hueco con la forma de un reloj.)'],
       again:[['(Sigue dormido. Murmura: «…cuatro menos cuarto…»)']]},
  rev:{first:['¡Hola! Soy Etorb. Bueno… soy Brote, pero del otro lado.','Aquí todo va al revés: las plantas cuelgan, el sol es negro y nadie tiene sombra.','Tu sombra sí está. Qué raro.'],
       again:[['El espejo de ahí solo se abre para quien trae a alguien de vuelta.'],['¿Sabes cómo me llamo? Léelo al revés.']]}});
