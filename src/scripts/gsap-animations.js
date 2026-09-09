import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initAnimations() {
  // Bersihkan ScrollTrigger lama agar tidak menumpuk saat pindah halaman
  ScrollTrigger.getAll().forEach(t => t.kill());

// ===== HERO ANIMATIONS =====
  const typedOutput = document.getElementById('typed-output');
  if (typedOutput) {
    // Teks sudah server-rendered di Hero.astro — JANGAN nimpa.
    // Script ini cuma placeholder compatibility (TypedText lama sudah dibuang).
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Keep content visible by default. Animation may enhance position, but a
  // failed/late ScrollTrigger must never leave readable content transparent.
  gsap.utils.toArray('.bento-card').forEach((card, i) => {
    gsap.fromTo(card,
      { y: 18 },
      {
        y: 0,
        duration: 0.4,
        delay: (i % 3) * 0.1,
        clearProps: 'transform',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        }
      }
    );
  });

  // ===== TIMELINE EXPERIENCE =====
  gsap.utils.toArray('.timeline-entry').forEach(entry => {
    gsap.fromTo(entry,
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: entry,
          start: 'top 80%',
        }
      }
    );
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations, { once: true });
} else {
  initAnimations();
}
