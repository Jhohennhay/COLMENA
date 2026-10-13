/* ══════════ POST · brillo de pantalla y reflejos reales (versión adulta, solo escritorio) ══════════
   Dos efectos que necesitan dibujar a una textura en lugar de a la pantalla. El motor recortado de Colmena
   (vendor/three-colmena.min.js) ya exporta lo necesario: WebGLRenderTarget, ShaderMaterial y DepthTexture.
   · Reflejos: antes del fotograma se dibuja la escena desde una cámara espejada bajo el suelo, a media resolución,
     y el suelo mojado (mojado.js) la muestra con un sombreador propio. Lo que está cerca del suelo se ve nítido;
     cuanto más alto, más borroso y más tenue. Se recorta solo, porque es una pieza más del cuarto con profundidad.
   · Brillo (bloom): el fotograma se dibuja a una textura del tamaño de la pantalla (con el mismo suavizado de bordes),
     se apartan solo las zonas muy claras (velas, faroles, la lente del faro, el Corazón), se emborronan a 1/4 y 1/8
     de resolución y una última pasada lleva a la pantalla el fotograma con el brillo sumado en mezcla «pantalla».
     El lienzo es transparente: el brillo lleva su propia opacidad para componerse bien con el fondo de la página.
   Las texturas guardan el color tal como sale a pantalla (ver `comoPantalla`), así que las mezclas de piezas
   transparentes dan exactamente lo mismo que al dibujar directo: el aspecto del juego no cambia.
   render3d.js llama a POST3D.render(...) en lugar de a renderer.render(...); si devuelve false, dibuja como siempre.
   Si algo falla (tarjeta sin soporte, sombreador que no compila), POST3D se apaga solo y mojado.js vuelve a los gemelos.
   En móvil no hay nada de esto: ni reflejos ni brillo (rendimiento sin medir en un teléfono real). */
if (window.COLMENA_ADULTO && window.R3D && window.THREE && THREE.WebGLRenderTarget && THREE.ShaderMaterial && THREE.DepthTexture) {
  window.POST3D = (() => {
    const CFG = {
        brillo: !COARSE,
        reflejos: !COARSE,
        /* cuánto brilla y a partir de qué claridad (0 a 1, tal como se ve en pantalla); de noche brilla antes */
        fuerza: 0.65,
        umbralDia: 0.84,
        umbralNoche: 0.68,
        /* tamaño de la textura del reflejo respecto a la pantalla, y cuánto se ve */
        escala: 0.5,
        reflejo: 0.5,
        /* lo que levanta menos que esto del suelo no se refleja (las baldosas y las capas de luz se doblarían a sí mismas) */
        margen: 4,
      },
      T3 = THREE,
      VERT = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
    let ok = true,
      fallo = '',
      probado = 0,
      W = 0,
      H = 0,
      pedido = null,
      noche = 0,
      SUAVE = true;
    /* ── un triángulo que cubre la pantalla, para las pasadas de imagen ── */
    const tri = new T3.BufferGeometry();
    tri.setAttribute('position', new T3.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    tri.setAttribute('uv', new T3.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    const lona = new T3.Mesh(tri, null),
      escenaLona = new T3.Scene(),
      camLona = new T3.PerspectiveCamera();
    lona.frustumCulled = false;
    escenaLona.add(lona);
    escenaLona.matrixWorldAutoUpdate = false;
    const pase = (frag, uniforms, extra) =>
      new T3.ShaderMaterial(
        Object.assign(
          { vertexShader: VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, blending: 0, fog: false },
          extra,
        ),
      );
    /* la cuenta de piezas dibujadas (la leen capturas.mjs y medidas.mjs) debe sumar todas las pasadas del fotograma,
       no solo la última: se va sumando aquí y se deja escrita al acabar */
    const CUENTA = { calls: 0, triangles: 0 };
    const suma = (rn) => {
      CUENTA.calls += rn.info.render.calls;
      CUENTA.triangles += rn.info.render.triangles;
    };
    const pinta = (rn, mat, destino) => {
      lona.material = mat;
      rn.setRenderTarget(destino);
      rn.render(escenaLona, camLona);
      suma(rn);
    };

    /* ══ BRILLO ══ */
    const B = { escena: null, a1: null, b1: null, a2: null, b2: null };
    const mClaro = pase(
        `uniform sampler2D tD;uniform vec2 px;uniform float umbral;varying vec2 vUv;
void main(){
  vec4 c=(texture2D(tD,vUv+px*vec2(-1.,-1.))+texture2D(tD,vUv+px*vec2(1.,-1.))+texture2D(tD,vUv+px*vec2(-1.,1.))+texture2D(tD,vUv+px*vec2(1.,1.)))*.25;
  float l=dot(c.rgb,vec3(.299,.587,.114));
  gl_FragColor=vec4(c.rgb*smoothstep(umbral,umbral+.2,l),1.);
}`,
        { tD: { value: null }, px: { value: new T3.Vector2() }, umbral: { value: 0.8 } },
      ),
      mBorron = pase(
        `uniform sampler2D tD;uniform vec2 dir;varying vec2 vUv;
void main(){
  vec3 c=texture2D(tD,vUv).rgb*.227027;
  c+=(texture2D(tD,vUv+dir*1.384615).rgb+texture2D(tD,vUv-dir*1.384615).rgb)*.316216;
  c+=(texture2D(tD,vUv+dir*3.230769).rgb+texture2D(tD,vUv-dir*3.230769).rgb)*.070270;
  gl_FragColor=vec4(c,1.);
}`,
        { tD: { value: null }, dir: { value: new T3.Vector2() } },
      ),
      /* mezcla «pantalla»: resultado = fotograma + brillo × (1 − fotograma), también en la opacidad */
      mSuma = pase(
        `uniform sampler2D tE;uniform sampler2D t1;uniform sampler2D t2;uniform float fuerza;varying vec2 vUv;
void main(){
  vec4 s=texture2D(tE,vUv);
  vec3 b=min((texture2D(t1,vUv).rgb*.55+texture2D(t2,vUv).rgb*.8)*fuerza,vec3(1.));
  float a=max(b.r,max(b.g,b.b));
  gl_FragColor=vec4(s.rgb+b*(1.-s.rgb),s.a+a*(1.-s.a));
}`,
        { tE: { value: null }, t1: { value: null }, t2: { value: null }, fuerza: { value: 0.5 } },
      );
    /* una textura de destino que guarda el color ya convertido a pantalla, igual que el lienzo. three.js r169 solo
       convierte a sRGB en el sombreador cuando el destino va marcado como de realidad virtual (isXRRenderTarget);
       con el formato RGBA8 a secas la tarjeta no vuelve a convertir. Así las mezclas son las mismas que en el lienzo. */
    const comoPantalla = (rt) => {
      rt.isXRRenderTarget = true;
      return rt;
    };
    const PANTALLA = { colorSpace: T3.SRGBColorSpace, internalFormat: 'RGBA8' };
    const destino = (w, h, extra) =>
      new T3.WebGLRenderTarget(
        Math.max(2, w),
        Math.max(2, h),
        Object.assign(
          { depthBuffer: false, stencilBuffer: false, minFilter: T3.LinearFilter, magFilter: T3.LinearFilter, generateMipmaps: false },
          extra,
        ),
      );
    function tira(o) {
      for (const k in o)
        if (o[k] && o[k].dispose) {
          o[k].dispose();
          o[k] = null;
        }
    }
    function montaBrillo() {
      tira(B);
      /* el fotograma entero, con suavizado de bordes (menos muestras en pantallas muy densas, donde apenas se nota
         y la memoria se dispara); la plantilla (stencil) va por si mojado.js tiene que volver a los gemelos */
      B.escena = comoPantalla(
        destino(
          W,
          H,
          Object.assign(
            {
              depthBuffer: true,
              stencilBuffer: true,
              samples: SUAVE ? (W * H > 3e6 ? 2 : 4) : 0,
              resolveDepthBuffer: false,
              resolveStencilBuffer: false,
            },
            PANTALLA,
          ),
        ),
      );
      const w4 = W >> 2,
        h4 = H >> 2;
      B.a1 = destino(w4, h4);
      B.b1 = destino(w4, h4);
      B.a2 = destino(w4 >> 1, h4 >> 1);
      B.b2 = destino(w4 >> 1, h4 >> 1);
    }
    function brillo(rn, scene, camera) {
      if (!B.escena) montaBrillo();
      rn.setRenderTarget(B.escena);
      rn.render(scene, camera);
      suma(rn);
      mClaro.uniforms.tD.value = B.escena.texture;
      mClaro.uniforms.px.value.set(1 / W, 1 / H);
      mClaro.uniforms.umbral.value = CFG.umbralDia + (CFG.umbralNoche - CFG.umbralDia) * noche;
      pinta(rn, mClaro, B.a1);
      const u = mBorron.uniforms;
      u.tD.value = B.a1.texture;
      u.dir.value.set(1 / B.a1.width, 0);
      pinta(rn, mBorron, B.b1);
      u.tD.value = B.b1.texture;
      u.dir.value.set(0, 1 / B.a1.height);
      pinta(rn, mBorron, B.a1);
      /* el halo ancho: lo mismo a la mitad de tamaño */
      u.tD.value = B.a1.texture;
      u.dir.value.set(1 / B.a2.width, 0);
      pinta(rn, mBorron, B.b2);
      u.tD.value = B.b2.texture;
      u.dir.value.set(0, 1 / B.a2.height);
      pinta(rn, mBorron, B.a2);
      mSuma.uniforms.tE.value = B.escena.texture;
      mSuma.uniforms.t1.value = B.a1.texture;
      mSuma.uniforms.t2.value = B.a2.texture;
      mSuma.uniforms.fuerza.value = CFG.fuerza * (0.7 + 0.3 * noche);
      pinta(rn, mSuma, null);
    }

    /* ══ REFLEJOS ══ */
    const E = { rt: null },
      camE = new T3.PerspectiveCamera(),
      MT = new T3.Matrix4(),
      ROT = new T3.Matrix4(),
      plano = new T3.Plane(),
      clip = new T3.Vector4(),
      q = new T3.Vector4(),
      v1 = new T3.Vector3(),
      v2 = new T3.Vector3(),
      ARRIBA = new T3.Vector3(0, 1, 0),
      /* radio (en medidas del mundo) de lo que entra en el reflejo, contado desde el centro del cuarto */
      CERCA = 520,
      SUELOS = [];
    const FRAG_SUELO = `uniform sampler2D tR;uniform sampler2D tZ;uniform vec2 px;uniform float fuerza;uniform float kh;uniform float hc;uniform float margen;
varying vec4 vP;varying float vZ;varying vec3 vV;
void main(){
  vec2 uv=vP.xy/vP.w;
  /* altura sobre el suelo de lo que se refleja aquí, sacada de la profundidad de la cámara espejada */
  float z=texture2D(tZ,uv).x;
  float A=min(z*vZ*kh,.97);
  /* donde no se refleja nada (z=1) solo llega el borde difuminado de lo que haya al lado */
  float h=z>.9999?0.:(hc*A+margen)/(1.-A);
  /* cuanto más alto, más borroso (el agua no es un espejo perfecto); algo más estirado en vertical */
  float r=z>.9999?2.5:clamp(h/vZ*26.,.6,5.);
  vec2 d=px*r*vec2(1.,1.5);
  vec4 c=texture2D(tR,uv)*.16;
  c+=(texture2D(tR,uv+d*vec2(.5,0.))+texture2D(tR,uv+d*vec2(.25,.433))+texture2D(tR,uv+d*vec2(-.25,.433))+texture2D(tR,uv+d*vec2(-.5,0.))+texture2D(tR,uv+d*vec2(-.25,-.433))+texture2D(tR,uv+d*vec2(.25,-.433)))*.08;
  c+=(texture2D(tR,uv+d*vec2(.866,.5))+texture2D(tR,uv+d*vec2(0.,1.))+texture2D(tR,uv+d*vec2(-.866,.5))+texture2D(tR,uv+d*vec2(-.866,-.5))+texture2D(tR,uv+d*vec2(0.,-1.))+texture2D(tR,uv+d*vec2(.866,-.5)))*.06;
  /* se apaga con la altura y gana algo de fuerza cuando se mira rasante */
  float f=fuerza*mix(1.,.3,smoothstep(20.,340.,h))*(.8+.6*pow(1.-abs(normalize(vV).y),2.));
  gl_FragColor=c*f;
}`;
    const VERT_SUELO = `uniform mat4 mT;varying vec4 vP;varying float vZ;varying vec3 vV;
void main(){
  vec4 w=modelMatrix*vec4(position,1.0);
  vec4 mv=viewMatrix*w;
  vP=mT*w;vZ=-mv.z;vV=cameraPosition-w.xyz;
  gl_Position=projectionMatrix*mv;
}`;
    /* el suelo que refleja: una pieza con la forma que le den (mojado.js le pasa el hexágono del cuarto) */
    function suelo(geo) {
      const m = new T3.ShaderMaterial({
          vertexShader: VERT_SUELO,
          fragmentShader: FRAG_SUELO,
          uniforms: {
            tR: { value: null },
            tZ: { value: null },
            mT: { value: MT },
            px: { value: new T3.Vector2() },
            fuerza: { value: 0 },
            kh: { value: 0 },
            hc: { value: 1 },
            margen: { value: 0 },
          },
          transparent: true,
          premultipliedAlpha: true,
          depthWrite: false,
          fog: false,
        }),
        me = new T3.Mesh(geo, m);
      me.renderOrder = 0.5;
      /* solo vale para la cámara del juego: en cualquier otra vista (los retratos de adulto.js) no se ve */
      me.onBeforeRender = (rn, sc, cam) => {
        m.uniforms.fuerza.value = cam === R3D.camera && E.rt && pedido && pedido.me === me ? CFG.reflejo : 0;
      };
      SUELOS.push(m);
      return me;
    }
    function montaEspejo() {
      tira(E);
      const w = Math.max(2, Math.round(W * CFG.escala)),
        h = Math.max(2, Math.round(H * CFG.escala));
      /* la profundidad va en coma flotante (1015 = FloatType): con el plano de corte inclinado los valores son
         diminutos, y con menos precisión la altura de lo reflejado sale a escalones */
      E.rt = comoPantalla(destino(w, h, Object.assign({ depthBuffer: true, depthTexture: new T3.DepthTexture(w, h, 1015) }, PANTALLA)));
    }
    /* la escena vista desde debajo del suelo (plano horizontal a la altura y0), como en el Reflector de three.js */
    function espejo(rn, scene, camera, P) {
      camera.updateMatrixWorld();
      v1.setFromMatrixPosition(camera.matrixWorld);
      const hc = v1.y - P.y0;
      if (!(hc > 1)) return false;
      if (!E.rt) montaEspejo();
      ROT.extractRotation(camera.matrixWorld);
      camE.position.set(v1.x, 2 * P.y0 - v1.y, v1.z);
      camE.up.set(0, 1, 0).applyMatrix4(ROT);
      camE.up.y *= -1;
      v2.set(0, 0, -1).applyMatrix4(ROT).add(v1);
      camE.lookAt(v2.x, 2 * P.y0 - v2.y, v2.z);
      /* solo se refleja este cuarto: el fondo se acerca todo lo posible, que afina la profundidad */
      camE.fov = camera.fov;
      camE.aspect = camera.aspect;
      camE.zoom = camera.zoom;
      camE.near = camera.near;
      camE.far = Math.min(camera.far, v1.distanceTo(P.me.getWorldPosition(v2)) + 1400);
      camE.updateProjectionMatrix();
      camE.updateMatrixWorld();
      /* de coordenadas del mundo a coordenadas de la textura del reflejo */
      MT.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
      MT.multiply(camE.projectionMatrix).multiply(camE.matrixWorldInverse);
      /* el plano de corte cercano se inclina hasta coincidir con el suelo: nada de lo que hay debajo se cuela */
      plano.setFromNormalAndCoplanarPoint(ARRIBA, v2.set(0, P.y0 + CFG.margen, 0)).applyMatrix4(camE.matrixWorldInverse);
      clip.set(plano.normal.x, plano.normal.y, plano.normal.z, plano.constant);
      const pe = camE.projectionMatrix.elements;
      q.x = (Math.sign(clip.x) + pe[8]) / pe[0];
      q.y = (Math.sign(clip.y) + pe[9]) / pe[5];
      q.z = -1;
      q.w = (1 + pe[10]) / pe[14];
      const k = 2 / clip.dot(q);
      clip.multiplyScalar(k);
      pe[2] = clip.x;
      pe[6] = clip.y;
      pe[10] = clip.z + 1;
      pe[14] = clip.w;
      const u = P.me.material.uniforms;
      u.tR.value = E.rt.texture;
      u.tZ.value = E.rt.depthTexture;
      u.px.value.set(1 / E.rt.width, 1 / E.rt.height);
      u.kh.value = 2 / (k * hc);
      u.hc.value = hc;
      u.margen.value = CFG.margen;
      /* se dibuja sin el propio suelo, sin lo que pida el cuarto (la lluvia), sin rehacer las sombras y sin nada que
         quede lejos de este cuarto: los demás cuartos, los caminos y los pilares apenas asomarían, doblan el trabajo
         y, vistos desde abajo, cruzan el reflejo */
      const sm = rn.shadowMap.autoUpdate,
        ocultos = [P.me, ...(P.fuera || [])].filter((o) => o && o.visible);
      P.me.getWorldPosition(v2);
      for (const o of scene.children) {
        if (!o.visible || o.isLight) continue;
        const dx = o.position.x - v2.x,
          dz = o.position.z - v2.z;
        if (dx * dx + dz * dz > CERCA * CERCA) ocultos.push(o);
      }
      for (const o of ocultos) o.visible = false;
      rn.shadowMap.autoUpdate = false;
      try {
        rn.setRenderTarget(E.rt);
        rn.render(scene, camE);
        suma(rn);
      } finally {
        rn.shadowMap.autoUpdate = sm;
        for (const o of ocultos) o.visible = true;
        rn.setRenderTarget(null);
      }
      return true;
    }

    /* ── ¿compilaron los sombreadores y no hay errores de la tarjeta? Se mira una vez, tras los primeros fotogramas ── */
    function revisa(rn) {
      const gl = rn.getContext();
      if (gl.isContextLost()) return;
      for (const m of [mClaro, mBorron, mSuma, ...SUELOS]) {
        const p = rn.properties.get(m).currentProgram;
        if (p && p.diagnostics && !p.diagnostics.runnable) throw new Error('sombreador');
      }
      const e = gl.getError();
      if (e) throw new Error('WebGL ' + e);
    }
    function apaga(rn, e) {
      ok = false;
      fallo = String((e && e.message) || e);
      console.warn('[post] apagado:', e);
      try {
        rn.setRenderTarget(null);
        rn.autoClear = true;
        tira(B);
        tira(E);
      } catch (e2) {}
    }
    /* ── el fotograma entero. Devuelve true si lo ha dibujado; false si render3d.js debe dibujar como siempre ── */
    function render(rn, scene, camera) {
      const P = CFG.reflejos ? pedido : null,
        conBrillo = CFG.brillo;
      if (!ok || (!P && !conBrillo)) {
        pedido = null;
        return false;
      }
      const info = rn.info;
      try {
        const el = rn.domElement;
        if (el.width !== W || el.height !== H) {
          W = el.width;
          H = el.height;
          tira(B);
          tira(E);
        }
        if (W < 8 || H < 8) return false;
        const n = typeof MOJADO !== 'undefined' && MOJADO[cur] ? 1 : Math.min(1, (darkLevel(cur) || 0) * 1.9);
        noche += (n - noche) * 0.05;
        if (!probado) {
          rn.getContext().getError();
          SUAVE = !!rn.getContext().getContextAttributes().antialias;
        }
        CUENTA.calls = CUENTA.triangles = 0;
        if (P) espejo(rn, scene, camera, P);
        if (conBrillo) brillo(rn, scene, camera);
        else {
          rn.setRenderTarget(null);
          rn.render(scene, camera);
          suma(rn);
        }
        if (probado < 3 && ++probado === 3) revisa(rn);
        info.render.calls = CUENTA.calls;
        info.render.triangles = CUENTA.triangles;
        return true;
      } catch (e) {
        apaga(rn, e);
        return false;
      } finally {
        pedido = null;
      }
    }
    return {
      CFG,
      render,
      suelo,
      /* ¿se puede contar con los reflejos reales? (mojado.js pregunta cada fotograma) */
      reflejos: () => ok && CFG.reflejos,
      /* «este fotograma, refleja en esta pieza a la altura y0 (del mundo) y no dibujes estas otras en el reflejo» */
      refleja: (me, y0, fuera) => {
        pedido = { me, y0, fuera };
      },
      estado: () => ({
        ok,
        fallo,
        brillo: CFG.brillo,
        reflejos: CFG.reflejos,
        espejo: E.rt ? E.rt.width + 'x' + E.rt.height : null,
        noche: +noche.toFixed(2),
      }),
    };
  })();
}
