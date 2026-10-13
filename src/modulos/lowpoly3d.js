/* ══════════ PERSONAJES LOW-POLY 3D ══════════
   Tú, los 25 vecinos y Pompón dejan de ser recortes de papel y pasan a ser figuras 3D low-poly:
   proporciones naturales (la cabeza algo grande para que se lean de lejos), cadera, rodilla, hombro
   y codo que se doblan, ojos con iris y brillo que parpadean, pelo por mechones, sombreros y lo que
   cada uno lleva en la mano.
   Optimizado para el móvil: todas las piezas de un mismo hueso se funden en UNA malla con colores
   por vértice y un único material compartido; un personaje entero cuesta unas 14 llamadas de dibujo.
   Los modelos se construyen una vez y se reutilizan al reconstruir los cuartos.
   La lógica del juego no cambia: esto solo sustituye al dibujo. */
const LP3D = (() => {
  const T3 = window.THREE;
  if (!T3) return null;
  const U0 = 34; /* unidades del mundo por metro de maqueta */
  const LOWSEG = typeof COARSE !== 'undefined' && COARSE;
  const sg = (n) => (LOWSEG ? Math.max(5, Math.round(n * 0.75)) : n);
  const SH = { shared: true };
  /* ── materiales compartidos ── */
  let MATF = null;
  const matF = () =>
    MATF ||
    (MATF = Object.assign(new T3.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: T3.DoubleSide }), { userData: SH }));
  let MAT = null;
  const mat = () => MAT || (MAT = Object.assign(new T3.MeshLambertMaterial({ vertexColors: true, side: T3.DoubleSide }), { userData: SH }));
  const BASIC = {};
  const basic = (c, o = {}) => {
    const k = c + JSON.stringify(o);
    return BASIC[k] || (BASIC[k] = Object.assign(new T3.MeshBasicMaterial({ color: c, ...o }), { userData: SH }));
  };
  /* ── colores: hex sRGB → oscurecer / aclarar ── */
  const hx = (c) => {
    if (!c || c[0] !== '#') return [200, 180, 160];
    const n =
      c.length === 4
        ? c
            .slice(1)
            .split('')
            .map((x) => parseInt(x + x, 16))
        : [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    return n;
  };
  const shd = (c, k = 0.8) => {
    const n = hx(c).map((v) => Math.max(0, Math.min(255, Math.round(v * k))));
    return '#' + n.map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  const mix = (a, b, t) => {
    const A = hx(a),
      B = hx(b);
    return (
      '#' +
      A.map((v, i) =>
        Math.round(v + (B[i] - v) * t)
          .toString(16)
          .padStart(2, '0'),
      ).join('')
    );
  };
  /* ── plantillas de geometría (se clonan al fundir) ── */
  const GC = {};
  const gq = (k, f) => GC[k] || (GC[k] = ((g) => ((g.userData.shared = true), g))(f()));
  const SPH = (r, w = 12, h = 9, a = 0, b = Math.PI * 2, c = 0, d = Math.PI) =>
    gq(['s', r, w, h, a, b, c, d].join(), () => new T3.SphereGeometry(r, sg(w), sg(h), a, b, c, d));
  const CYL = (r0, r1, h, n = 10, open = false, a = 0, b = Math.PI * 2) =>
    gq(['c', r0, r1, h, n, open, a, b].join(), () => new T3.CylinderGeometry(r0, r1, h, sg(n), 1, open, a, b));
  const CONE = (r, h, n = 6) => gq(['k', r, h, n].join(), () => new T3.ConeGeometry(r, h, n));
  const BOX = (x, y, z) => gq(['b', x, y, z].join(), () => new T3.BoxGeometry(x, y, z));
  const TOR = (r, t, a = 6, b = 12, arc = Math.PI * 2) =>
    gq(['t', r, t, a, b, arc].join(), () => new T3.TorusGeometry(r, t, a, sg(b), arc));
  const CIRC = (r, n = 10, a = 0, b = Math.PI * 2) => gq(['o', r, n, a, b].join(), () => new T3.CircleGeometry(r, n, a, b));
  const LATHE = (pts, n = 12, a = 0, b = Math.PI * 2) =>
    gq(
      'l' + JSON.stringify(pts) + n + a + b,
      () =>
        new T3.LatheGeometry(
          pts.map(([r, y]) => new T3.Vector2(r, y)),
          sg(n),
          a,
          b,
        ),
    );
  const OCT = (r) => gq('8' + r, () => new T3.OctahedronGeometry(r, 0));
  /* ── un cubo de piezas que se funde en una sola malla ── */
  const _m = new T3.Matrix4(),
    _q = new T3.Quaternion(),
    _e = new T3.Euler(),
    _c = new T3.Color(),
    _v = new T3.Vector3(),
    _s = new T3.Vector3();
  class Bk {
    constructor() {
      this.p = [];
    }
    add(g, col, pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) {
      this.p.push({ g, col, pos, rot, scl, m: null });
      return this;
    }
    addM(g, col, m) {
      this.p.push({ g, col, m: m.clone() });
      return this;
    }
    geo() {
      let n = 0;
      const gs = this.p.map((P) => {
        const g = P.g.index ? P.g.toNonIndexed() : P.g.clone();
        if (P.m) g.applyMatrix4(P.m);
        else {
          _e.set(...P.rot);
          _q.setFromEuler(_e);
          _m.compose(_v.set(...P.pos), _q, _s.set(...P.scl));
          g.applyMatrix4(_m);
        }
        n += g.attributes.position.count;
        return [g, P.col];
      });
      const pos = new Float32Array(n * 3),
        nor = new Float32Array(n * 3),
        col = new Float32Array(n * 3);
      let o = 0;
      for (const [g, c] of gs) {
        const cnt = g.attributes.position.count;
        pos.set(g.attributes.position.array, o * 3);
        nor.set(g.attributes.normal.array, o * 3);
        _c.set(c);
        for (let i = 0; i < cnt; i++) {
          const j = (o + i) * 3;
          col[j] = _c.r;
          col[j + 1] = _c.g;
          col[j + 2] = _c.b;
        }
        o += cnt;
        g.dispose();
      }
      const G = new T3.BufferGeometry();
      G.setAttribute('position', new T3.BufferAttribute(pos, 3));
      G.setAttribute('normal', new T3.BufferAttribute(nor, 3));
      G.setAttribute('color', new T3.BufferAttribute(col, 3));
      G.computeBoundingSphere();
      G.userData.shared = true;
      return G;
    }
    mesh(parent, flat) {
      if (!this.p.length) return null;
      const m = new T3.Mesh(this.geo(), flat ? matF() : mat());
      m.userData.lp = 1;
      if (parent) parent.add(m);
      return m;
    }
  }
  /* matriz de una pieza dentro de otra (para colocar en un cubo piezas definidas en un grupo hijo) */
  const MX = (pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) => {
    _e.set(...rot);
    _q.setFromEuler(_e);
    return new T3.Matrix4().compose(new T3.Vector3(...pos), _q.clone(), new T3.Vector3(...scl));
  };
  const grp = (p, pos = [0, 0, 0]) => {
    const g = new T3.Group();
    g.position.set(...pos);
    if (p) p.add(g);
    return g;
  };

  /* ══ el pelo, por peinados (coordenadas de la cabeza, radio ~0.2) ══ */
  function hair(B, st, c, o = {}) {
    const d = shd(c, 0.82),
      hiC = mix(c, '#FFFFFF', 0.12);
    const cap = () => B.add(SPH(0.215, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), c, [0, 0.012, -0.012], [-0.22, 0, 0], [0.97, 1.05, 1.03]);
    const back = (lo = 0.72) =>
      B.add(
        SPH(0.207, 14, 8, Math.PI * 0.82, Math.PI * 1.36, Math.PI * 0.3, Math.PI * (lo - 0.3)),
        d,
        [0, 0, -0.03],
        [0, 0, 0],
        [1, 1.02, 1],
      );
    const bangs = (n = 5, len = 0.12, flat = false) => {
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1) - 0.5,
          x = u * 0.27,
          z = 0.155 - Math.abs(u) * 0.07,
          rz = -u * (flat ? 0.3 : 1.1);
        B.add(
          CONE(0.05, len, 5),
          i % 2 ? c : hiC,
          [x, 0.11 - (flat ? 0 : Math.abs(u) * 0.03), z],
          [0.75 + (flat ? 0.15 : 0), 0, rz],
          [1.25, 1, 0.55],
        );
      }
    };
    const tufts = () => {
      const t = [
        [0, 0.19, 0.03, -1.1, 0],
        [-0.08, 0.18, 0.06, -1.2, 0.4],
        [0.08, 0.18, 0.07, -1.25, -0.4],
        [-0.15, 0.12, 0, -0.5, 1.1],
        [0.15, 0.12, 0, -0.5, -1.1],
        [0, 0.18, -0.08, -0.3, 0],
        [-0.1, 0.13, -0.13, 0.6, 0.6],
        [0.1, 0.13, -0.13, 0.6, -0.6],
        [0, 0.08, -0.18, 1.3, 0],
      ];
      for (const [x, y, z, rx, rz] of t) B.add(CONE(0.055, 0.1, 5), c, [x, y, z], [rx, 0, rz], [1.1, 1, 0.8]);
    };
    /* lo que cuelga (melena, trenzas, coleta) va a un cubo aparte para que siga a la cabeza con retraso */
    const W = o.sw || B;
    const sideLocks = (len) => {
      for (const s of [-1, 1]) W.add(CONE(0.05, len, 6), c, [s * 0.185, -0.02 - len * 0.35, 0.0], [0, 0, s * 0.12], [1, 1, 0.7]);
    };
    switch (st) {
      case 'calvo':
        B.add(TOR(0.188, 0.034, 5, 12, Math.PI * 1.15), c, [0, -0.01, 0], [-Math.PI / 2, 0, -Math.PI * 0.075]);
        return;
      case 'rapado':
        B.add(SPH(0.207, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.52), c, [0, 0.004, -0.008], [-0.22, 0, 0], [0.96, 1.03, 1.01]);
        back(0.62);
        return;
      case 'afro':
        B.add(SPH(0.3, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), c, [0, 0.03, -0.05], [-0.42, 0, 0], [1, 0.96, 1]);
        B.add(SPH(0.27, 12, 9), c, [0, 0.02, -0.1], [0, 0, 0], [1.02, 0.95, 0.9]);
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          B.add(SPH(0.07, 6, 5), i % 2 ? d : c, [Math.cos(a) * 0.26, 0.12 + Math.sin(a * 2) * 0.04, -0.06 + Math.sin(a) * 0.2]);
        }
        return;
    }
    cap();
    if (st === 'corto' || st === 'flequillo' || st === 'rizado' || !st) {
      back(0.7);
      if (st === 'flequillo') bangs(6, 0.13, true);
      else if (st === 'rizado') {
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2,
            y = 0.07 + (i % 3) * 0.05;
          B.add(SPH(0.06, 7, 5), i % 2 ? c : d, [Math.cos(a) * 0.19, y, Math.sin(a) * 0.18 - 0.03]);
        }
      } else {
        bangs(4, 0.13);
        if (o.tufts !== false) tufts();
      }
      return;
    }
    back(0.72);
    bangs(5, 0.11);
    if (st === 'largo' || st === 'melena') {
      const L = st === 'largo' ? 0.42 : 0.3;
      W.add(CYL(0.2, 0.215, L, 12, true, Math.PI * 0.42, Math.PI * 1.16), d, [0, -0.02 - L / 2, -0.03], [0.08, 0, 0], [1, 1, 0.9]);
      sideLocks(L * 0.85);
    }
    if (st === 'trenzas') {
      for (const s of [-1, 1]) {
        for (let i = 0; i < 5; i++) W.add(SPH(0.042, 7, 5), i % 2 ? c : d, [s * (0.17 + i * 0.006), -0.08 - i * 0.07, 0.02 + i * 0.02]);
        W.add(SPH(0.03, 6, 5), o.ribbon || '#E07A80', [s * 0.2, -0.44, 0.11], [0, 0, 0], [1.6, 0.8, 0.8]);
      }
    }
    if (st === 'moño' || st === 'recogido') B.add(SPH(0.09, 10, 8), c, [0, st === 'moño' ? 0.1 : 0.0, -0.21]);
    if (st === 'moñoalto') {
      B.add(SPH(0.095, 10, 8), c, [0, 0.24, -0.04], [0, 0, 0], [1.1, 0.85, 1.1]);
      B.add(TOR(0.06, 0.018, 5, 10), d, [0, 0.19, -0.03], [Math.PI / 2, 0, 0]);
    }
    if (st === 'coleta') {
      W.add(CONE(0.07, 0.3, 7), c, [0, -0.08, -0.25], [-2.7, 0, 0], [1, 1, 0.8]);
      B.add(TOR(0.04, 0.014, 5, 8), d, [0, 0.04, -0.22], [0.4, 0, 0]);
    }
  }

  /* ══ sombreros ══ */
  function hat(B, h, ctx) {
    if (!h) return;
    const [k, a, b] = h;
    const brim = (r, c, y = 0.1, t = 0.02, rx = -0.12) => B.add(CYL(r, r * 0.98, t, 18), c, [0, y, 0], [rx, 0, 0]);
    const crown = (r0, r1, hh, c, y) => B.add(CYL(r0, r1, hh, 14), c, [0, y, -0.01], [-0.12, 0, 0]);
    switch (k) {
      case 'straw':
        brim(0.36, '#E9C46A', 0.11);
        crown(0.16, 0.19, 0.13, '#F2D37A', 0.19);
        B.add(CYL(0.192, 0.192, 0.03, 14, true), a || '#B8484A', [0, 0.15, -0.01], [-0.12, 0, 0]);
        if (b)
          for (const [x, z, r] of [
            [-0.06, 0.02, -0.4],
            [0.02, -0.02, 0.1],
            [0.08, 0.03, 0.5],
          ]) {
            B.add(CYL(0.006, 0.006, 0.12, 4), '#4E6B46', [x, 0.31, z], [0, 0, r]);
            B.add(SPH(0.035, 6, 4), '#8FB06A', [x + Math.sin(r) * -0.06, 0.37, z], [0, 0, 0], [1.4, 0.5, 0.8]);
          }
        break;
      case 'wide':
        brim(0.38, a, 0.11);
        crown(0.16, 0.185, 0.13, shd(a, 0.94), 0.19);
        B.add(CYL(0.188, 0.19, 0.035, 14, true), shd(a, 0.7), [0, 0.15, -0.01], [-0.12, 0, 0]);
        break;
      case 'chef':
        B.add(CYL(0.2, 0.205, 0.1, 14), '#F7F2E8', [0, 0.13, 0], [-0.12, 0, 0]);
        for (const [x, z, r] of [
          [-0.08, 0, 0.11],
          [0.08, 0, 0.11],
          [0, -0.02, 0.13],
          [0, 0.06, 0.1],
        ])
          B.add(SPH(r, 10, 8), '#FBF7EF', [x, 0.27, z]);
        break;
      case 'top':
        brim(0.28, a, 0.13, 0.02);
        B.add(CYL(0.15, 0.16, 0.3, 14), a, [0, 0.29, -0.02], [-0.1, 0, 0]);
        B.add(CYL(0.162, 0.162, 0.05, 14, true), b || '#D8574A', [0, 0.17, -0.01], [-0.1, 0, 0]);
        break;
      case 'cap':
        B.add(SPH(0.218, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), a, [0, 0.03, -0.01], [-0.15, 0, 0], [1, 0.8, 1]);
        B.add(SPH(0.15, 10, 4, 0, Math.PI, 0, Math.PI * 0.5), shd(a, 0.7), [0, 0.06, 0.12], [-0.05, 0, 0], [1, 0.12, 1.1]);
        if (b) B.add(CYL(0.218, 0.218, 0.035, 14, true), b, [0, 0.06, -0.01], [-0.15, 0, 0]);
        break;
      case 'souwester':
        B.add(SPH(0.225, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), '#F2C94C', [0, 0.03, -0.01], [-0.12, 0, 0]);
        B.add(CYL(0.25, 0.36, 0.1, 16, true), '#E8BC3C', [0, 0.04, -0.04], [0.25, 0, 0]);
        break;
      case 'beret':
        B.add(SPH(0.22, 12, 6), a, [0.02, 0.17, -0.01], [-0.15, 0, 0.15], [1.05, 0.32, 1]);
        B.add(CYL(0.008, 0.008, 0.04, 4), shd(a, 0.7), [0.02, 0.25, -0.01]);
        break;
      case 'beanie':
        B.add(SPH(0.228, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.55), a, [0, 0.02, -0.01], [-0.18, 0, 0], [1, 1.12, 1.03]);
        B.add(CYL(0.232, 0.232, 0.06, 14, true), shd(a, 0.8), [0, 0.035, -0.01], [-0.18, 0, 0]);
        B.add(SPH(0.055, 8, 6), b || '#F2EADB', [0, 0.27, -0.06]);
        break;
      case 'miner':
        B.add(SPH(0.228, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), '#E4A844', [0, 0.03, -0.01], [-0.12, 0, 0], [1, 0.9, 1.02]);
        B.add(CYL(0.25, 0.25, 0.025, 16), '#C9872F', [0, 0.04, -0.01], [-0.12, 0, 0]);
        B.add(CYL(0.045, 0.045, 0.05, 8), '#6A5A4A', [0, 0.13, 0.2], [Math.PI / 2 - 0.2, 0, 0]);
        B.add(CIRC(0.036, 8), '#FFF4C2', [0, 0.135, 0.228], [-0.2, 0, 0]);
        break;
      case 'flat':
        B.add(SPH(0.22, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), a, [0, 0.07, -0.01], [-0.25, 0, 0], [1.02, 0.5, 1.08]);
        B.add(SPH(0.14, 10, 4, 0, Math.PI, 0, Math.PI * 0.5), shd(a, 0.8), [0, 0.09, 0.14], [-0.15, 0, 0], [1, 0.1, 1]);
        break;
      case 'scarf':
        B.add(SPH(0.226, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.58), a, [0, 0.01, -0.02], [-0.35, 0, 0], [1.02, 1.05, 1.04]);
        B.add(SPH(0.05, 6, 5), shd(a, 0.85), [0, -0.08, -0.2]);
        for (const s of [-1, 1]) B.add(BOX(0.05, 0.14, 0.015), a, [s * 0.04, -0.17, -0.2], [0.2, 0, s * 0.3]);
        break;
      case 'veil':
        brim(0.34, '#EFE6D2', 0.12);
        crown(0.15, 0.17, 0.12, '#F6F0E2', 0.19);
        B.add(CYL(0.17, 0.17, 0.03, 14, true), ctx.accent || '#E4A844', [0, 0.16, -0.01], [-0.12, 0, 0]);
        ctx.veil = true;
        break;
      case 'hood':
        B.add(SPH(0.27, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.78), a || '#E07A4E', [0, 0.01, -0.04], [-0.62, 0, 0], [1, 1.02, 1]);
        B.add(TOR(0.2, 0.05, 6, 16), '#F3E6C4', [0, -0.01, 0.13], [0.12, 0, 0], [1, 1.1, 1]);
        break;
      case 'bandana':
        B.add(CYL(0.215, 0.215, 0.07, 14, true), a, [0, 0.08, 0], [-0.18, 0, 0]);
        B.add(BOX(0.05, 0.12, 0.02), a, [-0.06, 0.04, -0.22], [0.3, 0, -0.5]);
        B.add(BOX(0.05, 0.1, 0.02), a, [0.03, 0.03, -0.22], [0.3, 0, 0.4]);
        break;
      case 'pencils':
        for (const [x, r, c] of [
          [-0.03, -0.5, '#E4A844'],
          [0.04, 0.45, '#3E8FA0'],
          [0, -0.1, '#B8484A'],
        ])
          B.add(CYL(0.008, 0.008, 0.17, 5), c, [x + Math.sin(r) * 0.05, 0.33, -0.04], [0, 0, r]);
        break;
      case 'goggles':
        B.add(CYL(0.212, 0.212, 0.03, 14, true), '#5A4A42', [0, 0.07, 0], [-0.25, 0, 0]);
        for (const s of [-1, 1]) {
          B.add(CYL(0.045, 0.045, 0.04, 10), '#5A4A42', [s * 0.065, 0.11, 0.17], [Math.PI / 2 - 0.3, 0, 0]);
          B.add(CIRC(0.032, 10), '#6FC0A0', [s * 0.065, 0.115, 0.192], [-0.3, 0, 0]);
        }
        break;
      case 'crown':
        {
          const cols = a || ['#F4AFA6', '#FBF4E3', '#F5CE55'];
          for (let i = 0; i < 9; i++) {
            const an = (i / 9) * Math.PI * 2,
              x = Math.sin(an) * 0.2,
              z = Math.cos(an) * 0.2 - 0.01,
              y = 0.12 + Math.cos(an) * 0.02;
            B.add(
              CONE(0.022, 0.07, 4),
              '#6F8D5E',
              [x * 1.04, y - 0.01, z * 1.04],
              [Math.cos(an) * 0.9, 0, -Math.sin(an) * 0.9],
              [1, 1, 0.4],
            );
            for (let k = 0; k < 5; k++) {
              const b = (k / 5) * Math.PI * 2;
              B.add(SPH(0.02, 5, 4), cols[i % cols.length], [
                x + Math.cos(b) * 0.022 * Math.cos(an),
                y + Math.sin(b) * 0.022,
                z - Math.cos(b) * 0.022 * Math.sin(an),
              ]);
            }
            B.add(SPH(0.012, 5, 4), '#F5CE55', [x * 1.06, y, z * 1.06]);
          }
        }
        break;
      case 'rays':
        B.add(TOR(0.2, 0.02, 5, 18), b || '#E4A844', [0, 0.12, -0.01], [Math.PI / 2 - 0.12, 0, 0]);
        for (let i = 0; i < 11; i++) {
          const an = -1.5 + i * 0.3,
            L = i % 2 ? 0.09 : 0.14;
          B.add(
            CONE(0.03, L, 4),
            i % 2 ? b || '#E4A844' : a || '#F5CE55',
            [Math.sin(an) * 0.2, 0.14 + Math.cos(an) * 0.04 + L / 2, Math.cos(an) * 0.2 * 0.6 - 0.03],
            [0, 0, -an * 0.45],
            [1, 1, 0.45],
          );
        }
        break;
      case 'leaves':
        {
          const cols = a;
          for (let i = 0; i < 10; i++) {
            const an = (i / 10) * Math.PI * 2;
            B.add(
              OCT(0.06),
              cols[i % cols.length],
              [Math.sin(an) * 0.2, 0.14 + Math.cos(an) * 0.02, Math.cos(an) * 0.2 - 0.01],
              [0, an, 0],
              [0.9, 1.25, 0.25],
            );
          }
        }
        break;
      case 'nightcap':
        B.add(CYL(0.226, 0.226, 0.06, 14, true), shd(a, 0.82), [0, 0.06, -0.01], [-0.2, 0, 0]);
        B.add(CONE(0.226, 0.5, 12), a, [0, 0.27, -0.12], [-0.75, 0, 0], [1, 1, 1]);
        B.add(SPH(0.06, 8, 6), b || '#FBF4E3', [0, 0.36, -0.4]);
        break;
      case 'moonPin':
        B.add(SPH(0.04, 8, 6), a || '#F6D98A', [-0.15, 0.12, 0.08], [0, 0, 0], [1, 1, 0.5]);
        B.add(SPH(0.036, 8, 6), '#C9D3E8', [-0.13, 0.13, 0.095], [0, 0, 0], [1, 1, 0.5]);
        break;
      case 'wrap':
        B.add(SPH(0.255, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.55), a, [0, 0.04, -0.02], [-0.2, 0, 0], [1, 0.85, 1.02]);
        B.add(TOR(0.23, 0.025, 5, 16), b || shd(a, 0.8), [0, 0.05, -0.01], [Math.PI / 2 - 0.2, 0, 0]);
        B.add(SPH(0.05, 7, 6), shd(a, 0.8), [0, 0.16, 0.17]);
        break;
      case 'antennae':
        B.add(TOR(0.205, 0.012, 4, 16, Math.PI), a, [0, 0.06, 0], [0, Math.PI / 2, 0]);
        for (const s of [-1, 1]) {
          B.add(CYL(0.008, 0.008, 0.26, 4), a, [s * 0.07, 0.3, 0.02], [0, 0, -s * 0.35]);
          B.add(SPH(0.03, 7, 6), b || '#F5CE55', [s * 0.115, 0.42, 0.02]);
        }
        break;
      case 'bow':
        for (const s of [-1, 1])
          B.add(CONE(0.07, 0.14, 4), s < 0 ? shd(a, 0.85) : a, [s * 0.075, 0.16, -0.12], [0, 0, (s * Math.PI) / 2], [1, 1, 0.4]);
        B.add(SPH(0.035, 7, 6), shd(a, 0.75), [0, 0.16, -0.12]);
        break;
      case 'clockTop':
        hat(B, ['top', '#3A3A48', '#C9A05C'], ctx);
        B.add(CYL(0.075, 0.075, 0.012, 14), '#F4EFE2', [0, 0.3, 0.13], [Math.PI / 2 - 0.1, 0, 0]);
        B.add(TOR(0.075, 0.008, 4, 14), '#C9A05C', [0, 0.3, 0.135], [-0.1, 0, 0]);
        B.add(BOX(0.006, 0.05, 0.004), '#3A2A20', [0, 0.32, 0.142], [-0.1, 0, 0]);
        break;
      case 'plume':
        hat(B, ['top', b || '#2A2230', '#E4A844'], ctx);
        B.add(OCT(0.06), a || '#F6D98A', [0, 0.5, -0.02], [0, 0, 0], [1, 1.2, 0.35]);
        break;
      case 'lamp':
        B.add(SPH(0.228, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), a || '#E4A844', [0, 0.03, -0.01], [-0.12, 0, 0], [1, 0.85, 1.02]);
        B.add(CYL(0.06, 0.06, 0.1, 8), '#FFF1B0', [0, 0.28, -0.02]);
        B.add(CONE(0.085, 0.08, 8), '#B8484A', [0, 0.37, -0.02]);
        ctx.glow = { c: '#FFF1B0', pos: [0, 0.28, -0.02], r: 0.05 };
        break;
      case 'candle':
        B.add(CYL(0.2, 0.2, 0.05, 14), '#FBF4E3', [0, 0.15, -0.01], [-0.1, 0, 0]);
        B.add(CYL(0.07, 0.07, 0.24, 10), '#F6EAD0', [0, 0.3, -0.02]);
        for (const [x, l] of [
          [-0.05, 0.08],
          [0.05, 0.12],
          [0.02, 0.05],
        ])
          B.add(CYL(0.012, 0.012, l, 5), '#FFF8E8', [x, 0.4 - l / 2, 0.055]);
        ctx.glow = { c: '#FFC45A', pos: [0, 0.45, -0.02], r: 0.03, flame: 1 };
        break;
      case 'crystals':
        {
          const cols = a;
          [
            [-0.09, 0.18, -0.4],
            [0, 0.24, -0.1],
            [0.08, 0.2, 0.3],
            [0.14, 0.12, 0.7],
          ].forEach(([x, y, r], i) => B.add(OCT(0.055), cols[i % cols.length], [x, y, -0.03], [0, 0.4, r], [0.6, 1.5, 0.6]));
        }
        break;
      case 'ember':
        B.add(CYL(0.214, 0.214, 0.05, 14, true), '#3A2A20', [0, 0.08, 0], [-0.15, 0, 0]);
        for (let i = 0; i < 9; i++) {
          const an = -1.6 + i * 0.4;
          B.add(
            CONE(0.035, i % 2 ? 0.1 : 0.15, 5),
            i % 2 ? '#F5A83A' : '#E0584A',
            [Math.sin(an) * 0.19, 0.17, Math.cos(an) * 0.19 * 0.7 - 0.03],
            [0, 0, -an * 0.3],
            [1, 1, 0.6],
          );
        }
        ctx.glow = { c: '#F5A83A', pos: [0, 0.22, 0], r: 0.001, lamp: 0.4 };
        break;
      case 'earmuffs':
        B.add(TOR(0.215, 0.014, 4, 16, Math.PI), b || '#8A5A3A', [0, 0, 0], [0, Math.PI / 2, 0]);
        for (const s of [-1, 1]) B.add(SPH(0.07, 9, 7), a || '#FBF8F2', [s * 0.2, -0.01, 0], [0, 0, 0], [0.6, 1, 1]);
        break;
      case 'feather':
        hat(B, ['beret', a], ctx);
        B.add(CONE(0.03, 0.36, 5), b || '#F3E6C4', [-0.08, 0.33, -0.05], [0.25, 0, 0.6], [1, 1, 0.3]);
        break;
      case 'hexCrown':
        B.add(CYL(0.18, 0.18, 0.04, 14, true), shd(a || '#E4A844', 0.85), [0, 0.16, -0.01], [-0.12, 0, 0]);
        [
          [-0.08, 0.24, 0.09],
          [0, 0.27, 0.12],
          [0.08, 0.24, 0.09],
        ].forEach(([x, y, z]) => B.add(CYL(0.045, 0.045, 0.02, 6), a || '#E4A844', [x, y, z], [Math.PI / 2 - 0.2, 0, 0]));
        B.add(SPH(0.015, 5, 4), b || '#F4AFA6', [0, 0.27, 0.135]);
        break;
      case 'owl':
        for (const [x, r] of [
          [-0.1, -0.55],
          [-0.03, -0.2],
          [0.05, 0.25],
        ])
          B.add(CONE(0.035, 0.13, 4), a || '#B8B0A4', [x, 0.23, 0], [0, 0, r], [1, 1, 0.4]);
        break;
      case 'coral':
        for (const [x, r, c] of [
          [-0.1, -0.5, '#E07F7F'],
          [0, -0.1, '#F4AFA6'],
          [0.1, 0.4, '#E07F7F'],
        ]) {
          B.add(CYL(0.016, 0.02, 0.16, 5), c, [x, 0.33, 0], [0, 0, r]);
          B.add(CYL(0.012, 0.014, 0.07, 5), c, [x + 0.04 * Math.sign(r || 1), 0.36, 0], [0, 0, r + 0.8]);
        }
        break;
      case 'both':
        for (const h2 of a) hat(B, h2, ctx);
        break;
      case 'helmet':
        ctx.noFace = true;
        B.add(SPH(0.3, 16, 12), '#C9A05C', [0, 0, 0]);
        B.add(TOR(0.13, 0.025, 6, 16), '#8A6A3A', [0, 0, 0.27]);
        B.add(CIRC(0.12, 16), '#23404C', [0, 0, 0.285]);
        B.add(CIRC(0.03, 8), '#9CC6D4', [-0.05, 0.04, 0.288]);
        for (const s of [-1, 1]) {
          B.add(CYL(0.055, 0.055, 0.03, 10), '#8A6A3A', [s * 0.28, 0.02, 0], [0, 0, Math.PI / 2]);
          B.add(CIRC(0.04, 8), '#23404C', [s * 0.296, 0.02, 0], [0, (s * Math.PI) / 2, 0]);
        }
        B.add(CYL(0.24, 0.26, 0.08, 16), '#B08A4A', [0, -0.27, 0]);
        break;
    }
  }
  /* ══ rasgos de la cara ══ */
  function fx(B, list, e) {
    for (const f of list || []) {
      const [k, a, b] = f;
      if (k === 'glasses') {
        for (const s of [-1, 1]) B.add(TOR(0.042, 0.007, 4, 12), a || '#6A4A30', [s * e.x, e.y, e.z + 0.025]);
        B.add(BOX(0.04, 0.008, 0.008), a || '#6A4A30', [0, e.y + 0.005, e.z + 0.03]);
      } else if (k === 'sunglasses') {
        for (const s of [-1, 1])
          B.add(CYL(0.047, 0.047, 0.012, 12), '#2A2230', [s * e.x, e.y, e.z + 0.03], [Math.PI / 2, 0, 0], [1, 1, 0.8]);
        B.add(BOX(0.05, 0.01, 0.01), '#2A2230', [0, e.y + 0.01, e.z + 0.035]);
      } else if (k === 'monocle') {
        B.add(TOR(0.045, 0.008, 4, 12), '#C9A05C', [-e.x, e.y, e.z + 0.03]);
        B.add(CIRC(0.04, 10), '#DCEFF6', [-e.x, e.y, e.z + 0.029]);
      } else if (k === 'mustache') {
        const w = b || 1;
        for (const s of [-1, 1]) B.add(SPH(0.04, 8, 6), a, [s * 0.035 * w, -0.092, 0.185], [0, 0, s * 0.35], [1.35 * w, 0.45, 0.6]);
      } else if (k === 'beard') {
        B.add(SPH(0.155, 12, 9, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58), a, [0, -0.03, 0.04], [0.25, 0, 0], [1, 1.05, 1.02]);
        for (const s of [-1, 1]) B.add(SPH(0.04, 8, 6), a, [s * 0.035, -0.092, 0.187], [0, 0, s * 0.35], [1.35, 0.45, 0.6]);
      } else if (k === 'rosy') {
        for (const s of [-1, 1]) B.add(CIRC(0.032, 10), '#EE8C86', [s * 0.1, -0.06, 0.168], [0, s * 0.5, 0], [1.3, 0.85, 1]);
      } else if (k === 'soot') {
        B.add(CIRC(0.03, 8), '#5A4A42', [-0.11, -0.07, 0.163], [0, -0.55, 0], [1.3, 0.7, 1]);
        B.add(CIRC(0.022, 8), '#5A4A42', [0.07, 0.07, 0.18], [0, 0.35, 0], [1.4, 0.6, 1]);
      } else if (k === 'facescarf') {
        B.add(SPH(0.17, 12, 8, Math.PI * 0.5 - 0.95, 1.9, Math.PI * 0.5, Math.PI * 0.32), a, [0, -0.03, 0.03], [0, 0, 0], [1.08, 1, 1.12]);
        B.add(BOX(0.06, 0.18, 0.02), a, [-0.12, -0.18, -0.12], [0.3, 0, 0.4]);
      } else if (k === 'bigGlasses') {
        for (const s of [-1, 1]) B.add(TOR(0.055, 0.009, 4, 14), a || '#C9A05C', [s * e.x, e.y, e.z + 0.03]);
        B.add(BOX(0.03, 0.01, 0.01), a || '#C9A05C', [0, e.y + 0.01, e.z + 0.04]);
      } else if (k === 'paint') {
        B.add(CIRC(0.02, 8), '#3E8FA0', [-0.1, -0.06, 0.168], [0, -0.5, 0], [1.3, 0.8, 1]);
        B.add(CIRC(0.016, 8), '#B8484A', [0.09, 0.06, 0.18], [0, 0.4, 0]);
      } else if (k === 'freckles') {
        for (const s of [-1, 1])
          for (let i = 0; i < 3; i++)
            B.add(CIRC(0.006, 5), '#B8784A', [s * (0.08 + i * 0.018), -0.045 - (i % 2) * 0.012, 0.172], [0, s * 0.45, 0]);
      }
    }
  }

  /* ══ lo que llevan en la mano (marco del cuerpo: +y arriba, +z al frente; origen en la mano) ══ */
  function item(B, k, a, G) {
    switch (k) {
      case 'can':
        B.add(CYL(0.07, 0.075, 0.13, 10), '#3E8FA0', [0, 0.0, 0.03]);
        B.add(CYL(0.012, 0.02, 0.16, 6), '#2E6E7E', [0, 0.06, 0.14], [-0.9, 0, 0]);
        B.add(TOR(0.05, 0.01, 4, 10, Math.PI), '#2E6E7E', [0, 0.07, -0.02], [0, Math.PI / 2, 0]);
        break;
      case 'fan':
        for (let i = 0; i < 7; i++) {
          const r = -1.2 + i * 0.4;
          B.add(BOX(0.03, 0.16, 0.004), i % 2 ? '#F4AFA6' : '#F6EBD6', [Math.sin(r) * 0.07, 0.07 + Math.cos(r) * 0.06, 0.04], [0, 0, -r]);
        }
        break;
      case 'print':
        B.add(BOX(0.2, 0.24, 0.008), '#F6EBD6', [0, 0.08, 0.06], [-0.25, 0, 0]);
        B.add(CIRC(0.04, 10), '#D8574A', [-0.03, 0.1, 0.068], [-0.25, 0, 0]);
        B.add(CIRC(0.03, 10), '#3E8FA0', [0.04, 0.06, 0.07], [-0.25, 0, 0]);
        break;
      case 'knit':
        B.add(CYL(0.004, 0.004, 0.24, 4), '#B58A5A', [-0.04, 0.05, 0.04], [0, 0, 0.9]);
        B.add(CYL(0.004, 0.004, 0.24, 4), '#B58A5A', [0.04, 0.05, 0.04], [0, 0, -0.9]);
        B.add(BOX(0.14, 0.08, 0.02), '#D4796B', [0, -0.02, 0.05]);
        break;
      case 'star':
        B.add(BOX(0.2, 0.2, 0.015), '#2E3561', [0, 0.06, 0.06], [-0.3, 0, 0.1]);
        for (const [x, y] of [
          [-0.05, 0.1],
          [0.04, 0.04],
          [0, 0.0],
          [0.06, 0.12],
          [-0.03, 0.03],
        ])
          B.add(OCT(0.012), '#F6D98A', [x, y + 0.04, 0.07]);
        break;
      case 'pipe':
        B.add(CYL(0.008, 0.008, 0.22, 5), '#8A93A6', [0, 0.03, 0.1], [Math.PI / 2 - 0.2, 0, 0]);
        B.add(SPH(0.035, 8, 6), '#F08A3A', [0, 0.05, 0.21]);
        G.glow = { c: '#FFE08A', pos: [0, 0.07, 0.21], r: 0.025 };
        break;
      case 'radio':
        B.add(BOX(0.15, 0.1, 0.06), '#5E6B7A', [0, 0, 0.04]);
        B.add(CYL(0.004, 0.004, 0.2, 4), '#3A3A48', [0.05, 0.14, 0.04], [0, 0, -0.2]);
        B.add(CIRC(0.025, 8), '#3A3A48', [-0.03, 0, 0.071]);
        G.glow = { c: '#9CF07A', pos: [0.045, 0.03, 0.072], r: 0.01 };
        break;
      case 'smoker':
        B.add(CYL(0.045, 0.045, 0.13, 10), '#B8C0C8', [0, 0, 0.04]);
        B.add(CONE(0.045, 0.06, 10), '#9AA2AA', [0, 0.095, 0.04]);
        B.add(BOX(0.04, 0.08, 0.06), '#8A5A34', [0, -0.02, -0.04]);
        break;
      case 'books':
        [
          ['#B8484A', 0],
          ['#3F7F5F', 1],
          ['#E4A844', 2],
          ['#4A548E', 3],
        ].forEach(([c, i]) => B.add(BOX(0.17 - i * 0.01, 0.045, 0.12), c, [i * 0.006, -0.02 + i * 0.047, 0.04], [0, i * 0.08 - 0.1, 0]));
        break;
      case 'ladle':
        B.add(CYL(0.008, 0.008, 0.26, 5), '#B8783A', [0, 0.1, 0.03], [0.15, 0, 0]);
        B.add(SPH(0.05, 8, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), '#B8783A', [0, 0.22, 0.06]);
        break;
      case 'loupe':
        B.add(CYL(0.01, 0.01, 0.1, 5), '#8A5A34', [0, -0.02, 0.03]);
        B.add(TOR(0.045, 0.009, 4, 12), '#C9A05C', [0, 0.07, 0.04]);
        B.add(CIRC(0.04, 10), '#DCEFF6', [0, 0.07, 0.041]);
        break;
      case 'lantern':
        B.add(CYL(0.004, 0.004, 0.08, 4), '#3A2A1E', [0, -0.04, 0.04]);
        B.add(CONE(0.06, 0.04, 6), '#6A4226', [0, -0.09, 0.04]);
        B.add(CYL(0.06, 0.06, 0.016, 6), '#6A4226', [0, -0.22, 0.04]);
        G.glow = { c: a || '#FFD36A', pos: [0, -0.155, 0.04], r: 0.05, lamp: 1 };
        break;
      case 'puppet':
        B.add(CYL(0.006, 0.006, 0.26, 4), '#8A5A34', [0, 0.12, 0.04]);
        B.add(SPH(0.05, 8, 6), '#2A2230', [0, 0.27, 0.05]);
        B.add(CONE(0.06, 0.1, 6), '#B8484A', [0, 0.2, 0.05]);
        B.add(SPH(0.012, 5, 4), '#FFFFFF', [0.02, 0.28, 0.095]);
        break;
      case 'spyglass':
        B.add(CYL(0.025, 0.035, 0.26, 10), '#C9A05C', [0, 0.02, 0.1], [Math.PI / 2 - 0.35, 0, 0]);
        B.add(TOR(0.034, 0.008, 4, 10), '#8A5A2E', [0, 0.05, 0.18], [-0.35, 0, 0]);
        break;
      case 'candle':
        B.add(CYL(0.03, 0.03, 0.12, 8), '#FBF4E3', [0, 0.06, 0.04]);
        B.add(CYL(0.06, 0.06, 0.012, 10), '#C9A05C', [0, 0, 0.04]);
        G.glow = { c: '#FFC45A', pos: [0, 0.145, 0.04], r: 0.022, lamp: 0.6, flame: 1 };
        break;
      case 'pick':
        B.add(CYL(0.01, 0.01, 0.36, 5), '#8A5A34', [0, 0.12, 0.02], [0.1, 0, 0]);
        B.add(CYL(0.012, 0.006, 0.26, 5), '#8A93A6', [0, 0.3, 0.04], [0, 0, Math.PI / 2]);
        break;
      case 'hammer':
        B.add(CYL(0.012, 0.012, 0.3, 5), '#8A5A34', [0, 0.12, 0.02]);
        B.add(BOX(0.15, 0.06, 0.06), '#5A5A66', [0, 0.28, 0.02]);
        break;
      case 'pole':
        B.add(CYL(0.008, 0.008, 0.8, 5), '#6A74B0', [0, 0.05, 0.03]);
        break;
      case 'box':
        B.add(BOX(0.22, 0.15, 0.18), '#B8783A', [0, 0.0, 0.08]);
        B.add(BOX(0.225, 0.03, 0.185), '#E4A844', [0, 0.03, 0.08]);
        break;
      case 'book':
        B.add(BOX(0.17, 0.21, 0.035), '#4A548E', [0, 0.04, 0.07], [-0.6, 0, 0]);
        B.add(BOX(0.15, 0.19, 0.02), '#F3E6C4', [0, 0.045, 0.08], [-0.6, 0, 0]);
        break;
      case 'quill':
        item(B, 'book', a, G);
        B.add(CONE(0.02, 0.22, 5), '#F3E6C4', [0.1, 0.12, 0.06], [0, 0, -0.4], [1, 1, 0.3]);
        break;
      case 'palette':
        B.add(CYL(0.12, 0.12, 0.012, 14), '#D9B77A', [0.02, 0.02, 0.08], [Math.PI / 2 - 0.4, 0, 0], [1, 1, 0.7]);
        [
          ['#B8484A', -0.05, 0.04],
          ['#3E8FA0', 0, 0.07],
          ['#E4A844', 0.06, 0.04],
          ['#6F8D5E', 0.02, -0.02],
        ].forEach(([c, x, y]) => B.add(SPH(0.016, 6, 4), c, [x + 0.02, y + 0.02, 0.11]));
        break;
      case 'basket':
        B.add(
          LATHE(
            [
              [0.06, 0],
              [0.1, 0.08],
              [0.105, 0.09],
            ],
            10,
          ),
          '#C98A42',
          [0, -0.08, 0.05],
        );
        B.add(TOR(0.08, 0.008, 4, 10, Math.PI), '#A86A2A', [0, 0, 0.05]);
        [
          ['#F4AFA6', -0.04],
          ['#F5CE55', 0],
          ['#8FB06A', 0.04],
        ].forEach(([c, x]) => B.add(SPH(0.03, 6, 5), c, [x, 0.01, 0.05]));
        break;
      case 'sprout':
        B.add(
          LATHE(
            [
              [0.05, 0],
              [0.06, 0.07],
              [0.065, 0.075],
            ],
            8,
          ),
          '#C9694B',
          [0, -0.04, 0.05],
        );
        B.add(SPH(0.035, 6, 4), '#8FB06A', [0.02, 0.08, 0.05], [0, 0, 0.5], [1.4, 0.5, 0.8]);
        break;
      case 'sunflower':
        B.add(CYL(0.008, 0.01, 0.5, 5), '#4E6B46', [0, 0.18, 0.04]);
        B.add(OCT(0.05), '#6F8D5E', [0.05, 0.1, 0.04], [0, 0, 0.8], [1, 0.5, 0.25]);
        B.add(CYL(0.05, 0.05, 0.025, 12), '#7A4A2A', [0, 0.44, 0.07], [Math.PI / 2 - 0.4, 0, 0]);
        for (let i = 0; i < 12; i++) {
          const an = (i / 12) * Math.PI * 2;
          B.add(
            OCT(0.04),
            i % 2 ? '#F5CE55' : '#E9B830',
            [Math.cos(an) * 0.08, 0.44 + Math.sin(an) * 0.08 * 0.92, 0.07 + Math.sin(an) * 0.03],
            [0.4, 0, an + Math.PI / 2],
            [0.45, 1.1, 0.2],
          );
        }
        break;
      case 'maple':
        B.add(CYL(0.006, 0.006, 0.16, 4), '#8A4A2A', [0, 0.07, 0.04]);
        for (let i = 0; i < 5; i++) {
          const an = -1.2 + i * 0.6;
          B.add(OCT(0.06), a || '#E07A4E', [Math.sin(an) * 0.06, 0.2 + Math.cos(an) * 0.06, 0.05], [0, 0, -an], [0.7, 1.3, 0.2]);
        }
        break;
      case 'mug':
        B.add(CYL(0.045, 0.04, 0.09, 10), '#E07A4E', [0, 0.0, 0.06]);
        B.add(TOR(0.025, 0.008, 4, 8), '#E07A4E', [0.05, 0, 0.06], [0, 0, 0]);
        B.add(CIRC(0.04, 10), '#6A3A1A', [0, 0.046, 0.06], [-Math.PI / 2, 0, 0]);
        break;
      case 'moonLamp':
        B.add(CYL(0.004, 0.004, 0.1, 4), '#6A4226', [0, -0.05, 0.05]);
        B.add(SPH(0.035, 8, 6), '#2E3561', [0.02, -0.15, 0.06]);
        G.glow = { c: '#F6E7B0', pos: [-0.015, -0.15, 0.05], r: 0.06, lamp: 1 };
        break;
      case 'jar':
        B.add(CYL(0.045, 0.045, 0.02, 10), '#8A5A34', [0, 0.08, 0.05]);
        G.glow = { c: a || '#8FD3C4', pos: [0, 0, 0.05], r: 0.065, lamp: 0.8 };
        break;
      case 'dipper':
        B.add(CYL(0.007, 0.007, 0.26, 5), '#B8783A', [0, 0.1, 0.05], [0.2, 0, 0]);
        for (let i = 0; i < 3; i++) B.add(TOR(0.03 - i * 0.004, 0.012, 5, 10), '#D9974A', [0, 0.22 + i * 0.025, 0.08], [Math.PI / 2, 0, 0]);
        B.add(SPH(0.018, 6, 5), '#F0B040', [0, 0.17, 0.08], [0, 0, 0], [1, 1.6, 1]);
        break;
      case 'openBook':
        for (const s of [-1, 1]) B.add(BOX(0.12, 0.008, 0.16), '#FBF4E3', [s * 0.058, 0.04 + 0.0, 0.08], [0, 0, s * 0.25]);
        B.add(BOX(0.25, 0.006, 0.17), '#8A5A3A', [0, 0.022, 0.08]);
        break;
      case 'hourglass':
        for (const s of [-1, 1]) {
          B.add(CYL(0.06, 0.06, 0.015, 8), '#8A5A34', [0, 0.12 + s * 0.1, 0.07]);
          B.add(CONE(0.05, 0.09, 8), '#DCEFF6', [0, 0.12 + s * 0.045, 0.07], [s > 0 ? 0 : Math.PI, 0, 0]);
        }
        B.add(CONE(0.03, 0.04, 8), '#E4A844', [0, 0.05, 0.07], [Math.PI, 0, 0]);
        break;
      case 'masks':
        B.add(CYL(0.006, 0.006, 0.2, 4), '#8A5A34', [0, 0.08, 0.04], [0, 0, -0.3]);
        B.add(SPH(0.055, 8, 6), '#FBF4E3', [0.02, 0.22, 0.07], [0, 0, 0], [1, 1.15, 0.35]);
        B.add(SPH(0.05, 8, 6), '#F5CE55', [0.1, 0.19, 0.06], [0, 0, 0.3], [1, 1.15, 0.35]);
        break;
      case 'crystal':
        B.add(OCT(0.06), a || '#8FD3C4', [0, 0.1, 0.06], [0, 0.4, 0], [0.7, 1.6, 0.7]);
        G.glow = { c: a || '#8FD3C4', pos: [0, 0.1, 0.06], r: 0.001, lamp: 0.7 };
        break;
      case 'kite':
        B.add(CYL(0.003, 0.003, 0.7, 3), '#FBF4E3', [0.04, 0.3, 0.02], [0, 0, -0.2]);
        B.add(OCT(0.13), a || '#F4AFA6', [0.12, 0.68, 0.0], [0, 0, 0.2], [0.75, 1.1, 0.12]);
        B.add(BOX(0.012, 0.25, 0.012), '#FBF4E3', [0.12, 0.68, 0.015], [0, 0, 0.2]);
        break;
      case 'brush':
        B.add(CYL(0.012, 0.012, 0.5, 5), '#8A5A34', [0, 0.18, 0.03], [0, 0, -0.2]);
        B.add(CONE(0.03, 0.1, 6), '#B8484A', [0.09, 0.46, 0.03], [0, 0, -0.2]);
        break;
      default:
        B.add(BOX(0.08, 0.08, 0.08), a || '#B8783A', [0, 0, 0.04]);
    }
  }

  /* ══ el muñeco: esqueleto + piezas ══ */
  function human(S) {
    const k = S.k || 1,
      child = k < 0.9,
      HS = window.COLMENA_ADULTO ? (child ? 1.14 : 1.02) : child ? 1.36 : 1.27,
      tall = S.tall ? 1 : 0,
      old = S.old ? 1 : 0,
      tw = S.tw || 1;
    const root = new T3.Group(),
      sc = grp(root);
    /* en la versión adulta, algo más grandes: los muebles se hicieron para muñecos cabezones y quedaban enormes a su lado */
    sc.scale.setScalar(U0 * k * (window.COLMENA_ADULTO ? 1.3 : 1));
    const lieA = grp(sc),
      lieB = grp(lieA),
      lieC = grp(lieB),
      body = grp(lieC);
    const hipY = 0.98 + tall * 0.05 - old * 0.02,
      skin = S.skin || '#E7B994',
      skD = shd(skin, 0.9),
      top = S.top || '#F2EADB',
      bot = S.bottom || '#5B4A3A',
      shoe = S.shoes || '#6A4A30',
      sleeve = S.sleeve || top;
    const R = { root, sc, body, lieA, lieB, lieC, S, hipY, k, HS };
    /* cadera, pantalón, falda, túnica */
    const BP = new Bk();
    const legC = S.overall || bot;
    BP.add(
      LATHE(
        [
          [0, hipY - 0.15],
          [0.17 * tw, hipY - 0.15],
          [0.2 * tw, hipY - 0.07],
          [0.207 * tw, hipY + 0.06],
          [0.197 * tw, hipY + 0.19],
          [0, hipY + 0.21],
        ],
        12,
      ),
      legC,
    );
    if (S.tunic)
      BP.add(
        LATHE(
          [
            [0.2 * tw, hipY + 0.21],
            [0.212 * tw, hipY + 0.05],
            [0.232 * tw, hipY - 0.1],
            [0.236 * tw, hipY - 0.14],
          ],
          14,
        ),
        top,
      );
    if (S.skirt)
      BP.add(
        LATHE(
          [
            [0.2 * tw, hipY + 0.2],
            [0.225 * tw, hipY + 0.04],
            [0.3 * tw, hipY - 0.38],
            [0.315 * tw, hipY - 0.44],
          ],
          14,
        ),
        S.skirt,
      );
    if (S.apron)
      BP.add(
        LATHE(
          [
            [0.235 * tw, hipY + 0.17],
            [0.255 * tw, hipY],
            [0.31 * tw, hipY - (S.skirt ? 0.36 : 0.3)],
          ],
          8,
          -0.85,
          1.7,
        ),
        S.apron,
      );
    const beltC = S.belt || (S.tunic ? '#8A5A34' : null);
    if (beltC) {
      BP.add(TOR(0.205 * tw, 0.02, 5, 16), beltC, [0, hipY + 0.12, 0], [Math.PI / 2, 0, 0]);
      BP.add(BOX(0.05, 0.04, 0.02), '#E4A844', [0, hipY + 0.12, 0.215 * tw]);
    }
    /* la pelvis es un hueso propio: bascula y gira al andar sin arrastrar al pecho */
    const pel = grp(body, [0, hipY, 0]);
    R.pel = pel;
    R.pelvis = BP.mesh(pel);
    R.pelvis.position.y = -hipY;
    R.hipW = 0.095 * tw;
    /* piernas: cadera, rodilla y tobillo */
    const leg = (s) => {
      const hip = grp(pel, [s * 0.095 * tw, 0, 0]),
        A = new Bk();
      A.add(CYL(0.078, 0.066, 0.46, 9), s < 0 ? shd(legC, 0.92) : legC, [0, -0.23, 0]);
      A.mesh(hip);
      const knee = grp(hip, [0, -0.46, 0]),
        B = new Bk();
      if (S.boots) {
        B.add(CYL(0.066, 0.062, 0.2, 9), s < 0 ? shd(legC, 0.92) : legC, [0, -0.1, 0]);
        B.add(CYL(0.072, 0.076, 0.25, 9), shoe, [0, -0.32, 0]);
        B.add(TOR(0.074, 0.018, 5, 10), shd(shoe, 0.75), [0, -0.2, 0], [Math.PI / 2, 0, 0]);
      } else {
        B.add(CYL(0.066, 0.058, 0.4, 9), s < 0 ? shd(legC, 0.92) : legC, [0, -0.2, 0]);
        B.add(CYL(0.05, 0.052, 0.06, 8), skD, [0, -0.42, 0]);
      }
      B.mesh(knee);
      const foot = grp(knee, [0, -ANK, 0]),
        F = new Bk();
      F.add(SPH(0.08, 9, 7), shoe, [0, -0.03, 0.05], [0, 0, 0], [0.95, 0.6, 1.55]);
      F.add(BOX(0.14, 0.024, 0.25), shd(shoe, 0.55), [0, -0.072, 0.05]);
      F.mesh(foot);
      return { hip, knee, foot };
    };
    R.L = leg(1);
    R.Rl = leg(-1);
    /* torso */
    const chest = grp(body, [0, hipY + 0.18, 0]);
    R.chest = chest;
    if (tall) chest.scale.y = 1.08;
    const BC = new Bk();
    BC.add(
      LATHE(
        [
          [0, 0],
          [0.19 * tw, 0],
          [0.2 * tw, 0.12],
          [0.215 * tw, 0.27],
          [0.2 * tw, 0.38],
          [0.12, 0.45],
          [0, 0.47],
        ],
        12,
      ),
      top,
    );
    if (S.overall) {
      BC.add(BOX(0.26 * tw, 0.2, 0.03), S.overall, [0, 0.1, 0.19 * tw], [-0.06, 0, 0]);
      for (const s of [-1, 1]) {
        BC.add(BOX(0.035, 0.3, 0.02), S.overall, [s * 0.1, 0.26, 0.07], [-0.15, 0, s * 0.1]);
        BC.add(CYL(0.016, 0.016, 0.01, 8), '#E4A844', [s * 0.1, 0.19, 0.205], [Math.PI / 2, 0, 0]);
      }
    }
    if (S.apron) {
      BC.add(BOX(0.22 * tw, 0.22, 0.02), S.apron, [0, 0.1, 0.205 * tw], [-0.08, 0, 0]);
      for (const s of [-1, 1]) BC.add(BOX(0.025, 0.28, 0.015), S.apron, [s * 0.09, 0.3, 0.08], [-0.2, 0, s * 0.1]);
    }
    if (S.vest)
      BC.add(
        LATHE(
          [
            [0.205 * tw, -0.02],
            [0.214 * tw, 0.12],
            [0.229 * tw, 0.27],
            [0.214 * tw, 0.38],
            [0.14, 0.44],
          ],
          12,
          0.32,
          Math.PI * 2 - 0.64,
        ),
        S.vest,
      );
    if (S.buttons)
      for (let i = 0; i < 3; i++) BC.add(CYL(0.012, 0.012, 0.01, 6), S.buttons, [0, 0.08 + i * 0.09, 0.215 * tw], [Math.PI / 2, 0, 0]);
    if (S.patches) for (const [x, y, c] of S.patches) BC.add(BOX(0.05, 0.04, 0.01), c, [x, y, 0.214 * tw]);
    if (S.dots) for (const [x, y, c] of S.dots) BC.add(CIRC(0.016, 6), c, [x, y, 0.217 * tw]);
    if (S.strap) BC.add(BOX(0.03, 0.52, 0.02), S.strap, [0, 0.22, 0.205 * tw], [0, 0, 0.75]);
    if (S.collar) BC.add(TOR(0.1, 0.025, 5, 12), S.collar, [0, 0.43, 0.02], [Math.PI / 2 - 0.3, 0, 0]);
    if (S.scarf) {
      BC.add(TOR(0.11, 0.04, 6, 14), S.scarf, [0, 0.45, 0.0], [Math.PI / 2 - 0.1, 0, 0]);
    }
    if (S.pack) {
      BC.add(BOX(0.26, 0.3, 0.13), S.pack, [0, 0.22, -0.25]);
      BC.add(BOX(0.27, 0.04, 0.14), shd(S.pack, 0.75), [0, 0.3, -0.25]);
      if (S.bedroll) BC.add(CYL(0.065, 0.065, 0.3, 8), S.bedroll, [0, 0.42, -0.26], [0, 0, Math.PI / 2]);
      for (const s of [-1, 1]) BC.add(BOX(0.03, 0.36, 0.03), shd(S.pack, 0.7), [s * 0.12, 0.25, -0.15], [0.25, 0, 0]);
    }
    /* las costillas: el torso y lo que lleva cosido, que se hinchan al respirar sin mover brazos ni cabeza */
    const rib = grp(chest);
    R.rib = rib;
    R.torso = BC.mesh(rib);
    if (S.satchel) {
      const B = new Bk();
      B.add(BOX(0.07, 0.17, 0.2), S.satchel, [0.25 * tw, -0.1, -0.02], [0, 0, -0.1]);
      B.add(BOX(0.075, 0.05, 0.205), shd(S.satchel, 0.75), [0.252 * tw, -0.03, -0.02], [0, 0, -0.1]);
      B.mesh(chest);
    }
    if (S.jar) {
      const j = new T3.Mesh(SPH(0.05, 10, 8), basic('#EBF5F8'));
      j.position.set(0.27 * tw, -0.17, 0.1);
      j.scale.set(1, 1.25, 1);
      chest.add(j);
      R.jar = j;
    }
    if (S.scarf) {
      const tail = grp(chest, [0.07, 0.42, 0.1]),
        B = new Bk();
      B.add(BOX(0.07, 0.24, 0.03), S.scarf, [0, -0.12, 0]);
      B.add(BOX(0.075, 0.03, 0.035), shd(S.scarf, 0.85), [0, -0.22, 0]);
      B.mesh(tail);
      R.scarfTail = tail;
    }
    if (S.back) {
      const cg = grp(chest, [0, 0.44, -0.06]),
        B = new Bk();
      R.cape = cg;
      const cape = (c, lin, len = 0) => {
        const L = 0.66 + len * 0.035,
          g = CYL(0.215, 0.34, L, 14, true, Math.PI / 2 - 0.12, Math.PI + 0.24);
        B.add(g, c, [0, -L / 2, 0]);
        if (lin) B.add(g, lin, [0, -L / 2, 0.006], [0, 0, 0], [0.96, 1, 0.96]);
        return L;
      };
      for (const bk of S.back) {
        const [k, a, b, c] = bk;
        if (k === 'cape') cape(a, b, c || 0);
        else if (k === 'leafCape') {
          const L = cape(a, null, 4);
          for (let i = 0; i < 7; i++) {
            const an = Math.PI / 2 + 0.1 + i * 0.47;
            B.add(OCT(0.07), i % 2 ? b : a, [Math.sin(an) * 0.34, -L + 0.02, Math.cos(an) * 0.34], [0, an, 0], [0.5, 1.2, 0.18]);
          }
        } else if (k === 'stars') {
          const L = cape(a, b, 0);
          for (let i = 0; i < 9; i++) {
            const an = Math.PI / 2 + 0.25 + i * 0.3,
              y = -0.12 - ((i * 37) % 5) * 0.11,
              r = 0.215 + 0.125 * (-y / L);
            B.add(OCT(0.018), '#F6D98A', [Math.sin(an) * (r + 0.008), y, Math.cos(an) * (r + 0.008)]);
          }
        } else if (k === 'ember') {
          const L = cape('#8C3A2A', '#E0584A', 2);
          for (let i = 0; i < 6; i++) {
            const an = Math.PI / 2 + 0.3 + i * 0.45;
            B.add(OCT(0.014), '#F5A83A', [Math.sin(an) * 0.3, -L * 0.7 + (i % 3) * 0.12, Math.cos(an) * 0.3]);
          }
        } else if (k === 'combCape') {
          const L = cape(a || '#E4A844', '#C47A2C', 2);
          for (let i = 0; i < 8; i++) {
            const an = Math.PI / 2 + 0.35 + i * 0.33,
              y = -0.15 - (i % 3) * 0.15,
              r = 0.215 + 0.125 * (-y / L);
            B.add(CYL(0.035, 0.035, 0.01, 6), '#C47A2C', [Math.sin(an) * (r + 0.006), y, Math.cos(an) * (r + 0.006)], [Math.PI / 2, an, 0]);
          }
        } else if (k === 'quiverPaper') {
          cape('#FBF4E3', '#EFDDB6', 4);
          for (let i = 0; i < 3; i++)
            B.add(BOX(0.12, 0.16, 0.005), '#FBF8EE', [-0.18 + i * 0.06, -0.25 - i * 0.08, -0.32], [0.2, 0.3, 0.3 - i * 0.2]);
        } else if (k === 'tails') {
          for (const s of [-1, 1]) B.add(BOX(0.12, 0.36, 0.02), a, [s * 0.08, -0.62, -0.2], [0.18, 0, s * 0.08]);
        } else if (k === 'cloud') {
          for (const [x, y, z, r] of [
            [0, -0.05, -0.28, 0.12],
            [-0.12, -0.18, -0.26, 0.1],
            [0.12, -0.2, -0.26, 0.11],
            [0, -0.32, -0.25, 0.12],
            [-0.09, -0.44, -0.22, 0.08],
            [0.1, -0.42, -0.22, 0.09],
          ])
            B.add(SPH(r, 9, 7), a || '#FBF8F2', [x, y, z]);
        } else if (k === 'seaweed') {
          for (let i = 0; i < 5; i++)
            B.add(
              CONE(0.035, 0.7 - i * 0.06, 4),
              i % 2 ? '#3F7F5F' : '#6F8D5E',
              [-0.12 + i * 0.06, -0.32, -0.22 - ((i + 1) % 2) * 0.02],
              [Math.PI, 0, (i - 2) * 0.08],
              [1, 1, 0.35],
            );
        } else if (k === 'mothWings') {
          for (const s of [-1, 1]) {
            B.add(SPH(0.28, 10, 7), a, [s * 0.24, -0.02, -0.24], [0, s * 0.4, s * -0.5], [0.85, 0.6, 0.06]);
            B.add(SPH(0.07, 8, 6), b || '#F6D98A', [s * 0.3, 0.02, -0.255], [0, s * 0.4, 0], [1, 1, 0.1]);
            B.add(SPH(0.16, 9, 6), shd(a, 0.92), [s * 0.14, -0.3, -0.23], [0, s * 0.4, s * 0.4], [0.7, 0.6, 0.06]);
          }
        } else if (k === 'wings') R.wings = 1;
      }
      const cm = B.mesh(cg);
      if (cm && !S.back.some((b) => b[0] === 'cloud' || b[0] === 'mothWings')) R.cloth = tela(cm);
      if (R.wings) {
        const W = new Bk();
        for (const s of [-1, 1])
          for (const [r, l, w, y] of [
            [-0.9, 0.34, 0.12, 0.0],
            [-0.45, 0.27, 0.1, -0.12],
            [-1.4, 0.2, 0.07, 0.06],
          ])
            W.add(
              SPH(0.5, 8, 6),
              '#FFFFFF',
              [s * (l * 0.45 + 0.04), y + 0.05, -0.27],
              [0, 0, s * (r + Math.PI / 2)],
              [l, w, 0.02].map((v) => v * 2),
            );
        const wm = new T3.Mesh(W.geo(), WINGM());
        cg.add(wm);
        R.wingM = wm;
      }
    }
    if (S.torso)
      for (const [k, a, b] of S.torso) {
        if (k === 'stars') {
          const B = new Bk();
          for (const [x, y] of [
            [-0.06, 0.3],
            [0.08, 0.22],
            [0.02, 0.08],
            [0.1, 0.06],
            [-0.1, 0.14],
          ])
            B.add(OCT(0.018), a || '#F6D98A', [x, y, 0.218 * tw]);
          B.mesh(rib);
        } else if (k === 'stripes' || k === 'bands') {
          const B = new Bk(),
            cols = Array.isArray(a) ? a : [a],
            n = b || 3;
          for (let i = 0; i < n; i++) {
            const y = 0.06 + i * (0.33 / n);
            B.add(
              LATHE(
                [
                  [0.207 * tw, y],
                  [0.215 * tw + y * 0.05, y + 0.05],
                ],
                12,
              ),
              cols[i % cols.length],
            );
          }
          B.mesh(rib);
        } else if (k === 'chain') {
          const B = new Bk();
          B.add(TOR(0.03, 0.006, 4, 8), a || '#E4A844', [0.1, -0.02, 0.2]);
          B.add(CYL(0.004, 0.004, 0.12, 3), a || '#E4A844', [0.05, 0, 0.21], [0, 0, 1.3]);
          B.mesh(rib);
        } else if (k === 'tags') {
          const B = new Bk();
          for (const [x, y, c] of [
            [-0.07, 0.25, '#F3E6C4'],
            [0.09, 0.1, '#FBF4E3'],
            [0.02, 0.03, '#EFD9A8'],
          ])
            B.add(BOX(0.04, 0.05, 0.006), c, [x, y, 0.219 * tw], [0, 0, 0.2]);
          B.mesh(rib);
        }
      }
    if (S.neck)
      for (const [k, a, b] of S.neck) {
        const B = new Bk();
        if (k === 'shawl') {
          B.add(
            LATHE(
              [
                [0.13, 0.47],
                [0.23, 0.36],
                [0.25, 0.28],
              ],
              14,
            ),
            a,
          );
          B.add(CONE(0.09, 0.16, 4), a, [0, 0.25, 0.21], [Math.PI, 0, 0], [1, 1, 0.3]);
        } else if (k === 'necklace') {
          for (let i = 0; i < 7; i++) {
            const an = -0.9 + i * 0.3;
            B.add(SPH(0.014, 5, 4), a || '#E4A844', [
              Math.sin(an) * 0.15,
              0.42 - Math.cos(an * 1.2) * 0.04 - 0.04,
              Math.cos(an) * 0.15 + 0.03,
            ]);
          }
          B.add(CYL(0.03, 0.03, 0.012, 6), b || '#C47A2C', [0, 0.3, 0.2], [Math.PI / 2, 0, 0]);
        }
        B.mesh(rib);
      }
    if (S.cape) {
      const cg = grp(chest, [0, 0.44, -0.05]);
      const g = new T3.CylinderGeometry(0.21, 0.33, 0.74, sg(14), 5, true, Math.PI / 2 - 0.15, Math.PI + 0.3);
      g.translate(0, -0.37, 0);
      g.userData.shared = true;
      const m = new T3.Mesh(g, capeMat(S.cape, S.capePattern));
      cg.add(m);
      R.cape = cg;
      R.capeMesh = m;
      R.cloth = tela(m);
      if (S.capeStars) {
        const B = new Bk();
        for (let i = 0; i < 9; i++) {
          const a = Math.PI / 2 + 0.1 + i * 0.33,
            y = -0.12 - ((i * 37) % 5) * 0.12,
            r = 0.2 + 0.16 * (-y / 0.78);
          B.add(OCT(0.016), '#F6D98A', [Math.sin(a) * (r + 0.005), y, Math.cos(a) * (r + 0.005)]);
        }
        R.cloth2 = tela(B.mesh(cg), 0.74);
      }
    }
    /* brazos */
    const arm = (s) => {
      const sh = grp(chest, [s * 0.225 * tw, 0.37, 0]);
      const A = new Bk();
      A.add(SPH(0.064, 9, 7), sleeve, [0, -0.03, 0]);
      A.add(CYL(0.058, 0.052, 0.27, 9), sleeve, [0, -0.15, 0]);
      A.mesh(sh);
      const el = grp(sh, [0, -0.28, 0]),
        B = new Bk();
      B.add(CYL(0.05, 0.044, 0.25, 9), sleeve === skin ? skin : sleeve, [0, -0.12, 0]);
      if (sleeve !== skin) B.add(TOR(0.047, 0.012, 5, 9), shd(sleeve, 0.85), [0, -0.235, 0], [Math.PI / 2, 0, 0]);
      B.add(SPH(0.05, 8, 7), S.inkHands || skin, [0, -0.29, 0.005], [0, 0, 0], [0.78, 1.15, 0.6]);
      B.add(SPH(0.02, 5, 4), S.inkHands || skin, [s * -0.03, -0.27, 0.03]);
      B.mesh(el);
      const hand = grp(el, [0, -0.29, 0]),
        it = grp(hand);
      return { sh, el, hand, it };
    };
    R.AL = arm(1);
    R.AR = arm(-1);
    /* cuello y cabeza */
    const neck = grp(chest, [0, 0.45, 0]);
    const BN = new Bk();
    BN.add(CYL(0.05, 0.055, 0.12, 8), skD, [0, 0.04, 0]);
    BN.mesh(neck);
    const head = grp(neck, [0, 0.1 + 0.16 * HS, 0]);
    head.scale.setScalar(HS);
    R.head = head;
    R.neck = neck;
    const BH = new Bk(),
      ctx = { accent: S.accent };
    const E = { x: 0.072, y: -0.005, z: 0.165 };
    const h = S.hat,
      helmet = h && (h[0] === 'helmet' || (h[0] === 'both' && h[1].some((x) => x[0] === 'helmet')));
    if (!helmet) {
      BH.add(SPH(0.2, 16, 12), skin, [0, 0, 0], [0, 0, 0], [0.93, 1.05, 0.98]);
      BH.add(SPH(0.13, 12, 9), skin, [0, -0.08, 0.05], [0, 0, 0], [1, 0.85, 1]);
      for (const s of [-1, 1]) BH.add(SPH(0.04, 7, 6), skD, [s * 0.18, -0.015, -0.01], [0, 0, 0], [0.5, 1, 0.8]);
      BH.add(SPH(0.024, 8, 6), skD, [0, -0.055, 0.19], [0, 0, 0], [1, 0.85, 1.1]);
      /* ojos: blanco, iris, pupila y brillo */
      for (const s of [-1, 1]) {
        const x = s * E.x;
        BH.add(SPH(0.036, 10, 8), '#FBF8F2', [x, E.y, E.z], [0, 0, 0], [1, 1.15, 0.55]);
        BH.add(SPH(0.024, 9, 7), S.eye || '#5A3A22', [x, E.y - 0.003, E.z + 0.012], [0, 0, 0], [1, 1.1, 0.5]);
        BH.add(SPH(0.012, 6, 5), '#120806', [x, E.y - 0.003, E.z + 0.022], [0, 0, 0], [1, 1, 0.4]);
        BH.add(SPH(0.007, 5, 4), '#FFFFFF', [x - 0.01, E.y + 0.012, E.z + 0.026]);
        BH.add(BOX(0.068, 0.007, 0.01), '#2A1A12', [x, E.y + 0.03, E.z + 0.012], [0, 0, s * -0.05]);
        if (S.hairS !== 'calvo' || S.brows)
          BH.add(
            BOX(0.075, 0.016, 0.016),
            S.brows || S.hair || '#3A2A20',
            [x + s * 0.004, E.y + 0.068, E.z + 0.002],
            [0, 0, s * (S.girl ? 0.12 : 0.06)],
          );
        else BH.add(BOX(0.07, 0.012, 0.014), S.hair || '#AAA', [x, E.y + 0.066, E.z], [0, 0, 0]);
      }
      if (S.hair && !S.hideHair) {
        const HW = new Bk();
        hair(BH, S.hairS, S.hair, { ribbon: S.ribbon, tufts: S.tufts, sw: HW });
        if (HW.p.length) {
          const pv = S.hairS === 'coleta' ? [0, 0.04, -0.22] : S.hairS === 'trenzas' ? [0, -0.05, 0.02] : [0, -0.02, -0.03],
            hg = grp(head, pv);
          HW.mesh(hg).position.set(-pv[0], -pv[1], -pv[2]);
          R.hairSw = hg;
          R.hairK = S.hairS === 'trenzas' ? 0.45 : S.hairS === 'coleta' ? 1.3 : S.hairS === 'melena' ? 0.8 : 1;
        }
      }
      fx(BH, S.fx, E);
    }
    hat(BH, h, ctx);
    R.headM = BH.mesh(head);
    if (ctx.glow) {
      const gm = new T3.Mesh(SPH(Math.max(0.001, ctx.glow.r), 8, 6), basic(ctx.glow.c));
      gm.position.set(...ctx.glow.pos);
      head.add(gm);
      if (ctx.glow.flame) R.flame = gm;
      if (ctx.glow.lamp || ctx.glow.flame) {
        const sp = glowSprite(ctx.glow.c, 0.45 * (ctx.glow.lamp || 0.7));
        sp.position.set(...ctx.glow.pos);
        head.add(sp);
      }
    }
    if (!helmet) {
      /* párpados (uno para los dos ojos): se cierran al parpadear */
      const BL = new Bk();
      for (const s of [-1, 1])
        BL.add(SPH(0.039, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), skin, [s * E.x, 0, 0], [-0.2, 0, 0], [1, 1.15, 0.62]);
      const lids = BL.mesh(head);
      lids.position.set(0, E.y + 0.001, E.z);
      lids.scale.y = 0.12;
      R.lids = lids;
      /* boca: sonrisa o abierta */
      R.mSmile = TOR(0.026, 0.0065, 5, 10, Math.PI);
      R.mOpen = SPH(0.024, 8, 6);
      const mo = new T3.Mesh(R.mSmile, basic('#8A3A34'));
      mo.position.set(0, -0.112, 0.168);
      mo.rotation.set(0, 0, Math.PI);
      head.add(mo);
      R.mouth = mo;
    }
    if (ctx.veil) {
      const v = new T3.Mesh(CYL(0.31, 0.33, 0.36, 16, true), VEILM());
      v.position.set(0, -0.06, 0);
      head.add(v);
    }
    /* lo que lleva en la mano */
    R.hold = S.hold;
    R.twoHands = S.twoHands;
    if (S.hold) {
      const it = R.AR.it,
        BI = new Bk(),
        G = {};
      item(BI, S.hold[0], S.hold[1], G);
      BI.mesh(it);
      if (G.glow) {
        const gm = new T3.Mesh(SPH(G.glow.r, 8, 6), basic(G.glow.c));
        gm.position.set(...G.glow.pos);
        it.add(gm);
        R.glow = gm;
        if (G.glow.lamp) {
          const sp = glowSprite(G.glow.c, 0.5 * G.glow.lamp);
          sp.position.set(...G.glow.pos);
          it.add(sp);
        }
      }
    }
    /* pose de partida y estado de animación */
    const lado = Math.random() < 0.5 ? -1 : 1;
    R.st = {
      blink: 2 + Math.random() * 3,
      bt: 0,
      head: 0,
      q: new Float32Array(20) /* muelles: valor y velocidad por parejas */,
      ph: 0 /* fase propia del paso */,
      oph: NaN,
      px: NaN,
      pz: 0,
      yaw: 0,
      v: 0 /* velocidad real, en metros de maqueta por segundo */,
      w1: 0,
      wk: 0 /* cuánto anda (0..1), con inercia */,
      rk: 0 /* cuánto trota */,
      sp: 0 /* cuánto corre */,
      by: NaN,
      side: lado /* pierna de apoyo en reposo */,
      sh1: lado,
      sh: lado,
      sideT: 3 + Math.random() * 6,
      gT: 1 + Math.random() * 3,
      gy: 0,
      gx: 0,
      gz: 0,
      hy1: 0,
      hx1: 0,
      hz1: 0,
      hy: 0,
      hx: 0,
      hz: 0,
      look: 0,
      cp: 0,
      ck: NaN,
    };
    if (S.pose === 'sit') {
      const seat = (S.seat || 26) + 4;
      R.sitY = (seat * 1.14) / U0 - hipY * 1;
    }
    if (S.pose === 'lie') {
      lieA.position.y = 30 / (U0 * k);
      lieA.rotation.z = -0.62;
      lieB.rotation.y = Math.PI / 2;
      lieC.rotation.x = -Math.PI / 2;
      body.position.y = -hipY;
    }
    return R;
  }
  let WM = null;
  const WINGM = () =>
    WM ||
    (WM = Object.assign(
      new T3.MeshLambertMaterial({ color: '#EEF6FA', transparent: true, opacity: 0.6, depthWrite: false, side: T3.DoubleSide }),
      { userData: SH },
    ));
  let VM = null;
  const VEILM = () =>
    VM ||
    (VM = Object.assign(
      new T3.MeshBasicMaterial({ color: '#F6F2E8', transparent: true, opacity: 0.32, depthWrite: false, side: T3.DoubleSide }),
      { userData: SH },
    ));
  let GT = null;
  function glowTex() {
    if (GT) return GT;
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d'),
      r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.35, 'rgba(255,255,255,.45)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
    GT = new T3.CanvasTexture(c);
    GT.userData.shared = true;
    return GT;
  }
  function glowSprite(c, s) {
    const m = Object.assign(
      new T3.SpriteMaterial({
        map: glowTex(),
        color: c,
        transparent: true,
        opacity: 0.55,
        blending: T3.AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
      { userData: SH },
    );
    const sp = new T3.Sprite(m);
    sp.scale.setScalar(s);
    return sp;
  }
  /* la capa del jugador: tela con su diseño (rayas, lunares o panal) */
  const CAPES = {};
  function capeMat(col, pat) {
    const key = col + pat;
    if (CAPES[key]) return CAPES[key];
    const n = 128,
      c = document.createElement('canvas');
    c.width = c.height = n;
    const g = c.getContext('2d');
    g.fillStyle = col;
    g.fillRect(0, 0, n, n);
    const cc = mix(col, '#FFFFFF', 0.28);
    g.strokeStyle = cc;
    g.fillStyle = cc;
    if (pat === 'rayas') {
      g.lineWidth = 7;
      for (let i = -n; i < n * 2; i += 22) {
        g.beginPath();
        g.moveTo(i, 0);
        g.lineTo(i + n * 0.6, n);
        g.stroke();
      }
    } else if (pat === 'lunares') {
      for (let y = 8; y < n; y += 20)
        for (let x = (y / 20) % 2 ? 18 : 8; x < n; x += 20) {
          g.beginPath();
          g.arc(x, y, 4, 0, Math.PI * 2);
          g.fill();
        }
    } else if (pat === 'panal') {
      g.lineWidth = 2;
      const r = 9;
      for (let y = 0, row = 0; y < n + r; y += r * 1.5, row++)
        for (let x = row % 2 ? r * 0.87 : 0; x < n + r; x += r * 1.74) {
          g.beginPath();
          for (let k = 0; k < 7; k++) {
            const a = Math.PI / 6 + (k * Math.PI) / 3;
            g[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r);
          }
          g.stroke();
        }
    }
    g.fillStyle = 'rgba(0,0,0,.12)';
    g.fillRect(0, n - 6, n, 6);
    const t = new T3.CanvasTexture(c);
    t.colorSpace = T3.SRGBColorSpace;
    t.wrapS = t.wrapT = T3.RepeatWrapping;
    t.repeat.set(2, 1);
    t.userData.shared = true;
    return (CAPES[key] = Object.assign(new T3.MeshLambertMaterial({ map: t, side: T3.DoubleSide }), { userData: SH }));
  }

  /* ══ animación: andar, trotar, frenar, reposo vivo, hablar, saludar, tela y pelo con inercia, parpadear ══
     Nada de esto crea objetos por fotograma: el estado vive en R.st y los muelles en R.st.q. */
  const TAU = Math.PI * 2,
    LEG1 = 0.46 /* muslo */,
    ANK = 0.44 /* de la rodilla al tobillo */,
    SOLE = 0.084 /* del tobillo a la suela */,
    /* a partir de qué velocidad (metros de maqueta por segundo) se pasa de andar a trotar y de trotar a correr */
    TROTE = [2.1, 3.1],
    CARRERA = [4.4, 6];
  const L = (a, b, t) => a + (b - a) * t;
  const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
  const sst = (a, b, x) => {
    x = cl((x - a) / (b - a), 0, 1);
    return x * x * (3 - 2 * x);
  };
  /* (las claves de cadera del tramo de apoyo están calculadas para que el tobillo quede clavado en el suelo)
     el paso, en 12 claves por zancada (0 = el talón toca el suelo, ~0.6 = despega la punta):
     cadera (-1 delante, +1 detrás), rodilla (radianes) e inclinación del pie respecto al suelo (+ = punta abajo) */
  const W_HIP = [-1, -0.9, -0.56, -0.14, 0.22, 0.51, 0.66, 0.62, 0.28, -0.3, -0.8, -1.03],
    W_KNEE = [0.08, 0.3, 0.26, 0.14, 0.08, 0.1, 0.3, 0.75, 1.15, 1.05, 0.55, 0.1],
    W_FOOT = [-0.32, -0.05, 0, 0, 0, 0.12, 0.5, 0.95, 0.8, 0.3, -0.1, -0.3],
    /* el trote: apoyo más corto, rodilla que recoge más y un instante en el aire */
    R_HIP = [-0.75, -0.52, -0.13, 0.36, 0.78, 0.95, 0.62, 0.1, -0.4, -0.8, -0.98, -0.9],
    R_KNEE = [0.3, 0.6, 0.6, 0.42, 0.4, 0.95, 1.55, 1.85, 1.7, 1.2, 0.65, 0.3],
    R_FOOT = [-0.05, 0, 0.1, 0.5, 1, 1.25, 1.2, 1, 0.6, 0.25, 0, -0.08];
  /* curva cerrada y suave por las claves (Catmull-Rom) */
  const cyc = (K, u) => {
    const n = K.length;
    u = (u - Math.floor(u)) * n;
    const i = Math.floor(u) % n,
      f = u - Math.floor(u),
      p0 = K[(i + n - 1) % n],
      p1 = K[i],
      p2 = K[(i + 1) % n],
      p3 = K[(i + 2) % n];
    return p1 + 0.5 * f * (p2 - p0 + f * (2 * p0 - 5 * p1 + 4 * p2 - p3 + f * (3 * (p1 - p2) + p3 - p0)));
  };
  /* muelle amortiguado: q[i] = valor, q[i+1] = velocidad */
  const spr = (q, i, tg, k, c, dt) => {
    q[i + 1] += ((tg - q[i]) * k - q[i + 1] * c) * dt;
    q[i] += q[i + 1] * dt;
    return q[i];
  };
  /* una pierna: coloca cadera, rodilla y tobillo y devuelve la altura del punto más bajo del pie respecto a la cadera.
     sg = lado (+1 izquierda), u = fase del paso, rx = cuánto descansa esta pierna en reposo, cr = flexión extra (frenada), abd = apertura lateral */
  const leg = (G, sg, u, rx, wk, rk, sp, Aw, Ar, lean, cr, abd) => {
    let h = cyc(W_HIP, u) * Aw,
      k = cyc(W_KNEE, u) * (0.45 + 0.9 * Aw),
      f = cyc(W_FOOT, u) * (0.35 + 1.05 * Aw);
    if (rk > 0) {
      h += (cyc(R_HIP, u) * Ar - 0.1 - h) * rk;
      k += (cyc(R_KNEE, u) * (0.56 + 0.44 * sp) - k) * rk;
      f += (cyc(R_FOOT, u) * (0.7 + 0.3 * sp) - f) * rk;
    }
    const ih = -0.2 * rx,
      ik = 0.44 * rx,
      iF = 0.12 * rx;
    h = ih + (h - ih) * wk - cr;
    k = ik + (k - ik) * wk + cr * 2;
    f = iF + (f - iF) * wk;
    const an = cl(f - lean - h - k, -0.75, 0.95),
      th = lean + h,
      F = an + th + k;
    G.hip.rotation.set(h, sg * 0.3 * rx, abd + sg * 0.06 * rx); /* la pierna que descansa se abre un poco */
    G.knee.rotation.x = k;
    G.foot.rotation.x = an;
    return -LEG1 * Math.cos(th) - ANK * Math.cos(th + k) - SOLE * Math.cos(F) + Math.min(0.075 * Math.sin(F), -0.175 * Math.sin(F));
  };
  /* tela: guarda la forma de partida de una malla que cuelga para poder doblarla cada fotograma */
  function tela(m, len) {
    const g = m.geometry,
      p0 = new Float32Array(g.attributes.position.array);
    let lo = 0;
    for (let i = 1; i < p0.length; i += 3) lo = Math.min(lo, p0[i]);
    if (g.boundingSphere) g.boundingSphere.radius *= 1.5;
    return { m, p0, L: len || -lo || 1 };
  }
  /* dobla la tela: a1 = ángulo de arriba, a2 = lo que se retrasa el bajo, rz = vuelo lateral, amp y ph = onda */
  const cloth = (C, a1, a2, rz, amp, ph) => {
    const P = C.m.geometry.attributes.position,
      p = P.array,
      p0 = C.p0,
      iL = 1 / C.L;
    for (let i = 0; i < p.length; i += 3) {
      const x = p0[i],
        y = p0[i + 1],
        z = p0[i + 2],
        f = cl(-y * iL, 0, 1.15);
      let a = a1 * f + a2 * f * f + amp * f * f * Math.sin(ph - 3.2 * f);
      if (a < -0.05) a = -0.05;
      const sn = Math.sin(a),
        cs = Math.cos(a);
      p[i] = x - y * f * (rz + amp * 0.6 * Math.sin(ph * 0.5 - 2.4 * f + x * 3));
      p[i + 1] = y * cs - z * sn;
      p[i + 2] = y * sn + z * cs;
    }
    P.needsUpdate = true;
  };
  function animate(R, o) {
    const t = o.t || 0,
      S = R.S,
      st = R.st,
      q = st.q,
      still = !!o.still,
      dt = Math.min(0.1, Math.max(0, o.dt || 0)),
      ds = Math.min(dt, 0.034),
      w = o.walk || 0,
      sit = S.pose === 'sit',
      lie = S.pose === 'lie',
      up = !sit && !lie,
      sleep = o.ex === 'sleep',
      nod = o.nod || 0,
      wave = R.twoHands ? 0 : o.wave || 0,
      use = o.use || 0,
      seed = (S.ph || 0) * 3,
      tw = S.tw || 1;
    /* 1 · lo que de verdad se mueve el muñeco: velocidad y giro, medidos sobre su propia raíz */
    const root = R.root,
      par = root.parent,
      px = root.position.x + (par ? par.position.x : 0),
      pz = root.position.z + (par ? par.position.z : 0),
      yaw = root.rotation.y + (par ? par.rotation.y : 0);
    let v = 0,
      yr = 0;
    if (!still && dt > 0.001 && st.px === st.px) {
      v = Math.hypot(px - st.px, pz - st.pz) / (R.sc.scale.x * root.scale.x * dt);
      if (v > 14) v = 0; /* un salto de sitio, no un paso */
      let dy = yaw - st.yaw;
      dy -= Math.round(dy / TAU) * TAU;
      if (Math.abs(dy) < 1) yr = dy / dt;
    }
    st.px = px;
    st.pz = pz;
    st.yaw = yaw;
    /* 2 · inercia propia: entrar y salir del paso con suavidad, y fase del paso según la velocidad real
       (zancada más larga cuanto más deprisa: así el pie de apoyo no patina) */
    let adv = 0;
    if (still) {
      st.w1 = st.wk = w;
      st.ph = o.ph || 0;
      st.v = st.rk = st.sp = 0;
      st.zan = 1.8;
    } else {
      const k = Math.min(1, dt * 13);
      st.w1 += (w - st.w1) * k;
      st.wk += (st.w1 - st.wk) * k;
      st.v += (v - st.v) * Math.min(1, dt * 8);
      const dphC = st.oph === st.oph ? cl((o.ph || 0) - st.oph, 0, 1.2) : 0;
      if (st.v > 0.3 && w > 0.02) {
        const zan = 0.95 + 0.33 * st.v;
        adv = ((TAU * st.v) / zan) * dt;
        st.zan = zan;
        st.rk += (sst(TROTE[0], TROTE[1], st.v) - st.rk) * Math.min(1, dt * 6);
        st.sp += (sst(CARRERA[0], CARRERA[1], st.v) - st.sp) * Math.min(1, dt * 6);
      } else {
        adv = dphC; /* sin velocidad medible (anda en el sitio): la cadencia de quien llama */
        st.zan = 1.5;
        st.rk += (0 - st.rk) * Math.min(1, dt * 6);
        st.sp += (0 - st.sp) * Math.min(1, dt * 6);
      }
      st.ph += adv;
    }
    st.oph = o.ph || 0;
    const wk = up ? st.wk : 0,
      rk = st.rk,
      sp = st.sp,
      idl = 1 - wk,
      zan = st.zan || 1.5,
      Aw = Math.asin(cl(0.3 * zan, 0.12, 0.6)),
      Ar = Math.asin(cl(0.21 * zan, 0.2, 0.68)) / 0.9,
      u = st.ph / TAU,
      c0 = Math.cos(TAU * u) /* +1 = pierna izquierda delante */,
      cw = Math.cos(TAU * (u - 0.25)) /* +1 = el peso sobre la pierna izquierda */,
      paso = Math.sin(2 * st.ph + 0.9); /* dos golpes por zancada */
    /* 3 · reposo vivo: respiración, cambio de peso de una pierna a otra y pequeños gestos de cabeza */
    let br = 0;
    if (!still) {
      br = 0.5 + 0.5 * Math.sin(t * (sleep ? 1.1 : 1.7 + rk * 1.5) + seed);
      const k = Math.min(1, dt * 3.2);
      if (up && wk < 0.1 && !sleep) {
        st.sideT -= dt;
        if (st.sideT < 0) {
          st.sideT = 5 + Math.random() * 7;
          st.side = (st.side > 0 ? -1 : 1) * (Math.random() < 0.25 ? 0.45 : 1);
        }
      }
      st.sh1 += (st.side - st.sh1) * k;
      st.sh += (st.sh1 - st.sh) * k;
      st.gT -= dt;
      if (st.gT < 0) {
        st.gT = 2.2 + Math.random() * 4.5;
        const big = Math.random() < 0.3;
        st.gy = (Math.random() - 0.5) * (big ? 0.5 : 0.16);
        st.gx = (Math.random() - 0.5) * 0.08;
        st.gz = (Math.random() - 0.5) * 0.07;
      }
      const g = sleep ? 0 : (1 - wk * 0.8) * (1 - nod * 0.6),
        kh = Math.min(1, dt * 4);
      st.hy1 += (st.gy * g - st.hy1) * kh;
      st.hx1 += (st.gx * g - st.hx1) * kh;
      st.hz1 += (st.gz * g - st.hz1) * kh;
      st.hy += (st.hy1 - st.hy) * kh;
      st.hx += (st.hx1 - st.hx) * kh;
      st.hz += (st.hz1 - st.hz) * kh;
      st.look += ((o.look || 0) - st.look) * 0.1;
      /* frenada: las rodillas ceden un instante; arranque y frenada inclinan el cuerpo; al girar, se ladea */
      if (st.pwk > wk) q[13] += (st.pwk - wk) * (2 + 4 * rk);
      spr(q, 12, 0, 150, 13, ds);
      spr(q, 14, cl((w - wk) * 0.28, -0.1, 0.12) * (0.4 + 0.6 * rk), 90, 12, ds);
      spr(q, 16, cl(-yr * 0.022, -0.11, 0.11) * wk, 60, 11, ds);
    } else {
      st.look = o.look || 0;
      q[12] = q[13] = q[14] = q[15] = q[16] = q[17] = 0;
    }
    st.pwk = wk;
    const sh = up ? st.sh : 0,
      ash = Math.abs(sh),
      hy = still ? 0 : st.hy,
      hx = still ? 0 : st.hx,
      hz = still ? 0 : st.hz,
      talk = still ? 0 : nod,
      cr = cl(q[12], -0.02, 0.36),
      bank = q[16],
      lean = up ? wk * (0.025 + 0.035 * rk + 0.08 * sp) + q[14] : 0;
    /* 4 · piernas y pelvis: el pie de apoyo manda en la altura del cuerpo (la cadera sube y baja dos veces por zancada) */
    const pelZ = sh * 0.1 * idl + wk * cw * (0.05 - 0.02 * rk),
      bx = sh * 0.05 * idl + wk * cw * (0.02 - 0.012 * rk);
    if (sit) {
      R.body.position.y = R.sitY;
      R.L.hip.rotation.set(-1.42, 0, 0);
      R.Rl.hip.rotation.set(-1.42, 0, 0);
      R.L.knee.rotation.x = R.Rl.knee.rotation.x = 1.35;
      R.L.foot.rotation.x = R.Rl.foot.rotation.x = 0.07;
    } else if (lie) {
      R.L.hip.rotation.set(-0.62, 0, 0);
      R.Rl.hip.rotation.set(-0.58, 0, 0);
      R.L.knee.rotation.x = R.Rl.knee.rotation.x = 0.08;
      R.L.foot.rotation.x = R.Rl.foot.rotation.x = 0.25;
    } else {
      const abd = -pelZ - bx / 0.98,
        ls = Math.sin(pelZ) * R.hipW,
        lowL = leg(R.L, 1, u, sh < 0 ? ash * idl : 0, wk, rk, sp, Aw, Ar, lean, cr, abd) + ls,
        lowR = leg(R.Rl, -1, u + 0.5, sh > 0 ? ash * idl : 0, wk, rk, sp, Aw, Ar, lean, cr, abd) - ls,
        /* al trotar hay un instante en el aire entre apoyo y apoyo */
        hop = wk * rk * (0.07 + 0.03 * sp) * (0.5 + 0.5 * Math.cos(2 * TAU * (u - 0.425))),
        by = -Math.min(lowL, lowR) - R.hipY + hop;
      st.by = still || st.by !== st.by ? by : st.by + (by - st.by) * Math.min(1, dt * 26);
      R.body.position.y = st.by;
      R.body.position.x = bx;
    }
    R.pel.rotation.set(0, up ? -wk * c0 * (0.1 + 0.05 * rk) : 0, up ? pelZ : 0);
    R.body.rotation.set(lean, 0, up ? bank : 0);
    /* 5 · torso: los hombros giran contra la cadera, el pecho se hincha al respirar y se inclina con la velocidad */
    const say = talk * Math.sin(t * 1.3 + seed) /* vaivén lento de quien habla */,
      wv = wave > 0 ? wave : 0,
      chY = up ? wk * c0 * (0.1 + 0.1 * rk) + sh * 0.06 * idl : 0,
      chZ = (up ? -sh * 0.075 * idl - wk * cw * 0.03 + bank * 0.4 : 0) + say * 0.02 - wv * 0.05,
      chX = (S.old ? 0.07 : 0) + wk * (0.04 + 0.04 * rk + 0.07 * sp) - br * 0.014 + talk * 0.03 + cr * 0.25;
    R.chest.rotation.set(chX, chY + say * 0.03, chZ);
    R.rib.scale.set(1 + br * 0.014, 1, 1 + br * 0.04);
    /* 6 · brazos: balanceo contrario a la pierna, con el codo que cede; al trotar van recogidos */
    const A = R.AL,
      B = R.AR,
      low = sit || lie,
      sa = Math.cos(TAU * (u - 0.045)) /* +1 = brazo izquierdo atrás */,
      As = wk * (1.05 * Aw * (1 - rk) + (0.5 + 0.35 * sp) * rk),
      shY = 0.37 + br * 0.008,
      el0 = -0.15 - wk * (0.1 + (0.85 + 0.4 * sp) * rk),
      drift = still ? 0 : Math.sin(t * 0.8 + seed) * 0.025 * idl;
    A.sh.position.y = B.sh.position.y = shY;
    A.sh.rotation.set(low ? -0.45 : sa * As + rk * wk * 0.12 + drift, 0, 0.08 + tw * 0.02 + rk * wk * 0.1);
    A.el.rotation.set(low ? -0.7 : el0 - wk * (0.4 - 0.15 * rk) * Math.max(0, -sa), 0, 0);
    B.sh.rotation.set(low ? -0.45 : -sa * As + rk * wk * 0.12 - drift, 0, -0.08 - rk * wk * 0.1);
    B.el.rotation.set(low ? -0.7 : el0 - wk * (0.4 - 0.15 * rk) * Math.max(0, sa), 0, 0);
    if (R.hold || o.held) {
      /* lo que lleva en la mano va recogido y acusa cada paso */
      const hu = use * 0.5;
      B.sh.rotation.set(-0.42 - hu - wk * 0.1 + wk * paso * 0.03, 0, -0.12);
      B.el.rotation.set(-1.15 - hu * 0.4 + wk * paso * 0.05, 0, 0);
    }
    if (R.twoHands) {
      A.sh.rotation.set(-0.5, 0, -0.18);
      A.el.rotation.set(-1.1 + talk * Math.sin(t * 2.1) * 0.04, 0, 0.2);
      B.sh.rotation.set(-0.5, 0, 0.18);
      B.el.rotation.set(-1.1 + talk * Math.sin(t * 2.1) * 0.04, 0, -0.2);
    } else if (talk > 0.01) {
      /* hablar: la mano libre acompaña a ratos, sin metrónomo (dos ritmos mezclados) */
      const ge = talk * sst(-0.25, 0.45, Math.sin(t * 0.63 + seed * 1.7)),
        beat = Math.sin(t * 3.7 + seed) * 0.6 + Math.sin(t * 5.9) * 0.4;
      A.sh.rotation.x = L(A.sh.rotation.x, -0.38 + beat * 0.06, ge);
      A.sh.rotation.z += ge * 0.1;
      A.el.rotation.x = L(A.el.rotation.x, -1.3 + beat * 0.2, ge);
      A.el.rotation.z = ge * (0.25 + Math.sin(t * 2.3 + seed) * 0.3);
      if (!R.hold && !o.held) {
        const g2 = talk * sst(0.1, 0.7, Math.sin(t * 0.47 + seed * 2.9 + 2));
        B.sh.rotation.x = L(B.sh.rotation.x, -0.3 - beat * 0.05, g2);
        B.sh.rotation.z -= g2 * 0.08;
        B.el.rotation.x = L(B.el.rotation.x, -1.15 - beat * 0.16, g2);
        B.el.rotation.z = -g2 * (0.2 + Math.sin(t * 2.0 + seed) * 0.25);
      }
    }
    if (wv > 0) {
      /* saludar: el brazo sube por fuera y la mano va de lado a lado; el cuerpo y la cabeza acompañan */
      A.sh.rotation.set(-0.25 * wv, 0, 0.08 + 2.3 * wv);
      A.el.rotation.set(0, 0, (0.55 + Math.sin(t * 11) * 0.45) * wv);
    }
    /* el objeto mira siempre "arriba" */
    const it = B.it;
    it.rotation.set(-(B.sh.rotation.x + B.el.rotation.x), 0, -(B.sh.rotation.z + B.el.rotation.z));
    if (R.glow && R.S.hold && R.S.hold[0] === 'candle' && !still) {
      R.glow.scale.set(1, 1.4 + Math.sin(t * 11) * 0.25, 1);
    }
    /* 7 · cabeza: se estabiliza (deshace el giro y el ladeo del torso), asiente al hablar y mira un poco alrededor */
    const nodX = talk * (Math.sin(t * 5.3 + seed) * 0.045 + Math.sin(t * 8.1) * 0.022 + Math.max(0, Math.sin(t * 1.9 + seed)) * 0.03);
    R.head.rotation.set(
      nodX - (S.old ? 0.08 : 0) + (lie ? -0.35 : 0) + hx - (chX - (S.old ? 0.07 : 0)) * 0.55 - lean * 0.7 + wk * paso * 0.012,
      st.look + hy - (chY + say * 0.03) * 0.85 - (up ? R.pel.rotation.y * 0.1 : 0),
      hz - chZ * 0.85 - (up ? bank * 0.8 : 0) + say * 0.035 + wv * 0.08,
    );
    /* 8 · lo que cuelga sigue al cuerpo con retraso: capa, bufanda y pelo son péndulos con muelle */
    const flow = wk * (0.1 + 0.1 * rk + 0.12 * sp),
      side = wk * cw * 0.05;
    if (still) {
      q[0] = q[2] = 0.08 + flow;
      q[6] = flow * 0.7;
      q[10] = 0.12 + wk * 0.1;
      q[1] = q[3] = q[4] = q[5] = q[7] = q[8] = q[9] = q[11] = q[18] = q[19] = 0;
    } else {
      st.cp += dt * 1.5 + 2 * adv;
      spr(q, 0, 0.08 + flow + wk * paso * 0.04, 70, 6.5, ds);
      spr(q, 2, 0.08 + flow * 1.25, 44, 5.5, ds);
      spr(q, 4, cl(-yr * 0.05, -0.3, 0.3) + side, 40, 5, ds);
      spr(q, 6, flow * 0.7 + wk * paso * 0.06 - nodX * 0.6, 95, 7, ds);
      spr(q, 8, cl(-yr * 0.045, -0.28, 0.28) + side - hz, 80, 6, ds);
      spr(q, 10, 0.12 + wk * 0.1 + wk * paso * 0.12, 85, 6, ds);
      spr(q, 18, cl(-yr * 0.04, -0.25, 0.25) + side * 1.5, 70, 5, ds);
    }
    if (R.cloth) {
      const amp = still ? 0 : 0.012 * idl + wk * (0.045 + 0.035 * rk),
        ck = q[0] + q[2] * 3 + q[4] * 7 + (still ? 0 : st.cp);
      if (ck !== st.ck) {
        st.ck = ck;
        cloth(R.cloth, q[0], q[2] - q[0], q[4], amp, st.cp);
        if (R.cloth2) cloth(R.cloth2, q[0], q[2] - q[0], q[4], amp, st.cp);
      }
    } else if (R.cape) R.cape.rotation.set(cl(q[0] * 0.5, 0, 0.3), 0, q[4] * 0.3);
    if (R.scarfTail) R.scarfTail.rotation.set(cl(q[10], -0.1, 0.5), 0, 0.05 + q[18]);
    if (R.hairSw) {
      const K = R.hairK;
      R.hairSw.rotation.set(cl(q[6], K > 1 ? -0.12 : -0.03, 0.75) * K, 0, cl(q[8], -0.3, 0.3) * K);
    }
    if (R.wingM && !still) R.wingM.rotation.y = Math.sin(t * (sit ? 2 : 9)) * 0.06;
    if (R.flame && !still) R.flame.scale.set(1, 1.4 + Math.sin(t * 11) * 0.3, 1);
    /* parpadeo y boca */
    if (R.lids) {
      const s = R.st;
      let lid = 0.12;
      if (o.ex === 'sleep') lid = 1.05;
      else if (!still) {
        s.blink -= dt;
        if (s.blink < 0) {
          s.bt = 0.13;
          s.blink = 2.5 + Math.random() * 3.5;
        }
        if (s.bt > 0) {
          s.bt -= dt;
          lid = 1.05;
        }
      }
      R.lids.scale.y = lid;
    }
    if (R.mouth) {
      const open =
        o.ex === 'surprise' || o.ex === 'open' || o.ex === 'wow' || o.ex === 'happy' || (o.talk && !still && Math.sin(t * 14) > 0.3);
      const g = open ? R.mOpen : R.mSmile;
      if (R.mouth.geometry !== g) {
        R.mouth.geometry = g;
        R.mouth.scale.set(open ? 1 : 1, open ? 0.75 : 1, open ? 0.5 : 1);
        R.mouth.rotation.z = open ? 0 : Math.PI;
      }
    }
  }

  /* ══ fichas: del jugador y de cada vecino ══ */
  function fromAvatar(A) {
    const acc = A.accessory;
    const S = {
      k: 1,
      skin: A.skin,
      hair: A.hair,
      hairS: A.hairStyle === 'largo' ? 'largo' : A.hairStyle,
      top: A.top,
      bottom: A.bottom,
      shoes: A.shoes,
      boots: true,
      tunic: true,
      strap: '#6A4226',
      cape: A.cape,
      capePattern: A.capePattern,
      accent: A.accent,
      satchel: '#8A5A34',
      jar: true,
      eye: '#5A3A22',
      hold: null,
    };
    if (acc === 'bufanda') S.scarf = A.accent;
    if (acc === 'sombrero') ((S.hat = ['wide', '#B8783A']), (S.hatBand = A.accent));
    if (acc === 'velo') S.hat = ['veil'];
    if (acc === 'gorro') {
      S.hat = ['beanie', A.cape, '#F2EADB'];
      if (A.hairStyle !== 'largo') S.hideHair = true;
    }
    if (S.hat) S.tufts = false;
    return S;
  }
  const P_ = ['#F4AFA6', '#E07F7F', '#FBF4E3', '#F5CE55', '#A7BE8B', '#6F8D5E'];
  const X = {
    /* lo que el dibujo de papel hace con funciones: aquí, en piezas 3D (versión «Cuento», la del juego) */
    pri: { hat: ['crown', ['#F4AFA6', '#FBF4E3', '#F5CE55']], back: [['leafCape', '#A7BE8B', '#6F8D5E']], hold: ['can'], fx: [['rosy']] },
    ver: {
      pose: 'lie',
      hat: ['rays', '#F5CE55', '#E4A844'],
      back: [['cape', '#E9B830', '#F5CE55']],
      hold: ['sunflower'],
      fx: [['sunglasses'], ['mustache', '#F4F0E6', 1.25]],
    },
    oto: {
      hat: ['leaves', ['#E07A4E', '#E4A844', '#C9694B', '#B8484A']],
      back: [['leafCape', '#C9694B', '#E4A844']],
      hold: ['maple'],
      fx: [['glasses', '#3A2A20']],
    },
    inv: {
      hat: ['nightcap', '#8FA9B6'],
      back: [['cape', '#DCE9F0', '#8FA9B6', 0]],
      hold: ['mug'],
      fx: [['beard', '#F4F0E6'], ['rosy']],
      floorScarf: true,
    },
    esp: { hat: ['moonPin'], back: [['stars', '#2E3561', '#454E88']], torso: [['stars']], hold: ['moonLamp'], fx: [['rosy']] },
    oce: { hat: ['both', [['helmet'], ['coral']]], back: [['seaweed']], hold: ['jar', '#8FD3C4'] },
    des: {
      hat: ['both', [['wrap', '#2E9A9A', '#E4A844'], ['goggles']]],
      back: [['cape', '#E6AE70', '#2E9A9A', 4]],
      torso: [['stars', '#2E9A9A']],
      hold: ['lantern', '#8FE0D0'],
      fx: [['facescarf', '#2E9A9A']],
    },
    ant: { hat: ['hood', '#5E6B9A'], torso: [['bands', ['#8FD3C4', '#F4AFA6', '#C9B8F0'], 3]], hold: ['jar', '#8FD3C4'], fx: [['rosy']] },
    col: { hat: ['antennae', '#4A3222', '#F5CE55'], back: [['wings']], torso: [['stripes', '#4A3222', 3]], hold: ['dipper'] },
    bib: {
      hat: ['owl', '#B8B0A4'],
      back: [['cape', '#8A5A3A', '#C9A05C', 6]],
      hold: ['openBook'],
      fx: [
        ['bigGlasses', '#C9A05C'],
        ['mustache', '#B8B0A4', 0.8],
      ],
    },
    coc: { hat: ['bow', '#E4A844'], back: [['wings']], torso: [['stripes', '#C47A2C', 3]], hold: ['dipper'], fx: [['rosy']] },
    rel: {
      hat: ['clockTop'],
      back: [['tails', '#3A3A48']],
      torso: [['chain']],
      hold: ['hourglass'],
      fx: [['mustache', '#6A4A30', 0.9], ['monocle']],
    },
    inn: { hat: ['antennae', '#C9D3E8', '#F6D98A'], back: [['mothWings', '#E6E0F4', '#F6D98A']], hold: ['moonLamp'] },
    tea: {
      hat: ['plume', '#F6D98A', '#2A2230'],
      back: [['cape', '#B8484A', '#E4A844', 6]],
      hold: ['masks'],
      fx: [['mustache', '#2A1E18', 0.7]],
    },
    tre: { hat: ['cap', '#2A305C', '#E4A844'], back: [['stars', '#2A305C', '#454E88']], torso: [['stars']], hold: ['lantern', '#F6D98A'] },
    far: { hat: ['lamp'], back: [['cape', '#2E3A52', '#F2C94C', 4]], hold: ['lantern', '#FFF1B0'], fx: [['beard', '#F4F0E6']] },
    sot: { hat: ['candle'], neck: [['shawl', '#8A5A3A']], back: [['cape', '#6E4630', '#C9694B', 6]], hold: ['candle'] },
    cue: {
      hat: ['crystals', ['#C9B8F0', '#8FD3C4', '#F4AFA6']],
      back: [['cape', '#4A548E', '#C9B8F0', 4]],
      hold: ['crystal', '#8FD3C4'],
      fx: [['soot']],
    },
    vol: { hat: ['ember'], back: [['ember']], hold: ['hammer'], fx: [['soot']] },
    cum: { hat: ['earmuffs', '#FBF8F2', '#8FA9B6'], back: [['cloud']], hold: ['kite', '#F4AFA6'], fx: [['rosy']] },
    dsv: {
      hat: ['top', '#6A5A4A'],
      back: [['cape', '#7A6A4A', '#B8484A', 6]],
      torso: [['tags']],
      hold: ['lantern', '#FFD36A'],
      fx: [['mustache', '#8A8078', 0.9]],
    },
    est: { hat: ['feather', '#3A4660', '#FBF4E3'], back: [['quiverPaper']], hold: ['quill'], fx: [['glasses', '#3A2A20']] },
    ret: { hat: ['feather', '#B8484A', '#F5CE55'], back: [['cape', '#3E8FA0', '#E4A844', 4]], hold: ['brush'], fx: [['paint']] },
    jar: {
      hat: ['crown', ['#FBF4E3', '#F4AFA6', '#C9B8F0']],
      back: [['leafCape', '#6F8D5E', '#A7BE8B']],
      hold: ['sprout'],
      fx: [['rosy']],
    },
    cor: { hat: ['hexCrown'], back: [['wings'], ['combCape']], neck: [['necklace']], hold: ['book'], twoHands: true },
  };
  function fromHuman(id, H) {
    const x = X[id] || {};
    const S = {
      k: H.k || 1,
      skin: H.skin,
      hair: H.hair,
      hairS: H.hair_s || (H.hair ? 'corto' : null),
      top: H.top,
      sleeve: H.sleeve,
      bottom: H.bottom,
      shoes: H.shoes,
      skirt: H.skirt,
      overall: H.overall,
      apron: H.apron,
      belt: H.belt,
      tall: H.tall,
      old: H.old,
      tw: H.tw,
      pose: H.pose,
      seat: H.seat,
      inkHands: H.inkHands,
      ribbon: H.ribbon,
      ph: H.ph,
      tufts: false,
      girl: !!(H.skirt || /trenzas|moño|melena|coleta/.test(H.hair_s || '')),
    };
    Object.assign(S, x);
    if (id === 'oce' && !H.head) S.hat = ['coral'];
    if (H.twoHands === false || (!H.twoHands && id !== 'cor')) S.twoHands = x.twoHands && H.twoHands !== false;
    if (!x.hold && H.hold) S.hold = ['misc', '#B8783A'];
    return S;
  }

  /* ══ Pompón: el conejo blanco de ojos rojos ══ */
  function pompon() {
    const root = new T3.Group(),
      sc = grp(root);
    sc.scale.setScalar(46);
    const body = grp(sc),
      B = new Bk(),
      W = '#FBF7F0',
      Wd = '#EDE6DA';
    B.add(SPH(0.17, 12, 9), W, [0, 0.16, 0], [0, 0, 0], [1, 0.9, 1.2]);
    B.add(SPH(0.05, 7, 6), '#FFFFFF', [0, 0.19, -0.2]);
    for (const s of [-1, 1]) {
      B.add(SPH(0.06, 8, 6), Wd, [s * 0.1, 0.07, 0.1], [0, 0, 0], [0.8, 0.7, 1.3]);
      B.add(SPH(0.05, 7, 5), Wd, [s * 0.09, 0.04, -0.1], [0, 0, 0], [0.9, 0.6, 1.4]);
    }
    const head = grp(body, [0, 0.3, 0.13]),
      BH = new Bk();
    BH.add(SPH(0.12, 12, 9), W, [0, 0.02, 0]);
    for (const s of [-1, 1]) {
      BH.add(SPH(0.035, 7, 6), W, [s * 0.045, 0.18, -0.03], [s * 0.1 - 0.2, 0, s * 0.15], [1, 3, 0.8]);
      BH.add(SPH(0.024, 6, 5), '#F2C4C4', [s * 0.045, 0.18, -0.003], [s * 0.1 - 0.2, 0, s * 0.15], [0.6, 2.4, 0.4]);
      BH.add(SPH(0.022, 8, 6), '#B8243A', [s * 0.06, 0.045, 0.095], [0, 0, 0], [1, 1, 0.6]);
      BH.add(SPH(0.007, 4, 4), '#FFFFFF', [s * 0.06 - 0.006, 0.054, 0.11]);
    }
    BH.add(SPH(0.014, 6, 5), '#E89A9A', [0, 0.0, 0.12]);
    BH.add(SPH(0.03, 6, 5), W, [0, -0.04, 0.1], [0, 0, 0], [1.4, 0.8, 1]);
    B.mesh(body);
    BH.mesh(head);
    return { root, body, head };
  }
  function animPom(P, o) {
    const { t } = o,
      hop = o.hop || 0;
    P.body.position.y = Math.max(0, Math.sin(t * 12)) * 0.12 * hop;
    P.body.rotation.x = -Math.sin(t * 12) * 0.15 * hop;
    P.head.rotation.x = o.sniff && !o.still ? Math.sin(t * 16) * 0.06 : 0;
    P.head.rotation.z = o.still ? 0 : Math.sin(t * 1.3) * 0.05;
    P.root.position.x += o.jit || 0;
  }

  /* la bufanda infinita de Escarcha, tendida por el suelo (unidades del mundo) */
  function ribbon(pts, r, c1, c2) {
    const curve = new T3.CatmullRomCurve3(pts.map((p) => new T3.Vector3(...p))),
      N = 56,
      B = new Bk(),
      a = new T3.Vector3(),
      b = new T3.Vector3(),
      up = new T3.Vector3(0, 1, 0),
      q = new T3.Quaternion(),
      d = new T3.Vector3();
    for (let i = 0; i < N; i++) {
      curve.getPoint(i / N, a);
      curve.getPoint((i + 1) / N, b);
      d.copy(b).sub(a);
      const L = d.length() * 1.08;
      q.setFromUnitVectors(up, d.normalize());
      B.addM(
        CYL(r, r, 1, 8),
        i % 7 === 3 ? c2 : c1,
        new T3.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, new T3.Vector3(1, L, 0.55)),
      );
    }
    return B.mesh();
  }
  /* los vecinos se dibujan después de los recortes de papel (como antes): así se sientan DENTRO del sillón */
  let MATN = null;
  function front(R) {
    if (!MATN) MATN = Object.assign(mat().clone(), { transparent: true, opacity: 1, depthWrite: true, userData: SH });
    R.root.traverse((o) => {
      if (!o.isMesh && !o.isSprite) return;
      if (o.material === MAT) o.material = MATN;
      else if (o.material && o.material.isMeshBasicMaterial && !o.material.transparent) {
        const k = 'T' + o.material.color.getHexString();
        o.material =
          BASIC[k] ||
          (BASIC[k] = Object.assign(new T3.MeshBasicMaterial({ color: o.material.color.clone(), transparent: true, opacity: 1 }), {
            userData: SH,
          }));
      }
      o.renderOrder = 3;
    });
    return R;
  }
  /* ── giro suave hacia donde se mira ── */
  const turn = (a, b, k) => {
    let d = ((((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
    return a + d * k;
  };
  return {
    human,
    animate,
    fromAvatar,
    fromHuman,
    pompon,
    animPom,
    turn,
    glowSprite,
    ribbon,
    front,
    U0,
    kit: { Bk, SPH, CYL, CONE, BOX, TOR, LATHE, OCT, CIRC, shd, mix, mat, matF, basic, glowSprite, MX },
  };
})();
window.LP3D = LP3D;
