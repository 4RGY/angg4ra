export const copy = {
  id: {
    projects: 'Proyek', projectIntro: 'Dari pertanyaan menjadi temuan.', projectDesc: 'Analisis data, eksperimen machine learning, dan aplikasi yang saya bangun. Setiap proyek menyimpan proses dan pelajarannya sendiri.',
    archive: 'Arsip karya', selected: 'Proyek pilihan', all: 'Semua', open: 'Buka proyek', result: 'Hasil utama', category: 'Bidang', status: 'Status', date: 'Tanggal', tools: 'Teknologi', backProjects: 'Kembali ke proyek', contents: 'Dalam halaman ini',
    blog: 'Blog', journal: 'Catatan lapangan', blogIntro: 'Hal-hal yang saya pelajari.', blogDesc: 'Catatan tentang kode, data, pengalaman mengajar, dan proses belajar yang tidak selalu rapi.', latest: 'Catatan terbaru', read: 'Baca catatan', minutes: 'menit baca', backBlog: 'Kembali ke blog', topics: 'Topik', empty: 'Belum ada catatan. Tulisan pertama sedang disiapkan.', projectEmpty: 'Belum ada proyek untuk ditampilkan.', filter: 'Saring berdasarkan',
    categories: { 'Analisis Data': 'Analisis Data', 'Mengajar': 'Mengajar', 'Machine Learning': 'Machine Learning', 'Web': 'Web' },
  },
  en: {
    projects: 'Projects', projectIntro: 'From questions to findings.', projectDesc: 'Data analysis, machine learning experiments, and applications I have built. Each project has its own process and lessons.',
    archive: 'Work archive', selected: 'Selected project', all: 'All', open: 'Open project', result: 'Key outcome', category: 'Discipline', status: 'Status', date: 'Date', tools: 'Built with', backProjects: 'Back to projects', contents: 'On this page',
    blog: 'Blog', journal: 'Field notes', blogIntro: 'Things I learned along the way.', blogDesc: 'Notes on code, data, teaching experiences, and the sometimes messy process of learning.', latest: 'Latest note', read: 'Read the note', minutes: 'min read', backBlog: 'Back to blog', topics: 'Topics', empty: 'No notes yet. The first post is in the works.', projectEmpty: 'No projects to show yet.', filter: 'Filter by',
    categories: { 'Analisis Data': 'Data Analysis', 'Mengajar': 'Teaching', 'Machine Learning': 'Machine Learning', 'Web': 'Web' },
  },
};
export function formatDate(date: string, lang: 'id' | 'en') {
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? date : value.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
