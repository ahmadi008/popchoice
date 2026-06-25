import { useState } from "react";
import QuestionsView from "./components/QuestionsView.jsx";
import ResultView from "./components/ResultView.jsx";
import LoadingState from "./components/LoadingState.jsx";
import { createEmbedding } from "./utils/createEmbedding.js";
import { searchMovies } from "./utils/searchMovies.js";
import { generateExplanation } from "./utils/generateExplanation.js";
import { buildPreferenceProfile } from "./utils/buildPreferenceProfile.js";

/**
 * PopChoice root component.
 *
 * Two views, switched by `view` state:
 *   - "questions"  → QuestionsView  (collects preferences)
 *   - "result"     → ResultView     (shows recommended movie + explanation)
 *
 * The RAG pipeline runs in handleSubmit:
 *   1. Combine answers into a single profile string.
 *   2. Embed that profile (OpenRouter, text-embedding-3-small).
 *   3. Search Supabase pgvector (match_movies RPC).
 *   4. Ask the LLM (gpt-oss-120b:free) to explain the match.
 *   5. Hand the result to ResultView.
 */
function App() {
  // View toggle
  const [view, setView] = useState("questions");

  // Form state (controlled inputs)
  const [favoriteMovie, setFavoriteMovie] = useState("");
  const [mood, setMood] = useState("");
  const [tone, setTone] = useState("");

  // Pipeline state
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  // Result
  const [recommendation, setRecommendation] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // ---- Basic validation ----
    if (!favoriteMovie.trim() || !mood || !tone) {
      setError("Please answer all three questions before recommending.");
      return;
    }

    setLoading(true);
    try {
      // Step 1 — build preference profile
      setStatusMessage("Reading your taste…");
      const profile = buildPreferenceProfile({ favoriteMovie, mood, tone });

      // Step 2 — embed
      setStatusMessage("Understanding your preferences…");
      const embedding = await createEmbedding(profile);

      // Step 3 — vector search
      setStatusMessage("Searching the movie library…");
      const matches = await searchMovies(embedding, 1);
      const best = matches[0];

      // Step 4 — generate explanation
      setStatusMessage("Writing your personal recommendation…");
      const explanation = await generateExplanation({
        userProfile: profile,
        movieTitle: best.title,
        movieYear: best.release_year,
        movieDescription: best.content
      });

      // Step 5 — show
      setRecommendation({
  title: best.title,
  releaseYear: best.release_year,
  content: best.content,
  explanation,
  posterUrl: best.poster_url
});
      setView("result");
    } catch (err) {
      console.error(err);
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  }

  function handleGoAgain() {
    setRecommendation(null);
    setFavoriteMovie("");
    setMood("");
    setTone("");
    setError("");
    setView("questions");
  }

  return (
    <main className="app">
      <header className="app__header">
        <div className="brand">
          <span className="brand__logo" aria-hidden="true">🍿</span>
          <h1 className="brand__name">PopChoice</h1>
        </div>
        <p className="brand__tagline">
          Your personal AI movie advisor
        </p>
      </header>

      {error && (
        <div className="alert alert--error" role="alert">
          <strong>Heads up:</strong> {error}
        </div>
      )}

      {view === "questions" && (
        <QuestionsView
          favoriteMovie={favoriteMovie}
          setFavoriteMovie={setFavoriteMovie}
          mood={mood}
          setMood={setMood}
          tone={tone}
          setTone={setTone}
          loading={loading}
          onSubmit={handleSubmit}
        />
      )}

      {view === "result" && recommendation && (
        <ResultView
          recommendation={recommendation}
          onGoAgain={handleGoAgain}
        />
      )}

      {loading && <LoadingState message={statusMessage} />}

      <footer className="app__footer">
        <small>
          Powered by embeddings · pgvector ·{" "}
          <span className="accent">gpt-oss-120b</span>
        </small>
      </footer>
    </main>
  );
}

export default App;