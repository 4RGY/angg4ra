#!/usr/bin/env node
// Ambil data GitHub 4RGY sekali, tulis ke src/data/github.json.
// Situs statis: build TIDAK boleh nembak jaringan, jadi JSON ini di-commit.
// Jalankan manual: npm run gh:sync
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const gh = (p) => JSON.parse(execSync(`gh api "${p}"`, { encoding: "utf8", maxBuffer: 1 << 26 }));

const user = gh("users/4RGY");
const repos = gh("users/4RGY/repos?per_page=100&sort=pushed");

const pick = [
  "pantau-dbd",
  "ihsg-idx-analytics",
  "cuaca-indonesia",
  "kataloji-crm",
  "analisis-gempa-indonesia",
  "olist-commerce-analysis",
];

const byName = new Map(repos.map((r) => [r.name, r]));
const featured = pick.filter((n) => byName.has(n)).map((n) => {
  const r = byName.get(n);
  return {
    name: r.name,
    desc: r.description || "",
    lang: r.language || "",
    stars: r.stargazers_count,
    pushed: r.pushed_at.slice(0, 10),
    url: r.html_url,
    home: r.homepage || "",
  };
});

// byte per bahasa dari repo yang punya bahasa, bukan dari semua repo (biar tidak berat
// oleh fork/vendor). Diambil sekaligus lewat satu query GraphQL biar tidak 25 request.
const q = `query{user(login:"4RGY"){repositories(first:100,isFork:false,ownerAffiliations:OWNER){
  nodes{name languages(first:10){edges{size node{name}}}}}}}`;
let langs = {};
try {
  // --input - biar tidak perlu quoting shell; query dikirim sebagai JSON body.
  const g = JSON.parse(
    execSync("gh api graphql --input -", {
      input: JSON.stringify({ query: q }),
      encoding: "utf8",
      maxBuffer: 1 << 26,
    }),
  );
  for (const n of g.data.user.repositories.nodes)
    for (const e of n.languages.edges) langs[e.node.name] = (langs[e.node.name] || 0) + e.size;
} catch (e) {
  console.warn("graphql gagal, bahasa dilewati:", e.message);
}

const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
const top = Object.entries(langs)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([name, size]) => ({ name, pct: Math.round((size / total) * 1000) / 10 }));

const out = {
  synced: new Date().toISOString().slice(0, 10),
  login: user.login,
  repos: user.public_repos,
  followers: user.followers,
  since: user.created_at.slice(0, 4),
  active: repos.filter((r) => Date.parse(r.pushed_at) > Date.now() - 120 * 864e5).length,
  langs: top,
  featured,
};

mkdirSync(join(ROOT, "src/data"), { recursive: true });
writeFileSync(join(ROOT, "src/data/github.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`github.json: ${out.repos} repo, ${out.active} aktif, ${top.length} bahasa, ${featured.length} unggulan`);
