/* ══════════ DISTRIBUCIÓN 2: UNA COLMENA CON MENOS IDAS Y VUELTAS ══════════
   · Atajos (definidos en layout.js) que se abren al terminar la misión de cualquiera de sus dos cuartos.
   · El Corazón se abre como plaza central desde el segundo sello: Amaranta sigue dormida en su capullo
     hasta los seis sellos, y allí está el tablón con los encargos de toda la colmena.
   · Carteles de puerta visibles desde más lejos, con ★ si allí está tu objetivo.
   · En el mapa, cada barrio muestra cuántos de sus cuartos ya ayudaste. */
(()=>{
const keyOf=(a,b)=>[a,b].sort().join('-');
const AT=new Set((typeof ATAJOS!=='undefined'?ATAJOS:[]).map(([a,b])=>keyOf(a,b)));
const atOpen=(a,b)=>FREE||(typeof mDone==='function'&&(mDone(a)||mDone(b)));
const nm=id=>_t((SEASON[id]&&SEASON[id].name)||id);
{const o0=PUZ.open.bind(PUZ),w0=PUZ.why.bind(PUZ);
  PUZ.open=(a,b)=>{if(AT.has(keyOf(a,b))&&!atOpen(a,b))return false;return o0(a,b)};
  PUZ.why=(a,b)=>{const k=keyOf(a,b);if(AT.has(k)&&o0(a,b)&&!atOpen(a,b))return _t('Un atajo. Se abre cuando ayudes a {a} o a {b}.').replace('{a}',_t(NPCN[a]||a)).replace('{b}',_t(NPCN[b]||b));return w0(a,b)}}
/* avisos: atajo abierto · el témpano ya no hace falta girarlo */
setInterval(()=>{if(inTitle||FREE)return;const F=PROG.F;if(F.done&&!F.floe)F.floe=1;F.atajos=F.atajos||{};
  for(const k of AT){const [a,b]=k.split('-');if(!F.atajos[k]&&atOpen(a,b)&&PUZ.open(a,b)){F.atajos[k]=1;save();const msg=_t('Se abrió un atajo entre {a} y {b}').replace('{a}',nm(a)).replace('{b}',nm(b));if(window.CELEB)CELEB({kind:'atajo',icon:'↔',k:_t('Nuevo atajo'),t:msg});else{Sound.sfx('thunk');note(msg)}try{stateChanged()}catch(e){}}}},1000);

/* ── el tablón de encargos en el Corazón ── */
(PUZ.things.cor=PUZ.things.cor||[]).push({id:'tablon',x:-170,y:70,z:40,r:80,ax:-120,ay:110,label:()=>'Leer el tablón de encargos',show:()=>!FREE});
{const a0=act;act=function(t){if(t&&t.id==='tablon'){Sound.sfx('page');openBook('enc');return}return a0(t)}}

/* ── carteles de puerta: más lejos y con ★ hacia tu objetivo ── */
STYLE.doorLabel=function(p,d,tg,a,open){
  let goal=false;try{PUZ.goal();goal=open&&QGOAL.cell===tg.id}catch(e){}
  const s=p.s,SE=SEASON[tg.id],q=d.back?p.W(wallPt(d.e,.5,112)):(()=>{const L=TH+80;return p.P(d.mid[0]-d.n[0]*L,d.mid[1]-d.n[1]*L,66)})();
  const g=p.g;g.save();g.globalAlpha=a;g.font=`600 ${Math.round(13*s)}px Fraunces, 'Noto Serif', 'Noto Serif SC', Georgia, serif`;const t=_t((open?'Hacia ':'Cerrado · ')+SE.name)+(window.VIAL?VIAL(tg.id):'')+(goal?'  ★':''),w=g.measureText(t).width/2+12*s;g.restore();
  g.save();g.globalAlpha=a;p.flat([[q[0]-w,q[1]-11*s],[q[0]+w,q[1]-11*s],[q[0]+w,q[1]+11*s],[q[0]-w,q[1]+11*s]],goal?'#F6D58A':open?C.cream:'#E9DCC6');p.text(t,q[0],q[1]+.5*s,13,C.ink);g.restore()};

/* ── el progreso de cada barrio en el mapa ── */
const BARRIO={sea:'Las estaciones',ofi:'La casa de Amaranta',dre:'Los sueños',mem:'La memoria',rai:'Las raíces y los confines',aba:'La colmena de abajo'};
const doneOf=id=>{try{return!!QSTAT(id).done}catch(e){return false}};
let layer=null;const tags={};
function mapTags(){const show=!!(typeof mapMode!=='undefined'&&mapMode&&!inTitle&&window.R3D&&R3D.on);
  if(!layer){layer=document.createElement('div');layer.id='barrios';layer.setAttribute('aria-hidden','true');layer.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:2';document.getElementById('stage').appendChild(layer);
    const st=document.createElement('style');st.textContent='.barrio{position:absolute;transform:translate(-50%,-50%);padding:5px 12px;border-radius:14px;background:rgba(251,244,227,.92);box-shadow:0 2px 6px rgba(60,30,10,.3);font:600 13px Fraunces,Georgia,serif;color:#4A3222;white-space:nowrap}.barrio b{color:#A5452A;font-weight:600;margin-left:6px}.barrio.full b{color:#4E7A3A}';document.head.appendChild(st)}
  layer.hidden=!show;if(!show)return;const dpr=window.DPR||1,placed=[];
  for(const g in BARRIO){const ids=ORDER.filter(id=>GRUPO[id]===g&&!(window.CHIDE&&CHIDE(id)));if(!ids.length){if(tags[g])tags[g].hidden=true;continue}
    let x=0,z=0,y=-1e9;for(const id of ids){x+=CW[id][0];z+=CW[id][1];y=Math.max(y,R3D.lift(id))}x/=ids.length;z/=ids.length;
    let q=null;try{q=R3D.projW(x,y+260,z)}catch(e){}if(!q||!Number.isFinite(q[0])){if(tags[g])tags[g].hidden=true;continue}
    let el=tags[g];if(!el){el=tags[g]=document.createElement('div');el.className='barrio';layer.appendChild(el)}
    const n=ids.filter(doneOf).length,txt=_t(BARRIO[g])+'|'+n+'/'+ids.length;if(el.dataset.t!==txt){el.dataset.t=txt;el.innerHTML='';el.append(document.createTextNode(_t(BARRIO[g])));const b=document.createElement('b');b.textContent=n+'/'+ids.length;el.append(b);el.classList.toggle('full',n===ids.length)}
    el.hidden=false;let X=q[0]/dpr,Y=q[1]/dpr;const w=(el.offsetWidth||140)+8,h=(el.offsetHeight||26)+6;
    for(let k=0;k<6;k++){const hit=placed.find(r=>Math.abs(r[0]-X)<(r[2]+w)/2&&Math.abs(r[1]-Y)<h);if(!hit)break;Y=hit[1]+(Y>=hit[1]?h:-h)}
    placed.push([X,Y,w]);el.style.left=X+'px';el.style.top=Y+'px'}}
if(window.R3DX)R3DX.push(()=>mapTags());

TPLadd('Un atajo. Se abre cuando ayudes a {a} o a {b}.','A shortcut. It opens when you help {a} or {b}.','Короткий путь. Он откроется, когда ты поможешь {a} или {b}.','一条近路。帮助{a}或{b}后就会打开。');
TPLadd('Se abrió un atajo entre {a} y {b}','A shortcut opened between {a} and {b}','Открылся короткий путь между {a} и {b}','{a}和{b}之间的近路打开了');
I18N([["Leer el tablón de encargos","Read the errands board","Прочитать доску поручений","查看委托告示板"],
["(Amaranta duerme dentro de un capullo de cera que late despacio.)","(Amaranta sleeps inside a wax cocoon that beats slowly.)","(Амаранта спит в восковом коконе, который медленно бьётся.)","（阿玛兰塔睡在一个缓缓跳动的蜡茧里。）"],
["(En la pared hay un tablón con los encargos de toda la colmena.)","(On the wall there's a board with errands from the whole hive.)","(На стене висит доска с поручениями со всего улья.)","（墙上有一块告示板，写着整个蜂巢的委托。）"],
["Coge una ramita de menta en el Colmenar","Pick a sprig of mint in the Apiary","Сорви веточку мяты на Пасеке","去蜂场摘一枝薄荷"],
["Dicen que en la Antártida el cielo se enciende de colores. Se llega desde el Desierto o el Océano.","They say the sky lights up in colours in Antarctica. You get there from the Desert or the Ocean.","Говорят, в Антарктиде небо загорается разными цветами. Туда можно попасть из Пустыни или из Океана.","听说南极的天空会亮起彩色的光。从沙漠或海洋都能到那里。"],
["Las estaciones","The seasons","Времена года","四季"],["La casa de Amaranta","Amaranta's house","Дом Амаранты","阿玛兰塔的家"],["Los sueños","Dreams","Сны","梦境"],["La memoria","Memory","Память","记忆"],
["Las raíces y los confines","The roots and the far reaches","Корни и окраины","根部与边境"],["La colmena de abajo","The hive below","Нижний улей","下面的蜂巢"]]);
TPLadd('(Faltan {n} sellos para que se abra.)','({n} seals left before it opens.)','(До того как он откроется, осталось печатей: {n}.)','（还差{n}个封印才能打开。）');
})();
