/* ══════════ HABITANTES · títeres humanos de papel ══════════
   Mismo esqueleto chibi que el jugador. Cada habitante es una ficha:
   edad/escala, piel, pelo, ropa, pose, sombrero, rasgos y lo que lleva en la mano. */
function drawHuman(p,x,y,f,t,ex,portrait,H){
  const s=p.s,g=p.g,Q0=p.P(x,y,0),k=H.k||1;
  if(!portrait&&H.pose!=='lie'&&!p.noShadow)p.flat(p.ell(Q0[0],Q0[1]+1*s,17*k,6*k),'rgba(70,40,15,.22)');
  const mv=portrait?0:(H._mv||0),lean=portrait||H.pose==='lie'?0:(Math.sin(t*.9+(H.ph||0)*3)*.022+mv*.05*f+(H._nod||0)*Math.sin(t*9)*.02);
  g.save();g.translate(Q0[0],Q0[1]);g.scale(k,k);g.rotate(lean);g.translate(-Q0[0],-Q0[1]);
  try{humanBody(p,x,y,f,t,ex,portrait,H)}finally{g.restore()}}
function humanBody(p,x,y,f,t,ex,portrait,H){
  const s=p.s,Q=p.P(x,y,0),X=d=>Q[0]+d*f*s,Y=d=>Q[1]-d*s,pt=(a,b)=>[X(a),Y(b)];
  const sit=H.pose==='sit'&&!portrait,sz=H.seat||26,mv=portrait?0:(H._mv||0),wph=H._ph||0,br=portrait?0:Math.sin(t*1.7+(H.ph||0))*.6+mv*Math.abs(Math.sin(wph))*1.8+(H._nod||0)*Math.max(0,Math.sin(t*9))*1.2,tall=H.tall||0,old=H.old?1:0;
  const hip=sit?sz+4:13+tall*5,sh=hip+18+tall*3+br,hd=sh+17+br*.3-old,W=H.tw||1,tx=d=>1+(d-1)*W,G={pt,X,Y,hip,sh,hd,t,f,s,sit,sz,portrait,tx,H};
  if(H.back)H.back(p,G);
  /* piernas */
  if(sit){for(const k of[0,1]){const kx=k?3:-1,col=k?H.bottom:shade(H.bottom);p.line([pt(kx,hip),pt(kx+12,hip-1),pt(kx+13,2)],col,5.2);p.cut(p.ell(X(kx+15),Y(1),4.4,2.4,12),H.shoes,{rough:.2,dy:1})}}
  else for(const k of[0,1]){const kx=k?2.5:-1.5,col=k?H.bottom:shade(H.bottom),o=k?1:-1,sw=mv*Math.sin(wph)*o*5,lf=mv*Math.max(0,Math.sin(wph)*o)*3.4;p.line([pt(kx,hip),pt(kx+sw*.5,hip*.5+lf*.6),pt(kx+sw,1+lf)],col,5.2);p.cut(p.ell(X(kx+2+sw),Y(1+lf),4.4,2.6,14),H.shoes,{rough:.2,dy:1})}
  /* falda o abrigo largo */
  if(H.skirt){const lo=sit?hip-2:Math.max(3,hip*.35);p.cut([pt(tx(-8),hip+2),pt(tx(10),hip+2),pt(sit?16:tx(13),lo),pt(sit?-4:tx(-11),lo)],H.skirt,{rough:.5})}
  const hand=H.hand?H.hand(G):null;
  /* brazo de atrás */
  const wave=portrait||H.twoHands?0:(H._wave||0),armB=[pt(tx(-2+old),sh-3),hand&&H.twoHands?hand[1]:wave>0?pt(-8+Math.sin(t*14)*3*wave,sh+14*wave):pt(-3-mv*Math.sin(wph)*4,hip+3+br)];p.line(armB,shade(H.sleeve||H.top),4.2);p.cut(p.ell(armB[1][0],armB[1][1],2.5,2.5,10),H.skin,{sh:0,rough:.1});
  /* torso */
  p.cut([pt(tx(-7+old),sh),pt(tx(8+old),sh),pt(tx(10),hip-2),pt(tx(-8),hip-2)],H.top,{rough:.5});
  if(H.overall){p.cut([pt(tx(-5),sh-6),pt(tx(8),sh-6),pt(tx(10),hip-2),pt(tx(-8),hip-2)],H.overall,{rough:.3});p.line([pt(tx(-4),sh),pt(tx(-4),sh-6)],H.overall,1.6);p.line([pt(tx(7),sh),pt(tx(7),sh-6)],H.overall,1.6)}
  if(H.apron)p.cut([pt(tx(0),sh-5),pt(tx(10),sh-5),pt(tx(12),hip-9),pt(tx(1),hip-9)],H.apron,{rough:.4});
  if(H.belt)p.flat([pt(tx(-8),hip+1.5),pt(tx(10),hip+1.5),pt(tx(10),hip-1),pt(tx(-8),hip-1)],H.belt);
  if(H.torso)H.torso(p,G);
  /* brazo de delante y lo que lleva */
  const use=portrait?0:(H._use||0),hf0=hand?hand[0]:pt(5+mv*Math.sin(wph)*4,hip+3+br),hf=[hf0[0],hf0[1]-use*7*s];p.line([pt(tx(5+old),sh-3),hf],H.sleeve||H.top,4.2);
  if(H.hold)H.hold(p,G,hf);p.cut(p.ell(hf[0],hf[1],2.6,2.6,10),H.inkHands||H.skin,{sh:0,rough:.1});
  if(H.neck)H.neck(p,G);
  /* cabeza */
  const hc=pt(2+old,hd),R=14.5;
  if(H.head){H.head(p,G,hc,R);if(H.hat)H.hat(p,G);return}
  if(H.hairBack)H.hairBack(p,G);
  p.cut(p.ell(hc[0],hc[1],R,R*1.02,28),H.skin,{rough:.3});
  p.flat(p.ell(X(-6+old),Y(hd-1),2.4,3,10),shade(H.skin));
  if(H.hair)hairH(p,G,H);
  const e1=pt(6+old,hd),e2=pt(11.5+old,hd),mo=pt(9.5+old,hd-5.5);
  if(ex==='sleep'){for(const e of[e1,e2])p.line([[e[0]-2.6*s,e[1]],[e[0],e[1]+1.4*s],[e[0]+2.6*s,e[1]]],C.ink,1.3);p.line([[mo[0]-2*s,mo[1]],[mo[0]+2*s,mo[1]]],C.ink,1.1)}
  else if(!H.noFace)face(p,e1,e2,mo,f,t,ex,{er:2.4,ph:H.ph||.5,cheek:H.cheek===false?null:pt(5+old,hd-3.5)});
  if(H.faceX)H.faceX(p,G,e1,e2,mo);
  if(H.hat)H.hat(p,G)}
/* peinados */
function hairH(p,G,H){const {pt,hd}=G,c=H.hair,st=H.hair_s||'corto',arc=(a0,a1,r,n=16)=>{const o=[];for(let k=0;k<=n;k++){const a=(a0+(a1-a0)*k/n)*Math.PI/180;o.push(pt(2+Math.cos(a)*r,hd+Math.sin(a)*r))}return o};
  if(st==='calvo'){p.cut([pt(-12,hd-2),pt(-12,hd+6),pt(-6,hd+4),pt(-6,hd-4)],c,{rough:.4});return}
  if(st==='afro'){for(let a=150;a>=-30;a-=26){const q=pt(2+Math.cos(a*Math.PI/180)*15,hd+3+Math.sin(a*Math.PI/180)*15);p.cut(p.ell(q[0],q[1],7,7,14),c,{rough:.4})}return}
  let front=[pt(14,hd+4),pt(10,hd+7),pt(6,hd+5),pt(2,hd+8),pt(-3,hd+6)],back=[];
  if(st==='flequillo')front=[pt(15,hd+1),pt(12,hd+2.5),pt(9,hd+1.5),pt(6,hd+2.5),pt(2,hd+2),pt(-3,hd+5)];
  if(st==='largo'||st==='melena')back=[pt(-15,hd-18),pt(-9,hd-19),pt(-6,hd-6)];
  p.cut([...arc(205,-12,16.2),...front,...back],c,{rough:.5});
  if(st==='trenzas')for(const [dx,side] of[[-9,-1],[-3,1]]){for(let k=0;k<4;k++){const q=pt(dx+side*.5,hd-8-k*5);p.cut(p.ell(q[0],q[1],3,3.2,10),c,{sh:0,rough:.3})}const e=pt(dx,hd-28);p.flat(p.ell(e[0],e[1],2.6,2,8),H.ribbon||C.petalD)}
  if(st==='moño'){const b=pt(-8,hd+13);p.cut(p.ell(b[0],b[1],6.5,6,16),c,{rough:.4})}
  if(st==='moñoalto'){const b=pt(0,hd+19);p.cut(p.ell(b[0],b[1],8,6.5,16),c,{rough:.4})}
  if(st==='coleta'){p.cut([pt(-12,hd+4),pt(-20,hd-2),pt(-19,hd-14),pt(-14,hd-4)],c,{rough:.4})}
  if(st==='rizado')for(let a=190;a>=-10;a-=24){const q=pt(2+Math.cos(a*Math.PI/180)*15.5,hd+Math.sin(a*Math.PI/180)*15.5);p.cut(p.ell(q[0],q[1],4.4,4.4,12),c,{sh:0,rough:.4})}}
/* rasgos */
const FX={
  glasses:(col='#6A4A30')=>(p,G,e1,e2)=>{for(const e of[e1,e2]){const E=p.ell(e[0],e[1],3.6,3.6,14);p.line([...E,E[0]],col,1.1)}p.line([[e1[0]+3.6*G.s,e1[1]],[e2[0]-3.6*G.s,e2[1]]],col,1)},
  sunglasses:(p,G,e1,e2)=>{for(const e of[e1,e2])p.flat(p.ell(e[0],e[1],4,3.2,14),'#2A2230');p.line([[e1[0],e1[1]-1*G.s],[e2[0],e2[1]-1*G.s]],'#2A2230',1.2);p.line([[e2[0]-1*G.s,e2[1]-1.4*G.s],[e2[0]+1.4*G.s,e2[1]-1.4*G.s]],'#FFFFFF',.8,.6)},
  mustache:(col,w=1)=>(p,G,e1,e2,mo)=>{const s=G.s;p.cut([[mo[0]-7*w*s,mo[1]+1*s],[mo[0]-2*s,mo[1]+3.4*s],[mo[0]+2*s,mo[1]+3.4*s],[mo[0]+7*w*s,mo[1]+1*s],[mo[0]+4*s,mo[1]+.2*s],[mo[0],mo[1]+1.4*s],[mo[0]-4*s,mo[1]+.2*s]],col,{sh:0,rough:.3})},
  beard:(col)=>(p,G,e1,e2,mo)=>{const {pt,hd}=G;p.cut([pt(-2,hd-2),pt(3,hd-12),pt(10,hd-17),pt(15,hd-9),pt(14,hd-3),pt(9,hd-6),pt(4,hd-5)],col,{rough:.6})},
  rosy:(p,G,e1,e2)=>{p.flat(p.ell(e2[0]+1*G.s,e2[1]-4*G.s,3,2,10),C.petal,.8)},
  soot:(p,G,e1,e2)=>{p.flat(p.ell(e1[0]-2*G.s,e1[1]-5*G.s,3,1.6,8),'#5A4A42',.5);p.flat(p.ell(e2[0]+1*G.s,e2[1]+5*G.s,2,1.2,8),'#5A4A42',.4)},
  all:(...fs)=>(...a)=>{for(const fn of fs)fn(...a)}
};
/* sombreros */
const HAT={
  straw:(sprouts)=>(p,G)=>{const {pt,hd,t,s}=G,b=pt(2,hd+11);p.cut(p.ell(b[0],b[1],26,7.2,28),'#E9C46A',{rough:.5});p.cut([pt(-9,hd+11),pt(13,hd+11),pt(11,hd+22),pt(-7,hd+22)],'#F2D37A',{rough:.4});p.flat([pt(-9,hd+13),pt(13,hd+13),pt(12.5,hd+16),pt(-8.5,hd+16)],C.sageD);
    if(sprouts)for(const [dx,h,a] of[[-4,10,-.5],[3,14,.1],[9,9,.6]]){const q=pt(dx,hd+22),w=Math.sin(t*2+dx)*.08;p.line([q,[q[0]+Math.sin(a+w)*h*.5*s,q[1]-h*s]],C.sageDD,1.4);p.cut(p.leaf(q[0]+Math.sin(a+w)*h*.5*s,q[1]-h*s,-Math.PI/2+a+w,8,3.2),C.sage,{sh:0,rough:.2})}},
  wide:(col,veil)=>(p,G)=>{const {pt,hd,s}=G,b=pt(2,hd+11);if(veil)p.flat([pt(-20,hd+11),pt(24,hd+11),pt(20,hd-6),pt(-16,hd-6)],'rgba(250,246,236,.3)');p.cut(p.ell(b[0],b[1],27,7.4,28),col,{rough:.4});p.cut([pt(-8,hd+11),pt(12,hd+11),pt(10,hd+21),pt(-6,hd+21)],shade(col,.9),{rough:.3});p.flat([pt(-8,hd+13),pt(12,hd+13),pt(11.6,hd+15.5),pt(-7.6,hd+15.5)],C.honey)},
  chef:(p,G)=>{const {pt,hd}=G;p.cut([pt(-9,hd+10),pt(13,hd+10),pt(12,hd+16),pt(-8,hd+16)],'#F7F2E8',{rough:.2});for(const [dx,r] of[[-5,7],[2,8.5],[9,7]]){const q=pt(dx,hd+24);p.cut(p.ell(q[0],q[1],r,r*.9,16),'#FBF7EF',{rough:.4})}},
  top:(col)=>(p,G)=>{const {pt,hd}=G,b=pt(2,hd+11);p.cut(p.ell(b[0],b[1],19,5,24),col,{rough:.2});p.cut([pt(-7,hd+11),pt(11,hd+11),pt(10,hd+32),pt(-6,hd+32)],col,{rough:.2});p.flat([pt(-7,hd+13),pt(11,hd+13),pt(10.8,hd+17),pt(-6.8,hd+17)],C.petalD)},
  cap:(col,band)=>(p,G)=>{const {pt,hd}=G;p.cut([pt(-11,hd+8),pt(14,hd+8),pt(15,hd+18),pt(-10,hd+19)],col,{rough:.2});p.cut([pt(8,hd+8),pt(22,hd+6),pt(20,hd+9),pt(8,hd+10)],shade(col,.7),{rough:.1});if(band)p.flat([pt(-11,hd+9),pt(14,hd+9),pt(14,hd+11.5),pt(-11,hd+11.5)],band)},
  souwester:(p,G)=>{const {pt,hd}=G;p.cut([pt(-18,hd+4),pt(22,hd+6),pt(14,hd+12),pt(-12,hd+11)],'#F2C94C',{rough:.3});const cap=[];for(let k=0;k<=12;k++){const a=(200-k*15)*Math.PI/180;cap.push(pt(2+Math.cos(a)*15,hd+6+Math.sin(a)*14))}p.cut(cap,'#F2C94C',{rough:.3})},
  beret:(col)=>(p,G)=>{const {pt,hd}=G,b=pt(0,hd+14);p.cut(p.ell(b[0],b[1],17,7,24,-.12),col,{rough:.4});const tip=pt(0,hd+21);p.line([tip,[tip[0],tip[1]-3*G.s]],col,1.6)},
  beanie:(col)=>(p,G)=>{const {pt,hd}=G,cap=[];for(let k=0;k<=16;k++){const a=(200-k*13.4)*Math.PI/180;cap.push(pt(2+Math.cos(a)*16,hd+2+Math.sin(a)*17))}p.cut(cap,col,{rough:.4});p.flat([pt(-13,hd+3),pt(17,hd+3),pt(17,hd+7),pt(-13,hd+7)],shade(col,.8));const pp=pt(2,hd+20);p.cut(p.ell(pp[0],pp[1],4.6,4.6,14),'#F2EADB',{rough:.4})},
  miner:(p,G)=>{const {pt,hd,t,s}=G,cap=[];for(let k=0;k<=14;k++){const a=(195-k*15)*Math.PI/180;cap.push(pt(2+Math.cos(a)*16.5,hd+3+Math.sin(a)*16))}p.cut(cap,'#E4A844',{rough:.2});p.cut([pt(-14,hd+3),pt(19,hd+3),pt(19,hd+6),pt(-14,hd+6)],'#C9872F',{rough:.1});
    const l=pt(15,hd+11);p.cut(p.ell(l[0],l[1],4,4,12),'#FFF4C2',{sh:0,rough:0});if(!G.portrait){p.g.save();p.g.globalCompositeOperation='lighter';p.flat([[l[0],l[1]-2*s],[l[0]+70*G.f*s,l[1]+6*s],[l[0]+70*G.f*s,l[1]+46*s],[l[0],l[1]+3*s]],'rgba(255,240,170,.10)');p.g.restore()}},
  flat:(col)=>(p,G)=>{const {pt,hd}=G;p.cut([pt(-12,hd+7),pt(12,hd+11),pt(22,hd+8),pt(14,hd+15),pt(-10,hd+15)],col,{rough:.3})},
  scarf:(col)=>(p,G)=>{const {pt,hd}=G,cap=[];for(let k=0;k<=14;k++){const a=(20+k*12.86)*Math.PI/180;cap.push(pt(1+Math.cos(a)*17,hd+1+Math.sin(a)*17))}cap.push(pt(-17,hd-14),pt(-10,hd-15),pt(-6,hd-4),pt(-2,hd+4),pt(8,hd+6.5));p.cut(cap,col,{rough:.3});p.line([pt(-15,hd+4),pt(2,hd+12)],'rgba(0,0,0,.12)',1.2)},
  veil:(p,G)=>{const {pt,hd,s}=G;p.flat([pt(-18,hd+11),pt(22,hd+11),pt(19,hd-12),pt(-15,hd-12)],'rgba(250,246,236,.38)');for(let k=-3;k<=4;k++)p.line([pt(2+k*4.6,hd+11),pt(2+k*4.2,hd-12)],'rgba(90,70,50,.3)',.8);const b=pt(2,hd+12);p.cut(p.ell(b[0],b[1],24,6.6,26),'#F4EFE2',{rough:.4});const cr=[];for(let k=0;k<=14;k++){const an=Math.PI+k/14*Math.PI;cr.push([b[0]+Math.cos(an)*11*s,b[1]+Math.sin(an)*12*s])}p.cut(cr,'#FBF8F0',{rough:.3})},
  hood:(p,G)=>{const {pt,hd}=G,ring=[];for(let k=0;k<=20;k++){const a=k/20*TAU;ring.push(pt(3+Math.cos(a)*19,hd+1+Math.sin(a)*19))}p.cut(ring,'#F3E6C4',{rough:1.6});const inn=[];for(let k=0;k<=18;k++){const a=k/18*TAU;inn.push(pt(4+Math.cos(a)*12.5,hd+Math.sin(a)*13))}p.flat(inn,'#E7B994')}
};
/* objetos en la mano: devuelven dónde va la mano */
const HOLD={
  up:(dx=10,dz=9)=>G=>[G.pt(dx,G.hip+dz)],
  can:(p,G,h)=>{const s=G.s;p.cut([[h[0]-3*s,h[1]],[h[0]+7*G.f*s,h[1]-1*s],[h[0]+7*G.f*s,h[1]+9*s],[h[0]-3*s,h[1]+9*s]],C.teal,{rough:.2});p.line([[h[0]+7*G.f*s,h[1]+2*s],[h[0]+15*G.f*s,h[1]-4*s]],C.tealD,2);if(!G.portrait)for(let k=0;k<3;k++){const u=(G.t*1.3+k/3)%1;p.flat(p.ell(h[0]+(15+u*4)*G.f*s,h[1]+(-4+u*22)*s,1.2,1.8,8),'#8FC3D6',1-u)}},
  books:(p,G,h)=>{const s=G.s;[['#B8484A',0],['#3F7F5F',1],['#E4A844',2],['#4A548E',3]].forEach(([c,i])=>p.cut([[h[0]-6*s+i*.6*s,h[1]-4*s-i*4*s],[h[0]+8*s+i*.6*s,h[1]-4*s-i*4*s],[h[0]+8*s,h[1]-i*4*s],[h[0]-6*s,h[1]-i*4*s]],c,{rough:.1,dy:1}))},
  ladle:(p,G,h)=>{const s=G.s;p.line([[h[0],h[1]+3*s],[h[0]+4*G.f*s,h[1]-18*s]],'#B8783A',2.2);p.cut(p.ell(h[0]+5*G.f*s,h[1]-20*s,5,3.4,12),'#B8783A',{rough:.1})},
  lantern:(glow='#FFD36A')=>(p,G,h)=>{const s=G.s,l=[h[0]+2*G.f*s,h[1]+9*s];p.line([h,[l[0],l[1]-6*s]],'#6A4226',1.2);p.cut([[l[0]-4*s,l[1]-6*s],[l[0]+4*s,l[1]-6*s],[l[0]+5*s,l[1]+5*s],[l[0]-5*s,l[1]+5*s]],'#6A4226',{rough:.1});p.flat(p.ell(l[0],l[1],3,4,10),glow);if(!G.portrait){p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(l[0],l[1],16,16,18),glow,.14+.04*Math.sin(G.t*7));p.g.restore()}},
  puppet:(p,G,h)=>{const s=G.s,w=Math.sin(G.t*2)*.2;p.line([h,[h[0]+6*G.f*s,h[1]-20*s]],'#8A5A34',1.2);const c=[h[0]+7*G.f*s,h[1]-26*s];p.flat([[c[0]-8*s,c[1]+2*s],[c[0],c[1]-4*s+w*s],[c[0]+9*s,c[1]+1*s],[c[0]+2*s,c[1]+5*s]],'#2A2230')},
  spyglass:(p,G,h)=>{const s=G.s;p.cut([[h[0]-2*s,h[1]+1*s],[h[0]+14*G.f*s,h[1]+7*s],[h[0]+15*G.f*s,h[1]+3*s],[h[0]-1*s,h[1]-2*s]],'#C9A05C',{rough:.1});p.line([[h[0]+6*G.f*s,h[1]+4*s],[h[0]+7*G.f*s,h[1]+1*s]],'#8A5A2E',1.4)},
  candle:(p,G,h)=>{const s=G.s,c=[h[0]+1*G.f*s,h[1]+4*s];p.cut([[c[0]-2.4*s,c[1]],[c[0]+2.4*s,c[1]],[c[0]+2.4*s,c[1]+12*s],[c[0]-2.4*s,c[1]+12*s]],'#FBF4E3',{rough:.1});const fl=G.portrait?0:Math.sin(G.t*11)*.6;p.flat([[c[0]-2*s,c[1]+12*s],[c[0]+fl*s,c[1]+20*s],[c[0]+2*s,c[1]+12*s]],'#F5A83A');if(!G.portrait){p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(c[0],c[1]+15*s,14,14,16),'rgba(255,190,90,.16)');p.g.restore()}},
  pick:(p,G,h)=>{const s=G.s;p.line([[h[0],h[1]+2*s],[h[0]-2*G.f*s,h[1]-18*s]],'#8A5A34',2);p.cut([[h[0]-12*G.f*s,h[1]+4*s],[h[0]+4*G.f*s,h[1]+7*s],[h[0]+8*G.f*s,h[1]+4*s],[h[0]-4*G.f*s,h[1]+2*s]],'#8A93A6',{rough:.1})},
  hammer:(p,G,h)=>{const s=G.s,sw=G.portrait?0:Math.max(0,Math.sin(G.t*3))*.5;const e=[h[0]+(3-sw*6)*G.f*s,h[1]+(16-sw*4)*s];p.line([h,e],'#8A5A34',2.2);p.cut([[e[0]-6*s,e[1]-2*s],[e[0]+6*s,e[1]-2*s],[e[0]+6*s,e[1]+4*s],[e[0]-6*s,e[1]+4*s]],'#5A5A66',{rough:.1})},
  pole:(p,G,h)=>{const s=G.s;p.line([[h[0],h[1]-24*s],[h[0]+1*s,h[1]+22*s]],'#6A74B0',1.6)},
  box:(p,G,h)=>{const s=G.s;p.cut([[h[0]-9*s,h[1]-6*s],[h[0]+9*s,h[1]-6*s],[h[0]+9*s,h[1]+6*s],[h[0]-9*s,h[1]+6*s]],'#B8783A',{rough:.2});p.flat([[h[0]-9*s,h[1]+2*s],[h[0]+9*s,h[1]+2*s],[h[0]+9*s,h[1]+4*s],[h[0]-9*s,h[1]+4*s]],'#E4A844');p.flat(p.ell(h[0],h[1],2,2,8),'#F3E0C0')},
  book:(p,G,h)=>{const s=G.s;p.cut([[h[0]-7*s,h[1]-3*s],[h[0]+7*s,h[1]-3*s],[h[0]+7*s,h[1]+7*s],[h[0]-7*s,h[1]+7*s]],'#4A548E',{rough:.1});p.line([[h[0],h[1]-3*s],[h[0],h[1]+7*s]],'#F3E6C4',1)},
  palette:(p,G,h)=>{const s=G.s,c=[h[0]+3*G.f*s,h[1]];p.cut(p.ell(c[0],c[1],10,6.5,18,.3),'#D9B77A',{rough:.2});[['#B8484A',-4,-1],['#3E8FA0',0,-3],['#E4A844',4,-1],['#6F8D5E',1,2]].forEach(([col,dx,dy])=>p.flat(p.ell(c[0]+dx*s,c[1]+dy*s,1.8,1.4,8),col))},
  basket:(p,G,h)=>{const s=G.s,c=[h[0],h[1]+5*s];p.cut([[c[0]-9*s,c[1]-5*s],[c[0]+9*s,c[1]-5*s],[c[0]+7*s,c[1]+5*s],[c[0]-7*s,c[1]+5*s]],'#C98A42',{rough:.3});for(let k=-1;k<=1;k++)p.flat(p.ell(c[0]+k*4.5*s,c[1]-6*s,2.6,2,10),[C.petal,C.butter,C.sage][k+1])},
  pipe:(p,G,h)=>{const s=G.s,e=[h[0]+18*G.f*s,h[1]-3*s];p.line([h,e],'#8A93A6',1.6);const gl=G.portrait?.9:.85+.15*Math.sin(G.t*5);p.cut(p.ell(e[0]+2*G.f*s,e[1],4.4,4,12),'#F08A3A',{sh:0,rough:.1});p.flat(p.ell(e[0]+2*G.f*s,e[1]-1*s,2,1.6,8),'#FFE08A',gl);if(!G.portrait){p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(e[0],e[1],14,12,16),'rgba(255,150,60,.14)');p.g.restore()}},
  radio:(p,G,h)=>{const s=G.s;p.cut([[h[0]-7*s,h[1]-4*s],[h[0]+7*s,h[1]-4*s],[h[0]+7*s,h[1]+6*s],[h[0]-7*s,h[1]+6*s]],'#5E6B7A',{rough:.1});p.line([[h[0]+5*s,h[1]+6*s],[h[0]+8*s,h[1]+22*s]],'#3A3A48',1);const on=G.portrait||Math.sin(G.t*4)>0;p.flat(p.ell(h[0]+8*s,h[1]+23*s,1.8,1.8,8),on?'#E0584A':'#6A3A3A');p.flat(p.ell(h[0]-2*s,h[1]+1*s,3,3,10),'#2E3A52')},
  smoker:(p,G,h)=>{const s=G.s;p.cut([[h[0]-3*s,h[1]-5*s],[h[0]+5*s,h[1]-5*s],[h[0]+5*s,h[1]+7*s],[h[0]-3*s,h[1]+7*s]],'#B8C0C8',{rough:.1});p.cut([[h[0]-3*s,h[1]+7*s],[h[0]+5*s,h[1]+7*s],[h[0]+1*s,h[1]+11*s]],'#9AA2AA',{rough:.1});if(!G.portrait)for(let k=0;k<3;k++){const u=(G.t*.4+k/3)%1;p.flat(p.ell(h[0]+(1+u*8)*G.f*s,h[1]+(11+u*26)*s,2+u*5,2+u*4,12),'#F3EEE6',.5*(1-u))}},
  fan:(p,G,h)=>{const s=G.s;for(let k=0;k<7;k++){const a=-Math.PI*.9+k/6*Math.PI*.8+Math.sin(G.t*2.4)*.08;p.cut([[h[0],h[1]],[h[0]+Math.cos(a)*14*s,h[1]+Math.sin(a)*14*s],[h[0]+Math.cos(a+.13)*14*s,h[1]+Math.sin(a+.13)*14*s]],k%2?C.petal:C.cream,{sh:0,rough:0})}},
  print:(p,G,h)=>{const s=G.s;p.cut([[h[0]-2*s,h[1]-12*s],[h[0]+14*G.f*s,h[1]-12*s],[h[0]+15*G.f*s,h[1]+4*s],[h[0]-1*s,h[1]+4*s]],C.cream,{rough:.2});p.flat(p.ell(h[0]+6*G.f*s,h[1]-4*s,4,4,12),C.petalD,.85);p.flat(p.ell(h[0]+9*G.f*s,h[1]-2*s,3.4,2.6,12),C.teal,.7)},
  star:(p,G,h)=>{const s=G.s;p.cut([[h[0]-8*s,h[1]-8*s],[h[0]+8*s,h[1]-10*s],[h[0]+9*s,h[1]+4*s],[h[0]-7*s,h[1]+6*s]],'#2E3561',{rough:.2});for(const [dx,dy] of[[-3,-4],[3,-1],[0,2],[5,-6]])p.flat(p.ell(h[0]+dx*s,h[1]+dy*s,1,1,6),'#F6D98A')},
  loupe:(p,G,h)=>{const s=G.s;p.flat(p.ell(h[0]+2*G.f*s,h[1]+3*s,4,4,12),'#C9A05C');p.flat(p.ell(h[0]+2*G.f*s,h[1]+3*s,2.6,2.6,10),'#DCEFF6')},
  quill:(p,G,h)=>{const s=G.s;HOLD.book(p,G,h);p.cut(p.leaf(h[0]+6*G.f*s,h[1]+2*s,-Math.PI/2-.5*G.f,18,4),'#F3E6C4',{sh:0,rough:.2})}
};
/* ── fichas de los 25 habitantes ── */
const HUMANS={
  /* Capítulo 1 */
  pri:{k:.86,skin:'#E7B994',hair:'#5A3A22',hair_s:'trenzas',ribbon:C.petalD,top:'#F2EADB',overall:'#6F8D5E',bottom:'#6F8D5E',shoes:'#E4A844',
    hand:HOLD.up(10,10),hold:HOLD.can,hat:HAT.straw(true),faceX:FX.rosy},
  ver:{k:1.02,old:1,skin:'#C98A64',hair:'#F2EADB',hair_s:'calvo',top:'#F8F4EA',bottom:'#D8574A',shoes:'#E9C46A',faceX:FX.all(FX.sunglasses,FX.mustache('#F4F0E6',1.25)),hat:HAT.wide('#E9C46A'),
    neck:(p,G)=>{const {pt,sh}=G;p.line([pt(-4,G.sh-1),pt(4,G.sh-9),pt(8,G.sh-1)],'#D8574A',.9)},hand:HOLD.up(9,8),hold:HOLD.fan},
  oto:{k:1.08,tall:1,skin:'#D9A07E',hair:'#3A2A20',hair_s:'moñoalto',top:'#8A5A3A',sleeve:'#8A5A3A',bottom:'#5A3A2A',skirt:'#6E4630',shoes:'#3A2A20',apron:'#F3E6C4',inkHands:'#3A4660',
    faceX:FX.glasses('#3A2A20'),hand:HOLD.up(9,8),hold:HOLD.print,
    hat:(p,G)=>{const {pt,hd}=G;for(const [dx,a,col] of[[-4,-.5,'#E4A844'],[4,.4,'#3E8FA0'],[0,-.1,'#B8484A']]){const b=pt(dx,hd+20);p.line([b,[b[0]+Math.sin(a)*12*G.s,b[1]-12*G.s]],col,1.8)}},
    torso:(p,G)=>{const {pt,sh,hip}=G;for(const [dx,dz,r] of[[4,-8,2.4],[7,-13,1.8],[3,-16,1.4]])p.flat(p.ell(...pt(dx,sh+dz),r,r*.8,10),'#3A4660',.7)}},
  inv:{k:1,old:1,pose:'sit',seat:26,skin:'#F0C8A8',hair:'#F4F0E6',hair_s:'calvo',top:'#8FA9B6',bottom:'#5E6B7A',shoes:'#6A4A30',faceX:FX.all(FX.beard('#F4F0E6'),FX.glasses('#8A6A4A')),
    hat:HAT.beanie('#C9694B'),twoHands:true,hand:G=>[G.pt(13,G.hip+10),G.pt(9,G.hip+8)],
    hold:(p,G,h)=>{const {s,t}=G,w=G.portrait?0:Math.sin(t*6)*1.4*s;p.line([[h[0]-10*s,h[1]-6*s+w],[h[0]+6*s,h[1]+4*s]],'#B58A5A',1.5);p.line([[h[0]+2*s,h[1]-7*s-w],[h[0]-10*s,h[1]+4*s]],'#B58A5A',1.5);p.cut([[h[0]-8*s,h[1]+1*s],[h[0]+2*s,h[1]+1*s],[h[0]+3*s,h[1]+9*s],[h[0]-7*s,h[1]+10*s]],C.petalD,{rough:.3})}},
  /* Capítulo 2 */
  esp:{k:.94,skin:'#8D5A3B',hair:'#2A1E18',hair_s:'afro',top:'#F3E6C4',bottom:'#2E3561',shoes:'#6A4226',hand:HOLD.up(10,9),hold:HOLD.star,faceX:FX.rosy,
    back:(p,G)=>{const {pt,sh,hip,t,s}=G,w=G.portrait?0:Math.sin(t*1.6)*1.5,cape=[pt(-6,sh+2),pt(5,sh+2),pt(4,hip-6),pt(-4,hip-10+w),pt(-14,hip-6-w),pt(-17,hip+8),pt(-10,sh-2)];p.cut(cape,'#2E3561',{rough:.4});p.clip(cape,()=>{for(const [a,b] of[[-8,hip-2],[-13,hip+4],[-5,hip+8],[-11,sh-6],[-3,hip-5]])p.text('✦',...pt(a,b),5,'#F6D98A')})}},
  oce:{k:1.04,skin:'#E7B994',top:'#5B7F8E',sleeve:'#5B7F8E',bottom:'#4E6E7C',shoes:'#3A3A48',belt:'#8A6A3A',hand:HOLD.up(9,7),
    head:(p,G,hc,R)=>{const {s,pt,hd,t}=G;p.cut(p.ell(hc[0],hc[1],R+3,R+3.4,30),'#C9A05C',{rough:.2});p.flat(p.ell(hc[0]-4*s,hc[1]-5*s,6,4,16,-.5),'#E8C98E',.7);
      const fp=pt(8,hd);p.cut(p.ell(fp[0],fp[1],7,7,20),'#8A6A3A',{sh:0,rough:0});p.flat(p.ell(fp[0],fp[1],5,5,18),'#23404C');p.flat(p.ell(fp[0]-1.6*s,fp[1]-1.8*s,1.6,1.2,8),'#FFFFFF',.7);
      const sp=pt(-3,hd+6);p.cut(p.ell(sp[0],sp[1],3.4,3.4,12),'#8A6A3A',{sh:0,rough:0});p.flat(p.ell(sp[0],sp[1],2.2,2.2,10),'#23404C');
      p.cut([pt(-10,hd-12),pt(14,hd-12),pt(15,hd-17),pt(-11,hd-17)],'#B08A4A',{rough:.1});for(let k=0;k<5;k++){const q=pt(-8+k*5,hd-14.5);p.flat(p.ell(q[0],q[1],.9,.9,6),'#6A4A2A')}
      if(!G.portrait)for(let k=0;k<3;k++){const u=(t*.35+k/3)%1,q=pt(-4+Math.sin(t*2+k)*2,hd+18+u*40);const E=p.ell(q[0],q[1],1.4+u*2,1.4+u*2,10);p.line([...E,E[0]],'#FFFFFF',.8,.7*(1-u))}}},
  des:{k:1.02,skin:'#B97A55',hair:'#3A2A20',hair_s:'corto',top:'#E9C28A',bottom:'#8A6A4A',shoes:'#5A3A2A',apron:'#8A5A3A',hand:HOLD.up(10,9),hold:HOLD.pipe,
    faceX:(p,G,e1,e2,mo)=>{const {pt,hd,s}=G;p.cut([pt(-6,hd-4),pt(16,hd-4),pt(15,hd-11),pt(-5,hd-12)],'#2E9A9A',{rough:.3});p.cut([pt(-10,hd-9),pt(-16,hd-19),pt(-11,hd-20),pt(-7,hd-10)],'#2E9A9A',{rough:.2})},
    hat:(p,G)=>{const {pt,hd,s}=G;p.line([pt(-12,hd+6),pt(16,hd+6)],'#5A4A42',2.2);for(const dx of[5.5,11.5]){const q=pt(dx,hd+6);p.cut(p.ell(q[0],q[1],3.8,3.4,14),'#5A4A42',{sh:0,rough:0});p.flat(p.ell(q[0],q[1],2.6,2.2,12),'#6FC0A0')}}},
  ant:{k:1,skin:'#E7B994',hair:'#9A5A2A',hair_s:'corto',top:'#E07A4E',sleeve:'#E07A4E',bottom:'#5E6B7A',shoes:'#3A3A48',skirt:'#E07A4E',hand:HOLD.up(10,9),hold:HOLD.radio,faceX:FX.rosy,
    hairBack:HAT.hood,hat:(p,G)=>{}},
  /* Capítulo 3 · Los oficios */
  col:{k:.9,skin:'#D9A07E',top:'#F4EFE2',sleeve:'#F4EFE2',bottom:'#F4EFE2',shoes:'#E4A844',hand:HOLD.up(10,9),hold:HOLD.smoker,hat:HAT.veil,hair:'#5A3A22',hair_s:'corto',
    torso:(p,G)=>{const {pt,sh,hip}=G;p.line([pt(1,sh-1),pt(1,hip)],'#D9CFBB',1);p.cut([pt(-10,hip+1),pt(-8,hip-6),pt(-4,hip-5),pt(-6,hip+1)],'#E4A844',{rough:.2})}},
  bib:{k:1.1,tall:1,old:1,skin:'#E9C4A4',hair:'#B8B0A4',hair_s:'calvo',top:'#4E6B46',bottom:'#5A4A3A',shoes:'#3A2A20',faceX:FX.all(FX.glasses('#6A4A30'),FX.mustache('#B8B0A4',.8)),hand:HOLD.up(9,10),hold:HOLD.books},
  coc:{k:1.06,skin:'#C98A64',hair:'#3A2A20',hair_s:'moño',top:'#C9694B',bottom:'#8A4A34',skirt:'#C9694B',shoes:'#5A3A2A',apron:'#F7F2E8',hat:HAT.chef,hand:HOLD.up(9,9),hold:HOLD.ladle,faceX:FX.rosy},
  rel:{k:1,skin:'#E7B994',hair:'#6A4A30',hair_s:'corto',top:'#F2EADB',bottom:'#3A3A48',shoes:'#2A2230',hand:HOLD.up(9,9),hold:HOLD.loupe,faceX:FX.all(FX.mustache('#6A4A30',.9),(p,G,e1)=>{const s=G.s;p.cut(p.ell(e1[0],e1[1],4.4,4.4,14),'#C9A05C',{sh:0,rough:0});p.flat(p.ell(e1[0],e1[1],3,3,12),'#DCEFF6');p.line([[e1[0]-4*s,e1[1]],[e1[0]-10*s,e1[1]+3*s]],'#C9A05C',.8)}),
    torso:(p,G)=>{const {pt,sh,hip}=G;p.cut([pt(-6,sh-1),pt(8,sh-1),pt(9,hip),pt(-7,hip)],'#6E3E17',{rough:.3});p.line([pt(0,sh-8),pt(6,sh-11),pt(8,sh-9)],'#E4A844',1)}},
  /* Capítulo 4 · Los sueños */
  inn:{k:1,skin:'#E9C4A4',hair:'#C9D3E8',hair_s:'melena',top:'#2E3561',bottom:'#2E3561',skirt:'#3A4278',shoes:'#1E2448',hand:HOLD.up(10,6),hold:HOLD.lantern('#CFE3FF')},
  tea:{k:1.02,skin:'#D9A07E',hair:'#2A1E18',hair_s:'corto',top:'#B8484A',sleeve:'#B8484A',bottom:'#2A2230',shoes:'#2A2230',hat:HAT.top('#2A2230'),hand:HOLD.up(10,12),hold:HOLD.puppet,faceX:FX.mustache('#2A1E18',.7)},
  tre:{k:1,skin:'#8D5A3B',hair:'#2A1E18',hair_s:'moño',top:'#2A305C',sleeve:'#2A305C',bottom:'#2A305C',skirt:'#2A305C',shoes:'#1E2448',hat:HAT.cap('#2A305C','#E4A844'),hand:HOLD.up(10,6),hold:HOLD.lantern('#FFD36A'),
    torso:(p,G)=>{const {pt,sh,hip}=G;for(let k=0;k<3;k++)p.flat(p.ell(...pt(5,sh-4-k*5),1.2,1.2,8),'#E4A844')}},
  far:{k:1.02,old:1,skin:'#E0B08A',hair:'#F4F0E6',hair_s:'corto',top:'#F2C94C',sleeve:'#F2C94C',bottom:'#3E5A6E',shoes:'#2A2230',skirt:'#F2C94C',hat:HAT.souwester,faceX:FX.beard('#F4F0E6'),hand:HOLD.up(10,10),hold:HOLD.spyglass},
  /* Capítulo 5 · Las raíces */
  sot:{k:.96,old:1,skin:'#D9A07E',hair:'#B8B0A4',hair_s:'moño',top:'#8A5A3A',bottom:'#5A3A2A',skirt:'#6E4630',shoes:'#3A2A20',apron:'#F3E0B0',hat:HAT.scarf('#C9694B'),hand:HOLD.up(10,8),hold:HOLD.candle,
    torso:(p,G)=>{const {pt,sh}=G;for(const [dx,dz] of[[5,-6],[8,-11],[3,-12]])p.flat(p.ell(...pt(dx,sh+dz),1.8,2.6,8),'#FBF4E3',.9)}},
  cue:{k:1,skin:'#C98A64',hair:'#2A1E18',hair_s:'coleta',top:'#6A74B0',overall:'#6A74B0',bottom:'#4A548E',shoes:'#3A2A20',hat:HAT.miner,hand:HOLD.up(9,9),hold:HOLD.pick,faceX:FX.soot},
  vol:{k:1.14,skin:'#B97A55',hair:'#2A1E18',hair_s:'calvo',top:'#C9694B',sleeve:'#B97A55',bottom:'#3A2A20',shoes:'#2A2230',apron:'#6E3E17',hand:HOLD.up(10,4),hold:HOLD.hammer,faceX:FX.all(FX.soot,FX.beard('#2A1E18')),
    hat:(p,G)=>{const {pt,hd}=G;p.cut([pt(-12,hd+5),pt(15,hd+7),pt(15,hd+12),pt(-12,hd+10)],'#B8484A',{rough:.3});p.cut([pt(-12,hd+6),pt(-19,hd+2),pt(-17,hd-3),pt(-11,hd+3)],'#B8484A',{rough:.2})}},
  cum:{k:1,skin:'#E7B994',hair:'#9A5A2A',hair_s:'corto',top:'#3E8FA0',bottom:'#5E6B7A',shoes:'#6A4A30',hat:HAT.beanie('#E4A844'),hand:HOLD.up(9,3),hold:HOLD.pole,faceX:FX.rosy,
    back:(p,G)=>{const {pt,sh,hip}=G;p.cut([pt(-16,sh+6),pt(-5,sh+4),pt(-4,hip-2),pt(-17,hip-2)],'#B8484A',{rough:.3});p.cut(p.ell(...pt(-11,sh+8),6,4,12),'#6F8D5E',{rough:.2})},
    neck:(p,G)=>{const {pt,sh}=G;p.cut([pt(-7,sh+2),pt(9,sh+3),pt(9,sh-3),pt(-7,sh-3)],'#F2EADB',{rough:.3})}},
  /* Capítulo 6 · La memoria */
  dsv:{k:.98,old:1,skin:'#E0B08A',hair:'#8A8078',hair_s:'corto',top:'#8A7A5A',sleeve:'#8A7A5A',bottom:'#5A4A3A',shoes:'#3A2A20',skirt:'#7A6A4A',hat:HAT.flat('#6A5A4A'),hand:HOLD.up(10,9),hold:HOLD.box,faceX:FX.mustache('#8A8078',.9),
    torso:(p,G)=>{const {pt,sh,hip}=G;for(const [dx,dz,c] of[[-4,-10,'#B8484A'],[6,-6,'#3E8FA0'],[2,-16,'#E4A844']])p.flat([pt(dx,sh+dz),pt(dx+4,sh+dz),pt(dx+4,sh+dz-3),pt(dx,sh+dz-3)],c,.8)}},
  est:{k:1,skin:'#E7B994',hair:'#2A1E18',hair_s:'melena',top:'#3A4660',bottom:'#2E3A52',skirt:'#3A4660',shoes:'#2A2230',hand:HOLD.up(10,8),hold:HOLD.quill,faceX:FX.glasses('#3A2A20')},
  ret:{k:1,skin:'#D9A07E',hair:'#6A4A30',hair_s:'rizado',top:'#E9DCC6',bottom:'#5A4A3A',shoes:'#3A2A20',hat:HAT.beret('#B8484A'),hand:HOLD.up(10,8),hold:HOLD.palette,
    torso:(p,G)=>{const {pt,sh}=G;for(const [dx,dz,c] of[[3,-7,'#3E8FA0'],[7,-12,'#E4A844'],[-2,-13,'#B8484A']])p.flat(p.ell(...pt(dx,sh+dz),1.8,1.4,8),c,.9)}},
  jar:{k:.96,old:1,skin:'#C98A64',hair:'#F4F0E6',hair_s:'moño',top:'#6F8D5E',bottom:'#5A4A3A',skirt:'#6F8D5E',shoes:'#6A4A30',hat:HAT.wide('#E9C46A'),hand:HOLD.up(10,6),hold:HOLD.basket,faceX:FX.rosy},
  cor:{k:1,old:1,pose:'sit',seat:30,skin:'#E7B994',hair:'#F4F0E6',hair_s:'moño',top:'#C47A2C',sleeve:'#C47A2C',bottom:'#8C4B1F',skirt:'#C47A2C',shoes:'#6A4226',hat:HAT.wide('#F4EFE2',true),twoHands:true,hand:G=>[G.pt(12,G.hip+8),G.pt(9,G.hip+7)],hold:HOLD.book}
};
/* Escarcha: la bufanda infinita, dibujada en el suelo antes que él */
function drawEscarchaScarf(p,x,y,t){const s=p.s,pts=[];const path=[[12,8],[30,30],[60,52],[110,60],[160,48],[200,20],[230,-10],[235,-50],[205,-80],[160,-92]];
  for(const [dx,dy] of path)pts.push(p.P(x+dx,y+dy,1.2));p.line(pts,'#A5523A',9,.95);p.line(pts,C.petalD,7);for(let i=1;i<pts.length-1;i+=1){const q=pts[i];p.line([[q[0]-4*s,q[1]-2*s],[q[0]+4*s,q[1]+2*s]],C.cream,2.2,.9)}}
/* Solano tumbado en la tumbona */
function drawSolanoLying(p,x,y,f,t,ex){const s=p.s,H=HUMANS.ver,P=(dx,dz)=>p.P(x+dx,y,dz),br=Math.sin(t*1.1)*.8;
  for(const k of[0,1]){p.line([P(-2,26+k*2),P(22,24+k*2),P(40,23+k*2)],k?H.bottom:shade(H.bottom),5.2);p.line([P(22,24+k*2),P(40,23+k*2)],H.skin,4.6);p.cut(p.ell(...P(43,24+k*2),3,4.4,12),H.shoes,{rough:.2})}
  p.cut([P(-26,40),P(-4,34+br),P(0,26),P(-24,30)],H.top,{rough:.4});
  p.line([P(-20,40),P(-6,44+br)],H.skin,4.2);HOLD.fan(p,{s,t,f:1,portrait:false},P(-5,46+br));
  const hc=P(-34,50);p.cut(p.ell(hc[0],hc[1],14,14.5,26),H.skin,{rough:.3});p.cut([[hc[0]-12*s,hc[1]+4*s],[hc[0]-13*s,hc[1]-4*s],[hc[0]-8*s,hc[1]-2*s]],H.hair,{rough:.3});
  const e1=[hc[0]+3*s,hc[1]-1*s],e2=[hc[0]+9*s,hc[1]-1*s],mo=[hc[0]+7*s,hc[1]+6*s];
  if(ex==='happy'||ex==='open')face(p,e1,e2,mo,1,t,ex,{er:2.3});else{FX.sunglasses(p,{s},e1,e2)}
  FX.mustache('#F4F0E6',1.25)(p,{s},e1,e2,mo);
  const hb=[hc[0]+1*s,hc[1]-11*s];p.cut(p.ell(hb[0],hb[1],24,6.6,26,-.2),'#E9C46A',{rough:.4});p.cut([[hb[0]-9*s,hb[1]],[hb[0]-7*s,hb[1]-10*s],[hb[0]+9*s,hb[1]-12*s],[hb[0]+11*s,hb[1]-2*s]],'#F2D37A',{rough:.3});p.flat([[hb[0]-8*s,hb[1]-3*s],[hb[0]+10*s,hb[1]-6*s],[hb[0]+10.5*s,hb[1]-3*s],[hb[0]-8*s,hb[1]]],C.sageD)}
/* ══════════ PAPEL RECORTADO ══════════
   Cada figura se pinta en tres pasadas: el canto del cartón (desplazado), el borde blanco
   de troquel y, encima, los colores. Al girarse, la hoja se da la vuelta: se estrecha,
   enseña el dorso liso y vuelve a abrirse mirando al otro lado. */
const PAPER={edge:'#C4B292',white:'#FFFDF6',back:'#F1E6CE',B:2.2,scale:1.14};
const FLIP={};
function paperFigure(p,key,f,drawAt,o={}){const g=p.g,s=p.s;let v=f;
  if(!o.noflip){const st=FLIP[key]||(FLIP[key]={v:f,t:T});const dt=Math.min(.1,Math.max(0,T-st.t));st.t=T;const d=f-st.v;if(STILL)st.v=f;else st.v+=Math.sign(d)*Math.min(Math.abs(d),dt*11);v=st.v}
  const sg=v>=0?1:-1,sx=Math.max(.05,Math.abs(v)),back=Math.abs(v)<.3,ax=o.ax,ay=o.ay??0,SC=o.sc??PAPER.scale;
  g.save();if(sx<.999||SC!==1){g.translate(ax,ay);g.scale(sx*SC,SC);g.translate(-ax,-ay)}
  const mk=(dx,dy)=>{const q=Pen(g,p.ox+dx,p.oy+dy,s,key+'pp',true,'paper');q.noShadow=true;return q};
  try{let q=mk(1.1*s,1.6*s);q.sil(PAPER.edge,PAPER.B);drawAt(q,sg);
    q=mk(0,0);q.sil(PAPER.white,PAPER.B);drawAt(q,sg);
    q=mk(0,0);if(back)q.sil(PAPER.back,0);drawAt(q,sg)}finally{g.restore()}}
/* los dibujantes que usa cada celda */
const humanDraw=id=>(p,x,y,f,t,ex,portrait)=>{const H=HUMANS[id],[ax,ay]=p.P(x,y,0);
  if(id==='ver'&&!portrait){paperFigure(p,'hver',1,(q)=>drawSolanoLying(q,x,y,1,t,ex),{ax,ay,noflip:true,sc:1});return}
  if(id==='inv'&&!portrait)drawEscarchaScarf(p,x,y,t);
  if(!portrait&&H.pose!=='lie'){const k=(H.k||1)*PAPER.scale;p.flat(p.ell(ax,ay+1*p.s,17*k,6*k),'rgba(70,40,15,.22)')}
  paperFigure(p,(portrait?'pt':'h')+id,f,(q,sg)=>drawHuman(q,x,y,sg,t,ex,portrait,H),{ax,ay,noflip:portrait,sc:portrait?1:undefined})};

/* encuadre del retrato: la cara centrada, con sitio para el sombrero */
const hpf=id=>{const H=HUMANS[id],k=H.k||1,t=H.tall||0,hd=48+t*8-(H.old?1:0);return[.5,-31+1.35*k*(hd+2),1.35,1]};
