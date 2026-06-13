import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Pindahkan Tailwind v4 ke dalam array plugins milik Vite
  vite: {
    plugins: [tailwindcss()],
  },

  // Konfigurasi i18n kamu tetap dipertahankan di sini
  i18n: {
    defaultLocale: 'id',          // Bahasa default = Indonesia
    locales: ['id', 'en'],
    routing: {
      prefixDefaultLocale: true,  // URL selalu pakai prefix: /id/ dan /en/
    },
  },
});
