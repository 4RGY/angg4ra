/**
 * iceberg-scene.js — "Midnight Arctic" hero scene
 * ---------------------------------------------------------------
 * Satu gunung es low-poly di laut gelap, salju jatuh pelan,
 * rim-light cyan (--accent). Berjalan sebagai ambience di belakang
 * hero — teks tetap menjadi raja.
 *
 * Konsep visual: "tip of the iceberg". Hanya puncak yang terlihat
 * jelas; sisanya lebur ke dalam kabut/laut (fog) — metafora halus
 * tanpa perlu dijelaskan.
 *
 * Aturan main (wajib, konsisten dgn gsap-animations.js):
 *  - prefers-reduced-motion: reduce  → jangan mount sama sekali
 *  - layar < 768px / WebGL absent   → jangan mount (fallback statis)
 *  - dynamic import dari komponen   → three.js TIDAK di bundle awal
 *  - visibilitychange / resize      → pause & resize rapi
 *
 * Dipanggil dari IcebergCanvas.astro: initIcebergScene(container).
 */
export async function initIcebergScene(container) {
  const prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isMobile = window.innerWidth < 768;

  if (prefersReduced || isMobile) return null;

  /* ── dynamic import three: modul besar hanya dimuat saat dibutuhkan ── */
  const { WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, MeshStandardMaterial,
          IcosahedronGeometry, DodecahedronGeometry, Points, PointsMaterial,
          BufferGeometry, BufferAttribute, Fog, AmbientLight, DirectionalLight,
          Color, Vector2, Vector3 } = await import('three');

  let renderer = null;
  try {
    renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (err) {
    // WebGL tidak tersedia (headless/GPU blocklist) → fallback statis
    return null;
  }

  const scene = new Scene();
  scene.background = null; // transparan — bg dari CSS (--bg-main)
  scene.fog = new Fog(new Color('#0b1220'), 26, 60);

  const viewport = container.getBoundingClientRect();
  const camera = new PerspectiveCamera(40, viewport.width / Math.max(viewport.height, 1), 0.1, 200);
  camera.position.set(0, 3.2, 17);

  renderer.setSize(viewport.width, viewport.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  /* ── Lighting: satu rim cyan dari kiri, fill redup biru dari kanan ── */
  const key = new DirectionalLight('#56c8e8', 1.6);
  key.position.set(-6, 5, 6);
  scene.add(key);

  const fill = new DirectionalLight('#4a6a9a', 0.5);
  fill.position.set(6, -2, 4);
  scene.add(fill);

  const ambient = new AmbientLight('#8fb6d9', 0.28);
  scene.add(ambient);

  /* ── Iceberg: low-poly halus via icosahedron + noise displacement ── */
  const group = new Group();

  const geo = new IcosahedronGeometry(3.4, 3);
  const pos = geo.attributes.position;
  const base = new Vector3();
  const displaced = new Vector3();

  // Displace perlahan dgn simplex-ish noise (sin/cos kombinasi) —
  // hasil: bentuk bergelombang natural, bukan piramida kaku.
  const rnd = mulberry32(20260909);
  for (let i = 0; i < pos.count; i++) {
    base.fromBufferAttribute(pos, i);
    const n =
      0.75 * Math.sin(base.x * 1.7 + 1.3) * Math.cos(base.y * 1.4 + 0.7) * Math.sin(base.z * 1.5 + 2.1) +
      0.4 * Math.sin(base.x * 3.1 + 0.4) * Math.cos(base.z * 2.7 + 1.1) * Math.sin(base.y * 2.9 + 3.3) +
      0.22 * Math.sin((base.x + base.y + base.z) * 4.3) +
      (rnd() - 0.5) * 0.28;
    displaced.copy(base).multiplyScalar(1 + n * 0.32);
    pos.setXYZ(i, displaced.x, displaced.y, displaced.z);
  }
  geo.computeVertexNormals();

  const mat = new MeshStandardMaterial({
    color: '#1b2a42',
    roughness: 0.55,
    metalness: 0.12,
    flatShading: true,
    transparent: true,
    opacity: 0.96,
  });
  const mesh = new Mesh(geo, mat);
  mesh.position.y = -1.6; // tenggelam sebagian ke "laut"
  mesh.castShadow = false;
  group.add(mesh);

  // Underwater hint: dodecahedron transparan lebih gelap sebagai "dasar tersembunyi"
  const hintGeo = new DodecahedronGeometry(2.1, 1);
  const hintMat = new MeshStandardMaterial({
    color: '#0f1b30',
    roughness: 0.8,
    metalness: 0,
    transparent: true,
    opacity: 0.5,
    flatShading: true,
  });
  const hint = new Mesh(hintGeo, hintMat);
  hint.position.y = -4.4;
  hint.scale.set(1.7, 0.5, 1.7);
  group.add(hint);

  group.position.set(2.6, -1.2, -4.5);
  scene.add(group);

  /* ── Salju: Points kecil jatuh pelan dengan drift ── */
  const COUNT = 900;
  const snowGeo = new BufferGeometry();
  const snowPos = new Float32Array(COUNT * 3);
  const snowSpeed = new Float32Array(COUNT);
  const snowDrift = new Float32Array(COUNT);
  const spread = { x: 30, y: 22, z: 18 };

  for (let i = 0; i < COUNT; i++) {
    snowPos[i * 3 + 0] = (rnd() - 0.5) * spread.x;
    snowPos[i * 3 + 1] = (rnd() - 0.5) * spread.y;
    snowPos[i * 3 + 2] = (rnd() - 0.5) * spread.z;
    snowSpeed[i] = 0.6 + rnd() * 1.4;
    snowDrift[i] = rnd() * Math.PI * 2;
  }
  snowGeo.setAttribute('position', new BufferAttribute(snowPos, 3));

  const snowMat = new PointsMaterial({
    color: '#dcecf7',
    size: 0.09,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const snow = new Points(snowGeo, snowMat);
  snow.position.y = 4;
  scene.add(snow);

  /* ── Mouse parallax: iceberg miring lembut (±0.07 rad) ── */
  const mouse = new Vector2(0, 0);
  const target = new Vector2(0, 0);
  const onPointerMove = (e) => {
    target.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      (e.clientY / window.innerHeight) * 2 - 1,
    );
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  const onVisibility = () => {
    visible = document.visibilityState === 'visible';
  };
  let visible = true;
  document.addEventListener('visibilitychange', onVisibility);

  let rafId = null;
  const clock = performance.now();

  const tick = (now) => {
    rafId = requestAnimationFrame(tick);
    if (!visible) return;

    const t = (now - clock) / 1000;

    // lerp mouse → gerakan lembut (bukan snap)
    mouse.lerp(target, 0.035);

    // rotasi sangat pelan + kemiringan dari mouse
    group.rotation.y = t * 0.045 + mouse.x * 0.07;
    group.rotation.x = -0.05 + mouse.y * -0.045;

    // salju jatuh + drift sinus
    const sp = snowGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      sp[i * 3 + 1] -= snowSpeed[i] * 0.008;
      sp[i * 3 + 0] += Math.sin(t * 0.4 + snowDrift[i]) * 0.0022;
      if (sp[i * 3 + 1] < -8) {
        sp[i * 3 + 1] = 8 + (rnd() - 0.5) * 4;
        sp[i * 3 + 0] = (rnd() - 0.5) * spread.x;
        sp[i * 3 + 2] = (rnd() - 0.5) * spread.z;
      }
    }
    snowGeo.attributes.position.needsUpdate = true;

    // hint melayang naik-turun sangat pelan
    hint.position.y = -4.4 + Math.sin(t * 0.22) * 0.18;

    renderer.render(scene, camera);
  };
  rafId = requestAnimationFrame(tick);

  /* ── Resize rapi ── */
  const onResize = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    if (w < 768) { dispose(); return; } // user resize ke mobile → stop
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize, { passive: true });

  /* ── Cleanup total (dipanggil dari komponen saat unmount) ── */
  function dispose() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    geo.dispose();
    mat.dispose();
    hintGeo.dispose();
    hintMat.dispose();
    snowGeo.dispose();
    snowMat.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  }

  return { dispose };
}

/* PRNG deterministik kecil (mulberry32) — bentuk iceberg konsisten antar build */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
