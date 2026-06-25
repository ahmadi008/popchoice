function ResultView({ recommendation, onGoAgain }) {
  const { title, releaseYear, content, explanation, posterUrl } = recommendation;

  return (
    <section className="card result">
      {posterUrl && (
        <div className="result__poster-wrap">
          <img
            className="result__poster"
            src={posterUrl}
            alt={`${title} poster`}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      )}
      <span className="result__eyebrow">We recommend</span>
      <h2 className="result__title">{title}</h2>
      {releaseYear && <span className="result__year">{releaseYear}</span>}

      <div className="result__divider" />

      <p className="result__description">{content}</p>

      <blockquote className="result__quote">
        <p>{explanation}</p>
      </blockquote>

      <button type="button" className="btn btn--secondary" onClick={onGoAgain}>
        ↻ Go Again
      </button>
    </section>
  );
}

export default ResultView;