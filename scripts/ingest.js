/**
 * scripts/ingest.js
 *
 * ONE-TIME ingestion script — run this exactly once after you've
 *   1. Created the Supabase project
 *   2. Run supabase/schema.sql in the Supabase SQL editor
 *
 * What it does:
 *   For every movie in src/data/content.js it:
 *     - generates a vector embedding via OpenRouter
 *     - upserts (title, release_year, content, embedding) into Supabase
 *
 * Usage:
 *   1. Add SUPABASE_SERVICE_ROLE_KEY to your .env (server-side only key).
 *   2. npm run ingest
 *
 * IMPORTANT: This script uses the Supabase SERVICE ROLE key, NOT the
 * anon key, because it bypasses Row Level Security to write data.
 * Never expose this key to the browser.
 */

import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";


// ---- Minimal .env loader (avoid extra deps) ----
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error("❌ .env file not found in", process.cwd());
      console.error("   Copy .env.example to .env and fill in your keys first.");
      process.exit(1);
    }
    throw err;
  }
}

loadEnv();

// ---- Validate required env ----
const REQUIRED = [
  "VITE_OPENROUTER_API_KEY",
  "VITE_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY"
];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error("❌ Missing env vars:", missing.join(", "));
  console.error("   See README step 3 & 4 for how to get these.");
  process.exit(1);
}

// ---- Initialize clients ----
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.VITE_OPENROUTER_API_KEY
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const EMBEDDING_MODEL = "openai/text-embedding-3-small";

// ---- Load movie dataset ----
const __dirname = dirname(fileURLToPath(import.meta.url));
const moviesModulePath = resolve(__dirname, "../src/data/content.js");
const moviesModule = await import(moviesModulePath);
const movies = moviesModule.default;

if (!Array.isArray(movies) || movies.length === 0) {
  console.error("❌ src/data/content.js did not export an array.");
  process.exit(1);
}

// ---- Embed a single text ----
async function embed(text) {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim()
  });
  const v = res?.data?.[0]?.embedding;
  if (!Array.isArray(v)) {
    throw new Error(`No embedding returned for text starting with: ${text.slice(0, 40)}...`);
  }
  return v;
}

// ---- Ingest with retry ----
async function ingestOne(movie, retries = 3) {
  const embedding = await embed(movie.content);
  for (let attempt = 1; attempt <= retries; attempt++) {
    const { error } = await supabase
      .from("movies")
      .upsert(
        {
          title: movie.title,
          release_year: movie.releaseYear,
          content: movie.content,
          embedding
        },
        { onConflict: "title" }
      );
    if (!error) return;
    if (attempt === retries) throw error;
    const wait = 800 * attempt;
    console.warn(`   ⚠️  upsert failed (${error.message}); retrying in ${wait}ms...`);
    await new Promise((r) => setTimeout(r, wait));
  }
}

// ---- Main ----
async function main() {
  console.log(`\n🎬  PopChoice — Ingesting ${movies.length} movies into Supabase\n`);
  let ok = 0;
  for (let i = 0; i < movies.length; i++) {
    const m = movies[i];
    process.stdout.write(`  [${i + 1}/${movies.length}] ${m.title} ... `);
    try {
      await ingestOne(m);
      ok += 1;
      console.log("✓");
    } catch (err) {
      console.log("✗");
      console.error(`    ${err.message ?? err}`);
    }
  }
  console.log(`\n✅ Done. ${ok}/${movies.length} movies embedded.\n`);
  console.log("   Next step: npm run dev  →  http://localhost:5173\n");
}

main().catch((err) => {
  console.error("\n❌ Ingestion failed:", err.message ?? err);
  process.exit(1);
});
