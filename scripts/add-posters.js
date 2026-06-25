/**
 * scripts/add-posters.js
 *
 * For every movie in src/data/content.js, search TMDB, fetch the
 * poster URL, and update the matching row in Supabase.
 *
 * Run: npm run add-posters
 *
 * Requires:
 *   - TMDB_API_KEY in .env   (https://www.themoviedb.org/settings/api)
 *   - SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ---- minimal .env loader ----
function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

for (const k of ["VITE_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "TMDB_API_KEY"]) {
  if (!process.env[k]) { console.error(`❌ Missing env var: ${k}`); process.exit(1); }
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function searchTmdb(title, year) {
  const url = new URL("https://api.themoviedb.org/3/search/movie");
  url.searchParams.set("api_key", process.env.TMDB_API_KEY);
  url.searchParams.set("query", title);
  if (year) url.searchParams.set("year", year);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  const data = await res.json();
  return data.results?.[0] ?? null;
}

async function main() {
  const movies = (await import(resolve(process.cwd(), "src/data/content.js"))).default;
  console.log(`\n🖼️  Fetching posters for ${movies.length} movies...\n`);

  let ok = 0, missing = 0, fail = 0;

  for (let i = 0; i < movies.length; i++) {
    const m = movies[i];
    process.stdout.write(`  [${i + 1}/${movies.length}] ${m.title} ... `);
    try {
      const tmdb = await searchTmdb(m.title, m.releaseYear);
      if (!tmdb || !tmdb.poster_path) {
        console.log("⚠️  no poster found");
        missing++;
        continue;
      }
      const posterUrl = `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`;

      const { error } = await supabase
        .from("movies")
        .update({ poster_url: posterUrl })
        .eq("title", m.title);

      if (error) throw error;
      console.log("✓");
      ok++;
    } catch (err) {
      console.log(`✗ ${err.message}`);
      fail++;
    }
    await new Promise(r => setTimeout(r, 280)); // rate-limit courtesy
  }

  console.log(`\n✅ Done. ${ok} updated, ${missing} no poster, ${fail} failed.\n`);
}

main().catch(err => { console.error("❌", err.message); process.exit(1); });