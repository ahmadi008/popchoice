/**
 * ResultView — shows the recommended movie and AI explanation.
 *
 * Displays: title, release year, description, explanation, and a
 * "Go Again" button that resets the app back to the Questions View.
 */
function ResultView({ recommendation, onGoAgain }) {
  const { title, releaseYear, content, explanation } = recommendation;

  return (
    <section className="card result" aria-labelledby="result-heading">
      <span className="result__eyebrow">We recommend</span>
      <h2 id="result-heading" className="result__title">{title}</h2>
      {releaseYear && (
        <span className="result__year">{releaseYear}</span>
      )}

      <div className="result__divider" />

      <p className="result__description">{content}</p>

      <blockquote className="result__quote">
        <span className="result__quote-icon" aria-hidden="true">“</span>
        <p>{explanation}</p>
      </blockquote>

      <button
        type="button"
        className="btn btn--secondary"
        onClick={onGoAgain}
      >
        ↻ Go Again
      </button>
    </section>
  );
}

export default ResultView;