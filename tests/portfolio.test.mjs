import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import path from 'node:path';

const root = new URL('../', import.meta.url);
const read = async (relativePath) => readFile(new URL(relativePath, root), 'utf8');

async function listHtml(relativeDir) {
  const dir = new URL(relativeDir, root);
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

test('Indonesian project routes exclude English content IDs', async () => {
  const routes = await listHtml('dist/id/projects/');
  assert.deepEqual(routes, [
    'analisis-gempa-indonesia',
    'eyetails-erp',
    'file-organizer',
    'jadwal-kuliah',
    'jakarta-air-quality',
    'koperargy',
    'olist-commerce-analysis',
    'pendidikan-indonesia',
    'relationship-memory-museum',
    'student-archive-system',
    'transjakarta-analysis',
  ]);
});

test('Section reveal never hides content without JS', async () => {
  const animations = await read('src/scripts/gsap-animations.js');
  const revealBlock = animations.split("gsap.utils.toArray('[data-reveal]')")[1]
    ?.split('DEPTH HUD')[0] ?? '';
  assert.ok(revealBlock, 'Section reveal block must exist');
  // fromTo = progressive enhancement: kalau GSAP gagal load, konten tetap
  // terbaca karena CSS scoped tidak set opacity awal.
  assert.match(revealBlock, /fromTo/);
});

test('GSAP enhancements are skipped when reduced motion is requested', async () => {
  const animations = await read('src/scripts/gsap-animations.js');
  assert.match(animations, /matchMedia\(['"]\(prefers-reduced-motion:\s*reduce\)['"]\)/);
  const guardIndex = animations.indexOf('prefers-reduced-motion: reduce');
  const firstTweenIndex = animations.indexOf("gsap.utils.toArray('[data-reveal]')");
  assert.ok(guardIndex >= 0 && guardIndex < firstTweenIndex, 'Reduced-motion guard must run before GSAP tweens');
  assert.match(animations.slice(guardIndex, firstTweenIndex), /return;/);
});

test('One-page dive sections exist in order on both languages', async () => {
  for (const lang of ['id', 'en']) {
    const html = await read(`dist/${lang}/index.html`);
    const ids = [...html.matchAll(/<section[^>]*class="dz[^"]*"[^>]*id="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(ids, ['about', 'projects', 'notes', 'contact'], `${lang} must have 4 dive sections in order`);
  }
});

test('Listing pages exist for projects and blog on both languages', async () => {
  for (const lang of ['id', 'en']) {
    await read(`dist/${lang}/projects/index.html`);
    await read(`dist/${lang}/blog/index.html`);
  }
});

test('Language switch links to the other language homepage', async () => {
  const enHtml = await read('dist/en/index.html');
  const idHtml = await read('dist/id/index.html');
  // Bahasa lain direpresentasikan link langsung di DepthNav/footer
  assert.match(enHtml, /href="\/id\/"/);
  assert.match(idHtml, /href="\/en\/"/);
});

test('Google Fonts stylesheet is loaded only once', async () => {
  const layout = await read('src/components/layout/BaseLayout.astro');
  const globalCss = await read('src/styles/global.css');
  const loads = (layout.match(/fonts\.googleapis\.com\/css2/g) ?? []).length
    + (globalCss.match(/fonts\.googleapis\.com\/css2/g) ?? []).length;
  assert.equal(loads, 1);
});

test('Iceberg scene guards reduced motion and loads three lazily', async () => {
  const script = await read('src/scripts/iceberg-scene.js');
  // Guard reduced-motion: harus cek SEBELUM dynamic import three (return null)
  const guardIndex = script.indexOf('prefers-reduced-motion: reduce');
  const importIndex = script.indexOf("await import('three')");
  assert.ok(guardIndex >= 0, 'Iceberg script must check prefers-reduced-motion');
  assert.ok(importIndex >= 0, 'Iceberg script must dynamic-import three');
  assert.ok(guardIndex < importIndex, 'Reduced-motion guard must run before three is imported');
  assert.match(script, /isMobile/);
  assert.match(script, /return null/);

  // Canvas container + lazy loader ada di komponen
  const comp = await read('src/components/sections/IcebergCanvas.astro');
  assert.match(comp, /data-iceberg-canvas/);
  assert.match(comp, /import\('\.\.\/\.\.\/scripts\/iceberg-scene\.js'\)/);
  assert.match(comp, /pointer-events:\s*none/);

  // v11: canvas dirender di BaseLayout (fixed, homepage doang / data-dive)
  const layout = await read('src/components/layout/BaseLayout.astro');
  assert.match(layout, /IcebergCanvas/);
  assert.match(layout, /data-dive/);

  // Hero TIDAK lagi memuat canvas (sudah pindah ke layout)
  const hero = await read('src/components/sections/Hero.astro');
  assert.doesNotMatch(hero, /IcebergCanvas/);
});

test('Hero content remains meaningful before JavaScript enhancement', async () => {
  const idHtml = await read('dist/id/index.html');
  const hero = await read('src/components/sections/Hero.astro');
  assert.match(idHtml, /id="typed-output"[^>]*>Halo, saya Anggara\.<\/span>/);
  assert.match(idHtml, /data-target="11"[^>]*>11<\/span>/);
  assert.match(idHtml, /data-target="500"[^>]*>500<\/span>/);
  for (const selector of ['.hero-tagline', '.hero-cta', '.hero-stats']) {
    const escaped = selector.replace('.', '\\.');
    const rule = hero.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
    assert.ok(rule, `${selector} CSS rule must exist`);
    assert.doesNotMatch(rule, /opacity:\s*0/);
  }
});

test('Homepage one-page links project details to their own pages', async () => {
  for (const lang of ['id', 'en']) {
    const html = await read(`dist/${lang}/index.html`);
    // Link detail harus ke halaman detail (bukan anchor)
    const detailLinks = [...html.matchAll(new RegExp(`href="/${lang}/(projects|blog)/[^"]+"`, 'g'))].map((m) => m[0]);
    assert.ok(detailLinks.length >= 4, `${lang} homepage must link at least 4 detail pages`);
  }
});

test('Every generated internal link resolves to a generated page or asset', async () => {
  const htmlFiles = [];
  const walk = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const target = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
      if (entry.isDirectory()) await walk(target);
      else if (entry.name.endsWith('.html')) htmlFiles.push(target);
    }
  };
  await walk(new URL('dist/', root));

  const broken = new Set();
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const pathname = match[1];
      if (pathname.startsWith('//')) continue;
      const direct = new URL(`dist${pathname}`, root);
      const nested = new URL(`dist${pathname.replace(/\/$/, '')}/index.html`, root);
      try { await readFile(direct); continue; } catch {}
      try { await readFile(nested); continue; } catch {}
      broken.add(pathname);
    }
  }
  assert.deepEqual([...broken].sort(), []);
});
