// Helper untuk memuat string UI berdasarkan bahasa
export async function getTranslations(lang) {
  const module = await import(`./${lang}/ui.json`);
  return module.default;
}

// Ambil bahasa dari URL path
export function getLangFromUrl(url) {
  const [, lang] = url.pathname.split('/');
  if (lang === 'en' || lang === 'id') return lang;
  return 'id'; // default
}