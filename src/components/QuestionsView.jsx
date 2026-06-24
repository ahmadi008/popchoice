/**
 * QuestionsView — the first screen.
 *
 * Collects three pieces of information:
 *   1. Favorite movie + why (free text)
 *   2. New or Classic (era)
 *   3. Fun or Serious (tone)
 *
 * All inputs are controlled. The submit button shows a loading label
 * while the AI pipeline runs (App.jsx flips `loading`).
 */
function QuestionsView({
  favoriteMovie,
  setFavoriteMovie,
  mood,
  setMood,
  tone,
  setTone,
  loading,
  onSubmit
}) {
  return (
    <section className="card" aria-labelledby="questions-heading">
      <h2 id="questions-heading" className="card__title">
        Tell us about your movie taste
      </h2>
      <p className="card__subtitle">
        We'll use your answers to find a movie that truly matches you.
      </p>

      <form onSubmit={onSubmit} className="form" noValidate>
        <div className="field">
          <label htmlFor="favoriteMovie" className="field__label">
            What is your favorite movie and why?
          </label>
          <textarea
            id="favoriteMovie"
            className="field__input field__input--textarea"
            rows={4}
            value={favoriteMovie}
            onChange={(e) => setFavoriteMovie(e.target.value)}
            placeholder="e.g. Spider-Man: No Way Home — I love exciting superhero stories with great action."
            disabled={loading}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="mood" className="field__label">
            New or Classic?
          </label>
          <select
            id="mood"
            className="field__input"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            disabled={loading}
            required
          >
            <option value="" disabled>Select one…</option>
            <option value="new">New — something recent</option>
            <option value="classic">Classic — something timeless</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="tone" className="field__label">
            Fun or Serious?
          </label>
          <select
            id="tone"
            className="field__input"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={loading}
            required
          >
            <option value="" disabled>Select one…</option>
            <option value="fun">Fun — light & entertaining</option>
            <option value="serious">Serious — thoughtful & dramatic</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="btn__spinner" aria-hidden="true" />
              Finding your perfect movie…
            </>
          ) : (
            <>🎬 Recommend a Movie</>
          )}
        </button>
      </form>
    </section>
  );
}

export default QuestionsView;