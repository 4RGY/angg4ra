<h1 align="center">angg4ra.my.id — Personal Portfolio ✨</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Astro-6.x-FF5D01?style=flat-square&logo=astro&logoColor=white" alt="Astro">
  <img src="https://img.shields.io/badge/Tailwind-4.x-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Deployed_on-Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare Pages">
  <img src="https://img.shields.io/badge/License-Personal-6B2D3E?style=flat-square" alt="License">
</p>

> Bilingual personal portfolio site built with Astro, deployed on Cloudflare Pages.

---

## 📖 Overview

This is the source code for my personal portfolio at **[angg4ra.my.id](https://angg4ra.my.id)**. It showcases my projects, writing, and background as an Information Systems student and IT educator — built to be fast, minimal, and bilingual (Indonesian + English).

The site is built file-first with Astro's Content Collections, meaning all projects and blog posts live as Markdown files and get rendered at build time — zero client-side JS overhead for content.

## 🚀 Features

- **Bilingual** — full Indonesian & English versions under `/id/` and `/en/` prefixes, with a language toggle in the navbar.
- **Content Collections** — projects and blog posts are Markdown files validated by Zod schemas; no CMS needed.
- **Bento Grid Layout** — card-based UI across homepage, projects, and blog pages.
- **Animations** — animated hero with typed text effect and GSAP scroll animations.
- **Static Build** — fully pre-rendered, no server needed.

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Framework | [Astro 6](https://astro.build) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (via Vite plugin) |
| Animations | [GSAP 3](https://greensock.com/gsap/) |
| Content | Astro Content Collections (Markdown) |
| i18n | Built-in Astro i18n routing (`/id/`, `/en/`) |
| Deployment | [Cloudflare Pages](https://pages.cloudflare.com) |

## 📁 Project Structure

<details>
  <summary><b>Click to expand folder structure</b></summary>
  
```text
src/
├── components/
│   ├── charts/         # MiniLineChart
│   ├── layout/         # BaseLayout, Navbar, Footer
│   ├── sections/       # Hero, FeaturedProjects, About
│   └── ui/             # BentoCard, StatusBadge, LanguageToggle, TypedText
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
</details>

## 🏁 Getting Started

```bash
# 1. Clone
git clone https://github.com/4RGY/angg4ra.git
cd angg4ra

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
# → http://localhost:4321/id/
```

### Build & Preview
```bash
npm run build     # Output to ./dist/
npm run preview   # Preview the production build locally
```

## 📝 Adding Content
<details>
  <summary><b>How to add projects & blog posts</b></summary>

### New project
1. Create `src/content/projects/my-project.md` (Indonesian version)
2. Create `src/content/projects/my-project-en.md` (English version)
3. Set `featured: true` on one project per language to highlight it on the homepage.

### New blog post
1. Create `src/content/blog/my-post.md` with `language: "id"`
2. Create `src/content/blog/my-post-en.md` with `language: "en"`
</details>

## 📜 License

Personal project — not open for redistribution or reuse without permission.  
Feel free to use it as inspiration, but please don't clone it wholesale.

---
*Built by [Argy Anggara](https://angg4ra.my.id) — Information Systems student, IT educator, and weekend data scientist.*