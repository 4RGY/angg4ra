/**
 * iceberg-scene.js — "Midnight Arctic" hero scene (v5)
 * ---------------------------------------------------------------
 * Adegan permukaan arctic full-bleed di belakang hero homepage.
 *
 * v5 — hasil review user:
 *  - AURORA DIHAPUS total (dinilai jelek).
 *  - Animasi iceberg & kapal lebih hidup:
 *      • Iceberg: bob halus naik-turun + rotasi pelan + drift
 *      • Kapal: bob + roll/pitch di ombak, maju-mundur pelan
 *  - Placement dirapikan: iceberg di kanan (mayoritas), kapal di kiri
 *    bawah — seimbang, nggak ketabrak heading.
 *  - Load GLB asli (iceberg.glb, tugboat.glb). Fauna GLB lain siap
 *    dipakai zona berikutnya (lihat export spawnFauna).
 *
 * Guard: reduced-motion → null; <768px → null; WebGL absent → null;
 * dynamic import three + GLTFLoader; visibilitychange pause; resize.
 */

const FAUNA = {
  jellyfish: { url: '/models/jellyfish.glb', scale: 1, float: true },
  octopus:   { url: '/models/octopus.glb',   scale: 1, float: true },
  tentacle:  { url: '/models/tentacle.glb',  scale: 1, float: false },
  fish:      { url: '/models/fish.glb',      scale: 1, float: true, anim: true },
  anglerfish:{ url: '/models/anglerfish.glb',scale: 1, float: true, anim: true },
};

export async function initIcebergScene(container) {
  const prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  if (prefersReduced || isMobile) return null;

  const THREE = await import('three');
  const { WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, MeshStandardMaterial,
          MeshBasicMaterial, Sprite, SpriteMaterial, CanvasTexture,
          Points, PointsMaterial, BufferGeometry, BufferAttribute, Fog, AmbientLight,
          DirectionalLight, PointLight, Color, Vector2, Vector3, Box3, MathUtils,
          PlaneGeometry, CircleGeometry, DoubleSide, AdditiveBlending } = THREE;
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

  let renderer = null;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }

  const rootEl = document.documentElement;
  // Dark-only (v12): light mode dihapus total — arctic malam selamanya.
  const isDark = () => true;

  // Overlay DOM (Fitur #3 ripple & #5 vignette) — boleh kosong (no-op guard)
  const vignetteEl = document.querySelector('[data-dive-vignette]');
  const rippleEl = document.querySelector('[data-dive-ripple]');

  const PAL = {
    dark:  { ice: '#dce6f2', snow: '#dcecf7', fog: '#0b1220' },
  };

  // Interpolasi array warna hex → Color (butuh Color dari destructure)
  function lerpHexArr(arr, p) {
    const seg = Math.min(p * (arr.length - 1), arr.length - 1);
    const i = Math.floor(seg);
    const f = seg - i;
    if (i >= arr.length - 1) return new Color(arr[arr.length - 1]);
    return new Color(arr[i]).lerp(new Color(arr[i + 1]), f);
  }

  // Smoothstep GLSL — transisi halus 0→1 antara edge0 & edge1
  function smoothstep(edge0, edge1, x) {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  const scene = new Scene();
  // v12: scene punya background sendiri (bukan transparan) — biar pas nyilem
  // nggak tembus putih/terang. Warna di-update per dive (makin dalam makin gelap).
  scene.background = new Color('#0b1220');
  scene.fog = new Fog(new Color(PAL.dark.fog), 34, 80);

  const viewport = container.getBoundingClientRect();
  const camera = new PerspectiveCamera(40, viewport.width / Math.max(viewport.height, 1), 0.1, 200);
  camera.position.set(0, 3.2, 17);
  camera.lookAt(0, 1.5, 0);

  renderer.setSize(viewport.width, viewport.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  Object.assign(renderer.domElement.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%',
  });
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  /* ── Lighting (arctic: dingin, aksen cyan) ── */
  const key = new DirectionalLight('#7ec8e3', 1.7);
  key.position.set(-4, 7, 8);
  const rim = new DirectionalLight('#3d5a80', 0.5);
  rim.position.set(5, -2, -4);
  const ambient = new AmbientLight('#8fb3d0', 0.38);
  // Lampu penyelam: nempel di kamera, nyala pas mulai gelap. Bikin fauna &
  // iceberg tetap punya bentuk di kedalaman tanpa bikin scene jadi terang.
  const diveLamp = new PointLight('#a8dcf0', 0, 26, 2);
  const lampRim = new DirectionalLight('#78d0ea', 0);
  lampRim.position.set(-3, 2, 6);
  scene.add(key, rim, ambient, diveLamp, lampRim);

  const rnd = mulberry32(20260909);
  const loaded = { berg: null, ship: null, ocean: null };
  const anims = { ship: { driftPhase: rnd() * Math.PI * 2 } };

  /* ── Loader & helper (WAJIB di atas semua pemakaian) ── */
  const loader = new GLTFLoader();
  const loadModel = (url) =>
    new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));

  const normalize = (obj, targetSize) => {
    const box = new Box3().setFromObject(obj);
    const size = box.getSize(new Vector3());
    const scale = targetSize / Math.max(size.x, size.y, size.z, 0.001);
    obj.scale.setScalar(scale);
    const minY = box.min.y * scale;
    obj.position.y = -minY;
    return scale;
  };

  /* ── Dive state (v12: scroll = nyilem, makin dalam makin gelap) ──
     progress 0..1 dipetakan dari scroll halaman (GSAP ScrollTrigger).
     0    = permukaan (0m)  — kamera (0, 3.2, 17), iceberg+kapal, langit
     0.2  = −20m  — jellyfish (Tentang)   — biru muda pudar
     0.5  = −200m — fish (Proyek)         — biru gelap
     0.78 = −800m — octopus (Skill)       — hampir hitam
     1    = −4000m— anglerfish (Kontak)   — hitam total + bioluminesensi
  */
  let diveP = 0;
  let diveVel = 0; // kecepatan dive (per frame) — dipakai bubbles warp & ripple
  let lastDiveP = 0;
  let smoothDive = 0; // diveP yang sudah di-ease (inersia air) — v14
  const DIVE = {
    camY:   [3.2, -2, -14, -30, -48],
    camZ:   [17, 14, 11, 9, 7],
    fogFar: [80, 55, 40, 28, 18],    // fog far makin dekat = makin gelap
    amb:    [0.38, 0.3, 0.18, 0.18, 0.17],
    bg:     ['#0b1220', '#091526', '#050c17', '#050c14', '#040a12'], // idx1=Tentang #091526, idx2=Karya #050c17 (p=0.25/0.5 pas tengah section)
    fog:    ['#0b1220', '#091526', '#050c17', '#050c14', '#040a12'], // fog ikut warna zona — nggak nyuci objek dgn kabut terang
    keyI:   [1.7, 0.85, 0.42, 0.36, 0.28],  // cahaya "bulan" (directional) — makin dalam makin redup
    fogFarBoost: [0, 0, 2, 4, 6],          // fog dikendurin dikit di dalam
  };
  // Fauna yang ke-load & aktif per zona.
  const fauna = { jelly: [], fish: [], octo: [], angler: [] };
  // posisi diam fauna (relatif kamera dive): y ikut kamera (nyilem bareng)
  const faunaPlace = {
    // v15: fauna dibesarin & didekatin ke kamera biar bentuknya kebaca jelas
    jelly:  [{ x: -4.5, y: -1.5, z: -8.5, s: 1.15 }, { x: -7.5, y: -4, z: -12, s: 0.8 }],
    fish:   [{ x: 4,  y: -2.5, z: -3, s: 1.0 }, { x: 6.5, y: -5, z: -6.5, s: 0.75 },
             { x: 1.5, y: -7, z: -8, s: 0.6 }, { x: -5.5, y: -3.5, z: -5, s: 0.85 }],
    octo:   [{ x: -4, y: -5, z: -4.5, s: 1.1 }, { x: 5.5, y: -8, z: -9, s: 0.7 }],
    angler: [{ x: 2.5, y: -8, z: -5.5, s: 1.3 }, { x: -5, y: -12, z: -10, s: 0.85 }],
  };

  function setDive(p) {
    diveP = Math.min(1, Math.max(0, p));
  }
  /* diveVel dihitung di tick (bukan di setDive) — bebas dari frame-rate
     dan tetap hidup walau setDive dipanggil dari ScrollTrigger tiap frame. */

  /* LANDMARKS holder — dipakai tick, diisi oleh loadDeepLife */
  const landmarks = [];

  /* ── LAZY DEEP LIFE ──
     Fauna + landmark kedalaman nggak dibutuhkan di first paint.
     Dimuat saat browser idle supaya first load ringan; user yang
     langsung nyelam tetap dapet mereka karena fetch jalan paralel. */
  const loadDeepLife = async () => {
  /* Fauna GLB — dimuat paralel sama GLB utama; dipasang diam (visible false)
     sampai dive masuk ke zona-nya. */
  const [jellyGltf, fishGltf, octoGltf, anglerGltf] = await Promise.allSettled([
    loadModel('/models/jellyfish.glb'),
    loadModel('/models/fish.glb'),
    loadModel('/models/octopus.glb'),
    loadModel('/models/anglerfish.glb'),
  ]);

  // Glow bioluminescent per fauna: sprite additive lembut yang nempel di badan.
  // jelly → cyan lembut; fish → biru pucat; octo → ungu; angler → hijau pucat.
  const GLOW = {
    jelly:  '#7de8e0',
    fish:   '#6db8e8',
    octo:   '#b48ae0',
    angler: '#9ae87d',
  };
  function makeGlow(hex) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const ctx = cv.getContext('2d');
    // hex → rgba(...,0.35) buat mid-stop
    const r = parseInt(hex.slice(1, 3), 16);
    const g2 = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
    g.addColorStop(0, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.25, `rgba(${r},${g2},${b},0.4)`);
    g.addColorStop(1, `rgba(${r},${g2},${b},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new CanvasTexture(cv);
    return new SpriteMaterial({
      map: tex, transparent: true, opacity: 0.8,
      depthWrite: false, blending: AdditiveBlending, fog: false,
    });
  }

  // Mount fauna: klon GLB per slot, tiap klon dapet glow sprite sendiri.
  const mountFauna = (key, gltf, slots) => {
    if (gltf.status !== 'fulfilled') return [];
    const src = gltf.value.scene;
    const glowColor = GLOW[key];
    const out = [];
    for (const slot of slots) {
      const g = src.clone(true);
      normalize(g, slot.s);
      g.position.set(slot.x, slot.y, slot.z);
      g.userData = { key, phase: rnd() * Math.PI * 2, spd: 0.4 + rnd() * 0.5 };
      g.traverse((o) => {
        if (o.isMesh && o.material) {
          const m = Array.isArray(o.material) ? o.material[0] : o.material;
          m.fog = true; // fauna ikut fog zona — nyatu atmosfer, nggak nyuci view dgn warna sendiri
          // sedikit emissive biar fauna kebaca di kedalaman gelap
          if (m.emissive) m.emissive = new Color(glowColor).multiplyScalar(0.25);
        }
      });
      scene.add(g);
      // glow sprite — ngambang di tengah badan fauna
      const glowMat = makeGlow(glowColor);
      glowMat.opacity = 0; // fade-in via tick — nggak flash cerah
      const glow = new Sprite(glowMat);
      const sz = slot.s * 1.1; // aksen kecil, bukan bola cahaya raksasa
      glow.scale.set(sz, sz, 1);
      glow.position.set(slot.x, slot.y, slot.z - 1);
      glow.userData = { parent: g, key };
      scene.add(glow);
      g.userData.glow = glow;
      out.push(g);
    }
    return out;
  };
  /* ── LANDMARK v15 (Poly Pizza CC0) — objek diam yang dilewatin saat
     nyilem. Beda fauna: nggak ikut kamera, jadi kerasa "kita yang turun".
     Tiap landmark punya rentang kedalaman sendiri (dp0..dp1). */
  const LANDMARKS = [
    { file: 'submarine.glb', s: 3.4, x: -9,  y: -6,   z: -13, ry: 0.6,  dp0: 0.06, dp1: 0.34, spin: 0.02, bob: 0.5 },
    { file: 'whale.glb',     s: 8.5, x: 11,  y: -17,  z: -22, ry: -0.5, dp0: 0.2,  dp1: 0.78, spin: 0.01, bob: 0.8 },
    { file: 'coral.glb',     s: 0.45, x: -5,  y: -26,  z: -7,  ry: 0.3,  dp0: 0.38, dp1: 0.7,  spin: 0,    bob: 0.15 },
    { file: 'chest.glb',     s: 1.6, x: 3.5, y: -48,  z: -10, ry: -0.7, dp0: 0.86, dp1: 1.25, spin: 0,    bob: 0.1,  chest: true },
    { file: 'seaweed.glb',   s: 2.6, x: 6.5, y: -30,  z: -8,  ry: -0.2, dp0: 0.42, dp1: 0.74, spin: 0,    bob: 0.25 },
    { file: 'shipwreck.glb', s: 5.5, x: 8.5, y: -48,  z: -10, ry: -0.5, dp0: 0.86, dp1: 1.25, spin: 0,    bob: 0.12, wreck: true },,
  ];
  /* landmarks di scope luar */
  await Promise.allSettled(LANDMARKS.map(async (cfg) => {
    try {
      const gltf = await loadModel('/models/' + cfg.file);
      const obj = gltf.scene;
      normalize(obj, cfg.s);
      obj.position.set(cfg.x, cfg.y, cfg.z);
      obj.rotation.y = cfg.ry;
      obj.visible = false;
      obj.traverse((o) => {
        if (o.isMesh && o.material) {
          const m = Array.isArray(o.material) ? o.material[0] : o.material;
          m.fog = true;              // landmark ikut fog → kesan jarak
          if (m.emissive) m.emissive = new Color('#2b5c78').multiplyScalar(0.12);
          // Peti harta karun: emas menyala dari dalam
          if (cfg.chest) { m.emissive = new Color('#ffb84d').multiplyScalar(0.24); m.emissiveIntensity = 0.6; }
          // Kapal karam: sisi kapal berkilau dingin
          if (cfg.wreck) { m.emissive = new Color('#4a7fa8').multiplyScalar(0.12); }
        }
      });
      // Glow gaya tugboat hero: PointLight nyinari sekitar + halo kecil soft sebagai sumber cahayanya
      if (cfg.chest) {
        const lamp = new PointLight('#ffb46b', 2.4, 10, 2);
        lamp.position.set(0, 1.1, 0.5);
        obj.add(lamp);
        const halo = new Sprite(makeGlow('#ffb46b'));
        halo.scale.set(2.4, 2.4, 1);
        halo.position.set(0, 0.9, 0);
        obj.add(halo);
      }
      if (cfg.wreck) {
        const lamp = new PointLight('#ffb46b', 2.2, 12, 2);
        lamp.position.set(0, 2.6, 0);
        obj.add(lamp);
        const halo = new Sprite(makeGlow('#ffb46b'));
        halo.scale.set(2.0, 2.0, 1);
        halo.position.set(0, 2.4, 0);
        obj.add(halo);
      }
      obj.userData = { cfg, phase: rnd() * Math.PI * 2, baseY: cfg.y };
      scene.add(obj);
      landmarks.push(obj);
    } catch { /* model opsional — scene tetap jalan */ }
  }));

  fauna.jelly = mountFauna('jelly', jellyGltf, faunaPlace.jelly);
  fauna.fish  = mountFauna('fish',  fishGltf,  faunaPlace.fish);
  fauna.octo  = mountFauna('octo',  octoGltf,  faunaPlace.octo);
  fauna.angler= mountFauna('angler',anglerGltf,faunaPlace.angler);
  };
  const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 900));
  ric(loadDeepLife);

  
  const [bergGltf, shipGltf] = await Promise.allSettled([
    loadModel('/models/iceberg.glb'),
    loadModel('/models/tugboat.glb'),
  ]);

  if (bergGltf.status === 'fulfilled') {
    const berg = bergGltf.value.scene;
    berg.traverse((o) => {
      if (o.isMesh) {
        o.material = new MeshStandardMaterial({
          color: PAL.dark.ice, roughness: 0.3, metalness: 0.02, transparent: true,
        });
      }
    });
    normalize(berg, 8.5);
    // Placement: kanan-tengah, mayoritas muncul; dasar di bawah waterline
    berg.position.set(4.6, -1.6, -7);
    berg.rotation.y = 0.6;
    scene.add(berg);
    loaded.berg = berg;
  }

  if (shipGltf.status === 'fulfilled') {
    const ship = shipGltf.value.scene;
    ship.traverse((o) => {
      if (o.isMesh && o.material) {
        const m = Array.isArray(o.material) ? o.material[0] : o.material;
        m.roughness = 0.6;
        m.metalness = Math.min(m.metalness ?? 0.1, 0.3);
        m.transparent = true;
      }
    });
    normalize(ship, 3.2);
    // Placement: kiri-bawah, menghadap iceberg
    ship.position.set(-6.8, 0.15, 1.2);
    ship.rotation.y = 0.35;
    scene.add(ship);
    loaded.ship = ship;
  }

  /* ── Burung camar: HAPUS total (user: "seagullnya hapus aja") ── */

  const shipLamp = new PointLight('#ffb46b', 1.4, 12, 2);
  shipLamp.position.set(-6.8, 1.4, 1.5);
  scene.add(shipLamp);

  /* ══════════════════════════════════════════════════════════
     OCEAN — permukaan air CUSTOM (bukan ocean.glb!)
     ocean.glb ternyata kotak 2000-unit → render order kacau,
     kapal keliatan melayang. Ganti PlaneGeometry tipis full-width
     yang digelombangin per-vertex (sin/cos).
     Transparan + vertexColors GRADASI: horizon (jauh) terang,
     makin dekat/dalam makin gelap → bawah iceberg (90% massa)
     kebaca tembus air.
  ══════════════════════════════════════════════════════════ */
  const WATER_Y = 0.32;          // waterline rata-rata (sedikit di atas pangkal kapal)
  const WAVE_AMP = 0.09;         // amplitudo ombak

  const oceanGeo = new PlaneGeometry(180, 100, 140, 60);
  oceanGeo.rotateX(-Math.PI / 2); // bidang XZ
  const oceanBase = oceanGeo.attributes.position.array.slice(); // posisi diam (y=0)

  // Rentang z buat gradasi (zMin = terjauh/horizon, zMax = dekat kamera)
  let oZMin = Infinity, oZMax = -Infinity;
  for (let i = 2; i < oceanBase.length; i += 3) {
    if (oceanBase[i] < oZMin) oZMin = oceanBase[i];
    if (oceanBase[i] > oZMax) oZMax = oceanBase[i];
  }

  // Warna per-vertex (diisi paintOcean — gradasi per tema)
  const oceanCols = new Float32Array(oceanBase.length);
  oceanGeo.setAttribute('color', new BufferAttribute(oceanCols, 3));

  const oceanMat = new MeshStandardMaterial({
    color: new Color('#ffffff'), // vertexColors menimpa diffuse → putih biar murni
    vertexColors: true,
    transparent: true,
    roughness: 0.25,
    metalness: 0.35,
    depthWrite: false, // biar iceberg/kapal bawah air tembus (mengapung beneran)
    side: DoubleSide,
    fog: false, // gradasi air jangan di-fog (fog gelap nutupin gradasi horizon)
  });
  const oceanWater = new Mesh(oceanGeo, oceanMat);
  oceanWater.position.y = WATER_Y;
  scene.add(oceanWater);
  loaded.ocean = { mesh: oceanWater, geo: oceanGeo, base: oceanBase, mat: oceanMat, zMin: oZMin, zMax: oZMax };

  /* ── Glint: kilau cahaya kepecah di puncak ombak (titik additive) ── */
  const GLINT_N = 240;
  const glintGeo = new BufferGeometry();
  const glintPos = new Float32Array(GLINT_N * 3);
  const glintSeed = new Float32Array(GLINT_N);   // fase denyut tiap titik
  for (let i = 0; i < GLINT_N; i++) {
    glintPos[i * 3] = (rnd() - 0.5) * 150;       // x tersebar
    glintPos[i * 3 + 2] = -10 - rnd() * 85;      // z di area permukaan (depan kamera)
    glintPos[i * 3 + 1] = 0;
    glintSeed[i] = rnd() * Math.PI * 2;
  }
  glintGeo.setAttribute('position', new BufferAttribute(glintPos, 3));
  const glintMat = new PointsMaterial({
    color: '#cfeaff',
    size: 0.05,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    sizeAttenuation: true,
    blending: AdditiveBlending,
  });
  const glint = new Points(glintGeo, glintMat);
  scene.add(glint);

  /** Cat ulang gradasi air per tema: horizon terang → dalam/dekat gelap. */
  function paintOcean(dark) {
    const o = loaded.ocean;
    if (!o) return;
    // [r,g,b] 0-255 — far (horizon) → mid → near (foreground/dalam)
    const far  = dark ? [76, 138, 190] : [186, 228, 240];
    const mid  = dark ? [22, 54, 88]   : [96, 162, 200];
    const near = dark ? [3, 9, 20]     : [16, 52, 78];
    o.mat.opacity = dark ? 0.42 : 0.34;
    const cols = o.geo.attributes.color.array;
    const range = o.zMax - o.zMin;
    for (let i = 0, j = 0; i < o.base.length; i += 3, j += 3) {
      const t = (o.base[i + 2] - o.zMin) / range; // 0 = horizon, 1 = dekat kamera
      const c = t < 0.35
        ? lerpRGB(far, mid, t / 0.35)
        : t < 0.7
          ? lerpRGB(mid, near, (t - 0.35) / 0.35)
          : near;
      cols[j]     = c[0] / 255;
      cols[j + 1] = c[1] / 255;
      cols[j + 2] = c[2] / 255;
    }
    o.geo.attributes.color.needsUpdate = true;
  }
  function lerpRGB(a, b, f) {
    f = Math.max(0, Math.min(1, f));
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  }

  /** Tinggi gelombang di posisi (x,z) pada waktu t — dipakai ocean mesh,
      glint & foam ring biar semua sinkron di permukaan yang sama. */
  function waveY(x, z, t) {
    return (
      Math.sin(x * 0.35 + t * 0.9) * WAVE_AMP * 0.6 +
      Math.sin(z * 0.5 + t * 0.7 + 2.1) * WAVE_AMP * 0.7 +
      Math.sin((x + z) * 0.16 + t * 0.5) * WAVE_AMP * 0.5 +
      /* riak halus frekuensi tinggi — bikin tekstur permukaan dari cahaya */
      Math.sin(x * 1.7 + t * 2.2) * 0.014 +
      Math.sin(z * 2.3 + t * 1.9 + 1.1) * 0.012 +
      Math.sin((x + z) * 0.9 + t * 1.5) * 0.01
    );
  }

  /* ── Salju ── */
  const COUNT = 500;
  const snowGeo = new BufferGeometry();
  const snowPos = new Float32Array(COUNT * 3);
  const snowSpeed = new Float32Array(COUNT);
  const snowDrift = new Float32Array(COUNT);
  const spread = { x: 40, y: 24, z: 20 };
  for (let i = 0; i < COUNT; i++) {
    snowPos[i * 3] = (rnd() - 0.5) * spread.x;
    snowPos[i * 3 + 1] = (rnd() - 0.5) * spread.y;
    snowPos[i * 3 + 2] = (rnd() - 0.5) * spread.z;
    snowSpeed[i] = 0.4 + rnd() * 1.0;
    snowDrift[i] = rnd() * Math.PI * 2;
  }
  snowGeo.setAttribute('position', new BufferAttribute(snowPos, 3));
  const snowMat = new PointsMaterial({
    color: PAL.dark.snow, size: 0.06, transparent: true,
    opacity: 0.42, depthWrite: false, sizeAttenuation: true,
  });
  const snow = new Points(snowGeo, snowMat);
  snow.position.y = 6;
  scene.add(snow);

  /* ── BUBBLES — gelembung warp-dive (Fitur #1) ──
     Partikel naik ke atas; kecepatannya ikut kecepatan scroll →
     pas scroll cepet, gelembung melesat kayak warp menyelam.
     Posisi LOKAL terhadap kamera (group ikut kamera per-frame). */
  const BUBBLE_N = 220;
  const bubbleGeo = new BufferGeometry();
  const bubblePos = new Float32Array(BUBBLE_N * 3);
  const bubbleSpd = new Float32Array(BUBBLE_N);
  for (let i = 0; i < BUBBLE_N; i++) {
    bubblePos[i * 3] = (rnd() - 0.5) * 18;
    bubblePos[i * 3 + 1] = -12 + rnd() * 24;   // -12..12
    bubblePos[i * 3 + 2] = -14 + rnd() * 12;   // -14..-2 (depan kamera)
    bubbleSpd[i] = 0.5 + rnd() * 1.2;
  }
  bubbleGeo.setAttribute('position', new BufferAttribute(bubblePos, 3));
  const bubbleMat = new PointsMaterial({
    color: '#9fd8e8', size: 0.07, transparent: true,
    opacity: 0, depthWrite: false, sizeAttenuation: true,
    blending: AdditiveBlending, fog: false,
  });
  const bubbles = new Points(bubbleGeo, bubbleMat);
  bubbles.visible = false;
  const bubbleRig = new Group(); // ikut kamera biar selalu di sekitar layar
  bubbleRig.add(bubbles);
  scene.add(bubbleRig);

  /* ── MARINE SNOW — debu organik laut dalam (Fitur #2) ──
     Beda sama salju permukaan: drift malas + shimmer halus,
     cuma muncul pas udah masuk kedalaman (diveP > ~0.15). */
  const MARINE_N = 320;
  const marineGeo = new BufferGeometry();
  const marinePos = new Float32Array(MARINE_N * 3);
  const marineDrift = new Float32Array(MARINE_N);
  for (let i = 0; i < MARINE_N; i++) {
    marinePos[i * 3] = (rnd() - 0.5) * 22;
    marinePos[i * 3 + 1] = -14 + rnd() * 28;   // -14..14
    marinePos[i * 3 + 2] = -16 + rnd() * 14;   // -16..-2
    marineDrift[i] = rnd() * Math.PI * 2;
  }
  marineGeo.setAttribute('position', new BufferAttribute(marinePos, 3));
  const marineMat = new PointsMaterial({
    color: '#b8ccd8', size: 0.05, transparent: true,
    opacity: 0, depthWrite: false, sizeAttenuation: true, fog: false,
  });
  const marine = new Points(marineGeo, marineMat);
  marine.visible = false;
  const marineRig = new Group(); // ikut kamera juga
  marineRig.add(marine);
  scene.add(marineRig);

  /* ── GOD RAYS v15 — berkas cahaya realistis.
     Kunci realisme: (a) tekstur gradient lembut (bukan kotak solid),
     (b) ujung atas & bawah memudar, (c) 10 berkas lebar beda-beda,
     (d) denyut tiap berkas beda fase → kesan air bergerak. */
  const rayTex = (() => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 512;
    const g2 = c.getContext('2d');
    // horizontal: terang di tengah, transparan di tepi (soft edge lebar)
    const gx = g2.createLinearGradient(0, 0, 128, 0);
    gx.addColorStop(0, 'rgba(255,255,255,0)');
    gx.addColorStop(0.32, 'rgba(255,255,255,0.82)');
    gx.addColorStop(0.5, 'rgba(255,255,255,1)');
    gx.addColorStop(0.68, 'rgba(255,255,255,0.82)');
    gx.addColorStop(1, 'rgba(255,255,255,0)');
    g2.fillStyle = gx;
    g2.fillRect(0, 0, 128, 512);
    // struktur internal: pita-pita cahaya dalam satu berkas — bukan blok rata
    for (let i = 0; i < 14; i++) {
      const sx = 18 + rnd() * 92;
      const sw = 3 + rnd() * 11;
      const gr = g2.createLinearGradient(sx - sw, 0, sx + sw, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)');
      gr.addColorStop(0.5, 'rgba(255,255,255,0.32)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g2.fillStyle = gr;
      g2.fillRect(sx - sw, 0, sw * 2, 512);
    }
    // vertikal: kuat di permukaan, habis di bawah (cahaya diserap air)
    const gy = g2.createLinearGradient(0, 0, 0, 512);
    gy.addColorStop(0, 'rgba(0,0,0,0)');
    gy.addColorStop(0.1, 'rgba(0,0,0,1)');
    gy.addColorStop(0.55, 'rgba(0,0,0,0.5)');
    gy.addColorStop(1, 'rgba(0,0,0,0)');
    g2.globalCompositeOperation = 'destination-in';
    g2.fillStyle = gy;
    g2.fillRect(0, 0, 128, 512);
    const tex = new CanvasTexture(c);
    return tex;
  })();

  const godRays = new Group();
  for (let i = 0; i < 14; i++) {
    // campuran berkas kurus terang & lebar samar — kaya berlapis
    const w = i % 4 === 0 ? 2.6 + rnd() * 3.2 : 0.7 + rnd() * 2.1;
    const rg = new PlaneGeometry(w, 44 + rnd() * 26);
    // tint per-berkas: biru es, sedikit beda terangnya
    const tint = new Color().setHSL(0.55 + rnd() * 0.03, 0.38, 0.78 + rnd() * 0.14);
    const rm = new MeshBasicMaterial({
      map: rayTex, color: tint, transparent: true, opacity: 0,
      blending: AdditiveBlending, depthWrite: false, side: DoubleSide, fog: false,
    });
    const ray = new Mesh(rg, rm);
    ray.position.set(-22 + i * 3.4 + (rnd() - 0.5) * 3, 15, -8 - rnd() * 14);
    ray.rotation.z = 0.1 + (rnd() - 0.5) * 0.3;
    ray.rotation.y = (rnd() - 0.5) * 0.5;
    ray.userData.baseRoll = ray.rotation.z;
    ray.userData.baseX = ray.position.x;
    ray.userData.sway = 0.3 + rnd() * 0.55;   // drift pelan kiri-kanan
    ray.userData.phase = rnd() * Math.PI * 2;
    ray.userData.peak = 0.09 + rnd() * 0.12;  // tiap berkas beda kuat
    ray.userData.rate = 0.22 + rnd() * 0.45;  // beda kecepatan denyut
    godRays.add(ray);
  }
  scene.add(godRays);

  /* ── Bintang (dark mode aja — malam arktik) ── */
  const STAR_N = 260;
  const starGeo = new BufferGeometry();
  const starPos = new Float32Array(STAR_N * 3);
  const starSeed = new Float32Array(STAR_N);
  for (let i = 0; i < STAR_N; i++) {
    // langit: z jauh (-30..-90), x lebar, y tinggi (4..26)
    starPos[i * 3] = (rnd() - 0.5) * 130;
    starPos[i * 3 + 1] = 4 + rnd() * 24;
    starPos[i * 3 + 2] = -40 - rnd() * 55;
    starSeed[i] = rnd() * Math.PI * 2;
  }
  starGeo.setAttribute('position', new BufferAttribute(starPos, 3));
  const starMat = new PointsMaterial({
    color: '#ffffff', size: 0.16, transparent: true,
    opacity: 0.9, depthWrite: false, sizeAttenuation: true,
    fog: false, // bintang di luar angkasa — jangan kena fog
  });
  const starBase = starPos.slice();
  const stars = new Points(starGeo, starMat);
  stars.visible = false; // nyala di dark mode aja
  scene.add(stars);

  /* ── Bulan pucat — sumber cahaya glint di air ── */
  const moonGeo = new CircleGeometry(1.7, 40);
  const moonMat = new MeshBasicMaterial({
    color: '#e8f0f8', transparent: true, opacity: 0.0,
    fog: false, depthWrite: false, side: DoubleSide,
  });
  const moon = new Mesh(moonGeo, moonMat);
  moon.position.set(-14, 17, -60); // pojok kiri-atas langit
  moon.lookAt(camera.position);
  scene.add(moon);

  

  /* ── Awan tipis: puff lembut multi-lobus, drift pelan di langit ── */
  function makeCloudSprite() {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const ctx = cv.getContext('2d');
    // gradasi latar transparan
    ctx.clearRect(0, 0, 256, 256);
    // 6-8 lobus puff — bentuk awan cumulus beneran (kaya gumpalan kapas)
    const lobes = 6 + Math.floor(rnd() * 3);
    for (let i = 0; i < lobes; i++) {
      const lx = 90 + Math.cos((i / lobes) * Math.PI * 2) * 45 + (rnd() - 0.5) * 25;
      const ly = 118 + Math.sin((i / lobes) * Math.PI * 2) * 22 + (rnd() - 0.5) * 18;
      const lr = 34 + rnd() * 22;
      const g = ctx.createRadialGradient(lx, ly, lr * 0.15, lx, ly, lr);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.55, 'rgba(255,255,255,0.5)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
    }
    const tex = new CanvasTexture(cv);
    return { tex, mat: new SpriteMaterial({
      map: tex, transparent: true, opacity: 0.65,
      depthWrite: false, fog: false,
    }) };
  }
  const cloudSprites = [];
  const CLOUD_N = 7;
  for (let i = 0; i < CLOUD_N; i++) {
    const { tex, mat } = makeCloudSprite();
    const sp = new Sprite(mat);
    const w = 10 + rnd() * 16;
    sp.scale.set(w, w * 0.42, 1);
    sp.position.set(
      (i / CLOUD_N) * 120 - 60 + (rnd() - 0.5) * 12,
      5 + rnd() * 15,
      -28 - rnd() * 38,
    );
    sp.userData = { spd: 0.03 + rnd() * 0.07, y: sp.position.y };
    scene.add(sp);
    cloudSprites.push(sp);
  }

  /* ── Palette theme (v12: dark-only) ── */
  function applyPalette() {
    const p = PAL.dark;
    if (loaded.berg) {
      loaded.berg.traverse((o) => {
        if (o.isMesh && o.material) o.material.color.set(p.ice);
      });
    }
    snowMat.color.set(p.snow);
    scene.fog.color.set(p.fog);
    shipLamp.intensity = 1.4;

    // Bintang & bulan: selalu nyala (malam arktik permanen)
    stars.visible = true;
    moonMat.opacity = 0.85;

    // Awan sprite: putih lembut kena cahaya bulan
    for (const cs of cloudSprites) {
      if (cs.material.color) cs.material.color.set('#cfe0f0');
    }

    paintOcean(true);
  }
  applyPalette();
  const themeObserver = new MutationObserver(() => applyPalette());
  themeObserver.observe(rootEl, { attributes: true, attributeFilter: ['data-theme'] });

  /* ── Interaksi & loop ── */
  const mouse = new Vector2(0, 0);
  const target = new Vector2(0, 0);
  const onPointerMove = (e) => {
    target.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  let visible = true;
  const onVisibility = () => { visible = document.visibilityState === 'visible'; };
  document.addEventListener('visibilitychange', onVisibility);

  let rafId = null;
  const start = performance.now();
  let previousFrame = start;
  const tick = (now) => {
    rafId = requestAnimationFrame(tick);
    const dt = Math.min(0.05, Math.max(0.001, (now - previousFrame) / 1000));
    previousFrame = now;
    if (!visible) return;
    const t = (now - start) / 1000;
    smoothDive += (diveP - smoothDive) * (1 - Math.exp(-4.35 * dt));

    // kecepatan dive (per-detik, dinormalisasi dt) — buat warp bubbles & ripple
    diveVel = (smoothDive - lastDiveP) / dt;
    lastDiveP = smoothDive;

    mouse.lerp(target, 0.028);

    /* Iceberg — hidup: bob + rotasi pelan + miring halus dari mouse */
    if (loaded.berg) {
      const baseX = 4.6, baseY = -1.6;
      loaded.berg.position.x = baseX + Math.sin(t * 0.05) * 0.25;
      loaded.berg.position.y = baseY + Math.sin(t * 0.11 + 1.3) * 0.18;
      loaded.berg.rotation.y = 0.6 + t * 0.025 + mouse.x * 0.06;
      loaded.berg.rotation.z = Math.sin(t * 0.07) * 0.015;
      loaded.berg.rotation.x = -0.03 + mouse.y * -0.035;
    }

    /* Kapal — ombak natural: bob + roll + pitch + drift maju pelan */
    if (loaded.ship) {
      const phase = anims.ship.driftPhase;
      const bob = Math.sin(t * 0.8 + phase) * 0.05;
      const roll = Math.sin(t * 0.55 + phase) * 0.035;
      const pitch = Math.sin(t * 0.7 + phase * 1.3) * 0.025;
      // drift maju pelan (bolak-balik ±0.6 dari base)
      const driftX = Math.sin(t * 0.06 + phase) * 0.5;
      loaded.ship.position.x = -6.8 + driftX;
      loaded.ship.position.y = 0.15 + bob;
      loaded.ship.rotation.z = roll;
      loaded.ship.rotation.x = pitch;
      loaded.ship.rotation.y = 0.35 + Math.sin(t * 0.1 + phase) * 0.03;
      shipLamp.position.x = -6.8 + driftX;
      shipLamp.position.y = 1.4 + bob;
    }

    /* Salju */
    const sp = snowGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      sp[i * 3 + 1] -= snowSpeed[i] * 0.007;
      sp[i * 3] += Math.sin(t * 0.4 + snowDrift[i]) * 0.002;
      if (sp[i * 3 + 1] < -10) {
        sp[i * 3 + 1] = 10 + (rnd() - 0.5) * 4;
        sp[i * 3] = (rnd() - 0.5) * spread.x;
        sp[i * 3 + 2] = (rnd() - 0.5) * spread.z;
      }
    }
    snowGeo.attributes.position.needsUpdate = true;

    /* Ocean: gelombang halus per-vertex via waveY(). depthWrite OFF →
       iceberg/kapal bawah air tembus (mengapung beneran). */
    if (loaded.ocean) {
      const o = loaded.ocean;
      const pos = o.geo.attributes.position.array;
      const n = pos.length / 3;
      for (let i = 0; i < n; i++) {
        pos[i * 3 + 1] = waveY(o.base[i * 3], o.base[i * 3 + 2], t);
      }
      o.geo.attributes.position.needsUpdate = true;
      o.geo.computeVertexNormals();
    }

    // ── SKY FADE (dideklarasi di atas karena dipakai glint & bintang juga) ──
    // fade-out smooth langit pas nyilem: diveP 0.08 → 0.3
    // (1 di permukaan → 0 di kedalaman — "cahaya bulan nggak tembus ke bawah")
    const skyK = 1 - smoothstep(0.08, 0.3, smoothDive);

    /* Glint: titik kilau di puncak ombak — denyut pelan (nyala: nempel
       puncak; mati: dilempar jauh ke bawah biar fog nutupin) */
    if (glintGeo) {
      const gp = glintGeo.attributes.position.array;
      for (let i = 0; i < GLINT_N; i++) {
        const x = gp[i * 3];
        const z = gp[i * 3 + 2];
        const w = waveY(x, z, t);
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + glintSeed[i]);
        const on = pulse > 0.72;
        gp[i * 3 + 1] = on ? w + 0.02 : -30;
      }
      glintGeo.attributes.position.needsUpdate = true;
      glintMat.opacity = 0.85 * skyK;
    }

    /* ── LANDMARK: tampil cuma di rentang kedalamannya, fade halus.
       Posisi tetap di dunia → kamera yang lewat, bukan objek yang ngejar. */
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      const { cfg, phase, baseY } = lm.userData;
      const a = smoothstep(cfg.dp0, cfg.dp0 + 0.09, smoothDive)
              * (1 - smoothstep(cfg.dp1 - 0.09, cfg.dp1, smoothDive));
      lm.visible = a > 0.01;
      if (!lm.visible) continue;
      lm.position.y = baseY + Math.sin(t * 0.25 + phase) * cfg.bob;
      if (cfg.spin) lm.rotation.y = cfg.ry + Math.sin(t * cfg.spin * 6 + phase) * 0.25;
      lm.traverse((o) => {
        if (o.isMesh && o.material) {
          const m = Array.isArray(o.material) ? o.material[0] : o.material;
          m.transparent = true;
          m.opacity = a;
        }
      });
    }

    /* ── GOD RAYS: hidup di permukaan, hilang saat menyelam.
       Denyut per-berkas (fase & laju beda) → air kerasa bergerak. */
    godRays.visible = skyK > 0.015;
    if (godRays.visible) {
      for (let i = 0; i < godRays.children.length; i++) {
        const ray = godRays.children[i];
        const u = ray.userData;
        const pulse = 0.55 + 0.45 * Math.sin(t * u.rate + u.phase);
        ray.material.opacity = skyK * u.peak * pulse;
        ray.position.x = u.baseX + Math.sin(t * 0.11 + u.phase) * u.sway;
        ray.rotation.z = u.baseRoll + Math.sin(t * 0.19 + u.phase) * 0.025;
      }
    }

    /* Bintang: kelap-kelip pelan (naik-turun ukuran/opacity) */
    if (stars.visible) {
      const sp2 = starGeo.attributes.position.array;
      for (let i = 0; i < STAR_N; i++) {
        const tw = 0.5 + 0.5 * Math.sin(t * 1.2 + starSeed[i] * 3);
        // naik-turunin y sedikit = efek kerlip
        sp2[i * 3 + 1] = starBase[i * 3 + 1] + tw * 0.08;
      }
      starGeo.attributes.position.needsUpdate = true;
      // kerlip + fade dive (skyK = 1 di permukaan, 0 di kedalaman)
      starMat.opacity = (0.55 + 0.35 * Math.sin(t * 0.9)) * skyK;
    }

    /* Awan tipis: drift pelan ke kanan, wrap */
    for (const sp of cloudSprites) {
      sp.position.x += sp.userData.spd * 0.016;
      if (sp.position.x > 55) sp.position.x = -55;
    }

    /* ── DIVE: kamera nyilem (objek surface DIAM — ditinggal kamera) ──
       EASING (inersia air): smoothDive ngejar diveP pelan (kritis 1-exp).
       Hasilnya gerakan butter-smooth, bukan elevator kaku. */
    const camTargetY = lerpArr(DIVE.camY, smoothDive);
    const camTargetZ = lerpArr(DIVE.camZ, smoothDive);
    if (smoothDive > 0.001) {
      camera.position.y = camTargetY;
      camera.position.z = camTargetZ;
      scene.fog.far = lerpArr(DIVE.fogFar, smoothDive) + lerpArr(DIVE.fogFarBoost, smoothDive);
      scene.fog.near = Math.max(8, scene.fog.far * 0.42);
      ambient.intensity = lerpArr(DIVE.amb, smoothDive);
      key.intensity = lerpArr(DIVE.keyI, smoothDive);
      scene.background.set(lerpHexArr(DIVE.bg, smoothDive));
      scene.fog.color.set(lerpHexArr(DIVE.fog, smoothDive));
      // objek permukaan (iceberg & tugboat) tenggelam ke kabut saat menyelam —
      // zona Tentang/Karya (#091526/#050c17) bebas dari es teal keporos key light
      const surfK = 1 - smoothstep(0.04, 0.3, smoothDive);
      if (loaded.berg) {
        loaded.berg.visible = surfK > 0.01;
        loaded.berg.traverse(o => { if (o.isMesh) o.material.opacity = surfK; });
      }
      if (loaded.ship) {
        loaded.ship.visible = surfK > 0.01;
        loaded.ship.traverse(o => {
          if (!o.isMesh) return;
          const m = Array.isArray(o.material) ? o.material[0] : o.material;
          m.opacity = surfK;
        });
      }
      // lampu penyelam menguat di kegelapan (0 di permukaan → 1.9 di palung)
      const lampK = smoothstep(0.12, 0.55, smoothDive);
      diveLamp.intensity = lampK * 1.9;
      lampRim.intensity = lampK * 0.55;
      diveLamp.position.set(camera.position.x, camera.position.y + 1.2, camera.position.z + 2);
    } else {
      diveLamp.intensity = 0;
      lampRim.intensity = 0;
      if (loaded.berg) { loaded.berg.visible = true; loaded.berg.traverse(o => { if (o.isMesh) o.material.opacity = 1; }); }
      if (loaded.ship) { loaded.ship.visible = true; loaded.ship.traverse(o => { if (o.isMesh) { const m = Array.isArray(o.material) ? o.material[0] : o.material; m.opacity = 1; } }); }
      camera.position.x = 0;
      camera.position.y = 3.2;
      camera.position.z = 17;
      scene.fog.near = 34;
      scene.fog.far = 80;
      scene.fog.color.set('#0b1220');
      ambient.intensity = 0.38;
      key.intensity = 1.7;
      scene.background.set('#0b1220');
    }
    // kamera menatap lurus ke depan-turun (kesan menyelam miring)
    camera.lookAt(0, camera.position.y, 0);

    // langit & salju & glint: fade-out SMOOTH pas mulai nyilem (skyK di atas).
    stars.visible = skyK > 0.01;
    moon.visible = skyK > 0.01;
    moonMat.opacity = 0.85 * skyK;
    snow.visible = skyK > 0.01;
    snowMat.opacity = 0.42 * skyK;
    for (const sp of cloudSprites) {
      sp.visible = skyK > 0.01;
      if (sp.material.opacity !== undefined) sp.material.opacity = 0.65 * skyK;
    }
    if (glintMat) glintMat.opacity = 0.85 * skyK;
    // ocean tetap ada (kita nyilem DI dalam air yang sama) — turunkan dikit
    // biar nggak nutupin kamera pas dive dalam
    if (loaded.ocean) {
      loaded.ocean.mesh.position.y = WATER_Y;
      // ocean keliatan TEAL dari bawah (DoubleSide) — fade cepat begitu nyelam,
      // biar zona Tentang (#091526) nggak kecuci langit-langit biru terang
      loaded.ocean.mesh.material.opacity = 1 - smoothstep(0.015, 0.14, smoothDive);
      loaded.ocean.mesh.visible = loaded.ocean.mesh.material.opacity > 0.005;
    }

    /* Fauna: nyilem BERSAMA kamera (posisi relatif kamera + offset zona)
       + SWIM-BY: tiap fauna punya orbit pelan; sesekali lintas depan kamera
       lewat sinus lebih lebar di x (choreography alami). */
    const fVis = (arr, on) => {
      for (const f of arr) {
        if (!f) continue;
        f.visible = on;
        if (f.userData.glow) f.userData.glow.visible = on; // glow ikut parent
      }
    };
    // fade zona halus: alpha 0→1 di pinggir window zona (bukan hard on/off)
    const zoneAlpha = (p, a, b) => smoothstep(a, a + 0.06, p) * (1 - smoothstep(b - 0.06, b, p));
    const zAlpha = {
      jelly:  zoneAlpha(diveP, 0.08, 0.45),
      fish:   zoneAlpha(diveP, 0.30, 0.72),
      octo:   zoneAlpha(diveP, 0.56, 0.94),
      angler: smoothstep(0.78, 0.86, diveP),
    };
    fVis(fauna.jelly,  zAlpha.jelly  > 0.01);
    fVis(fauna.fish,   zAlpha.fish   > 0.01);
    fVis(fauna.octo,   zAlpha.octo   > 0.01);
    fVis(fauna.angler, zAlpha.angler > 0.01);
    for (const key of ['jelly', 'fish', 'octo', 'angler']) {
      const slots = faunaPlace[key];
      const za = zAlpha[key];
      for (let i = 0; i < fauna[key].length; i++) {
        const f = fauna[key][i];
        if (!f || !f.visible) continue;
        if (f.userData.glow) f.userData.glow.material.opacity = za * 0.55;
        const slot = slots[i];
        const ph = f.userData.phase;
        // PARALLEL DIVE: fauna nemenin kamera turun — offset statis + drift
        // kecil. HIDUNG NUNDUK ke arah gerak (ke bawah), bukan side-view.
        const sway = Math.sin(t * 0.5 + ph) * 0.35;
        f.position.set(
          camera.position.x + slot.x + sway * 0.6,
          camera.position.y + slot.y + Math.sin(t * 0.8 + ph) * 0.25,
          camera.position.z + slot.z,
        );
        // orientasi: miring ke bawah (pitch) — selaras arah menyelam,
        // wobble pelan biar hidup. Nggak ada lagi pemandangan samping.
        f.rotation.x = 0.85 + Math.sin(t * 0.4 + ph) * 0.1;   // pitch nunduk ~49°
        f.rotation.y = Math.sin(t * 0.25 + ph) * 0.12;        // yaw tipis aja
        f.rotation.z = Math.sin(t * 0.3 + ph) * 0.08;         // roll micro
        // muncul halus: scale naik dari 0.6 → 1 sesuai alpha zona
        const s = slot.s * (0.6 + 0.4 * za);
        f.scale.setScalar(s);
        // glow sprite ikut fauna + denyut (denyut diperkuat di laut dalam)
        const gl = f.userData.glow;
        if (gl) {
          gl.position.copy(f.position);
          gl.position.z += 0.5;
          gl.material.opacity = (0.45 + 0.3 * Math.sin(t * 1.4 + ph)) * Math.min(1, za + 0.2);
        }
      }
    }

    

    /* ── BUBBLES warp-dive (Fitur #1) ──
       Kecepatan scroll (diveVel) nambah boost naik → warp effect. */
    bubbleRig.position.copy(camera.position);
    const bOp = Math.min(1, Math.abs(diveVel) * 260 + smoothstep(0.1, 0.35, diveP) * 0.35);
    bubbles.visible = bOp > 0.02;
    if (bubbles.visible) {
      bubbleMat.opacity = Math.min(0.55, bOp);
      const bp = bubbleGeo.attributes.position.array;
      for (let i = 0; i < BUBBLE_N; i++) {
        const boost = 1 + Math.min(30, Math.abs(diveVel) * 4200);
        bp[i * 3 + 1] += bubbleSpd[i] * 0.012 * boost;
        bp[i * 3] += Math.sin(t * 1.7 + i) * 0.004; // goyang tipis
        if (bp[i * 3 + 1] > 13) { // respawn bawah
          bp[i * 3] = (rnd() - 0.5) * 18;
          bp[i * 3 + 1] = -13;
          bp[i * 3 + 2] = -14 + rnd() * 12;
        }
      }
      bubbleGeo.attributes.position.needsUpdate = true;
    }

    /* ── MARINE SNOW (Fitur #2) — drift malas + shimmer, makin dalam makin terlihat */
    marineRig.position.copy(camera.position);
    const mOpDeep = smoothstep(0.12, 0.4, diveP) * 0.5;
    marine.visible = mOpDeep > 0.02;
    if (marine.visible) {
      marineMat.opacity = mOpDeep;
      const mp = marineGeo.attributes.position.array;
      for (let i = 0; i < MARINE_N; i++) {
        mp[i * 3 + 1] -= 0.004 + Math.sin(t * 0.8 + marineDrift[i]) * 0.002; // jatuh super pelan
        mp[i * 3] += Math.cos(t * 0.5 + marineDrift[i]) * 0.003;             // drift lateral
        const shimmer = Math.sin(t * 2.2 + marineDrift[i] * 4);
        if (shimmer > 0.96 && rnd() > 0.5) mp[i * 3 + 2] += 0.3; // kelap-kelip posisi tipis
        if (mp[i * 3 + 1] < -15) mp[i * 3 + 1] = 15;             // wrap vertikal
        if (mp[i * 3] > 12) mp[i * 3] = -12; else if (mp[i * 3] < -12) mp[i * 3] = 12;
      }
      marineGeo.attributes.position.needsUpdate = true;
    }

    /* ── SCREEN RIPPLE (Fitur #3) — dua layer:
       (a) kamera: roll + sway halus dari kecepatan scroll (murah, tanpa post-processing)
       (b) overlay DOM: garis-garis air diagonal muncul pas scroll cepat ── */
    const rip = Math.min(1, Math.abs(diveVel) * 300);
    camera.rotation.z += Math.sin(t * 9) * 0.004 * rip;         // roll getar halus
    camera.rotation.x += Math.sin(t * 7.3 + 1.2) * 0.002 * rip; // pitch micro
    if (rippleEl) {
      rippleEl.style.opacity = (rip * 0.8).toFixed(3);
      rippleEl.style.transform = `translateY(${(t * 40 * rip) % 31}px)`;
    }

    /* ── VIGNETTE (Fitur #5) — tekanan air: pinggir layar makin pekat di palung */
    if (vignetteEl) {
      const v = 0.25 + smoothstep(0.35, 1, diveP) * 0.55; // 25% → 80%
      vignetteEl.style.opacity = v.toFixed(3);
    }

    renderer.render(scene, camera);
  };
  rafId = requestAnimationFrame(tick);

  const onResize = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    if (w < 768) { dispose(); return; }
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize, { passive: true });

  function dispose() {
    cancelAnimationFrame(rafId);
    themeObserver.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    [snowGeo].forEach((g) => g.dispose());
    snowMat.dispose();
    if (loaded.ocean) {
      loaded.ocean.geo.dispose();
      loaded.ocean.mat.dispose();
    }
    if (glintGeo) {
      glintGeo.dispose();
      glintMat.dispose();
    }
    starGeo.dispose();
    starMat.dispose();
    moonGeo.dispose();
    moonMat.dispose();
    for (const cs of cloudSprites) {
      cs.material.map.dispose();
      cs.material.dispose();
    }
    renderer.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  }

  return { dispose, scene, camera, loader, setDive };
}

/* Interpolasi array 5 titik (0, .25, .5, .75, 1) → nilai halus */
function lerpArr(arr, p) {
  const seg = Math.min(p * (arr.length - 1), arr.length - 1);
  const i = Math.floor(seg);
  const f = seg - i;
  if (i >= arr.length - 1) return arr[arr.length - 1];
  return arr[i] + (arr[i + 1] - arr[i]) * f;
}

/* PRNG deterministik */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
