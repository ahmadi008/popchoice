/**
 * LoadingState — full-card overlay shown while the AI pipeline runs.
 * Renders nothing if no `message` is provided so it's safe to leave mounted.
 */
function LoadingState({ message }) {
  if (!message) return null;

  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="loading__message">{message}</p>
    </div>
  );
}

export default LoadingState;