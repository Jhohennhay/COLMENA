/* ══════════ SISTEMAS · mochila, cuaderno, amistad, logros, pistas, tren, foto ══════════ */
const QF=()=>PROG.F;
const LJ=a=>a.map(x=>_t(x)).join(LANG==='zh'?'、':', ');
const NPCN={pri:'Brote',ver:'Solano',oto:'Ocre',inv:'Escarcha',esp:'Orión',oce:'Coral',des:'Duna',ant:'Témpano',col:'Abril',bib:'Tomo',coc:'Miel',rel:'Péndulo',inn:'Luna',tea:'Telón',tre:'Estela',far:'Albor',sot:'Vela',cue:'Geoda',vol:'Ceniza',cum:'Nube',dsv:'Trasto',est:'Pluma',ret:'Marco',jar:'Rocío',cor:'Amaranta'};
const CLUSTER={3:['bib','coc','col','rel'],4:['inn','far','tre','tea'],5:['cum','cue','sot','vol'],6:['dsv','est','ret','jar']};
const SEAL_CELL={3:'rel',4:'tea',5:'vol',6:'jar'};
const clusterOf=id=>{for(const n in CLUSTER)if(CLUSTER[n].includes(id))return+n;return 0};
const sealOn=n=>n===1?!!QF().done:n===2?!!QF().star:!!QF()['s'+n];
const sealCount=()=>[1,2,3,4,5,6].filter(sealOn).length;
const mDone=id=>!!(QF().ok&&QF().ok[id]);
const mStep=id=>(QF().m&&QF().m[id])||0;
const setStep=(id,v)=>{const F=QF();F.m=F.m||{};F.m[id]=v};

/* ── objetos nuevos ── */
Object.assign(ITEM_NAME,{receta:'la tarjeta de receta',miel:'un tarro de miel',menta:'una ramita de menta',mieltibia:'miel tibia',polen2:'polen de luna',luzfaro:'luz del faro',
  billete:'un billete de vuelta',billete2:'un billete para Solano',cristal:'un cristal que late',cera:'cera de sellar',llave:'la llave del corazón',sombrero:'el sombrero con velo',
  libro:'el libro sin título',cartaT:'la carta para Témpano',cartaL:'la carta para Telón',cartaC:'la carta para Coral',sopa:'sopa caliente',boceto:'un boceto de Marco',brasa:'una brasa de la forja',vidrio:'vidrio para el faro'});
Object.assign(ITEM_GLOW,{miel:'#F0B040',mieltibia:'#F5A83A',polen2:'#CFE3FF',luzfaro:'#FFF1B0',cristal:'#8FD3C4',brasa:'#F5A83A',vidrio:'#DCEFF6',sopa:'#E4A844'});
const ITEM_SHORT={agua:'Agua',hielo:'Hielo',sol:'Sol',lente:'Lente',perla:'Perla',aurora:'Aurora',receta:'Receta',miel:'Tarro de miel',menta:'Menta',mieltibia:'Miel tibia',polen2:'Polen',luzfaro:'Luz del faro',
  billete:'Billete',billete2:'Billete',cristal:'Cristal',cera:'Cera',llave:'Llave',sombrero:'Sombrero',libro:'Libro',cartaT:'Carta',cartaL:'Carta',cartaC:'Carta',sopa:'Sopa',boceto:'Boceto',brasa:'Brasa',vidrio:'Vidrio'};
/* dibujo de los objetos nuevos, con el mismo papel que el resto */
function itemArt(p,x,y,z,kind,t,small){const s=p.s,k=small?.75:1,q=p.P(x,y,z),S=v=>v*k*s;
  if(!small){const g=p.P(x,y,0);p.flat(p.ell(g[0],g[1],11,4),'rgba(70,40,15,.2)')}
  const jar=(fill,lid='#8A5A3A')=>{p.cut([[q[0]-S(8),q[1]-S(7)],[q[0]+S(8),q[1]-S(7)],[q[0]+S(9),q[1]+S(10)],[q[0]-S(9),q[1]+S(10)]],'rgba(240,248,250,.9)',{rough:.2,dy:2});p.flat([[q[0]-S(7),q[1]-S(1)],[q[0]+S(7),q[1]-S(1)],[q[0]+S(8),q[1]+S(9)],[q[0]-S(8),q[1]+S(9)]],fill);p.cut([[q[0]-S(9),q[1]-S(7)],[q[0]+S(9),q[1]-S(7)],[q[0]+S(9),q[1]-S(11)],[q[0]-S(9),q[1]-S(11)]],lid,{sh:0,rough:.2})};
  const card=(bg,glyph,gc='#8A5A3A',rot=-.12)=>{const c=Math.cos(rot),sn=Math.sin(rot),R=(a,b)=>[q[0]+(a*c-b*sn)*k*s,q[1]+(a*sn+b*c)*k*s];p.cut([R(-11,-8),R(11,-8),R(11,8),R(-11,8)],bg,{rough:.2,dy:2});p.text(glyph,q[0],q[1]+S(.5),11*k,gc,{w:600})};
  const key=col=>{p.cut(p.ell(q[0]-S(6),q[1],5*k,5*k,16),col,{rough:.1,dy:2});p.flat(p.ell(q[0]-S(6),q[1],2*k,2*k,10),'#FBF4E3');p.cut([[q[0]-S(2),q[1]-S(1.6)],[q[0]+S(11),q[1]-S(1.6)],[q[0]+S(11),q[1]+S(1.6)],[q[0]-S(2),q[1]+S(1.6)]],col,{sh:0,rough:0});for(const d of[6,9.5])p.flat([[q[0]+S(d),q[1]],[q[0]+S(d+1.8),q[1]],[q[0]+S(d+1.8),q[1]+S(4.5)],[q[0]+S(d),q[1]+S(4.5)]],col)};
  const gem=col=>{const Q=[[q[0],q[1]-S(12)],[q[0]+S(7),q[1]-S(3)],[q[0]+S(5),q[1]+S(8)],[q[0]-S(5),q[1]+S(8)],[q[0]-S(7),q[1]-S(3)]];p.cut(Q,col,{rough:0,dy:2});p.flat([Q[0],Q[1],[q[0],q[1]],Q[4]],'#FFFFFF',.3)};
  switch(kind){
    case'miel':jar('#F0B040');break;case'mieltibia':jar('#F5A83A');if(!STILL)for(let m=0;m<2;m++){const u=(t*.6+m/2)%1;p.line([[q[0]+S(-2+m*4),q[1]-S(12)-u*S(8)],[q[0]+S(-1+m*4+Math.sin(t*3+m)),q[1]-S(15)-u*S(8)]],'#FFFFFF',1,.6*(1-u))}break;
    case'polen2':jar('#CFE3FF','#6A74B0');for(const [a,b] of[[-3,3],[3,5],[0,0]])p.flat(p.ell(q[0]+S(a),q[1]+S(b),1.4*k,1.4*k,8),'#FFF6D8');break;
    case'luzfaro':jar('#FFF1B0','#2E3A52');break;case'sopa':p.cut(p.ell(q[0],q[1]+S(3),10*k,6*k,20),'#E07A4E',{rough:.2,dy:2});p.flat(p.ell(q[0],q[1],9*k,3*k,18),'#E4A844');break;
    case'receta':card('#FBF4E3','✎');break;case'billete':card('#F3E0B0','◉','#2A305C');break;case'billete2':card('#F3E0B0','☀','#E0A93A');break;
    case'cartaT':case'cartaL':case'cartaC':card('#FBF4E3','✉','#B8484A',.1);break;case'boceto':card('#FBF4E3','✐','#3E8FA0');break;
    case'libro':p.cut([[q[0]-S(9),q[1]-S(11)],[q[0]+S(9),q[1]-S(11)],[q[0]+S(9),q[1]+S(11)],[q[0]-S(9),q[1]+S(11)]],'#E4A844',{rough:.2,dy:2});p.flat(hexPts(q,4*k,s),'#C47A2C');break;
    case'llave':key('#E4A844');break;case'cristal':gem('#8FD3C4');break;case'vidrio':gem('#DCEFF6');break;
    case'cera':p.cut(hexPts(q,10*k,s,Math.PI/6),'#E4A844',{rough:.3,dy:2});p.flat(hexPts(q,5*k,s,Math.PI/6),'#F3C872');break;
    case'brasa':p.cut(p.ell(q[0],q[1],8*k,7*k,16),'#B8484A',{rough:.4,dy:2});p.flat(p.ell(q[0],q[1],4.5*k,4*k,12),'#F5A83A');break;
    case'menta':for(const a of[-.6,0,.6])p.cut(p.leaf(q[0],q[1]+S(8),-Math.PI/2+a,15*k,5*k),a?C.sage:C.sageD,{rough:.2,dy:1});break;
    case'sombrero':{const b=[q[0],q[1]+S(3)];p.cut(p.ell(b[0],b[1],14*k,5*k,20),'#F4EFE2',{rough:.3,dy:2});p.cut([[b[0]-S(7),b[1]],[b[0]+S(7),b[1]],[b[0]+S(5),b[1]-S(9)],[b[0]-S(5),b[1]-S(9)]],'#FBF8F0',{sh:0,rough:.2});p.flat([[b[0]-S(13),b[1]+S(2)],[b[0]+S(13),b[1]+S(2)],[b[0]+S(11),b[1]+S(12)],[b[0]-S(11),b[1]+S(12)]],'rgba(250,246,236,.5)');break}
    default:return false}
  return true}
{const tk0=STYLE.token;STYLE.token=(p,x,y,z,kind,t,small)=>{if(itemArt(p,x,y,z,kind,t,small))return;tk0(p,x,y,z,kind,t,small)}}

/* ── la mochila en pantalla: tres huecos ── */
const bagEl=document.getElementById('bagslots'),bagN=document.getElementById('bagn');let lastBag='x';
updHand=function(){const rl=Object.keys(QF().relic||{}),key=PROG.bag.join(',')+'|'+rl.join(',')+'|'+LANG;if(key===lastBag)return;lastBag=key;const hEl=document.getElementById('hand');if(!PROG.bag.length&&!rl.length){hEl.hidden=true;return}hEl.hidden=false;bagN.textContent=PROG.bag.length+'/'+BAGMAX;bagEl.innerHTML='';
  for(const it of PROG.bag){const sp=document.createElement('span'),c=document.createElement('canvas'),w=Math.round(40*DPR);c.width=c.height=w;const g=c.getContext('2d');STYLE.token(STYLE.Pen(g,w/2,w*.62,DPR*1.25,'mano',true),0,0,0,it,1,true);
    const i=document.createElement('i');i.textContent=_t(ITEM_SHORT[it]||ITEM_NAME[it]||it);sp.title=_t(ITEM_NAME[it]||it);sp.appendChild(c);sp.appendChild(i);bagEl.appendChild(sp)}
  for(const it of rl){const sp=document.createElement('span');sp.className='relic';const c=document.createElement('canvas'),w=Math.round(30*DPR);c.width=c.height=w;STYLE.token(STYLE.Pen(c.getContext('2d'),w/2,w*.62,DPR*.95,'rel',true),0,0,0,it,1,true);sp.title=_t(ITEM_NAME[it]);sp.appendChild(c);bagEl.appendChild(sp)}
  if(PROG.bag.length>=BAGMAX)achieve('bag');updHead()};

/* ── diálogos con elecciones y diálogos lanzados por el juego ── */
const dchEl=document.getElementById('dch');
function sayNPC(lines,ex,o={}){const n=CELLS[cur].npc;closeTalk();DLG={lines,ex:ex||['smile'],forced:true,...o};talking=true;lineIx=0;typeT=0;dchEl.hidden=true;
  dn.textContent=_t(STYLE.dlgName(n));dl.textContent=_t(lines[0]);dm.textContent=_t(STYLE.dlgHint());dlg.hidden=false;talkBtn.hidden=true;STYLE.portrait(ptC,n,DLG.ex[0]);if(DLG.choices&&lines.length===1)showChoices()}
function showChoices(){const D=DLG;dchEl.innerHTML='';dchEl.hidden=false;D.choices.forEach((c,i)=>{const b=document.createElement('button');b.textContent=(i+1)+'. '+_t(c[0]);
  b.addEventListener('click',e=>{e.stopPropagation();dchEl.hidden=true;D.choices=null;closeTalk();setTimeout(()=>c[1](),120)});dchEl.appendChild(b)});setTimeout(()=>{const f=dchEl.querySelector('button');if(f&&!COARSE)f.focus({preventScroll:true})},60)}
{const talk0=talk;talk=function(){if(talking&&DLG&&DLG.choices&&!dchEl.hidden)return;talk0();if(talking&&DLG&&DLG.choices&&lineIx===DLG.lines.length-1)showChoices();else dchEl.hidden=true}}
addEventListener('keydown',e=>{if(!dchEl.hidden&&/^[1-4]$/.test(e.key)){const b=dchEl.querySelectorAll('button')[+e.key-1];if(b){e.preventDefault();b.click()}}});
{const ct0=closeTalk;closeTalk=function(){dchEl.hidden=true;ct0()}}

/* ── amistad: tres hexágonos por vecino ── */
function friend(id,lv){const F=QF();F.fr=F.fr||{};if((F.fr[id]||0)>=lv)return false;F.fr[id]=lv;if(lv===3){note(`${NPCN[id]} · amistad completa. Marco pintará su retrato.`);Sound.sfx('seal',.4);
    const n=Object.values(F.fr).filter(v=>v>=3).length;if(n>=10)achieve('gallery');if(n>=24)achieve('friends')}return true}
const frOf=id=>(QF().fr&&QF().fr[id])||0;

/* ── logros (listos para Steam) ── */
const ACH=[['s1','Primer sello','Haz florecer el cerezo de Brote'],['s2','Segundo sello','Devuelve la estrella perdida'],['s3','La casa en hora','Enciende el tercer sello'],['s4','Fin de la función','Enciende el cuarto sello'],
  ['s5','La forja arde','Enciende el quinto sello'],['s6','Un nombre para el árbol','Enciende el sexto sello'],['pages','Todas las páginas','Encuentra las siete páginas del cuaderno'],['glyphs','Lectura de cera','Encuentra los seis símbolos'],
  ['bag','Mochila llena','Lleva tres cosas a la vez'],['look','Sin mirar','Abre las tres flores de Luna'],['stars','Mano de estrellas','Pica las cinco estrellas del tren sin fallar'],['travel','Billete de ida y vuelta','Viaja en el tren nocturno desde el mapa'],
  ['photo','Foto de recuerdo','Guarda una foto en el modo foto'],['sides','Todos los favores','Completa las ocho misiones secundarias'],['gallery','Diez retratos','Completa la amistad con diez vecinos'],['friends','Vecindario','Completa la amistad con los veinticuatro vecinos'],
  ['endA','El tren de vuelta','Llega a un final'],['endB','Nuevo guardián','Llega a un final'],['endC','La colmena entera','Llega al final completo']];
const achEl=document.getElementById('achv'),achN=document.getElementById('achn');let achQ=[],achBusy=false;
function achieve(id){if(FREE)return;const F=QF();F.ach=F.ach||{};if(F.ach[id])return;const a=ACH.find(x=>x[0]===id);if(!a)return;F.ach[id]=Date.now();save();try{if(window.STEAM&&window.STEAM.activate)window.STEAM.activate(id)}catch(e){}achQ.push(a[1]);achRun()}
function achRun(){if(achBusy||!achQ.length)return;achBusy=true;achN.textContent=_t(achQ.shift());achEl.hidden=false;achEl.style.animation='none';void achEl.offsetWidth;achEl.style.animation='';Sound.sfx('card');setTimeout(()=>{achEl.hidden=true;achBusy=false;achRun()},4300)}

/* ── cuaderno con pestañas: páginas, vecinos, retratos, logros ── */
const BOOK=document.getElementById('book');
function bookTab(t){for(const b of BOOK.querySelectorAll('.btabs button'))b.setAttribute('aria-selected',b.dataset.tab===t);for(const d of BOOK.querySelectorAll('[data-pane]'))d.hidden=d.dataset.pane!==t;
  if(t==='nb')fillNeighbors();if(t==='gal')fillGallery();if(t==='ach')fillAch()}
for(const b of BOOK.querySelectorAll('.btabs button'))b.addEventListener('click',()=>bookTab(b.dataset.tab));
{const ob0=openBook;openBook=function(tab){ob0();bookTab(typeof tab==='string'?tab:'enc')}}
{const bb=document.getElementById('bbook'),nb=bb.cloneNode(true);bb.replaceWith(nb);nb.addEventListener('click',()=>openBook('pages'))}
function miniPortrait(c,id,w,h,dim){c.width=Math.round(w*DPR);c.height=Math.round(h*DPR);const g=c.getContext('2d'),n=CELLS[id].npc;g.fillStyle=dim?'#CDBB98':'#EAD8B0';g.fillRect(0,0,c.width,c.height);
  if(dim){g.fillStyle='#A08A66';g.font=`600 ${Math.round(h*.5*DPR)}px Fraunces,Georgia,serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('?',c.width/2,c.height/2);return}
  const pf=n.pf||[.5,20,1.5,1],k=w/88;try{n.draw(Pen(g,c.width*pf[0],c.height+pf[1]*DPR*k*(h/77)/(w/88),pf[2]*DPR*k,'mini'+id,false,true),0,0,pf[3],1.3,'smile',true)}catch(e){}}
function fillNeighbors(){const box=document.getElementById('bnb');box.innerHTML='';const F=QF();
  for(const id of ORDER){const met=!!(F.fr&&F.fr[id])||(F.met&&F.met[id]),st=QSTAT(id),row=document.createElement('div');row.className='nbr'+(met?'':' unk')+(st.done?' done':st.ask?' q':'');
    const c=document.createElement('canvas');miniPortrait(c,id,52,46,!met);row.appendChild(c);
    const tx=document.createElement('div'),b=document.createElement('b');b.textContent=met?_t(NPCN[id]):'???';const sm=document.createElement('small');sm.textContent=_t(SEASON[id].name);const s2=document.createElement('small');s2.className='st';s2.textContent=met?_t(st.text):_t('Todavía no se conocen.');tx.append(b,sm,s2);row.appendChild(tx);
    const fr=document.createElement('span');fr.className='frh';fr.setAttribute('aria-label',_t('Amistad')+' '+frOf(id)+'/3');for(let k=0;k<3;k++){const h=document.createElement('span');h.textContent='⬢';if(k>=frOf(id))h.className='o';fr.appendChild(h)}if(id!=='cor')row.appendChild(fr);box.appendChild(row)}}
function fillGallery(){const box=document.getElementById('bgal');box.innerHTML='';let n=0;for(const id of ORDER){if(id==='cor')continue;const ok=frOf(id)>=3;if(ok)n++;const f=document.createElement('figure');f.className=ok?'':'no';const c=document.createElement('canvas');miniPortrait(c,id,84,100,false);
    const cap=document.createElement('figcaption');cap.textContent=ok?_t(NPCN[id]):'—';f.append(c,cap);box.appendChild(f)}
  if(QF().portrait){const f=document.createElement('figure'),c=document.createElement('canvas');miniPortrait(c,'cor',84,100,false);const cap=document.createElement('figcaption');cap.textContent='Amaranta';f.append(c,cap);box.prepend(f)}
  document.getElementById('bgalk').textContent=_t(`Marco pinta a cada vecino cuando completas su amistad · ${n}/24`)}
function fillAch(){const box=document.getElementById('bach'),F=QF();box.innerHTML='';let n=0;for(const [id,t,d] of ACH){const ok=!!(F.ach&&F.ach[id]);if(ok)n++;const r=document.createElement('div');if(!ok)r.className='no';r.innerHTML='<span class="hx">⬢</span>';const tx=document.createElement('span'),b=document.createElement('b');b.textContent=_t(t);const sm=document.createElement('small');sm.textContent=_t(d);tx.append(b,sm);r.appendChild(tx);box.appendChild(r)}
  document.getElementById('bachk').textContent=_t(`Logros: ${n}/${ACH.length}`)}

/* ── celdas dormidas y despiertas: sin color hasta que ayudas a quien vive allí ── */
const AWAKE={pri:()=>!!QF().bloom,ver:()=>!!QF().gotSun,oto:()=>!!QF().inkFixed,inv:()=>!!QF().tookIce,esp:()=>!!QF().star,oce:()=>!!QF().gotPearl,des:()=>!!QF().gotLens,ant:()=>!!QF().gotAurora,cor:()=>!!QF().ending};
const isAwake=id=>FREE||inTitle||(AWAKE[id]?AWAKE[id]():mDone(id));
function desat(c,a=.42){if(!c||!c.width)return;const t=newCanvas(c.width,c.height),g=t.getContext('2d');g.filter=`saturate(${a}) brightness(.96)`;g.drawImage(c,0,0);const h=c.getContext('2d');h.clearRect(0,0,c.width,c.height);h.drawImage(t,0,0)}
{const bc0=bakeCell;bakeCell=function(id){bc0(id);const B=BAKED[id];B.awake=isAwake(id);if(!B.awake){desat(B.base.c);desat(B.lip.c);for(const o of B.spr)desat(o.c);for(const o of B.extras)if(!o.blend)desat(o.c)}}}
{const bd0=bakeDark;bakeDark=function(id){bd0(id);const D=DARK[id];if(D&&isSeen(id)&&!PUZ.cellLocked(id)&&!isAwake(id))desat(D.c,.35)}}
const AWK={};
function wakeCheck(){for(const id of ORDER){const a=isAwake(id);if(AWK[id]===undefined){AWK[id]=a;continue}if(a&&!AWK[id]){AWK[id]=a;wakeCell(id)}else AWK[id]=a}}
function wakeCell(id){delete DARK[id];delete SNAP[id];if(BAKED[id]){delete BAKED[id];if(id===cur||CELLS[cur].doors.some(d=>d.to===id))bakeCell(id)}
  if(id===cur){WAKE={t0:T,id};Sound.sfx('seal',.5);for(let k=0;k<26;k++)PETALS.push({x:rd(Math.random,-250,250),y:rd(Math.random,-200,200),z:rd(Math.random,60,160),vx:rd(Math.random,-20,20),vz:rd(Math.random,-30,-10),t0:T,c:[C.petal,C.butter,C.sage,'#FFF4D6'][k%4],r:rd(Math.random,0,TAU)})}}
let WAKE=null;const PETALS=[];

/* ── pistas en tres niveles: la narradora, el vecino y una flecha de papel ── */
let HLV={key:'',n:0},HARROW=null;
function goalCell(g){if(QGOAL.cell)return QGOAL.cell;for(const id of ORDER){if(g.includes(SEASON[id].name)||g.includes(NPCN[id]))return id}return null}
{const hb=document.getElementById('hintb'),nb=hb.cloneNode(true);hb.replaceWith(nb);nb.addEventListener('click',()=>{setMenu(false);hintPress()})}
function hintPress(){const g=PUZ.goal(),cell=goalCell(g);if(HLV.key!==g){HLV={key:g,n:0}}HLV.n=HLV.n%3+1;
  if(HLV.n===1){note(g);const h=NARR.hint();narrClear();if(h)narrate([h[1]])}
  else if(HLV.n===2){const t=QHINT()||NARR.hint()&&NARR.hint()[1];if(t){narrClear();narrate([t])}note(_t('Segunda pista')+' · '+_t(g))}
  else{if(cell&&cell!==cur){HARROW={cell,until:T+30};note(`Sigue la flecha de papel hacia ${SEASON[cell].name}`)}else{HARROW={cell:cur,until:T+12};note('Es aquí mismo: busca lo que brilla.')}}}
function drawArrow(s){if(!HARROW||T>HARROW.until||inTitle||crossing)return;const id=HARROW.cell,px=camX+(CW[cur][0]+Pl.x)*s,py=oyOf(cur,s)+(Pl.y*K-60)*s;
  const g=ctx,tx=camX+CW[id][0]*s,ty=oyOf(id,s)-40*s;let a=Math.atan2(ty-py,tx-px),d=Math.hypot(tx-px,ty-py);const pulse=1+.08*Math.sin(T*5);
  g.save();g.globalAlpha=Math.min(1,(HARROW.until-T)/2);
  if(id===cur){const n=CELLS[cur].npc,q=[camX+(CW[cur][0]+n.x)*s,oyOf(cur,s)+(n.y*K-(n.lz??80)-30)*s];g.translate(q[0],q[1]+Math.sin(T*4)*5*s);g.rotate(Math.PI/2)}
  else{const r=Math.min(90*s,d*.4);g.translate(px+Math.cos(a)*r,py+Math.sin(a)*r);g.rotate(a)}
  g.scale(pulse,pulse);const u=s;g.fillStyle='#FFFDF6';g.strokeStyle='#C4B292';g.lineWidth=2*u;g.beginPath();g.moveTo(26*u,0);g.lineTo(4*u,-15*u);g.lineTo(4*u,-7*u);g.lineTo(-20*u,-7*u);g.lineTo(-20*u,7*u);g.lineTo(4*u,7*u);g.lineTo(4*u,15*u);g.closePath();g.fill();g.stroke();
  g.fillStyle='#E4A844';g.beginPath();g.moveTo(21*u,0);g.lineTo(7*u,-9*u);g.lineTo(7*u,-3.5*u);g.lineTo(-15*u,-3.5*u);g.lineTo(-15*u,3.5*u);g.lineTo(7*u,3.5*u);g.lineTo(7*u,9*u);g.closePath();g.fill();g.restore();
  if(id!==cur){const E=[tx,oyOf(id,s)];g.save();g.globalAlpha=.55+.3*Math.sin(T*4);g.strokeStyle='#FFD36A';g.lineWidth=4*s;g.beginPath();g.ellipse(E[0],E[1],(R+30)*s,(R+30)*K*s,0,0,TAU);g.stroke();g.restore()}}

/* ── viaje rápido en el tren nocturno ── */
const travelEl=document.getElementById('travel'),travelT=document.getElementById('travelt');let travelTo=null;
const canTravel=()=>!FREE&&!!QF().s4;
function travelOffer(id){if(!canTravel()||id===cur||PUZ.cellLocked(id)||!isSeen(id)){travelEl.hidden=true;travelTo=null;return false}travelTo=id;travelT.textContent=_t(`🚂 Viajar en el tren nocturno a ${SEASON[id].name}`);travelEl.hidden=false;return true}
travelEl.addEventListener('click',()=>{if(travelTo)trainTravel(travelTo)});
const fadeEl=document.createElement('div');fadeEl.className='qfade';document.getElementById('stage').appendChild(fadeEl);
function trainTravel(id){travelEl.hidden=true;travelTo=null;Sound.sfx('whistle');fadeEl.classList.add('on');
  setTimeout(()=>{narrClear();closeTalk();crossing=null;Pl.route=null;cur=id;const n=CELLS[id].npc;Pl.x=clamp(n.x+(n.tx??45)+30,-200,200);Pl.y=clamp(n.y+(n.ty??40)+40,-180,200);
    for(const k in BAKED)if(k!==id)delete BAKED[k];bakeCell(id);STYLE.tag(CELLS[id]);seenMark(id);for(const k of ORDER)FOCUS[k]=k===id?1:0;if(mapMode)toggleMap();camReady=false;save();updGoal();achieve('travel');
    setTimeout(()=>fadeEl.classList.remove('on'),250)},520)}
{const ot0=onTap;onTap=function(sx,sy){if(mapMode&&canTravel()&&!crossing&&!inTitle){const s=S*Z*ZK*DPR,wx=(sx-camX)/s,wy=(sy-camY)/s/K;for(const id of ORDER){if(inHex(wx-CW[id][0],wy-CW[id][1]+LIFT/K*FOCUS[id],R+TH)){if(travelOffer(id))return}}}travelEl.hidden=true;ot0(sx,sy)}}

/* ── modo foto ── */
const photoEl=document.getElementById('photo');let photoOn=false;
function photoMode(on){photoOn=on;document.body.classList.toggle('photomode',on);photoEl.hidden=!on;setMenu(false);if(!on)cv.style.filter='';if(on){closeTalk();narrClear()}}
document.getElementById('bphoto').addEventListener('click',()=>photoMode(true));document.getElementById('phexit').addEventListener('click',()=>photoMode(false));
const PHF={none:'',sepia:'sepia(.55) contrast(1.05)',noche:'brightness(.72) saturate(.8) hue-rotate(200deg) contrast(1.1)',sueno:'saturate(1.25) brightness(1.06) contrast(.92) blur(.4px)'};
for(const b of photoEl.querySelectorAll('[data-f]'))b.addEventListener('click',()=>{for(const q of photoEl.querySelectorAll('[data-f]'))q.setAttribute('aria-pressed',q===b);cv.style.filter=PHF[b.dataset.f]});
document.getElementById('phsave').addEventListener('click',()=>{try{const c=newCanvas(cv.width,cv.height),g=c.getContext('2d');g.filter=cv.style.filter||'none';g.drawImage(document.getElementById('bg'),0,0,cv.width,cv.height);g.drawImage(cv,0,0);
  achieve('photo');const fail=()=>note('Aquí no se puede guardar la foto. Haz una captura de pantalla.');
  const plain=()=>{const a=document.createElement('a');a.download='colmena-foto.png';a.href=c.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();note('Foto guardada')};
  /* dentro del visor de Claude la descarga pasa por su permiso; como archivo suelto, un enlace normal */
  if(window.claude&&window.claude.use){c.toBlob(async b=>{try{const dl=await window.claude.use('downloads');if(!dl){fail();return}await dl.save({filename:'colmena-foto.png',data:b});note('Foto guardada')}catch(e){if(!e||e.code!=='declined')fail()}},'image/png')}else plain()}catch(e){fail()}});
addEventListener('keydown',e=>{if((e.key==='p'||e.key==='P')&&!inTitle&&!talking&&MGEL.hidden)photoMode(!photoOn);if(e.key==='Escape'&&photoOn)photoMode(false)});

/* ── fin de partida ── */
const endEl=document.getElementById('ending');
function showEnding(k,title,lines,after){endEl.hidden=false;document.getElementById('endk').textContent=_t(k);document.getElementById('endt').textContent=_t(title);const x=document.getElementById('endx');x.innerHTML='';
  lines.forEach((l,i)=>{const p=document.createElement('p');p.textContent=_t(l);p.style.animationDelay=(1+i*1.6)+'s';if(l.startsWith('—'))p.className='cr';x.appendChild(p)});
  const b=document.getElementById('endb');b.onclick=()=>{endEl.hidden=true;if(after)after()};setTimeout(()=>b.focus({preventScroll:true}),400)}
