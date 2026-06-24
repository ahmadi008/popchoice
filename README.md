# 🍿 PopChoice — AI Movie Recommendation App

> An AI-powered movie advisor that recommends films based on **what you mean**, not what you type.
> Built with React + OpenRouter embeddings + Supabase pgvector + a free LLM.

This is the complete solution for **Week 11 – PopChoice**. Every line of code is here,
along with a step-by-step guide a complete beginner can follow from zero to a deployed app.
live demo link : https://popchoice-nu.vercel.app/

---

## ✨ What it does

1. User answers 3 quick questions about their movie taste.
2. The answers are combined and turned into a **vector embedding**.
3. That embedding is compared (via cosine similarity) against 9 pre-embedded movies stored in **Supabase pgvector**.
4. The closest matching movie is retrieved.
5. An LLM writes a **personalized explanation** for why this movie fits.
6. The result is shown on a clean recommendation screen.

That's a full **Retrieval-Augmented Generation (RAG)** workflow.

---

## 📋 Prerequisites

You need **only** two things on your computer:

1. **Node.js 18 or newer** — https://nodejs.org/
   - Download the LTS version, install with all defaults.
   - Verify in a terminal: `node --version` → should print `v18.x` or higher.
2. **A terminal** you are comfortable typing into.
   - macOS: Spotlight → "Terminal"
   - Windows: PowerShell or Windows Terminal
   - Linux: your usual terminal

You also need to create **two free accounts** (covered in steps below):

- **OpenRouter** — https://openrouter.ai/  (free credits for new accounts)
- **Supabase** — https://supabase.com/  (free tier, no credit card)

---

## 🚀 Step-by-step setup (follow in order)

### Step 1 — Get the code onto your computer

If you got this as a zip, extract it somewhere. Otherwise, in a terminal:

```bash
cd path/to/where/you/want/it
git clone <your-repo-url> popchoice
cd popchoice
```

You should now be inside a folder that contains `package.json`, `src/`, etc.

### Step 2 — Install dependencies

This downloads React, Vite, OpenAI SDK, Supabase SDK, etc.

```bash
npm install
```

It will print `added N packages` and finish in ~30 seconds. **Don't worry about the
"vulnerabilities" notice — they're from dev tooling, not your code.**

### Step 3 — Create an OpenRouter account & get an API key

1. Open https://openrouter.ai/ and click **Sign in** (top-right).
2. Sign in with Google or GitHub.
3. Once logged in, click your avatar → **Keys** (or go to https://openrouter.ai/keys).
4. Click **Create Key**.
5. Give it any name (e.g. `popchoice`) and click **Create**.
6. **Copy the key** — it starts with `sk-or-v1-...`. You won't see it again.
7. **Free credits** — OpenRouter gives new accounts a small amount of free credits,
   which is more than enough for this assignment. You don't need to add a card.

> ⚠️ Keep this key private. Anyone with it can spend your credits.

### Step 4 — Create a Supabase project & get your keys

1. Open https://supabase.com/ and click **Start your project** (sign up with GitHub if needed).
2. Click **New project**.
3. Fill in:
   - **Name**: `popchoice` (or anything)
   - **Database password**: pick a strong one and **save it somewhere** (you won't need it for this app, but Supabase requires it)
   - **Region**: pick the one closest to you
4. Click **Create new project**. Wait ~1 minute for it to provision.
5. Once ready, go to **Project Settings → API** (gear icon in the left sidebar).
6. Copy these three values — you'll need them in step 6:
   - **Project URL** → looks like `https://abcdefg.supabase.co`
   - **`anon` `public` key** → a long `eyJ...` JWT
   - **`service_role` `secret` key** → another long `eyJ...` JWT
     (click "Reveal" first, then copy)

> 🔐 The `service_role` key bypasses Row Level Security. **Never** put it in the
> React app or commit it to git. It is used **only** by the ingestion script.

### Step 5 — Run the database schema in Supabase

This creates the `movies` table, the `pgvector` extension, and the `match_movies` search function.

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file `supabase/schema.sql` from this project, **copy its entire contents**, and paste into the editor.
4. Click **Run** (or press `Ctrl/Cmd + Enter`).
5. You should see `Success. No rows returned`. That's the good outcome.
6. Verify it worked: open a new query and run
   ```sql
   select count(*) from public.movies;
   ```
   It should return `0`. (It'll go up to 9 after step 7.)

### Step 6 — Create your `.env` file

In the project folder:

```bash
cp .env.example .env
```

Now open `.env` in any text editor and fill in your real values:

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx
VITE_SUPABASE_URL=https://abcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

| Key | Where you got it | Used by |
|---|---|---|
| `VITE_OPENROUTER_API_KEY` | OpenRouter → Keys (Step 3) | Browser app + ingestion script |
| `VITE_SUPABASE_URL` | Supabase → Settings → API (Step 4) | Browser app + ingestion script |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API (Step 4) | Browser app only |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (Step 4) | **Ingestion script only** |

Save the file.

### Step 7 — Embed all movies into Supabase (one-time)

This sends each of the 9 movies to OpenRouter, gets back its embedding vector, and
saves it into your Supabase table.

```bash
npm run ingest
```

You should see something like:

```
🎬  PopChoice — Ingesting 9 movies into Supabase

  [1/9] Avatar: The Way of the Water ... ✓
  [2/9] The Fabelmans ... ✓
  ...
  [9/9] RRR ... ✓

✅ Done. 9/9 movies embedded.
```

> If a row says `⚠️ upsert failed … retrying`, just wait — the script retries automatically.
> If it still fails after 3 retries, check that your `SUPABASE_SERVICE_ROLE_KEY` is correct.

Verify it worked in Supabase: SQL Editor → `select count(*) from public.movies;` should now return `9`.

### Step 8 — Run the app

```bash
npm run dev
```

This opens http://localhost:5173/ in your browser.

You should see the **PopChoice** form. Answer the three questions, click
**Recommend a Movie**, and watch the AI pipeline run:

1. *Reading your taste…*
2. *Understanding your preferences…*
3. *Searching the movie library…*
4. *Writing your personal recommendation…*

…and then the recommendation screen appears with the chosen movie and explanation.

Click **Go Again** to start over.

---

## 🌐 Deploying to the web (optional but recommended for grading)

### Option A — Vercel (easiest, ~2 minutes)

1. Push the project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "PopChoice initial commit"
   # create a new empty repo on github.com, then:
   git remote add origin https://github.com/<you>/<repo>.git
   git branch -M main
   git push -u origin main
   ```
2. Go to https://vercel.com → **Add New Project** → import your repo.
3. In **Environment Variables**, add the four keys from your `.env`.
4. Click **Deploy**. Done — Vercel gives you a public URL like
   `https://popchoice.vercel.app`.

### Option B — Cloudflare Pages (recommended for security)

Same as Vercel, but use https://pages.cloudflare.com/ instead. Both are free.
The assignment specifically calls out Cloudflare for API key security — Cloudflare
Pages lets you set env vars **per environment** without exposing them at build time.

### Option C — Netlify

Same pattern: https://app.netlify.com/ → **Add new site** → import from Git → add env vars → deploy.

---

## 🧠 How the AI pipeline works (the interesting bit)

```
┌──────────────────┐
│ User answers 3   │
│ questions        │
└────────┬─────────┘
         │  buildPreferenceProfile()
         ▼
┌──────────────────┐
│ "My favorite is  │
│  Spider-Man… I   │  ← single block of text
│  want something  │
│  new and fun."   │
└────────┬─────────┘
         │  OpenAI embeddings API
         │  model: openai/text-embedding-3-small
         ▼
┌──────────────────┐
│  [0.013, -0.027, │   ← 1536-dim vector
│   0.041, ... ]   │
└────────┬─────────┘
         │  Supabase RPC: match_movies(embedding)
         │  pgvector cosine distance
         ▼
┌──────────────────┐
│ Best matching    │
│ movie from DB    │
└────────┬─────────┘
         │  OpenAI chat completions
         │  model: openai/gpt-oss-120b:free
         ▼
┌──────────────────┐
│ "We recommend X  │
│  because…"       │
└──────────────────┘
```

The same embedding model is used for **both** the movie content and the user profile,
so the similarity score is meaningful — we're comparing apples to apples.

---

## 📁 Project structure

```
popchoice/
├── README.md                  ← you are here
├── .env.example               ← copy to .env and fill in
├── .gitignore
├── package.json
├── vite.config.js
├── index.html
│
├── supabase/
│   └── schema.sql             ← paste into Supabase SQL editor (Step 5)
│
├── scripts/
│   └── ingest.js              ← run with `npm run ingest` (Step 7)
│
└── src/
    ├── main.jsx               ← React entry point
    ├── App.jsx                ← orchestrates the two views + pipeline
    ├── index.css              ← all styling
    │
    ├── lib/
    │   └── config.js          ← OpenRouter + Supabase clients
    │
    ├── data/
    │   └── content.js         ← the 9-movie dataset
    │
    ├── components/
    │   ├── QuestionsView.jsx  ← screen 1: form
    │   ├── ResultView.jsx     ← screen 2: recommendation
    │   └── LoadingState.jsx   ← overlay shown during AI work
    │
    └── utils/
        ├── buildPreferenceProfile.js  ← combines 3 answers into 1 string
        ├── createEmbedding.js         ← text → vector (OpenRouter)
        ├── searchMovies.js            ← vector → best movie (Supabase)
        └── generateExplanation.js     ← LLM writes the explanation
```

---

## 🧪 Troubleshooting

| Problem | Fix |
|---|---|
| `VITE_OPENROUTER_API_KEY is missing` | You forgot step 6 — create `.env` and restart `npm run dev` |
| `match_movies RPC not found` | You skipped step 5 — re-run `supabase/schema.sql` in Supabase |
| `No similar movies found` | You skipped step 7 — run `npm run ingest` |
| `401 Unauthorized` from OpenRouter | API key is wrong or revoked; re-copy from https://openrouter.ai/keys |
| `401` from Supabase | URL or anon key is wrong; re-copy from Project Settings → API |
| Build is huge / slow first load | Normal — the OpenAI SDK is bundled. ~130 kB gzipped, fine for an assignment. |
| `npm install` warnings | Ignore them. The app still builds and runs. |
| Port 5173 already in use | `npm run dev -- --port 3000` |

---

## 📝 Reflection (for your assignment write-up)

Drop these points into your submission's reflection section:

**What I built**
A React + Vite app that implements a full Retrieval-Augmented Generation (RAG) pipeline:
the user answers three preference questions, the answers are combined into a single
profile string and embedded with OpenRouter's `text-embedding-3-small`, the resulting
vector is searched against nine pre-embedded movie descriptions stored in Supabase
pgvector via a `match_movies` RPC, and OpenRouter's free `openai/gpt-oss-120b:free`
LLM produces a personalized explanation referencing the user's stated preferences.

**Challenges & solutions**
- *Initial setup was intimidating* — I had never used Supabase, pgvector, or OpenRouter
  before. Reading the docs and breaking the work into numbered steps (account → keys →
  schema → ingest → run) made it tractable.
- *The dataset needs to be embedded once and reused many times.* Rather than embedding
  inside the React app on every load (slow + expensive), I wrote a Node CLI
  (`scripts/ingest.js`) that uses the Supabase *service role* key to upsert embeddings
  into the database. The browser app only ever reads.
- *Error handling for AI services.* API calls can fail for many reasons — bad keys,
  rate limits, network. I wrapped each step in `try/catch` and surface a friendly error
  in the UI rather than letting the app crash silently.

**Key learnings**
- RAG is just three steps in a loop: **embed → retrieve → generate**. Once that pattern
  clicks, the same architecture applies to support chatbots, document search,
  tutoring, and basically every "AI over your own data" product.
- *Vector search is search by meaning.* Two strings don't need to share any words to
  be similar — `text-embedding-3-small` knows that "exciting superhero adventure" and
  "action-packed comic book movie" point to the same concept.
- The same embedding model MUST be used for both ingestion and query, otherwise the
  similarity scores are meaningless.

---

## 🚦 Stretch goals (optional, after the core works)

The assignment suggests several extensions. Easy ones to add on top of this code:

- **Movie posters** — fetch from the free OMDb API by title after search.
- **Next recommendation** — change `match_count` to 5 in `searchMovies`, keep state
  of how many you've shown, advance on each "Go Again".
- **Chunking experiment** — split long descriptions into 200-char chunks, embed each,
  and let the search return chunks instead of whole movies.

---

## 📜 License

MIT — do whatever you want with this code.
