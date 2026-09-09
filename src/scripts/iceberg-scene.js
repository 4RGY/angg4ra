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
  const isDark = () => (rootEl.getAttribute('data-theme') || 'dark') !== 'light';

  const PAL = {
    dark:  { ice: '#dce6f2', snow: '#dcecf7', fog: '#0b1220' },
    light: { ice: '#eef4fa', snow: '#ffffff', fog: '#dcebf5' },
  };

  const scene = new Scene();
  scene.background = null;
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
  scene.add(key, rim, ambient);

  const rnd = mulberry32(20260909);
  const loaded = { berg: null, ship: null, ocean: null };
  const anims = { ship: { driftPhase: rnd() * Math.PI * 2 } };

  /* ── Load GLB ── */
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

  const [bergGltf, shipGltf, gullGltf, cloudGltf] = await Promise.allSettled([
    loadModel('/models/iceberg.glb'),
    loadModel('/models/tugboat.glb'),
    loadModel('/models/seagull.glb'),
    loadModel('/models/cloud2.glb'),
  ]);

  if (bergGltf.status === 'fulfilled') {
    const berg = bergGltf.value.scene;
    berg.traverse((o) => {
      if (o.isMesh) {
        o.material = new MeshStandardMaterial({
          color: PAL.dark.ice, roughness: 0.3, metalness: 0.02,
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
      }
    });
    normalize(ship, 3.2);
    // Placement: kiri-bawah, menghadap iceberg
    ship.position.set(-6.8, 0.15, 1.2);
    ship.rotation.y = 0.35;
    scene.add(ship);
    loaded.ship = ship;
  }

  /* ── Burung camar: 3 ekor, orbit pelan di langit ── */
  const gulls = [];
  if (gullGltf.status === 'fulfilled') {
    const gullSrc = gullGltf.value.scene;
    // pakai material asli model (camar putih) — biar kontras di langit
    gullSrc.traverse((o) => {
      if (o.isMesh && o.material) {
        const m = Array.isArray(o.material) ? o.material[0] : o.material;
        m.roughness = 0.8;
        m.metalness = 0;
      }
    });
    for (let i = 0; i < 3; i++) {
      const g = gullSrc.clone(true);
      const s = 0.15 + rnd() * 0.15;  // kecil banget — kesan sangat jauh
      g.scale.setScalar(s);
      const ang = (i / 3) * Math.PI * 2 + rnd() * 0.8;
      const rad = 38 + rnd() * 10;    // radius gerak lebar
      const zBase = -70 - rnd() * 15; // dasar z — sangat jauh (kamera di z=17)
      g.position.set(Math.cos(ang) * rad, 9 + rnd() * 5, zBase);
      g.userData = { ang, rad, spd: 0.01 + rnd() * 0.01, y0: g.position.y, zBase };
      scene.add(g);
      gulls.push(g);
    }
  }

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

  /* ── Awan 3D (cloud2.glb — Cumulus Clouds 5, 10.4k tris) ── */
  const cloud3d = [];
  if (cloudGltf.status === 'fulfilled') {
    const cloudSrc = cloudGltf.value.scene;
    cloudSrc.traverse((o) => {
      if (o.isMesh && o.material) {
        // MeshBasicMaterial — nggak kena lighting, putih bersih kayak awan
        // (MeshStandardMaterial kena ambient redup → keliatan abu-abu gelap)
        o.material = new MeshBasicMaterial({
          color: '#ffffff',
          transparent: true,
          opacity: 0.55,
          fog: false,
        });
      }
    });
    // 5 awan, drift pelan — sebar di langit, jarak aman dari iceberg
    for (let i = 0; i < 5; i++) {
      const cl = cloudSrc.clone(true);
      // skala besar — keliatan jelas di langit
      const s = 2.0 + rnd() * 2.0;
      cl.scale.setScalar(s);
      // sebar merata di x, TINGGI di langit y 10-20, z -30..-50 (masuk frame atas)
      cl.position.set(
        -50 + (i / 4) * 100 + (rnd() - 0.5) * 15,
        10 + rnd() * 10,
        -30 - rnd() * 20,
      );
      cl.userData = { spd: 0.06 + rnd() * 0.1, y: cl.position.y };
      scene.add(cl);
      cloud3d.push(cl);
    }
  }

  /* ── Awan tipis: 4 sprite lembut, drift pelan di langit ── */
  function makeCloudSprite() {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const ctx = cv.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
    g.addColorStop(0, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new CanvasTexture(cv);
    return { tex, mat: new SpriteMaterial({
      map: tex, transparent: true, opacity: 0.35,
      depthWrite: false, fog: false,
    }) };
  }
  const cloudSprites = [];
  const CLOUD_N = 6;
  for (let i = 0; i < CLOUD_N; i++) {
    const { tex, mat } = makeCloudSprite();
    const sp = new Sprite(mat);
    const w = 9 + rnd() * 12;
    sp.scale.set(w, w * 0.3, 1);
    sp.position.set((rnd() - 0.5) * 110, 7 + rnd() * 12, -30 - rnd() * 35);
    sp.userData = { spd: 0.04 + rnd() * 0.08, y: sp.position.y };
    scene.add(sp);
    cloudSprites.push(sp);
  }

  /* ── Palette theme ── */
  function applyPalette() {
    const p = isDark() ? PAL.dark : PAL.light;
    if (loaded.berg) {
      loaded.berg.traverse((o) => {
        if (o.isMesh && o.material) o.material.color.set(p.ice);
      });
    }
    snowMat.color.set(p.snow);
    scene.fog.color.set(p.fog);
    shipLamp.intensity = isDark() ? 1.4 : 0.9;

    // Bintang: nyala di dark (malam arktik), mati di light (siang)
    stars.visible = isDark();
    // Bulan: samar di dark, nyaris nggak keliatan di light (siang terang)
    moonMat.opacity = isDark() ? 0.85 : 0.1;

    paintOcean(isDark());
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
  const tick = (now) => {
    rafId = requestAnimationFrame(tick);
    if (!visible) return;
    const t = (now - start) / 1000;

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
      glintMat.opacity = 0.85;
    }

    /* Bintang: kelap-kelip pelan (naik-turun ukuran/opacity) */
    if (stars.visible) {
      const sp2 = starGeo.attributes.position.array;
      for (let i = 0; i < STAR_N; i++) {
        const tw = 0.5 + 0.5 * Math.sin(t * 1.2 + starSeed[i] * 3);
        // naik-turunin y sedikit = efek kerlip
        sp2[i * 3 + 1] = starPos[i * 3 + 1] + tw * 0.08;
      }
      starGeo.attributes.position.needsUpdate = true;
      starMat.opacity = 0.55 + 0.35 * Math.sin(t * 0.9);
    }

    /* Burung camar: orbit pelan di langit */
    for (const g of gulls) {
      const u = g.userData;
      u.ang += u.spd * 0.016;
      g.position.x = Math.cos(u.ang) * u.rad;
      // gerak melingkar halus di sekitar zBase (jauh), nggak nembus ke depan
      g.position.z = u.zBase + Math.sin(u.ang) * u.rad * 0.25;
      g.position.y = u.y0 + Math.sin(t * 0.7 + u.ang) * 0.4;
      g.rotation.y = -u.ang; // menghadap arah gerak
    }

    /* Awan 3D: drift pelan ke kanan, wrap */
    for (const cl of cloud3d) {
      cl.position.x += cl.userData.spd * 0.016;
      if (cl.position.x > 55) cl.position.x = -55;
    }

    /* Awan tipis: drift pelan ke kanan, wrap */
    for (const sp of cloudSprites) {
      sp.position.x += sp.userData.spd * 0.016;
      if (sp.position.x > 55) sp.position.x = -55;
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
    for (const cl of cloud3d) {
      cl.traverse((o) => {
        if (o.isMesh) o.material.dispose();
      });
    }
    for (const g of gulls) {
      g.traverse((o) => {
        if (o.isMesh) o.material.dispose();
      });
    }
    renderer.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  }

  return { dispose, scene, camera, loader };
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
