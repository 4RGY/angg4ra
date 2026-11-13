// Invarian situs portfolio angg4ra.
// Jalankan: npm test (= build dulu, lalu node --test).
// Semua assertion baca dist/ hasil build, jadi ini menguji ARTEFAK yang
// benar-benar dideploy, bukan sumber yang belum di-generate.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const read = (p) => readFileSync(join(DIST, p), "utf8");
const raw = (p) => readFileSync(join(DIST, p));

const index = read("index.html");

test("tanpa em-dash di seluruh HTML ter-deploy", () => {
  const emDash = /[\u2014\u2013]/;
  for (const f of readdirSync(DIST).filter((f) => f.endsWith(".html"))) {
    assert.ok(!emDash.test(read(f)), `${f} masih mengandung em-dash/en-dash`);
  }
});

test("github: baris repo cocok dengan manifest dan shot-nya ada", () => {
  const src = JSON.parse(readFileSync(join(DIST, "..", "src", "data", "github.json"), "utf8"));
  for (const f of ["index.html"]) {
    const html = read(f);
    assert.equal((html.match(/class="gitem"/g) ?? []).length, src.featured.length, "jumlah baris != featured");
    for (const r of src.featured) {
      assert.ok(html.includes(`/shots/${r.name}.webp`), `shot ${r.name} tidak direferensikan`);
      assert.ok(existsSync(join(DIST, "shots", `${r.name}.webp`)), `file shots/${r.name}.webp hilang`);
      assert.ok(html.includes(r.url), `URL ${r.name} tidak terpasang`);
    }
    assert.ok(!/hello@example\.com/.test(html), "placeholder email bocor ke build");
  }
});

test("tanpa dead link href=\"#\"", () => {
  const dead = index.match(/href="#"/g) ?? [];
  assert.equal(dead.length, 0, `ada ${dead.length} href="#" mati`);
});

test("CV: tombol unduh ada dan file PDF ter-deploy", () => {
  assert.match(index, /href="\/cv-anggara\.pdf"/, "tombol CV hilang");
  assert.match(index, /download=/, "atribut download hilang");
  assert.ok(existsSync(join(DIST, "cv-anggara.pdf")), "PDF CV tidak ada di dist");
});

test("CV: metadata Canva sudah bersih", () => {
  const pdf = raw("cv-anggara.pdf");
  for (const leak of ["Canva", "DAGsZF2ixlI", "BAD-04a1diw", "Argy Rgyanggara"]) {
    assert.ok(!pdf.includes(leak), `PDF masih bocorin "${leak}"`);
  }
  assert.ok(pdf.includes("Argy Anggara - Data Analyst"), "judul PDF baru hilang");
});

test("CV: backup mentah tidak ikut ter-deploy", () => {
  const strays = readdirSync(DIST).filter((f) => f.includes(".orig"));
  assert.deepEqual(strays, [], `file backup bocor ke dist: ${strays}`);
});

test("SEO: title, canonical, OG, Twitter card lengkap", () => {
  for (const needle of [
    'rel="canonical" href="https://angg4ra.my.id/"',
    'property="og:title"',
    'property="og:image"',
    'property="og:locale" content="id_ID"',
    'property="og:locale:alternate" content="en_US"',
    'name="twitter:card" content="summary_large_image"',
    'name="robots" content="index,follow"',
  ]) {
    assert.ok(index.includes(needle), `head kehilangan: ${needle}`);
  }
});

test("SEO: heading h1 memuat nama + role", () => {
  const h1 = index.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  assert.ok(h1, "tidak ada h1");
  const text = h1[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
  assert.match(text, /Argy Anggara/, "h1 tidak menyebut nama");
  assert.match(text, /Data Analyst/, "h1 tidak menyebut role");
});

test("SEO: JSON-LD Person valid dan lengkap", () => {
  const m = index.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(m, "JSON-LD tidak ditemukan");
  const ld = JSON.parse(m[1]);
  assert.equal(ld["@type"], "Person");
  assert.equal(ld.name, "Argy Anggara");
  assert.deepEqual(ld.sameAs, [
    "https://github.com/4RGY",
    // LinkedIn canonical profile pakai trailing slash; harus sama persis
    // dengan URL di section kontak supaya tidak ada dua varian URL.
    "https://www.linkedin.com/in/argy-anggara/",
  ]);
  // Samakan dengan link yang tampil di halaman, biar tidak drift.
  assert.ok(
    index.includes("linkedin.com/in/argy-anggara/"),
    "link LinkedIn di kontak hilang/berbeda dari JSON-LD",
  );
});

test("halaman 404 ada dan noindex", () => {
  assert.ok(existsSync(join(DIST, "404.html")), "404.html tidak ter-deploy");
  assert.match(read("404.html"), /name="robots" content="noindex/);
});

test("security headers lengkap di _headers", () => {
  const h = read("_headers");
  for (const line of [
    "X-Frame-Options: DENY",
    "X-Content-Type-Options: nosniff",
    "Referrer-Policy: strict-origin-when-cross-origin",
    "Strict-Transport-Security: max-age=31536000; includeSubDomains",
    "Permissions-Policy: camera=(), microphone=(), geolocation=()",
  ]) {
    assert.ok(h.includes(line), `_headers kehilangan: ${line}`);
  }
  assert.ok(!h.includes("preload"), "HSTS preload sengaja TIDAK dipakai");
});

test("robots.txt + sitemap valid", () => {
  const r = read("robots.txt");
  assert.match(r, /Sitemap: https:\/\/angg4ra\.my\.id\/sitemap-index\.xml/);
  assert.ok(!/^ $/m.test(r), "robots.txt masih ada baris spasi anyep");
  assert.ok(existsSync(join(DIST, "sitemap-index.xml")), "sitemap tidak ter-generate");
});

test("favicon custom (bukan logo framework), multi-size", () => {
  // favicon.svg: harus SVG 'a' + dot biru, bukan path Astro default.
  const svg = read("favicon.svg");
  assert.match(svg, /fill="#FFFFFF"/, "favicon.svg tidak punya path 'a' putih");
  assert.match(svg, /#4F8EF7/, "favicon.svg tidak punya dot biru");
  assert.ok(!svg.includes("M50.4 78.5"), "favicon.svg masih pakai path Astro default");
  assert.ok(!/<text/i.test(svg), "favicon.svg pakai <text> (font-dependent), harusnya <path>");
  // favicon.ico: multi-size 16/32/48
  const ico = raw("favicon.ico");
  assert.ok(ico.length > 1000, "favicon.ico kekecilan, kemungkinan single-size");
});
