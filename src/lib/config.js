import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

/* =========================================================
   OpenRouter Configuration
   ---------------------------------------------------------
   OpenRouter exposes an OpenAI-compatible API. We point the
   official `openai` SDK at it and reuse the same client for:
     1. Embeddings (text-embedding-3-small)
     2. Chat completions (openai/gpt-oss-120b:free)
   ========================================================= */

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error(
    "VITE_OPENROUTER_API_KEY is missing in .env — see README step 3."
  );
}

export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true
});

/* =========================================================
   Supabase Configuration
   ---------------------------------------------------------
   Used by the React app for vector similarity search via the
   `match_movies` RPC function defined in supabase/schema.sql.
   ========================================================= */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables are missing — see README step 4."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* =========================================================
   Model constants — referenced from utils/* and the
   ingestion script so they stay in one place.
   ========================================================= */
export const EMBEDDING_MODEL = "openai/text-embedding-3-small";
export const EMBEDDING_DIM = 1536;
export const CHAT_MODEL = "openai/gpt-oss-120b:free";