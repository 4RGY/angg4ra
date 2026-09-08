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

test('About cards never depend on opacity animation to be readable', async () => {
  const animations = await read('src/scripts/gsap-animations.js');
  const bentoBlock = animations.split("gsap.utils.toArray('.bento-card')")[1]
    ?.split('// ===== TIMELINE EXPERIENCE =====')[0] ?? '';
  assert.ok(bentoBlock, 'Bento animation block must exist');
  assert.doesNotMatch(
    bentoBlock,
    /opacity:\s*0/,
    'Bento cards must remain visible when animation initialization or ScrollTrigger fails',
  );
});

test('GSAP enhancements are skipped when reduced motion is requested', async () => {
  const animations = await read('src/scripts/gsap-animations.js');
  assert.match(animations, /matchMedia\(['"]\(prefers-reduced-motion:\s*reduce\)['"]\)/);
  const guardIndex = animations.indexOf('prefers-reduced-motion: reduce');
  const firstTweenIndex = animations.indexOf("gsap.utils.toArray('.bento-card')");
  assert.ok(guardIndex >= 0 && guardIndex < firstTweenIndex, 'Reduced-motion guard must run before GSAP tweens');
  assert.match(animations.slice(guardIndex, firstTweenIndex), /return;/);
});

test('Accordion buttons contain phrasing content only', async () => {
  for (const lang of ['id', 'en']) {
    const source = await read(`src/pages/${lang}/index.astro`);
    const button = source.match(/<button[\s\S]*?class="exp-row-head"[\s\S]*?<\/button>/)?.[0] ?? '';
    assert.ok(button, `${lang} accordion button must exist`);
    assert.doesNotMatch(button, /<(?:div|p)\b/);
  }
});

test('English language switch links back to ID and marks EN as current', async () => {
  const html = await read('dist/en/index.html');
  assert.match(html, /<a[^>]+href="\/id\/"[^>]*>ID<\/a>/);
  assert.match(html, /<span[^>]+aria-current="page"[^>]*>EN<\/span>/);
});

test('Indonesian language switch marks ID as current and links to EN', async () => {
  const html = await read('dist/id/index.html');
  assert.match(html, /<span[^>]+aria-current="page"[^>]*>ID<\/span>/);
  assert.match(html, /<a[^>]+href="\/en\/"[^>]*>EN<\/a>/);
});

test('Google Fonts stylesheet is loaded only once', async () => {
  const layout = await read('src/components/layout/BaseLayout.astro');
  const globalCss = await read('src/styles/global.css');
  const loads = (layout.match(/fonts\.googleapis\.com\/css2/g) ?? []).length
    + (globalCss.match(/fonts\.googleapis\.com\/css2/g) ?? []).length;
  assert.equal(loads, 1);
});

test('Hero content remains meaningful before JavaScript enhancement', async () => {
  const idHtml = await read('dist/id/index.html');
  const hero = await read('src/components/sections/Hero.astro');
  assert.match(idHtml, /id="typed-output"[^>]*>Halo, gua Anggara\.<\/span>/);
  assert.match(idHtml, /data-target="11"[^>]*>11<\/span>/);
  assert.match(idHtml, /data-target="500"[^>]*>500<\/span>/);
  for (const selector of ['.hero-tagline', '.hero-cta', '.hero-stats']) {
    const escaped = selector.replace('.', '\\.');
    const rule = hero.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
    assert.ok(rule, `${selector} CSS rule must exist`);
    assert.doesNotMatch(rule, /opacity:\s*0/);
  }
});

test('Project filters include featured and regular cards with accessible state', async () => {
  for (const lang of ['id', 'en']) {
    const html = await read(`dist/${lang}/projects/index.html`);
    assert.match(html, /class="[^"]*featured-project[^"]*"[^>]+data-category="[^"]+"/);
    assert.match(html, /class="[^"]*\bproject-card\b[^"]*"[^>]+data-category=/);
    assert.match(html, /class="[^"]*filter-btn[^"]*active[^"]*"[^>]+aria-pressed="true"/);
  }
});

test('Unsupported Simple Icons use local text fallback without failed requests', async () => {
  for (const lang of ['id', 'en']) {
    const html = await read(`dist/${lang}/index.html`);
    for (const slug of ['shap', 'matplotlib', 'seaborn', 'microsoftexcel']) {
      assert.doesNotMatch(html, new RegExp(`cdn\\.simpleicons\\.org/${slug}`));
    }
    for (const label of ['SHAP', 'Matplotlib', 'Seaborn', 'Excel']) {
      assert.match(html, new RegExp(`data-fallback="${label}"[^>]*marquee-logo--fallback|marquee-logo--fallback[^>]*data-fallback="${label}"`));
    }
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
