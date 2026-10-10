/* ══════════ VESTUARIO · piezas nuevas para los habitantes ══════════
   Sombreros, rasgos, cuellos, espaldas, estampados y objetos extra.
   Todas usan el mismo sistema de coordenadas que humans.js:
   pt(adelante, altura) · hd = centro de la cabeza · sh = hombros · hip = cadera. */
const TORSO_POLY=G=>{const {pt,sh,hip,tx}=G,o=G.H&&G.H.old?1:0;return[pt(tx(-7+o),sh),pt(tx(8+o),sh),pt(tx(10),hip-2),pt(tx(-8),hip-2)]};
const both=(...fs)=>(...a)=>{for(const fn of fs)if(fn)fn(...a)};
/* ── sombreros y tocados ── */
const HAT2={
  crown:(cols,leaf=C.sageD)=>(p,G)=>{const {pt,hd,s}=G,n=7;
    for(let i=0;i<n;i++){const a=(168-i*(156/(n-1)))*Math.PI/180,c=pt(2+Math.cos(a)*15.5,hd+3+Math.sin(a)*13.5);p.cut(p.leaf(c[0],c[1],-Math.PI/2+(i-3)*.35,8,3),leaf,{sh:0,rough:.1})}
    for(let i=0;i<n;i++){const a=(168-i*(156/(n-1)))*Math.PI/180,c=pt(2+Math.cos(a)*15.5,hd+3+Math.sin(a)*13.5),col=cols[i%cols.length];
      for(let k=0;k<5;k++){const b=k/5*TAU+i;p.flat(p.ell(c[0]+Math.cos(b)*2.3*s,c[1]+Math.sin(b)*2.3*s,2,2,8),col)}p.flat(p.ell(c[0],c[1],1.3,1.3,8),'#F5CE55')}},
  leaves:(cols)=>(p,G)=>{const {pt,hd}=G,n=8;for(let i=0;i<n;i++){const a=(172-i*(164/(n-1)))*Math.PI/180,c=pt(2+Math.cos(a)*15,hd+3+Math.sin(a)*13);
    const q=[];for(let k=0;k<5;k++){const b=-Math.PI/2+(i-3.5)*.3+(k-2)*.55,r=k%2?4:8;q.push([c[0]+Math.cos(b)*r*G.s,c[1]+Math.sin(b)*r*G.s])}q.push(c);p.cut(q,cols[i%cols.length],{sh:0,rough:.2})}},
  bandana:(col,dots='#FBF4E3')=>(p,G)=>{const {pt,hd}=G,cap=[];for(let k=0;k<=14;k++){const a=(200-k*14.3)*Math.PI/180;cap.push(pt(2+Math.cos(a)*16,hd+2+Math.sin(a)*16))}
    p.cut(cap,col,{rough:.3});p.cut([pt(-13,hd+4),pt(-22,hd+2),pt(-20,hd-4),pt(-12,hd+1)],shade(col,.9),{rough:.2});p.cut([pt(-13,hd+3),pt(-18,hd-9),pt(-14,hd-10),pt(-11,hd+1)],shade(col,.8),{rough:.2});
    if(dots)for(const [a,b] of[[-5,hd+9],[5,hd+13],[0,hd+16],[11,hd+8],[-9,hd+13]])p.flat(p.ell(...pt(a,b),1.3,1.3,8),dots,.9)},
  goggles:(col='#6A4A30',lens='#8FC3D6')=>(p,G)=>{const {pt,hd,s}=G;p.line([pt(-13,hd+7),pt(17,hd+10)],col,2.4);
    for(const dx of[5,12.5]){const q=pt(dx,hd+11);p.cut(p.ell(q[0],q[1],4,3.6,14),'#B08A4A',{sh:0,rough:0});p.flat(p.ell(q[0],q[1],2.8,2.5,12),lens);p.flat(p.ell(q[0]-1*s,q[1]-1*s,1,.8,6),'#FFFFFF',.85)}},
  bow:(col)=>(p,G)=>{const {pt,hd,s}=G,c=pt(-5,hd+14);for(const sg of[-1,1])p.cut([c,[c[0]+sg*10*s,c[1]-7*s],[c[0]+sg*12*s,c[1]+2*s],[c[0]+sg*4*s,c[1]+3*s]],sg<0?shade(col,.85):col,{rough:.3});p.cut(p.ell(c[0],c[1],3,3,10),shade(col,.7),{sh:0,rough:.1})},
  nightcap:(col,pom='#FBF4E3')=>(p,G)=>{const {pt,hd,t}=G,w=G.portrait?0:Math.sin(t*1.4)*1.5;
    p.cut([pt(-13,hd+6),pt(16,hd+8),pt(12,hd+20),pt(0,hd+25),pt(-14,hd+20+w*.4),pt(-24,hd+8+w),pt(-18,hd+8)],col,{rough:.4});
    p.flat([pt(-13,hd+6),pt(16,hd+8),pt(16,hd+11),pt(-13,hd+9.5)],shade(col,.82));const q=pt(-25,hd+6+w);p.cut(p.ell(q[0],q[1],4.2,4.2,14),pom,{rough:.4})},
  antennae:(col='#4A3222',tip='#F5CE55')=>(p,G)=>{const {pt,hd,t}=G,w=G.portrait?0:Math.sin(t*3)*1.2;
    p.line([pt(-12,hd+6),pt(0,hd+15),pt(16,hd+9)],col,1.8);for(const [a,b,c] of[[-1,hd+15,-1],[7,hd+15,1]]){const e=pt(a+c*6+w,hd+31);p.line([pt(a,b-1),pt(a+c*2,hd+24),e],col,1.4);p.cut(p.ell(e[0],e[1],2.8,2.8,10),tip,{sh:0,rough:.1})}},
  hexCrown:(col='#E4A844',gem='#F4AFA6')=>(p,G)=>{const {pt,hd,s}=G;p.cut([pt(-9,hd+10),pt(13,hd+11),pt(13,hd+14.5),pt(-9,hd+13.5)],shade(col,.85),{rough:.1});
    for(const [dx,dz,r] of[[-5,hd+18,4.6],[2,hd+21,5.6],[9,hd+18,4.6]]){const c=pt(dx,dz),H=hexPts(c,r,s,Math.PI/6);p.cut(H,col,{sh:0,rough:.1});p.flat(hexPts(c,r*.5,s,Math.PI/6),'#FFF1C4',.8)}
    const g=pt(2,hd+22);p.flat(p.ell(g[0],g[1],1.8,1.8,8),gem)},
  wrap:(col,band)=>(p,G)=>{const {pt,hd}=G,c=pt(1,hd+9);p.cut(p.ell(c[0],c[1],18,12,24,-.08),col,{rough:.4});
    for(const [a,b,c2] of[[-14,hd+6,12],[-12,hd+11,17],[-8,hd+15,15]])p.line([pt(a,b),pt(a+c2,b+4),pt(a+c2+6,b+2)],shade(col,.8),1.1,.7);if(band)p.flat([pt(-15,hd+4),pt(18,hd+6),pt(18,hd+8.5),pt(-15,hd+6.5)],band)},
  earmuffs:(col,band='#8A5A3A')=>(p,G)=>{const {pt,hd}=G,arc=[];for(let k=0;k<=10;k++){const a=(170-k*14)*Math.PI/180;arc.push(pt(-3+Math.cos(a)*14,hd+2+Math.sin(a)*17))}p.line(arc,band,2);const m=pt(-3,hd+1);p.cut(p.ell(m[0],m[1],6,7,16),col,{rough:.6})},
  headphones:(col='#3A3A48',cup='#E07A4E')=>(p,G)=>{const {pt,hd}=G,arc=[];for(let k=0;k<=10;k++){const a=(180-k*18)*Math.PI/180;arc.push(pt(-3+Math.cos(a)*15,hd+2+Math.sin(a)*17))}p.line(arc,col,2.6);const m=pt(-3,hd);p.cut(p.ell(m[0],m[1],5.5,7,16),cup,{rough:.1});p.flat(p.ell(m[0],m[1],3,4,12),shade(cup,.7))},
  rays:(col='#F5CE55',col2='#E4A844')=>(p,G)=>{const {pt,hd}=G;for(let i=0;i<9;i++){const a=(175-i*21)*Math.PI/180,b=pt(2+Math.cos(a)*14,hd+2+Math.sin(a)*14),l=i%2?7:11,tip=pt(2+Math.cos(a)*(14+l),hd+2+Math.sin(a)*(14+l)),n=[-Math.sin(a)*3.4,Math.cos(a)*3.4];
    p.cut([pt(2+Math.cos(a)*14+n[0],hd+2+Math.sin(a)*14+n[1]),tip,pt(2+Math.cos(a)*14-n[0],hd+2+Math.sin(a)*14-n[1])],i%2?col2:col,{sh:0,rough:.1})}
    const band=[];for(let k=0;k<=14;k++){const a=(185-k*13.2)*Math.PI/180;band.push(pt(2+Math.cos(a)*15.5,hd+2+Math.sin(a)*15.5))}p.line(band,col2,2.4)},
  feather:(col,fe='#F3E6C4')=>(p,G)=>{const {pt,hd,s,t}=G,w=G.portrait?0:Math.sin(t*2)*.08;HAT.beret(col)(p,G);const b=pt(-6,hd+17);p.cut(p.leaf(b[0],b[1],-Math.PI/2-.65*G.f+w,30,5.5),fe,{sh:0,rough:.2});p.line([b,[b[0]-Math.sin(.65*G.f)*26*s,b[1]-Math.cos(.65)*26*s]],shade(fe,.7),.8)},
  candle:(p,G)=>{const {pt,hd,s,t}=G;p.cut([pt(-11,hd+9),pt(15,hd+10),pt(14,hd+15),pt(-10,hd+14)],'#FBF4E3',{rough:.3});p.cut([pt(-4,hd+14),pt(8,hd+14),pt(8,hd+30),pt(-4,hd+30)],'#F6EAD0',{rough:.2});
    for(const [dx,l] of[[-3,6],[3,9],[7,4]])p.cut([pt(dx-1.5,hd+30),pt(dx+1.5,hd+30),pt(dx+1.5,hd+30-l),pt(dx,hd+28-l-1.5),pt(dx-1.5,hd+30-l)],'#FFF8E8',{sh:0,rough:.1});
    const fl=G.portrait?0:Math.sin(t*11)*.6,c=pt(2,hd+30);p.line([c,[c[0],c[1]-3*s]],'#4A3222',.8);p.flat([[c[0]-2.4*s,c[1]-3*s],[c[0]+fl*s,c[1]-12*s],[c[0]+2.4*s,c[1]-3*s]],'#F5A83A');p.flat([[c[0]-1.1*s,c[1]-3.4*s],[c[0]+fl*.5*s,c[1]-8*s],[c[0]+1.1*s,c[1]-3.4*s]],'#FFE8A0');
    if(!G.portrait){p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(c[0],c[1]-7*s,14,14,16),'rgba(255,190,90,.16)');p.g.restore()}},
  crystals:(cols)=>(p,G)=>{const {pt,hd,s}=G;[[-7,hd+12,-.5,11],[0,hd+15,-.1,15],[7,hd+14,.3,12],[12,hd+10,.7,8]].forEach(([dx,dz,a,l],i)=>{const b=pt(dx,dz),c=cols[i%cols.length],u=[Math.sin(a*G.f),-Math.cos(a)],n=[-u[1],u[0]];
    const Q=[[b[0]-n[0]*3*s,b[1]-n[1]*3*s],[b[0]+u[0]*l*.7*s-n[0]*3*s,b[1]+u[1]*l*.7*s-n[1]*3*s],[b[0]+u[0]*l*s,b[1]+u[1]*l*s],[b[0]+u[0]*l*.7*s+n[0]*3*s,b[1]+u[1]*l*.7*s+n[1]*3*s],[b[0]+n[0]*3*s,b[1]+n[1]*3*s]];p.cut(Q,c,{sh:0,rough:0});p.flat([Q[0],Q[1],Q[2],[b[0],b[1]]],'#FFFFFF',.25)});
    if(!G.portrait){const c=pt(2,hd+20);p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(c[0],c[1],16,12,16),'rgba(190,170,255,.12)');p.g.restore()}},
  moonPin:(col='#F6D98A')=>(p,G)=>{const {pt,hd,s}=G,c=pt(-7,hd+10);p.cut(p.ell(c[0],c[1],5,5,18),col,{sh:0,rough:0});p.flat(p.ell(c[0]+2.4*G.f*s,c[1]-1*s,4.2,4.2,18),'#C9D3E8')},
  visor:(col)=>(p,G)=>{const {pt,hd}=G;p.cut([pt(-12,hd+8),pt(15,hd+9),pt(15,hd+12),pt(-12,hd+11)],col,{rough:.1});p.cut([pt(8,hd+9),pt(25,hd+6),pt(23,hd+10),pt(9,hd+12)],shade(col,.8),{rough:.1})},
  hoodC:(col,fur)=>(p,G)=>{const {pt,hd}=G,ring=[];for(let k=0;k<=20;k++){const a=k/20*TAU;ring.push(pt(3+Math.cos(a)*19,hd+1+Math.sin(a)*19))}p.cut(ring,fur||col,{rough:fur?1.6:.4});const inn=[];for(let k=0;k<=18;k++){const a=k/18*TAU;inn.push(pt(4+Math.cos(a)*13.5,hd+Math.sin(a)*14))}p.flat(inn,fur?col:shade(col,.75))},
  lamp:(col='#E4A844')=>(p,G)=>{/* casco de farero: una cúpula con un haz que gira */const {pt,hd,s,t}=G,cap=[];for(let k=0;k<=14;k++){const a=(195-k*15)*Math.PI/180;cap.push(pt(2+Math.cos(a)*16,hd+3+Math.sin(a)*15))}p.cut(cap,'#2E3A52',{rough:.2});
    p.cut([pt(-3,hd+17),pt(7,hd+17),pt(6,hd+24),pt(-2,hd+24)],'#FFF1B0',{sh:0,rough:0});p.cut([pt(-5,hd+24),pt(9,hd+24),pt(2,hd+29)],'#B8484A',{sh:0,rough:.1});
    if(!G.portrait){const c=pt(2,hd+20),a=t*1.2;p.g.save();p.g.globalCompositeOperation='lighter';p.flat([c,[c[0]+Math.cos(a)*60*s,c[1]-8*s],[c[0]+Math.cos(a)*60*s,c[1]+8*s]],'rgba(255,240,170,.16)');p.g.restore()}},
  plume:(col,base)=>(p,G)=>{/* chistera con estrella */HAT.top(base)(p,G);const {pt,hd,s}=G,c=pt(2,hd+26);p.text('✦',c[0],c[1],12,col)},
  clockTop:(p,G)=>{HAT.top('#3A3A48')(p,G);const {pt,hd,s}=G,c=pt(2,hd+22);p.cut(p.ell(c[0],c[1],6.5,6.5,18),'#F4EFE2',{sh:0,rough:0});p.line([...p.ell(c[0],c[1],6.5,6.5,18),p.ell(c[0],c[1],6.5,6.5,18)[0]],'#C9A05C',1.2);p.line([c,[c[0],c[1]-4.5*s]],'#3A2A20',1);p.line([c,[c[0]+3*s,c[1]+1*s]],'#3A2A20',1)},
  ember:(p,G)=>{const {pt,hd,s,t}=G;for(let i=0;i<6;i++){const a=(160-i*28)*Math.PI/180,b=pt(2+Math.cos(a)*14,hd+4+Math.sin(a)*12),h=(i%2?8:12)+(G.portrait?0:Math.sin(t*6+i)*2);
    p.flat([[b[0]-3*s,b[1]],[b[0]+(Math.sin(t*4+i)*1.5)*s,b[1]-h*s],[b[0]+3*s,b[1]]],i%2?'#F5A83A':'#E0584A')}p.cut([pt(-12,hd+5),pt(16,hd+7),pt(15,hd+11),pt(-12,hd+9)],'#3A2A20',{rough:.2})}
};
/* ── rasgos de la cara ── */
const FX2={
  freckles:(col='#B97A55')=>(p,G,e1,e2)=>{const s=G.s;for(const [dx,dy] of[[-1,5],[2,6],[-3,7],[3,4.5],[5,6.5]])p.flat(p.ell(e2[0]+dx*s,e2[1]+dy*s,.7,.7,6),col,.75);for(const [dx,dy] of[[-4,5],[-2,6.5]])p.flat(p.ell(e1[0]+dx*s,e1[1]+dy*s,.7,.7,6),col,.75)},
  smudge:(col)=>(p,G,e1,e2)=>{const s=G.s;p.flat(p.ell(e1[0]-3*s,e1[1]+6*s,3.2,1.8,10,.4),col,.7)},
  monocle:(col='#C9A05C')=>(p,G,e1,e2)=>{const s=G.s,E=p.ell(e2[0],e2[1],4.4,4.4,16);p.flat(E,'#DCEFF6',.35);p.line([...E,E[0]],col,1.2);p.line([[e2[0]+1*s,e2[1]+4.4*s],[e2[0]-2*s,e2[1]+12*s],[e2[0]-6*s,e2[1]+18*s]],col,.7,.8)},
  bigGlasses:(col='#6A4A30',r=4.6)=>(p,G,e1,e2)=>{for(const e of[e1,e2]){const E=p.ell(e[0],e[1],r,r,16);p.flat(E,'#FFFFFF',.15);p.line([...E,E[0]],col,1.3)}p.line([[e1[0]+r*G.s,e1[1]],[e2[0]-r*G.s,e2[1]]],col,1.1)},
  goatee:(col)=>(p,G,e1,e2,mo)=>{const s=G.s;p.cut([[mo[0]-2*s,mo[1]+2.5*s],[mo[0]+2.4*s,mo[1]+2.5*s],[mo[0]+.4*s,mo[1]+7*s]],col,{sh:0,rough:.2})},
  lashes:(col='#4A3222')=>(p,G,e1,e2)=>{const s=G.s;for(const e of[e1,e2])p.line([[e[0]+1.4*s,e[1]-2.4*s],[e[0]+3.2*s,e[1]-3.6*s]],col,.8)},
  snow:(p,G,e1,e2)=>{const s=G.s;p.flat(p.ell(e2[0]+1*s,e2[1]-4*s,3,2,10),'#F4AFA6',.9);p.flat(p.ell(e1[0]-3*s,e1[1]-4*s,2.4,1.6,10),'#F4AFA6',.7)},
  paint:(p,G,e1,e2)=>{const s=G.s;p.flat(p.ell(e1[0]-4*s,e1[1]-6*s,2,1.2,8,.3),'#3E8FA0',.8);p.flat(p.ell(e2[0]+2*s,e2[1]+6*s,1.6,1,8),'#B8484A',.8)}
};
/* ── cuello: bufandas, lazos, collares ── */
const NECK={
  scarf:(col,stripe)=>(p,G)=>{const {pt,sh,t}=G,w=G.portrait?0:Math.sin(t*1.8)*1.2;p.cut([pt(-7,sh+3),pt(10,sh+3.5),pt(10,sh-3),pt(-7,sh-3.5)],col,{rough:.3});
    const tail=[pt(-4,sh-1),pt(-12+w,sh-17),pt(-6+w,sh-19),pt(0,sh-3)];p.cut(tail,shade(col,.9),{rough:.3});if(stripe){p.line([pt(-1,sh+3),pt(0,sh-3)],stripe,1.3,.9);p.line([pt(5,sh+3),pt(6,sh-3)],stripe,1.3,.9);p.line([pt(-9+w,sh-12),pt(-4+w,sh-13)],stripe,1.3,.9)}},
  bowtie:(col)=>(p,G)=>{const {pt,sh,s}=G,c=pt(8.5,sh-1.5);for(const sg of[-1,1])p.cut([c,[c[0]+sg*5*s,c[1]-3*s],[c[0]+sg*5*s,c[1]+3*s]],col,{sh:0,rough:.1});p.flat(p.ell(c[0],c[1],1.5,1.5,8),shade(col,.7))},
  necklace:(col='#E4A844',drop='#C47A2C')=>(p,G)=>{const {pt,sh,s}=G;for(let k=0;k<=6;k++){const u=k/6,q=pt(-3+u*12,sh-1-Math.sin(u*Math.PI)*5);p.flat(p.ell(q[0],q[1],1.2,1.2,8),col)}const d=pt(3,sh-8);p.cut(hexPts(d,2.6,s,Math.PI/6),drop,{sh:0,rough:0})},
  ruff:(col='#FBF4E3')=>(p,G)=>{const {pt,sh,s}=G;for(let k=0;k<9;k++){const a=k/8*Math.PI,q=pt(2+Math.cos(a)*10,sh+Math.sin(a)*2.4-1);p.cut(p.ell(q[0],q[1],3.4,2.8,10),k%2?col:shade(col,.9),{sh:0,rough:.1})}},
  whistle:(col='#B8484A')=>(p,G)=>{const {pt,sh,s}=G;p.line([pt(0,sh),pt(5,sh-10),pt(9,sh)],col,.9);const w=pt(5,sh-11);p.cut([[w[0]-1.5*s,w[1]-1.5*s],[w[0]+4*G.f*s,w[1]-1.5*s],[w[0]+4*G.f*s,w[1]+1.6*s],[w[0]-1.5*s,w[1]+1.6*s]],'#C9D0D8',{sh:0,rough:0})},
  kerchief:(col,dots)=>(p,G)=>{const {pt,sh}=G,Q=[pt(-6,sh+1.5),pt(10,sh+1.5),pt(5,sh-10)];p.cut(Q,col,{rough:.2});if(dots)for(const [a,b] of[[1,sh-2],[5,sh-5],[7,sh-1]])p.flat(p.ell(...pt(a,b),1,1,6),dots)},
  shawl:(col,fringe)=>(p,G)=>{const {pt,sh,s}=G,Q=[pt(-10,sh+2),pt(11,sh+2.5),pt(12,sh-6),pt(3,sh-15),pt(-9,sh-10)];p.cut(Q,col,{rough:.4});if(fringe)for(let k=0;k<6;k++){const a=pt(12-k*1.8,sh-6-k*1.8);p.line([a,[a[0],a[1]+4*s]],fringe,.8,.8)}},
  medal:(col='#E4A844')=>(p,G)=>{const {pt,sh,s}=G;p.line([pt(1,sh),pt(5,sh-9),pt(9,sh)],'#3E8FA0',1.2);const m=pt(5,sh-11);p.cut(p.ell(m[0],m[1],3,3,12),col,{sh:0,rough:0});p.flat(hexPts(m,1.6,s),'#FFF1C4',.8)}
};
/* ── lo que va a la espalda ── */
const BACK2={
  cape:(col,lin,len=0)=>(p,G)=>{const {pt,sh,hip,t}=G,w=G.portrait?0:Math.sin(t*1.6)*1.5,lo=Math.max(2,hip-8-len);
    const Q=[pt(-6,sh+2),pt(6,sh+2),pt(5,lo+4),pt(-4,lo+w),pt(-14,lo+3-w),pt(-18,hip+6),pt(-11,sh-1)];p.cut(Q,col,{rough:.4});if(lin)p.flat([pt(-6,sh+1),pt(-11,sh-2),pt(-18,hip+6),pt(-15,hip+2)],lin,.8)},
  leafCape:(col,col2)=>(p,G)=>{BACK2.cape(col,null,4)(p,G);const {pt,hip}=G;for(let k=0;k<6;k++){const q=pt(-16+k*3.8,Math.max(2,hip-12)+(k%2)*2);p.cut(p.leaf(q[0],q[1],Math.PI/2+(k-2.5)*.18,9,3.6),k%2?col2:col,{sh:0,rough:.2})}},
  wings:(col='rgba(236,246,250,.9)',vein='rgba(120,140,160,.6)')=>(p,G)=>{const {pt,sh,t,f,s}=G,fl=G.portrait?0:Math.sin(t*9)*.06,b=pt(-6,sh-1);
    for(const [a,l,w] of[[-1.2,34,11],[-.55,27,9],[-1.9,20,7]]){const ang=-Math.PI/2+(a-fl)*f,L=p.leaf(b[0],b[1],ang,l,w);p.cut(L,col,{sh:0,rough:.1,alpha:.85});p.line([b,[b[0]+Math.cos(ang)*l*.85*s,b[1]+Math.sin(ang)*l*.85*s]],vein,.7);p.line([...L,L[0]],vein,.6,.7)}},
  mothWings:(col,spot)=>(p,G)=>{const {pt,sh,t,f,s}=G,fl=G.portrait?0:Math.sin(t*2.2)*.05,b=pt(-4,sh-3);
    for(const [a,l,w,sp] of[[-1.15,26,13,1],[-.2,16,9,0]]){const ang=-Math.PI/2+(a-fl)*f,L=p.leaf(b[0],b[1],ang,l,w);p.cut(L,col,{sh:0,rough:.3,alpha:.95});if(sp){const c=[b[0]+Math.cos(ang)*l*.6*s,b[1]+Math.sin(ang)*l*.6*s];p.flat(p.ell(c[0],c[1],3.4,3.4,12),spot);p.flat(p.ell(c[0],c[1],1.6,1.6,10),'#2E3561')}}},
  backpack:(col,roll)=>(p,G)=>{const {pt,sh,hip}=G;p.cut([pt(-16,sh+3),pt(-5,sh+4),pt(-4,hip),pt(-17,hip+1)],col,{rough:.3});p.cut([pt(-16,sh+3),pt(-5,sh+4),pt(-5,sh-5),pt(-16,sh-6)],shade(col,.85),{rough:.2});
    if(roll){const r=pt(-11,sh+7);p.cut(p.ell(r[0],r[1],9,3.6,16),roll,{rough:.2});p.line([pt(-15,sh+7),pt(-15,sh+4)],shade(roll,.7),1,.7)}},
  tank:(col='#C9A05C')=>(p,G)=>{const {pt,sh,hip}=G;p.cut([pt(-15,sh+5),pt(-7,sh+6),pt(-6,hip+2),pt(-8,hip-1),pt(-14,hip-1),pt(-16,hip+2)],col,{rough:.1});const v=pt(-11,sh+7);p.line([v,[v[0],v[1]-3*G.s]],'#6A4A2A',2)},
  rolls:(col='#8A5A3A')=>(p,G)=>{const {pt,sh,hip}=G;for(const [dx,h,c] of[[-15,10,'#F3E6C4'],[-11,13,'#EFDDB6'],[-7,9,'#F7EDD4']]){p.cut([pt(dx-2,sh-4),pt(dx+2,sh-4),pt(dx+2,sh+h-4),pt(dx-2,sh+h-4)],c,{rough:.1});p.flat(p.ell(...pt(dx,sh+h-4),2,1,8),'#B8484A',.8)}
    p.cut([pt(-17,sh+2),pt(-5,sh+3),pt(-5,hip),pt(-16,hip+1)],col,{rough:.2})},
  antenna:(col='#5E6B7A')=>(p,G)=>{BACK2.backpack(col)(p,G);const {pt,sh,t}=G,a=pt(-13,sh+4),e=pt(-19,sh+38);p.line([a,e],'#3A3A48',1);p.flat(p.ell(e[0],e[1],1.8,1.8,8),G.portrait||Math.sin(t*4)>0?'#E0584A':'#6A3A3A')},
  tails:(col)=>(p,G)=>{const {pt,hip}=G;p.cut([pt(-8,hip+2),pt(-1,hip+2),pt(-5,hip-13),pt(-12,hip-10)],col,{rough:.3})},
  cloud:(col='#FBF8F2')=>(p,G)=>{const {pt,sh,hip,t}=G,w=G.portrait?0:Math.sin(t*1.3);for(const [dx,dz,r] of[[-12,sh+2,7],[-17,sh-6,8],[-13,hip+6,8],[-19,hip-2,6],[-8,hip,6]])p.cut(p.ell(...pt(dx,dz+w*(dx%3)),r,r*.85,16),col,{rough:.5})},
  quiverPaper:(p,G)=>{BACK2.cape('#FBF4E3','#EFDDB6',4)(p,G);const {pt,sh,hip,t}=G;for(let k=0;k<4;k++)p.line([pt(-15+k*1.5,hip+10-k*4),pt(-7+k*1.5,hip+11-k*4)],'#8A93A6',.6,.7);if(!G.portrait)for(let k=0;k<3;k++){const u=(t*.25+k/3)%1,a=pt(-20-u*18,hip+2+Math.sin(u*6+k)*6+u*10);p.cut([a,[a[0]+6*G.s,a[1]-1*G.s],[a[0]+7*G.s,a[1]+6*G.s],[a[0]+1*G.s,a[1]+7*G.s]],'#FBF4E3',{sh:0,rough:.2,alpha:1-u*.6})}},
  ember:(p,G)=>{BACK2.cape('#8C3A2A','#E0584A',2)(p,G);const {pt,hip,sh,t,s}=G;if(!G.portrait)for(let k=0;k<5;k++){const u=(t*.5+k/5)%1,q=pt(-14+k*2,hip+u*30);p.flat(p.ell(q[0],q[1],1.4,1.4,6),'#F5A83A',1-u)}},
  stars:(col,lin)=>(p,G)=>{BACK2.cape(col,lin)(p,G);const {pt,sh,hip}=G;for(const [a,b] of[[-8,hip-2],[-13,hip+4],[-5,hip+8],[-11,sh-6],[-3,hip-5],[-15,hip-4]])p.text('✦',...pt(a,b),5,'#F6D98A')},
  combCape:(col='#E4A844')=>(p,G)=>{BACK2.cape(col,'#C47A2C',2)(p,G);const {pt,sh,hip,s}=G;for(const [a,b] of[[-9,hip+2],[-14,hip+6],[-4,hip+6],[-9,hip+10],[-13,hip-2],[-5,hip-2],[-10,sh-4]])p.line([...hexPts(pt(a,b),2.6,s),hexPts(pt(a,b),2.6,s)[0]],'#FFF1C4',.8,.8)},
  seaweed:(p,G)=>{const {pt,sh,t,f}=G;for(let k=0;k<5;k++){const w=G.portrait?0:Math.sin(t*1.7+k)*.12,a=pt(-5-k*2.6,sh+2);p.cut(p.leaf(a[0],a[1],Math.PI/2+(.35+k*.12+w)*f,30-k*2,3.2),k%2?'#3F7F5F':'#6F8D5E',{sh:0,rough:.4})}}
};
/* ── estampados y detalles sobre el torso ── */
const TORSO={
  buttons:(col='#E4A844',n=3)=>(p,G)=>{const {pt,sh,hip}=G;for(let k=0;k<n;k++)p.flat(p.ell(...pt(G.tx(6),sh-4-k*(sh-hip-4)/n),1.2,1.2,8),col)},
  stripes:(col,n=4,a=.85)=>(p,G)=>{const T=TORSO_POLY(G),{pt,sh,hip}=G;p.clip(T,()=>{for(let k=0;k<n;k++){const z=sh-3-k*(sh-hip)/n;p.flat([pt(-14,z),pt(16,z),pt(16,z-2),pt(-14,z-2)],col,a)}})},
  hex:(col,a=.6)=>(p,G)=>{const T=TORSO_POLY(G),{pt,sh,hip,s}=G;p.clip(T,()=>{for(let r=0;r<4;r++)for(let c=-3;c<4;c++){const q=pt(c*4.6+(r%2)*2.3,sh-2-r*4.2),H=hexPts(q,2.2,s);p.line([...H,H[0]],col,.7,a)}})},
  vest:(col)=>(p,G)=>{const {pt,sh,hip,tx}=G;p.cut([pt(tx(2),sh-.5),pt(tx(8.5),sh-.5),pt(tx(10),hip-1),pt(tx(3),hip-1)],col,{rough:.2});p.cut([pt(tx(-7),sh-.5),pt(tx(-2),sh-.5),pt(tx(-3),hip-1),pt(tx(-8),hip-1)],shade(col,.85),{rough:.2})},
  sash:(col)=>(p,G)=>{const T=TORSO_POLY(G),{pt,sh,hip}=G;p.clip(T,()=>p.flat([pt(-10,sh-1),pt(-4,sh+1),pt(12,hip+1),pt(8,hip-4)],col))},
  chain:(col='#E4A844')=>(p,G)=>{const {pt,hip,s}=G,a=pt(2,hip+7),b=pt(9,hip+5);p.line([a,pt(5,hip+3),b],col,.8);p.cut(p.ell(b[0],b[1],2,2,10),col,{sh:0,rough:0})},
  patches:(cols)=>(p,G)=>{const {pt,sh,hip}=G;[[-4,sh-9],[5,hip+4]].forEach(([dx,dz],i)=>{const c=cols[i%cols.length],Q=[pt(dx-2.4,dz+2.4),pt(dx+2.4,dz+2.4),pt(dx+2.4,dz-2.4),pt(dx-2.4,dz-2.4)];p.flat(Q,c);p.line([...Q,Q[0]],'#FBF4E3',.5,.7)})},
  pocket:(col,tool)=>(p,G)=>{const {pt,hip}=G;p.flat([pt(3,hip-3),pt(9,hip-3),pt(9,hip-8),pt(3,hip-8)],shade(col,.85));if(tool)p.line([pt(5,hip-4),pt(4,hip+4)],tool,1.3)},
  zipper:(col='#C9D0D8')=>(p,G)=>{const {pt,sh,hip}=G;p.line([pt(G.tx(4),sh-1),pt(G.tx(4.5),hip-2)],col,.9);p.flat(p.ell(...pt(G.tx(4.4),sh-5),1,1.6,8),col)},
  stars:(col='#F6D98A')=>(p,G)=>{const {pt,sh,hip}=G;for(const [a,b] of[[-3,sh-6],[5,sh-10],[1,hip+4],[7,hip+1]])p.text('✦',...pt(a,b),4,col)},
  splat:(cols)=>(p,G)=>{const {pt,sh,hip}=G;[[4,sh-7,2],[-2,hip+6,1.6],[7,hip+2,1.3],[0,sh-3,1.2]].forEach(([a,b,r],i)=>p.flat(p.ell(...pt(a,b),r,r*.8,8,i),cols[i%cols.length],.85))},
  tags:(p,G)=>{const {pt,sh,hip,s}=G;for(const [a,b,c] of[[-3,sh-5,'#F3E6C4'],[6,hip+6,'#FBF4E3'],[1,hip-1,'#EFD9A8']]){const q=pt(a,b);p.line([[q[0],q[1]-3*s],q],'#8A6A3A',.5);p.flat([[q[0]-1.8*s,q[1]],[q[0]+1.8*s,q[1]],[q[0]+1.8*s,q[1]+4*s],[q[0]-1.8*s,q[1]+4*s]],c)}},
  aurora:(p,G)=>{const T=TORSO_POLY(G),{pt,sh,hip}=G;p.clip(T,()=>{[['#8FD3C4',sh-4],['#F4AFA6',sh-9],['#C9B8F0',hip+3]].forEach(([c,z])=>p.flat([pt(-14,z),pt(16,z+2),pt(16,z-3),pt(-14,z-5)],c,.8))})},
  checks:(col)=>(p,G)=>{const T=TORSO_POLY(G),{pt,sh,hip}=G;p.clip(T,()=>{for(let k=-3;k<4;k++)p.flat([pt(k*5,sh+2),pt(k*5+2.4,sh+2),pt(k*5+2.4,hip-3),pt(k*5,hip-3)],col,.35);for(let z=hip;z<sh;z+=5)p.flat([pt(-14,z),pt(16,z),pt(16,z+2.4),pt(-14,z+2.4)],col,.35)})}
};
/* ── objetos en la mano ── */
const HOLD2={
  sprout:(p,G,h)=>{const s=G.s,f=G.f,c=[h[0]+1*f*s,h[1]+2*s];p.cut([[c[0]-6*s,c[1]-1*s],[c[0]+6*s,c[1]-1*s],[c[0]+4.5*s,c[1]+8*s],[c[0]-4.5*s,c[1]+8*s]],C.terra,{rough:.2});p.flat([[c[0]-6.5*s,c[1]-1*s],[c[0]+6.5*s,c[1]-1*s],[c[0]+6.5*s,c[1]+1.4*s],[c[0]-6.5*s,c[1]+1.4*s]],C.terraD);
    const b=[c[0],c[1]-1*s],w=G.portrait?0:Math.sin(G.t*2)*.08;p.line([b,[b[0],b[1]-9*s]],C.sageDD,1.3);p.cut(p.leaf(b[0],b[1]-8*s,-Math.PI/2-.9+w,9,3.4),C.sage,{sh:0,rough:.1});p.cut(p.leaf(b[0],b[1]-9*s,-Math.PI/2+.8+w,10,3.8),C.sageD,{sh:0,rough:.1})},
  sunflower:(p,G,h)=>{const s=G.s,f=G.f,top=[h[0]+3*f*s,h[1]-26*s];p.line([[h[0],h[1]+6*s],top],C.sageDD,1.6);p.cut(p.leaf(h[0]+1*f*s,h[1]-10*s,-Math.PI/2+.9*f,9,3.4),C.sageD,{sh:0,rough:.1});
    for(let k=0;k<12;k++){const a=k/12*TAU+(G.portrait?0:G.t*.2);p.cut(p.leaf(top[0],top[1],a,9,2.6),k%2?'#F5CE55':'#E9B830',{sh:0,rough:0})}p.cut(p.ell(top[0],top[1],4.4,4.4,14),'#7A4A2A',{sh:0,rough:.1})},
  lifebuoy:(p,G,h)=>{const s=G.s,c=[h[0]+2*G.f*s,h[1]+4*s];for(let k=0;k<8;k++){const a0=k/8*TAU,a1=(k+1)/8*TAU,Q=[];for(let j=0;j<=4;j++){const a=a0+(a1-a0)*j/4;Q.push([c[0]+Math.cos(a)*10*s,c[1]+Math.sin(a)*10*s])}for(let j=4;j>=0;j--){const a=a0+(a1-a0)*j/4;Q.push([c[0]+Math.cos(a)*5*s,c[1]+Math.sin(a)*5*s])}p.flat(Q,k%2?'#FBF4E3':'#E0584A')}},
  roller:(p,G,h)=>{const s=G.s,f=G.f;p.line([h,[h[0]+7*f*s,h[1]+9*s]],'#8A5A34',2);const c=[h[0]+9*f*s,h[1]+12*s];p.cut([[c[0]-6*s,c[1]-3*s],[c[0]+6*s,c[1]-3*s],[c[0]+6*s,c[1]+3*s],[c[0]-6*s,c[1]+3*s]],'#3A4660',{rough:.1});p.flat(p.ell(c[0]-6*s,c[1],1.4,3,8),'#2A3048')},
  maple:(p,G,h)=>{const s=G.s,f=G.f,c=[h[0]+4*f*s,h[1]-12*s];p.line([h,c],'#8A4A2A',1.2);const Q=[];for(let k=0;k<10;k++){const a=-Math.PI/2+k/10*TAU,r=k%2?5:13;Q.push([c[0]+Math.cos(a)*r*s,c[1]+Math.sin(a)*r*s])}p.cut(Q,'#E07A4E',{rough:.4});p.line([c,[c[0],c[1]-10*s]],'#A5523A',.7)},
  yarn:(p,G,h)=>{const s=G.s,f=G.f,c=[h[0]+2*f*s,h[1]+3*s];p.cut(p.ell(c[0],c[1],7,6.5,18),C.petalD,{rough:.3});for(let k=0;k<4;k++)p.line([[c[0]-6*s,c[1]-3*s+k*2.5*s],[c[0]+6*s,c[1]-5*s+k*3*s]],shade(C.petalD,.8),.6,.8);
    p.line([[c[0]-4*s,c[1]-10*s],[c[0]+6*s,c[1]+8*s]],'#B58A5A',1.2);p.line([[c[0]+5*s,c[1]-10*s],[c[0]-3*s,c[1]+8*s]],'#B58A5A',1.2)},
  mug:(p,G,h)=>{const s=G.s,f=G.f,c=[h[0]+3*f*s,h[1]];p.cut([[c[0]-4.5*s,c[1]-5*s],[c[0]+4.5*s,c[1]-5*s],[c[0]+4*s,c[1]+5*s],[c[0]-4*s,c[1]+5*s]],'#E07A4E',{rough:.1});p.line([[c[0]+4.5*f*s,c[1]-3*s],[c[0]+8*f*s,c[1]-1*s],[c[0]+4.5*f*s,c[1]+2*s]],'#E07A4E',1.2);p.flat(p.ell(c[0],c[1]-5*s,4,1.2,10),'#7A4A2A');
    if(!G.portrait)for(let k=0;k<2;k++){const u=(G.t*.5+k/2)%1;p.line([[c[0]+(-1+k*2)*s,c[1]-7*s-u*10*s],[c[0]+(1+k*2+Math.sin(G.t*3+k)*1.5)*s,c[1]-10*s-u*10*s]],'#FFFFFF',1,.6*(1-u))}},
  moonLamp:(p,G,h)=>{const s=G.s,f=G.f,c=[h[0]+3*f*s,h[1]+10*s];p.line([h,[c[0],c[1]-7*s]],'#6A4226',1);p.cut(p.ell(c[0],c[1],7,7,20),'#F6E7B0',{sh:0,rough:0});p.flat(p.ell(c[0]+4*f*s,c[1]-2*s,6,6,20),'#2E3561');
    if(!G.portrait){p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(c[0],c[1],18,18,18),'rgba(207,227,255,.16)');p.g.restore()}},
  compass:(p,G,h)=>{const s=G.s,c=[h[0]+2*G.f*s,h[1]-1*s];p.cut(p.ell(c[0],c[1],5.4,5.4,16),'#C9A05C',{sh:0,rough:0});p.flat(p.ell(c[0],c[1],4,4,14),'#FBF4E3');p.flat([[c[0],c[1]-3.4*s],[c[0]+1*s,c[1]],[c[0],c[1]+3.4*s],[c[0]-1*s,c[1]]],'#B8484A')},
  jar:(glow)=>(p,G,h)=>{const s=G.s,c=[h[0]+2*G.f*s,h[1]+3*s];p.cut([[c[0]-5*s,c[1]-6*s],[c[0]+5*s,c[1]-6*s],[c[0]+6*s,c[1]+5*s],[c[0]-6*s,c[1]+5*s]],'rgba(236,246,250,.85)',{sh:0,rough:.1});p.flat(p.ell(c[0],c[1],4.2,4.2,14),glow,.9);p.flat([[c[0]-4*s,c[1]-8*s],[c[0]+4*s,c[1]-8*s],[c[0]+4*s,c[1]-6*s],[c[0]-4*s,c[1]-6*s]],'#8A5A3A');
    if(!G.portrait){p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(c[0],c[1],15,15,16),glow,.18+.05*Math.sin(G.t*3));p.g.restore()}},
  honey:(p,G,h)=>{HOLD2.jar('#F0B040')(p,G,h)},
  notepad:(p,G,h)=>{const s=G.s,f=G.f;p.cut([[h[0]-3*s,h[1]-8*s],[h[0]+7*f*s,h[1]-8*s],[h[0]+7*f*s,h[1]+5*s],[h[0]-3*s,h[1]+5*s]],'#FBF4E3',{rough:.1});for(let k=0;k<3;k++)p.line([[h[0]-1*s,h[1]-5*s+k*3*s],[h[0]+5*f*s,h[1]-5*s+k*3*s]],'#8FA9B6',.6)},
  comb:(p,G,h)=>{const s=G.s,f=G.f,c=[h[0]+4*f*s,h[1]-4*s];p.cut([[c[0]-8*s,c[1]-9*s],[c[0]+8*s,c[1]-9*s],[c[0]+8*s,c[1]+9*s],[c[0]-8*s,c[1]+9*s]],'#B8783A',{rough:.1});p.flat([[c[0]-6*s,c[1]-7*s],[c[0]+6*s,c[1]-7*s],[c[0]+6*s,c[1]+7*s],[c[0]-6*s,c[1]+7*s]],'#F0B040');
    p.clip([[c[0]-6*s,c[1]-7*s],[c[0]+6*s,c[1]-7*s],[c[0]+6*s,c[1]+7*s],[c[0]-6*s,c[1]+7*s]],()=>{for(let r=-2;r<=2;r++)for(let q=-2;q<=2;q++){const H=hexPts([c[0]+q*4.2*s+(r%2)*2.1*s,c[1]+r*3.6*s],2.2,s);p.line([...H,H[0]],'#C47A2C',.6)}})},
  dipper:(p,G,h)=>{const s=G.s,f=G.f,e=[h[0]+5*f*s,h[1]-16*s];p.line([[h[0],h[1]+4*s],e],'#B8783A',1.6);for(let k=0;k<3;k++)p.cut(p.ell(e[0],e[1]-k*2.2*s,3.4-k*.4,1.6,10),'#D9974A',{sh:0,rough:0});
    const u=G.portrait?.5:(G.t*.8)%1;p.flat(p.ell(e[0],e[1]+3*s+u*8*s,1.2,1.8,8),'#F0B040',1-u)},
  keys:(p,G,h)=>{const s=G.s,c=[h[0]+1*G.f*s,h[1]+5*s],E=p.ell(c[0],c[1],4,4,14);p.line([...E,E[0]],'#C9A05C',1);for(const [a,l] of[[.5,9],[1.3,8],[2.1,10]]){const e=[c[0]+Math.cos(a)*l*s,c[1]+Math.sin(a)*l*s];p.line([[c[0]+Math.cos(a)*4*s,c[1]+Math.sin(a)*4*s],e],'#C9A05C',1.2);p.flat(p.ell(e[0],e[1],1.6,1.6,8),'#C9A05C')}},
  openBook:(p,G,h)=>{const s=G.s,c=[h[0]+2*G.f*s,h[1]-2*s];p.cut([[c[0],c[1]+3*s],[c[0]-9*s,c[1]-1*s],[c[0]-9*s,c[1]-9*s],[c[0],c[1]-5*s]],'#FBF4E3',{rough:.1});p.cut([[c[0],c[1]+3*s],[c[0]+9*s,c[1]-1*s],[c[0]+9*s,c[1]-9*s],[c[0],c[1]-5*s]],'#F3E6C4',{rough:.1});
    for(let k=0;k<3;k++){p.line([[c[0]-7*s,c[1]-6*s+k*2*s],[c[0]-2*s,c[1]-4*s+k*2*s]],'#8A6A4A',.5);p.line([[c[0]+2*s,c[1]-4*s+k*2*s],[c[0]+7*s,c[1]-6*s+k*2*s]],'#8A6A4A',.5)}},
  pie:(p,G,h)=>{const s=G.s,c=[h[0]+3*G.f*s,h[1]-1*s];p.cut(p.ell(c[0],c[1]+2*s,10,4,18),'#C9A05C',{rough:.1});p.cut(p.ell(c[0],c[1],9,3.4,18),'#E4A844',{sh:0,rough:.2});for(let k=-1;k<=1;k++)p.line([[c[0]+k*4*s-2*s,c[1]-1*s],[c[0]+k*4*s+2*s,c[1]+1*s]],'#B8783A',.7);
    if(!G.portrait)for(let k=0;k<3;k++){const u=(G.t*.45+k/3)%1;p.line([[c[0]+(k*4-4)*s,c[1]-4*s-u*12*s],[c[0]+(k*4-4+Math.sin(G.t*3+k)*1.6)*s,c[1]-8*s-u*12*s]],'#FFFFFF',1.1,.55*(1-u))}},
  clock:(p,G,h)=>{const s=G.s,c=[h[0]+3*G.f*s,h[1]-4*s];p.cut(p.ell(c[0],c[1],8,8,22),'#C9A05C',{rough:.1});p.flat(p.ell(c[0],c[1],6.4,6.4,20),'#FBF4E3');for(let k=0;k<12;k++){const a=k/12*TAU;p.flat(p.ell(c[0]+Math.cos(a)*5.2*s,c[1]+Math.sin(a)*5.2*s,.5,.5,6),'#6A4A30')}
    p.line([c,[c[0]+Math.cos(-Math.PI/2)*4.4*s,c[1]-4.4*s]],'#3A2A20',.9);p.line([c,[c[0]-3*s,c[1]+.6*s]],'#3A2A20',1.1);const r=[c[0],c[1]-8*s];p.cut(p.ell(r[0],r[1]-1.5*s,2,2,8),'#C9A05C',{sh:0,rough:0})},
  hourglass:(p,G,h)=>{const s=G.s,c=[h[0]+3*G.f*s,h[1]-4*s];for(const d of[-1,1])p.flat([[c[0]-6*s,c[1]+d*9*s],[c[0]+6*s,c[1]+d*9*s],[c[0]+6*s,c[1]+d*7.6*s],[c[0]-6*s,c[1]+d*7.6*s]],'#8A5A34');
    p.flat([[c[0]-5*s,c[1]-7.6*s],[c[0]+5*s,c[1]-7.6*s],[c[0]+.8*s,c[1]],[c[0]+5*s,c[1]+7.6*s],[c[0]-5*s,c[1]+7.6*s],[c[0]-.8*s,c[1]]],'rgba(220,239,246,.8)');const u=G.portrait?.5:(G.t*.1)%1;
    p.flat([[c[0]-4*s*(1-u),c[1]-7*s+7*s*u],[c[0]+4*s*(1-u),c[1]-7*s+7*s*u],[c[0],c[1]]],'#E4A844');p.flat([[c[0]-5*s*u,c[1]+7.6*s],[c[0]+5*s*u,c[1]+7.6*s],[c[0],c[1]+7.6*s-5*s*u]],'#E4A844');p.line([[c[0],c[1]],[c[0],c[1]+7*s]],'#E4A844',.5)},
  control:(p,G,h)=>{const s=G.s,f=G.f,t=G.t,c=[h[0]+2*f*s,h[1]-3*s];p.line([[c[0]-8*s,c[1]],[c[0]+8*s,c[1]]],'#8A5A34',1.8);p.line([[c[0],c[1]-4*s],[c[0],c[1]+5*s]],'#8A5A34',1.8);
    const w=G.portrait?0:Math.sin(t*2.2),pp=[c[0]+(6+w*2)*f*s,c[1]+30*s];for(const a of[-8,8,0])p.line([[c[0]+a*s,c[1]],[pp[0]+a*.4*s,pp[1]-8*s]],'rgba(60,40,30,.5)',.4);
    p.cut(p.ell(pp[0],pp[1]-10*s,3.4,3.4,12),'#F0C8A8',{sh:0,rough:.1});p.cut([[pp[0]-3.4*s,pp[1]-7*s],[pp[0]+3.4*s,pp[1]-7*s],[pp[0]+4.4*s,pp[1]+2*s],[pp[0]-4.4*s,pp[1]+2*s]],'#B8484A',{sh:0,rough:.1});
    for(const d of[-1.6,1.6])p.line([[pp[0]+d*s,pp[1]+2*s],[pp[0]+(d+w*d*.8)*s,pp[1]+8*s]],'#2A2230',1.4)},
  masks:(p,G,h)=>{const s=G.s,f=G.f;p.line([h,[h[0]+6*f*s,h[1]-10*s]],'#8A5A34',1.4);const c=[h[0]+10*f*s,h[1]-16*s];
    for(const [dx,col,hap] of[[-4,'#FBF4E3',1],[4,'#F5CE55',0]]){const q=[c[0]+dx*f*s,c[1]+(hap?0:3)*s];p.cut(p.ell(q[0],q[1],5.4,6.4,16),col,{sh:0,rough:.1});for(const ex of[-2,2])p.flat(p.ell(q[0]+ex*s,q[1]-1.4*s,1.1,.8,8),'#2A2230');
      p.line(hap?[[q[0]-2.4*s,q[1]+2*s],[q[0],q[1]+3.4*s],[q[0]+2.4*s,q[1]+2*s]]:[[q[0]-2.4*s,q[1]+3.4*s],[q[0],q[1]+2*s],[q[0]+2.4*s,q[1]+3.4*s]],'#2A2230',.8)}},
  punch:(p,G,h)=>{const s=G.s,f=G.f;p.line([h,[h[0]+8*f*s,h[1]-6*s]],'#8A93A6',2);p.line([[h[0],h[1]+1*s],[h[0]+8*f*s,h[1]-3*s]],'#8A93A6',2);p.cut([[h[0]+8*f*s,h[1]-12*s],[h[0]+16*f*s,h[1]-12*s],[h[0]+16*f*s,h[1]-4*s],[h[0]+8*f*s,h[1]-4*s]],'#F3E0B0',{sh:0,rough:.1});p.flat(p.ell(h[0]+12*f*s,h[1]-8*s,1,1,6),'#2A305C')},
  rope:(p,G,h)=>{const s=G.s,c=[h[0]+2*G.f*s,h[1]+4*s];for(let k=0;k<3;k++){const E=p.ell(c[0],c[1]+k*.8*s,8-k*1.6,4.4-k*.6,18);p.line([...E,E[0]],'#C9A05C',1.6)}p.line([[c[0]+6*s,c[1]+3*s],[c[0]+9*s,c[1]+14*s]],'#C9A05C',1.4)},
  candles:(p,G,h)=>{const s=G.s,f=G.f;[[-3,14],[1,18],[5,12]].forEach(([dx,l],i)=>{const c=[h[0]+dx*f*s,h[1]+4*s];p.cut([[c[0]-1.6*s,c[1]],[c[0]+1.6*s,c[1]],[c[0]+1.6*s,c[1]-l*s],[c[0]-1.6*s,c[1]-l*s]],i%2?'#FBF4E3':'#F3E0B0',{rough:.1});
    const fl=G.portrait?0:Math.sin(G.t*11+i)*.5;p.flat([[c[0]-1.3*s,c[1]-l*s],[c[0]+fl*s,c[1]-(l+6)*s],[c[0]+1.3*s,c[1]-l*s]],'#F5A83A')});p.line([[h[0]-5*s,h[1]+1*s],[h[0]+7*s,h[1]+1*s]],'#B8484A',1.2);
    if(!G.portrait){p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(h[0],h[1]-16*s,16,14,16),'rgba(255,190,90,.14)');p.g.restore()}},
  crystal:(col)=>(p,G,h)=>{const s=G.s,f=G.f,c=[h[0]+2*f*s,h[1]-6*s],Q=[[c[0],c[1]-10*s],[c[0]+5*s,c[1]-3*s],[c[0]+4*s,c[1]+5*s],[c[0]-4*s,c[1]+5*s],[c[0]-5*s,c[1]-3*s]];p.cut(Q,col,{sh:0,rough:0});p.flat([Q[0],Q[1],[c[0],c[1]+1*s],Q[4]],'#FFFFFF',.3);
    if(!G.portrait){p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(c[0],c[1],15,15,16),col,.18+.08*Math.sin(G.t*2.6));p.g.restore()}},
  tongs:(p,G,h)=>{const s=G.s,f=G.f,e=[h[0]+16*f*s,h[1]-6*s];p.line([[h[0],h[1]],e],'#5A5A66',1.4);p.line([[h[0],h[1]+2*s],[e[0],e[1]+3*s]],'#5A5A66',1.4);
    const k=[e[0]+3*f*s,e[1]+1*s];p.line([[k[0],k[1]],[k[0]+8*f*s,k[1]]],'#F5A83A',2);p.cut(p.ell(k[0],k[1],3,3,12),'#F5A83A',{sh:0,rough:0});p.flat(p.ell(k[0],k[1],1.2,1.2,8),'#FFE8A0');for(const d of[5,7.4])p.line([[k[0]+d*f*s,k[1]],[k[0]+d*f*s,k[1]+2.4*s]],'#F5A83A',1.2);
    if(!G.portrait){p.g.save();p.g.globalCompositeOperation='lighter';p.flat(p.ell(k[0]+3*s,k[1],13,10,16),'rgba(255,150,60,.2)');p.g.restore()}},
  flag:(col)=>(p,G,h)=>{const s=G.s,f=G.f,t=G.t,top=[h[0]+6*f*s,h[1]-46*s];p.line([[h[0]-1*f*s,h[1]+12*s],top],'#8A5A34',1.6);const w=G.portrait?0:Math.sin(t*4)*1.6;p.cut([top,[top[0]+15*f*s,top[1]+(4+w)*s],[top[0],top[1]+9*s]],col,{sh:0,rough:.1});p.flat(p.ell(top[0],top[1],1.4,1.4,8),'#E4A844')},
  kite:(col)=>(p,G,h)=>{const s=G.s,f=G.f,t=G.t,w=G.portrait?0:Math.sin(t*1.6)*3,k=[h[0]+14*f*s,h[1]-40*s+w*s];p.line([h,[h[0]+8*f*s,h[1]-20*s],[k[0],k[1]+8*s]],'rgba(60,40,30,.5)',.5);
    p.cut([[k[0],k[1]-9*s],[k[0]+6*s,k[1]],[k[0],k[1]+8*s],[k[0]-6*s,k[1]]],col,{sh:0,rough:.1});p.line([[k[0],k[1]-9*s],[k[0],k[1]+8*s]],'#FBF4E3',.6);p.line([[k[0],k[1]+8*s],[k[0]-4*s,k[1]+14*s],[k[0]+1*s,k[1]+19*s]],'#B8484A',.8)},
  duster:(p,G,h)=>{const s=G.s,f=G.f,e=[h[0]+3*f*s,h[1]-14*s];p.line([[h[0],h[1]+4*s],e],'#8A5A34',1.6);for(let k=0;k<9;k++){const a=-Math.PI/2+(k-4)*.24*f;p.cut(p.leaf(e[0],e[1],a,17,4.2),['#E07F7F','#F4AFA6','#8FA9B6','#F5CE55'][k%4],{sh:0,rough:.2})}},
  letters:(p,G,h)=>{const s=G.s,f=G.f;[0,1,2].forEach(i=>{const c=[h[0]+(2+i)*f*s,h[1]-2*s-i*3*s],Q=[[c[0]-7*s,c[1]-4*s],[c[0]+7*s,c[1]-4*s],[c[0]+7*s,c[1]+4*s],[c[0]-7*s,c[1]+4*s]];p.cut(Q,i%2?'#F3E6C4':'#FBF4E3',{rough:.1,dy:1});p.line([Q[0],[c[0],c[1]+1*s],Q[1]],'#C9A05C',.5)});
    const w=[h[0]+4*f*s,h[1]-6*s];p.flat(p.ell(w[0],w[1]+1*s,1.6,1.6,8),'#B8484A')},
  frame:(p,G,h)=>{const s=G.s,f=G.f,c=[h[0]+4*f*s,h[1]-8*s],o=(w,hh)=>[[c[0]-w*s,c[1]-hh*s],[c[0]+w*s,c[1]-hh*s],[c[0]+w*s,c[1]+hh*s],[c[0]-w*s,c[1]+hh*s]];p.cut(o(10,13),'#D9A551',{rough:.2});p.flat(o(7.5,10.5),'#F7EEDA');p.line([...o(10,13),o(10,13)[0]],'#B8783A',.8);for(const [a,b] of[[-10,-13],[10,-13],[10,13],[-10,13]])p.flat(p.ell(c[0]+a*s,c[1]+b*s,1.6,1.6,8),'#F3C872')},
  brush:(p,G,h)=>{const s=G.s,f=G.f,e=[h[0]+6*f*s,h[1]-22*s];p.line([[h[0],h[1]+6*s],e],'#B8783A',1.8);p.cut([[e[0]-2*s,e[1]+1*s],[e[0]+2*s,e[1]+1*s],[e[0]+1.4*s,e[1]-6*s],[e[0]-1.4*s,e[1]-6*s]],'#C9D0D8',{sh:0,rough:0});p.cut([[e[0]-2*s,e[1]-6*s],[e[0]+2*s,e[1]-6*s],[e[0],e[1]-13*s]],'#3E8FA0',{sh:0,rough:.1})},
  trowel:(p,G,h)=>{const s=G.s,f=G.f;p.line([[h[0]-2*f*s,h[1]+3*s],[h[0]+3*f*s,h[1]-2*s]],'#8A5A34',2.2);p.cut([[h[0]+3*f*s,h[1]-2*s],[h[0]+14*f*s,h[1]-8*s],[h[0]+8*f*s,h[1]+4*s]],'#A8B0B8',{sh:0,rough:0})},
  helmet:(p,G,h)=>{const s=G.s,c=[h[0]+1*G.f*s,h[1]+1*s];p.cut(p.ell(c[0],c[1],10,10,24),'#C9A05C',{rough:.1});const fp=[c[0]+4*G.f*s,c[1]];p.cut(p.ell(fp[0],fp[1],5,5,16),'#8A6A3A',{sh:0,rough:0});p.flat(p.ell(fp[0],fp[1],3.6,3.6,14),'#23404C');p.flat(p.ell(fp[0]-1.2*s,fp[1]-1.2*s,1.2,.9,8),'#FFFFFF',.7)},
  shell:(p,G,h)=>{const s=G.s,c=[h[0]+3*G.f*s,h[1]-3*s],Q=[];for(let k=0;k<=12;k++){const a=Math.PI+k/12*Math.PI,r=k%2?7.4:8;Q.push([c[0]+Math.cos(a)*r*s,c[1]+Math.sin(a)*r*s*.85])}Q.push([c[0]+2*s,c[1]+3*s],[c[0]-2*s,c[1]+3*s]);p.cut(Q,'#F4AFA6',{sh:0,rough:.1});for(let k=1;k<6;k++){const a=Math.PI+k/6*Math.PI;p.line([[c[0],c[1]+2*s],[c[0]+Math.cos(a)*7*s,c[1]+Math.sin(a)*6*s]],'#E07F7F',.6)}},
  bee:(p,G,h)=>{HOLD.up;const s=G.s,t=G.t,f=G.f,c=[h[0]+(8+(G.portrait?0:Math.sin(t*3)*3))*f*s,h[1]-12*s+(G.portrait?0:Math.sin(t*5))*2*s];for(const sg of[-1,1])p.flat(p.ell(c[0]+sg*1.5*s,c[1]-3*s,2.4,1.6,8,sg*.5),'#FFFFFF',.8);
    p.cut(p.ell(c[0],c[1],3.6,2.6,12),'#F5CE55',{sh:0,rough:0});p.line([[c[0]-.8*s,c[1]-2.2*s],[c[0]-.8*s,c[1]+2.2*s]],'#3A2A20',.9);p.line([[c[0]+1.3*s,c[1]-2*s],[c[0]+1.3*s,c[1]+2*s]],'#3A2A20',.9)},
  staff:(col='#8A5A34')=>(p,G,h)=>{const s=G.s;p.line([[h[0],h[1]-18*s],[h[0]+1*s,h[1]+30*s]],col,2);p.cut(p.ell(h[0],h[1]-19*s,2.6,2.6,10),shade(col,.8),{sh:0,rough:.1})},
  sunJar:(p,G,h)=>HOLD2.jar('#F5CE55')(p,G,h),
  lantern2:(glow)=>(p,G,h)=>{HOLD.lantern(glow)(p,G,h);const s=G.s,l=[h[0]+2*G.f*s,h[1]+9*s];p.cut([[l[0]-3*s,l[1]-9*s],[l[0]+3*s,l[1]-9*s],[l[0]+5*s,l[1]-6*s],[l[0]-5*s,l[1]-6*s]],'#C9A05C',{sh:0,rough:0})}
};
/* combinar varias cosas en la mano */
const hold2=(...fs)=>(p,G,h)=>{for(const fn of fs)fn(p,G,h)};
