// Ganti DOMContentLoaded dengan fungsi inisialisasi Astro
function initAnimations() {
  if (typeof gsap === 'undefined') return;

  // Bersihkan ScrollTrigger lama agar tidak menumpuk saat pindah halaman
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.getAll().forEach(t => t.kill());
  }

  gsap.registerPlugin(ScrollTrigger);

  // ===== HERO ANIMATIONS =====
  const typedOutput = document.getElementById('typed-output');
  if (typedOutput) {
    // Kosongkan dulu teksnya setiap kali inisialisasi dijalankan
    typedOutput.textContent = ''; 

    const text = typedOutput.closest('.hero-typed')?.dataset.text
      || (document.documentElement.lang === 'id' ? 'Halo. Saya Anggara' : 'Hello. I\'m Anggara');

    let i = 0;
    const typeInterval = setInterval(() => {
      // Proteksi jika user pindah halaman sebelum mengetik selesai
      if (!document.getElementById('typed-output')) {
        clearInterval(typeInterval);
        return;
      }
      
      typedOutput.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(typeInterval);

        gsap.to('#hero-tagline', { opacity: 1, y: 0, duration: 0.6, delay: 0.3 });
        gsap.to('#hero-cta',     { opacity: 1, y: 0, duration: 0.6, delay: 0.6 });
        gsap.to('#hero-stats',   { opacity: 1, y: 0, duration: 0.6, delay: 0.9,
          onComplete: startCountAnimations
        });
      }
    }, 60);
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

  // ===== SCROLL REVEAL (BentoCard) =====
  gsap.utils.toArray('.bento-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: (i % 3) * 0.1,
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

// ===== EKSEKUSI JALUR AMAN ASTRO =====
// Jalankan langsung saat pertama kali web dimuat
document.addEventListener('DOMContentLoaded', initAnimations);

// Jalankan ulang setiap kali sistem View Transitions Astro menukar halaman/bahasa
document.addEventListener('astro:page-load', initAnimations);