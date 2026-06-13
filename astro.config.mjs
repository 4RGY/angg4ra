import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],

  // Konfigurasi i18n: routing otomatis /en/ dan /id/
  i18n: {
    defaultLocale: 'id',          // Bahasa default = Indonesia
    locales: ['id', 'en'],
    routing: {
      prefixDefaultLocale: true,  // URL selalu pakai prefix: /id/ dan /en/
    },
  },
});