/* ══════════ DETALLES · muebles y objetos para vestir las celdas nuevas ══════════
   Piezas genéricas de papel (cajas, barriles, sacos, plantas…) colocadas cerca de los vértices
   del hexágono, lejos de las puertas (que están en el centro de cada pared). */
const DX={
  crate(p,x,y,w=24,h=30,col='#B07C50'){const s=p.s;box3P(p,x-w,x+w,y-w*.7,y+w*.7,0,h,col,shade(col,.78),shade(col,1.12));
    for(const z of[h*.33,h*.66])p.line([p.P(x-w,y+w*.7,z),p.P(x+w,y+w*.7,z)],shade(col,.62),1.2,.8);p.line([p.P(x-w,y+w*.7,0),p.P(x+w,y+w*.7,h)],shade(col,.62),1.4,.7)},
  barrel(p,x,y,r=20,h=44,col='#8A5A34'){const s=p.s;cylinder(p,x,y,0,r,h,col,shade(col,1.18));for(const z of[h*.22,h*.78]){const o=[];for(let k=0;k<=14;k++){const a=k/14*Math.PI;o.push(p.P(x+Math.cos(a)*(r+.6),y+Math.sin(a)*(r+.6),z))}p.line(o,'#4A3A30',2.2,.9)}},
  sack(p,x,y,col='#E9DCC6',h=30){const s=p.s,b=p.P(x,y,0),t=p.P(x,y,h);const pts=[[b[0]-17*s,b[1]],[b[0]-19*s,b[1]-h*.5*s],[t[0]-9*s,t[1]+4*s],[t[0]-4*s,t[1]-2*s],[t[0]+4*s,t[1]-2*s],[t[0]+9*s,t[1]+4*s],[b[0]+19*s,b[1]-h*.5*s],[b[0]+17*s,b[1]]];
    p.flat(p.ell(b[0],b[1]+1*s,20,6,16),'rgba(70,40,15,.2)');p.cut(pts,col,{rough:.8});p.line([[t[0]-7*s,t[1]+3*s],[t[0]+7*s,t[1]+3*s]],'#8A6A4A',1.6)},
  plant(p,x,y,potCol=C.terra,leaf=[C.sage,C.sageD],h=24,flower=null){const s=p.s;pot(p,x,y,15,h,potCol);const c=p.P(x,y,h);const R0=rng('pl'+x+y);
    for(let k=0;k<7;k++)leafShape(p,c[0]+rd(R0,-5,5)*s,c[1],-Math.PI/2+rd(R0,-1,1),rd(R0,16,26),leaf[k%leaf.length]);if(flower)for(let k=0;k<3;k++)flowerDot(p,c[0]+rd(R0,-12,12)*s,c[1]-rd(R0,14,26)*s,3,flower)},
  stool(p,x,y,col='#B07C50'){const s=p.s;for(const [dx,dy] of[[-9,-6],[9,-6],[-9,6],[9,6]])p.line([p.P(x+dx,y+dy,0),p.P(x+dx*.8,y+dy*.8,26)],shade(col,.7),2.4);cylinder(p,x,y,26,14,5,col,shade(col,1.15))},
  books(p,x,y,n=5){const R0=rng('lb'+x+y);let z=0;for(let k=0;k<n;k++){const w=rd(R0,16,22),d=rd(R0,11,14),h=rd(R0,5,8),ox=rd(R0,-3,3),col=pick(R0,['#B8484A','#3F7F5F','#E4A844','#4A548E','#8A5A3A','#C9694B','#6F8D5E']);box3P(p,x-w+ox,x+w+ox,y-d,y+d,z,z+h,col,shade(col,.78),'#F3E6C4',{rough:.2});z+=h}},
  rope(p,x,y,col='#C9A46A'){const s=p.s;for(let k=0;k<4;k++){const r=22-k*4,q=p.P(x,y,k*3.5);p.cut(p.ell(q[0],q[1],r,r*.5,22),k%2?col:shade(col,.88),{sh:k?0:1,rough:.3})}p.flat(p.ell(...p.P(x,y,14),4,2,10),shade(col,.6))},
  cases(p,x,y){for(const [dx,dy,z,w,h,col] of[[0,0,0,26,18,'#8A4A2A'],[3,-2,18,21,15,'#3F5F4A'],[-2,1,33,16,12,'#C9694B']]){box3P(p,x+dx-w,x+dx+w,y+dy-12,y+dy+12,z,z+h,col,shade(col,.78),shade(col,1.15),{rough:.2});const q=p.P(x+dx,y+dy-2,z+h);p.line([[q[0]-5*p.s,q[1]],[q[0]-5*p.s,q[1]-4*p.s],[q[0]+5*p.s,q[1]-4*p.s],[q[0]+5*p.s,q[1]]],'#3A2A20',1.4)}},
  gear(p,x,y,r=34,col='#C9A05C'){const s=p.s,c=p.P(x,y,r+2);p.flat(p.ell(...p.P(x,y,0),r*.8,6,16),'rgba(70,40,15,.22)');const G=gearPts(c[0],c[1],r,10,.2,s);p.cut(G,col,{blur:4,rough:.2});p.cut(p.ell(c[0],c[1],r*.55,r*.52,22),shade(col,.85),{sh:0,rough:.2});p.cut(p.ell(c[0],c[1],r*.16,r*.16,14),shade(col,.6),{sh:0,rough:0});
    for(let k=0;k<4;k++){const a=k*Math.PI/2+.2;p.line([[c[0]+Math.cos(a)*r*.16*s,c[1]+Math.sin(a)*r*.16*s],[c[0]+Math.cos(a)*r*.52*s,c[1]+Math.sin(a)*r*.5*s]],shade(col,.7),3)}},
  cart(p,x,y){const s=p.s;for(const dx of[-16,16]){const q=p.P(x+dx,y+14,8);p.cut(p.ell(q[0],q[1],7,7,14),'#3A3A48',{rough:.1});p.flat(p.ell(q[0],q[1],2.4,2.4,8),'#8A8A9A')}
    box3P(p,x-26,x+26,y-14,y+14,8,34,'#6A5A4A','#5A4A3A','#4A3A2E',{rough:.2});const R0=rng('ore');for(let k=0;k<7;k++){const q=p.P(x+rd(R0,-20,20),y+rd(R0,-9,9),36);p.cut(p.ell(q[0],q[1],rd(R0,4,7),rd(R0,3,5),8),pick(R0,['#B8A8E8','#8FD0E0','#E8B8D8','#6A6090']),{rough:.6,sh:0})}},
  rocks(p,x,y,col='#8A8078',n=4){const R0=rng('rk'+x+y);for(let k=0;k<n;k++){const q=p.P(x+rd(R0,-18,18),y+rd(R0,-10,10),0),r=rd(R0,9,17);p.cut([[q[0]-r*p.s,q[1]],[q[0]-r*.7*p.s,q[1]-r*.8*p.s],[q[0],q[1]-r*1.1*p.s],[q[0]+r*.8*p.s,q[1]-r*.7*p.s],[q[0]+r*p.s,q[1]]],k%2?col:shade(col,1.12),{rough:.8})}},
  chair(p,x,y,col='#8A5A34'){const s=p.s;for(const [dx,dy] of[[-12,-10],[12,-10],[-12,10],[12,10]])p.line([p.P(x+dx,y+dy,0),p.P(x+dx,y+dy,24)],shade(col,.7),2.4);box3P(p,x-14,x+14,y-12,y+12,24,28,col,shade(col,.8),shade(col,1.12),{rough:.2});
    p.cut([p.P(x-14,y-12,28),p.P(x+14,y-12,28),p.P(x+14,y-12,58),p.P(x-14,y-12,58)],col,{blur:3,rough:.3});p.line([p.P(x-10,y-12,46),p.P(x+10,y-12,46)],shade(col,.7),1.4)},
  post(p,x,y,col='#3A3A48'){const s=p.s;p.flat(p.ell(...p.P(x,y,0),10,4,12),'rgba(70,40,15,.22)');p.line([p.P(x,y,0),p.P(x,y,108)],col,3.6,1,{sh:1});const q=p.P(x,y,112);p.cut([[q[0]-8*s,q[1]+6*s],[q[0]+8*s,q[1]+6*s],[q[0]+6*s,q[1]-10*s],[q[0]-6*s,q[1]-10*s]],'#F6D98A',{rough:.1});p.cut([[q[0]-10*s,q[1]-10*s],[q[0]+10*s,q[1]-10*s],[q[0],q[1]-17*s]],col,{sh:0,rough:.1})},
  bucket(p,x,y,col='#8A8A9A'){cylinder(p,x,y,0,11,18,col,'#5A6A7A',{r1:13})},
  jars(p,x,y){DX.crate(p,x,y,26,26,'#B07C50');for(const [dx,dy] of[[-12,-6],[0,-6],[12,-6],[-6,6],[8,6]]){const q=p.P(x+dx,y+dy,26);p.cut([[q[0]-4.5*p.s,q[1]],[q[0]+4.5*p.s,q[1]],[q[0]+4.5*p.s,q[1]-10*p.s],[q[0]-4.5*p.s,q[1]-10*p.s]],'rgba(228,168,68,.95)',{rough:.1,sh:0});p.flat([[q[0]-4.5*p.s,q[1]-10*p.s],[q[0]+4.5*p.s,q[1]-10*p.s],[q[0]+4.5*p.s,q[1]-13*p.s],[q[0]-4.5*p.s,q[1]-13*p.s]],'#F3E6C4')}},
  wax(p,x,y){for(const [dx,dy,z] of[[-14,0,0],[14,0,0],[0,0,16],[-6,14,0]])box3P(p,x+dx-13,x+dx+13,y+dy-8,y+dy+8,z,z+16,'#F3D98A','#E4C06A','#FBE8B0',{rough:.3})}
};
/* dx: [id, x, y, drawer, args, r (radio en el suelo), h (alto)] */
const DETAIL={
  col:[['jarras',-215,10,'jars',[],30,40],['barril',-110,-195,'barrel',[20,44,'#C9772F'],22,48],['flor',110,195,'plant',[C.terra,[C.sage,C.sageD],22,C.butter],18,60]],
  bib:[['libros',-215,20,'books',[6],24,50],['taburete',-110,185,'stool',['#6E3E17'],16,34],['planta',215,0,'plant',['#4E6B46',[C.sageD,'#4E6B46'],26],18,62]],
  coc:[['sacos',-210,-10,'sack',['#E9DCC6',32],22,40],['saco2',-180,30,'sack',['#D9C8A8',26],22,34],['barril',210,10,'barrel',[20,40,'#8A5A34'],22,44],['limones',-110,-195,'crate',[22,24,'#C9873C'],26,34]],
  rel:[['engranaje',120,-200,'gear',[34],36,74],['cajon',-110,-195,'crate',[20,22,'#8A5A34'],24,32],['taburete',110,40,'stool',['#8A5A34'],16,34]],
  inn:[['maceta',210,20,'plant',['#3A4278',['#2F7A5A','#4E8A6A'],24,'#E8E8FF'],18,62],['maceta2',-210,40,'plant',['#3A4278',['#2F7A5A','#4E8A6A'],20,'#C8D8FF'],18,58],['farol',110,-190,'post',['#2E3561'],12,128]],
  tea:[['baul',-205,10,'crate',[26,30,'#8A3A4A'],28,40],['silla1',-120,-175,'chair',['#6E3E17'],18,62],['silla2',-60,-190,'chair',['#6E3E17'],18,62],['silla3',110,185,'chair',['#8A3A4A'],18,62]],
  far:[['cuerda',-205,20,'rope',[],24,26],['barril',205,10,'barrel',[20,40,'#3E5A6E'],22,44],['caja',-110,-195,'crate',[22,26,'#B07C50'],26,36],['boya',110,-195,'barrel',[16,30,'#B8484A'],18,34]],
  tre:[['maletas',-205,0,'cases',[],28,50],['farol',-120,-195,'post',['#2A305C'],12,128]],
  sot:[['barril',210,-10,'barrel',[22,46,'#6E4630'],24,50],['barril2',110,-195,'barrel',[18,38,'#8A5A34'],20,42],['cera',-110,-195,'wax',[],30,34]],
  cue:[['vagon',205,40,'cart',[],30,44],['rocas',-215,-10,'rocks',['#6A6090'],24,24],['rocas2',120,-190,'rocks',['#5A5080',5],24,24]],
  vol:[['cubo',210,40,'bucket',['#6A6A78'],14,22],['rocas',-215,-20,'rocks',['#4A3A3A',5],24,24],['mineral',-120,-190,'crate',[22,24,'#5A3A2A'],26,34]],
  cum:[['rocas',210,20,'rocks',['#A8B4C0',5],24,24],['caja',110,-195,'crate',[22,24,'#C9694B'],26,34],['cuerda',-110,-190,'rope',['#E4A844'],24,26]],
  dsv:[['cajas',110,-195,'crate',[24,30,'#B07C50'],28,40],['cajas2',215,10,'crate',[20,26,'#8A5A34'],24,36],['silla',-210,80,'chair',['#8A6A4A'],18,62],['libros',110,185,'books',[4],24,40]],
  est:[['libros',-210,10,'books',[7],24,56],['planta',210,10,'plant',[C.terra,[C.sage,C.sageD],24],18,62],['silla',-110,-143,'chair',['#6E3E17'],18,62]],
  ret:[['pinturas',-210,20,'crate',[22,20,'#E9DCC6'],26,30],['planta',210,40,'plant',['#7A3240',[C.sage,C.sageD],24,C.petal],18,62],['taburete',30,-40,'stool',['#6E3E17'],16,34]],
  jar:[['maceta',210,0,'plant',[C.terra,[C.sage,C.sageD],24,C.petal],18,62],['maceta2',110,-195,'plant',['#C9873C',[C.sageD,'#8FAA75'],22,C.butter],18,58],['cubo',-110,110,'bucket',['#6F8D5E'],14,22]],
  cor:[['tarros',210,20,'jars',[],30,40],['flor',-210,-20,'plant',['#C9772F',[C.sage,C.sageD],24,C.cream],18,62]]
};
for(const id in DETAIL){const c=STYLE.cells[id];for(const [nm,x,y,fn,args,r,h] of DETAIL[id]){
  c.props.push({id:'dx'+nm,y,bb:[x-r-18,(y-r)*K-h-22,x+r+18,(y+r)*K+16],draw:p=>DX[fn](p,x,y,...args)});c.solids.push([x,y,r])}}
