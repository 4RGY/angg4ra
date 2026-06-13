import { defineCollection, z } from 'astro:content';
// 1. Impor glob loader bawaan Astro v6
import { glob } from 'astro/loaders';

// Skema untuk koleksi proyek
const projectsCollection = defineCollection({
  // 2. Gunakan loader glob untuk membaca file markdown di folder projects
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/projects" }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    status:      z.enum(['Selesai', 'Sedang Berjalan', 'Berkelanjutan']),
    tags:        z.array(z.string()),
    category:    z.enum(['Machine Learning', 'Analisis Data', 'Web', 'Mengajar']),
    metric:      z.string().optional(),  // contoh: "Akurasi 94%"
    date:        z.string(),
    featured:    z.boolean().default(false),
    github:      z.string().optional(),
    demo:        z.string().optional(),
  }),
});

// Skema untuk koleksi blog
const blogCollection = defineCollection({
  // 3. Gunakan loader glob untuk membaca file markdown di folder blog
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    title:       z.string(),
    date:        z.string(),
    language:    z.enum(['id', 'en']),
    tags:        z.array(z.string()),
    readingTime: z.number(),        // dalam menit
    excerpt:     z.string(),
  }),
});

export const collections = {
  'projects': projectsCollection,
  'blog':     blogCollection,
};