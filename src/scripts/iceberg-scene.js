/**
 * iceberg-scene.js — "Midnight Arctic" hero scene (v4 — GLB assets)
 * ---------------------------------------------------------------
 * Adegan permukaan arctic full-bleed di belakang hero homepage.
 *
 * v4: pakai GLB asli dari Poly Pizza (CC-BY):
 *  - /models/iceberg.glb  — "Iceberg 1" (S. Paul Michael)
 *  - /models/tugboat.glb  — "Tugboat" (Poly by Google)
 * Keduanya di-scale/posisi manual. Aurora & salju procedural
 * (tipis & halus). Palette & visibilitas aurora ikut [data-theme].
 *
 * Guard: reduced-motion → null; <768px → null; WebGL absent → null;
 * dynamic import three + GLTFLoader; visibilitychange pause; resize.
 */
export async function initIcebergScene(container) {
  const prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  if (prefersReduced || isMobile) return null;

  const { WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, MeshStandardMaterial,
          MeshBasicMaterial, BufferGeometry, BufferAttribute, Points, PointsMaterial,
          Fog, AmbientLight, DirectionalLight, PointLight, Color, Vector2, Vector3, Box3 } =
    await import('three');
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
    dark:  { ice: '#dce6f2', snow: '#dcecf7', fog: '#0b1220', aurora: true  },
    light: { ice: '#eef4fa', snow: '#ffffff', fog: '#dcebf5', aurora: false },
  };

  const scene = new Scene();
  scene.background = null;
  scene.fog = new Fog(new Color(PAL.dark.fog), 32, 78);

  const viewport = container.getBoundingClientRect();
  const camera = new PerspectiveCamera(40, viewport.width / Math.max(viewport.height, 1), 0.1, 200);
  camera.position.set(0, 3.4, 18);
  camera.lookAt(0, 1.6, 0);

  renderer.setSize(viewport.width, viewport.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  Object.assign(renderer.domElement.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%',
  });
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  /* ── Lighting ── */
  const key = new DirectionalLight('#56c8e8', 2.2);
  key.position.set(-5, 6, 7);
  const fill = new DirectionalLight('#3d5a80', 0.6);
  fill.position.set(6, -1, 5);
  const ambient = new AmbientLight('#7fa8c9', 0.4);
  scene.add(key, fill, ambient);

  const rnd = mulberry32(20260909);
  const loaded = { berg: null, ship: null };

  /* ── Load GLB asli (berg & ship) ── */
  const loader = new GLTFLoader();
  const loadModel = (url) =>
    new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));

  const normalize = (obj, targetSize) => {
    const box = new Box3().setFromObject(obj);
    const size = box.getSize(new Vector3());
    const scale = targetSize / Math.max(size.x, size.y, size.z, 0.001);
    obj.scale.setScalar(scale);
    // Geser supaya "berdiri" di y=0 (dasar box di 0)
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
          color: PAL.dark.ice, roughness: 0.32, metalness: 0.0,
        });
      }
    });
    normalize(berg, 8.0);
    berg.position.x = 5.4;
    berg.position.y = -2.0;
    berg.position.z = -6.5;
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
    normalize(ship, 3.0);
    ship.position.x = -7.4;
    ship.position.y = 0.2;
    ship.position.z = 1.8;
    ship.rotation.y = 0.5;
    scene.add(ship);
    loaded.ship = ship;
  }

  const shipLamp = new PointLight('#ffb46b', 1.2, 12, 2);
  shipLamp.position.set(-7.4, 1.2, 2.0);
  scene.add(shipLamp);

  /* ── Aurora: 3 pita tipis additive ── */
  const auroraGroup = new Group();
  const auroraBands = [];
  const AURORA_COLORS = ['#2fd48a', '#3ab8e8', '#7dffc4'];
  for (let b = 0; b < 3; b++) {
    const seg = 80;
    const pGeo = new BufferGeometry();
    const w = 26 + b * 6;
    const positions = new Float32Array((seg + 1) * 2 * 3);
    for (let i = 0; i <= seg; i++) {
      const x = (i / seg - 0.5) * w;
      positions[i * 6] = x; positions[i * 6 + 1] = 0.35; positions[i * 6 + 2] = 0;
      positions[i * 6 + 3] = x; positions[i * 6 + 4] = -0.35; positions[i * 6 + 5] = 0;
    }
    pGeo.setAttribute('position', new BufferAttribute(positions, 3));
    const idx = [];
    for (let i = 0; i < seg; i++) {
      const a = i * 2, b2 = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
      idx.push(a, b2, c, b2, d, c);
    }
    pGeo.setIndex(idx);
    const pMat = new MeshBasicMaterial({
      color: AURORA_COLORS[b % AURORA_COLORS.length],
      transparent: true, opacity: 0.045 + b * 0.012,
      blending: 2, side: 2, depthWrite: false,
    });
    const band = new Mesh(pGeo, pMat);
    band.position.set(-2 + b * 2.5, 8.4 + b * 0.7, -13 - b * 3);
    band.rotation.z = 0.1 * (b % 2 === 0 ? 1 : -1);
    auroraGroup.add(band);
    auroraBands.push({ mesh: band, geo: pGeo, phase: b * 1.8, amp: 0.5 + b * 0.12 });
  }
  scene.add(auroraGroup);

  /* ── Salju ── */
  const COUNT = 600;
  const snowGeo = new BufferGeometry();
  const snowPos = new Float32Array(COUNT * 3);
  const snowSpeed = new Float32Array(COUNT);
  const snowDrift = new Float32Array(COUNT);
  const spread = { x: 36, y: 22, z: 18 };
  for (let i = 0; i < COUNT; i++) {
    snowPos[i * 3] = (rnd() - 0.5) * spread.x;
    snowPos[i * 3 + 1] = (rnd() - 0.5) * spread.y;
    snowPos[i * 3 + 2] = (rnd() - 0.5) * spread.z;
    snowSpeed[i] = 0.4 + rnd() * 1.1;
    snowDrift[i] = rnd() * Math.PI * 2;
  }
  snowGeo.setAttribute('position', new BufferAttribute(snowPos, 3));
  const snowMat = new PointsMaterial({
    color: PAL.dark.snow, size: 0.07, transparent: true,
    opacity: 0.4, depthWrite: false, sizeAttenuation: true,
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
    auroraGroup.visible = isDark() && p.aurora;
    shipLamp.intensity = isDark() ? 1.2 : 0.85;
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

    mouse.lerp(target, 0.03);

    if (loaded.berg) {
      loaded.berg.rotation.y = t * 0.04 + mouse.x * 0.05;
      loaded.berg.rotation.x = -0.02 + mouse.y * -0.03;
    }
    if (loaded.ship) {
      loaded.ship.rotation.z = Math.sin(t * 0.5) * 0.02;
      loaded.ship.rotation.x = Math.sin(t * 0.4 + 1) * 0.012;
    }

    for (const band of auroraBands) {
      const ap = band.geo.attributes.position;
      const arr = ap.array;
      for (let i = 0; i <= 80; i++) {
        const x = arr[i * 6];
        const wave = Math.sin(x * 0.12 + t * 0.22 + band.phase) * band.amp
                   + Math.sin(x * 0.3 - t * 0.15) * 0.3;
        arr[i * 6 + 1] = 0.35 + wave;
        arr[i * 6 + 4] = -0.35 + wave;
      }
      ap.needsUpdate = true;
    }

    const sp = snowGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      sp[i * 3 + 1] -= snowSpeed[i] * 0.007;
      sp[i * 3] += Math.sin(t * 0.4 + snowDrift[i]) * 0.002;
      if (sp[i * 3 + 1] < -9) {
        sp[i * 3 + 1] = 9 + (rnd() - 0.5) * 4;
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
    [snowGeo, ...auroraBands.map((b) => b.geo)].forEach((g) => g.dispose());
    auroraBands.forEach((b) => b.mesh.material.dispose());
    snowMat.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  }

  return { dispose };
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
