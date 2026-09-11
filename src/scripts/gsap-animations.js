import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

async function initAnimations() {
  ScrollTrigger.getAll().forEach((t) => t.kill());

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const isDive = document.body.hasAttribute('data-dive');

  /* ── SMOOTH SCROLL: inersia halaman (kesan premium).
     ScrollSmoother butuh wrapper/content; kalau plugin/DOM nggak siap,
     halaman tetap jalan pakai native scroll (progressive enhancement). */
  let smoother = null;
  try {
    const { ScrollSmoother } = await import('gsap/ScrollSmoother');
    gsap.registerPlugin(ScrollSmoother);
    smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.15,          // detik untuk "menyusul" posisi scroll
      effects: false,
      normalizeScroll: true, // samain perilaku trackpad/mobile
      ignoreMobileResize: true,
    });
  } catch {
    smoother = null;
  }

  /* ── DIVE: progress scroll → kedalaman scene ── */
  if (isDive) {
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        const api = window.__dive;
        if (api?.setDive) api.setDive(self.progress);
      },
    });
  }

  /* ── REVEAL: kartu & baris muncul berurutan (stagger halus) ── */
  gsap.utils.toArray('[data-reveal]').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      delay: (i % 3) * 0.06,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  /* ── HEADING & SCRIM: naik lembut saat masuk viewport ── */
  gsap.utils.toArray('.dz .scrim, .dz .abyss').forEach((panel) => {
    gsap.fromTo(
      panel,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 1.1, ease: 'power2.out',
        scrollTrigger: { trigger: panel, start: 'top 85%', once: true },
      },
    );
  });

  /* ── HERO: keluar pelan sambil menyelam (parallax + fade) ── */
  const hero = document.querySelector('#surface, .hero, [data-hero]');
  if (hero) {
    gsap.to(hero, {
      opacity: 0,
      y: -70,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 30%', scrub: true },
    });
  }

  ScrollTrigger.refresh();
  return smoother;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations, { once: true });
} else {
  initAnimations();
}
