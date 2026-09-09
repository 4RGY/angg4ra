/**
 * depth-meter.js — "scroll = menyelam"
 * ---------------------------------------------------------------
 * Ngisi depth meter di sisi kiri + angka kedalaman (0m → −4000m)
 * mengikuti scroll progress halaman. Satu-satunya sumber kebenaran
 * adalah scrollY — tanpa scroll-jacking, tetap scroll native.
 *
 * Zona (kedalaman simbolis per section) dipetakan linear dari
 * progress scroll — angka nggak perlu presisi ilmiah, cukup
 * memberi rasa "makin dalam, makin jauh".
 *
 * Guard: prefers-reduced-motion → meter tetap tampil statis (0m)
 * tapi tidak usil; elemen disembunyikan di layar < 900px via CSS.
 */
const meter = document.getElementById('depth-meter');
const valueEl = document.getElementById('depth-value');
const fillEl = document.getElementById('depth-fill');

const MAX_DEPTH = 4000; // meter — "palung"
const prefersReduced =
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function formatDepth(m) {
  // 0 → "0m", lainnya → "−{rounded}m" (pakai minus Unicode biar enak dibaca)
  return m <= 0 ? '0m' : `\u2212${Math.round(m)}m`;
}

function update() {
  if (!valueEl || !fillEl) return;
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;

  // Depth: dari 0 di atas → MAX di bawah halaman. Easing tipis biar
  // awal scroll terasa "pelan masuk air", makin dalam makin cepat.
  const eased = 1 - Math.pow(1 - pct, 1.4);
  const depth = MAX_DEPTH * eased;

  valueEl.textContent = formatDepth(depth);
  fillEl.style.height = `${(pct * 100).toFixed(2)}%`;
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    update();
    ticking = false;
  });
}

if (meter && !prefersReduced) {
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
} else if (meter) {
  // Reduced motion: tampilkan statis "0m" tanpa update — tidak mengganggu.
  if (valueEl) valueEl.textContent = '0m';
}
