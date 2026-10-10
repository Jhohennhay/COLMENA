/* ══════════ IDIOMAS ══════════
   El texto del juego está escrito en español; _t() lo traduce al vuelo.
   Frases fijas: tabla TR (español → [inglés, ruso, chino]).
   Frases con números o nombres dentro: plantillas TPL con {huecos}. */
const LANGS=[['es','Español'],['en','English'],['ru','Русский'],['zh','中文']];
let LANG=(()=>{try{const v=localStorage.getItem('colmena-lang');if(v&&['es','en','ru','zh'].includes(v))return v}catch(e){}
  const n=((navigator.languages&&navigator.languages[0])||navigator.language||'es').slice(0,2).toLowerCase();return['es','en','ru','zh'].includes(n)?n:'es'})();
const TR={},TPL=[],LI={en:0,ru:1,zh:2},TCACHE=new Map(),TMISS=new Set();
function I18N(rows){for(const r of rows)TR[r[0]]=r.slice(1)}
function TPLadd(pat,en,ru,zh){const keys=[];const src=pat.replace(/[.*+?^$()|[\]\\]/g,'\\$&').replace(/\{(\w+)\}/g,(m,k)=>{keys.push(k);return'(.+?)'});TPL.push({re:new RegExp('^'+src+'$'),keys,to:[en,ru,zh]})}
function _t(s){if(LANG==='es'||s==null||s==='')return s;s=String(s);const k=LANG+'\u0001'+s;let r=TCACHE.get(k);if(r!==undefined)return r;r=tr1(s);TCACHE.set(k,r);return r}
function tr1(s){const i=LI[LANG],e=TR[s];if(e&&e[i])return e[i];
  for(const t of TPL){const m=s.match(t.re);if(m){let out=t.to[i];t.keys.forEach((k,j)=>{const v=m[j+1];out=out.split('{'+k+'}').join(/^[\d\s\/·().,:+-]*$/.test(v)?v:_t(v))});return out}}
  if(/[a-záéíóúñ]{3}/i.test(s))TMISS.add(s);return s}
