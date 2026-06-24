import { supabase } from "../lib/config.js";

/**
 * Run semantic similarity search against the `movies` table.
 *
 * Calls the `match_movies` Postgres function defined in
 * `supabase/schema.sql`, which uses pgvector's `<=>` cosine-distance
 * operator under the hood and returns the closest movie(s).
 *
 * @param {number[]} queryEmbedding - 1536-dim vector for the user profile.
 * @param {number} [matchCount=1]   - How many top results to fetch.
 * @param {number} [matchThreshold=0] - Minimum similarity (0..1). 0 = no filter.
 * @returns {Promise<Array<{id,title,release_year,content,similarity}>>}
 */
export async function searchMovies(
  queryEmbedding,
  matchCount = 1,
  matchThreshold = 0
) {
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    throw new Error("searchMovies: queryEmbedding must be a non-empty array");
  }

  const { data, error } = await supabase.rpc("match_movies", {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount
  });

  if (error) {
    // Surface a useful message for the most common failure modes.
    if (error.message?.includes("function") && error.message?.includes("does not exist")) {
      throw new Error(
        "match_movies RPC not found. Did you run supabase/schema.sql? See README step 5."
      );
    }
    throw new Error(`Supabase search failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "No similar movies found. Have you run `npm run ingest` to populate the database?"
    );
  }

  return data;
}