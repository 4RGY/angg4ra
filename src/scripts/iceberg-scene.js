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
          Points, PointsMaterial, BufferGeometry, BufferAttribute, Fog, AmbientLight,
          DirectionalLight, PointLight, Color, Vector2, Vector3, Box3, MathUtils } = THREE;
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
  const loaded = { berg: null, ship: null };
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

  const [bergGltf, shipGltf] = await Promise.allSettled([
    loadModel('/models/iceberg.glb'),
    loadModel('/models/tugboat.glb'),
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

  const shipLamp = new PointLight('#ffb46b', 1.4, 12, 2);
  shipLamp.position.set(-6.8, 1.4, 1.5);
  scene.add(shipLamp);

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
