/**
 * Combine the three answers from the Questions View into a single
 * preference profile string. This single block of text is then
 * embedded and used for similarity search — treating all three
 * answers as one semantic whole rather than three independent queries.
 *
 * @param {object} answers
 * @param {string} answers.favoriteMovie - Free text: favorite movie + why.
 * @param {"new"|"classic"} answers.mood   - Era preference.
 * @param {"fun"|"serious"} answers.tone   - Tone preference.
 * @returns {string} A multi-sentence profile paragraph.
 */
export function buildPreferenceProfile({ favoriteMovie, mood, tone }) {
  const moodText = {
    new: "I am in the mood for something new and recent.",
    classic: "I am in the mood for something classic and timeless."
  };

  const toneText = {
    fun: "I want something fun and entertaining.",
    serious: "I want something serious and thought-provoking."
  };

  return [
    `My favorite movie is ${favoriteMovie.trim()}.`,
    moodText[mood] ?? "",
    toneText[tone] ?? ""
  ]
    .filter(Boolean)
    .join(" ");
}