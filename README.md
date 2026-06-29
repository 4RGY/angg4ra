# angg4ra.my.id — Personal Portfolio

> Bilingual personal portfolio site built with Astro, deployed on Cloudflare Pages.

[![Astro](https://img.shields.io/badge/Astro-6.x-FF5D01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed_on-Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![License](https://img.shields.io/badge/License-Personal-6B2D3E?style=flat-square)](#)

---

## Overview

This is the source code for my personal portfolio at **[angg4ra.my.id](https://angg4ra.my.id)**. It showcases my projects, writing, and background as an Information Systems student and IT educator — built to be fast, minimal, and bilingual (Indonesian + English).

The site is built file-first with Astro's Content Collections, meaning all projects and blog posts live as Markdown files and get rendered at build time — zero client-side JS overhead for content.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | [Astro 6](https://astro.build) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (via Vite plugin) |
| Animations | [GSAP 3](https://greensock.com/gsap/) |
| Content | Astro Content Collections (Markdown) |
| i18n | Built-in Astro i18n routing (`/id/`, `/en/`) |
| Sitemap | `@astrojs/sitemap` |
| Deployment | [Cloudflare Pages](https://pages.cloudflare.com) |
| Domain | `angg4ra.my.id` (DNS via Cloudflare) |
| Node | ≥ 22.12.0 |

---

## Features

- **Bilingual** — full Indonesian & English versions under `/id/` and `/en/` prefixes, with a language toggle in the navbar
- **Content Collections** — projects and blog posts are Markdown files validated by Zod schemas; no CMS needed
- **Bento grid layout** — card-based UI across homepage, projects, and blog pages
- **Animated hero** — typed text effect and GSAP scroll animations
- **Featured Projects** — auto-pulls `featured: true` projects from content, filtered by language
- **Tag filtering** — client-side JS filter on projects and blog index pages
- **SEO ready** — auto-generated sitemap, robots.txt, Google Search Console verification
- **Static build** — fully pre-rendered, no server needed

---

## Project Structure

```
src/
├── components/
│   ├── charts/         # MiniLineChart
│   ├── layout/         # BaseLayout, Navbar, Footer
│   ├── sections/       # Hero, FeaturedProjects, About
│   └── ui/             # BentoCard, StatusBadge, LanguageToggle, TypedText, AnimatedNumber
├── content/
│   ├── projects/       # *.md and *-en.md (bilingual pairs)
│   └── blog/           # *.md and *-en.md (bilingual pairs)
├── i18n/
│   ├── id/ui.json      # Indonesian UI strings
│   └── en/ui.json      # English UI strings
├── pages/
│   ├── id/             # Indonesian routes
│   └── en/             # English routes
├── scripts/            # GSAP animations, typed text, terminal effect
├── styles/
│   └── global.css      # CSS variables, base styles
└── content.config.js   # Collection schemas (Zod)
```

---

## Content Collections

### Projects (`src/content/projects/`)

Each project has two files: `project-name.md` (ID) and `project-name-en.md` (EN).

Frontmatter schema:

```yaml
title: "Project Title"
description: "Short description"
status: "Selesai" | "Sedang Berjalan" | "Berkelanjutan" | "Completed" | "In Progress" | "Ongoing"
tags: ["Python", "Astro"]
category: "Machine Learning" | "Analisis Data" | "Web" | "Mengajar"
language: "id" | "en"
metric: "Optional highlight metric"
date: "2024-11-15"
featured: true | false
github: "https://github.com/..."   # optional
demo: "https://..."                # optional
```

### Blog (`src/content/blog/`)

```yaml
title: "Post Title"
date: "2025-01-01"
language: "id" | "en"
tags: ["tag1", "tag2"]
readingTime: 5    # in minutes
excerpt: "Short summary shown on the index page"
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/4RGY/angg4ra.git
cd angg4ra

# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:4321/id/
```

### Build & Preview

```bash
npm run build     # Output to ./dist/
npm run preview   # Preview the production build locally
```

---

## i18n Routing

| Path | Language |
|---|---|
| `/` | Redirects to `/id/` |
| `/id/*` | Indonesian |
| `/en/*` | English |

UI strings (nav labels, CTAs, section headings) live in `src/i18n/{lang}/ui.json`. Content (projects, blog) uses separate Markdown files per language, filtered at build time via `language` field in frontmatter.

---

## Deployment

Deployed automatically via **Cloudflare Pages** on push to `main`.

Build settings:
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** `22`

Custom domain `angg4ra.my.id` is configured through Cloudflare DNS (nameservers migrated from Rumahweb).

---

## Adding Content

### New project

1. Create `src/content/projects/my-project.md` (Indonesian version)
2. Create `src/content/projects/my-project-en.md` (English version)
3. Fill in the frontmatter schema above
4. Set `featured: true` on one project per language to highlight it on the homepage

### New blog post

1. Create `src/content/blog/my-post.md` with `language: "id"`
2. Create `src/content/blog/my-post-en.md` with `language: "en"`

---

## License

Personal project — not open for redistribution or reuse without permission.  
Feel free to use it as inspiration, but please don't clone it wholesale.

---

*Built by [Argy Anggara](https://angg4ra.my.id) — Information Systems student, IT educator, and weekend data scientist.*
