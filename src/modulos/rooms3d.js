/* ══════════ LAS 24 HABITACIONES RESTANTES EN 3D ══════════
   Lo mismo que se hizo con la Primavera (habitación 1), cuarto por cuarto:
   · un rayo de luz por la ventana del fondo cuando la hay,
   · muebles y objetos de su tema contra las paredes (sin tapar puertas, vecinos, muebles ni secretos),
   · una alfombra o un camino en el suelo,
   · matas, piedras, velas… en los rincones,
   · y vida: algo que se mueve (burbujas, nieve, hojas, abejas, luciérnagas, brasas, polvo de luz…).
   Las piezas se colocan solas buscando sitio libre junto a las paredes, con una semilla fija por cuarto. */
(()=>{if(!window.PROPS3D||!PROPS3D.addRoom||!window.LP3D)return;
  const T3=THREE,{Bk,SPH,CYL,CONE,BOX,TOR,LATHE,OCT,CIRC,shd,glowSprite,mat,matF}=LP3D.kit,{P,rf,limb,potPlant,sunMat,WP,WYAW}=PROPS3D.kit;
  const bt=[4,5];
  /* ── dónde hay sitio: cerca de las paredes, lejos de puertas, muebles, vecino y secretos ── */
  const H30=Math.cos(Math.PI/6);
  const wallGap=(x,y)=>{let m=-1e9;for(let k=0;k<6;k++){const a=k*Math.PI/3+Math.PI/6;m=Math.max(m,x*Math.cos(a)+y*Math.sin(a))}return(R-3)*H30-m};
  function obstacles(id){const c=CELLS[id],o=[];
    for(const pr of c.props){const w=(pr.bb[2]-pr.bb[0])/2;o.push([(pr.bb[0]+pr.bb[2])/2,pr.y,Math.max(30,w*.7)+8])}
    if(c.npc)o.push([c.npc.x,c.npc.y,74]);for(const s of c.solids||[])o.push([s[0],s[1],s[2]+18]);
    for(const d of c.doors){if(d.mid)o.push([d.mid[0],d.mid[1],82]);if(d.trig)o.push([d.trig[0],d.trig[1],60]);if(d.spawn)o.push([d.spawn[0],d.spawn[1],50])}
    for(const t of PUZ.things[id]||[])o.push([t.x,t.y,(t.r||50)*.8]);
    if(typeof PAGES!=='undefined'&&PAGES[id])o.push([PAGES[id][0],PAGES[id][1],56]);if(typeof GLYPHS!=='undefined'&&GLYPHS[id])o.push([GLYPHS[id][0],GLYPHS[id][1],50]);
    if(typeof BRIDGES!=='undefined')for(const k in BRIDGES){const b=BRIDGES[k];if(b.cell===id)o.push([b.x,b.y,60])}
    return o}
  function spots(id,want,R0,o){const out=[],obs=obstacles(id).concat(o||[]);
    for(const it of want)for(let tries=0;tries<260;tries++){const a=R0(0,Math.PI*2),r=R0(it.free?100:150,290),x=Math.cos(a)*r,y=Math.sin(a)*r*.98,g=wallGap(x,y),need=it.r||26;
      if(g<need*.8+(it.gap0||4)||g>need+(it.free?220:(it.gap1||90)))continue;if(y>(it.ymax??190))continue;
      if(obs.some(([ox,oy,or])=>Math.hypot(x-ox,y-oy)<or+need))continue;if(out.some(s=>Math.hypot(x-s.x,y-s.y)<s.r+need+10))continue;out.push({x,y,r:need,...it});break}
    return out}

  /* ── piezas ── */
  const glows=[];
  const IT={
    plant:(B,F,s,R,c)=>{potPlant(B,F,P(s.x,s.y,0),c[0]||C.terra,'pl'+s.x,c[1]);},
    bigplant:(B,F,s,R,c)=>{B.add(LATHE([[11,0],[15,22],[16,22],[16,25],[12,25]],10),c[0]||C.terra,P(s.x,s.y,0));B.add(CYL(12,12,1,10),C.soil,P(s.x,s.y,24));
      for(let k=0;k<9;k++){const a=k/9*6.28+R(0,.4);F.add(OCT(8),k%2?(c[1]||C.sage):(c[2]||C.sageD),P(s.x+Math.cos(a)*9,s.y+Math.sin(a)*7,34+R(0,22)),[R(0,3),a,R(-.6,.6)],[1,2.6,.32])}},
    bush:(B,F,s,R,c)=>{for(let k=0;k<7;k++){const a=R(0,6.28),d=R(0,s.r*.7);F.add(SPH(R(6,11),5,4),c[k%c.length],P(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,5+R(0,5)),[0,a,0],[1,.7,1])}},
    flowers:(B,F,s,R,c)=>{for(let k=0;k<6;k++){const a=R(0,6.28),d=R(0,s.r*.7);F.add(SPH(R(5,8),5,4),k%2?C.sage:C.sageD,P(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,5),[0,a,0],[1,.7,1])}
      for(let k=0;k<6;k++){const a=R(0,6.28),d=R(0,s.r*.7);F.add(SPH(3,5,4),c[k%c.length],P(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,12+R(0,4)))}},
    rocks:(B,F,s,R,c)=>{for(let k=0;k<4;k++){const a=R(0,6.28),d=R(0,s.r*.6),z=R(7,14);B.add(SPH(z,5,4),c[k%c.length],P(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,z*.3),[R(0,3),R(0,3),0],[1,R(.5,.75),R(.8,1.1)])}},
    crystals:(B,F,s,R,c)=>{for(let k=0;k<5;k++){const h=R(18,44),a=R(0,6.28),d=R(0,s.r*.5),tx=R(-.35,.35),tz=R(-.35,.35);const p=P(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,h*.45);
        F.add(CYL(0,R(5,8),h*.3,6),shd(c[k%c.length],1.15),[p[0],p[1]+h*.6,p[2]],[tx,0,tz]);F.add(CYL(R(5,8),R(5,8),h,6),c[k%c.length],p,[tx,0,tz])}glows.push([s.x,s.y,26,c[0],60])},
    snow:(B,F,s,R,c)=>{for(let k=0;k<5;k++){const a=R(0,6.28),d=R(0,s.r*.6),z=R(9,18);B.add(SPH(z,6,4),k%2?'#F4F8FA':'#E4EEF2',P(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,0),[0,a,0],[1,.45,1])}},
    shells:(B,F,s,R,c)=>{for(let k=0;k<4;k++){const a=R(0,6.28),d=R(0,s.r*.6);B.add(CONE(R(4,7),R(9,14),7),c[k%c.length],P(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,3),[Math.PI/2.3,a,0])}
      B.add(TOR(7,2.4,5,10,Math.PI),C.petalL,P(s.x+6,s.y-4,1),[Math.PI/2,0,R(0,3)])},
    coral:(B,F,s,R,c)=>{const col=c[Math.floor(R(0,c.length))];for(let k=0;k<5;k++){const a=R(0,6.28),h=R(24,46);limb(F,[s.x,s.y,0],[s.x+Math.cos(a)*16,s.y+Math.sin(a)*12,h],3.6,2,col,5);F.add(SPH(3.4,5,4),shd(col,1.15),P(s.x+Math.cos(a)*16,s.y+Math.sin(a)*12,h))}},
    weed:(B,F,s,R,c)=>{for(let k=0;k<4;k++){let x=s.x+R(-10,10),y=s.y+R(-6,6),z=0;for(let j=0;j<4;j++){const nx=x+R(-6,6),nz=z+R(12,18);limb(F,[x,y,z],[nx,y,nz],2.6,2,c[k%c.length],4);x=nx;z=nz}}},
    cactus:(B,F,s,R,c)=>{B.add(CYL(7,8,46,7),C.sageD,P(s.x,s.y,23));B.add(SPH(7,7,4,0,6.3,0,1.6),C.sageD,P(s.x,s.y,46));limb(B,[s.x,s.y,22],[s.x+14,s.y,30],3.6,3.6,C.sageD,6);limb(B,[s.x+14,s.y,30],[s.x+14,s.y,44],3.6,3.4,C.sageD,6);
      F.add(SPH(3,5,4),C.petalD,P(s.x,s.y,53));B.add(CYL(10,12,8,8),C.terra,P(s.x,s.y,4))},
    crate:(B,F,s,R,c)=>{const col=c[0]||'#B8823E',a=R(-.3,.3);B.add(BOX(30,26,28),col,P(s.x,s.y,13),[0,a,0]);B.add(BOX(31,3,29),shd(col,.8),P(s.x,s.y,24),[0,a,0]);
      if(R(0,1)<.6)B.add(BOX(22,18,20),shd(col,1.08),P(s.x+R(-3,3),s.y+R(-3,3),35),[0,a+R(-.5,.5),0])},
    barrel:(B,F,s,R,c)=>{const col=c[0]||'#A86A2C';B.add(LATHE([[12,0],[15,12],[15,20],[12,32]],10),col,P(s.x,s.y,0));for(const z of[6,26])B.add(TOR(14,1.2,4,12),'#5A4A42',P(s.x,s.y,z),[Math.PI/2,0,0]);B.add(CYL(12,12,1,10),shd(col,.85),P(s.x,s.y,32))},
    books:(B,F,s,R,c)=>{let z=0;for(let k=0;k<5;k++){const h=R(4,7);B.add(BOX(R(22,30),h,R(16,20)),c[k%c.length],P(s.x+R(-2,2),s.y+R(-2,2),z+h/2),[0,R(-.4,.4),0]);z+=h}},
    candles:(B,F,s,R,c)=>{for(let k=0;k<4;k++){const a=R(0,6.28),d=R(0,12),h=R(10,26),x=s.x+Math.cos(a)*d,y=s.y+Math.sin(a)*d;B.add(CYL(3.2,3.6,h,8),c[0]||C.cream,P(x,y,h/2));F.add(OCT(2.4),'#FFD36A',P(x,y,h+3),[0,0,0],[1,1.7,1]);if(k===0)glows.push([x,y,h+4,'#FFC870',44])}},
    lantern:(B,F,s,R,c)=>{B.add(CYL(1.8,2.2,52,6),'#4A3A30',P(s.x,s.y,26));B.add(BOX(11,13,11),'#4A3A30',P(s.x,s.y,58));B.add(BOX(8,9,8),c[0]||'#FFE3A0',P(s.x,s.y,58));B.add(CONE(9,6,4),'#4A3A30',P(s.x,s.y,67.5),[0,Math.PI/4,0]);glows.push([s.x,s.y,58,c[1]||'#FFD36A',50])},
    jars:(B,F,s,R,c)=>{for(let k=0;k<3;k++){const x=s.x+(k-1)*10,y=s.y+R(-4,4),h=R(12,18);B.add(LATHE([[5,0],[6,h*.8],[4,h],[4.4,h+2]],8),c[k%c.length]||C.honey,P(x,y,0));B.add(CYL(4.6,4.6,2,8),'#E9DCC6',P(x,y,h+2.5))}},
    stool:(B,F,s,R,c)=>{const col=c[0]||'#B8823E';B.add(CYL(11,11,3,10),col,P(s.x,s.y,22));for(let k=0;k<3;k++){const a=k*2.09;limb(B,[s.x+Math.cos(a)*7,s.y+Math.sin(a)*7,21],[s.x+Math.cos(a)*11,s.y+Math.sin(a)*11,0],1.6,1.4,shd(col,.8),5)}},
    gears:(B,F,s,R,c)=>{for(let k=0;k<2;k++){const r=k?10:16,x=s.x+k*18,y=s.y+k*6,col=c[k%c.length];B.add(CYL(r,r,4,14),col,P(x,y,2+k*4));for(let j=0;j<10;j++){const a=j/10*6.28;B.add(BOX(5,4,4),col,P(x+Math.cos(a)*(r+2),y+Math.sin(a)*(r+2),2+k*4),[0,-a,0])}B.add(CYL(3,3,5,8),shd(col,.7),P(x,y,3+k*4))}},
    bench:(B,F,s,R,c)=>{const col=c[0]||'#9A7450',a=Math.atan2(-s.y,-s.x)+Math.PI/2;const ca=Math.cos(a),sa=Math.sin(a);B.add(BOX(52,4,16),col,P(s.x,s.y,18),[0,-a,0]);for(const k of[-1,1])B.add(BOX(4,18,14),shd(col,.8),P(s.x+ca*k*21,s.y+sa*k*21,9),[0,-a,0])},
    ice:(B,F,s,R,c)=>{for(let k=0;k<4;k++){const h=R(14,30),a=R(0,6.28),d=R(0,14);F.add(BOX(R(10,16),h,R(10,16)),k%2?'#CFE6EE':'#E4F1F5',P(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,h/2),[R(-.2,.2),a,R(-.2,.2)])}},
    embers:(B,F,s,R,c)=>{for(let k=0;k<5;k++){const a=R(0,6.28),d=R(0,14),z=R(5,10);B.add(SPH(z,5,4),'#3A2A26',P(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,z*.3),[R(0,3),R(0,3),0],[1,.7,1]);if(k<2)F.add(OCT(3),'#FF8A3A',P(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,z*.7))}glows.push([s.x,s.y,10,'#FF7A2A',46])},
    paper:(B,F,s,R,c)=>{for(let k=0;k<6;k++){const a=R(0,6.28),d=R(0,s.r*.7);B.add(BOX(R(10,16),.8,R(12,18)),k%3?C.cream:'#EFE2C6',P(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,.6+k*.3),[0,R(0,3),0])}},
    frame:(B,F,s,R,c)=>{const col=c[0]||C.honey,a=Math.atan2(-s.y,-s.x)+Math.PI/2;B.add(BOX(30,40,3),col,P(s.x,s.y,22),[-.18,-a,0]);B.add(BOX(24,34,3.4),c[1]||C.cream,P(s.x,s.y,22),[-.18,-a,0])},
    pillow:(B,F,s,R,c)=>{for(let k=0;k<2;k++)B.add(BOX(26,8,24),c[k%c.length],P(s.x+k*8,s.y+k*5,4+k*7),[0,R(-.5,.5),0])},
    honey:(B,F,s,R,c)=>{for(let k=0;k<4;k++){const a=k*1.6+R(0,.3);B.add(CYL(9,9,4,6),k%2?C.honey:C.honeyL,P(s.x+Math.cos(a)*10,s.y+Math.sin(a)*8,2+k*2.2),[0,Math.PI/6,0])}}
  };
  /* rayo de luz por la ventana del fondo */
  function beam(g,o){const wy=WYAW(bt),sg=new T3.PlaneGeometry(o.w||64,250);sg.translate(0,-125,0);sg.userData.shared=true;const m=sunMat().clone();m.color.set(o.col||'#FFF2C4');m.userData={};const s=new T3.Mesh(sg,m);s.position.set(...WP(bt,o.u??.5,o.z||82,10));s.rotation.order='YXZ';s.rotation.set(-.62,wy+(o.yaw||0),0);s.userData.sun=o.night?2:1;g.add(s)}
  /* alfombra: hexágonos o círculos concéntricos planos */
  function rug(B,o){const n=o.hex?6:20,[x,y]=o.at;o.cols.forEach((c,k)=>{const r=o.r*(1-k*.18);B.add(CYL(r,r,1,n),c,P(x,y,3.1+k*.3),[0,o.hex?Math.PI/2:0,0],[1,1,o.sy||.8])})}
  function stones(B,R,o){for(let k=0;k<o.n;k++){const t=k/(o.n-1),x=lerp(o.a[0],o.b[0],t)+Math.sin(t*3)*12,y=lerp(o.a[1],o.b[1],t);B.add(CYL(13,14,2.2,8),k%2?o.cols[0]:o.cols[1],P(x,y,3.4),[0,R(0,2),0],[1,1,.82])}}

  /* ── vida: partículas (instancias) y bichos con alas ── */
  function particles(g,o){const n=o.n||24,geo=o.geo==='sph'?new T3.SphereGeometry(o.size||2,6,4):new T3.OctahedronGeometry(o.size||2,0),mat=new T3.MeshBasicMaterial({color:'#FFFFFF',transparent:true,opacity:o.op??.9,depthWrite:false,fog:false});
    if(o.add)mat.blending=T3.AdditiveBlending;const im=new T3.InstancedMesh(geo,mat,n);im.frustumCulled=false;im.renderOrder=3;const R=rf('pt'+o.type+n),c=new T3.Color(),ph=[];
    for(let i=0;i<n;i++){c.set(o.cols[i%o.cols.length]);im.setColorAt(i,c);const a=R(0,6.28),r=Math.sqrt(R(0,1))*(o.rad||230);ph.push({x:Math.cos(a)*r,y:Math.sin(a)*r*.9-20,p:R(0,1),s:R(.6,1.3),w:R(0,6.28)})}
    g.add(im);const O=new T3.Object3D(),z0=o.z0??4,z1=o.z1??190,H=z1-z0;
    return(t,still)=>{const tt=still?0:t;for(let i=0;i<n;i++){const q=ph[i];let x=q.x,y=q.y,z,sc=q.s;
        if(o.type==='rise'||o.type==='fall'){const u=(q.p+tt*(o.sp||.06)*q.s)%1;z=o.type==='rise'?z0+u*H:z1-u*H;x+=Math.sin(tt*.8+q.w)*(o.wob??8);y+=Math.cos(tt*.6+q.w)*(o.wob??8)*.5;sc*=Math.sin(Math.PI*u)}
        else{z=lerp(z0,z1,q.p)+Math.sin(tt*.7+q.w)*14;x+=Math.sin(tt*.31+q.w)*28;y+=Math.cos(tt*.27+q.w*1.3)*22;sc*=o.type==='blink'?Math.max(0,Math.sin(tt*1.6+q.w*3)):(.75+.25*Math.sin(tt*2+q.w))}
        O.position.set(...P(x,y,z));O.rotation.set(tt*q.s+q.w,tt*.7*q.s,0);O.scale.setScalar(Math.max(.001,sc));O.updateMatrix();im.setMatrixAt(i,O.matrix)}im.instanceMatrix.needsUpdate=true}}
  function fliers(g,o){const L=[];for(let k=0;k<(o.n||3);k++){const b=new T3.Group(),col=o.cols[k%o.cols.length];
      if(o.body){const bd=new T3.Mesh(new T3.SphereGeometry(o.body,6,4),new T3.MeshLambertMaterial({color:o.bodyCol||col}));bd.scale.set(1.6,1,1);b.add(bd)}
      for(const s of[-1,1]){const w=new T3.Mesh(new T3.CircleGeometry(o.wing||5,6),new T3.MeshBasicMaterial({color:o.wingCol||col,side:T3.DoubleSide,transparent:!!o.wingOp,opacity:o.wingOp||1}));w.position.x=s*(o.wing||5)*.8;w.scale.set(1,.7,1);b.add(w);w.userData.s=s}
      g.add(b);L.push({b,k,cx:o.at[k%o.at.length][0],cy:o.at[k%o.at.length][1]})}
    const wi=o.body?1:0;return(t,still,amb)=>{for(const f of L){const tt=t*(o.sp||.5)+f.k*2.1;f.b.position.set(...P(f.cx+Math.sin(tt)*(o.rx||60),f.cy+Math.cos(tt*.8)*(o.ry||45),(o.z||70)+Math.sin(tt*1.7)*(o.rz||16)));f.b.rotation.y=-tt+(o.swim?Math.PI/2:0);
        const fl=still?.3:Math.sin(t*(o.flap||22)+f.k)*(o.amp||1.1);f.b.children[wi].rotation.y=fl;f.b.children[wi+1].rotation.y=-fl;if(o.day)f.b.visible=amb>.6}}}

  /* ══ los temas, cuarto por cuarto ══ */
  const W=(k,c,r,o)=>({k,c:c||[],r:r||26,...(o||{})});
  const THEME={
    /* 2 · Verano — la terraza de la siesta */
    ver:{free:1,beam:{u:.5,z:84,col:'#FFF0B8'},items:[W('bigplant',[C.terra,C.sage,C.sageD],26),W('flowers',[C.butter,C.petal,'#F59A5A'],24),W('barrel',['#C98A42'],18),W('flowers',[C.petalD,C.butter],24),W('shells',[C.petalL,C.cream,'#F3DFB4'],22),W('bigplant',[C.teal,C.sageL,C.sage],26)],
      rug:{at:[-120,40],r:46,cols:['#F3DFB4','#8EC3CF','#F3DFB4'],hex:1},life:[{f:'fly',n:3,cols:[C.butter,'#8EC3CF',C.petalD],at:[[-150,-120],[60,-120],[150,60]],day:1}]},
    /* 3 · Otoño — el taller de papel */
    oto:{free:1,beam:{u:.5,z:96,col:'#FFE3B0'},items:[W('paper',[],30),W('crate',['#B8823E'],20),W('books',['#C9563A','#E07A3E','#6F8D8A',C.cream],18),W('bush',['#B8563A','#E07A3E','#F0A848'],24),W('stool',['#9A6A3A'],14),W('bush',['#C9563A','#F0A848'],22)],
      rug:{at:[-60,60],r:52,cols:['#B8563A','#E9C99A','#C9873C']},life:[{p:'fall',n:22,cols:['#C9563A','#E07A3E','#F0A848','#B8563A'],size:3.4,sp:.05,wob:20,z0:0,z1:200}]},
    /* 4 · Invierno — la brasa */
    inv:{free:1,beam:{u:.5,z:96,col:'#DDEBFF',night:1},items:[W('snow',[],26,{gap1:30}),W('lantern',['#FFE3A0','#FFC870'],12),W('pillow',[C.petal,C.cream],20),W('snow',[],24,{gap1:30}),W('crate',['#9A6A3A'],18),W('candles',[C.cream],14)],
      life:[{p:'fall',n:30,cols:['#FFFFFF','#E4F1F5'],size:2,sp:.04,wob:14,op:.85},{p:'rise',n:10,cols:['#FF9A3A','#FFC870'],size:1.6,add:1,sp:.12,rad:60,z0:30,z1:160,ctr:[-200,-150]}]},
    /* 5 · Espacio — el observatorio */
    esp:{items:[W('rocks',['#5A5A7A','#6E6E90','#4A4A66'],24),W('crystals',['#9FB6FF','#C8B6FF'],18),W('books',['#3E3E66','#6E6EA0',C.butter],16),W('lantern',['#E6E9FF','#B8C8FF'],12),W('rocks',['#4A4A66','#7A7AA0'],22)],
      rug:{at:[0,90],r:70,cols:['#2E2E52','#3E3E6E','#C8B6FF'],hex:1,sy:.82},life:[{p:'blink',n:40,cols:['#FFFFFF','#FFE9A8','#C8D8FF'],size:1.8,add:1,z0:40,z1:230,rad:260}]},
    /* 6 · Océano — el arrecife */
    oce:{beam:{u:.5,z:86,col:'#BFF0FF',w:80},items:[W('coral',[C.petalD,'#F59A5A',C.petal],22),W('weed',['#4E8A6E','#6FA88A'],18),W('shells',[C.petalL,C.cream,'#F3DFB4'],20),W('rocks',['#7A9A9A','#5F8282'],22),W('weed',['#3E7A5E','#5F9A7A'],18),W('coral',['#E07FD0','#8DB5AA'],22)],
      life:[{p:'rise',n:26,cols:['#E8FAFF','#BFEFFF'],geo:'sph',size:2.4,sp:.08,op:.6,wob:6},{f:'fly',n:3,cols:['#F59A5A',C.butter,'#8EC3CF'],at:[[-120,-60],[100,-20],[0,120]],body:5,wing:4,flap:9,amp:.6,sp:.35,z:60,swim:1}]},
    /* 7 · Desierto — la duna */
    des:{beam:{u:.5,z:90,col:'#FFE0A0',w:72},items:[W('cactus',[],18),W('rocks',['#C98A52','#B87A42','#D9A062'],24),W('jars',['#C9694B','#E0A060','#A5523A'],18),W('cactus',[],18),W('rocks',['#D9A062','#C98A52'],22),W('crate',['#C9873C'],18)],
      rug:{at:[-110,50],r:50,cols:['#A5523A','#E9C99A','#C9694B'],hex:1},life:[{p:'drift',n:30,cols:['#F3D9A0','#E9C08A'],size:1.4,z0:4,z1:60,op:.7}]},
    /* 8 · Antártida — el témpano */
    ant:{items:[W('ice',[],22),W('snow',[],26,{gap1:30}),W('ice',[],22),W('snow',[],24,{gap1:30}),W('lantern',['#E6F4FF','#CFE6FF'],12),W('rocks',['#9AAAB4','#B8C6CE'],22)],
      life:[{p:'fall',n:40,cols:['#FFFFFF','#E4F1F5'],size:2.2,sp:.05,wob:22,op:.9}]},
    /* 9 · Colmenar */
    col:{free:1,beam:{u:.5,z:90,col:'#FFE8B0'},items:[W('honey',[],20),W('jars',[C.honey,C.honeyL,C.amber],18),W('flowers',[C.butter,C.cream,C.petal],24),W('bigplant',[C.terra,C.sage,C.sageD],24),W('crate',['#C9A060'],18),W('flowers',[C.butter,'#F59A5A'],22)],
      life:[{f:'fly',n:5,cols:['#F5CE55'],at:[[-120,-80],[80,-120],[160,40],[-60,60],[0,-40]],body:3.2,bodyCol:'#E4A844',wing:3.6,wingCol:'#FFFFFF',wingOp:.7,flap:40,amp:.8,sp:.9,rx:40,ry:30,z:55}]},
    /* 10 · Biblioteca */
    bib:{beam:{u:.5,z:96,col:'#FFF0C8'},items:[W('books',['#6F8D8A','#C9563A','#E9C99A','#4E6B46'],18),W('books',['#8A5A3A','#C9A060',C.cream],18),W('stool',['#7A5232'],14),W('lantern',['#FFE3A0','#FFD36A'],12),W('books',['#A5523A','#6F968C',C.butter],18),W('bigplant',['#6F968C',C.sage,C.sageD],24)],
      rug:{at:[-40,70],r:64,cols:['#4E6B46','#C9A060','#6F8D5E'],hex:1},life:[{p:'drift',n:24,cols:['#FFF0C8'],size:1.2,add:1,z0:20,z1:180,op:.7}]},
    /* 11 · Cocina de miel */
    coc:{items:[W('jars',[C.honey,C.honeyL,C.amber],18),W('barrel',['#A86A2C'],18),W('crate',['#B8823E'],18),W('jars',['#E9DCC6',C.honey,'#C9A060'],18),W('bigplant',[C.terra,C.sage,C.sageD],22),W('honey',[],18)],
      rug:{at:[-30,80],r:50,cols:['#C9694B','#F3DFB4','#E4A844']},life:[{p:'rise',n:16,cols:['#FFFFFF','#F6EEDC'],geo:'sph',size:3.6,sp:.05,op:.35,rad:60,z0:40,z1:200,wob:12,ctr:[150,-120]},{f:'fly',n:2,cols:['#F5CE55'],at:[[-100,-60],[60,40]],body:3,bodyCol:'#E4A844',wing:3.4,wingCol:'#FFFFFF',wingOp:.7,flap:40,amp:.8,sp:.8,rx:40,ry:30,z:60}]},
    /* 12 · Relojería */
    rel:{items:[W('gears',['#C9A060','#8A6A4A'],24),W('crate',['#7A5232'],18),W('gears',['#B8823E','#D9B77A'],22),W('stool',['#5A3A22'],14),W('books',['#5A4A42','#8A6A4A',C.cream],16),W('lantern',['#FFE3A0','#FFD36A'],12)],
      rug:{at:[60,70],r:58,cols:['#5A3A22','#C9A060','#7A5232']},life:[{p:'drift',n:18,cols:['#FFE3A0','#E9C99A'],size:1.4,add:1,z0:20,z1:170,op:.6}]},
    /* 13 · Invernadero nocturno */
    inn:{free:1,items:[W('bigplant',['#3E3E66','#6FA88A','#4E8A6E'],24),W('flowers',['#C8D8FF','#FFFFFF','#E6E9FF'],22),W('bigplant',['#3E3E66','#5F9A7A','#3E7A5E'],24),W('flowers',['#B8C8FF','#FFFFFF'],22),W('lantern',['#E6E9FF','#B8C8FF'],12)],
      life:[{p:'blink',n:26,cols:['#E8FF9A','#C8FF7A'],size:2,add:1,z0:10,z1:130}]},
    /* 14 · Teatro de sombras */
    tea:{free:1,items:[W('crate',['#7A2E2E'],18),W('pillow',['#C9563A','#E9C99A'],18),W('lantern',['#FFE3A0','#FFC870'],12),W('frame',['#C9A060','#2B1C2A'],18),W('candles',[C.cream],14),W('crate',['#5A3A22'],18)],
      life:[{p:'drift',n:22,cols:['#FFE3A0'],size:1.3,add:1,z0:20,z1:200,op:.6}]},
    /* 15 · Faro */
    far:{beam:{u:.5,z:96,col:'#FFF8D8',w:90},items:[W('barrel',['#4E7A9A'],18),W('rocks',['#9AAAB4','#7A8A94'],22),W('crate',['#B8823E'],18),W('shells',[C.cream,'#F3DFB4'],20),W('lantern',['#FFF4D0','#FFE3A0'],12)],
      rug:{at:[60,90],r:50,cols:['#4E7A9A','#F3EBD8','#C9563A']},life:[{f:'fly',n:3,cols:['#E9DCC6'],at:[[0,-120],[40,-100],[-40,-110]],wing:4,flap:30,amp:.7,sp:.9,rx:40,ry:30,z:150}]},
    /* 16 · Tren nocturno */
    tre:{items:[W('crate',['#7A5232'],18),W('barrel',['#5A4A42'],16),W('crate',['#9A6A3A'],18),W('lantern',['#FFE3A0','#FFD36A'],12),W('books',['#C9563A','#E9C99A'],16)],
      rug:{at:[-70,60],r:54,cols:['#7A2E2E','#C9A060','#9A3E3E'],hex:1},life:[{p:'blink',n:24,cols:['#FFFFFF','#FFE9A8'],size:1.5,add:1,z0:60,z1:220}]},
    /* 17 · Sótano de cera */
    sot:{items:[W('candles',[C.cream],14),W('barrel',['#8A6A4A'],18),W('candles',['#F3E7C8'],14),W('crate',['#7A5232'],18),W('candles',[C.cream],14),W('honey',[],18)],
      life:[{p:'rise',n:16,cols:['#FFC870','#FF9A3A'],size:1.4,add:1,sp:.08,z0:20,z1:160}]},
    /* 18 · Cueva de cristales */
    cue:{items:[W('crystals',['#C8B6FF','#9FB6FF'],20),W('rocks',['#4A3E5A','#5A4E6E'],24),W('crystals',['#9FE0D0','#C8B6FF'],20),W('rocks',['#3E3550','#5A4E6E'],22),W('crystals',['#FFB6E6','#C8B6FF'],18)],
      life:[{p:'blink',n:30,cols:['#E6DCFF','#BFFFF0','#FFFFFF'],size:1.6,add:1,z0:10,z1:160}]},
    /* 19 · Volcán */
    vol:{items:[W('embers',[],20),W('rocks',['#3A2A26','#5A3A30'],24),W('embers',[],20),W('rocks',['#2E221E','#4A3A30'],22),W('crate',['#5A3A22'],16)],
      life:[{p:'rise',n:30,cols:['#FF8A3A','#FFC870','#FF5A2A'],size:1.6,add:1,sp:.09,wob:12}]},
    /* 20 · Cumbre */
    cum:{free:1,items:[W('rocks',['#9AA4AE','#B8C2CA','#7A848E'],24),W('snow',[],24,{gap1:30}),W('rocks',['#8A949E','#B8C2CA'],22),W('crate',['#C98A42'],18),W('flowers',['#C8D8FF','#FFFFFF','#F5CE55'],20)],
      life:[{p:'drift',n:26,cols:['#FFFFFF','#E4F1F5'],size:1.8,z0:10,z1:200,op:.8}]},
    /* 21 · Desván */
    dsv:{free:1,beam:{u:.72,z:96,col:'#FFF0C8',yaw:-.2},items:[W('crate',['#9A7450'],20),W('crate',['#B8823E'],20),W('books',['#8A6A4A','#C9A060',C.cream],18),W('frame',['#8A6A4A','#E9DCC6'],18),W('barrel',['#7A5232'],16),W('pillow',['#C9A060','#E9DCC6'],18)],
      life:[{p:'drift',n:30,cols:['#FFF0C8'],size:1.2,add:1,z0:10,z1:200,op:.7}]},
    /* 22 · Estudio de Amaranta */
    est:{items:[W('paper',[],28),W('books',['#7A2E3A','#C9A060','#4E6B46',C.cream],18),W('frame',['#C9A060','#F3EBD8'],18),W('bigplant',['#6F968C',C.sage,C.sageD],22),W('candles',[C.cream],14),W('stool',['#7A5232'],14)],
      life:[{p:'drift',n:14,cols:['#F6EEDC','#EFE2C6'],size:2.6,z0:20,z1:180,op:.9}]},
    /* 23 · Sala de retratos */
    ret:{items:[W('frame',['#C9A060','#7A2E3A'],18),W('frame',['#8A6A4A','#E9DCC6'],18),W('stool',['#5A3A22'],14),W('jars',['#4E7A9A','#C9563A','#F5CE55'],18),W('bigplant',['#7A2E3A',C.sage,C.sageD],22)],
      rug:{at:[-40,80],r:56,cols:['#5A2E3A','#C9A060','#7A3E4A'],hex:1},life:[{p:'drift',n:18,cols:['#FFE3A0'],size:1.2,add:1,z0:20,z1:180,op:.55}]},
    /* 24 · Jardín de los nombres */
    jar:{free:1,beam:{u:.5,z:90,col:'#F4FFD8'},items:[W('flowers',[C.petal,C.butter,C.cream],24),W('bush',[C.sage,C.sageD,'#5F7F50'],24),W('flowers',['#D8A3C9',C.petalD,C.butter],22),W('bench',['#9A7450'],26),W('bush',[C.sageD,'#5F7F50',C.sage],24),W('flowers',[C.cream,C.petalL],22)],
      life:[{p:'fall',n:20,cols:[C.petalL,'#FFFFFF',C.petal],size:2.4,sp:.04,wob:22},{f:'fly',n:3,cols:[C.petalD,C.butter,'#8EC3CF'],at:[[-120,-60],[80,-80],[120,80]],day:1}]},
    /* 25 · El Corazón */
    cor:{items:[W('honey',[],20),W('candles',[C.cream],14),W('jars',[C.honey,C.honeyL,C.amber],18),W('honey',[],20),W('candles',['#F3E7C8'],14)],
      rug:{at:[0,40],r:96,cols:['#C9772F','#E4A844','#F3C872'],hex:1,sy:.82},life:[{p:'rise',n:30,cols:['#FFE3A0','#FFD36A','#FFF4D0'],size:1.6,add:1,sp:.05,op:.8}]}
  };

  function merge(gs){let n=0;for(const g of gs)n+=g.attributes.position.count;if(!n)return null;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
    for(const g of gs){const c=g.attributes.position.count;pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);col.set(g.attributes.color.array,o*3);o+=c;g.dispose()}
    const G=new T3.BufferGeometry();G.setAttribute('position',new T3.BufferAttribute(pos,3));G.setAttribute('normal',new T3.BufferAttribute(nor,3));G.setAttribute('color',new T3.BufferAttribute(col,3));G.computeBoundingSphere();G.userData.shared=true;return G}
  const SC=1.55;
  function build(id){const th=THEME[id],g=new T3.Group(),B=new Bk(),F=new Bk(),R=rf('r3d'+id);glows.length=0;const ticks=[];
    if(th.beam)beam(g,th.beam);
    if(th.rug){const ob=obstacles(id),ok=(x,y)=>!ob.some(([ox,oy,or])=>Math.hypot(x-ox,y-oy)<or*.5+th.rug.r*.55);let at=th.rug.at;if(!ok(...at)){at=null;for(let k=0;k<200&&!at;k++){const a=R(0,6.28),r=R(0,150),x=Math.cos(a)*r,y=Math.sin(a)*r+30;if(ok(x,y))at=[x,y]}}if(at)rug(B,{...th.rug,at})}
    const want=[];for(let k=0;k<2;k++)for(const it of th.items)want.push({...it,r:it.r*SC,free:th.free&&k===1});
    const gb=[],gf=[],M=new T3.Matrix4(),M2=new T3.Matrix4();
    const SP=spots(id,want,R);for(const s of SP){const sb=new Bk(),sf=new Bk(),s0={...s,r:s.r/SC},g0=glows.length;try{IT[s.k](sb,sf,s0,R,s.c)}catch(e){console.warn('deco',id,s.k,e);continue}
      M.makeTranslation(s.x,0,s.y).multiply(M2.makeScale(SC,SC,SC)).multiply(new T3.Matrix4().makeTranslation(-s.x,0,-s.y));
      if(sb.p.length){const q=sb.geo();q.applyMatrix4(M);gb.push(q)}if(sf.p.length){const q=sf.geo();q.applyMatrix4(M);gf.push(q)}
      for(let i=g0;i<glows.length;i++){const G=glows[i];glows[i]=[s.x+(G[0]-s.x)*SC,s.y+(G[1]-s.y)*SC,G[2]*SC,G[3],G[4]*SC]}}
    B.mesh(g);F.mesh(g,true);{const a=merge(gb),b=merge(gf);if(a){const m=new T3.Mesh(a,mat());m.userData.lp=1;g.add(m)}if(b){const m=new T3.Mesh(b,matF());m.userData.lp=1;g.add(m)}}
    for(const [x,y,z,col,sz] of glows){const sp=glowSprite(col,sz);sp.position.set(...P(x,y,z));sp.material.opacity=.42;g.add(sp);sp.userData.flick=Math.random()*6}
    for(const L of th.life||[]){if(L.p){const o={...L,type:L.p},tk=particles(g,o);if(L.ctr){const sub=g.children[g.children.length-1];sub.position.x+=L.ctr[0];sub.position.z+=L.ctr[1]}ticks.push(tk)}else ticks.push(fliers(g,L))}
    g.userData.tick=(t,still,amb)=>{for(const f of ticks)f(t,still,amb);
      for(const o of g.children){if(o.userData.sun)o.material.opacity=o.userData.sun===2?.07+.1*Math.max(0,1-amb):.06+.14*Math.max(0,amb-.4)*(still?1:.85+.15*Math.sin(t*.7));else if(o.isSprite&&o.userData.flick!=null)o.material.opacity=.36+(still?0:.08*Math.sin(t*9+o.userData.flick)*Math.sin(t*3.1))}};
    return g}
  for(const id in THEME)PROPS3D.addRoom(id,()=>build(id));
  window.R3THEME=THEME;window.R3ADD=(id,th)=>{THEME[id]=th;PROPS3D.addRoom(id,()=>build(id))};
})();
