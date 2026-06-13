// Pastikan GSAP dimuat — kita pakai CDN via script tag
// Tambahkan di BaseLayout.astro sebelum script ini:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // ===== HERO ANIMATIONS =====
  const tl = gsap.timeline();

  // Typed text animation
  const typedOutput = document.getElementById('typed-output');
  if (typedOutput) {
    const text = typedOutput.closest('.hero-typed')?.dataset.text
      || (document.documentElement.lang === 'id' ? 'Halo. Saya Anggara' : 'Hello. I\'m Anggara');

    let i = 0;
    const typeInterval = setInterval(() => {
      typedOutput.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(typeInterval);

        // Setelah typing selesai, tampilkan elemen lain
        gsap.to('#hero-tagline', { opacity: 1, y: 0, duration: 0.6, delay: 0.3 });
        gsap.to('#hero-cta',     { opacity: 1, y: 0, duration: 0.6, delay: 0.6 });
        gsap.to('#hero-stats',   { opacity: 1, y: 0, duration: 0.6, delay: 0.9,
          onComplete: startCountAnimations
        });
      }
    }, 60); // kecepatan mengetik (ms per karakter)
  }

  // ===== COUNT ANIMATIONS =====
  function startCountAnimations() {
    document.querySelectorAll('.stat-value').forEach(el => {
      const target = parseFloat(el.dataset.target);
      const isDecimal = el.dataset.target.includes('.');

      gsap.fromTo(el,
        { textContent: 0 },
        {
          textContent: target,
          duration: 1.5,
          ease: 'power2.out',
          snap: { textContent: isDecimal ? 0.01 : 1 },
          onUpdate() {
            const val = parseFloat(el.textContent);
            el.textContent = isDecimal ? val.toFixed(2) : Math.round(val);
          }
        }
      );
    });
  }

  // ===== SCROLL REVEAL (untuk BentoCard) =====
  gsap.utils.toArray('.bento-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: (i % 3) * 0.1, // stagger per baris
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
});