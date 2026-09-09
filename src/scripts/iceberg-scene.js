/**
 * iceberg-scene.js — "Midnight Arctic" hero scene (v2)
 * ---------------------------------------------------------------
 * Satu kanvas WebGL di belakang hero homepage.
 * Adegan "permukaan arctic": iceberg full-bleed, kapal ekspedisi
 * kecil dengan lampu hangat, aurora (dark mode), salju, laut.
 *
 * Konsep "siang & malam di laut":
 *  - dark  → malam arctic: es gelap + rim cyan, aurora, bioluminescence
 *  - light → siang arctic: es putih-biru, langit pucat, tanpa aurora
 * Scene membaca [data-theme] di <html> dan bereaksi saat berubah.
 *
 * Guard (konsisten dgn gsap-animations.js):
 *  - prefers-reduced-motion: reduce → null (tidak mount)
 *  - layar < 768px / WebGL absent → null (fallback statis)
 *  - dynamic import dari komponen → three TIDAK di bundle awal
 *  - visibilitychange → pause; resize → re-fit
 */
export async function initIcebergScene(container) {
  const prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  if (prefersReduced || isMobile) return null;

  const { WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, MeshStandardMaterial,
          MeshBasicMaterial, PlaneGeometry, IcosahedronGeometry, BoxGeometry,
          CylinderGeometry, Points, PointsMaterial, BufferGeometry, BufferAttribute,
          Fog, AmbientLight, DirectionalLight, PointLight, Color, Vector2, Vector3 } =
    await import('three');

  let renderer = null;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }

  const rootEl = document.documentElement;
  const theme = () => rootEl.getAttribute('data-theme') || 'dark';
  const isDark = () => theme() !== 'light';

  const PALETTES = {
    dark: {
      iceberg: '#1b2a42', icebergUnder: '#0d1830', hint: '#0f1b30',
      snow: '#dcecf7', shipHull: '#16222e', shipLight: '#ffb46b',
      fog: '#0b1220', aurora: true,
    },
    light: {
      iceberg: '#e8f0f7', icebergUnder: '#bcd4e6', hint: '#a8c6dc',
      snow: '#ffffff', shipHull: '#2c4356', shipLight: '#ff9d45',
      fog: '#dcebf5', aurora: false,
    },
  };

  const scene = new Scene();
  scene.background = null; // bg dari CSS
  scene.fog = new Fog(new Color(PALETTES.dark.fog), 30, 70);

  const viewport = container.getBoundingClientRect();
  const camera = new PerspectiveCamera(42, viewport.width / Math.max(viewport.height, 1), 0.1, 200);
  camera.position.set(0, 2.6, 17);
  camera.lookAt(0, 1.2, 0);

  renderer.setSize(viewport.width, viewport.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  Object.assign(renderer.domElement.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%',
  });
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  /* ── Lampu: rim cyan kiri, fill biru kanan, ambient ── */
  const key = new DirectionalLight('#56c8e8', 1.5);
  key.position.set(-6, 5, 6);
  const fill = new DirectionalLight('#4a6a9a', 0.45);
  fill.position.set(6, -2, 4);
  const ambient = new AmbientLight('#8fb6d9', 0.3);
  scene.add(key, fill, ambient);

  /* ── Iceberg (full-bleed, kanan) ── */
  const icebergGroup = new Group();
  const geo = new IcosahedronGeometry(3.6, 3);
  const pos = geo.attributes.position;
  const base = new Vector3(), disp = new Vector3();
  const rnd = mulberry32(20260909);
  for (let i = 0; i < pos.count; i++) {
    base.fromBufferAttribute(pos, i);
    const n =
      0.75 * Math.sin(base.x * 1.7 + 1.3) * Math.cos(base.y * 1.4 + 0.7) * Math.sin(base.z * 1.5 + 2.1) +
      0.4 * Math.sin(base.x * 3.1 + 0.4) * Math.cos(base.z * 2.7 + 1.1) * Math.sin(base.y * 2.9 + 3.3) +
      0.22 * Math.sin((base.x + base.y + base.z) * 4.3) +
      (rnd() - 0.5) * 0.28;
    disp.copy(base).multiplyScalar(1 + n * 0.32);
    pos.setXYZ(i, disp.x, disp.y, disp.z);
  }
  geo.computeVertexNormals();

  const iceMat = new MeshStandardMaterial({
    color: PALETTES.dark.iceberg, roughness: 0.55, metalness: 0.12,
    flatShading: true, transparent: true, opacity: 0.96,
  });
  const iceberg = new Mesh(geo, iceMat);
  iceberg.position.y = -1.7;
  icebergGroup.add(iceberg);

  // Dasar tersembunyi (bawah permukaan)
  const hintGeo = new IcosahedronGeometry(3.9, 2);
  const hintMat = new MeshStandardMaterial({
    color: PALETTES.dark.hint, roughness: 0.8, metalness: 0,
    transparent: true, opacity: 0.35, flatShading: true,
  });
  const hint = new Mesh(hintGeo, hintMat);
  hint.position.y = -4.6;
  hint.scale.set(1.15, 0.55, 1.15);
  icebergGroup.add(hint);

  icebergGroup.position.set(4.6, -1.4, -5);
  scene.add(icebergGroup);

  /* ── Kapal ekspedisi kecil (kiri, lampu hangat) ── */
  const ship = new Group();
  const hullMat = new MeshStandardMaterial({
    color: PALETTES.dark.shipHull, roughness: 0.7, metalness: 0.2, flatShading: true,
  });
  const hull = new Mesh(new BoxGeometry(2.2, 0.5, 0.7), hullMat);
  hull.position.y = 0;
  ship.add(hull);

  const cabinMat = new MeshStandardMaterial({
    color: '#e8eef4', roughness: 0.5, metalness: 0.05, flatShading: true,
  });
  const cabin = new Mesh(new BoxGeometry(0.8, 0.45, 0.5), cabinMat);
  cabin.position.set(-0.2, 0.42, 0);
  ship.add(cabin);

  const mast = new Mesh(new CylinderGeometry(0.04, 0.04, 1.4, 6), hullMat);
  mast.position.set(0.7, 0.85, 0);
  ship.add(mast);

  const lamp = new PointLight('#ffb46b', 0.9, 9, 2);
  lamp.position.set(0.2, 0.75, 0.4);
  ship.add(lamp);

  ship.position.set(-7.5, 0.5, 1.2);
  ship.scale.setScalar(1.15);
  scene.add(ship);

  /* ── Aurora (dark only): 3 pita melengkung, additive ── */
  const auroraGroup = new Group();
  const AURORA_COLORS = ['#3ecf8e', '#56c8e8', '#7dffc4'];
  const auroraBands = [];
  for (let b = 0; b < 3; b++) {
    const w = 14 + b * 4;
    const seg = 64;
    const pGeo = new PlaneGeometry(w, 1.4, seg, 1);
    const pMat = new MeshBasicMaterial({
      color: AURORA_COLORS[b % AURORA_COLORS.length],
      transparent: true, opacity: 0.14, blending: 2 /* AdditiveBlending */,
      side: 2 /* DoubleSide */, depthWrite: false,
    });
    const band = new Mesh(pGeo, pMat);
    band.position.set(-2 + b * 1.5, 7.5 + b * 0.9, -9 - b * 2);
    band.rotation.z = 0.12 * (b % 2 === 0 ? 1 : -1);
    auroraGroup.add(band);
    auroraBands.push({ mesh: band, geo: pGeo, phase: b * 2.1 });
  }
  scene.add(auroraGroup);

  /* ── Salju ── */
  const COUNT = 700;
  const snowGeo = new BufferGeometry();
  const snowPos = new Float32Array(COUNT * 3);
  const snowSpeed = new Float32Array(COUNT);
  const snowDrift = new Float32Array(COUNT);
  const spread = { x: 34, y: 20, z: 20 };
  for (let i = 0; i < COUNT; i++) {
    snowPos[i * 3] = (rnd() - 0.5) * spread.x;
    snowPos[i * 3 + 1] = (rnd() - 0.5) * spread.y;
    snowPos[i * 3 + 2] = (rnd() - 0.5) * spread.z;
    snowSpeed[i] = 0.5 + rnd() * 1.2;
    snowDrift[i] = rnd() * Math.PI * 2;
  }
  snowGeo.setAttribute('position', new BufferAttribute(snowPos, 3));
  const snowMat = new PointsMaterial({
    color: PALETTES.dark.snow, size: 0.08, transparent: true,
    opacity: 0.45, depthWrite: false, sizeAttenuation: true,
  });
  const snow = new Points(snowGeo, snowMat);
  snow.position.y = 5;
  scene.add(snow);

  /* ── Refleksi warna tema ke material ── */
  function applyPalette() {
    const p = isDark() ? PALETTES.dark : PALETTES.light;
    iceMat.color.set(p.iceberg);
    hintMat.color.set(p.hint);
    hullMat.color.set(p.shipHull);
    snowMat.color.set(p.snow);
    scene.fog.color.set(p.fog);
    lamp.color.set(p.shipLight);
    lamp.intensity = isDark() ? 1.0 : 0.7;
    auroraGroup.visible = isDark() && p.aurora;
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

    // Iceberg: rotasi pelan + miring halus ke mouse
    icebergGroup.rotation.y = t * 0.05 + mouse.x * 0.06;
    icebergGroup.rotation.x = -0.04 + mouse.y * -0.04;

    // Kapal: goyang pelan di ombak + gerak maju pelan (ulang)
    ship.rotation.z = Math.sin(t * 0.6) * 0.02;
    ship.rotation.x = Math.sin(t * 0.45 + 1) * 0.015;
    ship.position.x = -7.5 + ((t * 0.12) % 16) - 0; // drift sangat pelan

    // Aurora: pita mengalir (vertex Y displacement)
    for (const band of auroraBands) {
      const ap = band.geo.attributes.position;
      const arr = ap.array;
      for (let i = 0; i <= band.geo.parameters.widthSegments; i++) {
        const x = arr[i * 3];
        arr[i * 3 + 1] = Math.sin(x * 0.25 + t * 0.35 + band.phase) * 0.55
                       + Math.sin(x * 0.6 - t * 0.2 + band.phase * 2) * 0.22;
      }
      ap.needsUpdate = true;
    }

    // Salju jatuh + drift
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
    [geo, hintGeo, snowGeo, ...auroraBands.map(b => b.geo)].forEach(g => g.dispose());
    [iceMat, hintMat, hullMat, cabinMat, snowMat, ...auroraBands.map(b => b.mesh.material)].forEach(m => m.dispose());
    renderer.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  }

  return { dispose };
}

/* PRNG deterministik — bentuk konsisten antar build */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
